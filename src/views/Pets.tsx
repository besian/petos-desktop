import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { ImageSlot } from '../components/ImageSlot';
import { Modal, fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';
import { PlusIcon } from '../components/icons';

const PET_COLORS = ['#C98A3E', '#8C5A3A', '#6E6A8C', '#4A6C8C', '#8C7A4A', '#5C6E7C', '#A66C8C', '#3E7A5E', '#7A3E4A'];

export function Pets() {
  const navigate = useNavigate();
  const { db, addPet, addClient } = useDB();
  const { actions } = useUI();
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', plan: 'Weekly' as const, clientId: '', ownerName: '', ownerEmail: '', ownerAddress: '' });

  const clientById = new Map(db.clients.map((c) => [c.id, c]));
  usePageHeader('Pets', `${db.pets.length} pets across ${db.clients.length} clients`);

  const resetForm = () => setForm({ name: '', breed: '', plan: 'Weekly', clientId: db.clients[0]?.id || '', ownerName: '', ownerEmail: '', ownerAddress: '' });

  const openAdd = () => { resetForm(); setNewClient(db.clients.length === 0); setShowAdd(true); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    let clientId = form.clientId;
    if (newClient) {
      if (!form.ownerName.trim()) return;
      const created = addClient({ name: form.ownerName.trim(), addressLine1: form.ownerAddress.trim() || 'Address not set', addressLine2: '', email: form.ownerEmail.trim() || 'no-email@example.com', memberSince: new Date().getFullYear().toString() });
      clientId = created.id;
    }
    if (!clientId || !form.name.trim()) return;
    const color = PET_COLORS[db.pets.length % PET_COLORS.length];
    const created = addPet({ name: form.name.trim(), breed: form.breed.trim() || 'Mixed breed', clientId, plan: form.plan, color });
    setShowAdd(false);
    actions.showToast(`${created.name} added`);
    navigate(`/clients/${clientId}`);
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;justify-content:flex-end;margin-bottom:14px')}>
        <button onClick={openAdd} style={st('display:inline-flex;align-items:center;gap:7px;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          <PlusIcon size={15} />Add pet
        </button>
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
          <span>Pet</span><span>Owner</span><span>Plan</span><span>Breed</span><span style={st('text-align:right')}>Age</span>
        </div>
        {db.pets.length === 0 ? (
          <div style={st('padding:40px;text-align:center;font-size:13.5px;color:var(--fg-tertiary)')}>No pets yet — add your first one.</div>
        ) : db.pets.map((pet) => {
          const owner = clientById.get(pet.clientId);
          return (
            <button
              key={pet.id}
              onClick={() => navigate(`/clients/${pet.clientId}`)}
              style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-subtle);background:transparent;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
            >
              <span style={st('display:flex;align-items:center;gap:12px;min-width:0')}>
                <span style={{ ...st('width:40px;height:40px;border-radius:12px;overflow:hidden;flex:none;position:relative;display:block'), background: pet.color }}>
                  <ImageSlot shape="rect" fit="cover" src={pet.photo} placeholder={pet.name[0]} />
                </span>
                <span style={st('min-width:0')}>
                  <span style={st('display:flex;align-items:center;gap:6px')}>
                    <span style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{pet.name}</span>
                    {pet.alert ? <span style={st('font-size:10px;font-weight:700;color:var(--color-warning-700);background:var(--color-warning-50);padding:1px 7px;border-radius:999px')}>{pet.alert}</span> : null}
                  </span>
                  <span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{pet.breed}</span>
                </span>
              </span>
              <span style={st('font-size:13.5px;color:var(--fg-secondary)')}>{owner?.name || '—'}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{pet.plan}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{pet.breed}</span>
              <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary);text-align:right')}>{pet.ageYears ? `${pet.ageYears}y` : '—'}</span>
            </button>
          );
        })}
      </div>

      {showAdd ? (
        <Modal
          title="Add pet"
          sub="Create a new pet and link it to a client"
          onClose={() => setShowAdd(false)}
          footer={<>
            <button onClick={() => setShowAdd(false)} style={st(btnSecondary)}>Cancel</button>
            <button type="submit" form="add-pet-form" style={st(btnPrimary)}>Add pet</button>
          </>}
        >
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
        </Modal>
      ) : null}
    </div>
  );
}
