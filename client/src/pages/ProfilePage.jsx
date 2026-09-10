import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Target, Shield, Clock, Award, ArrowRight, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileData(data.user);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading student profile...</span>
        </div>
      </div>
    );
  }

  const activeUser = profileData || user;
  const careerRef = activeUser?.targetCareerRef;
  const careerName = activeUser?.targetCareer || 'Full Stack Developer';
  const requiredSkills = careerRef?.requiredSkills || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Header Profile Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
              {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                {activeUser?.name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold uppercase tracking-wider">
                  {activeUser?.role || 'student'}
                </span>
              </h1>
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-slate-500" />
                {activeUser?.email}
              </p>
            </div>
          </div>

          <Link
            to="/careers"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-sm rounded-xl transition-all"
          >
            <Target className="w-4 h-4" />
            Change Target Career
          </Link>
        </div>

        {/* User Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Target Career Track</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-white">{careerName}</p>
            <p className="text-xs text-slate-500 mt-1">MongoDB Active Track Selection</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Account Status</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-emerald-400">Active Student Account</p>
            <p className="text-xs text-slate-500 mt-1">Authenticated JWT Session</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Since</span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              {activeUser?.createdAt ? new Date(activeUser.createdAt).toLocaleDateString() : 'Recent'}
            </p>
            <p className="text-xs text-slate-500 mt-1">SkillForge Platform ID</p>
          </div>
        </div>

        {/* Required Career Skill Standards */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Required Career Proficiency Standards ({careerName})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Target proficiency levels defined in MongoDB for placement evaluation.
              </p>
            </div>
            <Link
              to="/careers"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Explore Tracks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requiredSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requiredSkills.map((reqItem, idx) => {
                const skName = reqItem.skill?.name || `Skill ${idx + 1}`;
                const skCategory = reqItem.skill?.category || 'Core';
                const targetLvl = reqItem.targetLevel || 80;

                return (
                  <div
                    key={skName}
                    className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-100 text-sm">{skName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {skCategory}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Target Benchmark</span>
                        <span className="font-mono font-bold text-indigo-400">{targetLvl}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                          style={{ width: `${targetLvl}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 text-sm py-6 text-center">
              Please select your target career track to view skill requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
