import { CATEGORIES, CATEGORY_GROUPS, EXCLUDE_FROM_TOTALS, APP_YEAR, isSaving } from '../constants.js'
import { fmt, yearMonthOf } from '../utils/finance.js'

const CATS_SET = new Set(CATEGORIES)

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 pt-5 pb-1 first:pt-0">
      {children}
    </p>
  )
}

function Row({ label, value, muted, italic, colorClass, dot }) {
  return (
    <div className="flex items-center py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {dot && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
        )}
        <span className={`text-sm truncate ${italic ? 'italic ' : ''}${muted ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <span className={`text-sm tabular-nums text-right w-28 shrink-0 font-medium ${colorClass || 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

function Subtotal({ label, value, colorClass }) {
  return (
    <div className="flex items-center py-2.5 border-t-2 border-gray-200">
      <span className="flex-1 text-sm font-semibold text-gray-700">{label}</span>
      <span className={`text-sm font-bold tabular-nums text-right w-28 shrink-0 ${colorClass || 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}

export default function CategoriesPage({ transactions, fixedCosts, savingsEntries }) {
  // Year-to-date debits (excluding transfers/CC payments)
  const allDebitsAnn = transactions.filter(t =>
    t.type === 'debit' &&
    !EXCLUDE_FROM_TOTALS.has(t.category) &&
    yearMonthOf(t.date).slice(0, 4) === APP_YEAR
  )
  const monthsWithData = new Set(allDebitsAnn.map(t => yearMonthOf(t.date))).size

  // Fixed costs (non-savings) — YTD = monthly × months elapsed
  const fixedCostItems    = fixedCosts.filter(c => !isSaving(c.category))
  const fixedMonthlyTotal = fixedCostItems.reduce((s, c) => s + c.amount, 0)
  const fixedYTD          = fixedMonthlyTotal * monthsWithData

  // Variable spending from transactions, grouped by category
  const variableDebitsAnn = allDebitsAnn.filter(t => !isSaving(t.category))
  const varByCategory = {}
  for (const t of variableDebitsAnn) {
    const cat = t.category || 'Uncategorized'
    varByCategory[cat] = (varByCategory[cat] || 0) + t.amount
  }

  // Standard categories broken into CATEGORY_GROUPS (excluding Savings group)
  const spendingGroups = CATEGORY_GROUPS.filter(g => g.name !== 'Savings').map(group => {
    const entries = group.cats
      .filter(cat => varByCategory[cat] > 0)
      .map(cat => [cat, varByCategory[cat]])
      .sort(([, a], [, b]) => b - a)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    return { ...group, entries, total }
  }).filter(g => g.total > 0)

  const standardVarTotal = spendingGroups.reduce((s, g) => s + g.total, 0)

  // Custom categories — not in predefined CATEGORIES list
  const customEntries = Object.entries(varByCategory)
    .filter(([cat]) => !CATS_SET.has(cat))
    .sort(([, a], [, b]) => b - a)
  const customTotal = customEntries.reduce((s, [, v]) => s + v, 0)

  // Savings entries — YTD = monthly × months elapsed, grouped by category
  const savingsByCategory = {}
  for (const e of savingsEntries) {
    savingsByCategory[e.category] = (savingsByCategory[e.category] || 0) + e.amount
  }
  const savingsCatEntries = Object.entries(savingsByCategory)
    .map(([cat, monthly]) => [cat, monthly * monthsWithData])
    .sort(([, a], [, b]) => b - a)
  const savingsYTD = savingsCatEntries.reduce((s, [, v]) => s + v, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">
        Categories — {APP_YEAR} YTD
        {monthsWithData > 0 && (
          <span className="ml-2 text-xs font-normal text-gray-400">({monthsWithData} mo)</span>
        )}
      </h2>

      {/* ── Fixed Costs ─────────────────────────────── */}
      <SectionLabel>Fixed Costs</SectionLabel>
      {fixedCostItems.length > 0
        ? fixedCostItems.map(c => (
            <Row key={c.id}
              label={c.name}
              value={monthsWithData > 0 ? fmt(c.amount * monthsWithData) : '—'} />
          ))
        : <Row label="No fixed costs entered" value="—" muted italic />
      }
      <Subtotal label="Fixed Costs YTD" value={fixedYTD > 0 ? fmt(fixedYTD) : '—'} />

      {/* ── Variable Spending (by group) ─────────────── */}
      {spendingGroups.length === 0 && (
        <>
          <SectionLabel>Variable Spending</SectionLabel>
          <Row label="No transactions yet" value="—" muted italic />
          <Subtotal label="Variable Subtotal YTD" value="—" />
        </>
      )}
      {spendingGroups.map(group => (
        <div key={group.name}>
          <SectionLabel>{group.name}</SectionLabel>
          {group.entries.map(([cat, amt]) => (
            <Row key={cat} label={cat} value={fmt(amt)} dot={group.hex} />
          ))}
          <Subtotal label={`${group.name} Subtotal`} value={fmt(group.total)} />
        </div>
      ))}

      {/* ── Custom Categories (user-defined via retagging) ── */}
      {customEntries.length > 0 && (
        <>
          <SectionLabel>Custom Categories</SectionLabel>
          {customEntries.map(([cat, amt]) => (
            <Row key={cat} label={cat} value={fmt(amt)} />
          ))}
          <Subtotal label="Custom Categories YTD" value={fmt(customTotal)} />
        </>
      )}

      {/* ── Savings ──────────────────────────────────── */}
      <SectionLabel>Savings</SectionLabel>
      {savingsCatEntries.length > 0
        ? savingsCatEntries.map(([cat, ytdAmt]) => (
            <Row key={cat}
              label={cat}
              value={ytdAmt > 0 ? fmt(ytdAmt) : '—'}
              colorClass="text-[#0D7377]" />
          ))
        : <Row label="No savings entries" value="—" muted italic />
      }
      <Subtotal
        label="Total Savings YTD"
        value={savingsYTD > 0 ? fmt(savingsYTD) : '—'}
        colorClass="text-[#0D7377]" />
    </div>
  )
}
