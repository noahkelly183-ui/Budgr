'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   App-authentic feature visuals — each matches the actual Budgli product UI.
   ───────────────────────────────────────────────────────────────────────────── */

function IncomeStatementVisual() {
  const fixed = [
    { name: 'Rent / Mortgage', hex: '#0D7377', amt: '$1,850' },
    { name: 'Phone & Internet', hex: '#3B82F6', amt: '$80' },
    { name: 'Subscriptions',   hex: '#3B82F6', amt: '$28' },
  ]
  const variable = [
    { name: 'Groceries',  hex: '#22C55E', amt: '$420' },
    { name: 'Dining Out', hex: '#A855F7', amt: '$189' },
    { name: 'Fuel',       hex: '#F59E0B', amt: '$110' },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-sm">Monthly Income Statement</span>
        <span className="text-gray-400 text-[11px] tabular-nums">May 2026</span>
      </div>
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase border-y border-gray-100" style={{ background: '#F0FDF4', color: '#0D7377' }}>NET INCOME</div>
      <div className="flex justify-between items-center px-5 py-2.5 border-b border-gray-100">
        <span style={{ color: '#0D7377' }}>Net Take-Home Pay</span>
        <span className="font-bold text-base tabular-nums" style={{ color: '#00C896' }}>$4,720</span>
      </div>
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-50 border-y border-gray-100">FIXED COSTS</div>
      {fixed.map(f => (
        <div key={f.name} className="flex justify-between items-center px-5 py-2 border-b border-gray-100">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.hex }} />{f.name}
          </span>
          <span className="font-semibold text-gray-800 tabular-nums">{f.amt}</span>
        </div>
      ))}
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-50 border-y border-gray-100">VARIABLE SPENDING</div>
      {variable.map(v => (
        <div key={v.name} className="flex justify-between items-center px-5 py-2 border-b border-gray-100">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: v.hex }} />{v.name}
          </span>
          <span className="font-semibold text-gray-800 tabular-nums">{v.amt}</span>
        </div>
      ))}
      <div className="flex justify-between items-center px-5 py-2.5 bg-gray-50 border-t-2 border-gray-900 border-b border-gray-100">
        <span className="font-bold text-sm text-gray-900">Total Expenses</span>
        <span className="font-bold text-sm text-gray-900 tabular-nums">$2,840</span>
      </div>
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase border-y border-gray-100" style={{ background: '#F0FDF9', color: '#0D7377' }}>SAVINGS</div>
      <div className="flex justify-between items-center px-5 py-2.5 border-b border-gray-100">
        <span className="flex items-center gap-2" style={{ color: '#0D7377' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: '#0D7377' }} />Total Savings
        </span>
        <span className="font-bold text-base tabular-nums" style={{ color: '#00C896' }}>$1,880</span>
      </div>
      <div className="px-5 py-3">
        <div className="flex justify-between items-center mb-1.5">
          <span style={{ color: '#0D7377' }}>Savings Rate</span>
          <span className="font-bold tabular-nums text-sm" style={{ color: '#00C896' }}>39.8%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '39.8%', background: '#00C896' }} />
        </div>
      </div>
    </div>
  )
}

