import { st } from '../lib/st';
import { useApp } from '../state';
import { reportData, petColors } from '../data';
import { ChevronLeftIcon, EditIcon, SparkleIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';

export function ReportView() {
  const { state, actions } = useApp();
  const rdId = reportData[state.reportId] ? state.reportId : 'milo';
  const rd = reportData[rdId];
  const repPending = rd.status === 'pending';
  const logDotStyle = `width:8px;height:8px;border-radius:3px;flex:none;background:${petColors[rdId]}`;
  const showPhotos = !!state.repInclude.photos;
  const showMap = !!state.repInclude.map;
  const photos = [1, 2, 3].map((n) => ({ id: `rep-${rdId}-${n}` }));
  const primaryLabel = repPending ? 'Approve & send' : 'Resend to owner';

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:820px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={() => actions.go('reports')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />Reports
        </button>
        <div style={st('flex:1')} />
        <button onClick={() => actions.editReport(rdId, 'reportview')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer')}>
          <EditIcon />Edit draft
        </button>
        <button onClick={() => actions.sendReport(rdId)} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          {primaryLabel}
        </button>
      </div>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('padding:20px 26px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--border-subtle)')}>
          <div style={{ ...st('width:48px;height:48px;border-radius:14px;overflow:hidden;flex:none'), background: petColors[rdId] }}>
            <ImageSlot shape="rect" fit="cover" placeholder={rd.petName[0]} />
          </div>
          <div style={st('flex:1')}>
            <div style={st('font-size:18px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{rd.petName} · {rd.route}</div>
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>{rd.owner} · {rd.when}</div>
          </div>
          <span style={st(`font-size:11.5px;font-weight:700;padding:5px 13px;border-radius:999px;${repPending ? 'background:var(--color-warning-50);color:var(--color-warning-700)' : 'background:var(--color-success-50);color:var(--color-success-700)'}`)}>
            {repPending ? 'Pending approval' : 'Sent to owner'}
          </span>
        </div>

        {showPhotos ? (
          <div style={st('padding:18px 26px 4px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px')}>
            {photos.map((p) => (
              <div key={p.id} style={st('aspect-ratio:4/3;border-radius:13px;overflow:hidden;position:relative')}>
                <ImageSlot shape="rect" fit="cover" placeholder="Walk photo" />
              </div>
            ))}
          </div>
        ) : null}

        <div style={st('padding:18px 26px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px')}>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Distance</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary);font-variant-numeric:tabular-nums')}>{rd.distance}</div></div>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Duration</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{rd.duration}</div></div>
          <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 15px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Walker</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{rd.walker}</div></div>
        </div>

        {showMap ? (
          <div style={st('padding:0 26px 18px')}>
            <div style={st('aspect-ratio:16/6;border-radius:13px;overflow:hidden;position:relative;background:var(--bg-tertiary)')}>
              <ImageSlot shape="rect" fit="cover" placeholder="Route map" />
            </div>
          </div>
        ) : null}

        <div style={st('padding:2px 26px 18px')}>
          <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:8px')}>Summary</div>
          <p style={st('font-size:14.5px;line-height:22px;color:var(--fg-primary);margin:0;text-wrap:pretty')}>{state.repText || rd.summary}</p>
        </div>

        <div style={st('padding:0 26px 22px;display:grid;grid-template-columns:1fr 1fr;gap:11px')}>
          {rd.logs.map(([label, val]) => (
            <div key={label} style={st('display:flex;align-items:flex-start;gap:11px;background:var(--bg-secondary);border-radius:12px;padding:12px 14px')}>
              <span style={st(`margin-top:5px;${logDotStyle}`)} />
              <div><div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>{label}</div><div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{val}</div></div>
            </div>
          ))}
        </div>

        <div style={st('display:flex;align-items:center;gap:10px;padding:14px 26px;border-top:1px solid var(--border-subtle);background:var(--bg-brand-subtle)')}>
          <span style={st('color:var(--fg-brand)')}><SparkleIcon size={16} /></span>
          <span style={st('font-size:12.5px;color:var(--fg-brand);font-weight:500')}>Drafted by PetOS from the walker’s logs. Edit anything before it reaches the owner.</span>
        </div>
      </div>
    </div>
  );
}
