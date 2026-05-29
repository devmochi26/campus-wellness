from sqlalchemy.orm import Session
from models import User, UserProfile
from auth import hash_password, verify_password, create_access_token
from services.exceptions import ConflictException, DomainException


def register_user(db: Session, username: str, password: str, class_name: str = "") -> tuple[User, str]:
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise ConflictException("用户名已存在")

    if len(password) < 6:
        raise DomainException("密码至少6位")

    user = User(username=username, password_hash=hash_password(password))
    db.add(user)
    db.flush()

    profile = UserProfile(user_id=user.id, nickname=username, class_name=class_name.strip())
    db.add(profile)
    db.commit()

    token = create_access_token({"user_id": user.id})
    return user, token


def login_user(db: Session, username: str, password: str) -> str:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise DomainException("用户名或密码错误")

    token = create_access_token({"user_id": user.id})
    return token
