/* Desktop presentation only. Host tokens take precedence; business rules stay in core. */
;(function (AT, React, h) {
  'use strict'
  /* 本文件只剩样式：桌面呈现把宿主令牌映射到 `--at-*`。
   * 概览的内容装配在 60-views-a.js（`OverviewBody`），这里**不再覆盖**它 ——
   * 2026-11 之前那版"落地页概览"曾在这里顶掉正主，症状是"概览页内容不对"。 */

  /* ------------------------------------------------- 三栏三档底色（v1.12）---
   * 用户口径（2026-11-07 第 1 条）：项目 / 待办 / 脑图三页的「主菜单 · 列表 · 详情」
   * 背景色都一样、边框又淡，三块分不开。
   *
   * 根因在上面那段令牌映射：`--at-surface` / `--at-card` / `--at-chip` 分别映到
   * 宿主 `bg-base` / `bg-layer-1` / `bg-layer-2`，真实 DSH 里这三档**差得极小**，
   * 再叠加 `.at-pane{border:0}` 的桌面拍平 ⇒ 整窗读起来是一整片同色。
   *
   * 落点与 `55-panes.js` 的 `.at-pane-single.is-home` **同一做法**：只对三栏作用域
   * 把这几支钉回 `40-ui` 里**已登记**的色值（浅 #F7F8FA / #EDF0F4 / #FFFFFF，
   * 深 #18191B / #2D2F32 / #202123），用 `literal()` 现取、不在这里另抄一份 HEX。
   *   ── 层次：主菜单/详情页底 ＝ surface ／ 列表页底 ＝ **sunken** ／ 卡面 ＝ card。
   *
   * ★ 为什么列表用 `--at-sunken` 而不是 `--at-chip`：chip(#F1F2F5) 与 surface(#F7F8FA)
   *   只差 Δ6，两块大色块左右相邻时上一版实测**等于同色**（用户第 1 条其实没解决）。
   *   sunken 浅色 #EDF0F4（对 surface 最大单通道 Δ10；2026-11 用户拍板由 #E7E9EF 调浅）、
   *   深色 #2D2F32（对 surface Δ21），两边都能靠"面"分开，不必只靠那条 1px 分隔线。
   *   ⚠️ 调浅后 sunken 与 chip 的差也收窄了 ⇒ 列表列更不许退回 --at-chip。 */
  function literal(name, table) {
    var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
    return m ? m[1] : ''
  }
  var UI_TABLE = (AT.ui && AT.ui.LIGHT && AT.ui.DARK) ? AT.ui : null
  function tok(name, dark) {
    return literal(name, UI_TABLE ? (dark ? UI_TABLE.DARK : UI_TABLE.LIGHT) : '')
  }
  var TRI_TOKENS = ['at-surface', 'at-sunken', 'at-card', 'at-chip', 'at-hairline',
    'at-hairline-strong', 'at-head-bg', 'at-head-line', 'at-sh-card']
  function triVars(dark) {
    return TRI_TOKENS.map(function (n) {
      var v = tok(n, dark)
      return v ? ('--' + n + ':' + v) : ''
    }).join(';')
  }
  /* ★★ 轮次 5：**外壳几何归桌面层，弹窗内展示归 90-drawers.js**。
   * 用户认可「右侧展开弹窗」（460 贴右全高），指出的是弹窗**里面**的控件展示。
   * 桌面层因此写回外壳几何 ＋ 抬 z-index ＋ 把抽屉作用域的 `--at-*` 从宿主暖灰
   * 解绑回 40-ui 已登记值；**不写 head / body / foot 的皮肤数值** —— 那些只有
   * 一个真源，在 `90-drawers.js`（结构级照抄小程序 `.sd` PC 档）。
   * ⚠️ 深色表里没重定义的令牌（如 --at-yellow / --at-on-accent）回落浅色表，
   *    与 themeCss(dark) 的「LIGHT 打底 ＋ DARK 覆盖」同法。 */
  var DRAWER_TOKENS = ['at-primary', 'at-slate', 'at-muted', 'at-text2',
    'at-hairline', 'at-hairline-strong', 'at-hairline-soft', 'at-surface', 'at-chip',
    'at-card', 'at-elevated', 'at-head-bg', 'at-head-line', 'at-solid', 'at-on-solid',
    'at-on-accent', 'at-yellow', 'at-yellow-soft', 'at-field-line', 'at-mask',
    'at-sh-drawer-l2', 'at-danger', 'at-success']
  function drawerVars(dark) {
    return DRAWER_TOKENS.map(function (n) {
      var v = tok(n, dark) || tok(n, false)
      return v ? ('--' + n + ':' + v) : ''
    }).join(';')
  }

  var STYLE = [
    '.at-root,.at-gl{--at-primary:var(--dsw-alias-label-primary,#292929);',
    '--at-text2:var(--dsw-alias-label-secondary,#767670);--at-slate:var(--at-text2);',
    '--at-muted:var(--dsw-alias-label-tertiary,#8b8b85);',
    '--at-surface:var(--dsw-alias-bg-base,#faf9f6);',
    '--at-card:var(--dsw-alias-bg-layer-1,#fff);--at-elevated:var(--dsw-alias-bg-overlay,var(--at-card));',
    '--at-chip:var(--dsw-alias-bg-layer-2,#f1f0ec);--at-head-bg:var(--at-card);',
    '--at-hairline:var(--dsw-alias-border-l1,#e8e7e2);',
    '--at-hairline-soft:var(--dsw-alias-border-l1,#efeee9);',
    '--at-field-line:var(--at-hairline);--at-head-line:var(--at-hairline);',
    '--at-sh-card:none;--at-rail-w:120px;',
    '--at-font:var(--dsw-alias-font-body,"PingFang SC","Microsoft YaHei",sans-serif);',
    '--at-font-num:var(--at-font);--at-blue:var(--dsw-alias-label-primary,#44443f)}',
    '.at-root[data-dark="true"],.at-gl[data-dark="true"]{',
    '--at-primary:var(--dsw-alias-label-primary,#e9e9e4);',
    '--at-text2:var(--dsw-alias-label-secondary,#b1b1a9);',
    '--at-muted:var(--dsw-alias-label-tertiary,#91918b);',
    '--at-surface:var(--dsw-alias-bg-base,#18191b);--at-card:var(--dsw-alias-bg-layer-1,#202123);',
    '--at-chip:var(--dsw-alias-bg-layer-2,#2c2d30);--at-hairline:var(--dsw-alias-border-l1,#36373a);',
    '--at-hairline-soft:var(--at-hairline);--at-blue:var(--dsw-alias-label-primary,#dadad3)}',
    '.at-root{font-size:14px;container-type:inline-size;isolation:isolate}',
    '.at-root button{font-size:13px}.at-root .at-btn{height:32px;border-radius:7px;gap:6px}',
    '.at-root .at-btn-primary{color:var(--at-on-accent)}.at-root .at-btn-dark{color:var(--at-on-solid)}',
    '.at-root .at-btn-danger{color:var(--at-danger)}',
    '.at-root .at-icon-btn{width:32px;padding:0}.at-btn:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    /* ⚠️ 2026-11-10 轮次 11：这里原有 `.at-root .at-input,.at-root .at-select{border-radius:7px;
     * font-size:13px}` ＋ 一条重复的 `:focus` —— 那是桌面档对输入框的**第二套口径**，
     * 把基线（圆角 10 / 14px）在桌面上悄悄改成 7 / 13，于是同一个输入框在小程序对照时
     * 永远差 2px 圆角和 1px 字号。已整段删除：输入框尺寸只在 `40-ui.js` 的 `.at-input`
     * 基线里定义一次，桌面层不再改写它。 */
    '.at-topbar{height:58px;flex-basis:58px;padding:0 22px;background:var(--at-surface);gap:14px}',
    '.at-status{border:0;background:transparent;padding:0 8px;font-size:11px}',
    /* ★★ 2026-11-10（用户第 2、3 条）：主导航**收窄** 164 → 120，并去掉「待办」那项
     * 的未完成计数（只有一项有数字，读起来像"这项特殊"）。
     * 120 是按最长的两项中文标签（概览 / 待办）算的：内距 10×2 ＋ 图标 18 ＋ 间距 10
     * ＋ 两字 26 ≈ 84，留 30 余量给字体回退；比 164 省下 44 全给内容区。
     * 摘掉计数后 `.at-rail-item` 不再需要 `margin-left:auto` 的那颗东西。 */
    '.at-rail{align-items:stretch;padding:18px 10px;background:var(--at-surface);gap:12px}',
    '.at-rail-list{gap:5px;align-items:stretch}',
    '.at-rail-item{display:flex;align-items:center;flex-direction:row;justify-content:flex-start;gap:10px;',
    'width:100%;height:38px;border:0;border-radius:7px;padding:0 10px;background:transparent;',
    'font:inherit;color:var(--at-text2);text-align:left;cursor:pointer}',
    '.at-rail-item.is-active{background:var(--at-chip);color:var(--at-primary);font-weight:600}',
    '.at-rail-item.is-active:before{content:"";position:absolute;left:0;height:16px;',
    'width:3px;border-radius:0 2px 2px 0;background:var(--at-yellow-deep)}',
    '.at-rail-item{position:relative}',
    '.at-panes,.at-panes.is-compact,.at-panes.is-tight{padding:0;gap:0}',
    '.at-pane{border:0;border-radius:0;box-shadow:none}',
    /* 三档底色钉值（见文件头 `triVars` 那段）。两套主题各一条，写在拍平规则**之前**、
     * 特异度更高（0,2,0 / 0,3,0），所以不会被上面的宿主映射盖回去。 */
    '.at-root .at-panes,.at-gl .at-panes{' + triVars(false) + '}',
    '.at-root[data-dark="true"] .at-panes,.at-gl[data-dark="true"] .at-panes{' + triVars(true) + '}',
    '.at-pane-list{flex-basis:280px;width:280px;border-right:1px solid var(--at-hairline-strong);',
    'background:var(--at-sunken)}',
    '.at-panes.is-compact .at-pane-list{flex-basis:240px;width:240px}',
    '.at-pane-detail{background:var(--at-surface)}',
    /* 列表可向左侧收起（v1.12 第 2 条）—— 窗口被压窄时把 300 让给详情。
     * 宽度与 flex-basis 一起归零（只改 flex-basis 时固定 width 会顶住不缩），
     * `opacity` 只负责"走的时候不要像被切断"，真正的收起靠尺寸。
     * ⚠️ 排除 `.is-tight`：那一档本来就是「列表 / 详情」二态互斥（下面 show-detail 那段），
     *    两套折叠机制叠在一起会互相打架。 */
    '.at-panes:not(.is-tight) .at-pane-list{transition:flex-basis .18s ease,width .18s ease,opacity .12s ease}',
    '.at-panes:not(.is-tight).is-list-collapsed .at-pane-list{flex-basis:0;width:0;',
    'border-right:0;opacity:0;pointer-events:none}',
    /* ★ 2026-11-10：两根头行的**高度必须一致**（64），两颗键才真的"平齐"。
     * 原来详情头 min-height 66 / 列表头 60，而详情头里多一行副标题 ⇒ 内容盒 40 vs 45，
     * 各自居中后两颗 32 高的键差 2~3px —— 用户说的「与添加按钮保持平齐」就差这一点。
     * 统一 64 之后：列表头 21+24 被 min-height 撑到 64、详情头 40+24＝64，
     * 两者内容盒同心 ⇒ `+` 与收起键的中线完全重合。 */
    '.at-pane-head{height:auto;min-height:64px;flex:0 0 auto;padding:12px 22px;background:transparent;gap:8px}',
    '.at-pane-list .at-pane-head{min-height:64px;padding:12px 18px;border:0}',
    '.at-pane-title{font-size:15px;letter-spacing:-.2px}.at-pane-sub{font-size:11px;margin-top:4px}',
    '.at-pane-count{font-size:11px;padding:2px 6px;background:var(--at-chip);border-radius:4px;color:var(--at-text2)}',
    '.at-pane-tools{padding:0 16px 12px;background:transparent;border:0}',
    '.at-pane-tools .at-input{height:32px;background:var(--at-card);font-size:12px}',
    '.at-pane-tools .at-btn{font-size:11px;padding:0 8px}',
    '.at-list-tabs{padding:0 16px 12px}.at-list-tabs .at-seg{width:100%;padding:3px;border-radius:6px;gap:2px}',
    '.at-list-tabs .at-seg-item{flex:1;padding:0 6px;font-size:11px;border-radius:4px;height:26px}',
    '.at-list-tabs .at-seg-item.is-on{background:var(--at-yellow-soft);color:var(--at-primary);',
    'font-weight:600;box-shadow:inset 0 0 0 1px var(--at-yellow)}',
    '.at-pane-scroll{padding:8px 10px 12px}',
    /* 列表行改**白卡浮在灰底上**（v1.12）：列表页底已是 `--at-chip`，
     * 行若继续吃 transparent 就与底色同层，只剩一条淡线可辨。
     * 选中态回到品牌黄软底（与小程序 `.tf-chip.on` / 卡片选中同一套读法）。 */
    '.at-pane-row{padding:12px;margin-bottom:8px;border:1px solid var(--at-hairline);',
    'border-radius:12px;background:var(--at-card);gap:9px;box-shadow:var(--at-sh-card)}',
    '.at-pane-row:hover{background:var(--at-chip);border-color:var(--at-hairline-strong)}',
    '.at-pane-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
    'box-shadow:var(--at-sh-card)}',
    '.at-pane-row.is-on:hover{background:var(--at-yellow-soft);border-color:var(--at-yellow);opacity:.82}',
    '.at-pane-row-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px}',
    '.at-pane-row-bar{width:5px;flex-basis:5px;min-height:5px;height:5px;align-self:flex-start;margin-top:7px;border-radius:50%}',
    '.at-pane-row-meta{font-size:10px;line-height:1.6;margin-top:7px}',
    '.at-pane-foot{padding:12px 16px;background:transparent}.at-pane-foot .at-muted{font-size:10px}',
    '.at-pane-detail>.at-pane-head{flex-wrap:wrap;align-items:center}',
    '.at-pane-detail>.at-pane-head .at-toolbar{overflow:visible;flex-wrap:wrap}',
    '.at-pane-body{padding:24px 28px}.at-detail-col{max-width:880px;margin:0 auto;gap:14px}',
    /* 详情里的每一块 ＝ 小程序 `.sec` ＋ `.card`：白卡 · 1px 描边 · 14 圆角 · 微阴影。
     * 2026-11 之前这里是「无卡分节 ＋ 底边 1px 线」—— 在宿主同色底上那一根线是唯一分界，
     * 正是用户 2026-11-07 第 1 条说的"背景色一致、边框很淡、三块分不开"。
     * ⚠️ 只挂在 `.at-pane-detail` 下：概览 / 我的 走各自的 `.at-ov-*` / `.at-mi-*`，不受影响。 */
    '.at-pane-detail .at-block{padding:16px 18px;border:1px solid var(--at-hairline);',
    'border-radius:14px;background:var(--at-card);box-shadow:var(--at-sh-card)}',
    '.at-pane-detail .at-block-title{font-size:15px;font-weight:600;color:var(--at-primary);margin-bottom:12px}',
    '.at-kv{font-size:12px;padding:7px 0;align-items:flex-start}.at-kv>span:last-child{min-width:0;overflow-wrap:anywhere;text-align:right}',
    '.at-code{border:0;border-radius:8px;padding:16px;font-size:12px;background:var(--at-surface)}',
    '.at-task-copy{white-space:pre-wrap;font-size:18px;line-height:1.75;letter-spacing:-.25px;overflow-wrap:anywhere;color:var(--at-primary)}',
    '.at-context-line{flex-wrap:wrap;font-size:12px}.at-context-line .at-link{font-size:12px}',
    '.at-handoff{border:1px solid var(--at-hairline);background:var(--at-surface);padding:18px;border-radius:10px}',
    '.at-handoff-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-bottom:8px}',
    '.at-handoff p{font-size:12px;color:var(--at-text2);margin:0 0 16px;line-height:1.65}',
    '.at-handoff .at-op-row{gap:8px}.at-handoff summary{font-size:11px;color:var(--at-text2);cursor:pointer;margin-top:16px}',
    '.at-handoff .at-code{max-height:250px;padding:14px 0;margin-top:10px}',
    /* ★★ 收起 / 展开键（2026-11-10 用户第 3 条 + 当日订正）：
     * 原样是「〈 收起」一颗带文字的描边胶囊（28 高、贴左边框、左侧不留圆角）。
     * 用户口径：① 去掉「收起 / 展开」文字只留图标；② 颜色改**品牌黄**提升醒目度；
     * ③ 与列表里的添加键（`+`）**平齐**；④ **订正：仍要左侧 0 圆角、直接贴左边框**
     *    （上一版把它做成悬在头行里的孤立方键，脱离了列边缘，用户当场纠回）。
     * 落法：
     *  · 32×32 品牌黄块，**贴着详情列左边界**：`margin-left:-22px` 吃掉头行左内距，
     *    左缘对齐列边 ⇒ 只给右侧两角留 8 圆角（`0 8px 8px 0`），左侧平切到底。
     *  · 「平齐」仍是**水平中线**：两根头行统一 `min-height:64px`（见 `.at-pane-head`），
     *    32 高的键与列表头那颗 32 的 `+` 同处一条中线；不是同列，也不必同列。
     *  · 底色 `--at-yellow` ＋ `--at-on-accent` 墨色图标，与导轨选中态、胶囊品牌块同一套
     *    「黄＝主动作」读法；hover 只走 FB-01 的 `.82`，不换底色。
     *  · 方向即语义：收起 `chevron-left`、展开 `chevron-right`；tight 档那颗是"返回列表"，
     *    同样左箭头，文字由 `title` / `aria-label` 承担（不给视觉加字）。
     *  ⚠️ 描边 `1px solid transparent` 是留给 focus-visible 的占位，避免聚焦时尺寸跳动。
     *  ⚠️ tight 档头行内距是 16，那颗的负边距另行覆盖成 -16（别在这里写第二套宽度）。 */
    '.at-detail-back{display:inline-flex;align-items:center;justify-content:center;',
    'flex:0 0 auto;width:32px;height:32px;padding:0;margin-left:-22px;',
    'border:1px solid transparent;border-radius:0 8px 8px 0;',
    'background:var(--at-yellow);color:var(--at-on-accent);',
    'cursor:pointer;font-family:inherit}',
    '.at-detail-back:hover{opacity:.82}',
    '.at-detail-back:active{transform:translateY(1px);opacity:.78}',
    '.at-pane-single>.at-pane-head{display:none}.at-pane-single{background:var(--at-card)}',
    '.at-pane-single>.at-pane-body{padding:34px clamp(20px,4cqw,56px)}',
    /* 概览已改为严格对齐小程序 `mod-overview`（PC 档，见 60-views-a.js 的 `.at-ov-*`）。
     * 原来那一版"落地页"（`.at-home` / `.at-eyebrow` / `.at-flow-*` / `.at-home-metrics`）
     * 连同它对本页热力格的缩格覆盖（`.at-heat-cell{12px}`）**整体撤掉** —— 无调用点，
     * 留着会让下一个人以为概览还有第二套骨架。 */
    /* ★★ 轮次 5：恢复用户认可的「右侧展开弹窗」外壳 —— 460 贴右、全高、无圆角、
     * 左侧 1px 收边。轮次 4 把它当成 .sd 的一部分撤掉，属改过头。
     * 弹窗**内部**控件仍按 90-drawers.js 的 .sd PC 档逐值照抄，两者互不侵入。
     * 令牌解绑继续用 drawerVars() 现取 40-ui 登记值，不新增 HEX。
     * ★★ 令牌规则是**运行时拼**的，判据取 `AT.desktop.STYLE` 求值产物再比对。 */
    '.at-form-mask{z-index:54;background:var(--at-mask)}',
    '.at-drawer,.at-drawer.o1,.at-drawer.o2{left:auto;right:0;top:0;bottom:0;width:min(460px,100%);',
    'border-radius:0;border-width:0 0 0 1px;box-shadow:-12px 0 40px #00000014;z-index:55}',
    '.at-root .at-drawer{' + drawerVars(false) + '}',
    '.at-root[data-dark="true"] .at-drawer{' + drawerVars(true) + '}',

    '.at-mm-bar{padding:8px 16px;background:var(--at-card);gap:4px}',
    '.at-mm-bar .at-btn{border-color:transparent;background:transparent;font-size:11px;padding:0 7px}',
    '.at-mm-bar .at-btn:hover{background:var(--at-chip)}.at-mm-bar .at-btn:disabled{opacity:.4}',
    '.at-mm-info{padding:8px 16px}.at-mm-info .at-input{width:140px;flex-basis:140px;font-size:11px}',
    '.at-mm-viewport{min-height:80px}',
    '.at-root[data-layout="compact"],.at-root[data-layout="tight"]{--at-rail-w:58px}',
    '.at-root:not([data-layout="wide"]) .at-rail{padding:16px 8px}',
    '.at-root:not([data-layout="wide"]) .at-rail-item{flex-direction:column;height:50px;padding:5px 0;gap:4px;font-size:10px}',
    '.at-root[data-layout="tight"] .at-brand-lockup{height:26px;margin-left:-2px}',
    '.at-root[data-layout="tight"] .at-topbar{padding:0 12px;gap:8px}',
    /* 窄档只留 logo、不title：模块名在导轨/列表头都已经有一份，顶栏再写一次会把
     * 状态胶囊与刷新键挤掉（<660 那一档实测）。 */
    '.at-root[data-layout="tight"] .at-topbar-title{display:none}',
    '.at-root:not([data-layout="wide"]) .at-pane-body{padding:22px}',
    '.at-root[data-layout="tight"] .at-topbar .at-btn{padding:0 9px;font-size:11px}',
    '.at-panes.is-tight .at-pane-list{width:auto;flex:1;border:0}.at-panes.is-tight .at-pane-detail{display:none}',
    '.at-panes.is-tight.show-detail .at-pane-list{display:none}.at-panes.is-tight.show-detail .at-pane-detail{display:flex}',
    '.at-panes.is-tight.show-detail .at-detail-back{display:flex;margin-left:-16px}',
    '.at-panes.is-tight .at-pane-head{padding:12px 16px;min-height:60px;flex-basis:auto}',
    '.at-panes.is-tight .at-pane-body{padding:20px 16px}.at-panes.is-tight .at-grid-3{grid-template-columns:1fr}',
    '.at-root[data-layout="tight"] .at-mm-info .at-muted:first-of-type{display:none}',
    '.at-modal-layer{padding:24px 16px;align-items:center}',
    '.at-modal{display:flex;flex-direction:column;max-height:100%}.at-modal-body{max-height:none;min-height:0;overflow:auto}',
    '.at-gl-root{padding:24px 16px;align-items:center}',
    '.at-gl-panel{max-height:calc(100vh - 48px);overflow:auto}.at-gl-input{max-height:40vh}',
    '.at-gl-btn:disabled{opacity:.4;cursor:not-allowed}',
    '.at-root .at-pane-body.is-canvas{padding:0}',
    '.at-root .at-mm-bar{flex-wrap:nowrap;overflow-x:auto;min-height:42px;max-height:48px}',
    '.at-root .at-mm-bar .at-btn,.at-root .at-mm-bar .at-select,.at-root .at-mm-bar-label{flex-shrink:0}',
    '.at-mm-info{min-height:42px;overflow:hidden;flex-shrink:0}',
    '@media (max-height:560px){.at-root .at-mm-foot{display:none}}',
    /* 极窄档（<360）：让位给**登录键**，不是让位给它旁边的刷新键。
     * ★ 轮次 12：原来这一档把 `.at-status` 压成 `font-size:0`（只剩一个点）——
     * 那时它只是枚状态徽章，藏字无妨；现在它是「请登录」的**唯一入口**，
     * 藏了就等于未登录用户找不到登录门。改藏模块名（导轨上的激活项已经说明了在哪）。 */
    '@container (max-width:360px){.at-root .at-topbar .at-topbar-title{display:none}',
    '.at-root .at-topbar .at-icon-btn{display:none}}',
    '@media (prefers-reduced-motion:no-preference){.at-drawer{animation:at-enter .18s ease-out}',
    '@keyframes at-enter{from{opacity:.4;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}}'
  ].join('')

  AT.desktop = { STYLE: STYLE }
})(AT, React, h)
