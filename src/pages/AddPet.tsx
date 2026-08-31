import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon } from '../components/icons';
import { fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';

const PET_COLORS = ['#C98A3E', '#8C5A3A', '#6E6A8C', '#4A6C8C', '#8C7A4A', '#5C6E7C', '#A66C8C', '#3E7A5E', '#7A3E4A'];

export function AddPet() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { db, addPet, addClient } = useDB();
  const { actions } = useUI();
  const presetClientId = params.get('clientId');
  const [newClient, setNewClient] = useState(db.clients.length === 0);
  const [form, setForm] = useState({ name: '', breed: '', plan: 'Weekly' as 'Weekly' | 'Fortnightly' | 'Monthly', clientId: presetClientId || db.clients[0]?.id || '', ownerName: '', ownerEmail: '', ownerAddress: '' });

  const [submitting, setSubmitting] = useState(false);
  usePageHeader('Add pet', 'Create a new pet and link it to a client');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    let clientId = form.clientId;
    setSubmitting(true);
    try {
      if (newClient) {
        if (!form.ownerName.trim()) { setSubmitting(false); return; }
        const created = await addClient({ name: form.ownerName.trim(), addressLine1: form.ownerAddress.trim() || 'Address not set', addressLine2: '', email: form.ownerEmail.trim() || 'no-email@example.com', memberSince: new Date().getFullYear().toString() });
        clientId = created.id;
      }
      if (!clientId || !form.name.trim()) { setSubmitting(false); return; }
      const color = PET_COLORS[db.pets.length % PET_COLORS.length];
      const created = await addPet({ name: form.name.trim(), breed: form.breed.trim() || 'Mixed breed', clientId, plan: form.plan, color });
      actions.showToast(`${created.name} added`);
      navigate(`/clients/${clientId}`);
    } catch {
      actions.showToast('Could not save — check your connection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:560px;margin:0 auto')}>
      <button onClick={() => navigate(-1)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:18px')}>
        <ChevronLeftIcon />Back
      </button>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:24px')}>
        <form id="add-pet-form" onSubmit={submit}>
          <div style={st(fieldWrap)}>
            <label style={st(fieldLabel)}>Pet name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Buddy" />
          </div>
          <div style={st(fieldWrap)}>
            <label style={st(fieldLabel)}>Breed</label>
            <input value={form.breed} onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Cockapoo" />
          </div>
          <div style={st(fieldWrap)}>
            <label style={st(fieldLabel)}>Plan</label>
            <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as typeof f.plan }))} style={st(fieldInput)}>
              <option value="Weekly">Weekly</option>
              <option value="Fortnightly">Fortnightly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {db.clients.length > 0 ? (
            <div style={st('display:flex;gap:8px;margin-bottom:14px')}>
              <button type="button" onClick={() => setNewClient(false)} style={st(`flex:1;padding:8px;border-radius:9px;border:1px solid ${!newClient ? 'transparent' : 'var(--border-subtle)'};background:${!newClient ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${!newClient ? '#fff' : 'var(--fg-secondary)'};font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer`)}>Existing client</button>
              <button type="button" onClick={() => setNewClient(true)} style={st(`flex:1;padding:8px;border-radius:9px;border:1px solid ${newClient ? 'transparent' : 'var(--border-subtle)'};background:${newClient ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${newClient ? '#fff' : 'var(--fg-secondary)'};font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer`)}>New client</button>
            </div>
          ) : null}

          {newClient ? (
            <>
              <div style={st(fieldWrap)}>
                <label style={st(fieldLabel)}>Owner name</label>
                <input required value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Priya Shah" />
              </div>
              <div style={st(fieldWrap)}>
                <label style={st(fieldLabel)}>Owner email</label>
                <input type="email" value={form.ownerEmail} onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))} style={st(fieldInput)} placeholder="owner@example.com" />
              </div>
              <div style={st(fieldWrap)}>
                <label style={st(fieldLabel)}>Address</label>
                <input value={form.ownerAddress} onChange={(e) => setForm((f) => ({ ...f, ownerAddress: e.target.value }))} style={st(fieldInput)} placeholder="Street, London" />
              </div>
            </>
          ) : (
            <div style={st(fieldWrap)}>
              <label style={st(fieldLabel)}>Owner</label>
              <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))} style={st(fieldInput)}>
                {db.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </form>
        <div style={st('display:flex;justify-content:flex-end;gap:10px;margin-top:8px')}>
          <button onClick={() => navigate(-1)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="add-pet-form" disabled={submitting} style={st(`${btnPrimary}${submitting ? ';opacity:.65' : ''}`)}>{submitting ? 'Adding…' : 'Add pet'}</button>
        </div>
      </div>
    </div>
  );
}
