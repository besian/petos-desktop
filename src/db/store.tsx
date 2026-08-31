import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DB, Pet, Client, TeamMember, Walk, Invoice, Report, Settings, InvoiceItem } from './types';
import { buildSeed } from './seed';
import { useAuth } from '../auth/store';
import { todayISO } from './dates';
import { fetchDogPhoto, fetchDogPhotos } from '../lib/dogPhoto';
import { supabase } from '../lib/supabase';
import {
  petFromRow, petToRow, petPatchToRow,
  clientFromRow, clientToRow, clientPatchToRow,
  teamFromRow, teamToRow, teamPatchToRow,
  walkFromRow, walkToRow, walkPatchToRow,
  invoiceFromRow, invoiceToRow, invoicePatchToRow,
  reportFromRow, reportToRow, reportPatchToRow,
  recFromRow, recToRow,
  noteFromRow, noteToRow,
  settingsFromRow, settingsPatchToRow,
} from './mappers';

function newId(prefix: string) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const defaultSettings: Settings = {
  rateSolo60: 24, rateSolo30: 16, rateGroup: 13, weekdayHours: '08:00 – 17:00', weekendHours: 'Mornings only',
  autoDecline: true, autoDraft: true, requireApproval: true, autoCharge: true, overdueReminders: true,
  reportTone: 'warm', payoutAccount: '',
};

const emptyDB: DB = {
  schemaVersion: 1, pets: [], clients: [], team: [], walks: [], invoices: [], reports: [], recs: [], notes: [],
  settings: defaultSettings, invoiceCounter: 1000,
};

function logErr(label: string, error: { message: string } | null) {
  if (error) console.error(`[petos] ${label}:`, error.message);
}

async function fetchAllForOwner(ownerId: string): Promise<DB> {
  const [clientsRes, petsRes, teamRes, walksRes, invoicesRes, reportsRes, recsRes, notesRes, settingsRes, profileRes] = await Promise.all([
    supabase.from('clients').select('*').eq('owner_id', ownerId),
    supabase.from('pets').select('*').eq('owner_id', ownerId),
    supabase.from('team_members').select('*').eq('owner_id', ownerId),
    supabase.from('walks').select('*').eq('owner_id', ownerId),
    supabase.from('invoices').select('*').eq('owner_id', ownerId),
    supabase.from('reports').select('*').eq('owner_id', ownerId),
    supabase.from('recs').select('*').eq('owner_id', ownerId),
    supabase.from('notes').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
    supabase.from('settings').select('*').eq('owner_id', ownerId).maybeSingle(),
    supabase.from('profiles').select('invoice_counter').eq('id', ownerId).maybeSingle(),
  ]);

  return {
    schemaVersion: 1,
    clients: (clientsRes.data ?? []).map(clientFromRow),
    pets: (petsRes.data ?? []).map(petFromRow),
    team: (teamRes.data ?? []).map(teamFromRow),
    walks: (walksRes.data ?? []).map(walkFromRow),
    invoices: (invoicesRes.data ?? []).map(invoiceFromRow),
    reports: (reportsRes.data ?? []).map(reportFromRow),
    recs: (recsRes.data ?? []).map(recFromRow),
    notes: (notesRes.data ?? []).map(noteFromRow),
    settings: settingsRes.data ? settingsFromRow(settingsRes.data) : defaultSettings,
    invoiceCounter: (profileRes.data?.invoice_counter as number | undefined) ?? 1000,
  };
}

