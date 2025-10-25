import { 
  BookRecommendation, 
  ReadingGroup, 
  BookShare, 
  BookShareComment, 
  UserProfile, 
  ReadingChallenge, 
  ChallengeProgress,
  Book 
} from '../types';

class SocialService {
  private storageKey = 'bookstack-social';

  // Book Recommendations
  async getRecommendations(): Promise<BookRecommendation[]> {
    const data = this.loadFromStorage();
    return data.recommendations || [];
  }

  async addRecommendation(recommendation: Omit<BookRecommendation, 'id' | 'createdAt'>): Promise<BookRecommendation> {
    const data = this.loadFromStorage();
    const newRecommendation: BookRecommendation = {
      ...recommendation,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    data.recommendations = [...(data.recommendations || []), newRecommendation];
    this.saveToStorage(data);
    return newRecommendation;
  }

  async markRecommendationAsRead(recommendationId: string): Promise<void> {
    const data = this.loadFromStorage();
    const recommendations = data.recommendations || [];
    const index = recommendations.findIndex((r: any) => r.id === recommendationId);
    
    if (index !== -1) {
      recommendations[index].isRead = true;
      data.recommendations = recommendations;
      this.saveToStorage(data);
    }
  }

  // Reading Groups
  async getReadingGroups(): Promise<ReadingGroup[]> {
    const data = this.loadFromStorage();
    return data.readingGroups || [];
  }

  async createReadingGroup(group: Omit<ReadingGroup, 'id' | 'createdAt'>): Promise<ReadingGroup> {
    const data = this.loadFromStorage();
    const newGroup: ReadingGroup = {
      ...group,
      id: this.generateId(),
      createdAt: new Date()
    };
    
    data.readingGroups = [...(data.readingGroups || []), newGroup];
    this.saveToStorage(data);
    return newGroup;
  }

  async joinReadingGroup(groupId: string, userId: string): Promise<void> {
    const data = this.loadFromStorage();
    const groups = data.readingGroups || [];
    const group = groups.find((g: any) => g.id === groupId);
    
    if (group && !group.members.includes(userId)) {
      group.members.push(userId);
      this.saveToStorage(data);
    }
  }

  async leaveReadingGroup(groupId: string, userId: string): Promise<void> {
    const data = this.loadFromStorage();
    const groups = data.readingGroups || [];
    const group = groups.find((g: any) => g.id === groupId);
    
    if (group) {
      group.members = group.members.filter((id: any) => id !== userId);
      this.saveToStorage(data);
    }
  }

  // Book Sharing
  async getBookShares(): Promise<BookShare[]> {
    const data = this.loadFromStorage();
    return data.bookShares || [];
  }

  async shareBook(share: Omit<BookShare, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<BookShare> {
    const data = this.loadFromStorage();
    const newShare: BookShare = {
      ...share,
      id: this.generateId(),
      createdAt: new Date(),
      likes: [],
      comments: []
    };
    
    data.bookShares = [...(data.bookShares || []), newShare];
    this.saveToStorage(data);
    return newShare;
  }

  async likeBookShare(shareId: string, userId: string): Promise<void> {
    const data = this.loadFromStorage();
    const shares = data.bookShares || [];
    const share = shares.find((s: any) => s.id === shareId);
    
    if (share) {
      if (share.likes.includes(userId)) {
        share.likes = share.likes.filter((id: any) => id !== userId);
      } else {
        share.likes.push(userId);
      }
      this.saveToStorage(data);
    }
  }

  async addCommentToShare(shareId: string, comment: Omit<BookShareComment, 'id' | 'createdAt'>): Promise<BookShareComment> {
    const data = this.loadFromStorage();
    const shares = data.bookShares || [];
    const share = shares.find((s: any) => s.id === shareId);
    
    if (share) {
      const newComment: BookShareComment = {
        ...comment,
        id: this.generateId(),
        createdAt: new Date()
      };
      share.comments.push(newComment);
      this.saveToStorage(data);
      return newComment;
    }
    
    throw new Error('Share not found');
  }

  // Reading Challenges
  async getChallenges(): Promise<ReadingChallenge[]> {
    const data = this.loadFromStorage();
    return data.challenges || [];
  }

  async createChallenge(challenge: Omit<ReadingChallenge, 'id' | 'createdAt' | 'participants'>): Promise<ReadingChallenge> {
    const data = this.loadFromStorage();
    const newChallenge: ReadingChallenge = {
      ...challenge,
      id: this.generateId(),
      createdAt: new Date(),
      participants: []
    };
    
    data.challenges = [...(data.challenges || []), newChallenge];
    this.saveToStorage(data);
    return newChallenge;
  }

  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    const data = this.loadFromStorage();
    const challenges = data.challenges || [];
    const challenge = challenges.find((c: any) => c.id === challengeId);
    
    if (challenge && !challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      this.saveToStorage(data);
    }
  }

  async getChallengeProgress(challengeId: string, userId: string): Promise<ChallengeProgress | null> {
    const data = this.loadFromStorage();
    const progress = data.challengeProgress || [];
    return progress.find((p: any) => p.challengeId === challengeId && p.userId === userId) || null;
  }

  async updateChallengeProgress(challengeId: string, userId: string, progress: number): Promise<void> {
    const data = this.loadFromStorage();
    const progressData = data.challengeProgress || [];
    const existingIndex = progressData.findIndex((p: any) => p.challengeId === challengeId && p.userId === userId);
    
    const progressUpdate: ChallengeProgress = {
      challengeId,
      userId,
      currentProgress: progress,
      lastUpdated: new Date()
    };
    
    if (existingIndex !== -1) {
      progressData[existingIndex] = progressUpdate;
    } else {
      progressData.push(progressUpdate);
    }
    
    data.challengeProgress = progressData;
    this.saveToStorage(data);
  }

  // AI-Powered Recommendations
  async generateRecommendations(books: Book[]): Promise<BookRecommendation[]> {
    // Simple recommendation algorithm based on genre and author
    const recommendations: BookRecommendation[] = [];
    const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean)));
    const authors = Array.from(new Set(books.map(b => b.author)));
    
    // Mock recommendations based on reading history
    const mockRecommendations = [
      {
        bookId: 'rec-1',
        recommendedBy: 'system',
        reason: `Based on your interest in ${genres[0] || 'fiction'}, you might enjoy this book`,
        confidence: 0.8
      },
      {
        bookId: 'rec-2', 
        recommendedBy: 'system',
        reason: `Similar to books by ${authors[0] || 'your favorite authors'}`,
        confidence: 0.7
      }
    ];
    
    for (const rec of mockRecommendations) {
      const recommendation = await this.addRecommendation({
        ...rec,
        isRead: false
      });
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const data = this.loadFromStorage();
    const profiles = data.userProfiles || [];
    return profiles.find((p: any) => p.id === userId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const data = this.loadFromStorage();
    const profiles = data.userProfiles || [];
    const existingIndex = profiles.findIndex((p: any) => p.id === userId);
    
    if (existingIndex !== -1) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...updates };
    } else {
      const newProfile: UserProfile = {
        id: userId,
        username: `user_${userId}`,
        displayName: 'New User',
        bio: '',
        readingPreferences: [],
        favoriteGenres: [],
        readingGoals: [],
        socialStats: {
          booksShared: 0,
          recommendationsGiven: 0,
          groupsJoined: 0,
          followers: 0,
          following: 0
        },
        isPublic: true,
        createdAt: new Date(),
        ...updates
      };
      profiles.push(newProfile);
    }
    
    data.userProfiles = profiles;
    this.saveToStorage(data);
    return profiles[existingIndex !== -1 ? existingIndex : profiles.length - 1];
  }

  private loadFromStorage(): any {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading social data:', error);
      return {};
    }
  }

  private saveToStorage(data: any): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving social data:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const socialService = new SocialService();
