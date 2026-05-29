from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from services.community_service import (
    get_tips, create_group, join_group, get_user_groups,
    get_leaderboard, get_posts, create_post, delete_post,
)
from services.exceptions import NotFoundException, DomainException

router = APIRouter(prefix="/api/community", tags=["community"])


@router.get("/tips")
def tips():
    return get_tips()


@router.post("/groups")
def create(name: str = "", group_type: str = "dorm", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return create_group(db, current_user.id, name, group_type)
    except DomainException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.post("/groups/join")
def join(code: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return join_group(db, current_user.id, code)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get("/groups")
def groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_groups(db, current_user.id)


@router.get("/groups/{group_id}/leaderboard")
def leaderboard(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_leaderboard(db, group_id)


@router.get("/posts")
def posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_posts(db)


@router.post("/posts")
def create(content: str = "", is_anonymous: bool = False, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return create_post(db, current_user.id, content, is_anonymous)
    except DomainException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.delete("/posts/{post_id}")
def delete(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        delete_post(db, post_id, current_user.id)
        return {"ok": True}
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
