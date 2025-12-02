import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';

import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import PremiumPage from './pages/PremiumPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import AnamnesePage from './pages/AnamnesePage';
import MetasPage from './pages/MetasPage';
import RegistroDiarioPage from './pages/RegistroDiarioPage';
import RankingPage from './pages/RankingPage';
import ProgressPage from './pages/ProgressPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-primary">Carregando...</div>;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/premium/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Dashboard />} />
            <Route path="registro" element={<Register />} />
            <Route path="registro-diario" element={<RegistroDiarioPage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="perfil/dados-pessoais" element={<AnamnesePage />} />
            <Route path="perfil/metas" element={<MetasPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="progresso" element={<ProgressPage />} />
            <Route path="conquistas" element={<AchievementsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="premium/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
