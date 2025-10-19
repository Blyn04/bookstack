import React from 'react';
import { Book } from '../types';
import BookCard from './BookCard';

interface BookListProps {
  books: Book[];
  onUpdateBook: (id: string, updates: Partial<Book>) => void;
  onDeleteBook: (id: string) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onUpdateBook, onDeleteBook }) => {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <h3>No books found</h3>
        <p>Start by adding your first book to track your reading progress!</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      <div className="book-list-header">
        <h2>Your Books ({books.length})</h2>
      </div>
      <div className="book-grid">
        {books.map(book => (
          <BookCard
            key={book.id}
            book={book}
            onUpdate={onUpdateBook}
            onDelete={onDeleteBook}
          />
        ))}
      </div>
    </div>
  );
};

export default BookList;
