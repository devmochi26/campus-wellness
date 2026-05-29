import type { StatCardProps } from '../types'

const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-green-500/10', bar: 'bg-primary-400 dark:bg-green-500', text: 'text-primary-700 dark:text-green-400' },
  warm: { bg: 'bg-warm-50 dark:bg-amber-500/10', bar: 'bg-warm-400 dark:bg-amber-500', text: 'text-warm-700 dark:text-amber-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', bar: 'bg-blue-400 dark:bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', bar: 'bg-purple-400 dark:bg-purple-500', text: 'text-purple-700 dark:text-purple-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', bar: 'bg-rose-400 dark:bg-rose-500', text: 'text-rose-700 dark:text-rose-400' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-500/10', bar: 'bg-teal-400 dark:bg-teal-500', text: 'text-teal-700 dark:text-teal-400' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', bar: 'bg-indigo-400 dark:bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', bar: 'bg-orange-400 dark:bg-orange-500', text: 'text-orange-700 dark:text-orange-400' },
}

export default function StatCard({ icon, label, value, sub, color = 'primary', delay = 0 }: StatCardProps) {
  const c = colorMap[color] || colorMap.primary

  return (
    <div className="stat-card animate-fade-in-up overflow-hidden pl-0" style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-1 self-stretch shrink-0 rounded-r-full ${c.bar}`} />
      <div className="flex items-center gap-3 py-1 pl-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</div>
          <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</div>
          {sub && <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{sub}</div>}
        </div>
      </div>
    </div>
  )
}
