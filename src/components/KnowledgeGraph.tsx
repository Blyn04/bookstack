import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeGraph as KnowledgeGraphType, Concept, ConceptRelationship } from '../types';
import { knowledgeService } from '../services/knowledgeService';

interface KnowledgeGraphProps {
  onClose?: () => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onClose }) => {
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphType | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadKnowledgeGraph();
  }, []);

  useEffect(() => {
    if (knowledgeGraph) {
      drawGraph();
    }
  }, [knowledgeGraph, selectedConcept, filterCategory, searchQuery]);

  const loadKnowledgeGraph = async () => {
    try {
      const graph = await knowledgeService.getKnowledgeGraph();
      setKnowledgeGraph(graph);
    } catch (error) {
      console.error('Error loading knowledge graph:', error);
    }
  };

  const getFilteredConcepts = (): Concept[] => {
    if (!knowledgeGraph) return [];

    let filtered = knowledgeGraph.concepts;

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

  const getConceptPosition = (concept: Concept, index: number, total: number) => {
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(200, total * 20);
    
    const angle = (2 * Math.PI * index) / total;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas || !knowledgeGraph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const filteredConcepts = getFilteredConcepts();
    const conceptPositions = new Map<string, { x: number; y: number }>();

    // Calculate positions
    filteredConcepts.forEach((concept, index) => {
      const position = getConceptPosition(concept, index, filteredConcepts.length);
      conceptPositions.set(concept.id, position);
    });

    // Draw relationships
    knowledgeGraph.relationships.forEach(relationship => {
      const sourcePos = conceptPositions.get(relationship.sourceConceptId);
      const targetPos = conceptPositions.get(relationship.targetConceptId);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        
        // Different line styles for different relationship types
        switch (relationship.relationshipType) {
          case 'prerequisite':
            ctx.strokeStyle = '#FF5722';
            ctx.setLineDash([5, 5]);
            break;
          case 'supports':
            ctx.strokeStyle = '#4CAF50';
            break;
          case 'contradicts':
            ctx.strokeStyle = '#F44336';
            ctx.setLineDash([10, 5]);
            break;
          default:
            ctx.strokeStyle = '#666';
        }
        
        ctx.lineWidth = Math.max(1, relationship.strength * 3);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw concepts
    filteredConcepts.forEach(concept => {
      const position = conceptPositions.get(concept.id);
      if (!position) return;

      const isSelected = selectedConcept?.id === concept.id;
      
      // Concept circle
      ctx.beginPath();
      ctx.arc(position.x, position.y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#4CAF50' : getCategoryColor(concept.category);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#2E7D32' : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Concept name
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const name = concept.name.length > 8 ? concept.name.substring(0, 8) + '...' : concept.name;
      ctx.fillText(name, position.x, position.y);
    });
  };

  const getCategoryColor = (category?: string): string => {
    const colors = {
      'philosophy': '#9C27B0',
      'science': '#2196F3',
      'history': '#FF9800',
      'literature': '#4CAF50',
      'psychology': '#E91E63',
      'economics': '#795548',
      'technology': '#607D8B',
      'default': '#666'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const filteredConcepts = getFilteredConcepts();
    const clickedConcept = filteredConcepts.find(concept => {
      const position = getConceptPosition(concept, filteredConcepts.indexOf(concept), filteredConcepts.length);
      const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
      return distance < 25;
    });

    setSelectedConcept(clickedConcept || null);
  };

  const getRelatedConcepts = (conceptId: string): Concept[] => {
    if (!knowledgeGraph) return [];

    const relationships = knowledgeGraph.relationships.filter(
      r => r.sourceConceptId === conceptId || r.targetConceptId === conceptId
    );

    const relatedIds = relationships.map(r => 
      r.sourceConceptId === conceptId ? r.targetConceptId : r.sourceConceptId
    );

    return knowledgeGraph.concepts.filter(c => relatedIds.includes(c.id));
  };

  const getCategories = (): string[] => {
    if (!knowledgeGraph) return [];
    
    const categories = new Set(knowledgeGraph.concepts
      .map(c => c.category)
      .filter((category): category is string => Boolean(category))
    );
    return ['all', ...Array.from(categories)];
  };

  return (
    <div className="knowledge-graph-container">
      <div className="knowledge-graph-header">
        <h3>🔗 Knowledge Graph</h3>
        <div className="graph-controls">
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
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div className="knowledge-graph-content">
        <div className="graph-canvas-container">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', cursor: 'pointer' }}
          />
        </div>

        <div className="graph-sidebar">
          {selectedConcept ? (
            <div className="concept-details">
              <h4>{selectedConcept.name}</h4>
              {selectedConcept.description && (
                <p className="concept-description">{selectedConcept.description}</p>
              )}
              
              <div className="concept-meta">
                <div className="concept-category">
                  <strong>Category:</strong> {selectedConcept.category || 'Uncategorized'}
                </div>
                <div className="concept-tags">
                  <strong>Tags:</strong> {selectedConcept.tags.join(', ')}
                </div>
                <div className="concept-books">
                  <strong>Books:</strong> {selectedConcept.books.length}
                </div>
              </div>

              {selectedConcept.notes.length > 0 && (
                <div className="concept-notes">
                  <h5>Notes:</h5>
                  <ul>
                    {selectedConcept.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="related-concepts">
                <h5>Related Concepts:</h5>
                <div className="related-list">
                  {getRelatedConcepts(selectedConcept.id).map(concept => (
                    <button
                      key={concept.id}
                      className="related-concept-btn"
                      onClick={() => setSelectedConcept(concept)}
                    >
                      {concept.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="graph-info">
              <h4>Knowledge Graph</h4>
              <p>Click on a concept to view details and relationships.</p>
              <div className="graph-stats">
                <div className="stat">
                  <strong>Total Concepts:</strong> {knowledgeGraph?.concepts.length || 0}
                </div>
                <div className="stat">
                  <strong>Relationships:</strong> {knowledgeGraph?.relationships.length || 0}
                </div>
                <div className="stat">
                  <strong>Categories:</strong> {getCategories().length - 1}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
