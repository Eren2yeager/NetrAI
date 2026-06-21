import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function geminiJSON<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no explanation.` }],
      response_format: { type: 'json_object' },
    })
    return JSON.parse(res.choices[0].message.content!) as T
  } catch (err) {
    console.warn('[geminiJSON] model call failed, using fallback:', err)
    return fallback
  }
}

export async function geminiText(prompt: string, fallback: string): Promise<string> {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    })
    return res.choices[0].message.content!.trim()
  } catch (err) {
    console.warn('[geminiText] model call failed, using fallback:', err)
    return fallback
  }
}

// ── Streaming helper — for AI assistant chat (Phase 11) ───────────────────────
// Returns a ReadableStream of raw text chunks for SSE responses.

export async function groqStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const stream = await groq.chat.completions.create({
    model:      'llama-3.3-70b-versatile',
    messages,
    stream:     true,
    max_tokens: 500,
  })

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    },
  })
}

// ── Vision helper — for citizen chatbot image understanding (Phase 10) ────────
// Sends a base64-encoded image + prompt to the Groq vision model.
// Returns a plain-text description extracted from the image.

export async function groqVision(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const res = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type:      'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 300,
    })
    return res.choices[0].message.content?.trim() ?? ''
  } catch (err) {
    console.warn('[groqVision] vision call failed:', err)
    return ''
  }
}
