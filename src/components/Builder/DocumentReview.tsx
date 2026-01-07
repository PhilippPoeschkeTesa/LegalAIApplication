import { useState } from 'react';
import { CheckCircle2, AlertCircle, Download, Save, FileText, Calendar, Globe, Users } from 'lucide-react';
import { DocumentTemplate, SelectedClause } from '../../lib/documentBuilderService';

interface DocumentReviewProps {
  template: DocumentTemplate;
  sections: any[];
  selectedClauses: SelectedClause[];
  metadata: any;
  completenessScore: number;
  onSave: (status: 'draft' | 'finalized') => Promise<any>;
  onExportWord: () => Promise<void>;
  saving: boolean;
  isDark: boolean;
}

export function DocumentReview({
  template,
  sections,
  selectedClauses,
  metadata,
  completenessScore,
  onSave,
  onExportWord,
  saving,
  isDark,
}: DocumentReviewProps) {
  const [exporting, setExporting] = useState(false);

  const requiredSections = sections.filter(s => s.is_required);
  const missingRequiredSections = requiredSections.filter(
    s => !selectedClauses.find(c => c.section_id === s.id)
  );

  const handleFinalize = async () => {
    await onSave('finalized');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportWord();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
          Document Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Document Type</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {template.name}
              </p>
            </div>
          </div>

          {metadata.party_a && metadata.party_b && (
            <div className="flex items-start gap-3">
              <Users size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Parties</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {metadata.party_a} & {metadata.party_b}
                </p>
              </div>
            </div>
          )}

          {metadata.effective_date && (
            <div className="flex items-start gap-3">
              <Calendar size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Effective Date</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {new Date(metadata.effective_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {metadata.jurisdiction && (
            <div className="flex items-start gap-3">
              <Globe size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Jurisdiction</p>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {metadata.jurisdiction}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg ${completenessScore === 100 ? (isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200') : (isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200')}`}>
          <div className="flex items-start gap-3">
            {completenessScore === 100 ? (
              <CheckCircle2 size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
            ) : (
              <AlertCircle size={20} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
            )}
            <div className="flex-1">
              <p className={`font-medium ${completenessScore === 100 ? (isDark ? 'text-green-200' : 'text-green-800') : (isDark ? 'text-yellow-200' : 'text-yellow-800')}`}>
                {completenessScore === 100 ? 'Document Complete' : 'Document Incomplete'}
              </p>
              <p className={`text-sm mt-1 ${completenessScore === 100 ? (isDark ? 'text-green-300' : 'text-green-700') : (isDark ? 'text-yellow-300' : 'text-yellow-700')}`}>
                {completenessScore}% of required sections completed
              </p>
              {missingRequiredSections.length > 0 && (
                <div className="mt-2">
                  <p className={`text-sm font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    Missing required sections:
                  </p>
                  <ul className={`text-sm mt-1 list-disc list-inside ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {missingRequiredSections.map(section => (
                      <li key={section.id}>{section.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
          Selected Clauses ({selectedClauses.length})
        </h2>

        <div className="space-y-3">
          {selectedClauses.map((clause, index) => (
            <div
              key={clause.section_id}
              className={`p-4 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tesa-blue text-white flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                    {clause.section_name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                    {clause.clause_title}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'} line-clamp-2`}>
                    {clause.clause_content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
          Next Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleFinalize}
            disabled={saving || completenessScore < 100}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-tesa-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save to Repository'}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || saving}
            className={`flex items-center justify-center gap-2 px-6 py-4 border ${isDark ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-300 text-slate-900 hover:bg-slate-50'} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
          >
            <Download size={20} />
            {exporting ? 'Exporting...' : 'Export to Word'}
          </button>
        </div>

        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-4`}>
          Save your document to the repository or export it as a Word document for further editing.
          {completenessScore < 100 && ' Complete all required sections before saving.'}
        </p>
      </div>
    </div>
  );
}
