import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-slate-400">
              Lex <span className="text-amber-400/80">Casus</span>
            </span>
          </Link>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Lex Casus. Philippine Bar Exam Study Tool.
          </p>
        </div>
      </div>
    </footer>
  );
}
