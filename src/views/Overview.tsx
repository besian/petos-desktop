import type { ReactNode } from 'react';
import { st } from '../lib/st';
import { useApp } from '../state';
import { widgetLabels, spanMap, opsDef, teamFeed, quickNotesDef } from '../data';
import { petColors } from '../data';
import { SparkleIcon, ReportsIcon, PaymentsIcon, ScheduleIcon, ChevronRightIcon } from '../components/icons';

const btnStyle = 'width:26px;height:26px;border-radius:7px;border:none;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit';

function WidgetEditControls({ id, order, editMode, onMove, onHide }: { id: string; order: string[]; editMode: boolean; onMove: (id: string, dir: 1 | -1) => void; onHide: (id: string) => void }) {
  if (!editMode) return null;
  const i = order.indexOf(id);
  const upStyle = `${btnStyle};background:var(--bg-tertiary);color:var(--fg-secondary);${i === 0 ? 'opacity:.35;pointer-events:none' : ''}`;
  const downStyle = `${btnStyle};background:var(--bg-tertiary);color:var(--fg-secondary);${i === order.length - 1 ? 'opacity:.35;pointer-events:none' : ''}`;
  const hideStyle = `${btnStyle};background:var(--color-error-50);color:var(--color-error-700)`;
  return (
    <div style={st('position:absolute;top:-13px;right:16px;display:flex;gap:4px;background:var(--bg-primary);border:1px solid var(--border-default);border-radius:9px;padding:3px;box-shadow:var(--shadow-sm);z-index:5')}>
      <button onClick={() => onMove(id, -1)} style={st(upStyle)}>↑</button>
      <button onClick={() => onMove(id, 1)} style={st(downStyle)}>↓</button>
      <button onClick={() => onHide(id)} style={st(hideStyle)}>✕</button>
    </div>
  );
}

function Widget({ id, order, editMode, onMove, onHide, children }: { id: string; order: string[]; editMode: boolean; onMove: (id: string, dir: 1 | -1) => void; onHide: (id: string) => void; children: ReactNode }) {
  const i = order.indexOf(id);
  const wrapStyle = `position:relative;order:${i};${spanMap[id]};${editMode ? ';outline:2px dashed var(--border-default);outline-offset:8px;border-radius:16px' : ''}`;
  return (
    <div style={st(wrapStyle)}>
      <WidgetEditControls id={id} order={order} editMode={editMode} onMove={onMove} onHide={onHide} />
      {children}
    </div>
  );
}

