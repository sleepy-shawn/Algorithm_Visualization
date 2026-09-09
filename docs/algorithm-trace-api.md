# 算法执行轨迹与对比 API

本接口在现有算法实现上增加统一协议层，供动画、伪代码高亮、错误解释和算法对比共用。

## 支持的算法

- 排序：`quick-sort`、`merge-sort`、`bubble-sort`、`heap-sort`、`insertion-sort`
- 查找：`binary-search`

`GET /api/algorithms/trace/supported` 可获取实际支持列表。

## 统一轨迹

`POST /api/algorithms/trace`

排序请求：

```json
{
  "algorithm": "quick-sort",
  "array": [5, 1, 4, 2, 3]
}
```

二分查找请求：

```json
{
  "algorithm": "binary-search",
  "array": [1, 2, 3, 4, 5],
  "target": 4
}
```

每个 `steps` 元素均包含：

| 字段 | 说明 |
|---|---|
| `stepNumber` | 从 1 开始的步骤编号 |
| `eventType` | 事件类型，如 `compare`、`swap`、`done` |
| `codeLine` | 前端伪代码的高亮行 |
| `stateSnapshot` | 该步完成后的状态快照 |
| `explanation` | 面向学习者的解释文本 |
| `metrics` | 截至当前步的比较、交换和访存计数 |

响应顶层还包含 `result`、总 `metrics` 和最好/平均/最坏/空间复杂度。

数组长度必须为 1 到 200，空数组或超限数组返回 `BOUNDARY_CONDITION`。
`complexity.space` 表示算法本身的最坏辅助空间，包含递归调用栈，不包含输入副本和可视化轨迹快照。
当前快速排序最坏递归深度为 n，因此返回 `O(n)`；堆排序使用递归 `heapify`，因此返回 `O(log n)`。
`executionTimeNanos` 只在顶层总指标中记录有效耗时，步骤内该字段为 0；耗时包括轨迹生成，不包含 JSON 序列化与网络传输。

## 算法对比

`POST /api/algorithms/compare`

```json
{
  "algorithms": ["quick-sort", "merge-sort", "heap-sort"],
  "array": [9, 2, 7, 1, 4]
}
```

响应中：

- `comparable=true` 表示算法任务相同，可对比结果、步骤数、比较/交换次数、耗时与复杂度。
- `limitations` 明确说明耗时是单次教学测量，不是严格基准测试。
- 步骤数含教学事件，操作计数沿用原算法埋点口径，交换次数不能代表全部工作量；单次耗时受 JVM 预热和执行顺序影响。
- 混合排序与查找算法时返回 `comparable=false`，并在 `limitations` 中说明任务语义不同，不能公平比较。

## 错误响应

所有轨迹与对比错误使用同一格式：

```json
{
  "errorType": "PRECONDITION_NOT_MET",
  "code": "ARRAY_NOT_SORTED",
  "message": "二分查找要求输入数组按升序排列",
  "algorithm": "binary-search",
  "codeLine": 1,
  "details": {
    "leftIndex": 0,
    "rightIndex": 1
  },
  "timestamp": "2026-09-03T03:00:00Z"
}
```

| `errorType` | 场景 |
|---|---|
| `INVALID_INPUT` | JSON/字段/算法名非法 |
| `BOUNDARY_CONDITION` | 空数组或输入规模超限 |
| `PRECONDITION_NOT_MET` | 例如二分查找收到未排序数组 |
| `LOGIC_ERROR` | 算法内部执行失败或结果不一致 |

## 最小验证用例

自动化验证：在 `backend` 目录执行 `mvn test`。测试覆盖统一轨迹、同输入对比、不可公平比较的情况，以及 HTTP 层的非法输入、边界条件和前置条件错误。

```bash
curl -X POST http://localhost:8080/api/algorithms/trace \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"bubble-sort","array":[5,1,4,2,3]}'

curl -X POST http://localhost:8080/api/algorithms/compare \
  -H "Content-Type: application/json" \
  -d '{"algorithms":["quick-sort","merge-sort","heap-sort"],"array":[9,2,7,1,4]}'

curl -X POST http://localhost:8080/api/algorithms/trace \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"binary-search","array":[3,1,2],"target":2}'
```
