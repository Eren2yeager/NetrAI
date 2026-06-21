'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ChatDrawer
// Floating chat panel — anchored bottom-right.
// Trigger: FAB button. Panel slides up with Framer Motion.
// Contains the full CitizenChatbot (lazy-loaded, ssr:false via CitizenChatbotClient).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import AILogo from '@/components/icons/AILogo'

// Lazy-load the heavy chatbot — ssr:false is required
const CitizenChatbot = dynamic(() => import('./CitizenChatbot'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-brand-100 border-t-brand-500 animate-spin" />
        <p className="text-xs text-ink-400">Loading NETRA…</p>
      </div>
    </div>
  ),
})

// ── Panel animation ───────────────────────────────────────────────────────────

const panelVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0, 0, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0, y: 16, scale: 0.97,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close NETRA chat' : 'Open NETRA — file a complaint'}
        aria-expanded={open}
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2.5 pl-3 pr-4 h-14
                   rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg
                   transition-all active:scale-95 focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {/* NETRA logo or X */}
        <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          {open ? (
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.75"
                    strokeLinecap="round" />
            </svg>
          ) : (
            <AILogo type="netra" size={22} />
          )}
        </span>
        <span className="text-[14px] font-semibold leading-none">
          {open ? 'Close' : 'Talk to NETRA'}
        </span>
      </button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — mobile only */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              // Position: bottom-right on desktop, full-screen on mobile
              className={[
                'fixed z-50 flex flex-col',
                'bg-white border border-surface-200 rounded-2xl shadow-xl overflow-hidden',
                // Desktop: anchored bottom-right, fixed size, viewport-safe
                'lg:bottom-24 lg:right-4 lg:w-[min(420px,calc(100vw-2rem))] lg:h-[min(620px,calc(100vh-7rem))]',
                // Mobile: full screen
                'inset-0 lg:inset-auto rounded-none lg:rounded-2xl',
              ].join(' ')}
              role="dialog"
              aria-label="NETRA AI Assistant — file a complaint"
              aria-modal="true"
            >
              <CitizenChatbot />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
