import { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useColors } from '../lib/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export function LiveChatWidget() {
  const { isDark } = useTheme();
  const c = useColors(isDark);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const hasClosedChat = localStorage.getItem('chatWidgetClosed');
    if (hasClosedChat === 'true') {
      setIsVisible(true);
      setIsOpen(false);
    }

    const handleOpenChat = () => {
      setIsVisible(true);
      setIsOpen(true);
      setIsMinimized(false);
      localStorage.setItem('chatWidgetClosed', 'false');
    };

    window.addEventListener('openLiveChat', handleOpenChat);

    return () => {
      window.removeEventListener('openLiveChat', handleOpenChat);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    localStorage.setItem('chatWidgetClosed', 'false');
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleFullClose = () => {
    setIsVisible(false);
    setIsOpen(false);
    localStorage.setItem('chatWidgetClosed', 'true');
  };

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
      // Socket emit will be handled by parent component (Copilot)
      console.log('Message sent:', currentInput);
      
      // Simulate response for now
      setTimeout(() => {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. This chat is now integrated with the Copilot component.',
          sender: 'agent',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMessage]);
        setIsTyping(false);
      }, 1000);
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

  if (!isVisible) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-16 h-16 bg-tesa-blue text-white rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center group z-50 animate-bounce"
          aria-label="Open live chat"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {isOpen && !isMinimized && (
        <div
          className={`fixed bottom-6 right-6 w-96 h-[600px] ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          } border rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-tesa-blue to-blue-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Live Support</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
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
              <button
                onClick={handleFullClose}
                className={`text-xs ${c.text.muted} hover:${c.text.secondary} underline`}
              >
                Don't show again
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-tesa-blue text-white rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center z-50"
          aria-label="Restore chat"
        >
          <MessageCircle size={28} />
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-semibold">
            1
          </span>
        </button>
      )}
    </>
  );
}
