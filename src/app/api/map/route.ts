// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/map
// GET — aggregates complaint counts per district for choropleth colouring.
// Returns DistrictData[] used by HotspotMap to shade each district.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import { DELHI_DISTRICTS } from '@/constants'
import type { DistrictData, ApiError } from '@/types'

export async function GET() {
  try {
    await connectDB()

    // Aggregate counts per district in one pipeline pass
    const [countAgg, criticalAgg, categoryAgg, resolutionAgg] = await Promise.all([
      // Total complaints per district
      Complaint.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
      ]),
      // Critical complaints per district
      Complaint.aggregate([
        { $match: { priority: 'critical' } },
        { $group: { _id: '$district', count: { $sum: 1 } } },
      ]),
      // Top category per district
      Complaint.aggregate([
        { $group: { _id: { district: '$district', category: '$category' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $group: { _id: '$_id.district', topCategory: { $first: '$_id.category' }, topCount: { $first: '$count' } } },
      ]),
      // Avg resolution days per district (resolved only)
      Complaint.aggregate([
        { $match: { status: 'resolved' } },
        {
          $group: {
            _id: '$district',
            avgMs: {
              $avg: {
                $subtract: ['$updatedAt', '$createdAt'],
              },
            },
          },
        },
      ]),
    ])

    // Build lookup maps
    const countMap:      Record<string, number> = {}
    const criticalMap:   Record<string, number> = {}
    const categoryMap:   Record<string, string> = {}
    const resolutionMap: Record<string, number> = {}

    for (const row of countAgg)      countMap[row._id]      = row.count
    for (const row of criticalAgg)   criticalMap[row._id]   = row.count
    for (const row of categoryAgg)   categoryMap[row._id]   = row.topCategory
    for (const row of resolutionAgg) resolutionMap[row._id] = parseFloat(
      (row.avgMs / (1000 * 60 * 60 * 24)).toFixed(1)
    )

    // Find max complaint count for density thresholds
    const maxCount = Math.max(...Object.values(countMap), 1)

    const data: DistrictData[] = DELHI_DISTRICTS.map((name) => {
      const count    = countMap[name]    ?? 0
      const critical = criticalMap[name] ?? 0
      const ratio    = count / maxCount

      const density =
        ratio >= 0.6 ? 'high' :
        ratio >= 0.3 ? 'medium' : 'low'

      return {
        name,
        complaintCount:    count,
        criticalCount:     critical,
        density,
        topCategory:       categoryMap[name]   ?? 'other',
        avgResolutionDays: resolutionMap[name] ?? 0,
        sentiment:         'neutral',   // will be enriched by /api/ai/sentiment
        trustScore:        Math.max(0, Math.round(100 - (critical / Math.max(count, 1)) * 100)),
      }
    })

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/map]', err)
    return NextResponse.json(
      { error: 'Failed to aggregate map data' } satisfies ApiError,
      { status: 500 }
    )
  }
}
