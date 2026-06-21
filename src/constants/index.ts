// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Application Constants
// Single source of truth for all static data: districts, categories, SLA rules,
// priority thresholds, department slugs, and demo credentials.
// ─────────────────────────────────────────────────────────────────────────────

import type { ComplaintCategory, ComplaintPriority, UserRole } from '@/types'

// ── Delhi Districts ───────────────────────────────────────────────────────────

export const DELHI_DISTRICTS = [
  'Central Delhi',
  'East Delhi',
  'New Delhi',
  'North Delhi',
  'North East Delhi',
  'North West Delhi',
  'Shahdara',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'West Delhi',
] as const

export type DelhiDistrict = (typeof DELHI_DISTRICTS)[number]

// ── Complaint Categories ──────────────────────────────────────────────────────

export const COMPLAINT_CATEGORIES: {
  value: ComplaintCategory
  label: string
  dept: string | null
  icon: string  // emoji fallback — replaced by SVG in UI
}[] = [
  { value: 'water',       label: 'Water Supply',       dept: 'water',       icon: '💧' },
  { value: 'electricity', label: 'Electricity',         dept: 'electricity', icon: '⚡' },
  { value: 'roads',       label: 'Roads & Infrastructure', dept: 'roads',   icon: '🛣️' },
  { value: 'sanitation',  label: 'Sanitation',          dept: 'sanitation',  icon: '🗑️' },
  { value: 'health',      label: 'Public Health',       dept: 'health',      icon: '🏥' },
  { value: 'other',       label: 'Other',               dept: null,          icon: '📋' },
]

// ── SLA Rules — hours to resolve, per category ────────────────────────────────

export const SLA_RULES: Record<ComplaintCategory, number> = {
  water:       24,
  electricity: 12,
  roads:       72,
  sanitation:  48,
  health:       6,
  other:       48,
}

// ── Priority Score Thresholds (0–100) ─────────────────────────────────────────

export const PRIORITY_THRESHOLDS: Record<ComplaintPriority, number> = {
  critical: 80,  // score >= 80
  high:     60,  // score >= 60
  medium:   40,  // score >= 40
  low:       0,  // score >= 0
}

// ── Department Slugs ──────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  { slug: 'water',       name: 'Delhi Jal Board',         category: 'water'       },
  { slug: 'electricity', name: 'BSES / TPDDL',            category: 'electricity' },
  { slug: 'roads',       name: 'PWD',                     category: 'roads'       },
  { slug: 'sanitation',  name: 'MCD Sanitation',          category: 'sanitation'  },
  { slug: 'health',      name: 'Delhi Health Services',   category: 'health'      },
] as const

export type DepartmentSlug = (typeof DEPARTMENTS)[number]['slug']

// ── Demo Users ────────────────────────────────────────────────────────────────

export const DEMO_USERS: {
  email: string
  password: string
  role: UserRole
  name: string
}[] = [
  {
    email:    'cm@netraai.gov.in',
    password: 'demo123',
    role:     'cm',
    name:     'Chief Minister',
  },
  {
    email:    'dept@netraai.gov.in',
    password: 'demo123',
    role:     'dept_head',
    name:     'Dept Head — Water',
  },
  {
    email:    'officer@netraai.gov.in',
    password: 'demo123',
    role:     'field_officer',
    name:     'Field Officer',
  },
]

// ── Governance Score Thresholds ───────────────────────────────────────────────
// Used to color the GovernanceScoreRing component

export const GOVERNANCE_SCORE_THRESHOLDS = {
  good:    80,   // >= 80 → #16A34A (success green)
  warning: 60,   // >= 60 → #D97706 (amber)
  // < 60 → #DC2626 (critical red)
} as const

// ── SLA Warning Window ────────────────────────────────────────────────────────
// How many hours before breach to show 'warning' state on SLABadge

export const SLA_WARNING_HOURS = 3

// ── Pagination Defaults ───────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20

// ── Cron / API auth header key ────────────────────────────────────────────────

export const CRON_SECRET_HEADER = 'x-cron-secret'

// ── Complaint ID prefix ───────────────────────────────────────────────────────

export const COMPLAINT_ID_PREFIX = 'DEL'
