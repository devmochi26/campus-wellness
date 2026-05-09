import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DailyRoutine from './pages/DailyRoutine'
import DietTracker from './pages/DietTracker'
import ExerciseTracker from './pages/ExerciseTracker'
import MoodTracker from './pages/MoodTracker'
import ConstitutionTest from './pages/ConstitutionTest'
import HabitTracker from './pages/HabitTracker'

function PrivateRoute({ children }) {
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
      <Route path="/routine" element={<PrivateRoute><DailyRoutine /></PrivateRoute>} />
      <Route path="/diet" element={<PrivateRoute><DietTracker /></PrivateRoute>} />
      <Route path="/exercise" element={<PrivateRoute><ExerciseTracker /></PrivateRoute>} />
      <Route path="/mood" element={<PrivateRoute><MoodTracker /></PrivateRoute>} />
      <Route path="/constitution" element={<PrivateRoute><ConstitutionTest /></PrivateRoute>} />
      <Route path="/habits" element={<PrivateRoute><HabitTracker /></PrivateRoute>} />
    </Routes>
  )
}
