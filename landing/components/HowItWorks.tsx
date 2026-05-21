'use client'

import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   Real-size step visuals — same density as the live app.
   Step 1: raw CSV transactions table
   Step 2: same table, now with category pills
   Step 3: mini StatCards + ScoreCard line
   ───────────────────────────────────────────────────────────────────────────── */

function UploadVisual() {
  const rows = [
    { date: 'May 28', desc: 'Payroll Deposit',   amt: '+$4,720.83', pos: true },
    { date: 'May 26', desc: 'Freshco Grocery',   amt: '−$127.45',   pos: false },
    { date: 'May 25', desc: 'Netflix.com',       amt: '−$17.99',    pos: false },
    { date: 'May 22', desc: 'Shell Gas Station', amt: '−$72.10',    pos: false },
    { date: 'May 20', desc: 'Cineplex Movies',   amt: '−$28.50',    pos: false },
  ]
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden text-xs bg-white shadow-sm">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-gray-700 font-semibold">Transactions · May 2026</span>
        <span className="text-gray-400 text-[11px] tabular-nums">61 rows · untagged</span>
      </div>
      <div className="grid px-4 py-1.5 bg-gray-50/60 border-b border-gray-100" style={{ gridTemplateColumns: '60px 1fr 90px' }}>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Date</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Description</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid px-4 py-2 border-b border-gray-100 items-center last:border-b-0" style={{ gridTemplateColumns: '60px 1fr 90px' }}>
          <span className="text-gray-400 text-[11px] tabular-nums whitespace-nowrap">{r.date}</span>
          <span className="text-gray-700 truncate pr-2">{r.desc}</span>
          <span className={`text-right font-medium tabular-nums whitespace-nowrap ${r.pos ? 'text-[#0D7377] font-semibold' : 'text-gray-500'}`}>{r.amt}</span>
        </div>
      ))}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          61 untagged
        </span>
      </div>
    </div>
  )
}

function CategorizeVisual() {
  const rows = [
    { date: 'May 28', desc: 'Payroll Deposit',   amt: '+$4,720', cat: 'Income',        hex: '#0D7377' },
    { date: 'May 26', desc: 'Freshco Grocery',   amt: '−$127',   cat: 'Groceries',     hex: '#22C55E' },
    { date: 'May 25', desc: 'Netflix.com',       amt: '−$18',    cat: 'Subscriptions', hex: '#3B82F6' },
    { date: 'May 22', desc: 'Shell Gas Station', amt: '−$72',    cat: 'Fuel',          hex: '#F59E0B' },
    { date: 'May 20', desc: 'Cineplex Movies',   amt: '−$29',    cat: 'Entertainment', hex: '#A855F7' },
  ]
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden text-xs bg-white shadow-sm">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-gray-700 font-semibold">Transactions · May 2026</span>
        <span className="text-gray-400 text-[11px] tabular-nums">61 categorized</span>
      </div>
      <div className="grid px-4 py-1.5 bg-gray-50/60 border-b border-gray-100" style={{ gridTemplateColumns: '60px 1fr 60px 110px' }}>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Date</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Description</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Amt</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Category</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid px-4 py-2 border-b border-gray-100 items-center last:border-b-0" style={{ gridTemplateColumns: '60px 1fr 60px 110px' }}>
          <span className="text-gray-400 text-[11px] tabular-nums whitespace-nowrap">{r.date}</span>
          <span className="text-gray-700 truncate pr-2">{r.desc}</span>
          <span className="text-right font-medium tabular-nums text-gray-600 whitespace-nowrap">{r.amt}</span>
          <div className="flex justify-end">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: r.hex + '1a', color: r.hex }}
            >
              {r.cat}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportVisual() {
  return (
    <div className="flex flex-col gap-3">
      {/* StatCards mini */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-gray-500 font-medium mb-1.5">Total Spent</p>
          <p className="text-xl font-extrabold text-gray-900 tabular-nums leading-tight tracking-tight">$2,840.00</p>
          <p className="text-[10px] text-gray-400 mt-1">Money spent this month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-[11px] text-gray-500 font-medium mb-1.5">Amount Saved</p>
          <p className="text-xl font-extrabold tabular-nums leading-tight tracking-tight" style={{ color: '#00C896' }}>$1,880.83</p>
          <p className="text-[10px] text-gray-400 mt-1">Money saved this month</p>
        </div>
      </div>
      {/* Score line */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl font-black tabular-nums leading-none tracking-tight" style={{ color: '#00C896' }}>92</span>
          <span className="text-xs text-gray-400 font-medium">/ 100</span>
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Monthly Score</div>
            <div className="text-sm font-bold text-gray-900">Outstanding</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 shrink-0">Savings Rate</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '48%', backgroundColor: '#00C896' }} />
          </div>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: '#0D7377' }}>48%</span>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Upload transactions',
    description: 'Add your bank CSV to start your monthly report. Most common formats parse automatically. A manual mapper handles the rest.',
    visual: <UploadVisual />,
  },
  {
    num: '02',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: 'Review categories',
    description: 'Clean up fixed costs, variable costs, and income. Transactions are categorized on import — most months need only a handful of corrections.',
    visual: <CategorizeVisual />,
  },
  {
    num: '03',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Read your report',
    description: 'See what you earned, spent, saved, and how the month performed. Income statement, savings rate, and a performance score — all built automatically.',
    visual: <ReportVisual />,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            Upload. Review. Read.
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Three steps. No spreadsheet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step badge + title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-budgli-teal/60 tracking-widest uppercase mb-0.5">
                    Step {step.num}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{step.title}</h3>
                </div>
              </div>

              {/* Real-size step visual */}
              <div className="flex-1">{step.visual}</div>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
