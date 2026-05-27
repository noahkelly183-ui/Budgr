'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

// ─── tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Monthly Dashboard' },
  { id: 'annual',    label: 'Annual Summary'    },
  { id: 'yoy',       label: 'Year-over-Year'    },
  { id: 'forecast',  label: 'Savings Forecast'  },
] as const

type TabId = typeof TABS[number]['id']

const TAB_COPY: Record<TabId, { title: string; description: string; points: string[] }> = {
  dashboard: {
    title: 'Your month at a glance.',
    description: 'Every month gets a summary — net income, total spending, savings allocation, and rate — all built from your uploaded CSV.',
    points: ['Monthly income statement (fixed vs. variable)', 'Savings breakdown by category', 'Savings rate with progress bar'],
  },
  annual: {
    title: 'See your full year in one view.',
    description: 'Gross income, estimated tax, total expenses, and savings — built automatically from every month you have uploaded.',
    points: ['Gross income and estimated tax breakdown', 'Month-by-month expense chart', 'Annual savings total and rate'],
  },
  yoy: {
    title: 'See whether your financial life is improving.',
    description: 'Compare any two years and see whether income grew, spending dropped, and your savings rate improved.',
    points: ['Year-over-year income and expense totals', 'Savings rate comparison with delta', 'Improving or declining financial health banner'],
  },
  forecast: {
    title: 'Plan ahead with your actual numbers.',
    description: 'Enter your current savings balance and Budgli projects your future balance — conservative, base, and optimistic — at any horizon.',
    points: ['Time horizons from 1 to 30 years', 'Conservative, base, and optimistic scenarios', 'Based on your real monthly savings habit'],
  },
}

// ─── Monthly Dashboard demo ───────────────────────────────────────────────────

