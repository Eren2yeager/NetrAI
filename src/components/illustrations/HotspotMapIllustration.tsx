// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hotspot Map Illustration
// Flat geometric. Delhi map polygon with complaint dots (red, amber, indigo).
// One critical dot with a pulsing-style concentric ring.
// ─────────────────────────────────────────────────────────────────────────────

export default function HotspotMapIllustration({ className = '' }: { className?: string }) {
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

      {/* Delhi map polygon */}
      <polygon
        points="60,50 160,32 260,50 295,100 285,190 240,240 160,255 80,240 42,185 38,110"
        fill="#E0E7FF"
        stroke="#E9ECEF"
        strokeWidth="1.5"
      />

      {/* District sub-divisions (faint lines) */}
      <line x1="160" y1="32"  x2="160" y2="255" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
      <line x1="42"  y1="145" x2="295" y2="145" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
      <line x1="60"  y1="50"  x2="285" y2="190" stroke="#FFFFFF" strokeWidth="1"   opacity="0.5" />

      {/* ── Complaint dots ── */}

      {/* Critical dot — concentric pulse rings */}
      <circle cx="120" cy="110" r="28" fill="#DC2626" opacity="0.07" />
      <circle cx="120" cy="110" r="18" fill="#DC2626" opacity="0.12" />
      {/* Critical dot core */}
      <circle cx="120" cy="110" r="8"  fill="#DC2626" />
      <circle cx="120" cy="110" r="4"  fill="white"   opacity="0.8" />

      {/* Other red dots */}
      <circle cx="200" cy="82"  r="6" fill="#DC2626" />
      <circle cx="255" cy="160" r="5" fill="#DC2626" opacity="0.8" />

      {/* Amber dots */}
      <circle cx="155" cy="140" r="6" fill="#D97706" />
      <circle cx="90"  cy="185" r="5" fill="#D97706" opacity="0.9" />
      <circle cx="230" cy="200" r="6" fill="#D97706" />
      <circle cx="175" cy="70"  r="4" fill="#D97706" opacity="0.7" />

      {/* Indigo/blue dots */}
      <circle cx="200" cy="190" r="6" fill="#4F46E5" />
      <circle cx="140" cy="210" r="5" fill="#4F46E5" opacity="0.9" />
      <circle cx="270" cy="110" r="5" fill="#4F46E5" opacity="0.8" />
      <circle cx="105" cy="60"  r="4" fill="#4F46E5" opacity="0.7" />

      {/* ── Legend ── */}
      <rect x="20" y="240" width="320" height="28" rx="6" fill="white" stroke="#E9ECEF" strokeWidth="1" />

      <circle cx="40"  cy="254" r="4" fill="#DC2626" />
      <rect   x="50"  y="250" width="36" height="6" rx="2" fill="#E9ECEF" />

      <circle cx="106" cy="254" r="4" fill="#D97706" />
      <rect   x="116" cy="250" width="36" height="6" rx="2" fill="#E9ECEF" />

      <circle cx="172" cy="254" r="4" fill="#4F46E5" />
      <rect   x="182" cy="250" width="36" height="6" rx="2" fill="#E9ECEF" />
    </svg>
  )
}
