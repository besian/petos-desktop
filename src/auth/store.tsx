import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Business } from '../db/types';
import { obfuscate } from './hash';

const ACCOUNTS_KEY = 'petos.accounts.v1';
const SESSION_KEY = 'petos.session.v1';

function loadAccounts(): Business[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Business[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Business[]) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch { /* storage unavailable — session stays in-memory only */ }
}

function loadSessionId(): string | null {
  try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
}

function saveSessionId(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  account: Business | null;
  ready: boolean;
  signup: (input: { businessName: string; ownerName: string; email: string; password: string }) => AuthResult;
  login: (input: { email: string; password: string }) => AuthResult;
  logout: () => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Business[]>(() => loadAccounts());
  const [sessionId, setSessionId] = useState<string | null>(() => loadSessionId());

  const account = useMemo(() => accounts.find((a) => a.id === sessionId) || null, [accounts, sessionId]);

  const signup = useCallback<AuthContextValue['signup']>(({ businessName, ownerName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!businessName.trim() || !ownerName.trim()) return { ok: false, error: 'Business name and your name are required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { ok: false, error: 'Enter a valid email address.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    if (accounts.some((a) => a.email === normalizedEmail)) return { ok: false, error: 'An account with that email already exists — try logging in instead.' };
    const newAccount: Business = {
      id: 'acct-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      businessName: businessName.trim(), ownerName: ownerName.trim(), email: normalizedEmail,
      passwordObfuscated: obfuscate(password), plan: 'Pro plan', createdAt: new Date().toISOString(),
    };
    const next = [...accounts, newAccount];
    setAccounts(next);
    saveAccounts(next);
    setSessionId(newAccount.id);
    saveSessionId(newAccount.id);
    return { ok: true };
  }, [accounts]);

  const login = useCallback<AuthContextValue['login']>(({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email === normalizedEmail);
    if (!found || found.passwordObfuscated !== obfuscate(password)) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    setSessionId(found.id);
    saveSessionId(found.id);
    return { ok: true };
  }, [accounts]);

  const logout = useCallback(() => {
    setSessionId(null);
    saveSessionId(null);
  }, []);

  const deleteAccount = useCallback(() => {
    if (!sessionId) return;
    const next = accounts.filter((a) => a.id !== sessionId);
    setAccounts(next);
    saveAccounts(next);
    try { localStorage.removeItem('petos.db.' + sessionId); } catch { /* ignore */ }
    setSessionId(null);
    saveSessionId(null);
  }, [accounts, sessionId]);

  const value = useMemo(() => ({ account, ready: true, signup, login, logout, deleteAccount }), [account, signup, login, logout, deleteAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
