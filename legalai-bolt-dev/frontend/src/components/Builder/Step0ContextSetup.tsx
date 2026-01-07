import { useState, useEffect } from 'react';
import { Building, Globe, FileText, Shield, CheckCircle, Users } from 'lucide-react';

interface Step0Props {
  state: {
    document_type?: string;
    governing_law?: string;
    jurisdiction?: string;
    language?: string;
    sensitivity_level?: string;
  };
  onChange: (updates: Partial<Step0Props['state']>) => void;
  isDark: boolean;
}

const DOCUMENT_TYPES = [
  { id: 'NDA', name: 'Non-Disclosure Agreement', description: 'Protect confidential information in business discussions', icon: Shield },
  { id: 'MSA', name: 'Master Service Agreement', description: 'Framework for ongoing service relationships', icon: Building },
  { id: 'SOW', name: 'Statement of Work', description: 'Define specific project scope and deliverables', icon: FileText },
  { id: 'Employment', name: 'Employment Agreement', description: 'Comprehensive contract for hiring employees', icon: Users },
];

const JURISDICTIONS = [
  { id: 'DE', name: 'Germany (B2B)', law: 'German Law - BGB/HGB' },
  { id: 'AT', name: 'Austria', law: 'Austrian Law - ABGB' },
  { id: 'CH', name: 'Switzerland', law: 'Swiss Law - OR' },
  { id: 'EU', name: 'EU General', law: 'EU Harmonized Commercial Law' },
  { id: 'US-DE', name: 'US - Delaware Law', law: 'Delaware General Corporation Law' },
  { id: 'UK-ENG', name: 'UK - England & Wales', law: 'English Contract Law' },
];

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'de', name: 'German (Deutsch)' },
];

const SENSITIVITY_LEVELS = [
  {
    id: 'standard',
    name: 'Standard / Low Risk',
    description: 'Normal business relationships, standard supplier data, non-critical information',
  },
  {
    id: 'high_ip',
    name: 'High IP Sensitivity',
    description: 'R&D projects, trade secrets, proprietary formulas, innovative prototypes',
  },
  {
    id: 'high_commercial',
    name: 'High Commercial Value',
    description: 'Strategic partnerships, M&A discussions, competitive sensitive information',
  },
];

export function Step0ContextSetup({ state, onChange, isDark }: Step0Props) {
  const [selectedType, setSelectedType] = useState(state.document_type || '');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(state.jurisdiction || '');
  const [selectedLanguage, setSelectedLanguage] = useState(state.language || 'en');
  const [selectedSensitivity, setSelectedSensitivity] = useState(state.sensitivity_level || 'standard');

  useEffect(() => {
    onChange({
      document_type: selectedType,
      jurisdiction: selectedJurisdiction,
      governing_law: JURISDICTIONS.find(j => j.id === selectedJurisdiction)?.law,
      language: selectedLanguage,
      sensitivity_level: selectedSensitivity,
    });
  }, [selectedType, selectedJurisdiction, selectedLanguage, selectedSensitivity]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          What are we building?
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Let's set the context for your document. These choices will tailor all clause options to your specific needs.
        </p>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Document Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCUMENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                  isSelected
                    ? 'border-tesa-blue bg-tesa-blue/10'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle size={24} className="text-tesa-blue" />
                  </div>
                )}
                <Icon size={32} className={`mb-3 ${isSelected ? 'text-tesa-blue' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {type.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Jurisdiction / Governing Law
        </label>
        <select
          value={selectedJurisdiction}
          onChange={(e) => setSelectedJurisdiction(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          } focus:ring-2 focus:ring-tesa-blue focus:border-transparent transition-all`}
        >
          <option value="">Select jurisdiction...</option>
          {JURISDICTIONS.map((jurisdiction) => (
            <option key={jurisdiction.id} value={jurisdiction.id}>
              {jurisdiction.name} - {jurisdiction.law}
            </option>
          ))}
        </select>
        <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          This filters all clause options to ensure legal compatibility with your chosen jurisdiction
        </p>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Document Language
        </label>
        <div className="flex gap-4">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`flex-1 px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                  isSelected
                    ? 'border-tesa-blue bg-tesa-blue/10 text-tesa-blue'
                    : isDark
                    ? 'border-slate-700 text-slate-300 hover:border-slate-600'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Globe size={20} className="inline mr-2" />
                {lang.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Information Sensitivity Level
        </label>
        <div className="space-y-3">
          {SENSITIVITY_LEVELS.map((level) => {
            const isSelected = selectedSensitivity === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedSensitivity(level.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-tesa-blue bg-tesa-blue/10'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {level.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {level.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} className="text-tesa-blue ml-4 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedType && selectedJurisdiction && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                Context configured
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                All clause options will now be filtered to match: {selectedType} under {JURISDICTIONS.find(j => j.id === selectedJurisdiction)?.name}, {selectedSensitivity.replace('_', ' ')} sensitivity
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
