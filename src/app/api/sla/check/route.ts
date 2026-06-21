// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/sla/check
// GET — cron endpoint, runs hourly via Vercel cron (see vercel.json).
// Finds all unresolved complaints past their SLA deadline and marks them
// as breached. Also updates department slaComplianceRate.
// Protected by CRON_SECRET header to prevent public invocation.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import Department from '@/models/Department'
import { CRON_SECRET_HEADER } from '@/constants'
import type { ApiError } from '@/types'

export async function GET(req: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const secret = req.headers.get(CRON_SECRET_HEADER)
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorised' } satisfies ApiError,
      { status: 401 }
    )
  }

  try {
    await connectDB()

    const now = new Date()

    // Find all unresolved complaints that have passed their SLA deadline
    // and haven't been flagged yet
    const breached = await Complaint.find({
      slaDeadline: { $lt: now },
      slaBreached: false,
      status:      { $nin: ['resolved'] },
    }).select('_id assignedDept status timeline')

    if (breached.length === 0) {
      return NextResponse.json({ message: 'No new SLA breaches found.', count: 0 })
    }

    // Bulk update — mark all as breached and push escalation timeline entry
    const ids = breached.map((c) => c._id)

    await Complaint.updateMany(
      { _id: { $in: ids } },
      {
        $set:  { slaBreached: true, status: 'escalated' },
        $push: {
          timeline: {
            status:    'escalated',
            timestamp: now,
            note:      'SLA deadline exceeded — auto-escalated by system.',
          },
        },
      }
    )

    // ── Update department SLA compliance rates ────────────────────────────────

    // Get all departments that had breaches
    const affectedDepts = [...new Set(
      breached.map((c) => c.assignedDept).filter(Boolean)
    )]

    await Promise.all(
      affectedDepts.map(async (deptSlug) => {
        if (!deptSlug) return

        const [total, breachedCount] = await Promise.all([
          Complaint.countDocuments({ assignedDept: deptSlug }),
          Complaint.countDocuments({ assignedDept: deptSlug, slaBreached: true }),
        ])

        const slaComplianceRate = total > 0
          ? Math.round(((total - breachedCount) / total) * 100)
          : 100

        await Department.updateOne(
          { slug: deptSlug },
          { $set: { slaComplianceRate, lastUpdated: now } }
        )
      })
    )

    console.log(`[SLA Check] Marked ${breached.length} complaints as breached.`)

    return NextResponse.json({
      message: `${breached.length} complaint(s) marked as SLA breached.`,
      count:   breached.length,
      ids:     ids.map(String),
    })
  } catch (err) {
    console.error('[GET /api/sla/check]', err)
    return NextResponse.json(
      { error: 'SLA check failed' } satisfies ApiError,
      { status: 500 }
    )
  }
}
