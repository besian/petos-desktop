// Turns a Copilot-proposed action (see api/copilot.ts) into a concrete,
// executable database write. The model only ever proposes by *name*
// ("book Milo with Molos") — resolution against real ids happens here,
// against the live db, right before the owner taps Confirm, so a stale or
// ambiguous reference fails safely instead of writing the wrong thing.
import type { DB, InvoiceItem } from '../db/types';
import type { useDB } from '../db/store';
import { todayISO } from '../db/dates';

export type ProposedAction =
  | { kind: 'add_walk'; summary: string; petName: string; walkerName: string | null; date: string; time: string; durationMin: 30 | 45 | 60; repeatWeekly: boolean }
  | { kind: 'cancel_walk'; summary: string; petName: string; date: string; time: string | null }
  | { kind: 'reschedule_walk'; summary: string; petName: string; fromDate: string; fromTime: string | null; toDate: string; toTime: string | null }
  | { kind: 'add_invoice'; summary: string; clientName: string; petName: string | null; description: string; amount: number; dueInDays: number; sendNow: boolean }
  | { kind: 'mark_invoice_paid'; summary: string; clientName: string; amount: number | null }
  | { kind: 'add_client'; summary: string; name: string; email: string | null; phone: string | null; address: string | null }
  | { kind: 'add_pet'; summary: string; name: string; breed: string | null; clientName: string; plan: 'Weekly' | 'Fortnightly' | 'Monthly' }
  | { kind: 'add_team_member'; summary: string; name: string; role: string | null; area: string | null; phone: string | null; email: string | null };

export const ACTION_KINDS: ProposedAction['kind'][] = [
  'add_walk', 'cancel_walk', 'reschedule_walk', 'add_invoice', 'mark_invoice_paid', 'add_client', 'add_pet', 'add_team_member',
];

export type Resolution = { ok: true; execute: () => Promise<string> } | { ok: false; error: string };

function matchOne<T extends { name: string }>(items: T[], name: string, label: string): { ok: true; item: T } | { ok: false; error: string } {
  const lower = name.trim().toLowerCase();
  let matches = items.filter((i) => i.name.toLowerCase() === lower);
  if (matches.length === 0) matches = items.filter((i) => i.name.toLowerCase().includes(lower));
  if (matches.length === 1) return { ok: true, item: matches[0] };
  if (matches.length === 0) return { ok: false, error: `I couldn't find a ${label} named "${name}" — check the spelling and try again.` };
  return { ok: false, error: `More than one ${label} matches "${name}" (${matches.map((m) => m.name).join(', ')}) — please be more specific.` };
}

function rateFor(settings: DB['settings'], durationMin: 30 | 45 | 60) {
  return { 30: settings.rateSolo30, 45: Math.round((settings.rateSolo30 + settings.rateSolo60) / 2), 60: settings.rateSolo60 }[durationMin];
}

function amountOf(items: { amount: string }[]) {
  return items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
}

const money = (n: number) => `£${n.toFixed(2)}`;

