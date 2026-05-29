import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import type { DashboardToday } from '../types'

const moodEmojis = ['', '😫', '😟', '😐', '😊', '😄']

function greet() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function todayStr() {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
}

function scoreMeta(s: number) {
  if (s >= 80) return { emoji: '🌟', label: '状态很好', hex: '#22c55e', bg: 'from-green-500 to-emerald-600', tip: '继续保持，身体会感谢你的 ✨' }
  if (s >= 60) return { emoji: '🙂', label: '还算不错', hex: '#f59e0b', bg: 'from-amber-400 to-orange-500', tip: '还有提升空间，今天试试记录饮食吧' }
  if (s >= 40) return { emoji: '😟', label: '需要关注', hex: '#f97316', bg: 'from-orange-400 to-red-500', tip: '别忘了关注自己的身体哦 💪' }
  return { emoji: '😰', label: '该行动起来啦', hex: '#ef4444', bg: 'from-red-400 to-rose-500', tip: '从现在开始，每天记录一点点 🌱' }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardToday | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [points, setPoints] = useState<any>(null)
  const [tomorrow, setTomorrow] = useState<any>(null)
  const [showClass, setShowClass] = useState(false)
  const [cls, setCls] = useState(user?.class_name || '')
  const [savingCls, setSavingCls] = useState(false)

  useEffect(() => {
    api.get<DashboardToday>('/dashboard/today').then(r => setData(r.data)).finally(() => {
      setLoading(false)
      setTimeout(() => setVisible(true), 100)
    })
    api.get('/campus/points').then(r => setPoints(r.data)).catch(() => {})
    api.get('/campus/tomorrow-schedule').then(r => setTomorrow(r.data)).catch(() => {})
    if (!user?.class_name) setShowClass(true)
  }, [])

  const saveClass = async () => {
    if (!cls.trim()) return
    setSavingCls(true)
    try {
      await api.post(`/campus/class-name?class_name=${encodeURIComponent(cls)}`)
      if (user) user.class_name = cls
      setShowClass(false)
    } finally { setSavingCls(false) }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">🌿</div>
        <div className="text-gray-400 dark:text-gray-500 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-4xl mb-3">😕</div>
        <div className="text-gray-400 dark:text-gray-500">加载失败，请刷新重试</div>
      </div>
    )
  }

  const { routine, diet_count, diet_healthy_avg, exercise_min, exercise_count, mood, habit_checkins, habit_total, wellness_score } = data
  const sm = scoreMeta(wellness_score)

  const done = [
    routine?.sleep_quality ? 1 : 0,
    diet_count > 0 ? 1 : 0,
    exercise_count > 0 ? 1 : 0,
    mood ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const items = [
    { icon: '🌙', label: '睡眠', done: !!routine?.sleep_quality, detail: routine ? `${routine.sleep_quality}/5 · ${routine.sleep_time || ''}` : '未记录', color: 'indigo', to: '/routine' },
    { icon: '🍽️', label: '饮食', done: diet_count > 0, detail: diet_count > 0 ? `${diet_count}餐 · 均分${diet_healthy_avg}` : '未记录', color: 'orange', to: '/diet' },
    { icon: '🏃', label: '运动', done: exercise_count > 0, detail: exercise_count > 0 ? `${exercise_min}min · ${exercise_count}次` : '未记录', color: 'warm', to: '/exercise' },
    { icon: '💭', label: '心情', done: !!mood, detail: mood ? `${moodEmojis[mood.mood_score]} ${mood.mood_score}/5` : '未记录', color: 'rose', to: '/mood' },
    { icon: '💧', label: '饮水', done: !!(routine && routine.water_cups >= 8), detail: routine ? `${routine.water_cups}/8杯` : '未记录', color: 'blue', to: '/routine' },
    { icon: '✅', label: '打卡', done: habit_checkins === habit_total && habit_total > 0, detail: `${habit_checkins}/${habit_total}`, color: 'teal', to: '/habits' },
  ]

  const colorBar = (c: string) => {
    const map: Record<string, string> = {
      indigo: 'bg-indigo-400', orange: 'bg-orange-400', warm: 'bg-amber-400',
      rose: 'bg-rose-400', blue: 'bg-blue-400', teal: 'bg-teal-400',
    }
    return map[c] || 'bg-gray-400'
  }

  return (
    <div className="space-y-5">
      {/* 问候 */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {greet()}，{user?.nickname || '同学'}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{todayStr()}</p>
      </div>

      {/* 班级提示 */}
      {showClass && (
        <div className="card bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 animate-fade-in-scale space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">🏫</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">设置班级</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">加入班级后辅导员可查看群体健康数据</div>
            </div>
            <button onClick={() => setShowClass(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
          </div>
          <div className="flex gap-2">
            <input className="input-field text-sm flex-1" placeholder="如：计算机2024级1班" value={cls}
              onChange={e => setCls(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveClass()} />
            <button onClick={saveClass} disabled={savingCls} className="btn-primary text-sm px-4">{savingCls ? '...' : '加入'}</button>
          </div>
        </div>
      )}

      {/* 养生分核心卡片 */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${sm.bg} p-6 shadow-lg transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '100ms' }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative flex items-center gap-6">
          <div className="shrink-0 relative">
            <div className="w-24 h-24 rounded-full bg-white/10 absolute inset-0 scale-110" />
            <svg width={100} height={100} className="-rotate-90 relative">
              <circle cx={50} cy={50} r={44} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={8} />
              <circle cx={50} cy={50} r={44} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - wellness_score / 100)}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-2xl font-extrabold">{wellness_score}</span>
              <span className="text-[10px] font-medium opacity-80">养生分</span>
            </div>
          </div>
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sm.emoji}</span>
              <span className="text-lg font-bold">{sm.label}</span>
            </div>
            <p className="text-white/70 text-sm mt-1 leading-relaxed">{sm.tip}</p>
            <div className="flex items-center gap-1 mt-3">
              <div className={`h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden`}>
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${wellness_score}%` }} />
              </div>
              <span className="text-[10px] text-white/60">{wellness_score}%</span>
            </div>
          </div>
        </div>
        {/* 快捷操作 */}
        <div className="relative flex gap-2 mt-5 pt-4 border-t border-white/15">
          {[
            { to: '/routine', icon: '🌙', label: '作息' },
            { to: '/diet', icon: '🍽️', label: '饮食' },
            { to: '/exercise', icon: '🏃', label: '运动' },
            { to: '/mood', icon: '💭', label: '心情' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl transition-colors">
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 今日完成度 */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">今日进度</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">{done}/4 项完成</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 animate-fade-in-up hover:shadow-sm ${
                item.done
                  ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                  : 'bg-gray-50/70 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                item.done ? `${colorBar(item.color)} bg-opacity-15` : 'bg-gray-100 dark:bg-gray-700/50 opacity-50'
              }`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.detail}</div>
              </div>
              {item.done && <span className="text-green-500 text-sm ml-auto shrink-0">✓</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* 积分 + 课程 */}
      <div className={`grid grid-cols-2 gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
        {points ? (
          <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5 text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400">{points.total_points}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">积分</div>
            {points.weekly_points > 0 && (
              <div className="text-[10px] text-amber-500 mt-0.5">本周 +{points.weekly_points}</div>
            )}
          </div>
        ) : (
          <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5 text-center opacity-50">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xl font-bold text-gray-400">0</div>
            <div className="text-xs text-gray-400">积分</div>
          </div>
        )}
        {tomorrow && tomorrow.course_count > 0 ? (
          <Link to="/routine" className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/5 dark:to-cyan-500/5 text-center block hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">{tomorrow.earliest_course}</div>
            <div className="text-xs text-gray-500 mt-0.5">明天 {tomorrow.earliest_time?.slice(0, 5)}</div>
            {tomorrow.has_pe && <div className="text-[10px] text-blue-500 mt-1 bg-blue-100 dark:bg-blue-500/20 rounded px-2 py-0.5 inline-block">🏃 有体育课</div>}
          </Link>
        ) : (
          <div className="card bg-gray-50/50 dark:bg-gray-800/50 text-center opacity-50">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm text-gray-400">暂无课程</div>
            <div className="text-xs text-gray-400 mt-0.5">添加课程表获取提醒</div>
          </div>
        )}
      </div>

      {/* 提醒 */}
      <div className={`space-y-2 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
        {routine && routine.screen_hours > 6 && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <span>📱</span>
            <span className="text-sm text-amber-700 dark:text-amber-300">屏幕使用 {routine.screen_hours}h，注意休息</span>
          </div>
        )}
        {routine?.sleep_time && parseInt(routine.sleep_time) >= 0 && parseInt(routine.sleep_time) < 6 && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-200 dark:border-rose-500/20">
            <span>⚠️</span>
            <span className="text-sm text-rose-700 dark:text-rose-300">入睡偏晚 (凌晨{routine.sleep_time})，注意作息</span>
          </div>
        )}
      </div>
    </div>
  )
}
