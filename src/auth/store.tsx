import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Business } from '../db/types';
import { supabase } from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export type Role = 'owner' | 'client' | 'team';

export interface PortalIdentity {
  role: 'client' | 'team';
  id: string;
  ownerId: string;
  name: string;
}

interface AuthContextValue {
  account: Business | null; // set only when role === 'owner'
  portal: PortalIdentity | null; // set only when role is 'client' or 'team'
  role: Role | null;
  ready: boolean;
  signup: (input: { businessName: string; ownerName: string; email: string; password: string }) => Promise<AuthResult>;
  login: (input: { email: string; password: string }) => Promise<AuthResult>;
  portalSignup: (input: { email: string; password: string }) => Promise<AuthResult>;
  portalLogin: (input: { email: string; password: string }) => Promise<AuthResult>;
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

// A valid, signed-in Supabase auth user can end up with no matching
// `profiles` row — e.g. signup's profile insert failed (schema not applied
// yet, a network blip) after auth.signUp() itself already succeeded. Rather
// than leaving that account permanently stuck (authenticated, but bounced
// straight back to /login because there's no profile to load), fill in a
// reasonable default profile the first time we notice one is missing. Only
// ever called from the owner-facing login() below — never from session
// restore, or a portal (client/team) user's first-ever session would get
// mistakenly promoted to a fresh, empty business owner account.
async function ensureProfile(userId: string, email: string): Promise<Business | null> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;
  const fallbackName = email.split('@')[0] || 'My business';
  const { error } = await supabase.from('profiles').insert({ id: userId, business_name: fallbackName, owner_name: fallbackName, email });
  if (error) { console.error('[petos] ensureProfile:', error.message); return null; }
  await supabase.from('settings').insert({ owner_id: userId });
  return fetchProfile(userId);
}

interface Identity {
  role: Role | null;
  account: Business | null;
  portal: PortalIdentity | null;
}

const noIdentity: Identity = { role: null, account: null, portal: null };

async function resolveIdentity(userId: string): Promise<Identity> {
  const profile = await fetchProfile(userId);
  if (profile) return { role: 'owner', account: profile, portal: null };

  const clientRow = await supabase.from('clients').select('id,owner_id,name').eq('auth_user_id', userId).maybeSingle();
  if (clientRow.data) {
    const d = clientRow.data as { id: string; owner_id: string; name: string };
    return { role: 'client', account: null, portal: { role: 'client', id: d.id, ownerId: d.owner_id, name: d.name } };
  }

  const teamRow = await supabase.from('team_members').select('id,owner_id,name').eq('auth_user_id', userId).maybeSingle();
  if (teamRow.data) {
    const d = teamRow.data as { id: string; owner_id: string; name: string };
    return { role: 'team', account: null, portal: { role: 'team', id: d.id, ownerId: d.owner_id, name: d.name } };
  }

  return noIdentity;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Business | null>(null);
  const [portal, setPortal] = useState<PortalIdentity | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  const applyIdentity = useCallback((identity: Identity) => {
    setAccount(identity.account);
    setPortal(identity.portal);
    setRole(identity.role);
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session) {
        resolveIdentity(data.session.user.id).then((identity) => { if (!cancelled) { applyIdentity(identity); setReady(true); } });
      } else {
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        resolveIdentity(newSession.user.id).then((identity) => { if (!cancelled) applyIdentity(identity); });
      } else {
        applyIdentity(noIdentity);
      }
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [applyIdentity]);

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
    setPortal(null);
    setRole('owner');
    return { ok: true };
  }, []);

  const login = useCallback<AuthContextValue['login']>(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { ok: false, error: 'Incorrect email or password.' };
    setSession(data.session);
    const profile = await ensureProfile(data.user.id, data.user.email ?? '');
    setAccount(profile);
    setPortal(null);
    setRole(profile ? 'owner' : null);
    if (!profile) return { ok: false, error: 'Logged in, but could not load your business profile. Please try again.' };
    return { ok: true };
  }, []);

  const portalSignup = useCallback<AuthContextValue['portalSignup']>(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (error) return { ok: false, error: error.message };
    if (!data.session || !data.user) {
      return { ok: false, error: 'Account created — check your email to confirm it, then log in.' };
    }

    const { error: claimError } = await supabase.rpc('claim_portal_identity');
    if (claimError) console.error('[petos] claim_portal_identity:', claimError.message);

    setSession(data.session);
    const identity = await resolveIdentity(data.user.id);
    applyIdentity(identity);
    if (identity.role !== 'client' && identity.role !== 'team') {
      return { ok: false, error: "We couldn't find a client or team account for this email — ask your dog walker to add you first, then try again." };
    }
    return { ok: true };
  }, [applyIdentity]);

  const portalLogin = useCallback<AuthContextValue['portalLogin']>(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { ok: false, error: 'Incorrect email or password.' };
    setSession(data.session);
    const identity = await resolveIdentity(data.user.id);
    applyIdentity(identity);
    if (identity.role !== 'client' && identity.role !== 'team') {
      return { ok: false, error: "This doesn't look like a client/team account — try the business login instead." };
    }
    return { ok: true };
  }, [applyIdentity]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    applyIdentity(noIdentity);
  }, [applyIdentity]);

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
      supabase.from('messages').delete().eq('owner_id', userId),
      supabase.from('profiles').delete().eq('id', userId),
    ]);
    await supabase.auth.signOut();
    setSession(null);
    applyIdentity(noIdentity);
  }, [session, applyIdentity]);

  const value = useMemo(() => ({
    account, portal, role, ready, signup, login, portalSignup, portalLogin, logout, deleteAccount,
  }), [account, portal, role, ready, signup, login, portalSignup, portalLogin, logout, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
