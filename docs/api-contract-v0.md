# API 契约文档 v0（接口基线清单）

> 整理人：晏志林（集成负责人）｜日期：2026-09-03
> 基准版本：wenuanhappy/algorithm-viz-platform（当前部署版）
> 用途：现有接口全量清单。组员新增 Hot 100 / 执行轨迹接口时，以此为基线，沿用相同的
> 命名、错误与包装规范。

---

## 1. 通用约定

- 基础地址：生产 = `http://<host>:8082/api`（经 nginx 转发到后端 8080）；开发 = `http://localhost:8080/api`
- 数据格式：JSON
- 列表字段命名统一驼峰；时间字段为 ISO 格式 `yyyy-MM-dd HH:mm:ss`
- 错误响应格式（多数端点）：`HTTP 4xx/5xx + { "message": "错误描述" }` 或 `{ "error": "..." }`
- **⚠️ 已实测（2026-09-03）：`@Valid` 参数校验失败的返回体是 Spring 默认格式** `{timestamp, status, error, path}`，
  不是 `{message}`。两类错误体并存，前端需分别兼容 —— 见文末「已知问题」
- **注意：当前所有接口无认证/无鉴权**（登录仅校验密码并返回用户信息，不发 token）→ 见文末「已知问题」

---

## 2. 端点总览（4 个 Controller，共 23 个端点 + 1 个 WebSocket）

| # | 方法 | 路径 | 用途 | Controller |
|---|------|------|------|-----------|
| 1 | POST | `/api/auth/register` | 注册 | Auth |
| 2 | POST | `/api/auth/login` | 登录 | Auth |
| 3 | POST | `/api/algorithms/sort` | 排序算法步骤 | Algorithm |
| 4 | POST | `/api/algorithms/search` | 搜索算法步骤 | Algorithm |
| 5 | POST | `/api/algorithms/graph` | 图算法步骤 | Algorithm |
| 6 | POST | `/api/algorithms/dp` | 动态规划步骤 | Algorithm |
| 7 | POST | `/api/algorithms/backtracking` | 回溯(N皇后)步骤 | Algorithm |
| 8 | POST | `/api/algorithms/divide-conquer` | 分治步骤 | Algorithm |
| 9 | POST | `/api/algorithms/algorithm-complexity` | AI 复杂度分析 | Algorithm |
| 10 | GET | `/api/algorithms/history?category=` | 运行历史(最近20条/按类) | Algorithm |
| 11 | DELETE | `/api/algorithms/history/{id}` | 删除一条历史 | Algorithm |
| 12 | POST | `/api/algorithms/verify-step` | 校验某一步骤(评测用) | Algorithm |
| 13 | POST | `/api/algorithms/assessment/generate` | AI 生成评测题 | Algorithm |
| 14 | POST | `/api/algorithms/assessment/evaluate` | AI 评测答案 | Algorithm |
| 15 | GET | `/api/algorithms/assessment/health` | 评测 AI 是否可用 | Algorithm |
| 16 | GET | `/api/algorithms/health` | 服务健康检查 | Algorithm |
| 17 | POST | `/api/chat/sessions` | 新建聊天会话 | Chat |
| 18 | GET | `/api/chat/sessions?userId=` | 用户会话列表 | Chat |
| 19 | GET | `/api/chat/sessions/{id}/messages` | 会话消息列表 | Chat |
| 20 | POST | `/api/chat/sessions/{id}/messages` | 追加一条消息 | Chat |
| 21 | DELETE | `/api/chat/sessions/{id}` | 删除会话 | Chat |
| 22 | POST | `/api/competition/rooms` | 创建竞赛房间 | Competition |
| 23 | POST | `/api/competition/rooms/{roomId}/join` | 加入房间 | Competition |
| 24 | POST | `/api/competition/rooms/{roomId}/ready` | 准备就绪 | Competition |
| 25 | GET | `/api/competition/rooms/{roomId}` | 查询房间 | Competition |
| 26 | POST | `/api/competition/rooms/{roomId}/leave` | 离开房间 | Competition |
| 27 | POST | `/api/competition/rooms/{roomId}/submit` | 提交答案 | Competition |
| 28 | GET | `/api/competition/rooms/{roomId}/result` | 排名结果 | Competition |
| 29 | WS | `/ws/signal` | WebRTC 信令通道 | WebSocket |

---

