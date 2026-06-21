'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hotspot Map
// Leaflet choropleth map of Delhi districts coloured by complaint density.
// Must be imported with dynamic({ ssr: false }) — Leaflet requires browser APIs.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import type { DistrictData } from '@/types'
import type { MapFilterState } from './MapFilters'
import ComplaintDots from './ComplaintDots'

// Leaflet types only — actual import happens inside useEffect (client-only)
type LeafletMap     = import('leaflet').Map
type LeafletLayer   = import('leaflet').Layer
type LeafletGeoJSON = import('leaflet').GeoJSON

// ── Colour helpers ────────────────────────────────────────────────────────────

function densityColor(density: DistrictData['density']): string {
  if (density === 'high')   return '#4F46E5'
  if (density === 'medium') return '#A5B4FC'
  return '#E0E7FF'
}

interface HotspotMapProps {
  districtData:      DistrictData[]
  selectedDistrict:  string | null
  onDistrictClick:   (district: string) => void
  filters:           MapFilterState
}

export default function HotspotMap({
  districtData,
  selectedDistrict,
  onDistrictClick,
}: HotspotMapProps) {
  const mapRef      = useRef<LeafletMap | null>(null)
  const geoLayerRef = useRef<LeafletGeoJSON | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)

  // Build a quick lookup from districtData
  const dataByDistrict = Object.fromEntries(
    districtData.map((d) => [d.name, d])
  )

  // ── Initialise Leaflet (client-only) ────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    let L: typeof import('leaflet')

    async function init() {
      L = await import('leaflet')

      // Fix default marker icon paths broken by webpack
      // @ts-expect-error — _getIconUrl is not in types
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Create map centred on Delhi
      const map = L.map(containerRef.current!, {
        center:            [28.6139, 77.2090],
        zoom:              11,
        zoomControl:       true,
        attributionControl: false,
      })

      // Tile layer — CartoDB light (clean, no visual noise)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map)

      mapRef.current = map
      setMapReady(true)
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render GeoJSON layer when map + data are ready ──────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || districtData.length === 0) return

    let L: typeof import('leaflet')

    async function renderLayer() {
      L = await import('leaflet')

      // Remove previous layer
      if (geoLayerRef.current) {
        geoLayerRef.current.removeFrom(mapRef.current!)
        geoLayerRef.current = null
      }

      // Fetch GeoJSON
      const res = await fetch('/delhi-districts.geojson')
      if (!res.ok) return
      const geojson = await res.json()

      geoLayerRef.current = L.geoJSON(geojson, {
        style: (feature) => {
          const name    = feature?.properties?.district as string
          const data    = dataByDistrict[name]
          const density = data?.density ?? 'low'
          const isSelected = name === selectedDistrict

          return {
            fillColor:   densityColor(density),
            fillOpacity: isSelected ? 0.9 : 0.7,
            color:       isSelected ? '#1E1B4B' : '#FFFFFF',
            weight:      isSelected ? 2 : 1,
          }
        },
        onEachFeature: (feature, layer: LeafletLayer) => {
          const name = feature?.properties?.district as string
          if (!name) return

          const data = dataByDistrict[name]

          // Tooltip
          ;(layer as any).bindTooltip(
            `<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#0F172A;">${name}</div>
             <div style="font-size:11px;color:#475569;">${data?.complaintCount ?? 0} complaints</div>`,
            { sticky: true, opacity: 0.95 }
          )

          layer.on({
            click: () => onDistrictClick(name),
            mouseover: (e) => {
              const l = e.target as any
              l.setStyle({ fillOpacity: 0.9, weight: 2 })
            },
            mouseout: (e) => {
              const l = e.target as any
              const isSelected = name === selectedDistrict
              l.setStyle({
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight:      isSelected ? 2 : 1,
                color:       isSelected ? '#1E1B4B' : '#FFFFFF',
              })
            },
          })
        },
      }).addTo(mapRef.current!)
    }

    renderLayer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, districtData, selectedDistrict])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        aria-label="Delhi complaint hotspot map"
        role="application"
      />
      {/* Dot markers layer — renders on top of choropleth, no DOM output */}
      <ComplaintDots map={mapRef.current} ready={mapReady} />
    </>
  )
}
