import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useAuth } from '../auth/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon } from '../components/icons';
import { ChatThread } from '../components/ChatThread';
import { btnSecondary } from '../components/Modal';

export function ClientChat() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { db } = useDB();
  const { account } = useAuth();

  const client = db.clients.find((c) => c.id === clientId);
  usePageHeader('Chat', client?.name || 'Not found');

  if (!client || !account) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This client no longer exists.</div>
        <button onClick={() => navigate('/clients')} style={st(btnSecondary)}>Back to clients</button>
      </div>
    );
  }

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:640px;margin:0 auto;height:calc(100vh - 140px);display:flex;flex-direction:column')}>
      <button onClick={() => navigate(`/clients/${client.id}`)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:14px;flex:none;align-self:flex-start')}>
        <ChevronLeftIcon />{client.name}
      </button>
      {!client.authUserId ? (
        <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:12px;padding:11px 14px;margin-bottom:12px;font-size:12.5px;color:var(--fg-brand);flex:none')}>
          {client.name} hasn't joined chat yet — they can sign up at your app's <strong>/portal/signup</strong> using {client.email}. Messages you send now will be waiting for them.
        </div>
      ) : null}
      <div style={st('flex:1;min-height:0;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <ChatThread ownerId={account.id} threadType="client" threadId={client.id} myRole="owner" counterpartName={client.name} />
      </div>
    </div>
  );
}
