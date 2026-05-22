'use client'

import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   Real-size pillar cards — same density as the live Monthly Dashboard.
   No miniatures. Each card is a full income-statement / forecast view.
   ───────────────────────────────────────────────────────────────────────────── */

function IncomeStatementCard() {
  const fixed = [
    { name: 'Rent',                   hex: '#0D7377', amount: '$1,850.00' },
    { name: 'Phone & Internet',       hex: '#3B82F6', amount: '$80.00'    },
    { name: 'Subscriptions',          hex: '#3B82F6', amount: '$28.00'    },
  ]
  const variable = [
    { name: 'Groceries',              hex: '#22C55E', amount: '$420.45'   },
    { name: 'Dining Out',             hex: '#A855F7', amount: '$189.20'   },
    { name: 'Fuel',                   hex: '#F59E0B', amount: '$110.50'   },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Monthly Income Statement</span>
        <span className="text-[11px] text-gray-400 tabular-nums whitespace-nowrap">May 2026</span>
      </div>

      {/* NET INCOME band */}
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase border-y border-gray-100" style={{ backgroundColor: '#F0FDF4', color: '#0D7377' }}>NET INCOME</div>
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
        <span className="text-xs whitespace-nowrap" style={{ color: '#0D7377' }}>Net Take-Home Pay</span>
        <span className="font-bold text-base tabular-nums whitespace-nowrap" style={{ color: '#00C896' }}>$4,720.83</span>
      </div>

      {/* FIXED COSTS */}
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-50 border-y border-gray-100">FIXED COSTS</div>
      {fixed.map(f => (
        <div key={f.name} className="flex items-center justify-between px-5 py-2 border-b border-gray-100">
          <span className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.hex }} />
            {f.name}
          </span>
          <span className="font-semibold text-gray-800 tabular-nums whitespace-nowrap">{f.amount}</span>
        </div>
      ))}

      {/* VARIABLE */}
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-gray-50 border-y border-gray-100">VARIABLE SPENDING</div>
      {variable.map(v => (
        <div key={v.name} className="flex items-center justify-between px-5 py-2 border-b border-gray-100">
          <span className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: v.hex }} />
            {v.name}
          </span>
          <span className="font-semibold text-gray-800 tabular-nums whitespace-nowrap">{v.amount}</span>
        </div>
      ))}

      {/* TOTAL */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60 border-t-2 border-gray-900 border-b border-gray-100 whitespace-nowrap">
        <span className="text-sm font-bold text-gray-900">Total Expenses</span>
        <span className="text-sm font-bold text-gray-900 tabular-nums">$2,840.00</span>
      </div>

      {/* SAVINGS */}
      <div className="px-5 py-1.5 text-[10px] font-bold tracking-widest uppercase border-y border-gray-100" style={{ backgroundColor: '#F0FDF9', color: '#0D7377' }}>SAVINGS</div>
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
        <span className="flex items-center gap-2 whitespace-nowrap" style={{ color: '#0D7377' }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#0D7377' }} />
          Total Savings
        </span>
        <span className="font-bold text-base tabular-nums whitespace-nowrap" style={{ color: '#00C896' }}>$1,880.83</span>
      </div>

      {/* Savings rate */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px]" style={{ color: '#0D7377' }}>Savings Rate</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: '#00C896' }}>39.8%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '39.8%', backgroundColor: '#00C896' }} />
        </div>
      </div>
    </div>
  )
}

function ForecastCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-xs shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Savings Forecast</span>
        <span className="text-[11px] text-gray-400 whitespace-nowrap">10 years · 5% base rate</span>
      </div>

      <div className="px-5 pt-4 pb-1">
        <div className="text-[11px] text-gray-500 mb-0.5">Projected balance</div>
        <div className="text-4xl font-extrabold leading-none tracking-tight tabular-nums" style={{ color: '#00C896' }}>$210k</div>
        <div className="text-[11px] text-gray-500 mt-1.5">at 10 years from today</div>
      </div>

      <div className="px-5 pt-2 pb-3">
        <svg viewBox="0 0 400 140" width="100%" preserveAspectRatio="none" className="block">
          <defs>
            <linearGradient id="budgli-forecast-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C896" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00C896" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="0" y1="35"  x2="400" y2="35"  stroke="#F3F4F6" strokeWidth="1" />
          <line x1="0" y1="70"  x2="400" y2="70"  stroke="#F3F4F6" strokeWidth="1" />
          <line x1="0" y1="105" x2="400" y2="105" stroke="#F3F4F6" strokeWidth="1" />
          <path d="M 0 132 C 80 128 160 110 240 70 L 400 8 L 400 140 L 0 140 Z" fill="url(#budgli-forecast-grad)" />
          <path d="M 0 132 C 80 128 160 110 240 70 L 400 8" stroke="#00C896" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="400" cy="8" r="5" fill="#00C896" />
          <text x="4" y="138" fontSize="10" fill="#9CA3AF">Now</text>
          <text x="200" y="138" fontSize="10" fill="#9CA3AF" textAnchor="middle">5yr</text>
          <text x="396" y="138" fontSize="10" fill="#9CA3AF" textAnchor="end">10yr</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 py-3 border-t border-gray-100">
        <div>
          <div className="text-[10px] text-gray-400">Conservative 3%</div>
          <div className="text-sm font-bold text-gray-700 tabular-nums">$190k</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400">Base 5%</div>
          <div className="text-sm font-bold tabular-nums" style={{ color: '#0D7377' }}>$210k</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">Optimistic 7%</div>
          <div className="text-sm font-bold text-gray-700 tabular-nums">$233k</div>
        </div>
      </div>
    </div>
  )
}

const PILLARS = [
  {
    id: 'income-statement',
    eyebrow: 'Core view',
    title: 'Personal Income Statement',
    body: 'Every month gets a full P&L — net income, fixed costs, variable spending, and savings — broken down exactly like a business tracks it.',
    visual: <IncomeStatementCard />,
  },
  {
    id: 'savings-forecast',
    eyebrow: 'Planning',
    title: 'Savings Forecast',
    body: 'Based on your real savings rate and current balance, Budgli projects where you will be in 1, 3, 5, 10, or 30 years.',
    visual: <ForecastCard />,
  },
]

export default function ProductPillars() {
  return (
    <section id="features" className="bg-budgli-navy py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            What Budgli tracks
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to understand your money.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Two views that explain your money at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-2">
                {pillar.eyebrow}
              </p>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">{pillar.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">{pillar.body}</p>
              {pillar.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
