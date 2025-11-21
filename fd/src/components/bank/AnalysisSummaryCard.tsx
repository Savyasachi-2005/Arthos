/**
 * Analysis Summary Card Component
 * Modern animated stat cards with gradients
 */
import { TrendingDown, TrendingUp, Wallet, Award } from 'lucide-react';
import type { AnalysisSummary } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AnalysisSummaryCardProps {
  summary: AnalysisSummary;
}

export function AnalysisSummaryCard({ summary }: AnalysisSummaryCardProps) {
  const netBalance = summary.total_income - summary.total_spend;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Spend Card */}
      <div className="group relative bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-red-100 rounded-xl p-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">Expenses</span>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Total Spend</p>
          <p className="text-3xl font-bold text-red-600 tracking-tight">
            {formatCurrency(summary.total_spend)}
          </p>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-100 rounded-xl p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Income</span>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Total Income</p>
          <p className="text-3xl font-bold text-green-600 tracking-tight">
            {formatCurrency(summary.total_income)}
          </p>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className={`group relative rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
        netBalance >= 0 
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
          : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity ${
          netBalance >= 0 ? 'bg-blue-200' : 'bg-orange-200'
        }`}></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`rounded-xl p-3 ${
              netBalance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <Wallet className={`w-6 h-6 ${
                netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              netBalance >= 0 
                ? 'text-blue-600 bg-blue-100' 
                : 'text-orange-600 bg-orange-100'
            }`}>
              {netBalance >= 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Net Balance</p>
          <p className={`text-3xl font-bold tracking-tight ${
            netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance))}
          </p>
        </div>
      </div>

      {/* Top Category Card */}
      <div className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 rounded-xl p-3">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Top</span>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Top Category</p>
          <p className="text-xl font-bold text-purple-900 tracking-tight truncate">
            {summary.top_category}
          </p>
          <p className="text-xs text-gray-500 mt-2 truncate">{summary.top_merchant}</p>
        </div>
      </div>
    </div>
  );
}
