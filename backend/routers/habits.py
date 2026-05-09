import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Habit, HabitCheckin
from schemas import HabitCreate, HabitUpdate, HabitResponse
from auth import get_current_user

router = APIRouter(prefix="/api/habits", tags=["habits"])


def _build_habit_response(habit, db):
    checkins = db.query(HabitCheckin).filter(HabitCheckin.habit_id == habit.id).all()
    checked_dates = [c.date.isoformat() for c in checkins]

    # Calculate current streak
    streak = 0
    today = datetime.date.today()
    for i in range(365):
        check_date = today - datetime.timedelta(days=i)
        if any(c.date == check_date for c in checkins):
            streak += 1
            if i > 0:
                prev_date = today - datetime.timedelta(days=i - 1)
                if not any(c.date == prev_date for c in checkins):
                    break
        else:
            if i > 0:
                break

    return HabitResponse(
        id=habit.id,
        name=habit.name,
        icon=habit.icon,
        category=habit.category,
        target_days=habit.target_days,
        is_active=habit.is_active,
        created_at=habit.created_at.isoformat() if habit.created_at else "",
        current_streak=streak,
        checked_dates=checked_dates,
    )


@router.post("", response_model=HabitResponse)
def create_habit(data: HabitCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = Habit(
        user_id=current_user.id,
        name=data.name,
        icon=data.icon,
        category=data.category,
        target_days=data.target_days,
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return _build_habit_response(habit, db)


@router.get("", response_model=list[HabitResponse])
def get_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
    ).order_by(Habit.created_at.desc()).all()
    return [_build_habit_response(h, db) for h in habits]


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, data: HabitUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    return _build_habit_response(habit, db)


@router.delete("/{habit_id}")
def delete_habit(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")
    db.delete(habit)
    db.commit()
    return {"ok": True}


@router.post("/{habit_id}/check", response_model=HabitResponse)
def checkin_habit(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")

    today = datetime.date.today()
    existing = db.query(HabitCheckin).filter(
        HabitCheckin.habit_id == habit_id,
        HabitCheckin.date == today,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
    else:
        checkin = HabitCheckin(habit_id=habit_id, date=today)
        db.add(checkin)
        db.commit()

    db.refresh(habit)
    return _build_habit_response(habit, db)


@router.get("/{habit_id}/streak")
def get_streak(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="习惯不存在")
    return _build_habit_response(habit, db)
