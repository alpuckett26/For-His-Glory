import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No records found.',
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-warm-gray">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left py-3 px-4 font-body text-xs font-semibold uppercase tracking-wider text-charcoal/50',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center font-body text-sm text-charcoal/50"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-b border-warm-gray hover:bg-ivory/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'py-3 px-4 font-body text-sm text-charcoal',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
