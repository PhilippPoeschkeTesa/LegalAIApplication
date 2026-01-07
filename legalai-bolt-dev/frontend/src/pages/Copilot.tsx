import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { mockData, jurisdictions, aiModels, type AIModel } from '../lib/config';
import { ToolModal } from '../components/Copilot/ToolModals';
import { CitationDrawer } from '../components/Copilot/CitationDrawer';
import { enhancedAIService } from '../lib/enhancedAIService';
import { feedbackService } from '../lib/feedbackService';
import { contextEngine } from '../lib/contextEngine';
import { socketService } from '../lib/socketService';
import {
  Send, FileText, FileSearch, GitCompare, AlertTriangle, FileEdit,
  Paperclip, Loader, X, Plus, ExternalLink, FileUp, MessageSquare,
  Trash2, ChevronDown, Settings, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { source: string; reference: string; url?: string }[];
  confidence?: number;
  quality_score?: number;
  hallucination_flags?: Array<{ type: string; severity: string; description: string }>;
  warnings?: string[];
  response_time_ms?: number;
  feedback?: { rating: number; comment?: string };
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  model_name?: string;
}

export function Copilot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLocale();
  const c = useColors(isDark);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [boundDocs, setBoundDocs] = useState<string[]>([mockData.sampleDocuments[0]]);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);
  const [selectedCitationNumber, setSelectedCitationNumber] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);


  const tools = [
    { id: 'summarize', label: t.legalai.tools.summarize, icon: FileText },
    { id: 'extract', label: t.legalai.tools.extract, icon: FileSearch },
    { id: 'compare', label: t.legalai.tools.compare, icon: GitCompare },
    { id: 'risk', label: t.legalai.tools.risk, icon: AlertTriangle },
    { id: 'compose', label: t.legalai.tools.compose, icon: FileEdit },
  ];

  const availableDocs = mockData.sampleDocuments;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadModels();
    loadConversations();
    if (user?.id) {
      loadUserContext();
    }
  }, [user]);

  async function loadUserContext() {
    if (!user?.id) return;
    const context = await contextEngine.getUserContext(user.id);
    setUserContext(context);
  }

  // Socket service integration for real-time chat
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('ai_response', (response: string) => {
      const agentMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setLoading(false);
    });

    socket.on('chat_error', (error: string) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    });

    return () => {
      socket.off('ai_response');
      socket.off('chat_error');
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentConversationId && messages.length === 0) {
      const seedMessage: Message = {
        id: '1',
        role: 'assistant',
        content: "Here's a 5-bullet summary of the NDA:\n\n• Mutual confidentiality obligations between tesa SE and Acme GmbH\n• 3-year confidentiality period from disclosure date\n• Governed by German law, jurisdiction Berlin\n• Standard exceptions: public domain, independent development, required disclosure\n• No automatic renewal; expires on stated term",
        citations: [
          { number: 1, source: 'NDA_EN_2024_v3.docx § 2 (Obligations)' },
          { number: 2, source: 'NDA_EN_2024_v3.docx § 5 (Term)' },
          { number: 3, source: 'NDA_EN_2024_v3.docx § 8 (Governing Law)' },
        ],
        confidence: 0.82,
        created_at: new Date().toISOString(),
      };
      setMessages([seedMessage]);
    }
  }, [currentConversationId, messages.length]);

  async function loadModels() {
    try {
      // TODO: Replace with backend API call when available
      // For now, skip model loading - using default
      console.log('Model loading skipped (backend integration pending)');
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  async function loadConversations() {
    if (!user?.id) return;


    setLoadingConversations(false);
    // TODO: Implement conversation loading via backend API
    console.log('Conversation loading skipped (backend integration pending)');
  }

  async function loadConversation(conversationId: string) {
    // TODO: Implement conversation loading via backend API
    console.log('Load conversation skipped (backend integration pending):', conversationId);
  }

  async function startNewConversation() {
    setMessages([]);
    setCurrentConversationId(null);
  }

  async function deleteConversation(conversationId: string) {
    try {
      // TODO: Implement via backend API
      console.log('Delete conversation skipped (backend integration pending):', conversationId);
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  function handleToolClick(toolId: string) {
    setSelectedTool(toolId);
    setShowToolModal(true);
  }

  async function sendMessage() {
    if (!input.trim() || !user?.id) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Emit message via socket for real-time chat capabilities
    try {
      socketService.emit('user_message', currentInput);
    } catch (socketError) {
      console.warn('Socket service not available, continuing with HTTP fallback:', socketError);
    }

    try {
      let conversationId = currentConversationId;

      // Demo user or no backend - just use in-memory conversation
      if (!conversationId) {
        conversationId = crypto.randomUUID();
        setCurrentConversationId(conversationId);
      }

      // TODO: Backend API integration - Commented out for now
      // Socket service will handle the response via 'ai_response' event
      /*
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput },
          ],
          model: selectedModel?.modelId || 'gpt-4o-mini',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      console.log('API Response:', data);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message || data.response || 'No response from AI',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      */

      // TODO: Save conversation to backend when API is available

    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        type: typeof error,
        isError: error instanceof Error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      let errorMsg = 'Unknown error';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMsg = String((error as any).message);
      }

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(messageId: string, rating: number) {
    if (!user?.id || !currentConversationId) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (message.feedback?.rating === rating) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, feedback: undefined } : m
      ));
      return;
    }

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedback: { rating } } : m
    ));

    try {
      await feedbackService.submitFeedback({
        conversation_id: currentConversationId,
        message_id: messageId,
        user_id: user.id,
        rating,
        feedback_type: 'general',
        context_metadata: {
          jurisdiction: userContext?.jurisdiction,
          query_type: 'general',
        },
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }

  function removeBoundDoc(doc: string) {
    setBoundDocs((prev) => prev.filter((d) => d !== doc));
  }

  function addBoundDoc(doc: string) {
    if (!boundDocs.includes(doc)) {
      setBoundDocs((prev) => [...prev, doc]);
    }
    setShowDocPicker(false);
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {showHistory && (
        <aside className={`w-80 border-r ${c.bg.elevated} ${c.border.primary} flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${c.text.primary}`}>Chat History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className={`p-1 ${c.bg.hover} rounded`}
              >
                <X size={16} className={c.text.secondary} />
              </button>
            </div>
            <button
              onClick={startNewConversation}
              className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin text-tesa-blue" size={24} />
              </div>
            ) : conversations.length === 0 ? (
              <p className={`text-sm ${c.text.muted} text-center py-8`}>No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer group ${
                    currentConversationId === conv.id
                      ? 'bg-tesa-blue text-white'
                      : `${c.bg.hover} ${c.text.primary}`
                  }`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={14} />
                        <p className="text-sm font-medium truncate">
                          {conv.title || 'Untitled conversation'}
                        </p>
                      </div>
                      <p className={`text-xs ${currentConversationId === conv.id ? 'text-blue-100' : c.text.muted}`}>
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                      {conv.model_name && (
                        <p className={`text-xs mt-1 ${currentConversationId === conv.id ? 'text-blue-100' : c.text.muted}`}>
                          {conv.model_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col">
        <div className={`border-b ${c.bg.elevated} ${c.border.primary} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 ${c.bg.hover} rounded-lg transition-colors`}
                title="Chat history"
              >
                <MessageSquare size={20} className={c.text.secondary} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${c.text.primary}`}>{t.legalai.title}</h1>
                <p className={`text-sm ${c.text.secondary} mt-1`}>Jurisdiction-aware legal assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className={`flex items-center gap-2 px-3 py-2 ${c.bg.tertiary} ${c.text.secondary} rounded-lg ${c.bg.hover} transition-colors`}
                >
                  <Settings size={16} />
                  <span className="text-xs font-medium">
                    {selectedModel?.displayName || aiModels.default.name}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {showModelPicker && (
                  <div className={`absolute right-0 mt-2 w-80 ${c.card.bg} border ${c.card.border} rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}>
                    <div className="p-2">
                      <div className={`px-3 py-2 text-xs font-semibold ${c.text.muted}`}>
                        Select AI Model ({availableModels.length} available)
                      </div>
                      {availableModels.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className={`text-sm ${c.text.muted}`}>Loading models...</p>
                        </div>
                      ) : (
                        availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelPicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded ${c.bg.hover} transition-colors ${
                            selectedModel?.id === model.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${c.text.primary}`}>
                              {model.displayName}
                            </span>
                            {model.isDefault && (
                              <span className={`text-xs px-2 py-0.5 ${c.badge.success.bg} ${c.badge.success.text} rounded`}>
                                Default
                              </span>
                            )}
                          </div>
                          {model.description && (
                            <p className={`text-xs ${c.text.muted} mb-1`}>{model.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {model.jurisdictions.slice(0, 3).map((j) => (
                              <span
                                key={j}
                                className={`text-xs px-2 py-0.5 ${c.badge.info.bg} ${c.badge.info.text} rounded`}
                              >
                                {j}
                              </span>
                            ))}
                          </div>
                        </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className={`text-xs px-2 py-1 ${c.badge.info.bg} ${c.badge.info.text} rounded font-medium`}>
                {jurisdictions.dach.code}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={64} className={`mx-auto mb-4 ${c.text.muted}`} />
              <h2 className={`text-xl font-semibold ${c.text.primary} mb-2`}>
                Start a conversation
              </h2>
              <p className={c.text.secondary}>
                Ask legal questions, analyze contracts, or use specialized tools
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-tesa-blue text-white'
                      : `${c.message.assistant.bg} border ${c.message.assistant.border} ${c.message.assistant.text}`
                  }`}
                >
                  <div className="text-sm mb-2 opacity-70 flex items-center justify-between">
                    <span>{message.role === 'user' ? 'You' : 'LegalAI'}</span>
                    <span className="text-xs">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {message.role === 'assistant' && message.warnings && message.warnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <AlertCircle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-yellow-800">{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.role === 'assistant' && message.hallucination_flags && message.hallucination_flags.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-orange-600 mb-1">Quality Alerts:</div>
                      <div className="space-y-1">
                        {message.hallucination_flags.slice(0, 3).map((flag, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                            <AlertCircle size={12} className="text-orange-600 flex-shrink-0 mt-0.5" />
                            <span className="text-orange-800">{flag.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.role === 'assistant' && (
                    <>
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium mb-2 opacity-70">Legal Citations:</div>
                          <div className="flex flex-wrap gap-2">
                            {message.citations.map((citation, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCitationNumber(idx + 1);
                                  setShowCitationDrawer(true);
                                }}
                                className={`text-xs px-2 py-1 rounded hover:brightness-110 transition-colors font-medium ${c.badge.info.bg} ${c.badge.info.text}`}
                                title={`${citation.source} ${citation.reference}`}
                              >
                                {citation.source} {citation.reference}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {message.confidence !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${
                            message.confidence >= 0.7 ? c.badge.success.bg + ' ' + c.badge.success.text
                            : message.confidence >= 0.5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            Confidence: {(message.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                        {message.quality_score !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${
                            message.quality_score >= 80 ? c.badge.success.bg + ' ' + c.badge.success.text
                            : message.quality_score >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            Quality: {message.quality_score.toFixed(0)}/100
                          </span>
                        )}
                        {message.response_time_ms !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${c.badge.info.bg} ${c.badge.info.text}`}>
                            {(message.response_time_ms / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>

                      <div className={`mt-3 pt-3 border-t ${c.border.primary} flex items-center justify-between`}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate('/review')}
                            className="text-xs text-tesa-blue hover:underline font-medium flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            Open in Review
                          </button>
                          <button
                            onClick={() => navigate('/intake')}
                            className="text-xs text-tesa-blue hover:underline font-medium flex items-center gap-1"
                          >
                            <FileUp size={12} />
                            Create intake
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleFeedback(message.id, 1)}
                            className={`p-1.5 rounded transition-colors ${
                              message.feedback?.rating === 1 ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, -1)}
                            className={`p-1.5 rounded transition-colors ${
                              message.feedback?.rating === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                            title="Poor response"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-4 flex items-center gap-2`}>
                <Loader className="animate-spin text-tesa-blue" size={20} />
                <span className={`text-sm ${c.text.secondary}`}>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={`border-t ${c.bg.elevated} ${c.border.primary} p-4`}>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${c.bg.tertiary} ${c.text.secondary} ${c.bg.hover} transition-colors flex items-center gap-2 whitespace-nowrap`}
                >
                  <Icon size={16} />
                  {tool.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask a legal question…"
              className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${c.input.bg} ${c.input.border} ${c.input.text} ${c.input.placeholder} ${c.input.focus}`}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <aside className={`w-80 border-l ${c.bg.elevated} ${c.border.primary} p-4 overflow-y-auto`}>
        <h3 className={`font-semibold ${c.text.primary} mb-4`}>Context</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${c.text.primary}`}>Bound Documents</span>
              <button
                onClick={() => setShowDocPicker(true)}
                className="text-xs text-tesa-blue hover:underline font-medium flex items-center gap-1"
              >
                <Plus size={12} />
                Bind documents
              </button>
            </div>
            {boundDocs.length === 0 ? (
              <p className={`text-sm ${c.text.muted} italic`}>No documents bound</p>
            ) : (
              <div className="space-y-2">
                {boundDocs.map((doc) => (
                  <div
                    key={doc}
                    className={`flex items-center gap-2 p-2 ${c.badge.info.bg} rounded text-sm group`}
                  >
                    <FileText size={14} className="text-tesa-blue flex-shrink-0" />
                    <span className={`flex-1 ${c.badge.info.text} truncate`}>{doc}</span>
                    <button
                      onClick={() => removeBoundDoc(doc)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className={`${c.text.muted} hover:text-red-600`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`pt-4 border-t ${c.border.primary}`}>
            <div className={`text-sm ${c.text.secondary} mb-1 font-medium`}>Active Playbook</div>
            <p className={`text-sm ${c.text.primary}`}>{mockData.defaultPlaybook.name} {mockData.defaultPlaybook.version}</p>
          </div>

          <div className={`pt-4 border-t ${c.border.primary}`}>
            <div className={`text-sm ${c.text.secondary} mb-1 font-medium`}>Jurisdiction</div>
            <p className={`text-sm ${c.text.primary}`}>{jurisdictions.dach.fullName}</p>
          </div>
        </div>
      </aside>

      {showDocPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${c.card.bg} rounded-xl p-6 w-full max-w-md border ${c.card.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${c.text.primary}`}>Bind Documents</h3>
              <button onClick={() => setShowDocPicker(false)}>
                <X size={20} className={`${c.text.muted} hover:${c.text.secondary}`} />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableDocs.map((doc) => (
                <button
                  key={doc}
                  onClick={() => addBoundDoc(doc)}
                  disabled={boundDocs.includes(doc)}
                  className={`w-full flex items-center gap-3 p-3 border ${c.card.border} rounded-lg ${c.bg.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left`}
                >
                  <FileText size={18} className="text-tesa-blue flex-shrink-0" />
                  <span className={`text-sm ${c.text.primary}`}>{doc}</span>
                  {boundDocs.includes(doc) && (
                    <span className="ml-auto text-xs text-green-600 font-medium">Bound</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showToolModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${c.card.bg} rounded-xl p-6 w-full max-w-lg border ${c.card.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${c.text.primary} capitalize`}>{selectedTool}</h3>
              <button onClick={() => setShowToolModal(false)}>
                <X size={20} className={`${c.text.muted} hover:${c.text.secondary}`} />
              </button>
            </div>

            {selectedTool === 'summarize' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${c.text.primary} mb-2`}>
                    Select documents
                  </label>
                  <select multiple className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    {boundDocs.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all">
                  Generate Summary
                </button>
              </div>
            )}

            {selectedTool === 'extract' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select document
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    {boundDocs.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Schema
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    <option>NDA Summary</option>
                    <option>DPA Key Fields</option>
                    <option>MSA Commercials</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all">
                  Extract Data
                </button>
              </div>
            )}

            {selectedTool === 'compare' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select A
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    {boundDocs.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select B
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    {boundDocs.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all">
                  Compare Documents
                </button>
              </div>
            )}

            {selectedTool === 'risk' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select document
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    {boundDocs.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select playbook
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                    <option>Standard NDA Review v2.3</option>
                    <option>MSA Review v1.0</option>
                    <option>DPA Compliance Check v2.0</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all">
                  Analyze Risk
                </button>
              </div>
            )}

            {selectedTool === 'compose' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Output type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="compose" value="summary" defaultChecked />
                      <span className="text-sm">Executive summary</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="compose" value="email" />
                      <span className="text-sm">Email to counterparty</span>
                    </label>
                  </div>
                </div>
                <button className="w-full py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all">
                  Generate Text
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-xl p-6 w-full max-w-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Citation [{selectedCitation.number}]</h3>
              <button onClick={() => setSelectedCitation(null)}>
                <X size={20} className={`${c.text.muted} hover:${c.text.secondary}`} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Source</div>
                <div className={`text-sm ${isDark ? "text-white" : "text-slate-900"} bg-slate-50 p-3 rounded-lg`}>
                  {selectedCitation.source}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Excerpt</div>
                <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} bg-slate-50 p-3 rounded-lg leading-relaxed`}>
                  "The Disclosing Party shall retain all rights, title and interest in and to the Confidential Information.
                  The Receiving Party shall not acquire any intellectual property rights under this Agreement except the limited
                  right to use the Confidential Information as expressly provided herein."
                </div>
              </div>
              <button className="w-full py-2 border border-tesa-blue text-tesa-blue rounded-lg hover:bg-blue-50 transition-colors font-medium">
                View source document
              </button>
            </div>
          </div>
        </div>
      )}

      <ToolModal
        tool={selectedTool}
        isOpen={showToolModal}
        onClose={() => {
          setShowToolModal(false);
          setSelectedTool(null);
        }}
        isDark={isDark}
        availableDocs={availableDocs}
      />

      <CitationDrawer
        isOpen={showCitationDrawer}
        onClose={() => {
          setShowCitationDrawer(false);
          setSelectedCitationNumber(null);
        }}
        isDark={isDark}
        citationNumber={selectedCitationNumber}
      />
    </div>
  );
}
