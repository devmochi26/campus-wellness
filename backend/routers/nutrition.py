import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, CanteenFood, MealPlan, DietRecord
from auth import get_current_user

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])

# Seed food data
CANTEEN_FOOD_DATA = [
    {"name": "白米饭", "category": "主食", "calories": 200, "protein": 4, "fat": 0.5, "carbs": 45, "healthy_score": 3, "suitable_for": ["养胃"]},
    {"name": "杂粮饭", "category": "主食", "calories": 180, "protein": 5, "fat": 1, "carbs": 40, "healthy_score": 4, "suitable_for": ["减脂", "养胃"]},
    {"name": "馒头", "category": "主食", "calories": 220, "protein": 6, "fat": 1, "carbs": 44, "healthy_score": 3, "suitable_for": ["养胃"]},
    {"name": "面条", "category": "主食", "calories": 250, "protein": 7, "fat": 1, "carbs": 50, "healthy_score": 3, "suitable_for": ["养胃"]},
    {"name": "红薯", "category": "主食", "calories": 100, "protein": 2, "fat": 0.2, "carbs": 24, "healthy_score": 5, "suitable_for": ["减脂", "护眼"]},
    {"name": "番茄炒蛋", "category": "荤菜", "calories": 150, "protein": 8, "fat": 10, "carbs": 6, "healthy_score": 4, "suitable_for": ["护眼", "经期"]},
    {"name": "红烧鸡腿", "category": "荤菜", "calories": 220, "protein": 25, "fat": 12, "carbs": 2, "healthy_score": 3, "suitable_for": ["增肌"]},
    {"name": "清蒸鱼", "category": "荤菜", "calories": 140, "protein": 20, "fat": 5, "carbs": 1, "healthy_score": 5, "suitable_for": ["护眼", "减脂", "增肌"]},
    {"name": "宫保鸡丁", "category": "荤菜", "calories": 280, "protein": 22, "fat": 18, "carbs": 8, "healthy_score": 3, "suitable_for": ["增肌"]},
    {"name": "红烧肉", "category": "荤菜", "calories": 350, "protein": 15, "fat": 30, "carbs": 5, "healthy_score": 2, "suitable_for": []},
    {"name": "炒青菜", "category": "素菜", "calories": 60, "protein": 3, "fat": 3, "carbs": 5, "healthy_score": 5, "suitable_for": ["减脂", "护眼", "经期"]},
    {"name": "麻婆豆腐", "category": "素菜", "calories": 120, "protein": 8, "fat": 8, "carbs": 4, "healthy_score": 4, "suitable_for": ["护眼"]},
    {"name": "凉拌黄瓜", "category": "素菜", "calories": 30, "protein": 1, "fat": 0, "carbs": 5, "healthy_score": 5, "suitable_for": ["减脂"]},
    {"name": "西兰花炒木耳", "category": "素菜", "calories": 80, "protein": 5, "fat": 3, "carbs": 8, "healthy_score": 5, "suitable_for": ["护眼", "减脂", "养胃"]},
    {"name": "菠菜", "category": "素菜", "calories": 40, "protein": 3, "fat": 0.5, "carbs": 5, "healthy_score": 5, "suitable_for": ["护眼", "经期"]},
    {"name": "紫菜蛋花汤", "category": "汤粥", "calories": 40, "protein": 3, "fat": 1, "carbs": 4, "healthy_score": 5, "suitable_for": ["养胃", "熬夜修复"]},
    {"name": "小米粥", "category": "汤粥", "calories": 80, "protein": 2, "fat": 0.5, "carbs": 16, "healthy_score": 5, "suitable_for": ["养胃", "熬夜修复"]},
    {"name": "皮蛋瘦肉粥", "category": "汤粥", "calories": 130, "protein": 7, "fat": 5, "carbs": 15, "healthy_score": 3, "suitable_for": ["养胃"]},
    {"name": "豆浆", "category": "饮品", "calories": 40, "protein": 4, "fat": 2, "carbs": 2, "healthy_score": 5, "suitable_for": ["护眼", "经期"]},
    {"name": "牛奶", "category": "饮品", "calories": 120, "protein": 6, "fat": 6, "carbs": 9, "healthy_score": 5, "suitable_for": ["增肌", "经期"]},
    {"name": "鸡胸肉沙拉", "category": "轻食", "calories": 180, "protein": 28, "fat": 5, "carbs": 6, "healthy_score": 5, "suitable_for": ["减脂", "增肌"]},
    {"name": "三明治", "category": "轻食", "calories": 260, "protein": 10, "fat": 12, "carbs": 28, "healthy_score": 3, "suitable_for": []},
    {"name": "麻辣烫(清汤)", "category": "小吃", "calories": 300, "protein": 12, "fat": 15, "carbs": 25, "healthy_score": 2, "suitable_for": []},
    {"name": "饺子(10个)", "category": "小吃", "calories": 350, "protein": 14, "fat": 15, "carbs": 38, "healthy_score": 3, "suitable_for": []},
    {"name": "蒸蛋", "category": "荤菜", "calories": 80, "protein": 8, "fat": 5, "carbs": 1, "healthy_score": 5, "suitable_for": ["养胃", "增肌"]},
    {"name": "胡萝卜炒肉", "category": "荤菜", "calories": 160, "protein": 12, "fat": 10, "carbs": 8, "healthy_score": 4, "suitable_for": ["护眼"]},
    {"name": "香蕉", "category": "水果", "calories": 90, "protein": 1, "fat": 0, "carbs": 22, "healthy_score": 4, "suitable_for": ["熬夜修复"]},
    {"name": "苹果", "category": "水果", "calories": 60, "protein": 0.5, "fat": 0, "carbs": 15, "healthy_score": 5, "suitable_for": ["减脂"]},
    {"name": "红枣枸杞粥", "category": "汤粥", "calories": 110, "protein": 3, "fat": 0.5, "carbs": 22, "healthy_score": 5, "suitable_for": ["经期", "养胃", "熬夜修复"]},
    {"name": "核桃仁", "category": "零食", "calories": 160, "protein": 6, "fat": 14, "carbs": 4, "healthy_score": 4, "suitable_for": ["护眼", "熬夜修复"]},
]

