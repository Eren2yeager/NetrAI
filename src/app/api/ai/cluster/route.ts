// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/ai/cluster
// POST — finds duplicate complaints and groups them into a Cluster document.
// Flow:
//   1. Fetch recent (48h) complaints in same district + category
//   2. Pre-filter by Jaccard similarity (fast, no AI cost)
//   3. Send candidates to Gemini for confirmation
//   4. Create or update Cluster document
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { geminiJSON } from '@/lib/groq'
import { areLikelySimilar } from '@/lib/clustering'
import Complaint from '@/models/Complaint'
import Cluster from '@/models/Cluster'
import type { AIClusterResult, ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { complaintId, title, description, district, category } = body

    if (!complaintId || !title || !description || !district || !category) {
      return NextResponse.json(
        { error: 'complaintId, title, description, district, and category are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    await connectDB()

    const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Fetch recent complaints in the same district + category (exclude self)
    const candidates = await Complaint.find({
      district,
      category,
      createdAt:  { $gte: since48h },
      _id:        { $ne: complaintId },
      status:     { $ne: 'resolved' },
    })
      .select('_id title description estimatedCitizensAffected')
      .limit(20)
      .lean()

    if (candidates.length === 0) {
      return NextResponse.json({ clusterId: undefined, matchCount: 0, isNew: false } satisfies AIClusterResult)
    }

    // Pre-filter by text similarity
    const similar = candidates.filter((c) =>
      areLikelySimilar(title, description, c.title, c.description)
    )

    if (similar.length === 0) {
      return NextResponse.json({ clusterId: undefined, matchCount: 0, isNew: false } satisfies AIClusterResult)
    }

    // Gemini confirmation — ask if these describe the same physical issue
    interface GeminiClusterResponse {
      matchingIds: string[]
      mergedTitle: string
    }

    const candidateList = similar
      .map((c) => `ID: ${c._id} | Title: "${c.title}" | Desc: "${c.description.slice(0, 100)}"`)
      .join('\n')

    const aiResult = await geminiJSON<GeminiClusterResponse>(`
You are an AI system for the Delhi Government complaint management platform.

New complaint:
Title: "${title}"
Description: "${description.slice(0, 200)}"
District: ${district}
Category: ${category}

Candidate complaints that may describe the same physical issue:
${candidateList}

Determine which (if any) of the candidates describe the SAME physical issue
as the new complaint (same location, same root cause). Minor wording differences
are fine — focus on whether they refer to the same actual problem on the ground.

Respond with JSON:
{
  "matchingIds": ["<id1>", "<id2>"],
  "mergedTitle": "<short merged title for the cluster, max 10 words>"
}

If none match, return: { "matchingIds": [], "mergedTitle": "" }
    `.trim(), { matchingIds: [], mergedTitle: '' })

    const matchingIds = aiResult.matchingIds ?? []

    if (matchingIds.length === 0) {
      return NextResponse.json({ clusterId: undefined, matchCount: 0, isNew: false } satisfies AIClusterResult)
    }

    // All complaint IDs in this cluster (new + matches)
    const allIds = [complaintId, ...matchingIds]

    // Check if an existing cluster already contains any of these complaints
    const existingCluster = await Cluster.findOne({
      complaintIds: { $in: allIds },
      district,
      category,
      status: { $ne: 'resolved' },
    })

    const totalAffected = allIds.length // simple count — seed data doesn't have citizen counts

    if (existingCluster) {
      // Add new IDs to existing cluster
      const newIds = allIds.filter(
        (id) => !existingCluster.complaintIds.map(String).includes(String(id))
      )
      existingCluster.complaintIds.push(...newIds.map((id) => id as any))
      existingCluster.totalCitizensAffected += newIds.length
      await existingCluster.save()

      return NextResponse.json({
        clusterId:  String(existingCluster._id),
        matchCount: matchingIds.length,
        isNew:      false,
      } satisfies AIClusterResult)
    }

    // Create new cluster
    const cluster = await Cluster.create({
      title:                 aiResult.mergedTitle || title,
      complaintIds:          allIds,
      district,
      category,
      totalCitizensAffected: totalAffected,
      status:                'open',
    })

    // Back-reference the cluster on all matched complaints
    await Complaint.updateMany(
      { _id: { $in: allIds } },
      { $set: { clusterId: cluster._id } }
    )

    return NextResponse.json({
      clusterId:  String(cluster._id),
      matchCount: matchingIds.length,
      isNew:      true,
    } satisfies AIClusterResult)
  } catch (err) {
    console.error('[POST /api/ai/cluster]', err)
    return NextResponse.json(
      { error: 'Clustering failed' } satisfies ApiError,
      { status: 500 }
    )
  }
}
