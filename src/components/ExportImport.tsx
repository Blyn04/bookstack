import React, { useState } from 'react';
import { Book } from '../types';
import { exportImportService } from '../services/exportImportService';

interface ExportImportProps {
  books: Book[];
  onClose: () => void;
  onImportComplete: () => void;
}

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

const ExportImport: React.FC<ExportImportProps> = ({ books, onClose, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeSessions: true,
    includeQuotes: true,
    includeGoals: false,
    includeAnalytics: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data: string;
      let filename: string;
      let mimeType: string;

      switch (exportOptions.format) {
        case 'json':
          data = await exportImportService.exportToJSON(books, exportOptions);
          filename = `reading-list-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          data = await exportImportService.exportToCSV(books, exportOptions);
          filename = `reading-list-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';

          case 'goodreads':
          data = await exportImportService.exportToGoodreads(books, exportOptions);
          filename = `goodreads-import-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        case 'pdf':
          data = await exportImportService.exportToPDF(books, exportOptions);
          filename = `reading-list-${new Date().toISOString().split('T')[0]}.html`;
          mimeType = 'text/html';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await readFileContent(importFile);
      let result;

      if (importFile.name.endsWith('.json')) {
        result = await exportImportService.importFromJSON(fileContent);
      } else if (importFile.name.endsWith('.csv')) {
        // Try to detect if it's a Goodreads CSV
        if (fileContent.includes('Title,Author,ISBN')) {
          result = await exportImportService.importFromGoodreads(fileContent);
        } else {
          result = await exportImportService.importFromCSV(fileContent);
        }
      } else {
        throw new Error('Unsupported file format');
      }

      setImportResult(result);
      if (result.success) {
        onImportComplete();
      }
    } catch (error) {
      alert(`Import failed: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  return (
    <div className="export-import">
      <div className="modal-header">
        <h2>📤 Export / Import</h2>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="export-import-tabs">
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📤 Export
        </button>
        <button 
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          📥 Import
        </button>
      </div>

      <div className="export-import-content">
        {activeTab === 'export' && (
          <div className="export-section">
            <h3>Export Your Reading Data</h3>
            
            <div className="export-options">
              <div className="form-group">
                <label>Export Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as any})}
                >
                  <option value="json">JSON (Complete Data)</option>
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="goodreads">Goodreads CSV</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>

              <div className="form-group">
                <label>Include Additional Data</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSessions}
                      onChange={(e) => setExportOptions({...exportOptions, includeSessions: e.target.checked})}
                    />
                    Reading Sessions
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeQuotes}
                      onChange={(e) => setExportOptions({...exportOptions, includeQuotes: e.target.checked})}
                    />
                    Quotes & Notes
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeGoals}
                      onChange={(e) => setExportOptions({...exportOptions, includeGoals: e.target.checked})}
                    />
                    Reading Goals
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAnalytics}
                      onChange={(e) => setExportOptions({...exportOptions, includeAnalytics: e.target.checked})}
                    />
                    Analytics Data
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Date Range (Optional)</label>
                <div className="form-row">
                  <input
                    type="date"
                    value={exportOptions.dateRange?.start ? new Date(exportOptions.dateRange.start).toISOString().split('T')[0] : ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      dateRange: {
                        start: new Date(e.target.value),
                        end: exportOptions.dateRange?.end || new Date()
                      }
                    })}
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={exportOptions.dateRange?.end ? new Date(exportOptions.dateRange.end).toISOString().split('T')[0] : ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      dateRange: {
                        start: exportOptions.dateRange?.start || new Date(),
                        end: new Date(e.target.value)
                      }
                    })}
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            <div className="export-actions">
              <button 
                className="btn btn-primary"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            <div className="export-info">
              <h4>Export Formats</h4>
              <ul>
                <li><strong>JSON:</strong> Complete data backup, can be imported back</li>
                <li><strong>CSV:</strong> Spreadsheet format, good for analysis</li>
                <li><strong>Goodreads CSV:</strong> Compatible with Goodreads import</li>
                <li><strong>PDF:</strong> Human-readable report format</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="import-section">
            <h3>Import Reading Data</h3>
            
            <div className="import-options">
              <div className="form-group">
                <label>Select File</label>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                />
                <small>Supported formats: JSON, CSV</small>
              </div>

              {importFile && (
                <div className="file-info">
                  <p><strong>Selected File:</strong> {importFile.name}</p>
                  <p><strong>Size:</strong> {(importFile.size / 1024).toFixed(1)} KB</p>
                </div>
              )}

              <div className="import-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>

            {importResult && (
              <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                <h4>Import Result</h4>
                <p><strong>Status:</strong> {importResult.success ? 'Success' : 'Failed'}</p>
                <p><strong>Books Imported:</strong> {importResult.imported}</p>
                
                {importResult.errors.length > 0 && (
                  <div className="errors">
                    <h5>Errors:</h5>
                    <ul>
                      {importResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {importResult.warnings.length > 0 && (
                  <div className="warnings">
                    <h5>Warnings:</h5>
                    <ul>
                      {importResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="import-info">
              <h4>Import Sources</h4>
              <ul>
                <li><strong>BookStack JSON:</strong> Import from previous BookStack exports</li>
                <li><strong>CSV Files:</strong> Import from spreadsheets or other apps</li>
                <li><strong>Goodreads CSV:</strong> Import from Goodreads export</li>
              </ul>
              
              <h4>Import Tips</h4>
              <ul>
                <li>Make sure your CSV has headers (Title, Author, etc.)</li>
                <li>For Goodreads imports, use the "Library Export" feature</li>
                <li>Large imports may take a few moments to process</li>
                <li>Duplicate books will be skipped</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportImport;
