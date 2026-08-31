import type { DB, Pet, Client, TeamMember, Walk, Invoice, Report, Rec, Note, Settings } from './types';
import { todayISO, addDays, startOfWeek, mondayIndex } from './dates';

const clients: Client[] = [
  { id: 'priya-shah', name: 'Priya Shah', addressLine1: '3 Cheyne Row', addressLine2: 'London SW3 5HL', email: 'priya.shah@outlook.com', memberSince: '2024', createdAt: todayISO() },
  { id: 'julian-ashcroft', name: 'Julian Ashcroft', addressLine1: '11 Cadogan Gardens', addressLine2: 'London SW3 2RJ', email: 'j.ashcroft@me.com', memberSince: '2023', createdAt: todayISO() },
  { id: 'camila-duarte', name: 'Camila Duarte', addressLine1: '17 Victoria Road', addressLine2: 'London W8 5RD', email: 'camila.duarte@gmail.com', memberSince: '2024', createdAt: todayISO() },
  { id: 'henry-whitfield', name: 'Henry Whitfield', addressLine1: '24 Hyde Park Gate', addressLine2: 'London SW7 5DG', email: 'h.whitfield@gmail.com', memberSince: '2024', keySafe: 'Revealed at appointment', emergencyContact: 'Rosa (housekeeper) · 07700 900612', vet: 'Elizabeth St. Veterinary', createdAt: todayISO() },
  { id: 'eleanor-voss', name: 'Eleanor Voss', addressLine1: '9 Cadogan Gardens', addressLine2: 'London SW3 2RD', email: 'eleanor.voss@icloud.com', memberSince: '2025', createdAt: todayISO() },
  { id: 'james-okafor', name: 'James Okafor', addressLine1: '82 Elystan Street', addressLine2: 'London SW3 3NT', email: 'james.okafor@gmail.com', memberSince: '2025', createdAt: todayISO() },
  { id: 'sophie-laurent', name: 'Sophie Laurent', addressLine1: 'Knightsbridge', addressLine2: 'London SW1X', email: 's.laurent@gmail.com', memberSince: '2026', createdAt: todayISO() },
];

const pets: Pet[] = [
  { id: 'bella', name: 'Bella', breed: 'Golden Retriever', clientId: 'priya-shah', plan: 'Weekly', color: '#C98A3E', ageYears: 4, createdAt: todayISO() },
  { id: 'oscar', name: 'Oscar', breed: 'Miniature Dachshund', clientId: 'julian-ashcroft', plan: 'Weekly', alert: 'Back care', color: '#8C5A3A', ageYears: 6, notes: 'Flat routes only — no stairs or jumping.', createdAt: todayISO() },
  { id: 'milo', name: 'Milo', breed: 'Cockapoo', clientId: 'camila-duarte', plan: 'Weekly', color: '#6E6A8C', ageYears: 3, createdAt: todayISO() },
  { id: 'luna', name: 'Luna', breed: 'Labrador', clientId: 'henry-whitfield', plan: 'Weekly', alert: 'Supplement', color: '#4A6C8C', ageYears: 5, notes: 'Joint supplement (daily).', createdAt: todayISO() },
  { id: 'charlie', name: 'Charlie', breed: 'Border Terrier', clientId: 'eleanor-voss', plan: 'Weekly', alert: 'Lead only', color: '#8C7A4A', ageYears: 7, createdAt: todayISO() },
  { id: 'hugo', name: 'Hugo', breed: 'French Bulldog', clientId: 'james-okafor', plan: 'Fortnightly', alert: 'Heat', color: '#5C6E7C', ageYears: 2, notes: 'Heat sensitive — avoid midday walks.', createdAt: todayISO() },
  { id: 'poppy', name: 'Poppy', breed: 'Cavapoo', clientId: 'sophie-laurent', plan: 'Weekly', color: '#A66C8C', ageYears: 1, createdAt: todayISO() },
];

