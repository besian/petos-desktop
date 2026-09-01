import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useAuth } from '../auth/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon } from '../components/icons';
import { ChatThread } from '../components/ChatThread';
import { btnSecondary } from '../components/Modal';
import { sendEmail, inviteEmailHtml } from '../lib/email';

export function ClientChat() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { db } = useDB();
  const { account } = useAuth();
  const { actions } = useUI();
  const [inviting, setInviting] = useState(false);

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

  const sendInvite = async () => {
    setInviting(true);
    const businessName = account.businessName || 'PetOS';
    const link = `${window.location.origin}/portal/signup?email=${encodeURIComponent(client.email)}`;
    const result = await sendEmail({
      to: client.email,
      subject: `${businessName} invited you to chat`,
      html: inviteEmailHtml(
        `Hi ${client.name.split(' ')[0]},`,
        `${account.ownerName || businessName} would like to chat with you directly. Set up your account below — it takes a minute.`,
        link,
        'Set up chat access',
        `— ${account.ownerName || businessName}`
      ),
      replyTo: account.email,
    });
    setInviting(false);
    actions.showToast(result.ok ? `Invite sent to ${client.name}` : result.error || 'Could not send invite');
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:640px;margin:0 auto;height:calc(100vh - 140px);display:flex;flex-direction:column')}>
      <button onClick={() => navigate(`/clients/${client.id}`)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:14px;flex:none;align-self:flex-start')}>
        <ChevronLeftIcon />{client.name}
      </button>
      {!client.authUserId ? (
        <div style={st('display:flex;align-items:center;gap:12px;background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:12px;padding:11px 14px;margin-bottom:12px;flex:none')}>
          <div style={st('flex:1;font-size:12.5px;color:var(--fg-brand)')}>{client.name} hasn't joined chat yet. Messages you send now will be waiting for them once they do.</div>
          <button
            onClick={sendInvite}
            disabled={inviting}
            style={st(`flex:none;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer;${inviting ? 'opacity:.65' : ''}`)}
          >
            {inviting ? 'Sending…' : 'Invite to chat'}
          </button>
        </div>
      ) : null}
      <div style={st('flex:1;min-height:0;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <ChatThread ownerId={account.id} threadType="client" threadId={client.id} myRole="owner" counterpartName={client.name} />
      </div>
    </div>
  );
}
