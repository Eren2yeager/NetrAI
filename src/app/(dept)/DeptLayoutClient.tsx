'use client'

import { useState, useRef, useCallback } from 'react'
import SmartNavbar from '@/components/layout/SmartNavbar'
import AssistantPanel from '@/components/assistant/AssistantPanel'
import SahayChat from '@/components/assistant/SahayChat'
import MargChat from '@/components/assistant/MargChat'

interface DeptLayoutClientProps {
  role: 'dept_head' | 'field_officer'
  userName?: string
  children: React.ReactNode
}

export default function DeptLayoutClient({ role, userName, children }: DeptLayoutClientProps) {
  // Assistant panel state
  const [assistantOpen, setAssistantOpen] = useState(false)
  const sendRef = useRef<((t: string) => void) | null>(null)
  const handlePillClick = useCallback((text: string) => { sendRef.current?.(text) }, [])

  // Determine which chat component to use
  const persona = role === 'field_officer' ? 'marg' : 'sahay'
  const ChatComponent = role === 'field_officer' ? MargChat : SahayChat

  return (
    <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">
      <SmartNavbar
        role={role}
        userName={userName}
        onToggleAssistant={() => setAssistantOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <AssistantPanel
          persona={persona}
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onPillClick={handlePillClick}
        >
          <ChatComponent onSendRef={(fn) => { sendRef.current = fn }} />
        </AssistantPanel>
      </div>
    </div>
  )
}
