import { useState, useEffect } from 'react'
import api from '../api'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EXERCISE_TYPES = [
  { key: '跑步', icon: '🏃' }, { key: '散步', icon: '🚶' }, { key: '健身', icon: '💪' }, { key: '瑜伽', icon: '🧘' }, { key: '球类', icon: '⚽' },
  { key: '游泳', icon: '🏊' }, { key: '骑行', icon: '🚴' }, { key: '舞蹈', icon: '💃' }, { key: '跳绳', icon: '🪢' }, { key: '武术', icon: '🥋' },
]

const PROGRAMS = [
  {
    id: 'neck_5min', title: '5分钟肩颈放松', icon: '💆', scene: '教室/图书馆', duration: 5, difficulty: 1, calories: 25,
    steps: ['坐直，缓慢将头向左侧倾斜，保持15秒 → 换右侧', '耸肩到最高点，保持3秒后放松，重复10次', '双手抱后脑勺，肘部向后扩展，保持10秒', '缓慢转动头部画圈，顺时针5次 → 逆时针5次', '双手交叉向上伸展，保持10秒，放下放松'],
    tips: '每个动作配合深呼吸，不要憋气。适合久坐学习间隙。',
  },
  {
    id: 'core_10min', title: '10分钟腰腹训练', icon: '🏋️', scene: '宿舍', duration: 10, difficulty: 3, calories: 60,
    steps: ['平板支撑 30秒 → 休息10秒，重复3组', '仰卧卷腹 15次 → 休息15秒，重复3组', '俄罗斯转体 20次', '仰卧交替抬腿 30秒', '侧平板左右各15秒', '拉伸放松30秒'],
    tips: '宿舍地面铺瑜伽垫或毯子即可。核心收紧，腰部不要塌。',
  },
  {
    id: 'stretch_15min', title: '15分钟全身拉伸', icon: '🧘', scene: '宿舍', duration: 15, difficulty: 2, calories: 40,
    steps: ['颈部拉伸（左右各15秒）', '肩部绕环（前后各10次）', '站立前屈摸脚尖，保持20秒', '弓步拉伸大腿前侧（左右各20秒）', '蝴蝶拉伸30秒', '坐姿体前屈30秒', '婴儿式放松1分钟', '深呼吸收尾5次'],
    tips: '每个动作感受肌肉被温柔拉伸，不要弹震。适合睡前或运动后。',
  },
  {
    id: 'desk_yoga', title: '久坐缓解瑜伽', icon: '🪑', scene: '教室/图书馆', duration: 5, difficulty: 1, calories: 20,
    steps: ['坐姿侧伸展：左右各5个呼吸', '坐姿扭转：左右各5个呼吸', '坐姿猫牛式：重复5次', '脚踝旋转：左右各10次', '闭眼深呼吸10次'],
    tips: '全程保持正常呼吸，动作和缓，不打扰周围同学。',
  },
  {
    id: 'posture_fix', title: '体态矫正练习', icon: '🚶', scene: '宿舍', duration: 10, difficulty: 2, calories: 30,
    steps: ['靠墙站立2分钟（后脑勺、肩胛骨、臀部、小腿、脚跟贴墙）', '毛巾拉背15次', '俯身飞鸟（用水瓶）15次×2组', '下巴回收练习10次', '超人式10次'],
    tips: '每天10分钟，一个月明显改善圆肩驼背。',
  },
  {
    id: 'dorm_hiit', title: '宿舍燃脂HIIT', icon: '🔥', scene: '宿舍', duration: 10, difficulty: 4, calories: 100,
    steps: ['原地高抬腿30秒 → 休息10秒', '开合跳30秒 → 休息10秒', '深蹲30秒 → 休息10秒', '登山者30秒 → 休息10秒', '波比跳(简化版)30秒 → 休息10秒', '以上一轮，共2轮', '拉伸放松2分钟'],
    tips: '穿运动鞋，简化版波比跳省去跳跃，更安静。',
  },
  {
    id: 'playground_run', title: '操场有氧跑步', icon: '🏃', scene: '操场', duration: 20, difficulty: 2, calories: 150,
    steps: ['热身：慢走2分钟 + 动态拉伸（高抬腿、后踢腿、侧向移动）3分钟', '慢跑：保持能正常说话的配速，跑8-10分钟', '快走恢复：快走2分钟调整呼吸', '间歇加速：冲刺30秒 → 慢走30秒，重复4组', '放松：慢走3分钟 + 静态拉伸（小腿、大腿前后侧、髋部）5分钟'],
    tips: '初学者可从快走开始，逐渐过渡到慢跑。塑胶跑道对膝盖更友好。跑前跑后都要拉伸。',
  },
  {
    id: 'playground_jump', title: '操场跳绳燃脂', icon: '🪢', scene: '操场', duration: 15, difficulty: 3, calories: 130,
    steps: ['热身：踝关节环绕 + 膝关节屈伸 + 肩部绕环，各30秒', '基础跳绳：双脚并拢跳 1分钟 × 3组，组间休息30秒', '交替脚跳绳：左右脚交替 1分钟 × 3组，组间休息30秒', '高抬腿跳绳：膝盖抬高 30秒 × 2组，组间休息20秒', '放松：慢走2分钟 + 小腿及跟腱拉伸'],
    tips: '穿缓冲好的运动鞋，在塑胶跑道或平整地面跳。核心收紧，用前脚掌着地。',
  },
  {
    id: 'playground_walk', title: '操场快走放松', icon: '🚶', scene: '操场', duration: 15, difficulty: 1, calories: 60,
    steps: ['慢走热身3分钟，逐步加快步伐', '快走8分钟：保持微微出汗的步速，摆臂自然', '倒退走1分钟（注意后方安全），激活后侧肌群', '侧向走左右各1分钟，活动髋关节', '放松慢走2分钟 + 深呼吸'],
    tips: '饭后半小时进行效果最佳。快走时身体微微前倾，步幅比平时稍大。是轻度运动的首选。',
  },
]

