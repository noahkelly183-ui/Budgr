import { useState } from 'react'
import { supabase } from '../supabase.js'

function PasswordInput({ value, onChange, placeholder = '••••••••', autoComplete }) {
  const [show, setShow] = useState(false)
  const inputClass = [
    'w-full text-sm text-white outline-none transition-all',
    'placeholder-white/25',
    'bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3',
    'focus:border-[#00C896] focus:bg-white/[0.08]',
    '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(15,52,96,0.9)]',
    '[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]',
  ].join(' ')
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={inputClass}
        style={{ paddingRight: '2.75rem' }}
      />
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setShow(s => !s) }}
        style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)', background: 'none', border: 'none',
          padding: '4px', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', zIndex: 10,
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show
          ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        }
      </button>
    </div>
  )
}

export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) {
        setError('Could not update password. The reset link may have expired — request a new one from the sign-in page.')
      } else {
        setDone(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1A1A2E 50%, #0F2040 100%)' }}>
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00C896,#00C896)' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2} style={{ pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Budgli</span>
        </div>

        <div className="rounded-2xl p-8 border border-white/10" style={{ background: 'rgba(15,52,96,0.6)', backdropFilter: 'blur(24px)' }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(20,160,133,0.15)' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#00C896" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-1">Password updated</p>
              <p className="text-white/40 text-sm mb-5">You can now continue to Budgli.</p>
              <button
                onClick={onDone}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#00C896,#00C896)' }}
              >
                Continue to Budgli
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-bold text-white mb-1">Set a new password</h2>
                <p className="text-white/40 text-sm">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">New password</label>
                  <PasswordInput
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {password.length > 0 && password.length < 8 && (
                    <p className="text-amber-400 text-xs mt-1.5">At least 8 characters required</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">Confirm new password</label>
                  <PasswordInput
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  {confirm && confirm === password && (
                    <p className="text-[#00C896] text-xs mt-1.5 flex items-center gap-1">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ pointerEvents: 'none' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl px-3.5 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth={2} style={{ pointerEvents: 'none', flexShrink: 0, marginTop: 1 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  style={{ background: 'linear-gradient(135deg,#00C896,#00C896)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating…
                    </span>
                  ) : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
