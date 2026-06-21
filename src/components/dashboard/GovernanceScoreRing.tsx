'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Governance Score Ring
// Pure SVG circular progress ring. Animates stroke-dashoffset on mount.
// Color: green >80, amber 60–80, red <60.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { GOVERNANCE_SCORE_THRESHOLDS } from '@/constants'
import { cn } from '@/lib/utils'

interface GovernanceScoreRingProps {
  score: number      // 0–100
  scoreChange: number
  size?: number      // px, default 160
  strokeWidth?: number
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= GOVERNANCE_SCORE_THRESHOLDS.good)    return '#16A34A'  // status-success
  if (score >= GOVERNANCE_SCORE_THRESHOLDS.warning) return '#D97706'  // status-warning
  return '#DC2626'                                                      // status-critical
}

export default function GovernanceScoreRing({
  score,
  scoreChange,
  size        = 160,
  strokeWidth = 10,
  className,
}: GovernanceScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)

  const center     = size / 2
  const radius     = center - strokeWidth - 4
  const circumference = 2 * Math.PI * radius
  const targetDash = (score / 100) * circumference
  const color      = getScoreColor(score)

  // Animate stroke-dashoffset from 0 → target on mount
  useEffect(() => {
    const el = circleRef.current
    if (!el) return

    // Start at empty
    el.style.strokeDashoffset = String(circumference)

    // Trigger animation on next frame
    const raf = requestAnimationFrame(() => {
      el.style.transition   = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.strokeDashoffset = String(circumference - targetDash)
    })

    return () => cancelAnimationFrame(raf)
  }, [score, circumference, targetDash])

  const changeDelta = scoreChange > 0 ? `↑ +${scoreChange}` : scoreChange < 0 ? `↓ ${scoreChange}` : '→ No change'
  const changeColor = scoreChange > 0 ? 'text-status-success' : scoreChange < 0 ? 'text-status-critical' : 'text-ink-400'

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label={`Governance score: ${score} out of 100`}
          role="img"
        >
          {/* Track ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E9ECEF"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring — rotated so it starts at 12 o'clock */}
          <circle
            ref={circleRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-ink-900 leading-none">
            {score}
          </span>
          <span className="text-sm text-ink-400 mt-0.5">/100</span>
        </div>
      </div>

      {/* Delta badge */}
      <p className={cn('text-sm font-medium', changeColor)}>
        {changeDelta} from yesterday
      </p>
    </div>
  )
}
