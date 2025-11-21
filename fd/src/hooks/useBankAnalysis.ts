/**
 * React hook for analyzing bank statements with Gemini AI
 */
import { useState } from 'react';
import { analyzeStatement } from '../api/bank';
import type { AnalyzeStatementResponse } from '../types';

interface UseBankAnalysisResult {
  analysisData: AnalyzeStatementResponse | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  analyze: (rawText: string) => Promise<void>;
  reset: () => void;
}

export function useBankAnalysis(): UseBankAnalysisResult {
  const [analysisData, setAnalysisData] = useState<AnalyzeStatementResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyze = async (rawText: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const result = await analyzeStatement(rawText);
      setAnalysisData(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Analysis failed';
      setAnalysisError(errorMessage);
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysisData(null);
    setAnalysisError(null);
  };

  return {
    analysisData,
    isAnalyzing,
    analysisError,
    analyze,
    reset,
  };
}
