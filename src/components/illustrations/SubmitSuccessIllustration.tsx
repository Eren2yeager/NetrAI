// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Submit Success Illustration
// Checkmark circle in #16A34A with #E0E7FF decorative stars.
// Reference: Stitch Call 4 Card 3.
// ─────────────────────────────────────────────────────────────────────────────

export default function SubmitSuccessIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Outer soft ring */}
      <circle cx="60" cy="60" r="50" fill="#F0FDF4" />

      {/* Main checkmark circle */}
      <circle cx="60" cy="60" r="36" fill="#16A34A" />

      {/* Checkmark */}
      <path
        d="M44 60 L54 70 L76 48"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative stars — E0E7FF */}
      {/* Top-left star */}
      <path d="M22 28 L23.5 32 L27.5 32 L24.5 34.5 L25.5 38.5 L22 36 L18.5 38.5 L19.5 34.5 L16.5 32 L20.5 32Z"
        fill="#E0E7FF" />
      {/* Top-right star */}
      <path d="M95 22 L96 25 L99 25 L96.5 27 L97.5 30 L95 28.5 L92.5 30 L93.5 27 L91 25 L94 25Z"
        fill="#E0E7FF" />
      {/* Bottom-right star */}
      <path d="M100 82 L101 85 L104 85 L101.5 87 L102.5 90 L100 88.5 L97.5 90 L98.5 87 L96 85 L99 85Z"
        fill="#E0E7FF" />
      {/* Bottom-left star */}
      <path d="M18 86 L19 89 L22 89 L19.5 91 L20.5 94 L18 92.5 L15.5 94 L16.5 91 L14 89 L17 89Z"
        fill="#C7D2FE" />
    </svg>
  )
}
