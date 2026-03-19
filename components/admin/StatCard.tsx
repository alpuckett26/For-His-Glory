import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  className?: string
}

export function StatCard({ label, value, sub, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-warm-gray border-l-[3px] border-l-gold p-5 relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-charcoal/40 mb-2">
            {label}
          </p>
          <p className="font-display text-3xl text-charcoal mb-0.5">{value}</p>
          {sub && <p className="font-body text-xs text-charcoal/50">{sub}</p>}
        </div>
        {Icon && (
          <Icon className="h-10 w-10 text-charcoal/8 shrink-0 ml-2" />
        )}
      </div>
    </div>
  )
}
