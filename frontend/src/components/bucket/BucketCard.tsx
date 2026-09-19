import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { BucketItem, BucketCategory, BucketPriority } from '../../types';
import { HolographicCard } from '../3d/HolographicCard';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Flame,
  Compass,
  Plane,
  BookOpen,
  Briefcase,
  HeartPulse,
  Mountain,
  Palette,
  Heart,
  Coins,
  Smile,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BucketCardProps {
  item: BucketItem;
  viewMode: 'board' | 'grid';
  onCardClick: (item: BucketItem) => void;
  onQuickComplete?: (item: BucketItem) => void;
}

export const getCategoryStyles = (category: BucketCategory) => {
  switch (category) {
    case 'TRAVEL':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
        gradient: 'from-emerald-950/60 via-teal-900/30 to-surface-2',
        icon: Plane,
        glow: 'group-hover:border-emerald-500/40',
        progress: 'from-emerald-400 to-teal-400',
      };
    case 'LEARN':
      return {
        badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
        gradient: 'from-indigo-950/60 via-violet-900/30 to-surface-2',
        icon: BookOpen,
        glow: 'group-hover:border-indigo-500/40',
        progress: 'from-indigo-400 to-violet-400',
      };
    case 'CAREER':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
        gradient: 'from-amber-950/60 via-orange-900/30 to-surface-2',
        icon: Briefcase,
        glow: 'group-hover:border-amber-500/40',
        progress: 'from-amber-400 to-orange-400',
      };
    case 'HEALTH':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
        gradient: 'from-rose-950/60 via-pink-900/30 to-surface-2',
        icon: HeartPulse,
        glow: 'group-hover:border-rose-500/40',
        progress: 'from-rose-400 to-pink-400',
      };
    case 'ADVENTURE':
      return {
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)]',
        gradient: 'from-orange-950/60 via-red-900/30 to-surface-2',
        icon: Mountain,
        glow: 'group-hover:border-orange-500/40',
        progress: 'from-orange-400 to-red-400',
      };
    case 'CREATIVE':
      return {
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
        gradient: 'from-purple-950/60 via-fuchsia-900/30 to-surface-2',
        icon: Palette,
        glow: 'group-hover:border-purple-500/40',
        progress: 'from-purple-400 to-fuchsia-400',
      };
    case 'RELATIONSHIPS':
      return {
        badge: 'bg-pink-500/15 text-pink-400 border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.15)]',
        gradient: 'from-pink-950/60 via-rose-900/30 to-surface-2',
        icon: Heart,
        glow: 'group-hover:border-pink-500/40',
        progress: 'from-pink-400 to-rose-400',
      };
    case 'MONEY':
      return {
        badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)]',
        gradient: 'from-teal-950/60 via-emerald-900/30 to-surface-2',
        icon: Coins,
        glow: 'group-hover:border-teal-500/40',
        progress: 'from-teal-400 to-emerald-400',
      };
    case 'OTHER':
    default:
      return {
        badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30 shadow-[0_0_12px_rgba(100,116,139,0.15)]',
        gradient: 'from-slate-900/60 via-zinc-900/30 to-surface-2',
        icon: Smile,
        glow: 'group-hover:border-slate-500/40',
        progress: 'from-slate-400 to-zinc-400',
      };
  }
};

export const getPriorityBadge = (priority: BucketPriority) => {
  switch (priority) {
    case 'HIGH':
      return {
        color: 'bg-rose-500 text-white',
        icon: Flame,
        label: 'High',
        pulse: 'animate-pulse',
      };
    case 'MEDIUM':
      return {
        color: 'bg-amber-500/90 text-white',
        icon: Compass,
        label: 'Medium',
        pulse: '',
      };
    case 'LOW':
      return {
        color: 'bg-blue-400/90 text-white',
        icon: Sparkles,
        label: 'Low',
        pulse: '',
      };
  }
};

