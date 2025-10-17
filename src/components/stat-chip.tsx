import { cn } from '@/lib/utils';

interface StatChipProps {
  label: string;
  amount: number;
  currency: string;
  variant?: 'positive' | 'negative' | 'neutral';
}

export function StatChip({ label, amount, currency, variant = 'neutral' }: StatChipProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const variantStyles = {
    positive: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900',
    negative: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800',
  };

  return (
    <div className={cn(
      'flex-1 rounded-lg border p-3 transition-colors',
      variantStyles[variant]
    )}>
      <div className="text-xs font-medium opacity-80 mb-1">{label}</div>
      <div className="text-lg font-bold">
        {currency} {formatAmount(amount)}
      </div>
    </div>
  );
}

