import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { startOfWeek, addDays, dow, dayNum, todayISO, mondayIndex } from '../db/dates';
import { ChevronLeftIcon, RepeatIcon, WarningIcon, PawIcon, ScheduleIcon, TeamIcon } from '../components/icons';
import { btnPrimary, btnSecondary } from '../components/Modal';

const petBtn = 'display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:13px;cursor:pointer;font-family:inherit;width:78px';
const dayBtn = 'display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;padding:11px 4px;border-radius:12px;cursor:pointer;font-family:inherit';
const timeOptions = ['08:30', '09:00', '11:00', '13:30', '15:00'];

function SectionHeader({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div style={st('display:flex;align-items:center;gap:12px;margin-bottom:18px')}>
      <span style={st('width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--bg-brand-subtle);color:var(--fg-brand)')}>{icon}</span>
      <div>
        <div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary)')}>{title}</div>
        <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{desc}</div>
      </div>
    </div>
  );
}

const cardStyle = 'background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:22px';

export function NewWalk() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { db, addWalk } = useDB();
  const { actions } = useUI();

  const weekDays = useMemo(() => {
    const start = startOfWeek(todayISO());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const defaultPetId = params.get('petId') || db.pets[0]?.id || null;
  const defaultWalkerId = params.get('walkerId') || db.team[0]?.id || '';

  const [petId, setPetId] = useState(defaultPetId);
  const [walkerId, setWalkerId] = useState(defaultWalkerId);
  const [day, setDay] = useState(mondayIndex(todayISO()));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState<30 | 45 | 60>(60);
  const [repeat, setRepeat] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  usePageHeader('New walk', 'Book a walk for this week');

  const pet = db.pets.find((p) => p.id === petId);
  const walker = db.team.find((t) => t.id === walkerId);
  const dayIso = weekDays[day] || weekDays[mondayIndex(todayISO())];
  const rate = { 30: db.settings.rateSolo30, 45: Math.round((db.settings.rateSolo30 + db.settings.rateSolo60) / 2), 60: db.settings.rateSolo60 }[duration];
  const clash = db.walks.some((w) => w.date === dayIso && w.time === time && w.status !== 'cancelled');
  const priceLabel = `£${rate}` + (repeat ? ' /wk' : '');

  const submit = async () => {
    if (!pet) return;
    setSubmitting(true);
    try {
      await addWalk({ petId: pet.id, walkerId, date: dayIso, time, durationMin: duration, price: rate, route: `${pet.name}'s usual route`, repeatWeekly: repeat });
      actions.showToast(`${pet.name} added${repeat ? ' · weekly' : ''}`);
      navigate('/schedule');
    } catch {
      actions.showToast('Could not save — check your connection');
      setSubmitting(false);
    }
  };

  if (db.pets.length === 0) {
    return (
      <div style={st('animation:vIn .3s var(--ease-out);text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>Add a pet first before scheduling a walk.</div>
        <button onClick={() => navigate('/pets/new')} style={st(btnPrimary)}>Add a pet</button>
      </div>
    );
  }

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <button onClick={() => navigate(-1)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:18px')}>
        <ChevronLeftIcon />Back
      </button>

      <div style={st('display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start')}>
        <div style={st('display:flex;flex-direction:column;gap:16px')}>
          <div style={st(cardStyle)}>
            <SectionHeader icon={<PawIcon size={17} />} title="Pet" desc="Who's this walk for?" />
            <div style={st('display:flex;gap:9px;flex-wrap:wrap')}>
              {db.pets.map((p) => {
                const on = petId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPetId(p.id)}
                    style={st(`${petBtn};border:1px solid ${on ? 'var(--border-brand)' : 'var(--border-subtle)'};background:${on ? 'var(--bg-brand-subtle)' : 'var(--bg-primary)'}`)}
                  >
                    <span style={st(`width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;background:${p.color}${on ? '' : ';opacity:.85'}`)}>{p.name[0]}</span>
                    <span style={st('font-size:12px;font-weight:600;color:var(--fg-primary)')}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={st(cardStyle)}>
            <SectionHeader icon={<ScheduleIcon size={17} />} title="Schedule" desc="Pick a day, start time and length" />

            <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Day</div>
            <div style={st('display:flex;gap:7px;margin-bottom:20px')}>
              {weekDays.map((iso, i) => {
                const on = day === i;
                return (
                  <button
                    key={iso}
                    onClick={() => setDay(i)}
                    style={st(`${dayBtn};border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-primary)'}`)}
                  >
                    <span style={st('font-size:10.5px;font-weight:600;opacity:.72')}>{dow(iso)}</span>
                    <span style={st('font-size:15px;font-weight:700;margin-top:1px')}>{dayNum(iso)}</span>
                  </button>
                );
              })}
            </div>

            <div style={st('display:flex;gap:20px')}>
              <div style={st('flex:1')}>
                <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Start</div>
                <div style={st('display:flex;gap:7px;flex-wrap:wrap')}>
                  {timeOptions.map((label) => {
                    const on = time === label;
                    return (
                      <button
                        key={label}
                        onClick={() => setTime(label)}
                        style={st(`font-family:inherit;font-size:13px;font-weight:600;padding:8px 12px;border-radius:10px;cursor:pointer;border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={st('flex:1;max-width:220px')}>
                <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Duration</div>
                <div style={st('display:flex;gap:7px')}>
                  {([30, 45, 60] as const).map((mins) => {
                    const on = duration === mins;
                    const p = { 30: db.settings.rateSolo30, 45: Math.round((db.settings.rateSolo30 + db.settings.rateSolo60) / 2), 60: db.settings.rateSolo60 }[mins];
                    return (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        style={st(`display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;padding:9px 4px;border-radius:12px;cursor:pointer;font-family:inherit;border:1px solid ${on ? 'var(--border-brand)' : 'var(--border-subtle)'};background:${on ? 'var(--bg-brand-subtle)' : 'var(--bg-primary)'};color:${on ? 'var(--fg-brand)' : 'var(--fg-secondary)'}`)}
                      >
                        <span style={st('font-size:13.5px;font-weight:700')}>{mins} min</span>
                        <span style={st('font-size:10.5px;font-weight:600;opacity:.8')}>£{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {clash ? (
              <div style={st('display:flex;gap:10px;align-items:flex-start;background:var(--color-warning-50);border:1px solid var(--color-warning-500);border-radius:12px;padding:12px 14px;margin-top:18px')}>
                <span style={st('color:var(--color-warning-700);flex:none;margin-top:1px')}><WarningIcon size={16} /></span>
                <div style={st('font-size:12.5px;color:var(--color-warning-700);font-weight:600;line-height:17px')}>Another walk is already booked at this time on this day.</div>
              </div>
            ) : null}

            <button
              onClick={() => setRepeat((r) => !r)}
              style={st('display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:13px;padding:13px 15px;cursor:pointer;font-family:inherit;margin-top:18px')}
            >
              <span style={st('color:var(--fg-brand);flex:none')}><RepeatIcon /></span>
              <div style={st('flex:1')}>
                <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>Repeat weekly</div>
                <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{repeat ? 'Every week at this time · skip anytime' : 'One-off walk'}</div>
              </div>
              <span style={st(`width:40px;height:23px;border-radius:99px;flex:none;display:inline-flex;align-items:center;padding:2px;background:${repeat ? 'var(--brand-primary)' : 'var(--bg-tertiary)'}`)}>
                <span style={st(`width:19px;height:19px;border-radius:99px;background:#fff;${repeat ? 'margin-left:auto' : ''}`)} />
              </span>
            </button>
          </div>

          <div style={st(cardStyle)}>
            <SectionHeader icon={<TeamIcon size={17} />} title="Walker" desc="Who's taking them?" />
            <div style={st('display:flex;gap:9px;flex-wrap:wrap')}>
              {db.team.length === 0 ? (
                <span style={st('font-size:13px;color:var(--fg-tertiary)')}>No team members yet — this walk will be unassigned.</span>
              ) : db.team.map((t) => {
                const on = walkerId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setWalkerId(t.id)}
                    style={st(`display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px 8px 8px;border-radius:999px;cursor:pointer;border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'}`)}
                  >
                    <span style={{ ...st('width:22px;height:22px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff'), background: t.color }}>{t.name[0]}</span>
                    {t.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={st('position:sticky;top:0;display:flex;flex-direction:column;gap:14px')}>
          <div style={st(cardStyle)}>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:14px')}>Summary</div>

            {pet ? (
              <div style={st('display:flex;align-items:center;gap:12px;margin-bottom:18px')}>
                <span style={st(`width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;flex:none;background:${pet.color}`)}>{pet.name[0]}</span>
                <div style={st('min-width:0')}>
                  <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>{pet.name}</div>
                  <div style={st('font-size:12px;color:var(--fg-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{pet.breed}</div>
                </div>
              </div>
            ) : null}

            <div style={st('display:flex;flex-direction:column;gap:10px;padding-bottom:16px;border-bottom:1px solid var(--border-subtle);margin-bottom:16px')}>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Day</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary)')}>{dow(dayIso)} {dayNum(dayIso)}</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Time</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary)')}>{time}</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Duration</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary)')}>{duration} min</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Walker</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary)')}>{walker ? walker.name.split(' ')[0] : 'Unassigned'}</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Repeats</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary)')}>{repeat ? 'Weekly' : 'One-off'}</span></div>
            </div>

            <div style={st('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px')}>
              <span style={st('font-size:13px;color:var(--fg-tertiary)')}>Price</span>
              <span style={st('font-size:22px;font-weight:800;color:var(--fg-primary);letter-spacing:-.01em')}>{priceLabel}</span>
            </div>

            <button onClick={submit} disabled={submitting} style={st(`${btnPrimary};width:100%;box-sizing:border-box;padding:12px;font-size:14px;margin-bottom:9px${submitting ? ';opacity:.65' : ''}`)}>
              {submitting ? 'Adding…' : 'Add walk'}
            </button>
            <button onClick={() => navigate(-1)} style={st(`${btnSecondary};width:100%;box-sizing:border-box;padding:12px;font-size:14px`)}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
