import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api'
import type { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get<User>('/user/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.access_token)
    const me = await api.get<User>('/user/me')
    setUser(me.data)
    return me.data
  }

  const register = async (username: string, password: string, class_name = ''): Promise<User> => {
    const res = await api.post('/auth/register', { username, password, class_name })
    localStorage.setItem('token', res.data.access_token)
    const me = await api.get<User>('/user/me')
    setUser(me.data)
    return me.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
