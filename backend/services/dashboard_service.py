import datetime
from sqlalchemy.orm import Session
from models import DailyRoutine, DietRecord, ExerciseRecord, MoodRecord, Habit, HabitCheckin
from schemas import DashboardToday


def get_today_dashboard(db: Session, user_id: int) -> DashboardToday:
    today = datetime.date.today()

    routine = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == user_id,
        DailyRoutine.date == today,
    ).first()

    diets = db.query(DietRecord).filter(
        DietRecord.user_id == user_id,
        DietRecord.date == today,
    ).all()

    exercises = db.query(ExerciseRecord).filter(
        ExerciseRecord.user_id == user_id,
        ExerciseRecord.date == today,
    ).all()

    mood = db.query(MoodRecord).filter(
        MoodRecord.user_id == user_id,
        MoodRecord.date == today,
    ).first()

    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.is_active == True,
    ).all()

    checkins_today = 0
    for habit in habits:
        has_checkin = db.query(HabitCheckin).filter(
            HabitCheckin.habit_id == habit.id,
            HabitCheckin.date == today,
        ).first()
        if has_checkin:
            checkins_today += 1

    # Wellness score (0-100)
    score = 0
    max_score = 0

    # Sleep: up to 25 points
    if routine:
        max_score += 25
        if routine.sleep_quality >= 4:
            score += 25
        elif routine.sleep_quality == 3:
            score += 15
        else:
            score += 5

    # Diet: up to 25 points
    max_score += 25
    if diets:
        avg_healthy = sum(d.healthy_score for d in diets) / len(diets)
        if avg_healthy >= 4.0:
            score += 25
        elif avg_healthy >= 3.0:
            score += 15
        else:
            score += 5
    if len(diets) >= 3:
        score = min(score + 5, max_score + 5)

    # Exercise: up to 25 points
    max_score += 25
    total_min = sum(e.duration_min for e in exercises)
    if total_min >= 60:
        score += 25
    elif total_min >= 30:
        score += 18
    elif total_min > 0:
        score += 10

    # Mood: up to 15 points
    if mood:
        max_score += 15
        score += mood.mood_score * 3

    # Habits: up to 10 points
    if habits:
        max_score += 10
        ratio = checkins_today / len(habits)
        score += int(ratio * 10)

    wellness_score = min(int(score / max(max_score, 1) * 100), 100) if max_score > 0 else 0

    return DashboardToday(
        date=today.isoformat(),
        routine={
            "id": routine.id,
            "date": str(routine.date),
            "wake_time": str(routine.wake_time) if routine and routine.wake_time else None,
            "sleep_time": str(routine.sleep_time) if routine and routine.sleep_time else None,
            "sleep_quality": routine.sleep_quality if routine else 0,
            "screen_hours": routine.screen_hours if routine else 0,
            "water_cups": routine.water_cups if routine else 0,
            "notes": routine.notes if routine else "",
        } if routine else None,
        diet_count=len(diets),
        diet_healthy_avg=round(sum(d.healthy_score for d in diets) / len(diets), 1) if diets else 0,
        exercise_min=total_min,
        exercise_count=len(exercises),
        mood={
            "id": mood.id,
            "date": str(mood.date),
            "mood_score": mood.mood_score,
            "mood_tags": mood.mood_tags or [],
            "stress_level": mood.stress_level,
            "notes": mood.notes,
        } if mood else None,
        habit_checkins=checkins_today,
        habit_total=len(habits),
        wellness_score=wellness_score,
    )


def get_weekly_dashboard(db: Session, user_id: int) -> dict:
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=6)

    daily_data = []
    for i in range(7):
        date = week_ago + datetime.timedelta(days=i)

        moods = db.query(MoodRecord).filter(
            MoodRecord.user_id == user_id,
            MoodRecord.date == date,
        ).first()

        exercises = db.query(ExerciseRecord).filter(
            ExerciseRecord.user_id == user_id,
            ExerciseRecord.date == date,
        ).all()

        routines = db.query(DailyRoutine).filter(
            DailyRoutine.user_id == user_id,
            DailyRoutine.date == date,
        ).first()

        daily_data.append({
            "date": date.isoformat(),
            "mood_score": moods.mood_score if moods else None,
            "exercise_min": sum(e.duration_min for e in exercises),
            "sleep_quality": routines.sleep_quality if routines else None,
            "sleep_hours": 0 if not routines or not routines.sleep_time or not routines.wake_time else None,
        })

    return {"days": daily_data}
