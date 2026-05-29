# 🌿 养生校园 — Campus Wellness

面向大学生的轻量化养生记录工具，解决四大痛点：**熬夜、作息差、压力大、状态差**。

## 项目概览

| 维度  | 说明                                 |
| --- | ---------------------------------- |
| 定位  | 校园场景的轻养生习惯养成应用                     |
| 用户  | 大学生 + 辅导员（双角色）                     |
| 理念  | 不强制、不焦虑，记录+意识培养即养生                 |
| 技术栈 | React 18 + Vite + TypeScript / FastAPI + Supabase (PostgreSQL) |
| 代码量 | 前端 ~5000 行 / 后端 ~3500 行（含 services 层） |
| 特色  | 双角色、课程表联动、健康积分、智能场所识别、深色/浅色主题      |

## 技术架构

```
┌──────────────────────────────────────┐
│  前端 React 18 + Vite + TypeScript   │
│  :5173                               │
│  20 个页面 · 3 个通用组件             │
│  TailwindCSS · 深色/浅色双主题       │
│  JWT 认证 · 角色切换 · Axios 拦截     │
└──────────────┬───────────────────────┘
               │ REST API (JSON)
┌──────────────┴───────────────────────┐
│  后端 FastAPI + SQLAlchemy + Supabase│
│  :8000                               │
│  15 个 Router · 10 个 Service        │
│  19 张数据表                         │
│  bcrypt 密码哈希 · JWT 令牌           │
│  自动数据库迁移                       │
└──────────────────────────────────────┘
```

## 项目结构

