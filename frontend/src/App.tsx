import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MoodTracker from './pages/MoodTracker'
import HabitTracker from './pages/HabitTracker'
import HealthProfile from './pages/HealthProfile'
import Community from './pages/Community'
import RoutineManager from './pages/RoutineManager'
import DietManager from './pages/DietManager'
import ExerciseManager from './pages/ExerciseManager'
import HealthAssessment from './pages/HealthAssessment'
import CounselorDashboard from './pages/CounselorDashboard'
import type { PrivateRouteProps } from './types'

function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-2xl">🌿</div>
      </div>
    )
  }
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/routine" element={<PrivateRoute><RoutineManager /></PrivateRoute>} />
      <Route path="/diet" element={<PrivateRoute><DietManager /></PrivateRoute>} />
      <Route path="/exercise" element={<PrivateRoute><ExerciseManager /></PrivateRoute>} />
      <Route path="/mood" element={<PrivateRoute><MoodTracker /></PrivateRoute>} />
      <Route path="/assessment" element={<PrivateRoute><HealthAssessment /></PrivateRoute>} />
      <Route path="/habits" element={<PrivateRoute><HabitTracker /></PrivateRoute>} />
      <Route path="/health" element={<PrivateRoute><HealthProfile /></PrivateRoute>} />
      <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
      <Route path="/counselor" element={<PrivateRoute><CounselorDashboard /></PrivateRoute>} />
    </Routes>
  )
}
