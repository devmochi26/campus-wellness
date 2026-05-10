import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DailyRoutine() {
  const [date, setDate] = useState(today())
  const [form, setForm] = useState({
    wake_time: '',
    sleep_time: '',
    sleep_quality: 3,
    screen_hours: 0,
    water_cups: 0,
    notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weekly, setWeekly] = useState([])

  useEffect(() => {
    api.get(`/routines?date=${date}`).then((res) => {
      if (res.data) {
        setForm({
          wake_time: res.data.wake_time || '',
          sleep_time: res.data.sleep_time || '',
          sleep_quality: res.data.sleep_quality,
          screen_hours: res.data.screen_hours,
          water_cups: res.data.water_cups,
          notes: res.data.notes,
        })
      }
    }).catch(() => {})

    api.get('/routines/weekly').then((res) => {
      setWeekly(res.data || [])
    }).catch(() => {})
  }, [date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/routines', { ...form, date })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setLoading(false)
    }
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">🌙 作息记录</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field w-auto text-sm"
        />
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">起床时间</label>
            <input
              type="time"
              value={form.wake_time}
              onChange={(e) => set('wake_time', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">入睡时间</label>
            <input
              type="time"
              value={form.sleep_time}
              onChange={(e) => set('sleep_time', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">睡眠质量</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('sleep_quality', n)}
                className={`w-10 h-10 rounded-xl text-lg transition-colors ${
                  form.sleep_quality >= n ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">屏幕使用 (小时)</label>
            <input
              type="number"
              step="0.5"
              value={form.screen_hours}
              onChange={(e) => set('screen_hours', parseFloat(e.target.value) || 0)}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">饮水量 (杯)</label>
            <input
              type="number"
              value={form.water_cups}
              onChange={(e) => set('water_cups', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">备注</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="今天有什么想记录的..."
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {saved ? '已保存 ✓' : '保存记录'}
        </button>
      </form>

      {/* Sleep hours summary */}
      {form.wake_time && form.sleep_time && (() => {
        const [wh, wm] = form.wake_time.split(':').map(Number)
        const [sh, sm] = form.sleep_time.split(':').map(Number)
        let total = (wh * 60 + wm - sh * 60 - sm) / 60
        if (total < 0) total += 24
        const rounded = Math.round(total * 10) / 10
        return (
          <div className={`card border-l-4 ${rounded >= 7 ? 'border-primary-400' : 'border-warm-400'}`}>
            <div className="flex items-center gap-2">
              <span>🛏️</span>
              <span className="text-gray-700">
                预估睡眠 <strong>{rounded}</strong> 小时
                {rounded < 7 ? ' — 建议保证7-8小时睡眠' : ' — 睡眠时长合理'}
              </span>
            </div>
          </div>
        )
      })()}

      {/* Weekly chart */}
      {weekly.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-3">本周睡眠质量趋势</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekly.map((d) => ({ date: d.date?.slice(5) || d.date, quality: d.sleep_quality }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}/5`, '睡眠质量']} />
              <Line type="monotone" dataKey="quality" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="睡眠质量" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
