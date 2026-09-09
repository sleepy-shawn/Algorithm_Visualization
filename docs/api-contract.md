# API 契约文档 v1（接口基线清单）

> 整理人：晏志林（集成负责人）｜初版：2026-09-03｜v1 更新：2026-09-09
> 基准版本：sleepy-shawn/Algorithm_Visualization `main`（#6 部署、#8 UI、#9 轨迹、#10 题库均已合入，2026-09-09）
> 用途：现有接口全量清单，作为命名、错误与包装规范的基线。新增模块以此为基准对齐。

---

## 1. 通用约定

- 基础地址：生产 = `http://<host>:8082/api`（经 nginx 转发到后端 8080）；开发 = `http://localhost:8080/api`
- 数据格式：JSON
- 列表字段命名统一驼峰；时间字段为 ISO 格式 `yyyy-MM-dd HH:mm:ss`
- 错误响应体**分两类并存**（前端需分别兼容）：
  1. **轨迹端点**（`/api/algorithms/trace|compare|trace/supported`）：统一为 `AlgorithmApiError`
     `{ errorType, code, message, algorithm, codeLine, details, timestamp }` —— 见 §4.6
  2. **其余端点**：`{ "message": "错误描述" }` 或 `{ "error": "..." }`
     ⚠️ 且 `@Valid` 校验失败的返回体是 Spring 默认格式 `{timestamp, status, error, path}`，
     不是 `{message}`（2026-09-03 实测）→ 见文末「已知问题」
- **注意：当前所有接口无认证/无鉴权**（登录仅校验密码并返回用户信息，不发 token）→ 见文末「已知问题」

---

## 2. 端点总览（6 个 Controller，共 34 个 REST 端点 + 1 个 WebSocket）

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
| 29 | POST | `/api/algorithms/trace` | 算法执行轨迹（排序/二分） | AlgorithmTrace |
| 30 | POST | `/api/algorithms/compare` | 同类别算法对比 | AlgorithmTrace |
| 31 | GET | `/api/algorithms/trace/supported` | 轨迹支持算法列表 | AlgorithmTrace |
| 32 | GET | `/api/categories` | 题库分类列表 | Problem (Hot100) |
| 33 | GET | `/api/problems` | 题库题目列表(筛选) | Problem (Hot100) |
| 34 | GET | `/api/problems/{slug}` | 题目详情(含题解) | Problem (Hot100) |
| 35 | WS | `/ws/signal` | WebRTC 信令通道 | WebSocket |

> v0 表头曾标注"4 Controller / 23 端点"，系计数笔误，实际为 28 REST + 1 WS（本表已修正）。

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
| `search` | `algorithm`, `array: number[]`, `target: number` | algorithm = binary-search（仅支持二分查找；BFS/DFS 请走 `graph` 端点）|
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

### 算法轨迹与对比（#29~#31，AlgorithmTraceController）— 来自 PR #9，已合入 main
> 完整协议（字段级示例、错误码表、最小验证用例）见独立文档 **[docs/algorithm-trace-api.md](algorithm-trace-api.md)**，本节约束为与前后端联调直接相关的要点。前端轨迹/对比功能（朱轶凡 issue #2）尚未接入，契约先行。

**#29 POST `/trace`** — 单算法执行轨迹
- 请求：`{ algorithm, array: number[], target? }`（`@Valid`：algorithm 与 array 必填，元素非空）
- 支持范围：**5 种排序**（quick-sort/merge-sort/bubble-sort/heap-sort/insertion-sort）+ **binary-search**（其余算法 → `400 UNSUPPORTED_ALGORITHM`，details.supportedAlgorithms 给出清单）
- `array` 长度上限 **200**；binary-search 必须带 `target`（否则 `TARGET_REQUIRED`），且数组须已排序（否则 `400 ARRAY_NOT_SORTED`）
- 响应 `AlgorithmTraceResponse`：
```json
{
  "algorithm": "quick-sort", "category": "sorting", "input": [5,3,8,1], "result": [1,3,5,8],
  "steps": [
    { "stepNumber": 1, "eventType": "partition", "codeLine": 12,
      "stateSnapshot": { "...": "每步现场，字段随算法而变" },
      "explanation": "人类可读的中文解释", "metrics": { "stepCount": 1, "comparisons": 3, "swaps": 1, "accesses": 4, "executionTimeNanos": 1200 } }
  ],
  "metrics": { "stepCount": 9, "comparisons": 12, "swaps": 5, "accesses": 30, "executionTimeNanos": 9800 },
  "complexity": { "best": "O(n log n)", "average": "O(n log n)", "worst": "O(n²)", "space": "O(log n)" }
}
```
> `executionTimeNanos` 为纳秒（与旧六端点的 `executionTimeMs` 不同，注意单位）。

