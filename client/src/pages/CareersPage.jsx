import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Check, ArrowRight, Loader2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function CareersPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { user, token, setError: setAuthError } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch(`${API_URL}/careers`);
        const data = await response.json();

        if (response.ok && data.success) {
          setCareers(data.data);
        } else {
          setError(data.message || 'Failed to load careers from server.');
        }
      } catch (err) {
        console.error('Error loading careers:', err);
        setError('Network error loading careers. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [API_URL]);

  const handleSelectCareer = async (career) => {
    const careerId = career._id || career.id;
    setUpdatingId(careerId);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/profile/career`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ careerId, careerName: career.name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update target career.');
      }

      setSuccessMessage(`Target career updated to ${career.name}!`);
      // Update local storage and trigger profile sync
      window.location.reload();
    } catch (err) {
      console.error('Error updating career:', err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading career pathways...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Placement Skill Assessment
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Select Your Target Career
        </h1>
        <p className="text-slate-400 text-base">
          Choose a career pathway to align your skill assessment, calculate readiness gaps, and build your personalized learning roadmap.
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-sm flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {careers.map((career) => {
          const isCurrent = user?.targetCareer === career.name;

          return (
            <div
              key={career._id || career.name}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 bg-slate-900/90 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{career.name}</h2>
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      <Check className="w-3.5 h-3.5" /> Active Target
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{career.description}</p>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Required Core Technical Skills ({career.requiredSkills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {career.requiredSkills?.map((reqSkill) => {
                      const skillObj = reqSkill.skill || {};
                      const skillName = skillObj.name || reqSkill.name || 'Skill';
                      const targetLvl = reqSkill.targetLevel || 80;

                      return (
                        <div
                          key={skillName}
                          className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-300"
                        >
                          <span>{skillName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                            Level {targetLvl}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleSelectCareer(career)}
                  disabled={updatingId === (career._id || career.id) || isCurrent}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 hover:scale-[1.01]'
                  }`}
                >
                  {updatingId === (career._id || career.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Target...
                    </>
                  ) : isCurrent ? (
                    'Selected Track'
                  ) : (
                    <>
                      Set as Target Career <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
