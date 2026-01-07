import { useState } from 'react';
import { FileSignature, X, Copy, FileText, GitCompare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Clause {
  id: string;
  title: string;
  chips: string[];
  preview: string;
  alternates: number;
  usage: number;
  fullText?: string;
}

const clausesData: Clause[] = [
  {
    id: '1',
    title: 'Limitation of Liability — DE (preferred)',
    chips: ['DE', 'MSA', 'liability'],
    preview: 'Liability of each party shall be limited to 100% of fees paid under this agreement, excluding cases of gross negligence...',
    alternates: 2,
    usage: 14,
    fullText: 'Liability of each party shall be limited to 100% of fees paid under this agreement, excluding cases of gross negligence and wilful misconduct. Neither party shall be liable for indirect, consequential, or incidental damages.',
  },
  {
    id: '2',
    title: 'Confidentiality Term — EN',
    chips: ['EN', 'NDA', 'confidentiality'],
    preview: 'The confidentiality obligations survive for three (3) years from the date of disclosure or until the information becomes...',
    alternates: 1,
    usage: 23,
    fullText: 'The confidentiality obligations survive for three (3) years from the date of disclosure or until the information becomes publicly available through no fault of the receiving party.',
  },
  {
    id: '3',
    title: 'Governing Law — DE',
    chips: ['DE', 'general'],
    preview: 'This agreement shall be governed by the laws of Germany, with exclusive jurisdiction in the courts of Hamburg...',
    alternates: 3,
    usage: 31,
    fullText: 'This agreement shall be governed by the laws of Germany, with exclusive jurisdiction in the courts of Hamburg. The parties expressly exclude the application of the United Nations Convention on Contracts for the International Sale of Goods (CISG).',
  },
  {
    id: '4',
    title: 'Force Majeure — EN',
    chips: ['EN', 'MSA', 'general'],
    preview: 'Neither party shall be liable for failure to perform due to circumstances beyond reasonable control, including...',
    alternates: 2,
    usage: 18,
    fullText: 'Neither party shall be liable for failure to perform due to circumstances beyond reasonable control, including acts of God, war, terrorism, pandemic, or government action. The affected party shall notify the other within 5 business days.',
  },
  {
    id: '5',
    title: 'Data Protection — GDPR',
    chips: ['EU', 'DPA', 'privacy'],
    preview: 'The parties shall comply with all applicable data protection laws, including Regulation (EU) 2016/679 (GDPR)...',
    alternates: 1,
    usage: 27,
    fullText: 'The parties shall comply with all applicable data protection laws, including Regulation (EU) 2016/679 (GDPR). Each party shall implement appropriate technical and organizational measures to ensure data security.',
  },
  {
    id: '6',
    title: 'Termination for Convenience — EN',
    chips: ['EN', 'MSA', 'termination'],
    preview: 'Either party may terminate this agreement for convenience with ninety (90) days written notice to the other party...',
    alternates: 2,
    usage: 12,
    fullText: 'Either party may terminate this agreement for convenience with ninety (90) days written notice to the other party. Upon termination, all outstanding fees shall become immediately due and payable.',
  },
];

export function Clauses() {
  const { isDark } = useTheme();
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'alternates' | 'usage'>('text');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
          Clause Library
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Pre-approved clauses by jurisdiction and category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clausesData.map((clause) => (
          <button
            key={clause.id}
            onClick={() => setSelectedClause(clause)}
            className={`${isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800' : 'bg-white border-slate-200 hover:shadow-lg'} border rounded-lg p-4 text-left transition-all group`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} text-sm group-hover:text-tesa-blue transition-colors`}>
                {clause.title}
              </h3>
              <FileSignature size={18} className={`${isDark ? 'text-slate-400' : 'text-slate-400'} flex-shrink-0 ml-2`} />
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {clause.chips.map((chip) => (
                <span
                  key={chip}
                  className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-tesa-blue'}`}
                >
                  {chip}
                </span>
              ))}
            </div>

            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-3 line-clamp-2`}>
              {clause.preview}
            </p>

            <div className="flex items-center justify-between text-xs">
              <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Alternates: {clause.alternates}
              </span>
              <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Usage: {clause.usage}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedClause && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedClause(null)}
          />
          <div className={`fixed top-0 right-0 h-full w-[32rem] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border-l shadow-2xl z-50 flex flex-col`}>
            <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Clause Detail
              </h3>
              <button
                onClick={() => setSelectedClause(null)}
                className={`p-1 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded transition-colors`}
              >
                <X size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
            </div>

            <div className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} px-4`}>
              <div className="flex gap-1">
                {(['text', 'alternates', 'usage'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? isDark
                          ? 'border-tesa-blue text-tesa-blue'
                          : 'border-tesa-blue text-tesa-blue'
                        : isDark
                          ? 'border-transparent text-slate-400 hover:text-slate-300'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'text' && (
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-3`}>
                    {selectedClause.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedClause.chips.map((chip) => (
                      <span
                        key={chip}
                        className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-tesa-blue'}`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                    {selectedClause.fullText}
                  </p>
                </div>
              )}

              {activeTab === 'alternates' && (
                <div className="space-y-3">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedClause.alternates} alternate versions available
                  </p>
                  <div className={`p-3 border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} rounded-lg`}>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Alternate 1 (UK)</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Similar clause adapted for UK jurisdiction...
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'usage' && (
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
                    Used in {selectedClause.usage} contracts
                  </p>
                  <div className="space-y-2">
                    <div className={`p-2 border ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      MSA — Acme GmbH 2024
                    </div>
                    <div className={`p-2 border ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      NDA — Nordex SE 2024
                    </div>
                    <div className={`p-2 border ${isDark ? 'border-slate-700' : 'border-slate-200'} rounded text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      SOW — Contoso Ltd 2025
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} flex gap-2`}>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-tesa-blue text-white rounded-lg hover:opacity-90 transition-opacity">
                <FileText size={16} />
                Insert into Review
              </button>
              <button className={`px-4 py-2 border ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}>
                <Copy size={16} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
              <button className={`px-4 py-2 border ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}>
                <GitCompare size={16} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
