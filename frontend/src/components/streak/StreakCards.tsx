import React from 'react';
import { Flame, Trophy, BookOpen, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { StreakInfo } from '../../types';

interface StreakCardsProps {
  streakInfo: StreakInfo | null;
  isLoading?: boolean;
}

export const StreakCards: React.FC<StreakCardsProps> = ({ streakInfo, isLoading }) => {
  if (isLoading || !streakInfo) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 rounded-2xl animate-pulse h-28 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-white/5" />
            <div className="h-6 bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Current Streak',
      value: streakInfo.currentStreak,
      unit: 'days',
      icon: Flame,
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      badge: streakInfo.wroteToday ? 'Active Today' : 'Write today to keep it going',
      badgeColor: streakInfo.wroteToday ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-500/20 text-gray-400',
    },
    {
      title: 'Longest Streak',
      value: streakInfo.longestStreak,
      unit: 'days',
      icon: Trophy,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-indigo-500/10',
      borderColor: 'border-purple-500/30',
      badge: 'Personal Record',
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
    {
      title: 'Total Entries',
      value: streakInfo.totalEntries,
      unit: 'entries',
      icon: BookOpen,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30',
      badge: 'Lifetime Written',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      title: 'This Month',
      value: streakInfo.entriesThisMonth,
      unit: 'days',
      icon: CalendarIcon,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30',
      badge: 'Monthly Consistency',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-5 rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl bg-white/5 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${card.color}`}>
                {card.value}
              </span>
              <span className="text-xs text-gray-400 font-medium">{card.unit}</span>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
