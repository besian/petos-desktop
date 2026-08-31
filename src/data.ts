// Static content ported from PetOS Desktop.dc.html's renderVals()/reportData.
// Anything that depends on component state (order, theme, selection, etc.)
// stays out of this file and lives in the views/hooks instead.

export const petColors: Record<string, string> = {
  bella: '#C98A3E',
  oscar: '#8C5A3A',
  milo: '#6E6A8C',
  luna: '#4A6C8C',
  charlie: '#8C7A4A',
  hugo: '#5C6E7C',
  poppy: '#A66C8C',
};

export const walkerColors: Record<string, string> = {
  sarah: '#127A63',
  tom: '#4A6C8C',
  aisha: '#A66C8C',
};

export interface ReportTones {
  warm: string;
  brief: string;
  detailed: string;
}

export interface ReportEntry {
  petName: string;
  owner: string;
  route: string;
  when: string;
  distance: string;
  duration: string;
  walker: string;
  status: 'pending' | 'sent';
  summary: string;
  tones?: ReportTones;
  logs: [string, string][];
}

export const reportData: Record<string, ReportEntry> = {
  milo: {
    petName: 'Milo', owner: 'Camila Duarte', route: 'Kensington Gardens', when: 'Yesterday · 11:30–12:15',
    distance: '2.9 km', duration: '45 min', walker: 'Camila', status: 'pending',
    summary: 'Milo was full of beans today. We did our usual loop through Kensington Gardens — he greeted his spaniel friend by the Round Pond and had a good sniff along the Flower Walk. He drank well, toileted twice (both bagged) and settled happily on the walk home.',
    tones: {
      warm: 'Milo was full of beans today. We did our usual loop through Kensington Gardens — he greeted his spaniel friend by the Round Pond and had a good sniff along the Flower Walk. He drank well, toileted twice (both bagged) and settled happily on the walk home.',
      brief: '45-minute solo walk in Kensington Gardens, 2.9 km. Water taken, two toilet breaks (both bagged). Calm and well-behaved throughout.',
      detailed: 'Milo had a lively 45-minute walk through Kensington Gardens, covering 2.9 km. He greeted a familiar spaniel by the Round Pond, sniffed along the Flower Walk and responded well to recall off-lead. He drank twice at the fountain, toileted twice (both bagged), showed no signs of discomfort, and settled quickly once home.',
    },
    logs: [['Water', 'Drank twice at the fountain'], ['Toilet', 'Two breaks — both bagged'], ['Behaviour', 'Playful; greeted a spaniel friend'], ['Recall', 'Responsive off-lead']],
  },
  bella: {
    petName: 'Bella', owner: 'Priya Shah', route: 'Hyde Park loop', when: 'Yesterday · 08:30–09:30',
    distance: '3.6 km', duration: '60 min', walker: 'Sarah', status: 'sent',
    summary: 'Bella powered through her full Hyde Park loop this morning. Steady pace, brilliant recall, and a happy roll in the grass by the Serpentine. Water taken twice, one toilet break (bagged). A tired, contented pup by the end.',
    logs: [['Water', 'Drank twice'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Confident, great recall'], ['Energy', 'High — tired by the end']],
  },
  luna: {
    petName: 'Luna', owner: 'Henry Whitfield', route: 'Serpentine circuit', when: 'Yesterday · 13:30–14:15',
    distance: '4.1 km', duration: '45 min', walker: 'Tom', status: 'sent',
    summary: 'Luna enjoyed a longer Serpentine circuit today. She moved comfortably with no sign of joint stiffness and took her time greeting a couple of friendly dogs. Water offered and taken, one toilet break (bagged).',
    logs: [['Water', 'Drank once'], ['Toilet', 'One break — bagged'], ['Joints', 'Moving comfortably, no stiffness'], ['Behaviour', 'Calm and sociable']],
  },
  oscar: {
    petName: 'Oscar', owner: 'Julian Ashcroft', route: 'Cadogan Gardens', when: 'Wed · 10:15–10:45',
    distance: '1.2 km', duration: '30 min', walker: 'Aisha', status: 'sent',
    summary: 'A gentle 30-minute stroll around Cadogan Gardens for Oscar, keeping to the flat as advised for his back. No stairs or jumping. Relaxed throughout, one toilet break (bagged).',
    logs: [['Back care', 'Flat route only — no stairs'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Relaxed, unhurried'], ['Water', 'Offered, not needed']],
  },
  charlie: {
    petName: 'Charlie', owner: 'Eleanor Voss', route: 'Chelsea Embankment', when: 'Wed · 15:00–15:45',
    distance: '2.4 km', duration: '45 min', walker: 'Sarah', status: 'sent',
    summary: 'Charlie had a bright afternoon walk along Chelsea Embankment. Lovely lead manners, watched the boats on the river, and greeted every passer-by. Water taken, two toilet breaks (both bagged).',
    logs: [['Water', 'Drank once'], ['Toilet', 'Two breaks — both bagged'], ['Behaviour', 'Friendly, good lead manners'], ['Mood', 'Bright and curious']],
  },
  poppy: {
    petName: 'Poppy', owner: 'Sophie Laurent', route: 'Knightsbridge', when: 'Tue · 10:00–10:30',
    distance: '1.8 km', duration: '30 min', walker: 'Aisha', status: 'sent',
    summary: 'Poppy had a busy little walk around Knightsbridge. Plenty of sniffing, a short play with a terrier, and good pavement manners near the shops. One toilet break (bagged), water offered.',
    logs: [['Water', 'Offered, sipped'], ['Toilet', 'One break — bagged'], ['Behaviour', 'Sociable, playful'], ['Traffic', 'Calm near roads']],
  },
};

// [id, name, breed, owner, plan, next, ltv, alert]
export const petsDef: [string, string, string, string, string, string, string, string][] = [
  ['bella', 'Bella', 'Golden Retriever', 'Priya Shah', 'Weekly', 'Today 08:30', '£968', ''],
  ['oscar', 'Oscar', 'Miniature Dachshund', 'Julian Ashcroft', 'Weekly', 'Today 10:15', '£412', 'Back care'],
  ['milo', 'Milo', 'Cockapoo', 'Camila Duarte', 'Weekly', 'Today 11:30', '£356', ''],
  ['luna', 'Luna', 'Labrador', 'Henry Whitfield', 'Weekly', 'Today 13:30', '£1,284', 'Supplement'],
  ['charlie', 'Charlie', 'Border Terrier', 'Eleanor Voss', 'Weekly', 'Today 15:00', '£788', 'Lead only'],
  ['hugo', 'Hugo', 'French Bulldog', 'James Okafor', 'Fortnightly', 'Tomorrow', '£244', 'Heat'],
  ['poppy', 'Poppy', 'Cavapoo', 'Sophie Laurent', 'Weekly', 'Wed 10:00', '£132', ''],
];

export const ownerAddr: Record<string, string> = {
  'Priya Shah': '3 Cheyne Row',
  'Julian Ashcroft': '11 Cadogan Gardens',
  'Camila Duarte': '17 Victoria Road',
  'Henry Whitfield': '24 Hyde Park Gate',
  'Eleanor Voss': '9 Cadogan Gardens',
  'James Okafor': '82 Elystan Street',
  'Sophie Laurent': 'Knightsbridge',
};

export interface InvoiceItem {
  desc: string;
  sub: string;
  date: string;
  qty: string;
  rate: string;
  amount: string;
}

export interface InvoiceEntry {
  client: string;
  pet: string;
  petName: string;
  email: string;
  addr: [string, string];
  issued: string;
  due: string;
  status: 'paid' | 'outstanding' | 'overdue' | 'draft';
  paidOn?: string;
  method?: string;
  reminderOn?: string;
  items: InvoiceItem[];
}

export const invDefs: Record<string, InvoiceEntry> = {
  'CDC-1046': { client: 'Eleanor Voss', pet: 'charlie', petName: 'Charlie', email: 'eleanor.voss@icloud.com', addr: ['9 Cadogan Gardens', 'London SW3 2RD'], issued: '12 Jul 2026', due: '19 Jul 2026', status: 'paid', paidOn: '13 Jul 2026', method: 'Auto-charge · Visa ···· 4471', items: [{ desc: 'Solo dog walk · 45 min', sub: 'Charlie · Chelsea Embankment', date: '11 Jul', qty: '1', rate: '£20.00', amount: '£20.00' }] },
  'CDC-1045': { client: 'Henry Whitfield', pet: 'luna', petName: 'Luna', email: 'h.whitfield@gmail.com', addr: ['24 Hyde Park Gate', 'London SW7 5DG'], issued: '12 Jul 2026', due: '19 Jul 2026', status: 'paid', paidOn: '14 Jul 2026', method: 'Auto-charge · Amex ···· 1002', items: [{ desc: 'Solo dog walk · 60 min', sub: 'Luna · Serpentine circuit', date: '11 Jul', qty: '1', rate: '£24.00', amount: '£24.00' }] },
  'CDC-1044': { client: 'Camila Duarte', pet: 'milo', petName: 'Milo', email: 'camila.duarte@gmail.com', addr: ['17 Victoria Road', 'London W8 5RD'], issued: '15 Jul 2026', due: '22 Jul 2026', status: 'outstanding', items: [{ desc: 'Solo dog walk · 45 min', sub: 'Milo · Kensington Gardens', date: '14 Jul', qty: '1', rate: '£20.00', amount: '£20.00' }] },
  'CDC-1042': { client: 'Priya Shah', pet: 'bella', petName: 'Bella', email: 'priya.shah@outlook.com', addr: ['3 Cheyne Row', 'London SW3 5HL'], issued: '14 Jul 2026', due: '21 Jul 2026', status: 'outstanding', items: [{ desc: 'Solo dog walk · 60 min', sub: 'Bella · Hyde Park loop', date: '13 Jul', qty: '1', rate: '£24.00', amount: '£24.00' }] },
  'CDC-1039': { client: 'James Okafor', pet: 'hugo', petName: 'Hugo', email: 'james.okafor@gmail.com', addr: ['82 Elystan Street', 'London SW3 3NT'], issued: '8 Jul 2026', due: '11 Jul 2026', status: 'overdue', reminderOn: '15 Jul 2026', items: [{ desc: 'Solo dog walk · 45 min', sub: 'Hugo · Battersea Park', date: '7 Jul', qty: '1', rate: '£20.00', amount: '£20.00' }] },
  'CDC-1047': { client: 'Julian Ashcroft', pet: 'oscar', petName: 'Oscar', email: 'j.ashcroft@me.com', addr: ['11 Cadogan Gardens', 'London SW3 2RJ'], issued: 'Not sent', due: 'Not sent', status: 'draft', items: [{ desc: 'Solo dog walk · 30 min', sub: 'Oscar · Belgravia', date: '16 Jul', qty: '1', rate: '£16.00', amount: '£16.00' }] },
  'CDC-1031': { client: 'Henry Whitfield', pet: 'luna', petName: 'Luna', email: 'h.whitfield@gmail.com', addr: ['24 Hyde Park Gate', 'London SW7 5DG'], issued: '4 Jul 2026', due: '11 Jul 2026', status: 'paid', paidOn: '6 Jul 2026', method: 'Auto-charge · Amex ···· 1002', items: [{ desc: 'Solo dog walk · 45 min', sub: 'Luna · Serpentine circuit', date: '3 Jul', qty: '1', rate: '£24.00', amount: '£24.00' }] },
  'CDC-1024': { client: 'Henry Whitfield', pet: 'luna', petName: 'Luna', email: 'h.whitfield@gmail.com', addr: ['24 Hyde Park Gate', 'London SW7 5DG'], issued: '27 Jun 2026', due: '4 Jul 2026', status: 'paid', paidOn: '28 Jun 2026', method: 'Auto-charge · Amex ···· 1002', items: [{ desc: 'Solo dog walk · 45 min', sub: 'Luna · Hyde Park loop', date: '26 Jun', qty: '1', rate: '£24.00', amount: '£24.00' }] },
};

export const teamDef: [string, string, string, string, string, string, number, number, number, string][] = [
  ['sarah', 'Sarah Mitchell', 'Owner · walker', 'SM', '#127A63', 'On walk', 5, 82, 26, '4.9★'],
  ['tom', 'Tom Bailey', 'Walker', 'TB', '#4A6C8C', 'On walk', 6, 92, 31, '4.8★'],
  ['aisha', 'Aisha Khan', 'Walker', 'AK', '#A66C8C', 'Available', 3, 54, 18, '5.0★'],
];

export interface TeamDetailEntry {
  phone: string;
  email: string;
  joined: string;
  area: string;
  bio: string;
  today: [string, string, string][];
  pets: string[];
  skills: string[];
}

export const teamDetail: Record<string, TeamDetailEntry> = {
  sarah: {
    phone: '+44 7700 900482', email: 'sarah@chelseapaws.co.uk', joined: 'Founder · Jan 2021', area: 'Chelsea · Belgravia',
    bio: 'Founded Chelsea Paws in 2021. Handles the trickier dogs and covers the core Chelsea round herself.',
    today: [['08:30', 'Bella', 'Hyde Park loop · 60 min'], ['13:30', 'Luna', 'Serpentine circuit · 45 min'], ['15:00', 'Charlie', 'Chelsea Embankment · 45 min']],
    pets: ['bella', 'luna', 'charlie'], skills: ['Puppy training', 'Reactive dogs', 'Medication'],
  },
  tom: {
    phone: '+44 7700 900513', email: 'tom@chelseapaws.co.uk', joined: 'Walker · Mar 2023', area: 'Hyde Park · Bayswater',
    bio: 'Joined in 2023. Strong with large and high-energy breeds; runs the longer morning routes.',
    today: [['09:15', 'Luna', 'Kensington · 45 min'], ['11:30', 'Milo', 'Kensington Gardens · 45 min'], ['13:00', 'Rex', 'Hyde Park · 60 min']],
    pets: ['luna', 'hugo'], skills: ['Large breeds', 'Long-distance', 'GPS routes'],
  },
  aisha: {
    phone: '+44 7700 900627', email: 'aisha@chelseapaws.co.uk', joined: 'Walker · Sep 2024', area: 'Knightsbridge · Kensington',
    bio: 'Joined in 2024. Gentle with senior and small dogs; trusted with back-care and recovery walks.',
    today: [['10:15', 'Oscar', 'Cadogan Gardens · 30 min'], ['11:30', 'Milo', 'Kensington Gardens · 45 min'], ['12:00', 'Poppy', 'Knightsbridge · 30 min']],
    pets: ['oscar', 'milo', 'poppy'], skills: ['Senior dogs', 'Small breeds', 'Back-care walks'],
  },
};

export const petNameMap: Record<string, string> = { bella: 'Bella', oscar: 'Oscar', milo: 'Milo', luna: 'Luna', charlie: 'Charlie', hugo: 'Hugo', poppy: 'Poppy' };
export const petOwnerMap: Record<string, string> = { bella: 'Priya Shah', oscar: 'Julian Ashcroft', milo: 'Camila Duarte', luna: 'Henry Whitfield', charlie: 'Eleanor Voss', hugo: 'James Okafor', poppy: 'Sophie Laurent' };

// day slots: [top, height, name, time, walker]
export const daySlots: [number, number, string, string, string][][] = [
  [[30, 56, 'Bella', '08:30', 'sarah'], [150, 40, 'Poppy', '10:00', 'aisha'], [280, 50, 'Marley', '12:30', 'tom']],
  [[90, 40, 'Oscar', '09:15', 'aisha'], [220, 56, 'Luna', '11:30', 'tom'], [360, 50, 'Coco', '14:00', 'sarah']],
  [[30, 56, 'Bella', '08:30', 'sarah'], [200, 44, 'Milo', '11:00', 'aisha']],
  [[120, 44, 'Hugo', '09:45', 'tom'], [300, 56, 'Rex', '13:00', 'tom']],
  [[30, 56, 'Bella', '08:30', 'sarah'], [120, 40, 'Oscar', '10:15', 'aisha'], [200, 44, 'Milo', '11:30', 'aisha'], [350, 56, 'Luna', '13:30', 'tom'], [440, 44, 'Charlie', '15:00', 'sarah']],
  [[80, 50, 'Group', '09:00', 'sarah'], [240, 50, 'Poppy', '12:00', 'aisha']],
  [[110, 44, 'Luna', '10:00', 'tom']],
];

export const reportDef: [string, string, string, string, string, string, 'pending' | 'sent'][] = [
  ['milo', 'Milo', 'Kensington Gardens', 'Camila Duarte', 'Yesterday 11:30', '2.9 km', 'pending'],
  ['bella', 'Bella', 'Hyde Park loop', 'Priya Shah', 'Yesterday 08:30', '3.6 km', 'sent'],
  ['luna', 'Luna', 'Serpentine circuit', 'Henry Whitfield', 'Yesterday 13:30', '4.1 km', 'sent'],
  ['oscar', 'Oscar', 'Cadogan Gardens', 'Julian Ashcroft', 'Wed 10:15', '1.2 km', 'sent'],
  ['charlie', 'Charlie', 'Chelsea Embankment', 'Eleanor Voss', 'Wed 15:00', '2.4 km', 'sent'],
  ['poppy', 'Poppy', 'Knightsbridge', 'Sophie Laurent', 'Tue 10:00', '1.8 km', 'sent'],
];

export const payDef: [string, string, string, 'paid' | 'outstanding' | 'overdue' | 'draft'][] = [
  ['CDC-1046', 'Eleanor Voss', '£20.00', 'paid'], ['CDC-1045', 'Henry Whitfield', '£24.00', 'paid'],
  ['CDC-1044', 'Camila Duarte', '£20.00', 'outstanding'], ['CDC-1042', 'Priya Shah', '£24.00', 'outstanding'],
  ['CDC-1039', 'James Okafor', '£20.00', 'overdue'], ['CDC-1047', 'Julian Ashcroft', '£16.00', 'draft'],
];

export const opsDef: [string, string, string, string, 'done' | 'next' | 'upcoming', string][] = [
  ['08:30', 'bella', 'Bella', 'Hyde Park · solo 60m', 'done', '£24'],
  ['10:15', 'oscar', 'Oscar', 'Belgravia · solo 30m', 'done', '£16'],
  ['11:30', 'milo', 'Milo', 'Kensington · solo 45m', 'next', '£20'],
  ['13:30', 'luna', 'Luna', 'Hyde Park · solo 60m', 'upcoming', '£24'],
  ['15:00', 'charlie', 'Charlie', 'Chelsea · solo 45m', 'upcoming', '£20'],
];

export const clientInvoicesDef: [string, string, string, 'paid' | 'outstanding'][] = [
  ['CDC-1045', '12 Jul 2026', '£24.00', 'paid'], ['CDC-1031', '4 Jul 2026', '£24.00', 'paid'], ['CDC-1024', '27 Jun 2026', '£24.00', 'paid'],
];

export const docs = ['Vaccination record 2026.pdf', 'Care agreement.pdf', 'Vet consent form.pdf'];

export const clientUpcoming = [
  { when: 'Mon 21 Jul · 13:30', label: 'Luna · Serpentine 45 min', walker: 'Tom' },
  { when: 'Thu 24 Jul · 13:30', label: 'Luna · Hyde Park 45 min', walker: 'Sarah' },
];

export const clientActivity = [
  { dotVar: 'brand' as const, label: 'Walk report sent · 4.1 km Serpentine circuit', when: 'Yesterday' },
  { dotVar: 'brand' as const, label: 'Invoice paid · £24.00', when: '2 days ago' },
  { dotVar: 'info' as const, label: 'Note: “towel in the porch for muddy paws”', when: '1 week ago' },
];

export const revVals = [1720, 1840, 1910, 2020, 1980, 2140];
export const revLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

export const healthDef: [string, string, number][] = [
  ['Client retention', '94%', 94], ['Booking frequency', '2.1×/wk', 70], ['Capacity used', '82%', 82], ['Team utilisation', '76%', 76],
];

export const recsDef = [
  { title: 'Raise Bella’s rate by £2 at renewal', sub: 'Chelsea solo walks average £26 — you’re at £24', cta: 'Apply at renewal' },
  { title: 'Re-book Marcus Reilly (Hugo)', sub: 'Was fortnightly, no booking in 3 weeks', cta: 'Draft message' },
  { title: 'Offer Thursday 12:30 to two Chelsea regulars', sub: 'Fills an open slot near existing walks', cta: 'Draft offer' },
];

export const teamFeed = [
  { initial: 'S', color: '#4A6C8C', name: 'Sarah', action: 'checked in with Bella', when: '8m ago' },
  { initial: 'T', color: '#127A63', name: 'Tom', action: 'completed Oscar’s walk', when: '32m ago' },
  { initial: 'A', color: '#A66C8C', name: 'Aisha', action: 'uploaded 3 photos for Milo', when: '1h ago' },
];

export const quickNotesDef = [
  'Call James O. re: overdue invoice',
  'Order more waste bags before Sat',
  'Confirm Luna’s new access code',
];

export const nwPetDefs: [string, string][] = [['bella', 'Bella'], ['oscar', 'Oscar'], ['milo', 'Milo'], ['luna', 'Luna'], ['charlie', 'Charlie']];
export const nwDayDefs: [string, number][] = [['Mon', 18], ['Tue', 19], ['Wed', 20], ['Thu', 21], ['Fri', 22], ['Sat', 23]];
export const nwTimeDefs = ['08:30', '09:00', '11:00', '13:30', '15:00'];
export const durPrice: Record<number, string> = { 30: '£16', 45: '£20', 60: '£24' };

export const widgetLabels: Record<string, string> = {
  briefing: 'Morning briefing', kpis: 'Key metrics', operations: "Today's operations", revenue: 'Revenue',
  attention: 'Needs attention', team: 'Team activity', weather: 'Conditions', notes: 'Quick notes',
};

export const spanMap: Record<string, string> = {
  briefing: 'grid-column:span 12', kpis: 'grid-column:span 12', operations: 'grid-column:span 7;grid-row:span 2',
  revenue: 'grid-column:span 5', attention: 'grid-column:span 5', team: 'grid-column:span 4', weather: 'grid-column:span 4', notes: 'grid-column:span 4',
};

export const filtersDef: [string, string][] = [['all', 'All walkers'], ['sarah', 'Sarah'], ['tom', 'Tom'], ['aisha', 'Aisha']];

export const settingsToggleDefaults = {
  autoDecline: true, autoDraft: true, requireApproval: true, autoCharge: true, overdueReminders: true,
};

export type ViewKey =
  | 'overview' | 'schedule' | 'pets' | 'client' | 'reports' | 'payments' | 'team' | 'business' | 'settings'
  | 'invoice' | 'reportview' | 'reportedit' | 'teammember';
