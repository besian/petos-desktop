// Core data model for the local "database" (persisted to localStorage —
// see store.tsx). Ids are plain strings; entities cross-reference each
// other by id rather than nesting, so updates in one place are visible
// everywhere without denormalization bugs.

export interface Pet {
  id: string;
  name: string;
  breed: string;
  clientId: string;
  plan: 'Weekly' | 'Fortnightly' | 'Monthly';
  alert?: string;
  color: string;
  photo?: string | null;
  ageYears?: number;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  email: string;
  phone?: string;
  memberSince: string;
  keySafe?: string;
  emergencyContact?: string;
  vet?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  area: string;
  color: string;
  phone: string;
  email: string;
  joined: string;
  bio: string;
  skills: string[];
  status: 'On walk' | 'Available' | 'Off duty';
  createdAt: string;
}

export interface Walk {
  id: string;
  petId: string;
  walkerId: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "08:30"
  durationMin: 30 | 45 | 60;
  price: number;
  route: string;
  status: 'scheduled' | 'done' | 'cancelled';
  repeatWeekly: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  desc: string;
  sub: string;
  date: string;
  qty: string;
  rate: string;
  amount: string;
}

export interface Invoice {
  id: string; // e.g. "CDC-1048"
  clientId: string;
  petId: string;
  issued: string;
  due: string;
  status: 'paid' | 'outstanding' | 'overdue' | 'draft';
  paidOn?: string;
  method?: string;
  reminderOn?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface ReportTones {
  warm: string;
  brief: string;
  detailed: string;
}

export interface Report {
  id: string;
  petId: string;
  walkerId: string;
  route: string;
  when: string;
  distance: string;
  duration: string;
  status: 'pending' | 'sent';
  summary: string;
  tones?: ReportTones;
  logs: [string, string][];
  include: { photos: boolean; map: boolean; behaviour: boolean; water: boolean };
  photos?: string[];
  createdAt: string;
}

export interface Rec {
  id: string;
  title: string;
  sub: string;
  cta: string;
  dismissed: boolean;
}

export interface Settings {
  rateSolo60: number;
  rateSolo30: number;
  rateGroup: number;
  weekdayHours: string;
  weekendHours: string;
  autoDecline: boolean;
  autoDraft: boolean;
  requireApproval: boolean;
  autoCharge: boolean;
  overdueReminders: boolean;
  reportTone: 'warm' | 'brief' | 'detailed';
  payoutAccount: string;
}

export interface Business {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  // NOT a secure hash — there is no backend to verify against, so this is
  // client-side-only "auth" scoped to a single browser. See auth/README.
  passwordObfuscated: string;
  plan: string;
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface DB {
  schemaVersion: number;
  pets: Pet[];
  clients: Client[];
  team: TeamMember[];
  walks: Walk[];
  invoices: Invoice[];
  reports: Report[];
  recs: Rec[];
  notes: Note[];
  settings: Settings;
  invoiceCounter: number;
}
