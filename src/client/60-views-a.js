/* 60-views-a.js — 概览 / 项目 的「页内内容体」。
 * 头部与滚动容器由 AT.panes 统一提供，这里只产出内容，不再自带 WorkHead。
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text, S = AT.shell

  var STYLE = [
    /* ============ 概览（对齐 小程序前端/components/mod-overview 的 **PC / 横屏**档） ============
     * 尺寸逐值同源，改任何一条都请对着那边的 wxss 一起改：
     *   · 热力格 36 / 列 gap 6 / 行 gap 6 / 圆角 8；星期轴 36 宽、格 36 高、margin-top 18
     *     （＝周号尺 14 ＋ gap 4，让七个字与七行格子对齐）；网格高 288 ＝ 7×36＋6×6；
     *   · 热力卡 padding 20 / gap 14（`.card.heat`）、明细条 32 高 / 圆角 10 / `--surface` 底；
     *   · 项目卡：12 圆角 / 10 内边距 / gap 8，四档条贴卡底（`margin-top:auto`）、
     *     档名 9.5/500 灰、数字 17/700 档色（数字才是对齐轴，档名只是注脚）；
     *   · agent 卡：14 圆角 / 14 内边距、灰块 `--surface` 圆角 10 / padding 10 14、
     *     圆环 80（内圆 60）/ 圆心 23 / 值 19。
     * ⚠️ 颜色不走本地 hex：令牌见 40-ui 的 LIGHT/DARK（含 `--at-ring-*`）；
     *   热力 5 档与四档统计色是"随主题变的数据色"，由视图按 `AT.icons.isDark()` 现取。 */
    /* 三块之间的视觉间距 20 ＝ 小程序「容器 gap 12 ＋ `.sec-head` 上间距 8」；
     * 内容宽上限 1180 ≈ 小程序横屏的 1168。 */
    '.at-ov{display:flex;flex-direction:column;gap:20px;max-width:1180px;margin:0 auto;min-width:0}',
    '.at-ov .at-section{margin-bottom:0}',

    /* ① 活跃度日历 */
    /* 卡高按小程序 PC 那一档：`.sec-heat` 定高 496 − 区块头 42 ＝ **454**；
     * 内容 358（306 网格 ＋ 20 图例 ＋ 32 明细）＋ padding 40 ＋ 两段 gap 28 ＝ 426
     * ⇒ 余下 28 由 `space-between` 摊到两段 gap 上（各 28），
     * 所以这里是「gap 14 ＋ 最小高 454 ＋ space-between」而不是把 gap 直接写成 28：
     * 窄窗图例换行时卡要能自己长高（`min-height` 才允许），定死 gap 就长不动了。 */
    '.at-ov-heat{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
    'padding:20px;display:flex;flex-direction:column;gap:14px;justify-content:space-between;',
    'min-height:454px}',
    '.at-ov-heat-body{display:flex;flex-direction:row;gap:6px;height:306px;overflow:hidden}',
    '.at-ov-heat-axis{flex:0 0 36px;width:36px;margin-top:18px;display:flex;flex-direction:column;gap:6px}',
    '.at-ov-heat-axis-cell{width:36px;height:36px;display:flex;align-items:center;justify-content:center}',
    '.at-ov-heat-axis-t{font-size:11px;color:var(--at-muted)}',
    '.at-ov-heat-right{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
    '.at-ov-heat-scroll{width:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}',
    '.at-ov-heat-scroll::-webkit-scrollbar{width:0;height:0;display:none}',
    '.at-ov-heat-inner{width:max-content}',
    '.at-ov-heat-ruler{height:14px;display:flex;gap:6px}',
    '.at-ov-heat-ruler-cell{width:36px;flex:0 0 36px;display:flex;align-items:center;justify-content:center}',
    '.at-ov-heat-ruler-t{font-size:11px;color:var(--at-muted)}',
    '.at-ov-heat-grid{height:288px;display:flex;gap:6px}',
    '.at-ov-heat-col{width:36px;flex:0 0 36px;display:flex;flex-direction:column;gap:6px}',
    '.at-ov-heat-cell{position:relative;width:36px;height:36px;padding:0;border:0;border-radius:8px;',
    'cursor:pointer;background:var(--at-chip)}',
    /* 按下只压透明度：底色是内联的语义色阶（深浅＝活跃度），改底会与那条语义打架。 */
    '.at-ov-heat-cell:hover{opacity:.82}',
    '.at-ov-heat-mark{position:absolute;left:0;top:0;right:0;bottom:0}',
    '.at-ov-heat-mark:before,.at-ov-heat-mark:after{content:""}',
    '.at-ov-heat-mark:before,.at-ov-heat-mark:after,.at-ov-heat-mark i{position:absolute;',
    'width:6px;height:6px}',
    '.at-ov-heat-mark:before{left:7px;top:7px;border-top:2px solid var(--at-primary);',
    'border-left:2px solid var(--at-primary)}',
    '.at-ov-heat-mark:after{right:7px;bottom:7px;border-bottom:2px solid var(--at-primary);',
    'border-right:2px solid var(--at-primary)}',
    '.at-ov-heat-mark i.tr{right:7px;top:7px;border-top:2px solid var(--at-primary);',
    'border-right:2px solid var(--at-primary)}',
    '.at-ov-heat-mark i.bl{left:7px;bottom:7px;border-bottom:2px solid var(--at-primary);',
    'border-left:2px solid var(--at-primary)}',
    /* 亮档（level ≥ 3）的括标改恒墨 `--on-accent` —— 深色下那两格是亮黄，
     * 柔白括标只剩 1.25:1（浅色下 primary 与 on-accent 同值，零变化）。 */
    '.at-ov-heat-cell.is-hi .at-ov-heat-mark:before,.at-ov-heat-cell.is-hi .at-ov-heat-mark:after,',
    '.at-ov-heat-cell.is-hi .at-ov-heat-mark i{border-color:var(--at-on-accent)}',
    '.at-ov-heat-legend{display:flex;flex-direction:row;align-items:center;gap:8px;min-height:20px}',
    '.at-ov-legend-lab{font-size:12px;color:var(--at-muted);flex:0 0 auto}',
    '.at-ov-legend-scale{width:116px;height:20px;display:flex;gap:4px;flex:0 0 auto}',
    '.at-ov-legend-scale i{width:20px;height:20px;border-radius:4px;display:block}',
    '.at-ov-legend-flex{flex:1;min-width:0}',
    '.at-ov-legend-note{font-size:12px;color:var(--at-muted);white-space:nowrap}',
    '.at-ov-heat-detail{flex:0 0 32px;height:32px;border-radius:10px;background:var(--at-surface);',
    'padding:0 12px;display:flex;flex-direction:row;align-items:center;gap:8px;overflow:hidden}',
    '.at-ov-hd-strong{font-size:14px;font-weight:500;color:var(--at-primary);white-space:nowrap}',
    /* 三源分色与小程序一致：创建走蓝（`--at-blue` 在桌面被收敛成主墨，这里用补充令牌
     * `--atx-blue` 保住"两条序列要分辨"这条语义）、完成走绿、胶囊走正文灰。 */
    '.at-ov-hd-created{font-size:13px;font-weight:500;color:var(--atx-blue);white-space:nowrap}',
    '.at-ov-hd-done{font-size:13px;font-weight:500;color:var(--at-success);white-space:nowrap}',
    '.at-ov-hd-cap{font-size:13px;font-weight:500;color:var(--at-slate);white-space:nowrap}',
    /* 分隔符与末尾的「合值」走小程序 `.t-12`（13px / `--slate`）—— 不是 `--text-2`：
     * 那两支在浅色下差一档（#555A6A vs #686C7A），明细条整行读起来会轻重不一。 */
    '.at-ov-hd-sep{font-size:13px;color:var(--at-slate);flex:0 0 auto}',
    '.at-ov-hd-sum{font-size:13px;color:var(--at-slate);white-space:nowrap}',

    /* ② 项目待办统计 —— **卡里套卡**：小程序是 `.card.stats`（白底 14 圆角 / 内距 14×16）
     * 装着 `.ps-grid`，卡面自己也是白底带描边 ⇒ 这一层不能省，否则四张小卡直接浮在页面底上，
     * 与「活跃度日历」「Agent 概况」两块的容器感就断了一档。 */
    '.at-ov-stats{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
    'padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}',
    /* 列数：卡宽守在**小程序那一档**（横屏 4 列的各 276.5 与竖屏 2 列的各 355 之间），
     * 由 `minmax(250px,1fr)` 连续降级 —— 内容 1146 时正好 4 列 × 279，与小程序 276.5 同档。
     * ⚠️ 小程序只有两个**定宽画布**（1168 → 4 列 / 768 → 2 列），DSH 面板是连续宽度，
     *    所以这里会多出 3 列这一档：那是"卡宽不越界"换来的，不是漏抄 4 列。
     * `align-items:stretch` 让同一行的卡等高，四档条才能落在同一条水平线上横向比对。 */
    '.at-ov-ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));',
    'gap:10px;align-items:stretch}',
    '.at-ov-ps-cell{display:flex;min-width:0;padding:0;border:0;background:none;text-align:left;',
    'font:inherit;color:inherit;cursor:pointer}',
    '.at-ov-ps-card{flex:1 1 auto;min-width:0;background:var(--at-card);',
    'border:1px solid var(--at-hairline);border-radius:12px;padding:10px;display:flex;',
    'flex-direction:column;gap:8px}',
    '.at-ov-ps-cell:hover .at-ov-ps-card{background:var(--at-chip)}',
    '.at-ov-ps-head{display:flex;flex-direction:row;align-items:center;gap:8px}',
    '.at-ov-ps-dot{width:16px;height:16px;border-radius:999px;flex:0 0 16px}',
    '.at-ov-ps-name{flex:1;min-width:0;font-size:15px;font-weight:500;line-height:17px;',
    'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* 节点徽章：尺寸是概览这一档（3px 8px / 11px），颜色由视图按主题现取
     * （＝ `--u-mid-bg` / `--u-mid-t` 的浅深两套）。 */
    '.at-ov-badge{display:inline-flex;align-items:center;flex:0 0 auto;padding:3px 8px;',
    'border-radius:999px;font-size:11px;white-space:nowrap}',
    '.at-ov-ps-foot{display:flex;flex-direction:row;align-items:center;gap:6px;padding:0 2px;',
    'min-width:0;flex-wrap:wrap}',
    '.at-ov-ps-meta{font-size:11px;color:var(--at-muted);white-space:nowrap}',
    /* 分隔符走文字档 `--stone`，不借描边令牌（白底只有 1.7:1，深色下直接消失）。 */
    '.at-ov-ps-sep{font-size:11px;color:var(--at-stone)}',
    '.at-ov-ps-stat{margin-top:auto;border:1px solid var(--at-hairline);border-radius:8px;',
    'background:var(--at-card);padding:6px 8px;display:flex;flex-direction:row;align-items:center;',
    'gap:8px;flex-wrap:wrap}',
    '.at-ov-ps-s{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px}',
    '.at-ov-ps-s-t{font-size:9.5px;font-weight:500;line-height:1;color:var(--at-stone);white-space:nowrap}',
    '.at-ov-ps-s-n{font-size:17px;font-weight:700;line-height:1;letter-spacing:-.3px;',
    'font-variant-numeric:tabular-nums}',
    '.at-ov-ps-s.is-zero .at-ov-ps-s-t{color:var(--at-muted)}',
    '.at-ov-ps-s.is-zero .at-ov-ps-s-n{color:var(--at-muted);font-weight:600}',

    /* ③ Agent 概况 */
    /* 列数：小程序**横竖都是 2 列**（横屏 1168 → 各 578，竖屏 768 → 各 378，
     * 从来没出现过一行一张）⇒ 这里也**写死 2 列**、只在极窄时降为 1 列。
     * ⚠️ 别退回 `auto-fill + minmax(...)`：内容 1180 时它会切出 3 列（实测 385×3），
     *    而小程序这张卡永远是"一行两张"。 */
    '.at-ov-ag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));',
    'gap:12px;align-items:stretch}',
    '@container (max-width:660px){.at-ov-ag-grid{grid-template-columns:minmax(0,1fr)}}',
    '.at-ov-ag-card{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
    'padding:14px;display:flex;flex-direction:column;gap:10px;text-align:left;font:inherit;',
    'color:inherit;cursor:pointer}',
    '.at-ov-ag-card:hover{background:var(--at-chip)}',
    '.at-ov-ag-row1{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:10px}',
    '.at-ov-ag-name{flex:1;min-width:0;font-size:17px;font-weight:600;color:var(--at-primary);',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-ov-ag-body{display:flex;flex-direction:row;align-items:center;gap:18px;',
    'background:var(--at-surface);border-radius:10px;padding:10px 14px}',
    '.at-ov-ag-ring-wrap{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:5px}',
    /* 圆环：`--ring-deg` 由视图 inline 下发（`Core.ringOf` 算）。
     * 第一行 `background: var(--at-ring-track)` 是不吃 conic-gradient 时的有意退化。 */
    '.at-ov-ag-ring{--ring-deg:0deg;width:80px;height:80px;border-radius:50%;',
    'background:var(--at-ring-track);background:conic-gradient(var(--at-ring-a) 0deg,',
    'var(--at-ring-b) var(--ring-deg),var(--at-ring-track) var(--ring-deg) 360deg);',
    'display:flex;align-items:center;justify-content:center}',
    '.at-ov-ag-ring-core{width:60px;height:60px;border-radius:50%;background:var(--at-surface);',
    'display:flex;flex-direction:row;align-items:center;justify-content:center}',
    '.at-ov-ag-ring-num{font-size:23px;font-weight:600;color:var(--at-primary);line-height:1}',
    '.at-ov-ag-ring-num.is-muted{font-size:13px;font-weight:500;color:var(--at-muted)}',
    '.at-ov-ag-ring-unit{font-size:11px;color:var(--at-muted);line-height:1;margin-left:2px;margin-top:8px}',
    '.at-ov-ag-ring-lab{font-size:11px;color:var(--at-muted);white-space:nowrap}',
    '.at-ov-ag-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}',
    '.at-ov-ag-mcell{display:flex;flex-direction:column;gap:3px;min-width:0}',
    '.at-ov-ag-mdiv{height:1px;background:var(--at-hairline-soft)}',
    '.at-ov-ag-lab{font-size:12px;color:var(--at-muted);white-space:nowrap}',
    '.at-ov-ag-val{font-size:19px;font-weight:600;color:var(--at-primary);white-space:nowrap;',
    'overflow:hidden;text-overflow:ellipsis}',

    /* 空态 ＝ 小程序 `.blank-box` / `.blank-box-s`（虚线框 / 居中 / 13-12 两级） */
    '.at-ov-blank{box-sizing:border-box;padding:22px 14px;border:1px dashed var(--at-hairline-strong);',
    'border-radius:12px;text-align:center;font-size:13px;font-weight:500;line-height:1.7;',
    'color:var(--at-slate)}',
    '.at-ov-blank-s{display:block;margin-top:4px;font-size:12px;font-weight:400;line-height:1.6;color:var(--at-slate)}',
    /* 窄窗只收热力卡的留白；格子尺寸不退档 —— 它本来就能横滚，缩格反而让"共 30 周"更难读。 */
    '@container (max-width:700px){.at-ov-heat{padding:14px}',
    '.at-ov-heat-legend{flex-wrap:wrap}.at-ov-legend-note{white-space:normal}}',

    /* ---- 项目页 / 详情页通用件（at-metric / at-tile 仍被 ProjectBody 使用） ---- */
    '.at-metric{display:flex;flex-direction:column;gap:4px;padding:12px 14px;',
    'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
    'box-shadow:var(--at-sh-card)}',
    '.at-metric b{font-size:22px;font-weight:600;line-height:1.2;font-family:var(--at-font-num)}',
    '.at-metric span{font-size:12px;color:var(--at-text2)}',
    '.at-tile{display:flex;flex-direction:column;gap:6px;padding:12px;',
    'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
    'box-shadow:var(--at-sh-card);text-align:left;cursor:pointer;min-width:0;font:inherit;',
    'color:var(--at-primary)}',
    '.at-tile:hover{background:var(--at-chip)}',
    '.at-tile-title{font-size:14px;font-weight:500;line-height:1.4;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap}',
    '.at-tile-meta{font-size:12px;color:var(--at-text2);line-height:1.5}',
    '.at-image-grid{display:flex;gap:8px;flex-wrap:wrap}',
    '.at-thumb{position:relative;width:88px;height:88px;border:1px solid var(--at-hairline);',
    'border-radius:10px;overflow:hidden;background:var(--at-chip)}',
    '.at-thumb img{width:100%;height:100%;object-fit:cover;display:block}',
    '.at-thumb-x{position:absolute;top:3px;right:3px;width:20px;height:20px;border:0;',
    'border-radius:6px;background:var(--at-mask);color:#fff;font-size:12px;',
    'line-height:20px;text-align:center;cursor:pointer}',
    '.at-add-tile{display:flex;align-items:center;justify-content:center;width:88px;height:88px;',
    'border:1px dashed var(--at-hairline-strong);border-radius:10px;background:transparent;',
    'color:var(--at-muted);cursor:pointer;font-size:12px;font-family:inherit}',
    '.at-add-tile:hover{background:var(--at-chip)}',
    '.at-thumb-x:hover{opacity:.82}',
    '.at-code{white-space:pre-wrap;word-break:break-word;',
    'font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.6;',
    'padding:11px;border:1px solid var(--at-hairline);border-radius:10px;',
    'background:var(--at-card-dim);max-height:40vh;overflow:auto}',
    '.at-capsule-mini{display:flex;flex-direction:column;gap:7px}',
    '.at-capsule-item{padding:10px 12px;border:1px solid var(--at-hairline-soft);',
    'border-radius:10px;background:var(--at-card-dim);font-size:13px;line-height:1.55}',
    '.at-section-note{font-size:12px;color:var(--at-text2);margin:-2px 0 10px}',

    /* ---- 项目详情（v1.12 严格对齐 小程序 mod-project PC 档）------------------
     * 三块：基础信息 ／ 项目待办 ／ 项目脑图。
     * 基础信息卡与待办详情那块**同构**（共用 `.at-tbd-row1` / `.at-tbd-cols` 一套类，
     * 见 62-views-b.js 的 TODO_STYLE），所以这里只补项目独有的两处：
     * 四档紧急度键 与 脑图卡（左格式简图 56×40 ＋ 右三行文字）。
     * ⚠️ 尺寸照抄小程序：简图 56×40（169 轮「简图高度加大，右侧是三行文字」）、
     *    三行文字按深浅两级灰分主次（168 轮）。 */
    '.at-pj{display:flex;flex-direction:column;gap:12px;max-width:880px;margin:0 auto;min-width:0}',
    '.at-pj .at-block-title{display:flex;align-items:center;gap:6px}',

    /* ① 四档紧急度 —— **可点筛选**（156 轮）；计数与网格同源，只数未完成。
     * 选中态不套黑色：四档各自的颜色就是身份，选中改用该档浅底 ＋ 深字。 */
    '.at-pj-stat{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}',
    '.at-pj-urgs{display:flex;gap:6px;flex-wrap:wrap}',
    '.at-pj-urg{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;',
    'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-card);',
    'font-size:12px;font-family:inherit;cursor:pointer;color:var(--at-slate)}',
    '.at-pj-urg:hover{background:var(--at-chip);border-color:var(--at-hairline-strong)}',
    '.at-pj-urg-n{font-weight:600;font-family:var(--at-font-num)}',
    '.at-pj-score{margin-left:auto;font-size:12px;color:var(--at-text2);white-space:nowrap}',

    /* ② 项目待办网格 —— 紧凑卡，逐值对齐小程序 `todo-card` 的 compact 档（`.tc.mini`）：
     *   色条 4×16 ｜ 正文 14/1.4 三行（min-height 55）｜ 标签行（无标签不渲染）
     *   ｜ 底行 `.tc-foot`：左「更新于 …」右完成圆圈。
     * ★★ 2026-11-10 用户第 3 条订正：完成圆圈原来 `align-self:center` 挂在横排的末尾 ——
     *   那是"卡片垂直中线右侧"，不是"卡片底部右侧"；底部左侧还缺「更新于」。
     *   小程序真源是**三段纵排**（`.tc-main` / `.tc-tags` / `.tc-foot`），
     *   底行 `justify-content:space-between` ＋ `margin-top:auto` 把时间与圆圈压到卡底。
     *   ⚠️ 别再用绝对定位把圆圈钉右下角 —— 底行是它和时间共用的那条线，两者必须同一行。 */
    '.at-pj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}',
    '.at-pj-todo{display:flex;flex-direction:column;gap:8px;padding:10px;',
    'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
    'box-shadow:var(--at-sh-card);text-align:left;font:inherit;color:var(--at-primary);',
    'cursor:pointer;min-width:0}',
    '.at-pj-todo:hover{background:var(--at-chip)}',
    /* `.tc-main`：色条与正文横排、顶对齐。 */
    '.at-pj-todo-head{display:flex;gap:8px;align-items:flex-start;min-width:0}',
    /* `.tc.mini .tc-bar` 是 **16** 高（不是常规档的 20）—— 项目页这张卡本来就矮，
     * 色条再按 20 会超过两行文字的视觉重心。 */
    '.at-pj-todo-bar{width:4px;min-width:4px;flex:0 0 4px;height:16px;min-height:0;',
    'border-radius:2px;align-self:flex-start;margin-top:2px}',
    /* `.tc.mini .tc-text`：14px / 1.4 / 三行；`min-height:55` 让 1 行与 3 行的卡片底行齐平。 */
    '.at-pj-todo-t{flex:1 1 auto;min-width:0;font-size:14px;line-height:1.4;display:-webkit-box;',
    '-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;',
    'min-height:55px}',
    /* `.tc-tags`：列缝 6、行缝 8、可换行。没有标签时整行不渲染（`wx:if` 同端口径）。 */
    '.at-pj-todo-meta{display:flex;align-items:center;column-gap:6px;row-gap:8px;flex-wrap:wrap;min-width:0}',
    /* `.tc-foot`：左时间右圆圈；`margin-top:auto` 吸到卡底（卡等高时才有区别）。 */
    '.at-pj-todo-foot{display:flex;align-items:center;justify-content:space-between;gap:4px;',
    'margin-top:auto;min-width:0}',
    /* `.tc.mini .tc-meta-t`：11 / 15，数字用等宽族，`white-space:nowrap` 不许折行。 */
    '.at-pj-todo-at{font-family:var(--at-font-num);font-size:11px;line-height:15px;',
    'color:var(--at-text2);flex:0 0 auto;white-space:nowrap}',
    /* ★★ 2026-11-10：项目网格卡上的**完成圆圈**（小程序 `.tc-st`）：16×16、1.5 描边。
     * 未完成就是**空心圆**（小程序没画勾 —— 画了淡勾会被读成"已完成"）；
     * 勾掉之后从这张卡上消失（已完成的待办不进 `openTodos`）。 */
    '.at-pj-done{flex:0 0 auto;width:16px;height:16px;padding:0;',
    'display:inline-flex;align-items:center;justify-content:center;border-radius:50%;',
    'border:1.5px solid var(--at-hairline-strong);background:var(--at-card);',
    'color:var(--at-muted);cursor:pointer;box-sizing:border-box}',
    '.at-pj-done:hover{border-color:var(--at-yellow);background:var(--at-yellow-soft);',
    'color:var(--at-primary)}',
    /* 标签行按小程序 `.tchip` 口径：chip 底、无描边、圆角 999（原来是 18 高描边小方块，
     * 在灰底上读成"四颗边框按钮"）。 */
    '.at-pj-tag{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;',
    'border-radius:999px;border:0;background:var(--at-chip);',
    'font-size:11px;color:var(--at-slate);white-space:nowrap}',
    '.at-pj-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px}',
    '.at-pj-foot .at-muted{font-size:12px}',

    /* ③ 项目脑图卡 —— 左简图 56×40、右三行（名称 / N 节点·M 层 / 更新于 YYYY年M月D日） */
    '.at-pj-mms{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}',
    '.at-pj-mm{display:flex;align-items:flex-start;gap:10px;padding:10px 11px;',
    'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-card);',
    'box-shadow:var(--at-sh-card);text-align:left;font:inherit;color:var(--at-primary);',
    'cursor:pointer;min-width:0}',
    '.at-pj-mm:hover{background:var(--at-chip)}',
    '.at-pj-mm-thumb{width:56px;height:40px;flex:0 0 56px;object-fit:contain;border-radius:6px}',
    '.at-pj-mm-b{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto}',
    '.at-pj-mm-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;',
    'text-overflow:ellipsis}',
    '.at-pj-mm-stat{font-size:11px;color:var(--at-text2)}',
    '.at-pj-mm-time{font-size:11px;color:var(--at-muted)}',
    /* 空态 —— 与待办详情那三块同一套：一句虚线说明（居中、12 圆角） */
    '.at-pj-empty{grid-column:1/-1;font-size:13px;color:var(--at-text2);padding:14px 12px;',
    'border:1px dashed var(--at-hairline-strong);border-radius:10px;text-align:center}'
  ].join('')

  function WorkHead() { return null }   /* 头部由页内面板统一渲染，保留兼容出口 */
  /* --------------------------------------------------- 格式简图（48×34）---
   * 逐行移植 小程序 `utils/formats.js` 的六张结构简图 —— 项目脑图卡左侧那块
   * 56×40 的缩略图就是它（168 / 169 轮定稿）。为什么搬而不是"重画一张像的"：
   * 这六张是按各自 layout 的真实形状校准过的（树形图是「左上根 + 竖总线 + 直角短枝」、
   * 时间轴是「竖轴 + 左右交替」、鱼骨图「鱼头在左 + 长骨斜插」），重画必漂。
   * ⚠️ 三色按主题**现取**（深色 root 换柔白、leaf 换卡面深灰）：钉死浅色那份时，
   *    深色卡上主墨根块对比 ≈1.06、白叶块成一粒粒白点，整张图读不出结构（247 轮实拍过）。
   */
  var THUMB_LIGHT = { line: '#C7CAD5', root: '#1C1C1E', leaf: '#FFFFFF' }
  var THUMB_DARK = { line: '#858783', root: '#EEEDEA', leaf: '#202123' }
  var T_ROOT_W = 12, T_ROOT_H = 6, T_LEAF_W = 10, T_LEAF_H = 5, T_R = 2

  function nz(v) { return Math.round(v * 10) / 10 }
  function tBox(p, x, y, w, h, fill, stroke) {
    var s = stroke === false ? ''
      : ' stroke="' + (stroke || p.line) + '" stroke-width="0.7"'
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="1.4" fill="' + fill + '"' + s + '/>'
  }
  function tWire(p, d) {
    return '<path d="' + d + '" fill="none" stroke="' + p.line + '" stroke-width="1"/>'
  }
  function tLine(x1, y1, x2, y2) {
    return 'M' + nz(x1) + ' ' + nz(y1) + ' L' + nz(x2) + ' ' + nz(y2)
  }
  function tCurve(x1, y1, x2, y2) {
    if (Math.abs(y1 - y2) < 0.5) return tLine(x1, y1, x2, y2)
    var mx = nz((x1 + x2) / 2)
    return 'M' + nz(x1) + ' ' + nz(y1) + ' C' + mx + ' ' + nz(y1) + ' ' + mx + ' ' +
      nz(y2) + ' ' + nz(x2) + ' ' + nz(y2)
  }
  function tElbowLR(bx, y1, ex, y2) {
    var s = ex > bx ? 1 : -1, v = y2 > y1 ? 1 : -1
    if (Math.abs(ex - bx) < 0.5) return tLine(bx, y1, bx, y2)
    var r = Math.min(T_R, Math.abs(ex - bx), Math.abs(y2 - y1))
    return 'M' + nz(bx) + ' ' + nz(y1) +
      ' L' + nz(bx) + ' ' + nz(y2 - v * r) +
      ' Q' + nz(bx) + ' ' + nz(y2) + ' ' + nz(bx + s * r) + ' ' + nz(y2) +
      ' L' + nz(ex) + ' ' + nz(y2)
  }
  function tElbowTB(x1, y1, x2, y2) {
    if (Math.abs(x2 - x1) < 0.5) return tLine(x1, y1, x2, y2)
    var s = x2 > x1 ? 1 : -1, my = nz((y1 + y2) / 2)
    var r = Math.min(T_R, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2)
    return 'M' + nz(x1) + ' ' + nz(y1) +
      ' L' + nz(x1) + ' ' + nz(my - r) +
      ' Q' + nz(x1) + ' ' + my + ' ' + nz(x1 + s * r) + ' ' + my +
      ' L' + nz(x2 - s * r) + ' ' + my +
      ' Q' + nz(x2) + ' ' + my + ' ' + nz(x2) + ' ' + nz(my + r) +
      ' L' + nz(x2) + ' ' + nz(y2)
  }
  function tUri(inner) {
    return 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="34" viewBox="0 0 48 34">' +
      inner + '</svg>')
  }

  var _thumb = null, _thumbSig = ''
  function formatThumbs() {
    var p = AT.icons.isDark() ? THUMB_DARK : THUMB_LIGHT
    var sig = p.line + p.root + p.leaf
    if (_thumb && _thumbSig === sig) return _thumb
    _thumbSig = sig
    _thumb = {
      /* 思维导图：根居中，一级分成左右两列，曲线向两侧外扩 */
      mindmap: tUri(
        tWire(p, tCurve(18, 17, 13, 8.5)) + tWire(p, tCurve(18, 17, 13, 25.5)) +
        tWire(p, tCurve(30, 17, 35, 8.5)) + tWire(p, tCurve(30, 17, 35, 25.5)) +
        tBox(p, 3, 6, T_LEAF_W, T_LEAF_H, p.leaf) + tBox(p, 3, 23, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 35, 6, T_LEAF_W, T_LEAF_H, p.leaf) + tBox(p, 35, 23, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 18, 14, T_ROOT_W, T_ROOT_H, p.root, false)),
      /* 逻辑图：根在左、一级同列上下排开 */
      logic: tUri(
        tWire(p, tCurve(21.5, 17, 28.5, 7.5)) + tWire(p, tCurve(21.5, 17, 28.5, 17)) +
        tWire(p, tCurve(21.5, 17, 28.5, 26.5)) +
        tBox(p, 28.5, 5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 28.5, 14.5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 28.5, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 9.5, 14, T_ROOT_W, T_ROOT_H, p.root, false)),
      /* 组织结构图：根在顶，横向总线把三支挂到下一层 */
      org: tUri(
        tWire(p, tElbowTB(24, 8, 8, 24)) + tWire(p, tElbowTB(24, 8, 24, 24)) +
        tWire(p, tElbowTB(24, 8, 40, 24)) +
        tBox(p, 3, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 19, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 35, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 18, 2, T_ROOT_W, T_ROOT_H, p.root, false)),
      /* 树形图：根在左上，竖总线从根底垂下，一级向右缩进 */
      tree: tUri(
        tWire(p, tElbowLR(17, 8, 27, 12.5)) + tWire(p, tElbowLR(17, 8, 27, 19.5)) +
        tWire(p, tElbowLR(17, 8, 27, 26.5)) +
        tBox(p, 27, 10, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 27, 17, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 27, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 11, 2, T_ROOT_W, T_ROOT_H, p.root, false)),
      /* 时间轴：根在顶部，竖轴往下，一级左右交替 */
      timeline: tUri(
        tWire(p, tElbowLR(24, 9, 29, 12.5)) + tWire(p, tElbowLR(24, 9, 19, 20)) +
        tWire(p, tElbowLR(24, 9, 29, 27.5)) +
        tBox(p, 29, 10, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 9, 17.5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 29, 25, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 18, 3, T_ROOT_W, T_ROOT_H, p.root, false)),
      /* 鱼骨图：鱼头在左，主脊横贯，两根长骨斜拉，一级在骨线远端 */
      fishbone: tUri(
        tWire(p, tLine(12, 17, 47, 17)) +
        tWire(p, tLine(15, 17, 26, 5)) + tWire(p, tLine(28, 17, 39, 29)) +
        tWire(p, tLine(20.5, 11, 23, 11)) + tWire(p, tLine(33, 11, 35.5, 11)) +
        tWire(p, tLine(33.5, 23, 37, 23)) +
        tBox(p, 35.5, 8.5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 23, 8.5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 37, 20.5, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 21, 0, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 34, 29, T_LEAF_W, T_LEAF_H, p.leaf) +
        tBox(p, 1, 14, T_ROOT_W, T_ROOT_H, p.root, false))
    }
    return _thumb
  }
  function formatThumb(key) {
    var T = formatThumbs()
    return T[key] || T.mindmap || ''
  }

  function colorDot(colorKey) {
    var c = C.colorOf(colorKey)
    return h('span', { className: 'at-dot', style: { background: c ? c.main : 'var(--at-stone)' } })
  }
  function urgencyChip(key) {
    var u = C.urgencyOf(key)
    var color = AT.icons.isDark()
      ? ({ urgent: '#FF8285', mid: '#F1BC65', low: '#7CB5EE', hold: '#B4B8C2' }[u.key] || u.main) : u.main
    return h(U.Chip, { color: color, dot: color }, u.name)
  }
  function projectName(s, id) {
    var p = Core.byId(s.projects, id)
    return p ? p.name : '未归属'
  }
  function openDetail(kind, id) {
    var patch = { active: kind, drawer: null, form: null, detailOpen: true,
      capsulePick: null, mmPick: null, imgView: null, capView: null }
    patch[kind === 'project' ? 'projectId' : kind === 'todo' ? 'todoId' : 'mindmapId'] = id
    if (kind === 'todo') {
      var todo = Core.byId(B.get().todos, id)
      patch.tFilter = { kw: '', status: todo && todo.done ? 'done' : 'open', projectId: '', range: 'all' }
    } else if (kind === 'project') {
      var project = Core.byId(B.get().projects, id)
      patch.pFilter = { kw: '', status: project && project.archivedAt ? 'archived' : 'active', node: 'all', agentId: '' }
    } else patch.mFilter = { kw: '', projectId: '', format: 'all', range: 'all' }
    B.ui(patch)
  }

  /* ------------------------------------------------------------- 概览 ---
   * 严格对齐 小程序前端/components/mod-overview 的 **PC / 横屏**那一档。
   * 三块自上而下、整页可滚（第 59 轮撤掉横屏「下半区两栏」之后就是这个结构）：
   *   ① 活跃度日历 —— 采样三源：待办创建 ＋ 待办完成 ＋ 胶囊创建（图只画合值）
   *   ② 项目待办统计 —— 有色项目的卡网格（色点 · 节点 · 脑图数 · agent · 四档条数）
   *   ③ Agent 概况 —— 距离重置圆环 ＋ 每月套餐 / 承担项目
   * 数据一律来自 `Core.overviewProjectCards()` / `Core.agentCardViews()`（与小程序同一份装配）。
   */
  /* 星期轴文案与小程序 `mock.WEEK_CN` 逐字一致（「周一」而不是「一」）——
   * 36 宽的轴列正好装下 3 个 11px 字。 */
  var WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  var HEAT_STEP = 42                  /* 36 格 ＋ 6 gap —— 与小程序 CELL + GAP 同值 */

  /* 热力 5 档 / 四档统计色都是"随主题变的数据色" ⇒ 每次渲染现取。
   * ⚠️ 不许在进页面时定格一次（小程序 187 轮报过：切深色后热力图还是浅色那五格）。 */
  function heatLegend() { return AT.icons.isDark() ? C.HEAT.legendDark : C.HEAT.legend }
  function urgencyInk(key) {
    var dark = AT.icons.isDark()
    return (dark && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].main : C.urgencyOf(key).main
  }
  /* 节点徽章 ＝ 小程序 `.badge.badge-node`（`--u-mid-bg` / `--u-mid-t` 两档现取）。
   * ⚠️ `C.URGENCY` 是数组（只有 `urgencyOf(key)` 能按 key 取）；`C.URGENCY_DARK` 才是按 key 的对象。 */
  function nodeBadgeStyle() {
    var base = AT.icons.isDark() ? C.URGENCY_DARK.mid : C.urgencyOf('mid')
    return { background: base.soft, color: base.text }
  }

  /* ① 活跃度日历 —— 星期轴 ＋ 30 周 × 7 天方格 ＋ 图例 ＋ 选中日明细条 */
  function HeatSection(props) {
    var s = props.s
    var weeks = Text.heatWeeks(s)
    var sel = s.ui.heatSelected || Text.todayCell(s)
    var day = sel ? Text.heatDay(s, sel.week, sel.day) : null
    var legend = heatLegend()
    var scrollRef = React.useRef(null)
    var visState = React.useState(0)
    var visible = visState[0], setVisible = visState[1]
    var inited = React.useRef(false)

    /* 初始停在**最右端**（最新那几周）；之后窗口变化只重算「当前显示 N 周」，
     * 不把用户拽回最新端 —— 与小程序 2026-10-27（F25）那条口径一致。 */
    React.useEffect(function () {
      var el = scrollRef.current
      if (!el) return
      function sync() {
        var n = Math.max(0, Math.floor((el.clientWidth + 6) / HEAT_STEP))
        setVisible(function (cur) { return cur === n ? cur : n })
        if (!inited.current) {
          el.scrollLeft = el.scrollWidth - el.clientWidth
          inited.current = true
        }
      }
      sync()
      if (typeof window === 'undefined' || !window.ResizeObserver) return
      var ro = new window.ResizeObserver(sync)
      try { ro.observe(el) } catch (e) { return }
      return function () { try { ro.disconnect() } catch (e) {} }
    }, [])

    return h('div', { className: 'at-ov-heat' },
      h('div', { className: 'at-ov-heat-body' },
        h('div', { className: 'at-ov-heat-axis' }, WEEKDAYS.map(function (w) {
          return h('div', { key: w, className: 'at-ov-heat-axis-cell' },
            h('span', { className: 'at-ov-heat-axis-t' }, w))
        })),
        h('div', { className: 'at-ov-heat-right' },
          h('div', { className: 'at-ov-heat-scroll', ref: scrollRef },
            h('div', { className: 'at-ov-heat-inner' },
              h('div', { className: 'at-ov-heat-ruler' }, weeks.map(function (w) {
                return h('div', { key: w.key, className: 'at-ov-heat-ruler-cell' },
                  h('span', { className: 'at-ov-heat-ruler-t' }, String(w.weekNo)))
              })),
              h('div', { className: 'at-ov-heat-grid', role: 'grid' }, weeks.map(function (w) {
                return h('div', { key: w.key, className: 'at-ov-heat-col' }, w.days.map(function (d) {
                  var on = !!sel && sel.week === w.weekNo && sel.day === d.dayIndex
                  return h('button', {
                    key: d.dayIndex, type: 'button',
                    className: 'at-ov-heat-cell' + (d.level >= 3 ? ' is-hi' : '') + (on ? ' is-sel' : ''),
                    style: { background: legend[d.level] },
                    title: d.label + ' · 创建 ' + d.created + ' 条 / 完成 ' + d.completed +
                      ' 条 / 胶囊 ' + d.capsule + ' 条 · 合值 ' + d.sum,
                    'aria-label': d.label + ' 合值 ' + d.sum,
                    'aria-pressed': on ? 'true' : 'false',
                    onClick: function () { B.ui({ heatSelected: { week: w.weekNo, day: d.dayIndex } }) }
                  }, on ? h('span', { className: 'at-ov-heat-mark' },
                    h('i', { className: 'tr' }), h('i', { className: 'bl' })) : null)
                }))
              })))))),
      h('div', { className: 'at-ov-heat-legend' },
        h('span', { className: 'at-ov-legend-lab' }, '少'),
        h('span', { className: 'at-ov-legend-scale' }, legend.map(function (c, i) {
          return h('i', { key: i, style: { background: c } })
        })),
        h('span', { className: 'at-ov-legend-lab' }, '多'),
        h('span', { className: 'at-ov-legend-flex' }),
        h('span', { className: 'at-ov-legend-note' },
          '共 ' + weeks.length + ' 周' +
          (visible ? ' · 当前显示最近 ' + visible + ' 周' : '') + ' · 向右滑动看更早')),
      /* 明细条：默认就落在今天那一格 ⇒ 页面上不存在"未选中"的空态（第 59 轮）。 */
      day ? h('div', { className: 'at-ov-heat-detail' },
        h('span', { className: 'at-ov-hd-strong' }, day.label + ' · 第 ' + day.weekNo + ' 周'),
        h('span', { className: 'at-ov-hd-sep' }, '·'),
        h('span', { className: 'at-ov-hd-created' }, '创建 ' + day.created + ' 条'),
        h('span', { className: 'at-ov-hd-sep' }, '/'),
        h('span', { className: 'at-ov-hd-done' }, '完成 ' + day.completed + ' 条'),
        h('span', { className: 'at-ov-hd-sep' }, '/'),
        h('span', { className: 'at-ov-hd-cap' }, '胶囊 ' + day.capsule + ' 条'),
        h('span', { className: 'at-ov-hd-sep' }, '·'),
        h('span', { className: 'at-ov-hd-sum' }, '合值 ' + day.sum)) : null)
  }

  /* ② 项目待办统计 —— 项目卡网格（复用项目卡本体，FR-5.2）
   * ⚠️ 卡面**不表达分数**：分数只承担排序（FR-5.2），表达交给四档条数。 */
  function ProjectSection(props) {
    var cards = Core.overviewProjectCards(props.s)
    /* 空态与网格是**同一张 `.card.stats` 的两个分支**（小程序模板里 `wx:if` / `wx:else`）——
     * 空态若裸放在页面上就少了这层卡，与上下两块的容器感不齐。 */
    return h('div', { className: 'at-ov-stats' }, cards.length
      ? h('div', { className: 'at-ov-ps-grid' }, cards.map(function (p) {
        return h('button', { key: p.id, type: 'button', className: 'at-ov-ps-cell',
          onClick: function () { openDetail('project', p.id) } },
          h('div', { className: 'at-ov-ps-card' },
            h('div', { className: 'at-ov-ps-head' },
              h('span', { className: 'at-ov-ps-dot', style: { background: p.color } }),
              h('span', { className: 'at-ov-ps-name', title: p.name }, p.name),
              h('span', { className: 'at-ov-badge', style: nodeBadgeStyle() }, p.node)),
            h('div', { className: 'at-ov-ps-foot' },
              h('span', { className: 'at-ov-ps-meta' }, p.mindmaps + ' 张脑图'),
              p.agentName ? h('span', { className: 'at-ov-ps-sep' }, '·') : null,
              p.agentName ? h('span', { className: 'at-ov-ps-meta' }, p.agentName) : null,
              !p.total ? h('span', { className: 'at-ov-ps-sep' }, '·') : null,
              !p.total ? h('span', { className: 'at-ov-ps-meta' }, '暂无待办') : null),
            h('div', { className: 'at-ov-ps-stat' }, p.statChips.map(function (c) {
              return h('div', { key: c.key, className: 'at-ov-ps-s' + (c.n ? '' : ' is-zero') },
                h('span', { className: 'at-ov-ps-s-t' }, c.name),
                h('span', { className: 'at-ov-ps-s-n atx-num',
                  style: c.n ? { color: urgencyInk(c.key) } : null }, String(c.n)))
            }))))
      }))
      : h('div', { className: 'at-ov-blank' }, '还没有带颜色的活跃项目 —— 项目着色后会出现在这里'))
  }

  /* ③ Agent 概况 —— 卡面与「我的」页 agent 卡同源（157 轮定稿：圆环做主角）。
   * ⚠️ 概览**有意不渲染「关联项目」气泡行**：色点＋项目名的完整清单在本页是重复信息
   * （「项目待办统计」的卡上已经全有），`projectCount` 那个数就够了。 */
  function AgentSection(props) {
    var list = Core.agentCardViews(props.s)
    if (!list.length) {
      return h('div', { className: 'at-ov-blank' },
        h('span', null, '还没有 agent 档案。'),
        h('span', { className: 'at-ov-blank-s' }, '去「我的」新建一个，填上每月套餐与额度重置日即可。'))
    }
    return h('div', { className: 'at-ov-ag-grid' }, list.map(function (a) {
      return h('button', { key: a.id, type: 'button', className: 'at-ov-ag-card',
        onClick: function () { S.setView('mine') } },
        h('div', { className: 'at-ov-ag-row1' },
          h('span', { className: 'at-ov-ag-name', title: a.name }, a.name)),
        h('div', { className: 'at-ov-ag-body' },
          h('div', { className: 'at-ov-ag-ring-wrap' },
            h('span', { className: 'at-ov-ag-ring', style: { '--ring-deg': a.ringDeg + 'deg' } },
              h('span', { className: 'at-ov-ag-ring-core' },
                h('span', { className: 'at-ov-ag-ring-num atx-num' + (a.resetMuted ? ' is-muted' : '') },
                  a.resetNum),
                a.resetUnit ? h('span', { className: 'at-ov-ag-ring-unit' }, a.resetUnit) : null)),
            h('span', { className: 'at-ov-ag-ring-lab' }, '距离重置')),
          h('div', { className: 'at-ov-ag-meta' },
            h('div', { className: 'at-ov-ag-mcell' },
              h('span', { className: 'at-ov-ag-lab' }, '每月套餐'),
              h('span', { className: 'at-ov-ag-val atx-num' }, String(a.monthlyQuota))),
            h('span', { className: 'at-ov-ag-mdiv' }),
            h('div', { className: 'at-ov-ag-mcell' },
              h('span', { className: 'at-ov-ag-lab' }, '承担项目'),
              h('span', { className: 'at-ov-ag-val atx-num' }, a.projectCount + ' 项')))))
    }))
  }

  function OverviewBody(s) {
    return h('div', { className: 'at-ov' },
      h(U.Section, { title: '活跃度日历', icon: 'calendar-b' }, h(HeatSection, { key: 'heat', s: s })),
      h(U.Section, { title: '项目待办统计', icon: 'chart-b' }, h(ProjectSection, { key: 'ps', s: s })),
      h(U.Section, { title: 'Agent 概况', icon: 'robot-b' }, h(AgentSection, { key: 'ag', s: s })))
  }

  /* ------------------------------------------------------------- 项目 --- */
  /* 中文日期 —— 与小程序 `store.cnDate` 同口径：`2026年10月9日`。
   * 169 轮用户口径：「'更新于10-09' 太不正式了」。别退回 atMin 的 `10-09`。 */
  function cnDate(v) {
    if (!v) return ''
    var d = new Date(String(v).replace(/-/g, '/'))
    if (isNaN(d.getTime())) return String(v).slice(0, 10)
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
  }

  /* 项目详情 = 小程序 mod-project 的三块（PC 档）：
   *   ① 基础信息（色点·名称·徽章 / 备注 / 所属 agent ＋ 项目概要 两组并排）
   *   ② 项目待办（四档紧急度可点筛选 ＋ 只读综合紧急度 ＋ 网格 ＋ 底行）
   *   ③ 项目脑图（格式简图 ＋ 名称/N 节点·M 层/更新于 中文日期 ＋ 底行）
   * ⚠️ 「编辑 / 取消归档」在**基础信息卡右上角**（小程序就是这么放的）：
   *    162 轮撤掉「···」之后，那颗键是归档的唯一入口，页头不要再挂一份。
   * ⚠️ 四档筛选是**页内临时态**，写 `ui.detailUrg = { pid, key }`：带上项目 id
   *    才能在切换项目时自动归零，不会出现"选了紧急、换项目后网格空着"的假空态。
   */
  function ProjectBody(s, p) {
    if (!p) return h(U.Empty, { icon: 'project', title: '还没有打开过任何项目',
      hint: '从左边列表里挑一个，或者新建一个项目',
      action: { label: '新建项目', onClick: function () { S.openForm('project', '') } } })
    var sum = Core.projectSummary(s, p.id)
    var st = Core.statOfProject(s, p.id)
    var score = Core.scoreOf(s, p.id)
    var agent = Core.byId(s.agents, p.agentId)
    var pColor = C.colorOf(p.color) ? C.colorOf(p.color).main : 'var(--at-stone)'
    var du = s.ui.detailUrg
    var urg = (du && du.pid === p.id) ? du.key : ''
    var allOpen = Core.todosOfProject(s, p.id).filter(function (t) { return !t.done })
    var openTodos = urg ? allOpen.filter(function (t) { return t.urgency === urg }) : allOpen
    var maps = Core.mindmapsOfProject(s, p.id)
    /* ★★ 2026-11-10：脑图卡**只铺最近 6 张**（小程序 `mod-project.js` 的
     * `mms.slice(0, cols * MM_ROWS)`，MM_ROWS=3；PC 宽窗 2 列 ⇒ 6）。
     * 改前是全量铺开 —— 一个项目攒十几张脑图时，这一块把详情页拉得很长，
     * 而下面还有「查看全部」这个真正的列表入口。 */
    var tiles = maps.slice(0, 6)
    function setUrg(k) { B.ui({ detailUrg: { pid: p.id, key: urg === k ? '' : k } }) }
    /* 点完成圆圈 → **先确认再勾**（小程序 166 轮那条口径：网格里一下点掉太容易误触，
     * 「已完成 / 取消」两颗键说了算）。插件这边用全局确认框承载同一句话，
     * 不做卡内浮层：整张卡本身是按钮，卡内再嵌一层会多一套定位与层级。 */
    function markDone(t) {
      S.openConfirm({ title: '标记为已完成？',
        body: '它会离开这张网格、进「已完成」；在待办列表的「已完成」档里可以还原。',
        confirmText: '已完成', danger: false,
        onConfirm: function () { B.actions.toggleTodo(t.id) } })
    }
    function inkOf(k) {
      return (AT.icons.isDark() && C.URGENCY_DARK[k]) ? C.URGENCY_DARK[k].main : C.urgencyOf(k).main
    }
    /* 底行文案随筛选走（156 轮）：有档位时报「紧急 2 条（未完成共 5 条）」，
     * 否则报全量 —— 不然筛选生效时左边还在报总数，读起来像"卡片丢了"。 */
    var footStat = urg
      ? (C.urgencyOf(urg).name + ' ' + (st[urg] || 0) + ' 条（未完成共 ' + allOpen.length + ' 条）')
      : ('未完成 ' + sum.open + ' 条 · 已完成 ' + sum.done + ' 条')

    return h('div', { className: 'at-pj' },
      /* ① 基础信息 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'info-b', size: 16 }), '基础信息'),
        h('div', { className: 'at-tbd-row1' },
          h('span', { className: 'at-tbd-dot', style: { background: pColor } }),
          h('span', { className: 'at-tbd-name' }, p.name),
          p.archivedAt
            ? h('span', { className: 'at-tbd-badge arch' }, '已归档')
            : h('span', { className: 'at-tbd-badge', style: nodeBadgeStyle() }, p.node),
          h('button', { type: 'button', className: 'at-tbd-tb',
            onClick: function () {
              if (p.archivedAt) { B.actions.archiveProject(p.id, false); return }
              S.openForm('project', p.id)
            } },
            h(U.Icon, { name: p.archivedAt ? 'undo' : 'edit', size: 13 }),
            p.archivedAt ? '取消归档' : '编辑')),
        h('div', { className: 'at-tbd-remark' + (p.remark ? '' : ' none') },
          p.remark || '未填写备注'),
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
                  /* 「距离重置」文案的唯一真源在 62-views-b.js（待办详情也要用同一句
                   * 「今天 / N 天 / 未填」）。这里只读 AT.views 上的那一份，
                   * 不另抄一个副本 —— 两处各写一遍必然会漂成两种口径。
                   * ⚠️ 别写成 `V.resetInOf`：本模块没有 V 这个别名（v1.12 真栽过，
                   * 症状是项目详情整块抛 ReferenceError）。 */
                  h('span', { className: 'at-tbd-val' }, AT.views.resetInOf(agent))))
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

      /* ② 项目待办 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'todo-b', size: 16 }), '项目待办'),
        h('div', { className: 'at-pj-stat' },
          h('div', { className: 'at-pj-urgs' }, C.URGENCY.map(function (c) {
            var on = urg === c.key
            var color = (AT.icons.isDark() && C.URGENCY_DARK[c.key]) ? C.URGENCY_DARK[c.key] : c
            return h('button', { key: c.key, type: 'button',
              className: 'at-pj-urg' + (on ? ' is-on' : ''),
              'aria-pressed': on,
              style: on ? { background: color.soft, borderColor: color.main, color: color.text } : null,
              onClick: function () { setUrg(c.key) } },
              h('span', null, c.name),
              h('span', { className: 'at-pj-urg-n' }, st[c.key] || 0))
          })),
          /* 综合紧急度是**只读**读数，不参与筛选（156 轮）。 */
          h('span', { className: 'at-pj-score' }, '综合紧急度 ' + score + ' 分')),
        openTodos.length
          ? h('div', { className: 'at-pj-grid' }, openTodos.map(function (t) {
            var caps = Core.capsulesOfTodo(s, t.id).length
            var imgs = (t.images || []).length
            var tags = (t.mindmapId ? 1 : 0) + (imgs ? 1 : 0) + (caps ? 1 : 0)
            return h('button', { key: t.id, type: 'button', className: 'at-pj-todo',
              onClick: function () { openDetail('todo', t.id) } },
              /* 段一 `.tc-main`：色条 ＋ 正文 */
              h('span', { className: 'at-pj-todo-head' },
                h('span', { className: 'at-pj-todo-bar', style: { background: inkOf(t.urgency) } }),
                h('span', { className: 'at-pj-todo-t' }, t.text)),
              /* 段二 `.tc-tags`：没有标签时整段不渲染（小程序 `wx:if` 同口径），
               * 否则卡上会多出一条 0 高的空行、底行被顶上去 8px。 */
              tags ? h('span', { className: 'at-pj-todo-meta' },
                t.mindmapId ? h('span', { className: 'at-pj-tag' },
                  h(U.Icon, { name: 'mindmap', size: 11 }), '脑图') : null,
                imgs ? h('span', { className: 'at-pj-tag' },
                  h(U.Icon, { name: 'album', size: 11 }), imgs + ' 张图') : null,
                caps ? h('span', { className: 'at-pj-tag' },
                  h(U.Icon, { name: 'bolt', size: 11 }), caps + ' 条胶囊') : null) : null,
              /* 段三 `.tc-foot`：左「更新于 …」右完成圆圈 —— 用户第 3 条要的正是这一行。
               * 时间走 `Core.atMin`（截到分钟），与待办详情页「创建于 …」同一个格式化函数。 */
              h('span', { className: 'at-pj-todo-foot' },
                h('span', { className: 'at-pj-todo-at' },
                  '更新于 ' + (Core.atMin(t.updatedAt || t.createdAt) || '—')),
                /* 完成圆圈：`span[role=button]` 而不是 `<button>` —— 外层卡片本身就是 button，
                 * button 里嵌 button 是非法结构（浏览器会把内层提前闭合）。 */
                h('span', { className: 'at-pj-done', role: 'button', tabIndex: 0,
                  title: '标记为已完成', 'aria-label': '标记为已完成',
                  onClick: function (e) { e.stopPropagation(); markDone(t) },
                  onKeyDown: function (e) {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    e.preventDefault(); e.stopPropagation(); markDone(t)
                  } })))
          }))
          : h('div', { className: 'at-pj-empty' },
            urg ? '这一档暂时没有未完成的待办' : '这个项目没有未完成的待办'),
        h('div', { className: 'at-pj-foot' },
          h('span', { className: 'at-muted' }, footStat),
          /* 跳过去只看「已完成」——走筛选模型的唯一入口（AT.panes.openFiltered）：
           * 落地后列表页的筛选键会显示「筛选 2」、抽屉里「待办状态 · 已完成」与
           * 「所属项目 · 本项」都亮着，清除也只有「清除全部筛选」一处。 */
          h('button', { type: 'button', className: 'at-tbd-tb',
            onClick: function () {
              AT.panes.openFiltered('todo', { status: 'done', projectId: p.id })
            } },
            h(U.Icon, { name: 'list', size: 13 }), '已完成待办'))),

      /* ③ 项目脑图 */
      h('div', { className: 'at-block' },
        h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'mindmap-b', size: 16 }), '项目脑图'),
        maps.length
          ? h('div', { className: 'at-pj-mms' }, tiles.map(function (m) {
            return h('button', { key: m.id, type: 'button', className: 'at-pj-mm',
              onClick: function () { openDetail('mindmap', m.id) } },
              h('img', { className: 'at-pj-mm-thumb', src: formatThumb(m.format),
                alt: C.formatOf(m.format).label }),
              h('span', { className: 'at-pj-mm-b' },
                h('span', { className: 'at-pj-mm-name' }, m.name),
                h('span', { className: 'at-pj-mm-stat' },
                  (m.nodes || 0) + ' 节点 · ' + (m.depth || 0) + ' 层'),
                h('span', { className: 'at-pj-mm-time' },
                  '更新于 ' + cnDate(m.updatedAt || m.createdAt))))
          }))
          : h('div', { className: 'at-pj-empty' },
            '还没有脑图 —— 点右上角「新建脑图」开始画一张'),
        h('div', { className: 'at-pj-foot' },
          h('span', { className: 'at-muted' }, '脑图总数 ' + maps.length +
            (maps.length > tiles.length ? ' · 显示最近 ' + tiles.length + ' 张' : '')),
          /* 同上：只看本项目脑图 = mFilter.projectId，不再另设 listScope。 */
          h('button', { type: 'button', className: 'at-tbd-tb',
            onClick: function () {
              AT.panes.openFiltered('mindmap', { projectId: p.id })
            } },
            h(U.Icon, { name: 'list', size: 13 }), '查看全部'))))
  }

  /* 兼容旧调用点：不再自带头部与滚动容器。 */
  function OverviewView(s) { return h('div', { className: 'at-pane-body' }, OverviewBody(s)) }
  function ProjectView(s) { return h('div', { className: 'at-pane-body' },
    ProjectBody(s, Core.byId(s.projects, s.ui.projectId))) }

  AT.views = {
    STYLE: STYLE, WorkHead: WorkHead, colorDot: colorDot, urgencyChip: urgencyChip,
    projectName: projectName, openDetail: openDetail,
    OverviewBody: OverviewBody, OverviewView: OverviewView,
    ProjectBody: ProjectBody, ProjectView: ProjectView
  }
})(AT, React, h)
