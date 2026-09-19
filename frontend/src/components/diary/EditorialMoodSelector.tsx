import React from 'react';
import { motion } from 'framer-motion';
import { MoodType } from '../../types';
import { MoodOrb } from '../3d/MoodOrb';
import { useSound } from '../../theme/SoundContext';

interface EditorialMoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
  disabled?: boolean;
}

const moodConfig: { type: MoodType; label: string; color: string; border: string; bg: string }[] = [
  { type: 'GREAT', label: 'Great', color: 'text-[#4CB782]', border: 'border-[#4CB782]', bg: 'bg-[#4CB782]/15' },
  { type: 'GOOD', label: 'Good', color: 'text-[#4BA3C7]', border: 'border-[#4BA3C7]', bg: 'bg-[#4BA3C7]/15' },
  { type: 'OKAY', label: 'Okay', color: 'text-[#E0A93B]', border: 'border-[#E0A93B]', bg: 'bg-[#E0A93B]/15' },
  { type: 'LOW', label: 'Low', color: 'text-[#8B7FD1]', border: 'border-[#8B7FD1]', bg: 'bg-[#8B7FD1]/15' },
  { type: 'BAD', label: 'Bad', color: 'text-[#D9576B]', border: 'border-[#D9576B]', bg: 'bg-[#D9576B]/15' },
];

export const EditorialMoodSelector: React.FC<EditorialMoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  disabled,
}) => {
  const { playPop } = useSound();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-wider text-muted mr-2 font-mono">Today's Mood:</span>
      {moodConfig.map((item) => {
        const isSelected = selectedMood === item.type;
        return (
          <motion.button
            key={item.type}
            type="button"
            disabled={disabled}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (!disabled) {
                playPop();
                onSelectMood(item.type);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-btn text-xs font-semibold transition-all duration-200 border ${
              isSelected
                ? `${item.bg} ${item.border} ${item.color} shadow-md ring-2 ring-offset-2 ring-offset-bg ring-current scale-105`
                : 'bg-surface-2/60 border-border/80 text-muted hover:text-text hover:border-accent/40'
            }`}
          >
            <MoodOrb mood={item.type} className="w-5 h-5 shrink-0" interactive={isSelected} />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
