import React, { useState } from 'react';
import { BUCKET_SUGGESTIONS, BucketSuggestion } from '../../data/bucketSuggestions';
import { BucketCategory, BucketItem } from '../../types';
import { Lightbulb, X, Plus, Check, Compass, Sparkles } from 'lucide-react';
import { getCategoryStyles } from './BucketCard';

interface BucketNeedIdeasModalProps {
  open: boolean;
  onClose: () => void;
  existingItems: BucketItem[];
  onAddSuggestion: (suggestion: BucketSuggestion) => Promise<void>;
}

const CATEGORY_TABS: { label: string; value: 'ALL' | BucketCategory }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Learn', value: 'LEARN' },
  { label: 'Adventure', value: 'ADVENTURE' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Creative', value: 'CREATIVE' },
  { label: 'Career', value: 'CAREER' },
  { label: 'Relationships', value: 'RELATIONSHIPS' },
  { label: 'Money', value: 'MONEY' },
  { label: 'Other', value: 'OTHER' },
];

export const BucketNeedIdeasModal: React.FC<BucketNeedIdeasModalProps> = ({
  open,
  onClose,
  existingItems,
  onAddSuggestion,
}) => {
  const [selectedCat, setSelectedCat] = useState<'ALL' | BucketCategory>('ALL');
  const [addingId, setAddingId] = useState<string | null>(null);

  if (!open) return null;

  // Set of existing item titles (normalized)
  const existingTitles = new Set(
    existingItems.map((i) => (i.title || '').trim().toLowerCase())
  );

  const filteredSuggestions = BUCKET_SUGGESTIONS.filter((sug) => {
    if (selectedCat !== 'ALL' && sug.category !== selectedCat) return false;
    return true;
  });

  const handleAdd = async (sug: BucketSuggestion) => {
    setAddingId(sug.id);
    try {
      await onAddSuggestion(sug);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-surface border border-border rounded-panel max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-text">Bucket List Inspiration</h3>
              <p className="text-xs text-muted">Explore 40 curated ideas across travel, learning, and life goals.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-btn text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-surface-2/30 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedCat(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === tab.value
                  ? 'bg-accent text-accent-fg shadow-sm'
                  : 'bg-surface-2 text-muted hover:text-text hover:bg-surface-2/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Suggestions Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSuggestions.map((sug) => {
            const isAlreadyAdded = existingTitles.has(sug.title.toLowerCase());
            const catStyle = getCategoryStyles(sug.category);
            const isAdding = addingId === sug.id;

            return (
              <div
                key={sug.id}
                className="p-4 rounded-panel bg-surface-2/50 border border-border/70 hover:border-accent/40 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${catStyle.badge}`}>
                      {sug.category}
                    </span>
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider">
                      {sug.priority} priority
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-text leading-snug group-hover:text-accent transition-colors">
                    {sug.title}
                  </h4>

                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {sug.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-end">
                  {isAlreadyAdded ? (
                    <span className="px-3 py-1 rounded-btn bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Added to list</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAdd(sug)}
                      disabled={isAdding}
                      className="px-3 py-1.5 rounded-btn bg-accent text-accent-fg hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-opacity disabled:opacity-50"
                    >
                      {isAdding ? (
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>Add to Dreams</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
