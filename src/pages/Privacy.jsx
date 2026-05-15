export default function Privacy() {
  const label = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4'

  return (
    <div className="max-w-2xl space-y-4">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Privacy & Data</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Budgli stores only the information needed to power your personal finance dashboard.
        </p>
      </div>

      {/* Summary callout */}
      <div className="rounded-xl border border-[#00C896]/20 bg-[#00C896]/[0.05] px-5 py-4">
        <ul className="space-y-2">
          {[
            'We store your transaction records, income details, and email address — nothing else.',
            'We never sell your data or use it for advertising.',
            'You can delete your data at any time from Settings.',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="text-[#00C896] shrink-0 font-semibold mt-px">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* What Budgli stores */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={label}>What Budgli stores</p>
        <ul className="space-y-3">
          {[
            ['Transaction records', 'Date, amount, description, and category from uploaded CSVs — stored in your account.'],
            ['Salary & income details', 'The numbers you enter manually for income, fixed costs, and projections.'],
            ['Email address', 'Used only to identify your account. Budgli does not send marketing email.'],
            ['Upload history', 'Filename, upload date, and row count where applicable.'],
          ].map(([title, desc]) => (
            <li key={title} className="flex gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-[7px]" />
              <span className="text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-800">{title}</span> — {desc}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* What Budgli does not do */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={label}>What Budgli does not do</p>
        <ul className="space-y-2.5">
          {[
            'Budgli does not store raw CSV files after import.',
            'Budgli does not sell your personal financial information.',
            'Budgli does not use your transaction data for advertising.',
            'Budgli does not send transaction descriptions to an AI API for categorization.',
            'Budgli does not provide financial, investment, tax, legal, or accounting advice.',
          ].map(item => (
            <li key={item} className="flex gap-2.5 text-sm text-gray-600">
              <span className="text-[#00C896] shrink-0 font-semibold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Analytics */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={label}>Analytics</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Budgli uses <span className="font-medium text-gray-800">Vercel Analytics</span> to measure aggregate, anonymised usage — such as page views and general interaction patterns. Vercel Analytics does not use advertising pixels, third-party tracking pixels, or cookies for behavioural advertising. No individual transaction or financial data is included in these measurements.
        </p>
      </div>

      {/* Deleting your data */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={label}>Deleting your data</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          You can delete your transaction records at any time from <span className="font-medium text-gray-800">Settings</span>. To request full account deletion, data access, or correction, contact us using the email address listed in Settings.
        </p>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className={label}>Infrastructure</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Budgli uses <span className="font-medium text-gray-800">Supabase</span> for database and authentication infrastructure, and <span className="font-medium text-gray-800">Vercel</span> to host the web app. Supabase states that it is SOC 2 Type 2 compliant. No online service can guarantee absolute security, but Budgli aims to use reasonable safeguards and trusted infrastructure providers to protect user information.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400 leading-relaxed">
          Budgli is an informational budgeting tool. Forecasts, summaries, and insights are estimates based on the information available and may not reflect actual future results. Budgli does not provide financial advice.
        </p>
      </div>

    </div>
  )
}
