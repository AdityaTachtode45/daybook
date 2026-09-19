import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import NumberFlow from '@number-flow/react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import api from '../api/axios';
import { AppShell } from '../components/layout/AppShell';
import { EntrySummary, StreakInfo } from '../types';
import { Heatmap3D } from '../components/3d/Heatmap3D';
import { HolographicCard } from '../components/3d/HolographicCard';
import { useSound } from '../theme/SoundContext';
import { Flame, Trophy, Award, Calendar as CalendarIcon, Sparkles, Box, LayoutGrid } from 'lucide-react';

const milestoneTargets = [
  { days: 3, label: '3 Days', desc: 'First Habit Spark' },
  { days: 7, label: '7 Days', desc: 'One Full Week' },
  { days: 30, label: '30 Days', desc: 'Monthly Master' },
  { days: 100, label: '100 Days', desc: 'Centurion Writer' },
  { days: 365, label: '365 Days', desc: 'Year of Reflection' },
];

export const StreaksPage: React.FC = () => {
  const [confettiFired, setConfettiFired] = useState(false);
  const [is3DView, setIs3DView] = useState(true);
  const { playChime, playClick } = useSound();

  const { data: streakInfo } = useQuery<StreakInfo>({
    queryKey: ['streaks'],
    queryFn: async () => {
      const res = await api.get<StreakInfo>('/streaks');
      return res.data;
    },
  });

  const { data: heatmapData } = useQuery<EntrySummary[]>({
    queryKey: ['heatmap12Months'],
    queryFn: async () => {
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(new Date(), 11 - i);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
      });

      const promises = months.map((m) =>
        api.get<EntrySummary[]>(`/entries?year=${m.year}&month=${m.month}`)
      );
      const results = await Promise.all(promises);
      return results.flatMap((r) => r.data);
    },
  });

  useEffect(() => {
    if (streakInfo && streakInfo.currentStreak >= 3 && !confettiFired) {
      playChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF8A4C', '#F5C15A', '#6FCDB8'],
      });
      setConfettiFired(true);
    }
  }, [streakInfo, confettiFired, playChime]);

  const yearStart = subMonths(new Date(), 11);
  const allHeatmapDays = eachDayOfInterval({
    start: startOfMonth(yearStart),
    end: endOfMonth(new Date()),
  });

  const getHeatmapIntensity = (day: Date) => {
    if (!heatmapData) return 'bg-surface-2 border-border/40';
    const formatted = format(day, 'yyyy-MM-dd');
    const entry = heatmapData.find((e) => e.date === formatted);
    if (!entry) return 'bg-surface-2/40 border-border/20';
    if (entry.hasMedia) return 'bg-accent border-accent text-accent-fg';
    return 'bg-gold/80 border-gold text-text';
  };

  const heatmap3DData = allHeatmapDays.map((d) => {
    const formatted = format(d, 'yyyy-MM-dd');
    const entry = heatmapData?.find((e) => e.date === formatted);
    return { date: formatted, count: entry ? 1 : 0 };
  });

  return (
    <AppShell>
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-accent mb-1 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Habits & Milestones</span>
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text tracking-tight">
            Writing Streaks & Heatmap
          </h1>
        </div>

        {/* Streak Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HolographicCard className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0 border border-gold/30">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-muted tracking-wider font-mono">Current Streak</p>
              <div className="font-mono text-3xl font-black text-text mt-1">
                <NumberFlow value={streakInfo?.currentStreak || 0} /> <span className="text-xs font-sans text-muted">days</span>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-sage/15 text-sage flex items-center justify-center shrink-0 border border-sage/30">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-muted tracking-wider font-mono">Longest Streak</p>
              <div className="font-mono text-3xl font-black text-text mt-1">
                <NumberFlow value={streakInfo?.longestStreak || 0} /> <span className="text-xs font-sans text-muted">days</span>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0 border border-accent/30">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-muted tracking-wider font-mono">Total Written</p>
              <div className="font-mono text-3xl font-black text-text mt-1">
                <NumberFlow value={streakInfo?.totalEntries || 0} /> <span className="text-xs font-sans text-muted">entries</span>
              </div>
            </div>
          </HolographicCard>
        </div>

        {/* Yearly Consistency Heatmap Section */}
        <div className="glass-panel p-6 sm:p-8 space-y-4 border border-border rounded-panel shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="font-display text-xl font-bold text-text">Yearly Consistency Heatmap</h2>
              <p className="text-xs text-muted font-mono">Past 12 Months Activity</p>
            </div>

            {/* 3D vs 2D Toggle */}
            <div className="flex items-center bg-surface-2 p-1 rounded-btn border border-border">
              <button
                onClick={() => {
                  playClick();
                  setIs3DView(true);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  is3DView ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D View</span>
              </button>
              <button
                onClick={() => {
                  playClick();
                  setIs3DView(false);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  !is3DView ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>2D View</span>
              </button>
            </div>
          </div>

          {is3DView ? (
            <Heatmap3D data={heatmap3DData} className="w-full h-80" />
          ) : (
            <div className="overflow-x-auto pt-2 pb-4">
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[700px]">
                {allHeatmapDays.map((day) => {
                  const formatted = format(day, 'yyyy-MM-dd');
                  const entry = heatmapData?.find((e) => e.date === formatted);
                  return (
                    <div
                      key={day.toISOString()}
                      title={`${formatted}: ${entry ? (entry.title || 'Written') : 'No entry'}`}
                      className={`w-3.5 h-3.5 rounded-sm border transition-transform hover:scale-125 ${getHeatmapIntensity(day)}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 text-xs text-muted pt-2 border-t border-border/60">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-surface-2/40 border border-border/20" />
            <span className="w-3 h-3 rounded-sm bg-gold/80 border border-gold" />
            <span className="w-3 h-3 rounded-sm bg-accent border border-accent" />
            <span>More</span>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="glass-panel p-6 sm:p-8 space-y-6 border border-border rounded-panel shadow-md">
          <h2 className="font-display text-xl font-bold text-text border-b border-border/60 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" />
            <span>Milestone Badges</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {milestoneTargets.map((badge) => {
              const achieved = (streakInfo?.longestStreak || 0) >= badge.days;
              return (
                <HolographicCard key={badge.days} className="p-4 text-center space-y-2 border">
                  <div
                    className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${
                      achieved ? 'bg-gold text-bg shadow-md' : 'bg-surface-2 text-muted'
                    }`}
                  >
                    {badge.days}d
                  </div>
                  <h3 className="font-display text-sm font-bold text-text">{badge.label}</h3>
                  <p className="text-[10px] text-muted">{badge.desc}</p>
                  <span
                    className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      achieved ? 'bg-gold/20 text-gold font-mono' : 'bg-surface-2 text-muted font-mono'
                    }`}
                  >
                    {achieved ? 'Unlocked' : 'Locked'}
                  </span>
                </HolographicCard>
              );
            })}
          </div>
        </div>
      </main>
    </AppShell>
  );
};
