import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-slate-200">SkillForge</span>
          <span>&mdash; AI-Powered Skill Assessment & Career Readiness Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-xs text-indigo-400/90 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Deterministic Skill Gap Engine Architecture
          </span>
          <span className="text-xs text-slate-500">&copy; {new Date().getFullYear()} SkillForge. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
