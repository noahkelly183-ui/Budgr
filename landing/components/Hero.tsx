'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

/* ─────────────────────────────────────────────────────────────────────────────
   Real-size dashboard preview — mirrors `src/components/MonthlyDashboard.jsx`
   StatCards + ScoreCard at the SAME density as the live app.
   No props — visitor sees a representative May 2026 snapshot.
   ───────────────────────────────────────────────────────────────────────────── */

function PreviewStatCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </span>
          <span className="text-sm text-gray-700 font-medium">Total Spent</span>
        </div>
        <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-tight tracking-tight">$2,840.00</p>
        <p className="text-xs text-gray-400 mt-1.5">Money spent this month</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#F0FDF9', border: '1px solid rgba(0,200,150,0.20)' }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#00C896' }} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </span>
          <span className="text-sm text-gray-700 font-medium">Amount Saved</span>
        </div>
        <p className="text-3xl font-extrabold tabular-nums leading-tight tracking-tight" style={{ color: '#00C896' }}>$1,880.83</p>
        <p className="text-xs text-gray-400 mt-1.5">Money saved this month</p>
      </div>
    </div>
  )
}

function PreviewScoreCard() {
  const factors = [
    { name: 'Savings Rate',         value: 48, max: 50 },
    { name: 'Spending Consistency', value: 34, max: 40 },
    { name: 'Clarity',              value: 10, max: 10 },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 shadow-sm">
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-baseline gap-0.5">
          <span className="text-5xl font-black leading-none tabular-nums tracking-tight" style={{ color: '#00C896' }}>92</span>
          <span className="text-base text-gray-400 font-medium">/100</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>Monthly Score</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
          </div>
          <div className="text-base font-bold text-gray-900">Outstanding</div>
          <div className="text-xs text-gray-500 mt-0.5">Based on savings rate, spending consistency, and report clarity.</div>
        </div>
      </div>
      <div className="space-y-2">
        {factors.map(f => (
          <div key={f.name} className="grid grid-cols-[140px_1fr_56px] items-center gap-3">
            <div className="text-xs text-gray-700">{f.name}</div>
            <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(f.value / f.max) * 100}%`, backgroundColor: '#00C896' }} />
            </div>
            <div className="text-xs text-gray-400 text-right tabular-nums">
              <b className="text-gray-800 font-semibold">{f.value}</b>/{f.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroDashboard() {
  return (
    <div className="w-full h-full bg-[#F7F8FA] p-6 sm:p-8 overflow-hidden">
      <div className="max-w-[880px] mx-auto flex flex-col gap-4">
        <PreviewStatCards />
        <PreviewScoreCard />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Hero section
   ───────────────────────────────────────────────────────────────────────────── */

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
            Upload transactions. See income, spending, savings, and performance in one clean report.
          </p>

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

      {/* Bottom: dashboard visual — real app-card sizes */}
      <motion.div
        className="px-4 sm:px-8 pb-0"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Green glow behind the frame */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-budgli-green/10 blur-3xl rounded-full pointer-events-none" />

            {/* Browser chrome frame */}
            <div className="relative rounded-t-2xl overflow-hidden border border-white/10 border-b-0 shadow-[0_-4px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]">
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

              <div className="relative">
                <HeroDashboard />
                {/* Bottom fade into navy */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-budgli-navy to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  )
}
