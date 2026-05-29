from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from services.nutrition_service import search_foods, get_recommendation, get_summary, save_meal_plan, get_meal_plans

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.get("/foods")
def foods(search: str = Query(""), category: str = Query(""), region: str = Query(""), db: Session = Depends(get_db)):
    return search_foods(db, search, category, region)


@router.get("/recommend")
def recommend(goal: str = Query("养胃")):
    return get_recommendation(goal)


@router.get("/summary")
def summary(date: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_summary(db, current_user.id, date)


@router.post("/meal-plans")
def create_meal_plan(goal: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return save_meal_plan(db, current_user.id, goal)


@router.get("/meal-plans")
def meal_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_meal_plans(db, current_user.id)
