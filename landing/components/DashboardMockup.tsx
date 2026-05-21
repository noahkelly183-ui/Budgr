// Pixel-accurate HTML replica of the Budgli dashboard for the hero section.
// Renders crisp at any DPR — no raster images inside.

import React from 'react'

const TEAL  = '#0D7377'
const GREEN = '#00C896'
const NAVY  = '#1A1F2E'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const SCORE_BARS = [
  { label: 'Savings Rate',         value: 50, max: 50 },
  { label: 'Spending Consistency', value: 36, max: 40 },
  { label: 'Clarity',              value: 10, max: 10 },
]

// ─── icon paths (Heroicons v2 outline) ───────────────────────────────────────

const P = {
  home:     'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  chart:    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  trending: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  layers:   'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3',
  tag:      'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z',
  dollar:   'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  lock:     'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  receipt:  'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  wallet:   'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75',
  settings: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  share:    'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
  upload:   'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
  card:     'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
}

type IconName = keyof typeof P

// Color is set on the parent — SVG inherits via stroke="currentColor"
function Ico({ name, size = 14 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth={1.5}
      viewBox="0 0 24 24" style={{ flexShrink: 0 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={P[name]} />
    </svg>
  )
}

// ─── sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({ icon, label, active }: { icon: IconName; label: string; active?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 8px', borderRadius: 6, cursor: 'default',
      background: active ? 'rgba(13,115,119,0.18)' : 'transparent',
      color: active ? GREEN : 'rgba(255,255,255,0.40)',
    }}>
      <Ico name={icon} size={14} />
      <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, iconBg, iconColor, label, value, valueColor, sub,
}: {
  icon: IconName
  iconBg: string
  iconColor: string
  label: string
  value: string
  valueColor?: string
  sub: string
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: '1px solid #F1F5F9', borderRadius: 12,
      padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      background: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Ico name={icon} size={14} />
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 500, color: '#64748B' }}>{label}</span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, color: valueColor ?? '#0F172A', lineHeight: 1, marginBottom: 5 }}>{value}</p>
      <p style={{ fontSize: 9.5, color: '#94A3B8', lineHeight: 1.4 }}>{sub}</p>
    </div>
  )
}

// ─── main export ─────────────────────────────────────────────────────────────

export function DashboardMockup() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#fff', overflow: 'hidden', userSelect: 'none', fontFamily: 'inherit' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 192, flexShrink: 0,
        background: NAVY,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} className="hidden sm:flex">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 18px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>budgli</span>
        </div>

        {/* Dashboards section */}
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <p style={{ fontSize: 8.5, fontWeight: 600, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
            Dashboards
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SidebarItem icon="home"     label="Get Started" />
            <SidebarItem icon="chart"    label="Monthly Dashboard" active />
            <SidebarItem icon="calendar" label="Annual Summary" />
            <SidebarItem icon="trending" label="Savings Forecast" />
            <SidebarItem icon="layers"   label="Year Comparison" />
            <SidebarItem icon="tag"      label="Categories" />
          </div>
        </div>

        {/* My Data section */}
        <div style={{ padding: '0 12px' }}>
          <p style={{ fontSize: 8.5, fontWeight: 600, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
            My Data
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SidebarItem icon="dollar"  label="Income" />
            <SidebarItem icon="lock"    label="Fixed Costs" />
            <SidebarItem icon="receipt" label="Transactions" />
            <SidebarItem icon="wallet"  label="Savings Accounts" />
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: '0 12px', marginTop: 'auto', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarItem icon="settings" label="Settings" />
          <SidebarItem icon="share"    label="Share feedback" />
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', lineHeight: 1, margin: 0 }}>
              January 2026
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Year */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>Year:</span>
                <span style={{ fontSize: 10, color: '#CBD5E1' }}>2025</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: GREEN, borderRadius: 99, padding: '2px 8px' }}>2026</span>
              </div>
              {/* Import */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px', color: '#64748B' }}>
                <Ico name="upload" size={11} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>Import CSV</span>
              </div>
            </div>
          </div>

          {/* Month tabs */}
          <div style={{ display: 'flex' }}>
            {MONTHS.map((m) => (
              <div key={m} style={{
                paddingBottom: 8, paddingLeft: 4, paddingRight: 4, marginRight: 4,
                fontSize: 10.5,
                fontWeight: m === 'Jan' ? 600 : 400,
                color: m === 'Jan' ? TEAL : '#94A3B8',
                borderBottom: `2px solid ${m === 'Jan' ? TEAL : 'transparent'}`,
                whiteSpace: 'nowrap', cursor: 'default',
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>

          {/* Stat row */}
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <StatCard
              icon="card"    iconBg="#FEF2F2" iconColor="#F87171"
              label="Total Spent"   value="$3,521.19"
              sub="How much money you spent this month"
            />
            <StatCard
              icon="trending" iconBg="#F0FDFA" iconColor={TEAL}
              label="Amount Saved"  value="$2,382.87" valueColor={TEAL}
              sub="How much money you saved this month"
            />
          </div>

          {/* Score card */}
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {/* Number */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 46, fontWeight: 800, color: GREEN, lineHeight: 1 }}>96</span>
                <span style={{ fontSize: 11, color: '#94A3B8', paddingBottom: 4 }}>/100</span>
              </div>
              {/* Details */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <p style={{ fontSize: 8.5, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Monthly Score</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>Outstanding</p>
                <p style={{ fontSize: 9.5, color: '#94A3B8', lineHeight: 1.4, marginBottom: 10 }}>
                  Exceptional savings discipline and consistent habits
                </p>
                {SCORE_BARS.map((bar) => (
                  <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 9.5, color: '#64748B', width: 130, flexShrink: 0 }}>{bar.label}</span>
                    <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(bar.value / bar.max) * 100}%`, height: '100%', background: GREEN, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 600, color: TEAL, width: 30, textAlign: 'right', flexShrink: 0 }}>
                      {bar.value}/{bar.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income Statement */}
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>Monthly Income Statement</span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>January 2026</span>
            </div>
            <p style={{ fontSize: 8.5, fontWeight: 600, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Net Income</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, color: '#475569' }}>Net Take-Home Pay</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#0F172A' }}>$4,364.06</span>
            </div>
            <p style={{ fontSize: 8.5, fontWeight: 600, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>Fixed Costs</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: '#475569' }}>Rent</span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#0F172A' }}>$1,050.00</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
