import { useState, useEffect } from 'react'
import api from '../api'

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

const QUICK_FOODS = {
  breakfast: ['鸡蛋', '牛奶', '面包', '包子', '豆浆', '油条', '燕麦', '水果'],
  lunch: ['米饭套餐', '面条', '饺子', '盖浇饭', '麻辣烫', '砂锅', '沙拉', '三明治'],
  dinner: ['粥', '炒菜', '汤面', '轻食', '馄饨', '蒸菜', '素食', '盖饭'],
  snack: ['水果', '酸奶', '坚果', '饼干', '面包', '牛奶', '蛋白棒', '果汁'],
}

export default function DietTracker() {
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })

  const loadRecords = () => {
    api.get(`/diet?date=${date}`).then((res) => setRecords(res.data || [])).catch(() => {})
  }

  useEffect(() => { loadRecords() }, [date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/diet', { ...form, date })
    setForm({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id) => {
    await api.delete(`/diet/${id}`)
    loadRecords()
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">🍽️ 饮食记录</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto text-sm" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map((mt) => {
          const meals = records.filter((r) => r.meal_type === mt.key)
          return (
            <div key={mt.key} className={`card text-center py-2 px-1 cursor-pointer ${showForm && form.meal_type === mt.key ? 'ring-2 ring-primary-300' : ''}`}
              onClick={() => { setShowForm(true); set('meal_type', mt.key) }}>
              <div className="text-lg">{mt.icon}</div>
              <div className="text-xs text-gray-500">{mt.label}</div>
              <div className="text-xs font-medium text-gray-700">{meals.length ? `${meals.length}项` : '未记'}</div>
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <div className="flex gap-2">
            {MEAL_TYPES.map((mt) => (
              <button key={mt.key} type="button"
                onClick={() => set('meal_type', mt.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  form.meal_type === mt.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >{mt.icon} {mt.label}</button>
            ))}
          </div>

          {/* Quick food picker */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">快捷选择</label>
            <div className="flex flex-wrap gap-1.5">
              {(QUICK_FOODS[form.meal_type] || []).map((food) => (
                <button key={food} type="button"
                  onClick={() => set('food_name', food)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    form.food_name === food ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
                    className={`w-8 h-8 rounded-lg text-sm ${
                      form.healthy_score >= n ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-300'
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
        <button onClick={() => setShowForm(true)} className="btn-outline w-full">+ 记录饮食</button>
      )}

      {/* Records list */}
      <div className="space-y-2">
        {records.map((r) => (
          <div key={r.id} className="card flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">{MEAL_TYPES.find((m) => m.key === r.meal_type)?.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-700">{r.food_name}</div>
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
              <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
