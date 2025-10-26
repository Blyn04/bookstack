import React, { useState, useEffect } from 'react';
import { Book, ReadingSession } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  bookId: string;
  bookTitle: string;
  type: 'reading_session' | 'goal_deadline' | 'book_start' | 'book_finish';
  duration?: number;
  pagesRead?: number;
  notes?: string;
}

interface ReadingCalendarProps {
  books: Book[];
  sessions: ReadingSession[];
  onClose: () => void;
}

const ReadingCalendar: React.FC<ReadingCalendarProps> = ({ books, sessions, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    generateEvents();
  }, [books, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateEvents = () => {
    const calendarEvents: CalendarEvent[] = [];

    sessions.forEach(session => {
      calendarEvents.push({
        id: `session-${session.id}`,
        title: `Reading Session`,
        date: new Date(session.date),
        bookId: session.bookId,
        bookTitle: books.find(b => b.id === session.bookId)?.title || 'Unknown Book',
        type: 'reading_session',
        duration: session.duration,
        pagesRead: session.pagesRead,
        notes: session.notes
      });
    });

    books.forEach(book => {
      if (book.startDate) {
        calendarEvents.push({
          id: `start-${book.id}`,
          title: `Started: ${book.title}`,
          date: new Date(book.startDate),
          bookId: book.id,
          bookTitle: book.title,
          type: 'book_start'
        });
      }

      if (book.finishDate) {
        calendarEvents.push({
          id: `finish-${book.id}`,
          title: `Finished: ${book.title}`,
          date: new Date(book.finishDate),
          bookId: book.id,
          bookTitle: book.title,
          type: 'book_finish'
        });
      }
    });

    setEvents(calendarEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => event.date.toDateString() === date.toDateString());
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'reading_session': return '📖';
      case 'book_start': return '🚀';
      case 'book_finish': return '✅';
      case 'goal_deadline': return '🎯';
      default: return '📅';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'reading_session': return '#2196F3';
      case 'book_start': return '#4CAF50';
      case 'book_finish': return '#FF9800';
      case 'goal_deadline': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="reading-calendar">
      <div className="modal-header">
        <h2>📅 Reading Calendar</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="calendar-controls">
        <div className="view-controls">
          <button 
            className={`btn btn-small ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`btn btn-small ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`btn btn-small ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div>

        {/* 🔹 FIXED SECTION: Centered arrows + month title */}
        <div className="calendar-navigation">
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => navigateMonth('prev')}
          >
            ←
          </button>
          <h3>{monthName}</h3>
          <button 
            className="btn btn-secondary btn-small"
            onClick={() => navigateMonth('next')}
          >
            →
          </button>
        </div>

        <button 
          className="btn btn-primary add-event-btn"
          onClick={() => setShowAddEvent(true)}
        >
          Add Event
        </button>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-month">
          <div className="calendar-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {daysInMonth.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${day ? 'has-date' : 'empty'}`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-events">
                      {getEventsForDate(day).slice(0, 3).map(event => (
                        <div 
                          key={event.id}
                          className="event-dot"
                          style={{ backgroundColor: getEventColor(event.type) }}
                          title={event.title}
                        />
                      ))}
                      {getEventsForDate(day).length > 3 && (
                        <div className="more-events">+{getEventsForDate(day).length - 3}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="selected-date-events">
          <h3>Events for {formatDate(selectedDate)}</h3>
          <div className="events-list">
            {getEventsForDate(selectedDate).map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span className="event-icon">{getEventIcon(event.type)}</span>
                  <h4>{event.title}</h4>
                </div>
                <div className="event-details">
                  <p><strong>Book:</strong> {event.bookTitle}</p>
                  {event.duration && <p><strong>Duration:</strong> {event.duration} minutes</p>}
                  {event.pagesRead && <p><strong>Pages Read:</strong> {event.pagesRead}</p>}
                  {event.notes && <p><strong>Notes:</strong> {event.notes}</p>}
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="no-events">No events for this date.</p>
            )}
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#2196F3' }}></span>
            <span>Reading Sessions</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>Book Started</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#FF9800' }}></span>
            <span>Book Finished</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#F44336' }}></span>
            <span>Goal Deadlines</span>
          </div>
        </div>
      </div>

      {showAddEvent && (
        <AddEventModal 
          books={books}
          onClose={() => setShowAddEvent(false)}
          onEventAdded={() => {
            setShowAddEvent(false);
            generateEvents();
          }}
        />
      )}
    </div>
  );
};

/* ========== Add Event Modal ========== */
interface AddEventModalProps {
  books: Book[];
  onClose: () => void;
  onEventAdded: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ books, onClose, onEventAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    bookId: '',
    type: 'reading_session' as 'reading_session' | 'goal_deadline' | 'book_start' | 'book_finish',
    duration: 0,
    pagesRead: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onEventAdded();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Calendar Event</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Book</label>
            <select
              value={formData.bookId}
              onChange={(e) => setFormData({...formData, bookId: e.target.value})}
              required
            >
              <option value="">Select a book...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Event Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="reading_session">Reading Session</option>
              <option value="book_start">Book Started</option>
              <option value="book_finish">Book Finished</option>
              <option value="goal_deadline">Goal Deadline</option>
            </select>
          </div>
          {formData.type === 'reading_session' && (
            <>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Pages Read</label>
                <input
                  type="number"
                  value={formData.pagesRead}
                  onChange={(e) => setFormData({...formData, pagesRead: Number(e.target.value)})}
                  min="0"
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingCalendar;
