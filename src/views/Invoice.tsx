import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { useAuth } from '../auth/store';
import { usePageHeader } from '../ui/pageHeader';
import { ChevronLeftIcon, DownloadIcon, SparkleIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';
import { btnSecondary } from '../components/Modal';
import { sendEmail, messageEmailHtml } from '../lib/email';

const outlineBtn = 'border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer';
const bigPill = (col: string) => `font-size:11.5px;font-weight:700;padding:5px 13px;border-radius:999px;${col}`;

export function Invoice() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { db, markInvoicePaid, sendInvoice } = useDB();
  const { actions } = useUI();
  const { account } = useAuth();
  const [sending, setSending] = useState(false);

  const inv = db.invoices.find((i) => i.id === invoiceId);
  const client = inv ? db.clients.find((c) => c.id === inv.clientId) : null;
  const pet = inv ? db.pets.find((p) => p.id === inv.petId) : null;

  usePageHeader('Invoice', inv?.id || 'Not found');

  if (!inv || !client) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This invoice no longer exists.</div>
        <button onClick={() => navigate('/payments')} style={st(btnSecondary)}>Back to payments</button>
      </div>
    );
  }

  const total = inv.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
  const totalStr = `£${total.toFixed(2)}`;
  const businessName = account?.businessName || 'PetOS';

  const sendInvoiceEmail = async (kind: 'reminder' | 'invoice' | 'receipt') => {
    setSending(true);
    const subject = kind === 'reminder' ? `Payment reminder — Invoice ${inv.id}` : kind === 'invoice' ? `Invoice ${inv.id} from ${businessName}` : `Receipt — Invoice ${inv.id}`;
    const body = kind === 'reminder'
      ? `This is a friendly reminder that invoice ${inv.id} for ${totalStr} is ${inv.status === 'overdue' ? 'overdue' : 'due'} (${inv.due}) for ${pet?.name || 'your pet'}'s walks.\n\nJust reply to this email if you'd like to arrange payment.`
      : kind === 'invoice'
      ? `Here's your invoice ${inv.id} for ${totalStr}, due ${inv.due}, covering ${pet?.name || 'your pet'}'s walks.`
      : `Thanks for your payment — invoice ${inv.id} for ${totalStr} is marked as paid${inv.paidOn ? ' on ' + inv.paidOn : ''}.`;
    const result = await sendEmail({
      to: client.email,
      subject,
      html: messageEmailHtml(`Hi ${client.name.split(' ')[0]},`, body, `— ${account?.ownerName || businessName}`),
      replyTo: account?.email,
    });
    setSending(false);
    if (!result.ok) { actions.showToast(result.error || 'Could not send email'); return; }
    if (kind === 'invoice') sendInvoice(inv.id);
    actions.showToast(kind === 'reminder' ? 'Reminder sent to ' + client.name : kind === 'invoice' ? 'Invoice sent to ' + client.name : 'Receipt sent to ' + client.name);
  };

  const statusMap: Record<string, { label: string; pill: string; foot: string; glyph: string; ftext: string; primary: string; primaryAction: () => void; secondary: string; secondaryAction?: () => void }> = {
    paid: { label: 'Paid', pill: bigPill('background:var(--color-success-50);color:var(--color-success-700)'), foot: 'background:var(--color-success-50);color:var(--color-success-700)', glyph: '✓', ftext: `Paid ${inv.paidOn || ''} · ${inv.method || ''}`, primary: 'Send receipt', primaryAction: () => sendInvoiceEmail('receipt'), secondary: '' },
    outstanding: { label: 'Due', pill: bigPill('background:var(--color-warning-50);color:var(--color-warning-700)'), foot: 'background:var(--bg-secondary);color:var(--fg-secondary)', glyph: '○', ftext: `Payment due ${inv.due}`, primary: 'Send reminder', primaryAction: () => sendInvoiceEmail('reminder'), secondary: 'Mark as paid', secondaryAction: () => { markInvoicePaid(inv.id); actions.showToast('Marked as paid'); } },
    overdue: { label: 'Overdue', pill: bigPill('background:var(--color-error-50);color:var(--color-error-700)'), foot: 'background:var(--color-error-50);color:var(--color-error-700)', glyph: '!', ftext: `Overdue since ${inv.due}${inv.reminderOn ? ' · last reminder ' + inv.reminderOn : ''}`, primary: 'Send reminder', primaryAction: () => sendInvoiceEmail('reminder'), secondary: 'Mark as paid', secondaryAction: () => { markInvoicePaid(inv.id); actions.showToast('Marked as paid'); } },
    draft: { label: 'Draft', pill: bigPill('background:var(--bg-tertiary);color:var(--fg-tertiary)'), foot: 'background:var(--bg-secondary);color:var(--fg-tertiary)', glyph: '○', ftext: `Draft — not yet sent to ${client.name}`, primary: 'Send invoice', primaryAction: () => sendInvoiceEmail('invoice'), secondary: '' },
  };
  const status = statusMap[inv.status];
  const dueLabel = inv.status === 'paid' ? 'Paid in full' : 'Amount due';
  const amountDue = inv.status === 'paid' ? '£0.00' : totalStr;
  const aiNote = inv.status === 'draft'
    ? `PetOS drafted this from ${pet?.name || 'the'}'s completed walk — review the lines and send when ready.`
    : 'Prepared automatically by PetOS after the walk, and approved by you before sending.';

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:840px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={() => navigate('/payments')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />Payments
        </button>
        <div style={st('flex:1')} />
        <button onClick={() => window.print()} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <DownloadIcon />Print / Save PDF
        </button>
        {status.secondary ? <button disabled={sending} onClick={status.secondaryAction} style={st(outlineBtn)}>{status.secondary}</button> : null}
        <button disabled={sending} onClick={status.primaryAction} style={st(`border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary);${sending ? 'opacity:.65' : ''}`)}>{sending ? 'Sending…' : status.primary}</button>
      </div>

      <div className="print-area" style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('padding:30px 34px 26px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px')}>
          <div>
            <div style={st('display:flex;align-items:center;gap:9px;margin-bottom:12px')}>
              <span style={st('color:var(--fg-brand)')}><SparkleIcon size={22} /></span>
              <span style={st('font-size:16px;font-weight:800;color:var(--fg-primary);letter-spacing:-.01em')}>Chelsea Paws</span>
            </div>
            <div style={st('font-size:13px;color:var(--fg-secondary);line-height:19px')}>48 Flood Street<br />Chelsea, London SW3 5TE</div>
          </div>
          <div style={st('text-align:right')}>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:5px')}>Invoice</div>
            <div style={st('font-size:22px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;letter-spacing:-.01em;margin-bottom:10px')}>{inv.id}</div>
            <span style={st(status.pill)}>{status.label}</span>
          </div>
        </div>
        <div style={st('height:1px;background:var(--border-subtle)')} />

        <div style={st('padding:24px 34px;display:grid;grid-template-columns:1fr 1fr;gap:24px')}>
          <div>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Billed to</div>
            <div style={st('display:flex;align-items:center;gap:11px')}>
              <div style={{ ...st('width:38px;height:38px;border-radius:11px;overflow:hidden;flex:none'), background: pet?.color }}>
                <ImageSlot shape="rect" fit="cover" src={pet?.photo} placeholder={pet?.name[0] || '?'} />
              </div>
              <div>
                <div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary)')}>{client.name}</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{pet?.name}'s owner</div>
              </div>
            </div>
            <div style={st('font-size:12.5px;color:var(--fg-secondary);line-height:19px;margin-top:11px')}>{client.addressLine1}<br />{client.addressLine2}<br />{client.email}</div>
          </div>
          <div style={st('display:flex;flex-direction:column;gap:10px;align-items:flex-end')}>
            <div style={st('display:flex;gap:26px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Issued</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary);width:96px;text-align:right')}>{inv.issued}</span></div>
            <div style={st('display:flex;gap:26px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Due</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary);width:96px;text-align:right')}>{inv.due}</span></div>
            <div style={st('display:flex;gap:26px;align-items:baseline;margin-top:4px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{dueLabel}</span><span style={st('font-size:22px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;width:96px;text-align:right;letter-spacing:-.01em')}>{amountDue}</span></div>
          </div>
        </div>

        <div style={st('padding:0 34px 8px')}>
          <div style={st('display:grid;grid-template-columns:2.6fr 1fr 0.5fr 0.9fr 0.9fr;padding:10px 0;border-bottom:1px solid var(--border-subtle);font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
            <span>Description</span><span>Date</span><span style={st('text-align:right')}>Qty</span><span style={st('text-align:right')}>Rate</span><span style={st('text-align:right')}>Amount</span>
          </div>
          {inv.items.map((it, i) => (
            <div key={i} style={st('display:grid;grid-template-columns:2.6fr 1fr 0.5fr 0.9fr 0.9fr;align-items:center;padding:13px 0;border-bottom:1px solid var(--border-subtle)')}>
              <span><span style={st('display:block;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{it.desc}</span><span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{it.sub}</span></span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{it.date}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary);text-align:right;font-variant-numeric:tabular-nums')}>{it.qty}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary);text-align:right;font-variant-numeric:tabular-nums')}>{it.rate}</span>
              <span style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary);text-align:right;font-variant-numeric:tabular-nums')}>{it.amount}</span>
            </div>
          ))}
          <div style={st('display:flex;justify-content:flex-end;padding:16px 0 22px')}>
            <div style={st('width:260px;display:flex;flex-direction:column;gap:9px')}>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Subtotal</span><span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{totalStr}</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>VAT</span><span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>Not registered</span></div>
              <div style={st('height:1px;background:var(--border-subtle);margin:3px 0')} />
              <div style={st('display:flex;justify-content:space-between;align-items:baseline')}><span style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>Total</span><span style={st('font-size:18px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;letter-spacing:-.01em')}>{totalStr}</span></div>
            </div>
          </div>
        </div>

        <div style={st(`display:flex;align-items:center;gap:11px;padding:15px 34px;border-top:1px solid var(--border-subtle);${status.foot}`)}>
          <span style={st('width:22px;height:22px;border-radius:999px;flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;background:rgba(255,255,255,.55)')}>{status.glyph}</span>
          <span style={st('font-size:13px;font-weight:600')}>{status.ftext}</span>
        </div>
      </div>

      <div style={st('display:flex;align-items:center;gap:9px;margin-top:16px;padding:0 4px')}>
        <span style={st('color:var(--fg-brand)')}><SparkleIcon size={15} /></span>
        <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{aiNote}</span>
      </div>
    </div>
  );
}