```
campus-wellness/
├── backend/                    # 后端 (Python FastAPI)
│   ├── main.py                 # 入口，注册路由，CORS，自动迁移
│   ├── database.py             # Supabase PostgreSQL 引擎 + Session
│   ├── models.py               # ORM 数据模型 (19表)
│   ├── schemas.py              # Pydantic 请求/响应校验
│   ├── auth.py                 # bcrypt 密码 + JWT 认证
│   ├── routers/                # API 路由 (15个模块)
│   │   ├── auth.py             # 注册 / 登录
│   │   ├── user.py             # 个人资料 + /me 接口
│   │   ├── daily_routine.py    # 作息记录
│   │   ├── diet.py             # 饮食记录
│   │   ├── exercise.py         # 运动记录
│   │   ├── mood.py             # 心情记录
│   │   ├── constitution.py     # 中医体质测评
│   │   ├── habits.py           # 习惯打卡
│   │   ├── dashboard.py        # 今日概览
│   │   ├── smart_sleep.py      # 智能睡眠
│   │   ├── nutrition.py        # 食堂营养 (93种菜品，南北方分类)
│   │   ├── stress_relief.py    # 压力评估
│   │   ├── health_profile.py   # 健康档案
│   │   ├── community.py        # 社群
│   │   └── campus.py           # 🆕 校园特色 (角色/课程表/积分/辅导员看板)
│   ├── services/               # 业务逻辑层 (10个模块)
│   │   ├── exceptions.py       # DomainException / NotFoundException / ConflictException
│   │   ├── auth_service.py     # 注册/登录事务逻辑
│   │   ├── dashboard_service.py# 多实体聚合 + 养生分算法
│   │   ├── habit_service.py    # 习惯 CRUD + 连续天数算法
│   │   ├── sleep_service.py    # 睡眠推荐 + 规律性评分 + 情景数据
│   │   ├── constitution_service.py # 9体质评分 + 62题 + 养生建议
│   │   ├── stress_service.py   # 反向计分 + 压力分级 + 咨询/呼吸法
│   │   ├── health_service.py   # 6实体健康聚合 + 4领域风险检测
│   │   ├── nutrition_service.py# 🆕 93种食物 + 南北方分类 + 饮食方案
│   │   ├── community_service.py# 群组/排行榜/帖子 + 养生贴士
│   │   └── counselor_service.py# 🆕 辅导员班级健康概览 + 异常预警
│   ├── .env                    # Supabase 连接串（不入 git）
│   └── requirements.txt        # Python 依赖
├── frontend/                   # 前端 (React + Vite + TypeScript)
│   ├── tsconfig.json           # TypeScript 配置 (strict)
│   ├── tailwind.config.js      # Tailwind 配置 (darkMode: class, 7色主题)
│   ├── vite.config.ts          # Vite 构建配置
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.tsx            # React 入口
│       ├── App.tsx             # 路由配置 (私密路由守卫)
│       ├── api.ts              # Axios 实例 (JWT 拦截)
│       ├── types.ts            # 共享 TypeScript 类型定义
│       ├── vite-env.d.ts       # Vite 客户端类型声明
│       ├── index.css           # Tailwind + 滚动条 + 表单控件 + 动画系统
│       ├── context/
│       │   ├── AuthContext.tsx  # 认证状态 + 角色管理
│       │   └── ThemeContext.tsx # 🆕 深色/浅色主题切换
│       ├── hooks/
│       │   └── useModuleColor.ts # 🆕 模块色自适应 Hook
│       ├── components/
│       │   ├── Layout.tsx       # 🆕 全高侧边栏 + 主题切换 + 角色切换
│       │   ├── StatCard.tsx     # 统计卡片 (双主题)
│       │   └── ProgressRing.tsx # 环形进度条 (SVG滤镜)
│       └── pages/               # 页面 (20个)
│           ├── Login.tsx        # 登录 (双主题)
│           ├── Register.tsx     # 注册 (双主题)
│           ├── Dashboard.tsx    # 🆕 今日概览 + 健康积分 + 明日课程提醒
│           ├── RoutineManager.tsx    # 🆕 作息管理 (emoji睡眠质量 + 水量滑块)
│           ├── DietManager.tsx       # 🆕 饮食管理 (餐次角标 + 南北方菜品 + 饮食小结)
│           ├── ExerciseManager.tsx   # 🆕 运动管理 + 运动场所智能识别
│           ├── MoodTracker.tsx       # 🆕 心情记录 (动态emoji + 压力+ 趋势图)
│           ├── HabitTracker.tsx      # 🆕 习惯打卡 (今日概览 + 滑块目标天数 + 周历)
│           ├── HealthAssessment.tsx  # 🆕 健康测评 (动画选项 + 体质得分可视化)
│           ├── HealthProfile.tsx     # 健康档案
│           ├── Community.tsx         # 🆕 社群 (奖牌排行 + 匿名帖子 + 知识卡)
│           ├── CounselorDashboard.tsx# 🆕 辅导员看板 (班级概览 + 异常预警 + 干预建议)
│           ├── DailyRoutine.tsx      # 作息记录(旧版)
│           ├── DietTracker.tsx       # 饮食记录(旧版)
│           ├── ExerciseTracker.tsx   # 运动记录(旧版)
│           ├── DietPlan.tsx          # 饮食方案详情
│           ├── ExercisePlan.tsx      # 运动课程详情
│           ├── ConstitutionTest.tsx  # 中医体质测评(旧版)
│           ├── SmartSleep.tsx        # 智能睡眠(旧版)
│           └── StressRelief.tsx      # 压力疏导(旧版)
└── .gitignore
```

---

## 🆕 v3 新增功能

### 深色/浅色双主题

- `ThemeContext` 管理主题状态，持久化到 localStorage
- Tailwind `darkMode: 'class'`，全站 `dark:` 变体
- 侧边栏/顶栏/移动端底部导航均有 🌙/☀️ 切换按钮
- 所有组件（卡片、输入框、按钮、表格）均已适配双主题
- 自定义滚动条、表单控件也随主题变色

### 角色系统

- **学生端**：现有全部功能
- **辅导员端**：切换角色后进入 `/counselor` 辅导员看板
- 侧边栏底部一键切换 🎓学生 / 👨‍🏫辅导员
- `User.role` 字段持久化，`UserProfile.class_name` 班级归属

