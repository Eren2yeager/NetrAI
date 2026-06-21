'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AssistantChatUI
// Shared chat UI used by NetraChat, SahayChat, MargChat.
// Renders the scrollable message list + bottom input bar.
// Persona colours come from PERSONA_CONFIG via the `personaBadgeBg` prop.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssistantMessage } from './useAssistantChat'
import AILogo, { AILogoType } from '@/components/icons/AILogo'

interface AssistantChatUIProps {
  messages:       AssistantMessage[]
  isLoading:      boolean
  personaBadgeBg: string    // badge background colour — used for user bubbles
  personaLogoType: AILogoType    // AI logo type for avatar
  placeholder:    string
  onSend:         (text: string) => void
}

// ── Blinking cursor shown while streaming ─────────────────────────────────────

function StreamCursor() {
  return (
    <span
      className="inline-block w-0.5 h-3.5 bg-ink-400 ml-0.5 align-middle"
      style={{ animation: 'netraai-blink 0.8s step-start infinite' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes netraai-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </span>
  )
}

export default function AssistantChatUI({
  messages,
  isLoading,
  personaBadgeBg,
  personaLogoType,
  placeholder,
  onSend,
}: AssistantChatUIProps) {
  const [input,    setInput]    = useState('')
  const endRef     = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
    inputRef.current?.focus()
  }, [input, isLoading, onSend])

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const canSend = input.trim().length > 0 && !isLoading

  return (
    <>
      {/* ── Message list ───────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        aria-live="polite"
        aria-label="Assistant conversation"
      >
        {messages.length === 0 && (
          <div className="text-xs h-full  text-center flex items-center justify-center">
            <div className="flex items-center justify-center flex-col gap-2">
              <AILogo type={personaLogoType} size={50} />
              <div>
                Ask a question to get started.
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isAI = msg.role === 'assistant'

          return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2',
                isAI ? 'justify-start' : 'justify-end'
              )}
            >
              {/* AI avatar */}
              {isAI && <AILogo type={personaLogoType} size={28} className="shrink-0" />}

              {/* Bubble */}
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  isAI
                    ? 'bg-surface-100 border border-surface-200 text-ink-900'
                    : 'text-white'
                )}
                style={!isAI ? { backgroundColor: personaBadgeBg } : undefined}
              >
                <span className="whitespace-pre-wrap">{msg.content}</span>
                {msg.streaming && <StreamCursor />}
              </div>
            </div>
          )
        })}

        <div ref={endRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-surface-200 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder={placeholder}
            aria-label="Type your message"
            className={cn(
              'flex-1 resize-none rounded-xl border border-surface-200 px-3 py-2.5',
              'text-sm text-ink-900 placeholder:text-ink-400 bg-surface-0',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'transition disabled:opacity-60 disabled:cursor-not-allowed',
            )}
            style={{ maxHeight: '80px', overflowY: input.split('\n').length > 2 ? 'auto' : 'hidden' }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all mb-0.5',
              canSend
                ? 'text-white shadow-sm hover:opacity-90'
                : 'bg-surface-200 text-ink-400 cursor-not-allowed'
            )}
            style={canSend ? { backgroundColor: personaBadgeBg } : undefined}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
