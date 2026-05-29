from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import ProfileResponse, ProfileUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "nickname": current_user.profile.nickname if current_user.profile else "",
        "class_name": current_user.profile.class_name if current_user.profile else "",
    }


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
