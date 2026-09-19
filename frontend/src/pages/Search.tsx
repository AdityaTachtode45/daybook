import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { AppShell } from '../components/layout/AppShell';
import { TagChips } from '../components/ui/TagChips';
import { MoodIcon } from '../components/ui/MoodIcons';
import { SearchResponse, SearchResult, Tag, MoodType } from '../types';
import { useSound } from '../theme/SoundContext';
import { HolographicCard } from '../components/3d/HolographicCard';
import {
  Search as SearchIcon,
  Filter,
  X,
  Video,
  Image as ImageIcon,
  FileText,
  Sparkles,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playClick, playSwoosh } = useSound();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryParam = searchParams.get('q') || '';
  const tagsParam = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [];
  const moodParam = (searchParams.get('mood') as MoodType) || null;
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const hasVideoParam = searchParams.get('hasVideo') === 'true';
  const hasPhotoParam = searchParams.get('hasPhoto') === 'true';
  const hasFileParam = searchParams.get('hasFile') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';

  const [q, setQ] = useState(queryParam);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get<Tag[]>('/tags');
        setAvailableTags(res.data);
      } catch (err) {
        console.error('Failed to fetch tags for search', err);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (q.trim()) params.set('q', q.trim());
      else params.delete('q');
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(timeout);
  }, [q]);

  const executeSearch = async (targetPage: number = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryParam) params.set('q', queryParam);
      if (tagsParam.length > 0) params.set('tags', tagsParam.join(','));
      if (moodParam) params.set('mood', moodParam);
      if (fromParam) params.set('from', fromParam);
      if (toParam) params.set('to', toParam);
      if (hasVideoParam) params.set('hasVideo', 'true');
      if (hasPhotoParam) params.set('hasPhoto', 'true');
      if (hasFileParam) params.set('hasFile', 'true');
      params.set('sort', sortParam);
      params.set('page', targetPage.toString());
      params.set('size', '15');

      const res = await api.get<SearchResponse>(`/search?${params.toString()}`);

      if (targetPage === 0) {
        setResults(res.data.content);
      } else {
        setResults((prev) => [...prev, ...res.data.content]);
      }
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(0);
  }, [searchParams]);

  const updateParam = (key: string, value: string | null) => {
    playClick();
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const toggleTagFilter = (tagName: string) => {
    playClick();
    const current = [...tagsParam];
    const idx = current.indexOf(tagName);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(tagName);
    updateParam('tags', current.length > 0 ? current.join(',') : null);
  };

  const clearAllFilters = () => {
    playClick();
    setQ('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters =
    queryParam || tagsParam.length > 0 || moodParam || fromParam || toParam || hasVideoParam || hasPhotoParam || hasFileParam;

  return (
    <AppShell>
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-accent mb-1 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Search & Discovery</span>
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text tracking-tight">
            Search Your Journal
          </h1>
        </div>

        {/* Big Search Input */}
        <div className="relative glass-panel p-2 shadow-xl rounded-panel border border-border">
          <div className="flex items-center px-3">
            <SearchIcon className="w-5 h-5 text-accent mr-3 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search entries, keywords, or full text... (Press '/' to focus)"
              className="w-full py-3 bg-transparent text-text placeholder-muted text-base focus:outline-none font-sans"
            />
            {q && (
              <button onClick={() => setQ('')} className="p-1 text-muted hover:text-text">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block ml-3 px-2 py-1 text-xs font-mono text-muted bg-surface-2 border border-border rounded">
              /
            </kbd>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-5 space-y-4 shadow-md border border-border rounded-panel">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2 font-mono">
              <Filter className="w-4 h-4 text-accent" />
              <span>Filters</span>
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-500 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Tags Multi-Select Chips */}
          {availableTags.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase text-muted block mb-2 font-mono">Filter by Tag:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableTags.map((tag) => {
                  const isSelected = tagsParam.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.name)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-accent text-accent-fg border-accent shadow-sm'
                          : 'bg-surface-2/60 border-border text-muted hover:text-text'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? 'currentColor' : tag.color || 'var(--accent)' }}
                      />
                      <span>#{tag.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mood & Media Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/50 font-mono text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase text-muted block mb-1.5 font-mono">Mood:</span>
              <div className="flex items-center gap-1">
                {(['GREAT', 'GOOD', 'OKAY', 'LOW', 'BAD'] as MoodType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => updateParam('mood', moodParam === m ? null : m)}
                    className={`p-1.5 rounded-btn border transition-all ${
                      moodParam === m ? 'bg-accent/20 border-accent text-accent' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                    }`}
                    title={m}
                  >
                    <MoodIcon mood={m} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-muted block mb-1.5 font-mono">Media Attachments:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateParam('hasVideo', hasVideoParam ? null : 'true')}
                  className={`p-1.5 px-2.5 rounded-btn text-xs font-medium border transition-all flex items-center gap-1 ${
                    hasVideoParam ? 'bg-accent text-accent-fg border-accent' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => updateParam('hasPhoto', hasPhotoParam ? null : 'true')}
                  className={`p-1.5 px-2.5 rounded-btn text-xs font-medium border transition-all flex items-center gap-1 ${
                    hasPhotoParam ? 'bg-accent text-accent-fg border-accent' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photos</span>
                </button>
                <button
                  onClick={() => updateParam('hasFile', hasFileParam ? null : 'true')}
                  className={`p-1.5 px-2.5 rounded-btn text-xs font-medium border transition-all flex items-center gap-1 ${
                    hasFileParam ? 'bg-accent text-accent-fg border-accent' : 'bg-surface-2/60 border-border text-muted hover:text-text'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Files</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-muted block mb-1.5 font-mono">Sort Order:</span>
              <select
                value={sortParam}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full px-3 py-1.5 rounded-btn bg-surface-2/60 border border-border text-text text-xs focus:outline-none focus:border-accent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Found <strong className="text-text font-bold font-mono">{totalElements}</strong> matching entries</span>
        </div>

        {/* Results List */}
        {isLoading && page === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-card animate-pulse space-y-3">
                <div className="h-6 bg-surface-2/60 rounded w-48" />
                <div className="h-4 bg-surface-2/60 rounded w-full" />
                <div className="h-4 bg-surface-2/60 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="glass-panel p-12 text-center text-muted space-y-3 rounded-panel border border-border">
            <div className="w-12 h-12 rounded-full bg-surface-2/60 border border-border mx-auto flex items-center justify-center font-display text-xl text-accent">
              🔍
            </div>
            <h3 className="font-display text-lg font-bold text-text">Nothing matches your search</h3>
            <p className="text-xs max-w-sm mx-auto">
              Try typing different keywords or clearing tag/mood filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res) => (
              <HolographicCard key={res.entryDate} className="p-6 cursor-pointer">
                <div
                  onClick={() => {
                    playSwoosh();
                    navigate(`/day/${res.entryDate}`);
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-bold text-text group-hover:text-accent transition-colors">
                        {format(new Date(res.entryDate), 'EEEE, MMMM d, yyyy')}
                      </span>
                      {res.mood && <MoodIcon mood={res.mood} size={20} />}
                    </div>

                    <span className="text-xs font-mono text-muted">{res.entryDate}</span>
                  </div>

                  {res.title && (
                    <h4 className="font-display text-base font-bold text-text">{res.title}</h4>
                  )}

                  {res.snippet && (
                    <p
                      className="text-sm text-muted leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: res.snippet }}
                    />
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <TagChips tags={res.tags} clickable={false} size="sm" />

                    <div className="flex items-center gap-3 text-xs text-muted font-mono">
                      {res.mediaCounts.videos > 0 && (
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-accent" /> {res.mediaCounts.videos}
                        </span>
                      )}
                      {res.mediaCounts.photos > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-sage" /> {res.mediaCounts.photos}
                        </span>
                      )}
                      {res.mediaCounts.files > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-gold" /> {res.mediaCounts.files}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </HolographicCard>
            ))}

            {page + 1 < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={() => executeSearch(page + 1)}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-btn bg-surface-2/60 border border-border text-text text-xs font-bold hover:border-accent transition-all"
                >
                  {isLoading ? 'Loading more...' : 'Load More Results'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </AppShell>
  );
};

export { SearchPage as Search };
