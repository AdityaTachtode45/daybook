import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import NumberFlow from '@number-flow/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { AppShell } from '../components/layout/AppShell';
import {
  getBucketItems,
  createBucketItem,
  updateBucketItem,
  deleteBucketItem,
  reorderBucketItems,
  completeBucketItem,
  reopenBucketItem,
  addBucketStep,
  updateBucketStep,
  deleteBucketStep,
  getBucketStats,
} from '../api/bucket';
import {
  BucketItem,
  BucketCategory,
  BucketStatus,
  BucketStep,
  BucketStats,
  BucketReorderItem,
} from '../types';
import { BucketCard } from '../components/bucket/BucketCard';
import { BucketDrawer } from '../components/bucket/BucketDrawer';
import { BucketCompleteModal } from '../components/bucket/BucketCompleteModal';
import { BucketNeedIdeasModal } from '../components/bucket/BucketNeedIdeasModal';
import { BucketSuggestion } from '../data/bucketSuggestions';
import {
  Sparkles,
  Plus,
  LayoutGrid,
  Columns3,
  Search,
  Lightbulb,
  CheckCircle2,
  Trophy,
  Flame,
  Compass,
  Loader2,
  Target,
  Layers,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES: { label: string; value: 'ALL' | BucketCategory }[] = [
  { label: 'All Categories', value: 'ALL' },
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

const COLUMNS: { id: BucketStatus; title: string; subtitle: string; color: string; glow: string }[] = [
  {
    id: 'DREAMING',
    title: 'Dreaming',
    subtitle: 'Wishes waiting for action',
    color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    glow: 'from-indigo-500/10 to-transparent',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    subtitle: 'Actively underway',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    glow: 'from-amber-500/10 to-transparent',
  },
  {
    id: 'DONE',
    title: 'Achieved',
    subtitle: 'Fulfilling milestones',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    glow: 'from-emerald-500/10 to-transparent',
  },
];

export const BucketList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [stats, setStats] = useState<BucketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | BucketCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'manual' | 'newest' | 'targetDate' | 'priority'>('manual');

  // Modals & Drawers
  const [activeItem, setActiveItem] = useState<BucketItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingItem, setCompletingItem] = useState<BucketItem | null>(null);
  const [ideasModalOpen, setIdeasModalOpen] = useState(false);

  // DND active item
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const loadData = async () => {
    try {
      const [itemsData, statsData] = await Promise.all([
        getBucketItems({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          q: searchQuery || undefined,
          sort: sortBy,
        }),
        getBucketStats(),
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load bucket list items', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, sortBy]);

  // Handle URL action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setActiveItem(null);
      setDrawerOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Column Items
  const dreamingItems = useMemo(() => items.filter((i) => i.status === 'DREAMING'), [items]);
  const inProgressItems = useMemo(() => items.filter((i) => i.status === 'IN_PROGRESS'), [items]);
  const doneItems = useMemo(() => items.filter((i) => i.status === 'DONE'), [items]);

  const activeDragItem = useMemo(() => {
    if (!activeDragId) return null;
    return items.find((i) => i.id === activeDragId) || null;
  }, [activeDragId, items]);

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    const draggedItem = items.find((i) => i.id === activeId);
    if (!draggedItem) return;

    // Determine target column status
    let targetStatus: BucketStatus = draggedItem.status;
    if (overId === 'DREAMING' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      targetStatus = overId as BucketStatus;
    } else {
      const overItem = items.find((i) => i.id === Number(overId));
      if (overItem) {
        targetStatus = overItem.status;
      }
    }

    // Dropping into DONE triggers Complete Dialog instead of silent completion
    if (targetStatus === 'DONE' && draggedItem.status !== 'DONE') {
      setCompletingItem(draggedItem);
      setCompleteModalOpen(true);
      return;
    }

    // Optimistic reorder update
    const updatedItems = items.map((i) => {
      if (i.id === activeId) {
        return { ...i, status: targetStatus };
      }
      return i;
    });

    setItems(updatedItems);

    // Prepare reorder payload for column items
    const columnItems = updatedItems.filter((i) => i.status === targetStatus);
    const reorderPayload: BucketReorderItem[] = columnItems.map((item, index) => ({
      id: item.id,
      status: targetStatus,
      sortOrder: index,
    }));

    try {
      await reorderBucketItems(reorderPayload);
      const newStats = await getBucketStats();
      setStats(newStats);
    } catch (err) {
      loadData();
    }
  };

  // CRUD Handlers
  const handleSaveItem = async (data: Partial<BucketItem>) => {
    if (activeItem) {
      const updated = await updateBucketItem(activeItem.id, data);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      const created = await createBucketItem(data);
      setItems((prev) => [created, ...prev]);
    }
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  const handleDeleteItem = async (id: number) => {
    await deleteBucketItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  const handleConfirmComplete = async (id: number, date: string, note: string) => {
    const updated = await completeBucketItem(id, { date, note });
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  const handleReopenItem = async (id: number) => {
    const updated = await reopenBucketItem(id);
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  const handleAddStep = async (itemId: number, text: string): Promise<BucketStep> => {
    const newStep = await addBucketStep(itemId, text);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newSteps = [...(item.steps || []), newStep];
          return {
            ...item,
            steps: newSteps,
            stepsSummary: {
              stepsTotal: newSteps.length,
              stepsDone: newSteps.filter((s) => s.done).length,
              progressPercent: Math.round((newSteps.filter((s) => s.done).length * 100) / newSteps.length),
            },
          };
        }
        return item;
      })
    );
    return newStep;
  };

  const handleUpdateStep = async (stepId: number, done: boolean) => {
    const updatedStep = await updateBucketStep(stepId, { done });
    setItems((prev) =>
      prev.map((item) => {
        if (item.steps?.some((s) => s.id === stepId)) {
          const newSteps = item.steps.map((s) => (s.id === stepId ? updatedStep : s));
          const stepsDone = newSteps.filter((s) => s.done).length;
          const statusMoved = !item.steps.find((s) => s.id === stepId)?.done && done && item.status === 'DREAMING';
          return {
            ...item,
            status: statusMoved ? 'IN_PROGRESS' : item.status,
            steps: newSteps,
            stepsSummary: {
              stepsTotal: newSteps.length,
              stepsDone,
              progressPercent: Math.round((stepsDone * 100) / newSteps.length),
            },
          };
        }
        return item;
      })
    );
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  const handleDeleteStep = async (stepId: number) => {
    await deleteBucketStep(stepId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.steps?.some((s) => s.id === stepId)) {
          const newSteps = item.steps.filter((s) => s.id !== stepId);
          const stepsDone = newSteps.filter((s) => s.done).length;
          return {
            ...item,
            steps: newSteps,
            stepsSummary: {
              stepsTotal: newSteps.length,
              stepsDone,
              progressPercent: newSteps.length === 0 ? 0 : Math.round((stepsDone * 100) / newSteps.length),
            },
          };
        }
        return item;
      })
    );
  };

  const handleAddSuggestion = async (sug: BucketSuggestion) => {
    const created = await createBucketItem({
      title: sug.title,
      description: sug.description,
      category: sug.category,
      priority: sug.priority,
      status: 'DREAMING',
    });
    setItems((prev) => [created, ...prev]);
    const newStats = await getBucketStats();
    setStats(newStats);
  };

  return (
    <AppShell>
      {/* Soft Ambient Canvas Backdrop Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-accent/10 via-purple-500/5 to-amber-500/10 blur-[130px] rounded-full opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-md bg-accent/15 text-accent">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-accent uppercase tracking-widest font-mono">Life Milestones</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-text">
                Bucket List
              </h1>
              <p className="text-sm text-muted/80 mt-1 max-w-xl font-sans leading-relaxed">
                Capture your highest aspirations, track action steps, and commemorate every life dream.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIdeasModalOpen(true)}
                className="px-4 py-2.5 rounded-btn bg-surface border border-border hover:border-accent/40 text-text text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Need Ideas?</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveItem(null);
                  setDrawerOpen(true);
                }}
                className="px-5 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-accent/25"
              >
                <Plus className="w-4 h-4" />
                <span>New Dream</span>
              </motion.button>
            </div>
          </div>

          {/* Stats Strip */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                className="p-5 rounded-panel bg-surface/90 backdrop-blur-md border border-border flex items-center justify-between shadow-sm hover:border-accent/30 transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Total Dreams</p>
                  <div className="font-display text-3xl font-extrabold text-text mt-1">
                    <NumberFlow value={stats.total} />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="p-5 rounded-panel bg-surface/90 backdrop-blur-md border border-border flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Achieved</p>
                  <div className="font-display text-3xl font-extrabold text-emerald-400 mt-1">
                    <NumberFlow value={stats.done} />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="p-5 rounded-panel bg-surface/90 backdrop-blur-md border border-border flex items-center justify-between shadow-sm hover:border-indigo-500/30 transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Completion</p>
                  <div className="font-display text-3xl font-extrabold text-text mt-1">
                    <NumberFlow value={stats.completionPercent} suffix="%" />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="p-5 rounded-panel bg-surface/90 backdrop-blur-md border border-border flex items-center justify-between shadow-sm hover:border-amber-500/30 transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Done This Year</p>
                  <div className="font-display text-3xl font-extrabold text-amber-400 mt-1">
                    <NumberFlow value={stats.doneThisYear} />
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Control Bar: View Toggle, Filters, Search, Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-panel bg-surface/90 backdrop-blur-md border border-border shadow-sm">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-accent text-accent-fg shadow-md shadow-accent/20'
                    : 'bg-surface-2/80 text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggle, Search & Sort */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dreams..."
                className="pl-8 pr-3 py-1.5 rounded-btn bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-accent transition-colors w-40 sm:w-48 font-medium"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-btn bg-surface-2 border border-border text-xs text-text font-semibold focus:outline-none focus:border-accent transition-colors"
            >
              <option value="manual">Manual Order</option>
              <option value="newest">Newest First</option>
              <option value="targetDate">Target Date</option>
              <option value="priority">Priority</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-surface-2 p-1 rounded-btn border border-border">
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'board' ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'
                }`}
                title="Board View"
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-surface text-accent shadow-sm' : 'text-muted hover:text-text'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Board / Grid Views */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center rounded-panel bg-surface/90 backdrop-blur-md border border-border space-y-5 max-w-md mx-auto shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/15 text-accent mx-auto flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-text">
                What do you want to accomplish next?
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Add your personal dream goal or explore our curated list of 40 starter suggestions.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIdeasModalOpen(true)}
                className="px-4 py-2.5 rounded-btn bg-surface-2 text-text font-bold text-xs border border-border hover:bg-surface-2/80 transition-colors"
              >
                Need Ideas?
              </button>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setDrawerOpen(true);
                }}
                className="px-5 py-2.5 rounded-btn bg-accent text-accent-fg font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
              >
                Create First Dream
              </button>
            </div>
          </motion.div>
        ) : viewMode === 'board' ? (
          /* BOARD VIEW (DND KIT WITH FRAMER MOTION STAGGER) */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {COLUMNS.map((col) => {
                const colItems =
                  col.id === 'DREAMING'
                    ? dreamingItems
                    : col.id === 'IN_PROGRESS'
                    ? inProgressItems
                    : doneItems;

                return (
                  <div key={col.id} className="space-y-4">
                    {/* Column Header */}
                    <div className={`p-3.5 rounded-btn border flex items-center justify-between ${col.color} shadow-sm backdrop-blur-md`}>
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-bold text-sm tracking-tight">{col.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface text-text text-[10px] font-mono font-bold border border-border">
                          {colItems.length}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium opacity-70 hidden sm:inline">{col.subtitle}</span>
                    </div>

                    {/* Column Sortable Container */}
                    <SortableContext items={colItems.map((i) => i.id)} strategy={rectSortingStrategy}>
                      <div className="space-y-3 min-h-[300px] p-2.5 rounded-panel bg-surface-2/20 border border-dashed border-border/70 backdrop-blur-xs">
                        {colItems.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-muted/60 text-xs text-center p-4">
                            <Layers className="w-8 h-8 mb-2 opacity-40" />
                            <span>No goals in {col.title.toLowerCase()}</span>
                          </div>
                        ) : (
                          colItems.map((item) => (
                            <BucketCard
                              key={item.id}
                              item={item}
                              viewMode="board"
                              onCardClick={(i) => {
                                setActiveItem(i);
                                setDrawerOpen(true);
                              }}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeDragItem ? (
                <BucketCard
                  item={activeDragItem}
                  viewMode="board"
                  onCardClick={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <BucketCard
                key={item.id}
                item={item}
                viewMode="grid"
                onCardClick={(i) => {
                  setActiveItem(i);
                  setDrawerOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Drawers & Modals */}
        <BucketDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          item={activeItem}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          onAddStep={handleAddStep}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onOpenCompleteModal={(itemToComplete) => {
            setCompletingItem(itemToComplete);
            setCompleteModalOpen(true);
          }}
          onReopen={handleReopenItem}
        />

        <BucketCompleteModal
          open={completeModalOpen}
          item={completingItem}
          onClose={() => setCompleteModalOpen(false)}
          onConfirmComplete={handleConfirmComplete}
        />

        <BucketNeedIdeasModal
          open={ideasModalOpen}
          onClose={() => setIdeasModalOpen(false)}
          existingItems={items}
          onAddSuggestion={handleAddSuggestion}
        />
      </div>
    </AppShell>
  );
};

export default BucketList;
