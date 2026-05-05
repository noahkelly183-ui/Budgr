import { useState } from 'react'
import { CATEGORIES, EXCLUDE_FROM_TOTALS, CATEGORY_COLOR, isSaving } from '../constants.js'
import { fmt } from '../utils/finance.js'

export default function FixedCostsPage({ fixedCosts, onAdd, onDelete }) {
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
              {CATEGORIES.filter(c => !EXCLUDE_FROM_TOTALS.has(c) && c !== 'Refund / Return' && !isSaving(c)).map(c => (
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
