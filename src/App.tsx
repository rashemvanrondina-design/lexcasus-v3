import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 👈 Use BrowserRouter consistently
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage'; 
import { DashboardPage } from './pages/Dashboard'; 
import { PracticePage } from './pages/PracticePage';
import { ChatPage } from './pages/ChatPage';
import { AdminPage } from './pages/AdminPage';
import { useAuthStore } from './store/authStore';

export default function App() {
  const initialize = useAuthStore((s: any) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initialize]);

  return (
   <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    > {/* 👈 The closing bracket goes HERE, after the props */}
      
      <Routes>
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 🔒 PROTECTED APP ROUTES */}
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter> 
  );
}