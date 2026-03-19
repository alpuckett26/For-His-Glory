import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold font-body">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-warm-gray-600 font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#6B6B6B' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
