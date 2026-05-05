import { EXCLUDE_FROM_TOTALS, FIXED_CATS, CATEGORY_GROUPS, CATEGORY_COLOR, APP_YEAR, isSaving } from '../constants.js'
import { fmt, fmtDate, yearMonthOf, calcNetIncome, calcFixedTotal } from '../utils/finance.js'
import CategoryCombobox from './CategoryCombobox.jsx'

export default function MonthlyDashboard({ txns, selectedMonth, setCategory, salary, fixedCosts, savingsEntries }) {
  const monthTxns = txns.filter(t => yearMonthOf(t.date) === APP_YEAR + '-' + selectedMonth)
  const allDebits = monthTxns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const untagged  = monthTxns.filter(t => !t.category).length

  // Variable spending excludes savings-tagged transactions
  const variableDebits = allDebits.filter(t => !isSaving(t.category))
  const variableSpent  = variableDebits.reduce((s, t) => s + t.amount, 0)

  const fixedMonthlyTotal = calcFixedTotal(fixedCosts)
  const totalSpent        = fixedMonthlyTotal + variableSpent

  const { monthlyNet } = calcNetIncome(salary)

  // Savings = Net Income − Fixed Costs − Variable Spending (residual)
  const totalSavings = monthlyNet > 0 ? Math.max(0, monthlyNet - totalSpent) : 0
  const savingsRate  = monthlyNet > 0 ? (totalSavings / monthlyNet) * 100 : null

  // Savings breakdown: group savings entries by category, then show unallocated remainder
  const savingsByCat = savingsEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const savingsEntriesTotal = savingsEntries.reduce((s, e) => s + e.amount, 0)
  const savingsUnallocated  = Math.max(0, totalSavings - savingsEntriesTotal)

  const variableFixed  = variableDebits.filter(t => FIXED_CATS.has(t.category)).reduce((s, t) => s + t.amount, 0)
  const variableOther  = variableDebits.filter(t => !FIXED_CATS.has(t.category)).reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex gap-5">

      <div className="flex-1 min-w-0">

        {/* Income statement card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">

          {/* Net Income */}
          <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: '#F0FDF4' }}>
            <span className="text-sm text-gray-600">Net Income</span>
            <span className={`text-sm font-semibold tabular-nums ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {monthlyNet > 0 ? fmt(monthlyNet) : salary.gross === 0 ? 'Add salary →' : '—'}
            </span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Fixed Costs */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm text-gray-600">Fixed Costs</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
          </div>

          {/* Variable Spending */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-600">Variable Spending</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(variableSpent)}</span>
          </div>

          {/* Total Expenses */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total Expenses</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{fmt(totalSpent)}</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Savings breakdown by category */}
          {Object.entries(savingsByCat).map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50" style={{ backgroundColor: '#F0FDF9' }}>
              <span className="text-xs font-medium text-[#0D7377]">{cat}</span>
              <span className="text-xs font-semibold text-[#0D7377] tabular-nums">{fmt(amount)}</span>
            </div>
          ))}

          {/* Unallocated savings remainder */}
          {savingsUnallocated > 0 && (
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50" style={{ backgroundColor: '#F0FDF9' }}>
              <span className="text-xs font-medium text-[#0D7377]">Unallocated</span>
              <span className="text-xs font-semibold text-[#0D7377] tabular-nums">{fmt(savingsUnallocated)}</span>
            </div>
          )}

          {/* Total Savings */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-700">Total Savings</span>
            <span className={`text-sm font-bold tabular-nums ${totalSavings > 0 ? 'text-[#0D7377]' : 'text-gray-300'}`}>
              {totalSavings > 0 ? fmt(totalSavings) : '—'}
            </span>
          </div>

          {/* Savings Rate */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-500">Savings Rate</span>
            <span className={`text-sm font-semibold tabular-nums ${
              savingsRate === null ? 'text-gray-300'
              : savingsRate >= 20 ? 'text-[#0D7377]'
              : savingsRate >= 10 ? 'text-amber-500'
              : 'text-red-400'
            }`}>
              {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
            </span>
          </div>

        </div>

        {untagged > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {untagged} transaction{untagged > 1 ? 's' : ''} still need a category — click to classify
          </div>
        )}

        {/* Transaction table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide w-28">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Merchant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Category</th>
              </tr>
            </thead>
            <tbody>
              {monthTxns.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-xs">
                    No transactions this month
                  </td>
                </tr>
              ) : monthTxns.map((t, i) => (
                <tr key={t.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{fmtDate(t.date)}</td>
                  <td className="px-4 py-2.5 text-gray-700 text-sm">
                    <div className="flex items-center gap-1.5">
                      {t.fromMemory && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" title="Auto-categorized from memory" />
                      )}
                      {t.description}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <CategoryCombobox value={t.category} onChange={cat => setCategory(t.id, cat)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {fixedCosts.length > 0 && (
            <>
              <div className="border-t-2 border-gray-100 px-4 py-2.5 bg-gray-50/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fixed Costs</span>
                <span className="text-xs text-gray-400">{fixedCosts.length} item{fixedCosts.length !== 1 ? 's' : ''}</span>
              </div>
              {fixedCosts.map((cost, i) => {
                const hex = CATEGORY_COLOR[cost.category] || '#9CA3AF'
                return (
                  <div key={cost.id} className={`flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <span className="flex-1 text-sm text-gray-700">{cost.name}</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: hex + '1a', color: hex }}>
                      {cost.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 tabular-nums w-24 text-right shrink-0">
                      {fmt(cost.amount)}
                    </span>
                  </div>
                )
              })}
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Fixed total</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
              </div>
            </>
          )}

          {savingsEntries.length > 0 && (
            <>
              <div className="border-t-2 border-gray-100 px-4 py-2.5 bg-[#F0FDF9]/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide">Savings Allocations</span>
                <span className="text-xs text-[#0D7377]/60">{savingsEntries.length} item{savingsEntries.length !== 1 ? 's' : ''}</span>
              </div>
              {savingsEntries.map((entry, i) => {
                const hex = CATEGORY_COLOR[entry.category] || '#14A085'
                return (
                  <div key={entry.id} className={`flex items-center gap-4 px-4 py-2.5 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#F0FDF9]/30'}`}>
                    <span className="flex-1 text-sm text-gray-700">{entry.name}</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: hex + '1a', color: hex }}>
                      {entry.category}
                    </span>
                    <span className="text-sm font-semibold text-[#0D7377] tabular-nums w-24 text-right shrink-0">
                      {fmt(entry.amount)}
                    </span>
                  </div>
                )
              })}
              <div className="border-t border-gray-100 px-4 py-3 bg-[#F0FDF9]/60 flex justify-between items-center">
                <span className="text-xs font-medium text-[#0D7377]">Savings total</span>
                <span className="text-sm font-semibold text-[#0D7377] tabular-nums">{fmt(savingsEntriesTotal)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 shrink-0 space-y-4">

        {/* Spending breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Breakdown</p>

          <div className="space-y-3">
            {CATEGORY_GROUPS.filter(g => g.name !== 'Savings').map(group => {
              const txnTotal   = group.cats.reduce((s, cat) =>
                s + variableDebits.filter(t => t.category === cat).reduce((ss, t) => ss + t.amount, 0), 0
              )
              const fixedTotal = fixedCosts
                .filter(c => group.cats.includes(c.category))
                .reduce((s, c) => s + c.amount, 0)
              const groupTotal = txnTotal + fixedTotal
              if (groupTotal === 0) return null
              const pct = totalSpent > 0 ? (groupTotal / totalSpent) * 100 : 0
              return (
                <div key={group.name}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.hex }} />
                      <span className="text-gray-600">{group.name}</span>
                    </div>
                    <span className="font-medium text-gray-800 tabular-nums">{fmt(groupTotal)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: group.hex }} />
                  </div>
                </div>
              )
            })}

            {/* Savings group from entries */}
            {savingsEntriesTotal > 0 && (() => {
              const savingsGroup = CATEGORY_GROUPS.find(g => g.name === 'Savings')
              const pct = totalSpent > 0 ? (savingsEntriesTotal / totalSpent) * 100 : 0
              return (
                <div key="Savings">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: savingsGroup?.hex || '#14A085' }} />
                      <span className="text-gray-600">Savings</span>
                    </div>
                    <span className="font-medium text-gray-800 tabular-nums">{fmt(savingsEntriesTotal)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: savingsGroup?.hex || '#14A085' }} />
                  </div>
                </div>
              )
            })()}

            {variableDebits.length === 0 && fixedCosts.length === 0 && savingsEntries.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-2">No spending this month</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fixed costs</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Variable (fixed-type)</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(variableFixed)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Variable (other)</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(variableOther)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-gray-100">
              <span className="text-gray-700">Total expenses</span>
              <span className="text-gray-900 tabular-nums">{fmt(totalSpent)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-xs font-semibold text-[#0D7377]">
                <span>Savings</span>
                <span className="tabular-nums">{fmt(totalSavings)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bank Connection</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-sm text-gray-700">RBC Visa synced</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-3.5">Last synced today</p>
        </div>

      </div>
    </div>
  )
}
