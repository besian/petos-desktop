import { st } from '../lib/st';
import { useApp } from '../state';
import { nwPetDefs, nwDayDefs, nwTimeDefs, durPrice, petColors } from '../data';
import { CloseIcon, RepeatIcon, WarningIcon } from './icons';

const nwSeg = 'display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;padding:9px 4px;border-radius:13px;cursor:pointer;font-family:inherit';

export function NewWalkModal() {
  const { state, actions } = useApp();
  if (!state.newWalkOpen) return null;

  const nwTogOn = state.nwRepeat;
  const nwPetName = nwPetDefs.find(([id]) => id === state.nwPet)![1];
  const nwClash = state.nwTime === '13:30' || state.nwTime === '15:00';
  const nwSummary = `${nwPetName} · ${nwDayDefs[state.nwDay][0]} ${state.nwTime} · ${state.nwDur} min`;
  const nwPrice = durPrice[state.nwDur] + (nwTogOn ? ' /wk' : '');
  const nwWarn = nwClash ? 'Tight travel gap near this slot — PetOS will flag it on the schedule.' : '';

  return (
    <div style={st('position:fixed;inset:0;z-index:90;background:rgba(6,10,9,.55);display:flex;align-items:center;justify-content:center;animation:vIn .2s var(--ease-out)')}>
      <div style={st('width:520px;max-width:calc(100% - 48px);background:var(--bg-app);border-radius:20px;border:1px solid var(--border-default);box-shadow:0 30px 80px -30px rgba(0,0,0,.5);overflow:hidden')}>
        <div style={st('padding:20px 24px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle)')}>
          <div style={st('flex:1')}>
            <div style={st('font-size:19px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>New walk</div>
            <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Smart defaults from your usual pattern</div>
          </div>
          <button onClick={actions.closeNewWalk} style={st('width:34px;height:34px;border-radius:999px;border:none;background:var(--bg-tertiary);color:var(--fg-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center')}>
            <CloseIcon />
          </button>
        </div>
        <div style={st('padding:20px 24px')}>
          <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Pet</div>
          <div style={st('display:flex;gap:9px;margin-bottom:20px')}>
            {nwPetDefs.map(([id, name]) => {
              const on = state.nwPet === id;
              return (
                <button
                  key={id}
                  onClick={() => actions.setNwPet(id)}
                  style={st(`${nwSeg};border:1px solid ${on ? 'var(--border-brand)' : 'var(--border-subtle)'};background:${on ? 'var(--bg-brand-subtle)' : 'var(--bg-primary)'}`)}
                >
                  <span style={st(`width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;background:${petColors[id]}${on ? '' : ';opacity:.85'}`)}>{name[0]}</span>
                  <span style={st('font-size:12px;font-weight:600;color:var(--fg-primary)')}>{name}</span>
                </button>
              );
            })}
          </div>
          <div style={st('display:flex;gap:20px;margin-bottom:20px')}>
            <div style={st('flex:1')}>
              <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Day</div>
              <div style={st('display:flex;gap:7px')}>
                {nwDayDefs.map(([dow, num], i) => {
                  const on = state.nwDay === i;
                  return (
                    <button
                      key={dow}
                      onClick={() => actions.setNwDay(i)}
                      style={st(`${nwSeg};border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-primary)'}`)}
                    >
                      <span style={st('font-size:10.5px;font-weight:600;opacity:.72')}>{dow}</span>
                      <span style={st('font-size:15px;font-weight:700;margin-top:1px')}>{num}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={st('display:flex;gap:20px;margin-bottom:20px')}>
            <div style={st('flex:1')}>
              <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Start</div>
              <div style={st('display:flex;gap:7px;flex-wrap:wrap')}>
                {nwTimeDefs.map((label) => {
                  const on = state.nwTime === label;
                  return (
                    <button
                      key={label}
                      onClick={() => actions.setNwTime(label)}
                      style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 12px;border-radius:10px;cursor:pointer;border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={st('flex:1')}>
              <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Duration</div>
              <div style={st('display:flex;gap:7px')}>
                {[30, 45, 60].map((mins) => {
                  const on = state.nwDur === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => actions.setNwDur(mins)}
                      style={st(`display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;padding:9px 4px;border-radius:12px;cursor:pointer;font-family:inherit;border:1px solid ${on ? 'var(--border-brand)' : 'var(--border-subtle)'};background:${on ? 'var(--bg-brand-subtle)' : 'var(--bg-primary)'};color:${on ? 'var(--fg-brand)' : 'var(--fg-secondary)'}`)}
                    >
                      <span style={st('font-size:13.5px;font-weight:700')}>{mins} min</span>
                      <span style={st('font-size:10.5px;font-weight:600;opacity:.8')}>{durPrice[mins]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={actions.toggleNwRepeat}
            style={st('display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:13px;padding:13px 15px;cursor:pointer;font-family:inherit')}
          >
            <span style={st('color:var(--fg-brand);flex:none')}><RepeatIcon /></span>
            <div style={st('flex:1')}>
              <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>Repeat weekly</div>
              <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{nwTogOn ? 'Every week at this time · skip anytime' : 'One-off walk'}</div>
            </div>
            <span style={st(`width:40px;height:23px;border-radius:99px;flex:none;display:inline-flex;align-items:center;padding:2px;background:${nwTogOn ? 'var(--brand-primary)' : 'var(--bg-tertiary)'}`)}>
              <span style={st(`width:19px;height:19px;border-radius:99px;background:#fff;${nwTogOn ? 'margin-left:auto' : ''}`)} />
            </span>
          </button>
          {nwClash ? (
            <div style={st('display:flex;gap:10px;align-items:flex-start;background:var(--color-warning-50);border:1px solid var(--color-warning-500);border-radius:12px;padding:12px 14px;margin-top:16px')}>
              <span style={st('color:var(--color-warning-700);flex:none;margin-top:1px')}><WarningIcon size={16} /></span>
              <div style={st('font-size:12.5px;color:var(--color-warning-700);font-weight:600;line-height:17px')}>{nwWarn}</div>
            </div>
          ) : null}
        </div>
        <div style={st('padding:14px 24px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:14px')}>
          <div style={st('flex:1')}>
            <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{nwSummary}</div>
            <div style={st('font-size:19px;font-weight:700;color:var(--fg-primary)')}>{nwPrice}</div>
          </div>
          <button onClick={actions.closeNewWalk} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:11px;cursor:pointer')}>Cancel</button>
          <button onClick={actions.newWalkAdd} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:14.5px;font-weight:600;padding:11px 22px;border-radius:11px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Add walk</button>
        </div>
      </div>
    </div>
  );
}
