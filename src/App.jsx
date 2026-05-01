import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase.js'

const CATEGORIES = [
  'Bars & Nightlife', 'Car Payment / Insurance', 'Clothing', 'Coffee & Drinks',
  'Credit Card Payment', 'Dining Out', 'Education', 'Entertainment',
  'Fees & Charges', 'Fitness & Gym', 'Fuel',
  'Gifts & Donations', 'Groceries', 'Health & Medical',
  'Hobbies & Sports', 'Home & Garden', 'Insurance',
  'Investments', 'Loan Repayments', 'Personal Care',
  'Phone & Internet', 'Refund / Return', 'Rent / Mortgage', 'Savings Transfer',
  'Shopping', 'Subscriptions', 'Transfer / Payment', 'Transit / Rideshare',
  'Travel', 'Utilities',
]

const EXCLUDE_FROM_TOTALS = new Set(['Transfer / Payment', 'Credit Card Payment'])
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
  { name: 'Bills & Finance', hex: '#3B82F6', cats: ['Phone & Internet', 'Subscriptions', 'Insurance', 'Loan Repayments', 'Fees & Charges', 'Savings Transfer', 'Investments'] },
  { name: 'Health & Growth', hex: '#EC4899', cats: ['Health & Medical', 'Fitness & Gym', 'Education'] },
]

const CATEGORY_COLOR = Object.fromEntries(
  CATEGORY_GROUPS.flatMap(g => g.cats.map(c => [c, g.hex]))
)

