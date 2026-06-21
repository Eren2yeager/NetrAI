// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — CM Shell Layout
// Server component — reads session on the server for fast first paint.
// Composes: SmartNavbar + EmergencyBanner + page content + inline AI panel.
// Redirects to /login if session is missing (middleware is the first guard,
// this is a second safety net at the layout level).
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SessionProvider } from 'next-auth/react'
import CMLayoutClient from './CMLayoutClient'

export default async function CMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Double-check auth at layout level
  if (!session?.user) redirect('/')
  if (session.user.role !== 'cm') redirect('/dept/dashboard')

  return (
    <SessionProvider session={session}>
      <CMLayoutClient userName={session.user.name ?? undefined}>
        {children}
      </CMLayoutClient>
    </SessionProvider>
  )
}
