// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Policy Simulator Page
// Wrapper page for the PolicySimulator client component.
// ─────────────────────────────────────────────────────────────────────────────

import PolicySimulator from '@/components/simulator/PolicySimulator'

export default function SimulatorPage() {
  return (
    <div className="max-w-5xl mx-auto h-full">
      <div className="mb-6">
        <h1
          className="text-2xl text-ink-900"
          style={{ fontFamily: 'var(--font-dm-serif)' }}
        >
          Policy Simulator
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          Model the impact of a proposed government action before committing resources.
        </p>
      </div>

      <div className="bg-surface-0 border border-surface-200 rounded-xl p-6 shadow-sm">
        <PolicySimulator />
      </div>
    </div>
  )
}
