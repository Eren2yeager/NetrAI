// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — PriorityScoreBar
// Horizontal bar showing AI priority score (0–100) with colour coding,
// the numeric score, and the one-line AI reason text.
//
// Colour thresholds (match PRIORITY_THRESHOLDS in constants):
//   80–100  critical  #DC2626
//   60–79   high      #D97706
//   40–59   medium    #2563EB
//   0–39    low       #16A34A
//
// Used inside ComplaintTable rows and any complaint card.
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return '#DC2626'
  if (score >= 60) return '#D97706'
  if (score >= 40) return '#2563EB'
  return '#16A34A'
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PriorityScoreBarProps {
  score:   number   // 0–100
  reason?: string   // one-sentence AI explanation — optional
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriorityScoreBar({ score, reason }: PriorityScoreBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const color        = scoreColor(clampedScore)

  return (
    <div className="space-y-1 min-w-[120px]">
      {/* Score number + bar on the same row */}
      <div className="flex items-center gap-2">
        {/* Numeric score */}
        <span
          className="text-xs font-bold tabular-nums w-7 shrink-0"
          style={{ color }}
        >
          {clampedScore}
        </span>

        {/* Bar track */}
        <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:           `${clampedScore}%`,
              backgroundColor: color,
            }}
            role="progressbar"
            aria-valuenow={clampedScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Priority score: ${clampedScore} out of 100`}
          />
        </div>
      </div>

      {/* AI reason — only shown when provided */}
      {reason && (
        <p className="text-[11px] text-ink-400 leading-snug line-clamp-2">
          {reason}
        </p>
      )}
    </div>
  )
}
