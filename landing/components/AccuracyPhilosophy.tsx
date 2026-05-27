'use client'

import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   Philosophy visual: messy transactions → auto-tagged categories → score
   ───────────────────────────────────────────────────────────────────────────── */

function PhilosophyVisual() {
  const raw = [
    { desc: 'AMZN MKTP CA*RT9X4', amt: '−$43.99' },
    { desc: 'WAL-MART SUPERCTR',  amt: '−$127.34' },
    { desc: 'NETFLIX.COM',        amt: '−$15.49'  },
    { desc: 'TF*TRANSFER',        amt: '−$250.00' },
  ]
  const tagged = [
    { desc: 'Amazon Purchase', amt: '−$44', cat: 'Shopping',     hex: '#A855F7' },
    { desc: 'Wal-Mart',        amt: '−$127', cat: 'Groceries',   hex: '#22C55E' },
    { desc: 'Netflix',         amt: '−$15', cat: 'Subscriptions',hex: '#3B82F6' },
    { desc: 'TFSA Transfer',   amt: '−$250', cat: 'Savings',     hex: '#0D7377' },
  ]

  return (
    <div className="space-y-3">

      {/* Stage 1: Raw transactions */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
        <div className="px-4 py-2 bg-white/5 border-b border-white/8 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Raw transactions</span>
          <span className="text-[10px] text-amber-400/80 font-medium">61 untagged</span>
        </div>
        <div className="divide-y divide-white/5">
          {raw.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2">
              <span className="text-[11px] text-white/40 truncate pr-2">{r.desc}</span>
              <span className="text-[11px] text-white/35 tabular-nums shrink-0">{r.amt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 h-px bg-budgli-green/20" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-budgli-green/10 border border-budgli-green/20">
          <svg className="w-3 h-3 text-budgli-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
          </svg>
          <span className="text-[10px] text-budgli-green font-semibold">Auto-tagged</span>
        </div>
        <div className="flex-1 h-px bg-budgli-green/20" />
      </div>

      {/* Stage 2: Tagged categories */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
        <div className="px-4 py-2 bg-white/5 border-b border-white/8 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Categorized</span>
          <span className="text-[10px] font-medium" style={{ color: '#00C896' }}>61 tagged</span>
        </div>
        <div className="divide-y divide-white/5">
          {tagged.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2 gap-3">
              <span className="text-[11px] text-white/60 truncate flex-1">{r.desc}</span>
              <span className="text-[11px] text-white/40 tabular-nums shrink-0">{r.amt}</span>
              <span
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: r.hex + '22', color: r.hex }}
              >
                {r.cat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 h-px bg-budgli-green/20" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-budgli-green/10 border border-budgli-green/20">
          <svg className="w-3 h-3 text-budgli-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          <span className="text-[10px] text-budgli-green font-semibold">Report built</span>
        </div>
        <div className="flex-1 h-px bg-budgli-green/20" />
      </div>

      {/* Stage 3: Performance score */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.2)' }}>
        <div className="px-4 py-2 border-b border-white/8 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Monthly report</span>
          <span className="text-[10px] text-white/35">May 2026</span>
        </div>
        <div className="px-4 py-3 flex items-center gap-4">
          <div>
            <span className="text-4xl font-black tabular-nums leading-none" style={{ color: '#00C896' }}>92</span>
            <span className="text-xs text-white/35 ml-1">/ 100</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Monthly Score</div>
            <div className="text-sm font-bold text-white">Outstanding</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-white/40">Savings rate</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: '#00C896' }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: '#00C896' }}>40%</span>
            </div>
          </div>
        </div>
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
              Budgli doesn&apos;t ask you to categorize every coffee. It shows the numbers that actually
              explain your month — net income, savings rate, and what you kept — in a form you can
              read in sixty seconds.
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
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-budgli-green shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{p.label}</p>
                    <p className="text-sm text-white/60 leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 3-stage flow visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <PhilosophyVisual />
          </motion.div>

        </div>

      </div>
    </section>
  )
}
