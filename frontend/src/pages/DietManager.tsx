import { useState, useEffect } from 'react'
import api from '../api'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', icon: '🌅', time: '6:00-9:00' },
  { key: 'lunch', label: '午餐', icon: '☀️', time: '11:00-13:00' },
  { key: 'dinner', label: '晚餐', icon: '🌙', time: '17:00-19:00' },
  { key: 'snack', label: '加餐', icon: '🍪', time: '随时' },
]

const QUICK_FOODS: Record<string, string[]> = {
  breakfast: ['鸡蛋', '牛奶', '面包', '包子', '豆浆', '油条', '燕麦', '水果'],
  lunch: ['米饭套餐', '面条', '饺子', '盖浇饭', '麻辣烫', '砂锅', '沙拉', '三明治'],
  dinner: ['粥', '炒菜', '汤面', '轻食', '馄饨', '蒸菜', '素食', '盖饭'],
  snack: ['水果', '酸奶', '坚果', '饼干', '面包', '牛奶', '蛋白棒', '果汁'],
}

const GOALS = ['养胃', '护眼', '减脂', '增肌', '经期', '熬夜修复']
const GOAL_ICONS: Record<string, string> = { '养胃': '🫖', '护眼': '👁️', '减脂': '💪', '增肌': '🏋️', '经期': '🌸', '熬夜修复': '🛡️' }

