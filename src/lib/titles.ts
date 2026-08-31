import type { AppState } from '../state';
import type { ViewKey } from '../data';

const memberNames: Record<string, string> = { sarah: 'Sarah Mitchell', tom: 'Tom Bailey', aisha: 'Aisha Khan' };

export function getTitles(state: AppState): Record<string, [string, string]> {
  return {
    overview: ['Overview', 'Friday, 17 July · everything is on track'],
    schedule: ['Schedule', 'Week of 13–19 July · 26 walks · 3 walkers'],
    pets: ['Pets', '7 pets across 6 clients'],
    client: ['Client', 'Henry Whitfield'],
    reports: ['Reports', 'Sent and pending walk reports'],
    payments: ['Payments', 'July · £1,486 collected of £2,140'],
    team: ['Team', 'Sarah, Tom and Aisha'],
    business: ['Business insights', 'Revenue, retention and capacity'],
    settings: ['Settings', 'Rates, hours and preferences'],
    invoice: ['Invoice', state.invoiceNo],
    reportview: ['Walk report', 'Review and send'],
    reportedit: ['Edit report', 'Adjust the AI draft before sending'],
    teammember: ['Team member', memberNames[state.selectedMember] || 'Team member'],
  };
}

export function pageTitleFor(view: ViewKey, state: AppState): [string, string] {
  return getTitles(state)[view] || ['', ''];
}