export const BucketCard: React.FC<BucketCardProps> = ({ item, viewMode, onCardClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: viewMode !== 'board',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const catStyle = getCategoryStyles(item.category);
  const prioStyle = getPriorityBadge(item.priority);
  const CatIcon = catStyle.icon;
  const PrioIcon = prioStyle.icon;
  const isDone = item.status === 'DONE';

  const stepsTotal = item.stepsSummary?.stepsTotal || 0;
  const stepsDone = item.stepsSummary?.stepsDone || 0;
  const progressPercent = item.stepsSummary?.progressPercent || 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full">
      <HolographicCard className="w-full cursor-pointer">
        <div
          onClick={() => onCardClick(item)}
          className={`group relative overflow-hidden transition-all duration-300 ${
            viewMode === 'board' ? 'w-full touch-none' : 'flex flex-col h-full'
          }`}
        >
          {/* Cover Image or Atmospheric Ambient Banner */}
          {item.coverUrl ? (
            <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-surface-2">
              <img
                src={item.coverUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

              {/* Category badge over cover */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md flex items-center gap-1.5 uppercase tracking-wider ${catStyle.badge}`}>
                  <CatIcon className="w-3 h-3" />
                  <span>{item.category}</span>
                </span>
              </div>

              {/* Status Ribbon if Done */}
              {isDone ? (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/95 backdrop-blur-md text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACHIEVED</span>
                </div>
              ) : (
                <div className="absolute top-3 right-3" title={`${prioStyle.label} Priority`}>
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center ${prioStyle.color} ${prioStyle.pulse} shadow-md`}>
                    <PrioIcon className="w-2 h-2" />
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={`relative w-full h-24 bg-gradient-to-br ${catStyle.gradient} p-3.5 flex items-start justify-between border-b border-border/40 overflow-hidden`}>
              <CatIcon className="absolute -bottom-2 -right-2 w-20 h-20 opacity-10 text-white pointer-events-none" />

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md flex items-center gap-1.5 uppercase tracking-wider ${catStyle.badge}`}>
                <CatIcon className="w-3 h-3" />
                <span>{item.category}</span>
              </span>

              {isDone ? (
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ACHIEVED</span>
                </div>
              ) : (
                <div className="flex items-center gap-1" title={`${prioStyle.label} Priority`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider ${prioStyle.color} shadow-sm`}>
                    <PrioIcon className="w-2.5 h-2.5" />
                    <span>{prioStyle.label}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Card Content Body */}
          <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className={`font-display font-bold text-base leading-snug text-text transition-colors line-clamp-2 ${
                isDone ? 'line-through text-muted/70 font-normal' : 'group-hover:text-accent'
              }`}>
                {item.title}
              </h4>

              {item.description && (
                <p className="text-xs text-muted/80 line-clamp-2 leading-relaxed font-sans">
                  {item.description}
                </p>
              )}
            </div>

            {/* Steps Progress & Dates Footer */}
            <div className="space-y-3 pt-1">
              {stepsTotal > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted font-medium font-mono">
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-accent" />
                      <span>{stepsDone}/{stepsTotal} steps</span>
                    </span>
                    <span className="font-bold text-text">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden p-0.5 border border-border/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                      className={`h-full bg-gradient-to-r ${catStyle.progress} rounded-full shadow-sm`}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-border/50 font-mono">
                {isDone && item.completedDate ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed {format(parseISO(item.completedDate), 'MMM d, yyyy')}</span>
                  </span>
                ) : item.targetDate ? (
                  <span className="flex items-center gap-1.5 text-muted font-medium">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Target: {format(parseISO(item.targetDate), 'MMM d, yyyy')}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-muted/50 italic">No target date</span>
                )}

                {item.locationName && (
                  <span className="flex items-center gap-1 text-[11px] text-muted truncate max-w-[120px]" title={item.locationName}>
                    <MapPin className="w-3 h-3 text-accent shrink-0" />
                    <span className="truncate">{item.locationName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </HolographicCard>
    </div>
  );
};
