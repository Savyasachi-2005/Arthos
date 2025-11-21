/**
 * Dashboard Page - Modern overview with analytics
 */
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { SpendSummaryCard } from '../components/upi/SpendSummaryCard';
import { CategoryBreakdownChart } from '../components/upi/CategoryBreakdownChart';
import { MerchantListTable } from '../components/upi/MerchantListTable';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp,
  Award,
  Activity,
  Sparkles,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useTransactions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-900">Loading Dashboard</p>
              <p className="text-sm text-gray-600">Fetching your financial insights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 shadow-xl animate-shake">
            <div className="flex items-start space-x-4">
              <div className="bg-red-200 rounded-xl p-3 flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">Error Loading Dashboard</h3>
                <p className="mt-2 text-sm text-red-700">
                  {error?.message || 'Failed to load transactions. Please try again.'}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasTransactions = data && data.transactions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Modern Header with Gradient */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-time financial overview</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => refetch()}
                disabled={isLoading}
                className="group hover:shadow-lg transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/upi-analyzer')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Transactions</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{data.transactions.length}</p>
                  </div>
                  <div className="bg-blue-200 rounded-xl p-3">
                    <Activity className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Categories</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">
                      {Object.keys(data.summary.categories).length}
                    </p>
                  </div>
                  <div className="bg-purple-200 rounded-xl p-3">
                    <BarChart3 className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Top Merchants</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{data.summary.top_merchants.length}</p>
                  </div>
                  <div className="bg-green-200 rounded-xl p-3">
                    <Users className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Top Category</p>
                    <p className="text-lg font-bold text-orange-900 mt-1 truncate">
                      {data.summary.top_category || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-orange-200 rounded-xl p-3">
                    <Award className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <SpendSummaryCard summary={data.summary} />

            {/* Charts Grid with Modern Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="lg:col-span-1">
                <CategoryBreakdownChart categories={data.summary.categories} />
              </div>

              {/* Top Merchants with Enhanced Design */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Top Merchants
                      </h3>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Top {Math.min(8, data.summary.top_merchants.length)}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {data.summary.top_merchants.slice(0, 8).map((merchant, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-purple-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                            'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block group-hover:text-purple-700 transition-colors">
                              {merchant.merchant || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {merchant.count} transaction{merchant.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg text-gray-900">
                            ₹{merchant.total_spent.toFixed(2)}
                          </span>
                        </div>
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
          // Empty State with Modern Design
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative text-8xl">📊</div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    No Transactions Yet
                  </h3>
                  <p className="text-gray-600">
                    Start analyzing your UPI messages to unlock powerful spending insights and visualizations
                  </p>
                </div>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">AI Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Visual Insights</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Instant Results</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/upi-analyzer')}
                  className="mt-6 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Start Analyzing Transactions
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
