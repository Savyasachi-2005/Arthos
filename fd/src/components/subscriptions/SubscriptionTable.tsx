/**
 * Table view for subscriptions with actions
 */
import React from 'react';
import { Subscription } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  isLoading?: boolean;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions = [],
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="bg-white rounded-2xl border-none shadow-lg">
      <CardHeader
        title="Active Subscriptions"
        subtitle={`${subscriptions.length} active subscriptions`}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Amount', 'Billing', 'Renewal', 'Monthly Eq.', ''].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={6}>
                  Loading subscriptions...
                </td>
              </tr>
            )}

            {!isLoading && subscriptions.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={6}>
                  No subscriptions yet. Start by adding your first one.
                </td>
              </tr>
            )}

            {!isLoading &&
              subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {subscription.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      Added on {formatDate(subscription.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {formatCurrency(subscription.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                      {subscription.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatDate(subscription.renewal_date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {formatCurrency(subscription.monthly_equivalent)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(subscription)}
                        className="text-primary-500"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onDelete(subscription)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
