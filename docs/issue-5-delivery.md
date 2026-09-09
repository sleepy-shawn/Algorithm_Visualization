# Issue #5：温润、简洁的前端体验

对应 [#5：统一视觉规范与基础布局](https://github.com/sleepy-shawn/Algorithm_Visualization/issues/5)。更新日期：2026-09-09。

## 交付效果

- 学习页分类和对比入口统一放在顶部，移除桌面左侧栏与手机侧滑抽屉。主导航精简为“首页 / 目录 / 学习”；分类使用“排序、搜索、贪心、图、动态规划、回溯、分治、3D”，算法本名保持可辨识。

- 导航与登录页的平台标识使用用户提供的计算机与人工智能学院院徽，保留原图蓝色；完整标识保存为本地资源，小尺寸位置仅展示左侧圆形院徽。

- 首页、目录、登录与学习页采用暖白、米灰、炭色文字和淡橙主操作。共享颜色、间距、圆角与动效定义，不引入 UI 库；标题字体随站点本地托管。
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
| 辅助分区 | `#F3F2EE` |
| 正文 / 辅助文字 | `#302E2A` / `#706B63` |
| 主操作 | `#F6D2AE` |

主操作采用淡橙底色，按钮文字及图标采用暖棕 `#794D2B`，保持可读性。

图表参考用户提供的架构图，采用低饱和粉彩配色：浅蓝、奶黄、淡紫、浅绿、杏橙和珊瑚粉，保留深色数字与图例。2D 图形与 3D 模型同步更新。3D 画布采用炭色底，模型保留柔和状态色。

共享间距以 4/8/12/16/24/32/48px 为主；按钮圆角 8px、卡片圆角 12px。控件反馈 160ms、页面、菜单与图形过渡 220ms，统一缓出曲线。CSS 过渡只指定需要变化的属性，新的目标状态直接接替上一状态。

“减少动态效果”下关闭 CSS 位移、展开与状态过渡；已有 B+ 树位置动画直接到达目标，教学停顿仍保留。算法播放仍为 500ms 一步，没有重写算法动画机制。

## 2026-09-07 配色调整

| 状态 | 填充色 |
| --- | --- |
| 默认 | 浅蓝 `#DFEAF5` |
| 当前访问 | 蓝色 `#C9DFF1` |
| 比较 | 奶黄 `#FFF0BE` |
| 交换 | 淡紫 `#E4D7EC` |
| 完成 | 浅绿 `#E3EFDF` |
| 基准 / 当前递归节点 | 杏橙 `#F8D6AF` |
| 冲突 / 未找到 | 珊瑚粉 `#F6D5CF` |

辅助分区使用更浅的中性色 `#F3F2EE`，分隔线使用 `#DADBD6`。主按钮仍为淡橙，学院标识保持原图蓝色。

本轮生产构建与真实后端浏览器测试 11/11 通过，刷新 33 张截图。按 CSS 色值计算，深色正文与七种图表填充的对比度均超过 9.8:1；已人工查看排序、背包和 3D 的更新截图。

## 2026-09-08 字体与开放版式

参考用户指定的 [Physical Intelligence π₀ 页面](https://www.pi.website/blog/pi0) 的字体层次和编辑式排版，面向中文重新设计：

- 首页、登录大标题和目录、学习页标题采用文楷，首页数字采用系统衬线字体；正文、输入和播放控制保留系统无衬线字体。
- 使用本地托管的 LXGW WenKai TC Regular 标题子集（约 57 KB），附 SIL OFL 1.1 许可及字表。字体加载失败时回退到本机楷体或衬线体，文字始终可见。没有复制参考站的 Signifier 字体。
- 首页示例移除外框，以数字、轻微倾斜的粉彩柱形和简短说明作为视觉中心；按钮可以交换 28 与 20，再次点击还原。清楚标明这仅是一次相邻交换，整个数组尚未排完。
- 标题加淡橙下划线；常用算法用浅蓝、杏橙、浅绿分区。目录使用开放列表，登录以细线分隔，桌面导航收为一行。学院原蓝色院徽保留。
- 示例只在用户操作时变化，220ms 直接追随最新位置，无定时器或动画队列；离开首页后重置。键盘可触发，读屏可获得顺序和结果，减少动态效果下直接呈现。

生产构建、10 项单元测试和 12 项真实后端浏览器测试通过。新增字体加载、交换/还原、快速点击、键盘操作、页面重置与减少动态效果的验证。更新全部三个尺寸截图并增加[交换后截图](screenshots/issue-5/home-exchange-390.png)。人工检查首页、目录、学习页和登录截图，未发现横向溢出、按钮遮挡或字体加载缺失。

## 首页卡通插画

使用内置 image_gen 生成并保存三张透明背景原创插画：快速排序的分组积木、冒泡排序的交换伙伴、二分查找的放大镜。位于首页常用算法卡片，统一粉彩与深色手绘轮廓；不替代真实教学图形、操作 SVG 或学院标识。

图片本地托管、延迟加载并预留固定尺寸，装饰图的空 `alt` 避免重复朗读按钮名称。生成原图与[完整提示词](../frontend/src/assets/illustrations/PROMPTS.md)一并提交。

本轮生产构建与 12 项浏览器测试通过，图片解码成功；复核卡片在 [390px](screenshots/issue-5/home-cartoons-390.png)、[768px](screenshots/issue-5/home-cartoons-768.png)、[1440px](screenshots/issue-5/home-cartoons-1440.png) 下的清晰度、留白和入口可用性。

## 明暗主题与中英文切换（2026-09-09）

登录页右上角、登录后导航栏提供主题按钮及 EN / 中文切换。首次访问按系统明暗偏好显示，手动选择优先；主题和语言分别保存在本机，刷新和退出登录后仍保留。页面加载前应用已保存主题，避免先显示浅色；初始语言默认中文。

深色主题使用炭灰背景、暖白正文和杏橙操作色。二维图形、状态色及图例同步切换，图的边使用语义文字色以保持对比度；3D 画布保留原有深色场景和粉彩模型。中文继续使用文楷标题，英文使用本机衬线标题。

英文覆盖导航、首页、目录、表单、错误反馈、输入、播放、复杂度、阶段、图例、现有后端步骤及 3D 操作提示。算法 ID、筛选值、账户名称与用户输入保持原值；目录同时匹配中文、英文和 ID。切换不会重建算法、重置输入、播放位置、对比状态或详情展开状态。

翻译集中于 `frontend/src/app/i18n`。现有后端动态说明用带参数的模板映射，保留实际数值和节点名称；遇到新增但尚未收录的后端消息时保留原文，避免丢失错误信息。新增算法或提示时应同步补充词条。未增加 UI 或翻译依赖，也未修改后端协议。

验证：14 项单元测试通过；原有与新增的浏览器流程共 19 项通过（18 项完整回归，加 1 项 3D 弹窗/英文对比补充验证）。覆盖系统初始主题、记忆偏好、存储不可写、刷新、键盘操作、减少动态效果、运行状态保留、跨语言搜索、所有现有算法及三种屏幕尺寸。

| 英文深色页面 | 390px | 768px | 1440px |
| --- | --- | --- | --- |
| 首页 | [查看](screenshots/issue-5/preferences/home-dark-en-390.png) | [查看](screenshots/issue-5/preferences/home-dark-en-768.png) | [查看](screenshots/issue-5/preferences/home-dark-en-1440.png) |
| 目录 | [查看](screenshots/issue-5/preferences/catalog-dark-en-390.png) | [查看](screenshots/issue-5/preferences/catalog-dark-en-768.png) | [查看](screenshots/issue-5/preferences/catalog-dark-en-1440.png) |
| 学习 | [查看](screenshots/issue-5/preferences/learning-dark-en-390.png) | [查看](screenshots/issue-5/preferences/learning-dark-en-768.png) | [查看](screenshots/issue-5/preferences/learning-dark-en-1440.png) |
| 登录 | [查看](screenshots/issue-5/preferences/login-dark-en-390.png) | [查看](screenshots/issue-5/preferences/login-dark-en-768.png) | [查看](screenshots/issue-5/preferences/login-dark-en-1440.png) |

另附[中文深色学习页](screenshots/issue-5/preferences/learning-dark-zh-1280.png)与[英文浅色学习页](screenshots/issue-5/preferences/learning-light-en-390.png)。各类图形的英文深色截图位于同一目录。

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

## 初版视觉验收记录

生产构建通过；ChromeHeadless 单元测试 10/10 通过；真实后端浏览器流程 12/12 通过。截图复核发现并修复登录页遗留深色背景和 3D 画布宽度问题；相关登录、详情、对比及多尺寸图形用例在最终调整后再次验证。共保存 37 张本轮截图。截图以 1000px 视口高度拍摄；页面内部可纵向滚动，宽图在图形区域内滚动。

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

### 用户名长度调整（2026-09-09）

按确认取消用户名 3 字符下限：去掉首尾空格后非空即可，继续限制最多 50 字符。同步注册页中英文提示与后端错误文案；密码要求保持不变。

验证：后端 19 项测试通过（新增 10 项覆盖短用户名注册及登录、显示名称回退、空白拒绝与 50 字符边界）；新增浏览器测试通过（模拟认证响应，检查中英文要求、单字符提交、注册后登录及账户显示）；前端生产构建通过。本地后端已重新构建并启动。


## 2026-09-09 顶部导航

顶部分类按钮点击展开菜单，一次只展开一组。选择算法、点击外部、焦点离开或按 Escape 时关闭；Escape 和选择算法后焦点回到触发按钮。对比开关与算法选项收在顶部“对比”菜单中。窄屏分类自动换行，菜单限制在视口内。沿用明暗主题，减少动态效果时关闭菜单入场动画。

本轮前端生产构建与 14 项单元测试通过，23 项浏览器测试通过。包含真实后端播放与对比、全部图形类型，以及新增的 390/768/1440px 菜单展开、互斥、键盘、外部点击、选择与中英文布局验证。

菜单截图（其余既有页面截图已同步刷新）：

| 尺寸 | 中文浅色 | 英文深色 |
| --- | --- | --- |
| 390px | [展开菜单](screenshots/issue-5/top-navigation/menu-light-zh-390.png) | [展开菜单](screenshots/issue-5/top-navigation/menu-dark-en-390.png) |
| 768px | [展开菜单](screenshots/issue-5/top-navigation/menu-light-zh-768.png) | [展开菜单](screenshots/issue-5/top-navigation/menu-dark-en-768.png) |
| 1440px | [展开菜单](screenshots/issue-5/top-navigation/menu-light-zh-1440.png) | [展开菜单](screenshots/issue-5/top-navigation/menu-dark-en-1440.png) |
