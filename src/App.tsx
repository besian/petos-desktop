import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/store';
import { UIProvider } from './ui/store';
import { AppLayout } from './layout/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Overview } from './views/Overview';
import { Schedule } from './views/Schedule';
import { Pets } from './views/Pets';
import { Clients } from './views/Clients';
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
import { NewWalk } from './pages/NewWalk';
import { AddPet } from './pages/AddPet';
import { AddTeamMember } from './pages/AddTeamMember';

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { account } = useAuth();
  if (account) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/new" element={<NewWalk />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/pets/new" element={<AddPet />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:clientId" element={<Client />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:reportId" element={<ReportView />} />
        <Route path="/reports/:reportId/edit" element={<ReportEdit />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/:invoiceId" element={<Invoice />} />
        <Route path="/team" element={<Team />} />
        <Route path="/team/new" element={<AddTeamMember />} />
        <Route path="/team/:memberId" element={<TeamMember />} />
        <Route path="/business" element={<Business />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <AppRoutes />
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
