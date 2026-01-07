import { Scale, Search, Book, ExternalLink, Filter, Calendar, MapPin, MessageCircle, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';
import { useState, useEffect } from 'react';
import { legalKnowledgeService, type LegalSource, type LegalUpdate } from '../lib/legalKnowledgeService';
import { socketService } from '../lib/socketService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export function Legal() {
  const { isDark } = useTheme();
  const c = useColors(isDark);
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'updates' | 'info'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('DACH');
  const [sourceType, setSourceType] = useState('all');
  const [legalSources, setLegalSources] = useState<LegalSource[]>([]);
  const [legalUpdates, setLegalUpdates] = useState<LegalUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Legal AI assistant. How can I help you today?',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeTab === 'updates') {
      loadRecentUpdates();
    }
  }, [activeTab, jurisdiction]);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('ai_response', (response: string) => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    });

    socket.on('chat_error', (error: string) => {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error}`,
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    });

    return () => {
      socket.off('ai_response');
      socket.off('chat_error');
      socketService.disconnect();
    };
  }, []);

  async function handleSearch() {
    setLoading(true);
    try {
      const results = await legalKnowledgeService.searchLegalSources({
        jurisdiction: jurisdiction === 'all' ? undefined : jurisdiction,
        source_type: sourceType === 'all' ? undefined : sourceType,
        keywords: searchQuery || undefined,
        valid_as_of: new Date().toISOString().split('T')[0],
      });
      setLegalSources(results);
    } catch (error) {
      console.error('Error searching legal sources:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecentUpdates() {
    setLoading(true);
    try {
      const updates = await legalKnowledgeService.getRecentLegalUpdates(
        jurisdiction === 'all' ? undefined : jurisdiction,
        20
      );
      setLegalUpdates(updates);
    } catch (error) {
      console.error('Error loading legal updates:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      socketService.emit('user_message', currentInput);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I could not send your message. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'law': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'regulation': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'case_law': return 'bg-green-100 text-green-700 border-green-200';
      case 'directive': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'guideline': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-700 border-green-200';
      case 'amended': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'repealed': return 'bg-red-100 text-red-700 border-red-200';
      case 'clarified': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 mb-6">
        <Scale size={32} className="text-tesa-blue" />
        <div>
          <h1 className={`text-3xl font-bold ${c.text.primary}`}>Legal Knowledge Base</h1>
          <p className={`text-sm ${c.text.secondary} mt-1`}>Multi-jurisdictional legal sources and updates</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={16} />
            Legal AI Chat
          </div>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          <div className="flex items-center gap-2">
            <Search size={16} />
            Legal Sources
          </div>
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'updates'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            Recent Updates
          </div>
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'info'
              ? 'bg-tesa-blue text-white'
              : `${c.bg.tertiary} ${c.text.secondary} hover:bg-opacity-80`
          }`}
        >
          <div className="flex items-center gap-2">
            <Book size={16} />
            Information
          </div>
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className={`${c.card.bg} border ${c.card.border} rounded-lg flex flex-col h-[calc(100vh-16rem)]`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-tesa-blue to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Legal AI Assistant</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-tesa-blue text-white rounded-br-sm'
                      : isDark
                      ? 'bg-slate-800 text-white rounded-bl-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDark
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                } border focus:outline-none focus:ring-2 focus:ring-tesa-blue`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className={`text-xs ${c.text.muted}`}>
                Average response time: 2 minutes
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-4`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search legal sources by keyword, reference number, or title..."
                  className={`w-full px-4 py-2 border rounded-lg ${c.input.bg} ${c.input.border} ${c.input.text} ${c.input.placeholder}`}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all font-medium flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className={c.text.secondary} />
                <span className={`text-sm font-medium ${c.text.primary}`}>Filters:</span>
              </div>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className={`px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
              >
                <option value="all">All Jurisdictions</option>
                <option value="DACH">DACH</option>
                <option value="EU">EU</option>
                <option value="US">US</option>
                <option value="GLOBAL">Global</option>
              </select>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className={`px-3 py-1.5 text-sm border rounded ${c.input.bg} ${c.input.border} ${c.input.text}`}
              >
                <option value="all">All Types</option>
                <option value="law">Laws</option>
                <option value="regulation">Regulations</option>
                <option value="case_law">Case Law</option>
                <option value="directive">Directives</option>
                <option value="guideline">Guidelines</option>
              </select>
            </div>
          </div>

          <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-6`}>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
                <p className={`mt-2 text-sm ${c.text.secondary}`}>Searching legal sources...</p>
              </div>
            ) : legalSources.length === 0 ? (
              <div className="text-center py-12">
                <Book size={48} className={`mx-auto mb-4 ${c.text.muted}`} />
                <p className={`text-lg font-medium ${c.text.primary}`}>No results found</p>
                <p className={`text-sm ${c.text.secondary} mt-1`}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-sm ${c.text.secondary} mb-4`}>
                  Found {legalSources.length} legal sources
                </div>
                {legalSources.map((source) => (
                  <div
                    key={source.id}
                    className={`border ${c.border.primary} rounded-lg p-4 ${c.bg.hover} transition-colors cursor-pointer`}
                    onClick={() => setSelectedSource(source)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${c.text.primary}`}>{source.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getSourceTypeColor(source.source_type)}`}>
                            {source.source_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs mb-2">
                          <span className={`${c.text.secondary} font-mono`}>{source.reference_number}</span>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className={c.text.muted} />
                            <span className={c.text.secondary}>{source.jurisdiction}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className={c.text.muted} />
                            <span className={c.text.secondary}>Valid from {new Date(source.valid_from).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {source.summary && (
                          <p className={`text-sm ${c.text.secondary} line-clamp-2`}>{source.summary}</p>
                        )}
                      </div>
                      {source.source_url && (
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 text-tesa-blue hover:bg-blue-50 rounded transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'updates' && (
        <div className={`${c.card.bg} border ${c.card.border} rounded-lg p-6`}>
          <div className="mb-6">
            <h2 className={`text-xl font-bold ${c.text.primary} mb-2`}>Recent Legal Updates</h2>
            <p className={`text-sm ${c.text.secondary}`}>
              Stay informed about changes to laws, regulations, and legal requirements
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-tesa-blue"></div>
              <p className={`mt-2 text-sm ${c.text.secondary}`}>Loading updates...</p>
            </div>
          ) : legalUpdates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className={`mx-auto mb-4 ${c.text.muted}`} />
              <p className={`text-lg font-medium ${c.text.primary}`}>No recent updates</p>
              <p className={`text-sm ${c.text.secondary} mt-1`}>All legal sources are up to date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {legalUpdates.map((update: any) => (
                <div
                  key={update.id}
                  className={`border ${c.border.primary} rounded-lg p-4`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getChangeTypeColor(update.change_type)}`}>
                          {update.change_type}
                        </span>
                        <span className={`text-xs ${c.text.muted}`}>
                          {new Date(update.detected_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${c.text.primary} mb-1`}>
                        {update.legal_sources?.title || 'Legal Source Update'}
                      </p>
                      <p className={`text-sm ${c.text.secondary}`}>{update.change_summary}</p>
                    </div>
                  </div>
                  {update.status === 'validated' && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Validated
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className={`${c.card.bg} rounded-lg border ${c.card.border} p-8`}>
          <div className="prose prose-slate max-w-none">
            <h2 className={c.text.primary}>Terms of Service</h2>
            <p className={c.text.secondary}>
              LegalAI is an internal legal copilot system for enterprise use. Access is restricted to
              authorized users within the organization.
            </p>

            <h2 className={`mt-8 ${c.text.primary}`}>Privacy Policy</h2>
            <p className={c.text.secondary}>
              All data is encrypted in transit and at rest. Access is governed by RBAC/ABAC policies.
              Audit logs are maintained for 180 days.
            </p>

            <h2 className={`mt-8 ${c.text.primary}`}>Data Retention</h2>
            <p className={c.text.secondary}>
              Conversation transcripts: 180 days<br />
              Audit logs: 7 years<br />
              Contract data: Indefinite (synchronized with CLM system)
            </p>

            <h2 className={`mt-8 ${c.text.primary}`}>Compliance</h2>
            <p className={c.text.secondary}>
              LegalAI complies with GDPR, maintains data sovereignty within EU region, and implements
              comprehensive security controls.
            </p>

            <h2 className={`mt-8 ${c.text.primary}`}>Multi-Jurisdictional Coverage</h2>
            <p className={c.text.secondary}>
              Our legal knowledge base covers multiple jurisdictions including DACH (Germany, Austria, Switzerland),
              EU, US, and international regulations. Legal sources are continuously monitored and updated to ensure
              accuracy and compliance.
            </p>
          </div>
        </div>
      )}

      {selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className={`${c.card.bg} rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border ${c.card.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className={`text-2xl font-bold ${c.text.primary}`}>{selectedSource.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getSourceTypeColor(selectedSource.source_type)}`}>
                    {selectedSource.source_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`${c.text.secondary} font-mono`}>{selectedSource.reference_number}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className={c.text.muted} />
                    <span className={c.text.secondary}>{selectedSource.jurisdiction}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className={c.text.muted} />
                    <span className={c.text.secondary}>Valid from {new Date(selectedSource.valid_from).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className={`ml-4 px-4 py-2 ${c.bg.tertiary} rounded-lg hover:bg-opacity-80 transition-colors font-medium`}
              >
                Close
              </button>
            </div>

            <div className={`mt-6 p-4 ${c.bg.tertiary} rounded-lg`}>
              <h3 className={`font-semibold ${c.text.primary} mb-2`}>Summary</h3>
              <p className={`text-sm ${c.text.secondary}`}>{selectedSource.summary || 'No summary available'}</p>
            </div>

            <div className={`mt-6 p-4 border ${c.border.primary} rounded-lg`}>
              <h3 className={`font-semibold ${c.text.primary} mb-2`}>Full Text</h3>
              <div className={`text-sm ${c.text.secondary} whitespace-pre-wrap max-h-96 overflow-y-auto`}>
                {selectedSource.content}
              </div>
            </div>

            {selectedSource.source_url && (
              <div className="mt-6">
                <a
                  href={selectedSource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all font-medium"
                >
                  <ExternalLink size={16} />
                  View Official Source
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
