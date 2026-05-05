const ONBOARDING_STEPS = [
  {
    num: 1,
    title: 'Set your salary',
    desc: 'Add your income so we can calculate your savings rate.',
    label: 'Set up salary →',
    page: 'salary',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Add fixed costs',
    desc: "Add recurring costs like rent and loans that don't show on your credit card.",
    label: 'Add fixed costs →',
    page: 'fixed',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Import transactions',
    desc: 'Download your bank CSV and import your transactions to start tracking.',
    label: 'Import CSV →',
    page: 'transactions',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
]

export default function OnboardingScreen({ onNavigate, onDismiss }) {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center px-6 py-16">

      <div className="text-center mb-12">
        <p className="text-white font-bold text-4xl tracking-tight mb-4">Budgr</p>
        <h1 className="text-white text-2xl font-semibold mb-3">Welcome to Budgr</h1>
        <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
          Your personal finance dashboard — let's get you set up in 3 steps
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 w-full max-w-2xl mb-10">
        {ONBOARDING_STEPS.map(step => (
          <div key={step.num} className="bg-white rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-[#0D7377] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step.num}
              </span>
              <span className="text-[#0D7377]">{step.icon}</span>
            </div>
            <h3 className="text-gray-900 font-semibold text-sm mb-2">{step.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-5">{step.desc}</p>
            <button
              type="button"
              onClick={() => onNavigate(step.page)}
              className="w-full py-2.5 rounded-xl bg-[#1A1A2E] text-white text-xs font-medium hover:bg-[#0F3460] transition-colors"
            >
              {step.label}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="text-white/30 text-sm hover:text-white/60 transition-colors"
      >
        Skip for now →
      </button>

    </div>
  )
}
