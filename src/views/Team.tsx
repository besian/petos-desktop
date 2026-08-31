import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO, startOfWeek, addDays } from '../db/dates';
import { ChevronRightIcon, PlusIcon } from '../components/icons';
import { Modal, fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';

const COLORS = ['#127A63', '#4A6C8C', '#A66C8C', '#8C7A4A', '#5C6E7C', '#7A3E4A'];
const DAILY_CAPACITY = 6;

export function Team() {
  const navigate = useNavigate();
  const { db, addTeamMember } = useDB();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: 'Walker', area: '', phone: '', email: '' });
  usePageHeader('Team', db.team.map((t) => t.name.split(' ')[0]).join(', '));

  const today = todayISO();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);

  const rows = db.team.map((t) => {
    const todaysWalks = db.walks.filter((w) => w.walkerId === t.id && w.date === today && w.status !== 'cancelled');
    const weekWalks = db.walks.filter((w) => w.walkerId === t.id && w.date >= weekStart && w.date <= weekEnd && w.status !== 'cancelled');
    const completedAllTime = db.walks.filter((w) => w.walkerId === t.id && w.status === 'done').length;
    const util = Math.min(100, Math.round((todaysWalks.length / DAILY_CAPACITY) * 100));
    return { ...t, todaysCount: todaysWalks.length, weekCount: weekWalks.length, completedAllTime, util };
  });

  const busiest = rows.reduce((max, r) => (r.util > (max?.util || -1) ? r : max), rows[0]);
  const spare = rows.find((r) => r.id !== busiest?.id && r.util < 70);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const color = COLORS[db.team.length % COLORS.length];
    addTeamMember({ name: form.name.trim(), role: form.role.trim() || 'Walker', area: form.area.trim() || 'Not set', color, phone: form.phone.trim() || 'Not set', email: form.email.trim() || 'Not set', joined: `${form.role.trim() || 'Walker'} · ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`, bio: '', skills: [], status: 'Available' });
    setShowAdd(false);
    setForm({ name: '', role: 'Walker', area: '', phone: '', email: '' });
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;justify-content:flex-end;margin-bottom:14px')}>
        <button onClick={() => setShowAdd(true)} style={st('display:inline-flex;align-items:center;gap:7px;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          <PlusIcon size={15} />Add team member
        </button>
      </div>
      <div style={st('display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px')}>
        {rows.length === 0 ? (
          <div style={st('grid-column:span 3;text-align:center;padding:40px;font-size:13.5px;color:var(--fg-tertiary)')}>No team members yet.</div>
        ) : rows.map((t) => (
          <button
            key={t.id}
            className="team-card"
            onClick={() => navigate(`/team/${t.id}`)}
            style={st('text-align:left;font-family:inherit;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px;cursor:pointer;transition:box-shadow .18s var(--ease-out),border-color .18s var(--ease-out)')}
          >
            <div style={st('display:flex;align-items:center;gap:13px;margin-bottom:16px')}>
              <div style={{ ...st('width:48px;height:48px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#fff;flex:none'), background: t.color }}>{t.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
              <div style={st('flex:1')}>
                <div style={st('font-size:16px;font-weight:700;color:var(--fg-primary)')}>{t.name}</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{t.role}</div>
              </div>
              <span style={st(`font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${t.status === 'Available' ? 'background:var(--color-success-50);color:var(--color-success-700)' : 'background:var(--bg-brand-subtle);color:var(--fg-brand)'}`)}>{t.status}</span>
            </div>
            <div style={st('display:flex;justify-content:space-between;margin-bottom:6px')}><span style={st('font-size:12.5px;color:var(--fg-secondary)')}>Today · {t.todaysCount} walks</span><span style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>{t.util}%</span></div>
            <div style={st('height:8px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden;margin-bottom:14px')}><div style={st(`width:${t.util}%;height:100%;background:${t.util > 90 ? 'var(--color-warning-500)' : 'var(--brand-primary)'};border-radius:99px`)} /></div>
            <div style={st('display:flex;gap:16px')}>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary)')}>This week</div><div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>{t.weekCount} walks</div></div>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary)')}>Completed</div><div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>{t.completedAllTime}</div></div>
              <div style={st('margin-left:auto;align-self:center;color:var(--fg-quaternary)')}><ChevronRightIcon size={18} /></div>
            </div>
          </button>
        ))}
      </div>
      {busiest && busiest.util > 90 && spare ? (
        <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:16px;padding:15px 17px;display:flex;align-items:center;gap:12px')}>
          <div style={st('flex:1;font-size:13.5px;color:var(--fg-primary);font-weight:500')}>{busiest.name.split(' ')[0]} is at {busiest.util}% today and {spare.name.split(' ')[0]} has capacity — consider rebalancing tomorrow's schedule.</div>
        </div>
      ) : null}

      {showAdd ? (
        <Modal title="Add team member" onClose={() => setShowAdd(false)} footer={<>
          <button onClick={() => setShowAdd(false)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="add-member-form" style={st(btnPrimary)}>Add</button>
        </>}>
          <form id="add-member-form" onSubmit={submit}>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Role</label><input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={st(fieldInput)} placeholder="Walker" /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Area</label><input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Chelsea · Belgravia" /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={st(fieldInput)} /></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
