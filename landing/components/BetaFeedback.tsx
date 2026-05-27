'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const QUOTES = [
  {
    text: "It made my spending way easier to understand.",
    attr: "Beta user · May 2026",
  },
  {
    text: "I liked seeing the month summarized instead of reading through transactions.",
    attr: "Beta user · May 2026",
  },
  {
    text: "The income statement view made the app click for me.",
    attr: "Beta user · May 2026",
  },
]

export default function BetaFeedback() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Connect to email capture backend (e.g. Resend, ConvertKit, Supabase table)
    // For now, UI only — log intent and show confirmation state
    if (email.trim()) setSubmitted(true)
  }

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
            Beta feedback
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            Built with early user feedback
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Budgli is live in beta. Try the monthly reporting flow and help us make it better.
          </p>
        </motion.div>

        {/* Quote cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {QUOTES.map((q, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Star row */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#00C896">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="text-[11px] text-gray-400">{q.attr}</p>
            </motion.div>
          ))}
        </div>

        {/* Email capture */}
        <motion.div
          className="max-w-lg mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {submitted ? (
            <div className="text-center py-8 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#00C896" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">You&apos;re on the list.</p>
              <p className="text-xs text-gray-400">We&apos;ll be in touch as beta access opens up.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-base font-bold text-gray-900 mb-1">Help shape Budgli</p>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Try the monthly reporting flow and tell us what to improve.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-budgli-teal bg-gray-50 text-gray-900 placeholder-gray-400 transition-colors"
                />
                <button
                  type="submit"
                  className="shrink-0 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-budgli-navy hover:bg-budgli-teal transition-colors"
                >
                  Join the beta
                </button>
              </form>
              <p className="text-[11px] text-gray-400 mt-3">
                Free during beta. No bank connection required.
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  )
}
