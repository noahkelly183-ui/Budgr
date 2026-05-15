import { useState } from 'react'

const STEPS = [
  {
    key: 'primary_goal',
    title: "What's your main financial goal?",
    subtitle: 'This helps Budgli focus on what matters most to you.',
    options: [
      'Save more money',
      'Reduce unnecessary spending',
      'Pay down debt',
      'Build an emergency fund',
      'Understand where my money goes',
      'Improve monthly cash flow',
      'Prepare for a big purchase',
      'Grow my net worth',
    ],
  },
  {
    key: 'biggest_challenge',
    title: "What feels hardest right now?",
    subtitle: 'Honest answers help Budgli give you better guidance.',
    options: [
      "I don't know where my money goes",
      'I spend too much on small purchases',
      'My fixed costs feel too high',
      'I struggle to save consistently',
      "I don't have a clear monthly plan",
      'I want visibility without spreadsheets',
    ],
  },
  {
    key: 'preferred_help_type',
    title: 'What should Budgli focus on for you?',
    subtitle: 'Pick the one that feels most useful right now.',
    options: [
      'Show me where I can cut costs',
      'Help me forecast savings',
      'Help me understand cash flow',
      'Keep me accountable',
      'Give me clear, simple insights',
      'Help me track spending categories',
    ],
  },
]

const SAVINGS_GOAL_OPTIONS = [
  'Emergency fund',
  'Travel',
  'House / down payment',
  'Car',
  'Investing',
  'Debt repayment',
  'General savings',
  'Other',
]

const INTENSITY_OPTIONS = [
  { value: 'Conservative', desc: 'Small, comfortable steps' },
  { value: 'Balanced',     desc: 'Steady, realistic pace' },
  { value: 'Aggressive',   desc: 'Push toward max savings' },
]

const TOTAL_STEPS = 4

export default function GoalOnboarding({ onComplete, onSkip }) {
  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)
  const [answers, setAnswers] = useState({
    primary_goal:       '',
    biggest_challenge:  '',
    preferred_help_type:'',
    savings_goal:       '',
    savings_intensity:  'Balanced',
  })

  const isOptional   = step === 3
  const currentStep  = STEPS[step]
  const canContinue  = isOptional || !!answers[currentStep?.key]
  const progressPct  = ((step + 1) / TOTAL_STEPS) * 100

  function select(key, val) {
    setAnswers(prev => ({ ...prev, [key]: val === prev[key] ? '' : val }))
  }

  async function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1)
    } else {
      setSaving(true)
      await onComplete({ ...answers, onboarding_completed: true })
      setSaving(false)
    }
  }

  const optBtn = (key, val) =>
    `px-3.5 py-3 rounded-xl border text-sm text-left transition-all leading-snug ${
      answers[key] === val
        ? 'bg-[#0D7377]/10 border-[#0D7377] text-[#0D7377] font-medium'
        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[#00C896]/50 hover:bg-white'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden budgli-card-pop">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#00C896] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <button
              onClick={onSkip}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Steps 1–3 */}
          {step < 3 ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">{currentStep.title}</h2>
              <p className="text-sm text-gray-500 mb-6">{currentStep.subtitle}</p>
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {currentStep.options.map(opt => (
                  <button key={opt} onClick={() => select(currentStep.key, opt)} className={optBtn(currentStep.key, opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Step 4 — optional */
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5">One last thing (optional)</h2>
              <p className="text-sm text-gray-500 mb-6">Helps Budgli personalise your savings suggestions.</p>

              <div className="mb-5">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">What are you saving for?</p>
                <div className="grid grid-cols-2 gap-2">
                  {SAVINGS_GOAL_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => select('savings_goal', opt)} className={optBtn('savings_goal', opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-3">How aggressive is your savings plan?</p>
                <div className="grid grid-cols-3 gap-2">
                  {INTENSITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers(prev => ({ ...prev, savings_intensity: opt.value }))}
                      className={`px-3 py-3 rounded-xl border text-center transition-all ${
                        answers.savings_intensity === opt.value
                          ? 'bg-[#0D7377]/10 border-[#0D7377] text-[#0D7377]'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[#00C896]/50 hover:bg-white'
                      }`}
                    >
                      <p className="text-sm font-semibold">{opt.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`text-sm transition-colors ${step > 0 ? 'text-gray-500 hover:text-gray-700' : 'invisible'}`}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canContinue || saving}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#0D7377' }}
            >
              {saving ? 'Saving…' : step === TOTAL_STEPS - 1 ? 'Finish →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
