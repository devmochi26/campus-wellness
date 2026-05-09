from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import ProfileResponse, ProfileUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user.profile


@router.put("/profile", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile
