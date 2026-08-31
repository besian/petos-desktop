import { AppProvider, useApp } from './state';
import { themeVars, ACCENT } from './theme';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CopilotPanel } from './components/CopilotPanel';
import { NewWalkModal } from './components/NewWalkModal';
import { Toast } from './components/Toast';
import { Overview } from './views/Overview';
import { Schedule } from './views/Schedule';
import { Pets } from './views/Pets';
import { Client } from './views/Client';
import { Payments } from './views/Payments';
import { Invoice } from './views/Invoice';
import { Business } from './views/Business';
import { Reports } from './views/Reports';
import { ReportView } from './views/ReportView';
import { ReportEdit } from './views/ReportEdit';
import { Team } from './views/Team';
import { TeamMember } from './views/TeamMember';
import { Settings } from './views/Settings';

function ViewRouter() {
  const { state } = useApp();
  switch (state.view) {
    case 'overview': return <Overview />;
    case 'schedule': return <Schedule />;
    case 'pets': return <Pets />;
    case 'client': return <Client />;
    case 'payments': return <Payments />;
    case 'invoice': return <Invoice />;
    case 'business': return <Business />;
    case 'reports': return <Reports />;
    case 'reportview': return <ReportView />;
    case 'reportedit': return <ReportEdit />;
    case 'team': return <Team />;
    case 'teammember': return <TeamMember />;
    case 'settings': return <Settings />;
    default: return null;
  }
}

function Stage() {
  const { state } = useApp();
  const vars = themeVars(state.theme, ACCENT);

  return (
    <div
      style={{
        ...vars,
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-app)',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div className="ps" style={{ flex: 1, overflowY: 'auto', padding: 26, minWidth: 0 }}>
            <div style={{ maxWidth: 1680, margin: '0 auto' }}>
              <ViewRouter />
            </div>
          </div>
          <CopilotPanel />
        </div>
      </div>
      <NewWalkModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Stage />
    </AppProvider>
  );
}
