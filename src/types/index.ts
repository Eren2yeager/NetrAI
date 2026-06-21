// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Shared TypeScript Types
// All interfaces and enums used across models, API routes, and UI components.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums / Union Types ───────────────────────────────────────────────────────

export type ComplaintStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'escalated'

export type ComplaintCategory =
  | 'water'
  | 'electricity'
  | 'roads'
  | 'sanitation'
  | 'health'
  | 'other'

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

export type UserRole = 'cm' | 'dept_head' | 'field_officer' | 'citizen'

export type SentimentValue = 'positive' | 'neutral' | 'negative'

export type SLAStatus = 'ok' | 'warning' | 'breached'

export type DensityLevel = 'high' | 'medium' | 'low'

// ── Map / District ────────────────────────────────────────────────────────────

export interface DistrictData {
  name: string
  complaintCount: number
  criticalCount: number
  density: DensityLevel
  topCategory: string
  avgResolutionDays: number
  sentiment: SentimentValue
  trustScore: number
}

// ── KPI ───────────────────────────────────────────────────────────────────────

export interface KPIData {
  openComplaints: number
  criticalComplaints: number
  resolvedPercent: number
  avgResolutionDays: number
  slaCompliancePercent: number
}

// ── Policy Simulator ──────────────────────────────────────────────────────────

export interface PolicySimulation {
  /** e.g. "Deploy 10 water repair teams to East Delhi" */
  action: string
  district: string
  resourceCount: number
  estimatedComplaintReduction: number
  estimatedResolutionImprovement: string
  estimatedCitizensBenefited: number
  slaImpact: string
  confidenceScore: number
}

// ── AI Briefing ───────────────────────────────────────────────────────────────

export interface AIBriefingInput {
  kpis: KPIData
  topDistrictByComplaints: string
  criticalComplaints: {
    title: string
    district: string
    affectedCount: number
  }[]
  slaBreaches: {
    department: string
    count: number
  }[]
  date: string
}

export interface BriefingPriority {
  title: string
  description: string
  recommendedAction: string
  district: string
  affectedCount: number
}

// ── Complaint Timeline Entry ──────────────────────────────────────────────────

export interface TimelineEntry {
  status: ComplaintStatus
  timestamp: Date
  note?: string
}

// ── AI Priority Scoring ───────────────────────────────────────────────────────

export interface AIPriorityResult {
  score: number
  reason: string
  priority: ComplaintPriority
}

// ── AI Clustering ─────────────────────────────────────────────────────────────

export interface AIClusterResult {
  clusterId?: string
  matchCount: number
  isNew: boolean
}

// ── Sentiment Map ─────────────────────────────────────────────────────────────

export type DistrictSentimentMap = Record<string, SentimentValue>

// ── API Response Wrappers ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  error: string
  details?: string
}

// ── Complaint Form (citizen-facing) ──────────────────────────────────────────

export interface ComplaintFormData {
  category: ComplaintCategory
  title: string
  description: string
  district: string
  ward?: string
  citizenName?: string
  citizenPhone?: string
}

// ── NextAuth session extension ────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      department?: string
    }
  }

  interface User {
    role: UserRole
    department?: string
  }

  interface JWT {
    role: UserRole
    department?: string
  }
}
