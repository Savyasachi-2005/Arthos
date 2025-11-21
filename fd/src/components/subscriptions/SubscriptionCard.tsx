/**
 * Small metric card for subscription stats
 */
import React from 'react';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

interface SubscriptionCardProps {
  title: string;
  value: string;
  helper?: string;
  accent?: 'primary' | 'success' | 'warning';
  icon?: React.ReactNode;
}

const accentClasses: Record<string, string> = {
  primary: 'text-primary-500 bg-primary-50',
  success: 'text-emerald-500 bg-emerald-50',
  warning: 'text-amber-500 bg-amber-50',
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  value,
  helper,
  accent = 'primary',
  icon,
}) => {
  return (
    <Card className="bg-white rounded-2xl border-none shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
          {helper && <p className="text-sm text-slate-400 mt-2">{helper}</p>}
        </div>
        {icon && (
          <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center', accentClasses[accent])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
