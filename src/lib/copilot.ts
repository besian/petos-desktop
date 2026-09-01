import type { DB } from '../db/types';
import type { CopilotResultRow } from '../ui/store';
import { todayISO, addDays } from '../db/dates';
import { ACTION_KINDS, type ProposedAction } from './copilotActions';

export interface CopilotAnswer {
  text: string;
  rows: CopilotResultRow[] | null;
  action: ProposedAction | null;
}

function amountOf(items: { amount: string }[]) {
  return items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
}

// A compact, human-readable digest of the business's current data — sent
// to the Copilot API route as grounding context. Trimmed to what a
// dog-walking-business Q&A would plausibly need, rather than the raw DB
// (keeps the request small and avoids exposing internal ids/fields).
function buildSnapshot(db: DB) {
  const today = todayISO();
  const weekEnd = addDays(today, 6);
  const clientById = new Map(db.clients.map((c) => [c.id, c]));
  const petById = new Map(db.pets.map((p) => [p.id, p]));
  const teamById = new Map(db.team.map((t) => [t.id, t]));

  return {
    today,
    clients: db.clients.map((c) => ({ name: c.name })),
    pets: db.pets.map((p) => ({
      name: p.name, breed: p.breed, owner: clientById.get(p.clientId)?.name || 'Unknown', color: p.color,
      alert: p.alert || undefined, notes: p.notes || undefined,
    })),
    team: db.team.map((t) => ({ name: t.name, role: t.role, status: t.status })),
    walksToday: db.walks.filter((w) => w.date === today && w.status !== 'cancelled').map((w) => ({
      time: w.time, pet: petById.get(w.petId)?.name || 'Unknown', walker: teamById.get(w.walkerId)?.name || 'Unassigned', status: w.status, route: w.route,
    })),
    walksThisWeek: db.walks.filter((w) => w.date >= today && w.date <= weekEnd && w.status !== 'cancelled').map((w) => ({
      date: w.date, time: w.time, pet: petById.get(w.petId)?.name || 'Unknown', walker: teamById.get(w.walkerId)?.name || 'Unassigned',
    })),
    invoicesOutstanding: db.invoices.filter((i) => i.status === 'outstanding' || i.status === 'overdue').map((i) => ({
      client: clientById.get(i.clientId)?.name || 'Unknown', pet: petById.get(i.petId)?.name || 'Unknown',
      amount: amountOf(i.items), status: i.status, due: i.due,
    })),
    reportsPendingApproval: db.reports.filter((r) => r.status === 'pending').length,
  };
}

export async function askCopilot(db: DB, question: string): Promise<CopilotAnswer> {
  const res = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, snapshot: buildSnapshot(db) }),
  });
  if (!res.ok) {
    throw new Error(`Copilot request failed (${res.status})`);
  }
  const data = await res.json();
  // The model's "kind" isn't hard-enforced by the response schema (structured
  // outputs describe the literal rather than constraining it), so validate
  // it against the known action kinds before trusting it client-side.
  const action: ProposedAction | null = data.action && ACTION_KINDS.includes(data.action.kind) ? data.action : null;
  return { text: data.text, rows: data.rows ?? null, action };
}
