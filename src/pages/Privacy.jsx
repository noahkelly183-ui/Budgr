export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">What we store</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p><span className="font-medium text-gray-800">Transaction records</span> — date, amount, description, and category for each row in your CSV. Stored in Supabase, linked to your account.</p>
          <p><span className="font-medium text-gray-800">Salary &amp; fixed costs</span> — the numbers you enter manually for income projections. Stored in Supabase, linked to your account.</p>
          <p><span className="font-medium text-gray-800">Upload history</span> — filename, date, and row count of each CSV import. Stored locally in your browser only, never sent to a server.</p>
          <p><span className="font-medium text-gray-800">Email address</span> — used only to identify your account. We do not send marketing email.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">What we do not do</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span className="text-teal-600 shrink-0">✓</span>Raw CSV files are not stored — only the parsed rows.</li>
          <li className="flex gap-2"><span className="text-teal-600 shrink-0">✓</span>Transaction data is not shared with third parties.</li>
          <li className="flex gap-2"><span className="text-teal-600 shrink-0">✓</span>No advertising, no tracking pixels, no analytics SDKs.</li>
          <li className="flex gap-2"><span className="text-teal-600 shrink-0">✓</span>Categorization runs locally in your browser — transaction descriptions are not sent to any AI API.</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Deleting your data</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You can delete all transactions at any time from the <span className="font-medium text-gray-800">Settings</span> page. This permanently removes every record linked to your account from the database. To fully delete your account, contact us at the email in Settings.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Infrastructure</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Data is stored in <span className="font-medium text-gray-800">Supabase</span> (Postgres, hosted on AWS us-east-1). The app is served from <span className="font-medium text-gray-800">Vercel</span>. Both providers have SOC 2 Type II certifications.
        </p>
      </div>

    </div>
  )
}
