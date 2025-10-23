import { Book, ReadingSession, Quote, Achievement, UserAchievement, AchievementStats, AchievementType } from '../types';

class AchievementService {
  private achievements: Achievement[] = [];
  private userAchievements: UserAchievement[] = [];

  constructor() {
    this.initializeAchievements();
    this.loadUserAchievements();
  }

  private initializeAchievements(): void {
    this.achievements = [
      { id: 'books-1', type: AchievementType.BOOKS_READ, name: 'First Steps', description: 'Read your first book', icon: '📖', requirement: 1, rarity: 'common', category: 'milestone' },
      { id: 'books-5', type: AchievementType.BOOKS_READ, name: 'Getting Started', description: 'Read 5 books', icon: '📚', requirement: 5, rarity: 'common', category: 'milestone' },
      { id: 'books-10', type: AchievementType.BOOKS_READ, name: 'Bookworm', description: 'Read 10 books', icon: '🐛', requirement: 10, rarity: 'uncommon', category: 'milestone' },
      { id: 'books-25', type: AchievementType.BOOKS_READ, name: 'Avid Reader', description: 'Read 25 books', icon: '📖', requirement: 25, rarity: 'uncommon', category: 'milestone' },
      { id: 'books-50', type: AchievementType.BOOKS_READ, name: 'Book Lover', description: 'Read 50 books', icon: '❤️', requirement: 50, rarity: 'rare', category: 'milestone' },
      { id: 'books-100', type: AchievementType.BOOKS_READ, name: 'Century Club', description: 'Read 100 books', icon: '💯', requirement: 100, rarity: 'epic', category: 'milestone' },
      { id: 'books-250', type: AchievementType.BOOKS_READ, name: 'Reading Legend', description: 'Read 250 books', icon: '👑', requirement: 250, rarity: 'legendary', category: 'milestone' },

      { id: 'pages-1000', type: AchievementType.PAGES_READ, name: 'Page Turner', description: 'Read 1,000 pages', icon: '📄', requirement: 1000, rarity: 'common', category: 'milestone' },
      { id: 'pages-5000', type: AchievementType.PAGES_READ, name: 'Page Master', description: 'Read 5,000 pages', icon: '📚', requirement: 5000, rarity: 'uncommon', category: 'milestone' },
      { id: 'pages-10000', type: AchievementType.PAGES_READ, name: 'Page Champion', description: 'Read 10,000 pages', icon: '🏆', requirement: 10000, rarity: 'rare', category: 'milestone' },
      { id: 'pages-25000', type: AchievementType.PAGES_READ, name: 'Page Legend', description: 'Read 25,000 pages', icon: '🌟', requirement: 25000, rarity: 'epic', category: 'milestone' },
      { id: 'pages-50000', type: AchievementType.PAGES_READ, name: 'Page Titan', description: 'Read 50,000 pages', icon: '⚡', requirement: 50000, rarity: 'legendary', category: 'milestone' },

      { id: 'streak-3', type: AchievementType.READING_STREAK, name: 'Getting in the Groove', description: 'Read for 3 days straight', icon: '🔥', requirement: 3, rarity: 'common', category: 'dedication' },
      { id: 'streak-7', type: AchievementType.READING_STREAK, name: 'Week Warrior', description: 'Read for 7 days straight', icon: '⚔️', requirement: 7, rarity: 'uncommon', category: 'dedication' },
      { id: 'streak-14', type: AchievementType.READING_STREAK, name: 'Fortnight Fighter', description: 'Read for 14 days straight', icon: '🛡️', requirement: 14, rarity: 'rare', category: 'dedication' },
      { id: 'streak-30', type: AchievementType.READING_STREAK, name: 'Monthly Master', description: 'Read for 30 days straight', icon: '👑', requirement: 30, rarity: 'epic', category: 'dedication' },
      { id: 'streak-100', type: AchievementType.READING_STREAK, name: 'Century Streak', description: 'Read for 100 days straight', icon: '💎', requirement: 100, rarity: 'legendary', category: 'dedication' },

      { id: 'genres-3', type: AchievementType.GENRE_DIVERSITY, name: 'Genre Explorer', description: 'Read books from 3 different genres', icon: '🗺️', requirement: 3, rarity: 'common', category: 'exploration' },
      { id: 'genres-5', type: AchievementType.GENRE_DIVERSITY, name: 'Genre Adventurer', description: 'Read books from 5 different genres', icon: '🧭', requirement: 5, rarity: 'uncommon', category: 'exploration' },
      { id: 'genres-10', type: AchievementType.GENRE_DIVERSITY, name: 'Genre Master', description: 'Read books from 10 different genres', icon: '🎯', requirement: 10, rarity: 'rare', category: 'exploration' },
      { id: 'genres-15', type: AchievementType.GENRE_DIVERSITY, name: 'Genre Legend', description: 'Read books from 15 different genres', icon: '🌟', requirement: 15, rarity: 'epic', category: 'exploration' },

      { id: 'speed-50', type: AchievementType.SPEED_READER, name: 'Speed Demon', description: 'Read 50+ pages per hour', icon: '⚡', requirement: 50, rarity: 'uncommon', category: 'skill' },
      { id: 'speed-75', type: AchievementType.SPEED_READER, name: 'Lightning Reader', description: 'Read 75+ pages per hour', icon: '🌩️', requirement: 75, rarity: 'rare', category: 'skill' },
      { id: 'speed-100', type: AchievementType.SPEED_READER, name: 'Speed of Light', description: 'Read 100+ pages per hour', icon: '💨', requirement: 100, rarity: 'epic', category: 'skill' },

      { id: 'quotes-10', type: AchievementType.QUOTE_COLLECTOR, name: 'Quote Collector', description: 'Save 10 quotes', icon: '💭', requirement: 10, rarity: 'common', category: 'skill' },
      { id: 'quotes-25', type: AchievementType.QUOTE_COLLECTOR, name: 'Deep Thinker', description: 'Save 25 quotes', icon: '🧠', requirement: 25, rarity: 'uncommon', category: 'skill' },
      { id: 'quotes-50', type: AchievementType.QUOTE_COLLECTOR, name: 'Wisdom Keeper', description: 'Save 50 quotes', icon: '📜', requirement: 50, rarity: 'rare', category: 'skill' },
      { id: 'quotes-100', type: AchievementType.QUOTE_COLLECTOR, name: 'Quote Master', description: 'Save 100 quotes', icon: '📚', requirement: 100, rarity: 'epic', category: 'skill' },

      { id: 'time-10', type: AchievementType.READING_TIME, name: 'Time Invested', description: 'Spend 10 hours reading', icon: '⏰', requirement: 10, rarity: 'common', category: 'dedication' },
      { id: 'time-50', type: AchievementType.READING_TIME, name: 'Time Devoted', description: 'Spend 50 hours reading', icon: '⏳', requirement: 50, rarity: 'uncommon', category: 'dedication' },
      { id: 'time-100', type: AchievementType.READING_TIME, name: 'Time Master', description: 'Spend 100 hours reading', icon: '🕰️', requirement: 100, rarity: 'rare', category: 'dedication' },
      { id: 'time-500', type: AchievementType.READING_TIME, name: 'Time Legend', description: 'Spend 500 hours reading', icon: '⏰', requirement: 500, rarity: 'epic', category: 'dedication' },

      { id: 'goals-1', type: AchievementType.GOAL_ACHIEVER, name: 'Goal Setter', description: 'Achieve your first reading goal', icon: '🎯', requirement: 1, rarity: 'common', category: 'milestone' },
      { id: 'goals-5', type: AchievementType.GOAL_ACHIEVER, name: 'Goal Crusher', description: 'Achieve 5 reading goals', icon: '💪', requirement: 5, rarity: 'uncommon', category: 'milestone' },
      { id: 'goals-10', type: AchievementType.GOAL_ACHIEVER, name: 'Goal Master', description: 'Achieve 10 reading goals', icon: '🏆', requirement: 10, rarity: 'rare', category: 'milestone' },

      { id: 'consistent-30', type: AchievementType.CONSISTENT_READER, name: 'Consistent Reader', description: 'Read consistently for 30 days', icon: '📅', requirement: 30, rarity: 'uncommon', category: 'dedication' },
      { id: 'consistent-90', type: AchievementType.CONSISTENT_READER, name: 'Habit Master', description: 'Read consistently for 90 days', icon: '🔄', requirement: 90, rarity: 'rare', category: 'dedication' },
      { id: 'consistent-365', type: AchievementType.CONSISTENT_READER, name: 'Year of Reading', description: 'Read consistently for 365 days', icon: '📆', requirement: 365, rarity: 'legendary', category: 'dedication' }
    ];
  }

