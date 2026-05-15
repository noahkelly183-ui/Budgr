import { useState, useEffect, useRef, Fragment } from 'react'
import { Analytics, track } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { createPortal } from 'react-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { supabase } from './supabase.js'
import { DEMO_TRANSACTIONS, DEMO_FIXED_COSTS, DEMO_SAVINGS_ENTRIES, DEMO_SALARY, DEMO_YEAR } from './data/demoData.js'
import AuthScreen from './components/AuthScreen.jsx'
import EmptyState from './components/EmptyState.jsx'
import SavingsForecastPage from './components/SavingsForecastPage.jsx'
import HelpTip from './components/HelpTip.jsx'
import Privacy from './pages/Privacy.jsx'
import FeedbackPage from './components/FeedbackPage.jsx'
import GoalOnboarding from './components/GoalOnboarding.jsx'
import { TrendingUp, TrendingDown, PiggyBank, Percent, CalendarDays, BarChart3, Wallet, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ReferenceLine, LineChart, Line, PieChart, Pie, ResponsiveContainer } from 'recharts'
import { parseCSV, detectFormat, parseForMapper, normalizeWithMapping } from './utils/csvParsers.js'
import CsvImportPreview from './components/CsvImportPreview.jsx'
import CsvColumnMapper  from './components/CsvColumnMapper.jsx'

const CATEGORIES = [
  'Bars & Nightlife', 'Car Payment / Insurance', 'Clothing', 'Coffee & Drinks',
  'Credit Card Payment', 'Dining Out', 'Education', 'Emergency Fund', 'Entertainment',
  'Fees & Charges', 'Fitness & Gym', 'Fuel',
  'Gifts & Donations', 'Groceries', 'Health & Medical',
  'Hobbies & Sports', 'Home & Garden', 'Insurance',
  'Investments', 'Loan Repayments', 'Personal Care',
  'Phone & Internet', 'Refund / Return', 'Rent / Mortgage', 'RRSP', 'Savings', 'Savings Transfer',
  'Shopping', 'Subscriptions', 'TFSA', 'Transfer / Payment', 'Transit / Rideshare',
  'Travel', 'Utilities', 'Omit',
]

const EXCLUDE_FROM_TOTALS = new Set(['Transfer / Payment', 'Credit Card Payment', 'Omit'])

// Saving categories — lowercase for case-insensitive matching
const SAVING_CATEGORIES = ['investments', 'savings', 'savings transfer', 'rrsp', 'tfsa', 'emergency fund']
const isSaving     = cat => !!cat && SAVING_CATEGORIES.includes(cat.toLowerCase())
const monthlyRate  = entry => entry.frequency === 'annual' ? entry.amount / 12 : entry.amount
const savingCatLabel = cat => {
  const upper = cat.toUpperCase()
  if (upper === 'RRSP' || upper === 'TFSA') return upper
  return cat.replace(/\b\w/g, c => c.toUpperCase())
}

const NOISE = new Set([
  'SQ', 'TST', 'POS', 'THE', 'AND', 'INC', 'LTD', 'CORP', 'CO', 'CANADA', 'CANADIAN',
])
const CITIES = new Set([
  'VICTORIA', 'TORONTO', 'VANCOUVER', 'CALGARY', 'MONTREAL', 'OTTAWA', 'EDMONTON',
  'WINNIPEG', 'HALIFAX', 'KELOWNA', 'NANAIMO', 'SURREY', 'BURNABY', 'RICHMOND',
  'ABBOTSFORD', 'LANGLEY', 'SAANICH', 'SIDNEY', 'BAY',
])

function extractKey(description) {
  const words = description
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length >= 3 && !/^\d+$/.test(w) && !NOISE.has(w) && !CITIES.has(w))
  return words.slice(0, 2).join(' ')
}

const CATEGORY_GROUPS = [
  { name: 'Housing',         hex: '#0D7377', cats: ['Rent / Mortgage', 'Utilities', 'Home & Garden'] },
  { name: 'Transport',       hex: '#F59E0B', cats: ['Car Payment / Insurance', 'Fuel', 'Transit / Rideshare', 'Travel'] },
  { name: 'Food & Drink',    hex: '#22C55E', cats: ['Groceries', 'Dining Out', 'Coffee & Drinks', 'Bars & Nightlife'] },
  { name: 'Lifestyle',       hex: '#A855F7', cats: ['Clothing', 'Entertainment', 'Hobbies & Sports', 'Shopping', 'Personal Care', 'Gifts & Donations'] },
  { name: 'Bills & Finance', hex: '#3B82F6', cats: ['Phone & Internet', 'Subscriptions', 'Insurance', 'Loan Repayments', 'Fees & Charges'] },
  { name: 'Health & Growth', hex: '#EC4899', cats: ['Health & Medical', 'Fitness & Gym', 'Education'] },
  { name: 'Savings',         hex: '#00C896', cats: ['Investments', 'Savings', 'Savings Transfer', 'RRSP', 'TFSA', 'Emergency Fund'] },
]

const CATEGORY_COLOR = Object.fromEntries(
  CATEGORY_GROUPS.flatMap(g => g.cats.map(c => [c, g.hex]))
)
CATEGORY_COLOR['Omit'] = '#9CA3AF'

const CUSTOM_CAT_PALETTE = ['#6366F1','#F97316','#06B6D4','#A855F7','#84CC16','#EC4899','#14B8A6','#EF4444','#8B5CF6','#F59E0B']
function customCatColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return CUSTOM_CAT_PALETTE[Math.abs(h) % CUSTOM_CAT_PALETTE.length]
}

