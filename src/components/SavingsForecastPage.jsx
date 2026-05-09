import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fmt } from '../utils/finance.js'

// ── math helpers ──────────────────────────────────────────────────────────────

function defaultRate(cat) {
  const c = (cat || '').toLowerCase()
  if (c === 'investments') return 7
  if (['rrsp', 'tfsa'].includes(c)) return 6
  if (['savings', 'savings transfer', 'emergency fund'].includes(c)) return 2
  return 3
}

function isCash(cat) {
  const c = (cat || '').toLowerCase()
  return ['savings', 'savings transfer', 'emergency fund'].includes(c)
}

function scenarioRate(cat, sc, override) {
  if (override !== null && override !== undefined) return override
  const base = defaultRate(cat)
  if (sc === 'conservative') return isCash(cat) ? 0.5 : Math.max(base - 3, 0.5)
  if (sc === 'optimistic')   return isCash(cat) ? 2.5 : base + 2
  return base
}

function project(balance, monthly, annualPct, months) {
  const r = annualPct / 100 / 12
  let bal = balance
  if (r === 0) return bal + monthly * months
  for (let i = 0; i < months; i++) bal = bal * (1 + r) + monthly
  return bal
}

function pmt(r, n, pv, fv) {
  if (n <= 0) return Infinity
  if (r === 0) return (fv - pv) / n
  const factor = Math.pow(1 + r, n)
  return (fv - pv * factor) * r / (factor - 1)
}

function acctKey(e) { return `${e.name}|${e.category}` }
function monthlyAmt(e) { return e.frequency === 'annual' ? e.amount / 12 : e.amount }

const HORIZON_OPTIONS = [1, 3, 5, 10, 20, 30]

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', color: '#F59E0B', desc: 'Lower return rates' },
  { id: 'base',         label: 'Base',         color: '#0D7377', desc: 'Expected returns'  },
  { id: 'optimistic',   label: 'Optimistic',   color: '#14A085', desc: 'Higher return rates' },
]

// ── InlineEdit ────────────────────────────────────────────────────────────────

