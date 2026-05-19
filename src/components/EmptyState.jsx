export default function EmptyState({ icon = '📊', iconBg, title, description, actionLabel, onAction }) {
  const isEmoji = typeof icon === 'string'
  const bg = iconBg ?? (isEmoji ? 'bg-gray-100' : 'bg-[#0D7377]/10')
  return (
    <div className="budgli-card rounded-xl p-8 flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
        {isEmoji ? <span className="text-xl select-none">{icon}</span> : icon}
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1.5">{title}</p>
      <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-[#0D7377] hover:bg-[#0b6268] text-white transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
