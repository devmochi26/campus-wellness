import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, StressAssessment
from auth import get_current_user

router = APIRouter(prefix="/api/stress", tags=["stress"])

STRESS_QUESTIONS = [
    {"id": 1, "text": "过去一周，你感到紧张和压力大的频率？"},
    {"id": 2, "text": "过去一周，你感到无法控制生活中重要事情的频率？"},
    {"id": 3, "text": "过去一周，你对自己处理问题的能力感到自信吗？(*反向)"},
    {"id": 4, "text": "过去一周，你感到事情在按照你的意愿发展的频率？(*反向)"},
    {"id": 5, "text": "过去一周，你发现无法应对所有必须做的事情的频率？"},
    {"id": 6, "text": "过去一周，你能够控制生活中的烦躁情绪吗？(*反向)"},
    {"id": 7, "text": "过去一周，你感到自己在各方面都做得不错吗？(*反向)"},
    {"id": 8, "text": "过去一周，你因为超出控制的事情而生气吗？"},
    {"id": 9, "text": "过去一周，你感到困难堆积如山而无法克服吗？"},
    {"id": 10, "text": "过去一周，你睡眠质量受压力影响的程度？"},
]

COUNSELING_INFO = {
    "name": "校内心理咨询中心",
    "address": "前湖修贤社区（4栋学生咨询服务中心）",
    "phone": "18970987605",
    "hours": "周一至周五 9:00-17:00",
    "national_hotline": "12356",
    "tips": [
        "心理咨询是完全保密的",
        "高校心理咨询对学生免费",
        "如果不想面对面，可以先电话或线上咨询",
        "感到压力很正常，寻求帮助是勇敢的表现",
        "紧急情况可拨打全国心理健康热线：12356",
    ],
}

CAMPUS_HOSPITAL_INFO = {
    "name": "南昌大学校医院",
    "address": "前湖校区校医院",
    "hours": "24小时急诊 / 门诊 8:00-17:30",
    "tips": [
        "持校园卡就诊可享受学生医保报销",
        "急诊24小时开放，夜间不适可直接前往",
        "轻微不适建议先到校医院，不必直接去大医院排队",
        "定期体检项目可在校医院完成",
    ],
}

BREATHING_EXERCISES = [
    {"name": "4-7-8呼吸法", "inhale": 4, "hold": 7, "exhale": 8, "rounds": 4, "description": "经典放松呼吸法，适合入睡前或焦虑时"},
    {"name": "方块呼吸", "inhale": 4, "hold": 4, "exhale": 4, "rounds": 5, "description": "简单易学，四个阶段均匀分配，适合考前放松"},
    {"name": "腹式深呼吸", "inhale": 5, "hold": 0, "exhale": 5, "rounds": 10, "description": "关注腹部起伏，适合日常减压"},
]


@router.get("/assessment/questions")
def get_questions():
    return {"questions": STRESS_QUESTIONS}


@router.post("/assessment/submit")
def submit_assessment(answers: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ans_list = answers.get("answers", [])
    if len(ans_list) != 10:
        return {"error": "请回答所有10道题"}

    # Reverse questions: 3,4,6,7
    for i in [2, 3, 5, 6]:
        ans_list[i] = 6 - ans_list[i]

    total = sum(ans_list)
    if total <= 15:
        level = "low"
        level_text = "压力水平较低"
        advice = "你目前的压力在可控范围内，保持当前的应对策略。定期运动、保持社交联系。"
    elif total <= 25:
        level = "moderate"
        level_text = "压力水平中等"
        advice = "建议增加放松活动（运动/冥想/兴趣爱好），保证充足睡眠。如果持续两周以上，考虑预约心理咨询。"
    else:
        level = "high"
        level_text = "压力水平较高"
        advice = "你正在承受较大压力。建议优先处理最重要的1-2件事，降低非必要的期望值。强烈建议预约校内心理咨询。紧急时可拨打心理援助热线：12355。"

    assessment = StressAssessment(
        user_id=current_user.id,
        date=datetime.date.today(),
        score=total,
        level=level,
        tags=["stress_test"],
    )
    db.add(assessment)
    db.commit()

    return {"score": total, "max_score": 50, "level": level, "level_text": level_text, "advice": advice}


@router.get("/hospital")
def get_hospital():
    return CAMPUS_HOSPITAL_INFO


@router.get("/counseling")
def get_counseling():
    return COUNSELING_INFO


@router.get("/breathing")
def get_breathing():
    return {"exercises": BREATHING_EXERCISES}
