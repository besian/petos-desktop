import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { ImageSlot } from '../components/ImageSlot';

const repPill: Record<string, [string, string]> = {
  pending: ['Pending', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  sent: ['Sent', 'background:var(--color-success-50);color:var(--color-success-700)'],
};

export function Reports() {
  const navigate = useNavigate();
  const { db, sendReport } = useDB();
  usePageHeader('Reports', 'Sent and pending walk reports');

  const petById = new Map(db.pets.map((p) => [p.id, p]));
  const clientById = new Map(db.clients.map((c) => [c.id, c]));
  const reports = [...db.reports].sort((a, b) => (a.status === b.status ? 0 : a.status === 'pending' ? -1 : 1));
  const firstPending = db.reports.find((r) => r.status === 'pending');
  const firstPendingPet = firstPending ? petById.get(firstPending.petId) : null;

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      {firstPending && firstPendingPet ? (
        <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:16px 18px;margin-bottom:18px;display:flex;align-items:center;gap:16px')}>
          <div style={{ ...st('width:46px;height:46px;border-radius:13px;overflow:hidden;flex:none;position:relative'), background: firstPendingPet.color }}>
            <ImageSlot shape="rect" fit="cover" src={firstPendingPet.photo} placeholder={firstPendingPet.name[0]} />
          </div>
          <div style={st('flex:1')}>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-brand);margin-bottom:3px')}>1 report awaiting your approval</div>
            <div style={st('font-size:15px;font-weight:600;color:var(--fg-primary)')}>{firstPendingPet.name} · {firstPending.route} · {firstPending.when}</div>
            <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>AI-drafted — review takes about ten seconds</div>
          </div>
          <button onClick={() => navigate(`/reports/${firstPending.id}/edit`)} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}>Edit</button>
          <button onClick={() => sendReport(firstPending.id)} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Approve &amp; send</button>
        </div>
      ) : null}
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:1.6fr 1.2fr 1fr 1fr 0.8fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
          <span>Pet · route</span><span>Owner</span><span>When</span><span>Distance</span><span style={st('text-align:right')}>Status</span>
        </div>
        {reports.length === 0 ? (
          <div style={st('padding:40px;text-align:center;font-size:13.5px;color:var(--fg-tertiary)')}>No reports yet.</div>
        ) : reports.map((r) => {
          const pet = petById.get(r.petId);
          const owner = pet ? clientById.get(pet.clientId) : null;
          return (
            <button
              key={r.id}
              onClick={() => navigate(`/reports/${r.id}`)}
              style={st('display:grid;grid-template-columns:1.6fr 1.2fr 1fr 1fr 0.8fr;align-items:center;padding:13px 20px;border-bottom:1px solid var(--border-subtle);border-left:none;border-right:none;border-top:none;background:transparent;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
            >
              <span style={st('display:flex;align-items:center;gap:11px')}>
                <span style={{ ...st('width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex:none'), background: pet?.color }}>{pet?.name[0]}</span>
                <span><span style={st('display:block;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{pet?.name}</span><span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{r.route}</span></span>
              </span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{owner?.name || '—'}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{r.when}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{r.distance}</span>
              <span style={st('text-align:right')}><span style={st(`font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;${repPill[r.status][1]}`)}>{repPill[r.status][0]}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
