import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, ExerciseRecord
from schemas import ExerciseCreate, ExerciseResponse
from auth import get_current_user

router = APIRouter(prefix="/api/exercise", tags=["exercise"])


@router.post("", response_model=ExerciseResponse)
def create_exercise(data: ExerciseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = ExerciseRecord(
        user_id=current_user.id,
        date=datetime.date.fromisoformat(data.date),
        exercise_type=data.exercise_type,
        duration_min=data.duration_min,
        intensity=data.intensity,
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[ExerciseResponse])
def get_exercises(
    date: str = Query(description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = db.query(ExerciseRecord).filter(
        ExerciseRecord.user_id == current_user.id,
        ExerciseRecord.date == date,
    ).order_by(ExerciseRecord.id.desc()).all()
    return records


@router.delete("/{exercise_id}")
def delete_exercise(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(ExerciseRecord).filter(
        ExerciseRecord.id == exercise_id,
        ExerciseRecord.user_id == current_user.id,
    ).first()
    if not record:
        return {"ok": False}
    db.delete(record)
    db.commit()
    return {"ok": True}
