import { useState, useEffect, type FormEvent } from 'react'
import api from '../api'
import type { ExerciseRecord } from '../types'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EXERCISE_TYPES = [
  { key: '跑步', icon: '🏃' },
  { key: '散步', icon: '🚶' },
  { key: '健身', icon: '💪' },
  { key: '瑜伽', icon: '🧘' },
  { key: '球类', icon: '⚽' },
  { key: '游泳', icon: '🏊' },
  { key: '骑行', icon: '🚴' },
  { key: '舞蹈', icon: '💃' },
  { key: '跳绳', icon: '🪢' },
  { key: '武术', icon: '🥋' },
]

export default function ExerciseTracker() {
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const loadRecords = () => {
    api.get(`/exercise?date=${date}`).then((res) => setRecords(res.data || [])).catch(() => {})
  }

  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/exercise', { ...form, date })
    setForm({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/exercise/${id}`)
    loadRecords()
  }

  const set = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }))

  const totalMin = records.reduce((s, r) => s + r.duration_min, 0)

  if (!visible) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">🏃</div>
        <div className="text-gray-400 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">🏃 运动记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      <div className={`card bg-gradient-to-r from-warm-50 to-orange-50 flex items-center gap-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '250ms' }}>
        <span className="text-3xl">🔥</span>
        <div>
          <div className="text-2xl font-bold text-warm-700">{totalMin}<span className="text-sm font-normal text-warm-500"> 分钟</span></div>
          <div className="text-xs text-warm-400">今日运动时长</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`card space-y-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`} style={{ transitionDelay: '400ms' }}>
          <div>
            <label className="text-sm text-gray-500 block mb-1">运动类型</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {EXERCISE_TYPES.map((et) => (
                <button key={et.key} type="button"
                  onClick={() => set('exercise_type', et.key)}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs transition-all duration-200 ${
                    form.exercise_type === et.key ? 'bg-warm-100 text-warm-700 ring-1 ring-warm-300 scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{et.icon}</span>
                  {et.key}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 block mb-1">时长 (分钟)</label>
              <input type="number" className="input-field" value={form.duration_min}
                onChange={(e) => set('duration_min', parseInt(e.target.value) || 30)} />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">强度 (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    onClick={() => set('intensity', n)}
                    className={`w-8 h-8 rounded-lg text-sm transition-all duration-200 ${
                      form.intensity >= n ? 'bg-warm-100 text-warm-600 scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 hover:scale-105'
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>

          <textarea className="input-field" placeholder="备注（可选）" value={form.notes}
            onChange={(e) => set('notes', e.target.value)} rows={1} />

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">添加</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '550ms' }}>
          <button onClick={() => setShowForm(true)} className="btn-outline w-full hover-scale">+ 记录运动</button>
        </div>
      )}

      <div className={`space-y-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '700ms' }}>
        {records.map((r, index) => (
          <div key={r.id} className={`card flex items-center justify-between py-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: `${700 + index * 150}ms` }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{EXERCISE_TYPES.find((e) => e.key === r.exercise_type)?.icon || '🏃'}</span>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{r.exercise_type}</div>
                <div className="text-xs text-gray-400">
                  {r.duration_min} 分钟
                  {r.notes ? ` · ${r.notes}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                r.intensity >= 4 ? 'bg-orange-100 text-orange-600' :
                r.intensity >= 2 ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}>
                强度 {r.intensity}/5
              </span>
              <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 text-sm transition-transform hover:scale-110">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
