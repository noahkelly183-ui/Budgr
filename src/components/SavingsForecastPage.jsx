import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmt } from '../utils/finance.js'
import { supabase } from '../supabase.js'

// ── math helpers ──────────────────────────────────────────────────────────────

function defaultRate(cat) {
  const c = (cat || '').toLowerCase()
  if (c === 'investments') return 7
  if (['rrsp', 'tfsa'].includes(c)) return 6
  if (['savings', 'savings transfer', 'emergency fund'].includes(c)) return 2
  return 3
}

function scenarioRate(cat, sc, override) {
  const base = (override !== null && override !== undefined) ? override : defaultRate(cat)
  if (sc === 'conservative') return Math.max(base - 3, 0)
  if (sc === 'optimistic')   return base + 2
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

const fmtW = n => '$' + Math.round(n).toLocaleString('en-US')
const fmtK = n => {
  const v = Math.round(n)
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000)     return '$' + Math.round(v / 1_000) + 'k'
  return '$' + v.toLocaleString('en-US')
}

// ── InlineEdit ────────────────────────────────────────────────────────────────

function InlineEdit({ value, onSave, prefix = '', suffix = '', className = '', isBalance = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  function start() { setDraft(String(value)); setEditing(true) }
  function commit() {
    const n = parseFloat(String(draft).replace(/,/g, ''))
    if (!isNaN(n) && n >= 0) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-24 border border-emerald-500 rounded px-1.5 py-0.5 text-sm text-right outline-none tabular-nums"
      />
    )
  }

  const display = typeof value === 'number'
    ? value.toLocaleString('en-US', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })
    : value

  if (isBalance && value === 0) {
    return (
      <button
        onClick={start}
        role="button"
        aria-label="Edit balance"
        className="inline-flex items-center gap-1 text-sm tabular-nums text-gray-300 hover:text-emerald-500 transition-colors group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded"
      >
        <span>{prefix}0</span>
        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.914l-3.414.5.5-3.414A4 4 0 019 13z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={start}
      role="button"
      aria-label={`Edit ${prefix}${display}${suffix}`}
      className={`text-sm tabular-nums hover:text-emerald-500 hover:underline cursor-text focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded ${className}`}
    >
      {prefix}{display}{suffix}
    </button>
  )
}

