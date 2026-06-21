// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Complaint Model
// Core document: citizen-submitted issue with AI scoring, SLA tracking,
// clustering, and a full status timeline.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model, models } from 'mongoose'
import type {
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPriority,
  SentimentValue,
  TimelineEntry,
} from '@/types'

// ── Document Interface ────────────────────────────────────────────────────────

export interface IComplaint extends Document {
  title: string
  description: string
  category: ComplaintCategory
  district: string
  ward?: string

  // Status & priority
  status: ComplaintStatus
  priority: ComplaintPriority
  priorityScore: number           // 0–100, Gemini generated
  priorityReason: string          // one-sentence AI explanation

  // Citizen info (optional — public form)
  citizenName?: string
  citizenPhone?: string

  // Assignment
  assignedDept?: string
  assignedOfficer?: mongoose.Types.ObjectId

  // Clustering
  clusterId?: mongoose.Types.ObjectId

  // SLA
  slaDeadline: Date
  slaBreached: boolean

  // Photo evidence
  beforePhotoUrl?: string
  afterPhotoUrl?: string

  // Citizen resolution confirmation
  citizenConfirmed?: boolean

  // GPS / pin-drop coordinates (Phase 9)
  coordinates?: {
    lat: number
    lng: number
    accuracy?: number       // GPS accuracy in metres
    source: 'gps' | 'pin'  // how location was captured
  }

  // Submission channel (Phase 10)
  submissionMode: 'form' | 'chatbot'

  // AI enrichment
  sentiment?: SentimentValue
  estimatedCitizensAffected: number

  // Audit trail
  timeline: TimelineEntry[]

  // Mongoose timestamps
  createdAt: Date
  updatedAt: Date
}

// ── Coordinates Sub-Schema ───────────────────────────────────────────────────

interface CoordinatesDoc {
  lat: number
  lng: number
  accuracy?: number
  source: 'gps' | 'pin'
}

const CoordinatesSchema = new Schema<CoordinatesDoc>(
  {
    lat:      { type: Number, required: true },
    lng:      { type: Number, required: true },
    accuracy: { type: Number },
    source:   { type: String, enum: ['gps', 'pin'], required: true },
  },
  { _id: false }
)

// ── Timeline Sub-Schema ───────────────────────────────────────────────────────

const TimelineEntrySchema = new Schema<TimelineEntry>(
  {
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'escalated'] satisfies ComplaintStatus[],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }  // sub-documents don't need their own _id
)

// ── Main Schema ───────────────────────────────────────────────────────────────

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['water', 'electricity', 'roads', 'sanitation', 'health', 'other'] satisfies ComplaintCategory[],
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
    },

    // Status & priority
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'escalated'] satisfies ComplaintStatus[],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'] satisfies ComplaintPriority[],
      default: 'medium',
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    priorityReason: {
      type: String,
      trim: true,
      default: '',
    },

    // Citizen info
    citizenName: {
      type: String,
      trim: true,
    },
    citizenPhone: {
      type: String,
      trim: true,
    },

    // Assignment
    assignedDept: {
      type: String,
      trim: true,
    },
    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // Clustering
    clusterId: {
      type: Schema.Types.ObjectId,
      ref: 'Cluster',
    },

    // SLA
    slaDeadline: {
      type: Date,
      required: true,
    },
    slaBreached: {
      type: Boolean,
      default: false,
    },

    // Photos
    beforePhotoUrl: {
      type: String,
      trim: true,
    },
    afterPhotoUrl: {
      type: String,
      trim: true,
    },

    // Resolution confirmation
    citizenConfirmed: {
      type: Boolean,
    },

    // GPS / pin-drop coordinates (Phase 9)
    coordinates: {
      type: CoordinatesSchema,
      default: undefined,
    },

    // Submission channel — 'form' (3-step) or 'chatbot' (Phase 10)
    submissionMode: {
      type:    String,
      enum:    ['form', 'chatbot'],
      default: 'form',
    },

    // AI enrichment
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'] satisfies SentimentValue[],
    },
    estimatedCitizensAffected: {
      type: Number,
      min: 1,
      default: 1,
    },

    // Audit trail
    timeline: {
      type: [TimelineEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,  // auto-manages createdAt + updatedAt
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────

// Most common dashboard query: unresolved complaints by district
ComplaintSchema.index({ district: 1, status: 1 })

// SLA cron job: find breached-but-unflagged complaints fast
ComplaintSchema.index({ slaDeadline: 1, slaBreached: 1 })

// Map aggregation: group by district + category
ComplaintSchema.index({ category: 1, district: 1 })

// Priority list: sort by score descending
ComplaintSchema.index({ priorityScore: -1 })

// Clustering: find recent same-district/category complaints
ComplaintSchema.index({ district: 1, category: 1, createdAt: -1 })

// Map dots: find complaints with coordinates fast (sparse — most won't have them)
ComplaintSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 }, { sparse: true })

// ── Model Export (singleton-safe for Next.js hot reload) ─────────────────────

const Complaint: Model<IComplaint> =
  (models.Complaint as Model<IComplaint>) ||
  mongoose.model<IComplaint>('Complaint', ComplaintSchema)

export default Complaint
