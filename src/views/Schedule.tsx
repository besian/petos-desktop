import { useMemo, useState } from 'react';
import { st } from '../lib/st';
import { useUI } from '../ui/store';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO, addDays, startOfWeek, dow, dayNum, formatShort } from '../db/dates';
import { Modal, btnSecondary } from '../components/Modal';
import type { Walk } from '../db/types';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
const ROW_H = 64;

function timeToTop(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - 8) * ROW_H + (m / 60) * ROW_H;
}

export function Schedule() {
  const { state, actions } = useUI();
  const { db, cancelWalk } = useDB();
  const [openWalk, setOpenWalk] = useState<Walk | null>(null);

  const weekStart = useMemo(() => startOfWeek(todayISO()), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const today = todayISO();

  usePageHeader('Schedule', `Week of ${formatShort(weekStart)} · ${db.walks.filter((w) => w.date >= weekStart && w.date <= weekDays[6] && w.status !== 'cancelled').length} walks · ${db.team.length} walkers`);

  const petById = new Map(db.pets.map((p) => [p.id, p]));
  const teamById = new Map(db.team.map((t) => [t.id, t]));
  const activeFilter = state.scheduleFilter;

  const weekWalks = db.walks.filter((w) => weekDays.includes(w.date) && w.status !== 'cancelled');
  const filterCount = activeFilter === 'all' ? weekWalks.length : weekWalks.filter((w) => w.walkerId === activeFilter).length;

  const clashWarning = useMemo(() => {
    for (const day of weekDays) {
      const dayWalks = weekWalks.filter((w) => w.date === day).sort((a, b) => a.time.localeCompare(b.time));
      for (let i = 0; i < dayWalks.length - 1; i++) {
        const a = dayWalks[i], b = dayWalks[i + 1];
        const aEnd = timeToTop(a.time) + Math.max(32, (a.durationMin / 60) * ROW_H);
        const bStart = timeToTop(b.time);
        if (a.walkerId === b.walkerId && bStart - aEnd < 20) {
          return { day, a, b, gap: Math.round(bStart - aEnd) };
        }
      }
    }
    return null;
  }, [weekWalks, weekDays]);

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:16px')}>
        <div style={st('display:flex;align-items:center;gap:8px')}>
          <button onClick={() => actions.setScheduleFilter('all')} style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer;border:1px solid ${activeFilter === 'all' ? 'transparent' : 'var(--border-default)'};background:${activeFilter === 'all' ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${activeFilter === 'all' ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}>All walkers</button>
          {db.team.map((t) => {
            const on = activeFilter === t.id;
            return (
              <button key={t.id} onClick={() => actions.setScheduleFilter(t.id)} style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer;border:1px solid ${on ? 'transparent' : 'var(--border-default)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}>{t.name.split(' ')[0]}</button>
            );
          })}
          <span style={st('font-size:12.5px;color:var(--fg-tertiary);margin-left:4px')}>{filterCount} walks</span>
        </div>
        <div style={st('display:flex;align-items:center;gap:12px;font-size:13px;color:var(--fg-tertiary)')}>
          {db.team.map((t) => (
            <span key={t.id} style={st('display:inline-flex;align-items:center;gap:6px')}><span style={{ ...st('width:9px;height:9px;border-radius:3px'), background: t.color }} />{t.name.split(' ')[0]}</span>
          ))}
        </div>
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:56px repeat(7,1fr);border-bottom:1px solid var(--border-subtle)')}>
          <div />
          {weekDays.map((iso) => (
            <div key={iso} style={st(`padding:11px 0;text-align:center;${iso === today ? 'background:var(--bg-brand-subtle)' : ''}`)}>
              <div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary)')}>{dow(iso)}</div>
              <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-top:1px')}>{dayNum(iso)}</div>
            </div>
          ))}
        </div>
        <div className="ps" style={st('position:relative;height:520px;overflow-y:auto')}>
          <div style={st('display:grid;grid-template-columns:56px repeat(7,1fr);position:relative')}>
            <div style={st('display:flex;flex-direction:column')}>
              {HOURS.map((h) => (
                <div key={h} style={st('height:64px;font-size:11px;color:var(--fg-quaternary);text-align:right;padding:2px 8px 0 0;font-variant-numeric:tabular-nums')}>{h}</div>
              ))}
            </div>
            {weekDays.map((day) => {
              const dayWalks = weekWalks.filter((w) => w.date === day);
              return (
                <div key={day} style={st('position:relative;border-left:1px solid var(--border-subtle)')}>
                  {dayWalks.map((w) => {
                    const pet = petById.get(w.petId);
                    const walker = teamById.get(w.walkerId);
                    const dim = activeFilter !== 'all' && w.walkerId !== activeFilter;
                    const top = timeToTop(w.time);
                    const height = Math.max(32, (w.durationMin / 60) * ROW_H);
                    return (
                      <button
                        key={w.id}
                        onClick={() => setOpenWalk(w)}
                        style={st(`position:absolute;left:4px;right:4px;top:${top}px;height:${height}px;border-radius:8px;padding:6px 8px;color:#fff;overflow:hidden;background:${walker?.color || '#888'};box-shadow:0 1px 3px rgba(0,0,0,.14);transition:opacity .18s var(--ease-out),filter .18s var(--ease-out);opacity:${dim ? '.18' : '1'};filter:${dim ? 'grayscale(1)' : 'none'};border:none;cursor:pointer;text-align:left;font-family:inherit`)}
                      >
                        <div style={st('font-size:11px;font-weight:700;line-height:1.2')}>{pet?.name}</div>
                        <div style={st('font-size:10px;opacity:.85')}>{w.time}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {clashWarning ? (
        <div style={st('margin-top:16px;background:var(--color-warning-50);border:1px solid var(--color-warning-500);border-radius:14px;padding:13px 15px;display:flex;gap:11px;align-items:center')}>
          <div style={st('flex:1;font-size:13.5px;font-weight:600;color:var(--color-warning-700)')}>
            {dow(clashWarning.day)} {clashWarning.a.time} → {clashWarning.b.time} leaves only {clashWarning.gap} min between {petById.get(clashWarning.a.petId)?.name} and {petById.get(clashWarning.b.petId)?.name}.
          </div>
        </div>
      ) : null}

      {openWalk ? (
        <Modal
          title={petById.get(openWalk.petId)?.name || 'Walk'}
          sub={`${dow(openWalk.date)} ${dayNum(openWalk.date)} · ${openWalk.time} · ${openWalk.durationMin} min`}
          onClose={() => setOpenWalk(null)}
          footer={
            <>
              <button onClick={() => setOpenWalk(null)} style={st(btnSecondary)}>Close</button>
              <button
                onClick={() => { cancelWalk(openWalk.id); actions.showToast('Walk cancelled'); setOpenWalk(null); }}
                style={st('border:none;background:var(--color-error-500);color:#fff;font-family:inherit;font-size:13.5px;font-weight:600;padding:10px 18px;border-radius:10px;cursor:pointer')}
              >
                Cancel walk
              </button>
            </>
          }
        >
          <div style={st('display:flex;flex-direction:column;gap:10px')}>
            <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Route</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{openWalk.route}</span></div>
            <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Walker</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{teamById.get(openWalk.walkerId)?.name || 'Unassigned'}</span></div>
            <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Price</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>£{openWalk.price}</span></div>
            <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Repeats</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{openWalk.repeatWeekly ? 'Weekly' : 'One-off'}</span></div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
