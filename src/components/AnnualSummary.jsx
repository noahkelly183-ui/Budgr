import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { EXCLUDE_FROM_TOTALS, MONTHS, APP_YEAR, isSaving } from '../constants.js'
import { fmt, fmtK, yearMonthOf, calcNetIncome } from '../utils/finance.js'

export default function AnnualSummary({ transactions, salary, fixedCosts, savingsEntries }) {
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const gross            = salary.gross
  const taxAmount        = gross * (salary.taxRate / 100)
  const deductionsAnnual = salary.deductions * 12
  const { annualNet, monthlyNet } = calcNetIncome(salary)

  const fixedMonthlyTotal    = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + c.amount, 0)
  const fixedAnnualProjected = fixedMonthlyTotal * 12

  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const variableDebitsAnn = allDebitsAnn.filter(t => !isSaving(t.category))
  const txnSpent          = variableDebitsAnn.reduce((s, t) => s + t.amount, 0)
  const monthsWithData    = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  const today          = new Date()
  const todayYear      = today.getFullYear().toString()
  const todayMonthIdx  = today.getMonth() + 1
  const dayOfMonth     = today.getDate()
  const daysInMonth    = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed  = todayYear === APP_YEAR
    ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth
    : monthsWithData
  const fixedYTD      = fixedMonthlyTotal * monthsElapsed
  const totalExpYTD   = txnSpent + fixedYTD
  const incomeToDate  = monthlyNet * monthsElapsed

  const savingsYTD     = Math.max(0, incomeToDate - totalExpYTD)
  const savingsRateYTD = incomeToDate > 0 && savingsYTD > 0
    ? (savingsYTD / incomeToDate) * 100
    : null

  const avgMonthlyVariable = monthsWithData > 0 ? txnSpent / monthsWithData : null
  const projectedVariable  = avgMonthlyVariable !== null ? avgMonthlyVariable * 12 : null
  const totalExpensesProj  = projectedVariable !== null ? fixedAnnualProjected + projectedVariable : null

  const avgMonthlySavings = monthsWithData > 0 ? savingsYTD / monthsWithData : null
  const projectedSavings  = avgMonthlySavings !== null ? avgMonthlySavings * 12 : null
  const savingsRate       = annualNet > 0 && projectedSavings !== null
    ? (projectedSavings / annualNet) * 100
    : null

  const chartData = MONTHS.map(m => {
    const txnTotal = variableDebitsAnn
      .filter(t => yearMonthOf(t.date) === APP_YEAR + '-' + m.id)
      .reduce((s, t) => s + t.amount, 0)
    const total = txnTotal > 0 ? txnTotal + fixedMonthlyTotal : 0
    return { name: m.label.slice(0, 3), spend: total }
  })

  return (
    <div className="space-y-4">

      {/* Annual Net Income card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Annual Net Income</h2>
            <p className="text-xs text-gray-400 mt-0.5">{APP_YEAR}</p>
          </div>
          <p className={`text-3xl font-bold tabular-nums ${annualNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-600">Gross Annual Salary</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{gross > 0 ? fmt(gross) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-500">Income Tax ({salary.taxRate}%)</span>
            <span className="text-sm font-medium text-red-400 tabular-nums">{gross > 0 ? '− ' + fmt(taxAmount) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-400 italic">Monthly Deductions × 12</span>
            <span className="text-sm italic text-gray-400 tabular-nums">{salary.deductions > 0 ? '− ' + fmt(deductionsAnnual) : '—'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200 mt-1">
          <span className="text-sm font-semibold text-gray-700">Annual Net Income</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{annualNet > 0 ? fmt(annualNet) : '—'}</span>
        </div>
      </div>

      {/* Variable, Fixed & Savings Breakdown — collapsible */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => setBreakdownOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">Variable, Fixed &amp; Savings Breakdown</p>
            <p className="text-xs text-gray-400 mt-0.5">{APP_YEAR} — projected full year</p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${breakdownOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {breakdownOpen && (
          <div className="px-6 pb-6 border-t border-gray-50">
            <div className="pt-2" />
            <div className="divide-y divide-gray-50">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-600">Fixed Costs × 12</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">{fixedAnnualProjected > 0 ? fmt(fixedAnnualProjected) : '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-600">Variable Spending YTD</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">{monthsWithData > 0 ? fmt(txnSpent) : '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-400 italic">Projected Variable (full year)</span>
                <span className="text-sm italic text-gray-400 tabular-nums">{projectedVariable !== null ? fmt(projectedVariable) : '—'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total Expenses (projected)</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">{totalExpensesProj !== null ? fmt(totalExpensesProj) : '—'}</span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-700">Savings Allocation YTD</span>
                <span className={`text-xl font-bold tabular-nums ${savingsYTD > 0 ? 'text-[#0D7377]' : 'text-gray-300'}`}>
                  {savingsYTD > 0 ? fmt(savingsYTD) : '—'}
                </span>
              </div>
              {projectedSavings !== null && projectedSavings !== savingsYTD && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm italic text-gray-400">Projected Savings (full year)</span>
                  <span className="text-sm italic text-gray-400 tabular-nums">{fmt(projectedSavings)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">Savings Rate</span>
                <span className={`text-xl font-bold tabular-nums ${
                  savingsRate === null ? 'text-gray-300'
                  : savingsRate >= 20 ? 'text-[#0D7377]'
                  : savingsRate >= 10 ? 'text-amber-500'
                  : 'text-red-400'
                }`}>
                  {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Spending Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-800 mb-3">Monthly Spending Overview</p>
        <BarChart width={520} height={220} data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => v === 0 ? '' : fmtK(v)} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={v => [fmt(v), 'Spend']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            cursor={{ fill: '#F3F4F6' }}
          />
          <Bar
            dataKey="spend"
            name="Monthly Spend"
            fill="#0D7377"
            radius={[3, 3, 0, 0]}
            label={{ position: 'top', fontSize: 9, fill: '#9CA3AF', formatter: v => v > 0 ? fmtK(v) : '' }}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.spend > 0 ? '#0D7377' : 'transparent'} />
            ))}
          </Bar>
        </BarChart>
      </div>

    </div>
  )
}
