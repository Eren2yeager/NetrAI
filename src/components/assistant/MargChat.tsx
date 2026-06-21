'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — MargChat  (MARG · Field Officer persona)
// Connects to /api/assistant/officer with officer-specific data.
// ─────────────────────────────────────────────────────────────────────────────

import { useSession }      from 'next-auth/react'
import { useAssistantChat } from './useAssistantChat'
import AssistantChatUI     from './AssistantChatUI'
import { PERSONA_CONFIG }  from './AssistantPanel'

export default function MargChat({ onSendRef }: { onSendRef?: (fn: (t: string) => void) => void }) {
  const { data: session } = useSession()
  const officerName = session?.user?.name ?? undefined

  const { messages, isLoading, sendMessage } = useAssistantChat({
    endpoint:   '/api/assistant/officer',
    storageKey: 'netraai-session-marg',
    extraBody:  { officerName },
  })

  if (onSendRef) onSendRef(sendMessage)

  const cfg = PERSONA_CONFIG.marg

  return (
    <AssistantChatUI
      messages={messages}
      isLoading={isLoading}
      personaBadgeBg={cfg.badgeBg}
      personaLogoType={cfg.logoType}
      placeholder="Ask MARG anything…"
      onSend={sendMessage}
    />
  )
}
