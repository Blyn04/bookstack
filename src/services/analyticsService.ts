import { Analytics, Book, BookStatus, ReadingSession } from '../types';
import { bookService } from './bookService';

class AnalyticsService {
  async getAnalytics(): Promise<Analytics> {
    const books = await bookService.getAllBooks();
    const sessions = await bookService.getReadingSessions();
    
    const totalBooks = books.length;
    const completedBooks = books.filter(book => book.status === BookStatus.COMPLETED).length;
    const totalPagesRead = this.calculateTotalPagesRead(books, sessions);
    const averagePagesPerDay = this.calculateAveragePagesPerDay(sessions);
    const booksThisMonth = this.calculateBooksThisMonth(books);
    const { currentStreak, longestStreak } = this.calculateReadingStreaks(sessions);
    const favoriteGenre = this.calculateFavoriteGenre(books);
    const averageRating = this.calculateAverageRating(books);
    const totalReadingTime = this.calculateTotalReadingTime(sessions);
    const averageBookLength = this.calculateAverageBookLength(books);
    const completionRate = totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0;
    const readingVelocity = this.calculateReadingVelocity(sessions);

    return {
      totalBooks,
      completedBooks,
      totalPagesRead,
      averagePagesPerDay,
      booksThisMonth,
      readingStreak: currentStreak,
      longestStreak,
      favoriteGenre,
      averageRating,
      totalReadingTime,
      averageBookLength,
      completionRate,
      readingVelocity,
      badges: this.calculateBadges({ books, sessions, currentStreak, totalPagesRead })
    };
  }

  private calculateTotalPagesRead(books: Book[], sessions: ReadingSession[]): number {
    return sessions.length > 0 ? sessions.reduce((total, session) => total + session.pagesRead, 0) : 0;
  }

  private calculateAveragePagesPerDay(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalPages = sessions.reduce((total, session) => total + session.pagesRead, 0);
    const daysWithReading = this.getUniqueReadingDays(sessions);
    
    return daysWithReading.length > 0 ? Math.round(totalPages / daysWithReading.length) : 0;
  }

  private calculateBooksThisMonth(books: Book[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return books.filter(book => {
      if (!book.finishDate) return false;
      const finishDate = new Date(book.finishDate);
      return finishDate.getMonth() === currentMonth && finishDate.getFullYear() === currentYear;
    }).length;
  }

  private calculateReadingStreaks(sessions: ReadingSession[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const uniqueDays = this.getUniqueReadingDays(sessions).sort((a, b) => a.getTime() - b.getTime());
    if (uniqueDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let longest = 1;
    let current = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = uniqueDays[i - 1];
      const curr = uniqueDays[i];
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current += 1;
        if (current > longest) longest = current;
      } else if (diffDays > 1) {
        current = 1;
      }
    }

    // Calculate current streak ending today if applicable
    const today = new Date(); today.setHours(0,0,0,0);
    const lastDay = uniqueDays[uniqueDays.length - 1];
    const gap = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    const currentStreak = gap === 0 ? current : (gap === 1 ? current : 0);

    return { currentStreak, longestStreak: longest };
  }

  private calculateFavoriteGenre(books: Book[]): string | undefined {
    const genreCount: { [key: string]: number } = {};
    
    books.forEach(book => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
      }
    });
    
    const genreEntries = Object.entries(genreCount);
    if (genreEntries.length === 0) {
      return undefined;
    }
    
    const favoriteGenre = genreEntries.reduce((a, b) => 
      genreCount[a[0]] > genreCount[b[0]] ? a : b
    );
    
