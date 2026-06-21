// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — KPI Bar
// Row of 5 stat cards. Numbers at text-4xl, labels at text-xs text-ink-400.
// Reference: Stitch Call 1 — white cards, 1px border-surface-200, 12px radius.
// ─────────────────────────────────────────────────────────────────────────────

import type { KPIData } from '@/types'

interface KPIBarProps {
  kpis: KPIData
}

export default function KPIBar({ kpis }: KPIBarProps) {
  const cards = [
    {
      value:     kpis.openComplaints.toLocaleString('en-IN'),
      label:     'Open',
      valueClass: 'text-ink-900',
    },
    {
      value:     kpis.criticalComplaints.toLocaleString('en-IN'),
      label:     'Critical',
      valueClass: 'text-status-critical',
    },
    {
      value:     `${kpis.resolvedPercent}%`,
      label:     'Resolved',
      valueClass: kpis.resolvedPercent >= 80 ? 'text-status-success' : 'text-ink-900',
    },
    {
      value:     `${kpis.avgResolutionDays}d`,
      label:     'Avg Resolution',
      valueClass: 'text-ink-900',
    },
    {
      value:     `${kpis.slaCompliancePercent}%`,
      label:     'SLA Compliance',
      valueClass: kpis.slaCompliancePercent >= 85 ? 'text-status-success' : 'text-status-warning',
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map(({ value, label, valueClass }) => (
        <div
          key={label}
          className="bg-surface-0 border border-surface-200 rounded-xl p-6"
        >
          <p className={`text-4xl font-bold leading-none ${valueClass}`}>
            {value}
          </p>
          <p className="text-xs text-ink-400 mt-2">{label}</p>
        </div>
      ))}
    </div>
  )
}
