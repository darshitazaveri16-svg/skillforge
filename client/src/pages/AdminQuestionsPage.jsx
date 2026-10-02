import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Briefcase,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

export default function AdminQuestionsPage() {
  const { token: authToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [careerFilter, setCareerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmQ, setDeleteConfirmQ] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form State
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [formSkill, setFormSkill] = useState('');
  const [formCareer, setFormCareer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = authToken || localStorage.getItem('skillforge_token') || localStorage.getItem('token');

  // Load auxiliary data: skills and careers
  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  // Fetch questions whenever filters or page changes
  useEffect(() => {
    fetchQuestions();
  }, [page, difficultyFilter, skillFilter, careerFilter]);

  const fetchAuxiliaryData = async () => {
    try {
      const [skRes, carRes] = await Promise.all([
        fetch(`${API_URL}/admin/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/careers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (skRes.ok) {
        const skJson = await skRes.json();
        setSkills(skJson.data || []);
      }
      if (carRes.ok) {
        const carJson = await carRes.json();
        setCareers(carJson.data || []);
      }
    } catch (err) {
      console.error('Failed to load skills/careers for question filters', err);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);
      if (skillFilter !== 'all') params.append('skill', skillFilter);
      if (careerFilter !== 'all') params.append('career', careerFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_URL}/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch questions.');

      setQuestions(json.data || []);
      setTotalPages(json.pages || 1);
      setTotalCount(json.count || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const openCreateModal = () => {
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormDifficulty('medium');
    setFormSkill(skills[0]?._id || '');
    setFormCareer('');
    setError('');
    setSuccessMsg('');
    setIsCreateOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormText(q.question);
    setFormOptions(q.options && q.options.length === 4 ? [...q.options] : ['', '', '', '']);
    setFormCorrectIndex(typeof q.correctAnswer === 'number' ? q.correctAnswer : 0);
    setFormExplanation(q.explanation || '');
    setFormDifficulty(q.difficulty || 'medium');
    setFormSkill(q.skill?._id || q.skill || '');
    setFormCareer(q.career?._id || q.career || '');
    setError('');
    setSuccessMsg('');
  };

  const handleOptionChange = (idx, val) => {
    const next = [...formOptions];
    next[idx] = val;
    setFormOptions(next);
  };

  const validateForm = () => {
    if (!formText.trim()) {
      setError('Please provide a question prompt.');
      return false;
    }
    if (formOptions.some((opt) => !opt.trim())) {
      setError('All 4 options must be filled in.');
      return false;
    }
    if (formCorrectIndex < 0 || formCorrectIndex > 3) {
      setError('Please select one of the 4 options as the correct answer.');
      return false;
    }
    if (!formExplanation.trim()) {
      setError('Please provide an explanation for the correct answer.');
      return false;
    }
    if (!formSkill) {
      setError('Please select an associated skill.');
      return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        questionText: formText.trim(),
        options: formOptions.map((o) => o.trim()),
        correctAnswer: formCorrectIndex,
        explanation: formExplanation.trim(),
        difficulty: formDifficulty,
        skill: formSkill,
        career: formCareer || null,
      };

      const res = await fetch(`${API_URL}/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create question.');

      setSuccessMsg('Question created successfully!');
      setIsCreateOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        questionText: formText.trim(),
        options: formOptions.map((o) => o.trim()),
        correctAnswer: formCorrectIndex,
        explanation: formExplanation.trim(),
        difficulty: formDifficulty,
        skill: formSkill,
        career: formCareer || null,
      };

      const qId = editingQuestion._id || editingQuestion.id;
      const res = await fetch(`${API_URL}/admin/questions/${qId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update question.');

      setSuccessMsg('Question updated successfully!');
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmQ) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const qId = deleteConfirmQ._id || deleteConfirmQ.id;
      const res = await fetch(`${API_URL}/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete question.');

      setSuccessMsg('Question deleted successfully!');
      setDeleteConfirmQ(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || 'Failed to delete question.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Admin Console
              </span>
              <span className="text-slate-500 text-sm">/</span>
              <span className="text-slate-400 text-sm">Assessment Bank</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-rose-500" />
              Manage Questions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Curate and configure multiple-choice questions for SkillForge career assessments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
            >
              Dashboard
            </Link>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-rose-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-4 rounded-xl flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </form>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">Diff:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer capitalize"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-slate-200">
                    {d === 'all' ? 'All Difficulties' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">Skill:</span>
              <select
                value={skillFilter}
                onChange={(e) => {
                  setSkillFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  All Skills
                </option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id} className="bg-slate-900 text-slate-200">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Career Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">Career:</span>
              <select
                value={careerFilter}
                onChange={(e) => {
                  setCareerFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="all" className="bg-slate-900 text-slate-200">
                  All Careers
                </option>
                {careers.map((c) => (
                  <option key={c._id} value={c._id} className="bg-slate-900 text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearch('');
                setDifficultyFilter('all');
                setSkillFilter('all');
                setCareerFilter('all');
                setPage(1);
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1.5 transition-colors underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No questions found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              No questions matched your search criteria. Try modifying your filters or create a new question.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors"
            >
              Create Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {questions.length} of {totalCount} total questions</span>
              <span>Page {page} of {totalPages}</span>
            </div>

            {questions.map((q, idx) => {
              const skillName = q.skill?.name || 'General';
              const careerName = q.career?.name;
              const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;

              return (
                <div
                  key={q._id || q.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          #{(page - 1) * 10 + idx + 1}
                        </span>
                        <span
                          className={`text-xs uppercase font-semibold px-2 py-0.5 rounded border capitalize ${getDifficultyBadge(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty || 'medium'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          {skillName}
                        </span>
                        {careerName && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                            {careerName}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-medium text-slate-100 mt-2 leading-relaxed">
                        {q.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                        title="Edit Question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmQ(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = optIdx === correctIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-sm flex items-start gap-2.5 transition-colors ${
                            isCorrect
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex-shrink-0">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation preview */}
                  {q.explanation && (
                    <div className="text-xs bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg text-slate-400 flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-300 font-medium mr-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-xs text-slate-400">
                  Page <strong className="text-slate-200">{page}</strong> of{' '}
                  <strong className="text-slate-200">{totalPages}</strong>
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal: Create Question */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute right-5 top-5 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                Add Assessment Question
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Create a 4-option multiple-choice question for technical skills evaluation.
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Prompt <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="e.g. Which React hook is used to perform side effects in functional components?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                {/* 4 Options */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    4 Multiple Choice Options (Select Correct Answer) <span className="text-rose-400">*</span>
                  </label>
                  <div className="space-y-2">
                    {formOptions.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                          formCorrectIndex === i
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionCreate"
                          id={`create_opt_${i}`}
                          checked={formCorrectIndex === i}
                          onChange={() => setFormCorrectIndex(i)}
                          className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-400 w-5">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                          required
                        />
                        {formCorrectIndex === i && (
                          <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata Row: Difficulty, Skill, Career */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Difficulty <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500 capitalize"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Skill <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formSkill}
                      onChange={(e) => setFormSkill(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                      required
                    >
                      {skills.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Career (Optional)
                    </label>
                    <select
                      value={formCareer}
                      onChange={(e) => setFormCareer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="">General / All</option>
                      {careers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Answer Explanation <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Explain why the chosen option is correct..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Question */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
              <button
                onClick={() => setEditingQuestion(null)}
                className="absolute right-5 top-5 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-rose-500" />
                Edit Assessment Question
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Update prompt, options, correct answer, or metadata.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Prompt <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                {/* 4 Options */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    4 Multiple Choice Options (Select Correct Answer) <span className="text-rose-400">*</span>
                  </label>
                  <div className="space-y-2">
                    {formOptions.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                          formCorrectIndex === i
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionEdit"
                          id={`edit_opt_${i}`}
                          checked={formCorrectIndex === i}
                          onChange={() => setFormCorrectIndex(i)}
                          className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-400 w-5">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          className="flex-1 bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                          required
                        />
                        {formCorrectIndex === i && (
                          <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata Row: Difficulty, Skill, Career */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Difficulty <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500 capitalize"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Skill <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formSkill}
                      onChange={(e) => setFormSkill(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                      required
                    >
                      {skills.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Career (Optional)
                    </label>
                    <select
                      value={formCareer}
                      onChange={(e) => setFormCareer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="">General / All</option>
                      {careers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Answer Explanation <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deleteConfirmQ && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Delete Question?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to permanently delete this question? This action cannot be undone.
                </p>
                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono text-left max-h-24 overflow-y-auto">
                  "{deleteConfirmQ.question}"
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmQ(null);
                    setDeleteError('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
