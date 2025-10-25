import React, { useState } from 'react';
import { ReadingSession } from '../types';
import { bookService } from '../services/bookService';

interface ReadingSessionFormProps {
  bookId: string;
  bookTitle: string;
  currentPage: number;
  totalPages: number;
  onSubmit: (session: ReadingSession) => void;
  onCancel: () => void;
}

const ReadingSessionForm: React.FC<ReadingSessionFormProps> = ({
  bookId,
  bookTitle,
  currentPage,
  totalPages,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    pagesRead: 0,
    duration: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.pagesRead <= 0) {
      newErrors.pagesRead = 'Pages read must be greater than 0';
    }

    if (formData.pagesRead > (totalPages - currentPage)) {
      newErrors.pagesRead = `Cannot read more than ${totalPages - currentPage} pages`;
    }

    if (formData.duration < 0) {
      newErrors.duration = 'Duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const session = await bookService.addReadingSession({
        bookId,
        date: new Date(formData.date),
        pagesRead: formData.pagesRead,
        duration: formData.duration,
        notes: formData.notes || undefined
      });
      onSubmit(session);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getReadingSpeed = () => {
    if (formData.duration === 0 || formData.pagesRead === 0) return 0;
    return Math.round((formData.pagesRead / (formData.duration / 60)) * 10) / 10;
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Reading Session</h2>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>

        <div className="session-book-info">
          <h3>{bookTitle}</h3>
          <p>Current Progress: {currentPage} / {totalPages} pages</p>
        </div>

        <form onSubmit={handleSubmit} className="session-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pagesRead">Pages Read *</label>
              <input
                id="pagesRead"
                type="number"
                value={formData.pagesRead}
                onChange={(e) => handleChange('pagesRead', Number(e.target.value))}
                className={errors.pagesRead ? 'error' : ''}
                min="1"
                max={totalPages - currentPage}
                placeholder="0"
              />
              {errors.pagesRead && <span className="error-message">{errors.pagesRead}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', Number(e.target.value))}
                className={errors.duration ? 'error' : ''}
                min="0"
                placeholder="0"
              />
              {errors.duration && <span className="error-message">{errors.duration}</span>}
            </div>

            <div className="form-group">
              <label>Reading Speed</label>
              <div className="speed-display">
                {getReadingSpeed() > 0 ? (
                  <span className="speed-value">{getReadingSpeed()} pages/hour</span>
                ) : (
                  <span className="speed-placeholder">Enter duration to calculate</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any thoughts about this reading session..."
            />
          </div>

          <div className="session-preview">
            <h4>Session Preview</h4>
            <div className="preview-stats">
              <div className="preview-stat">
                <span className="stat-label">New Progress:</span>
                <span className="stat-value">{currentPage + formData.pagesRead} / {totalPages} pages</span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">Progress:</span>
                <span className="stat-value">{Math.round(((currentPage + formData.pagesRead) / totalPages) * 100)}%</span>
              </div>
              {formData.duration > 0 && (
                <div className="preview-stat">
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{Math.round(formData.duration / 60 * 10) / 10} hours</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingSessionForm;
