'use client'

import { motion } from 'framer-motion'

function ReportCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-sm mx-auto lg:mx-0">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">May 2026</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">Monthly Report</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FDF9', border: '1px solid #00C89630' }}>
          <svg className="w-4 h-4" fill="none" stroke="#00C896" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
      </div>

      {/* Key numbers — clean, readable, no decimals */}
      <div className="divide-y divide-gray-50">
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#F0FDF4' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#00C896' }} />
            <span className="text-sm text-gray-600">Net Income</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tabular-nums">$4,083</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-300" />
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <span className="text-xl font-bold text-gray-700 tabular-nums">$2,840</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#0D7377' }} />
            <span className="text-sm text-gray-600">Total Savings</span>
          </div>
          <span className="text-xl font-bold tabular-nums" style={{ color: '#0D7377' }}>$1,053</span>
        </div>
      </div>

      {/* Savings rate */}
      <div className="px-6 py-4" style={{ backgroundColor: '#F0FDF9' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#0D7377' }}>Savings Rate</span>
          <span className="text-2xl font-black tabular-nums" style={{ color: '#00C896' }}>25.8%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: '25.8%', backgroundColor: '#00C896' }} />
        </div>
      </div>

      {/* Performance score */}
      <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="text-sm text-gray-600">Performance Score</span>
        </div>
        <span className="text-sm font-bold text-budgli-teal">92 / 100</span>
      </div>
    </div>
  )
}

const PRINCIPLES = [
  {
    label: 'Automatic tagging',
    body: 'Transactions are categorized on import. Fix the outliers, not every row.',
  },
  {
    label: 'Meaningful categories',
    body: 'Income, Fixed, Variable, Savings. The four buckets that explain any month.',
  },
  {
    label: 'One score per month',
    body: 'A performance number based on your real data — not a grade, not a judgment.',
  },
]

export default function AccuracyPhilosophy() {
  return (
    <section id="accuracy" className="py-20 px-6 bg-[#0D7377]">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-green mb-4">
              Philosophy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-5">
              Specific, not obsessive.
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              Budgli doesn&apos;t ask you to categorize every coffee. It shows the numbers that actually explain your month — net income, savings rate, and what you kept — in a form you can read in sixty seconds.
            </p>

            <div className="space-y-5">
              {PRINCIPLES.map((p, i) => (
                <motion.div
                  key={p.label}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-budgli-green shrink-0 mt-2" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{p.label}</p>
                    <p className="text-sm text-white/60 leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Report card visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReportCard />
          </motion.div>

        </div>

      </div>
    </section>
  )
}
