/**
 * UPI Analyzer Page - Main analysis interface
 */
import React from 'react';
import { UpiInput } from '../components/upi/UpiInput';
import { SpendSummaryCard } from '../components/upi/SpendSummaryCard';
import { CategoryBreakdownChart } from '../components/upi/CategoryBreakdownChart';
import { MerchantListTable } from '../components/upi/MerchantListTable';
import { useAnalyzeUpi } from '../hooks/useAnalyzeUpi';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const UpiAnalyzer: React.FC = () => {
  const { mutate: analyzeUpi, data, isLoading, isError, error } = useAnalyzeUpi();

  const handleAnalyze = (text: string) => {
    analyzeUpi(text);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-text-primary">
            Arthos - UPI Spend Analyzer
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Analyze your UPI transactions and gain insights into your spending patterns
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UpiInput onAnalyze={handleAnalyze} loading={isLoading} />
          </div>

          {/* Error Message */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Analysis Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {error?.message || 'An error occurred while analyzing your transactions'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message with Results */}
          {data && (
            <>
              {/* Success Banner */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Analysis Complete!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      Successfully parsed {data.transactions.length} transaction(s) from your messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <SpendSummaryCard summary={data.summary} />

              {/* Charts and Tables */}
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
                      {data.summary.top_merchants.slice(0, 5).map((merchant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <span className="font-medium text-text-primary">
                              {merchant.merchant || 'Unknown'}
                            </span>
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

              {/* Transactions Table */}
              <MerchantListTable transactions={data.transactions} />
            </>
          )}

          {/* Empty State */}
          {!data && !isLoading && !isError && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-text-secondary">
                  Paste your UPI transaction messages above and click "Analyze Transactions" to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
