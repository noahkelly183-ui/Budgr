export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#14A085] rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </div>
  )
}
