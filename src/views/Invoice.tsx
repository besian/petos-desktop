import { st } from '../lib/st';
import { useApp } from '../state';
import { invDefs, petColors } from '../data';
import { ChevronLeftIcon, DownloadIcon, SparkleIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';

const outlineBtn = 'border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer';
const bigPill = (col: string) => `font-size:11.5px;font-weight:700;padding:5px 13px;border-radius:999px;${col}`;

export function Invoice() {
  const { state, actions } = useApp();
  const invRaw = invDefs[state.invoiceNo] || invDefs['CDC-1044'];
  const invNo = state.invoiceNo;
  const effStatus = state.paidIds.includes(invNo)
    ? 'paid'
    : (invRaw.status === 'draft' && state.sentIds.includes(invNo)) ? 'outstanding' : invRaw.status;
  const justPaid = state.paidIds.includes(invNo) && invRaw.status !== 'paid';
  const justSent = state.sentIds.includes(invNo) && invRaw.status === 'draft';
  const invTotalNum = invRaw.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
  const invTotal = '£' + invTotalNum.toFixed(2);

  const invStatusMap: Record<string, { label: string; pill: string; foot: string; glyph: string; ftext: string; primary: string; secondary: string }> = {
    paid: { label: 'Paid', pill: bigPill('background:var(--color-success-50);color:var(--color-success-700)'), foot: 'background:var(--color-success-50);color:var(--color-success-700)', glyph: '✓', ftext: justPaid ? 'Marked as paid just now' : `Paid ${invRaw.paidOn} · ${invRaw.method || ''}`, primary: 'Send receipt', secondary: '' },
    outstanding: { label: 'Due', pill: bigPill('background:var(--color-warning-50);color:var(--color-warning-700)'), foot: 'background:var(--bg-secondary);color:var(--fg-secondary)', glyph: '○', ftext: justSent ? `Sent to ${invRaw.client} just now · payment due on the day` : `Payment due ${invRaw.due} · auto-charge scheduled for that morning`, primary: 'Send reminder', secondary: 'Mark as paid' },
    overdue: { label: 'Overdue', pill: bigPill('background:var(--color-error-50);color:var(--color-error-700)'), foot: 'background:var(--color-error-50);color:var(--color-error-700)', glyph: '!', ftext: `Overdue since ${invRaw.due}${invRaw.reminderOn ? ' · last reminder ' + invRaw.reminderOn : ''}`, primary: 'Send reminder', secondary: 'Mark as paid' },
    draft: { label: 'Draft', pill: bigPill('background:var(--bg-tertiary);color:var(--fg-tertiary)'), foot: 'background:var(--bg-secondary);color:var(--fg-tertiary)', glyph: '○', ftext: `Draft — not yet sent to ${invRaw.client}`, primary: 'Send invoice', secondary: 'Edit lines' },
  };
  const invStatus = invStatusMap[effStatus];

  const invActionFor = (label: string) => {
    if (label === 'Mark as paid') return () => actions.markPaid(invNo);
    if (label === 'Edit lines') return () => actions.showToast('Edit lines · ' + invRaw.client);
    return () => actions.sendInvoice(invNo, label, invRaw.client);
  };

  const dueLabel = effStatus === 'paid' ? 'Paid in full' : 'Amount due';
  const amountDue = effStatus === 'paid' ? '£0.00' : invTotal;
  const aiNote = effStatus === 'draft'
    ? `PetOS drafted this from ${invRaw.petName}’s completed walk — review the lines and send when ready.`
    : 'Prepared automatically by PetOS after the walk, and approved by you before sending.';

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:840px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={() => actions.go('payments')} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />Payments
        </button>
        <div style={st('flex:1')} />
        <button onClick={actions.noop} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <DownloadIcon />Download PDF
        </button>
        {invStatus.secondary ? (
          <button onClick={invActionFor(invStatus.secondary)} style={st(outlineBtn)}>{invStatus.secondary}</button>
        ) : null}
        <button onClick={invActionFor(invStatus.primary)} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          {invStatus.primary}
        </button>
      </div>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('padding:30px 34px 26px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px')}>
          <div>
            <div style={st('display:flex;align-items:center;gap:9px;margin-bottom:12px')}>
              <span style={st('color:var(--fg-brand)')}><SparkleIcon size={22} /></span>
              <span style={st('font-size:16px;font-weight:800;color:var(--fg-primary);letter-spacing:-.01em')}>Chelsea Paws</span>
            </div>
            <div style={st('font-size:13px;color:var(--fg-secondary);line-height:19px')}>Sarah Mitchell<br />48 Flood Street<br />Chelsea, London SW3 5TE<br />sarah@chelseapaws.co.uk</div>
          </div>
          <div style={st('text-align:right')}>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:5px')}>Invoice</div>
            <div style={st('font-size:22px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;letter-spacing:-.01em;margin-bottom:10px')}>{state.invoiceNo}</div>
            <span style={st(invStatus.pill)}>{invStatus.label}</span>
          </div>
        </div>
        <div style={st('height:1px;background:var(--border-subtle)')} />

        <div style={st('padding:24px 34px;display:grid;grid-template-columns:1fr 1fr;gap:24px')}>
          <div>
            <div style={st('font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-quaternary);margin-bottom:10px')}>Billed to</div>
            <div style={st('display:flex;align-items:center;gap:11px')}>
              <div style={{ ...st('width:38px;height:38px;border-radius:11px;overflow:hidden;flex:none'), background: petColors[invRaw.pet] }}>
                <ImageSlot shape="rect" fit="cover" placeholder={invRaw.petName[0]} />
              </div>
              <div>
                <div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary)')}>{invRaw.client}</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{invRaw.petName}’s owner</div>
              </div>
            </div>
            <div style={st('font-size:12.5px;color:var(--fg-secondary);line-height:19px;margin-top:11px')}>{invRaw.addr[0]}<br />{invRaw.addr[1]}<br />{invRaw.email}</div>
          </div>
          <div style={st('display:flex;flex-direction:column;gap:10px;align-items:flex-end')}>
            <div style={st('display:flex;gap:26px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Issued</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary);width:96px;text-align:right')}>{invRaw.issued}</span></div>
            <div style={st('display:flex;gap:26px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>Due</span><span style={st('font-size:12.5px;font-weight:600;color:var(--fg-primary);width:96px;text-align:right')}>{invRaw.due}</span></div>
            <div style={st('display:flex;gap:26px;align-items:baseline;margin-top:4px')}><span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{dueLabel}</span><span style={st('font-size:22px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;width:96px;text-align:right;letter-spacing:-.01em')}>{amountDue}</span></div>
          </div>
        </div>

        <div style={st('padding:0 34px 8px')}>
          <div style={st('display:grid;grid-template-columns:2.6fr 1fr 0.5fr 0.9fr 0.9fr;padding:10px 0;border-bottom:1px solid var(--border-subtle);font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
            <span>Description</span><span>Date</span><span style={st('text-align:right')}>Qty</span><span style={st('text-align:right')}>Rate</span><span style={st('text-align:right')}>Amount</span>
          </div>
          {invRaw.items.map((it, i) => (
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
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>Subtotal</span><span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{invTotal}</span></div>
              <div style={st('display:flex;justify-content:space-between')}><span style={st('font-size:13px;color:var(--fg-tertiary)')}>VAT</span><span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>Not registered</span></div>
              <div style={st('height:1px;background:var(--border-subtle);margin:3px 0')} />
              <div style={st('display:flex;justify-content:space-between;align-items:baseline')}><span style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>Total</span><span style={st('font-size:18px;font-weight:800;color:var(--fg-primary);font-variant-numeric:tabular-nums;letter-spacing:-.01em')}>{invTotal}</span></div>
            </div>
          </div>
        </div>

        <div style={st(`display:flex;align-items:center;gap:11px;padding:15px 34px;border-top:1px solid var(--border-subtle);${invStatus.foot}`)}>
          <span style={st('width:22px;height:22px;border-radius:999px;flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;background:rgba(255,255,255,.55)')}>{invStatus.glyph}</span>
          <span style={st('font-size:13px;font-weight:600')}>{invStatus.ftext}</span>
        </div>
      </div>

      <div style={st('display:flex;align-items:center;gap:9px;margin-top:16px;padding:0 4px')}>
        <span style={st('color:var(--fg-brand)')}><SparkleIcon size={15} /></span>
        <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{aiNote}</span>
      </div>
    </div>
  );
}