function ForecastVisual() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-sm">
      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-sm">Savings Forecast</span>
        <span className="text-gray-400 text-[11px]">10 years · 5% base</span>
      </div>
      <div className="px-5 pt-4 pb-2">
        <div className="text-[11px] text-gray-500 mb-1">Projected balance</div>
        <div className="text-4xl font-extrabold tabular-nums leading-none tracking-tight" style={{ color: '#00C896' }}>$210k</div>
        <div className="text-[11px] text-gray-400 mt-1.5">at 10 years from today</div>
      </div>
      <div className="px-5 pb-3">
        {/* Chart — "Now" label safely below axis */}
        <svg viewBox="0 0 400 155" width="100%" preserveAspectRatio="none" className="block">
          <defs>
            <linearGradient id="pp-forecast-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C896" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#00C896" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="0" y1="25"  x2="400" y2="25"  stroke="#F3F4F6" strokeWidth="1" />
          <line x1="0" y1="55"  x2="400" y2="55"  stroke="#F3F4F6" strokeWidth="1" />
          <line x1="0" y1="85"  x2="400" y2="85"  stroke="#F3F4F6" strokeWidth="1" />
          <line x1="0" y1="115" x2="400" y2="115" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M 0 112 C 80 108 160 90 240 55 L 400 8 L 400 115 L 0 115 Z" fill="url(#pp-forecast-grad)" />
          <path d="M 0 112 C 80 108 160 90 240 55 L 400 8" stroke="#00C896" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="400" cy="8" r="5" fill="#00C896" />
          <text x="4"   y="131" fontSize="10" fill="#9CA3AF">Now</text>
          <text x="200" y="131" fontSize="10" fill="#9CA3AF" textAnchor="middle">5yr</text>
          <text x="396" y="131" fontSize="10" fill="#9CA3AF" textAnchor="end">10yr</text>
        </svg>
      </div>
      <div className="grid grid-cols-3 px-5 py-3 border-t border-gray-100 gap-3">
        <div>
          <div className="text-[10px] text-gray-400">Conservative 3%</div>
          <div className="font-bold text-gray-700 tabular-nums text-sm">$190k</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400">Base 5%</div>
          <div className="font-bold tabular-nums text-sm" style={{ color: '#0D7377' }}>$210k</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">Optimistic 7%</div>
          <div className="font-bold text-gray-700 tabular-nums text-sm">$233k</div>
        </div>
      </div>
    </div>
  )
}

