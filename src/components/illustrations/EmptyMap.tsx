// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Empty Map Illustration
// Location pin in #4F46E5 with concentric #E0E7FF rings.
// Reference: Stitch Call 4 Card 2.
// ─────────────────────────────────────────────────────────────────────────────

export default function EmptyMap({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Concentric rings — outermost to innermost */}
      <circle cx="60" cy="55" r="50" stroke="#E0E7FF" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="60" cy="55" r="38" stroke="#E0E7FF" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="60" cy="55" r="26" stroke="#C7D2FE" strokeWidth="2" />

      {/* Location pin body */}
      <path
        d="M60 20 C49 20 40 29 40 40 C40 54 60 76 60 76 C60 76 80 54 80 40 C80 29 71 20 60 20Z"
        fill="#4F46E5"
      />
      {/* Pin inner circle */}
      <circle cx="60" cy="40" r="8" fill="white" />

      {/* Pin tail dot */}
      <circle cx="60" cy="84" r="4" fill="#E0E7FF" />
    </svg>
  )
}
