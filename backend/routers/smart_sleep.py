import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, DailyRoutine, SleepPreference
from schemas import SleepPreferenceCreate, SleepPreferenceResponse, SleepRecommendation, SleepReport
from auth import get_current_user

router = APIRouter(prefix="/api/sleep", tags=["sleep"])

# Scene-based advice presets (frontend could store this, but backend for extensibility)
SCENARIOS = {
    "exam_week": {
        "title": "考试周作息调整",
        "tips": [
            "每天保证至少6小时睡眠，通宵会严重降低记忆效率",
            "上午9-11点、下午3-5点是最佳学习时段，效率低谷时小睡20分钟",
            "睡前1小时远离屏幕，用纸质笔记复习有利于入睡",
            "早饭必须在考试前1小时吃完，避免考试时血糖波动",
        ],
        "schedule": {"wake": "07:00", "sleep": "01:00", "nap": "20min 午饭后"},
    },
    "holiday_return": {
        "title": "假期返校作息恢复",
        "tips": [
            "每天提前15分钟起床，用3-5天渐进调整回学校作息",
            "返校前3天开始减少晚上屏幕时间",
            "到达学校当天不要午睡超过30分钟，晚上自然困倦",
            "早上晒10分钟太阳帮助重置生物钟",
        ],
        "schedule": {"wake": "07:30", "sleep": "23:30", "nap": "20min"},
    },
    "late_night_recovery": {
        "title": "熬夜补救指南",
        "tips": [
            "第二天不要睡到中午，尽量在平时起床时间±2小时内起来",
            "上午多晒太阳，帮助身体恢复昼夜节律",
            "午休控制在20-30分钟，不要超过30分钟",
            "多喝水加速代谢，避免高糖高油食物加重疲劳",
            "晚上比平时提前30分钟上床，给身体补觉机会",
        ],
        "schedule": {"wake": "08:30", "sleep": "22:30", "nap": "25min"},
    },
    "normal": {
        "title": "日常最佳作息",
        "tips": [
            "固定入睡和起床时间，周末也尽量不超过1小时偏差",
            "睡前1小时进行放松活动：阅读、冥想、轻柔拉伸",
            "卧室保持凉爽（18-22°C）、安静、黑暗",
            "下午2点后避免咖啡因",
        ],
        "schedule": {"wake": "07:00", "sleep": "23:00", "nap": "20min 午后"},
    },
}


@router.get("/scenarios")
def get_scenarios():
    return {"scenarios": SCENARIOS}


@router.get("/recommendation", response_model=SleepRecommendation)
def get_recommendation(
    wake_time: str = Query(description="HH:MM, e.g. 07:30"),
    class_start: Optional[str] = Query(None, description="HH:MM, first class time"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = db.query(SleepPreference).filter(SleepPreference.user_id == current_user.id).first()
    target_hours = pref.target_sleep_hours if pref else 7.5
    nap_dur = pref.nap_duration if pref else 20

    wh, wm = map(int, wake_time.split(":")[:2])
    wake_min = wh * 60 + wm

    # Bedtime = wake_time - target_sleep_hours
    bed_min = wake_min - int(target_hours * 60)
    if bed_min < 0:
        bed_min += 24 * 60
    bh, bm = divmod(bed_min, 60)
    bh = bh % 24
    bedtime = f"{bh:02d}:{bm:02d}"

    # Nap: 8 hours after wake (early afternoon)
    nap_min = wake_min + 8 * 60
    if nap_min >= 24 * 60:
        nap_min -= 24 * 60
    nh, nm = divmod(nap_min, 60)
    nh = nh % 24
    nap_time = f"{nh:02d}:{nm:02d}"

    reco = f"建议每晚{bedtime}前入睡，保证{target_hours}小时睡眠。"
    if class_start:
        ch, cm = map(int, class_start.split(":")[:2])
        prep_min = ch * 60 + cm - 60
        if prep_min < 0:
            prep_min += 24 * 60
        ph, pm = divmod(prep_min, 60)
        reco += f" 早上第一节课前预留1小时准备，建议{ph:02d}:{pm:02d}起床。"

    if target_hours < 7:
        reco += " 目前目标睡眠不足7小时，长期可能影响健康和学业表现。"

    return SleepRecommendation(
        wake_time=wake_time,
        target_bedtime=bedtime,
        nap_time=nap_time,
        nap_duration=nap_dur,
        recommendation=reco,
    )


@router.get("/report", response_model=SleepReport)
def get_sleep_report(
    period: str = Query("weekly", description="weekly or monthly"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = datetime.date.today()
    days = 7 if period == "weekly" else 30
    start = today - datetime.timedelta(days=days - 1)

    routines = db.query(DailyRoutine).filter(
        DailyRoutine.user_id == current_user.id,
        DailyRoutine.date >= start,
        DailyRoutine.date <= today,
    ).order_by(DailyRoutine.date).all()

    trends = []
    total_quality = 0
    quality_count = 0
    sleep_hours_list = []

    for r in routines:
        if r.wake_time and r.sleep_time:
            wt = r.wake_time.hour * 60 + r.wake_time.minute
            st = r.sleep_time.hour * 60 + r.sleep_time.minute
            hours = (wt - st) / 60
            if hours < 0:
                hours += 24
            hours = round(hours, 1)
            sleep_hours_list.append(hours)
        if r.sleep_quality:
            total_quality += r.sleep_quality
            quality_count += 1

        trends.append({
            "date": str(r.date),
            "sleep_quality": r.sleep_quality,
        })

    avg_quality = round(total_quality / quality_count, 1) if quality_count else 0
    avg_hours = round(sum(sleep_hours_list) / len(sleep_hours_list), 1) if sleep_hours_list else 0

    # Regularity: standard deviation of sleep times (lower = more regular)
    regularity = 0
    if len(sleep_hours_list) >= 3:
        mean = sum(sleep_hours_list) / len(sleep_hours_list)
        variance = sum((h - mean) ** 2 for h in sleep_hours_list) / len(sleep_hours_list)
        std = variance ** 0.5
        regularity = max(0, round(100 - std * 25, 1))

    return SleepReport(
        avg_sleep_hours=avg_hours,
        avg_quality=avg_quality,
        regularity=regularity,
        trend=trends,
    )


@router.post("/preferences", response_model=SleepPreferenceResponse)
def save_preferences(
    data: SleepPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(SleepPreference).filter(SleepPreference.user_id == current_user.id).first()
    if existing:
        for k, v in data.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    pref = SleepPreference(user_id=current_user.id, **data.model_dump())
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref


@router.get("/preferences", response_model=Optional[SleepPreferenceResponse])
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SleepPreference).filter(SleepPreference.user_id == current_user.id).first()
