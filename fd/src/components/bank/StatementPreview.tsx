/**
 * Statement Preview Component
 * Modern preview with animated stats
 */
import { FileText, CheckCircle, Sparkles } from 'lucide-react';
import type { StatementUploadResponse } from '../../types';

interface StatementPreviewProps {
  data: StatementUploadResponse;
}

export function StatementPreview({ data }: StatementPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
      {/* Header with Gradient */}
      <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Statement Extracted Successfully</h3>
              <p className="text-sm text-blue-100 mt-0.5">
                Ready for AI analysis
              </p>
            </div>
          </div>
          <CheckCircle className="w-8 h-8 text-green-300" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 rounded-full p-1.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {data.line_count} transaction lines detected
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className="px-3 py-1 bg-white rounded-full shadow-sm">
              OCR Processed
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Preview Container with Better Scrollbar */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 max-h-96 overflow-y-auto custom-scrollbar shadow-inner">
          <div className="space-y-1 font-mono text-xs">
            {data.lines.map((line, index) => (
              <div
                key={index}
                className="group py-2 px-3 hover:bg-white rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <span className="inline-block w-10 text-gray-400 font-semibold">{index + 1}</span>
                <span className="text-gray-700 group-hover:text-gray-900">{line}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Info Card */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 rounded-full p-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Ready for AI Analysis
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Review the extracted text above. Click the "Analyze with Gemini AI" button to get insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
