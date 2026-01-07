import { BookOpen, Plus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Playbooks() {
  const { isDark } = useTheme();
  const [playbooks, setPlaybooks] = useState([
    { name: 'Standard NDA Review', jurisdiction: 'DACH', locale: 'EN', version: '2.3', status: 'Live', rules: 6, updated: '10 Oct 2025' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jurisdiction: '',
    locale: '',
    description: '',
  });

  const handleCreatePlaybook = () => {
    const newPlaybook = {
      ...formData,
      version: '1.0',
      status: 'Draft',
      rules: 0,
      updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setPlaybooks([...playbooks, newPlaybook]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      jurisdiction: '',
      locale: '',
      description: '',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Playbooks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Create Playbook
        </button>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border overflow-hidden`}>
        <table className="w-full">
          <thead className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} border-b`}>
            <tr>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jurisdiction</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Locale</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Version</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Rules (#)</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Last Updated</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {playbooks.map((pb, idx) => (
              <tr key={idx} className={`border-b ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'} cursor-pointer`}>
                <td className="px-4 py-3">
                  <Link to={`/playbooks/${idx+1}`} className={`font-medium ${isDark ? 'text-white hover:text-tesa-blue' : 'text-slate-900 hover:text-tesa-blue'} transition-colors`}>
                    {pb.name}
                  </Link>
                </td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pb.jurisdiction}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pb.locale}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pb.version}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{pb.status}</span></td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pb.rules}</td>
                <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{pb.updated}</td>
                <td className="px-4 py-3">
                  <button onClick={() => alert('Playbook editor coming soon')} className={`text-sm text-tesa-blue hover:underline`}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-lg border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Create New Playbook
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Define review rules and guidelines for contract types
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
              >
                <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Playbook Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  placeholder="e.g., Standard NDA Review"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  placeholder="Describe the purpose and scope of this playbook"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Jurisdiction *
                  </label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  >
                    <option value="">Select jurisdiction</option>
                    <option value="DACH">DACH</option>
                    <option value="EU">EU</option>
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="Global">Global</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Locale *
                  </label>
                  <select
                    value={formData.locale}
                    onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                  >
                    <option value="">Select locale</option>
                    <option value="EN">English</option>
                    <option value="DE">Deutsch</option>
                    <option value="FR">Français</option>
                    <option value="ES">Español</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <div className={`flex items-start gap-3`}>
                  <BookOpen size={20} className="text-tesa-blue mt-0.5" />
                  <div>
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                      What are Playbooks?
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Playbooks contain pre-defined review rules and guidelines that help standardize contract analysis. After creation, you can add specific rules for clauses, risk detection, and compliance checks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 border rounded-lg transition-colors ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaybook}
                disabled={!formData.name || !formData.jurisdiction || !formData.locale}
                className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
