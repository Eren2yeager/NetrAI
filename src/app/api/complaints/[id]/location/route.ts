// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/complaints/[id]/location
// POST — attach or update GPS / pin-drop coordinates on an existing complaint.
//
// Called in two situations:
//   1. GPS resolves after form submission — citizen form POSTs the complaint
//      first (fast), then fires this endpoint once navigator.geolocation settles.
//   2. Citizen drops a pin on the fallback Leaflet map — coordinates come from
//      a click event, source = 'pin'.
//
// Body: { lat: number, lng: number, accuracy?: number, source: 'gps' | 'pin' }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import type { ApiError } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const body: {
      lat:       number
      lng:       number
      accuracy?: number
      source?:   'gps' | 'pin'
    } = await req.json()

    // Validate required fields
    if (body.lat == null || body.lng == null) {
      return NextResponse.json(
        { error: 'lat and lng are required' } satisfies ApiError,
        { status: 400 }
      )
    }

    // Sanity-check coordinate ranges (Delhi is roughly 28.4–28.9 N, 76.8–77.4 E)
    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinate values' } satisfies ApiError,
        { status: 400 }
      )
    }

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' } satisfies ApiError,
        { status: 404 }
      )
    }

    complaint.coordinates = {
      lat,
      lng,
      accuracy: body.accuracy != null ? Number(body.accuracy) : undefined,
      source:   body.source === 'pin' ? 'pin' : 'gps',
    }

    await complaint.save()

    return NextResponse.json(
      { success: true, coordinates: complaint.coordinates },
      { status: 200 }
    )
  } catch (err) {
    console.error('[POST /api/complaints/[id]/location]', err)
    return NextResponse.json(
      { error: 'Failed to update location' } satisfies ApiError,
      { status: 500 }
    )
  }
}
