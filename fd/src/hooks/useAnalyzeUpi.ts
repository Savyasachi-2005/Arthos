/**
 * React Query hook for analyzing UPI messages
 */
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { analyzeUpi } from '../api/upi';
import { AnalyzeResponse } from '../types';
import { getErrorMessage } from '../api/client';

interface UseAnalyzeUpiOptions {
  onSuccess?: (data: AnalyzeResponse) => void;
  onError?: (error: string) => void;
}

export const useAnalyzeUpi = (
  options?: UseAnalyzeUpiOptions
): UseMutationResult<AnalyzeResponse, Error, string> => {
  return useMutation({
    mutationFn: analyzeUpi,
    onSuccess: (data) => {
      console.log('Analysis successful:', data);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error('Analysis failed:', errorMessage);
      options?.onError?.(errorMessage);
    },
  });
};
