/**
 * React Query hook for subscription burn summary
 */
import { useQuery } from '@tanstack/react-query';
import { getSubscriptionSummary } from '../api/subscriptions';
import { SubscriptionSummary } from '../types';

export const useSubscriptionSummary = () => {
  return useQuery<SubscriptionSummary, Error>({
    queryKey: ['subscriptionSummary'],
    queryFn: getSubscriptionSummary,
    staleTime: 60_000,
  });
};
