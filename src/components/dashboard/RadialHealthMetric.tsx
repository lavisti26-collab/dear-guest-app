import DashboardText from '@/components/typography/DashboardText';
import { cn } from '@/lib/utils';

interface RadialHealthMetricProps {
  label: string;
  value: number;
  icon?: string;
  status?: 'healthy' | 'warning' | 'critical';
  className?: string;
}

const statusColor = {
  healthy: 'text-success',
  warning: 'text-warning',
  critical: 'text-error',
};

export default function RadialHealthMetric({
  label,
  value,
  icon = '⚡',
  status = 'healthy',
  className,
}: RadialHealthMetricProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const colorClass =
    status === 'healthy'
      ? 'text-primary'
      : status === 'warning'
        ? 'text-warning'
        : 'text-error';

  return (
    <div className={cn('flex flex-col items-center gap-2 p-4 luxury-card rounded-2xl', className)}>
      <div
        className={cn('radial-progress', colorClass)}
        style={{ '--value': clamped, '--size': '5.5rem', '--thickness': '6px' } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={clamped}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <DashboardText variant="label" className="font-semibold text-center">
        {label}
      </DashboardText>
      <span className={cn('text-xs font-dashboard font-medium', statusColor[status])}>
        {clamped}% · {status}
      </span>
    </div>
  );
}
