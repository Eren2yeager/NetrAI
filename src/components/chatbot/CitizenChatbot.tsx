'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — CitizenChatbot
// Full AI chatbot for citizen complaint submission.
// Reference: Stitch Call 6 — centered 680px, top bar, chat area, confirm card.
//
// Flow:
//   1. Mount → GPS requested silently in background
//   2. AI opens with a greeting in Hindi/English
//   3. User types / speaks / attaches image
//   4. Each message → POST /api/chatbot/citizen
//   5. Backend returns complaintReady:true → show ComplaintConfirmCard
//   6. Confirm → POST /api/chatbot/citizen/register → show SubmitSuccess
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic                                              from 'next/dynamic'
import ChatMessage,        { type ChatMessageData }    from './ChatMessage'
import ChatInput                                       from './ChatInput'
import ComplaintConfirmCard, { type ExtractedComplaint } from './ComplaintConfirmCard'
import SubmitSuccess                                   from '@/components/citizen/SubmitSuccess'
import type { AttachmentResult }                       from './ImageAttachment'
import type { ComplaintCoordinates }                   from '@/components/citizen/ComplaintForm'
import AILogo from '@/components/icons/AILogo'
import { MapPin, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'

// ── Lazy-load the pin-drop map (Leaflet needs browser APIs) ──────────────────
const PinDropMap = dynamic(() => import('@/components/citizen/PinDropMap'), {
  ssr:     false,
  loading: () => (
    <div className="w-full h-[220px] rounded-xl bg-surface-100 flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-ink-400 animate-spin" aria-hidden="true" />
    </div>
  ),
})
// ── Language toggle ──────────────────────────────────────────────────────────

const OPENING_MESSAGES: Record<'en' | 'hi', string> = {
  en: "Namaste! I'm NETRA, your AI assistant. I'll help you file a complaint with the Delhi Government. What's the issue?",
  hi: 'Namaste! Main NETRA hoon. Aapki complaint darj karne mein madad karunga. Kya samasya hai?',
}

// ── Unique ID generator (browser-safe) ───────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Helper: build a message object ───────────────────────────────────────────

function makeMsg(
  role: 'user' | 'assistant',
  content: string,
  extras?: Partial<ChatMessageData>
): ChatMessageData {
  return { id: uid(), role, content, ...extras }
}

// ── AI Analyzing overlay ──────────────────────────────────────────────────────
// Shown during complaint registration — steps through 4 stages.

const ANALYSIS_STEPS = [
  'Categorizing complaint…',
  'Scoring priority with AI…',
  'Detecting duplicates…',
  'Routing to department…',
]

function AnalyzingOverlay({ step }: { step: number }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-0/90 backdrop-blur-sm rounded-xl">
      <div className="flex flex-col items-center gap-4 px-6 py-8 max-w-xs text-center">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin"
          aria-hidden="true"
        />
        {/* Steps */}
        <div className="space-y-2 w-full">
          {ANALYSIS_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors"
                style={{
                  backgroundColor: i < step  ? '#16A34A'
                    : i === step ? '#4F46E5'
                    : '#E9ECEF',
                  color: i <= step ? '#ffffff' : '#94A3B8',
                }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className="text-xs transition-colors"
                style={{
                  color:      i === step ? '#0F172A' : i < step ? '#16A34A' : '#94A3B8',
                  fontWeight: i === step ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CitizenChatbot() {
  const sessionId   = useRef<string>(uid())
  const chatEndRef  = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  const [lang, setLang]                 = useState<'en' | 'hi'>('hi')
  const [messages, setMessages]         = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading]       = useState(false)
  const [coordinates, setCoordinates]   = useState<ComplaintCoordinates | null>(null)
  const [pendingImage, setPendingImage] = useState<AttachmentResult | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedComplaint | null>(null)
  const [complaintRef, setComplaintRef] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [analyzingStep, setAnalyzingStep]   = useState(-1)  // -1 = hidden
  const [locationMismatch, setLocationMismatch] = useState<{
    detectedDistrict: string
  } | null>(null)
  // Show pin-drop map when GPS denied OR mismatch detected
  const [showPinDrop, setShowPinDrop] = useState(false)

  // ── Opening message on mount ──────────────────────────────────────────────
  useEffect(() => {
    setMessages([makeMsg('assistant', OPENING_MESSAGES[lang])])
  // Only run on first mount — lang toggle handled separately below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Silent GPS capture ────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator?.geolocation) {
      setShowPinDrop(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          source:   'gps',
        })
      },
      () => {
        // GPS denied — will show pin-drop when complaint is ready
        setShowPinDrop(true)
      },
      { timeout: 8000, maximumAge: 60_000 }
    )
  }, [])

  // ── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Language toggle — re-show opening message in new language ────────────
  function toggleLang() {
    const next = lang === 'hi' ? 'en' : 'hi'
    setLang(next)
    setMessages([makeMsg('assistant', OPENING_MESSAGES[next])])
    setExtractedData(null)
    setPendingImage(null)
  }

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, imageResult?: AttachmentResult) => {
    if (isLoading) return

    // 1. Show user bubble immediately
    const userMsg = makeMsg('user', text, imageResult
      ? { imageUrl: imageResult.previewUrl, fileName: imageResult.fileName }
      : undefined
    )
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    // 2. Show typing indicator
    const typingId  = uid()
    const typingMsg = makeMsg('assistant', '', { id: typingId, isTyping: true })
    setMessages((prev) => [...prev, typingMsg])

    try {
      const body: Record<string, unknown> = {
        message:   text,
        sessionId: sessionId.current,
      }
      if (imageResult?.base64)   body.imageBase64   = imageResult.base64
      if (imageResult?.mimeType) body.imageMimeType  = imageResult.mimeType

      const res  = await fetch('/api/chatbot/citizen', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      // 3. Replace typing indicator with real reply
      const replyMsg = makeMsg('assistant', data.reply ?? 'Sorry, I could not process that.')
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        replyMsg,
      ])

      // 4. If complaint data is ready, verify location before showing confirm card
      if (data.complaintReady && data.complaintData) {
        await verifyComplaintLocation(data.complaintData)
      }
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        makeMsg('assistant', 'Network error. Please check your connection and try again.'),
      ])
    } finally {
      setIsLoading(false)
      setPendingImage(null)
    }
  }, [isLoading])

  // ── Verify location match between GPS coords and AI-extracted district ──────
  // Called when the AI returns COMPLAINT_READY.
  // If coords are available and mismatch → open pin-drop, else show confirm card.
  const verifyComplaintLocation = useCallback(async (complaint: ExtractedComplaint) => {
    setExtractedData(complaint)

    // No coords at all → skip verification, go straight to confirm card
    if (!coordinates?.lat || !coordinates?.lng) {
      // If we know GPS was denied, pin-drop is already visible — still show card
      return
    }

    try {
      const res = await fetch('/api/complaints/verify-location', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          lat:              coordinates.lat,
          lng:              coordinates.lng,
          selectedDistrict: complaint.district,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (!data.match && data.detectedDistrict) {
          // Mismatch — surface the pin-drop map with a warning message
          setLocationMismatch({ detectedDistrict: data.detectedDistrict })
          setShowPinDrop(true)
          setMessages((prev) => [
            ...prev,
            makeMsg(
              'assistant',
              `📍 I noticed your GPS location points to **${data.detectedDistrict}**, but you mentioned **${complaint.district}**. Please drop a pin on the map to confirm the correct location before submitting.`
            ),
          ])
          return
        }
      }
      // Match or API error → proceed normally
    } catch {
      // Fail open
    }
  }, [coordinates])

  // ── Handle text send ──────────────────────────────────────────────────────
  const handleSend = useCallback((text: string) => {
    sendMessage(text, pendingImage ?? undefined)
  }, [sendMessage, pendingImage])

  // ── Handle image preview (show in chat immediately) ───────────────────────
  const handleImagePreview = useCallback((previewUrl: string, fileName: string) => {
    // Add the image bubble to chat right away — upload happens in background
    const imgMsg = makeMsg('user', '', { imageUrl: previewUrl, fileName })
    setMessages((prev) => [...prev, imgMsg])
  }, [])

  // ── Handle image fully uploaded ───────────────────────────────────────────
  const handleImageUploaded = useCallback((result: AttachmentResult) => {
    // Replace preview URL in the last image bubble with the Cloudinary URL
    setMessages((prev) => prev.map((m) =>
      m.imageUrl === result.previewUrl
        ? { ...m, imageUrl: result.cloudinaryUrl }
        : m
    ))
    // Store result — next text send will include base64 for vision
    setPendingImage(result)
    // Auto-send a prompt so the AI knows an image was attached
    sendMessage('(image attached — see photo)', result)
  }, [sendMessage])

  // ── Handle image error ────────────────────────────────────────────────────
  const handleImageError = useCallback((message: string) => {
    setMessages((prev) => [...prev, makeMsg('assistant', `⚠️ ${message}`)])
  }, [])

  // ── Confirm complaint ─────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!extractedData) return
    setConfirmLoading(true)

    // Step through the analysis overlay (each step ~600ms for UX)
    setAnalyzingStep(0)
    const stepTimer = setInterval(() => {
      setAnalyzingStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, 650)

    try {
      const res = await fetch('/api/chatbot/citizen/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          complaintData: extractedData,
          coordinates:   coordinates ?? undefined,
          imageUrl:      pendingImage?.cloudinaryUrl ?? undefined,
          sessionId:     sessionId.current,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          makeMsg('assistant', `Registration failed: ${data.error ?? 'Unknown error'}`),
        ])
        return
      }

      setComplaintRef(data.complaintRef)
    } catch {
      setMessages((prev) => [
        ...prev,
        makeMsg('assistant', 'Network error during submission. Please try again.'),
      ])
    } finally {
      setConfirmLoading(false)
      setAnalyzingStep(-1)
    }
  }, [extractedData, coordinates, pendingImage])

  // ── Edit — dismiss confirm card, let user continue chatting ──────────────
  const handleEdit = useCallback(() => {
    setExtractedData(null)
    setLocationMismatch(null)
    setMessages((prev) => [
      ...prev,
      makeMsg('assistant', 'No problem! What would you like to change? You can describe the correction and I will update the details.'),
    ])
  }, [])

  // ── Success state ─────────────────────────────────────────────────────────
  if (complaintRef) {
    return (
      <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto">
        <SubmitSuccess complaintRef={complaintRef} />
      </div>
    )
  }

  // ── Main chat UI ──────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col flex-1 min-h-0 bg-[#F8F9FA]">

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white
                      border-b border-surface-200 shrink-0">
        {/* NETRA identity */}
        <div className="flex items-center gap-2.5">
          {/* Avatar badge */}
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <AILogo type="netra" size={24} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-ink-900">NETRA</span>
            <span className="text-[11px] text-ink-400">AI Assistant</span>
          </div>
          {/* Live indicator */}
          <span className="w-2 h-2 rounded-full bg-status-success ml-1 shrink-0" aria-hidden="true" />
        </div>

        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLang}
          aria-label={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
          className="flex items-center rounded-full border border-surface-200 overflow-hidden
                     text-[12px] font-semibold"
        >
          <span
            className="px-3 py-1.5 transition-colors"
            style={lang === 'en'
              ? { backgroundColor: '#4F46E5', color: '#ffffff' }
              : { color: '#94A3B8' }}
          >
            EN
          </span>
          <span
            className="px-3 py-1.5 transition-colors"
            style={lang === 'hi'
              ? { backgroundColor: '#4F46E5', color: '#ffffff' }
              : { color: '#94A3B8' }}
          >
            हिं
          </span>
        </button>
      </div>

      {/* ── Chat area ──────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8F9FA]"
        style={{ minHeight: 0 }}
        aria-live="polite"
        aria-label="Conversation with NETRA"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* ── Location pin-drop + Confirm card — scrollable bottom panel ──── */}
      {extractedData && !complaintRef && (
        <div className="overflow-y-auto shrink-0 max-h-[60%] border-t border-surface-200 bg-white">
          <div className="px-4 pt-3 pb-1 space-y-2">

            {/* Pin-drop section — only when needed */}
            {showPinDrop && (
              <>
                {/* Mismatch warning banner */}
                {locationMismatch && (
                  <div className="flex gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">Location mismatch: </span>
                      Your GPS points to <span className="font-semibold">{locationMismatch.detectedDistrict}</span>.
                      Drop a pin to confirm the actual issue location.
                    </p>
                  </div>
                )}

                {/* GPS denied — no coords at all */}
                {!locationMismatch && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 border border-surface-200">
                    <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                    <p className="text-xs text-ink-600">
                      Drop a pin to attach the exact location to your complaint.
                    </p>
                  </div>
                )}

                {/* Compact map — 200px so confirm card stays reachable */}
                <PinDropMap
                  mapClassName="h-[200px]"
                  onPinDrop={(lat, lng) => {
                    setCoordinates({ lat, lng, source: 'pin' })
                    setLocationMismatch(null)
                  }}
                />

                {/* Confirmation pill once pin is placed */}
                {coordinates?.source === 'pin' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-brand-700 font-medium">
                      Pin placed at {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Confirm card */}
            <div className="relative pb-3">
              {analyzingStep >= 0 && (
                <AnalyzingOverlay step={analyzingStep} />
              )}
              <ComplaintConfirmCard
                data={extractedData}
                imageUrl={pendingImage?.cloudinaryUrl}
                onConfirm={handleConfirm}
                onEdit={handleEdit}
                isLoading={confirmLoading}
              />
            </div>

          </div>
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      {!extractedData && (
        <div className="shrink-0">
          <ChatInput
            onSend={handleSend}
            onImageAttached={handleImageUploaded}
            onImagePreview={handleImagePreview}
            onImageError={handleImageError}
            isLoading={isLoading}
          />
        </div>
      )}

    </div>
  )
}
