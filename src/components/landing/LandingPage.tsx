'use client'

// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Public Landing Page Component
// Sections: Hero · Platform · Features · Stats · CTA · Footer
// Framer Motion: subtle fadeIn + translateY on section enter (opacity 0→1,
// y 20→0, duration 0.4s). No other animations.
// Fully responsive — stacks to single column on mobile.
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link'
import { motion, type Variants, type Transition } from 'framer-motion'
import HeroDashboard            from '@/components/illustrations/HeroDashboard'
import HotspotMapIllustration   from '@/components/illustrations/HotspotMapIllustration'
import AIPersonasIllustration   from '@/components/illustrations/AIPersonasIllustration'
import CitizenVoiceIllustration from '@/components/illustrations/CitizenVoiceIllustration'

// ── Animation helpers ─────────────────────────────────────────────────────────

const fadeUpTransition: Transition = { duration: 0.4, ease: [0.25, 0, 0, 1] }

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: fadeUpTransition },
}

const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-brand-500 text-[12px] font-semibold tracking-[0.12em] uppercase mb-3 text-center">
      {children}
    </p>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[14px] text-ink-900 leading-relaxed">
      <span className="mt-[7px] h-[6px] w-[6px] rounded-full bg-brand-500 shrink-0" />
      {children}
    </li>
  )
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit px-3 py-1 rounded-full bg-brand-100 text-brand-500 text-[12px] font-semibold">
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-900 font-sans antialiased overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          § 1 — HERO
          ════════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen bg-[#FAF8FF] flex items-center px-6 md:px-12 lg:px-20 py-20 lg:py-0">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-12">

          {/* ── Left text block (55%) ── */}
          <motion.div
            className="w-full lg:w-[55%] flex flex-col gap-7"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-100 text-brand-900 text-[12px] font-semibold tracking-wide">
                AI Governance · Delhi
              </span>
            </motion.div>

            {/* Headline — DM Serif Display 64px */}
            <motion.h1
              variants={fadeUp}
              className="text-[48px] sm:text-[64px] leading-[1.05] text-ink-900 tracking-tight"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              Govern Smarter.<br />Act Faster.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              className="text-[18px] leading-[1.7] text-ink-600 max-w-[480px]"
            >
              NetrAI gives the Chief Minister of Delhi a single command center to
              see every complaint, decide with AI, and act with precision.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-brand-500 text-white text-[14px] font-medium hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                View Dashboard
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center h-12 px-7 rounded-xl border-2 border-brand-500 text-brand-500 bg-white text-[14px] font-medium hover:bg-brand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Submit a Complaint
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap items-stretch divide-x divide-surface-200">
                {[
                  { num: '12,453', label: 'Complaints Tracked' },
                  { num: '84%',    label: 'Resolution Rate' },
                  { num: '11',     label: 'Districts' },
                ].map(({ num, label }) => (
                  <div key={label} className="flex flex-col gap-0.5 px-6 first:pl-0 last:pr-0 py-1">
                    <span className="text-[20px] font-bold text-ink-900 leading-tight">{num}</span>
                    <span className="text-[12px] text-ink-400">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right illustration (45%) ── */}
          <motion.div
            className="w-full lg:w-[45%] flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0, 0, 1] }}
            aria-hidden="true"
          >
            <HeroDashboard className="w-full max-w-[540px]" />
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          § 2 — THE PLATFORM
          ════════════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bg-white py-24 px-6 md:px-12 lg:px-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <div className="max-w-[1440px] mx-auto">

          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-16">
            <SectionLabel>The Platform</SectionLabel>
            <h2
              className="text-[36px] sm:text-[40px] leading-tight text-ink-900 mb-4"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              One platform. Three perspectives.
            </h2>
            <p className="text-[16px] text-ink-600 max-w-[520px] mx-auto">
              Built for every level of Delhi&apos;s governance chain.
            </p>
          </motion.div>

          {/* Three cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — Chief Minister */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-surface-200 rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="7" stroke="#4F46E5" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="#4F46E5" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit px-3 py-0.5 rounded-full bg-brand-100 text-brand-500 text-[12px] font-semibold">
                  Strategic View
                </span>
                <h3 className="text-[18px] font-bold text-ink-900">Chief Minister</h3>
              </div>
              <p className="text-[14px] text-ink-600 leading-relaxed flex-1">
                AI morning briefings, hotspot map, governance score, and NETRA — your
                personal AI Chief of Staff.
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet>Delhi hotspot map</Bullet>
                <Bullet>AI daily briefing</Bullet>
                <Bullet>NETRA AI assistant</Bullet>
              </ul>
            </motion.div>

            {/* Card 2 — Department Head (highlighted) */}
            <motion.div
              variants={fadeUp}
              className="bg-white border-2 border-brand-500 rounded-2xl p-8 flex flex-col gap-5 shadow-sm relative"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="#4F46E5" strokeWidth="2" />
                  <path d="M8 12h8M12 8v8" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit px-3 py-0.5 rounded-full bg-brand-500 text-white text-[12px] font-semibold">
                  Operational View
                </span>
                <h3 className="text-[18px] font-bold text-ink-900">Department Head</h3>
              </div>
              <p className="text-[14px] text-ink-600 leading-relaxed flex-1">
                SLA tracking, officer workload management, and SAHAY — your AI
                operations assistant.
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet>SLA monitoring</Bullet>
                <Bullet>Team workload</Bullet>
                <Bullet>SAHAY AI assistant</Bullet>
              </ul>
            </motion.div>

            {/* Card 3 — Field Officer */}
            <motion.div
              variants={fadeUp}
              className="bg-white border border-surface-200 rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    stroke="#4F46E5" strokeWidth="2" fill="#E0E7FF"
                  />
                  <circle cx="12" cy="9" r="2.5" fill="#4F46E5" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex w-fit px-3 py-0.5 rounded-full bg-brand-100 text-brand-500 text-[12px] font-semibold">
                  Field View
                </span>
                <h3 className="text-[18px] font-bold text-ink-900">Field Officer</h3>
              </div>
              <p className="text-[14px] text-ink-600 leading-relaxed flex-1">
                Assigned complaints, location navigation, and MARG — your AI
                field guide.
              </p>
              <ul className="flex flex-col gap-2">
                <Bullet>Assigned cases</Bullet>
                <Bullet>Status updates</Bullet>
                <Bullet>MARG AI assistant</Bullet>
              </ul>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════
          § 3 — KEY FEATURES (alternating rows)
          ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF8FF] py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1440px] mx-auto">

          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Features</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-[36px] sm:text-[40px] leading-tight text-ink-900"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              Everything the CM needs. Nothing they don&apos;t.
            </motion.h2>
          </motion.div>

          {/* Row 1 — text left, map right */}
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 flex flex-col gap-5 order-2 lg:order-1">
              <FeaturePill>AI Intelligence</FeaturePill>
              <h3 className="text-[26px] sm:text-[28px] font-bold text-ink-900 leading-snug">
                See Delhi&apos;s pulse, instantly.
              </h3>
              <p className="text-[16px] text-ink-600 leading-relaxed max-w-[480px]">
                The hotspot map shows every complaint as a live dot on Delhi&apos;s districts.
                Critical issues pulse in red. Districts darken as complaints rise.
                One glance tells the full story.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 order-1 lg:order-2" aria-hidden="true">
              <HotspotMapIllustration className="w-full max-w-[480px] mx-auto" />
            </motion.div>
          </motion.div>

          {/* Row 2 — personas left, text right */}
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 order-1" aria-hidden="true">
              <AIPersonasIllustration className="w-full max-w-[480px] mx-auto" />
            </motion.div>
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 flex flex-col gap-5 order-2">
              <FeaturePill>AI Personas</FeaturePill>
              <h3 className="text-[26px] sm:text-[28px] font-bold text-ink-900 leading-snug">
                Three AIs. Three roles.
              </h3>
              <p className="text-[16px] text-ink-600 leading-relaxed max-w-[480px]">
                NETRA advises the CM. SAHAY guides department heads. MARG assists
                field officers. Each AI knows only what its user needs to know.
              </p>
            </motion.div>
          </motion.div>

          {/* Row 3 — text left, chat right */}
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 flex flex-col gap-5 order-2 lg:order-1">
              <FeaturePill>Citizen Voice</FeaturePill>
              <h3 className="text-[26px] sm:text-[28px] font-bold text-ink-900 leading-snug">
                Any citizen. Any language.
              </h3>
              <p className="text-[16px] text-ink-600 leading-relaxed max-w-[480px]">
                The AI chatbot accepts complaints in Hindi or English, by text, voice,
                or photo. No forms. No confusion. Just talk to NETRA.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="w-full lg:w-1/2 order-1 lg:order-2" aria-hidden="true">
              <CitizenVoiceIllustration className="w-full max-w-[480px] mx-auto" />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          § 4 — STATS BAR
          ════════════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bg-white border-y border-surface-200 py-16 px-6 md:px-12 lg:px-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { num: '11',          label: 'Districts Monitored' },
              { num: '5',           label: 'Departments Tracked' },
              { num: 'AI-Powered',  label: 'Prioritization' },
              { num: 'Real-time',   label: 'SLA Monitoring' },
            ].map(({ num, label }, i) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className={[
                  'flex flex-col items-center gap-2 py-6 text-center',
                  i > 0 ? 'border-l border-surface-200' : '',
                ].join(' ')}
              >
                <span className="text-[28px] sm:text-[32px] font-bold text-ink-900 leading-none">
                  {num}
                </span>
                <span className="text-[14px] text-ink-400">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════
          § 5 — CTA
          ════════════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bg-white py-28 px-6 md:px-12 lg:px-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-6">
          <motion.h2
            variants={fadeUp}
            className="text-[36px] sm:text-[48px] leading-tight text-ink-900"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            Built for Delhi. Ready for India.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[16px] text-ink-400">
            A project by Team Sanganak.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-brand-500 text-white text-[14px] font-semibold hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Enter Command Center
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════════════
          § 6 — FOOTER
          ════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-surface-200 px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-0.5">
            <span
              className="text-[20px] text-ink-900"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              NetrAI
            </span>
            <span className="text-[14px] text-ink-400">See. Decide. Act.</span>
          </div>
          <p className="text-[14px] text-ink-400 text-center sm:text-right">
            Built by Team Sanganak · Smart India Hackathon
          </p>
        </div>
      </footer>

    </div>
  )
}
