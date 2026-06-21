'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Morning Briefing Card
// Full-width dark card (#1E1B4B). DM Serif Display greeting.
// Delhi skyline illustration positioned on the right.
// Fetches /api/briefing on mount; shows skeleton while loading.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import DelhiSkyline from '@/components/illustrations/DelhiSkyline'
import type { IBriefing } from '@/models/Briefing'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BriefingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 w-3/4 rounded-lg bg-white/10" />
      <div className="h-4 w-40 rounded bg-white/10" />
      <div className="h-4 w-2/3 rounded bg-white/10" />
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MorningBriefingCard() {
  const [briefing,   setBriefing]   = useState<IBriefing | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // Tracks whether the summary has been revealed yet — resets on refresh
  const [revealed,   setRevealed]   = useState(false)

  async function fetchBriefing(refresh = false) {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const url = refresh ? '/api/briefing?refresh=1' : '/api/briefing'
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBriefing(data)
        // Trigger text reveal animation on every fresh load / regenerate
        setRevealed(false)
        requestAnimationFrame(() => setRevealed(true))
      }
    } catch {
      // Silently degrade — card shows partial content
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchBriefing() }, [])

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1E1B4B', minHeight: '160px' }}
    >
      {/* Content */}
      <div className="relative z-10 p-8 pr-[280px]">
        {loading ? (
          <BriefingSkeleton />
        ) : (
          <div className="space-y-2">
            {/* Greeting */}
            <h1
              className="text-white leading-tight"
              style={{
                fontFamily: 'var(--font-dm-serif)',
                fontSize:   'clamp(28px, 3vw, 44px)',
              }}
            >
              {getGreeting()}, Hon&apos;ble CM
            </h1>

            {/* Date */}
            <p style={{ color: '#C3C0FF', fontSize: '14px' }}>
              {formatDate()}
            </p>

            {/* AI summary — Framer Motion text reveal on load */}
            {briefing?.summary && (
              <AnimatePresence mode="wait">
                {revealed && (
                  <motion.p
                    key={briefing.summary}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                    className="leading-relaxed"
                    style={{ color: '#E0E7FF', fontSize: '14px', maxWidth: '520px' }}
                  >
                    {briefing.summary}
                  </motion.p>
                )}
              </AnimatePresence>
            )}

            {/* Regenerate button — for demo */}
            <button
              type="button"
              onClick={() => fetchBriefing(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ color: '#C3C0FF' }}
              aria-label="Regenerate briefing"
            >
              <RefreshCw
                className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {refreshing ? 'Regenerating…' : 'Regenerate briefing'}
            </button>
          </div>
        )}
      </div>

      {/* Delhi skyline illustration — right side */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{ width: '260px', opacity: 0.85 }}
        aria-hidden="true"
      >
        <DelhiSkyline className="w-full h-auto" />
      </div>
    </div>
  )
}
