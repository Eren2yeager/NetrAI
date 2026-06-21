'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — District Panel
// Right-side panel shown on district click. Fetches drilldown data for the
// selected district — complaint stats + AI recommendation.
// Reference: Stitch Call 2 right panel with East Delhi selected state.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { X, TrendingUp, TrendingDown, Minus, Users, Clock, AlertTriangle } from 'lucide-react'
import type { DistrictData, SentimentValue } from '@/types'
import { COMPLAINT_CATEGORIES } from '@/constants'

interface DistrictPanelProps {
  district:  string | null
  onClose:   () => void
}

interface DistrictDetail extends DistrictData {
  aiRecommendation?: string
  trend?:            'rising' | 'stable' | 'falling'
}

// ── Sentiment display ─────────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<SentimentValue, { emoji: string; label: string; className: string }> = {
  negative: { emoji: '😟', label: 'Negative sentiment', className: 'bg-red-50 text-status-critical border border-red-200' },
  neutral:  { emoji: '😐', label: 'Neutral sentiment',  className: 'bg-surface-100 text-ink-600 border border-surface-200' },
  positive: { emoji: '😊', label: 'Positive sentiment', className: 'bg-green-50 text-status-success border border-green-200' },
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'rising')  return <TrendingUp  className="h-3.5 w-3.5 text-status-warning"  aria-hidden="true" />
  if (trend === 'falling') return <TrendingDown className="h-3.5 w-3.5 text-status-success" aria-hidden="true" />
  return <Minus className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
}

function trendLabel(trend?: string) {
  if (trend === 'rising')  return { text: '↑ Rising',  className: 'text-status-warning'  }
  if (trend === 'falling') return { text: '↓ Falling', className: 'text-status-success'  }
  return                          { text: '→ Stable',  className: 'text-ink-400'          }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DistrictPanel({ district, onClose }: DistrictPanelProps) {
  const [detail,  setDetail]  = useState<DistrictDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!district) { setDetail(null); return }

    setLoading(true)
    setDetail(null)

    // district is confirmed non-null here
    const districtName = district

    async function load() {
      try {
        // Fetch map data and filter to this district
        const [mapRes, sentimentRes] = await Promise.all([
          fetch('/api/map', { cache: 'no-store' }),
          fetch('/api/ai/sentiment', { cache: 'no-store' }),
        ])

        const mapData:       DistrictData[]             = mapRes.ok       ? await mapRes.json()       : []
        const sentimentData: Record<string, SentimentValue> = sentimentRes.ok ? await sentimentRes.json() : {}

        const found = mapData.find((d) => d.name === districtName)
        if (!found) return

        // Simple trend heuristic — high density + negative sentiment = rising
        const trend: 'rising' | 'stable' | 'falling' =
          found.density === 'high'   && sentimentData[districtName] === 'negative' ? 'rising'  :
          found.density === 'low'    && sentimentData[districtName] === 'positive' ? 'falling' : 'stable'

        // Generate AI recommendation via a lightweight heuristic for now
        // (full Gemini call would add 2s latency on every district click)
        const topCategoryLabel =
          COMPLAINT_CATEGORIES.find((c) => c.value === found.topCategory)?.label ?? found.topCategory

        const aiRecommendation =
          found.density === 'high'
            ? `Prioritise ${topCategoryLabel.toLowerCase()} repairs in ${districtName}. Deploy additional resources to reduce the ${found.criticalCount} critical complaints.`
            : found.density === 'medium'
            ? `Monitor ${topCategoryLabel.toLowerCase()} complaints in ${districtName}. Ensure SLA compliance for the ${found.complaintCount} open issues.`
            : `${districtName} is performing well. Continue standard service delivery.`

        setDetail({
          ...found,
          sentiment:         sentimentData[districtName] ?? 'neutral',
          aiRecommendation,
          trend,
        })
      } catch {
        // Panel shows empty state on error
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [district])

  if (!district) return null

  const sentiment = detail ? SENTIMENT_CONFIG[detail.sentiment] : null
  const trend     = detail ? trendLabel(detail.trend) : null
  const catLabel  = detail
    ? COMPLAINT_CATEGORIES.find((c) => c.value === detail.topCategory)?.label ?? detail.topCategory
    : null

  return (
    <aside
      className="w-80 shrink-0 h-full bg-surface-0 border-l border-surface-200 flex flex-col overflow-hidden"
      aria-label={`${district} district details`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-surface-200 shrink-0">
        <h2
          className="text-xl text-ink-900 leading-tight pr-2"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          {district}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close district panel"
          className="text-ink-400 hover:text-ink-600 transition-colors mt-0.5"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-surface-200 rounded w-1/2" />
            <div className="h-4 bg-surface-200 rounded w-3/4" />
            <div className="h-4 bg-surface-200 rounded w-2/3" />
            <div className="h-16 bg-surface-200 rounded" />
          </div>
        )}

        {!loading && detail && (
          <>
            {/* Sentiment badge */}
            {sentiment && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sentiment.className}`}>
                <span>{sentiment.emoji}</span>
                <span>{sentiment.label}</span>
              </div>
            )}

            {/* Stats */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                <span className="text-sm text-ink-700">
                  <strong className="text-ink-900">{detail.complaintCount.toLocaleString('en-IN')}</strong> complaints
                  {detail.criticalCount > 0 && (
                    <span className="text-status-critical ml-1">
                      ({detail.criticalCount} critical)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 text-ink-400 shrink-0 text-xs">📌</span>
                <span className="text-sm text-ink-700">
                  <strong className="text-ink-900">{catLabel}</strong> (top issue)
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                <span className="text-sm text-ink-700">
                  ~<strong className="text-ink-900">{(detail.complaintCount * 8).toLocaleString('en-IN')}</strong> citizens affected
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden="true" />
                <span className="text-sm text-ink-700">
                  <strong className="text-ink-900">{detail.avgResolutionDays || '—'}</strong>
                  {detail.avgResolutionDays ? ' days avg resolution' : ' no resolved data yet'}
                </span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div
              className="rounded-xl p-4 space-y-1"
              style={{ backgroundColor: '#E0E7FF' }}
            >
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">
                AI Recommendation
              </p>
              <p className="text-sm text-brand-900 leading-relaxed">
                {detail.aiRecommendation}
              </p>
            </div>

            {/* Trend */}
            {trend && (
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={detail.trend} />
                <span className={`text-sm font-medium ${trend.className}`}>
                  Predicted trend: {trend.text}
                </span>
              </div>
            )}
          </>
        )}

        {!loading && !detail && (
          <p className="text-sm text-ink-400">No data available for this district.</p>
        )}
      </div>
    </aside>
  )
}