    return favoriteGenre ? favoriteGenre[0] : undefined;
  }

  private getUniqueReadingDays(sessions: ReadingSession[]): Date[] {
    const uniqueDays = new Set<string>();
    
    sessions.forEach(session => {
      const date = session.date instanceof Date ? session.date : new Date(session.date);
      date.setHours(0, 0, 0, 0);
      uniqueDays.add(date.toISOString());
    });
    
    return Array.from(uniqueDays).map(day => new Date(day));
  }

  private calculateBadges({ books, sessions, currentStreak, totalPagesRead }: { books: Book[]; sessions: ReadingSession[]; currentStreak: number; totalPagesRead: number; }) {
    const badges: { id: string; label: string; earnedAt: Date }[] = [];

    // Streak badges
    const streakMilestones = [3, 7, 14, 30];
    for (const m of streakMilestones) {
      if (currentStreak >= m) badges.push({ id: `streak-${m}`, label: `${m}-day streak`, earnedAt: new Date() });
    }

    // Books completed badges
    const completed = books.filter(b => b.status === BookStatus.COMPLETED).length;
    const bookMilestones = [1, 5, 10, 25, 50];
    for (const m of bookMilestones) {
      if (completed >= m) badges.push({ id: `books-${m}`, label: `${m} books finished`, earnedAt: new Date() });
    }

    // Pages read badges
    const pagesMilestones = [100, 500, 1000, 5000, 10000];
    for (const m of pagesMilestones) {
      if (totalPagesRead >= m) badges.push({ id: `pages-${m}`, label: `${m.toLocaleString()} pages`, earnedAt: new Date() });
    }

    return badges;
  }

  private calculateAverageRating(books: Book[]): number {
    const ratedBooks = books.filter(book => book.rating && book.rating > 0);
    if (ratedBooks.length === 0) return 0;
    
    const totalRating = ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0);
    return Math.round((totalRating / ratedBooks.length) * 10) / 10;
  }

  private calculateTotalReadingTime(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    const totalMinutes = sessions.reduce((total, session) => total + session.duration, 0);
    return Math.round((totalMinutes / 60) * 10) / 10; // Convert to hours, rounded to 1 decimal
  }

  private calculateAverageBookLength(books: Book[]): number {
    if (books.length === 0) return 0;
    const totalPages = books.reduce((sum, book) => sum + book.totalPages, 0);
    return Math.round(totalPages / books.length);
  }

  private calculateReadingVelocity(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalPages = sessions.reduce((total, session) => total + session.pagesRead, 0);
    const totalHours = sessions.reduce((total, session) => total + (session.duration / 60), 0);
    
    if (totalHours === 0) return 0;
    return Math.round((totalPages / totalHours) * 10) / 10;
  }

  async getMonthlyProgress(): Promise<{ month: string; booksRead: number; pagesRead: number }[]> {
    const books = await bookService.getAllBooks();
    const sessions = await bookService.getReadingSessions();
    
    const monthlyData: { [key: string]: { booksRead: number; pagesRead: number } } = {};
    
    // Initialize last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { booksRead: 0, pagesRead: 0 };
    }
    
    // Count completed books by month
    books.forEach(book => {
      if (book.status === BookStatus.COMPLETED && book.finishDate) {
        const finishDate = new Date(book.finishDate);
        const monthKey = `${finishDate.getFullYear()}-${String(finishDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].booksRead++;
        }
      }
    });
    
    // Count pages read by month
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].pagesRead += session.pagesRead;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getGenreAnalysis(): Promise<{ genre: string; count: number; percentage: number }[]> {
    const books = await bookService.getAllBooks();
    const genreCount: { [key: string]: number } = {};
    
    books.forEach(book => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
      }
    });
    
    const totalBooks = books.length;
    if (totalBooks === 0) return [];
    
    return Object.entries(genreCount)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / totalBooks) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getReadingTrends(): Promise<{ date: string; pagesRead: number; sessions: number }[]> {
    const sessions = await bookService.getReadingSessions();
    const dailyData: { [key: string]: { pagesRead: number; sessions: number } } = {};
    
    // Get last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { pagesRead: 0, sessions: 0 };
    }
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      if (dailyData[sessionDate]) {
        dailyData[sessionDate].pagesRead += session.pagesRead;
        dailyData[sessionDate].sessions += 1;
      }
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const analyticsService = new AnalyticsService();
