export default function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700',
    warm: 'bg-warm-50 text-warm-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    rose: 'bg-rose-50 text-rose-700',
    teal: 'bg-teal-50 text-teal-700',
  }

  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color] || colors.primary}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-gray-800">{value}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}
