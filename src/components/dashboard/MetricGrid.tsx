import { StatCard } from './DashboardComponents';
import { cn } from '@/lib/utils';
import { useVisualSurface } from '@/hooks/useVisualSurface';

export interface MetricItem {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  description?: string;
  icon?: React.ReactNode;
}

interface MetricGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  flyonStats?: boolean;
}

export default function MetricGrid({
  metrics,
  columns = 4,
  className,
  flyonStats = true,
}: MetricGridProps) {
  const { stat, metricGlow } = useVisualSurface();
  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  if (flyonStats) {
    return (
      <div
        className={cn(
          'dashboard-stat-grid grid grid-cols-1 gap-4',
          colClass,
          className
        )}
      >
        {metrics.map((m, i) => (
          <div key={i} className={cn('stat p-4 relative', stat, metricGlow)}>
            <div className="stat-title font-dashboard text-sm text-muted-foreground">
              {m.title}
            </div>
            <div className="stat-value font-dashboard text-3xl font-bold text-foreground mt-1">
              {m.value}
            </div>
            {m.change && (
              <div
                className={cn(
                  'stat-desc text-xs font-semibold mt-1',
                  m.change.isPositive ? 'text-green-600' : 'text-amber-600'
                )}
              >
                {m.change.isPositive ? '↑' : '↓'} {Math.abs(m.change.value)}% vs last week
              </div>
            )}
            {m.icon && (
              <div className="absolute top-3 right-3 text-2xl opacity-80">{m.icon}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4', colClass, className)}>
      {metrics.map((m, i) => (
        <StatCard key={i} {...m} />
      ))}
    </div>
  );
}
