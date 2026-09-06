# 本项目与 Algorithm Visualizer 的区别

本次对比对象是此前推荐的国外开源项目 [Algorithm Visualizer](https://github.com/algorithm-visualizer/algorithm-visualizer)，对应网站 algorithm-visualizer.org。它与本仓库的上游 `wenuanhappy/algorithm-viz-platform` 是不同的项目；[仓库 base 差异说明](base-differences.md) 单独记录本项目改版前后的变化。

核查日期：2026-09-05。本项目依据当前工作区代码；对方依据官方仓库和示例，不将线上服务可用性或教学效果作为已验证结论。

## 差别大不大

基础用途重合较多，都帮助学习者观察算法运行。产品工作方式与扩展能力的差异明显：本项目是预设算法的中文教学演示平台，Algorithm Visualizer 是可编辑代码、通过 tracer 记录可视化指令的工作台。

如果比较通用能力，对方在代码编辑、多语言和示例覆盖上明显更完整。如果比较本项目的特色，阶段说明、同输入双算法对比、六类 3D 数据结构可以作为具体的教学设计介绍，但不能据此宣称整体领先或具有重大原创算法创新。此次新增首页、目录和浅色界面主要改善体验。

## 逐项比较

| 维度 | 本项目当前实现 | Algorithm Visualizer | 差异判断 |
| --- | --- | --- | --- |
| 学习操作 | 选择内置算法，填写数组、图、背包等输入，然后播放步骤 | 修改示例代码，使用 tracer 接口记录并展示执行过程 | 工作方式差异明显 |
| 自定义算法 | 没有通用代码编辑器和用户代码执行能力；新增算法通常要改服务端和前端配置，必要时增加专用视图 | 官方项目包含代码编辑器、编译／运行服务及可视化库 | 对方扩展能力明显更强 |
| 语言 | 算法服务主要为 Java；界面 Angular／TypeScript，3D 动画在浏览器执行 | 官方示例仓库声明支持 JavaScript、C++、Java | 对方有多语言代码演示能力 |
| 内容范围 | 15 个预设算法，加 1 个包含六类结构的 3D 入口，共 16 个目录入口 | 本次读取的官方示例仓库有 71 个示例目录，包含动态规划、回溯、分支限界等 | 对方覆盖更广；两边计数口径不同，不能直接当作独立算法数之比 |
| 步骤生成 | Java 服务计算算法状态，返回含数组／节点状态、描述、统计和阶段等信息的 `steps`；前端按步骤渲染。3D 为本地场景和操作动画 | tracer 在代码里记录数组选中、数据更新、日志和延迟等指令，由前端解释为可视化 | 实现架构差异明显 |
| 教学讲解 | 有中文步骤说明、阶段进度、复杂度与操作计数；Karatsuba 有专用伪代码高亮 | 核心 tracer 包括数组、图、图表、日志、Markdown 等，可由示例作者组合 | 本项目的讲解组织更围绕预设课程内容；尚无学习效果对照实验 |
| 双算法对比 | 可使用相同输入运行两个算法，显示并排视图与计数；自动播放同时启动 | 可组合多个 tracer 视图；本次未核实与本项目一致的专用双算法对比入口 | 本项目可展示的功能，但不能声称对方无法实现对比 |
| 3D 数据结构 | Three.js 展示数组、栈、队列、链表、二叉树和 B+ 树，含操作动画 | 本次核查的核心 tracer 与入口中未发现对应六类结构的独立 3D 教学模块 | 本项目较明确的呈现特色；3D 是否更利于理解仍需验证 |
| 页面体验 | 中文首页、可搜索目录、浅色图表、手机算法抽屉 | 以算法代码编辑和可视化工作台为核心 | 可以形成面向初学者的体验差异；配色和布局本身不构成核心技术创新 |

## 对成果的准确表述

可以表述为：

> 本项目面向中文算法课程学习，将预设算法的输入配置、执行步骤、阶段说明和运行统计组织为统一演示流程，并提供双算法对比和六类 3D 数据结构操作演示。相较于以可编辑代码和 tracer 为核心的 Algorithm Visualizer，本项目更集中于固定教学内容的引导式观察。

同时需要说明：

- 这些经典算法及算法动画思想不是本项目首次提出。阶段引导、对比和 3D 在本仓库原始版本中已经存在，不能当作本轮界面改版新实现的成果。
- 本项目尚无通用的“代码—变量—画面”同步执行视图；Karatsuba 的专用伪代码高亮不等于所有算法都支持这一能力。
- 双算法同时播放不等于公平性能评测。单步按钮和进度条当前主要控制主视图，各算法记录步骤的粒度也可能不同，步数与动画用时不能直接代表真实运行效率。
- AI 助手、竞赛、评估测试和历史记录已退出当前前端，不能继续列为当前产品差异点。
- 使用 Angular／Spring Boot 而非 React 是技术选型差异，不能单独作为创新依据；也不能仅凭框架不同判断代码原创性。本次未做代码相似度审计。

## 证据与核查范围

对方官方来源：

- [主仓库说明](https://github.com/algorithm-visualizer/algorithm-visualizer)：React 前端、运行服务、算法内容和 tracer 库分工。
- [代码编辑器实现](https://github.com/algorithm-visualizer/algorithm-visualizer/blob/18de2edf6b629e843ee4bcedfa2208d22b253f0f/src/components/CodeEditor/index.js)。
- [JavaScript tracer 的使用示例](https://github.com/algorithm-visualizer/tracers.js)：需要显式调用 `selectRow`、`println`、`Tracer.delay` 等接口，并非粘贴任意普通代码就会自动生成完整动画。
- [示例仓库快照](https://github.com/algorithm-visualizer/algorithms/tree/fe3adcf890da652e5cda842d7f90b50fa7242e3a)：通过 GitHub tree API 统计分类下的示例目录，回溯 4、分支限界 4、暴力 18、分治 6、动态规划 20、贪心 6、简单递归 5、未分类 8，合计 71。目录可能包含多语言实现，未按实现文件重复计数。
- [核心 tracer 目录](https://github.com/algorithm-visualizer/algorithm-visualizer/tree/18de2edf6b629e843ee4bcedfa2208d22b253f0f/src/core/tracers)。

本项目代码入口：

- `frontend/src/app/data/algorithm-catalog.ts`：15 个算法与一个 3D 入口。
- `frontend/src/app/services/algorithm.service.ts` 和 `backend/src/main/java/com/algorithmviz/service/SortingService.java`：输入请求与步骤生成。
- `frontend/src/app/store/algorithm.store.ts`：教学阶段、播放和双算法状态。
- `frontend/src/app/visualizers/vr-3d/data/structure-info.ts` 及同级 renderers／animators：六类 3D 教学结构。

以上结论是功能与架构比较，不是双方完整功能审计、性能基准测试或教学效果排名。
