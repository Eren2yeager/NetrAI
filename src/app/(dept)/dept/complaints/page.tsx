// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Complaints Page
// Full complaint queue with status filters and SLA countdown badges.
// ─────────────────────────────────────────────────────────────────────────────

import ComplaintTable from '@/components/complaints/ComplaintTable'

export default function DeptComplaintsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1
          className="text-3xl text-ink-900"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          Complaint Queue
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          All complaints assigned to your department. Filter by status to focus your work.
        </p>
      </div>

      <ComplaintTable />
    </div>
  )
}
