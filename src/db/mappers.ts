// Row <-> app-type converters for every table in supabase/schema.sql.
// Kept explicit (rather than a generic camelCase<->snake_case walker) so
// the one irregular case — Report.when / when_text, renamed to dodge the
// SQL reserved-ish word — can't slip through silently.

import type { Pet, Client, TeamMember, Walk, Invoice, Report, Rec, Note, Settings } from './types';

export function petFromRow(r: Record<string, unknown>): Pet {
  return {
    id: r.id as string, name: r.name as string, breed: r.breed as string, clientId: r.client_id as string,
    plan: r.plan as Pet['plan'], alert: (r.alert as string) ?? undefined, color: r.color as string,
    photo: (r.photo as string) ?? undefined, ageYears: (r.age_years as number) ?? undefined,
    notes: (r.notes as string) ?? undefined, createdAt: r.created_at as string,
  };
}
export function petToRow(ownerId: string, p: Pet) {
  return {
    owner_id: ownerId, id: p.id, name: p.name, breed: p.breed, client_id: p.clientId, plan: p.plan,
    alert: p.alert ?? null, color: p.color, photo: p.photo ?? null, age_years: p.ageYears ?? null,
    notes: p.notes ?? null, created_at: p.createdAt,
  };
}
export function petPatchToRow(patch: Partial<Pet>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.breed !== undefined) row.breed = patch.breed;
  if (patch.clientId !== undefined) row.client_id = patch.clientId;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.alert !== undefined) row.alert = patch.alert ?? null;
  if (patch.color !== undefined) row.color = patch.color;
  if (patch.photo !== undefined) row.photo = patch.photo ?? null;
  if (patch.ageYears !== undefined) row.age_years = patch.ageYears ?? null;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  return row;
}

export function clientFromRow(r: Record<string, unknown>): Client {
  return {
    id: r.id as string, name: r.name as string, addressLine1: r.address_line1 as string, addressLine2: r.address_line2 as string,
    email: r.email as string, phone: (r.phone as string) ?? undefined, memberSince: r.member_since as string,
    keySafe: (r.key_safe as string) ?? undefined, emergencyContact: (r.emergency_contact as string) ?? undefined,
    vet: (r.vet as string) ?? undefined, authUserId: (r.auth_user_id as string) ?? null, createdAt: r.created_at as string,
  };
}
export function clientToRow(ownerId: string, c: Client) {
  return {
    owner_id: ownerId, id: c.id, name: c.name, address_line1: c.addressLine1, address_line2: c.addressLine2,
    email: c.email, phone: c.phone ?? null, member_since: c.memberSince, key_safe: c.keySafe ?? null,
    emergency_contact: c.emergencyContact ?? null, vet: c.vet ?? null, created_at: c.createdAt,
  };
}
export function clientPatchToRow(patch: Partial<Client>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.addressLine1 !== undefined) row.address_line1 = patch.addressLine1;
  if (patch.addressLine2 !== undefined) row.address_line2 = patch.addressLine2;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone ?? null;
  if (patch.memberSince !== undefined) row.member_since = patch.memberSince;
  if (patch.keySafe !== undefined) row.key_safe = patch.keySafe ?? null;
  if (patch.emergencyContact !== undefined) row.emergency_contact = patch.emergencyContact ?? null;
  if (patch.vet !== undefined) row.vet = patch.vet ?? null;
  return row;
}

export function teamFromRow(r: Record<string, unknown>): TeamMember {
  return {
    id: r.id as string, name: r.name as string, role: r.role as string, area: r.area as string, color: r.color as string,
    phone: r.phone as string, email: r.email as string, joined: r.joined as string, bio: r.bio as string,
    skills: (r.skills as string[]) ?? [], status: r.status as TeamMember['status'], authUserId: (r.auth_user_id as string) ?? null,
    createdAt: r.created_at as string,
  };
}
export function teamToRow(ownerId: string, t: TeamMember) {
  return {
    owner_id: ownerId, id: t.id, name: t.name, role: t.role, area: t.area, color: t.color, phone: t.phone,
    email: t.email, joined: t.joined, bio: t.bio, skills: t.skills, status: t.status, created_at: t.createdAt,
  };
}
export function teamPatchToRow(patch: Partial<TeamMember>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.area !== undefined) row.area = patch.area;
  if (patch.color !== undefined) row.color = patch.color;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.joined !== undefined) row.joined = patch.joined;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.skills !== undefined) row.skills = patch.skills;
  if (patch.status !== undefined) row.status = patch.status;
  return row;
}

export function walkFromRow(r: Record<string, unknown>): Walk {
  return {
    id: r.id as string, petId: r.pet_id as string, walkerId: r.walker_id as string, date: r.date as string,
    time: r.time as string, durationMin: r.duration_min as Walk['durationMin'], price: Number(r.price),
    route: r.route as string, status: r.status as Walk['status'], repeatWeekly: r.repeat_weekly as boolean,
    createdAt: r.created_at as string,
  };
}
export function walkToRow(ownerId: string, w: Walk) {
  return {
    owner_id: ownerId, id: w.id, pet_id: w.petId, walker_id: w.walkerId, date: w.date, time: w.time,
    duration_min: w.durationMin, price: w.price, route: w.route, status: w.status, repeat_weekly: w.repeatWeekly,
    created_at: w.createdAt,
  };
}
export function walkPatchToRow(patch: Partial<Walk>) {
  const row: Record<string, unknown> = {};
  if (patch.petId !== undefined) row.pet_id = patch.petId;
  if (patch.walkerId !== undefined) row.walker_id = patch.walkerId;
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.time !== undefined) row.time = patch.time;
  if (patch.durationMin !== undefined) row.duration_min = patch.durationMin;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.route !== undefined) row.route = patch.route;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.repeatWeekly !== undefined) row.repeat_weekly = patch.repeatWeekly;
  return row;
}

