/* 62-views-b.js — 待办 / 我的 的「页内内容体」＋ 图片工具函数。 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text,
    S = AT.shell, V = AT.views, P = AT.panes

  /* ==========================================================================
     「我的」页样式 —— 严格对齐 小程序前端/components/mod-mine 的 **PC / 横屏**档。
     · 区块头直接用 U.Section（＝ 小程序 .sec-head：16 图标 + 16/600 标题 + 右端动作）；
     · 半幅白卡 / 空态 / agent 圆环与「两行数」复用概览 60-views-a.js 的 .at-ov-*，
       两页卡面同一份装配（小程序 store.agentCardViews() 就是这么定的）；
     · 逐值同源：资料卡头像 56 / 圆角 16 / 名字 21；卡片 14 圆角 14 内距；
       圆环 80（内圆 60）/ 圆心 23 / 值 19；余额 23/600；二维码瓦片 132（内区 116）；
     · 颜色只走 --at-* 令牌，不裸写 hex；二维码底 --at-qr 跨主题恒白。
     ========================================================================== */
  var MINE_STYLE = [
    '.at-mi{display:flex;flex-direction:column;gap:20px;max-width:1180px;margin:0 auto;min-width:0}',
    '.at-mi .at-section{margin-bottom:0}',
    '.at-mi-card{background:var(--at-card);border:1px solid var(--at-hairline);',
    'border-radius:14px;padding:14px;box-shadow:var(--at-sh-card);box-sizing:border-box;min-width:0}',
    /* 与概览 .at-ov-ag-grid 同一把尺：宽窗两列，窄窗自动落一列 */
    '.at-mi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));',
    'gap:12px;align-items:stretch}',
    /* ★★★ 下面三条 button 规则一律写 `.at-mi .at-mi-*`（0,2,0）。
     * 40-ui.js 的复位是 `.at-root button{font:inherit;color:inherit}`（0,1,1），
     * 而主面板 styleTag 走 themeCss+U.STYLE、不注入 08-style 的零特异度 BASE_CSS
     * ⇒ 单类着色会被压成「继承主墨」，深底按钮的中文标签就成了深字压深底、看不见。
     * 别把前缀去掉（v1.1 胶囊层踩过同一个坑，当时是改复位；这里不能动全局复位）。
     * 区块头右端小按钮 ＝ 小程序 .sec-btn.dark（26 高 / 8 圆角 / 反白图标） */
    '.at-mi .at-mi-sec-btn{height:26px;padding:0 10px;border-radius:8px;background:var(--at-solid);',
    'border:1px solid var(--at-solid);color:var(--at-on-solid);font-size:13px;font-weight:500;',
    'display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;',
    'cursor:pointer;font-family:inherit}',
    '.at-mi .at-mi-sec-btn:hover{opacity:.82}',
    /* 卡内浅色小键 ＝ 小程序 .tb-btn（28 高 / 8 圆角 / 13/500 次墨） */
    '.at-mi .at-mi-tb{height:28px;padding:0 10px;border-radius:8px;background:var(--at-card);',
    'border:1px solid var(--at-hairline);color:var(--at-slate);font-size:13px;font-weight:500;',
    'display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;',
    'cursor:pointer;font-family:inherit;flex:0 0 auto}',
    '.at-mi .at-mi-tb:hover{background:var(--at-chip)}.at-mi-tb.icon{width:28px;padding:0}',
    '.at-mi-acts{display:flex;align-items:center;gap:6px;flex:0 0 auto}',
    '.at-mi-flex{flex:1;min-width:0}',

    /* ① 个人资料 */
    '.at-mi-me{display:flex;flex-direction:row;align-items:center;gap:14px;padding:12px}',
    '.at-mi-avatar{width:56px;height:56px;border-radius:16px;background:var(--at-chip);',
    'border:1px solid var(--at-hairline);display:flex;align-items:center;justify-content:center;',
    'overflow:hidden;flex:0 0 auto}',
    '.at-mi-avatar img{display:block;width:56px;height:56px;object-fit:cover}',
    '.at-mi-me-name{flex:0 1 auto;min-width:0;font-size:21px;font-weight:600;',
    'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',

    /* ② Agent 卡：圆环 / 每月套餐 / 承担项目直接挂 .at-ov-ag-*（与概览逐值同源） */
    '.at-mi-ag{display:flex;flex-direction:column;gap:10px}',
    /* 关联项目气泡行 —— 小程序「我的」页有、概览有意不渲染（mod-overview.wxml 282-287） */
    '.at-mi .at-mi-chips{display:flex;flex-direction:row;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}',
    '.at-mi .at-mi-chip{max-width:100%;min-width:0;height:26px;padding:0 10px 0 8px;border-radius:999px;',
    'background:var(--at-surface);border:0;display:inline-flex;align-items:center;gap:6px;',
    'color:var(--at-slate);font-family:inherit;cursor:pointer}',
    '.at-mi .at-mi-chip:hover{background:var(--at-chip)}',
    '.at-mi .at-mi-chip.is-arc{background:var(--at-card);border:1px dashed var(--at-hairline-strong)}',
    '.at-mi-dot-sm{width:8px;height:8px;border-radius:50%;flex:0 0 8px}',
    '.at-mi .at-mi-chip-t{font-size:12px;font-weight:500;color:var(--at-slate);white-space:nowrap;',
    'min-width:0;overflow:hidden;text-overflow:ellipsis}',
    '.at-mi .at-mi-chip-arc{font-size:11px;color:var(--at-muted);flex:0 0 auto}',
    '.at-mi-none{font-size:12px;color:var(--at-muted)}',

    /* ③ Token API：余额是这张卡的主角，没数时那个大字位改成一句状态说明 */
    '.at-mi-tk{display:flex;flex-direction:column;gap:10px}',
    '.at-mi-tk-name{flex:1;min-width:0;font-size:15px;font-weight:500;color:var(--at-primary);',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-mi-bal{display:flex;flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px}',
    '.at-mi-bal-v{font-size:23px;font-weight:600;color:var(--at-primary);white-space:nowrap;',
    'font-variant-numeric:tabular-nums}',
    '.at-mi-bal-pending{font-size:15px;font-weight:500;color:var(--at-text2)}',
    '.at-mi-bal-warn{color:var(--at-danger)}',
    '.at-mi-status{font-size:12px;color:var(--at-danger);flex:0 0 auto}',
    '.at-mi-foot{display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0;',
    'font-size:11px;color:var(--at-muted)}',
    '.at-mi-err{font-size:11px;color:var(--at-danger);line-height:1.5}',

    /* ④ 应用提示：定义表在左、二维码在右（132 瓦片 + 8 静区） */
    '.at-mi-tip{display:flex;flex-direction:row;align-items:center;gap:18px}',
    '.at-mi-tip-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}',
    '.at-mi-tip-row{display:flex;flex-direction:row;gap:10px}',
    '.at-mi-tip-k{flex:0 0 auto;white-space:nowrap;font-size:12px;font-weight:700;',
    'line-height:22px;color:var(--at-slate-strong)}',
    '.at-mi-tip-v{flex:1;min-width:0;font-size:13px;line-height:22px;color:var(--at-slate)}',
    '.at-mi-qr{flex:0 0 auto;width:132px;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.at-mi-qr-tile{width:132px;height:132px;padding:8px;box-sizing:border-box;',
    'border-radius:12px;background:var(--at-qr)}',
    '.at-mi-qr-img{display:block;width:116px;height:116px;object-fit:contain}',
    '.at-mi-qr-cap{font-size:11px;line-height:16px;color:var(--at-stone);white-space:nowrap}',

    '@container (max-width:700px){.at-mi-grid{grid-template-columns:1fr}',
    '.at-mi-tip{flex-direction:column;align-items:stretch}.at-mi-qr{align-self:center}}'
  ].join('')

  /* ==========================================================================
     待办详情 —— 严格对齐 小程序前端/components/mod-todo 的 **PC / 横屏**档。
     六区块、固定读序（230 轮定稿）：
       ① 所属项目（色点·名称·徽章 / 备注 / 所属 agent ＋ 项目概要 两组并排）
       ② 操作（三态通栏动作条：完成·导出·编辑·删除 / 还原·导出·删除 / 还原）
       ③ 待办信息（紧急度色条 ＋ 档名 ＋ 互斥徽章 ＋ 创建于/完成于 ＋ 正文）
       ④ 闪念胶囊（220 宽卡 · 正文封 3 行 · ✕ 取消关联 · 末尾「＋ 选择胶囊」）
       ⑤ 图片（160×112 格 · n/N 角标 · ✕ · 末尾「＋ 添加图片」）
       ⑥ 关联脑图（只读整图 240 高 / 空态一句话 ＋ 整宽键）
     ⚠️ 第 4/5/6 块**常显**：它们各自带着一个动作，区块消失就等于动作消失。
     ⚠️ 尺寸全部照抄小程序 wxss，改这里前先回 `mod-todo.wxss` 核一遍。
     ========================================================================== */
  var TODO_STYLE = [
    '.at-tbd{display:flex;flex-direction:column;gap:12px;max-width:880px;margin:0 auto;min-width:0}',
    /* 区块头 ＝ 小程序 `.sec-head`：16 图标 ＋ 标题，同一条基线 */
    '.at-tbd .at-block-title{display:flex;align-items:center;gap:6px}',

    /* ① 所属项目 */
    '.at-tbd-row1{display:flex;align-items:center;gap:8px;min-width:0}',
    '.at-tbd-dot{width:14px;height:14px;border-radius:50%;flex:0 0 14px}',
    '.at-tbd-name{font-size:16px;font-weight:600;min-width:0;white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis}',
    '.at-tbd-badge{display:inline-flex;align-items:center;height:20px;padding:0 7px;',
    'border-radius:6px;font-size:11px;font-weight:500;white-space:nowrap;flex:0 0 auto}',
    '.at-tbd-badge.arch{background:var(--at-chip);color:var(--at-text2)}',
    '.at-tbd-badge.done{background:var(--at-success-bg);color:var(--at-success-t)}',
    '.at-tbd-badge.gone{background:var(--at-danger);color:var(--at-on-danger)}',
    '.at-tbd-tb{margin-left:auto;flex:0 0 auto;height:28px;padding:0 10px;border-radius:8px;',
    'background:var(--at-card);border:1px solid var(--at-hairline);color:var(--at-slate);',
    'font-size:12px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;',
    'gap:4px;white-space:nowrap;cursor:pointer;font-family:inherit}',
    '.at-tbd-tb:hover{background:var(--at-chip)}',
    '.at-tbd-remark{margin-top:10px;font-size:13px;line-height:1.6;color:var(--at-text2);',
    'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.at-tbd-remark.none{color:var(--at-muted)}',
    '.at-tbd-cols{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}',
    '.at-tbd-group{flex:1 1 250px;min-width:0}',
    '.at-tbd-group-t{display:block;font-size:12px;font-weight:500;color:var(--at-text2);',
    'margin-bottom:6px}',
    '.at-tbd-pair{display:flex;align-items:stretch;border-radius:10px;background:var(--at-surface);',
    'border:1px solid var(--at-hairline-soft);overflow:hidden;min-width:0}',
    '.at-tbd-cell{flex:1 1 0;min-width:0;padding:9px 10px;display:flex;flex-direction:column;gap:2px}',
    '.at-tbd-lab{font-size:11px;color:var(--at-muted);white-space:nowrap}',
    '.at-tbd-val{font-size:14px;font-weight:600;font-family:var(--at-font-num);white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis}',
    '.at-tbd-sep{width:1px;flex:0 0 1px;background:var(--at-hairline-soft);margin:8px 0}',
    '.at-tbd-agent{flex:1 1 0;min-width:0;padding:9px 10px;display:flex;align-items:center;',
    'cursor:pointer;font:inherit;text-align:left;border:0;background:transparent}',
    '.at-tbd-agent:hover{background:var(--at-chip)}',
    '.at-tbd-agent-n{font-size:15px;font-weight:600;min-width:0;white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis}',
    '.at-tbd-agent-none{font-size:13px;color:var(--at-muted);padding:9px 10px;display:block}',

    /* ② 操作 —— 三态通栏动作条 */
    '.at-tbd-ops{display:flex;gap:6px;padding:4px;border-radius:10px;background:var(--at-chip)}',
    '.at-tbd-ops.solo{background:transparent;padding:0;justify-content:flex-start}',
    '.at-tbd-op{flex:1 1 0;min-width:0;height:36px;display:inline-flex;align-items:center;',
    'justify-content:center;gap:5px;border:0;border-radius:8px;background:transparent;',
    'color:var(--at-slate);font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;',
    'white-space:nowrap}',
    '.at-tbd-op:hover{background:var(--at-chip)}',
    '.at-tbd-op.is-main{background:var(--at-yellow);color:var(--at-on-accent);font-weight:600}',
    '.at-tbd-op.is-main:hover{background:var(--at-yellow);opacity:.82}',
    '.at-tbd-op.is-main:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
    '.at-tbd-op.is-danger{color:var(--at-danger)}',
    '.at-tbd-ops.solo .at-tbd-op{flex:0 0 auto;padding:0 24px}',

    /* ③ 待办信息 */
    '.at-tbd-hero-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.at-tbd-flag{width:4px;height:16px;border-radius:2px;flex:0 0 4px}',
    '.at-tbd-urg{font-size:13px;font-weight:600}',
    '.at-tbd-at{margin-left:auto;font-size:11px;color:var(--at-muted);white-space:nowrap}',
    '.at-tbd-text{margin-top:12px;font-size:17px;line-height:1.7;letter-spacing:-.2px;',
    'white-space:pre-wrap;overflow-wrap:anywhere;color:var(--at-primary)}',

    /* ④ 闪念胶囊 */
    '.at-tbd-caps{display:flex;flex-wrap:wrap;gap:8px}',
    '.at-tbd-cap{position:relative;width:220px;min-height:96px;display:flex;flex-direction:column;',
    'gap:6px;padding:10px 12px;border:1px solid var(--at-hairline);border-radius:10px;',
    'background:var(--at-card-dim);font:inherit;text-align:left;',
    'color:var(--at-primary);box-sizing:border-box}',
    '.at-tbd-cap-add{cursor:pointer}',
    '.at-tbd-cap-add:hover{background:var(--at-chip)}',
    /* 正文右侧必须给 ✕ 让位（小程序 .cap-t 逐值）：24 圆 ＋ right:6 会盖住第一行末尾。 */
    '.at-tbd-cap-t{font-size:13px;line-height:1.55;padding-right:22px;',
    'display:-webkit-box;-webkit-line-clamp:3;',
    '-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}',
    '.at-tbd-cap-img{width:100%;max-height:88px;object-fit:cover;border-radius:6px;display:block}',
    '.at-tbd-cap-time{font-size:11px;color:var(--at-muted);margin-top:auto}',
    /* ★★ 轮次 17：两颗 ✕ 逐值对齐小程序 .cap-del / .img-del —— 24 实心圆 / 36 透明热区 /
       反白 w-close 14。改前是 20 圆、无热区，且图标传 tone:'w'（iconSrc 只认 'white'），
       浅色档拿到墨色 close.svg ⇒ 黑叉压在 --at-solid 深底上，看着就是个黑方块。
       ⚠️ 热区只许用透明伪元素外扩，不许用 padding 撑（会把视觉圆点一起放大）。 */
    '.at-tbd-cap-x,.at-tbd-img-x{position:absolute;top:6px;right:6px;z-index:2;',
    'width:24px;height:24px;border:0;border-radius:999px;background:var(--at-solid);',
    'color:var(--at-on-solid);display:inline-flex;align-items:center;justify-content:center;',
    'cursor:pointer;padding:0}',
    '.at-tbd-cap-x::after,.at-tbd-img-x::after{content:"";position:absolute;',
    'left:50%;top:50%;width:36px;height:36px;transform:translate(-50%,-50%);',
    'border-radius:999px}',
    '.at-tbd-cap-add{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:6px;border-style:dashed;background:transparent;color:var(--at-muted);font-size:13px}',

    /* ⑤ 图片 */
    '.at-tbd-imgs{display:flex;flex-wrap:wrap;gap:8px}',
    '.at-tbd-img{position:relative;width:160px;height:112px;border:1px solid var(--at-hairline);',
    'border-radius:10px;overflow:hidden;background:var(--at-chip);cursor:pointer;padding:0}',
    '.at-tbd-img img{width:100%;height:100%;object-fit:cover;display:block}',
    '.at-tbd-img-no{position:absolute;left:6px;bottom:5px;font-size:10px;color:var(--at-on-solid);',
    'background:rgba(0,0,0,.45);border-radius:4px;padding:0 4px}',
    /* ✕ 与胶囊卡那颗共用上面 `.at-tbd-cap-x,.at-tbd-img-x` 的 24 / 36 同款规则。 */
    '.at-tbd-img-add{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:5px;border-style:dashed;background:transparent;color:var(--at-muted);font-size:12px}',

    /* 空态：一句虚线说明 ＋ 整宽大键 —— 胶囊 / 图片 / 脑图三块**共用这一套** */
    '.at-tbd-blank{font-size:13px;color:var(--at-text2);padding:14px 12px;',
    'border:1px dashed var(--at-hairline-strong);border-radius:10px;text-align:center}',
    '.at-tbd-blank-acts{margin-top:10px;display:flex;gap:8px}',
    '.at-tbd-lg{flex:1 1 auto;height:40px;display:inline-flex;align-items:center;',
    'justify-content:center;gap:6px;border:1px solid var(--at-hairline);border-radius:10px;',
    'background:var(--at-card);color:var(--at-slate);font-size:14px;font-weight:500;',
    'font-family:inherit;cursor:pointer;white-space:nowrap}',
    '.at-tbd-lg:hover{background:var(--at-chip)}',
    '.at-tbd-cap-x:hover,.at-tbd-img-x:hover{opacity:.82}',
    /* ★★ 2026-11-10：胶囊卡 / 图片格**可点开查看**（小程序 mod-todo 的两层模态）。
     * 改前它们只是静态块，但 `.at-tbd-img` 早就写着 cursor:pointer —— 点了没反应。 */
    '.at-tbd-cap:not(.at-tbd-cap-add),.at-tbd-img:not(.at-tbd-img-add){cursor:pointer}',
    /* 按下/悬停反馈沿用标准三档里的 .82（verify-standard FB-01 只认 .82 / .78 / .4）。 */
    '.at-tbd-cap:not(.at-tbd-cap-add):hover,.at-tbd-img:not(.at-tbd-img-add):hover{opacity:.82}',

    /* 详情内的查看层（图片放大 / 胶囊全文）—— 与小程序 `.viewer` 同一套读法：
     * 暗遮罩 ＋ 白卡 ＋ 右上 ✕ ＋ 底行翻页（只有图片有翻页）。 */
    '.at-tbd-viewer{position:fixed;inset:0;z-index:160;display:flex;align-items:center;',
    'justify-content:center;padding:24px;background:rgba(17,17,17,.55)}',
    '.at-tbd-viewer-box{width:min(760px,100%);max-height:100%;min-width:0;display:flex;',
    'flex-direction:column;background:var(--at-card);border-radius:16px;',
    'box-shadow:0 24px 64px rgba(0,0,0,.35);overflow:hidden}',
    '.at-tbd-viewer-top{display:flex;align-items:center;gap:10px;padding:12px 14px;',
    'border-bottom:1px solid var(--at-hairline)}',
    '.at-tbd-viewer-t{flex:1 1 auto;min-width:0;font-size:14px;font-weight:600;',
    'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-tbd-viewer-x{flex:0 0 auto;width:28px;height:28px;padding:0;border:0;border-radius:50%;',
    'background:var(--at-chip);color:var(--at-slate);font:inherit;font-size:13px;',
    'cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
    '.at-tbd-viewer-x:hover{background:var(--at-hairline)}',
    '.at-tbd-viewer-body{min-height:0;padding:14px;overflow:auto;display:flex;',
    'align-items:center;justify-content:center;background:var(--at-surface)}',
    '.at-tbd-viewer-photo{display:block;max-width:100%;max-height:min(62vh,560px);',
    'object-fit:contain;border-radius:10px}',
    '.at-tbd-viewer-body.is-text{align-items:stretch;justify-content:flex-start;',
    'flex-direction:column;gap:10px;background:var(--at-card);max-height:66vh}',
    '.at-tbd-cv-t{font-size:15px;line-height:1.75;white-space:pre-wrap;',
    'overflow-wrap:anywhere;color:var(--at-primary);user-select:text}',
    '.at-tbd-cv-pic{display:block;width:100%;padding:0;border:0;background:transparent;',
    'cursor:zoom-in}',
    '.at-tbd-cv-img{display:block;width:100%;border-radius:10px}',
    '.at-tbd-cv-time{font-size:11px;color:var(--at-muted)}',
    '.at-tbd-viewer-nav{display:flex;gap:8px;padding:10px 14px;',
    'border-top:1px solid var(--at-hairline)}',
    '.at-tbd-viewer-btn{flex:1 1 0;height:34px;display:inline-flex;align-items:center;',
    'justify-content:center;gap:5px;border:1px solid var(--at-hairline);border-radius:8px;',
    'background:var(--at-card);color:var(--at-slate);font:inherit;font-size:13px;',
    'font-weight:500;cursor:pointer}',
    '.at-tbd-viewer-btn:hover:not(:disabled){background:var(--at-chip)}',
    '.at-tbd-viewer-btn:disabled{opacity:.4;cursor:default}',

    /* ⑥ 关联脑图 */
    '.at-tbd-mm-box{position:relative;height:240px;border:1px solid var(--at-hairline-soft);',
    'border-radius:10px;overflow:hidden;background:var(--at-surface);cursor:pointer}',
    '.at-tbd-mm-info{display:flex;align-items:center;justify-content:space-between;gap:8px;',
    'padding:10px 0 0;min-width:0}',
    '.at-tbd-mm-name{font-size:14px;font-weight:600;min-width:0;white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis}',
    '.at-tbd-mm-meta{font-size:11px;color:var(--at-muted);white-space:nowrap;flex:0 0 auto}',
    '.at-tbd-mm-acts{display:flex;gap:8px;margin-top:10px}',

    /* 回收站提示 */
    /* 回收站提示是状态说明，不是破坏性动作：危险色只作字色，不整块铺底（规范 T-04） */
    '.at-tbd-note{padding:10px 12px;border-radius:10px;background:var(--at-card-dim);',
    'border:1px solid var(--at-hairline);color:var(--at-danger);font-size:12px;line-height:1.6}'
  ].join('')

  function pickImage(cb) {
    var input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = function () { if (input.files && input.files[0]) cb(input.files[0]) }
    input.click()
  }
  function imgSrc(s, uri) {
    if (!uri) return ''
    if (/^(blob:|https?:\/\/|data:)/.test(uri)) return uri
    return Text.fileUrl(s.ui.apiBase, uri)
  }

  /* v1.12：原「交给 Agent（写入 DSH / 复制 Markdown / 导出设置）」整块撤掉 ——
   * 用户 2026-11-07 明确「严格只留小程序那六区块」。写入 DSH / 复制上下文的
   * 能力仍在侧栏与胶囊层，但待办详情不再有第七块。
   * 「导出」这颗键保留在小程序那一排三态动作条里（它本来就在那里）。 */

  /* ------------------------------------------------------------- 待办 --- */
  /* 「距离重置」文案 —— 与小程序 `store.resetInOf` 逐字一致：今天 / N 天 / 未填。
   * ⚠️ 不要在这三个分支里自己加「还剩」之类的措辞，两页会读成两种口径。 */
  function resetInOf(a) {
    if (!a) return ''
    var d = Core.daysUntilReset(a.quotaResetAt)
    if (d === null) return '未填'
    return d <= 0 ? '今天' : d + ' 天'
  }
  /* 节点徽章 ＝ 小程序 `.badge.badge-node`（`--u-mid-bg` / `--u-mid-t` 两档现取）。
   * 每次都现取，不在进页面时定格一次（切深色后徽章还是浅色底是踩过的坑）。 */
  function nodeBadgeStyle() {
    var base = AT.icons.isDark() ? C.URGENCY_DARK.mid : C.urgencyOf('mid')
    return { background: base.soft, color: base.text }
  }
  function urgencyInk(key) {
    return (AT.icons.isDark() && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].main : C.urgencyOf(key).main
  }
  function urgencyInkText(key) {
    return (AT.icons.isDark() && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].text : C.urgencyOf(key).text
  }

  /* 六区块、固定读序（对齐 小程序 mod-todo PC 档 · 230 轮定稿）：
   *   ① 所属项目 → ② 操作 → ③ 待办信息 → ④ 闪念胶囊 → ⑤ 图片 → ⑥ 关联脑图
   * ⚠️ ④⑤⑥ **常显**：它们各自带一个动作（选择胶囊 / 添加图片 / 关联脑图），
   *    区块一消失，那个动作就没有落点了。
   * ⚠️ 已删除那一档只剩「还原」：④⑤⑥ 里的加/删入口一律不渲染
   *    （小程序的守卫是 `wx:if="{{!detail.deleted}}"`，这里同一套）。 */
  /* ---- 详情内的两个查看层（2026-11-10 补）--------------------------------
   * 小程序 mod-todo 里这两处是**模态层**：图片格点开 `.viewer`（可左右翻），
   * 胶囊卡点开全文层（正文可滚、里面的图还能再看大图）。插件原来点图片、点胶囊卡
   * **什么都不发生**（`.at-tbd-img` 还挂着 cursor:pointer）—— 想看清一张图、
   * 读完一条长口述都没有落点。
   * 状态照本工程既有做法写进 ui（与 ui.heatSelected / ui.detailUrg 同一套），
   * 不把 TodoBody 改成有 hooks 的组件：它被 DetailPane 当**普通函数**调用，
   * 一旦在里面用 useState，钩子就挂到调用者身上（本工程踩过：见 70-mindmap 的 Preview 注）。
   *   ui.imgView = { title, urls: [src…], index }   ← 待办图片 / 胶囊配图共用一层
   *   ui.capView = { todoId, id }                   ← 胶囊全文层（带图）
   * 关闭通道三条：右上 ✕、点遮罩（onPointerDown 判 target）、Esc（50-shell.js）。
   */
  function stepView(v, d) {
    var n = (v.urls || []).length
    var i = Math.max(0, Math.min(n - 1, (v.index || 0) + d))
    B.ui({ imgView: Object.assign({}, v, { index: i }) })
  }
  function ImageViewer(s) {
    var v = s.ui.imgView
    if (!v) return null
    var urls = v.urls || [], n = urls.length
    var i = Math.max(0, Math.min(n - 1, v.index || 0))
    if (!n || !urls[i]) return null
    return h('div', { className: 'at-tbd-viewer', role: 'dialog', 'aria-label': v.title || '图片',
      onPointerDown: function (e) { if (e.target === e.currentTarget) B.ui({ imgView: null }) } },
      h('div', { className: 'at-tbd-viewer-box' },
        h('div', { className: 'at-tbd-viewer-top' },
          h('span', { className: 'at-tbd-viewer-t' },
            (v.title || '图片') + ' ' + (i + 1) + ' / ' + n),
          h('button', { type: 'button', className: 'at-tbd-viewer-x', title: '关闭',
            'aria-label': '关闭', onClick: function () { B.ui({ imgView: null }) } }, '✕')),
        h('div', { className: 'at-tbd-viewer-body' },
          h('img', { className: 'at-tbd-viewer-photo', src: urls[i],
            alt: (v.title || '图片') + ' ' + (i + 1) })),
        /* 只有一张时**不渲染**翻页行：胶囊配图永远只有一张，
         * 给它两颗灰掉的键只会让人以为"还有别的"（与小程序胶囊全文层同一条取舍）。 */
        n > 1 ? h('div', { className: 'at-tbd-viewer-nav' },
          h('button', { type: 'button', className: 'at-tbd-viewer-btn', disabled: i <= 0,
            onClick: function () { stepView(v, -1) } },
            h(U.Icon, { name: 'chevron-left', size: 13, opacity: .65 }), '上一张'),
          h('button', { type: 'button', className: 'at-tbd-viewer-btn', disabled: i >= n - 1,
            onClick: function () { stepView(v, 1) } },
            '下一张', h(U.Icon, { name: 'chevron-right', size: 13, opacity: .65 }))) : null))
  }
  function CapsuleViewer(s, t) {
    var v = s.ui.capView
    if (!v || !t || v.todoId !== t.id) return null
    var caps = Core.capsulesOfTodo(s, t.id)
    var idx = -1
    for (var i = 0; i < caps.length; i++) if (caps[i].id === v.id) { idx = i; break }
    /* 闸门带下标：关掉详情 / 解除关联之后这一层必须自己消失，否则会在空详情上留一张孤框
     * （小程序 `wx:if="{{capOpen && detail.capsules[capIndex]}}"` 是同一道守卫）。 */
    if (idx < 0) return null
    var c = caps[idx], src = c.imageUri ? V.imgSrc(s, c.imageUri) : ''
    return h('div', { className: 'at-tbd-viewer', role: 'dialog', 'aria-label': '闪念胶囊',
      onPointerDown: function (e) { if (e.target === e.currentTarget) B.ui({ capView: null }) } },
      h('div', { className: 'at-tbd-viewer-box' },
        h('div', { className: 'at-tbd-viewer-top' },
          h('span', { className: 'at-tbd-viewer-t' },
            '闪念胶囊 ' + (idx + 1) + ' / ' + caps.length),
          h('button', { type: 'button', className: 'at-tbd-viewer-x', title: '关闭',
            'aria-label': '关闭', onClick: function () { B.ui({ capView: null }) } }, '✕')),
        h('div', { className: 'at-tbd-viewer-body is-text' },
          h('div', { className: 'at-tbd-cv-t' }, c.text || '（这条还是空的）'),
          src ? h('button', { type: 'button', className: 'at-tbd-cv-pic',
            title: '看大图', 'aria-label': '看大图',
            onClick: function () {
              B.ui({ imgView: { title: '闪念胶囊配图', urls: [src], index: 0 } })
            } },
            h('img', { className: 'at-tbd-cv-img', src: src, alt: '胶囊配图' })) : null,
          h('span', { className: 'at-tbd-cv-time' }, Core.atMin(c.createdAt)))))
  }

  function TodoBody(s, t) {
    if (!t) return h(U.Empty, { icon: 'todo', title: '还没有打开过任何一条待办',
      hint: '从左边列表里挑一条，或者先记一条新的',
      action: { label: '记一条待办', onClick: function () { S.openForm('todo', '') } } })
    var p = Core.byId(s.projects, t.projectId)
    var agent = p ? Core.byId(s.agents, p.agentId) : null
    var sum = p ? Core.projectSummary(s, p.id) : { open: 0, done: 0, mindmaps: 0 }
    var pColor = p && C.colorOf(p.color) ? C.colorOf(p.color).main : 'var(--at-stone)'
    var mm = t.mindmapId ? Core.byId(s.mindmaps, t.mindmapId) : null
    var caps = Core.capsulesOfTodo(s, t.id)
    var u = C.urgencyOf(t.urgency)
    var gone = !!t.deletedAt
    var images = t.images || []
    /* 「操作」三态只看两个互斥布尔（与小程序模板同一套判据）。 */
    var ops = gone
      ? [{ key: 'restore', name: '还原', icon: 'undo', main: true,
        run: function () { B.actions.restoreTodo(t.id) } }]
      : t.done
        ? [{ key: 'restore', name: '还原', icon: 'undo', main: true,
          run: function () { B.actions.toggleTodo(t.id) } },
          { key: 'export', name: '导出', icon: 'export',
            run: function () { S.openForm('export', t.id) } },
          { key: 'del', name: '删除', icon: 'trash-red', danger: true,
            run: function () { confirmDeleteTodo(t) } }]
        : [{ key: 'done', name: '完成', icon: 'check', main: true,
          run: function () { B.actions.toggleTodo(t.id) } },
          { key: 'export', name: '导出', icon: 'export',
            run: function () { S.openForm('export', t.id) } },
          { key: 'edit', name: '编辑', icon: 'edit',
            run: function () { S.openForm('todo', t.id) } },
          { key: 'del', name: '删除', icon: 'trash-red', danger: true,
            run: function () { confirmDeleteTodo(t) } }]

    function removeImage(i) {
      S.openConfirm({ title: '删除这张图片？', body: '图片会从这条待办上移除。',
        onConfirm: function () {
          B.actions.updateTodo(t.id, { images: images.filter(function (_, j) { return j !== i }) })
        } })
    }

    return h('div', { className: 'at-tbd' },
      gone ? h('div', { className: 'at-tbd-note' }, '这条待办在回收站里，还原后才能继续编辑。') : null,

      /* ① 所属项目 —— 色点 · 名称 · 徽章 ＋ 右端「查看项目」；备注；两组并排 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'project-b', size: 16 }), '所属项目'),
        h('div', { className: 'at-tbd-row1' },
          h('span', { className: 'at-tbd-dot', style: { background: pColor } }),
          h('span', { className: 'at-tbd-name' }, p ? p.name : '未归属项目'),
          p
            ? (p.archivedAt
              ? h('span', { className: 'at-tbd-badge arch' }, '已归档')
              : h('span', { className: 'at-tbd-badge', style: nodeBadgeStyle() }, p.node))
            : null,
          h('button', { type: 'button', className: 'at-tbd-tb',
            onClick: function () {
              if (p) V.openDetail('project', p.id)
              else B.toast('这条待办还没有归属项目')
            } },
            h(U.Icon, { name: 'project', size: 13 }), '查看项目')),
        h('div', { className: 'at-tbd-remark' + (p && p.remark ? '' : ' none') },
          p && p.remark ? p.remark : '未填写备注'),
        h('div', { className: 'at-tbd-cols' },
          h('div', { className: 'at-tbd-group' },
            h('span', { className: 'at-tbd-group-t' }, '所属 agent'),
            agent
              ? h('div', { className: 'at-tbd-pair' },
                h('button', { type: 'button', className: 'at-tbd-agent',
                  title: '去看「我的 · Agent」',
                  onClick: function () { S.setView('mine') } },
                  h('span', { className: 'at-tbd-agent-n' }, agent.name)),
                h('span', { className: 'at-tbd-sep' }),
                h('div', { className: 'at-tbd-cell' },
                  h('span', { className: 'at-tbd-lab' }, '距离重置'),
                  h('span', { className: 'at-tbd-val' }, resetInOf(agent))))
              : h('div', { className: 'at-tbd-pair' },
                h('span', { className: 'at-tbd-agent-none' }, '未关联 agent'))),
          h('div', { className: 'at-tbd-group' },
            h('span', { className: 'at-tbd-group-t' }, '项目概要'),
            h('div', { className: 'at-tbd-pair' },
              h('div', { className: 'at-tbd-cell' },
                h('span', { className: 'at-tbd-lab' }, '未完成待办'),
                h('span', { className: 'at-tbd-val' }, sum.open + ' 条')),
              h('span', { className: 'at-tbd-sep' }),
              h('div', { className: 'at-tbd-cell' },
                h('span', { className: 'at-tbd-lab' }, '已完成待办'),
                h('span', { className: 'at-tbd-val' }, sum.done + ' 条')),
              h('span', { className: 'at-tbd-sep' }),
              h('div', { className: 'at-tbd-cell' },
                h('span', { className: 'at-tbd-lab' }, '项目脑图'),
                h('span', { className: 'at-tbd-val' }, sum.mindmaps + ' 张')))))),

      /* ② 操作 —— 三态通栏动作条（四段严格等分，主键占第一段） */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'sliders-b', size: 16 }), '操作'),
        h('div', { className: 'at-tbd-ops' + (gone ? ' solo' : '') },
          ops.map(function (o) {
            return h('button', { key: o.key, type: 'button',
              className: 'at-tbd-op' + (o.main ? ' is-main' : '') + (o.danger ? ' is-danger' : ''),
              onClick: o.run },
              h(U.Icon, { name: o.icon, size: o.main ? 14 : 13, tone: o.main ? 'ink' : '' }),
              o.name)
          }))),

      /* ③ 待办信息 —— 紧急度色条 ＋ 档名 ＋ 互斥徽章 ＋ 创建/完成时间 ＋ 正文 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'info-b', size: 16 }), '待办信息'),
        h('div', { className: 'at-tbd-hero-top' },
          h('span', { className: 'at-tbd-flag', style: { background: urgencyInk(t.urgency) } }),
          h('span', { className: 'at-tbd-urg', style: { color: urgencyInkText(t.urgency) } }, u.name),
          gone
            ? h('span', { className: 'at-tbd-badge gone' }, '已删除')
            : (t.done ? h('span', { className: 'at-tbd-badge done' }, '已完成') : null),
          h('span', { className: 'at-tbd-at' },
            '创建于 ' + Core.atMin(t.createdAt) +
            (t.completedAt ? ' · 完成于 ' + Core.atMin(t.completedAt) : ''))),
        h('div', { className: 'at-tbd-text' }, t.text)),

      /* ④ 闪念胶囊 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'bolt', size: 16 }),
          '闪念胶囊' + (caps.length ? ' ' + caps.length : '')),
        caps.length
          ? h('div', { className: 'at-tbd-caps' },
            caps.map(function (c) {
              var img = c.imageUri ? V.imgSrc(s, c.imageUri) : ''
              return h('div', { key: c.id, className: 'at-tbd-cap',
                role: 'button', tabIndex: 0,
                title: '看全文', 'aria-label': '看全文',
                onClick: function () { B.ui({ capView: { todoId: t.id, id: c.id } }) },
                onKeyDown: function (e) {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  B.ui({ capView: { todoId: t.id, id: c.id } })
                } },
                h('span', { className: 'at-tbd-cap-t' }, c.text || '（这条还是空的）'),
                img ? h('img', { className: 'at-tbd-cap-img', src: img, alt: '胶囊配图' }) : null,
                h('span', { className: 'at-tbd-cap-time' }, Core.atMin(c.createdAt)),
                /* ✕ 必须 stopPropagation：卡片现在整块可点开全文，不拦就变成
                 * "先弹全文、再问要不要取消关联"（小程序那颗也是 catchtap）。 */
                gone ? null : h('button', { type: 'button', className: 'at-tbd-cap-x',
                  title: '取消关联', 'aria-label': '取消关联',
                  onClick: function (e) {
                    e.stopPropagation()
                    /* 小程序 248 轮定的二次确认（`wx.showModal`）：胶囊是**别人的记录**，
                     * 取消关联只是把它放回列表 —— 这句话必须说，否则用户以为点在"删除"。 */
                    S.openConfirm({ title: '取消关联这条胶囊？',
                      body: '它不会被删除：会回到闪念胶囊列表的末尾，创建时间按这次解除关联重新记。',
                      confirmText: '取消关联',
                      onConfirm: function () { B.actions.unlinkCapsules(t.id, [c.id]) } })
                  } },
                  /* 反白版是独立资产：w- 前缀让 iconSrc 不加 d- / 不加墨色档，浅深两档都恒白。 */
                  h(U.Icon, { name: 'w-close', size: 14 })))
            }),
            /* 末尾「＋ 选择胶囊」与每格同宽 ⇒ 落在同一条网格线上 */
            gone ? null : h('button', { type: 'button', className: 'at-tbd-cap at-tbd-cap-add',
              onClick: function () { S.openListDrawer('capsule', { todoId: t.id }) } },
              h(U.Icon, { name: 'plus', size: 20, opacity: .5 }), '选择胶囊'))
          : h('div', null,
            h('div', { className: 'at-tbd-blank' }, '这条待办还没有关联闪念胶囊'),
            gone ? null : h('div', { className: 'at-tbd-blank-acts' },
              h('button', { type: 'button', className: 'at-tbd-lg',
                onClick: function () { S.openListDrawer('capsule', { todoId: t.id }) } },
                h(U.Icon, { name: 'plus', size: 15 }), '选择胶囊')))),

      /* ⑤ 图片 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'album-b', size: 16 }),
          '图片' + (images.length ? ' ' + images.length : '')),
        images.length
          ? h('div', { className: 'at-tbd-imgs' },
            images.map(function (im, i) {
              var src = imgSrc(s, im.uri)
              return h('div', { key: im.id || i, className: 'at-tbd-img',
                role: 'button', tabIndex: 0, title: '查看大图', 'aria-label': '查看大图',
                onClick: function () {
                  B.ui({ imgView: {
                    title: '图片',
                    urls: images.map(function (x) { return imgSrc(s, x.uri) }),
                    index: i } })
                },
                onKeyDown: function (e) {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  B.ui({ imgView: {
                    title: '图片',
                    urls: images.map(function (x) { return imgSrc(s, x.uri) }),
                    index: i } })
                } },
                h('img', { src: src, alt: im.label || '图片 ' + (i + 1) }),
                h('span', { className: 'at-tbd-img-no' }, (i + 1) + ' / ' + images.length),
                /* ✕ 同理必须停住冒泡，否则"移除"会顺手把大图也打开。 */
                gone ? null : h('button', { type: 'button', className: 'at-tbd-img-x',
                  title: '移除这张图片', 'aria-label': '移除这张图片',
                  onClick: function (e) { e.stopPropagation(); removeImage(i) } },
                  /* 反白版是独立资产：w- 前缀让 iconSrc 不加 d- / 不加墨色档，浅深两档都恒白。 */
                  h(U.Icon, { name: 'w-close', size: 14 })))
            }),
            gone ? null : h('button', { type: 'button', className: 'at-tbd-img at-tbd-img-add',
              onClick: function () { addImage(t) } },
              h(U.Icon, { name: 'plus', size: 22, opacity: .5 }), '添加图片'))
          : h('div', null,
            h('div', { className: 'at-tbd-blank' }, '这条待办还没有添加图片'),
            gone ? null : h('div', { className: 'at-tbd-blank-acts' },
              h('button', { type: 'button', className: 'at-tbd-lg',
                onClick: function () { addImage(t) } },
                h(U.Icon, { name: 'plus', size: 15 }), '从相册选择')))),

      /* ⑥ 关联脑图 —— 有图时整张只读图顶上来当主角（图本身就是入口） */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'mindmap-b', size: 16 }), '关联脑图'),
        mm
          ? h('div', null,
            h('div', { className: 'at-tbd-mm-box',
              onClick: function () { V.openDetail('mindmap', mm.id) } },
              /* ★ 轮次 13：这里**必须挂成组件**，不能当函数直接调 ——
               * Preview 里有 4 个 hooks，直接调会把它们算到 TodoDetail 头上；
               * 而这段挂在 `mm ? … : …` 的条件分支里，有/无脑图的待办来回切
               * 就是 hooks 数量忽多忽少 ⇒ 整页崩。
               * ⚠️ 要用 `PreviewView`（真组件，签名 `props`)而不是 `Preview`
               * （那个是 `previewOf(s, mm)` 的位置参数包装，h() 只会传 props，
               *   mm 当场变 undefined —— 第一版就栽在这里）。 */
              AT.mindmap && AT.mindmap.PreviewView
                ? h(AT.mindmap.PreviewView, { key: mm.id, s: s, mm: mm }) : null),
            h('div', { className: 'at-tbd-mm-info' },
              h('span', { className: 'at-tbd-mm-name' }, mm.name),
              h('span', { className: 'at-tbd-mm-meta' },
                (mm.nodes || 0) + ' 节点 · ' + (mm.depth || 0) + ' 层 · ' +
                Core.atMin(mm.updatedAt || mm.createdAt))),
            h('div', { className: 'at-tbd-mm-acts' },
              gone ? null : h('button', { type: 'button', className: 'at-tbd-lg',
                onClick: function () {
                  S.openConfirm({ title: '取消关联脑图？', body: '脑图本身不会被删除。',
                    onConfirm: function () { B.actions.updateTodo(t.id, { mindmapId: null }) } })
                } },
                h(U.Icon, { name: 'close', size: 15 }), '取消关联'),
              gone ? null : h('button', { type: 'button', className: 'at-tbd-lg',
                onClick: function () { S.openListDrawer('mindmap', { pickTodoId: t.id }) } },
                h(U.Icon, { name: 'refresh', size: 15 }), '替换')))
          : h('div', null,
            h('div', { className: 'at-tbd-blank' }, '这条待办还没有关联脑图'),
            gone ? null : h('div', { className: 'at-tbd-blank-acts' },
              h('button', { type: 'button', className: 'at-tbd-lg',
                onClick: function () { S.openListDrawer('mindmap', { pickTodoId: t.id }) } },
                h(U.Icon, { name: 'plus', size: 15 }), '关联脑图')))),

      /* 两个查看层挂在这里（position:fixed，不占流内空间）。
       * 图片层放前、胶囊全文层放后 ⇒ 从胶囊全文里点图时，图片层叠在它上面。 */
      ImageViewer(s),
      CapsuleViewer(s, t))
  }
  function confirmDeleteTodo(t) {
    S.openConfirm({ title: '删除「' + (t.text || '这条待办').slice(0, 18) + '」？',
      /* 与 小程序 mod-todo.js 同一句口径：逻辑删除、可还原，指向列表的「已删除」档。 */
      body: '它不会消失：在待办列表的「筛选 → 已删除」里可以还原；关联的脑图不会被删。',
      confirmText: '删除',
      onConfirm: function () { B.actions.removeTodo(t.id) } })
  }
  function addImage(t) {
    pickImage(async function (file) {
      try {
        var uri
        if (B.get().ui.connected) uri = (await B.uploadImage(file)).uri
        else uri = URL.createObjectURL(file)
        var images = t.images.concat([{ id: Core.uid('i'), label: file.name || '', uri: uri }])
        await B.actions.updateTodo(t.id, { images: images })
      } catch (e) { B.toast(e.message, 'danger') }
    })
  }

  /* ------------------------------------------------------------- 我的 ---
   * 严格对齐 小程序前端/components/mod-mine 的 **PC / 横屏**那一档。
   * 四块自上而下、整页可滚：① 个人资料 ② Agent ③ Token API ④ 应用提示 —— **只此四块**。
   * ★ 插件原来多收了一块「连接与回收站」（数据源 / 连接账号 / 同步 / 断开 / 最近删除），
   *   2026-11-07 用户口径：小程序端没有的功能一律拿掉。三个连接动作仍有入口：
   *   顶栏「已连接 / 请登录」状态键（登录闸门）、顶栏刷新键（同步）、闸门里的「退出登录」；
   *   还原则回到待办列表「筛选 → 已删除」（与小程序 store.filterTodos 同名档）。
   * ⚠️ Agent 卡数据走 Core.agentCardViews() —— 与概览「Agent 概况」同一份装配：
   *   157 轮起「当前剩余 / 更新于」已从卡面撤下，这里不许再把手填余额抄回来。
   */
  var VENDOR_NAMES = { deepseek: 'DeepSeek' }
  function vendorName(code) {
    return VENDOR_NAMES[String(code || '').toLowerCase()] || String(code == null ? '' : code)
  }
  /* 复刻小程序 store.amountOf()：'¥ 128.40' / '1,240' / 数字都能读出量。
   * 插件后端把余额记成「分」，所以数值档先 /100 再判「低于 ¥10」。 */
  function amountOf(v) {
    var m = /-?\d+(?:\.\d+)?/.exec(String(v == null ? '' : v).replace(/,/g, ''))
    return m ? Number(m[0]) : null
  }
  function balanceText(k) {
    /* ⚠️ 0 / '' / null 一律是「还没有数」，不是「余额为零」—— 小程序用 `k.balance || ''`
     * 判空，写成 ¥ 0.00 会让「待配置 / 待查询」两态永远不出现，还会误标「余额偏低」。 */
    var v = k.balance
    if (!v) return ''
    if (typeof v === 'number' && isFinite(v)) return '¥ ' + (v / 100).toFixed(2)
    return String(v)
  }
  function balanceLow(k) {
    if (!k.balance) return false
    var amt = typeof k.balance === 'number' ? k.balance / 100 : amountOf(k.balance)
    return amt !== null && isFinite(amt) && amt < 10
  }
  function projectColor(key) {
    var dark = AT.icons.isDark()
    if (dark && C.PROJECT_DARK[key]) return C.PROJECT_DARK[key]
    var c = C.colorOf(key)
    return c ? c.main : (dark ? C.NONE_COLOR_DARK : C.NONE_COLOR)
  }
  /* 空态复用概览那套 .at-ov-blank（＝ 小程序 .blank-box / .blank-box-s 两级）。 */
  function mineBlank(main, sub) {
    return h('div', { className: 'at-ov-blank' }, h('span', null, main),
      h('span', { className: 'at-ov-blank-s' }, sub))
  }
  var QR_SRC = '/agent-todo/assets/qr-official.jpg'
  /* 五条标签必须同为 2 字（正文起始 x 靠字数 + gap 对齐，没有写死宽度）；
   * 条目句末不带句号；产品名一律 Agent-ToDo。逐字照抄 mod-mine.wxml 207-230。 */
  var TIP_ROWS = [
    ['面向', 'FDE（前沿部署工程师），快速跟踪所属项目的需求，顺手整理 Agent 需要的上下文'],
    ['版本', '当前为演示版，欢迎随意体验；功能高频更新，数据不承诺保存'],
    ['初衷', '驻场之后，为这家企业单独搭一套 Agent-ToDo，而不是共用一套'],
    ['安全', '每个软件功能背后的变更需求才是企业更重要的资产，独立部署更完全'],
    ['开源', '前后端代码都已开源，需要代码或有项目想聊，都欢迎扫码私信我']
  ]

  function AgentCard(s, a) {
    var ps = s.projects.filter(function (p) { return p.agentId === a.id })
    return h('div', { key: a.id, className: 'at-mi-card at-mi-ag' },
      h('div', { className: 'at-ov-ag-row1' },
        h('span', { className: 'at-ov-ag-name', title: a.name }, a.name),
        h('span', { className: 'at-mi-acts' },
          h('button', { type: 'button', className: 'at-mi-tb',
            onClick: function () { S.openForm('agent', a.id) } },
            h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'),
          h('button', { type: 'button', className: 'at-mi-tb icon', title: '删除', 'aria-label': '删除',
            onClick: function () {
              S.openConfirm({ title: '删除「' + a.name + '」？',
                body: '有项目关联着它时，这些项目的「关联 agent」会被清空，但项目本身一个都不会删。',
                onConfirm: function () { B.actions.removeAgent(a.id) } })
            } }, h(U.Icon, { name: 'trash-red', size: 14 })))),
      /* 与概览 AgentSection 逐字同构：圆环（距离重置）+ 每月套餐 / 承担项目 */
      h('div', { className: 'at-ov-ag-body' },
        h('div', { className: 'at-ov-ag-ring-wrap' },
          h('span', { className: 'at-ov-ag-ring', style: { '--ring-deg': a.ringDeg + 'deg' } },
            h('span', { className: 'at-ov-ag-ring-core' },
              h('span', { className: 'at-ov-ag-ring-num atx-num' +
                (a.resetMuted ? ' is-muted' : '') }, a.resetNum),
              a.resetUnit ? h('span', { className: 'at-ov-ag-ring-unit' }, a.resetUnit) : null)),
          h('span', { className: 'at-ov-ag-ring-lab' }, '距离重置')),
        h('div', { className: 'at-ov-ag-meta' },
          h('div', { className: 'at-ov-ag-mcell' },
            h('span', { className: 'at-ov-ag-lab' }, '每月套餐'),
            h('span', { className: 'at-ov-ag-val atx-num' }, String(a.monthlyQuota))),
          h('span', { className: 'at-ov-ag-mdiv' }),
          h('div', { className: 'at-ov-ag-mcell' },
            h('span', { className: 'at-ov-ag-lab' }, '承担项目'),
            h('span', { className: 'at-ov-ag-val atx-num' }, a.projectCount + ' 项')))),
      h('div', { className: 'at-mi-chips' }, ps.length ? ps.map(function (p) {
        return h('button', { key: p.id, type: 'button',
          className: 'at-mi-chip' + (p.archivedAt ? ' is-arc' : ''),
          onClick: function () { V.openDetail('project', p.id) } },
          h('span', { className: 'at-mi-dot-sm', style: { background: projectColor(p.color) } }),
          h('span', { className: 'at-mi-chip-t' }, p.name),
          p.archivedAt ? h('span', { className: 'at-mi-chip-arc' }, '已归档') : null)
      }) : h('span', { className: 'at-mi-none' }, '暂无关联项目')))
  }

  function TokenCard(k) {
    var bal = balanceText(k)
    return h('div', { key: k.id, className: 'at-mi-card at-mi-tk' },
      h('div', { className: 'at-ov-ag-row1' },
        h('span', { className: 'at-mi-tk-name', title: vendorName(k.vendor) }, vendorName(k.vendor)),
        h('span', { className: 'at-mi-acts' },
          h('button', { type: 'button', className: 'at-mi-tb',
            onClick: function () { S.openForm('token', k.id) } },
            h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'),
          h('button', { type: 'button', className: 'at-mi-tb icon', title: '删除', 'aria-label': '删除',
            onClick: function () {
              S.openConfirm({ title: '删除这个 API？',
                body: '它存下的余额数据会一起删掉，不影响任何项目或待办。',
                onConfirm: function () { B.actions.removeToken(k.id) } })
            } }, h(U.Icon, { name: 'trash-red', size: 14 })))),
      h('div', { className: 'at-mi-bal' },
        bal ? h('span', { className: 'at-mi-bal-v atx-num' }, bal)
          /* 「待配置」＝ 还没填 key（要动手，警示色）；「待查询」＝ 配好了还没查回来（灰） */
          : h('span', { className: 'at-mi-bal-v at-mi-bal-pending' +
            (!k.hasKey ? ' at-mi-bal-warn' : '') }, !k.hasKey ? '待配置' : '待查询'),
        bal && balanceLow(k) ? h('span', { className: 'at-mi-status' }, '余额偏低') : null),
      h('div', { className: 'at-mi-foot' },
        k.keyMask ? h('span', null, k.keyMask) : null,
        h('span', { className: 'at-mi-flex' }),
        k.balanceAt ? h('span', null, '更新于 ' + Core.atMin(k.balanceAt)) : null),
      k.lastError ? h('div', { className: 'at-mi-err' }, k.lastError) : null)
  }

  function MineBody(s) {
    var me = s.me || {}, agents = Core.agentCardViews(s), tokens = s.tokenKeys || []
    return h('div', { className: 'at-mi' },
      h(U.Section, { key: 'me', title: '个人资料', icon: 'mine-b' },
        h('div', { className: 'at-mi-card at-mi-me' },
          h('span', { className: 'at-mi-avatar' },
            (me.avatarUri || me.avatar)
              ? h('img', { src: imgSrc(s, me.avatarUri || me.avatar), alt: '' })
              : h(U.Icon, { name: 'mine', size: 28, opacity: .5 })),
          h('span', { className: 'at-mi-me-name' }, me.name || '我的工位'),
          h('span', { className: 'at-mi-flex' }),
          h('button', { type: 'button', className: 'at-mi-tb',
            onClick: function () { S.openForm('profile', '') } },
            h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'))),
      h(U.Section, { key: 'ag', title: 'Agent', icon: 'robot-b',
        extra: h('button', { type: 'button', className: 'at-mi-sec-btn',
          onClick: function () { S.openForm('agent', '') } },
          h(U.Icon, { name: 'w-plus', size: 14 }), '新建 Agent') },
        agents.length ? h('div', { className: 'at-mi-grid' }, agents.map(function (a) {
          return AgentCard(s, a)
        })) : mineBlank('还没有 agent 档案。', '新建一个，填上每月套餐与额度重置日即可。')),
      h(U.Section, { key: 'tk', title: 'Token API', icon: 'key-b',
        extra: h('button', { type: 'button', className: 'at-mi-sec-btn',
          onClick: function () { S.openForm('token', '') } },
          h(U.Icon, { name: 'w-plus', size: 14 }), '添加 API') },
        tokens.length ? h('div', { className: 'at-mi-grid' }, tokens.map(function (k) {
          return TokenCard(k)
        })) : mineBlank('还没有添加任何模型厂家 key。', '选好厂商、贴上 API Key，余额会自动查回来。')),
      h(U.Section, { key: 'tip', title: '应用提示', icon: 'info-b' },
        h('div', { className: 'at-mi-card at-mi-tip' },
          h('div', { className: 'at-mi-tip-body' }, TIP_ROWS.map(function (r) {
            return h('div', { key: r[0], className: 'at-mi-tip-row' },
              h('span', { className: 'at-mi-tip-k' }, r[0]),
              h('span', { className: 'at-mi-tip-v' }, r[1]))
          })),
          /* 二维码瓦片跨主题恒白（--at-qr），不随卡面走。 */
          h('div', { className: 'at-mi-qr' },
            h('div', { className: 'at-mi-qr-tile' },
              h('img', { className: 'at-mi-qr-img', src: QR_SRC, alt: '公众号二维码' })),
            h('span', { className: 'at-mi-qr-cap' }, '公众号 · 扫码私信')))))
  }

  /* 兼容旧入口：实际分发已交给 AT.panes.render。 */
  function render(s, ctx) { return AT.panes.render(s) }

  /* 60-views-a.js 用 `AT.views = { STYLE, ... }` 整体赋值 ⇒ 本模块只能**追加**样式。
   * 若写成 Object.assign(AT.views, { STYLE: MINE_STYLE })，概览整套 .at-ov-* 会被静默抹掉
   * （50-shell.js 的 styleTag 只在渲染期读一次 AT.views.STYLE，症状是概览整页失去样式）。 */
  AT.views.STYLE = (AT.views.STYLE || '') + MINE_STYLE + TODO_STYLE

  Object.assign(AT.views, {
    confirmDeleteTodo: confirmDeleteTodo,
    TodoBody: TodoBody, TodoView: function (s) { return TodoBody(s, Core.byId(s.todos, s.ui.todoId)) },
    MineBody: MineBody, MineView: MineBody, render: render,
    MINE_STYLE: MINE_STYLE, TODO_STYLE: TODO_STYLE, resetInOf: resetInOf,
    TIP_ROWS: TIP_ROWS, vendorName: vendorName,
    imgSrc: imgSrc, pickImage: pickImage
  })
})(AT, React, h)
