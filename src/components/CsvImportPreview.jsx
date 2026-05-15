import { fmt } from '../utils/finance.js'

const FORMAT_LABELS = {
  'rbc':             'RBC',
  'cibc':            'CIBC',
  'cibc-headerless': 'CIBC',
  'unknown':         'Unknown',
}

// Returns a note if the dominant month in the import differs from the currently viewed month.
function getMonthNote(readyToInsert, selectedYear, selectedMonth) {
  if (!readyToInsert.length) return null
  const freq = {}
  readyToInsert.forEach(t => {
    const ym = t.date.slice(0, 7)
    freq[ym] = (freq[ym] || 0) + 1
  })
  const dominant    = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  const currentView = `${selectedYear}-${selectedMonth}`
  if (dominant === currentView) return null
  const [y, m] = dominant.split('-')
  const label  = new Date(+y, +m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  return `These transactions are from ${label}. Switch to ${label} after import to view them.`
}

export default function CsvImportPreview({ pendingImport, onConfirm, onCancel, importing, selectedYear, selectedMonth }) {
  const { readyToInsert, skipped, format, filename } = pendingImport
  const preview   = readyToInsert.slice(0, 20)
  const monthNote = getMonthNote(readyToInsert, selectedYear, selectedMonth)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">Import Preview</h2>
              <p className="text-sm text-gray-400 mt-0.5 truncate">{filename}</p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0D7377]/10 text-[#0D7377]">
              {FORMAT_LABELS[format] ?? 'Unknown'}
            </span>
          </div>

          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{readyToInsert.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">new transactions</p>
            </div>
            {skipped > 0 && (
              <div>
                <p className="text-2xl font-bold text-gray-300">{skipped}</p>
                <p className="text-xs text-gray-400 mt-0.5">duplicates skipped</p>
              </div>
            )}
          </div>

          {monthNote && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
              {monthNote}
            </p>
          )}
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-100">
              <tr>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-6 py-3 whitespace-nowrap">Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 w-full">Description</th>
                <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 whitespace-nowrap">Amount</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden sm:table-cell whitespace-nowrap">Category</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-6 py-2.5 text-gray-500 tabular-nums text-xs whitespace-nowrap">{t.date}</td>
                  <td className="px-3 py-2.5 text-gray-800 text-xs max-w-0 w-full">
                    <p className="truncate">{t.description}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-xs font-medium whitespace-nowrap">
                    <span className={t.type === 'credit' ? 'text-[#00C896]' : 'text-gray-900'}>
                      {t.type === 'credit' ? '+' : ''}{fmt(t.amount)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 hidden sm:table-cell">
                    {t.category || <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {readyToInsert.length > 20 && (
            <p className="text-xs text-gray-400 text-center py-4 px-6 border-t border-gray-50">
              Showing 20 of {readyToInsert.length} transactions
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onCancel}
            disabled={importing}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={importing}
            className="flex-1 sm:flex-none sm:min-w-[210px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0D7377' }}
          >
            {importing ? 'Importing…' : `Import ${readyToInsert.length} transaction${readyToInsert.length !== 1 ? 's' : ''}`}
          </button>
        </div>

      </div>
    </div>
  )
}
