/**
 * Subscription management and burn tracker page
 */
import React, { useMemo, useState } from 'react';
import { Plus, Flame, CalendarClock } from 'lucide-react';
import { Subscription, SubscriptionPayload, SubscriptionQueryParams } from '../types';
import { Button } from '../components/ui/Button';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { SubscriptionTable } from '../components/subscriptions/SubscriptionTable';
import { SubscriptionForm } from '../components/subscriptions/SubscriptionForm';
import { SubscriptionSummaryCard } from '../components/subscriptions/SubscriptionSummaryCard';
import {
  useCreateSubscription,
  useDeleteSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '../hooks/useSubscriptions';
import { useSubscriptionSummary } from '../hooks/useSubscriptionSummary';
import { formatCurrency } from '../utils/format';

export const Subscriptions: React.FC = () => {
  const [filters, setFilters] = useState<SubscriptionQueryParams>({ limit: 100, offset: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const subscriptionsQuery = useSubscriptions(filters);
  const subscriptionList = subscriptionsQuery.data;
  const isLoading = subscriptionsQuery.isLoading;
  const error = subscriptionsQuery.error;
  const { data: summary, isLoading: summaryLoading } = useSubscriptionSummary();

  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();

  const chartData = useMemo(
    () => [
      { name: 'Monthly Burn', value: summary?.monthly_burn ?? 0 },
      { name: 'Yearly Burn', value: summary?.yearly_burn ?? 0 },
    ],
    [summary]
  );

  const handleOpenModal = (subscription?: Subscription) => {
    if (subscription) {
      setEditingSubscription(subscription);
    } else {
      setEditingSubscription(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubscription(null);
  };

  const handleSubmit = (values: SubscriptionPayload) => {
    if (editingSubscription) {
      updateMutation.mutate(
        { id: editingSubscription.id, data: values },
        { onSuccess: handleCloseModal }
      );
    } else {
      createMutation.mutate(values, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = (subscription: Subscription) => {
    const confirmed = window.confirm(
      `Delete ${subscription.name}? This cannot be undone.`
    );
    if (confirmed) {
      deleteMutation.mutate(subscription.id);
    }
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const activeSubscriptions = subscriptionList?.items || [];
  const upcomingCount = summary?.upcoming_renewals.length || 0;
  const monthlyValue = summaryLoading ? 'Loading…' : summary ? formatCurrency(summary.monthly_burn) : '—';
  const yearlyValue = summaryLoading ? 'Loading…' : summary ? formatCurrency(summary.yearly_burn) : '—';
  const upcomingValue = summaryLoading ? '…' : `${upcomingCount}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-primary-500 to-primary-600 text-white p-10 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-2">Subscriptions</p>
              <h1 className="text-4xl font-semibold leading-tight">Manage Recurring Spend & Burn</h1>
              <p className="text-white/80 mt-3 text-lg">
                Track every subscription, forecast renewals, and keep monthly burn predictable.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-white/90"
              onClick={() => handleOpenModal()}
            >
              <Plus className="w-5 h-5 mr-2" /> Add Subscription
            </Button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
            Failed to load subscriptions: {error.message}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SubscriptionCard
            title="Monthly Burn"
            value={monthlyValue}
            helper="All recurring commitments normalized"
            accent="primary"
            icon={<Flame className="w-6 h-6" />}
          />
          <SubscriptionCard
            title="Yearly Burn"
            value={yearlyValue}
            helper="Projected 12-month spend"
            accent="warning"
            icon={<Flame className="w-6 h-6" />}
          />
          <SubscriptionCard
            title="Upcoming Renewals"
            value={upcomingValue}
            helper="Next 7 days"
            accent="success"
            icon={<CalendarClock className="w-6 h-6" />}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-4">
              <input
                type="text"
                name="name"
                placeholder="Search by name"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onChange={handleFilterChange}
              />
              <select
                name="billing_cycle"
                className="rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onChange={handleFilterChange}
              >
                <option value="">All cycles</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <SubscriptionTable
              subscriptions={activeSubscriptions}
              isLoading={isLoading}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          </div>
          <SubscriptionSummaryCard summary={summary} chartData={chartData} />
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-400">
                  {editingSubscription ? 'Update Plan' : 'Add New Subscription'}
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {editingSubscription ? editingSubscription.name : 'New Subscription'}
                </h3>
              </div>
              <Button variant="ghost" onClick={handleCloseModal}>
                Close
              </Button>
            </div>
            <SubscriptionForm
              initialValues={editingSubscription || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
