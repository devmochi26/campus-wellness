from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import ConstitutionSubmit, ConstitutionResultResponse
from auth import get_current_user
from services.constitution_service import get_questions_and_types, submit_test, get_history, get_advice
from services.exceptions import DomainException

router = APIRouter(prefix="/api/constitution", tags=["constitution"])


@router.get("/questions")
def questions():
    return get_questions_and_types()


@router.post("/submit", response_model=ConstitutionResultResponse)
def submit(data: ConstitutionSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return submit_test(db, current_user.id, data.answers)
    except DomainException as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))


@router.get("/history", response_model=list[ConstitutionResultResponse])
def history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_history(db, current_user.id)


@router.get("/advice/{constitution_type}")
def advice(constitution_type: str):
    return get_advice(constitution_type)
