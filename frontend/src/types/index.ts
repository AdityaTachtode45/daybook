export type MoodType = 'GREAT' | 'GOOD' | 'OKAY' | 'LOW' | 'BAD';
export type MediaType = 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER';

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  timezone: string;
  dateOfBirth: string | null;
  location: string | null;
}

export interface Tag {
  id: number;
  name: string;
  color?: string | null;
  count?: number;
  usageCount?: number;
}

export interface MediaAttachment {
  id: number;
  entryId: number;
  type: MediaType;
  url: string;
  publicId?: string;
  resourceType?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface DiaryEntry {
  id: number;
  entryDate: string;
  title: string | null;
  content: string | null;
  mood: MoodType | null;
  attachments: MediaAttachment[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface EntrySummary {
  id: number;
  date: string;
  title: string | null;
  mood: MoodType | null;
  hasMedia: boolean;
  tags: Tag[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  entriesThisMonth: number;
  wroteToday: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MediaSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset?: string;
}

export interface MediaCounts {
  videos: number;
  photos: number;
  files: number;
}

export interface SearchResult {
  entryDate: string;
  title: string | null;
  snippet: string;
  mood: MoodType | null;
  tags: Tag[];
  mediaCounts: MediaCounts;
}

export interface SearchResponse {
  content: SearchResult[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type BucketCategory =
  | 'TRAVEL'
  | 'LEARN'
  | 'CAREER'
  | 'HEALTH'
  | 'ADVENTURE'
  | 'CREATIVE'
  | 'RELATIONSHIPS'
  | 'MONEY'
  | 'OTHER';

export type BucketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type BucketStatus = 'DREAMING' | 'IN_PROGRESS' | 'DONE';

export interface BucketStepsSummary {
  stepsTotal: number;
  stepsDone: number;
  progressPercent: number;
}

export interface BucketStep {
  id: number;
  itemId: number;
  text: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BucketItem {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: BucketCategory;
  priority: BucketPriority;
  status: BucketStatus;
  targetDate: string | null;
  locationName: string | null;
  coverUrl: string | null;
  coverPublicId: string | null;
  sortOrder: number;
  completedDate: string | null;
  completedNote: string | null;
  createdAt: string;
  updatedAt: string;
  stepsSummary: BucketStepsSummary;
  steps: BucketStep[];
}

export interface BucketReorderItem {
  id: number;
  status: BucketStatus;
  sortOrder: number;
}

export interface BucketCompleteRequest {
  date?: string;
  note?: string;
}

export interface BucketCompletedDateCount {
  date: string;
  count: number;
}

export interface BucketCategoryStat {
  category: BucketCategory;
  total: number;
  done: number;
}

export interface BucketStats {
  total: number;
  done: number;
  inProgress: number;
  dreaming: number;
  completionPercent: number;
  byCategory: BucketCategoryStat[];
  doneThisYear: number;
  nextUp: BucketItem[];
}

export interface BucketByDateItem {
  id: number;
  title: string;
  category: BucketCategory;
  coverUrl: string | null;
  completedNote: string | null;
}

export interface MediaGroupDto {
  date: string;
  entryId: number;
  entryTitle: string | null;
  items: MediaAttachment[];
}

