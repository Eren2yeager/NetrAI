// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Cluster Model
// Groups duplicate complaints about the same physical issue into one document.
// Created and updated by the /api/ai/cluster route after Gemini matching.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'
import type { ComplaintCategory, ComplaintStatus } from '@/types'

// ── Document Interface ────────────────────────────────────────────────────────

export interface ICluster extends Document {
  title: string                                   // AI-generated merged title
  complaintIds: mongoose.Types.ObjectId[]         // all complaints in this cluster
  district: string
  category: ComplaintCategory
  totalCitizensAffected: number
  status: ComplaintStatus
  createdAt: Date
  updatedAt: Date
}

// ── Schema ────────────────────────────────────────────────────────────────────

const ClusterSchema = new Schema<ICluster>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    complaintIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Complaint',
      default: [],
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['water', 'electricity', 'roads', 'sanitation', 'health', 'other'] satisfies ComplaintCategory[],
      required: true,
    },
    totalCitizensAffected: {
      type: Number,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'escalated'] satisfies ComplaintStatus[],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Clustering query: find active clusters in same district + category
ClusterSchema.index({ district: 1, category: 1, status: 1 })

// ClusterCard lookup by individual complaint ID
ClusterSchema.index({ complaintIds: 1 })

// ── Model Export (singleton-safe) ─────────────────────────────────────────────

const Cluster: Model<ICluster> =
  (models.Cluster as Model<ICluster>) ||
  mongoose.model<ICluster>('Cluster', ClusterSchema)

export default Cluster
