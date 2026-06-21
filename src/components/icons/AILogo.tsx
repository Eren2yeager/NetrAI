
// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AI Logo Component
// Reusable component for displaying AI logos (netra, sahay, marg)
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AILogoType = 'netra' | 'sahay' | 'marg'

interface AILogoProps {
  /** The type of AI logo to display */
  type: AILogoType
  /** Size of the logo in pixels (width and height will be equal) */
  size?: number
  /** Additional CSS classes */
  className?: string
  /** Alt text for accessibility */
  alt?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AILogo({ type, size = 32, className = '', alt }: AILogoProps) {
  // Map logo types to their file paths
  const logoPath = {
    netra: '/logo/netra.png',
    sahay: '/logo/sahay.png',
    marg: '/logo/marg.png',
  }[type]

  // Default alt text based on logo type
  const defaultAlt = {
    netra: 'Netra AI Logo',
    sahay: 'Sahay AI Logo',
    marg: 'Marg AI Logo',
  }[type]

  return (
    <Image
      src={logoPath}
      alt={alt || defaultAlt}
      width={size}
      height={size}
      className={className}
      priority // Prioritize loading since these are important UI elements
    />
  )
}

