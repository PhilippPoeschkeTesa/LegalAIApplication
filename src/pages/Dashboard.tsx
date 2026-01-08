import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { AlertCircle, AlertTriangle, CheckCircle, Download } from 'lucide-react';

export function Dashboard() {
  const { runId } = useParams();
  const { isDark } = useTheme();
  const c = useColors(isDark);

  const [run, setRun] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });

  useEffect(() => {
    if (runId) {
      loadRun();
    }
  }, [runId]);

  async function loadRun() {
    const runResult = await apiClient.redline.getRunStatus(runId!);
    if (runResult.success && runResult.data) {
      setRun(runResult.data);
    }

    const findingsResult = await apiClient.redline.getRunFindings(runId!);
    if (findingsResult.success && findingsResult.data) {
      setFindings(findingsResult.data);

      const high = findingsResult.data.filter((f: any) => f.severity === 'High').length;
      const medium = findingsResult.data.filter((f: any) => f.severity === 'Medium').length;
      const low = findingsResult.data.filter((f: any) => f.severity === 'Low').length;

      setStats({ high, medium, low });
    }
  }

  const riskScore = run?.overall_risk_score || 0;
  const riskColor =
    riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-orange-600' : 'text-green-600';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${c.text.primary}`}>Risk Dashboard</h1>
        <button className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 flex items-center gap-2">
          <Download size={18} />
          Download Report
        </button>
      </div>

      {/* Risk Score Gauge */}
      <div className={`${c.bg.elevated} rounded-lg border ${c.border.primary} p-6 mb-6`}>
        <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>Overall Risk Score</h2>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={isDark ? '#334155' : '#e2e8f0'}
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={riskScore > 70 ? '#dc2626' : riskScore > 40 ? '#f97316' : '#16a34a'}
                strokeWidth="8"
                strokeDasharray={`${riskScore * 2.51} 251`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${riskColor}`}>{riskScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings Distribution */}
      <div className={`${c.bg.elevated} rounded-lg border ${c.border.primary} p-6 mb-6`}>
        <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>Findings by Severity</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertCircle size={32} className="mx-auto text-red-600 mb-2" />
            <div className="text-3xl font-bold text-red-600">{stats.high}</div>
            <div className="text-sm text-red-700">High</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <AlertTriangle size={32} className="mx-auto text-orange-600 mb-2" />
            <div className="text-3xl font-bold text-orange-600">{stats.medium}</div>
            <div className="text-sm text-orange-700">Medium</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <CheckCircle size={32} className="mx-auto text-yellow-600 mb-2" />
            <div className="text-3xl font-bold text-yellow-600">{stats.low}</div>
            <div className="text-sm text-yellow-700">Low</div>
          </div>
        </div>
      </div>

      {/* Top Risks */}
      <div className={`${c.bg.elevated} rounded-lg border ${c.border.primary} p-6`}>
        <h2 className={`text-xl font-semibold ${c.text.primary} mb-4`}>Top Risks</h2>
        <div className="space-y-3">
          {findings.slice(0, 5).map((finding) => (
            <div
              key={finding.id}
              className={`p-4 rounded-lg border ${
                finding.severity === 'High'
                  ? 'bg-red-50 border-red-200'
                  : finding.severity === 'Medium'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{finding.category}</h3>
                  <p className="text-sm opacity-75">{finding.evidence_rationale}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    finding.severity === 'High'
                      ? 'bg-red-100 text-red-700'
                      : finding.severity === 'Medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {finding.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
