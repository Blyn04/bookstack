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
  favoriteGenre?: string;
  averageRating?: number;
  totalReadingTime: number; // in hours
  averageBookLength: number;
  completionRate: number;
  readingVelocity: number; // pages per hour
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
