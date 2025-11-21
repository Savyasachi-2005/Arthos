/**
 * Spend Summary Card component showing key metrics
 */
import React from 'react';
import { Card } from '../ui/Card';
import { Summary } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/format';
import { TrendingUp, ShoppingBag, Target } from 'lucide-react';

interface SpendSummaryCardProps {
  summary: Summary;
}

export const SpendSummaryCard: React.FC<SpendSummaryCardProps> = ({ summary }) => {
  const cards = [
    {
      label: 'Total Spend',
      value: formatCurrency(summary.total_spend),
      icon: TrendingUp,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Transactions',
      value: formatNumber(summary.transaction_count),
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Top Category',
      value: summary.top_category || 'N/A',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} padding="lg" hover>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-secondary mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {card.value}
              </p>
            </div>
            <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
