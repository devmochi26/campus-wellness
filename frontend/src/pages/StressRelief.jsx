import { useState, useEffect } from 'react'
import api from '../api'

export default function StressRelief() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [counseling, setCounseling] = useState(null)
  const [breathing, setBreathing] = useState(null)
  const [activeBreath, setActiveBreath] = useState(null)
  const [breathPhase, setBreathPhase] = useState('')
  const [breathCount, setBreathCount] = useState(0)
  const [breathTimer, setBreathTimer] = useState(null)

  useEffect(() => {
    api.get('/stress/assessment/questions').then(r => setQuestions(r.data.questions || [])).catch(() => {})
    api.get('/stress/counseling').then(r => setCounseling(r.data)).catch(() => {})
    api.get('/stress/breathing').then(r => setBreathing(r.data.exercises || [])).catch(() => {})
  }, [])

  const submitTest = async () => {
    if (questions.length === 0) return
    const ansList = questions.map(q => answers[q.id] || 3)
    const r = await api.post('/stress/assessment/submit', { answers: ansList })
    setResult(r.data)
  }

  const startBreathing = (exercise) => {
    if (breathTimer) clearInterval(breathTimer)
    setActiveBreath(exercise)
    setBreathCount(0)
    let round = 0
    const run = () => {
      setBreathPhase('inhale')
      setTimeout(() => {
        if (exercise.hold > 0) { setBreathPhase('hold') }
        setTimeout(() => {
          setBreathPhase('exhale')
          setTimeout(() => {
            round++
            if (round < exercise.rounds) { run() }
            else { setBreathPhase('done'); setBreathCount(0) }
          }, exercise.exhale * 1000)
        }, exercise.hold * 1000)
      }, exercise.inhale * 1000)
    }
    run()
  }

  const stopBreathing = () => {
    if (breathTimer) clearInterval(breathTimer)
    setActiveBreath(null)
    setBreathPhase('')
  }

  const levelColor = (l) => l === 'low' ? 'text-green-600' : l === 'moderate' ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🧘 情绪压力管理</h2>

      {/* Stress Test */}
      {!result ? (
        <div className="card space-y-3">
          <h3 className="text-sm font-medium text-gray-500">压力自测 (10题)</h3>
          {questions.map(q => (
            <div key={q.id} className="text-sm">
              <div className="text-gray-600 mb-1">{q.id}. {q.text}</div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}
                    className={`py-1 rounded-lg text-xs ${answers[q.id] === v ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-500'}`}
                  >{v}</button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submitTest} className="btn-primary w-full">提交测评</button>
        </div>
      ) : (
        <div className="card space-y-3">
          <h3 className="text-sm font-medium text-gray-500">测评结果</h3>
          <div className="text-center">
            <div className={`text-3xl font-bold ${levelColor(result.level)}`}>{result.score}/50</div>
            <div className={`text-lg font-medium ${levelColor(result.level)}`}>{result.level_text}</div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{result.advice}</p>
          <button onClick={() => { setResult(null); setAnswers({}) }} className="btn-outline w-full">重新测评</button>
        </div>
      )}

      {/* Breathing Exercise */}
      <div className="card space-y-3">
        <h3 className="text-sm font-medium text-gray-500">呼吸训练</h3>
        {activeBreath ? (
          <div className="text-center space-y-3">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
              breathPhase === 'inhale' ? 'bg-blue-100 text-blue-600 scale-110' :
              breathPhase === 'hold' ? 'bg-purple-100 text-purple-600 scale-100' :
              breathPhase === 'exhale' ? 'bg-green-100 text-green-600 scale-90' :
              breathPhase === 'done' ? 'bg-primary-100 text-primary-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {breathPhase === 'inhale' ? '⬆️' : breathPhase === 'hold' ? '⏸️' : breathPhase === 'exhale' ? '⬇️' : breathPhase === 'done' ? '✅' : '🌬️'}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {breathPhase === 'inhale' ? '吸气...' : breathPhase === 'hold' ? '屏息...' : breathPhase === 'exhale' ? '呼气...' : breathPhase === 'done' ? '完成！' : '准备'}
            </div>
            {breathPhase === 'done' ? (
              <button onClick={stopBreathing} className="btn-primary">再来一次</button>
            ) : (
              <button onClick={stopBreathing} className="btn-outline text-sm">停止</button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {breathing?.map(e => (
              <div key={e.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-700">{e.name}</div>
                  <div className="text-xs text-gray-400">吸{e.inhale}s {e.hold ? `屏${e.hold}s ` : ''}呼{e.exhale}s · {e.rounds}轮</div>
                </div>
                <button onClick={() => startBreathing(e)} className="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg">开始</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counseling Info */}
      {counseling && (
        <div className="card space-y-2">
          <h3 className="text-sm font-medium text-gray-500">🆘 心理咨询</h3>
          <div className="text-sm text-gray-600">
            <div><strong>{counseling.name}</strong></div>
            <div className="text-xs text-gray-400">{counseling.address}</div>
            <div className="text-xs text-gray-400">⏰ {counseling.hours} · 📞 {counseling.phone}</div>
          </div>
          <ul className="space-y-1">
            {counseling.tips?.map((tip, i) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                <span className="text-primary-500">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
