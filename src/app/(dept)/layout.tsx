// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Shell Layout
// Server component — reads session on the server for fast first paint.
// Composes: SmartNavbar + page content + inline AI panel.
// No EmergencyBanner — that's CM-only.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SessionProvider } from 'next-auth/react'
import DeptLayoutClient from './DeptLayoutClient'

export default async function DeptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Double-check auth at layout level
  if (!session?.user) redirect('/')
  if (session.user.role !== 'dept_head' && session.user.role !== 'field_officer') {
    redirect('/cm/dashboard')
  }

  return (
    <SessionProvider session={session}>
      <DeptLayoutClient
        role={session.user.role as 'dept_head' | 'field_officer'}
        userName={session.user.name ?? undefined}
      >
        {children}
      </DeptLayoutClient>
    </SessionProvider>
  )
}
