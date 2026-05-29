from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, SleepPreference
from schemas import SleepPreferenceCreate, SleepPreferenceResponse, SleepRecommendation, SleepReport
from auth import get_current_user
from services.sleep_service import (
    get_scenarios, get_recommendation, get_sleep_report, save_preferences, get_preferences,
)

router = APIRouter(prefix="/api/sleep", tags=["sleep"])


@router.get("/scenarios")
def scenarios():
    return get_scenarios()


@router.get("/recommendation", response_model=SleepRecommendation)
def recommendation(
    wake_time: str = Query(description="HH:MM, e.g. 07:30"),
    class_start: Optional[str] = Query(None, description="HH:MM, first class time"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_recommendation(db, current_user.id, wake_time, class_start)


@router.get("/report", response_model=SleepReport)
def sleep_report(
    period: str = Query("weekly", description="weekly or monthly"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_sleep_report(db, current_user.id, period)


@router.post("/preferences", response_model=SleepPreferenceResponse)
def save_prefs(
    data: SleepPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return save_preferences(db, current_user.id, data)


@router.get("/preferences", response_model=Optional[SleepPreferenceResponse])
def get_prefs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_preferences(db, current_user.id)
