// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Root Page
// Authenticated users → redirect to their dashboard.
// Unauthenticated users → public landing page.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import LandingPage from '@/components/landing/LandingPage'

export default async function RootPage() {
  const session = await auth()

  // Authenticated — redirect to the correct dashboard
  if (session?.user) {
    if (session.user.role === 'cm') redirect('/cm/dashboard')
    if (
      session.user.role === 'dept_head' ||
      session.user.role === 'field_officer'
    ) {
      redirect('/dept/dashboard')
    }
    redirect('/')
  }

  // Unauthenticated — render the public landing page
  return <LandingPage />
}
