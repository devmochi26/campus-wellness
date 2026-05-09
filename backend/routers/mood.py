import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, MoodRecord
from typing import Optional
from schemas import MoodCreate, MoodResponse
from auth import get_current_user

router = APIRouter(prefix="/api/mood", tags=["mood"])


@router.post("", response_model=MoodResponse)
def create_mood(data: MoodCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.date == data.date,
    ).first()

    if existing:
        existing.mood_score = data.mood_score
        existing.mood_tags = data.mood_tags
        existing.stress_level = data.stress_level
        existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    record = MoodRecord(
        user_id=current_user.id,
        date=datetime.date.fromisoformat(data.date),
        mood_score=data.mood_score,
        mood_tags=data.mood_tags,
        stress_level=data.stress_level,
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=Optional[MoodResponse])
def get_mood(
    date: str = Query(description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.date == date,
    ).first()
    return record


@router.get("/weekly", response_model=list[MoodResponse])
def get_weekly_moods(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.date.today()
    week_ago = today - datetime.timedelta(days=6)
    records = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.date >= week_ago,
        MoodRecord.date <= today,
    ).order_by(MoodRecord.date).all()
    return records
