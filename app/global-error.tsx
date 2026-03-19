'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {error.message?.includes('supabaseUrl') || error.message?.includes('required')
            ? 'Missing environment variables. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings.'
            : 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
