import { st } from '../lib/st';
import { useApp, type RepInclude } from '../state';
import { reportData, petColors } from '../data';
import { ChevronLeftIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';

const rTogOn = 'width:38px;height:22px;border-radius:99px;background:var(--brand-primary);display:inline-flex;align-items:center;padding:2px;flex:none';
const rTogOff = 'width:38px;height:22px;border-radius:99px;background:var(--bg-tertiary);display:inline-flex;align-items:center;padding:2px;flex:none';
const rKnob = 'width:18px;height:18px;border-radius:99px;background:#fff';

const toneDefs: ['warm' | 'brief' | 'detailed', string][] = [['warm', 'Warm & chatty'], ['brief', 'Brief & factual'], ['detailed', 'Detailed']];

export function ReportEdit() {
  const { state, actions } = useApp();
  const rdId = reportData[state.reportId] ? state.reportId : 'milo';
  const rd = reportData[rdId];
  const backLabel = state.reportFrom === 'reports' ? 'Reports' : 'Report';
  const photos = [1, 2, 3].map((n) => ({ id: `rep-${rdId}-${n}` }));
  const includeDefs: [keyof RepInclude, string, string][] = [
    ['photos', 'Photos', '3 photos from the walk'],
    ['map', 'Route map', `${rd.distance} GPS track`],
    ['behaviour', 'Behaviour notes', 'Greetings, play and mood'],
    ['water', 'Water & toilet breaks', 'Logged during the walk'],
  ];

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:680px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={actions.goBackFromEdit} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />{backLabel}
        </button>
        <div style={st('flex:1')} />
        <button onClick={actions.saveDraft} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer')}>Save draft</button>
        <button onClick={() => actions.sendReport(rdId)} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Save &amp; send</button>
      </div>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:22px 24px;display:flex;flex-direction:column;gap:22px')}>
        <div style={st('display:flex;align-items:center;gap:13px')}>
          <div style={{ ...st('width:44px;height:44px;border-radius:13px;overflow:hidden;flex:none'), background: petColors[rdId] }}>
            <ImageSlot shape="rect" fit="cover" placeholder={rd.petName[0]} />
          </div>
          <div>
            <div style={st('font-size:16px;font-weight:700;color:var(--fg-primary)')}>{rd.petName} · {rd.route}</div>
            <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{rd.owner} · {rd.when}</div>
          </div>
        </div>

        <div>
          <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Tone</div>
          <div style={st('display:flex;gap:8px')}>
            {toneDefs.map(([k, label]) => {
              const on = state.repTone === k;
              return (
                <button
                  key={k}
                  onClick={() => actions.setRepTone(k)}
                  style={st(`flex:1;padding:9px 6px;border-radius:10px;border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'};font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer`)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:9px')}>
            <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>Summary</div>
            <span style={st('font-size:11.5px;color:var(--fg-quaternary)')}>Editable — this is what the owner reads</span>
          </div>
          <textarea
            value={state.repText || rd.summary}
            onChange={(e) => actions.setRepText(e.target.value)}
            style={st('width:100%;box-sizing:border-box;min-height:150px;resize:vertical;border:1px solid var(--border-default);border-radius:12px;padding:13px 15px;font-family:inherit;font-size:14px;line-height:21px;color:var(--fg-primary);background:var(--bg-primary);outline:none')}
          />
        </div>

        <div>
          <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Include in report</div>
          <div style={st('display:flex;flex-direction:column;gap:2px')}>
            {includeDefs.map(([key, label, hint]) => {
              const on = !!state.repInclude[key];
              return (
                <div key={key} style={st('display:flex;align-items:center;gap:13px;padding:11px 2px;border-bottom:1px solid var(--border-subtle)')}>
                  <div style={st('flex:1')}>
                    <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{label}</div>
                    <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{hint}</div>
                  </div>
                  <button onClick={() => actions.toggleRepInclude(key)} style={{ ...st(on ? rTogOn : rTogOff), border: 'none', cursor: 'pointer' }}>
                    <span style={st(on ? rKnob + ';margin-left:auto' : rKnob)} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Photos</div>
          <div style={st('display:grid;grid-template-columns:repeat(3,1fr);gap:10px')}>
            {photos.map((p) => (
              <div key={p.id} style={st('aspect-ratio:4/3;border-radius:12px;overflow:hidden;position:relative')}>
                <ImageSlot shape="rect" fit="cover" placeholder="Tap to replace" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
