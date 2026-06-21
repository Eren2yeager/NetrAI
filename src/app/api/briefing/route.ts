// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/briefing
// GET — returns today's AI-generated morning briefing.
// Checks DB cache first (one briefing per day). If not found, aggregates
// live complaint data, calls Gemini, saves, and returns.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { geminiJSON } from '@/lib/groq'
import Complaint from '@/models/Complaint'
import Briefing from '@/models/Briefing'
import type { AIBriefingInput, BriefingPriority, KPIData, ApiError } from '@/types'
// ── Date helpers ──────────────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

// ── Governance score formula ──────────────────────────────────────────────────
// Simple weighted formula: resolution rate + SLA compliance, penalise criticals

function calcGovernanceScore(
  resolvedPercent: number,
  slaPercent: number,
  criticalCount: number,
  totalOpen: number
): number {
  const criticalPenalty = totalOpen > 0
    ? Math.min(20, Math.round((criticalCount / totalOpen) * 40))
    : 0
  const raw = resolvedPercent * 0.5 + slaPercent * 0.5 - criticalPenalty
  return Math.min(100, Math.max(0, Math.round(raw)))
}

// ── GET /api/briefing ─────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Allow forced regeneration via ?refresh=1 (for demo "Regenerate" button)
  const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1'

  try {
    await connectDB()

    const today = todayKey()

    // ── 1. Check cache ────────────────────────────────────────────────────────
    if (!forceRefresh) {
      const cached = await Briefing.findOne({ date: today }).lean()
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // ── 2. Aggregate live KPIs from complaints ────────────────────────────────
    const [
      totalOpen,
      criticalOpen,
      totalResolved,
      totalAll,
      slaBreachedCount,
    ] = await Promise.all([
      Complaint.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress', 'escalated'] } }),
      Complaint.countDocuments({ priority: 'critical', status: { $ne: 'resolved' } }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ slaBreached: true, status: { $ne: 'resolved' } }),
    ])

    const resolvedPercent = totalAll > 0 ? Math.round((totalResolved / totalAll) * 100) : 0
    const slaCompliance   = totalAll > 0 ? Math.round(((totalAll - slaBreachedCount) / totalAll) * 100) : 100

    // Avg resolution days (only resolved complaints with timestamps)
    const resolvedComplaints = await Complaint.find(
      { status: 'resolved' },
      { createdAt: 1, updatedAt: 1 }
    ).limit(200).lean()

    const avgResolutionDays = resolvedComplaints.length > 0
      ? parseFloat((
          resolvedComplaints.reduce((sum, c) => {
            const ms = new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()
            return sum + ms / (1000 * 60 * 60 * 24)
          }, 0) / resolvedComplaints.length
        ).toFixed(1))
      : 0

    const kpis: KPIData = {
      openComplaints:       totalOpen,
      criticalComplaints:   criticalOpen,
      resolvedPercent,
      avgResolutionDays,
      slaCompliancePercent: slaCompliance,
    }

    // Top district by complaint count
    const districtAgg = await Complaint.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 1 },
    ])
    const topDistrict = districtAgg[0]?._id ?? 'Unknown'

    // Top 5 critical open complaints for priorities
    const criticalComplaints = await Complaint.find(
      { priority: 'critical', status: { $ne: 'resolved' } },
      { title: 1, district: 1, estimatedCitizensAffected: 1, priorityReason: 1, assignedDept: 1 }
    )
      .sort({ priorityScore: -1 })
      .limit(5)
      .lean()

    // SLA breaches per department
    const slaAgg = await Complaint.aggregate([
      { $match: { slaBreached: true, status: { $ne: 'resolved' } } },
      { $group: { _id: '$assignedDept', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 5 },
    ])

    const input: AIBriefingInput = {
      kpis,
      topDistrictByComplaints: topDistrict,
      criticalComplaints: criticalComplaints.map((c) => ({
        title:        c.title,
        district:     c.district,
        affectedCount: c.estimatedCitizensAffected,
      })),
      slaBreaches: slaAgg.map((s) => ({ department: s._id ?? 'Unknown', count: s.count })),
      date: today,
    }

    // ── 3. Call Gemini ────────────────────────────────────────────────────────
    const governanceScore = calcGovernanceScore(
      resolvedPercent,
      slaCompliance,
      criticalOpen,
      totalOpen
    )

    interface GeminiBriefingResponse {
      summary: string
      topPriorities: BriefingPriority[]
    }

    const rawResult = await geminiJSON<GeminiBriefingResponse>(`
You are an AI advisor for the Chief Minister of Delhi. Generate a concise morning briefing.

Today's data (${today}):
- Open complaints: ${input.kpis.openComplaints}
- Critical complaints: ${input.kpis.criticalComplaints}
- Resolved rate: ${input.kpis.resolvedPercent}%
- Avg resolution: ${input.kpis.avgResolutionDays} days
- SLA compliance: ${input.kpis.slaCompliancePercent}%
- Top district by complaints: ${input.topDistrictByComplaints}
- Critical issues: ${JSON.stringify(input.criticalComplaints)}
- SLA breaches by dept: ${JSON.stringify(input.slaBreaches)}

Respond with this exact JSON structure:
{
  "summary": "<one sentence executive summary for the CM, direct and action-oriented, max 20 words>",
  "topPriorities": [
    {
      "title": "<short issue title>",
      "description": "<one sentence describing the problem>",
      "recommendedAction": "<specific action the CM should take>",
      "district": "<district name>",
      "affectedCount": <number of citizens affected>
    }
  ]
}

Include exactly 5 priorities, ordered by urgency. Be specific and directive.
    `.trim(), {
      summary: 'Governance data is being compiled — please check back shortly.',
      topPriorities: [],
    })
console.log('[briefing] typeof rawResult:', typeof rawResult)
console.log('[briefing] rawResult:', JSON.stringify(rawResult, null, 2))
const aiResult = rawResult
    // ── 4. Get yesterday's score for delta ────────────────────────────────────
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const yesterdayBriefing = await Briefing.findOne({ date: yesterdayKey }, { governanceScore: 1 }).lean()
    const scoreChange = yesterdayBriefing
      ? governanceScore - yesterdayBriefing.governanceScore
      : 0


    console.log('[briefing] aiResult raw:', JSON.stringify(aiResult, null, 2))
    
    // ── 5. Save and return ────────────────────────────────────────────────────
    // Upsert — handles the race condition where two requests hit simultaneously
    const briefing = await Briefing.findOneAndUpdate(
      { date: today },
      {
        date: today,
        summary:         aiResult.summary,
        topPriorities:   aiResult.topPriorities,
        governanceScore,
        scoreChange,
        generatedAt:     new Date(),
      },
      { upsert: true, new: true }
    ).lean()

    return NextResponse.json(briefing)
  } catch (err) {
    console.error('[GET /api/briefing]', err)
    return NextResponse.json(
      { error: 'Failed to generate briefing' } satisfies ApiError,
      { status: 500 }
    )
  }
}
