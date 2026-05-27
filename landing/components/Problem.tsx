'use client'

import { motion } from 'framer-motion'

export default function Problem() {
  return (
    <section id="problem" className="bg-budgli-navy py-14 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            The problem
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
            Your bank shows activity.<br className="hidden sm:block" /> Budgli turns it into a report.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Banking apps show transactions line by line. Budgli organizes that activity into a clean monthly income statement — so you can understand your cash flow, spending, and savings without rebuilding a spreadsheet.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
