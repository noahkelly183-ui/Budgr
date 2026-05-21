'use client'

import { motion } from 'framer-motion'

const INPUTS = [
  {
    label: 'Credit Cards',
    sub: 'All transactions',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    label: 'Debit Cards',
    sub: 'Bank data',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    label: 'Bank CSV',
    sub: 'Any format',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
]

const OUTPUTS = [
  {
    label: 'Income Statement',
    sub: 'Net in, net out',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    label: 'Monthly Analysis',
    sub: 'Score + breakdown',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: 'Savings Forecast',
    sub: '1yr to 30yr view',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
]

function Connector({ dir }: { dir: 'left' | 'right' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {dir === 'right' && (
        <div style={{ flex: 1, borderTop: '1px dashed rgba(0,200,150,0.3)' }} />
      )}
      <div style={{
        width: 0, height: 0,
        borderTop: '3.5px solid transparent',
        borderBottom: '3.5px solid transparent',
        ...(dir === 'left'
          ? { borderRight: '5px solid rgba(0,200,150,0.35)' }
          : { borderLeft: '5px solid rgba(0,200,150,0.35)' }),
      }} />
      {dir === 'left' && (
        <div style={{ flex: 1, borderTop: '1px dashed rgba(0,200,150,0.3)' }} />
      )}
    </div>
  )
}

function SystemDiagram() {
  return (
    <div
      className="relative rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.18,
        }}
      />

      {/* Green glow behind hub */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 220,
          height: 220,
          background: 'radial-gradient(circle, rgba(0,200,150,0.14) 0%, transparent 65%)',
        }}
      />

      <div className="relative p-5 sm:p-8 overflow-x-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 48px 110px 48px 1fr',
            gridTemplateRows: 'repeat(3, auto)',
            rowGap: 12,
            columnGap: 0,
            minWidth: 460,
          }}
        >
          {/* INPUT NODES */}
          {INPUTS.map((node, i) => (
            <div
              key={node.label}
              style={{ gridRow: i + 1, gridColumn: 1 }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-3 flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0 text-white/45">
                {node.icon}
              </div>
              <div className="min-w-0">
                <p className="text-white/75 text-xs font-medium leading-snug truncate">{node.label}</p>
                <p className="text-white/30 text-[10px] leading-tight">{node.sub}</p>
              </div>
            </div>
          ))}

          {/* LEFT CONNECTORS */}
          {INPUTS.map((_, i) => (
            <div
              key={i}
              style={{ gridRow: i + 1, gridColumn: 2, display: 'flex', alignItems: 'center' }}
            >
              <Connector dir="right" />
            </div>
          ))}

          {/* BUDGLI HUB — spans all 3 rows */}
          <div
            style={{ gridRow: '1 / 4', gridColumn: 3, alignSelf: 'center' }}
            className="flex flex-col items-center justify-center gap-2.5 py-2"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(0,200,150,0.10)',
                border: '1.5px solid rgba(0,200,150,0.45)',
                boxShadow: '0 0 28px rgba(0,200,150,0.18), 0 0 6px rgba(0,200,150,0.10)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Budgli" className="w-7 h-7" />
            </div>
            <span
              className="text-[11px] font-bold tracking-wide"
              style={{ color: '#00C896' }}
            >
              budgli
            </span>
          </div>

          {/* RIGHT CONNECTORS */}
          {OUTPUTS.map((_, i) => (
            <div
              key={i}
              style={{ gridRow: i + 1, gridColumn: 4, display: 'flex', alignItems: 'center' }}
            >
              <Connector dir="left" />
            </div>
          ))}

          {/* OUTPUT NODES */}
          {OUTPUTS.map((node, i) => (
            <div
              key={node.label}
              style={{ gridRow: i + 1, gridColumn: 5 }}
              className="rounded-xl border border-budgli-green/20 bg-budgli-green/5 px-3 sm:px-4 py-3 flex items-center gap-2.5"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#00C896' }}
              >
                {node.icon}
              </div>
              <div className="min-w-0">
                <p className="text-white/75 text-xs font-medium leading-snug truncate">{node.label}</p>
                <p className="text-white/30 text-[10px] leading-tight">{node.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Zone labels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 48px 110px 48px 1fr',
            minWidth: 460,
            marginTop: 10,
          }}
        >
          <p className="text-[9px] text-white/25 uppercase tracking-widest">Your financial data</p>
          <span />
          <p className="text-[9px] uppercase tracking-widest text-center" style={{ color: 'rgba(0,200,150,0.45)' }}>Engine</p>
          <span />
          <p className="text-[9px] text-white/25 uppercase tracking-widest text-right">Financial clarity</p>
        </div>
      </div>
    </div>
  )
}

export default function FounderStory() {
  return (
    <section className="py-20 px-6 bg-[#0D7377]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section header */}
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,200,150,0.65)' }}>
              Why we built Budgli
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug tracking-tight mb-4">
              Built from a spreadsheet that actually worked.
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              Every month: export transactions, retag every row, run SUMIF formulas, read the numbers.
              The workflow gave real clarity — but it was too manual to share.
              Budgli does the same thing, automatically.
            </p>
          </div>

          {/* System diagram */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SystemDiagram />
          </motion.div>

          {/* Founder attribution */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 max-w-2xl mx-auto">
            <div className="w-9 h-9 rounded-full bg-white/8 border border-white/12 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Noah Kelly</p>
              <p className="text-xs text-white/40">Founder, Budgli</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
