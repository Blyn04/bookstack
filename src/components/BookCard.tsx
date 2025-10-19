import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { bookService } from '../services/bookService';

interface BookCardProps {
  book: Book;
  onUpdate: (id: string, updates: Partial<Book>) => void;
  onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    currentPage: book.currentPage,
    status: book.status,
    rating: book.rating || 0,
    notes: book.notes || ''
  });

  const progress = bookService.calculateReadingProgress(book);
  const readingTime = bookService.calculateReadingTime(book.id);

  const handleSave = async () => {
    await onUpdate(book.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      currentPage: book.currentPage,
      status: book.status,
      rating: book.rating || 0,
      notes: book.notes || ''
    });
    setIsEditing(false);
  };

  const handleAddReadingSession = async () => {
    const pagesRead = prompt('How many pages did you read?');
    if (pagesRead && !isNaN(Number(pagesRead))) {
      const duration = prompt('How many minutes did you spend reading? (optional)');
      await bookService.addReadingSession({
        bookId: book.id,
        date: new Date(),
        pagesRead: Number(pagesRead),
        duration: duration ? Number(duration) : 0
      });
      // Refresh the book data
      window.location.reload();
    }
  };

  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case BookStatus.COMPLETED:
        return '#4CAF50';
      case BookStatus.READING:
        return '#2196F3';
      case BookStatus.PAUSED:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: BookStatus) => {
    switch (status) {
      case BookStatus.COMPLETED:
        return 'Completed';
      case BookStatus.READING:
        return 'Reading';
      case BookStatus.PAUSED:
        return 'Paused';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="book-card">
      <div className="book-card-header">
        <h3 className="book-title">{book.title}</h3>
        <div className="book-actions">
          <button 
            className="btn-icon"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit book"
          >
            ✏️
          </button>
          <button 
            className="btn-icon"
            onClick={() => onDelete(book.id)}
            title="Delete book"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="book-info">
        <p className="book-author">by {book.author}</p>
        {book.genre && <span className="book-genre">{book.genre}</span>}
      </div>

      <div className="book-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {book.currentPage} / {book.totalPages} pages ({progress}%)
        </span>
      </div>

      <div className="book-status">
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(book.status) }}
        >
          {getStatusText(book.status)}
        </span>
      </div>

      {book.rating && (
        <div className="book-rating">
          <span>Rating: {'⭐'.repeat(book.rating)}</span>
        </div>
      )}

      {isEditing && (
        <div className="edit-form">
          <div className="form-group">
            <label>Current Page:</label>
            <input
              type="number"
              value={editData.currentPage}
              onChange={(e) => setEditData({...editData, currentPage: Number(e.target.value)})}
              min="0"
              max={book.totalPages}
            />
          </div>
          
          <div className="form-group">
            <label>Status:</label>
            <select
              value={editData.status}
              onChange={(e) => setEditData({...editData, status: e.target.value as BookStatus})}
            >
              <option value={BookStatus.NOT_STARTED}>Not Started</option>
              <option value={BookStatus.READING}>Reading</option>
              <option value={BookStatus.PAUSED}>Paused</option>
              <option value={BookStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Rating:</label>
            <select
              value={editData.rating}
              onChange={(e) => setEditData({...editData, rating: Number(e.target.value)})}
            >
              <option value={0}>No Rating</option>
              <option value={1}>⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={5}>⭐⭐⭐⭐⭐</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData({...editData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {book.status === BookStatus.READING && (
        <button 
          className="btn btn-primary btn-full"
          onClick={handleAddReadingSession}
        >
          Log Reading Session
        </button>
      )}

      {readingTime > 0 && (
        <div className="reading-stats">
          <small>Total reading time: {Math.round(readingTime / 60)} hours</small>
        </div>
      )}
    </div>
  );
};

export default BookCard;
