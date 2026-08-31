import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useUI } from '../ui/store';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO, addDays, relativeDay, formatLong, mondayIndex } from '../db/dates';
import { SparkleIcon, ReportsIcon, PaymentsIcon, ScheduleIcon, ChevronRightIcon, TrashIcon } from '../components/icons';
import { useState } from 'react';

const btnStyle = 'width:26px;height:26px;border-radius:7px;border:none;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit';
const widgetLabels: Record<string, string> = { briefing: 'Morning briefing', kpis: 'Key metrics', operations: "Today's operations", revenue: 'Revenue', attention: 'Needs attention', team: 'Team activity', weather: 'This week', notes: 'Quick notes' };
const spanMap: Record<string, string> = { briefing: 'grid-column:span 12', kpis: 'grid-column:span 12', operations: 'grid-column:span 7;grid-row:span 2', revenue: 'grid-column:span 5', attention: 'grid-column:span 5', team: 'grid-column:span 4', weather: 'grid-column:span 4', notes: 'grid-column:span 4' };

function DragHandle() {
  return (
    <span style={st('display:inline-flex;flex-direction:column;flex-wrap:wrap;gap:2px;width:11px;height:16px;align-content:space-between')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} style={st('width:3px;height:3px;border-radius:999px;background:currentColor;opacity:.6')} />
      ))}
    </span>
  );
}

function WidgetEditControls({
  id, editMode, onHide, onDragStart, onDragEnd, isDragging,
}: {
  id: string;
  editMode: boolean;
  onHide: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  if (!editMode) return null;
  const hideStyle = `${btnStyle};background:var(--color-error-50);color:var(--color-error-700)`;
  const handleStyle = `${btnStyle};background:var(--bg-tertiary);color:var(--fg-secondary);cursor:grab;${isDragging ? 'cursor:grabbing' : ''}`;
  return (
    <div style={st('position:absolute;top:-13px;right:16px;display:flex;gap:4px;background:var(--bg-primary);border:1px solid var(--border-default);border-radius:9px;padding:3px;box-shadow:var(--shadow-sm);z-index:5')}>
      <span
        draggable
        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(id); }}
        onDragEnd={onDragEnd}
        style={st(handleStyle)}
        title="Drag to reorder"
      >
        <DragHandle />
      </span>
      <button onClick={() => onHide(id)} style={st(hideStyle)}>✕</button>
    </div>
  );
}

function Widget({
  id, order, editMode, onHide, draggedId, dragOverId, onDragStart, onDragEnd, onDragEnter, onDrop, children,
}: {
  id: string;
  order: string[];
  editMode: boolean;
  onHide: (id: string) => void;
  draggedId: string | null;
  dragOverId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragEnter: (id: string) => void;
  onDrop: (id: string) => void;
  children: ReactNode;
}) {
  const i = order.indexOf(id);
  const isDragging = draggedId === id;
  const isDragOver = editMode && dragOverId === id && draggedId !== null && draggedId !== id;
  const wrapStyle = `position:relative;order:${i};${spanMap[id]};transition:opacity .15s var(--ease-out),transform .15s var(--ease-out);${editMode ? ';outline:2px dashed ' + (isDragOver ? 'var(--border-brand)' : 'var(--border-default)') + ';outline-offset:8px;border-radius:16px' : ''}${isDragging ? ';opacity:.4' : ''}`;
  return (
    <div
      style={st(wrapStyle)}
      onDragOver={editMode ? (e) => e.preventDefault() : undefined}
      onDragEnter={editMode ? () => onDragEnter(id) : undefined}
      onDrop={editMode ? (e) => { e.preventDefault(); onDrop(id); } : undefined}
    >
      <WidgetEditControls id={id} editMode={editMode} onHide={onHide} onDragStart={onDragStart} onDragEnd={onDragEnd} isDragging={isDragging} />
      {children}
    </div>
  );
}

