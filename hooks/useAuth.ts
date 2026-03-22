'use client'

import { useSession, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user ?? null
  const loading = status === 'loading'
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return { user, loading, isAdmin, signOut: handleSignOut }
}
