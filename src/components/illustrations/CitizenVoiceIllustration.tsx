// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Citizen Voice Illustration (animated)
// Animations: user bubble slides in from right, AI bubble from left,
//             online dot pulse, typing dots in header, send button pulse,
//             text line shimmer.
// ─────────────────────────────────────────────────────────────────────────────

export default function CitizenVoiceIllustration({ className = '' }: { className?: string }) {
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

      {/* ── Chat header — fade in ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.05s" fill="freeze" />
        <rect x="0" y="0" width="360" height="46" rx="16" fill="white" />
        <rect x="0" y="28" width="360" height="18" fill="white" />
        <circle cx="28" cy="23" r="14" fill="#E0E7FF" />
        <rect x="16" y="19" width="24" height="8" rx="3" fill="#4F46E5" opacity="0.4" />
        <rect x="52" y="15" width="80" height="8" rx="3" fill="#E9ECEF" />
        <rect x="52" y="27" width="50" height="6" rx="3" fill="#E9ECEF" opacity="0.6" />
        <rect x="1" y="44" width="358" height="1" fill="#E9ECEF" />
      </g>
      {/* Online dot — pulse */}
      <circle cx="318" cy="23" r="10" fill="#16A34A" opacity="0">
        <animate attributeName="r"       values="6;13;6"    dur="2s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle cx="318" cy="23" r="6" fill="#16A34A" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.3s" fill="freeze" />
      </circle>
      <circle cx="318" cy="23" r="3" fill="white" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.3s" fill="freeze" />
      </circle>

      {/* ── User bubble — slides in from right ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.35s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <animateTransform attributeName="transform" type="translate"
          values="20,0; 0,0" dur="0.45s" begin="0.35s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <rect x="116" y="64" width="220" height="62" rx="14" fill="#4F46E5" />
        <polygon points="336,90 352,100 336,100" fill="#4F46E5" />
        {/* Text lines with shimmer */}
        <rect x="132" y="72" width="60"  height="4" rx="2" fill="white" opacity="0.35" />
        <rect x="132" y="80" width="130" height="8" rx="3" fill="white" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="3s"
            repeatCount="indefinite" begin="1s" />
        </rect>
        <rect x="132" y="93" width="100" height="8" rx="3" fill="white" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s"
            repeatCount="indefinite" begin="1.2s" />
        </rect>
        <rect x="132" y="106" width="70" height="6" rx="3" fill="white" opacity="0.35" />
        <rect x="290" y="134" width="36" height="6" rx="3" fill="#94A3B8" opacity="0.5" />
      </g>

      {/* ── AI bubble — slides in from left ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="0.75s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <animateTransform attributeName="transform" type="translate"
          values="-20,0; 0,0" dur="0.45s" begin="0.75s" fill="freeze"
          calcMode="spline" keySplines="0.25 0 0 1" />
        <rect x="20" y="154" width="220" height="82" rx="14"
              fill="white" stroke="#E9ECEF" strokeWidth="1" />
        <polygon points="20,185 4,195 20,195" fill="white" />
        {/* Image preview */}
        <rect x="34" y="166" width="68" height="58" rx="8" fill="#E0E7FF" />
        <rect x="50" y="180" width="36" height="28" rx="4" fill="#4F46E5" opacity="0.2" />
        <polygon points="50,208 58,192 68,200 78,186 86,208" fill="#4F46E5" opacity="0.35" />
        <circle cx="60" cy="184" r="4" fill="#4F46E5" opacity="0.4" />
        {/* Text lines */}
        <rect x="112" y="172" width="110" height="7" rx="3" fill="#E9ECEF">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s"
            repeatCount="indefinite" begin="1.5s" />
        </rect>
        <rect x="112" y="184" width="85" height="7" rx="3" fill="#E9ECEF" opacity="0.7" />
        <rect x="112" y="196" width="65" height="7" rx="3" fill="#E9ECEF" opacity="0.5" />
        {/* File pill */}
        <rect x="112" y="210" width="70" height="18" rx="9" fill="#E0E7FF" />
        <rect x="122" y="216" width="40" height="6"  rx="3" fill="#4F46E5" opacity="0.4" />
        <rect x="34"  y="244" width="36" height="6"  rx="3" fill="#94A3B8" opacity="0.5" />
      </g>

      {/* ── Input bar — fade in ── */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s"
          begin="1.1s" fill="freeze" />
        <rect x="0"  y="256" width="360" height="24" fill="white" />
        <rect x="0"  y="255" width="360" height="1"  fill="#E9ECEF" />
        <rect x="16" y="260" width="270" height="14" rx="7"
              fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1" />
        <rect x="26" y="264" width="60" height="6" rx="3" fill="#E9ECEF" opacity="0.6" />
        {/* Send button — pulse */}
        <rect x="296" y="258" width="48" height="18" rx="9" fill="#4F46E5">
          <animate attributeName="opacity" values="1;0.75;1" dur="2s"
            repeatCount="indefinite" begin="1.5s" />
        </rect>
        <polygon points="308,267 318,264 318,270" fill="white" opacity="0.8" />
      </g>

      {/* ── Typing dots (3 dots in header area as "bot is active") ── */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={140 + i * 10} cy={23} r="3" fill="#4F46E5" opacity="0">
          <animate attributeName="opacity"
            values="0;0;0.6;0"
            dur="1.5s"
            begin={`${0.2 + i * 0.18}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.25 0 0 1;0.45 0 0.55 1;0.25 0 0 1"
          />
          <animate attributeName="r"
            values="2;3.5;2"
            dur="1.5s"
            begin={`${0.2 + i * 0.18}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          />
        </circle>
      ))}
    </svg>
  )
}
