import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
        <div className="animate-pulse text-accent-violet font-semibold text-lg flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-accent-violet animate-ping" />
          Loading Daybook...
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
