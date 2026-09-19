import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Flame, Shield, Compass, ArrowRight, Heart } from 'lucide-react';
import { HolographicCard } from '../components/3d/HolographicCard';
import { MoodOrb } from '../components/3d/MoodOrb';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-text flex flex-col relative overflow-hidden">
      {/* Top Header Navigation */}
      <header className="fixed top-0 inset-x-0 z-40 glass-panel border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-gold flex items-center justify-center text-accent-fg shadow-lg shadow-accent/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-text">
            Day<span className="text-accent">book</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-muted hover:text-text transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-btn bg-accent text-accent-fg font-semibold text-sm shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Start Your Journal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2/80 border border-border text-xs font-semibold text-accent mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-gold" />
          <span>Mindful Daily Reflection & Keepsakes</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.15] text-text max-w-4xl mb-6"
        >
          Remember every day. <br />
          <span className="bg-gradient-to-r from-accent via-gold to-sage bg-clip-text text-transparent">
            Built with heart & emotion.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed font-sans"
        >
          A dreamy, 3D-first personal space for your daily memories, mood gemstones, streak flames, and lifelong bucket list dreams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-panel bg-accent text-accent-fg font-bold text-base shadow-xl shadow-accent/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>Begin Free Journey</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-panel glass-panel border border-border font-semibold text-text text-base hover:bg-surface-2/60 transition-all flex items-center justify-center"
          >
            <span>Sign In to Journal</span>
          </Link>
        </motion.div>

        {/* Feature Interactive Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <HolographicCard className="p-6">
            <div className="w-12 h-12 rounded-btn bg-accent/15 text-accent flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-2">3D Mood Gemstones</h3>
            <p className="text-sm text-muted mb-4">
              Track how you feel each day with glossy translucent gemstone gems that float inside your calendar board.
            </p>
            <div className="flex items-center gap-3">
              <MoodOrb mood="GREAT" className="w-8 h-8" />
              <MoodOrb mood="GOOD" className="w-8 h-8" />
              <MoodOrb mood="OKAY" className="w-8 h-8" />
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <div className="w-12 h-12 rounded-btn bg-gold/15 text-gold flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-2">3D Streak Flames</h3>
            <p className="text-sm text-muted mb-4">
              Watch your writing consistency ignite glowing ember flames with milestone bursts and confetti rewards.
            </p>
            <div className="font-mono text-2xl font-bold text-gold">🔥 14 Days Active</div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <div className="w-12 h-12 rounded-btn bg-sage/15 text-sage flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-text mb-2">Holographic Bucket List</h3>
            <p className="text-sm text-muted mb-4">
              Transform lifelong dreams into interactive holographic cards with step milestones and ceremony celebrations.
            </p>
            <div className="text-xs font-semibold text-sage flex items-center gap-1">
              <Heart className="w-4 h-4 fill-current" />
              <span>Memories Preserved Forever</span>
            </div>
          </HolographicCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 px-6 text-center text-xs text-muted">
        <p>© 2026 Daybook • Crafted with Heart & Emotion</p>
      </footer>
    </div>
  );
};
