/**
 * API functions for UPI transaction analysis
 */
import apiClient from './client';
import {
  AnalyzeResponse,
  TransactionListResponse,
  UpiAnalyzeRequest,
  TransactionQueryParams,
} from '../types';

/**
 * Analyze UPI/SMS messages and extract transactions
 */
export const analyzeUpi = async (rawText: string): Promise<AnalyzeResponse> => {
  const payload: UpiAnalyzeRequest = { raw_text: rawText };
  const response = await apiClient.post<AnalyzeResponse>('/upi/analyze', payload);
  return response.data;
};

/**
 * Get transaction history with optional filters
 */
export const getTransactions = async (
  params?: TransactionQueryParams
): Promise<TransactionListResponse> => {
  const response = await apiClient.get<TransactionListResponse>('/upi/transactions', {
    params,
  });
  return response.data;
};

/**
 * Health check endpoint
 */
export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await apiClient.get<{ status: string }>('/health');
  return response.data;
};
