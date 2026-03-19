import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-10 w-10': size === 'lg',
        },
        className
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" className="text-gold" />
    </div>
  )
}
