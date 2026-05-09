import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, DailyRoutine
from typing import Optional
from schemas import RoutineCreate, RoutineResponse
from auth import get_current_user

router = APIRouter(prefix="/api/routines", tags=["routines"])


@router.post("", response_model=RoutineResponse)
def create_routine(data: RoutineCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date == data.date,
    ).first()

    if existing:
        for key, value in data.model_dump().items():
            if key != "date":
                setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing

    routine = DailyRoutine(
        user_id=current_user.id,
        date=datetime.date.fromisoformat(data.date),
        wake_time=datetime.time.fromisoformat(data.wake_time) if data.wake_time else None,
        sleep_time=datetime.time.fromisoformat(data.sleep_time) if data.sleep_time else None,
        sleep_quality=data.sleep_quality,
        screen_hours=data.screen_hours,
        water_cups=data.water_cups,
        notes=data.notes,
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return routine


@router.get("", response_model=Optional[RoutineResponse])
def get_routine(
    date: str = Query(description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    routine = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date == date,
    ).first()
    return routine


@router.get("/weekly", response_model=list[RoutineResponse])
def get_weekly_routines(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=6)
    routines = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date >= week_ago,
        DailyRoutine.date <= today,
    ).order_by(DailyRoutine.date).all()
    return routines
