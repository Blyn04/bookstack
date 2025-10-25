import { Book, ReadingSession, Analytics } from '../types';

interface AIInsight {
  id: string;
  type: 'reading_pattern' | 'recommendation' | 'goal_suggestion' | 'habit_analysis' | 'achievement' | 'insight';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  createdAt: Date;
  category: 'insight' | 'recommendation' | 'warning' | 'achievement';
}

interface ReadingPattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  suggestion: string;
}

class AIService {
  private storageKey = 'bookstack-ai-insights';

  // Generate AI-powered insights based on reading data
  async generateInsights(books: Book[], sessions: ReadingSession[], analytics: Analytics): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Reading pattern analysis
    const patterns = this.analyzeReadingPatterns(sessions);
    for (const pattern of patterns) {
      insights.push({
        id: this.generateId(),
        type: 'reading_pattern',
        title: `Reading Pattern: ${pattern.pattern}`,
        description: pattern.suggestion,
        confidence: 0.8,
        actionable: true,
        createdAt: new Date(),
        category: pattern.impact === 'positive' ? 'achievement' : 'insight'
      });
    }

    // Genre diversity analysis
    const genreInsight = this.analyzeGenreDiversity(books);
    if (genreInsight) {
      insights.push(genreInsight);
    }

    // Reading speed analysis
    const speedInsight = this.analyzeReadingSpeed(sessions);
    if (speedInsight) {
      insights.push(speedInsight);
    }

    // Goal achievement prediction
    const goalInsight = this.predictGoalAchievement(analytics);
    if (goalInsight) {
      insights.push(goalInsight);
    }

    // Reading habit analysis
    const habitInsight = this.analyzeReadingHabits(sessions);
    if (habitInsight) {
      insights.push(habitInsight);
    }

