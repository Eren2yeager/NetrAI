// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Delhi Skyline Illustration
// Flat geometric SVG, 2 colors only: #4F46E5 (brand-500) + #E0E7FF (brand-100)
// Geometric rectangles of varying heights — abstract city silhouette.
// Reference: Stitch Call 1 CM Dashboard right-side illustration.
// ─────────────────────────────────────────────────────────────────────────────

export default function DelhiSkyline({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Background sky band */}
      <rect width="320" height="160" fill="none" />

      {/* Far background buildings — lighter color */}
      <rect x="0"   y="90"  width="18" height="70"  fill="#E0E7FF" opacity="0.5" />
      <rect x="22"  y="70"  width="14" height="90"  fill="#E0E7FF" opacity="0.5" />
      <rect x="40"  y="80"  width="20" height="80"  fill="#E0E7FF" opacity="0.5" />
      <rect x="64"  y="60"  width="16" height="100" fill="#E0E7FF" opacity="0.5" />
      <rect x="84"  y="75"  width="24" height="85"  fill="#E0E7FF" opacity="0.5" />
      <rect x="112" y="50"  width="18" height="110" fill="#E0E7FF" opacity="0.5" />
      <rect x="134" y="68"  width="22" height="92"  fill="#E0E7FF" opacity="0.5" />
      <rect x="160" y="55"  width="16" height="105" fill="#E0E7FF" opacity="0.5" />
      <rect x="180" y="72"  width="20" height="88"  fill="#E0E7FF" opacity="0.5" />
      <rect x="204" y="62"  width="18" height="98"  fill="#E0E7FF" opacity="0.5" />
      <rect x="226" y="78"  width="26" height="82"  fill="#E0E7FF" opacity="0.5" />
      <rect x="256" y="58"  width="14" height="102" fill="#E0E7FF" opacity="0.5" />
      <rect x="274" y="74"  width="22" height="86"  fill="#E0E7FF" opacity="0.5" />
      <rect x="300" y="65"  width="20" height="95"  fill="#E0E7FF" opacity="0.5" />

      {/* Foreground buildings — primary brand color */}
      <rect x="0"   y="110" width="22" height="50"  fill="#4F46E5" />
      <rect x="26"  y="95"  width="16" height="65"  fill="#4F46E5" />
      <rect x="46"  y="100" width="28" height="60"  fill="#4F46E5" />
      {/* Tall tower — landmark */}
      <rect x="78"  y="55"  width="20" height="105" fill="#4F46E5" />
      {/* Tower spire */}
      <rect x="85"  y="38"  width="6"  height="20"  fill="#4F46E5" />
      <rect x="102" y="80"  width="24" height="80"  fill="#4F46E5" />
      <rect x="130" y="70"  width="18" height="90"  fill="#4F46E5" />
      {/* Wide civic building */}
      <rect x="152" y="85"  width="40" height="75"  fill="#4F46E5" />
      {/* Dome hint — small square on top of wide building */}
      <rect x="166" y="78"  width="12" height="10"  fill="#4F46E5" />
      <rect x="196" y="90"  width="22" height="70"  fill="#4F46E5" />
      <rect x="222" y="75"  width="18" height="85"  fill="#4F46E5" />
      {/* Second tall tower */}
      <rect x="244" y="50"  width="16" height="110" fill="#4F46E5" />
      <rect x="248" y="36"  width="8"  height="16"  fill="#4F46E5" />
      <rect x="264" y="88"  width="20" height="72"  fill="#4F46E5" />
      <rect x="288" y="95"  width="16" height="65"  fill="#4F46E5" />
      <rect x="308" y="100" width="12" height="60"  fill="#4F46E5" />

      {/* Windows — tiny bright squares on foreground buildings */}
      {[
        [82, 65], [82, 78], [82, 91], [89, 65], [89, 78],
        [156, 92], [156, 100], [164, 92], [164, 100],
        [172, 92], [172, 100], [180, 92], [180, 100],
        [248, 58], [248, 70], [248, 82], [255, 58], [255, 70],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" fill="#E0E7FF" opacity="0.7" />
      ))}

      {/* Ground line */}
      <rect x="0" y="158" width="320" height="2" fill="#4F46E5" opacity="0.3" />
    </svg>
  )
}
