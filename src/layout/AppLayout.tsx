import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/store';
import { useUI } from '../ui/store';
import { themeVars, ACCENT } from '../theme';
import { DBProvider } from '../db/store';
import { PageHeaderProvider } from '../ui/pageHeader';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { CopilotPanel } from '../components/CopilotPanel';
import { Toast } from '../components/Toast';

function Shell() {
  const { state } = useUI();
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
              <Outlet />
            </div>
          </div>
          <CopilotPanel />
        </div>
      </div>
      <Toast />
    </div>
  );
}

export function AppLayout() {
  const { account } = useAuth();
  if (!account) return <Navigate to="/login" replace />;
  return (
    <DBProvider>
      <PageHeaderProvider>
        <Shell />
      </PageHeaderProvider>
    </DBProvider>
  );
}
