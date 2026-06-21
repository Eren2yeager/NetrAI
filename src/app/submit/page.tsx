// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Citizen Complaint Submission Page
// Public route — no auth required.
// Full-page ProcessSteps guide + floating ChatDrawer FAB (bottom-right).
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import ProcessSteps from '@/components/illustrations/ProcessSteps'
import ChatDrawer from '@/components/chatbot/ChatDrawer'

export const metadata: Metadata = {
  title:       'Submit a Complaint — NetrAI',
  description: 'File a civic complaint with the Delhi Government using AI assistance.',
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-[#FAF8FF] relative">

      {/* ── Back link ── */}
      <div className="absolute top-6 left-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium
                     text-brand-500 hover:text-brand-600 transition-colors"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          NetrAI
        </Link>
      </div>

      {/* ── Full-page process guide ── */}
      <div className="flex items-center justify-center min-h-screen px-6 py-20 md:px-12 lg:px-24">
        <ProcessSteps />
      </div>

      {/* ── Floating chat panel (FAB + popover) ── */}
      <ChatDrawer />

    </main>
  )
}
