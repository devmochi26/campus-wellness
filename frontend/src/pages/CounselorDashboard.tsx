import { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CounselorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<any>(null)
  const [className, setClassName] = useState(user?.class_name || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [setting, setSetting] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  const loadOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api.get('/campus/counselor/overview')
      if (r.data.error === '仅辅导员可访问') {
        setError('need_role')
      } else if (r.data.error) {
        setError(r.data.error)
      } else {
        setOverview(r.data)
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || '加载失败，请确保已设置为辅导员角色')
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOverview() }, [])

  const setClass = async () => {
    if (!className.trim()) return
    setSetting(true)
    try {
      await api.post(`/campus/class-name?class_name=${encodeURIComponent(className)}`)
      loadOverview()
    } catch (err: any) {
      setError(err?.response?.data?.detail || '设置失败')
    } finally {
      setSetting(false)
    }
  }

  const switchToCounselor = async () => {
    setSwitchingRole(true)
    try {
      await api.post('/campus/role?role=counselor')
      if (user) user.role = 'counselor'
      loadOverview()
    } catch {
      setError('切换角色失败')
    } finally {
      setSwitchingRole(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">📊</div>
        <div className="text-gray-400 dark:text-gray-500 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  // 未切换辅导员角色
  if (error === 'need_role') {
    return (
      <div className="space-y-4">
        <h2 className="page-title">📊 辅导员看板</h2>
        <div className="card text-center py-10 space-y-4 animate-fade-in-scale">
          <div className="text-5xl">👨‍🏫</div>
          <div>
            <div className="text-base font-semibold text-gray-700 dark:text-gray-200">需要辅导员权限</div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">当前为学生身份，切换后即可查看班级健康数据</div>
          </div>
          <button onClick={switchToCounselor} disabled={switchingRole} className="btn-primary">
            {switchingRole ? '切换中...' : '切换为辅导员'}
          </button>
        </div>
      </div>
    )
  }

  // 未设置班级名
  if (!overview) {
    return (
      <div className="space-y-4">
        <h2 className="page-title">📊 辅导员看板</h2>
        <div className="card text-center py-10 space-y-4 animate-fade-in-scale">
          <div className="text-5xl">🏫</div>
          <div>
            <div className="text-base font-semibold text-gray-700 dark:text-gray-200">设置你的班级</div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">输入班级名称后，可查看学生的整体健康概览</div>
          </div>
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              className="input-field text-sm flex-1"
              placeholder="如：计算机2024级1班"
              value={className}
              onChange={e => setClassName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setClass()}
              autoFocus
            />
            <button onClick={setClass} disabled={setting} className="btn-primary text-sm px-5">
              {setting ? '...' : '确认'}
            </button>
          </div>
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="page-title">📊 辅导员看板</h2>
        <button onClick={() => { navigate('/'); if (user) user.role = 'student'; }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ← 返回首页
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          🏫 {overview.class_name} · {overview.student_count || 0} 名学生
          {overview.students?.length > 0 && (
            <span className="text-xs text-gray-400 ml-2">{overview.students.join('、')}</span>
          )}
        </div>
        <button onClick={loadOverview} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">刷新</button>
      </div>

      {overview.student_count === 0 ? (
        <div className="card text-center py-10 animate-fade-in">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">还没有学生加入这个班级</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">让学生在他们的个人资料中设置相同班级名：{overview.class_name}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card bg-sleep-50/50 dark:bg-indigo-500/5 text-center">
              <div className="text-2xl font-bold text-sleep-600 dark:text-indigo-400">{overview.sleep.avg_quality}</div>
              <div className="text-xs text-gray-500 mt-1">平均睡眠质量</div>
              <div className="text-[11px] text-gray-400 mt-0.5">≈{overview.sleep.avg_hours}h/晚</div>
            </div>
            <div className="card bg-mood-50/50 dark:bg-rose-500/5 text-center">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{overview.mood.avg_stress}</div>
              <div className="text-xs text-gray-500 mt-1">平均压力水平</div>
              <div className="text-[11px] text-gray-400 mt-0.5">心情 {overview.mood.avg_mood}/5</div>
            </div>
            <div className="card bg-food-50/50 dark:bg-orange-500/5 text-center">
              <div className="text-2xl font-bold text-food-600 dark:text-orange-400">{overview.habits.total_checkins}</div>
              <div className="text-xs text-gray-500 mt-1">本周打卡次数</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{overview.habits.total_habits} 个习惯</div>
            </div>
            <div className="card bg-teal-50/50 dark:bg-teal-500/5 text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{overview.sleep.records_this_week}</div>
              <div className="text-xs text-gray-500 mt-1">本周作息记录</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{overview.mood.records_this_week} 条心情</div>
            </div>
          </div>

          {Object.keys(overview.constitution_distribution || {}).length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">🔬 体质分布</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(overview.constitution_distribution).map(([t, c]: [string, any]) => (
                  <span key={t} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{t}</span>
                    <span className="text-gray-400 ml-1">{c as number}人</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {(overview.anomalies?.low_sleep?.length > 0 || overview.anomalies?.high_stress?.length > 0) && (
            <div className="card border-l-4 border-l-red-400">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ 需要关注</h3>
              {overview.anomalies.low_sleep?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{'😴 睡眠异常（连续质量 < 3）'}</div>
                  {overview.anomalies.low_sleep.map((s: any) => (
                    <div key={s.user_id} className="flex justify-between text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-gray-700 dark:text-gray-200">{s.nickname}</span>
                      <span className="text-red-500 text-xs">均分 {s.avg_quality} · {s.low_sleep_days}天异常</span>
                    </div>
                  ))}
                </div>
              )}
              {overview.anomalies.high_stress?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">😰 高压力（压力 ≥ 4）</div>
                  {overview.anomalies.high_stress.map((s: any) => (
                    <div key={s.user_id} className="flex justify-between text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-gray-700 dark:text-gray-200">{s.nickname}</span>
                      <span className="text-red-500 text-xs">均压 {s.avg_stress} · {s.high_stress_days}天高压</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card bg-blue-50/50 dark:bg-blue-500/5">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 干预建议</h3>
            <ul className="space-y-1.5 text-sm text-blue-600 dark:text-blue-300">
              {overview.anomalies?.low_sleep?.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  有 {overview.anomalies.low_sleep.length} 名学生近期睡眠质量偏低
                </li>
              )}
              {overview.anomalies?.high_stress?.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  有 {overview.anomalies.high_stress.length} 名学生压力较高，建议引导到心理咨询中心评估
                </li>
              )}
              {overview.sleep.avg_hours > 0 && overview.sleep.avg_hours < 6.5 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  班级平均睡眠不足6.5小时，注意提醒学生规律作息
                </li>
              )}
              {!overview.anomalies?.low_sleep?.length && !overview.anomalies?.high_stress?.length && (
                <li>班级整体健康状况良好，继续保持！</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
