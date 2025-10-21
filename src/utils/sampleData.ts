import { Concept, Book } from '../types';

export const sampleConcepts: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Machine Learning',
    description: 'A subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
    category: 'technology',
    tags: ['AI', 'algorithms', 'data science', 'statistics'],
    relatedConcepts: [],
    books: [],
    notes: [
      'Supervised learning uses labeled training data',
      'Unsupervised learning finds patterns in data without labels',
      'Reinforcement learning learns through trial and error'
    ]
  },
  {
    name: 'Neural Networks',
    description: 'Computing systems inspired by biological neural networks that can learn to perform tasks by considering examples.',
    category: 'technology',
    tags: ['AI', 'deep learning', 'algorithms', 'brain'],
    relatedConcepts: [],
    books: [],
    notes: [
      'Consist of interconnected nodes (neurons)',
      'Use backpropagation for training',
      'Can solve complex pattern recognition problems'
    ]
  },
  {
    name: 'Philosophy of Mind',
    description: 'The branch of philosophy that studies the nature of the mind, mental events, mental functions, and consciousness.',
    category: 'philosophy',
    tags: ['consciousness', 'mind', 'dualism', 'materialism'],
    relatedConcepts: [],
    books: [],
    notes: [
      'Dualism: mind and body are separate substances',
      'Materialism: mind is a product of brain activity',
      'The hard problem of consciousness'
    ]
  },
  {
    name: 'Cognitive Science',
    description: 'The interdisciplinary study of mind and intelligence, embracing philosophy, psychology, artificial intelligence, neuroscience, linguistics, and anthropology.',
    category: 'science',
    tags: ['psychology', 'AI', 'neuroscience', 'linguistics'],
    relatedConcepts: [],
    books: [],
    notes: [
      'Combines multiple disciplines to understand cognition',
      'Studies how information is represented and processed',
      'Bridges the gap between mind and brain'
    ]
  },
  {
    name: 'Epistemology',
    description: 'The theory of knowledge, especially with regard to its methods, validity, and scope.',
    category: 'philosophy',
    tags: ['knowledge', 'truth', 'belief', 'justification'],
    relatedConcepts: [],
    books: [],
    notes: [
      'Studies the nature, sources, and limits of knowledge',
      'Examines what constitutes justified belief',
      'Addresses the problem of skepticism'
    ]
  }
];

export const sampleBooks: Partial<Book>[] = [
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell & Peter Norvig',
    genre: 'Technology',
    notes: 'Comprehensive introduction to AI covering search, knowledge representation, machine learning, and more.'
  },
  {
    title: 'The Mind\'s I',
    author: 'Douglas Hofstadter & Daniel Dennett',
    genre: 'Philosophy',
    notes: 'Explores the nature of consciousness and self through thought experiments and essays.'
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    genre: 'Psychology',
    notes: 'Examines the two systems of thinking: fast, intuitive thinking and slow, deliberate thinking.'
  },
  {
    title: 'Gödel, Escher, Bach',
    author: 'Douglas Hofstadter',
    genre: 'Philosophy',
    notes: 'Explores consciousness, intelligence, and the nature of self-reference through mathematics, art, and music.'
  }
];
