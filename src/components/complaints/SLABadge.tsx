'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — SLA Badge
// Real-time countdown pill. Updates every minute via setInterval.
// ok → green · warning (< 3h) → amber pulse · breached → red
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { getSLAStatus, formatSLARemaining } from '@/lib/sla'

interface SLABadgeProps {
  deadline:   Date | string
  slaBreached?: boolean   // use pre-computed value if available
}

export default function SLABadge({ deadline, slaBreached }: SLABadgeProps) {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline

  const [status,    setStatus]    = useState(() => getSLAStatus(deadlineDate))
  const [remaining, setRemaining] = useState(() => formatSLARemaining(deadlineDate))

  useEffect(() => {
    // Update immediately then every 60 seconds
    function tick() {
      setStatus(getSLAStatus(deadlineDate))
      setRemaining(formatSLARemaining(deadlineDate))
    }

    tick()
    const interval = setInterval(tick, 60_000)
    return () => clearInterval(interval)
  }, [deadlineDate])

  // Use pre-computed breached flag if available (avoids client/server mismatch)
  const effectiveStatus = slaBreached ? 'breached' : status

  if (effectiveStatus === 'breached') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-status-critical border border-red-200"
        aria-label="SLA breached"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-status-critical shrink-0" aria-hidden="true" />
        Breached
      </span>
    )
  }

  if (effectiveStatus === 'warning') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-status-warning border border-amber-200 animate-pulse"
        aria-label={`SLA warning: ${remaining} remaining`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-status-warning shrink-0" aria-hidden="true" />
        {remaining}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-status-success border border-green-200"
      aria-label={`SLA ok: ${remaining} remaining`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" aria-hidden="true" />
      {remaining}
    </span>
  )
}
