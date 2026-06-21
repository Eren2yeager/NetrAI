'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Priority Action List
// Ordered list of top 5 AI-generated priorities with expandable details.
// Reference: Stitch Call 1 — numbered badge, district pill, recommended action.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'
import type { BriefingPriority } from '@/types'

interface PriorityActionListProps {
  priorities: BriefingPriority[]
}

function PriorityItem({
  item,
  index,
}: {
  item: BriefingPriority
  index: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
          style={{ backgroundColor: '#4F46E5' }}
          aria-hidden="true"
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title */}
            <p className="text-sm font-semibold text-ink-900 leading-snug">
              {item.title}
            </p>

            {/* District tag pill */}
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded"
              style={{
                backgroundColor: '#E0E7FF',
                color:           '#1E1B4B',
                borderRadius:    '4px',
              }}
            >
              {item.district}
            </span>
          </div>

          {/* Recommended action */}
          <p className="text-xs text-ink-600 mt-1 leading-relaxed">
            {item.recommendedAction}
          </p>

          {/* Citizens affected */}
          <div className="flex items-center gap-1 mt-1.5">
            <Users className="h-3 w-3 text-ink-400" aria-hidden="true" />
            <span className="text-xs text-ink-400">
              {item.affectedCount.toLocaleString('en-IN')} citizens affected
            </span>
          </div>

          {/* Expandable description */}
          {expanded && item.description && (
            <p className="text-xs text-ink-600 mt-2 pt-2 border-t border-surface-200 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
          className="flex-shrink-0 text-ink-400 hover:text-ink-600 transition-colors"
        >
          {expanded
            ? <ChevronUp  className="h-4 w-4" aria-hidden="true" />
            : <ChevronDown className="h-4 w-4" aria-hidden="true" />
          }
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PriorityListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-surface-0 border border-surface-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-surface-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-200 rounded w-3/4" />
              <div className="h-3 bg-surface-200 rounded w-1/2" />
              <div className="h-3 bg-surface-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PriorityActionList({
  priorities,
}: PriorityActionListProps) {
  if (!priorities || priorities.length === 0) {
    return <PriorityListSkeleton />
  }

  return (
    <div className="space-y-3">
      {priorities.map((item, i) => (
        <PriorityItem key={i} item={item} index={i} />
      ))}
    </div>
  )
}
