'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Thin client wrapper that dynamic-imports CitizenChatbot with ssr:false.
// Needed because `ssr: false` is not allowed in Server Components.
// The page stays a Server Component (exports metadata), this file owns the
// dynamic import.
// ─────────────────────────────────────────────────────────────────────────────

import dynamic from 'next/dynamic'
import AILogo, { AILogoType } from '@/components/icons/AILogo'
const CitizenChatbot = dynamic(
  () => import('./CitizenChatbot'),
  {
    ssr:     false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#FAF8FF' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold"
            style={{ backgroundColor: '#4F46E5' }}
          >
            <AILogo type="netra" size={24} />
          </div>
          <p className="text-sm text-ink-400 animate-pulse">Loading NETRA…</p>
        </div>
      </div>
    ),
  }
)

export default function CitizenChatbotClient() {
  return <CitizenChatbot />
}
