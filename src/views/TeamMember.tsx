import { st } from '../lib/st';
import { useApp } from '../state';
import { teamDef, teamDetail, walkerColors, petColors, petNameMap, petOwnerMap } from '../data';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';

export function TeamMember() {
  const { state, actions } = useApp();
  const mKey = teamDetail[state.selectedMember] ? state.selectedMember : 'sarah';
  const team = teamDef.map(([key, name, role, initials, color, status, walks, util, week, rating]) => ({
    key, name, role, initials, color, status, walksLabel: `${walks} walks`, util, week, rating,
  }));
  const mBase = team.find((t) => t.key === mKey)!;
  const mDet = teamDetail[mKey];
  const mColor = walkerColors[mKey] || '#127A63';

  const statusStyle = `font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${mBase.status === 'Available' ? 'background:var(--color-success-50);color:var(--color-success-700)' : 'background:var(--bg-brand-subtle);color:var(--fg-brand)'}`;

  const today = mDet.today.map(([time, pet, route]) => ({ time, pet, route, dot: `background:${petColors[pet.toLowerCase()] || mColor}` }));
  const pets = mDet.pets.map((p) => ({ id: p, name: petNameMap[p], owner: petOwnerMap[p], initial: petNameMap[p][0], dot: `background:${petColors[p]}` }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:940px')}>
      <button onClick={() => actions.go('team')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:18px')}>
        <ChevronLeftIcon />Team
      </button>

      <div style={st('display:grid;grid-template-columns:1.35fr 1fr;gap:16px;align-items:start')}>
        <div style={st('display:flex;flex-direction:column;gap:16px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:24px')}>
            <div style={st('display:flex;align-items:center;gap:16px;margin-bottom:20px')}>
              <div style={st(`width:64px;height:64px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;color:#fff;flex:none;background:${mColor}`)}>{mBase.initials}</div>
              <div style={st('flex:1')}>
                <div style={st('font-size:21px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{mBase.name}</div>
                <div style={st('font-size:13.5px;color:var(--fg-tertiary)')}>{mBase.role} · {mDet.area}</div>
              </div>
              <span style={st(statusStyle)}>{mBase.status}</span>
            </div>
            <p style={st('font-size:14px;line-height:22px;color:var(--fg-secondary);margin:0 0 20px;text-wrap:pretty')}>{mDet.bio}</p>
            <div style={st('display:grid;grid-template-columns:repeat(4,1fr);gap:12px')}>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Today</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{mBase.walksLabel}</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Utilisation</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{mBase.util}%</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>This week</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{mBase.week} walks</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Rating</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{mBase.rating}</div></div>
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('padding:18px 20px 12px;font-size:14px;font-weight:700;color:var(--fg-primary)')}>Today's schedule</div>
            {today.map((w, i) => (
              <div key={i} style={st('display:flex;align-items:center;gap:14px;padding:13px 20px;border-top:1px solid var(--border-subtle)')}>
                <span style={st('font-size:13px;font-weight:700;color:var(--fg-secondary);font-variant-numeric:tabular-nums;width:44px')}>{w.time}</span>
                <span style={st(`width:9px;height:9px;border-radius:999px;flex:none;${w.dot}`)} />
                <div style={st('flex:1')}>
                  <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{w.pet}</div>
                  <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{w.route}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={st('display:flex;flex-direction:column;gap:16px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:14px')}>Contact</div>
            <div style={st('display:flex;flex-direction:column;gap:11px')}>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Phone</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{mDet.phone}</span></div>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Email</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{mDet.email}</span></div>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Joined</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{mDet.joined}</span></div>
            </div>
            <div style={st('display:flex;gap:9px;margin-top:16px')}>
              <button onClick={actions.noop} style={st('flex:1;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Message</button>
              <button onClick={actions.noop} style={st('flex:1;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer')}>Assign walk</button>
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Specialisms</div>
            <div style={st('display:flex;flex-wrap:wrap;gap:8px')}>
              {mDet.skills.map((s) => (
                <span key={s} style={st('font-size:12.5px;font-weight:600;color:var(--fg-secondary);background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:999px;padding:6px 13px')}>{s}</span>
              ))}
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('padding:18px 20px 12px;font-size:14px;font-weight:700;color:var(--fg-primary)')}>Regular pets</div>
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => actions.go('client')}
                style={st('display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-family:inherit;padding:11px 20px;border-top:1px solid var(--border-subtle);border-left:none;border-right:none;border-bottom:none;background:transparent;cursor:pointer')}
              >
                <span style={st(`width:34px;height:34px;border-radius:10px;overflow:hidden;flex:none;${p.dot}`)}>
                  <ImageSlot shape="rect" fit="cover" placeholder={p.initial} />
                </span>
                <div style={st('flex:1')}>
                  <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{p.name}</div>
                  <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{p.owner}</div>
                </div>
                <span style={st('color:var(--fg-quaternary)')}><ChevronRightIcon size={16} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
