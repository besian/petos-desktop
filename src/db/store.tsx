import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DB, Pet, Client, TeamMember, Walk, Invoice, Report, Settings, InvoiceItem } from './types';
import { buildSeed } from './seed';
import { useAuth } from '../auth/store';
import { todayISO } from './dates';

function dbKey(accountId: string) {
  return 'petos.db.' + accountId;
}

function loadDB(accountId: string): DB {
  try {
    const raw = localStorage.getItem(dbKey(accountId));
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* fall through to a fresh seed */ }
  const seeded = buildSeed();
  try { localStorage.setItem(dbKey(accountId), JSON.stringify(seeded)); } catch { /* storage unavailable */ }
  return seeded;
}

function saveDB(accountId: string, db: DB) {
  try { localStorage.setItem(dbKey(accountId), JSON.stringify(db)); } catch { /* storage unavailable — changes stay in-memory only for this tab */ }
}

function newId(prefix: string) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

interface DBContextValue {
  db: DB;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Pet;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => TeamMember;
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addWalk: (walk: Omit<Walk, 'id' | 'createdAt' | 'status'>) => Walk;
  updateWalk: (id: string, patch: Partial<Walk>) => void;
  cancelWalk: (id: string) => void;
  addInvoice: (input: { clientId: string; petId: string; items: InvoiceItem[]; dueInDays?: number }) => Invoice;
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
  const accountId = account?.id;
  const [db, setDb] = useState<DB>(() => (accountId ? loadDB(accountId) : buildSeed()));

  useEffect(() => {
    if (accountId) setDb(loadDB(accountId));
  }, [accountId]);

  useEffect(() => {
    if (accountId) saveDB(accountId, db);
  }, [accountId, db]);

  const addPet = useCallback((pet: Omit<Pet, 'id' | 'createdAt'>) => {
    const created: Pet = { ...pet, id: newId('pet'), createdAt: todayISO() };
    setDb((s) => ({ ...s, pets: [...s.pets, created] }));
    return created;
  }, []);
  const updatePet = useCallback((id: string, patch: Partial<Pet>) => {
    setDb((s) => ({ ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, []);
  const deletePet = useCallback((id: string) => {
    setDb((s) => ({ ...s, pets: s.pets.filter((p) => p.id !== id), walks: s.walks.filter((w) => w.petId !== id) }));
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const created: Client = { ...client, id: newId('client'), createdAt: todayISO() };
    setDb((s) => ({ ...s, clients: [...s.clients, created] }));
    return created;
  }, []);
  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setDb((s) => ({ ...s, clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);
  const deleteClient = useCallback((id: string) => {
    setDb((s) => {
      const petIds = new Set(s.pets.filter((p) => p.clientId === id).map((p) => p.id));
      return {
        ...s,
        clients: s.clients.filter((c) => c.id !== id),
        pets: s.pets.filter((p) => p.clientId !== id),
        walks: s.walks.filter((w) => !petIds.has(w.petId)),
      };
    });
  }, []);

  const addTeamMember = useCallback((member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const created: TeamMember = { ...member, id: newId('team'), createdAt: todayISO() };
    setDb((s) => ({ ...s, team: [...s.team, created] }));
    return created;
  }, []);
  const updateTeamMember = useCallback((id: string, patch: Partial<TeamMember>) => {
    setDb((s) => ({ ...s, team: s.team.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  }, []);
  const deleteTeamMember = useCallback((id: string) => {
    setDb((s) => ({ ...s, team: s.team.filter((m) => m.id !== id), walks: s.walks.map((w) => (w.walkerId === id ? { ...w, walkerId: '' } : w)) }));
  }, []);

  const addWalk = useCallback((walk: Omit<Walk, 'id' | 'createdAt' | 'status'>) => {
    const created: Walk = { ...walk, id: newId('walk'), status: 'scheduled', createdAt: todayISO() };
    setDb((s) => ({ ...s, walks: [...s.walks, created] }));
    return created;
  }, []);
  const updateWalk = useCallback((id: string, patch: Partial<Walk>) => {
    setDb((s) => ({ ...s, walks: s.walks.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));
  }, []);
  const cancelWalk = useCallback((id: string) => {
    setDb((s) => ({ ...s, walks: s.walks.map((w) => (w.id === id ? { ...w, status: 'cancelled' } : w)) }));
  }, []);

  const nextInvoiceNo = useCallback(() => 'CDC-' + (db.invoiceCounter + 1), [db.invoiceCounter]);

  const addInvoice = useCallback((input: { clientId: string; petId: string; items: InvoiceItem[]; dueInDays?: number }) => {
    let created!: Invoice;
    setDb((s) => {
      const no = 'CDC-' + (s.invoiceCounter + 1);
      created = {
        id: no, clientId: input.clientId, petId: input.petId, items: input.items,
        issued: todayISO(), due: todayISO(), status: 'draft', createdAt: todayISO(),
      };
      return { ...s, invoices: [...s.invoices, created], invoiceCounter: s.invoiceCounter + 1 };
    });
    return created;
  }, []);
  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }, []);
  const markInvoicePaid = useCallback((id: string) => {
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: 'paid', paidOn: todayISO() } : i)) }));
  }, []);
  const sendInvoice = useCallback((id: string) => {
    setDb((s) => ({ ...s, invoices: s.invoices.map((i) => (i.id === id && i.status !== 'paid' ? { ...i, status: 'outstanding' } : i)) }));
  }, []);

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setDb((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }, []);
  const sendReport = useCallback((id: string) => {
    setDb((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, status: 'sent' } : r)) }));
  }, []);

  const dismissRec = useCallback((id: string) => {
    setDb((s) => ({ ...s, recs: s.recs.map((r) => (r.id === id ? { ...r, dismissed: true } : r)) }));
  }, []);
  const approveRec = useCallback((id: string) => {
    setDb((s) => ({ ...s, recs: s.recs.map((r) => (r.id === id ? { ...r, dismissed: true } : r)) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDb((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const addNote = useCallback((text: string) => {
    setDb((s) => ({ ...s, notes: [{ id: newId('note'), text, createdAt: todayISO() }, ...s.notes] }));
  }, []);
  const removeNote = useCallback((id: string) => {
    setDb((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  const exportAllDataJSON = useCallback(() => JSON.stringify(db, null, 2), [db]);

  const value = useMemo<DBContextValue>(() => ({
    db, addPet, updatePet, deletePet, addClient, updateClient, deleteClient,
    addTeamMember, updateTeamMember, deleteTeamMember, addWalk, updateWalk, cancelWalk,
    addInvoice, updateInvoice, markInvoicePaid, sendInvoice, updateReport, sendReport,
    dismissRec, approveRec, updateSettings, addNote, removeNote, exportAllDataJSON, nextInvoiceNo,
  }), [db, addPet, updatePet, deletePet, addClient, updateClient, deleteClient, addTeamMember, updateTeamMember, deleteTeamMember, addWalk, updateWalk, cancelWalk, addInvoice, updateInvoice, markInvoicePaid, sendInvoice, updateReport, sendReport, dismissRec, approveRec, updateSettings, addNote, removeNote, exportAllDataJSON, nextInvoiceNo]);

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error('useDB must be used within DBProvider');
  return ctx;
}
