'use client'

import { motion } from 'framer-motion'

export default function Problem() {
  return (
    <section id="problem" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Heading block */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#0D7377] mb-4">
            The problem
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-budgli-teal mb-4">
            Your bank shows activity. Budgli turns it into a report.
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Banking apps show transactions line by line. Budgli organizes that activity into a simple monthly income statement — so you can understand your cash flow, spending, and savings without rebuilding a spreadsheet.
          </p>
        </motion.div>

        {/* Transformation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg shadow-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">

              {/* LEFT PANEL — Raw bank data */}
              <div className="bg-white">
                {/* Panel header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Bank export</p>
                  <p className="text-[10px] text-gray-400">rbc_nov_2024.csv</p>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Date</span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Description</span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</span>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2.5 border-b border-gray-50 text-[11px]">
                  <span className="text-gray-500">Nov 28</span>
                  <span className="text-gray-700 truncate pr-2">PAYROLL DIRECT DEP</span>
                  <span className="tabular-nums text-gray-700 text-right">+$2,182.03</span>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2.5 border-b border-gray-50 text-[11px]">
                  <span className="text-gray-500">Nov 27</span>
                  <span className="text-gray-500 truncate pr-2">AMZN MKTP CA*RT9X4</span>
                  <span className="tabular-nums text-gray-500 text-right">&#x2212;$43.99</span>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2.5 border-b border-gray-50 text-[11px]">
                  <span className="text-gray-500">Nov 26</span>
                  <span className="text-gray-500 truncate pr-2">WAL-MART SUPERCTR</span>
                  <span className="tabular-nums text-gray-500 text-right">&#x2212;$127.34</span>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2.5 border-b border-gray-50 text-[11px]">
                  <span className="text-gray-500">Nov 25</span>
                  <span className="text-gray-500 truncate pr-2">NETFLIX.COM</span>
                  <span className="tabular-nums text-gray-500 text-right">&#x2212;$15.49</span>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-[56px_1fr_64px] px-5 py-2.5 border-b border-gray-50 text-[11px]">
                  <span className="text-gray-500">Nov 24</span>
                  <span className="text-gray-500 truncate pr-2">TF*TRANSFER</span>
                  <span className="tabular-nums text-gray-500 text-right">&#x2212;$250.00</span>
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 bg-amber-50/70 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-[10px] font-medium text-amber-600">No categories &middot; Raw transaction data</span>
                </div>
              </div>

              {/* RIGHT PANEL — Budgli monthly report */}
              <div className="bg-white">
                {/* Panel header */}
                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Budgli report</p>
                  <p className="text-[10px] text-gray-400">May 2026</p>
                </div>

                {/* Net Income */}
                <div className="px-5 py-3 bg-[#F0FDF4] flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#00C896' }} />
                    <span className="text-gray-600">Net Income</span>
                  </div>
                  <span className="tabular-nums font-bold text-gray-900">$4,083</span>
                </div>

                {/* Fixed Costs */}
                <div className="px-5 py-2.5 border-t border-gray-200 border-b border-gray-50 flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#3B82F6' }} />
                    <span className="text-gray-500">Fixed Costs</span>
                  </div>
                  <span className="tabular-nums font-medium text-gray-700">$2,078</span>
                </div>

                {/* Variable Spending */}
                <div className="px-5 py-2.5 flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F59E0B' }} />
                    <span className="text-gray-500">Variable Spending</span>
                  </div>
                  <span className="tabular-nums font-medium text-gray-700">$762</span>
                </div>

                {/* Total Expenses */}
                <div className="px-5 py-3 border-t-2 border-gray-200 flex justify-between items-center text-[11px]">
                  <span className="font-bold text-gray-900">Total Expenses</span>
                  <span className="tabular-nums font-bold text-gray-900">$2,840</span>
                </div>

                {/* Savings rows */}
                <div className="border-t border-gray-200">
                  <div className="px-5 py-2 bg-[#F0FDF9] flex justify-between items-center text-[11px]">
                    <span style={{ color: '#0D7377' }}>RRSP Contribution</span>
                    <span className="tabular-nums" style={{ color: '#0D7377' }}>$500</span>
                  </div>
                  <div className="px-5 py-2 bg-[#F0FDF9] flex justify-between items-center text-[11px]">
                    <span style={{ color: '#0D7377' }}>Emergency Fund</span>
                    <span className="tabular-nums" style={{ color: '#0D7377' }}>$253</span>
                  </div>
                  <div className="px-5 py-2 bg-[#F0FDF9] flex justify-between items-center text-[11px]">
                    <span style={{ color: '#0D7377' }}>TFSA Index Fund</span>
                    <span className="tabular-nums" style={{ color: '#0D7377' }}>$300</span>
                  </div>
                </div>

                {/* Total Savings */}
                <div className="px-5 py-3 bg-[#F0FDF9] flex justify-between items-center text-[11px]">
                  <span className="font-bold" style={{ color: '#0D7377' }}>Total Savings</span>
                  <span className="tabular-nums font-bold" style={{ color: '#0D7377' }}>$1,053</span>
                </div>

                {/* Savings Rate */}
                <div className="px-5 py-3 bg-[#F0FDF9] text-[11px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: '#0D7377' }}>Savings Rate</span>
                    <span className="tabular-nums font-bold" style={{ color: '#00C896' }}>25.8%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '25.8%', backgroundColor: '#00C896' }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
