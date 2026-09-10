import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { History, Award, Calendar, Target, Loader2, ArrowRight, BrainCircuit } from 'lucide-react';

export default function AssessmentHistoryPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/assessment/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setHistory(data.data || []);
        } else {
          setError(data.message || 'Failed to load assessment history.');
        }
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Network error loading assessment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading assessment history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-400" /> Assessment History
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review your past skill assessment attempts and performance scores.</p>
        </div>

        <Link
          to="/assessment"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20"
        >
          <BrainCircuit className="w-4 h-4" /> New Assessment
        </Link>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item) => (
            <div key={item._id || item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-base">{item.careerName}</span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(item.completedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Overall Score</span>
                  <p className="text-2xl font-extrabold text-indigo-400 mt-0.5">{item.overallScore}%</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Accuracy</span>
                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {item.correctCount} / {item.totalQuestions} Correct
                  </p>
                </div>
              </div>

              {item.skillScores?.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Evaluated Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {item.skillScores.map((sk) => (
                      <span key={sk.skillName} className="text-xs font-medium px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {sk.skillName}: <span className="font-bold text-indigo-400">{sk.score}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Past Assessments Found</h2>
          <p className="text-slate-400 text-sm mb-6">You haven't completed any technical skill assessments yet.</p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Take Your First Assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
