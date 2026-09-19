import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { format } from 'date-fns';
import api from '../../api/axios';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { SearchResult, Tag, BucketItem } from '../../types';
import { getBucketItems } from '../../api/bucket';
import { TagChips } from './TagChips';
import { Calendar, Flame, User, Sun, Moon, Laptop, LogOut, Search, BookOpen, Clock, Tag as TagIcon, FileText, Compass, Plus, Sparkles, Camera } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { logout } = useAuth();

  const [query, setQuery] = useState('');
  const [matchingEntries, setMatchingEntries] = useState<SearchResult[]>([]);
  const [matchingBucketItems, setMatchingBucketItems] = useState<BucketItem[]>([]);
  const [matchingTags, setMatchingTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Fetch all user tags on open
  useEffect(() => {
    if (open) {
      api.get<Tag[]>('/tags').then((res) => setAllTags(res.data)).catch(() => {});
    }
  }, [open]);

  // Debounced search when typing
  useEffect(() => {
    if (!query.trim()) {
      setMatchingEntries([]);
      setMatchingBucketItems([]);
      setMatchingTags([]);
      return;
    }

    const trimmed = query.trim().toLowerCase();
    const filteredTags = allTags.filter((t) => t.name.toLowerCase().includes(trimmed)).slice(0, 5);
    setMatchingTags(filteredTags);

    const timer = setTimeout(async () => {
      try {
        const [entriesRes, bucketRes] = await Promise.all([
          api.get<{ content: SearchResult[] }>('/search', {
            params: { q: trimmed, size: 5 },
          }),
          getBucketItems({ q: trimmed }),
        ]);
        setMatchingEntries(entriesRes.data.content || []);
        setMatchingBucketItems((bucketRes || []).slice(0, 5));
      } catch (err) {
        setMatchingEntries([]);
        setMatchingBucketItems([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, allTags]);

  if (!open) return null;

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-surface border border-border rounded-panel shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted shrink-0 mr-3" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search entries, bucket list, tags, or commands..."
              className="w-full py-3.5 bg-transparent text-text placeholder-muted text-sm focus:outline-none font-sans"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="p-4 text-center text-xs text-muted">
              No matching entries, dreams, tags, or commands found.
            </Command.Empty>

            {/* Top Matching Entries */}
            {matchingEntries.length > 0 && (
              <Command.Group heading="Matching Entries" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1">
                {matchingEntries.map((entry) => (
                  <Command.Item
                    key={entry.entryDate}
                    onSelect={() => runCommand(() => navigate(`/day/${entry.entryDate}`))}
                    className="flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-accent shrink-0" />
                      <span className="font-semibold truncate">{entry.title || 'Untitled Entry'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted shrink-0 ml-2">{entry.entryDate}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Top Matching Bucket List Items */}
            {matchingBucketItems.length > 0 && (
              <Command.Group heading="Matching Bucket Items" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1 mt-2">
                {matchingBucketItems.map((item) => (
                  <Command.Item
                    key={item.id}
                    onSelect={() => runCommand(() => navigate('/bucket'))}
                    className="flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Compass className="w-4 h-4 text-accent shrink-0" />
                      <span className="font-semibold truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-accent shrink-0 ml-2">{item.category}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Top Matching Tags */}
            {matchingTags.length > 0 && (
              <Command.Group heading="Matching Tags" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1 mt-2">
                {matchingTags.map((t) => (
                  <Command.Item
                    key={t.id}
                    onSelect={() => runCommand(() => navigate(`/search?tags=${encodeURIComponent(t.name)}`))}
                    className="flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <TagChips tags={t} size="sm" clickable={false} />
                      <span className="text-muted text-[10px]">({t.usageCount || 0} entries)</span>
                    </div>
                    <span className="text-[10px] text-accent font-semibold">View search →</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Navigation" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => navigate(`/day/${todayStr}`))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4 text-accent" />
                <span>Go to Today ({todayStr})</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/memories'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4 text-accent" />
                <span>Memories & Media Gallery</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/bucket'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4 text-accent" />
                <span>Bucket List</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/bucket?action=new'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>New Dream Item</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/search'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Search className="w-4 h-4 text-accent" />
                <span>Open Advanced Search</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/app'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4 text-accent" />
                <span>Calendar Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/streaks'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Flame className="w-4 h-4 text-gold" />
                <span>Writing Streaks & Heatmap</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/profile'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-sage" />
                <span>Profile & Settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Appearance" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => runCommand(() => setTheme('light'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Sun className="w-4 h-4 text-gold" />
                <span>Switch to Light Theme (Paper)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => setTheme('dark'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Moon className="w-4 h-4 text-accent" />
                <span>Switch to Dark Theme (Ink)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => setTheme('system'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-text hover:bg-surface-2 hover:text-accent cursor-pointer transition-colors"
              >
                <Laptop className="w-4 h-4 text-muted" />
                <span>Use System Preference</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Account" className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => runCommand(async () => {
                  await logout();
                  navigate('/login');
                })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-xs font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2 border-t border-border bg-surface-2 text-[10px] text-muted flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, ESC to close</span>
            <span className="font-mono">Daybook v1.0</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
