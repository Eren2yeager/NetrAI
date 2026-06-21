// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AI Personas Illustration (animated)
// Animations: NETRA slides in from left, SAHAY from right, MARG from left,
//             staggered delays. Text shimmer on each bubble. Avatar gentle bob.
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

      {/* ── NETRA bubble (indigo) — slides in from left ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.1s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <animateTransform attributeName="transform" type="translate"
          values="-24,0; 0,0" dur="0.45s" begin="0.1s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        {/* Bubble */}
        <rect x="20" y="24" width="256" height="64" rx="12" fill="#E0E7FF" />
        <polygon points="20,54 4,66 20,66" fill="#E0E7FF" />
        {/* Text lines with shimmer */}
        <rect x="36" y="42" width="110" height="8" rx="4" fill="#4F46E5" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2.5s"
            repeatCount="indefinite" begin="0.8s" />
        </rect>
        <rect x="36" y="56" width="80" height="6" rx="3" fill="#4F46E5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s"
            repeatCount="indefinite" begin="1s" />
        </rect>
        <rect x="36" y="30" width="32" height="7" rx="3" fill="#4F46E5" opacity="0.7" />
      </g>
      {/* NETRA avatar — gentle bob */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.3s"
          begin="0.3s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,-3; 0,0" dur="3s" repeatCount="indefinite" begin="0.5s"
          calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <rect x="294" y="24" width="46" height="46" rx="10" fill="#4F46E5" />
        <rect x="308" y="38" width="18" height="18" rx="4" fill="white" opacity="0.25" />
        <rect x="312" y="42" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      </g>

      {/* ── SAHAY bubble (teal) — slides in from right ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.45s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <animateTransform attributeName="transform" type="translate"
          values="24,0; 0,0" dur="0.45s" begin="0.45s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <rect x="84" y="112" width="256" height="64" rx="12" fill="#CCFBF1" />
        <polygon points="340,142 356,154 340,154" fill="#CCFBF1" />
        <rect x="100" y="130" width="120" height="8" rx="4" fill="#0D9488" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2.5s"
            repeatCount="indefinite" begin="1.2s" />
        </rect>
        <rect x="100" y="144" width="88" height="6" rx="3" fill="#0D9488" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s"
            repeatCount="indefinite" begin="1.4s" />
        </rect>
        <rect x="100" y="118" width="36" height="7" rx="3" fill="#0D9488" opacity="0.7" />
      </g>
      {/* SAHAY avatar */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.3s"
          begin="0.6s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,-3; 0,0" dur="3.4s" repeatCount="indefinite" begin="0.8s"
          calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <rect x="20" y="112" width="46" height="46" rx="10" fill="#0D9488" />
        <rect x="34" y="126" width="18" height="18" rx="4" fill="white" opacity="0.25" />
        <rect x="38" y="130" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      </g>

      {/* ── MARG bubble (amber) — slides in from left ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.8s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <animateTransform attributeName="transform" type="translate"
          values="-24,0; 0,0" dur="0.45s" begin="0.8s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <rect x="20" y="200" width="256" height="64" rx="12" fill="#FEF3C7" />
        <polygon points="20,230 4,242 20,242" fill="#FEF3C7" />
        <rect x="36" y="218" width="130" height="8" rx="4" fill="#D97706" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2.5s"
            repeatCount="indefinite" begin="1.6s" />
        </rect>
        <rect x="36" y="232" width="90" height="6" rx="3" fill="#D97706" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s"
            repeatCount="indefinite" begin="1.8s" />
        </rect>
        <rect x="36" y="206" width="34" height="7" rx="3" fill="#D97706" opacity="0.7" />
      </g>
      {/* MARG avatar */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.3s"
          begin="0.95s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,-3; 0,0" dur="2.8s" repeatCount="indefinite" begin="1.1s"
          calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
        <rect x="294" y="200" width="46" height="46" rx="10" fill="#D97706" />
        <rect x="308" y="214" width="18" height="18" rx="4" fill="white" opacity="0.25" />
        <rect x="312" y="218" width="10" height="10" rx="2" fill="white" opacity="0.7" />
      </g>
    </svg>
  )
}
