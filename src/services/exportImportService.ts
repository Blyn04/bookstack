import { Book, ReadingSession, Quote, ReadingGoal, Analytics } from '../types';

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'goodreads';
  includeSessions: boolean;
  includeQuotes: boolean;
  includeGoals: boolean;
  includeAnalytics: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
}

class ExportImportService {
  // Export books to JSON
  async exportToJSON(books: Book[], options: ExportOptions): Promise<string> {
    const exportData: any = {
      books: this.filterBooksByDateRange(books, options.dateRange),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalBooks: books.length
      }
    };

    if (options.includeSessions) {
      const sessions = await this.getReadingSessions();
      exportData.sessions = this.filterSessionsByDateRange(sessions, options.dateRange);
    }

    if (options.includeQuotes) {
      const quotes = await this.getQuotes();
      exportData.quotes = this.filterQuotesByDateRange(quotes, options.dateRange);
    }

    if (options.includeGoals) {
      const goals = await this.getReadingGoals();
      exportData.goals = goals;
    }

    if (options.includeAnalytics) {
      const analytics = await this.getAnalytics();
      exportData.analytics = analytics;
    }

    return JSON.stringify(exportData, null, 2);
  }

  // Export books to CSV
  async exportToCSV(books: Book[], options: ExportOptions): Promise<string> {
    const filteredBooks = this.filterBooksByDateRange(books, options.dateRange);
    
    const headers = [
      'Title',
      'Author',
      'Genre',
      'Total Pages',
      'Current Page',
      'Status',
      'Rating',
      'Start Date',
      'Finish Date',
      'Notes',
      'ISBN'
    ];

    const rows = filteredBooks.map(book => [
      book.title,
      book.author,
      book.genre || '',
      book.totalPages.toString(),
      book.currentPage.toString(),
      book.status,
      book.rating?.toString() || '',
      book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : '',
      book.finishDate ? new Date(book.finishDate).toISOString().split('T')[0] : '',
      book.notes || '',
      book.isbn || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Export to Goodreads format
  async exportToGoodreads(books: Book[], options: ExportOptions): Promise<string> {
    const filteredBooks = this.filterBooksByDateRange(books, options.dateRange);
    
    const goodreadsData = filteredBooks.map(book => ({
      'Title': book.title,
      'Author': book.author,
      'ISBN': book.isbn || '',
      'ISBN13': '',
      'My Rating': book.rating || '',
      'Average Rating': '',
      'Publisher': '',
      'Binding': '',
      'Number of Pages': book.totalPages,
      'Year Published': '',
      'Original Publication Year': '',
      'Date Read': book.finishDate ? new Date(book.finishDate).toISOString().split('T')[0] : '',
      'Date Added': book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : '',
      'Bookshelves': book.shelves?.join(',') || '',
      'My Review': book.notes || ''
    }));

    return this.convertToCSV(goodreadsData);
  }

  // Generate PDF export
  async exportToPDF(books: Book[], options: ExportOptions): Promise<string> {
    // This would typically use a PDF library like jsPDF
    // For now, we'll return HTML that can be printed to PDF
    const filteredBooks = this.filterBooksByDateRange(books, options.dateRange);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Reading List Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .book { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
            .book-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .book-author { color: #666; margin-bottom: 10px; }
            .book-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .status { padding: 5px 10px; border-radius: 15px; color: white; }
            .completed { background-color: #4CAF50; }
            .reading { background-color: #2196F3; }
            .paused { background-color: #FF9800; }
            .not-started { background-color: #9E9E9E; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>My Reading List</h1>
            <p>Exported on ${new Date().toLocaleDateString()}</p>
            <p>Total Books: ${filteredBooks.length}</p>
          </div>
          
          ${filteredBooks.map(book => `
            <div class="book">
              <div class="book-title">${book.title}</div>
              <div class="book-author">by ${book.author}</div>
              <div class="book-details">
                <div><strong>Status:</strong> <span class="status ${book.status}">${book.status.replace('_', ' ')}</span></div>
                <div><strong>Pages:</strong> ${book.currentPage}/${book.totalPages}</div>
                <div><strong>Genre:</strong> ${book.genre || 'N/A'}</div>
                <div><strong>Rating:</strong> ${book.rating ? '⭐'.repeat(book.rating) : 'Not rated'}</div>
                ${book.startDate ? `<div><strong>Started:</strong> ${new Date(book.startDate).toLocaleDateString()}</div>` : ''}
                ${book.finishDate ? `<div><strong>Finished:</strong> ${new Date(book.finishDate).toLocaleDateString()}</div>` : ''}
              </div>
              ${book.notes ? `<div><strong>Notes:</strong> ${book.notes}</div>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    return html;
  }

  // Import from JSON
  async importFromJSON(jsonData: string): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonData);
      const result: ImportResult = {
        success: true,
        imported: 0,
        errors: [],
        warnings: []
      };

      if (data.books && Array.isArray(data.books)) {
        for (const book of data.books) {
          try {
            await this.addBook(book);
            result.imported++;
          } catch (error) {
            result.errors.push(`Failed to import book "${book.title}": ${error}`);
          }
        }
      }

      if (data.sessions && Array.isArray(data.sessions)) {
        for (const session of data.sessions) {
          try {
            await this.addReadingSession(session);
          } catch (error) {
            result.warnings.push(`Failed to import session: ${error}`);
          }
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Invalid JSON format: ${error}`],
        warnings: []
      };
    }
  }

  // Import from CSV
  async importFromCSV(csvData: string): Promise<ImportResult> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      warnings: []
    };

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const book = this.createBookFromCSVRow(headers, values);
          await this.addBook(book);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import row ${i + 1}: ${error}`);
        }
      }
    }

    return result;
  }

  // Import from Goodreads CSV
  async importFromGoodreads(csvData: string): Promise<ImportResult> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      warnings: []
    };

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const book = this.createBookFromGoodreadsRow(headers, values);
          await this.addBook(book);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import row ${i + 1}: ${error}`);
        }
      }
    }

    return result;
  }

  // Helper methods
  private filterBooksByDateRange(books: Book[], dateRange?: { start: Date; end: Date }): Book[] {
    if (!dateRange) return books;
    
    return books.filter(book => {
      if (!book.startDate) return false;
      const bookDate = new Date(book.startDate);
      return bookDate >= dateRange.start && bookDate <= dateRange.end;
    });
  }

  private filterSessionsByDateRange(sessions: ReadingSession[], dateRange?: { start: Date; end: Date }): ReadingSession[] {
    if (!dateRange) return sessions;
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
    });
  }

  private filterQuotesByDateRange(quotes: Quote[], dateRange?: { start: Date; end: Date }): Quote[] {
    if (!dateRange) return quotes;
    
    return quotes.filter(quote => {
      const quoteDate = new Date(quote.createdAt);
      return quoteDate >= dateRange.start && quoteDate <= dateRange.end;
    });
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(header => item[header] || ''));
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private createBookFromCSVRow(headers: string[], values: string[]): Book {
    const book: any = {
      id: this.generateId(),
      title: '',
      author: '',
      totalPages: 0,
      currentPage: 0,
      status: 'not_started'
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      switch (header.toLowerCase()) {
        case 'title':
          book.title = value;
          break;
        case 'author':
          book.author = value;
          break;
        case 'total pages':
          book.totalPages = parseInt(value) || 0;
          break;
        case 'current page':
          book.currentPage = parseInt(value) || 0;
          break;
        case 'status':
          book.status = value.toLowerCase().replace(' ', '_');
          break;
        case 'rating':
          book.rating = parseInt(value) || undefined;
          break;
        case 'genre':
          book.genre = value || undefined;
          break;
        case 'notes':
          book.notes = value || undefined;
          break;
        case 'isbn':
          book.isbn = value || undefined;
          break;
        case 'start date':
          if (value) book.startDate = new Date(value);
          break;
        case 'finish date':
          if (value) book.finishDate = new Date(value);
          break;
      }
    });

    return book as Book;
  }

  private createBookFromGoodreadsRow(headers: string[], values: string[]): Book {
    const book: any = {
      id: this.generateId(),
      title: '',
      author: '',
      totalPages: 0,
      currentPage: 0,
      status: 'completed'
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      switch (header.toLowerCase()) {
        case 'title':
          book.title = value;
          break;
        case 'author':
          book.author = value;
          break;
        case 'number of pages':
          book.totalPages = parseInt(value) || 0;
          break;
        case 'my rating':
          book.rating = parseInt(value) || undefined;
          break;
        case 'my review':
          book.notes = value || undefined;
          break;
        case 'isbn':
          book.isbn = value || undefined;
          break;
        case 'date read':
          if (value) {
            book.finishDate = new Date(value);
            book.status = 'completed';
          }
          break;
        case 'date added':
          if (value) book.startDate = new Date(value);
          break;
      }
    });

    return book as Book;
  }

  private async getReadingSessions(): Promise<ReadingSession[]> {
    try {
      const data = localStorage.getItem('bookstack-reading-sessions');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async getQuotes(): Promise<Quote[]> {
    try {
      const data = localStorage.getItem('bookstack-quotes');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async getReadingGoals(): Promise<ReadingGoal[]> {
    try {
      const data = localStorage.getItem('bookstack-reading-goals');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async getAnalytics(): Promise<Analytics | null> {
    try {
      const data = localStorage.getItem('bookstack-analytics');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async addBook(book: Book): Promise<void> {
    try {
      const existingBooks = JSON.parse(localStorage.getItem('bookstack-books') || '[]');
      existingBooks.push(book);
      localStorage.setItem('bookstack-books', JSON.stringify(existingBooks));
    } catch (error) {
      throw new Error(`Failed to add book: ${error}`);
    }
  }

  private async addReadingSession(session: ReadingSession): Promise<void> {
    try {
      const existingSessions = JSON.parse(localStorage.getItem('bookstack-reading-sessions') || '[]');
      existingSessions.push(session);
      localStorage.setItem('bookstack-reading-sessions', JSON.stringify(existingSessions));
    } catch (error) {
      throw new Error(`Failed to add session: ${error}`);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const exportImportService = new ExportImportService();
