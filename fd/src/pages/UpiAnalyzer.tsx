/**
 * UPI Analyzer Page - Main analysis interface
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UpiInput } from '../components/upi/UpiInput';
import { SpendSummaryCard } from '../components/upi/SpendSummaryCard';
import { CategoryBreakdownChart } from '../components/upi/CategoryBreakdownChart';
import { MerchantListTable } from '../components/upi/MerchantListTable';
import { SubscriptionDetectionModal } from '../components/upi/SubscriptionDetectionModal';
import { Button } from '../components/ui/Button';
import { useAnalyzeUpi } from '../hooks/useAnalyzeUpi';
import { AlertCircle, Home, LayoutDashboard, Sparkles } from 'lucide-react';

export const UpiAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: analyzeUpi, data, isPending, isError, error } = useAnalyzeUpi();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleAnalyze = (text: string) => {
    const loadingToast = toast.loading('Analyzing transactions...');
    
    analyzeUpi(text, {
      onSuccess: (data) => {
        toast.dismiss(loadingToast);
        toast.success(
          `Successfully analyzed ${data.transactions.length} transaction${data.transactions.length !== 1 ? 's' : ''}!`,
          {
            icon: '✅',
            duration: 3000,
          }
        );
        
        // Show subscription detection modal if subscriptions found
        if (data.detected_subscriptions && data.detected_subscriptions.length > 0) {
          const autoAddCount = data.detected_subscriptions.filter(
            (sub) => sub.confidence >= 0.7  // Match new threshold
          ).length;
          
          setTimeout(() => {
            setShowSubscriptionModal(true);
            
            if (autoAddCount > 0 && data.detected_subscriptions) {
              toast.success(
                `🎯 Detected ${data.detected_subscriptions.length} subscription${data.detected_subscriptions.length !== 1 ? 's' : ''}! Auto-adding ${autoAddCount}...`,
                {
                  duration: 6000,
                  style: {
                    background: '#8b5cf6',
                    color: '#fff',
                  },
                }
              );
            } else if (data.detected_subscriptions) {
              toast.success(
                `🎯 Found ${data.detected_subscriptions.length} potential subscription${data.detected_subscriptions.length !== 1 ? 's' : ''}!`,
                {
                  duration: 5000,
                }
              );
            }
          }, 500);
        }
      },
      onError: (error: any) => {
        toast.dismiss(loadingToast);
        toast.error(error.response?.data?.detail || 'Failed to analyze transactions');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Arthos - UPI Spend Analyzer
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Analyze your UPI transactions and gain insights into your spending patterns
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UpiInput onAnalyze={handleAnalyze} loading={isPending} />
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
              {/* Subscription Detection Banner */}
              {data.detected_subscriptions && data.detected_subscriptions.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500 rounded-xl p-2">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-purple-900">
                          🎯 {data.detected_subscriptions.length} Subscription{data.detected_subscriptions.length !== 1 ? 's' : ''} Detected!
                        </h3>
                        <p className="mt-1 text-sm text-purple-700">
                          {data.detected_subscriptions.filter(s => s.confidence >= 0.7).length > 0 
                            ? `Auto-added ${data.detected_subscriptions.filter(s => s.confidence >= 0.7).length} subscription${data.detected_subscriptions.filter(s => s.confidence >= 0.7).length !== 1 ? 's' : ''} to your account! Review all detections below.`
                            : `We found potential recurring payments. Review and add them to track your subscriptions.`
                          }
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                    >
                      View Subscriptions
                    </Button>
                  </div>
                </div>
              )}

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
          {!data && !isPending && !isError && (
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

      {/* Subscription Detection Modal */}
      {showSubscriptionModal && data?.detected_subscriptions && data.detected_subscriptions.length > 0 && (
        <SubscriptionDetectionModal
          detectedSubscriptions={data.detected_subscriptions}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={() => {
            toast.success('Visit the Subscriptions page to manage your subscriptions.', {
              duration: 4000,
            });
          }}
          autoAdd={true}
        />
      )}
    </div>
  );
};
