/**
 * Dashboard Page - Overview of all transactions
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { SpendSummaryCard } from '../components/upi/SpendSummaryCard';
import { CategoryBreakdownChart } from '../components/upi/CategoryBreakdownChart';
import { MerchantListTable } from '../components/upi/MerchantListTable';
import { Button } from '../components/ui/Button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTransactions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-text-secondary">Loading transactions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="mt-2 text-sm text-red-700">
                  {error?.message || 'Failed to load transactions'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasTransactions = data && data.transactions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Overview of all your analyzed transactions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/analyzer')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Analyze New
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasTransactions ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SpendSummaryCard summary={data.summary} />

            {/* Charts and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="lg:col-span-1">
                <CategoryBreakdownChart categories={data.summary.categories} />
              </div>

              {/* Top Merchants */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Top Merchants
                  </h3>
                  <div className="space-y-3">
                    {data.summary.top_merchants.slice(0, 8).map((merchant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-text-primary block">
                              {merchant.merchant || 'Unknown'}
                            </span>
                            <span className="text-xs text-text-muted">
                              {merchant.count} transaction{merchant.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <span className="font-semibold text-text-primary">
                          ₹{merchant.total_spent.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* All Transactions */}
            <MerchantListTable transactions={data.transactions} />
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Transactions Yet
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Start by analyzing your UPI messages to see your spending insights here
              </p>
              <Button onClick={() => navigate('/analyzer')}>
                <Plus className="h-4 w-4 mr-2" />
                Analyze Transactions
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
