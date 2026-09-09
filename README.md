# 算法可视化学习平台

> Algorithm Visualization Learning Platform — 交互式算法学习与可视化教学平台

**第七小组项目** | Angular 17 + Spring Boot 3.2 + Three.js + WebRTC + MySQL + Docker

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🔮 **算法可视化** | 17+ 种算法的分步执行可视化（排序、图搜索、动态规划、回溯、分治） |
| 📊 **教学阶段引导** | 每种算法的执行过程划分为离散教学阶段，进度条实时展示 |
| ⚖️ **对比模式** | 同一分类的两个算法并排展示，同步播放对比步数/比较/操作次数 |
| 📝 **评估测试** | AI 动态出题 + LLM 语义评测，或经典 5 题固定题库 |
| 🤖 **AI 复杂度分析** | 对任意代码进行时间/空间复杂度分析，支持多轮对话 |
| 🎮 **1v1 竞赛** | WebRTC 实时对战，算法知识竞速 |
| 🌀 **3D 可视化** | Three.js 3D 渲染数组、栈、队列、链表、二叉树、B+ 树 |
| 👤 **用户系统** | 注册/登录、SHA-256 加盐哈希、运行历史记录 |

---

## 技术栈

```
前端框架     Angular 17.3 (Standalone Components) + TypeScript 5.4
UI 框架      Tailwind CSS 3.4
3D 渲染      Three.js 0.184
状态管理      Angular Signals (Signal-based Store)
后端框架     Spring Boot 3.2.3 + Java 17
数据库       MySQL 8.0 + Spring Data JPA
实时通信      WebSocket + WebRTC DataChannel
AI 服务      DeepSeek-V3.2 (兼容 OpenAI 格式)
容器化       Docker + Docker Compose
```

---

## 快速开始

### 1. 环境要求

| 组件 | 版本要求 |
|------|---------|
| JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 8.0+ |
| Docker | 20.10+ (可选) |

### 2. Docker 部署（推荐）

```bash
# 克隆项目后，进入项目目录
cd 算法可视化平台_第七小组

# 创建 deploy 目录并准备文件
mkdir -p deploy/nginx/dist deploy/backend

# 复制构建产物（后端先打包）
cp backend/target/algorithm-viz-backend-1.0.0.jar deploy/backend/app.jar

# 复制前端构建产物
cp -r frontend/dist/algorithm-viz-frontend/* deploy/nginx/dist/

# 复制配置文件
cp backend/Dockerfile deploy/backend/
cp frontend/nginx.conf deploy/nginx/ 2>/dev/null || true

# 启动服务
cd deploy
docker compose up -d --build

# 访问
open http://localhost:8080
```

### 3. 本地开发

#### 数据库初始化

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS algorithm_viz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 后端启动

```bash
cd backend
export DB_PASSWORD=你的MySQL密码
./mvnw spring-boot:run
# 或直接运行 JAR
java -jar target/algorithm-viz-backend-1.0.0.jar
```

#### 前端启动

```bash
cd frontend
npm install
npm start
# 访问 http://localhost:4200
```

---

## 项目结构

```
algorithm-viz-platform/
├── frontend/                      # Angular 17 前端
│   ├── src/app/
│   │   ├── components/            # 12 个通用组件
│   │   ├── visualizers/           # 7 种算法可视化 + 3D
│   │   ├── services/              # API 服务 (5 个)
│   │   ├── store/                 # Signal 状态管理
│   │   └── models/                # TypeScript 类型定义
│   └── package.json
│
├── backend/                       # Spring Boot 3.2 后端
│   ├── src/main/java/com/algorithmviz/
│   │   ├── config/                # CORS + WebSocket 配置
│   │   ├── controller/            # 4 个 REST 控制器
│   │   ├── service/               # 10 个业务服务
│   │   ├── model/                 # 9 个业务模型
│   │   ├── entity/                # 2 个 JPA 实体
│   │   └── dto/                   # 16 个数据传输对象
│   └── pom.xml
│
├── docs/                          # 项目文档
│   ├── 部署文档.md                 # Docker 部署指南
│   ├── learning-guidance-system.md # 学习引导系统
│   ├── ai助手.md                  # AI 功能设计
│   └── comprehensive-project-documentation.md # 综合文档
│
├── docker-compose.yml             # Docker 编排配置
├── CLAUDE.md                      # Claude Code 指引
└── README.md                      # 本文件
```

---

## API 端点

### 算法执行

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/algorithms/sort` | POST | 排序算法 |
| `/api/algorithms/search` | POST | 二分查找 |
| `/api/algorithms/graph` | POST | 图算法 (6种) |
| `/api/algorithms/dp` | POST | 动态规划 |
| `/api/algorithms/backtracking` | POST | N皇后回溯 |
| `/api/algorithms/divide-conquer` | POST | Karatsuba 分治 |
| `/api/algorithms/verify-step` | POST | 步骤验证 |
| `/api/algorithms/history` | GET | 运行历史 |
| `/api/algorithms/health` | GET | 健康检查 |
| `/api/algorithms/trace` | POST | 统一算法执行轨迹、状态快照与错误解释 |
| `/api/algorithms/compare` | POST | 同输入下的算法指标与复杂度对比 |
| `/api/algorithms/trace/supported` | GET | 获取轨迹接口支持的算法列表 |

### 认证

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |

### 竞赛

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/competition/rooms` | POST | 创建房间 |
| `/api/competition/rooms/{id}/join` | POST | 加入房间 |
| `/api/competition/rooms/{id}/ready` | POST | 准备开始 |
| `/api/competition/rooms/{id}/submit` | POST | 提交答案 |
| `/api/competition/rooms/{id}/result` | GET | 获取结果 |
| `/ws/signaling` | WS | WebRTC 信令 |

---

## 支持的算法

### 排序算法 (5种)
快速排序 | 归并排序 | 冒泡排序 | 堆排序 | 插入排序

### 图算法 (6种)
Dijkstra | BFS | DFS | Prim | Kruskal | A\*

### 其他算法
二分查找 | 0/1 背包 | N皇后 | Karatsuba

### 数据结构 (3D)
数组 | 栈 | 队列 | 链表 | 二叉树 | B+ 树

---

## 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DB_PASSWORD` | ✅ | MySQL 数据库密码 |
| `AI_COMPLEXITY_API_KEY` | ❌ | AI 复杂度分析 API Key |
| `AI_ASSESSMENT_API_KEY` | ❌ | AI 评测 API Key |

---

## Docker 常用命令

```bash
# 构建并启动
docker compose up -d --build

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 移除容器
docker compose down
```

---

## 开发说明

### 前端构建

```bash
cd frontend
npm install
npm run build -- --configuration production
```

### 后端打包

```bash
cd backend
./mvnw clean package -DskipTests
```

### 端到端测试

```bash
# 健康检查
curl http://localhost:8080/api/algorithms/health

# 排序算法测试
curl -X POST http://localhost:8080/api/algorithms/sort \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"quick-sort","array":[64,34,25,12,22,11,90]}'
```

---

## 文档

- [部署文档](docs/部署文档.md) — Docker + AWS ECS 部署指南
- [学习引导系统](docs/learning-guidance-system.md) — Phase 教学 + 对比模式 + 评估测试
- [AI 助手设计](docs/ai助手.md) — AI 复杂度分析功能说明
- [算法执行轨迹与对比 API](docs/algorithm-trace-api.md) — 统一步骤协议、错误格式与最小调用示例
- [综合项目文档](docs/comprehensive-project-documentation.md) — 完整技术文档

---

## 许可证

本项目仅供学习和教学使用。