export function Overview() {
  const navigate = useNavigate();
  const { state, actions } = useUI();
  const { db, addNote, removeNote } = useDB();
  const { overviewEdit: editMode, overviewOrder: order, overviewHidden: hidden } = state;
  const [noteDraft, setNoteDraft] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };
  const handleDragEnter = (id: string) => setDragOverId(id);
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) { handleDragEnd(); return; }
    const from = order.indexOf(draggedId);
    const to = order.indexOf(targetId);
    if (from === -1 || to === -1) { handleDragEnd(); return; }
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    actions.setOverviewOrder(next);
    handleDragEnd();
  };

  const today = todayISO();
  const clientById = new Map(db.clients.map((c) => [c.id, c]));
  const petById = new Map(db.pets.map((p) => [p.id, p]));
  const teamById = new Map(db.team.map((t) => [t.id, t]));

  const todaysWalks = db.walks.filter((w) => w.date === today && w.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = todaysWalks.filter((w) => w.status === 'done').length;
  const nextWalk = todaysWalks.find((w) => w.status !== 'done');
  const expectedToday = todaysWalks.reduce((s, w) => s + w.price, 0);
  const collectedToday = todaysWalks.filter((w) => w.status === 'done').reduce((s, w) => s + w.price, 0);

  const overdueInvoices = db.invoices.filter((i) => i.status === 'overdue');
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.items.reduce((s2, it) => s2 + parseFloat(it.amount.replace('£', '')), 0), 0);
  const topOverdue = overdueInvoices[0];

  const sentReports = db.reports.filter((r) => r.status === 'sent').length;
  const paidInvoices = db.invoices.filter((i) => i.status === 'paid').length;
  const hoursSaved = (sentReports * 0.2 + paidInvoices * 0.15).toFixed(1);

  const pendingReports = db.reports.filter((r) => r.status === 'pending');

  let nextThursday = today;
  for (let i = 0; i < 8; i++) { if (mondayIndex(nextThursday) === 3) break; nextThursday = addDays(nextThursday, 1); }
  const thursdayBooked = db.walks.filter((w) => w.date === nextThursday && w.status !== 'cancelled').length;
  const thursdayOpen = Math.max(0, 8 - thursdayBooked);

  const monthPrefix = today.slice(0, 7);
  const monthInvoices = db.invoices.filter((i) => i.issued.startsWith(monthPrefix));
  const monthCollected = monthInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.items.reduce((s2, it) => s2 + parseFloat(it.amount.replace('£', '')), 0), 0);
  const monthExpected = monthInvoices.reduce((s, i) => s + i.items.reduce((s2, it) => s2 + parseFloat(it.amount.replace('£', '')), 0), 0);
  const monthPct = monthExpected > 0 ? Math.round((monthCollected / monthExpected) * 100) : 0;

  const weekStart = addDays(today, -mondayIndex(today));
  const weekEnd = addDays(weekStart, 6);
  const weekWalks = db.walks.filter((w) => w.date >= weekStart && w.date <= weekEnd && w.status !== 'cancelled');
  const weekRevenue = weekWalks.reduce((s, w) => s + w.price, 0);

  const recentDone = db.walks.filter((w) => w.status === 'done').sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 3);

  const briefingParts: string[] = [];
  if (todaysWalks.length > 0) briefingParts.push(`${todaysWalks.length} walk${todaysWalks.length === 1 ? '' : 's'} today worth £${expectedToday}`);
  else briefingParts.push('No walks booked today');
  if (overdueInvoices.length > 0) briefingParts.push(`£${overdueTotal.toFixed(0)} overdue across ${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? '' : 's'}`);
  if (pendingReports.length > 0) briefingParts.push(`${pendingReports.length} report${pendingReports.length === 1 ? '' : 's'} awaiting approval`);
  briefingParts.push(`${thursdayOpen} open slot${thursdayOpen === 1 ? '' : 's'} next Thursday`);
  const briefing = briefingParts.join('. ') + '.';

  usePageHeader('Overview', formatLong(today) + ' · ' + (overdueInvoices.length > 0 || pendingReports.length > 0 ? 'a few things need attention' : 'everything is on track'));

  const kpis = [
    { label: "Today's walks", value: `${doneCount} / ${todaysWalks.length}`, sub: todaysWalks.length === 0 ? 'Nothing booked' : doneCount === todaysWalks.length ? 'All done' : 'On schedule', trend: '', go: () => navigate('/schedule'), trendStyle: 'display:none' },
    { label: 'Expected today', value: `£${expectedToday}`, sub: `£${collectedToday} collected`, trend: '', go: () => navigate('/payments'), trendStyle: 'display:none' },
    { label: 'Overdue', value: `£${overdueTotal.toFixed(0)}`, sub: topOverdue ? `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? '' : 's'} · ${clientById.get(topOverdue.clientId)?.name || ''}` : 'None', trend: overdueInvoices.length > 0 ? 'Action' : '', go: () => navigate('/payments'), trendStyle: 'font-size:11px;font-weight:700;color:var(--color-error-700);background:var(--color-error-50);padding:2px 8px;border-radius:999px' },
    { label: 'Hours saved · month', value: `${hoursSaved}h`, sub: 'Reports + invoicing', trend: 'PetOS', go: () => navigate('/business'), trendStyle: 'font-size:11px;font-weight:700;color:var(--fg-brand);background:var(--bg-brand-subtle);padding:2px 8px;border-radius:999px' },
  ];

  const attentionItems = [
    pendingReports.length > 0 ? { key: 'reports', Icon: ReportsIcon, iconWrap: 'background:var(--bg-brand-subtle);color:var(--fg-brand)', title: `${pendingReports.length} report${pendingReports.length === 1 ? '' : 's'} awaiting approval`, sub: pendingReports[0] ? `${petById.get(pendingReports[0].petId)?.name || ''} · ${pendingReports[0].when}` : '', go: () => navigate('/reports') } : null,
    topOverdue ? { key: 'overdue', Icon: PaymentsIcon, iconWrap: 'background:var(--color-error-50);color:var(--color-error-700)', title: `£${overdueTotal.toFixed(0)} overdue · ${clientById.get(topOverdue.clientId)?.name || ''}`, sub: 'Send a reminder', go: () => navigate('/payments') } : null,
    thursdayOpen > 0 ? { key: 'slots', Icon: ScheduleIcon, iconWrap: 'background:var(--color-warning-50);color:var(--color-warning-700)', title: `${thursdayOpen} open slot${thursdayOpen === 1 ? '' : 's'} next Thursday`, sub: `Roughly £${thursdayOpen * 20} unbooked`, go: () => navigate('/schedule') } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const hiddenWidgets = hidden.map((id) => ({ id, label: widgetLabels[id] }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:14px')}>
        {editMode ? <span style={st('font-size:12.5px;color:var(--fg-tertiary);margin-right:auto')}>Drag a card by its handle to reorder, hide cards you don't need</span> : null}
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
            <button key={hw.id} onClick={() => actions.showWidget(hw.id)} style={st('display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--fg-secondary);background:var(--bg-primary);border:1px solid var(--border-default);border-radius:999px;padding:6px 12px 6px 10px;cursor:pointer')}>
              + {hw.label}
            </button>
          ))}
        </div>
      ) : null}

      <div style={st('display:grid;grid-template-columns:repeat(12,1fr);grid-auto-flow:dense;gap:18px')}>
        {hidden.includes('briefing') ? null : (
          <Widget id="briefing" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('display:flex;gap:13px;align-items:flex-start;background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:16px 18px')}>
              <span style={st('color:var(--fg-brand);flex:none;margin-top:1px')}><SparkleIcon size={20} /></span>
              <div style={st('flex:1')}>
                <div style={st('font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg-brand);margin-bottom:5px')}>Morning briefing</div>
                <p style={st('font-size:14.5px;line-height:21px;color:var(--fg-primary);font-weight:500;margin:0')}>{briefing}</p>
              </div>
              <button onClick={() => navigate('/business')} style={st('flex:none;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:9px;cursor:pointer;align-self:center')}>Review</button>
            </div>
          </Widget>
        )}

        {hidden.includes('kpis') ? null : (
          <Widget id="kpis" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
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
          <Widget id="operations" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
              <div style={st('display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--border-subtle)')}>
                <div>
                  <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>Today's operations</div>
                  <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{formatLong(today)} · {doneCount} of {todaysWalks.length} complete</div>
                </div>
                <button onClick={() => navigate('/schedule')} style={st('background:transparent;border:none;color:var(--fg-brand);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer')}>Open schedule →</button>
              </div>
              <div style={st('padding:6px 8px')}>
                {todaysWalks.length === 0 ? (
                  <div style={st('padding:24px;text-align:center;font-size:13px;color:var(--fg-tertiary)')}>No walks scheduled today.</div>
                ) : todaysWalks.map((w) => {
                  const pet = petById.get(w.petId);
                  const isNext = nextWalk?.id === w.id;
                  const statusLabel = w.status === 'done' ? 'Done' : isNext ? 'Next' : '';
                  const pillStyle = w.status === 'done' ? 'background:var(--bg-brand-subtle);color:var(--fg-brand)' : isNext ? 'background:var(--color-warning-50);color:var(--color-warning-700)' : 'display:none';
                  return (
                    <div key={w.id} style={st('display:flex;align-items:center;gap:14px;padding:11px 12px;border-radius:12px')}>
                      <span style={st('font-size:13px;font-weight:700;color:var(--fg-secondary);font-variant-numeric:tabular-nums;width:44px;flex:none')}>{w.time}</span>
                      <div style={st(`width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex:none;background:${pet?.color || '#888'}`)}>{pet?.name[0]}</div>
                      <div style={st('flex:1;min-width:0')}><div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{pet?.name}</div><div style={st('font-size:12px;color:var(--fg-tertiary)')}>{w.route} · {w.durationMin}m</div></div>
                      {statusLabel ? <span style={st(`font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:999px;${pillStyle}`)}>{statusLabel}</span> : null}
                      <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary);width:46px;text-align:right;flex:none')}>£{w.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('revenue') ? null : (
          <Widget id="revenue" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:3px')}>Revenue · this month</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-bottom:16px')}>£{monthCollected.toFixed(0)} collected of £{monthExpected.toFixed(0)} expected</div>
              <div style={st('height:10px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden;margin-bottom:8px')}>
                <div style={st(`width:${monthPct}%;height:100%;background:var(--brand-primary);border-radius:99px`)} />
              </div>
              <div style={st('display:flex;justify-content:space-between;font-size:12px;color:var(--fg-tertiary)')}><span>{monthPct}% collected</span><span>£{(monthExpected - monthCollected).toFixed(0)} outstanding</span></div>
            </div>
          </Widget>
        )}

        {hidden.includes('attention') ? null : (
          <Widget id="attention" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden;height:100%;box-sizing:border-box')}>
              <div style={st('padding:16px 18px 8px;font-size:15px;font-weight:700;color:var(--fg-primary)')}>Needs attention</div>
              <div style={st('padding:0 8px 8px')}>
                {attentionItems.length === 0 ? (
                  <div style={st('padding:16px 12px;font-size:13px;color:var(--fg-tertiary)')}>All caught up — nothing needs your attention.</div>
                ) : attentionItems.map((a) => (
                  <button key={a.key} onClick={a.go} style={st('display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:transparent;border:none;padding:10px 12px;border-radius:11px;cursor:pointer;font-family:inherit')}>
                    <span style={st(`width:32px;height:32px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;${a.iconWrap}`)}><a.Icon size={16} /></span>
                    <div style={st('flex:1;min-width:0')}><div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{a.title}</div><div style={st('font-size:12px;color:var(--fg-tertiary)')}>{a.sub}</div></div>
                    <span style={st('color:var(--fg-quaternary)')}><ChevronRightIcon size={17} /></span>
                  </button>
                ))}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('team') ? null : (
          <Widget id="team" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Team activity</div>
              <div style={st('display:flex;flex-direction:column;gap:12px')}>
                {recentDone.length === 0 ? (
                  <div style={st('font-size:13px;color:var(--fg-tertiary)')}>No completed walks yet.</div>
                ) : recentDone.map((w) => {
                  const walker = teamById.get(w.walkerId);
                  const pet = petById.get(w.petId);
                  return (
                    <div key={w.id} style={st('display:flex;align-items:center;gap:11px')}>
                      <span style={st(`width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex:none;background:${walker?.color || '#888'}`)}>{walker?.name[0]}</span>
                      <div style={st('flex:1;min-width:0')}><span style={st('font-size:13.5px;color:var(--fg-primary)')}><b>{walker?.name}</b> completed {pet?.name}'s walk</span></div>
                      <span style={st('font-size:11.5px;color:var(--fg-quaternary);flex:none')}>{relativeDay(w.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Widget>
        )}

        {hidden.includes('weather') ? null : (
          <Widget id="weather" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:3px')}>This week</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-bottom:14px')}>{weekWalks.length} walks booked</div>
              <div style={st('font-size:27px;font-weight:700;color:var(--fg-primary);letter-spacing:-.02em')}>£{weekRevenue}</div>
              <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-top:2px')}>Booked revenue for the week</div>
            </div>
          </Widget>
        )}

        {hidden.includes('notes') ? null : (
          <Widget id="notes" order={order} editMode={editMode} onHide={actions.hideWidget} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:16px 18px;height:100%;box-sizing:border-box;display:flex;flex-direction:column')}>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Quick notes</div>
              <div style={st('display:flex;flex-direction:column;gap:9px;flex:1;margin-bottom:10px')}>
                {db.notes.length === 0 ? <span style={st('font-size:13px;color:var(--fg-tertiary)')}>No notes yet.</span> : db.notes.map((n) => (
                  <div key={n.id} style={st('display:flex;align-items:flex-start;gap:9px')}>
                    <span style={st('width:6px;height:6px;border-radius:999px;background:var(--fg-quaternary);flex:none;margin-top:6px')} />
                    <span style={st('font-size:13.5px;color:var(--fg-secondary);line-height:19px;flex:1')}>{n.text}</span>
                    <button onClick={() => removeNote(n.id)} style={st('background:transparent;border:none;color:var(--fg-quaternary);cursor:pointer;padding:2px;flex:none')}><TrashIcon size={13} /></button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (noteDraft.trim()) { addNote(noteDraft.trim()); setNoteDraft(''); } }}
                style={st('display:flex;gap:6px')}
              >
                <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a note…" style={st('flex:1;min-width:0;border:1px solid var(--border-subtle);border-radius:8px;padding:7px 10px;font-family:inherit;font-size:12.5px;color:var(--fg-primary);background:var(--bg-secondary);outline:none')} />
                <button type="submit" style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12px;font-weight:600;padding:0 12px;border-radius:8px;cursor:pointer')}>Add</button>
              </form>
            </div>
          </Widget>
        )}
      </div>
    </div>
  );
}
