import { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { BookMarked, Search, ExternalLink } from 'lucide-react';

export function Research() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedRegions, setSelectedRegions] = useState(['EU', 'DE']);
  const [dateRange, setDateRange] = useState('all');
  const [allowlistOnly, setAllowlistOnly] = useState(true);

  // Removed useEffect and loadHistory - not needed for demo

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    const mockResult = {
      answer: `Based on DACH jurisdiction standards, unilateral NDAs are generally enforceable in Germany, Austria, and Switzerland when properly structured. Key requirements include:\n\n1. Clear definition of confidential information\n2. Reasonable time limitations (typically 2-5 years)\n3. Legitimate business purpose\n4. Proportionate restrictions\n\nHowever, enforceability may be challenged if the restrictions are deemed overly broad or if the information has entered the public domain through no fault of the receiving party.`,
      citations: [
        {
          source: 'German Civil Code (BGB) § 241',
          url: 'https://www.gesetze-im-internet.de/bgb/__241.html',
          relevance: 0.95,
          updated: '2024-12-01',
        },
        {
          source: 'DACH Contract Law Handbook, Chapter 7',
          url: '#',
          relevance: 0.89,
          updated: '2024-11-15',
        },
        {
          source: 'Austrian Business Code § 57',
          url: '#',
          relevance: 0.82,
          updated: '2024-10-20',
        },
      ],
      confidence: 0.92,
      jurisdiction: 'DACH',
    };

    setTimeout(() => {
      setResult(mockResult);
      setLoading(false);
    }, 2000);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>{t.research.title}</h1>
        <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Authoritative legal research with citation enforcement</p>
      </div>

      <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 mb-6`}>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t.research.query}
            className={`flex-1 px-4 py-3 border ${isDark ? 'border-slate-700 bg-slate-900 text-white placeholder-slate-400' : 'border-slate-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {['EU', 'DE', 'AT', 'CH'].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region])}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  selectedRegions.includes(region)
                    ? 'bg-tesa-blue text-white'
                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`px-3 py-1 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded text-xs`}
          >
            <option value="all">Any time</option>
            <option value="1y">Last year</option>
            <option value="6m">6 months</option>
            <option value="30d">30 days</option>
          </select>
          <button
            onClick={() => setAllowlistOnly(!allowlistOnly)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              allowlistOnly
                ? 'bg-green-100 text-green-700'
                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {allowlistOnly ? '✓' : ''} Allowlisted sources only
          </button>
        </div>
      </div>

      {result && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 mb-6`}>
          <div className="flex items-start justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{t.research.query}</h2>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.confidence >= 0.9
                    ? 'bg-green-100 text-green-700'
                    : result.confidence >= 0.7
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {Math.round(result.confidence * 100)}% {t.research.confidence}
              </div>
              <div className="px-3 py-1 bg-blue-50 text-tesa-blue rounded-full text-xs font-medium">
                {result.jurisdiction}
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-6">
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed whitespace-pre-line`}>{result.answer}</p>
          </div>

          <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"} pt-4`}>
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-3 flex items-center gap-2`}>
              <BookMarked size={18} />
              {t.research.citations} ({result.citations.length})
            </h3>

            <div className="space-y-3">
              {result.citations.map((citation: any, idx: number) => (
                <div key={idx} className={`flex items-start gap-3 p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-lg`}>
                  <div className="w-6 h-6 bg-tesa-blue text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{citation.source}</div>
                    <div className={`flex items-center gap-4 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      <span>Relevance: {Math.round(citation.relevance * 100)}%</span>
                      <span>Updated: {citation.updated}</span>
                      {citation.url !== '#' && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tesa-blue hover:brightness-110 flex items-center gap-1"
                        >
                          View source <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg text-sm font-medium transition-colors`}>
              Convert to Memo
            </button>
            <button className={`px-4 py-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg text-sm font-medium transition-colors`}>
              Compose Email
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
