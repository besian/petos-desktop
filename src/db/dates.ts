// Small date-arithmetic helpers, all working in local-date ISO strings
// (yyyy-mm-dd) so the schedule/seed data can be generated relative to
// "today" instead of a baked-in calendar date.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return toISO(dt);
}

// Monday-based start of the week containing `iso`.
export function startOfWeek(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  return toISO(dt);
}

const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dow(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return DOW_SHORT[new Date(y, m - 1, d).getDay()];
}

export function dayNum(iso: string): number {
  return Number(iso.split('-')[2]);
}

export function formatLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DOW_SHORT[dt.getDay()]}, ${d} ${MONTH_SHORT[m - 1]}`;
}

export function formatShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

export function relativeDay(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDays(today, -1)) return 'Yesterday';
  if (iso === addDays(today, 1)) return 'Tomorrow';
  const [, m, d] = iso.split('-').map(Number);
  return `${dow(iso)} ${d} ${MONTH_SHORT[m - 1]}`;
}

// Monday=0 .. Sunday=6, for indexing into a week that starts on Monday.
export function mondayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function compareTime(a: string, b: string): number {
  return a.localeCompare(b);
}

export function nowTimeHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
