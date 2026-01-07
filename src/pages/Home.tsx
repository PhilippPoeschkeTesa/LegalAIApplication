import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { appRoutes } from '../lib/config';
import {
  FileText, TrendingUp, TrendingDown, Clock, AlertTriangle, MessageSquare,
  FolderSearch, BookMarked, Inbox, ArrowRight, Users, ChevronLeft, ChevronRight
} from 'lucide-react';

export function Home() {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const mockTasks = [
      {
        id: '1',
        title: 'NDA with Acme GmbH',
        description: 'Review required before execution',
        type: 'NDA',
        counterparty: 'Acme GmbH',
        due_date: '2025-10-18',
        severity: 'high',
        owner: 'D. Weber',
      },
      {
        id: '2',
        title: 'MSA Renewal – Nordex',
        description: 'Annual renewal with updated terms',
        type: 'MSA',
        counterparty: 'Nordex SE',
        due_date: '2025-10-20',
        severity: 'medium',
        owner: 'J. Singh',
      },
      {
        id: '3',
        title: 'DPA Addendum – Contoso',
        description: 'GDPR compliance update',
        type: 'DPA',
        counterparty: 'Contoso Ltd',
        due_date: '2025-10-22',
        severity: 'low',
        owner: 'M. Li',
      },
    ];

    const mockPartners = [
      { id: '1', name: 'Acme GmbH', region: 'DE', contracts: 12 },
      { id: '2', name: 'Nordex SE', region: 'DE', contracts: 8 },
      { id: '3', name: 'Contoso Ltd', region: 'UK', contracts: 5 },
      { id: '4', name: 'Fabrikam AG', region: 'AT', contracts: 4 },
      { id: '5', name: 'Globex Inc', region: 'US', contracts: 3 },
    ];

    setTasks(mockTasks);
    setPartners(mockPartners);
  }

  const kpis = [
    { label: 'Pending Reviews', value: 7, trend: 12, icon: FileText, color: 'blue', link: '/review' },
    { label: 'Active Discovery', value: 2, trend: -20, icon: FolderSearch, color: 'purple', link: '/discovery' },
    { label: 'Avg Cycle Time', value: '12d', trend: -8, icon: Clock, color: 'green', link: '/analytics' },
    { label: 'High Risk Contracts', value: 3, trend: 15, icon: AlertTriangle, color: 'red', link: '/repository' },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Ask LegalAI', description: 'AI-powered contract assistance', link: '/legalai' },
    { icon: Inbox, label: 'One-Drop', description: 'Quick contract intake', link: '/intake' },
    { icon: FolderSearch, label: 'New Discovery', description: 'Start document discovery', link: '/discovery' },
    { icon: BookMarked, label: 'Research', description: 'Legal research hub', link: '/research' },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(tasks.length / pageSize);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>{t.home.title}</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t.home.welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend < 0 && kpi.label === 'Avg Cycle Time' || kpi.trend > 0 && kpi.label !== 'Avg Cycle Time';
          const TrendIcon = kpi.trend > 0 ? TrendingUp : TrendingDown;

          return (
            <Link
              key={kpi.label}
              to={kpi.link}
              className={`${isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200'} p-6 rounded-xl border hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${kpi.color}-50`}>
                  <Icon size={24} className={`text-${kpi.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon size={14} />
                  {Math.abs(kpi.trend)}%
                </div>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{kpi.value}</div>
              <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{kpi.label}</div>
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-1`}>vs last 30d</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.home.myQueue}</h2>
              <div className="flex items-center gap-3">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={`text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'} border rounded px-2 py-1`}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <Link to={appRoutes.workflows} className="text-sm text-tesa-blue hover:underline font-medium">
                  View All
                </Link>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No items assigned to you yet.</p>
                <p className="text-sm">Tasks will appear here when assigned</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} text-left`}>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Title</th>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Type</th>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Counterparty</th>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Due</th>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Severity</th>
                        <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTasks.map((task) => (
                        <tr
                          key={task.id}
                          className={`border-b ${isDark ? 'border-slate-800 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                        >
                          <td className="py-3">
                            <Link to={`/review/${task.id}`} className="block group">
                              <div className={`font-medium ${isDark ? 'text-white group-hover:text-tesa-blue' : 'text-slate-900 group-hover:text-tesa-blue'} transition-colors`}>
                                {task.title}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</div>
                            </Link>
                          </td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-tesa-blue rounded font-medium">
                              {task.type}
                            </span>
                          </td>
                          <td className={`py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.counterparty}</td>
                          <td className={`py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.due_date}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 border rounded capitalize font-medium ${getSeverityBadge(task.severity)}`}>
                              {task.severity}
                            </span>
                          </td>
                          <td className={`py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{task.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 disabled:opacity-30' : 'hover:bg-slate-100 disabled:opacity-50'}`}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 disabled:opacity-30' : 'hover:bg-slate-100 disabled:opacity-50'}`}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Partners</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last 5 by activity</p>
              </div>
              <Link to={appRoutes.partners} className="text-sm text-tesa-blue hover:underline font-medium">
                View All
              </Link>
            </div>

            {partners.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No partner activity yet</p>
                <p className="text-sm">Recent partners will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} text-left`}>
                      <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Partner</th>
                      <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Region</th>
                      <th className={`pb-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'} text-right`}>Contracts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr
                        key={partner.id}
                        className={`border-b ${isDark ? 'border-slate-800 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                      >
                        <td className="py-3">
                          <Link to={`/partners/${partner.id}`} className={`font-medium ${isDark ? 'text-white hover:text-tesa-blue' : 'text-slate-900 hover:text-tesa-blue'} transition-colors`}>
                            {partner.name}
                          </Link>
                        </td>
                        <td className="py-3">
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                            {partner.region}
                          </span>
                        </td>
                        <td className={`py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-900'} text-right font-medium`}>{partner.contracts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>{t.home.quickActions}</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  to={action.link}
                  className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-all group border ${isDark ? 'border-slate-700' : 'border-transparent hover:border-slate-200'}`}
                >
                  <div className="p-2 bg-tesa-blue/10 rounded-lg">
                    <Icon size={20} className="text-tesa-blue" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? 'text-white group-hover:text-tesa-blue' : 'text-slate-900 group-hover:text-tesa-blue'} transition-colors`}>
                      {action.label}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{action.description}</div>
                  </div>
                  <ArrowRight size={16} className={`${isDark ? 'text-slate-500 group-hover:text-tesa-blue' : 'text-slate-400 group-hover:text-tesa-blue'} transition-colors`} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
