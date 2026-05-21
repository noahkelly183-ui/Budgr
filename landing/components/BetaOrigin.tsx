'use client'

import { motion } from 'framer-motion'

const FEATURE_TAGS = [
  'Monthly dashboards',
  'CSV imports',
  'Savings forecasts',
  'Year-over-year clarity',
]

// ─── icons ────────────────────────────────────────────────────────────────────

function ChatIcon() {
  return (
    <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function BetaOrigin() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div
          className="max-w-2xl mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            The origin
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy leading-tight mb-4">
            Built from a real personal finance workflow.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Budgli started as a personal spreadsheet for tracking income, spending, savings, and progress.
            The beta is focused on turning that workflow into a clean product anyone can use.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1 — feedback placeholder, honest */}
          <motion.div
            className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center flex-shrink-0">
                <ChatIcon />
              </div>
              {/* Live indicator — signals this area is active, not abandoned */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-budgli-green opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-budgli-green" />
                </span>
                <span className="text-[10px] font-semibold text-budgli-green tracking-wide uppercase">Live beta</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
              Early beta feedback coming soon
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              As beta users test Budgli, this section will highlight what they find most useful.
            </p>
          </motion.div>

          {/* Card 2 — specific, what's being tested */}
          <motion.div
            className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-9 h-9 rounded-lg bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center mb-4">
              <FlaskIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
              What users are testing
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              The beta covers the core workflow end to end.
            </p>
            {/* Feature tags — specific, not vague */}
            <div className="flex flex-wrap gap-2">
              {FEATURE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex text-[11px] font-medium text-budgli-teal bg-budgli-teal/8 border border-budgli-teal/15 rounded-full px-2.5 py-1 leading-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 3 — what's being refined */}
          <motion.div
            className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-9 h-9 rounded-lg bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center mb-4">
              <WrenchIcon />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
              What we&apos;re improving
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Budgli is being refined around real feedback before a wider public launch.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
