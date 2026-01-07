import { X } from 'lucide-react';

interface ToolModalProps {
  tool: string | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  availableDocs: string[];
}

export function ToolModal({ tool, isOpen, onClose, isDark, availableDocs }: ToolModalProps) {
  if (!isOpen || !tool) return null;

  const renderModalContent = () => {
    switch (tool) {
      case 'summarize':
        return (
          <>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Summarize Documents
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Select Documents
                </label>
                <div className={`border ${isDark ? 'border-slate-700' : 'border-slate-300'} rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto`}>
                  {availableDocs.map((doc) => (
                    <label key={doc} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full bg-tesa-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Run Summary
              </button>
            </div>
          </>
        );

      case 'extract':
        return (
          <>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Extract Data
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Document
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>Select document...</option>
                  {availableDocs.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Schema
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>NDA Summary</option>
                  <option>DPA Key Fields</option>
                  <option>MSA Commercials</option>
                </select>
              </div>
              <button className="w-full bg-tesa-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Extract
              </button>
            </div>
          </>
        );

      case 'compare':
        return (
          <>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Compare Documents
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Document A
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>Select document...</option>
                  {availableDocs.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Document B
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>Select document...</option>
                  {availableDocs.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
              <button className="w-full bg-tesa-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Compare
              </button>
            </div>
          </>
        );

      case 'risk':
        return (
          <>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Risk Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Document
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>Select document...</option>
                  {availableDocs.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Playbook
                </label>
                <select className={`w-full border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'} rounded-lg px-3 py-2`}>
                  <option>Standard NDA Review</option>
                  <option>MSA Commercials</option>
                  <option>DPA Compliance (GDPR)</option>
                </select>
              </div>
              <button className="w-full bg-tesa-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Analyze Risks
              </button>
            </div>
          </>
        );

      case 'compose':
        return (
          <>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-4`}>
              Compose Document
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Template Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="compose-type" value="summary" defaultChecked />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Executive Summary</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="compose-type" value="email" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email to Counterparty</span>
                  </label>
                </div>
              </div>
              <button className="w-full bg-tesa-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Compose
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border max-w-md w-full p-6`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className={`p-1 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded transition-colors ml-auto`}
          >
            <X size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
          </button>
        </div>
        {renderModalContent()}
      </div>
    </div>
  );
}
