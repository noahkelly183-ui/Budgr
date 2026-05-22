'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Upload transactions',
    description: 'Add your bank CSV to start your monthly report. Most common formats parse automatically. A manual mapper handles the rest.',
    img: '/my-data.png',
    alt: 'Budgli transaction list',
  },
  {
    num: '02',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: 'Review categories',
    description: 'Clean up fixed costs, variable costs, and income. Transactions are categorized on import — most months need only a handful of corrections.',
    img: '/Income-statement.png',
    alt: 'Budgli income statement with categories',
  },
  {
    num: '03',
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: 'Read your report',
    description: 'See what you earned, spent, saved, and how the month performed. Income statement, savings rate, and a performance score — all built automatically.',
    img: '/monthly-dashboard.png',
    alt: 'Budgli monthly dashboard report',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-teal mb-4">
            Upload. Review. Read.
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Three steps. No spreadsheet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step badge + title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-budgli-teal/60 tracking-widest uppercase mb-0.5">
                    Step {step.num}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{step.title}</h3>
                </div>
              </div>

              {/* Step screenshot */}
              <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.img}
                  alt={step.alt}
                  className="w-full block object-cover object-top"
                  style={{ maxHeight: 220 }}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
