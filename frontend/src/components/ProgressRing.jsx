export default function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, label = '', color = '#22c55e' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-800">{value}</div>
        {label && <div className="text-xs text-gray-400">{label}</div>}
      </div>
    </div>
  )
}
