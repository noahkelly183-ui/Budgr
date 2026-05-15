import { normalizeDate, guessCategory } from './finance.js'
import { CC_PAYMENT_KEYWORDS } from '../constants.js'

// ── Shared helpers ────────────────────────────────────────────────────────────

// Quote-aware CSV tokenizer — handles fields containing commas inside quotes
function parseCols(line) {
  const cols = []
  let cur = '', inQuote = false
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
    else { cur += ch }
  }
  cols.push(cur.trim())
  return cols
}

// Strips currency formatting and returns an absolute number.
// Handles: "$1,234.56", "1,234.56", "-45.67", "(45.67)", " 45.67 "
function parseAmount(raw) {
  if (!raw) return 0
  const cleaned = raw.trim().replace(/[$,\s]/g, '').replace(/^\((.+)\)$/, '$1')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : Math.abs(n)
}

// Assigns a category using the same logic for all bank formats.
function categorize(description, type) {
  if (type === 'debit') return guessCategory(description)
  const upper = description.toUpperCase()
  return CC_PAYMENT_KEYWORDS.some(k => upper.includes(k)) ? 'Credit Card Payment' : 'Refund / Return'
}

// ── Headerless CIBC detection ─────────────────────────────────────────────────

// Returns true if the first row of the file looks like a CIBC data row rather
// than a header row. CIBC exports have no header: the file starts directly with
// transactions in fixed columns:  date | description | debit | credit | account
function isCIBCHeaderless(firstRowCols) {
  // Col 0 must be a valid ISO date (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstRowCols[0] || '')) return false
  // Col 1 must be a non-empty description
  if (!(firstRowCols[1] || '').trim()) return false
  // Col 2 or col 3 must have a parseable non-zero amount
  if (parseAmount(firstRowCols[2]) === 0 && parseAmount(firstRowCols[3]) === 0) return false
  return true
}

// ── Bank detection (header-based) ────────────────────────────────────────────

// Returns 'rbc', 'cibc', or 'unknown' based on lowercased header values.
export function detectBank(headers) {
  // RBC: single signed CAD amount column, or two-part description ("Description 1")
  if (headers.some(h => h.includes('cad')) || headers.some(h => h.includes('description 1'))) {
    return 'rbc'
  }
  // CIBC headered (and same-format banks): separate Debit + Credit columns
  const hasDebit  = headers.some(h => h === 'debit'  || h === 'withdrawal' || h === 'money out')
  const hasCredit = headers.some(h => h === 'credit' || h === 'deposit'    || h === 'money in')
  const hasDate   = headers.some(h => h.includes('date'))
  const hasDesc   = headers.some(h => h.includes('description') || h.includes('details'))
  if ((hasDebit || hasCredit) && hasDate && hasDesc) return 'cibc'
  return 'unknown'
}

// ── RBC parser ────────────────────────────────────────────────────────────────

// Preserves the original RBC behavior exactly.
function parseRBC(lines, headers) {
  const dateIdx   = headers.findIndex(h => h.includes('date'))
  const descIdx   = headers.findIndex(h => h.includes('description 1'))
  const amountIdx = headers.findIndex(h => h.includes('cad'))

  return lines.slice(1).flatMap((line, i) => {
    const cols      = parseCols(line)
    const rawAmount = parseFloat(cols[amountIdx]) || 0
    if (rawAmount === 0) return []
    const description = cols[descIdx] || ''
    const type        = rawAmount > 0 ? 'credit' : 'debit'
    return [{ id: Date.now() + i, date: normalizeDate(cols[dateIdx] || ''), description, amount: Math.abs(rawAmount), type, category: categorize(description, type) }]
  })
}

// ── CIBC headered parser ──────────────────────────────────────────────────────

// For any CIBC export that happens to include a header row.
// Column name variants handled:
//   date:        Date | Transaction Date | Posting Date | Posted Date
//   description: Description | Transaction Description | Details | Transaction Details
//   debit:       Debit | Withdrawal | Money Out
//   credit:      Credit | Deposit | Money In
function parseCIBCHeadered(lines, headers) {
  const dateIdx = headers.findIndex(h =>
    h === 'date' || h === 'transaction date' || h === 'posting date' || h === 'posted date'
  )
  const descIdx = headers.findIndex(h =>
    h === 'description' || h === 'transaction description' || h === 'details' || h === 'transaction details'
  )
  const debitIdx = headers.findIndex(h =>
    h === 'debit' || h === 'withdrawal' || h === 'money out'
  )
  const creditIdx = headers.findIndex(h =>
    h === 'credit' || h === 'deposit' || h === 'money in'
  )

  if (dateIdx === -1 || descIdx === -1 || (debitIdx === -1 && creditIdx === -1)) return []

  return lines.slice(1).flatMap((line, i) => {
    if (!line.trim()) return []
    const cols = parseCols(line)

    const date        = normalizeDate(cols[dateIdx]?.trim() || '')
    const description = cols[descIdx]?.trim() || ''
    if (!date || !description) return []

    const debitAmt  = debitIdx  !== -1 ? parseAmount(cols[debitIdx])  : 0
    const creditAmt = creditIdx !== -1 ? parseAmount(cols[creditIdx]) : 0
    if (debitAmt === 0 && creditAmt === 0) return []

    // When both columns have a value (malformed row), debit takes precedence
    const type   = debitAmt > 0 ? 'debit' : 'credit'
    const amount = debitAmt > 0 ? debitAmt : creditAmt

    return [{ id: Date.now() + i, date, description, amount, type, category: categorize(description, type) }]
  })
}

