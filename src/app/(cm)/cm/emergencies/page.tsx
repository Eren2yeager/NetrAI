'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Emergency Center Page
// Live list of all critical + escalated complaints.
// Shows NoEmergencies illustration when count is zero.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { Siren, RefreshCw } from 'lucide-react'
import NoEmergencies from '@/components/illustrations/NoEmergencies'
import StatusBadge from '@/components/complaints/StatusBadge'
import PriorityBadge from '@/components/complaints/PriorityBadge'
import SLABadge from '@/components/complaints/SLABadge'
import type { IComplaint } from '@/models/Complaint'

export default function EmergenciesPage() {
  const [complaints, setComplaints] = useState<IComplaint[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  async function fetchEmergencies() {
    setLoading(true)
    try {
      const res  = await fetch(
        '/api/complaints?priority=critical&status=escalated&limit=50',
        { cache: 'no-store' }
      )
      // Also fetch open criticals
      const res2 = await fetch(
        '/api/complaints?priority=critical&status=open&limit=50',
        { cache: 'no-store' }
      )
      const [d1, d2] = await Promise.all([res.json(), res2.json()])
      const combined = [...(d1.data ?? []), ...(d2.data ?? [])]
      // Deduplicate by _id
      const seen = new Set<string>()
      const deduped = combined.filter((c: IComplaint) => {
        const id = String(c._id)
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      // Sort by priorityScore desc
      deduped.sort((a: IComplaint, b: IComplaint) => b.priorityScore - a.priorityScore)
      setComplaints(deduped)
      setTotal(deduped.length)
    } catch {
      // show empty state
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    fetchEmergencies()
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchEmergencies, 2 * 60 * 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <Siren className="h-5 w-5 text-status-critical" aria-hidden="true" />
          </div>
          <div>
            <h1
              className="text-2xl text-ink-900"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              Emergency Center
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">
              Last updated {lastRefresh.toLocaleTimeString('en-IN')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchEmergencies}
          disabled={loading}
          aria-label="Refresh emergencies"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-200 text-sm text-ink-600 hover:bg-surface-50 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {/* Count pill */}
      {!loading && total > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" aria-hidden="true" />
          <span className="text-sm font-semibold text-status-critical">
            {total} active emergency{total > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-0 border border-surface-200 rounded-xl p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-200 rounded w-2/3" />
                  <div className="h-3 bg-surface-200 rounded w-1/3" />
                </div>
                <div className="h-6 w-16 bg-surface-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <NoEmergencies className="w-28 h-28 mb-6" />
          <h2 className="text-lg font-semibold text-ink-900 mb-1">
            No active emergencies
          </h2>
          <p className="text-sm text-ink-400">
            Delhi is running smoothly. No critical complaints at this time.
          </p>
        </div>
      )}

      {/* Emergency list */}
      {!loading && total > 0 && (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <div
              key={String(complaint._id)}
              className="bg-surface-0 border border-red-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Priority score badge */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <span className="text-sm font-bold text-status-critical">
                    {complaint.priorityScore}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink-900 leading-snug">
                      {complaint.title}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium shrink-0"
                      style={{ backgroundColor: '#E0E7FF', color: '#1E1B4B' }}
                    >
                      {complaint.district}
                    </span>
                  </div>

                  <p className="text-xs text-ink-600 mt-1 line-clamp-2">
                    {complaint.priorityReason || complaint.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <PriorityBadge priority={complaint.priority} />
                    <StatusBadge   status={complaint.status}     />
                    <SLABadge
                      deadline={complaint.slaDeadline}
                      slaBreached={complaint.slaBreached}
                    />
                    <span className="text-xs text-ink-400">
                      ~{complaint.estimatedCitizensAffected.toLocaleString('en-IN')} affected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
