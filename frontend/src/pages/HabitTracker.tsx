import { useState, useEffect, type FormEvent } from 'react'
import api from '../api'
import type { Habit } from '../types'

const HABIT_ICONS = ['✅', '💧', '🏃', '📚', '🧘', '🍎', '🌙', '📵', '💊', '🎯']
const PRESET_HABITS = [
  { name: '喝8杯水', icon: '💧', category: 'health', target_days: 21 },
  { name: '早睡(23点前)', icon: '🌙', category: 'sleep', target_days: 21 },
  { name: '运动30分钟', icon: '🏃', category: 'exercise', target_days: 21 },
  { name: '阅读30分钟', icon: '📚', category: 'study', target_days: 21 },
  { name: '冥想10分钟', icon: '🧘', category: 'mind', target_days: 21 },
  { name: '吃水果', icon: '🍎', category: 'diet', target_days: 21 },
  { name: '远离手机1小时', icon: '📵', category: 'digital', target_days: 21 },
]

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '✅', category: 'other', target_days: 21 })
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  const loadHabits = () => {
    api.get<Habit[]>('/habits').then((res) => {
      setHabits(res.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadHabits()
    setTimeout(() => setVisible(true), 100)
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    await api.post('/habits', form)
    setForm({ name: '', icon: '✅', category: 'other', target_days: 21 })
    setShowForm(false)
    loadHabits()
  }

  const handleCheckin = async (id: number) => {
    setCheckingId(id)
    await api.post(`/habits/${id}/check`)
    setTimeout(() => setCheckingId(null), 600)
    loadHabits()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/habits/${id}`)
    loadHabits()
  }

  const getTodayDate = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const getLast7Days = () => {
    const days: { ds: string; label: string; date: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      days.push({ ds, label: WEEKDAY_LABELS[6 - i], date: d.getDate() })
    }
    return days
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">✅</div>
        <div className="text-gray-400 dark:text-gray-500 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  const today = getTodayDate()
  const checkedTodayCount = habits.filter(h => h.checked_dates?.includes(today)).length
  const weekDays = getLast7Days()

  return (
    <div className="space-y-4">
      {/* 页头 */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between">
          <h2 className="page-title">✅ 习惯打卡</h2>
        </div>
      </div>

      {/* 今日概览卡片 */}
      <div className={`card flex items-center gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
        <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-2xl">
          {checkedTodayCount === habits.length && habits.length > 0 ? '🎉' : '✅'}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {checkedTodayCount}<span className="text-base font-normal text-gray-400">/{habits.length}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {habits.length === 0 ? '还没有习惯，创建一个吧' :
             checkedTodayCount === habits.length ? '今日全部完成，太棒了！' :
             `今日已完成 ${checkedTodayCount} 项`}
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-4 py-2">
            + 新建
          </button>
        )}
      </div>

      {/* 新建表单 */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4 animate-fade-in-scale">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">新建习惯</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
          </div>

          <input
            className="input-field"
            placeholder="习惯名称，如：每天喝8杯水"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />

          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-xl text-xl transition-all duration-200 flex items-center justify-center ${
                    form.icon === icon
                      ? 'bg-teal-100 dark:bg-teal-500/30 ring-2 ring-teal-400 scale-110 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">目标天数: {form.target_days} 天</label>
            <input
              type="range"
              min={7}
              max={100}
              step={1}
              value={form.target_days}
              onChange={(e) => setForm((f) => ({ ...f, target_days: parseInt(e.target.value) }))}
              className="w-full accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>7天</span><span>100天</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
          </div>
        </form>
      )}

      {/* 推荐习惯 */}
      {!showForm && habits.length === 0 && (
        <div className={`card transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">💡 推荐习惯，点击快速创建</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_HABITS.map((p, index) => (
              <button
                key={p.name}
                type="button"
                onClick={async () => {
                  await api.post('/habits', p)
                  loadHabits()
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-500/10 text-sm text-gray-600 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 习惯列表 */}
      <div className="space-y-3">
        {habits.map((habit, index) => {
          const checkedToday = habit.checked_dates?.includes(today)
          const progress = Math.min((habit.current_streak / habit.target_days) * 100, 100)
          const isChecking = checkingId === habit.id

          return (
            <div
              key={habit.id}
              className={`card transition-all duration-500 animate-fade-in-up ${
                checkedToday ? 'ring-1 ring-teal-200 dark:ring-teal-500/30 bg-teal-50/30 dark:bg-teal-500/5' : ''
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* 顶部：图标 + 名称 + 删除 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`text-2xl transition-all duration-300 ${
                    isChecking ? 'animate-bounce scale-125' : checkedToday ? 'scale-110' : ''
                  }`}>
                    {habit.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{habit.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      目标 {habit.target_days} 天
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 text-base leading-none transition-colors px-1"
                >
                  ✕
                </button>
              </div>

              {/* 进度条 + 数字 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-baseline gap-0.5 shrink-0">
                  <span className={`text-lg font-bold transition-all duration-300 ${isChecking ? 'scale-125 text-teal-500' : 'text-teal-600 dark:text-teal-400'}`}>
                    {habit.current_streak}
                  </span>
                  <span className="text-xs text-gray-400">/{habit.target_days}</span>
                </div>
              </div>

              {/* 打卡按钮 */}
              <button
                onClick={() => handleCheckin(habit.id)}
                disabled={isChecking}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  checkedToday
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20'
                    : 'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm hover:shadow-md'
                } ${isChecking ? 'scale-95 opacity-80' : 'active:scale-[0.98]'}`}
              >
                {isChecking ? '...' : checkedToday ? '✓ 已打卡（点击取消）' : '今日打卡'}
              </button>

              {/* 7 天日历 */}
              <div className="flex gap-1 mt-3">
                {weekDays.map((wd, i) => {
                  const checked = habit.checked_dates?.includes(wd.ds)
                  const isToday = wd.ds === today
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-gray-600">{wd.label}</span>
                      <div
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                          checked
                            ? 'bg-teal-500 text-white shadow-sm'
                            : isToday
                              ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-300 dark:ring-teal-500/50'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {checked ? '✓' : wd.date}
                      </div>
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
