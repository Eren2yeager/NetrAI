'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ChatInput
// Bottom input bar for the citizen chatbot.
// Reference: Stitch Call 6 — 64px tall bar, paperclip + mic left,
//            text input centre, send button circle right.
//
// Features:
//   • Text input — Enter to send, Shift+Enter for newline
//   • Mic button — toggles AudioRecorder; red pulsing border on input when active
//   • Image attach — delegates to ImageAttachment component
//   • Disabled state — while AI is responding (isLoading)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioRecorder, RecordingIndicator } from './AudioRecorder'
import ImageAttachment, { type AttachmentResult } from './ImageAttachment'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend:           (text: string) => void
  onImageAttached:  (result: AttachmentResult) => void
  onImagePreview:   (previewUrl: string, fileName: string) => void
  onImageError:     (message: string) => void
  isLoading:        boolean   // true while AI is generating a response
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatInput({
  onSend,
  onImageAttached,
  onImagePreview,
  onImageError,
  isLoading,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const inputRef        = useRef<HTMLTextAreaElement>(null)

  // ── Audio recorder ──────────────────────────────────────────────────────────
  const { isRecording, toggle: toggleMic, supported: micSupported } = useAudioRecorder({
    onTranscript: (transcript) => {
      // Append transcript to existing text so partial typing isn't lost
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
      inputRef.current?.focus()
    },
    onUnsupported: () => {
      // CitizenChatbot doesn't handle this directly — we show the mic as disabled
    },
  })

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setText('')
    inputRef.current?.focus()
  }, [text, isLoading, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const canSend = text.trim().length > 0 && !isLoading

  return (
    <div className="border-t border-surface-200 bg-surface-0 px-3 py-2.5">

      {/* Recording indicator — shown above the input bar when mic is active */}
      {isRecording && (
        <div className="flex justify-center mb-2">
          <RecordingIndicator />
        </div>
      )}

      <div className="flex items-end gap-2">

        {/* ── Left icons: image attach + mic ─────────────────────────────── */}
        <div className="flex items-center gap-0.5 pb-1.5">

          {/* Image attach */}
          <ImageAttachment
            onPreview={onImagePreview}
            onUploaded={onImageAttached}
            onError={onImageError}
            disabled={isLoading}
          />

          {/* Mic */}
          {micSupported ? (
            <button
              type="button"
              onClick={toggleMic}
              disabled={isLoading}
              aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
              aria-pressed={isRecording}
              className={cn(
                'relative p-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                isRecording
                  ? 'text-status-critical'
                  : 'text-ink-400 hover:text-ink-600'
              )}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Mic className="h-5 w-5" aria-hidden="true" />
              )}

              {/* Red pulsing dot on mic icon when recording */}
              {isRecording && (
                <span
                  className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-status-critical"
                  style={{ animation: 'netraai-rec-pulse 1s ease-in-out infinite' }}
                  aria-hidden="true"
                />
              )}
            </button>
          ) : (
            /* Mic unavailable — show disabled icon */
            <button
              type="button"
              disabled
              aria-label="Voice input not supported in this browser"
              title="Voice input requires Chrome or Edge"
              className="p-1 text-ink-300 cursor-not-allowed"
            >
              <Mic className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ── Text input ──────────────────────────────────────────────────── */}
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Type in Hindi or English…"
          aria-label="Type your message"
          className={cn(
            'flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm text-ink-900',
            'placeholder:text-ink-400 bg-surface-0 transition-all',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            // Red pulsing border while mic is active
            isRecording
              ? 'border-status-critical focus:ring-status-critical/40 ring-1 ring-status-critical/30'
              : 'border-surface-200 focus:ring-brand-500'
          )}
          style={{
            // Auto-grow up to ~4 lines
            maxHeight: '96px',
            overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden',
          }}
        />

        {/* ── Send button ─────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-0.5',
            'transition-all',
            canSend
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
              : 'bg-surface-200 text-ink-400 cursor-not-allowed'
          )}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>

      </div>
    </div>
  )
}
