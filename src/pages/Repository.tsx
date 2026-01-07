import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { appRoutes } from '../lib/config';
import { Database, FileText, Filter, ChevronRight, MoreVertical } from 'lucide-react';

const dummyContracts = [
  { id: '1', title: 'NDA — Acme 2024', type: 'NDA', counterparty: 'Acme GmbH', owner: 'D. Weber', status: 'Draft', jurisdiction: 'DE', updated: '2025-10-10' },
  { id: '2', title: 'MSA — Nordex 2025', type: 'MSA', counterparty: 'Nordex SE', owner: 'J. Singh', status: 'Active', jurisdiction: 'DE', updated: '2025-09-30' },
  { id: '3', title: 'DPA — Contoso (EN)', type: 'DPA', counterparty: 'Contoso Ltd', owner: 'M. Li', status: 'In Review', jurisdiction: 'UK', updated: '2025-09-18' },
  { id: '4', title: 'SOW — Fabrikam (Plant 7)', type: 'SOW', counterparty: 'Fabrikam AG', owner: 'A. Klein', status: 'Signed', jurisdiction: 'AT', updated: '2025-08-02' },
  { id: '5', title: 'NDA — Globex (US)', type: 'NDA', counterparty: 'Globex Inc', owner: 'R. Hahn', status: 'Draft', jurisdiction: 'US', updated: '2025-07-22' },
];

export function Repository() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const [contracts, setContracts] = useState<any[]>(dummyContracts);
  const [savedView, setSavedView] = useState('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{t.nav.repository}</h1>
        <button className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 transition-colors">
          Upload Contract
        </button>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-4 mb-6`}>
        <div className="flex items-center gap-4">
          <select
            value={savedView}
            onChange={(e) => setSavedView(e.target.value)}
            className={`px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg text-sm font-medium`}
          >
            <option value="all">My Contracts</option>
            <option value="expiring">Expiring Soon</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border overflow-hidden`}>
        <table className="w-full">
          <thead className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} border-b`}>
            <tr>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Counterparty</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Owner</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jurisdiction</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Last Updated</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <tr key={contract.id} className={`border-b ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'} cursor-pointer`}>
                <td className="px-4 py-3">
                  <Link to={`/review/${contract.id}`} className="flex items-center gap-2 group">
                    <FileText size={16} className="text-slate-400" />
                    <span className={`font-medium text-sm ${isDark ? 'text-white group-hover:text-tesa-blue' : 'text-slate-900 group-hover:text-tesa-blue'} transition-colors`}>{contract.title}</span>
                  </Link>
                </td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contract.type}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contract.counterparty}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contract.owner}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-tesa-blue rounded text-xs font-medium">
                    {contract.status}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contract.jurisdiction}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contract.updated}</td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === contract.id ? null : contract.id)}
                    className={`p-1 ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} rounded transition-colors`}
                  >
                    <MoreVertical size={16} className={isDark ? 'text-white' : 'text-slate-600'} />
                  </button>
                  {openMenu === contract.id && (
                    <div className={`absolute right-0 mt-1 w-48 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg shadow-lg z-10`}>
                      <Link
                        to={`/review/${contract.id}`}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                      >
                        Open in Review
                      </Link>
                      <Link
                        to={appRoutes.copilot}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                      >
                        Bind to LegalAI
                      </Link>
                      <button
                        onClick={() => alert('CLM integration coming soon')}
                        className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                      >
                        Open in CLM
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contracts.length === 0 && (
          <div className="p-12 text-center">
            <Database size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">{t.common.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}
