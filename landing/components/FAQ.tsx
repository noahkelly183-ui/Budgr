'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Do I need to connect my bank?',
    a: 'No. During beta, Budgli works with CSV uploads from your bank.',
  },
  {
    q: 'Which banks does Budgli support?',
    a: 'Budgli supports RBC and CIBC CSVs automatically, plus a manual mapper for other CSV formats.',
  },
  {
    q: 'Does Budgli store my raw CSV files?',
    a: 'No. CSV files are processed for import and are not stored as raw files.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. You can delete your account and associated Budgli data from Settings.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto">

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            Common questions.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Answers to questions worth having before you sign up.
          </p>
        </motion.div>

        <div className="divide-y divide-gray-100">
          {FAQS.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-budgli-teal transition-colors leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 transition-all duration-200"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-gray-500 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
