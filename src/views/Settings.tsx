import { useState, type FormEvent } from 'react';
import type { ReactElement } from 'react';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { useAuth } from '../auth/store';
import { usePageHeader } from '../ui/pageHeader';
import { RateIcon, ClockIcon, SparkleIcon, PaymentsIcon, DangerIcon, ChevronRightIcon } from '../components/icons';
import { Modal, fieldLabel, fieldInput, fieldWrap, btnPrimary, btnSecondary } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Settings as SettingsType } from '../db/types';

const toggleOn = 'width:38px;height:22px;border-radius:99px;background:var(--brand-primary);display:inline-flex;align-items:center;padding:2px;flex:none';
const toggleOff = 'width:38px;height:22px;border-radius:99px;background:var(--bg-tertiary);display:inline-flex;align-items:center;padding:2px;flex:none';
const knobOn = 'width:18px;height:18px;border-radius:99px;background:#fff;margin-left:auto';
const knobOff = 'width:18px;height:18px;border-radius:99px;background:#fff';
const navItemStyle = 'display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;font-size:13px;font-weight:600;color:var(--fg-secondary);text-decoration:none;cursor:pointer';

type ToggleKey = 'autoDecline' | 'autoDraft' | 'requireApproval' | 'autoCharge' | 'overdueReminders';
type EditKey = 'rateSolo60' | 'rateSolo30' | 'rateGroup' | 'weekdayHours' | 'weekendHours' | 'reportTone' | 'payoutAccount';

type Row =
  | { kind: 'value'; label: string; hint: string; key: EditKey; format: (s: SettingsType) => string }
  | { kind: 'toggle'; key: ToggleKey; label: string; hint: string };

interface Group { id: string; title: string; desc: string; Icon: (p: { size?: number }) => ReactElement; rows: Row[] }

const groups: Group[] = [
  { id: 'rates', title: 'Rates', desc: 'Default pricing applied to new bookings', Icon: RateIcon, rows: [
    { kind: 'value', label: 'Solo walk · 60 min', hint: 'Default rate applied to new bookings', key: 'rateSolo60', format: (s) => `£${s.rateSolo60.toFixed(2)}` },
    { kind: 'value', label: 'Solo walk · 30 min', hint: '', key: 'rateSolo30', format: (s) => `£${s.rateSolo30.toFixed(2)}` },
    { kind: 'value', label: 'Group walk', hint: 'Per dog', key: 'rateGroup', format: (s) => `£${s.rateGroup.toFixed(2)}` },
  ] },
  { id: 'hours', title: 'Working hours', desc: 'When you accept bookings', Icon: ClockIcon, rows: [
    { kind: 'value', label: 'Weekdays', hint: 'When you accept bookings', key: 'weekdayHours', format: (s) => s.weekdayHours },
    { kind: 'value', label: 'Weekends', hint: '', key: 'weekendHours', format: (s) => s.weekendHours },
    { kind: 'toggle', key: 'autoDecline', label: 'Auto-decline outside hours', hint: 'PetOS turns away clashes for you' },
  ] },
  { id: 'reports', title: 'Reports & AI', desc: 'How PetOS drafts and sends walk reports', Icon: SparkleIcon, rows: [
    { kind: 'value', label: 'Default report tone', hint: 'How walk reports read to owners', key: 'reportTone', format: (s) => ({ warm: 'Warm & chatty', brief: 'Brief & factual', detailed: 'Detailed' }[s.reportTone]) },
    { kind: 'toggle', key: 'autoDraft', label: 'Auto-draft after each walk', hint: 'AI writes, you approve' },
    { kind: 'toggle', key: 'requireApproval', label: 'Require approval before sending', hint: 'Nothing goes out without you' },
  ] },
  { id: 'payments', title: 'Payments & notifications', desc: 'Payouts, charges and reminders', Icon: PaymentsIcon, rows: [
    { kind: 'value', label: 'Payout account', hint: 'Where collected fees land', key: 'payoutAccount', format: (s) => s.payoutAccount },
    { kind: 'toggle', key: 'autoCharge', label: 'Auto-charge card on file', hint: 'Charge 3 days after the walk' },
    { kind: 'toggle', key: 'overdueReminders', label: 'Overdue reminders', hint: 'Nudge late payers automatically' },
  ] },
];

