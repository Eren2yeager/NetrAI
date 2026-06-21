'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Emergency Banner
// Sticky banner below the TopBar. Hidden by default.
// Appears automatically when there are active critical complaints.
// Fetches the count client-side so it stays live without a full page refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Siren, X, ArrowRight } from 'lucide-react'

interface EmergencyCount {
  count: number
  topDistrict: string | null
}

export default function EmergencyBanner() {
  const [data,      setData]      = useState<EmergencyCount | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchCritical() {
      try {
        const res = await fetch(
          '/api/complaints?priority=critical&status=open&limit=1',
          { cache: 'no-store' }
        )
        if (!res.ok || cancelled) return

        const json = await res.json()
        // API returns { data: [], total: number }
        if (!cancelled) {
          setData({
            count:       json.total ?? 0,
            topDistrict: json.data?.[0]?.district ?? null,
          })
        }
      } catch {
        // Silently ignore — banner is non-critical UI
      }
    }

    fetchCritical()

    // Re-check every 60 seconds
    const interval = setInterval(fetchCritical, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Hide if no critical complaints or user dismissed
  if (!data || data.count === 0 || dismissed) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-3 px-6 py-2.5 bg-status-critical text-white text-sm"
    >
      {/* Icon */}
      <Siren className="h-4 w-4 shrink-0 animate-pulse" aria-hidden="true" />

      {/* Message */}
      <p className="flex-1 font-medium">
        {data.count} critical complaint{data.count > 1 ? 's' : ''} require
        immediate attention
        {data.topDistrict ? (
          <span className="font-normal opacity-90">
            {' '}— top district: {data.topDistrict}
          </span>
        ) : null}
      </p>

      {/* CTA */}
      <Link
        href="/cm/emergencies"
        className="flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0"
      >
        View all
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss emergency banner"
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
