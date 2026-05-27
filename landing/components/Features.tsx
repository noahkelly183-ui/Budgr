'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

// ─── Year-over-Year mini visual ───────────────────────────────────────────────

function YoYVisual() {
  const rows = [
    { label: 'Net Income',   v2024: '$45,000', v2025: '$49,000', delta: '+$4,000',  good: true },
    { label: 'Expenses',     v2024: '$38,200', v2025: '$35,600', delta: '−$2,600',  good: true },
    { label: 'Total Savings',v2024: '$6,800',  v2025: '$13,400', delta: '+$6,600',  good: true },
    { label: 'Savings Rate', v2024: '15.1%',   v2025: '27.3%',   delta: '+12.2 pp', good: true },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm text-sm">
      {/* Improvement banner */}
      <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ backgroundColor: '#F0FDF4', borderBottomColor: '#BBF7D0' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
          <svg className="w-4 h-4" fill="none" stroke="#00C896" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Financial health improved in 2025</p>
          <p className="text-xs text-gray-500">Income up · Expenses down · Savings doubled</p>
        </div>
      </div>
      {/* Column headers */}
      <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 grid" style={{ gridTemplateColumns: '1fr 68px 68px 76px' }}>
        <span className="text-xs text-gray-400">Metric</span>
        <span className="text-xs text-gray-400 text-right">2024</span>
        <span className="text-xs text-gray-400 text-right">2025</span>
        <span className="text-xs text-gray-400 text-right">Change</span>
      </div>
      {rows.map(r => (
        <div key={r.label} className="px-5 py-3 border-b border-gray-50 grid items-center" style={{ gridTemplateColumns: '1fr 68px 68px 76px' }}>
          <span className="text-sm font-medium text-gray-700">{r.label}</span>
          <span className="text-right text-sm text-gray-400 tabular-nums">{r.v2024}</span>
          <span className="text-right text-sm font-semibold text-gray-900 tabular-nums">{r.v2025}</span>
          <div className="flex justify-end">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums"
              style={{
                backgroundColor: r.good ? '#DCFCE7' : '#FEF3C7',
                color: r.good ? '#15803D' : '#B45309',
              }}
            >
              {r.delta}
            </span>
          </div>
        </div>
      ))}
      <div className="px-5 py-2.5 bg-gray-50">
        <span className="text-xs text-gray-400">Comparing 2024 vs 2025 · full year each</span>
      </div>
    </div>
  )
}

// ─── Savings Forecast mini visual ─────────────────────────────────────────────

function projectAt(years: number, rate: number): number {
  const r = rate / 12
  const n = years * 12
  const start = 28500, monthly = 1053
  return start * Math.pow(1 + r, n) + monthly * (Math.pow(1 + r, n) - 1) / r
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

function ForecastVisual() {
  const horizon = 10
  const baseVal = projectAt(horizon, 0.05)
  const consVal = projectAt(horizon, 0.03)
  const optVal  = projectAt(horizon, 0.07)

  // Build SVG curve
  const W = 400, H = 140
  const PL = 12, PR = 12, PT = 10, PB = 24
  const cW = W - PL - PR, cH = H - PT - PB

  const yPts = Array.from({ length: horizon + 1 }, (_, i) => ({
    yr: i,
    val: i === 0 ? 28500 : projectAt(i, 0.05),
  }))
  const minV = 28500 * 0.98
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
  const areaPath = `${linePath} L ${pts[pts.length-1].x.toFixed(1)} ${(H-PB).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(H-PB).toFixed(1)} Z`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" className="w-4 h-4 shrink-0" />
        <span className="font-semibold text-gray-700 text-sm">Savings Forecast · 10 years</span>
      </div>
      {/* Hero number */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs text-gray-400 mb-1">Projected at 10 years · base case (5%)</p>
        <p className="text-4xl font-bold tabular-nums" style={{ color: '#0D7377' }}>{fmtMoney(baseVal)}</p>
        <p className="text-sm text-gray-400 mt-1.5">starting from $28,500 · saving $1,053/mo</p>
      </div>
      {/* SVG chart */}
      <div className="px-3 pb-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="feat-fc-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D7377" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0D7377" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map(f => (
            <line key={f} x1={PL} x2={W-PR} y1={PT + cH*(1-f)} y2={PT + cH*(1-f)} stroke="#F0F0F0" strokeWidth={1} />
          ))}
          <path d={areaPath} fill="url(#feat-fc-grad)" />
          <path d={linePath} fill="none" stroke="#0D7377" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r={4} fill="#0D7377" />
          <text x={PL} y={H-6} fontSize={9} fill="#9CA3AF">Now</text>
          <text x={W-PR} y={H-6} fontSize={9} fill="#9CA3AF" textAnchor="end">10yr</text>
        </svg>
      </div>
      {/* Scenario range */}
      <div className="px-5 py-3.5 border-t border-gray-100 grid grid-cols-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Conservative · 3%</p>
          <p className="font-semibold text-gray-600 tabular-nums">{fmtMoney(consVal)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Base case · 5%</p>
          <p className="font-semibold tabular-nums" style={{ color: '#0D7377' }}>{fmtMoney(baseVal)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Optimistic · 7%</p>
          <p className="font-semibold text-gray-700 tabular-nums">{fmtMoney(optVal)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id:          'yoy',
    eyebrow:     'Year-over-Year Review',
    title:       'See whether your financial life is improving.',
    description: 'Every year you upload tells a more complete story. Compare what you earned, what you spent, and what you saved — year over year — and see whether your finances are actually moving in the right direction.',
    points: [
      'Annual net income and expense totals side by side',
      'Year-over-year savings rate comparison',
      'Improvement or decline banner based on your data',
      'Coloured delta badges for each key metric',
    ],
    visual: <YoYVisual />,
    reverse: false,
  },
  {
    id:          'forecast',
    eyebrow:     'Savings Forecast',
    title:       'Plan ahead with your actual numbers.',
    description: 'Enter your current savings balances and Budgli projects where you will be in 1, 3, 5, 10, or 30 years — based on your real savings rate and allocation, not generic rules of thumb.',
    points: [
      'Multiple savings accounts with individual growth rates',
      'Conservative, base, and optimistic projections',
      'Configurable time horizons from 1 to 30 years',
      'Recalculates automatically as your data changes',
    ],
    visual: <ForecastVisual />,
    reverse: true,
  },
]

// ─── section ──────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            Look back. Look forward.
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Budgli includes two tools built for clarity — one for understanding the past,
            one for planning what comes next.
          </p>
        </motion.div>

        <div className="space-y-16">
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start ${feature.reverse ? 'lg:[&>*:first-child]:order-last' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Copy */}
              <div className="flex flex-col justify-center">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
                  {feature.eyebrow}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-budgli-navy leading-snug mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {feature.points.map(pt => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-budgli-green shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm text-gray-600 leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={APP_URL}
                  className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-budgli-teal hover:bg-budgli-teal-dark text-white font-semibold text-sm transition-colors"
                >
                  Get started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>

              {/* Visual */}
              <div>{feature.visual}</div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
