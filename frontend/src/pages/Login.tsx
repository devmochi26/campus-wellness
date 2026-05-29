import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-950 dark:bg-none px-4 relative overflow-hidden transition-colors duration-300">
      {/* 背景装饰 */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-green-200 dark:bg-green-500/10 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300" />
      <div className="absolute -bottom-20 right-0 w-80 h-80 bg-amber-200 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-emerald-200 dark:bg-green-400/10 rounded-full blur-3xl animate-float pointer-events-none transition-colors duration-300" style={{ animationDelay: '0.8s' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 dark:bg-gray-800 backdrop-blur border border-gray-100 dark:border-gray-700 shadow-lg mb-4 transition-colors duration-300">
            <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">养生校园</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">记录生活，轻松养生</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6 animate-fade-in-up transition-colors duration-300" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-5">登录</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
              <input
                className="input-with-icon"
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
              <input
                className="input-with-icon"
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}
            <button className="btn-primary w-full mt-1" type="submit" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
            还没有账号？<Link to="/register" className="text-primary-600 dark:text-green-400 hover:underline font-medium">去注册</Link>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-300 dark:text-gray-500 text-center">
            体验账号: demo / demo123
          </div>
        </div>
      </div>
    </div>
  )
}
