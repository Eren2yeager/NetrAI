'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — useAssistantChat
// Shared hook for all three AI persona chats (NETRA · SAHAY · MARG).
// Handles:
//   - sessionId generation (persisted in sessionStorage per persona)
//   - message state
//   - streaming fetch from the given endpoint
//   - word-by-word display as chunks arrive
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AssistantMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  streaming?: boolean   // true while the last assistant message is still arriving
}

interface UseAssistantChatOptions {
  endpoint:    string              // e.g. '/api/assistant/cm'
  storageKey:  string              // sessionStorage key for sessionId
  extraBody?:  Record<string, unknown>  // extra fields added to every request body
}

function uid() { return Math.random().toString(36).slice(2, 10) }

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAssistantChat({
  endpoint,
  storageKey,
  extraBody = {},
}: UseAssistantChatOptions) {
  const [messages,  setMessages]  = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Stable sessionId — persisted in sessionStorage, initialised once
  const sessionId = useRef<string>('')

  // Lazily initialise on first access (avoids SSR issues with sessionStorage)
  if (!sessionId.current) {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        sessionId.current = stored
      } else {
        const fresh = uid()
        sessionStorage.setItem(storageKey, fresh)
        sessionId.current = fresh
      }
    } else {
      sessionId.current = uid()
    }
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    // Cancel any in-flight stream
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    // 1. Add user bubble immediately
    const userMsg: AssistantMessage = { id: uid(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    // 2. Placeholder for streaming assistant bubble
    const assistantId = uid()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:   text,
          sessionId: sessionId.current,
          ...extraBody,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I could not process that request.', streaming: false }
            : m
        ))
        return
      }

      // 3. Stream words as they arrive
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })

        // Update the assistant bubble with accumulated text so far
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: accumulated, streaming: true }
            : m
        ))
      }

      // 4. Mark streaming as done — removes blinking cursor
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: accumulated, streaming: false }
          : m
      ))

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return   // user navigated away

      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: 'Network error. Please try again.', streaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, extraBody, isLoading])

  const clearMessages = useCallback(() => setMessages([]), [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    sessionId: sessionId.current as string,
  }
}