const team: TeamMember[] = [
  { id: 'sarah', name: 'Sarah Mitchell', role: 'Owner · walker', area: 'Chelsea · Belgravia', color: '#127A63', phone: '+44 7700 900482', email: 'sarah@chelseapaws.co.uk', joined: 'Founder · Jan 2021', bio: 'Founded Chelsea Paws in 2021. Handles the trickier dogs and covers the core Chelsea round herself.', skills: ['Puppy training', 'Reactive dogs', 'Medication'], status: 'On walk', createdAt: todayISO() },
  { id: 'tom', name: 'Tom Bailey', role: 'Walker', area: 'Hyde Park · Bayswater', color: '#4A6C8C', phone: '+44 7700 900513', email: 'tom@chelseapaws.co.uk', joined: 'Walker · Mar 2023', bio: 'Joined in 2023. Strong with large and high-energy breeds; runs the longer morning routes.', skills: ['Large breeds', 'Long-distance', 'GPS routes'], status: 'On walk', createdAt: todayISO() },
  { id: 'aisha', name: 'Aisha Khan', role: 'Walker', area: 'Knightsbridge · Kensington', color: '#A66C8C', phone: '+44 7700 900627', email: 'aisha@chelseapaws.co.uk', joined: 'Walker · Sep 2024', bio: 'Joined in 2024. Gentle with senior and small dogs; trusted with back-care and recovery walks.', skills: ['Senior dogs', 'Small breeds', 'Back-care walks'], status: 'Available', createdAt: todayISO() },
];

const durPrice: Record<number, number> = { 30: 16, 45: 20, 60: 24 };

function walk(id: string, petId: string, walkerId: string, dayOffset: number, time: string, durationMin: 30 | 45 | 60, route: string, status: Walk['status']): Walk {
  const weekStart = startOfWeek(todayISO());
  return {
    id, petId, walkerId, date: addDays(weekStart, dayOffset), time, durationMin,
    price: durPrice[durationMin], route, status, repeatWeekly: true, createdAt: todayISO(),
  };
}

function buildWalks(): Walk[] {
  const t = mondayIndex(todayISO()); // 0=Mon..6=Sun, offset of "today" in this week
  const off = (n: number) => (t + n) % 7;
  const list: Walk[] = [
    // Today: a full day like the original narrative — two done, one next, two upcoming.
    walk('w-today-1', 'bella', 'sarah', t, '08:30', 60, 'Hyde Park loop', 'done'),
    walk('w-today-2', 'oscar', 'aisha', t, '10:15', 30, 'Belgravia', 'done'),
    walk('w-today-3', 'milo', 'aisha', t, '11:30', 45, 'Kensington Gardens', 'scheduled'),
    walk('w-today-4', 'luna', 'tom', t, '13:30', 60, 'Hyde Park loop', 'scheduled'),
    walk('w-today-5', 'charlie', 'sarah', t, '15:00', 45, 'Chelsea Embankment', 'scheduled'),
  ];
  // Spread the rest of the roster across the other days of the current week.
  const rest: [string, string, string, number, string, 30 | 45 | 60, string][] = [
    ['w-1', 'oscar', 'aisha', off(1), '09:15', 45, 'Cadogan Gardens'],
    ['w-2', 'luna', 'tom', off(1), '11:30', 45, 'Serpentine circuit'],
    ['w-3', 'bella', 'sarah', off(2), '08:30', 60, 'Hyde Park loop'],
    ['w-4', 'milo', 'aisha', off(2), '11:00', 45, 'Kensington Gardens'],
    ['w-5', 'hugo', 'tom', off(3), '09:45', 30, 'Battersea Park'],
    ['w-6', 'poppy', 'aisha', off(4), '10:00', 30, 'Knightsbridge'],
    ['w-7', 'charlie', 'sarah', off(4), '15:00', 45, 'Chelsea Embankment'],
    ['w-8', 'bella', 'sarah', off(5), '09:00', 60, 'Hyde Park loop'],
    ['w-9', 'luna', 'tom', off(6), '10:00', 45, 'Serpentine circuit'],
  ];
  const weekStart = startOfWeek(todayISO());
  for (const [id, petId, walkerId, dayOffset, time, dur, route] of rest) {
    const date = addDays(weekStart, dayOffset);
    list.push(walk(id, petId, walkerId, dayOffset, time, dur, route, date < todayISO() ? 'done' : 'scheduled'));
  }
  return list;
}

