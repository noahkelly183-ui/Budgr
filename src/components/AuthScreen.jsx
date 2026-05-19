import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { track } from '@vercel/analytics/react'

/* ── icons ── */
function EyeOpen() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{ pointerEvents: 'none' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
function EyeClosed() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{ pointerEvents: 'none' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

/* Password field with show/hide toggle */
function PasswordInput({ value, onChange, placeholder = '••••••••', autoComplete, className = '' }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={className}
        style={{ paddingRight: '2.75rem' }}
      />
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); setShow(s => !s) }}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          zIndex: 10,
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOpen /> : <EyeClosed />}
      </button>
    </div>
  )
}

const FEATURES = [
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: 'Monthly Dashboard',
    desc: 'See exactly where every dollar goes with a real-time income statement.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    title: 'Savings Forecast',
    desc: 'Project your savings 1–30 years out with scenario modelling.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Performance Score',
    desc: 'Get a monthly and annual grade on your savings rate and spending health.',
  },
  {
    icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ pointerEvents: 'none' }}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    title: 'CSV Import',
    desc: 'Drop in your bank export and Budgli auto-categorizes every transaction.',
  },
]

/* Maps raw Supabase error messages to user-friendly copy */
function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('email not confirmed')) {
    return 'Incorrect email or password. Check your details and try again.'
  }
  if (m.includes('already registered') || m.includes('user already exists')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('exceeded')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Network error. Check your connection and try again.'
  }
  if (import.meta.env.DEV) return msg
  return 'Something went wrong. Please try again.'
}

