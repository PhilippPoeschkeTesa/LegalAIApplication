import { X, ExternalLink } from 'lucide-react';

interface Citation {
  id: number;
  title: string;
  snippet: string;
}

interface CitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  citationNumber: number | null;
}

const citationData: Record<number, Citation> = {
  1: {
    id: 1,
    title: 'NDA Model Clause 3.1 (DE)',
    snippet: 'The confidentiality period shall be three (3) years from the date of disclosure, unless otherwise terminated in accordance with Section 7 of this Agreement.',
  },
  2: {
    id: 2,
    title: 'BGH Decision VIII ZR 123/20',
    snippet: 'German courts commonly uphold mutual NDAs with limited term provisions, provided the scope is reasonable and the confidential information is clearly defined.',
  },
  3: {
    id: 3,
    title: 'EU Trade Secrets Directive (2016/943)',
    snippet: 'Member States shall ensure the availability of measures, procedures and remedies necessary for the protection of undisclosed know-how and business information.',
  },
};

export function CitationDrawer({ isOpen, onClose, isDark, citationNumber }: CitationDrawerProps) {
  if (!isOpen || !citationNumber) return null;

  const citation = citationData[citationNumber];

  if (!citation) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-96 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border-l shadow-2xl z-50 flex flex-col`}>
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Citation [{citation.id}]
          </h3>
          <button
            onClick={onClose}
            className={`p-1 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded transition-colors`}
          >
            <X size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
              Source
            </h4>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {citation.title}
            </p>
          </div>

          <div>
            <h4 className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
              Snippet
            </h4>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
              {citation.snippet}
            </p>
          </div>

          <button className="flex items-center gap-2 text-tesa-blue hover:underline text-sm font-medium">
            <ExternalLink size={16} />
            View Source
          </button>
        </div>
      </div>
    </>
  );
}
