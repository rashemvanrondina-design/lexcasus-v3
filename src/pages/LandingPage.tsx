import { Link } from 'react-router-dom';
import {
  Scale,
  BookOpen,
  Brain,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Bar Exam Questions',
    desc: 'Practice with real Philippine Bar exam questions across all subjects — Political Law, Civil Law, Criminal Law, and more.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Brain,
    title: 'AI-Powered Answers',
    desc: 'Submit your legal analysis and instantly compare against model answers. Strengthen your legal reasoning skills.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Sparkles,
    title: 'Jurisprudence AI',
    desc: 'Ask about Philippine Supreme Court cases, laws, and jurisprudence. Powered by Gemini with real-time search.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'Firebase authentication, server-side validation, rate limiting, and XSS protection keep your data safe.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium mb-8">
              <Scale className="w-4 h-4" />
              Philippine Bar Exam Study Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Master the
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Philippine Bar Exam
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Practice with real bar questions, get AI-powered legal analysis, and study
              jurisprudence with cutting-edge AI. Built for future lawyers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                Start Studying Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-amber-400">Pass</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A comprehensive study toolkit designed for Philippine law students and bar examinees.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700/80 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              All Bar Exam <span className="text-amber-400">Subjects</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Political Law, Labor Law, Civil Law, Taxation, Mercantile Law, Criminal Law, Remedial Law, and Legal Ethics.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Political Law',
              'Labor Law',
              'Civil Law',
              'Taxation',
              'Mercantile Law',
              'Criminal Law',
              'Remedial Law',
              'Legal Ethics',
            ].map((subject) => (
              <div
                key={subject}
                className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 text-center text-sm font-medium text-slate-300 hover:border-amber-400/30 hover:text-amber-400 transition-all"
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-400/10 to-amber-600/5 border border-amber-400/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Ace the Bar?
            </h2>
            <p className="text-slate-400 mb-8">
              Join Lex Casus and start practicing with AI-powered legal analysis today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/25"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
