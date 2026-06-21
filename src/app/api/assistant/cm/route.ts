// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/assistant/cm  (NETRA persona)
// POST — Streaming AI assistant for the Chief Minister.
//
// Injects live KPIs from DB into the system prompt on every request.
// Returns a ReadableStream (text/event-stream) so the frontend can display
// words as they arrive.
//
// Body:  { message: string, sessionId: string }
// Stream: raw text chunks (not SSE events — frontend reads with getReader())
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { connectDB }   from '@/lib/mongodb'
import { groqStream }  from '@/lib/groq'
import Complaint       from '@/models/Complaint'
import ChatMessage     from '@/models/ChatMessage'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { message, sessionId }: { message: string; sessionId: string } =
      await req.json()

    if (!message?.trim() || !sessionId?.trim()) {
      return new Response('message and sessionId are required', { status: 400 })
    }

    // ── 1. Fetch live KPIs ────────────────────────────────────────────────────
    const [openCount, criticalCount, districtAgg, slaAgg] = await Promise.all([
      Complaint.countDocuments({ status: { $ne: 'resolved' } }),
      Complaint.countDocuments({ priority: 'critical', status: { $ne: 'resolved' } }),
      Complaint.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 1 },
      ]),
      Complaint.aggregate([
        { $match: { slaBreached: true, status: { $ne: 'resolved' } } },
        { $group: { _id: '$assignedDept', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 3 },
      ]),
    ])

    const topDistrict  = districtAgg[0]?._id ?? 'Unknown'
    const slaBreachStr = slaAgg.length
      ? slaAgg.map((s: { _id: string; count: number }) => `${s._id ?? 'Unknown'} (${s.count})`).join(', ')
      : 'none'

    // ── 2. Build system prompt with live data ─────────────────────────────────
    const systemPrompt = `You are NETRA, the AI Chief of Staff for the Chief Minister of Delhi.
You have access to real-time governance data.

Current data (live):
- Active complaints: ${openCount}
- Critical complaints: ${criticalCount}
- Top hotspot district: ${topDistrict}
- SLA breaches by dept: ${slaBreachStr}

Instructions:
- Speak formally and concisely. You are advising the CM, not a citizen.
- Always cite specific numbers from the data above when relevant.
- End every response with one concrete suggested action.
- Answer only governance-related questions about Delhi's complaint data.
- Keep responses under 150 words.`

    // ── 3. Fetch conversation history (last 10 messages) ─────────────────────
    const history = await ChatMessage
      .find({ sessionId, persona: { $in: ['netra', 'citizen'] } })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean()

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    // ── 4. Save user message ──────────────────────────────────────────────────
    // Fire-and-forget — don't await, keeps streaming latency low
    ChatMessage.create({ sessionId, role: 'user', content: message, persona: 'netra' })
      .catch((e) => console.warn('[assistant/cm] save user msg failed:', e))

    // ── 5. Stream from Groq ───────────────────────────────────────────────────
    const stream = await groqStream(messages)

    // ── 6. Tee the stream: one side goes to client, one side saves to DB ──────
    // We collect the full response in a separate async task while streaming.
    const [clientStream, saveStream] = stream.tee()

    // Save assistant reply after streaming completes (non-blocking)
    ;(async () => {
      const reader  = saveStream.getReader()
      const decoder = new TextDecoder()
      let fullReply = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullReply += decoder.decode(value)
      }
      ChatMessage.create({
        sessionId,
        role:    'assistant',
        content: fullReply,
        persona: 'netra',
      }).catch((e) => console.warn('[assistant/cm] save assistant msg failed:', e))
    })()

    return new Response(clientStream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',  // disable Nginx buffering on Vercel
      },
    })

  } catch (err) {
    console.error('[POST /api/assistant/cm]', err)
    return new Response('Internal server error', { status: 500 })
  }
}