### 辅导员看板 (`/counselor`)

| 功能 | 说明 |
|------|------|
| 班级概览 | 平均睡眠质量、平均压力水平、本周打卡、作息记录数 |
| 体质分布 | 班级全体体质测评结果统计 |
| 异常预警 | 睡眠质量连续<3超过3天的学生列表 |
| 高压预警 | 压力水平≥4的学生列表 |
| 干预建议 | 根据数据自动生成行动建议（班会、心理咨询引导等） |

### 课程表联动

- `CourseSchedule` 模型：周几 + 课程名 + 时间 + 是否体育课 + 地点
- Dashboard 显示明日最早课程卡片
- 有体育课时自动推送睡眠提醒："明天有体育课，建议今晚保证8小时睡眠，提前30分钟入睡"
- 后端 `/campus/tomorrow-schedule` 接口

### 健康积分

- `HealthPoints` 模型：总积分 + 本周积分
- Dashboard 显示积分星标卡片
- 每周自动重置周积分
- 后续可联动打卡/记录自动加分

### 运动场所智能识别

- 运动管理新增 🏟️ 场所标签页
- 8 个预设校园运动场所（田径场、篮球场、游泳馆、健身房等）
- 按类型筛选（操场/球场/游泳馆/健身房/跑道/舞蹈室）
- **智能识别**：输入环境描述（如"红色塑胶跑道和足球门"），关键词匹配推荐运动
- 支持自定义添加场所，localStorage 存储

### 食堂菜品南北分类

- 菜品库从 29 种扩充到 **93 种**
- 南北方分类：北方 26 种 + 南方 32 种 + 通用 35 种
- 搜索支持地域筛选
- 菜品列表显示 🏔️北方 / 🌊南方 标签

---

## UI 优化详情

### 全局

- 自定义滚动条（5px 宽度、圆角、深浅色适配）
- 原生表单控件美化（time/date/select/range）
- 页面标题统一 `page-title` 类（模块色左边框）
- CSS 变量驱动按钮颜色（`--mc-bg`/`--mc-text`/`--mc-border`），切页自动适配

### Dashboard

- 养生分渐变色卡片 + 大号 ProgressRing
- 6 张统计卡片各带模块色色条
- 健康积分 + 明日课程提醒双卡片
- 快捷操作入口

### 作息管理

- emoji 睡眠质量选择器（😴→😄）
- 水量分段滑块（0-12杯）
- 睡眠时长预览卡片（达标绿色/不足琥珀色）
- 智能推荐：作息偏好 emoji 大按钮
- 特殊场景手风琴 ▶ 旋转箭头

### 饮食管理

- 餐次选择卡片 + 右上角数字角标
- 表单标题根据餐次动态变化
- 健康评分 emoji 指示
- 饮食小结 3 列数据卡片
- 方案建议步骤编号圆形徽章

### 运动管理

- 今日汇总 3 列（分钟/次数/千卡）
- 运动类型 5 列网格 + 琥珀色高亮
- 强度选择 emoji 指示器（🟢→🔥）
- 方案动作步骤编号圆形徽章

### 心情记录

- 心情 emoji 动态缩放（分数越高越大）
- 标签颜色跟随分数（红→绿→青）
- 压力 emoji 按钮 + ring 选中
- 标签圆角胶囊 + 清除按钮
- 趋势图粗线条 + 大圆点

### 习惯打卡

- 今日概览卡片（已完成/总数）
- 目标天数滑块（7-100天）
- 7 天方块日历（星期标签 + 今日高亮）
- 打卡按钮 teal 主题色
- 空状态推荐习惯网格

### 健康测评

- 进度条渐变色 + 页数显示
- 题号圆形徽章
- 选项等宽大按钮 + 选中弹入动画
- 逐题延迟出场
- 体质得分渐变色进度条
- 压力测评结果 emoji 展示

