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
    const readingStreak = this.calculateReadingStreak(sessions);
    const favoriteGenre = this.calculateFavoriteGenre(books);

    return {
      totalBooks,
      completedBooks,
      totalPagesRead,
      averagePagesPerDay,
      booksThisMonth,
      readingStreak,
      favoriteGenre,
    };
  }

  private calculateTotalPagesRead(books: Book[], sessions: ReadingSession[]): number {
    return sessions.reduce((total, session) => total + session.pagesRead, 0);
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

  private calculateReadingStreak(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const sortedSessions = sessions.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    const uniqueDays = this.getUniqueReadingDays(sortedSessions);
    
    if (uniqueDays.length === 0) return 0;
    
    let streak = 1;
    
    for (let i = 1; i < uniqueDays.length; i++) {
      const currentDay = uniqueDays[i];
      const previousDay = uniqueDays[i - 1];
      
      const dayDiff = (currentDay.getTime() - previousDay.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateFavoriteGenre(books: Book[]): string | undefined {
    const genreCount: { [key: string]: number } = {};
    
    books.forEach(book => {
      if (book.genre) {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
      }
    });
    
    const favoriteGenre = Object.entries(genreCount).reduce((a, b) => 
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
}

export const analyticsService = new AnalyticsService();
