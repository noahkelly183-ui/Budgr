'use client'

import { motion } from 'framer-motion'

const APP_URL = 'https://www.budgli.com'

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Export from your bank',
    body: 'Download a CSV from RBC, CIBC, or any bank. No app connection, no OAuth, no special permissions.',
    visual: (
      <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden text-[10px] bg-white shadow-sm">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="text-gray-500 font-medium">rbc_nov_2024.csv</span>
          <span className="ml-auto text-gray-400">143 rows</span>
        </div>
        {[
          ['Nov 28', 'PAYROLL DIRECT DEP', '+$2,182'],
          ['Nov 27', 'AMZN MKTP CA*RT9X4', '−$43.99'],
          ['Nov 26', 'WAL-MART SUPERCTR',  '−$127.34'],
        ].map(([d, desc, amt], i) => (
          <div key={i} className="grid px-3 py-1.5 border-b border-gray-50 items-center" style={{ gridTemplateColumns: '32px 1fr 56px' }}>
            <span className="text-gray-400 font-mono text-[9px]">{d}</span>
            <span className="text-gray-600 truncate pr-1">{desc}</span>
            <span className="text-right text-gray-500 font-medium tabular-nums">{amt}</span>
          </div>
        ))}
        <div className="px-3 py-1.5 bg-amber-50 flex items-center gap-1.5">
          <span className="text-[9px] text-amber-600 font-medium">Raw export — no categories yet</span>
        </div>
      </div>
    ),
  },
  {
    num: '02',
    icon: (
      <svg className="w-5 h-5 text-budgli-teal" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: 'Upload your transactions',
    body: 'Drop the file into Budgli. Transactions are tagged automatically on import — no manual entry, no setup wizard.',
    visual: (
      <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden text-[10px] bg-white shadow-sm">
        <div className="px-3 py-2 bg-budgli-navy flex items-center justify-between">
          <span className="text-white font-medium text-[10px]">November 2024</span>
          <span className="text-white/50 text-[9px]">143 transactions</span>
        </div>
        {[
          ['Nov 28', 'Payroll Direct Deposit', '+$2,182', '#0D7377', 'Income'],
          ['Nov 26', 'Wal-Mart Superctr',      '−$127',   '#16A34A', 'Groceries'],
          ['Nov 25', 'Netflix.com',             '−$15',    '#3B82F6', 'Subscriptions'],
          ['Nov 24', 'TF*Transfer',             '−$250',   '#0D7377', 'Savings'],
        ].map(([d, desc, amt, c, cat], i) => (
          <div key={i} className="grid px-3 py-1.5 border-b border-gray-50 items-center" style={{ gridTemplateColumns: '36px 1fr 44px 76px' }}>
            <span className="text-gray-400 text-[9px]">{d}</span>
            <span className="text-gray-600 truncate pr-1">{desc}</span>
            <span className="text-gray-500 text-right tabular-nums">{amt}</span>
            <div className="flex justify-end">
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: c + '18', color: c }}>{cat}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '03',
    icon: (
      <svg className="w-5 h-5 text-budgli-green" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Get your monthly report',
    body: 'Budgli builds your income statement in seconds. Net income, fixed costs, variable spending, and savings — all separated.',
    visual: (
      <div className="mt-4 rounded-lg border overflow-hidden text-[10px] bg-white shadow-sm" style={{ borderColor: '#00C89630' }}>
        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="font-semibold text-gray-700">May 2026</span>
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0FDF9', color: '#0D7377' }}>Monthly Report</span>
        </div>
        <div className="flex justify-between px-3 py-2" style={{ backgroundColor: '#F0FDF4' }}>
          <span className="text-gray-600">Net Income</span>
          <span className="font-bold text-gray-900 tabular-nums">$4,083</span>
        </div>
        <div className="border-t border-gray-200" />
        <div className="flex justify-between px-3 py-1.5">
          <span className="text-gray-500">Total Expenses</span>
          <span className="font-medium text-gray-700 tabular-nums">$2,840</span>
        </div>
        <div className="border-t border-gray-200" />
        <div className="flex justify-between px-3 py-2" style={{ backgroundColor: '#F0FDF9' }}>
          <span className="font-bold" style={{ color: '#0D7377' }}>Total Savings</span>
          <span className="font-bold tabular-nums" style={{ color: '#0D7377' }}>$1,053</span>
        </div>
        <div className="px-3 py-2" style={{ backgroundColor: '#F0FDF9' }}>
          <div className="flex justify-between mb-1">
            <span style={{ color: '#0D7377' }}>Savings Rate</span>
            <span className="font-bold" style={{ color: '#00C896' }}>25.8%</span>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '25.8%', backgroundColor: '#00C896' }} />
          </div>
        </div>
      </div>
    ),
  },
]

export default function Simplicity() {
  return (
    <section id="simplicity" className="py-20 px-6 bg-[#F7F8FA]">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-budgli-teal mb-4">
            Simple by design
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-navy mb-4">
            No complicated setup.<br className="hidden sm:block" /> Just clarity.
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            All you need is your email and a CSV from your bank. No account linking, no financial profile, no onboarding questions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-budgli-teal/8 border border-budgli-teal/15 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-budgli-teal/60 tracking-widest uppercase mb-0.5">{step.num}</p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{step.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              {step.visual}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href={APP_URL}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-budgli-green hover:bg-budgli-green-dark active:scale-[0.98] text-budgli-navy font-semibold text-sm transition-all duration-150 shadow-lg shadow-budgli-green/25"
          >
            Start with your transactions
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>

      </div>
    </section>
  )
}
