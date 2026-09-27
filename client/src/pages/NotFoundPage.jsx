import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function NotFoundPage() {
  const { user } = useAuth();

  const homeTarget = user
    ? user.role === 'admin'
      ? '/admin'
      : '/dashboard'
    : '/';

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-16 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Compass className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-white font-mono">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={homeTarget}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            {user?.role === 'admin' ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </>
            ) : (
              <>
                <Home className="w-4 h-4" />
                Back to Dashboard
              </>
            )}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
