import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, ConstitutionTest
from schemas import ConstitutionSubmit, ConstitutionResultResponse
from auth import get_current_user

router = APIRouter(prefix="/api/constitution", tags=["constitution"])

# 9 TCM constitution types
CONSTITUTION_TYPES = [
    "平和质", "气虚质", "阳虚质", "阴虚质",
    "痰湿质", "湿热质", "血瘀质", "气郁质", "特禀质",
]

# 60 questions, each belongs to one of the 9 types (simplified)
# Each type has ~6-7 questions
CONSTITUTION_QUESTIONS = [
    # 平和质 (0-6)
    {"id": 1, "text": "您精力充沛吗？", "type": 0},
    {"id": 2, "text": "您容易疲乏吗？(*反向)", "type": 0},
    {"id": 3, "text": "您说话声音低弱无力吗？(*反向)", "type": 0},
    {"id": 4, "text": "您感到闷闷不乐、情绪低沉吗？(*反向)", "type": 0},
    {"id": 5, "text": "您比一般人耐受不了寒冷吗？(*反向)", "type": 0},
    {"id": 6, "text": "您能适应外界自然和社会环境的变化吗？", "type": 0},
    {"id": 7, "text": "您容易失眠吗？(*反向)", "type": 0},
    # 气虚质 (7-13)
    {"id": 8, "text": "您容易疲乏吗？", "type": 1},
    {"id": 9, "text": "您容易气短（呼吸短促、接不上气）吗？", "type": 1},
    {"id": 10, "text": "您容易心慌吗？", "type": 1},
    {"id": 11, "text": "您容易头晕或站起时晕眩吗？", "type": 1},
    {"id": 12, "text": "您比别人容易患感冒吗？", "type": 1},
    {"id": 13, "text": "您喜欢安静、懒得说话吗？", "type": 1},
    {"id": 14, "text": "您说话声音低弱无力吗？", "type": 1},
    # 阳虚质 (14-20)
    {"id": 15, "text": "您手脚发凉吗？", "type": 2},
    {"id": 16, "text": "您胃脘部、背部或腰膝部怕冷吗？", "type": 2},
    {"id": 17, "text": "您感到怕冷、衣服比别人穿得多吗？", "type": 2},
    {"id": 18, "text": "您比一般人耐受不了寒冷吗？", "type": 2},
    {"id": 19, "text": "您比别人容易患感冒吗？", "type": 2},
    {"id": 20, "text": "您吃（喝）凉的东西会感到不舒服或怕吃凉的东西吗？", "type": 2},
    {"id": 21, "text": "您受凉或吃（喝）凉的东西后容易拉肚子吗？", "type": 2},
    # 阴虚质 (21-27)
    {"id": 22, "text": "您感到手脚心发热吗？", "type": 3},
    {"id": 23, "text": "您感觉身体、脸上发热吗？", "type": 3},
    {"id": 24, "text": "您皮肤或口唇干吗？", "type": 3},
    {"id": 25, "text": "您口唇的颜色比一般人红吗？", "type": 3},
    {"id": 26, "text": "您容易便秘或大便干燥吗？", "type": 3},
    {"id": 27, "text": "您面部两颧潮红或偏红吗？", "type": 3},
    {"id": 28, "text": "您感到眼睛干涩吗？", "type": 3},
    # 痰湿质 (28-34)
    {"id": 29, "text": "您感到胸闷或腹部胀满吗？", "type": 4},
    {"id": 30, "text": "您感觉身体沉重不轻松或不爽快吗？", "type": 4},
    {"id": 31, "text": "您腹部肥满松软吗？", "type": 4},
    {"id": 32, "text": "您有额部油脂分泌多的现象吗？", "type": 4},
    {"id": 33, "text": "您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？", "type": 4},
    {"id": 34, "text": "您嘴里有黏黏的感觉吗？", "type": 4},
    {"id": 35, "text": "您平时痰多，特别是咽喉部总感到有痰堵着吗？", "type": 4},
    # 湿热质 (35-41)
    {"id": 36, "text": "您面部或鼻部有油腻感或者油亮发光吗？", "type": 5},
    {"id": 37, "text": "您容易生痤疮或疮疖吗？", "type": 5},
    {"id": 38, "text": "您感到口苦或嘴里有异味吗？", "type": 5},
    {"id": 39, "text": "您大便黏滞不爽、有解不尽的感觉吗？", "type": 5},
    {"id": 40, "text": "您小便时尿道有发热感、尿色浓（深）吗？", "type": 5},
    {"id": 41, "text": "您带下色黄（白带颜色发黄）吗？（女性答）", "type": 5},
    {"id": 42, "text": "您的阴囊部位潮湿吗？（男性答）", "type": 5},
    # 血瘀质 (42-48)
    {"id": 43, "text": "您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？", "type": 6},
    {"id": 44, "text": "您两颧部有细微红丝（毛细血管扩张）吗？", "type": 6},
    {"id": 45, "text": "您身体上有哪里疼痛吗？", "type": 6},
    {"id": 46, "text": "您面色晦暗或容易出现褐斑吗？", "type": 6},
    {"id": 47, "text": "您容易有黑眼圈吗？", "type": 6},
    {"id": 48, "text": "您容易忘事（健忘）吗？", "type": 6},
    {"id": 49, "text": "您口唇颜色偏暗吗？", "type": 6},
    # 气郁质 (49-55)
    {"id": 50, "text": "您感到闷闷不乐、情绪低沉吗？", "type": 7},
    {"id": 51, "text": "您容易精神紧张、焦虑不安吗？", "type": 7},
    {"id": 52, "text": "您多愁善感、感情脆弱吗？", "type": 7},
    {"id": 53, "text": "您容易感到害怕或受到惊吓吗？", "type": 7},
    {"id": 54, "text": "您的胁肋部或乳房胀痛吗？", "type": 7},
    {"id": 55, "text": "您无缘无故叹气吗？", "type": 7},
    {"id": 56, "text": "您咽喉部有异物感，且吐之不出、咽之不下吗？", "type": 7},
    # 特禀质 (56-60)
    {"id": 57, "text": "您没有感冒时也会打喷嚏吗？", "type": 8},
    {"id": 58, "text": "您没有感冒时也会鼻塞、流鼻涕吗？", "type": 8},
    {"id": 59, "text": "您有因季节变化、温度变化或异味等原因而咳喘的现象吗？", "type": 8},
    {"id": 60, "text": "您容易过敏（对药物、食物、气味、花粉）吗？", "type": 8},
    {"id": 61, "text": "您的皮肤容易起荨麻疹（风团、风疙瘩）吗？", "type": 8},
    {"id": 62, "text": "您的皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？", "type": 8},
]

