'use client'

import { motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
   Real-size pillar cards — same density as the live Monthly Dashboard.
   No miniatures. Each card is a full income-statement / forecast view.
   ───────────────────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    id: 'income-statement',
    eyebrow: 'Core view',
    title: 'Personal Income Statement',
    body: 'Every month gets a full P&L — net income, fixed costs, variable spending, and savings — broken down exactly like a business tracks it.',
    img: '/Income-statement.png',
    alt: 'Budgli personal income statement',
  },
  {
    id: 'savings-forecast',
    eyebrow: 'Planning',
    title: 'Savings Forecast',
    body: 'Based on your real savings rate and current balance, Budgli projects where you will be in 1, 3, 5, 10, or 30 years.',
    img: '/savings-forecast.png',
    alt: 'Budgli savings forecast',
  },
]

export default function ProductPillars() {
  return (
    <section id="features" className="bg-budgli-navy py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            What Budgli tracks
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to understand your money.
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Two views that explain your money at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-2">
                {pillar.eyebrow}
              </p>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">{pillar.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-5">{pillar.body}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pillar.img}
                alt={pillar.alt}
                className="w-full rounded-xl block shadow-lg shadow-black/30 border border-white/8"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