**#30 POST `/compare`** — 多算法同类别对比
- 请求：`{ algorithms: string[2..10], array: number[], target? }`（列表 2~10 个、不重复、均受支持；排序与查找**不能混比**——类别不同直接返回 `comparable: false` + limitations 说明；查找类目前仅 1 种算法，亦不可比）
- 响应 `AlgorithmComparisonResponse`：`{ input, comparable: bool, limitations: string[], results: [{algorithm, category, result, metrics, complexity}] }`
- 异常：同类排序输出不一致 → `500 INCONSISTENT_RESULTS`（LOGIC_ERROR，算法有 bug 时兜底）

**#31 GET `/trace/supported`**
- 响应：`{ "algorithms": ["binary-search", "bubble-sort", "..."] }`（排序 + 查找全集，供前端渲染选项）

**统一错误体 `AlgorithmApiError`**（HTTP 400 = INVALID_INPUT / PRECONDITION_NOT_MET / BOUNDARY_CONDITION，500 = LOGIC_ERROR）：
```json
{ "errorType": "INVALID_INPUT", "code": "UNSUPPORTED_ALGORITHM", "message": "不支持的算法：xxx",
  "algorithm": "xxx", "codeLine": null, "details": { "supportedAlgorithms": ["..."] }, "timestamp": "2026-09-09T08:00:00Z" }
```
> 参数校验（`@Valid`）与坏 JSON 也统一为该格式：`VALIDATION_ERROR`（details.field 指明字段）/ `MALFORMED_JSON`。
> 此错误体由 `AlgorithmTraceExceptionHandler` 提供，**仅作用于 AlgorithmTraceController**，其余 Controller 不受影响。

---

## 5. 题库 Hot100（`/api/problems`、`/api/categories`）— 来自 PR #10（M0+M1）

> 覆盖 M0+M1（建表 + 种子数据 + 只读 REST），当前**只有查询接口，无写入接口**。
> 数据层：`problem` / `problem_category` / `problem_solution` 三表由 ddl-auto=update 自动创建；
> 启动时 DataSeeder 检测 `problem` 表为空才灌入 9 个分类 + 20 道题目（幂等，题面为自行整理）。

### #32 GET `/categories`
响应：`ProblemCategory[]`，按 orderIndex 升序：
```json
{ "id": 1, "name": "动态规划", "slug": "dp", "icon": "Timeline", "orderIndex": 8 }
```
分类 slug 全集：`array-hash` / `two-pointers` / `stack` / `linked-list` / `binary-search` / `tree` / `graph` / `dp` / `backtracking`

### #33 GET `/problems`
请求参数（均可选，**互斥：同时传多个时只按 category → difficulty → visualizerType 的优先级取第一个生效**）：

| 参数 | 取值 | 说明 |
|------|------|------|
| `category` | 分类 slug（见上） | 不存在该分类 → `200 []` |
| `difficulty` | `EASY` / `MEDIUM` / `HARD` | 自动转大写，不区分大小写 |
| `visualizerType` | `graph` / `dp` / `search` / `stack` / `linkedlist` / `binarytree` / `backtracking` | 部分题目为空 |

响应：`Problem[]`，按 orderIndex 升序，每项：
```json
{ "id": 1, "slug": "two-sum", "title": "两数之和", "description": "题面（自整理，TEXT）",
  "difficulty": "EASY",
  "category": { "id": 1, "name": "数组与哈希", "slug": "array-hash", "icon": "Hash", "orderIndex": 1 },
  "tags": "数组,哈希表", "visualizerType": null,
  "timeComplexity": "O(n)", "spaceComplexity": "O(n)",
  "orderIndex": 1, "createdAt": "2026-09-09T07:00:00" }
```

### #34 GET `/problems/{slug}`
- `{slug}` 不存在 → **`404` 空 body**（区分于列表的空数组）
- 响应：`{ "problem": Problem, "solutions": [...] }`，solutions 按 orderIndex 升序：
```json
{ "id": 1, "approachName": "哈希表一次遍历", "description": "思路讲解",
  "code": "Java 参考代码（纯文本）", "timeComplexity": "O(n)", "spaceComplexity": "O(n)", "orderIndex": 1 }
```
> 注：solutions 数组元素内嵌了完整 `problem`（含 category，EAGER 反查所致），payload 有重复，前端按需取用。
> 当前每道题仅 1 种题解（表结构已支持多种）。

