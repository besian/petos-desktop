import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/store';
import { useUI } from '../ui/store';
import { useDB } from '../db/store';
import { themeVars, ACCENT } from '../theme';
import { DBProvider } from '../db/store';
import { PageHeaderProvider } from '../ui/pageHeader';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { CopilotPanel } from '../components/CopilotPanel';
import { Toast } from '../components/Toast';
import { PawIcon } from '../components/icons';

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F5F1' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#127A63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', animation: 'petosPulse 1.2s ease-in-out infinite' }}>
        <PawIcon size={22} />
      </div>
      <style>{'@keyframes petosPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.92); } }'}</style>
    </div>
  );
}

function Shell() {
  const { state } = useUI();
  const { ready } = useDB();
  const vars = themeVars(state.theme, ACCENT);

  if (!ready) {
    return (
      <div style={{ ...vars, height: '100vh', width: '100vw', background: 'var(--bg-app)' }}>
        <LoadingScreen />
      </div>
    );
  }

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
  const { account, ready } = useAuth();
  if (!ready) return <LoadingScreen />;
  if (!account) return <Navigate to="/login" replace />;
  return (
    <DBProvider>
      <PageHeaderProvider>
        <Shell />
      </PageHeaderProvider>
    </DBProvider>
  );
}
