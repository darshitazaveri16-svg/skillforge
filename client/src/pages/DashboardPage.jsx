import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Target,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  RefreshCw,
  Play,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

export default function DashboardPage() {
  const { user, token: authToken } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load student dashboard data');
      }

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred loading the dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authToken]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl"></div>
            <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl"></div>
            <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          </div>
          <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl inline-flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const {
    student,
    career,
    readiness,
    skillSummary,
    strongestSkills = [],
    weakestSkills = [],
    skillScores = [],
    assessmentSummary,
    assessmentHistory = [],
    roadmapProgress,
    prioritySkills = [],
    welcomeMessage,
    hasCareer,
    hasAssessment
  } = dashboardData || {};

  // NO CAREER SELECTED: Redirect to Onboarding
  if (!hasCareer) {
    return <Navigate to="/onboarding" replace />;
  }

  // CAREER SELECTED BUT NO ASSESSMENT COMPLETED: Clean Next-Step State
  if (!hasAssessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
                {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {student?.name}
                </h1>
                <p className="text-sm text-indigo-400 mt-1 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {welcomeMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/careers"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition border border-slate-700 flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-indigo-400" /> Change Career
              </Link>
            </div>
          </div>
        </div>

        {/* Next-Step Hero Banner */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Ready for Next Step
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                You're ready to begin.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-2">
                Target Career: <span className="font-semibold text-white">{career?.name}</span>
              </p>
              <p className="text-slate-400 text-sm max-w-2xl">
                Next Step: Take your skill assessment to discover your strengths and skill gaps.
              </p>
            </div>

            <Link
              to="/assessment"
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Your SkillForge Journey Roadmap
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Complete the following steps to evaluate your skills, calculate your career readiness score, and get your personalized learning roadmap.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className={`p-6 rounded-xl border ${hasCareer ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  1
                </span>
                {hasCareer ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Required
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1">Target Career</h3>
              <p className="text-xs text-slate-400 mb-4">
                {hasCareer ? `Selected: ${career?.name}` : 'Choose the career path you want to prepare for.'}
              </p>
              <Link
                to="/careers"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {hasCareer ? 'Change Career' : 'Choose Career'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className={`p-6 rounded-xl border ${hasAssessment ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                  2
                </span>
                {hasAssessment ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Pending
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1">Skill Assessment</h3>
              <p className="text-xs text-slate-400 mb-4">
                Take an MCQ assessment covering your target career skills.
              </p>
              {hasCareer ? (
                <Link
                  to="/assessment"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Take Assessment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-xs text-slate-500 italic">Select career first</span>
              )}
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl border bg-slate-950 border-slate-800 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-sm">
                  3
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">Skill Gap & Readiness</h3>
              <p className="text-xs text-slate-400 mb-4">
                Deterministic backend engine compares your scores against career standards.
              </p>
              <span className="text-xs text-slate-500 italic">Unlocked after assessment</span>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-xl border bg-slate-950 border-slate-800 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-sm">
                  4
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">Personalized Roadmap</h3>
              <p className="text-xs text-slate-400 mb-4">
                Gap-prioritized action items with real learning resources.
              </p>
              <span className="text-xs text-slate-500 italic">Unlocked after assessment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FULL ACTIVE DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. WELCOME HEADER & QUICK ACTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
              {student?.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {student?.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold uppercase tracking-wider">
                  Target: {career?.name}
                </span>
              </div>
              <p className="text-sm text-indigo-400 mt-1 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {welcomeMessage}
              </p>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link
              to="/assessment"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> Take Assessment
            </Link>
            <Link
              to="/readiness"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Readiness Analysis
            </Link>
            <Link
              to="/roadmap"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-violet-400" /> Continue Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Career Readiness Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Career Readiness</span>
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-extrabold text-white">
                {readiness?.score != null ? `${readiness.score}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400">Target Standard Score</span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated against <strong className="text-slate-200">{career?.name}</strong> required skills.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">Stage 5 Gap Engine</span>
            <Link
              to="/readiness"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View Detailed Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Assessment Performance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Assessment Performance</span>
              <BarChart2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <span className="text-2xl font-bold text-emerald-400">
                  {assessmentSummary?.latestScore != null ? `${assessmentSummary.latestScore}%` : 'N/A'}
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Latest MCQ Score</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-indigo-400">
                  {assessmentSummary?.averageScore != null ? `${assessmentSummary.averageScore}%` : 'N/A'}
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Average Score</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Total Completed Attempts: <strong className="text-slate-200">{assessmentSummary?.totalAttempts || 0}</strong>
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">MCQ Test Engine</span>
            <Link
              to="/assessment/history"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Roadmap Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Roadmap Completion</span>
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-white">
                {roadmapProgress?.percentage || 0}%
              </span>
              <span className="text-xs text-slate-400">
                ({roadmapProgress?.completed || 0} / {roadmapProgress?.total || 0} items)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${roadmapProgress?.percentage || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">Stage 6 Roadmap</span>
            <Link
              to="/roadmap"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Continue Learning <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. SKILL OVERVIEW & STRONGEST / WEAKEST SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classification Counts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Skill Classification Summary
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-emerald-500/20 p-4 rounded-xl">
              <span className="text-2xl font-bold text-emerald-400">{skillSummary?.strong || 0}</span>
              <p className="text-xs text-slate-400 mt-0.5">Strong Skills</p>
            </div>
            <div className="bg-slate-950 border border-amber-500/20 p-4 rounded-xl">
              <span className="text-2xl font-bold text-amber-400">{skillSummary?.moderate || 0}</span>
              <p className="text-xs text-slate-400 mt-0.5">Moderate Skills</p>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-2xl font-bold text-indigo-400">{skillSummary?.needsImprovement || 0}</span>
              <p className="text-xs text-slate-400 mt-0.5">Needs Focus</p>
            </div>
            <div className="bg-slate-950 border border-rose-500/20 p-4 rounded-xl">
              <span className="text-2xl font-bold text-rose-400">{skillSummary?.critical || 0}</span>
              <p className="text-xs text-slate-400 mt-0.5">Critical Gaps</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-right">
            <Link to="/readiness" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View Full Classification Breakdown →
            </Link>
          </div>
        </div>

        {/* Strongest Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Strongest Skills
            </h2>
            {strongestSkills.length > 0 ? (
              <div className="space-y-3">
                {strongestSkills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-sm font-semibold text-slate-200">{s.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {s.classification}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No skill data available yet.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-right">
            <Link to="/readiness" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View Skill Matrix →
            </Link>
          </div>
        </div>

        {/* Weakest Skills / High Gaps */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Highest Skill Gaps
            </h2>
            {weakestSkills.length > 0 ? (
              <div className="space-y-3">
                {weakestSkills.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-sm font-semibold text-slate-200">{w.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                        Gap: {w.gap}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-400 font-medium py-4">
                Awesome! You have zero major skill gaps in your target career.
              </p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-right">
            <Link to="/roadmap" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              Address Gaps in Roadmap →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. VISUAL RECHARTS ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Skill Scores vs Required Standards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" /> Skill Performance vs Target Level
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Comparing your current score against required standard levels for {career?.name}.
          </p>

          {skillScores.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillScores} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="skill" stroke="#64748b" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="studentScore" name="Your Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="requiredLevel" name="Required Level" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-12 text-center">No skill scores available.</p>
          )}
        </div>

        {/* Chart 2: Assessment Progress Over Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Assessment Score Progress Over Time
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Chronological trend of MCQ test scores across attempts.
          </p>

          {assessmentHistory.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={assessmentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="dateLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-12 text-center">No assessment history available.</p>
          )}
        </div>
      </div>

      {/* 5. PRIORITY SKILLS & ACTION RECOMMENDATIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" /> Priority Skill Recommendations
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Derived from your highest Stage 5 skill gaps and Stage 6 learning priorities.
            </p>
          </div>
          <Link
            to="/roadmap"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition flex items-center gap-1.5"
          >
            Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {prioritySkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prioritySkills.map((ps, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Priority {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Gap: {ps.gap}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{ps.skill}</h3>
                  <p className="text-xs text-slate-400 mb-3">{ps.category}</p>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Your Level:</span>
                      <span className="font-semibold">{ps.studentScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required:</span>
                      <span className="font-semibold">{ps.requiredLevel}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <Link
                    to="/roadmap"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Start Learning Item <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white text-sm">All Primary Skills Met!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your scores meet or exceed all required standards for {career?.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
