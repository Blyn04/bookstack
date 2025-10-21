import { 
  Concept, 
  MindMap, 
  MindMapNode, 
  KnowledgeGraph, 
  ConceptRelationship, 
  StudyMaterial, 
  ReadingNote,
  Book 
} from '../types';

class KnowledgeService {
  private concepts: Concept[] = [];
  private mindMaps: MindMap[] = [];
  private studyMaterials: StudyMaterial[] = [];
  private readingNotes: ReadingNote[] = [];
  private relationships: ConceptRelationship[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const conceptsData = localStorage.getItem('bookstack-concepts');
    if (conceptsData) {
      this.concepts = JSON.parse(conceptsData).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
    }

    const mindMapsData = localStorage.getItem('bookstack-mindmaps');
    if (mindMapsData) {
      this.mindMaps = JSON.parse(mindMapsData).map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt)
      }));
    }

    const studyMaterialsData = localStorage.getItem('bookstack-study-materials');
    if (studyMaterialsData) {
      this.studyMaterials = JSON.parse(studyMaterialsData).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }));
    }

    const readingNotesData = localStorage.getItem('bookstack-reading-notes');
    if (readingNotesData) {
      this.readingNotes = JSON.parse(readingNotesData).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt)
      }));
    }

    const relationshipsData = localStorage.getItem('bookstack-relationships');
    if (relationshipsData) {
      this.relationships = JSON.parse(relationshipsData);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('bookstack-concepts', JSON.stringify(this.concepts));
    localStorage.setItem('bookstack-mindmaps', JSON.stringify(this.mindMaps));
    localStorage.setItem('bookstack-study-materials', JSON.stringify(this.studyMaterials));
    localStorage.setItem('bookstack-reading-notes', JSON.stringify(this.readingNotes));
    localStorage.setItem('bookstack-relationships', JSON.stringify(this.relationships));
  }

  // Concept Management
  async createConcept(conceptData: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>): Promise<Concept> {
    const concept: Concept = {
      id: Date.now().toString(),
      ...conceptData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.concepts.push(concept);
    this.saveToStorage();
    return concept;
  }

  async getAllConcepts(): Promise<Concept[]> {
    return [...this.concepts];
  }

  async updateConcept(id: string, updates: Partial<Concept>): Promise<Concept> {
    const index = this.concepts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Concept not found');
    }

    this.concepts[index] = {
      ...this.concepts[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage();
    return this.concepts[index];
  }

  async deleteConcept(id: string): Promise<void> {
    this.concepts = this.concepts.filter(c => c.id !== id);
    // Remove relationships involving this concept
    this.relationships = this.relationships.filter(r => 
      r.sourceConceptId !== id && r.targetConceptId !== id
    );
    this.saveToStorage();
  }

  // Mind Map Management
  async createMindMap(mindMapData: Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>): Promise<MindMap> {
    const mindMap: MindMap = {
      id: Date.now().toString(),
      ...mindMapData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mindMaps.push(mindMap);
    this.saveToStorage();
    return mindMap;
  }

  async getAllMindMaps(): Promise<MindMap[]> {
    return [...this.mindMaps];
  }

  async updateMindMap(id: string, updates: Partial<MindMap>): Promise<MindMap> {
    const index = this.mindMaps.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Mind map not found');
    }

    this.mindMaps[index] = {
      ...this.mindMaps[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveToStorage();
    return this.mindMaps[index];
  }

  async deleteMindMap(id: string): Promise<void> {
    this.mindMaps = this.mindMaps.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // Reading Notes Management
  async createReadingNote(noteData: Omit<ReadingNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReadingNote> {
    const note: ReadingNote = {
      id: Date.now().toString(),
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.readingNotes.push(note);
    this.saveToStorage();
    return note;
  }

  async getReadingNotesByBook(bookId: string): Promise<ReadingNote[]> {
    return this.readingNotes.filter(n => n.bookId === bookId);
  }

  async getAllReadingNotes(): Promise<ReadingNote[]> {
    return [...this.readingNotes];
  }

  // Study Materials Management
  async createStudyMaterial(materialData: Omit<StudyMaterial, 'id' | 'createdAt'>): Promise<StudyMaterial> {
    const material: StudyMaterial = {
      id: Date.now().toString(),
      ...materialData,
      createdAt: new Date()
    };
    
    this.studyMaterials.push(material);
    this.saveToStorage();
    return material;
  }

  async getAllStudyMaterials(): Promise<StudyMaterial[]> {
    return [...this.studyMaterials];
  }

  async exportStudyMaterial(id: string, format: 'markdown' | 'json'): Promise<string> {
    const material = this.studyMaterials.find(m => m.id === id);
    if (!material) {
      throw new Error('Study material not found');
    }

    if (format === 'json') {
      return JSON.stringify(material, null, 2);
    }

    // Convert to markdown
    let markdown = `# ${material.title}\n\n`;
    markdown += `**Type:** ${material.type}\n`;
    markdown += `**Created:** ${material.createdAt.toLocaleDateString()}\n\n`;
    markdown += material.content;
    
    return markdown;
  }

  // Knowledge Graph
  async getKnowledgeGraph(): Promise<KnowledgeGraph> {
    return {
      concepts: this.concepts,
      relationships: this.relationships,
      lastUpdated: new Date()
    };
  }

  // Concept Extraction from Notes
  extractConceptsFromText(text: string, existingConcepts: Concept[]): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const conceptNames = existingConcepts.map(c => c.name.toLowerCase());
    const foundConcepts: string[] = [];

    words.forEach(word => {
      const matchingConcept = existingConcepts.find(c => 
        c.name.toLowerCase().includes(word) || 
        c.tags.some(tag => tag.toLowerCase().includes(word))
      );
      
      if (matchingConcept && !foundConcepts.includes(matchingConcept.id)) {
        foundConcepts.push(matchingConcept.id);
      }
    });

    return foundConcepts;
  }

  // Auto-generate mind map from concepts
  async generateMindMapFromConcepts(conceptIds: string[], title: string): Promise<MindMap> {
    const concepts = this.concepts.filter(c => conceptIds.includes(c.id));
    const nodes: MindMapNode[] = [];
    
    // Center node
    const centerNode: MindMapNode = {
      id: 'center',
      conceptId: concepts[0]?.id || '',
      x: 0,
      y: 0,
      level: 0,
      connections: []
    };
    nodes.push(centerNode);

    // Create nodes for each concept
    concepts.slice(1).forEach((concept, index) => {
      const angle = (2 * Math.PI * index) / (concepts.length - 1);
      const radius = 200;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const node: MindMapNode = {
        id: `node-${index}`,
        conceptId: concept.id,
        x,
        y,
        level: 1,
        connections: ['center']
      };
      nodes.push(node);
      centerNode.connections.push(node.id);
    });

    return this.createMindMap({
      title,
      nodes
    });
  }

  // Generate study materials
  async generateStudyMaterial(
    type: StudyMaterial['type'],
    concepts: string[],
    books: string[],
    title: string
  ): Promise<StudyMaterial> {
    const conceptData = this.concepts.filter(c => concepts.includes(c.id));
    const bookData = books; // You might want to fetch actual book data here

    let content = '';
    
    switch (type) {
      case 'summary':
        content = this.generateSummary(conceptData, bookData);
        break;
      case 'flashcards':
        content = this.generateFlashcards(conceptData);
        break;
      case 'notes':
        content = this.generateNotes(conceptData, bookData);
        break;
      default:
        content = this.generateSummary(conceptData, bookData);
    }

    return this.createStudyMaterial({
      title,
      type,
      content,
      concepts,
      books,
      format: 'markdown'
    });
  }

  private generateSummary(concepts: Concept[], books: string[]): string {
    let summary = '# Study Summary\n\n';
    
    concepts.forEach(concept => {
      summary += `## ${concept.name}\n`;
      if (concept.description) {
        summary += `${concept.description}\n\n`;
      }
      if (concept.notes.length > 0) {
        summary += '**Notes:**\n';
        concept.notes.forEach(note => {
          summary += `- ${note}\n`;
        });
        summary += '\n';
      }
    });

    return summary;
  }

  private generateFlashcards(concepts: Concept[]): string {
    let flashcards = '# Flashcards\n\n';
    
    concepts.forEach(concept => {
      flashcards += `## ${concept.name}\n\n`;
      flashcards += `**Front:** ${concept.name}\n\n`;
      flashcards += `**Back:** ${concept.description || 'No description available'}\n\n`;
      if (concept.notes.length > 0) {
        flashcards += `**Additional Notes:**\n`;
        concept.notes.forEach(note => {
          flashcards += `- ${note}\n`;
        });
        flashcards += '\n';
      }
      flashcards += '---\n\n';
    });

    return flashcards;
  }

  private generateNotes(concepts: Concept[], books: string[]): string {
    let notes = '# Study Notes\n\n';
    
    concepts.forEach(concept => {
      notes += `## ${concept.name}\n`;
      notes += `**Category:** ${concept.category || 'Uncategorized'}\n`;
      notes += `**Tags:** ${concept.tags.join(', ')}\n\n`;
      
      if (concept.description) {
        notes += `**Description:**\n${concept.description}\n\n`;
      }
      
      if (concept.notes.length > 0) {
        notes += `**Key Points:**\n`;
        concept.notes.forEach(note => {
          notes += `- ${note}\n`;
        });
        notes += '\n';
      }
    });

    return notes;
  }
}

export const knowledgeService = new KnowledgeService();
