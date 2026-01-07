import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FileEdit, Sparkles, Save, Check } from 'lucide-react';

export function Draft() {
  const { isDark } = useTheme();
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [variables, setVariables] = useState({
    partyA: 'tesa SE',
    partyB: 'Acme GmbH',
    effectiveDate: '2025-10-18',
    termMonths: 24,
    confPeriodYears: 3,
    govLaw: 'Germany',
    language: 'EN'
  });

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-6`}>Draft Contract</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Template & Settings</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Template</label>
                <select className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}>
                  <option>Standard NDA</option>
                  <option>Master Service Agreement</option>
                  <option>Statement of Work</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Jurisdiction</label>
                <select className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}>
                  <option>Germany</option>
                  <option>Austria</option>
                  <option>Switzerland</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Language</label>
                <select
                  className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                  value={variables.language}
                  onChange={(e) => setVariables({...variables, language: e.target.value})}
                >
                  <option value="EN">English</option>
                  <option value="DE">German</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Variables</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Party A</label>
                <input
                  type="text"
                  value={variables.partyA}
                  onChange={(e) => setVariables({...variables, partyA: e.target.value})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Party B</label>
                <input
                  type="text"
                  value={variables.partyB}
                  onChange={(e) => setVariables({...variables, partyB: e.target.value})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Effective Date</label>
                <input
                  type="date"
                  value={variables.effectiveDate}
                  onChange={(e) => setVariables({...variables, effectiveDate: e.target.value})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Term (months)</label>
                <input
                  type="number"
                  value={variables.termMonths}
                  onChange={(e) => setVariables({...variables, termMonths: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Confidentiality Period (years)</label>
                <input
                  type="number"
                  value={variables.confPeriodYears}
                  onChange={(e) => setVariables({...variables, confPeriodYears: parseInt(e.target.value)})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Governing Law</label>
                <input
                  type="text"
                  value={variables.govLaw}
                  onChange={(e) => setVariables({...variables, govLaw: e.target.value})}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 px-6 py-3 bg-tesa-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Generate Draft
            </button>
            <button
              onClick={handleSave}
              disabled={!generated}
              className="px-6 py-3 border border-tesa-blue text-tesa-blue rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Saved!' : 'Save to Repository'}
            </button>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6 sticky top-6 h-fit`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>Draft Preview</h2>
          {generated ? (
            <div className="prose prose-sm max-w-none">
              <h3 className={isDark ? 'text-white' : 'text-slate-900'}>Non-Disclosure Agreement</h3>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                This Non-Disclosure Agreement (the "Agreement") is entered into as of <strong>{variables.effectiveDate}</strong> by and between <strong>{variables.partyA}</strong> ("Party A") and <strong>{variables.partyB}</strong> ("Party B").
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                The parties agree that the term of this agreement shall be <strong>{variables.termMonths} months</strong> from the effective date.
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Confidential information shall be protected for a period of <strong>{variables.confPeriodYears} years</strong> from the date of disclosure.
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                This agreement shall be governed by the laws of <strong>{variables.govLaw}</strong>.
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} italic`}>
                [Full contract text would appear here...]
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileEdit size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Click Generate Draft to preview contract
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
