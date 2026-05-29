import { useLocation } from 'react-router-dom'

const colorMap: Record<string, { bg: string; bgLight: string; text: string; border: string; ring: string }> = {
  '/':            { bg: '#22c55e', bgLight: '#f0fdf4', text: '#15803d', border: '#22c55e', ring: '#bbf7d0' },
  '/routine':    { bg: '#6366f1', bgLight: '#eef2ff', text: '#4338ca', border: '#6366f1', ring: '#c7d2fe' },
  '/diet':       { bg: '#f97316', bgLight: '#fff7ed', text: '#c2410c', border: '#f97316', ring: '#fed7aa' },
  '/exercise':   { bg: '#f59e0b', bgLight: '#fffbeb', text: '#b45309', border: '#f59e0b', ring: '#fde68a' },
  '/mood':       { bg: '#f43f5e', bgLight: '#fff1f2', text: '#be123c', border: '#f43f5e', ring: '#fecdd3' },
  '/assessment': { bg: '#3b82f6', bgLight: '#eff6ff', text: '#1d4ed8', border: '#3b82f6', ring: '#bfdbfe' },
  '/habits':     { bg: '#14b8a6', bgLight: '#f0fdfa', text: '#0f766e', border: '#14b8a6', ring: '#99f6e4' },
  '/health':     { bg: '#64748b', bgLight: '#f8fafc', text: '#334155', border: '#64748b', ring: '#e2e8f0' },
  '/community':  { bg: '#8b5cf6', bgLight: '#f5f3ff', text: '#6d28d9', border: '#8b5cf6', ring: '#ddd6fe' },
}

export function useModuleColor() {
  const location = useLocation()
  return colorMap[location.pathname] || colorMap['/']
}