function MonthlyDashboardDemo() {
  const savingsRows = [
    { label: 'RRSP Contribution', value: '$500.00' },
    { label: 'Emergency Fund',    value: '$253.00' },
    { label: 'TFSA Index Fund',   value: '$300.00' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[11px] shadow-sm">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold text-gray-700">May 2026</span>
        <span className="text-gray-400 text-[10px]">· Monthly Dashboard</span>
      </div>
      {/* Stat row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-3 py-2.5" style={{ backgroundColor: '#F0FDF4' }}>
          <p className="text-[9px] text-gray-500 mb-0.5">Net Income</p>
          <p className="font-bold text-gray-900 text-sm tabular-nums">$4,083</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[9px] text-gray-500 mb-0.5">Total Expenses</p>
          <p className="font-bold text-gray-900 text-sm tabular-nums">$2,840</p>
        </div>
        <div className="px-3 py-2.5" style={{ backgroundColor: '#F0FDF9' }}>
          <p className="text-[9px] text-gray-500 mb-0.5">Savings</p>
          <p className="font-bold text-sm tabular-nums" style={{ color: '#0D7377' }}>$1,053</p>
        </div>
      </div>
      {/* Income Statement */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: '#F0FDF4' }}>
        <span className="text-gray-600">Net Income</span>
        <span className="font-semibold text-gray-900 tabular-nums">$4,083.00</span>
      </div>
      <div className="border-t border-gray-200" />
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
        <span className="text-gray-600">Fixed Costs</span>
        <span className="font-medium text-gray-700 tabular-nums">$2,078.00</span>
      </div>
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-gray-600">Variable Spending</span>
        <span className="font-medium text-gray-700 tabular-nums">$761.62</span>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-gray-200">
        <span className="font-bold text-gray-900">Total Expenses</span>
        <span className="font-bold text-gray-900 tabular-nums">$2,839.62</span>
      </div>
      <div className="border-t border-gray-200" />
      {savingsRows.map(r => (
        <div key={r.label} className="flex items-center justify-between px-4 py-1.5" style={{ backgroundColor: '#F0FDF9' }}>
          <span className="font-medium" style={{ color: '#0D7377' }}>{r.label}</span>
          <span className="font-medium tabular-nums" style={{ color: '#0D7377' }}>{r.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#F0FDF9' }}>
        <span className="font-bold" style={{ color: '#0D7377' }}>Total Savings</span>
        <span className="font-bold tabular-nums" style={{ color: '#0D7377' }}>$1,053.00</span>
      </div>
      <div className="px-4 py-2.5" style={{ backgroundColor: '#F0FDF9' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-medium" style={{ color: '#0D7377' }}>Savings Rate</span>
          <span className="font-semibold tabular-nums" style={{ color: '#0D7377' }}>25.8%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '25.8%', backgroundColor: '#00C896' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Annual Summary demo ──────────────────────────────────────────────────────

const MONTHLY_SPEND = [
  { m: 'J', v: 2800 }, { m: 'F', v: 2500 }, { m: 'M', v: 3000 },
  { m: 'A', v: 2600 }, { m: 'M', v: 2900 }, { m: 'J', v: 2800 },
  { m: 'J', v: 3200 }, { m: 'A', v: 2900 }, { m: 'S', v: 2700 },
  { m: 'O', v: 3000 }, { m: 'N', v: 3600 }, { m: 'D', v: 3800 },
]
const MAX_SPEND = Math.max(...MONTHLY_SPEND.map(d => d.v))
const NET_MONTHLY = 4083

function AnnualSummaryDemo() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[11px] shadow-sm">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold text-gray-700">2025</span>
        <span className="text-gray-400 text-[10px]">· Annual Summary</span>
      </div>
      {/* Income breakdown */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Income</p>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-600">Gross Income</span>
            <span className="font-medium text-gray-900 tabular-nums">$59,400.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax (est.)</span>
            <span className="text-gray-500 tabular-nums">−$9,600.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payroll Deductions</span>
            <span className="text-gray-500 tabular-nums">−$800.00</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-gray-100">
            <span className="font-bold text-gray-900">Net Income</span>
            <span className="font-bold tabular-nums" style={{ color: '#15803D' }}>$49,000.00</span>
          </div>
        </div>
      </div>
      {/* Monthly bar chart */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Monthly Expenses</p>
        <div className="flex items-end gap-1 h-16">
          {MONTHLY_SPEND.map((d, i) => {
            const pct = d.v / MAX_SPEND
            const isHigh = d.v > NET_MONTHLY * 0.85
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${pct * 100}%`,
                    backgroundColor: isHigh ? '#F59E0B' : '#0D7377',
                    opacity: 0.8,
                  }}
                />
                <span className="text-[7px] text-gray-400">{d.m}</span>
              </div>
            )
          })}
        </div>
      </div>
      {/* Annual totals */}
      <div className="px-4 py-2.5 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[9px] text-gray-400 mb-0.5">Total Expenses</p>
          <p className="font-semibold text-gray-900 tabular-nums">$35,600</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-400 mb-0.5">Total Savings</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0D7377' }}>$13,400</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 mb-0.5">Savings Rate</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0D7377' }}>27.3%</p>
        </div>
      </div>
    </div>
  )
}

// ─── Year-over-Year demo ──────────────────────────────────────────────────────

function YearOverYearDemo() {
  const kpis = [
    { label: 'Net Income',    v2024: '$45,000', v2025: '$49,000', delta: '+$4,000',  good: true  },
    { label: 'Expenses',      v2024: '$38,200', v2025: '$35,600', delta: '−$2,600',  good: true  },
    { label: 'Total Savings', v2024: '$6,800',  v2025: '$13,400', delta: '+$6,600',  good: true  },
    { label: 'Savings Rate',  v2024: '15.1%',   v2025: '27.3%',   delta: '+12.2 pp', good: true  },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[11px] shadow-sm">
      {/* Improvement banner */}
      <div className="px-4 py-2.5 flex items-center gap-2.5" style={{ backgroundColor: '#F0FDF4', borderBottom: '1px solid #BBF7D0' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="#00C896" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Financial health improved in 2025</p>
          <p className="text-[9px] text-gray-500">Income up · Expenses down · Savings doubled</p>
        </div>
      </div>
      {/* Column headers */}
      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 grid items-center" style={{ gridTemplateColumns: '1fr 56px 56px 64px' }}>
        <span className="text-[9px] text-gray-400">Metric</span>
        <span className="text-[9px] text-gray-400 text-right">2024</span>
        <span className="text-[9px] text-gray-400 text-right">2025</span>
        <span className="text-[9px] text-gray-400 text-right">Change</span>
      </div>
      {kpis.map(k => (
        <div key={k.label} className="px-4 py-2 border-b border-gray-50 grid items-center" style={{ gridTemplateColumns: '1fr 56px 56px 64px' }}>
          <span className="text-gray-600 font-medium">{k.label}</span>
          <span className="text-right text-gray-400 tabular-nums">{k.v2024}</span>
          <span className="text-right font-semibold text-gray-900 tabular-nums">{k.v2025}</span>
          <div className="flex justify-end">
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums"
              style={{
                backgroundColor: k.good ? '#DCFCE7' : '#FEF3C7',
                color: k.good ? '#15803D' : '#B45309',
              }}
            >
              {k.delta}
            </span>
          </div>
        </div>
      ))}
      <div className="px-4 py-2 bg-gray-50">
        <span className="text-[9px] text-gray-400">Comparing 2024 vs 2025 · full year each</span>
      </div>
    </div>
  )
}

// ─── Savings Forecast demo ────────────────────────────────────────────────────

const HORIZONS = [1, 3, 5, 10, 20, 30] as const
type Horizon = (typeof HORIZONS)[number]

const FORECAST_START = 28500
const FORECAST_MONTHLY = 1053

function projectAt(years: number, annualRate: number): number {
  const r = annualRate / 12
  const n = years * 12
  return FORECAST_START * Math.pow(1 + r, n) + FORECAST_MONTHLY * (Math.pow(1 + r, n) - 1) / r
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function SavingsForecastDemo() {
  const [horizon, setHorizon] = useState<Horizon>(10)

  const baseVal = projectAt(horizon, 0.05)
  const consVal = projectAt(horizon, 0.03)
  const optVal  = projectAt(horizon, 0.07)

  // Build SVG curve
  const W = 400, H = 130
  const PL = 12, PR = 12, PT = 8, PB = 20
  const cW = W - PL - PR, cH = H - PT - PB

  const yPts = Array.from({ length: horizon + 1 }, (_, i) => ({
    yr: i,
    val: i === 0 ? FORECAST_START : projectAt(i, 0.05),
  }))
  const minV = FORECAST_START * 0.98
  const maxV = yPts[yPts.length - 1].val

  const pts = yPts.map(d => ({
    x: PL + (d.yr / horizon) * cW,
    y: PT + cH - ((d.val - minV) / (maxV - minV)) * cH,
  }))

  let linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const mx = ((p.x + c.x) / 2).toFixed(1)
    linePath += ` C ${mx} ${p.y.toFixed(1)} ${mx} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(H - PB).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(H - PB).toFixed(1)} Z`

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[11px] shadow-sm">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold text-gray-700">Savings Forecast</span>
        <span className="text-gray-400 text-[10px]">· $1,053/mo saved</span>
      </div>

      {/* Horizon selector */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Time horizon</p>
        <div className="flex gap-1.5">
          {HORIZONS.map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                horizon === h
                  ? 'bg-budgli-teal text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {h}yr
            </button>
          ))}
        </div>
      </div>

      {/* Projected value */}
      <div className="px-4 pb-1">
        <p className="text-[9px] text-gray-400 mb-0.5">
          Projected at {horizon} {horizon === 1 ? 'year' : 'years'} · base case (5%)
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={horizon}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-bold tabular-nums"
            style={{ color: '#0D7377' }}
          >
            {fmtMoney(baseVal)}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* SVG area chart */}
      <div className="px-3 pb-1">
        <AnimatePresence mode="wait">
          <motion.svg
            key={horizon}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ display: 'block' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <defs>
              <linearGradient id="fc-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D7377" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0D7377" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0.33, 0.66].map(f => (
              <line
                key={f}
                x1={PL} x2={W - PR}
                y1={PT + cH * (1 - f)} y2={PT + cH * (1 - f)}
                stroke="#F0F0F0" strokeWidth={1}
              />
            ))}
            <path d={areaPath} fill="url(#fc-grad)" />
            <path d={linePath} fill="none" stroke="#0D7377" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={3.5} fill="#0D7377" />
            <text x={PL} y={H - 4} fontSize={8} fill="#9CA3AF">Now</text>
            <text x={W - PR} y={H - 4} fontSize={8} fill="#9CA3AF" textAnchor="end">{horizon}yr</text>
          </motion.svg>
        </AnimatePresence>
      </div>

      {/* Scenario range */}
      <div className="px-4 py-2.5 border-t border-gray-100 grid grid-cols-3">
        <div>
          <p className="text-[9px] text-gray-400 mb-0.5">Conservative · 3%</p>
          <p className="font-semibold text-gray-600 tabular-nums">{fmtMoney(consVal)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-gray-400 mb-0.5">Base case · 5%</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0D7377' }}>{fmtMoney(baseVal)}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-gray-400 mb-0.5">Optimistic · 7%</p>
          <p className="font-semibold text-gray-700 tabular-nums">{fmtMoney(optVal)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── demo panel selector ──────────────────────────────────────────────────────

function DemoPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'dashboard': return <MonthlyDashboardDemo />
    case 'annual':    return <AnnualSummaryDemo />
    case 'yoy':       return <YearOverYearDemo />
    case 'forecast':  return <SavingsForecastDemo />
  }
}

// ─── section ──────────────────────────────────────────────────────────────────

export default function ProductDemo() {
  const [active, setActive] = useState<TabId>('dashboard')
  const copy = TAB_COPY[active]

  return (
    <section className="py-20 px-6 bg-budgli-navy">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            See Budgli in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Explore how your data becomes insight.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Each view in Budgli answers a different question about your financial life.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === tab.id
                  ? 'bg-white text-budgli-navy shadow-sm'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/8 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* Copy */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3 leading-snug">
                  {copy.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {copy.description}
                </p>
                <ul className="space-y-2.5">
                  {copy.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-budgli-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm text-white/70 leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-budgli-teal hover:bg-budgli-teal-dark text-white font-semibold text-sm transition-colors shadow-lg shadow-budgli-teal/20"
                >
                  Try it free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>

              {/* Demo panel */}
              <div className="w-full">
                <DemoPanel tab={active} />
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-white/25 text-xs mt-6">
          Sample data shown — your numbers will reflect your actual uploaded transactions.
        </p>

      </div>
    </section>
  )
}