export default function DietManager() {
  const [tab, setTab] = useState('record')
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })
  const [visible, setVisible] = useState(false)

  const [foods, setFoods] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [goal, setGoal] = useState('养胃')
  const [rec, setRec] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const loadRecords = () => api.get(`/diet?date=${date}`).then(r => setRecords(r.data || [])).catch(() => {})
  useEffect(() => { loadRecords() }, [date])
  useEffect(() => {
    api.get('/nutrition/foods').then(r => {
      setFoods(r.data.foods || [])
      setCategories(r.data.categories || [])
      setRegions(r.data.regions || [])
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.food_name.trim()) return
    await api.post('/diet', { ...form, date })
    setForm({ meal_type: 'lunch', food_name: '', calories: 0, healthy_score: 3, notes: '' })
    setShowForm(false)
    loadRecords()
  }

  const handleDelete = async (id: number) => { await api.delete(`/diet/${id}`); loadRecords() }
  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const searchFoods = (s?: string, c?: string, r?: string) => {
    api.get(`/nutrition/foods?search=${s ?? search}&category=${c ?? category}&region=${r ?? region}`).then(res => {
      setFoods(res.data.foods || [])
    }).catch(() => {})
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchFoods()
  }

  const getRecommendation = () => {
    api.get(`/nutrition/recommend?goal=${goal}`).then(r => setRec(r.data)).catch(() => {})
    api.get(`/nutrition/summary?date=${date}`).then(r => setSummary(r.data)).catch(() => {})
  }

  const totalCal = records.reduce((s, r) => s + r.calories, 0)
  const avgHealthy = records.length > 0 ? Math.round(records.reduce((s, r) => s + r.healthy_score, 0) / records.length * 10) / 10 : 0

  return (
    <div className="space-y-4">
      <h2 className={`page-title transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        🍽️ 饮食管理
      </h2>

      <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {[
          { key: 'record', label: '📝 记录' },
          { key: 'plan', label: '🥗 方案' },
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
            {records.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>{records.length} 餐</span>
                <span className="text-gray-300">·</span>
                <span>{totalCal} 千卡</span>
                <span className="text-gray-300">·</span>
                <span>均分 {avgHealthy}</span>
              </div>
            )}
          </div>

          {/* 餐次选择卡片 */}
          <div className="grid grid-cols-4 gap-2">
            {MEAL_TYPES.map((mt, mi) => {
              const meals = records.filter(r => r.meal_type === mt.key)
              const isActive = showForm && form.meal_type === mt.key
              return (
                <button
                  key={mt.key}
                  onClick={() => { setShowForm(true); set('meal_type', mt.key) }}
                  className={`relative flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-200 animate-fade-in-up ${
                    isActive
                      ? 'bg-food-100 dark:bg-orange-500/20 ring-2 ring-food-400 dark:ring-orange-500/50 scale-105 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-food-200 dark:hover:border-orange-500/30 hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${mi * 60}ms` }}
                >
                  <span className="text-2xl">{mt.icon}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{mt.label}</span>
                  {meals.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-food-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {meals.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in-scale">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">记录{MEAL_TYPES.find(m => m.key === form.meal_type)?.label}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">✕</button>
              </div>

              <div className="flex gap-1.5">
                {MEAL_TYPES.map(mt => (
                  <button key={mt.key} type="button" onClick={() => set('meal_type', mt.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      form.meal_type === mt.key
                        ? 'bg-food-500 text-white shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >{mt.icon} {mt.label}</button>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 block mb-2">快捷选择</label>
                <div className="flex flex-wrap gap-1.5">
                  {(QUICK_FOODS[form.meal_type] || []).map(food => (
                    <button key={food} type="button" onClick={() => set('food_name', food)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        form.food_name === food
                          ? 'bg-food-500 text-white shadow-sm scale-105'
                          : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >{food}</button>
                  ))}
                </div>
              </div>

              <input className="input-field" placeholder="食物名称" value={form.food_name}
                onChange={e => set('food_name', e.target.value)} required autoFocus />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">热量 (千卡)</label>
                  <input type="number" className="input-field" value={form.calories || ''}
                    onChange={e => set('calories', parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 dark:text-gray-500 block mb-1.5">
                    健康评分: {['', '😟', '😐', '🙂', '😊', '😄'][form.healthy_score]}
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => set('healthy_score', n)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          form.healthy_score >= n
                            ? 'bg-food-100 dark:bg-orange-500/20 text-food-600 dark:text-orange-400'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${form.healthy_score === n ? 'ring-1 ring-food-300 dark:ring-orange-500/50 scale-105' : ''}`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea className="input-field" placeholder="备注（可选）" value={form.notes}
                onChange={e => set('notes', e.target.value)} rows={2} />

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">添加记录</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">取消</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-outline w-full animate-fade-in-up">
              + 记录饮食
            </button>
          )}

          {/* 记录列表 */}
          <div className="space-y-2">
            {records.map((r, ri) => {
              const meal = MEAL_TYPES.find(m => m.key === r.meal_type)
              const scoreEmoji = r.healthy_score >= 4 ? '😊' : r.healthy_score >= 2 ? '😐' : '😟'
              return (
                <div key={r.id} className="card flex items-center justify-between py-3 animate-fade-in-up" style={{ animationDelay: `${ri * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      r.healthy_score >= 4 ? 'bg-green-50 dark:bg-green-500/10' :
                      r.healthy_score >= 2 ? 'bg-yellow-50 dark:bg-yellow-500/10' :
                      'bg-red-50 dark:bg-red-500/10'
                    }`}>
                      {meal?.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.food_name}</span>
                        <span className="text-[10px] text-gray-400">{meal?.label}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.calories > 0 && <span className="text-xs text-gray-400">{r.calories}千卡</span>}
                        <span className="text-xs text-gray-400">{scoreEmoji} {r.healthy_score}/5</span>
                        {r.notes && <span className="text-xs text-gray-300 dark:text-gray-600 truncate max-w-[120px]">{r.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-lg leading-none px-1 transition-colors">✕</button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* 按需求选食谱 */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🎯 按需求选食谱</h3>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map(g => (
                <button key={g} onClick={() => { setGoal(g); setRec(null) }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 ${
                    goal === g
                      ? 'bg-food-500 text-white shadow-md scale-[1.03]'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{GOAL_ICONS[g]}</span>
                  <span className="text-xs font-medium">{g}</span>
                </button>
              ))}
            </div>
            <button onClick={getRecommendation} className="btn-primary w-full">
              查看「{goal}」方案
            </button>

            {rec && (
              <div className="bg-food-50 dark:bg-orange-500/10 rounded-xl p-4 space-y-3 animate-fade-in-scale">
                <h4 className="font-semibold text-food-700 dark:text-orange-300">{rec.title}</h4>
                <div className="space-y-2">
                  {rec.tips?.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-food-700 dark:text-orange-300/80">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-food-200 dark:bg-orange-500/20 text-food-700 dark:text-orange-400 text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </div>
                  ))}
                </div>
                {rec.foods?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-food-500 dark:text-orange-400 mb-2">推荐食物</div>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.foods.map((f: string) => (
                        <span key={f} className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm text-food-600 dark:text-orange-300 rounded-full shadow-sm">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 今日饮食小结 */}
          {summary && (
            <div className="card animate-fade-in-up">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">📊 今日饮食小结</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-food-50 dark:bg-orange-500/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-food-600 dark:text-orange-400">{summary.total_calories}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">总千卡</div>
                </div>
                <div className="bg-food-50 dark:bg-orange-500/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-food-600 dark:text-orange-400">{summary.meals}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">餐数</div>
                </div>
                <div className="bg-food-50 dark:bg-orange-500/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-food-600 dark:text-orange-400">{summary.avg_healthy}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">均分</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">{summary.recommendation}</p>
            </div>
          )}

          {/* 食堂菜品速查 */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">🔍 食堂菜品速查</h3>
            <div className="flex flex-wrap gap-2">
              <input
                className="input-field text-sm flex-1 min-w-[120px]"
                placeholder="搜索菜品..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <select className="input-field text-sm w-auto" value={category}
                onChange={e => { setCategory(e.target.value); searchFoods(search, e.target.value, region) }}>
                <option value="">全部分类</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input-field text-sm w-auto" value={region}
                onChange={e => { setRegion(e.target.value); searchFoods(search, category, e.target.value) }}>
                <option value="">全部地域</option>
                {regions.map(r => <option key={r} value={r}>{r === '北方' ? '🏔️ 北方' : r === '南方' ? '🌊 南方' : '🏫 通用'}</option>)}
              </select>
              <button onClick={() => searchFoods()} className="btn-primary text-sm px-4">搜索</button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-80 overflow-y-auto -mx-2 scroll-container">
              {foods.map((f, fi) => (
                <div key={f.id} className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${fi * 30}ms` }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{f.name}</span>
                      {f.region !== '通用' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          f.region === '北方' ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                          'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                        }`}>
                          {f.region === '北方' ? '🏔️ 北方' : '🌊 南方'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {f.calories}千卡 · 蛋白{f.protein}g · 脂肪{f.fat}g · 碳水{f.carbs}g
                    </div>
                  </div>
                  <span className={`shrink-0 ml-3 text-xs px-2.5 py-1 rounded-full font-medium ${
                    f.healthy_score >= 4 ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                    f.healthy_score >= 3 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {f.healthy_score >= 4 ? '推荐' : f.healthy_score >= 3 ? '一般' : '少吃'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
