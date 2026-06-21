'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — NetraChat  (NETRA · CM persona)
// Connects to /api/assistant/cm with live KPI data.
// ─────────────────────────────────────────────────────────────────────────────

import { useAssistantChat } from './useAssistantChat'
import AssistantChatUI     from './AssistantChatUI'
import { PERSONA_CONFIG }  from './AssistantPanel'

export default function NetraChat({ onSendRef }: { onSendRef?: (fn: (t: string) => void) => void }) {
  const { messages, isLoading, sendMessage } = useAssistantChat({
    endpoint:   '/api/assistant/cm',
    storageKey: 'netraai-session-netra',
  })

  // Expose sendMessage to parent (AssistantPanel pill clicks)
  if (onSendRef) onSendRef(sendMessage)

  const cfg = PERSONA_CONFIG.netra

  return (
    <AssistantChatUI
      messages={messages}
      isLoading={isLoading}
      personaBadgeBg={cfg.badgeBg}
      personaLogoType={cfg.logoType}
      placeholder="Ask NETRA anything…"
      onSend={sendMessage}
    />
  )
}