export function Settings() {
  const { db, updateSettings, exportAllDataJSON } = useDB();
  const { actions } = useUI();
  const { account, deleteAccount } = useAuth();
  const [editing, setEditing] = useState<Row | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  usePageHeader('Settings', 'Rates, hours and preferences');

  const openEdit = (row: Row) => {
    if (row.kind !== 'value') return;
    setEditing(row);
    setEditValue(row.key.startsWith('rate') ? String(db.settings[row.key]) : row.key === 'reportTone' ? db.settings.reportTone : (db.settings[row.key] as string));
  };

  const submitEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing || editing.kind !== 'value') return;
    if (editing.key.startsWith('rate')) {
      const n = parseFloat(editValue);
      if (!Number.isFinite(n) || n < 0) return;
      updateSettings({ [editing.key]: n } as Partial<SettingsType>);
    } else {
      updateSettings({ [editing.key]: editValue } as Partial<SettingsType>);
    }
    setEditing(null);
    actions.showToast('Settings updated');
  };

  const doExport = () => {
    const blob = new Blob([exportAllDataJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petos-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    actions.showToast('Export downloaded');
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);display:grid;grid-template-columns:272px 1fr;gap:22px;align-items:start')}>
      <div style={st('position:sticky;top:0;display:flex;flex-direction:column;gap:14px')}>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
          <div style={st('width:50px;height:50px;border-radius:14px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;margin-bottom:12px')}>
            {(account?.businessName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div style={st('font-size:15.5px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em;margin-bottom:2px')}>{account?.businessName}</div>
          <div style={st('font-size:12px;color:var(--fg-tertiary);margin-bottom:13px')}>{account?.email}</div>
          <span style={st('display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--fg-brand);background:var(--bg-brand-subtle);padding:5px 10px;border-radius:999px')}>{account?.plan}</span>
        </div>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:8px;display:flex;flex-direction:column;gap:1px')}>
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="settings-nav-link" style={st(navItemStyle)}>
              <span style={st('flex:none;display:inline-flex')}><g.Icon size={17} /></span>
              <span style={st('flex:1')}>{g.title}</span>
            </a>
          ))}
          <a href="#danger" className="settings-nav-link" style={st(`${navItemStyle};color:var(--color-error-700)`)}>
            <span style={st('flex:none;display:inline-flex')}><DangerIcon size={16} /></span>
            <span style={st('flex:1')}>Danger zone</span>
          </a>
        </div>
      </div>

      <div style={st('display:flex;flex-direction:column;gap:16px')}>
        {groups.map((g) => (
          <div key={g.id} id={g.id} style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden;scroll-margin-top:20px')}>
            <div style={st('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-subtle)')}>
              <span style={st('width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--bg-brand-subtle);color:var(--fg-brand)')}><g.Icon size={17} /></span>
              <div><div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary)')}>{g.title}</div><div style={st('font-size:12px;color:var(--fg-tertiary)')}>{g.desc}</div></div>
            </div>
            {g.rows.map((r) => (
              <div key={r.label} style={st('display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border-subtle)')}>
                <div style={st('flex:1')}>
                  <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.label}</div>
                  <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{r.hint}</div>
                </div>
                {r.kind === 'toggle' ? (
                  <button onClick={() => updateSettings({ [r.key]: !db.settings[r.key] } as Partial<SettingsType>)} style={st(db.settings[r.key] ? toggleOn : toggleOff)}>
                    <span style={st(db.settings[r.key] ? knobOn : knobOff)} />
                  </button>
                ) : (
                  <button onClick={() => openEdit(r)} style={st('display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:13px;font-weight:600;color:var(--fg-secondary);background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:9px;padding:7px 10px;cursor:pointer')}>
                    {r.format(db.settings)}<ChevronRightIcon size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        <div id="danger" style={st("background:var(--bg-primary);border:1px solid var(--color-error-500);border-radius:18px;overflow:hidden;scroll-margin-top:20px")}>
          <div style={st('display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--color-error-500)')}>
            <span style={st('width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:none;background:var(--color-error-50);color:var(--color-error-700)')}><DangerIcon /></span>
            <div><div style={st('font-size:14.5px;font-weight:700;color:var(--color-error-700)')}>Danger zone</div><div style={st('font-size:12px;color:var(--fg-tertiary)')}>These actions can't be undone</div></div>
          </div>
          <div style={st('display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border-subtle)')}>
            <div style={st('flex:1')}>
              <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>Export all data</div>
              <div style={st('font-size:12px;color:var(--fg-tertiary)')}>Download clients, pets and invoices as JSON</div>
            </div>
            <button onClick={doExport} style={st('font-family:inherit;font-size:13px;font-weight:600;color:var(--fg-secondary);background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:9px;padding:8px 13px;cursor:pointer')}>Export</button>
          </div>
          <div style={st('display:flex;align-items:center;gap:14px;padding:14px 20px')}>
            <div style={st('flex:1')}>
              <div style={st('font-size:13.5px;font-weight:600;color:var(--color-error-700)')}>Delete account</div>
              <div style={st('font-size:12px;color:var(--fg-tertiary)')}>Permanently remove your business and all data from this browser</div>
            </div>
            <button onClick={() => setConfirmDelete(true)} style={st('font-family:inherit;font-size:13px;font-weight:600;color:var(--color-error-700);background:var(--bg-primary);border:1px solid var(--color-error-500);border-radius:9px;padding:8px 13px;cursor:pointer')}>Delete</button>
          </div>
        </div>
      </div>

      {editing ? (
        <Modal title={`Edit "${editing.label}"`} onClose={() => setEditing(null)} footer={<>
          <button onClick={() => setEditing(null)} style={st(btnSecondary)}>Cancel</button>
          <button type="submit" form="edit-setting-form" style={st(btnPrimary)}>Save</button>
        </>}>
          <form id="edit-setting-form" onSubmit={submitEdit}>
            <div style={st(fieldWrap)}>
              <label style={st(fieldLabel)}>{editing.label}</label>
              {editing.key === 'reportTone' ? (
                <select value={editValue} onChange={(e) => setEditValue(e.target.value)} style={st(fieldInput)}>
                  <option value="warm">Warm & chatty</option>
                  <option value="brief">Brief & factual</option>
                  <option value="detailed">Detailed</option>
                </select>
              ) : (
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  type={editing.key.startsWith('rate') ? 'number' : 'text'}
                  step={editing.key.startsWith('rate') ? '0.5' : undefined}
                  style={st(fieldInput)}
                  autoFocus
                />
              )}
            </div>
          </form>
        </Modal>
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete your account?"
          message="This permanently removes your business account and every pet, client, walk, invoice and report stored in this browser. This cannot be undone."
          confirmLabel="Delete everything"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { deleteAccount(); }}
        />
      ) : null}
    </div>
  );
}
