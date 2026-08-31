import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Business } from '../db/types';
import { supabase } from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  account: Business | null;
  ready: boolean;
  signup: (input: { businessName: string; ownerName: string; email: string; password: string }) => Promise<AuthResult>;
  login: (input: { email: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileRow {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  plan: string;
  invoice_counter: number;
  created_at: string;
}

function toBusiness(profile: ProfileRow): Business {
  return {
    id: profile.id,
    businessName: profile.business_name,
    ownerName: profile.owner_name,
    email: profile.email,
    plan: profile.plan,
    createdAt: profile.created_at,
  };
}

async function fetchProfile(userId: string): Promise<Business | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return toBusiness(data as ProfileRow);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Business | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session) {
        fetchProfile(data.session.user.id).then((profile) => { if (!cancelled) { setAccount(profile); setReady(true); } });
      } else {
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id).then((profile) => { if (!cancelled) setAccount(profile); });
      } else {
        setAccount(null);
      }
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const signup = useCallback<AuthContextValue['signup']>(async ({ businessName, ownerName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!businessName.trim() || !ownerName.trim()) return { ok: false, error: 'Business name and your name are required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (error) return { ok: false, error: error.message };
    if (!data.session || !data.user) {
      return { ok: false, error: 'Account created — check your email to confirm it, then log in. (If this is your own Supabase project, you can turn off "Confirm email" in Authentication settings for instant access.)' };
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      email: normalizedEmail,
    });
    if (profileError) return { ok: false, error: profileError.message };

    await supabase.from('settings').insert({ owner_id: data.user.id });

    setSession(data.session);
    setAccount(await fetchProfile(data.user.id));
    return { ok: true };
  }, []);

  const login = useCallback<AuthContextValue['login']>(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { ok: false, error: 'Incorrect email or password.' };
    setSession(data.session);
    setAccount(await fetchProfile(data.user.id));
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAccount(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!session) return;
    // No server-side admin key on the client, so we can't delete the
    // auth.users row itself — but we can wipe every row this account owns
    // and sign out. (A real deployment would run this as a Supabase Edge
    // Function with the service role key to also remove the login.)
    const userId = session.user.id;
    await Promise.all([
      supabase.from('pets').delete().eq('owner_id', userId),
      supabase.from('clients').delete().eq('owner_id', userId),
      supabase.from('team_members').delete().eq('owner_id', userId),
      supabase.from('walks').delete().eq('owner_id', userId),
      supabase.from('invoices').delete().eq('owner_id', userId),
      supabase.from('reports').delete().eq('owner_id', userId),
      supabase.from('recs').delete().eq('owner_id', userId),
      supabase.from('notes').delete().eq('owner_id', userId),
      supabase.from('settings').delete().eq('owner_id', userId),
      supabase.from('profiles').delete().eq('id', userId),
    ]);
    await supabase.auth.signOut();
    setSession(null);
    setAccount(null);
  }, [session]);

  const value = useMemo(() => ({ account, ready, signup, login, logout, deleteAccount }), [account, ready, signup, login, logout, deleteAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
