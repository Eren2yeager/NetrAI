// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Cluster Card
// "1 incident, N citizens" merged view for duplicate complaint groups.
// Shows the cluster title, complaint count, district, and status.
// ─────────────────────────────────────────────────────────────────────────────

import { Users, GitMerge } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { ICluster } from '@/models/Cluster'
import { COMPLAINT_CATEGORIES } from '@/constants'

interface ClusterCardProps {
  cluster: Pick<ICluster,
    'title' | 'complaintIds' | 'district' | 'category' |
    'totalCitizensAffected' | 'status' | 'createdAt'
  >
}

export default function ClusterCard({ cluster }: ClusterCardProps) {
  const categoryLabel =
    COMPLAINT_CATEGORIES.find((c) => c.value === cluster.category)?.label ?? cluster.category

  return (
    <div className="bg-surface-0 border border-brand-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">

        {/* Cluster icon */}
        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
          <GitMerge className="h-4 w-4 text-brand-500" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-semibold text-ink-900 leading-snug">
            {cluster.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Complaint count badge */}
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
              {cluster.complaintIds.length} complaint{cluster.complaintIds.length > 1 ? 's' : ''}
            </span>

            {/* District pill */}
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: '#E0E7FF', color: '#1E1B4B' }}
            >
              {cluster.district}
            </span>

            {/* Category */}
            <span className="text-xs text-ink-400">{categoryLabel}</span>
          </div>

          {/* Citizens + status */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-ink-400">
              <Users className="h-3 w-3" aria-hidden="true" />
              ~{cluster.totalCitizensAffected.toLocaleString('en-IN')} citizens affected
            </div>
            <StatusBadge status={cluster.status} />
          </div>
        </div>
      </div>
    </div>
  )
}
