import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO, addDays } from '../db/dates';
import { SparkleIcon } from '../components/icons';

const DAILY_CAPACITY = 6;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function amountOf(items: { amount: string }[]) {
  return items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
}

export function Business() {
  const { db, dismissRec } = useDB();
  const { actions } = useUI();
  usePageHeader('Business insights', 'Revenue, retention and capacity');

  const today = todayISO();
  const months: { key: string; label: string }[] = [];
  const [y0, m0] = today.split('-').map(Number);
  for (let i = 5; i >= 0; i--) {
    let y = y0, m = m0 - i;
    while (m < 1) { m += 12; y -= 1; }
    months.push({ key: `${y}-${String(m).padStart(2, '0')}`, label: MONTH_SHORT[m - 1] });
  }
  const revByMonth = months.map((mo) => db.invoices.filter((i) => i.issued.startsWith(mo.key) && i.status !== 'draft').reduce((s, i) => s + amountOf(i.items), 0));
  const maxRev = Math.max(1, ...revByMonth);
  const thisMonth = revByMonth[5];
  const lastMonth = revByMonth[4];
  const pctChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  const revBars = revByMonth.map((v, i) => ({ label: months[i].label, pct: Math.round((v / maxRev) * 100), current: i === 5 }));

  const thirtyDaysAgo = addDays(today, -30);
  const activeClients = new Set(db.walks.filter((w) => w.date >= thirtyDaysAgo && w.date <= today).map((w) => db.pets.find((p) => p.id === w.petId)?.clientId).filter(Boolean));
  const retention = db.clients.length > 0 ? Math.round((activeClients.size / db.clients.length) * 100) : 0;

  const weeksSpan = 4;
  const windowStart = addDays(today, -7 * weeksSpan);
  const recentWalks = db.walks.filter((w) => w.date >= windowStart && w.date <= today && w.status !== 'cancelled');
  const bookingFreq = db.clients.length > 0 ? (recentWalks.length / db.clients.length / weeksSpan).toFixed(1) : '0.0';

  const todaysWalks = db.walks.filter((w) => w.date === today && w.status !== 'cancelled');
  const capacityUsed = db.team.length > 0 ? Math.min(100, Math.round((todaysWalks.length / (db.team.length * DAILY_CAPACITY)) * 100)) : 0;
  const teamUtil = db.team.length > 0 ? Math.round(db.team.reduce((s, t) => s + Math.min(100, (todaysWalks.filter((w) => w.walkerId === t.id).length / DAILY_CAPACITY) * 100), 0) / db.team.length) : 0;

  const healthRows = [
    { label: 'Client retention (30d)', value: `${retention}%`, pct: retention },
    { label: 'Booking frequency', value: `${bookingFreq}×/wk`, pct: Math.min(100, Number(bookingFreq) * 40) },
    { label: 'Capacity used today', value: `${capacityUsed}%`, pct: capacityUsed },
    { label: 'Team utilisation today', value: `${teamUtil}%`, pct: teamUtil },
  ];

  const recs = db.recs.filter((r) => !r.dismissed);

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:grid;grid-template-columns:1.4fr 1fr;gap:18px;align-items:start;margin-bottom:18px')}>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
          <div style={st('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px')}>
            <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>Revenue · last 6 months</div>
            <div style={st(`font-size:13px;font-weight:600;color:${pctChange >= 0 ? 'var(--fg-brand)' : 'var(--color-error-700)'}`)}>{pctChange >= 0 ? '+' : ''}{pctChange}% vs last month</div>
          </div>
          <div style={st('display:flex;align-items:flex-end;gap:14px;height:150px')}>
            {revBars.map((b) => (
              <div key={b.label} style={st('flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end')}>
                <div style={st(`width:100%;border-radius:8px 8px 0 0;height:${b.pct}%;min-height:4px;background:${b.current ? 'var(--brand-primary)' : 'var(--bg-tertiary)'}`)} />
                <span style={st('font-size:11.5px;color:var(--fg-tertiary);font-weight:600')}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
          <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:16px')}>Health</div>
          <div style={st('display:flex;flex-direction:column;gap:16px')}>
            {healthRows.map((h) => (
              <div key={h.label}>
                <div style={st('display:flex;justify-content:space-between;margin-bottom:6px')}><span style={st('font-size:13px;color:var(--fg-secondary);font-weight:500')}>{h.label}</span><span style={st('font-size:13px;font-weight:700;color:var(--fg-primary)')}>{h.value}</span></div>
                <div style={st('height:8px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden')}><div style={st(`width:${Math.min(100, h.pct)}%;height:100%;background:var(--brand-primary);border-radius:99px`)} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:18px;padding:18px 20px')}>
        <div style={st('display:flex;align-items:center;gap:9px;margin-bottom:14px')}>
          <span style={st('color:var(--fg-brand)')}><SparkleIcon /></span>
          <span style={st('font-size:13px;font-weight:700;color:var(--fg-brand)')}>Recommendations · you approve each one</span>
        </div>
        {recs.length === 0 ? (
          <div style={st('font-size:13.5px;color:var(--fg-tertiary)')}>No new recommendations right now.</div>
        ) : (
          <div style={st('display:flex;flex-direction:column;gap:10px')}>
            {recs.map((r) => (
              <div key={r.id} style={st('display:flex;align-items:center;gap:14px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:13px;padding:13px 15px')}>
                <div style={st('flex:1')}>
                  <div style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{r.title}</div>
                  <div style={st('font-size:12.5px;color:var(--fg-tertiary);margin-top:1px')}>{r.sub}</div>
                </div>
                <button onClick={() => dismissRec(r.id)} style={st('border:1px solid var(--border-default);background:transparent;color:var(--fg-tertiary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:9px;cursor:pointer')}>Dismiss</button>
                <button onClick={() => { dismissRec(r.id); actions.showToast('Queued: ' + r.title); }} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer')}>{r.cta}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
