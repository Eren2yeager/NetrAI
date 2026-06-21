// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/map/dots
// GET — returns all complaints that have GPS / pin-drop coordinates.
// Used by ComplaintDots.tsx to render CircleMarker layer on HotspotMap.
// Only the fields Leaflet needs are projected — keeps the payload small.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import type { ApiError } from '@/types'

export interface ComplaintDot {
  _id:      string
  lat:      number
  lng:      number
  priority: string
  category: string
  title:    string
}

export async function GET() {
  try {
    await connectDB()

    // Only fetch documents that have coordinates — the sparse index makes this fast
    const docs = await Complaint.find(
      { 'coordinates.lat': { $exists: true } },
      {
        _id:                 1,
        title:               1,
        priority:            1,
        category:            1,
        'coordinates.lat':   1,
        'coordinates.lng':   1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(500)   // safety cap — map doesn't need more than 500 dots at once
      .lean()

    const dots: ComplaintDot[] = docs.map((d) => ({
      _id:      String(d._id),
      lat:      d.coordinates!.lat,
      lng:      d.coordinates!.lng,
      priority: d.priority,
      category: d.category,
      title:    d.title,
    }))

    return NextResponse.json(dots)
  } catch (err) {
    console.error('[GET /api/map/dots]', err)
    return NextResponse.json(
      { error: 'Failed to fetch complaint dots' } satisfies ApiError,
      { status: 500 }
    )
  }
}
