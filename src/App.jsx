import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'

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
const isSaving = cat => !!cat && SAVING_CATEGORIES.includes(cat.toLowerCase())
const savingCatLabel = cat => {
  const upper = cat.toUpperCase()
  if (upper === 'RRSP' || upper === 'TFSA') return upper
  return cat.replace(/\b\w/g, c => c.toUpperCase())
}
const CC_PAYMENT_KEYWORDS = ['PAYMENT - THANK YOU', 'PAI EMENT', 'PAYMENT RECEIVED', 'AUTOPAY']

const RULES = [
  { keywords: ['UBER', 'LYFT'],                                                           category: 'Transit / Rideshare' },
  { keywords: ['PETRO', 'ESSO', 'SHELL', 'CHEVRON', 'HUSKY', 'PIONEER', 'GAS BAR'],      category: 'Fuel' },
  { keywords: ['STARBUCKS', 'TIM HORTON', 'SECOND CUP', 'BLENZ', 'COFFEE'],              category: 'Coffee & Drinks' },
  { keywords: ['MCDONALD', 'WENDY', 'BURGER KING', 'SUBWAY', 'A&W', 'PIZZA', 'DOMINO',
               'KFC', 'TACO BELL', 'EARLS', 'BOSTON PIZZA', 'RESTAURANT', 'SUSHI',
               'POKE', 'TST-', 'SQ *'],                                                    category: 'Dining Out' },
  { keywords: ['WAL-MART', 'WALMART', 'COSTCO', 'SUPERSTORE', 'SAFEWAY', 'THRIFTY',
               'FAIRWAY', 'SAVE-ON', 'SAVE ON', 'LOBLAWS', 'SOBEYS', 'BULK BARN',
               'WHOLE FOODS', 'MARKET'],                                                   category: 'Groceries' },
  { keywords: ['FITNESS', 'GYM', 'YMCA', 'GOODLIFE', 'ANYTIME FITNESS', 'CROSSFIT'],     category: 'Fitness & Gym' },
  { keywords: ['MICROSOFT', 'NETFLIX', 'SPOTIFY', 'APPLE.COM', 'GOOGLE', 'AMAZON PRIME',
               'DISNEY', 'XBOX', 'PLAYSTATION', 'GAME PASS', 'ADOBE', 'DROPBOX'],        category: 'Subscriptions' },
  { keywords: ['ROGERS', 'TELUS', 'BELL', 'FIDO', 'KOODO', 'VIRGIN MOBILE', 'SHAW',
               'VIDEOTRON', 'FREEDOM MOBILE'],                                             category: 'Phone & Internet' },
  { keywords: ['SHOPPERS', 'REXALL', 'LONDON DRUGS', 'PHARMACY', 'MEDICAL', 'CLINIC',
               'DENTAL', 'OPTOM'],                                                         category: 'Health & Medical' },
  { keywords: ['LIQUOR', 'BREWERY', 'BREWING', 'DISTILLERY', 'WINERY', 'WINE', 'BEER',
               'PUB', 'BAR', 'NIGHTCLUB', 'LOUNGE', 'TAVERN', 'CASCADE', 'BRASSERIE'],   category: 'Bars & Nightlife' },
  { keywords: ['APPLE STORE', 'STAPLES'],                                                  category: 'Home & Garden' },
  { keywords: ['AMAZON', 'EBAY', 'ETSY', 'BEST BUY', 'BESTBUY', 'IKEA', 'TARGET',
               'HOMESENSE', 'WINNERS', 'MARSHALLS', 'HOME DEPOT', 'CANADIAN TIRE'],       category: 'Shopping' },
]

function guessCategory(description) {
  const upper = description.toUpperCase()
  for (const { keywords, category } of RULES) {
    if (keywords.some(k => upper.includes(k))) return category
  }
  return ''
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
  { name: 'Savings',         hex: '#14A085', cats: ['Investments', 'Savings', 'Savings Transfer', 'RRSP', 'TFSA', 'Emergency Fund'] },
]

