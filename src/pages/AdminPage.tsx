import React, { useState, useEffect } from 'react';
import { fetchAdminAnalytics, saveAdminQuestion } from '../api/client'; // 👈 Added saveAdminQuestion
import { useAuthStore } from '../store/authStore';
import {
  Shield,
  BarChart3,
  TrendingUp,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface SubjectStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const colorPalette = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500',
  'bg-red-500', 'bg-indigo-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500',
];

const SUBJECT_MAPPING: Record<string, string[]> = {
  "Political Law": ["Constitutional Law I", "Constitutional Law II", "Administrative Law", "Law on Public Officers", "Public International Law"],
  "Civil Law": ["Persons and Family Relations", "Property and Land Law", "Wills and Succession", "Obligations and Contracts", "Sales and Lease"],
  "Criminal Law": ["Book I", "Book II", "Special Penal Laws"],
  "Labor Law": ["Labor Standards", "Labor Relations", "Social Legislation"],
  "Taxation Law": ["General Principles", "Income Tax", "Local/Real Property Tax"],
  "Remedial Law": ["Civil Procedure", "Criminal Procedure", "Evidence", "Special Proceedings"],
  "Legal Ethics": ["Code of Professional Responsibility", "Judicial Ethics"],
  "Commercial Law": ["Corporation Law", "Negotiable Instruments", "Insurance", "Transportation Law"]
};

export function AdminPage() {
  const { user } = useAuthStore();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions' | 'students'>('analytics');

  // Analytics State
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [lastActivity, setLastActivity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 📝 Question Form State (Moved to correct scope)
  const [mainSubject, setMainSubject] = useState("");
  const [subSubject, setSubSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [suggestedAnswer, setSuggestedAnswer] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchAdminAnalytics();
      if (res.success && res.data) {
        const data = res.data;
        const total = (data['total_answers_submitted'] as number) || 0;
        setTotalAnswers(total);

        const lastAct = data['last_activity'];
        if (lastAct && typeof lastAct === 'object' && 'seconds' in lastAct) {
          setLastActivity(new Date((lastAct as { seconds: number }).seconds * 1000).toLocaleDateString());
        }

        const subjectEntries = Object.entries(data)
          .filter(([key]) => !['total_answers_submitted', 'last_activity'].includes(key))
          .map(([name, count]) => ({
            name,
            count: count as number,
            percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          }))
          .sort((a, b) => b.count - a.count);

        setStats(subjectEntries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'analytics') loadData();
  }, [activeTab]);

  // 🚀 REAL SAVE FUNCTION
  const handleSaveQuestion = async () => {
    if (!mainSubject || !subSubject || !questionText || !suggestedAnswer) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSavingQuestion(true);
    try {
      const res = await saveAdminQuestion({
        mainSubject,
        subSubject,
        questionText,
        suggestedAnswer
      });

      if (res.success) {
        alert("✅ Question successfully synced to Firestore!");
        // Clear text fields but keep subjects selected for faster entry
        setQuestionText("");
        setSuggestedAnswer("");
      } else {
        alert("❌ Error: " + res.message);
      }
    } catch (err) {
      alert("❌ Failed to connect to server.");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  if (!user?.isAdmin && user?.email !== 'rashemvanrondina@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">This page is restricted to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">LexCasus Admin</h1>
              <p className="text-xs text-slate-500">v3.0 Control Panel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'questions' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Questions
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' ? (
          /* ANALYTICS VIEW */
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-slate-400 text-sm">Synchronizing data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase">Total Answers</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{totalAnswers.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase">Subjects</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.length}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-400 uppercase">Last Sync</span>
                  </div>
                  <p className="text-xl font-bold text-white">{lastActivity || 'N/A'}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                <h2 className="text-lg font-semibold text-white mb-6">Subject Breakdown</h2>
                <div className="space-y-4">
                  {stats.map((stat) => (
                    <div key={stat.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-200">{stat.name}</span>
                        <span className="text-white font-bold">{stat.count} ({stat.percentage}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color}`} style={{ width: `${stat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          /* QUESTIONS VIEW */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" /> Add New Case Question
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                    value={mainSubject}
                    onChange={(e) => {
                        setMainSubject(e.target.value);
                        setSubSubject("");
                    }}
                  >
                    <option value="">Select Main Subject</option>
                    {Object.keys(SUBJECT_MAPPING).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-30"
                    disabled={!mainSubject}
                    value={subSubject}
                    onChange={(e) => setSubSubject(e.target.value)}
                  >
                    <option value="">Select Topic</option>
                    {mainSubject && SUBJECT_MAPPING[mainSubject].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Case Facts</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 h-32 resize-none"
                    placeholder="Enter the facts of the case..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suggested Answer</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 h-32 resize-none"
                    placeholder="Enter the master answer..."
                    value={suggestedAnswer}
                    onChange={(e) => setSuggestedAnswer(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleSaveQuestion}
                  disabled={isSavingQuestion || !subSubject || !questionText || !suggestedAnswer}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSavingQuestion ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    "Sync to Firestore"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}