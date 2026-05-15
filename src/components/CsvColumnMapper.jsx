import { useState, useMemo } from 'react'

const ROLES = ['ignore', 'date', 'description', 'amount', 'debit', 'credit']

const ROLE_LABELS = {
  ignore:      '— Ignore',
  date:        'Date',
  description: 'Description',
  amount:      'Amount (signed)',
  debit:       'Debit / Out',
  credit:      'Credit / In',
}

const ROLE_COLORS = {
  ignore:      'text-gray-400',
  date:        'text-blue-600',
  description: 'text-purple-600',
  amount:      'text-[#0D7377]',
  debit:       'text-red-500',
  credit:      'text-[#00C896]',
}

function autoDetect(headers) {
  return headers.map(h => {
    const l = h.toLowerCase().trim()
    if (/date/.test(l))                           return 'date'
    if (/desc|detail|memo|payee|narr/.test(l))    return 'description'
    if (/\bcad\b|\bamount\b/.test(l))             return 'amount'
    if (/debit|withdrawal|money.?out/.test(l))    return 'debit'
    if (/credit|deposit|money.?in/.test(l))       return 'credit'
    return 'ignore'
  })
}

export default function CsvColumnMapper({ pendingMapper, onMap, onCancel }) {
  const { headers, sampleRows, filename } = pendingMapper
  const [assignments, setAssignments] = useState(() => autoDetect(headers))

  const error = useMemo(() => {
    const hasDate = assignments.includes('date')
    const hasDesc = assignments.includes('description')
    const hasAmt  = assignments.includes('amount') || assignments.includes('debit') || assignments.includes('credit')
    if (!hasDate) return 'Map a Date column to continue.'
    if (!hasDesc) return 'Map a Description column to continue.'
    if (!hasAmt)  return 'Map an Amount column (or Debit / Credit) to continue.'
    return null
  }, [assignments])

  function setRole(colIdx, role) {
    setAssignments(prev => {
      const next = [...prev]
      // Each non-ignore role can only be assigned to one column at a time
      if (role !== 'ignore') {
        next.forEach((r, i) => { if (r === role && i !== colIdx) next[i] = 'ignore' })
      }
      next[colIdx] = role
      return next
    })
  }

  function handleConfirm() {
    if (error) return
    const idx = r => { const i = assignments.indexOf(r); return i === -1 ? null : i }
    onMap({
      dateIdx:   idx('date'),
      descIdx:   idx('description'),
      amountIdx: idx('amount'),
      debitIdx:  idx('debit'),
      creditIdx: idx('credit'),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">Map Columns</h2>
              <p className="text-sm text-gray-400 mt-0.5 truncate">{filename}</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              Unknown Format
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Budgli couldn't detect the bank format. Tell us what each column contains, then we'll show you a preview before importing.
          </p>
        </div>

        {/* Mapping table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="text-sm" style={{ minWidth: `${Math.max(headers.length * 140, 400)}px`, width: '100%' }}>
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left align-top" style={{ minWidth: 140 }}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate mb-2">
                      {h || `Column ${i + 1}`}
                    </p>
                    <select
                      value={assignments[i]}
                      onChange={e => setRole(i, e.target.value)}
                      className={`w-full text-xs font-medium rounded-lg border border-gray-200 px-2 py-1.5 bg-white outline-none focus:border-[#0D7377] transition-colors cursor-pointer ${ROLE_COLORS[assignments[i]]}`}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} className="text-gray-800">
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-6 text-center text-xs text-gray-400">
                    No sample rows available
                  </td>
                </tr>
              ) : (
                sampleRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    {headers.map((_, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-2.5 text-xs truncate ${assignments[ci] === 'ignore' ? 'text-gray-300' : 'text-gray-600'}`}
                        style={{ maxWidth: 160 }}
                      >
                        {row[ci] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100">
          {error && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 leading-relaxed">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!!error}
              className="flex-1 sm:flex-none sm:min-w-[200px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0D7377' }}
            >
              Continue to Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
