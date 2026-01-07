import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Download, Save, FileText, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface ValidationFlag {
  type: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

interface Step4Props {
  builderState: any;
  onSave: () => Promise<void>;
  onExport: () => void;
  isDark: boolean;
}

export function Step4ReviewGenerate({ builderState, onSave, onExport, isDark }: Step4Props) {
  const [documentPreview, setDocumentPreview] = useState('');
  const [validationFlags, setValidationFlags] = useState<ValidationFlag[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  console.log('[Step4] Component rendered with builderState:', builderState);
  console.log('[Step4] selected_clauses:', builderState?.selected_clauses);

  useEffect(() => {
    console.log('[Step4] useEffect triggered');
    generateDocumentPreview();
    runValidation();
  }, [builderState]);

  const generateDocumentPreview = async () => {
    console.log('[Step4] generateDocumentPreview started');
    setGenerating(true);
    try {
      console.log('[Step4] Calling backend API with builderState');
      console.log('[Step4] BuilderState payload:', JSON.stringify(builderState, null, 2));

      const response = await apiClient.documents.generatePreview(builderState);

      console.log('[Step4] API Response:', response);

      if (response.success) {
        console.log('[Step4] ✅ Backend received payload successfully!');
        console.log('[Step4] Response data:', response.data);
        console.log('[Step4] Summary:', response.data?.summary);
      } else {
        console.error('[Step4] ❌ API call failed:', response.error);
      }

      console.log('[Step4] Building preview HTML (temporary frontend generation)');
      let html = `
        <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; margin-bottom: 10px;">${builderState.document_type || 'DOCUMENT'}</h1>
            <p style="font-size: 14px; color: #666;">Effective Date: ${builderState.effective_date || new Date().toLocaleDateString()}</p>
            ${response.success ? `<p style="font-size: 12px; color: #28a745; margin-top: 10px;">✅ Backend API Connected</p>` : ''}
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">PARTIES</h2>
            <p><strong>Employer:</strong> ${builderState.party_our_entity_name || '[Our Company]'}</p>
            ${builderState.document_type === 'Employment'
              ? `<p><strong>Employee:</strong> ${builderState.employee_name || '[Employee Name]'}, ${builderState.employee_position || '[Position]'}</p>`
              : `<p><strong>Counterparty:</strong> ${builderState.counterparty_name || '[Counterparty]'}</p>`
            }
          </div>

          <div style="margin-bottom: 30px; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #0284c7;">
            <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #0369a1;">API Integration Status</h3>
            <p style="font-size: 12px; margin-bottom: 5px;">Selected Clauses: ${Object.keys(builderState.selected_clauses || {}).length}</p>
            <p style="font-size: 12px; margin-bottom: 5px;">Document Type: ${builderState.document_type}</p>
            <p style="font-size: 12px; margin-bottom: 5px;">Jurisdiction: ${builderState.jurisdiction}</p>
            ${response.success ? `<p style="font-size: 12px; color: #16a34a; font-weight: bold;">Backend Response: ${response.data?.message}</p>` : ''}
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">SELECTED CLAUSES</h2>
            <p style="font-style: italic; color: #666;">Clause content will be generated here once backend integration is complete.</p>
            <p style="font-size: 12px; margin-top: 10px;">Number of clauses: ${Object.keys(builderState.selected_clauses || {}).length}</p>
          </div>

          <div style="margin-top: 60px; border-top: 2px solid #000; padding-top: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 20px;">SIGNATURES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px;">
              <div>
                <p><strong>Party A:</strong></p>
                <p style="margin-top: 20px;">_______________________</p>
                <p style="font-size: 12px; color: #666;">Name, Title</p>
                <p style="margin-top: 10px;">Date: _________________</p>
              </div>
              <div>
                <p><strong>Party B:</strong></p>
                <p style="margin-top: 20px;">_______________________</p>
                <p style="font-size: 12px; color: #666;">Name, Title</p>
                <p style="margin-top: 10px;">Date: _________________</p>
              </div>
            </div>
          </div>
        </div>
      `;

      console.log('[Step4] Preview HTML generated, length:', html.length);
      setDocumentPreview(html);
    } catch (err) {
      console.error('[Step4] Failed to generate preview:', err);
    } finally {
      console.log('[Step4] generateDocumentPreview finished');
      setGenerating(false);
    }
  };

  const runValidation = () => {
    const flags: ValidationFlag[] = [];

    const isEmployment = builderState.document_type === 'Employment';
    const requiredFields = isEmployment
      ? ['document_type', 'jurisdiction', 'employee_name', 'employee_position']
      : ['document_type', 'jurisdiction', 'counterparty_name'];
    const missingFields = requiredFields.filter(field => !builderState[field]);

    if (missingFields.length > 0) {
      flags.push({
        type: 'missing_fields',
        level: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const selectedClauses = builderState.selected_clauses || {};
    if (Object.keys(selectedClauses).length === 0) {
      flags.push({
        type: 'no_clauses',
        level: 'error',
        message: 'No clauses selected. Please select at least one clause.',
      });
    }

    if (!isEmployment && builderState.jurisdiction && builderState.counterparty_country) {
      const cpCountry = builderState.counterparty_country.split('-')[0];
      const jurisdiction = builderState.jurisdiction.split('-')[0];

      if (cpCountry !== jurisdiction) {
        flags.push({
          type: 'jurisdiction_mismatch',
          level: 'warning',
          message: `Counterparty is based in ${builderState.counterparty_country} but governing law is ${builderState.jurisdiction}. This may require legal review.`,
        });
      }
    }

    if (builderState.criticality_level === 'strategic' && builderState.liability_cap_model === 'unlimited') {
      flags.push({
        type: 'high_risk_liability',
        level: 'warning',
        message: 'Unlimited liability selected for strategic deal. This requires legal approval.',
      });
    }

    if (flags.length === 0) {
      flags.push({
        type: 'all_good',
        level: 'info',
        message: 'All validations passed. Document is ready to be saved.',
      });
    }

    setValidationFlags(flags);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning': return isDark ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-800';
      default: return isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <CheckCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const hasErrors = validationFlags.some(f => f.level === 'error');

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Review & Generate Document
        </h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Review your document, check validation flags, and save or export
        </p>
      </div>

      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <AlertTriangle size={20} />
          Validation & Quality Check
        </h3>
        <div className="space-y-3">
          {validationFlags.map((flag, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-start gap-3 ${getLevelColor(flag.level)}`}
            >
              {getLevelIcon(flag.level)}
              <div>
                <p className="font-medium capitalize">{flag.type.replace(/_/g, ' ')}</p>
                <p className="text-sm mt-1">{flag.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <FileText size={20} />
          Document Preview
        </h3>
        {generating ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
          </div>
        ) : (
          <div
            className={`p-6 rounded-lg border overflow-auto max-h-[500px] ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}
            dangerouslySetInnerHTML={{ __html: documentPreview }}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={hasErrors || saving}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            hasErrors || saving
              ? 'opacity-50 cursor-not-allowed bg-slate-400'
              : 'bg-tesa-blue text-white hover:opacity-90'
          }`}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save to Repository'}
        </button>

        <button
          onClick={onExport}
          disabled={hasErrors}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            hasErrors
              ? 'opacity-50 cursor-not-allowed bg-slate-400'
              : isDark
              ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
          } border`}
        >
          <Download size={20} />
          Export as Word (.docx)
        </button>
      </div>
    </div>
  );
}
