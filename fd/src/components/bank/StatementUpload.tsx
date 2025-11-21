/**
 * Statement Upload Component
 * Modern drag-and-drop file upload with animations
 */
import { useState, useRef } from 'react';
import { Upload, FileText, Image, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface StatementUploadProps {
  onUpload: (fileOrText: File | string) => void;
  isUploading: boolean;
  error?: string | null;
}

export function StatementUpload({ onUpload, isUploading, error }: StatementUploadProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onUpload(textInput);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Modern Mode Selector */}
      <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            uploadMode === 'file'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
            uploadMode === 'text'
              ? 'bg-white text-blue-600 shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Text</span>
        </button>
      </div>

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30 rounded-2xl"></div>
            
            <div className="relative space-y-4">
              {/* Animated Upload Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 shadow-lg">
                    <Upload className="w-12 h-12 text-white animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Drop your bank statement here
                </h3>
                <p className="text-sm text-gray-600">
                  or click to browse your files
                </p>
              </div>

              {/* Supported Formats */}
              <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-full shadow-sm">
                  <FileText className="w-3 h-3" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-full shadow-sm">
                  <Image className="w-3 h-3" />
                  <span>JPG</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-full shadow-sm">
                  <Image className="w-3 h-3" />
                  <span>PNG</span>
                </div>
              </div>

              {/* Features List */}
              <div className="pt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="flex flex-col items-center space-y-1">
                  <FileCheck className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">OCR Support</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <FileCheck className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-600">AI Analysis</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <FileCheck className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-600">Secure</span>
                </div>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Text Input Mode */}
      {uploadMode === 'text' && (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your bank statement text here...&#10;&#10;Example:&#10;Date: 01-Jan-2024&#10;Transaction: Payment to Amazon&#10;Amount: ₹1,250.00..."
              className="w-full h-80 p-6 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm resize-none transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              {textInput.length} characters
            </div>
          </div>
          
          <Button
            onClick={handleTextSubmit}
            disabled={isUploading || !textInput.trim()}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Statement Text
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-shake">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Upload Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-900">Processing your statement</p>
            <p className="text-sm text-gray-600">Extracting text and preparing for analysis...</p>
          </div>
        </div>
      )}
    </div>
  );
}

