'use client'

import { motion } from 'framer-motion'

// ─── mini Settings / Delete Account panel ─────────────────────────────────────

function SettingsPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-[11px] font-semibold text-gray-600">Settings · Account</span>
      </div>
      {/* Settings rows */}
      <div className="divide-y divide-gray-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-medium text-gray-700">Email address</p>
            <p className="text-[10px] text-gray-400 mt-0.5">noah@example.com</p>
          </div>
          <button className="text-[10px] font-medium text-budgli-teal hover:underline">Change</button>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-medium text-gray-700">Password</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Last changed 3 months ago</p>
          </div>
          <button className="text-[10px] font-medium text-budgli-teal hover:underline">Reset</button>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-medium text-red-500">Delete account</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Permanently removes your account and all data</p>
          </div>
          <button className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── mini CSV / import panel ──────────────────────────────────────────────────

function ImportPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-[11px] font-semibold text-gray-600">Import · Data Privacy</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        {/* Flow step */}
        {[
          { icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', label: 'CSV uploaded', sub: 'rbc_nov_2024.csv · 143 rows', status: 'done' },
          { icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z', label: 'Transactions imported', sub: '143 rows parsed and stored', status: 'done' },
          { icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0', label: 'Raw CSV file deleted', sub: 'Not stored after import', status: 'done' },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#00C896]/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-[#0D7377]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-700">{step.label}</p>
              <p className="text-[9px] text-gray-400">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── trust cards ──────────────────────────────────────────────────────────────

const CARDS = [
  {
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'No bank connection required during beta',
    description: 'Upload a CSV instead of connecting directly to your bank.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Raw CSV files are not stored',
    description: 'CSV files are processed for import and are not stored as raw files.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: 'Delete your account at any time',
    description: 'Delete your account and all associated data from Settings — no email required.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Secure email/password authentication',
    description: 'Email confirmation and password reset flows built in from the start.',
  },
]

// ─── section ──────────────────────────────────────────────────────────────────

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

        {/* Trust cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-10 h-10 rounded-xl bg-budgli-teal/8 border border-budgli-teal/12 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mini UI panels — what the real product looks like for these controls */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
              Account controls — in the real app
            </p>
            <SettingsPanel />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 px-1">
              What happens to your CSV file
            </p>
            <ImportPanel />
          </div>
        </motion.div>

      </div>
    </section>
  )
}
