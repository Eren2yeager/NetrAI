// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Briefing Model
// One document per calendar day. The /api/briefing route checks for today's
// document first — if found, returns cached; if not, generates via Gemini
// and saves here. Prevents repeated AI calls for the same day.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'
import type { BriefingPriority } from '@/types'

// ── Document Interface ────────────────────────────────────────────────────────

export interface IBriefing extends Document {
  date: string                      // 'YYYY-MM-DD' — one document per day
  summary: string                   // AI-generated paragraph for the CM
  topPriorities: BriefingPriority[] // ordered list of action items
  governanceScore: number           // 0–100
  scoreChange: number               // delta vs yesterday (can be negative)
  generatedAt: Date
}

// ── Priority Sub-Schema ───────────────────────────────────────────────────────

const BriefingPrioritySchema = new Schema<BriefingPriority>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    recommendedAction: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    affectedCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
)

// ── Main Schema ───────────────────────────────────────────────────────────────

const BriefingSchema = new Schema<IBriefing>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}-\d{2}$/,  // enforce 'YYYY-MM-DD' format
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    topPriorities: {
      type: [BriefingPrioritySchema],
      default: [],
    },
    governanceScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    scoreChange: {
      type: Number,
      default: 0,  // 0 on first day — no previous day to compare
    },
    generatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,  // generatedAt handles this explicitly
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Primary cache lookup — /api/briefing queries by date string
BriefingSchema.index({ date: 1 }, { unique: true })

// ── Model Export (singleton-safe) ─────────────────────────────────────────────

const Briefing: Model<IBriefing> =
  (models.Briefing as Model<IBriefing>) ||
  mongoose.model<IBriefing>('Briefing', BriefingSchema)

export default Briefing