export function invoiceFromRow(r: Record<string, unknown>): Invoice {
  return {
    id: r.id as string, clientId: r.client_id as string, petId: r.pet_id as string, issued: r.issued as string,
    due: r.due as string, status: r.status as Invoice['status'], paidOn: (r.paid_on as string) ?? undefined,
    method: (r.method as string) ?? undefined, reminderOn: (r.reminder_on as string) ?? undefined,
    items: (r.items as Invoice['items']) ?? [], createdAt: r.created_at as string,
  };
}
export function invoiceToRow(ownerId: string, i: Invoice) {
  return {
    owner_id: ownerId, id: i.id, client_id: i.clientId, pet_id: i.petId, issued: i.issued, due: i.due,
    status: i.status, paid_on: i.paidOn ?? null, method: i.method ?? null, reminder_on: i.reminderOn ?? null,
    items: i.items, created_at: i.createdAt,
  };
}
export function invoicePatchToRow(patch: Partial<Invoice>) {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.paidOn !== undefined) row.paid_on = patch.paidOn ?? null;
  if (patch.method !== undefined) row.method = patch.method ?? null;
  if (patch.reminderOn !== undefined) row.reminder_on = patch.reminderOn ?? null;
  if (patch.items !== undefined) row.items = patch.items;
  if (patch.issued !== undefined) row.issued = patch.issued;
  if (patch.due !== undefined) row.due = patch.due;
  return row;
}

export function reportFromRow(r: Record<string, unknown>): Report {
  return {
    id: r.id as string, petId: r.pet_id as string, walkerId: r.walker_id as string, route: r.route as string,
    when: r.when_text as string, distance: r.distance as string, duration: r.duration as string,
    status: r.status as Report['status'], summary: r.summary as string, tones: (r.tones as Report['tones']) ?? undefined,
    logs: (r.logs as Report['logs']) ?? [], include: r.include as Report['include'],
    photos: (r.photos as string[]) ?? undefined, createdAt: r.created_at as string,
  };
}
export function reportToRow(ownerId: string, r: Report) {
  return {
    owner_id: ownerId, id: r.id, pet_id: r.petId, walker_id: r.walkerId, route: r.route, when_text: r.when,
    distance: r.distance, duration: r.duration, status: r.status, summary: r.summary, tones: r.tones ?? null,
    logs: r.logs, include: r.include, photos: r.photos ?? null, created_at: r.createdAt,
  };
}
export function reportPatchToRow(patch: Partial<Report>) {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.summary !== undefined) row.summary = patch.summary;
  if (patch.include !== undefined) row.include = patch.include;
  if (patch.photos !== undefined) row.photos = patch.photos ?? null;
  if (patch.tones !== undefined) row.tones = patch.tones ?? null;
  if (patch.logs !== undefined) row.logs = patch.logs;
  return row;
}

export function recFromRow(r: Record<string, unknown>): Rec {
  return { id: r.id as string, title: r.title as string, sub: r.sub as string, cta: r.cta as string, dismissed: r.dismissed as boolean };
}
export function recToRow(ownerId: string, r: Rec) {
  return { owner_id: ownerId, id: r.id, title: r.title, sub: r.sub, cta: r.cta, dismissed: r.dismissed };
}

export function noteFromRow(r: Record<string, unknown>): Note {
  return { id: r.id as string, text: r.text as string, createdAt: r.created_at as string };
}
export function noteToRow(ownerId: string, n: Note) {
  return { owner_id: ownerId, id: n.id, text: n.text, created_at: n.createdAt };
}

export function settingsFromRow(r: Record<string, unknown>): Settings {
  return {
    rateSolo60: Number(r.rate_solo60), rateSolo30: Number(r.rate_solo30), rateGroup: Number(r.rate_group),
    weekdayHours: r.weekday_hours as string, weekendHours: r.weekend_hours as string,
    autoDecline: r.auto_decline as boolean, autoDraft: r.auto_draft as boolean, requireApproval: r.require_approval as boolean,
    autoCharge: r.auto_charge as boolean, overdueReminders: r.overdue_reminders as boolean,
    reportTone: r.report_tone as Settings['reportTone'], payoutAccount: r.payout_account as string,
  };
}
export function settingsPatchToRow(patch: Partial<Settings>) {
  const row: Record<string, unknown> = {};
  if (patch.rateSolo60 !== undefined) row.rate_solo60 = patch.rateSolo60;
  if (patch.rateSolo30 !== undefined) row.rate_solo30 = patch.rateSolo30;
  if (patch.rateGroup !== undefined) row.rate_group = patch.rateGroup;
  if (patch.weekdayHours !== undefined) row.weekday_hours = patch.weekdayHours;
  if (patch.weekendHours !== undefined) row.weekend_hours = patch.weekendHours;
  if (patch.autoDecline !== undefined) row.auto_decline = patch.autoDecline;
  if (patch.autoDraft !== undefined) row.auto_draft = patch.autoDraft;
  if (patch.requireApproval !== undefined) row.require_approval = patch.requireApproval;
  if (patch.autoCharge !== undefined) row.auto_charge = patch.autoCharge;
  if (patch.overdueReminders !== undefined) row.overdue_reminders = patch.overdueReminders;
  if (patch.reportTone !== undefined) row.report_tone = patch.reportTone;
  if (patch.payoutAccount !== undefined) row.payout_account = patch.payoutAccount;
  return row;
}
