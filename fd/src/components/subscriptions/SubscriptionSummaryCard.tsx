/**
 * Summary widgets and burn breakdown chart
 */
import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { SubscriptionSummary } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

interface SubscriptionSummaryCardProps {
  summary?: SubscriptionSummary;
  chartData: { name: string; value: number }[];
}

export const SubscriptionSummaryCard: React.FC<SubscriptionSummaryCardProps> = ({
  summary,
  chartData,
}) => {
  return (
    <Card className="bg-white rounded-2xl border-none shadow-lg h-full">
      <CardHeader title="Burn Overview" subtitle="Monthly vs Yearly burn" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-500">Monthly Burn</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {summary ? formatCurrency(summary.monthly_burn) : '—'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Normalized monthly spend including yearly plans</p>
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-500">Yearly Burn</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {summary ? formatCurrency(summary.yearly_burn) : '—'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Projected annual spend</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[10, 10, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Upcoming Renewals</p>
          <div className="space-y-2">
            {summary && summary.upcoming_renewals.length > 0 ? (
              summary.upcoming_renewals.map((renewal) => (
                <div
                  key={`${renewal.name}-${renewal.renewal_date}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{renewal.name}</p>
                    <p className="text-xs text-slate-400">
                      Due on {formatDate(renewal.renewal_date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {renewal.days_left} days
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No renewals in the next week 🎉</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
