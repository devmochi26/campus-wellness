# 🌿 养生校园 — Campus Wellness

面向大学生的轻量化养生记录工具，解决四大痛点：**熬夜、作息差、压力大、状态差**。

## 项目概览

| 维度 | 说明 |
|------|------|
| 定位 | 校园场景的轻养生习惯养成应用 |
| 用户 | 大学生群体 |
| 理念 | 不强制、不焦虑，记录+意识培养即养生 |
| 技术栈 | React 18 + Vite / FastAPI + SQLite |
| 代码量 | 前端 ~2500 行 / 后端 ~1200 行 |

## 技术架构

```
┌─────────────────────────────────────┐
│  前端 React 18 + Vite + Tailwind    │
│  :5173                              │
│  9 个页面 · 3 个通用组件             │
│  JWT 认证 · Axios 拦截              │
└──────────────┬──────────────────────┘
               │ REST API (JSON)
┌──────────────┴──────────────────────┐
│  后端 FastAPI + SQLAlchemy + SQLite │
│  :8000                              │
│  8 个路由模块 · 9 张数据表           │
│  bcrypt 密码哈希 · JWT 令牌          │
└─────────────────────────────────────┘
```

## 项目结构

```
campus-wellness/
├── backend/                    # 后端 (Python FastAPI)
│   ├── main.py                 # 入口，注册路由，CORS
│   ├── database.py             # SQLite 引擎 + Session
│   ├── models.py               # ORM 数据模型 (9表)
│   ├── schemas.py              # Pydantic 请求/响应校验
│   ├── auth.py                 # bcrypt 密码 + JWT 认证
│   ├── routers/                # API 路由 (8个模块)
│   │   ├── auth.py             # 注册 / 登录
│   │   ├── user.py             # 个人资料
│   │   ├── daily_routine.py    # 作息记录
│   │   ├── diet.py             # 饮食记录
│   │   ├── exercise.py         # 运动记录
│   │   ├── mood.py             # 心情记录
│   │   ├── constitution.py     # 中医体质测评
│   │   ├── habits.py           # 习惯打卡
│   │   └── dashboard.py        # 今日概览 + 养生分
│   ├── seed.py                 # Demo 账号种子
│   └── requirements.txt        # Python 依赖
├── frontend/                   # 前端 (React + Vite)
│   ├── src/
│   │   ├── main.jsx            # React 入口
│   │   ├── App.jsx             # 路由配置 (私密路由守卫)
│   │   ├── api.js              # Axios 封装 (JWT 拦截)
│   │   ├── index.css           # Tailwind + 通用样式
│   │   ├── context/
│   │   │   └── AuthContext.jsx # 认证状态管理
│   │   ├── components/
│   │   │   ├── Layout.jsx      # 顶部导航 + 侧边栏 + 底部Tab
│   │   │   ├── StatCard.jsx    # 统计卡片
│   │   │   └── ProgressRing.jsx# 环形进度条
│   │   └── pages/              # 页面 (9个)
│   │       ├── Login.jsx       # 登录
│   │       ├── Register.jsx    # 注册
│   │       ├── Dashboard.jsx   # 今日概览
│   │       ├── DailyRoutine.jsx# 作息记录
│   │       ├── DietTracker.jsx # 饮食记录
│   │       ├── ExerciseTracker.jsx # 运动记录
│   │       ├── MoodTracker.jsx # 心情记录
│   │       ├── ConstitutionTest.jsx # 体质测评
│   │       └── HabitTracker.jsx# 习惯打卡
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite 配置 (API 代理)
└── .gitignore
```

---

## 功能模块详解

### 1. 用户认证

| 文件 | 说明 |
|------|------|
| `backend/routers/auth.py` | POST `/api/auth/register` 注册，POST `/api/auth/login` 登录 |
| `backend/auth.py` | bcrypt 密码哈希，JWT 令牌签发/验证 |
| `frontend/src/context/AuthContext.jsx` | 登录态管理，token 持久化到 localStorage |
| `frontend/src/pages/Login.jsx` | 登录页，渐变背景 + 卡片式表单 |
| `frontend/src/pages/Register.jsx` | 注册页，密码一致性校验 |

**数据表**: `users` (id, username, password_hash, created_at), `user_profiles` (nickname, gender, age, height, weight)

---

### 2. 今日概览 (Dashboard)

| 文件 | 说明 |
|------|------|
| `backend/routers/dashboard.py` | GET `/api/dashboard/today` 聚合 6 维度数据，计算养生分 (0-100) |
| `frontend/src/pages/Dashboard.jsx` | 养生分环形图 + 6 张统计卡片 + 熬夜/屏幕时长警告 + 快捷记录入口 |

**养生分算法**：
- 睡眠质量 (25分) + 饮食健康 (25分) + 运动时长 (25分) + 心情 (15分) + 习惯打卡 (10分)
- 三餐齐全额外 +5 分奖励

---

### 3. 作息记录

| 文件 | 说明 |
|------|------|
| `backend/routers/daily_routine.py` | 创建/更新/查询作息，支持按日期 + 周查询 |
| `frontend/src/pages/DailyRoutine.jsx` | 起床/入睡时间选择、睡眠质量 1-5 级、屏幕使用小时、饮水杯数、睡眠时长自动计算、本周质量柱状图 |

