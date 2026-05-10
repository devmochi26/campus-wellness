import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import StatCard from '../components/StatCard'
import ProgressRing from '../components/ProgressRing'

const moodEmojis = ['', '😫', '😟', '😐', '😊', '😄']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/today').then((res) => {
      setData(res.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin text-3xl">🌿</div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400">加载失败，请刷新重试</div>
  }

  const { routine, diet_count, diet_healthy_avg, exercise_min, exercise_count, mood, habit_checkins, habit_total, wellness_score } = data

  const getScoreColor = (s) => {
    if (s >= 80) return '#22c55e'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (s) => {
    if (s >= 80) return '状态很好'
    if (s >= 60) return '还算不错'
    if (s >= 40) return '需要关注'
    return '该行动起来啦'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">📊 今日概览</h2>

      {/* Wellness Score */}
      <div className="card flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <ProgressRing value={wellness_score} label="养生分" color={getScoreColor(wellness_score)} size={90} />
        <div>
          <div className="text-lg font-semibold text-gray-700">{getScoreLabel(wellness_score)}</div>
          <div className="text-sm text-gray-400 mt-1">
            {wellness_score < 60 ? '别忘了关注自己的身体哦 💪' : '继续保持，身体会感谢你的 ✨'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link to="/routine">
          <StatCard
            icon="🌙"
            label="睡眠质量"
            value={routine ? `${routine.sleep_quality}/5` : '未记录'}
            sub={routine?.sleep_time ? `${routine.sleep_time} 入睡` : ''}
            color="purple"
          />
        </Link>
        <Link to="/routine">
          <StatCard
            icon="💧"
            label="饮水量"
            value={routine ? `${routine.water_cups} 杯` : '未记录'}
            sub={routine && routine.water_cups >= 8 ? '已达标' : '建议8杯/天'}
            color="blue"
          />
        </Link>
        <Link to="/diet">
          <StatCard
            icon="🍽️"
            label="饮食"
            value={`${diet_count} 餐`}
            sub={diet_count > 0 ? `健康均分 ${diet_healthy_avg}` : ''}
            color="primary"
          />
        </Link>
        <Link to="/exercise">
          <StatCard
            icon="🏃"
            label="运动"
            value={`${exercise_min} 分钟`}
            sub={`${exercise_count} 次记录`}
            color="warm"
          />
        </Link>
        <Link to="/mood">
          <StatCard
            icon={mood ? moodEmojis[mood.mood_score] || '😐' : '❓'}
            label="今日心情"
            value={mood ? `${mood.mood_score}/5` : '未记录'}
            sub={mood?.stress_level ? `压力 ${mood.stress_level}/5` : ''}
            color="rose"
          />
        </Link>
        <Link to="/habits">
          <StatCard
            icon="✅"
            label="习惯打卡"
            value={`${habit_checkins}/${habit_total}`}
            sub="今日完成"
            color="teal"
          />
        </Link>
      </div>

      {/* Screen time warning */}
      {routine && routine.screen_hours > 6 && (
        <div className="card bg-warm-50 border border-warm-200 flex items-center gap-2">
          <span>📱</span>
          <span className="text-sm text-warm-700">今日屏幕使用 {routine.screen_hours} 小时，注意让眼睛休息一下哦</span>
        </div>
      )}

      {/* Sleep debt warning */}
      {routine && routine.sleep_time && (
        (() => {
          const [h] = routine.sleep_time.split(':').map(Number)
          if (h >= 0 && h < 6) {
            return (
              <div className="card bg-rose-50 border border-rose-200 flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm text-rose-700">入睡时间偏晚，长期熬夜影响健康和学业状态</span>
              </div>
            )
          }
          return null
        })()
      )}

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">快捷记录</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/routine" className="btn-outline text-sm py-1.5 px-4">+ 作息</Link>
          <Link to="/diet" className="btn-outline text-sm py-1.5 px-4">+ 饮食</Link>
          <Link to="/exercise" className="btn-outline text-sm py-1.5 px-4">+ 运动</Link>
          <Link to="/mood" className="btn-outline text-sm py-1.5 px-4">+ 心情</Link>
        </div>
      </div>
    </div>
  )
}
