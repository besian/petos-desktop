import type { DB } from '../db/types';
import type { CopilotResultRow } from '../ui/store';
import { todayISO, addDays, mondayIndex } from '../db/dates';

const DAILY_CAPACITY = 8;

function clientName(db: DB, clientId: string): string {
  return db.clients.find((c) => c.id === clientId)?.name || 'Unknown client';
}

function petColor(db: DB, petId: string): string {
  return db.pets.find((p) => p.id === petId)?.color || '#6E7A77';
}

export interface CopilotAnswer {
  text: string;
  rows: CopilotResultRow[] | null;
}

export function answerCopilot(db: DB, question: string): CopilotAnswer {
  const q = question.toLowerCase();

  if (q.includes('paid') || q.includes('owe') || q.includes('unpaid') || q.includes('outstanding')) {
    const due = db.invoices.filter((i) => i.status === 'outstanding' || i.status === 'overdue');
    if (due.length === 0) return { text: 'Everything is paid up — no outstanding invoices right now.', rows: null };
    const overdue = due.filter((i) => i.status === 'overdue');
    const rows: CopilotResultRow[] = due.slice(0, 5).map((i) => {
      const amt = i.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
      const name = clientName(db, i.clientId);
      return { color: petColor(db, i.petId), initial: name[0], name, sub: `£${amt.toFixed(2)} · ${i.status === 'overdue' ? 'overdue' : 'due ' + i.due}` };
    });
    const text = overdue.length > 0
      ? `${due.length} invoice${due.length === 1 ? ' is' : 's are'} outstanding and ${overdue.length} ${overdue.length === 1 ? 'is' : 'are'} overdue. Want me to send reminders?`
      : `${due.length} invoice${due.length === 1 ? ' is' : 's are'} outstanding, none overdue yet.`;
    return { text, rows };
  }

  if (q.includes('medic') || q.includes('health') || q.includes('care')) {
    const flagged = db.pets.filter((p) => p.alert || p.notes);
    if (flagged.length === 0) return { text: 'No dogs currently have medical or care instructions on file.', rows: null };
    const rows: CopilotResultRow[] = flagged.map((p) => ({ color: p.color, initial: p.name[0], name: p.name, sub: p.notes || p.alert || '' }));
    return { text: `${flagged.length} dog${flagged.length === 1 ? '' : 's'} have care instructions on file:`, rows };
  }

  if (q.includes('space') || q.includes('slot') || q.includes('thursday') || q.includes('capacity')) {
    let d = todayISO();
    for (let i = 0; i < 8; i++) { if (mondayIndex(d) === 3) break; d = addDays(d, 1); } // walk forward to the next Thursday
    const booked = db.walks.filter((w) => w.date === d && w.status !== 'cancelled').length;
    const open = Math.max(0, DAILY_CAPACITY - booked);
    if (open === 0) return { text: `Thursday (${d}) is fully booked — ${booked} walks scheduled.`, rows: null };
    return { text: `Thursday has ${open} open slot${open === 1 ? '' : 's'} out of ${DAILY_CAPACITY} (${booked} already booked).`, rows: null };
  }

  const today = todayISO();
  const todaysWalks = db.walks.filter((w) => w.date === today && w.status !== 'cancelled');
  const done = todaysWalks.filter((w) => w.status === 'done').length;
  const pendingReports = db.reports.filter((r) => r.status === 'pending').length;
  const overdueCount = db.invoices.filter((i) => i.status === 'overdue').length;
  const parts = [`${done} of ${todaysWalks.length} walks done today`];
  if (pendingReports) parts.push(`${pendingReports} report${pendingReports === 1 ? '' : 's'} awaiting approval`);
  if (overdueCount) parts.push(`${overdueCount} invoice${overdueCount === 1 ? '' : 's'} overdue`);
  return { text: parts.join(' · ') + '. Ask me about payments, medication, or open slots for specifics.', rows: null };
}
