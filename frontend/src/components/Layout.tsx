import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useModuleColor } from '../hooks/useModuleColor'
import api from '../api'
import type { LayoutProps, NavItem } from '../types'

const desktopNav: NavItem[] = [
  { to: '/', label: '今日概览', icon: '🏠' },
  { to: '/routine', label: '作息管理', icon: '🌙' },
  { to: '/diet', label: '饮食管理', icon: '🍽️' },
  { to: '/exercise', label: '运动管理', icon: '🏃' },
  { to: '/mood', label: '心情记录', icon: '💭' },
  { to: '/assessment', label: '健康测评', icon: '🔬' },
  { to: '/habits', label: '习惯打卡', icon: '✅' },
  { to: '/health', label: '健康档案', icon: '📋' },
  { to: '/community', label: '校园互助', icon: '🤝' },
]

const mobileNav = [
  { to: '/', label: '概览', icon: '🏠' },
  { to: '/habits', label: '打卡', icon: '✅' },
  { to: '/diet', label: '记录', icon: '✏️', highlight: true },
  { to: '/assessment', label: '测评', icon: '🔬' },
  { to: '/health', label: '档案', icon: '📋' },
]

// 浅色模式：模块色背景+文字
const lightActive: Record<string, string> = {
  '/':            'bg-primary-50 text-primary-700',
  '/routine':    'bg-sleep-50 text-sleep-700',
  '/diet':       'bg-food-50 text-food-700',
  '/exercise':   'bg-warm-50 text-warm-700',
  '/mood':       'bg-mood-50 text-mood-700',
  '/assessment': 'bg-blue-50 text-blue-700',
  '/habits':     'bg-teal-50 text-teal-700',
  '/health':     'bg-slate-50 text-slate-700',
  '/community':  'bg-community-50 text-community-700',
}

// 深色模式：半透明模块色
const darkActive: Record<string, string> = {
  '/':            'dark:bg-green-500/15 dark:text-green-400',
  '/routine':    'dark:bg-indigo-500/15 dark:text-indigo-400',
  '/diet':       'dark:bg-orange-500/15 dark:text-orange-400',
  '/exercise':   'dark:bg-amber-500/15 dark:text-amber-400',
  '/mood':       'dark:bg-rose-500/15 dark:text-rose-400',
  '/assessment': 'dark:bg-blue-500/15 dark:text-blue-400',
  '/habits':     'dark:bg-teal-500/15 dark:text-teal-400',
  '/health':     'dark:bg-slate-500/15 dark:text-slate-400',
  '/community':  'dark:bg-violet-500/15 dark:text-violet-400',
}

const defaultLight = 'bg-primary-50 text-primary-700'
const defaultDark = 'dark:bg-green-500/15 dark:text-green-400'

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const mc = useModuleColor()

  const lightClass = lightActive[location.pathname] || defaultLight
  const darkClass = darkActive[location.pathname] || defaultDark

  const isCounselor = user?.role === 'counselor'

  const toggleRole = async () => {
    const newRole = isCounselor ? 'student' : 'counselor'
    await api.post(`/campus/role?role=${newRole}`)
    if (user) user.role = newRole
    if (newRole === 'student') navigate('/')
    else navigate('/counselor')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cssVars = {
    '--mc-bg': mc.bg,
    '--mc-bg-light': mc.bgLight,
    '--mc-text': mc.text,
    '--mc-border': mc.border,
    '--mc-ring': mc.ring,
  } as React.CSSProperties

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative transition-colors duration-300">
      {/* 装饰 — 浅色渐变 / 深色半透明模块色 */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-200 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none transition-colors duration-300" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-200 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none transition-colors duration-300" />

      {/* 桌面端 */}
      <div className="hidden md:flex relative z-10 min-h-screen">
        <aside className="w-56 shrink-0 bg-white/60 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-100 dark:border-gray-800 flex flex-col transition-colors duration-300">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-lg text-primary-700 dark:text-green-400">养生校园</span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto scroll-container">
            {desktopNav.map((item) => {
              const la = lightActive[item.to] || defaultLight
              const da = darkActive[item.to] || defaultDark
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? `${la} ${da}` : 'text-gray-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 dark:hover:text-gray-300'}`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {isCounselor && (
              <NavLink to="/counselor" className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                📊 辅导员看板
              </NavLink>
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">{user?.nickname || ''}</div>
              <button onClick={toggle} className="text-lg hover:scale-110 transition-transform" title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleRole} className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
                isCounselor ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {isCounselor ? '👨‍🏫 辅导员' : '🎓 学生'}
              </button>
              <button onClick={handleLogout} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                退出
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 h-14 shrink-0 flex items-center justify-between px-6 transition-colors duration-300">
            <span className="text-sm text-gray-400 dark:text-gray-500">欢迎回来，{user?.nickname || '同学'}</span>
            <button onClick={toggle} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors md:hidden">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </header>
          <main className="flex-1 px-6 py-6 animate-fade-in overflow-y-auto" style={cssVars}>
            {children}
          </main>
        </div>
      </div>

      {/* 移动端 */}
      <div className="md:hidden relative z-10">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 transition-colors duration-300">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="font-bold text-lg text-primary-700 dark:text-green-400">养生校园</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleRole} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isCounselor ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {isCounselor ? '👨‍🏫' : '🎓'}
              </button>
              <button onClick={toggle} className="text-lg hover:scale-110 transition-transform" title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}>
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button onClick={handleLogout} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                退出
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-4 pb-20 animate-fade-in" style={cssVars}>
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 px-1 z-10 transition-colors duration-300">
          {mobileNav.map((item) => {
            const la = lightActive[item.to] || defaultLight
            const da = darkActive[item.to] || defaultDark
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  item.highlight
                    ? `relative -mt-5 w-14 h-14 rounded-2xl bg-primary-500 text-white shadow-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 active:scale-95 ${
                        isActive ? 'bg-primary-600 scale-105' : ''
                      }`
                    : `flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded-lg min-w-[3.2rem] transition-all duration-200 ${
                        isActive ? `${la} ${da} font-medium` : 'text-gray-400 dark:text-gray-500'
                      }`
                }
              >
                <span className={item.highlight ? 'text-xl' : 'text-lg'}>{item.icon}</span>
                <span className={item.highlight ? 'text-[10px]' : ''}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