### 校园互助

- 标签 3 列大卡片
- 小组图标圆形背景
- 🥇🥈🥉 奖牌排行
- 帖子头像圆圈 + 匿名标签
- 知识卡片图标分离

---

## 功能模块详解

### 1. 用户认证

| 文件                                     | 说明                                                     |
| -------------------------------------- | ------------------------------------------------------ |
| `backend/routers/auth.py`              | POST `/api/auth/register` 注册，POST `/api/auth/login` 登录 |
| `backend/auth.py`                      | bcrypt 密码哈希，JWT 令牌签发/验证                                |
| `backend/routers/user.py`              | GET `/api/user/me` 用户信息+角色，GET/PUT `/api/user/profile` |
| `frontend/src/context/AuthContext.tsx` | 登录态管理 + 角色信息，token 持久化到 localStorage                   |
| `frontend/src/pages/Login.tsx`         | 登录页，双主题，装饰圆+毛玻璃卡片+输入框icon前缀                           |
| `frontend/src/pages/Register.tsx`      | 注册页，密码一致性校验 + 双主题                                     |

**数据表**: `users` (id, username, password_hash, role, created_at), `user_profiles` (nickname, gender, age, height, weight, class_name)

### 2. 今日概览 (Dashboard)

| 文件                                 | 说明                                                 |
| ---------------------------------- | -------------------------------------------------- |
| `backend/services/dashboard_service.py` | 6 维度聚合 + 养生分加权算法 |
| `frontend/src/pages/Dashboard.tsx` | 养生分渐变卡片 + 6 张统计卡片 + 健康积分 + 明日课程提醒 + 熬夜/屏幕警告 |

**养生分算法**：睡眠质量(25分) + 饮食健康(25分) + 运动时长(25分) + 心情(15分) + 习惯打卡(10分)，三餐齐全 +5 分

### 3. 作息管理

| 文件                                    | 说明                                                |
| ------------------------------------- | ------------------------------------------------- |
| `backend/routers/daily_routine.py`    | 创建/更新/查询作息，支持按日期 + 周查询                            |
| `backend/services/sleep_service.py`   | 睡眠时间推荐 + 规律性评分 + 4种情景模板                         |
| `frontend/src/pages/RoutineManager.tsx` | 睡眠时长预览 + emoji质量选择 + 水量滑块 + 智能推荐 + 睡眠报告 + 偏好 + 场景 |

### 4. 饮食管理

| 文件                                   | 说明                                           |
| ------------------------------------ | -------------------------------------------- |
| `backend/routers/diet.py`            | CRUD 饮食记录                                   |
| `backend/services/nutrition_service.py` | 🆕 93种菜品库 + 南北方分类 + 6种饮食方案                 |
| `frontend/src/pages/DietManager.tsx` | 餐次角标卡片 + 快捷食物胶囊 + 饮食小结 + 按需求方案 + 南北方菜品速查 |

### 5. 运动管理 + 场所

| 文件                                       | 说明                                                |
| ---------------------------------------- | ------------------------------------------------- |
| `backend/routers/exercise.py`            | CRUD 运动记录                                          |
| `frontend/src/pages/ExerciseManager.tsx` | 🆕 运动汇总 + 类型选择 + 强度emoji + 9种运动方案 + 运动场所智能识别 + 场所管理 |

### 6. 心情记录

| 文件                                 | 说明                                       |
| ---------------------------------- | ---------------------------------------- |
| `backend/routers/mood.py`          | CRUD 心情记录                                |
| `frontend/src/pages/MoodTracker.tsx` | 动态emoji选择 + 压力水平 + 情绪标签胶囊 + 玫瑰色主题 + 趋势图 |

### 7. 习惯打卡

