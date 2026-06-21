// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Status Badge
// Pill badge for complaint status. Server-safe (no client hooks).
// ─────────────────────────────────────────────────────────────────────────────

import type { ComplaintStatus } from '@/types'

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  open:        { label: 'Open',        className: 'bg-blue-50   text-status-info     border border-blue-200'   },
  assigned:    { label: 'Assigned',    className: 'bg-purple-50 text-purple-600      border border-purple-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50  text-status-warning  border border-amber-200'  },
  resolved:    { label: 'Resolved',    className: 'bg-green-50  text-status-success  border border-green-200'  },
  escalated:   { label: 'Escalated',   className: 'bg-red-50    text-status-critical border border-red-200'    },
}

interface StatusBadgeProps {
  status: ComplaintStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.open

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
