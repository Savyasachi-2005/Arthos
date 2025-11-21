/**
 * React Query hooks for subscription CRUD operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  updateSubscription,
} from '../api/subscriptions';
import {
  Subscription,
  SubscriptionListResponse,
  SubscriptionPayload,
  SubscriptionQueryParams,
} from '../types';

export const useSubscriptions = (params?: SubscriptionQueryParams) => {
  return useQuery<SubscriptionListResponse, Error>({
    queryKey: ['subscriptions', params ?? {}],
    queryFn: () => getSubscriptions(params),
    staleTime: 30_000,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, SubscriptionPayload>({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, { id: number; data: Partial<SubscriptionPayload> }>({
    mutationFn: ({ id, data }) => updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionSummary'] });
    },
  });
};
