'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Map Filters
// Category dropdown + date range — filters the choropleth data.
// Reference: Stitch Call 2 top bar right side.
// ─────────────────────────────────────────────────────────────────────────────

import { COMPLAINT_CATEGORIES } from '@/constants'
import type { ComplaintCategory } from '@/types'

export interface MapFilterState {
  category: ComplaintCategory | 'all'
  days:     7 | 14 | 30 | 90
}

interface MapFiltersProps {
  filters:   MapFilterState
  onChange:  (filters: MapFilterState) => void
}

const DATE_OPTIONS: { label: string; value: MapFilterState['days'] }[] = [
  { label: 'Last 7 days',  value: 7  },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
]

const inputClass =
  'h-9 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition appearance-none'

export default function MapFilters({ filters, onChange }: MapFiltersProps) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Map filters">

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="map-category" className="text-xs font-medium text-ink-400 whitespace-nowrap">
          Category
        </label>
        <select
          id="map-category"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as MapFilterState['category'] })}
          className={inputClass}
        >
          <option value="all">All categories</option>
          {COMPLAINT_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="map-days" className="text-xs font-medium text-ink-400 whitespace-nowrap">
          Period
        </label>
        <select
          id="map-days"
          value={filters.days}
          onChange={(e) => onChange({ ...filters, days: parseInt(e.target.value) as MapFilterState['days'] })}
          className={inputClass}
        >
          {DATE_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
