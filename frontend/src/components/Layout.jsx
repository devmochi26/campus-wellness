import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: '今日概览', icon: '🏠' },
  { to: '/routine', label: '作息记录', icon: '🌙' },
  { to: '/diet', label: '饮食记录', icon: '🍽️' },
  { to: '/exercise', label: '运动记录', icon: '🏃' },
  { to: '/mood', label: '心情记录', icon: '💭' },
  { to: '/constitution', label: '体质测评', icon: '🔬' },
  { to: '/habits', label: '习惯打卡', icon: '✅' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-lg text-primary-700">养生校园</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.nickname || ''}</span>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 flex gap-4">
        <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-lg ${
                  isActive ? 'text-primary-600' : 'text-gray-400'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
      </div>
    </div>
  )
}
