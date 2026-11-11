# Agent-ToDo，装进 DeepSeek Harness

> 四个入口。不用离开会话，也不用切窗口

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**安装**：`dsh plugin --profile web add github:329604421/agent-todo-plugin`

**Agent-ToDo** 是给 FDE（Forward Deployed Engineer，前沿部署工程师）做的多项目工作台：把现场记下的一句话收进闪念胶囊，归到项目、拆成脑图，最后连上下文一起交给 Agent。这个插件把它装进 DeepSeek Harness（下称 DSH）——装好后 DSH 里多出四个入口，每一处都能把一句话、一段想法、一份交付物直接变成待办。

设计前提只有一条：**不搬应用，只把能力送到手边**。四个入口里后三个都长在会话里，不用切窗口。

`想法 → 胶囊 → 待办 → 会话 → 做完 → 回到清单`，一圈都不用出 DSH。

> 社区插件，非 DeepSeek 官方出品，与 DeepSeek AI 无隶属关系。

## 安装

需要 DeepSeek Harness 的 Web profile（`dsh.client.platform: web`），以及 Node.js 22.19+ 或 24+。

源码安装（当前可用）：

```bash
dsh plugin --profile web add github:329604421/agent-todo-plugin
```

npm 包发布后，也可以一键安装：

```bash
dsh plugin --profile web add dsh-agent-todo
```

安装完成后重启 `dsh web`。仓库已提交构建产物 `client.js`，源码安装不需要 `prepare` 脚本，也不需要用户放开 `allowBuilds` 构建授权。

分类：工作流与自动化 · 许可证：MIT

## 四个入口

| # | 位置 | 能做什么 |
| --- | --- | --- |
| 1 | 左侧主菜单 **Agent ToDo** | 完整五模块工作台，梳理和回顾都在这 |
| 2 | 全局悬浮 logo | 任意会话里点一下，对话区浮出胶囊列表 |
| 3 | 输入框左侧 **Agent ToDo** | 把未完成待办直接导出成一条任务 |
| 4 | 会话结尾「闪念」 | Agent 刚交付完，顺手记下一步 |

后三个都不离开会话。此外还有全局快捷键 `Alt+Space`（或 `⌘/Ctrl+Shift+Space`）直接打开快速捕获。

![四个入口：左侧主菜单、全局悬浮 logo、输入框按钮、会话结尾闪念](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-four-entries.png)

## 扫码加六位码，十秒登录

第一次打开要登录，没有账号密码，三步走完：

1. 微信扫一扫，打开 Agent-ToDo 小程序
2. 「我的」→「DeepSeek Harness 登录」→「生成验证码」，拿到 6 位数字
3. 粘回插件登录弹窗，点「登录」完成

验证码 10 分钟内有效、用一次就作废、最多 5 次尝试，服务端只存 SHA-256 哈希，换取 365 天有效的设备凭证。它是一张临时通行证，不是长期密码。

不想登录也能完整体验：弹窗底部点「**先看看演示数据**」，未登录状态一切可点，用的是本地演示数据，不写库、不发请求、不调用模型，界面上有明确的「演示数据」提示。

![登录弹窗：微信扫码进小程序取六位码](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-login.png)

## 小程序里有的，插件里都有

概览、项目、待办、脑图、我的，五个模块全在，与微信小程序端共用一套数据。登录后看到的就是手机里那份：这周的活跃度、今天创建与完成了多少、每个项目还剩几件事。

| 模块 | 内容 |
| --- | --- |
| 概览 | 30 周活跃度日历、今日数据、项目待办统计、Agent 概况 |
| 项目 | 页内列表 + 详情三块，归档而不删除，四档紧急度汇总 |
| 待办 | 页内列表 + 筛选浮层 + 详情六区块；正文、图片、脑图、关联胶囊一起导出为 Markdown Handoff |
| 脑图 | 六种格式、拖拽改父子、撤销重做、缩放平移、节点语音改字、导出 Markdown |
| 我的 | 个人资料、Agent 概况、Token API、应用提示 |
| 闪念胶囊 | DSH 全局浮层，语音 / 文字 / 图片记录，单条或多条转待办、转脑图，多选整理 |

插件面板只有几百像素宽，PC 端「列表 + 详情」并排放不下，所以项目、待办、脑图三页都改成「**一栏内嵌列表 + 主区域详情**」。宽度窄了，层级没丢：一个屏幕里同时看得到「有哪些」和「正在看哪一个」。

原生触点还包括助手消息里的「闪念」动作、输入框的待办导出与「增强导出」，以及供 Agent 调用的 `agent_todo` 工具（18 个 action）。样式跟随 DSH 主题令牌，浅色 / 深色都可用，不引入 iframe、不复刻小程序 runtime、不打包第二份 React。

![概览页：活跃度日历、今日数据、项目待办统计](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-overview.png)

![脑图页：列表收进左栏，右侧是完整思维导图](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-mindmap.png)

## 贴着会话的三件事

### 胶囊，浮在所有会话上

在小程序里，胶囊是应用内的一个功能，得先进去才能记；在 DSH 里它是全局的。任意会话点一下悬浮的黄色 logo，胶囊列表就在对话区浮出来，文字 / 语音 / 图片都能记。不用判断「这条值不值得记」，先扔进去，整理是之后的事。

