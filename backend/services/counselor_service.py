from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models import User, UserProfile, DailyRoutine, MoodRecord, ConstitutionTest, Habit, HabitCheckin


def get_class_overview(db: Session, counselor_id: int) -> dict:
    """获取辅导员所管班级的健康概览"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == counselor_id).first()
    if not profile or not profile.class_name or not profile.class_name.strip():
        return {"error": "请先设置班级名称"}

    class_name = profile.class_name.strip()

    # 获取该班级所有学生（排除辅导员自己）
    all_profiles = db.query(UserProfile).filter(UserProfile.class_name == class_name).all()
    student_profiles = [p for p in all_profiles if p.user_id != counselor_id]

    if not student_profiles:
        return {
            "class_name": class_name,
            "student_count": 0,
            "note": "还没有学生加入此班级，或班级名不匹配。请让学生使用完全相同的班级名。",
        }

    student_ids = [p.user_id for p in student_profiles]

    today = date.today()

    # 本周范围
    week_start = today - timedelta(days=today.weekday())
    week_dates = [week_start + timedelta(days=i) for i in range(7)]

    # 1. 作息数据聚合
    routines = db.query(DailyRoutine).filter(
        DailyRoutine.user_id.in_(student_ids),
        DailyRoutine.date >= week_start,
    ).all()

    avg_sleep_quality = round(sum(r.sleep_quality for r in routines if r.sleep_quality) / max(len(routines), 1), 1)
    avg_sleep_hours = 0
    sleep_count = 0
    for r in routines:
        if r.sleep_time and r.wake_time:
            try:
                sh, sm = map(int, r.sleep_time.split(':'))
                wh, wm = map(int, r.wake_time.split(':'))
                h = (wh * 60 + wm - sh * 60 - sm) / 60
                if h < 0: h += 24
                avg_sleep_hours += h
                sleep_count += 1
            except:
                pass
    avg_sleep_hours = round(avg_sleep_hours / max(sleep_count, 1), 1)

    # 2. 心情/压力聚合
    moods = db.query(MoodRecord).filter(
        MoodRecord.user_id.in_(student_ids),
        MoodRecord.date >= week_start,
    ).all()

    avg_mood = round(sum(m.mood_score for m in moods if m.mood_score) / max(len(moods), 1), 1)
    avg_stress = round(sum(m.stress_level for m in moods if m.stress_level) / max(len(moods), 1), 1)

    # 3. 习惯打卡
    habits = db.query(Habit).filter(Habit.user_id.in_(student_ids)).all()
    habit_ids = [h.id for h in habits]
    checkins = db.query(HabitCheckin).filter(HabitCheckin.habit_id.in_(habit_ids)).all() if habit_ids else []
    total_checkins = len(checkins)
    total_habits = len(habits)

    # 4. 体质测评异常
    recent_tests = db.query(ConstitutionTest).filter(
        ConstitutionTest.user_id.in_(student_ids),
        ConstitutionTest.date >= today - timedelta(days=30),
    ).all()
    constitution_types = {}
    for t in recent_tests:
        constitution_types[t.result_type] = constitution_types.get(t.result_type, 0) + 1

    # 5. 作息异常学生（连续睡眠质量<3超过3天）
    anomaly_students = []
    for sid in student_ids:
        recent_routines = [r for r in routines if r.user_id == sid]
        low_sleep_days = [r for r in recent_routines if r.sleep_quality and r.sleep_quality < 3]
        if len(low_sleep_days) >= 3:
            prof = db.query(UserProfile).filter(UserProfile.user_id == sid).first()
            anomaly_students.append({
                "user_id": sid,
                "nickname": prof.nickname if prof else f"学生{sid}",
                "low_sleep_days": len(low_sleep_days),
                "avg_quality": round(sum(r.sleep_quality for r in recent_routines if r.sleep_quality) / max(len([r for r in recent_routines if r.sleep_quality]), 1), 1),
            })

    # 6. 压力异常学生（最近压力>=4）
    high_stress_students = []
    for sid in student_ids:
        student_moods = [m for m in moods if m.user_id == sid]
        high_stress = [m for m in student_moods if m.stress_level and m.stress_level >= 4]
        if len(high_stress) >= 1:
            prof = db.query(UserProfile).filter(UserProfile.user_id == sid).first()
            high_stress_students.append({
                "user_id": sid,
                "nickname": prof.nickname if prof else f"学生{sid}",
                "high_stress_days": len(high_stress),
                "avg_stress": round(sum(m.stress_level for m in student_moods if m.stress_level) / max(len([m for m in student_moods if m.stress_level]), 1), 1),
            })

    student_names = [p.nickname or f"用户{p.user_id}" for p in student_profiles]

    return {
        "class_name": class_name,
        "student_count": len(student_ids),
        "students": student_names,
        "sleep": {
            "avg_quality": avg_sleep_quality,
            "avg_hours": avg_sleep_hours,
            "records_this_week": len(routines),
        },
        "mood": {
            "avg_mood": avg_mood,
            "avg_stress": avg_stress,
            "records_this_week": len(moods),
        },
        "habits": {
            "total_checkins": total_checkins,
            "total_habits": total_habits,
        },
        "constitution_distribution": constitution_types,
        "anomalies": {
            "low_sleep": anomaly_students[:10],
            "high_stress": high_stress_students[:10],
        },
    }
