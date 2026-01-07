import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Search as SearchIcon, FileText } from 'lucide-react';

export function Search() {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>Semantic Search</h1>

      <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-4 mb-6`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contracts and clauses..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tesa-blue"
          />
          <button className="px-6 py-3 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 flex items-center gap-2">
            <SearchIcon size={20} />
          </button>
        </div>
      </div>

      <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
        {results.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Enter a search query to find contracts and clauses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div key={idx} className={`p-4 border ${isDark ? "border-slate-700" : "border-slate-200"} rounded-lg`}>
                <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{result.title}</div>
                <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{result.excerpt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
