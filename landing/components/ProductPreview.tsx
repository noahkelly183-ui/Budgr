'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const APP_URL = 'https://app.budgli.com'

// ─── callout data ─────────────────────────────────────────────────────────────

const CALLOUTS = [
  {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    label: 'Total Spent',
    description: 'See fixed and variable spending in one number.',
  },
  {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    label: 'Amount Saved',
    description: 'See how much money you kept this month.',
  },
  {
    iconBg: 'bg-teal-50',
    iconColor: 'text-budgli-teal',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    label: 'Performance Score',
    description: 'Get a simple read on how your month is going.',
  },
  {
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    label: 'Where Your Income Went',
    description: 'Understand how income was split across costs, spending, and savings.',
  },
]

// ─── crop panels ──────────────────────────────────────────────────────────────
// At 510px wide, 180px tall: object-cover shifts ±245px of original image vertically.
// 5% = top portion (header + stat cards)  /  95% = bottom portion (score + income stmt)

const CROPS = [
  {
    label: 'Stats & Performance Score',
    description: 'Monthly totals and your score at a glance — income, spending, savings, and how the month tracked.',
    objectPosition: 'center 5%',
    accent: 'bg-red-400',
  },
  {
    label: 'Monthly Income Statement',
    description: 'Every month laid out like a business P&L — what came in, what went out, and what you kept.',
    objectPosition: 'center 95%',
    accent: 'bg-budgli-teal',
  },
]

// ─── component ────────────────────────────────────────────────────────────────

export default function ProductPreview() {
  return (
    <section className="py-20 px-6 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            What you see
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            See your month like a personal income statement.
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Budgli organizes your financial life around the same questions a business owner asks:
            what came in, what went out, what changed, and what was left.
          </p>
        </motion.div>

        {/* Full dashboard screenshot */}
        <motion.div
          className="rounded-2xl overflow-hidden border border-gray-200/60 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.14)] mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/dashboard.png"
            alt="Budgli dashboard — monthly income statement, spending breakdown, performance score, and financial summary"
            width={1434}
            height={751}
            className="w-full h-auto block"
            priority={false}
          />
        </motion.div>

        {/* Callout cards — 4 metrics, icons replace dots */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {CALLOUTS.map((c, i) => (
            <motion.div
              key={c.label}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`w-8 h-8 rounded-lg ${c.iconBg} ${c.iconColor} flex items-center justify-center mb-3`}>
                {c.icon}
              </div>
              <p className="text-xs font-semibold text-gray-900 mb-1 leading-snug">{c.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Cropped detail panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {CROPS.map((panel, i) => (
            <motion.div
              key={panel.label}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Cropped screenshot — 180px keeps vertical crop active */}
              <div className="relative overflow-hidden" style={{ height: 180 }}>
                <Image
                  src="/dashboard.png"
                  alt={panel.label}
                  fill
                  className="object-cover"
                  style={{ objectPosition: panel.objectPosition }}
                />
                {/* Fade to white at bottom so it blends into the label below */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/40 to-transparent" />
              </div>

              {/* Label */}
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${panel.accent}`} />
                  <p className="text-sm font-semibold text-gray-900">{panel.label}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{panel.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Try demo CTA strip */}
        <motion.div
          className="rounded-2xl bg-budgli-navy px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-white font-semibold text-base mb-1">See it with your own data.</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Upload a bank CSV and get your personal income statement in minutes.
            </p>
          </div>
          <a
            href={APP_URL}
            className="shrink-0 px-6 py-2.5 rounded-xl bg-budgli-teal hover:bg-budgli-teal-dark text-white font-semibold text-sm transition-colors shadow-lg shadow-budgli-teal/20 whitespace-nowrap"
          >
            Get started
          </a>
        </motion.div>

      </div>
    </section>
  )
}
