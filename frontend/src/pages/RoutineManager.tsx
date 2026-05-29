import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const SLEEP_QUALITY_EMOJIS = ['', '😴', '😟', '😐', '😊', '😄']
const WATER_CUPS = [0, 2, 4, 6, 8, 10, 12]

export default function RoutineManager() {
  const [tab, setTab] = useState('record')
  const [date, setDate] = useState(today())
  const [form, setForm] = useState({ wake_time: '', sleep_time: '', sleep_quality: 3, screen_hours: 0, water_cups: 0, notes: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weekly, setWeekly] = useState<any[]>([])
  const [visible, setVisible] = useState(false)

  // Smart tab
  const [report, setReport] = useState<any>(null)
  const [period, setPeriod] = useState('weekly')
  const [wakeTime, setWakeTime] = useState('07:30')
  const [classStart, setClassStart] = useState('08:30')
  const [rec, setRec] = useState<any>(null)
  const [prefs, setPrefs] = useState({ chronotype: 'middle', nap_duration: 20, target_sleep_hours: 7.5 })
  const [scenarios, setScenarios] = useState<Record<string, any>>({})

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  useEffect(() => {
    api.get(`/routines?date=${date}`).then(res => {
      if (res.data) setForm({ wake_time: res.data.wake_time || '', sleep_time: res.data.sleep_time || '', sleep_quality: res.data.sleep_quality, screen_hours: res.data.screen_hours, water_cups: res.data.water_cups, notes: res.data.notes || '' })
    }).catch(() => {})
    api.get('/routines/weekly').then(res => setWeekly(res.data || [])).catch(() => {})
    api.get('/sleep/scenarios').then(r => setScenarios(r.data.scenarios || {})).catch(() => {})
    api.get('/sleep/preferences').then(r => { if (r.data) setPrefs(r.data) }).catch(() => {})
    if (tab === 'smart') loadReport('weekly')
  }, [date, tab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/routines', { ...form, date })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setLoading(false) }
  }

  const loadReport = (p: string) => {
    setPeriod(p)
    api.get(`/sleep/report?period=${p}`).then(r => setReport(r.data)).catch(() => {})
  }

  const getRecommendation = () => {
    api.get(`/sleep/recommendation?wake_time=${wakeTime}&class_start=${classStart}`).then(r => setRec(r.data)).catch(() => {})
  }

  const savePrefs = () => api.post('/sleep/preferences', prefs)
  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const getSleepHours = () => {
    if (!form.wake_time || !form.sleep_time) return null
    const [wh, wm] = form.wake_time.split(':').map(Number)
    const [sh, sm] = form.sleep_time.split(':').map(Number)
    let total = (wh * 60 + wm - sh * 60 - sm) / 60
    if (total < 0) total += 24
    return Math.round(total * 10) / 10
  }

  const sleepHours = getSleepHours()

  return (
    <div className="space-y-4">
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h2 className="page-title">🌙 作息管理</h2>
      </div>

      <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {[
          { key: 'record', label: '📝 记录作息' },
          { key: 'smart', label: '🧠 智能推荐' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'tab-active shadow-sm' : 'text-gray-500'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'record' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto text-sm" />
          </div>

          {/* 睡眠时长预览 */}
          {sleepHours !== null && (
            <div className={`card flex items-center gap-4 transition-all duration-500 animate-fade-in-scale ${
              sleepHours >= 7 ? 'border-l-4 border-l-green-400 dark:border-l-green-500' : 'border-l-4 border-l-amber-400 dark:border-l-amber-500'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-sleep-100 dark:bg-indigo-500/20 flex items-center justify-center text-2xl">
                {sleepHours >= 7 ? '😊' : '😴'}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{sleepHours}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">小时</span>
                </div>
                <div className={`text-sm font-medium ${sleepHours >= 7 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {sleepHours >= 7 ? '睡眠时长合理 ✓' : '建议保证7-8小时睡眠'}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌅</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">起床时间</span>
                </div>
                <input type="time" value={form.wake_time} onChange={e => set('wake_time', e.target.value)} className="input-field text-center text-lg font-semibold" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌙</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">入睡时间</span>
                </div>
                <input type="time" value={form.sleep_time} onChange={e => set('sleep_time', e.target.value)} className="input-field text-center text-lg font-semibold" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">
                睡眠质量: {SLEEP_QUALITY_EMOJIS[form.sleep_quality]}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => set('sleep_quality', n)}
                    className={`flex-1 h-12 rounded-xl text-lg transition-all duration-200 ${
                      form.sleep_quality >= n
                        ? 'bg-sleep-100 dark:bg-indigo-500/20 text-sleep-600 dark:text-indigo-400'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${form.sleep_quality === n ? 'ring-2 ring-sleep-300 dark:ring-indigo-500/50 scale-105' : ''}`}
                  >{SLEEP_QUALITY_EMOJIS[n]}</button>
                ))}
              </div>
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-gray-400">很差</span>
                <span className="text-[10px] text-gray-400">很好</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">
                饮水量: <span className="font-semibold text-blue-600 dark:text-blue-400">{form.water_cups} 杯</span>
                {form.water_cups >= 8 && <span className="text-green-500 ml-1">✓ 达标</span>}
              </label>
              <div className="flex gap-1">
                {WATER_CUPS.map(n => (
                  <button key={n} type="button" onClick={() => set('water_cups', n)}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                      form.water_cups >= n
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">📱 屏幕使用 (小时)</label>
              <input type="number" step="0.5" value={form.screen_hours} onChange={e => set('screen_hours', parseFloat(e.target.value) || 0)} className="input-field" />
            </div>

            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="input-field" rows={2} placeholder="备注..." />

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {saved ? '✓ 已保存' : loading ? '保存中...' : '保存记录'}
            </button>
          </form>

          {weekly.length > 0 && (
            <div className="card animate-fade-in-up">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">📈 本周睡眠质量趋势</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weekly.map(d => ({ date: d.date?.slice(5), quality: d.sleep_quality }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(v: number) => [`${SLEEP_QUALITY_EMOJIS[v] || '😐'} ${v}/5`, '睡眠质量']}
                  />
                  <Line type="monotone" dataKey="quality" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} name="睡眠质量" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 睡眠时间推荐 */}
          <div className="card space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">⏰ 睡眠时间推荐</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🌅</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">起床时间</span>
                </div>
                <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="input-field text-center text-lg font-semibold" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📚</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">第一节课</span>
                </div>
                <input type="time" value={classStart} onChange={e => setClassStart(e.target.value)} className="input-field text-center text-lg font-semibold" />
              </div>
            </div>
            <button onClick={getRecommendation} className="btn-primary w-full">计算最佳作息</button>
            {rec && (
              <div className="bg-sleep-50 dark:bg-indigo-500/10 rounded-xl p-4 space-y-3 animate-fade-in-scale">
                <div className="flex items-center justify-between py-1.5 px-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">建议入睡</span>
                  <span className="text-sm font-bold text-sleep-700 dark:text-indigo-400">{rec.target_bedtime}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">建议午休</span>
                  <span className="text-sm font-bold text-sleep-700 dark:text-indigo-400">{rec.nap_time} ({rec.nap_duration}分钟)</span>
                </div>
                <p className="text-sm text-sleep-700 dark:text-indigo-300 leading-relaxed">{rec.recommendation}</p>
              </div>
            )}
          </div>

          {/* 睡眠报告 */}
          {report && (
            <div className="card space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">📊 睡眠报告</h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 gap-0.5">
                  {['weekly', 'monthly'].map(p => (
                    <button key={p} onClick={() => loadReport(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        period === p ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >{p === 'weekly' ? '本周' : '本月'}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-sleep-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-sleep-600 dark:text-indigo-400">{report.avg_sleep_hours}h</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">平均时长</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{report.avg_quality}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">平均质量</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.regularity}%</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">规律性</div>
                </div>
              </div>
            </div>
          )}

          {/* 作息偏好 */}
          <div className="card space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">⚙️ 作息偏好</h3>
            <div>
              <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">睡眠类型</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'early', label: '🌅', sub: '早起型' },
                  { key: 'middle', label: '☀️', sub: '中间型' },
                  { key: 'late', label: '🌙', sub: '夜猫型' },
                ].map(t => (
                  <button key={t.key} type="button" onClick={() => setPrefs(p => ({ ...p, chronotype: t.key }))}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition-all duration-200 ${
                      prefs.chronotype === t.key
                        ? 'bg-sleep-100 dark:bg-indigo-500/20 text-sleep-700 dark:text-indigo-400 ring-2 ring-sleep-300 dark:ring-indigo-500/50 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{t.label}</span>
                    <span>{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">午休 (分钟)</label>
                <input type="number" value={prefs.nap_duration} onChange={e => setPrefs(p => ({ ...p, nap_duration: parseInt(e.target.value) || 0 }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">目标睡眠 (小时)</label>
                <input type="number" step="0.5" value={prefs.target_sleep_hours} onChange={e => setPrefs(p => ({ ...p, target_sleep_hours: parseFloat(e.target.value) || 0 }))} className="input-field text-sm" />
              </div>
            </div>
            <button onClick={savePrefs} className="btn-outline w-full">保存偏好</button>
          </div>

          {/* 特殊场景 */}
          <div className="card space-y-2 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">🎭 特殊场景调整</h3>
            {Object.entries(scenarios).map(([key, s], si) => (
              <details key={key} className="group bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200">
                <summary className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:text-sleep-600 dark:hover:text-indigo-400 transition-colors">
                  <span className="text-lg">{s.icon || '📌'}</span>
                  <span className="flex-1">{s.title}</span>
                  <span className="text-gray-400 group-open:rotate-90 transition-transform duration-200">▶</span>
                </summary>
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  {s.schedule && (
                    <div className="flex gap-3 text-xs">
                      <span className="px-2 py-1 bg-sleep-50 dark:bg-indigo-500/10 text-sleep-700 dark:text-indigo-400 rounded-lg">🌅 {s.schedule.wake}</span>
                      <span className="px-2 py-1 bg-sleep-50 dark:bg-indigo-500/10 text-sleep-700 dark:text-indigo-400 rounded-lg">🌙 {s.schedule.sleep}</span>
                      <span className="px-2 py-1 bg-sleep-50 dark:bg-indigo-500/10 text-sleep-700 dark:text-indigo-400 rounded-lg">💤 {s.schedule.nap}</span>
                    </div>
                  )}
                  <ul className="space-y-1.5">
                    {s.tips?.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sleep-400 mt-1.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
