import { useState, useEffect } from 'react'
import api from '../api'

const ANSWER_OPTIONS = [
  { value: 1, label: '没有' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' },
]

export default function ConstitutionTest() {
  const [questions, setQuestions] = useState([])
  const [types, setTypes] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentPage, setCurrentPage] = useState(0)
  const [result, setResult] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
  }, [])

  const setAnswer = (qId, value) => {
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

      // Refresh history
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin text-3xl">🌿</div>
      </div>
    )
  }

  const pageQuestions = questions.slice(currentPage * perPage, (currentPage + 1) * perPage)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">🔬 中医体质测评</h2>

      {!result ? (
        <>
          <div className="card">
            <p className="text-sm text-gray-500 mb-3">
              共 {questions.length} 道题，根据近一年的体验和感觉回答。每页 {perPage} 题。
            </p>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">{currentPage + 1} / {totalPages} 页</div>
          </div>

          <div className="space-y-3">
            {pageQuestions.map((q) => (
              <div key={q.id} className="card">
                <div className="text-sm text-gray-700 mb-2">
                  <span className="text-gray-400 mr-1">{q.id}.</span>
                  {q.text}
                </div>
                <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-2">
                  {ANSWER_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setAnswer(q.id, opt.value)}
                      className={`py-1.5 rounded-lg text-xs transition-colors text-center ${
                        answers[q.id] === opt.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
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
        /* Result */
        <div className="space-y-4">
          <div className="card text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-xl font-bold text-primary-700">{result.result_type}</div>
            <div className="text-sm text-gray-400 mt-1">测评日期: {result.date}</div>
          </div>

          {advice && (
            <div className="card space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">体质概述</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{advice.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">养生建议</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {advice.tips?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">推荐食物</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {advice.food?.map((f, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary-500 mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">运动建议</h3>
                <p className="text-sm text-gray-600">{advice.exercise}</p>
              </div>
            </div>
          )}

          {/* Score breakdown */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">9种体质得分</h3>
            <div className="space-y-2">
              {Object.entries(result.scores || {}).map(([type, score]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${type === result.result_type ? 'font-bold text-primary-700' : 'text-gray-500'}`}>
                    {type}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${type === result.result_type ? 'bg-primary-500' : 'bg-gray-300'}`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{score}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={startOver} className="btn-outline w-full">重新测评</button>

          {/* History */}
          {history.length > 1 && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-2">历史测评</h3>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{h.result_type}</span>
                    <span className="text-gray-400">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