const FIXED_CATS = new Set([
  'Rent / Mortgage', 'Utilities', 'Car Payment / Insurance',
  'Phone & Internet', 'Subscriptions', 'Insurance',
  'Loan Repayments', 'Savings Transfer', 'Investments',
])

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
      { id: 'dashboard',    label: 'Dashboard' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'salary',       label: 'Salary' },
    ],
  },
  {
    heading: 'SPENDING',
    items: [
      { id: 'fixed',      label: 'Fixed Costs' },
      { id: 'categories', label: 'Categories' },
      { id: 'annual',     label: 'Annual Summary' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { id: 'settings', label: 'Settings' },
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
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">

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
              {CATEGORIES.filter(c => !EXCLUDE_FROM_TOTALS.has(c) && c !== 'Refund / Return').map(c => (
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

// ─── MonthlyDashboard ─────────────────────────────────────────────────────────

function MonthlyDashboard({ txns, selectedMonth, setCategory, salary, fixedCosts }) {
  const monthTxns         = txns.filter(t => yearMonthOf(t.date) === APP_YEAR + '-' + selectedMonth)
  const debits            = monthTxns.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
  const untagged          = monthTxns.filter(t => !t.category).length
  const txnSpent          = debits.reduce((sum, t) => sum + t.amount, 0)
  const fixedMonthlyTotal = fixedCosts.reduce((s, c) => s + c.amount, 0)
  const totalSpent        = txnSpent + fixedMonthlyTotal

  const annualNet   = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const monthlyNet  = annualNet / 12
  const saved       = monthlyNet > 0 ? monthlyNet - totalSpent : null
  const savingsRate = monthlyNet > 0 ? ((monthlyNet - totalSpent) / monthlyNet) * 100 : null

  const variableSpent = debits.filter(t => !FIXED_CATS.has(t.category)).reduce((s, t) => s + t.amount, 0)
  const fixedFromTxns = debits.filter(t =>  FIXED_CATS.has(t.category)).reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex gap-5">

      {/* Left panel */}
      <div className="flex-1 min-w-0">

        {/* Income statement card */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">

          {/* Net Income — light green background */}
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
            <span className="text-sm font-medium text-gray-800 tabular-nums">{fmt(txnSpent)}</span>
          </div>

          {/* Total Expenses — double top border */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total Expenses</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">{fmt(totalSpent)}</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Net Savings */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-700">Net Savings</span>
            <span className={`text-sm font-bold tabular-nums ${saved === null ? 'text-gray-300' : saved >= 0 ? 'text-[#0D7377]' : 'text-red-500'}`}>
              {saved === null ? '—' : (saved < 0 ? '−' : '') + fmt(Math.abs(saved))}
            </span>
          </div>

          {/* Savings Rate */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-500">Savings Rate</span>
            <span className={`text-sm font-semibold tabular-nums ${savingsRate === null ? 'text-gray-300' : savingsRate >= 0 ? 'text-[#0D7377]' : 'text-red-400'}`}>
              {savingsRate === null ? '—' : savingsRate.toFixed(1) + '%'}
            </span>
          </div>

        </div>

        {/* Untagged banner */}
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
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 shrink-0 space-y-4">

        {/* Spending breakdown — merges fixed costs into category groups */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Breakdown</p>

          <div className="space-y-3">
            {CATEGORY_GROUPS.map(group => {
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
              <span className="text-gray-500">Variable</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(variableSpent)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Fixed (transactions)</span>
              <span className="font-medium text-gray-800 tabular-nums">{fmt(fixedFromTxns)}</span>
            </div>
            {fixedMonthlyTotal > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Fixed costs</span>
                <span className="font-medium text-gray-800 tabular-nums">{fmt(fixedMonthlyTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-gray-100">
              <span className="text-gray-700">Total spent</span>
              <span className="text-gray-900 tabular-nums">{fmt(totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Bank connection */}
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

// ─── SalaryPage ───────────────────────────────────────────────────────────────

function SalaryPage({ salary, onSalaryChange, transactions, selectedMonth, fixedCosts }) {
  const [grossDisplay, setGrossDisplay] = useState(
    salary.gross > 0 ? salary.gross.toLocaleString('en-US') : ''
  )

  const annualNet  = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const monthlyNet = annualNet / 12

  const monthIdx     = parseInt(selectedMonth, 10)
  const incomeToDate = monthlyNet * monthIdx

  const debits = transactions.filter(t =>
    t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category)
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

  const fixedMonthlyTotal = fixedCosts.reduce((s, c) => s + c.amount, 0)

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
            Monthly Net × {monthIdx} month{monthIdx !== 1 ? 's' : ''} elapsed (through {monthLabel})
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

const MAX_BAR_H = 140

function AnnualSummary({ transactions, salary, fixedCosts }) {
  const gross            = salary.gross
  const taxAmount        = gross * (salary.taxRate / 100)
  const deductionsAnnual = salary.deductions * 12
  const annualNet        = gross > 0 ? gross - taxAmount - deductionsAnnual : 0
  const monthlyNet       = annualNet / 12

  const fixedMonthlyTotal    = fixedCosts.reduce((s, c) => s + c.amount, 0)
  const fixedAnnualProjected = fixedMonthlyTotal * 12

  const debits = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const txnSpent       = debits.reduce((s, t) => s + t.amount, 0)
  const monthsWithData = new Set(debits.map(t => yearMonthOf(t.date))).size

  const avgMonthlyVariable = monthsWithData > 0 ? txnSpent / monthsWithData : null
  const projectedVariable  = avgMonthlyVariable !== null ? avgMonthlyVariable * 12 : null
  const totalExpensesProj  = projectedVariable !== null ? fixedAnnualProjected + projectedVariable : null
  const netSavingsProj     = annualNet > 0 && totalExpensesProj !== null ? annualNet - totalExpensesProj : null
  const savingsRate        = annualNet > 0 && netSavingsProj !== null ? (netSavingsProj / annualNet) * 100 : null

  // YTD figures (only count fixed costs for months that have transaction data)
  const fixedYTD        = fixedMonthlyTotal * monthsWithData
  const totalExpYTD     = txnSpent + fixedYTD
  const incomeToDate    = monthlyNet * monthsWithData
  const netSavingsYTD   = incomeToDate > 0 ? incomeToDate - totalExpYTD : null
  const savingsRateYTD  = incomeToDate > 0 && netSavingsYTD !== null
    ? (netSavingsYTD / incomeToDate) * 100
    : null

  const monthlyTotals = MONTHS.map(m => {
    const txnTotal = debits
      .filter(t => yearMonthOf(t.date) === APP_YEAR + '-' + m.id)
      .reduce((s, t) => s + t.amount, 0)
    return txnTotal > 0 ? txnTotal + fixedMonthlyTotal : 0
  })
  const barsWithData  = monthlyTotals.filter(v => v > 0).length
  const avgMonthlyBar = barsWithData > 0 ? monthlyTotals.reduce((s, v) => s + v, 0) / barsWithData : 0
  const maxBarVal     = Math.max(...monthlyTotals, monthlyNet > 0 ? monthlyNet : 0, 1)

  const incomeLineBottom = monthlyNet > 0 && maxBarVal > 0
    ? 20 + Math.min((monthlyNet / maxBarVal) * MAX_BAR_H, MAX_BAR_H - 1)
    : null
  const avgLineBottom = avgMonthlyBar > 0 && maxBarVal > 0
    ? 20 + Math.min((avgMonthlyBar / maxBarVal) * MAX_BAR_H, MAX_BAR_H - 1)
    : null

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

        {/* Card 3: Net Savings YTD */}
        <div className="bg-[#1A1A2E] rounded-xl p-5 border border-white/10">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mb-3">Net Savings YTD</p>
          <p className={`text-2xl font-bold tabular-nums ${
            netSavingsYTD === null ? 'text-white/20'
            : netSavingsYTD >= 0 ? 'text-white' : 'text-red-400'
          }`}>
            {netSavingsYTD === null
              ? '—'
              : (netSavingsYTD < 0 ? '−' : '') + fmt(Math.abs(netSavingsYTD))}
          </p>
          <div className="mt-3 h-[3px] w-7 rounded-full"
            style={{ backgroundColor: netSavingsYTD === null ? '#374151' : netSavingsYTD >= 0 ? '#0D7377' : '#EF4444' }} />
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
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-semibold text-gray-700">Net Savings (projected)</span>
            <span className={`text-xl font-bold tabular-nums ${
              netSavingsProj === null ? 'text-gray-300'
              : netSavingsProj >= 0 ? 'text-[#0D7377]' : 'text-red-500'
            }`}>
              {netSavingsProj === null
                ? '—'
                : (netSavingsProj < 0 ? '−' : '') + fmt(Math.abs(netSavingsProj))}
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

      {/* Bottom row: bar chart + gauge */}
      <div className="flex gap-5 items-start">

        {/* Bar chart */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-gray-800">Monthly Spending Overview</p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              {monthlyNet > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5 shrink-0" style={{ borderTop: '2px dashed #22C55E', opacity: 0.7 }} />
                  Monthly income
                </span>
              )}
              {avgMonthlyBar > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5 shrink-0 border-t border-dashed border-gray-400" />
                  Avg spend
                </span>
              )}
            </div>
          </div>

          <div className="relative" style={{ height: `${MAX_BAR_H + 20}px` }}>

            {/* Gridlines */}
            {[25, 50, 75].map(pct => (
              <div key={pct} className="absolute left-0 right-0 border-t border-gray-100 pointer-events-none"
                style={{ bottom: `${20 + (pct / 100) * MAX_BAR_H}px` }}
              />
            ))}

            {/* Monthly net income reference line */}
            {incomeLineBottom !== null && (
              <div className="absolute left-0 right-0 pointer-events-none"
                style={{ bottom: `${incomeLineBottom}px`, borderTop: '2px dashed #22C55E', opacity: 0.55 }}
              />
            )}

            {/* Avg monthly spending reference line */}
            {avgLineBottom !== null && (
              <div className="absolute left-0 right-0 pointer-events-none"
                style={{ bottom: `${avgLineBottom}px`, borderTop: '1px dashed #9CA3AF', opacity: 0.7 }}
              />
            )}

            {/* Bars */}
            <div className="absolute left-0 right-0 flex gap-1.5 items-end"
              style={{ bottom: '20px', height: `${MAX_BAR_H}px` }}>
              {MONTHS.map((m, i) => {
                const val  = monthlyTotals[i]
                const barH = maxBarVal > 0 ? (val / maxBarVal) * MAX_BAR_H : 0
                return (
                  <div key={m.id} className="flex-1 flex flex-col items-center justify-end h-full">
                    {val > 0 && (
                      <span className="text-[8px] text-gray-400 tabular-nums leading-none mb-0.5">{fmtK(val)}</span>
                    )}
                    <div className="w-full rounded-t-sm"
                      style={{ height: `${barH}px`, backgroundColor: val > 0 ? '#0D7377' : 'transparent' }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Month labels */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-1.5">
              {MONTHS.map(m => (
                <div key={m.id} className="flex-1 flex items-center justify-center" style={{ height: '20px' }}>
                  <span className="text-[9px] text-gray-400">{m.label.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
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

  const [activePage, setActivePage]         = useState('dashboard')
  const [selectedMonth, setSelectedMonth]   = useState('01')
  const [dragging, setDragging]             = useState(false)
  const [toast, setToast]                   = useState(null)
  const [salary, setSalary]                 = useState({ gross: 0, taxRate: 30, deductions: 0 })
  const [categoryMemory, setCategoryMemory] = useState({})
  const [transactions, setTransactions]     = useState([])
  const [fixedCosts, setFixedCosts]         = useState([])
  const [dedupKeyCache, setDedupKeyCache]   = useState(new Set())

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
    if (user === null) { setLoading(false); return }

    async function loadData() {
      setLoading(true)
      try {
        const [txnRes, memRes, fixedRes, salaryRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('category_memory').select('*').eq('user_id', user.id),
          supabase.from('fixed_costs').select('*').eq('user_id', user.id),
          supabase.from('salary_settings').select('*').eq('user_id', user.id).maybeSingle(),
        ])

        if (txnRes.data) {
          const txns = txnRes.data.map(r => ({
            id: r.id, date: r.date, description: r.description,
            amount: r.amount, type: r.type, category: r.category ?? '',
            fromMemory: r.from_memory ?? false,
          }))
          setTransactions(txns)
          setDedupKeyCache(new Set(txns.map(dedupKey)))
        }

        if (memRes.data) {
          const mem = {}
          memRes.data.forEach(r => { mem[r.key] = r.category })
          setCategoryMemory(mem)
        }

        if (fixedRes.data) {
          setFixedCosts(fixedRes.data.map(r => ({
            id: r.id, name: r.name, amount: r.amount, category: r.category,
          })))
        }

        if (salaryRes.data) {
          setSalary({
            gross: salaryRes.data.gross ?? 0,
            taxRate: salaryRes.data.tax_rate ?? 30,
            deductions: salaryRes.data.deductions ?? 0,
          })
        }
      } catch (err) {
        console.error('[budgr] load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
    supabase.from('fixed_costs').delete().eq('id', id).eq('user_id', user.id)
  }

  async function setCategory(id, category) {
    const t = transactions.find(t => t.id === id)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category } : t))
    supabase.from('transactions').update({ category }).eq('id', id).eq('user_id', user.id)
    if (t && category) {
      const key = extractKey(t.description)
      if (key) {
        const next = { ...categoryMemory, [key]: category }
        setCategoryMemory(next)
        supabase.from('category_memory').upsert(
          { user_id: user.id, key, category },
          { onConflict: 'user_id,key' }
        )
      }
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
      const incoming = parseCSV(e.target.result).map(t => {
        if (t.type === 'credit') return t
        const key        = extractKey(t.description)
        const remembered = key ? categoryMemory[key] : null
        return { ...t, category: remembered || t.category, fromMemory: !!remembered }
      })

      const fresh   = incoming.filter(t => !dedupKeyCache.has(dedupKey(t)))
      const skipped = incoming.length - fresh.length

      console.log(`[import] ${fresh.length} added, ${skipped} skipped (duplicates)`)
      setToast({ added: fresh.length, skipped })
      clearTimeout(handleFile._toastTimer)
      handleFile._toastTimer = setTimeout(() => setToast(null), 4000)

      if (fresh.length === 0) return

      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert(fresh.map(t => ({
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

      const insertedTxns = inserted.map(r => ({
        id: r.id, date: r.date, description: r.description,
        amount: r.amount, type: r.type, category: r.category ?? '',
        fromMemory: r.from_memory ?? false,
      }))

      const nextCache = new Set(dedupKeyCache)
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
    supabase.from('salary_settings').upsert(
      { user_id: user.id, gross: next.gross, tax_rate: next.taxRate, deductions: next.deductions },
      { onConflict: 'user_id' }
    )
  }

  const annualNet         = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  const selectedMonthLabel = MONTHS.find(m => m.id === selectedMonth)?.label || ''

  const PAGE_TITLES = {
    dashboard:    `${selectedMonthLabel} 2026 — Transactions`,
    transactions: 'All Transactions',
    salary:       'Salary',
    fixed:        'Fixed Costs',
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
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            <p className="text-[#14A085] text-xs">connected · {selectedMonthLabel.slice(0, 3)} 2026</p>
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
                  className={`w-full text-left px-5 py-2 text-sm transition-colors
                    ${activePage === item.id
                      ? 'bg-white/10 text-white border-l-2 border-[#14A085]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                >
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
            <button className="bg-[#0D7377] text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-[#0b6165] transition-colors">
              + Connect bank
            </button>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div className="shrink-0 mx-6 mt-3">
            <div className="flex items-center gap-2 bg-[#0F3460] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow">
              <span>
                {toast.added > 0
                  ? `Added ${toast.added} new transaction${toast.added !== 1 ? 's' : ''}${toast.skipped > 0 ? `, ${toast.skipped} already existed` : ''}`
                  : `No new transactions — all ${toast.skipped} already existed`}
              </span>
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

          {activePage === 'dashboard' && (
            <MonthlyDashboard
              txns={transactions}
              selectedMonth={selectedMonth}
              setCategory={setCategory}
              salary={salary}
              fixedCosts={fixedCosts}
            />
          )}

          {activePage === 'transactions' && (
            <div>
              <div className="mb-5 border-2 border-dashed border-gray-200 bg-white rounded-xl px-5 py-4 text-center">
                <p className="text-sm text-gray-400">Drop a bank CSV anywhere, or use <span className="font-medium text-gray-600">Import CSV</span> above</p>
                <p className="text-xs text-gray-300 mt-0.5">Works with RBC, TD, Scotiabank, BMO, CIBC</p>
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
            <div className="grid grid-cols-3 gap-4">
              {CATEGORY_GROUPS.map(group => {
                const allDebits  = transactions.filter(t => t.type === 'debit' && !EXCLUDE_FROM_TOTALS.has(t.category))
                const groupTotal = group.cats.reduce((sum, cat) =>
                  sum + allDebits.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0), 0
                )
                return (
                  <div key={group.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: group.hex }} />
                        <p className="text-sm font-semibold text-gray-800">{group.name}</p>
                      </div>
                      <span className="text-[11px] text-gray-400">{group.cats.length} cats</span>
                    </div>
                    <div className="space-y-3">
                      {group.cats.map(cat => {
                        const catTotal = allDebits.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0)
                        const pct = groupTotal > 0 ? (catTotal / groupTotal) * 100 : 0
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className={catTotal > 0 ? 'text-gray-600' : 'text-gray-300'}>{cat}</span>
                              <span className={`tabular-nums ${catTotal > 0 ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>
                                {fmt(catTotal)}
                              </span>
                            </div>
                            <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: group.hex }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Group total</span>
                      <span className="text-sm font-semibold text-gray-900">{fmt(groupTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activePage === 'fixed' && (
            <FixedCostsPage
              fixedCosts={fixedCosts}
              onAdd={addFixedCost}
              onDelete={deleteFixedCost}
            />
          )}

          {activePage === 'annual' && (
            <AnnualSummary transactions={transactions} salary={salary} fixedCosts={fixedCosts} />
          )}

          {activePage === 'settings' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-sm">
              <p className="text-sm font-semibold text-gray-800 mb-2">Settings</p>
              <p className="text-xs text-gray-400">Coming soon.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
