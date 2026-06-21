'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Location Capture
// Client component that sits above ComplaintForm on the /submit page.
// Responsibilities:
//   1. On mount — silently call navigator.geolocation.getCurrentPosition()
//   2. If granted   → store coordinates (source: 'gps'), show a small green
//                     confirmation pill so the citizen knows location is attached
//   3. If denied / unavailable → show a mini Leaflet pin-drop map (350px tall)
//                     so the citizen can manually place a pin (source: 'pin')
//   4. Pass the captured coordinates down to <ComplaintForm> as a prop
//
// The GPS request is fire-and-forget — it never blocks form submission.
// The pin-drop map is only shown when GPS explicitly fails.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, CheckCircle2, Loader2 } from 'lucide-react'
import ComplaintForm, { type ComplaintCoordinates } from './ComplaintForm'

// ── Pin-drop map — dynamically imported (Leaflet needs browser APIs) ───────────

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
  const [gpsStatus,   setGpsStatus]   = useState<GpsStatus>('requesting')
  const [coordinates, setCoordinates] = useState<ComplaintCoordinates | null>(null)
  const triedRef = useRef(false)

  // ── Request GPS on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (triedRef.current) return
    triedRef.current = true

    if (!navigator?.geolocation) {
      setGpsStatus('unavailable')
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
        // Permission denied or timeout — show pin-drop map
        setGpsStatus('denied')
      },
      { timeout: 8000, maximumAge: 60_000 }
    )
  }, [])

  // Called by PinDropMap when the citizen clicks to place / move a pin
  function handlePinDrop(lat: number, lng: number, district?: string) {
    setCoordinates({ lat, lng, source: 'pin' })
    // If the map could identify the district, we surface it in the pill below
    void district  // used indirectly via coordinates state label in PinDropMap itself
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

      {/* ── GPS granted — green pill confirmation ── */}
      {gpsStatus === 'granted' && coordinates && (
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

      {/* ── GPS denied / unavailable — pin-drop map ── */}
      {(gpsStatus === 'denied' || gpsStatus === 'unavailable') && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-ink-600">
              Location access unavailable.{' '}
              <span className="font-medium text-ink-900">
                Drop a pin on the map to mark the issue location.
              </span>
            </p>
          </div>

          <PinDropMap onPinDrop={(lat, lng, district) => handlePinDrop(lat, lng, district)} />

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

      {/* ── Complaint form — always rendered, coordinates passed as prop ── */}
      <ComplaintForm coordinates={coordinates} />
    </div>
  )
}
