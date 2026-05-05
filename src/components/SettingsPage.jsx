import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function SettingsPage({ user, transactions, onClearTransactions }) {
  const [displayName, setDisplayName]   = useState(user.user_metadata?.display_name || '')
  const [nameSaving, setNameSaving]     = useState(false)
  const [nameSaved, setNameSaved]       = useState(false)
  const [pwSent, setPwSent]             = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing]         = useState(false)

  async function handleSaveName() {
    if (!displayName.trim()) return
    setNameSaving(true)
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  async function handleResetPassword() {
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin })
    setPwSent(true)
  }

  async function handleClearTransactions() {
    setClearing(true)
    await supabase.from('transactions').delete().eq('user_id', user.id)
    onClearTransactions()
    setClearing(false)
    setClearConfirm(false)
  }

  function handleExport() {
    if (transactions.length === 0) return
    const rows = [
      ['Date', 'Description', 'Amount', 'Type', 'Category'],
      ...transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `budgr-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-lg space-y-4">

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide">Signed in as</p>
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Change Password</p>
            <p className="text-xs text-gray-400 mt-0.5">We'll send a reset link to your email</p>
          </div>
          {pwSent ? (
            <span className="text-xs font-medium text-[#0D7377]">Reset email sent!</span>
          ) : (
            <button
              onClick={handleResetPassword}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Send Reset Email
            </button>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</p>
        <label className="block text-xs text-gray-500 mb-1.5">Display Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Your name"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0D7377] transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !displayName.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#0D7377] text-white hover:bg-[#0b6165] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] text-center"
          >
            {nameSaving ? '…' : nameSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Data</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Export My Data</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {transactions.length > 0
                  ? `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} as CSV`
                  : 'No transactions to export'}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={transactions.length === 0}
              className="ml-4 shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Download CSV
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 border-l-4 border-l-red-300">
            <div>
              <p className="text-sm font-medium text-gray-700">Clear All Transactions</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently deletes all your transaction data</p>
            </div>
            {clearConfirm ? (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className="text-xs font-medium text-red-500 whitespace-nowrap">Are you sure?</span>
                <button
                  onClick={handleClearTransactions}
                  disabled={clearing}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {clearing ? '…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="ml-4 shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">About</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-400 font-medium">v1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Support</span>
            <a href="mailto:support@budgr.app" className="text-sm text-[#0D7377] font-medium hover:underline">
              support@budgr.app
            </a>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Budgr is a personal finance dashboard for tracking spending, categorizing transactions,
              and understanding your savings rate — all synced to your account.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
