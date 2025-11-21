/**
 * Merchant List Table component
 */
import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Transaction, CATEGORIES } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { ChevronDown, ChevronUp, Store, Calendar } from 'lucide-react';

interface MerchantListTableProps {
  transactions: Transaction[];
}

export const MerchantListTable: React.FC<MerchantListTableProps> = ({
  transactions,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'amount' | 'timestamp' | 'merchant'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'timestamp') {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      comparison = dateA - dateB;
    } else if (sortField === 'merchant') {
      const merchantA = a.merchant || 'Unknown';
      const merchantB = b.merchant || 'Unknown';
      comparison = merchantA.localeCompare(merchantB);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader title="Transactions" />
        <div className="py-12 text-center text-text-secondary">
          <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No transactions found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4 border-b border-gray-200">
        <CardHeader title="Transactions" subtitle={`${transactions.length} transactions`} />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('merchant')}
              >
                <div className="flex items-center space-x-1">
                  <span>Merchant</span>
                  {sortField === 'merchant' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {sortField === 'amount' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Category
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortField === 'timestamp' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => {
              const categoryConfig = CATEGORIES[transaction.category];
              const isExpanded = expandedRow === transaction.id;

              return (
                <React.Fragment key={transaction.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="h-5 w-5 text-text-muted mr-2" />
                        <div className="text-sm font-medium text-text-primary">
                          {transaction.merchant || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-text-primary">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: `${categoryConfig?.color}20`,
                          color: categoryConfig?.color,
                        }}
                      >
                        {categoryConfig?.icon} {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => toggleRow(transaction.id)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {isExpanded ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="text-sm text-text-secondary">
                          <p className="font-medium text-text-primary mb-2">Raw Message:</p>
                          <p className="font-mono text-xs bg-white p-3 rounded border border-gray-200">
                            {transaction.raw_text}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {sortedTransactions.map((transaction) => {
          const categoryConfig = CATEGORIES[transaction.category];
          const isExpanded = expandedRow === transaction.id;

          return (
            <div key={transaction.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Store className="h-4 w-4 text-text-muted" />
                    <span className="text-sm font-medium text-text-primary">
                      {transaction.merchant || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-text-primary">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
                <span
                  className="px-2 py-1 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor: `${categoryConfig?.color}20`,
                    color: categoryConfig?.color,
                  }}
                >
                  {categoryConfig?.icon} {transaction.category}
                </span>
              </div>

              <div className="flex items-center text-xs text-text-secondary mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(transaction.timestamp)}
              </div>

              <button
                onClick={() => toggleRow(transaction.id)}
                className="text-primary-600 text-sm font-medium"
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-text-primary mb-2">Raw Message:</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded">
                    {transaction.raw_text}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
