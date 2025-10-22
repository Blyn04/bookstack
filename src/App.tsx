import React, { useState, useEffect } from 'react';
import './App.css';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import Analytics from './components/Analytics';
import SearchBar from './components/SearchBar';
import Shelves from './components/Shelves';
import ReadingGoals from './components/ReadingGoals';
import Achievements from './components/Achievements';
import KnowledgeManagement from './components/KnowledgeManagement';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { Book, BookStatus, Analytics as AnalyticsType, UserAchievement } from './types';
import { bookService } from './services/bookService';
import { analyticsService } from './services/analyticsService';
import { goalService } from './services/goalService';
import { achievementService } from './services/achievementService';

function AppContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedShelfId, setSelectedShelfId] = useState<string | 'all'>('all');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showKnowledgeManagement, setShowKnowledgeManagement] = useState(false);
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    loadBooks();
    loadAnalytics();
    updateGoalProgress();
    checkAchievements();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, filterStatus, selectedShelfId]);

  const loadBooks = async () => {
    const booksData = await bookService.getAllBooks();
    setBooks(booksData);
  };

  const loadAnalytics = async () => {
    const analyticsData = await analyticsService.getAnalytics();
    setAnalytics(analyticsData);
  };

  const updateGoalProgress = async () => {
    await goalService.updateGoalProgress();
  };

  const checkAchievements = async () => {
    try {
      const sessions = await bookService.getReadingSessions();
      const newAchievements = await achievementService.checkAchievements(books, sessions);
      if (newAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...newAchievements]);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.status === filterStatus);
    }

    if (selectedShelfId !== 'all') {
      filtered = filtered.filter(book => (book.shelves || []).includes(selectedShelfId as string));
    }

    setFilteredBooks(filtered);
  };

  const handleAddBook = async (bookData: Omit<Book, 'id'>) => {
    try {
      const newBook = await bookService.addBook(bookData);
      setBooks(prev => [...prev, newBook]);
      loadAnalytics();
      updateGoalProgress();
      checkAchievements();
      setShowAddForm(false); 
    } catch (err: any) {
      alert(err?.message || 'Failed to add book');
    }
  };

  const handleUpdateBook = async (id: string, updates: Partial<Book>) => {
    const updatedBook = await bookService.updateBook(id, updates);
    setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
    loadAnalytics();
    updateGoalProgress();
    checkAchievements();
  };

  const handleDeleteBook = async (id: string) => {
    await bookService.deleteBook(id);
    setBooks(prev => prev.filter(book => book.id !== id));
    loadAnalytics();
    updateGoalProgress();
    checkAchievements();
  };

  const handleExportBooks = () => {
    const dataStr = JSON.stringify(books, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'reading-list.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Book Reading Tracker</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button 
            className="btn btn-secondary"
            onClick={() => setShowKnowledgeManagement(true)}
          >
            🧠 Knowledge
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAchievements(true)}
          >
            🏆 Achievements
            {newAchievements.length > 0 && (
              <span className="notification-badge">{newAchievements.length}</span>
            )}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Book
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleExportBooks}
          >
            Export List
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            selectedShelfId={selectedShelfId}
            onShelfChange={setSelectedShelfId}
          />
        </div>

        <div className="content-grid">
          <div className="books-section">
            <BookList 
              books={filteredBooks}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
            />
          </div>

          <div className="sidebar-section">
            <div className="analytics-section">
              {analytics && <Analytics analytics={analytics} />}
            </div>
            
            <div className="goals-section">
              <ReadingGoals onGoalUpdate={updateGoalProgress} />
            </div>

            <div className="goals-section">
              <Shelves selectedShelfId={selectedShelfId} onShelfChange={setSelectedShelfId} />
            </div>
          </div>
        </div>

        {showAddForm && (
          <BookForm 
            onSubmit={handleAddBook}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {showKnowledgeManagement && (
          <div className="modal-overlay">
            <div className="modal knowledge-modal">
              <KnowledgeManagement 
                books={books}
                onClose={() => setShowKnowledgeManagement(false)}
              />
            </div>
          </div>
        )}

        {showAchievements && (
          <div className="modal-overlay">
            <div className="modal achievements-modal">
              <div className="modal-header">
                <h2>🏆 Achievements</h2>
                <button 
                  className="btn-icon" 
                  onClick={() => setShowAchievements(false)}
                >
                  ✕
                </button>
              </div>
              <Achievements 
                onNewAchievement={(achievement) => {
                  setNewAchievements(prev => prev.filter(a => a.achievementId !== achievement.achievementId));
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
