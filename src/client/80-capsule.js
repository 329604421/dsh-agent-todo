/* 80-capsule.js — 闪念胶囊 · DSH 全局悬浮层
 *
 * 视觉 / 几何全部走 08-style.js 的插件前端样式标准：
 *   AT.style.base(dark) 统一注入小程序令牌 → DSH 宿主令牌 → 补充令牌 → 通用基线；
 *   AT.style.S.CAPSULE 是尺寸真源，AT.style.geom(b) 是窗口适配真源；
 *   本文件只写「胶囊这一块长什么样」，数值不再另抄一份。
 *
 * 结构（功能边界不变，见交接文档 §8.2）：
 *   · 悬浮品牌键：任何页面 / 会话可见，内容展示区内可拖动、位置持久化。
 *   · 打开：内容区遮罩 + 320 胶囊抽屉（品牌黄标题带、卡片列表、已删除入口）。
 *   · 选中卡片：抽屉右侧竖排动作组（删除 / 编辑 / 导出 / 转待办 / 转脑图）。
 *   · 写一条 / 编辑 / 转待办 / 转脑图：右侧 260 副抽屉族（PC .ep / .cp-sheet.sub 同源）。
 *   · 录音：悬浮键品牌黄呼吸 + 16px 等宽倒数，抽屉内状态条 + 波纹。
 *   · 窄内容区：抽屉收窄、动作组降级为内侧图标列，不越过内容区。
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, S = AT.shell,
    V = AT.views, Text = AT.text
  var St = AT.style, K = St.S.CAPSULE

  /* 全部取自样式标准，避免「同一尺寸两处写法」。 */
  var FAB_SIZE = K.fab
  var FAB_MARGIN = K.fabMargin
  var WRITE_SIZE = K.write
  var OPS_KEY_H = K.opsKeyH
  var OPS_GAP = K.opsGap
  var LONG_PRESS_MS = K.longPressMs
  var POS_KEY = 'agent-todo-capsule-fab-v5'

  /* ★ v1.6 · 设计图「列表卡：白底」：胶囊层与 DSH 宿主的暖灰底令牌解绑。
   * base(dark) 里的 AT.desktop.STYLE 把 --at-elevated 映成
   * var(--dsw-alias-bg-overlay, var(--at-card))、--at-card 映成
   * var(--dsw-alias-bg-layer-1, #fff)、--at-head-bg = --at-card；宿主这几支是
   * 暖灰系（回退 #faf9f6 / #f1f0ec），于是列表卡片、主抽屉、以及转待办 /
   * 转脑图 / 编辑三块副抽屉的面板与头 / 底栏、字段行都落在灰底上。
   * 取色依据（2026-11-07 用户确认）：规范E「列表卡：白底」＋样式标准 §2.1
   * 已登记的 --at-card。色值从 40-ui.js 的 LIGHT / DARK 表**现取**，不新增、
   * 不手抄；只在 .at-gl.at-cx-root 作用域覆写，工作台其它模块不受影响。 */
  function literal(name, table) {
    var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
    return m ? m[1] : ''
  }
  var CARD_LIGHT = literal('at-card', U.LIGHT)
  var CARD_DARK = literal('at-card', U.DARK)

  var STYLE = [
    /* ---- root / tokens（主题 / 字体 / 动效基线由 AT.style.base(dark) 注入） ---- */
    /* 特异度 0,2,0 / 0,3,0，压过 desktop.STYLE 的 .at-gl 与 .at-gl[data-dark]；
     * 三支一起覆写，卡片 / 主抽屉 / 三块副抽屉的面板 · 头 · 底栏 · 字段行同源回白。 */
    '.at-gl.at-cx-root{--at-card:' + CARD_LIGHT + ';--at-elevated:' + CARD_LIGHT +
      ';--at-head-bg:' + CARD_LIGHT + '}',
    '.at-gl.at-cx-root[data-dark="true"]{--at-card:' + CARD_DARK + ';--at-elevated:' + CARD_DARK +
      ';--at-head-bg:' + CARD_DARK + '}',
    '.at-cx-root{display:contents;font-family:var(--at-font);color:var(--at-primary)}',
    '.at-cx-root *{box-sizing:border-box}',
    /* 控件复位统一由 08-style.js BASE_CSS 的零特异度 :where() 规则提供，
     * 本层不再写 .at-cx-root button{color:inherit}（会压掉单类控件的着色）。 */
    '.at-cx-root :focus-visible{outline:2px solid var(--at-blue);outline-offset:2px}',
    '.at-cx-root ::-webkit-scrollbar{width:8px;height:8px}',
    '.at-cx-root ::-webkit-scrollbar-thumb{background:var(--at-hairline-strong);border-radius:4px}',

    /* ---- floating brand / record button：**PC / 横屏档 40×40** ----
     * ★★★ v1.5：v1.4 抄了 `app.wxss` 的 `.fab`（56/18），但那一颗的渲染条件是
     * `!phone && !landscape` ⇒ **平板竖屏**；PC / 横屏走 `nav-rail.wxss` 的
     * `.rail-brand`：40 方 / 12 圆角 / 品牌图满幅 40 / 麦克风 22 / 倒数 18。
     * 「写」同尺寸同圆角（`.rail-write`：40/12、`--chip` 底无描边、图标 22）。
     * 数值一律从 S.CAPSULE 拼，不在这里抄第二份。 */
    '.at-cx-fab{position:fixed;z-index:150;width:' + K.fab + 'px;height:' + K.fab + 'px;padding:0;',
    'border:0;border-radius:' + K.fabRadius + 'px;background:var(--at-yellow);color:var(--at-on-accent);',
    'display:flex;align-items:center;justify-content:center;cursor:grab;overflow:hidden;',
    'touch-action:none;user-select:none;-webkit-user-drag:none;box-shadow:var(--atx-sh-fab);',
    /* 打开 / 关闭时浮键在「可拖动坐标」与「右侧停靠带」之间换位：位移与抽屉入场
     * 同时长（.18s）⇒ 看起来是"跟着抽屉一起归位"，不是瞬移。拖动时由 .is-dragging
     * 把过渡清零，跟手不打折。 */
    'transition:left var(--atx-dur-enter) ease,top var(--atx-dur-enter) ease,',
    'transform var(--atx-dur-fast) ease,box-shadow var(--atx-dur-fast) ease;pointer-events:auto}',
    '.at-cx-fab:hover{box-shadow:var(--atx-sh-fab-hover);opacity:.82}',
    '.at-cx-fab:active{transform:translateY(1px);opacity:.78}',
    '.at-cx-fab.is-dragging{cursor:grabbing;transition:none}',
    /* 打开态浮键停在抽屉右侧的竖排带里（对齐 PC / 横屏 .rail-brand + .rail-write）：不可拖 */
    '.at-cx-fab.is-docked{cursor:pointer}',
    /* 停靠带底衬：只有停靠带**退进抽屉内部**（内容区窄到放不下 40 方键）时才垫，
     * 盖住两颗键那一块，免得方键直接坐在卡片正文上把字切断。
     * 只做视觉 —— pointer-events:none，点在它身上等于点在下面的卡片上。 */
    '.at-cx-dockplate{position:fixed;z-index:148;border-radius:' + K.fabRadius + 'px;',
    'background:var(--at-elevated);border:1px solid var(--at-hairline);',
    'box-shadow:var(--atx-sh-fab);pointer-events:none}',
    '.at-cx-fab.is-rec{cursor:pointer;animation:atxBreath var(--atx-breath) ease-out infinite}',
    /* ★ v1.8 · 识别中：不再呼吸（呼吸＝「还在录」），指针走 progress，按下去也不起录。 */
    '.at-cx-fab.is-asr{cursor:progress;animation:none}',
    '.at-cx-fab-img{width:' + K.fabIcon + 'px;height:' + K.fabIcon + 'px;',
    'border-radius:' + K.fabRadius + 'px;display:block;pointer-events:none;',
    '-webkit-user-drag:none;user-select:none}',
    /* PC `.rail-brand-clock`：40 方里两字秒数 18/600 + tabular-nums，逐秒不抖 */
    '.at-cx-fab-clock{font-size:' + K.fabClock + 'px;font-weight:600;letter-spacing:0;',
    'font-family:var(--atx-font-num);font-variant-numeric:tabular-nums;',
    'line-height:1;pointer-events:none;color:var(--at-on-accent)}',
    '.at-cx-fab-clock.is-dots{letter-spacing:1px;opacity:.72}',
    /* `.rail-write`：`--chip` 底、无描边（40 的面积上留描边会把图标挤到 36 以内） */
    '.at-cx-write{position:fixed;z-index:149;width:' + K.write + 'px;height:' + K.write + 'px;',
    'padding:0;border:0;border-radius:' + K.fabRadius + 'px;',
    'background:var(--at-chip);color:var(--at-primary);',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;',
    'box-shadow:var(--atx-sh-fab);transition:opacity var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
    '.at-cx-write:hover{opacity:.82}',
    '.at-cx-write:active{transform:translateY(1px);opacity:.78}',

    /* ---- mask + main drawer（PC .cp / .cp-head 同规格） ---- */
    '.at-cx-mask{position:fixed;z-index:120;background:var(--at-mask);pointer-events:auto;',
    'animation:atxFade var(--atx-dur-fade) ease-out}',
    '.at-cx-drawer{position:fixed;z-index:130;display:flex;flex-direction:column;min-width:0;',
    'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-elevated);',
    'box-shadow:var(--at-sh-drawer);overflow:hidden;pointer-events:auto;',
    'animation:atxIn var(--atx-dur-enter) ease-out;',
    'transition:transform ' + K.turnDur + ' cubic-bezier(.2,.8,.3,1)}',
    /* ★★ v1.5 · **第二档侧转**（PC `capsule.wxss` 的 `.cp.turned`，275 行）：
     * 转待办 / 转脑图一开，第一档侧转 25° 且不可点 —— 两张 320 宽的弹窗同屏，
     * 不转就读成「一张盖住了另一张」。值逐字照抄：perspective(1100px)
     * rotateY(25deg) / transform-origin:left center / pointer-events:none。
     * 差异只有两处：① 加 .22s 过渡（小程序是瞬时，DSH 桌面上要看得见"转过去"）；
     * ② z 取 S.Z.drawerTurned(129) —— 插件层级基线整体高，只保证低于副抽屉 141。 */
    '.at-cx-drawer.is-turned{transform-origin:left center;',
    'transform:perspective(' + K.turnPerspective + 'px) rotateY(' + K.turnDeg + 'deg);',
    'pointer-events:none;z-index:' + St.S.Z.drawerTurned + '}',
    /* 品牌黄标题带：恒亮面 ⇒ 字恒墨、图标 tone=ink、底边 --at-yellow-press 收边 */
    '.at-cx-head{flex:0 0 52px;height:52px;display:flex;align-items:center;justify-content:space-between;',
    'gap:8px;padding:0 14px;background:var(--at-yellow);border-bottom:1px solid var(--at-yellow-press)}',
    '.at-cx-title{flex:1 1 auto;min-width:0;font-size:16px;font-weight:500;letter-spacing:-.2px;',
    'color:var(--at-on-accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-cx-head-r{flex:0 0 auto;display:flex;align-items:center;gap:8px}',
    '.at-cx-hbtn{height:28px;padding:0 12px;border:1px solid var(--at-on-accent);border-radius:999px;',
    'background:transparent;color:var(--at-on-accent);font-size:13px;font-weight:500;',
    'display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;white-space:nowrap;',
    'transition:background var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
    '.at-cx-hbtn:hover{opacity:.82}',
    '.at-cx-hbtn:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
    '.at-cx-hbtn.is-on{background:var(--at-solid);border-color:var(--at-solid);color:var(--at-on-solid)}',
    '.at-cx-hbtn.is-on:hover{opacity:.82}',
    '.at-cx-hclose{width:28px;height:28px;padding:0;border:1px solid var(--at-on-accent);border-radius:50%;',
    'background:transparent;color:var(--at-on-accent);display:flex;align-items:center;justify-content:center;',
    'cursor:pointer;transition:background var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
    '.at-cx-hclose:hover{opacity:.82}',
    '.at-cx-hclose:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
    '.at-cx-hclose.is-rec{background:var(--at-solid);border-color:var(--at-solid);color:var(--at-on-solid)}',

    /* ---- list（PC .cp-list / .cp-hollow / .cp-bub / .cp-empty 同规格） ---- */
    '.at-cx-list{flex:1 1 auto;min-height:0;overflow:auto;padding:12px 12px 6px}',
    '.at-cx-hollow{display:flex;align-items:center;gap:7px;width:100%;height:42px;margin:0 0 10px;',
    'padding:0 12px;border:1px dashed var(--at-hairline-strong);border-radius:12px;background:transparent;',
    'color:var(--at-slate);font-size:13px;text-align:left;cursor:pointer;',
    'transition:background var(--atx-dur-fast) ease,color var(--atx-dur-fast) ease}',
    '.at-cx-hollow:hover{background:var(--at-chip);color:var(--at-primary)}',
    '.at-cx-hollow-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-cx-hollow-n{flex:0 0 auto;font-size:11px;color:var(--at-muted)}',
    '.at-cx-card{position:relative;display:block;width:100%;margin:0 0 8px;padding:11px 13px 11px 19px;',
    'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-elevated);',
    'text-align:left;cursor:pointer;',
    'transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease,opacity var(--atx-dur-fast) ease}',
    /* 188 轮：引线恒品牌黄（--at-yellow 深浅同值），与「选中」不再靠引线区分 */
    '.at-cx-card:before{content:"";position:absolute;left:6px;top:12px;width:3px;height:18px;',
    'border-radius:2px;background:var(--at-yellow)}',
    '.at-cx-card:hover{background:var(--at-chip)}',
    '.at-cx-card:active{opacity:.78}',
    /* ★ PC 卡片五态（capsule.wxss .cp-bub.on/.editing/.del/.wait/.fail）：
     * 选中与「正在编辑这一条」同色、靠黄引线区分；已删除名单整卡灰化；
     * 识别中只动透明度（手指可能正落在卡上），失败态灰字且停呼吸。 */
    '.at-cx-card.is-sel,.at-cx-card.is-editing{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-cx-card.is-editing:before{background:var(--at-yellow)}',
    '.at-cx-card.is-del{background:var(--at-card-dim)}',
    '.at-cx-card.is-del:before{background:var(--at-hairline)}',
    '.at-cx-card.is-wait{animation:atxCardBreath 1.1s ease-in-out infinite}',
    '.at-cx-card.is-fail{animation:none}',
    '.at-cx-card.is-fail .at-cx-card-text{color:var(--at-muted)}',
    '.at-cx-vmask{position:absolute;inset:0;z-index:2;display:flex;align-items:center;',
    'justify-content:center;border-radius:inherit;background:var(--atx-frost);pointer-events:none}',
    '.at-cx-vmask-t{font-size:14px;line-height:20px;font-weight:600;color:var(--at-slate-strong)}',
    '.at-cx-card-text{display:block;font-size:14px;line-height:1.5;white-space:pre-wrap;',
    'word-break:break-word;color:var(--at-primary)}',
    '.at-cx-card.is-del .at-cx-card-text{color:var(--at-slate)}',
    '.at-cx-card-meta{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;',
    'line-height:1.4;color:var(--at-muted);flex-wrap:wrap}',
    /* ★ PC 263 轮 .cp-pic：正文之下、时间之上；148 高裁图 + 右下「看大图」角标。
     * 用 span 包 img，不能嵌 button（.at-cx-card 自身就是 button）。 */
    '.at-cx-card-pic{position:relative;display:block;margin-top:9px;border-radius:9px;',
    'overflow:hidden;background:var(--at-chip);cursor:zoom-in}',
    '.at-cx-card-pic img{display:block;width:100%;height:148px;object-fit:cover;',
    'object-position:center top;transition:opacity var(--atx-dur-fast) ease}',
    '.at-cx-card-pic:hover img{opacity:.82}',
    '.at-cx-card-zoom{position:absolute;right:6px;bottom:6px;height:19px;padding:0 7px;',
    'border-radius:6px;background:var(--atx-zoom-bg);color:#fff;font-size:10px;',
    'display:flex;align-items:center;pointer-events:none}',
    /* ★ PC 280d：平板/PC 空态是「一句说明文字」，不是手机端那个图标块 + 虚框。
     * 顺序也在空心卡之后（入口先于解释），见 wxml 257–289 行。 */
    '.at-cx-empty{margin:6px 2px;font-size:13px;line-height:1.7;color:var(--at-text2)}',
    /* ★ PC 195/196 轮：已删除名单分页，34 高居中；终点行点不动、字色再退一档。 */
    '.at-cx-more{height:34px;margin:0 0 8px;display:flex;align-items:center;justify-content:center;',
    'width:100%;border:0;background:transparent;font-size:13px;color:var(--at-slate);cursor:pointer}',
    '.at-cx-more:hover:not(.is-end){color:var(--at-primary)}',
    '.at-cx-more.is-end{font-size:12px;color:var(--at-muted);cursor:default}',
    /* ★ 272 轮：底部留白＝滚动上限 ⇒ 写末尾占位块，不用 padding-bottom。 */
    '.at-cx-endgap{height:98px;flex:0 0 98px}',
    /* ★★ v1.4 录音降落区（PC `.cp-tail` 同构）——
     * 抽屉 flex 流里夹在列表与底边之间的一块 0 高区域，起录才长到 42% 抽屉高：
     * 列表因此"整体上滑"，底部露出那块渐变（黄族三停：warm → soft → 抽屉底）。
     * ⚠️ 高度必须由**布局**给（flex 项），不能用 padding/absolute —— 它要让列表变矮；
     * ⚠️ 顶端那一停必须等于抽屉底色（--at-elevated），否则上沿会接出一条横色带。 */
    '.at-cx-tail{position:relative;flex:0 0 auto;width:100%;height:0;overflow:hidden;',
    'background:linear-gradient(0deg,var(--at-yellow-warm) 0%,var(--at-yellow-soft) 34%,var(--at-elevated) 100%);',
    'transition:height var(--atx-dur-pop) cubic-bezier(.22,.68,.36,1)}',
    /* 展开那一帧挂 .is-snap 关掉过渡：起录要「瞬时长高 + 列表滑到底」一步到位，
     * 高度还在过渡中滚动算出来的是旧 max，滚不到真正的底（PC 101 轮同一条推导）。 */
    '.at-cx-tail.is-snap{transition:none}',
    /* 新胶囊落位那一下的「点亮」：更饱和的一层黄从底部升起再退掉（PC cpTailGlow 0.82s / 峰值 .32） */
    '.at-cx-tail::after{content:"";position:absolute;left:0;right:0;top:0;bottom:0;opacity:0;',
    'background:linear-gradient(0deg,var(--at-yellow) 0%,rgba(255,208,47,0) 62%)}',
    '.at-cx-tail.is-lit::after{animation:atxTailGlow .82s cubic-bezier(.22,.68,.36,1) .05s 1}',
    '@keyframes atxTailGlow{0%{opacity:0}22%{opacity:.32}100%{opacity:0}}',
    /* 降落区里的录音行：贴着这块区域的底边，随高度长出来 —— 一行三件，与 PC `.cp-rec` 同序 */
    '.at-cx-tail .at-cx-rec{position:absolute;left:0;right:0;bottom:0;border:0;background:transparent}',
    /* ★ 新卡片飞入（PC `.cp-sw.pop` / cpPop）：整张卡从下方 60 升起 + 轻微放大。
     * PC 挂在**行容器**上是因为气泡被 overflow:hidden 裁；插件里卡片就是滚动容器的
     * 直接子元素、末尾又有 98 高占位 ⇒ 位移 60 不会越出可视区，直接挂卡片即可。
     * backwards（不是 both）：播完不保留 to 帧，免得 transform 常驻把文字弄发虚。 */
    '.at-cx-card.is-pop{animation:atxLand .52s cubic-bezier(.42,0,.26,1) backwards}',
    '@keyframes atxLand{from{opacity:0;transform:translateY(60px) scale(.96)}',
    'to{opacity:1;transform:translateY(0) scale(1)}}',

    /* ---- side action column（PC .cp-ops / .cp-sw-b：72 容器 · 64×46 键） ---- */
    '.at-cx-ops{position:fixed;z-index:132;display:flex;flex-direction:column;align-items:center;',
    'gap:6px;pointer-events:auto}',
    '.at-cx-op{display:flex;align-items:center;justify-content:center;gap:5px;width:64px;height:46px;',
    'padding:0 4px;border:0;border-radius:12px;background:var(--at-solid);',
    'color:var(--at-on-solid);font-size:12px;font-weight:600;line-height:1;cursor:pointer;',
    'white-space:nowrap;box-shadow:var(--at-sh-float);overflow:hidden;',
    'transition:opacity var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease,',
    'background var(--atx-dur-fast) ease}',
    '.at-cx-root .at-cx-op{font-size:12px!important;font-weight:600;line-height:1}',
    '.at-cx-root .at-cx-op span{font-size:12px;line-height:1;white-space:nowrap}',
    '.at-cx-op:hover:not(:disabled){opacity:.82}',
    '.at-cx-op:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    /* 263 轮：实心危险键走派生令牌，深色下不能直接用 --at-danger */
    '.at-cx-op.is-danger{background:var(--atx-fill-danger);color:var(--atx-on-fill-danger)}',
    '.at-cx-op.is-danger:hover:not(:disabled){opacity:.82}',
    '.at-cx-op.is-danger:active:not(:disabled){background:var(--atx-danger-press)}',
    '.at-cx-op.is-dim{opacity:.4;cursor:not-allowed}',
    '.at-cx-ops.is-inside .at-cx-op{width:44px;height:42px;padding:0}',
    '.at-cx-ops.is-inside .at-cx-op span{display:none}',

    /* ---- 字段 / 按钮 / 脑图列表（右侧抽屉共用，PC .ep / .cs 同规格） ---- */
    /* 套 `.at-input` 基线：38 高 / 圆角 10 / 1px `--at-field-line` / 14px；
     * 聚焦只变描边（`--at-text2`），不吃外圈 outline。 */
    '.at-cx-input,.at-cx-select,.at-cx-area{width:100%;border:1px solid var(--at-field-line);',
    'border-radius:10px;background:var(--at-card);color:var(--at-primary);outline:none;font-size:14px}',
    '.at-cx-input,.at-cx-select{height:38px;padding:0 10px}',
    '.at-cx-area{padding:9px 10px;line-height:1.6;resize:vertical}',
    '.at-cx-input:focus,.at-cx-select:focus,.at-cx-area:focus{border-color:var(--at-text2)}',
    '.at-cx-input::placeholder,.at-cx-area::placeholder{color:var(--at-muted);font-size:13px}',
    '.at-cx-row{display:flex;align-items:center;gap:8px;margin-top:9px;flex-wrap:wrap}',
    '.at-cx-row .at-cx-select{flex:1 1 120px;width:auto;min-width:0}',
    '.at-cx-btn{height:40px;padding:0 14px;border:1px solid var(--at-hairline-strong);border-radius:10px;',
    'background:var(--at-card);color:var(--at-slate);font-size:14px;font-weight:600;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;',
    'transition:background var(--atx-dur-fast) ease,opacity var(--atx-dur-fast) ease,',
    'transform var(--atx-dur-fast) ease}',
    '.at-cx-btn:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
    '.at-cx-btn:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    '.at-cx-btn.is-primary{background:var(--at-solid);border-color:transparent;color:var(--at-on-solid)}',
    '.at-cx-btn.is-primary:hover:not(:disabled){color:var(--at-on-solid);opacity:.82}',
    '.at-cx-btn.is-danger{color:var(--at-danger);border-color:var(--at-danger);background:var(--at-card)}',
    '.at-cx-btn:disabled{opacity:.4;cursor:not-allowed}',
    '.at-cx-hint{font-size:12px;color:var(--at-text2);line-height:1.55;margin-top:8px}',
    /* ★★ v1.5 转脑图候选卡 → PC `drawer.wxss` 的 `.dw-card.mm`：
     * 12 圆角白卡、11/12 内距、名称 14/500、下面一条标签行（项目色点 / 格式 /
     * 「当前」chip）。选中＝黄软底＋黄边；锁态＝整卡压 .45（同 `.dw-card.mm.lock`）。
     * 顶部那张 lead 卡是「语义转脑图」（PC `drawers.buildMindmapPick` 的 AI_PICK_ID），
     * 黄软底虚框，与下面"挑一张现有的"分开。 */
    '.at-cx-map-list{display:flex;flex-direction:column;gap:8px;flex:1 1 auto;min-height:0;overflow:auto}',
    '.at-cx-map-card{display:flex;flex-direction:column;gap:7px;flex:0 0 auto;width:100%;',
    'padding:11px 12px;border:1px solid var(--at-hairline);border-radius:12px;',
    'background:var(--at-card);text-align:left;cursor:pointer;',
    'transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease}',
    '.at-cx-map-card:hover:not(:disabled){background:var(--at-chip)}',
    '.at-cx-map-card.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-cx-map-card.is-lead{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
    'border-style:dashed}',
    /* PC `.dw-card.mm.lock`：门控住的脑图整卡压 .45。组件渲染的是 `.is-lock`，
     * 只写 `:disabled` 会让锁态"有类名没样式"（门控期间并不 disabled）。 */
    '.at-cx-map-card.is-lock,.at-cx-map-card:disabled{opacity:.45;cursor:not-allowed}',
    '.at-cx-map-name{font-size:14px;font-weight:500;color:var(--at-primary);',
    'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
    '.at-cx-map-tags{display:flex;align-items:center;gap:6px}',
    '.at-cx-map-tag{padding:2px 8px;border:1px solid var(--at-hairline);border-radius:999px;',
    'background:var(--at-elevated);font-size:11px;color:var(--at-slate);white-space:nowrap}',
    '.at-cx-map-tag.is-current{border-color:var(--at-yellow);color:var(--at-primary);font-weight:500}',
    '.at-cx-map-tags .at-cx-proj-dot{width:12px;height:12px;flex:0 0 12px}',
    '.at-cx-map-lead-head{display:flex;align-items:center;gap:7px}',
    '.at-cx-map-desc{font-size:12px;line-height:1.5;color:var(--at-text2)}',

    /* ---- 录音行（302 / 267：黄软底 + 等宽倒数 + 5 根波纹） ----
     * v1.4 起它住在**降落区底部**（PC `.cp-tail` 里那一行），不再占标题带下面那一条：
     * 抽屉一开顶上就横一条黄带，与 PC「只有 头 / 列表 / 降落区 三段」的读法不符。 */
    /* ★ PC 302 轮 .cp-stop-scrim：录音时全屏透明挡板，点任意处即停。
     * 没有它，「轻点任意处停止」这句话是假的（只能点悬浮键或按 Esc）。 */
    '.at-cx-stop-scrim{position:fixed;z-index:151;background:transparent;pointer-events:auto;cursor:pointer}',
    '.at-cx-rec{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:10px 14px;',
    'background:var(--at-yellow-soft);border-top:1px solid var(--at-yellow-line);',
    'font-size:12px;color:var(--at-text2)}',
    '.at-cx-rec-t{flex:1 1 auto;min-width:0;margin-left:auto;text-align:right;',
    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-cx-rec-num{font-family:var(--atx-font-num);font-variant-numeric:tabular-nums;',
    'font-size:18px;font-weight:700;line-height:1;color:var(--at-primary)}',
    '.at-cx-wave{display:flex;align-items:center;gap:2px;height:18px;flex:0 0 auto}',
    '.at-cx-wave i{display:block;width:2px;height:100%;border-radius:1px;',
    'background:var(--at-yellow-deep);transform-origin:center;animation:atxWave .9s ease-in-out infinite}',
    '.at-cx-wave i:nth-child(1){height:7px;animation-delay:0s}',
    '.at-cx-wave i:nth-child(2){height:13px;animation-delay:.12s}',
    '.at-cx-wave i:nth-child(3){height:18px;animation-delay:.24s}',
    '.at-cx-wave i:nth-child(4){height:11px;animation-delay:.36s}',
    '.at-cx-wave i:nth-child(5){height:6px;animation-delay:.48s}',
    /* 识别中：同一组波纹放慢并压淡 —— 采集已经停了，摆动只是「在转写」的活口 */
    '.at-cx-wave.is-asr i{animation-duration:1.5s;opacity:.62}',

    /* ---- 右侧副抽屉（写 / 编辑 / 转待办 / 转脑图，PC .ep / .cp-sheet.sub 同族） ---- */
    /* ★ PC 274 轮口径：副面板开在主抽屉右侧时挡板「连压暗都不要」——
     * 用户此刻要看的是这句话会插进哪份名单，压暗左侧就把唯一那份上下文蒙掉了。
     * 挡板只保留「点外面 = 关面板」，故 background:transparent 但 pointer-events:auto。
     * 对齐 小程序前端/components/capsule/capsule.wxss 的 .cp-sheet-scrim.sub。 */
    '.at-cx-submask{position:fixed;z-index:140;background:transparent;pointer-events:auto;',
    'animation:atxFade var(--atx-dur-fade) ease-out}',
    /* 只淡入、不做位移：它开在主抽屉右侧并排，滑入会抢左边那条抽屉的动线 */
    '.at-cx-sub{position:fixed;z-index:141;display:flex;flex-direction:column;min-width:0;height:auto;',
    'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-elevated);',
    'box-shadow:var(--atx-sh-sub);overflow:hidden;pointer-events:auto;',
    'animation:atxFade var(--atx-dur-fade) ease-out}',
    '.at-cx-sub-head{flex:0 0 52px;height:52px;display:flex;align-items:center;justify-content:space-between;',
    'gap:8px;padding:0 14px;background:var(--at-head-bg);border-bottom:1px solid var(--at-head-line)}',
    '.at-cx-sub-title{font-size:16px;font-weight:500;letter-spacing:-.2px}',
    /* flex:0 1 auto：面板被 max-height 夹住时正文自己收缩并内部滚，底带不会被裁掉 */
    '.at-cx-sub-body{flex:0 1 auto;min-height:0;overflow:auto;padding:12px 14px 0}',
    '.at-cx-sub-foot{flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:8px;',
    'padding:10px 14px 4px;border-top:1px solid var(--at-hairline-soft);background:var(--at-head-bg)}',
    '.at-cx-sub-foot .at-cx-btn{flex:1 1 0;min-width:0}',
    '.at-cx-sub .at-cx-field{margin-bottom:14px}',
    /* 字段名与 PC `.sd-label` 同档：13 / 500 / **正墨**（退一档的灰在深色下读成禁用） */
    '.at-cx-sub .at-cx-label{display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:var(--at-primary)}',
    '.at-cx-sub .at-cx-area{min-height:148px;max-height:296px}',
    /* 创建面板的输入区 132 高（副抽屉窄，更早折行） */
    '.at-cx-sub.is-compose .at-cx-area{height:132px;min-height:132px;max-height:132px}',
    /* ★★ v1.5 第二档 `.o1`（转待办 `.sd.o1` ／ 转脑图 `.dw.o1`）：
     * 两块都 320 宽全高、左缘 +270（与主抽屉重叠 50）；结构照 `.sd`：
     * 灰标题带 52 / 正文 flex:1 自滚 / 底带 56 贴底、**只一颗主键**。
     * v1.4 把转脑图当成 `.sd3`（260 / +12）是误认 —— 那是表单里
     * 「选择其他项目」的三级项目副弹窗。 */
    '.at-cx-sub.is-fill .at-cx-sub-body{flex:1 1 auto;display:flex;flex-direction:column;padding-bottom:12px}',
    '.at-cx-sub.is-fill .at-cx-sub-foot{flex:0 0 56px;height:56px;padding:10px 14px;',
    'justify-content:flex-end;background:var(--at-elevated)}',
    '.at-cx-sub.is-o1 .at-cx-sub-foot{border-top:0;gap:10px}',
    '.at-cx-sub.is-o1 .at-cx-sub-foot .at-cx-btn{flex:1 1 0}',
    /* `.sd-cancel`：标题带右上那颗 28 高描边胶囊（close 13 ＋「取消」），不是圆 × */
    '.at-cx-hcancel{height:28px;padding:0 10px;border:1px solid var(--at-hairline-strong);',
    'border-radius:999px;background:var(--at-elevated);color:var(--at-primary);font-size:12px;',
    'display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;',
    'white-space:nowrap;transition:background var(--atx-dur-fast) ease}',
    '.at-cx-hcancel:hover{background:var(--at-chip)}',
    /* `.sd-req`：字段名后面那枚「必填」小标 */
    '.at-cx-req{margin-left:6px;padding:1px 6px;border-radius:6px;background:var(--at-chip);',
    'color:var(--at-muted);font-size:11px;font-weight:400}',
    /* 待办内容框：PC `.sd-area` 起手 104（4 行），到这里可以长到 296 */
    '.at-cx-sub.is-todo .at-cx-area{height:104px;min-height:104px;max-height:296px;',
    'flex:0 0 auto}',
    /* 紧急度胶囊 → PC `.sd-chip`：白底描边 13 号、**无小色点**；
     * 选中态的三支色（soft 底 / main 描边 / text 字）由档位色板行内给，
     * 不再统一涂黄 —— 四档要一眼看出选的是谁。 */
    '.at-cx-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.at-cx-chip{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;',
    'border:1px solid var(--at-hairline);background:var(--at-card);font-size:13px;color:var(--at-slate);',
    'cursor:pointer;transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease}',
    '.at-cx-chip:hover{background:var(--at-chip)}',
    '.at-cx-chip.is-on{font-weight:500}',
    /* ★★ 归属项目 → PC `.sd-list` / `.sd-row`（form-drawer.wxss 295 行）：
     * 一行一个、40 高、10 圆角、左端 16 色点、名称 14/17、选中黄软底＋黄边＋勾。
     * v1.4 用 `<select>` 下拉，既不显示项目色也读不出当前选的是谁。 */
    '.at-cx-proj-list{display:flex;flex-direction:column;gap:6px}',
    '.at-cx-proj{display:flex;align-items:center;gap:8px;width:100%;height:40px;padding:0 12px;',
    'border:1px solid var(--at-hairline);border-radius:10px;background:var(--at-card);',
    'text-align:left;cursor:pointer;transition:background var(--atx-dur-fast) ease}',
    '.at-cx-proj:hover{background:var(--at-chip)}',
    '.at-cx-proj.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-cx-proj.is-on .at-cx-proj-t{font-weight:500}',
    '.at-cx-proj-dot{width:16px;height:16px;border-radius:999px;flex:0 0 16px}',
    /* 「选择其他项目」左端是 16 的图标而不是 16 色点 —— 文字起点必须和上面那些行对齐 */
    '.at-cx-proj.is-pick .at-ico{flex:0 0 16px}',
    '.at-cx-proj-t{flex:1 1 auto;min-width:0;font-size:14px;line-height:17px;',
    'color:var(--at-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
    '.at-cx-proj-go{flex:0 0 auto;display:flex;align-items:center;opacity:.45}',
    '.at-cx-edit-scrim{position:fixed;z-index:133;background:transparent;pointer-events:auto}',
    '.at-cx-edit-thumb{width:72px;height:72px;border-radius:9px;object-fit:cover;display:block;',
    'border:1px solid var(--at-hairline)}',
    '.at-cx-edit-imgwrap{position:relative;width:72px;height:72px;flex:0 0 auto}',
    '.at-cx-edit-imgx{position:absolute;top:3px;right:3px;width:20px;height:20px;padding:0;border:0;',
    'border-radius:6px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;line-height:20px;',
    'text-align:center;cursor:pointer}',

    /* ---- confirm / image preview ---- */
    '.at-cx-modal-layer{position:fixed;z-index:160;display:flex;align-items:center;justify-content:center;',
    'padding:24px;background:var(--at-mask);pointer-events:auto;',
    'animation:atxFade var(--atx-dur-fade) ease-out}',
    '.at-cx-modal{width:min(360px,100%);max-height:100%;overflow:auto;border:1px solid var(--at-hairline);',
    'border-radius:16px;background:var(--at-elevated);box-shadow:var(--at-sh-pop);padding:18px}',
    '.at-cx-modal-title{font-size:16px;font-weight:600;margin:0 0 8px}',
    '.at-cx-modal-body{font-size:13px;line-height:1.7;color:var(--at-text2);margin:0 0 16px}',
    '.at-cx-modal-actions{display:flex;justify-content:flex-end;gap:8px}',
    '.at-cx-preview{position:fixed;z-index:170;display:flex;align-items:center;justify-content:center;',
    'padding:24px;background:rgba(12,12,13,.72);pointer-events:auto;',
    'animation:atxFade var(--atx-dur-fade) ease-out}',
    '.at-cx-preview img{max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.4)}',
    '.at-cx-preview-x{position:absolute;top:14px;right:14px;width:34px;height:34px;padding:0;',
    'border:1px solid rgba(255,255,255,.5);border-radius:50%;background:rgba(0,0,0,.35);cursor:pointer;',
    'display:flex;align-items:center;justify-content:center}',
    '/* 统一 active / 补齐缺失 hover：is-lock 的 .45 是 C-12 登记的锁态，is-end 不可点 */',
    '.at-cx-root :where(.at-cx-hcancel,.at-cx-hollow,.at-cx-more:not(.is-end),',
    '.at-cx-map-card:not(.is-lock),.at-cx-chip,.at-cx-proj,.at-cx-btn,.at-cx-op,',
    '.at-cx-hbtn,.at-cx-hclose,.at-cx-edit-imgx,.at-cx-preview-x):active:not(:disabled)',
    '{transform:translateY(1px);opacity:.78}',
    '.at-cx-root :where(.at-cx-edit-imgx,.at-cx-preview-x):hover{opacity:.82}'
  ].join('')

  /* ---------------------------------------------------------------- state --- */
  /* ★ v1.8：录音从「浏览器语音识别」改成「真采集 → 转写」，两个在途标记：
   * recTimer 管 60s 倒数；asrSeq 管「这一轮还算不算数」（关列表 / 重录即作废）。 */
  var recTimer = null, asrSeq = 0
  function cap() { return B.get().ui.capsule || {} }
  function patchCap(p) { B.ui({ capsule: Object.assign({}, cap(), p) }) }
  function openCapsule(seed) {
    disposeRecord()
    B.ui({ capsule: {
      open: true, seed: seed || '', selected: [], delMode: false, multi: false,
      composeOpen: false, composeText: '', composeImage: null, saving: false,
      editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false, todoProjectId: '', todoUrgency: 'mid',
      todoText: '', mapPick: false, mapPickedId: '', mapBusy: '', todoBusy: false,
      deleteOpen: false, previewUri: '', phase: '', clock: '', landAt: 0,
      landFrom: '', landId: ''
    } })
  }
  function closeCapsule() {
    disposeRecord()
    B.ui({ capsule: null })
  }
  /* 清「本轮录音」的界面标记与倒数，但**不碰采集** —— 收尾还要用那段音频。 */
  function clearRecordUi() {
    if (recTimer) { clearInterval(recTimer); recTimer = null }
    if (B.get().ui.capsule) patchCap({ phase: '', clock: '' })
  }
  /* 放弃这一轮：关抽屉 / 切页 / 卸载时用。在途转写按 asrSeq 作废。 */
  function disposeRecord() {
    asrSeq += 1
    clearRecordUi()
    if (AT.voice) AT.voice.abort()
  }
  /* 保留旧名：99-entry 的卸载钩子与内部关闭路径仍按 `stopRecord` 调。 */
  function stopRecord() { disposeRecord() }
  function recErrorText(e) {
    var kind = e && e.kind
    if (kind === 'permission') return '麦克风权限被拒绝，请在系统设置里允许 DSH 使用麦克风'
    if (kind === 'deviceMissing') return '没找到可用的麦克风，插上设备后重试'
    if (kind === 'unavailable') return '当前宿主打不开麦克风，请改用「写一条」'
    if (kind === 'empty') return '没有录到声音，点开始后说一段话'
    return (e && e.message) || '录音失败，请重试'
  }
  async function startRecord() {
    if (!AT.voice || !AT.voice.supported()) {
      B.toast('当前宿主没有麦克风接口，请用「写」记一条', 'danger')
      return
    }
    var token = ++asrSeq
    var left = K.recMax
    patchCap({ phase: 'rec', clock: String(left), composeOpen: false, editId: '', editImageUri: '',
      todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
    try {
      await AT.voice.start()
    } catch (e) {
      if (token !== asrSeq) return
      clearRecordUi()
      B.toast(recErrorText(e), 'danger')
      return
    }
    /* 等麦克风授权那几秒里，用户可能已经点了停止 / 关了列表 */
    if (token !== asrSeq || !cap().open || cap().phase !== 'rec') {
      if (AT.voice.recording()) AT.voice.abort()
      return
    }
    recTimer = setInterval(function () {
      left -= 1
      if (left <= 0) { finishRecord(); return }
      patchCap({ clock: String(left) })
    }, 1000)
  }
  /* 结束录音 → 转写 → 写库。
   * ★ v1.8：这里不再假设「识别已经同步给出文字」—— 停止只是采集结束，文字要等
   *   voice.transcribe（DSH 本地 SenseVoice 优先、后端 /asr 兜底）回来。
   *   中间那段是 phase:'asr'，列表必须一直开着（v1.6 的护栏照旧生效）。 */
  async function finishRecord(text) {
    var typed = String(text || '').trim()
    if (typed) { disposeRecord(); await saveVoice(typed); return }
    var c = cap()
    if (!c.open || c.phase !== 'rec') return      /* 防重入：识别中 / 已结束 */
    if (recTimer) { clearInterval(recTimer); recTimer = null }
    var token = ++asrSeq
    patchCap({ phase: 'asr', clock: '' })
    var audio = null
    try {
      audio = await AT.voice.stop(K.recMax)
    } catch (e) {
      if (token !== asrSeq) return
      clearRecordUi()
      B.toast(recErrorText(e), 'danger')
      return
    }
    if (token !== asrSeq) return
    if (!audio || !audio.bytes || audio.bytes.length <= 44) {
      clearRecordUi()
      B.toast('没有录到声音，点开始后说一段话', 'danger')
      return
    }
    var said = ''
    try {
      var out = await AT.voice.transcribe(audio.bytes)
      said = String((out && out.text) || '').trim()
    } catch (e) {
      if (token !== asrSeq) return
      clearRecordUi()
      B.toast('语音识别没成功：' + ((e && e.message) || '请重试'), 'danger')
      return
    }
    if (token !== asrSeq) return
    /* 识别期间用户关掉了列表：照写结果，但不再改一个已经不存在的界面 */
    if (B.get().ui.capsule) clearRecordUi()
    if (!said) { B.toast('没听清，再说一次？', 'danger'); return }
    await saveVoice(said)
  }
  /* 唯一一处「语音 → 胶囊」的写库路径。v1.6 / v1.7 的护栏全留在这里：
   * `open:true` 保证这段异步流程任何一步都不会把列表关掉；
   * `landFrom:'voice'` 才是降落区展开 + 新卡飞入的那条路径（文字创建没有）。 */
  async function saveVoice(text) {
    var value = String(text || '').trim()
    if (!value) { B.toast('没有识别到文字，请重试或点击「写一条」'); return }
    var res
    try {
      res = await B.actions.addCapsule(value, { source: 'voice' })
    } catch (e) {
      /* 写库异常不许冒泡成 unhandled rejection（用户侧表现就是「闪退」） */
      B.toast('记下失败，请重试', 'danger')
      return
    }
    if (!res || !res.ok) return
    B.toast('已记下这条闪念')
    if (!B.get().ui.capsule) return
    /* landAt 是「新胶囊飞入」的信号：组件据此给最后一条挂 .is-pop 并点亮降落区。 */
    patchCap({ open: true, selected: [], landFrom: 'voice', landId: '',
      landAt: Date.now() })
  }
  function toggleRecord() {
    var c = cap()
    if (!c.open) { openCapsule(''); return }
    if (c.phase === 'rec') { finishRecord(); return }
    if (c.phase === 'asr') return       /* 识别中不重复起录 */
    startRecord()
  }
  function openCompose() {
    if (!cap().open) openCapsule('')
    patchCap({ composeOpen: true, composeText: cap().seed || '', composeImage: null,
      editId: '', editImageUri: '', todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
  }
  async function saveCompose() {
    var c = cap(), text = String(c.composeText || '').trim()
    if (!text) { B.toast('还没有写内容'); return }
    if (c.saving) return
    var img = c.composeImage || null
    var before = {}
    Core.capsules(B.get()).forEach(function (x) { before[x.id] = 1 })
    /* ★ PC 268 轮 onComposeSave → _landCapsule(id, false)：文字创建的进入效果 =
     * 「面板先拆掉 → 新卡**首次挂载**就带 .is-pop → 无动画滚到底」三件事同帧落定。
     * ⚠️ landAt 必须写在 addCapsule 的乐观 store.set **之前**：写库成功后才补，
     *    新卡会先原地出现一帧、再跳回 +60px 重播 —— 就是「进入效果不对」的根因。
     * ⚠️ 小程序用 200ms 空等给 .cp-sheet 退场留帧；插件副抽屉拆除是瞬时的，
     *    改用两次 patch 分帧达到同一「面板与卡片不同帧」，不制造 200ms 丢字窗口。 */
    patchCap({ saving: true, composeOpen: false, composeText: '', seed: '', composeImage: null,
      selected: [], landAt: 0, landFrom: '', landId: '' })
    patchCap({ landFrom: 'text', landAt: Date.now() })
    var res
    try {
      res = await B.actions.addCapsule(text, { source: 'text', imageUri: img })
    } catch (e) {
      /* 写库异常不许冒泡成 unhandled rejection；落位信号一并撤掉 */
      patchCap({ saving: false, landAt: 0, landFrom: '', landId: '' })
      B.toast('记下失败，请重试', 'danger')
      return
    }
    if (!res || !res.ok) {
      patchCap({ saving: false, landAt: 0, landFrom: '', landId: '' })
      return
    }
    /* 精确锁定这次新建的那条（PC `_popId`）：resync 会用服务端 id 覆盖乐观 id，
     * 故按保存前名单取差集；避免 720ms 窗口内又新增时动画落到别的卡上。
     * ⚠️ 这次 patch 不换类名（兜底已挂在最后一条），CSS 动画不会重启。 */
    var fresh = Core.capsules(B.get()).filter(function (x) { return !before[x.id] })[0]
    var newId = fresh ? fresh.id : (res.capsule && res.capsule.id) || ''
    patchCap({ saving: false, landId: newId })
    B.toast('已接住这条闪念')
  }

  /* -------------------------------------------------------- content bounds --- */
  function measureComposerInset(b) {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return 0
    var nodes, i, best = 0
    var bottom = b.top + b.height
    try {
      nodes = document.querySelectorAll('[data-composer-card],[data-composer-input]')
    } catch (e) { return 0 }
    for (i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      if (!el || typeof el.getClientRects !== 'function') continue
      if (!el.getClientRects().length) continue
      var r = el.getBoundingClientRect()
      if (!r || r.height < 24 || r.width < 80) continue
      if (r.top < b.top || r.top > bottom) continue
      var inset = bottom - r.top
      if (inset > best) best = inset
    }
    return best
  }
  function measureBounds() {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return null
    var overlay = document.querySelector('[data-shell-overlay]')
    var frame = overlay && overlay.parentElement
    if (!frame) return null
    var rightbar = null
    try { rightbar = frame.querySelector('[data-rightbar-col]') } catch (e) { rightbar = null }
    var center = rightbar && rightbar.previousElementSibling
    var r
    if (center && typeof center.getBoundingClientRect === 'function') {
      r = center.getBoundingClientRect()
    } else {
      r = frame.getBoundingClientRect()
    }
    if (!r || !r.width || !r.height) return null
    var b = { left: r.left, top: r.top, width: r.width, height: r.height, composerInset: 0 }
    b.composerInset = measureComposerInset(b)
    return b
  }
  function fallbackBounds() {
    var w = (typeof window !== 'undefined' && window.innerWidth) || 1200
    var h = (typeof window !== 'undefined' && window.innerHeight) || 800
    return { left: 0, top: 0, width: w, height: h, composerInset: 0 }
  }
  function usableOf(b) {
    /* 输入框占住的那一段不属于悬浮键的可放区：默认位置 / 拖动边界 /
     * 已保存的位置都按同一块“可用区”计算，所以输入框长高时悬浮键会自动上移。 */
    var reserved = b.composerInset ? b.composerInset + 12 : 0
    var maxReserved = Math.max(0, b.height - FAB_MARGIN * 2 - FAB_SIZE)
    reserved = Math.min(reserved, maxReserved)
    return {
      w: Math.max(0, b.width - FAB_MARGIN * 2 - FAB_SIZE),
      h: Math.max(0, b.height - FAB_MARGIN * 2 - FAB_SIZE - reserved)
    }
  }
  function defaultPos(b) {
    /* 窄内容区把悬浮键组默认锚到左下：右侧留给动作列，否则 5 颗动作键 +
     * 「写」+ 悬浮键会连成一列。PC 平板竖屏口径也是「点左下角的麦克风」
     * （capsule.wxml 287 行）。只影响未保存过位置的新用户，拖拽位置照旧优先。 */
    return { x: b && b.width < K.wideBound ? 0 : 1, y: 1 }
  }
  function pointOf(b, p) {
    var u = usableOf(b)
    return { x: b.left + FAB_MARGIN + p.x * u.w, y: b.top + FAB_MARGIN + p.y * u.h }
  }
  function loadPos() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      var raw = window.localStorage.getItem(POS_KEY)
      if (!raw) return null
      var p = JSON.parse(raw)
      var x = Number(p && p.x), y = Number(p && p.y)
      if (!isFinite(x) || !isFinite(y)) return null
      return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }
    } catch (e) { return null }
  }
  function savePos(p) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(POS_KEY, JSON.stringify({ x: p.x, y: p.y }))
      }
    } catch (e) { /* private mode / quota */ }
  }
  function sameBounds(a, b) {
    return !!a && !!b && a.left === b.left && a.top === b.top &&
      a.width === b.width && a.height === b.height && a.composerInset === b.composerInset
  }
  function clamp(v, min, max) {
    if (max < min) return min
    return Math.min(max, Math.max(min, v))
  }
  /* 窗口适配统一由样式标准的 geom() 给：主抽屉 / 动作列 / 右侧副抽屉 /
   * 编辑面板的几何只在这一处算，组件与判据读同一个真源。 */
  var geomOf = St.geom
  function opsCount(c, selected) {
    if (!c || !c.open) return 0
    if (c.editId || c.composeOpen || c.todoPick || c.mapPick || c.deleteOpen || c.previewUri ||
      c.phase === 'rec' || c.phase === 'asr') return 0
    if (c.delMode) return (c.multi || selected.length) ? 1 : 0
    if (c.multi) return 5
    return selected.length ? 5 : 0
  }
  function findCard(drawer, id) {
    if (!drawer || typeof drawer.querySelectorAll !== 'function') return null
    var nodes = drawer.querySelectorAll('[data-cid]'), i
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].getAttribute('data-cid') === id) return nodes[i]
    }
    return null
  }

  /* ------------------------------------------------------------- component --- */
  function FloatingCapsule() {
    var s = B.useStore()
    var c = s.ui.capsule
    var dark = AT.icons.useDark()
    var boundsState = React.useState(measureBounds)
    var bounds = boundsState[0]
    var setBounds = boundsState[1]
    var posState = React.useState(loadPos)
    var savedPos = posState[0]
    var setPos = posState[1]
    var dragState = React.useState(false)
    var dragging = dragState[0]
    var setDragging = dragState[1]
    var opsState = React.useState(null)
    var opsTop = opsState[0]
    var setOpsTop = opsState[1]
    /* 196 轮：分页只开在「已删除」名单（正常名单是收件箱，不分页）；
     * 页码是纯视图态，不进 store、不改接口。 */
    var pageState = React.useState(1)
    var page = pageState[0]
    var setPage = pageState[1]
    var longRef = React.useRef(null)
    var dragRef = React.useRef(null)
    var movedRef = React.useRef(false)
    var rootRef = React.useRef(null)
    var drawerRef = React.useRef(null)
    var composeRef = React.useRef(null)
    var editRef = React.useRef(null)
    var posRef = React.useRef(null)
    var boundsRef = React.useRef(bounds)
    boundsRef.current = bounds
    var useIso = React.useLayoutEffect || React.useEffect

    var b = bounds || fallbackBounds()
    var pos = savedPos || defaultPos(b)
    posRef.current = pos
    var g = geomOf(b)
    var open = !!(c && c.open)
    /* ★ 轮次 20：每次点悬浮 logo 打开胶囊列表都重新拉一次 /sync ——
     * 开场那份快照可能已经过时（小程序里刚记的闪念、别的设备上刚删的胶囊，
     * 都要在列表里看得到）。与输入框导出器（样式标准 §4.11）同一条口径。
     * ⚠️ 只在已登录时拉：/sync 要设备 JWT，未登录拉会 401 误报连接错误，
     *    还会用服务端快照盖掉演示数据。
     * 依赖只有 [open] ⇒ 一次打开恰好一次；同步引起的 store 重渲染、
     * 起录 / 切编辑 / 翻页都不改 open，不会重复发。 */
    React.useEffect(function () {
      if (!open) return
      if (B.get().ui.connected) B.sync(false)
    }, [open])
    /* ★ v1.4 起 · 打开态：浮键组停到**主抽屉右侧那条竖排带**上（v1.5 对齐
     * PC / 横屏 `.rail-brand` + `.rail-write`：两颗 40 方键，写在上、说在下）。
     * 抽屉一开，保存的归一化坐标只描述"关闭时的位置"，继续沿用会正好落在列表上。
     * 内容区放不下 40 方键时 geom() 把这条带退进抽屉左下角（横排），见样式标准 §3。
     * 关闭态照旧可拖动、可持久化。 */
    var pnt = open ? { x: g.railLeft, y: g.railSayTop } : pointOf(b, pos)
    /* PC wxml 911 行：!editId && !compose && !recPhase ⇒ 三种状态下动作组整列不渲染。 */
    var recOn = !!(c && c.phase === 'rec')
    /* ★ v1.8 · 识别中（phase:'asr'）与录音中同一档：动作组整列不渲染、
     * 写键收起、点外面不关列表 —— 用户刚说完话，界面不该在这两秒里跳。 */
    var asrOn = !!(c && c.phase === 'asr')
    var opsHidden = !!(c && (c.phase === 'rec' || c.phase === 'asr' || c.editId || c.composeOpen))
    /* ★ 右侧副抽屉（写 / 编辑 / 转待办 / 转脑图）一开会盖住那条竖排带（z 149/150 > 141）：
     * 停靠带收起来，否则两颗 40 方键正好盖在面板的底键上。收起期间起录 / 手写都从面板里走。 */
    /* ★ 主面板表单（新建待办 / 新建脑图等）打开时也收起这条带：FAB z150 / 写键 z149
     * 高于主面板抽屉 z55，不收起就会有颗黄色方块浮在弹窗右下角盖住底键。
     * ★ 轮次 6：筛选也改成同一只右侧展开浮层（z55），同样要收 —— 否则会盖住
     *   它的「清除全部筛选」底键。两个主面板状态各写真源，与胶囊四种副抽屉并列。 */
    var railHidden = !!(s.ui && s.ui.form) || !!(s.ui && s.ui.filterKind) ||
      !!(c && (c.todoPick || c.mapPick || c.composeOpen || c.editId))
    /* ★★ v1.5 · **第一档侧转**（PC `.cp.turned`）：只有第二档的两条路径触发。
     * 写 / 编辑是同一层往外展开的 260 副弹窗，父层仍可读可点 ⇒ 不侧转。 */
    var turned = !!(c && (c.todoPick || c.mapPick))
    /* ★★ v1.5 · 表单色板跟着主题走：紧急四档的 soft/main/text 与项目色点，
     * 真值在 10-constants.js（逐值取自小程序 mock.js / theme.js）。
     * ⚠️ 不在这里写 hex —— 行内 style 只做「从色板取哪一支」的选择。 */
    function urgencyPalette(u) { return dark ? (C.URGENCY_DARK[u.key] || u) : u }
    function projectColor(p) {
      var col = p.color ? C.colorOf(p.color) : null
      if (!col) return dark ? C.NONE_COLOR_DARK : C.NONE_COLOR
      return dark ? (C.PROJECT_DARK[p.color] || col.main) : col.main
    }
    var currentMapId = (s.ui && s.ui.mindmapId) || ''
    var list = open ? (c.delMode ? Core.deletedCapsules(s) : Core.capsules(s)) : []
    var selected = open ? (c.selected || []).filter(function (id) {
      return list.some(function (x) { return x.id === id })
    }) : []
    var ops = opsHidden ? 0 : opsCount(c, selected)
    var selectedKey = selected.join('|')
    var deletedCount = Core.deletedCapsules(s).length
    /* _viewOf()：normal list 全量；已删除名单按 DEL_PAGE 分页，末尾给「加载更多 / 已无更多信息」。 */
    var paged = open && !!c.delMode
    var visible = paged ? list.slice(0, K.delPage * page) : list
    var hasMore = paged && visible.length < list.length
    var allShown = paged && !hasMore && list.length > K.delPage
    var writeLeft = g.railWriteLeft
    var writeTop = g.railWriteTop
    var opsGroupH = ops * OPS_KEY_H + Math.max(0, ops - 1) * OPS_GAP
    /* ★ 录音降落区 + 新胶囊落位（PC `.cp-tail` / `.cp-sw.pop`）——
     * 三个量全部**由 store 里的 `landAt` ＋ 时间**算出来，不另存组件状态：
     *   · tailOn  —— **只有语音**起录中 / 刚落位（2.4s 内）⇒ 降落区展开；
     *                 文字创建 `tailOn=false`（PC onComposeSave 同口径），不顶起列表；
     *   · tailLit —— 语音落位后 0.9s 内点亮那一下（PC cpTailGlow）；
     *   · landing —— 落位后 720ms 内，新建那条卡片挂 `.is-pop` 播一次飞入。
     * 为什么不用 state：`finishRecord` / `saveCompose` 在模块作用域，改不到组件状态；
     * 而补丁进来的**那一帧**就要挂上动画，等 effect 会晚一帧（卡片先原地出现再跳）。
     * ⚠️ `landTick` 只是「到点重渲染」的触发器：类与高度都靠上面的时间判重算。 */
    var landState = React.useState(0)
    var landTick = landState[0] /* eslint-disable-line no-unused-vars */
    var setLandTick = landState[1]
    var storeLand = (c && c.landAt) || 0
    var landAge = storeLand ? (Date.now() - storeLand) : Infinity
    var landing = list.length > 0 && landAge < K.landMs
    /* ★ PC `.cp-tail` 起录才展开：文字创建只升卡片，不能把列表顶起半屏。
     * v1.8：识别中也算在「这一轮语音」里 —— 降落区这时候塌下去，刚说完话的界面会抖一下。 */
    var landVoice = !!(c && c.landFrom === 'voice')
    var tailOn = open && (recOn || asrOn || (landVoice && landAge < K.tailHold))
    var tailLit = open && landVoice && landAge < K.tailLit
    var tailSnap = open && (recOn || asrOn)
    function scrollListBottom(smooth) {
      var el = drawerRef.current
      if (!el) return
      var top = (el.scrollHeight || 0) - (el.clientHeight || 0)
      if (!(top > 0)) return
      if (smooth && typeof el.scrollTo === 'function') el.scrollTo({ top: top, behavior: 'smooth' })
      else el.scrollTop = top
    }

    /* ---- content-area measurement ---- */
    React.useEffect(function () {
      var alive = true, raf = null, ro = null, mo = null, timer = null, composerEl = null
      function observeComposer() {
        if (!ro || typeof document === 'undefined' || typeof document.querySelector !== 'function') return
        var next = null
        try { next = document.querySelector('[data-composer-card]') } catch (e) { next = null }
        if (!next || next === composerEl) return
        if (composerEl) { try { ro.unobserve(composerEl) } catch (e) {} }
        composerEl = next
        try { ro.observe(next) } catch (e) { composerEl = null }
      }
      function apply() {
        raf = null
        if (!alive) return
        observeComposer()
        var next = measureBounds()
        if (!next) return
        setBounds(function (prev) { return sameBounds(prev, next) ? prev : next })
      }
      function schedule() {
        if (raf != null) return
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          raf = window.requestAnimationFrame(apply)
        } else {
          raf = setTimeout(apply, 0)
        }
      }
      schedule()
      var retry = []
      if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
        retry = [window.setTimeout(schedule, 120), window.setTimeout(schedule, 600), window.setTimeout(schedule, 1600)]
      }
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', schedule)
        window.addEventListener('focusin', schedule, true)
        window.addEventListener('pointerdown', schedule, true)
      }
      var frame = null, center = null
      if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
        var overlay = document.querySelector('[data-shell-overlay]')
        frame = overlay && overlay.parentElement
        try {
          var rb = frame && frame.querySelector('[data-rightbar-col]')
          center = rb && rb.previousElementSibling
        } catch (e) { center = null }
      }
      if (typeof window !== 'undefined' && window.ResizeObserver) {
        try {
          ro = new window.ResizeObserver(schedule)
          if (frame) ro.observe(frame)
          if (center) ro.observe(center)
          /* 输入框长高 / 收短时也要重新量，底部默认位置才能一直让开它。 */
          observeComposer()
        } catch (e) { ro = null }
      }
      /* 插件页 ⇄ 会话切换会替换 centerCol 的直接子节点；只在直接子节点上
       * 挂 MutationObserver，流式输出不会触发它。 */
      if (typeof window !== 'undefined' && window.MutationObserver && center) {
        try {
          mo = new window.MutationObserver(schedule)
          mo.observe(center, { childList: true })
        } catch (e) { mo = null }
      }
      /* 会话是异步恢复的：输入框可能晚于挂载出现。低频兜底测量一次，
       * 保证默认位置始终让开输入框；组件卸载时清掉。 */
      if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
        timer = window.setInterval(schedule, 1500)
      }
      return function () {
        alive = false
        if (raf != null) {
          if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(raf)
          } else clearTimeout(raf)
        }
        retry.forEach(function (id) { try { clearTimeout(id) } catch (e) {} })
        if (typeof window !== 'undefined' && window.removeEventListener) {
          window.removeEventListener('resize', schedule)
          window.removeEventListener('focusin', schedule, true)
          window.removeEventListener('pointerdown', schedule, true)
        }
        if (ro) { try { ro.disconnect() } catch (e) {} }
        if (mo) { try { mo.disconnect() } catch (e) {} }
        if (timer) { try { clearInterval(timer) } catch (e) {} }
      }
    }, [])

    /* ---- close on outside pointer ----
     * ★ v1.6 · 修「点停止录音 → 整个列表闪退」：录音挡板 stopScrim 的
     * pointerdown 会同步 finishRecord → stopRecord 清 phase → useSyncExternalStore
     * 同步 flush 把挡板从 DOM 摘掉；等事件冒泡到 document 时 event.target 已是
     * 脱离树的节点，root.contains() 返回 false ⇒ 误判「点外面」⇒ closeCapsule()。
     * 两道修正：① 改到**捕获阶段**判断归属（此刻挡板还在树里，composedPath 可用）；
     *          ② 录音态点内容区外只停录、不关列表。 */
    React.useEffect(function () {
      if (!open) return
      if (typeof document === 'undefined' || !document.addEventListener) return
      function onDown(event) {
        var root = rootRef.current
        if (!root || !root.contains) return
        var path = typeof event.composedPath === 'function' ? event.composedPath() : null
        var inside = path ? path.indexOf(root) >= 0 : root.contains(event.target)
        if (inside) return
        var phase = cap().phase
        /* 录音中：这一击是「停止」，不是「关外面」。
         * ★ v1.8：识别中也一样不关 —— 结果还没回来，关掉就等于把刚说的话丢了。 */
        if (phase === 'rec') { finishRecord(); return }
        if (phase === 'asr') return
        closeCapsule()
      }
      document.addEventListener('pointerdown', onDown, true)
      return function () { document.removeEventListener('pointerdown', onDown, true) }
    }, [open])

    /* ---- Escape closes the top-most layer ---- */
    React.useEffect(function () {
      if (!open) return
      if (typeof document === 'undefined' || !document.addEventListener) return
      function onKey(event) {
        if (event.key !== 'Escape') return
        var cur = cap()
        if (!cur.open) return
        event.preventDefault()
        if (cur.previewUri) { patchCap({ previewUri: '' }); return }
        if (cur.deleteOpen) { patchCap({ deleteOpen: false }); return }
        if (cur.editId) { patchCap({ editId: '', editText: '', editImageUri: '' }); return }
        if (cur.todoPick) { patchCap({ todoPick: false, todoOtherOpen: false }); return }
        if (cur.mapPick) { patchCap({ mapPick: false }); return }
        if (cur.composeOpen) { patchCap({ composeOpen: false, composeText: '', composeImage: null }); return }
        if (cur.phase === 'rec') { stopRecord(); return }
        /* 识别中按 Esc 不丢结果（与官方语音输入同一口径：只取消录音，不取消转写） */
        if (cur.phase === 'asr') { event.preventDefault(); return }
        closeCapsule()
      }
      document.addEventListener('keydown', onKey, true)
      return function () { document.removeEventListener('keydown', onKey, true) }
    }, [open])

    /* ---- focus the textarea of the top panel ---- */
    React.useEffect(function () {
      if (!c || !c.open) return
      if (!c.composeOpen && !c.editId) return
      var id = setTimeout(function () {
        if (c.editId && editRef.current) editRef.current.focus()
        else if (c.composeOpen && composeRef.current) composeRef.current.focus()
      }, 0)
      return function () { clearTimeout(id) }
    }, [c && c.composeOpen, c && c.editId])

    /* ---- 录音：降落区瞬时展开 + 列表滑到底（PC 101 / 267 同一套） ----
     * 高度是瞬时长上去的（.is-snap）⇒ 下一帧量到的 max 就是新的底，滚得到真正的底。 */
    React.useEffect(function () {
      if (!open || !recOn) return
      var t = setTimeout(function () { scrollListBottom(false) }, 30)
      return function () { clearTimeout(t) }
    }, [open, recOn])

    /* ---- 新胶囊落位：三个到点重渲染（摘动画类 / 灭灯 / 收降落区）----
     * 720ms 摘 .is-pop（下一次新增才能重播）、900ms 灭灯、2400ms 收降落区并补一次滚底。 */
    React.useEffect(function () {
      if (!open || !storeLand) return
      var timers = [
        setTimeout(function () { setLandTick(storeLand) }, K.landMs + 40),
        setTimeout(function () { setLandTick(storeLand + 1) }, K.tailLit + 40),
        setTimeout(function () { setLandTick(storeLand + 2) }, K.tailHold + 40),
        /* ⚠️ PC 268 轮：落位滚底必须**无动画瞬移**（_scrollBottomTo(false)）。
         * 带 smooth 会把「列表上移」与「卡片升起」叠成两个运动，正是
         * 「没在列表底部停下来」那个反复出现的坏相。 */
        setTimeout(function () { scrollListBottom(false) }, 40),
        setTimeout(function () { scrollListBottom(false) }, K.tailHold + 120)
      ]
      return function () { timers.forEach(function (id) { clearTimeout(id) }) }
    }, [open, storeLand])

    /* ---- align the action column with the selected card ---- */
    useIso(function () {
      if (!c || !c.open || opsHidden) { setOpsTop(null); return }
      var n = opsCount(c, selected)
      var el = drawerRef.current
      if (!n || !el) { setOpsTop(null); return }
      var dr = el.getBoundingClientRect()
      if (!dr || !dr.height) { setOpsTop(null); return }
      var groupH = n * OPS_KEY_H + (n - 1) * OPS_GAP
      var center = !!c.multi || selected.length !== 1
      var target = dr.top + dr.height / 2
      if (!center && selected.length === 1) {
        var card = findCard(el, selected[0])
        if (card) {
          var cr = card.getBoundingClientRect()
          target = cr.top + cr.height / 2
        }
      }
      /* 组底不许压到右侧那条竖排停靠带（写/说两颗键）：上限由 geom().opsLimitBottom 给。
       * 矮内容区里两者加起来放不下时，宁可让组顶到标题带下沿，也不让它们叠在一起。 */
      var limitBottom = Math.min(dr.bottom - 8, g.opsLimitBottom)
      var maxTop = Math.max(dr.top + 8, limitBottom - groupH)
      setOpsTop(clamp(target - groupH / 2, dr.top + 8, maxTop))
    }, [open, opsHidden, c && c.delMode, c && c.multi, c && c.editId, c && c.composeOpen,
      c && c.todoPick, c && c.mapPick, c && c.deleteOpen, c && c.previewUri,
      selectedKey, b.left, b.top, b.width, b.height, g.width, g.opsLimitBottom, ops, page])

    /* ---- fab pointer drag ---- */
    function onFabDown(event) {
      if (event.button !== 0 && event.pointerType === 'mouse') return
      var bb = boundsRef.current || fallbackBounds()
      var u = usableOf(bb)
      var p = pointOf(bb, posRef.current)
      movedRef.current = false
      dragRef.current = {
        id: event.pointerId, startX: event.clientX, startY: event.clientY,
        x: p.x, y: p.y, w: u.w, h: u.h
      }
      try { event.currentTarget.setPointerCapture(event.pointerId) } catch (e) {}
      /* 打开态浮键停靠在抽屉角落、拖不动 ⇒ 不必闪一下抓手光标（.is-dragging
       * 会把 cursor 换成 grabbing、并把位移过渡清零）。dragRef 仍然记下来，
       * 松手那条链要靠它分辨"点了一下"还是"拖过"。 */
      if (!cap().open) setDragging(true)
      event.preventDefault()
    }
    function onFabMove(event) {
      var d = dragRef.current
      if (!d || d.id !== event.pointerId) return
      /* 打开态浮键是"停靠"的（钉在抽屉右下角），拖动没有落点：抽屉已占满
       * 右下角，拖出去只会回到原位。这里直接不吃移动 —— movedRef 保持 false，
       * 松手仍按"点一下"处理，不会把一次点击误存成位置。 */
      if (cap().open) return
      var bb = boundsRef.current || fallbackBounds()
      var u = usableOf(bb)
      var dx = event.clientX - d.startX
      var dy = event.clientY - d.startY
      if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true
      var nx = clamp(d.x + dx, bb.left + FAB_MARGIN, bb.left + FAB_MARGIN + u.w)
      var ny = clamp(d.y + dy, bb.top + FAB_MARGIN, bb.top + FAB_MARGIN + u.h)
      var next = {
        x: u.w ? clamp((nx - bb.left - FAB_MARGIN) / u.w, 0, 1) : 0,
        y: u.h ? clamp((ny - bb.top - FAB_MARGIN) / u.h, 0, 1) : 0
      }
      setPos(next)
    }
    function onFabUp(event) {
      var d = dragRef.current
      if (!d || d.id !== event.pointerId) return
      dragRef.current = null
      setDragging(false)
      try { event.currentTarget.releasePointerCapture(event.pointerId) } catch (e) {}
      if (movedRef.current) {
        movedRef.current = false
        savePos(posRef.current || defaultPos(boundsRef.current || fallbackBounds()))
        return
      }
      var cur = cap()
      if (cur.open && cur.phase === 'rec') { finishRecord(); return }
      if (cur.open && cur.phase === 'asr') return
      if (cur.open) { startRecord(); return }
      openCapsule('')
    }
    function onFabCancel() {
      dragRef.current = null
      movedRef.current = false
      setDragging(false)
    }
    function onFabKey(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      var cur = cap()
      if (cur.open && cur.phase === 'rec') { finishRecord(); return }
      if (cur.open && cur.phase === 'asr') return
      if (cur.open) { startRecord(); return }
      openCapsule('')
    }

    /* ---- card / list handlers ---- */
    function onCardClick(id) {
      var cur = cap()
      var sel = cur.selected || []
      if (cur.multi) {
        patchCap({ selected: sel.indexOf(id) >= 0 ? sel.filter(function (x) { return x !== id }) : sel.concat([id]) })
      } else {
        patchCap({
          selected: sel.length === 1 && sel[0] === id ? [] : [id],
          editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false, mapPick: false,
          deleteOpen: false, previewUri: ''
        })
      }
    }
    function onListScroll(e) {
      var cur = cap()
      if (!cur.open) return
      if ((cur.selected || []).length) patchCap({ selected: [] })
      /* 196 轮：已删除名单滚到底接着铺。必须拿「用户真的滚过」的证据
       * （scrollTop>0），否则内容没撑满容器时首帧就会自己铺到底。 */
      if (hasMore && e && e.target) {
        var el = e.target
        if (el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
          setPage(page + 1)
        }
      }
    }
    function switchDeleted(on) {
      /* 换名单回到列表顶部并重头分页，与 PC onShowDeleted/onBackAlive 同口径。 */
      setPage(1)
      if (drawerRef.current) drawerRef.current.scrollTop = 0
      patchCap({ delMode: !!on, selected: [], multi: false, editId: '', editText: '', editImageUri: '',
        todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
    }
    function toggleMulti() {
      patchCap({ multi: !cap().multi, editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false,
        mapPick: false, deleteOpen: false, previewUri: '' })
    }
    function openTodoPick() {
      var id = selected[0]
      var x = id ? Core.byId(s.capsules, id) : null
      if (!x) return
      patchCap({
        todoPick: true, todoOtherOpen: false, mapPick: false, editId: '', editImageUri: '', composeOpen: false, deleteOpen: false,
        previewUri: '', todoText: x.text || '',
        todoProjectId: (Core.activeProjects(s)[0] || {}).id || '', todoUrgency: 'mid'
      })
    }
    async function convertTodo() {
      var cur = cap()
      if (cur.todoBusy) return
      var text = String(cur.todoText || '').trim()
      if (!text) { B.toast('待办内容不能为空', 'danger'); return }
      if (!cur.todoProjectId) { B.toast('先选择归属项目', 'danger'); return }
      if (!selected.length) { B.toast('先选中一条闪念', 'danger'); return }
      patchCap({ todoBusy: true })
      var ok = await B.actions.promoteToTodo([selected[0]], {
        text: text, projectId: cur.todoProjectId, urgency: cur.todoUrgency || 'mid'
      })
      patchCap({ todoBusy: false })
      if (ok) {
        patchCap({ todoPick: false, todoOtherOpen: false, selected: [], delMode: false })
        B.toast('已转成待办')
      }
    }
    async function convertMap(m) {
      if (!m || cap().mapBusy) return
      if (Core.mindmapGateOf(m)) { B.toast(Core.GATE_TIP[Core.mindmapGateOf(m)] || '这张脑图暂时不能选', 'danger'); return }
      patchCap({ mapBusy: m.id })
      await B.loadTree(m.id)
      var ok = await B.actions.promoteToMindmap(m.id, selected)
      patchCap({ mapBusy: '' })
      if (!ok) return
      patchCap({ mapPick: false, mapPickedId: '', selected: [] })
      B.toast('已转脑图')
      if (typeof document !== 'undefined' && document.querySelector && document.querySelector('.at-root')) {
        V.openDetail('mindmap', m.id)
      }
    }
    async function aiMap() {
      if (!selected.length || cap().mapBusy) return
      patchCap({ mapBusy: 'ai' })
      var ok = await B.actions.promoteToMindmapAi(selected)
      patchCap({ mapBusy: '' })
      if (ok) patchCap({ mapPick: false, mapPickedId: '', selected: [] })
    }
    /* ★★ v1.5 · PC 的「选中 ＋ 确定」两步（`onMapMark` / `onMapConfirm`）：
     * 以前插件点一张卡就直接转，和 PC 的确认模式不是一回事。
     * lead 卡（'__ai__'）走 AI 语义转脑图，其余按 pickedId 找图。 */
    function confirmMapPicked() {
      var picked = cap().mapPickedId || ''
      if (!picked || cap().mapBusy) return
      if (picked === '__ai__') { aiMap(); return }
      var m = Core.byId(s.mindmaps, picked)
      if (m) convertMap(m)
    }
    function pickMap(id) { patchCap({ mapPickedId: id }) }
    function exportSelected() {
      if (!selected.length) { B.toast('先选中一条闪念'); return }
      var parts = selected.map(function (id) {
        var x = Core.byId(s.capsules, id)
        if (!x) return ''
        var line = String(x.text || '')
        if (x.imageUri) {
          line += (line ? '\n\n' : '') + '![闪念图片](' + V.imgSrc(s, x.imageUri) + ')'
        }
        return line
      }).filter(Boolean)
      var md = parts.join('\n\n---\n\n')
      B.copyText(md).then(function (ok) {
        B.toast(ok ? '已复制 ' + selected.length + ' 条闪念' : '复制失败，请重试', ok ? 'default' : 'danger')
      })
    }
    async function confirmDelete() {
      if (!selected.length) { patchCap({ deleteOpen: false }); return }
      var ids = selected.slice()
      var ok = await B.actions.removeCapsules(ids)
      patchCap({ deleteOpen: false })
      if (ok) patchCap({ selected: [], delMode: false })
    }
    function restoreSelected() {
      if (!selected.length) return
      var ids = selected.slice()
      B.actions.restoreCapsules(ids).then(function (ok) {
        if (ok) patchCap({ selected: [] })
      })
    }
    function startEdit(id) {
      var target = id || (selected.length === 1 ? selected[0] : '')
      if (!target) return
      var x = Core.byId(s.capsules, target)
      if (!x) return
      patchCap({ selected: [x.id], multi: false,
        editId: x.id, editText: x.text || '', editImageUri: x.imageUri || '',
        composeOpen: false, todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
    }
    function clearLongPress() {
      if (longRef.current) { clearTimeout(longRef.current); longRef.current = null }
    }
    /* ★ PC 302 轮 onLongPress：桌面 / 平板长按卡片 = 进编辑（手机端长按才是导出）。
     * 只认卡片自己的 pointer 链；编辑态、录音态、已删除名单里一律不触发。 */
    function onCardDown(id, e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      clearLongPress()
      longRef.current = setTimeout(function () {
        longRef.current = null
        var cur = cap()
        if (cur.editId || cur.phase === 'rec' || cur.delMode || cur.composeOpen) return
        startEdit(id)
      }, LONG_PRESS_MS)
    }
    React.useEffect(function () { return clearLongPress }, [])
    async function saveEdit() {
      var cur = cap()
      if (!cur.editId) return
      var text = String(cur.editText || '').trim()
      if (!text) { B.toast('闪念内容不能为空', 'danger'); return }
      var ok = await B.actions.updateCapsule(cur.editId, {
        text: text, imageUri: cur.editImageUri || null
      })
      if (ok) {
        patchCap({ editId: '', editText: '', editImageUri: '' })
        B.toast('已保存')
      }
    }
    function pickEditImage() {
      V.pickImage(async function (file) {
        try {
          var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
          patchCap({ editImageUri: uri })
        } catch (e) { B.toast(e.message, 'danger') }
      })
    }
    function pickComposeImage() {
      V.pickImage(async function (file) {
        try {
          var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
          patchCap({ composeImage: uri })
        } catch (e) { B.toast(e.message, 'danger') }
      })
    }
    function actionDisabled(key) {
      if (c.delMode) return !selected.length
      if (!selected.length) return true
      if (key === 'edit' || key === 'todo') return !!c.multi || selected.length !== 1
      return false
    }

    /* ---- pieces ---- */
    /* 统一基线：小程序令牌 → DSH 宿主令牌 → 补充令牌 → 通用状态 / 动效；
     * 再追加胶囊皮肤。以前这里只写 U.themeCss()，胶囊与工作台是两套皮肤。 */
    var styleTag = h('style', null, St.base(dark) + STYLE)
    /* ★ 副抽屉（写 / 编辑 / 转待办 / 转脑图）打开时整组停靠带收起：
     * 浮键 z 149/150 > 副抽屉 141，留着就正好盖在面板底键上。 */
    var fab = railHidden ? null : h('button', {
      type: 'button',
      className: 'at-cx-fab' + (dragging ? ' is-dragging' : '') + (open ? ' is-docked' : '')
        + (c && c.open && c.phase === 'rec' ? ' is-rec' : '')
        + (asrOn ? ' is-asr' : ''),
      style: { left: pnt.x + 'px', top: pnt.y + 'px' },
      title: c && c.open && c.phase === 'rec' ? '停止录音'
        : asrOn ? '正在识别…'
          : c && c.open ? '开始录音（拖动可移动）' : '打开闪念胶囊（拖动可移动）',
      'aria-label': c && c.open && c.phase === 'rec' ? '停止录音'
        : asrOn ? '正在识别' : c && c.open ? '开始录音' : '打开闪念胶囊',
      onPointerDown: onFabDown, onPointerMove: onFabMove, onPointerUp: onFabUp,
      onPointerCancel: onFabCancel, onKeyDown: onFabKey
    },
      c && c.open && c.phase === 'rec'
        ? h('span', { className: 'at-cx-fab-clock' }, c.clock || '60')
        : asrOn
          /* 识别中：40 方键里给三个点，读起来是「在转写」而不是「还能再录一次」 */
          ? h('span', { className: 'at-cx-fab-clock is-dots' }, '···')
          : c && c.open
            /* PC 横屏 `.rail-brand-mic`：40 方键里 22 的麦克风 */
            ? h(U.Icon, { name: 'voice', size: K.fabMic, tone: 'ink' })
            : h('img', { className: 'at-cx-fab-img', src: '/agent-todo/assets/logo.png',
              width: K.fabIcon, height: K.fabIcon, alt: 'Agent ToDo', draggable: false }))

    var writeFab = open && !railHidden && c.phase !== 'rec' && c.phase !== 'asr' ? h('button', {
      type: 'button', className: 'at-cx-write', style: { left: writeLeft + 'px', top: writeTop + 'px' },
      title: '写一条闪念', 'aria-label': '写一条闪念', onClick: openCompose
    }, h(U.Icon, { name: 'edit', size: K.writeIcon })) : null

    var maskStyle = { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }
    var mask = open ? h('div', { className: 'at-cx-mask', style: maskStyle,
      /* 点挡板空白处关列表（移除标题 × 后这条通道必须一直可用）；
       * 录音 / 识别中由 stopScrim 与相守卫接管，这一击不许顺手关掉列表。 */
      onPointerDown: function (e) {
        var phase = cap().phase
        if (e.target === e.currentTarget && phase !== 'rec' && phase !== 'asr') closeCapsule()
      } }) : null

    var cards = visible.map(function (x, idx) {
      var isSel = selected.indexOf(x.id) >= 0
      var isEditing = !!(c && c.editId === x.id)
      var isFail = !!x.failed
      /* PC `_popId` 精确指定新建那一条；语音路径拿不到服务端 id 时兜底「最后一条」
       * （列表按 createdAt 升序，新卡恒在末尾，且每次落位都会重置 landAt）。 */
      var popId = (c && c.landId) || ''
      var isPop = landing && (popId ? x.id === popId : idx === visible.length - 1)
      /* PC 模板口径：item.text || (failed ? '没听清，长按补字' : '语音识别中')。
       * 插件桥接目前不回传 recognizing / failed，故用「语音来源且正文为空」兜底识别中；
       * 两条字段一旦由数据侧给出，这里自动走真值，模板不必再改。 */
      var isWait = !!x.recognizing || (!x.text && x.source === 'voice' && !isFail)
      var text = x.text || (isFail ? '没听清，长按补字' : isWait ? '语音识别中' : '（这条还是空的）')
      var picSrc = x.imageUri ? V.imgSrc(s, x.imageUri) : ''
      return h('button', {
        key: x.id, type: 'button', 'data-cid': x.id,
        className: 'at-cx-card' + (isSel ? ' is-sel' : '') + (isEditing ? ' is-editing' : '')
          + (c.delMode ? ' is-del' : '') + (isWait ? ' is-wait' : '') + (isFail ? ' is-fail' : '')
          + (isPop ? ' is-pop' : ''),
        'aria-pressed': isSel,
        onClick: function () { onCardClick(x.id) },
        onPointerDown: function (e) { onCardDown(x.id, e) },
        onPointerUp: clearLongPress, onPointerLeave: clearLongPress, onPointerCancel: clearLongPress,
        onContextMenu: function (e) { e.preventDefault(); clearLongPress() }
      },
        h('span', { className: 'at-cx-card-text' }, text),
        /* PC 263 轮 .cp-pic：148 高裁图 ＋ 右下「看大图」角标，正文之下、时间之上。 */
        picSrc ? h('span', { className: 'at-cx-card-pic', 'aria-label': '看大图',
          onClick: function (e) { e.stopPropagation(); patchCap({ previewUri: picSrc }) } },
          h('img', { src: picSrc, alt: '闪念截图', draggable: false }),
          h('span', { className: 'at-cx-card-zoom' }, '看大图')) : null,
        h('span', { className: 'at-cx-card-meta' },
          h('span', null, Core.atMin(x.createdAt)),
          h('span', null, '·'),
          h('span', null, x.source === 'voice' ? '语音' : '文字'),
          x.imageUri ? h('span', null, '· 1 张图') : null),
        /* 302 轮整卡霜白遮罩：只在「重录上传中」这一档出现（插件桥接暂不产生该态）。 */
        x.voiceEditPhase === 'up' ? h('span', { className: 'at-cx-vmask' },
          h('span', { className: 'at-cx-vmask-t' }, '语音识别中')) : null)
    })

    var hollow = open ? h('button', {
      type: 'button', className: 'at-cx-hollow',
      onClick: function () { switchDeleted(!c.delMode) }
    },
      h(U.Icon, { name: c.delMode ? 'chevron-left' : 'trash', size: 14, opacity: .62 }),
      h('span', { className: 'at-cx-hollow-t' }, c.delMode ? '返回正常列表' : '已删除胶囊'),
      !c.delMode && deletedCount ? h('span', { className: 'at-cx-hollow-n' }, deletedCount + ' 条') : null,
      c.delMode ? null : h(U.Icon, { name: 'chevron-right', size: 12, opacity: .45 })) : null

    /* ★ PC 280d：平板 / PC 空态是一句说明文字，不是手机端那个图标块 + 虚框；
     * 位置排在空心卡之后（先入口、后解释）。文案只把方位词换成 DSH 可拖动悬浮键。 */
    var empty = open && !list.length ? h('div', { className: 'at-cx-empty' },
      c.delMode
        ? '还没有删除的胶囊。这里只有手动删除的那些 —— 被「转待办 / 转脑图」带走的不会出现在这儿。'
        : '还没有接住的闪念。点那颗黄色麦克风，张口说一句就行 —— 等坐到电脑前再整理。') : null

    /* 195 / 196 轮：已删除名单分页尾行；正常名单不分页（收件箱不该藏条目）。 */
    var more = open && (hasMore || allShown)
      ? (hasMore
        ? h('button', { type: 'button', className: 'at-cx-more',
          onClick: function () { setPage(page + 1) } }, '点击加载更多')
        : h('div', { className: 'at-cx-more is-end' }, '已无更多信息')) : null
    var endGap = open ? h('div', { className: 'at-cx-endgap' }) : null

    /* 录音行：267 轮一行三件 [倒数][波纹] ──── [轻点任意处停止]。
     * v1.4 起它住在降落区底部（PC `.cp-tail` 里那一块），不再横在标题带下面。 */
    var tailRec = recOn ? h('div', { className: 'at-cx-rec' },
      h('span', { className: 'at-cx-rec-num' }, (c.clock || '60') + 's'),
      h('span', { className: 'at-cx-wave' }, [1, 2, 3, 4, 5].map(function (i) {
        return h('i', { key: i })
      })),
      h('span', { className: 'at-cx-rec-t' }, '轻点任意处停止')) : null

    /* 识别中：同一行换一句话，波纹继续摆 —— 采集已经停了，这里的摆动只是「在转写」。 */
    var tailAsr = asrOn ? h('div', { className: 'at-cx-rec is-asr' },
      h('span', { className: 'at-cx-wave is-asr' }, [1, 2, 3, 4, 5].map(function (i) {
        return h('i', { key: i })
      })),
      h('span', { className: 'at-cx-rec-t' }, '正在转成文字…')) : null

    /* ★ PC `.cp-tail`：0 → 42% 抽屉高的一块黄族渐变，起录瞬时展开、新卡落位点亮、
     * 用户碰列表才收。它是 flex 项 ⇒ 展开时**列表整体变矮**（＝PC「列表上滑」）。 */
    var tailEl = open ? h('div', {
      className: 'at-cx-tail' + (tailSnap ? ' is-snap' : '') + (tailLit ? ' is-lit' : ''),
      style: { height: (tailOn ? g.tailH : 0) + 'px' }
    }, recOn ? tailRec : tailAsr) : null

    /* 302 轮 .cp-stop-scrim：全内容区透明挡板，点任意处即停。
     * ★ v1.6：停止动作放 **pointerup**，不在 pointerdown 里改 phase —— 否则挡板
     * 会在同一次 pointerdown 的冒泡途中被同步卸载，document 的外部关闭监听把这一击
     * 误判成「点外面」。透明＝不遮视觉，只接管点击；层级压过悬浮键。 */
    var stopScrim = open && recOn ? h('div', { className: 'at-cx-stop-scrim', style: maskStyle,
      onPointerUp: function (e) {
        if (e.target === e.currentTarget) finishRecord()
      } }) : null



    var opsEl = ops ? h('div', {
      className: 'at-cx-ops' + (g.inside ? ' is-inside' : ''),
      style: {
        left: (g.inside ? (b.left + b.width - g.pad - g.opsW) : g.opsLeft) + 'px',
        top: (opsTop == null ? g.top + Math.max(0, (g.height - opsGroupH) / 2) : opsTop) + 'px',
        width: g.opsW + 'px',
        paddingLeft: g.inside ? '0' : '8px'
      },
      role: 'toolbar', 'aria-label': '闪念操作'
    },
      c.delMode
        ? opButton('restore', 'w-undo', '还原', false, restoreSelected)
        : [
          opButton('delete', 'w-trash', '删除', actionDisabled('delete'), function () { patchCap({ deleteOpen: true }) }, true),
          opButton('edit', 'w-edit', '编辑', actionDisabled('edit'), function () { startEdit() }),
          opButton('export', 'w-export', '导出', actionDisabled('export'), exportSelected),
          opButton('todo', 'w-todo', '转待办', actionDisabled('todo'), openTodoPick),
          opButton('mindmap', 'w-mindmap', '转脑图', actionDisabled('mindmap'), function () {
            patchCap({ mapPick: true, mapPickedId: '', todoPick: false, todoOtherOpen: false,
              editId: '', editText: '', editImageUri: '', composeOpen: false })
          })
        ]) : null

    function opButton(key, icon, label, disabled, onClick, danger) {
      return h('button', { key: key, type: 'button',
        className: 'at-cx-op' + (disabled ? ' is-dim' : '') + (danger ? ' is-danger' : ''),
        disabled: !!disabled, title: label, 'aria-label': label, onClick: onClick },
        h(U.Icon, { name: icon, size: g.inside ? 17 : 15, tone: 'white' }),
        g.inside ? null : h('span', null, label))
    }

    var drawer = open ? h(U.Dialog, {
      as: 'aside', className: 'at-cx-drawer' + (turned ? ' is-turned' : ''),
      role: 'dialog', 'aria-label': '闪念胶囊',
      style: { left: g.left + 'px', top: g.top + 'px', width: g.width + 'px', height: g.height + 'px' }
    },
      h('div', { className: 'at-cx-head' },
        h('span', { className: 'at-cx-title' }, (c.delMode ? '已删除胶囊-' : '闪念胶囊-') + list.length),
        h('div', { className: 'at-cx-head-r' },
          /* 194 轮：恒亮面功能键不铺底 + 恒墨描边；图标 tone=ink，深色下不会消失。
           * 生效态换 w-check 反白版，与 PC「多选」两态逐值同源。 */
          /* ★ v1.6 · 移除标题带右上角的「关闭」× —— PC 端点击卡片周围任意空白处
           * 即可关闭列表（at-cx-mask / document 外部监听 / Esc 三套独立通道都在），
           * 这颗键冗余；「编辑」面板同类按钮按同一结论一并移除。 */
          h('button', { type: 'button', className: 'at-cx-hbtn' + (c.multi ? ' is-on' : ''),
            title: c.multi ? '退出多选' : '多选', 'aria-label': '多选', onClick: toggleMulti },
            h(U.Icon, { name: c.multi ? 'w-check' : 'check', size: 14, tone: 'ink' }),
            h('span', null, '多选')))),
      h('div', { className: 'at-cx-list', ref: drawerRef, onScroll: onListScroll,
        style: g.inside ? { paddingRight: (g.opsW + 18) + 'px' } : null },
        hollow, empty, cards, more, endGap),
      tailEl) : null

    /* ---- 右侧副抽屉：写 / 转待办 / 转脑图（PC .ep / .cp-sheet.sub 同族） ----
     * 位置与宽度由 geom() 给：260 副弹窗、主抽屉右缘 +12（房间不足才退到重叠 50），
     * 高度随内容、max-height 夹在内容区内；不再用全高 320。 */
    var subOpen = !!(c && (c.todoPick || c.mapPick || c.composeOpen))
    var subStyle = { left: g.subLeft + 'px', top: g.subTop + 'px', width: g.subWidth + 'px',
      height: 'auto', maxHeight: g.subMaxHeight + 'px' }
    var subMask = subOpen ? h('div', { className: 'at-cx-submask',
      style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
      onPointerDown: function (e) {
        if (e.target !== e.currentTarget) return
        patchCap({ todoPick: false, todoOtherOpen: false, mapPick: false, composeOpen: false, composeText: '', composeImage: null })
      } }) : null

    var composeDrawer = c && c.composeOpen ? h(U.Dialog, {
      as: 'aside', className: 'at-cx-sub is-compose', role: 'dialog', 'aria-label': '写一条闪念', style: subStyle
    },
      h('div', { className: 'at-cx-sub-head' },
        h('span', { className: 'at-cx-sub-title' }, '写一条闪念'),
        h('button', { type: 'button', className: 'at-cx-hclose', title: '关闭', 'aria-label': '关闭',
          onClick: function () {
            patchCap({ composeOpen: false, composeText: '', composeImage: null })
          } }, h(U.Icon, { name: 'close', size: 14 }))),
      h('div', { className: 'at-cx-sub-body' },
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '闪念内容'),
          h('textarea', { ref: composeRef, className: 'at-cx-area', value: c.composeText || '',
            placeholder: '记一条闪念…', 'aria-label': '闪念内容',
            onChange: function (e) { patchCap({ composeText: e.target.value }) } })),
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '配图'),
          h('div', { className: 'at-cx-row' },
            c.composeImage ? h('div', { className: 'at-cx-edit-imgwrap' },
              h('img', { className: 'at-cx-edit-thumb', src: V.imgSrc(s, c.composeImage), alt: '闪念配图' }),
              h('button', { type: 'button', className: 'at-cx-edit-imgx', title: '移除图片',
                'aria-label': '移除图片', onClick: function () { patchCap({ composeImage: null }) } }, '×')) : null,
            h('button', { type: 'button', className: 'at-cx-btn', onClick: pickComposeImage },
              h(U.Icon, { name: 'album', size: 14 }), c.composeImage ? '换一张' : '添加图片'))),
        h('div', { className: 'at-cx-hint' }, '保存后这条闪念会出现在列表末尾。')),
      h('div', { className: 'at-cx-sub-foot' },
        h('button', { type: 'button', className: 'at-cx-btn',
          onClick: function () {
            patchCap({ composeOpen: false, composeText: '', composeImage: null })
          } }, '取消'),
        h('button', { type: 'button', className: 'at-cx-btn is-primary', disabled: c.saving,
          onClick: saveCompose }, c.saving ? '保存中…' : '记下来'))) : null

    /* ★★ v1.5 · 转待办 ＝ PC `form-drawer` 的 `.sd.o1`（L2 表单抽屉），不是自绘面板：
     *   · 标题带「记一条待办」＋ 右上 28 高「取消」胶囊（`.sd-cancel`）；
     *   · 三个字段：待办内容 / 紧急程度（四档 chip）/ 归属项目（**一行一个项目行**）；
     *   · 底部 56 只一颗主键「保存待办」（`.sd-submit`）；抽屉里不留说明文字。
     * 归属项目按 PC `forms.projectOptions` 的 `tinted` 分流：着色的进主列表，
     * 无色的从「选择其他项目」进子列表 —— 插件 806 宽放不下第三档 `.sd3` 抽屉，
     * 故降级为**同一面板内换一页**（选中即回填自动收掉），差异写进样式标准 §8。 */
    var projects = Core.activeProjects(s)
    var tintedProjects = projects.filter(function (p) { return !!(p.color && C.colorOf(p.color)) })
    var plainProjects = projects.filter(function (p) { return !(p.color && C.colorOf(p.color)) })
    var plainPicked = plainProjects.filter(function (p) { return p.id === (c && c.todoProjectId) })[0]
    function projectRow(p) {
      var on = c.todoProjectId === p.id
      return h('button', { key: p.id, type: 'button',
        className: 'at-cx-proj' + (on ? ' is-on' : ''), 'aria-pressed': on,
        onClick: function () { patchCap({ todoProjectId: p.id, todoOtherOpen: false }) } },
        h('span', { className: 'at-cx-proj-dot', style: { background: projectColor(p) } }),
        h('span', { className: 'at-cx-proj-t' }, p.name),
        on ? h('span', { className: 'at-cx-proj-go' }, h(U.Icon, { name: 'check', size: 14 })) : null)
    }
    var cancelTodo = function () { patchCap({ todoPick: false, todoOtherOpen: false }) }
    var todoDrawer = c && c.todoPick ? h(U.Dialog, {
      as: 'aside', className: 'at-cx-sub is-fill is-o1 is-todo',
      role: 'dialog', 'aria-label': '记一条待办',
      style: { left: g.todoLeft + 'px', top: g.subTop + 'px', width: g.todoWidth + 'px',
        height: g.height + 'px' }
    },
      h('div', { className: 'at-cx-sub-head' },
        h('span', { className: 'at-cx-sub-title' }, '记一条待办'),
        h('button', { type: 'button', className: 'at-cx-hcancel', title: '取消',
          'aria-label': '取消', onClick: cancelTodo },
          h(U.Icon, { name: 'close', size: 13, opacity: .65 }), h('span', null, '取消'))),
      h('div', { className: 'at-cx-sub-body' },
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '待办内容', h('span', { className: 'at-cx-req' }, '必填')),
          h('textarea', { className: 'at-cx-area', value: c.todoText || '',
            placeholder: '用一句话说清要做什么', 'aria-label': '待办内容',
            onChange: function (e) { patchCap({ todoText: e.target.value }) } })),
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '紧急程度', h('span', { className: 'at-cx-req' }, '必填')),
          h('div', { className: 'at-cx-chips' },
            C.URGENCY.map(function (u) {
              var on = (c.todoUrgency || 'mid') === u.key
              var pal = urgencyPalette(u)
              return h('button', { key: u.key, type: 'button',
                className: 'at-cx-chip' + (on ? ' is-on' : ''), 'aria-pressed': on,
                style: on ? { background: pal.soft, borderColor: pal.main, color: pal.text } : null,
                onClick: function () { patchCap({ todoUrgency: u.key }) } }, u.name)
            }))),
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '归属项目', h('span', { className: 'at-cx-req' }, '必填')),
          h('div', { className: 'at-cx-proj-list' },
            c.todoOtherOpen
              ? [h('button', { key: 'back', type: 'button', className: 'at-cx-proj is-pick',
                  onClick: function () { patchCap({ todoOtherOpen: false }) } },
                  h(U.Icon, { name: 'chevron-left', size: 16 }),
                  h('span', { className: 'at-cx-proj-t' }, '返回项目列表'))]
                .concat(plainProjects.length ? plainProjects.map(projectRow)
                  : [h('div', { key: 'none', className: 'at-cx-hint' }, '没有其它项目了。')])
              : tintedProjects.map(projectRow).concat([
                h('button', { key: 'other', type: 'button',
                  className: 'at-cx-proj is-pick' + (plainPicked ? ' is-on' : ''),
                  onClick: function () { patchCap({ todoOtherOpen: true }) } },
                  h(U.Icon, { name: 'project', size: 16 }),
                  h('span', { className: 'at-cx-proj-t' }, plainPicked ? plainPicked.name : '选择其他项目'),
                  h('span', { className: 'at-cx-proj-go' },
                    h(U.Icon, { name: 'chevron-right', size: 14 })))])
          ))),
      h('div', { className: 'at-cx-sub-foot' },
        h('button', { type: 'button', className: 'at-cx-btn is-primary', disabled: c.todoBusy,
          onClick: convertTodo }, c.todoBusy ? '保存中…' : '保存待办'))) : null

    /* ★★ v1.5 · 转脑图 ＝ PC 第二档**脑图选择主弹窗**（`drawers.buildMindmapPick`）：
     *   · 320 全高 / `.o1` 位（与转待办同一副几何）；标题「选择脑图 N」＋ 取消胶囊；
     *   · 顶部 lead 卡「语义转脑图」（模型按语义重组），下面一张图一张卡，
     *     卡上有项目色点 / 格式 / 「当前」标记 / 锁态；
     *   · **先选后确定**（`pickedId` + 「确定」），不是点一张卡就直接转。 */
    var mapPicked = (c && c.mapPickedId) || ''
    var cancelMap = function () { patchCap({ mapPick: false, mapPickedId: '' }) }
    var mapDrawer = c && c.mapPick ? h(U.Dialog, {
      as: 'aside', className: 'at-cx-sub is-fill is-o1 is-map',
      role: 'dialog', 'aria-label': '选择脑图',
      style: { left: g.mapLeft + 'px', top: g.subTop + 'px', width: g.mapWidth + 'px',
        height: g.height + 'px' }
    },
      h('div', { className: 'at-cx-sub-head' },
        h('span', { className: 'at-cx-sub-title' }, '选择脑图 ' + s.mindmaps.length),
        h('button', { type: 'button', className: 'at-cx-hcancel', title: '取消',
          'aria-label': '取消', onClick: cancelMap },
          h(U.Icon, { name: 'close', size: 13, opacity: .65 }), h('span', null, '取消'))),
      h('div', { className: 'at-cx-sub-body' },
        h('div', { className: 'at-cx-map-list' },
          h('button', { key: '__ai__', type: 'button',
            className: 'at-cx-map-card is-lead' + (mapPicked === '__ai__' ? ' is-on' : ''),
            'aria-pressed': mapPicked === '__ai__', disabled: !!c.mapBusy,
            onClick: function () { pickMap('__ai__') } },
            h('span', { className: 'at-cx-map-lead-head' },
              h(U.Icon, { name: 'robot', size: 15 }),
              h('span', { className: 'at-cx-map-name' }, '语义转脑图')),
            h('span', { className: 'at-cx-map-desc' },
              '把选中的胶囊交给模型，按语义重组成一张新脑图')),
          s.mindmaps.map(function (m) {
            var gate = Core.mindmapGateOf(m)
            var on = mapPicked === m.id
            var isCur = currentMapId === m.id
            var proj = Core.byId(s.projects, m.projectId)
            var dot = proj ? projectColor(proj) : (dark ? C.NONE_COLOR_DARK : C.NONE_COLOR)
            return h('button', { key: m.id, type: 'button',
              className: 'at-cx-map-card' + (on ? ' is-on' : '') + (gate ? ' is-lock' : ''),
              'aria-pressed': on, disabled: !!c.mapBusy,
              title: gate ? (Core.GATE_TIP[gate] || '这张脑图暂时不能选') : m.name,
              onClick: function () {
                if (gate) { B.toast(Core.GATE_TIP[gate] || '这张脑图暂时不能选', 'danger'); return }
                pickMap(m.id)
              } },
              h('span', { className: 'at-cx-map-name' }, m.name),
              h('span', { className: 'at-cx-map-tags' },
                h('span', { className: 'at-cx-proj-dot', style: { background: dot } }),
                h('span', { className: 'at-cx-map-tag' }, C.formatOf(m.format).label),
                gate ? h('span', { className: 'at-cx-map-tag' },
                  Core.GATE_TIP[gate] || '不可选') : null,
                isCur ? h('span', { className: 'at-cx-map-tag is-current' }, '当前') : null))
          }))),
      h('div', { className: 'at-cx-sub-foot' },
        h('button', { type: 'button', className: 'at-cx-btn is-primary',
          disabled: !mapPicked || !!c.mapBusy, onClick: confirmMapPicked },
          c.mapBusy ? '提交中…' : '确定'))) : null

    /* ---- 编辑闪念：PC 的 260 右侧副弹窗（.ep），几何同由 geom() 给 ---- */
    var editStyle = c && c.editId
      ? { left: g.editLeft + 'px', top: g.editTop + 'px', width: g.editWidth + 'px',
        height: 'auto', maxHeight: g.editMaxHeight + 'px' }
      : null
    var editScrim = c && c.editId ? h('div', { className: 'at-cx-edit-scrim',
      style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
      onPointerDown: function (e) {
        if (e.target === e.currentTarget) patchCap({ editId: '', editText: '', editImageUri: '' })
      } }) : null
    var editPanel = c && c.editId ? h(U.Dialog, {
      as: 'aside', className: 'at-cx-sub', role: 'dialog', 'aria-label': '编辑闪念', style: editStyle
    },
      h('div', { className: 'at-cx-sub-head' },
        /* ★ v1.6 · 同类「取消」× 与主抽屉一并移除：点面板外 / editScrim / Esc 都能退出编辑 */
        h('span', { className: 'at-cx-sub-title' }, '编辑闪念')),
      h('div', { className: 'at-cx-sub-body' },
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '闪念内容'),
          h('textarea', { ref: editRef, className: 'at-cx-area', value: c.editText || '',
            placeholder: '闪念内容', 'aria-label': '编辑闪念',
            onChange: function (e) { patchCap({ editText: e.target.value }) } })),
        h('div', { className: 'at-cx-field' },
          h('span', { className: 'at-cx-label' }, '配图'),
          h('div', { className: 'at-cx-row' },
            c.editImageUri ? h('div', { className: 'at-cx-edit-imgwrap' },
              h('img', { className: 'at-cx-edit-thumb', src: V.imgSrc(s, c.editImageUri), alt: '闪念配图' }),
              h('button', { type: 'button', className: 'at-cx-edit-imgx', title: '移除图片',
                'aria-label': '移除图片', onClick: function () { patchCap({ editImageUri: '' }) } }, '×')) : null,
            h('button', { type: 'button', className: 'at-cx-btn', onClick: pickEditImage },
              h(U.Icon, { name: 'album', size: 14 }), c.editImageUri ? '换一张' : '添加图片'))),
        h('div', { className: 'at-cx-hint' }, '保存后更新这条闪念的正文和配图。')),
      h('div', { className: 'at-cx-sub-foot' },
        /* ★ v1.6 · 底栏只留一颗主键（与转待办 / 转脑图副抽屉同口径），取消走面板外 / Esc */
        h('button', { type: 'button', className: 'at-cx-btn is-primary', onClick: saveEdit }, '保存'))) : null

    var confirm = c && c.deleteOpen ? h('div', {
      className: 'at-cx-modal-layer',
      style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
      onPointerDown: function (e) { if (e.target === e.currentTarget) patchCap({ deleteOpen: false }) }
    },
      h(U.Dialog, { className: 'at-cx-modal', role: 'dialog', 'aria-label': '删除闪念' },
        h('div', { className: 'at-cx-modal-title' }, '删除这条闪念？'),
        h('p', { className: 'at-cx-modal-body' },
          '删除后可以在「已删除胶囊」里还原；被转成待办或脑图的不会出现在回收站。'),
        h('div', { className: 'at-cx-modal-actions' },
          h('button', { type: 'button', className: 'at-cx-btn',
            onClick: function () { patchCap({ deleteOpen: false }) } }, '取消'),
          h('button', { type: 'button', className: 'at-cx-btn is-danger', onClick: confirmDelete }, '删除')))) : null

    var preview = c && c.previewUri ? h('div', {
      className: 'at-cx-preview',
      style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
      onPointerDown: function (e) { if (e.target === e.currentTarget) patchCap({ previewUri: '' }) }
    },
      h('img', { src: c.previewUri, alt: '闪念大图' }),
      h('button', { type: 'button', className: 'at-cx-preview-x', title: '关闭', 'aria-label': '关闭',
        onClick: function () { patchCap({ previewUri: '' }) } },
        h(U.Icon, { name: 'close', size: 15, tone: 'white' }))) : null

    /* 停靠带退进抽屉内部时（内容区太窄放不下 40 方键）才垫底衬：
     * 两颗键横排在左下角，盖住 [说][写] 那一块（130×64），只做视觉。 */
    var dockPlate = open && !railHidden && !g.railOutside ? h('div', { className: 'at-cx-dockplate', style: {
      left: (g.railLeft - 4) + 'px',
      top: (g.railSayTop - 4) + 'px',
      width: (K.fab * 2 + K.dockGap + 8) + 'px',
      height: (K.fab + 8) + 'px'
    } }) : null

    return h('div', { className: 'at-gl at-cx-root', 'data-dark': String(dark), ref: rootRef },
      styleTag, dockPlate, fab, writeFab, mask, drawer, opsEl, subMask, composeDrawer, todoDrawer, mapDrawer,
      editScrim, editPanel, confirm, preview, stopScrim)
  }

  AT.capsule = {
    STYLE: STYLE, FloatingCapsule: FloatingCapsule,
    patchCap: patchCap, openCapsule: openCapsule, closeCapsule: closeCapsule,
    toggleRecord: toggleRecord, openCompose: openCompose,
    startRecord: startRecord, stopRecord: stopRecord, finishRecord: finishRecord,
    saveCompose: saveCompose
  }
})(AT, React, h)
