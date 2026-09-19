import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { SoundProvider } from './theme/SoundContext';
import { WritingModeProvider } from './theme/WritingModeContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { GlobalCanvas } from './components/canvas/GlobalCanvas';
import { getStoredQuality, getStoredSimpleMode, getQualitySettings } from './theme/QualitySystem';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Day } from './pages/Day';
import { Search } from './pages/Search';
import { StreaksPage } from './pages/Streaks';
import { ProfilePage } from './pages/Profile';
import { BucketList } from './pages/BucketList';
import { MemoriesPage } from './pages/Memories';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient();

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/app" replace /> : <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [quality] = useState(() => getStoredQuality());
  const [simpleMode] = useState(() => getStoredSimpleMode());
  const qualitySettings = getQualitySettings(quality, simpleMode);

  return (
    <>
      <GlobalCanvas settings={qualitySettings} />
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />

          {/* Public Only */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/day/:date" element={<Day />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/bucket" element={<BucketList />} />
            <Route path="/search" element={<Search />} />
            <Route path="/streaks" element={<StreaksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SoundProvider>
          <WritingModeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </WritingModeProvider>
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
