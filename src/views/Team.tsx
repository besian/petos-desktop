import { st } from '../lib/st';
import { useApp } from '../state';
import { teamDef } from '../data';
import { SparkleIcon, ChevronRightIcon } from '../components/icons';

export function Team() {
  const { actions } = useApp();
  const team = teamDef.map(([key, name, role, initials, color, status, walks, util, week, rating]) => ({
    key, name, role, initials, dot: `background:${color}`, status, walksLabel: `${walks} walks`, util, week, rating,
    statusStyle: `font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${status === 'Available' ? 'background:var(--color-success-50);color:var(--color-success-700)' : 'background:var(--bg-brand-subtle);color:var(--fg-brand)'}`,
    barStyle: `width:${util}%;height:100%;background:${util > 90 ? 'var(--color-warning-500)' : 'var(--brand-primary)'};border-radius:99px`,
  }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px')}>
        {team.map((t) => (
          <button
            key={t.key}
            className="team-card"
            onClick={() => actions.openMember(t.key)}
            style={st('text-align:left;font-family:inherit;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px;cursor:pointer;transition:box-shadow .18s var(--ease-out),border-color .18s var(--ease-out)')}
          >
            <div style={st('display:flex;align-items:center;gap:13px;margin-bottom:16px')}>
              <div style={st(`width:48px;height:48px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;flex:none;${t.dot}`)}>{t.initials}</div>
              <div style={st('flex:1')}>
                <div style={st('font-size:16px;font-weight:700;color:var(--fg-primary)')}>{t.name}</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{t.role}</div>
              </div>
              <span style={st(t.statusStyle)}>{t.status}</span>
            </div>
            <div style={st('display:flex;justify-content:space-between;margin-bottom:6px')}><span style={st('font-size:12.5px;color:var(--fg-secondary)')}>Today · {t.walksLabel}</span><span style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>{t.util}%</span></div>
            <div style={st('height:8px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden;margin-bottom:14px')}><div style={st(t.barStyle)} /></div>
            <div style={st('display:flex;gap:16px')}>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary)')}>This week</div><div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>{t.week} walks</div></div>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary)')}>Rating</div><div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>{t.rating}</div></div>
              <div style={st('margin-left:auto;align-self:center;color:var(--fg-quaternary)')}><ChevronRightIcon size={18} /></div>
            </div>
          </button>
        ))}
      </div>
      <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:15px 17px;display:flex;align-items:center;gap:12px')}>
        <span style={st('color:var(--fg-brand)')}><SparkleIcon /></span>
        <div style={st('flex:1;font-size:13.5px;color:var(--fg-primary);font-weight:500')}>Tom is at 92% today and Aisha has capacity. Move Charlie’s 15:00 to Aisha to balance the afternoon?</div>
        <button onClick={actions.noop} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer;flex:none')}>Reassign</button>
      </div>
    </div>
  );
}