function strSimilarity(a, b) {
  if (a === b) return 1
  const la = a.length, lb = b.length
  if (la === 0 || lb === 0) return 0
  const dp = Array.from({ length: la + 1 }, (_, i) => new Array(lb + 1).fill(0).map((_, j) => j === 0 ? i : 0))
  for (let j = 1; j <= lb; j++) dp[0][j] = j
  for (let i = 1; i <= la; i++)
    for (let j = 1; j <= lb; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return 1 - dp[la][lb] / Math.max(la, lb)
}

const FIXED_CATS = new Set([
  'Rent / Mortgage', 'Utilities', 'Car Payment / Insurance',
  'Phone & Internet', 'Subscriptions', 'Insurance',
  'Loan Repayments',
])

const SAVINGS_CATS = ['Investments', 'RRSP', 'Savings', 'Savings Transfer', 'TFSA']

const MONTHS = [
  { id: '01', label: 'January' },
  { id: '02', label: 'February' },
  { id: '03', label: 'March' },
  { id: '04', label: 'April' },
  { id: '05', label: 'May' },
  { id: '06', label: 'June' },
  { id: '07', label: 'July' },
  { id: '08', label: 'August' },
  { id: '09', label: 'September' },
  { id: '10', label: 'October' },
  { id: '11', label: 'November' },
  { id: '12', label: 'December' },
]

const NAV_SECTIONS = [
  {
    heading: 'DASHBOARDS',
    items: [
      { id: 'get-started',      label: 'Get Started',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'dashboard',        label: 'Monthly Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'annual',           label: 'Annual Summary',    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { id: 'savings-forecast', label: 'Savings Forecast',  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'year-comparison',  label: 'Year Comparison',   icon: 'M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4' },
      { id: 'categories',       label: 'Categories',        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
    ],
  },
  {
    heading: 'MY DATA',
    items: [
      { id: 'salary',       label: 'Income',           icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'fixed',        label: 'Fixed Costs',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'transactions', label: 'Transactions',     icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'savings',      label: 'Savings Accounts', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    ],
  },
]

const NAV_FOOTER_ITEMS = [
  { id: 'settings', label: 'Settings',        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'feedback', label: 'Share feedback',  icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
]

function titleCaseDesc(str) {
  if (!str) return str
  return str.toLowerCase().replace(/\b([a-z])/g, c => c.toUpperCase())
}

function monthOf(date) {
  if (!date) return ''
  const iso = date.match(/^\d{4}-(\d{2})-\d{2}/)
  if (iso) return iso[1]
  const us = date.match(/^(\d{1,2})\/\d{1,2}\/\d{4}/)
  if (us) return us[1].padStart(2, '0')
  return ''
}

const FMT_DATE_OPTS = { month: 'short', day: 'numeric', year: 'numeric' }

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString('en-US', FMT_DATE_OPTS)
  const us = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (us) return new Date(+us[3], +us[1] - 1, +us[2]).toLocaleDateString('en-US', FMT_DATE_OPTS)
  return dateStr
}

const fmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtK = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : n > 0 ? '$' + n.toFixed(0) : ''

const APP_YEAR = '2026'


// Returns "YYYY-MM" from a normalized ISO date — never does partial string matching
function yearMonthOf(isoDate) {
  if (!isoDate) return ''
  const m = isoDate.match(/^(\d{4})-(\d{2})-\d{2}$/)
  return m ? `${m[1]}-${m[2]}` : ''
}

// Returns deduplicated active entries for a given month.
// For each (name, category, isSavings) group, picks the version with the highest
// start_month that is still <= the requested month. Entries with null start_month
// are treated as start_month=1 (effective from the beginning of the year).
function getActiveForMonth(entries, year, month) {
  const m = typeof month === 'string' ? parseInt(month, 10) : month
  const yearEntries = entries.filter(c => !c.year || String(c.year) === String(year))
  const valid = yearEntries.filter(c => (c.start_month ?? 1) <= m)
  const grouped = new Map()
  for (const c of valid) {
    const key = `${c.name}|${c.category}|${c.isSavings ? '1' : '0'}`
    const existing = grouped.get(key)
    if (!existing || (c.start_month ?? 1) >= (existing.start_month ?? 1)) {
      grouped.set(key, c)
    }
  }
  return Array.from(grouped.values())
}

// ─── CategoryCombobox ────────────────────────────────────────────────────────

function CategoryCombobox({ value, onChange, suggestions = [] }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos]     = useState({ top: 0, left: 0, width: 192 })
  const wrapRef           = useRef(null)

  // Previously-used custom categories (not in the built-in list) shown first
  const customOpts = suggestions.filter(s => s && !CATS_SET.has(s))
  const allOpts    = [...customOpts, ...CATEGORIES]
  const filtered   = allOpts.filter(c =>
    !query || c.toLowerCase().includes(query.toLowerCase())
  )

  function handleOpen() {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 192) })
    setOpen(true)
    setQuery('')
  }

  function select(cat) {
    onChange(cat)
    setOpen(false)
    setQuery('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length)   select(filtered[0])
      else if (query.trim()) select(query.trim())
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const hex = value ? CATEGORY_COLOR[value] : null

  return (
    <div ref={wrapRef}>
      {open ? (
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { setOpen(false); setQuery('') }}
          placeholder={value || 'Search…'}
          className="text-xs rounded-full px-3 py-1 outline-none w-40 border border-gray-300 bg-white text-gray-700"
        />
      ) : (
        <button
          onClick={handleOpen}
          className="text-xs rounded-full px-3 py-1 cursor-pointer font-medium whitespace-nowrap"
          style={hex ? {
            backgroundColor: hex + '1a',
            color: hex,
          } : value ? {
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
          } : {
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            border: '1px dashed #FCD34D',
          }}
        >
          {value || '+ tag'}
        </button>
      )}
      {open && createPortal(
        <ul
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto py-1"
        >
          {filtered.map(cat => {
            const isCustom = customOpts.includes(cat)
            return (
              <li key={cat}>
                <button
                  onMouseDown={e => { e.preventDefault(); select(cat) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1.5"
                >
                  {isCustom && <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] shrink-0" />}
                  {cat}
                </button>
              </li>
            )
          })}
          {query.trim() && !allOpts.includes(query.trim()) && (
            <li className="border-t border-gray-100">
              <button
                onMouseDown={e => { e.preventDefault(); select(query.trim()) }}
                className="w-full text-left px-3 py-1.5 text-xs text-teal-600 hover:bg-teal-50"
              >
                Save "{query.trim()}"
              </button>
            </li>
          )}
        </ul>,
        document.body
      )}
    </div>
  )
}

// ─── TransactionView (Transactions page — grouped by month with filter) ───────

function TransactionView({ txns, selectedYear, setCategory, fuzzyPrompt, onFuzzyAccept, onFuzzyDismiss, onImport }) {
  const [filter, setFilter]           = useState('all')
  const [catFilter, setCatFilter]     = useState('')
  const [selectedFuzzyIds, setSelectedFuzzyIds] = useState(() =>
    fuzzyPrompt ? new Set(fuzzyPrompt.matches.map(t => t.id)) : new Set()
  )

  useEffect(() => {
    if (fuzzyPrompt) setSelectedFuzzyIds(new Set(fuzzyPrompt.matches.map(t => t.id)))
  }, [fuzzyPrompt])

  const yearTxns       = selectedYear ? txns.filter(t => t.date?.startsWith(selectedYear)) : txns
  const untaggedCount  = yearTxns.filter(t => !t.category).length
  const manualCount    = yearTxns.filter(t => t.category && !t.fromMemory).length
  const omittedCount   = yearTxns.filter(t => t.category === 'Omit').length
  const highValueCount = yearTxns.filter(t => t.type === 'debit' && t.amount > 200).length
  const availableCats  = [...new Set(yearTxns.map(t => t.category).filter(Boolean))].sort()
  const customCats     = [...new Set(txns.map(t => t.category).filter(c => c && !CATS_SET.has(c)))].sort()

  function setF(f) { setFilter(f); if (f !== 'category') setCatFilter('') }

  const filtered =
    filter === 'untagged'                      ? yearTxns.filter(t => !t.category) :
    filter === 'manual'                        ? yearTxns.filter(t => t.category && !t.fromMemory) :
    filter === 'omitted'                       ? yearTxns.filter(t => t.category === 'Omit') :
    filter === 'highvalue'                     ? yearTxns.filter(t => t.type === 'debit' && t.amount > 200) :
    filter === 'category' && catFilter         ? yearTxns.filter(t => t.category === catFilter) :
    yearTxns

  const groupMap = new Map()
  for (const t of filtered) {
    const ym = yearMonthOf(t.date) || 'unknown'
    if (!groupMap.has(ym)) groupMap.set(ym, [])
    groupMap.get(ym).push(t)
  }
  const groups = [...groupMap.entries()].map(([ym, txns]) => ({ ym, txns }))

  const debits       = yearTxns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const refunds      = yearTxns.filter(t => t.category === 'Refund / Return')
  const total        = debits.reduce((sum, t) => sum + t.amount, 0)
  const totalRefunds = refunds.reduce((sum, t) => sum + t.amount, 0)

  function groupLabel(ym) {
    if (ym === 'unknown') return 'Unknown Date'
    const [year, month] = ym.split('-')
    return `${MONTHS.find(m => m.id === month)?.label || ym} ${year}`
  }

  const COLS = '96px 1fr 120px 180px'

  return (
    <div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">

          <button onClick={() => setF('all')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
            All
          </button>

          <button onClick={() => setF('untagged')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'untagged' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
            Untagged
            {untaggedCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${filter === 'untagged' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{untaggedCount}</span>}
          </button>

          <button onClick={() => setF('manual')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'manual' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
            Manually Tagged
            {manualCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${filter === 'manual' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{manualCount}</span>}
          </button>

          <button onClick={() => setF('omitted')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'omitted' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
            Omitted
            {omittedCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${filter === 'omitted' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{omittedCount}</span>}
          </button>

          <button onClick={() => setF('highvalue')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'highvalue' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
            High Value
            {highValueCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${filter === 'highvalue' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{highValueCount}</span>}
          </button>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setF('category')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'category' ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'}`}>
              Category ▾
            </button>
            {filter === 'category' && (
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-[#00C896]"
              >
                <option value="">— pick one —</option>
                {availableCats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

        </div>

        {/* Fuzzy match prompt */}
        {fuzzyPrompt && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-indigo-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-indigo-500 text-base shrink-0">✦</span>
                <p className="text-xs text-indigo-700">
                  Apply <span className="font-semibold">"{fuzzyPrompt.category}"</span> to similar untagged transactions?
                </p>
              </div>
              <button onClick={onFuzzyDismiss} className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors shrink-0">
                Dismiss
              </button>
            </div>

            {/* Selectable transaction list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-indigo-50">
              {fuzzyPrompt.matches.map(t => (
                <label key={t.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-indigo-100/60">
                  <input
                    type="checkbox"
                    checked={selectedFuzzyIds.has(t.id)}
                    onChange={() => setSelectedFuzzyIds(prev => {
                      const next = new Set(prev)
                      next.has(t.id) ? next.delete(t.id) : next.add(t.id)
                      return next
                    })}
                    className="accent-indigo-600 shrink-0"
                  />
                  <span className="flex-1 text-xs text-gray-700 truncate">{t.description}</span>
                  <span className="text-xs text-gray-400 tabular-nums shrink-0 hidden sm:block">{fmtDate(t.date)}</span>
                  <span className={`text-xs font-medium tabular-nums shrink-0 ${t.type === 'credit' ? 'text-[#00C896]' : 'text-gray-700'}`}>
                    {t.type === 'credit' ? '+' : ''}{fmt(t.amount)}
                  </span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-indigo-100">
              <p className="text-xs text-indigo-400">{selectedFuzzyIds.size} of {fuzzyPrompt.matches.length} selected</p>
              <button
                onClick={() => onFuzzyAccept([...selectedFuzzyIds])}
                disabled={selectedFuzzyIds.size === 0}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply to {selectedFuzzyIds.size} transaction{selectedFuzzyIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Transaction list */}
        <div>
          {/* Column headers — desktop only */}
          <div
            className="hidden md:grid bg-white border border-gray-100 rounded-t-xl px-4 py-3"
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8896B0]">Date</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8896B0]">Description</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8896B0] text-right pr-2">Amount</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8896B0]">Category</span>
          </div>

          {groups.length === 0 ? (
            filter === 'all' ? (
              <div className="border border-gray-100 md:border-t-0 rounded-xl md:rounded-t-none md:rounded-b-xl overflow-hidden">
                <EmptyState
                  icon="🏦"
                  title="No transactions yet"
                  description="Import a CSV from your bank to start tracking your income and spending."
                  actionLabel="Import CSV"
                  onAction={onImport}
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-100 md:border-t-0 rounded-xl md:rounded-t-none md:rounded-b-xl px-4 py-8 text-center text-gray-400 text-xs">
                {filter === 'untagged'   ? 'All transactions are tagged!' :
                 filter === 'manual'     ? 'No manually tagged transactions yet' :
                 filter === 'omitted'    ? 'No omitted transactions' :
                 filter === 'highvalue'  ? 'No transactions over $200' :
                 filter === 'category'   ? (catFilter ? `No transactions in "${catFilter}"` : 'Pick a category above') :
                 'No transactions found'}
              </div>
            )
          ) : groups.map((group, gi) => {
            const groupDebits = group.txns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
            const groupSpend  = groupDebits.reduce((s, t) => s + t.amount, 0)
            const isLast      = gi === groups.length - 1
            return (
              <div key={group.ym}>
                {/* Month header */}
                <div className="flex items-center justify-between px-4 py-2.5 border border-gray-100 md:border-x md:border-y-0 md:border-t md:border-b-0 bg-gray-50 mt-2 md:mt-0 rounded-t-xl md:rounded-none">
                  <span className="text-gray-700 text-xs font-semibold tracking-wide">{groupLabel(group.ym)}</span>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <span>{group.txns.length} transaction{group.txns.length !== 1 ? 's' : ''}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-gray-600">{fmt(groupSpend)}</span>
                  </div>
                </div>

                {/* Mobile card rows */}
                <div className={`md:hidden border border-t-0 border-gray-100 ${isLast ? 'rounded-b-xl' : ''}`}>
                  {group.txns.map(t => (
                    <div key={t.id} className="px-4 py-3 border-b border-gray-50 last:border-b-0 bg-white">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {t.fromMemory && <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: '#00C896' }} />}
                          <span className="text-sm text-gray-700 leading-snug">{titleCaseDesc(t.description)}</span>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums shrink-0 ${t.type === 'credit' ? 'text-[#00C896]' : 'text-gray-800'}`}>
                          {t.type === 'credit' ? '↑ ' : ''}{fmt(t.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
                        <CategoryCombobox value={t.category} onChange={cat => setCategory(t.id, cat)} suggestions={customCats} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop grid rows */}
                <div className={`hidden md:block border-x border-gray-100 ${isLast ? 'border-b rounded-b-xl' : ''}`}>
                  {group.txns.map((t, i) => (
                    <div
                      key={t.id}
                      className={`grid items-center px-4 py-2.5 border-b border-gray-50 last:border-b-0 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                      }`}
                      style={{ gridTemplateColumns: COLS }}
                    >
                      <span className="text-gray-500 text-xs whitespace-nowrap">{fmtDate(t.date)}</span>
                      <span className="text-gray-700 text-sm pr-3 min-w-0 truncate">{titleCaseDesc(t.description)}</span>
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
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#00C896' }} title="Auto-categorized from memory" />
                        )}
                        <CategoryCombobox value={t.category} onChange={cat => setCategory(t.id, cat)} suggestions={customCats} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

    </div>
  )
}

// ─── CatIcon — shared category SVG icon ──────────────────────────────────────

function CatIcon({ name, hex, size = 'w-4 h-4' }) {
  const s  = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.8, className: `${size} shrink-0`, style: { color: hex } }
  const lp = { strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'Housing')           return <svg {...s}><path {...lp} d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
  if (name === 'Transport')         return <svg {...s}><path {...lp} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path {...lp} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
  if (name === 'Food & Drink')      return <svg {...s}><path {...lp} d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/><path {...lp} d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/></svg>
  if (name === 'Lifestyle')         return <svg {...s}><path {...lp} d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm5.625 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z"/></svg>
  if (name === 'Bills & Finance')   return <svg {...s}><path {...lp} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"/></svg>
  if (name === 'Health & Growth')   return <svg {...s}><path {...lp} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
  if (name === 'Fixed Costs')       return <svg {...s}><path {...lp} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5"/></svg>
  if (name === 'Savings')           return <svg {...s}><path {...lp} d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941"/></svg>
  if (name === 'Custom Tags')       return <svg {...s}><path {...lp} d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path {...lp} d="M6 6h.008v.008H6V6Z"/></svg>
  if (name === 'Custom Categories') return <svg {...s}><path {...lp} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
  return <svg {...s}><path {...lp} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z"/></svg>
}

// ─── CategoriesPage ──────────────────────────────────────────────────────────

const CATS_SET = new Set(CATEGORIES)

function CategoriesPage({ transactions, fixedCosts, savingsEntries, selectedYear, customTags, onTagCategory, onUntagCategory, onNavigate }) {
  const [editingTag, setEditingTag] = useState(null)
  const [tagInput, setTagInput]     = useState('')

  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === selectedYear
  )
  const monthsWithData = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  const fixedCostItems    = fixedCosts.filter(c => !isSaving(c.category))
  const fixedMonthlyTotal = fixedCostItems.reduce((s, c) => s + monthlyRate(c), 0)
  const fixedYTD          = fixedMonthlyTotal * monthsWithData

  const variableDebitsAnn = allDebitsAnn.filter(t => !isSaving(t.category))
  const varByCategory = {}
  for (const t of variableDebitsAnn) {
    const cat = t.category || 'Uncategorized'
    varByCategory[cat] = (varByCategory[cat] || 0) + t.amount
  }

  const spendingGroups = CATEGORY_GROUPS.filter(g => g.name !== 'Savings').map(group => {
    const entries = group.cats
      .filter(cat => varByCategory[cat] > 0)
      .map(cat => [cat, varByCategory[cat]])
      .sort(([, a], [, b]) => b - a)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    return { ...group, entries, total }
  }).filter(g => g.total > 0)

  const customEntries = Object.entries(varByCategory)
    .filter(([cat]) => !CATS_SET.has(cat))
    .sort(([, a], [, b]) => b - a)
  const customTotal = customEntries.reduce((s, [, v]) => s + v, 0)

  const savingsByCategory = {}
  for (const e of savingsEntries) {
    savingsByCategory[e.category] = (savingsByCategory[e.category] || 0) + monthlyRate(e)
  }
  const savingsCatEntries = Object.entries(savingsByCategory)
    .map(([cat, monthly]) => [cat, monthly * monthsWithData])
    .sort(([, a], [, b]) => b - a)
  const savingsYTD = savingsCatEntries.reduce((s, [, v]) => s + v, 0)

  // Custom Tags card — group tagged categories by tag name
  const tagFor = cat => customTags.find(t => t.category === cat)?.tag
  const tagGroupMap = {}
  for (const { category, tag } of customTags) {
    if (!tagGroupMap[tag]) tagGroupMap[tag] = []
    tagGroupMap[tag].push(category)
  }
  const customTagGroups = Object.entries(tagGroupMap)
    .map(([tag, cats]) => ({
      tag,
      items: cats.map(cat => [cat, varByCategory[cat] || 0]).sort(([, a], [, b]) => b - a),
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag))
  const customTagsTotal = customTagGroups.reduce((s, g) => s + g.items.reduce((ss, [, v]) => ss + v, 0), 0)

  function commitTag(category) {
    const trimmed = tagInput.trim()
    if (trimmed) onTagCategory(category, trimmed)
    setEditingTag(null)
    setTagInput('')
  }

  // Build the card list: fixed costs + spending groups + custom tags + custom categories + savings
  const noTxns = monthsWithData === 0
  const cards = [
    {
      name: 'Fixed Costs',
      hex: '#6B7280',
      items: fixedCostItems.map(c => [c.name, noTxns ? monthlyRate(c) : monthlyRate(c) * monthsWithData]),
      total: noTxns ? fixedMonthlyTotal : fixedYTD,
      totalLabel: noTxns ? '/mo' : 'YTD',
      emptyMsg: 'No fixed costs entered',
    },
    ...spendingGroups.map(g => ({
      name: g.name,
      hex: g.hex,
      items: g.entries,
      total: g.total,
      taggable: true,
    })),
    ...(customTagGroups.length > 0 ? [{
      name: 'Custom Tags',
      hex: '#8B5CF6',
      groups: customTagGroups,
      total: customTagsTotal,
    }] : []),
    ...(customEntries.length > 0 ? [{
      name: 'Custom Categories',
      hex: '#8B5CF6',
      items: customEntries,
      total: customTotal,
      taggable: true,
    }] : []),
    {
      name: 'Savings',
      hex: '#00C896',
      items: noTxns
        ? Object.entries(savingsByCategory).map(([cat, monthly]) => [cat, monthly]).sort(([,a],[,b]) => b - a)
        : savingsCatEntries,
      total: noTxns ? Object.values(savingsByCategory).reduce((s, v) => s + v, 0) : savingsYTD,
      totalLabel: noTxns ? '/mo' : 'YTD',
      emptyMsg: 'No savings entries',
      accent: true,
    },
  ]

  const hasAnyData = spendingGroups.length > 0 || customEntries.length > 0 || fixedCostItems.length > 0 || savingsCatEntries.length > 0

  if (!hasAnyData) {
    return (
      <EmptyState
        icon="🏷️"
        title="No categories yet"
        description="Import transactions to see your spending broken down by category, or add fixed costs to start tracking recurring expenses."
        actionLabel="Import Transactions"
        onAction={() => onNavigate('transactions')}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-gray-800">Categories — {selectedYear} {noTxns ? '' : 'YTD'}</p>
        {monthsWithData > 0
          ? <span className="text-xs text-gray-400">({monthsWithData} mo)</span>
          : <span className="text-xs text-gray-400">— showing monthly rates (no transactions yet)</span>
        }
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.name} className="budgli-card rounded-xl p-5 flex flex-col">

            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: card.hex + '22' }}>
                  <CatIcon name={card.name} hex={card.hex} />
                </span>
                <p className="text-sm font-semibold text-gray-800">{card.name}</p>
              </div>
              <span className="text-[11px] text-gray-400">
                {card.groups
                  ? `${customTags.length} tagged`
                  : `${card.items.length} ${card.items.length === 1 ? 'item' : 'items'}`}
              </span>
            </div>

            {/* Category rows */}
            <div className="space-y-3 flex-1">
              {card.groups ? (
                // Custom Tags card — grouped by tag name
                card.groups.length > 0 ? card.groups.map(({ tag, items }) => (
                  <div key={tag}>
                    <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">{tag}</p>
                    {items.map(([label, amt]) => {
                      const pct = card.total > 0 ? (amt / card.total) * 100 : 0
                      return (
                        <div key={label} className="mb-2 last:mb-0">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                              <span className="text-gray-600 truncate">{label}</span>
                              <button
                                type="button"
                                onClick={() => onUntagCategory(label)}
                                className="text-[10px] text-purple-300 hover:text-red-400 transition-colors shrink-0"
                                title="Remove tag"
                              >×</button>
                            </div>
                            <span className="tabular-nums font-medium shrink-0 text-gray-800">{fmt(amt)}</span>
                          </div>
                          <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: card.hex }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )) : (
                  <p className="text-xs italic text-gray-400">No tagged categories yet</p>
                )
              ) : card.items.length > 0 ? card.items.map(([label, amt]) => {
                const pct = card.total > 0 ? (amt / card.total) * 100 : 0
                const existingTag = card.taggable ? tagFor(label) : null
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                        <span className="text-gray-600 truncate">{label}</span>
                        {card.taggable && (
                          editingTag === label ? (
                            <form
                              onSubmit={e => { e.preventDefault(); commitTag(label) }}
                              className="flex items-center gap-1 shrink-0"
                            >
                              <input
                                autoFocus
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onBlur={() => commitTag(label)}
                                className="text-[10px] border border-purple-300 rounded px-1.5 py-0.5 w-20 outline-none focus:border-purple-500"
                                placeholder="tag name"
                              />
                            </form>
                          ) : existingTag ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full shrink-0">
                              {existingTag}
                              <button
                                type="button"
                                onClick={() => onUntagCategory(label)}
                                className="ml-0.5 text-purple-400 hover:text-purple-700 leading-none"
                              >×</button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setEditingTag(label); setTagInput('') }}
                              className="text-[10px] text-gray-300 hover:text-purple-400 transition-colors shrink-0"
                              title="Add tag"
                            >+ tag</button>
                          )
                        )}
                      </div>
                      <span className={`tabular-nums font-medium shrink-0 ${card.accent ? 'text-[#00C896]' : 'text-gray-800'}`}>
                        {fmt(amt)}
                      </span>
                    </div>
                    <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: card.hex }} />
                    </div>
                  </div>
                )
              }) : (
                <p className="text-xs italic text-gray-400">{card.emptyMsg || 'No data'}</p>
              )}
            </div>

            {/* Card footer */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-400">Total {card.totalLabel || 'YTD'}</span>
              <span className={`text-sm font-semibold tabular-nums ${card.accent ? 'text-[#00C896]' : 'text-gray-900'}`}>
                {card.total > 0 ? fmt(card.total) : '—'}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FixedCostsPage ───────────────────────────────────────────────────────────

function FixedCostsPage({ fixedCosts, selectedYear, selectedMonth, onAdd, onUpdate, onDelete }) {
  const nameInputRef = useRef(null)
  const [name, setName]               = useState('')
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState('')
  const [customCatInput, setCustomCatInput] = useState('')
  const [frequency, setFrequency]     = useState('monthly')
  const [freqFilter, setFreqFilter]   = useState('all')
  const [localVals, setLocalVals]         = useState({})
  const [customCatById, setCustomCatById] = useState({})
  const [editingCustomCatId, setEditingCustomCatId] = useState(null)

  const isCustomCat = cat => !!cat && !CATEGORIES.includes(cat)
  const addCat = category === '__custom__' ? customCatInput.trim() : category

  function getLocal(id, field, fallback) {
    return localVals[id]?.[field] ?? fallback
  }
  function setLocal(id, field, val) {
    setLocalVals(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))
  }
  function fmtAmt(n) { return Number(n).toLocaleString('en-US') }
  function commitText(cost, field) {
    const val = getLocal(cost.id, field, field === 'name' ? cost.name : fmtAmt(cost.amount))
    if (field === 'name') {
      if (!val.trim() || val.trim() === cost.name) return
      onUpdate(cost.id, { name: val.trim(), amount: cost.amount, category: cost.category, frequency: cost.frequency ?? 'monthly' })
    } else {
      const parsed = parseFloat(String(val).replace(/,/g, ''))
      setLocal(cost.id, 'amount', parsed > 0 ? fmtAmt(parsed) : fmtAmt(cost.amount))
      if (!parsed || parsed === cost.amount) return
      onUpdate(cost.id, { name: cost.name, amount: parsed, category: cost.category, frequency: cost.frequency ?? 'monthly' }, selectedMonth)
    }
  }
  function commitSelect(cost, field, val) {
    onUpdate(cost.id, { name: cost.name, amount: cost.amount, category: cost.category, frequency: cost.frequency ?? 'monthly', [field]: val })
  }

  function handleAdd() {
    const parsed = parseFloat(amount)
    if (!name.trim() || !parsed || !addCat) return
    onAdd({ name: name.trim(), amount: parsed, category: addCat, frequency })
    setName(''); setAmount(''); setCategory(''); setCustomCatInput(''); setFrequency('monthly')
  }

  const filtered     = freqFilter === 'all' ? fixedCosts : fixedCosts.filter(c => (c.frequency ?? 'monthly') === freqFilter)
  const monthlyTotal = fixedCosts.reduce((s, c) => s + monthlyRate(c), 0)

  const addInput  = 'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors w-full'
  const addSelect = addInput + ' bg-white'

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start">
    <div className="flex-1 min-w-0 space-y-5">

      <div className="budgli-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Add Fixed Cost</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:items-end">
          <div className="col-span-2 sm:flex-1 sm:min-w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Name</label>
            <input ref={nameInputRef} type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="e.g. Rent" className={addInput} />
          </div>
          <div className="sm:w-36">
            <label className="block text-xs text-gray-500 mb-1.5">Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} className={addSelect}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="sm:w-36">
            <label className="block text-xs text-gray-500 mb-1.5">Amount ({frequency === 'annual' ? 'per year' : 'per month'})</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
              <span className="px-2.5 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="0"
                className="flex-1 px-2.5 py-2 text-sm text-gray-800 outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>
          <div className="col-span-2 sm:w-48">
            <label className="block text-xs text-gray-500 mb-1.5">Category</label>
            {category === '__custom__' ? (
              <input autoFocus type="text" value={customCatInput} onChange={e => setCustomCatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Type category name…" className={addInput} />
            ) : (
              <select value={category} onChange={e => setCategory(e.target.value)} className={addSelect}>
                <option value="">Select category…</option>
                {CATEGORIES.filter(c => !EXCLUDE_FROM_TOTALS.has(c) && c !== 'Refund / Return' && !SAVINGS_CATS.includes(c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
            )}
          </div>
          <button onClick={handleAdd} disabled={!name.trim() || !amount || !addCat}
            className="col-span-2 sm:col-auto w-full sm:w-auto px-4 py-2 bg-[#1A1F2E] hover:bg-[#2d3748] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Add
          </button>
        </div>
      </div>

      {fixedCosts.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No fixed costs yet"
          description="Add recurring expenses like rent, subscriptions, or insurance to track them across your monthly and annual summaries."
          actionLabel="Add a fixed cost"
          onAction={() => nameInputRef.current?.focus()}
        />
      ) : (
        <div className="budgli-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] shrink-0" style={{ color: '#8896B0' }}>Fixed Costs</p>
            <div className="flex items-center gap-1">
              {['all', 'monthly', 'annual'].map(f => (
                <button key={f} onClick={() => setFreqFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${freqFilter === f ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 shrink-0">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          <div>
          {filtered.map(cost => {
            const isAnnual = (cost.frequency ?? 'monthly') === 'annual'
            const localAmt = getLocal(cost.id, 'amount', fmtAmt(cost.amount))
            const localCat = getLocal(cost.id, 'category', cost.category)
            const hex = CATEGORY_COLOR[localCat] || '#9CA3AF'
            return (
              <div key={cost.id} className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3 px-4 py-3 border-b border-gray-50 last:border-0">

                <input
                  type="text"
                  value={getLocal(cost.id, 'name', cost.name)}
                  onChange={e => setLocal(cost.id, 'name', e.target.value)}
                  onBlur={() => commitText(cost, 'name')}
                  onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  className="w-full sm:flex-1 text-sm text-gray-700 bg-transparent border border-transparent rounded-lg px-2 py-1 outline-none hover:border-gray-200 focus:border-[#00C896] focus:bg-white transition-all min-w-0"
                />

                <select
                  value={getLocal(cost.id, 'frequency', cost.frequency ?? 'monthly')}
                  onChange={e => { setLocal(cost.id, 'frequency', e.target.value); commitSelect(cost, 'frequency', e.target.value) }}
                  className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 border border-transparent outline-none cursor-pointer transition-all hover:border-gray-200"
                  style={{ backgroundColor: isAnnual ? '#FEF3C7' : '#F3F4F6', color: isAnnual ? '#D97706' : '#6B7280' }}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>

                <div className="flex items-center gap-1 shrink-0 w-24 sm:w-28 justify-end">
                  <span className="text-xs text-gray-400">$</span>
                  <input
                    type="text"
                    value={localAmt}
                    onChange={e => setLocal(cost.id, 'amount', e.target.value)}
                    onBlur={() => commitText(cost, 'amount')}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    className="w-20 text-sm font-semibold text-gray-800 tabular-nums text-right bg-transparent border border-transparent rounded-lg px-1.5 py-1 outline-none hover:border-gray-200 focus:border-[#00C896] focus:bg-white transition-all"
                  />
                  {isAnnual && <span className="text-[10px] text-gray-400">/yr</span>}
                </div>

                {localCat === '__custom__' ? (
                  <input
                    autoFocus
                    value={customCatById[cost.id] ?? ''}
                    onChange={e => setCustomCatById(p => ({ ...p, [cost.id]: e.target.value }))}
                    onBlur={() => {
                      const val = customCatById[cost.id]?.trim()
                      if (val) { setLocal(cost.id, 'category', val); commitSelect(cost, 'category', val) }
                      else setLocal(cost.id, 'category', cost.category)
                    }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 outline-none focus:border-[#00C896] bg-white text-gray-700 w-32 shrink-0"
                    placeholder="Category…"
                  />
                ) : isCustomCat(localCat) ? (
                  editingCustomCatId === cost.id ? (
                    <input
                      autoFocus
                      value={customCatById[cost.id] ?? localCat}
                      onChange={e => setCustomCatById(p => ({ ...p, [cost.id]: e.target.value }))}
                      onBlur={() => {
                        const val = (customCatById[cost.id] ?? localCat)?.trim()
                        if (val) { setLocal(cost.id, 'category', val); commitSelect(cost, 'category', val) }
                        setEditingCustomCatId(null)
                      }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 outline-none focus:border-[#00C896] bg-white text-gray-700 w-32 shrink-0"
                      placeholder="Category…"
                    />
                  ) : (() => {
                    const chex = customCatColor(localCat)
                    return (
                      <button
                        onClick={() => { setEditingCustomCatId(cost.id); setCustomCatById(p => ({ ...p, [cost.id]: localCat })) }}
                        className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 cursor-pointer"
                        style={{ backgroundColor: chex + '1a', color: chex }}
                        title="Click to edit"
                      >{localCat}</button>
                    )
                  })()
                ) : (
                  <div className="relative shrink-0" style={{ backgroundColor: hex + '1a', borderRadius: '9999px' }}>
                    <select
                      value={localCat}
                      onChange={e => {
                        const val = e.target.value
                        setLocal(cost.id, 'category', val)
                        if (val === '__custom__') setCustomCatById(p => ({ ...p, [cost.id]: '' }))
                        else commitSelect(cost, 'category', val)
                      }}
                      className="text-xs font-medium pl-2.5 pr-5 py-0.5 rounded-full border-none outline-none cursor-pointer bg-transparent appearance-none"
                      style={{ color: hex }}>
                      {CATEGORIES.filter(c => !EXCLUDE_FROM_TOTALS.has(c) && c !== 'Refund / Return' && !SAVINGS_CATS.includes(c)).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">Custom…</option>
                    </select>
                    <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5" style={{ color: hex }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                )}

                <button onClick={() => onDelete(cost.id)} className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0" title="Remove">✕</button>
              </div>
            )
          })}
          </div>

          <div className="px-5 py-3 bg-gray-50/60 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Monthly total · <span className="text-gray-400">{selectedYear} projection: {fmt(monthlyTotal * 12)}</span></span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(monthlyTotal)}</span>
          </div>
        </div>
      )}

    </div>

      {/* Fixed Costs info card */}
      <div className="w-full md:w-64 md:shrink-0">
        <div className="budgli-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">What to enter here</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Fixed costs are recurring expenses that remain relatively constant month to month — committed costs that exist regardless of your daily spending habits.
          </p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Examples</p>
          <ul className="space-y-1.5 mb-4">
            {[
              'Rent or mortgage payments',
              'Loan and debt repayments',
              'Insurance premiums',
              'Subscriptions and memberships',
              'Utilities with fixed billing',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              Only enter costs not already captured in your imported transaction data to avoid double-counting.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── SavingsPage ─────────────────────────────────────────────────────────────

function SavingsPage({ savingsEntries, selectedYear, selectedMonth, onAdd, onUpdate, onDelete }) {
  const [name, setName]               = useState('')
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState('')
  const [customCatInput, setCustomCatInput] = useState('')
  const [frequency, setFrequency]     = useState('monthly')
  const [freqFilter, setFreqFilter]   = useState('all')
  const [localVals, setLocalVals]         = useState({})
  const [customCatById, setCustomCatById] = useState({})
  const [editingCustomCatId, setEditingCustomCatId] = useState(null)

  const isCustomCat = cat => !!cat && !SAVINGS_CATS.includes(cat)
  const addCat = category === '__custom__' ? customCatInput.trim() : category

  function handleAdd() {
    const parsed = parseFloat(amount)
    if (!name.trim() || !parsed || !addCat) return
    onAdd({ name: name.trim(), amount: parsed, category: addCat, frequency })
    setName(''); setAmount(''); setCategory(''); setCustomCatInput(''); setFrequency('monthly')
  }

  const filtered     = freqFilter === 'all' ? savingsEntries : savingsEntries.filter(e => (e.frequency ?? 'monthly') === freqFilter)
  const monthlyTotal = savingsEntries.reduce((s, e) => s + monthlyRate(e), 0)

  function getLocal(id, field, fallback) {
    return localVals[id]?.[field] ?? fallback
  }
  function setLocal(id, field, val) {
    setLocalVals(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }))
  }
  function fmtAmt(n) { return Number(n).toLocaleString('en-US') }
  function commitText(entry, field) {
    const val = getLocal(entry.id, field, field === 'name' ? entry.name : fmtAmt(entry.amount))
    if (field === 'name') {
      if (!val.trim() || val.trim() === entry.name) return
      onUpdate(entry.id, { name: val.trim(), amount: entry.amount, category: entry.category, frequency: entry.frequency ?? 'monthly' })
    } else {
      const parsed = parseFloat(String(val).replace(/,/g, ''))
      setLocal(entry.id, 'amount', parsed > 0 ? fmtAmt(parsed) : fmtAmt(entry.amount))
      if (!parsed || parsed === entry.amount) return
      onUpdate(entry.id, { name: entry.name, amount: parsed, category: entry.category, frequency: entry.frequency ?? 'monthly' }, selectedMonth)
    }
  }
  function commitSelect(entry, field, val) {
    onUpdate(entry.id, { name: entry.name, amount: entry.amount, category: entry.category, frequency: entry.frequency ?? 'monthly', [field]: val })
  }

  const addInput  = 'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors w-full'
  const addSelect = addInput + ' bg-white'

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start">
    <div className="flex-1 min-w-0 space-y-5">

      <div className="budgli-card rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Add Savings Allocation</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:items-end">
          <div className="col-span-2 sm:flex-1 sm:min-w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="e.g. RRSP contribution" className={addInput} />
          </div>
          <div className="sm:w-36">
            <label className="block text-xs text-gray-500 mb-1.5">Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} className={addSelect}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="sm:w-36">
            <label className="block text-xs text-gray-500 mb-1.5">Amount ({frequency === 'annual' ? 'per year' : 'per month'})</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
              <span className="px-2.5 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="0"
                className="flex-1 px-2.5 py-2 text-sm text-gray-800 outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>
          <div className="col-span-2 sm:w-48">
            <label className="block text-xs text-gray-500 mb-1.5">Type</label>
            {category === '__custom__' ? (
              <input autoFocus type="text" value={customCatInput} onChange={e => setCustomCatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Type savings type…" className={addInput} />
            ) : (
              <select value={category} onChange={e => setCategory(e.target.value)} className={addSelect}>
                <option value="">Select type…</option>
                {SAVINGS_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Custom…</option>
              </select>
            )}
          </div>
          <button onClick={handleAdd} disabled={!name.trim() || !amount || !addCat}
            className="col-span-2 sm:col-auto w-full sm:w-auto px-4 py-2 bg-[#1A1F2E] hover:bg-[#2d3748] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">These numbers stay in your account. Budgli does not connect to your bank.</p>
      </div>

      {savingsEntries.length === 0 ? (
        <div className="budgli-card rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">No savings allocations yet — add your first above</p>
          <p className="text-xs text-gray-300 mt-1">Track where your savings go each month (RRSP, TFSA, investments, etc.)</p>
        </div>
      ) : (
        <div className="budgli-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] shrink-0" style={{ color: '#8896B0' }}>Savings Allocations</p>
            <div className="flex items-center gap-1">
              {['all', 'monthly', 'annual'].map(f => (
                <button key={f} onClick={() => setFreqFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${freqFilter === f ? 'bg-[#1A1F2E] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 shrink-0">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          <div>
          {filtered.map(entry => {
            const isAnnual = (entry.frequency ?? 'monthly') === 'annual'
            const localAmt = getLocal(entry.id, 'amount', fmtAmt(entry.amount))
            const localCat = getLocal(entry.id, 'category', entry.category)
            const hex = CATEGORY_COLOR[localCat] || '#00C896'
            return (
              <div key={entry.id} className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3 px-4 py-3 border-b border-gray-50 last:border-0">

                <input
                  type="text"
                  value={getLocal(entry.id, 'name', entry.name)}
                  onChange={e => setLocal(entry.id, 'name', e.target.value)}
                  onBlur={() => commitText(entry, 'name')}
                  onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                  className="w-full sm:flex-1 text-sm text-gray-700 bg-transparent border border-transparent rounded-lg px-2 py-1 outline-none hover:border-gray-200 focus:border-[#00C896] focus:bg-white transition-all min-w-0"
                />

                <select
                  value={getLocal(entry.id, 'frequency', entry.frequency ?? 'monthly')}
                  onChange={e => { setLocal(entry.id, 'frequency', e.target.value); commitSelect(entry, 'frequency', e.target.value) }}
                  className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 border border-transparent outline-none cursor-pointer transition-all hover:border-gray-200"
                  style={{ backgroundColor: isAnnual ? '#FEF3C7' : '#F3F4F6', color: isAnnual ? '#D97706' : '#6B7280' }}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>

                <div className="flex items-center gap-1 shrink-0 w-24 sm:w-28 justify-end">
                  <span className="text-xs text-gray-400">$</span>
                  <input
                    type="text"
                    value={localAmt}
                    onChange={e => setLocal(entry.id, 'amount', e.target.value)}
                    onBlur={() => commitText(entry, 'amount')}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    className="w-20 text-sm font-semibold text-[#00C896] tabular-nums text-right bg-transparent border border-transparent rounded-lg px-1.5 py-1 outline-none hover:border-gray-200 focus:border-[#00C896] focus:bg-white transition-all"
                  />
                  {isAnnual && <span className="text-[10px] text-gray-400">/yr</span>}
                </div>

                {localCat === '__custom__' ? (
                  <input
                    autoFocus
                    value={customCatById[entry.id] ?? ''}
                    onChange={e => setCustomCatById(p => ({ ...p, [entry.id]: e.target.value }))}
                    onBlur={() => {
                      const val = customCatById[entry.id]?.trim()
                      if (val) { setLocal(entry.id, 'category', val); commitSelect(entry, 'category', val) }
                      else setLocal(entry.id, 'category', entry.category)
                    }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 outline-none focus:border-[#00C896] bg-white text-gray-700 w-32 shrink-0"
                    placeholder="Type…"
                  />
                ) : isCustomCat(localCat) ? (
                  editingCustomCatId === entry.id ? (
                    <input
                      autoFocus
                      value={customCatById[entry.id] ?? localCat}
                      onChange={e => setCustomCatById(p => ({ ...p, [entry.id]: e.target.value }))}
                      onBlur={() => {
                        const val = (customCatById[entry.id] ?? localCat)?.trim()
                        if (val) { setLocal(entry.id, 'category', val); commitSelect(entry, 'category', val) }
                        setEditingCustomCatId(null)
                      }}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200 outline-none focus:border-[#00C896] bg-white text-gray-700 w-32 shrink-0"
                      placeholder="Type…"
                    />
                  ) : (() => {
                    const chex = customCatColor(localCat)
                    return (
                      <button
                        onClick={() => { setEditingCustomCatId(entry.id); setCustomCatById(p => ({ ...p, [entry.id]: localCat })) }}
                        className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 cursor-pointer"
                        style={{ backgroundColor: chex + '1a', color: chex }}
                        title="Click to edit"
                      >{localCat}</button>
                    )
                  })()
                ) : (
                  <div className="relative shrink-0" style={{ backgroundColor: hex + '1a', borderRadius: '9999px' }}>
                    <select
                      value={localCat}
                      onChange={e => {
                        const val = e.target.value
                        setLocal(entry.id, 'category', val)
                        if (val === '__custom__') setCustomCatById(p => ({ ...p, [entry.id]: '' }))
                        else commitSelect(entry, 'category', val)
                      }}
                      className="text-xs font-medium pl-2.5 pr-5 py-0.5 rounded-full border-none outline-none cursor-pointer bg-transparent appearance-none"
                      style={{ color: hex }}>
                      {SAVINGS_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__">Custom…</option>
                    </select>
                    <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5" style={{ color: hex }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                )}

                <button onClick={() => onDelete(entry.id)} className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0" title="Remove">✕</button>
              </div>
            )
          })}
          </div>

          <div className="px-5 py-3 bg-[#F0FDF9]/60 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Monthly total · <span className="text-gray-400">{selectedYear} projection: {fmt(monthlyTotal * 12)}</span></span>
            <span className="text-sm font-semibold text-[#1A1F2E] tabular-nums">{fmt(monthlyTotal)}</span>
          </div>
        </div>
      )}

    </div>

      {/* Savings info card */}
      <div className="w-full md:w-64 md:shrink-0">
        <div className="budgli-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">What to enter here</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Record the amounts you are actively contributing to savings or investment accounts — money you are intentionally setting aside each month or year.
          </p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Examples</p>
          <ul className="space-y-1.5 mb-4">
            {[
              'RRSP or 401(k) contributions',
              'TFSA or ISA deposits',
              'Investment account transfers',
              'Emergency fund contributions',
              'Long-term savings goals',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1 h-1 rounded-full bg-[#00C896] shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              Only enter contributions not already captured in your transaction data to avoid double-counting.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Monthly performance score ────────────────────────────────────────────────

function calcMonthlyScore({ savingsRate, txnSpent, monthlyNet, fixedMonthlyTotal, totalSpent, untagged, totalDebits, priorMonthlySpends }) {
  if (monthlyNet <= 0) return null

  // Savings Rate: 0–50 pts — progressive curve, 50%+ earns full marks
  const srScore = savingsRate === null || savingsRate <= 0
    ? 0
    : Math.min(50, 50 * Math.pow(savingsRate / 50, 0.5))

  // Spending Consistency: 0–40 pts — deviation from prior monthly average
  const hasSufficientHistory = Array.isArray(priorMonthlySpends) && priorMonthlySpends.length >= 2
  let consistencyScore = 0
  if (hasSufficientHistory) {
    const avgSpend = priorMonthlySpends.reduce((s, v) => s + v, 0) / priorMonthlySpends.length
    const deviation = avgSpend > 0 ? (totalSpent - avgSpend) / avgSpend : 0
    consistencyScore = Math.min(40, Math.max(0, 40 * (1 - Math.abs(deviation) / 0.25)))
  }

  // Clarity: 0–10 pts — how many debits are categorised
  const clarityScore = totalDebits === 0 ? 10 : Math.max(0, Math.round(((totalDebits - untagged) / totalDebits) * 10))

  const maxScore = hasSufficientHistory ? 100 : 60

  return {
    score: Math.round(srScore + consistencyScore + clarityScore),
    maxScore,
    scoreNote: hasSufficientHistory
      ? null
      : 'Score is out of 60 this month — Spending Consistency requires 2+ months of history',
    components: [
      { label: 'Savings Rate',         tip: 'How much of your income you kept. Higher savings rates score progressively better — 50% or more earns full marks.',                                         value: Math.round(srScore),           max: 50 },
      { label: 'Spending Consistency', tip: hasSufficientHistory ? 'How consistent your spending is compared to your recent monthly average — steady habits score well.' : 'N/A — not enough history yet. Spending Consistency requires 2+ months of prior data.', value: Math.round(consistencyScore), max: 40 },
      { label: 'Clarity',              tip: 'How many of your transactions have been categorised.',                                                                                                        value: Math.round(clarityScore),      max: 10 },
    ],
  }
}

function getMonthlyInsight(score) {
  if (score >= 90) return { headline: 'Outstanding', sub: 'Exceptional savings discipline and consistent habits' }
  if (score >= 75) return { headline: 'Excellent', sub: 'Strong savings rate and stable spending' }
  if (score >= 60) return { headline: 'Good', sub: 'Solid foundation — push your savings rate higher to level up' }
  if (score >= 40) return { headline: 'Fair', sub: 'Making progress — focus on saving more and spending consistently' }
  return { headline: 'Needs work', sub: 'Start by building a regular savings habit' }
}

// ─── AnalysisSection (Insights + SpendingLeaks unified) ───────────────────────

function AnalysisSection({ txns, selectedMonth, selectedYear, monthlyNet, txnSpent, fixedMonthlyTotal, totalSavings, savingsRate, savingsEntriesTotal, debits }) {

  // ── Prior month shared setup ──────────────────────────────────────────────
  const mIdx         = parseInt(selectedMonth, 10)
  const priorMIdx    = mIdx === 1 ? 12 : mIdx - 1
  const priorYear    = mIdx === 1 ? String(parseInt(selectedYear, 10) - 1) : selectedYear
  const priorMStr    = priorMIdx.toString().padStart(2, '0')
  const priorMonthName = MONTHS.find(m => m.id === priorMStr)?.label || 'last month'

  const priorDebitsAll = txns.filter(t =>
    yearMonthOf(t.date) === priorYear + '-' + priorMStr &&
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    !isSaving(t.category)
  )
  const hasPrior = priorDebitsAll.length > 0

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights = []

  if (savingsRate !== null && monthlyNet > 0) {
    const r = savingsRate.toFixed(0)
    insights.push({
      label: 'Savings Rate',
      icon: <PiggyBank className="w-3.5 h-3.5" />,
      body: savingsRate >= 20
        ? `Your savings rate is ${r}% this month — excellent. You're keeping more than 1 in 5 dollars you earn.`
        : savingsRate >= 10
          ? `Your savings rate is ${r}% — solid. Most advisors suggest aiming for 20%+ over time.`
          : savingsRate > 0
            ? `You saved ${r}% of your income this month. Pushing above 10% will start to build real momentum.`
            : 'Spending exceeded income this month. Review your variable costs to find room to save.',
    })
  }

  const varByCat = {}
  for (const t of debits) {
    const cat = t.category || 'Uncategorized'
    varByCat[cat] = (varByCat[cat] || 0) + t.amount
  }
  const topCatEntry = Object.entries(varByCat).sort((a, b) => b[1] - a[1])[0]
  if (topCatEntry && txnSpent > 0) {
    const [catName, catAmt] = topCatEntry
    const catPct = Math.round((catAmt / txnSpent) * 100)
    insights.push({
      label: 'Top Category',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      body: `${catName} was your biggest variable expense at ${fmt(catAmt)} — ${catPct}% of all variable spending this month.`,
    })
  }

  if (hasPrior && monthlyNet > 0) {
    const priorTxnSpent = priorDebitsAll.reduce((s, t) => s + t.amount, 0)
    const priorLeftover = Math.max(0, monthlyNet - priorTxnSpent - fixedMonthlyTotal)
    const priorSavings  = priorLeftover + savingsEntriesTotal
    const delta         = totalSavings - priorSavings
    if (Math.abs(delta) > 1) {
      insights.push({
        label: 'vs Last Month',
        icon: delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />,
        body: delta > 0
          ? `You saved ${fmt(delta)} more than ${priorMonthName}. Good progress — keep the momentum going.`
          : `You saved ${fmt(Math.abs(delta))} less than ${priorMonthName}. ${topCatEntry ? `${topCatEntry[0]} spending was the biggest driver.` : 'Review variable costs to get back on track.'}`,
      })
    }
  }

  if (monthlyNet > 0 && fixedMonthlyTotal > 0) {
    const fixedPct = Math.round((fixedMonthlyTotal / monthlyNet) * 100)
    insights.push({
      label: 'Fixed Cost Load',
      icon: <Wallet className="w-3.5 h-3.5" />,
      body: fixedPct >= 50
        ? `Fixed costs take up ${fixedPct}% of your take-home — over half your income is committed before variable spending.`
        : fixedPct >= 30
          ? `Fixed costs are ${fixedPct}% of take-home (${fmt(fixedMonthlyTotal)}/mo). That leaves limited room for flexibility.`
          : `Fixed costs are ${fixedPct}% of take-home — a light load that leaves plenty of room for variable spending.`,
    })
  }

  // ── Spending leaks ────────────────────────────────────────────────────────
  const priorByCat = {}
  for (const t of priorDebitsAll) {
    const cat = t.category || 'Uncategorized'
    priorByCat[cat] = (priorByCat[cat] || 0) + t.amount
  }

  const leaks = []
  const flagged = new Set()

  if (hasPrior) {
    for (const [cat, curr] of Object.entries(varByCat)) {
      const prior     = priorByCat[cat] || 0
      const delta     = curr - prior
      const pctChange = prior > 0 ? (delta / prior) * 100 : null
      if (delta > 50 && (pctChange === null || pctChange > 20)) {
        leaks.push({
          cat, sort: delta,
          chip: prior > 0 ? `+${fmt(delta)}` : 'New',
          body: prior > 0
            ? `${fmt(delta)} higher than ${priorMonthName} (+${Math.round(pctChange)}%).`
            : `No spending here last month — ${fmt(curr)} this month.`,
        })
        flagged.add(cat)
      }
    }
  }

  if (txnSpent > 0) {
    for (const [cat, curr] of Object.entries(varByCat)) {
      if (flagged.has(cat)) continue
      const share = (curr / txnSpent) * 100
      if (share > 15 && curr > 50) {
        leaks.push({
          cat, sort: curr,
          chip: `${Math.round(share)}%`,
          body: `${Math.round(share)}% of your variable spend this month (${fmt(curr)}).`,
        })
        flagged.add(cat)
      }
    }
  }

  leaks.sort((a, b) => b.sort - a.sort)

  if (insights.length === 0 && leaks.length === 0 && txnSpent === 0) return null

  return (
    <div className="mt-5 bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

      {/* Section header */}
      <div className="flex items-center gap-2.5 px-6 pt-4 pb-3.5 border-b border-gray-100">
        <BarChart3 className="w-4 h-4 text-gray-300" />
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Monthly Analysis</span>
      </div>

      <div className="flex flex-col md:flex-row md:min-h-[180px]">

        {/* LEFT — Insights */}
        <div className="flex-1 p-5 md:p-6 md:pr-5">
          <div className="flex items-center gap-1.5 mb-4">
            <Lightbulb className="w-3 h-3" style={{ color: '#00C896' }} />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Insights</span>
          </div>

          {insights.length === 0 ? (
            <p className="text-xs text-gray-300 italic">Add salary details to generate insights.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-3.5 bg-gray-50"
                  style={{ borderLeft: '2px solid #00C896' }}
                >
                  <div className="flex items-center gap-1.5 mb-2" style={{ color: '#00C896' }}>
                    {ins.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{ins.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{ins.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-100 my-5 shrink-0" />
        <div className="md:hidden h-px bg-gray-100 mx-5" />

        {/* RIGHT — Spending Spikes */}
        <div className="md:w-72 shrink-0 p-5 md:p-6 md:pl-5">
          <div className="flex items-center gap-1.5 mb-4">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Spending Spikes</span>
            {hasPrior && (
              <span className="text-[10px] text-gray-300 ml-0.5">vs {priorMonthName}</span>
            )}
          </div>

          {leaks.length === 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#00C896' }} />
              <span className="text-xs text-gray-400">No spending spikes this month.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {leaks.slice(0, 2).map((l, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-700 truncate">{l.cat}</span>
                      <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums"
                        style={{ backgroundColor: 'rgba(251,191,36,0.12)', color: '#D97706' }}>
                        {l.chip}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">{l.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── MonthlyDashboard ─────────────────────────────────────────────────────────

function MonthlyDashboard({ txns, selectedMonth, selectedYear, setCategory, salary, fixedCosts, savingsEntries, variableOpen, setVariableOpen, fixedOpen, setFixedOpen, savingsOpen, setSavingsOpen, userGoals }) {

  const monthTxns  = txns.filter(t => yearMonthOf(t.date) === selectedYear + '-' + selectedMonth)
  const customCats = [...new Set(txns.map(t => t.category).filter(c => c && !CATS_SET.has(c)))].sort()
  const allDebits   = monthTxns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const debits      = allDebits.filter(t => !isSaving(t.category))
  const savingsTxns = allDebits.filter(t => isSaving(t.category))
  const untagged    = allDebits.filter(t => !t.category).length

  const txnSpent          = debits.reduce((sum, t) => sum + t.amount, 0)
  const fixedMonthlyTotal = fixedCosts.reduce((s, c) => s + monthlyRate(c), 0)
  const totalSpent        = txnSpent + fixedMonthlyTotal

  const salaryAnnualNet = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const annualNet  = salaryAnnualNet + (salary.extraIncome || 0) * 12
  const monthlyNet = annualNet / 12

  const savingsEntriesTotal = savingsEntries.reduce((s, e) => s + monthlyRate(e), 0)
  const leftover            = monthlyNet > 0 ? Math.max(0, monthlyNet - totalSpent) : 0
  const totalSavings        = leftover + savingsEntriesTotal
  const savingsRate         = monthlyNet > 0 ? (totalSavings / monthlyNet) * 100 : null

  // Savings breakdown by category from entries
  const savingsByCat = savingsEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + monthlyRate(e)
    return acc
  }, {})

  const monthLabel = MONTHS.find(m => m.id === selectedMonth)?.label || ''

  const totalDebits  = debits.length + savingsTxns.length

  // Prior months' total spending for Spending Consistency metric
  const priorMonthlySpends = (() => {
    const currentYM = selectedYear + '-' + selectedMonth
    const ymSpend = {}
    for (const t of txns) {
      const ym = yearMonthOf(t.date)
      if (!ym || ym === currentYM) continue
      if (t.type !== 'debit' || EXCLUDE_FROM_TOTALS.has(t.category) || isSaving(t.category)) continue
      ymSpend[ym] = (ymSpend[ym] || 0) + t.amount
    }
    return Object.values(ymSpend).map(v => v + fixedMonthlyTotal)
  })()

  const monthlyScore = calcMonthlyScore({ savingsRate, txnSpent, monthlyNet, fixedMonthlyTotal, totalSpent, untagged, totalDebits, priorMonthlySpends })
  const scoreColor   = monthlyScore === null ? '#6B7280'
    : monthlyScore.score >= 85 ? '#00C896'
    : monthlyScore.score >= 70 ? '#0D9488'
    : monthlyScore.score >= 55 ? '#3B82F6'
    : monthlyScore.score >= 40 ? '#F59E0B'
    : monthlyScore.score >= 20 ? '#F97316'
    : '#EF4444'
  const [scoreExpanded, setScoreExpanded] = useState(false)
  const [expandedVarCat, setExpandedVarCat] = useState(null)
  const monthlyInsight = monthlyScore !== null ? getMonthlyInsight(monthlyScore.score) : null

  // Personalised goal insight
  const goalInsight = (() => {
    const goal = userGoals?.primary_goal
    if (!goal || monthlyNet <= 0) return null
    const suggestedVariable = monthlyNet * 0.3
    if (goal === 'Save more money' || goal === 'Build an emergency fund') {
      if (savingsRate !== null && savingsRate < 15)
        return `Based on your goal to ${goal.toLowerCase()}, one opportunity could be reducing variable spending — your savings rate this month is ${savingsRate.toFixed(1)}%, below the suggested 20%.`
      if (savingsRate !== null && savingsRate >= 20)
        return `You're on track with your goal to ${goal.toLowerCase()} — your savings rate of ${savingsRate.toFixed(1)}% is solid.`
      return `Based on your goal to ${goal.toLowerCase()}, a helpful starting point may be reviewing your variable and fixed costs each month.`
    }
    if (goal === 'Reduce unnecessary spending') {
      if (txnSpent > suggestedVariable * 1.1)
        return `Your variable spending this month may be above a healthy range. One opportunity could be reviewing dining, subscriptions, or shopping.`
      return `Based on your goal to reduce unnecessary spending, you're within a reasonable range this month — keep tracking categories to spot patterns.`
    }
    if (goal === 'Improve monthly cash flow') {
      const breathing = monthlyNet - totalSpent
      if (breathing > 0) return `You have ${fmt(breathing)} of breathing room this month. Based on your goal, consider directing part of this toward savings.`
      return `Based on your goal to improve cash flow, your costs are close to your income this month. A helpful starting point may be reviewing recurring fixed expenses.`
    }
    if (goal === 'Understand where my money goes')
      return `Keep categorising your transactions — the more you tag, the clearer your monthly spending picture becomes.`
    if (goal === 'Pay down debt')
      return `Based on your goal to pay down debt, consider directing any monthly surplus toward your highest-interest balance first.`
    if (goal === 'Prepare for a big purchase') {
      if (totalSavings > 0) return `Based on your goal, you're building toward your purchase — ${fmt(totalSavings)} set aside this month.`
      return `Based on your goal to prepare for a big purchase, tracking and growing your monthly savings is the first step.`
    }
    return null
  })()

  // Prior month savings rate for summary banner
  const mIdx        = parseInt(selectedMonth, 10)
  const priorMIdx   = mIdx === 1 ? 12 : mIdx - 1
  const priorYearB  = mIdx === 1 ? String(parseInt(selectedYear, 10) - 1) : selectedYear
  const priorMStrB  = priorMIdx.toString().padStart(2, '0')
  const priorMonthNameB = MONTHS.find(m => m.id === priorMStrB)?.label || ''
  const priorDebitsB  = txns.filter(t =>
    yearMonthOf(t.date) === `${priorYearB}-${priorMStrB}` &&
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    !isSaving(t.category)
  )
  const priorTxnSpentB  = priorDebitsB.reduce((s, t) => s + t.amount, 0)
  const priorSavingsB   = Math.max(0, monthlyNet - priorTxnSpentB - fixedMonthlyTotal) + savingsEntriesTotal
  const priorSavingsRateB = monthlyNet > 0 && priorDebitsB.length > 0
    ? (priorSavingsB / monthlyNet) * 100
    : null

  // Top variable spending category for summary banner
  const bannerVarByCat = {}
  for (const t of debits) {
    const cat = t.category || 'Uncategorized'
    bannerVarByCat[cat] = (bannerVarByCat[cat] || 0) + t.amount
  }
  const bannerTopCat = Object.entries(bannerVarByCat).sort((a, b) => b[1] - a[1])[0]

  return (
    <div>

      {/* Summary banner */}
      {monthlyNet > 0 && (savingsRate !== null || bannerTopCat) && (
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          {savingsRate !== null && (
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-1">Savings Rate</p>
              <p className="text-sm font-semibold text-gray-900">Saved {savingsRate.toFixed(1)}% this month</p>
            </div>
          )}
          {priorSavingsRateB !== null && savingsRate !== null && (
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-1">vs {priorMonthNameB}</p>
              <p className={`text-sm font-semibold ${savingsRate >= priorSavingsRateB ? 'text-[#00C896]' : 'text-[#E05252]'}`}>
                {savingsRate >= priorSavingsRateB ? '↑ Up' : '↓ Down'} from {priorSavingsRateB.toFixed(1)}% in {priorMonthNameB}
              </p>
            </div>
          )}
          {bannerTopCat && (
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.12em] mb-1">Top Spend</p>
              <p className="text-sm font-semibold text-gray-900">Top spend: {bannerTopCat[0]} · {fmt(bannerTopCat[1])}</p>
            </div>
          )}
        </div>
      )}

      {/* Personalised goal insight */}
      {goalInsight && (
        <div className="mb-5 px-5 py-3.5 rounded-xl border border-[#0D7377]/20 bg-[#0D7377]/5 flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D7377] shrink-0 mt-[7px]" />
          <div>
            <p className="text-[11px] font-semibold text-[#0D7377] uppercase tracking-[0.12em] mb-0.5">For you · {userGoals.primary_goal}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{goalInsight}</p>
          </div>
        </div>
      )}

      {/* Financial Health Score card */}
        {monthlyScore !== null ? (
          <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100 overflow-hidden budgli-card-pop" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {/* Score header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-end gap-1 shrink-0">
                <span className="text-[72px] font-black leading-none tabular-nums" style={{ color: scoreColor }}>
                  {monthlyScore.score}
                </span>
                <span className="text-sm font-semibold text-gray-300 leading-none mb-2.5">/{monthlyScore.maxScore ?? 100}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Monthly Score</p>
                  <HelpTip text="A score based on your savings, spending, and consistency." />
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{monthlyInsight.headline}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{monthlyInsight.sub}</p>
              </div>
            </div>
            {/* Contributors */}
            <div className="space-y-3">
              {monthlyScore.components.map(c => {
                const pct = Math.max(0, Math.min(100, (c.value / c.max) * 100))
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{c.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: scoreColor }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-12 text-right shrink-0" style={{ color: scoreColor }}>
                      {c.value}<span className="text-gray-300 font-normal">/{c.max}</span>
                    </span>
                  </div>
                )
              })}
            </div>
            {/* How is this calculated? */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setScoreExpanded(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                How is this calculated?
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${scoreExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                ><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${scoreExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="pt-3 space-y-2.5">
                    {monthlyScore.components.map(c => (
                      <div key={c.label} className="flex gap-3 text-xs">
                        <span className="w-28 shrink-0 font-medium text-gray-700">
                          {c.label} <span className="font-normal text-gray-400">{c.value}/{c.max}</span>
                        </span>
                        <span className="text-gray-500 leading-relaxed">{c.tip}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 pt-0.5">{monthlyScore.scoreNote ?? 'Your score updates each month based on your latest data.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 mb-5 border border-gray-100 flex items-center gap-4 budgli-card-pop" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Monthly Score</p>
              <p className="text-2xl font-black text-gray-200">—</p>
            </div>
            <p className="text-xs text-gray-400 ml-2">Add salary details to generate your score</p>
          </div>
        )}

      {/* Monthly Income Statement */}
      {(() => {
        // Variable spending grouped by category, sorted by amount desc
        const varByCat = {}
        for (const t of debits) {
          const cat = t.category || 'Uncategorized'
          varByCat[cat] = (varByCat[cat] || 0) + t.amount
        }
        const varRows = Object.entries(varByCat)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => ({ name: cat, amount: amt, hex: CATEGORY_COLOR[cat] || '#9CA3AF' }))

        const fixedRows = fixedCosts.map(c => ({
          name: c.name, amount: monthlyRate(c), hex: CATEGORY_COLOR[c.category] || '#9CA3AF',
        }))

        const savingsRows = savingsEntries.map(e => ({
          name: e.name, amount: monthlyRate(e), hex: CATEGORY_COLOR[e.category] || '#00C896',
        }))

        // Shared row renderer — identical format for all three sections
        const Row = ({ name, amount, hex }) => (
          <div className="flex items-center gap-2.5 py-1.5 -mx-5 px-5 rounded transition-colors hover:bg-gray-50">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
            <span className="flex-1 text-sm text-gray-600 truncate">{name}</span>
            <span className="text-sm font-medium text-gray-700 tabular-nums">{fmt(amount)}</span>
          </div>
        )

        return (
          <div className="budgli-card rounded-xl overflow-hidden mb-4">

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Monthly Income Statement</h2>
              <p className="text-xs text-gray-400">{monthLabel} {selectedYear}</p>
            </div>

            {/* NET INCOME */}
            <div>
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Net Income</p>
              </div>
              <div className="px-5">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-700">Net Take-Home Pay</span>
                    <HelpTip text="Your take-home pay after tax and deductions." />
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {monthlyNet > 0 ? fmt(monthlyNet) : salary.gross === 0 ? 'Add salary →' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* FIXED COSTS */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Fixed Costs</p>
              </div>
              <div className="px-5">
                {fixedRows.length > 0
                  ? fixedRows.map((r, i) => <Row key={i} {...r} />)
                  : <p className="text-xs text-gray-300 py-2">No fixed costs set up</p>
                }
                {fixedRows.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-0.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Fixed</span>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">{fmt(fixedRows.reduce((s, r) => s + r.amount, 0))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* VARIABLE COSTS — each row expands to show its transactions */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Variable Costs</p>
              </div>
              {varRows.length === 0 ? (
                <div className="px-5"><p className="text-xs text-gray-300 py-2">No variable spending this month</p></div>
              ) : varRows.map(r => {
                const catTxns = debits.filter(t => (t.category || 'Uncategorized') === r.name)
                const isExpanded = expandedVarCat === r.name
                return (
                  <div key={r.name}>
                    <button
                      onClick={() => setExpandedVarCat(isExpanded ? null : r.name)}
                      className="w-full flex items-center gap-2.5 py-2 px-5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.hex }} />
                      <span className="flex-1 text-sm text-gray-600 truncate">{r.name}</span>
                      <span className="text-[11px] text-gray-400 shrink-0 mr-1">{catTxns.length}</span>
                      <span className="text-sm font-medium text-gray-700 tabular-nums">{fmt(r.amount)}</span>
                      <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ml-1.5 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 border-b border-b-gray-100">
                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-gray-50">
                          {catTxns.map(t => (
                            <div key={t.id} className="px-5 py-2.5 bg-gray-50/40">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs text-gray-700 truncate">{titleCaseDesc(t.description)}</span>
                                <span className="text-sm font-semibold tabular-nums shrink-0 text-gray-800">{fmt(t.amount)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
                                <CategoryCombobox value={t.category} onChange={newCat => setCategory(t.id, newCat)} suggestions={customCats} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Desktop */}
                        <table className="w-full hidden md:table">
                          <tbody>
                            {catTxns.map((t, i) => (
                              <tr key={t.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-gray-50/30' : 'bg-gray-50/50'}`}>
                                <td className="py-2 pl-9 pr-3 text-gray-400 text-xs whitespace-nowrap w-28">{fmtDate(t.date)}</td>
                                <td className="px-3 py-2 text-xs text-gray-700">
                                  <div className="flex items-center gap-1.5">
                                    {t.fromMemory && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#00C896' }} title="Auto-categorized" />}
                                    {titleCaseDesc(t.description)}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <CategoryCombobox value={t.category} onChange={newCat => setCategory(t.id, newCat)} suggestions={customCats} />
                                </td>
                                <td className="px-5 py-2 text-xs font-semibold tabular-nums text-right whitespace-nowrap text-gray-800 w-20">
                                  {fmt(t.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
              {varRows.length > 0 && (
                <div className="px-5 py-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Variable</span>
                  <span className="text-sm font-semibold text-gray-700 tabular-nums">{fmt(varRows.reduce((s, r) => s + r.amount, 0))}</span>
                </div>
              )}
            </div>

            {/* SAVINGS */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Savings</p>
              </div>
              <div className="px-5">
                {savingsRows.length > 0
                  ? savingsRows.map((r, i) => <Row key={i} {...r} />)
                  : <p className="text-xs text-gray-300 py-2">No savings allocations set up</p>
                }
              </div>
            </div>

            {/* TOTALS FOOTER */}
            <div className="px-5 py-3 border-t-2 border-gray-200 space-y-1.5">
              {leftover > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">Surplus</span>
                  <span className="text-sm font-medium tabular-nums" style={{ color: '#00C896' }}>{fmt(leftover)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-semibold text-gray-700">Total Savings</span>
                <span className={`text-sm font-bold tabular-nums ${totalSavings > 0 ? 'text-[#00C896]' : 'text-gray-300'}`}>
                  {totalSavings > 0 ? fmt(totalSavings) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Savings Rate</span>
                  <HelpTip text="How much of your income you kept instead of spending." />
                </div>
                <span className={`text-sm font-semibold tabular-nums ${
                  savingsRate === null ? 'text-gray-300'
                  : savingsRate >= 20 ? 'text-[#00C896]'
                  : savingsRate >= 10 ? 'text-amber-500'
                  : 'text-red-400'
                }`}>
                  {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
                </span>
              </div>
            </div>

          </div>
        )
      })()}

      <AnalysisSection
        txns={txns}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthlyNet={monthlyNet}
        txnSpent={txnSpent}
        fixedMonthlyTotal={fixedMonthlyTotal}
        totalSavings={totalSavings}
        savingsRate={savingsRate}
        savingsEntriesTotal={savingsEntriesTotal}
        debits={debits}
      />

    </div>
  )
}

// ─── SalaryPage ───────────────────────────────────────────────────────────────

function SalaryPage({ salary, onSalaryChange, onSalaryBlur, onSaveSalary, transactions, selectedMonth, selectedYear, fixedCosts, userGoals }) {
  const [grossDisplay, setGrossDisplay] = useState(
    salary.gross > 0 ? salary.gross.toLocaleString('en-US') : ''
  )
  const [extraDisplay, setExtraDisplay] = useState(
    salary.extraIncome > 0 ? salary.extraIncome.toLocaleString('en-US') : ''
  )
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    const ok = await onSaveSalary(salary)
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setSaveError('Could not save income. Please try again.')
    }
  }

  const salaryAnnualNet = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const monthlyExtra = salary.extraIncome || 0
  const annualNet    = salaryAnnualNet + monthlyExtra * 12
  const monthlyNet   = annualNet / 12

  const monthIdx = parseInt(selectedMonth, 10)

  const today         = new Date()
  const todayYear     = today.getFullYear().toString()
  const todayMonthIdx = today.getMonth() + 1
  const dayOfMonth    = today.getDate()
  const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed = todayYear === selectedYear
    ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth
    : 0
  const incomeToDate  = monthlyNet * monthsElapsed

  const debits = transactions.filter(t =>
    t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category) && !isSaving(t.category)
  )
  const spentToDate = debits
    .filter(t => {
      const ym = yearMonthOf(t.date)
      return ym.slice(0, 4) === selectedYear && parseInt(ym.slice(5), 10) <= monthIdx
    })
    .reduce((s, t) => s + t.amount, 0)

  const monthsWithSpendData = new Set(
    debits
      .filter(t => {
        const ym = yearMonthOf(t.date)
        return ym.slice(0, 4) === selectedYear && parseInt(ym.slice(5), 10) <= monthIdx
      })
      .map(t => yearMonthOf(t.date))
  ).size

  const fixedMonthlyTotal = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + monthlyRate(c), 0)

  const avgMonthlySpend       = monthsWithSpendData > 0 ? spentToDate / monthsWithSpendData : null
  const monthlySavings        = monthlyNet > 0 && avgMonthlySpend !== null
    ? monthlyNet - avgMonthlySpend - fixedMonthlyTotal
    : null
  const projectedAnnualSavings = monthlySavings !== null ? monthlySavings * 12 : null

  const monthLabel = MONTHS.find(m => m.id === selectedMonth)?.label || ''

  function update(field, val) {
    onSalaryChange({ ...salary, [field]: val })
  }

  function handleGrossChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    setGrossDisplay(raw ? num.toLocaleString('en-US') : '')
    update('gross', num)
  }

  function handleExtraIncomeChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    setExtraDisplay(raw ? num.toLocaleString('en-US') : '')
    update('extraIncome', num)
  }

  // 80/20 cost-vs-savings allocation
  const suggestedCosts   = monthlyNet * 0.80
  const suggestedSavings = monthlyNet * 0.20

  const actualCosts = avgMonthlySpend !== null
    ? fixedMonthlyTotal + avgMonthlySpend
    : fixedMonthlyTotal > 0 ? fixedMonthlyTotal : null

  const allocations = [
    {
      label: 'Cost Allocation', pct: 80, suggested: suggestedCosts, actual: actualCosts,
      helper: 'All monthly expenses — fixed commitments, everyday spending, and variable costs.',
      color: '#3B5998',
      overMsg:  'Your total costs are above the suggested range.',
      underMsg: 'Your total costs are below the suggested range — strong position.',
      goodMsg:  'Your total costs are within a healthy range.',
    },
    {
      label: 'Savings Allocation', pct: 20, suggested: suggestedSavings, actual: monthlySavings !== null && monthlySavings > 0 ? monthlySavings : null,
      helper: 'Emergency fund, investments, short-term goals, and long-term wealth building.',
      color: '#00C896',
      overMsg:  'Your savings are exceeding the suggested target — excellent.',
      underMsg: 'Your savings are below the suggested target.',
      goodMsg:  'Your savings are on track with the suggested target.',
    },
  ]

  return (
    <div className="space-y-5">

      {/* Stat cards — 3 across on desktop, 1 col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="budgli-card rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#8896B0' }}>Annual Net Income</p>
          <p className={`text-2xl font-semibold ${annualNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">
            {monthlyExtra > 0 ? 'Gross − Tax − Deductions + Other' : 'Gross − Tax − (Deductions × 12)'}
          </p>
        </div>

        <div className="budgli-card rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#8896B0' }}>Monthly Net Income</p>
          <p className={`text-2xl font-semibold ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {monthlyNet > 0 ? fmt(monthlyNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">Annual Net ÷ 12</p>
        </div>

        <div className="budgli-card rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#8896B0' }}>Income to Date</p>
          <p className={`text-2xl font-semibold ${incomeToDate > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {incomeToDate > 0 ? fmt(incomeToDate) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">
            {todayYear === selectedYear
              ? `Through ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'Monthly Net × months elapsed'}
          </p>
        </div>

      </div>

      {/* Main row — form left, allocation right */}
      <div className="flex flex-col md:flex-row gap-5 items-start">

        {/* Income Details form */}
        <div className="budgli-card rounded-xl p-6 w-full md:w-80 md:shrink-0">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Income Details</h2>
          <div className="space-y-4">

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Gross Annual Salary</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={grossDisplay}
                  onChange={handleGrossChange}
                  onBlur={onSalaryBlur}
                  placeholder="0"
                  className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Your income details are stored in your account only and never shared.</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tax Rate</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none w-10 text-center shrink-0">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={salary.taxRate || ''}
                  onChange={e => update('taxRate', Number(e.target.value))}
                  onBlur={onSalaryBlur}
                  placeholder="30"
                  className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Monthly Deductions (other)</label>
              <p className="text-[10px] text-gray-400 mb-1.5 italic">e.g. benefits, pension, parking — deducted each month from your paycheque</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                <input
                  type="number"
                  min="0"
                  value={salary.deductions || ''}
                  onChange={e => update('deductions', Number(e.target.value))}
                  onBlur={onSalaryBlur}
                  placeholder="0"
                  className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Other Monthly Income</label>
              <p className="text-[10px] text-gray-400 mb-1.5 italic">e.g. freelance, rental, side income — added on top of your salary each month</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00C896] transition-colors">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={extraDisplay}
                  onChange={handleExtraIncomeChange}
                  onBlur={onSalaryBlur}
                  placeholder="0"
                  className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none"
                />
              </div>
            </div>

          </div>

          {/* Save Income button */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: saved ? '#00C896' : '#0D7377', color: '#fff' }}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Income'}
            </button>
            {saveError && <p className="text-xs text-red-500 mt-2">{saveError}</p>}
          </div>
        </div>

        {/* Suggested Income Allocation — fills remaining width */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="budgli-card rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Suggested Income Allocation</h2>
            <p className="text-xs text-gray-400 mb-5">
              {monthlyNet > 0
                ? <>Based on your monthly take-home of <span className="tabular-nums font-medium text-gray-600">{fmt(monthlyNet)}</span></>
                : 'Add your salary details to see a personalised allocation breakdown'}
            </p>

            {allocations.map((a, i) => {
              const status = a.actual !== null
                ? a.actual > a.suggested * 1.1 ? 'over'
                : a.actual < a.suggested * 0.9 ? 'under'
                : 'good'
                : null
              const statusMsg =
                status === 'over'  ? a.overMsg
                : status === 'under' ? a.underMsg
                : status === 'good'  ? a.goodMsg
                : null
              const statusColor =
                a.label === 'Savings Allocation'
                  ? (status === 'under' ? '#E05252' : '#00C896')
                  : (status === 'over'  ? '#B45309' : '#00C896')

              return (
                <div key={a.label} className={`py-4 ${i < allocations.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-sm font-medium text-gray-700">{a.label}</span>
                      <span className="text-xs text-gray-400">· {a.pct}%</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {monthlyNet > 0 ? <>{fmt(a.suggested)}<span className="text-xs text-gray-400 font-normal">/mo</span></> : '—'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1.5 pl-[18px]">{a.helper}</p>
                  {statusMsg && (
                    <p className="text-[11px] font-medium pl-[18px]" style={{ color: statusColor }}>
                      {statusMsg}
                      {a.actual !== null && (
                        <span className="text-gray-400 font-normal"> · Actual: {fmt(a.actual)}/mo</span>
                      )}
                    </p>
                  )}
                </div>
              )
            })}

            <p className="text-xs text-gray-500 mt-4 leading-relaxed border-t border-gray-50 pt-4">
              A common starting point is directing 80% of take-home pay toward total costs and reserving at least 20% for savings and investments.
            </p>
            <p className="text-[10px] text-gray-300 mt-1.5 italic">This is a suggested starting point, not financial advice.</p>
          </div>

          {/* Goal-based insight */}
          {userGoals?.primary_goal && (
            <div className="px-4 py-3.5 rounded-xl border border-[#0D7377]/20 bg-[#0D7377]/5 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D7377] shrink-0 mt-[6px]" />
              <div>
                <p className="text-[11px] font-semibold text-[#0D7377] uppercase tracking-[0.12em] mb-0.5">Your goal</p>
                <p className="text-xs text-gray-600 leading-relaxed">{userGoals.primary_goal}</p>
                {userGoals.savings_intensity && (
                  <p className="text-[11px] text-gray-400 mt-1">Savings plan: {userGoals.savings_intensity}</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

function calcFinancialHealthScore({ savingsRate, savingsRateYTD, totalExpensesProj, projectedVariable, annualNet, fixedAnnualProjected, monthsWithData, monthlySpendTotals }) {
  if (annualNet <= 0 || monthsWithData === 0) return null

  // Savings Rate: 0–50 pts — progressive curve, 50%+ earns full marks
  const rate = savingsRateYTD !== null ? savingsRateYTD : savingsRate
  const srScore = rate === null || rate <= 0 ? 0 : Math.min(50, 50 * Math.pow(rate / 50, 0.5))

  // Spending Trend: 0–40 pts — linear regression slope on monthly spend totals
  const months = Array.isArray(monthlySpendTotals) ? monthlySpendTotals : []
  const hasTrendData = months.length >= 2
  let trendScore = 0
  if (hasTrendData) {
    const n = months.length
    const xMean = (n - 1) / 2
    const avgMonthlySpend = months.reduce((s, v) => s + v, 0) / n
    const denom = months.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0)
    const slope = denom === 0 ? 0 : months.reduce((sum, y, x) => sum + (x - xMean) * (y - avgMonthlySpend), 0) / denom
    const trend = avgMonthlySpend > 0 ? slope / avgMonthlySpend : 0
    trendScore = Math.min(40, Math.max(0, 40 * (1 - trend / 0.20)))
  }

  // Data completeness: 0–10 pts — how many months have transaction data
  const clarityScore = Math.round((Math.min(monthsWithData, 10) / 10) * 10)

  return {
    score: Math.round(srScore + trendScore + clarityScore),
    components: [
      { label: 'Savings Rate',   tip: 'How much of your income you kept. Higher savings rates score progressively better — 50% or more earns full marks.',                                       value: Math.round(srScore),    max: 50 },
      { label: 'Spending Trend', tip: hasTrendData ? 'Whether your monthly spending is stable or trending downward over the year — improvement is rewarded.' : 'N/A — not enough data yet. Spending Trend requires 2+ months of data.', value: Math.round(trendScore), max: 40 },
      { label: 'Data Coverage',  tip: 'How many months of transaction data are included.',                                                                                                        value: Math.round(clarityScore), max: 10 },
    ],
  }
}

function getAnnualInsight(score) {
  if (score >= 90) return { headline: 'Outstanding', sub: 'Exceptional savings discipline and consistent habits' }
  if (score >= 75) return { headline: 'Excellent', sub: 'Strong savings rate and stable spending' }
  if (score >= 60) return { headline: 'Good', sub: 'Solid foundation — push your savings rate higher to level up' }
  if (score >= 40) return { headline: 'Fair', sub: 'Making progress — focus on saving more and spending consistently' }
  return { headline: 'Needs work', sub: 'Start by building a regular savings habit' }
}

// ─── AnnualSummary ────────────────────────────────────────────────────────────

function AnnualSummary({ transactions, salary, fixedCosts, savingsEntries, selectedYear, onNavigate }) {
  const gross            = salary.gross
  const taxAmount        = gross * (salary.taxRate / 100)
  const deductionsAnnual = salary.deductions * 12
  const monthlyExtra     = salary.extraIncome || 0
  const extraAnnual      = monthlyExtra * 12
  const salaryAnnualNet  = gross > 0 ? gross - taxAmount - deductionsAnnual : 0
  const annualNet        = salaryAnnualNet + extraAnnual
  const monthlyNet       = annualNet / 12

  const fixedMonthlyTotal    = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + monthlyRate(c), 0)
  const fixedAnnualProjected = fixedMonthlyTotal * 12

  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === selectedYear
  )
  const debits = allDebitsAnn.filter(t => !isSaving(t.category))

  const txnSpent       = debits.reduce((s, t) => s + t.amount, 0)
  const monthsWithData = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  const avgMonthlyVariable = monthsWithData > 0 ? txnSpent / monthsWithData : null
  const projectedVariable  = avgMonthlyVariable !== null ? avgMonthlyVariable * 12 : null
  const totalExpensesProj  = projectedVariable !== null ? fixedAnnualProjected + projectedVariable : null

  // YTD figures — today's date for income (only relevant when viewing current year)
  const today         = new Date()
  const todayYear     = today.getFullYear().toString()
  const todayMonthIdx = today.getMonth() + 1
  const dayOfMonth    = today.getDate()
  const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed = todayYear === selectedYear ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth : monthsWithData

  const fixedYTD    = fixedMonthlyTotal * monthsElapsed
  const totalExpYTD = txnSpent + fixedYTD
  const incomeToDate = monthlyNet * monthsElapsed

  const monthlySavingsTotal = savingsEntries.reduce((s, e) => s + monthlyRate(e), 0)
  const leftoverYTD         = Math.max(0, incomeToDate - totalExpYTD)
  const allSavingsYTD       = leftoverYTD + monthlySavingsTotal * monthsElapsed
  const totalSavingsYTD     = allSavingsYTD > 0 ? allSavingsYTD : null
  const savingsRateYTD      = incomeToDate > 0 && allSavingsYTD > 0 ? (allSavingsYTD / incomeToDate) * 100 : null

  // Projected savings = projected leftover + savings entries × 12
  const projectedLeftover = totalExpensesProj !== null ? Math.max(0, annualNet - totalExpensesProj) : null
  const projectedSavings  = projectedLeftover !== null
    ? projectedLeftover + monthlySavingsTotal * 12
    : (monthlySavingsTotal > 0 ? monthlySavingsTotal * 12 : null)
  const savingsRate       = annualNet > 0 && projectedSavings !== null ? (projectedSavings / annualNet) * 100 : null

  // Per-category breakdown for income statement
  const fixedCostItems = fixedCosts.filter(c => !isSaving(c.category))
  const varByCategory = {}
  for (const t of debits) {
    const cat = t.category || 'Uncategorized'
    varByCategory[cat] = (varByCategory[cat] || 0) + t.amount
  }


  // Monthly variable spend totals for Spending Trend metric
  const monthlySpendTotals = (() => {
    const ymSpend = {}
    for (const t of debits) {
      const ym = yearMonthOf(t.date)
      if (ym) ymSpend[ym] = (ymSpend[ym] || 0) + t.amount
    }
    return Object.keys(ymSpend).sort().map(ym => ymSpend[ym] + fixedMonthlyTotal)
  })()

  const healthScore   = calcFinancialHealthScore({ savingsRate, savingsRateYTD, totalExpensesProj, projectedVariable, annualNet, fixedAnnualProjected, monthsWithData, monthlySpendTotals })
  const annualScoreColor = healthScore === null ? '#6B7280'
    : healthScore.score >= 85 ? '#00C896'
    : healthScore.score >= 70 ? '#0D9488'
    : healthScore.score >= 55 ? '#3B82F6'
    : healthScore.score >= 40 ? '#F59E0B'
    : healthScore.score >= 20 ? '#F97316'
    : '#EF4444'
  const annualInsight = healthScore !== null ? getAnnualInsight(healthScore.score) : null
  const [healthExpanded, setHealthExpanded] = useState(false)

  if (annualNet === 0 && debits.length === 0 && fixedCosts.length === 0 && savingsEntries.length === 0) {
    return (
      <EmptyState
        icon="📈"
        title="No annual data yet"
        description="Add your salary and import transactions to see your annual income statement, projections, and performance summary."
        actionLabel="Add Salary"
        onAction={() => onNavigate('salary')}
      />
    )
  }

  return (
    <div>

      {/* Financial Health Score card */}
      {healthScore !== null ? (
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 overflow-hidden budgli-card-pop" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {/* Score header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-end gap-1 shrink-0">
              <span className="text-[72px] font-black leading-none tabular-nums" style={{ color: annualScoreColor }}>
                {healthScore.score}
              </span>
              <span className="text-sm font-semibold text-gray-300 leading-none mb-2.5">/100</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Annual Score</p>
                <HelpTip text="A score based on your savings, spending, and consistency." />
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{annualInsight.headline}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{annualInsight.sub}</p>
            </div>
          </div>
          {/* Contributors */}
          <div className="space-y-3">
            {healthScore.components.map(c => {
              const pct = Math.max(0, Math.min(100, (c.value / c.max) * 100))
              return (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{c.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: annualScoreColor }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-12 text-right shrink-0" style={{ color: annualScoreColor }}>
                    {c.value}<span className="text-gray-300 font-normal">/{c.max}</span>
                  </span>
                </div>
              )
            })}
          </div>
          {/* How is this calculated? */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => setHealthExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              How is this calculated?
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${healthExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              ><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${healthExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="pt-3 space-y-2.5">
                  {healthScore.components.map(c => (
                    <div key={c.label} className="flex gap-3 text-xs">
                      <span className="w-28 shrink-0 font-medium text-gray-700">
                        {c.label} <span className="font-normal text-gray-400">{c.value}/{c.max}</span>
                      </span>
                      <span className="text-gray-500 leading-relaxed">{c.tip}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-0.5">Your score updates as you import more data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 flex items-center gap-4 budgli-card-pop" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Annual Score</p>
            <p className="text-2xl font-black text-gray-200">—</p>
          </div>
          <p className="text-xs text-gray-400 ml-2">Add salary details to generate your score</p>
        </div>
      )}

      {/* KPI cards — Year at a Glance */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4" style={{ color: '#8896B0' }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Year at a Glance</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Annual Net Income */}
          <div className="rounded-[14px] bg-white px-4 py-4 min-h-[95px] budgli-card-pop" style={{ borderTop: '3px solid #00C896', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', animationDelay: '60ms' }}>
            <div className="flex items-center gap-1.5 mb-2.5" style={{ color: '#00C896' }}>
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Annual Net Income</span>
              <HelpTip text="Your take-home pay after tax and deductions." />
            </div>
            <p className={`font-bold tabular-nums tracking-tight ${annualNet > 0 ? 'text-gray-900' : 'text-gray-300'}`} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {annualNet > 0 ? fmt(annualNet) : '—'}
            </p>
          </div>

          {/* Total Expenses YTD */}
          <div className="rounded-[14px] bg-white px-4 py-4 min-h-[95px] budgli-card-pop" style={{ borderTop: '3px solid #E05252', boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)', animationDelay: '100ms' }}>
            <div className="flex items-center gap-1.5 mb-2.5" style={{ color: '#E05252' }}>
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Total Expenses YTD</span>
            </div>
            <p className={`font-bold tabular-nums tracking-tight ${totalExpYTD > 0 ? '' : 'text-gray-300'}`} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: totalExpYTD > 0 ? '#E05252' : undefined }}>
              {totalExpYTD > 0 ? fmt(totalExpYTD) : '—'}
            </p>
          </div>

          {/* Savings YTD */}
          <div className="rounded-[14px] bg-white px-4 py-4 min-h-[95px] budgli-card-pop" style={{ borderTop: '3px solid #00C896', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', animationDelay: '140ms' }}>
            <div className="flex items-center gap-1.5 mb-2.5" style={{ color: '#00C896' }}>
              <PiggyBank className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Savings YTD</span>
            </div>
            <p className={`font-bold tabular-nums tracking-tight ${totalSavingsYTD > 0 ? '' : 'text-gray-300'}`} style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: totalSavingsYTD > 0 ? '#00C896' : undefined }}>
              {totalSavingsYTD > 0 ? fmt(totalSavingsYTD) : '—'}
            </p>
          </div>

          {/* Savings Rate YTD */}
          {(() => {
            const rateColor = savingsRateYTD === null ? '#D1D5DB' : savingsRateYTD >= 20 ? '#00C896' : savingsRateYTD >= 10 ? '#B45309' : '#E05252'
            return (
              <div className="rounded-[14px] bg-white px-4 py-4 min-h-[95px] budgli-card-pop" style={{ borderTop: `3px solid ${rateColor}`, boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)', animationDelay: '180ms' }}>
                <div className="flex items-center gap-1.5 mb-2.5" style={{ color: rateColor }}>
                  <Percent className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Savings Rate YTD</span>
                  <HelpTip text="How much of your income you kept instead of spending." />
                </div>
                <p className="font-bold tabular-nums tracking-tight" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: savingsRateYTD === null ? '#D1D5DB' : rateColor }}>
                  {savingsRateYTD === null ? '—' : savingsRateYTD.toFixed(1) + '%'}
                </p>
              </div>
            )
          })()}

        </div>
      </div>

      {/* Annual P&L card */}
      <div className="budgli-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-bold text-gray-800">Annual Financial Summary</h2>
          <span className="text-sm text-gray-400 ml-1">— {selectedYear}</span>
        </div>

        {/* Income rows */}
        <div className="divide-y divide-gray-50">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-600">Gross Annual Salary</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{gross > 0 ? fmt(gross) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-500">Income Tax ({salary.taxRate}%)</span>
            <span className="text-sm font-medium tabular-nums" style={{ color: '#64748B' }}>{gross > 0 ? '− ' + fmt(taxAmount) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-400 italic">Monthly Deductions × 12</span>
            <span className="text-sm italic tabular-nums" style={{ color: '#64748B' }}>{salary.deductions > 0 ? '− ' + fmt(deductionsAnnual) : '—'}</span>
          </div>
          {monthlyExtra > 0 && (
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-gray-500">Other Monthly Income × 12</span>
              <span className="text-sm font-medium text-[#00C896] tabular-nums">+ {fmt(extraAnnual)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Annual Net Income</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{annualNet > 0 ? fmt(annualNet) : '—'}</span>
        </div>

        <div className="pt-2" />

        {/* Expense rows */}
        <div className="divide-y divide-gray-50">
          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center"><span className="text-sm text-gray-600">Fixed Costs × 12</span><HelpTip text="Recurring monthly expenses like rent or subscriptions." /></div>
            <span className="text-sm font-medium tabular-nums" style={{ color: '#3B5998' }}>{fixedAnnualProjected > 0 ? fmt(fixedAnnualProjected) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center"><span className="text-sm text-gray-600">Variable Spending YTD</span><HelpTip text="Day-to-day expenses that vary each month." /></div>
            <span className="text-sm font-medium tabular-nums" style={{ color: '#B45309' }}>{monthsWithData > 0 ? fmt(txnSpent) : '—'}</span>
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
        <div className="border-t border-gray-100 divide-y divide-gray-50 pt-1">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-600">Savings YTD</span>
            <span className="text-sm font-medium text-[#00C896] tabular-nums">{allSavingsYTD > 0 ? fmt(allSavingsYTD) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center"><span className="text-sm font-semibold text-gray-700">Projected Savings (full year)</span><HelpTip text="Estimated year-end savings based on this month's rate." /></div>
            <span className={`text-xl font-bold tabular-nums ${
              projectedSavings === null ? 'text-gray-300' : 'text-[#00C896]'
            }`}>
              {projectedSavings === null ? '—' : fmt(projectedSavings)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center"><span className="text-sm text-gray-500">Savings Rate</span><HelpTip text="How much of your income you kept instead of spending." /></div>
            <span className={`text-xl font-bold tabular-nums ${
              savingsRate === null ? 'text-gray-300'
              : savingsRate >= 20 ? 'text-[#00C896]'
              : savingsRate >= 10 ? 'text-amber-500'
              : 'text-red-400'
            }`}>
              {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
            </span>
          </div>
        </div>
      </div>

      {/* YTD Income Statement — matches Monthly Income Statement format */}
      {(() => {
        const fixedRows = fixedCostItems.map(c => ({
          name: c.name,
          amount: monthlyRate(c) * monthsElapsed,
          hex: CATEGORY_COLOR[c.category] || '#9CA3AF',
        }))

        const varRows = Object.entries(varByCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => ({ name: cat, amount: amt, hex: CATEGORY_COLOR[cat] || '#9CA3AF' }))

        const savingsRows = savingsEntries.map(e => ({
          name: e.name,
          amount: monthlyRate(e) * monthsElapsed,
          hex: CATEGORY_COLOR[e.category] || '#00C896',
        }))

        const Row = ({ name, amount, hex }) => (
          <div className="flex items-center gap-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
            <span className="flex-1 text-sm text-gray-600 truncate">{name}</span>
            <span className="text-sm font-medium text-gray-700 tabular-nums">{fmt(amount)}</span>
          </div>
        )

        return (
          <div className="budgli-card rounded-xl overflow-hidden mb-6">

            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">YTD Income Statement</h2>
              <p className="text-xs text-gray-400">{selectedYear}{monthsWithData > 0 ? ` · ${monthsWithData} mo` : ''}</p>
            </div>

            {/* NET INCOME */}
            <div>
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Net Income</p>
              </div>
              <div className="px-5">
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-700">Net Income YTD</span>
                    <HelpTip text="Take-home pay accumulated so far this year." />
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${incomeToDate > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {incomeToDate > 0 ? fmt(incomeToDate) : annualNet === 0 ? 'Add salary →' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* FIXED COSTS */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Fixed Costs</p>
              </div>
              <div className="px-5">
                {fixedRows.length > 0
                  ? fixedRows.map((r, i) => <Row key={i} {...r} />)
                  : <p className="text-xs text-gray-300 py-2">No fixed costs set up</p>
                }
                {fixedRows.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-0.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Fixed</span>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">{fmt(fixedRows.reduce((s, r) => s + r.amount, 0))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* VARIABLE COSTS */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Variable Costs</p>
              </div>
              <div className="px-5">
                {varRows.length > 0
                  ? varRows.map((r, i) => <Row key={i} {...r} />)
                  : <p className="text-xs text-gray-300 py-2">No variable transactions this year</p>
                }
                {varRows.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-0.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Variable</span>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">{fmt(varRows.reduce((s, r) => s + r.amount, 0))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SAVINGS */}
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Savings</p>
              </div>
              <div className="px-5">
                {savingsRows.length > 0
                  ? savingsRows.map((r, i) => <Row key={i} {...r} />)
                  : <p className="text-xs text-gray-300 py-2">No savings allocations set up</p>
                }
              </div>
            </div>

            {/* TOTALS FOOTER */}
            <div className="px-5 py-3 border-t-2 border-gray-200 space-y-1.5">
              {leftoverYTD > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">Surplus</span>
                  <span className="text-sm font-medium tabular-nums" style={{ color: '#00C896' }}>{fmt(leftoverYTD)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-semibold text-gray-700">Total Savings YTD</span>
                <span className={`text-sm font-bold tabular-nums ${allSavingsYTD > 0 ? 'text-[#00C896]' : 'text-gray-300'}`}>
                  {allSavingsYTD > 0 ? fmt(allSavingsYTD) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Savings Rate</span>
                  <HelpTip text="How much of your income you kept instead of spending." />
                </div>
                <span className={`text-sm font-semibold tabular-nums ${
                  savingsRateYTD === null ? 'text-gray-300'
                  : savingsRateYTD >= 20 ? 'text-[#00C896]'
                  : savingsRateYTD >= 10 ? 'text-amber-500'
                  : 'text-red-400'
                }`}>
                  {savingsRateYTD === null ? '—' : savingsRateYTD.toFixed(1) + '%'}
                </span>
              </div>
            </div>

          </div>
        )
      })()}

    </div>
  )
}

// ─── YearComparison ──────────────────────────────────────────────────────────

function YearComparison({ transactions, fixedCosts, savingsEntries, salaries, onNavigate }) {
  function fixedMonthlyForYear(year) {
    return fixedCosts
      .filter(c => !isSaving(c.category) && (!c.year || c.year === year))
      .reduce((s, c) => s + monthlyRate(c), 0)
  }
  function savingsMonthlyForYear(year) {
    return savingsEntries
      .filter(e => !e.year || e.year === year)
      .reduce((s, e) => s + monthlyRate(e), 0)
  }

  const years = [...new Set(
    transactions.map(t => t.date?.slice(0, 4)).filter(y => y?.length === 4)
  )].sort()

  const YEAR_COLORS = ['#00C896', '#F59E0B', '#A855F7', '#EC4899']
  const [selectedYear, setSelectedYear] = useState(null)

  if (years.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No comparison data yet"
        description="Import transactions from at least one year to start comparing your financial performance over time."
        actionLabel="Import Transactions"
        onAction={() => onNavigate('transactions')}
      />
    )
  }

  const currentYear  = selectedYear && years.includes(selectedYear) ? selectedYear : years[years.length - 1]
  const selectedIdx  = years.indexOf(currentYear)
  const prevYear     = selectedIdx > 0 ? years[selectedIdx - 1] : null
  const displayYears = [prevYear, currentYear].filter(Boolean)

  // Per-year metrics
  const yearMetrics = years.map(year => {
    const fixedMo = fixedMonthlyForYear(year)
    const savMo   = savingsMonthlyForYear(year)
    const yearDebits = transactions.filter(t =>
      t.date?.startsWith(year) &&
      t.type === 'debit' &&
      !EXCLUDE_FROM_TOTALS.has(t.category) &&
      !isSaving(t.category)
    )
    const monthsWithData = new Set(yearDebits.map(t => t.date?.slice(0, 7))).size
    const variableSpend  = yearDebits.reduce((s, t) => s + t.amount, 0)
    const fixedYTD       = fixedMo * monthsWithData
    const totalSpend     = variableSpend + fixedYTD
    const savingsYTD     = savMo * monthsWithData
    const avgMonthly     = monthsWithData > 0 ? totalSpend / monthsWithData : 0
    return { year, variableSpend, fixedYTD, totalSpend, savingsYTD, monthsWithData, avgMonthly, fixedMo }
  })

  const currM = yearMetrics.find(m => m.year === currentYear)
  const prevM = prevYear ? yearMetrics.find(m => m.year === prevYear) : null

  function pctChange(curr, prev) {
    if (!prev || prev === 0) return null
    return ((curr - prev) / prev) * 100
  }

  // Monthly grouped bar chart data
  const monthlyData = MONTHS.map(m => {
    const entry = { name: m.label.slice(0, 3) }
    displayYears.forEach(year => {
      const fixedMo = yearMetrics.find(ym => ym.year === year)?.fixedMo ?? 0
      const v = transactions
        .filter(t =>
          t.date?.startsWith(`${year}-${m.id}`) &&
          t.type === 'debit' &&
          !EXCLUDE_FROM_TOTALS.has(t.category) &&
          !isSaving(t.category)
        )
        .reduce((s, t) => s + t.amount, 0)
      entry[year] = v > 0 ? v + fixedMo : 0
    })
    return entry
  })

  // YoY delta per month
  const deltaData = prevYear ? MONTHS.map(m => {
    const curr  = (monthlyData.find(d => d.name === m.label.slice(0, 3)) || {})[currentYear] || 0
    const prev  = (monthlyData.find(d => d.name === m.label.slice(0, 3)) || {})[prevYear]    || 0
    const delta = curr - prev
    return { name: m.label.slice(0, 3), delta }
  }).filter(d => d.delta !== 0) : []

  // Category breakdown
  const catData = CATEGORY_GROUPS
    .filter(g => g.name !== 'Savings')
    .map(g => {
      const totals = {}
      displayYears.forEach(year => {
        totals[year] = transactions
          .filter(t => t.date?.startsWith(year) && t.type === 'debit' && g.cats.includes(t.category))
          .reduce((s, t) => s + t.amount, 0)
      })
      return { name: g.name, hex: g.hex, totals }
    })
    .filter(g => displayYears.some(y => g.totals[y] > 0))
    .sort((a, b) => (b.totals[currentYear] || 0) - (a.totals[currentYear] || 0))

  const kpiCards = [
    { label: 'Total Spend',    curr: currM?.totalSpend,    prev: prevM?.totalSpend,    accentColor: '#E05252', invert: true  },
    { label: 'Variable Spend', curr: currM?.variableSpend, prev: prevM?.variableSpend, accentColor: '#B45309', invert: true  },
    { label: 'Savings',        curr: currM?.savingsYTD,    prev: prevM?.savingsYTD,    accentColor: '#00C896', invert: false },
    { label: 'Avg Monthly',    curr: currM?.avgMonthly,    prev: prevM?.avgMonthly,    accentColor: '#0D9488', invert: true  },
  ]

  function buildPie(year) {
    return CATEGORY_GROUPS
      .filter(g => g.name !== 'Savings')
      .map(g => ({
        name:  g.name,
        value: transactions
          .filter(t => t.date?.startsWith(year) && t.type === 'debit' && g.cats.includes(t.category))
          .reduce((s, t) => s + t.amount, 0),
        fill: g.hex,
      }))
      .filter(d => d.value > 0)
  }

  const currPie = buildPie(currentYear)
  const prevPie = prevYear ? buildPie(prevYear) : []

  // Income breakdown cards — use salary for the currently selected year
  const currSalary = salaries?.[currentYear] ?? salaries?.global ?? { gross: 0, taxRate: 30, deductions: 0 }
  const gross      = currSalary.gross ?? 0
  const prevSalaryData = prevYear ? (salaries?.[prevYear] ?? salaries?.global ?? { gross: 0 }) : null
  const prevGross      = prevSalaryData?.gross ?? 0
  const taxAmt   = gross * ((currSalary.taxRate ?? 0) / 100)
  const dedAmt   = (currSalary.deductions ?? 0) * 12
  function pctOf(val) { return gross > 0 ? (val / gross) * 100 : null }
  function annualise(ym) {
    if (!ym) return null
    const scale = ym.monthsWithData > 0 ? 12 / ym.monthsWithData : 1
    return { fixedAnn: ym.fixedYTD * scale, varAnn: ym.variableSpend * scale, savAnn: ym.savingsYTD * scale }
  }
  const currB = annualise(currM)
  const prevB = annualise(prevM)
  const compCards = gross > 0 ? [
    { label: 'Gross Income',      color: '#00C896', currAmt: gross,           pct: 100,                    prevPct: 100,                    hideYoY: true, note: 'Baseline — 100%' },
    { label: 'Income Tax',        color: '#64748B', currAmt: taxAmt,          pct: pctOf(taxAmt),          prevPct: pctOf(taxAmt),          hideYoY: true },
    { label: 'Deductions',        color: '#64748B', currAmt: dedAmt,          pct: pctOf(dedAmt),          prevPct: pctOf(dedAmt),          hideYoY: true },
    { label: 'Fixed Costs',       color: '#3B5998', currAmt: currB?.fixedAnn, pct: pctOf(currB?.fixedAnn), prevPct: pctOf(prevB?.fixedAnn), invert: true  },
    { label: 'Variable Spending', color: '#B45309', currAmt: currB?.varAnn,   pct: pctOf(currB?.varAnn),   prevPct: pctOf(prevB?.varAnn),   invert: true  },
    { label: 'Savings',           color: '#00C896', currAmt: currB?.savAnn,   pct: pctOf(currB?.savAnn),   prevPct: pctOf(prevB?.savAnn),   invert: false },
  ] : null

  const totalSpendChg = pctChange(currM?.totalSpend,    prevM?.totalSpend)
  const savingsChg    = pctChange(currM?.savingsYTD,    prevM?.savingsYTD)
  const avgMonthlyChg = pctChange(currM?.avgMonthly,    prevM?.avgMonthly)

  const currSavRate = currM && (currM.totalSpend + currM.savingsYTD) > 0
    ? (currM.savingsYTD / (currM.totalSpend + currM.savingsYTD)) * 100 : null
  const prevSavRate = prevM && (prevM.totalSpend + prevM.savingsYTD) > 0
    ? (prevM.savingsYTD / (prevM.totalSpend + prevM.savingsYTD)) * 100 : null

  const isImproving = prevYear != null && (
    (totalSpendChg !== null && totalSpendChg < 0) ||
    (savingsChg !== null && savingsChg > 0)
  )

  const bannerText = (() => {
    if (!prevYear || !currM) return null
    if (totalSpendChg !== null) {
      const abs = Math.abs(currM.totalSpend - (prevM?.totalSpend ?? 0))
      return totalSpendChg < 0
        ? `You spent ${Math.abs(totalSpendChg).toFixed(1)}% less in ${currentYear} — ${fmt(abs)} saved vs ${prevYear}.`
        : `Spending was up ${Math.abs(totalSpendChg).toFixed(1)}% in ${currentYear} vs ${prevYear} — ${fmt(abs)} more than last year.`
    }
    return `Comparing ${currentYear} to ${prevYear}.`
  })()

  const bannerSubtext = (() => {
    if (!prevYear || !currM || !prevM) return null
    const spendDown = totalSpendChg !== null && totalSpendChg < 0
    const savUp     = savingsChg !== null && savingsChg > 0
    let s1 = ''
    if (isImproving) {
      if (spendDown && savUp)  s1 = "You're spending less and saving more."
      else if (spendDown)      s1 = `You spent ${Math.abs(totalSpendChg).toFixed(1)}% less in ${currentYear}.`
      else if (savUp)          s1 = `Your savings grew ${Math.abs(savingsChg).toFixed(1)}% vs ${prevYear}.`
    } else {
      s1 = totalSpendChg !== null
        ? `Spending was up ${Math.abs(totalSpendChg).toFixed(1)}% vs ${prevYear}.`
        : `No clear improvement vs ${prevYear} yet.`
    }
    const rateText = currSavRate !== null && prevSavRate !== null
      ? ` Your savings rate ${isImproving ? 'improved' : 'changed'} from ${prevSavRate.toFixed(1)}% to ${currSavRate.toFixed(1)}%.`
      : ''
    return s1 + rateText
  })()

  const ALLOC_COLORS = {
    'Income Tax':        '#64748B',
    'Deductions':        '#9CA3AF',
    'Fixed Costs':       '#3B82F6',
    'Variable Spending': '#F59E0B',
    'Savings':           '#00C896',
  }

  const allocationItems = compCards
    ? compCards
        .filter(c => c.label !== 'Gross Income' && c.pct !== null && c.pct > 0)
        .map(c => ({
          label:   c.label,
          pct:     c.pct,
          prevPct: c.prevPct,
          currAmt: c.currAmt,
          color:   ALLOC_COLORS[c.label] ?? c.color,
          invert:  c.invert ?? false,
          hideYoY: c.hideYoY ?? false,
        }))
    : []

  const spendRows = [
    { label: 'Income',            curr: gross > 0 ? gross : null,  prev: prevGross > 0 ? prevGross : null, invert: false, icon: 'income'   },
    { label: 'Variable Spending', curr: currM?.variableSpend,       prev: prevM?.variableSpend,             invert: true,  icon: 'variable' },
    { label: 'Total Spending',    curr: currM?.totalSpend,          prev: prevM?.totalSpend,                invert: true,  icon: 'total'    },
    { label: 'Fixed Costs',       curr: currM?.fixedYTD,            prev: prevM?.fixedYTD,                  invert: true,  icon: 'fixed'    },
    { label: 'Savings',           curr: currM?.savingsYTD,          prev: prevM?.savingsYTD,                invert: false, icon: 'savings'  },
    { label: 'Savings Rate',      curr: currSavRate,                 prev: prevSavRate,                      invert: false, isPct: true, icon: 'rate'    },
    { label: 'Avg Monthly Spend', curr: currM?.avgMonthly,          prev: prevM?.avgMonthly,                invert: true,  icon: 'monthly'  },
  ]

  const topCatCards = catData.slice(0, 4).map(g => {
    const curr = g.totals[currentYear] || 0
    const prev = prevYear ? (g.totals[prevYear] || 0) : null
    const chg  = pctChange(curr, prev)
    return { name: g.name, hex: g.hex, curr, prev, chg }
  })

  function SIcon({ k }) {
    const s = { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.8, className: 'w-[15px] h-[15px] shrink-0 text-gray-400' }
    if (k === 'income')   return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    if (k === 'variable') return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm5.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
    if (k === 'total')    return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
    if (k === 'fixed')    return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
    if (k === 'savings')  return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941"/></svg>
    if (k === 'rate')     return <svg {...s}><circle cx="9" cy="9" r="2.25"/><circle cx="15" cy="15" r="2.25"/><line x1="16.5" y1="7.5" x2="7.5" y2="16.5" strokeLinecap="round"/></svg>
    if (k === 'monthly')  return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"/></svg>
    return null
  }

  return (
    <div className="space-y-4">

      {/* Year selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Year</span>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                y === currentYear ? 'bg-[#00C896] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >{y}</button>
          ))}
        </div>
        {prevYear && (
          <p className="text-xs text-gray-400">
            Comparing <span className="font-medium text-gray-600">{currentYear}</span> vs{' '}
            <span className="font-medium text-gray-600">{prevYear}</span>
          </p>
        )}
      </div>

      {/* Banner */}
      {bannerText && (
        <div
          className="rounded-2xl p-6 sm:p-8 flex items-center gap-5 sm:gap-8 relative overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${isImproving ? '#BBF7D0' : '#FDE68A'}`,
            minHeight: '148px',
          }}
        >
          {/* Icon circle */}
          <div
            className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isImproving ? '#DCFCE7' : '#FEF3C7' }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ color: isImproving ? '#15803D' : '#92400E' }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold mb-1.5" style={{ color: isImproving ? '#00C896' : '#D97706' }}>
              {isImproving ? 'Improving' : 'Room to improve'}
            </p>
            <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: '#1E293B' }}>
              {bannerSubtext || bannerText}
            </p>
          </div>

          {/* Decorative upward-trend accent */}
          <div className="hidden sm:flex shrink-0 items-end opacity-[0.12] pointer-events-none select-none">
            <svg width="96" height="56" viewBox="0 0 96 56" fill="none">
              <polyline
                points="2,52 24,36 48,22 72,10 94,2"
                stroke={isImproving ? '#00C896' : '#D97706'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="94" cy="2" r="4" fill={isImproving ? '#00C896' : '#D97706'} />
            </svg>
          </div>
        </div>
      )}

      {/* Two-column: Spending Breakdown + Income Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Spending Breakdown */}
        <div className="budgli-card rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#8896B0' }}>Spending Breakdown</p>
          <div className="divide-y divide-gray-50">
            {spendRows.map(row => {
              if (!row.curr) return null
              const chg    = pctChange(row.curr, row.prev)
              const isGood = chg === null ? null : (row.invert ? chg < 0 : chg > 0)
              return (
                <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <SIcon k={row.icon} />
                    <span className="text-sm text-gray-600">{row.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {prevYear && chg !== null && (
                      <span className={`text-xs font-semibold ${isGood ? 'text-[#00C896]' : 'text-red-400'}`}>
                        {chg > 0 ? '+' : ''}{chg.toFixed(1)}%
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-800 tabular-nums w-20 text-right">
                      {row.isPct ? `${row.curr.toFixed(1)}%` : fmt(row.curr)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Where Your Income Went */}
        {allocationItems.length > 0 ? (
          <div className="budgli-card rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#8896B0' }}>Where Your Income Went</p>
            <p className="text-xs text-gray-400 mb-4">{currentYear} · as % of {fmt(gross)} gross</p>

            {/* Stacked bar */}
            <div className="flex h-7 rounded-lg overflow-hidden mb-5">
              {allocationItems.map(item => (
                <div
                  key={item.label}
                  style={{ flex: item.pct, backgroundColor: item.color }}
                  title={`${item.label}: ${item.pct.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {allocationItems.map(item => {
                const delta  = !item.hideYoY && item.prevPct !== null ? item.pct - item.prevPct : null
                const isGood = delta === null ? null : (item.invert ? delta < 0 : delta > 0)
                return (
                  <div key={item.label} className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 text-xs text-gray-600 min-w-0 truncate">{item.label}</span>
                    {item.currAmt != null && item.currAmt > 0 && (
                      <span className="text-xs text-gray-500 tabular-nums shrink-0">{fmt(item.currAmt)}</span>
                    )}
                    <span className="text-xs font-semibold text-gray-700 tabular-nums shrink-0 w-10 text-right">{item.pct.toFixed(1)}%</span>
                    {prevYear && !item.hideYoY ? (
                      delta !== null ? (
                        <span className={`text-xs font-semibold shrink-0 w-14 text-right ${isGood ? 'text-[#00C896]' : 'text-red-400'}`}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}pp
                        </span>
                      ) : <span className="w-14 shrink-0" />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="budgli-card rounded-xl p-5 flex flex-col justify-center items-center text-center min-h-[200px]">
            <p className="text-sm font-medium text-gray-500 mb-1">Add income to see allocation</p>
            <p className="text-xs text-gray-400">Set your gross salary in Settings → Income</p>
          </div>
        )}

      </div>

      {/* What Changed Most — top 4 categories */}
      {topCatCards.length > 0 && (
        <div className="budgli-card rounded-xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: '#8896B0' }}>Top Categories</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {topCatCards.map(cat => {
              const isGood = cat.chg === null ? null : cat.chg < 0
              return (
                <div key={cat.name} className="budgli-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.hex + '22' }}
                    >
                      <CatIcon name={cat.name} hex={cat.hex} />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wide leading-tight" style={{ color: '#9CA3AF' }}>{cat.name}</p>
                  </div>
                  <p className="text-xl font-bold tabular-nums text-gray-800 mb-1">{fmt(cat.curr)}</p>
                  {cat.chg !== null ? (
                    <p className={`text-xs font-semibold ${isGood ? 'text-[#00C896]' : 'text-red-400'}`}>
                      {cat.chg > 0 ? '+' : ''}{cat.chg.toFixed(1)}% vs {prevYear}
                    </p>
                  ) : prevYear && cat.prev === 0 ? (
                    <p className="text-xs text-gray-400">New in {currentYear}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#00C896] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}

// ─── GetStartedPage ───────────────────────────────────────────────────────────

function GetStartedPage({ salary, transactions, fixedCosts, onNavigate, onTryDemo }) {
  const hasIncome       = salary.gross > 0
  const hasTransactions = transactions.length > 0
  const untaggedCount   = transactions.filter(
    t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category) && !t.category
  ).length
  const allTagged = hasTransactions && untaggedCount === 0
  const allDone   = hasIncome && hasTransactions && allTagged

  const completedCount = [hasIncome, hasTransactions, allTagged, allDone].filter(Boolean).length

  const steps = [
    {
      num: 1,
      title: 'Set your income',
      desc: "Tell us what you earn. We'll calculate your take-home pay and savings rate.",
      page: 'salary',
      label: 'Set Income',
      done: hasIncome,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      num: 2,
      title: 'Upload a CSV',
      desc: 'Upload a bank statement. Works with RBC, TD, Scotiabank, BMO, and CIBC. Your file is never stored.',
      page: 'transactions',
      label: 'Import CSV',
      done: hasTransactions,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      num: 3,
      title: 'Tag your transactions',
      desc: hasTransactions
        ? untaggedCount > 0
          ? `${untaggedCount} transaction${untaggedCount !== 1 ? 's' : ''} still need a category. Click any row to assign one.`
          : 'All transactions are tagged — nice work!'
        : 'After importing, assign categories to your transactions for accurate spending breakdowns.',
      page: 'transactions',
      label: 'Tag Transactions',
      done: allTagged,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      num: 4,
      title: 'Review your dashboard',
      desc: 'See where your money went — and how much you kept.',
      page: 'dashboard',
      label: 'View Dashboard',
      done: allDone,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-xl">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Get Started</h2>
        <p className="text-sm text-gray-400 mt-1">Complete these four steps to get the most out of Budgli.</p>
      </div>

      {/* Progress bar */}
      <div className="budgli-card rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: '#8896B0' }}>Setup progress</span>
          <span className="text-xs font-medium tabular-nums" style={{ color: completedCount === 4 ? '#00C896' : '#6B7280' }}>
            {completedCount} / 4 complete
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: '#00C896', width: `${(completedCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Try Demo */}
      {onTryDemo && (
        <div className="budgli-card rounded-xl p-5 mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Want to see Budgli first?</p>
            <p className="text-xs text-gray-400 mt-0.5">Explore Budgli with realistic demo data — no setup required.</p>
          </div>
          <button
            onClick={onTryDemo}
            className="shrink-0 bg-[#0D7377] hover:bg-[#0b6268] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Try Demo →
          </button>
        </div>
      )}

      {/* Step list */}
      <div className="space-y-3">
        {steps.map(step => (
          <div
            key={step.num}
            className={`rounded-xl p-5 flex items-start gap-4 ${step.done ? 'border border-[#00C896]/20' : 'budgli-card'}`}
            style={step.done ? { background: 'rgba(0,200,150,0.04)' } : {}}
          >
            {/* Circle indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: step.done ? '#00C896' : '#1A1F2E' }}
            >
              {step.done ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-xs font-bold">{step.num}</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800">
                  {step.title}
                </span>
                {step.done && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#00C89615', color: '#00A87A' }}>
                    Done
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>

            {/* Action */}
            {!step.done && (
              <button
                onClick={() => onNavigate(step.page)}
                className="shrink-0 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#1A1F2E' }}
              >
                {step.label} →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion CTA */}
      {allDone && (
        <div className="mt-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-3 px-6 rounded-xl text-sm font-semibold bg-[#0D7377] hover:bg-[#0b6268] text-white transition-colors"
          >
            Go to your Dashboard →
          </button>
        </div>
      )}

    </div>
  )
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

function SettingsPage({ user, transactions, onClearTransactions, darkMode, onToggleDark }) {
  const [displayName, setDisplayName]   = useState(user.user_metadata?.display_name || '')
  const [nameSaving, setNameSaving]     = useState(false)
  const [nameSaved, setNameSaved]       = useState(false)
  const [pwSent, setPwSent]             = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing]         = useState(false)

  async function handleSaveName() {
    if (!displayName.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  async function handleResetPassword() {
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin })
    setPwSent(true)
  }

  async function handleClearTransactions() {
    setClearing(true)
    await supabase.from('transactions').delete().eq('user_id', user.id)
    localStorage.removeItem(`csvUploads_${user.id}`)
    onClearTransactions()
    setClearing(false)
    setClearConfirm(false)
  }

  function handleExport() {
    if (transactions.length === 0) return
    const rows = [
      ['Date', 'Description', 'Amount', 'Type', 'Category'],
      ...transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `budgli-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const lbl = 'text-[11px] font-semibold uppercase tracking-[0.15em] mb-4 text-[#8896B0]'

  return (
    <div className="max-w-lg space-y-4">

      {/* Appearance */}
      <div className="budgli-card rounded-xl p-6">
        <p className={lbl}>Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Dark Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark interface</p>
          </div>
          <button
            onClick={onToggleDark}
            role="switch"
            aria-checked={darkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-[#00C896]' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="budgli-card rounded-xl p-6">
        <p className={lbl}>Account</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">Signed in as</p>
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Change Password</p>
            <p className="text-xs text-gray-400 mt-0.5">We'll send a reset link to your email</p>
          </div>
          {pwSent ? (
            <span className="text-xs font-medium text-[#00C896]">Reset email sent!</span>
          ) : (
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Send Reset Email
            </button>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="budgli-card rounded-xl p-6">
        <p className={lbl}>Profile</p>
        <label className="block text-xs text-gray-500 mb-1.5">Display Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Your name"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !displayName.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#1A1F2E] text-white hover:bg-[#2d3748] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] text-center"
          >
            {nameSaving ? '…' : nameSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="budgli-card rounded-xl p-6">
        <p className={lbl}>Data</p>
        <div className="space-y-3">

          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Export My Data</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {transactions.length > 0
                  ? `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} as CSV`
                  : 'No transactions to export'}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="ml-4 shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Download CSV
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 border-l-4 border-l-red-300">
            <div>
              <p className="text-sm font-medium text-gray-700">Clear All Transactions</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently deletes all your transaction data</p>
            </div>
            {clearConfirm ? (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className="text-xs font-medium text-red-500 whitespace-nowrap">Are you sure?</span>
                <button
                  onClick={handleClearTransactions}
                  disabled={clearing}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {clearing ? '…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="ml-4 shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* About */}
      <div className="budgli-card rounded-xl p-6">
        <p className={lbl}>About</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-400 font-medium">v1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Support</span>
            <a href="mailto:support@budgli.com" className="text-sm text-[#00C896] font-medium hover:underline">
              support@budgli.com
            </a>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Budgli is a personal finance dashboard for tracking spending, categorizing transactions,
              and understanding your savings rate — all synced to your account.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Storage migration ────────────────────────────────────────────────────────
// Runs once at module load (before any component renders).
// Bumping budgr_version forces a clean slate: wipes old sample-data transactions
// and stale category memory so they can never pollute a fresh import.
;(function migrateStorage() {
  if (localStorage.getItem('budgr_version') !== '3.0') {
    ;['budgr_txns', 'budgr_memory', 'budgr_salary', 'budgr_fixed_costs', 'budgr_dedup_keys'].forEach(k => localStorage.removeItem(k))
    localStorage.setItem('budgr_version', '3.0')
  }
})()

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser]       = useState(undefined)
  const [loading, setLoading] = useState(true)

  const [activePage, setActivePage]         = useState('get-started')
  const [selectedMonth, setSelectedMonth]   = useState('01')
  const [selectedYear, setSelectedYear]     = useState(APP_YEAR)
  const [dragging, setDragging]             = useState(false)
  const [toast, setToast]                   = useState(null)
  const [salaries, setSalaries]             = useState({})
  const [categoryMemory, setCategoryMemory] = useState({})
  const [transactions, setTransactions]     = useState([])
  const [fixedCosts, setFixedCosts]         = useState([])
  const [savingsEntries, setSavingsEntries] = useState([])
  const [customTags, setCustomTags]         = useState([])
  const [dedupKeyCache, setDedupKeyCache]   = useState(new Set())
  const [csvUploads, setCsvUploads]         = useState([])
  const [uploadHistoryOpen, setUploadHistoryOpen] = useState(true)
  const [fuzzyPrompt, setFuzzyPrompt]       = useState(null)
  const [dashVariableOpen, setDashVariableOpen] = useState(false)
  const [dashFixedOpen, setDashFixedOpen]       = useState(false)
  const [dashSavingsOpen, setDashSavingsOpen]   = useState(false)
  const [isDemoMode, setIsDemoMode]         = useState(false)
  const [userGoals, setUserGoals]               = useState(null)
  const [showGoalOnboarding, setShowGoalOnboarding] = useState(false)
  const [mobileNavOpen, setMobileNavOpen]       = useState(false)
  const [reloadKey, setReloadKey]           = useState(0)
  const [pendingImport, setPendingImport]   = useState(null)
  const [pendingMapper, setPendingMapper]   = useState(null)
  const [importing, setImporting]           = useState(false)
  const toastTimerRef = useRef(null)
  const [darkMode, setDarkMode]             = useState(() => {
    try { return localStorage.getItem('budgr_dark') === 'true' } catch { return false }
  })
  const dataLoadedFor   = useRef(null)
  const salaryTimerRef  = useRef(null)
  const pendingSalaryRef = useRef(null)
  const csvInputRef     = useRef(null)

  const dedupKey = t => `${t.date}|${t.amount}|${t.description.toUpperCase().trim()}`

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try { localStorage.setItem('budgr_dark', String(darkMode)) } catch {}
  }, [darkMode])

  function toggleDarkMode() { setDarkMode(d => !d) }

  function freqCacheKey() { return `budgr_freqs_${user?.id || 'anon'}` }
  function loadFreqCache() {
    try { return JSON.parse(localStorage.getItem(freqCacheKey()) || '{}') } catch { return {} }
  }
  function saveFreqCache(id, freq) {
    if (isDemoMode || !user) return
    try {
      const map = loadFreqCache(); map[id] = freq
      localStorage.setItem(freqCacheKey(), JSON.stringify(map))
    } catch {}
  }
  function removeFreqCache(id) {
    if (isDemoMode || !user) return
    try {
      const map = loadFreqCache(); delete map[id]
      localStorage.setItem(freqCacheKey(), JSON.stringify(map))
    } catch {}
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSalaries({})
        setTransactions([])
        setFixedCosts([])
        setSavingsEntries([])
        setCustomTags([])
        setUserGoals(null)
        setCategoryMemory({})
        setCsvUploads([])
        setDedupKeyCache(new Set())
        dataLoadedFor.current = null
      }
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user === undefined) return
    if (user === null) {
      setSalaries({})
      setTransactions([])
      setFixedCosts([])
      setSavingsEntries([])
      setCustomTags([])
      setUserGoals(null)
      setCategoryMemory({})
      setCsvUploads([])
      setDedupKeyCache(new Set())
      setLoading(false)
      dataLoadedFor.current = null
      return
    }
    // supabase.auth.updateUser fires USER_UPDATED which triggers this effect again
    // for the same user — skip the full reload when only metadata changed.
    if (dataLoadedFor.current === user.id) return
    dataLoadedFor.current = user.id

    async function loadData() {
      setLoading(true)
      try {
        const [txnRes, memRes, fixedRes, salaryRes, tagsRes, goalsRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('category_memory').select('*').eq('user_id', user.id),
          supabase.from('fixed_costs').select('*').eq('user_id', user.id),
          supabase.from('salary_settings').select('*').eq('user_id', user.id),
          supabase.from('custom_tags').select('*').eq('user_id', user.id),
          supabase.from('user_goals').select('*').eq('user_id', user.id).maybeSingle(),
        ])
        const storedUploads = JSON.parse(localStorage.getItem(`csvUploads_${user.id}`) || '[]')
        setCsvUploads(storedUploads)

        let mem = {}
        if (memRes.data) {
          memRes.data.forEach(r => { mem[r.key] = r.category })
          setCategoryMemory(mem)
        }

        if (txnRes.data) {
          const txns = txnRes.data.map(r => {
            const descKey    = (r.description ?? '').toUpperCase().trim()
            const remembered = !r.category && mem[descKey]
            return {
              id: r.id, date: r.date, description: r.description,
              amount: r.amount, type: r.type,
              category:   remembered ? mem[descKey] : (r.category ?? ''),
              fromMemory: remembered ? true : (r.from_memory ?? false),
            }
          })
          setTransactions(txns)
          setDedupKeyCache(new Set(txns.map(dedupKey)))

          // Persist auto-applied categories back to Supabase (fire-and-forget)
          const autoTagged = txns.filter(t => t.fromMemory && !txnRes.data.find(r => r.id === t.id)?.category)
          autoTagged.forEach(t => {
            supabase.from('transactions')
              .update({ category: t.category, from_memory: true })
              .eq('id', t.id).eq('user_id', user.id)
          })
        }

        if (fixedRes.data) {
          const freqCache = loadFreqCache()
          const rows = fixedRes.data.map(r => ({ id: r.id, name: r.name, amount: r.amount, category: r.category, frequency: freqCache[r.id] ?? r.frequency ?? 'monthly', isSavings: r.is_savings ?? isSaving(r.category), year: r.year ?? null, start_month: r.start_month ?? null }))
          setFixedCosts(rows.filter(r => !r.isSavings))
          setSavingsEntries(rows.filter(r => r.isSavings))
        }

        if (tagsRes.data) {
          setCustomTags(tagsRes.data.map(r => ({ id: r.id, category: r.category, tag: r.tag })))
        }

        {
          const map = {}
          for (const row of salaryRes.data ?? []) {
            const key = row.year != null ? String(row.year) : 'global'
            map[key] = {
              gross: row.gross_salary ?? 0,
              taxRate: row.tax_rate ?? 30,
              deductions: row.monthly_deductions ?? 0,
              extraIncome: row.extra_income ?? 0,
            }
          }
          // Merge localStorage write-ahead: prefer localStorage ONLY for entries
          // written in the last 5 s (in-flight writes during a refresh). Older
          // localStorage entries lose to the authoritative Supabase data.
          try {
            const lsRaw = localStorage.getItem(`budgr_salary_${user.id}`)
            const lsMap = lsRaw ? JSON.parse(lsRaw) : {}
            for (const [year, entry] of Object.entries(lsMap)) {
              const isInFlight = (entry._ts ?? 0) > Date.now() - 5_000
              if (!map[year] || isInFlight) {
                const { _ts, ...rest } = entry
                map[year] = rest
              }
            }
          } catch {}
          setSalaries(map)
        }

        // User goals — gracefully handles missing table
        {
          const seenKey = `budgr_goals_seen_${user.id}`
          if (!goalsRes.error && goalsRes.data) {
            setUserGoals(goalsRes.data)
            if (!goalsRes.data.onboarding_completed) setShowGoalOnboarding(true)
          } else if (!localStorage.getItem(seenKey)) {
            setShowGoalOnboarding(true)
          }
        }

      } catch (err) {
        console.error('[budgr] load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, reloadKey])

  // Track key page views. Add new pages here as the product grows.
  useEffect(() => {
    if (activePage === 'dashboard')        track('dashboard_viewed')
    if (activePage === 'savings-forecast') track('savings_forecast_viewed')
    // Future: track('pricing_viewed') when a pricing page is added
    // Future: track('upgrade_clicked') on the upgrade CTA
  }, [activePage])

  async function saveUserGoals(goals) {
    const record = {
      user_id: user.id,
      primary_goal:        goals.primary_goal        || null,
      biggest_challenge:   goals.biggest_challenge   || null,
      preferred_help_type: goals.preferred_help_type || null,
      savings_goal:        goals.savings_goal        || null,
      savings_intensity:   goals.savings_intensity   || null,
      onboarding_completed: goals.onboarding_completed ?? true,
    }
    setUserGoals(record)
    setShowGoalOnboarding(false)
    try {
      localStorage.setItem(`budgr_goals_seen_${user.id}`, 'true')
      await supabase.from('user_goals').upsert(record, { onConflict: 'user_id' })
    } catch {}
  }

  function handleGoalSkip() {
    setShowGoalOnboarding(false)
    try { localStorage.setItem(`budgr_goals_seen_${user.id}`, 'true') } catch {}
  }

  function enterDemoMode() {
    // Pre-populate demo forecast balances so the Savings Forecast page looks realistic
    try {
      const demoForecast = JSON.parse(localStorage.getItem('budgr_forecast_demo') || '{}')
      if (!demoForecast.balances || Object.keys(demoForecast.balances).length === 0) {
        localStorage.setItem('budgr_forecast_demo', JSON.stringify({
          balances: {
            'RRSP Contribution|RRSP': 24000,
            'Emergency Fund|Savings': 8500,
            'TFSA Index Fund|TFSA': 15000,
          },
          rateOverrides: {},
          contribAdj: 0,
          goals: [{ id: 'demo-goal-1', name: 'House Down Payment', target: 80000, targetDate: '2029-01-01' }],
        }))
      }
    } catch {}
    setIsDemoMode(true)
    setTransactions(DEMO_TRANSACTIONS)
    setFixedCosts(DEMO_FIXED_COSTS)
    setSavingsEntries(DEMO_SAVINGS_ENTRIES)
    setSalaries({ [String(DEMO_YEAR)]: DEMO_SALARY })
    setSelectedYear(String(DEMO_YEAR))
    setSelectedMonth('05')
    setActivePage('dashboard')
  }

  function exitDemoMode() {
    setIsDemoMode(false)
    setTransactions([])
    setFixedCosts([])
    setSavingsEntries([])
    setSalaries({})
    setSelectedYear(APP_YEAR)
    setSelectedMonth('01')
    dataLoadedFor.current = null
    setReloadKey(k => k + 1)
    setActivePage('get-started')
  }

  async function addFixedCost(cost, year) {
    const freq = cost.frequency ?? 'monthly'
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, name: cost.name, amount: cost.amount, category: cost.category, frequency: freq, isSavings: false, year: year ?? null, start_month: null }
    setFixedCosts(prev => [...prev, optimistic])
    if (isDemoMode) return
    const base = { user_id: user.id, name: cost.name, amount: cost.amount, category: cost.category }
    let { data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, is_savings: false, year }).select().single()
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, is_savings: false }).select().single())
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq }).select().single())
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert(base).select().single())
    if (!error && data) {
      if (year && !data.year) {
        await supabase.from('fixed_costs').update({ year }).eq('id', data.id).eq('user_id', user.id)
      }
      saveFreqCache(data.id, freq)
      setFixedCosts(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id, year: data.year ?? year ?? null } : c))
    } else {
      setFixedCosts(prev => prev.filter(c => c.id !== tempId))
    }
  }

  async function updateFixedCost(id, changes, startMonth) {
    if ('amount' in changes && startMonth) {
      const current = fixedCosts.find(c => c.id === id)
      if (!current || changes.amount === current.amount) return
      const monthInt = new Date().getMonth() + 1
      if (isDemoMode) {
        setFixedCosts(prev => [...prev, { ...current, id: `demo-new-${Date.now()}`, amount: changes.amount, start_month: monthInt }])
        return
      }
      const freq = changes.frequency ?? current.frequency ?? 'monthly'
      const base = { user_id: user.id, name: changes.name ?? current.name, amount: changes.amount, category: changes.category ?? current.category, is_savings: false, year: current.year }
      let { data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, start_month: monthInt }).select().single()
      if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq }).select().single())
      if (error) ({ data, error } = await supabase.from('fixed_costs').insert(base).select().single())
      if (!error && data) {
        saveFreqCache(data.id, freq)
        setFixedCosts(prev => [...prev, { id: data.id, name: data.name, amount: data.amount, category: data.category, frequency: data.frequency ?? freq, isSavings: false, year: data.year ?? current.year ?? null, start_month: data.start_month ?? monthInt }])
      }
    } else {
      if ('frequency' in changes) saveFreqCache(id, changes.frequency)
      setFixedCosts(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))
      if (!isDemoMode) {
        const { error } = await supabase.from('fixed_costs').update(changes).eq('id', id).eq('user_id', user.id)
        if (error) {
          const { frequency: _f, ...rest } = changes
          if (Object.keys(rest).length > 0) await supabase.from('fixed_costs').update(rest).eq('id', id).eq('user_id', user.id)
        }
      }
    }
  }

  async function deleteFixedCost(id) {
    setFixedCosts(prev => prev.filter(c => c.id !== id))
    removeFreqCache(id)
    if (!isDemoMode) {
      const { error } = await supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[budgr] deleteFixedCost failed:', error.message)
    }
  }

  async function addSavingsEntry(entry, year) {
    const freq = entry.frequency ?? 'monthly'
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, name: entry.name, amount: entry.amount, category: entry.category, frequency: freq, isSavings: true, year: year ?? null, start_month: null }
    setSavingsEntries(prev => [...prev, optimistic])
    if (isDemoMode) return
    const base = { user_id: user.id, name: entry.name, amount: entry.amount, category: entry.category }
    let { data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, is_savings: true, year }).select().single()
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, is_savings: true }).select().single())
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq }).select().single())
    if (error) ({ data, error } = await supabase.from('fixed_costs').insert(base).select().single())
    if (!error && data) {
      if (year && !data.year) {
        await supabase.from('fixed_costs').update({ year }).eq('id', data.id).eq('user_id', user.id)
      }
      saveFreqCache(data.id, freq)
      setSavingsEntries(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id, year: data.year ?? year ?? null } : e))
    } else {
      setSavingsEntries(prev => prev.filter(e => e.id !== tempId))
    }
  }

  async function updateSavingsEntry(id, changes, startMonth) {
    if ('amount' in changes && startMonth) {
      const current = savingsEntries.find(e => e.id === id)
      if (!current || changes.amount === current.amount) return
      const monthInt = new Date().getMonth() + 1
      if (isDemoMode) {
        setSavingsEntries(prev => [...prev, { ...current, id: `demo-new-${Date.now()}`, amount: changes.amount, start_month: monthInt }])
        return
      }
      const freq = changes.frequency ?? current.frequency ?? 'monthly'
      const base = { user_id: user.id, name: changes.name ?? current.name, amount: changes.amount, category: changes.category ?? current.category, is_savings: true, year: current.year }
      let { data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq, start_month: monthInt }).select().single()
      if (error) ({ data, error } = await supabase.from('fixed_costs').insert({ ...base, frequency: freq }).select().single())
      if (error) ({ data, error } = await supabase.from('fixed_costs').insert(base).select().single())
      if (!error && data) {
        saveFreqCache(data.id, freq)
        setSavingsEntries(prev => [...prev, { id: data.id, name: data.name, amount: data.amount, category: data.category, frequency: data.frequency ?? freq, isSavings: true, year: data.year ?? current.year ?? null, start_month: data.start_month ?? monthInt }])
      }
    } else {
      if ('frequency' in changes) saveFreqCache(id, changes.frequency)
      setSavingsEntries(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e))
      if (!isDemoMode) {
        const { error } = await supabase.from('fixed_costs').update(changes).eq('id', id).eq('user_id', user.id)
        if (error) {
          const { frequency: _f, ...rest } = changes
          if (Object.keys(rest).length > 0) await supabase.from('fixed_costs').update(rest).eq('id', id).eq('user_id', user.id)
        }
      }
    }
  }

  async function deleteSavingsEntry(id) {
    setSavingsEntries(prev => prev.filter(e => e.id !== id))
    removeFreqCache(id)
    if (!isDemoMode) {
      const { error } = await supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id)
      if (error) console.error('[budgr] deleteSavingsEntry failed:', error.message)
    }
  }

  async function setCategory(id, category) {
    const t = transactions.find(tx => tx.id === id)
    if (!t) return

    const descKey = t.description.toUpperCase().trim()

    // Find all other untagged transactions with the same description (exact match)
    const similar = transactions.filter(
      tx => tx.id !== id && !tx.category && tx.description.toUpperCase().trim() === descKey
    )
    const exactIds = new Set([id, ...similar.map(tx => tx.id)])

    // Apply category to the target + all exact-matching untagged in one state update
    setTransactions(prev => prev.map(tx =>
      exactIds.has(tx.id) ? { ...tx, category, fromMemory: tx.id !== id } : tx
    ))

    // Supabase: update the manually tagged row
    if (!isDemoMode) supabase.from('transactions').update({ category }).eq('id', id).eq('user_id', user.id)
      .then(({ error }) => { if (error) console.error('[budgr] setCategory failed:', error.message) })

    // Supabase: batch update similar untagged rows
    if (similar.length > 0) {
      if (!isDemoMode) {
        supabase.from('transactions')
          .update({ category, from_memory: true })
          .in('id', similar.map(tx => tx.id))
          .eq('user_id', user.id)
          .then(({ error }) => { if (error) console.error('[budgr] batchSetCategory failed:', error.message) })
      }

      clearTimeout(setCategory._timer)
      setToast({ msg: `Auto-tagged ${similar.length} similar transaction${similar.length !== 1 ? 's' : ''}` })
      setCategory._timer = setTimeout(() => setToast(null), 4000)
    }

    // Find fuzzy-similar untagged transactions (not exact matches)
    if (category) {
      const fuzzy = transactions.filter(tx =>
        !exactIds.has(tx.id) &&
        !tx.category &&
        strSimilarity(tx.description.toUpperCase().trim(), descKey) >= 0.75
      )
      if (fuzzy.length > 0) {
        setFuzzyPrompt({ category, matches: fuzzy })
      }
    }

    // Persist to category_memory using full description as key
    if (category && !isDemoMode) {
      setCategoryMemory(prev => ({ ...prev, [descKey]: category }))
      supabase.from('category_memory').upsert(
        { user_id: user.id, key: descKey, category },
        { onConflict: 'user_id,key' }
      )
    }
  }

  function handleFuzzyAccept(selectedIds) {
    if (!fuzzyPrompt) return
    const { category } = fuzzyPrompt
    const idSet = new Set(selectedIds)
    if (idSet.size === 0) { setFuzzyPrompt(null); return }
    setTransactions(prev => prev.map(tx =>
      idSet.has(tx.id) ? { ...tx, category, fromMemory: true } : tx
    ))
    if (!isDemoMode) {
      supabase.from('transactions')
        .update({ category, from_memory: true })
        .in('id', [...idSet])
        .eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('[budgr] fuzzyAccept failed:', error.message) })
    }
    setFuzzyPrompt(null)
    clearTimeout(setCategory._timer)
    setToast({ msg: `Tagged ${idSet.size} transaction${idSet.size !== 1 ? 's' : ''} as "${category}"` })
    setCategory._timer = setTimeout(() => setToast(null), 4000)
  }

  function handleFuzzyDismiss() {
    setFuzzyPrompt(null)
  }

  async function handleDeleteUpload(upload) {
    const ids = upload.txnIds || []
    if (ids.length > 0) {
      if (!isDemoMode) {
        const { error } = await supabase.from('transactions').delete().in('id', ids).eq('user_id', user.id)
        if (error) console.error('[budgr] handleDeleteUpload failed:', error.message)
      }
      setTransactions(prev => prev.filter(t => !ids.includes(t.id)))
      // Remove deleted transaction dedup keys so they can be re-imported if needed
      setDedupKeyCache(prev => {
        const next = new Set(prev)
        transactions.filter(t => ids.includes(t.id)).forEach(t => next.delete(dedupKey(t)))
        return next
      })
    }
    setCsvUploads(prev => {
      const next = prev.filter(x => x.id !== upload.id)
      localStorage.setItem(`csvUploads_${user.id}`, JSON.stringify(next))
      return next
    })
  }

  async function addCustomTag(category, tag) {
    const existing = customTags.find(t => t.category === category)
    if (isDemoMode) {
      if (existing) setCustomTags(prev => prev.map(t => t.category === category ? { ...t, tag } : t))
      else setCustomTags(prev => [...prev, { id: `demo-tag-${Date.now()}`, category, tag }])
      return
    }
    if (existing) {
      const { data } = await supabase.from('custom_tags').update({ tag }).eq('id', existing.id).eq('user_id', user.id).select().single()
      if (data) setCustomTags(prev => prev.map(t => t.id === data.id ? { ...t, tag: data.tag } : t))
    } else {
      const { data } = await supabase.from('custom_tags').insert({ user_id: user.id, category, tag }).select().single()
      if (data) setCustomTags(prev => [...prev, { id: data.id, category: data.category, tag: data.tag }])
    }
  }

  async function removeCustomTag(category) {
    const existing = customTags.find(t => t.category === category)
    if (!existing) return
    if (!isDemoMode) await supabase.from('custom_tags').delete().eq('id', existing.id).eq('user_id', user.id)
    setCustomTags(prev => prev.filter(t => t.category !== category))
  }


  // Stage 1: parse, deduplicate, and categorise — stops before inserting.
  // Shared dedup + category-fallback logic used by both handleFile and handleManualMapping.
  // Takes already-parsed rows with category_memory applied, deduplicates against cache and DB,
  // and calls setPendingImport so the preview modal can display the results.
  async function prepareAndPreview(incoming, format, filename) {
    // Stage 1 — fast dedup via in-memory cache
    const passedCache = incoming.filter(t => !dedupKeyCache.has(dedupKey(t)))

    // Stage 2 — authoritative Supabase dedup; also fetches existing categories for fallback
    let fresh      = passedCache
    let dbExisting = []
    if (passedCache.length > 0) {
      const dates = [...new Set(passedCache.map(t => t.date))]
      const { data } = await supabase
        .from('transactions')
        .select('date, amount, description, category')
        .eq('user_id', user.id)
        .in('date', dates)
      dbExisting = data || []
      const dbKeys = new Set(
        dbExisting.map(r => `${r.date}|${r.amount}|${r.description.toUpperCase().trim()}`)
      )
      fresh = passedCache.filter(t => !dbKeys.has(dedupKey(t)))
    }

    const skipped = incoming.length - fresh.length

    // All dupes — record the attempt, update cache, and bail (no preview needed)
    if (fresh.length === 0) {
      const allDupesUpload = { id: Date.now(), filename, total_count: incoming.length, new_count: 0, uploaded_at: new Date().toISOString() }
      setCsvUploads(prev => {
        const next = [allDupesUpload, ...prev]
        localStorage.setItem(`csvUploads_${user.id}`, JSON.stringify(next))
        return next
      })
      if (dbExisting.length > 0) {
        const nextCache = new Set(dedupKeyCache)
        dbExisting.forEach(r =>
          nextCache.add(`${r.date}|${r.amount}|${r.description.toUpperCase().trim()}`)
        )
        setDedupKeyCache(nextCache)
      }
      setToast({ msg: `No new transactions — all ${skipped} already existed` })
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 4000)
      return
    }

    // Build description→category fallback from the DB rows we already fetched
    const catByDesc = {}
    dbExisting.forEach(r => {
      if (r.category) catByDesc[r.description.toUpperCase().trim()] = r.category
    })

    // For fresh rows still missing a category, query DB across all dates by description
    const untaggedDescs = [...new Set(fresh.filter(t => !t.category).map(t => t.description))]
    if (untaggedDescs.length > 0) {
      const { data: catRows } = await supabase
        .from('transactions')
        .select('description, category')
        .eq('user_id', user.id)
        .not('category', 'is', null)
        .in('description', untaggedDescs.slice(0, 100))
      if (catRows) {
        catRows.forEach(r => {
          const key = r.description.toUpperCase().trim()
          if (!catByDesc[key]) catByDesc[key] = r.category
        })
      }
    }

    // Apply fallback — never leave a row untagged if any source has a category
    const readyToInsert = fresh.map(t => {
      if (t.category) return t
      const fallback = catByDesc[t.description.toUpperCase().trim()]
      return fallback ? { ...t, category: fallback, fromMemory: true } : t
    })

    // Show preview — Supabase insert is deferred until the user confirms
    setPendingImport({ format, filename, skipped, totalParsed: incoming.length, readyToInsert, dbExisting })
  }

  // Stage 1: read the file, detect format, dedup, and set pendingImport for the preview modal.
  function handleFile(file) {
    if (isDemoMode) { setToast({ msg: 'CSV import is disabled in Demo Mode' }); setTimeout(() => setToast(null), 3000); return }
    const reader = new FileReader()
    reader.onload = async e => {
      const text           = e.target.result
      const detectedFormat = detectFormat(text)

      // Unknown format — open the manual column mapper instead of erroring
      if (detectedFormat === 'unknown') {
        const mapperData = parseForMapper(text)
        setPendingMapper({ ...mapperData, filename: file.name })
        return
      }

      // Parse and apply category_memory to all incoming rows
      const incoming = parseCSV(text).map(t => {
        const descKey    = t.description.toUpperCase().trim()
        const remembered = categoryMemory[descKey]
        return { ...t, category: remembered || t.category || '', fromMemory: !!remembered }
      })
      if (incoming.length === 0) {
        setToast({ msg: 'Budgli could not read this CSV. Please check the file format.' })
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
        return
      }

      await prepareAndPreview(incoming, detectedFormat, file.name)
    }
    reader.readAsText(file)
  }

  // Called by CsvColumnMapper when the user confirms their column mapping.
  // Normalizes the raw lines, applies category_memory, then deduplicates and shows the preview.
  async function handleManualMapping(mapping) {
    if (!pendingMapper) return
    const { lines, filename } = pendingMapper
    const raw    = normalizeWithMapping(lines, mapping)
    const parsed = raw.map(t => {
      const descKey    = t.description.toUpperCase().trim()
      const remembered = categoryMemory[descKey]
      return { ...t, category: remembered || t.category || '', fromMemory: !!remembered }
    })
    setPendingMapper(null)
    if (parsed.length === 0) {
      setToast({ msg: 'No valid transactions found with these column settings.' })
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 5000)
      return
    }
    await prepareAndPreview(parsed, 'unknown', filename)
  }

  // Stage 2: insert the previewed transactions after the user confirms.
  async function confirmImport() {
    if (!pendingImport) return
    const { readyToInsert, dbExisting, skipped, filename, totalParsed } = pendingImport
    setImporting(true)

    const newUpload = { id: Date.now(), filename, total_count: totalParsed, new_count: readyToInsert.length, uploaded_at: new Date().toISOString() }
    setCsvUploads(prev => {
      const next = [newUpload, ...prev]
      localStorage.setItem(`csvUploads_${user.id}`, JSON.stringify(next))
      return next
    })

    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert(readyToInsert.map(t => ({
        user_id:     user.id,
        date:        t.date,
        description: t.description,
        amount:      t.amount,
        type:        t.type,
        category:    t.category || null,
        from_memory: t.fromMemory || false,
      })))
      .select()

    if (error) {
      console.error('[import] insert failed:', error)
      setImporting(false)
      return
    }

    track('account_added', { rows: readyToInsert.length })

    const autoTagged = readyToInsert.filter(t => t.category).length
    setToast({ msg: `${readyToInsert.length} new transaction${readyToInsert.length !== 1 ? 's' : ''} imported, ${autoTagged} auto-tagged, ${skipped} already existed` })
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)

    const insertedTxns = inserted.map(r => ({
      id: r.id, date: r.date, description: r.description,
      amount: r.amount, type: r.type, category: r.category ?? '',
      fromMemory: r.from_memory ?? false,
    }))

    const insertedIds = insertedTxns.map(t => t.id)
    setCsvUploads(prev => {
      const next = prev.map(u => u.id === newUpload.id ? { ...u, txnIds: insertedIds } : u)
      localStorage.setItem(`csvUploads_${user.id}`, JSON.stringify(next))
      return next
    })

    const nextCache = new Set(dedupKeyCache)
    dbExisting.forEach(r =>
      nextCache.add(`${r.date}|${r.amount}|${r.description.toUpperCase().trim()}`)
    )
    insertedTxns.forEach(t => nextCache.add(dedupKey(t)))
    setDedupKeyCache(nextCache)

    setTransactions(prev => {
      const merged = [...insertedTxns, ...prev]
      merged.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
      return merged
    })

    setImporting(false)
    setPendingImport(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) handleFile(file)
  }

  function handleFileInput(e) {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  async function persistSalary(next, yearForSave) {
    if (isDemoMode || !user) return true
    const yearInt = parseInt(yearForSave, 10)
    const yearVal = isNaN(yearInt) ? null : yearInt
    const fields = {
      gross_salary:       next.gross,
      tax_rate:           next.taxRate,
      monthly_deductions: next.deductions,
      extra_income:       next.extraIncome ?? 0,
    }

    // Attempt UPDATE of the existing row for this user + year.
    // Using update-then-insert avoids relying on a DB unique constraint.
    let updateQ = supabase.from('salary_settings').update(fields).eq('user_id', user.id)
    updateQ = yearVal === null ? updateQ.is('year', null) : updateQ.eq('year', yearVal)
    const { data: updated, error: updateErr } = await updateQ.select()

    if (updateErr) {
      console.error('[budgr] salary update failed:', updateErr.message)
      return false
    }
    if (updated && updated.length > 0) {
      console.log('[budgr] salary updated:', updated)
      return true
    }

    // No existing row for this year — insert a new one
    const insertPayload = { user_id: user.id, ...fields }
    if (yearVal !== null) insertPayload.year = yearVal
    const { error: insertErr } = await supabase.from('salary_settings').insert(insertPayload)
    if (insertErr) {
      console.error('[budgr] salary insert failed:', insertErr.message)
      return false
    }
    console.log('[budgr] salary inserted for year:', yearVal)
    return true
  }

  function handleSalaryChange(next, { immediate = false } = {}) {
    const yearForSave = selectedYear
    setSalaries(prev => ({ ...prev, [yearForSave]: next }))
    pendingSalaryRef.current = { next, yearForSave }

    // Persist to localStorage immediately so a page refresh never loses the value
    if (!isDemoMode && user) {
      try {
        const lsKey = `budgr_salary_${user.id}`
        const existing = JSON.parse(localStorage.getItem(lsKey) || '{}')
        existing[yearForSave] = { ...next, _ts: Date.now() }
        localStorage.setItem(lsKey, JSON.stringify(existing))
      } catch {}
    }

    if (isDemoMode) return
    clearTimeout(salaryTimerRef.current)
    if (immediate) {
      pendingSalaryRef.current = null
      persistSalary(next, yearForSave)
    } else {
      salaryTimerRef.current = setTimeout(() => {
        pendingSalaryRef.current = null
        persistSalary(next, yearForSave)
      }, 600)
    }
  }

  function handleSalaryBlur() {
    clearTimeout(salaryTimerRef.current)
    const pending = pendingSalaryRef.current
    if (pending) {
      pendingSalaryRef.current = null
      persistSalary(pending.next, pending.yearForSave)
    }
  }

  // Explicit save triggered by the Save Income button — cancels any pending
  // debounce and immediately persists to Supabase, returning success/failure.
  async function handleSaveSalary(next) {
    clearTimeout(salaryTimerRef.current)
    pendingSalaryRef.current = null
    return persistSalary(next, selectedYear)
  }

  const salary             = salaries[selectedYear] ?? salaries['global'] ?? { gross: 0, taxRate: 30, deductions: 0, extraIncome: 0 }
  const annualNet          = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const selectedMonthLabel = MONTHS.find(m => m.id === selectedMonth)?.label || ''
  const availableYears     = [...new Set(transactions.map(t => t.date?.slice(0, 4)).filter(Boolean))].sort()

  const PAGE_TITLES = {
    'get-started': 'Get Started',
    dashboard:    `${selectedMonthLabel} ${selectedYear}`,
    transactions: 'All Transactions',
    salary:       'Income',
    fixed:        'Fixed Costs',
    savings:           'Savings',
    'savings-forecast': 'Savings Forecast',
    categories:   'Categories',
    annual:           'Annual Summary',
    'year-comparison': 'Year-over-Year Review',
    settings:          'Settings',
    privacy:           'Privacy',
  }

  if (user === undefined || loading) return <LoadingSpinner />
  if (user === null) return <AuthScreen />

  // Sidebar savings rate — recomputed from current month state, no extra API call
  const sidebarSavingsRate = (() => {
    if (annualNet <= 0 || transactions.length === 0) return null
    const ym = selectedYear + '-' + selectedMonth
    const monthTxns = transactions.filter(t => yearMonthOf(t.date) === ym)
    if (monthTxns.length === 0) return null
    const debits = monthTxns.filter(t => parseFloat(t.amount) > 0 && !EXCLUDE_FROM_TOTALS.has(t.category))
    const txnSpent = debits.reduce((s, t) => s + parseFloat(t.amount), 0)
    const activeFixed = getActiveForMonth(fixedCosts, selectedYear, selectedMonth)
    const activeSavings = getActiveForMonth(savingsEntries, selectedYear, selectedMonth)
    const fixedTotal = activeFixed.reduce((s, c) => s + monthlyRate(c), 0)
    const savingsTotal = activeSavings.reduce((s, e) => s + monthlyRate(e), 0)
    const monthlyNet = annualNet / 12
    const leftover = Math.max(0, monthlyNet - txnSpent - fixedTotal)
    const totalSaved = leftover + savingsTotal
    return monthlyNet > 0 ? (totalSaved / monthlyNet) * 100 : null
  })()

  return (
    <div
      className="flex h-screen bg-[#F7F8FA] font-sans"
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
    >

      {/* Goal-based onboarding overlay */}
      {showGoalOnboarding && !isDemoMode && (
        <GoalOnboarding onComplete={saveUserGoals} onSkip={handleGoalSkip} />
      )}

      {/* CSV column mapper — shown when format is unknown, feeds into preview */}
      {pendingMapper && (
        <CsvColumnMapper
          pendingMapper={pendingMapper}
          onMap={handleManualMapping}
          onCancel={() => setPendingMapper(null)}
        />
      )}

      {/* CSV import preview — shown after parsing, before Supabase insert */}
      {pendingImport && (
        <CsvImportPreview
          pendingImport={pendingImport}
          onConfirm={confirmImport}
          onCancel={() => setPendingImport(null)}
          importing={importing}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      )}

      {/* Global drag overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-[#00C896]/10 border-4 border-dashed border-[#00C896] m-3 rounded-2xl pointer-events-none flex items-center justify-center">
          <p className="text-[#00C896] font-semibold text-lg">Drop CSV to import</p>
        </div>
      )}

      {/* ── Mobile nav overlay ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-[#0F1E33] flex flex-col h-full shadow-2xl">
            <div className="px-5 py-5 border-b border-white/[0.07] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#00C896,#0D9488)' }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-base tracking-tight">budgli</span>
              </div>
              <button onClick={() => setMobileNavOpen(false)} className="text-white/40 hover:text-white/80 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto flex flex-col nav-scroll">
              <div className="flex-1">
                {NAV_SECTIONS.map(section => (
                  <div key={section.heading} className="mb-5">
                    <p className="px-5 mb-1 text-[11px] font-semibold text-white/35 tracking-[0.12em] uppercase">{section.heading}</p>
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setActivePage(item.id); setMobileNavOpen(false) }}
                        className={`w-full text-left px-3.5 py-2.5 mx-1 rounded-lg text-sm transition-all flex items-center gap-2.5 w-[calc(100%-8px)]
                          ${activePage === item.id ? 'bg-[#00C896]/15 text-[#00C896]' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'}`}
                      >
                        <svg className={`w-4 h-4 shrink-0 ${activePage === item.id ? 'text-[#00C896] opacity-100' : 'opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        <span className={activePage === item.id ? 'font-semibold' : ''}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

                  {/* Divider + footer nav items */}
              <div className="border-t border-white/[0.08] pt-1 pb-1">
                {NAV_FOOTER_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActivePage(item.id); setMobileNavOpen(false) }}
                    className={`w-full text-left px-3.5 py-2.5 mx-1 rounded-lg text-sm transition-all flex items-center gap-2.5 w-[calc(100%-8px)]
                      ${activePage === item.id ? 'bg-[#00C896]/15 text-[#00C896]' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'}`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${activePage === item.id ? 'text-[#00C896] opacity-100' : 'opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={activePage === item.id ? 'font-semibold' : ''}>{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
            <div className="px-4 py-4 border-t border-white/[0.14]">
              <div className="flex items-center gap-2.5 mb-3 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#00C896]/60 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white">{(user.email?.[0] || '?').toUpperCase()}</span>
                </div>
                <span className="text-xs text-white/40 truncate flex-1 min-w-0">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => supabase.auth.signOut()} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Sign out</button>
                <span className="text-white/15 text-xs">·</span>
                <button onClick={() => { setActivePage('privacy'); setMobileNavOpen(false) }} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Privacy</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden md:flex w-56 bg-[#0F1E33] flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#00C896,#0D9488)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-tight">budgli</span>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto flex flex-col nav-scroll">
          <div className="flex-1">
            {NAV_SECTIONS.map(section => (
              <div key={section.heading} className="mb-5">
                <p className="px-5 mb-1 text-[11px] font-semibold text-white/35 tracking-[0.12em] uppercase">
                  {section.heading}
                </p>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full text-left px-3.5 py-2 mx-1 rounded-lg text-sm transition-all flex items-center gap-2.5 w-[calc(100%-8px)]
                      ${activePage === item.id
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
                      }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${activePage === item.id ? 'text-[#00C896] opacity-100' : 'opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={activePage === item.id ? 'font-semibold' : ''}>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Divider + footer nav items */}
          <div className="border-t border-white/[0.08] pt-1 pb-1">
            {NAV_FOOTER_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left px-3.5 py-2 mx-1 rounded-lg text-sm transition-all flex items-center gap-2.5 w-[calc(100%-8px)]
                  ${activePage === item.id
                    ? 'bg-[#00C896]/15 text-[#00C896]'
                    : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
                  }`}
              >
                <svg className={`w-4 h-4 shrink-0 ${activePage === item.id ? 'text-[#00C896] opacity-100' : 'opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className={activePage === item.id ? 'font-semibold' : ''}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.14]">
          <div className="flex items-center gap-2.5 mb-3 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#00C896]/60 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">{(user.email?.[0] || '?').toUpperCase()}</span>
            </div>
            <span className="text-xs text-white/40 truncate flex-1 min-w-0">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              Sign out
            </button>
            <span className="text-white/15 text-xs">·</span>
            <button
              onClick={() => setActivePage('privacy')}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Demo Mode banner */}
        {isDemoMode && (
          <div className="shrink-0 bg-amber-400 px-6 py-2.5 flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-amber-900">Demo Mode — your data is not saved.</span>
            <button
              onClick={exitDemoMode}
              className="text-xs font-semibold bg-amber-900/20 hover:bg-amber-900/30 text-amber-900 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between py-3 md:py-4 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-800 shrink-0"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{PAGE_TITLES[activePage] || ''}</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {availableYears.length > 1 && activePage !== 'year-comparison' && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">Year:</span>
                <div className="flex items-center gap-1">
                  {availableYears.map(y => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        y === selectedYear ? 'bg-[#00C896] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >{y}</button>
                  ))}
                </div>
              </div>
            )}
            <label className="cursor-pointer flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm font-medium px-3 py-2 md:px-4 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </label>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div className="shrink-0 mx-6 mt-3">
            <div className="flex items-center gap-2 bg-[#1A1F2E] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-md">
              <span>{toast.msg}</span>
              <button onClick={() => setToast(null)} className="ml-auto text-white/60 hover:text-white leading-none">✕</button>
            </div>
          </div>
        )}

        {/* Month tabs — dashboard only */}
        {activePage === 'dashboard' && (
          <div className="bg-white border-b border-gray-100 px-4 md:px-6 flex gap-1 md:gap-4 shrink-0 overflow-x-auto no-scrollbar">
            {MONTHS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`py-3 px-1 md:px-0 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap shrink-0 ${
                  selectedMonth === m.id
                    ? 'border-[#00C896] text-[#1A1F2E]'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {m.label.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 py-4 md:px-8 md:py-8 bg-[#F7F8FA]">
          <div key={activePage === 'dashboard' ? `dashboard-${selectedMonth}` : activePage} className="budgli-page-enter">

          {activePage === 'get-started' && (
            <GetStartedPage
              salary={salary}
              transactions={transactions}
              fixedCosts={fixedCosts}
              onNavigate={setActivePage}
              onTryDemo={!isDemoMode ? enterDemoMode : undefined}
            />
          )}

          {activePage === 'dashboard' && (
            <MonthlyDashboard
              txns={transactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setCategory={setCategory}
              salary={salary}
              fixedCosts={getActiveForMonth(fixedCosts, selectedYear, selectedMonth)}
              savingsEntries={getActiveForMonth(savingsEntries, selectedYear, selectedMonth)}
              variableOpen={dashVariableOpen} setVariableOpen={setDashVariableOpen}
              fixedOpen={dashFixedOpen}       setFixedOpen={setDashFixedOpen}
              savingsOpen={dashSavingsOpen}   setSavingsOpen={setDashSavingsOpen}
              userGoals={userGoals}
            />
          )}

          {activePage === 'transactions' && (
            <div>
              <div className="mb-5">
                {/* CSV Import — active */}
                <label className="cursor-pointer budgli-card rounded-xl p-5 flex items-center gap-4 hover:border-[#00C896] hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-full bg-[#00C896]/10 flex items-center justify-center group-hover:bg-[#00C896]/20 transition-colors shrink-0">
                    <svg className="w-5 h-5" style={{ color: '#00C896' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Import CSV</p>
                    <p className="text-xs text-gray-400 mt-0.5">RBC, TD, Scotiabank, BMO, CIBC</p>
                  </div>
                  <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                </label>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-gray-400 text-center mt-3 mb-5">
                CSV files are processed on import. The original file is never stored. You can delete your transaction history at any time from Settings. Bank and credit card sync coming soon.
              </p>

              {/* Upload state banner */}
              {(() => {
                const untaggedAll = transactions.filter(t => !t.category).length
                const hasUploads  = csvUploads.length > 0
                const activeStep  = !hasUploads ? 0 : untaggedAll > 0 ? 2 : transactions.length > 0 ? 3 : 1
                const steps = [
                  { label: 'Uploaded',     sub: 'CSV imported' },
                  { label: 'Processing',   sub: 'Categories applied' },
                  { label: 'Needs Review', sub: `${untaggedAll} untagged` },
                  { label: 'Complete',     sub: 'All transactions tagged' },
                ]
                return (
                  <div className="budgli-card rounded-xl px-4 py-4 mb-5 overflow-x-auto no-scrollbar"><div className="flex items-start min-w-[320px]">
                    {steps.map((s, i) => {
                      const done   = i < activeStep
                      const active = i === activeStep
                      return (
                        <Fragment key={s.label}>
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              done   ? 'bg-[#00C896] text-white' :
                              active ? 'bg-[#1A1F2E] text-white' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <span className={`text-[11px] font-semibold whitespace-nowrap ${active ? 'text-gray-800' : done ? 'text-[#00C896]' : 'text-gray-400'}`}>{s.label}</span>
                            {active && <span className="text-[10px] text-gray-400 whitespace-nowrap">{s.sub}</span>}
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-px mx-3 mt-3.5 ${i < activeStep ? 'bg-[#00C896]' : 'bg-gray-200'}`} />
                          )}
                        </Fragment>
                      )
                    })}
                  </div></div>
                )
              })()}

              {/* Upload History */}
              <div className="budgli-card rounded-xl mb-5 overflow-hidden">
                <button
                  onClick={() => setUploadHistoryOpen(o => !o)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00C89615' }}>
                      <svg className="w-4 h-4" style={{ color: '#00C896' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Upload History</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {csvUploads.length === 0 ? 'No imports yet' : `${csvUploads.length} file${csvUploads.length !== 1 ? 's' : ''} imported`}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${uploadHistoryOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {uploadHistoryOpen && (
                  <div className="border-t border-gray-200">
                    {csvUploads.length === 0 ? (
                      <div className="px-5 py-6 flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm text-gray-400">No files imported yet</p>
                        <p className="text-xs text-gray-300">Your upload history will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 bg-white">
                        {csvUploads.map((u, i) => {
                          const total = u.total_count ?? u.transaction_count ?? 0
                          const newCount = u.new_count ?? total
                          const allDupes = newCount === 0
                          return (
                            <div key={u.id} className="flex items-center px-5 py-3.5 gap-3">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${i === 0 && !allDupes ? 'bg-[#1A1F2E]' : 'bg-gray-100'}`}>
                                <svg className={`w-3.5 h-3.5 ${i === 0 && !allDupes ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{u.filename}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(u.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  {' · '}
                                  {new Date(u.uploaded_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </p>
                              </div>
                              {allDupes ? (
                                <span className="text-xs font-medium tabular-nums shrink-0 px-2 py-1 rounded-full bg-gray-100 text-gray-400">
                                  {total} dupes
                                </span>
                              ) : (
                                <span className="text-xs font-semibold tabular-nums shrink-0 px-2 py-1 rounded-full" style={{ backgroundColor: '#00C89615', color: '#00A87A' }}>
                                  +{newCount} new
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  const txnCount = (u.txnIds || []).length
                                  const msg = txnCount > 0
                                    ? `Delete "${u.filename}" and remove its ${txnCount} transaction${txnCount !== 1 ? 's' : ''} from the database?`
                                    : `Remove "${u.filename}" from upload history?`
                                  if (window.confirm(msg)) handleDeleteUpload(u)
                                }}
                                className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none shrink-0 ml-1"
                                title="Delete upload and its transactions"
                              >✕</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <TransactionView
                txns={transactions}
                selectedYear={selectedYear}
                setCategory={setCategory}
                fuzzyPrompt={fuzzyPrompt}
                onFuzzyAccept={handleFuzzyAccept}
                onFuzzyDismiss={handleFuzzyDismiss}
                onImport={() => csvInputRef.current?.click()}
              />
            </div>
          )}

          {activePage === 'salary' && (
            <SalaryPage
              key={selectedYear}
              salary={salary}
              onSalaryChange={handleSalaryChange}
              onSalaryBlur={handleSalaryBlur}
              onSaveSalary={handleSaveSalary}
              transactions={transactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              fixedCosts={getActiveForMonth(fixedCosts, selectedYear, selectedMonth)}
              userGoals={userGoals}
            />
          )}

          {activePage === 'categories' && (
            <CategoriesPage
              transactions={transactions}
              fixedCosts={getActiveForMonth(fixedCosts, selectedYear, selectedMonth)}
              savingsEntries={getActiveForMonth(savingsEntries, selectedYear, selectedMonth)}
              selectedYear={selectedYear}
              customTags={customTags}
              onTagCategory={addCustomTag}
              onUntagCategory={removeCustomTag}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'fixed' && (
            <FixedCostsPage
              fixedCosts={getActiveForMonth(fixedCosts, selectedYear, selectedMonth)}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAdd={cost => addFixedCost(cost, selectedYear)}
              onUpdate={updateFixedCost}
              onDelete={deleteFixedCost}
            />
          )}

          {activePage === 'savings' && (
            <SavingsPage
              savingsEntries={getActiveForMonth(savingsEntries, selectedYear, selectedMonth)}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAdd={entry => addSavingsEntry(entry, selectedYear)}
              onUpdate={updateSavingsEntry}
              onDelete={deleteSavingsEntry}
            />
          )}

          {activePage === 'savings-forecast' && (
            <SavingsForecastPage
              savingsEntries={getActiveForMonth(savingsEntries, selectedYear, 12)}
              user={user}
              isDemoMode={isDemoMode}
            />
          )}

          {activePage === 'annual' && (
            <AnnualSummary
              transactions={transactions}
              salary={salary}
              fixedCosts={getActiveForMonth(fixedCosts, selectedYear, 12)}
              savingsEntries={getActiveForMonth(savingsEntries, selectedYear, 12)}
              selectedYear={selectedYear}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'year-comparison' && (
            <YearComparison
              transactions={transactions}
              fixedCosts={fixedCosts}
              savingsEntries={savingsEntries}
              salaries={salaries}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              user={user}
              transactions={transactions}
              onClearTransactions={() => { setTransactions([]); setDedupKeyCache(new Set()); setCsvUploads([]) }}
              darkMode={darkMode}
              onToggleDark={toggleDarkMode}
              userGoals={userGoals}
              onUpdateGoals={() => setShowGoalOnboarding(true)}
            />
          )}

          {activePage === 'feedback' && <FeedbackPage user={user} />}

          {activePage === 'privacy' && <Privacy />}

          </div>
        </main>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
