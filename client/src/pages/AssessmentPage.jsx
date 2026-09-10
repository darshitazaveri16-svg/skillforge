import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  Award, 
  ChevronRight, 
  RotateCcw, 
  History,
  BrainCircuit
} from 'lucide-react';

export default function AssessmentPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [stage, setStage] = useState('start'); // 'start' | 'question' | 'completed'
  const [assessmentId, setAssessmentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(6);
  
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation }
  const [isFinished, setIsFinished] = useState(false);
  
  const [resultSummary, setResultSummary] = useState(null);
  const [answerReview, setAnswerReview] = useState([]);
  const [error, setError] = useState(null);

  const targetCareer = user?.targetCareer || 'Full Stack Developer';

  const handleStartAssessment = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/assessment/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to start assessment.');
      }

      setAssessmentId(data.assessmentId);
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestionsAvailable || 6);
      setQuestionIndex(1);
      setSelectedOption(null);
      setFeedback(null);
      setStage('question');
    } catch (err) {
      console.error('Error starting assessment:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) return;
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/assessment/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQuestion._id || currentQuestion.id,
          selectedOption,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit answer.');
      }

      setFeedback({
        isCorrect: data.isCorrect,
        explanation: data.explanation,
      });
      setIsFinished(data.isFinished);

      if (data.isFinished) {
        handleCompleteAssessment();
      } else {
        setTimeout(() => {
          setCurrentQuestion(data.nextQuestion);
          setSelectedOption(null);
          setFeedback(null);
          setQuestionIndex((prev) => prev + 1);
          setSubmitting(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleCompleteAssessment = async () => {
    try {
      const response = await fetch(`${API_URL}/assessment/${assessmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete assessment.');
      }

      setResultSummary(data.result);
      setAnswerReview(data.answerReview || []);
      setStage('completed');
    } catch (err) {
      console.error('Error completing assessment:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 1. START SCREEN */}
      {stage === 'start' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Skill Evaluation
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Technical Skill Assessment
          </h1>

          <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Evaluate your technical mastery for your active track:{' '}
            <span className="font-bold text-indigo-400">{targetCareer}</span>. Questions adjust dynamically based on your performance.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-10 text-left">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Format</span>
              <p className="text-sm font-semibold text-white mt-0.5">6 Adaptive MCQs</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Start Level</span>
              <p className="text-sm font-semibold text-indigo-400 mt-0.5">Medium Difficulty</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scoring</span>
              <p className="text-sm font-semibold text-violet-400 mt-0.5">Skill Breakdown</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartAssessment}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Preparing Assessment...
                </>
              ) : (
                <>
                  Start Assessment <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <Link
              to="/assessment/history"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold rounded-xl text-sm transition-all"
            >
              <History className="w-4 h-4" /> Past Attempts
            </Link>
          </div>
        </div>
      )}

      {/* 2. QUESTION SCREEN */}
      {stage === 'question' && currentQuestion && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {questionIndex} of {totalQuestions}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                {currentQuestion.skillName}
              </span>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : currentQuestion.difficulty === 'hard'
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-amber-950/60 border-amber-800 text-amber-300'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-8 border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Prompt */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options List */}
          <div className="space-y-3.5 mb-8">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;

              return (
                <button
                  key={idx}
                  onClick={() => !feedback && setSelectedOption(idx)}
                  disabled={!!feedback}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                feedback.isCorrect
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}
            >
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <span className="font-bold">{feedback.isCorrect ? 'Correct!' : 'Incorrect.'}</span>
                <p className="mt-1 text-slate-300 text-xs leading-relaxed">{feedback.explanation}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          {!feedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || submitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Answer...
                </>
              ) : (
                <>
                  Submit Answer <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 3. COMPLETION SCREEN */}
      {stage === 'completed' && resultSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Assessment Completed!</h1>
            <p className="text-slate-400 text-sm mt-1">
              Skill evaluation for target career: <span className="font-semibold text-white">{resultSummary.careerName}</span>
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Overall Score</span>
              <p className="text-4xl font-extrabold text-indigo-400 mt-2">{resultSummary.overallScore}%</p>
              <span className="text-[11px] text-slate-500">Correct Answers Ratio</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Accuracy</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                {resultSummary.correctCount} / {resultSummary.totalQuestions}
              </p>
              <span className="text-[11px] text-slate-500">Correct vs Attempted</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Skill Count</span>
              <p className="text-2xl font-extrabold text-violet-400 mt-2">{resultSummary.skillScores?.length || 0}</p>
              <span className="text-[11px] text-slate-500">Evaluated Domains</span>
            </div>
          </div>

          {/* Skill-wise Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Skill-wise Performance Breakdown</h2>
            <div className="space-y-4">
              {resultSummary.skillScores?.map((item) => (
                <div key={item.skillName} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-200">{item.skillName}</span>
                    <span className="font-mono font-bold text-indigo-400">{item.score}% ({item.correct}/{item.attempted})</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Review & Explanations */}
          {answerReview.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Question Explanations & Review</h2>
              <div className="space-y-4">
                {answerReview.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Question {idx + 1} ({item.skillName})</span>
                      <span className={`font-bold px-2 py-0.5 rounded ${item.isCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {item.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium">{item.question}</p>
                    <p className="text-slate-400 leading-relaxed border-t border-slate-800 pt-2 mt-2">
                      <span className="font-bold text-slate-300">Explanation:</span> {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setStage('start');
                setResultSummary(null);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retake Assessment
            </button>
            <Link
              to="/assessment/history"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold rounded-xl text-sm transition-all"
            >
              <History className="w-4 h-4" /> View History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
