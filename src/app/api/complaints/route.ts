// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/complaints
// GET  — paginated, filtered complaint list
// POST — submit new complaint (SLA + Gemini priority scoring + clustering)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { geminiJSON } from '@/lib/groq'
import { getSLADeadline, getPriorityFromScore } from '@/lib/sla'
import Complaint from '@/models/Complaint'
import { DEFAULT_PAGE_SIZE, COMPLAINT_ID_PREFIX } from '@/constants'
import type {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
  AIPriorityResult,
  ApiError,
} from '@/types'

// ── GET /api/complaints ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = req.nextUrl
    const district = searchParams.get('district')
    const category = searchParams.get('category') as ComplaintCategory | null
    const status   = searchParams.get('status')   as ComplaintStatus   | null
    const priority = searchParams.get('priority') as ComplaintPriority | null
    const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
    const limit    = Math.min(100, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10))
    const skip     = (page - 1) * limit

    // Build filter object — only include fields that were provided
    const filter: Record<string, unknown> = {}
    if (district) filter.district = district
    if (category) filter.category = category
    if (status)   filter.status   = status
    if (priority) filter.priority = priority

    const [data, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ priorityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ])

    return NextResponse.json({ data, total, page, limit })
  } catch (err) {
    console.error('[GET /api/complaints]', err)
    return NextResponse.json(
      { error: 'Failed to fetch complaints' } satisfies ApiError,
      { status: 500 }
    )
  }
}

// ── POST /api/complaints ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const {
      title, description, category, district, ward,
      citizenName, citizenPhone,
      coordinates,   // { lat, lng, accuracy?, source } — optional, from GPS or pin drop
    } = body

    // Basic validation
    if (!title || !description || !category || !district) {
      return NextResponse.json(
        { error: 'title, description, category, and district are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    const createdAt   = new Date()
    const slaDeadline = getSLADeadline(category as ComplaintCategory, createdAt)

    // Gemini priority scoring — runs in parallel with no other blocking work
    let priorityScore  = 50
    let priorityReason = 'Priority assessed based on category and district.'
    let priority: ComplaintPriority = 'medium'

    try {
      const aiResult = await geminiJSON<AIPriorityResult>(`
You are an AI assistant for the Delhi Government's complaint management system.
Score this citizen complaint on a priority scale of 0–100 and explain why in one sentence.

Complaint details:
- Title: ${title}
- Description: ${description}
- Category: ${category}
- District: ${district}

Scoring guide:
- 80–100 (critical): Life/safety risk, large population affected, infrastructure failure
- 60–79 (high): Significant disruption, SLA risk, vulnerable citizens affected
- 40–59 (medium): Notable issue, moderate impact
- 0–39 (low): Minor inconvenience, small impact

Respond with JSON:
{
  "score": <number 0-100>,
  "reason": "<one sentence explanation>",
  "priority": "<low|medium|high|critical>"
}
      `.trim(), { score: 50, reason: 'Default priority.', priority: 'medium' })

      priorityScore  = Math.min(100, Math.max(0, aiResult.score))
      priorityReason = aiResult.reason
      priority       = getPriorityFromScore(priorityScore)
    } catch (aiErr) {
      // Non-fatal — complaint saves with default score if Gemini fails
      console.warn('[POST /api/complaints] Gemini priority scoring failed:', aiErr)
    }

    // Generate a human-readable complaint ID suffix
    const year     = createdAt.getFullYear()
    const sequence = Math.floor(10000 + Math.random() * 90000) // 5-digit pseudo-random
    const complaintRef = `${COMPLAINT_ID_PREFIX}-${year}-${sequence}`

    const complaint = await Complaint.create({
      title:       title.trim(),
      description: description.trim(),
      category,
      district,
      ward:          ward?.trim()         || undefined,
      citizenName:   citizenName?.trim()  || undefined,
      citizenPhone:  citizenPhone?.trim() || undefined,
      status:        'open',
      priority,
      priorityScore,
      priorityReason,
      slaDeadline,
      slaBreached: false,
      // Save coordinates only when the shape is valid
      ...(coordinates?.lat != null && coordinates?.lng != null
        ? { coordinates: {
            lat:      coordinates.lat,
            lng:      coordinates.lng,
            accuracy: coordinates.accuracy ?? undefined,
            source:   coordinates.source === 'pin' ? 'pin' : 'gps',
          }}
        : {}),
      estimatedCitizensAffected: 1,
      timeline: [
        {
          status:    'open',
          timestamp: createdAt,
          note:      `Complaint submitted. Ref: ${complaintRef}`,
        },
      ],
      createdAt,
    })

    return NextResponse.json(
      { complaint, complaintRef },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/complaints]', err)
    return NextResponse.json(
      { error: 'Failed to submit complaint' } satisfies ApiError,
      { status: 500 }
    )
  }
}