// Fresh account with nothing in it yet — write a demo dataset into
// Supabase so a new signup isn't a blank dashboard, same as the old
// localStorage version did.
async function seedForOwner(ownerId: string): Promise<DB> {
  const seed = buildSeed();
  logErr('seed clients', (await supabase.from('clients').insert(seed.clients.map((c) => clientToRow(ownerId, c)))).error);
  logErr('seed pets', (await supabase.from('pets').insert(seed.pets.map((p) => petToRow(ownerId, p)))).error);
  logErr('seed team', (await supabase.from('team_members').insert(seed.team.map((t) => teamToRow(ownerId, t)))).error);
  logErr('seed walks', (await supabase.from('walks').insert(seed.walks.map((w) => walkToRow(ownerId, w)))).error);
  logErr('seed invoices', (await supabase.from('invoices').insert(seed.invoices.map((i) => invoiceToRow(ownerId, i)))).error);
  logErr('seed reports', (await supabase.from('reports').insert(seed.reports.map((r) => reportToRow(ownerId, r)))).error);
  logErr('seed recs', (await supabase.from('recs').insert(seed.recs.map((r) => recToRow(ownerId, r)))).error);
  logErr('seed notes', (await supabase.from('notes').insert(seed.notes.map((n) => noteToRow(ownerId, n)))).error);
  logErr('seed settings', (await supabase.from('settings').upsert({ owner_id: ownerId, ...settingsPatchToRow(seed.settings) })).error);
  logErr('seed invoice_counter', (await supabase.from('profiles').update({ invoice_counter: seed.invoiceCounter }).eq('id', ownerId)).error);
  return seed;
}

interface DBContextValue {
  db: DB;
  ready: boolean;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Promise<Pet>;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addWalk: (walk: Omit<Walk, 'id' | 'createdAt' | 'status'>) => Promise<Walk>;
  updateWalk: (id: string, patch: Partial<Walk>) => void;
  cancelWalk: (id: string) => void;
  addInvoice: (input: { clientId: string; petId: string; items: InvoiceItem[]; dueInDays?: number }) => Promise<Invoice>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  markInvoicePaid: (id: string) => void;
  sendInvoice: (id: string) => void;
  updateReport: (id: string, patch: Partial<Report>) => void;
  sendReport: (id: string) => void;
  dismissRec: (id: string) => void;
  approveRec: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  exportAllDataJSON: () => string;
  nextInvoiceNo: () => string;
}

const DBContext = createContext<DBContextValue | null>(null);

