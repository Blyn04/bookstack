import React, { useEffect, useState } from 'react';
import { BookStatus } from '../types';
import { bookService } from '../services/bookService';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: BookStatus | 'all';
  onFilterChange: (status: BookStatus | 'all') => void;
  selectedShelfId?: string | 'all';
  onShelfChange?: (shelfId: string | 'all') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  filterStatus, 
  onFilterChange,
  selectedShelfId = 'all',
  onShelfChange
}) => {
  const [shelves, setShelves] = useState<{id:string; name:string}[]>([]);

  useEffect(() => {
    (async () => {
      const data = await bookService.getShelves();
      setShelves(data);
    })();
  }, []);
  const statusOptions = [
    { value: 'all', label: 'All Books' },
    { value: BookStatus.NOT_STARTED, label: 'Not Started' },
    { value: BookStatus.READING, label: 'Reading' },
    { value: BookStatus.PAUSED, label: 'Paused' },
    { value: BookStatus.COMPLETED, label: 'Completed' }
  ];

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value as BookStatus | 'all')}
            className="status-filter"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {searchQuery && (
        <div className="search-results-info">
          <span>Searching for: "{searchQuery}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
