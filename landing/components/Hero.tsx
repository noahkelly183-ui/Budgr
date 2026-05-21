'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://www.budgli.com'

function HeroDashboard() {
  return (
    <div className="w-full h-full bg-[#F7F8FA] p-3 overflow-hidden">
      {/* Top row: 4 stat cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 px-2.5 py-2 shadow-sm">
          <p style={{ fontSize: '8px' }} className="text-gray-400 leading-none mb-1">Net Income</p>
          <p className="text-sm font-bold text-gray-900 leading-none">$4,083</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-2.5 py-2 shadow-sm">
          <p style={{ fontSize: '8px' }} className="text-gray-400 leading-none mb-1">Total Expenses</p>
          <p className="text-sm font-bold text-gray-900 leading-none">$2,840</p>
        </div>
        <div className="bg-[#F0FDF9] rounded-lg border border-[#00C89630] px-2.5 py-2 shadow-sm">
          <p style={{ fontSize: '8px', color: '#0D7377' }} className="leading-none mb-1">Net Saved</p>
          <p className="text-sm font-bold leading-none" style={{ color: '#00C896' }}>$1,053</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-2.5 py-2 shadow-sm">
          <p style={{ fontSize: '8px' }} className="text-gray-400 leading-none mb-1">Savings Rate</p>
          <p className="text-sm font-bold leading-none" style={{ color: '#0D7377' }}>25.8%</p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {/* Income statement card */}
        <div className="col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm" style={{ fontSize: '9px' }}>
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-2.5 py-1.5 flex items-center justify-between">
            <span className="font-semibold text-gray-700">May 2026</span>
            <span className="text-gray-400">Income Statement</span>
          </div>

          {/* Net Income row */}
          <div className="bg-[#F0FDF4] px-2.5 py-1 flex items-center justify-between">
            <span className="text-gray-700">Net Income</span>
            <span className="font-bold text-gray-900">$4,083</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Fixed Costs */}
          <div className="px-2.5 py-1 flex items-center justify-between">
            <span className="text-gray-500">Fixed Costs</span>
            <span className="text-gray-700">$2,078</span>
          </div>

          {/* Variable Spending */}
          <div className="px-2.5 py-1 flex items-center justify-between">
            <span className="text-gray-500">Variable Spending</span>
            <span className="text-gray-700">$762</span>
          </div>

          {/* Total Expenses */}
          <div className="border-t-2 border-gray-200 px-2.5 py-1 flex items-center justify-between">
            <span className="font-bold text-gray-900">Total Expenses</span>
            <span className="font-bold text-gray-900">$2,840</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Savings rows */}
          <div className="bg-[#F0FDF9] px-2.5 py-1 flex items-center justify-between" style={{ color: '#0D7377' }}>
            <span>RRSP</span>
            <span>$500</span>
          </div>
          <div className="bg-[#F0FDF9] px-2.5 py-1 flex items-center justify-between" style={{ color: '#0D7377' }}>
            <span>Emergency Fund</span>
            <span>$253</span>
          </div>
          <div className="bg-[#F0FDF9] px-2.5 py-1 flex items-center justify-between" style={{ color: '#0D7377' }}>
            <span>TFSA</span>
            <span>$300</span>
          </div>

          {/* Total Savings */}
          <div className="bg-[#F0FDF9] px-2.5 py-1 flex items-center justify-between font-bold" style={{ color: '#0D7377' }}>
            <span>Total Savings</span>
            <span>$1,053</span>
          </div>

          {/* Savings Rate with progress bar */}
          <div className="bg-[#F0FDF9] px-2.5 py-1.5 flex items-center justify-between gap-2">
            <span style={{ color: '#0D7377' }}>Savings Rate</span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <div className="w-12 bg-gray-200 rounded-full h-1 overflow-hidden">
                <div className="h-1 rounded-full bg-[#00C896]" style={{ width: '25.8%' }} />
              </div>
              <span className="font-bold" style={{ color: '#0D7377' }}>25.8%</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 flex flex-col gap-2">
          {/* Card A: Where it went */}
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm">
            <p style={{ fontSize: '8px' }} className="font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Where it went</p>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Housing', pct: 51, color: '#0D7377' },
                { label: 'Groceries', pct: 18, color: '#22C55E' },
                { label: 'Transport', pct: 11, color: '#F59E0B' },
                { label: 'Dining', pct: 9, color: '#A855F7' },
                { label: 'Subscriptions', pct: 7, color: '#3B82F6' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span style={{ fontSize: '8px' }} className="text-gray-600 flex-1 truncate">{label}</span>
                  <div className="w-12 bg-gray-100 rounded-full h-0.5 overflow-hidden">
                    <div className="h-0.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span style={{ fontSize: '8px' }} className="text-gray-400">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Savings Forecast */}
          <div className="bg-white rounded-lg border border-gray-200 p-2.5 shadow-sm flex-1">
            <p style={{ fontSize: '8px' }} className="font-semibold text-gray-400 uppercase tracking-wide mb-1">Savings Forecast</p>
            <p className="text-lg font-bold leading-none mb-0.5" style={{ color: '#00C896' }}>$210k</p>
            <p style={{ fontSize: '8px' }} className="text-gray-400 mb-1.5">projected at 10 years</p>
            <svg viewBox="0 0 80 30" className="w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hero-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d="M 0 28 C 20 26 40 20 60 10 L 80 2 L 80 30 L 0 30 Z" fill="url(#hero-grad)" />
              <path d="M 0 28 C 20 26 40 20 60 10 L 80 2" stroke="#00C896" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="80" cy="2" r="2" fill="#00C896" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="bg-budgli-navy overflow-hidden">

      {/* Top: copy */}
      <div className="px-6 pt-20 pb-14">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Combined badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full px-4 py-2 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-budgli-green shrink-0" />
            <span className="text-xs font-medium text-white/70 tracking-wide">Free during beta</span>
            <span className="text-white/20">·</span>
            <svg className="w-3.5 h-3.5 text-budgli-green shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-xs font-medium text-white/70 tracking-wide">No bank connection required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] tracking-tight mb-5">
            A personal income statement for your life.
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
            Upload your bank CSV. Get a clean monthly income statement — income, expenses, savings, and where you&apos;re headed.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href={APP_URL}
              className="w-full sm:w-auto bg-budgli-green hover:bg-budgli-green-dark active:scale-[0.98] text-budgli-navy font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-budgli-green/25 text-sm transition-all duration-150"
            >
              Try Budgli
            </a>
            <a
              href={APP_URL}
              className="w-full sm:w-auto border border-white/20 hover:border-white/35 hover:bg-white/6 text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all duration-150"
            >
              View demo
            </a>
          </div>

        </motion.div>
      </div>

      {/* Bottom: dashboard visual */}
      <motion.div
        className="px-4 sm:px-8 pb-0"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Browser chrome + glow wrapper */}
          <div className="relative">
            {/* Green glow behind the frame */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-budgli-green/10 blur-3xl rounded-full pointer-events-none" />

            {/* Browser chrome frame */}
            <div className="relative rounded-t-2xl overflow-hidden border border-white/10 border-b-0 shadow-[0_-4px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]">
              {/* Chrome bar */}
              <div className="bg-[#131C2F] border-b border-white/8 px-4 py-[11px] flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white/8 rounded-md h-5 max-w-[180px] mx-auto border border-white/8 flex items-center justify-center gap-1.5">
                    <svg className="w-2.5 h-2.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="text-[10px] text-white/35 tracking-tight">app.budgli.com</span>
                  </div>
                </div>
              </div>

              {/* Dashboard area */}
              <div className="relative h-[420px] sm:h-[460px] lg:h-[500px]">
                <div className="w-full h-full pointer-events-none">
                  <HeroDashboard />
                </div>

                {/* Bottom fade into navy */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-budgli-navy to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  )
}
