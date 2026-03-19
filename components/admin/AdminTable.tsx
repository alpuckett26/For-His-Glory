'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  loading?: boolean
  pageSize?: number
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No records found.',
  loading = false,
  pageSize = PAGE_SIZE,
}: AdminTableProps<T>) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(data.length / pageSize)
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize)

  // Reset to page 0 when data changes (e.g. after filtering)
  // We track data.length as a proxy; for a proper reset use a key prop on parent
  return (
    <div>
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
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-warm-gray">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3.5 px-4">
                      <div className="h-4 bg-charcoal/5 rounded animate-pulse" style={{ width: `${60 + (i * 7) % 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center font-body text-sm text-charcoal/40"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-warm-gray last:border-0 hover:bg-ivory/60 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('py-3 px-4 font-body text-sm text-charcoal', col.className)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-warm-gray">
          <p className="font-body text-xs text-charcoal/50">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of{' '}
            {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 text-charcoal/50 disabled:opacity-30 hover:text-charcoal transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'w-7 h-7 font-body text-xs rounded transition-colors',
                  i === page
                    ? 'bg-gold text-white'
                    : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 text-charcoal/50 disabled:opacity-30 hover:text-charcoal transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
