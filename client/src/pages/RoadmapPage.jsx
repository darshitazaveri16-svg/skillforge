import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Map, 
  Target, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Clock, 
  RotateCcw, 
  BrainCircuit, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Flame,
  Award
} from 'lucide-react';

export default function RoadmapPage() {
  const { token } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [error, setError] = useState(null);
  const [hasAssessment, setHasAssessment] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchRoadmap();
  }, [token]);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(`${API_URL}/roadmap`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRoadmap(result.data);
        setHasAssessment(true);
      } else if (response.status === 404 && result.hasAssessment === false) {
        setHasAssessment(false);
      } else {
        setError(result.message || 'Failed to load roadmap.');
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Network error fetching personalized roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRoadmap(result.data);
      } else {
        throw new Error(result.message || 'Failed to regenerate roadmap.');
      }
    } catch (err) {
      console.error('Error regenerating roadmap:', err);
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleItem = async (item) => {
    const targetId = item.itemId || item._id;
    setUpdatingItemId(targetId);

    try {
      const response = await fetch(`${API_URL}/roadmap/items/${targetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !item.completed,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRoadmap(result.data);
      } else {
        throw new Error(result.message || 'Failed to update item status.');
      }
    } catch (err) {
      console.error('Error toggling item:', err);
      setError(err.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Generating Personalized Learning Roadmap...</span>
        </div>
      </div>
    );
  }

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
            No completed assessment found. Complete an assessment to generate your personalized learning roadmap.
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

  if (error || !roadmap) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-1">Roadmap Error</h3>
            <p>{error || 'An unexpected error occurred while loading your roadmap.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const items = roadmap.items || [];
  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-950/80 border-rose-800 text-rose-300';
      case 'High':
        return 'bg-amber-950/80 border-amber-800 text-amber-300';
      case 'Medium':
        return 'bg-blue-950/80 border-blue-800 text-blue-300';
      default:
        return 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Gap-Prioritized Learning Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Your Personalized Learning Roadmap
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Target Track: <span className="font-semibold text-indigo-400">{roadmap.careerName}</span> &bull; Career Readiness: <span className="font-bold text-white">{roadmap.readinessScore}%</span>
          </p>
        </div>

        <button
          onClick={handleRegenerateRoadmap}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all disabled:opacity-50"
        >
          {regenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Regenerating...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 text-indigo-400" /> Regenerate Roadmap
            </>
          )}
        </button>
      </div>

      {/* 2. Explanation Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 text-xs sm:text-sm flex items-start gap-3">
        <Map className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Dynamic Prioritization:</span> Your roadmap is generated directly from the skill gaps identified in your latest assessment. Steps are ordered by highest priority gaps first to maximize your placement readiness.
        </p>
      </div>

      {/* 3. Progress Metric Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Overall Roadmap Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">{progressPercent}%</span>
              <span className="text-xs text-slate-400 font-medium">
                ({completedCount} of {items.length} completed)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
            <Award className="w-4 h-4 text-indigo-400" />
            {completedCount === items.length ? 'Roadmap Completed!' : `${items.length - completedCount} Priority Items Remaining`}
          </div>
        </div>

        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4. Priority Learning Items List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-amber-400" /> Prioritized Learning Action Plan
        </h2>

        {items.map((item) => {
          const isUpdating = updatingItemId === (item.itemId || item._id);

          return (
            <div
              key={item.itemId || item._id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-lg transition-all ${
                item.completed
                  ? 'border-slate-800/80 bg-slate-900/40 opacity-75'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-grow">
                  {/* Step Order Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                      item.completed
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                        : 'bg-indigo-950 border border-indigo-800 text-indigo-300'
                    }`}
                  >
                    {item.order}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-white">{item.topic}</span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {item.skill}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadgeClass(item.priority)}`}>
                        {item.priority} Priority (Gap: {item.gap})
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Est. {item.estimatedDuration}
                      </span>

                      {item.resourceUrl && (
                        <a
                          href={item.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> {item.resourceTitle}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Completion Toggle */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleToggleItem(item)}
                    disabled={isUpdating}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      item.completed
                        ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : item.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-slate-400" /> Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
