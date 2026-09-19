import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, addDays, subDays, isFuture, isToday } from 'date-fns';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import api from '../api/axios';
import { getBucketItemsByDate, getBucketItems, completeBucketItem } from '../api/bucket';
import { AppShell } from '../components/layout/AppShell';
import { EditorialEditor } from '../components/diary/EditorialEditor';
import { EditorialMoodSelector } from '../components/diary/EditorialMoodSelector';
import { TagInput } from '../components/diary/TagInput';
import { PhotoGalleryLightbox } from '../components/media/PhotoGalleryLightbox';
import { VideoList } from '../components/media/VideoList';
import { DocumentList } from '../components/media/DocumentList';
import { BucketDrawer } from '../components/bucket/BucketDrawer';
import { BucketCard, getCategoryStyles } from '../components/bucket/BucketCard';
import {
  DiaryEntry,
  MediaAttachment,
  MediaSignature,
  MediaType,
  MoodType,
  Tag,
  BucketByDateItem,
  BucketItem,
} from '../types';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Maximize2,
  Minimize2,
  Clock,
  UploadCloud,
  FileText,
  Sparkles,
  Compass,
  Trophy,
  Plus,
  X,
} from 'lucide-react';

export const Day: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [completedBucketItems, setCompletedBucketItems] = useState<BucketByDateItem[]>([]);

  // Complete Bucket Item on this Date Dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [availableBucketItems, setAvailableBucketItems] = useState<BucketItem[]>([]);
  const [selectedItemToComplete, setSelectedItemToComplete] = useState<number | null>(null);
  const [completeNote, setCompleteNote] = useState('');

  // Item Drawer for viewing full bucket item details
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<BucketItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const targetDate = date ? parseISO(date) : new Date();
  const formattedDateStr = date || format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = isFuture(targetDate) && !isToday(targetDate);

  // Focus Mode shortcut ('F' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable') === 'true') {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Entry Data & Completed Bucket Items for Date
  const fetchEntry = async () => {
    if (!date) return;
    setIsLoading(true);
    try {
      const [entryRes, bucketRes] = await Promise.all([
        api.get<DiaryEntry>(`/entries/${date}`).catch(() => null),
        getBucketItemsByDate(date).catch(() => []),
      ]);

      if (entryRes) {
        setTitle(entryRes.data.title || '');
        setContent(entryRes.data.content || '');
        setMood(entryRes.data.mood || null);
        setTags(entryRes.data.tags || []);
        setAttachments(entryRes.data.attachments || []);
      } else {
        setTitle('');
        setContent('');
        setMood(null);
        setTags([]);
        setAttachments([]);
      }

      setCompletedBucketItems(bucketRes || []);
    } catch (err: any) {
      // Handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, [date]);

  // Open "Complete Bucket Item on Date" dialog
  const handleOpenCompleteDialog = async () => {
    try {
      const dreamingRes = await getBucketItems({ status: 'DREAMING' });
      const inProgressRes = await getBucketItems({ status: 'IN_PROGRESS' });
      const allCandidates = [...inProgressRes, ...dreamingRes];
      setAvailableBucketItems(allCandidates);
      if (allCandidates.length > 0) {
        setSelectedItemToComplete(allCandidates[0].id);
      }
      setCompleteNote('');
      setCompleteDialogOpen(true);
    } catch (err) {
      toast.error('Failed to load bucket items');
    }
  };

  const handleConfirmCompleteOnDate = async () => {
    if (!selectedItemToComplete || !date) return;
    try {
      await completeBucketItem(selectedItemToComplete, { date, note: completeNote.trim() });
      toast.success('Bucket item completed on this date!');
      setCompleteDialogOpen(false);
      fetchEntry();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to complete bucket item');
    }
  };

  // Debounced Autosave
  const saveEntry = async (newTitle: string, newContent: string, newMood: MoodType | null, newTags: Tag[]) => {
    if (!date || isFutureDate) return;
    setIsSaving(true);
    try {
      await api.put(`/entries/${date}`, {
        title: newTitle,
        content: newContent,
        mood: newMood,
        tags: newTags.map((t) => t.name),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to autosave entry', err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isLoading || isFutureDate) return;
    const timeout = setTimeout(() => {
      saveEntry(title, content, mood, tags);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, content, mood, tags]);

  const handlePrevDay = () => {
    const prev = format(subDays(targetDate, 1), 'yyyy-MM-dd');
    navigate(`/day/${prev}`);
  };

  const handleNextDay = () => {
    const next = format(addDays(targetDate, 1), 'yyyy-MM-dd');
    navigate(`/day/${next}`);
  };

  // Delete Entry with 5s Undo Toast
  const handleDeleteEntry = async () => {
    if (!date) return;
    const oldTitle = title;
    const oldContent = content;
    const oldMood = mood;
    const oldTags = tags;

    // Optimistically clear
    setTitle('');
    setContent('');
    setMood(null);
    setTags([]);

    toast('Entry deleted', {
      description: 'You can restore this entry within 5 seconds.',
      action: {
        label: 'Undo',
        onClick: async () => {
          setTitle(oldTitle);
          setContent(oldContent);
          setMood(oldMood);
          setTags(oldTags);
          await saveEntry(oldTitle, oldContent, oldMood, oldTags);
          toast.success('Entry restored!');
        },
      },
      onAutoClose: async () => {
        try {
          await api.delete(`/entries/${date}`);
        } catch (e) {}
      },
    });
  };

  // Global React Dropzone Upload Integration
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isFutureDate || !date) return;

      for (const file of acceptedFiles) {
        let mediaType: MediaType = 'OTHER';
        if (file.type.startsWith('video/')) mediaType = 'VIDEO';
        else if (file.type.startsWith('image/')) mediaType = 'IMAGE';
        else if (file.type.includes('pdf') || file.type.includes('doc') || file.type.includes('text')) mediaType = 'DOCUMENT';

        const resourceTypeParam = mediaType === 'VIDEO' ? 'video' : mediaType === 'IMAGE' ? 'image' : 'raw';

        try {
          const sigRes = await api.get<MediaSignature>(`/media/signature?type=${resourceTypeParam}`);
          const sigData = sigRes.data;

          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', sigData.timestamp.toString());
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);

          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceTypeParam}/upload`;

          const uploadRes = await axios.post(cloudinaryUrl, formData);
          const cloudinaryData = uploadRes.data;

          const attachmentRes = await api.post<MediaAttachment>(`/entries/${date}/media`, {
            url: cloudinaryData.secure_url,
            publicId: cloudinaryData.public_id,
            resourceType: resourceTypeParam,
            type: mediaType,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          });

          setAttachments((prev) => [...prev, attachmentRes.data]);
          toast.success(`Attached ${file.name}`);
        } catch (err) {
          console.error('File drop failed', err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [date, isFutureDate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    disabled: isFutureDate,
  });

  const handleMediaDelete = async (mediaId: number) => {
    try {
      await api.delete(`/media/${mediaId}`);
      setAttachments((prev) => prev.filter((a) => a.id !== mediaId));
      toast.success('Attachment removed');
    } catch (err) {
      toast.error('Failed to remove attachment');
    }
  };

  const videos = attachments.filter((a) => a.type === 'VIDEO');
  const photos = attachments.filter((a) => a.type === 'IMAGE');
  const documents = attachments.filter((a) => a.type === 'DOCUMENT' || a.type === 'OTHER');

  const isEmpty = !title && (!content || content === '<p></p>') && attachments.length === 0;

  return (
    <AppShell>
      <div {...getRootProps()} className="relative flex-1 flex flex-col">
        <input {...getInputProps()} />

        {/* Global Drag & Drop Overlay */}
        {isDragActive && (
          <div className="fixed inset-0 z-50 bg-accent/90 backdrop-blur-md flex flex-col items-center justify-center text-accent-fg p-8 text-center animate-in fade-in">
            <UploadCloud className="w-16 h-16 mb-4 animate-bounce" />
            <h2 className="font-display text-3xl font-bold">Drop files to attach</h2>
            <p className="text-sm mt-2">Videos, photos, and documents will be automatically sorted.</p>
          </div>
        )}

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to="/app" className="text-xs text-muted hover:text-accent font-semibold flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </Link>
                <span className="text-muted">•</span>
                <span className="text-xs font-mono text-muted">{formattedDateStr}</span>
              </div>

              {/* Huge Fraunces Date Header */}
              <h1 className="font-display text-3xl sm:text-5xl font-black text-text tracking-tight">
                {format(targetDate, 'EEEE, MMMM d, yyyy')}
              </h1>

              {/* Autosave Status */}
              <div className="mt-2 text-xs">
                {isSaving ? (
                  <span className="text-accent flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="text-sage flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved just now
                  </span>
                ) : (
                  <span className="text-muted">Auto-saves as you type</span>
                )}
              </div>
            </div>

            {/* Prev / Next Date Controls & Bucket List Action Button */}
            <div className="flex items-center gap-2">
              {!isFutureDate && (
                <button
                  onClick={handleOpenCompleteDialog}
                  className="px-3.5 py-2.5 rounded-btn bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Mark bucket item achieved on this date"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Achieved Goal</span>
                </button>
              )}

              <button
                onClick={handlePrevDay}
                className="p-2.5 rounded-btn bg-surface border border-border text-text hover:border-accent transition-colors"
                title="Previous Day (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextDay}
                className="p-2.5 rounded-btn bg-surface border border-border text-text hover:border-accent transition-colors"
                title="Next Day (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2.5 rounded-btn border transition-colors ${
                  focusMode ? 'bg-accent text-accent-fg border-accent' : 'bg-surface border-border text-muted hover:text-text'
                }`}
                title="Toggle Focus Mode (F)"
              >
                {focusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>

              <button
                onClick={handleDeleteEntry}
                className="p-2.5 rounded-btn bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Layout: Writing Surface Left, Media & Bucket Rail Right */}
          <div className={`grid grid-cols-1 ${focusMode ? 'max-w-2xl mx-auto' : 'lg:grid-cols-3'} gap-8`}>
            {/* Left Writing Surface (~68ch width) */}
            <div className={`${focusMode ? 'w-full' : 'lg:col-span-2'} journal-panel p-6 sm:p-10 space-y-6 shadow-sm`}>
              {/* Title Input */}
              <input
                type="text"
                disabled={isFutureDate}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title for today's entry..."
                className="w-full bg-transparent font-display text-2xl sm:text-4xl font-bold text-text placeholder-muted focus:outline-none border-b border-border pb-3"
              />

              {/* Tag Chips Input */}
              <TagInput tags={tags} onChange={setTags} disabled={isFutureDate} />

              {/* Mood Selector */}
              <EditorialMoodSelector
                selectedMood={mood}
                onSelectMood={(m) => !isFutureDate && setMood(m)}
                disabled={isFutureDate}
              />

              {/* TipTap Editorial Editor */}
              <EditorialEditor content={content} onChange={setContent} readOnly={isFutureDate} />

              {/* Warm Empty State Illustration */}
              {isEmpty && !isFutureDate && (
                <div className="pt-12 text-center text-muted space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface-2 border border-border mx-auto flex items-center justify-center font-display text-xl text-accent">
                    ✍️
                  </div>
                  <p className="font-display text-lg font-semibold text-text">Nothing written here yet.</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Start typing your thoughts, select your mood, or drag & drop photos and videos onto this page.
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel: Bucket Achievements & Media Rail */}
            {!focusMode && (
              <div className="space-y-6">
                {/* Achieved Today Bucket List Section */}
                {completedBucketItems.length > 0 && (
                  <div className="journal-panel p-5 space-y-4 border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Trophy className="w-4 h-4" />
                      <span>Achieved Today</span>
                    </div>

                    <div className="space-y-3">
                      {completedBucketItems.map((bItem) => {
                        const catStyle = getCategoryStyles(bItem.category);
                        return (
                          <div
                            key={bItem.id}
                            onClick={async () => {
                              try {
                                const fullRes = await api.get<BucketItem>(`/bucket/${bItem.id}`);
                                setSelectedDrawerItem(fullRes.data);
                                setDrawerOpen(true);
                              } catch (e) {}
                            }}
                            className="p-3 rounded-btn bg-surface border border-border hover:border-emerald-500/50 cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${catStyle.badge}`}>
                                {bItem.category}
                              </span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>

                            <div className="flex items-center gap-3">
                              {bItem.coverUrl && (
                                <img
                                  src={bItem.coverUrl}
                                  alt={bItem.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-xs text-text group-hover:text-accent transition-colors line-clamp-1">
                                  {bItem.title}
                                </h4>
                                {bItem.completedNote && (
                                  <p className="text-[11px] text-muted italic line-clamp-2 mt-0.5">
                                    "{bItem.completedNote}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Attachments Section */}
                <div className="journal-panel p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h3 className="font-display text-lg font-bold text-text">Attachments</h3>
                    <span className="text-xs font-mono text-muted">{attachments.length} files</span>
                  </div>

                  {/* Dropzone trigger button */}
                  {!isFutureDate && (
                    <div className="p-4 rounded-btn border border-dashed border-border hover:border-accent text-center bg-surface-2/40 transition-colors">
                      <UploadCloud className="w-5 h-5 text-accent mx-auto mb-2" />
                      <p className="text-xs font-semibold text-text">Drag & drop files anywhere</p>
                      <p className="text-[10px] text-muted mt-0.5">Videos, photos, documents</p>
                    </div>
                  )}

                  {/* Media Lists */}
                  <VideoList videos={videos} onDelete={handleMediaDelete} readOnly={isFutureDate} />
                  <PhotoGalleryLightbox photos={photos} onDelete={handleMediaDelete} readOnly={isFutureDate} />
                  <DocumentList documents={documents} onDelete={handleMediaDelete} readOnly={isFutureDate} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Complete Bucket Item on this Date Dialog */}
      {completeDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-panel max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Trophy className="w-4 h-4" />
                <span>Complete Goal on {formattedDateStr}</span>
              </div>
              <button onClick={() => setCompleteDialogOpen(false)} className="text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {availableBucketItems.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-muted">No active (Dreaming or In progress) bucket items found.</p>
                <button
                  onClick={() => {
                    setCompleteDialogOpen(false);
                    navigate('/bucket?action=new');
                  }}
                  className="px-4 py-2 rounded-btn bg-accent text-accent-fg font-semibold text-xs"
                >
                  Create New Dream Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                    Select Dream Goal
                  </label>
                  <select
                    value={selectedItemToComplete || ''}
                    onChange={(e) => setSelectedItemToComplete(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm focus:outline-none focus:border-accent"
                  >
                    {availableBucketItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.category}] {item.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                    Completion Note (Optional)
                  </label>
                  <textarea
                    value={completeNote}
                    onChange={(e) => setCompleteNote(e.target.value)}
                    placeholder="How did it feel achieving this goal today?"
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setCompleteDialogOpen(false)}
                    className="px-4 py-2 rounded-btn bg-surface-2 text-muted text-xs font-semibold hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCompleteOnDate}
                    className="px-5 py-2 rounded-btn bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fulfill on this Date</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Drawer for viewing full details */}
      <BucketDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        item={selectedDrawerItem}
        onSave={async () => {}}
      />
    </AppShell>
  );
};
