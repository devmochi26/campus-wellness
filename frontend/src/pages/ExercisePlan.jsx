import { useState } from 'react'
import api from '../api'

const PROGRAMS = [
  {
    id: 'neck_5min', title: '5分钟肩颈放松', icon: '💆', scene: '教室/图书馆', duration: 5, difficulty: 1, calories: 25,
    steps: [
      '坐直，双肩放松，缓慢将头向左侧倾斜，保持15秒 → 换右侧',
      '耸肩到最高点，保持3秒后突然放松，重复10次',
      '双手抱后脑勺，肘部向后扩展，保持10秒',
      '缓慢转动头部画圈，顺时针5次 → 逆时针5次',
      '双手交叉向上伸展，保持10秒，放下放松',
    ],
    tips: '每个动作配合深呼吸，不要憋气。适合久坐学习间隙。',
    target: '考研党/久坐党',
  },
  {
    id: 'core_10min', title: '10分钟腰腹训练', icon: '🏋️', scene: '宿舍', duration: 10, difficulty: 3, calories: 60,
    steps: [
      '平板支撑 30秒 → 休息10秒，重复3组',
      '仰卧卷腹 15次 → 休息15秒，重复3组',
      '俄罗斯转体（可用水瓶代替哑铃）20次',
      '仰卧交替抬腿 30秒',
      '侧平板左右各15秒 → 休息10秒',
      '拉伸放松：猫式伸展30秒',
    ],
    tips: '宿舍地面铺瑜伽垫或毯子即可。核心收紧，腰部不要塌。',
    target: '通用',
  },
  {
    id: 'stretch_15min', title: '15分钟全身拉伸', icon: '🧘', scene: '宿舍', duration: 15, difficulty: 2, calories: 40,
    steps: [
      '颈部拉伸（左右各15秒）',
      '肩部绕环（前后各10次）',
      '站立前屈摸脚尖，保持20秒',
      '弓步拉伸大腿前侧（左右各20秒）',
      '蝴蝶拉伸（脚底相对，膝盖下压）30秒',
      '坐姿体前屈，保持30秒',
      '婴儿式放松，保持1分钟',
      '深呼吸收尾：吸气4秒 → 屏息4秒 → 呼气6秒，重复5次',
    ],
    tips: '每个动作感受肌肉被温柔拉伸，不要弹震。适合睡前或运动后。',
    target: '通用',
  },
  {
    id: 'desk_yoga', title: '久坐缓解瑜伽', icon: '🪑', scene: '教室/图书馆', duration: 5, difficulty: 1, calories: 20,
    steps: [
      '坐姿侧伸展：右手扶椅面，左手过头向右侧弯，保持5个呼吸 → 换边',
      '坐姿扭转：身体向右扭转，左手扶右膝，右手扶椅背，保持5个呼吸 → 换边',
      '坐姿猫牛式：吸气挺胸抬头 → 呼气弓背收腹，重复5次',
      '脚踝旋转：抬起一条腿，踝关节顺时针逆时针各转10次 → 换边',
      '闭眼深呼吸10次',
    ],
    tips: '全程保持正常呼吸，动作和缓，不打扰周围同学。',
    target: '考研党/久坐党',
  },
  {
    id: 'posture_fix', title: '体态矫正练习', icon: '🚶', scene: '宿舍', duration: 10, difficulty: 2, calories: 30,
    steps: [
      '靠墙站立：后脑勺、肩胛骨、臀部、小腿、脚跟贴墙，保持2分钟',
      '弹力带拉开（没有弹力带可用毛巾代替）：双手握毛巾两端，向后拉至胸前，15次',
      '俯身飞鸟（可用水瓶）：弯腰45度，双手向两侧抬起，15次 × 2组',
      '下巴回收练习：靠墙站立，下巴向后收（做双下巴动作），保持5秒，10次',
      '超人式：俯卧，同时抬起双臂和双腿，保持3秒，10次',
    ],
    tips: '核心是要找到正确体态的感觉。每天10分钟，一个月明显改善圆肩驼背。',
    target: '考研党/久坐党',
  },
  {
    id: 'dorm_hiit', title: '宿舍燃脂HIIT', icon: '🔥', scene: '宿舍', duration: 10, difficulty: 4, calories: 100,
    steps: [
      '原地高抬腿 30秒 → 休息10秒',
      '开合跳 30秒 → 休息10秒',
      '深蹲 30秒 → 休息10秒',
      '登山者 30秒 → 休息10秒',
      '波比跳（简化版，不跳）30秒 → 休息10秒',
      '上述为一轮，共做2轮',
      '拉伸放松2分钟',
    ],
    tips: '穿运动鞋，注意不要打扰楼下。简化版波比跳省去跳跃，更安静。',
    target: '通用',
  },
]

const SCENES = ['全部', '宿舍', '教室/图书馆', '操场']

export default function ExercisePlan() {
  const [scene, setScene] = useState('全部')
  const [active, setActive] = useState(null)
  const [done, setDone] = useState({})

  const filtered = scene === '全部' ? PROGRAMS : PROGRAMS.filter(p => p.scene === scene)

  const complete = async (prog) => {
    const today = new Date()
    const ds = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    await api.post('/exercise', {
      date: ds,
      exercise_type: prog.title,
      duration_min: prog.duration,
      intensity: prog.difficulty,
      notes: `完成 ${prog.steps.length} 个动作 · ${prog.tips}`,
    })
    setDone(d => ({ ...d, [prog.id]: true }))
    setTimeout(() => setDone(d => ({ ...d, [prog.id]: false })), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🏃 轻量运动方案</h2>

      {/* Scene filter */}
      <div className="flex gap-1.5 sm:gap-2">
        {SCENES.map(s => (
          <button key={s} onClick={() => setScene(s)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm ${scene === s ? 'bg-warm-100 text-warm-700' : 'bg-gray-50 text-gray-500'}`}
          >{s}</button>
        ))}
      </div>

      {/* Programs */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-700">{p.title}</div>
                  <div className="text-xs text-gray-400">
                    {p.scene} · {p.duration}分钟 · 消耗约{p.calories}千卡
                    <span className="ml-2 text-warm-500">{p.target}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.difficulty <= 2 ? 'bg-green-100 text-green-600' : p.difficulty === 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                {p.difficulty <= 2 ? '轻松' : p.difficulty === 3 ? '中等' : '挑战'}
              </span>
            </div>

            {active === p.id ? (
              <div className="space-y-2">
                <ol className="space-y-1.5">
                  {p.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="font-bold text-warm-500 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="bg-warm-50 rounded-lg p-2 text-xs text-warm-700">
                  💡 {p.tips}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => complete(p)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${done[p.id] ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                    {done[p.id] ? '✓ 已完成' : `完成并记录 (${p.duration}min)`}
                  </button>
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
  )
}