const SCENES = ['全部', '宿舍', '教室/图书馆', '操场']

export default function ExerciseManager() {
  const [tab, setTab] = useState('record')
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })

  // Plan tab
  const [scene, setScene] = useState('全部')
  const [active, setActive] = useState(null)
  const [done, setDone] = useState({})

  const loadRecords = () => api.get(`/exercise?date=${date}`).then(r => setRecords(r.data || [])).catch(() => {})
  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/exercise', { ...form, date })
    setForm({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id) => { await api.delete(`/exercise/${id}`); loadRecords() }
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const totalMin = records.reduce((s, r) => s + r.duration_min, 0)

  const complete = async (prog) => {
    const ds = today()
    await api.post('/exercise', { date: ds, exercise_type: prog.title, duration_min: prog.duration, intensity: prog.difficulty, notes: `完成 ${prog.steps.length} 个动作` })
    setDone(d => ({ ...d, [prog.id]: true }))
    setTimeout(() => setDone(d => ({ ...d, [prog.id]: false })), 2000)
    loadRecords()
  }

  const filtered = scene === '全部' ? PROGRAMS : PROGRAMS.filter(p => p.scene === scene)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🏃 运动管理</h2>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[
          { key: 'record', label: '📝 记录运动' },
          { key: 'plan', label: '🎯 运动方案' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'record' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto text-sm" />
          </div>

          <div className="card bg-gradient-to-r from-warm-50 to-orange-50 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div><div className="text-2xl font-bold text-warm-700">{totalMin}<span className="text-sm font-normal text-warm-500"> 分钟</span></div><div className="text-xs text-warm-400">今日运动时长</div></div>
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="card space-y-3">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {EXERCISE_TYPES.map(et => (
                  <button key={et.key} type="button" onClick={() => set('exercise_type', et.key)}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs ${form.exercise_type === et.key ? 'bg-warm-100 text-warm-700 ring-1 ring-warm-300' : 'bg-gray-50 text-gray-500'}`}
                  ><span className="text-lg">{et.icon}</span>{et.key}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-500 block mb-1">时长(分钟)</label><input type="number" className="input-field" value={form.duration_min} onChange={e => set('duration_min', parseInt(e.target.value) || 0)} /></div>
                <div><label className="text-sm text-gray-500 block mb-1">强度</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => set('intensity', n)} className={`w-8 h-8 rounded-lg text-sm ${form.intensity >= n ? 'bg-warm-100 text-warm-600' : 'bg-gray-50 text-gray-300'}`}>{n}</button>)}
                  </div>
                </div>
              </div>
              <textarea className="input-field" placeholder="备注（可选）" value={form.notes} onChange={e => set('notes', e.target.value)} rows={1} />
              <div className="flex gap-2"><button type="submit" className="btn-primary flex-1">添加</button><button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button></div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-outline w-full">+ 记录运动</button>
          )}

          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{EXERCISE_TYPES.find(e => e.key === r.exercise_type)?.icon || '🏃'}</span>
                  <div><div className="text-sm font-medium text-gray-700">{r.exercise_type}</div><div className="text-xs text-gray-400">{r.duration_min} 分钟 · 强度 {r.intensity}/5{r.notes ? ` · ${r.notes}` : ''}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-warm-600">{r.duration_min} min</span>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1.5">
            {SCENES.map(s => (
              <button key={s} onClick={() => setScene(s)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${scene === s ? 'bg-warm-100 text-warm-700' : 'bg-gray-50 text-gray-500'}`}
              >{s}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    <div><div className="text-sm font-medium text-gray-700">{p.title}</div><div className="text-xs text-gray-400">{p.scene} · {p.duration}分钟 · 消耗约{p.calories}千卡</div></div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.difficulty <= 2 ? 'bg-green-100 text-green-600' : p.difficulty === 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{p.difficulty <= 2 ? '轻松' : p.difficulty === 3 ? '中等' : '挑战'}</span>
                </div>
                {active === p.id ? (
                  <div className="space-y-2">
                    <ol className="space-y-1.5">{p.steps.map((step, i) => <li key={i} className="flex items-start gap-2 text-xs text-gray-600"><span className="font-bold text-warm-500 mt-0.5">{i + 1}.</span>{step}</li>)}</ol>
                    <div className="bg-warm-50 rounded-lg p-2 text-xs text-warm-700">💡 {p.tips}</div>
                    <div className="flex gap-2">
                      <button onClick={() => complete(p)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${done[p.id] ? 'bg-green-500 text-white' : 'btn-primary'}`}>{done[p.id] ? '✓ 已完成' : `完成并记录 (${p.duration}min)`}</button>
                      <button onClick={() => setActive(null)} className="btn-outline text-sm">收起</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setActive(p.id)} className="btn-outline w-full text-xs">查看动作</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
