import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'

const ANSWER_OPTIONS = [
  { value: 1, label: '没有' }, { value: 2, label: '很少' }, { value: 3, label: '有时' }, { value: 4, label: '经常' }, { value: 5, label: '总是' },
]

export default function HealthAssessment() {
  const [tab, setTab] = useState('constitution')

  // Constitution
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [advice, setAdvice] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const perPage = 10

  // Stress
  const [stressQuestions, setStressQuestions] = useState<any[]>([])
  const [stressAnswers, setStressAnswers] = useState<Record<string, any>>({})
  const [stressResult, setStressResult] = useState<any>(null)
  const [counseling, setCounseling] = useState<any>(null)
  const [hospital, setHospital] = useState<any>(null)
  const [breathing, setBreathing] = useState<any>(null)
  const [activeBreath, setActiveBreath] = useState<any>(null)
  const [breathPhase, setBreathPhase] = useState('')
  const [breathCountdown, setBreathCountdown] = useState(0)
  const [breathRound, setBreathRound] = useState(0)
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
  const setAnswer = (qId: number, value: number) => setAnswers(prev => ({ ...prev, [qId]: value }))
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
      const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)()
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

  const startBreathing = useCallback((exercise: any) => {
    // Clear any existing timer
    if (breathRef.current) clearInterval(breathRef.current!)

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
            clearInterval(breathRef.current!)
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
    if (breathRef.current) { clearInterval(breathRef.current!); breathRef.current = null }
    setActiveBreath(null)
    setBreathPhase('')
    setBreathCountdown(0)
    setBreathRound(0)
  }, [])
  const levelColor = (l: string) => l === 'low' ? 'text-green-600' : l === 'moderate' ? 'text-yellow-600' : 'text-red-600'

  const pageQuestions = questions.slice(currentPage * perPage, (currentPage + 1) * perPage)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin text-3xl">🌿</div></div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">🔬 健康测评</h2>

      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
        {[
          { key: 'constitution', label: '🔬 中医体质' },
          { key: 'stress', label: '🧘 压力管理' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'tab-active shadow-sm' : 'text-gray-500'}`}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'constitution' ? (
        <>
          {!result ? (
            <div className="space-y-3">
              {/* 进度卡片 */}
              <div className="card">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">共 {questions.length} 道题，根据近一年的体验和感觉回答。</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400 shrink-0">
                    {currentPage + 1}/{totalPages}
                  </span>
                </div>
              </div>

              {/* 题目卡片 */}
              {pageQuestions.map((q, qi) => (
                <div
                  key={q.id}
                  className="card animate-fade-in-up"
                  style={{ animationDelay: `${qi * 80}ms` }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 text-xs font-bold shrink-0 mt-0.5">
                      {q.id}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{q.text}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {ANSWER_OPTIONS.map((opt, oi) => {
                      const selected = answers[q.id] === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(q.id, opt.value)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selected
                              ? 'bg-primary-500 text-white shadow-md scale-105 animate-bounce-in'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                          }`}
                          style={{ animationDelay: selected ? '0ms' : `${qi * 80 + oi * 50}ms` }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* 导航按钮 */}
              <div className="flex gap-2 animate-fade-in">
                {currentPage > 0 && (
                  <button onClick={() => setCurrentPage(p => p - 1)} className="btn-outline flex-1">
                    ← 上一页
                  </button>
                )}
                {currentPage < totalPages - 1 ? (
                  <button onClick={() => setCurrentPage(p => p + 1)} className="btn-primary flex-1">
                    下一页 →
                  </button>
                ) : (
                  <button onClick={handleConstitutionSubmit} disabled={!canSubmit || submitting} className="btn-primary flex-1">
                    {submitting ? '提交中...' : canSubmit ? '✓ 提交测评' : `还有 ${questions.filter(q => !answers[q.id]).length} 题未答`}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-scale">
              <div className="card text-center">
                <div className="text-5xl mb-3 animate-bounce-in">📋</div>
                <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{result.result_type}</div>
                <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">测评日期: {result.date}</div>
              </div>

              {advice && (
                <div className="card space-y-4">
                  {[
                    { icon: '📖', title: '体质概述', content: advice.description },
                    { icon: '💡', title: '养生建议', content: advice.tips, isList: true },
                    { icon: '🥗', title: '推荐食物', content: advice.food, isList: true },
                    { icon: '🏃', title: '运动建议', content: advice.exercise },
                  ].map((section, si) => (
                    <div key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${si * 100}ms` }}>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                        <span>{section.icon}</span> {section.title}
                      </h3>
                      {section.isList ? (
                        <ul className="space-y-1.5">
                          {(section.content as string[]).map((item: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{section.content as string}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">📊 9种体质得分</h3>
                <div className="space-y-3">
                  {(Object.entries(result.scores || {}) as [string, number][]).map(([type, score], si) => {
                    const isMain = type === result.result_type
                    return (
                      <div key={type} className="animate-fade-in-up" style={{ animationDelay: `${si * 80}ms` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${isMain ? 'text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {type} {isMain && '←'}
                          </span>
                          <span className={`text-xs font-bold ${isMain ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{score}/5</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ease-out ${isMain ? 'bg-gradient-to-r from-primary-400 to-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {hospital && (
                <div className="card space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">🏥 校医院联系方式</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300"><strong>{hospital.name}</strong></div>
                  <div className="text-xs text-gray-400">📍 {hospital.address}</div>
                  <div className="text-xs text-gray-400">⏰ {hospital.hours}</div>
                  <ul className="space-y-1">{hospital.tips?.map((tip: string, i: number) => <li key={i} className="text-xs text-gray-500 flex items-start gap-1"><span className="text-primary-500">•</span> {tip}</li>)}</ul>
                </div>
              )}

              <button onClick={startOver} className="btn-outline w-full">重新测评</button>

              {history.length > 1 && (
                <div className="card"><h3 className="text-sm font-medium text-gray-500 mb-2">历史测评</h3>
                  <div className="space-y-1">{history.map((h, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-300">{h.result_type}</span><span className="text-gray-400">{h.date}</span></div>)}</div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="page-title">📋 压力自测</h3>
            {stressResult && (
              <button onClick={() => { setStressResult(null); setStressAnswers({}) }}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline">⟳ 重新测试</button>
            )}
          </div>

          {!stressResult ? (
            <div className="card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">根据过去一周的实际情况选择</span>
                <button onClick={() => setStressAnswers({})} className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                  清空重填
                </button>
              </div>
              {stressQuestions.map((q, qi) => (
                <div key={q.id} className="animate-fade-in-up" style={{ animationDelay: `${qi * 60}ms` }}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 text-[10px] font-bold shrink-0 mt-0.5">
                      {q.id}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{q.text}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((v, oi) => {
                      const selected = stressAnswers[q.id] === v
                      return (
                        <button
                          key={v}
                          onClick={() => setStressAnswers(a => ({ ...a, [q.id]: v }))}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selected
                              ? 'bg-primary-500 text-white shadow-md scale-105 animate-bounce-in'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                          }`}
                        >
                          {v}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <button onClick={submitStressTest} className="btn-primary w-full mt-2">提交测评</button>
            </div>
          ) : (
            <div className="card space-y-4 text-center animate-fade-in-scale">
              <div className="text-5xl mb-1">
                {stressResult.level === 'low' ? '😌' : stressResult.level === 'moderate' ? '😐' : '😟'}
              </div>
              <div>
                <div className={`text-3xl font-bold ${levelColor(stressResult.level)}`}>{stressResult.score}<span className="text-lg font-normal text-gray-400">/50</span></div>
                <div className={`text-lg font-medium mt-1 ${levelColor(stressResult.level)}`}>{stressResult.level_text}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-4">{stressResult.advice}</p>
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
                  <svg className="w-full h-full -rotate-90 text-gray-200 dark:text-gray-700" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" />
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
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1">{breathCountdown}<span className="text-sm font-normal text-gray-400"> 秒</span></div>
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
                {breathing?.map((e: any) => (
                  <div key={e.name} className="flex items-center justify-between py-3 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary-50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{e.name}</div>
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
              <div className="text-sm text-gray-600 dark:text-gray-300"><strong>{counseling.name}</strong></div>
              <div className="text-xs text-gray-400">📍 {counseling.address}</div>
              <div className="text-xs text-gray-400">⏰ {counseling.hours}</div>
              <div className="text-xs text-gray-400">📞 本校热线：<span className="text-primary-600 font-medium">{counseling.phone}</span></div>
              <div className="text-xs text-gray-400">📞 全国热线：<span className="text-rose-600 font-medium">{counseling.national_hotline}</span></div>
              <ul className="space-y-1 mt-2">{counseling.tips?.map((tip: string, i: number) => <li key={i} className="text-xs text-gray-500 flex items-start gap-1"><span className="text-primary-500">•</span> {tip}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
