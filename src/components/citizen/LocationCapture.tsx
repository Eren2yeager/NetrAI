'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Location Capture
// Client component that sits above ComplaintForm on the /submit page.
// Responsibilities:
//   1. On mount — silently call navigator.geolocation.getCurrentPosition()
//   2. If granted   → store coordinates (source: 'gps'), show a green pill
//   3. If denied / unavailable → show a mini Leaflet pin-drop map (350px tall)
//   4. Pass coordinates + a `requestPinDrop` callback down to <ComplaintForm>
//      so the form can force the pin-drop open when the AI detects a mismatch
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import ComplaintForm, { type ComplaintCoordinates } from './ComplaintForm'

// ── Pin-drop map — dynamically imported (Leaflet needs browser APIs) ──────────

const PinDropMap = dynamic(() => import('./PinDropMap'), {
  ssr:     false,
  loading: () => (
    <div className="w-full h-[280px] rounded-xl bg-surface-100 flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-ink-400 animate-spin" aria-hidden="true" />
    </div>
  ),
})

// ── GPS status ────────────────────────────────────────────────────────────────

type GpsStatus = 'requesting' | 'granted' | 'denied' | 'unavailable'

export default function LocationCapture() {
  const [gpsStatus,    setGpsStatus]    = useState<GpsStatus>('requesting')
  const [coordinates,  setCoordinates]  = useState<ComplaintCoordinates | null>(null)
  // showPinDrop is true when GPS is denied/unavailable OR when the form
  // requests it because the AI detected a district mismatch
  const [showPinDrop,  setShowPinDrop]  = useState(false)
  const triedRef = useRef(false)

  // ── Request GPS on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (triedRef.current) return
    triedRef.current = true

    if (!navigator?.geolocation) {
      setGpsStatus('unavailable')
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
        setGpsStatus('granted')
      },
      () => {
        setGpsStatus('denied')
        setShowPinDrop(true)
      },
      { timeout: 8000, maximumAge: 60_000 }
    )
  }, [])

  // Called by PinDropMap when the citizen clicks to place / move a pin
  function handlePinDrop(lat: number, lng: number) {
    setCoordinates({ lat, lng, source: 'pin' })
  }

  // Called by ComplaintForm when AI detects a mismatch — re-opens pin-drop
  function handleRequestPinDrop() {
    setShowPinDrop(true)
    // Scroll the pin-drop map into view smoothly
    setTimeout(() => {
      document.getElementById('netraai-pindrop-anchor')?.scrollIntoView({
        behavior: 'smooth',
        block:    'center',
      })
    }, 100)
  }

  return (
    <div className="space-y-4">

      {/* ── GPS requesting — subtle spinner, doesn't block form ── */}
      {gpsStatus === 'requesting' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 border border-surface-200">
          <Loader2 className="h-3.5 w-3.5 text-ink-400 animate-spin shrink-0" aria-hidden="true" />
          <span className="text-xs text-ink-400">Detecting your location…</span>
        </div>
      )}

      {/* ── GPS granted + no mismatch request — green pill ── */}
      {gpsStatus === 'granted' && !showPinDrop && coordinates && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-status-success shrink-0" aria-hidden="true" />
          <span className="text-xs text-status-success font-medium">
            Location attached automatically
          </span>
          <span className="text-xs text-ink-400 ml-auto font-mono">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* ── Pin-drop map — shown when GPS denied OR mismatch detected ── */}
      {showPinDrop && (
        <div id="netraai-pindrop-anchor" className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-ink-600">
              {gpsStatus === 'granted'
                ? <span>
                    <span className="font-medium text-ink-900">Your GPS location doesn&apos;t match the selected district.</span>{' '}
                    Drop a pin to confirm the correct location.
                  </span>
                : <span>
                    Location access unavailable.{' '}
                    <span className="font-medium text-ink-900">
                      Drop a pin on the map to mark the issue location.
                    </span>
                  </span>
              }
            </p>
          </div>

          <PinDropMap onPinDrop={(lat, lng, district) => handlePinDrop(lat, lng)} />

          {coordinates && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0" aria-hidden="true" />
              <span className="text-xs text-brand-700 font-medium">
                Pin placed at {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Complaint form — always rendered ── */}
      <ComplaintForm
        coordinates={coordinates}
        onRequestPinDrop={handleRequestPinDrop}
      />
    </div>
  )
}
