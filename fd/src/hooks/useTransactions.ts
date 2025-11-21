/**
 * React Query hook for fetching transaction history
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getTransactions } from '../api/upi';
import { TransactionListResponse, TransactionQueryParams } from '../types';

interface UseTransactionsOptions extends TransactionQueryParams {
  enabled?: boolean;
}

export const useTransactions = (
  options?: UseTransactionsOptions
): UseQueryResult<TransactionListResponse, Error> => {
  const { enabled = true, ...params } = options || {};

  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching transactions with manual refetch
 */
export const useTransactionsManual = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions(),
    enabled: false, // Manual trigger only
  });
};
