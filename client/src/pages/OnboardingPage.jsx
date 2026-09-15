import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Sparkles, 
  Target, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Briefcase,
  Code2,
  Database,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export default function OnboardingPage() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);

  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch(`${API_URL}/careers`);
        const data = await response.json();

        if (response.ok && data.success) {
          setCareers(data.data);
        } else {
          setError(data.message || 'Failed to load career tracks.');
        }
      } catch (err) {
        console.error('Error loading careers:', err);
        setError('Network error connecting to SkillForge servers.');
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

      setSelectedCareer(career.name);
      if (data.user) {
        updateUser(data.user);
      }

      // Smooth redirection to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Error updating career:', err);
      setError(err.message);
      setUpdatingId(null);
    }
  };

  const getCareerIcon = (name) => {
    switch (name) {
      case 'Data Analyst':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Full Stack Developer':
        return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'Python Developer':
        return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'Cybersecurity Analyst':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      default:
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading personalized career tracks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Step 1: Student Career Onboarding
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Let's build your career path
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Choose the career you're preparing for. SkillForge will use this to personalize your assessment, skill-gap analysis, readiness score, and learning roadmap.
        </p>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {selectedCareer && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-sm flex items-center gap-3 animate-fade-in shadow-lg shadow-emerald-950/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Career Selected: {selectedCareer}!</span> Setting up your personalized dashboard...
          </div>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        </div>
      )}

      {/* Career Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careers.map((career) => {
          const careerId = career._id || career.id;
          const isSelected = selectedCareer === career.name || user?.targetCareer === career.name;
          const isUpdating = updatingId === careerId;

          return (
            <div
              key={careerId || career.name}
              className={`bg-slate-900 border rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 shadow-xl shadow-indigo-600/10 bg-slate-900/95 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                      {getCareerIcon(career.name)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{career.name}</h2>
                      <span className="text-xs text-indigo-400 font-medium">
                        {career.requiredSkills?.length || 0} Core Skills
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  {career.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    Required Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {career.requiredSkills?.map((reqSkill) => {
                      const skillObj = reqSkill.skill || {};
                      const skillName = skillObj.name || reqSkill.name || 'Skill';
                      return (
                        <span
                          key={skillName}
                          className="bg-slate-950 border border-slate-800/90 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300"
                        >
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleSelectCareer(career)}
                  disabled={isUpdating || Boolean(selectedCareer)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'
                      : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500'
                  } disabled:opacity-50`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Track...
                    </>
                  ) : isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      Continue with {career.name}
                    </>
                  ) : (
                    <>
                      Choose {career.name}
                      <ArrowRight className="w-4 h-4" />
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
