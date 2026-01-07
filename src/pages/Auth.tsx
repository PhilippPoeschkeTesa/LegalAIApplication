import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { appRoutes, brandColors } from '../lib/config';
import { Loader, Shield, Mail, AlertCircle, ChevronDown, Globe, Moon, Sun } from 'lucide-react';

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { locale, setLocale, t } = useLocale();
  const { signIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const c = useColors(isDark);
  const [mode, setMode] = useState<'sso' | 'emergency' | 'request'>('emergency'); // Login mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestDept, setRequestDept] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const nextUrl = searchParams.get('next') || appRoutes.home;

  async function handleSSOLogin() {
    setError('');
    setLoading(true);

    // SSO not implemented yet - show message
    setError('SSO authentication is not yet implemented. Please use email/password login.');
    setLoading(false);
    setMode('emergency');
  }

  async function handleEmergencyLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(loginEmail, loginPassword);
      navigate(nextUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccessRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setRequestSubmitted(true);
      setLoading(false);
    }, 1000);
  }

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'de' : 'en');
  };

  return (
    <div className={`min-h-screen ${c.bg.primary} flex flex-col`}>
      <header className={`${c.card.bg} border-b ${c.card.border} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          <div className="absolute left-0">
            <img src="/tesa-logo.png" alt="tesa" className="h-8" />
          </div>
          <h1 className={`text-xl font-semibold ${c.text.primary}`}>LegalAI</h1>
          <div className="absolute right-0 flex items-center gap-3">
            <div className={`px-2 py-1 ${c.badge.error.bg} text-[${brandColors.tesaRed}] text-xs rounded font-medium`}>
              DEMO
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 ${c.bg.hover} rounded-lg transition-colors`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={18} className={c.text.secondary} />
              ) : (
                <Moon size={18} className={c.text.secondary} />
              )}
            </button>
            <button
              onClick={toggleLocale}
              className={`p-2 ${c.bg.hover} rounded-lg transition-colors flex items-center gap-1`}
              title={locale === 'en' ? 'Switch to German' : 'Switch to English'}
            >
              <Globe size={18} className={c.text.secondary} />
              <span className={`text-sm font-medium uppercase ${c.text.secondary}`}>{locale}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`${c.card.bg} rounded-xl border ${c.card.border} p-8`}>
            <div className="text-center mb-8">
              <img src="/tesa-logo.png" alt="tesa" className="h-12 mx-auto mb-4" />
              <h2 className={`text-2xl font-bold ${c.text.primary} mb-2`}>{t.auth.welcome}</h2>
              <p className={c.text.secondary}>{t.auth.subtitle}</p>
            </div>

            {mode === 'sso' && (
              <div className="space-y-4">
                <button
                  onClick={handleSSOLogin}
                  disabled={loading}
                  className="w-full py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      {t.auth.redirecting}
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      {t.auth.ssoButton}
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${c.border.primary}`} />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 ${c.card.bg} ${c.text.muted}`}>{t.auth.or}</span>
                  </div>
                </div>

                <button
                  onClick={() => setMode('request')}
                  className={`w-full py-3 border ${c.input.border} ${c.text.primary} rounded-lg ${c.bg.hover} transition-colors flex items-center justify-center gap-2 font-medium`}
                >
                  <Mail size={20} />
                  {t.auth.requestAccess}
                </button>

                <button
                  onClick={() => setShowEmergency(!showEmergency)}
                  className={`w-full py-2 text-sm ${c.text.secondary} transition-colors flex items-center justify-center gap-1`}
                >
                  {t.auth.havingTrouble}
                  <ChevronDown size={16} className={`transition-transform ${showEmergency ? 'rotate-180' : ''}`} />
                </button>

                {showEmergency && (
                  <div className={`p-4 ${c.badge.warning.bg} border border-amber-400 rounded-lg`}>
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <strong>{t.auth.emergencyAccessTitle}</strong>
                        <p className="mt-1">{t.auth.emergencyAccessWarning}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMode('emergency')}
                      className="text-sm text-tesa-blue hover:underline font-medium"
                    >
                      {t.auth.useEmergencyLogin}
                    </button>
                  </div>
                )}

                {error && (
                  <div className={`p-3 ${c.badge.error.bg} border border-red-300 rounded-lg text-sm text-red-700`} role="alert">
                    {error}
                  </div>
                )}
              </div>
            )}

            {mode === 'emergency' && (
              <form onSubmit={handleEmergencyLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className={`w-full px-4 py-2 border ${c.input.border} ${c.input.bg} ${c.text.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={`w-full px-4 py-2 border ${c.input.border} ${c.input.bg} ${c.text.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
                  />
                </div>

                {error && (
                  <div className={`p-3 ${c.badge.error.bg} border border-red-300 rounded-lg text-sm text-red-700`} role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      {t.auth.verifying}
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('sso');
                    setError('');
                  }}
                  className={`w-full py-2 text-sm ${c.text.secondary}`}
                >
                  {t.auth.backToSSO}
                </button>
              </form>
            )}

            {mode === 'request' && !requestSubmitted && (
              <form onSubmit={handleAccessRequest} className="space-y-4">
                <p className={`text-sm ${c.text.secondary} mb-4`}>
                  {t.auth.requestTitle}
                </p>

                <div>
                  <label htmlFor="request-name" className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    {t.auth.fullName}
                  </label>
                  <input
                    id="request-name"
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    autoComplete="name"
                    required
                    className={`w-full px-4 py-2 border ${c.input.border} ${c.input.bg} ${c.text.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
                  />
                </div>

                <div>
                  <label htmlFor="request-email" className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    {t.auth.companyEmail}
                  </label>
                  <input
                    id="request-email"
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    autoComplete="email"
                    required
                    placeholder="you@tesa.com"
                    className={`w-full px-4 py-2 border ${c.input.border} ${c.input.bg} ${c.text.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
                  />
                </div>

                <div>
                  <label htmlFor="request-dept" className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    {t.auth.department}
                  </label>
                  <select
                    id="request-dept"
                    value={requestDept}
                    onChange={(e) => setRequestDept(e.target.value)}
                    required
                    className={`w-full px-4 py-2 border ${c.input.border} ${c.input.bg} ${c.text.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
                  >
                    <option value="">{t.auth.selectDepartment}</option>
                    <option value="legal">{t.auth.deptLegal}</option>
                    <option value="compliance">{t.auth.deptCompliance}</option>
                    <option value="procurement">{t.auth.deptProcurement}</option>
                    <option value="sales">{t.auth.deptSales}</option>
                    <option value="other">{t.auth.deptOther}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      {t.auth.submitting}
                    </>
                  ) : (
                    t.auth.submitRequest
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('sso')}
                  className={`w-full py-2 text-sm ${c.text.secondary}`}
                >
                  {t.auth.backToSignIn}
                </button>
              </form>
            )}

            {mode === 'request' && requestSubmitted && (
              <div className="text-center py-6">
                <div className={`w-16 h-16 ${c.badge.success.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Mail size={32} className={c.badge.success.text} />
                </div>
                <h3 className={`text-lg font-semibold ${c.text.primary} mb-2`}>{t.auth.requestSubmittedTitle}</h3>
                <p className={`text-sm ${c.text.secondary} mb-6`}>
                  {t.auth.requestSubmittedMessage}
                </p>
                <button
                  onClick={() => {
                    setMode('sso');
                    setRequestSubmitted(false);
                    setRequestName('');
                    setRequestEmail('');
                    setRequestDept('');
                  }}
                  className="text-tesa-blue hover:underline font-medium"
                >
                  {t.auth.backToSignIn}
                </button>
              </div>
            )}

            <div className={`mt-6 pt-6 border-t ${c.border.primary} text-center text-xs ${c.text.muted}`}>
              {t.auth.byContinuing}{' '}
              <a href={appRoutes.legal} className="text-tesa-blue hover:underline">
                {t.auth.privacyPolicy}
              </a>{' '}
              {t.auth.and}{' '}
              <a href={appRoutes.legal} className="text-tesa-blue hover:underline">
                {t.auth.termsOfUse}
              </a>
              .
            </div>
          </div>

          <div className={`mt-6 p-4 ${c.badge.warning.bg} border border-amber-400 rounded-lg text-center`}>
            <div className="flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
              <Shield size={16} />
              <span>{t.auth.authorizedOnly}</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">{t.auth.activityLogged}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
