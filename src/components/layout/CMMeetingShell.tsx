'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — CMMeetingShell
// Client wrapper for the CM dashboard layout that manages Meeting Mode state.
//
// Meeting Mode:
//   - Hides the navbar
//   - Maximises content
//   - A floating "Exit Meeting Mode" pill appears in the top-right corner
//
// The toggle button lives in SmartNavbar and calls the shared context.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minimize2 } from 'lucide-react'

// ── Context ───────────────────────────────────────────────────────────────────

interface MeetingModeContextValue {
  meetingMode:  boolean
  toggleMeeting: () => void
}

const MeetingModeContext = createContext<MeetingModeContextValue>({
  meetingMode:   false,
  toggleMeeting: () => {},
})

export function useMeetingMode() {
  return useContext(MeetingModeContext)
}

// ── Shell component ───────────────────────────────────────────────────────────

interface CMMeetingShellProps {
  navbar: ReactNode
  banner: ReactNode
  children: ReactNode
  assistantPanel: ReactNode
}

export default function CMMeetingShell({
  navbar,
  banner,
  children,
  assistantPanel,
}: CMMeetingShellProps) {
  const [meetingMode, setMeetingMode] = useState(false)
  const toggleMeeting = useCallback(() => setMeetingMode((v) => !v), [])

  return (
    <MeetingModeContext.Provider value={{ meetingMode, toggleMeeting }}>
      <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">

        {/* ── Navbar + Banner — hidden but takes space in meeting mode ───── */}
        <div className="shrink-0">
          <AnimatePresence initial={false}>
            {!meetingMode && (
              <motion.div
                key="navbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {banner}
                {navbar}
              </motion.div>
            )}
            {meetingMode && (
              <div className="h-16" />
            )}
          </AnimatePresence>
        </div>

        {/* ── Main content + Assistant Panel ─────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          {!meetingMode && assistantPanel}
        </div>

        {/* ── Exit Meeting Mode pill — top-right corner ────────────────── */}
        <AnimatePresence>
          {meetingMode && (
            <motion.button
              key="exit-meeting"
              type="button"
              onClick={toggleMeeting}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              // aria-label="Exit Meeting Mode"
              className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1E1B4B' }}
            >
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Exit Meeting Mode
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </MeetingModeContext.Provider>
  )
}
