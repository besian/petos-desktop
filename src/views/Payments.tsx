import { st } from '../lib/st';
import { useApp } from '../state';
import { payDef } from '../data';

const payKpis = [
  { label: 'Collected · July', value: '£1,486', sub: '18 invoices', subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
  { label: 'Outstanding', value: '£654', sub: '5 invoices', subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
  { label: 'Overdue', value: '£20', sub: '1 · James Okafor', subStyle: 'font-size:12px;color:var(--color-error-700);margin-top:2px;font-weight:600' },
  { label: 'Drafts', value: '£16', sub: '1 · Oscar', subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
];

const payPill: Record<string, [string, string]> = {
  paid: ['Paid', 'background:var(--color-success-50);color:var(--color-success-700)'],
  outstanding: ['Due', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  overdue: ['Overdue', 'background:var(--color-error-50);color:var(--color-error-700)'],
  draft: ['Draft', 'background:var(--bg-tertiary);color:var(--fg-tertiary)'],
};
const payAction: Record<string, string> = { paid: 'View', outstanding: 'Remind', overdue: 'Remind', draft: 'Send' };

export function Payments() {
  const { actions } = useApp();
  const payRows = payDef.map(([no, client, amount, status]) => ({
    no, client, amount,
    status: payPill[status][0],
    pillStyle: `font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;${payPill[status][1]}`,
    actionLabel: payAction[status],
  }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px')}>
        {payKpis.map((k) => (
          <div key={k.label} style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:16px;padding:16px 17px;box-shadow:var(--card-shadow)')}>
            <div style={st('font-size:12.5px;font-weight:600;color:var(--fg-tertiary);margin-bottom:10px')}>{k.label}</div>
            <div style={st('font-size:25px;font-weight:700;color:var(--fg-primary);font-variant-numeric:tabular-nums;letter-spacing:-.02em')}>{k.value}</div>
            <div style={st(k.subStyle)}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:1.4fr 1.4fr 1fr 1fr 1fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
          <span>Invoice</span><span>Client</span><span>Amount</span><span>Status</span><span style={st('text-align:right')}>Action</span>
        </div>
        {payRows.map((i) => (
          <div key={i.no} style={st('display:grid;grid-template-columns:1.4fr 1.4fr 1fr 1fr 1fr;align-items:center;padding:13px 20px;border-bottom:1px solid var(--border-subtle)')}>
            <span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{i.no}</span>
            <span style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{i.client}</span>
            <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>{i.amount}</span>
            <span><span style={st(i.pillStyle)}>{i.status}</span></span>
            <span style={st('text-align:right')}>
              <button
                onClick={() => actions.openInvoice(i.no)}
                style={st('font-family:inherit;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:9px;cursor:pointer;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary)')}
              >
                {i.actionLabel}
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
