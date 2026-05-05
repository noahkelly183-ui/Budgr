import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CATEGORIES, CATEGORY_COLOR } from '../constants.js'

export default function CategoryCombobox({ value, onChange }) {
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