RECOMMENDATIONS = {
    "养胃": {
        "title": "养胃饮食方案",
        "tips": ["三餐定时定量，细嚼慢咽", "少吃生冷辛辣", "多吃温热软烂食物", "饭后散步15分钟"],
        "foods": ["小米粥", "蒸蛋", "白米饭", "馒头", "紫菜蛋花汤", "红枣枸杞粥", "炒青菜", "皮蛋瘦肉粥", "面条", "杂粮饭"],
    },
    "护眼": {
        "title": "护眼饮食方案",
        "tips": ["多吃深色蔬菜和黄色水果", "每周吃2-3次鱼类", "控制屏幕时间", "每45分钟远眺5分钟"],
        "foods": ["胡萝卜炒肉", "菠菜", "番茄炒蛋", "清蒸鱼", "麻婆豆腐", "西兰花炒木耳", "红薯", "核桃仁", "豆浆", "炒青菜"],
    },
    "减脂": {
        "title": "减脂饮食方案",
        "tips": ["控制总热量，每餐7分饱", "晚餐尽量在19点前吃完", "多蛋白质少碳水", "避免含糖饮料和油炸"],
        "foods": ["鸡胸肉沙拉", "杂粮饭", "清蒸鱼", "凉拌黄瓜", "红薯", "西兰花炒木耳", "苹果", "炒青菜"],
    },
    "增肌": {
        "title": "增肌饮食方案",
        "tips": ["保证每餐都有优质蛋白", "运动后30分钟内补充蛋白质", "每天摄入足够碳水提供训练能量", "多餐制，每天5-6餐"],
        "foods": ["清蒸鱼", "宫保鸡丁", "红烧鸡腿", "鸡胸肉沙拉", "牛奶", "蒸蛋", "豆浆"],
    },
    "经期": {
        "title": "经期护理饮食",
        "tips": ["多吃含铁丰富食物", "喝温热饮品，避免冷饮", "适量补充维生素B族", "减少咖啡因"],
        "foods": ["红枣枸杞粥", "菠菜", "番茄炒蛋", "牛奶", "豆浆", "炒青菜", "小米粥"],
    },
    "熬夜修复": {
        "title": "熬夜修复饮食",
        "tips": ["多喝水加速代谢废物排出", "补充B族维生素", "吃富含抗氧化物的食物", "避免高糖高脂加重疲劳"],
        "foods": ["红枣枸杞粥", "小米粥", "紫菜蛋花汤", "核桃仁", "香蕉", "豆浆"],
    },
}


def _seed_foods(db: Session):
    if db.query(CanteenFood).count() == 0:
        for f in CANTEEN_FOOD_DATA:
            db.add(CanteenFood(**f))
        db.commit()


@router.get("/foods")
def search_foods(search: str = Query(""), category: str = Query(""), db: Session = Depends(get_db)):
    _seed_foods(db)
    q = db.query(CanteenFood)
    if search:
        q = q.filter(CanteenFood.name.contains(search))
    if category:
        q = q.filter(CanteenFood.category == category)
    foods = q.limit(50).all()
    return {"foods": foods, "categories": list(set(f.category for f in db.query(CanteenFood).all()))}


@router.get("/recommend")
def get_recommend(goal: str = Query("养胃")):
    return RECOMMENDATIONS.get(goal, {})


@router.get("/summary")
def get_summary(date: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    diets = db.query(DietRecord).filter(
        DietRecord.user_id == current_user.id,
        DietRecord.date == date,
    ).all()

    total_calories = sum(d.calories for d in diets if d.calories)
    total_healthy = sum(d.healthy_score for d in diets)

    return {
        "date": date,
        "meals": len(diets),
        "total_calories": total_calories,
        "avg_healthy": round(total_healthy / len(diets), 1) if diets else 0,
        "recommendation": "三餐齐全，继续保持！" if len(diets) >= 3 else "今天餐数不足，记得按时吃饭哦",
    }


@router.post("/meal-plans")
def save_meal_plan(goal: str = Query(), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = MealPlan(
        user_id=current_user.id,
        goal=goal,
        meals=RECOMMENDATIONS.get(goal, {}).get("foods", []),
        start_date=datetime.date.today(),
    )
    db.add(plan)
    db.commit()
    return {"ok": True, "plan": RECOMMENDATIONS.get(goal, {})}


@router.get("/meal-plans")
def get_meal_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
    ).order_by(MealPlan.start_date.desc()).limit(5).all()
    return {"plans": plans}
