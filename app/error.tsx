'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isMissingConfig =
    error.message?.includes('supabaseUrl') ||
    error.message?.includes('required') ||
    error.message?.includes('environment')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl text-charcoal mb-4">
          Something went wrong
        </h1>
        {isMissingConfig ? (
          <p className="text-charcoal/60 mb-6 font-body">
            The app is missing required environment variables. Please configure{' '}
            <code className="text-sm bg-charcoal/10 px-1 rounded">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            ,{' '}
            <code className="text-sm bg-charcoal/10 px-1 rounded">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            , and other variables in your Vercel project settings.
          </p>
        ) : (
          <p className="text-charcoal/60 mb-6 font-body">
            An unexpected error occurred. Please try again.
          </p>
        )}
        <button
          onClick={reset}
          className="font-body text-sm font-medium bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal/80 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
