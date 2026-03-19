import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  // Order statuses
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  fulfilled: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
  // Inquiry statuses
  new: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-600',
  declined: 'bg-red-100 text-red-800',
  // Message statuses
  unread: 'bg-amber-100 text-amber-800',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-800',
  // Generic
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-800',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium capitalize',
        color,
        className
      )}
    >
      {status}
    </span>
  )
}
