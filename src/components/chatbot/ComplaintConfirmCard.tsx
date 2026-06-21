'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ComplaintConfirmCard
// Shown below the chat when the AI has extracted enough complaint details.
// Reference: Stitch Call 6 — white card, 2px brand-500 border, #EEF2FF tint,
//            2-column field grid, Edit / Confirm buttons.
//
// Props:
//   data       — AI-extracted complaint fields
//   imageUrl   — optional Cloudinary URL of the attached image
//   onConfirm  — user confirmed → register the complaint
//   onEdit     — user wants to correct details → scrolls back to chat
//   isLoading  — disable buttons while registration is in progress
// ─────────────────────────────────────────────────────────────────────────────

import { CheckCircle2, Loader2 } from 'lucide-react'
import { COMPLAINT_CATEGORIES } from '@/constants'
import type { ComplaintCategory, ComplaintPriority } from '@/types'

// ── Extracted complaint shape (returned by /api/chatbot/citizen) ──────────────

export interface ExtractedComplaint {
  title:       string
  description: string
  category:    ComplaintCategory
  district:    string
  priority?:   ComplaintPriority   // AI-inferred, not final
}

// ── Priority badge colours ────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<ComplaintPriority, { bg: string; text: string }> = {
  critical: { bg: '#FEF2F2', text: '#DC2626' },
  high:     { bg: '#FEF3C7', text: '#D97706' },
  medium:   { bg: '#EFF6FF', text: '#2563EB' },
  low:      { bg: '#F0FDF4', text: '#16A34A' },
}

// ── Tag pill ──────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
      style={{ backgroundColor: '#E0E7FF', color: '#1E1B4B' }}
    >
      {label}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ComplaintConfirmCardProps {
  data:       ExtractedComplaint
  imageUrl?:  string
  onConfirm:  () => void
  onEdit:     () => void
  isLoading:  boolean
}

export default function ComplaintConfirmCard({
  data,
  imageUrl,
  onConfirm,
  onEdit,
  isLoading,
}: ComplaintConfirmCardProps) {
  const catLabel =
    COMPLAINT_CATEGORIES.find((c) => c.value === data.category)?.label ?? data.category
  const priority     = data.priority ?? 'medium'
  const priStyle     = PRIORITY_STYLE[priority]
  const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1)

  return (
    <div
      className="rounded-xl border-2 p-5 space-y-4"
      style={{ borderColor: '#4F46E5', backgroundColor: '#EEF2FF' }}
      role="region"
      aria-label="Extracted complaint details — please confirm"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#4F46E5' }} aria-hidden="true" />
        <p className="text-sm font-bold" style={{ color: '#4F46E5' }}>
          Complaint Details Extracted
        </p>
      </div>

      {/* Fields grid */}
      <div className="bg-surface-0 rounded-lg border border-surface-200 divide-y divide-surface-200 overflow-hidden">

        {/* Category + District — side by side */}
        <div className="grid grid-cols-2 divide-x divide-surface-200">
          <div className="px-4 py-3 space-y-1">
            <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Category</p>
            <Tag label={catLabel} />
          </div>
          <div className="px-4 py-3 space-y-1">
            <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">District</p>
            <Tag label={data.district} />
          </div>
        </div>

        {/* Title */}
        <div className="px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Title</p>
          <p className="text-sm font-medium text-ink-900">{data.title}</p>
        </div>

        {/* Description — truncated, not editable here */}
        <div className="px-4 py-3 space-y-1">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Description</p>
          <p className="text-sm text-ink-600 line-clamp-3">{data.description}</p>
        </div>

        {/* Priority + optional image */}
        <div className={`px-4 py-3 flex items-start gap-4 ${imageUrl ? 'justify-between' : ''}`}>
          <div className="space-y-1">
            <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Priority</p>
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-bold"
              style={{ backgroundColor: priStyle.bg, color: priStyle.text }}
            >
              {priorityText}
            </span>
          </div>

          {/* Attached image thumbnail */}
          {imageUrl && (
            <div className="space-y-1 text-right">
              <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Attached complaint photo"
                className="w-20 h-14 object-cover rounded-lg border border-surface-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={isLoading}
          className="flex-1 h-11 rounded-xl border-2 text-sm font-medium transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-brand-50"
          style={{ borderColor: '#4F46E5', color: '#4F46E5' }}
        >
          Edit Details
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 h-11 rounded-xl text-sm font-medium text-white transition
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#4F46E5' }}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isLoading ? 'Submitting…' : 'Confirm & Submit'}
        </button>
      </div>
    </div>
  )
}
