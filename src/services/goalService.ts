import { ReadingGoal } from '../types';
import { bookService } from './bookService';
import { analyticsService } from './analyticsService';

class GoalService {
  private goals: ReadingGoal[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const goalsData = localStorage.getItem('bookstack-goals');
    
    if (goalsData) {
      this.goals = JSON.parse(goalsData).map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
      }));
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('bookstack-goals', JSON.stringify(this.goals));
  }

  async getAllGoals(): Promise<ReadingGoal[]> {
    return [...this.goals];
  }

  async getActiveGoals(): Promise<ReadingGoal[]> {
    return this.goals.filter(goal => goal.isActive);
  }

  async addGoal(goalData: Omit<ReadingGoal, 'id' | 'currentProgress'>): Promise<ReadingGoal> {
    const newGoal: ReadingGoal = {
      ...goalData,
      id: this.generateId(),
      currentProgress: 0,
    };
    
    this.goals.push(newGoal);
    this.saveToStorage();
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<ReadingGoal>): Promise<ReadingGoal> {
    const goalIndex = this.goals.findIndex(goal => goal.id === id);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    this.goals[goalIndex] = { ...this.goals[goalIndex], ...updates };
    this.saveToStorage();
    return this.goals[goalIndex];
  }

  async deleteGoal(id: string): Promise<void> {
    this.goals = this.goals.filter(goal => goal.id !== id);
    this.saveToStorage();
  }

  async updateGoalProgress(): Promise<void> {
    const analytics = await analyticsService.getAnalytics();
    
    for (const goal of this.goals) {
      if (!goal.isActive) continue;

      const now = new Date();
      const isCurrentPeriod = this.isDateInPeriod(now, goal.startDate, goal.endDate);
      
      if (isCurrentPeriod) {
        let progress = 0;
        
        if (goal.type === 'books') {
          if (goal.period === 'month') {
            progress = analytics.booksThisMonth;
          } else if (goal.period === 'year') {
            progress = analytics.completedBooks;
          }
        } else if (goal.type === 'pages') {
          if (goal.period === 'month') {
            progress = await this.getPagesReadThisMonth();
          } else if (goal.period === 'year') {
            progress = analytics.totalPagesRead;
          }
        }

        goal.currentProgress = Math.min(progress, goal.target);
        this.saveToStorage();
      }
    }
  }

  private async getPagesReadThisMonth(): Promise<number> {
    const sessions = await bookService.getReadingSessions();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() === currentMonth && 
             sessionDate.getFullYear() === currentYear;
    });
    
    return monthlySessions.length > 0 ? monthlySessions.reduce((total, session) => total + session.pagesRead, 0) : 0;
  }

  private isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  getGoalProgress(goal: ReadingGoal): number {
    if (goal.target === 0) return 0;
    return Math.round((goal.currentProgress / goal.target) * 100);
  }

  isGoalCompleted(goal: ReadingGoal): boolean {
    return goal.currentProgress >= goal.target;
  }

  getDaysRemaining(goal: ReadingGoal): number {
    const now = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getGoalStatus(goal: ReadingGoal): 'completed' | 'on-track' | 'behind' | 'not-started' {
    if (this.isGoalCompleted(goal)) return 'completed';
    
    const daysRemaining = this.getDaysRemaining(goal);
    const totalDays = Math.ceil((goal.endDate.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDays - daysRemaining;
    
    if (daysElapsed <= 0) return 'not-started';
    
    const expectedProgress = (daysElapsed / totalDays) * goal.target;
    const progressRatio = goal.currentProgress / expectedProgress;
    
    if (progressRatio >= 0.8) return 'on-track';
    return 'behind';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const goalService = new GoalService();
