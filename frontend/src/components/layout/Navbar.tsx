import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Calendar, User as UserIcon, LogOut, Flame, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/app" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent-violet/25 group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white tracking-tight">
            Day<span className="text-accent-violet">book</span>
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/app"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/app'
                ? 'bg-surface-muted text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover'
            }`}
          >
            <Calendar className="w-4 h-4 text-accent-violet" />
            <span>Calendar</span>
          </Link>

          <Link
            to="/bucket"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/bucket'
                ? 'bg-surface-muted text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover'
            }`}
          >
            <BookOpen className="w-4 h-4 text-accent-violet" />
            <span>Bucket List</span>
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-surface-muted text-white border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover'
            }`}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-accent-violet"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-accent-indigo" />
            )}
            <span className="hidden sm:inline">
              {profile?.displayName || profile?.email?.split('@')[0] || 'Profile'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
