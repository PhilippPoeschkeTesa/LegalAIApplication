import { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FolderSearch, Plus, Loader, CheckCircle, XCircle, Download } from 'lucide-react';

export function Discovery() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [user]);

  async function loadProjects() {
    if (!user) return;

    const { data } = await supabase
      .from('discovery_projects')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'queued':
      case 'parsing':
      case 'embedding':
      case 'extraction':
      case 'risking':
        return 'bg-blue-50 text-tesa-blue';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>{t.discovery.title}</h1>
          <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>Batch analysis up to 100 documents</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-6 py-3 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          {t.discovery.newProject}
        </button>
      </div>

      {showNew && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 mb-6`}>
          <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>Create Discovery Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g., Q1 2025 NDA Review"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Source
              </label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option>Select CLM matter or folder</option>
                <option>Matter #12345</option>
                <option>SharePoint Folder</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110">
                Start Discovery
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-12 text-center`}>
            <FolderSearch size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No discovery projects</h3>
            <p className="text-slate-500 mb-4">
              Create a project to analyze up to 100 documents at once
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer`}
              onClick={() => setSelected(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{project.name}</h3>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{project.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {t.discovery.status[project.status as keyof typeof t.discovery.status] || project.status}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Documents</div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{project.doc_count} / {project.max_docs}</div>
                </div>
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Progress</div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{Math.round(project.progress)}%</div>
                </div>
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Started</div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {project.started_at ? new Date(project.started_at).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div className="text-sm">
                  <div className={`${isDark ? "text-slate-300" : "text-slate-600"} mb-1`}>Completed</div>
                  <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {project.completed_at ? new Date(project.completed_at).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              {project.progress > 0 && (
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-tesa-blue h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              )}

              {project.status === 'completed' && (
                <div className="mt-4 flex items-center gap-2">
                  <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Export CSV
                  </button>
                  <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Export JSON
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
