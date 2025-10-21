# Knowledge Management Features

This document describes the knowledge management features added to the BookStack application.

## Overview

The knowledge management system allows users to:
- Create and manage concepts from their reading
- Build mind maps to visualize relationships between ideas
- Create a personal knowledge graph showing concept connections
- Generate study materials from their knowledge base
- Export insights as study materials

## Features

### 1. Concept Management
- **Create Concepts**: Define key ideas, topics, or themes from your reading
- **Categorize**: Organize concepts by category (philosophy, science, technology, etc.)
- **Tag System**: Add multiple tags to concepts for better organization
- **Notes**: Attach detailed notes and observations to each concept
- **Book Linking**: Connect concepts to specific books where they appear

### 2. Mind Maps
- **Visual Representation**: Create interactive mind maps to visualize concept relationships
- **Drag & Drop**: Position concepts freely on the canvas
- **Connection Building**: Link related concepts with visual connections
- **Book-Specific Maps**: Create mind maps focused on specific books or topics

### 3. Knowledge Graph
- **Network Visualization**: See all your concepts and their relationships in a network graph
- **Interactive Exploration**: Click on concepts to see details and related concepts
- **Relationship Types**: Different types of relationships (prerequisite, supports, contradicts, etc.)
- **Filtering**: Filter concepts by category or search for specific topics

### 4. Study Materials
- **Auto-Generation**: Automatically generate study materials from your concepts
- **Multiple Formats**: Create summaries, flashcards, notes, and concept maps
- **Export Options**: Export materials in Markdown or JSON format
- **Custom Materials**: Create custom study materials by selecting specific concepts

## Usage

### Getting Started

1. **Access Knowledge Management**: Click the "🧠 Knowledge" button in the main header
2. **Create Your First Concept**: 
   - Go to the "Concepts" tab
   - Click "Add Concept"
   - Fill in the concept name, description, category, and tags
   - Add notes and link to relevant books

### Building Your Knowledge Base

1. **Add Concepts**: Create concepts for key ideas you encounter while reading
2. **Link to Books**: Associate concepts with the books where you learned them
3. **Add Notes**: Record your thoughts, insights, and connections
4. **Use Tags**: Tag concepts for easy filtering and organization

### Creating Mind Maps

1. **Start a New Mind Map**: Go to the "Mind Maps" tab
2. **Add Concepts**: Click on the canvas to add concepts from your library
3. **Connect Ideas**: Link related concepts to show relationships
4. **Save Your Work**: Mind maps are automatically saved

### Exploring Your Knowledge Graph

1. **View the Graph**: Go to the "Knowledge Graph" tab
2. **Navigate**: Click on concepts to see details and relationships
3. **Filter**: Use the search and category filters to focus on specific areas
4. **Discover Connections**: See how different concepts relate to each other

### Generating Study Materials

1. **Create Materials**: Go to the "Study Materials" tab
2. **Choose Type**: Select from summaries, flashcards, notes, or concept maps
3. **Select Concepts**: Choose which concepts to include
4. **Generate**: Let the system create your study material
5. **Export**: Download materials in your preferred format

## Data Storage

All knowledge management data is stored locally in your browser using localStorage:
- `bookstack-concepts`: Your concept library
- `bookstack-mindmaps`: Your mind maps
- `bookstack-study-materials`: Generated study materials
- `bookstack-reading-notes`: Enhanced reading notes
- `bookstack-relationships`: Concept relationships

## Tips for Effective Use

### Building a Strong Knowledge Base
1. **Start Small**: Begin with a few key concepts from your current reading
2. **Be Consistent**: Regularly add concepts as you read
3. **Use Categories**: Organize concepts by subject area
4. **Add Rich Notes**: Include your insights and connections

### Creating Meaningful Connections
1. **Link Related Concepts**: Connect ideas that build on each other
2. **Use Different Relationship Types**: Specify how concepts relate
3. **Review Regularly**: Periodically review and update connections
4. **Look for Patterns**: Use the knowledge graph to discover new connections

### Effective Study Materials
1. **Focus on Key Concepts**: Select the most important concepts for your materials
2. **Mix Different Types**: Use summaries for overview, flashcards for memorization
3. **Regular Review**: Generate new materials as your knowledge grows
4. **Export for Sharing**: Share your insights with others

## Technical Details

### Architecture
- **Service Layer**: `knowledgeService.ts` handles all data operations
- **Component Structure**: Modular components for each feature
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Local Storage**: Client-side persistence for all data

### Key Components
- `KnowledgeManagement.tsx`: Main container component
- `MindMap.tsx`: Interactive mind map visualization
- `KnowledgeGraph.tsx`: Network graph visualization
- `StudyMaterials.tsx`: Study material generation and management

### Data Models
- **Concept**: Core knowledge unit with metadata and relationships
- **MindMap**: Visual representation with nodes and connections
- **StudyMaterial**: Generated content for learning
- **ConceptRelationship**: Defines how concepts connect

## Future Enhancements

Potential improvements for the knowledge management system:
- **AI-Powered Suggestions**: Automatic concept extraction from notes
- **Collaborative Features**: Share knowledge graphs with others
- **Advanced Visualizations**: More sophisticated graph layouts
- **Integration**: Connect with external knowledge bases
- **Mobile Support**: Touch-optimized interfaces for mobile devices

## Troubleshooting

### Common Issues
1. **Data Not Saving**: Check browser localStorage permissions
2. **Performance**: Large knowledge graphs may be slow on older devices
3. **Visualization Issues**: Try refreshing the page if graphs don't render properly

### Data Recovery
- All data is stored locally, so clearing browser data will remove your knowledge base
- Consider exporting important study materials regularly
- Use browser bookmarks to save important mind maps

## Support

For issues or questions about the knowledge management features:
1. Check the browser console for error messages
2. Ensure your browser supports localStorage
3. Try refreshing the page if components don't load
4. Clear browser cache if experiencing persistent issues
