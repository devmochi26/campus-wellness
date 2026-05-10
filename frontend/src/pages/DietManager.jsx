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

const GOALS = ['养胃', '护眼', '减脂', '增肌', '经期', '熬夜修复']
const GOAL_ICONS = { '养胃': '🫖', '护眼': '👁️', '减脂': '💪', '增肌': '🏋️', '经期': '🌸', '熬夜修复': '🛡️' }

export default function DietManager() {
  const [tab, setTab] = useState('record')
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })

  // Plan tab
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [goal, setGoal] = useState('养胃')
  const [rec, setRec] = useState(null)
  const [summary, setSummary] = useState(null)

  const loadRecords = () => api.get(`/diet?date=${date}`).then(r => setRecords(r.data || [])).catch(() => {})
  useEffect(() => { loadRecords() }, [date])
  useEffect(() => {
    api.get('/nutrition/foods').then(r => { setFoods(r.data.foods || []); setCategories(r.data.categories || []) }).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/diet', { ...form, date })
    setForm({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id) => { await api.delete(`/diet/${id}`); loadRecords() }
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const searchFoods = (s = '', c = '') => {
    api.get(`/nutrition/foods?search=${s}&category=${c}`).then(r => setFoods(r.data.foods || [])).catch(() => {})
  }

  const getRecommendation = () => {
    api.get(`/nutrition/recommend?goal=${goal}`).then(r => setRec(r.data)).catch(() => {})
    api.get(`/nutrition/summary?date=${date}`).then(r => setSummary(r.data)).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🍽️ 饮食管理</h2>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[
          { key: 'record', label: '📝 记录饮食' },
          { key: 'plan', label: '🥗 健康方案' },
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

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {MEAL_TYPES.map(mt => {
              const meals = records.filter(r => r.meal_type === mt.key)
              return (
                <button key={mt.key} onClick={() => { setShowForm(true); set('meal_type', mt.key) }}
                  className={`card text-center py-2 px-1 ${showForm && form.meal_type === mt.key ? 'ring-2 ring-primary-300' : ''}`}>
                  <div className="text-lg">{mt.icon}</div>
                  <div className="text-xs text-gray-500">{mt.label}</div>
                  <div className="text-xs font-medium text-gray-700">{meals.length ? `${meals.length}项` : '-'}</div>
                </button>
              )
            })}
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="card space-y-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {MEAL_TYPES.map(mt => (
                  <button key={mt.key} type="button" onClick={() => set('meal_type', mt.key)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm ${form.meal_type === mt.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >{mt.icon} {mt.label}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(QUICK_FOODS[form.meal_type] || []).map(food => (
                  <button key={food} type="button" onClick={() => set('food_name', food)}
                    className={`px-2.5 py-1 rounded-lg text-xs ${form.food_name === food ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-600'}`}
                  >{food}</button>
                ))}
              </div>
              <input className="input-field" placeholder="食物名称" value={form.food_name} onChange={e => set('food_name', e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-500 block mb-1">热量 (千卡)</label><input type="number" className="input-field" value={form.calories} onChange={e => set('calories', parseInt(e.target.value) || 0)} /></div>
                <div><label className="text-sm text-gray-500 block mb-1">健康评分</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => set('healthy_score', n)}
                        className={`w-8 h-8 rounded-lg text-sm ${form.healthy_score >= n ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-300'}`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">添加</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-outline w-full">+ 记录饮食</button>
          )}

          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{MEAL_TYPES.find(m => m.key === r.meal_type)?.icon}</span>
                  <div><div className="text-sm font-medium text-gray-700">{r.food_name}</div><div className="text-xs text-gray-400">{r.calories > 0 ? `${r.calories} 千卡` : ''}{r.notes ? ` · ${r.notes}` : ''}</div></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.healthy_score >= 4 ? 'bg-green-100 text-green-600' : r.healthy_score >= 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>健康 {r.healthy_score}/5</span>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-gray-500">按需求选食谱</h3>
            <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2">
              {GOALS.map(g => (
                <button key={g} onClick={() => { setGoal(g); setRec(null) }}
                  className={`py-2 rounded-lg text-xs sm:text-sm ${goal === g ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600'}`}
                >{GOAL_ICONS[g]} {g}</button>
              ))}
            </div>
            <button onClick={getRecommendation} className="btn-primary w-full text-sm">查看{goal}方案</button>
            {rec && (
              <div className="bg-primary-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-primary-700">{rec.title}</h4>
                <ul className="space-y-1">{rec.tips?.map((tip, i) => <li key={i} className="text-xs text-primary-600 flex items-start gap-1"><span>•</span> {tip}</li>)}</ul>
                <div><div className="text-xs text-primary-500 mb-1">推荐食物</div><div className="flex flex-wrap gap-1">{rec.foods?.map(f => <span key={f} className="px-2 py-0.5 bg-white text-xs text-primary-600 rounded-full">{f}</span>)}</div></div>
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-gray-500">食堂菜品速查</h3>
            <div className="flex gap-2">
              <input className="input-field text-sm flex-1" placeholder="搜索菜品..." value={search} onChange={e => { setSearch(e.target.value); searchFoods(e.target.value, category) }} />
              <select className="input-field text-sm w-auto" value={category} onChange={e => { setCategory(e.target.value); searchFoods(search, e.target.value) }}>
                <option value="">全部分类</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {foods.map(f => (
                <div key={f.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50">
                  <div><div className="text-sm text-gray-700">{f.name}</div><div className="text-xs text-gray-400">{f.calories}千卡 · 蛋白{f.protein}g · 脂肪{f.fat}g · 碳水{f.carbs}g</div></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.healthy_score >= 4 ? 'bg-green-100 text-green-600' : f.healthy_score >= 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{f.healthy_score >= 4 ? '推荐' : f.healthy_score >= 3 ? '一般' : '少吃'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
