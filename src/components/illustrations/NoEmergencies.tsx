// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — No Emergencies Illustration
// City buildings in #E0E7FF with a #4F46E5 shield overlaid.
// Reference: Stitch Call 4 Card 1.
// ─────────────────────────────────────────────────────────────────────────────

export default function NoEmergencies({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* City buildings — pale blue */}
      <rect x="8"  y="70" width="16" height="42" rx="2" fill="#E0E7FF" />
      <rect x="26" y="55" width="12" height="57" rx="2" fill="#E0E7FF" />
      <rect x="40" y="65" width="20" height="47" rx="2" fill="#E0E7FF" />
      <rect x="62" y="50" width="14" height="62" rx="2" fill="#E0E7FF" />
      <rect x="78" y="60" width="18" height="52" rx="2" fill="#E0E7FF" />
      <rect x="98" y="72" width="14" height="40" rx="2" fill="#E0E7FF" />

      {/* Windows */}
      <rect x="11" y="76" width="4" height="4" rx="1" fill="#4F46E5" opacity="0.3" />
      <rect x="18" y="76" width="4" height="4" rx="1" fill="#4F46E5" opacity="0.3" />
      <rect x="29" y="62" width="4" height="4" rx="1" fill="#4F46E5" opacity="0.3" />
      <rect x="65" y="58" width="4" height="4" rx="1" fill="#4F46E5" opacity="0.3" />
      <rect x="72" y="58" width="4" height="4" rx="1" fill="#4F46E5" opacity="0.3" />

      {/* Shield — centered, brand indigo */}
      <path
        d="M60 18 L80 26 L80 50 C80 63 70 72 60 76 C50 72 40 63 40 50 L40 26 Z"
        fill="#4F46E5"
      />
      {/* Checkmark inside shield */}
      <path
        d="M51 49 L57 55 L69 43"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