CONSTITUTION_ADVICE = {
    "平和质": {
        "description": "恭喜！您属于阴阳气血调和的平和质，是9种体质中最健康的类型。",
        "tips": ["保持规律作息，早睡早起", "饮食均衡，粗细搭配", "坚持适度运动", "保持心态平和"],
        "food": ["各类食物均可适量摄入", "建议多吃五谷杂粮、蔬菜水果"],
        "exercise": "每周3-5次中等强度运动，如跑步、游泳、球类",
    },
    "气虚质": {
        "description": "您属于气虚质，主要表现为元气不足，容易疲乏、气短、自汗等。",
        "tips": ["避免过度劳累和熬夜", "注意保暖，避免受风", "循序渐进地进行运动", "保持充足睡眠"],
        "food": ["多吃益气健脾食物：小米、山药、土豆、香菇、鸡肉、牛肉", "少吃耗气食物：萝卜、空心菜、槟榔"],
        "exercise": "选择温和的运动，如太极拳、散步、瑜伽，避免剧烈运动",
    },
    "阳虚质": {
        "description": "您属于阳虚质，主要表现为阳气不足，以畏寒怕冷、手足不温为主。",
        "tips": ["注意保暖，尤其腰腹部和脚部", "多晒太阳，尤其是后背", "避免在寒冷环境中久待", "睡前可用热水泡脚"],
        "food": ["多吃温阳食物：羊肉、韭菜、生姜、核桃、桂圆", "少食生冷寒凉食物：西瓜、梨、冷饮"],
        "exercise": "选择温和的有氧运动，如快走、慢跑、太极拳",
    },
    "阴虚质": {
        "description": "您属于阴虚质，主要表现为阴液亏少，以口燥咽干、手足心热为主。",
        "tips": ["避免熬夜，保证充足睡眠", "保持心情平和，忌急躁", "多喝水，保持环境湿润", "避免高温环境"],
        "food": ["多吃滋阴食物：银耳、百合、梨、鸭肉、蜂蜜、枸杞", "少吃辛辣燥热食物：辣椒、花椒、羊肉"],
        "exercise": "选择中小强度运动，如游泳、瑜伽、太极拳",
    },
    "痰湿质": {
        "description": "您属于痰湿质，主要表现为痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻为主。",
        "tips": ["控制饮食，避免暴饮暴食", "少吃甜腻食物和油腻食物", "多进行户外运动", "保持居住环境干燥通风"],
        "food": ["多吃健脾利湿食物：薏米、冬瓜、赤小豆、山药", "少吃肥甘厚腻：肥肉、甜点、油炸食品"],
        "exercise": "选择持续时间较长的有氧运动，如长跑、游泳、球类",
    },
    "湿热质": {
        "description": "您属于湿热质，主要表现为湿热内蕴，以面垢油光、口苦、苔黄腻为主。",
        "tips": ["保持皮肤清洁，避免湿热环境", "忌辛辣、油腻、甜食", "多喝水，保持大便通畅", "避免熬夜和过度劳累"],
        "food": ["多吃清热利湿食物：绿豆、苦瓜、黄瓜、薏米、莲子", "少吃辛辣温热食物：辣椒、羊肉、酒"],
        "exercise": "选择强度较大的运动，如跑步、球类、武术",
    },
    "血瘀质": {
        "description": "您属于血瘀质，主要表现为血行不畅，以肤色晦暗、舌质紫暗为主。",
        "tips": ["保持心情舒畅，避免情绪波动", "注意保暖，避免受寒", "适量运动促进血液循环", "可适当按摩身体"],
        "food": ["多吃活血化瘀食物：山楂、黑豆、红糖、醋、茄子", "少吃肥肉等滋腻食物"],
        "exercise": "选择促进气血运行的运动，如跑步、健身操、舞蹈",
    },
    "气郁质": {
        "description": "您属于气郁质，主要表现为气机郁滞，以神情抑郁、忧虑脆弱为主。",
        "tips": ["多参加社交活动，与人交流", "培养兴趣爱好，转移注意力", "保持规律生活作息", "学习放松技巧，如冥想、深呼吸"],
        "food": ["多吃行气解郁食物：玫瑰花、柑橘、佛手、小麦", "少饮咖啡和浓茶"],
        "exercise": "选择舒展身心的运动，如瑜伽、舞蹈、跑步",
    },
    "特禀质": {
        "description": "您属于特禀质，主要表现为先天失常，以过敏反应为主。",
        "tips": ["了解并避开自己的过敏原", "保持居住环境清洁卫生", "增强免疫力，注意季节变化", "随身携带必要的抗过敏药物"],
        "food": ["饮食清淡均衡，多吃新鲜蔬果", "避免已知过敏食物"],
        "exercise": "选择室内运动为主，如健身房训练、游泳、瑜伽",
    },
}


