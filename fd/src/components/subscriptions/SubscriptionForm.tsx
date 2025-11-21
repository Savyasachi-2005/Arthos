/**
 * Form for creating/updating subscriptions
 */
import React, { useEffect, useState } from 'react';
import { SubscriptionPayload, BillingCycle } from '../../types';
import { Button } from '../ui/Button';

export interface SubscriptionFormValues extends SubscriptionPayload {}

interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionPayload>;
  onSubmit: (values: SubscriptionPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const billingCycles: { label: string; value: BillingCycle }[] = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<SubscriptionPayload>({
    name: initialValues?.name || '',
    amount: initialValues?.amount || 0,
    billing_cycle: initialValues?.billing_cycle || 'monthly',
    renewal_date:
      initialValues?.renewal_date || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setValues({
      name: initialValues?.name || '',
      amount: initialValues?.amount || 0,
      billing_cycle: initialValues?.billing_cycle || 'monthly',
      renewal_date:
        initialValues?.renewal_date || new Date().toISOString().split('T')[0],
    });
  }, [initialValues]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) {
      return;
    }
    onSubmit({ ...values, amount: Number(values.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          placeholder="e.g., Netflix Premium"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Amount (INR)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Billing Cycle
          </label>
          <select
            name="billing_cycle"
            value={values.billing_cycle}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {billingCycles.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Renewal Date
        </label>
        <input
          type="date"
          name="renewal_date"
          value={values.renewal_date}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Save Subscription
        </Button>
      </div>
    </form>
  );
};
