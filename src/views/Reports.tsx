import { st } from '../lib/st';
import { useApp } from '../state';
import { reportDef, petColors } from '../data';
import { ImageSlot } from '../components/ImageSlot';

const repPill: Record<string, [string, string]> = {
  pending: ['Pending', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  sent: ['Sent', 'background:var(--color-success-50);color:var(--color-success-700)'],
};

export function Reports() {
  const { actions } = useApp();
  const reportRows = reportDef.map(([id, pet, route, owner, when, distance, status]) => ({
    id, initial: pet[0], pet, route, owner, when, distance,
    dot: `background:${petColors[id]}`,
    status: repPill[status][0],
    pillStyle: `font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;${repPill[status][1]}`,
  }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:16px 18px;margin-bottom:18px;display:flex;align-items:center;gap:16px')}>
        <div style={st('width:46px;height:46px;border-radius:13px;overflow:hidden;flex:none;position:relative')}>
          <ImageSlot shape="rect" fit="cover" src="/assets/pet-milo.png" placeholder="M" />
        </div>
        <div style={st('flex:1')}>
          <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-brand);margin-bottom:3px')}>1 report awaiting your approval</div>
          <div style={st('font-size:15px;font-weight:600;color:var(--fg-primary)')}>Milo · Kensington Gardens · yesterday 11:30</div>
          <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>AI-drafted from Camila’s logs — review takes about ten seconds</div>
        </div>
        <button onClick={() => actions.editReport('milo', 'reports')} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}>Edit</button>
        <button onClick={() => actions.sendReport('milo')} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Approve &amp; send</button>
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:1.6fr 1.2fr 1fr 1fr 0.8fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
          <span>Pet · route</span><span>Owner</span><span>When</span><span>Distance</span><span style={st('text-align:right')}>Status</span>
        </div>
        {reportRows.map((r) => (
          <button
            key={r.id}
            onClick={() => actions.openReport(r.id)}
            style={st('display:grid;grid-template-columns:1.6fr 1.2fr 1fr 1fr 0.8fr;align-items:center;padding:13px 20px;border-bottom:1px solid var(--border-subtle);border-left:none;border-right:none;border-top:none;background:transparent;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
          >
            <span style={st('display:flex;align-items:center;gap:11px')}>
              <span style={st(`width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex:none;${r.dot}`)}>{r.initial}</span>
              <span><span style={st('display:block;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.pet}</span><span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{r.route}</span></span>
            </span>
            <span style={st('font-size:13px;color:var(--fg-secondary)')}>{r.owner}</span>
            <span style={st('font-size:13px;color:var(--fg-secondary)')}>{r.when}</span>
            <span style={st('font-size:13px;color:var(--fg-secondary)')}>{r.distance}</span>
            <span style={st('text-align:right')}><span style={st(r.pillStyle)}>{r.status}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}
