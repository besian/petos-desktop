import { useEffect, useRef, useState } from 'react';
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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth - 24;
      const h = el.clientHeight - 24;
      const s = Math.min(w / 1920, h / 1080, 1);
      setScale((prev) => (Math.abs(s - prev) > 0.002 ? s : prev));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const vars = themeVars(state.theme, ACCENT);
  // Round the wrapper's clip box to a whole pixel first, then derive the
  // inner element's transform scale from that same rounded value — so the
  // two independently-laid-out boxes can never disagree by a sub-pixel and
  // leave a hairline seam at the canvas edge (visible as a dashed-looking
  // line where the stage background shows through the compositor's
  // anti-aliasing of the mismatch).
  const canvasW = Math.round(1920 * scale);
  const canvasH = Math.round(1080 * scale);
  const preciseScaleX = canvasW / 1920;
  const preciseScaleY = canvasH / 1080;

  return (
    <div
      ref={stageRef}
      style={{
        ...vars,
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        background: 'var(--stage-bg)',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{ width: canvasW, height: canvasH, flex: 'none', overflow: 'hidden' }}
        onScroll={(e) => {
          // The scaled child keeps its native 1920x1080 layout box, so Chromium
          // still treats this wrapper as scrollable even though it's visually
          // clipped to the smaller scaled size. A focus change inside it (e.g.
          // clicking "Customize") can trigger a native scroll-into-view that
          // shifts this — snap it back since the wrapper must never scroll.
          const el = e.currentTarget;
          if (el.scrollLeft || el.scrollTop) { el.scrollLeft = 0; el.scrollTop = 0; }
        }}
      >
        <div
          style={{
            width: '1920px',
            height: '1080px',
            transform: `scale(${preciseScaleX}, ${preciseScaleY})`,
            transformOrigin: 'top left',
            background: 'var(--bg-app)',
            borderRadius: 16,
            border: '1px solid var(--border-default)',
            boxShadow: '0 40px 90px -40px rgba(0,0,0,.4)',
            display: 'flex',
            flex: 'none',
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
        </div>
      </div>
      <NewWalkModal scale={scale} />
      <Toast scale={scale} />
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
