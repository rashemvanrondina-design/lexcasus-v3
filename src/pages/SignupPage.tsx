// pages/SignupPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { sanitizeText, isValidEmail, isStrongPassword } from '../utils/security';
import { Eye, EyeOff, Scale, AlertCircle, Check } from 'lucide-react';

export function SignupPage() {
  const { signup, loginWithGoogle, isLoading, error, clearError } = useAuthStore(); // 👈 Added loginWithGoogle
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!displayName.trim()) {
      setLocalError('Please enter your name.');
      return;
    }

    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    const strength = isStrongPassword(password);
    if (!strength.valid) {
      setLocalError(`Password requirements: ${strength.errors.join(', ')}.`);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await signup(sanitizeText(email), password, sanitizeText(displayName.trim()));
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  // 🆕 Added handleGoogleSignup
  const handleGoogleSignup = async () => {
    setLocalError('');
    clearError();
    try {
      await loginWithGoogle(); // This handles both login AND signup for Google users
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;
  const strength = isStrongPassword(password);
  const allRequirements = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-2xl font-bold text-white">
              Lex <span className="text-amber-400">Casus</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Start your bar exam journey today</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-5"
        >
          {displayError && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{displayError}</p>
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm"
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {allRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      req.met ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all text-sm"
              placeholder="Repeat your password"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* 🆕 The Google Button Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-500">Or sign up with</span>
            </div>
          </div>

          {/* 🆕 The Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}