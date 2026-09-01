import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import { todayISO, addDays } from '../db/dates';
import { SparkleIcon, WarningIcon } from '../components/icons';

const DAILY_CAPACITY = 6;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const cardStyle = 'background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px';

function amountOf(items: { amount: string }[]) {
  return items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
}

function gbp(n: number) {
  return `£${n.toFixed(2)}`;
}

function isoDaysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000);
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

export function Business() {
  const { db, dismissRec } = useDB();
  const { actions } = useUI();
  const navigate = useNavigate();
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

  const outstandingInvoices = db.invoices.filter((i) => i.status === 'outstanding' || i.status === 'overdue');
  const totalOutstanding = amountOf(outstandingInvoices.flatMap((i) => i.items));
  const overdueInvoices = db.invoices.filter((i) => i.status === 'overdue');
  const totalOverdue = amountOf(overdueInvoices.flatMap((i) => i.items));
  const oldestOverdueDays = overdueInvoices.length > 0 ? Math.max(...overdueInvoices.map((i) => isoDaysBetween(i.due, today))) : 0;

  const revenueByClient = new Map<string, number>();
  for (const inv of db.invoices) {
    if (inv.status === 'draft') continue;
    revenueByClient.set(inv.clientId, (revenueByClient.get(inv.clientId) ?? 0) + amountOf(inv.items));
  }
  const topClients = [...revenueByClient.entries()]
    .map(([clientId, amount]) => ({ client: db.clients.find((c) => c.id === clientId), amount }))
    .filter((r): r is { client: NonNullable<typeof r.client>; amount: number } => !!r.client)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const atRiskClients = db.clients
    .map((c) => {
      const petIds = new Set(db.pets.filter((p) => p.clientId === c.id).map((p) => p.id));
      const lastWalk = db.walks
        .filter((w) => petIds.has(w.petId) && w.status !== 'cancelled')
        .reduce<string | null>((latest, w) => (!latest || w.date > latest ? w.date : latest), null);
      const daysSince = isoDaysBetween(lastWalk ?? c.memberSince, today);
      return { client: c, lastWalk, daysSince };
    })
    .filter((r) => r.daysSince >= 21)
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 5);

  const thisMonthKey = today.slice(0, 7);
  const doneWalksThisMonth = db.walks.filter((w) => w.status === 'done' && w.date.startsWith(thisMonthKey));
  const leaderboard = db.team
    .map((t) => {
      const walks = doneWalksThisMonth.filter((w) => w.walkerId === t.id);
      return { member: t, earnings: walks.reduce((s, w) => s + w.price, 0), count: walks.length };
    })
    .sort((a, b) => b.earnings - a.earnings);
  const maxEarnings = Math.max(1, ...leaderboard.map((l) => l.earnings));

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

      <div style={st('display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;margin-bottom:18px')}>
        <div style={st(cardStyle)}>
          <div style={st('display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px')}>
            <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary)')}>Invoices</div>
            <button onClick={() => navigate('/payments')} style={st('border:none;background:transparent;color:var(--fg-brand);font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;padding:0')}>View all →</button>
          </div>
          <div style={st('display:flex;gap:28px;margin-bottom:14px')}>
            <div>
              <div style={st('font-size:12px;color:var(--fg-tertiary);font-weight:600;margin-bottom:4px')}>Outstanding</div>
              <div style={st('font-size:22px;font-weight:700;color:var(--fg-primary)')}>{gbp(totalOutstanding)}</div>
            </div>
            <div>
              <div style={st('font-size:12px;color:var(--fg-tertiary);font-weight:600;margin-bottom:4px')}>Overdue</div>
              <div style={st(`font-size:22px;font-weight:700;color:${totalOverdue > 0 ? 'var(--color-error-700)' : 'var(--fg-primary)'}`)}>{gbp(totalOverdue)}</div>
            </div>
          </div>
          {overdueInvoices.length > 0 ? (
            <div style={st('display:flex;align-items:center;gap:8px;background:var(--color-error-50);border-radius:10px;padding:10px 12px;color:var(--color-error-700);font-size:12.5px;font-weight:600')}>
              <WarningIcon size={15} />
              {overdueInvoices.length} overdue invoice{overdueInvoices.length === 1 ? '' : 's'} · oldest {oldestOverdueDays}d
            </div>
          ) : (
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>All caught up — no overdue invoices.</div>
          )}
        </div>

        <div style={st(cardStyle)}>
          <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:2px')}>Top clients</div>
          <div style={st('font-size:12px;color:var(--fg-tertiary);margin-bottom:14px')}>by total billed, all time</div>
          {topClients.length === 0 ? (
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>No billed invoices yet.</div>
          ) : (
            <div style={st('display:flex;flex-direction:column;gap:2px')}>
              {topClients.map((r, i) => (
                <button key={r.client.id} onClick={() => navigate(`/clients/${r.client.id}`)} style={st('display:flex;align-items:center;gap:12px;border:none;background:transparent;font-family:inherit;text-align:left;cursor:pointer;padding:8px 6px;border-radius:9px;width:100%')}>
                  <span style={st('width:20px;font-size:12.5px;font-weight:700;color:var(--fg-tertiary);flex:none')}>{i + 1}</span>
                  <span style={st('flex:1;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.client.name}</span>
                  <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary)')}>{gbp(r.amount)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={st('display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;margin-bottom:18px')}>
        <div style={st(cardStyle)}>
          <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:2px')}>At risk</div>
          <div style={st('font-size:12px;color:var(--fg-tertiary);margin-bottom:14px')}>no walk booked in 21+ days</div>
          {atRiskClients.length === 0 ? (
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>Every client's been walked recently — nice work.</div>
          ) : (
            <div style={st('display:flex;flex-direction:column;gap:2px')}>
              {atRiskClients.map((r) => (
                <button key={r.client.id} onClick={() => navigate(`/clients/${r.client.id}`)} style={st('display:flex;align-items:center;gap:12px;border:none;background:transparent;font-family:inherit;text-align:left;cursor:pointer;padding:8px 6px;border-radius:9px;width:100%')}>
                  <span style={st('flex:1;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.client.name}</span>
                  <span style={st('font-size:12.5px;font-weight:600;color:var(--color-error-700)')}>{r.lastWalk ? `${r.daysSince}d since last walk` : 'Never booked'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={st(cardStyle)}>
          <div style={st('font-size:15px;font-weight:700;color:var(--fg-primary);margin-bottom:2px')}>Team leaderboard</div>
          <div style={st('font-size:12px;color:var(--fg-tertiary);margin-bottom:14px')}>earnings this month, completed walks</div>
          {leaderboard.length === 0 ? (
            <div style={st('font-size:13px;color:var(--fg-tertiary)')}>No team members yet.</div>
          ) : (
            <div style={st('display:flex;flex-direction:column;gap:12px')}>
              {leaderboard.map((r) => (
                <button key={r.member.id} onClick={() => navigate(`/team/${r.member.id}`)} style={st('display:flex;flex-direction:column;gap:6px;border:none;background:transparent;font-family:inherit;text-align:left;cursor:pointer;padding:0;width:100%')}>
                  <div style={st('display:flex;align-items:center;gap:10px')}>
                    <span style={{ ...st('width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex:none'), background: r.member.color }}>{initials(r.member.name)}</span>
                    <span style={st('flex:1;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.member.name}</span>
                    <span style={st('font-size:12px;color:var(--fg-tertiary);font-weight:600')}>{r.count} walk{r.count === 1 ? '' : 's'}</span>
                    <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary)')}>{gbp(r.earnings)}</span>
                  </div>
                  <div style={st('height:6px;border-radius:99px;background:var(--bg-tertiary);overflow:hidden')}><div style={st(`width:${Math.round((r.earnings / maxEarnings) * 100)}%;height:100%;background:var(--brand-primary);border-radius:99px`)} /></div>
                </button>
              ))}
            </div>
          )}
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
