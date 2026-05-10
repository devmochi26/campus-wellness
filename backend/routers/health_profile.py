import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, DailyRoutine, DietRecord, ExerciseRecord, MoodRecord, ConstitutionTest, StressAssessment, HabitCheckin
from auth import get_current_user

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=6)
    month_ago = today - datetime.timedelta(days=29)

    # Sleep stats
    routines = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date >= week_ago,
    ).all()
    avg_quality = round(sum(r.sleep_quality for r in routines if r.sleep_quality) / max(len(routines), 1), 1)
    sleep_days = len(routines)

    # Exercise stats
    exercises = db.query(ExerciseRecord).filter(
        ExerciseRecord.user_id == current_user.id,
        ExerciseRecord.date >= week_ago,
    ).all()
    total_exercise_min = sum(e.duration_min for e in exercises)

    # Diet stats
    diets = db.query(DietRecord).filter(
        DietRecord.user_id == current_user.id,
        DietRecord.date >= week_ago,
    ).all()
    avg_healthy = round(sum(d.healthy_score for d in diets) / max(len(diets), 1), 1)

    # Mood stats
    moods = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.date >= week_ago,
    ).all()
    avg_mood = round(sum(m.mood_score for m in moods) / max(len(moods), 1), 1)
    avg_stress = round(sum(m.stress_level for m in moods) / max(len(moods), 1), 1)

    # Constitution
    latest_test = db.query(ConstitutionTest).filter(
        ConstitutionTest.user_id == current_user.id,
    ).order_by(ConstitutionTest.date.desc()).first()

    # Stress assessment
    latest_stress = db.query(StressAssessment).filter(
        StressAssessment.user_id == current_user.id,
    ).order_by(StressAssessment.date.desc()).first()

    # Habit stats (simplified)
    from models import Habit
    user_habits = db.query(Habit).filter(Habit.user_id == current_user.id).all()
    habit_ids = [h.id for h in user_habits]
    total_checkins = db.query(HabitCheckin).filter(HabitCheckin.habit_id.in_(habit_ids)).count() if habit_ids else 0

    return {
        "sleep": {"avg_quality": avg_quality, "days_recorded": sleep_days, "trend": "稳定" if avg_quality >= 3 else "需关注"},
        "exercise": {"total_min_week": total_exercise_min, "rating": "达标" if total_exercise_min >= 150 else ("一般" if total_exercise_min >= 60 else "不足")},
        "diet": {"avg_healthy": avg_healthy, "rating": "健康" if avg_healthy >= 3.5 else ("一般" if avg_healthy >= 2.5 else "需改善")},
        "mood": {"avg_mood": avg_mood, "avg_stress": avg_stress, "rating": "良好" if avg_mood >= 3 else "需关注"},
        "constitution": latest_test.result_type if latest_test else None,
        "stress_level": latest_stress.level if latest_stress else None,
        "habits": {"total_checkins": total_checkins},
    }


@router.get("/risks")
def get_risks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=6)
    risks = []

    # Check sleep
    routines = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date >= week_ago,
    ).all()

    late_nights = 0
    for r in routines:
        if r.sleep_time and r.sleep_time.hour >= 0 and r.sleep_time.hour < 6:
            late_nights += 1

    if late_nights >= 3:
        risks.append({"type": "sleep", "level": "warning", "title": "熬夜频率过高", "detail": f"本周有{late_nights}天在凌晨0-6点间入睡，长期熬夜会影响免疫力和学习效率。", "action": "尝试每天提前15分钟上床，逐步调整作息。"})
    elif late_nights >= 1:
        risks.append({"type": "sleep", "level": "info", "title": "有熬夜情况", "detail": "偶尔熬夜可以理解，但注意第二天补觉不要超过平时起床时间2小时。", "action": "参考智能作息管理页面获取建议。"})

    # Check exercise
    exercises = db.query(ExerciseRecord).filter(
        ExerciseRecord.user_id == current_user.id,
        ExerciseRecord.date >= week_ago,
    ).all()
    total_min = sum(e.duration_min for e in exercises)
    if total_min < 60:
        risks.append({"type": "exercise", "level": "warning" if total_min < 30 else "info", "title": "运动量不足", "detail": f"本周运动{total_min}分钟，建议每周至少150分钟中等强度运动。", "action": "从每天5分钟的小运动开始，参考轻量运动方案。"})

    # Check mood
    moods = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.date >= week_ago,
    ).all()
    low_moods = [m for m in moods if m.mood_score <= 2]
    if len(low_moods) >= 3:
        risks.append({"type": "mood", "level": "warning", "title": "情绪持续低落", "detail": f"本周有{len(low_moods)}天情绪评分≤2，建议关注心理健康。", "action": "尝试写情绪日记，或预约校内心理咨询。紧急可拨打12355。"})
    elif len(low_moods) >= 1:
        risks.append({"type": "mood", "level": "info", "title": "偶尔情绪低落", "detail": "每个人都会有情绪起伏，这是正常的。", "action": "试试深呼吸或和朋友聊聊。"})

    # Check diet
    diets = db.query(DietRecord).filter(
        DietRecord.user_id == current_user.id,
        DietRecord.date >= week_ago,
    ).all()
    diet_days = len(set(d.date for d in diets))
    if diet_days < 4:
        risks.append({"type": "diet", "level": "info", "title": "饮食记录较少", "detail": f"本周仅{diet_days}天有饮食记录，可能三餐不规律。", "action": "尽量保证每天三餐，设置提醒。"})

    return {"risks": risks, "summary": f"共发现{len(risks)}个需要关注的事项" if risks else "目前各项指标良好，继续保持！"}
