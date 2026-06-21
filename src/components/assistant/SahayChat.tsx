'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — SahayChat  (SAHAY · Dept Head persona)
// Connects to /api/assistant/dept with dept-specific data.
// ─────────────────────────────────────────────────────────────────────────────

import { useSession }      from 'next-auth/react'
import { useAssistantChat } from './useAssistantChat'
import AssistantChatUI     from './AssistantChatUI'
import { PERSONA_CONFIG }  from './AssistantPanel'

export default function SahayChat({ onSendRef }: { onSendRef?: (fn: (t: string) => void) => void }) {
  const { data: session } = useSession()
  const department = (session?.user as any)?.department as string | undefined

  const { messages, isLoading, sendMessage } = useAssistantChat({
    endpoint:   '/api/assistant/dept',
    storageKey: 'netraai-session-sahay',
    extraBody:  { department },
  })

  if (onSendRef) onSendRef(sendMessage)

  const cfg = PERSONA_CONFIG.sahay

  return (
    <AssistantChatUI
      messages={messages}
      isLoading={isLoading}
      personaBadgeBg={cfg.badgeBg}
      personaLogoType={cfg.logoType}
      placeholder="Ask SAHAY anything…"
      onSend={sendMessage}
    />
  )
}
