import { st } from '../lib/st';
import { useApp } from '../state';
import { revVals, revLabels, healthDef, recsDef } from '../data';
import { SparkleIcon } from '../components/icons';

const maxRev = 2140;

export function Business() {
  const { actions } = useApp();
  const revBars = revVals.map((v, i) => ({ label: revLabels[i], barStyle: `height:${Math.round((v / maxRev) * 100)}%;background:${i === 5 ? 'var(--brand-primary)' : 'var(--bg-tertiary)'};min-height:8px` }));
  const healthRows = healthDef.map(([label, value, pct]) => ({ label, value, barStyle: `width:${pct}%;height:100%;background:var(--brand-primary);border-radius:99px` }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:grid;grid-template-columns:1.4fr 1fr;gap:18px;align-items:start;margin-bottom:18px')}>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
          <div style={st('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px')}>
            <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>Revenue · last 6 months</div>
            <div style={st('font-size:13px;font-weight:600;color:var(--fg-brand)')}>+8% vs June</div>
          </div>
          <div style={st('display:flex;align-items:flex-end;gap:14px;height:150px')}>
            {revBars.map((b) => (
              <div key={b.label} style={st('flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end')}>
                <div style={st(`width:100%;border-radius:8px 8px 0 0;${b.barStyle}`)} />
                <span style={st('font-size:11.5px;color:var(--fg-tertiary);font-weight:600')}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
          <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:16px')}>Health</div>
          <div style={st('display:flex;flex-direction:column;gap:16px')}>
            {healthRows.map((h) => (
              <div key={h.label}>
                <div style={st('display:flex;justify-content:space-between;margin-bottom:6px')}><span style={st('font-size:13px;color:var(--fg-secondary);font-weight:500')}>{h.label}</span><span style={st('font-size:13px;font-weight:700;color:var(--fg-primary)')}>{h.value}</span></div>
                <div style={st('height:8px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden')}><div style={st(h.barStyle)} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:18px;padding:18px 20px')}>
        <div style={st('display:flex;align-items:center;gap:9px;margin-bottom:14px')}>
          <span style={st('color:var(--fg-brand)')}><SparkleIcon /></span>
          <span style={st('font-size:13px;font-weight:700;color:var(--fg-brand)')}>Recommendations · you approve each one</span>
        </div>
        <div style={st('display:flex;flex-direction:column;gap:10px')}>
          {recsDef.map((r) => (
            <div key={r.title} style={st('display:flex;align-items:center;gap:14px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:13px;padding:13px 15px')}>
              <div style={st('flex:1')}>
                <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{r.title}</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-top:1px')}>{r.sub}</div>
              </div>
              <button onClick={() => actions.showToast('Dismissed')} style={st('border:1px solid var(--border-default);background:transparent;color:var(--fg-tertiary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:9px;cursor:pointer')}>Dismiss</button>
              <button onClick={() => actions.showToast(r.cta === 'Apply at renewal' ? 'Queued for Bella’s renewal' : r.cta === 'Draft message' ? 'Draft ready to review' : 'Offer drafted')} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}>{r.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
