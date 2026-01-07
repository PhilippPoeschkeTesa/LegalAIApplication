import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { mockData, appRoutes } from '../lib/config';
import {
  Home, MessageSquare, FileText, FileEdit, Database, Inbox, Search,
  FileSignature, BookOpen, GitBranch, BarChart3, Users, FolderSearch,
  BookMarked, Settings, HelpCircle, Scale, Menu, X, Globe, LogOut,
  Bell, User, Moon, Sun, Blocks
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { LiveChatWidget } from './LiveChatWidget';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut, permissions } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const { isDark, toggleTheme } = useTheme();
  const c = useColors(isDark);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const mockUser = mockData.demoUser;

  const allNavItems = [
    { path: appRoutes.home, icon: Home, label: t.nav.home },
    { path: appRoutes.legalai, icon: MessageSquare, label: t.nav.copilot },
    { path: appRoutes.review, icon: FileText, label: t.nav.review },
    { path: appRoutes.draft, icon: FileEdit, label: t.nav.draft },
    { path: appRoutes.builder, icon: Blocks, label: t.nav.builder },
    { path: appRoutes.repository, icon: Database, label: t.nav.repository },
    { path: appRoutes.intake, icon: Inbox, label: t.nav.intake },
    { path: appRoutes.search, icon: Search, label: t.nav.search },
    { path: appRoutes.clauses, icon: FileSignature, label: t.nav.clauses },
    { path: appRoutes.playbooks, icon: BookOpen, label: t.nav.playbooks },
    { path: appRoutes.workflows, icon: GitBranch, label: t.nav.workflows },
    { path: appRoutes.analytics, icon: BarChart3, label: t.nav.analytics },
    { path: appRoutes.partners, icon: Users, label: t.nav.partners },
    { path: appRoutes.discovery, icon: FolderSearch, label: t.nav.discovery },
    { path: appRoutes.research, icon: BookMarked, label: t.nav.research },
    { path: appRoutes.admin, icon: Settings, label: t.nav.admin },
  ];

  const navItems = permissions
    ? allNavItems.filter(item => permissions.canAccessRoute(item.path))
    : allNavItems;

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'de' : 'en');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : c.bg.secondary}`}>
      <header className={`${isDark ? 'bg-slate-900/90 backdrop-blur-xl' : c.bg.primary} ${c.border.primary} border-b sticky top-0 z-30`}>
        <div className="flex items-center justify-center px-4 h-16 relative">
          <div className="absolute left-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 ${c.bg.hover} rounded-lg transition-colors`}
            >
              {sidebarOpen ? <X size={20} className={c.text.primary} /> : <Menu size={20} className={c.text.primary} />}
            </button>
            <img src="/image.png" alt="tesa" className="h-8" />
          </div>

          <h1 className={`text-xl font-semibold ${c.text.primary}`}>LegalAI</h1>

          <div className="absolute right-4 flex items-center gap-3">
            <div className="px-2 py-1 bg-red-100 text-[#E30613] text-xs rounded font-medium">
              DEMO
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 ${c.bg.hover} rounded-lg transition-colors`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>

            <button
              onClick={toggleLocale}
              className={`p-2 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors flex items-center gap-1`}
              title={locale === 'en' ? 'Switch to German' : 'Switch to English'}
            >
              <Globe size={18} className={c.text.primary} />
              <span className={`text-sm font-medium uppercase ${c.text.primary}`}>{locale}</span>
            </button>

            <button className={`p-2 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors relative`}>
              <Bell size={18} className={c.text.primary} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E30613] rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-2 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
              >
                <div className="w-8 h-8 bg-[#E30613] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {mockUser.name[0]}
                </div>
              </button>

              {profileOpen && (
                <div className={`absolute right-0 mt-2 w-64 ${c.card.bg} ${c.card.border} rounded-lg shadow-lg border py-2`}>
                  <div className={`px-4 py-2 border-b ${c.border.primary}`}>
                    <p className={`text-sm font-medium ${c.text.primary}`}>{mockUser.email}</p>
                    <p className={`text-xs ${c.text.tertiary}`}>Legal Counsel</p>
                  </div>
                  <Link
                    to={appRoutes.settings}
                    className={`flex items-center gap-2 px-4 py-2 ${c.bg.hover} ${c.text.secondary} transition-colors`}
                  >
                    <User size={16} />
                    <span className="text-sm">{t.nav.settings}</span>
                  </Link>
                  <Link
                    to={appRoutes.auth}
                    className={`flex items-center gap-2 px-4 py-2 ${c.bg.hover} transition-colors text-[#E30613]`}
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Sign Out</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } ${isDark ? 'bg-slate-900/90 backdrop-blur-xl' : c.bg.primary} ${c.border.primary} border-r transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-600 to-[#009FE3] text-white font-medium shadow-lg shadow-blue-900/50'
                        : 'bg-red-50 text-[#E30613] font-medium'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800/50'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}

            <div className={`pt-3 mt-3 border-t ${c.border.primary}`}>
              <Link
                to={appRoutes.help}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${c.text.secondary} ${c.bg.hover}`}
              >
                <HelpCircle size={18} />
                <span className="text-sm whitespace-nowrap">{t.nav.help}</span>
              </Link>
              <Link
                to={appRoutes.legal}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${c.text.secondary} ${c.bg.hover}`}
              >
                <Scale size={18} />
                <span className="text-sm whitespace-nowrap">{t.nav.legal}</span>
              </Link>
            </div>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <LiveChatWidget />
    </div>
  );
}
