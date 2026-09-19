import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BookOpen, Eye, EyeOff, AlertCircle, ArrowRight, Quote } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const { register } = useAuth();
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
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4 lg:p-0 transition-colors duration-200">
      <div className="w-full max-w-5xl lg:h-[650px] journal-panel overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl">
        {/* Left: Register Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-9 h-9 rounded-btn bg-accent text-accent-fg flex items-center justify-center font-display text-xl font-bold">
                D
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-text">
                Day<span className="text-accent">book</span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-text mb-1">Create Account</h1>
            <p className="text-muted text-sm mb-6 font-sans">Begin your daily diary journey today.</p>

            {error && (
              <div className={`mb-6 p-4 rounded-btn bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3 ${shake ? 'animate-bounce' : ''}`}>
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
                  className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Password (min. 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors font-sans pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-text placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-btn bg-accent text-accent-fg font-bold text-sm shadow-md hover:bg-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="mt-6 text-xs text-muted border-t border-border pt-4 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Right: Feature Highlights (Desktop Only) */}
        <div className="hidden lg:flex p-12 bg-surface-2 border-l border-border flex-col justify-between relative overflow-hidden">
          <div className="w-12 h-12 rounded-btn bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-xl">
            ✍️
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-text">
              Your Daily Sanctuary
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Every entry is private, encrypted, and isolated strictly to your account. Attach rich media, track streaks, and build habits.
            </p>
          </div>

          <div className="text-xs text-muted font-mono">Daybook Editorial Edition</div>
        </div>
      </div>
    </div>
  );
};
