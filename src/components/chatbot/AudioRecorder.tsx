'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — AudioRecorder
// Web Speech API wrapper for the citizen chatbot mic button.
// No API key, no cost — purely browser-native.
//
// Behaviour:
//   • toggle() starts or stops recognition
//   • Tries hi-IN first, falls back to en-IN on error
//   • Calls onTranscript(text) with the final recognised text
//   • Shows a red pulsing dot while recording (passed as isRecording prop)
//
// Browser support: Chrome / Edge only.
// Firefox and Safari show a graceful warning via onUnsupported callback.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useCallback, useEffect } from 'react'

// Web Speech API types — not in lib.dom.d.ts by default
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognition extends EventTarget {
  lang:           string
  continuous:     boolean
  interimResults: boolean
  start():  void
  stop():   void
  onresult: ((e: SpeechRecognitionEvent) => void)       | null
  onerror:  ((e: SpeechRecognitionErrorEvent) => void)  | null
  onend:    (() => void)                                 | null
}
declare const SpeechRecognition:     new () => SpeechRecognition
declare const webkitSpeechRecognition: new () => SpeechRecognition

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseAudioRecorderOptions {
  onTranscript:   (text: string) => void
  onUnsupported?: () => void
}

export function useAudioRecorder({ onTranscript, onUnsupported }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const recRef        = useRef<SpeechRecognition | null>(null)
  const langRef       = useRef<'hi-IN' | 'en-IN'>('hi-IN')
  const triedFallback = useRef(false)

  // Check browser support once on mount
  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  function buildRecognition(lang: 'hi-IN' | 'en-IN'): SpeechRecognition {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec: SpeechRecognition = new SR()
    rec.lang           = lang
    rec.continuous     = false   // single utterance per press
    rec.interimResults = false

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) onTranscript(transcript)
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      // If Hindi fails on first try, retry with English
      if (e.error === 'language-not-supported' && !triedFallback.current) {
        triedFallback.current = true
        langRef.current       = 'en-IN'
        recRef.current        = buildRecognition('en-IN')
        recRef.current.start()
        return
      }
      setIsRecording(false)
    }

    rec.onend = () => {
      setIsRecording(false)
    }

    return rec
  }

  const toggle = useCallback(() => {
    if (!supported) {
      onUnsupported?.()
      return
    }

    if (isRecording) {
      recRef.current?.stop()
      setIsRecording(false)
      return
    }

    // Fresh recognition instance every time — reusing a stopped instance is unreliable
    triedFallback.current = false
    recRef.current        = buildRecognition(langRef.current)
    recRef.current.start()
    setIsRecording(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, supported])

  // Stop on unmount
  useEffect(() => {
    return () => { recRef.current?.stop() }
  }, [])

  return { isRecording, toggle, supported }
}

// ── Recording indicator pill ──────────────────────────────────────────────────
// Shown inside ChatInput when isRecording is true.

export function RecordingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200">
      <span
        className="w-2 h-2 rounded-full bg-status-critical shrink-0"
        style={{ animation: 'netraai-rec-pulse 1s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-status-critical">Recording…</span>
      <style>{`
        @keyframes netraai-rec-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  )
}
