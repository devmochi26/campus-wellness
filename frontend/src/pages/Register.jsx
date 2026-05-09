import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== password2) {
      setError('两次密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码至少6位')
      return
    }
    setLoading(true)
    try {
      await register(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-green-50 to-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-gray-800">养生校园</h1>
          <p className="text-gray-400 mt-1 text-sm">开启你的轻养生之旅</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">注册</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="input-field"
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="password"
              placeholder="确认密码"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button className="btn-primary w-full mt-1" type="submit" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            已有账号？<Link to="/login" className="text-primary-600 hover:underline">去登录</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
