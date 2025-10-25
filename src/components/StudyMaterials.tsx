import React, { useState, useEffect } from 'react';
import { StudyMaterial, Concept, Book } from '../types';
import { knowledgeService } from '../services/knowledgeService';

interface StudyMaterialsProps {
  onClose?: () => void;
}

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ onClose }) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, conceptsData] = await Promise.all([
        knowledgeService.getAllStudyMaterials(),
        knowledgeService.getAllConcepts()
      ]);
      
      setStudyMaterials(materialsData);
      setConcepts(conceptsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getFilteredMaterials = (): StudyMaterial[] => {
    if (filterType === 'all') {
      return studyMaterials;
    }
    return studyMaterials.filter(material => material.type === filterType);
  };

  const handleCreateMaterial = async (materialData: {
    title: string;
    type: StudyMaterial['type'];
    concepts: string[];
    books: string[];
  }) => {
    try {
      const newMaterial = await knowledgeService.generateStudyMaterial(
        materialData.type,
        materialData.concepts,
        materialData.books,
        materialData.title
      );
      
      setStudyMaterials(prev => [...prev, newMaterial]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating study material:', error);
    }
  };

  const handleExportMaterial = async (material: StudyMaterial, format: 'markdown' | 'json') => {
    try {
      const content = await knowledgeService.exportStudyMaterial(material.id, format);
      
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/markdown' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${material.title}.${format === 'json' ? 'json' : 'md'}`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting material:', error);
    }
  };

  const getMaterialIcon = (type: StudyMaterial['type']): string => {
    const icons = {
      'summary': '📄',
      'mindmap': '🧠',
      'concept_map': '🗺️',
      'flashcards': '🃏',
      'notes': '📝'
    };
    return icons[type] || '📄';
  };

  const getConceptNames = (conceptIds: string[]): string[] => {
    return conceptIds.map(id => {
      const concept = concepts.find(c => c.id === id);
      return concept?.name || 'Unknown';
    });
  };

  return (
    <div className="study-materials-container">
      <div className="study-materials-header">
        <h3>📚 Study Materials</h3>
        <div className="materials-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="type-filter"
          >
            <option value="all">All Types</option>
            <option value="summary">Summaries</option>
            <option value="mindmap">Mind Maps</option>
            <option value="concept_map">Concept Maps</option>
            <option value="flashcards">Flashcards</option>
            <option value="notes">Notes</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create New
          </button>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div className="study-materials-content">
        <div className="materials-list">
          {getFilteredMaterials().map(material => (
            <div key={material.id} className="material-card">
              <div className="material-header">
                <div className="material-title">
                  <span className="material-icon">{getMaterialIcon(material.type)}</span>
                  <h4>{material.title}</h4>
                </div>
                <div className="material-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => setSelectedMaterial(material)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleExportMaterial(material, 'markdown')}
                  >
                    Export MD
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleExportMaterial(material, 'json')}
                  >
                    Export JSON
                  </button>
                </div>
              </div>
              
              <div className="material-meta">
                <div className="material-type">
                  <strong>Type:</strong> {material.type.replace('_', ' ')}
                </div>
                <div className="material-concepts">
                  <strong>Concepts:</strong> {getConceptNames(material.concepts).join(', ')}
                </div>
                <div className="material-date">
                  <strong>Created:</strong> {material.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedMaterial && (
          <div className="material-viewer">
            <div className="viewer-header">
              <h4>{selectedMaterial.title}</h4>
              <button
                className="btn btn-sm"
                onClick={() => setSelectedMaterial(null)}
              >
                Close
              </button>
            </div>
            <div className="viewer-content">
              <pre className="material-content">{selectedMaterial.content}</pre>
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateStudyMaterialForm
          concepts={concepts}
          books={books}
          onSubmit={handleCreateMaterial}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

interface CreateStudyMaterialFormProps {
  concepts: Concept[];
  books: Book[];
  onSubmit: (data: {
    title: string;
    type: StudyMaterial['type'];
    concepts: string[];
    books: string[];
  }) => void;
  onCancel: () => void;
}

const CreateStudyMaterialForm: React.FC<CreateStudyMaterialFormProps> = ({
  concepts,
  books,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<StudyMaterial['type']>('summary');
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedConcepts.length === 0) return;

    onSubmit({
      title: title.trim(),
      type,
      concepts: selectedConcepts,
      books: selectedBooks
    });
  };

  const toggleConcept = (conceptId: string) => {
    setSelectedConcepts(prev =>
      prev.includes(conceptId)
        ? prev.filter(id => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const toggleBook = (bookId: string) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal create-material-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Study Material</h3>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-material-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as StudyMaterial['type'])}
            >
              <option value="summary">Summary</option>
              <option value="mindmap">Mind Map</option>
              <option value="concept_map">Concept Map</option>
              <option value="flashcards">Flashcards</option>
              <option value="notes">Notes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Concepts</label>
            <div className="concept-selection">
              {concepts.map(concept => (
                <label key={concept.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedConcepts.includes(concept.id)}
                    onChange={() => toggleConcept(concept.id)}
                  />
                  {concept.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Select Books (Optional)</label>
            <div className="book-selection">
              {books.map(book => (
                <label key={book.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={() => toggleBook(book.id)}
                  />
                  {book.title}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyMaterials;
