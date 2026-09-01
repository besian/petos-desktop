import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { useAuth } from '../auth/store';
import { usePageHeader } from '../ui/pageHeader';
import { sendEmail, messageEmailHtml } from '../lib/email';
import { todayISO, startOfWeek, addDays } from '../db/dates';
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, TrashIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';
import { Modal, fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

const DAILY_CAPACITY = 6;

export function TeamMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { db, updateTeamMember, deleteTeamMember } = useDB();
  const { actions } = useUI();
  const { account } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: '', area: '', phone: '', email: '', bio: '', skillsCSV: '', status: 'Available' as 'On walk' | 'Available' | 'Off duty' });

  const member = db.team.find((t) => t.id === memberId);
  usePageHeader('Team member', member?.name || 'Not found');

  if (!member) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This team member no longer exists.</div>
        <button onClick={() => navigate('/team')} style={st(btnSecondary)}>Back to team</button>
      </div>
    );
  }

  const today = todayISO();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const todaysWalks = db.walks.filter((w) => w.walkerId === member.id && w.date === today && w.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time));
  const weekWalks = db.walks.filter((w) => w.walkerId === member.id && w.date >= weekStart && w.date <= weekEnd && w.status !== 'cancelled');
  const completedAllTime = db.walks.filter((w) => w.walkerId === member.id && w.status === 'done').length;
  const util = Math.min(100, Math.round((todaysWalks.length / DAILY_CAPACITY) * 100));
  const petById = new Map(db.pets.map((p) => [p.id, p]));

  const regularPetIds = new Set(db.walks.filter((w) => w.walkerId === member.id).map((w) => w.petId));
  const regularPets = db.pets.filter((p) => regularPetIds.has(p.id));

  const openEdit = () => {
    setEditForm({ name: member.name, role: member.role, area: member.area, phone: member.phone, email: member.email, bio: member.bio, skillsCSV: member.skills.join(', '), status: member.status });
    setEditOpen(true);
  };
  const submitEdit = (e: FormEvent) => {
    e.preventDefault();
    updateTeamMember(member.id, { ...editForm, skills: editForm.skillsCSV.split(',').map((s) => s.trim()).filter(Boolean) });
    setEditOpen(false);
    actions.showToast('Team member updated');
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:940px')}>
      <button onClick={() => navigate('/team')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer;margin-bottom:18px')}>
        <ChevronLeftIcon />Team
      </button>

      <div style={st('display:grid;grid-template-columns:1.35fr 1fr;gap:16px;align-items:start')}>
        <div style={st('display:flex;flex-direction:column;gap:16px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:24px')}>
            <div style={st('display:flex;align-items:center;gap:16px;margin-bottom:20px')}>
              <div style={{ ...st('width:64px;height:64px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;color:#fff;flex:none'), background: member.color }}>{member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
              <div style={st('flex:1')}>
                <div style={st('font-size:21px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{member.name}</div>
                <div style={st('font-size:13.5px;color:var(--fg-tertiary)')}>{member.role} · {member.area}</div>
              </div>
              <span style={st(`font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;${member.status === 'Available' ? 'background:var(--color-success-50);color:var(--color-success-700)' : 'background:var(--bg-brand-subtle);color:var(--fg-brand)'}`)}>{member.status}</span>
              <button onClick={openEdit} style={st('background:transparent;border:none;color:var(--fg-tertiary);cursor:pointer;padding:4px')}><EditIcon /></button>
            </div>
            {member.bio ? <p style={st('font-size:14px;line-height:22px;color:var(--fg-secondary);margin:0 0 20px;text-wrap:pretty')}>{member.bio}</p> : null}
            <div style={st('display:grid;grid-template-columns:repeat(4,1fr);gap:12px')}>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Today</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{todaysWalks.length} walks</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Utilisation</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{util}%</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>This week</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{weekWalks.length} walks</div></div>
              <div style={st('background:var(--bg-secondary);border-radius:13px;padding:13px 14px')}><div style={st('font-size:11px;font-weight:600;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px')}>Completed</div><div style={st('font-size:17px;font-weight:700;color:var(--fg-primary)')}>{completedAllTime}</div></div>
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('padding:18px 20px 12px;font-size:14px;font-weight:700;color:var(--fg-primary)')}>Today's schedule</div>
            {todaysWalks.length === 0 ? <div style={st('padding:0 20px 18px;font-size:13px;color:var(--fg-tertiary)')}>Nothing scheduled today.</div> : todaysWalks.map((w) => (
              <div key={w.id} style={st('display:flex;align-items:center;gap:14px;padding:13px 20px;border-top:1px solid var(--border-subtle)')}>
                <span style={st('font-size:13px;font-weight:700;color:var(--fg-secondary);font-variant-numeric:tabular-nums;width:44px')}>{w.time}</span>
                <span style={{ ...st('width:9px;height:9px;border-radius:999px;flex:none'), background: petById.get(w.petId)?.color }} />
                <div style={st('flex:1')}><div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{petById.get(w.petId)?.name}</div><div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{w.route}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div style={st('display:flex;flex-direction:column;gap:16px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:14px')}>Contact</div>
            <div style={st('display:flex;flex-direction:column;gap:11px')}>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Phone</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{member.phone}</span></div>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Email</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{member.email}</span></div>
              <div style={st('display:flex;justify-content:space-between;align-items:center')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Joined</span><span style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{member.joined}</span></div>
            </div>
            <div style={st('display:flex;gap:9px;margin-top:16px')}>
              <button onClick={() => navigate(`/team/${member.id}/chat`)} style={st('flex:1;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Chat</button>
              <button onClick={() => setMessageOpen(true)} style={st('flex:1;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer')}>Email</button>
            </div>
            <div style={st('display:flex;gap:9px;margin-top:9px')}>
              <button onClick={() => navigate(`/schedule/new?walkerId=${member.id}`)} style={st('flex:1;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px;border-radius:10px;cursor:pointer')}>Assign walk</button>
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Specialisms</div>
            {member.skills.length === 0 ? <div style={st('font-size:13px;color:var(--fg-tertiary)')}>None on file.</div> : (
              <div style={st('display:flex;flex-wrap:wrap;gap:8px')}>
                {member.skills.map((s) => <span key={s} style={st('font-size:12.5px;font-weight:600;color:var(--fg-secondary);background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:999px;padding:6px 13px')}>{s}</span>)}
              </div>
            )}
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('padding:18px 20px 12px;font-size:14px;font-weight:700;color:var(--fg-primary)')}>Regular pets</div>
            {regularPets.length === 0 ? <div style={st('padding:0 20px 18px;font-size:13px;color:var(--fg-tertiary)')}>None yet.</div> : regularPets.map((p) => (
              <button key={p.id} onClick={() => navigate(`/clients/${p.clientId}`)} style={st('display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-family:inherit;padding:11px 20px;border-top:1px solid var(--border-subtle);border-left:none;border-right:none;border-bottom:none;background:transparent;cursor:pointer')}>
                <span style={{ ...st('width:34px;height:34px;border-radius:10px;overflow:hidden;flex:none'), background: p.color }}><ImageSlot shape="rect" fit="cover" src={p.photo} placeholder={p.name[0]} /></span>
                <div style={st('flex:1')}><div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{p.name}</div></div>
                <span style={st('color:var(--fg-quaternary)')}><ChevronRightIcon size={16} /></span>
              </button>
            ))}
          </div>

          <button onClick={() => setConfirmDelete(true)} style={st('background:var(--bg-primary);border:1px solid var(--color-error-500);border-radius:18px;padding:14px 18px;text-align:left;font-family:inherit;font-size:13px;font-weight:600;color:var(--color-error-700);cursor:pointer;display:flex;align-items:center;gap:8px')}>
            <TrashIcon size={14} />Remove from team
          </button>
        </div>
      </div>

      {editOpen ? (
        <Modal title="Edit team member" onClose={() => setEditOpen(false)} footer={<>
          <button onClick={() => setEditOpen(false)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="edit-member-form" style={st(btnPrimary)}>Save</button>
        </>}>
          <form id="edit-member-form" onSubmit={submitEdit}>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Name</label><input required value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Role</label><input value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Area</label><input value={editForm.area} onChange={(e) => setEditForm((f) => ({ ...f, area: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as typeof f.status }))} style={st(fieldInput)}>
                <option value="Available">Available</option>
                <option value="On walk">On walk</option>
                <option value="Off duty">Off duty</option>
              </select>
            </div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Phone</label><input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} style={st(fieldInput)} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Bio</label><textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} style={{ ...st(fieldInput), minHeight: 70 }} /></div>
            <div style={st(fieldWrap)}><label style={st(fieldLabel)}>Specialisms (comma separated)</label><input value={editForm.skillsCSV} onChange={(e) => setEditForm((f) => ({ ...f, skillsCSV: e.target.value }))} style={st(fieldInput)} /></div>
          </form>
        </Modal>
      ) : null}

      {messageOpen ? (
        <Modal title={`Message ${member.name}`} sub={`Sends a real email to ${member.email}`} onClose={() => setMessageOpen(false)} footer={<>
          <button onClick={() => setMessageOpen(false)} style={st(btnSecondary)}>Cancel</button>
          <button
            disabled={sendingMessage || !messageText.trim()}
            onClick={async () => {
              setSendingMessage(true);
              const businessName = account?.businessName || 'PetOS';
              const result = await sendEmail({
                to: member.email,
                subject: `Message from ${businessName}`,
                html: messageEmailHtml(`Hi ${member.name.split(' ')[0]},`, messageText, `— ${account?.ownerName || businessName}`),
                replyTo: account?.email,
              });
              setSendingMessage(false);
              if (result.ok) {
                setMessageOpen(false);
                setMessageText('');
                actions.showToast(`Message sent to ${member.name}`);
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
            value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={`Hi ${member.name.split(' ')[0]}, …`}
            style={st('width:100%;box-sizing:border-box;min-height:120px;resize:vertical;border:1px solid var(--border-default);border-radius:12px;padding:13px 15px;font-family:inherit;font-size:14px;line-height:21px;color:var(--fg-primary);background:var(--bg-primary);outline:none')}
          />
        </Modal>
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Remove from team?"
          message={`${member.name} will be removed. Their past completed walks stay on record.`}
          confirmLabel="Remove"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { deleteTeamMember(member.id); actions.showToast('Removed from team'); navigate('/team'); }}
        />
      ) : null}
    </div>
  );
}