---

## 6. 聊天 Chat（`/api/chat`）

| 端点 | 请求 | 成功响应 |
|------|------|---------|
| POST `/sessions` | `{ userId, title }` | `200 ChatSession{id, title, createdAt}` |
| GET `/sessions?userId=` | - | `ChatSession[]`（按创建时间倒序）|
| GET `/sessions/{id}/messages` | - | `ChatMessage[]`：`{id, role: "user"|"assistant", content, createdAt}` |
| POST `/sessions/{id}/messages` | `{ role, content }` | `ChatMessage` |
| DELETE `/sessions/{id}` | - | `204` |

> 会话与消息存在 MySQL（表 chat_session / chat_message）。删除会话未校验归属。

---

## 7. 竞赛 Competition（`/api/competition`）

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

## 8. WebSocket：`/ws/signal`

- 原始 WebSocket（非 STOMP），仅用于 **WebRTC 信令**（竞赛房间内 P2P 连接协商）。
- nginx 已配置 `/ws/` 反代 + upgrade 头（实际打包进镜像的是 `frontend/nginx.conf`，随 `frontend/Dockerfile` 构建；`deploy/nginx/nginx.conf` 是旧副本，内容已不一致，勿再引用）。
- **不是**通用实时聊天通道 —— 前端竞赛若需房间内文字聊天，走 WebRTC DataChannel。

---

## 9. 已知问题与风险（集成负责人视角）

| 级别 | 问题 | 影响 | 建议 |
|------|------|------|------|
| 🔴 | 无任何鉴权：登录不发 token，历史/聊天/竞赛全部裸奔 | 任意知道 userId 的人可删他人数据 | 后续引入 JWT 或最少做 userId 归属校验 |
| 🟠 | `/verify-step` 的 graph 分支未实现 | 图算法评测题无法生成/验证 | 轨迹模块（#9）目前也只覆盖排序+二分；图算法评测需轨迹扩展 graph 支持，或改用 Hot100 题库（#10）的图题数据自建验证 |
| 🟠 | 运行历史不区分用户、仅存最近 20 条 | 多用户互相污染历史列表 | 定数据模型时加 userId |
| 🟡 | 轨迹 API（#29~#31）仅支持 5 种排序 + binary-search | 前端轨迹页只能演示这两类；查找类仅 1 种算法无法同类对比 | 待轨迹模块 M2 扩展 graph/dp 等（接口已预留 algorithm 参数）|
| 🟡 | 错误体分两类并存：轨迹端点已统一 AlgorithmApiError，其余端点（含旧六端点、Auth/Chat/Competition）仍是 message/Spring 默认格式 | 前端需按端点分别兼容 | 将 AlgorithmTraceExceptionHandler 推广为全局 @RestControllerAdvice |
| 🟡 | Hot100（#10）无鉴权、无分页（现 20 题全量返回），筛选条件互斥不可叠加 | 数据量增大后全量列表变慢；组合筛选不可用 | M2 加分页与 AND 筛选；鉴权随全局方案 |
| 🟡 | `deleteHistory`/`deleteSession` 对不存在的 id 静默返回 204 | 前端无法区分"删成功/不存在" | 可接受，记录即可 |
| 🟢 | AI 能力（复杂度分析/评测）依赖 LLM key，未配置时降级为 fixed 模式 | 功能不完整 | 部署环境变量补齐（部署任务跟进）|

---

## 10. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0 | 2026-09-03 | 首次盘点，覆盖 4 Controller 全部端点与 DTO 字段 |
| v0.1 | 2026-09-09 | 按 PR #6 review 修正：`/search` 仅支持 binary-search（BFS/DFS 走 `/graph`）；nginx 配置路径更正为实际打包用的 `frontend/nginx.conf` |
| v1 | 2026-09-09 | 合入 #9 轨迹 API（#29~#31，引用 docs/algorithm-trace-api.md，统一错误体 AlgorithmApiError）+ #10 题库 API（#32~#34，9 分类 20 题种子）；新增 §5 题库章节；修正 v0 端点计数笔误（实为 28 REST）；错误体"两类并存"现状说明；文件名由 api-contract-v0.md 更名为 api-contract.md（文档持续演进，不再按版本命名文件）|

> 下一版预告：轨迹模块 M2 扩展 graph/dp 覆盖、Hot100 M2（前端接入、分页/AND 筛选、鉴权）落定后升 v1.1。
