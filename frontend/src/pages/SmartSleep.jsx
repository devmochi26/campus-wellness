import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

export default function SmartSleep() {
  const [wakeTime, setWakeTime] = useState('07:30')
  const [classStart, setClassStart] = useState('08:30')
  const [rec, setRec] = useState(null)
  const [report, setReport] = useState(null)
  const [period, setPeriod] = useState('weekly')
  const [prefs, setPrefs] = useState({ chronotype: 'middle', nap_duration: 20, target_sleep_hours: 7.5 })
  const [scenarios, setScenarios] = useState({})

  useEffect(() => {
    api.get('/sleep/scenarios').then(r => setScenarios(r.data.scenarios || {})).catch(() => {})
    api.get('/sleep/preferences').then(r => { if (r.data) setPrefs(r.data) }).catch(() => {})
    loadReport('weekly')
  }, [])

  const loadReport = (p) => {
    setPeriod(p)
    api.get(`/sleep/report?period=${p}`).then(r => setReport(r.data)).catch(() => {})
  }

  const getRecommendation = () => {
    api.get(`/sleep/recommendation?wake_time=${wakeTime}&class_start=${classStart}`).then(r => setRec(r.data)).catch(() => {})
  }

  const savePrefs = () => {
    api.post('/sleep/preferences', prefs).then(() => alert('偏好已保存'))
  }

  const sleepQualityColor = (q) => {
    if (q >= 4) return '#8b5cf6'
    if (q >= 3) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🧠 智能作息管理</h2>

      {/* Sleep Calculator */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">睡眠时间推荐</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">起床时间</label>
            <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">第一节课</label>
            <input type="time" value={classStart} onChange={e => setClassStart(e.target.value)} className="input-field text-sm" />
          </div>
        </div>
        <button onClick={getRecommendation} className="btn-primary w-full text-sm">计算最佳作息</button>

        {rec && (
          <div className="bg-primary-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">建议入睡</span>
              <span className="font-bold text-primary-700">{rec.target_bedtime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">建议午休</span>
              <span className="font-bold text-primary-700">{rec.nap_time} ({rec.nap_duration}分钟)</span>
            </div>
            <div className="text-sm text-primary-700 mt-2 leading-relaxed">{rec.recommendation}</div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">作息偏好</h3>
        <div className="flex gap-2">
          {[
            { key: 'early', label: '🌅 早起型' },
            { key: 'middle', label: '☀️ 中间型' },
            { key: 'late', label: '🌙 夜猫型' },
          ].map(t => (
            <button key={t.key} type="button"
              onClick={() => setPrefs(p => ({ ...p, chronotype: t.key }))}
              className={`flex-1 py-2 rounded-lg text-xs transition-colors ${prefs.chronotype === t.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500'}`}
            >{t.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">午休时长(分钟)</label>
            <input type="number" value={prefs.nap_duration}
              onChange={e => setPrefs(p => ({ ...p, nap_duration: parseInt(e.target.value) || 0 }))}
              className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">目标睡眠(小时)</label>
            <input type="number" step="0.5" value={prefs.target_sleep_hours}
              onChange={e => setPrefs(p => ({ ...p, target_sleep_hours: parseFloat(e.target.value) || 0 }))}
              className="input-field text-sm" />
          </div>
        </div>
        <button onClick={savePrefs} className="btn-outline w-full text-sm">保存偏好</button>
      </div>

      {/* Sleep Report */}
      {report && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">睡眠报告</h3>
            <div className="flex gap-1">
              {['weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => loadReport(p)}
                  className={`px-3 py-1 rounded-lg text-xs ${period === p ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500'}`}
                >{p === 'weekly' ? '周' : '月'}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{report.avg_sleep_hours}</div>
              <div className="text-xs text-gray-400">平均时长(h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{report.avg_quality}</div>
              <div className="text-xs text-gray-400">平均质量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{report.regularity}%</div>
              <div className="text-xs text-gray-400">规律性</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={report.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sleep_quality" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="睡眠质量" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scenarios */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">特殊场景调整</h3>
        <div className="space-y-2">
          {Object.entries(scenarios).map(([key, s]) => (
            <details key={key} className="bg-gray-50 rounded-xl p-3 group">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">{s.title}</summary>
              <ul className="mt-2 space-y-1">
                {s.tips?.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-primary-500 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
              {s.schedule && (
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>起床 {s.schedule.wake}</span>
                  <span>入睡 {s.schedule.sleep}</span>
                  <span>午休 {s.schedule.nap}</span>
                </div>
              )}
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
