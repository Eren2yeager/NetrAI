'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Pin Drop Map (citizen, GPS-fallback)
// Shows Delhi with:
//   • A tile layer that includes street names + area labels (CartoDB voyager)
//   • Delhi district GeoJSON overlay — highlighted so citizen can orient
//     themselves by recognisable area names
//   • Click anywhere to drop a draggable pin
//   • District label tooltip on hover
// Calls onPinDrop(lat, lng, districtName?) on every pin placement.
// Must be dynamically imported with ssr:false.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

interface PinDropMapProps {
  onPinDrop: (lat: number, lng: number, district?: string) => void
}

// Custom brand-coloured pin icon — more visible than the default blue marker
const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 26 14 26S28 23.625 28 14C28 6.27 21.73 0 14 0z"
        fill="#4F46E5"/>
  <circle cx="14" cy="14" r="6" fill="#ffffff"/>
</svg>`

export default function PinDropMap({ onPinDrop }: PinDropMapProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<LeafletMap    | null>(null)
  const markerRef     = useRef<LeafletMarker | null>(null)
  const [pinLabel, setPinLabel] = useState<string | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    async function init() {
      const L = await import('leaflet')

      // ── Fix webpack-broken default icons ─────────────────────────────────
      // @ts-expect-error — _getIconUrl not in types
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // ── Custom brand pin icon ─────────────────────────────────────────────
      const pinIcon = L.divIcon({
        className:  '',
        iconSize:   [28, 40],
        iconAnchor: [14, 40],  // tip of the pin at click point
        popupAnchor:[0, -40],
        html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25))">${PIN_SVG}</div>`,
      })

      // ── Map initialisation ────────────────────────────────────────────────
      const map = L.map(containerRef.current!, {
        center:             [28.6139, 77.2090],  // Delhi centre
        zoom:               11,
        zoomControl:        true,
        attributionControl: true,  // keep attribution for tile provider compliance
      })

      // Voyager style — shows roads, area names, landmarks (not just bare tiles)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom:     19,
          attribution: '© <a href="https://carto.com/">CARTO</a>',
        }
      ).addTo(map)

      // ── Delhi district GeoJSON overlay ────────────────────────────────────
      // Loaded from the same file the CM map uses — no extra network asset
      let districtNames: Record<string, [number, number]> = {}  // name → centroid

      try {
        const res    = await fetch('/delhi-districts.geojson')
        const geojson = res.ok ? await res.json() : null

        if (geojson) {
          L.geoJSON(geojson, {
            style: () => ({
              fillColor:   '#4F46E5',
              fillOpacity: 0.08,       // very light tint — enough to see borders
              color:       '#4F46E5',  // indigo district border
              weight:      1.5,
              dashArray:   '4 3',      // dashed so it doesn't compete with road lines
            }),
            onEachFeature: (feature, layer) => {
              const name = feature?.properties?.district as string | undefined
              if (!name) return

              // Hover tooltip with district name
              ;(layer as any).bindTooltip(name, {
                permanent:  false,
                direction:  'center',
                className:  'netraai-district-tooltip',
                opacity:    0.95,
                sticky:     true,
              })

              // Track centroid for label lookup on pin drop
              const bounds = (layer as any).getBounds?.()
              if (bounds) {
                const c = bounds.getCenter()
                districtNames[name] = [c.lat, c.lng]
              }

              // Highlight on hover
              layer.on({
                mouseover: (e) => {
                  ;(e.target as any).setStyle({ fillOpacity: 0.18, weight: 2 })
                },
                mouseout: (e) => {
                  ;(e.target as any).setStyle({ fillOpacity: 0.08, weight: 1.5 })
                },
              })
            },
          }).addTo(map)
        }
      } catch {
        // GeoJSON load failure is non-fatal — map still works without overlay
      }

      // ── Click handler — place / move the pin ─────────────────────────────
      map.on('click', (e) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon:      pinIcon,
            draggable: true,
          }).addTo(map)

          markerRef.current.on('dragend', () => {
            const pos      = markerRef.current!.getLatLng()
            const district = findDistrict(pos.lat, pos.lng, districtNames)
            setPinLabel(district ?? null)
            onPinDrop(pos.lat, pos.lng, district)
          })
        }

        const district = findDistrict(lat, lng, districtNames)
        setPinLabel(district ?? null)
        onPinDrop(lat, lng, district)
      })

      mapRef.current = map
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current   = null
        markerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* Tooltip style — injected here because the element lives outside React tree */}
      <style>{`
        .netraai-district-tooltip {
          background: #1E1B4B;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
        }
        .netraai-district-tooltip::before {
          display: none;
        }
      `}</style>

      {/* Map container */}
      <div
        ref={containerRef}
        className="w-full h-[340px] rounded-xl overflow-hidden border border-surface-200"
        aria-label="Map — click to place a pin at the complaint location"
        role="application"
      />

      {/* Dynamic hint text */}
      {pinLabel ? (
        <p className="text-xs text-center font-medium text-brand-600 mt-1.5">
          📍 Pinned in <span className="font-semibold">{pinLabel}</span> — drag to adjust
        </p>
      ) : (
        <p className="text-xs text-ink-400 text-center mt-1.5">
          Click anywhere on the map to mark the issue location · hover over a district to see its name
        </p>
      )}
    </>
  )
}

// ── Utility: find which district a lat/lng falls closest to ──────────────────
// Uses centroid proximity — good enough for a citizen pin-drop UI.
// Avoids shipping a full point-in-polygon library.

function findDistrict(
  lat: number,
  lng: number,
  centroids: Record<string, [number, number]>
): string | undefined {
  let nearest: string | undefined
  let minDist = Infinity

  for (const [name, [clat, clng]] of Object.entries(centroids)) {
    const d = Math.hypot(lat - clat, lng - clng)
    if (d < minDist) {
      minDist = d
      nearest = name
    }
  }

  // Only return a name if the point is reasonably close to a centroid
  // (prevents labelling pins way outside Delhi)
  return minDist < 0.3 ? nearest : undefined
}
