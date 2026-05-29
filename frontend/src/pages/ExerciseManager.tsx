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

const INTENSITY_EMOJIS = ['', '🟢', '🟡', '🟠', '🔴', '🔥']
const INTENSITY_LABELS = ['', '很轻', '轻度', '适中', '较累', '极限']

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
    steps: ['热身：慢走2分钟 + 动态拉伸3分钟', '慢跑：保持正常说话配速，跑8-10分钟', '快走恢复：快走2分钟调整呼吸', '间歇加速：冲刺30秒 → 慢走30秒 ×4组', '放松：慢走3分钟 + 静态拉伸5分钟'],
    tips: '初学者可从快走开始。塑胶跑道对膝盖更友好。跑前跑后都要拉伸。',
  },
  {
    id: 'playground_jump', title: '操场跳绳燃脂', icon: '🪢', scene: '操场', duration: 15, difficulty: 3, calories: 130,
    steps: ['热身：踝关节环绕 + 膝关节屈伸 + 肩部绕环，各30秒', '基础跳绳：双脚并拢 ×3组，组间休息30秒', '交替脚跳绳：左右脚交替 ×3组，组间休息30秒', '高抬腿跳绳：膝盖抬高 ×2组，组间休息20秒', '放松：慢走2分钟 + 小腿及跟腱拉伸'],
    tips: '穿缓冲好的运动鞋，在平整地面跳。核心收紧，用前脚掌着地。',
  },
  {
    id: 'playground_walk', title: '操场快走放松', icon: '🚶', scene: '操场', duration: 15, difficulty: 1, calories: 60,
    steps: ['慢走热身3分钟，逐步加快步伐', '快走8分钟：微微出汗的步速，摆臂自然', '倒退走1分钟（注意安全），激活后侧肌群', '侧向走左右各1分钟，活动髋关节', '放松慢走2分钟 + 深呼吸'],
    tips: '饭后半小时进行效果最佳。快走时身体微微前倾，步幅比平时稍大。',
  },
]

const SCENES = ['全部', '宿舍', '教室/图书馆', '操场']
const SCENE_ICONS: Record<string, string> = { '全部': '📋', '宿舍': '🏠', '教室/图书馆': '📚', '操场': '🏟️' }

const VENUE_TYPES: Record<string, { icon: string; label: string }> = {
  playground: { icon: '🏟️', label: '操场' },
  court: { icon: '🏀', label: '球场' },
  pool: { icon: '🏊', label: '游泳馆' },
  gym: { icon: '🏋️', label: '健身房' },
  track: { icon: '🏃', label: '跑道' },
  dance: { icon: '💃', label: '舞蹈室' },
  other: { icon: '📍', label: '其他' },
}

const PRESET_VENUES = [
  { name: '田径场', type: 'playground', location: '校园东区', desc: '400米标准跑道，适合跑步、散步', sports: ['跑步', '散步', '跳绳'] },
  { name: '篮球场', type: 'court', location: '宿舍区旁', desc: '6个全场，晚上有灯光', sports: ['球类'] },
  { name: '羽毛球馆', type: 'court', location: '体育馆1楼', desc: '室内场地，需预约', sports: ['球类'] },
  { name: '游泳池', type: 'pool', location: '体育馆B1', desc: '标准50米泳道，夏季开放', sports: ['游泳'] },
  { name: '健身房', type: 'gym', location: '学生活动中心2楼', desc: '器械齐全，学生卡免费', sports: ['健身'] },
  { name: '瑜伽室', type: 'dance', location: '体育馆3楼', desc: '提供瑜伽垫，有镜面墙', sports: ['瑜伽'] },
  { name: '乒乓球室', type: 'court', location: '宿舍楼B1', desc: '免费使用，球拍自备', sports: ['球类'] },
  { name: '网球场', type: 'court', location: '校园西区', desc: '2个场地，需预约', sports: ['球类', '跑步'] },
]

