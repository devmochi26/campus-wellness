// ===== Auth =====

export interface User {
  id: number;
  username: string;
  nickname: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  role?: string;
  class_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ===== Daily Routine =====

export interface Routine {
  id: number;
  date: string;
  wake_time: string | null;
  sleep_time: string | null;
  sleep_quality: number;
  screen_hours: number;
  water_cups: number;
  notes: string;
}

// ===== Diet =====

export interface DietRecord {
  id: number;
  date: string;
  meal_type: string;
  food_name: string;
  calories: number;
  healthy_score: number;
  notes: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// ===== Exercise =====

export interface ExerciseRecord {
  id: number;
  date: string;
  exercise_type: string;
  duration_min: number;
  intensity: number;
  notes: string;
}

// ===== Mood =====

export interface MoodRecord {
  id: number;
  date: string;
  mood_score: number;
  mood_tags: string[];
  stress_level: number;
  notes: string;
}

// ===== Habits =====

export interface Habit {
  id: number;
  name: string;
  icon: string;
  category: string;
  target_days: number;
  is_active: boolean;
  created_at: string;
  current_streak: number;
  checked_dates: string[];
}

export interface PresetHabit {
  name: string;
  icon: string;
  category: string;
  target_days: number;
}

// ===== Dashboard =====

export interface DashboardToday {
  date: string;
  routine: Routine | null;
  diet_count: number;
  diet_healthy_avg: number;
  exercise_min: number;
  exercise_count: number;
  mood: MoodRecord | null;
  habit_checkins: number;
  habit_total: number;
  wellness_score: number;
}

export interface WeeklyDay {
  date: string;
  mood_score: number | null;
  exercise_min: number;
  sleep_quality: number | null;
  sleep_hours: number | null;
}

// ===== Smart Sleep =====

export interface SleepPreference {
  id: number;
  chronotype: string;
  nap_duration: number;
  target_sleep_hours: number;
}

export interface SleepRecommendation {
  wake_time: string;
  target_bedtime: string;
  nap_time: string;
  nap_duration: number;
  recommendation: string;
}

export interface SleepReport {
  avg_sleep_hours: number;
  avg_quality: number;
  regularity: number;
  trend: { date: string; sleep_quality: number; sleep_hours: number }[];
}

export interface SleepScenario {
  title: string;
  tips: string[];
  schedule: { wake: string; sleep: string; nap: string };
}

// ===== Constitution Test =====

export interface ConstitutionQuestion {
  id: number;
  text: string;
  type: number;
}

export interface ConstitutionResult {
  id: number;
  date: string;
  result_type: string;
  scores: Record<string, number>;
}

export interface ConstitutionTypeInfo {
  name: string;
  description: string;
}

export interface ConstitutionAdvice {
  description: string;
  tips: string[];
  food: string[];
  exercise: string;
}

// ===== Stress Relief =====

export interface StressQuestion {
  id: number;
  text: string;
}

export interface StressResult {
  score: number;
  max_score: number;
  level: 'low' | 'moderate' | 'high';
  level_text: string;
  advice: string;
}

export interface BreathingExercise {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  rounds: number;
  description: string;
}

// ===== Health Profile =====

export interface HealthProfileData {
  sleep: { avg_quality: number; days_recorded: number; trend: string };
  exercise: { total_min_week: number; rating: string };
  diet: { avg_healthy: number; rating: string };
  mood: { avg_mood: number; avg_stress: number; rating: string };
  constitution: string | null;
  stress_level: string | null;
  habits: { total_checkins: number };
}

export interface HealthRisk {
  type: string;
  level: 'warning' | 'info';
  title: string;
  detail: string;
  action: string;
}

// ===== Nutrition =====

export interface CanteenFood {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  healthy_score: number;
  suitable_for: string[];
}

export interface NutritionRecommendation {
  title: string;
  tips: string[];
  foods: string[];
}

export interface NutritionSummary {
  date: string;
  meals: number;
  total_calories: number;
  avg_healthy: number;
  recommendation: string;
}

// ===== Community =====

export interface Group {
  id: number;
  name: string;
  type: string;
  invite_code: string;
}

export interface LeaderboardEntry {
  user_id: number;
  nickname: string;
  checkins_today: number;
}

export interface WellnessPost {
  id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  tags: string[];
  created_at: string;
  author: string;
}

export interface WellnessTip {
  title: string;
  content: string;
}

// ===== Auth Context =====

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, class_name?: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

// ===== Component Props =====

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color?: 'primary' | 'warm' | 'blue' | 'purple' | 'rose' | 'teal' | 'indigo' | 'orange';
  delay?: number;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface PrivateRouteProps {
  children: React.ReactNode;
}

// ===== Navigation =====

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}