| 文件                                   | 说明                                            |
| ------------------------------------ | --------------------------------------------- |
| `backend/services/habit_service.py`  | 习惯CRUD + 连续天数算法 + 打卡切换                          |
| `frontend/src/pages/HabitTracker.tsx` | 今日概览 + 滑块目标天数 + 7天方块日历 + teal主题 + 推荐习惯网格 |

### 8. 健康测评

| 文件                                         | 说明                                           |
| ------------------------------------------ | -------------------------------------------- |
| `backend/services/constitution_service.py` | 9体质评分 + 62题 + 养生建议                           |
| `backend/services/stress_service.py`       | 反向计分 + 压力分级 + 呼吸法 + 咨询信息                      |
| `frontend/src/pages/HealthAssessment.tsx`  | 双Tab + 动画选项 + 进度条 + 体质得分可视化 + 压力emoji结果 + 呼吸训练动画 |

### 9. 健康档案

| 文件                                    | 说明                               |
| ------------------------------------- | -------------------------------- |
| `backend/services/health_service.py`  | 6实体健康聚合 + 4领域风险检测引擎              |
| `frontend/src/pages/HealthProfile.tsx` | 睡眠/运动/饮食/情绪维度卡片 + 体质/压力 + 健康预警 |

### 10. 社群

| 文件                                    | 说明                                             |
| ------------------------------------- | ---------------------------------------------- |
| `backend/services/community_service.py` | 群组/排行榜/帖子 + 16条养生贴士                             |
| `frontend/src/pages/Community.tsx`    | 双Tab（小组+互助）+ 知识Tab + 奖牌排行 + 匿名帖子 + 邀请码 + 紫色主题 |

### 11. 🆕 辅导员看板

| 文件                                       | 说明                                |
| ---------------------------------------- | --------------------------------- |
| `backend/services/counselor_service.py`  | 班级健康聚合 + 睡眠/压力异常检测 + 体质分布         |
| `backend/routers/campus.py`              | 角色切换 / 班级设置 / 课程表CRUD / 积分 / 辅导员看板 |
| `frontend/src/pages/CounselorDashboard.tsx` | 班级概览4指标 + 体质分布 + 异常预警列表 + 智能干预建议   |

### 12. 🆕 课程表

| 模型 | 字段 |
|------|------|
| `CourseSchedule` | user_id, day_of_week(1-7), course_name, start_time, end_time, has_pe, location |

- Dashboard 联动：显示明日最早课程 + 体育课睡眠提醒
- 后续可扩展：课程表周视图、上课提醒推送

### 13. 🆕 健康积分

| 模型 | 字段 |
|------|------|
| `HealthPoints` | user_id, total_points, weekly_points, last_week_reset |

- 每周自动重置周积分
- Dashboard 星标卡片展示
- 后续可联动：打卡 +1、运动 +2、饮食记录 +1

---

## 数据库 ER 图 (19 张表)

```
users ─────────┬── user_profiles (1:1)
  │            ├── daily_routines (1:N)
  │            ├── diet_records (1:N)
  │            ├── exercise_records (1:N)
  │            ├── mood_records (1:N)
  │            ├── constitution_tests (1:N)
  │            ├── stress_assessments (1:N)
  │            ├── habits (1:N)
  │            ├── sleep_preferences (1:1)
  │            ├── meal_plans (1:N)
  │            ├── groups (M:N via group_members)
  │            ├── wellness_posts (1:N)
  │            ├── 🆕 course_schedules (1:N)
  │            └── 🆕 health_points (1:1)

canteen_foods (独立, 93条种子数据, 🆕 region 南北方分类)
groups ────── group_members ────── users
```

---

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.10+
- Supabase 账号 (PostgreSQL)

### 1. 后端

```bash
cd backend
cp .env.example .env  # 编辑 DATABASE_URL
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`，体验账号: `demo / demo123`

### 3. 切换主题

登录后点击侧边栏 🌙/☀️ 按钮切换深色/浅色模式

### 4. 切换角色

登录后点击侧边栏 🎓学生 / 👨‍🏫辅导员 按钮切换身份
