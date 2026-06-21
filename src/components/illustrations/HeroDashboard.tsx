// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hero Dashboard Illustration (animated)
// Pure SVG SMIL animations — no JS dependency.
// Animations: floating bg shapes, stagger KPI pills, score ring draw,
//             map dot pulse, complaint rows slide in, status dot blink.
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
      {/* ── Background floating shapes ── */}
      <circle cx="380" cy="60" r="70" fill="#E0E7FF" opacity="0.45">
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,-12; 0,0" dur="6s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </circle>
      <circle cx="80" cy="340" r="90" fill="#EEF2FF" opacity="0.55">
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 0,10; 0,0" dur="7s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </circle>
      <rect x="20" y="40" width="50" height="50" rx="8" fill="#E0E7FF" opacity="0.35">
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 4,-6; 0,0" dur="5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </rect>
      <rect x="400" y="290" width="60" height="60" rx="8" fill="#E0E7FF" opacity="0.3">
        <animateTransform attributeName="transform" type="translate"
          values="0,0; -4,8; 0,0" dur="8s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </rect>
      <rect x="320" y="20" width="30" height="30" rx="4" fill="#4F46E5" opacity="0.08">
        <animateTransform attributeName="transform" type="rotate"
          values="0 335 35; 8 335 35; 0 335 35" dur="9s"
          repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </rect>
      <circle cx="150" cy="80" r="25" fill="#EEF2FF" opacity="0.6">
        <animateTransform attributeName="transform" type="translate"
          values="0,0; 5,-5; 0,0" dur="6.5s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </circle>

      {/* ── Main dashboard card (tilted 3deg, fade+rise in) ── */}
      <g transform="rotate(3, 240, 210)">
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.5s"
            begin="0.2s" fill="freeze" />
          <animateTransform attributeName="transform" type="translate"
            values="0,16; 0,0" dur="0.5s" begin="0.2s" fill="freeze"
            calcMode="spline" keySplines="0.25 0 0 1" />

          {/* Card shadow + body */}
          <rect x="70" y="82" width="310" height="260" rx="16"
                fill="#4F46E5" opacity="0.06" />
          <rect x="65" y="78" width="310" height="260" rx="16"
                fill="white" stroke="#E9ECEF" strokeWidth="1" />

          {/* Header label */}
          <rect x="82" y="96" width="80" height="8" rx="2" fill="#E0E7FF" />

          {/* ── KPI pills — stagger fade in ── */}
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.35s"
              begin="0.55s" fill="freeze" />
            <rect x="82" y="116" width="72" height="22" rx="11" fill="#4F46E5" />
            <rect x="94" y="123" width="40" height="6" rx="3" fill="white" opacity="0.7" />
          </g>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.35s"
              begin="0.75s" fill="freeze" />
            <rect x="162" y="116" width="72" height="22" rx="11" fill="#E0E7FF" />
            <rect x="174" y="123" width="40" height="6" rx="3" fill="#4F46E5" opacity="0.5" />
          </g>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.35s"
              begin="0.95s" fill="freeze" />
            <rect x="242" y="116" width="72" height="22" rx="11" fill="#EEF2FF" />
            <rect x="254" y="123" width="40" height="6" rx="3" fill="#4F46E5" opacity="0.3" />
          </g>

          {/* ── District map ── */}
          <rect x="82" y="152" width="170" height="120" rx="8"
                fill="#EEF2FF" opacity="0.6" />
          <polygon
            points="110,162 180,155 230,168 240,200 235,248 200,260 155,258 108,240 90,210 95,175"
            fill="#E0E7FF" />
          <polygon
            points="155,172 190,168 210,185 205,215 180,225 155,220 140,200 145,178"
            fill="#4F46E5" opacity="0.85">
            <animate attributeName="opacity" values="0.4;0.85;0.4"
              dur="3s" repeatCount="indefinite" />
          </polygon>

          {/* Map dots */}
          <circle cx="126" cy="195" r="4" fill="#4F46E5">
            <animate attributeName="r" values="4;6;4" dur="2s"
              repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s"
              repeatCount="indefinite" begin="1.2s" />
          </circle>
          <circle cx="200" cy="245" r="4" fill="#E0E7FF" opacity="0" >
            <animate attributeName="opacity" values="0;1" dur="0.3s"
              begin="1.4s" fill="freeze" />
          </circle>
          <circle cx="218" cy="177" r="3" fill="#E0E7FF" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.3s"
              begin="1.6s" fill="freeze" />
          </circle>

          {/* ── Complaint rows — slide in from right ── */}
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.3s"
              begin="0.8s" fill="freeze" />
            <animateTransform attributeName="transform" type="translate"
              values="20,0;0,0" dur="0.35s" begin="0.8s" fill="freeze"
              calcMode="spline" keySplines="0.25 0 0 1" />
            <rect x="262" y="152" width="100" height="34" rx="6" fill="#F8F9FA" />
            <rect x="272" y="161" width="55" height="6"  rx="3" fill="#E9ECEF" />
            <rect x="272" y="171" width="35" height="5"  rx="3" fill="#E0E7FF" />
            <rect x="340" y="159" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.15" />
          </g>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.3s"
              begin="1s" fill="freeze" />
            <animateTransform attributeName="transform" type="translate"
              values="20,0;0,0" dur="0.35s" begin="1s" fill="freeze"
              calcMode="spline" keySplines="0.25 0 0 1" />
            <rect x="262" y="192" width="100" height="34" rx="6" fill="white" stroke="#E9ECEF" strokeWidth="1" />
            <rect x="272" y="201" width="45" height="6"  rx="3" fill="#E9ECEF" />
            <rect x="272" y="211" width="30" height="5"  rx="3" fill="#E0E7FF" />
            <rect x="340" y="199" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.1" />
          </g>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.3s"
              begin="1.2s" fill="freeze" />
            <animateTransform attributeName="transform" type="translate"
              values="20,0;0,0" dur="0.35s" begin="1.2s" fill="freeze"
              calcMode="spline" keySplines="0.25 0 0 1" />
            <rect x="262" y="232" width="100" height="34" rx="6" fill="#F8F9FA" />
            <rect x="272" y="241" width="50" height="6"  rx="3" fill="#E9ECEF" />
            <rect x="272" y="251" width="28" height="5"  rx="3" fill="#E0E7FF" />
            <rect x="340" y="239" width="16" height="16" rx="4" fill="#4F46E5" opacity="0.15" />
          </g>

          {/* ── Score ring — draw on load ── */}
          {/* Track */}
          <circle cx="330" cy="304" r="24"
                  fill="none" stroke="#E0E7FF" strokeWidth="5" />
          {/* Progress arc — strokeDashoffset animates from full (151) to 37.7 */}
          <circle cx="330" cy="304" r="24"
                  fill="none" stroke="#4F46E5" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="127 151"
                  strokeDashoffset="151"
                  transform="rotate(-90 330 304)">
            <animate attributeName="strokeDashoffset"
              values="151;37.7" dur="1s" begin="1s" fill="freeze"
              calcMode="spline" keySplines="0.25 0 0 1" />
          </circle>
          <rect x="320" y="298" width="20" height="8" rx="2" fill="#4F46E5" opacity="0.2" />

          {/* Bottom stat pill */}
          <rect x="82" y="286" width="90" height="22" rx="11" fill="#E0E7FF" />
          <rect x="94" y="293" width="55" height="7" rx="3" fill="#4F46E5" opacity="0.4" />

          {/* Status dot — pulse */}
          <circle cx="180" cy="297" r="8" fill="#16A34A" opacity="0">
            <animate attributeName="r"       values="8;14;8"   dur="2s" repeatCount="indefinite" begin="1.5s" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
          </circle>
          <circle cx="180" cy="297" r="5" fill="#16A34A" opacity="0.8" />
          <circle cx="180" cy="297" r="3" fill="#16A34A" />
        </g>
      </g>
    </svg>
  )
}
