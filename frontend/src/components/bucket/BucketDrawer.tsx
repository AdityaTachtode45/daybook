import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import {
  BucketItem,
  BucketCategory,
  BucketPriority,
  BucketStatus,
  BucketStep,
  MediaSignature,
} from '../../types';
import {
  X,
  Upload,
  Calendar,
  MapPin,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  Loader2,
  ListTodo,
  Check,
} from 'lucide-react';
import { getCategoryStyles } from './BucketCard';

interface BucketDrawerProps {
  open: boolean;
  onClose: () => void;
  item: BucketItem | null;
  onSave: (data: Partial<BucketItem>) => Promise<BucketItem | void>;
  onDelete?: (id: number) => Promise<void>;
  onAddStep?: (itemId: number, text: string) => Promise<BucketStep>;
  onUpdateStep?: (stepId: number, done: boolean) => Promise<void>;
  onDeleteStep?: (stepId: number) => Promise<void>;
  onOpenCompleteModal?: (item: BucketItem) => void;
  onReopen?: (id: number) => Promise<void>;
}

const CATEGORIES: { label: string; value: BucketCategory }[] = [
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Learn', value: 'LEARN' },
  { label: 'Career', value: 'CAREER' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Adventure', value: 'ADVENTURE' },
  { label: 'Creative', value: 'CREATIVE' },
  { label: 'Relationships', value: 'RELATIONSHIPS' },
  { label: 'Money', value: 'MONEY' },
  { label: 'Other', value: 'OTHER' },
];

const PRIORITIES: { label: string; value: BucketPriority }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

export const BucketDrawer: React.FC<BucketDrawerProps> = ({
  open,
  onClose,
  item,
  onSave,
  onDelete,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onOpenCompleteModal,
  onReopen,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BucketCategory>('TRAVEL');
  const [priority, setPriority] = useState<BucketPriority>('MEDIUM');
  const [status, setStatus] = useState<BucketStatus>('DREAMING');
  const [targetDate, setTargetDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPublicId, setCoverPublicId] = useState<string | null>(null);

  const [steps, setSteps] = useState<BucketStep[]>([]);
  const [newStepText, setNewStepText] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lastToggledStepId, setLastToggledStepId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCategory(item.category || 'TRAVEL');
      setPriority(item.priority || 'MEDIUM');
      setStatus(item.status || 'DREAMING');
      setTargetDate(item.targetDate || '');
      setLocationName(item.locationName || '');
      setCoverUrl(item.coverUrl || null);
      setCoverPublicId(item.coverPublicId || null);
      setSteps(item.steps || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('TRAVEL');
      setPriority('MEDIUM');
      setStatus('DREAMING');
      setTargetDate('');
      setLocationName('');
      setCoverUrl(null);
      setCoverPublicId(null);
      setSteps([]);
    }
    setError(null);
    setConfirmDelete(false);
  }, [item, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Image file must not exceed 25MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const sigRes = await api.get<MediaSignature>('/media/signature?type=image');
      const sigData = sigRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;

      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      setCoverUrl(uploadRes.data.secure_url);
      setCoverPublicId(uploadRes.data.public_id);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload cover image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    if (steps.length >= 30) {
      setError('Maximum 30 steps per item allowed');
      return;
    }

    if (item && onAddStep) {
      try {
        const added = await onAddStep(item.id, newStepText.trim());
        setSteps((prev) => [...prev, added]);
        setNewStepText('');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to add step');
      }
    } else {
      const tempStep: BucketStep = {
        id: Date.now(),
        itemId: 0,
        text: newStepText.trim(),
        done: false,
        sortOrder: steps.length,
        createdAt: new Date().toISOString(),
      };
      setSteps((prev) => [...prev, tempStep]);
      setNewStepText('');
    }
  };

  const handleToggleStep = async (stepId: number, currentDone: boolean) => {
    const newDone = !currentDone;
    setLastToggledStepId(stepId);
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, done: newDone } : s)));

    if (item && onUpdateStep) {
      try {
        await onUpdateStep(stepId, newDone);
        if (!currentDone && status === 'DREAMING') {
          setStatus('IN_PROGRESS');
        }
      } catch (err: any) {
        setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, done: currentDone } : s)));
      }
    }
  };

  const handleDeleteStepClick = async (stepId: number) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));

    if (item && onDeleteStep) {
      try {
        await onDeleteStep(stepId);
      } catch (err) {}
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        status,
        targetDate: targetDate || null,
        locationName: locationName.trim() || null,
        coverUrl,
        coverPublicId,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save dream item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!item || !onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(item.id);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Drawer Slide Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-screen max-w-lg bg-surface border-l border-border flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold shadow-inner">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-text">
                      {item ? 'Edit Dream Goal' : 'Create New Dream'}
                    </h3>
                    <p className="text-xs text-muted">Craft your ambition with detail and passion.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-btn text-muted hover:text-text hover:bg-surface-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-btn bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Cover Image Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Cover Memory / Vision Photo
                  </label>
                  {coverUrl ? (
                    <div className="relative w-full h-44 rounded-panel overflow-hidden border border-border group shadow-md">
                      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-btn bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverUrl(null);
                            setCoverPublicId(null);
                          }}
                          className="px-3.5 py-2 rounded-btn bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-border hover:border-accent/60 rounded-panel flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-2/30 hover:bg-surface-2/70 transition-all text-muted hover:text-text group"
                    >
                      <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold">Upload vision photo</span>
                      <span className="text-[10px] text-muted">Supports JPG, PNG up to 25MB</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="p-3.5 rounded-btn bg-surface-2 border border-border space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted font-medium">
                        <span>Uploading directly to Cloudinary...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Dream Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Witness the Northern Lights in Lapland"
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-btn bg-surface-2 border border-border text-text font-display font-bold text-base focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Category & Priority Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BucketCategory)}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm font-semibold focus:outline-none focus:border-accent transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as BucketPriority)}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm font-semibold focus:outline-none focus:border-accent transition-colors"
                    >
                      {PRIORITIES.map((prio) => (
                        <option key={prio.value} value={prio.value}>
                          {prio.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Date & Location Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>Target Date</span>
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>Location</span>
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Rovaniemi, Finland"
                      maxLength={200}
                      className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm font-medium focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Description & Personal Meaning
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why does this dream matter to you? Capture your thoughts, research, and vision..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-text text-sm font-sans focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                {/* Sub-steps Checklist Section */}
                <div className="space-y-3.5 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4 text-accent" />
                      <span>Action Steps ({steps.filter((s) => s.done).length}/{steps.length})</span>
                    </label>
                  </div>

                  {/* List Steps with Animated Tactile Checkbox */}
                  <div className="space-y-2">
                    {steps.map((step) => (
                      <motion.div
                        key={step.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-btn bg-surface-2 border border-border/70 group hover:border-accent/40 transition-colors"
                      >
                        <div
                          onClick={() => handleToggleStep(step.id, step.done)}
                          className="flex items-center gap-3 flex-1 cursor-pointer min-w-0 pr-2 select-none"
                        >
                          <motion.div
                            animate={
                              step.id === lastToggledStepId && step.done
                                ? { scale: [1, 1.3, 1] }
                                : { scale: 1 }
                            }
                            transition={{ duration: 0.25 }}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              step.done
                                ? 'bg-accent border-accent text-accent-fg shadow-sm'
                                : 'border-border bg-surface group-hover:border-accent/50'
                            }`}
                          >
                            {step.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </motion.div>

                          <span
                            className={`text-xs font-medium transition-all truncate ${
                              step.done ? 'line-through text-muted/70' : 'text-text'
                            }`}
                          >
                            {step.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteStepClick(step.id)}
                          className="p-1 text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Step Input */}
                  <form onSubmit={handleAddStepSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      placeholder="Add step (e.g. Save $500, Book flights...)"
                      maxLength={300}
                      className="flex-1 px-3.5 py-2.5 rounded-btn bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-accent transition-colors font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!newStepText.trim()}
                      className="px-4 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-xs disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 border-t border-border bg-surface/90 backdrop-blur-md shrink-0 flex items-center justify-between gap-3">
                {item && onDelete ? (
                  confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDeleteItem}
                        className="px-3.5 py-2 rounded-btn bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors shadow-md"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-2 rounded-btn bg-surface-2 text-muted text-xs hover:text-text transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="p-2.5 rounded-btn text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  {item && item.status !== 'DONE' && onOpenCompleteModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCompleteModal(item);
                      }}
                      className="px-4 py-2.5 rounded-btn bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Fulfill Dream</span>
                    </button>
                  )}

                  {item && item.status === 'DONE' && onReopen && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onReopen(item.id);
                        onClose();
                      }}
                      className="px-4 py-2.5 rounded-btn bg-surface-2 text-text border border-border hover:bg-surface-2/80 font-bold text-xs transition-colors"
                    >
                      Reopen Dream
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving || !title.trim()}
                    className="px-6 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Goal</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
