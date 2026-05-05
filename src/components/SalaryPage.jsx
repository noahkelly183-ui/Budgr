import { useState } from 'react'
import { APP_YEAR, EXCLUDE_FROM_TOTALS, isSaving } from '../constants.js'
import { fmt, yearMonthOf, calcNetIncome, calcFixedTotal } from '../utils/finance.js'

export default function SalaryPage({ salary, onSalaryChange, transactions, selectedMonth, fixedCosts }) {
  const [grossDisplay, setGrossDisplay] = useState(
    salary.gross > 0 ? salary.gross.toLocaleString('en-US') : ''
  )

  const { annualNet, monthlyNet } = calcNetIncome(salary)

  const monthIdx = parseInt(selectedMonth, 10)

  const today          = new Date()
  const todayYear      = today.getFullYear().toString()
  const todayMonthIdx  = today.getMonth() + 1
  const dayOfMonth     = today.getDate()
  const daysInMonth    = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed  = todayYear === APP_YEAR
    ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth
    : 0
  const incomeToDate   = monthlyNet * monthsElapsed
  console.log('[SalaryPage]', { todayYear, APP_YEAR, todayMonthIdx, dayOfMonth, daysInMonth, monthsElapsed, monthlyNet, incomeToDate })

  const debits = transactions.filter(t =>
    t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category) && !isSaving(t.category)
  )
  const spentToDate = debits
    .filter(t => {
      const ym = yearMonthOf(t.date)
      return ym.slice(0, 4) === APP_YEAR && parseInt(ym.slice(5), 10) <= monthIdx
    })
    .reduce((s, t) => s + t.amount, 0)

  const monthsWithSpendData = new Set(
    debits
      .filter(t => {
        const ym = yearMonthOf(t.date)
        return ym.slice(0, 4) === APP_YEAR && parseInt(ym.slice(5), 10) <= monthIdx
      })
      .map(t => yearMonthOf(t.date))
  ).size

  const fixedMonthlyTotal = calcFixedTotal(fixedCosts)

  const avgMonthlySpend        = monthsWithSpendData > 0 ? spentToDate / monthsWithSpendData : null
  const monthlySavings         = monthlyNet > 0 && avgMonthlySpend !== null
    ? monthlyNet - avgMonthlySpend - fixedMonthlyTotal
    : null
  const projectedAnnualSavings = monthlySavings !== null ? monthlySavings * 12 : null

  function update(field, val) {
    onSalaryChange({ ...salary, [field]: val })
  }

  function handleGrossChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    setGrossDisplay(raw ? num.toLocaleString('en-US') : '')
    update('gross', num)
  }

  return (
    <div className="max-w-xl">

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Income Details</h2>
        <div className="space-y-4">

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Gross Annual Salary</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={grossDisplay}
                onChange={handleGrossChange}
                placeholder="0"
                className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Tax Rate</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none w-10 text-center shrink-0">%</span>
              <input
                type="number"
                min="0"
                max="100"
                value={salary.taxRate || ''}
                onChange={e => update('taxRate', Number(e.target.value))}
                placeholder="30"
                className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Monthly Deductions (other)</label>
            <p className="text-[10px] text-gray-400 mb-1.5 italic">e.g. benefits, pension, parking — deducted each month from your paycheque</p>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input
                type="number"
                min="0"
                value={salary.deductions || ''}
                onChange={e => update('deductions', Number(e.target.value))}
                placeholder="0"
                className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Annual Net Income</p>
          <p className={`text-2xl font-semibold ${annualNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">Gross − Tax − (Deductions × 12)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Income to Date</p>
          <p className={`text-2xl font-semibold ${incomeToDate > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {incomeToDate > 0 ? fmt(incomeToDate) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">
            Monthly Net × {todayYear === APP_YEAR
              ? `${todayMonthIdx - 1} mo + ${dayOfMonth} day${dayOfMonth !== 1 ? 's' : ''} (through ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
              : '—'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Monthly Net Income</p>
          <p className={`text-2xl font-semibold ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {monthlyNet > 0 ? fmt(monthlyNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">Annual Net ÷ 12</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Monthly Savings</p>
          <p className={`text-2xl font-semibold ${
            monthlySavings === null ? 'text-gray-300'
            : monthlySavings >= 0 ? 'text-[#0D7377]' : 'text-red-500'
          }`}>
            {monthlySavings === null
              ? (monthlyNet === 0 ? '—' : 'No data')
              : (monthlySavings < 0 ? '−' : '') + fmt(Math.abs(monthlySavings))}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">
            {avgMonthlySpend === null
              ? 'Import transactions to calculate'
              : 'Monthly Net − Avg Spend − Fixed Costs'}
          </p>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Projected Annual Savings</p>
          <p className={`text-2xl font-semibold ${
            projectedAnnualSavings === null ? 'text-gray-300'
            : projectedAnnualSavings >= 0 ? 'text-[#0D7377]' : 'text-red-500'
          }`}>
            {projectedAnnualSavings === null
              ? (annualNet === 0 ? '—' : 'No data')
              : (projectedAnnualSavings < 0 ? '−' : '') + fmt(Math.abs(projectedAnnualSavings))}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">
            {monthlySavings === null
              ? 'Import transactions to calculate'
              : 'Monthly Savings × 12'}
          </p>
        </div>

      </div>

    </div>
  )
}
