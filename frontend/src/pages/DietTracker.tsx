import { useState, useEffect, type FormEvent } from 'react'
import api from '../api'
import type { DietRecord } from '../types'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', icon: '🌅' },
  { key: 'lunch', label: '午餐', icon: '☀️' },
  { key: 'dinner', label: '晚餐', icon: '🌙' },
  { key: 'snack', label: '加餐', icon: '🍪' },
]

const QUICK_FOODS: Record<string, string[]> = {
  breakfast: ['粥', '包子', '鸡蛋', '牛奶', '豆浆', '油条', '面包', '麦片'],
  lunch: ['米饭', '面条', '馒头', '饺子', '披萨', '汉堡', '沙拉', '炒菜'],
  dinner: ['米饭', '粥', '面条', '汤', '沙拉', '火锅', '烧烤', '日料'],
  snack: ['水果', '坚果', '酸奶', '饼干', '巧克力', '薯片', '蛋糕', '奶茶'],
}

export default function DietTracker() {
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState<DietRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'breakfast', food_name: '', calories: 0, healthy_score: 3, notes: '' })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const loadRecords = () => {
    api.get(`/diet?date=${date}`).then((res) => setRecords(res.data || [])).catch(() => {})
  }

  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/diet', { ...form, date })
    setForm({ meal_type: 'breakfast', food_name: '', calories: 0, healthy_score: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/diet/${id}`)
    loadRecords()
  }

  const set = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }))

  if (!visible) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">🍽️</div>
        <div className="text-gray-400 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">🍽️ 饮食记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      {/* 饮食汇总卡片 */}
      {records.length > 0 && (
        <div className={`card bg-gradient-to-r from-food-50 to-orange-50 flex items-center gap-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '150ms' }}>
          <span className="text-3xl">🍽️</span>
          <div>
            <div className="text-2xl font-bold text-food-700">{records.length}<span className="text-sm font-normal text-food-500"> 餐</span></div>
            <div className="text-xs text-food-400">{records.reduce((s, r) => s + r.calories, 0)} 千卡</div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-4 gap-1.5 sm:gap-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '250ms' }}>
        {MEAL_TYPES.map((mt) => {
          const meals = records.filter((r) => r.meal_type === mt.key)
          return (
            <div key={mt.key} className={`card text-center py-2 px-1 cursor-pointer transition-all duration-200 ${showForm && form.meal_type === mt.key ? 'ring-2 ring-primary-300 scale-105' : 'hover:scale-102'}`}
              onClick={() => { setShowForm(true); set('meal_type', mt.key) }}>
              <div className="text-lg">{mt.icon}</div>
              <div className="text-xs text-gray-500">{mt.label}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-200">{meals.length ? `${meals.length}项` : '未记'}</div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`card space-y-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`} style={{ transitionDelay: '400ms' }}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {MEAL_TYPES.map((mt) => (
              <button key={mt.key} type="button"
                onClick={() => set('meal_type', mt.key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                  form.meal_type === mt.key ? 'bg-primary-500 text-white scale-105' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-105'
                }`}
              >{mt.icon} {mt.label}</button>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">快捷选择</label>
            <div className="flex flex-wrap gap-1.5">
              {(QUICK_FOODS[form.meal_type] || []).map((food) => (
                <button key={food} type="button"
                  onClick={() => set('food_name', food)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
                    form.food_name === food ? 'bg-primary-100 text-primary-700 scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 hover:scale-105'
                  }`}
                >{food}</button>
              ))}
            </div>
          </div>

          <input className="input-field" placeholder="食物名称" value={form.food_name}
            onChange={(e) => set('food_name', e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 block mb-1">热量 (千卡)</label>
              <input type="number" className="input-field" value={form.calories}
                onChange={(e) => set('calories', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">健康评分</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    onClick={() => set('healthy_score', n)}
                    className={`w-8 h-8 rounded-lg text-sm transition-all duration-200 ${
                      form.healthy_score >= n ? 'bg-primary-100 text-primary-600 scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 hover:scale-105'
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
          </div>

          <textarea className="input-field" placeholder="备注（可选）" value={form.notes}
            onChange={(e) => set('notes', e.target.value)} rows={1} />

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">添加</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '550ms' }}>
          <button onClick={() => setShowForm(true)} className="btn-outline w-full hover-scale">+ 记录饮食</button>
        </div>
      )}

      <div className={`space-y-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '700ms' }}>
        {records.map((r, index) => (
          <div key={r.id} className={`card flex items-center justify-between py-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: `${700 + index * 150}ms` }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{MEAL_TYPES.find((m) => m.key === r.meal_type)?.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{r.food_name}</div>
                <div className="text-xs text-gray-400">
                  {r.calories > 0 ? `${r.calories} 千卡` : ''}
                  {r.notes ? ` · ${r.notes}` : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                r.healthy_score >= 4 ? 'bg-green-100 text-green-600' :
                r.healthy_score >= 2 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                健康 {r.healthy_score}/5
              </span>
              <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 text-sm transition-transform hover:scale-110">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
