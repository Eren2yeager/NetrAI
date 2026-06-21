// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Map Legend
// Bottom-left overlay on the Leaflet map.
// Three density levels: High (#4F46E5) · Medium (#A5B4FC) · Low (#E0E7FF)
// ─────────────────────────────────────────────────────────────────────────────

export default function MapLegend() {
  const levels = [
    { label: 'High',   color: '#4F46E5' },
    { label: 'Medium', color: '#A5B4FC' },
    { label: 'Low',    color: '#E0E7FF' },
  ]

  return (
    <div className="bg-surface-0 border border-surface-200 rounded-xl px-3 py-2.5 shadow-sm">
      <p className="text-xs font-medium text-ink-400 mb-2 uppercase tracking-wide">
        Complaint density
      </p>
      <div className="flex flex-col gap-1.5">
        {levels.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-xs text-ink-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
