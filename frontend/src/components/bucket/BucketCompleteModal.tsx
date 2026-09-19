import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BucketItem } from '../../types';
import { Sparkles, Calendar, Heart, CheckCircle2, X, BookOpen, Loader2, Trophy } from 'lucide-react';

interface BucketCompleteModalProps {
  open: boolean;
  item: BucketItem | null;
  onClose: () => void;
  onConfirmComplete: (id: number, date: string, note: string) => Promise<void>;
}

export const BucketCompleteModal: React.FC<BucketCompleteModalProps> = ({
  open,
  item,
  onClose,
  onConfirmComplete,
}) => {
  const navigate = useNavigate();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(todayStr);
      setNote('');
      setError(null);
    }
  }, [open, todayStr]);

  if (!open || !item) return null;

  const fireFireworksConfetti = () => {
    try {
      // Left cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#ec4899', '#10b981', '#f59e0b'],
      });
      // Right cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#ec4899', '#10b981', '#f59e0b'],
      });
      // Center star burst
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.5 },
          shapes: ['star'],
          colors: ['#f59e0b', '#10b981', '#ffffff'],
        });
      }, 200);
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    if (date > todayStr) {
      setError('Completion date cannot be in the future');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirmComplete(item.id, date, note.trim());

      fireFireworksConfetti();

      const completedDateFormatted = date;
      onClose();

      toast.success(`Dream Fulfilled: "${item.title}"! 🎉`, {
        description: 'Linked directly to your diary entry for this date.',
        action: {
          label: 'Write about it',
          onClick: () => navigate(`/day/${completedDateFormatted}`),
        },
        duration: 8000,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to complete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-surface border border-border rounded-panel max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Soft Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-text">Dream Fulfilled!</h3>
                  <p className="text-xs text-muted font-medium line-clamp-1">{item.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-text p-1.5 rounded-btn hover:bg-surface-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-btn bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Date Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>When did you achieve this milestone?</span>
                </label>
                <input
                  type="date"
                  value={date}
                  max={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text font-medium text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-[11px] text-muted">
                  Defaults to today. Linked to your diary entry on this date.
                </p>
              </div>

              {/* Emotional Note Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-wider block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>How did it feel? (Optional note)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Capture the feeling, the lesson, or who was by your side..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text font-sans text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-btn bg-surface-2 text-muted text-xs font-bold hover:text-text transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !date}
                  className="px-6 py-2.5 rounded-btn bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Fulfill Goal 🎉</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
