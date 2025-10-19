import React, { useState, useEffect } from 'react';
import { ReadingSession } from '../types';
import { bookService } from '../services/bookService';

interface ReadingSessionHistoryProps {
  bookId: string;
  onClose: () => void;
}

const ReadingSessionHistory: React.FC<ReadingSessionHistoryProps> = ({ bookId, onClose }) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [bookId]);

  const loadSessions = async () => {
    try {
      const bookSessions = await bookService.getReadingSessions(bookId);
      setSessions(bookSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getReadingSpeed = (pagesRead: number, duration: number) => {
    if (duration === 0) return 0;
    return Math.round((pagesRead / (duration / 60)) * 10) / 10;
  };

  const getTotalStats = () => {
    const totalPages = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const avgSpeed = totalTime > 0 ? Math.round((totalPages / (totalTime / 60)) * 10) / 10 : 0;
    
    return { totalPages, totalTime, avgSpeed };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Reading Sessions</h2>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
          <div className="loading-state">
            <p>Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal session-history-modal">
        <div className="modal-header">
          <h2>Reading Sessions</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <p>No reading sessions recorded yet.</p>
          </div>
        ) : (
          <>
            <div className="session-stats">
              <div className="stat-item">
                <span className="stat-label">Total Sessions:</span>
                <span className="stat-value">{sessions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Pages:</span>
                <span className="stat-value">{stats.totalPages}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Time:</span>
                <span className="stat-value">{formatDuration(stats.totalTime)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Speed:</span>
                <span className="stat-value">{stats.avgSpeed} pages/hour</span>
              </div>
            </div>

            <div className="sessions-list">
              {sessions.map((session, index) => (
                <div key={session.id} className="session-item">
                  <div className="session-header">
                    <div className="session-date">
                      {formatDate(session.date)}
                    </div>
                    <div className="session-number">
                      Session #{sessions.length - index}
                    </div>
                  </div>
                  
                  <div className="session-details">
                    <div className="session-stat">
                      <span className="stat-icon">📄</span>
                      <span className="stat-text">{session.pagesRead} pages</span>
                    </div>
                    
                    {session.duration > 0 && (
                      <div className="session-stat">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-text">{formatDuration(session.duration)}</span>
                      </div>
                    )}
                    
                    {session.duration > 0 && (
                      <div className="session-stat">
                        <span className="stat-icon">🚀</span>
                        <span className="stat-text">{getReadingSpeed(session.pagesRead, session.duration)} pages/hour</span>
                      </div>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="session-notes">
                      <span className="notes-label">Notes:</span>
                      <span className="notes-text">{session.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReadingSessionHistory;
