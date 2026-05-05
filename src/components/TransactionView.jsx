import { useState } from 'react'
import { CATEGORIES, MONTHS, EXCLUDE_FROM_TOTALS } from '../constants.js'
import { fmt, fmtDate, yearMonthOf } from '../utils/finance.js'
import CategoryCombobox from './CategoryCombobox.jsx'

export default function TransactionView({ txns, setCategory }) {
  const [filter, setFilter] = useState('all')

  const untaggedCount = txns.filter(t => !t.category).length
  const filtered      = filter === 'untagged' ? txns.filter(t => !t.category) : txns

  const groupMap = new Map()
  for (const t of filtered) {
    const ym = yearMonthOf(t.date) || 'unknown'
    if (!groupMap.has(ym)) groupMap.set(ym, [])
    groupMap.get(ym).push(t)
  }
  const groups = [...groupMap.entries()].map(([ym, txns]) => ({ ym, txns }))

  const debits       = txns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const refunds      = txns.filter(t => t.category === 'Refund / Return')
  const total        = debits.reduce((sum, t) => sum + t.amount, 0)
  const totalRefunds = refunds.reduce((sum, t) => sum + t.amount, 0)

  function groupLabel(ym) {
    if (ym === 'unknown') return 'Unknown Date'
    const [year, month] = ym.split('-')
    return `${MONTHS.find(m => m.id === month)?.label || ym} ${year}`
  }

  const COLS = '96px 1fr 120px 180px'

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#0D7377] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter('untagged')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'untagged'
                ? 'bg-[#0D7377] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            Untagged Only
            {untaggedCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                filter === 'untagged' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {untaggedCount}
              </span>
            )}
          </button>
        </div>

        <div>
          <div
            className="bg-white border border-gray-100 rounded-t-xl grid px-4 py-3"
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right pr-2">Amount</span>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Category</span>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white border border-gray-100 border-t-0 rounded-b-xl px-4 py-8 text-center text-gray-400 text-xs">
              {filter === 'untagged'
                ? 'All transactions are tagged!'
                : 'No transactions yet — import a CSV to get started'}
            </div>
          ) : groups.map((group, gi) => {
            const groupDebits = group.txns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
            const groupSpend  = groupDebits.reduce((s, t) => s + t.amount, 0)
            const isLast      = gi === groups.length - 1
            return (
              <div key={group.ym}>
                <div className="flex items-center justify-between px-4 py-2.5 border-x border-gray-100 bg-[#1A1A2E]">
                  <span className="text-white text-xs font-semibold tracking-wide">{groupLabel(group.ym)}</span>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <span>{group.txns.length} transaction{group.txns.length !== 1 ? 's' : ''}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-white/80">{fmt(groupSpend)}</span>
                  </div>
                </div>

                <div className={`border-x border-gray-100 ${isLast ? 'border-b rounded-b-xl' : ''}`}>
                  {group.txns.map((t, i) => (
                    <div
                      key={t.id}
                      className={`grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                      style={{ gridTemplateColumns: COLS }}
                    >
                      <span className="text-gray-500 text-xs whitespace-nowrap">{fmtDate(t.date)}</span>
                      <span className="text-gray-700 text-sm pr-3 min-w-0 truncate">{t.description}</span>
                      <span className="flex items-center justify-end gap-1 tabular-nums pr-2">
                        <span className={`text-xs font-bold ${t.type === 'credit' ? 'text-green-500' : 'text-red-400'}`}>
                          {t.type === 'credit' ? '↑' : '↓'}
                        </span>
                        <span className={t.type === 'credit' ? 'text-green-600 text-sm' : 'text-gray-800 text-sm'}>
                          {fmt(t.amount)}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {t.fromMemory && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" title="Auto-categorized from memory" />
                        )}
                        <CategoryCombobox value={t.category} onChange={cat => setCategory(t.id, cat)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <div className="w-56 shrink-0">
        <div className="bg-[#0D7377] rounded-t-xl px-4 py-3">
          <p className="text-white text-sm font-medium">Summary</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-b-xl px-4 py-3 space-y-2">
          {CATEGORIES
            .filter(cat => !EXCLUDE_FROM_TOTALS.has(cat) && cat !== 'Refund / Return')
            .map(cat => {
              const catTotal = txns
                .filter(t => t.type === 'debit' && t.category === cat)
                .reduce((sum, t) => sum + t.amount, 0)
              return (
                <div key={cat} className="flex justify-between items-center text-xs">
                  <span className={`truncate mr-2 ${catTotal > 0 ? 'text-gray-600' : 'text-gray-300'}`}>{cat}</span>
                  <span className={`font-medium tabular-nums shrink-0 ${catTotal > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                    {fmt(catTotal)}
                  </span>
                </div>
              )
            })}
          <div className="border-t border-gray-100 pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className={totalRefunds > 0 ? 'text-green-600' : 'text-gray-300'}>↑ Refund / Return</span>
              <span className={`font-medium tabular-nums ${totalRefunds > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                {fmt(totalRefunds)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-700">Total</span>
              <span className="text-gray-900">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
