from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from services.health_service import get_profile, get_risks

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_profile(db, current_user.id)


@router.get("/risks")
def risks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_risks(db, current_user.id)
