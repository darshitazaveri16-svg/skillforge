import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Briefcase,
  Layers,
  HelpCircle,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Award,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboardPage() {
  const { token: authToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load admin dashboard analytics.');
      }

      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        </div>
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Dashboard Error</h2>
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
    totalStudents = 0,
    totalCareers = 0,
    totalSkills = 0,
    totalQuestions = 0,
    totalAssessments = 0,
    completedAssessments = 0,
    totalResumeAnalyses = 0,
    averageAssessmentScore = 0,
    averageResumeMatchScore = 0,
    careerDistribution = [],
    recentStudents = [],
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Stage 9 • Administration Console
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Platform Analytics & Administration
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Monitor student engagement, track assessment completion, manage technical question banks, and maintain career tracks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/careers"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Careers
            </Link>
            <Link
              to="/admin/skills"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Skills
            </Link>
            <Link
              to="/admin/questions"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Questions
            </Link>
            <Link
              to="/admin/students"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5" />
              View Students
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Core System Entities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Total Students
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalStudents}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active platform learners</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Career Tracks
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalCareers}</p>
            <p className="text-[11px] text-slate-500 mt-1">Configured career specifications</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Skills Library
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalSkills}</p>
            <p className="text-[11px] text-slate-500 mt-1">Indexed competencies</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Question Pool
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalQuestions}</p>
            <p className="text-[11px] text-slate-500 mt-1">Adaptive technical questions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Assessment & Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Total Tests
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalAssessments}</p>
            <p className="text-[11px] text-slate-500 mt-1">Initiated MCQ attempts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Completed Tests
            </span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">
              {completedAssessments}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Fully evaluated attempts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Resume Analyses
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">{totalResumeAnalyses}</p>
            <p className="text-[11px] text-slate-500 mt-1">Stage 8 uploaded resumes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Avg Assessment Score
            </span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-1">
              {averageAssessmentScore}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Avg Resume Match: {averageResumeMatchScore}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 3: Charts & Career Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Students by Target Career
              </h2>
              <p className="text-xs text-slate-400">Distribution of chosen career tracks</p>
            </div>
            <span className="text-xs text-slate-500">Live MongoDB Aggregation</span>
          </div>

          {careerDistribution.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={careerDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="career" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500 italic">
              No student career choices recorded yet.
            </div>
          )}
        </div>

        {/* Quick Management Links / Shortcuts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Platform Modules</h2>
              <span className="text-xs text-indigo-400 font-semibold">Admin Shortcuts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/admin/careers"
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-sm">Career Library</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage career titles, descriptions, and required skill mappings.
                </p>
              </Link>

              <Link
                to="/admin/skills"
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-sm">Skills Catalog</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Create, categorize, and organize competencies across disciplines.
                </p>
              </Link>

              <Link
                to="/admin/questions"
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-sm">Question Bank</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Curate adaptive MCQ questions with options, answers, and explanations.
                </p>
              </Link>

              <Link
                to="/admin/students"
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-white text-sm">Student Directory</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Filter, search, and view registered students and their career tracks.
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>SkillForge Production v1.0.0</span>
            <Link to="/dashboard" className="text-indigo-400 hover:underline">
              Switch to Student View →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Recent Student Registrations
            </h2>
            <p className="text-xs text-slate-400">Latest students onboarded onto SkillForge</p>
          </div>
          <Link
            to="/admin/students"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            View All Students <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Target Career</th>
                <th className="px-4 py-3 text-right">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentStudents.length > 0 ? (
                recentStudents.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3 text-slate-300">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {s.targetCareer || 'Not Selected'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
