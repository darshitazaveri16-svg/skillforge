import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  Briefcase,
  AlertTriangle,
  History,
  FileCheck,
  Check,
  Info,
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const { user, token: authToken } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');

  // Load latest analysis & history on mount
  useEffect(() => {
    fetchInitialData();
  }, [authToken]);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    setError('');
    try {
      if (!token) return;

      // 1. Fetch Latest Analysis
      const latestRes = await fetch(`${API_URL}/resume/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (latestRes.ok) {
        const latestData = await latestRes.json();
        if (latestData.hasAnalysis && latestData.data) {
          setAnalysis(latestData.data);
        }
      }

      // 2. Fetch History
      const histRes = await fetch(`${API_URL}/resume/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.data) {
          setHistory(histData.data);
        }
      }
    } catch (err) {
      console.error('Error fetching resume analysis data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setError('');

    // Client-side file format validation
    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      setError('Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    // Client-side file size validation (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size exceeds the 5 MB limit. Please select a smaller resume file.');
      return;
    }

    // Proceed to upload & analyze
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch(`${API_URL}/resume/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to analyze resume. Please try again.');
      }

      if (data.data) {
        setAnalysis(data.data);
        // Refresh history
        setHistory((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      console.error('Upload & analysis error:', err);
      setError(err.message || 'Failed to analyze resume document.');
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const targetCareerName = user?.targetCareer || 'Full Stack Developer';

  if (loadingInitial) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl w-1/3 mx-auto"></div>
          <div className="h-4 bg-slate-900 border border-slate-800 rounded-lg w-1/2 mx-auto"></div>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <FileText className="w-3.5 h-3.5" /> Stage 8 Feature
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Resume Analyzer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Upload your resume and compare it with your target career (
              <span className="text-indigo-300 font-semibold">{targetCareerName}</span>
              ) to discover matched skills, missing competencies, and tailored improvement suggestions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <History className="w-4 h-4 text-indigo-400" />
                {showHistory ? 'Hide History' : `Previous Analyses (${history.length})`}
              </button>
            )}
            <Link
              to="/careers"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <Briefcase className="w-4 h-4 text-violet-400" />
              Change Career
            </Link>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload Resume Document
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Career: <strong className="text-white">{targetCareerName}</strong>
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            PDF, DOCX • Max 5 MB
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-950/20 scale-[1.01]'
              : 'border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onFileChange}
            className="hidden"
          />

          {analyzing ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
              <div>
                <p className="text-base font-semibold text-white">Analyzing Resume...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Extracting text, detecting technical skills, and comparing against {targetCareerName} requirements.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Drop your resume here, or <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF (.pdf), Word (.docx) • Maximum file size: 5 MB
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Select Resume File
              </button>
            </div>
          )}
        </div>

        {/* Validation / Server Error Banner */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Validation Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* History Drawer / Modal view */}
      {showHistory && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Resume Analysis History
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Close History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Target Career</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Matched</th>
                  <th className="px-4 py-3">Missing</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{item.fileName}</td>
                    <td className="px-4 py-3 text-indigo-300">{item.targetCareer}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.matchScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-400">
                      {item.matchedSkills?.length || 0} skills
                    </td>
                    <td className="px-4 py-3 text-amber-400">
                      {item.missingSkills?.length || 0} skills
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setAnalysis(item);
                          setShowHistory(false);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-8 animate-fadeIn">
          {/* Result Overview Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Target Career
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {analysis.targetCareer}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Analyzed File: <strong className="text-slate-200">{analysis.fileName}</strong> •{' '}
                  {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Match Score Display */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center gap-5 w-full lg:w-auto">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 border-2 border-indigo-500/40 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-black text-indigo-400">
                    {analysis.matchScore}%
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    Resume Match Score
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Deterministic match score based on career required skills found in your resume.
                  </p>
                </div>
              </div>
            </div>

            {/* Note clarifying distinction from Career Readiness Score */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Resume Match Score</strong> reflects technical keywords in your uploaded resume.
                It is separate from your official <strong>Career Readiness Score</strong>, which evaluates hands-on MCQ assessment results.
              </span>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs text-slate-400">Matched Skills</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {analysis.matchedSkills?.length || 0}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs text-slate-400">Missing Skills</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {analysis.missingSkills?.length || 0}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs text-slate-400">Total Required</span>
                <p className="text-2xl font-bold text-slate-200 mt-1">
                  {(analysis.matchedSkills?.length || 0) + (analysis.missingSkills?.length || 0)}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs text-slate-400">Detected in Resume</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {analysis.extractedSkills?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Matched Skills ({analysis.matchedSkills?.length || 0})
                  </h3>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                    Found in Resume
                  </span>
                </div>

                {analysis.matchedSkills && analysis.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No target career skills were detected in the resume text.
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-6 pt-3 border-t border-slate-800">
                These skills match the core requirements for {analysis.targetCareer}.
              </p>
            </div>

            {/* Missing Skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Missing Skills ({analysis.missingSkills?.length || 0})
                  </h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                    Career Gap
                  </span>
                </div>

                {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-medium">
                    Outstanding! Your resume covers all required skills for {analysis.targetCareer}.
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-6 pt-3 border-t border-slate-800">
                Add projects, certificates, or keywords for these missing proficiencies to increase your match.
              </p>
            </div>
          </div>

          {/* AI / Improvement Suggestions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {analysis.aiSuggestions?.isAiGenerated
                      ? 'AI-Assisted Resume Feedback'
                      : 'Resume Improvement Suggestions'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Actionable recommendations to enhance your resume for {analysis.targetCareer}
                  </p>
                </div>
              </div>

              {analysis.aiSuggestions?.isAiGenerated ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Powered by AI
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Deterministic Engine
                </span>
              )}
            </div>

            {/* Non-blocking AI Fallback Notice if present */}
            {analysis.aiSuggestions?.aiNotice && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{analysis.aiSuggestions.aiNotice}</span>
              </div>
            )}

            {/* Executive Summary */}
            {analysis.aiSuggestions?.summary && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Executive Assessment
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {analysis.aiSuggestions.summary}
                </p>
              </div>
            )}

            {/* Bullet Improvement Suggestions */}
            {analysis.aiSuggestions?.bulletSuggestions?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommended Bullet Point Enhancements
                </h4>
                <div className="space-y-2">
                  {analysis.aiSuggestions.bulletSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-3"
                    >
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills Advice */}
            {analysis.aiSuggestions?.missingSkillsAdvice?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Addressing Missing Skill Gaps
                </h4>
                <div className="space-y-2">
                  {analysis.aiSuggestions.missingSkillsAdvice.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-3"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career-Specific Recommendations */}
            {analysis.aiSuggestions?.careerRecommendations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Career Strategy Next Steps
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.aiSuggestions.careerRecommendations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
