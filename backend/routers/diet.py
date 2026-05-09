import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, DietRecord
from schemas import DietCreate, DietResponse
from auth import get_current_user

router = APIRouter(prefix="/api/diet", tags=["diet"])


@router.post("", response_model=DietResponse)
def create_diet(data: DietCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = DietRecord(
        user_id=current_user.id,
        date=datetime.date.fromisoformat(data.date),
        meal_type=data.meal_type,
        food_name=data.food_name,
        calories=data.calories,
        healthy_score=data.healthy_score,
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=list[DietResponse])
def get_diets(
    date: str = Query(description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = db.query(DietRecord).filter(
        DietRecord.user_id == current_user.id,
        DietRecord.date == date,
    ).order_by(DietRecord.id.desc()).all()
    return records


@router.delete("/{diet_id}")
def delete_diet(diet_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(DietRecord).filter(
        DietRecord.id == diet_id,
        DietRecord.user_id == current_user.id,
    ).first()
    if not record:
        return {"ok": False}
    db.delete(record)
    db.commit()
    return {"ok": True}
