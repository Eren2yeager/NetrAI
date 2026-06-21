// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hero Dashboard Illustration
// Flat geometric SVG. Colors: #4F46E5 (brand-500) + #E0E7FF (brand-100)
// Abstract tilted dashboard card with KPI pills, district map, rows, score ring.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroDashboard({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* ── Background abstract shapes ── */}
      <circle cx="380" cy="60"  r="70" fill="#E0E7FF" opacity="0.45" />
      <circle cx="80"  cy="340" r="90" fill="#EEF2FF" opacity="0.55" />
      <rect x="20"  y="40"  width="50" height="50" rx="8" fill="#E0E7FF" opacity="0.35" />
      <rect x="400" y="290" width="60" height="60" rx="8" fill="#E0E7FF" opacity="0.3"  />
      <rect x="320" y="20"  width="30" height="30" rx="4" fill="#4F46E5" opacity="0.08" />
      <circle cx="150" cy="80" r="25"  fill="#EEF2FF" opacity="0.6" />

      {/* ── Main dashboard card (tilted 3deg clockwise) ── */}
      <g transform="rotate(3, 240, 210)">
        {/* Card shadow hint */}
        <rect x="70" y="82" width="310" height="260" rx="16"
              fill="#4F46E5" opacity="0.06" />
        {/* Card body */}
        <rect x="65" y="78" width="310" height="260" rx="16"
              fill="white" stroke="#E9ECEF" strokeWidth="1" />

        {/* ── Card header label ── */}
        <rect x="82" y="96" width="80" height="8" rx="2" fill="#E0E7FF" />

        {/* ── KPI pills row ── */}
        <rect x="82"  y="116" width="72" height="22" rx="11" fill="#4F46E5" />
        <rect x="162" y="116" width="72" height="22" rx="11" fill="#E0E7FF" />
        <rect x="242" y="116" width="72" height="22" rx="11" fill="#EEF2FF" />

        {/* KPI inner text bars */}
        <rect x="94"  y="123" width="40" height="6" rx="3" fill="white"   opacity="0.7" />
        <rect x="174" y="123" width="40" height="6" rx="3" fill="#4F46E5" opacity="0.5" />
        <rect x="254" y="123" width="40" height="6" rx="3" fill="#4F46E5" opacity="0.3" />

        {/* ── District map polygon ── */}
        {/* Map bounding area */}
        <rect x="82" y="152" width="170" height="120" rx="8"
              fill="#EEF2FF" opacity="0.6" />
        {/* Delhi-ish polygon shape */}
        <polygon
          points="110,162 180,155 230,168 240,200 235,248 200,260 155,258 108,240 90,210 95,175"
          fill="#E0E7FF"
        />
        {/* Highlighted district */}
        <polygon
          points="155,172 190,168 210,185 205,215 180,225 155,220 140,200 145,178"
          fill="#4F46E5"
          opacity="0.85"
        />
        {/* Map dots */}
        <circle cx="126" cy="195" r="4" fill="#4F46E5" />
        <circle cx="200" cy="245" r="4" fill="#E0E7FF" />
        <circle cx="218" cy="177" r="3" fill="#E0E7FF" />

        {/* ── Complaint row cards ── */}
        {/* Row 1 — light bg */}
        <rect x="262" y="152" width="100" height="34" rx="6" fill="#F8F9FA" />
        <rect x="272" y="161" width="55" height="6"  rx="3" fill="#E9ECEF" />
        <rect x="272" y="171" width="35" height="5"  rx="3" fill="#E0E7FF" />
        <rect x="340" y="159" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.15" />

        {/* Row 2 — white bg */}
        <rect x="262" y="192" width="100" height="34" rx="6" fill="white" stroke="#E9ECEF" strokeWidth="1" />
        <rect x="272" y="201" width="45" height="6"  rx="3" fill="#E9ECEF" />
        <rect x="272" y="211" width="30" height="5"  rx="3" fill="#E0E7FF" />
        <rect x="340" y="199" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.1" />

        {/* Row 3 — light bg */}
        <rect x="262" y="232" width="100" height="34" rx="6" fill="#F8F9FA" />
        <rect x="272" y="241" width="50" height="6"  rx="3" fill="#E9ECEF" />
        <rect x="272" y="251" width="28" height="5"  rx="3" fill="#E0E7FF" />
        <rect x="340" y="239" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.15" />

        {/* ── Score ring (bottom right) ── */}
        {/* Ring track */}
        <circle cx="330" cy="304" r="24"
                fill="none" stroke="#E0E7FF" strokeWidth="5" />
        {/* Ring progress (~84%) */}
        <circle cx="330" cy="304" r="24"
                fill="none" stroke="#4F46E5" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="127 151"
                strokeDashoffset="37.7"
                transform="rotate(-90 330 304)" />
        {/* Score label */}
        <rect x="320" y="298" width="20" height="8" rx="2" fill="#4F46E5" opacity="0.2" />

        {/* Bottom left stat pill */}
        <rect x="82" y="286" width="90" height="22" rx="11" fill="#E0E7FF" />
        <rect x="94" y="293"  width="55" height="7" rx="3"  fill="#4F46E5" opacity="0.4" />

        {/* Status dot */}
        <circle cx="180" cy="297" r="5" fill="#16A34A" opacity="0.8" />
        <circle cx="180" cy="297" r="3" fill="#16A34A" />
      </g>
    </svg>
  )
}