// ── useCountUp ────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 300) {
  const [val, setVal] = useState(target)
  const raf  = useRef(null)
  const prev = useRef(target)
  useEffect(() => {
    const from = prev.current
    if (from === target) return
    const t0 = performance.now()
    function step(now) {
      const p = Math.min((now - t0) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(from + (target - from) * e)
      if (p < 1) raf.current = requestAnimationFrame(step)
      else { prev.current = target; setVal(target) }
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return val
}

// ── acctTypeBadge ─────────────────────────────────────────────────────────────

function acctTypeBadge(cat) {
  const c = (cat || '').toLowerCase()
  if (['rrsp', 'tfsa'].includes(c)) return 'Registered'
  if (c === 'investments') return 'Investment'
  if (['savings', 'savings transfer', 'emergency fund'].includes(c)) return 'Cash'
  return cat
}

// ── main component ────────────────────────────────────────────────────────────

export default function SavingsForecastPage({ savingsEntries, user, isDemoMode }) {
  const storageKey = isDemoMode ? 'budgr_forecast_demo' : `budgr_forecast_${user?.id || 'anon'}`

  const [balances,      setBalances]      = useState({})
  const [rateOverrides, setRateOverrides] = useState({})
  const [contribAdj,    setContribAdj]    = useState(0)
  const [goals,         setGoals]         = useState([])
  const [horizon,       setHorizon]       = useState(10)
  const [showGoalForm,  setShowGoalForm]  = useState(false)
  const [newGoal,       setNewGoal]       = useState({ name: '', target: '', targetDate: '' })
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalDraft,     setGoalDraft]     = useState({ name: '', target: '', targetDate: '' })
  const [showRange,     setShowRange]     = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [editingContrib, setEditingContrib] = useState(false)
  const [contribDraft,   setContribDraft]   = useState('')

  const breakdownRef    = useRef(null)
  const saveReadyRef    = useRef(false)
  const supabaseSaveTimer = useRef(null)
  const latestStateRef  = useRef({ balances, rateOverrides, contribAdj, goals })
  useEffect(() => { latestStateRef.current = { balances, rateOverrides, contribAdj, goals } })

  useEffect(() => {
    saveReadyRef.current = false
    let lsTs = 0
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) || '{}')
      lsTs = s._ts ?? 0
      if (s.balances)                  setBalances(s.balances)
      if (s.rateOverrides)             setRateOverrides(s.rateOverrides)
      if (s.contribAdj !== undefined)  setContribAdj(s.contribAdj)
      if (s.goals)                     setGoals(s.goals)
    } catch {}

    if (!isDemoMode && user?.id) {
      supabase
        .from('user_preferences')
        .select('forecast_state')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data?.forecast_state) return
          if (lsTs > Date.now() - 30_000) return
          const db = data.forecast_state
          if (db.balances)                  setBalances(db.balances)
          if (db.rateOverrides)             setRateOverrides(db.rateOverrides)
          if (db.contribAdj !== undefined)  setContribAdj(db.contribAdj)
          if (db.goals)                     setGoals(db.goals)
        })
    }

    const id = setTimeout(() => { saveReadyRef.current = true }, 0)
    return () => clearTimeout(id)
  }, [storageKey])

  useEffect(() => {
    return () => {
      if (isDemoMode || !user?.id) return
      clearTimeout(supabaseSaveTimer.current)
      const s = latestStateRef.current
      supabase
        .from('user_preferences')
        .upsert(
          { user_id: user.id, forecast_state: { balances: s.balances, rateOverrides: s.rateOverrides, contribAdj: s.contribAdj, goals: s.goals } },
          { onConflict: 'user_id' }
        )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!saveReadyRef.current) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ balances, rateOverrides, contribAdj, goals, _ts: Date.now() }))
    } catch {}
    if (!isDemoMode && user?.id) {
      clearTimeout(supabaseSaveTimer.current)
      supabaseSaveTimer.current = setTimeout(() => {
        supabase
          .from('user_preferences')
          .upsert(
            { user_id: user.id, forecast_state: { balances, rateOverrides, contribAdj, goals } },
            { onConflict: 'user_id' }
          )
          .then(({ error }) => { if (error) console.error('[forecast] save failed:', error.message) })
      }, 1000)
    }
  }, [storageKey, balances, rateOverrides, contribAdj, goals])

  // ── derived values ────────────────────────────────────────────────────────

  const accounts = savingsEntries.map(e => {
    const key = acctKey(e)
    return { key, name: e.name, category: e.category, balance: balances[key] ?? 0, monthly: monthlyAmt(e), rateOverride: rateOverrides[key] ?? null }
  })

  const n            = Math.max(accounts.length, 1)
  const adjPerAccount = contribAdj / n

  function effectiveRate(acc, sc)   { return scenarioRate(acc.category, sc, acc.rateOverride) }
  function effectiveMonthly(acc)    { return Math.max(0, acc.monthly + adjPerAccount) }
  function projectAcc(acc, sc, yrs) { return project(acc.balance, effectiveMonthly(acc), effectiveRate(acc, sc), yrs * 12) }
  function projectTotal(sc, yrs = horizon) { return accounts.reduce((s, a) => s + projectAcc(a, sc, yrs), 0) }

  const totalBalance  = accounts.reduce((s, a) => s + a.balance, 0)
  const baseMonthly   = accounts.reduce((s, a) => s + a.monthly, 0)
  const totalMonthly  = Math.max(0, baseMonthly + contribAdj)
  const totalAnnual   = totalMonthly * 12
  const baseProjected = projectTotal('base')
  const growth        = baseProjected - totalBalance - totalMonthly * 12 * horizon
  const anyBalanceSet = accounts.some(a => a.balance > 0)

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

  // ── single insight selection ───────────────────────────────────────────────

  const boosted     = accounts.reduce((s, a) =>
    s + project(a.balance, Math.max(0, a.monthly + adjPerAccount + 100 / n), effectiveRate(a, 'base'), horizon * 12), 0)
  const boostPct    = baseProjected > 0 ? (boosted - baseProjected) / baseProjected : 0
  const compoundPct = baseProjected > 0 ? Math.max(0, growth) / baseProjected : 0
  const multiplier  = totalBalance > 0 ? baseProjected / totalBalance : 0

  let insight = ''
  if (boostPct > 0.05 && totalMonthly > 0) {
    insight = `Adding just $100/month would grow your total to ${fmtW(boosted)} — ${fmtW(boosted - baseProjected)} more over ${horizon} year${horizon !== 1 ? 's' : ''}.`
  } else if (compoundPct > 0.40) {
    insight = `Compound growth adds ${fmtW(Math.max(0, growth))} on top of your contributions. Nearly half your final balance costs you nothing extra.`
  } else if (multiplier > 1) {
    insight = `Your savings will be ${multiplier.toFixed(1)}× larger in ${horizon} year${horizon !== 1 ? 's' : ''} than they are today. Time is doing the heavy lifting.`
  }

  // ── scenario range bar ────────────────────────────────────────────────────

  const conservativeVal = projectTotal('conservative')
  const optimisticVal   = projectTotal('optimistic')
  const rangeSpan       = Math.max(1, optimisticVal - conservativeVal)
  const baseMarkerPct   = Math.min(100, Math.max(0, ((baseProjected - conservativeVal) / rangeSpan) * 100))

  // ── chart breakeven year ──────────────────────────────────────────────────

  let breakevenYear = null
  for (const d of chartData) {
    if (d.year === 0) continue
    const contributions = totalMonthly * 12 * d.year
    const returns       = d.base - totalBalance - contributions
    if (returns >= contributions && breakevenYear === null) breakevenYear = d.year
  }

  const yMin = totalBalance > 0 ? Math.floor(totalBalance * 0.9 / 1000) * 1000 : 0

  // ── goal helpers ──────────────────────────────────────────────────────────

  function goalStatus(goal) {
    const now      = Date.now()
    const deadline = goal.targetDate ? new Date(goal.targetDate + 'T00:00:00').getTime() : null

    if (totalBalance >= goal.target) return { state: 'reached' }
    if (deadline && deadline < now)  return { state: 'expired', expiredDate: new Date(deadline) }
    if (!deadline)                   return { state: 'on-track', moLeft: null, required: null }

    const moLeft   = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60 * 24 * 30.44)))
    const r        = defaultRate('RRSP') / 100 / 12
    const required = pmt(r, moLeft, totalBalance, goal.target)

    if (required <= 0)              return { state: 'on-track', moLeft, required }
    if (required > totalMonthly)    return { state: 'behind',   moLeft, required }
    return { state: 'on-track', moLeft, required }
  }

  function addGoal() {
    const t = parseFloat(newGoal.target)
    if (!newGoal.name.trim() || !t) return
    const next = [...goals, { id: Date.now().toString(), name: newGoal.name.trim(), target: t, targetDate: newGoal.targetDate }]
    latestStateRef.current = { ...latestStateRef.current, goals: next }
    setGoals(next)
    setNewGoal({ name: '', target: '', targetDate: '' })
    setShowGoalForm(false)
  }

  function startEditGoal(goal) {
    setEditingGoalId(goal.id)
    setGoalDraft({ name: goal.name, target: String(goal.target), targetDate: goal.targetDate || '' })
  }

  function commitEditGoal() {
    const t = parseFloat(goalDraft.target)
    if (!goalDraft.name.trim() || !t) { setEditingGoalId(null); return }
    const next = goals.map(g => g.id === editingGoalId
      ? { ...g, name: goalDraft.name.trim(), target: t, targetDate: goalDraft.targetDate }
      : g
    )
    latestStateRef.current = { ...latestStateRef.current, goals: next }
    setGoals(next)
    setEditingGoalId(null)
  }

  // ── hero animated value ───────────────────────────────────────────────────

  const animatedProjected = useCountUp(baseProjected)

  // ── empty state ───────────────────────────────────────────────────────────

  if (accounts.length === 0) {
    return (
      <div className="w-full">
        <div className="budgli-card rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-800 mb-2">No savings accounts yet</p>
          <p className="text-sm text-gray-400">Add savings allocations in the Savings tab to unlock your forecast.</p>
        </div>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────

  const GOAL_BADGE = {
    reached:   'bg-emerald-500 text-white',
    expired:   'bg-gray-100 text-gray-500',
    behind:    'bg-amber-100 text-amber-700',
    'on-track': 'bg-emerald-100 text-emerald-700',
  }
  const GOAL_LABEL = { reached: 'Reached', expired: 'Expired', behind: 'Behind', 'on-track': 'On Track' }

  return (
    <div className="w-full space-y-8 pb-8">

      {/* ── SECTION 1: Hero ───────────────────────────────────────────────── */}
      <div className="text-center pt-4 pb-2">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">YOUR SAVINGS COULD REACH</p>
        <p className="text-6xl font-bold text-gray-900 tabular-nums leading-none">
          {fmtW(animatedProjected)}
        </p>
        <p className="text-base text-gray-500 mt-4">
          {totalBalance > 0 && baseProjected > totalBalance
            ? `At your current rate over ${horizon} year${horizon !== 1 ? 's' : ''} — that's ${(baseProjected / totalBalance).toFixed(1)}× your savings today.`
            : `At your current rate over ${horizon} year${horizon !== 1 ? 's' : ''}.`
          }
        </p>
      </div>

      {/* ── SECTION 2: Three Levers ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 budgli-card rounded-xl">

        {/* Lever 1: Horizon */}
        <div className="flex-1 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">HORIZON</p>
          <div className="flex gap-2 flex-wrap">
            {HORIZON_OPTIONS.map(y => (
              <button
                key={y}
                onClick={() => setHorizon(y)}
                aria-label={`Set savings horizon to ${y} years`}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                  horizon === y ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {y}yr
              </button>
            ))}
          </div>
        </div>

        {/* Lever 2: Monthly Contribution */}
        <div className="flex-1 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">MONTHLY CONTRIBUTION</p>
          {editingContrib ? (
            <input
              autoFocus
              type="text"
              inputMode="decimal"
              value={contribDraft}
              onChange={e => setContribDraft(e.target.value)}
              onBlur={() => {
                const v = parseFloat(String(contribDraft).replace(/,/g, ''))
                if (!isNaN(v) && v >= 0) {
                  const nv = Math.max(-baseMonthly, v - baseMonthly)
                  latestStateRef.current = { ...latestStateRef.current, contribAdj: nv }
                  setContribAdj(nv)
                }
                setEditingContrib(false)
              }}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingContrib(false) }}
              aria-label="Monthly contribution amount"
              className="text-2xl font-semibold text-gray-900 border-b-2 border-emerald-500 outline-none bg-transparent w-36 tabular-nums"
            />
          ) : (
            <button
              onClick={() => { setContribDraft(String(Math.round(totalMonthly))); setEditingContrib(true) }}
              aria-label="Monthly contribution amount — click to edit"
              className="text-2xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors cursor-text focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded"
            >
              ${Math.round(totalMonthly).toLocaleString('en-US')}
            </button>
          )}
          <div className="flex gap-1.5 flex-wrap mt-3 items-center">
            {[-250, -100, -50, 50, 100, 250].map(d => (
              <button
                key={d}
                onClick={() => {
                  const nv = Math.max(-baseMonthly, contribAdj + d)
                  latestStateRef.current = { ...latestStateRef.current, contribAdj: nv }
                  setContribAdj(nv)
                }}
                aria-label={`${d > 0 ? 'Increase' : 'Decrease'} monthly contribution by $${Math.abs(d)}`}
                className={`px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
                  d > 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {d > 0 ? `+$${d}` : `-$${Math.abs(d)}`}
              </button>
            ))}
            {contribAdj !== 0 && (
              <button
                onClick={() => { latestStateRef.current = { ...latestStateRef.current, contribAdj: 0 }; setContribAdj(0) }}
                className="text-xs text-gray-400 hover:text-gray-600 underline focus:outline-none"
              >
                reset
              </button>
            )}
          </div>
        </div>

        {/* Lever 3: Current Balance */}
        <div className="flex-1 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">CURRENT BALANCE</p>
          <button
            onClick={() => { setBreakdownOpen(true); setTimeout(() => breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
            aria-label="Current total balance — click to edit account breakdown"
            className="text-2xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 rounded"
          >
            ${Math.round(totalBalance).toLocaleString('en-US')}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''} —{' '}
            <button
              onClick={() => { setBreakdownOpen(true); setTimeout(() => breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
              className="text-emerald-600 hover:underline focus:outline-none"
            >
              edit breakdown ↓
            </button>
          </p>
        </div>
      </div>

      {/* ── SECTION 3: Single Insight Card ────────────────────────────────── */}
      {insight && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
          <p className="text-base text-gray-700 leading-relaxed">{insight}</p>
        </div>
      )}

      {/* ── SECTION 4: Growth Chart ───────────────────────────────────────── */}
      <div className="budgli-card rounded-xl p-5">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowRange(r => !r)}
            aria-label={showRange ? 'Hide conservative and optimistic range lines' : 'Show conservative and optimistic range lines'}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
              showRange ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {showRange ? 'Hide range' : 'Show range'}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }} aria-label="Savings growth projection over time">
            <XAxis
              dataKey="year"
              tickFormatter={y => `yr ${y}`}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => v >= 1_000_000 ? '$' + (v/1_000_000).toFixed(1)+'M' : v >= 1_000 ? '$' + (v/1_000).toFixed(0)+'k' : '$'+v}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={64}
              domain={[yMin, 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const nameMap = { base: 'Base', conservative: 'Conservative', optimistic: 'Optimistic' }
                return (
                  <div className="bg-gray-900 rounded-xl p-3 text-xs text-white shadow-xl min-w-[130px]">
                    <p className="font-semibold mb-1.5 text-gray-300">Year {label}</p>
                    {payload.map(p => (
                      <p key={p.dataKey} style={{ color: p.color }} className="mb-0.5">
                        {nameMap[p.dataKey] || p.dataKey}: {fmtW(p.value)}
                      </p>
                    ))}
                    {breakevenYear !== null && label === breakevenYear && (
                      <p className="mt-2 pt-1.5 border-t border-gray-700 text-emerald-400">
                        📈 Compound returns now exceed your total contributions
                      </p>
                    )}
                  </div>
                )
              }}
            />
            {showRange && <Line type="monotone" dataKey="conservative" stroke="#D1D5DB" strokeWidth={1.5} dot={false} strokeDasharray="5 3" animationDuration={400} />}
            <Line type="monotone" dataKey="base" stroke="#10b981" strokeWidth={2.5} dot={false} animationDuration={400} animationEasing="ease-out" />
            {showRange && <Line type="monotone" dataKey="optimistic" stroke="#6EE7B7" strokeWidth={1.5} dot={false} strokeDasharray="5 3" animationDuration={400} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── SECTION 5: Account Breakdown (collapsed) ──────────────────────── */}
      <div ref={breakdownRef}>
        <button
          onClick={() => setBreakdownOpen(o => !o)}
          aria-expanded={breakdownOpen}
          aria-label="Toggle account breakdown"
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        >
          <span className="text-sm text-gray-600">
            <span className="font-medium">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
            {' · '}{fmtW(totalBalance)} total balance
            {' · '}{fmtW(totalMonthly)}/mo
          </span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium shrink-0 ml-3">
            Edit accounts
            <svg className={`w-4 h-4 transition-transform duration-200 ${breakdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        <div className="grid transition-[grid-template-rows] duration-200 ease-in-out" style={{ gridTemplateRows: breakdownOpen ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className="bg-white rounded-xl border border-gray-100 mt-2 overflow-hidden">
              {!anyBalanceSet && (
                <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100">
                  <p className="text-xs text-amber-600">Enter your current balances for accurate projections</p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Savings account breakdown">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/40">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Account</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">Balance</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">/Month</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">/Year</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">Rate</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">In {horizon}yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => {
                      const displayRate = acc.rateOverride !== null ? acc.rateOverride : defaultRate(acc.category)
                      const badge       = acctTypeBadge(acc.category)
                      const showBadge   = badge !== acc.category && badge.toLowerCase() !== acc.name.toLowerCase()
                      return (
                        <tr key={acc.key} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-medium text-gray-800">{acc.name}</span>
                            {showBadge && (
                              <span className="ml-2 text-[11px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{badge}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <InlineEdit
                              value={acc.balance}
                              prefix="$"
                              isBalance
                              onSave={v => { const nb = { ...balances, [acc.key]: v }; latestStateRef.current = { ...latestStateRef.current, balances: nb }; setBalances(nb) }}
                              className="text-gray-800 font-medium"
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{fmt(acc.monthly)}</td>
                          <td className="px-4 py-3 text-right text-gray-500 tabular-nums text-xs">{fmt(acc.monthly * 12)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1">
                              <InlineEdit
                                value={displayRate}
                                suffix="%"
                                onSave={v => { const nr = { ...rateOverrides, [acc.key]: v }; latestStateRef.current = { ...latestStateRef.current, rateOverrides: nr }; setRateOverrides(nr) }}
                                className={acc.rateOverride !== null ? 'font-semibold text-emerald-600' : 'text-gray-500'}
                              />
                              {acc.rateOverride !== null && (
                                <button
                                  onClick={() => { const nr = { ...rateOverrides }; delete nr[acc.key]; latestStateRef.current = { ...latestStateRef.current, rateOverrides: nr }; setRateOverrides(nr) }}
                                  className="text-gray-300 hover:text-red-400 transition-colors text-xs focus:outline-none"
                                  title="Reset to default"
                                >✕</button>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600 tabular-nums">
                            {fmt(projectAcc(acc, 'base', horizon))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 tabular-nums">{fmt(totalBalance)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 tabular-nums">{fmt(totalMonthly)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-600 tabular-nums">{fmt(totalAnnual)}</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600 tabular-nums">{fmt(projectTotal('base'))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: Savings Goals ──────────────────────────────────────── */}
      <div className="budgli-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800">Savings Goals</p>
          <button
            onClick={() => setShowGoalForm(f => !f)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded"
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1.5">Target Amount</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              onClick={addGoal}
              disabled={!newGoal.name.trim() || !newGoal.target}
              className="px-5 py-2.5 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-[#0b6268] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        )}

        {goals.length === 0 && !showGoalForm && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">No goals yet — set a savings target to see if you're on track.</p>
          </div>
        )}

        <div className="space-y-3">
          {goals.map(goal => {
            const isEditing = editingGoalId === goal.id
            const status    = goalStatus(goal)
            const pct       = Math.min(100, goal.target > 0 ? (totalBalance / goal.target) * 100 : 0)

            if (isEditing) {
              return (
                <div key={goal.id} className="rounded-xl border border-emerald-200 p-4">
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-32">
                      <label className="block text-xs text-gray-500 mb-1.5">Goal Name</label>
                      <input
                        autoFocus
                        type="text"
                        value={goalDraft.name}
                        onChange={e => setGoalDraft(d => ({ ...d, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') commitEditGoal(); if (e.key === 'Escape') setEditingGoalId(null) }}
                        className="w-full border border-emerald-500 rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="w-36">
                      <label className="block text-xs text-gray-500 mb-1.5">Target Amount</label>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
                        <span className="px-2.5 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                        <input
                          type="number"
                          value={goalDraft.target}
                          onChange={e => setGoalDraft(d => ({ ...d, target: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') commitEditGoal(); if (e.key === 'Escape') setEditingGoalId(null) }}
                          className="flex-1 px-2.5 py-2 text-sm outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="w-40">
                      <label className="block text-xs text-gray-500 mb-1.5">Target Date</label>
                      <input
                        type="date"
                        value={goalDraft.targetDate}
                        onChange={e => setGoalDraft(d => ({ ...d, targetDate: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') commitEditGoal(); if (e.key === 'Escape') setEditingGoalId(null) }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={commitEditGoal} className="px-4 py-2 bg-[#0D7377] text-white text-xs font-medium rounded-lg hover:bg-[#0b6268] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C896] focus:ring-offset-2">Save</button>
                      <button onClick={() => setEditingGoalId(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none">Cancel</button>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={goal.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => startEditGoal(goal)}
                      role="button"
                      aria-label={`Edit goal: ${goal.name}`}
                      className="text-sm font-medium text-gray-800 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded"
                    >
                      {goal.name}
                    </button>
                    {status && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GOAL_BADGE[status.state]}`}>
                        {GOAL_LABEL[status.state]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEditGoal(goal)} aria-label={`Edit ${goal.name}`} className="text-gray-300 hover:text-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded" title="Edit">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.914l-3.414.5.5-3.414A4 4 0 019 13z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { const ng = goals.filter(x => x.id !== goal.id); latestStateRef.current = { ...latestStateRef.current, goals: ng }; setGoals(ng) }}
                      aria-label={`Remove goal: ${goal.name}`}
                      className="text-gray-300 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 rounded"
                      title="Remove"
                    >✕</button>
                  </div>
                </div>

                {status?.state !== 'reached' && (
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                )}

                <div className="text-xs text-gray-400 space-y-0.5">
                  {status?.state === 'reached' && <span>Goal complete 🎉</span>}
                  {status?.state === 'expired' && (
                    <span>Deadline passed · {status.expiredDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  )}
                  {(status?.state === 'on-track' || status?.state === 'behind') && (
                    <div>
                      <span>Target: {fmt(goal.target)}</span>
                      {goal.targetDate && <span> · By: {new Date(goal.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                    </div>
                  )}
                  {status?.state === 'behind' && status.required > 0 && (
                    <p className="text-amber-600">Need {fmtW(status.required)}/mo more to stay on track</p>
                  )}
                  {!status && <span>Target: {fmt(goal.target)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SECTION 7: Scenario Range ─────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
          PROJECTION RANGE AT {horizon} YEAR{horizon !== 1 ? 'S' : ''}
        </p>
        <div className="relative mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-visible">
            <div className="absolute inset-0 bg-emerald-200 rounded-full" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow"
              style={{ left: `calc(${baseMarkerPct}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>{fmtK(conservativeVal)} Conservative</span>
            <span className="font-medium">{fmtK(baseProjected)} Base ●</span>
            <span>{fmtK(optimisticVal)} Optimistic</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Projections are estimates only and do not account for taxes, inflation, or market volatility. Past performance does not guarantee future results.
        </p>
      </div>

    </div>
  )
}
