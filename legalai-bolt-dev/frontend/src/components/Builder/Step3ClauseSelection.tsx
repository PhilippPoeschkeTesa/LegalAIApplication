import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, TrendingUp, Eye } from 'lucide-react';

interface ClauseOption {
  id: string;
  title: string;
  category: string;
  risk_level: string;
  requires_legal_review: boolean;
  usage_frequency: number;
  plain_language_summary: string;
  full_legal_text: string;
  is_recommended: boolean;
}

interface Section {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

interface Step3Props {
  templateId: string;
  contextState: {
    jurisdiction?: string;
    sensitivity_level?: string;
    criticality_level?: string;
  };
  selectedClauses: Record<string, string>;
  onChange: (sectionId: string, clauseId: string) => void;
  isDark: boolean;
}

export function Step3ClauseSelection({ templateId, contextState, selectedClauses, onChange, isDark }: Step3Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [clauseOptions, setClauseOptions] = useState<ClauseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, [templateId]);

  useEffect(() => {
    if (sections.length > 0) {
      loadClauseOptions(sections[currentSectionIndex].id);
    }
  }, [currentSectionIndex, sections, contextState]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('template_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      console.error('Failed to load sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClauseOptions = async (sectionId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_compatible_clauses', {
        p_section_id: sectionId,
        p_jurisdiction: contextState.jurisdiction || 'DE',
        p_sensitivity: contextState.sensitivity_level || 'standard',
        p_purpose_tags: '[]',
        p_criticality: contextState.criticality_level || 'operational',
      });

      if (error) throw error;
      setClauseOptions(data || []);
    } catch (err) {
      console.error('Failed to load clause options:', err);
      setClauseOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const currentSection = sections[currentSectionIndex];
  const selectedClauseId = currentSection ? selectedClauses[currentSection.id] : null;

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setExpandedClause(null);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setExpandedClause(null);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tesa-blue"></div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>No sections available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentSection.name}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Section {currentSectionIndex + 1} of {sections.length}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'} border`}>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {Object.keys(selectedClauses).length} / {sections.length} completed
            </p>
          </div>
        </div>

        {currentSection.description && (
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
            {currentSection.description}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {clauseOptions.length === 0 ? (
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                No clause options available for this section with your current settings.
              </p>
            </div>
          ) : (
            clauseOptions.map((clause) => {
              const isSelected = selectedClauseId === clause.id;
              const isExpanded = expandedClause === clause.id;

              return (
                <div
                  key={clause.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-tesa-blue bg-tesa-blue/5'
                      : isDark
                      ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          onClick={() => onChange(currentSection.id, clause.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-tesa-blue bg-tesa-blue'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle size={16} className="text-white" />}
                        </button>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {clause.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3 ml-9">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(clause.risk_level)}`}>
                          {clause.risk_level.toUpperCase()} RISK
                        </span>

                        {clause.is_recommended && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-tesa-blue/10 text-tesa-blue border border-tesa-blue/20">
                            ⭐ RECOMMENDED
                          </span>
                        )}

                        {clause.requires_legal_review && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Legal Review Required
                          </span>
                        )}

                        {clause.usage_frequency > 20 && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                            <TrendingUp size={12} />
                            Popular ({clause.usage_frequency} uses)
                          </span>
                        )}
                      </div>

                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} ml-9 mb-3`}>
                        {clause.plain_language_summary || 'No summary available'}
                      </p>

                      <button
                        onClick={() => setExpandedClause(isExpanded ? null : clause.id)}
                        className={`ml-9 flex items-center gap-2 text-sm font-medium ${
                          isDark ? 'text-tesa-blue-light hover:text-tesa-blue' : 'text-tesa-blue hover:text-tesa-blue-dark'
                        } transition-colors`}
                      >
                        <Eye size={16} />
                        {isExpanded ? 'Hide' : 'Show'} full legal text
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {isExpanded && clause.full_legal_text && (
                        <div className={`mt-4 ml-9 p-4 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                          <p className={`text-sm font-mono whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {clause.full_legal_text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            currentSectionIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : isDark
              ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
          } border`}
        >
          Previous Section
        </button>

        <button
          onClick={handleNext}
          disabled={currentSectionIndex === sections.length - 1 || !selectedClauseId}
          className={`flex-1 px-6 py-3 bg-tesa-blue text-white rounded-lg font-medium transition-all ${
            currentSectionIndex === sections.length - 1 || !selectedClauseId
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:opacity-90'
          }`}
        >
          {currentSectionIndex === sections.length - 1 ? 'Complete Selection' : 'Next Section'}
        </button>
      </div>
    </div>
  );
}
