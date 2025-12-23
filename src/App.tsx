import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';

// Páginas MVP Simplificadas
import DashboardSimple from './pages/DashboardSimple';
import RegisterSimple from './pages/RegisterSimple';
import OnboardingSimple from './pages/OnboardingSimple';
import Chat from './pages/Chat'; // Chat original com funcionalidades completas
import ProfileSimple from './pages/ProfileSimple';
import HistoryPage from './pages/HistoryPage';
import AnamnesePage from './pages/AnamnesePage';
import MetasPage from './pages/MetasPage';
import BroadcastNotifications from './pages/BroadcastNotifications';
import { useReminders } from './hooks/useReminders';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

import InstallPWA from './components/InstallPWA'; // Import adicionado

// Componente para executar lembretes em background
function GlobalReminders() {
  useReminders(); // Executa hook globalmente
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstallPWA /> {/* Componente PWA adicionado aqui */}
        <GlobalReminders /> {/* Reminders rodando globalmente */}
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingSimple /></ProtectedRoute>} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<DashboardSimple />} />
            <Route path="registro" element={<RegisterSimple />} />
            <Route path="chat" element={<Chat />} />
            <Route path="perfil" element={<ProfileSimple />} />
            <Route path="historico" element={<HistoryPage />} />
            <Route path="anamnese" element={<AnamnesePage />} />
            <Route path="metas" element={<MetasPage />} />
            <Route path="broadcast" element={<BroadcastNotifications />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
