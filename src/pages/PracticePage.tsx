// pages/PracticePage.tsx
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchQuestions, gradeAnswer } from '../api/client'; // 👈 Swapped checkAnswer for gradeAnswer!
import { formatLegalText } from '../utils/security'; // 👈 Swapped sanitizeHtml for formatLegalText!
import type { BarQuestion } from '../types';
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Award, // 🆕 Icon for the score
  MessageSquareWarning // 🆕 Icon for the critique
} from 'lucide-react';

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = searchParams.get('subject') || '';

  const [questions, setQuestions] = useState<BarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  
  // 🆕 Expanded State for the Auto-Grader
  const [modelAnswer, setModelAnswer] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [critique, setCritique] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const loadQuestions = useCallback(async () => {
    if (!subject) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchQuestions(subject);
      if (res.success && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        setError('No questions available for this subject yet. Check back soon!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions.');
    }
    setIsLoading(false);
  }, [subject]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = currentQuestion ? answeredQuestions.has(currentQuestion.id) : false;
  const isLastQuestion = currentIndex >= questions.length - 1;

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || isAnswered) return;

    const words = answer.trim().split(/\s+/);
    if (answer.trim().length < 50 || words.length < 10) {
      setError('Your answer must be at least 50 characters and 10 words. Show your legal reasoning!');
      return;
    }

    setIsGrading(true);
    setError('');
    try {
      // 🆕 Calling the new AI Auto-Grader!
      const res = await gradeAnswer(currentQuestion.id, answer);
      if (res.success) {
        setModelAnswer(res.suggestedAnswer);
        setScore(res.score);
        setCritique(res.critique);
        setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]));
      } else {
        setError('Failed to grade answer. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
    setIsGrading(false);
  };

  const handleNext = () => {
    if (isLastQuestion) return;
    setModelAnswer('');
    setScore(null); // 🆕 Reset score
    setCritique(''); // 🆕 Reset critique
    setAnswer('');
    setError('');
    setCurrentIndex((i) => i + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setModelAnswer('');
    setScore(null);
    setCritique('');
    setAnswer('');
    setError('');
    setAnsweredQuestions(new Set());
  };

  // 🆕 Helper to color-code the score badge
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s >= 75) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Subject Selected</h2>
          <p className="text-slate-400 mb-6">Go back to the dashboard and pick a subject to practice.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">{subject}</h1>
              <p className="text-xs text-slate-500">
                Question {currentIndex + 1} of {questions.length}
                {answeredQuestions.size > 0 && ` · ${answeredQuestions.size} answered`}
              </p>
            </div>
          </div>
          {answeredQuestions.size > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Restart
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading questions from the vault...</p>
          </div>
        ) : error && !currentQuestion ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            <p className="text-slate-400 text-sm text-center max-w-md">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-medium">
                  Q{currentIndex + 1}
                </span>
                {isAnswered && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Graded
                  </span>
                )}
              </div>
              <div
                className="text-white text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatLegalText(currentQuestion.question) }} // 👈 Formatting fixed!
              />
            </div>

            {/* Answer Area */}
            {!isAnswered ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Your Legal Analysis
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError('');
                  }}
                  disabled={isGrading}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm resize-none disabled:opacity-50"
                  placeholder="Provide your legal analysis and reasoning here. Support your answer with applicable laws, jurisprudence, and legal principles..."
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    {answer.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                  {error && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isGrading || answer.trim().length < 50}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Grading...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Submit for Grading
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 🆕 AI Grade Report */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Score Card */}
                  <div className={`col-span-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreColor(score || 0)}`}>
                    <span className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">AI Bar Score</span>
                    <div className="text-5xl font-black mb-1">{score}<span className="text-2xl opacity-50">/100</span></div>
                  </div>
                  
                  {/* Critique Card */}
                  <div className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/60">
                     <div className="flex items-center gap-2 mb-3">
                      <MessageSquareWarning className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-amber-400">Examiner's Critique</h3>
                    </div>
                    <div
                      className="text-sm text-slate-300 leading-relaxed prose-sm"
                      dangerouslySetInnerHTML={{ __html: formatLegalText(critique) }}
                    />
                  </div>
                </div>

                {/* Your Answer (Read Only) */}
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/40">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Your Answer</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{answer}</p>
                </div>

                {/* Suggested Model Answer */}
                {modelAnswer && (
                  <div className="p-6 rounded-2xl bg-emerald-400/5 border border-emerald-400/20 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-emerald-400">Suggested ALAC Answer</h3>
                    </div>
                    <div
                      className="text-sm text-slate-300 leading-relaxed prose-sm"
                      dangerouslySetInnerHTML={{ __html: formatLegalText(modelAnswer) }} // 👈 Formatting fixed!
                    />
                  </div>
                )}

                {/* Next Button */}
                {!isLastQuestion && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20"
                    >
                      Next Question
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                )}

                {isLastQuestion && (
                  <div className="p-6 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-center mt-6">
                    <p className="text-base font-semibold text-white mb-2">Session Complete! 🎉</p>
                    <p className="text-sm text-slate-400 mb-4">
                      You answered {answeredQuestions.size} question{answeredQuestions.size !== 1 ? 's' : ''} in {subject}.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleReset}
                        className="px-5 py-2 rounded-xl text-sm font-medium border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                      >
                        Practice Again
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2 rounded-xl text-sm font-medium bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {questions.length > 0 && (
              <div className="pt-4">
                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}