import datetime
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Group, GroupMember, WellnessPost, HabitCheckin
from auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["community"])

WELLNESS_TIPS = [
    {"title": "早起小技巧", "content": "把闹钟放远一点，必须下床才能关。起床后立刻拉开窗帘，自然光帮助唤醒身体。连续21天固定起床时间，生物钟自然形成。"},
    {"title": "久坐提醒", "content": "每坐45分钟起来活动5分钟，可以降低颈椎和腰椎问题的风险。试试番茄工作法：25分钟专注 + 5分钟活动。"},
    {"title": "饮食搭配", "content": "每天吃够5种颜色的食物（红/绿/黄/白/黑），营养更均衡。食堂打菜时注意荤素比例1:2，先吃菜再吃饭。"},
    {"title": "睡前放松", "content": "睡前1小时放下手机，可以看书、写日记、或泡个热水脚，有助改善睡眠质量。手机蓝光会抑制褪黑素分泌，影响入睡。"},
    {"title": "中医小知识", "content": "春养肝（早睡早起）、夏养心（午休养神）、秋养肺（多食润燥食物）、冬养肾（早卧晚起）。顺应季节调整作息和饮食。"},
    {"title": "喝水时间", "content": "早起一杯温水 → 上午10点 → 下午3点 → 晚饭前。少量多次比一次猛灌更健康。每天1.5-2升，运动后适量增加。"},
    {"title": "护眼知识", "content": "20-20-20法则：每看屏幕20分钟，看20英尺（6米）外的物体20秒。多眨眼保持眼睛湿润，使用人工泪液缓解干眼。"},
    {"title": "运动贴士", "content": "不需要大块时间运动。每天3个10分钟的运动效果不输于一次30分钟。利用课间、午休、睡前分散锻炼。"},
    {"title": "情绪调节", "content": "情绪低落时可以试试「5-4-3-2-1」感官法：看5样东西→摸4样→听3种声音→闻2种气味→尝1种味道，快速回到当下。"},
    {"title": "宿舍睡眠", "content": "和室友协调作息时间，准备好眼罩和耳塞。床只用来睡觉，不要在床复习或看手机，建立「床=睡眠」的条件反射。"},
    {"title": "考试减压", "content": "考试前焦虑是正常的。深呼吸4秒→屏息4秒→呼气6秒，重复3次。考前不要突击新内容，回顾已掌握的增强信心。"},
    {"title": "肠胃养护", "content": "大学食堂偏油腻重口，建议每周2-3天清淡饮食给肠胃放假。饭后散步15分钟助消化，不要吃完就趴着睡午觉。"},
    {"title": "颈椎保护", "content": "手机举到与眼睛平行，不要长时间低头。枕头高度以压缩后一拳为宜（约8-10cm），太高太低都会加重颈椎负担。"},
    {"title": "季节养生", "content": "换季易感冒，注意脖子和脚踝保暖。教室空调不要直吹后颈，随身带件薄外套。换季时多吃富含维C的水果增强抵抗力。"},
    {"title": "正念饮食", "content": "吃饭时放下手机，专心咀嚼每一口（每口嚼20-30下）。这样不仅帮助消化，还能及时感知饱腹感，避免过量。"},
    {"title": "社交充电", "content": "偶尔一个人待着不等于孤独，是给自己充电。但如果连续3天以上不想社交，可以约好朋友一起吃个饭或散个步。"},
]


def _gen_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.get("/tips")
def get_tips():
    return {"tips": WELLNESS_TIPS}


@router.post("/groups")
def create_group(name: str = "", group_type: str = "dorm", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not name.strip():
        raise HTTPException(status_code=400, detail="请输入小组名称")
    code = _gen_code()
    group = Group(name=name.strip(), type=group_type, invite_code=code, creator_id=current_user.id)
    db.add(group)
    db.flush()
    member = GroupMember(group_id=group.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return {"group": {"id": group.id, "name": group.name, "type": group.type, "invite_code": group.invite_code}}


@router.post("/groups/join")
def join_group(code: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.invite_code == code.strip().upper()).first()
    if not group:
        raise HTTPException(status_code=404, detail="小组不存在或邀请码错误")
    existing = db.query(GroupMember).filter(
        GroupMember.group_id == group.id,
        GroupMember.user_id == current_user.id,
    ).first()
    if existing:
        return {"ok": True, "message": "你已在该小组中"}
    member = GroupMember(group_id=group.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    return {"ok": True, "group": {"id": group.id, "name": group.name}}


@router.get("/groups")
def get_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()
    group_ids = [m.group_id for m in memberships]
    groups = db.query(Group).filter(Group.id.in_(group_ids)).all() if group_ids else []
    return {"groups": groups}


@router.get("/groups/{group_id}/leaderboard")
def get_leaderboard(group_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    today = datetime.date.today()
    leaderboard = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        checkins = db.query(HabitCheckin).filter(
            HabitCheckin.habit.has(user_id=m.user_id),
            HabitCheckin.date == today,
        ).count()
        leaderboard.append({
            "user_id": m.user_id,
            "nickname": user.profile.nickname if user and user.profile else f"用户{m.user_id}",
            "checkins_today": checkins,
        })
    leaderboard.sort(key=lambda x: x["checkins_today"], reverse=True)
    return {"leaderboard": leaderboard}


@router.get("/posts")
def get_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(WellnessPost).order_by(WellnessPost.created_at.desc()).limit(30).all()
    result = []
    for p in posts:
        result.append({
            "id": p.id,
            "user_id": p.user_id,
            "content": p.content,
            "is_anonymous": p.is_anonymous,
            "tags": p.tags or [],
            "created_at": p.created_at.isoformat() if p.created_at else "",
            "author": "匿名同学" if p.is_anonymous else (p.user.profile.nickname if p.user and p.user.profile else "同学"),
        })
    return {"posts": result}


@router.post("/posts")
def create_post(content: str = "", is_anonymous: bool = False, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not content.strip():
        raise HTTPException(status_code=400, detail="内容不能为空")
    if len(content) > 1000:
        raise HTTPException(status_code=400, detail="内容超过1000字")
    post = WellnessPost(
        user_id=current_user.id,
        content=content.strip(),
        is_anonymous=is_anonymous,
        tags=[],
    )
    db.add(post)
    db.commit()
    return {"ok": True}


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    post = db.query(WellnessPost).filter(
        WellnessPost.id == post_id,
        WellnessPost.user_id == current_user.id,
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在或无权删除")
    db.delete(post)
    db.commit()
    return {"ok": True}
