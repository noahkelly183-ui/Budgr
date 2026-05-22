'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://www.budgli.com'


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

              <div className="relative overflow-hidden" style={{ maxHeight: 460 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/monthly-dashboard.png"
                  alt="Budgli monthly dashboard"
                  className="w-full block object-cover object-top"
                  style={{ maxHeight: 460 }}
                />
                {/* Bottom fade into navy */}
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-budgli-navy to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

    </section>
  )
}
