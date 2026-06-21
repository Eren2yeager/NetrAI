'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Policy Simulator
// Two-column layout: left = input form, right = result or idle illustration.
// Uses Framer Motion AnimatePresence for the result reveal.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Loader2, FlaskConical } from 'lucide-react'
import { DELHI_DISTRICTS } from '@/constants'
import DecisionTree from '@/components/illustrations/DecisionTree'
import SimulatorResult from './SimulatorResult'
import type { PolicySimulation } from '@/types'

const EXAMPLE_ACTIONS = [
  'Deploy 10 water repair teams to East Delhi',
  'Station 5 electricity maintenance crews in West Delhi',
  'Assign 8 road repair units to South Delhi',
  'Deploy sanitation task force to North East Delhi',
]

export default function PolicySimulator() {
  const [action,        setAction]        = useState('')
  const [district,      setDistrict]      = useState('')
  const [resourceCount, setResourceCount] = useState(10)
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState<PolicySimulation | null>(null)
  const [error,         setError]         = useState<string | null>(null)

  const canSubmit = action.trim().length >= 10 && district.length > 0 && !loading

  async function handleSimulate() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/simulate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action:        action.trim(),
          district,
          resourceCount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Simulation failed. Please try again.')
        return
      }

      setResult(data)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6 h-full">

      {/* Left — Input form */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            What action do you want to simulate?
          </h2>
          <p className="text-sm text-ink-400 mt-1">
            Describe a policy action and see its estimated impact on complaints.
          </p>
        </div>

        {/* Action input */}
        <div>
          <label htmlFor="sim-action" className="block text-sm font-medium text-ink-600 mb-1.5">
            Proposed action
          </label>
          <textarea
            id="sim-action"
            rows={3}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Deploy 10 water repair teams to East Delhi"
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
          />

          {/* Example actions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EXAMPLE_ACTIONS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setAction(ex)
                  // Auto-fill district from example
                  const match = ex.match(/to (.+ Delhi|Shahdara)/)
                  if (match) setDistrict(match[1])
                }}
                className="text-xs px-2.5 py-1 rounded-full border border-surface-200 text-ink-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* District selector */}
        <div>
          <label htmlFor="sim-district" className="block text-sm font-medium text-ink-600 mb-1.5">
            District
          </label>
          <select
            id="sim-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-surface-200 bg-surface-0 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition appearance-none"
          >
            <option value="">Select district</option>
            {DELHI_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Resource count slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="sim-resources" className="text-sm font-medium text-ink-600">
              Resources to deploy
            </label>
            <span className="text-sm font-bold text-brand-600 tabular-nums">
              {resourceCount}
            </span>
          </div>
          <input
            id="sim-resources"
            type="range"
            min={1}
            max={50}
            value={resourceCount}
            onChange={(e) => setResourceCount(parseInt(e.target.value))}
            className="w-full accent-brand-500 h-2 rounded-full"
            aria-valuemin={1}
            aria-valuemax={50}
            aria-valuenow={resourceCount}
          />
          <div className="flex justify-between text-xs text-ink-400 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-status-critical">
            {error}
          </div>
        )}

        {/* Simulate button */}
        <button
          type="button"
          onClick={handleSimulate}
          disabled={!canSubmit}
          className="w-full h-12 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Simulating…</>
            : <><FlaskConical className="h-4 w-4" aria-hidden="true" /> Run simulation</>
          }
        </button>
      </div>

      {/* Right — Result or idle state */}
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          {result ? (
            <SimulatorResult key="result" result={result} />
          ) : (
            <div
              key="idle"
              className="flex-1 flex flex-col items-center justify-center text-center py-8"
            >
              <DecisionTree className="w-40 h-36 mb-6" />
              <p className="text-base font-medium text-ink-600">
                Your simulation will appear here
              </p>
              <p className="text-sm text-ink-400 mt-1 max-w-xs">
                Describe a policy action, select a district, and set the resource count to get started.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
