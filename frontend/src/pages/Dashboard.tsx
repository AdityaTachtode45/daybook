import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import NumberFlow from '@number-flow/react';
import api from '../api/axios';
import { getBucketStats, updateBucketStep } from '../api/bucket';
import { AppShell } from '../components/layout/AppShell';
import { CalendarCenterpiece } from '../components/calendar/CalendarCenterpiece';
import { getCategoryStyles } from '../components/bucket/BucketCard';
import { EntrySummary, StreakInfo, BucketStats, BucketItem } from '../types';
import { StreakEmber } from '../components/3d/StreakEmber';
import { useSound } from '../theme/SoundContext';
import { Trophy, BookOpen, PenTool, Sparkles, Compass, CheckCircle2, ListTodo, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const { playClick, playSwoosh } = useSound();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [entriesRes, streakRes, bucketRes] = await Promise.all([
        api.get<EntrySummary[]>(`/entries?year=${year}&month=${month}`),
        api.get<StreakInfo>('/streaks'),
        getBucketStats().catch(() => null),
      ]);

      setEntries(entriesRes.data);
      setStreakInfo(streakRes.data);
      setBucketStats(bucketRes);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentDate]);

  const handleMarkNextStepDone = async (item: BucketItem) => {
    const nextUndoneStep = item.steps?.find((s) => !s.done);
    if (nextUndoneStep) {
      try {
        playClick();
        await updateBucketStep(nextUndoneStep.id, { done: true });
        toast.success(`Marked step done: "${nextUndoneStep.text}"`);
        const newStats = await getBucketStats();
        setBucketStats(newStats);
      } catch (err) {
        toast.error('Failed to update step');
      }
    } else {
      navigate('/bucket');
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const wroteToday = streakInfo?.wroteToday ?? false;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasEntry = entries.some((e) => e.date === dateStr);
    return { day, dateStr, hasEntry };
  });

  const nextUpItems = bucketStats?.nextUp || [];

  return (
    <AppShell>
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Time of Day Greeting Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-accent mb-1 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Daily Sanctuary</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text tracking-tight">
              {getTimeOfDayGreeting()},{' '}
              <span className="italic font-normal">{profile?.displayName || profile?.email?.split('@')[0] || 'Friend'}</span>
            </h1>
          </div>

          {!wroteToday && (
            <button
              onClick={() => {
                playSwoosh();
                navigate(`/day/${todayStr}`);
              }}
              className="px-6 py-3 rounded-btn bg-accent text-accent-fg font-bold text-sm shadow-xl shadow-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Write Today's Entry</span>
            </button>
          )}
        </div>

        {/* 3D Streak Hero Card */}
        <div className="glass-panel p-6 sm:p-8 bg-surface-2/60 border border-border rounded-panel relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xl">
          {/* Main 3D Streak Counter */}
          <div className="flex items-center gap-4 md:border-r border-border/60 md:pr-6">
            <StreakEmber streak={streakInfo?.currentStreak || 0} className="w-20 h-20 shrink-0" />

            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-muted font-mono">Current Streak</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-4xl sm:text-5xl font-black text-text">
                  <NumberFlow value={streakInfo?.currentStreak || 0} />
                </span>
                <span className="text-sm font-bold text-muted">days</span>
              </div>
              <p className="text-[11px] text-muted mt-1">
                {wroteToday ? 'Active today — streak extended!' : 'Write today to keep your streak alive.'}
              </p>
            </div>
          </div>

          {/* Longest & Total Stats */}
          <div className="grid grid-cols-2 gap-4 md:border-r border-border/60 md:pr-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted font-bold uppercase tracking-wider mb-1 font-mono">
                <Trophy className="w-3.5 h-3.5 text-sage" />
                <span>Longest</span>
              </div>
              <div className="font-mono text-2xl font-extrabold text-text">
                <NumberFlow value={streakInfo?.longestStreak || 0} /> <span className="text-xs text-muted font-sans">days</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted font-bold uppercase tracking-wider mb-1 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Total Written</span>
              </div>
              <div className="font-mono text-2xl font-extrabold text-text">
                <NumberFlow value={streakInfo?.totalEntries || 0} /> <span className="text-xs text-muted font-sans">entries</span>
              </div>
            </div>
          </div>

          {/* 7-Day Dot Strip */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Past 7 Days</p>
            <div className="flex items-center justify-between gap-1">
              {last7Days.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-muted">{format(item.day, 'EEE')[0]}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      item.hasEntry
                        ? 'bg-accent text-accent-fg shadow-sm'
                        : 'bg-surface border border-border text-muted opacity-50'
                    }`}
                  >
                    {item.hasEntry ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bucket List Next Up Section */}
        {nextUpItems.length > 0 && (
          <div className="glass-panel p-6 space-y-4 shadow-md border border-border rounded-panel">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-text">Bucket List — Next Up</h3>
              </div>
              <button
                onClick={() => {
                  playSwoosh();
                  navigate('/bucket');
                }}
                className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline"
              >
                <span>View all dreams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nextUpItems.map((bItem) => {
                const catStyle = getCategoryStyles(bItem.category);
                const stepsTotal = bItem.stepsSummary?.stepsTotal || 0;
                const stepsDone = bItem.stepsSummary?.stepsDone || 0;
                const percent = bItem.stepsSummary?.progressPercent || 0;
                const nextUndoneStep = bItem.steps?.find((s) => !s.done);

                return (
                  <div
                    key={bItem.id}
                    className="p-4 rounded-btn bg-surface-2/60 border border-border flex flex-col justify-between space-y-3 group hover:border-accent/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${catStyle.badge}`}>
                          {bItem.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-accent font-mono">{bItem.status.replace('_', ' ')}</span>
                      </div>

                      <h4
                        onClick={() => navigate('/bucket')}
                        className="font-semibold text-sm text-text group-hover:text-accent cursor-pointer line-clamp-1 transition-colors"
                      >
                        {bItem.title}
                      </h4>

                      {stepsTotal > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                            <span className="flex items-center gap-1">
                              <ListTodo className="w-3.5 h-3.5 text-accent" />
                              <span>{stepsDone}/{stepsTotal} steps</span>
                            </span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      {nextUndoneStep ? (
                        <button
                          onClick={() => handleMarkNextStepDone(bItem)}
                          className="w-full py-1.5 rounded-btn bg-accent/15 hover:bg-accent/25 text-accent font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark step done</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/bucket')}
                          className="w-full py-1.5 rounded-btn bg-surface hover:bg-surface-2 text-text font-semibold text-xs border border-border transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Manage item</span>
                          <ArrowRight className="w-3 h-3 text-accent" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Calendar Centerpiece */}
        <CalendarCenterpiece
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          entries={entries}
          isLoading={isLoading}
        />
      </main>
    </AppShell>
  );
};
