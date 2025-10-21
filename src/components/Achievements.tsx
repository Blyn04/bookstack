import React, { useState, useEffect } from 'react';
import { Achievement, UserAchievement, AchievementStats } from '../types';
import { achievementService } from '../services/achievementService';

interface AchievementsProps {
  onNewAchievement?: (achievement: UserAchievement) => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onNewAchievement }) => {
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'earned'>('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationAchievement, setNotificationAchievement] = useState<UserAchievement | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const stats = await achievementService.getAchievementStats();
    const achievements = achievementService.getAllAchievements();
    const userAchievements = achievementService.getUserAchievements();
    
    setAchievementStats(stats);
    setAllAchievements(achievements);
    setUserAchievements(userAchievements);
  };

  const handleNewAchievement = (achievement: UserAchievement) => {
    setNotificationAchievement(achievement);
    setShowNotification(true);
    onNewAchievement?.(achievement);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'uncommon': return '#10B981';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone': return '🏆';
      case 'skill': return '⚡';
      case 'exploration': return '🗺️';
      case 'dedication': return '💪';
      default: return '🎯';
    }
  };

  const renderOverview = () => {
    if (!achievementStats) return null;

    return (
      <div className="achievements-overview">
        <div className="achievement-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{achievementStats.earnedAchievements}</div>
              <div className="stat-label">Achievements Earned</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{achievementStats.totalAchievements}</div>
              <div className="stat-label">Total Available</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-number">
                {Math.round((achievementStats.earnedAchievements / achievementStats.totalAchievements) * 100)}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        <div className="category-breakdown">
          <h4>Category Breakdown</h4>
          <div className="category-grid">
            <div className="category-item">
              <span className="category-icon">🏆</span>
              <span className="category-name">Milestones</span>
              <span className="category-count">{achievementStats.categoryBreakdown.milestone}</span>
            </div>
            <div className="category-item">
              <span className="category-icon">⚡</span>
              <span className="category-name">Skills</span>
              <span className="category-count">{achievementStats.categoryBreakdown.skill}</span>
            </div>
            <div className="category-item">
              <span className="category-icon">🗺️</span>
              <span className="category-name">Exploration</span>
              <span className="category-count">{achievementStats.categoryBreakdown.exploration}</span>
            </div>
            <div className="category-item">
              <span className="category-icon">💪</span>
              <span className="category-name">Dedication</span>
              <span className="category-count">{achievementStats.categoryBreakdown.dedication}</span>
            </div>
          </div>
        </div>

        {achievementStats.recentAchievements.length > 0 && (
          <div className="recent-achievements">
            <h4>Recent Achievements</h4>
            <div className="recent-list">
              {achievementStats.recentAchievements.map((userAchievement) => {
                const achievement = allAchievements.find(a => a.id === userAchievement.achievementId);
                if (!achievement) return null;
                
                return (
                  <div key={userAchievement.achievementId} className="recent-achievement-item">
                    <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                      {achievement.icon}
                    </div>
                    <div className="achievement-info">
                      <div className="achievement-name">{achievement.name}</div>
                      <div className="achievement-date">
                        {new Date(userAchievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {achievementStats.nextMilestones.length > 0 && (
          <div className="next-milestones">
            <h4>Next Milestones</h4>
            <div className="milestones-list">
              {achievementStats.nextMilestones.map((achievement) => {
                const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
                const progress = userAchievement?.progress || 0;
                
                return (
                  <div key={achievement.id} className="milestone-item">
                    <div className="milestone-icon">{achievement.icon}</div>
                    <div className="milestone-content">
                      <div className="milestone-name">{achievement.name}</div>
                      <div className="milestone-description">{achievement.description}</div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">{Math.round(progress)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAllAchievements = () => {
    return (
      <div className="all-achievements">
        <div className="achievements-grid">
          {allAchievements.map((achievement) => {
            const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
            const isEarned = userAchievement?.isEarned || false;
            const progress = userAchievement?.progress || 0;
            
            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${isEarned ? 'earned' : 'not-earned'}`}
                style={{ borderColor: getRarityColor(achievement.rarity) }}
              >
                <div className="achievement-header">
                  <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                    {achievement.icon}
                  </div>
                  <div className="achievement-rarity" style={{ color: getRarityColor(achievement.rarity) }}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                </div>
                
                <div className="achievement-content">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  
                  <div className="achievement-category">
                    <span className="category-icon">{getCategoryIcon(achievement.category)}</span>
                    <span className="category-name">{achievement.category}</span>
                  </div>
                  
                  {!isEarned && (
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">{Math.round(progress)}%</div>
                    </div>
                  )}
                  
                  {isEarned && userAchievement?.earnedAt && (
                    <div className="achievement-earned-date">
                      Earned: {new Date(userAchievement.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEarnedAchievements = () => {
    const earnedAchievements = userAchievements.filter(ua => ua.isEarned);
    
    return (
      <div className="earned-achievements">
        <div className="earned-header">
          <h3>Your Achievements ({earnedAchievements.length})</h3>
        </div>
        
        <div className="earned-grid">
          {earnedAchievements.map((userAchievement) => {
            const achievement = allAchievements.find(a => a.id === userAchievement.achievementId);
            if (!achievement) return null;
            
            return (
              <div 
                key={userAchievement.achievementId} 
                className="earned-achievement-card"
                style={{ borderColor: getRarityColor(achievement.rarity) }}
              >
                <div className="achievement-icon" style={{ color: getRarityColor(achievement.rarity) }}>
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  <div className="achievement-earned-date">
                    Earned: {new Date(userAchievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>🏆 Achievements</h2>
        <div className="achievement-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Achievements
          </button>
          <button 
            className={`tab-button ${activeTab === 'earned' ? 'active' : ''}`}
            onClick={() => setActiveTab('earned')}
          >
            Earned
          </button>
        </div>
      </div>

      <div className="achievements-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'all' && renderAllAchievements()}
        {activeTab === 'earned' && renderEarnedAchievements()}
      </div>

      {showNotification && notificationAchievement && (
        <div className="achievement-notification">
          <div className="notification-content">
            <div className="notification-icon">🎉</div>
            <div className="notification-text">
              <div className="notification-title">Achievement Unlocked!</div>
              <div className="notification-achievement">
                {allAchievements.find(a => a.id === notificationAchievement.achievementId)?.name}
              </div>
            </div>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
