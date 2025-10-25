import React, { useState, useEffect } from 'react';
import { Book, ReadingSession, Analytics } from '../types';
import { aiService } from '../services/aiService';

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

interface AIInsightsProps {
  books: Book[];
  sessions: ReadingSession[];
  analytics: Analytics;
  onClose: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ books, sessions, analytics, onClose }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'goals'>('insights');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const savedInsights = await aiService.loadInsights();
    setInsights(savedInsights);
  };

  const generateNewInsights = async () => {
    setIsGenerating(true);
    try {
      const newInsights = await aiService.generateInsights(books, sessions, analytics);
      await aiService.saveInsights(newInsights);
      setInsights(prev => [...prev, ...newInsights]);
      
      // Generate recommendations and goal suggestions
      const bookRecs = await aiService.getPersonalizedRecommendations(books);
      const goalSugs = await aiService.generateGoalSuggestions(analytics);
      
      setRecommendations(bookRecs);
      setGoalSuggestions(goalSugs);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievement': return '🏆';
      case 'recommendation': return '💡';
      case 'warning': return '⚠️';
      default: return '📊';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'achievement': return '#4CAF50';
      case 'recommendation': return '#2196F3';
      case 'warning': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading_pattern': return '📈';
      case 'recommendation': return '💡';
      case 'goal_suggestion': return '🎯';
      case 'habit_analysis': return '🔍';
      default: return '📊';
    }
  };

  return (
    <div className="ai-insights">
      <div className="modal-header">
        <h2>🤖 AI Reading Insights</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="insights-tabs">
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          📊 Insights
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations
        </button>
        <button 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goal Suggestions
        </button>
      </div>

      <div className="insights-content">
        {activeTab === 'insights' && (
          <div className="insights-section">
            <div className="section-header">
              <h3>AI-Powered Reading Insights</h3>
              <button 
                className="btn btn-primary"
                onClick={generateNewInsights}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate New Insights'}
              </button>
            </div>
            
            {insights.length === 0 ? (
              <div className="empty-state">
                <p>No insights yet. Generate AI-powered insights based on your reading patterns!</p>
              </div>
            ) : (
              <div className="insights-list">
                {insights.map(insight => (
                  <div key={insight.id} className="insight-card">
                    <div className="insight-header">
                      <div className="insight-title">
                        <span className="type-icon">{getTypeIcon(insight.type)}</span>
                        <h4>{insight.title}</h4>
                      </div>
                      <div className="insight-meta">
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: getCategoryColor(insight.category) }}
                        >
                          {getCategoryIcon(insight.category)} {insight.category}
                        </span>
                        <span className="confidence">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="insight-description">{insight.description}</p>
                    <div className="insight-footer">
                      <span className="insight-date">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                      {insight.actionable && (
                        <span className="actionable-badge">Actionable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h3>Personalized Book Recommendations</h3>
              <button 
                className="btn btn-primary"
                onClick={generateNewInsights}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Get New Recommendations'}
              </button>
            </div>
            
            {recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No recommendations yet. Generate personalized book recommendations based on your reading history!</p>
              </div>
            ) : (
              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-content">
                      <h4>📚 Recommendation #{index + 1}</h4>
                      <p>{rec}</p>
                    </div>
                    <div className="recommendation-actions">
                      <button className="btn btn-primary btn-small">
                        Add to Reading List
                      </button>
                      <button className="btn btn-secondary btn-small">
                        Learn More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-section">
            <div className="section-header">
              <h3>Smart Goal Suggestions</h3>
              <button 
                className="btn btn-primary"
                onClick={generateNewInsights}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Get New Suggestions'}
              </button>
            </div>
            
            {goalSuggestions.length === 0 ? (
              <div className="empty-state">
                <p>No goal suggestions yet. Generate smart goal suggestions based on your reading patterns!</p>
              </div>
            ) : (
              <div className="goals-list">
                {goalSuggestions.map((suggestion, index) => (
                  <div key={index} className="goal-suggestion-card">
                    <div className="goal-content">
                      <h4>🎯 Suggestion #{index + 1}</h4>
                      <p>{suggestion}</p>
                    </div>
                    <div className="goal-actions">
                      <button className="btn btn-primary btn-small">
                        Create Goal
                      </button>
                      <button className="btn btn-secondary btn-small">
                        Save for Later
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ai-info">
        <h4>🤖 About AI Insights</h4>
        <p>
          Our AI analyzes your reading patterns, preferences, and habits to provide personalized insights, 
          recommendations, and goal suggestions. The more you read and log sessions, the better our 
          recommendations become!
        </p>
        <div className="ai-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Pattern Analysis</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💡</span>
            <span>Smart Recommendations</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Goal Suggestions</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <span>Habit Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
