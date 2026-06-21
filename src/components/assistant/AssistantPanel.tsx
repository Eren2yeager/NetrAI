'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AssistantPanel
// Shared sliding panel shell for all three AI personas (NETRA · SAHAY · MARG).
// Reference: Stitch Call 7 — 380px, right-anchored, Framer Motion slide-in,
//            persona badge, suggested pills, chat area, input bar.
//
// Usage:
//   <AssistantPanel persona="netra" isOpen={open} onClose={() => setOpen(false)}>
//     <NetraChat sessionId={sid} onSend={handleSend} messages={msgs} isLoading={…} />
//   </AssistantPanel>
//
// The parent (sidebar) owns:
//   - open/close state
//   - sessionId
//   - message list + send handler
// This component owns only the visual shell.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import AILogo, { AILogoType } from '@/components/icons/AILogo'

// ── Persona config ────────────────────────────────────────────────────────────

export type AssistantPersona = 'netra' | 'sahay' | 'marg'

interface PersonaConfig {
  initial:   string          // badge letter (kept for backward compatibility)
  badgeBg:   string          // badge background colour
  name:      string          // display name
  subtitle:  string          // role subtitle
  pills:     string[]        // suggested quick questions
  logoType:  AILogoType      // AI logo type
}

export const PERSONA_CONFIG: Record<AssistantPersona, PersonaConfig> = {
  netra: {
    initial:  'N',
    badgeBg:  '#4F46E5',
    name:     'NETRA',
    subtitle: "CM's AI Chief of Staff",
    pills:    ["Today's top priority?", 'Which dept is failing?', 'Simulate East Delhi'],
    logoType: 'netra',
  },
  sahay: {
    initial:  'S',
    badgeBg:  '#0D9488',
    name:     'SAHAY',
    subtitle: 'Dept Operations Assistant',
    pills:    ['My SLA breaches?', 'Who is overloaded?', 'Pending escalations?'],
    logoType: 'sahay',
  },
  marg: {
    initial:  'M',
    badgeBg:  '#D97706',
    name:     'MARG',
    subtitle: 'Field Guide',
    pills:    ['My next complaint?', 'How do I update status?', 'Navigate to location'],
    logoType: 'marg',
  },
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssistantPanelProps {
  persona:    AssistantPersona
  isOpen:     boolean
  onClose:    () => void
  onPillClick:(text: string) => void
  children:   React.ReactNode   // persona-specific chat content
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssistantPanel({
  persona,
  isOpen,
  onClose,
  onPillClick,
  children,
}: AssistantPanelProps) {
  const cfg = PERSONA_CONFIG[persona]

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          key="panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-0 border-l border-surface-200 flex flex-col shrink-0 overflow-hidden"
          style={{ boxShadow: '-8px 0 32px rgba(15,23,42,0.10)' }}
        >

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="h-16 flex items-center gap-3 px-4  border-surface-200 shrink-0">
              {/* Persona logo */}
              <AILogo type={cfg.logoType} size={36} className="shrink-0" />

              {/* Name + subtitle */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-ink-900 leading-tight">{cfg.name}</p>
                <p className="text-xs text-ink-400">{cfg.subtitle}</p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${cfg.name} assistant`}
                className="text-ink-400 hover:text-ink-600 transition-colors p-1 rounded-lg hover:bg-surface-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* ── Suggested pills ──────────────────────────────────────── */}
            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto shrink-0  border-surface-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {cfg.pills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => onPillClick(pill)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors hover:opacity-80"
                  style={{ backgroundColor: '#E0E7FF', color: '#1E1B4B' }}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* ── Chat content — provided by persona component ────────── */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {children}
            </div>

        </motion.aside>
      )}
    </AnimatePresence>
  )
}
