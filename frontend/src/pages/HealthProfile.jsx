import { useState, useEffect } from 'react'
import api from '../api'

export default function HealthProfile() {
  const [profile, setProfile] = useState(null)
  const [risks, setRisks] = useState([])
  const [riskSummary, setRiskSummary] = useState('')

  useEffect(() => {
    api.get('/health/profile').then(r => setProfile(r.data)).catch(() => {})
    api.get('/health/risks').then(r => {
      setRisks(r.data.risks || [])
      setRiskSummary(r.data.summary || '')
    }).catch(() => {})
  }, [])

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin text-3xl">🌿</div>
      </div>
    )
  }

  const levelBadge = (l) => {
    if (l?.includes('warn')) return 'bg-red-100 text-red-600'
    if (l?.includes('info')) return 'bg-blue-100 text-blue-600'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">📋 健康档案</h2>

      {/* Risk Warnings */}
      {risks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">⚠️ 健康预警</h3>
          {risks.map((r, i) => (
            <div key={i} className={`card border-l-4 ${r.level === 'warning' ? 'border-red-400' : 'border-blue-400'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${levelBadge(r.level)}`}>
                  {r.level === 'warning' ? '⚠ 需关注' : 'ℹ 提示'}
                </span>
                <span className="text-sm font-medium text-gray-700">{r.title}</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{r.detail}</p>
              <p className="text-xs text-primary-600">→ {r.action}</p>
            </div>
          ))}
          <div className="text-xs text-gray-400 text-center">{riskSummary}</div>
        </div>
      )}

      {/* Sleep Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">🌙 睡眠</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-600">{profile.sleep.avg_quality}</div>
            <div className="text-xs text-gray-400">平均质量/5</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{profile.sleep.days_recorded}</div>
            <div className="text-xs text-gray-400">本周记录天数</div>
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${profile.sleep.avg_quality >= 3 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {profile.sleep.trend}
          </div>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">🏃 运动</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-warm-600">{profile.exercise.total_min_week}</div>
            <div className="text-xs text-gray-400">本周分钟</div>
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            profile.exercise.rating === '达标' ? 'bg-green-100 text-green-600' :
            profile.exercise.rating === '一般' ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            {profile.exercise.rating}
          </div>
        </div>
      </div>

      {/* Diet Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">🍽️ 饮食</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary-600">{profile.diet.avg_healthy}</div>
            <div className="text-xs text-gray-400">健康均分/5</div>
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            profile.diet.rating === '健康' ? 'bg-green-100 text-green-600' :
            profile.diet.rating === '一般' ? 'bg-yellow-100 text-yellow-600' :
            'bg-red-100 text-red-600'
          }`}>
            {profile.diet.rating}
          </div>
        </div>
      </div>

      {/* Mood Card */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">💭 情绪</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-rose-600">{profile.mood.avg_mood}</div>
            <div className="text-xs text-gray-400">平均心情/5</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{profile.mood.avg_stress}</div>
            <div className="text-xs text-gray-400">平均压力/5</div>
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${profile.mood.avg_mood >= 3 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {profile.mood.rating}
          </div>
        </div>
      </div>

      {/* Constitution + Stress */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">🔬 体质</h3>
          <div className="text-xl font-bold text-primary-600">{profile.constitution || '未测评'}</div>
          <div className="text-xs text-gray-400">中医九种体质</div>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📊 压力</h3>
          <div className="text-xl font-bold text-purple-600">{profile.stress_level ? ({ low: '较低', moderate: '中等', high: '较高' })[profile.stress_level] : '未测评'}</div>
          <div className="text-xs text-gray-400">最近测评结果</div>
        </div>
      </div>

      {/* Habit summary */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">✅ 习惯</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-teal-600">{profile.habits.total_checkins}</div>
            <div className="text-xs text-gray-400">总打卡次数</div>
          </div>
        </div>
      </div>
    </div>
  )
}
