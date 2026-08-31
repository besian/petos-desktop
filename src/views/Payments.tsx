import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO } from '../db/dates';

const payPill: Record<string, [string, string]> = {
  paid: ['Paid', 'background:var(--color-success-50);color:var(--color-success-700)'],
  outstanding: ['Due', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
  overdue: ['Overdue', 'background:var(--color-error-50);color:var(--color-error-700)'],
  draft: ['Draft', 'background:var(--bg-tertiary);color:var(--fg-tertiary)'],
};
const payAction: Record<string, string> = { paid: 'View', outstanding: 'Remind', overdue: 'Remind', draft: 'Send' };

function amountOf(items: { amount: string }[]) {
  return items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
}

export function Payments() {
  const navigate = useNavigate();
  const { db, sendInvoice } = useDB();

  const monthPrefix = todayISO().slice(0, 7);
  const monthInvoices = db.invoices.filter((i) => i.issued.startsWith(monthPrefix));
  const collected = monthInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + amountOf(i.items), 0);
  const expected = monthInvoices.reduce((s, i) => s + amountOf(i.items), 0);
  const outstanding = db.invoices.filter((i) => i.status === 'outstanding');
  const overdue = db.invoices.filter((i) => i.status === 'overdue');
  const drafts = db.invoices.filter((i) => i.status === 'draft');
  const clientById = new Map(db.clients.map((c) => [c.id, c]));

  usePageHeader('Payments', `This month · £${collected.toFixed(0)} collected of £${expected.toFixed(0)}`);

  const kpis = [
    { label: 'Collected · this month', value: `£${collected.toFixed(0)}`, sub: `${monthInvoices.filter((i) => i.status === 'paid').length} invoices`, subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
    { label: 'Outstanding', value: `£${outstanding.reduce((s, i) => s + amountOf(i.items), 0).toFixed(0)}`, sub: `${outstanding.length} invoices`, subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
    { label: 'Overdue', value: `£${overdue.reduce((s, i) => s + amountOf(i.items), 0).toFixed(0)}`, sub: overdue[0] ? `${overdue.length} · ${clientById.get(overdue[0].clientId)?.name || ''}` : 'None', subStyle: 'font-size:12px;color:var(--color-error-700);margin-top:2px;font-weight:600' },
    { label: 'Drafts', value: `£${drafts.reduce((s, i) => s + amountOf(i.items), 0).toFixed(0)}`, sub: `${drafts.length} draft${drafts.length === 1 ? '' : 's'}`, subStyle: 'font-size:12px;color:var(--fg-tertiary);margin-top:2px' },
  ];

  const rows = [...db.invoices].sort((a, b) => b.issued.localeCompare(a.issued));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px')}>
        {kpis.map((k) => (
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
        {rows.length === 0 ? (
          <div style={st('padding:40px;text-align:center;font-size:13.5px;color:var(--fg-tertiary)')}>No invoices yet.</div>
        ) : rows.map((inv) => {
          const client = clientById.get(inv.clientId);
          const action = payAction[inv.status];
          return (
            <div key={inv.id} style={st('display:grid;grid-template-columns:1.4fr 1.4fr 1fr 1fr 1fr;align-items:center;padding:13px 20px;border-bottom:1px solid var(--border-subtle)')}>
              <span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{inv.id}</span>
              <span style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{client?.name || '—'}</span>
              <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>£{amountOf(inv.items).toFixed(2)}</span>
              <span><span style={st(`font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:999px;${payPill[inv.status][1]}`)}>{payPill[inv.status][0]}</span></span>
              <span style={st('text-align:right')}>
                <button
                  onClick={() => (action === 'View' ? navigate(`/payments/${inv.id}`) : action === 'Send' ? (sendInvoice(inv.id), navigate(`/payments/${inv.id}`)) : navigate(`/payments/${inv.id}`))}
                  style={st('font-family:inherit;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:9px;cursor:pointer;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary)')}
                >
                  {action}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
