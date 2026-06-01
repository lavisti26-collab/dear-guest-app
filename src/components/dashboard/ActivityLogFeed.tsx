import DashboardText from '@/components/typography/DashboardText';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityLogEntry {
  id: string | number;
  action: string;
  user: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

const severityStyles = {
  low: 'badge-ghost',
  medium: 'badge-warning',
  high: 'badge-error',
};

export default function ActivityLogFeed({
  logs,
  className,
}: {
  logs: ActivityLogEntry[];
  className?: string;
}) {
  return (
    <ul className={cn('timeline timeline-vertical flyon-steps', className)}>
      {logs.map((log, i) => (
        <li key={log.id}>
          {i > 0 && <hr className="bg-border" />}
          <div className="timeline-start font-dashboard text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
          </div>
          <div className="timeline-middle">
            <span
              className={cn(
                'badge badge-sm',
                severityStyles[log.severity]
              )}
            >
              {log.severity}
            </span>
          </div>
          <div className="timeline-end timeline-box luxury-card mb-4 ml-2">
            <DashboardText variant="body" className="font-medium">
              {log.action}
            </DashboardText>
            <DashboardText variant="label" className="text-muted-foreground normal-case">
              by {log.user}
            </DashboardText>
          </div>
          {i < logs.length - 1 && <hr className="bg-border" />}
        </li>
      ))}
    </ul>
  );
}
