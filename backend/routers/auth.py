from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserProfile
from schemas import UserRegister, UserLogin, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="密码至少6位")

    user = User(username=data.username, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()

    profile = UserProfile(user_id=user.id, nickname=data.username)
    db.add(profile)
    db.commit()

    token = create_access_token({"user_id": user.id})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({"user_id": user.id})
    return TokenResponse(access_token=token)
