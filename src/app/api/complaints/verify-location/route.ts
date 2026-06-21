// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/complaints/verify-location
// POST — Check whether a coordinate pair matches the user-selected district.
//
// Uses the Nominatim reverse-geocode API (free, no key required) to resolve
// the district name from lat/lng, then asks Gemini to normalize it against
// our canonical DELHI_DISTRICTS list.
//
// Response:
//   { match: true }                        — coords inside the selected district
//   { match: false, detectedDistrict: "…" } — mismatch, with the detected name
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { geminiJSON } from '@/lib/groq'
import { DELHI_DISTRICTS } from '@/constants'
import type { ApiError } from '@/types'

interface VerifyLocationBody {
  lat: number
  lng: number
  selectedDistrict: string
}

interface VerifyLocationResponse {
  match: boolean
  detectedDistrict?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyLocationBody = await req.json()
    const { lat, lng, selectedDistrict } = body

    if (lat == null || lng == null || !selectedDistrict) {
      return NextResponse.json(
        { error: 'lat, lng, and selectedDistrict are required' } as ApiError,
        { status: 400 }
      )
    }

    // ── Step 1: Nominatim reverse geocode ──────────────────────────────────
    // Free OSM reverse geocode — returns address breakdown including suburb,
    // county, city_district, state_district fields.

    let nominatimAddress: Record<string, string> = {}

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'NetrAI/1.0 (netraai.gov.in)' },
        signal:  AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        nominatimAddress = data?.address ?? {}
      }
    } catch {
      // Non-fatal — fall through to Gemini-only matching
    }

    // Build a human-readable address string from Nominatim fields
    const addressParts = [
      nominatimAddress.suburb,
      nominatimAddress.city_district,
      nominatimAddress.county,
      nominatimAddress.state_district,
      nominatimAddress.state,
    ].filter(Boolean)
    const addressHint = addressParts.join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`

    // ── Step 2: Gemini normalises address → canonical district ─────────────
    const districtList = DELHI_DISTRICTS.join(', ')

    const aiResult = await geminiJSON<{ detectedDistrict: string | null }>(`
You are a location classifier for the Delhi Government complaint system.

Given a GPS coordinate and its reverse-geocoded address, identify which Delhi district the location falls in.

Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
Reverse-geocoded address: ${addressHint}

Valid Delhi districts (use EXACTLY one of these names, or null if outside Delhi):
${districtList}

Rules:
- Map common area names to the correct administrative district (e.g. "Connaught Place" → "New Delhi")
- If the location is clearly outside Delhi NCT, return null
- Return ONLY the exact district name from the list above, or null

Respond with JSON:
{ "detectedDistrict": "<exact district name or null>" }
    `.trim(), { detectedDistrict: null })

    const detected = aiResult.detectedDistrict

    // If Gemini couldn't place it (outside Delhi or uncertain), skip mismatch
    if (!detected) {
      return NextResponse.json({ match: true } satisfies VerifyLocationResponse)
    }

    // Case-insensitive comparison — names should already match but be safe
    const match =
      detected.toLowerCase().trim() === selectedDistrict.toLowerCase().trim()

    return NextResponse.json(
      match
        ? ({ match: true } as VerifyLocationResponse)
        : ({ match: false, detectedDistrict: detected } as VerifyLocationResponse)
    )
  } catch (err) {
    console.error('[POST /api/complaints/verify-location]', err)
    // Fail open — don't block submission on a geocode error
    return NextResponse.json({ match: true } as VerifyLocationResponse)
  }
}
