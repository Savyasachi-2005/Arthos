/**
 * Merchant Bar Chart Component
 * Shows top merchants by spending
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../utils/format';
import type { BankTransaction } from '../../types';

interface MerchantBarChartProps {
  transactions: BankTransaction[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

export function MerchantBarChart({ transactions }: MerchantBarChartProps) {
  // Calculate merchant totals
  const merchantTotals = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => {
      if (!acc[t.merchant]) {
        acc[t.merchant] = 0;
      }
      acc[t.merchant] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Get top 10 merchants
  const data = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants</h3>
        <div className="text-center py-12 text-gray-500">
          No merchant data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants by Spending</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
          <YAxis type="category" dataKey="merchant" width={90} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
