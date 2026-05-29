import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'
import type { MoodRecord } from '../types'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MOOD_EMOJIS = ['', '😫', '😟', '😐', '😊', '😄']
const MOOD_LABELS = ['', '很差', '不太好', '一般', '不错', '超棒']
const MOOD_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4']
const MOOD_TAGS = ['焦虑', '开心', '疲惫', '精力充沛', '压力大', '放松', '沮丧', '平静', '烦躁', '满足', '孤独', '感恩']
const STRESS_EMOJIS = ['', '😌', '🙂', '😐', '😣', '😰']
const STRESS_LABELS = ['', '很低', '较低', '中等', '较高', '很高']

export default function MoodTracker() {
  const [date, setDate] = useState(today())
  const [moodScore, setMoodScore] = useState(3)
  const [stressLevel, setStressLevel] = useState(3)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [weekly, setWeekly] = useState<MoodRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

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

  const toggleTag = (tag: string) => {
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
      setTimeout(() => setSaved(false), 2000)
      api.get('/mood/weekly').then((res) => setWeekly(res.data || [])).catch(() => {})
    } finally {
      setLoading(false)
    }
  }

  if (!visible) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">💭</div>
        <div className="text-gray-400 dark:text-gray-500 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  const chartData = weekly.map((d: MoodRecord) => ({ date: d.date?.slice(5) || d.date, mood: d.mood_score }))

  return (
    <div className="space-y-4">
      {/* 页头 */}
      <div className={`flex items-center justify-between transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h2 className="page-title">💭 心情记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      {/* 心情选择器 */}
      <div className={`card text-center transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
        <div
          className="text-6xl mb-3 transition-all duration-300"
          style={{ transform: `scale(${1 + moodScore * 0.05})` }}
        >
          {MOOD_EMOJIS[moodScore]}
        </div>
        <div
          className="text-base font-semibold mb-4 transition-colors duration-300"
          style={{ color: MOOD_COLORS[moodScore] }}
        >
          {MOOD_LABELS[moodScore]}
        </div>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMoodScore(n)}
              className={`w-14 h-14 rounded-2xl text-2xl transition-all duration-200 flex items-center justify-center ${
                moodScore === n
                  ? 'scale-110 shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              style={moodScore === n ? { backgroundColor: MOOD_COLORS[n] + '20' } : undefined}
            >
              {MOOD_EMOJIS[n]}
            </button>
          ))}
        </div>
      </div>

      {/* 压力水平 */}
      <div className={`card transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">🎯 压力水平</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {STRESS_EMOJIS[stressLevel]} {STRESS_LABELS[stressLevel]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStressLevel(n)}
              className={`flex-1 h-12 rounded-xl text-lg transition-all duration-200 flex items-center justify-center ${
                stressLevel >= n
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 scale-105'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${stressLevel === n ? 'ring-2 ring-rose-300 dark:ring-rose-500/50 shadow-sm' : ''}`}
            >
              {STRESS_EMOJIS[n]}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-gray-400">轻松</span>
          <span className="text-[10px] text-gray-400">高压</span>
        </div>
      </div>

      {/* 情绪标签 */}
      <div className={`card transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '450ms' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">🏷️ 情绪标签</span>
          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              清除
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOOD_TAGS.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-rose-500 text-white shadow-sm scale-105'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* 备注 */}
      <div className={`card transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">📝 备注</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field"
          rows={3}
          placeholder="今天有什么想记录的..."
        />
      </div>

      {/* 保存按钮 */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '750ms' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            saved
              ? 'bg-green-500 text-white scale-[1.02]'
              : 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-md hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {saved ? '✓ 已保存' : loading ? '保存中...' : '保存心情'}
        </button>
      </div>

      {/* 本周趋势 */}
      {weekly.length > 0 && (
        <div className={`card transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '900ms' }}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">📈 本周心情趋势</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v: number) => [`${MOOD_EMOJIS[v] || '😐'} ${v}/5`, '心情']}
              />
              <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={3} dot={{ r: 5, fill: '#f472b6', strokeWidth: 0 }} name="心情" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
