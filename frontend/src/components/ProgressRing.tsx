import { useEffect, useState } from 'react'
import type { ProgressRingProps } from '../types'

export default function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, label = '', color = '#22c55e' }: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState<number>(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const animatedProgress = Math.min(animatedValue / max, 1)
  const offset = circumference - animatedProgress * circumference

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      current += increment
      if (current >= value) {
        setAnimatedValue(value)
        clearInterval(timer)
      } else {
        setAnimatedValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90 text-gray-200 dark:text-gray-700">
        <defs>
          <filter id={`glow-${color.replace('#', '')}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-animate"
          filter={`url(#glow-${color.replace('#', '')})`}
        />
      </svg>
      <div className="text-center">
        <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {Math.round(animatedValue)}
        </div>
        {label && <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</div>}
      </div>
    </div>
  )
}
