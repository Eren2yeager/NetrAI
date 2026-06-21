'use client'

import { useState, useRef, useCallback } from 'react'
import SmartNavbar from '@/components/layout/SmartNavbar'
import EmergencyBanner from '@/components/layout/EmergencyBanner'
import CMMeetingShell from '@/components/layout/CMMeetingShell'
import AssistantPanel from '@/components/assistant/AssistantPanel'
import NetraChat from '@/components/assistant/NetraChat'

interface CMLayoutClientProps {
  userName?: string
  children: React.ReactNode
}

export default function CMLayoutClient({ userName, children }: CMLayoutClientProps) {
  // Assistant panel state
  const [assistantOpen, setAssistantOpen] = useState(false)
  const sendRef = useRef<((t: string) => void) | null>(null)
  const handlePillClick = useCallback((text: string) => { sendRef.current?.(text) }, [])

  return (
    <CMMeetingShell
      navbar={
        <SmartNavbar
          role="cm"
          userName={userName}
          onToggleAssistant={() => setAssistantOpen((v) => !v)}
        />
      }
      banner={<EmergencyBanner />}
      assistantPanel={
        <AssistantPanel
          persona="netra"
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onPillClick={handlePillClick}
        >
          <NetraChat onSendRef={(fn) => { sendRef.current = fn }} />
        </AssistantPanel>
      }
    >
      {children}
    </CMMeetingShell>
  )
}
