export default function EmptyState({ icon = '📊', title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-[#1A1A2E] rounded-2xl border border-white/10 text-center">
      <span className="text-4xl mb-5 select-none">{icon}</span>
      <p className="text-base font-semibold text-white mb-2">{title}</p>
      <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#0D7377' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
