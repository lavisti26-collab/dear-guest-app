import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, description, icon, trend = 'neutral' }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            {change.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-xs font-semibold ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '+' : '-'}
              {Math.abs(change.value)}%
            </span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface SystemHealthProps {
  label: string;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export function SystemHealthIndicator({ label, percentage, status }: SystemHealthProps) {
  const statusColors = {
    healthy: 'bg-green-500/20 text-green-700 dark:text-green-400',
    warning: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    critical: 'bg-red-500/20 text-red-700 dark:text-red-400',
  };

  const barColors = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status === 'healthy' && '✓ Healthy'}
          {status === 'warning' && '⚠ Warning'}
          {status === 'critical' && '✗ Critical'}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">{percentage}% used</p>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function ActionCard({ title, description, icon, action }: ActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          {icon && <div className="text-3xl opacity-50">{icon}</div>}
        </div>
      </CardHeader>
      {action && <CardContent>{action}</CardContent>}
    </Card>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
}

export function MetricRow({ label, value, subtext, icon }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        {icon && <div className="text-xl">{icon}</div>}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
      <span className="font-semibold text-lg">{value}</span>
    </div>
  );
}
