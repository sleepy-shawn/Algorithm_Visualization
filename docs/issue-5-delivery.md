# Issue #5：温润、简洁的前端体验

对应 [#5：统一视觉规范与基础布局](https://github.com/sleepy-shawn/Algorithm_Visualization/issues/5)。本轮完成日期：2026-09-06。

## 交付效果

- 首页、目录、登录与学习页采用暖白、米灰、炭色文字和淡橙主操作。共享颜色、间距、圆角与动效定义，不引入 UI 库或外部字体。
- 首页保留标题、演示数量、入口及相邻交换示例；目录删除操作介绍；导航和登录页删除重复副标题。
- 分类、箭头、播放和结果提示使用统一 SVG。仅图标按钮有可访问名称，播放按钮提示支持鼠标和键盘。
- 学习页常显输入、播放控制、阶段、图形与当前步骤；复杂度和当前步骤统计集中到默认收起的“算法详情”。对比模式各自显示复杂度与统计，不再重复显示进度或理论上限条。
- 切换页面、主算法、对比算法或 3D 结构后收起详情。隐藏详情从辅助技术与键盘操作中排除。
- 3D 说明、结构特点、操作复杂度及应用移到详情；画布、操作按钮和重置视角仍可直接使用。结构选择与随机数据统一从输入区操作。

## 规范

| 用途 | 色值 |
| --- | --- |
| 页面 | `#F7F5F0` |
| 内容区 | `#FFFEFB` |
| 辅助分区 | `#EEEAE2` |
| 正文 / 辅助文字 | `#302E2A` / `#706B63` |
| 主操作 | `#F6D2AE` |

主操作采用淡橙底色，按钮文字及图标采用暖棕 `#794D2B`，保持可读性。

图表沿用浅蓝、浅粉、浅绿、浅黄和浅橙，保留深色数字与图例。3D 画布采用炭色底，模型保留柔和状态色。

共享间距以 4/8/12/16/24/32/48px 为主；按钮圆角 8px、卡片圆角 12px。控件反馈 160ms、页面与图形过渡 220ms、抽屉入场 240ms，统一缓出曲线。CSS 过渡只指定需要变化的属性，新的目标状态直接接替上一状态。

“减少动态效果”下关闭 CSS 位移、展开与状态过渡；已有 B+ 树位置动画直接到达目标，教学停顿仍保留。算法播放仍为 500ms 一步，没有重写算法动画机制。

## 本地验证

后端与数据库使用现有 Docker 配置，在仓库根目录启动：

```sh
docker compose -f deploy/docker-compose.yml up -d mysql backend
```

然后在 `frontend` 目录运行：

```sh
npm ci
npm start -- --host 127.0.0.1
npm run build -- --configuration production
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm test -- --watch=false --browsers=ChromeHeadless
npm run test:e2e
```

预览：[本地前端](http://127.0.0.1:4200)。开发代理连接 8081 后端。浏览器测试使用本机 Chrome 和真实后端，会注册 `ui-week1-*` 测试账户；仅错误响应场景模拟 503。

## 验收记录

生产构建通过；ChromeHeadless 单元测试 10/10 通过；真实后端浏览器流程 11/11 通过。截图复核发现并修复登录页遗留深色背景和 3D 画布宽度问题；相关登录、详情、对比及多尺寸图形用例在最终调整后再次验证。共保存 33 张本轮截图。截图以 1000px 视口高度拍摄；页面内部可纵向滚动，宽图在图形区域内滚动。

| 页面 | 390px | 768px | 1440px |
| --- | --- | --- | --- |
| 首页 | [查看](screenshots/issue-5/home-390.png) | [查看](screenshots/issue-5/home-768.png) | [查看](screenshots/issue-5/home-1440.png) |
| 目录 | [查看](screenshots/issue-5/catalog-390.png) | [查看](screenshots/issue-5/catalog-768.png) | [查看](screenshots/issue-5/catalog-1440.png) |
| 学习页 | [查看](screenshots/issue-5/learning-390.png) | [查看](screenshots/issue-5/learning-768.png) | [查看](screenshots/issue-5/learning-1440.png) |
| 登录 | [查看](screenshots/issue-5/login-390.png) | [查看](screenshots/issue-5/login-768.png) | [查看](screenshots/issue-5/login-1440.png) |

补充：[算法详情](screenshots/issue-5/details-1440.png)、[对比](screenshots/issue-5/compare-1440.png)、[对比详情](screenshots/issue-5/compare-details-1440.png)、[手机对比](screenshots/issue-5/compare-390.png)、[图标提示](screenshots/issue-5/tooltip-390.png)、[错误提示](screenshots/issue-5/error-390.png)。其他可视化的三个尺寸截图同目录保存。

## 与已有工作的关系

当前 main 仍是 `fea5eba`。本次交付基于此前尚未提交的前端改版：包括新增首页和目录、移除四项辅助功能的前端入口、固定播放节奏、播放生命周期修复和本地代理配置。上述工作继续保留；9 月 5 日说明与截图作为历史记录保存，本文件描述最终体验。

后端、数据库、认证协议和算法执行接口没有修改。PR 关联 #5，保留 issue 开放状态供审查，不自动合并。
