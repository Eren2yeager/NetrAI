'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — CM Sidebar
// 240px fixed left sidebar for the Chief Minister shell.
// Design: Stitch Call 1 — active item 4px left border #4F46E5 + #E0E7FF tint.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useCallback } from 'react'
import {
  LayoutDashboard,
  Map,
  FlaskConical,
  Siren,
  Sparkles,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AssistantPanel from '@/components/assistant/AssistantPanel'
import NetraChat      from '@/components/assistant/NetraChat'
import { useMeetingMode } from './CMMeetingShell'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/cm/dashboard',
    icon:  LayoutDashboard,
  },
  {
    label: 'Map',
    href:  '/cm/map',
    icon:  Map,
  },
  {
    label: 'Simulator',
    href:  '/cm/simulator',
    icon:  FlaskConical,
  },
  {
    label: 'Emergencies',
    href:  '/cm/emergencies',
    icon:  Siren,
  },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function CMSidebar() {
  const pathname = usePathname()
  const [panelOpen, setPanelOpen] = useState(false)
  const sendRef = useRef<((t: string) => void) | null>(null)
  const handlePill = useCallback((text: string) => { sendRef.current?.(text) }, [])
  const { toggleMeeting } = useMeetingMode()

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
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="CM navigation">
        <ul role="list" className="space-y-0.5 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    // Base styles
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                    // Active state — Stitch Call 1: #E0E7FF tint + #4F46E5 left border
                    isActive
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-ink-600 hover:bg-surface-50 hover:text-ink-900'
                  )}
                >
                  {/* Active indicator — 4px left border */}
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

      {/* Footer — role badge */}
      <div className="px-6 py-4 border-t border-surface-200 shrink-0 space-y-3">
        {/* Meeting Mode toggle */}
        <button
          type="button"
          onClick={toggleMeeting}
          aria-label="Enter Meeting Mode — hides sidebar for full-screen view"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink-600 hover:bg-surface-50 hover:text-ink-900 border border-surface-200 transition-colors"
        >
          <Presentation className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          Meeting Mode
        </button>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-600">CM</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-900 truncate">Chief Minister</p>
            <p className="text-xs text-ink-400 truncate">Delhi Government</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label="Open NETRA AI assistant"
        className="fixed bottom-6 left-[268px] flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg z-40 transition-all hover:opacity-90 hover:scale-105"
        style={{ backgroundColor: '#4F46E5' }}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Ask NETRA
      </button>

      {/* Assistant panel */}
      <AssistantPanel
        persona="netra"
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onPillClick={handlePill}
      >
        <NetraChat onSendRef={(fn) => { sendRef.current = fn }} />
      </AssistantPanel>
    </aside>
  )
}
