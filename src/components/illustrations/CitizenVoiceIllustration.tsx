// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Citizen Voice Illustration
// Simplified chat UI: Hindi text bubble + image attachment bubble.
// Flat geometric, 2-3 colors: #4F46E5, #E0E7FF, white.
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

      {/* ── Chat header ── */}
      <rect x="0" y="0" width="360" height="46" rx="16" fill="white" />
      <rect x="0" y="28" width="360" height="18" fill="white" />
      <circle cx="28" cy="23" r="14" fill="#E0E7FF" />
      <rect x="16" y="19" width="24" height="8" rx="3" fill="#4F46E5" opacity="0.4" />
      <rect x="52" y="15" width="80" height="8"  rx="3" fill="#E9ECEF" />
      <rect x="52" y="27" width="50" height="6"  rx="3" fill="#E9ECEF" opacity="0.6" />
      {/* Online dot */}
      <circle cx="318" cy="23" r="6" fill="#16A34A" />
      <circle cx="318" cy="23" r="3" fill="white" />
      <rect x="1" y="44" width="358" height="1" fill="#E9ECEF" />

      {/* ── Citizen message bubble (right-aligned, indigo) ── */}
      {/* Bubble */}
      <rect x="116" y="64" width="220" height="62" rx="14" fill="#4F46E5" />
      {/* Bubble tail */}
      <polygon points="336,90 352,100 336,100" fill="#4F46E5" />
      {/* Hindi text representation — abstract lines */}
      <rect x="132" y="80" width="130" height="8" rx="3" fill="white" opacity="0.7" />
      <rect x="132" y="93" width="100" height="8" rx="3" fill="white" opacity="0.5" />
      <rect x="132" y="106" width="70"  height="6" rx="3" fill="white" opacity="0.35" />
      {/* Hindi-ish diacritical mark on top */}
      <rect x="132" y="72" width="60" height="4" rx="2" fill="white" opacity="0.35" />

      {/* Timestamp */}
      <rect x="290" y="134" width="36" height="6" rx="3" fill="#94A3B8" opacity="0.5" />

      {/* ── Image attachment bubble (left-aligned, light) ── */}
      <rect x="20" y="154" width="220" height="82" rx="14"
            fill="white" stroke="#E9ECEF" strokeWidth="1" />
      {/* Bubble tail */}
      <polygon points="20,185 4,195 20,195" fill="white" />
      {/* Image preview area */}
      <rect x="34" y="166" width="68" height="58" rx="8" fill="#E0E7FF" />
      {/* Image icon */}
      <rect x="50" y="180" width="36" height="28" rx="4" fill="#4F46E5" opacity="0.2" />
      <polygon points="50,208 58,192 68,200 78,186 86,208" fill="#4F46E5" opacity="0.35" />
      <circle cx="60" cy="184" r="4" fill="#4F46E5" opacity="0.4" />
      {/* Text alongside image */}
      <rect x="112" y="172" width="110" height="7" rx="3" fill="#E9ECEF" />
      <rect x="112" y="184" width="85"  height="7" rx="3" fill="#E9ECEF" opacity="0.7" />
      <rect x="112" y="196" width="65"  height="7" rx="3" fill="#E9ECEF" opacity="0.5" />
      {/* File label pill */}
      <rect x="112" y="210" width="70" height="18" rx="9" fill="#E0E7FF" />
      <rect x="122" y="216" width="40" height="6"  rx="3" fill="#4F46E5" opacity="0.4" />

      {/* Timestamp */}
      <rect x="34" y="244" width="36" height="6" rx="3" fill="#94A3B8" opacity="0.5" />

      {/* ── Input bar ── */}
      <rect x="0"  y="256" width="360" height="24" fill="white" />
      <rect x="0"  y="255" width="360" height="1"  fill="#E9ECEF" />
      <rect x="16" y="260" width="270" height="14" rx="7" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1" />
      <rect x="26" y="264" width="60"  height="6"  rx="3" fill="#E9ECEF" opacity="0.6" />
      {/* Send button */}
      <rect x="296" y="258" width="48" height="18" rx="9" fill="#4F46E5" />
      <polygon points="308,267 318,264 318,270" fill="white" opacity="0.8" />
    </svg>
  )
}
