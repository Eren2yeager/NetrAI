// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/ai/sentiment
// GET — per-district sentiment analysis using last 7 days of complaints.
// Calls Gemini once with a batch of complaint descriptions per district.
// Returns DistrictSentimentMap: { [district]: 'positive' | 'neutral' | 'negative' }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { geminiJSON } from '@/lib/groq'
import Complaint from '@/models/Complaint'
import { DELHI_DISTRICTS } from '@/constants'
import type { DistrictSentimentMap, SentimentValue, ApiError } from '@/types'

export async function GET() {
  try {
    await connectDB()

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Fetch recent complaints grouped by district — sample max 3 per district
    const complaints = await Complaint.find(
      { createdAt: { $gte: sevenDaysAgo } },
      { district: 1, description: 1, title: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    // Group descriptions by district (max 3 per district for token efficiency)
    const byDistrict: Record<string, string[]> = {}
    for (const c of complaints) {
      if (!byDistrict[c.district]) byDistrict[c.district] = []
      if (byDistrict[c.district].length < 3) {
        byDistrict[c.district].push(`${c.title}: ${c.description.slice(0, 100)}`)
      }
    }

    // Build the prompt — one batch call for all districts
    const districtLines = Object.entries(byDistrict)
      .map(([d, texts]) => `${d}: "${texts.join(' | ')}"`)
      .join('\n')

    // Fill in districts with no recent complaints as neutral
    const allDistricts = DELHI_DISTRICTS.join(', ')

    const result = await geminiJSON<Record<string, string>>(`
Analyse citizen complaint sentiment for Delhi districts.

Recent complaint summaries (last 7 days):
${districtLines || 'No recent complaints.'}

For each of these 11 districts, classify overall citizen sentiment as positive, neutral, or negative:
${allDistricts}

Base it on complaint tone, severity, and frequency. Districts with no complaints default to neutral.

Respond with JSON only — keys are exact district names, values are "positive", "neutral", or "negative":
{
  "Central Delhi": "neutral",
  "East Delhi": "negative",
  ...
}
    `.trim(), Object.fromEntries(DELHI_DISTRICTS.map((d) => [d, 'neutral'])))

    // Validate and build output — fall back to neutral for any missing/invalid values
    const VALID: SentimentValue[] = ['positive', 'neutral', 'negative']
    const sentimentMap: DistrictSentimentMap = {}

    for (const district of DELHI_DISTRICTS) {
      const raw = result[district]
      sentimentMap[district] = VALID.includes(raw as SentimentValue)
        ? (raw as SentimentValue)
        : 'neutral'
    }

    return NextResponse.json(sentimentMap)
  } catch (err) {
    console.error('[GET /api/ai/sentiment]', err)

    // Graceful fallback — return all neutral rather than a 500
    const fallback: DistrictSentimentMap = {}
    for (const d of DELHI_DISTRICTS) fallback[d] = 'neutral'

    return NextResponse.json(fallback)
  }
}