@router.get("/questions")
def get_questions():
    return {"questions": CONSTITUTION_QUESTIONS, "types": CONSTITUTION_TYPES}


@router.post("/submit", response_model=ConstitutionResultResponse)
def submit_test(data: ConstitutionSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if len(data.answers) != len(CONSTITUTION_QUESTIONS):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="请回答所有问题")

    # Calculate scores for each type (1-5 scale)
    type_scores = {i: 0 for i in range(9)}
    type_counts = {i: 0 for i in range(9)}

    for i, answer in enumerate(data.answers):
        q_type = CONSTITUTION_QUESTIONS[i]["type"]
        type_scores[q_type] += answer
        type_counts[q_type] += 1

    # Normalize
    final_scores = {}
    for i in range(9):
        if type_counts[i] > 0:
            final_scores[CONSTITUTION_TYPES[i]] = round(type_scores[i] / type_counts[i], 1)
        else:
            final_scores[CONSTITUTION_TYPES[i]] = 0.0

    # Find primary type (skip 平和质 for non-balanced)
    sorted_types = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
    result_type = sorted_types[0][0]

    test = ConstitutionTest(
        user_id=current_user.id,
        date=datetime.date.today(),
        result_type=result_type,
        scores=final_scores,
    )
    db.add(test)
    db.commit()
    db.refresh(test)

    return test


@router.get("/history", response_model=list[ConstitutionResultResponse])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(ConstitutionTest).filter(
        ConstitutionTest.user_id == current_user.id,
    ).order_by(ConstitutionTest.date.desc()).limit(5).all()
    return tests


@router.get("/advice/{constitution_type}")
def get_advice(constitution_type: str):
    return CONSTITUTION_ADVICE.get(constitution_type, {"description": "未知体质类型"})
