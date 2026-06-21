'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Complaint Table
// Paginated, filterable complaint table for the department view.
// Supports status filter + live SLA countdown badges.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import PriorityScoreBar from './PriorityScoreBar'
import SLABadge from './SLABadge'
import type { IComplaint } from '@/models/Complaint'
import type { ComplaintStatus } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants'

// ── Filter bar ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All statuses'  },
  { value: 'open',        label: 'Open'          },
  { value: 'assigned',    label: 'Assigned'      },
  { value: 'in_progress', label: 'In Progress'   },
  { value: 'escalated',   label: 'Escalated'     },
  { value: 'resolved',    label: 'Resolved'      },
]

interface ComplaintTableProps {
  /** Pre-filter by department — passed from dept dashboard */
  department?: string
  /** Show only escalated complaints — for the escalation section */
  escalatedOnly?: boolean
}

export default function ComplaintTable({
  department,
  escalatedOnly = false,
}: ComplaintTableProps) {
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>(
    escalatedOnly ? 'escalated' : 'all'
  )
  const [loading, setLoading] = useState(true)

  const pageCount = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page',  String(page))
      params.set('limit', String(DEFAULT_PAGE_SIZE))
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (escalatedOnly)          params.set('status', 'escalated')

      const res  = await fetch(`/api/complaints?${params}`, { cache: 'no-store' })
      const data = await res.json()
      setComplaints(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch {
      // table shows empty state
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, escalatedOnly, department])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [statusFilter])

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      {!escalatedOnly && (
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === value
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-0 border border-surface-200 text-ink-600 hover:border-brand-200 hover:text-brand-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-4 space-y-3">
            <div className="h-5 bg-surface-0 rounded flex-1" />
            {[1, 2, 3, 4, 5 ,6,7,8,9,10].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 bg-surface-200 rounded flex-1" />
                <div className="h-12 bg-surface-200 rounded w-20" />
                <div className="h-12 bg-surface-200 rounded w-16" />
                <div className="h-12 bg-surface-200 rounded w-16" />
                <div className="h-12 bg-surface-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-ink-400">No complaints found.</p>
          </div>
        ) : (
          <table className="w-full text-sm" aria-label="Complaints">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  District
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  Priority
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  AI Score
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
                  SLA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {complaints.map((complaint) => (
                <tr
                  key={String(complaint._id)}
                  className={`hover:bg-surface-50 transition-colors ${
                    complaint.priority === 'critical' ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 truncate max-w-xs">
                      {complaint.title}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 font-mono">
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-ink-600 whitespace-nowrap">
                    {complaint.district}
                  </td>
                  <td className="px-3 py-3">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-3 py-3">
                    <PriorityScoreBar
                      score={complaint.priorityScore ?? 50}
                      reason={complaint.priorityReason}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SLABadge
                      deadline={complaint.slaDeadline}
                      slaBreached={complaint.slaBreached}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            Showing {((page - 1) * DEFAULT_PAGE_SIZE) + 1}–{Math.min(page * DEFAULT_PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-surface-200 text-ink-400 hover:text-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="px-3 text-xs text-ink-600">
              {page} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-surface-200 text-ink-400 hover:text-ink-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