function CategoriesVisual() {
  const fixed = [
    { name: 'Rent / Mortgage', hex: '#0D7377', amt: 1850, total: 2190 },
    { name: 'Car Insurance',   hex: '#3B82F6', amt: 182,  total: 2190 },
    { name: 'Subscriptions',   hex: '#3B82F6', amt: 55,   total: 2190 },
    { name: 'Phone & Internet',hex: '#3B82F6', amt: 80,   total: 2190 },
  ]
  const variable = [
    { name: 'Groceries',       hex: '#22C55E', amt: 420, total: 760 },
    { name: 'Dining Out',      hex: '#A855F7', amt: 189, total: 760 },
    { name: 'Coffee & Drinks', hex: '#F59E0B', amt: 67,  total: 760 },
    { name: 'Fuel',            hex: '#F59E0B', amt: 84,  total: 760 },
  ]
  function Card({ title, count, items, total }: { title: string; count: string; items: typeof fixed; total: string }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-800">{title}</span>
          <span className="text-[10px] text-gray-400">{count}</span>
        </div>
        <div className="space-y-2.5 flex-1">
          {items.map(item => (
            <div key={item.name}>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-gray-600 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.hex }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-medium text-gray-800 tabular-nums shrink-0 ml-1">${item.amt.toLocaleString()}</span>
              </div>
              <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round((item.amt / item.total) * 100)}%`, background: item.hex }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">Total YTD</span>
          <span className="text-xs font-semibold text-gray-900 tabular-nums">{total}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card title="Fixed Costs"       count="4 items" items={fixed}    total="$2,167" />
      <Card title="Variable Spending" count="4 items" items={variable} total="$760" />
    </div>
  )
}

function AnnualSummaryVisual() {
  const months = [
    { m: 'Jan', v: 3200 }, { m: 'Feb', v: 2800 }, { m: 'Mar', v: 3400 },
    { m: 'Apr', v: 2600 }, { m: 'May', v: 3100 }, { m: 'Jun', v: 0 },
    { m: 'Jul', v: 0 },    { m: 'Aug', v: 0 },    { m: 'Sep', v: 0 },
    { m: 'Oct', v: 0 },    { m: 'Nov', v: 0 },    { m: 'Dec', v: 0 },
  ]
  const maxV = 3400
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-start px-5 py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-800">Annual Net Income</p>
            <p className="text-[10px] text-gray-400 mt-0.5">2026</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">$56,650</p>
        </div>
        <div className="px-5 divide-y divide-gray-50">
          <div className="flex justify-between items-center py-2 text-xs">
            <span className="text-gray-600">Gross Annual Salary</span>
            <span className="font-medium text-gray-800 tabular-nums">$95,000</span>
          </div>
          <div className="flex justify-between items-center py-2 text-xs">
            <span className="text-gray-500">Income Tax (30%)</span>
            <span className="font-medium text-red-400 tabular-nums">− $28,500</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 text-xs">
            <span className="font-semibold text-gray-700">Annual Net Income</span>
            <span className="font-bold text-gray-900 tabular-nums">$56,650</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-gray-800">Monthly Spending Overview</p>
          <p className="text-[10px] text-gray-400">2026</p>
        </div>
        <div className="flex items-end gap-1 h-16">
          {months.map(({ m, v }) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: v > 0 ? `${Math.round((v / maxV) * 52)}px` : '3px',
                  background: v > 0 ? '#0D7377' : '#F3F4F6',
                }}
              />
              <span className="text-[8px] text-gray-400 leading-none">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function YearOverYearVisual() {
  const rows = [
    { label: 'Net Income',    y25: '$52,400', y26: '$56,650', delta: '+$4,250', up: true  },
    { label: 'Expenses',      y25: '$36,720', y26: '$33,840', delta: '−$2,880', up: false },
    { label: 'Savings',       y25: '$15,680', y26: '$22,810', delta: '+$7,130', up: true  },
    { label: 'Savings Rate',  y25: '29.9%',   y26: '40.3%',  delta: '+10.4pp', up: true  },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-sm">
      <div className="grid px-5 py-2.5 border-b border-gray-100 bg-gray-50" style={{ gridTemplateColumns: '1fr 72px 72px 68px' }}>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Metric</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">2025</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-right" style={{ color: '#0D7377' }}>2026</span>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Change</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={`grid px-5 py-3 items-center ${i < rows.length - 1 ? 'border-b border-gray-100' : ''}`}
          style={{ gridTemplateColumns: '1fr 72px 72px 68px' }}
        >
          <span className="text-gray-700 font-medium">{r.label}</span>
          <span className="text-gray-400 text-right tabular-nums">{r.y25}</span>
          <span className="font-semibold text-gray-900 text-right tabular-nums">{r.y26}</span>
          <div className="flex justify-end">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full tabular-nums"
              style={r.up
                ? { background: '#F0FDF9', color: '#0D7377' }
                : { background: '#FEF2F2', color: '#EF4444' }}
            >
              {r.delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PerformanceScoreVisual() {
  const score = 92
  const scoreColor = '#00C896'
  const components = [
    { label: 'Savings Rate', value: 38, max: 40 },
    { label: 'Fixed Costs',  value: 28, max: 30 },
    { label: 'Variable',     value: 18, max: 20 },
    { label: 'Consistency',  value: 8,  max: 10 },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-end gap-1 shrink-0">
          <span className="font-black leading-none tabular-nums" style={{ fontSize: '72px', color: scoreColor, letterSpacing: '-0.03em' }}>
            {score}
          </span>
          <span className="text-sm font-semibold text-gray-300 leading-none mb-3">/100</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Monthly Score</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">Outstanding</p>
          <p className="text-xs text-gray-500 mt-0.5">Savings rate of 39.8%</p>
        </div>
      </div>
      <div className="space-y-3">
        {components.map(c => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{c.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${(c.value / c.max) * 100}%`, background: scoreColor }} />
            </div>
            <span className="text-xs font-bold tabular-nums w-12 text-right shrink-0" style={{ color: scoreColor }}>
              {c.value}<span className="text-gray-300 font-normal">/{c.max}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Feature definitions
   ───────────────────────────────────────────────────────────────────────────── */

type FeatureDef = {
  id: string
  label: string
  title: string
  copy: string
  bullets: string[]
  Visual: () => JSX.Element
}

const FEATURES: FeatureDef[] = [
  {
    id: 'income',
    label: 'Income Statement',
    title: 'Personal Income Statement',
    copy: 'See income, fixed costs, variable costs, and what you saved — all in one monthly report.',
    bullets: [
      'Net income, fixed costs, variable spending, and savings separated clearly',
      'Savings rate calculated automatically from your real data',
      'Works like a business P&L, built for your personal finances',
    ],
    Visual: IncomeStatementVisual,
  },
  {
    id: 'forecast',
    label: 'Savings Forecast',
    title: 'Savings Forecast',
    copy: 'Project where your savings are heading based on your real savings rate and current balance.',
    bullets: [
      '1, 3, 5, 10, and 30-year projections',
      'Conservative, base, and optimistic scenarios',
      'Updates automatically as your savings rate changes',
    ],
    Visual: ForecastVisual,
  },
  {
    id: 'categories',
    label: 'Categories',
    title: 'Categories',
    copy: 'Group transactions into fixed costs, variable costs, income, and savings — the four buckets that explain any month.',
    bullets: [
      'Fixed and variable costs separated with progress bars',
      'Auto-tagged on import — fix the outliers, not every row',
      'Savings categories tracked separately from spending',
    ],
    Visual: CategoriesVisual,
  },
  {
    id: 'annual',
    label: 'Annual Summary',
    title: 'Annual Summary',
    copy: 'Step back from one month and see the full-year picture — income, expenses, savings, and monthly spending trends.',
    bullets: [
      'Annual net income breakdown with tax and deductions',
      'Monthly spending overview across the full year',
      'YTD savings rate and projected full-year totals',
    ],
    Visual: AnnualSummaryVisual,
  },
  {
    id: 'yoy',
    label: 'Year-over-Year',
    title: 'Year-over-Year Analysis',
    copy: 'Compare this year against last year to see what actually changed in your income, expenses, and savings rate.',
    bullets: [
      'Side-by-side comparison of income, expenses, and savings',
      'Clear delta indicators showing improvement or decline',
      'Savings rate change highlighted for at-a-glance reading',
    ],
    Visual: YearOverYearVisual,
  },
  {
    id: 'score',
    label: 'Performance Score',
    title: 'Performance Score',
    copy: 'Get a simple read on how the month performed — a score based on your real savings, spending, and consistency.',
    bullets: [
      'Score out of 100 based on savings rate, fixed cost ratio, and consistency',
      'Breakdown of each contributing factor',
      'Updates every month with your latest import',
    ],
    Visual: PerformanceScoreVisual,
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Section
   ───────────────────────────────────────────────────────────────────────────── */

export default function ProductPillars() {
  const [activeId, setActiveId] = useState('income')
  const feature = FEATURES.find(f => f.id === activeId) ?? FEATURES[0]
  const { Visual } = feature

  return (
    <section id="features" className="bg-budgli-navy py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            What Budgli tracks
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to understand your money.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            A personal income statement, savings forecast, categories, annual summary, year-over-year analysis, and a performance score.
          </p>
        </div>

        {/* Tab row */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {FEATURES.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveId(f.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                f.id === activeId
                  ? 'bg-white text-budgli-navy shadow-sm'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feature panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 items-start"
          >
            {/* Left: description */}
            <div className="lg:pt-2">
              <h3 className="text-xl font-bold text-white mb-3 leading-snug">{feature.title}</h3>
              <p className="text-white/60 text-base leading-relaxed mb-6">{feature.copy}</p>
              <ul className="space-y-3">
                {feature.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-budgli-green shrink-0" />
                    <span className="text-sm text-white/55 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: visual */}
            <div className="w-full">
              <Visual />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
