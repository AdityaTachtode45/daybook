import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import NumberFlow from '@number-flow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaMemories } from '../api/memories';
import { AppShell } from '../components/layout/AppShell';
import { MediaGroupDto, MediaAttachment, MediaType } from '../types';
import { HolographicCard } from '../components/3d/HolographicCard';
import { useSound } from '../theme/SoundContext';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Calendar,
  ArrowRight,
  Filter,
  Play,
  Maximize2,
  Film,
  Camera,
  Layers,
  Search,
} from 'lucide-react';

export const MemoriesPage: React.FC = () => {
  const [memories, setMemories] = useState<MediaGroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  const navigate = useNavigate();
  const { playClick, playSwoosh } = useSound();

  useEffect(() => {
    const fetchMemories = async () => {
      setIsLoading(true);
      try {
        const data = await getMediaMemories();
        setMemories(data);
      } catch (err) {
        console.error('Failed to fetch media memories', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemories();
  }, []);

  // Filter memories day-wise
  const filteredMemories = memories
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        const matchesType =
          filterType === 'ALL' ||
          (filterType === 'IMAGE' && item.type === 'IMAGE') ||
          (filterType === 'VIDEO' && item.type === 'VIDEO');

        const matchesQuery =
          !searchQuery.trim() ||
          group.date.includes(searchQuery.trim()) ||
          (group.entryTitle && group.entryTitle.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
          (item.fileName && item.fileName.toLowerCase().includes(searchQuery.trim().toLowerCase()));

        return matchesType && matchesQuery;
      });

      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  // Compute stats
  let totalPhotos = 0;
  let totalVideos = 0;
  memories.forEach((g) => {
    g.items.forEach((item) => {
      if (item.type === 'IMAGE') totalPhotos++;
      if (item.type === 'VIDEO') totalVideos++;
    });
  });

  const handleOpenLightbox = (allPhotos: MediaAttachment[], selectedPhoto: MediaAttachment) => {
    playClick();
    const slides = allPhotos.map((p) => ({ src: p.url }));
    const idx = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
    setLightboxSlides(slides);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  return (
    <AppShell>
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-accent mb-1 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Media Archive & Vault</span>
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text tracking-tight">
              Day-Wise Media Memories
            </h1>
            <p className="text-sm text-muted mt-1 font-sans">
              All your uploaded photos and videos organized by date, newest first.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
            <div className="px-4 py-2 rounded-btn glass-panel border border-border flex items-center gap-2.5 shadow-sm">
              <div className="p-1.5 rounded-md bg-accent/15 text-accent">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted font-mono">Photos</p>
                <p className="font-mono text-base font-extrabold text-text">
                  <NumberFlow value={totalPhotos} />
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-btn glass-panel border border-border flex items-center gap-2.5 shadow-sm">
              <div className="p-1.5 rounded-md bg-sage/15 text-sage">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted font-mono">Videos</p>
                <p className="font-mono text-base font-extrabold text-text">
                  <NumberFlow value={totalVideos} />
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-btn glass-panel border border-border flex items-center gap-2.5 shadow-sm">
              <div className="p-1.5 rounded-md bg-gold/15 text-gold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted font-mono">Days</p>
                <p className="font-mono text-base font-extrabold text-text">
                  <NumberFlow value={memories.length} />
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-panel glass-panel border border-border shadow-sm">
          {/* Type Filter Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClick();
                setFilterType('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-accent text-accent-fg shadow-md'
                  : 'bg-surface-2/60 text-muted hover:text-text'
              }`}
            >
              All Media ({totalPhotos + totalVideos})
            </button>
            <button
              onClick={() => {
                playClick();
                setFilterType('IMAGE');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'IMAGE'
                  ? 'bg-accent text-accent-fg shadow-md'
                  : 'bg-surface-2/60 text-muted hover:text-text'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({totalPhotos})</span>
            </button>
            <button
              onClick={() => {
                playClick();
                setFilterType('VIDEO');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'VIDEO'
                  ? 'bg-accent text-accent-fg shadow-md'
                  : 'bg-surface-2/60 text-muted hover:text-text'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({totalVideos})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by date or title..."
              className="w-full pl-8 pr-3 py-1.5 rounded-btn bg-surface-2/70 border border-border text-xs text-text placeholder-muted focus:outline-none focus:border-accent font-medium"
            />
          </div>
        </div>

        {/* Day-Wise Media Content */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-panel space-y-4 animate-pulse">
                <div className="h-6 bg-surface-2/60 rounded w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="h-36 bg-surface-2/60 rounded-btn" />
                  <div className="h-36 bg-surface-2/60 rounded-btn" />
                  <div className="h-36 bg-surface-2/60 rounded-btn" />
                  <div className="h-36 bg-surface-2/60 rounded-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMemories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 text-center rounded-panel space-y-4 border border-border max-w-md mx-auto shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/15 text-accent mx-auto flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-text">No media uploads found</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {searchQuery || filterType !== 'ALL'
                  ? 'Try adjusting your filters or clearing search query.'
                  : 'Drag and drop photos or videos onto any day entry to build your media vault.'}
              </p>
            </div>
            <Link
              to="/app"
              onClick={playSwoosh}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-xs shadow-md hover:scale-105 transition-all"
            >
              <span>Go to Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {filteredMemories.map((group) => {
              const formattedDate = format(parseISO(group.date), 'EEEE, MMMM d, yyyy');
              const photosInGroup = group.items.filter((i) => i.type === 'IMAGE');

              return (
                <div
                  key={group.date}
                  className="glass-panel p-6 sm:p-8 rounded-panel space-y-5 border border-border/80 shadow-md relative"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-accent/20">
                        {format(parseISO(group.date), 'dd')}
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-text tracking-tight">
                          {formattedDate}
                        </h2>
                        {group.entryTitle && (
                          <p className="text-xs text-muted font-sans italic">"{group.entryTitle}"</p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/day/${group.date}`}
                      onClick={playSwoosh}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline shrink-0"
                    >
                      <span>Open Day Entry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Day Media Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.items.map((item) => (
                      <HolographicCard key={item.id} className="overflow-hidden group">
                        {item.type === 'IMAGE' ? (
                          <div
                            onClick={() => handleOpenLightbox(photosInGroup, item)}
                            className="relative aspect-video sm:aspect-square overflow-hidden cursor-pointer bg-surface-2"
                          >
                            <img
                              src={item.url}
                              alt={item.fileName || 'Photo'}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-6 h-6" />
                            </div>
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-sage" />
                              <span>Photo</span>
                            </span>
                          </div>
                        ) : item.type === 'VIDEO' ? (
                          <div className="relative aspect-video sm:aspect-square bg-black overflow-hidden flex flex-col justify-between p-2">
                            <video
                              src={item.url}
                              controls
                              className="w-full h-full object-cover rounded-btn"
                              preload="metadata"
                            />
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1 pointer-events-none">
                              <Video className="w-3 h-3 text-accent" />
                              <span>Video</span>
                            </span>
                          </div>
                        ) : null}
                      </HolographicCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox for Photos */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </AppShell>
  );
};

export default MemoriesPage;
