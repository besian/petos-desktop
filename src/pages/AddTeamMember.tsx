import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon } from '../components/icons';
import { fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';

const COLORS = ['#127A63', '#4A6C8C', '#A66C8C', '#8C7A4A', '#5C6E7C', '#7A3E4A'];

export function AddTeamMember() {
  const navigate = useNavigate();
  const { db, addTeamMember } = useDB();
  const [form, setForm] = useState({ name: '', role: 'Walker', area: '', phone: '', email: '' });

  usePageHeader('Add team member', 'Add a walker or staff member');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const color = COLORS[db.team.length % COLORS.length];
    const created = addTeamMember({ name: form.name.trim(), role: form.role.trim() || 'Walker', area: form.area.trim() || 'Not set', color, phone: form.phone.trim() || 'Not set', email: form.email.trim() || 'Not set', joined: `${form.role.trim() || 'Walker'} · ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`, bio: '', skills: [], status: 'Available' });
    navigate(`/team/${created.id}`);
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:560px;margin:0 auto')}>
      <button onClick={() => navigate(-1)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:18px')}>
        <ChevronLeftIcon />Back
      </button>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:24px')}>
        <form id="add-member-form" onSubmit={submit}>
          <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Name</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={st(fieldInput)} /></div>
          <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Role</label><input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={st(fieldInput)} placeholder="Walker" /></div>
          <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Area</label><input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Chelsea · Belgravia" /></div>
          <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={st(fieldInput)} /></div>
          <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={st(fieldInput)} /></div>
        </form>
        <div style={st('display:flex;justify-content:flex-end;gap:10px;margin-top:8px')}>
          <button onClick={() => navigate(-1)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="add-member-form" style={st(btnPrimary)}>Add</button>
        </div>
      </div>
    </div>
  );
}
