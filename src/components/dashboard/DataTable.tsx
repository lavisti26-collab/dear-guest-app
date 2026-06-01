import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardText from '@/components/typography/DashboardText';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { useVisualSurface } from '@/hooks/useVisualSurface';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchKeys?: (keyof T)[];
  batchActions?: {
    label: string;
    onAction: (selected: T[]) => void;
    variant?: 'default' | 'destructive';
  }[];
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchKeys = [],
  batchActions = [],
  emptyMessage = 'No records found',
  className,
}: DataTableProps<T>) {
  const { tableWrap } = useVisualSurface();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const toggleRow = (id: string | number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectedRows = data.filter((r) => selected.has(r.id));

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-dashboard"
          />
        </div>
        {batchActions.length > 0 && selected.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <DashboardText variant="label" className="self-center normal-case">
              {selected.size} selected
            </DashboardText>
            {batchActions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={() => action.onAction(selectedRows)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className={cn(tableWrap, 'neon-border-admin/30')}>
        <Table>
          <TableHeader>
            <TableRow>
              {batchActions.length > 0 && (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key} className="font-dashboard font-semibold">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (batchActions.length ? 1 : 0)}
                  className="text-center py-12 text-muted-foreground font-dashboard"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {batchActions.length > 0 && (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={() => toggleRow(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className="font-dashboard text-sm">
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
