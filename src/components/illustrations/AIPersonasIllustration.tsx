// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AI Personas Illustration
// Three stacked chat bubbles: NETRA (indigo), SAHAY (teal), MARG (amber).
// Flat geometric, 2-3 colors max per bubble.
// ─────────────────────────────────────────────────────────────────────────────

export default function AIPersonasIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Card background */}
      <rect width="360" height="280" rx="16"
            fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1" />

      {/* ── NETRA bubble (indigo) ── */}
      {/* Bubble body */}
      <rect x="20" y="24" width="256" height="64" rx="12" fill="#E0E7FF" />
      {/* Bubble tail */}
      <polygon points="20,54 4,66 20,66" fill="#E0E7FF" />
      {/* Avatar badge — N */}
      <rect x="294" y="24" width="46" height="46" rx="10" fill="#4F46E5" />
      <rect x="308" y="38" width="18" height="18" rx="4" fill="white" opacity="0.25" />
      <rect x="312" y="42" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      {/* Text lines */}
      <rect x="36"  y="42" width="110" height="8" rx="4" fill="#4F46E5" opacity="0.5" />
      <rect x="36"  y="56" width="80"  height="6" rx="3" fill="#4F46E5" opacity="0.3" />
      {/* Label */}
      <rect x="36" y="30" width="32" height="7" rx="3" fill="#4F46E5" opacity="0.7" />

      {/* ── SAHAY bubble (teal) ── */}
      {/* Bubble body */}
      <rect x="84" y="112" width="256" height="64" rx="12" fill="#CCFBF1" />
      {/* Bubble tail */}
      <polygon points="340,142 356,154 340,154" fill="#CCFBF1" />
      {/* Avatar badge — S */}
      <rect x="20" y="112" width="46" height="46" rx="10" fill="#0D9488" />
      <rect x="34"  y="126" width="18" height="18" rx="4" fill="white" opacity="0.25" />
      <rect x="38"  y="130" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      {/* Text lines */}
      <rect x="100" y="130" width="120" height="8" rx="4" fill="#0D9488" opacity="0.5" />
      <rect x="100" y="144" width="88"  height="6" rx="3" fill="#0D9488" opacity="0.3" />
      {/* Label */}
      <rect x="100" y="118" width="36" height="7" rx="3" fill="#0D9488" opacity="0.7" />

      {/* ── MARG bubble (amber) ── */}
      {/* Bubble body */}
      <rect x="20" y="200" width="256" height="64" rx="12" fill="#FEF3C7" />
      {/* Bubble tail */}
      <polygon points="20,230 4,242 20,242" fill="#FEF3C7" />
      {/* Avatar badge — M */}
      <rect x="294" y="200" width="46" height="46" rx="10" fill="#D97706" />
      <rect x="308" y="214" width="18" height="18" rx="4" fill="white" opacity="0.25" />
      <rect x="312" y="218" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      {/* Text lines */}
      <rect x="36"  y="218" width="130" height="8" rx="4" fill="#D97706" opacity="0.5" />
      <rect x="36"  y="232" width="90"  height="6" rx="3" fill="#D97706" opacity="0.3" />
      {/* Label */}
      <rect x="36" y="206" width="34" height="7" rx="3" fill="#D97706" opacity="0.7" />
    </svg>
  )
}
