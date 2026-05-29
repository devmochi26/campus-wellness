from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserRegister, UserLogin, TokenResponse
from services.auth_service import register_user, login_user
from services.exceptions import DomainException, ConflictException

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    try:
        _, token = register_user(db, data.username, data.password, data.class_name)
        return TokenResponse(access_token=token)
    except (ConflictException, DomainException) as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    try:
        token = login_user(db, data.username, data.password)
        return TokenResponse(access_token=token)
    except DomainException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
