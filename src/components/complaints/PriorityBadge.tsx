// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Priority Badge
// Pill badge for complaint priority. Server-safe.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComplaintPriority } from '@/types'

const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; className: string }
> = {
  critical: { label: 'Critical', className: 'bg-red-50    text-status-critical border border-red-200'    },
  high:     { label: 'High',     className: 'bg-orange-50 text-orange-600      border border-orange-200' },
  medium:   { label: 'Medium',   className: 'bg-amber-50  text-status-warning  border border-amber-200'  },
  low:      { label: 'Low',      className: 'bg-surface-100 text-ink-400       border border-surface-200' },
}

interface PriorityBadgeProps {
  priority: ComplaintPriority
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
