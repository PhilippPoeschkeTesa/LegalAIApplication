import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { appRoutes } from '../lib/config';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  const { permissions } = useAuth();
  const { isDark } = useTheme();
  const c = useColors(isDark);

  const userRoleNames = permissions?.getRoleNames() || [];
  const highestRole = permissions?.getHighestRole() || 'No Role Assigned';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : c.bg.secondary} flex items-center justify-center p-4`}>
      <div className={`max-w-2xl w-full ${c.card.bg} rounded-2xl ${c.card.border} border p-8 text-center`}>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ShieldAlert size={48} className="text-[#E30613]" />
          </div>
        </div>

        <h1 className={`text-3xl font-bold ${c.text.primary} mb-4`}>
          Access Denied
        </h1>

        <p className={`text-lg ${c.text.secondary} mb-6`}>
          You don't have permission to access this page.
        </p>

        <div className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-6 mb-8`}>
          <h2 className={`text-sm font-semibold ${c.text.tertiary} uppercase tracking-wide mb-3`}>
            Your Current Access Level
          </h2>

          <div className={`text-lg font-medium ${c.text.primary} mb-2`}>
            {highestRole}
          </div>

          {userRoleNames.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {userRoleNames.map((role, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-sm ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full`}
                >
                  {role}
                </span>
              ))}
            </div>
          )}

          {userRoleNames.length === 0 && (
            <p className={`text-sm ${c.text.tertiary} mt-2`}>
              No roles have been assigned to your account.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Link
            to={appRoutes.home}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#E30613] to-red-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-700 transition-all"
          >
            <Home size={20} />
            Go to Home Page
          </Link>

          <button
            onClick={() => window.history.back()}
            className={`flex items-center justify-center gap-2 w-full px-6 py-3 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} ${c.text.primary} rounded-lg font-medium transition-all`}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        <div className={`mt-8 pt-6 border-t ${c.border.primary}`}>
          <p className={`text-sm ${c.text.tertiary} mb-2`}>
            Need access to this feature?
          </p>
          <p className={`text-sm ${c.text.secondary}`}>
            Contact your administrator to request additional permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
