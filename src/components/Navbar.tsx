import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Scale,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Shield,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/practice', label: 'Practice', icon: BookOpen },
        { to: '/chat', label: 'AI Legal', icon: MessageSquare },
        ...(user.isAdmin
          ? [{ to: '/admin', label: 'Admin', icon: Shield }]
          : []),
      ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all">
              <Scale className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Lex <span className="text-amber-400">Casus</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 text-xs font-bold">
                      {user.email?.[0].toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-slate-300 max-w-[160px] truncate">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && user && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/60">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
