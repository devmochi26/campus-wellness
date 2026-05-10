import datetime
from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    routines = relationship("DailyRoutine", back_populates="user", cascade="all, delete-orphan")
    diets = relationship("DietRecord", back_populates="user", cascade="all, delete-orphan")
    exercises = relationship("ExerciseRecord", back_populates="user", cascade="all, delete-orphan")
    moods = relationship("MoodRecord", back_populates="user", cascade="all, delete-orphan")
    constitution_tests = relationship("ConstitutionTest", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    nickname = Column(String(50), default="")
    gender = Column(String(10), default="")
    age = Column(Integer, default=20)
    height = Column(Float, default=170.0)
    weight = Column(Float, default=65.0)

    user = relationship("User", back_populates="profile")


class DailyRoutine(Base):
    __tablename__ = "daily_routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    wake_time = Column(Time, nullable=True)
    sleep_time = Column(Time, nullable=True)
    sleep_quality = Column(Integer, default=3)
    screen_hours = Column(Float, default=0.0)
    water_cups = Column(Integer, default=0)
    notes = Column(String(500), default="")

    user = relationship("User", back_populates="routines")


class DietRecord(Base):
    __tablename__ = "diet_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    meal_type = Column(String(20), nullable=False)
    food_name = Column(String(200), nullable=False)
    calories = Column(Integer, default=0)
    healthy_score = Column(Integer, default=3)
    notes = Column(String(300), default="")

    user = relationship("User", back_populates="diets")


class ExerciseRecord(Base):
    __tablename__ = "exercise_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    exercise_type = Column(String(50), nullable=False)
    duration_min = Column(Integer, default=0)
    intensity = Column(Integer, default=3)
    notes = Column(String(300), default="")

    user = relationship("User", back_populates="exercises")


class MoodRecord(Base):
    __tablename__ = "mood_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    mood_score = Column(Integer, default=3)
    mood_tags = Column(JSON, default=list)
    stress_level = Column(Integer, default=3)
    notes = Column(String(500), default="")

    user = relationship("User", back_populates="moods")


class ConstitutionTest(Base):
    __tablename__ = "constitution_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    result_type = Column(String(50), nullable=False)
    scores = Column(JSON, default=dict)

    user = relationship("User", back_populates="constitution_tests")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    icon = Column(String(10), default="✅")
    category = Column(String(50), default="other")
    target_days = Column(Integer, default=21)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="habits")
    checkins = relationship("HabitCheckin", back_populates="habit", cascade="all, delete-orphan")


class HabitCheckin(Base):
    __tablename__ = "habit_checkins"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow)

    habit = relationship("Habit", back_populates="checkins")


class SleepPreference(Base):
    __tablename__ = "sleep_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    chronotype = Column(String(20), default="middle")  # early, middle, late
    nap_duration = Column(Integer, default=20)  # minutes
    target_sleep_hours = Column(Float, default=7.5)

    user = relationship("User")


class CanteenFood(Base):
    __tablename__ = "canteen_foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # 主食/荤菜/素菜/汤粥/小吃
    calories = Column(Integer, default=0)
    protein = Column(Float, default=0)
    fat = Column(Float, default=0)
    carbs = Column(Float, default=0)
    healthy_score = Column(Integer, default=3)
    suitable_for = Column(JSON, default=list)  # [养胃, 护眼, 减脂, 增肌, 经期, 熬夜修复]


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal = Column(String(50), nullable=False)
    meals = Column(JSON, default=list)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    user = relationship("User")


class StressAssessment(Base):
    __tablename__ = "stress_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    score = Column(Integer, default=0)
    level = Column(String(20), default="low")
    tags = Column(JSON, default=list)

    user = relationship("User")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="dorm")
    invite_code = Column(String(20), unique=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("User", foreign_keys=[creator_id])
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("Group", back_populates="members")
    user = relationship("User")


class WellnessPost(Base):
    __tablename__ = "wellness_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String(1000), nullable=False)
    is_anonymous = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
