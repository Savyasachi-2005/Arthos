/**
 * Subscription management and burn tracker page
 */
import React, { useMemo, useState } from 'react';
import { Plus, Flame, CalendarClock, Search, Filter, X, TrendingUp } from 'lucide-react';
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
  const [filters, setFilters] = useState<SubscriptionQueryParams>({
    limit: 100,
    offset: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
      { name: "Monthly Burn", value: summary?.monthly_burn ?? 0 },
      { name: "Yearly Burn", value: summary?.yearly_burn ?? 0 },
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      name: value || undefined,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ limit: 100, offset: 0 });
  };

  const hasActiveFilters = searchTerm || filters.billing_cycle || filters.min_amount || filters.max_amount;

  const activeSubscriptions = subscriptionList?.items || [];
  const upcomingCount = summary?.upcoming_renewals.length || 0;
  const monthlyValue = summaryLoading
    ? "Loading…"
    : summary
    ? formatCurrency(summary.monthly_burn)
    : "—";
  const yearlyValue = summaryLoading
    ? "Loading…"
    : summary
    ? formatCurrency(summary.yearly_burn)
    : "—";
  const upcomingValue = summaryLoading ? "…" : `${upcomingCount}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Subscriptions</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3">
                Manage Recurring Spend
              </h1>
              <p className="text-white/90 text-lg max-w-2xl">
                Track every subscription, forecast renewals, and keep monthly burn predictable.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-white/70">Active Plans</p>
                  <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-white/70">Monthly Burn</p>
                  <p className="text-2xl font-bold">{monthlyValue}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                className="!bg-white !text-primary-600 !border-white hover:!bg-grey/50 shadow-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => handleOpenModal()}
              >
                <Plus className="w-5 h-5 mr-2" /> Add Subscription
              </Button>
              {upcomingCount > 0 && (
                <div className="bg-yellow-400/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg px-4 py-2 text-center">
                  <p className="text-xs text-yellow-100">🔔 {upcomingCount} renewal{upcomingCount > 1 ? 's' : ''} coming</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
            Failed to load subscriptions: {error.message}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="transform hover:scale-105 transition-all duration-300">
            <SubscriptionCard
              title="Monthly Burn"
              value={monthlyValue}
              helper="All recurring commitments normalized"
              accent="primary"
              icon={<Flame className="w-6 h-6" />}
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <SubscriptionCard
              title="Yearly Burn"
              value={yearlyValue}
              helper="Projected 12-month spend"
              accent="warning"
              icon={<Flame className="w-6 h-6" />}
            />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <SubscriptionCard
              title="Upcoming Renewals"
              value={upcomingValue}
              helper="Next 7 days"
              accent="success"
              icon={<CalendarClock className="w-6 h-6" />}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Search & Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Search className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Search & Filter</h3>
                    <p className="text-xs text-slate-500">Find your subscriptions</p>
                  </div>
                </div>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search by subscription name..."
                    className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    onChange={handleSearchChange}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    name="billing_cycle"
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    onChange={handleFilterChange}
                    value={filters.billing_cycle || ''}
                  >
                    <option value="">All Billing Cycles</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowFilters(!showFilters)}
                    className="whitespace-nowrap"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide' : 'More'} Filters
                  </Button>
                </div>
                
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Min Amount</label>
                      <input
                        type="number"
                        name="min_amount"
                        placeholder="₹0"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        onChange={handleFilterChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Max Amount</label>
                      <input
                        type="number"
                        name="max_amount"
                        placeholder="₹10,000"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        onChange={handleFilterChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <SubscriptionTable
              subscriptions={activeSubscriptions}
              isLoading={isLoading}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          </div>
          
          {/* Summary Card - Now more prominent */}
          <div className="lg:sticky lg:top-6 h-fit">
            <SubscriptionSummaryCard summary={summary} chartData={chartData} />
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center space-x-2 bg-purple-50 rounded-full px-3 py-1 mb-2">
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                    {editingSubscription ? 'Update Plan' : 'Add New Subscription'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingSubscription ? editingSubscription.name : 'New Subscription'}
                </h3>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleCloseModal}
                className="hover:bg-slate-100 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <SubscriptionForm
              initialValues={editingSubscription || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isSubmitting={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
