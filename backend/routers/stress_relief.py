from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
from services.stress_service import (
    get_stress_questions, submit_assessment, get_counseling_info,
    get_campus_hospital_info, get_breathing_exercises,
)
from services.exceptions import DomainException

router = APIRouter(prefix="/api/stress", tags=["stress"])


@router.get("/assessment/questions")
def questions():
    return get_stress_questions()


@router.post("/assessment/submit")
def submit(answers: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return submit_assessment(db, current_user.id, answers.get("answers", []))
    except DomainException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get("/hospital")
def hospital():
    return get_campus_hospital_info()


@router.get("/counseling")
def counseling():
    return get_counseling_info()


@router.get("/breathing")
def breathing():
    return get_breathing_exercises()
