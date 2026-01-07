import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export function Analytics() {
  const { isDark } = useTheme();
  const { t } = useLocale();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>{t.nav.analytics}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Avg Cycle Time', value: '12.5d', icon: Clock, color: 'blue' },
          { label: 'Total Contracts', value: '342', icon: BarChart3, color: 'green' },
          { label: 'High Risk', value: '23', icon: AlertTriangle, color: 'red' },
          { label: 'Trend', value: '+15%', icon: TrendingUp, color: 'purple' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
              <div className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-lg w-fit mb-3`}>
                <Icon size={24} />
              </div>
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{kpi.value}</div>
              <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>Contracts by Type</h3>
          <div className="space-y-3">
            {[
              { type: 'NDA', count: 145, pct: 42 },
              { type: 'MSA', count: 98, pct: 29 },
              { type: 'SOW', count: 67, pct: 20 },
              { type: 'Other', count: 32, pct: 9 },
            ].map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{item.type}</span>
                  <span className={`${isDark ? "text-white" : "text-slate-900"} font-medium`}>{item.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-tesa-blue h-2 rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>Cycle Time by Stage</h3>
          <div className="space-y-4">
            {[
              { stage: 'Intake', days: 2.3 },
              { stage: 'Review', days: 5.7 },
              { stage: 'Negotiation', days: 8.2 },
              { stage: 'Approval', days: 3.1 },
            ].map((item) => (
              <div key={item.stage} className="flex justify-between items-center">
                <span className="text-sm text-slate-700">{item.stage}</span>
                <span className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{item.days}d</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
