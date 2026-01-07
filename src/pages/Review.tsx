import { useState, useRef } from 'react';
import { apiClient } from '../lib/apiClient';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import {
  FileText, AlertCircle, AlertTriangle, Upload, Download,
  Play, GitCompare, Check, X, RotateCcw, CheckCircle
} from 'lucide-react';

interface Issue {
  id: string;
  clauseId: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  recommendation: string;
  citations: string[];
}

export function Review() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; url: string; uploadedAt: Date } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
    async function handleFileUpload(file: File, directory: string = 'review') {
      if (!file) return;
      setUploading(true);
      setUploadError(null);
      setUploadedFile(null);
      const result = await apiClient.files.upload(file, directory);
      if (result.success && result.data) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          url: result.data.url,
          uploadedAt: new Date(),
        });
        setUploading(false);
      } else {
        setUploadError(result.error || 'Upload failed. Please try again.');
        setUploading(false);
      }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file, 'review');
      }
    }
  const { isDark } = useTheme();
  const { t } = useLocale();
  const c = useColors(isDark);
  const [document, setDocument] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'playbook'>('issues');
  const [changesApplied, setChangesApplied] = useState(0);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);

  const mockIssues: Issue[] = [
    {
      id: '1',
      clauseId: 'section-3',
      severity: 'High',
      title: 'Liability Cap',
      recommendation: 'Increase cap to 100% of contract fees',
      citations: ['Standard NDA Playbook v2.3'],
    },
    {
      id: '2',
      clauseId: 'section-5',
      severity: 'Medium',
      title: 'Governing Law',
      recommendation: 'Change jurisdiction to Germany',
      citations: ['DACH Contract Standards'],
    },
    {
      id: '3',
      clauseId: 'section-7',
      severity: 'Low',
      title: 'Confidentiality Term',
      recommendation: 'Extend to at least 3 years',
      citations: ['Risk Management Policy'],
    },
  ];

  const playbookRules = [
    { name: 'Limitation of Liability', severity: 'High' },
    { name: 'Governing Law', severity: 'Medium' },
    { name: 'Confidentiality Term', severity: 'Low' },
  ];

  function handleAnalyze() {
    setAnalyzing(true);
    setDocument('loaded');
    setTimeout(() => {
      setIssues(mockIssues);
      setAnalyzing(false);
    }, 2000);
  }

  function handleApply(issueId: string) {
    setChangesApplied((prev) => prev + 1);
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case 'High':
        return AlertCircle;
      case 'Medium':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className={`border-b ${c.bg.elevated} ${c.border.primary} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${c.text.primary}`}>{t.review.title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play size={18} />
                  {t.review.analyze}
                </>
              )}
            </button>
            <button className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${c.button.secondary.border} ${c.button.secondary.text} ${c.button.secondary.hover}`}>
              <GitCompare size={18} />
              Redline
            </button>
            <button className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${c.button.secondary.border} ${c.button.secondary.text} ${c.button.secondary.hover}`}>
              <GitCompare size={18} />
              Compare
            </button>
            <button className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${c.button.secondary.border} ${c.button.secondary.text} ${c.button.secondary.hover}`}>
              <Download size={18} />
              Export DOCX (with comments)
            </button>
            <div className="relative">
              <button
                disabled={changesApplied === 0}
                onMouseEnter={() => changesApplied === 0 && setShowUploadTooltip(true)}
                onMouseLeave={() => setShowUploadTooltip(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                {t.review.uploadToCLM}
              </button>
              {showUploadTooltip && (
                <div className="absolute top-full mt-2 right-0 px-3 py-2 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                  Save changes first to enable upload
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={`flex-1 ${c.bg.secondary} overflow-y-auto relative`}>
          {!document ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <FileText size={64} className={`mx-auto mb-4 ${c.text.muted}`} />
                <h2 className={`text-xl font-semibold ${c.text.primary} mb-2`}>
                  No document loaded
                </h2>
                <p className={`${c.text.secondary} mb-6`}>
                  Upload a contract or select from repository to begin analysis
                </p>
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button
                    className="px-6 py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={20} />
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                  {uploadError && (
                    <div className="text-red-600 mt-2 text-sm">{uploadError}</div>
                  )}
                  {uploadedFile && (
                    <div className="text-green-600 mt-2 text-sm">
                      Uploaded: <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer">{uploadedFile.name}</a>
                    </div>
                  )}
                </>
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 pb-24">
                <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-8 max-w-4xl mx-auto`}>
                  <div className="prose prose-slate max-w-none">
                    <h1>Non-Disclosure Agreement</h1>
                    <p className={`${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      This Non-Disclosure Agreement (the "Agreement") is entered into as of October 13, 2025
                      between tesa SE ("Disclosing Party") and Acme GmbH ("Receiving Party").
                    </p>

                    <h2 id="section-3">3. Confidentiality Obligations</h2>
                    <p>
                      The Receiving Party agrees to maintain in confidence all Confidential
                      Information disclosed by the Disclosing Party and to use such information solely
                      for the Purpose defined herein.
                    </p>

                    <h2 id="section-5">5. Limitation of Liability</h2>
                    <p>
                      In no event shall either party be liable for damages exceeding €10,000 or
                      the amount paid under this Agreement, whichever is less.
                    </p>

                    <h2 id="section-7">7. Governing Law</h2>
                    <p>
                      This Agreement shall be governed by and construed in accordance with the laws
                      of Germany, without regard to conflict of law principles.
                    </p>
                  </div>
                </div>
              </div>

              {issues.length > 0 && (
                <div className={`fixed bottom-0 left-0 right-0 ${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} border-t border-slate-200 px-6 py-3 flex items-center justify-between z-20`}>
                  <div className="flex items-center gap-6">
                    <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Diff summary: <span className="text-green-600 font-medium">+3</span> /{' '}
                      <span className="text-red-600 font-medium">−1</span> /{' '}
                      <span className="text-orange-600 font-medium">~5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
                      <CheckCircle size={18} />
                      Apply All
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Check size={18} />
                      Accept
                    </button>
                    <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <X size={18} />
                      Reject
                    </button>
                    <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <RotateCcw size={18} />
                      Undo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <aside className={`w-96 border-l border-slate-200 ${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} flex flex-col`}>
          <div className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="flex">
              <button
                onClick={() => setActiveTab('issues')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'issues'
                    ? 'border-tesa-blue text-tesa-blue'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Issues ({issues.length})
              </button>
              <button
                onClick={() => setActiveTab('playbook')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'playbook'
                    ? 'border-tesa-blue text-tesa-blue'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Playbook
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'issues' ? (
              <>
                {issues.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                    No issues found. Click Analyze to start review.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {issues.map((issue) => {
                      const SeverityIcon = getSeverityIcon(issue.severity);
                      return (
                        <div
                          key={issue.id}
                          className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                        >
                          <div className="flex items-start gap-2 mb-3">
                            <SeverityIcon size={18} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1">{issue.title}</div>
                              <div className="text-xs opacity-75">
                                <span className={`px-2 py-0.5 rounded border font-medium ${getSeverityColor(issue.severity)}`}>
                                  {issue.severity}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-sm mb-3 pl-6">{issue.recommendation}</div>

                          <div className="flex gap-2 pl-6">
                            <button
                              onClick={() => handleApply(issue.id)}
                              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button className="flex-1 px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50 transition-colors">
                              Reject
                            </button>
                            <button className="px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded hover:bg-slate-50 transition-colors">
                              Explain
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <p className="mb-2">Active playbook: <strong>Standard NDA Review v2.3</strong></p>
                  <p>Jurisdiction: <strong>DACH (Germany, Austria, Switzerland)</strong></p>
                </div>

                <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"} pt-4 space-y-2`}>
                  {playbookRules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                          Rule: {rule.name}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {document && (
        <div className={`fixed bottom-0 left-16 right-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t py-3 px-6 flex items-center justify-between`}>
          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Diff summary: <span className="font-medium text-green-600">+3</span> / <span className="font-medium text-red-600">−1</span> / <span className="font-medium text-orange-600">~5</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChangesApplied((prev) => prev + issues.length)}
              className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Apply All
            </button>
            <button
              onClick={() => setChangesApplied((prev) => prev + 1)}
              className={`px-4 py-2 border ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}
            >
              Accept
            </button>
            <button className={`px-4 py-2 border ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}>
              Reject
            </button>
            <button className={`px-4 py-2 border ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}>
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