  private loadUserAchievements(): void {
    const stored = localStorage.getItem('bookstack_achievements');
    if (stored) {
      this.userAchievements = JSON.parse(stored);
    }
  }

  private saveUserAchievements(): void {
    localStorage.setItem('bookstack_achievements', JSON.stringify(this.userAchievements));
  }

  async checkAchievements(books: Book[], sessions: ReadingSession[]): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    const completedBooks = books.filter(book => book.status === 'completed');
    const totalPagesRead = this.calculateTotalPagesRead(books, sessions);
    const totalReadingTime = this.calculateTotalReadingTime(sessions);
    const genres = this.getUniqueGenres(completedBooks);
    const quotes = this.getAllQuotes(books);
    const averageSpeed = this.calculateAverageReadingSpeed(sessions);
    const readingStreak = this.calculateReadingStreak(sessions);

    for (const achievement of this.achievements) {
      const existingUserAchievement = this.userAchievements.find(ua => ua.achievementId === achievement.id);
      
      if (existingUserAchievement && existingUserAchievement.isEarned) {
        continue;
      }

      let progress = 0;
      let isEarned = false;

      switch (achievement.type) {
        case AchievementType.BOOKS_READ:
          progress = Math.min((completedBooks.length / achievement.requirement) * 100, 100);
          isEarned = completedBooks.length >= achievement.requirement;
          break;

        case AchievementType.PAGES_READ:
          progress = Math.min((totalPagesRead / achievement.requirement) * 100, 100);
          isEarned = totalPagesRead >= achievement.requirement;
          break;

        case AchievementType.READING_STREAK:
          progress = Math.min((readingStreak / achievement.requirement) * 100, 100);
          isEarned = readingStreak >= achievement.requirement;
          break;

        case AchievementType.GENRE_DIVERSITY:
          progress = Math.min((genres.length / achievement.requirement) * 100, 100);
          isEarned = genres.length >= achievement.requirement;
          break;

        case AchievementType.SPEED_READER:
          progress = Math.min((averageSpeed / achievement.requirement) * 100, 100);
          isEarned = averageSpeed >= achievement.requirement;
          break;

        case AchievementType.QUOTE_COLLECTOR:
          progress = Math.min((quotes.length / achievement.requirement) * 100, 100);
          isEarned = quotes.length >= achievement.requirement;
          break;

        case AchievementType.READING_TIME:
          progress = Math.min((totalReadingTime / achievement.requirement) * 100, 100);
          isEarned = totalReadingTime >= achievement.requirement;
          break;

        case AchievementType.CONSISTENT_READER:
          const consistentDays = this.calculateConsistentReadingDays(sessions);
          progress = Math.min((consistentDays / achievement.requirement) * 100, 100);
          isEarned = consistentDays >= achievement.requirement;
          break;
      }

      if (existingUserAchievement) {
        existingUserAchievement.progress = progress;
        existingUserAchievement.isEarned = isEarned;
        if (isEarned && !existingUserAchievement.earnedAt) {
          existingUserAchievement.earnedAt = new Date();
          newAchievements.push(existingUserAchievement);
        }
      } else {
        const userAchievement: UserAchievement = {
          achievementId: achievement.id,
          earnedAt: isEarned ? new Date() : new Date(0),
          progress,
          isEarned
        };
        this.userAchievements.push(userAchievement);
        if (isEarned) {
          newAchievements.push(userAchievement);
        }
      }
    }

