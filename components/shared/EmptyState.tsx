import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-warm-gray-400" style={{ color: '#C5C0B8' }}>
          {icon}
        </div>
      )}
      <h3 className="font-display text-2xl text-charcoal mb-2">{title}</h3>
      {description && (
        <p className="font-body text-sm mb-6 max-w-sm" style={{ color: '#6B6B6B' }}>
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center px-6 py-3 bg-gold text-white font-body font-medium text-sm rounded-none hover:bg-gold-light transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
