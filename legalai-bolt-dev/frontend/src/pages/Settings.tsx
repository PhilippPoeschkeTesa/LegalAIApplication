import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Globe, Bell } from 'lucide-react';

export function Settings() {
  const { isDark } = useTheme();
  const { t, locale, setLocale } = useLocale();
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>{t.nav.settings}</h1>

      <div className="space-y-6">
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <User size={20} />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <Globe size={20} />
            Language & Region
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="en">English</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4 flex items-center gap-2`}>
            <Bell size={20} />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm text-slate-700">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-sm text-slate-700">Task reminders</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
