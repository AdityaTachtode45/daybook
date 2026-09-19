import React from 'react';
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
  isSameDay,
  isToday,
  isFuture,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntrySummary, MoodType } from '../../types';

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  entries: EntrySummary[];
  isLoading?: boolean;
}

const moodColorMap: Record<MoodType, string> = {
  GREAT: 'bg-[#10B981] shadow-[#10B981]/50', // emerald/green
  GOOD: 'bg-[#14B8A6] shadow-[#14B8A6]/50',  // teal
  OKAY: 'bg-[#F59E0B] shadow-[#F59E0B]/50',  // amber
  LOW: 'bg-[#F97316] shadow-[#F97316]/50',   // orange
  BAD: 'bg-[#F43F5E] shadow-[#F43F5E]/50',   // red
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  onDateChange,
  entries,
  isLoading,
}) => {
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => onDateChange(subMonths(currentDate, 1));
  const handleNextMonth = () => onDateChange(addMonths(currentDate, 1));
  const handleTodayClick = () => onDateChange(new Date());

  const getEntryForDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    return entries.find((e) => e.date === formatted);
  };

  const handleDayClick = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    navigate(`/day/${formatted}`);
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-surface-border shadow-2xl">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleTodayClick}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-accent-violet/20 text-accent-violet border border-accent-violet/30 hover:bg-accent-violet hover:text-white transition-all duration-200"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl bg-surface-muted hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl bg-surface-muted hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center">
        {daysOfWeek.map((dayName) => (
          <div key={dayName} className="text-xs font-semibold text-gray-400 uppercase tracking-wider py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-2 sm:gap-3"
        >
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const isDayFuture = isFuture(day) && !isDayToday;
            const entry = getEntryForDay(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                disabled={!isCurrentMonth}
                className={`group relative aspect-square rounded-2xl p-2 flex flex-col justify-between transition-all duration-200 text-left border ${
                  !isCurrentMonth
                    ? 'opacity-20 border-transparent cursor-default'
                    : isDayToday
                    ? 'bg-accent-violet/10 border-accent-violet text-white today-ring shadow-lg'
                    : entry
                    ? 'bg-surface-muted hover:bg-white/10 border-white/10 hover:border-white/20 text-white'
                    : isDayFuture
                    ? 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-gray-300'
                }`}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isDayToday ? 'text-accent-violet font-extrabold' : 'text-gray-200'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {entry?.hasMedia && (
                    <ImageIcon className="w-3.5 h-3.5 text-accent-indigo" />
                  )}
                </div>

                {/* Entry Preview Dot & Title indicator */}
                <div className="w-full flex items-center justify-between mt-auto">
                  {entry?.mood ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${moodColorMap[entry.mood]} shadow-md`}
                      />
                      <span className="text-[10px] text-gray-400 truncate max-w-[50px] hidden md:inline">
                        {entry.title || 'Entry'}
                      </span>
                    </div>
                  ) : entry ? (
                    <span className="w-2 h-2 rounded-full bg-accent-violet/70" />
                  ) : null}
                </div>

                {/* Hover Tooltip for entries */}
                {entry && (
                  <div className="absolute inset-x-0 -top-10 hidden group-hover:flex justify-center z-30 pointer-events-none">
                    <div className="bg-[#181826] border border-white/10 text-xs text-white px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap">
                      {entry.title || `Entry for ${format(day, 'MMM d')}`}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
