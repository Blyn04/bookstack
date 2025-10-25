import React, { useState, useEffect } from 'react';
import { Book, BookStatus, FilterOptions, SearchOptions } from '../types';

interface AdvancedSearchProps {
  books: Book[];
  onSearch: (filteredBooks: Book[]) => void;
  onClose: () => void;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: FilterOptions;
  searchOptions: SearchOptions;
  createdAt: Date;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ books, onSearch, onClose }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    searchIn: ['title', 'author', 'notes']
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = () => {
    try {
      const saved = localStorage.getItem('bookstack-saved-searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const saveSearch = () => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters,
      searchOptions,
      createdAt: new Date()
    };
    
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('bookstack-saved-searches', JSON.stringify(updated));
    setShowSaveForm(false);
    setSearchName('');
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    setSearchOptions(search.searchOptions);
  };

  const deleteSavedSearch = (searchId: string) => {
    const updated = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updated);
    localStorage.setItem('bookstack-saved-searches', JSON.stringify(updated));
  };

  const applyFilters = () => {
    let filtered = [...books];

    // Text search
    if (searchOptions.query) {
      filtered = filtered.filter(book => {
        const searchFields = searchOptions.searchIn;
        return searchFields.some(field => {
          switch (field) {
            case 'title':
              return book.title.toLowerCase().includes(searchOptions.query.toLowerCase());
            case 'author':
              return book.author.toLowerCase().includes(searchOptions.query.toLowerCase());
            case 'notes':
              return book.notes?.toLowerCase().includes(searchOptions.query.toLowerCase()) || false;
            default:
              return false;
          }
        });
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(book => book.status === filters.status);
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(book => book.genre === filters.genre);
    }

    // Author filter
    if (filters.author) {
      filtered = filtered.filter(book => 
        book.author.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(book => {
        if (!book.startDate) return false;
        const bookDate = new Date(book.startDate);
        return bookDate >= filters.dateRange!.start && bookDate <= filters.dateRange!.end;
      });
    }

    onSearch(filtered);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchOptions({
      query: '',
      searchIn: ['title', 'author', 'notes']
    });
    onSearch(books);
  };

  const getUniqueGenres = () => {
    return Array.from(new Set(books.map(b => b.genre).filter(Boolean)));
  };

  // const getUniqueAuthors = () => {
  //   return Array.from(new Set(books.map(b => b.author)));
  // };

  return (
    <div className="advanced-search">
      <div className="modal-header">
        <h2>🔍 Advanced Search</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="search-content">
        <div className="search-section">
          <h3>Text Search</h3>
          <div className="form-group">
            <label>Search Query</label>
            <input
              type="text"
              value={searchOptions.query}
              onChange={(e) => setSearchOptions({...searchOptions, query: e.target.value})}
              placeholder="Enter search terms..."
            />
          </div>
          <div className="form-group">
            <label>Search In</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={searchOptions.searchIn.includes('title')}
                  onChange={(e) => {
                  const searchIn = e.target.checked
                    ? [...searchOptions.searchIn, 'title' as const]
                    : searchOptions.searchIn.filter(f => f !== 'title');
                  setSearchOptions({...searchOptions, searchIn});
                  }}
                />
                Title
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={searchOptions.searchIn.includes('author')}
                  onChange={(e) => {
                  const searchIn = e.target.checked
                    ? [...searchOptions.searchIn, 'author' as const]
                    : searchOptions.searchIn.filter(f => f !== 'author');
                  setSearchOptions({...searchOptions, searchIn});
                  }}
                />
                Author
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={searchOptions.searchIn.includes('notes')}
                  onChange={(e) => {
                  const searchIn = e.target.checked
                    ? [...searchOptions.searchIn, 'notes' as const]
                    : searchOptions.searchIn.filter(f => f !== 'notes');
                  setSearchOptions({...searchOptions, searchIn});
                  }}
                />
                Notes
              </label>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <h3>Filters</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({...filters, status: e.target.value as BookStatus})}
              >
                <option value="">All Statuses</option>
                <option value={BookStatus.NOT_STARTED}>Not Started</option>
                <option value={BookStatus.READING}>Reading</option>
                <option value={BookStatus.PAUSED}>Paused</option>
                <option value={BookStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => setFilters({...filters, genre: e.target.value})}
              >
                <option value="">All Genres</option>
                {getUniqueGenres().map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              value={filters.author || ''}
              onChange={(e) => setFilters({...filters, author: e.target.value})}
              placeholder="Filter by author..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date From</label>
              <input
                type="date"
                value={filters.dateRange?.start ? new Date(filters.dateRange.start).toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    start: new Date(e.target.value),
                    end: filters.dateRange?.end || new Date()
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label>Start Date To</label>
              <input
                type="date"
                value={filters.dateRange?.end ? new Date(filters.dateRange.end).toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    start: filters.dateRange?.start || new Date(),
                    end: new Date(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </div>

        <div className="saved-searches-section">
          <h3>Saved Searches</h3>
          {savedSearches.length === 0 ? (
            <p className="empty-state">No saved searches yet.</p>
          ) : (
            <div className="saved-searches-list">
              {savedSearches.map(search => (
                <div key={search.id} className="saved-search-item">
                  <div className="search-info">
                    <h4>{search.name}</h4>
                    <small>{new Date(search.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="search-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => loadSavedSearch(search)}
                    >
                      Load
                    </button>
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => deleteSavedSearch(search.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="search-actions">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear All
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSaveForm(true)}
          >
            Save Search
          </button>
        </div>
      </div>

      {showSaveForm && (
        <div className="modal-overlay" onClick={() => setShowSaveForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Save Search</h3>
              <button className="btn-icon" onClick={() => setShowSaveForm(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Search Name</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter a name for this search..."
              />
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveSearch}
                disabled={!searchName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
