"use client";

import { useState, useCallback } from "react";
import { FileUp, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react";

export interface ParsedCSVData {
  headers: string[];
  rows: Array<{ [key: string]: any }>;
  errors: string[];
}

interface CSVUploadProps {
  onDataParsed: (data: ParsedCSVData | null) => void;
  expectedFields: Array<{ key: string; name: string; placeholder: string }>;
  maxFileSize?: number; // in MB
}

export default function CSVUpload({ 
  onDataParsed, 
  expectedFields, 
  maxFileSize = 10 
}: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);

  const parseCSV = useCallback((csvText: string): ParsedCSVData => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [], errors: ['Empty CSV file'] };
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Array<{ [key: string]: any }> = [];
    const errors: string[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: { [key: string]: any } = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to convert to number if it looks like a number
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      });

      rows.push(row);
    }

    // Validate against expected fields
    const expectedKeys = expectedFields.map(f => f.key);
    const missingFields = expectedKeys.filter(key => !headers.includes(key));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }

    return { headers, rows, errors };
  }, [expectedFields]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      setParsedData(parsed);
      onDataParsed(parsed);
    } catch (err) {
      setError('Failed to parse CSV file');
      onDataParsed(null);
    } finally {
      setIsProcessing(false);
    }
  }, [maxFileSize, parseCSV, onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearData = useCallback(() => {
    setParsedData(null);
    setError(null);
    onDataParsed(null);
  }, [onDataParsed]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : parsedData
            ? 'border-green-300 bg-green-50'
            : 'border-slate-300 bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="p-6 text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-slate-600">Processing CSV...</p>
            </div>
          ) : parsedData ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                {parsedData.rows.length} records loaded
              </p>
              <p className="text-xs text-green-600">
                {parsedData.headers.length} columns detected
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileUp className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                Drop CSV file here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Max file size: {maxFileSize}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Parsed Data Summary */}
      {parsedData && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold">CSV Data Summary</h4>
            </div>
            <button
              onClick={clearData}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Rows</p>
              <p className="font-medium">{parsedData.rows.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Columns</p>
              <p className="font-medium">{parsedData.headers.length}</p>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Field Mapping:</p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {expectedFields.map(field => {
                const isMapped = parsedData.headers.includes(field.key);
                return (
                  <div key={field.key} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isMapped ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={isMapped ? 'text-slate-700' : 'text-slate-400'}>
                      {field.name} ({field.key})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Errors */}
          {parsedData.errors.length > 0 && (
            <div className="mt-3 rounded bg-red-50 p-2">
              <p className="text-xs font-medium text-red-800 mb-1">Validation Issues:</p>
              {parsedData.errors.map((err, index) => (
                <p key={index} className="text-xs text-red-700">• {err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
