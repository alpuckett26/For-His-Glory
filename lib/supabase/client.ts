'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback values prevent @supabase/ssr from throwing during static prerender
  // at build time. Real env vars are always present at runtime.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  )
}
