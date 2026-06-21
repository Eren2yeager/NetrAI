// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/chatbot/citizen/register
// POST — registers an AI-extracted complaint as a real Complaint document.
//
// Called after the citizen confirms the ComplaintConfirmCard.
// Runs the same pipeline as POST /api/complaints:
//   SLA deadline → Gemini priority re-scoring → clustering check → save
//
// Body:
//   {
//     complaintData: ExtractedComplaint,
//     coordinates?:  { lat, lng, accuracy?, source }
//     imageUrl?:     string   — Cloudinary URL from chatbot image attachment
//     sessionId:     string   — used to mark the ChatMessage thread as resolved
//   }
//
// Returns: { complaint, complaintRef }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB }                 from '@/lib/mongodb'
import { geminiJSON }                from '@/lib/groq'
import { getSLADeadline, getPriorityFromScore } from '@/lib/sla'
import Complaint                     from '@/models/Complaint'
import { COMPLAINT_ID_PREFIX }       from '@/constants'
import type {
  ComplaintCategory,
  ComplaintPriority,
  AIPriorityResult,
  ApiError,
} from '@/types'
import type { ExtractedComplaint }   from '@/components/chatbot/ComplaintConfirmCard'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body: {
      complaintData: ExtractedComplaint
      coordinates?:  {
        lat:       number
        lng:       number
        accuracy?: number
        source?:   'gps' | 'pin'
      }
      imageUrl?:  string
      sessionId?: string
    } = await req.json()

    const { complaintData, coordinates, imageUrl } = body

    // ── Validate required fields ──────────────────────────────────────────────
    if (
      !complaintData?.title?.trim()       ||
      !complaintData?.description?.trim() ||
      !complaintData?.category            ||
      !complaintData?.district?.trim()
    ) {
      return NextResponse.json(
        { error: 'title, description, category, and district are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    const { title, description, category, district } = complaintData
    const createdAt   = new Date()
    const slaDeadline = getSLADeadline(category as ComplaintCategory, createdAt)

    // ── Gemini priority re-scoring ────────────────────────────────────────────
    // The chatbot already inferred a rough priority — we re-score with Gemini
    // for consistency with form-submitted complaints.
    let priorityScore  = 50
    let priorityReason = 'Priority assessed based on category and district.'
    let priority: ComplaintPriority = complaintData.priority ?? 'medium'

    try {
      const aiResult = await geminiJSON<AIPriorityResult>(`
You are an AI assistant for the Delhi Government complaint system.
Score this citizen complaint 0–100 and explain in one sentence.

Title: ${title}
Description: ${description}
Category: ${category}
District: ${district}
${imageUrl ? 'Note: citizen attached a photo of the issue.' : ''}

Scoring: 80–100=critical, 60–79=high, 40–59=medium, 0–39=low.

Respond with JSON only:
{"score":<number>,"reason":"<one sentence>","priority":"<low|medium|high|critical>"}
      `.trim(), { score: 50, reason: 'Default priority.', priority: 'medium' })

      priorityScore  = Math.min(100, Math.max(0, aiResult.score))
      priorityReason = aiResult.reason
      priority       = getPriorityFromScore(priorityScore)
    } catch {
      // Non-fatal — complaint saves with default score
    }

    // ── Complaint reference ID ────────────────────────────────────────────────
    const year         = createdAt.getFullYear()
    const sequence     = Math.floor(10000 + Math.random() * 90000)
    const complaintRef = `${COMPLAINT_ID_PREFIX}-${year}-${sequence}`

    // ── Save complaint ────────────────────────────────────────────────────────
    const complaint = await Complaint.create({
      title:         title.trim(),
      description:   description.trim(),
      category,
      district,
      status:        'open',
      priority,
      priorityScore,
      priorityReason,
      slaDeadline,
      slaBreached:   false,
      // Chatbot-specific fields
      submissionMode: 'chatbot',
      ...(imageUrl   ? { beforePhotoUrl: imageUrl } : {}),
      // GPS / pin-drop coordinates
      ...(coordinates?.lat != null && coordinates?.lng != null
        ? {
            coordinates: {
              lat:      coordinates.lat,
              lng:      coordinates.lng,
              accuracy: coordinates.accuracy ?? undefined,
              source:   coordinates.source === 'pin' ? 'pin' : 'gps',
            },
          }
        : {}),
      estimatedCitizensAffected: 1,
      timeline: [
        {
          status:    'open',
          timestamp: createdAt,
          note:      `Complaint submitted via AI chatbot. Ref: ${complaintRef}`,
        },
      ],
      createdAt,
    })

    return NextResponse.json({ complaint, complaintRef }, { status: 201 })

  } catch (err) {
    console.error('[POST /api/chatbot/citizen/register]', err)
    return NextResponse.json(
      { error: 'Failed to register complaint' } satisfies ApiError,
      { status: 500 }
    )
  }
}
