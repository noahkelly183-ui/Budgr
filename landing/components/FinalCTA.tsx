'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

export default function FinalCTA() {
  return (
    <section id="get-started" className="py-24 px-6 bg-budgli-navy">
      <div className="max-w-3xl mx-auto text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Green accent dot */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-budgli-green shrink-0" />
              <span className="text-xs text-white/60 font-medium">Free during beta</span>
              <span className="text-white/20 mx-1">·</span>
              <span className="text-xs text-white/60 font-medium">No bank connection required</span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            Turn your transactions<br className="hidden sm:block" /> into clarity.
          </h2>

          <p className="text-white/55 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            See your personal income statement, monthly performance, and savings direction — all in one clean place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-budgli-green hover:bg-budgli-green-dark active:scale-[0.98] text-budgli-navy font-bold text-sm transition-all duration-150 shadow-xl shadow-budgli-green/20"
            >
              Try Budgli — it&apos;s free
            </a>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 hover:border-white/35 hover:bg-white/6 active:scale-[0.98] text-white/75 hover:text-white font-medium text-sm transition-all duration-150"
            >
              View demo
            </a>
          </div>

          <p className="text-white/25 text-xs">
            Start with demo mode or upload your own transactions. Paid plans may be introduced later.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