**字段**: wake_time, sleep_time, sleep_quality (1-5), screen_hours, water_cups, notes

---

### 4. 饮食记录

| 文件 | 说明 |
|------|------|
| `backend/routers/diet.py` | CRUD 饮食记录，按日期筛选 |
| `frontend/src/pages/DietTracker.jsx` | 三餐 + 加餐分类 Tab、校园食堂快捷食物选择、热量估算、健康评分 1-5、按餐类汇总 |

**亮点**: 内置校园食堂常见食物快捷选择（米饭套餐/面条/饺子/麻辣烫等），降低记录成本。

---

### 5. 运动记录

| 文件 | 说明 |
|------|------|
| `backend/routers/exercise.py` | CRUD 运动记录，按日期筛选 |
| `frontend/src/pages/ExerciseTracker.jsx` | 10 种运动类型（跑步/健身/瑜伽/球类/游泳/骑行/舞蹈/跳绳/武术/散步）、今日运动总时长汇总 |

**亮点**: emoji 图标选择运动类型，强度滑块 1-5 级。

---

### 6. 心情记录

| 文件 | 说明 |
|------|------|
| `backend/routers/mood.py` | 创建/更新/查询心情，支持周趋势数据 |
| `frontend/src/pages/MoodTracker.jsx` | Emoji 心情选择器 (😫😟😐😊😄)、压力水平滑块、12 种心情标签多选、周趋势折线图 (Recharts) |

---

### 7. 中医体质测评

| 文件 | 说明 |
|------|------|
| `backend/routers/constitution.py` | 60 道体质测评题（9 种体质各 6-7 题），5 级评分，得分计算 + 体质判定 |
| `frontend/src/pages/ConstitutionTest.jsx` | 分页答题（每页 10 题）、进度条、结果展示（体质类型 + 9 维得分柱状图 + 养生建议 + 推荐食物 + 运动建议 + 历史对比） |

**9 种体质**: 平和质、气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质、特禀质

---

### 8. 习惯打卡

| 文件 | 说明 |
|------|------|
| `backend/routers/habits.py` | 习惯 CRUD，打卡/取消打卡，连续天数计算 |
| `frontend/src/pages/HabitTracker.jsx` | 预设习惯模板（喝8杯水/早睡/运动30分钟/阅读/冥想/吃水果/远离手机）、创建新习惯、打卡按钮、连续天数进度条、7 日迷你打卡日历 |

**亮点**: GitHub 风格连续打卡日历，游戏化连续天数计数。

---

## 数据库 ER 简图

```
users (1) ─────< daily_routines
  │ (1) ─────< diet_records
  │ (1) ─────< exercise_records
  │ (1) ─────< mood_records
  │ (1) ─────< constitution_tests
  │ (1) ─────< habits ─────< habit_checkins
  └ (1) ──── user_profiles
```

---

## 创新点

| 创新点 | 实现方式 |
|--------|----------|
| 校园场景化 | 熬夜检测提醒、食堂快捷食物列表、课程作息关联 |
| 年轻化设计 | Emoji 心情选择器、绿色渐变 UI、移动端底部导航 |
| 轻养生理念 | 只记录不强制、无严格计划、降低心理门槛 |
| 习惯养成游戏化 | 连续打卡计数、GitHub 风格迷你日历、进度环 |
| 中医体质 | 60 题标准化测评、9 种体质判定、个性化养生建议 |

---

## 快速启动

### 环境要求
- Python 3.10+
- Node.js 18+
- npm 9+

### 后端

```bash
cd backend
pip install -r requirements.txt
python main.py
# 访问 http://localhost:8000
# API 文档 http://localhost:8000/docs
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

### Demo 账号

| 用户名 | 密码 |
|--------|------|
| demo | demo123 |

（运行 `python seed.py` 创建 demo 账号）

## API 速查

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/user/profile | 个人资料 |
| PUT | /api/user/profile | 更新资料 |
| POST | /api/routines | 记录作息 |
| GET | /api/routines?date= | 查询作息 |
| GET | /api/routines/weekly | 周作息 |
| POST | /api/diet | 记录饮食 |
| GET | /api/diet?date= | 查询饮食 |
| DELETE | /api/diet/:id | 删除饮食 |
| POST | /api/exercise | 记录运动 |
| GET | /api/exercise?date= | 查询运动 |
| DELETE | /api/exercise/:id | 删除运动 |
| POST | /api/mood | 记录心情 |
| GET | /api/mood?date= | 查询心情 |
| GET | /api/mood/weekly | 周心情趋势 |
| GET | /api/constitution/questions | 测评题 |
| POST | /api/constitution/submit | 提交测评 |
| GET | /api/constitution/history | 测评历史 |
| POST | /api/habits | 创建习惯 |
| GET | /api/habits | 习惯列表 |
| POST | /api/habits/:id/check | 打卡 |
| DELETE | /api/habits/:id | 删除习惯 |
| GET | /api/dashboard/today | 今日概览 |
| GET | /api/dashboard/weekly | 周概览 |
