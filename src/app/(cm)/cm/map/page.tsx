'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Hotspot Map Page
// Full-height layout, no scroll. Map 70% height, DistrictPanel right sidebar.
// HotspotMap is dynamically imported with ssr:false (Leaflet requires browser).
// Reference: Stitch Call 2 layout.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import MapFilters, { type MapFilterState } from '@/components/map/MapFilters'
import MapLegend from '@/components/map/MapLegend'
import DistrictPanel from '@/components/map/DistrictPanel'
import type { DistrictData } from '@/types'

// Leaflet must not render on server
const HotspotMap = dynamic(() => import('@/components/map/HotspotMap'), {
  ssr:     false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-surface-100 flex items-center justify-center">
      <p className="text-sm text-ink-400 animate-pulse">Loading map…</p>
    </div>
  ),
})

export default function MapPage() {
  const [districtData,     setDistrictData]     = useState<DistrictData[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [filters,          setFilters]          = useState<MapFilterState>({
    category: 'all',
    days:     30,
  })

  // Fetch map data when filters change
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const res = await fetch('/api/map', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data: DistrictData[] = await res.json()
        if (!cancelled) setDistrictData(data)
      } catch {
        // map shows empty state
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [filters])

  const handleDistrictClick = useCallback((district: string) => {
    setSelectedDistrict((prev) => prev === district ? null : district)
  }, [])

  const handlePanelClose = useCallback(() => {
    setSelectedDistrict(null)
  }, [])

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface-0 border-b border-surface-200 shrink-0">
        <h1
          className="text-xl text-ink-900"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          Delhi Complaint Hotspot Map
        </h1>
        <MapFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Map + panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative p-4">
          <HotspotMap
            districtData={districtData}
            selectedDistrict={selectedDistrict}
            onDistrictClick={handleDistrictClick}
            filters={filters}
          />

          {/* Legend — bottom left overlay */}
          <div className="absolute bottom-8 left-8 z-[1000]">
            <MapLegend />
          </div>
        </div>

        {/* District panel — slide in on selection */}
        {selectedDistrict && (
          <DistrictPanel
            district={selectedDistrict}
            onClose={handlePanelClose}
          />
        )}
      </div>
    </div>
  )
}
