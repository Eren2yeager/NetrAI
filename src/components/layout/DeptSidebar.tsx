'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Sidebar
// 240px fixed left sidebar for the Department Head / Field Officer shell.
// Same design language as CMSidebar — active item 4px left border + tint.
// Shows the user's department name in the footer badge.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useRef, useCallback } from 'react'
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEPARTMENTS } from '@/constants'
import AssistantPanel from '@/components/assistant/AssistantPanel'
import SahayChat      from '@/components/assistant/SahayChat'
import MargChat       from '@/components/assistant/MargChat'
import type { AssistantPersona } from '@/components/assistant/AssistantPanel'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/dept/dashboard',
    icon:  LayoutDashboard,
  },
  {
    label: 'Complaints',
    href:  '/dept/complaints',
    icon:  ClipboardList,
  },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function DeptSidebar() {
  const pathname    = usePathname()
  const { data: session } = useSession()
  const [panelOpen, setPanelOpen] = useState(false)
  const sendRef = useRef<((t: string) => void) | null>(null)
  const handlePill = useCallback((text: string) => { sendRef.current?.(text) }, [])

  // Resolve department display name from the user's dept slug
  const deptSlug = (session?.user as any)?.department as string | undefined
  const deptName = DEPARTMENTS.find((d) => d.slug === deptSlug)?.name ?? 'Department'

  const role     = (session?.user as any)?.role as string | undefined
  const persona: AssistantPersona = role === 'field_officer' ? 'marg' : 'sahay'
  const btnLabel  = persona === 'marg' ? 'Ask MARG' : 'Ask SAHAY'
  const btnColor  = persona === 'marg' ? '#D97706' : '#0D9488'

  // Role label for the footer badge
  const roleLabel = role === 'field_officer'
    ? 'Field Officer'
    : 'Dept Head'

  // Abbreviation for the avatar chip (e.g. "DH", "FO")
  const roleAbbr = roleLabel === 'Field Officer' ? 'FO' : 'DH'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface-0 border-r border-surface-200 flex flex-col z-30">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-200 shrink-0">
        <span
          className="text-2xl text-ink-900 select-none"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          NetrAI
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Department navigation">
        <ul role="list" className="space-y-0.5 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-ink-600 hover:bg-surface-50 hover:text-ink-900'
                  )}
                >
                  {/* Active indicator — 4px left border pill */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-500"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-brand-500' : 'text-ink-400'
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer — role + department badge */}
      <div className="px-6 py-4 border-t border-surface-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-600">{roleAbbr}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-900 truncate">{roleLabel}</p>
            <p className="text-xs text-ink-400 truncate">{deptName}</p>
          </div>
        </div>
      </div>

      {/* Ask AI floating button */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label={`Open ${btnLabel} AI assistant`}
        className="fixed bottom-6 left-[268px] flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg z-40 transition-all hover:opacity-90 hover:scale-105"
        style={{ backgroundColor: btnColor }}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {btnLabel}
      </button>

      {/* Assistant panel */}
      <AssistantPanel
        persona={persona}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onPillClick={handlePill}
      >
        {persona === 'marg'
          ? <MargChat  onSendRef={(fn) => { sendRef.current = fn }} />
          : <SahayChat onSendRef={(fn) => { sendRef.current = fn }} />
        }
      </AssistantPanel>
    </aside>
  )
}
