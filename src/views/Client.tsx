import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { useAuth } from '../auth/store';
import { usePageHeader } from '../ui/pageHeader';
import { sendEmail, messageEmailHtml } from '../lib/email';
import { relativeDay } from '../db/dates';
import { ChevronLeftIcon, PlusIcon, TrashIcon, EditIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';
import { PhotoUploadButton } from '../components/PhotoUploadButton';
import { Modal, fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

const ciPill: Record<string, [string, string]> = {
  paid: ['Paid', 'background:var(--color-success-50);color:var(--color-success-700)'],
  outstanding: ['Due', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  overdue: ['Overdue', 'background:var(--color-error-50);color:var(--color-error-700)'],
  draft: ['Draft', 'background:var(--bg-tertiary);color:var(--fg-tertiary)'],
};

export function Client() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { db, updateClient, deleteClient, deletePet, updatePet } = useDB();
  const { actions } = useUI();
  const { account } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(false);
  const [confirmDeletePet, setConfirmDeletePet] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', addressLine1: '', addressLine2: '', email: '', keySafe: '', emergencyContact: '', vet: '' });

  const client = db.clients.find((c) => c.id === clientId);
  usePageHeader('Client', client?.name || 'Not found');

  if (!client) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This client no longer exists.</div>
        <button onClick={() => navigate('/clients')} style={st(btnSecondary)}>Back to clients</button>
      </div>
    );
  }

  const pets = db.pets.filter((p) => p.clientId === client.id);
  const invoices = db.invoices.filter((i) => i.clientId === client.id).sort((a, b) => b.issued.localeCompare(a.issued));
  const petIds = new Set(pets.map((p) => p.id));
  const upcoming = db.walks.filter((w) => petIds.has(w.petId) && w.status === 'scheduled').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  const petById = new Map(db.pets.map((p) => [p.id, p]));
  const teamById = new Map(db.team.map((t) => [t.id, t]));

  const paidTotal = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.items.reduce((s2, it) => s2 + parseFloat(it.amount.replace('£', '')), 0), 0);

  const activity: { label: string; when: string; color: string }[] = [];
  for (const w of db.walks.filter((w2) => petIds.has(w2.petId) && w2.status === 'done')) {
    activity.push({ label: `${petById.get(w.petId)?.name}'s walk completed · ${w.route}`, when: w.date, color: 'var(--fg-brand)' });
  }
  for (const inv of invoices.filter((i) => i.status === 'paid' && i.paidOn)) {
    activity.push({ label: `Invoice ${inv.id} paid`, when: inv.paidOn!, color: 'var(--fg-brand)' });
  }
  activity.sort((a, b) => b.when.localeCompare(a.when));

  const openEdit = () => { setEditForm({ name: client.name, addressLine1: client.addressLine1, addressLine2: client.addressLine2, email: client.email, keySafe: client.keySafe || '', emergencyContact: client.emergencyContact || '', vet: client.vet || '' }); setEditOpen(true); };
  const submitEdit = (e: FormEvent) => {
    e.preventDefault();
    updateClient(client.id, editForm);
    setEditOpen(false);
    actions.showToast('Client updated');
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <button onClick={() => navigate('/clients')} style={st('display:inline-flex;align-items:center;gap:5px;background:transparent;border:none;color:var(--fg-tertiary);font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;margin-bottom:16px;padding:0')}>
        <ChevronLeftIcon size={18} />All clients
      </button>
      <div style={st('display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start')}>
        <div style={st('display:flex;flex-direction:column;gap:18px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px;display:flex;align-items:center;gap:18px')}>
            <div style={st('width:64px;height:64px;border-radius:999px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;flex:none')}>{client.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
            <div style={st('flex:1')}>
              <div style={st('font-size:21px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{client.name}</div>
              <div style={st('font-size:13.5px;color:var(--fg-tertiary)')}>{client.addressLine1} · member since {client.memberSince} · £{paidTotal.toFixed(0)} lifetime</div>
            </div>
            <button onClick={() => navigate(`/clients/${client.id}/chat`)} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Chat</button>
            <button onClick={() => setMessageOpen(true)} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}>Email</button>
            <button onClick={openEdit} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer')}><EditIcon /></button>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
              <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>Pets ({pets.length})</div>
              <button onClick={() => navigate(`/pets/new?clientId=${client.id}`)} style={st('display:inline-flex;align-items:center;gap:5px;border:none;background:transparent;color:var(--fg-brand);font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer')}><PlusIcon size={13} />Add pet</button>
            </div>
            {pets.length === 0 ? <div style={st('font-size:13px;color:var(--fg-tertiary)')}>No pets on file yet.</div> : (
              <div style={st('display:flex;flex-direction:column;gap:10px')}>
                {pets.map((pet) => (
                  <div key={pet.id} style={st('display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--border-subtle);border-radius:14px')}>
                    <PhotoUploadButton folder="pets" onUploaded={(url) => updatePet(pet.id, { photo: url })} title={`Upload a photo of ${pet.name}`} style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flex: 'none', background: pet.color }}>
                      <ImageSlot shape="rect" fit="cover" src={pet.photo} placeholder={pet.name[0]} />
                    </PhotoUploadButton>
                    <div style={st('flex:1')}>
                      <div style={st('font-size:15px;font-weight:600;color:var(--fg-primary)')}>{pet.name} · {pet.breed}</div>
                      <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{pet.ageYears ? `${pet.ageYears} yrs · ` : ''}{pet.plan.toLowerCase()}{pet.notes ? ' · ' + pet.notes : ''}</div>
                    </div>
                    {pet.alert ? <span style={st('font-size:11px;font-weight:700;color:var(--color-warning-700);background:var(--color-warning-50);padding:3px 9px;border-radius:999px')}>{pet.alert}</span> : null}
                    <button onClick={() => setConfirmDeletePet(pet.id)} style={st('background:transparent;border:none;color:var(--fg-quaternary);cursor:pointer;padding:4px')}><TrashIcon /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Recent activity</div>
            {activity.length === 0 ? <div style={st('font-size:13px;color:var(--fg-tertiary)')}>No activity yet.</div> : (
              <div style={st('display:flex;flex-direction:column;gap:12px')}>
                {activity.slice(0, 6).map((a, i) => (
                  <div key={i} style={st('display:flex;align-items:center;gap:12px')}>
                    <span style={{ ...st('width:8px;height:8px;border-radius:999px;flex:none'), background: a.color }} />
                    <span style={st('flex:1;font-size:13.5px;color:var(--fg-secondary)')}>{a.label}</span>
                    <span style={st('font-size:12px;color:var(--fg-quaternary)')}>{relativeDay(a.when)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px')}>
              <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>Invoices</div>
              <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>£{paidTotal.toFixed(2)} billed · {invoices.every((i) => i.status === 'paid') ? 'all paid' : `${invoices.filter((i) => i.status !== 'paid').length} open`}</span>
            </div>
            {invoices.length === 0 ? <div style={st('padding:0 20px 18px;font-size:13px;color:var(--fg-tertiary)')}>No invoices yet.</div> : invoices.map((inv) => (
              <button
                key={inv.id}
                onClick={() => navigate(`/payments/${inv.id}`)}
                style={st('display:grid;grid-template-columns:1.3fr 1fr auto auto;align-items:center;gap:14px;width:100%;text-align:left;padding:12px 20px;border-top:1px solid var(--border-subtle);border-left:none;border-right:none;border-bottom:none;background:transparent;cursor:pointer;font-family:inherit')}
              >
                <span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{inv.id}</span>
                <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{inv.issued}</span>
                <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary);font-variant-numeric:tabular-nums')}>{inv.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0).toFixed(2)}</span>
                <span style={st(`font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;${ciPill[inv.status][1]}`)}>{ciPill[inv.status][0]}</span>
              </button>
            ))}
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:14px')}>Upcoming walks</div>
            {upcoming.length === 0 ? <div style={st('font-size:13px;color:var(--fg-tertiary)')}>Nothing scheduled.</div> : (
              <div style={st('display:flex;flex-direction:column;gap:10px')}>
                {upcoming.map((w) => (
                  <div key={w.id} style={st('display:flex;align-items:center;gap:13px;padding:11px 13px;border:1px solid var(--border-subtle);border-radius:13px')}>
                    <span style={st('width:9px;height:9px;border-radius:999px;background:var(--fg-brand);flex:none')} />
                    <div style={st('flex:1')}><div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{w.date} · {w.time}</div><div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{petById.get(w.petId)?.name} · {w.route}</div></div>
                    <span style={st('font-size:12px;color:var(--fg-tertiary)')}>{teamById.get(w.walkerId)?.name.split(' ')[0] || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={st('display:flex;flex-direction:column;gap:18px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:18px')}>
            <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px')}>
              <div style={st('font-size:13px;font-weight:700;color:var(--fg-primary)')}>Access &amp; emergency</div>
              <button onClick={openEdit} style={st('background:transparent;border:none;color:var(--fg-brand);cursor:pointer;padding:2px')}><EditIcon size={13} /></button>
            </div>
            <div style={st('display:flex;flex-direction:column;gap:11px')}>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Key safe</div><div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>{client.keySafe || 'Not set'}</div></div>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Emergency contact</div><div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>{client.emergencyContact || 'Not set'}</div></div>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Vet</div><div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>{client.vet || 'Not set'}</div></div>
              <div><div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Email</div><div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>{client.email}</div></div>
            </div>
          </div>

          <button
            onClick={() => setConfirmDeleteClient(true)}
            style={st('background:var(--bg-primary);border:1px solid var(--color-error-500);border-radius:18px;padding:14px 18px;text-align:left;font-family:inherit;font-size:13px;font-weight:600;color:var(--color-error-700);cursor:pointer')}
          >
            Delete this client
          </button>
        </div>
      </div>

      {editOpen ? (
        <Modal title="Edit client" onClose={() => setEditOpen(false)} footer={<>
          <button onClick={() => setEditOpen(false)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="edit-client-form" style={st(btnPrimary)}>Save</button>
        </>}>
          <form id="edit-client-form" onSubmit={submitEdit}>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Name</label><input required value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Address line 1</label><input value={editForm.addressLine1} onChange={(e) => setEditForm((f) => ({ ...f, addressLine1: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Address line 2</label><input value={editForm.addressLine2} onChange={(e) => setEditForm((f) => ({ ...f, addressLine2: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Key safe</label><input value={editForm.keySafe} onChange={(e) => setEditForm((f) => ({ ...f, keySafe: e.target.value }))} style={st(fieldInput)} placeholder="e.g. Revealed at appointment" /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Emergency contact</label><input value={editForm.emergencyContact} onChange={(e) => setEditForm((f) => ({ ...f, emergencyContact: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Vet</label><input value={editForm.vet} onChange={(e) => setEditForm((f) => ({ ...f, vet: e.target.value }))} style={st(fieldInput)} /></div>
          </form>
        </Modal>
      ) : null}

      {messageOpen ? (
        <Modal title={`Message ${client.name}`} sub={`Sends a real email to ${client.email}`} onClose={() => setMessageOpen(false)} footer={<>
          <button onClick={() => setMessageOpen(false)} style={st(btnSecondary)}>Cancel</button>
          <button
            disabled={sendingMessage || !messageText.trim()}
            onClick={async () => {
              setSendingMessage(true);
              const businessName = account?.businessName || 'Your dog walker';
              const result = await sendEmail({
                to: client.email,
                subject: `Message from ${businessName}`,
                html: messageEmailHtml(`Hi ${client.name.split(' ')[0]},`, messageText, `— ${account?.ownerName || businessName}`),
                replyTo: account?.email,
              });
              setSendingMessage(false);
              if (result.ok) {
                setMessageOpen(false);
                setMessageText('');
                actions.showToast(`Message sent to ${client.name}`);
              } else {
                actions.showToast(result.error || 'Could not send message');
              }
            }}
            style={st(`${btnPrimary}${sendingMessage ? ';opacity:.65' : ''}`)}
          >
            {sendingMessage ? 'Sending…' : 'Send'}
          </button>
        </>}>
          <textarea
            value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={`Hi ${client.name.split(' ')[0]}, …`}
            style={st('width:100%;box-sizing:border-box;min-height:120px;resize:vertical;border:1px solid var(--border-default);border-radius:12px;padding:13px 15px;font-family:inherit;font-size:14px;line-height:21px;color:var(--fg-primary);background:var(--bg-primary);outline:none')}
          />
        </Modal>
      ) : null}

      {confirmDeleteClient ? (
        <ConfirmDialog
          title="Delete this client?"
          message={`This removes ${client.name} and their ${pets.length} pet${pets.length === 1 ? '' : 's'}, plus any scheduled walks. Invoices are kept for your records.`}
          confirmLabel="Delete client"
          onCancel={() => setConfirmDeleteClient(false)}
          onConfirm={() => { deleteClient(client.id); actions.showToast('Client deleted'); navigate('/clients'); }}
        />
      ) : null}

      {confirmDeletePet ? (
        <ConfirmDialog
          title="Remove this pet?"
          message="This deletes the pet and any scheduled walks for them. Past invoices are kept."
          confirmLabel="Remove pet"
          onCancel={() => setConfirmDeletePet(null)}
          onConfirm={() => { deletePet(confirmDeletePet); actions.showToast('Pet removed'); setConfirmDeletePet(null); }}
        />
      ) : null}
    </div>
  );
}
