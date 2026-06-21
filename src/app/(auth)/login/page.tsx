'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Login Page
// Public route. Centered card on surface-50.
// Two demo login buttons for fast access during presentation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DEMO_USERS } from '@/constants'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null)

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password.')
        return
      }

      redirectByRole()
    })
  }

  async function handleDemoLogin(role: 'cm' | 'dept_head') {
    setError(null)
    setLoadingDemo(role)

    const user = DEMO_USERS.find((u) => u.role === role)
    if (!user) return

    const result = await signIn('credentials', {
      email:    user.email,
      password: user.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Demo login failed. Please check your seed data.')
      setLoadingDemo(null)
      return
    }

    redirectByRole(role)
  }

  function redirectByRole(role?: string) {
    // After sign-in, Next-Auth session update is async — push to correct dash
    if (role === 'dept_head') {
      router.push('/dept/dashboard')
    } else {
      router.push('/cm/dashboard')
    }
    router.refresh()
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl text-ink-900 mb-1"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            NetrAI
          </h1>
          <p className="text-sm text-ink-400 tracking-widest uppercase">
            See. Decide. Act.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-surface-0 border border-surface-200 rounded-xl p-8 shadow-sm">

          <h2 className="text-lg font-semibold text-ink-900 mb-6">
            Sign in to your account
          </h2>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-status-critical">
              {error}
            </div>
          )}

          {/* Credentials form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-600 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@netraai.gov.in"
                className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-600 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-ink-400">or try a demo account</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          {/* Demo login buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('cm')}
              disabled={loadingDemo !== null}
              className="w-full h-11 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-50 text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingDemo === 'cm'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : null
              }
              Login as Chief Minister
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('dept_head')}
              disabled={loadingDemo !== null}
              className="w-full h-11 rounded-lg border border-surface-200 text-ink-600 hover:bg-surface-50 text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingDemo === 'dept_head'
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : null
              }
              Login as Dept Head
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-ink-400 mt-6">
          A project by Team Sanganak
        </p>
      </div>
    </main>
  )
}