export function DBProvider({ children }: { children: ReactNode }) {
  const { account } = useAuth();
  const ownerId = account?.id;
  const [db, setDb] = useState<DB>(emptyDB);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ownerId) { setDb(emptyDB); setReady(false); return; }
    let cancelled = false;
    setReady(false);
    (async () => {
      let next = await fetchAllForOwner(ownerId);
      if (next.pets.length === 0 && next.clients.length === 0 && next.team.length === 0) {
        next = await seedForOwner(ownerId);
      }
      if (!cancelled) { setDb(next); setReady(true); }
    })();
    return () => { cancelled = true; };
  }, [ownerId]);

  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ownerId || !ready) return;
    const petsNeeding = db.pets.filter((p) => !p.photo && !fetchingRef.current.has('pet:' + p.id));
    for (const p of petsNeeding) {
      fetchingRef.current.add('pet:' + p.id);
      fetchDogPhoto(p.breed).then((url) => {
        if (url) updatePet(p.id, { photo: url });
        else fetchingRef.current.delete('pet:' + p.id);
      });
    }
    const reportsNeeding = db.reports.filter((r) => r.include.photos && (!r.photos || r.photos.length < 3) && !fetchingRef.current.has('report:' + r.id));
    for (const r of reportsNeeding) {
      fetchingRef.current.add('report:' + r.id);
      const pet = db.pets.find((p) => p.id === r.petId);
      fetchDogPhotos(3, pet?.breed).then((urls) => {
        if (urls.length) updateReport(r.id, { photos: urls });
        else fetchingRef.current.delete('report:' + r.id);
      });
    }
  }, [ownerId, ready, db.pets, db.reports]);

  const addPet = useCallback(async (pet: Omit<Pet, 'id' | 'createdAt'>) => {
    if (!ownerId) throw new Error('Not signed in');
    const created: Pet = { ...pet, id: newId('pet'), createdAt: todayISO() };
    const { error } = await supabase.from('pets').insert(petToRow(ownerId, created));
    if (error) throw error;
    setDb((s) => ({ ...s, pets: [...s.pets, created] }));
    return created;
  }, [ownerId]);
  const updatePet = useCallback((id: string, patch: Partial<Pet>) => {
    setDb((s) => ({ ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
    if (ownerId) supabase.from('pets').update(petPatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updatePet', error));
  }, [ownerId]);
  const deletePet = useCallback((id: string) => {
    setDb((s) => ({ ...s, pets: s.pets.filter((p) => p.id !== id), walks: s.walks.filter((w) => w.petId !== id), reports: s.reports.filter((r) => r.petId !== id) }));
    if (ownerId) supabase.from('pets').delete().eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('deletePet', error));
  }, [ownerId]);

  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!ownerId) throw new Error('Not signed in');
    const created: Client = { ...client, id: newId('client'), createdAt: todayISO() };
    const { error } = await supabase.from('clients').insert(clientToRow(ownerId, created));
    if (error) throw error;
    setDb((s) => ({ ...s, clients: [...s.clients, created] }));
    return created;
  }, [ownerId]);
  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setDb((s) => ({ ...s, clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    if (ownerId) supabase.from('clients').update(clientPatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updateClient', error));
  }, [ownerId]);
  const deleteClient = useCallback((id: string) => {
    setDb((s) => {
      const petIds = new Set(s.pets.filter((p) => p.clientId === id).map((p) => p.id));
      return {
        ...s,
        clients: s.clients.filter((c) => c.id !== id),
        pets: s.pets.filter((p) => p.clientId !== id),
        walks: s.walks.filter((w) => !petIds.has(w.petId)),
        reports: s.reports.filter((r) => !petIds.has(r.petId)),
      };
    });
    // Cascades server-side: clients -> pets -> walks/reports.
    if (ownerId) supabase.from('clients').delete().eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('deleteClient', error));
  }, [ownerId]);

  const addTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    if (!ownerId) throw new Error('Not signed in');
    const created: TeamMember = { ...member, id: newId('team'), createdAt: todayISO() };
    const { error } = await supabase.from('team_members').insert(teamToRow(ownerId, created));
    if (error) throw error;
    setDb((s) => ({ ...s, team: [...s.team, created] }));
    return created;
  }, [ownerId]);
  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMember>) => {
    setDb((s) => ({ ...s, team: s.team.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
    if (ownerId) supabase.from('team_members').update(teamPatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updateTeamMember', error));
  }, [ownerId]);
  const deleteTeamMember = useCallback((id: string) => {
    setDb((s) => ({ ...s, team: s.team.filter((m) => m.id !== id), walks: s.walks.map((w) => (w.walkerId === id ? { ...w, walkerId: '' } : w)) }));
    if (ownerId) {
      supabase.from('walks').update({ walker_id: '' }).eq('owner_id', ownerId).eq('walker_id', id).then(({ error }) => logErr('unassign walks', error));
      supabase.from('team_members').delete().eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('deleteTeamMember', error));
    }
  }, [ownerId]);

  const addWalk = useCallback(async (walk: Omit<Walk, 'id' | 'createdAt' | 'status'>) => {
    if (!ownerId) throw new Error('Not signed in');
    const created: Walk = { ...walk, id: newId('walk'), status: 'scheduled', createdAt: todayISO() };
    const { error } = await supabase.from('walks').insert(walkToRow(ownerId, created));
    if (error) throw error;
    setDb((s) => ({ ...s, walks: [...s.walks, created] }));
    return created;
  }, [ownerId]);
  const updateWalk = useCallback((id: string, patch: Partial<Walk>) => {
    setDb((s) => ({ ...s, walks: s.walks.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
    if (ownerId) supabase.from('walks').update(walkPatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updateWalk', error));
  }, [ownerId]);
  const cancelWalk = useCallback((id: string) => {
    setDb((s) => ({ ...s, walks: s.walks.map((w) => (w.id === id ? { ...w, status: 'cancelled' } : w)) }));
    if (ownerId) supabase.from('walks').update({ status: 'cancelled' }).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('cancelWalk', error));
  }, [ownerId]);

  const nextInvoiceNo = useCallback(() => 'CDC-' + (db.invoiceCounter + 1), [db.invoiceCounter]);

  const addInvoice = useCallback(async (input: { clientId: string; petId: string; items: InvoiceItem[]; dueInDays?: number }) => {
    if (!ownerId) throw new Error('Not signed in');
    const no = 'CDC-' + (db.invoiceCounter + 1);
    const created: Invoice = { id: no, clientId: input.clientId, petId: input.petId, items: input.items, issued: todayISO(), due: todayISO(), status: 'draft', createdAt: todayISO() };
    const { error } = await supabase.from('invoices').insert(invoiceToRow(ownerId, created));
    if (error) throw error;
    await supabase.from('profiles').update({ invoice_counter: db.invoiceCounter + 1 }).eq('id', ownerId);
    setDb((s) => ({ ...s, invoices: [...s.invoices, created], invoiceCounter: s.invoiceCounter + 1 }));
    return created;
  }, [ownerId, db.invoiceCounter]);
  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
    if (ownerId) supabase.from('invoices').update(invoicePatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updateInvoice', error));
  }, [ownerId]);
  const markInvoicePaid = useCallback((id: string) => {
    const paidOn = todayISO();
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: 'paid', paidOn } : i)) }));
    if (ownerId) supabase.from('invoices').update({ status: 'paid', paid_on: paidOn }).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('markInvoicePaid', error));
  }, [ownerId]);
  const sendInvoice = useCallback((id: string) => {
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id && i.status !== 'paid' ? { ...i, status: 'outstanding' } : i)) }));
    if (ownerId) supabase.from('invoices').update({ status: 'outstanding' }).eq('owner_id', ownerId).eq('id', id).neq('status', 'paid').then(({ error }) => logErr('sendInvoice', error));
  }, [ownerId]);

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setDb((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    if (ownerId) supabase.from('reports').update(reportPatchToRow(patch)).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('updateReport', error));
  }, [ownerId]);
  const sendReport = useCallback((id: string) => {
    setDb((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, status: 'sent' } : r)) }));
    if (ownerId) supabase.from('reports').update({ status: 'sent' }).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('sendReport', error));
  }, [ownerId]);

  const dismissRec = useCallback((id: string) => {
    setDb((s) => ({ ...s, recs: s.recs.map((r) => (r.id === id ? { ...r, dismissed: true } : r)) }));
    if (ownerId) supabase.from('recs').update({ dismissed: true }).eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('dismissRec', error));
  }, [ownerId]);
  const approveRec = dismissRec;

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDb((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    if (ownerId) supabase.from('settings').upsert({ owner_id: ownerId, ...settingsPatchToRow(patch) }).then(({ error }) => logErr('updateSettings', error));
  }, [ownerId]);

  const addNote = useCallback((text: string) => {
    const created = { id: newId('note'), text, createdAt: todayISO() };
    setDb((s) => ({ ...s, notes: [created, ...s.notes] }));
    if (ownerId) supabase.from('notes').insert(noteToRow(ownerId, created)).then(({ error }) => logErr('addNote', error));
  }, [ownerId]);
  const removeNote = useCallback((id: string) => {
    setDb((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
    if (ownerId) supabase.from('notes').delete().eq('owner_id', ownerId).eq('id', id).then(({ error }) => logErr('removeNote', error));
  }, [ownerId]);

  const exportAllDataJSON = useCallback(() => JSON.stringify(db, null, 2), [db]);

  const value = useMemo<DBContextValue>(() => ({
    db, ready, addPet, updatePet, deletePet, addClient, updateClient, deleteClient,
    addTeamMember, updateTeamMember, deleteTeamMember, addWalk, updateWalk, cancelWalk,
    addInvoice, updateInvoice, markInvoicePaid, sendInvoice, updateReport, sendReport,
    dismissRec, approveRec, updateSettings, addNote, removeNote, exportAllDataJSON, nextInvoiceNo,
  }), [db, ready, addPet, updatePet, deletePet, addClient, updateClient, deleteClient, addTeamMember, updateTeamMember, deleteTeamMember, addWalk, updateWalk, cancelWalk, addInvoice, updateInvoice, markInvoicePaid, sendInvoice, updateReport, sendReport, dismissRec, approveRec, updateSettings, addNote, removeNote, exportAllDataJSON, nextInvoiceNo]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
