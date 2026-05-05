import { RULES } from '../constants.js'

// ── Formatting ────────────────────────────────────────────────────────────────

const FMT_DATE_OPTS = { month: 'short', day: 'numeric', year: 'numeric' }

export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).toLocaleDateString('en-US', FMT_DATE_OPTS)
  const us = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (us) return new Date(+us[3], +us[1] - 1, +us[2]).toLocaleDateString('en-US', FMT_DATE_OPTS)
  return dateStr
}

export const fmt  = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtK = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : n > 0 ? '$' + n.toFixed(0) : ''

// ── Date helpers ──────────────────────────────────────────────────────────────

// Converts M/D/YYYY or MM/DD/YYYY → YYYY-MM-DD; already-ISO dates pass through
export function normalizeDate(dateStr) {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const us = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (us) return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`
  return dateStr
}

// Returns "YYYY-MM" from a normalized ISO date
export function yearMonthOf(isoDate) {
  if (!isoDate) return ''
  const m = isoDate.match(/^(\d{4})-(\d{2})-\d{2}$/)
  return m ? `${m[1]}-${m[2]}` : ''
}

// ── Category guessing ─────────────────────────────────────────────────────────

export function guessCategory(description) {
  const upper = description.toUpperCase()
  for (const { keywords, category } of RULES) {
    if (keywords.some(k => upper.includes(k))) return category
  }
  return ''
}

// ── Shared financial calculations ─────────────────────────────────────────────

export function calcNetIncome(salary) {
  const annualNet = salary.gross > 0
    ? salary.gross * (1 - salary.taxRate / 100) - salary.deductions * 12
    : 0
  return { annualNet, monthlyNet: annualNet / 12 }
}

// Sum of all fixed cost entries (fixedCosts state already excludes savings entries)
export function calcFixedTotal(fixedCosts) {
  return fixedCosts.reduce((s, c) => s + c.amount, 0)
}
