// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Dashboard
// Server component. Shows dept-specific stats + escalated complaints at top.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Department from '@/models/Department'
import Complaint from '@/models/Complaint'
import User from '@/models/User'
import GovernanceScoreRing from '@/components/dashboard/GovernanceScoreRing'
import ComplaintTable from '@/components/complaints/ComplaintTable'
import type { UserRole } from '@/types'

export const dynamic = 'force-dynamic'

async function getDeptData(deptSlug: string) {
  await connectDB()

  const [dept, openCount, escalatedCount, totalCount, breachedCount] = await Promise.all([
    Department.findOne({ slug: deptSlug }).lean(),
    Complaint.countDocuments({ assignedDept: deptSlug, status: { $nin: ['resolved'] } }),
    Complaint.countDocuments({ assignedDept: deptSlug, status: 'escalated' }),
    Complaint.countDocuments({ assignedDept: deptSlug }),
    Complaint.countDocuments({ assignedDept: deptSlug, slaBreached: true }),
  ])

  const slaRate = totalCount > 0
    ? Math.round(((totalCount - breachedCount) / totalCount) * 100)
    : 100

  return { dept, openCount, escalatedCount, slaRate }
}

export default async function DeptDashboardPage() {
  const session = await auth()
  console.log('🔍 Debug Session:', JSON.stringify(session, null, 2))
  if (!session?.user) redirect('/')

  await connectDB()
  const userFromDb = await User.findById(session.user.id).lean()
  console.log('🔍 Debug User from DB:', userFromDb)

  const role    = session.user.role as UserRole
  const deptSlug = userFromDb?.department as string | undefined
  console.log('🔍 Debug deptSlug:', deptSlug, 'Role:', role)

  if (!deptSlug && role === 'dept_head') {
    return (
      <div className="text-sm text-ink-400">
        No department assigned to your account. Contact the administrator.
      </div>
    )
  }

  const slug = deptSlug ?? 'water'
  const { dept, openCount, escalatedCount, slaRate } = await getDeptData(slug)

  const deptName = dept?.name ?? slug

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1
          className="text-2xl text-ink-900"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          {deptName}
        </h1>
        <p className="text-sm text-ink-400 mt-1">Department overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-0 border border-surface-200 rounded-xl p-6">
          <p className={`text-4xl font-bold ${openCount > 50 ? 'text-status-critical' : 'text-ink-900'}`}>
            {openCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-ink-400 mt-2">Open complaints</p>
        </div>

        <div className="bg-surface-0 border border-surface-200 rounded-xl p-6">
          <p className={`text-4xl font-bold ${escalatedCount > 0 ? 'text-status-critical' : 'text-ink-900'}`}>
            {escalatedCount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-ink-400 mt-2">Escalated</p>
        </div>

        <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 flex flex-col items-start">
          <p className={`text-4xl font-bold ${slaRate >= 85 ? 'text-status-success' : slaRate >= 70 ? 'text-status-warning' : 'text-status-critical'}`}>
            {slaRate}%
          </p>
          <p className="text-xs text-ink-400 mt-2">SLA compliance</p>
        </div>
      </div>

      {/* Governance score ring */}
      <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 flex items-center gap-8">
        <GovernanceScoreRing
          score={dept?.slaComplianceRate ?? slaRate}
          scoreChange={0}
          size={120}
          strokeWidth={8}
        />
        <div>
          <h2 className="text-base font-semibold text-ink-900 mb-1">
            Department SLA compliance
          </h2>
          <p className="text-sm text-ink-600">
            Grade: <span className="font-bold text-ink-900">{dept?.grade ?? '—'}</span>
          </p>
          <p className="text-sm text-ink-600">
            Avg resolution: <span className="font-medium text-ink-900">
              {dept?.avgResolutionDays ?? '—'} days
            </span>
          </p>
        </div>
      </div>

      {/* Escalated complaints — highlighted section */}
      {escalatedCount > 0 && (
        <section aria-label="Escalated complaints">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-status-critical" aria-hidden="true" />
            <h2 className="text-base font-semibold text-status-critical">
              Escalated complaints ({escalatedCount})
            </h2>
          </div>
          <ComplaintTable department={slug} escalatedOnly />
        </section>
      )}

      {/* All complaints */}
      <section aria-label="All complaints">
        <h2 className="text-base font-semibold text-ink-900 mb-3">
          All complaints
        </h2>
        <ComplaintTable department={slug} />
      </section>
    </div>
  )
}
