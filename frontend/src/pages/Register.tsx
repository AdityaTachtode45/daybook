import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useSound } from '../theme/SoundContext';
import { BookOpen, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const { register } = useAuth();
  const { playClick, playSwoosh } = useSound();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      playSwoosh();
      await register(email, password);
      navigate('/app');
    } catch (err: any) {
      console.error('Register error', err);
      setError(err?.response?.data?.message || 'Registration failed');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-transparent text-text flex items-center justify-center p-4 relative z-10 transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl lg:min-h-[640px] glass-panel rounded-panel overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl border border-border"
      >
        {/* Left: Register Form */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Logo */}
            <Link to="/" onClick={playClick} className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-gold flex items-center justify-center text-accent-fg shadow-lg shadow-accent/20 font-display text-xl font-bold">
                D
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-text">
                Day<span className="text-accent">book</span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-text mb-1">Create Account</h1>
            <p className="text-muted text-sm mb-6 font-sans">Begin your daily diary journey today.</p>

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
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Password (min. 8 chars)
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-btn bg-surface-2/70 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-sans pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-btn bg-accent text-accent-fg font-bold text-sm shadow-lg shadow-accent/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-accent-fg border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Daybook Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-xs text-muted border-t border-border/60 pt-4 text-center">
            Already have an account?{' '}
            <Link to="/login" onClick={playClick} className="text-accent font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Right: Feature Highlights (Desktop Only) */}
        <div className="hidden lg:flex p-12 bg-surface-2/40 border-l border-border flex-col justify-between relative overflow-hidden">
          <div className="w-12 h-12 rounded-btn bg-accent/15 text-accent flex items-center justify-center font-display font-bold text-xl">
            ✍️
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-text">
              Your Daily Sanctuary
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Every entry is private, encrypted, and isolated strictly to your account. Attach rich media, track streaks, and build habits.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>End-to-end user isolation & JWT security</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Rich text editor with photos & bucket lists</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Personalized analytics & streak tracking</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted font-mono">Daybook Editorial Edition</div>
        </div>
      </motion.div>
    </div>
  );
};
