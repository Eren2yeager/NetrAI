// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Decision Tree Illustration
// Shown in the Policy Simulator idle state (no result yet).
// Flat geometric SVG, 2 colors: #4F46E5 (brand) + #E0E7FF (tint).
// Abstract decision tree / scales motif.
// ─────────────────────────────────────────────────────────────────────────────

export default function DecisionTree({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Central trunk */}
      <rect x="97" y="30" width="6" height="70" rx="3" fill="#4F46E5" />

      {/* Left branch */}
      <rect x="40" y="68" width="57" height="5" rx="2.5" fill="#4F46E5" />
      <rect x="37" y="68" width="6" height="40" rx="3" fill="#4F46E5" />

      {/* Right branch */}
      <rect x="103" y="68" width="57" height="5" rx="2.5" fill="#4F46E5" />
      <rect x="157" y="68" width="6" height="40" rx="3" fill="#4F46E5" />

      {/* Root node — top circle */}
      <circle cx="100" cy="24" r="14" fill="#4F46E5" />
      <circle cx="100" cy="24" r="8"  fill="#E0E7FF" />

      {/* Left leaf nodes */}
      <rect x="20"  y="108" width="34" height="28" rx="8" fill="#4F46E5" />
      <rect x="62"  y="108" width="34" height="28" rx="8" fill="#E0E7FF" />

      {/* Right leaf nodes */}
      <rect x="104" y="108" width="34" height="28" rx="8" fill="#E0E7FF" />
      <rect x="146" y="108" width="34" height="28" rx="8" fill="#4F46E5" />

      {/* Scales beam — below tree */}
      <rect x="60" y="152" width="80" height="5" rx="2.5" fill="#4F46E5" opacity="0.4" />
      {/* Scales pivot */}
      <rect x="98" y="148" width="4" height="14" rx="2" fill="#4F46E5" />
      {/* Left pan */}
      <rect x="52"  y="156" width="28" height="16" rx="6" fill="#E0E7FF" />
      {/* Right pan — slightly lower = unbalanced, action needed */}
      <rect x="120" y="162" width="28" height="16" rx="6" fill="#4F46E5" opacity="0.6" />

      {/* Small dots — decorative */}
      <circle cx="37"  cy="155" r="3" fill="#4F46E5" opacity="0.3" />
      <circle cx="163" cy="155" r="3" fill="#4F46E5" opacity="0.3" />
    </svg>
  )
}
