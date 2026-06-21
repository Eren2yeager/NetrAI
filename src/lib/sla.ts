// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — SLA Logic
// Pure functions — no DB calls, no side effects.
// Used by: POST /api/complaints, GET /api/sla/check, SLABadge component.
// ─────────────────────────────────────────────────────────────────────────────

import { SLA_RULES, PRIORITY_THRESHOLDS, SLA_WARNING_HOURS } from '@/constants'
import type { ComplaintCategory, ComplaintPriority, SLAStatus } from '@/types'

// ── Deadline Calculation ──────────────────────────────────────────────────────

/**
 * Returns the SLA deadline for a complaint based on its category.
 * Falls back to 48 hours for unknown categories.
 */
export function getSLADeadline(
  category: ComplaintCategory,
  createdAt: Date
): Date {
  const hours = SLA_RULES[category] ?? 48
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000)
}

// ── Status Check ──────────────────────────────────────────────────────────────

/**
 * Returns the current SLA status relative to now.
 * - 'ok'      → deadline is more than SLA_WARNING_HOURS away
 * - 'warning' → deadline is within SLA_WARNING_HOURS
 * - 'breached' → deadline has passed
 */
export function getSLAStatus(deadline: Date): SLAStatus {
  const remainingMs = deadline.getTime() - Date.now()

  if (remainingMs < 0) return 'breached'
  if (remainingMs < SLA_WARNING_HOURS * 60 * 60 * 1000) return 'warning'
  return 'ok'
}

// ── Remaining Time ────────────────────────────────────────────────────────────

/**
 * Returns milliseconds remaining until the SLA deadline.
 * Negative value means the deadline has already passed.
 */
export function getSLARemainingMs(deadline: Date): number {
  return deadline.getTime() - Date.now()
}

/**
 * Formats remaining SLA time as a human-readable string.
 * e.g. "4h 30m", "45m", "Breached"
 */
export function formatSLARemaining(deadline: Date): string {
  const remainingMs = getSLARemainingMs(deadline)

  if (remainingMs < 0) return 'Breached'

  const totalMinutes = Math.floor(remainingMs / (60 * 1000))
  const hours        = Math.floor(totalMinutes / 60)
  const minutes      = totalMinutes % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// ── Priority from Score ───────────────────────────────────────────────────────

/**
 * Converts a 0–100 AI priority score into a ComplaintPriority label.
 * Thresholds: critical >= 80, high >= 60, medium >= 40, low >= 0.
 */
export function getPriorityFromScore(score: number): ComplaintPriority {
  if (score >= PRIORITY_THRESHOLDS.critical) return 'critical'
  if (score >= PRIORITY_THRESHOLDS.high)     return 'high'
  if (score >= PRIORITY_THRESHOLDS.medium)   return 'medium'
  return 'low'
}

// ── Hours Remaining ───────────────────────────────────────────────────────────

/**
 * Returns hours remaining (float). Useful for sorting and display.
 */
export function getSLAHoursRemaining(deadline: Date): number {
  return getSLARemainingMs(deadline) / (60 * 60 * 1000)
}