function buildInvoices(): Invoice[] {
  const mk = (id: string, clientId: string, petId: string, issuedOffset: number, dueOffset: number, status: Invoice['status'], route: string, dur: string, price: string, extra?: Partial<Invoice>): Invoice => ({
    id, clientId, petId,
    issued: addDays(todayISO(), issuedOffset), due: addDays(todayISO(), dueOffset), status,
    items: [{ desc: `Solo dog walk · ${dur}`, sub: route, date: addDays(todayISO(), issuedOffset - 1), qty: '1', rate: price, amount: price }],
    createdAt: todayISO(), ...extra,
  });
  return [
    mk('CDC-1046', 'eleanor-voss', 'charlie', -5, 2, 'paid', 'Charlie · Chelsea Embankment', '45 min', '£20.00', { paidOn: addDays(todayISO(), -4), method: 'Auto-charge · Visa ···· 4471' }),
    mk('CDC-1045', 'henry-whitfield', 'luna', -5, 2, 'paid', 'Luna · Serpentine circuit', '60 min', '£24.00', { paidOn: addDays(todayISO(), -3), method: 'Auto-charge · Amex ···· 1002' }),
    mk('CDC-1044', 'camila-duarte', 'milo', -2, 5, 'outstanding', 'Milo · Kensington Gardens', '45 min', '£20.00'),
    mk('CDC-1042', 'priya-shah', 'bella', -3, 4, 'outstanding', 'Bella · Hyde Park loop', '60 min', '£24.00'),
    mk('CDC-1039', 'james-okafor', 'hugo', -9, -6, 'overdue', 'Hugo · Battersea Park', '45 min', '£20.00', { reminderOn: addDays(todayISO(), -2) }),
    mk('CDC-1047', 'julian-ashcroft', 'oscar', 0, 0, 'draft', 'Oscar · Belgravia', '30 min', '£16.00', { issued: 'Not sent', due: 'Not sent' }),
    mk('CDC-1031', 'henry-whitfield', 'luna', -20, -13, 'paid', 'Luna · Serpentine circuit', '45 min', '£24.00', { paidOn: addDays(todayISO(), -19) }),
    mk('CDC-1024', 'henry-whitfield', 'luna', -34, -27, 'paid', 'Luna · Hyde Park loop', '45 min', '£24.00', { paidOn: addDays(todayISO(), -33) }),
  ];
}

