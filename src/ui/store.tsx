import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface CopilotMessage {
  role: 'ai' | 'user';
  text: string;
}

export interface CopilotResultRow {
  petId?: string;
  color: string;
  initial: string;
  name: string;
  sub: string;
}

export interface UIState {
  theme: Theme;
  copilotOpen: boolean;
  copilotThread: CopilotMessage[];
  copilotResult: CopilotResultRow[] | null;
  search: string;
  toast: string;
  overviewEdit: boolean;
  overviewOrder: string[];
  overviewHidden: string[];
  scheduleFilter: string;
}

const initialState: UIState = {
  theme: 'light',
  copilotOpen: true,
  copilotThread: [{ role: 'ai', text: 'Morning! Ask me anything about the business.' }],
  copilotResult: null,
  search: '',
  toast: '',
  overviewEdit: false,
  overviewOrder: ['briefing', 'kpis', 'operations', 'revenue', 'attention'],
  overviewHidden: ['team', 'weather', 'notes'],
  scheduleFilter: 'all',
};

interface UIActions {
  setTheme: (mode: Theme) => void;
  toggleCopilot: () => void;
  setSearch: (v: string) => void;
  showToast: (msg: string) => void;
  toggleOverviewEdit: () => void;
  setOverviewOrder: (order: string[]) => void;
  hideWidget: (id: string) => void;
  showWidget: (id: string) => void;
  setScheduleFilter: (key: string) => void;
  pushCopilotUser: (text: string) => void;
  pushCopilotAI: (text: string, rows: CopilotResultRow[] | null) => void;
}

const UIContext = createContext<{ state: UIState; actions: UIActions } | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setState((s) => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState((s) => ({ ...s, toast: '' })), 2400);
  }, []);

  const actions = useMemo<UIActions>(() => ({
    setTheme: (mode) => setState((s) => ({ ...s, theme: mode })),
    toggleCopilot: () => setState((s) => ({ ...s, copilotOpen: !s.copilotOpen })),
    setSearch: (v) => setState((s) => ({ ...s, search: v })),
    showToast,
    toggleOverviewEdit: () => setState((s) => ({ ...s, overviewEdit: !s.overviewEdit })),
    setOverviewOrder: (order) => setState((s) => ({ ...s, overviewOrder: order })),
    hideWidget: (id) => setState((s) => ({ ...s, overviewOrder: s.overviewOrder.filter((w) => w !== id), overviewHidden: [...s.overviewHidden, id] })),
    showWidget: (id) => setState((s) => ({ ...s, overviewHidden: s.overviewHidden.filter((w) => w !== id), overviewOrder: [...s.overviewOrder, id] })),
    setScheduleFilter: (key) => setState((s) => ({ ...s, scheduleFilter: key })),
    pushCopilotUser: (text) => setState((s) => ({ ...s, copilotThread: [...s.copilotThread, { role: 'user', text }], copilotResult: null })),
    pushCopilotAI: (text, rows) => setState((s) => ({ ...s, copilotThread: [...s.copilotThread, { role: 'ai', text }], copilotResult: rows })),
  }), [showToast]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
