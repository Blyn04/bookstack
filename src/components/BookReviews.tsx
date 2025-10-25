import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BookReviewsProps {
  book: Book;
  onClose: () => void;
}

const BookReviews: React.FC<BookReviewsProps> = ({ book, onClose }) => {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
  }, [book.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviews = () => {
    try {
      const saved = localStorage.getItem(`bookstack-reviews-${book.id}`);
      if (saved) {
        setReviews(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const saveReviews = (newReviews: BookReview[]) => {
    try {
      localStorage.setItem(`bookstack-reviews-${book.id}`, JSON.stringify(newReviews));
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  };

  const addReview = (reviewData: Omit<BookReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful'>) => {
    const newReview: BookReview = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      helpful: 0,
      notHelpful: 0
    };
    
    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    saveReviews(updatedReviews);
    setShowAddReview(false);
  };

  const markHelpful = (reviewId: string, isHelpful: boolean) => {
    const updatedReviews = reviews.map(review => {
      if (review.id === reviewId) {
        if (isHelpful) {
          return { ...review, helpful: review.helpful + 1 };
        } else {
          return { ...review, notHelpful: review.notHelpful + 1 };
        }
      }
      return review;
    });
    
    setReviews(updatedReviews);
    saveReviews(updatedReviews);
  };

  const getSortedReviews = () => {
    let sorted = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        sorted.sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful));
        break;
    }
    
    if (filterRating !== 'all') {
      sorted = sorted.filter(review => review.rating === filterRating);
    }
    
    return sorted;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const sortedReviews = getSortedReviews();
  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="book-reviews">
      <div className="modal-header">
        <h2>📖 Reviews for {book.title}</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="reviews-summary">
        <div className="rating-overview">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars">
              {renderStars(Math.round(parseFloat(averageRating.toString())))}
            </div>
            <span className="rating-count">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="rating-distribution">
          <h4>Rating Distribution</h4>
          {ratingDistribution.map((count, index) => (
            <div key={index} className="rating-bar">
              <span className="rating-label">{5 - index} ⭐</span>
              <div className="rating-bar-container">
                <div 
                  className="rating-bar-fill"
                  style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="rating-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-controls">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating">Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        <div className="filter-controls">
          <label>Filter by rating:</label>
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddReview(true)}
        >
          Write a Review
        </button>
      </div>

      <div className="reviews-list">
        {sortedReviews.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet. Be the first to review this book!</p>
          </div>
        ) : (
          sortedReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-meta">
                  <span className="review-author">User {review.userId.slice(-4)}</span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              <div className="review-content">
                <h4 className="review-title">{review.title}</h4>
                <p className="review-text">{review.content}</p>
              </div>
              
              <div className="review-footer">
                <div className="review-actions">
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => markHelpful(review.id, true)}
                  >
                    👍 Helpful ({review.helpful})
                  </button>
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => markHelpful(review.id, false)}
                  >
                    👎 Not Helpful ({review.notHelpful})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddReview && (
        <AddReviewModal 
          book={book}
          onClose={() => setShowAddReview(false)}
          onReviewAdded={addReview}
        />
      )}
    </div>
  );
};

// Add Review Modal Component
interface AddReviewModalProps {
  book: Book;
  onClose: () => void;
  onReviewAdded: (review: Omit<BookReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful'>) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ book, onClose, onReviewAdded }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    onReviewAdded({
      bookId: book.id,
      userId: 'current-user',
      rating: formData.rating,
      title: formData.title,
      content: formData.content
    });
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="star-rating interactive">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => onRatingChange(star)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Write a Review for {book.title}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>Rating *</label>
            {renderStars(formData.rating, (rating) => setFormData({...formData, rating}))}
          </div>
          
          <div className="form-group">
            <label>Review Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Summarize your review in a few words..."
              required
            />
          </div>
          
          <div className="form-group">
            <label>Review Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={6}
              placeholder="Share your thoughts about this book. What did you like or dislike? Would you recommend it to others?"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookReviews;