function InlineEdit({ value, onSave, prefix = '', suffix = '', className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  function start() { setDraft(String(value)); setEditing(true) }
  function commit() {
    const n = parseFloat(draft)
    if (!isNaN(n) && n >= 0) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-24 border border-[#0D7377] rounded px-1.5 py-0.5 text-sm text-right outline-none tabular-nums"
      />
    )
  }

  const display = typeof value === 'number'
    ? value.toLocaleString('en-US', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })
    : value

  return (
    <button
      onClick={start}
      title="Click to edit"
      className={`text-sm tabular-nums hover:text-[#0D7377] hover:underline cursor-text ${className}`}
    >
      {prefix}{display}{suffix}
    </button>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function SavingsForecastPage({ savingsEntries, user, isDemoMode }) {
  const storageKey = isDemoMode ? 'budgr_forecast_demo' : `budgr_forecast_${user?.id || 'anon'}`

  const [balances,      setBalances]      = useState({})
  const [rateOverrides, setRateOverrides] = useState({})
  const [contribAdj,    setContribAdj]    = useState(0)
  const [goals,         setGoals]         = useState([])
  const [horizon,       setHorizon]       = useState(10)
  const [scenario,      setScenario]      = useState('base')
  const [showGoalForm,  setShowGoalForm]  = useState(false)
  const [newGoal,       setNewGoal]       = useState({ name: '', target: '', targetDate: '' })

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) || '{}')
      if (s.balances)                  setBalances(s.balances)
      if (s.rateOverrides)             setRateOverrides(s.rateOverrides)
      if (s.contribAdj !== undefined)  setContribAdj(s.contribAdj)
      if (s.goals)                     setGoals(s.goals)
    } catch {}
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ balances, rateOverrides, contribAdj, goals }))
    } catch {}
  }, [storageKey, balances, rateOverrides, contribAdj, goals])

  // build account objects from savings entries
  const accounts = savingsEntries.map(e => {
    const key = acctKey(e)
    return {
      key,
      name: e.name,
      category: e.category,
      balance: balances[key] ?? 0,
      monthly: monthlyAmt(e),
      rateOverride: rateOverrides[key] ?? null,
    }
  })

  const n = Math.max(accounts.length, 1)
  const adjPerAccount = contribAdj / n

  function effectiveRate(acc, sc) {
    return scenarioRate(acc.category, sc, acc.rateOverride)
  }

  function effectiveMonthly(acc) {
    return Math.max(0, acc.monthly + adjPerAccount)
  }

  function projectAcc(acc, sc, yrs) {
    return project(acc.balance, effectiveMonthly(acc), effectiveRate(acc, sc), yrs * 12)
  }

  function projectTotal(sc, yrs = horizon) {
    return accounts.reduce((s, a) => s + projectAcc(a, sc, yrs), 0)
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const totalMonthly = Math.max(0, accounts.reduce((s, a) => s + a.monthly, 0) + contribAdj)
  const baseProjected = projectTotal('base')

  // chart data
  const chartCheckpoints = [0, 1, 2, 3, 5, 10, 15, 20, 25, 30]
    .filter(y => y <= horizon)
    .concat(horizon % 5 === 0 || horizon <= 3 ? [] : [horizon])
    .sort((a, b) => a - b)
    .filter((v, i, a) => a.indexOf(v) === i)

  const chartData = chartCheckpoints.map(yr => ({
    year: yr,
    conservative: Math.round(projectTotal('conservative', yr)),
    base:         Math.round(projectTotal('base',         yr)),
    optimistic:   Math.round(projectTotal('optimistic',   yr)),
  }))

  // insights
  const insights = []
  if (totalMonthly > 0) {
    insights.push(`You're putting away ${fmt(totalMonthly)}/month across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}.`)
  }
  if (baseProjected > 0) {
    insights.push(`At your current rate your savings could grow to ${fmt(baseProjected)} in ${horizon} year${horizon !== 1 ? 's' : ''}.`)
  }
  const growth = baseProjected - totalBalance - totalMonthly * 12 * horizon
  if (growth > 1) {
    const pct = Math.round((growth / Math.max(totalMonthly * 12 * horizon, 1)) * 100)
    insights.push(`Compound returns could add ${fmt(growth)} on top of contributions — about ${pct}% bonus from growth.`)
  }
  if (totalMonthly > 0 && horizon >= 5) {
    const boosted = accounts.reduce((s, a) =>
      s + project(a.balance, Math.max(0, a.monthly + adjPerAccount + 100 / n), effectiveRate(a, 'base'), horizon * 12), 0)
    insights.push(`Adding $100/month to your savings would grow your total to ${fmt(boosted)} — ${fmt(boosted - baseProjected)} more.`)
  }
  if (accounts.length > 1) {
    const top = accounts.reduce((best, a) => projectAcc(a, 'base', horizon) > projectAcc(best, 'base', horizon) ? a : best)
    insights.push(`${top.name} (${top.category}) is on track to be your largest account at ${fmt(projectAcc(top, 'base', horizon))}.`)
  }

  // goal helpers
  function goalStatus(goal) {
    if (!goal.targetDate) return null
    const msLeft   = new Date(goal.targetDate + 'T00:00:00').getTime() - Date.now()
    const moLeft   = Math.max(0, Math.round(msLeft / (1000 * 60 * 60 * 24 * 30.44)))
    const r        = defaultRate('RRSP') / 100 / 12
    const required = pmt(r, moLeft, totalBalance, goal.target)
    return { moLeft, required, onTrack: required <= totalMonthly }
  }

  function addGoal() {
    const t = parseFloat(newGoal.target)
    if (!newGoal.name.trim() || !t) return
    setGoals(prev => [...prev, { id: Date.now().toString(), name: newGoal.name.trim(), target: t, targetDate: newGoal.targetDate }])
    setNewGoal({ name: '', target: '', targetDate: '' })
    setShowGoalForm(false)
  }

  // ── empty state ──────────────────────────────────────────────────────────────
  if (accounts.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-800 mb-2">No savings accounts yet</p>
          <p className="text-sm text-gray-400">Add savings allocations in the Savings tab to unlock your forecast.</p>
        </div>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl space-y-5 print:space-y-4">

      {/* Section E — Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 print:hidden">
        <div className="flex flex-wrap items-center gap-6">

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Horizon</p>
            <div className="flex gap-1.5">
              {HORIZON_OPTIONS.map(y => (
                <button
                  key={y}
                  onClick={() => setHorizon(y)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    horizon === y ? 'bg-[#0D7377] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contribution Adjustment</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[-250, -100, -50, 50, 100, 250].map(d => (
                <button
                  key={d}
                  onClick={() => setContribAdj(p => p + d)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    d > 0 ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {d > 0 ? '+' : ''}{d}
                </button>
              ))}
              {contribAdj !== 0 && (
                <>
                  <span className={`text-xs font-semibold ml-1 ${contribAdj > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {contribAdj > 0 ? '+' : ''}{fmt(contribAdj)}/mo
                  </span>
                  <button onClick={() => setContribAdj(0)} className="text-xs text-gray-400 hover:text-gray-600 underline">reset</button>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

        </div>
      </div>

      {/* Section A — Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(totalBalance)}</p>
          <p className="text-xs text-gray-400 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Saving / Month</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(totalMonthly)}</p>
          {contribAdj !== 0 && (
            <p className={`text-xs mt-1 ${contribAdj > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {contribAdj > 0 ? '+' : ''}{fmt(contribAdj)} adj.
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Projected — {horizon}yr</p>
          <p className="text-2xl font-bold text-[#0D7377] tabular-nums">{fmt(baseProjected)}</p>
          <p className="text-xs text-gray-400 mt-1">base scenario</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Compound Growth</p>
          <p className="text-2xl font-bold text-green-600 tabular-nums">{fmt(Math.max(0, growth))}</p>
          <p className="text-xs text-gray-400 mt-1">returns on top</p>
        </div>
      </div>

      {/* Plain-English callout */}
      <div className="bg-[#0D7377]/6 border border-[#0D7377]/20 rounded-xl px-5 py-3.5">
        <p className="text-sm text-[#0D7377] font-medium leading-relaxed">
          Saving <strong>{fmt(totalMonthly)}/month</strong>, your portfolio could reach{' '}
          <strong>{fmt(baseProjected)}</strong> in {horizon} year{horizon !== 1 ? 's' : ''}.
          {baseProjected > totalBalance * 1.5 && totalBalance > 0 &&
            ` That's ${(baseProjected / totalBalance).toFixed(1)}× your current savings.`}
        </p>
      </div>

      {/* Section B — Scenario Range */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Scenario Range at {horizon} Year{horizon !== 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {SCENARIOS.map(sc => {
            const val = projectTotal(sc.id)
            const active = scenario === sc.id
            return (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id)}
                className={`rounded-xl p-4 border-2 text-left transition-all ${
                  active ? 'shadow-sm' : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
                style={active ? { borderColor: sc.color, backgroundColor: sc.color + '12' } : {}}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: sc.color }}>
                  {sc.label}
                </p>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{fmt(val)}</p>
                <p className="text-xs text-gray-400 mt-1">{sc.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section D — Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Growth Projection</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <XAxis
              dataKey="year"
              tickFormatter={y => `${y}yr`}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'k' : '$' + v}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(v, name) => [fmt(v), SCENARIOS.find(s => s.id === name)?.label || name]}
              labelFormatter={l => `Year ${l}`}
              contentStyle={{ background: '#1A1A2E', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', padding: '8px 12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              formatter={k => SCENARIOS.find(s => s.id === k)?.label || k}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line type="monotone" dataKey="conservative" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="base"         stroke="#0D7377" strokeWidth={2}   dot={false} />
            <Line type="monotone" dataKey="optimistic"   stroke="#14A085" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section C — Account Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Breakdown</p>
          <p className="text-xs text-gray-400 print:hidden">Click balance or rate % to edit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Balance</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">/Month</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Rate</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">In {horizon}yr</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => {
                const displayRate = acc.rateOverride !== null ? acc.rateOverride : defaultRate(acc.category)
                return (
                  <tr key={acc.key} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-800">{acc.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{acc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <InlineEdit
                        value={acc.balance}
                        prefix="$"
                        onSave={v => setBalances(prev => ({ ...prev, [acc.key]: v }))}
                        className="text-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{fmt(acc.monthly)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        <InlineEdit
                          value={displayRate}
                          suffix="%"
                          onSave={v => setRateOverrides(prev => ({ ...prev, [acc.key]: v }))}
                          className={acc.rateOverride !== null ? 'font-semibold text-[#0D7377]' : 'text-gray-500'}
                        />
                        {acc.rateOverride !== null && (
                          <button
                            onClick={() => setRateOverrides(prev => { const n = { ...prev }; delete n[acc.key]; return n })}
                            className="text-gray-300 hover:text-red-400 transition-colors text-xs print:hidden"
                            title="Reset to default"
                          >✕</button>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0D7377] tabular-nums">
                      {fmt(projectAcc(acc, scenario, horizon))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/60">
                <td className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 tabular-nums">{fmt(totalBalance)}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 tabular-nums">{fmt(totalMonthly)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-sm font-bold text-[#0D7377] tabular-nums">{fmt(projectTotal(scenario))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Section G — Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Insights</p>
          <ul className="space-y-3">
            {insights.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0D7377] mt-2 shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section F — Savings Goals */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Savings Goals</p>
          <button
            onClick={() => setShowGoalForm(f => !f)}
            className="text-xs font-medium text-[#0D7377] hover:text-[#0b6165] transition-colors print:hidden"
          >
            {showGoalForm ? 'Cancel' : '+ Add Goal'}
          </button>
        </div>

        {showGoalForm && (
          <div className="flex gap-3 items-end flex-wrap mb-5 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-500 mb-1.5">Goal Name</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                placeholder="e.g. House down payment"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D7377] transition-colors"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1.5">Target Amount</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
                <span className="px-2.5 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))}
                  placeholder="50000"
                  className="flex-1 px-2.5 py-2.5 text-sm outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="w-44">
              <label className="block text-xs text-gray-500 mb-1.5">Target Date</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={e => setNewGoal(g => ({ ...g, targetDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0D7377] transition-colors"
              />
            </div>
            <button
              onClick={addGoal}
              disabled={!newGoal.name.trim() || !newGoal.target}
              className="px-5 py-2.5 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-[#0b6165] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        )}

        {goals.length === 0 && !showGoalForm && (
          <p className="text-sm text-gray-400">No goals yet — set a savings target to see if you're on track.</p>
        )}

        {goals.map(goal => {
          const pct    = Math.min(100, totalBalance > 0 ? (totalBalance / goal.target) * 100 : 0)
          const status = goalStatus(goal)
          return (
            <div key={goal.id} className="flex items-start gap-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{goal.name}</span>
                  {status && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      status.onTrack ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {status.onTrack ? 'On track' : 'Behind'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-2">
                  <span>Target: {fmt(goal.target)}</span>
                  {goal.targetDate && (
                    <span>By: {new Date(goal.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  )}
                  {status && <span>Need: {fmt(Math.max(0, status.required))}/mo</span>}
                  {status && <span>{status.moLeft} months left</span>}
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D7377] rounded-full transition-all"
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% of goal saved</p>
              </div>
              <button
                onClick={() => setGoals(g => g.filter(x => x.id !== goal.id))}
                className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0 mt-0.5 print:hidden"
                title="Remove"
              >✕</button>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-300 text-center pb-4">
        Projections are estimates only and do not account for taxes, inflation, or market volatility. Past performance does not guarantee future results.
      </p>

    </div>
  )
}
