import React, { useState, useEffect } from 'react';
import { Analytics as AnalyticsType } from '../types';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsProps {
  analytics: AnalyticsType;
}

const Analytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  const [monthlyProgress, setMonthlyProgress] = useState<{ month: string; booksRead: number; pagesRead: number }[]>([]);
  const [showMonthlyChart, setShowMonthlyChart] = useState(false);

  useEffect(() => {
    loadMonthlyProgress();
  }, []);

  const loadMonthlyProgress = async () => {
    const progress = await analyticsService.getMonthlyProgress();
    setMonthlyProgress(progress);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getCompletionRate = () => {
    if (analytics.totalBooks === 0) return 0;
    return Math.round((analytics.completedBooks / analytics.totalBooks) * 100);
  };

  const getReadingEfficiency = () => {
    if (analytics.averagePagesPerDay === 0) return 0;
    return Math.round(analytics.averagePagesPerDay);
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h3>📊 Reading Analytics</h3>
        <button 
          className="btn btn-small"
          onClick={() => setShowMonthlyChart(!showMonthlyChart)}
        >
          {showMonthlyChart ? 'Hide' : 'Show'} Monthly Chart
        </button>
      </div>

      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalBooks}</div>
            <div className="stat-label">Total Books</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.completedBooks}</div>
            <div className="stat-label">Completed</div>
            <div className="stat-subtext">{getCompletionRate()}% completion rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalPagesRead.toLocaleString()}</div>
            <div className="stat-label">Pages Read</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{getReadingEfficiency()}</div>
            <div className="stat-label">Pages/Day</div>
            <div className="stat-subtext">Average</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.booksThisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.readingStreak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-subtext">Current</div>
          </div>
        </div>
      </div>

      {analytics.favoriteGenre && (
        <div className="favorite-genre">
          <h4>🎯 Favorite Genre</h4>
          <span className="genre-badge">{analytics.favoriteGenre}</span>
        </div>
      )}

      {showMonthlyChart && monthlyProgress.length > 0 && (
        <div className="monthly-chart">
          <h4>📈 Monthly Progress</h4>
          <div className="chart-container">
            {monthlyProgress.slice(-6).map((month, index) => (
              <div key={month.month} className="chart-bar">
                <div className="chart-label">{formatMonth(month.month)}</div>
                <div className="chart-bars">
                  <div className="chart-bar-item">
                    <div 
                      className="bar books-bar"
                      style={{ height: `${Math.max(month.booksRead * 20, 5)}px` }}
                    ></div>
                    <span className="bar-label">{month.booksRead} books</span>
                  </div>
                  <div className="chart-bar-item">
                    <div 
                      className="bar pages-bar"
                      style={{ height: `${Math.max(month.pagesRead / 50, 5)}px` }}
                    ></div>
                    <span className="bar-label">{month.pagesRead} pages</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.totalBooks === 0 && (
        <div className="empty-analytics">
          <p>Start adding books to see your reading analytics!</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
