from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import HabitCreate, HabitUpdate, HabitResponse
from auth import get_current_user
from services.habit_service import create_habit, get_habits, update_habit, delete_habit, checkin_habit, get_habit_streak
from services.exceptions import NotFoundException

router = APIRouter(prefix="/api/habits", tags=["habits"])


@router.post("", response_model=HabitResponse)
def create(data: HabitCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = create_habit(db, current_user.id, data)
    return get_habit_streak(db, habit.id, current_user.id)


@router.get("", response_model=list[HabitResponse])
def list_habits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_habits(db, current_user.id)


@router.put("/{habit_id}", response_model=HabitResponse)
def update(habit_id: int, data: HabitUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        update_habit(db, habit_id, current_user.id, data)
        return get_habit_streak(db, habit_id, current_user.id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.delete("/{habit_id}")
def delete(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_habit(db, habit_id, current_user.id)
        return {"ok": True}
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/{habit_id}/check", response_model=HabitResponse)
def checkin(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return checkin_habit(db, habit_id, current_user.id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get("/{habit_id}/streak")
def streak(habit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return get_habit_streak(db, habit_id, current_user.id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
