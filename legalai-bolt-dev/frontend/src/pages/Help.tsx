import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

export function Help() {
  const { isDark } = useTheme();

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@legalai.example?subject=LegalAI Support Request';
  };

  const handleChatClick = () => {
    const event = new CustomEvent('openLiveChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-6`}>Help & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/help/documentation"
          className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 hover:shadow-lg transition-all group`}
        >
          <div className="p-3 bg-blue-50 text-tesa-blue rounded-lg w-fit mb-4 group-hover:bg-blue-100 transition-colors">
            <Book size={24} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2 group-hover:text-tesa-blue transition-colors`}>Documentation</h3>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Complete guides and tutorials</p>
            </div>
          </div>
        </Link>

        <button
          onClick={handleChatClick}
          className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 hover:shadow-lg transition-all group text-left w-full`}
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-lg w-fit mb-4 group-hover:bg-green-100 transition-colors">
            <MessageCircle size={24} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2 group-hover:text-green-600 transition-colors flex items-center gap-2`}>
                Live Chat
                <ExternalLink size={16} className="opacity-50" />
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Get instant support</p>
            </div>
          </div>
        </button>

        <button
          onClick={handleEmailClick}
          className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 hover:shadow-lg transition-all group text-left w-full`}
        >
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg w-fit mb-4 group-hover:bg-orange-100 transition-colors">
            <Mail size={24} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2 group-hover:text-orange-600 transition-colors`}>Email Support</h3>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>support@legalai.example</p>
            </div>
          </div>
        </button>

        <Link
          to="/help/faq"
          className={`${isDark ? "bg-slate-800/50 border-slate-700 backdrop-blur-sm" : "bg-white"} rounded-lg border p-6 hover:shadow-lg transition-all group`}
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-fit mb-4 group-hover:bg-purple-100 transition-colors">
            <HelpCircle size={24} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2 group-hover:text-purple-600 transition-colors`}>FAQ</h3>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Common questions answered</p>
            </div>
          </div>
        </Link>
      </div>

      <div className={`mt-8 p-6 ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-blue-50"} rounded-lg border`}>
        <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>Need immediate assistance?</h3>
        <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} mb-4`}>
          Our support team is available Monday to Friday, 9:00 AM - 6:00 PM (CET)
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:+4989123456789"
            className="px-4 py-2 bg-tesa-blue text-white rounded-lg hover:brightness-110 transition-all text-sm font-medium"
          >
            Call: +49 89 123 456 789
          </a>
          <button
            onClick={handleChatClick}
            className={`px-4 py-2 ${isDark ? "bg-slate-700 text-white" : "bg-white text-slate-900"} border ${isDark ? "border-slate-600" : "border-slate-300"} rounded-lg hover:bg-slate-50 transition-all text-sm font-medium`}
          >
            Start Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
