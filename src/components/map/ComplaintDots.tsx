'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Complaint Dots
// Leaflet CircleMarker layer rendered on top of the choropleth district layer.
// Each dot represents a complaint with GPS / pin-drop coordinates.
//
// Visual spec: Stitch Call 5 output
//   Critical  — 20px diameter, #DC2626, 2 pulsing concentric rings
//   High      — 14px diameter, #D97706
//   Medium    — 10px diameter, #2563EB
//   Low       —  7px diameter, #16A34A
//
// Popup on click: white card, CRITICAL badge, title, district·category,
// "View complaint →" link in brand-500.
//
// Must be used inside a component imported with dynamic({ ssr: false }) —
// Leaflet requires browser APIs.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { ComplaintDot } from '@/app/api/map/dots/route'

// ── Priority config (matches Stitch Call 5 spec) ──────────────────────────────

const PRIORITY_CONFIG: Record<string, { color: string; radius: number; label: string }> = {
  critical: { color: '#DC2626', radius: 10, label: 'CRITICAL' },
  high:     { color: '#D97706', radius:  7, label: 'HIGH'     },
  medium:   { color: '#2563EB', radius:  5, label: 'MEDIUM'   },
  low:      { color: '#16A34A', radius:  3, label: 'LOW'      },
}

// ── CSS injected once for the pulse animation ────────────────────────────────
// Can't use Tailwind keyframes here — this targets dynamically-created
// Leaflet DOM nodes outside React's rendering tree.

const PULSE_STYLE_ID = 'netraai-dot-pulse'

function injectPulseCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById(PULSE_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = PULSE_STYLE_ID
  style.textContent = `
    @keyframes netraai-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.5; }
      100% { transform: scale(2.8); opacity: 0;   }
    }
    .netraai-pulse-ring {
      position: absolute;
      border-radius: 50%;
      animation: netraai-pulse-ring 1.8s ease-out infinite;
      pointer-events: none;
    }
    .netraai-pulse-ring-outer {
      animation-delay: 0s;
    }
    .netraai-pulse-ring-inner {
      animation-delay: 0.6s;
    }
  `
  document.head.appendChild(style)
}

// ── Popup HTML builder ────────────────────────────────────────────────────────

function buildPopupHTML(dot: ComplaintDot): string {
  const cfg        = PRIORITY_CONFIG[dot.priority] ?? PRIORITY_CONFIG.low
  const isCritical = dot.priority === 'critical'
  const badgeBg    = isCritical ? '#FEF2F2' : '#FEF3C7'
  const badgeColor = isCritical ? '#DC2626'  : '#D97706'

  // Category label — capitalise first letter
  const catLabel = dot.category.charAt(0).toUpperCase() + dot.category.slice(1)

  return `
    <div style="
      font-family: Inter, system-ui, sans-serif;
      min-width: 200px;
      padding: 0;
    ">
      <!-- Priority badge -->
      <div style="
        display: inline-block;
        background: ${badgeBg};
        color: ${badgeColor};
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        margin-bottom: 6px;
        letter-spacing: 0.04em;
      ">
        ${cfg.label}
      </div>

      <!-- Title -->
      <p style="
        margin: 0 0 4px 0;
        font-size: 13px;
        font-weight: 700;
        color: #0F172A;
        line-height: 1.3;
      ">${dot.title}</p>

      <!-- Subtitle -->
      <p style="
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #94A3B8;
      ">
        ${catLabel} supply
      </p>

      <!-- CTA -->
      <a
        href="#"
        onclick="return false"
        style="
          font-size: 12px;
          color: #4F46E5;
          text-decoration: none;
          font-weight: 500;
        "
      >View complaint →</a>
    </div>
  `
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ComplaintDotsProps {
  /** The already-initialised Leaflet map instance from HotspotMap */
  map:  LeafletMap | null
  /** Whether the parent map is fully ready to accept layers */
  ready: boolean
}

export default function ComplaintDots({ map, ready }: ComplaintDotsProps) {
  // Keep refs to all markers so we can clean up on unmount / re-render
  const markersRef  = useRef<import('leaflet').CircleMarker[]>([])
  const fetchedRef  = useRef(false)

  useEffect(() => {
    if (!map || !ready || fetchedRef.current) return
    fetchedRef.current = true

    injectPulseCSS()

    async function addDots() {
      const L = await import('leaflet')

      let dots: ComplaintDot[] = []
      try {
        const res = await fetch('/api/map/dots', { cache: 'no-store' })
        if (res.ok) dots = await res.json()
      } catch {
        // Non-fatal — map still works without dots
        return
      }

      if (!map) return

      for (const dot of dots) {
        const cfg = PRIORITY_CONFIG[dot.priority] ?? PRIORITY_CONFIG.low

        const marker = L.circleMarker([dot.lat, dot.lng], {
          radius:      cfg.radius,
          fillColor:   cfg.color,
          fillOpacity: 1,
          color:       '#FFFFFF',      // thin white ring separates dot from district fill
          weight:      1.5,
        })

        marker.bindPopup(buildPopupHTML(dot), {
          maxWidth:    260,
          className:   'netraai-dot-popup',
          closeButton: true,
        })

        marker.addTo(map)
        markersRef.current.push(marker)

        // Pulsing rings for critical — injected as a custom Leaflet DivIcon
        // overlaid at the same coordinates, non-interactive
        if (dot.priority === 'critical') {
          const size = cfg.radius * 2   // px, matches circleMarker visual size

          const pulseIcon = L.divIcon({
            className: '',
            iconSize:  [size * 3, size * 3],
            iconAnchor:[size * 1.5, size * 1.5],
            html: `
              <div style="position:relative;width:${size * 3}px;height:${size * 3}px;">
                <div class="netraai-pulse-ring netraai-pulse-ring-outer" style="
                  width:${size}px;height:${size}px;
                  top:${size}px;left:${size}px;
                  background:${cfg.color};
                  opacity:0.3;
                "></div>
                <div class="netraai-pulse-ring netraai-pulse-ring-inner" style="
                  width:${size}px;height:${size}px;
                  top:${size}px;left:${size}px;
                  background:${cfg.color};
                  opacity:0.15;
                "></div>
              </div>
            `,
          })

          // Non-interactive pulse marker — purely decorative
          const pulseMarker = L.marker([dot.lat, dot.lng], {
            icon:        pulseIcon,
            interactive: false,
            zIndexOffset: -1,  // keep behind the circleMarker
          }).addTo(map)

          // Cast to satisfy the cleanup ref type
          markersRef.current.push(pulseMarker as unknown as import('leaflet').CircleMarker)
        }
      }
    }

    addDots()

    return () => {
      // Remove all markers when the component unmounts
      for (const m of markersRef.current) {
        m.remove()
      }
      markersRef.current = []
      fetchedRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready])

  // This component renders no DOM of its own — it only mutates the Leaflet map
  return null
}
