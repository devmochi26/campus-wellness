import { useState, useEffect } from 'react'
import api from '../api'
import type { ConstitutionQuestion, ConstitutionResult, ConstitutionAdvice } from '../types'

const ANSWER_OPTIONS = [
  { value: 1, label: '没有' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' },
]

export default function ConstitutionTest() {
  const [questions, setQuestions] = useState<ConstitutionQuestion[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [result, setResult] = useState<ConstitutionResult | null>(null)
  const [advice, setAdvice] = useState<ConstitutionAdvice | null>(null)
  const [history, setHistory] = useState<ConstitutionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)

  const perPage = 10
  const totalPages = Math.ceil(questions.length / perPage)

  useEffect(() => {
    api.get('/constitution/questions').then((res) => {
      setQuestions(res.data.questions || [])
      setTypes(res.data.types || [])
    }).finally(() => setLoading(false))

    api.get('/constitution/history').then((res) => {
      setHistory(res.data || [])
    }).catch(() => {})

    setTimeout(() => setVisible(true), 100)
  }, [])

  const setAnswer = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
  }

  const canSubmit = questions.length > 0 && questions.every((q) => answers[q.id])

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const answersList = questions.map((q) => answers[q.id])
      const res = await api.post('/constitution/submit', { answers: answersList })
      const adviceRes = await api.get(`/constitution/advice/${res.data.result_type}`)
      setResult(res.data)
      setAdvice(adviceRes.data)
      api.get('/constitution/history').then((r) => setHistory(r.data || [])).catch(() => {})
    } finally {
      setSubmitting(false)
    }
  }

  const startOver = () => {
    setResult(null)
    setAdvice(null)
    setAnswers({})
    setCurrentPage(0)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-float mb-4">🌿</div>
        <div className="text-gray-400 animate-pulse-slow">加载中...</div>
      </div>
    )
  }

  const pageQuestions = questions.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <div className="space-y-4">
      <h2 className={`text-lg font-semibold text-gray-700 dark:text-gray-200 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
        🔬 中医体质测评
      </h2>

      {!result ? (
        <>
          <div className={`card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '250ms' }}>
            <p className="text-sm text-gray-500 mb-3">
              共 {questions.length} 道题，根据近一年的体验和感觉回答。每页 {perPage} 题。
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">{currentPage + 1} / {totalPages} 页</div>
          </div>

          <div className={`space-y-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '500ms' }}>
            {pageQuestions.map((q, index) => (
              <div key={q.id} className={`card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: `${500 + index * 200}ms` }}>
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                  <span className="text-gray-400 mr-1">{q.id}.</span>
                  {q.text}
                </div>
                <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-2">
                  {ANSWER_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setAnswer(q.id, opt.value)}
                      className={`py-1.5 rounded-lg text-xs transition-all duration-200 text-center ${
                        answers[q.id] === opt.value
                          ? 'bg-primary-500 text-white scale-105'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 hover:scale-105'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`flex gap-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '1500ms' }}>
            {currentPage > 0 && (
              <button onClick={() => setCurrentPage((p) => p - 1)} className="btn-outline flex-1">
                上一页
              </button>
            )}
            {currentPage < totalPages - 1 ? (
              <button onClick={() => setCurrentPage((p) => p + 1)} className="btn-primary flex-1">
                下一页
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary flex-1">
                {submitting ? '提交中...' : canSubmit ? '提交测评' : `还有 ${questions.filter((q) => !answers[q.id]).length} 题未答`}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className={`card text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
            <div className="text-4xl mb-2">📋</div>
            <div className="text-xl font-bold text-primary-700">{result.result_type}</div>
            <div className="text-sm text-gray-400 mt-1">测评日期: {result.date}</div>
          </div>

          {advice && (
            <div className={`card space-y-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '250ms' }}>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">体质概述</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{advice.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">养生建议</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {advice.tips?.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">推荐食物</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {advice.food?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary-500 mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">运动建议</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{advice.exercise}</p>
              </div>
            </div>
          )}

          <div className={`card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '500ms' }}>
            <h3 className="text-sm font-medium text-gray-500 mb-3">9种体质得分</h3>
            <div className="space-y-2">
              {Object.entries(result.scores || {}).map(([type, score], index) => (
                <div key={type} className={`flex items-center gap-2 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: `${500 + index * 150}ms` }}>
                  <span className={`text-xs w-14 ${type === result.result_type ? 'font-bold text-primary-700' : 'text-gray-500'}`}>
                    {type}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${type === result.result_type ? 'bg-primary-500' : 'bg-gray-300'}`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{score}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={startOver} className="btn-outline w-full">重新测评</button>
        </div>
      )}

      {history.length > 0 && !result && (
        <div className={`card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`} style={{ transitionDelay: '1800ms' }}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">历史记录</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{h.result_type}</span>
                <span className="text-gray-400 text-xs">{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
