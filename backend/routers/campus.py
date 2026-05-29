from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserProfile, CourseSchedule, HealthPoints
from auth import get_current_user
from services.counselor_service import get_class_overview
from datetime import date, timedelta

router = APIRouter(prefix="/api/campus", tags=["campus"])


# ===== 角色管理 =====

@router.get("/role")
def get_role(current_user: User = Depends(get_current_user)):
    return {"role": current_user.role}


@router.post("/role")
def set_role(role: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if role not in ("student", "counselor"):
        return {"error": "无效角色"}
    current_user.role = role
    db.commit()
    return {"role": role}


# ===== 班级设置 =====

@router.post("/class-name")
def set_class_name(class_name: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    class_name = class_name.strip()
    if not class_name:
        return {"error": "班级名不能为空"}
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, class_name=class_name)
        db.add(profile)
    else:
        profile.class_name = class_name
    db.commit()
    return {"class_name": class_name}


# ===== 辅导员看板 =====

@router.get("/counselor/overview")
def counselor_overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        if current_user.role != "counselor":
            return {"error": "仅辅导员可访问", "role": current_user.role}
        # 确保 UserProfile 存在
        from models import UserProfile
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.add(profile)
            db.commit()
        return get_class_overview(db, current_user.id)
    except Exception as e:
        return {"error": str(e), "type": type(e).__name__}


# ===== 课程表 =====

@router.get("/courses")
def get_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = db.query(CourseSchedule).filter(
        CourseSchedule.user_id == current_user.id
    ).order_by(CourseSchedule.day_of_week, CourseSchedule.start_time).all()
    return {"courses": courses}


@router.post("/courses")
def save_course(
    day_of_week: int = Query(),
    course_name: str = Query(),
    start_time: str = Query(),
    end_time: str = Query(),
    has_pe: bool = Query(False),
    location: str = Query(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = CourseSchedule(
        user_id=current_user.id,
        day_of_week=day_of_week,
        course_name=course_name,
        start_time=start_time,
        end_time=end_time,
        has_pe=has_pe,
        location=location,
    )
    db.add(course)
    db.commit()
    return {"ok": True, "id": course.id}


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CourseSchedule).filter(
        CourseSchedule.id == course_id,
        CourseSchedule.user_id == current_user.id,
    ).delete()
    db.commit()
    return {"ok": True}


# ===== 明日课程提醒（睡眠推荐用） =====

@router.get("/tomorrow-schedule")
def tomorrow_schedule(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tomorrow = (date.today() + timedelta(days=1)).isoweekday()  # 1=Mon
    courses = db.query(CourseSchedule).filter(
        CourseSchedule.user_id == current_user.id,
        CourseSchedule.day_of_week == tomorrow,
    ).order_by(CourseSchedule.start_time).all()

    has_pe = any(c.has_pe for c in courses)
    earliest = courses[0] if courses else None

    return {
        "day": tomorrow,
        "course_count": len(courses),
        "has_pe": has_pe,
        "earliest_course": earliest.course_name if earliest else None,
        "earliest_time": earliest.start_time if earliest else None,
        "pe_reminder": "明天有体育课，建议今晚保证8小时睡眠，提前30分钟入睡" if has_pe else None,
    }


# ===== 健康积分 =====

@router.get("/points")
def get_points(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pts = db.query(HealthPoints).filter(HealthPoints.user_id == current_user.id).first()
    if not pts:
        pts = HealthPoints(user_id=current_user.id)
        db.add(pts)
        db.commit()
    return {"total_points": pts.total_points, "weekly_points": pts.weekly_points}


@router.post("/points/add")
def add_points(
    amount: int = Query(default=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pts = db.query(HealthPoints).filter(HealthPoints.user_id == current_user.id).first()
    if not pts:
        pts = HealthPoints(user_id=current_user.id)
        db.add(pts)

    # 每周重置
    today = date.today()
    if pts.last_week_reset and (today - pts.last_week_reset).days >= 7:
        pts.weekly_points = 0
        pts.last_week_reset = today

    pts.total_points += amount
    pts.weekly_points += amount
    db.commit()
    return {"total_points": pts.total_points, "weekly_points": pts.weekly_points}
