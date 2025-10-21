import React, { useState, useEffect } from 'react';
import { Concept, Book } from '../types';
import { knowledgeService } from '../services/knowledgeService';
import MindMap from './MindMap';
import KnowledgeGraph from './KnowledgeGraph';
import StudyMaterials from './StudyMaterials';

interface KnowledgeManagementProps {
  books: Book[];
  onClose?: () => void;
}

const KnowledgeManagement: React.FC<KnowledgeManagementProps> = ({ books, onClose }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'mindmap' | 'graph' | 'materials'>('concepts');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [showCreateConcept, setShowCreateConcept] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadConcepts();
  }, []);

  const loadConcepts = async () => {
    try {
      const conceptsData = await knowledgeService.getAllConcepts();
      setConcepts(conceptsData);
    } catch (error) {
      console.error('Error loading concepts:', error);
    }
  };

  const handleCreateConcept = async (conceptData: {
    name: string;
    description?: string;
    category?: string;
    tags: string[];
  }) => {
    try {
      const newConcept = await knowledgeService.createConcept({
        ...conceptData,
        relatedConcepts: [],
        books: [],
        notes: []
      });
      
      setConcepts(prev => [...prev, newConcept]);
      setShowCreateConcept(false);
    } catch (error) {
      console.error('Error creating concept:', error);
    }
  };

  const handleUpdateConcept = async (id: string, updates: Partial<Concept>) => {
    try {
      const updatedConcept = await knowledgeService.updateConcept(id, updates);
      setConcepts(prev => prev.map(c => c.id === id ? updatedConcept : c));
    } catch (error) {
      console.error('Error updating concept:', error);
    }
  };

  const handleDeleteConcept = async (id: string) => {
    try {
      await knowledgeService.deleteConcept(id);
      setConcepts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting concept:', error);
    }
  };

  const getFilteredConcepts = (): Concept[] => {
    let filtered = concepts;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(concept => concept.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(concept =>
        concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const getCategories = (): string[] => {
    const categories = new Set(concepts
      .map(c => c.category)
      .filter((category): category is string => Boolean(category))
    );
    return ['all', ...Array.from(categories)];
  };

  const renderConceptsTab = () => (
    <div className="concepts-tab">
      <div className="concepts-header">
        <h3>🧠 Concepts</h3>
        <div className="concepts-controls">
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            {getCategories().map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateConcept(true)}
          >
            Add Concept
          </button>
        </div>
      </div>

      <div className="concepts-list">
        {getFilteredConcepts().map(concept => (
          <div key={concept.id} className="concept-card">
            <div className="concept-header">
              <h4>{concept.name}</h4>
              <div className="concept-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => setSelectedConcept(concept)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteConcept(concept.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            
            {concept.description && (
              <p className="concept-description">{concept.description}</p>
            )}
            
            <div className="concept-meta">
              <div className="concept-category">
                <strong>Category:</strong> {concept.category || 'Uncategorized'}
              </div>
              <div className="concept-tags">
                <strong>Tags:</strong> {concept.tags.join(', ')}
              </div>
              <div className="concept-stats">
                <span>Books: {concept.books.length}</span>
                <span>Notes: {concept.notes.length}</span>
                <span>Related: {concept.relatedConcepts.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="knowledge-management-container">
      <div className="knowledge-management-header">
        <h2>🧠 Knowledge Management</h2>
        <div className="knowledge-tabs">
          <button
            className={`tab-btn ${activeTab === 'concepts' ? 'active' : ''}`}
            onClick={() => setActiveTab('concepts')}
          >
            Concepts
          </button>
          <button
            className={`tab-btn ${activeTab === 'mindmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('mindmap')}
          >
            Mind Maps
          </button>
          <button
            className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
          >
            Knowledge Graph
          </button>
          <button
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Study Materials
          </button>
        </div>
        {onClose && (
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="knowledge-management-content">
        {activeTab === 'concepts' && renderConceptsTab()}
        {activeTab === 'mindmap' && <MindMap />}
        {activeTab === 'graph' && <KnowledgeGraph />}
        {activeTab === 'materials' && <StudyMaterials />}
      </div>

      {showCreateConcept && (
        <CreateConceptForm
          onSubmit={handleCreateConcept}
          onCancel={() => setShowCreateConcept(false)}
        />
      )}

      {selectedConcept && (
        <EditConceptForm
          concept={selectedConcept}
          books={books}
          onSubmit={(updates) => {
            handleUpdateConcept(selectedConcept.id, updates);
            setSelectedConcept(null);
          }}
          onCancel={() => setSelectedConcept(null)}
        />
      )}
    </div>
  );
};

interface CreateConceptFormProps {
  onSubmit: (data: {
    name: string;
    description?: string;
    category?: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

const CreateConceptForm: React.FC<CreateConceptFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      tags
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="modal-overlay">
      <div className="modal create-concept-modal">
        <div className="modal-header">
          <h3>Create Concept</h3>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-concept-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter concept name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter concept description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className="btn btn-sm">
                Add
              </button>
            </div>
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Concept
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditConceptFormProps {
  concept: Concept;
  books: Book[];
  onSubmit: (updates: Partial<Concept>) => void;
  onCancel: () => void;
}

const EditConceptForm: React.FC<EditConceptFormProps> = ({ concept, books, onSubmit, onCancel }) => {
  const [name, setName] = useState(concept.name);
  const [description, setDescription] = useState(concept.description || '');
  const [category, setCategory] = useState(concept.category || '');
  const [tags, setTags] = useState<string[]>(concept.tags);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState<string[]>(concept.notes);
  const [newNote, setNewNote] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>(concept.books);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      tags,
      notes,
      books: selectedBooks
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addNote = () => {
    if (newNote.trim() && !notes.includes(newNote.trim())) {
      setNotes(prev => [...prev, newNote.trim()]);
      setNewNote('');
    }
  };

  const removeNote = (noteToRemove: string) => {
    setNotes(prev => prev.filter(note => note !== noteToRemove));
  };

  const toggleBook = (bookId: string) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal edit-concept-modal">
        <div className="modal-header">
          <h3>Edit Concept</h3>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-concept-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className="btn btn-sm">
                Add
              </button>
            </div>
            <div className="tags-list">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <div className="notes-input">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add note"
                rows={2}
              />
              <button type="button" onClick={addNote} className="btn btn-sm">
                Add Note
              </button>
            </div>
            <div className="notes-list">
              {notes.map((note, index) => (
                <div key={index} className="note-item">
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote(note)}
                    className="note-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Related Books</label>
            <div className="books-selection">
              {books.map(book => (
                <label key={book.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={() => toggleBook(book.id)}
                  />
                  {book.title} by {book.author}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Concept
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeManagement;
