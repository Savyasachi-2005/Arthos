/**
 * Subscription API layer using Axios client
 */
import apiClient from './client';
import {
  Subscription,
  SubscriptionListResponse,
  SubscriptionPayload,
  SubscriptionQueryParams,
  SubscriptionSummary,
} from '../types';

export const getSubscriptions = async (
  params?: SubscriptionQueryParams
): Promise<SubscriptionListResponse> => {
  const response = await apiClient.get<SubscriptionListResponse>('/subscriptions', {
    params,
  });
  return response.data;
};

export const createSubscription = async (
  payload: SubscriptionPayload
): Promise<Subscription> => {
  const response = await apiClient.post<Subscription>('/subscriptions', payload);
  return response.data;
};

export const updateSubscription = async (
  id: number,
  payload: Partial<SubscriptionPayload>
): Promise<Subscription> => {
  const response = await apiClient.put<Subscription>(`/subscriptions/${id}`, payload);
  return response.data;
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await apiClient.delete(`/subscriptions/${id}`);
};

export const getSubscriptionSummary = async (): Promise<SubscriptionSummary> => {
  const response = await apiClient.get<SubscriptionSummary>('/subscriptions/summary');
  return response.data;
};
