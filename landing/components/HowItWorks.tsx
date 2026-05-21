'use client'

import { motion } from 'framer-motion'

// ─── mini visuals ─────────────────────────────────────────────────────────────

function UploadVisual() {
  const rows = [
    { date: '11/28', desc: 'PAYROLL DIRECT DEP', amt: '+$2,182.03', pos: true },
    { date: '11/27', desc: 'AMZN MKTP CA*RT9X4', amt: '−$43.99',   pos: false },
    { date: '11/26', desc: 'WAL-MART SUPERCTR',  amt: '−$127.34',  pos: false },
    { date: '11/25', desc: 'NETFLIX.COM',         amt: '−$15.49',   pos: false },
  ]
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden text-[10px] bg-white">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="text-gray-500 font-medium">rbc_nov_2024.csv</span>
        <span className="ml-auto text-gray-400">143 rows</span>
      </div>
      <div className="grid px-3 py-1.5 border-b border-gray-100" style={{ gridTemplateColumns: '32px 1fr 68px' }}>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Date</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Description</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid px-3 py-1.5 border-b border-gray-50 items-center" style={{ gridTemplateColumns: '32px 1fr 68px' }}>
          <span className="text-gray-400 font-mono text-[9px]">{r.date}</span>
          <span className="text-gray-600 truncate pr-1">{r.desc}</span>
          <span className={`text-right font-medium tabular-nums ${r.pos ? 'text-gray-700' : 'text-gray-500'}`}>{r.amt}</span>
        </div>
      ))}
      <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
        <span className="text-gray-400 text-[9px]">Raw export — untagged</span>
        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-[9px] font-medium text-amber-600">
          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
          Untagged
        </span>
      </div>
    </div>
  )
}

function CategorizeVisual() {
  const rows = [
    { date: 'Nov 28', desc: 'Payroll Direct Deposit', amt: '+$2,182', pill: { label: 'Income',          hex: '#0D7377' } },
    { date: 'Nov 26', desc: 'Wal-Mart Superctr',      amt: '−$127',   pill: { label: 'Groceries',        hex: '#16A34A' } },
    { date: 'Nov 25', desc: 'Netflix.com',             amt: '−$15',    pill: { label: 'Subscriptions',    hex: '#3B82F6' } },
    { date: 'Nov 24', desc: 'TF*Transfer',             amt: '−$250',   pill: { label: 'Savings',          hex: '#0D7377' } },
  ]
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden text-[10px] bg-white">
      <div className="px-3 py-2 bg-budgli-navy flex items-center justify-between">
        <span className="text-white font-semibold text-[10px]">November 2024</span>
        <span className="text-white/50 text-[9px]">143 transactions</span>
      </div>
      <div className="grid px-3 py-1.5 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '40px 1fr 52px 80px' }}>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Date</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Description</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Amt</span>
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Category</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid px-3 py-1.5 border-b border-gray-50 items-center" style={{ gridTemplateColumns: '40px 1fr 52px 80px' }}>
          <span className="text-gray-400 font-mono text-[9px]">{r.date}</span>
          <span className="text-gray-600 truncate pr-1">{r.desc}</span>
          <span className="text-right font-medium tabular-nums text-gray-600">{r.amt}</span>
          <div className="flex justify-end">
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: r.pill.hex + '18', color: r.pill.hex }}
            >
              {r.pill.label}
            </span>
          </div>
        </div>
      ))}
      <div className="px-3 py-1.5 bg-gray-50">
        <span className="text-[9px] text-gray-400">Showing 4 of 143</span>
      </div>
    </div>
  )
}

function ReportVisual() {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden text-[10px] bg-white">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-700">January 2026</span>
        <span className="text-gray-400 text-[9px]">Monthly Analysis</span>
      </div>

      {/* Two summary cards — matches actual app */}
      <div className="p-2 grid grid-cols-2 gap-2">
        {/* Total Spent */}
        <div className="rounded-lg border border-gray-100 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <span className="text-gray-500 text-[9px]">Total Spent</span>
          </div>
          <p className="text-sm font-bold text-gray-900 tabular-nums leading-none">$3,521</p>
          <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Money spent this month</p>
        </div>

        {/* Amount Saved */}
        <div className="rounded-lg border border-gray-100 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#F0FDF9', border: '1px solid rgba(0,200,150,0.2)' }}
            >
              <svg className="w-3 h-3" style={{ color: '#00C896' }} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-[9px]">Amount Saved</span>
          </div>
          <p className="text-sm font-bold tabular-nums leading-none" style={{ color: '#00C896' }}>$2,382</p>
          <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Money saved this month</p>
        </div>
      </div>

      {/* Savings rate */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500">Savings Rate</span>
          <span className="font-semibold tabular-nums" style={{ color: '#00C896' }}>40.3%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '40.3%', backgroundColor: '#00C896' }} />
        </div>
      </div>
    </div>
  )
}

// ─── steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Upload',
    description: 'Export a CSV from your bank. RBC and CIBC parse automatically. A manual mapper handles any other format. No bank connection required.',
    visual: <UploadVisual />,
  },
  {
    num: '02',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: 'Retag',
    description: 'Transactions are categorized on import. Fix any that are wrong — fixed cost, variable, savings, or skip. Most months need only a handful of corrections.',
    visual: <CategorizeVisual />,
  },
  {
    num: '03',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Report',
    description: 'Your data becomes a monthly income statement in seconds. Savings rate, performance score, and spending breakdown — all built automatically.',
    visual: <ReportVisual />,
  },
]

// ─── section ──────────────────────────────────────────────────────────────────

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
            Upload. Retag. Report.
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

              {/* Mini product visual */}
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
