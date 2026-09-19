import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { useSound } from '../../theme/SoundContext';
import { CommandPalette } from '../ui/CommandPalette';
import {
  Calendar,
  Clock,
  Flame,
  User as UserIcon,
  Sun,
  Moon,
  Search,
  LogOut,
  BookOpen,
  X,
  Compass,
  Volume2,
  VolumeX,
  Camera,
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout, isAuthenticated } = useAuth();
  const { theme, effectiveTheme, toggleTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, playClick, playSwoosh } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Global Keyboard Shortcuts (T, B, ?, Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        playSwoosh();
        navigate(`/day/${todayStr}`);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        playSwoosh();
        navigate('/bucket');
      } else if (e.key === '?') {
        e.preventDefault();
        playClick();
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, todayStr, playClick, playSwoosh]);

  if (!isAuthenticated) return <>{children}</>;

  const navItems = [
    { label: 'Calendar', path: '/app', icon: Calendar },
    { label: 'Today', path: `/day/${todayStr}`, icon: Clock },
    { label: 'Memories', path: '/memories', icon: Camera },
    { label: 'Bucket List', path: '/bucket', icon: Compass },
    { label: 'Search & Tags', path: '/search', icon: Search },
    { label: 'Streaks', path: '/streaks', icon: Flame },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-transparent text-text flex flex-col md:flex-row relative z-10">
      {/* Desktop Slim Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-border shrink-0 sticky top-0 h-screen justify-between p-4 z-30 shadow-xl">
        <div>
          {/* Logo Header */}
          <Link
            to="/app"
            onClick={playClick}
            className="flex items-center gap-3 px-3 py-2 mb-6 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-gold flex items-center justify-center text-accent-fg shadow-lg shadow-accent/25 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-text block">
                Day<span className="text-accent">book</span>
              </span>
              <span className="text-[10px] text-muted font-mono uppercase tracking-widest block">Mindful Journal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path.startsWith('/day/') && location.pathname.startsWith('/day/'));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => playSwoosh()}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-semibold transition-all duration-200 overflow-hidden ${
                    isActive
                      ? 'text-accent bg-surface-2/80 border border-border shadow-sm'
                      : 'text-muted hover:text-text hover:bg-surface-2/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-accent/10 border-r-2 border-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-accent scale-110' : 'text-muted'}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              playClick();
              setCmdOpen(true);
            }}
            className="w-full mt-6 flex items-center justify-between px-3.5 py-2.5 rounded-btn bg-surface-2/60 border border-border text-xs text-muted hover:text-text hover:border-accent/40 transition-all shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-accent" />
              <span>Command Palette</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-bg text-[10px] font-mono border border-border">⌘K</kbd>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2.5 border-t border-border/60 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClick();
                toggleTheme();
              }}
              className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-btn bg-surface-2/60 border border-border text-xs font-medium text-text hover:border-accent transition-all"
            >
              <span className="flex items-center gap-2">
                {effectiveTheme === 'dark' ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-gold" />}
                <span className="capitalize">{effectiveTheme}</span>
              </span>
              <span className="text-[10px] text-muted font-mono uppercase">{theme}</span>
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playClick();
              }}
              className="p-2 rounded-btn bg-surface-2/60 border border-border text-muted hover:text-text hover:border-accent transition-all"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sage" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-btn bg-surface-2/60 border border-border">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-accent" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                  {(profile?.displayName || profile?.email || 'D')[0].toUpperCase()}
                </div>
              )}
              <div className="truncate text-xs">
                <p className="font-semibold text-text truncate">{profile?.displayName || 'Writer'}</p>
                <p className="text-[10px] text-muted truncate">{profile?.email}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                playClick();
                await logout();
                navigate('/login');
              }}
              className="p-1.5 text-muted hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area with Route Animated Entrance */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col min-w-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-border px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link
          to="/app"
          onClick={playSwoosh}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            location.pathname === '/app' ? 'text-accent' : 'text-muted'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </Link>

        <Link
          to="/search"
          onClick={playSwoosh}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            location.pathname === '/search' ? 'text-accent' : 'text-muted'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>

        <Link
          to="/bucket"
          onClick={playSwoosh}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            location.pathname === '/bucket' ? 'text-accent' : 'text-muted'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Bucket</span>
        </Link>

        {/* Floating Accent "Today" Orb */}
        <Link
          to={`/day/${todayStr}`}
          onClick={playClick}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-gold text-accent-fg shadow-lg shadow-accent/40 -mt-5 hover:scale-105 active:scale-95 transition-transform"
        >
          <Clock className="w-6 h-6" />
        </Link>

        <Link
          to="/streaks"
          onClick={playSwoosh}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            location.pathname === '/streaks' ? 'text-accent' : 'text-muted'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>Streaks</span>
        </Link>

        <Link
          to="/profile"
          onClick={playSwoosh}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            location.pathname === '/profile' ? 'text-accent' : 'text-muted'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Command Palette Component */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

      {/* Keyboard Shortcuts Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-border rounded-panel max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">Keyboard Shortcuts</h3>
              <button onClick={() => setHelpOpen(false)} className="text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-text">Go to Today</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-border font-mono text-accent">T</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-text">Bucket List</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-border font-mono text-accent">B</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-text">Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-border font-mono text-accent">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-text">Shortcuts Help</span>
                <kbd className="px-2 py-0.5 rounded bg-surface-2 border border-border font-mono text-accent">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
