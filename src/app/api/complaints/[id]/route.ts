// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — /api/complaints/[id]
// GET   — single complaint detail
// PATCH — update status, afterPhotoUrl, or citizenConfirmed
//         Pushes a timeline entry on every status change.
//         If status → 'resolved', updates department resolved/open counts.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import Department from '@/models/Department'
import type { ComplaintStatus, ApiError } from '@/types'

// ── GET /api/complaints/[id] ──────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const complaint = await Complaint.findById(id).lean()

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' } satisfies ApiError,
        { status: 404 }
      )
    }

    return NextResponse.json(complaint)
  } catch (err) {
    console.error('[GET /api/complaints/[id]]', err)
    return NextResponse.json(
      { error: 'Failed to fetch complaint' } satisfies ApiError,
      { status: 500 }
    )
  }
}

// ── PATCH /api/complaints/[id] ────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body: {
      status?:           ComplaintStatus
      afterPhotoUrl?:    string
      citizenConfirmed?: boolean
      note?:             string
    } = await req.json()

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' } satisfies ApiError,
        { status: 404 }
      )
    }

    const previousStatus = complaint.status

    // Apply updates
    if (body.status        !== undefined) complaint.status           = body.status
    if (body.afterPhotoUrl !== undefined) complaint.afterPhotoUrl    = body.afterPhotoUrl
    if (body.citizenConfirmed !== undefined) complaint.citizenConfirmed = body.citizenConfirmed

    // Push timeline entry on status change
    if (body.status && body.status !== previousStatus) {
      complaint.timeline.push({
        status:    body.status,
        timestamp: new Date(),
        note:      body.note ?? `Status changed to ${body.status}`,
      })
    }

    await complaint.save()

    // ── Update department stats on resolution ─────────────────────────────────
    if (body.status === 'resolved' && previousStatus !== 'resolved' && complaint.assignedDept) {
      const [openCount, resolvedCount] = await Promise.all([
        Complaint.countDocuments({
          assignedDept: complaint.assignedDept,
          status:       { $nin: ['resolved'] },
        }),
        Complaint.countDocuments({
          assignedDept: complaint.assignedDept,
          status:       'resolved',
        }),
      ])

      await Department.updateOne(
        { slug: complaint.assignedDept },
        { $set: { openCount, resolvedCount, lastUpdated: new Date() } }
      )
    }

    return NextResponse.json(complaint.toObject())
  } catch (err) {
    console.error('[PATCH /api/complaints/[id]]', err)
    return NextResponse.json(
      { error: 'Failed to update complaint' } satisfies ApiError,
      { status: 500 }
    )
  }
}