### 输入框里，一键把待办交给 Agent

点输入框左侧的「Agent ToDo」弹出导出框，**默认按当前会话所在的项目筛选**，没有匹配就不硬塞，也能一键看全部。只列未完成，每条两颗按钮：

- **导出**：标题和关联闪念整理成文本，直接落到输入框
- **增强导出**：先调用后端 `/ai/enhance` 让模型把这条待办整理成更完整的任务描述，再写入输入框

左下角还有「导出同时完成」开关。点发送，就是一条任务交给 Agent，同时清单里这条待办变成已完成。

### 会话结尾，记下一条

工具条上的「闪念」长在 Agent 刚交付完附件的位置，点开时输入框已经预填了交付物的文件名。一个会话把方案聊定、产出交接文档，再新开几个会话分头实现——胶囊里带着文件名，新会话就知道下一步干什么、依据在哪。上下文太长会掉信息，上下文断掉更贵。

![任意会话里点悬浮 logo，对话区浮出胶囊列表](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-capsules.png)

![导出待办到输入框：按工作区筛选、导出 / 增强导出](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-export.png)

![交付完一份文件，顺手记一条，文件名自动带入](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/dsh-flash-note.png)

## 数据与凭证

⚠️ **数据去向**：默认后端是作者托管的正式服务 `https://todo.memorymap.cn/api/v1`，登录后所有读写都发生在那里。想接自己的后端，在 profile 的 bundle 配置里给 `agent-todo` 条目设置 `config.apiBase`（见 `cordis.patch.yml` 的 `config` 段），插件 Host 会把 `/agent-todo/api/*` 转发到该地址。请勿把生产凭证提交到任何仓库。

设备凭证只写在本机 `~/.dsh/agent-todo/auth.json`（best effort 0600），由插件 Host 半的代理使用，不写日志，随时可「退出登录」清除。

「增强导出」会把待办标题、正文与关联闪念发给上述后端的 `/ai/enhance`；普通「导出」不调用模型。未登录演示态两者都不发请求。

## 同源的产品界面

下面是 Agent-ToDo 小程序 / PC 端界面，与插件共用同一套组件规范和设计令牌：

![PC 端待办详情](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/pc-todo-detail.png)

![概览页](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/pad-overview.jpg)

![脑图编辑器](https://raw.githubusercontent.com/329604421/agent-todo-plugin/main/docs/screenshots/pad-mindmap-detail.jpg)

## 权限与外部服务

| 类别 | 说明 |
| --- | --- |
| 网络 | 仅访问 `apiBase` 下由插件发起的业务接口（含 `/ai/enhance`、`/asr`、`/files`）；未登录时零请求，所有写操作都在用户输入或点击后发生 |
| 模型调用 | 仅「增强导出」触发，走后端 `/ai/enhance`；语音识别优先用 DSH 自带的 `ctx.remote.speech`，未就绪才降级到后端 `POST /asr` |
| 麦克风 | 语音胶囊用 `getUserMedia` + `MediaRecorder` 采集，重采样为 16 kHz / 单声道 / PCM16 WAV |
| 本机文件 | 只写 `~/.dsh/agent-todo/auth.json` 一个凭证文件 |
| 宿主能力 | 注册 `/agent-todo/*` Web 路由、5 类槽位 occupant、一个 `agent_todo` 工具；卸载时全部注销 |
| 不做的 | 不读工作区文件、不上报使用数据、不写日志、不注入宿主 head |

麦克风权限由 DSH 主进程放行，被拒绝时只给明确文案，不写库。

## 兼容与已知限制

- 目标为 DSH 的 Web profile（`dsh.client.platform: web`），使用宿主提供的 React 18，无第三方运行时依赖；`engines.node` 要求 `>=22.19`
- 未锁定 `engines.dsh` 版本范围：作者本机 DSH 桌面版已加载验证，但还没有跨版本兼容矩阵，写死范围反而可能让启动时被误拒绝
- 真实 DSH GUI 的全量视觉复验（样式标准 §9 共 21 条）尚未完成；语音链路也还未做真机验收
- 判据脚本里的跨端审计会对照主仓库的小程序源码，独立 clone 本仓库后跑 `npm run check` 需要同时具备 `329604421/agent-todo` 的工作区结构；`node --check` 与 smoke 判据不依赖它

## 开发

```bash
npm run build     # 由 src/client/*.js 生成 client.js
npm run check     # 语法 + smoke + 包级 / 桌面 / 样式一致性判据
npm run verify    # 只跑包级判据
```

`client.js` 是构建产物，**请勿手工编辑**；唯一真源是 `src/client/` 下按文件名顺序拼接的 18 个零依赖模块。模块全部手写 `React.createElement`，没有 JSX、没有 `import/export`，`index.js` 导出 `apply(ctx, config)` 并注册 Host 半的代理、静态资源与工具。

## 关联

- npm 包：https://www.npmjs.com/package/dsh-agent-todo
- 主仓库（小程序 + 后端）：https://github.com/329604421/agent-todo
- 官网：https://todo.memorymap.cn
- 社区插件目录：https://dsh-plugin.org

## 许可证

MIT © 2026 杜春生。详见 [LICENSE](LICENSE)。
