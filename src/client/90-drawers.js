/* 90-drawers.js — 表单抽屉 ＋ 主面板浮层的统一装配点。
 *
 * ★★ 2026-11-09 轮次 6：筛选（三张列表的「筛选」按钮）也改成右侧展开浮层，
 *    与创建 / 编辑共用 `.at-form-mask` ＋ `.at-drawer` 外壳，由本文件 render() 装配
 *    （真源组件在 55-panes.js 的 AT.panes.FilterDrawer）。功能状态机仍是 ui.filterKind。
 *
 * ★★ 2026-11-09 轮次 5（用户拍板）：**外壳几何与弹窗内展示是两件事**。
 *    · 外壳 ＝ DSH 桌面自己的「右侧展开弹窗」：460 贴右、全高、无圆角、左侧 1px 收边。
 *      用户原话「你之前写的右侧展开弹窗我没意见，我觉得挺好的」。几何真源在
 *      `85-desktop.js`；本文件只留一组非桌面基础值（.sd 等价的 320 / 16 圆角 /
 *      left 84），桌面样式注入后一律被覆盖，**不是最终几何**。
 *    · 弹窗内展示 ＝ 轮次 4 已完成的结构级照抄 `form-drawer.wxml/.wxss` 的 `.sd` PC 档，
 *      本轮一行未动：头 52 / 0 14 / head-bg 底 ＋ head-line 收边，右侧「取消」28 胶囊；
 *      体 `12px 14px 0`，字段 gap 6 / margin-bottom 16 / 标签 13/500，
 *      「必填/可空」是中性 chip 底 muted 字（不借紧急红）；底栏 56 / 10px 14px，
 *      **只有一颗** 36 高 10 圆角的实心主键（w-check 15 ＋ 文案）；
 *      待办＝长高 area-box ＋ 四档 chips ＋ 一行一个项目行，
 *      脑图＝38 输入框 ＋ 项目行 ＋ 六行 46 高带 48×34 缩略图的格式行。
 *    ⚠️ 别再把外壳几何算进「照抄 .sd」：用户指出的是**弹窗内的展示**。
 *    ⚠️ 八模式、v 字段、submit() 落库逻辑、嵌套「新建项目」草稿回填一行未动。
 *    ⚠️ 两处有意差异（不新增功能）：① 小程序「选择其他项目」要开三级副抽屉，
 *      插件没有这套机制，全部活跃项目直接铺成行；② 插件待办表单的「新建项目」
 *      入口在新建态也保留（小程序只在编辑态），它是插件既有的嵌套草稿能力。
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text,
    S = AT.shell, V = AT.views

  var STYLE = [
    /* ── 外壳基础值（仅非桌面场景兜底）───────────────────────────────
     * 桌面层 `85-desktop.js` 会把 left / top / bottom / width / radius / shadow
     * 整体覆盖为「右侧展开弹窗 460 贴右全高」；这几行不是最终几何。 */
    '.at-form-mask{position:absolute;inset:0;z-index:44;background:var(--at-mask)}',
    '.at-drawer{position:absolute;top:16px;bottom:16px;left:84px;width:320px;z-index:45;',
    'display:flex;flex-direction:column;background:var(--at-elevated);',
    'border:1px solid var(--at-hairline);border-radius:16px;box-shadow:var(--at-sh-drawer-l2);overflow:hidden}',
    '.at-drawer.o1{left:354px}',
    '.at-drawer.o2{left:624px}',
    /* ── .sd-head / .sd-title / .sd-cancel ─────────────────────────────── */
    '.at-drawer-head{height:52px;flex:0 0 52px;padding:0 14px;display:flex;align-items:center;',
    'justify-content:space-between;gap:8px;background:var(--at-head-bg);',
    'border-bottom:1px solid var(--at-head-line)}',
    '.at-drawer-title{flex:1;min-width:0;font-size:16px;font-weight:500;color:var(--at-primary);',
    'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
    '.at-drawer .at-sd-cancel{flex:0 0 auto;height:28px;padding:0 12px;border-radius:999px;',
    'border:1px solid var(--at-hairline-strong);background:var(--at-elevated);font-size:13px;',
    'font-weight:500;color:var(--at-slate);display:inline-flex;align-items:center;',
    'justify-content:center;gap:5px;white-space:nowrap;cursor:pointer}',
    '.at-drawer .at-sd-cancel:hover{background:var(--at-chip)}',
    /* ── .sd-body ─────────────────────────────────────────────────────── */
    '.at-drawer-body{flex:1 1 auto;min-height:0;overflow:auto;padding:12px 14px 0}',
    /* 筛选抽屉的体（2026-11-10）：小程序 `.tf-body` 是 `12px 12px 14px` —— 左右比表单
     * 紧 2px、下沿留 14（没有底栏之外的收尾空白）。表单那支仍是 `12 14 0`（贴底栏）。 */
    '.at-drawer-body.at-fd{padding:12px 12px 14px}',
    '.at-drawer-body::-webkit-scrollbar,.at-drawer .at-sd-area-in::-webkit-scrollbar{',
    'appearance:none;width:0;height:0;display:none}',
    /* ── .sd-field / .sd-label / .sd-req,.sd-opt ───────────────────────── */
    '.at-drawer .at-sd-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}',
    '.at-drawer .at-sd-label{font-size:13px;font-weight:500;color:var(--at-primary)}',
    '.at-drawer .at-sd-req,.at-drawer .at-sd-opt{font-style:normal;font-size:11px;',
    'font-weight:400;margin-left:6px;padding:1px 5px;border-radius:999px;',
    'background:var(--at-chip);color:var(--at-muted)}',
    /* 其余六个模式仍用 U.Field：把「必填」em 也收成同一颗中性徽章，一屏只一套语言。 */
    '.at-drawer .at-field-label em{font-style:normal;font-size:11px;font-weight:400;',
    'margin-left:6px;padding:1px 5px;border-radius:999px;background:var(--at-chip);color:var(--at-muted)}',
    '.at-root .at-drawer .at-input,.at-root .at-drawer .at-select{height:38px;',
    'border-radius:10px;font-size:14px}',
    '.at-root .at-drawer .at-textarea{border-radius:10px;font-size:14px;line-height:21px}',
    /* ── .sd-input ────────────────────────────────────────────────────── */
    /* 38 高 / 圆角 10 / 内距 0 10 / 14px / 1px `--at-field-line` —— 与 40-ui 的 `.at-input`
     * 基线逐值一致（小程序 `.sd-input` 也是这套）；聚焦只变描边，不加外圈。 */
    '.at-drawer .at-sd-input{height:38px;border:1px solid var(--at-field-line);border-radius:10px;',
    'padding:0 10px;font-size:14px;color:var(--at-primary);background:var(--at-card);outline:none}',
    '.at-drawer .at-sd-input:focus{border-color:var(--at-text2)}',
    '.at-drawer .at-sd-input::placeholder{color:var(--at-muted);font-size:13px}',
    /* ── .sd-area-box / .sd-area-in（待办正文：随内容长高，最高 2 倍） ───── */
    '.at-drawer .at-sd-area-box{display:flex;flex-direction:column;min-height:104px;width:100%;',
    'border:1px solid var(--at-field-line);border-radius:10px;padding:9px 10px 0;background:var(--at-card)}',
    '.at-drawer .at-sd-area-box:focus-within{border-color:var(--at-text2)}',
    '.at-drawer .at-sd-area-in{width:100%;min-height:93px;padding:0;margin:0;border:0;outline:none;',
    'resize:none;overflow:hidden;scrollbar-width:none;font-size:14px;line-height:21px;',
    'color:var(--at-primary);background:transparent;display:block}',
    '.at-drawer .at-sd-area-in::placeholder{color:var(--at-muted);font-size:13px}',
    /* ── .sd-chips / .sd-chip（选中三色由该档色板 inline 下发） ──────────── */
    '.at-drawer .at-sd-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.at-drawer .at-sd-chip{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;',
    'border-radius:999px;border:1px solid var(--at-hairline);background:var(--at-card);',
    'font-size:13px;color:var(--at-slate);max-width:100%;cursor:pointer}',
    '.at-drawer .at-sd-chip:hover{background:var(--at-chip)}',
    '.at-drawer .at-sd-chip.is-on{font-weight:500}',
    /* ── .sd-list / .sd-row / .sd-cdot / .sd-row-t / .sd-fthumb ─────────── */
    '.at-drawer .at-sd-list{display:flex;flex-direction:column;gap:6px}',
    '.at-drawer .at-sd-row{height:40px;padding:0 12px;border:1px solid var(--at-hairline);',
    'border-radius:10px;background:var(--at-card);display:flex;flex-direction:row;',
    'align-items:center;gap:8px;width:100%;font-size:14px;color:var(--at-primary);',
    'text-align:left;cursor:pointer}',
    '.at-drawer .at-sd-row:hover{background:var(--at-chip)}',
    '.at-drawer .at-sd-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-drawer .at-sd-row.is-on:hover{background:var(--at-yellow-soft);opacity:.82}',
    '.at-drawer .at-sd-row.is-on .at-sd-row-t{font-weight:500}',
    '.at-drawer .at-sd-row.add{color:var(--at-slate)}',
    '.at-drawer .at-sd-row.add .at-sd-row-t{color:var(--at-slate)}',
    '.at-drawer .at-sd-row.fmt{height:46px}',
    '.at-drawer .at-sd-fthumb{width:48px;height:34px;flex:0 0 48px;border-radius:6px;',
    'background:var(--at-chip);object-fit:contain}',
    '.at-drawer .at-sd-cdot{width:16px;height:16px;border-radius:999px;flex:0 0 16px;box-sizing:border-box}',
    /* 「不关联」那一行的色点：空槽画成虚线圈，别用一块空白（读起来像没加载出来）。 */
    '.at-drawer .at-sd-cdot.empty{background:transparent;border:1px dashed var(--at-hairline-strong)}',
    /* 被别的项目占用的颜色行：整行退到 .4 且不可点（禁用态统一档位，FB-01）。
     * ⚠️ 不给 `:hover` 另写底色 —— 反馈三档里 hover 不许换 `--at-card/--at-surface/--at-solid`
     *    （FB-01 会判红）；禁用行靠 `.4` 与 `not-allowed` 已经说清了。 */
    '.at-drawer .at-sd-row.is-off{opacity:.4;cursor:not-allowed}',
    /* 占用提示三段：只有项目名那一段省略 —— 整条一起 ellipsis 会把「占用」两个字吃掉，
     * 屏幕上只剩「已被「rockchip 工具链…」，反而读不出这是"不可选"。 */
    '.at-drawer .at-sd-row-note{flex:0 0 auto;display:inline-flex;min-width:0;',
    'font-size:11px;color:var(--at-muted);white-space:nowrap}',
    '.at-drawer .at-sd-row-note-n{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-drawer .at-sd-row-t{flex:1;min-width:0;font-size:14px;line-height:17px;color:inherit;',
    'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
    /* ── .sd-foot / .sd-submit ─────────────────────────────────────────── */
    '.at-drawer-foot{height:56px;flex:0 0 56px;padding:10px 14px;display:flex;',
    'flex-direction:row;align-items:center;gap:10px}',
    /* ★ 轮次 6：筛选抽屉共用这条底栏，但它**没有提交动作** ⇒ 不放实心主键，
     * 只放「改动即时生效」说明 ＋ 中性清除键。两颗同高 36 / 10 圆角，
     * 与 .sd-submit 保持同一套底栏节奏，不另起第二套皮肤。 */
    '.at-drawer-foot .at-filter-hint{flex:1 1 auto;min-width:0;font-size:12px;color:var(--at-muted)}',
    '.at-drawer-foot .at-btn{height:36px;border-radius:10px;gap:6px}',
    '.at-drawer .at-sd-submit{flex:1;min-width:0;height:36px;border:0;border-radius:10px;',
    'background:var(--at-solid);color:var(--at-on-solid);font-size:14px;font-weight:500;',
    'display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}',
    '.at-drawer .at-sd-submit:hover:not(:disabled){opacity:.82}',
    '.at-drawer .at-sd-submit:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    '.at-drawer .at-sd-submit:disabled{opacity:.4;cursor:not-allowed}',
    /* ── 导出 / 信息增强（2026-11-11 轮次 16）─────────────────────────────
     * 照抄小程序 form-drawer.wxss 的 `.ex-box` / `.ex-text` / `.ex-sw` /
     * `.sd-alt` / `.enh-*` / `.sd-submit.ok`，令牌换成 `--at-*` 登记值：
     *   · 只读预览＝白卡 ＋ 1px hairline ＋ 10 圆角，文本 `white-space:pre-wrap`
     *     （原 `.at-code` 不吃换行，导出的 Markdown 会被压成一坨）；
     *   · 「不含图片」是**整行 44 高的热区**（原 `U.Check` 只是颗小复选框）；
     *   · 「增强」在底栏主键**右侧**、黄底恒墨字（原在正文里当普通按钮）；
     *   · 复制成功态：主键自己变亮绿 ＋「已复制」；
     *   · 增强三态：loading 转圈 / error 成因＋重试 / done 只读结果。
     * ⚠️ 状态类一律 `is-*`（插件 FB-18 口径，不照搬小程序的裸 `.on/.ok/.off`）；
     *    禁用档取插件统一的 `.4`，不引第二套 .45。 */
    '.at-drawer .at-ex-box{border:1px solid var(--at-hairline);border-radius:10px;',
    'padding:10px 12px;background:var(--at-card)}',
    '.at-drawer .at-ex-text{font-size:13px;line-height:1.7;color:var(--at-slate);',
    'white-space:pre-wrap;word-break:break-word;user-select:text}',
    '.at-drawer .at-ex-sw{display:inline-flex;align-items:center;gap:6px;height:44px;',
    'margin-top:2px;padding:0;border:0;background:transparent;font:inherit;',
    'color:var(--at-slate);cursor:pointer}',
    '.at-drawer .at-ex-sw:hover{background:var(--at-chip);border-radius:10px}',
    '.at-drawer .at-ex-sw-box{width:16px;height:16px;flex:0 0 16px;border-radius:5px;',
    'border:1px solid var(--at-hairline-strong);background:var(--at-card);',
    'display:flex;align-items:center;justify-content:center}',
    '.at-drawer .at-ex-sw.is-on .at-ex-sw-box{background:var(--at-solid);',
    'border-color:var(--at-solid)}',
    '.at-drawer .at-ex-sw-ck{font-size:12px;line-height:1;color:var(--at-on-solid)}',
    '.at-drawer .at-ex-sw-t{font-size:13px;color:var(--at-slate)}',
    '.at-drawer .at-ex-sw.is-on .at-ex-sw-t{color:var(--at-primary)}',
    '.at-drawer .at-sd-alt{flex:0 0 auto;height:36px;padding:0 14px;border-radius:10px;',
    'border:1px solid var(--at-yellow);background:var(--at-yellow);',
    'color:var(--at-on-accent);font-size:14px;font-weight:500;',
    'display:flex;align-items:center;justify-content:center;gap:6px;',
    'white-space:nowrap;cursor:pointer}',
    '.at-drawer .at-sd-alt:hover:not(:disabled){background:var(--at-yellow-press);',
    'border-color:var(--at-yellow-press)}',
    '.at-drawer .at-sd-alt:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    '.at-drawer .at-sd-alt:disabled{opacity:.4;cursor:not-allowed}',
    '.at-drawer .at-sd-alt.is-off,.at-drawer .at-sd-submit.is-off{opacity:.4}',
    '.at-drawer .at-sd-submit.is-copied{background:var(--at-success);',
    'color:var(--at-on-accent)}',
    '.at-drawer .at-enh-load{display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:10px;padding:48px 0 40px}',
    '.at-drawer .at-enh-spin{width:22px;height:22px;border-radius:50%;',
    'border:2px solid var(--at-hairline);border-top-color:var(--at-yellow-deep);',
    'animation:at-enh-spin .68s linear infinite}',
    '@keyframes at-enh-spin{to{transform:rotate(360deg)}}',
    '@media (prefers-reduced-motion:reduce){.at-drawer .at-enh-spin{animation:none}}',
    '.at-drawer .at-enh-load-t{font-size:14px;font-weight:500;color:var(--at-primary)}',
    '.at-drawer .at-enh-load-s{font-size:12px;color:var(--at-muted)}',
    '.at-drawer .at-enh-err{border:1px solid var(--at-hairline);border-radius:10px;',
    'padding:14px 12px;background:var(--at-card);display:flex;flex-direction:column;gap:12px}',
    '.at-drawer .at-enh-err-t{font-size:13px;line-height:1.7;color:var(--at-slate)}',
    '.at-drawer .at-enh-retry{align-self:flex-start;height:32px;padding:0 14px;',
    'border-radius:999px;border:1px solid var(--at-hairline-strong);',
    'background:var(--at-elevated);font-size:13px;font-weight:500;',
    'color:var(--at-slate);display:inline-flex;align-items:center;gap:5px;cursor:pointer}',
    '.at-drawer .at-enh-retry:hover{background:var(--at-chip)}',
    '.at-drawer .at-enh-note{margin-bottom:8px;padding:7px 10px;border-radius:8px;',
    'border-left:2px solid var(--at-yellow-deep);background:var(--at-chip);',
    'font-size:12px;line-height:1.6;color:var(--at-slate)}',
    /* ── 其余模式共用的色板 swatch ─────────────────────────────────────── */
    /* ★ 2026-11-10：`.at-color-row` / `.at-color-swatch` 两条已整块删除 —— 项目表单的
     * 「项目色」按小程序 57 轮改成**一行一个**（`.at-sd-row` ＋ `.at-sd-cdot`，
     * 带占用置灰与占用者提示），全工程再没有第二个画圆点的色板。
     * 留着一套没有宿主的样式，下一个人会以为还有第二处色板。 */
  ].join('')

  /* ── 六张格式缩略图 ────────────────────────────────────────────────────
   * 逐行照抄 小程序前端/utils/formats.js 的 `thumbs()`（坐标、线型、节点尺寸、
   * data-URI 拼法一字未改）；三色取 utils/theme.js 的 THUMB_LIGHT / THUMB_DARK。
   * 判据会把这里的六个结果与小程序 `formats.list()` 逐字节比对，防止以后漂移。
   * ⚠️ 画的是**结构示意**（1＋3 / 1＋4 个方块），不是真实排版缩略图。 */
  var THUMB_LIGHT = { line: '#C7CAD5', root: '#1C1C1E', leaf: '#FFFFFF' }
  var THUMB_DARK = { line: '#858783', root: '#EEEDEA', leaf: '#202123' }
  function formatThumbs(dark) {
    var p = dark ? THUMB_DARK : THUMB_LIGHT
    var C_LINE = p.line, C_ROOT = p.root, C_LEAF = p.leaf
    var ROOT_W = 12, ROOT_H = 6, LEAF_W = 10, LEAF_H = 5, R_ELBOW = 2
    function nz(v) { return Math.round(v * 10) / 10 }
    function box(x, y, w, h, fill, stroke) {
      var s = stroke === false ? '' : ' stroke="' + (stroke || C_LINE) + '" stroke-width="0.7"'
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
        '" rx="1.4" fill="' + fill + '"' + s + '/>'
    }
    function wire(d) { return '<path d="' + d + '" fill="none" stroke="' + C_LINE + '" stroke-width="1"/>' }
    function line(x1, y1, x2, y2) {
      return 'M' + nz(x1) + ' ' + nz(y1) + ' L' + nz(x2) + ' ' + nz(y2)
    }
    function curve(x1, y1, x2, y2) {
      if (Math.abs(y1 - y2) < 0.5) return line(x1, y1, x2, y2)
      var mx = nz((x1 + x2) / 2)
      return 'M' + nz(x1) + ' ' + nz(y1) + ' C' + mx + ' ' + nz(y1) + ' ' +
        mx + ' ' + nz(y2) + ' ' + nz(x2) + ' ' + nz(y2)
    }
    function elbowLR(bx, y1, ex, y2) {
      var s = ex > bx ? 1 : -1, v = y2 > y1 ? 1 : -1
      if (Math.abs(ex - bx) < 0.5) return line(bx, y1, bx, y2)
      var r = Math.min(R_ELBOW, Math.abs(ex - bx), Math.abs(y2 - y1))
      return 'M' + nz(bx) + ' ' + nz(y1) +
        ' L' + nz(bx) + ' ' + nz(y2 - v * r) +
        ' Q' + nz(bx) + ' ' + nz(y2) + ' ' + nz(bx + s * r) + ' ' + nz(y2) +
        ' L' + nz(ex) + ' ' + nz(y2)
    }
    function elbowTB(x1, y1, x2, y2) {
      if (Math.abs(x2 - x1) < 0.5) return line(x1, y1, x2, y2)
      var s = x2 > x1 ? 1 : -1, my = nz((y1 + y2) / 2)
      var r = Math.min(R_ELBOW, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2)
      return 'M' + nz(x1) + ' ' + nz(y1) +
        ' L' + nz(x1) + ' ' + nz(my - r) +
        ' Q' + nz(x1) + ' ' + my + ' ' + nz(x1 + s * r) + ' ' + my +
        ' L' + nz(x2 - s * r) + ' ' + my +
        ' Q' + nz(x2) + ' ' + my + ' ' + nz(x2) + ' ' + nz(my + r) +
        ' L' + nz(x2) + ' ' + nz(y2)
    }
    function uri(inner) {
      return 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="34" viewBox="0 0 48 34">' +
        inner + '</svg>')
    }
    return {
      /* 思维导图：根居中，一级按叶子数分左右两列，曲线向两侧外扩 */
      mindmap: uri(
        wire(curve(18, 17, 13, 8.5)) + wire(curve(18, 17, 13, 25.5)) +
        wire(curve(30, 17, 35, 8.5)) + wire(curve(30, 17, 35, 25.5)) +
        box(3, 6, LEAF_W, LEAF_H, C_LEAF) + box(3, 23, LEAF_W, LEAF_H, C_LEAF) +
        box(35, 6, LEAF_W, LEAF_H, C_LEAF) + box(35, 23, LEAF_W, LEAF_H, C_LEAF) +
        box(18, 14, ROOT_W, ROOT_H, C_ROOT, false)),
      /* 逻辑图：根在左（纵向居中），一级同列上下排开，曲线并成一束再散开 */
      logic: uri(
        wire(curve(21.5, 17, 28.5, 7.5)) + wire(curve(21.5, 17, 28.5, 17)) +
        wire(curve(21.5, 17, 28.5, 26.5)) +
        box(28.5, 5, LEAF_W, LEAF_H, C_LEAF) + box(28.5, 14.5, LEAF_W, LEAF_H, C_LEAF) +
        box(28.5, 24, LEAF_W, LEAF_H, C_LEAF) +
        box(9.5, 14, ROOT_W, ROOT_H, C_ROOT, false)),
      /* 组织结构图：根在顶，横向总线把三支挂到下一层 */
      org: uri(
        wire(elbowTB(24, 8, 8, 24)) + wire(elbowTB(24, 8, 24, 24)) +
        wire(elbowTB(24, 8, 40, 24)) +
        box(3, 24, LEAF_W, LEAF_H, C_LEAF) + box(19, 24, LEAF_W, LEAF_H, C_LEAF) +
        box(35, 24, LEAF_W, LEAF_H, C_LEAF) +
        box(18, 2, ROOT_W, ROOT_H, C_ROOT, false)),
      /* 树形图：根在左上，竖总线垂下，一级向右缩进直角短枝 */
      tree: uri(
        wire(elbowLR(17, 8, 27, 12.5)) + wire(elbowLR(17, 8, 27, 19.5)) +
        wire(elbowLR(17, 8, 27, 26.5)) +
        box(27, 10, LEAF_W, LEAF_H, C_LEAF) + box(27, 17, LEAF_W, LEAF_H, C_LEAF) +
        box(27, 24, LEAF_W, LEAF_H, C_LEAF) +
        box(11, 2, ROOT_W, ROOT_H, C_ROOT, false)),
      /* 时间轴：根在顶，竖轴往下，一级左右交替 */
      timeline: uri(
        wire(elbowLR(24, 9, 29, 12.5)) + wire(elbowLR(24, 9, 19, 20)) +
        wire(elbowLR(24, 9, 29, 27.5)) +
        box(29, 10, LEAF_W, LEAF_H, C_LEAF) + box(9, 17.5, LEAF_W, LEAF_H, C_LEAF) +
        box(29, 25, LEAF_W, LEAF_H, C_LEAF) +
        box(18, 3, ROOT_W, ROOT_H, C_ROOT, false)),
      /* 鱼骨图：主脊横贯，两根长骨斜拉出去，一级落在骨线远端 */
      fishbone: uri(
        wire(line(12, 17, 47, 17)) +
        wire(line(15, 17, 26, 5)) + wire(line(28, 17, 39, 29)) +
        wire(line(20.5, 11, 23, 11)) + wire(line(33, 11, 35.5, 11)) +
        wire(line(33.5, 23, 37, 23)) +
        box(35.5, 8.5, LEAF_W, LEAF_H, C_LEAF) + box(23, 8.5, LEAF_W, LEAF_H, C_LEAF) +
        box(37, 20.5, LEAF_W, LEAF_H, C_LEAF) +
        box(21, 0, LEAF_W, LEAF_H, C_LEAF) + box(34, 29, LEAF_W, LEAF_H, C_LEAF) +
        box(1, 14, ROOT_W, ROOT_H, C_ROOT, false))
    }
  }

  /* ── .sd 字段控件（只在 90-drawers 内用，不进 U：其他模块不共用这套壳） ── */
  function sdField(key, label, required, opt, children) {
    return h('div', { key: key, className: 'at-sd-field' },
      h('span', { className: 'at-sd-label' }, label,
        required ? h('em', { className: 'at-sd-req' }, '必填') : null,
        opt ? h('em', { className: 'at-sd-opt' }, opt) : null),
      children)
  }
  function sdInput(props) {
    return h('input', { className: 'at-sd-input', type: props.type || 'text',
      value: props.value, placeholder: props.placeholder || '',
      'aria-label': props.label || props.placeholder || '', disabled: props.disabled,
      onChange: function (e) { props.onChange(e.target.value) } })
  }
  /* 正文随内容长高：地板 93（＝104−11）、天花板 197（＝208−11），与小程序
   * AREA_MIN_H / AREA_MAX_H 同源；两道都写在 DOM style 上，不吃原生 auto-height。 */
  function growArea(el) {
    if (!el || !el.style) return
    el.style.height = 'auto'
    var px = Math.min(197, Math.max(93, el.scrollHeight || 93))
    el.style.height = px + 'px'
  }
  function sdArea(props) {
    /* placeholder / aria 一律由调用方给：这张多行框现在待办正文与项目备注共用，
     * 写死「用一句话说清要做什么」会让备注框里出现一句讲待办的提示。 */
    return h('div', { className: 'at-sd-area-box' },
      h('textarea', { className: 'at-sd-area-in', value: props.value,
        placeholder: props.placeholder || '用一句话说清要做什么',
        'aria-label': props.label || '待办内容', spellCheck: false,
        ref: function (el) { if (el) growArea(el) },
        onInput: function (e) { growArea(e.target) },
        onChange: function (e) { props.onChange(e.target.value) } }))
  }
  /* 选中的那颗 chip 用**该档自己的** soft/main/text（深色档取 URGENCY_DARK）；
   * 不用统一的黑底选中，也不借用 --at-yellow —— 与小程序审查 P2-03 同一口径。 */
  function sdUrgency(value, set, dark) {
    return h('div', { className: 'at-sd-chips' }, C.URGENCY.map(function (u) {
      var on = value === u.key
      var d = dark ? (C.URGENCY_DARK[u.key] || {}) : {}
      return h('button', { key: u.key, type: 'button',
        className: 'at-sd-chip' + (on ? ' is-on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        style: on ? { background: d.soft || u.soft, borderColor: d.main || u.main,
          color: d.text || u.text } : null,
        onClick: function () { set('urgency', u.key) } }, u.name)
    }))
  }
  function projectDot(p, dark) {
    if (dark) return C.PROJECT_DARK[p.color] || C.NONE_COLOR_DARK
    return (C.colorOf(p.color) || {}).main || C.NONE_COLOR
  }
  /* 通用胶囊单选（项目节点这类「没有档位配色」的字段）。
   * 选中沿用全工程唯一那套选中语言：黄软底 ＋ 黄描边（FB-01），不走小程序 `.sd-chip.on`
   * 的深色实底 —— 紧急程度那四档自带 soft/main/text，由 sdUrgency 内联下发，不冲突。 */
  function sdChips(options, value, onPick) {
    return h('div', { className: 'at-sd-chips' }, options.map(function (o) {
      var on = value === o.key
      return h('button', { key: o.key, type: 'button',
        className: 'at-sd-chip' + (on ? ' is-on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        style: on ? { background: 'var(--at-yellow-soft)', borderColor: 'var(--at-yellow)',
          color: 'var(--at-primary)' } : null,
        onClick: function () { onPick(o.key) } }, o.name)
    }))
  }
  /* 关联 agent —— 一行一个，首行「不关联」是一次**平等的选择**（不是清空键）。 */
  function sdAgentRows(s, value, onPick) {
    var rows = [{ uid: '__none', id: '', name: '不关联' }].concat((s.agents || []).map(function (a) {
      return { uid: a.id, id: a.id, name: a.name }
    }))
    return h('div', { className: 'at-sd-list' }, rows.map(function (r) {
      var on = String(value || '') === String(r.id || '')
      return h('button', { key: r.uid, type: 'button',
        className: 'at-sd-row' + (on ? ' is-on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        onClick: function () { onPick(r.id) } },
        h('span', { className: 'at-sd-row-t' }, r.name),
        on ? h(U.Icon, { name: 'check', size: 14 }) : null)
    }))
  }
  /* 项目色 —— 一行一个（色点 ＋ 名称）。**被别的项目占用的置灰并写明占用者**：
   * 只说"不可用"会让人以为是 bug，写清是谁占的才能自查（小程序 57 轮同口径）。
   * 占用真源＝`s.projects`，当前这张表单对应的项目自己那一格不算占用。 */
  function sdColorRows(s, curId, value, onPick) {
    function ownerOf(key) {
      var hit = (s.projects || []).filter(function (x) {
        return x.color === key && x.id !== curId && !x.deletedAt
      })[0]
      return hit ? hit.name : ''
    }
    var rows = [{ key: '', name: '不关联', main: '' }].concat(C.COLORS.map(function (c) {
      return { key: c.key, name: c.name, main: c.main }
    }))
    return h('div', { className: 'at-sd-list' }, rows.map(function (c) {
      var on = String(value || '') === String(c.key || '')
      var owner = on || !c.key ? '' : ownerOf(c.key)
      var off = !!owner
      return h('button', { key: c.key || '__none', type: 'button', disabled: off,
        title: off ? ('已被「' + owner + '」占用') : c.name,
        'aria-pressed': on ? 'true' : 'false',
        className: 'at-sd-row' + (on ? ' is-on' : '') + (off ? ' is-off' : ''),
        onClick: function () { if (off) return; onPick(on ? '' : c.key) } },
        h('span', { className: 'at-sd-cdot' + (c.main ? '' : ' empty'),
          style: c.main ? { background: c.main } : null }),
        h('span', { className: 'at-sd-row-t' }, c.name),
        off ? h('span', { className: 'at-sd-row-note' },
          '已被「', h('span', { className: 'at-sd-row-note-n' }, owner), '」占用') : null,
        on ? h(U.Icon, { name: 'check', size: 14 }) : null)
    }))
  }
  /* 一行一个项目（.sd-list / .sd-row）；选中＝黄软底 ＋ 黄描边 ＋ 行尾 check。 */
  function sdProjects(s, value, set, dark, addProject) {
    var rows = Core.activeProjects(s).map(function (p) {
      var on = value === p.id
      return h('button', { key: p.id, type: 'button',
        className: 'at-sd-row' + (on ? ' is-on' : ''),
        onClick: function () { set('projectId', p.id) } },
        h('span', { className: 'at-sd-cdot', style: { background: projectDot(p, dark) } }),
        h('span', { className: 'at-sd-row-t' }, p.name),
        on ? h(U.Icon, { name: 'check', size: 14 }) : null)
    })
    /* 插件既有能力：待办表单里嵌套新建项目并回填草稿。小程序只在编辑态给这行，
     * 这里两个态都保留 —— 删它会砍掉功能，故只把形态收成 .sd-row.add。 */
    if (addProject) rows.push(h('button', { key: '__add', type: 'button',
      className: 'at-sd-row add', onClick: addProject },
      h(U.Icon, { name: 'plus', size: 14, opacity: .6 }),
      h('span', { className: 'at-sd-row-t' }, '新建项目')))
    return h('div', { className: 'at-sd-list' }, rows)
  }
  function sdFormats(value, set, dark) {
    var thumbs = formatThumbs(dark)
    return h('div', { className: 'at-sd-list' }, C.FORMATS.map(function (f) {
      var on = value === f.key
      return h('button', { key: f.key, type: 'button',
        className: 'at-sd-row fmt' + (on ? ' is-on' : ''),
        onClick: function () { set('format', f.key) } },
        h('img', { className: 'at-sd-fthumb', src: thumbs[f.key], alt: '', draggable: false }),
        h('span', { className: 'at-sd-row-t' }, f.label),
        on ? h(U.Icon, { name: 'check', size: 14 }) : null)
    }))
  }

  function listFor(s, kind, scope) {
    if (kind === 'project') return Core.filterProjects(s)
    if (kind === 'todo') return Core.filterTodos(s, scope)
    if (kind === 'mindmap') return Core.filterMindmaps(s)
    if (kind === 'capsule') return Core.capsules(s)
    return []
  }

  /* ------------------------------------------------------------- forms --- */
  function initialValues(s, form) {
    if (form.draft) return Object.assign({}, form.draft)
    var mode = form.mode, id = form.id, preset = form.preset || {}
    if (mode === 'profile') return { name: (s.me || {}).name || '', avatar: (s.me || {}).avatar || '' }
    if (mode === 'project') {
      var p = Core.byId(s.projects, id) || {}
      return { name: p.name || '', node: p.node || C.NODES[0], agentId: p.agentId || '',
        color: p.color || '', remark: p.remark || '' }
    }
    if (mode === 'mindmap') {
      var m = Core.byId(s.mindmaps, id) || {}
      return { name: m.name || '', projectId: m.projectId || preset.projectId || '',
        format: m.format || preset.format || 'mindmap' }
    }
    if (mode === 'agent') {
      var a = Core.byId(s.agents, id) || {}
      return { name: a.name || '', monthlyQuota: String(a.monthlyQuota || ''),
        resetDay: String(a.quotaResetAt || '1') }
    }
    if (mode === 'token') {
      var k = Core.byId(s.tokenKeys, id) || {}
      return { vendor: k.vendor || 'deepseek', apiKey: '' }
    }
    if (mode === 'todo') {
      var t = Core.byId(s.todos, id) || {}
      return { text: t.text || preset.text || '', urgency: t.urgency || preset.urgency || 'mid',
        projectId: t.projectId || preset.projectId || (Core.activeProjects(s)[0] || {}).id || '' }
    }
    /* 导出 / 信息增强：开关值随抽屉一起传（parent.draft 优先，见本函数第一行）。
     * 增强抽屉自己不画开关，但保留同一份 noImage，避免「看到的预览」与「送去增强的
     * 文本」在关闭二层回到 L1 之后分叉。 */
    if (mode === 'export' || mode === 'enhance') return { noImage: !!preset.noImage }
    return { noImage: false }
  }

  /* ★★ 轮次 16：增强请求由**模块层**发，不挂在 FormDrawer 上。
   * 与小程序 `mod-todo.onFormEnhance` 同一套架构（组件只展示、页面发请求）：
   *   ① 「仅在用户点击时调用大模型」—— 请求只从「增强」/「重试」两颗键进来，
   *      抽屉重开 / 组件重建都不会顺手再跑一次；
   *   ② 组件会被 `render()` 换 key 建销，响应回来时实例可能已经没了 ——
   *      状态存在 `ui.form.enh` 上，不打到一张已卸载的抽屉；
   *   ③ seq 是竞态守卫：重试／关掉增强抽屉后，上一轮的响应一律丢弃。
   * ⚠️ 输入恒为点击那一刻算好的 `enhSource`（＝导出预览那一份，含当时的「不含图片」），
   *    重试绝不重算 —— 小程序 F13 修的就是「首次勾了不含图、重试却把图带回去」。 */
  var enhSeq = 0
  function runEnhance(source) {
    var seq = ++enhSeq
    var cur = B.get().ui.form
    if (!cur || cur.mode !== 'enhance') return
    B.ui({ form: Object.assign({}, cur, { enh: {
      state: 'loading', text: '', error: '', notice: '', seq: seq } }) })
    /* ★ 同步调用：请求必须在「点击那一刻」发出（判据据此数调用次数），
     * 不能塞进 Promise.resolve().then —— 那样调用被推到 microtask，界面上
     * 也少了「点下去立刻进 loading」的因果感。同步抛错照样落进 catch。 */
    var pending
    try { pending = B.actions.enhance(source) } catch (e) { pending = Promise.reject(e) }
    Promise.resolve(pending)
      .then(function (d) {
        var now = B.get().ui.form
        if (!now || now.mode !== 'enhance' || !now.enh || now.enh.seq !== seq) return
        var out = (d && (d.text || d.result)) || ''
        B.ui({ form: Object.assign({}, now, { enh: {
          state: out ? 'done' : 'error', text: out, notice: (d && d.notice) || '',
          error: out ? '' : '增强结果为空，请重试', seq: seq } }) })
      })
      .catch(function (e) {
        var now = B.get().ui.form
        if (!now || now.mode !== 'enhance' || !now.enh || now.enh.seq !== seq) return
        /* 错误码只进 console，界面上一律中文成因（全工程口径）。 */
        if (typeof console !== 'undefined' && console.error) {
          console.error('[enhance]', e && e.code, e && e.message)
        }
        B.ui({ form: Object.assign({}, now, { enh: {
          state: 'error', text: '', notice: '',
          error: (e && e.message) || '增强失败了，请稍后重试', seq: seq } }) })
      })
  }

  function FormDrawer(props) {
    var s = props.s, f = s.ui.form, mode = f.mode, id = f.id, scope = f.scope || {}
    var meta = C.FORMS[mode] || C.FORMS.todo
    /* 四档紧急度 chip、项目色点、六张格式缩略图都按主题现取（小程序 o.* 同理）。 */
    var dark = AT.icons.useDark()
    var [v, setV] = React.useState(function () { return initialValues(s, f) })
    var [busy, setBusy] = React.useState(false)
    /* 复制成功态：只在**本次打开**期间有效，关抽屉即复位（小程序 173 轮口径）。 */
    var [copied, setCopied] = React.useState(false)
    function set(k, val) { setV(Object.assign({}, v, (function () { var o = {}; o[k] = val; return o })())) }
    var title = id ? (meta.editTitle || meta.title) : meta.title
    var submitLabel = id ? (meta.editSubmit || meta.submit) : meta.submit
    var todo = (mode === 'export' || mode === 'enhance') ? Core.byId(s.todos, id) : null
    var preview = todo ? Text.copyTodoText(s, id, { noImage: !!v.noImage }) : ''
    /* 增强三态由模块层写进 `ui.form.enh`，组件只读 —— 抽屉重建／响应迟到都不丢。 */
    var enh = f.enh || {}
    var enhState = mode === 'enhance' ? (enh.state || 'idle') : 'idle'
    var enhText = enh.text || ''
    var enhError = enh.error || ''
    var enhNotice = enh.notice || ''
    var enhSource = (f.preset && f.preset.enhSource) || ''
    /* ★ 小程序 form-drawer.js「导出态发现『有脑图但树未就绪』就补一次 loadTree」的
     * 同一条：预览与增强输入是同一份文本，树没到 ⇒ 送进模型的是缺脑图的残文。
     * B.loadTree 自带「已有树直接返回 / 未登录不请求 / 失败给中文提示」三道闸门。 */
    React.useEffect(function () {
      if ((mode === 'export' || mode === 'enhance') && todo && todo.mindmapId &&
        !s.tree[todo.mindmapId]) B.loadTree(todo.mindmapId)
    }, [mode, id, todo && todo.mindmapId, s.tree])

    async function submit() {
      if (busy) return
      if (mode === 'export' || mode === 'enhance') {
        /* ★ 两张抽屉共用一颗主键：动作完全相同（把眼前这段只读文本放进剪贴板），
         * 只取的文本与 toast 不同。loading / error 态没有可复制的东西 ⇒ 压暗并说明原因。 */
        if (mode === 'enhance' && enhState !== 'done') {
          B.toast(enhState === 'error' ? '增强失败了，请先重试' : '还在生成，请稍等', 'danger')
          return
        }
        var copySource = mode === 'enhance' ? enhText : preview
        if (!copySource) {
          B.toast(mode === 'enhance' ? '增强结果为空' : '这条待办没有正文', 'danger')
          return
        }
        var copiedOk = await B.copyText(copySource)
        if (copiedOk) setCopied(true)
        B.toast(copiedOk ? (mode === 'enhance' ? '已复制增强后的提示词' : '已复制到剪贴板')
          : '复制失败', copiedOk ? 'default' : 'danger')
        return
      }
      if (mode === 'todo' && !String(v.text || '').trim()) { B.toast('待办内容不能为空', 'danger'); return }
      if ((mode === 'project' || mode === 'mindmap' || mode === 'agent') && !String(v.name || '').trim()) {
        B.toast('名称不能为空', 'danger'); return
      }
      if (mode === 'mindmap' && !v.projectId) { B.toast('必须选所属项目', 'danger'); return }
      if (mode === 'todo' && !v.projectId) { B.toast('必须选归属项目', 'danger'); return }
      if (mode === 'token' && !id && !String(v.apiKey || '').trim()) { B.toast('请填写 API Key', 'danger'); return }
      setBusy(true)
      var ok = true
      var beforeIds = (mode === 'project' ? s.projects : mode === 'mindmap' ? s.mindmaps : s.todos)
        .map(function (x) { return x.id })
      try {
        if (mode === 'profile') ok = await B.actions.updateMe({ name: v.name, avatar: v.avatar })
        else if (mode === 'project') {
          if (id) ok = await B.actions.updateProject(id, { name: v.name, node: v.node,
            agentId: v.agentId || null, color: v.color, remark: v.remark })
          else ok = await B.actions.addProject(v)
        } else if (mode === 'mindmap') {
          if (id) ok = await B.actions.updateMindmap(id, { name: v.name, projectId: v.projectId, format: v.format })
          else ok = await B.actions.addMindmap(v)
        } else if (mode === 'agent') {
          var av = { name: v.name, monthlyQuota: Number(v.monthlyQuota) || 0,
            quotaResetAt: String(v.resetDay || '1') }
          if (id) ok = await B.actions.updateAgent(id, av); else ok = await B.actions.addAgent(av)
        } else if (mode === 'token') {
          var tv = { vendor: v.vendor }; if (v.apiKey) tv.apiKey = v.apiKey
          if (id) ok = await B.actions.updateToken(id, tv); else ok = await B.actions.addToken(tv)
        } else if (mode === 'todo') {
          if (scope.capsuleIds && scope.capsuleIds.length) {
            ok = await B.actions.promoteToTodo(scope.capsuleIds,
              { text: v.text, projectId: v.projectId, urgency: v.urgency })
            if (ok) AT.capsule.closeCapsule()
          } else if (id) ok = await B.actions.updateTodo(id,
            { text: v.text, urgency: v.urgency, projectId: v.projectId })
          else ok = await B.actions.addTodo({ text: v.text, projectId: v.projectId, urgency: v.urgency })
        }
        if (!ok) return
        var list = mode === 'project' ? B.get().projects : mode === 'mindmap' ? B.get().mindmaps : B.get().todos
        var created = !id && list.filter(function (x) { return beforeIds.indexOf(x.id) < 0 })[0]
        if (created && mode === 'project' && f.parent) {
          B.ui({ form: Object.assign({}, f.parent, { draft: Object.assign({}, f.parent.draft,
            { projectId: created.id }) }) })
          B.toast('项目已创建，继续填写待办')
          return
        }
        var pickTodoId = scope.pickTodoId || (f.preset || {}).pickTodoId
        if (created && mode === 'mindmap' && pickTodoId) {
          if (!(await B.actions.updateTodo(pickTodoId, { mindmapId: created.id }))) return
          V.openDetail('todo', pickTodoId); B.toast('脑图已创建并关联待办'); return
        }
        if (created && ['project', 'todo', 'mindmap'].indexOf(mode) >= 0) {
          V.openDetail(mode, created.id)
          B.toast(mode === 'todo' ? '待办已保存' : mode === 'project' ? '项目已创建' : '脑图已创建')
          return
        }
        S.closeForm()
        B.toast('已保存')
      } catch (e) { B.toast(e.message || '保存失败，请重试', 'danger') }
      finally { setBusy(false) }
    }
    /* 「增强」＝开二层抽屉 ＋ **立刻**发一次请求（小程序 forms.openNestedEnhance
     * ＋ mod-todo.onFormEnhance 的合体）。改前只 `openForm('enhance')` 换标题、
     * 请求要用户再点一次「重试 / 重新增强」才发 —— 这就是「增强没连通」的根因。
     * ⚠️ 只从这颗键进来，别挪进 useEffect：抽屉一打开就烧 token 是硬约束禁止的。 */
    function openEnhance() {
      var source = String(preview || '')
      if (!source.trim()) { B.toast('这条待办没有正文', 'danger'); return }
      S.openForm('enhance', id, {
        parent: Object.assign({}, f, { draft: v }),
        preset: { enhSource: source, noImage: !!v.noImage }
      })
      runEnhance(source)
    }
    /* 失败态的「重试」复用**同一份**输入，不重算预览（小程序 F13 口径）。 */
    function retryEnhance() { if (enhSource) runEnhance(enhSource) }
    function toggleNoImage() {
      set('noImage', !v.noImage)
      /* 开关一动 ⇒ 预览已不是「已复制的那一份」⇒ 收回成功态（小程序 R06）。 */
      setCopied(false)
    }

    var body = []
    if (mode === 'profile') body.push(
      h(U.Field, { key: 'name', label: '用户名', required: true },
        h(U.TextInput, { label: '用户名', value: v.name, onChange: function (x) { set('name', x) } })),
      h(U.Field, { key: 'avatar', label: '头像' },
        h(U.Btn, { onClick: function () {
          V.pickImage(async function (file) {
            try {
              var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
              set('avatar', uri)
            } catch (e) { B.toast(e.message, 'danger') }
          })
        } }, '从相册选择'),
        h('span', { className: 'at-muted' }, ' · '),
        h(U.Btn, { onClick: function () { set('avatar', '') } }, '恢复默认')))
    /* ---- 项目表单（2026-11-10 用户第 4 条：按小程序 form-drawer.wxml 的 project 段重做）
     * 原来这五个字段走的是 `U.Field` + 原生 `<select>` + 一排色点 —— 与小程序那套差在
     * **字段形态**（不是差在配色）：
     *   项目名称 → `.sd-input`（同前）
     *   项目节点 → **一排胶囊**（小程序 `.sd-chips`，单选；原来是个下拉）
     *   关联 agent → **一行一个**（`.sd-list` / `.sd-row`，首行「不关联」是一次平等的选择）
     *   项目色  → **一行一个**（色点 ＋ 名称；被别的项目占用的置灰并写明占用者）
     *   备注  → `.sd-area-box`（随内容长高）
     * ⚠️ 为什么两个下拉换成行/胶囊：下拉要"点开才知道有什么"，而这四个字段的候选
     *    最多 8 个、且**互斥占用**（一个颜色只能给一个项目）—— 平铺出来才能一眼看到
     *    「这个颜色已经被谁占了」。小程序 57 轮就是因为这个把胶囊改成了行。
     * ⚠️ 取色/占用的真源是 `s.projects`（当前项目自己那一格不算占用），不另存一份。 */
    if (mode === 'project') body.push(
      sdField('name', '项目名称', true, '',
        sdInput({ label: '项目名称', value: v.name, placeholder: '例如：彩票小助手',
          onChange: function (x) { set('name', x) } })),
      sdField('node', '项目节点', false, '',
        sdChips(C.NODES.map(function (n) { return { key: n, name: n } }), v.node,
          function (x) { set('node', x) })),
      sdField('agentId', '关联 agent', false, '可空',
        sdAgentRows(s, v.agentId, function (x) { set('agentId', x) })),
      sdField('color', '项目色', false, '可空',
        sdColorRows(s, id, v.color, function (x) { set('color', x) }, dark)),
      sdField('remark', '备注', false, '选填',
        sdArea({ label: '备注', value: v.remark, placeholder: '这个项目在做什么、和谁有关',
          onChange: function (x) { set('remark', x) } })))
    /* 新建脑图 —— 照抄 form-drawer.wxml 的 mindmap 段：
     * 脑图名称(.sd-input) ／ 所属项目(.sd-list 一行一个) ／ 格式(.sd-row.fmt 六行带缩略图)。 */
    if (mode === 'mindmap') body.push(
      sdField('name', '脑图名称', true, '',
        sdInput({ label: '脑图名称', value: v.name, placeholder: '例如：票据录入链路',
          onChange: function (x) { set('name', x) } })),
      sdField('projectId', '所属项目', true, '',
        sdProjects(s, v.projectId, set, dark, null)),
      sdField('format', '格式', true, '',
        sdFormats(v.format, set, dark)))
    if (mode === 'agent') body.push(
      h(U.Field, { key: 'name', label: 'agent 名称', required: true },
        h(U.TextInput, { label: 'agent 名称', value: v.name, onChange: function (x) { set('name', x) } })),
      h(U.Field, { key: 'quota', label: '每月套餐额度' },
        h(U.TextInput, { label: '每月套餐额度', type: 'number', value: v.monthlyQuota,
          onChange: function (x) { set('monthlyQuota', x) } })),
      h(U.Field, { key: 'reset', label: '额度重置日 每月' },
        h(U.Select, { label: '额度重置日', value: v.resetDay,
          options: Array.from({ length: 31 }, function (_, i) {
            return { key: String(i + 1), name: (i + 1) + ' 日' }
          }), onChange: function (x) { set('resetDay', x) } })))
    if (mode === 'token') body.push(
      h(U.Field, { key: 'vendor', label: '模型厂商', required: true },
        h(U.Select, { label: '模型厂商', value: v.vendor,
          options: [{ key: 'deepseek', name: 'DeepSeek' }],
          onChange: function (x) { set('vendor', x) } })),
      h(U.Field, { key: 'key', label: id ? 'API Key（留空不换）' : 'API Key', required: !id },
        h(U.TextInput, { label: 'API Key', type: 'password', value: v.apiKey,
          placeholder: id ? '留空表示不更换' : '', onChange: function (x) { set('apiKey', x) } })))
    /* 新建待办 —— 照抄 form-drawer.wxml 的 todo 段：
     * 待办内容(.sd-area-box 自动长高) ／ 紧急程度(.sd-chips 四档) ／
     * 归属项目(.sd-list 一行一个) + 插件既有的「＋ 新建项目」行。 */
    if (mode === 'todo') body.push(
      sdField('text', '待办内容', true, '',
        sdArea({ value: v.text, onChange: function (x) { set('text', x) } })),
      sdField('urgency', '紧急程度', true, '',
        sdUrgency(v.urgency, set, dark)),
      sdField('projectId', '归属项目', true, '',
        sdProjects(s, v.projectId, set, dark, function () {
          S.openForm('project', '', { scope: scope, parent: Object.assign({}, f, { draft: v }) })
        })))
    /* 导出：只读预览 ＋ 整行「不含图片」开关（小程序 .ex-box / .ex-sw）。
     * ⚠️ 顺序照小程序：先预览、后开关；「增强」不在这里，它属于底栏主键右侧。
     * ⚠️ 预览与复制共用同一个 `Text.copyTodoText()` ⇒ 看到的＝复制到的。 */
    if (mode === 'export') body.push(
      h('div', { key: 'preview', className: 'at-ex-box' },
        h('div', { className: 'at-ex-text' }, preview)),
      h('button', { key: 'noImage', type: 'button',
        className: 'at-ex-sw' + (v.noImage ? ' is-on' : ''),
        role: 'checkbox', 'aria-checked': String(!!v.noImage),
        title: '不含图片', 'aria-label': '不含图片', onClick: toggleNoImage },
        h('span', { className: 'at-ex-sw-box' },
          v.noImage ? h('span', { className: 'at-ex-sw-ck' }, '✓') : null),
        h('span', { className: 'at-ex-sw-t' }, '不含图片')))
    /* 信息增强：loading / error / done 三态（结果只读，不是编辑区）。
     * 请求在点击那一刻已经发出，抽屉一开就是 loading，没有流式吐字。 */
    if (mode === 'enhance') {
      if (enhState === 'loading') body.push(
        h('div', { key: 'enh', className: 'at-enh-load' },
          h('div', { className: 'at-enh-spin' }),
          h('div', { className: 'at-enh-load-t' }, '正在增强提示词…'),
          h('div', { className: 'at-enh-load-s' }, '模型正在整理这条待办，通常 5–20 秒')))
      else if (enhState === 'error') body.push(
        h('div', { key: 'enh', className: 'at-enh-err' },
          h('div', { className: 'at-enh-err-t' }, enhError || '增强失败了，请稍后重试'),
          h('button', { type: 'button', className: 'at-enh-retry', onClick: retryEnhance },
            h(U.Icon, { name: 'redo', size: 14, opacity: .7 }), '重试')))
      else if (enhState === 'done') body.push(
        enhNotice ? h('div', { key: 'enh-note', className: 'at-enh-note' }, enhNotice) : null,
        h('div', { key: 'enh', className: 'at-ex-box' },
          h('div', { className: 'at-ex-text' }, enhText)))
      else body.push(
        h('div', { key: 'enh', className: 'at-enh-err' },
          h('div', { className: 'at-enh-err-t' },
            '还没有生成结果，关闭本页回到导出抽屉，点「增强」开始生成')))
    }

    /* .sd-head：标题 ＋ 28 高描边「取消」胶囊（close 13 / gap 5）。
     * .sd-foot：**只有一颗** flex:1 的 --solid 实心主键，w-check 15 ＋ 文案；
     * 取消不进底栏 —— 这是小程序 .sd 最容易照抄漏掉的一处。 */
    return h('div', null,
      h('div', { className: 'at-form-mask', onClick: S.closeForm }),
      h(U.Dialog, { as: 'section', className: 'at-drawer' + (f.offset ? ' o' + f.offset : ''),
        role: 'dialog', 'aria-label': title },
        h('div', { className: 'at-drawer-head' },
          h('span', { className: 'at-drawer-title' }, title),
          h('button', { type: 'button', className: 'at-sd-cancel', onClick: S.closeForm },
            h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '取消')),
        h('div', { className: 'at-drawer-body' }, body),
        h('div', { className: 'at-drawer-foot' },
          h('button', { type: 'button',
            className: 'at-sd-submit' + (copied ? ' is-copied' : '') +
              (mode === 'enhance' && enhState !== 'done' ? ' is-off' : ''),
            disabled: busy, onClick: submit },
            h(U.Icon, { name: (mode === 'export' || mode === 'enhance')
              ? (copied ? 'check' : 'w-copy') : 'w-check', size: 15 }),
            copied ? '已复制' : submitLabel),
          /* ★★ 279 轮口径：「增强」在「复制到剪贴板」**右侧**，靠 DOM 顺序，
           * 不写 order / left；宽度由内容定，主键吃 flex:1 自动变窄。
           * 黄底 ⇒ 图标必须 `tone:'ink'` 恒墨（深色档默认会换成柔白，压黄只有 1.6:1）。
           * 禁用与复制共用同一条闸门（空预览时点它只是白烧一次模型调用）。 */
          mode === 'export' ? h('button', { type: 'button',
            className: 'at-sd-alt' + (preview ? '' : ' is-off'),
            disabled: busy, title: '调用模型增强这段提示词',
            onClick: openEnhance },
            h(U.Icon, { name: 'bolt', size: 15, tone: 'ink' }), '增强') : null)))
  }

  /* 胶囊 / 脑图选择器 —— 与创建 / 编辑 / 筛选**同一套右侧抽屉外壳**。
   * ★★ 2026-11-10：这两块原来是内联在待办详情内容最顶上的 `.at-picker` 面板：
   *    用户在下方区块点「选择胶囊 / 关联脑图」时，面板插在内容顶部、落在视口之外
   *    ⇒ 读起来就是"点了没反应"（详情一长就必然复现）。小程序那边本来就是
   *    「主抽屉」（drawers.build('capsule' / 'mindmap')），这里改回抽屉。
   * 分工：多选 / 单选的语义在 AT.panes.CapsulePickBody / MindmapPickBody，
   *       本外壳只管 遮罩 / 头（标题＋取消）/ 体 / 底栏（保存 或 新建脑图）。
   * ⚠️ 胶囊是**多选＋保存**、脑图是**单选即生效**（小程序 picker 的两条不同口径，
   *    别为了"统一"给脑图也加一颗确定键）。 */
  function PickDrawer(props) {
    var s = props.s, kind = props.kind, isCap = kind === 'capsule'
    var picked = (s.ui.capsulePick && s.ui.capsulePick.picked) || []
    var mmPick = s.ui.mmPick || {}
    var todoId = isCap ? (s.ui.capsulePick || {}).todoId : mmPick.todoId
    var todo = Core.byId(s.todos, todoId)
    function close() { B.ui(isCap ? { capsulePick: null } : { mmPick: null }) }
    function submit() {
      if (!todo || !picked.length) return
      B.actions.linkCapsules(todo.id, picked)
      B.ui({ capsulePick: null })
      B.toast('已关联 ' + picked.length + ' 条胶囊')
    }
    return h('div', null,
      h('div', { className: 'at-form-mask', onClick: close }),
      h(U.Dialog, { as: 'section', className: 'at-drawer', role: 'dialog',
        'aria-label': isCap ? '选择胶囊' : '关联脑图' },
        h('div', { className: 'at-drawer-head' },
          h('span', { className: 'at-drawer-title' },
            isCap ? ('选择胶囊' + (picked.length ? '-' + picked.length : '')) : '关联脑图'),
          h('button', { type: 'button', className: 'at-sd-cancel', onClick: close },
            h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '取消')),
        h('div', { className: 'at-drawer-body' },
          isCap ? h(AT.panes.CapsulePickBody, { s: s }) : h(AT.panes.MindmapPickBody, { s: s })),
        h('div', { className: 'at-drawer-foot' },
          isCap
            ? h('button', { type: 'button', className: 'at-sd-submit', disabled: !picked.length,
              onClick: submit },
              h(U.Icon, { name: 'w-check', size: 15 }),
              '保存' + (picked.length ? '（' + picked.length + '）' : ''))
            : h('button', { type: 'button', className: 'at-sd-submit', onClick: function () {
              B.ui({ mmPick: null })
              S.openForm('mindmap', '', { preset: {
                projectId: todo && todo.projectId, pickTodoId: mmPick.todoId } })
            } }, h(U.Icon, { name: 'w-plus', size: 15 }), '新建脑图'))))
  }

  function render(s) {
    if (s.ui.form) return h(FormDrawer, {
      key: 'form-' + s.ui.form.mode + '-' + s.ui.form.id, s: s
    })
    /* ★ 轮次 6：筛选与表单共用同一套「右侧展开弹窗」外壳（.at-form-mask ＋
     * .at-drawer），因此也由这里装配 —— 几何 / 层级 / 令牌解绑只有一个真源。
     * form 优先：遮罩已挡住列表头，两者本不会共存；这里再兜一层防叠加。 */
    if (s.ui.filterKind && AT.panes && AT.panes.FilterDrawer) {
      return h(AT.panes.FilterDrawer, {
        key: 'filter-' + s.ui.filterKind, s: s, kind: s.ui.filterKind
      })
    }
    /* ★★ 2026-11-10：胶囊 / 脑图选择器同样走这套外壳（原来是内联面板，见 PickDrawer 头注）。
     * 排在表单与筛选之后：三者互斥（各入口都会先清掉别的），这里只兜一层防叠加。 */
    if (s.ui.capsulePick || s.ui.mmPick) {
      return h(PickDrawer, {
        key: (s.ui.capsulePick ? 'cap-pick-' : 'mm-pick-') +
          ((s.ui.capsulePick || s.ui.mmPick).todoId || ''),
        s: s, kind: s.ui.capsulePick ? 'capsule' : 'mindmap'
      })
    }
    return null
  }

  AT.drawers = { STYLE: STYLE, render: render, listFor: listFor, FormDrawer: FormDrawer,
    PickDrawer: PickDrawer,
    formatThumbs: formatThumbs, sdField: sdField, sdInput: sdInput, sdArea: sdArea,
    sdUrgency: sdUrgency, sdProjects: sdProjects, sdFormats: sdFormats }
})(AT, React, h)
