// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Submit Success
// Shown after a citizen successfully submits a complaint.
// Displays the generated complaint reference ID.
// ─────────────────────────────────────────────────────────────────────────────

import SubmitSuccessIllustration from '@/components/illustrations/SubmitSuccessIllustration'

interface SubmitSuccessProps {
  complaintRef: string
}

export default function SubmitSuccess({ complaintRef }: SubmitSuccessProps) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4">

      {/* Illustration */}
      <SubmitSuccessIllustration className="w-24 h-24 mb-5" />

      {/* Heading */}
      <h2 className="text-xl font-semibold text-ink-900 mb-2">
        Complaint received
      </h2>

      <p className="text-sm text-ink-600 mb-6 max-w-xs">
        Your complaint has been submitted to the Delhi Government.
        You will be notified when it is assigned and resolved.
      </p>

      {/* Complaint ID */}
      <div className="w-full bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-ink-400 mb-1">Your complaint ID</p>
        <p className="font-mono text-base font-semibold text-ink-900 tracking-wider">
          {complaintRef}
        </p>
        <p className="text-xs text-ink-400 mt-1">
          Save this ID to track the status of your complaint.
        </p>
      </div>

      {/* SLA note */}
      <p className="text-xs text-ink-400">
        Complaints are reviewed within 24 hours. Emergency issues are prioritised automatically.
      </p>

      {/* Submit another */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
      >
        Submit another complaint
      </button>
    </div>
  )
}
