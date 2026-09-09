# 前端交付：功能精简与浅色可视化

> 本文保留 2026-09-05 的阶段记录。最新界面与验收见 [Issue #5 前端交付](issue-5-delivery.md)。
实现日期：2026-09-05。基于个人仓库 main（`fea5eba`），对应第一周前端改版及后续精简意见。完整的 base／当前版本逐项对照见 [版本差异说明](base-differences.md)。

## 当前体验

- 主导航只有首页、算法目录和可视化学习。首页以常用算法和分类开始，目录支持 16 个现有入口的搜索和筛选。
- AI 学习助手、1v1 竞赛、评估测试、历史记录已移除前端组件、入口及相关服务调用。
- 删除播放速度调节，固定 500ms 一步；保留运行、播放／暂停、前后单步、首尾步、执行进度和重置。
- 输入、随机生成和播放控件采用统一线条 SVG 图标，保留文字或可访问名称。随机生成按钮统一用词；输入框和按钮至少 36px 高，手机上进度条独占一行。
- 首页和登录页直接说明用途；浅灰蓝背景、白色卡片、蓝色操作按钮，图表优先使用浅粉、浅蓝、浅绿、浅黄和浅橙。
- 详情包含算法名称、分类、复杂度、输入、阶段说明、图形及对比区域。仍通过面板切换，没有新增独立网址。
- 小于 1024px 使用算法抽屉，支持焦点循环、Escape 关闭和焦点恢复；小于 768px 对比区域上下排列。宽图在自身区域滚动。

## 视觉实现

全局颜色位于 `frontend/src/styles.css`，Tailwind 在 `frontend/tailwind.config.js` 映射同名变量。页面背景为 `#F8FAFD`，主要操作为 `#3E5B84`。浅色图表填充使用 `viz-*`，深色文字、错误提示和键盘焦点使用单独的语义变量，避免浅色背景上的数字失去对比。

SVG 图节点与搜索／背包单元格使用深色文字；柱状图数字放在柱体外。背包、皇后棋盘和递归树补充图例，并统一使用浅色填充；Karatsuba 的伪代码高亮改成浅蓝底深色字。3D 模型和动画状态改成浅色，保留深色场景与白色光源。模型材质不透明度由 0.35／0.4 提高到 0.92，减少浅色在深色背景上的发灰；数字改为深色字配白色描边，画布在介绍栏旁顶部对齐。字体采用系统中文字体，不请求外部字体；尊重系统减少动态效果设置。

首页以两幅静态图解释一次真实的相邻交换：`[16, 28, 20, 10, 32] → [16, 20, 28, 10, 32]`，并说明下一步比较 28 和 10，不把中间状态标成排序完成。演示数量从算法目录计算；推荐卡片用一句话说明可以观察的内容。

## 接口与协作边界

- `ActivePanel` 只有 `home`、`catalog`、`visualizer`。首页与目录通过 `browse`／`learn` 事件切换，目录数据继续来自 `ALGORITHM_GROUPS`。
- 账户名称回退与头像首字符不改变认证协议。离开学习页、切换算法时停止播放；重置或切换后忽略过期请求。
- 前端已移除四项辅助功能，也清理了未被引用的聊天会话服务，后端旧接口和数据库仍保留，已有数据未删除。后端算法接口仍按原有行为记录执行历史。
- 算法实现、后端、数据库结构没有修改；没有新增 Hot 100、代码高亮或执行轨迹协议。

## 本地运行与验证

先启动已有数据库与后端，在项目根目录执行：

```sh
docker compose -f deploy/docker-compose.yml up -d mysql backend
curl http://localhost:8081/api/algorithms/health
cd frontend
npm ci
npm start
```

打开 [本地源码前端](http://127.0.0.1:4200)。已有 8082 Docker 前端需重新构建才会显示修改。开发代理将 `/api`、`/ws` 转发至 8081，生产保持现有 Nginx 代理。

在 `frontend` 目录运行：

```sh
npm run build -- --configuration production
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless
npm run test:e2e
```

Playwright 使用本机 Chrome、单个 worker 和真实本地后端，注册 `ui-week1-*` 测试账户。算法成功响应没有模拟，仅 503 错误场景拦截请求。浏览器验收覆盖登录／退出、目录筛选、导航精简、随机输入、播放／单步／重置、排序对比、其他可视化，以及 390／768／1440px 布局。

## 验证结果

2026-09-05 本地验证完成：

- 生产构建通过；最终初始包约 1.07 MB，估算传输约 246.48 kB。
- ChromeHeadless 单元测试 10／10 通过，覆盖导航、账户回退、播放生命周期与过期请求处理。
- 真实本地后端 Playwright 流程 8／8 通过，包含 390／768／1440px 视口、四项功能入口移除、无速度调节、SVG 随机按钮、目录、排序、查找和对比。
- 最后调整 3D 材质和布局后重新构建，并重跑其余可视化的多尺寸用例：1／1 通过，共检查图、背包、皇后、递归树、3D 的 15 个页面状态，无页面脚本异常。
- 已人工查看生成的首页、手机学习页、图、背包、皇后、递归树和 3D 截图；浅色填充、数字、图例和手机控件布局可辨认。
- `git diff --check` 通过；前端产品源码不再引用 AI 助手、竞赛、评估、历史面板或遗留聊天服务。

## 截图

视口高度为 1000px，长内容在应用内部滚动；3D 截图滚动到模型画布区域。

| 页面 | 手机 390px | 平板 768px | 桌面 1440px |
| --- | --- | --- | --- |
| 首页 | [查看](screenshots/week-one/home-390.png) | [查看](screenshots/week-one/home-768.png) | [查看](screenshots/week-one/home-1440.png) |
| 目录 | [查看](screenshots/week-one/catalog-390.png) | [查看](screenshots/week-one/catalog-768.png) | [查看](screenshots/week-one/catalog-1440.png) |
| 排序学习 | [查看](screenshots/week-one/learning-390.png) | [查看](screenshots/week-one/learning-768.png) | [查看](screenshots/week-one/learning-1440.png) |
| 图算法 | [查看](screenshots/week-one/app-graph-visualizer-390.png) | [查看](screenshots/week-one/app-graph-visualizer-768.png) | [查看](screenshots/week-one/app-graph-visualizer-1440.png) |
| 背包表格 | [查看](screenshots/week-one/app-dp-visualizer-390.png) | [查看](screenshots/week-one/app-dp-visualizer-768.png) | [查看](screenshots/week-one/app-dp-visualizer-1440.png) |
| 皇后棋盘 | [查看](screenshots/week-one/app-n-queens-visualizer-390.png) | [查看](screenshots/week-one/app-n-queens-visualizer-768.png) | [查看](screenshots/week-one/app-n-queens-visualizer-1440.png) |
| Karatsuba 递归树 | [查看](screenshots/week-one/app-divide-conquer-visualizer-390.png) | [查看](screenshots/week-one/app-divide-conquer-visualizer-768.png) | [查看](screenshots/week-one/app-divide-conquer-visualizer-1440.png) |
| 3D 数据结构 | [查看](screenshots/week-one/app-vr-3d-visualizer-390.png) | [查看](screenshots/week-one/app-vr-3d-visualizer-768.png) | [查看](screenshots/week-one/app-vr-3d-visualizer-1440.png) |

补充：[登录](screenshots/week-one/login-1440.png)、[桌面对比](screenshots/week-one/compare-1440.png)、[手机对比](screenshots/week-one/compare-390.png)、[错误提示](screenshots/week-one/error-390.png)。
