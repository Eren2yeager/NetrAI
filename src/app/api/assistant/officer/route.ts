// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/assistant/officer  (MARG persona)
// POST — Streaming AI assistant for the Field Officer.
//
// Injects the officer's assigned complaint count + next priority complaint.
// Body:  { message: string, sessionId: string, officerName?: string }
// Stream: raw text chunks
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { connectDB }   from '@/lib/mongodb'
import { groqStream }  from '@/lib/groq'
import Complaint       from '@/models/Complaint'
import ChatMessage     from '@/models/ChatMessage'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      message,
      sessionId,
      officerName,
    }: { message: string; sessionId: string; officerName?: string } = await req.json()

    if (!message?.trim() || !sessionId?.trim()) {
      return new Response('message and sessionId are required', { status: 400 })
    }

    // ── 1. Fetch officer data ─────────────────────────────────────────────────
    // In production this would filter by assignedOfficer ObjectId.
    // For demo, we use the top open complaint as the "next priority".
    const [assignedCount, nextComplaint] = await Promise.all([
      Complaint.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress'] } }),
      Complaint.findOne(
        { status: { $in: ['open', 'assigned', 'in_progress'] } },
        { title: 1, district: 1, category: 1, priority: 1, slaDeadline: 1 }
      )
        .sort({ priorityScore: -1 })
        .lean(),
    ])

    const name      = officerName ?? 'Officer'
    const nextTitle = nextComplaint?.title    ?? 'No active complaints'
    const nextDist  = nextComplaint?.district ?? ''
    const nextPri   = nextComplaint?.priority ?? ''

    // ── 2. System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `You are MARG, the field assistant for ${name} of Delhi Government.

Current data (live):
- Complaints in queue: ${assignedCount}
- Next priority complaint: "${nextTitle}"${nextDist ? ` in ${nextDist}` : ''}${nextPri ? ` (${nextPri} priority)` : ''}

Instructions:
- Speak simply and clearly. You are helping a field officer on the ground.
- Give step-by-step instructions when asked how to do something.
- Help the officer update complaint statuses and navigate to locations.
- Keep responses under 100 words.
- Never use jargon — plain language only.`

    // ── 3. Fetch conversation history ─────────────────────────────────────────
    const history = await ChatMessage
      .find({ sessionId, persona: { $in: ['marg', 'citizen'] } })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean()

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ]

    // ── 4. Save user message (non-blocking) ───────────────────────────────────
    ChatMessage.create({ sessionId, role: 'user', content: message, persona: 'marg' })
      .catch((e) => console.warn('[assistant/officer] save user msg:', e))

    // ── 5. Stream ─────────────────────────────────────────────────────────────
    const stream = await groqStream(messages)
    const [clientStream, saveStream] = stream.tee()

    ;(async () => {
      const reader  = saveStream.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value)
      }
      ChatMessage.create({ sessionId, role: 'assistant', content: full, persona: 'marg' })
        .catch((e) => console.warn('[assistant/officer] save assistant msg:', e))
    })()

    return new Response(clientStream, {
      headers: {
        'Content-Type':      'text/event-stream',
        'Cache-Control':     'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })

  } catch (err) {
    console.error('[POST /api/assistant/officer]', err)
    return new Response('Internal server error', { status: 500 })
  }
}