export default function ExerciseManager() {
  const [tab, setTab] = useState('record')

  // Venues state
  const [venues, setVenues] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('cw_venues') || '[]') } catch { return [] }
  })
  const [venueFilter, setVenueFilter] = useState('')
  const [showVenueForm, setShowVenueForm] = useState(false)
  const [newVenue, setNewVenue] = useState({ name: '', type: 'playground', location: '', desc: '' })
  const [surroundings, setSurroundings] = useState('')
  const [venueSuggestion, setVenueSuggestion] = useState('')

  useEffect(() => { localStorage.setItem('cw_venues', JSON.stringify(venues)) }, [venues])

  const addVenue = () => {
    if (!newVenue.name.trim()) return
    setVenues(v => [...v, { ...newVenue, id: Date.now() }])
    setNewVenue({ name: '', type: 'playground', location: '', desc: '' })
    setShowVenueForm(false)
  }

  const removeVenue = (id: number) => setVenues(v => v.filter(x => x.id !== id))

  const analyzeSurroundings = () => {
    const s = surroundings.toLowerCase()
    const rules: [string[], string][] = [
      [['跑道', '跑道线', '塑胶', '草坪', '足球门'], '你可能在操场附近，适合跑步🏃、散步🚶、跳绳🪢'],
      [['篮球架', '篮筐', '篮球'], '你附近有篮球场🏀，适合打球'],
      [['泳池', '水道', '更衣室', '淋浴'], '你附近有游泳池🏊，适合游泳'],
      [['器械', '哑铃', '杠铃', '跑步机', '椭圆机'], '你附近有健身房🏋️，适合力量训练'],
      [['镜子', '把杆', '瑜伽垫', '音响'], '你附近有舞蹈室/瑜伽室💃🧘'],
      [['球网', '羽毛球', '乒乓球', '网球'], '你附近有球类运动场，适合球类运动⚽'],
      [['空地', '广场', '水泥地', '停车场'], '你附近有空旷场地，适合跳绳🪢、武术🥋'],
      [['楼梯', '台阶', '坡道'], '你附近可以利用楼梯做爬楼训练🏃'],
    ]
    for (const [keywords, suggestion] of rules) {
      if (keywords.some(k => s.includes(k))) {
        setVenueSuggestion(suggestion)
        return
      }
    }
    setVenueSuggestion('未识别到特定运动场所。你可以描述看到的地面材质、设施、空间大小，获得更准确的运动建议。')
  }

  const allVenues = [...PRESET_VENUES, ...venues]
  const filteredVenues = venueFilter ? allVenues.filter(v => v.type === venueFilter) : allVenues
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
  const [visible, setVisible] = useState(false)

  const [scene, setScene] = useState('全部')
  const [active, setActive] = useState<any>(null)
  const [done, setDone] = useState<Record<string, any>>({})

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const loadRecords = () => api.get(`/exercise?date=${date}`).then(r => setRecords(r.data || [])).catch(() => {})
  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/exercise', { ...form, date })
    setForm({ exercise_type: '跑步', duration_min: 30, intensity: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id: number) => { await api.delete(`/exercise/${id}`); loadRecords() }
  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))
  const totalMin = records.reduce((s, r) => s + r.duration_min, 0)
  const totalCal = records.reduce((s, r) => s + (r.intensity || 3) * r.duration_min * 3, 0)

  const complete = async (prog: any) => {
    const ds = today()
    await api.post('/exercise', { date: ds, exercise_type: prog.title, duration_min: prog.duration, intensity: prog.difficulty, notes: `完成 ${prog.steps.length} 个动作` })
    setDone(d => ({ ...d, [prog.id]: true }))
    setTimeout(() => setDone(d => ({ ...d, [prog.id]: false })), 2500)
    loadRecords()
  }

  const filtered = scene === '全部' ? PROGRAMS : PROGRAMS.filter(p => p.scene === scene)

  return (
    <div className="space-y-4">
      <h2 className={`page-title transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        🏃 运动管理
      </h2>

      <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {[
          { key: 'record', label: '📝 记录' },
          { key: 'plan', label: '🎯 方案' },
          { key: 'venues', label: '🏟️ 场所' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'tab-active shadow-sm' : 'text-gray-500'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'record' ? (
        <div className="space-y-4">
          {/* 日期 + 汇总 */}
          <div className="flex items-center justify-between">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto text-sm" />
          </div>

          <div className={`card bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center gap-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-2xl">🔥</div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-warm-700 dark:text-amber-400">{totalMin}</div>
                <div className="text-[11px] text-warm-500 dark:text-amber-500/70">分钟</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-warm-700 dark:text-amber-400">{records.length}</div>
                <div className="text-[11px] text-warm-500 dark:text-amber-500/70">次记录</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-warm-700 dark:text-amber-400">{totalCal}</div>
                <div className="text-[11px] text-warm-500 dark:text-amber-500/70">千卡</div>
              </div>
            </div>
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in-scale">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">记录运动</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
              </div>

              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">运动类型</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {EXERCISE_TYPES.map(et => (
                    <button key={et.key} type="button" onClick={() => set('exercise_type', et.key)}
                      className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                        form.exercise_type === et.key
                          ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400 ring-1 ring-warm-300 dark:ring-amber-500/50 scale-105 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    ><span className="text-lg">{et.icon}</span>{et.key}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">时长 (分钟)</label>
                  <input type="number" className="input-field" value={form.duration_min} onChange={e => set('duration_min', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">
                    强度: {INTENSITY_EMOJIS[form.intensity]} {INTENSITY_LABELS[form.intensity]}
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => set('intensity', n)}
                        className={`flex-1 h-10 rounded-lg text-sm transition-all duration-200 ${
                          form.intensity >= n
                            ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-600 dark:text-amber-400'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${form.intensity === n ? 'ring-1 ring-warm-300 dark:ring-amber-500/50 scale-105' : ''}`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea className="input-field" placeholder="备注（可选）" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">添加记录</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-outline w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>+ 记录运动</button>
          )}

          <div className="space-y-2">
            {records.map((r, i) => (
              <div key={r.id} className="card flex items-center justify-between py-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warm-50 dark:bg-amber-500/10 flex items-center justify-center text-lg">
                    {EXERCISE_TYPES.find(e => e.key === r.exercise_type)?.icon || '🏃'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.exercise_type}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {r.duration_min} 分钟 · 强度 {r.intensity}/5
                      {r.notes && <span className="ml-1 text-gray-300 dark:text-gray-600">· {r.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{r.duration_min} min</span>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg leading-none px-1 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'plan' ? (
        <div className="space-y-4">
          <div className="flex gap-1.5">
            {SCENES.map(s => (
              <button key={s} onClick={() => setScene(s)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  scene === s
                    ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{SCENE_ICONS[s]}</span> {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((p, pi) => (
              <div key={p.id} className="card animate-fade-in-up" style={{ animationDelay: `${pi * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-warm-50 dark:bg-amber-500/10 flex items-center justify-center text-xl">
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{p.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{p.scene}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{p.duration}min</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">≈{p.calories}千卡</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.difficulty <= 2
                      ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                      : p.difficulty === 3
                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {p.difficulty <= 2 ? '轻松' : p.difficulty === 3 ? '中等' : '挑战'}
                  </span>
                </div>

                {active === p.id ? (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                    <div className="space-y-2">
                      {p.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-warm-50 dark:bg-amber-500/10 rounded-xl p-3 text-sm text-warm-700 dark:text-amber-300 flex items-start gap-2">
                      <span>💡</span>
                      <span>{p.tips}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => complete(p)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          done[p.id]
                            ? 'bg-green-500 text-white scale-[1.02]'
                            : 'bg-warm-500 hover:bg-warm-600 text-white shadow-sm'
                        }`}
                      >
                        {done[p.id] ? '✓ 已完成' : `完成并记录 (${p.duration}min)`}
                      </button>
                      <button onClick={() => setActive(null)} className="btn-outline text-sm">收起</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setActive(p.id)} className="btn-outline w-full text-xs mt-3">查看动作详情</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ===== 运动场所 Tab ===== */
        <div className="space-y-4 animate-fade-in">
          {/* 智能识别 */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🤖 智能识别运动场所</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">描述你周围的环境，帮你判断适合做什么运动</p>
            <textarea
              className="input-field"
              rows={2}
              placeholder="例如：我看到前面有红色塑胶跑道和足球门..."
              value={surroundings}
              onChange={e => setSurroundings(e.target.value)}
            />
            <button onClick={analyzeSurroundings} className="btn-primary w-full text-sm" disabled={!surroundings.trim()}>
              识别运动场所
            </button>
            {venueSuggestion && (
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 animate-fade-in-scale">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span className="text-sm text-warm-700 dark:text-amber-300 leading-relaxed">{venueSuggestion}</span>
                </div>
              </div>
            )}
          </div>

          {/* 场所列表 */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">📍 校内运动场所</h3>
            <button onClick={() => setShowVenueForm(!showVenueForm)} className="text-xs text-warm-600 dark:text-amber-400 hover:underline">
              {showVenueForm ? '取消' : '+ 添加场所'}
            </button>
          </div>

          {/* 分类筛选 */}
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setVenueFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                !venueFilter ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500'
              }`}>全部</button>
            {Object.entries(VENUE_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setVenueFilter(k)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  venueFilter === k ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500'
                }`}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {showVenueForm && (
            <div className="card space-y-3 animate-fade-in-scale">
              <input className="input-field text-sm" placeholder="场所名称" value={newVenue.name}
                onChange={e => setNewVenue(v => ({ ...v, name: e.target.value }))} autoFocus />
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(VENUE_TYPES).map(([k, v]) => (
                  <button key={k} onClick={() => setNewVenue(x => ({ ...x, type: k }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                      newVenue.type === k
                        ? 'bg-warm-100 dark:bg-amber-500/20 text-warm-700 dark:text-amber-400 ring-1 ring-warm-300'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500'
                    }`}
                  >{v.icon} {v.label}</button>
                ))}
              </div>
              <input className="input-field text-sm" placeholder="位置描述" value={newVenue.location}
                onChange={e => setNewVenue(v => ({ ...v, location: e.target.value }))} />
              <input className="input-field text-sm" placeholder="详细说明（可选）" value={newVenue.desc}
                onChange={e => setNewVenue(v => ({ ...v, desc: e.target.value }))} />
              <button onClick={addVenue} className="btn-primary w-full text-sm">添加场所</button>
            </div>
          )}

          <div className="space-y-2">
            {filteredVenues.map((v, vi) => {
              const vt = VENUE_TYPES[v.type] || VENUE_TYPES.other
              const isCustom = !PRESET_VENUES.find(p => p.name === v.name)
              return (
                <div key={v.id || v.name} className="card animate-fade-in-up" style={{ animationDelay: `${vi * 50}ms` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-warm-50 dark:bg-amber-500/10 flex items-center justify-center text-xl shrink-0">
                        {vt.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{v.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warm-50 dark:bg-amber-500/10 text-warm-600 dark:text-amber-400">{vt.label}</span>
                          {isCustom && <span className="text-[10px] text-gray-400">自定义</span>}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">📍 {v.location}</div>
                        {v.desc && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{v.desc}</div>}
                        {v.sports && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {v.sports.map((s: string) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {isCustom && (
                      <button onClick={() => removeVenue(v.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-sm shrink-0 ml-2">✕</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
