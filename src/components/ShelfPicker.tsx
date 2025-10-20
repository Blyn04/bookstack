import React, { useEffect, useState } from 'react';
import { Shelf } from '../types';
import { bookService } from '../services/bookService';

interface ShelfPickerProps {
  shelvesSelected: string[];
  onChange: (shelfIds: string[]) => void;
}

const ShelfPicker: React.FC<ShelfPickerProps> = ({ shelvesSelected, onChange }) => {
  const [shelves, setShelves] = useState<Shelf[]>([]);

  useEffect(() => {
    (async () => {
      const data = await bookService.getShelves();
      setShelves(data);
    })();
  }, []);

  const toggleShelf = (id: string) => {
    const next = shelvesSelected.includes(id)
      ? shelvesSelected.filter(s => s !== id)
      : [...shelvesSelected, id];
    onChange(next);
  };

  if (shelves.length === 0) return null;

  return (
    <div className="form-group">
      <label>Shelves:</label>
      <div className="shelf-picker">
        {shelves.map(shelf => (
          <button
            key={shelf.id}
            type="button"
            className={`shelf-chip ${shelvesSelected.includes(shelf.id) ? 'active' : ''}`}
            onClick={() => toggleShelf(shelf.id)}
            title={shelf.name}
          >
            {shelf.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShelfPicker;


