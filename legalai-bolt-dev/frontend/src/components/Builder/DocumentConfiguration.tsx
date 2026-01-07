import { useState, useEffect } from 'react';
import { FileText, Globe, Languages } from 'lucide-react';
import { documentBuilderService, DocumentTemplate } from '../../lib/documentBuilderService';

interface DocumentConfigurationProps {
  onTemplateSelect: (template: DocumentTemplate) => void;
  onMetadataChange: (metadata: any) => void;
  metadata: any;
  isDark: boolean;
}

export function DocumentConfiguration({
  onTemplateSelect,
  onMetadataChange,
  metadata,
  isDark,
}: DocumentConfigurationProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await documentBuilderService.getActiveTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: DocumentTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleContinue = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  const handleMetadataChange = (field: string, value: string) => {
    onMetadataChange({ ...metadata, [field]: value });
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
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
          Select Document Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedTemplateId === template.id
                  ? 'border-tesa-blue bg-blue-50 dark:bg-blue-900/20'
                  : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText
                  size={24}
                  className={selectedTemplateId === template.id ? 'text-tesa-blue' : isDark ? 'text-slate-400' : 'text-slate-500'}
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                    {template.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.jurisdictions.slice(0, 3).map((jurisdiction) => (
                      <span
                        key={jurisdiction}
                        className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {jurisdiction}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTemplateId && (
        <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-6`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
            Document Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Document Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="e.g., NDA - Acme Corp 2025"
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2 flex items-center gap-2`}>
                <Globe size={16} />
                Jurisdiction
              </label>
              <select
                value={metadata.jurisdiction}
                onChange={(e) => handleMetadataChange('jurisdiction', e.target.value)}
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              >
                <option value="">Select jurisdiction</option>
                <option value="DE">Germany</option>
                <option value="AT">Austria</option>
                <option value="CH">Switzerland</option>
                <option value="EU">European Union</option>
                <option value="US">United States</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2 flex items-center gap-2`}>
                <Languages size={16} />
                Language
              </label>
              <select
                value={metadata.language}
                onChange={(e) => handleMetadataChange('language', e.target.value)}
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              >
                <option value="en">English</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Effective Date
              </label>
              <input
                type="date"
                value={metadata.effective_date}
                onChange={(e) => handleMetadataChange('effective_date', e.target.value)}
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Party A (Your Organization)
              </label>
              <input
                type="text"
                value={metadata.party_a}
                onChange={(e) => handleMetadataChange('party_a', e.target.value)}
                placeholder="e.g., tesa SE"
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Party B (Counterparty)
              </label>
              <input
                type="text"
                value={metadata.party_b}
                onChange={(e) => handleMetadataChange('party_b', e.target.value)}
                placeholder="e.g., Acme GmbH"
                className={`w-full px-4 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={!metadata.title || !metadata.jurisdiction}
              className="w-full px-6 py-3 bg-tesa-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Clause Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
