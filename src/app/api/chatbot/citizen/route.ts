// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/chatbot/citizen
// POST — Citizen AI chatbot message handler.
//
// Receives a user message (text, optional image base64, optional audio transcript)
// Builds conversation history from DB, calls Groq, returns assistant reply.
//
// When the AI has gathered enough info it returns a special JSON block:
//   { type: 'COMPLAINT_READY', data: ExtractedComplaint }
// which the frontend detects to show the ComplaintConfirmCard.
//
// Body:
//   { message: string, sessionId: string,
//     imageBase64?: string, imageMimeType?: string }
//
// Returns:
//   { reply: string, complaintReady?: true, complaintData?: ExtractedComplaint }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB }    from '@/lib/mongodb'
import { geminiJSON, groqVision } from '@/lib/groq'
import ChatMessageModel from '@/models/ChatMessage'
import type { ApiError } from '@/types'
import type { ExtractedComplaint } from '@/components/chatbot/ComplaintConfirmCard'
import { DELHI_DISTRICTS, COMPLAINT_CATEGORIES } from '@/constants'

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are NETRA, an AI assistant for the Delhi Government citizen complaint system.
Your job is to help citizens file civic complaints through friendly conversation.
You speak in the language the user writes in — Hindi, English, or Hinglish.
Keep responses short (2-3 sentences max). Be warm, helpful, and professional.

Valid districts: ${DELHI_DISTRICTS.join(', ')}.
Valid categories: ${COMPLAINT_CATEGORIES.map(c => c.label).join(', ')}.

Gather these details progressively through conversation:
1. What is the problem? (category + title)
2. Where is it? (district)
3. Brief description (if not already clear)

Once you have all three, respond ONLY with this exact JSON (no other text):
{"type":"COMPLAINT_READY","data":{"title":"<short title>","description":"<full description>","category":"<one of: water|electricity|roads|sanitation|health|other>","district":"<exact district name from the list>","priority":"<low|medium|high|critical>"}}

Priority guide: critical=life/safety risk, high=large disruption, medium=notable issue, low=minor inconvenience.
Do NOT output the JSON until you have the district AND a clear problem description.
If the user provides an image description, use it to enrich the description field.`

// ── POST /api/chatbot/citizen ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body: {
      message:        string
      sessionId:      string
      imageBase64?:   string
      imageMimeType?: string
    } = await req.json()

    const { message, sessionId, imageBase64, imageMimeType } = body

    if (!message?.trim() || !sessionId?.trim()) {
      return NextResponse.json(
        { error: 'message and sessionId are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    // ── 1. Optional vision — extract image description before building prompt ─
    let imageDescription = ''
    if (imageBase64 && imageMimeType) {
      imageDescription = await groqVision(
        imageBase64,
        imageMimeType,
        'Describe what civic problem is visible in this image in one sentence. Focus on the issue, not the surroundings.'
      )
    }

    // ── 2. Fetch conversation history (last 10 messages) ─────────────────────
    const history = await ChatMessageModel
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean()

    // ── 3. Build the full message array for Groq ──────────────────────────────
    const userContent = imageDescription
      ? `${message}\n[Image attached: ${imageDescription}]`
      : message

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ]

    // ── 4. Call Groq ──────────────────────────────────────────────────────────
    // We use geminiJSON-style call but expect either plain text or the COMPLAINT_READY JSON.
    // Using the raw chat API (not geminiJSON) so we can handle both cases.
    const Groq = (await import('groq-sdk')).default
    const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY! })

    const completion = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      messages,
      max_tokens: 400,
      temperature: 0.4,   // low temp for consistent structured output
    })

    const rawReply = completion.choices[0].message.content?.trim() ?? ''

    // ── 5. Persist both sides of the conversation ─────────────────────────────
    await ChatMessageModel.insertMany([
      { sessionId, role: 'user',      content: message,   persona: 'citizen' },
      { sessionId, role: 'assistant', content: rawReply,  persona: 'netra'   },
    ])

    // ── 6. Detect COMPLAINT_READY JSON block ──────────────────────────────────
    // The model may wrap it in markdown — strip fences first
    const jsonCandidate = rawReply
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i,     '')
      .replace(/```\s*$/,      '')
      .trim()

    if (jsonCandidate.startsWith('{"type":"COMPLAINT_READY"')) {
      try {
        const parsed = JSON.parse(jsonCandidate) as {
          type: 'COMPLAINT_READY'
          data: ExtractedComplaint
        }

        if (parsed.type === 'COMPLAINT_READY' && parsed.data?.title && parsed.data?.district) {
          return NextResponse.json({
            reply:          'Great! I have all the details. Please review and confirm below.',
            complaintReady: true,
            complaintData:  parsed.data,
          })
        }
      } catch {
        // Not valid JSON — fall through to plain text reply
      }
    }

    // ── 7. Plain conversational reply ─────────────────────────────────────────
    return NextResponse.json({ reply: rawReply })

  } catch (err) {
    console.error('[POST /api/chatbot/citizen]', err)
    return NextResponse.json(
      { error: 'Failed to process message' } satisfies ApiError,
      { status: 500 }
    )
  }
}
