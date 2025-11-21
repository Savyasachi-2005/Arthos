/**
 * Spend Summary Card Component
 * Displays key spending metrics
 */
import type { AnalysisSummary } from '../../types';
import { formatCurrency } from '../../utils/format';

interface SpendSummaryCardProps {
  summary: AnalysisSummary;
}

export function SpendSummaryCard({ summary }: SpendSummaryCardProps) {
  const monthlyData = Object.entries(summary.monthly_summary);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
      
      {monthlyData.length > 0 ? (
        <div className="space-y-3">
          {monthlyData.map(([month, amount]) => (
            <div key={month} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{month}</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No monthly data available
        </div>
      )}

      {/* Wasteful Spending Section */}
      {summary.wasteful_spending.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-red-600 mb-3">⚠️ Wasteful Spending Detected</h4>
          <div className="space-y-2">
            {summary.wasteful_spending.map((item, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
