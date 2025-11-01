import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Login from './components/Login';
import Signup from './components/Signup';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import Analytics from './components/Analytics';
import SearchBar from './components/SearchBar';
import Shelves from './components/Shelves';
import ReadingGoals from './components/ReadingGoals';
import Achievements from './components/Achievements';
import KnowledgeManagement from './components/KnowledgeManagement';
import SocialFeatures from './components/SocialFeatures';
import AIInsights from './components/AIInsights';
import AdvancedSearch from './components/AdvancedSearch';
import ReadingCalendar from './components/ReadingCalendar';
import ExportImport from './components/ExportImport';
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
  const [user, setUser] = useState<string | null>(localStorage.getItem('user'));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [selectedShelfId, setSelectedShelfId] = useState<string | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showKnowledgeManagement, setShowKnowledgeManagement] = useState(false);
  const [showSocialFeatures, setShowSocialFeatures] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showReadingCalendar, setShowReadingCalendar] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    if (user) {
      loadBooks();
      loadAnalytics();
      updateGoalProgress();
      checkAchievements();
    }
  }, [user]);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, filterStatus, selectedShelfId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const newBook = await bookService.addBook(bookData);
    setBooks(prev => [...prev, newBook]);
    loadAnalytics();
    updateGoalProgress();
    checkAchievements();
    setShowAddForm(false);
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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'reading-list.json');
    linkElement.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="App">
      <Header
        onAddBook={() => setShowAddForm(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onShowKnowledge={() => setShowKnowledgeManagement(true)}
        onShowSocial={() => setShowSocialFeatures(true)}
        onShowAI={() => setShowAIInsights(true)}
        onShowAdvancedSearch={() => setShowAdvancedSearch(true)}
        onShowCalendar={() => setShowReadingCalendar(true)}
        onShowExportImport={() => setShowExportImport(true)}
        onExportBooks={handleExportBooks}
        achievementsCount={newAchievements.length}
        onLogin={() => setShowLogin(true)}
        onSignup={() => setShowSignup(true)}
        onLogout={handleLogout}
        user={user}
      />

      {/* 🧠 Show login prompt when no user */}
      {!user && (
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          Please log in or sign up to access your reading tracker.
        </p>
      )}

      {/* ✅ Your full main UI (only shown if logged in) */}
      {user && (
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
              {analytics && <Analytics analytics={analytics} />}
              <ReadingGoals onGoalUpdate={updateGoalProgress} />
              <Shelves selectedShelfId={selectedShelfId} onShelfChange={setSelectedShelfId} />
            </div>
          </div>

          {/* Modals below */}
          {showAddForm && (
            <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <BookForm onSubmit={handleAddBook} onCancel={() => setShowAddForm(false)} />
              </div>
            </div>
          )}

          {showKnowledgeManagement && (
            <div className="modal-overlay" onClick={() => setShowKnowledgeManagement(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <KnowledgeManagement
                  books={books}
                  onClose={() => setShowKnowledgeManagement(false)}
                />
              </div>
            </div>
          )}

          {showSocialFeatures && (
            <div className="modal-overlay" onClick={() => setShowSocialFeatures(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <SocialFeatures
                  books={books}
                  onClose={() => setShowSocialFeatures(false)}
                />
              </div>
            </div>
          )}

          {showAIInsights && (
            <div className="modal-overlay" onClick={() => setShowAIInsights(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <AIInsights
                  books={books}
                  sessions={[]}
                  analytics={analytics!}
                  onClose={() => setShowAIInsights(false)}
                />
              </div>
            </div>
          )}

          {showAdvancedSearch && (
            <div className="modal-overlay" onClick={() => setShowAdvancedSearch(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <AdvancedSearch
                  books={books}
                  onSearch={(filtered) => {
                    setFilteredBooks(filtered);
                    setShowAdvancedSearch(false);
                  }}
                  onClose={() => setShowAdvancedSearch(false)}
                />
              </div>
            </div>
          )}

          {showReadingCalendar && (
            <div className="modal-overlay" onClick={() => setShowReadingCalendar(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <ReadingCalendar
                  books={books}
                  sessions={[]}
                  onClose={() => setShowReadingCalendar(false)}
                />
              </div>
            </div>
          )}

          {showExportImport && (
            <div className="modal-overlay" onClick={() => setShowExportImport(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <ExportImport
                  books={books}
                  onClose={() => setShowExportImport(false)}
                  onImportComplete={() => {
                    setShowExportImport(false);
                    loadBooks();
                    loadAnalytics();
                  }}
                />
              </div>
            </div>
          )}

          {showAchievements && (
            <div className="modal-overlay" onClick={() => setShowAchievements(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <Achievements
                  onNewAchievement={(achievement) => {
                    setNewAchievements(prev =>
                      prev.filter(a => a.achievementId !== achievement.achievementId)
                    );
                  }}
                />
              </div>
            </div>
          )}
        </main>
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} onLoginSuccess={setUser} />}
      {showSignup && <Signup onClose={() => setShowSignup(false)} onSignupSuccess={setUser} />}
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
