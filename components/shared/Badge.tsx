import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'olive' | 'sage' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body',
        {
          'bg-warm-gray text-charcoal': variant === 'default',
          'bg-gold/10 text-gold border border-gold/20': variant === 'gold',
          'bg-olive/10 text-olive': variant === 'olive',
          'bg-sage/20 text-olive': variant === 'sage',
          'border border-charcoal/20 text-charcoal bg-transparent': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
