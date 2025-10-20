import { Book, BookStatus, ReadingSession, Quote, Shelf } from '../types';

class BookService {
  private books: Book[] = [];
  private readingSessions: ReadingSession[] = [];
  private shelves: Shelf[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const booksData = localStorage.getItem('bookstack-books');
    const sessionsData = localStorage.getItem('bookstack-sessions');
    const shelvesData = localStorage.getItem('bookstack-shelves');
    
    if (booksData) {
      this.books = JSON.parse(booksData).map((book: any) => ({
        ...book,
        startDate: book.startDate ? new Date(book.startDate) : undefined,
        finishDate: book.finishDate ? new Date(book.finishDate) : undefined,
        quotes: Array.isArray(book.quotes)
          ? book.quotes.map((q: any) => ({ ...q, createdAt: new Date(q.createdAt) }))
          : [],
      }));
    }
    
    if (sessionsData) {
      this.readingSessions = JSON.parse(sessionsData).map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }));
    }

    if (shelvesData) {
      this.shelves = JSON.parse(shelvesData).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
      }));
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('bookstack-books', JSON.stringify(this.books));
    localStorage.setItem('bookstack-sessions', JSON.stringify(this.readingSessions));
    localStorage.setItem('bookstack-shelves', JSON.stringify(this.shelves));
  }

  async getAllBooks(): Promise<Book[]> {
    return [...this.books];
  }

  async getBookById(id: string): Promise<Book | null> {
    return this.books.find(book => book.id === id) || null;
  }

  async addBook(bookData: Omit<Book, 'id'>): Promise<Book> {
    // Duplicate detection by ISBN or normalized title+author
    const normalize = (s: string) => s.trim().toLowerCase();
    const existing = this.books.find(b => {
      const isbnMatch = bookData.isbn && b.isbn && normalize(bookData.isbn) === normalize(b.isbn);
      const titleAuthorMatch = normalize(bookData.title) === normalize(b.title) && normalize(bookData.author) === normalize(b.author);
      return Boolean(isbnMatch || titleAuthorMatch);
    });
    if (existing) {
      throw new Error('This book already exists in your library.');
    }

    const newBook: Book = {
      ...bookData,
      id: this.generateId(),
      status: bookData.status || BookStatus.NOT_STARTED,
    };
    
    this.books.push(newBook);
    this.saveToStorage();
    return newBook;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    this.books[bookIndex] = { ...this.books[bookIndex], ...updates };
    this.saveToStorage();
    return this.books[bookIndex];
  }

  // Quotes API
  async addQuote(bookId: string, quoteInput: Omit<Quote, 'id' | 'bookId' | 'createdAt'>): Promise<Book> {
    const bookIndex = this.books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) throw new Error('Book not found');

    const newQuote: Quote = {
      id: this.generateId(),
      bookId,
      text: quoteInput.text,
      note: quoteInput.note,
      page: quoteInput.page,
      createdAt: new Date(),
    };

    const currentQuotes = this.books[bookIndex].quotes || [];
    this.books[bookIndex] = { ...this.books[bookIndex], quotes: [newQuote, ...currentQuotes] };
    this.saveToStorage();
    return this.books[bookIndex];
  }

  async deleteQuote(bookId: string, quoteId: string): Promise<Book> {
    const bookIndex = this.books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) throw new Error('Book not found');
    const currentQuotes = this.books[bookIndex].quotes || [];
    this.books[bookIndex] = { ...this.books[bookIndex], quotes: currentQuotes.filter(q => q.id !== quoteId) };
    this.saveToStorage();
    return this.books[bookIndex];
  }

  async getQuotes(bookId: string): Promise<Quote[]> {
    const book = this.books.find(b => b.id === bookId);
    return book?.quotes || [];
  }

  buildQuotesMarkdown(book: Book): string {
    const quotes = book.quotes || [];
    const header = `# Quotes from "${book.title}" by ${book.author}`;
    const lines = quotes.map(q => {
      const meta: string[] = [];
      if (q.page) meta.push(`p. ${q.page}`);
      meta.push(new Date(q.createdAt).toLocaleDateString());
      const metaLine = meta.length ? `> ${meta.join(' • ')}` : '';
      const noteLine = q.note ? `\n\n> Note: ${q.note}` : '';
      return `\n\n---\n\n> "${q.text.replace(/\n/g, ' ')}"\n${metaLine}${noteLine}`;
    });
    return [header, ...lines].join('');
  }

  exportQuotesMarkdown(book: Book): void {
    const md = this.buildQuotesMarkdown(book);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-quotes.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async deleteBook(id: string): Promise<void> {
    this.books = this.books.filter(book => book.id !== id);
    this.readingSessions = this.readingSessions.filter(session => session.bookId !== id);
    this.saveToStorage();
  }

  async addReadingSession(sessionData: Omit<ReadingSession, 'id'>): Promise<ReadingSession> {
    const newSession: ReadingSession = {
      ...sessionData,
      id: this.generateId(),
    };
    
    this.readingSessions.push(newSession);
    
    // Update book progress
    const book = this.books.find(b => b.id === sessionData.bookId);
    if (book) {
      book.currentPage = Math.min(book.currentPage + sessionData.pagesRead, book.totalPages);
      
      if (book.currentPage >= book.totalPages && book.status === BookStatus.READING) {
        book.status = BookStatus.COMPLETED;
        book.finishDate = new Date();
      }
    }
    
    this.saveToStorage();
    return newSession;
  }

  async getReadingSessions(bookId?: string): Promise<ReadingSession[]> {
    if (bookId) {
      return this.readingSessions.filter(session => session.bookId === bookId);
    }
    return [...this.readingSessions];
  }

  calculateReadingProgress(book: Book): number {
    return Math.round((book.currentPage / book.totalPages) * 100);
  }

  calculateReadingTime(bookId: string): number {
    const sessions = this.readingSessions.filter(session => session.bookId === bookId);
    return sessions.length > 0 ? sessions.reduce((total, session) => total + session.duration, 0) : 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Shelves API
  async getShelves(): Promise<Shelf[]> {
    return [...this.shelves].sort((a, b) => a.name.localeCompare(b.name));
  }

  async addShelf(name: string, color?: string): Promise<Shelf> {
    const shelf: Shelf = { id: this.generateId(), name, color, createdAt: new Date() };
    this.shelves.push(shelf);
    this.saveToStorage();
    return shelf;
  }

  async deleteShelf(id: string): Promise<void> {
    this.shelves = this.shelves.filter(s => s.id !== id);
    // Remove shelf from all books
    this.books = this.books.map(b => ({ ...b, shelves: (b.shelves || []).filter(shelfId => shelfId !== id) }));
    this.saveToStorage();
  }

  async assignShelvesToBook(bookId: string, shelfIds: string[]): Promise<Book> {
    const index = this.books.findIndex(b => b.id === bookId);
    if (index === -1) throw new Error('Book not found');
    const seen: Record<string, true> = {};
    const deduped: string[] = [];
    for (const id of shelfIds) {
      if (!seen[id]) { seen[id] = true; deduped.push(id); }
    }
    this.books[index] = { ...this.books[index], shelves: deduped };
    this.saveToStorage();
    return this.books[index];
  }
}

export const bookService = new BookService();
