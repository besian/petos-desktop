import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ViewKey } from './data';
import { reportData } from './data';

export type Theme = 'light' | 'dark';

export interface CopilotMessage {
  role: 'ai' | 'user';
  text: string;
}

export interface CopilotResultRow {
  pet: string;
  initial: string;
  name: string;
  sub: string;
}

export interface RepInclude {
  photos: boolean;
  map: boolean;
  behaviour: boolean;
  water: boolean;
}

export interface SettingsToggles {
  autoDecline: boolean;
  autoDraft: boolean;
  requireApproval: boolean;
  autoCharge: boolean;
  overdueReminders: boolean;
}

export interface AppState {
  overviewEdit: boolean;
  overviewOrder: string[];
  overviewHidden: string[];
  settingsToggles: SettingsToggles;
  theme: Theme;
  view: ViewKey;
  copilotOpen: boolean;
  copilotThread: CopilotMessage[];
  copilotResult: CopilotResultRow[] | null;
  filters: string[];
  newWalkOpen: boolean;
  nwPet: string;
  nwDay: number;
  nwTime: string;
  nwDur: number;
  nwRepeat: boolean;
  toast: string;
  invoiceNo: string;
  reportId: string;
  reportFrom: 'reports' | 'reportview';
  repTone: 'warm' | 'brief' | 'detailed';
  repInclude: RepInclude;
  repText: string;
  selectedMember: string;
  search: string;
  sentIds: string[];
  paidIds: string[];
}

const initialState: AppState = {
  overviewEdit: false,
  overviewOrder: ['briefing', 'kpis', 'operations', 'revenue', 'attention'],
  overviewHidden: ['team', 'weather', 'notes'],
  settingsToggles: { autoDecline: true, autoDraft: true, requireApproval: true, autoCharge: true, overdueReminders: true },
  theme: 'light',
  view: 'overview',
  copilotOpen: true,
  copilotThread: [{ role: 'ai', text: 'Morning, Sarah. Quiet day ahead — everything’s covered. Ask me anything about the business.' }],
  copilotResult: null,
  filters: ['all'],
  newWalkOpen: false,
  nwPet: 'bella',
  nwDay: 3,
  nwTime: '09:00',
  nwDur: 60,
  nwRepeat: true,
  toast: '',
  invoiceNo: 'CDC-1044',
  reportId: 'milo',
  reportFrom: 'reports',
  repTone: 'warm',
  repInclude: { photos: true, map: true, behaviour: true, water: true },
  repText: '',
  selectedMember: 'sarah',
  search: '',
  sentIds: [],
  paidIds: [],
};

const petNamesForToast: Record<string, string> = { bella: 'Bella', oscar: 'Oscar', milo: 'Milo', luna: 'Luna', charlie: 'Charlie' };

interface AppActions {
  go: (view: ViewKey) => void;
  toggleOverviewEdit: () => void;
  toggleSetting: (key: keyof SettingsToggles) => void;
  moveWidget: (id: string, dir: 1 | -1) => void;
  hideWidget: (id: string) => void;
  showWidget: (id: string) => void;
  setSearch: (v: string) => void;
  searchOpen: (no: string) => void;
  searchClient: () => void;
  markPaid: (no: string) => void;
  sendInvoice: (no: string, label: string, client: string) => void;
  openMember: (key: string) => void;
  openInvoice: (no: string) => void;
  openReport: (id: string) => void;
  editReport: (id: string, from?: 'reports' | 'reportview') => void;
  sendReport: (id: string) => void;
  newWalkAdd: () => void;
  setTheme: (mode: Theme) => void;
  toggleCopilot: () => void;
  askCopilot: (q: string, kind: 'unpaid' | 'meds' | 'space' | 'default') => void;
  openNewWalk: () => void;
  closeNewWalk: () => void;
  setNwPet: (id: string) => void;
  setNwDay: (i: number) => void;
  setNwTime: (t: string) => void;
  setNwDur: (mins: number) => void;
  toggleNwRepeat: () => void;
  setFilter: (key: string) => void;
  setRepTone: (k: 'warm' | 'brief' | 'detailed') => void;
  setRepText: (t: string) => void;
  toggleRepInclude: (key: keyof RepInclude) => void;
  showToast: (msg: string) => void;
  noop: () => void;
  saveDraft: () => void;
  goBackFromEdit: () => void;
}

