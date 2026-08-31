import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { st } from '../lib/st';
import { useUI } from '../ui/store';
import { useAuth } from '../auth/store';
import { useDB } from '../db/store';
import {
  OverviewIcon, ScheduleIcon, PawIcon, ClientsIcon, ReportsIcon, PaymentsIcon, TeamIcon, BusinessIcon, SettingsIcon, LogoutIcon,
} from './icons';

const navDef: [string, string, (p: { size?: number }) => ReactElement, boolean][] = [
  ['/', 'Overview', OverviewIcon, false],
  ['/schedule', 'Schedule', ScheduleIcon, false],
  ['/pets', 'Pets', PawIcon, false],
  ['/clients', 'Clients', ClientsIcon, false],
  ['/reports', 'Reports', ReportsIcon, true],
  ['/payments', 'Payments', PaymentsIcon, true],
  ['/team', 'Team', TeamIcon, false],
  ['/business', 'Business', BusinessIcon, false],
  ['/settings', 'Settings', SettingsIcon, false],
];

export function Sidebar() {
  const { state, actions } = useUI();
  const { account, logout } = useAuth();
  const { db } = useDB();

  const pendingReports = db.reports.filter((r) => r.status === 'pending').length;
  const dueInvoices = db.invoices.filter((i) => i.status === 'outstanding' || i.status === 'overdue').length;
  const badgeFor = (key: string) => (key === '/reports' ? pendingReports : key === '/payments' ? dueInvoices : 0);

  return (
    <div style={st('width:236px;flex:none;background:var(--bg-primary);border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;padding:20px 14px')}>
      <div style={st('display:flex;align-items:center;gap:10px;padding:4px 8px 20px')}>
        <div style={st('width:34px;height:34px;border-radius:10px;background:var(--brand-primary);display:flex;align-items:center;justify-content:center;color:var(--brand-on-primary);flex:none')}>
          <PawIcon size={20} />
        </div>
        <div style={st('min-width:0')}>
          <div style={st('font-size:17px;font-weight:800;letter-spacing:-.02em;color:var(--fg-primary);line-height:1')}>PetOS</div>
          <div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{account?.businessName}</div>
        </div>
      </div>
      <div className="ps" style={st('flex:1;display:flex;flex-direction:column;gap:2px;overflow-y:auto')}>
        {navDef.map(([to, label, Icon, hasBadge]) => {
          const badge = hasBadge ? badgeFor(to) : 0;
          return (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <span
                  style={st(`display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:${isActive ? '600' : '500'};width:100%;background:${isActive ? 'var(--bg-brand-subtle)' : 'transparent'};color:${isActive ? 'var(--fg-brand)' : 'var(--fg-secondary)'}`)}
                >
                  <span style={st('flex:none;display:inline-flex')}><Icon size={18} /></span>
                  <span style={st('flex:1;text-align:left')}>{label}</span>
                  {badge > 0 ? (
                    <span style={st(`font-size:11px;font-weight:700;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:${isActive ? 'var(--brand-primary)' : 'var(--bg-tertiary)'};color:${isActive ? 'var(--brand-on-primary)' : 'var(--fg-tertiary)'}`)}>{badge}</span>
                  ) : null}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      <div style={st('border-top:1px solid var(--border-subtle);padding-top:14px;margin-top:8px')}>
        <div style={st('display:flex;background:var(--bg-tertiary);border-radius:10px;padding:3px;gap:3px;margin-bottom:12px')}>
          {(['light', 'dark'] as const).map((mode) => {
            const on = state.theme === mode;
            return (
              <button
                key={mode}
                onClick={() => actions.setTheme(mode)}
                style={st(`flex:1;padding:7px;border-radius:8px;border:none;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;background:${on ? 'var(--bg-primary)' : 'transparent'};color:${on ? 'var(--fg-primary)' : 'var(--fg-tertiary)'};box-shadow:${on ? 'var(--card-shadow)' : 'none'}`)}
              >
                {mode === 'light' ? 'Light' : 'Dark'}
              </button>
            );
          })}
        </div>
        <div style={st('display:flex;align-items:center;gap:10px;padding:4px 6px')}>
          <div style={st('width:34px;height:34px;border-radius:999px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:none')}>
            {(account?.ownerName || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div style={st('flex:1;min-width:0')}>
            <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{account?.ownerName}</div>
            <div style={st('font-size:11.5px;color:var(--fg-tertiary)')}>Owner · {account?.plan}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={st('background:transparent;border:none;color:var(--fg-tertiary);cursor:pointer;padding:6px;border-radius:8px;flex:none')}
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
