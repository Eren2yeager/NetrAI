'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Simulator Result
// Animated reveal of estimated impact metrics after Gemini simulation.
// Uses Framer Motion AnimatePresence for the appearance transition.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion'
import { TrendingDown, Clock, Users, ShieldCheck, Gauge } from 'lucide-react'
import type { PolicySimulation } from '@/types'

interface SimulatorResultProps {
  result: PolicySimulation
}

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-50 text-status-success border-green-200' :
    score >= 65 ? 'bg-amber-50 text-status-warning border-amber-200' :
                  'bg-red-50 text-status-critical border-red-200'

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
      <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
      {score}% confidence
    </div>
  )
}

function StatRow({
  icon: Icon,
  label,
  value,
  valueClass = 'text-ink-900',
}: {
  icon: React.ElementType
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-surface-200 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-400 mb-0.5">{label}</p>
        <p className={`text-sm font-semibold leading-snug ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}

export default function SimulatorResult({ result }: SimulatorResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: 8  }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink-900">
            Estimated Impact
          </h3>
          <p className="text-xs text-ink-400 mt-0.5">
            {result.district} · {result.resourceCount} resources deployed
          </p>
        </div>
        <ConfidenceBadge score={result.confidenceScore} />
      </div>

      {/* Proposed action recap */}
      <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
        <p className="text-xs text-ink-400 mb-1">Proposed action</p>
        <p className="text-sm text-ink-900 font-medium leading-snug">
          &ldquo;{result.action}&rdquo;
        </p>
      </div>

      {/* Metric cards */}
      <div className="bg-surface-0 border border-surface-200 rounded-xl px-4 divide-y divide-surface-200">
        <StatRow
          icon={TrendingDown}
          label="Estimated complaint reduction (7 days)"
          value={`${result.estimatedComplaintReduction.toLocaleString('en-IN')} complaints resolved`}
          valueClass="text-status-success"
        />
        <StatRow
          icon={Clock}
          label="Resolution time improvement"
          value={result.estimatedResolutionImprovement}
        />
        <StatRow
          icon={Users}
          label="Citizens benefited"
          value={result.estimatedCitizensBenefited.toLocaleString('en-IN')}
        />
        <StatRow
          icon={ShieldCheck}
          label="SLA impact"
          value={result.slaImpact}
        />
      </div>
    </motion.div>
  )
}
