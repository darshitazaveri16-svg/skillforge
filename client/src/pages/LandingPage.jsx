import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  BarChart3, 
  Map, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Database, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const initialCareers = [
    {
      title: 'Full Stack Developer',
      icon: Code2,
      description: 'Master React, Node.js, REST APIs, MongoDB, and system architecture.',
      badge: 'High Demand',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Data Analyst',
      icon: Database,
      description: 'Transform raw datasets into actionable insights using SQL, Python & BI tools.',
      badge: 'Popular',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Python Developer',
      icon: Terminal,
      description: 'Build robust backends, automation pipelines, and core algorithmic solutions.',
      badge: 'Core Tech',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Cybersecurity Analyst',
      icon: ShieldAlert,
      description: 'Identify network vulnerabilities, enforce security protocols & mitigate risks.',
      badge: 'Critical Role',
      color: 'from-rose-500 to-red-600',
    },
  ];

  const features = [
    {
      icon: Target,
      title: 'Adaptive Skill Assessments',
      description: 'Dynamic difficulty evaluation tailored to test actual depth of domain skills.',
    },
    {
      icon: BarChart3,
      title: 'Deterministic Skill Gap Engine',
      description: 'Backend mathematical logic classifying gaps into Strong, Moderate, and Critical tiers.',
    },
    {
      icon: Map,
      title: 'Personalized Learning Roadmap',
      description: 'Step-by-step guidance prioritized by your largest skill gaps to maximize placement readiness.',
    },
    {
      icon: Sparkles,
      title: 'AI Resume & Readiness Insights',
      description: 'Comprehensive career readiness score evaluating your profile against market standards.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Placement-Ready Career Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            SkillForge
            <span className="block text-2xl sm:text-4xl mt-3 bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent font-bold">
              AI-Powered Skill Assessment & Career Readiness Platform
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Evaluate your core technical competencies against real industry career standards, compute deterministic skill gaps, and follow a custom action plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* Target Careers Section */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Supported Career Pathways</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Select your target career track to assess your readiness against structured industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialCareers.map((career) => {
              const Icon = career.icon;
              return (
                <div
                  key={career.title}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${career.color} flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {career.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{career.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{career.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-indigo-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-indigo-400" />
                    Structured Requirements
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Engine & Architecture</h2>
            <p className="text-slate-400">
              Built with clean, explainable mathematical logic designed for placement evaluation and real skill growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
