'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — ChatMessage
// Single message bubble in the citizen chatbot conversation.
// Reference: Stitch Call 6 — AI left / user right layout, avatar, typing dots.
//
// Variants:
//   role='assistant' — white card bubble, left-aligned, NETRA avatar
//   role='user'      — brand-500 bubble, right-aligned
//   isTyping         — three animated dots (replaces content)
//   imageUrl         — thumbnail + filename shown inside user bubble
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils'
import AILogo from '@/components/icons/AILogo'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessageData {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  imageUrl?: string          // user-attached image (Cloudinary URL or object-URL preview)
  fileName?: string          // original file name shown below thumbnail
  isTyping?: boolean         // true while AI is generating — shows dots animation
}

interface ChatMessageProps {
  message: ChatMessageData
}

// ── NETRA avatar ──────────────────────────────────────────────────────────────

function NetraAvatar() {
  return <AILogo type="netra" size={32} className="shrink-0" />
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" aria-label="NETRA is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-ink-300 inline-block"
          style={{
            animation:      'netraai-typing-bounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      {/* Keyframe injected inline — targets these DOM nodes outside React tree */}
      <style>{`
        @keyframes netraai-typing-bounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex items-end gap-2.5',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      {/* Avatar — AI only, left side */}
      {isAI && <NetraAvatar />}

      <div className={cn('flex flex-col gap-1', isAI ? 'items-start' : 'items-end', 'max-w-[75%]')}>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
            isAI
              ? 'bg-surface-0 border border-surface-200 text-ink-900'
              : message.imageUrl
                // image attachment bubble — white with brand border
                ? 'bg-surface-0 border-2 border-brand-500 text-ink-900'
                // plain user text — solid brand
                : 'text-white'
          )}
          style={
            !isAI && !message.imageUrl
              ? { backgroundColor: '#4F46E5' }
              : undefined
          }
        >
          {message.isTyping ? (
            <TypingDots />
          ) : message.imageUrl ? (
            // Image attachment preview
            <div className="space-y-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageUrl}
                alt={message.fileName ?? 'Attached image'}
                className="w-[140px] h-[90px] object-cover rounded-lg"
              />
              {message.fileName && (
                <p className="text-xs text-ink-400 font-mono truncate max-w-[140px]">
                  {message.fileName}
                </p>
              )}
            </div>
          ) : (
            // Regular text — preserve line breaks from AI responses
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {/* AI sub-label */}
        {isAI && !message.isTyping && (
          <span className="text-[11px] text-ink-400 px-1">
            NETRA · AI Assistant
          </span>
        )}
      </div>

      {/* No avatar on user side — right-aligned bubbles are self-evident */}
    </div>
  )
}
