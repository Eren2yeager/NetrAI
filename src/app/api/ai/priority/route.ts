// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/ai/priority
// POST — score a single complaint 0-100 and return priority label + reason.
// Used by department heads to manually re-score a complaint.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { geminiJSON } from '@/lib/groq'
import { getPriorityFromScore } from '@/lib/sla'
import type { AIPriorityResult, ApiError } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, category, district } = body

    if (!title || !description || !category || !district) {
      return NextResponse.json(
        { error: 'title, description, category, and district are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    const result = await geminiJSON<AIPriorityResult>(`
You are an AI assistant for the Delhi Government's complaint management system.
Score this citizen complaint on a priority scale of 0–100 and explain why in one sentence.

Complaint:
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
    `.trim(), { score: 40, reason: 'Unable to score at this time.', priority: 'medium' })

    // Ensure priority is consistent with score
    const score    = Math.min(100, Math.max(0, result.score))
    const priority = getPriorityFromScore(score)

    return NextResponse.json({ score, reason: result.reason, priority } satisfies AIPriorityResult)
  } catch (err) {
    console.error('[POST /api/ai/priority]', err)
    return NextResponse.json(
      { error: 'Priority scoring failed' } satisfies ApiError,
      { status: 500 }
    )
  }
}
