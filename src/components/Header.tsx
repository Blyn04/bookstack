import React, { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';

interface HeaderProps {
  onAddBook: () => void;
  onShowAchievements: () => void;
  onShowKnowledge: () => void;
  onShowSocial: () => void;
  onShowAI: () => void;
  onShowAdvancedSearch: () => void;
  onShowCalendar: () => void;
  onShowExportImport: () => void;
  onExportBooks: () => void;
  achievementsCount: number;
  onLogin: () => void;
  onSignup: () => void;
  user: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddBook,
  onShowAchievements,
  onShowKnowledge,
  onShowSocial,
  onShowAI,
  onShowAdvancedSearch,
  onShowCalendar,
  onShowExportImport,
  onExportBooks,
  achievementsCount,
  onLogin,
  onSignup,
  user,
  onLogout,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="app-header">
        <h1>📚 Book Reading Tracker</h1>

        <div className="header-actions">
          <ThemeToggle />

          {user ? (
            <>
              <button className="btn btn-secondary" onClick={onShowKnowledge}>🧠 Knowledge</button>
              <button className="btn btn-secondary" onClick={onShowSocial}>🌟 Social</button>
              <button className="btn btn-secondary" onClick={onShowAI}>🤖 AI Insights</button>
              <button className="btn btn-secondary" onClick={onShowAdvancedSearch}>🔍 Advanced Search</button>
              <button className="btn btn-secondary" onClick={onShowCalendar}>📅 Calendar</button>
              <button className="btn btn-secondary" onClick={onShowExportImport}>📤 Export/Import</button>
              <button className="btn btn-secondary" onClick={onShowAchievements}>
                🏆 Achievements
                {achievementsCount > 0 && (
                  <span className="notification-badge">{achievementsCount}</span>
                )}
              </button>
              <button className="btn btn-primary" onClick={onAddBook}>Add Book</button>
              <button className="btn btn-secondary" onClick={onExportBooks}>Export List</button>
              <button className="btn btn-danger" onClick={handleLogoutClick}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={onLogin}>Login</button>
              <button className="btn btn-secondary" onClick={onSignup}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmLogout}>Yes, Logout</button>
              <button className="btn btn-secondary" onClick={cancelLogout}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
