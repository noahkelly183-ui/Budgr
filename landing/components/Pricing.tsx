'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

const FEATURES = [
  'CSV transaction import',
  'Monthly dashboard',
  'Personal income statement view',
  'Savings tracking',
  'Year-over-year review',
  'Manual CSV mapper',
  'Privacy controls',
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-teal mb-4">
            Free during beta.
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Try Budgli while we refine the product with early users.
          </p>
        </motion.div>

        <motion.div
          className="max-w-sm mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border-2 border-budgli-green bg-white p-8 shadow-[0_8px_40px_-8px_rgba(0,200,150,0.18)]">

            {/* Plan name */}
            <p className="text-[11px] font-semibold text-budgli-teal uppercase tracking-widest mb-5" style={{ color: '#0D7377' }}>
              Beta Access
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-5xl font-extrabold text-budgli-navy leading-none">$0</span>
              <span className="text-base font-medium text-gray-400">/ month</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-budgli-green shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3.5 rounded-xl bg-budgli-green hover:bg-budgli-green-dark active:scale-[0.98] text-budgli-navy font-semibold text-sm transition-all duration-150 shadow-lg shadow-budgli-green/20"
            >
              Get started
            </a>

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              Paid plans may be introduced later as Budgli improves.
            </p>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