export function resolveAction(action: ProposedAction, ctx: ReturnType<typeof useDB>): Resolution {
  const { db } = ctx;

  switch (action.kind) {
    case 'add_walk': {
      const petR = matchOne(db.pets, action.petName, 'pet');
      if (!petR.ok) return petR;
      let walkerId = '';
      if (action.walkerName) {
        const walkerR = matchOne(db.team, action.walkerName, 'team member');
        if (!walkerR.ok) return walkerR;
        walkerId = walkerR.item.id;
      }
      const price = rateFor(db.settings, action.durationMin);
      const clash = db.walks.some((w) => w.date === action.date && w.time === action.time && w.status !== 'cancelled');
      return {
        ok: true,
        execute: async () => {
          await ctx.addWalk({ petId: petR.item.id, walkerId, date: action.date, time: action.time, durationMin: action.durationMin, price, route: `${petR.item.name}'s usual route`, repeatWeekly: action.repeatWeekly });
          return `Booked ${petR.item.name} for ${action.date} at ${action.time}.${clash ? ' Note: another walk was already booked at that time.' : ''}`;
        },
      };
    }

    case 'cancel_walk': {
      const petR = matchOne(db.pets, action.petName, 'pet');
      if (!petR.ok) return petR;
      const candidates = db.walks.filter((w) => w.petId === petR.item.id && w.date === action.date && w.status !== 'cancelled' && (!action.time || w.time === action.time));
      if (candidates.length === 0) return { ok: false, error: `I couldn't find a scheduled walk for ${petR.item.name} on ${action.date}${action.time ? ' at ' + action.time : ''}.` };
      if (candidates.length > 1) return { ok: false, error: `${petR.item.name} has more than one walk on ${action.date} — please include the time.` };
      const walk = candidates[0];
      return { ok: true, execute: async () => { ctx.cancelWalk(walk.id); return `Cancelled ${petR.item.name}'s walk on ${action.date} at ${walk.time}.`; } };
    }

    case 'reschedule_walk': {
      const petR = matchOne(db.pets, action.petName, 'pet');
      if (!petR.ok) return petR;
      const candidates = db.walks.filter((w) => w.petId === petR.item.id && w.date === action.fromDate && w.status !== 'cancelled' && (!action.fromTime || w.time === action.fromTime));
      if (candidates.length === 0) return { ok: false, error: `I couldn't find a scheduled walk for ${petR.item.name} on ${action.fromDate}${action.fromTime ? ' at ' + action.fromTime : ''}.` };
      if (candidates.length > 1) return { ok: false, error: `${petR.item.name} has more than one walk on ${action.fromDate} — please include the time.` };
      const walk = candidates[0];
      const toTime = action.toTime || walk.time;
      const clash = db.walks.some((w) => w.id !== walk.id && w.date === action.toDate && w.time === toTime && w.status !== 'cancelled');
      return { ok: true, execute: async () => { ctx.updateWalk(walk.id, { date: action.toDate, time: toTime }); return `Moved ${petR.item.name}'s walk to ${action.toDate} at ${toTime}.${clash ? ' Note: another walk is already booked at that time.' : ''}`; } };
    }

    case 'add_invoice': {
      const clientR = matchOne(db.clients, action.clientName, 'client');
      if (!clientR.ok) return clientR;
      const clientPets = db.pets.filter((p) => p.clientId === clientR.item.id);
      let pet = clientPets[0];
      if (action.petName) {
        const petR = matchOne(clientPets, action.petName, 'pet');
        if (!petR.ok) return petR;
        pet = petR.item;
      }
      if (!pet) return { ok: false, error: `${clientR.item.name} doesn't have a pet on file yet — add one first.` };
      if (!(action.amount > 0)) return { ok: false, error: 'The invoice amount needs to be greater than £0.' };
      const items: InvoiceItem[] = [{ desc: action.description || 'Dog walking', sub: pet.name, date: todayISO(), qty: '1', rate: money(action.amount), amount: money(action.amount) }];
      return {
        ok: true,
        execute: async () => {
          const created = await ctx.addInvoice({ clientId: clientR.item.id, petId: pet.id, items, dueInDays: action.dueInDays || 14 });
          if (action.sendNow) ctx.sendInvoice(created.id);
          return `Created invoice ${created.id} for ${clientR.item.name} — ${money(action.amount)}${action.sendNow ? ', marked as sent' : ' (draft)'}.`;
        },
      };
    }

    case 'mark_invoice_paid': {
      const clientR = matchOne(db.clients, action.clientName, 'client');
      if (!clientR.ok) return clientR;
      let candidates = db.invoices.filter((i) => i.clientId === clientR.item.id && (i.status === 'outstanding' || i.status === 'overdue'));
      if (action.amount != null) {
        const narrowed = candidates.filter((i) => Math.abs(amountOf(i.items) - action.amount!) < 0.01);
        if (narrowed.length) candidates = narrowed;
      }
      if (candidates.length === 0) return { ok: false, error: `${clientR.item.name} has no outstanding or overdue invoices.` };
      if (candidates.length > 1) return { ok: false, error: `${clientR.item.name} has ${candidates.length} unpaid invoices — mention the amount to pick one.` };
      const inv = candidates[0];
      return { ok: true, execute: async () => { ctx.markInvoicePaid(inv.id); return `Marked ${inv.id} (${clientR.item.name}) as paid.`; } };
    }

    case 'add_client': {
      if (!action.name.trim()) return { ok: false, error: 'A client needs a name.' };
      return {
        ok: true,
        execute: async () => {
          const created = await ctx.addClient({
            name: action.name.trim(),
            addressLine1: action.address?.trim() || 'Address not set',
            addressLine2: '',
            email: action.email?.trim() || 'no-email@example.com',
            phone: action.phone?.trim() || undefined,
            memberSince: new Date().getFullYear().toString(),
          });
          return `Added client ${created.name}.`;
        },
      };
    }

    case 'add_pet': {
      const clientR = matchOne(db.clients, action.clientName, 'client');
      if (!clientR.ok) return clientR;
      if (!action.name.trim()) return { ok: false, error: 'A pet needs a name.' };
      const colors = ['#C98A3E', '#8C5A3A', '#6E6A8C', '#4A6C8C', '#8C7A4A', '#5C6E7C', '#A66C8C', '#3E7A5E', '#7A3E4A'];
      const color = colors[db.pets.length % colors.length];
      return {
        ok: true,
        execute: async () => {
          const created = await ctx.addPet({ name: action.name.trim(), breed: action.breed?.trim() || 'Mixed breed', clientId: clientR.item.id, plan: action.plan || 'Weekly', color });
          return `Added ${created.name} under ${clientR.item.name}.`;
        },
      };
    }

    case 'add_team_member': {
      if (!action.name.trim()) return { ok: false, error: 'A team member needs a name.' };
      const colors = ['#127A63', '#4A6C8C', '#A66C8C', '#8C7A4A', '#5C6E7C', '#7A3E4A'];
      const color = colors[db.team.length % colors.length];
      const role = action.role?.trim() || 'Walker';
      return {
        ok: true,
        execute: async () => {
          const created = await ctx.addTeamMember({
            name: action.name.trim(), role, area: action.area?.trim() || 'Not set', color,
            phone: action.phone?.trim() || 'Not set', email: action.email?.trim() || 'Not set',
            joined: `${role} · ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
            bio: '', skills: [], status: 'Available',
          });
          return `Added ${created.name} to the team.`;
        },
      };
    }

    default:
      return { ok: false, error: "I don't know how to do that yet." };
  }
}
