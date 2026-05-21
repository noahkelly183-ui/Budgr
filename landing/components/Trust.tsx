'use client'

import { motion } from 'framer-motion'

const BULLETS = [
  {
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    text: 'No bank connection required',
  },
  {
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    text: 'You control what you upload',
  },
  {
    icon: (
      <svg className="w-4 h-4 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
    text: 'Free during beta',
  },
]

export default function Trust() {
  return (
    <section className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            Privacy
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            Your data stays yours.
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            No bank connection. No raw file storage. Delete everything in one click.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row divide-y divide-gray-100 sm:divide-y-0 sm:divide-x sm:divide-gray-100">
            {BULLETS.map((bullet, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-5 flex-1">
                <div className="w-8 h-8 rounded-lg bg-budgli-teal/8 border border-budgli-teal/12 flex items-center justify-center shrink-0">
                  {bullet.icon}
                </div>
                <span className="text-sm font-semibold text-gray-900 leading-snug">{bullet.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
