'use client';

import { motion } from 'framer-motion';

/* ─── Mini visual: Personal Income Statement ─── */
function IncomeMiniCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[10px] shadow-sm mt-5">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 font-semibold text-gray-700 text-[10px]">
        May 2026 · Income Statement
      </div>
      {/* Net Income */}
      <div className="bg-[#F0FDF4] px-3 py-2 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#00C896' }} />
          <span className="text-gray-600">Net Income</span>
        </div>
        <span className="font-bold text-gray-900">$4,083</span>
      </div>
      <div className="border-t border-gray-200" />
      {/* Fixed Costs */}
      <div className="px-3 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#3B82F6' }} />
          <span className="text-gray-500">Fixed Costs</span>
        </div>
        <span className="text-gray-700">$2,078</span>
      </div>
      {/* Variable Spending */}
      <div className="px-3 py-1.5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
          <span className="text-gray-500">Variable Spending</span>
        </div>
        <span className="text-gray-700">$762</span>
      </div>
      {/* Total Expenses */}
      <div className="border-t-2 border-gray-200 px-3 py-2 flex justify-between items-center">
        <span className="font-bold text-gray-900">Total Expenses</span>
        <span className="font-bold text-gray-900">$2,840</span>
      </div>
      <div className="border-t border-gray-200" />
      {/* Total Savings */}
      <div className="bg-[#F0FDF9] px-3 py-2 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#0D7377' }} />
          <span className="font-bold" style={{ color: '#0D7377' }}>Total Savings</span>
        </div>
        <span className="font-bold" style={{ color: '#0D7377' }}>$1,053</span>
      </div>
      {/* Savings Rate */}
      <div className="bg-[#F0FDF9] px-3 py-2">
        <div className="flex justify-between items-center mb-1.5">
          <span style={{ color: '#0D7377' }}>Savings Rate</span>
          <span className="font-bold" style={{ color: '#00C896' }}>25.8%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-1.5">
          <div className="h-1.5 rounded-full" style={{ width: '25.8%', backgroundColor: '#00C896' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Mini visual: Spending Clarity ─── */
function SpendingMiniCard() {
  const fixedRows = [
    { color: '#0D7377', label: 'Rent', pct: '67%', amount: '$1,400' },
    { color: '#3B82F6', label: 'Insurance', pct: '12%', amount: '$240' },
    { color: '#F59E0B', label: 'Phone', pct: '8%', amount: '$80' },
    { color: '#A855F7', label: 'Transit', pct: '9%', amount: '$180' },
  ];
  const variableRows = [
    { color: '#22C55E', label: 'Groceries', pct: '55%', amount: '$420' },
    { color: '#A855F7', label: 'Dining Out', pct: '25%', amount: '$189' },
    { color: '#3B82F6', label: 'Subscriptions', pct: '20%', amount: '$153' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[10px] shadow-sm mt-5">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-gray-700 font-semibold text-[10px]">
        Spending · May 2026
      </div>

      {/* Fixed Costs header */}
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Fixed Costs</span>
        <span className="text-gray-500">$2,078</span>
      </div>

      {/* Fixed rows */}
      {fixedRows.map((row) => (
        <div key={row.label} className="px-3 py-1.5 border-b border-gray-50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: row.color }} />
          <span className="flex-1 text-gray-600">{row.label}</span>
          <div className="w-full max-w-[64px] bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="h-1 rounded-full" style={{ width: row.pct, backgroundColor: row.color }} />
          </div>
          <span className="text-right text-gray-500 tabular-nums">{row.amount}</span>
        </div>
      ))}

      {/* Variable Spending header */}
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 border-t border-gray-200 flex justify-between items-center">
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Variable Spending</span>
        <span className="text-gray-500">$762</span>
      </div>

      {/* Variable rows */}
      {variableRows.map((row) => (
        <div key={row.label} className="px-3 py-1.5 border-b border-gray-50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: row.color }} />
          <span className="flex-1 text-gray-600">{row.label}</span>
          <div className="w-full max-w-[64px] bg-gray-100 rounded-full h-1 overflow-hidden">
            <div className="h-1 rounded-full" style={{ width: row.pct, backgroundColor: row.color }} />
          </div>
          <span className="text-right text-gray-500 tabular-nums">{row.amount}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Mini visual: Savings Forecast ─── */
function ForecastMiniCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[10px] shadow-sm mt-5">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold text-[10px]">
        Savings Forecast · 10yr
      </div>

      {/* Projected balance */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[9px] text-gray-400 mb-0.5">Projected balance</div>
        <div className="text-2xl font-bold leading-none" style={{ color: '#00C896' }}>$210k</div>
        <div className="text-[9px] text-gray-400 mt-0.5">at 10 years · 5% base rate</div>
      </div>

      {/* SVG chart */}
      <div className="px-3 pb-2">
        <svg viewBox="0 0 300 80" width="100%" display="block" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="pillars-fc-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C896" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00C896" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="26.4" x2="300" y2="26.4" stroke="#F0F0F0" strokeWidth="1" />
          <line x1="0" y1="52.8" x2="300" y2="52.8" stroke="#F0F0F0" strokeWidth="1" />
          {/* Area fill */}
          <path
            d="M 0 76 C 75 72 150 55 225 30 L 300 6 L 300 78 L 0 78 Z"
            fill="url(#pillars-fc-grad)"
          />
          {/* Line */}
          <path
            d="M 0 76 C 75 72 150 55 225 30 L 300 6"
            fill="none"
            stroke="#00C896"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* End dot */}
          <circle cx="300" cy="6" r="4" fill="#00C896" />
          {/* X-axis labels */}
          <text x="4" y="78" fontSize="8" fill="#9CA3AF">Now</text>
          <text x="296" y="78" fontSize="8" fill="#9CA3AF" textAnchor="end">10yr</text>
        </svg>
      </div>

      {/* Scenario grid */}
      <div className="border-t border-gray-100 grid grid-cols-3 px-3 py-2">
        <div>
          <div className="text-[9px] text-gray-400">Conservative 3%</div>
          <div className="text-[10px] font-semibold tabular-nums text-gray-500">$190k</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-400">Base 5%</div>
          <div className="text-[10px] font-semibold tabular-nums" style={{ color: '#0D7377' }}>$210k</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-gray-400">Optimistic 7%</div>
          <div className="text-[10px] font-semibold tabular-nums text-gray-700">$233k</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini visual: Monthly Performance ─── */
function ScoreMiniCard() {
  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-3.5 h-3.5 text-[#00C896] flex-shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );

  const rows = [
    { label: 'Savings Rate', value: '25.8%' },
    { label: 'Spending Ratio', value: '69.6%' },
    { label: 'Income Stable', value: 'Yes' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-[10px] shadow-sm mt-5">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold text-[10px]">
        Performance · May 2026
      </div>

      {/* Score display */}
      <div className="px-3 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black leading-none" style={{ color: '#0D7377' }}>92</span>
          <span className="text-lg text-gray-400 font-medium">/ 100</span>
        </div>
        <div className="text-[10px] text-gray-500 text-right max-w-[100px] leading-relaxed">
          Based on savings rate, spending ratio, and income trend
        </div>
      </div>

      {/* Contributing factors */}
      {rows.map((row) => (
        <div
          key={row.label}
          className="px-3 py-1.5 border-t border-gray-50 flex items-center justify-between"
        >
          <span className="text-gray-500">{row.label}</span>
          <div className="flex items-center gap-1">
            <CheckIcon />
            <span className="text-gray-700 font-medium">{row.value}</span>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="px-3 py-2 bg-[#F0FDF9] border-t border-gray-100">
        <span className="text-[9px]" style={{ color: '#0D7377' }}>
          Strong month. Savings rate above 20%.
        </span>
      </div>
    </div>
  );
}

/* ─── Pillar data ─── */
const PILLARS = [
  {
    id: 'income-statement',
    eyebrow: 'Core view',
    title: 'Personal Income Statement',
    body: 'Every month gets a full P&L — net income, fixed costs, variable spending, and savings — broken down exactly like a business tracks it.',
    visual: <IncomeMiniCard />,
  },
  {
    id: 'spending-clarity',
    eyebrow: 'Spending',
    title: 'Spending Clarity',
    body: 'Fixed vs. variable costs separated automatically. See where money goes by category — not just a raw list of transactions.',
    visual: <SpendingMiniCard />,
  },
  {
    id: 'savings-forecast',
    eyebrow: 'Planning',
    title: 'Savings Forecast',
    body: 'Based on your real savings rate and current balance, Budgli projects where you will be in 1, 3, 5, 10, or 30 years.',
    visual: <ForecastMiniCard />,
  },
  {
    id: 'monthly-performance',
    eyebrow: 'Progress',
    title: 'Monthly Performance',
    body: 'A performance score based on your savings rate and spending ratio — one number that tells you whether your month was good or not.',
    visual: <ScoreMiniCard />,
  },
];

/* ─── Section ─── */
export default function ProductPillars() {
  return (
    <section id="product" className="bg-budgli-navy py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            What Budgli tracks
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to understand your money.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Four views. Each one answers a different question about your financial life.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <p className="text-sm text-white/60 leading-relaxed">{pillar.body}</p>
              {pillar.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
