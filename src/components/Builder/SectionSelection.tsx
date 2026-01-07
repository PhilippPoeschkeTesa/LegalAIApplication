import { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, AlertTriangle, TrendingUp } from 'lucide-react';
import { documentBuilderService, TemplateSection, SectionClauseOption, SelectedClause } from '../../lib/documentBuilderService';

interface SectionSelectionProps {
  section: TemplateSection;
  selectedClause: SelectedClause | undefined;
  onClauseSelect: (sectionId: string, sectionName: string, clauseId: string, clauseTitle: string, clauseContent: string) => void;
  isDark: boolean;
}

export function SectionSelection({
  section,
  selectedClause,
  onClauseSelect,
  isDark,
}: SectionSelectionProps) {
  const [clauseOptions, setClauseOptions] = useState<SectionClauseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  useEffect(() => {
    loadClauseOptions();
  }, [section.id]);

  const loadClauseOptions = async () => {
    try {
      setLoading(true);
      const options = await documentBuilderService.getSectionClauseOptions(section.id);
      setClauseOptions(options);
    } catch (err) {
      console.error('Failed to load clause options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClauseClick = (option: SectionClauseOption) => {
    if (!option.clause) return;

    onClauseSelect(
      section.id,
      section.name,
      option.clause.id,
      option.clause.title,
      option.clause.content
    );
  };

  const toggleExpanded = (clauseId: string) => {
    setExpandedClauseId(expandedClauseId === clauseId ? null : clauseId);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'high':
        return isDark ? 'text-red-400' : 'text-red-600';
      default:
        return isDark ? 'text-slate-400' : 'text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-8`}>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-tesa-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {section.name}
            {section.is_required && (
              <span className="ml-2 text-sm text-red-500">*Required</span>
            )}
          </h2>
        </div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {section.description}
        </p>
        {section.help_text && (
          <p className={`text-sm mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {section.help_text}
          </p>
        )}
      </div>

      {clauseOptions.length === 0 ? (
        <div className="text-center py-8">
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No clause options available for this section.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clauseOptions.map((option) => {
            if (!option.clause) return null;

            const isSelected = selectedClause?.clause_id === option.clause.id;
            const isExpanded = expandedClauseId === option.clause.id;

            return (
              <div
                key={option.id}
                className={`border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-tesa-blue bg-blue-50 dark:bg-blue-900/20'
                    : isDark
                      ? 'border-slate-700 hover:border-slate-600'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => handleClauseClick(option)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-tesa-blue bg-tesa-blue'
                          : isDark
                            ? 'border-slate-600'
                            : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check size={16} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {option.clause.title}
                          {option.is_recommended && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-tesa-blue text-white rounded">
                              Recommended
                            </span>
                          )}
                        </h3>
                      </div>

                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2 mb-3`}>
                        {option.clause.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${getRiskColor(option.risk_level)}`}>
                          <AlertTriangle size={14} />
                          <span className="capitalize">{option.risk_level} Risk</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <TrendingUp size={14} />
                          <span>Used {option.clause.usage_count} times</span>
                        </div>
                        {option.clause.jurisdiction && (
                          <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {option.clause.jurisdiction}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <button
                    onClick={() => toggleExpanded(option.clause!.id)}
                    className={`w-full px-4 py-2 flex items-center justify-between text-sm ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'} transition-colors`}
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} full text</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div className={`px-4 pb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <p className="whitespace-pre-wrap">{option.clause.content}</p>
                        {option.compatibility_notes && (
                          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              <strong>Note:</strong> {option.compatibility_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section.is_required && !selectedClause && (
        <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`text-sm ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
            This is a required section. Please select a clause option to continue.
          </p>
        </div>
      )}
    </div>
  );
}
