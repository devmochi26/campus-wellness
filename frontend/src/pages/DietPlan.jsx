import { useState, useEffect } from 'react'
import api from '../api'

const GOALS = ['养胃', '护眼', '减脂', '增肌', '经期', '熬夜修复']
const GOAL_ICONS = { '养胃': '🫖', '护眼': '👁️', '减脂': '💪', '增肌': '🏋️', '经期': '🌸', '熬夜修复': '🛡️' }

export default function DietPlan() {
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [goal, setGoal] = useState('养胃')
  const [rec, setRec] = useState(null)
  const [summary, setSummary] = useState(null)
  const [hasPlan, setHasPlan] = useState(false)

  useEffect(() => {
    searchFoods()
    api.get('/nutrition/meal-plans').then(r => { if (r.data?.plans?.length) setHasPlan(true) }).catch(() => {})
  }, [])

  const searchFoods = (s = '', c = '') => {
    api.get(`/nutrition/foods?search=${s}&category=${c}`).then(r => {
      setFoods(r.data.foods || [])
      setCategories(r.data.categories || [])
    }).catch(() => {})
  }

  const getRecommendation = () => {
    api.get(`/nutrition/recommend?goal=${goal}`).then(r => setRec(r.data)).catch(() => {})
    api.get(`/nutrition/summary?date=${new Date().toISOString().slice(0, 10)}`).then(r => setSummary(r.data)).catch(() => {})
  }

  const savePlan = () => {
    api.post(`/nutrition/meal-plans?goal=${goal}`).then(() => setHasPlan(true)).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🥗 校园健康饮食</h2>

      {/* Goal-based recommendations */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">按需求选食谱</h3>
        <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2">
          {GOALS.map(g => (
            <button key={g} onClick={() => { setGoal(g); setRec(null) }}
              className={`py-2 rounded-lg text-xs sm:text-sm transition-colors ${goal === g ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600'}`}
            >{GOAL_ICONS[g]} {g}</button>
          ))}
        </div>
        <button onClick={getRecommendation} className="btn-primary w-full text-sm">查看{goal}方案</button>

        {rec && (
          <div className="bg-primary-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-primary-700">{rec.title}</h4>
            <ul className="space-y-1">
              {rec.tips?.map((tip, i) => (
                <li key={i} className="text-xs text-primary-600 flex items-start gap-1">
                  <span>•</span> {tip}
                </li>
              ))}
            </ul>
            <div>
              <div className="text-xs text-primary-500 mb-1">推荐食物</div>
              <div className="flex flex-wrap gap-1">
                {rec.foods?.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-white text-xs text-primary-600 rounded-full">{f}</span>
                ))}
              </div>
            </div>
            <button onClick={savePlan} className="btn-outline w-full text-xs">
              {hasPlan ? '已保存方案' : '保存此方案'}
            </button>
          </div>
        )}
      </div>

      {/* Daily summary */}
      {summary && (
        <div className="card flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">今日摄入</div>
            <div className="text-lg font-bold text-gray-700">{summary.total_calories} <span className="text-sm font-normal text-gray-400">千卡</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400">餐次</div>
            <div className="text-lg font-bold text-gray-700">{summary.meals} <span className="text-sm font-normal text-gray-400">餐</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-400">健康均分</div>
            <div className="text-lg font-bold text-primary-600">{summary.avg_healthy}</div>
          </div>
        </div>
      )}

      {/* Food search */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">食堂菜品速查</h3>
        <div className="flex gap-2">
          <input className="input-field text-sm flex-1" placeholder="搜索菜品..."
            value={search} onChange={e => { setSearch(e.target.value); searchFoods(e.target.value, category) }} />
          <select className="input-field text-sm w-auto" value={category}
            onChange={e => { setCategory(e.target.value); searchFoods(search, e.target.value) }}>
            <option value="">全部分类</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1 max-h-80 overflow-y-auto">
          {foods.map(f => (
            <div key={f.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50">
              <div>
                <div className="text-sm text-gray-700">{f.name}</div>
                <div className="text-xs text-gray-400">
                  {f.calories}千卡 · 蛋白{f.protein}g · 脂肪{f.fat}g · 碳水{f.carbs}g
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  f.healthy_score >= 4 ? 'bg-green-100 text-green-600' : f.healthy_score >= 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                }`}>
                  {f.healthy_score >= 4 ? '推荐' : f.healthy_score >= 3 ? '一般' : '少吃'}
                </span>
                <div className="flex gap-0.5">
                  {(f.suitable_for || []).slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-primary-50 text-primary-600 px-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
