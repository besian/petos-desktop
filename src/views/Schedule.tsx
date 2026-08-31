import { st } from '../lib/st';
import { useApp } from '../state';
import { filtersDef, daySlots, walkerColors } from '../data';
import { WarningIcon } from '../components/icons';

const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export function Schedule() {
  const { state, actions } = useApp();
  const activeFilter = state.filters[0] || 'all';

  const weekHead = dows.map((dow, i) => ({ dow, num: 13 + i, style: `padding:11px 0;text-align:center;${i === 4 ? 'background:var(--bg-brand-subtle)' : ''}` }));

  const weekCols = daySlots.map((slots) => slots.map(([top, h, name, time, walker]) => {
    const c = walkerColors[walker] || '#127A63';
    const dim = activeFilter !== 'all' && walker !== activeFilter;
    return {
      name, time,
      style: `position:absolute;left:4px;right:4px;top:${top}px;height:${h}px;border-radius:8px;padding:6px 8px;color:#fff;overflow:hidden;background:${c};box-shadow:0 1px 3px rgba(0,0,0,.14);transition:opacity .18s var(--ease-out),filter .18s var(--ease-out);opacity:${dim ? '.18' : '1'};filter:${dim ? 'grayscale(1)' : 'none'}`,
    };
  }));

  const filterCount = activeFilter === 'all'
    ? daySlots.reduce((s, d) => s + d.length, 0)
    : daySlots.reduce((s, d) => s + d.filter((x) => x[4] === activeFilter).length, 0);

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
        <div style={st('display:flex;align-items:center;gap:8px')}>
          {filtersDef.map(([key, label]) => {
            const on = state.filters.includes(key);
            return (
              <button
                key={key}
                onClick={() => actions.setFilter(key)}
                style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer;border:1px solid ${on ? 'transparent' : 'var(--border-default)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}
              >
                {label}
              </button>
            );
          })}
          <span style={st('font-size:12.5px;color:var(--fg-tertiary);margin-left:4px')}>{filterCount} walks</span>
        </div>
        <div style={st('display:flex;align-items:center;gap:12px;font-size:13px;color:var(--fg-tertiary)')}>
          <span style={st('display:inline-flex;align-items:center;gap:6px')}><span style={st('width:9px;height:9px;border-radius:3px;background:var(--brand-primary)')} />Sarah</span>
          <span style={st('display:inline-flex;align-items:center;gap:6px')}><span style={st('width:9px;height:9px;border-radius:3px;background:#4A6C8C')} />Tom</span>
          <span style={st('display:inline-flex;align-items:center;gap:6px')}><span style={st('width:9px;height:9px;border-radius:3px;background:#A66C8C')} />Aisha</span>
        </div>
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:56px repeat(7,1fr);border-bottom:1px solid var(--border-subtle)')}>
          <div />
          {weekHead.map((h) => (
            <div key={h.dow} style={st(h.style)}>
              <div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary)')}>{h.dow}</div>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-top:1px')}>{h.num}</div>
            </div>
          ))}
        </div>
        <div className="ps" style={st('position:relative;height:520px;overflow-y:auto')}>
          <div style={st('display:grid;grid-template-columns:56px repeat(7,1fr);position:relative')}>
            <div style={st('display:flex;flex-direction:column')}>
              {hours.map((h) => (
                <div key={h} style={st('height:64px;font-size:11px;color:var(--fg-quaternary);text-align:right;padding:2px 8px 0 0;font-variant-numeric:tabular-nums')}>{h}</div>
              ))}
            </div>
            {weekCols.map((col, day) => (
              <div key={day} style={st('position:relative;border-left:1px solid var(--border-subtle)')}>
                {col.map((s, idx) => (
                  <div key={idx} style={st(s.style)}>
                    <div style={st('font-size:11px;font-weight:700;line-height:1.2')}>{s.name}</div>
                    <div style={st('font-size:10px;opacity:.85')}>{s.time}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={st('margin-top:16px;background:var(--color-warning-50);border:1px solid var(--color-warning-500);border-radius:14px;padding:13px 15px;display:flex;gap:11px;align-items:center')}>
        <span style={st('color:var(--color-warning-700);flex:none')}><WarningIcon /></span>
        <div style={st('flex:1;font-size:13.5px;font-weight:600;color:var(--color-warning-700)')}>Friday 13:30 → 15:00 leaves only 20 min for a 2.8 km hop between Luna and Charlie.</div>
        <button onClick={actions.noop} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer;flex:none')}>Auto-fix</button>
      </div>
    </div>
  );
}
