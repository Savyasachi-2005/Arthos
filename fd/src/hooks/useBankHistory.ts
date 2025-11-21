/**
 * React hook for fetching bank analysis history
 */
import { useState, useEffect } from 'react';
import { getBankHistory } from '../api/bank';
import type { BankAnalysisHistoryResponse } from '../types';

interface UseBankHistoryResult {
  historyData: BankAnalysisHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBankHistory(limit: number = 10, offset: number = 0): UseBankHistoryResult {
  const [historyData, setHistoryData] = useState<BankAnalysisHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getBankHistory(limit, offset);
      setHistoryData(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch history';
      setError(errorMessage);
      setHistoryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit, offset]);

  return {
    historyData,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
