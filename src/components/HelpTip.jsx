import { useState } from 'react'
import { Info } from 'lucide-react'

export default function HelpTip({ text }) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex items-center ml-1.5 shrink-0"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="flex items-center opacity-30 hover:opacity-70 transition-opacity cursor-help"
        aria-label="More info"
      >
        <Info className="w-3 h-3" />
      </button>
      {show && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-44 px-3 py-2 rounded-lg text-[11px] leading-snug text-white/80 shadow-xl"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {text}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 block"
            style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1A1A2E' }}
          />
        </span>
      )}
    </span>
  )
}
