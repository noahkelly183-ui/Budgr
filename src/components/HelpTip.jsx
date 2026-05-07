import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

export default function HelpTip({ text }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)

  const show = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const centerX = r.left + r.width / 2
    const tooltipW = 176 // w-44
    const clamped = Math.max(8 + tooltipW / 2, Math.min(window.innerWidth - 8 - tooltipW / 2, centerX))
    setPos({ top: r.top - 8, centerX: clamped })
  }, [])

  const hide = useCallback(() => setPos(null), [])

  return (
    <span className="relative inline-flex items-center ml-1.5 shrink-0">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => pos ? hide() : show()}
        className="flex items-center opacity-30 hover:opacity-70 transition-opacity cursor-help"
        aria-label="More info"
      >
        <Info className="w-3 h-3" />
      </button>
      {pos && createPortal(
        <span
          className="fixed z-[9999] w-44 px-3 py-2 rounded-lg text-[11px] leading-snug text-white/80 shadow-xl pointer-events-none"
          style={{
            backgroundColor: '#1A1A2E',
            border: '1px solid rgba(255,255,255,0.12)',
            top: pos.top,
            left: pos.centerX,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          {text}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 block"
            style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1A1A2E' }}
          />
        </span>,
        document.body
      )}
    </span>
  )
}
