import { useState } from 'react'
import { supabase } from '../supabase.js'
import { track } from '@vercel/analytics/react'

const FEEDBACK_TYPES = [
  { id: 'bug',       label: 'Bug',                icon: '🐛', field: 'bugs',             placeholder: 'Describe what happened and how to reproduce it.' },
  { id: 'feature',   label: 'Feature Request',    icon: '✨', field: 'retention_reason', placeholder: "What would you like to see added and why?" },
  { id: 'confusing', label: 'Confusing UX',       icon: '😕', field: 'confusing_part',   placeholder: "What was unclear or hard to understand?" },
  { id: 'general',   label: 'General Feedback',   icon: '💬', field: 'liked_part',       placeholder: "Anything on your mind — what's working, what isn't, what you wish existed." },
]

export default function FeedbackPage({ user }) {
  const [type,       setType]       = useState(null)
  const [message,    setMessage]    = useState('')
  const [name,       setName]       = useState(user?.user_metadata?.display_name || '')
  const [email,      setEmail]      = useState(user?.email || '')
  const [rating,     setRating]     = useState('')
  const [betaChecks, setBetaChecks] = useState({ would_pay: false, finds_useful: false, uses_regularly: false, would_recommend: false })
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function validate() {
    const e = {}
    if (!type)                e.type    = 'Please select a feedback type'
    if (!message.trim())      e.message = 'Please enter your feedback'
    if (!email.trim())        e.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)

    const selectedType = FEEDBACK_TYPES.find(t => t.id === type)
    const payload = {
      name:             name.trim() || null,
      email:            email.trim(),
      attempted_action: JSON.stringify(betaChecks),
      confusing_part:   null,
      liked_part:       null,
      retention_reason: null,
      bugs:             null,
      rating:           rating ? Number(rating) : null,
      user_id:          user?.id || null,
    }
    if (selectedType) payload[selectedType.field] = message.trim()

    const { error: dbError } = await supabase.from('beta_feedback').insert(payload)
    if (dbError) {
      console.error('[feedback] submit failed:', dbError.message)
      setSubmitError('Something went wrong — please try again.')
      setSubmitting(false)
      return
    }
    track('feedback_submitted', { type, rating: payload.rating ?? null })
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#00C896]/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#00C896]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Your feedback has been received. It helps us make Budgli better for everyone.
        </p>
      </div>
    )
  }

  const selectedType = FEEDBACK_TYPES.find(t => t.id === type)

  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Send Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Tell us what felt useful, confusing, broken, or missing.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Feedback type */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What kind of feedback?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FEEDBACK_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setErrors(e => ({ ...e, type: undefined })) }}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-colors ${
                  type === t.id
                    ? 'bg-[#0D7377]/5 border-[#0D7377]/30 text-[#0D7377]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-xs font-medium leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
          {errors.type && <p className="mt-2 text-xs text-red-400">{errors.type}</p>}
        </div>

        {/* Main message */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your feedback {selectedType && <span className="normal-case font-normal text-gray-400">— {selectedType.label}</span>}
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={e => { setMessage(e.target.value); setErrors(err => ({ ...err, message: undefined })) }}
            placeholder={selectedType?.placeholder || 'What would you like to share?'}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`}
          />
          {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall rating <span className="normal-case font-normal text-gray-400">(optional)</span></p>
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(rating === String(n) ? '' : String(n))}
                className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                  rating === String(n)
                    ? 'bg-[#0D7377] text-white border-[#0D7377]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">1 = needs a lot of work, 10 = love it</p>
        </div>

        {/* Beta signals */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick questions <span className="normal-case font-normal text-gray-400">(optional)</span></p>
          <div className="space-y-3">
            {[
              { key: 'would_pay',        label: 'I would pay for this' },
              { key: 'finds_useful',     label: 'I find this useful for managing my budget' },
              { key: 'uses_regularly',   label: "I'd use this regularly (weekly or more)" },
              { key: 'would_recommend',  label: "I'd recommend it to a friend" },
            ].map(({ key, label }) => {
              const checked = betaChecks[key]
              return (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                      checked ? 'bg-[#0D7377] border-[#0D7377]' : 'border-gray-300 bg-white group-hover:border-gray-400'
                    }`}
                    onClick={() => setBetaChecks(p => ({ ...p, [key]: !p[key] }))}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-gray-700 select-none"
                    onClick={() => setBetaChecks(p => ({ ...p, [key]: !p[key] }))}
                  >{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Name <span className="text-gray-300">(optional)</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(err => ({ ...err, email: undefined })) }}
                placeholder="you@example.com"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00C896] transition-colors ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {submitError && (
            <p className="text-sm text-red-500 font-medium">{submitError}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              onClick={() => setSubmitError(null)}
              className="flex-1 sm:flex-none sm:min-w-[160px] py-3 px-6 rounded-xl text-sm font-semibold bg-[#0D7377] text-white hover:bg-[#0b6268] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send Feedback'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
