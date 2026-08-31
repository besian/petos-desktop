import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon, EditIcon, SparkleIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';
import { btnSecondary } from '../components/Modal';

export function ReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { db, sendReport } = useDB();
  const { actions } = useUI();

  const rd = db.reports.find((r) => r.id === reportId);
  const pet = rd ? db.pets.find((p) => p.id === rd.petId) : null;
  const owner = pet ? db.clients.find((c) => c.id === pet.clientId) : null;
  const walker = rd ? db.team.find((t) => t.id === rd.walkerId) : null;

  usePageHeader('Walk report', 'Review and send');

  if (!rd || !pet) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This report no longer exists.</div>
        <button onClick={() => navigate('/reports')} style={st(btnSecondary)}>Back to reports</button>
      </div>
    );
  }

  const repPending = rd.status === 'pending';

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:820px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={() => navigate('/reports')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />Reports
        </button>
        <div style={st('flex:1')} />
        <button onClick={() => navigate(`/reports/${rd.id}/edit`)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer')}>
          <EditIcon />Edit draft
        </button>
        <button onClick={() => { sendReport(rd.id); actions.showToast('Report sent to owner'); navigate('/reports'); }} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          {repPending ? 'Approve & send' : 'Resend to owner'}
        </button>
      </div>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('padding:20px 26px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--border-subtle)')}>
          <div style={{ ...st('width:48px;height:48px;border-radius:14px;overflow:hidden;flex:none'), background: pet.color }}>
            <ImageSlot shape="rect" fit="cover" src={pet.photo} placeholder={pet.name[0]} />
          </div>
          <div style={st('flex:1')}>
            <div style={st('font-size:18px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{pet.name} · {rd.route}</div>
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>{owner?.name || '—'} · {rd.when}</div>
          </div>
          <span style={st(`font-size:11.5px;font-weight:700;padding:5px 13px;border-radius:999px;${repPending ? 'background:var(--color-warning-50);color:var(--color-warning-700)' : 'background:var(--color-success-50);color:var(--color-success-700)'}`)}>
            {repPending ? 'Pending approval' : 'Sent to owner'}
          </span>
        </div>

        {rd.include.photos ? (
          <div style={st('padding:18px 26px 4px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px')}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={st('aspect-ratio:4/3;border-radius:13px;overflow:hidden;position:relative')}>
                <ImageSlot shape="rect" fit="cover" placeholder="Walk photo" />
              </div>
            ))}
          </div>
        ) : null}

        <div style={st('padding:18px 26px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px')}>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Distance</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary);font-variant-numeric:tabular-nums')}>{rd.distance}</div></div>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Duration</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{rd.duration}</div></div>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Walker</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{walker?.name.split(' ')[0] || '—'}</div></div>
        </div>

        {rd.include.map ? (
          <div style={st('padding:0 26px 18px')}>
            <div style={st('aspect-ratio:16/6;border-radius:13px;overflow:hidden;position:relative;background:var(--bg-tertiary)')}>
              <ImageSlot shape="rect" fit="cover" placeholder="Route map" />
            </div>
          </div>
        ) : null}

        <div style={st('padding:2px 26px 18px')}>
          <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:8px')}>Summary</div>
          <p style={st('font-size:14.5px;line-height:22px;color:var(--fg-primary);margin:0;text-wrap:pretty')}>{rd.summary}</p>
        </div>

        <div style={st('padding:0 26px 22px;display:grid;grid-template-columns:1fr 1fr;gap:11px')}>
          {rd.logs.map(([label, val]) => (
            <div key={label} style={st('display:flex;align-items:flex-start;gap:11px;background:var(--bg-secondary);border-radius:12px;padding:12px 14px')}>
              <span style={{ ...st('width:8px;height:8px;border-radius:3px;flex:none;margin-top:5px'), background: pet.color }} />
              <div><div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>{label}</div><div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{val}</div></div>
            </div>
          ))}
        </div>

        <div style={st('display:flex;align-items:center;gap:10px;padding:14px 26px;border-top:1px solid var(--border-subtle);background:var(--bg-brand-subtle)')}>
          <span style={st('color:var(--fg-brand)')}><SparkleIcon size={16} /></span>
          <span style={st('font-size:12.5px;color:var(--fg-brand);font-weight:500')}>Drafted by PetOS from the walker's logs. Edit anything before it reaches the owner.</span>
        </div>
      </div>
    </div>
  );
}
