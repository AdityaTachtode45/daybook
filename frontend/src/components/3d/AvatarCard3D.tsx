import React from 'react';
import { HolographicCard } from './HolographicCard';
import { User, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface AvatarCard3DProps {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  streakCount?: number;
  totalEntries?: number;
}

export const AvatarCard3D: React.FC<AvatarCard3DProps> = ({
  displayName,
  email,
  avatarUrl,
  streakCount = 0,
  totalEntries = 0,
}) => {
  return (
    <HolographicCard className="p-8 max-w-md w-full mx-auto" glowColor="rgba(255, 138, 76, 0.45)">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar Ring */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent via-gold to-sage blur opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-surface bg-surface-2 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-accent" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-accent text-accent-fg rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-text flex items-center justify-center gap-2">
            <span>{displayName || 'Diary Writer'}</span>
            <Sparkles className="w-4 h-4 text-gold animate-bounce" />
          </h2>
          <p className="text-xs text-muted font-mono">{email || 'writer@daybook.app'}</p>
        </div>

        {/* Stats Pills */}
        <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-border/60">
          <div className="p-3 rounded-btn bg-surface-2/60 border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-accent text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Streak</span>
            </div>
            <p className="font-mono text-xl font-bold text-text">{streakCount} Days</p>
          </div>
          <div className="p-3 rounded-btn bg-surface-2/60 border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-sage text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Memories</span>
            </div>
            <p className="font-mono text-xl font-bold text-text">{totalEntries} Saved</p>
          </div>
        </div>
      </div>
    </HolographicCard>
  );
};
