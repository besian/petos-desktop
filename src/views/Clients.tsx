import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';

export function Clients() {
  const navigate = useNavigate();
  const { db } = useDB();
  usePageHeader('Clients', `${db.clients.length} client${db.clients.length === 1 ? '' : 's'}`);

  const petsByClient = new Map<string, number>();
  const lifetimeByClient = new Map<string, number>();
  for (const pet of db.pets) petsByClient.set(pet.clientId, (petsByClient.get(pet.clientId) || 0) + 1);
  for (const inv of db.invoices) {
    if (inv.status !== 'paid') continue;
    const amt = inv.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
    lifetimeByClient.set(inv.clientId, (lifetimeByClient.get(inv.clientId) || 0) + amt);
  }

  return (
    <div style={st('animation:vIn .3s var(--ease-out);background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
      <div style={st('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
        <span>Client</span><span>Pets</span><span>Member since</span><span style={st('text-align:right')}>Lifetime</span>
      </div>
      {db.clients.length === 0 ? (
        <div style={st('padding:40px;text-align:center;font-size:13.5px;color:var(--fg-tertiary)')}>No clients yet — add a pet to create one.</div>
      ) : db.clients.map((c) => (
        <button
          key={c.id}
          onClick={() => navigate(`/clients/${c.id}`)}
          style={st('display:grid;grid-template-columns:2fr 1fr 1fr 1fr;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border-subtle);background:transparent;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
        >
          <span style={st('display:flex;align-items:center;gap:12px;min-width:0')}>
            <span style={st('width:40px;height:40px;border-radius:999px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex:none')}>{c.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
            <span style={st('min-width:0')}>
              <span style={st('display:block;font-size:14px;font-weight:600;color:var(--fg-primary)')}>{c.name}</span>
              <span style={st('display:block;font-size:12px;color:var(--fg-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{c.addressLine1}</span>
            </span>
          </span>
          <span style={st('font-size:13.5px;color:var(--fg-secondary)')}>{petsByClient.get(c.id) || 0}</span>
          <span style={st('font-size:13px;color:var(--fg-secondary)')}>{c.memberSince}</span>
          <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary);text-align:right')}>£{(lifetimeByClient.get(c.id) || 0).toFixed(0)}</span>
        </button>
      ))}
    </div>
  );
}
