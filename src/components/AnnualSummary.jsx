import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { EXCLUDE_FROM_TOTALS, MONTHS, APP_YEAR, isSaving } from '../constants.js'
import { fmt, fmtK, yearMonthOf, calcNetIncome } from '../utils/finance.js'

export default function AnnualSummary({ transactions, salary, fixedCosts, savingsEntries }) {
  const gross            = salary.gross
  const taxAmount        = gross * (salary.taxRate / 100)
  const deductionsAnnual = salary.deductions * 12
  const { annualNet, monthlyNet } = calcNetIncome(salary)

  const fixedMonthlyTotal    = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + c.amount, 0)
  const fixedAnnualProjected = fixedMonthlyTotal * 12

  // Variable spending = debit transactions that aren't excluded and aren't savings-tagged
  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const variableDebitsAnn = allDebitsAnn.filter(t => !isSaving(t.category))
  const txnSpent          = variableDebitsAnn.reduce((s, t) => s + t.amount, 0)
  const monthsWithData    = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  // YTD figures — use today's actual date, not transaction count
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

  // Savings = residual (Income − Fixed − Variable)
  const savingsYTD     = Math.max(0, incomeToDate - totalExpYTD)
  const savingsRateYTD = incomeToDate > 0 && savingsYTD > 0
    ? (savingsYTD / incomeToDate) * 100
    : null

  // Projections
  const avgMonthlyVariable = monthsWithData > 0 ? txnSpent / monthsWithData : null
  const projectedVariable  = avgMonthlyVariable !== null ? avgMonthlyVariable * 12 : null
  const totalExpensesProj  = projectedVariable !== null ? fixedAnnualProjected + projectedVariable : null

  // Projected annual savings (residual extrapolated)
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

  const ARC_LEN     = Math.PI * 70
  const clampedRate = savingsRate !== null ? Math.max(0, Math.min(100, savingsRate)) : 0
  const filledLen   = (clampedRate / 100) * ARC_LEN
  const gaugeColor  = savingsRate === null ? '#D1D5DB'
    : savingsRate >= 20 ? '#0D7377'
    : savingsRate >= 10 ? '#F59E0B'
    : '#EF4444'

  return (
    <div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">

        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Annual Net Income</p>
          <p className={`text-2xl font-bold tabular-nums ${annualNet > 0 ? 'text-white' : 'text-white/20'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: '#0D7377' }} />
        </div>

        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Total Expenses YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${totalExpYTD > 0 ? 'text-white' : 'text-white/20'}`}>
            {totalExpYTD > 0 ? fmt(totalExpYTD) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full bg-red-400/70" />
        </div>

        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Savings YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${savingsYTD > 0 ? 'text-white' : 'text-white/20'}`}>
            {savingsYTD > 0 ? fmt(savingsYTD) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: savingsYTD > 0 ? '#14A085' : '#374151' }} />
        </div>

        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Savings Rate YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${
            savingsRateYTD === null ? 'text-white/20'
            : savingsRateYTD >= 20 ? 'text-[#14A085]'
            : savingsRateYTD >= 10 ? 'text-amber-400'
            : 'text-red-400'
          }`}>
            {savingsRateYTD === null ? '—' : savingsRateYTD.toFixed(1) + '%'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full"
            style={{ backgroundColor: savingsRateYTD === null ? '#374151' : savingsRateYTD >= 20 ? '#0D7377' : savingsRateYTD >= 10 ? '#F59E0B' : '#EF4444' }} />
        </div>

      </div>

      {/* Annual P&L card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Annual Financial Summary — {APP_YEAR}</h2>

        {/* Income rows */}
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
        <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Annual Net Income</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{annualNet > 0 ? fmt(annualNet) : '—'}</span>
        </div>

        <div className="pt-2" />

        {/* Expense rows */}
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

        <div className="pt-2" />

        {/* Savings rows */}
        <div className="border-t border-gray-100 pt-1">
          <div className="flex justify-between items-center py-3 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-700">Total Savings YTD</span>
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

      {/* Bottom row: bar chart + gauge */}
      <div className="flex gap-5 items-start">

        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">Monthly Spending Overview</p>
          <BarChart width={520} height={220} data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => v === 0 ? '' : fmtK(v)} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              formatter={v => [fmt(v), 'Spend']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
              cursor={{ fill: '#F3F4F6' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
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

        {/* Savings rate gauge */}
        <div className="w-52 bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 self-start">Savings Rate</p>

          <svg viewBox="0 0 180 100" className="w-full">
            <path d="M 20,92 A 70,70 0 0,1 160,92"
              fill="none" stroke="#E5E7EB" strokeWidth="14" strokeLinecap="round" />
            {clampedRate > 0 && (
              <path d="M 20,92 A 70,70 0 0,1 160,92"
                fill="none" stroke={gaugeColor} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${filledLen} ${ARC_LEN}`}
              />
            )}
            <text x="90" y="76" textAnchor="middle" fontSize="24" fontWeight="700"
              fill={savingsRate === null ? '#D1D5DB' : gaugeColor}>
              {savingsRate === null ? '—' : `${clampedRate.toFixed(0)}%`}
            </text>
          </svg>

          <p className="text-[10px] text-gray-400 text-center -mt-1 mb-5">Projected Savings Rate</p>

          <div className="w-full space-y-1.5">
            <div className="h-2 rounded-full overflow-hidden flex">
              <div className="w-[30%] bg-red-200" />
              <div className="w-[35%] bg-amber-200" />
              <div className="flex-1" style={{ backgroundColor: '#0D737750' }} />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-red-400">{'< 10%'} Low</span>
              <span className="text-amber-500">10–20% Good</span>
              <span style={{ color: '#0D7377' }}>20%+ Great</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
