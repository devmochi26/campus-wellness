import datetime
from sqlalchemy.orm import Session
from models import Habit, HabitCheckin
from schemas import HabitResponse, HabitCreate, HabitUpdate
from services.exceptions import NotFoundException


def _build_habit_response(habit: Habit, db: Session) -> HabitResponse:
    today = datetime.date.today()
    checkins = db.query(HabitCheckin).filter(
        HabitCheckin.habit_id == habit.id,
    ).order_by(HabitCheckin.date.desc()).all()

    checked_dates = [str(c.date) for c in checkins]

    # Continuous streak
    streak = 0
    check_date = today
    checked_set = {str(c.date) for c in checkins}
    for _ in range(365):
        if str(check_date) in checked_set:
            streak += 1
            check_date -= datetime.timedelta(days=1)
        else:
            break

    return HabitResponse(
        id=habit.id,
        name=habit.name,
        icon=habit.icon,
        category=habit.category,
        target_days=habit.target_days,
        is_active=habit.is_active,
        created_at=str(habit.created_at),
        current_streak=streak,
        checked_dates=checked_dates,
    )


def create_habit(db: Session, user_id: int, data: HabitCreate) -> Habit:
    habit = Habit(user_id=user_id, **data.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def get_habits(db: Session, user_id: int) -> list[HabitResponse]:
    habits = db.query(Habit).filter(Habit.user_id == user_id).all()
    return [_build_habit_response(h, db) for h in habits]


def update_habit(db: Session, habit_id: int, user_id: int, data: HabitUpdate) -> Habit:
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        raise NotFoundException("习惯不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(habit, k, v)
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, habit_id: int, user_id: int) -> None:
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        raise NotFoundException("习惯不存在")
    db.delete(habit)
    db.commit()


def checkin_habit(db: Session, habit_id: int, user_id: int) -> HabitResponse:
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        raise NotFoundException("习惯不存在")

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

    return _build_habit_response(habit, db)


def get_habit_streak(db: Session, habit_id: int, user_id: int) -> HabitResponse:
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not habit:
        raise NotFoundException("习惯不存在")
    return _build_habit_response(habit, db)
