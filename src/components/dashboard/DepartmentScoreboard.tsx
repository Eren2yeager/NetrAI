// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Department Scoreboard
// Clean table: Department | Grade | SLA % | Open.
// Grade colored: A=green, B=blue, C=amber, D/F=red.
// Reference: Stitch Call 1 right column.
// ─────────────────────────────────────────────────────────────────────────────

import type { IDepartment } from '@/models/Department'

interface DepartmentScoreboardProps {
  departments: Pick<IDepartment, 'name' | 'slug' | 'grade' | 'slaComplianceRate' | 'openCount'>[]
}

function gradeColor(grade: string): string {
  const g = grade.charAt(0).toUpperCase()
  if (g === 'A') return 'text-status-success'
  if (g === 'B') return 'text-status-info'
  if (g === 'C') return 'text-status-warning'
  return 'text-status-critical'
}

function slaColor(rate: number): string {
  if (rate >= 85) return 'text-status-success'
  if (rate >= 70) return 'text-status-warning'
  return 'text-status-critical'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ScoreboardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-surface-200 rounded flex-1" />
          <div className="h-4 bg-surface-200 rounded w-8" />
          <div className="h-4 bg-surface-200 rounded w-12" />
          <div className="h-4 bg-surface-200 rounded w-12" />
        </div>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DepartmentScoreboard({
  departments,
}: DepartmentScoreboardProps) {
  if (!departments || departments.length === 0) {
    return <ScoreboardSkeleton />
  }

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm" aria-label="Department performance">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50">
            <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
              Department
            </th>
            <th className="text-center px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
              Grade
            </th>
            <th className="text-right px-3 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
              SLA %
            </th>
            <th className="text-right px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wide">
              Open
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {departments.map((dept) => (
            <tr key={dept.slug} className="hover:bg-surface-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-ink-900">
                {dept.name}
              </td>
              <td className="px-3 py-3 text-center">
                <span className={`text-sm font-bold ${gradeColor(dept.grade)}`}>
                  {dept.grade}
                </span>
              </td>
              <td className={`px-3 py-3 text-right text-sm font-medium ${slaColor(dept.slaComplianceRate)}`}>
                {dept.slaComplianceRate}%
              </td>
              <td className="px-4 py-3 text-right text-sm text-ink-600">
                {dept.openCount.toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
