export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  startDate?: Date;
  finishDate?: Date;
  rating?: number;
  notes?: string;
  genre?: string;
  isbn?: string;
  quotes?: Quote[];
  shelves?: string[]; // array of shelf ids
}

export enum BookStatus {
  NOT_STARTED = 'not_started',
  READING = 'reading',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export interface ReadingSession {
  id: string;
  bookId: string;
  date: Date;
  pagesRead: number;
  duration: number; // in minutes
  notes?: string;
}

export interface Quote {
  id: string;
  bookId: string;
  page?: number;
  text: string;
  note?: string;
  createdAt: Date;
}

export interface Analytics {
  totalBooks: number;
  completedBooks: number;
  totalPagesRead: number;
  averagePagesPerDay: number;
  booksThisMonth: number;
  readingStreak: number;
  longestStreak?: number;
  favoriteGenre?: string;
  averageRating?: number;
  totalReadingTime: number; // in hours
  averageBookLength: number;
  completionRate: number;
  readingVelocity: number; // pages per hour
  badges?: BadgeAchievement[];
}

export interface ReadingGoal {
  id: string;
  type: 'books' | 'pages';
  target: number;
  period: 'month' | 'year';
  startDate: Date;
  endDate: Date;
  currentProgress: number;
  isActive: boolean;
  description?: string;
}

export interface FilterOptions {
  status?: BookStatus;
  genre?: string;
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchOptions {
  query: string;
  searchIn: ('title' | 'author' | 'notes')[];
}

export interface Shelf {
  id: string;
  name: string; // e.g., "Cozy Reads", "DNF", "Re-reads"
  color?: string; // optional accent color
  createdAt: Date;
}

export interface BadgeAchievement {
  id: string; // e.g., streak-7, books-5, pages-1000
  label: string; // Human readable name
  earnedAt: Date;
}

export enum AchievementType {
  BOOKS_READ = 'books_read',
  PAGES_READ = 'pages_read',
  READING_STREAK = 'reading_streak',
  GENRE_DIVERSITY = 'genre_diversity',
  SPEED_READER = 'speed_reader',
  DEEP_THINKER = 'deep_thinker',
  QUOTE_COLLECTOR = 'quote_collector',
  READING_TIME = 'reading_time',
  GOAL_ACHIEVER = 'goal_achiever',
  CONSISTENT_READER = 'consistent_reader'
}

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'milestone' | 'skill' | 'exploration' | 'dedication';
}

export interface UserAchievement {
  achievementId: string;
  earnedAt: Date;
  progress: number; // 0-100
  isEarned: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  earnedAchievements: number;
  recentAchievements: UserAchievement[];
  nextMilestones: Achievement[];
  categoryBreakdown: {
    milestone: number;
    skill: number;
    exploration: number;
    dedication: number;
  };
}

// Knowledge Management Types
export interface Concept {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  relatedConcepts: string[]; // IDs of related concepts
  books: string[]; // IDs of books where this concept appears
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapNode {
  id: string;
  conceptId: string;
  x: number;
  y: number;
  level: number; // 0 = center, 1 = first level, etc.
  connections: string[]; // IDs of connected nodes
}

export interface MindMap {
  id: string;
  title: string;
  bookId?: string; // Optional: if mind map is book-specific
  nodes: MindMapNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeGraph {
  concepts: Concept[];
  relationships: ConceptRelationship[];
  lastUpdated: Date;
}

export interface ConceptRelationship {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: 'related' | 'prerequisite' | 'contradicts' | 'supports' | 'example_of';
  strength: number; // 0-1, how strong the relationship is
  description?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'summary' | 'mindmap' | 'concept_map' | 'flashcards' | 'notes';
  content: string;
  concepts: string[]; // Concept IDs
  books: string[]; // Book IDs
  createdAt: Date;
  format: 'markdown' | 'pdf' | 'json';
}

export interface ReadingNote {
  id: string;
  bookId: string;
  page?: number;
  content: string;
  concepts: string[]; // Extracted concept IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}