export default function AuthScreen() {
  // 'login' | 'signup' | 'forgot'
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [resending, setResending]                   = useState(false)
  const [resent, setResent]                         = useState(false)
  const [resendError, setResendError]               = useState('')
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('')

  useEffect(() => { track('landing_page_view') }, [])

  function switchMode(next) {
    if (next === 'signup') track('signup_started')
    setMode(next)
    setError('')
    setSuccess(false)
    setPassword('')
    setConfirm('')
    setResent(false)
    setResendError('')
    setPendingConfirmationEmail('')
  }

  async function handleResend() {
    if (resending || !pendingConfirmationEmail) return
    setResending(true)
    setResendError('')
    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: pendingConfirmationEmail,
        options: { emailRedirectTo: window.location.origin },
      })
      if (err) {
        if (import.meta.env.DEV) console.error('[resend]', err)
        const m = err.message?.toLowerCase() ?? ''
        if (m.includes('rate') || m.includes('too many') || m.includes('exceeded')) {
          setResendError('Please wait a minute before requesting another email.')
        } else if (m.includes('already confirmed') || m.includes('already registered')) {
          setResendError('This email may already be confirmed. Try signing in.')
        } else {
          setResendError("We couldn't resend the confirmation email. Please try again.")
        }
      } else {
        setResent(true)
      }
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'forgot') {
      setLoading(true)
      try {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (err) setError(friendlyError(err.message))
        else setSuccess(true)
      } finally {
        setLoading(false)
      }
      return
    }

    if (mode === 'signup') {
      if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
      if (password !== confirm)  { setError('Passwords do not match.'); return }
    }

    setLoading(true)
    try {
      const { error: err } = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
      if (err) setError(friendlyError(err.message))
      else if (mode === 'signup') { track('signup_completed'); setPendingConfirmationEmail(email); setSuccess(true) }
    } finally {
      setLoading(false)
    }
  }

  // TODO: Re-enable Google OAuth in Phase 2 after Supabase provider and redirect URLs are fully tested.
  // async function handleGoogle() {
  //   setError('')
  //   const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  //   if (err) setError(err.message)
  // }

  const inputClass = [
    'w-full text-sm text-white outline-none transition-all',
    'placeholder-white/25',
    'bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3',
    'focus:border-[#00C896] focus:bg-white/[0.08]',
    '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgba(15,52,96,0.9)]',
    '[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]',
  ].join(' ')

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1A1A2E 50%, #0F2040 100%)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] px-16 py-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(13,115,119,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,115,119,0.07) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(13,115,119,0.18) 0%,transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(20,160,133,0.1) 0%,transparent 70%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00C896,#00C896)' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Budgli</span>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Run your finances<br />
            <span style={{ background: 'linear-gradient(90deg,#00C896,#00C896)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              like a business.
            </span>
          </h1>
          <p className="text-white/45 text-base leading-relaxed mb-12 max-w-sm">
            Import your bank statements, track every category, and get a monthly performance score — all in one place.
          </p>

          <div className="space-y-6">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.18)', border: '1px solid rgba(13,115,119,0.3)' }}>
                  <span className="text-[#00C896]">{f.icon}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-0.5">{f.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="16" height="16" fill="#FBBF24" viewBox="0 0 20 20" style={{ pointerEvents: 'none' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-white/50 text-xs leading-relaxed max-w-xs">
            "Finally a budgeting app that thinks like a CFO, not a coupon-cutter."
          </p>
          <p className="text-white/25 text-[11px] mt-2">— Early access user</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00C896,#00C896)' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Budgli</span>
            </div>
            <p className="text-white/40 text-sm">Run your finances like a business.</p>
          </div>

          <div className="rounded-2xl p-8 border border-white/10" style={{ background: 'rgba(15,52,96,0.6)', backdropFilter: 'blur(24px)' }}>

            {/* ── Forgot password mode ── */}
            {mode === 'forgot' && !success && (
              <>
                <button onClick={() => switchMode('login')} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs mb-6 transition-colors">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ pointerEvents: 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to sign in
                </button>
                <h2 className="text-xl font-bold text-white mb-1">Reset your password</h2>
                <p className="text-white/40 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  {error && <ErrorBanner msg={error} />}
                  <SubmitButton loading={loading} label="Send Reset Link" loadingLabel="Sending…" />
                </form>
              </>
            )}

            {/* ── Forgot success ── */}
            {mode === 'forgot' && success && (
              <SuccessCard
                title="Check your email"
                body={<>If an account exists for <span className="text-white/70">{email}</span>, we'll send a reset link shortly.</>}
                action={<button onClick={() => switchMode('login')} className="mt-5 text-xs text-[#00C896] hover:underline">Back to sign in</button>}
              />
            )}

            {/* ── Signup success ── */}
            {mode === 'signup' && success && (
              <SuccessCard
                title="Check your email to confirm your Budgli account"
                body={<>We sent a confirmation link to <span className="text-white/70">{email}</span>. Open it to finish setting up your account.</>}
                action={
                  <div className="mt-5 space-y-3">
                    {resent ? (
                      <p className="text-xs text-[#00C896]">Confirmation email resent. Check your inbox.</p>
                    ) : (
                      <>
                        <button
                          onClick={handleResend}
                          disabled={resending || !pendingConfirmationEmail}
                          className="text-xs text-white/40 hover:text-[#00C896] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resending ? 'Sending…' : 'Resend confirmation email'}
                        </button>
                        {resendError && (
                          <p className="text-xs text-red-400">{resendError}</p>
                        )}
                      </>
                    )}
                    <div>
                      <button onClick={() => switchMode('login')} className="text-xs text-[#00C896] hover:underline block">
                        Back to sign in
                      </button>
                    </div>
                  </div>
                }
              />
            )}

            {/* ── Login / Signup form ── */}
            {(mode === 'login' || mode === 'signup') && !success && (
              <>
                <div className="mb-7">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {mode === 'login' ? 'Sign in to continue to your dashboard.' : 'Get started — it only takes a minute.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-white/50">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-white/35 hover:text-[#00C896] transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <PasswordInput
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className={inputClass}
                    />
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-2">Confirm password</label>
                      <PasswordInput
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        className={inputClass + (confirm && confirm !== password ? ' !border-red-500/50' : confirm && confirm === password ? ' !border-[#00C896]/50' : '')}
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
                  )}

                  {error && <ErrorBanner msg={error} />}

                  <SubmitButton
                    loading={loading}
                    label={mode === 'login' ? 'Sign In' : 'Create Account'}
                    loadingLabel={mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  />
                </form>

                <p className="text-center text-xs text-white/30 mt-5">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-[#00C896] hover:text-white font-medium transition-colors"
                  >
                    {mode === 'login' ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>
              </>
            )}

          </div>

          {/* Trust copy */}
          <p className="text-center text-white/20 text-[11px] mt-4 leading-relaxed max-w-sm mx-auto">
            Budgli uses secure authentication through Supabase. Your CSV files are processed for import and are not stored as raw files.
          </p>
          <p className="text-center text-white/15 text-[11px] mt-2">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

    </div>
  )
}

/* ── shared sub-components ── */

function SubmitButton({ loading, label, loadingLabel }) {
  return (
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
          {loadingLabel}
        </span>
      ) : label}
    </button>
  )
}

function ErrorBanner({ msg }) {
  return (
    <div className="flex items-start gap-2 rounded-xl px-3.5 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#F87171" strokeWidth={2} style={{ pointerEvents: 'none', flexShrink: 0, marginTop: 1 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-red-400 text-xs leading-relaxed">{msg}</p>
    </div>
  )
}

function SuccessCard({ title, body, action }) {
  return (
    <div className="text-center py-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(20,160,133,0.15)' }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#00C896" strokeWidth={2} style={{ pointerEvents: 'none' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-white font-semibold mb-2">{title}</p>
      <p className="text-white/40 text-sm leading-relaxed">{body}</p>
      {action}
    </div>
  )
}