const CATEGORY_COLOR = Object.fromEntries(
  CATEGORY_GROUPS.flatMap(g => g.cats.map(c => [c, g.hex]))
)
CATEGORY_COLOR['Omit'] = '#9CA3AF'

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
    heading: 'OVERVIEW',
    items: [
      { id: 'get-started',  label: 'Get Started',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { id: 'dashboard',    label: 'Monthly Dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'transactions', label: 'Transactions',      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'salary',       label: 'Salary',            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    heading: 'SPENDING',
    items: [
      { id: 'fixed',      label: 'Fixed Costs',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'savings',    label: 'Savings',        icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
      { id: 'categories', label: 'Categories',     icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { id: 'annual',     label: 'Annual Summary', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
]

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

// Converts M/D/YYYY or MM/DD/YYYY → YYYY-MM-DD; already-ISO dates pass through unchanged
function normalizeDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const us = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (us) return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`
  return dateStr
}

// Returns "YYYY-MM" from a normalized ISO date — never does partial string matching
function yearMonthOf(isoDate) {
  if (!isoDate) return ''
  const m = isoDate.match(/^(\d{4})-(\d{2})-\d{2}$/)
  return m ? `${m[1]}-${m[2]}` : ''
}

// ─── CategoryCombobox ────────────────────────────────────────────────────────

function CategoryCombobox({ value, onChange }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos]     = useState({ top: 0, left: 0, width: 192 })
  const wrapRef           = useRef(null)

  const filtered = CATEGORIES.filter(c =>
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
          {filtered.map(cat => (
            <li key={cat}>
              <button
                onMouseDown={e => { e.preventDefault(); select(cat) }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {cat}
              </button>
            </li>
          ))}
          {query.trim() && !CATEGORIES.includes(query.trim()) && (
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

function TransactionView({ txns, setCategory }) {
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
    <div>

        {/* Filter bar */}
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

        {/* Transaction list */}
        <div>
          {/* Column headers */}
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
                {/* Month header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-x border-gray-100 bg-[#1A1A2E]">
                  <span className="text-white text-xs font-semibold tracking-wide">{groupLabel(group.ym)}</span>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <span>{group.txns.length} transaction{group.txns.length !== 1 ? 's' : ''}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-white/80">{fmt(groupSpend)}</span>
                  </div>
                </div>

                {/* Transaction rows */}
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
  )
}

// ─── CategoriesPage ──────────────────────────────────────────────────────────

const CATS_SET = new Set(CATEGORIES)

function CategoriesPage({ transactions, fixedCosts, savingsEntries }) {
  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const monthsWithData = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  const fixedCostItems    = fixedCosts.filter(c => !isSaving(c.category))
  const fixedMonthlyTotal = fixedCostItems.reduce((s, c) => s + c.amount, 0)
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
    savingsByCategory[e.category] = (savingsByCategory[e.category] || 0) + e.amount
  }
  const savingsCatEntries = Object.entries(savingsByCategory)
    .map(([cat, monthly]) => [cat, monthly * monthsWithData])
    .sort(([, a], [, b]) => b - a)
  const savingsYTD = savingsCatEntries.reduce((s, [, v]) => s + v, 0)

  // Build the card list: fixed costs + spending groups + custom + savings
  const cards = [
    {
      name: 'Fixed Costs',
      hex: '#6B7280',
      items: fixedCostItems.map(c => [c.name, monthsWithData > 0 ? c.amount * monthsWithData : 0]),
      total: fixedYTD,
      emptyMsg: 'No fixed costs entered',
    },
    ...spendingGroups.map(g => ({
      name: g.name,
      hex: g.hex,
      items: g.entries,
      total: g.total,
    })),
    ...(customEntries.length > 0 ? [{
      name: 'Custom Categories',
      hex: '#8B5CF6',
      items: customEntries,
      total: customTotal,
    }] : []),
    {
      name: 'Savings',
      hex: '#0D7377',
      items: savingsCatEntries,
      total: savingsYTD,
      emptyMsg: 'No savings entries',
      accent: true,
    },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-gray-800">Categories — {APP_YEAR} YTD</p>
        {monthsWithData > 0 && (
          <span className="text-xs text-gray-400">({monthsWithData} mo)</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.name} className="bg-white rounded-xl border border-gray-100 p-5">

            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: card.hex }} />
                <p className="text-sm font-semibold text-gray-800">{card.name}</p>
              </div>
              <span className="text-[11px] text-gray-400">
                {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Category rows */}
            <div className="space-y-3">
              {card.items.length > 0 ? card.items.map(([label, amt]) => {
                const pct = card.total > 0 ? (amt / card.total) * 100 : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-gray-600 truncate mr-2">{label}</span>
                      <span className={`tabular-nums font-medium shrink-0 ${card.accent ? 'text-[#0D7377]' : 'text-gray-800'}`}>
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
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-400">Total YTD</span>
              <span className={`text-sm font-semibold tabular-nums ${card.accent ? 'text-[#0D7377]' : 'text-gray-900'}`}>
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

function FixedCostsPage({ fixedCosts, onAdd, onDelete }) {
  const [name, setName]         = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('')

  function handleAdd() {
    const parsed = parseFloat(amount)
    if (!name.trim() || !parsed || !category) return
    onAdd({ name: name.trim(), amount: parsed, category })
    setName('')
    setAmount('')
    setCategory('')
  }

  const monthlyTotal = fixedCosts.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="max-w-2xl">

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Add Fixed Cost</h2>
        <div className="flex gap-3 items-end flex-wrap">

          <div className="flex-1 min-w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Rent"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors"
            />
          </div>

          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Amount / month</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
              <span className="px-2.5 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="0"
                className="flex-1 px-2.5 py-2.5 text-sm text-gray-800 outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="w-52">
            <label className="block text-xs text-gray-500 mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors bg-white"
            >
              <option value="">Select category…</option>
              {CATEGORIES.filter(c => !EXCLUDE_FROM_TOTALS.has(c) && c !== 'Refund / Return' && !SAVINGS_CATS.includes(c)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim() || !amount || !category}
            className="px-5 py-2.5 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-[#0b6165] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>

        </div>
      </div>

      {fixedCosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No fixed costs yet — add your first above</p>
          <p className="text-xs text-gray-300 mt-1">Fixed costs appear on your monthly dashboard and annual totals</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Fixed Costs</p>
            <p className="text-xs text-gray-400">{fixedCosts.length} item{fixedCosts.length !== 1 ? 's' : ''}</p>
          </div>
          {fixedCosts.map(cost => {
            const hex = CATEGORY_COLOR[cost.category] || '#9CA3AF'
            return (
              <div key={cost.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                <span className="flex-1 text-sm text-gray-700 font-medium">{cost.name}</span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: hex + '1a', color: hex }}
                >
                  {cost.category}
                </span>
                <span className="text-sm font-semibold text-gray-800 tabular-nums w-24 text-right shrink-0">
                  {fmt(cost.amount)}
                </span>
                <button
                  onClick={() => onDelete(cost.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0 ml-1"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            )
          })}
          <div className="px-5 py-3 bg-gray-50/60 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Monthly total</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(monthlyTotal)}</span>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── SavingsPage ─────────────────────────────────────────────────────────────

function SavingsPage({ savingsEntries, onAdd, onDelete }) {
  const [name, setName]         = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('')

  function handleAdd() {
    const parsed = parseFloat(amount)
    if (!name.trim() || !parsed || !category) return
    onAdd({ name: name.trim(), amount: parsed, category })
    setName('')
    setAmount('')
    setCategory('')
  }

  const monthlyTotal = savingsEntries.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="max-w-2xl">

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Add Savings Allocation</h2>
        <div className="flex gap-3 items-end flex-wrap">

          <div className="flex-1 min-w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. RRSP contribution"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors"
            />
          </div>

          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Amount / month</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#0D7377] transition-colors">
              <span className="px-2.5 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="0"
                className="flex-1 px-2.5 py-2.5 text-sm text-gray-800 outline-none w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="w-52">
            <label className="block text-xs text-gray-500 mb-1.5">Type</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors bg-white"
            >
              <option value="">Select type…</option>
              {SAVINGS_CATS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim() || !amount || !category}
            className="px-5 py-2.5 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-[#0b6165] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>

        </div>
      </div>

      {savingsEntries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No savings allocations yet — add your first above</p>
          <p className="text-xs text-gray-300 mt-1">Track where your savings go each month (RRSP, TFSA, investments, etc.)</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide">Monthly Savings Allocations</p>
            <p className="text-xs text-gray-400">{savingsEntries.length} item{savingsEntries.length !== 1 ? 's' : ''}</p>
          </div>
          {savingsEntries.map(entry => {
            const hex = CATEGORY_COLOR[entry.category] || '#14A085'
            return (
              <div key={entry.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                <span className="flex-1 text-sm text-gray-700 font-medium">{entry.name}</span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: hex + '1a', color: hex }}
                >
                  {entry.category}
                </span>
                <span className="text-sm font-semibold text-[#0D7377] tabular-nums w-24 text-right shrink-0">
                  {fmt(entry.amount)}
                </span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none shrink-0 ml-1"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            )
          })}
          <div className="px-5 py-3 bg-[#F0FDF9]/60 flex justify-between items-center">
            <span className="text-xs font-medium text-[#0D7377]">Monthly total</span>
            <span className="text-sm font-semibold text-[#0D7377] tabular-nums">{fmt(monthlyTotal)}</span>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── MonthlyDashboard ─────────────────────────────────────────────────────────

function MonthlyDashboard({ txns, selectedMonth, setCategory, salary, fixedCosts, savingsEntries, variableOpen, setVariableOpen, fixedOpen, setFixedOpen, savingsOpen, setSavingsOpen }) {

  const monthTxns = txns.filter(t => yearMonthOf(t.date) === APP_YEAR + '-' + selectedMonth)
  const allDebits   = monthTxns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const debits      = allDebits.filter(t => !isSaving(t.category))
  const savingsTxns = allDebits.filter(t => isSaving(t.category))
  const untagged    = monthTxns.filter(t => !t.category).length

  const txnSpent          = debits.reduce((sum, t) => sum + t.amount, 0)
  const fixedMonthlyTotal = fixedCosts.reduce((s, c) => s + c.amount, 0)
  const totalSpent        = txnSpent + fixedMonthlyTotal

  const annualNet  = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const monthlyNet = annualNet / 12

  // Savings = amounts entered on the Savings page
  const savingsEntriesTotal = savingsEntries.reduce((s, e) => s + e.amount, 0)
  const totalSavings        = savingsEntriesTotal
  const savingsRate         = monthlyNet > 0 ? (totalSavings / monthlyNet) * 100 : null

  // Savings breakdown by category from entries
  const savingsByCat = savingsEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  return (
    <div className="flex gap-5">

      {/* Left panel */}
      <div className="flex-1 min-w-0">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">

          <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Net Income</p>
            <p className={`text-2xl font-bold tabular-nums ${monthlyNet > 0 ? 'text-white' : 'text-white/20'}`}>
              {monthlyNet > 0 ? fmt(monthlyNet) : '—'}
            </p>
            <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: '#0D7377' }} />
          </div>

          <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Total Expenses</p>
            <p className={`text-2xl font-bold tabular-nums ${totalSpent > 0 ? 'text-white' : 'text-white/20'}`}>
              {totalSpent > 0 ? fmt(totalSpent) : '—'}
            </p>
            <div className="mt-3 h-[3px] w-7 rounded-full bg-red-400/70" />
          </div>

          <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Savings</p>
            <p className={`text-2xl font-bold tabular-nums ${totalSavings > 0 ? 'text-white' : 'text-white/20'}`}>
              {totalSavings > 0 ? fmt(totalSavings) : '—'}
            </p>
            <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: totalSavings > 0 ? '#14A085' : '#374151' }} />
          </div>

          <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Savings Rate</p>
            <p className={`text-2xl font-bold tabular-nums ${
              savingsRate === null ? 'text-white/20'
              : savingsRate >= 20 ? 'text-[#14A085]'
              : savingsRate >= 10 ? 'text-amber-400'
              : 'text-red-400'
            }`}>
              {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
            </p>
            <div className="mt-3 h-[3px] w-7 rounded-full"
              style={{ backgroundColor: savingsRate === null ? '#374151' : savingsRate >= 20 ? '#0D7377' : savingsRate >= 10 ? '#F59E0B' : '#EF4444' }} />
          </div>

        </div>

        {/* Income statement card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">

          <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Summary</span>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: '#F0FDF4' }}>
            <span className="text-sm text-gray-600">Net Income</span>
            <span className={`text-sm font-semibold tabular-nums ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {monthlyNet > 0 ? fmt(monthlyNet) : salary.gross === 0 ? 'Add salary →' : '—'}
            </span>
          </div>

          <div className="border-t border-gray-200" />

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm text-gray-600">Fixed Costs</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-600">Variable Spending</span>
            <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(txnSpent)}</span>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total Expenses</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{fmt(totalSpent)}</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Savings entries breakdown */}
          {Object.entries(savingsByCat).map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between px-5 py-2.5 border-b border-gray-50" style={{ backgroundColor: '#F0FDF9' }}>
              <span className="text-xs font-medium text-[#0D7377]">{cat}</span>
              <span className="text-xs font-semibold text-[#0D7377] tabular-nums">{fmt(amount)}</span>
            </div>
          ))}


          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-700">Total Savings</span>
            <span className={`text-sm font-bold tabular-nums ${totalSavings > 0 ? 'text-[#0D7377]' : 'text-gray-300'}`}>
              {totalSavings > 0 ? fmt(totalSavings) : '—'}
            </span>
          </div>

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

          <button onClick={() => setVariableOpen(o => !o)} className="w-full px-4 py-2.5 bg-gray-50/80 flex items-center justify-between border-b border-gray-100 text-left">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variable Spending</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{monthTxns.length} transaction{monthTxns.length !== 1 ? 's' : ''}</span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${variableOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {variableOpen && <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide w-28">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Merchant</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {monthTxns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">
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
                    <td className={`px-4 py-2.5 text-sm font-semibold tabular-nums text-right whitespace-nowrap ${t.type === 'credit' ? 'text-[#0D7377]' : 'text-gray-800'}`}>
                      {t.type === 'credit' ? '+ ' : ''}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Variable total</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(txnSpent)}</span>
            </div>
          </>}

          {fixedCosts.length > 0 && (
            <>
              <button onClick={() => setFixedOpen(o => !o)} className="w-full border-t-2 border-gray-100 px-4 py-2.5 bg-gray-50/80 flex items-center justify-between text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fixed Costs</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{fixedCosts.length} item{fixedCosts.length !== 1 ? 's' : ''}</span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${fixedOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {fixedOpen && <>
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
              </>}
            </>
          )}

          {savingsEntries.length > 0 && (
            <>
              <button onClick={() => setSavingsOpen(o => !o)} className="w-full border-t-2 border-gray-100 px-4 py-2.5 bg-[#F0FDF9]/80 flex items-center justify-between text-left">
                <span className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide">Savings Allocations</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#0D7377]/60">{savingsEntries.length} item{savingsEntries.length !== 1 ? 's' : ''}</span>
                  <svg className={`w-3.5 h-3.5 text-[#0D7377]/60 transition-transform ${savingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {savingsOpen && <>
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
              </>}
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 shrink-0 space-y-4">

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Breakdown</p>

          <div className="space-y-3">
            {CATEGORY_GROUPS.filter(g => g.name !== 'Savings').map(group => {
              const txnTotal   = group.cats.reduce((s, cat) =>
                s + debits.filter(t => t.category === cat).reduce((ss, t) => ss + t.amount, 0), 0
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
            {debits.length === 0 && fixedCosts.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-2">No spending this month</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fixed costs</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Variable</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(txnSpent)}</span>
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


      </div>
    </div>
  )
}

// ─── SalaryPage ───────────────────────────────────────────────────────────────

function SalaryPage({ salary, onSalaryChange, transactions, selectedMonth, fixedCosts }) {
  const [grossDisplay, setGrossDisplay] = useState(
    salary.gross > 0 ? salary.gross.toLocaleString('en-US') : ''
  )

  const annualNet  = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const monthlyNet = annualNet / 12

  const monthIdx = parseInt(selectedMonth, 10)

  const today         = new Date()
  const todayYear     = today.getFullYear().toString()
  const todayMonthIdx = today.getMonth() + 1
  const dayOfMonth    = today.getDate()
  const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed = todayYear === APP_YEAR
    ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth
    : 0
  const incomeToDate  = monthlyNet * monthsElapsed

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

  const fixedMonthlyTotal = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + c.amount, 0)

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

  return (
    <div className="max-w-xl">

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Income Details</h2>
        <div className="space-y-4">

          {/* Gross Annual Salary — comma-formatted text input */}
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

          {/* Tax Rate — % suffix, consistent style */}
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

          {/* Monthly Deductions */}
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

      {/* Stat cards — 2×2 grid + full-width fifth card */}
      <div className="grid grid-cols-2 gap-3">

        {/* Card 1: Annual Net Income */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Annual Net Income</p>
          <p className={`text-2xl font-semibold ${annualNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">Gross − Tax − (Deductions × 12)</p>
        </div>

        {/* Card 2: Income to Date */}
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

        {/* Card 3: Monthly Net Income */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-[#0D7377] uppercase tracking-wide mb-2">Monthly Net Income</p>
          <p className={`text-2xl font-semibold ${monthlyNet > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
            {monthlyNet > 0 ? fmt(monthlyNet) : '—'}
          </p>
          <p className="text-[10px] text-gray-400 italic mt-1.5">Annual Net ÷ 12</p>
        </div>

        {/* Card 4: Monthly Savings */}
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

        {/* Card 5: Projected Annual Savings — full width */}
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

// ─── AnnualSummary ────────────────────────────────────────────────────────────

function AnnualSummary({ transactions, salary, fixedCosts, savingsEntries }) {
  const gross            = salary.gross
  const taxAmount        = gross * (salary.taxRate / 100)
  const deductionsAnnual = salary.deductions * 12
  const annualNet        = gross > 0 ? gross - taxAmount - deductionsAnnual : 0
  const monthlyNet       = annualNet / 12

  const fixedMonthlyTotal    = fixedCosts.filter(c => !isSaving(c.category)).reduce((s, c) => s + c.amount, 0)
  const fixedAnnualProjected = fixedMonthlyTotal * 12

  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const debits = allDebitsAnn.filter(t => !isSaving(t.category))

  const txnSpent       = debits.reduce((s, t) => s + t.amount, 0)
  const monthsWithData = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  const avgMonthlyVariable = monthsWithData > 0 ? txnSpent / monthsWithData : null
  const projectedVariable  = avgMonthlyVariable !== null ? avgMonthlyVariable * 12 : null
  const totalExpensesProj  = projectedVariable !== null ? fixedAnnualProjected + projectedVariable : null

  // YTD figures — today's date for income
  const today         = new Date()
  const todayYear     = today.getFullYear().toString()
  const todayMonthIdx = today.getMonth() + 1
  const dayOfMonth    = today.getDate()
  const daysInMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthsElapsed = todayYear === APP_YEAR ? (todayMonthIdx - 1) + dayOfMonth / daysInMonth : monthsWithData

  const fixedYTD    = fixedMonthlyTotal * monthsElapsed
  const totalExpYTD = txnSpent + fixedYTD
  const incomeToDate = monthlyNet * monthsElapsed

  // Savings = savings entries (monthly amounts from Savings page) × elapsed months
  const monthlySavingsTotal = savingsEntries.reduce((s, e) => s + e.amount, 0)
  const allSavingsYTD       = monthlySavingsTotal * monthsElapsed
  const totalSavingsYTD     = allSavingsYTD > 0 ? allSavingsYTD : null
  const savingsRateYTD      = incomeToDate > 0 && allSavingsYTD > 0 ? (allSavingsYTD / incomeToDate) * 100 : null

  // Projected savings based on savings entries monthly total
  const projectedSavings = monthlySavingsTotal > 0 ? monthlySavingsTotal * 12 : null
  const savingsRate      = annualNet > 0 && projectedSavings !== null ? (projectedSavings / annualNet) * 100 : null

  // Per-category breakdown for income statement
  const fixedCostItems = fixedCosts.filter(c => !isSaving(c.category))
  const varByCategory = {}
  for (const t of debits) {
    const cat = t.category || 'Uncategorized'
    varByCategory[cat] = (varByCategory[cat] || 0) + t.amount
  }
  const varGroups = CATEGORY_GROUPS.filter(g => g.name !== 'Savings').map(g => ({
    ...g,
    entries: g.cats
      .filter(cat => varByCategory[cat] > 0)
      .map(cat => ({ cat, amt: varByCategory[cat] }))
      .sort((a, b) => b.amt - a.amt),
  })).filter(g => g.entries.length > 0)
  const knownCats = new Set(CATEGORIES)
  const customVarEntries = Object.entries(varByCategory)
    .filter(([cat]) => !knownCats.has(cat))
    .map(([cat, amt]) => ({ cat, amt }))
    .sort((a, b) => b.amt - a.amt)

  // Savings breakdown by category (entries × elapsed months for YTD amounts)
  const savingsCatMap = savingsEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount * monthsElapsed
    return acc
  }, {})
  const savingsCatEntries = Object.entries(savingsCatMap).sort((a, b) => b[1] - a[1])

  const chartData = MONTHS.map(m => {
    const txnTotal = debits
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

      {/* KPI cards — dark navy, 4-column grid */}
      <div className="grid grid-cols-4 gap-4 mb-5">

        {/* Card 1: Annual Net Income */}
        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Annual Net Income</p>
          <p className={`text-2xl font-bold tabular-nums ${annualNet > 0 ? 'text-white' : 'text-white/20'}`}>
            {annualNet > 0 ? fmt(annualNet) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: '#0D7377' }} />
        </div>

        {/* Card 2: Total Expenses YTD */}
        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Total Expenses YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${totalExpYTD > 0 ? 'text-white' : 'text-white/20'}`}>
            {totalExpYTD > 0 ? fmt(totalExpYTD) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full bg-red-400/70" />
        </div>

        {/* Card 3: Savings YTD */}
        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Savings YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${totalSavingsYTD > 0 ? 'text-white' : 'text-white/20'}`}>
            {totalSavingsYTD > 0 ? fmt(totalSavingsYTD) : '—'}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full" style={{ backgroundColor: totalSavingsYTD > 0 ? '#14A085' : '#374151' }} />
        </div>

        {/* Card 4: Savings Rate YTD */}
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
        <div className="border-t border-gray-100 divide-y divide-gray-50 pt-1">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-600">Savings YTD</span>
            <span className="text-sm font-medium text-[#0D7377] tabular-nums">{allSavingsYTD > 0 ? fmt(allSavingsYTD) : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-semibold text-gray-700">Projected Savings (full year)</span>
            <span className={`text-xl font-bold tabular-nums ${
              projectedSavings === null ? 'text-gray-300' : 'text-[#0D7377]'
            }`}>
              {projectedSavings === null ? '—' : fmt(projectedSavings)}
            </span>
          </div>
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

      {/* YTD Income Statement */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          YTD Income Statement — {APP_YEAR}
          {monthsWithData > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({monthsWithData} mo)</span>}
        </h2>

        {/* Income */}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1">Income</p>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <span className="text-sm text-gray-600">Net Income YTD</span>
          <span className="text-sm font-medium text-gray-800 tabular-nums">{incomeToDate > 0 ? fmt(incomeToDate) : '—'}</span>
        </div>
        <div className="flex justify-between items-center py-2.5 border-t-2 border-gray-200 mb-4">
          <span className="text-sm font-semibold text-gray-700">Total Income</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{incomeToDate > 0 ? fmt(incomeToDate) : '—'}</span>
        </div>

        {/* Fixed Costs */}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1">Fixed Costs</p>
        {fixedCostItems.length > 0
          ? fixedCostItems.map(c => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{c.name}</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">{monthsWithData > 0 ? fmt(c.amount * monthsWithData) : '—'}</span>
              </div>
            ))
          : <div className="py-2"><span className="text-sm italic text-gray-400">No fixed costs entered</span></div>
        }
        <div className="flex justify-between items-center py-2.5 border-t-2 border-gray-200 mb-4">
          <span className="text-sm font-semibold text-gray-700">Fixed Subtotal</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{fixedYTD > 0 ? fmt(fixedYTD) : '—'}</span>
        </div>

        {/* Variable Spending — by group */}
        {varGroups.length === 0 && customVarEntries.length === 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1">Variable Spending</p>
            <div className="py-2"><span className="text-sm italic text-gray-400">No transactions yet</span></div>
            <div className="flex justify-between items-center py-2.5 border-t-2 border-gray-200 mb-4">
              <span className="text-sm font-semibold text-gray-700">Variable Subtotal</span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">—</span>
            </div>
          </>
        )}
        {varGroups.map(g => (
          <div key={g.name}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1 pt-0">{g.name}</p>
            {g.entries.map(({ cat, amt }) => (
              <div key={cat} className="flex items-center py-2 border-b border-gray-50">
                <span className="w-2 h-2 rounded-full shrink-0 mr-2.5" style={{ backgroundColor: g.hex }} />
                <span className="text-sm text-gray-600 flex-1">{cat}</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(amt)}</span>
              </div>
            ))}
          </div>
        ))}
        {customVarEntries.length > 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1 pt-0">Custom</p>
            {customVarEntries.map(({ cat, amt }) => (
              <div key={cat} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">{cat}</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(amt)}</span>
              </div>
            ))}
          </>
        )}
        {(varGroups.length > 0 || customVarEntries.length > 0) && (
          <div className="flex justify-between items-center py-2.5 border-t-2 border-gray-200 mb-4">
            <span className="text-sm font-semibold text-gray-700">Variable Subtotal</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{txnSpent > 0 ? fmt(txnSpent) : '—'}</span>
          </div>
        )}

        {/* Savings */}
        {savingsCatEntries.length > 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1 pt-0">Savings</p>
            {savingsCatEntries.map(([cat, amt]) => (
              <div key={cat} className="flex items-center py-2 border-b border-gray-50">
                <span className="w-2 h-2 rounded-full shrink-0 mr-2.5" style={{ backgroundColor: '#14A085' }} />
                <span className="text-sm text-gray-600 flex-1">{cat}</span>
                <span className="text-sm font-medium text-[#0D7377] tabular-nums">{fmt(amt)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 border-t-2 border-gray-200 mb-4">
              <span className="text-sm font-semibold text-gray-700">Savings Subtotal</span>
              <span className="text-sm font-bold text-[#0D7377] tabular-nums">{fmt(allSavingsYTD)}</span>
            </div>
          </>
        )}

        {/* Totals */}
        <div className="flex justify-between items-center py-2.5 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Total Expenses YTD</span>
          <span className="text-sm font-bold text-gray-900 tabular-nums">{totalExpYTD > 0 ? fmt(totalExpYTD) : '—'}</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-t-4 border-gray-800 mt-1">
          <span className="text-sm font-bold text-gray-800">Net Savings YTD</span>
          <span className={`text-xl font-bold tabular-nums ${
            totalSavingsYTD === null ? 'text-gray-300' : 'text-[#0D7377]'
          }`}>
            {totalSavingsYTD === null ? '—' : fmt(totalSavingsYTD)}
          </span>
        </div>
      </div>

      {/* Bottom row: bar chart + gauge */}
      <div className="flex gap-5 items-start">

        {/* Bar chart */}
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

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#14A085] rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </div>
  )
}

// ─── GetStartedPage ───────────────────────────────────────────────────────────

function GetStartedPage({ salary, transactions, fixedCosts, onNavigate }) {
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
      desc: 'Add your gross salary, tax rate, and deductions so Budgr can calculate your net income and savings rate.',
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
      desc: 'Download your bank statement as a CSV and import it. Works with RBC, TD, Scotiabank, BMO, and CIBC.',
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
      desc: 'See your monthly spending breakdown, category totals, savings rate, and year-to-date summary.',
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
        <p className="text-sm text-gray-400 mt-1">Complete these four steps to get the most out of Budgr.</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Setup progress</span>
          <span className="text-xs font-medium tabular-nums" style={{ color: completedCount === 4 ? '#0D7377' : '#6B7280' }}>
            {completedCount} / 4 complete
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ backgroundColor: '#0D7377', width: `${(completedCount / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {steps.map(step => (
          <div
            key={step.num}
            className={`bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 transition-opacity ${step.done ? 'opacity-60' : ''}`}
          >
            {/* Circle indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: step.done ? '#0D7377' : '#1A1A2E' }}
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
                <span className={`text-sm font-semibold ${step.done ? 'text-gray-400' : 'text-gray-800'}`}>
                  {step.title}
                </span>
                {step.done && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#0D737715', color: '#0D7377' }}>
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
                className="shrink-0 bg-[#1A1A2E] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#0b6165] transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#0D7377' }}
              >
                {step.label} →
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

// ─── AuthScreen ──────────────────────────────────────────────────────────────

function AuthScreen() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (err) setError(err.message)
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-white font-bold text-3xl tracking-tight">Budgr</p>
          <p className="text-white/40 text-sm mt-1">Your personal finance dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#0F3460] rounded-2xl border border-white/10 p-8 shadow-2xl">

          {/* Mode toggle */}
          <div className="flex bg-black/20 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login' ? 'bg-[#0D7377] text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'signup' ? 'bg-[#0D7377] text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#14A085] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#14A085] transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400/90 text-xs py-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D7377] hover:bg-[#0b6165] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  )
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

function SettingsPage({ user, transactions, onClearTransactions }) {
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
    a.download = `budgr-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-lg space-y-4">

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</p>

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
            <span className="text-xs font-medium text-[#0D7377]">Reset email sent!</span>
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</p>

        <label className="block text-xs text-gray-500 mb-1.5">Display Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Your name"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !displayName.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#0D7377] text-white hover:bg-[#0b6165] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] text-center"
          >
            {nameSaving ? '…' : nameSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Data</p>

        <div className="space-y-3">

          {/* Export */}
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

          {/* Clear Transactions — danger zone */}
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">About</p>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-400 font-medium">v1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Support</span>
            <a
              href="mailto:support@budgr.app"
              className="text-sm text-[#0D7377] font-medium hover:underline"
            >
              support@budgr.app
            </a>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Budgr is a personal finance dashboard for tracking spending, categorizing transactions,
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
  const [dragging, setDragging]             = useState(false)
  const [toast, setToast]                   = useState(null)
  const [salary, setSalary]                 = useState({ gross: 0, taxRate: 30, deductions: 0 })
  const [categoryMemory, setCategoryMemory] = useState({})
  const [transactions, setTransactions]     = useState([])
  const [fixedCosts, setFixedCosts]         = useState([])
  const [savingsEntries, setSavingsEntries] = useState([])
  const [dedupKeyCache, setDedupKeyCache]   = useState(new Set())
  const [csvUploads, setCsvUploads]         = useState([])
  const [uploadHistoryOpen, setUploadHistoryOpen] = useState(true)
  const [dashVariableOpen, setDashVariableOpen] = useState(true)
  const [dashFixedOpen, setDashFixedOpen]       = useState(true)
  const [dashSavingsOpen, setDashSavingsOpen]   = useState(true)
  const dataLoadedFor   = useRef(null)
  const salaryTimerRef  = useRef(null)

  const dedupKey = t => `${t.date}|${t.amount}|${t.description.toUpperCase().trim()}`

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user === undefined) return
    if (user === null) { setLoading(false); dataLoadedFor.current = null; return }
    // supabase.auth.updateUser fires USER_UPDATED which triggers this effect again
    // for the same user — skip the full reload when only metadata changed.
    if (dataLoadedFor.current === user.id) return
    dataLoadedFor.current = user.id

    async function loadData() {
      setLoading(true)
      try {
        const [txnRes, memRes, fixedRes, salaryRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('category_memory').select('*').eq('user_id', user.id),
          supabase.from('fixed_costs').select('*').eq('user_id', user.id),
          supabase.from('salary_settings').select('*').eq('user_id', user.id).limit(1),
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
          const rows = fixedRes.data.map(r => ({ id: r.id, name: r.name, amount: r.amount, category: r.category }))
          setFixedCosts(rows.filter(r => !isSaving(r.category)))
          setSavingsEntries(rows.filter(r => isSaving(r.category)))
        }

        const salaryRow = salaryRes.data?.[0]
        if (salaryRow) {
          setSalary({
            gross: salaryRow.gross_salary ?? 0,
            taxRate: salaryRow.tax_rate ?? 30,
            deductions: salaryRow.monthly_deductions ?? 0,
          })
        }

      } catch (err) {
        console.error('[budgr] load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    return () => { dataLoadedFor.current = null }
  }, [user])

  async function addFixedCost(cost) {
    const { data, error } = await supabase
      .from('fixed_costs')
      .insert({ user_id: user.id, name: cost.name, amount: cost.amount, category: cost.category })
      .select()
      .single()
    if (!error && data) {
      setFixedCosts(prev => [...prev, { id: data.id, name: data.name, amount: data.amount, category: data.category }])
    }
  }

  async function deleteFixedCost(id) {
    setFixedCosts(prev => prev.filter(c => c.id !== id))
    await supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id)
  }

  async function addSavingsEntry(entry) {
    const { data, error } = await supabase
      .from('fixed_costs')
      .insert({ user_id: user.id, name: entry.name, amount: entry.amount, category: entry.category })
      .select()
      .single()
    if (!error && data) {
      setSavingsEntries(prev => [...prev, { id: data.id, name: data.name, amount: data.amount, category: data.category }])
    }
  }

  async function deleteSavingsEntry(id) {
    setSavingsEntries(prev => prev.filter(e => e.id !== id))
    await supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id)
  }

  async function setCategory(id, category) {
    const t = transactions.find(tx => tx.id === id)
    if (!t) return

    const descKey = t.description.toUpperCase().trim()

    // Find all other untagged transactions with the same description
    const similar = transactions.filter(
      tx => tx.id !== id && !tx.category && tx.description.toUpperCase().trim() === descKey
    )

    // Apply category to the target + all matching untagged in one state update
    const toUpdate = new Set([id, ...similar.map(tx => tx.id)])
    setTransactions(prev => prev.map(tx =>
      toUpdate.has(tx.id) ? { ...tx, category, fromMemory: tx.id !== id } : tx
    ))

    // Supabase: update the manually tagged row
    supabase.from('transactions').update({ category }).eq('id', id).eq('user_id', user.id).then()

    // Supabase: batch update similar untagged rows
    if (similar.length > 0) {
      supabase.from('transactions')
        .update({ category, from_memory: true })
        .in('id', similar.map(tx => tx.id))
        .eq('user_id', user.id)
        .then()

      clearTimeout(setCategory._timer)
      setToast({ msg: `Auto-tagged ${similar.length} similar transaction${similar.length !== 1 ? 's' : ''}` })
      setCategory._timer = setTimeout(() => setToast(null), 4000)
    }

    // Persist to category_memory using full description as key
    if (category) {
      setCategoryMemory(prev => ({ ...prev, [descKey]: category }))
      supabase.from('category_memory').upsert(
        { user_id: user.id, key: descKey, category },
        { onConflict: 'user_id,key' }
      )
    }
  }

  function parseCSV(text) {
    const cleaned = text.replace(/^﻿/, '')
    const lines   = cleaned.trim().split(/\r?\n/)
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())

    const dateIdx   = headers.findIndex(h => h.includes('date'))
    const descIdx   = headers.findIndex(h => h.includes('description 1'))
    const amountIdx = headers.findIndex(h => h.includes('cad'))

    return lines.slice(1).flatMap((line, i) => {
      const cols = []
      let cur = '', inQuote = false
      for (const ch of line) {
        if (ch === '"') { inQuote = !inQuote }
        else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
        else { cur += ch }
      }
      cols.push(cur.trim())

      const rawAmount = parseFloat(cols[amountIdx]) || 0
      if (rawAmount === 0) return []
      const description = cols[descIdx] || ''
      const type = rawAmount > 0 ? 'credit' : 'debit'
      let category
      if (type === 'debit') {
        category = guessCategory(description)
      } else {
        const upper = description.toUpperCase()
        category = CC_PAYMENT_KEYWORDS.some(k => upper.includes(k)) ? 'Credit Card Payment' : 'Refund / Return'
      }
      return [{ id: Date.now() + i, date: normalizeDate(cols[dateIdx] || ''), description, amount: Math.abs(rawAmount), type, category }]
    })
  }

  function handleFile(file) {
    const reader = new FileReader()
    reader.onload = async e => {
      // 1. Parse + apply category_memory to all incoming rows
      const incoming = parseCSV(e.target.result).map(t => {
        const descKey    = t.description.toUpperCase().trim()
        const remembered = categoryMemory[descKey]
        return { ...t, category: remembered || t.category || '', fromMemory: !!remembered }
      })
      if (incoming.length === 0) return

      // 2. Stage 1 — fast dedup via in-memory cache
      const passedCache = incoming.filter(t => !dedupKeyCache.has(dedupKey(t)))

      // 3. Stage 2 — authoritative Supabase dedup; also fetch existing categories for fallback
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

      // Always record the upload attempt (even if all dupes)
      const newUpload = { id: Date.now(), filename: file.name, total_count: incoming.length, new_count: fresh.length, uploaded_at: new Date().toISOString() }
      setCsvUploads(prev => {
        const next = [newUpload, ...prev]
        localStorage.setItem(`csvUploads_${user.id}`, JSON.stringify(next))
        return next
      })

      // All dupes — patch cache and bail
      if (fresh.length === 0) {
        if (dbExisting.length > 0) {
          const nextCache = new Set(dedupKeyCache)
          dbExisting.forEach(r =>
            nextCache.add(`${r.date}|${r.amount}|${r.description.toUpperCase().trim()}`)
          )
          setDedupKeyCache(nextCache)
        }
        setToast({ msg: `No new transactions — all ${skipped} already existed` })
        clearTimeout(handleFile._toastTimer)
        handleFile._toastTimer = setTimeout(() => setToast(null), 4000)
        return
      }

      // 4. Build description→category fallback from the DB rows we already fetched
      const catByDesc = {}
      dbExisting.forEach(r => {
        if (r.category) catByDesc[r.description.toUpperCase().trim()] = r.category
      })

      // 4b. For fresh rows still missing a category, query DB across all dates by description
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

      // 5. Apply fallback — never leave a row untagged if any source has a category
      const readyToInsert = fresh.map(t => {
        if (t.category) return t
        const fallback = catByDesc[t.description.toUpperCase().trim()]
        return fallback ? { ...t, category: fallback, fromMemory: true } : t
      })

      const autoTagged = readyToInsert.filter(t => t.category).length

      // 6. Insert
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
      if (error) { console.error('[import] insert failed:', error); return }

      // 7. Summary toast
      setToast({ msg: `${fresh.length} new transaction${fresh.length !== 1 ? 's' : ''} imported, ${autoTagged} auto-tagged, ${skipped} already existed` })
      clearTimeout(handleFile._toastTimer)
      handleFile._toastTimer = setTimeout(() => setToast(null), 5000)

      const insertedTxns = inserted.map(r => ({
        id: r.id, date: r.date, description: r.description,
        amount: r.amount, type: r.type, category: r.category ?? '',
        fromMemory: r.from_memory ?? false,
      }))

      // Update cache: merge DB-discovered existing keys + newly inserted keys
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
    }
    reader.readAsText(file)
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

  function handleSalaryChange(next) {
    setSalary(next)
    clearTimeout(salaryTimerRef.current)
    salaryTimerRef.current = setTimeout(async () => {
      const payload = { gross_salary: next.gross, tax_rate: next.taxRate, monthly_deductions: next.deductions }

      const { data: existing, error: selectErr } = await supabase
        .from('salary_settings').select('id').eq('user_id', user.id).limit(1)
      if (selectErr) { console.error('[budgr] salary save failed:', selectErr); return }

      let error
      if (existing?.length) {
        const { error: e } = await supabase
          .from('salary_settings').update(payload).eq('id', existing[0].id)
        error = e
      } else {
        const { error: e } = await supabase
          .from('salary_settings').insert({ user_id: user.id, ...payload })
        error = e
      }
      if (error) console.error('[budgr] salary save failed:', error)
    }, 600)
  }

  const annualNet         = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const selectedMonthLabel = MONTHS.find(m => m.id === selectedMonth)?.label || ''

  const PAGE_TITLES = {
    'get-started': 'Get Started',
    dashboard:    `${selectedMonthLabel} 2026 — Transactions`,
    transactions: 'All Transactions',
    salary:       'Salary',
    fixed:        'Fixed Costs',
    savings:      'Savings',
    categories:   'Categories',
    annual:       'Annual Summary',
    settings:     'Settings',
  }

  if (user === undefined || loading) return <LoadingSpinner />
  if (user === null) return <AuthScreen />

  return (
    <div
      className="flex h-screen bg-gray-100 font-sans"
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
    >

      {/* Global drag overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-teal-500/10 border-4 border-dashed border-[#0D7377] m-3 rounded-2xl pointer-events-none flex items-center justify-center">
          <p className="text-[#0D7377] font-semibold text-lg">Drop CSV to import</p>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-[#1A1A2E] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-white font-semibold text-base">Budgr</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
            <p className="text-white/40 text-xs">CSV only</p>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.heading} className="mb-5">
              <p className="px-5 mb-1 text-[10px] font-semibold text-white/30 tracking-widest uppercase">
                {section.heading}
              </p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full text-left px-5 py-2 text-sm transition-colors flex items-center gap-3
                    ${activePage === item.id
                      ? 'bg-white/10 text-white border-l-2 border-[#14A085]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                  <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            <span className="text-xs text-white/40 truncate flex-1 min-w-0">{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[10px] text-white/30 hover:text-white/70 transition-colors shrink-0 ml-1"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-14 shrink-0">
          <h1 className="text-sm font-medium text-gray-800">{PAGE_TITLES[activePage] || ''}</h1>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-white border border-gray-200 text-gray-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </label>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div className="shrink-0 mx-6 mt-3">
            <div className="flex items-center gap-2 bg-[#0F3460] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow">
              <span>{toast.msg}</span>
              <button onClick={() => setToast(null)} className="ml-auto text-white/60 hover:text-white leading-none">✕</button>
            </div>
          </div>
        )}

        {/* Month tabs — dashboard only */}
        {activePage === 'dashboard' && (
          <div className="bg-white border-b border-gray-100 px-6 flex gap-4 shrink-0">
            {MONTHS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedMonth === m.id
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {m.label.slice(0, 3)}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">

          {activePage === 'get-started' && (
            <GetStartedPage
              salary={salary}
              transactions={transactions}
              fixedCosts={fixedCosts}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'dashboard' && (
            <MonthlyDashboard
              txns={transactions}
              selectedMonth={selectedMonth}
              setCategory={setCategory}
              salary={salary}
              fixedCosts={fixedCosts}
              savingsEntries={savingsEntries}
              variableOpen={dashVariableOpen} setVariableOpen={setDashVariableOpen}
              fixedOpen={dashFixedOpen}       setFixedOpen={setDashFixedOpen}
              savingsOpen={dashSavingsOpen}   setSavingsOpen={setDashSavingsOpen}
            />
          )}

          {activePage === 'transactions' && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-5">

                {/* CSV Import — active */}
                <label className="cursor-pointer bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-3 hover:border-[#0D7377] hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-full bg-[#0D7377]/10 flex items-center justify-center group-hover:bg-[#0D7377]/20 transition-colors">
                    <svg className="w-5 h-5" style={{ color: '#0D7377' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800">Import CSV</p>
                    <p className="text-xs text-gray-400 mt-0.5">RBC, TD, Scotiabank, BMO, CIBC</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                </label>

                {/* Connect Bank — coming soon */}
                <div className="relative bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed select-none">
                  <span className="absolute top-3 right-3 text-[10px] font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h13M17 3v7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Connect Bank</p>
                    <p className="text-xs text-gray-400 mt-0.5">Direct account sync</p>
                  </div>
                </div>

                {/* Connect Credit Card — coming soon */}
                <div className="relative bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed select-none">
                  <span className="absolute top-3 right-3 text-[10px] font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Coming Soon</span>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Connect Credit Card</p>
                    <p className="text-xs text-gray-400 mt-0.5">Automatic card tracking</p>
                  </div>
                </div>

              </div>

              {/* Upload History */}
              <div className="rounded-xl border border-gray-300 mb-5 overflow-hidden">
                <button
                  onClick={() => setUploadHistoryOpen(o => !o)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0D737715' }}>
                      <svg className="w-4 h-4" style={{ color: '#0D7377' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${i === 0 && !allDupes ? 'bg-[#0D7377]' : 'bg-gray-100'}`}>
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
                                <span className="text-xs font-semibold tabular-nums shrink-0 px-2 py-1 rounded-full" style={{ backgroundColor: '#0D737715', color: '#0D7377' }}>
                                  +{newCount} new
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <TransactionView txns={transactions} setCategory={setCategory} />
            </div>
          )}

          {activePage === 'salary' && (
            <SalaryPage
              salary={salary}
              onSalaryChange={handleSalaryChange}
              transactions={transactions}
              selectedMonth={selectedMonth}
              fixedCosts={fixedCosts}
            />
          )}

          {activePage === 'categories' && (
            <CategoriesPage
              transactions={transactions}
              fixedCosts={fixedCosts}
              savingsEntries={savingsEntries}
            />
          )}

          {activePage === 'fixed' && (
            <FixedCostsPage
              fixedCosts={fixedCosts}
              onAdd={addFixedCost}
              onDelete={deleteFixedCost}
            />
          )}

          {activePage === 'savings' && (
            <SavingsPage
              savingsEntries={savingsEntries}
              onAdd={addSavingsEntry}
              onDelete={deleteSavingsEntry}
            />
          )}

          {activePage === 'annual' && (
            <AnnualSummary
              transactions={transactions}
              salary={salary}
              fixedCosts={fixedCosts}
              savingsEntries={savingsEntries}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              user={user}
              transactions={transactions}
              onClearTransactions={() => { setTransactions([]); setDedupKeyCache(new Set()) }}
            />
          )}

        </main>
      </div>
    </div>
  )
}
