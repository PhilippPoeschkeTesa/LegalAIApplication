import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <AlertCircle size={64} className="mx-auto mb-4 text-slate-300" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-lg text-slate-600 mb-6">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tesa-blue text-white rounded-lg hover:bg-tesa-blue hover:brightness-110 transition-colors"
        >
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
