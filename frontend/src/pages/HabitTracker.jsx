import { useState, useEffect } from 'react'
import api from '../api'

const HABIT_ICONS = ['✅', '💧', '🏃', '📚', '🧘', '🍎', '🌙', '📵', '💊', '🎯']
const PRESET_HABITS = [
  { name: '喝8杯水', icon: '💧', category: 'health' },
  { name: '早睡(23点前)', icon: '🌙', category: 'sleep' },
  { name: '运动30分钟', icon: '🏃', category: 'exercise' },
  { name: '阅读30分钟', icon: '📚', category: 'study' },
  { name: '冥想10分钟', icon: '🧘', category: 'mind' },
  { name: '吃水果', icon: '🍎', category: 'diet' },
  { name: '远离手机1小时', icon: '📵', category: 'digital' },
]

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '✅', category: 'other', target_days: 21 })
  const [loading, setLoading] = useState(true)

  const loadHabits = () => {
    api.get('/habits').then((res) => {
      setHabits(res.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadHabits() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await api.post('/habits', form)
    setForm({ name: '', icon: '✅', category: 'other', target_days: 21 })
    setShowForm(false)
    loadHabits()
  }

  const handleCheckin = async (id) => {
    await api.post(`/habits/${id}/check`)
    loadHabits()
  }

  const handleDelete = async (id) => {
    await api.delete(`/habits/${id}`)
    loadHabits()
  }

  const getTodayDate = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin text-3xl">🌿</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">✅ 习惯打卡</h2>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-3">
          <input className="input-field" placeholder="习惯名称" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />

          <div>
            <label className="text-sm text-gray-500 block mb-1">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button key={icon} type="button"
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg ${
                    form.icon === icon ? 'bg-primary-100 ring-1 ring-primary-300' : 'bg-gray-50'
                  }`}
                >{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">目标天数</label>
            <input type="number" className="input-field" value={form.target_days}
              onChange={(e) => setForm((f) => ({ ...f, target_days: parseInt(e.target.value) || 21 }))} />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">创建习惯</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="space-y-2">
          <button onClick={() => setShowForm(true)} className="btn-outline w-full">+ 新建习惯</button>

          {/* Presets */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">推荐习惯（点击快速创建）</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_HABITS.map((p) => (
                <button key={p.name} type="button"
                  onClick={async () => {
                    await api.post('/habits', { ...p, target_days: 21 })
                    loadHabits()
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <span>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Habit cards */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const today = getTodayDate()
          const checkedToday = habit.checked_dates?.includes(today)
          const progress = Math.min((habit.current_streak / habit.target_days) * 100, 100)

          return (
            <div key={habit.id} className={`card ${checkedToday ? 'border border-primary-200' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.icon}</span>
                  <span className="font-medium text-gray-700 text-sm">{habit.name}</span>
                </div>
                <button onClick={() => handleDelete(habit.id)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-primary-600">{habit.current_streak}</span>
                  <span className="text-xs text-gray-400">/ {habit.target_days} 天</span>
                </div>
                {checkedToday && <span className="text-xs text-primary-500">今日已打卡 ✓</span>}
              </div>

              {/* Progress bar */}
              <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>

              <button
                onClick={() => handleCheckin(habit.id)}
                className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                  checkedToday
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {checkedToday ? '已打卡（点击取消）' : '今日打卡'}
              </button>

              {/* Mini calendar - last 7 days */}
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - i))
                  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                  const checked = habit.checked_dates?.includes(ds)
                  return (
                    <div key={i}
                      className={`flex-1 h-6 rounded text-xs flex items-center justify-center ${
                        checked ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {checked ? '✓' : d.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
