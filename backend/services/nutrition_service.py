import datetime
from sqlalchemy.orm import Session
from models import CanteenFood, MealPlan, DietRecord


CANTEEN_FOOD_DATA = [
    # ===== 通用主食 =====
    {"name": "白米饭", "category": "主食", "calories": 200, "protein": 4, "fat": 0.5, "carbs": 45, "healthy_score": 3, "suitable_for": ["养胃"], "region": "通用"},
    {"name": "杂粮饭", "category": "主食", "calories": 180, "protein": 5, "fat": 1, "carbs": 40, "healthy_score": 4, "suitable_for": ["减脂", "养胃"], "region": "通用"},
    {"name": "馒头", "category": "主食", "calories": 220, "protein": 6, "fat": 1, "carbs": 44, "healthy_score": 3, "suitable_for": ["养胃"], "region": "通用"},
    {"name": "面条", "category": "主食", "calories": 250, "protein": 7, "fat": 1, "carbs": 50, "healthy_score": 3, "suitable_for": ["养胃"], "region": "通用"},
    {"name": "红薯", "category": "主食", "calories": 100, "protein": 2, "fat": 0.2, "carbs": 24, "healthy_score": 5, "suitable_for": ["减脂", "护眼"], "region": "通用"},
    {"name": "花卷", "category": "主食", "calories": 210, "protein": 6, "fat": 2, "carbs": 42, "healthy_score": 3, "suitable_for": ["养胃"], "region": "北方"},
    {"name": "大饼", "category": "主食", "calories": 260, "protein": 8, "fat": 3, "carbs": 48, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "煎饼果子", "category": "主食", "calories": 320, "protein": 12, "fat": 12, "carbs": 38, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "肉夹馍", "category": "主食", "calories": 350, "protein": 15, "fat": 14, "carbs": 40, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "河粉", "category": "主食", "calories": 230, "protein": 3, "fat": 2, "carbs": 48, "healthy_score": 3, "suitable_for": ["养胃"], "region": "南方"},
    {"name": "肠粉", "category": "主食", "calories": 160, "protein": 5, "fat": 3, "carbs": 28, "healthy_score": 4, "suitable_for": ["养胃", "减脂"], "region": "南方"},
    {"name": "粢饭团", "category": "主食", "calories": 300, "protein": 8, "fat": 10, "carbs": 45, "healthy_score": 3, "suitable_for": [], "region": "南方"},
    {"name": "米粉", "category": "主食", "calories": 200, "protein": 3, "fat": 1, "carbs": 44, "healthy_score": 3, "suitable_for": ["养胃"], "region": "南方"},
    {"name": "玉米", "category": "主食", "calories": 110, "protein": 3, "fat": 1.5, "carbs": 22, "healthy_score": 5, "suitable_for": ["减脂", "护眼"], "region": "通用"},
    {"name": "燕麦粥", "category": "主食", "calories": 90, "protein": 3, "fat": 1.5, "carbs": 16, "healthy_score": 5, "suitable_for": ["减脂", "养胃", "熬夜修复"], "region": "通用"},

    # ===== 北方荤菜 =====
    {"name": "番茄炒蛋", "category": "荤菜", "calories": 150, "protein": 8, "fat": 10, "carbs": 6, "healthy_score": 4, "suitable_for": ["护眼", "经期"], "region": "通用"},
    {"name": "宫保鸡丁", "category": "荤菜", "calories": 280, "protein": 22, "fat": 18, "carbs": 8, "healthy_score": 3, "suitable_for": ["增肌"], "region": "通用"},
    {"name": "红烧鸡腿", "category": "荤菜", "calories": 220, "protein": 25, "fat": 12, "carbs": 2, "healthy_score": 3, "suitable_for": ["增肌"], "region": "通用"},
    {"name": "红烧肉", "category": "荤菜", "calories": 350, "protein": 15, "fat": 30, "carbs": 5, "healthy_score": 2, "suitable_for": [], "region": "通用"},
    {"name": "蒸蛋", "category": "荤菜", "calories": 80, "protein": 8, "fat": 5, "carbs": 1, "healthy_score": 5, "suitable_for": ["养胃", "增肌"], "region": "通用"},
    {"name": "糖醋里脊", "category": "荤菜", "calories": 300, "protein": 18, "fat": 18, "carbs": 20, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "京酱肉丝", "category": "荤菜", "calories": 280, "protein": 22, "fat": 16, "carbs": 12, "healthy_score": 3, "suitable_for": ["增肌"], "region": "北方"},
    {"name": "锅包肉", "category": "荤菜", "calories": 350, "protein": 18, "fat": 22, "carbs": 20, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "猪肉炖粉条", "category": "荤菜", "calories": 380, "protein": 20, "fat": 22, "carbs": 28, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "葱爆羊肉", "category": "荤菜", "calories": 260, "protein": 24, "fat": 16, "carbs": 5, "healthy_score": 3, "suitable_for": ["增肌"], "region": "北方"},
    {"name": "小鸡炖蘑菇", "category": "荤菜", "calories": 240, "protein": 22, "fat": 14, "carbs": 6, "healthy_score": 4, "suitable_for": ["养胃", "增肌"], "region": "北方"},
    {"name": "红烧排骨", "category": "荤菜", "calories": 320, "protein": 24, "fat": 22, "carbs": 5, "healthy_score": 3, "suitable_for": ["增肌"], "region": "南方"},

    # ===== 南方荤菜 =====
    {"name": "清蒸鱼", "category": "荤菜", "calories": 140, "protein": 20, "fat": 5, "carbs": 1, "healthy_score": 5, "suitable_for": ["护眼", "减脂", "增肌"], "region": "通用"},
    {"name": "白切鸡", "category": "荤菜", "calories": 200, "protein": 26, "fat": 10, "carbs": 1, "healthy_score": 4, "suitable_for": ["增肌", "减脂"], "region": "南方"},
    {"name": "叉烧", "category": "荤菜", "calories": 280, "protein": 20, "fat": 18, "carbs": 10, "healthy_score": 3, "suitable_for": [], "region": "南方"},
    {"name": "咕噜肉", "category": "荤菜", "calories": 320, "protein": 16, "fat": 20, "carbs": 18, "healthy_score": 2, "suitable_for": [], "region": "南方"},
    {"name": "糖醋鱼", "category": "荤菜", "calories": 200, "protein": 18, "fat": 8, "carbs": 15, "healthy_score": 3, "suitable_for": ["护眼"], "region": "南方"},
    {"name": "梅菜扣肉", "category": "荤菜", "calories": 400, "protein": 16, "fat": 35, "carbs": 8, "healthy_score": 1, "suitable_for": [], "region": "南方"},
    {"name": "盐水鸭", "category": "荤菜", "calories": 220, "protein": 26, "fat": 12, "carbs": 2, "healthy_score": 4, "suitable_for": ["增肌"], "region": "南方"},
    {"name": "剁椒鱼头", "category": "荤菜", "calories": 180, "protein": 22, "fat": 8, "carbs": 4, "healthy_score": 4, "suitable_for": ["护眼", "增肌"], "region": "南方"},
    {"name": "口水鸡", "category": "荤菜", "calories": 260, "protein": 24, "fat": 18, "carbs": 3, "healthy_score": 3, "suitable_for": ["增肌"], "region": "南方"},
    {"name": "回锅肉", "category": "荤菜", "calories": 340, "protein": 18, "fat": 28, "carbs": 6, "healthy_score": 2, "suitable_for": [], "region": "南方"},
    {"name": "蒜蓉虾", "category": "荤菜", "calories": 130, "protein": 22, "fat": 3, "carbs": 3, "healthy_score": 5, "suitable_for": ["减脂", "增肌"], "region": "南方"},

    # ===== 通用素菜 =====
    {"name": "炒青菜", "category": "素菜", "calories": 60, "protein": 3, "fat": 3, "carbs": 5, "healthy_score": 5, "suitable_for": ["减脂", "护眼", "经期"], "region": "通用"},
    {"name": "麻婆豆腐", "category": "素菜", "calories": 120, "protein": 8, "fat": 8, "carbs": 4, "healthy_score": 4, "suitable_for": ["护眼"], "region": "通用"},
    {"name": "凉拌黄瓜", "category": "素菜", "calories": 30, "protein": 1, "fat": 0, "carbs": 5, "healthy_score": 5, "suitable_for": ["减脂"], "region": "通用"},
    {"name": "西兰花炒木耳", "category": "素菜", "calories": 80, "protein": 5, "fat": 3, "carbs": 8, "healthy_score": 5, "suitable_for": ["护眼", "减脂", "养胃"], "region": "通用"},
    {"name": "菠菜", "category": "素菜", "calories": 40, "protein": 3, "fat": 0.5, "carbs": 5, "healthy_score": 5, "suitable_for": ["护眼", "经期"], "region": "通用"},
    {"name": "番茄炒西葫芦", "category": "素菜", "calories": 50, "protein": 2, "fat": 2, "carbs": 6, "healthy_score": 4, "suitable_for": ["减脂"], "region": "通用"},

    # ===== 北方素菜 =====
    {"name": "地三鲜", "category": "素菜", "calories": 200, "protein": 5, "fat": 14, "carbs": 18, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "酸辣白菜", "category": "素菜", "calories": 50, "protein": 2, "fat": 2, "carbs": 6, "healthy_score": 4, "suitable_for": ["减脂"], "region": "北方"},
    {"name": "炒合菜", "category": "素菜", "calories": 100, "protein": 4, "fat": 5, "carbs": 10, "healthy_score": 4, "suitable_for": ["养胃"], "region": "北方"},
    {"name": "韭菜炒蛋", "category": "素菜", "calories": 120, "protein": 8, "fat": 8, "carbs": 4, "healthy_score": 4, "suitable_for": [], "region": "北方"},
    {"name": "拍黄瓜", "category": "素菜", "calories": 35, "protein": 1, "fat": 0.5, "carbs": 6, "healthy_score": 5, "suitable_for": ["减脂"], "region": "北方"},

    # ===== 南方素菜 =====
    {"name": "蒜蓉菜心", "category": "素菜", "calories": 50, "protein": 3, "fat": 2, "carbs": 5, "healthy_score": 5, "suitable_for": ["减脂", "护眼"], "region": "南方"},
    {"name": "白灼芥蓝", "category": "素菜", "calories": 45, "protein": 2, "fat": 1, "carbs": 7, "healthy_score": 5, "suitable_for": ["减脂"], "region": "南方"},
    {"name": "蚝油生菜", "category": "素菜", "calories": 40, "protein": 2, "fat": 2, "carbs": 4, "healthy_score": 4, "suitable_for": ["减脂"], "region": "南方"},
    {"name": "炒空心菜", "category": "素菜", "calories": 55, "protein": 3, "fat": 2, "carbs": 6, "healthy_score": 5, "suitable_for": ["减脂"], "region": "南方"},
    {"name": "凉拌木耳", "category": "素菜", "calories": 70, "protein": 3, "fat": 4, "carbs": 6, "healthy_score": 5, "suitable_for": ["减脂", "护眼"], "region": "南方"},

    # ===== 汤粥 =====
    {"name": "紫菜蛋花汤", "category": "汤粥", "calories": 40, "protein": 3, "fat": 1, "carbs": 4, "healthy_score": 5, "suitable_for": ["养胃", "熬夜修复"], "region": "通用"},
    {"name": "小米粥", "category": "汤粥", "calories": 80, "protein": 2, "fat": 0.5, "carbs": 16, "healthy_score": 5, "suitable_for": ["养胃", "熬夜修复"], "region": "通用"},
    {"name": "皮蛋瘦肉粥", "category": "汤粥", "calories": 130, "protein": 7, "fat": 5, "carbs": 15, "healthy_score": 3, "suitable_for": ["养胃"], "region": "通用"},
    {"name": "红枣枸杞粥", "category": "汤粥", "calories": 110, "protein": 3, "fat": 0.5, "carbs": 22, "healthy_score": 5, "suitable_for": ["经期", "养胃", "熬夜修复"], "region": "通用"},
    {"name": "疙瘩汤", "category": "汤粥", "calories": 150, "protein": 5, "fat": 4, "carbs": 22, "healthy_score": 3, "suitable_for": ["养胃"], "region": "北方"},
    {"name": "酸辣汤", "category": "汤粥", "calories": 80, "protein": 3, "fat": 2, "carbs": 12, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "胡辣汤", "category": "汤粥", "calories": 120, "protein": 5, "fat": 4, "carbs": 15, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "羊肉汤", "category": "汤粥", "calories": 180, "protein": 15, "fat": 12, "carbs": 4, "healthy_score": 3, "suitable_for": ["增肌"], "region": "北方"},
    {"name": "老火汤", "category": "汤粥", "calories": 60, "protein": 4, "fat": 2, "carbs": 6, "healthy_score": 5, "suitable_for": ["养胃", "熬夜修复"], "region": "南方"},
    {"name": "艇仔粥", "category": "汤粥", "calories": 160, "protein": 10, "fat": 6, "carbs": 18, "healthy_score": 4, "suitable_for": ["养胃"], "region": "南方"},
    {"name": "椰子鸡汤", "category": "汤粥", "calories": 140, "protein": 14, "fat": 8, "carbs": 4, "healthy_score": 4, "suitable_for": ["养胃", "熬夜修复"], "region": "南方"},
    {"name": "莲藕排骨汤", "category": "汤粥", "calories": 130, "protein": 10, "fat": 8, "carbs": 6, "healthy_score": 4, "suitable_for": ["养胃"], "region": "南方"},

    # ===== 面食 / 小吃 =====
    {"name": "饺子(10个)", "category": "小吃", "calories": 350, "protein": 14, "fat": 15, "carbs": 38, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "炸酱面", "category": "小吃", "calories": 450, "protein": 16, "fat": 18, "carbs": 55, "healthy_score": 2, "suitable_for": [], "region": "北方"},
    {"name": "刀削面", "category": "小吃", "calories": 380, "protein": 12, "fat": 8, "carbs": 62, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "兰州拉面", "category": "小吃", "calories": 400, "protein": 15, "fat": 10, "carbs": 60, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "云吞面", "category": "小吃", "calories": 320, "protein": 14, "fat": 8, "carbs": 48, "healthy_score": 3, "suitable_for": ["养胃"], "region": "南方"},
    {"name": "车仔面", "category": "小吃", "calories": 350, "protein": 10, "fat": 12, "carbs": 50, "healthy_score": 2, "suitable_for": [], "region": "南方"},
    {"name": "炒河粉", "category": "小吃", "calories": 380, "protein": 10, "fat": 14, "carbs": 52, "healthy_score": 2, "suitable_for": [], "region": "南方"},
    {"name": "麻辣烫(清汤)", "category": "小吃", "calories": 300, "protein": 12, "fat": 15, "carbs": 25, "healthy_score": 2, "suitable_for": [], "region": "通用"},
    {"name": "蛋炒饭", "category": "小吃", "calories": 400, "protein": 10, "fat": 16, "carbs": 52, "healthy_score": 2, "suitable_for": [], "region": "通用"},
    {"name": "小笼包", "category": "小吃", "calories": 280, "protein": 14, "fat": 14, "carbs": 26, "healthy_score": 3, "suitable_for": [], "region": "南方"},
    {"name": "烧卖", "category": "小吃", "calories": 250, "protein": 10, "fat": 12, "carbs": 28, "healthy_score": 3, "suitable_for": [], "region": "南方"},
    {"name": "春卷", "category": "小吃", "calories": 220, "protein": 6, "fat": 12, "carbs": 22, "healthy_score": 2, "suitable_for": [], "region": "南方"},

    # ===== 饮品 =====
    {"name": "豆浆", "category": "饮品", "calories": 40, "protein": 4, "fat": 2, "carbs": 2, "healthy_score": 5, "suitable_for": ["护眼", "经期"], "region": "通用"},
    {"name": "牛奶", "category": "饮品", "calories": 120, "protein": 6, "fat": 6, "carbs": 9, "healthy_score": 5, "suitable_for": ["增肌", "经期"], "region": "通用"},
    {"name": "酸奶", "category": "饮品", "calories": 80, "protein": 4, "fat": 2, "carbs": 12, "healthy_score": 5, "suitable_for": ["养胃"], "region": "通用"},
    {"name": "酸梅汤", "category": "饮品", "calories": 45, "protein": 0, "fat": 0, "carbs": 11, "healthy_score": 3, "suitable_for": [], "region": "北方"},
    {"name": "绿豆汤", "category": "饮品", "calories": 50, "protein": 2, "fat": 0.2, "carbs": 10, "healthy_score": 4, "suitable_for": ["熬夜修复"], "region": "通用"},
    {"name": "凉茶", "category": "饮品", "calories": 20, "protein": 0, "fat": 0, "carbs": 5, "healthy_score": 4, "suitable_for": ["熬夜修复"], "region": "南方"},
    {"name": "冰糖雪梨", "category": "饮品", "calories": 70, "protein": 0, "fat": 0, "carbs": 17, "healthy_score": 3, "suitable_for": ["养胃"], "region": "北方"},

    # ===== 轻食 / 水果 =====
    {"name": "鸡胸肉沙拉", "category": "轻食", "calories": 180, "protein": 28, "fat": 5, "carbs": 6, "healthy_score": 5, "suitable_for": ["减脂", "增肌"], "region": "通用"},
    {"name": "三明治", "category": "轻食", "calories": 260, "protein": 10, "fat": 12, "carbs": 28, "healthy_score": 3, "suitable_for": [], "region": "通用"},
    {"name": "香蕉", "category": "水果", "calories": 90, "protein": 1, "fat": 0, "carbs": 22, "healthy_score": 4, "suitable_for": ["熬夜修复"], "region": "通用"},
    {"name": "苹果", "category": "水果", "calories": 60, "protein": 0.5, "fat": 0, "carbs": 15, "healthy_score": 5, "suitable_for": ["减脂"], "region": "通用"},
    {"name": "核桃仁", "category": "零食", "calories": 160, "protein": 6, "fat": 14, "carbs": 4, "healthy_score": 4, "suitable_for": ["护眼", "熬夜修复"], "region": "通用"},
    {"name": "鸡蛋", "category": "其他", "calories": 70, "protein": 7, "fat": 5, "carbs": 0.5, "healthy_score": 5, "suitable_for": ["增肌", "养胃"], "region": "通用"},
    {"name": "豆腐脑(咸)", "category": "其他", "calories": 60, "protein": 5, "fat": 2, "carbs": 5, "healthy_score": 4, "suitable_for": ["养胃"], "region": "北方"},
    {"name": "豆腐脑(甜)", "category": "其他", "calories": 80, "protein": 4, "fat": 1, "carbs": 14, "healthy_score": 3, "suitable_for": [], "region": "南方"},
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
    # 确保 region 列存在 (PostgreSQL)
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE canteen_foods ADD COLUMN IF NOT EXISTS region VARCHAR(10) DEFAULT '通用'"))
        db.commit()
    except Exception:
        db.rollback()

    if db.query(CanteenFood).count() == 0:
        for f in CANTEEN_FOOD_DATA:
            db.add(CanteenFood(**f))
        db.commit()


def search_foods(db: Session, search: str = "", category: str = "", region: str = "") -> dict:
    _seed_foods(db)
    q = db.query(CanteenFood)
    if search:
        q = q.filter(CanteenFood.name.contains(search))
    if category:
        q = q.filter(CanteenFood.category == category)
    if region:
        q = q.filter((CanteenFood.region == region) | (CanteenFood.region == "通用"))
    foods = q.limit(50).all()
    all_foods = db.query(CanteenFood).all()
    return {
        "foods": foods,
        "categories": list(set(f.category for f in all_foods)),
        "regions": list(set(f.region for f in all_foods)),
    }


def get_recommendation(goal: str = "养胃") -> dict:
    return RECOMMENDATIONS.get(goal, {})


def get_summary(db: Session, user_id: int, date: str) -> dict:
    diets = db.query(DietRecord).filter(
        DietRecord.user_id == user_id,
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


def save_meal_plan(db: Session, user_id: int, goal: str) -> dict:
    plan = MealPlan(
        user_id=user_id,
        goal=goal,
        meals=RECOMMENDATIONS.get(goal, {}).get("foods", []),
        start_date=datetime.date.today(),
    )
    db.add(plan)
    db.commit()
    return {"ok": True, "plan": RECOMMENDATIONS.get(goal, {})}


def get_meal_plans(db: Session, user_id: int) -> dict:
    plans = db.query(MealPlan).filter(
        MealPlan.user_id == user_id,
    ).order_by(MealPlan.start_date.desc()).limit(5).all()
    return {"plans": plans}
