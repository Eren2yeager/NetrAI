// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Process Steps (full-page variant)
// Shown on the /submit page as the primary content.
// 4-step vertical flow with dashed connector + trust stats bar.
// Max-width 560px, centered. Leaves room for the FAB bottom-right.
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num:      '1',
    title:    'Start the conversation',
    body:     'Tell NETRA what\'s wrong — in Hindi, English, voice, or photo.',
    tag:      'Hindi & English',
    tagBg:    '#E0E7FF',
    tagColor: '#4F46E5',
  },
  {
    num:      '2',
    title:    'NETRA understands',
    body:     'Our AI extracts the category, location, and priority automatically.',
    tag:      'AI-Powered',
    tagBg:    '#4F46E5',
    tagColor: '#FFFFFF',
  },
  {
    num:      '3',
    title:    'Review and confirm',
    body:     'Check the details NETRA collected. Edit anything before submitting.',
    tag:      "You're in control",
    tagBg:    '#E0E7FF',
    tagColor: '#4F46E5',
  },
  {
    num:      '4',
    title:    'Routed instantly',
    body:     'Your complaint goes to the right department with an AI priority score.',
    tag:      '24hr SLA',
    tagBg:    '#16A34A',
    tagColor: '#FFFFFF',
  },
] as const

const TRUST = [
  { num: '11',   label: 'Districts Covered' },
  { num: 'AI',   label: 'Prioritized' },
  { num: '24hr', label: 'Response SLA' },
] as const

export default function ProcessSteps() {
  return (
    <div className="w-full max-w-[560px] flex flex-col gap-10">

      {/* ── Brand + headline block ── */}
      <div className="flex flex-col gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-1">
          <span
            className="text-[26px] text-ink-900 leading-none"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            NetrAI
          </span>
          <span className="text-[12px] text-ink-400 tracking-widest uppercase">
            See. Decide. Act.
          </span>
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-surface-300" />

        {/* Headline */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[40px] sm:text-[48px] leading-[1.05] text-ink-900"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            File a Complaint
          </h1>
          <p className="text-[17px] text-ink-600 leading-relaxed max-w-[420px]">
            Tell NETRA your problem in Hindi or English.
            No forms. Just talk.
          </p>
        </div>

        {/* CTA hint */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
          <span className="text-[13px] text-brand-500 font-medium">
            Click &ldquo;Talk to NETRA&rdquo; to get started →
          </span>
        </div>
      </div>

      {/* ── 4-step vertical flow ── */}
      <div className="flex flex-col">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex gap-5">

            {/* Left: numbered circle + dashed connector */}
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                           text-[14px] font-bold text-white"
                style={{ backgroundColor: '#4F46E5' }}
                aria-hidden="true"
              >
                {step.num}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-[2px] flex-1 my-2"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, #E0E7FF 0, #E0E7FF 6px, transparent 6px, transparent 12px)',
                    minHeight: '36px',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Right: text content */}
            <div className={`${i < STEPS.length - 1 ? 'pb-8' : 'pb-0'} flex flex-col gap-1.5`}>
              <h3 className="text-[16px] font-semibold text-ink-900 leading-snug">
                {step.title}
              </h3>
              <p className="text-[14px] text-ink-600 leading-relaxed max-w-[340px]">
                {step.body}
              </p>
              <span
                className="inline-flex w-fit px-2.5 py-0.5 rounded-full text-[12px] font-semibold mt-0.5"
                style={{ backgroundColor: step.tagBg, color: step.tagColor }}
              >
                {step.tag}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* ── Trust stats bar ── */}
      <div className="flex items-stretch divide-x divide-surface-200
                      border border-surface-200 rounded-xl bg-white">
        {TRUST.map(({ num, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 flex-1 py-4 px-3">
            <span className="text-[18px] font-bold text-ink-900 leading-none">{num}</span>
            <span className="text-[12px] text-ink-400 text-center">{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
