import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface Header { title: string; sub: string }

const PageHeaderContext = createContext<{ header: Header; setHeader: (h: Header) => void } | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<Header>({ title: '', sub: '' });
  const value = useMemo(() => ({ header, setHeader }), [header]);
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error('usePageHeaderContext must be used within PageHeaderProvider');
  return ctx;
}

/** Call from a page component to set the top bar's title/subtitle for as long as it's mounted. */
export function usePageHeader(title: string, sub: string) {
  const { setHeader } = usePageHeaderContext();
  useEffect(() => {
    setHeader({ title, sub });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, sub]);
}