function buildReports(): Report[] {
  return [
    { id: 'rep-milo', petId: 'milo', walkerId: 'aisha', route: 'Kensington Gardens', when: `Yesterday · 11:30–12:15`, distance: '2.9 km', duration: '45 min', status: 'pending',
      summary: 'Milo was full of beans today. We did our usual loop through Kensington Gardens — he greeted his spaniel friend by the Round Pond and had a good sniff along the Flower Walk. He drank well, toileted twice (both bagged) and settled happily on the walk home.',
      tones: {
        warm: 'Milo was full of beans today. We did our usual loop through Kensington Gardens — he greeted his spaniel friend by the Round Pond and had a good sniff along the Flower Walk. He drank well, toileted twice (both bagged) and settled happily on the walk home.',
        brief: '45-minute solo walk in Kensington Gardens, 2.9 km. Water taken, two toilet breaks (both bagged). Calm and well-behaved throughout.',
        detailed: 'Milo had a lively 45-minute walk through Kensington Gardens, covering 2.9 km. He greeted a familiar spaniel by the Round Pond, sniffed along the Flower Walk and responded well to recall off-lead. He drank twice at the fountain, toileted twice (both bagged), showed no signs of discomfort, and settled quickly once home.',
      },
      logs: [['Water', 'Drank twice at the fountain'], ['Toilet', 'Two breaks — both bagged'], ['Behaviour', 'Playful; greeted a spaniel friend'], ['Recall', 'Responsive off-lead']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
    { id: 'rep-bella', petId: 'bella', walkerId: 'sarah', route: 'Hyde Park loop', when: 'Yesterday · 08:30–09:30', distance: '3.6 km', duration: '60 min', status: 'sent',
      summary: 'Bella powered through her full Hyde Park loop this morning. Steady pace, brilliant recall, and a happy roll in the grass by the Serpentine. Water taken twice, one toilet break (bagged). A tired, contented pup by the end.',
      logs: [['Water', 'Drank twice'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Confident, great recall'], ['Energy', 'High — tired by the end']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
    { id: 'rep-luna', petId: 'luna', walkerId: 'tom', route: 'Serpentine circuit', when: 'Yesterday · 13:30–14:15', distance: '4.1 km', duration: '45 min', status: 'sent',
      summary: 'Luna enjoyed a longer Serpentine circuit today. She moved comfortably with no sign of joint stiffness and took her time greeting a couple of friendly dogs. Water offered and taken, one toilet break (bagged).',
      logs: [['Water', 'Drank once'], ['Toilet', 'One break — bagged'], ['Joints', 'Moving comfortably, no stiffness'], ['Behaviour', 'Calm and sociable']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
    { id: 'rep-oscar', petId: 'oscar', walkerId: 'aisha', route: 'Cadogan Gardens', when: 'Wed · 10:15–10:45', distance: '1.2 km', duration: '30 min', status: 'sent',
      summary: 'A gentle 30-minute stroll around Cadogan Gardens for Oscar, keeping to the flat as advised for his back. No stairs or jumping. Relaxed throughout, one toilet break (bagged).',
      logs: [['Back care', 'Flat route only — no stairs'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Relaxed, unhurried'], ['Water', 'Offered, not needed']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
    { id: 'rep-charlie', petId: 'charlie', walkerId: 'sarah', route: 'Chelsea Embankment', when: 'Wed · 15:00–15:45', distance: '2.4 km', duration: '45 min', status: 'sent',
      summary: 'Charlie had a bright afternoon walk along Chelsea Embankment. Lovely lead manners, watched the boats on the river, and greeted every passer-by. Water taken, two toilet breaks (both bagged).',
      logs: [['Water', 'Drank once'], ['Toilet', 'Two breaks — both bagged'], ['Behaviour', 'Friendly, good lead manners'], ['Mood', 'Bright and curious']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
    { id: 'rep-poppy', petId: 'poppy', walkerId: 'aisha', route: 'Knightsbridge', when: 'Tue · 10:00–10:30', distance: '1.8 km', duration: '30 min', status: 'sent',
      summary: 'Poppy had a busy little walk around Knightsbridge. Plenty of sniffing, a short play with a terrier, and good pavement manners near the shops. One toilet break (bagged), water offered.',
      logs: [['Water', 'Offered, sipped'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Sociable, playful'], ['Traffic', 'Calm near roads']],
      include: { photos: true, map: true, behaviour: true, water: true }, createdAt: todayISO() },
  ];
}

const recs: Rec[] = [
  { id: 'rec-1', title: 'Raise Bella’s rate by £2 at renewal', sub: 'Chelsea solo walks average £26 — you’re at £24', cta: 'Apply at renewal', dismissed: false },
  { id: 'rec-2', title: 'Re-book Marcus Reilly (Hugo)', sub: 'Was fortnightly, no booking in 3 weeks', cta: 'Draft message', dismissed: false },
  { id: 'rec-3', title: 'Offer Thursday 12:30 to two Chelsea regulars', sub: 'Fills an open slot near existing walks', cta: 'Draft offer', dismissed: false },
];

const notes: Note[] = [
  { id: 'note-1', text: 'Call James O. re: overdue invoice', createdAt: todayISO() },
  { id: 'note-2', text: 'Order more waste bags before Sat', createdAt: todayISO() },
  { id: 'note-3', text: 'Confirm Luna’s new access code', createdAt: todayISO() },
];

const settings: Settings = {
  rateSolo60: 24, rateSolo30: 16, rateGroup: 13,
  weekdayHours: '08:00 – 17:00', weekendHours: 'Mornings only',
  autoDecline: true, autoDraft: true, requireApproval: true, autoCharge: true, overdueReminders: true,
  reportTone: 'warm', payoutAccount: 'Barclays ••• 4471',
};

export function buildSeed(): DB {
  return {
    schemaVersion: 1,
    pets, clients, team,
    walks: buildWalks(),
    invoices: buildInvoices(),
    reports: buildReports(),
    recs,
    notes,
    settings,
    invoiceCounter: 1048,
  };
}
