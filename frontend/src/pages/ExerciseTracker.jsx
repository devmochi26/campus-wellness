import { useState, useEffect } from 'react'
import api from '../api'

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
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })

  const loadRecords = () => {
    api.get(`/exercise?date=${date}`).then((res) => setRecords(res.data || [])).catch(() => {})
  }

  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/exercise', { ...form, date })
    setForm({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id) => {
    await api.delete(`/exercise/${id}`)
    loadRecords()
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const totalMin = records.reduce((s, r) => s + r.duration_min, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">🏃 运动记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      {/* Total */}
      <div className="card bg-gradient-to-r from-warm-50 to-orange-50 flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <div className="text-2xl font-bold text-warm-700">{totalMin}<span className="text-sm font-normal text-warm-500"> 分钟</span></div>
          <div className="text-xs text-warm-400">今日运动时长</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">运动类型</label>
            <div className="grid grid-cols-5 gap-2">
              {EXERCISE_TYPES.map((et) => (
                <button key={et.key} type="button"
                  onClick={() => set('exercise_type', et.key)}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs transition-colors ${
                    form.exercise_type === et.key ? 'bg-warm-100 text-warm-700 ring-1 ring-warm-300' : 'bg-gray-50 text-gray-500'
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
                onChange={(e) => set('duration_min', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">强度</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    onClick={() => set('intensity', n)}
                    className={`w-8 h-8 rounded-lg text-sm ${
                      form.intensity >= n ? 'bg-warm-100 text-warm-600' : 'bg-gray-50 text-gray-300'
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
        <button onClick={() => setShowForm(true)} className="btn-outline w-full">+ 记录运动</button>
      )}

      <div className="space-y-2">
        {records.map((r) => (
          <div key={r.id} className="card flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">{EXERCISE_TYPES.find((e) => e.key === r.exercise_type)?.icon || '🏃'}</span>
              <div>
                <div className="text-sm font-medium text-gray-700">{r.exercise_type}</div>
                <div className="text-xs text-gray-400">
                  {r.duration_min} 分钟 · 强度 {r.intensity}/5
                  {r.notes ? ` · ${r.notes}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-warm-600">{r.duration_min} min</span>
              <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