const AppContext = createContext<{ state: AppState; actions: AppActions } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: '' })), 2200);
  }, []);

  const actions = useMemo<AppActions>(() => ({
    go: (view) => setState((s) => ({ ...s, view })),
    toggleOverviewEdit: () => setState((s) => ({ ...s, overviewEdit: !s.overviewEdit })),
    toggleSetting: (key) => setState((s) => ({ ...s, settingsToggles: { ...s.settingsToggles, [key]: !s.settingsToggles[key] } })),
    moveWidget: (id, dir) => setState((s) => {
      const order = [...s.overviewOrder];
      const i = order.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return s;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...s, overviewOrder: order };
    }),
    hideWidget: (id) => setState((s) => ({ ...s, overviewOrder: s.overviewOrder.filter((w) => w !== id), overviewHidden: [...s.overviewHidden, id] })),
    showWidget: (id) => setState((s) => ({ ...s, overviewHidden: s.overviewHidden.filter((w) => w !== id), overviewOrder: [...s.overviewOrder, id] })),
    setSearch: (v) => setState((s) => ({ ...s, search: v })),
    searchOpen: (no) => setState((s) => ({ ...s, search: '', invoiceNo: no, view: 'invoice' })),
    searchClient: () => setState((s) => ({ ...s, search: '', view: 'client' })),
    markPaid: (no) => {
      setState((s) => (s.paidIds.includes(no) ? s : { ...s, paidIds: [...s.paidIds, no] }));
      showToast('Marked as paid');
    },
    sendInvoice: (no, label, client) => {
      setState((s) => (s.sentIds.includes(no) ? s : { ...s, sentIds: [...s.sentIds, no] }));
      showToast(label + ' · ' + client);
    },
    openMember: (key) => setState((s) => ({ ...s, view: 'teammember', selectedMember: key })),
    openInvoice: (no) => setState((s) => ({ ...s, view: 'invoice', invoiceNo: no })),
    openReport: (id) => setState((s) => ({ ...s, view: 'reportview', reportId: id })),
    editReport: (id, from) => setState((s) => {
      const rd = reportData[id] || reportData.milo;
      const t = s.repTone;
      const txt = (rd.tones && rd.tones[t]) || rd.summary;
      return { ...s, view: 'reportedit', reportId: id, reportFrom: from || 'reportview', repText: txt };
    }),
    sendReport: (_id) => {
      setState((s) => ({ ...s, view: 'reports' }));
      showToast('Report sent to owner');
    },
    newWalkAdd: () => {
      setState((s) => {
        const p = petNamesForToast[s.nwPet];
        showToast(p + ' added' + (s.nwRepeat ? ' · weekly' : ''));
        return { ...s, newWalkOpen: false };
      });
    },
    setTheme: (mode) => setState((s) => ({ ...s, theme: mode })),
    toggleCopilot: () => setState((s) => ({ ...s, copilotOpen: !s.copilotOpen })),
    askCopilot: (q, kind) => {
      setState((s) => ({ ...s, copilotThread: [...s.copilotThread, { role: 'user', text: q }], copilotResult: null }));
      setTimeout(() => {
        const answers: Record<string, { text: string; rows: CopilotResultRow[] | null }> = {
          unpaid: { text: '2 invoices are outstanding and 1 is overdue. James Okafor is 6 days late — want me to send a reminder?', rows: [{ pet: 'hugo', initial: 'JO', name: 'James Okafor', sub: '£20 · 6 days overdue' }, { pet: 'milo', initial: 'CD', name: 'Camila Duarte', sub: '£20 · due Friday' }] },
          meds: { text: 'Three dogs have medical or care instructions on file:', rows: [{ pet: 'oscar', initial: 'O', name: 'Oscar', sub: 'Back care — no stairs or jumping' }, { pet: 'luna', initial: 'L', name: 'Luna', sub: 'Joint supplement (daily)' }, { pet: 'hugo', initial: 'H', name: 'Hugo', sub: 'Heat sensitive — avoid midday' }] },
          space: { text: 'Next Thursday has 3 open slots: 09:00, 12:30 and 16:00. The 12:30 is near two Chelsea regulars — easy to fill.', rows: null },
          default: { text: 'Today is fully covered. Looking ahead: 3 open slots next Thursday and one client drifting toward churn. Want me to draft a re-booking note?', rows: null },
        };
        const a = answers[kind];
        setState((s) => ({ ...s, copilotThread: [...s.copilotThread, { role: 'ai', text: a.text }], copilotResult: a.rows }));
      }, 700);
    },
    openNewWalk: () => setState((s) => ({ ...s, newWalkOpen: true })),
    closeNewWalk: () => setState((s) => ({ ...s, newWalkOpen: false })),
    setNwPet: (id) => setState((s) => ({ ...s, nwPet: id })),
    setNwDay: (i) => setState((s) => ({ ...s, nwDay: i })),
    setNwTime: (t) => setState((s) => ({ ...s, nwTime: t })),
    setNwDur: (mins) => setState((s) => ({ ...s, nwDur: mins })),
    toggleNwRepeat: () => setState((s) => ({ ...s, nwRepeat: !s.nwRepeat })),
    setFilter: (key) => setState((s) => ({ ...s, filters: [key] })),
    setRepTone: (k) => setState((s) => {
      const rd = reportData[s.reportId] || reportData.milo;
      return { ...s, repTone: k, repText: (rd.tones && rd.tones[k]) || rd.summary };
    }),
    setRepText: (t) => setState((s) => ({ ...s, repText: t })),
    toggleRepInclude: (key) => setState((s) => ({ ...s, repInclude: { ...s.repInclude, [key]: !s.repInclude[key] } })),
    showToast,
    noop: () => showToast('Prototype — action stubbed'),
    saveDraft: () => {
      setState((s) => ({ ...s, view: s.reportFrom === 'reports' ? 'reports' : 'reportview' }));
      showToast('Changes saved');
    },
    goBackFromEdit: () => setState((s) => ({ ...s, view: s.reportFrom === 'reports' ? 'reports' : 'reportview' })),
  }), [showToast]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
