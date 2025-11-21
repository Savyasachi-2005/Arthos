/**
 * Category Breakdown Chart component
 */
import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Categories, CATEGORIES } from '../../types';
import { formatCurrency, formatPercentage, calculatePercentage } from '../../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryBreakdownChartProps {
  categories: Categories;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  categories,
}) => {
  // Calculate total
  const total = Object.values(categories).reduce((sum, amount) => sum + amount, 0);

  // Prepare data for chart
  const chartData = Object.entries(categories)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: calculatePercentage(amount, total),
      color: CATEGORIES[category]?.color || '#B8B8D1',
      icon: CATEGORIES[category]?.icon || '📦',
    }))
    .sort((a, b) => b.value - a.value); // Sort by amount descending

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-text-primary">
            {data.icon} {data.name}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-text-muted">
            {formatPercentage(data.percentage)} of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = () => (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {chartData.map((entry, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {entry.icon} {entry.name}
            </p>
            <p className="text-xs text-text-secondary">
              {formatCurrency(entry.value)} ({formatPercentage(entry.percentage)})
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader title="Category Breakdown" />
        <div className="py-12 text-center text-text-secondary">
          <p>No category data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Category Breakdown"
        subtitle={`Total: ${formatCurrency(total)}`}
      />

      <div className="mt-4">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) =>
                percentage > 5 ? `${percentage.toFixed(1)}%` : ''
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        {renderLegend()}
      </div>
    </Card>
  );
};
