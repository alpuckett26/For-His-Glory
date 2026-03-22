'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const params = use(searchParams)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signin') {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.error) throw new Error('Invalid email or password')
        toast.success('Welcome back!')
        router.push(params.redirect ?? '/account')
        router.refresh()
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Registration failed')
        toast.success('Account created! Signing you in...')
        const result = await signIn('credentials', { email, password, redirect: false })
        if (!result?.error) {
          router.push('/account')
          router.refresh()
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl text-charcoal">
            For His Glory
          </Link>
          <h1 className="font-display text-3xl text-charcoal mt-4 mb-1">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="font-body text-sm text-charcoal/60">
            {mode === 'signin'
              ? 'Sign in to your account'
              : 'Join the For His Glory community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-charcoal/20 font-body text-sm focus:outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold text-white font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <p className="font-body text-sm text-center text-charcoal/60 mt-6">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
              >
                Sign In
              </button>
            </>
          )}
        </p>

        <p className="font-body text-xs text-charcoal/40 text-center mt-4">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-charcoal transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-charcoal transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
