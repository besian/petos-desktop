import type { ReactElement } from 'react';
import { st } from '../lib/st';
import { useApp } from '../state';
import type { ViewKey } from '../data';
import {
  OverviewIcon, ScheduleIcon, PawIcon, ClientsIcon, ReportsIcon, PaymentsIcon, TeamIcon, BusinessIcon, SettingsIcon,
} from './icons';

const navDef: [ViewKey, string, (p: { size?: number }) => ReactElement, string][] = [
  ['overview', 'Overview', OverviewIcon, ''],
  ['schedule', 'Schedule', ScheduleIcon, ''],
  ['pets', 'Pets', PawIcon, ''],
  ['client', 'Clients', ClientsIcon, ''],
  ['reports', 'Reports', ReportsIcon, '1'],
  ['payments', 'Payments', PaymentsIcon, '3'],
  ['team', 'Team', TeamIcon, ''],
  ['business', 'Business', BusinessIcon, ''],
  ['settings', 'Settings', SettingsIcon, ''],
];

export function Sidebar() {
  const { state, actions } = useApp();

  return (
    <div style={st('width:236px;flex:none;background:var(--bg-primary);border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;padding:20px 14px')}>
      <div style={st('display:flex;align-items:center;gap:10px;padding:4px 8px 20px')}>
        <div style={st('width:34px;height:34px;border-radius:10px;background:var(--brand-primary);display:flex;align-items:center;justify-content:center;color:var(--brand-on-primary);flex:none')}>
          <PawIcon size={20} />
        </div>
        <div>
          <div style={st('font-size:17px;font-weight:800;letter-spacing:-.02em;color:var(--fg-primary);line-height:1')}>PetOS</div>
          <div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:500')}>Chelsea Dog Club</div>
        </div>
      </div>
      <div className="ps" style={st('flex:1;display:flex;flex-direction:column;gap:2px;overflow-y:auto')}>
        {navDef.map(([key, label, Icon, badge]) => {
          const on = state.view === key || (key === 'client' && state.view === 'client');
          return (
            <button
              key={key}
              onClick={() => actions.go(key)}
              style={st(`display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:${on ? '600' : '500'};width:100%;background:${on ? 'var(--bg-brand-subtle)' : 'transparent'};color:${on ? 'var(--fg-brand)' : 'var(--fg-secondary)'}`)}
            >
              <span style={st('flex:none;display:inline-flex')}><Icon size={18} /></span>
              <span style={st('flex:1;text-align:left')}>{label}</span>
              {badge ? (
                <span style={st(`font-size:11px;font-weight:700;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:${on ? 'var(--brand-primary)' : 'var(--bg-tertiary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-tertiary)'}`)}>{badge}</span>
              ) : null}
            </button>
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
          <div style={st('width:34px;height:34px;border-radius:999px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex:none')}>SM</div>
          <div style={st('flex:1;min-width:0')}>
            <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>Sarah Mitchell</div>
            <div style={st('font-size:11.5px;color:var(--fg-tertiary)')}>Owner · Pro plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
