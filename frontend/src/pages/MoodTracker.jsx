import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MOOD_EMOJIS = ['', '😫', '😟', '😐', '😊', '😄']
const MOOD_LABELS = ['', '很差', '不太好', '一般', '不错', '超棒']
const MOOD_TAGS = ['焦虑', '开心', '疲惫', '精力充沛', '压力大', '放松', '沮丧', '平静', '烦躁', '满足', '孤独', '感恩']
const STRESS_LABELS = ['', '很低', '较低', '中等', '较高', '很高']

export default function MoodTracker() {
  const [date, setDate] = useState(today())
  const [moodScore, setMoodScore] = useState(3)
  const [stressLevel, setStressLevel] = useState(3)
  const [selectedTags, setSelectedTags] = useState([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/mood?date=${date}`).then((res) => {
      if (res.data) {
        setMoodScore(res.data.mood_score)
        setStressLevel(res.data.stress_level)
        setSelectedTags(res.data.mood_tags || [])
        setNotes(res.data.notes || '')
      } else {
        setMoodScore(3)
        setStressLevel(3)
        setSelectedTags([])
        setNotes('')
      }
    }).catch(() => {})

    api.get('/mood/weekly').then((res) => {
      setWeekly(res.data || [])
    }).catch(() => {})
  }, [date])

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/mood', {
        date,
        mood_score: moodScore,
        stress_level: stressLevel,
        mood_tags: selectedTags,
        notes,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)

      // Refresh weekly
      api.get('/mood/weekly').then((res) => setWeekly(res.data || [])).catch(() => {})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">💭 心情记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      {/* Mood Picker */}
      <div className="card text-center">
        <div className="text-5xl mb-2">{MOOD_EMOJIS[moodScore]}</div>
        <div className="text-sm text-gray-500 mb-3">{MOOD_LABELS[moodScore]}</div>
        <div className="flex justify-center gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button"
              onClick={() => setMoodScore(n)}
              className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                moodScore === n ? 'bg-rose-100 scale-110 shadow-sm' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {MOOD_EMOJIS[n]}
            </button>
          ))}
        </div>
      </div>

      {/* Stress level */}
      <div className="card">
        <label className="text-sm text-gray-500 block mb-2">压力水平: {STRESS_LABELS[stressLevel]}</label>
        <input
          type="range" min="1" max="5" value={stressLevel}
          onChange={(e) => setStressLevel(parseInt(e.target.value))}
          className="w-full accent-rose-400"
        />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>轻松</span><span>压力大</span>
        </div>
      </div>

      {/* Tags */}
      <div className="card">
        <label className="text-sm text-gray-500 block mb-2">心情标签（可多选）</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((tag) => (
            <button key={tag} type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <label className="text-sm text-gray-500 block mb-2">想说的话（可选）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows={3}
          placeholder="今天发生了什么..."
        />
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full" disabled={loading}>
        {saved ? '已保存 ✓' : '保存心情'}
      </button>

      {/* Weekly chart */}
      {weekly.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-3">本周心情趋势</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekly.map((d) => ({ date: d.date?.slice(5) || d.date, mood: d.mood_score }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
