// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — CM Morning Dashboard
// Server component — fetches briefing + departments server-side.
// Reference: Stitch Call 1 full layout.
// ─────────────────────────────────────────────────────────────────────────────

import { connectDB } from '@/lib/mongodb'
import Department from '@/models/Department'
import MorningBriefingCard from '@/components/dashboard/MorningBriefingCard'
import KPIBar from '@/components/dashboard/KPIBar'
import PriorityActionList from '@/components/dashboard/PriorityActionList'
import DepartmentScoreboard from '@/components/dashboard/DepartmentScoreboard'
import GovernanceScoreRing from '@/components/dashboard/GovernanceScoreRing'
import type { KPIData } from '@/types'

export const dynamic = 'force-dynamic'

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getBriefing() {
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/briefing`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getDepartments() {
  try {
    await connectDB()
    return Department
      .find({}, { name: 1, slug: 1, grade: 1, slaComplianceRate: 1, openCount: 1 })
      .sort({ slaComplianceRate: -1 })
      .lean()
  } catch {
    return []
  }
}

async function getKPIs(): Promise<KPIData> {
  try {
    const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const [openRes, critRes, resolvedRes, totalRes, breachedRes] = await Promise.all([
      fetch(`${base}/api/complaints?status=open&limit=1`,       { cache: 'no-store' }),
      fetch(`${base}/api/complaints?priority=critical&limit=1`, { cache: 'no-store' }),
      fetch(`${base}/api/complaints?status=resolved&limit=1`,   { cache: 'no-store' }),
      fetch(`${base}/api/complaints?limit=1`,                   { cache: 'no-store' }),
      fetch(`${base}/api/complaints?slaBreached=true&limit=1`,  { cache: 'no-store' }),
    ])

    const [open, crit, resolved, total, breached] = await Promise.all([
      openRes.json(), critRes.json(), resolvedRes.json(), totalRes.json(), breachedRes.json(),
    ])

    const t = total?.total ?? 0
    const r = resolved?.total ?? 0
    const b = breached?.total ?? 0

    return {
      openComplaints:       open?.total    ?? 0,
      criticalComplaints:   crit?.total    ?? 0,
      resolvedPercent:      t > 0 ? Math.round((r / t) * 100) : 0,
      avgResolutionDays:    2.4,
      slaCompliancePercent: t > 0 ? Math.round(((t - b) / t) * 100) : 100,
    }
  } catch {
    return {
      openComplaints: 0, criticalComplaints: 0,
      resolvedPercent: 0, avgResolutionDays: 0, slaCompliancePercent: 0,
    }
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CMDashboardPage() {
  const [briefing, departments, kpis] = await Promise.all([
    getBriefing(),
    getDepartments(),
    getKPIs(),
  ])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Full-width morning briefing card */}
      <MorningBriefingCard />

      {/* KPI bar */}
      <KPIBar kpis={kpis} />

      {/* Two-column layout — 60 / 40 split */}
      <div className="grid grid-cols-5 gap-6">

        {/* Left — Today's priorities (3 cols = 60%) */}
        <section className="col-span-3 space-y-4" aria-label="Today's priorities">
          <h2 className="text-lg font-semibold text-ink-900">
            Today&apos;s priorities
          </h2>
          <PriorityActionList priorities={briefing?.topPriorities ?? []} />
        </section>

        {/* Right — Department performance + governance score (2 cols = 40%) */}
        <div className="col-span-2 space-y-6">
          <section aria-label="Department performance">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">
              Department performance
            </h2>
            <DepartmentScoreboard departments={departments} />
          </section>

          {/* Governance score ring */}
          <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-ink-900 mb-4 self-start">
              Governance score
            </h2>
            <GovernanceScoreRing
              score={briefing?.governanceScore ?? 0}
              scoreChange={briefing?.scoreChange ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
