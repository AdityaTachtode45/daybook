import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isFuture,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Paperclip, Calendar as CalendarIcon, Tag as TagIcon, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { getBucketCompletedDates } from '../../api/bucket';
import { EntrySummary, MoodType, Tag } from '../../types';
import { MoodOrb } from '../3d/MoodOrb';

interface CalendarCenterpieceProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  entries: EntrySummary[];
  isLoading?: boolean;
}

export const CalendarCenterpiece: React.FC<CalendarCenterpieceProps> = ({
  currentDate,
  onDateChange,
  entries,
}) => {
  const navigate = useNavigate();
  const [direction, setDirection] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [completedBucketDates, setCompletedBucketDates] = useState<Record<string, number>>({});

  useEffect(() => {
    api.get<Tag[]>('/tags').then((res) => setUserTags(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    getBucketCompletedDates(year, month)
      .then((data) => {
        const map: Record<string, number> = {};
        (data || []).forEach((item) => {
          map[item.date] = item.count;
        });
        setCompletedBucketDates(map);
      })
      .catch(() => {});
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => {
    setDirection(-1);
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    onDateChange(addMonths(currentDate, 1));
  };

  const getEntryForDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    return entries.find((e) => e.date === formatted);
  };

  const handleDayClick = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    navigate(`/day/${formatted}`);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalEntriesThisMonth = entries.length;

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6 shadow-xl relative border border-border rounded-panel">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-3xl font-bold text-text tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 rounded-btn text-xs font-semibold bg-accent/10 text-accent border border-accent/30 hover:bg-accent hover:text-accent-fg transition-all"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tag Filter Dropdown */}
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-accent" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-surface-2/70 border border-border text-xs text-text rounded-btn px-2.5 py-1.5 focus:outline-none focus:border-accent font-semibold"
            >
              <option value="">Filter by tag</option>
              {userTags.map((t) => (
                <option key={t.id} value={t.name}>
                  #{t.name} ({t.usageCount || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 rounded-btn bg-surface-2/60 border border-border text-text hover:border-accent transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2.5 rounded-btn bg-surface-2/60 border border-border text-text hover:border-accent transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {daysOfWeek.map((dayName) => (
          <div key={dayName} className="text-xs font-bold uppercase tracking-wider text-muted py-1 font-mono">
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 30 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-2 sm:gap-3"
        >
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const isDayFuture = isFuture(day) && !isDayToday;
            const entry = getEntryForDay(day);
            const bucketCount = completedBucketDates[dateStr] || 0;

            const isTagMatched = !selectedTag || (entry && entry.tags && entry.tags.some((t) => t.name === selectedTag));

            return (
              <motion.div
                key={day.toISOString()}
                onClick={() => isCurrentMonth && handleDayClick(day)}
                className={`relative group aspect-square rounded-card p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer border text-left ${
                  !isCurrentMonth
                    ? 'opacity-20 border-transparent cursor-default'
                    : !isTagMatched
                    ? 'opacity-25 bg-surface-2/20 border-border/40 grayscale'
                    : isDayToday
                    ? 'bg-accent/15 border-accent text-text today-breathing-ring shadow-lg scale-[1.03]'
                    : entry
                    ? 'bg-surface-2/80 border-border hover:border-accent hover:-translate-y-1 shadow-md'
                    : isDayFuture
                    ? 'bg-surface-2/30 border-border/50 text-muted cursor-pointer opacity-50'
                    : 'bg-surface-2/40 hover:bg-surface-2/80 border-border/60 hover:border-accent/40'
                }`}
              >
                {/* Date Header inside cell */}
                <div className="flex items-center justify-between w-full z-10">
                  <span
                    className={`font-mono text-sm sm:text-base font-bold ${
                      isDayToday
                        ? 'bg-accent text-accent-fg w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md'
                        : 'text-text'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="flex items-center gap-1">
                    {bucketCount > 0 && (
                      <span className="text-amber-400 flex items-center gap-0.5 font-semibold text-[10px]">
                        <Sparkles className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400 animate-pulse" />
                      </span>
                    )}

                    {entry?.hasMedia && (
                      <Paperclip className="w-3.5 h-3.5 text-accent shrink-0" />
                    )}
                  </div>
                </div>

                {/* Entry 3D Mood Gem */}
                <div className="w-full flex items-center justify-between mt-auto z-10">
                  {entry?.mood ? (
                    <div className="flex items-center gap-1.5 w-full justify-between">
                      <MoodOrb mood={entry.mood} className="w-6 h-6 shrink-0" />
                      <span className="text-[10px] text-muted truncate max-w-[50px] hidden sm:inline font-sans">
                        {entry.title || 'Written'}
                      </span>
                    </div>
                  ) : entry ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent/80 shadow-sm" />
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Month Summary Bar */}
      <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted">
        <div className="flex items-center gap-3 font-medium">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-accent" />
            <span>Total written: <strong className="text-text font-bold font-mono">{totalEntriesThisMonth}</strong></span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5 text-gold font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Completed Bucket Goals</span>
          </div>
        </div>

        {/* Mood legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4CB782]" /> Great</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4BA3C7]" /> Good</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E0A93B]" /> Okay</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#8B7FD1]" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#D9576B]" /> Bad</span>
        </div>
      </div>
    </div>
  );
};