// ── CIBC headerless parser ────────────────────────────────────────────────────

// The actual CIBC export format: no header row. Fixed column positions:
//   0 = Date (YYYY-MM-DD)
//   1 = Description
//   2 = Debit / charge / money out  (positive number, or blank)
//   3 = Credit / payment / money in (positive number, or blank)
//   4 = Masked card/account number  (ignored — not stored in transaction schema)
//
// All lines are data rows — row 0 is NOT skipped.
function parseCIBCHeaderless(lines) {
  return lines.flatMap((line, i) => {
    if (!line.trim()) return []
    const cols = parseCols(line)

    const date        = normalizeDate(cols[0]?.trim() || '')
    const description = cols[1]?.trim() || ''
    if (!date || !description) return []

    const debitAmt  = parseAmount(cols[2] ?? '')
    const creditAmt = parseAmount(cols[3] ?? '')
    if (debitAmt === 0 && creditAmt === 0) return []

    // When both columns have a value (shouldn't happen in valid CIBC exports), debit takes precedence
    const type   = debitAmt > 0 ? 'debit' : 'credit'
    const amount = debitAmt > 0 ? debitAmt : creditAmt

    return [{ id: Date.now() + i, date, description, amount, type, category: categorize(description, type) }]
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

// Returns the first row's headers and up to 5 sample data rows without
// attempting to parse the full file. Used by the manual column mapper.
export function parseForMapper(text) {
  const cleaned    = text.replace(/^﻿/, '')
  const lines      = cleaned.trim().split(/\r?\n/)
  const headers    = parseCols(lines[0])
  const sampleRows = lines.slice(1, 6).filter(l => l.trim()).map(parseCols)
  return { headers, sampleRows, lines }
}

// Parses all data rows (skipping row 0 as headers) using a user-supplied
// column mapping. `mapping` shape: { dateIdx, descIdx, amountIdx?, debitIdx?, creditIdx? }
// amountIdx: signed single-amount column (negative = debit)
// debitIdx / creditIdx: separate unsigned debit and credit columns
export function normalizeWithMapping(lines, mapping) {
  const { dateIdx, descIdx, amountIdx, debitIdx, creditIdx } = mapping
  return lines.slice(1).flatMap((line, i) => {
    if (!line.trim()) return []
    const cols = parseCols(line)

    const date        = normalizeDate(cols[dateIdx]?.trim() || '')
    const description = cols[descIdx]?.trim() || ''
    if (!date || !description) return []

    let type, amount
    if (amountIdx != null) {
      const raw    = (cols[amountIdx] ?? '').trim().replace(/[$,\s]/g, '').replace(/^\((.+)\)$/, '-$1')
      const rawNum = parseFloat(raw)
      if (isNaN(rawNum) || rawNum === 0) return []
      type   = rawNum < 0 ? 'debit' : 'credit'
      amount = Math.abs(rawNum)
    } else {
      const debitAmt  = debitIdx  != null ? parseAmount(cols[debitIdx]  ?? '') : 0
      const creditAmt = creditIdx != null ? parseAmount(cols[creditIdx] ?? '') : 0
      if (debitAmt === 0 && creditAmt === 0) return []
      type   = debitAmt > 0 ? 'debit' : 'credit'
      amount = debitAmt > 0 ? debitAmt : creditAmt
    }

    return [{ id: Date.now() + i, date, description, amount, type, category: categorize(description, type) }]
  })
}

// Returns the detected format string without parsing the full file.
// Used by the import preview to display which bank was detected.
export function detectFormat(text) {
  const cleaned      = text.replace(/^﻿/, '')
  const lines        = cleaned.trim().split(/\r?\n/)
  const firstRowCols = parseCols(lines[0])
  if (isCIBCHeaderless(firstRowCols)) return 'cibc-headerless'
  const headers = firstRowCols.map(h => h.replace(/"/g, '').toLowerCase())
  return detectBank(headers)  // 'rbc', 'cibc', or 'unknown'
}

// Parses a raw CSV string into normalized transaction objects.
// Detection order:
//   1. Headerless CIBC  — first row content matches date|desc|amount pattern
//   2. Header-based RBC — headers contain 'cad' or 'description 1'
//   3. Header-based CIBC — headers contain separate debit/credit columns
//   4. Unknown          — returns [] and warns in console
//
// Returns: { id, date (YYYY-MM-DD), description, amount (absolute), type ('debit'|'credit'), category }
export function parseCSV(text) {
  const cleaned = text.replace(/^﻿/, '')  // strip UTF-8 BOM
  const lines   = cleaned.trim().split(/\r?\n/)

  // Check headerless CIBC before touching headers — must use parseCols so that
  // quoted commas inside the description field don't split into extra columns.
  const firstRowCols = parseCols(lines[0])
  if (isCIBCHeaderless(firstRowCols)) return parseCIBCHeaderless(lines)

  // Header-based detection for RBC and headered CIBC variants
  const headers = firstRowCols.map(h => h.replace(/"/g, '').toLowerCase())
  const bank    = detectBank(headers)
  if (bank === 'rbc')  return parseRBC(lines, headers)
  if (bank === 'cibc') return parseCIBCHeadered(lines, headers)

  console.warn('[csvParsers] Unrecognised CSV format — headers:', headers)
  return []
}
