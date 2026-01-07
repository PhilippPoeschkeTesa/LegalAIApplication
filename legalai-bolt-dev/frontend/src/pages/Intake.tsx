import { useState, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Upload, CheckCircle, Loader, FileText, Send, X, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

type DirectoryType = 'legal' | 'procurement' | 'hr' | 'shared';

export function Intake() {
  const { isDark } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const [tab, setTab] = useState<'ask' | 'onedrop' | 'requests'>('onedrop');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryType>('legal');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File, directory: DirectoryType) {
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

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setPendingFile(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
    }
  }

  function confirmUpload() {
    if (pendingFile) {
      handleFileUpload(pendingFile, selectedDirectory);
      setPendingFile(null);
    }
  }

  function cancelUpload() {
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function resetUpload() {
    setUploadedFile(null);
    setUploadError(null);
    setPendingFile(null);
    setSelectedDirectory('legal');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function createCLMRequest() {
    if (!user || !uploadedFile) return;

    alert(`CLM Request Created for file: ${uploadedFile.name}\nFile URL: ${uploadedFile.url}`);
    resetUpload();
  }

  async function submitQuestion() {
    if (!user || !question.trim()) return;

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      alert(`Question submitted successfully!\nQuestion: ${question.trim()}`);
      setQuestion('');
      setTab('requests');
    }, 1000);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>{t.intake.title}</h1>

      <div className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"} mb-6`}>
        <div className="flex gap-4">
          {(['ask', 'onedrop', 'requests'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                tab === tabKey
                  ? `border-tesa-blue font-medium ${isDark ? 'text-tesa-blue' : 'text-tesa-blue'}`
                  : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`
              }`}
            >
              {tabKey === 'ask' && 'Ask Helpdesk'}
              {tabKey === 'onedrop' && 'Upload Documents'}
              {tabKey === 'requests' && 'My Requests'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'onedrop' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-xl border-2 border-dashed ${uploadError ? 'border-red-400' : 'border-slate-300'} p-12 text-center`}>
          {uploading ? (
            <div className="py-12">
              <Loader className="animate-spin mx-auto mb-4 text-tesa-blue" size={48} />
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Uploading file...</p>
            </div>
          ) : uploadError ? (
            <div className="max-w-2xl mx-auto">
              <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-4`}>Upload Failed</h2>
              <p className={`mb-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{uploadError}</p>
              <button
                onClick={resetUpload}
                className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : pendingFile ? (
            <div className="max-w-2xl mx-auto">
              <FileText size={64} className={`mx-auto mb-4 ${isDark ? 'text-tesa-blue' : 'text-tesa-blue'}`} />
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>Select Destination</h2>

              <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-50'} rounded-lg p-6 space-y-6`}>
                <div className="text-left">
                  <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"} mb-1`}>{pendingFile.name}</div>
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {(pendingFile.size / 1024).toFixed(2)} KB
                  </div>
                </div>

                <div className="text-left">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Directory *
                  </label>
                  <select
                    value={selectedDirectory}
                    onChange={(e) => setSelectedDirectory(e.target.value as DirectoryType)}
                    className={`w-full p-3 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  >
                    <option value="legal">Legal</option>
                    <option value="procurement">Procurement</option>
                    <option value="hr">HR</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                  <button
                    onClick={cancelUpload}
                    className={`px-4 py-2 border ${isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpload}
                    className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 flex items-center gap-2 transition-all"
                  >
                    <Upload size={18} />
                    Upload to {selectedDirectory.charAt(0).toUpperCase() + selectedDirectory.slice(1)}
                  </button>
                </div>
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="max-w-2xl mx-auto">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>File Uploaded Successfully</h2>

              <div className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-50'} rounded-lg p-6 text-left space-y-4`}>
                <div className="flex items-start gap-4">
                  <FileText className={`${isDark ? 'text-tesa-blue' : 'text-tesa-blue'} flex-shrink-0 mt-1`} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${isDark ? "text-white" : "text-slate-900"} truncate`}>{uploadedFile.name}</div>
                    <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mt-1`}>
                      {(uploadedFile.size / 1024).toFixed(2)} KB • Uploaded at {uploadedFile.uploadedAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className={`pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"} mb-3`}>
                    File URL:
                  </div>
                  <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"} break-all bg-slate-800 p-3 rounded font-mono`}>
                    {uploadedFile.url}
                  </div>
                </div>

                <div className={`flex items-center justify-end gap-2 pt-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <button
                    onClick={resetUpload}
                    className={`px-4 py-2 border ${isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={createCLMRequest}
                    className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 flex items-center gap-2 transition-all"
                  >
                    <Send size={18} />
                    Create Request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <Upload size={64} className={`mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Drop your file here or click to browse
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                PDF, DOC, DOCX up to 50MB
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'ask' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-8`}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>
                Ask the Legal Helpdesk
              </h2>
              <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Submit questions to the legal team for guidance on contracts, compliance, or general legal matters.
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Your Question *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full p-4 border rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                rows={6}
                placeholder="Example: What are the key clauses I should review in a supplier agreement for the DACH region?"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Typical response time: 1-2 business days
              </p>
              <button
                onClick={submitQuestion}
                disabled={!question.trim() || submitting}
                className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6`}>
          <p className="text-slate-500">Your intake requests will appear here</p>
        </div>
      )}
    </div>
  );
}