## 3. 认证 Auth（`/api/auth`）

### POST `/register` — 注册
请求：
```json
{ "username": "yanzhilin", "displayName": "晏志林", "password": "123456" }
```
成功：`201` 返回 AuthResponse：
```json
{ "id": 1, "username": "yanzhilin", "displayName": "晏志林" }
```
失败：`400 { "message": "用户名已存在等" }`

### POST `/login` — 登录
请求：`{ "username": "...", "password": "..." }`
成功：`200` AuthResponse（同注册返回）
失败：`401 { "message": "用户名或密码错误" }`

> ⚠️ 契约要点：AuthResponse **没有 token / 过期时间**，登录状态全靠前端存 userId。

---

## 4. 算法执行（`/api/algorithms`）

### 统一响应外壳（#3~#8 六个可视化端点共用）
```json
{
  "steps": [ ... ],        // 算法分步轨迹（数组，结构因算法而异）
  "stepCount": 42,         // 总步数
  "comparisons": 30,       // 比较次数
  "extra": 8,              // 额外指标：排序=交换数；回溯=回溯数；分治=加法数；其余=0
  "executionTimeMs": 5     // 后端计算耗时
}
```

### 各端点请求体

| 端点 | 请求体字段 | 说明 |
|------|-----------|------|
| `sort` | `algorithm`, `array: number[]` | algorithm ∈ quick-sort/merge-sort/bubble-sort/heap-sort/insertion-sort |
| `search` | `algorithm`, `array: number[]`, `target: number` | algorithm ∈ binary-search/bfs/dfs（数组上搜索）|
| `graph` | `algorithm`, `graph: GraphData`, `startId`, `endId` | algorithm ∈ dijkstra/bfs/dfs/prim/kruskal/astar |
| `dp` | `algorithm`, `items: Item[]`, `capacity` | algorithm = knapsack |
| `backtracking` | `algorithm`, `n` | algorithm = n-queens |
| `divide-conquer` | `algorithm`, `x`, `y` | algorithm = karatsuba |

`GraphData`：`{ nodes: [{id, x, y, label}], edges: [{from, to, weight, directed}], directed, weighted }`
`Item`：`{ name, weight, value }`

> 注：`x`/`y` 与 Graph 节点坐标 `x`/`y` 在 DTO 中是 **String 类型**（Karatsuba 大数）或 double（坐标），
> 前端传值时已按字符串序列化，契约上保持"原样转发"即可，勿强转数字。

### #9 POST `/algorithm-complexity` — AI 复杂度分析
请求：
```json
{ "code": "...算法代码...", "language": "pseudocode", "caseType": "worst", "sessionId": 3 }
```
响应：
```json
{
  "timeComplexityWorst": "O(n log n)", "timeComplexityAverage": "...", "timeComplexityBest": "...",
  "spaceComplexity": "O(n)", "reasoningSteps": ["..."], "assumptions": ["..."],
  "optimizationSuggestions": ["..."], "confidence": 0.95
}
```
> 依赖外部 LLM key；key 未配置时返回 5xx。前端 AI 对话框的多轮上下文由 `sessionId` 关联 ChatController。

### #10 GET `/history?category=` — 运行历史
响应：`RunHistory[]`，每项：
```json
{ "id": 1, "category": "sorting", "algorithm": "quick-sort", "inputData": "{\"algorithm\":...}",
  "stepCount": 42, "comparisons": 30, "swaps": 8, "executionTimeMs": 5, "createdAt": "2026-09-02T18:26:57" }
```
不带 category 时返回**最近 20 条**（全用户共享，未按用户隔离）。

### #11 DELETE `/history/{id}` — 删除历史
成功：`204 No Content`。不存在也返回 204（不报错）。**无归属校验，任何人可删任何 id。**

### #12 POST `/verify-step` — 评测验证单步
请求：
```json
{ "algorithm": "quick-sort", "targetStepIndex": 3, "params": { "array": [5,3,8,1] } }
```
响应：`{ algorithm, category, targetStepIndex, stepData }`，`stepData` 为 null 表示下标越界。
> ⚠️ 已知缺陷：graph 类算法此端点**未真正实现**（固定返回提示文案）。

