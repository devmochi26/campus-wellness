import datetime
from typing import Optional, List, Annotated
from pydantic import BaseModel, BeforeValidator


def _serialize(v):
    if isinstance(v, (datetime.date, datetime.time, datetime.datetime)):
        return v.isoformat()
    return str(v) if v is not None else v


# Types that auto-convert from ORM date/time objects to string
DateStr = Annotated[str, BeforeValidator(_serialize)]
OptStr = Annotated[Optional[str], BeforeValidator(lambda v: _serialize(v) if v is not None else None)]


# ===== Auth =====
class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ===== User Profile =====
class ProfileUpdate(BaseModel):
    nickname: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None


class ProfileResponse(BaseModel):
    id: int
    nickname: str
    gender: str
    age: int
    height: float
    weight: float

    class Config:
        from_attributes = True


# ===== Daily Routine =====
class RoutineCreate(BaseModel):
    date: str
    wake_time: Optional[str] = None
    sleep_time: Optional[str] = None
    sleep_quality: int = 3
    screen_hours: float = 0.0
    water_cups: int = 0
    notes: str = ""


class RoutineResponse(BaseModel):
    id: int
    date: DateStr
    wake_time: OptStr = None
    sleep_time: OptStr = None
    sleep_quality: int
    screen_hours: float
    water_cups: int
    notes: str

    class Config:
        from_attributes = True


# ===== Diet =====
class DietCreate(BaseModel):
    date: str
    meal_type: str
    food_name: str
    calories: int = 0
    healthy_score: int = 3
    notes: str = ""


class DietResponse(BaseModel):
    id: int
    date: DateStr
    meal_type: str
    food_name: str
    calories: int
    healthy_score: int
    notes: str

    class Config:
        from_attributes = True


# ===== Exercise =====
class ExerciseCreate(BaseModel):
    date: str
    exercise_type: str
    duration_min: int = 0
    intensity: int = 3
    notes: str = ""


class ExerciseResponse(BaseModel):
    id: int
    date: DateStr
    exercise_type: str
    duration_min: int
    intensity: int
    notes: str

    class Config:
        from_attributes = True


# ===== Mood =====
class MoodCreate(BaseModel):
    date: str
    mood_score: int = 3
    mood_tags: List[str] = []
    stress_level: int = 3
    notes: str = ""


class MoodResponse(BaseModel):
    id: int
    date: DateStr
    mood_score: int
    mood_tags: List[str]
    stress_level: int
    notes: str

    class Config:
        from_attributes = True


# ===== Constitution Test =====
class ConstitutionSubmit(BaseModel):
    answers: List[int]


class ConstitutionResultResponse(BaseModel):
    id: int
    date: DateStr
    result_type: str
    scores: dict

    class Config:
        from_attributes = True


# ===== Habits =====
class HabitCreate(BaseModel):
    name: str
    icon: str = "✅"
    category: str = "other"
    target_days: int = 21


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    target_days: Optional[int] = None
    is_active: Optional[bool] = None


class HabitResponse(BaseModel):
    id: int
    name: str
    icon: str
    category: str
    target_days: int
    is_active: bool
    created_at: DateStr
    current_streak: int = 0
    checked_dates: List[str] = []

    class Config:
        from_attributes = True


# ===== Dashboard =====
class DashboardToday(BaseModel):
    date: DateStr
    routine: Optional[RoutineResponse] = None
    diet_count: int = 0
    diet_healthy_avg: float = 0.0
    exercise_min: int = 0
    exercise_count: int = 0
    mood: Optional[MoodResponse] = None
    habit_checkins: int = 0
    habit_total: int = 0
    wellness_score: int = 0
