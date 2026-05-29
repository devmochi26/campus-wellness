from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from services.dashboard_service import get_today_dashboard, get_weekly_dashboard

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/today")
def today_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_today_dashboard(db, current_user.id)


@router.get("/weekly")
def weekly_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_weekly_dashboard(db, current_user.id)
