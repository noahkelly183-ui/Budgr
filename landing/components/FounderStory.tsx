'use client'

import { motion } from 'framer-motion'

function BeforeAfterMini() {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
      <div className="grid grid-cols-2 divide-x divide-white/10">

        {/* Left: raw bank export */}
        <div className="bg-white/5 p-4">
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-3">Bank export</p>
          {[
            { desc: 'PAYROLL DIRECT DEP',  amt: '+$4,720', pos: true  },
            { desc: 'WAL-MART SUPERCTR',   amt: '−$127',   pos: false },
            { desc: 'NETFLIX.COM',         amt: '−$15',    pos: false },
            { desc: 'TF*TRANSFER',         amt: '−$250',   pos: false },
          ].map((r, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
              <span className="text-[10px] text-white/40 truncate pr-2">{r.desc}</span>
              <span className={`text-[10px] tabular-nums shrink-0 ${r.pos ? 'text-[#00C896]' : 'text-white/35'}`}>{r.amt}</span>
            </div>
          ))}
          <div className="mt-2.5 pt-2 border-t border-white/10">
            <span className="text-[9px] text-amber-400/60">No categories · raw export</span>
          </div>
        </div>

        {/* Right: Budgli report */}
        <div className="bg-white/5 p-4">
          <p className="text-[9px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'rgba(0,200,150,0.65)' }}>
            Budgli report
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-2 py-1.5 rounded" style={{ background: 'rgba(0,200,150,0.1)' }}>
              <span className="text-[10px] text-white/60">Net Income</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#00C896' }}>$4,720</span>
            </div>
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-[10px] text-white/40">Expenses</span>
              <span className="text-[10px] text-white/45 tabular-nums">$2,840</span>
            </div>
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-[10px] text-white/60">Savings</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#00C896' }}>$1,880</span>
            </div>
            <div className="pt-2 border-t border-white/10 px-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-white/40">Savings rate</span>
                <span className="text-[10px] font-bold" style={{ color: '#00C896' }}>39.8%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '39.8%', backgroundColor: '#00C896' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function FounderStory() {
  return (
    <section className="py-16 px-6 bg-[#0D7377]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,200,150,0.65)' }}>
              Why we built Budgli
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug tracking-tight mb-5">
              Built from a spreadsheet that worked
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-4">
              Banks show transactions, but they rarely turn them into a clear financial report.
              Budgli started as a spreadsheet for tracking income, expenses, savings, and monthly
              performance. It worked — but it was clunky and manual.
            </p>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              Budgli turns that system into a simple personal income statement, bringing your cards,
              categories, spending, and savings into one clear monthly view.
            </p>

            <div className="flex items-center gap-3 pt-5 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/8 border border-white/12 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Noah Kelly</p>
                <p className="text-xs text-white/40">Founder, Budgli</p>
              </div>
            </div>
          </motion.div>

          {/* Before / after mini visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <BeforeAfterMini />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
