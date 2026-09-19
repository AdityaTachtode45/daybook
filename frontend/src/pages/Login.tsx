import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useSound } from '../theme/SoundContext';
import { BookOpen, Eye, EyeOff, AlertCircle, ArrowRight, Quote } from 'lucide-react';

const quotes = [
  "“Keep a diary, and one day it will keep you.” — Mae West",
  "“Fill your paper with the breathings of your heart.” — William Wordsworth",
  "“In the journal I do not just express myself more freely than I can to any person; I create myself.” — Susan Sontag",
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();
  const { playClick, playSwoosh } = useSound();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      playSwoosh();
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      console.error('Login error', err);
      setError(err?.response?.data?.message || 'Invalid email or password');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const randomQuote = quotes[0];

  return (
    <div className="min-h-screen bg-transparent text-text flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl lg:h-[620px] glass-panel rounded-panel overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl border border-border"
      >
        {/* Left: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo Header */}
            <Link to="/" onClick={playClick} className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-gold flex items-center justify-center text-accent-fg shadow-lg shadow-accent/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-text">
                Day<span className="text-accent">book</span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-text mb-2">Welcome Back</h1>
            <p className="text-muted text-sm mb-6 font-sans">Sign in to access your personal journal.</p>

            {error && (
              <div
                className={`mb-6 p-4 rounded-btn bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3 ${
                  shake ? 'animate-bounce' : ''
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors font-sans pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-btn bg-accent text-accent-fg font-bold text-sm shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-accent-fg border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-xs text-muted border-t border-border/60 pt-4 text-center">
            Don't have an account yet?{' '}
            <Link to="/register" onClick={playClick} className="text-accent font-semibold hover:underline">
              Create Daybook Account
            </Link>
          </div>
        </div>

        {/* Right Quote Panel */}
        <div className="hidden lg:flex p-12 bg-surface-2/40 border-l border-border flex-col justify-between relative overflow-hidden">
          <div className="w-12 h-12 rounded-btn bg-accent/15 text-accent flex items-center justify-center">
            <Quote className="w-6 h-6" />
          </div>

          <div className="space-y-4">
            <p className="font-display text-2xl font-bold text-text leading-relaxed">
              {randomQuote}
            </p>
            <p className="text-xs text-muted">Reflect daily, build writing streaks, capture moments.</p>
          </div>

          <div className="text-xs text-muted font-mono">Daybook Editorial Edition</div>
        </div>
      </motion.div>
    </div>
  );
};
