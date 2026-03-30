import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, gradeAnswer } from '../api/client';
import { 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Send
} from 'lucide-react';

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

export function PracticePage() {
  const navigate = useNavigate();
  
  // State Management
  const [step, setStep] = useState<'subject' | 'topic' | 'quiz'>('subject');
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 🌍 1. Load Questions based on SPECIFIC Topic
  const startPractice = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setStep('quiz');
    
    try {
      const res = await fetchQuestions(topic); // Backend now filters by 'topic'
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ⚖️ 2. Handle ALAC Grading
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsGrading(true);
    try {
      const res = await gradeAnswer(questions[currentIndex].id, answer);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      alert("Grading failed. Try again.");
    } finally {
      setIsGrading(false);
    }
  };

  // --- UI RENDERERS ---

  if (step === 'subject') {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Select Subject</h1>
          <p className="text-slate-400 mb-8 text-sm">Choose a core Bar subject to begin.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(SUBJECT_MAPPING).map((sub) => (
              <button
                key={sub}
                onClick={() => { setSelectedMain(sub); setStep('topic'); }}
                className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-emerald-500 transition-all group"
              >
                <span className="text-white font-semibold">{sub}</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'topic') {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setStep('subject')} className="text-slate-500 hover:text-white flex items-center gap-2 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Subjects
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">{selectedMain}</h1>
          <p className="text-slate-400 mb-8 text-sm">Select a specific topic to narrow your focus.</p>
          
          <div className="grid gap-3">
            {SUBJECT_MAPPING[selectedMain].map((topic) => (
              <button
                key={topic}
                onClick={() => startPractice(topic)}
                className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl text-left hover:bg-emerald-600/10 hover:border-emerald-500 transition-all text-slate-200 font-medium"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep('topic')} className="text-slate-500 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Exit Practice
          </button>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{selectedTopic}</span>
            <p className="text-slate-400 text-xs">Question {currentIndex + 1} of {questions.length || 0}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm italic">Retrieving jurisprudence...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl text-center">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg">No Questions Found</h2>
            <p className="text-slate-500 text-sm mt-2">There are currently no questions for "{selectedTopic}".</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question Card */}
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800/60 shadow-2xl">
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase mb-4 tracking-tighter">Bar Fact Pattern</span>
              <p className="text-slate-200 leading-relaxed text-lg">{questions[currentIndex]?.text}</p>
            </div>

            {/* Answer Box */}
            <div className="space-y-4">
               <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Your ALAC Analysis</label>
               <textarea
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 disabled={!!result || isGrading}
                 className="w-full h-64 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                 placeholder="State the Issue, the Law, your Analysis, and the Conclusion..."
               />
               
               {!result ? (
                 <button
                   onClick={handleSubmit}
                   disabled={!answer.trim() || isGrading}
                   className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
                 >
                   {isGrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit for ALAC Grading</>}
                 </button>
               ) : (
                 <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold text-white flex items-center gap-2">
                         <CheckCircle2 className="w-6 h-6 text-emerald-500" /> AI Evaluation
                       </h3>
                       <div className="px-4 py-2 bg-emerald-500 rounded-xl text-slate-950 font-black text-xl">
                          {result.score}/100
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div>
                         <h4 className="text-xs font-bold text-emerald-500 uppercase mb-1">Critique</h4>
                         <p className="text-slate-300 text-sm leading-relaxed">{result.critique}</p>
                       </div>
                       <div>
                         <h4 className="text-xs font-bold text-amber-500 uppercase mb-1">Master Answer</h4>
                         <p className="text-slate-300 text-sm italic leading-relaxed">{result.suggestedAnswer}</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        setResult(null);
                        setAnswer("");
                        if (currentIndex < questions.length - 1) {
                          setCurrentIndex(prev => prev + 1);
                        } else {
                          setStep('topic'); // Go back if finished
                        }
                      }}
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                    >
                      {currentIndex < questions.length - 1 ? "Next Question" : "Finish Practice"}
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}