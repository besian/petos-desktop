import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useAuth } from '../auth/store';
import { supabase } from '../lib/supabase';
import { ChatThread } from '../components/ChatThread';
import { PawIcon, LogoutIcon } from '../components/icons';
import { LoadingScreen } from '../components/LoadingScreen';

export function PortalLayout() {
  const { role, portal, ready, logout } = useAuth();
  const [businessName, setBusinessName] = useState('your dog walker');

  useEffect(() => {
    if (!portal) return;
    let cancelled = false;
    supabase.from('profiles').select('business_name').eq('id', portal.ownerId).maybeSingle().then(({ data }) => {
      if (!cancelled && data?.business_name) setBusinessName(data.business_name as string);
    });
    return () => { cancelled = true; };
  }, [portal]);

  if (!ready) return <LoadingScreen />;
  if (role === 'owner') return <Navigate to="/" replace />;
  if (!portal) return <Navigate to="/portal/login" replace />;

  return (
    <div style={st('height:100vh;width:100vw;display:flex;flex-direction:column;background:var(--bg-app)')}>
      <div style={st('height:60px;flex:none;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:11px;padding:0 18px;background:var(--bg-primary)')}>
        <div style={st('width:32px;height:32px;border-radius:9px;background:var(--brand-primary);display:flex;align-items:center;justify-content:center;color:#fff;flex:none')}><PawIcon size={17} /></div>
        <div style={st('flex:1;min-width:0')}>
          <div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{businessName}</div>
          <div style={st('font-size:11.5px;color:var(--fg-tertiary)')}>Chatting as {portal.name}</div>
        </div>
        <button onClick={() => logout()} style={st('background:transparent;border:none;color:var(--fg-tertiary);cursor:pointer;padding:6px;display:flex')}>
          <LogoutIcon />
        </button>
      </div>
      <div style={st('flex:1;min-height:0;max-width:640px;width:100%;margin:0 auto')}>
        <ChatThread
          ownerId={portal.ownerId}
          threadType={portal.role}
          threadId={portal.id}
          myRole={portal.role}
          counterpartName={businessName}
        />
      </div>
    </div>
  );
}
