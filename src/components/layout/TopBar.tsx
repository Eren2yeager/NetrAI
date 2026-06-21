'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Top Bar
// Sits at the top of the main content area (right of sidebar).
// Shows current page title, user name, and logout button.
// ─────────────────────────────────────────────────────────────────────────────

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/cm/dashboard':   'Morning Briefing',
  '/cm/map':         'Hotspot Map',
  '/cm/simulator':   'Policy Simulator',
  '/cm/emergencies': 'Emergency Center',
  '/dept/dashboard': 'Department Overview',
  '/dept/complaints': 'Complaint Queue',
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Prefix match for nested routes (e.g. /cm/map/east-delhi)
  const match = Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key + '/'))
  return match ? PAGE_TITLES[match] : 'NetrAI'
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopBarProps {
  /** Pass from server layout to avoid client-side flash */
  userName?: string
}

export default function TopBar({ userName }: TopBarProps) {
  const pathname          = usePathname()
  const { data: session } = useSession()

  const displayName = userName ?? session?.user?.name ?? 'User'
  const pageTitle   = getPageTitle(pathname)

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface-0 border-b border-surface-200 shrink-0">

      {/* Page title */}
      <h2 className="text-sm font-semibold text-ink-900">
        {pageTitle}
      </h2>

      {/* Right side — user + logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-ink-600 hidden sm:block">
          {displayName}
        </span>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-status-critical transition-colors"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
