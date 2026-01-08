import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { appRoutes } from '../lib/config';
import { apiClient } from '../lib/apiClient';
import { Database, FileText, Filter, ChevronRight, MoreVertical, Upload } from 'lucide-react';

export function Repository() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedView, setSavedView] = useState('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoading(true);
    const result = await apiClient.redlineDocuments.getAll();
    if (result.success && result.data) {
      setDocuments(result.data);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await apiClient.redlineDocuments.upload(file, {
      title: file.name,
      confidentiality_level: 'internal',
    });

    if (result.success) {
      await loadDocuments();
    } else {
      alert('Upload failed: ' + result.error);
    }
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".docx,.pdf"
        style={{ display: 'none' }}
      />
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{t.nav.repository}</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Upload Contract'}
        </button>
      </div>

      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border p-4 mb-6`}>
        <div className="flex items-center gap-4">
          <select
            value={savedView}
            onChange={(e) => setSavedView(e.target.value)}
            className={`px-3 py-2 border ${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300'} rounded-lg text-sm font-medium`}
          >
            <option value="all">My Contracts</option>
            <option value="expiring">Expiring Soon</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border overflow-hidden`}>
        <table className="w-full">
          <thead className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} border-b`}>
            <tr>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Counterparty</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Owner</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Status</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jurisdiction</th>
              <th className={`text-left px-4 py-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Last Updated</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-tesa-blue border-t-transparent rounded-full animate-spin" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Loading documents...</span>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className={`border-b ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'} cursor-pointer`}>
                  <td className="px-4 py-3">
                    <Link to={`/review/${doc.id}`} className="flex items-center gap-2 group">
                      <FileText size={16} className="text-slate-400" />
                      <span className={`font-medium text-sm ${isDark ? 'text-white group-hover:text-tesa-blue' : 'text-slate-900 group-hover:text-tesa-blue'} transition-colors`}>{doc.title}</span>
                    </Link>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{doc.metadata?.type || 'Document'}</td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{doc.metadata?.counterparty || '-'}</td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{doc.metadata?.owner || 'You'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.confidentiality_level === 'confidential' ? 'bg-red-50 text-red-700' :
                      doc.confidentiality_level === 'restricted' ? 'bg-orange-50 text-orange-700' :
                      'bg-blue-50 text-tesa-blue'
                    }`}>
                      {doc.confidentiality_level || 'internal'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{doc.metadata?.jurisdiction || '-'}</td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)}
                      className={`p-1 ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} rounded transition-colors`}
                    >
                      <MoreVertical size={16} className={isDark ? 'text-white' : 'text-slate-600'} />
                    </button>
                    {openMenu === doc.id && (
                      <div className={`absolute right-0 mt-1 w-48 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg shadow-lg z-10`}>
                        <Link
                          to={`/review/${doc.id}`}
                          className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                        >
                          Open in Review
                        </Link>
                        <Link
                          to={appRoutes.copilot}
                          className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                        >
                          Bind to LegalAI
                        </Link>
                        <button
                          onClick={() => alert('CLM integration coming soon')}
                          className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-50 text-slate-900'} transition-colors`}
                        >
                          Open in CLM
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && documents.length === 0 && (
          <div className="p-12 text-center">
            <Database size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">{t.common.noData}</p>
            <p className="text-slate-400 text-sm mt-2">Click "Upload Contract" to add your first document</p>
          </div>
        )}
      </div>
    </div>
  );
}
