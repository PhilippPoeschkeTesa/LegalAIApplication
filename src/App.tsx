import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { appRoutes } from './lib/config';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Copilot as LegalAI } from './pages/Copilot';
import { Review } from './pages/Review';
import { Draft } from './pages/Draft';
import { Builder } from './pages/Builder';
import { Repository } from './pages/Repository';
import { Intake } from './pages/Intake';
import { Search } from './pages/Search';
import { Clauses } from './pages/Clauses';
import { Playbooks } from './pages/Playbooks';
import { Workflows } from './pages/Workflows';
import { Analytics } from './pages/Analytics';
import { Partners } from './pages/Partners';
import { Discovery } from './pages/Discovery';
import { Research } from './pages/Research';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { Legal } from './pages/Legal';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

function ProtectedRoute({ children, requirePath }: { children: React.ReactNode; requirePath?: string }) {
  const { user, loading, permissions } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-tesa-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={appRoutes.auth} state={{ from: location.pathname }} replace />;
  }

  if (requirePath && permissions) {
    const canAccess = permissions.canAccessRoute(requirePath);
    if (!canAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isAuthPage = location.pathname === appRoutes.auth;

  if (isAuthPage) {
    return (
      <Routes>
        <Route path={appRoutes.auth} element={<Auth />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path={appRoutes.home} element={<ProtectedRoute requirePath={appRoutes.home}><Home /></ProtectedRoute>} />
        <Route path={appRoutes.legalai} element={<ProtectedRoute requirePath={appRoutes.legalai}><LegalAI /></ProtectedRoute>} />
        <Route path={appRoutes.review} element={<ProtectedRoute requirePath={appRoutes.review}><Review /></ProtectedRoute>} />
        <Route path={`${appRoutes.review}/:id`} element={<ProtectedRoute requirePath={appRoutes.review}><Review /></ProtectedRoute>} />
        <Route path={appRoutes.draft} element={<ProtectedRoute requirePath={appRoutes.draft}><Draft /></ProtectedRoute>} />
        <Route path={appRoutes.builder} element={<ProtectedRoute requirePath={appRoutes.builder}><Builder /></ProtectedRoute>} />
        <Route path={appRoutes.repository} element={<ProtectedRoute requirePath={appRoutes.repository}><Repository /></ProtectedRoute>} />
        <Route path={appRoutes.intake} element={<ProtectedRoute requirePath={appRoutes.intake}><Intake /></ProtectedRoute>} />
        <Route path={appRoutes.search} element={<ProtectedRoute requirePath={appRoutes.search}><Search /></ProtectedRoute>} />
        <Route path={appRoutes.clauses} element={<ProtectedRoute requirePath={appRoutes.clauses}><Clauses /></ProtectedRoute>} />
        <Route path={appRoutes.playbooks} element={<ProtectedRoute requirePath={appRoutes.playbooks}><Playbooks /></ProtectedRoute>} />
        <Route path={`${appRoutes.playbooks}/:id`} element={<ProtectedRoute requirePath={appRoutes.playbooks}><Playbooks /></ProtectedRoute>} />
        <Route path={appRoutes.workflows} element={<ProtectedRoute requirePath={appRoutes.workflows}><Workflows /></ProtectedRoute>} />
        <Route path={appRoutes.analytics} element={<ProtectedRoute requirePath={appRoutes.analytics}><Analytics /></ProtectedRoute>} />
        <Route path={appRoutes.partners} element={<ProtectedRoute requirePath={appRoutes.partners}><Partners /></ProtectedRoute>} />
        <Route path={appRoutes.discovery} element={<ProtectedRoute requirePath={appRoutes.discovery}><Discovery /></ProtectedRoute>} />
        <Route path={appRoutes.research} element={<ProtectedRoute requirePath={appRoutes.research}><Research /></ProtectedRoute>} />
        <Route path={appRoutes.admin} element={<ProtectedRoute requirePath={appRoutes.admin}><Admin /></ProtectedRoute>} />
        <Route path={appRoutes.settings} element={<ProtectedRoute requirePath={appRoutes.settings}><Settings /></ProtectedRoute>} />
        <Route path={appRoutes.help} element={<ProtectedRoute requirePath={appRoutes.help}><Help /></ProtectedRoute>} />
        <Route path={appRoutes.legal} element={<ProtectedRoute requirePath={appRoutes.legal}><Legal /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path={appRoutes.notFound} element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LocaleProvider>
            <AppRoutes />
          </LocaleProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
