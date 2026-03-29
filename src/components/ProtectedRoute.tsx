import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, initialized, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while Firebase auth initializes
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only route → check admin status
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