    return insights;
  }

  // Analyze reading patterns from sessions
  private analyzeReadingPatterns(sessions: ReadingSession[]): ReadingPattern[] {
    const patterns: ReadingPattern[] = [];
    
    if (sessions.length === 0) return patterns;

    // Analyze reading frequency
    const sessionDates = sessions.map(s => new Date(s.date).getTime());
    const timeBetweenSessions = sessionDates.slice(1).map((date, i) => date - sessionDates[i]);
    const avgTimeBetween = timeBetweenSessions.reduce((a, b) => a + b, 0) / timeBetweenSessions.length;
    
    if (avgTimeBetween < 2 * 24 * 60 * 60 * 1000) { // Less than 2 days
      patterns.push({
        pattern: 'Frequent Reader',
        frequency: 1,
        impact: 'positive',
        suggestion: 'You read very frequently! Consider setting more ambitious reading goals.'
      });
    } else if (avgTimeBetween > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
      patterns.push({
        pattern: 'Infrequent Reader',
        frequency: 1,
        impact: 'negative',
        suggestion: 'Try to read more regularly. Even 15 minutes daily can make a big difference.'
      });
    }

    // Analyze reading duration
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    if (avgDuration > 60) { // More than 1 hour
      patterns.push({
        pattern: 'Long Reading Sessions',
        frequency: 1,
        impact: 'positive',
        suggestion: 'You have excellent focus! Consider breaking long sessions into smaller chunks for better retention.'
      });
    } else if (avgDuration < 15) { // Less than 15 minutes
      patterns.push({
        pattern: 'Short Reading Sessions',
        frequency: 1,
        impact: 'neutral',
        suggestion: 'Try extending your reading sessions to 20-30 minutes for better immersion.'
      });
    }

    return patterns;
  }

  // Analyze genre diversity
  private analyzeGenreDiversity(books: Book[]): AIInsight | null {
    const genres = books.map(b => b.genre).filter(Boolean);
    const uniqueGenres = new Set(genres);
    
    if (uniqueGenres.size === 1) {
      return {
        id: this.generateId(),
        type: 'recommendation',
        title: 'Genre Diversity Suggestion',
        description: `You've only read ${genres[0]} books. Try exploring other genres to broaden your perspective!`,
        confidence: 0.9,
        actionable: true,
        createdAt: new Date(),
        category: 'recommendation'
      };
    } else if (uniqueGenres.size >= 5) {
      return {
        id: this.generateId(),
        type: 'achievement',
        title: 'Genre Explorer',
        description: `Great job! You've read books from ${uniqueGenres.size} different genres. This shows excellent reading diversity.`,
        confidence: 0.8,
        actionable: false,
        createdAt: new Date(),
        category: 'achievement'
      };
    }
    
    return null;
  }

  // Analyze reading speed
  private analyzeReadingSpeed(sessions: ReadingSession[]): AIInsight | null {
    if (sessions.length < 5) return null;
    
    const recentSessions = sessions.slice(-10);
    const avgPagesPerHour = recentSessions.reduce((sum, s) => sum + (s.pagesRead / (s.duration / 60)), 0) / recentSessions.length;
    
    if (avgPagesPerHour > 50) {
      return {
        id: this.generateId(),
        type: 'achievement',
        title: 'Speed Reader',
        description: `You read at ${Math.round(avgPagesPerHour)} pages per hour! You're a fast reader. Consider taking notes to improve retention.`,
        confidence: 0.9,
        actionable: true,
        createdAt: new Date(),
        category: 'achievement'
      };
    } else if (avgPagesPerHour < 10) {
      return {
        id: this.generateId(),
        type: 'insight',
        title: 'Thoughtful Reader',
        description: `You read at ${Math.round(avgPagesPerHour)} pages per hour. You take your time to absorb the content - this is great for comprehension!`,
        confidence: 0.8,
        actionable: false,
        createdAt: new Date(),
        category: 'insight'
      };
    }
    
    return null;
  }

  // Predict goal achievement
  private predictGoalAchievement(analytics: Analytics): AIInsight | null {
    const completionRate = analytics.completionRate;
    
    if (completionRate < 50) {
      return {
        id: this.generateId(),
        type: 'goal_suggestion',
        title: 'Goal Achievement Warning',
        description: `Your completion rate is ${completionRate}%. Consider setting smaller, more achievable goals to build momentum.`,
        confidence: 0.8,
        actionable: true,
        createdAt: new Date(),
        category: 'warning'
      };
    } else if (completionRate > 80) {
      return {
        id: this.generateId(),
        type: 'achievement',
        title: 'Goal Achiever',
        description: `Excellent! Your completion rate is ${completionRate}%. You're great at finishing what you start.`,
        confidence: 0.9,
        actionable: false,
        createdAt: new Date(),
        category: 'achievement'
      };
    }
    
    return null;
  }

  // Analyze reading habits
  private analyzeReadingHabits(sessions: ReadingSession[]): AIInsight | null {
    if (sessions.length < 10) return null;
    
    // Analyze reading times
    const sessionHours = sessions.map(s => new Date(s.date).getHours());
    const eveningSessions = sessionHours.filter(h => h >= 18 && h < 22).length;
    
    const totalSessions = sessions.length;
    const eveningRatio = eveningSessions / totalSessions;
    
    if (eveningRatio > 0.6) {
      return {
        id: this.generateId(),
        type: 'reading_pattern',
        title: 'Evening Reader',
        description: `You do ${Math.round(eveningRatio * 100)}% of your reading in the evening. This is a great wind-down routine!`,
        confidence: 0.8,
        actionable: false,
        createdAt: new Date(),
        category: 'insight'
      };
    }
    
    return null;
  }

  // Get personalized book recommendations
  async getPersonalizedRecommendations(books: Book[]): Promise<string[]> {
    const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean)));
    const authors = Array.from(new Set(books.map(b => b.author)));
    
    // Mock recommendations based on reading history
    const recommendations = [
      `Based on your interest in ${genres[0] || 'fiction'}, try "The Seven Husbands of Evelyn Hugo" by Taylor Jenkins Reid`,
      `Since you enjoyed books by ${authors[0] || 'your favorite authors'}, check out "Educated" by Tara Westover`,
      `For a change of pace, try "Atomic Habits" by James Clear - a great non-fiction read`,
      `Based on your reading patterns, "The Midnight Library" by Matt Haig might be perfect for you`
    ];
    
    return recommendations.slice(0, 3);
  }

  // Generate reading goals suggestions
  async generateGoalSuggestions(analytics: Analytics): Promise<string[]> {
    const suggestions = [];
    
    if (analytics.totalBooks < 5) {
      suggestions.push("Set a goal to read 12 books this year");
    }
    
    if (analytics.averagePagesPerDay < 10) {
      suggestions.push("Try reading 20 pages per day");
    }
    
    if (analytics.readingStreak < 7) {
      suggestions.push("Build a 30-day reading streak");
    }
    
    suggestions.push("Read books from 3 different genres this month");
    suggestions.push("Complete a book series you've started");
    
    return suggestions;
  }

  // Save insights to storage
  async saveInsights(insights: AIInsight[]): Promise<void> {
    const data = this.loadFromStorage();
    data.insights = [...(data.insights || []), ...insights];
    this.saveToStorage(data);
  }

  // Load insights from storage
  async loadInsights(): Promise<AIInsight[]> {
    const data = this.loadFromStorage();
    return data.insights || [];
  }

  private loadFromStorage(): any {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading AI insights:', error);
      return {};
    }
  }

  private saveToStorage(data: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving AI insights:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const aiService = new AIService();
