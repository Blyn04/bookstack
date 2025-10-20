import React, { useState, useEffect } from 'react';
import { Analytics as AnalyticsType } from '../types';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsProps {
  analytics: AnalyticsType;
}

const Analytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  const [monthlyProgress, setMonthlyProgress] = useState<{ month: string; booksRead: number; pagesRead: number }[]>([]);
  const [genreAnalysis, setGenreAnalysis] = useState<{ genre: string; count: number; percentage: number }[]>([]);
  const [readingTrends, setReadingTrends] = useState<{ date: string; pagesRead: number; sessions: number }[]>([]);
  const [showMonthlyChart, setShowMonthlyChart] = useState(false);
  const [showGenreChart, setShowGenreChart] = useState(false);
  const [showTrendsChart, setShowTrendsChart] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    const [progress, genres, trends] = await Promise.all([
      analyticsService.getMonthlyProgress(),
      analyticsService.getGenreAnalysis(),
      analyticsService.getReadingTrends()
    ]);
    setMonthlyProgress(progress);
    setGenreAnalysis(genres);
    setReadingTrends(trends);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h3>📊 Reading Analytics</h3>
        <div className="chart-controls">
          <button 
            className="btn btn-small"
            onClick={() => setShowMonthlyChart(!showMonthlyChart)}
          >
            {showMonthlyChart ? 'Hide' : 'Show'} Monthly
          </button>
          <button 
            className="btn btn-small"
            onClick={() => setShowGenreChart(!showGenreChart)}
          >
            {showGenreChart ? 'Hide' : 'Show'} Genres
          </button>
          <button 
            className="btn btn-small"
            onClick={() => setShowTrendsChart(!showTrendsChart)}
          >
            {showTrendsChart ? 'Hide' : 'Show'} Trends
          </button>
        </div>
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
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.readingStreak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-subtext">Longest: {analytics.longestStreak || analytics.readingStreak}</div>
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
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.averageBookLength}</div>
            <div className="stat-label">Avg Length</div>
            <div className="stat-subtext">Pages</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.averageRating || 0}</div>
            <div className="stat-label">Avg Rating</div>
            <div className="stat-subtext">Stars</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.completionRate}%</div>
            <div className="stat-label">Completion</div>
            <div className="stat-subtext">Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-value">{analytics.readingVelocity}</div>
            <div className="stat-label">Velocity</div>
            <div className="stat-subtext">Pages/Hour</div>
          </div>
        </div>
      </div>

      {analytics.favoriteGenre && (
        <div className="favorite-genre">
          <h4>🎯 Favorite Genre</h4>
          <span className="genre-badge">{analytics.favoriteGenre}</span>
        </div>
      )}

      {analytics.badges && analytics.badges.length > 0 && (
        <div className="badges">
          <h4>🏅 Achievements</h4>
          <div className="badge-list">
            {analytics.badges.slice(-6).map(b => (
              <span key={b.id} className="badge-chip">{b.label}</span>
            ))}
          </div>
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

      {showGenreChart && genreAnalysis.length > 0 && (
        <div className="genre-chart">
          <h4>📚 Genre Analysis</h4>
          <div className="genre-list">
            {genreAnalysis.slice(0, 5).map((genre, index) => (
              <div key={genre.genre} className="genre-item">
                <div className="genre-info">
                  <span className="genre-name">{genre.genre}</span>
                  <span className="genre-count">{genre.count} books ({genre.percentage}%)</span>
                </div>
                <div className="genre-bar">
                  <div 
                    className="genre-fill"
                    style={{ width: `${genre.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTrendsChart && readingTrends.length > 0 && (
        <div className="trends-chart">
          <h4>📊 Reading Trends (Last 30 Days)</h4>
          <div className="trends-container">
            {readingTrends.slice(-14).map((day, index) => (
              <div key={day.date} className="trend-day">
                <div className="trend-label">{formatDate(day.date)}</div>
                <div className="trend-bars">
                  <div className="trend-bar-item">
                    <div 
                      className="trend-bar pages-trend"
                      style={{ height: `${Math.max(day.pagesRead / 10, 2)}px` }}
                    ></div>
                    <span className="trend-label-small">{day.pagesRead} pages</span>
                  </div>
                  <div className="trend-bar-item">
                    <div 
                      className="trend-bar sessions-trend"
                      style={{ height: `${Math.max(day.sessions * 10, 2)}px` }}
                    ></div>
                    <span className="trend-label-small">{day.sessions} sessions</span>
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
