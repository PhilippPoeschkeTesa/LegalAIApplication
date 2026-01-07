import { FileText, CheckCircle2, Circle } from 'lucide-react';
import { DocumentTemplate, SelectedClause } from '../../lib/documentBuilderService';

interface DocumentPreviewProps {
  template: DocumentTemplate;
  selectedClauses: SelectedClause[];
  metadata: {
    title?: string;
    party_a?: string;
    party_b?: string;
    effective_date?: string;
    jurisdiction?: string;
  };
  isDark: boolean;
}

export function DocumentPreview({
  template,
  selectedClauses,
  metadata,
  isDark,
}: DocumentPreviewProps) {
  return (
    <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border sticky top-6`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <FileText size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Document Preview
          </h3>
        </div>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className={`mb-4 pb-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
            {metadata.title || template.name}
          </h4>
          {metadata.party_a && metadata.party_b && (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Between <strong>{metadata.party_a}</strong> and <strong>{metadata.party_b}</strong>
            </p>
          )}
          {metadata.effective_date && (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Effective: {new Date(metadata.effective_date).toLocaleDateString()}
            </p>
          )}
          {metadata.jurisdiction && (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Jurisdiction: {metadata.jurisdiction}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {selectedClauses.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Select clauses to see preview
              </p>
            </div>
          ) : (
            selectedClauses.map((clause, index) => (
              <div key={clause.section_id} className={`pb-4 ${index < selectedClauses.length - 1 ? `border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}` : ''}`}>
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 size={16} className="text-tesa-blue flex-shrink-0 mt-1" />
                  <div>
                    <h5 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {clause.section_name}
                    </h5>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                      {clause.clause_title}
                    </p>
                  </div>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-3 ml-6`}>
                  {clause.customizations || clause.clause_content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Sections completed
          </span>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {selectedClauses.length}
          </span>
        </div>
      </div>
    </div>
  );
}
