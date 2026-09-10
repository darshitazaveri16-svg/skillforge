import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Target, 
  Award, 
  BrainCircuit, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function ReadinessPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAssessment, setHasAssessment] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchReadinessAnalysis = async () => {
      try {
        const response = await fetch(`${API_URL}/analysis/readiness`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setData(result);
          setHasAssessment(true);
        } else if (response.status === 404 && result.hasAssessment === false) {
          setHasAssessment(false);
          setData(result);
        } else {
          setError(result.message || 'Failed to load readiness analysis.');
        }
      } catch (err) {
        console.error('Error fetching readiness:', err);
        setError('Network error fetching career readiness analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchReadinessAnalysis();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Computing Skill Gap Engine Analysis...</span>
        </div>
      </div>
    );
  }

  // Handle case where user hasn't completed an assessment yet
  if (!hasAssessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Skill Assessment Required
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            To calculate your Career Readiness Score for <span className="font-semibold text-white">{data?.career?.name || 'your target career'}</span>, you must first complete a skill assessment.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            Take Skill Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-1">Analysis Unavailable</h3>
            <p>{error || 'An unexpected error occurred while loading readiness analysis.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    career,
    readinessScore,
    assessmentScore,
    skillAnalysis,
    summary,
    strongestSkills,
    weakestSkills,
  } = data;

  // Prepare chart data
  const chartData = skillAnalysis.map((item) => ({
    name: item.skill,
    Student: item.studentScore,
    Required: item.requiredLevel,
    Gap: item.gap,
  }));

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Strong':
        return 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
      case 'Moderate':
        return 'bg-blue-950/80 border-blue-800/80 text-blue-300';
      case 'Needs Improvement':
        return 'bg-amber-950/80 border-amber-800/80 text-amber-300';
      case 'Critical Gap':
        return 'bg-rose-950/80 border-rose-800/80 text-rose-300';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Backend Skill Gap Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Career Readiness Analysis
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Target Track: <span className="font-semibold text-indigo-400">{career.name}</span>
          </p>
        </div>

        <Link
          to="/assessment"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 font-semibold text-sm rounded-xl transition-all"
        >
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          Retake Assessment
        </Link>
      </div>

      {/* 2. Hero Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Score Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Career Readiness Score
              </span>
              <Target className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                {readinessScore}%
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {readinessScore >= 80 ? 'Placement Ready' : readinessScore >= 60 ? 'Competitive' : 'Gap Action Needed'}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Readiness Explanation:</span> Your readiness score compares your demonstrated skill levels with the required benchmarks of your target career ({career.name}). It reflects real skill alignment rather than just test score accuracy.
            </p>
          </div>
        </div>

        {/* Assessment Score Comparison Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Assessment Accuracy
              </span>
              <Award className="w-5 h-5 text-violet-400" />
            </div>

            <div className="text-4xl font-extrabold text-violet-300 mb-2">
              {assessmentScore}%
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Measures how accurately you answered technical questions during your recent assessment session.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Formula Distinction</span>
            <span className="text-indigo-400 font-semibold">Backend Engine Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Summary Tiers Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Strong (0-10 Gap)</span>
          <p className="text-2xl font-extrabold text-white mt-1">{summary.strong}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Moderate (11-25 Gap)</span>
          <p className="text-2xl font-extrabold text-white mt-1">{summary.moderate}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Improvement (26-40)</span>
          <p className="text-2xl font-extrabold text-white mt-1">{summary.needsImprovement}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Critical Gap (41+)</span>
          <p className="text-2xl font-extrabold text-white mt-1">{summary.critical}</p>
        </div>
      </div>

      {/* 4. Recharts Visual Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Skill Level Comparison Chart
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrated Student Score vs. Target Career Benchmark
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Student" fill="#6366f1" radius={[4, 4, 0, 0]} name="Student Score" />
              <Bar dataKey="Required" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Career Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Detailed Skill Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-6">Skill-by-Skill Gap Breakdown</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">Skill Name</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Student Score</th>
                <th className="pb-3 px-3">Required Level</th>
                <th className="pb-3 px-3">Skill Gap</th>
                <th className="pb-3 px-3 text-right">Status Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {skillAnalysis.map((item) => (
                <tr key={item.skill} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-white">{item.skill}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-indigo-400">{item.studentScore}%</td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">{item.requiredLevel}%</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-400">{item.gap}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Strongest vs Weakest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Strongest Competencies
          </div>
          <div className="flex flex-wrap gap-2">
            {strongestSkills.map((sk) => (
              <span key={sk} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Priority Growth Areas
          </div>
          <div className="flex flex-wrap gap-2">
            {weakestSkills.map((sk) => (
              <span key={sk} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
