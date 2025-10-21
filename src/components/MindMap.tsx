import React, { useState, useEffect, useRef } from 'react';
import { MindMap as MindMapType, MindMapNode, Concept } from '../types';
import { knowledgeService } from '../services/knowledgeService';

interface MindMapProps {
  mindMapId?: string;
  onSave?: (mindMap: MindMapType) => void;
  onClose?: () => void;
}

const MindMap: React.FC<MindMapProps> = ({ mindMapId, onSave, onClose }) => {
  const [mindMap, setMindMap] = useState<MindMapType | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [newNodePosition, setNewNodePosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadConcepts();
    if (mindMapId) {
      loadMindMap();
    } else {
      createNewMindMap();
    }
  }, [mindMapId]);

  const loadConcepts = async () => {
    const conceptsData = await knowledgeService.getAllConcepts();
    setConcepts(conceptsData);
  };

  const loadMindMap = async () => {
    if (!mindMapId) return;
    const mindMaps = await knowledgeService.getAllMindMaps();
    const found = mindMaps.find(m => m.id === mindMapId);
    if (found) {
      setMindMap(found);
    }
  };

  const createNewMindMap = () => {
    const newMindMap: MindMapType = {
      id: Date.now().toString(),
      title: 'New Mind Map',
      nodes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setMindMap(newMindMap);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mindMap) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on existing node
    const clickedNode = mindMap.nodes.find(node => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance < 30; // Node radius
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else {
      setNewNodePosition({ x, y });
      setSelectedNode(null);
    }
  };

  const addNode = async (conceptId: string) => {
    if (!mindMap || !newNodePosition) return;

    const newNode: MindMapNode = {
      id: Date.now().toString(),
      conceptId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      level: mindMap.nodes.length === 0 ? 0 : 1,
      connections: []
    };

    const updatedMindMap = {
      ...mindMap,
      nodes: [...mindMap.nodes, newNode],
      updatedAt: new Date()
    };

    setMindMap(updatedMindMap);
    setNewNodePosition(null);
    
    if (onSave) {
      onSave(updatedMindMap);
    }
  };

  const connectNodes = (sourceId: string, targetId: string) => {
    if (!mindMap) return;

    const updatedNodes = mindMap.nodes.map(node => {
      if (node.id === sourceId) {
        return {
          ...node,
          connections: [...node.connections, targetId]
        };
      }
      return node;
    });

    const updatedMindMap = {
      ...mindMap,
      nodes: updatedNodes,
      updatedAt: new Date()
    };

    setMindMap(updatedMindMap);
    
    if (onSave) {
      onSave(updatedMindMap);
    }
  };

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mindMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections first
    mindMap.nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = mindMap.nodes.find(n => n.id === connectionId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    mindMap.nodes.forEach(node => {
      const concept = concepts.find(c => c.id === node.conceptId);
      const isSelected = selectedNode === node.id;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#4CAF50' : '#2196F3';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#2E7D32' : '#1976D2';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node text
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = concept?.name || 'Unknown';
      const maxWidth = 50;
      if (text.length > 8) {
        ctx.font = '10px Arial';
      }
      ctx.fillText(text, node.x, node.y);
    });

    // Draw new node position indicator
    if (newNodePosition) {
      ctx.beginPath();
      ctx.arc(newNodePosition.x, newNodePosition.y, 30, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    drawMindMap();
  }, [mindMap, selectedNode, newNodePosition, concepts]);

  const handleSave = async () => {
    if (!mindMap) return;
    
    try {
      if (mindMapId) {
        await knowledgeService.updateMindMap(mindMapId, mindMap);
      } else {
        await knowledgeService.createMindMap(mindMap);
      }
      
      if (onSave) {
        onSave(mindMap);
      }
    } catch (error) {
      console.error('Error saving mind map:', error);
    }
  };

  return (
    <div className="mind-map-container">
      <div className="mind-map-header">
        <h3>🧠 Mind Map</h3>
        <div className="mind-map-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      <div className="mind-map-content">
        <div className="mind-map-sidebar">
          <h4>Concepts</h4>
          <div className="concept-list">
            {concepts.map(concept => (
              <div
                key={concept.id}
                className="concept-item"
                onClick={() => addNode(concept.id)}
              >
                {concept.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mind-map-canvas-container">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
          />
        </div>
      </div>

      {newNodePosition && (
        <div className="new-node-menu">
          <h4>Add Concept to Mind Map</h4>
          <div className="concept-options">
            {concepts.map(concept => (
              <button
                key={concept.id}
                className="btn btn-sm"
                onClick={() => addNode(concept.id)}
              >
                {concept.name}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setNewNodePosition(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default MindMap;