const opsPill: Record<string, [string, string]> = {
  done: ['Done', 'background:var(--bg-brand-subtle);color:var(--fg-brand)'],
  next: ['Next', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  upcoming: ['', 'display:none'],
};

export function Overview() {
  const { state, actions } = useApp();
  const { overviewEdit: editMode, overviewOrder: order, overviewHidden: hidden } = state;

  const kpis = [
    { label: "Today's walks", value: '2 / 5', sub: 'On schedule', trend: '', go: () => actions.go('schedule'), trendStyle: 'display:none' },
    { label: 'Expected today', value: '£104', sub: '£40 collected', trend: '', go: () => actions.go('payments'), trendStyle: 'display:none' },
    { label: 'Overdue', value: '£20', sub: '1 invoice · James O.', trend: 'Action', go: () => actions.go('payments'), trendStyle: 'font-size:11px;font-weight:700;color:var(--color-error-700);background:var(--color-error-50);padding:2px 8px;border-radius:999px' },
    { label: 'Hours saved · July', value: '11.4h', sub: 'Reports + invoicing', trend: 'PetOS', go: () => actions.go('business'), trendStyle: 'font-size:11px;font-weight:700;color:var(--fg-brand);background:var(--bg-brand-subtle);padding:2px 8px;border-radius:999px' },
  ];

  const ops = opsDef.map(([time, id, name, meta, status, price]) => ({
    time, initial: name[0], name, meta, price, dotStyle: `background:${petColors[id]}`,
    status: opsPill[status][0], pillStyle: `font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:999px;${opsPill[status][1]}`,
  }));

  const attentionD = [
    { Icon: ReportsIcon, iconWrap: 'background:var(--bg-brand-subtle);color:var(--fg-brand)', title: '1 report awaiting approval', sub: "Milo · yesterday's walk", go: () => actions.go('reports') },
    { Icon: PaymentsIcon, iconWrap: 'background:var(--color-error-50);color:var(--color-error-700)', title: '£20 overdue · James Okafor', sub: '6 days · send a reminder', go: () => actions.go('payments') },
    { Icon: ScheduleIcon, iconWrap: 'background:var(--color-warning-50);color:var(--color-warning-700)', title: '3 open slots next Thursday', sub: 'Roughly £60 unbooked', go: () => actions.go('schedule') },
  ];

  const hiddenWidgets = hidden.map((id) => ({ id, label: widgetLabels[id] }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:14px')}>
        {editMode ? <span style={st('font-size:12.5px;color:var(--fg-tertiary);margin-right:auto')}>Drag with the arrows to reorder, hide cards you don't need</span> : null}
        <button
          onClick={actions.toggleOverviewEdit}
          style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 15px;border-radius:10px;cursor:pointer;border:1px solid ${editMode ? 'transparent' : 'var(--border-default)'};background:${editMode ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${editMode ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}
        >
          {editMode ? 'Done' : 'Customize'}
        </button>
      </div>

      {editMode && hiddenWidgets.length > 0 ? (
        <div style={st("display:flex;flex-wrap:wrap;align-items:center;gap:9px;background:var(--bg-secondary);border:1px dashed var(--border-default);border-radius:14px;padding:12px 14px;margin-bottom:18px")}>
          <span style={st('font-size:12.5px;color:var(--fg-tertiary);font-weight:600')}>Add widgets:</span>
          {hiddenWidgets.map((hw) => (
            <button
              key={hw.id}
              onClick={() => actions.showWidget(hw.id)}
              style={st('display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--fg-secondary);background:var(--bg-primary);border:1px solid var(--border-default);border-radius:999px;padding:6px 12px 6px 10px;cursor:pointer')}
            >
              + {hw.label}
            </button>
          ))}
        </div>
      ) : null}

      <div style={st('display:grid;grid-template-columns:repeat(12,1fr);grid-auto-flow:dense;gap:18px')}>
        {hidden.includes('briefing') ? null : (
          <Widget id="briefing" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('display:flex;gap:13px;align-items:flex-start;background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:16px 18px')}>
              <span style={st('color:var(--fg-brand);flex:none;margin-top:1px')}><SparkleIcon size={20} /></span>
              <div style={st('flex:1')}>
                <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-brand);margin-bottom:5px')}>Morning briefing</div>
                <p style={st('font-size:14.5px;line-height:21px;color:var(--fg-primary);font-weight:500;margin:0')}>Steady Friday: 5 walks worth £104, all with confirmed access. Two travel gaps are tight this afternoon. You have 3 open slots next week and one client drifting — filling both would add roughly £120. Nothing needs a decision right now.</p>
              </div>
              <button onClick={() => actions.go('business')} style={st('flex:none;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer;align-self:center')}>Review</button>
            </div>
          </Widget>
        )}

        {hidden.includes('kpis') ? null : (
          <Widget id="kpis" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('display:grid;grid-template-columns:repeat(4,1fr);gap:14px')}>
              {kpis.map((k) => (
                <button key={k.label} onClick={k.go} style={st('text-align:left;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:16px;padding:16px 17px;box-shadow:var(--card-shadow);cursor:pointer;font-family:inherit')}>
                  <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px')}>
                    <span style={st('font-size:12.5px;font-weight:600;color:var(--fg-tertiary)')}>{k.label}</span>
                    <span style={st(k.trendStyle)}>{k.trend}</span>
                  </div>
                  <div style={st('font-size:27px;font-weight:700;color:var(--fg-primary);letter-spacing:-.02em;font-variant-numeric:tabular-nums')}>{k.value}</div>
                  <div style={st('font-size:12px;color:var(--fg-tertiary);margin-top:2px')}>{k.sub}</div>
                </button>
              ))}
            </div>
          </Widget>
        )}

        {hidden.includes('operations') ? null : (
          <Widget id="operations" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
              <div style={st('display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--border-subtle)')}>
                <div>
                  <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>Today's operations</div>
                  <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Friday, 17 July · 2 of 5 complete</div>
                </div>
                <button onClick={() => actions.go('schedule')} style={st('background:transparent;border:none;color:var(--fg-brand);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer')}>Open schedule →</button>
              </div>
              <div style={st('padding:6px 8px')}>
                {ops.map((o) => (
                  <div key={o.time + o.name} style={st('display:flex;align-items:center;gap:14px;padding:11px 12px;border-radius:12px')}>
                    <span style={st('font-size:13px;font-weight:700;color:var(--fg-secondary);font-variant-numeric:tabular-nums;width:44px;flex:none')}>{o.time}</span>
                    <div style={st(`width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex:none;${o.dotStyle}`)}>{o.initial}</div>
                    <div style={st('flex:1;min-width:0')}>
                      <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{o.name}</div>
                      <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{o.meta}</div>
                    </div>
                    {o.status ? <span style={st(o.pillStyle)}>{o.status}</span> : null}
                    <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary);width:46px;text-align:right;flex:none')}>{o.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('revenue') ? null : (
          <Widget id="revenue" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:3px')}>Revenue · July</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-bottom:16px')}>£1,486 collected of £2,140 expected</div>
              <div style={st('height:10px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden;margin-bottom:8px')}>
                <div style={st('width:69%;height:100%;background:var(--brand-primary);border-radius:99px')} />
              </div>
              <div style={st('display:flex;justify-content:space-between;font-size:12px;color:var(--fg-tertiary)')}><span>69% collected</span><span>£654 outstanding</span></div>
            </div>
          </Widget>
        )}

        {hidden.includes('attention') ? null : (
          <Widget id="attention" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden;height:100%;box-sizing:border-box')}>
              <div style={st('padding:16px 18px 8px;font-size:15px;font-weight:700;color:var(--fg-primary)')}>Needs attention</div>
              <div style={st('padding:0 8px 8px')}>
                {attentionD.map((a) => (
                  <button key={a.title} onClick={a.go} style={st('display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:none;padding:10px 12px;border-radius:11px;cursor:pointer;font-family:inherit')}>
                    <span style={st(`width:32px;height:32px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;${a.iconWrap}`)}><a.Icon size={16} /></span>
                    <div style={st('flex:1;min-width:0')}>
                      <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{a.title}</div>
                      <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{a.sub}</div>
                    </div>
                    <span style={st('color:var(--fg-quaternary)')}><ChevronRightIcon size={17} /></span>
                  </button>
                ))}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('team') ? null : (
          <Widget id="team" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Team activity</div>
              <div style={st('display:flex;flex-direction:column;gap:12px')}>
                {teamFeed.map((t) => (
                  <div key={t.name} style={st('display:flex;align-items:center;gap:11px')}>
                    <span style={st(`width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex:none;background:${t.color}`)}>{t.initial}</span>
                    <div style={st('flex:1;min-width:0')}><span style={st('font-size:13.5px;color:var(--fg-primary)')}><b>{t.name}</b> {t.action}</span></div>
                    <span style={st('font-size:11.5px;color:var(--fg-quaternary);flex:none')}>{t.when}</span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('weather') ? null : (
          <Widget id="weather" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:3px')}>Conditions</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-bottom:14px')}>Central London · today</div>
              <div style={st('font-size:27px;font-weight:700;color:var(--fg-primary);letter-spacing:-.02em')}>17°C</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-top:2px')}>Light cloud · calm winds · good for walks</div>
            </div>
          </Widget>
        )}

        {hidden.includes('notes') ? null : (
          <Widget id="notes" order={order} editMode={editMode} onMove={actions.moveWidget} onHide={actions.hideWidget}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Quick notes</div>
              <div style={st('display:flex;flex-direction:column;gap:9px')}>
                {quickNotesDef.map((n) => (
                  <div key={n} style={st('display:flex;align-items:flex-start;gap:9px')}>
                    <span style={st('width:6px;height:6px;border-radius:999px;background:var(--fg-quaternary);flex:none;margin-top:6px')} />
                    <span style={st('font-size:13.5px;color:var(--fg-secondary);line-height:19px')}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Widget>
        )}
      </div>
    </div>
  );
}
