'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Citizen Complaint Form
// 3-step form: Details → Location → Confirm
// Reference: Stitch Call 3 — category card grid, progress bar, input styles.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
  Droplets, Zap, Construction, Trash2, Heart, MoreHorizontal,
  ChevronRight, ChevronLeft, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPLAINT_CATEGORIES, DELHI_DISTRICTS } from '@/constants'
import type { ComplaintCategory, ComplaintFormData } from '@/types'
import SubmitSuccess from './SubmitSuccess'

// ── Coordinates type (mirrors model) ─────────────────────────────────────────

export interface ComplaintCoordinates {
  lat:       number
  lng:       number
  accuracy?: number
  source:    'gps' | 'pin'
}

// ── Category icons map ────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<ComplaintCategory, React.ElementType> = {
  water:       Droplets,
  electricity: Zap,
  roads:       Construction,
  sanitation:  Trash2,
  health:      Heart,
  other:       MoreHorizontal,
}

// ── Step progress bar ─────────────────────────────────────────────────────────

const STEPS = ['Details', 'Location', 'Confirm'] as const

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const isComplete = i < current
        const isActive   = i === current

        return (
          <div key={label} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  isActive   && 'bg-brand-500 border-brand-500 text-white',
                  isComplete && 'bg-brand-500 border-brand-500 text-white',
                  !isActive && !isComplete && 'bg-surface-0 border-surface-300 text-ink-400'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive || isComplete ? 'text-brand-500' : 'text-ink-400'
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-16 h-px mt-[-14px] mx-1',
                  i < current ? 'bg-brand-500' : 'bg-surface-300'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Input component ───────────────────────────────────────────────────────────

function FormInput({
  label, id, optional, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  optional?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-600 mb-1.5">
        {label}
        {optional && <span className="text-ink-400 font-normal ml-1">(optional)</span>}
      </label>
      <input
        id={id}
        className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        {...props}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface ComplaintFormProps {
  /** GPS or pin-drop coordinates — captured by parent LocationCapture component */
  coordinates?: ComplaintCoordinates | null
}

export default function ComplaintForm({ coordinates }: ComplaintFormProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [complaintRef, setComplaintRef] = useState<string | null>(null)

  const [form, setForm] = useState<ComplaintFormData>({
    category:     'water',
    title:        '',
    description:  '',
    district:     '',
    ward:         '',
    citizenName:  '',
    citizenPhone: '',
  })

  function update(patch: Partial<ComplaintFormData>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  // ── Step validation ─────────────────────────────────────────────────────────

  function step1Valid() {
    return form.category && form.title.trim().length >= 5 && form.description.trim().length >= 10
  }

  function step2Valid() {
    return form.district.length > 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/complaints', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title:        form.title.trim(),
          description:  form.description.trim(),
          category:     form.category,
          district:     form.district,
          ward:         form.ward?.trim()         || undefined,
          citizenName:  form.citizenName?.trim()  || undefined,
          citizenPhone: form.citizenPhone?.trim() || undefined,
          // Include coordinates if captured — dot appears on map immediately
          ...(coordinates ? { coordinates } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error ?? 'Submission failed. Please try again.')
        return
      }

      setComplaintRef(data.complaintRef)
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────

  if (complaintRef) {
    return <SubmitSuccess complaintRef={complaintRef} />
  }

  // ── Step 1 — Details ────────────────────────────────────────────────────────

  const step1 = (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-900">What is the issue?</h3>

      {/* Category card grid — 2×3, matches Stitch Call 3 */}
      <div className="grid grid-cols-3 gap-2.5">
        {COMPLAINT_CATEGORIES.map(({ value, label }) => {
          const Icon     = CATEGORY_ICONS[value]
          const selected = form.category === value

          return (
            <button
              key={value}
              type="button"
              onClick={() => update({ category: value })}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all text-center',
                selected
                  ? 'bg-brand-100 border-brand-500 border-2'
                  : 'bg-surface-0 border-surface-200 hover:border-brand-200 hover:bg-brand-50'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  selected ? 'text-brand-500' : 'text-ink-400'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium leading-tight',
                  selected ? 'text-brand-700' : 'text-ink-600'
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Text fields */}
      <FormInput
        label="Title"
        id="title"
        placeholder="e.g. Water supply disrupted for 3 days"
        value={form.title}
        onChange={(e) => update({ title: e.target.value })}
        maxLength={200}
        required
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink-600 mb-1.5">
          Describe the issue
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Describe what happened, when it started, and how it is affecting you..."
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          maxLength={2000}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
        />
      </div>

      <FormInput
        label="Your name" id="citizenName" optional
        placeholder="Rahul Sharma"
        value={form.citizenName}
        onChange={(e) => update({ citizenName: e.target.value })}
      />

      <FormInput
        label="Phone number" id="citizenPhone" optional
        type="tel"
        placeholder="98XXXXXXXX"
        value={form.citizenPhone}
        onChange={(e) => update({ citizenPhone: e.target.value })}
      />
    </div>
  )

  // ── Step 2 — Location ───────────────────────────────────────────────────────

  const step2 = (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-ink-900">Where is the issue?</h3>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-ink-600 mb-1.5">
          District <span className="text-status-critical">*</span>
        </label>
        <select
          id="district"
          value={form.district}
          onChange={(e) => update({ district: e.target.value })}
          required
          className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition appearance-none"
        >
          <option value="">Select your district</option>
          {DELHI_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <FormInput
        label="Ward / Locality" id="ward" optional
        placeholder="e.g. Laxmi Nagar, Ward 42"
        value={form.ward}
        onChange={(e) => update({ ward: e.target.value })}
      />
    </div>
  )

  // ── Step 3 — Confirm ────────────────────────────────────────────────────────

  const categoryLabel = COMPLAINT_CATEGORIES.find((c) => c.value === form.category)?.label

  const step3 = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ink-900">Review your complaint</h3>
      <p className="text-sm text-ink-600">Please confirm the details before submitting.</p>

      <div className="bg-surface-50 border border-surface-200 rounded-xl divide-y divide-surface-200">
        {[
          { label: 'Category',    value: categoryLabel      },
          { label: 'Title',       value: form.title         },
          { label: 'Description', value: form.description   },
          { label: 'District',    value: form.district      },
          form.ward         ? { label: 'Ward',     value: form.ward         } : null,
          form.citizenName  ? { label: 'Name',     value: form.citizenName  } : null,
          form.citizenPhone ? { label: 'Phone',    value: form.citizenPhone } : null,
        ]
          .filter(Boolean)
          .map((row) => (
            <div key={row!.label} className="flex gap-4 px-4 py-3">
              <span className="text-xs font-medium text-ink-400 w-24 shrink-0 pt-0.5">
                {row!.label}
              </span>
              <span className="text-sm text-ink-900 break-words min-w-0">
                {row!.value}
              </span>
            </div>
          ))}
      </div>

      {submitError && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-status-critical">
          {submitError}
        </div>
      )}
    </div>
  )

  const steps = [step1, step2, step3]

  // ── Navigation ──────────────────────────────────────────────────────────────

  const canNext = step === 0 ? step1Valid() : step === 1 ? step2Valid() : true

  return (
    <div>
      <ProgressBar current={step} />

      {/* Step content */}
      <div className="min-h-[320px]">
        {steps[step]}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 h-12 px-5 rounded-lg border border-surface-200 text-sm font-medium text-ink-600 hover:bg-surface-50 transition"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: {STEPS[step + 1]}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? 'Submitting…' : 'Submit complaint'}
          </button>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-ink-400 mt-4">
        Your complaint will be reviewed within 24 hours.
        A complaint ID will be generated on submission.
      </p>
    </div>
  )
}
