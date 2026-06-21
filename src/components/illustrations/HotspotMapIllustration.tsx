// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hotspot Map Illustration (animated)
// Animations: critical dot expanding pulse rings, dots stagger-appear,
//             map polygon stroke draw-on, district darkening breathe.
// ─────────────────────────────────────────────────────────────────────────────

export default function HotspotMapIllustration({ className = '' }: { className?: string }) {
  // circumference of the map polygon path for stroke-dasharray draw-on
  return (
    <svg
      viewBox="0 0 360 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Map background */}
      <rect width="360" height="280" rx="16"
            fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1" />

      {/* Delhi map polygon — fade in */}
      <polygon
        points="60,50 160,32 260,50 295,100 285,190 240,240 160,255 80,240 42,185 38,110"
        fill="#E0E7FF"
        stroke="#E9ECEF"
        strokeWidth="1.5"
        opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.6s"
          begin="0.1s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
      </polygon>

      {/* District sub-divisions */}
      <line x1="160" y1="32"  x2="160" y2="255" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
      <line x1="42"  y1="145" x2="295" y2="145" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
      <line x1="60"  y1="50"  x2="285" y2="190" stroke="#FFFFFF" strokeWidth="1"   opacity="0.5" />

      {/* ── Critical dot — layered expanding rings ── */}
      {/* Outer ring 1 */}
      <circle cx="120" cy="110" r="8" fill="none"
              stroke="#DC2626" strokeWidth="2" opacity="0">
        <animate attributeName="r"       values="8;32"    dur="2s" repeatCount="indefinite" begin="0.8s" />
        <animate attributeName="opacity" values="0.5;0"   dur="2s" repeatCount="indefinite" begin="0.8s" />
      </circle>
      {/* Outer ring 2 — offset */}
      <circle cx="120" cy="110" r="8" fill="none"
              stroke="#DC2626" strokeWidth="2" opacity="0">
        <animate attributeName="r"       values="8;32"    dur="2s" repeatCount="indefinite" begin="1.6s" />
        <animate attributeName="opacity" values="0.5;0"   dur="2s" repeatCount="indefinite" begin="1.6s" />
      </circle>
      {/* Static fill rings (background glow) */}
      <circle cx="120" cy="110" r="28" fill="#DC2626" opacity="0.07" />
      <circle cx="120" cy="110" r="18" fill="#DC2626" opacity="0.12" />
      {/* Critical dot core */}
      <circle cx="120" cy="110" r="8" fill="#DC2626">
        <animate attributeName="r" values="8;9.5;8" dur="1.5s"
          repeatCount="indefinite" begin="0.5s"
          calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
      </circle>
      <circle cx="120" cy="110" r="4" fill="white" opacity="0.8" />

      {/* ── Other dots — stagger appear ── */}
      {[
        { cx: 200, cy: 82,  r: 6, fill: '#DC2626', delay: '0.4s' },
        { cx: 255, cy: 160, r: 5, fill: '#DC2626', delay: '0.55s' },
        { cx: 155, cy: 140, r: 6, fill: '#D97706', delay: '0.7s'  },
        { cx: 90,  cy: 185, r: 5, fill: '#D97706', delay: '0.85s' },
        { cx: 230, cy: 200, r: 6, fill: '#D97706', delay: '1s'    },
        { cx: 175, cy: 70,  r: 4, fill: '#D97706', delay: '1.1s'  },
        { cx: 200, cy: 190, r: 6, fill: '#4F46E5', delay: '1.2s'  },
        { cx: 140, cy: 210, r: 5, fill: '#4F46E5', delay: '1.3s'  },
        { cx: 270, cy: 110, r: 5, fill: '#4F46E5', delay: '1.4s'  },
        { cx: 105, cy: 60,  r: 4, fill: '#4F46E5', delay: '1.5s'  },
      ].map(({ cx, cy, r, fill, delay }) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s"
            begin={delay} fill="freeze"
            calcMode="spline" keySplines="0.25 0 0 1" />
          <animate attributeName="r" values={`${r};${r + 1.5};${r}`}
            dur="3s" repeatCount="indefinite"
            begin={delay}
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        </circle>
      ))}

      {/* ── Legend — fade in last ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="1.6s" fill="freeze" />
        <rect x="20" y="240" width="320" height="28" rx="6"
              fill="white" stroke="#E9ECEF" strokeWidth="1" />
        <circle cx="40"  cy="254" r="4" fill="#DC2626" />
        <rect   x="50"  y="250" width="36" height="6" rx="2" fill="#E9ECEF" />
        <circle cx="106" cy="254" r="4" fill="#D97706" />
        <rect   x="116" y="250" width="36" height="6" rx="2" fill="#E9ECEF" />
        <circle cx="172" cy="254" r="4" fill="#4F46E5" />
        <rect   x="182" y="250" width="36" height="6" rx="2" fill="#E9ECEF" />
      </g>
    </svg>
  )
}
