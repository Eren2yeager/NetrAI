// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/assistant/dept  (SAHAY persona)
// POST — Streaming AI assistant for the Department Head.
//
// Injects dept-specific complaint stats into system prompt.
// Body:  { message: string, sessionId: string, department?: string }
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
      department,
    }: { message: string; sessionId: string; department?: string } = await req.json()

    if (!message?.trim() || !sessionId?.trim()) {
      return new Response('message and sessionId are required', { status: 400 })
    }

    // ── 1. Fetch dept-specific stats ──────────────────────────────────────────
    const deptFilter = department ? { assignedDept: department } : {}

    const [openCount, slaBreachCount, criticalCount] = await Promise.all([
      Complaint.countDocuments({ ...deptFilter, status: { $ne: 'resolved' } }),
      Complaint.countDocuments({ ...deptFilter, slaBreached: true, status: { $ne: 'resolved' } }),
      Complaint.countDocuments({ ...deptFilter, priority: 'critical', status: { $ne: 'resolved' } }),
    ])

    const deptName = department ?? 'your department'

    // ── 2. System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `You are SAHAY, the AI operations assistant for the ${deptName} Department of Delhi Government.

Current data (live):
- Open complaints: ${openCount}
- SLA breaches: ${slaBreachCount}
- Critical complaints: ${criticalCount}

Instructions:
- Speak concisely and action-oriented. You are helping a department head manage their team.
- Always reference specific numbers when answering.
- Flag risks early — especially SLA breaches and critical complaints.
- Answer only questions relevant to ${deptName} department operations.
- Keep responses under 120 words.`

    // ── 3. Fetch conversation history ─────────────────────────────────────────
    const history = await ChatMessage
      .find({ sessionId, persona: { $in: ['sahay', 'citizen'] } })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean()

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ]

    // ── 4. Save user message (non-blocking) ───────────────────────────────────
    ChatMessage.create({ sessionId, role: 'user', content: message, persona: 'sahay' })
      .catch((e) => console.warn('[assistant/dept] save user msg:', e))

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
      ChatMessage.create({ sessionId, role: 'assistant', content: full, persona: 'sahay' })
        .catch((e) => console.warn('[assistant/dept] save assistant msg:', e))
    })()

    return new Response(clientStream, {
      headers: {
        'Content-Type':      'text/event-stream',
        'Cache-Control':     'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })

  } catch (err) {
    console.error('[POST /api/assistant/dept]', err)
    return new Response('Internal server error', { status: 500 })
  }
}
