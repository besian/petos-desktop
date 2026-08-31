import { st } from '../lib/st';
import { useApp } from '../state';
import { petsDef } from '../data';
import { ImageSlot } from '../components/ImageSlot';

export function Pets() {
  const { actions } = useApp();
  return (
    <div style={st('animation:vIn .3s var(--ease-out);background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
      <div style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
        <span>Pet</span><span>Owner</span><span>Plan</span><span>Next walk</span><span style={st('text-align:right')}>Lifetime</span>
      </div>
      {petsDef.map(([id, name, breed, owner, plan, next, ltv, alert]) => (
        <button
          key={id}
          onClick={() => actions.go('client')}
          style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-subtle);background:transparent;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
        >
          <span style={st('display:flex;align-items:center;gap:12px;min-width:0')}>
            <span style={st('width:40px;height:40px;border-radius:12px;overflow:hidden;flex:none;position:relative;display:block')}>
              <ImageSlot shape="rect" fit="cover" placeholder={name[0]} />
            </span>
            <span style={st('min-width:0')}>
              <span style={st('display:flex;align-items:center;gap:6px')}>
                <span style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{name}</span>
                {alert ? <span style={st('font-size:10px;font-weight:700;color:var(--color-warning-700);background:var(--color-warning-50);padding:1px 7px;border-radius:999px')}>{alert}</span> : null}
              </span>
              <span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{breed}</span>
            </span>
          </span>
          <span style={st('font-size:13.5px;color:var(--fg-secondary)')}>{owner}</span>
          <span style={st('font-size:13px;color:var(--fg-secondary)')}>{plan}</span>
          <span style={st('font-size:13px;color:var(--fg-secondary)')}>{next}</span>
          <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary);text-align:right')}>{ltv}</span>
        </button>
      ))}
    </div>
  );
}
