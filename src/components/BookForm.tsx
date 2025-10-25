import React, { useState } from 'react';
import { Book, BookStatus } from '../types';

interface BookFormProps {
  onSubmit: (bookData: Omit<Book, 'id'>) => void;
  onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    totalPages: 0,
    currentPage: 0,
    status: BookStatus.NOT_STARTED,
    genre: '',
    isbn: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (formData.totalPages <= 0) {
      newErrors.totalPages = 'Total pages must be greater than 0';
    }

    if (formData.currentPage < 0 || formData.currentPage > formData.totalPages) {
      newErrors.currentPage = 'Current page must be between 0 and total pages';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        startDate: formData.status === BookStatus.READING ? new Date() : undefined,
        finishDate: formData.status === BookStatus.COMPLETED ? new Date() : undefined,
      });
      // Reset form after successful submission
      setFormData({
        title: '',
        author: '',
        totalPages: 0,
        currentPage: 0,
        status: BookStatus.NOT_STARTED,
        genre: '',
        isbn: '',
        notes: ''
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Book</h2>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter book title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className={errors.author ? 'error' : ''}
              placeholder="Enter author name"
            />
            {errors.author && <span className="error-message">{errors.author}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalPages">Total Pages *</label>
              <input
                id="totalPages"
                type="number"
                value={formData.totalPages}
                onChange={(e) => handleChange('totalPages', Number(e.target.value))}
                className={errors.totalPages ? 'error' : ''}
                min="1"
                placeholder="0"
              />
              {errors.totalPages && <span className="error-message">{errors.totalPages}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currentPage">Current Page</label>
              <input
                id="currentPage"
                type="number"
                value={formData.currentPage}
                onChange={(e) => handleChange('currentPage', Number(e.target.value))}
                className={errors.currentPage ? 'error' : ''}
                min="0"
                max={formData.totalPages}
                placeholder="0"
              />
              {errors.currentPage && <span className="error-message">{errors.currentPage}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value={BookStatus.NOT_STARTED}>Not Started</option>
                <option value={BookStatus.READING}>Reading</option>
                <option value={BookStatus.PAUSED}>Paused</option>
                <option value={BookStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input
                id="genre"
                type="text"
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                placeholder="e.g., Fiction, Non-fiction"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={formData.isbn}
              onChange={(e) => handleChange('isbn', e.target.value)}
              placeholder="Optional ISBN"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Any additional notes about this book..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
