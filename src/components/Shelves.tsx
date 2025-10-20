import React, { useEffect, useState } from 'react';
import { Shelf } from '../types';
import { bookService } from '../services/bookService';

interface ShelvesProps {
  selectedShelfId: string | 'all';
  onShelfChange: (shelfId: string | 'all') => void;
}

const Shelves: React.FC<ShelvesProps> = ({ selectedShelfId, onShelfChange }) => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [name, setName] = useState('');

  const load = async () => {
    const data = await bookService.getShelves();
    setShelves(data);
  };

  useEffect(() => {
    load();
  }, []);

  const addShelf = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await bookService.addShelf(trimmed);
    setName('');
    load();
  };

  const removeShelf = async (id: string) => {
    await bookService.deleteShelf(id);
    if (selectedShelfId === id) onShelfChange('all');
    load();
  };

  return (
    <div className="shelves">
      <div className="shelves-header">
        <h3>Shelves</h3>
      </div>
      <div className="shelves-add">
        <input
          type="text"
          placeholder="New shelf name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addShelf}>Add</button>
      </div>

      <div className="shelf-filters">
        <button
          className={`shelf-filter ${selectedShelfId === 'all' ? 'active' : ''}`}
          onClick={() => onShelfChange('all')}
        >
          All
        </button>
        {shelves.map(shelf => (
          <div key={shelf.id} className="shelf-row">
            <button
              className={`shelf-filter ${selectedShelfId === shelf.id ? 'active' : ''}`}
              onClick={() => onShelfChange(shelf.id)}
              title={shelf.name}
            >
              {shelf.name}
            </button>
            <button className="btn-icon" onClick={() => removeShelf(shelf.id)} title="Delete">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shelves;


