import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const ANSWER_OPTIONS = [
  { value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' },
]

export default function HealthAssessment() {
  const [tab, setTab] = useState('constitution')

  // Constitution
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentPage, setCurrentPage] = useState(0)
  const [result, setResult] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const perPage = 10

  // Stress
  const [stressQuestions, setStressQuestions] = useState([])
  const [stressAnswers, setStressAnswers] = useState({})
  const [stressResult, setStressResult] = useState(null)
  const [counseling, setCounseling] = useState(null)
  const [hospital, setHospital] = useState(null)
  const [breathing, setBreathing] = useState(null)
  const [activeBreath, setActiveBreath] = useState(null)
  const [breathPhase, setBreathPhase] = useState('')
  const [breathCountdown, setBreathCountdown] = useState(0)
  const [breathRound, setBreathRound] = useState(0)
  const breathRef = useRef(null)

  // Reset stress test when entering stress tab
  useEffect(() => {
    if (tab === 'stress') {
      setStressResult(null)
      setStressAnswers({})
    }
  }, [tab])

  useEffect(() => {
    api.get('/constitution/questions').then(res => { setQuestions(res.data.questions || []) }).finally(() => setLoading(false))
    api.get('/constitution/history').then(res => setHistory(res.data || [])).catch(() => {})
    api.get('/stress/assessment/questions').then(r => setStressQuestions(r.data.questions || [])).catch(() => {})
    api.get('/stress/counseling').then(r => setCounseling(r.data)).catch(() => {})
    api.get('/stress/hospital').then(r => setHospital(r.data)).catch(() => {})
    api.get('/stress/breathing').then(r => setBreathing(r.data.exercises || [])).catch(() => {})
  }, [])

  // Constitution handlers
  const setAnswer = (qId, value) => setAnswers(prev => ({ ...prev, [qId]: value }))
  const canSubmit = questions.length > 0 && questions.every(q => answers[q.id])
  const totalPages = Math.ceil(questions.length / perPage)

  const handleConstitutionSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const answersList = questions.map(q => answers[q.id])
      const res = await api.post('/constitution/submit', { answers: answersList })
      const adviceRes = await api.get(`/constitution/advice/${res.data.result_type}`)
      setResult(res.data)
      setAdvice(adviceRes.data)
      api.get('/constitution/history').then(r => setHistory(r.data || [])).catch(() => {})
    } finally { setSubmitting(false) }
  }

  const startOver = () => { setResult(null); setAdvice(null); setAnswers({}); setCurrentPage(0) }

  // Stress handlers
  const submitStressTest = async () => {
    if (stressQuestions.length === 0) return
    const ansList = stressQuestions.map(q => stressAnswers[q.id] || 3)
    const r = await api.post('/stress/assessment/submit', { answers: ansList })
    setStressResult(r.data)
  }

  const playChime = useCallback((freq = 528) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
      setTimeout(() => ctx.close(), 700)
    } catch (_) { /* audio not supported */ }
  }, [])

  const startBreathing = useCallback((exercise) => {
    // Clear any existing timer
    if (breathRef.current) clearInterval(breathRef.current)

    setActiveBreath(exercise)
    setBreathRound(0)
    setBreathPhase('inhale')
    setBreathCountdown(exercise.inhale)

    const phases = exercise.hold > 0
      ? [{ name: 'inhale', dur: exercise.inhale, label: '吸气', chime: 528 }]
         .concat([{ name: 'hold', dur: exercise.hold, label: '屏息', chime: 396 }])
         .concat([{ name: 'exhale', dur: exercise.exhale, label: '呼气', chime: 660 }])
      : [{ name: 'inhale', dur: exercise.inhale, label: '吸气', chime: 528 }]
         .concat([{ name: 'exhale', dur: exercise.exhale, label: '呼气', chime: 660 }])

    let phaseIdx = 0
    let countdown = exercise.inhale
    let round = 0

    setBreathPhase(phases[0].name)
    setBreathCountdown(countdown)
    playChime(phases[0].chime)

    breathRef.current = setInterval(() => {
      countdown--
      setBreathCountdown(countdown)

      if (countdown <= 0) {
        phaseIdx++
        if (phaseIdx >= phases.length) {
          // Next round
          round++
          phaseIdx = 0
          if (round >= exercise.rounds) {
            clearInterval(breathRef.current)
            breathRef.current = null
            setBreathPhase('done')
            setBreathCountdown(0)
            playChime(880)
            return
          }
          setBreathRound(round)
        }
        countdown = phases[phaseIdx].dur
        setBreathPhase(phases[phaseIdx].name)
        setBreathCountdown(countdown)
        playChime(phases[phaseIdx].chime)
      }
    }, 1000)
  }, [playChime])

  const stopBreathing = useCallback(() => {
    if (breathRef.current) { clearInterval(breathRef.current); breathRef.current = null }
    setActiveBreath(null)
    setBreathPhase('')
    setBreathCountdown(0)
    setBreathRound(0)
  }, [])
  const levelColor = (l) => l === 'low' ? 'text-green-600' : l === 'moderate' ? 'text-yellow-600' : 'text-red-600'

  const pageQuestions = questions.slice(currentPage * perPage, (currentPage + 1) * perPage)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin text-3xl">🌿</div></div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🔬 健康测评</h2>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[
          { key: 'constitution', label: '🔬 中医体质' },
          { key: 'stress', label: '🧘 压力管理' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'constitution' ? (
        <>
          {!result ? (
            <div className="space-y-3">
              <div className="card">
                <p className="text-sm text-gray-500 mb-3">共 {questions.length} 道题，根据近一年的体验和感觉回答。</p>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">{currentPage + 1} / {totalPages} 页</div>
              </div>

              {pageQuestions.map(q => (
                <div key={q.id} className="card">
                  <div className="text-sm text-gray-700 mb-2"><span className="text-gray-400 mr-1">{q.id}.</span>{q.text}</div>
                  <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-2">
                    {ANSWER_OPTIONS.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setAnswer(q.id, opt.value)}
                        className={`py-1.5 rounded-lg text-xs text-center ${answers[q.id] === opt.value ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-500'}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                {currentPage > 0 && <button onClick={() => setCurrentPage(p => p - 1)} className="btn-outline flex-1">上一页</button>}
                {currentPage < totalPages - 1 ? (
                  <button onClick={() => setCurrentPage(p => p + 1)} className="btn-primary flex-1">下一页</button>
                ) : (
                  <button onClick={handleConstitutionSubmit} disabled={!canSubmit || submitting} className="btn-primary flex-1">
                    {submitting ? '提交中...' : canSubmit ? '提交测评' : `还有 ${questions.filter(q => !answers[q.id]).length} 题未答`}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-xl font-bold text-primary-700">{result.result_type}</div>
                <div className="text-sm text-gray-400 mt-1">测评日期: {result.date}</div>
              </div>

              {advice && (
                <div className="card space-y-3">
                  <div><h3 className="text-sm font-medium text-gray-600 mb-1">体质概述</h3><p className="text-sm text-gray-600">{advice.description}</p></div>
                  <div><h3 className="text-sm font-medium text-gray-600 mb-1">养生建议</h3><ul className="text-sm text-gray-600 space-y-1">{advice.tips?.map((tip, i) => <li key={i} className="flex items-start gap-1"><span className="text-primary-500 mt-0.5">•</span> {tip}</li>)}</ul></div>
                  <div><h3 className="text-sm font-medium text-gray-600 mb-1">推荐食物</h3><ul className="text-sm text-gray-600 space-y-1">{advice.food?.map((f, i) => <li key={i} className="flex items-start gap-1"><span className="text-primary-500 mt-0.5">•</span> {f}</li>)}</ul></div>
                  <div><h3 className="text-sm font-medium text-gray-600 mb-1">运动建议</h3><p className="text-sm text-gray-600">{advice.exercise}</p></div>
                </div>
              )}

              <div className="card">
                <h3 className="text-sm font-medium text-gray-500 mb-3">9种体质得分</h3>
                <div className="space-y-2">
                  {Object.entries(result.scores || {}).map(([type, score]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className={`text-xs w-14 ${type === result.result_type ? 'font-bold text-primary-700' : 'text-gray-500'}`}>{type}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${type === result.result_type ? 'bg-primary-500' : 'bg-gray-300'}`} style={{ width: `${(score / 5) * 100}%` }} /></div>
                      <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {hospital && (
                <div className="card space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">🏥 校医院联系方式</h3>
                  <div className="text-sm text-gray-600"><strong>{hospital.name}</strong></div>
                  <div className="text-xs text-gray-400">📍 {hospital.address}</div>
                  <div className="text-xs text-gray-400">⏰ {hospital.hours}</div>
                  <ul className="space-y-1">{hospital.tips?.map((tip, i) => <li key={i} className="text-xs text-gray-500 flex items-start gap-1"><span className="text-primary-500">•</span> {tip}</li>)}</ul>
                </div>
              )}

              <button onClick={startOver} className="btn-outline w-full">重新测评</button>

              {history.length > 1 && (
                <div className="card"><h3 className="text-sm font-medium text-gray-500 mb-2">历史测评</h3>
                  <div className="space-y-1">{history.map((h, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{h.result_type}</span><span className="text-gray-400">{h.date}</span></div>)}</div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">📋 压力自测 (10题)</h3>
            {stressResult && (
              <button onClick={() => { setStressResult(null); setStressAnswers({}) }}
                className="text-xs text-primary-600 hover:underline">⟳ 重新测试</button>
            )}
          </div>

          {!stressResult ? (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">请根据过去一周的实际情况选择（1=从不 5=总是）</span>
                <button onClick={() => setStressAnswers({})} className="text-xs text-gray-400 hover:text-gray-600">清空重填</button>
              </div>
              {stressQuestions.map(q => (
                <div key={q.id} className="text-sm">
                  <div className="text-gray-600 mb-1">{q.id}. {q.text}</div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => setStressAnswers(a => ({ ...a, [q.id]: v }))}
                        className={`py-1 rounded-lg text-xs ${stressAnswers[q.id] === v ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-500'}`}
                      >{v}</button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={submitStressTest} className="btn-primary w-full">提交测评</button>
            </div>
          ) : (
            <div className="card space-y-3">
              <div className="text-center">
                <div className={`text-3xl font-bold ${levelColor(stressResult.level)}`}>{stressResult.score}/50</div>
                <div className={`text-lg font-medium ${levelColor(stressResult.level)}`}>{stressResult.level_text}</div>
                <div className="text-xs text-gray-400 mt-1">本次测评已完成，可在顶部点击"重新测试"</div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{stressResult.advice}</p>
              <button onClick={() => { setStressResult(null); setStressAnswers({}) }} className="btn-primary w-full">⟳ 重新测试</button>
            </div>
          )}

          <div className="card space-y-3">
            <h3 className="text-sm font-medium text-gray-500">🧘 呼吸训练</h3>
            {activeBreath ? (
              <div className="text-center space-y-4">
                {/* Progress */}
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: activeBreath.rounds }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < breathRound ? 'bg-primary-400' : i === breathRound ? 'bg-primary-600 scale-125' : 'bg-gray-200'}`} />
                  ))}
                </div>

                {/* Animated circle */}
                <div className="relative mx-auto w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle cx="60" cy="60" r="54" fill="none"
                      stroke={breathPhase === 'inhale' ? '#3b82f6' : breathPhase === 'hold' ? '#8b5cf6' : breathPhase === 'exhale' ? '#22c55e' : '#22c55e'}
                      strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={breathPhase === 'done' ? 0 : (2 * Math.PI * 54 * (1 - breathCountdown / (activeBreath[breathPhase === 'inhale' ? 'inhale' : breathPhase === 'hold' ? 'hold' : 'exhale'] || 1)))}
                      className="transition-all duration-1000 linear" />
                  </svg>
                  <div className={`absolute inset-0 flex items-center justify-center text-3xl transition-all duration-700 ${breathPhase === 'inhale' ? 'scale-110' : breathPhase === 'exhale' ? 'scale-95' : 'scale-100'}`}>
                    {breathPhase === 'inhale' ? '🫁' : breathPhase === 'hold' ? '🎯' : breathPhase === 'exhale' ? '💨' : breathPhase === 'done' ? '✅' : '🌿'}
                  </div>
                </div>

                {/* Phase + countdown */}
                <div>
                  <div className={`text-lg font-bold transition-colors ${breathPhase === 'inhale' ? 'text-blue-600' : breathPhase === 'hold' ? 'text-purple-600' : breathPhase === 'exhale' ? 'text-green-600' : breathPhase === 'done' ? 'text-primary-600' : 'text-gray-400'}`}>
                    {breathPhase === 'inhale' ? '吸 气' : breathPhase === 'hold' ? '屏 息' : breathPhase === 'exhale' ? '呼 气' : breathPhase === 'done' ? '训练完成！' : '准备'}
                  </div>
                  {breathPhase !== 'done' && (
                    <div className="text-3xl font-bold text-gray-700 mt-1">{breathCountdown}<span className="text-sm font-normal text-gray-400"> 秒</span></div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">第 {breathRound + 1}/{activeBreath.rounds} 轮</div>
                </div>

                <div className="flex gap-2 justify-center">
                  {breathPhase === 'done' ? (
                    <button onClick={() => startBreathing(activeBreath)} className="btn-primary">🔄 再来一次</button>
                  ) : (
                    <button onClick={stopBreathing} className="btn-outline text-sm px-6">⏹ 停止</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">选择一种呼吸法，跟随动画和音效进行训练</p>
                {breathing?.map(e => (
                  <div key={e.name} className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{e.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">吸 {e.inhale}s {e.hold ? `· 屏 ${e.hold}s ` : ''}· 呼 {e.exhale}s · 共 {e.rounds} 轮</div>
                      <div className="text-xs text-gray-400">{e.description}</div>
                    </div>
                    <button onClick={() => startBreathing(e)}
                      className="px-4 py-2 bg-primary-500 text-white text-xs rounded-xl hover:bg-primary-600 transition-colors shrink-0 ml-2">
                      ▶ 开始
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {counseling && (
            <div className="card space-y-2">
              <h3 className="text-sm font-medium text-gray-500">🆘 心理咨询</h3>
              <div className="text-sm text-gray-600"><strong>{counseling.name}</strong></div>
              <div className="text-xs text-gray-400">📍 {counseling.address}</div>
              <div className="text-xs text-gray-400">⏰ {counseling.hours}</div>
              <div className="text-xs text-gray-400">📞 本校热线：<span className="text-primary-600 font-medium">{counseling.phone}</span></div>
              <div className="text-xs text-gray-400">📞 全国热线：<span className="text-rose-600 font-medium">{counseling.national_hotline}</span></div>
              <ul className="space-y-1 mt-2">{counseling.tips?.map((tip, i) => <li key={i} className="text-xs text-gray-500 flex items-start gap-1"><span className="text-primary-500">•</span> {tip}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
