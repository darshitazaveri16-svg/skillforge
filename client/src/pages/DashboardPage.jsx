import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Target, Shield, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Welcome, {user.name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold uppercase tracking-wider">
                  {user.role}
                </span>
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-slate-500" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
            <Target className="w-5 h-5 text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Track</span>
              <span className="text-sm font-semibold text-slate-200">{user.targetCareer}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Account Status</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-emerald-400">Authenticated & Secure</p>
            <p className="text-xs text-slate-500 mt-1">JWT Bearer authorization active</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">User ID</span>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-sm font-mono text-slate-300 truncate">{user._id || user.id}</p>
            <p className="text-xs text-slate-500 mt-1">MongoDB Document Reference</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Member Since</span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Stage 2 Active Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}
