import { useState, useEffect } from 'react';
import { Target, TrendingUp, Clock, Info, AlertCircle } from 'lucide-react';
import {
  getCompatiblePurposes,
  DocumentType,
  PurposeTag,
  getContextualWarnings,
  shouldShowBusinessCriticality,
} from '../../lib/builderRules';

interface Step1Props {
  state: {
    purpose_tags?: string[];
    criticality_level?: string;
    engagement_duration?: string;
  };
  contextState: {
    document_type?: string;
  };
  onChange: (updates: Partial<Step1Props['state']>) => void;
  isDark: boolean;
}

const PURPOSE_OPTIONS = [
  { id: 'supplier_onboarding', name: 'Supplier onboarding / procurement', icon: '📦' },
  { id: 'prototype_discussion', name: 'Technical concept / prototype evaluation', icon: '🔬' },
  { id: 'r_and_d', name: 'Joint development / R&D collaboration', icon: '💡' },
  { id: 'service_delivery', name: 'Service delivery / outsourcing', icon: '🛠️' },
  { id: 'joint_development', name: 'Joint venture / partnership', icon: '🤝' },
  { id: 'employment', name: 'Employee hire / HR', icon: '👤' },
];

const CRITICALITY_LEVELS = [
  {
    id: 'pilot',
    name: 'Low Value / Pilot',
    description: 'Test phase, tryout, pre-sales evaluation, low financial exposure',
    risk: 'Low',
  },
  {
    id: 'operational',
    name: 'Operationally Relevant',
    description: 'Ongoing supplier relationship, part of production, moderate business impact',
    risk: 'Medium',
  },
  {
    id: 'strategic',
    name: 'Strategic / High Exposure',
    description: 'Core IP, critical technology, M&A-sensitive, high competitive risk',
    risk: 'High',
  },
];

const DURATION_OPTIONS = [
  { id: 'short', name: '< 3 months', description: 'Short-term project or evaluation' },
  { id: 'medium', name: '3-12 months', description: 'Medium-term engagement' },
  { id: 'ongoing', name: 'Ongoing / Indefinite', description: 'Long-term strategic relationship' },
];

export function Step1DealFrame({ state, contextState, onChange, isDark }: Step1Props) {
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(state.purpose_tags || []);
  const [selectedCriticality, setSelectedCriticality] = useState(state.criticality_level || '');
  const [selectedDuration, setSelectedDuration] = useState(state.engagement_duration || '');

  useEffect(() => {
    onChange({
      purpose_tags: selectedPurposes,
      criticality_level: selectedCriticality,
      engagement_duration: selectedDuration,
    });
  }, [selectedPurposes, selectedCriticality, selectedDuration]);

  const togglePurpose = (purposeId: string) => {
    if (selectedPurposes.includes(purposeId)) {
      setSelectedPurposes(selectedPurposes.filter((p) => p !== purposeId));
    } else {
      setSelectedPurposes([...selectedPurposes, purposeId]);
    }
  };

  const getFilteredPurposeOptions = () => {
    if (!contextState.document_type) {
      return PURPOSE_OPTIONS;
    }

    const docType = contextState.document_type as DocumentType;
    const compatiblePurposes = getCompatiblePurposes(docType);

    return PURPOSE_OPTIONS.filter((purpose) => compatiblePurposes.includes(purpose.id as PurposeTag));
  };

  const filteredPurposeOptions = getFilteredPurposeOptions();
  const hasFilteredPurposes = filteredPurposeOptions.length < PURPOSE_OPTIONS.length;

  const showBusinessCriticality = shouldShowBusinessCriticality(contextState.document_type, selectedPurposes);

  const warnings = getContextualWarnings(
    contextState.document_type,
    selectedPurposes,
    undefined,
    selectedCriticality,
    undefined
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          What's the business context?
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Help us understand the deal structure so we can recommend the right clauses
        </p>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
          <Target size={18} />
          Purpose / Use Case (select all that apply)
        </label>
        {hasFilteredPurposes && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            } flex items-start gap-2`}
          >
            <Info size={16} className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              Purpose options are filtered based on your selected document type ({contextState.document_type}). Only purposes compatible with this document type are shown.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPurposeOptions.map((purpose) => {
            const isSelected = selectedPurposes.includes(purpose.id);
            return (
              <button
                key={purpose.id}
                onClick={() => togglePurpose(purpose.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-tesa-blue bg-tesa-blue/10'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{purpose.icon}</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{purpose.name}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          This helps tailor clauses like IP ownership, permitted use, and data protection requirements
        </p>
      </div>

      {showBusinessCriticality && (
        <div>
          <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
            <TrendingUp size={18} />
            Business Criticality / Commercial Value
          </label>
          <div className="space-y-3">
            {CRITICALITY_LEVELS.map((level) => {
              const isSelected = selectedCriticality === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedCriticality(level.id)}
                  className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-tesa-blue bg-tesa-blue/10'
                      : isDark
                      ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{level.name}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            level.risk === 'Low'
                              ? 'bg-green-100 text-green-700'
                              : level.risk === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {level.risk} Risk
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{level.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            This affects liability caps, termination rights, and approval requirements
          </p>
        </div>
      )}

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-2`}>
          <Clock size={18} />
          Expected Duration of Collaboration
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DURATION_OPTIONS.map((duration) => {
            const isSelected = selectedDuration === duration.id;
            return (
              <button
                key={duration.id}
                onClick={() => setSelectedDuration(duration.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-tesa-blue bg-tesa-blue/10'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{duration.name}</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{duration.description}</p>
              </button>
            );
          })}
        </div>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          This influences termination notice periods and renewal clauses
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
              } flex items-start gap-3`}
            >
              <AlertCircle
                size={20}
                className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
              />
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>{warning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
