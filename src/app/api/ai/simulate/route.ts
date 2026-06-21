// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/ai/simulate
// POST — policy what-if simulation via Gemini.
// Takes a proposed action, district, and resource count.
// Returns a PolicySimulation with estimated impact metrics.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { geminiJSON } from '@/lib/groq'
import Complaint from '@/models/Complaint'
import type { PolicySimulation, ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, district, resourceCount } = body

    if (!action || !district || !resourceCount) {
      return NextResponse.json(
        { error: 'action, district, and resourceCount are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    await connectDB()

    // Fetch current district context for grounded simulation
    const [totalInDistrict, criticalInDistrict, openInDistrict] = await Promise.all([
      Complaint.countDocuments({ district }),
      Complaint.countDocuments({ district, priority: 'critical' }),
      Complaint.countDocuments({ district, status: { $in: ['open', 'assigned', 'in_progress'] } }),
    ])

    const topCategories = await Complaint.aggregate([
      { $match: { district } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 3 },
    ])

    const categorySummary = topCategories
      .map((c) => `${c._id}: ${c.count}`)
      .join(', ')

    const result = await geminiJSON<PolicySimulation>(`
You are an AI policy advisor for the Delhi Government.
Estimate the impact of a proposed intervention on civic complaint resolution.

Current situation in ${district}:
- Total complaints: ${totalInDistrict}
- Open/active complaints: ${openInDistrict}
- Critical complaints: ${criticalInDistrict}
- Top complaint categories: ${categorySummary || 'mixed'}

Proposed action: "${action}"
District: ${district}
Resources being deployed: ${resourceCount} units

Provide a realistic, data-grounded estimate. Be specific with numbers.
Factor in that ${resourceCount} resources can typically handle 10-15 complaints each per day.

Respond with this exact JSON:
{
  "action": "${action}",
  "district": "${district}",
  "resourceCount": ${resourceCount},
  "estimatedComplaintReduction": <integer, number of complaints expected to be resolved in 7 days>,
  "estimatedResolutionImprovement": "<string, e.g. '2.1 days faster'>",
  "estimatedCitizensBenefited": <integer>,
  "slaImpact": "<string, e.g. 'SLA compliance expected to improve from 62% to 78%'>",
  "confidenceScore": <integer 50-95, how confident the model is>
}
    `.trim(), {
      action,
      district,
      resourceCount,
      estimatedComplaintReduction: 0,
      estimatedResolutionImprovement: 'Unknown',
      estimatedCitizensBenefited: 0,
      slaImpact: 'Unable to estimate at this time.',
      confidenceScore: 50,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/ai/simulate]', err)
    return NextResponse.json(
      { error: 'Simulation failed. Please try again.' } satisfies ApiError,
      { status: 500 }
    )
  }
}
