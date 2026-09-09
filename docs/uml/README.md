# 算法可视化平台 · UML 图册

**第七小组 · 第二次实践活动**  
依据 GitHub `main`，核对日期：2026-09-09。固定基准：[ `256ff09` ](https://github.com/sleepy-shawn/Algorithm_Visualization/commit/256ff09dbc15e37a4c520797ab265d8e321a3ad2)。

本图册使用 Mermaid 绘制 **2 张 UML 类图 + 3 张 UML 时序图**。类名和方法名对应实现；中文用于解释职责。可直接将 PNG 插入报告，SVG 适合无损缩放，`.mmd` 可粘贴到支持 Mermaid 的编辑器中继续修改。

## 最新进展

| 已合并 PR | 当前实现 | 图中对应 |
| --- | --- | --- |
| [#8 前端体验](https://github.com/sleepy-shawn/Algorithm_Visualization/pull/8) | 首页、目录、学习页；主题、语言、播放与兼容算法对比 | 图 1、3 |
| [#9 执行轨迹](https://github.com/sleepy-shawn/Algorithm_Visualization/pull/9) | 统一 trace / compare、错误解释与复杂度指标 | 图 1、4 |
| [#10 Hot100 题库](https://github.com/sleepy-shawn/Algorithm_Visualization/pull/10) | 分类、题目、题解实体；种子数据与只读 API | 图 1、2、5 |
| [#6 部署与契约](https://github.com/sleepy-shawn/Algorithm_Visualization/pull/6) | Docker 服务重启策略与接口说明 | 运行环境：浏览器 → Nginx → Spring Boot → MySQL |

**范围说明**：当前目录数据仍来自前端 `ALGORITHM_GROUPS`；网页尚未调用新题库、`/trace` 或 `/compare`。聊天、竞赛和 AI 后端保留，但没有对应网页入口。登录返回用户信息，尚无服务端会话令牌；类图中的用户关联不代表已经实现访问控制。

## 图纸索引

| 图 | PNG（报告） | SVG（矢量） | Mermaid（编辑） |
| --- | --- | --- | --- |
| 核心服务类图 | [PNG](images/01-services.png) | [SVG](images/01-services.svg) | [源码](source/01-services.mmd) |
| 数据实体类图 | [PNG](images/02-domain.png) | [SVG](images/02-domain.svg) | [源码](source/02-domain.mmd) |
| 网页运行与播放时序图 | [PNG](images/03-playback.png) | [SVG](images/03-playback.svg) | [源码](source/03-playback.mmd) |
| 统一轨迹对比时序图 | [PNG](images/04-trace-compare.png) | [SVG](images/04-trace-compare.svg) | [源码](source/04-trace-compare.mmd) |
| Hot100 题目详情时序图 | [PNG](images/05-problems.png) | [SVG](images/05-problems.svg) | [源码](source/05-problems.mmd) |

## 1. 核心服务类图

选取网页状态、现有算法接口与两个新模块的关键类；是实现节选，不是全项目类清单。实线箭头表示持有或注入的引用，虚线箭头表示 HTTP 调用依赖。

![核心服务类图](images/01-services.svg)

<details>
<summary>展开可编辑 Mermaid 源码</summary>

```mermaid
---
title: 01 · 核心服务类图
---
classDiagram
 direction TB
 class AppComponent {
  +navigate(panel)
  +learn(id)
 }
 class AlgorithmStore {
  +selectedAlgo
  +steps
  +currentStep
  +runBothAlgorithms()
  +startPlay()
  +reset()
 }
 class AlgorithmService {
  +runSort(algorithm, array)
  +runSearch(algorithm, array, target)
  +runGraph(algorithm, graph, startId, endId)
 }
 class AlgorithmController {
  +sort(req)
  +search(req)
  +graph(req)
 }
 class SortingService {
  +generateSteps(algorithm, array)
 }
 class SearchService {
  +generateSteps(algorithm, array, target)
 }
 class AlgorithmTraceController {
  +trace(request)
  +compare(request)
  +supportedAlgorithms()
 }
 class AlgorithmTraceService {
  +trace(request)
  +compare(request)
 }
 class ProblemController {
  +categories()
  +problems(category, difficulty, visualizerType)
  +problemDetail(slug)
 }
 class ProblemService {
  +listCategories()
  +listProblems(categorySlug, difficulty, visualizerType)
  +getProblem(slug)
  +listSolutions(problemId)
 }
 AppComponent --> AlgorithmStore : 注入
 AlgorithmStore --> AlgorithmService : 请求步骤
 AlgorithmService ..> AlgorithmController : HTTP 现有可视化接口
 AlgorithmController --> SortingService
 AlgorithmController --> SearchService
 AlgorithmTraceController --> AlgorithmTraceService
 AlgorithmTraceService --> SortingService : 复用
 AlgorithmTraceService --> SearchService : 复用
 ProblemController --> ProblemService
 note for AlgorithmController "另有 graph / dp / backtracking / divide-conquer 等方法，图中节选"
 note for AlgorithmTraceController "PR 9 已合并；网页尚未调用 trace / compare"
 note for ProblemController "PR 10 已合并；网页目录仍使用本地算法清单"
```

</details>

## 2. 数据实体类图

标出数据库实体与关联基数。ChatSession 的 user_id 允许为空，因此为 0..1；ChatMessage 由会话级联删除，使用组合关系。RunHistory 没有用户关联。属性为理解模型所需的节选，减号表示 private。

![数据实体类图](images/02-domain.svg)

<details>
<summary>展开可编辑 Mermaid 源码</summary>

```mermaid
---
title: 02 · 数据实体类图
---
classDiagram
 direction LR
 class ProblemCategory {
  -Long id
  -String name
  -String slug
  -String icon
  -Integer orderIndex
 }
 class Problem {
  -Long id
  -String slug
  -String title
  -String difficulty
  -String description
  -String tags
  -String visualizerType
  -String timeComplexity
  -String spaceComplexity
 }
 class ProblemSolution {
  -Long id
  -String approachName
  -String description
  -String code
  -String timeComplexity
  -String spaceComplexity
 }
 class AppUser {
  -Long id
  -String username
  -String displayName
  -String passwordHash
  -String passwordSalt
 }
 class ChatSession {
  -Long id
  -String title
  -LocalDateTime createdAt
 }
 class ChatMessage {
  -Long id
  -String role
  -String content
  -LocalDateTime createdAt
 }
 class RunHistory {
  -Long id
  -String category
  -String algorithm
  -String inputData
  -Integer stepCount
  -Integer comparisons
  -Integer swaps
  -Long executionTimeMs
 }
 Problem "0..*" --> "1" ProblemCategory : category / category_id
 ProblemSolution "0..*" --> "1" Problem : problem / problem_id
 ChatSession "0..*" --> "0..1" AppUser : user / user_id
 ChatSession "1" *-- "0..*" ChatMessage : messages / session_id
 note for RunHistory "没有 userId 或用户关联；不能画成个人学习记录"
 note for ChatSession "后端保留；当前网页没有聊天入口"
 note for Problem "字段为节选；题库只提供查询，没有提交判题实体"
```

</details>

## 3. 网页运行与播放时序图

以排序为例描述当前网页的真实调用链。结果包含全部步骤，之后的播放和单步在浏览器内进行；双算法对比分别请求旧接口。失败反馈及完整并发取消细节未展开。

![网页运行与播放时序图](images/03-playback.svg)

<details>
<summary>展开可编辑 Mermaid 源码</summary>

```mermaid
---
title: 03 · 网页运行与播放时序图
---
sequenceDiagram
 autonumber
 actor U as 学习者
 participant C as ControlPanelComponent
 participant S as AlgorithmStore
 participant A as AlgorithmService
 participant B as AlgorithmController
 participant E as SortingService
 participant H as RunHistoryRepository
 participant V as SortingVisualizerComponent
 U->>C: 点击运行（排序示例）
 C->>S: runBothAlgorithms()
 S->>S: runAlgorithm()：停止播放，增加请求版本
 par 主算法请求
  S->>A: runSort(algorithm, array)
  A->>B: POST /api/algorithms/sort
  B->>E: generateSteps(algorithm, array)
  E-->>B: List of SortStep
  B->>H: save(运行记录)
  H-->>B: 已保存
  B-->>A: steps + stepCount + 指标
  A-->>S: Observable 返回步骤
  S->>S: 仅接收当前请求版本，currentStep = 0
  S-->>V: Signals 更新当前步骤
 and 对比请求（仅开启对比时）
  S->>A: runSort(对比算法, 相同输入)
  Note over A,H: 另一次旧接口请求，独立生成步骤并保存历史
  A-->>S: compareSteps（响应顺序不保证）
 end
 Note over S,B: 当前对比不调用 /compare
 U->>C: 开始播放
 C->>S: startPlay()；对比启用时也启动对比计时器
 loop 每 500ms，直到末步或暂停
  S->>S: 更新步骤索引
  S-->>V: 更新图形、说明与统计
 end
 Note over S,V: 播放和单步使用本地步骤，不逐步请求后端
 Note over S,V: 3D 入口使用前端 Three.js，不走此排序请求链
```

</details>

## 4. 统一轨迹对比时序图

描述 PR #9 的新接口。调用者标为 API 调用者，避免误画成网页已接入。正常分支使用同类排序；跨类别对比返回 comparable=false，业务逻辑错误由专属异常处理器转换。

![统一轨迹对比时序图](images/04-trace-compare.svg)

<details>
<summary>展开可编辑 Mermaid 源码</summary>

```mermaid
---
title: 04 · 统一轨迹对比时序图
---
sequenceDiagram
 autonumber
 actor C as API 调用者（尚非现有网页）
 participant R as AlgorithmTraceController
 participant S as AlgorithmTraceService
 participant A as SortingService
 participant E as AlgorithmTraceExceptionHandler
 C->>R: POST /api/algorithms/compare<br/>algorithms + array
 R->>S: compare(request)
 S->>S: 校验数组、数量、名称、重复与支持范围
 alt 输入不合法
  S-->>E: AlgorithmTraceException
  E-->>C: HTTP 400 + AlgorithmApiError
 else 排序与查找混合
  S-->>R: comparable=false + 说明 + 空结果
  R-->>C: HTTP 200
 else 同类排序算法
  loop 对每个排序算法，顺序执行
   S->>S: trace(request)，校验参数
   S->>A: generateSteps(algorithm, array)
   A-->>S: SortStep 列表
   S->>S: 转换统一轨迹、累计指标、复杂度<br/>并检查各算法排序结果一致
  end
  alt 结果一致
   S-->>R: comparable=true + results + 注意事项
   R-->>C: HTTP 200 + AlgorithmComparisonResponse
  else 算法执行异常或结果不一致
   S-->>E: LOGIC_ERROR
   E-->>C: HTTP 500 + AlgorithmApiError
  end
 end
 Note over C,E: @Valid 或 JSON 解析失败也由专属处理器返回 400
 Note over S,A: 单独 /trace 支持 5 种排序和二分查找；无运行历史写入
 Note over C,S: 耗时含轨迹生成，不代表严格性能基准
```

</details>

## 5. Hot100 题目详情时序图

描述 PR #10 的题库查询接口。不存在的 slug 返回 404；存在时查询题解并返回 problem + solutions。没有添加尚未实现的判题、提交或学习进度功能。

![Hot100 题目详情时序图](images/05-problems.svg)

<details>
<summary>展开可编辑 Mermaid 源码</summary>

```mermaid
---
title: 05 · Hot100 题目详情时序图
---
sequenceDiagram
 autonumber
 actor C as API 调用者（题库网页待接入）
 participant P as ProblemController
 participant S as ProblemService
 participant R as ProblemRepository
 participant T as ProblemSolutionRepository
 C->>P: GET /api/problems/{slug}
 P->>S: getProblem(slug)
 S->>R: findBySlug(slug)
 R-->>S: Optional of Problem
 S-->>P: Problem 或 null
 alt 题目不存在
  P-->>C: HTTP 404
 else 题目存在
  P->>S: listSolutions(problem.id)
  S->>T: findByProblemIdOrderByOrderIndexAsc(id)
  T-->>S: 题解列表
  S-->>P: solutions
  P-->>C: HTTP 200：problem + solutions
 end
 Note over C,T: 题目和题解通过 JPA 存在 MySQL；关联分类随题目查询
 Note over C,S: 列表接口 /api/problems 另支持筛选<br/>当前优先级 category > difficulty > visualizerType，非组合筛选
 Note over C,S: /api/categories 返回分类；本轮没有提交代码、判题或学习进度接口
```

</details>

## 代码依据

以下链接固定到绘图基准，便于老师或组员核对，后续仓库改动不会改变本次依据。

- [app.component.ts](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/frontend/src/app/app.component.ts)
- [algorithm.store.ts](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/frontend/src/app/store/algorithm.store.ts)
- [algorithm.service.ts](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/frontend/src/app/services/algorithm.service.ts)
- [algorithm-catalog.ts](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/frontend/src/app/data/algorithm-catalog.ts)
- [AlgorithmController.java](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/controller/AlgorithmController.java)
- [AlgorithmTraceService.java](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/service/AlgorithmTraceService.java)
- [AlgorithmTraceExceptionHandler.java](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/controller/AlgorithmTraceExceptionHandler.java)
- [ProblemController.java](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/controller/ProblemController.java)
- [ProblemService.java](https://github.com/sleepy-shawn/Algorithm_Visualization/blob/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/service/ProblemService.java)
- [entity](https://github.com/sleepy-shawn/Algorithm_Visualization/tree/256ff09dbc15e37a4c520797ab265d8e321a3ad2/backend/src/main/java/com/algorithmviz/entity)

## 编辑与导出

GitHub 可直接显示本文中的 Mermaid 源码块。复制 `source/*.mmd` 到支持 Mermaid 的编辑器即可调整图形；本图册并非 StarUML 原生工程。

使用 Mermaid CLI 导出（不需要修改应用依赖）：

```bash
npx --yes --package @mermaid-js/mermaid-cli mmdc \
  -i docs/uml/source/01-services.mmd \
  -o docs/uml/images/01-services.svg \
  -c docs/uml/mermaid-config.json -b '#FFFEFB' -w 1600
```

将输出扩展名改为 `.png` 即可导出位图。CLI 需要可用的 Chromium；已有浏览器时可通过 `-p` 指定 Puppeteer 配置。本次全部图纸通过 CLI 语法解析并导出，再检查文字、连线与裁切。仅新增文档，不修改或重启应用。
