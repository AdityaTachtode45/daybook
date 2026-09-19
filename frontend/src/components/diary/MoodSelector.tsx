import React from 'react';
import { MoodType } from '../../types';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

const moodOptions: { type: MoodType; emoji: string; label: string; color: string; border: string }[] = [
  { type: 'GREAT', emoji: '🤩', label: 'Great', color: 'bg-emerald-500/20 text-emerald-300', border: 'border-emerald-500/50' },
  { type: 'GOOD', emoji: '😊', label: 'Good', color: 'bg-teal-500/20 text-teal-300', border: 'border-teal-500/50' },
  { type: 'OKAY', emoji: '😐', label: 'Okay', color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/50' },
  { type: 'LOW', emoji: '😔', label: 'Low', color: 'bg-orange-500/20 text-orange-300', border: 'border-orange-500/50' },
  { type: 'BAD', emoji: '😫', label: 'Bad', color: 'bg-rose-500/20 text-rose-300', border: 'border-rose-500/50' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase text-gray-400 mr-2">Mood:</span>
      {moodOptions.map((option) => {
        const isSelected = selectedMood === option.type;
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelectMood(option.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
              isSelected
                ? `${option.color} ${option.border} scale-105 shadow-md`
                : 'bg-surface-muted text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-base">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