    this.saveUserAchievements();
    return newAchievements;
  }

  async getAchievementStats(): Promise<AchievementStats> {
    const earnedAchievements = this.userAchievements.filter(ua => ua.isEarned);
    const recentAchievements = earnedAchievements
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5);

    const nextMilestones = this.achievements
      .filter(achievement => {
        const userAchievement = this.userAchievements.find(ua => ua.achievementId === achievement.id);
        return !userAchievement || !userAchievement.isEarned;
      })
      .sort((a, b) => a.requirement - b.requirement)
      .slice(0, 5);

    const categoryBreakdown = {
      milestone: earnedAchievements.filter(ua => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return achievement?.category === 'milestone';
      }).length,
      skill: earnedAchievements.filter(ua => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return achievement?.category === 'skill';
      }).length,
      exploration: earnedAchievements.filter(ua => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return achievement?.category === 'exploration';
      }).length,
      dedication: earnedAchievements.filter(ua => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return achievement?.category === 'dedication';
      }).length
    };

    return {
      totalAchievements: this.achievements.length,
      earnedAchievements: earnedAchievements.length,
      recentAchievements: recentAchievements.map(ua => {
        const achievement = this.achievements.find(a => a.id === ua.achievementId);
        return {
          ...ua,
          achievement: achievement!
        };
      }),
      nextMilestones,
      categoryBreakdown
    };
  }

  getAllAchievements(): Achievement[] {
    return this.achievements;
  }

  getUserAchievements(): UserAchievement[] {
    return this.userAchievements;
  }

  private calculateTotalPagesRead(books: Book[], sessions: ReadingSession[]): number {
    return sessions.reduce((total, session) => total + session.pagesRead, 0);
  }

  private calculateTotalReadingTime(sessions: ReadingSession[]): number {
    return sessions.reduce((total, session) => total + session.duration, 0) / 60; // Convert to hours
  }

  private getUniqueGenres(books: Book[]): string[] {
    const genres = books
      .map(book => book.genre)
      .filter(genre => genre && genre.trim() !== '') as string[];
    return Array.from(new Set(genres));
  }

  private getAllQuotes(books: Book[]): Quote[] {
    return books.reduce((allQuotes, book) => {
      return allQuotes.concat(book.quotes || []);
    }, [] as Quote[]);
  }

  private calculateAverageReadingSpeed(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalPages = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
    const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0) / 60;
    
    return totalHours > 0 ? totalPages / totalHours : 0;
  }

  private calculateReadingStreak(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const sessionDates = sessions
      .map(session => new Date(session.date).toDateString())
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateString = currentDate.toDateString();
      if (sessionDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateConsistentReadingDays(sessions: ReadingSession[]): number {
    if (sessions.length === 0) return 0;

    const sessionDates = sessions
      .map(session => new Date(session.date).toDateString())
      .sort()
      .reverse();

    let consistentDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dateString = currentDate.toDateString();
      if (sessionDates.includes(dateString)) {
        consistentDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consistentDays;
  }
}

export const achievementService = new AchievementService();
