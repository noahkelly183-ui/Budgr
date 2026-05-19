import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

const PRIMARY_GOAL_OPTIONS = [
  'Save more money',
  'Reduce unnecessary spending',
  'Pay down debt',
  'Build an emergency fund',
  'Understand where my money goes',
  'Improve monthly cash flow',
  'Prepare for a big purchase',
  'Grow my net worth',
]

const SAVINGS_GOAL_OPTIONS = [
  'Emergency fund',
  'House / down payment',
  'Travel',
  'Vehicle',
  'Education / tuition',
  'Starting a business',
  'Retirement',
  'General savings cushion',
]

const INTENSITY_OPTIONS = ['Conservative', 'Balanced', 'Aggressive']

export default function SettingsPage({ user, transactions, onClearTransactions, darkMode, onToggleDark, userGoals, onUpdateGoals, onSaveGoals }) {
  const [displayName, setDisplayName]   = useState(user.user_metadata?.display_name || '')
  const [nameSaving, setNameSaving]     = useState(false)
  const [nameSaved, setNameSaved]       = useState(false)
  const [nameError, setNameError]       = useState(null)
  const [pwSent, setPwSent]             = useState(false)
  const [pwError, setPwError]           = useState(null)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearing, setClearing]         = useState(false)
  const [clearError, setClearError]     = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput]     = useState('')
  const [deleting, setDeleting]           = useState(false)
  const [deleteError, setDeleteError]     = useState(null)
  const [goalPrimary, setGoalPrimary]     = useState(userGoals?.primary_goal || '')
  const [goalSavingFor, setGoalSavingFor] = useState(userGoals?.savings_goal || '')
  const [goalIntensity, setGoalIntensity] = useState(userGoals?.savings_intensity || '')
  const [goalSaving, setGoalSaving]       = useState(false)
  const [goalSaved, setGoalSaved]         = useState(false)
  const [goalError, setGoalError]         = useState(null)

  useEffect(() => {
    setGoalPrimary(userGoals?.primary_goal || '')
    setGoalSavingFor(userGoals?.savings_goal || '')
    setGoalIntensity(userGoals?.savings_intensity || '')
  }, [userGoals])

  async function handleSaveGoals() {
    if (!onSaveGoals) return
    setGoalSaving(true)
    setGoalSaved(false)
    setGoalError(null)
    try {
      await onSaveGoals({
        ...(userGoals || {}),
        primary_goal:        goalPrimary    || null,
        savings_goal:        goalSavingFor  || null,
        savings_intensity:   goalIntensity  || null,
        onboarding_completed: true,
      })
      setGoalSaved(true)
    } catch {
      setGoalError("We couldn't save your goals. Please try again.")
    } finally {
      setGoalSaving(false)
    }
  }

  async function handleSaveName() {
    if (!displayName.trim()) return
    setNameSaving(true)
    setNameError(null)
    const { error } = await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setNameSaving(false)
    if (error) {
      console.error('[settings] name update failed:', error.message)
      setNameError('Could not save name. Please try again.')
      return
    }
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  async function handleResetPassword() {
    setPwError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin })
    if (error) {
      console.error('[settings] password reset failed:', error.message)
      setPwError('Could not send reset email. Please try again.')
      return
    }
    setPwSent(true)
  }

  async function handleClearTransactions() {
    setClearing(true)
    setClearError(null)
    const { error } = await supabase.from('transactions').delete().eq('user_id', user.id)
    if (error) {
      console.error('[settings] clear transactions failed:', error.message)
      setClearError('Could not delete transactions. Please try again.')
      setClearing(false)
      return
    }
    onClearTransactions()
    setClearing(false)
    setClearConfirm(false)
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    setDeleteError(null)
    try {
      // Primary path: hardened server-side RPC that deletes all data + auth record atomically.
      // Falls back to client-side deletes if the function hasn't been deployed yet
      // (auth.users record is NOT removed in fallback mode).
      const { error: rpcError } = await supabase.rpc('delete_user')
      if (rpcError) {
        await Promise.all([
          supabase.from('transactions').delete().eq('user_id', user.id),
          supabase.from('category_memory').delete().eq('user_id', user.id),
          supabase.from('fixed_costs').delete().eq('user_id', user.id),
          supabase.from('salary_settings').delete().eq('user_id', user.id),
          supabase.from('custom_tags').delete().eq('user_id', user.id),
          supabase.from('user_goals').delete().eq('user_id', user.id),
          supabase.from('user_preferences').delete().eq('user_id', user.id),
        ])
      }

      // Clear all user-specific localStorage keys
      ;[
        `csvUploads_${user.id}`,
        `budgr_salary_${user.id}`,
        `budgr_goals_seen_${user.id}`,
        `budgr_freqs_${user.id}`,
        `budgr_forecast_${user.id}`,
      ].forEach(k => { try { localStorage.removeItem(k) } catch {} })

      await supabase.auth.signOut()
    } catch {
      setDeleteError('Something went wrong. Please try again or contact support@budgli.com.')
      setDeleting(false)
    }
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
    a.download = `budgli-export-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sectionLabel = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4'

  return (
    <div className="max-w-lg space-y-4">

      {/* Financial Goals */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={sectionLabel}>Financial Goals</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Main Goal</label>
            <select
              value={goalPrimary}
              onChange={e => { setGoalPrimary(e.target.value); setGoalSaved(false) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors bg-white"
            >
              <option value="">— Not set —</option>
              {PRIMARY_GOAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Saving For</label>
            <select
              value={goalSavingFor}
              onChange={e => { setGoalSavingFor(e.target.value); setGoalSaved(false) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors bg-white"
            >
              <option value="">— Not set —</option>
              {SAVINGS_GOAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Savings Approach</label>
            <select
              value={goalIntensity}
              onChange={e => { setGoalIntensity(e.target.value); setGoalSaved(false) }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors bg-white"
            >
              <option value="">— Not set —</option>
              {INTENSITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {goalError && <p className="text-xs text-red-500">{goalError}</p>}
          <button
            onClick={handleSaveGoals}
            disabled={goalSaving}
            className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#1A1F2E] text-white hover:bg-[#2d3748] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] text-center"
          >
            {goalSaving ? '…' : goalSaved ? 'Goals saved ✓' : 'Save goals'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={sectionLabel}>Appearance</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Dark Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark interface</p>
          </div>
          <button
            onClick={onToggleDark}
            role="switch"
            aria-checked={darkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              darkMode ? 'bg-[#00C896]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={sectionLabel}>Account</p>
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
            <span className="text-xs font-medium text-[#00C896]">Reset email sent!</span>
          ) : pwError ? (
            <span className="text-xs font-medium text-red-500">{pwError}</span>
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
        <p className={sectionLabel}>Profile</p>
        <label className="block text-xs text-gray-500 mb-1.5">Display Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={e => { setDisplayName(e.target.value); setNameSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Your name"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !displayName.trim()}
            className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#1A1F2E] text-white hover:bg-[#2d3748] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-[60px] text-center"
          >
            {nameSaving ? '…' : nameSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
        {nameError && <p className="text-xs text-red-500 mt-1.5">{nameError}</p>}
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={sectionLabel}>Data</p>
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
              <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-red-500 whitespace-nowrap">Are you sure?</span>
                  <button
                    onClick={handleClearTransactions}
                    disabled={clearing}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {clearing ? '…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => { setClearConfirm(false); setClearError(null) }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {clearError && <p className="text-xs text-red-500">{clearError}</p>}
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

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-4">Danger Zone</p>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700">Delete Account</p>
            <p className="text-xs text-gray-400 mt-0.5">Permanently removes your account and all data. This cannot be undone.</p>
          </div>
          {!deleteConfirm && (
            <button
              onClick={() => { setDeleteConfirm(true); setDeleteInput(''); setDeleteError(null) }}
              className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
            >
              Delete Account
            </button>
          )}
        </div>

        {deleteConfirm && (
          <div className="mt-4 pt-4 border-t border-red-100 space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              This permanently deletes your Budgli account and all imported financial data — transactions, categories, salary settings, savings forecast, and goals. This cannot be undone. Type <span className="font-semibold text-red-500">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full border border-red-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 transition-colors placeholder-gray-300"
            />
            {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteInput(''); setDeleteError(null) }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={sectionLabel}>About</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-400 font-medium">v1.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Support</span>
            <a href="mailto:support@budgli.com" className="text-sm text-[#00C896] font-medium hover:underline">
              support@budgli.com
            </a>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Budgli is a personal finance dashboard for tracking spending, categorizing transactions,
              and understanding your savings rate — all synced to your account.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
