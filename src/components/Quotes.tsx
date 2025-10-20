import React, { useState, useEffect } from 'react';
import { Book, Quote } from '../types';
import { bookService } from '../services/bookService';

interface QuotesProps {
  book: Book;
  onUpdate: (updated: Book) => void;
}

const Quotes: React.FC<QuotesProps> = ({ book, onUpdate }) => {
  const [text, setText] = useState('');
  const [page, setPage] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>(book.quotes || []);

  useEffect(() => {
    setQuotes(book.quotes || []);
  }, [book]);

  const addQuote = async () => {
    if (!text.trim()) return;
    const updated = await bookService.addQuote(book.id, {
      text: text.trim(),
      page: typeof page === 'number' ? page : undefined,
      note: note.trim() || undefined,
    });
    onUpdate(updated);
    setText('');
    setPage('');
    setNote('');
  };

  const removeQuote = async (id: string) => {
    const updated = await bookService.deleteQuote(book.id, id);
    onUpdate(updated);
  };

  const exportMarkdown = () => {
    bookService.exportQuotesMarkdown(book);
  };

  return (
    <div className="quotes-section">
      <h4>Quotes & Highlights</h4>

      <div className="quotes-form">
        <textarea
          placeholder="Paste a quote or highlight..."
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="quotes-form-row">
          <input
            type="number"
            placeholder="Page"
            value={page}
            onChange={(e) => setPage(e.target.value ? Number(e.target.value) : '')}
            min={1}
          />
          <input
            type="text"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn btn-primary" onClick={addQuote}>Save Quote</button>
          <button className="btn btn-secondary" onClick={exportMarkdown}>Export .md</button>
        </div>
      </div>

      {quotes.length === 0 ? (
        <p className="quotes-empty">No quotes yet.</p>
      ) : (
        <ul className="quotes-list">
          {quotes.map(q => (
            <li key={q.id} className="quote-item">
              <blockquote className="quote-text">“{q.text}”</blockquote>
              <div className="quote-meta">
                {q.page ? <span className="quote-tag">p. {q.page}</span> : null}
                <span className="quote-tag">{new Date(q.createdAt).toLocaleDateString()}</span>
                {q.note ? <span className="quote-note">{q.note}</span> : null}
                <button className="btn-icon" onClick={() => removeQuote(q.id)} title="Delete">🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Quotes;


