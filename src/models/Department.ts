// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Model
// One document per department. Stats are updated when complaints are resolved
// or when the SLA cron runs. Grade is AI-computed from performance metrics.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'

// ── Document Interface ────────────────────────────────────────────────────────

export interface IDepartment extends Document {
  name: string
  slug: string              // 'water' | 'electricity' | 'roads' | 'sanitation' | 'health'
  headName: string
  grade: string             // AI computed: 'A', 'A-', 'B+', 'B', 'C', 'D', 'F'
  slaComplianceRate: number // 0–100 percentage
  avgResolutionDays: number
  openCount: number
  resolvedCount: number
  lastUpdated: Date
}

// ── Schema ────────────────────────────────────────────────────────────────────

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: ['water', 'electricity', 'roads', 'sanitation', 'health'],
    },
    headName: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      default: 'B',
      trim: true,
    },
    slaComplianceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    avgResolutionDays: {
      type: Number,
      min: 0,
      default: 0,
    },
    openCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    resolvedCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Department scoreboard sort — by SLA compliance descending
DepartmentSchema.index({ slaComplianceRate: -1 })

// ── Model Export (singleton-safe) ─────────────────────────────────────────────

const Department: Model<IDepartment> =
  (models.Department as Model<IDepartment>) ||
  mongoose.model<IDepartment>('Department', DepartmentSchema)

export default Department
