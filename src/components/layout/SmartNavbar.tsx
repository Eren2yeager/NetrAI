'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Smart Navbar
// Reusable top navigation bar that replaces the sidebars for both CM and Dept.
// Features:
// - Logo
// - Navigation links with active states
// - AI Assistant button (role-specific)
// - User profile with sign out
// - Meeting Mode toggle for CM
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard,
  Map,
  FlaskConical,
  Siren,
  Sparkles,
  Presentation,
  LogOut,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEPARTMENTS } from '@/constants'
import { useMeetingMode } from './CMMeetingShell'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import AILogo from '@/components/icons/AILogo'

// ── Nav items per role ────────────────────────────────────────────────────────

const CM_NAV_ITEMS = [
  { label: 'Dashboard', href: '/cm/dashboard', icon: LayoutDashboard },
  { label: 'Map', href: '/cm/map', icon: Map },
  { label: 'Simulator', href: '/cm/simulator', icon: FlaskConical },
  { label: 'Emergencies', href: '/cm/emergencies', icon: Siren },
] as const

const DEPT_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dept/dashboard', icon: LayoutDashboard },
  { label: 'Complaints', href: '/dept/complaints', icon: ClipboardList },
] as const

// ── Component Props ────────────────────────────────────────────────────────────

interface SmartNavbarProps {
  /** Current user role to determine which nav items to show */
  role: 'cm' | 'dept_head' | 'field_officer'
  /** User name from session for display */
  userName?: string
  /** Callback to toggle the AI assistant panel */
  onToggleAssistant: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SmartNavbar({ role, userName, onToggleAssistant }: SmartNavbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { meetingMode, toggleMeeting } = useMeetingMode()

  const displayName = userName ?? session?.user?.name ?? 'User'
  const navItems = role === 'cm' ? CM_NAV_ITEMS : DEPT_NAV_ITEMS

  // Resolve assistant button config
  let btnLabel = 'Ask NETRA'
  let btnColor = '#4F46E5'

  if (role === 'dept_head') {
    btnLabel = 'Ask SAHAY'
    btnColor = '#0D9488'
  } else if (role === 'field_officer') {
    btnLabel = 'Ask MARG'
    btnColor = '#D97706'
  }

  // Resolve dept name for dept users
  const deptSlug = (session?.user as any)?.department as string | undefined
  const deptName = DEPARTMENTS.find((d) => d.slug === deptSlug)?.name ?? 'Department'

  const roleLabel = role === 'cm' 
    ? 'Chief Minister' 
    : role === 'dept_head' 
      ? 'Dept Head' 
      : 'Field Officer'
  
  const roleAbbr = role === 'cm' 
    ? 'CM' 
    : role === 'dept_head' 
      ? 'DH' 
      : 'FO'

  async function handleSignOut() {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 bg-surface-0 border-b border-surface-200 shrink-0 sticky top-0 z-40">
        
        {/* Left section: Logo + Nav (desktop) */}
        <div className="flex items-center gap-8">
          <Link href={'/'} className="flex items-center gap-2">
            <AILogo type="netra" size={36} />
            <span
              className="text-2xl text-ink-900 select-none"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              NetrAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-ink-600 hover:bg-surface-50 hover:text-ink-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-brand-500' : 'text-ink-400'
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right section: Controls + User */}
        <div className="flex items-center gap-4">
          {/* Meeting Mode Toggle (CM only) */}
          {role === 'cm' && !meetingMode && (
            <button
              type="button"
              onClick={toggleMeeting}
              aria-label="Enter Meeting Mode"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink-600 hover:bg-surface-50 hover:text-ink-900 border border-surface-200 transition-colors"
            >
              <Presentation className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              Meeting Mode
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={onToggleAssistant}
            aria-label={`Toggle ${btnLabel} AI assistant`}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: btnColor }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{btnLabel}</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-brand-100 hover:bg-brand-200 transition-colors flex items-center justify-center"
                  aria-label="User menu"
                >
                  <span className="text-xs font-semibold text-brand-600">{roleAbbr}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-brand-600">{roleAbbr}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-ink-900">{displayName}</p>
                      <p className="text-xs text-ink-400">{roleLabel}</p>
                      <p className="text-xs text-ink-400">
                        {role === 'cm' ? 'Delhi Government' : deptName}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-surface-200 pt-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-status-critical hover:text-status-critical hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="md:hidden p-2 text-ink-600 hover:bg-surface-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-0 border-b border-surface-200">
          <nav className="px-6 py-4 space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-100 text-brand-600'
                      : 'text-ink-600 hover:bg-surface-50 hover:text-ink-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-brand-500' : 'text-ink-400'
                    )}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              )
            })}
            {role === 'cm' && !meetingMode && (
              <button
                type="button"
                onClick={() => {
                  toggleMeeting()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-600 hover:bg-surface-50 hover:text-ink-900 border border-surface-200 transition-colors"
              >
                <Presentation className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                Meeting Mode
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
