import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  BookOpen,
  Scale,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Landmark,
  Briefcase,
  FileText,
  Receipt,
  Banknote,
  Gavel,
  GavelIcon,
  ScrollText,
  Handshake,
} from 'lucide-react';
import type { Subject } from '../types';

const subjects: Subject[] = [
  {
    key: 'Political Law',
    label: 'Political Law',
    description: 'Constitution, Administrative Law, Public International Law, Elections',
    icon: Landmark,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20 hover:border-blue-400/40',
    textColor: 'text-blue-400',
  },
  {
    key: 'Labor Law',
    label: 'Labor Law',
    description: 'Labor Standards, Labor Relations, Social Legislation',
    icon: Briefcase,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20 hover:border-emerald-400/40',
    textColor: 'text-emerald-400',
  },
  {
    key: 'Civil Law',
    label: 'Civil Law',
    description: 'Persons, Property, Obligations & Contracts, Family Law, Succession',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20 hover:border-purple-400/40',
    textColor: 'text-purple-400',
  },
  {
    key: 'Taxation',
    label: 'Taxation',
    description: 'Income Tax, VAT, Percentage Tax, Local Taxation',
    icon: Receipt,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20 hover:border-orange-400/40',
    textColor: 'text-orange-400',
  },
  {
    key: 'Mercantile Law',
    label: 'Mercantile Law',
    description: 'Corporation Code, Negotiable Instruments, Insurance, Banking',
    icon: Banknote,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20 hover:border-cyan-400/40',
    textColor: 'text-cyan-400',
  },
  {
    key: 'Criminal Law',
    label: 'Criminal Law',
    description: 'Revised Penal Code, Special Penal Laws, Criminal Jurisprudence',
    icon: Gavel,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/20 hover:border-red-400/40',
    textColor: 'text-red-400',
  },
  {
    key: 'Remedial Law',
    label: 'Remedial Law',
    description: 'Civil Procedure, Criminal Procedure, Evidence, Special Proceedings',
    icon: GavelIcon,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-400/10',
    borderColor: 'border-indigo-400/20 hover:border-indigo-400/40',
    textColor: 'text-indigo-400',
  },
  {
    key: 'Legal Ethics',
    label: 'Legal Ethics',
    description: 'Code of Professional Responsibility, Notarial Practice, Legal Forms',
    icon: Handshake,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20 hover:border-amber-400/40',
    textColor: 'text-amber-400',
  },
];

export function DashboardMain() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome back, {user?.displayName || 'Lawyer'}
              </h1>
              <p className="text-slate-400">
                Choose a subject to begin your practice session.
              </p>
            </div>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI Legal
            </Link>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => navigate(`/practice?subject=${encodeURIComponent(subject.key)}`)}
              className={`group text-left p-6 rounded-2xl bg-slate-900/50 border ${subject.borderColor} transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <subject.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{subject.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{subject.description}</p>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-amber-400 transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                Start Practice
                <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Security Info Card */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Enterprise-Grade Security
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your sessions are protected by Firebase Authentication, server-side validation, rate limiting,
              XSS sanitization, and encrypted API communication. Your study data stays safe.
            </p>
          </div>
          <Scale className="w-8 h-8 text-slate-800 hidden sm:block" />
        </div>
      </section>
    </div>
  );
}
