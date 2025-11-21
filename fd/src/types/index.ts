/**
 * Core TypeScript types and interfaces for the Arthos UPI Analyzer
 */

export interface Transaction {
  id: string;
  merchant: string | null;
  amount: number;
  category: string;
  timestamp: string | null;
  raw_text: string;
  created_at?: string;
}

export interface TopMerchant {
  merchant: string;
  total_spent: number;
  count: number;
}

export interface Summary {
  total_spend: number;
  transaction_count: number;
  top_category: string | null;
  categories: Categories;
  top_merchants: TopMerchant[];
}

export interface Categories {
  [key: string]: number;
}

export interface AnalyzeResponse {
  summary: Summary;
  categories: Categories;
  transactions: Transaction[];
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  summary: Summary;
}

export interface UpiAnalyzeRequest {
  raw_text: string;
}

export interface TransactionQueryParams {
  limit?: number;
  offset?: number;
  category?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface CategoryConfig {
  name: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  Food: {
    name: 'Food',
    color: '#FF6B6B',
    icon: '🍔',
  },
  Travel: {
    name: 'Travel',
    color: '#4ECDC4',
    icon: '🚗',
  },
  Bills: {
    name: 'Bills',
    color: '#95E1D3',
    icon: '💡',
  },
  Shopping: {
    name: 'Shopping',
    color: '#F38181',
    icon: '🛍️',
  },
  Groceries: {
    name: 'Groceries',
    color: '#A8E6CF',
    icon: '🛒',
  },
  Entertainment: {
    name: 'Entertainment',
    color: '#FFD3B6',
    icon: '🎬',
  },
  Education: {
    name: 'Education',
    color: '#FFAAA5',
    icon: '📚',
  },
  Health: {
    name: 'Health',
    color: '#FF8B94',
    icon: '⚕️',
  },
  Others: {
    name: 'Others',
    color: '#B8B8D1',
    icon: '📦',
  },
};

export type CategoryName = keyof typeof CATEGORIES;

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPayload {
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  renewal_date: string; // ISO date string
}

export interface Subscription extends SubscriptionPayload {
  id: number;
  created_at: string;
  monthly_equivalent: number;
}

export interface SubscriptionListResponse {
  items: Subscription[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpcomingRenewalSummary {
  name: string;
  days_left: number;
  renewal_date: string;
}

export interface SubscriptionSummary {
  monthly_burn: number;
  yearly_burn: number;
  upcoming_renewals: UpcomingRenewalSummary[];
}

export interface SubscriptionQueryParams {
  name?: string;
  min_amount?: number;
  max_amount?: number;
  billing_cycle?: BillingCycle;
  limit?: number;
  offset?: number;
}