### #13 POST `/assessment/generate` — 生成评测题
请求：
```json
{ "questionCount": 5, "difficulty": "medium", "mode": "ai", "categories": ["sorting"], "algorithms": [], "questionTypes": [] }
```
成功：`200 AssessmentQuestion[]`；LLM key 未配置 → `503 {error}`。
`AssessmentQuestion`：`{ id, title, category, algorithm, questionType, description, inputParams, answer, options, explanation, targetStepIndex, verifyField, validated }`

### #14 POST `/assessment/evaluate` — 评测答案
请求：`{ question: AssessmentQuestion, userAnswer: "..." }`
响应：`{ correct, feedback, correctAnswer, confidence }`

### #15 GET `/assessment/health`
响应：`{ aiAvailable: bool, mode: "ai + fixed"|"fixed only", message }`

### #16 GET `/health`
响应：`{ status: "ok", service: "Algorithm Viz Backend" }`（Docker 健康检查依赖它）

---

## 5. 聊天 Chat（`/api/chat`）

| 端点 | 请求 | 成功响应 |
|------|------|---------|
| POST `/sessions` | `{ userId, title }` | `200 ChatSession{id, title, createdAt}` |
| GET `/sessions?userId=` | - | `ChatSession[]`（按创建时间倒序）|
| GET `/sessions/{id}/messages` | - | `ChatMessage[]`：`{id, role: "user"|"assistant", content, createdAt}` |
| POST `/sessions/{id}/messages` | `{ role, content }` | `ChatMessage` |
| DELETE `/sessions/{id}` | - | `204` |

> 会话与消息存在 MySQL（表 chat_session / chat_message）。删除会话未校验归属。

---

## 6. 竞赛 Competition（`/api/competition`）

房间视图统一由 `publicView(Room)` 产出（内部字段脱敏后的公开快照）。

| 端点 | 请求体 | 说明 |
|------|--------|------|
| POST `/rooms` | `{ algorithm, userId, displayName }` | 创建房间，返回房间视图 |
| POST `/rooms/{roomId}/join` | `{ userId, displayName }` | 满员/状态冲突 → `409 {message}` |
| POST `/rooms/{roomId}/ready` | `{ userId }` | 标记准备 |
| GET `/rooms/{roomId}` | - | 查房间状态 |
| POST `/rooms/{roomId}/leave` | `{ userId }` | 离开 |
| POST `/rooms/{roomId}/submit` | `{ userId, questionId, answer }` | 提交竞答答案 |
| GET `/rooms/{roomId}/result` | - | `{ rankings: [CompetitionPlayer...] }` |

`CompetitionSubmitResponse`：`{ correct, correctAnswer, awardedPoints, score, duplicate }`
`roomId` 为服务端生成的字符串 ID。

---

## 7. WebSocket：`/ws/signal`

- 原始 WebSocket（非 STOMP），仅用于 **WebRTC 信令**（竞赛房间内 P2P 连接协商）。
- nginx 已配置 `/ws/` 反代 + upgrade 头（deploy/nginx/nginx.conf）。
- **不是**通用实时聊天通道 —— 前端竞赛若需房间内文字聊天，走 WebRTC DataChannel。

---

## 8. 已知问题与风险（集成负责人视角）

| 级别 | 问题 | 影响 | 建议 |
|------|------|------|------|
| 🔴 | 无任何鉴权：登录不发 token，历史/聊天/竞赛全部裸奔 | 任意知道 userId 的人可删他人数据 | 后续引入 JWT 或最少做 userId 归属校验 |
| 🟠 | `/verify-step` 的 graph 分支未实现 | 图算法评测题无法生成/验证 | 后端 B（浮宇）做轨迹改造时补齐 |
| 🟠 | 运行历史不区分用户、仅存最近 20 条 | 多用户互相污染历史列表 | 定数据模型时加 userId |
| 🟡 | `deleteHistory`/`deleteSession` 对不存在的 id 静默返回 204 | 前端无法区分"删成功/不存在" | 可接受，记录即可 |
| 🟡 | 六个可视化端点的错误码未统一（缺 @ExceptionHandler） | 前端难以统一处理 400 | Hot 100 改造时统一错误体 |
| 🟢 | AI 能力（复杂度分析/评测）依赖 LLM key，未配置时降级为 fixed 模式 | 功能不完整 | 部署环境变量补齐（部署任务跟进） |

---

## 9. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0 | 2026-09-03 | 首次盘点，覆盖 4 Controller 全部端点与 DTO 字段（不含组员新增的 Hot100/轨迹接口，待其合入后升 v1）|
