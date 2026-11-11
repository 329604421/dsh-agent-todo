/* 55-panes.js — 项目 / 待办 / 脑图 三模块的一体化页内布局。
 *
 *   [左导轨 72px] [列表区 300px] [详情区 flex:1]   ← 三栏常驻页面内；
 *   表单与筛选是浮在工作区之上的「右侧展开弹窗」（外壳在 85-desktop / 90-drawers）。
 *   选中项写在 ui.{projectId,todoId,mindmapId}，列表与详情读同一个真源。
 *   宽度按面板实测值分三档（is-compact / is-tight），不是按浏览器视口。
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, S = AT.shell

  /* 从 40-ui 的 LIGHT / DARK 表里**现取**已登记色值（同 80-capsule 的 literal 做法），
   * 不在这里新增色值、也不手抄一份副本。 */
  function literal(name, table) {
    var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
    return m ? m[1] : ''
  }
  var PAGE_L = literal('at-surface', U.LIGHT), CARD_L = literal('at-card', U.LIGHT)
  var PAGE_D = literal('at-surface', U.DARK), CARD_D = literal('at-card', U.DARK)

  /* 待办状态四档 —— 页头快捷段与「筛选」面板**共用这一个数组**：
   * 分两处各写一份时，少一个 key 就会出现「选了已删除、页头没有任何段亮着」的假空态，
   * 而且一点就跳走。key 与小程序 `store.filterTodos` 的四档逐字一致。 */
  var TODO_STATUS = [
    { key: 'open', name: '未完成' }, { key: 'done', name: '已完成' },
    { key: 'deleted', name: '已删除' }, { key: 'all', name: '全部' }
  ]

  var STYLE = [
    '.at-panes{display:flex;flex:1 1 auto;min-height:0;min-width:0;gap:12px;padding:0 20px 20px}',
    '.at-pane{display:flex;flex-direction:column;min-height:0;min-width:0;overflow:hidden;',
    'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-card);',
    'box-shadow:var(--at-sh-card)}',
    '.at-pane-list{flex:0 0 300px;width:300px;background:var(--at-elevated)}',
    '.at-pane-detail{flex:1 1 auto;min-width:0}',
    '.at-pane-single{flex:1 1 auto;min-width:0}',
    /* ★ 首页级单栏（概览 / 我的）的「页底 ＋ 卡面」两层 —— 复刻小程序
     *   `page{background:var(--surface)}` ＋ `.card{background:var(--card)}` 这对关系。
     *   85-desktop 把这两支都映到宿主暖灰（`bg-layer-1` / `bg-base`），真实 DSH 里两档
     *   差得极小 ⇒ 白卡落在白底上、整页「一片白」，层次只剩 1px 描边。
     *   这里只对 `is-home` 作用域把三支钉回已登记值（浅 页底 #F7F8FA / 卡面 #FFFFFF；
     *   深 页底 #18191B / 卡面 #202123），并让 `--at-surface` 同步成页底色 ——
     *   卡片内部的灰块（`.at-ov-ag-meta` 等）与气泡底本来就用它，同源才不糊。
     *   作用范围只有这两页，导轨 / 三栏模块一律不动。 */
    '.at-pane-single.is-home{background:' + PAGE_L + ';--at-card:' + CARD_L +
      ';--at-surface:' + PAGE_L + '}',
    '.at-root[data-dark="true"] .at-pane-single.is-home{background:' + PAGE_D +
      ';--at-card:' + CARD_D + ';--at-surface:' + PAGE_D + '}',
    '.at-pane-head{display:flex;align-items:center;gap:10px;flex:0 0 56px;padding:0 14px;',
    'background:var(--at-head-bg);border-bottom:1px solid var(--at-head-line)}',
    '.at-pane-title{font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-pane-sub{font-size:12px;color:var(--at-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.at-pane-head .at-toolbar{margin-left:auto;gap:6px;flex-wrap:nowrap;overflow:hidden;flex:0 0 auto}',
    '.at-pane-tools{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:10px 12px;',
    'border-bottom:1px solid var(--at-hairline-soft);background:var(--at-card)}',
    '.at-pane-tools .at-input{flex:1 1 auto;min-width:0}',
    '.at-pane-tools .at-btn{flex:0 0 auto}',
    '.at-pane-scroll{flex:1 1 auto;min-height:0;overflow:auto;padding:10px 12px}',
    '.at-pane-body{flex:1 1 auto;min-height:0;overflow:auto;padding:14px}',
    '.at-pane-body.is-canvas{display:flex;flex-direction:column;padding:0;overflow:hidden}',
    '.at-pane-body.is-canvas>div{flex:1 1 auto;min-height:0}',
    '.at-pane-foot{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;',
    'gap:8px;padding:9px 12px;border-top:1px solid var(--at-hairline);background:var(--at-head-bg)}',
    '.at-pane-row{display:flex;align-items:flex-start;gap:9px;width:100%;padding:10px 11px;',
    'margin-bottom:8px;border:1px solid var(--at-hairline);border-radius:12px;',
    'background:var(--at-card);box-shadow:var(--at-sh-card);text-align:left;',
    'cursor:pointer;color:var(--at-primary);font:inherit}',
    '.at-pane-row:hover{background:var(--at-chip)}',
    '.at-pane-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-pane-row.is-on:hover{background:var(--at-yellow-soft);border-color:var(--at-yellow);opacity:.82}',
    '.at-pane-row.is-pick{box-shadow:inset 0 0 0 1px var(--at-yellow),0 2px 8px rgba(255,208,47,.2)}',
    '.at-pane-row-main{flex:1 1 auto;min-width:0}',
    '.at-pane-row-title{font-size:14px;font-weight:500;line-height:1.45;word-break:break-word}',
    '.at-pane-row.is-done .at-pane-row-title{color:var(--at-stone);text-decoration:line-through}',
    /* 已删除档：只退一档颜色，**不加删除线** —— 删除线是「已完成」的语义，别混用。 */
    '.at-pane-row.is-gone .at-pane-row-title{color:var(--at-stone)}',
    '.at-pane-row-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px;',
    'font-size:11px;color:var(--at-muted)}',
    '.at-pane-row-bar{width:4px;align-self:stretch;border-radius:2px;flex:0 0 4px;min-height:26px}',
    '.at-pane-flag{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:999px;',
    'background:var(--at-chip);color:var(--at-text2);font-size:11px}',
    /* 筛选抽屉（2026-11-09 轮次 6）：与创建 / 编辑弹窗统一走「右侧展开浮层」外壳 ——
     * `.at-form-mask` ＋ `.at-drawer`，几何真源在 85-desktop.js（460 贴右全高），
     * 头 / 体 / 底皮肤真源在 90-drawers.js（.at-drawer-head/body/foot 的 .sd 一套）。
     * 小程序 components/drawer 的 `.tf` 副弹窗同样是浮层：遮罩 ＋ 52 头 ＋ 即时生效 ＋
     * 没有「确定」；标题栏那颗是「关闭」不是「取消」—— 改动即时生效，写「取消」
     * 会被读成"我改的东西不算数"。
     * ⚠️ 旧版把筛选塞进详情区、让 DetailPane 整块换内容，那不是弹窗抽屉；
     *    `.at-filter-head/body/foot` 三块骨架随之删除，不留第二套没人用的样式。
     *    这里只留筛选**内容**自己的分组标签与 chips。 */
    '.at-filter-drawer{display:flex;flex-direction:column;min-width:0}',
    /* ★★ 2026-11-10（用户第 5 条）：三处筛选抽屉的**内部**按小程序 `.tf` 逐值对齐。
     * 外壳仍是右侧 460 全高抽屉（v1.12 用户认可的那只，与创建 / 编辑共用），
     * 这里只把内容规格改成 `.tf` 的那一套（数值全部来自
     * `components/drawer/drawer.wxss` 的 `.tf-grp` / `.tf-lab` / `.tf-chips` / `.tf-chip` /
     * `.tf-sear`）：组间距 14、标签 12/500 走 muted、胶囊 30 高 13/500、缝 6。
     * 原样是 组间距 10 / 标签走 slate / 胶囊 26 高 12px / 缝 5 —— 整体比小程序紧一档，
     * 三组叠起来读成"一坨"，正是用户说的"差距较大"。
     * ⚠️ 选中态**不跟** `.tf-chip.on`（小程序那支是深色实底）：样式标准 FB-01 已钉死
     *    「选中控件 ＝ 黄软底 ＋ 黄描边」，全工程只有这一套选中语言。 */
    '.at-filter-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}',
    '.at-filter-label{font-size:12px;font-weight:500;color:var(--at-muted)}',
    /* ★★ 2026-11-10（轮次 10 · 用户第 5 条复核）：**只有 wrap 组才换行**。
     * 小程序 `.tf-chips` 本体是 `display:flex;align-items:center;gap:6px`，
     * 换行是 `.wrap` 修饰类才打开的（项目节点 / 格式 / 更新时间三组）；
     * 状态组一直是单行。此前这里无条件 `flex-wrap:wrap`，460 宽抽屉里看不出差别，
     * 但窄档（is-tight）会把「已归档」「全部」折到第二行、与小程序读法不一致。
     * `.fill` 对应小程序 `.tf-chip.w2{flex:1 1 46%}` —— 更新时间那三颗均分两列。 */
    '.at-filter-chips{display:flex;align-items:center;gap:6px}',
    '.at-filter-chips.wrap{flex-wrap:wrap}',
    '.at-filter-chip{height:30px;padding:0 10px;border:1px solid var(--at-hairline);',
    'border-radius:999px;background:var(--at-card);color:var(--at-slate);font-size:13px;',
    'font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;box-sizing:border-box}',
    '.at-filter-chip.fill{flex:1 1 46%}',
    '.at-filter-chip:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
    '.at-filter-chip.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
    'color:var(--at-primary);font-weight:600}',
    '.at-filter-chip.is-on:hover:not(:disabled){opacity:.82}',
    /* ★★ 行组（`.tf-rows` / `.tf-row` / `.tf-dot` / `.tf-row-t` / `.tf-row-n`）：
     * 小程序里「所属项目」（待办 / 脑图）与「关联 agent」（项目）**不是胶囊**，是
     * 一行一个：色点 ＋ 名称 ＋ 条数。460 宽的胶囊行看着没问题，但项目一多就横着
     * 挤出抽屉；行式还能顺带报条数，用户不用点进去数。
     * ⚠️ 色点没有色时用**等宽透明占位**（`.empty`），否则整列名称左边缘参差。 */
    '.at-filter-rows{display:flex;flex-direction:column;gap:6px}',
    '.at-filter-row{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 10px;',
    'border:1px solid var(--at-hairline);border-radius:10px;background:var(--at-card);',
    'color:var(--at-primary);font:inherit;font-size:14px;text-align:left;cursor:pointer;',
    'box-sizing:border-box}',
    '.at-filter-row:hover{background:var(--at-chip)}',
    '.at-filter-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-filter-dot{flex:0 0 14px;width:14px;height:14px;border-radius:999px}',
    '.at-filter-dot.empty{background:transparent}',
    '.at-filter-row-t{flex:1;min-width:0;font-size:14px;color:var(--at-primary);overflow:hidden;',
    'white-space:nowrap;text-overflow:ellipsis}',
    '.at-filter-row.is-on .at-filter-row-t{font-weight:500}',
    '.at-filter-row-n{flex:0 0 auto;font-size:12px;color:var(--at-muted)}',
    /* 搜索组：`.tf-sear` 是 36 高壳（1px 描边 / 10 圆角 / card 底）内嵌
     * 14px 图标（opacity .45）＋ 34 高输入框 ＋ 24 圆底清空键（`.tf-clr`）。
     * 标签也从「关键词」改成「**搜索**」—— 小程序 `.tf-lab` 写的就是这两个字，
     * 而框里本来就有 placeholder（搜项目名 / 搜待办关键词 / 搜脑图关键词），
     * 「关键词」这层标签是插件自己加的第三种说法。 */
    '.at-filter-search{height:36px;padding:0 10px;border:1px solid var(--at-field-line);',
    'border-radius:10px;background:var(--at-card);display:flex;align-items:center;gap:7px;',
    'box-sizing:border-box}',
    '.at-filter-search:focus-within{border-color:var(--at-text2)}',
    '.at-filter-input{flex:1;min-width:0;height:34px;padding:0;border:0;background:transparent;',
    'color:var(--at-primary);font:inherit;font-size:14px;outline:none;box-sizing:border-box}',
    '.at-filter-input::placeholder{color:var(--at-muted);font-size:13px}',
    '.at-filter-clear{flex:0 0 24px;display:inline-flex;align-items:center;justify-content:center;',
    'width:24px;height:24px;padding:0;border:0;border-radius:999px;background:var(--at-chip);',
    'color:var(--at-slate);cursor:pointer;font-family:inherit}',
    /* ⚠️ 小程序 `.tf-clr-hv` 是 `opacity:.7`，插件不跟：FB-01 把反馈压成三档
     *    （hover `.82` / active `.78` / disabled `.4`），`.7` 是第四档，判据会红。 */
    '.at-filter-clear:hover{opacity:.82}',
    '.at-filter-clear:active{opacity:.78}',
    /* ★ 轮次 8：`.at-scope-note`（列表顶部那条「限定项目：X ＋ 清除」提示带）已删除。
     *   「按项目 / 按状态看某一批」本来就是筛选模型的事，再顶一条独立的提示带等于
     *   同一件事两种表达 + 两个清除入口。跨页带筛选现在只写 ui.{t,m}Filter（openFiltered），
     *   生效状态由工具条筛选键的「筛选 N」与抽屉里的 is-on chips 表达。 */
    /* ★★ 2026-11-10：胶囊 / 脑图选择器从**内联面板**改成**右侧抽屉**（外壳在
     * 90-drawers.js 的 PickDrawer，与创建 / 编辑 / 筛选同一套 .at-drawer）。
     * 改前这两块以 `.at-picker` 内联在详情内容的最顶上 —— 用户在下方区块点
     * 「选择胶囊」时，面板插在内容顶部、落在视口之外，读起来就是"点了没反应"。
     * 现在只剩**内容**（一句说明 ＋ 行列表 ＋ 空态），容器交给抽屉。
     * ⚠️ `.at-picker` / `.at-picker-head` 两条不再有宿主（面板自己带标题栏），
     *    整条删掉，别留一套没人用的样式。 */
    '.at-pick-note{font-size:12px;line-height:1.6;color:var(--at-text2);margin-bottom:10px}',
    '.at-pick-empty{font-size:13px;color:var(--at-muted);padding:10px 0}',
    '.at-picker-list{display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow:auto}',
    '.at-picker-row{display:flex;align-items:center;gap:8px;width:100%;padding:9px 10px;',
    'border:1px solid var(--at-hairline);border-radius:10px;',
    'background:var(--at-card);font:inherit;font-size:13px;text-align:left;cursor:pointer;',
    'color:var(--at-primary)}',
    '.at-picker-row:hover{background:var(--at-chip)}',
    '.at-picker-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
    '.at-picker-row input{accent-color:var(--at-yellow-deep);margin:0}',
    '.at-pane-banner{display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:12px;',
    'border-radius:10px;background:var(--at-yellow-soft);border:1px solid var(--at-yellow-line);',
    'font-size:12px;color:var(--at-slate)}',
    /* 面板宽度分档：由 shell 的 ResizeObserver 实测写入 ui.paneWidth */
    '.at-panes.is-compact{gap:8px;padding:0 12px 12px}',
    '.at-panes.is-compact .at-pane-list{flex-basis:248px;width:248px}',
    '.at-panes.is-tight{gap:8px;padding:0 8px 8px}',
    '.at-panes.is-tight .at-pane-list{flex-basis:190px;width:190px}',
    '.at-panes.is-tight .at-pane-head{padding:0 10px;flex-basis:50px}',
    '.at-panes.is-tight .at-pane-body{padding:10px}',
    '.at-panes.is-tight .at-pane-row{padding:8px 9px}',
    '.at-panes.is-tight .at-pane-row-title{font-size:13px}',
    '.at-panes.is-compact .at-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}',
    /* ★ v1.11：待办状态 3 → 4 档（多「已删除」）。基础外观在 85-desktop.js，这里只补
     * 两件它没管的事：① 锁单行（否则「未完成」被挤成两行、压在 26 高的键上）；
     * ② is-tight（列表 190）时再收一档字号与内距，四档才塞得下。
     * 特异度：0,2,0 与 85 的 `.at-list-tabs .at-seg-item` 同档，但 `white-space` 是它没写的属性；
     * is-tight 那条 0,4,0 直接压过。 */
    '.at-list-tabs .at-seg-item{white-space:nowrap}',
    '.at-panes.is-tight .at-list-tabs{padding:0 10px 10px}',
    '.at-panes.is-tight .at-list-tabs .at-seg-item{padding:0 2px;font-size:10px}'
  ].join('')

  /* 面板宽度分档：由 shell 的 ResizeObserver 实测写入 ui.paneWidth。
   * v1.12 起多一档 `is-list-collapsed` —— 列表向左收起、把宽度让给详情（用户第 2 条）。
   * ⚠️ tight 档**不加** collapsed：那一档本来就是「列表 / 详情」二态互斥
   *    （85-desktop 的 show-detail 那段），两套折叠机制叠一起会互相打架。 */
  function widthClass(s) {
    var w = Number(s.ui.paneWidth || 0)
    var tight = !!(w && w < 660)
    var cls = tight
      ? ' is-tight' + (s.ui.detailOpen ? ' show-detail' : '')
      : (w && w < 980 ? ' is-compact' : '')
    if (s.ui.listCollapsed && !tight) cls += ' is-list-collapsed'
    return cls
  }
  function meta(kind) { return C.LIST_META[kind] }
  function entityList(s, kind) {
    if (kind === 'project') return s.projects
    if (kind === 'todo') return s.todos
    return s.mindmaps
  }
  function selId(s, kind) { return s.ui[meta(kind).idKey] || '' }
  function setSel(kind, id) {
    var patch = { detailOpen: true }; patch[meta(kind).idKey] = id
    B.ui(patch)
  }
  /* 列表真源：Core.filter* 与小程序 store.js 同源。
   * ★ 2026-11-09 轮次 8：这里**不再接 scope**。以前项目 / 状态这类收窄条件
   *   还能从 `ui.listScope` 再叠一层，等于同一件事有两个真源 —— 筛选抽屉里改了它
   *   不跟着变、它被「清除」了筛选还留着，用户看到的是"提示条没了、列表还是那几条"。
   *   现在一律走 `ui.{p,t,m}Filter`（唯一真源），跨页带筛选用 openFiltered()。 */
  function listOf(s, kind) {
    return kind === 'project' ? Core.filterProjects(s)
      : kind === 'todo' ? Core.filterTodos(s)
        : Core.filterMindmaps(s)
  }
  function filterKey(kind) { return kind === 'project' ? 'pFilter' : kind === 'todo' ? 'tFilter' : 'mFilter' }
  function defaultFilter(kind) {
    return kind === 'project' ? { kw: '', status: 'active', node: 'all', agentId: '' }
      : kind === 'todo' ? { kw: '', status: 'open', projectId: '', range: 'all' }
        : { kw: '', projectId: '', format: 'all', range: 'all' }
  }
  function activeFilterCount(s, kind) {
    var f = s.ui[filterKey(kind)] || {}
    return Object.keys(f).filter(function (k) {
      var v = f[k], d = defaultFilter(kind)[k]
      return k !== 'kw' && v !== undefined && v !== d && v !== '' && v !== 'all'
    }).length
  }
  /* 「带着一组筛选跳到某个列表」的唯一入口 —— 项目详情底行那两颗
   * （待办「已完成待办」/ 脑图「查看全部」）走这里。
   * 以前它们另写 `ui.listScope`，列表页顶上因此多出一条独立的「限定项目：X ＋ 清除」
   * 提示带（`.at-scope-note`）：既与筛选抽屉重复表达同一件事，又是第二个清除入口。
   * 现在只写筛选模型，跳过去后：工具条筛选键显示「筛选 N」、抽屉里对应 chips 亮着、
   * 清除只有「清除全部筛选」一处。`dict` 会在 defaultFilter 之上覆盖，
   * 保证从详情页跳过来看到的就是这一组条件（不残留上次的关键词）。
   * 同时把列表展开 —— 用户点「已完成待办」就是要看那批列表，别让他落地在一张
   * 收起的侧栏加一块详情上（`listCollapsed` 是跨页保持的）。 */
  function openFiltered(kind, dict) {
    var p = { listCollapsed: false }
    p[filterKey(kind)] = Object.assign(defaultFilter(kind), dict || {})
    S.setView(kind)
    B.ui(p)
  }

  /* ------------------------------------------------------- filter drawer --- */
  /* 筛选**内容**：关键词 ＋ 各条件组。外壳由下面的 FilterDrawer 出，两者分开，
   * 「同一套 .at-drawer 外壳」对创建 / 编辑 / 筛选三处才只有一个真源。
   * 控件形态沿用插件既有 chips（即时生效、无「确定」），与小程序 `.tf` 的
   * 数据驱动分组同构；功能状态机（ui.{p,t,m}Filter、set、reset）一行未动。 */
  /* ★★ 2026-11-10：补齐三组「有字段、没入口」的筛选维度 ——
   *  · 待办 / 脑图的**更新时间**：`defaultFilter().range` 与 `Core.inRange` 一直在用，
   *    `C.RANGES` 也早就在 10-constants 里登记，但面板从来没渲染过这一组
   *    ⇒ 用户只能筛状态与项目，想「只看这一周的」没有落点。
   *  · 项目的**关联 agent**：`pFilter.agentId` 同样一直被 `Core.filterProjects` 读，
   *    面板里没有这一组，而小程序 `drawers.pjAgentRowsOf()` 是有的。
   * 标签措辞与小程序 `rangeRowsOf()` 的键一致（全部 / 最近一周 / 最近一月 / 最近3个月），
   * 这里直接用 `C.RANGES` 那一份，不再手抄第二份中文名。 */
  /* ★★ 2026-11-10（轮次 10 · 用户第 5 条「三处筛选分别对齐小程序」）：
   * 组定义从 JSX 里搬出来成一张表 —— 与小程序 `utils/drawers.js` 的 `tf.groups`
   * **同构**（一组一条 `{ key, label, type, wrap, fill }`），顺序 / 措辞 / 形态
   * 逐条抄自那三处装配点：
   *   project  `status` 项目状态(chips) · `node` 节点(chips wrap) · `agentId` 关联 agent(rows)
   *   todo     `status` 待办状态(chips) · `projectId` 所属项目(rows) · `range` 更新时间(chips wrap fill)
   *   mindmap  `format` 格式(chips wrap) · `projectId` 所属项目(rows) · `range` 更新时间(chips wrap fill)
   * ⚠️「所属项目」「关联 agent」是**行组不是胶囊**：一行一个，色点 ＋ 名称 ＋ 条数。
   *    这是本轮补上的实质差距 —— 以前三组一律胶囊，项目一多就横着挤出抽屉，
   *    而且没法顺带报条数（用户得点进去数）。
   * ⚠️ 标签是「项目状态」「节点」，不是「状态」「项目节点」；措辞以 drawers.js 为准。
   * 抽表而不是三处各写一遍，是为了让判据能直接判「组 / 标签 / 形态」三样，
   * 也避免将来只改一处、另外两处悄悄漂移（小程序那边为同一个 key 漂过一次）。 */
  /* 「所属项目」行组的构造 —— 待办 / 脑图共用形状，只有计数口径不同：
   *  · 「全部」在待办读 `aliveTodos`（已删除不算，否则"全部"比各行之和还大；
   *    小程序 160 轮踩过同一个坑）、在脑图读 `mindmaps.length`。
   *  · **没有色的项目不进列表**（小程序 `if (!p.color) return`）——
   *    行首那颗点是这一组的读法，缺色的行会变成"没有信息的行"。
   * 键值：插件筛选模型里「不筛」是 `''`（`defaultFilter().projectId`），
   * 不是小程序内部用的 `'__all'`，这里保持插件自身的键、只换展示形态。 */
  function projectFilterRows(s, countOf, allCount) {
    var out = [{ key: '', name: '全部', color: '', count: allCount }]
    Core.activeProjects(s).forEach(function (p) {
      if (!p.color) return
      var c = C.colorOf(p.color)
      out.push({ key: p.id, name: p.name, color: c ? c.main : C.NONE_COLOR, count: countOf(p.id) })
    })
    return out
  }
  var FILTER_GROUPS = {
    project: [
      { key: 'status', label: '项目状态', type: 'chips', options: function () {
        return [{ key: 'active', name: '活跃' }, { key: 'archived', name: '已归档' },
          { key: 'all', name: '全部' }]
      } },
      { key: 'node', label: '节点', type: 'chips', wrap: true, options: function () {
        return [{ key: 'all', name: '全部' }].concat(C.NODES.map(function (n) {
          return { key: n, name: n }
        }))
      } },
      { key: 'agentId', label: '关联 agent', type: 'rows', options: function (s) {
        /* 每个 agent 报的是「它名下有几个项目」；「全部」报 `s.projects.length`
         * （含已归档 —— 与小程序 `pjAgentRowsOf` 同一口径，那一组管的是归属，
         *  不区分归档状态，归档是上一组的事）。 */
        return [{ key: '', name: '全部', color: '', count: s.projects.length }]
          .concat(s.agents.map(function (a) {
            return { key: a.id, name: a.name, color: '',
              count: s.projects.filter(function (p) { return p.agentId === a.id }).length }
          }))
      } }
    ],
    todo: [
      { key: 'status', label: '待办状态', type: 'chips', options: function () { return TODO_STATUS } },
      { key: 'projectId', label: '所属项目', type: 'rows', options: function (s) {
        return projectFilterRows(s,
          function (pid) { return Core.todosOfProject(s, pid).length },
          Core.aliveTodos(s).length)
      } },
      { key: 'range', label: '更新时间', type: 'chips', wrap: true, fill: true,
        options: function () { return C.RANGES.map(function (r) { return { key: r.key, name: r.name } }) } }
    ],
    mindmap: [
      { key: 'format', label: '格式', type: 'chips', wrap: true, options: function () {
        return [{ key: 'all', name: '全部' }].concat(C.FORMATS.map(function (x) {
          return { key: x.key, name: x.label }
        }))
      } },
      { key: 'projectId', label: '所属项目', type: 'rows', options: function (s) {
        return projectFilterRows(s,
          function (pid) { return Core.mindmapsOfProject(s, pid).length },
          s.mindmaps.length)
      } },
      { key: 'range', label: '更新时间', type: 'chips', wrap: true, fill: true,
        options: function () { return C.RANGES.map(function (r) { return { key: r.key, name: r.name } }) } }
    ]
  }

  function FilterPanel(props) {
    var s = props.s, kind = props.kind
    var key = filterKey(kind), f = s.ui[key] || defaultFilter(kind)
    function set(k, v) { var next = Object.assign({}, f); next[k] = v; var p = {}; p[key] = next; B.ui(p) }
    /* 胶囊组（`.tf-chips`）：`wrap` 才换行、`fill` 才均分两列，
     * 与小程序 `grp.wrap` / `grp.fill` 两个开关一一对应。 */
    function chips(label, k, options, opts) {
      var wrap = !!(opts && opts.wrap), fill = !!(opts && opts.fill)
      return h('div', { key: k, className: 'at-filter-group' },
        h('span', { className: 'at-filter-label' }, label),
        h('div', { className: 'at-filter-chips' + (wrap ? ' wrap' : '') }, options.map(function (o) {
          return h('button', { key: o.key, type: 'button',
            className: 'at-filter-chip' + (fill ? ' fill' : '')
              + (String(f[k] || '') === o.key ? ' is-on' : ''),
            onClick: function () { set(k, o.key) } }, o.name)
        })))
    }
    /* 行组（`.tf-rows`）：色点 ＋ 名称 ＋ 条数，一行一个。
     * `o.color` 为空也照样占位（`.at-filter-dot.empty`），整列文字才对齐。 */
    function rows(label, k, options) {
      return h('div', { key: k, className: 'at-filter-group' },
        h('span', { className: 'at-filter-label' }, label),
        h('div', { className: 'at-filter-rows' }, options.map(function (o) {
          var on = String(f[k] || '') === o.key
          return h('button', { key: o.key, type: 'button',
            className: 'at-filter-row' + (on ? ' is-on' : ''),
            'aria-pressed': on ? 'true' : 'false',
            onClick: function () { set(k, o.key) } },
            h('span', { className: 'at-filter-dot' + (o.color ? '' : ' empty'),
              style: o.color ? { background: o.color } : null }),
            h('span', { className: 'at-filter-row-t' }, o.name),
            h('span', { className: 'at-filter-row-n' }, String(o.count)))
        })))
    }
    return h('div', { className: 'at-filter-drawer' },
      /* ★ 搜索组：标签「搜索」＋ `.tf-sear` 那个 36 高壳（14px 图标 .45 ＋ 34 高输入框）。
       * 清空键只在有值时出现（小程序 `wx:if="{{kwText}}"`）——
       * 空框上挂一颗 ✕ 会让人以为"清空了什么东西"。 */
      h('div', { key: 'kw', className: 'at-filter-group' },
        h('span', { className: 'at-filter-label' }, '搜索'),
        h('div', { className: 'at-filter-search' },
          h(U.Icon, { name: 'search', size: 14, opacity: .45 }),
          h('input', { className: 'at-filter-input', type: 'text', value: f.kw || '',
            placeholder: meta(kind).search, 'aria-label': '搜索',
            onChange: function (e) { set('kw', e.target.value) } }),
          f.kw ? h('button', { type: 'button', className: 'at-filter-clear',
            title: '清空', 'aria-label': '清空搜索',
            onClick: function () { set('kw', '') } },
            h(U.Icon, { name: 'close', size: 11, opacity: .65 })) : null)),
      FILTER_GROUPS[kind].map(function (g) {
        var options = g.options(s)
        return g.type === 'rows'
          ? rows(g.label, g.key, options)
          : chips(g.label, g.key, options, g)
      }))
  }

  /* 右侧展开的筛选浮层：与 FormDrawer 共用 `.at-form-mask` / `.at-drawer` 外壳，
   * 所以 85-desktop.js 的 460 贴右全高几何与令牌解绑自动生效，不在这里另写一套。
   * 头 ＝ 标题 ＋「关闭」胶囊（小程序 .tf-close：即时生效的东西不写「取消」）；
   * 体 ＝ FilterPanel；底 ＝ 「改动即时生效 · 没有「确定」」＋「清除全部筛选」。
   * 遮罩点击 / Esc（50-shell.js）/ 关闭键三条通道都只写 ui.filterKind = null。
   * ⚠️ 筛选没有提交动作 ⇒ 底栏**不用** .at-sd-submit 实心主键，否则会读成「确定」。 */
  function FilterDrawer(props) {
    var s = props.s, kind = props.kind, m = meta(kind)
    var key = filterKey(kind)
    function close() { B.ui({ filterKind: null }) }
    function reset() { var p = {}; p[key] = defaultFilter(kind); B.ui(p) }
    return h('div', null,
      h('div', { className: 'at-form-mask', onClick: close }),
      h(U.Dialog, { as: 'section', className: 'at-drawer', role: 'dialog',
        'aria-label': m.label + '筛选' },
        h('div', { className: 'at-drawer-head' },
          h('span', { className: 'at-drawer-title' }, m.label + '筛选'),
          h('button', { type: 'button', className: 'at-sd-cancel', onClick: close },
            h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '关闭')),
        h('div', { className: 'at-drawer-body at-fd' },
          h(FilterPanel, { s: s, kind: kind })),
        h('div', { className: 'at-drawer-foot' },
          h('span', { className: 'at-filter-hint' }, '改动即时生效 · 没有「确定」'),
          h(U.Btn, { onClick: reset },
            h(U.Icon, { name: 'refresh', size: 15, opacity: .65 }), '清除全部筛选'))))
  }

  /* ----------------------------------------------------------- list pane --- */
  function ListPane(props) {
    var s = props.s, kind = props.kind, m = meta(kind)
    var [page, setPage] = React.useState(1)
    var searchRef = React.useRef(null)
    var fKey = filterKey(kind)
    /* 关键词只有**一个真源**：`ui.{p,t,m}Filter.kw`。列表头这只框、筛选抽屉第一组、
     * `Core.filter*` 三处读同一格 —— 以前列表头另存一份本地 kw，于是"抽屉里搜 A、
     * 列表头还写着 B"这种两份口径迟早会出现。 */
    var kw = String((s.ui[fKey] || {}).kw || '')
    function setKw(v) {
      var next = Object.assign({}, s.ui[fKey] || defaultFilter(kind)); next.kw = v
      var p = {}; p[fKey] = next; B.ui(p); setPage(1)
    }
    var all = listOf(s, kind)
    var list = all
    var shown = list.slice(0, page * 20)
    var selected = selId(s, kind)
    var filterOpen = s.ui.filterKind === kind
    var picking = !!(s.ui.mmPick || s.ui.capsulePick)

    /* 选中的项不存在时自动落到第一条；不放进 render，避免渲染期写状态。 */
    React.useEffect(function () {
      var hit = Core.byId(entityList(s, kind), selId(s, kind))
      if ((!hit || hit.deletedAt || !all.some(function (x) { return x.id === hit.id })) && all.length) {
        var patch = {}; patch[m.idKey] = all[0].id; B.ui(patch)
      } else if (!all.length && selected) {
        var emptyPatch = {}; emptyPatch[m.idKey] = ''; B.ui(emptyPatch)
      }
    }, [kind, selected, all.map(function (x) { return x.id }).join('|')])
    /* 重复点导航 / 从别处跳进列表时聚焦搜索框，等价于原来「打开列表抽屉」。 */
    React.useEffect(function () {
      if (s.ui.listFocus && searchRef.current && searchRef.current.focus) {
        try { searchRef.current.focus() } catch (e) {}
      }
    }, [s.ui.listFocus])

    function pick(x) { setSel(kind, x.id) }
    function rowMeta(x) {
      if (kind === 'todo') return AT.views.projectName(s, x.projectId) + ' · ' + C.urgencyOf(x.urgency).name +
        (x.deletedAt ? ' · 已删除' : '') + (x.done ? ' · 已完成' : '') +
        (x.mindmapId ? ' · 已关联脑图' : '')
      if (kind === 'mindmap') return C.formatOf(x.format).label + ' · ' + (x.nodes || 0) + ' 节点' +
        (Core.mindmapGateOf(x) ? ' · 待完善' : '') + ' · ' + Core.atMin(x.updatedAt || x.createdAt)
      return x.node + (x.archivedAt ? ' · 已归档' : '') + ' · ' + Core.atMin(x.updatedAt || x.createdAt)
    }
    function barColor(x) {
      if (kind === 'todo') return C.urgencyOf(x.urgency).main
      if (kind === 'project') { var c = C.colorOf(x.color); return c ? c.main : 'var(--at-hairline-strong)' }
      return 'var(--at-yellow-deep)'
    }
    var filterCount = activeFilterCount(s, kind)
    /* 空态要分清「真的空」与「被筛掉」（轮次 8）：筛选生效时还写「还没有待办」，
     * 用户会以为数据丢了 —— 尤其是从项目详情带筛选跳过来、落地正好 0 条的时候。
     * 关键词与筛选各自怎么放宽也分开说，别一句「换个关键词」包打天下。 */
    var empty = (kw || filterCount)
      ? { title: '没有符合条件的内容',
        hint: kw && filterCount ? '换个关键词，或在筛选里放宽一条'
          : kw ? '换个关键词再搜一次'
            : '当前筛选下没有内容，去「筛选」里放宽一条',
        act: '清除筛选' }
      : { title: m.empty, hint: '点击列表右上角新建', act: m.create }

    return h('section', { className: 'at-pane at-pane-list', 'aria-label': m.label + '列表' },
      h('div', { className: 'at-pane-head' },
        h(IconWithLabel, { name: m.icon, label: m.label }),
        h('span', { className: 'at-pane-count' }, list.length),
        h('span', { className: 'at-topbar-spacer' }),
        /* ★ 收起 / 展开入口只保留详情页左侧那颗页签（见 DetailPane.listToggle），
         * 列表头不再重复放一颗：两处都写 ui.listCollapsed，用户读不出区别。 */
        h(U.IconBtn, { name: 'plus', size: 15, title: m.create, label: m.create,
          onClick: function () { S.openForm(m.form, '') } })),
      h('div', { className: 'at-pane-tools' },
        h('input', { ref: searchRef, className: 'at-input', type: 'text', value: kw,
          placeholder: m.search, 'aria-label': m.search,
          onChange: function (e) { setKw(e.target.value) } }),
        h(U.Btn, { active: filterOpen,
          onClick: function () { B.ui({ filterKind: filterOpen ? null : kind }) },
          title: '在右侧展开筛选' },
          h(U.Icon, { name: 'sliders', size: 14 }), '筛选' + (filterCount ? ' ' + filterCount : ''))),
      h('div', { className: 'at-pane-scroll' },
        shown.length ? shown.map(function (x) {
          return h('button', { key: x.id, type: 'button',
            className: 'at-pane-row' + (selected === x.id ? ' is-on' : '') +
              (x.done ? ' is-done' : '') + (x.deletedAt ? ' is-gone' : '') +
              (picking ? ' is-pick' : ''),
            'aria-pressed': selected === x.id,
            onClick: function () { pick(x) },
            onKeyDown: function (e) {
              if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
              e.preventDefault()
              var i = shown.indexOf(x) + (e.key === 'ArrowDown' ? 1 : -1)
              if (shown[i]) {
                setSel(kind, shown[i].id)
                var sibling = e.key === 'ArrowDown' ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling
                if (sibling && sibling.focus) sibling.focus()
              }
            } },
            h('span', { className: 'at-pane-row-bar', style: { background: barColor(x) } }),
            h('span', { className: 'at-pane-row-main' },
              h('span', { className: 'at-pane-row-title' }, x.text || x.name || '（这条还是空的）'),
              h('span', { className: 'at-pane-row-meta' },
                kind === 'project' ? AT.views.colorDot(x.color) : null,
                h('span', null, rowMeta(x)))),
            kind === 'mindmap' ? h(U.Icon, { name: 'chevron-right', size: 14, opacity: .5 }) : null)
        }) : h(U.Empty, { icon: m.icon, title: empty.title, hint: empty.hint,
          action: { label: empty.act, onClick: function () {
            if (!kw && !filterCount) { S.openForm(m.form, ''); return }
            setKw(''); var patch = {}; patch[filterKey(kind)] = defaultFilter(kind); B.ui(patch)
          } } }),
        shown.length < list.length
          ? h(U.Btn, { onClick: function () { setPage(page + 1) } }, '加载更多（还有 ' + (list.length - shown.length) + ' 条）')
          : (list.length ? h('div', { className: 'at-muted', style: { textAlign: 'center', padding: '6px 0' } }, '已无更多信息') : null)),
      h('div', { className: 'at-pane-foot' },
        h('span', { className: 'at-muted' }, list.length + ' ' + m.unit),
        h('span', { className: 'at-muted' }, '↑ ↓ 切换 · Enter 查看')))
  }
  function IconWithLabel(props) {
    return h('span', { className: 'at-row' },
      h(U.Icon, { name: props.name, size: 18, opacity: .8 }),
      h('span', { className: 'at-pane-title' }, props.label))
  }

  /* --------------------------------------------------------- detail pane --- */
  function actionsFor(kind, s, x) {
    if (!x) return [h(U.Btn, { key: 'new', variant: 'primary',
      onClick: function () { S.openForm(meta(kind).form, '') } }, meta(kind).create)]
    /* v1.12 严格对齐小程序：操作键回到**详情内部**，页头不留重复入口。
     *   · 项目 —— 小程序详情里只有「编辑 / 取消归档」，且它就在基础信息卡右上角；
     *     页头这两颗留给"带项目预填新建"（小程序里它们在列表抽屉底部，插件没有那个抽屉）。
     *   · 待办 —— 操作是详情内那条**三态通栏动作条**（完成·导出·编辑·删除 /
     *     还原·导出·删除 / 还原）；页头再挂一排就是两套口径。
     *   · 脑图 —— 「编辑脑图信息」在画布右上浮条、「删除这张脑图」在编辑抽屉底部，
     *     页头一律不留。 */
    if (kind === 'project') {
      /* ★ 2026-11 用户口径：这两颗键原来只有文字。按小程序 `.tb-btn`
       * （app.wxss:931-946，13px/500/gap 5，项目详情「编辑」键用 13px 图标）
       * 在文字前补 `plus`；插件桌面尺寸（32 高 / 7 圆角 / gap 6）按用户要求保留。 */
      return [
        h(U.Btn, { key: 'newtodo', onClick: function () {
          S.openForm('todo', '', { preset: { projectId: x.id } })
        } }, h(U.Icon, { name: 'plus', size: 13 }), '新建待办'),
        h(U.Btn, { key: 'newmap', onClick: function () {
          S.openForm('mindmap', '', { preset: { projectId: x.id } })
        } }, h(U.Icon, { name: 'plus', size: 13 }), '新建脑图')
      ]
    }
    return []
  }
  /* 删除待办确认**只有一个真源**（62-views-b.js 的 confirmDeleteTodo）：列表行与详情页
   * 两处按钮共用它，否则「删除后去哪儿还原」这句口径会各写一份、迟早说岔
   * （v1.11 撤掉「我的 → 最近删除」时就真的岔过一次）。 */
  function confirmDeleteTodo(t) { return AT.views.confirmDeleteTodo(t) }
  function PaneHead(title, sub, actions, opts) {
    var o = opts || {}, toggle = o.listToggle
    return h('div', { className: 'at-pane-head' },
      /* 收起 / 展开键（2026-11-10 用户第 3 条）：**只要图标**、品牌黄、贴详情列左边界
       * （左缘 0 圆角），与列表头那颗 `+` 同一水平中线。文字只进 title / aria-label。
       * 皮肤在 85-desktop.js 的 `.at-detail-back`（这一层只管结构与语义）。 */
      toggle ? h('button', { type: 'button', className: 'at-detail-back',
        title: toggle.label, 'aria-label': toggle.label,
        'aria-expanded': toggle.collapsed ? 'false' : 'true',
        onClick: toggle.onClick },
        h(U.Icon, { name: toggle.collapsed ? 'chevron-right' : 'chevron-left', size: 16 })) : null,
      h('div', { style: { minWidth: 0, flex: '0 1 auto' } },
        h('div', { className: 'at-pane-title' }, title),
        sub ? h('div', { className: 'at-pane-sub' }, sub) : null),
      h('span', { className: 'at-topbar-spacer' }),
      h(U.Toolbar, null, actions))
  }
  function DetailPane(props) {
    var s = props.s, kind = props.kind, m = meta(kind)
    var x = Core.byId(entityList(s, kind), selId(s, kind))
    var w = Number(s.ui.paneWidth || 0)
    var tight = !!(w && w < 660)
    var collapsed = !!s.ui.listCollapsed
    /* 列表收起 / 展开的唯一入口。文案只保留「收起」/「展开」两个词（用户口径），
     * 详情页左缘的页签本身已经说明了作用对象。tight 档这颗仍是"返回列表"
     * （那一档是二态互斥，收起无意义），按默认保留。 */
    var listToggle = tight
      ? { collapsed: true, label: '列表', onClick: function () { B.ui({ detailOpen: false }) } }
      : { collapsed: collapsed, label: collapsed ? '展开' : '收起',
        onClick: function () { B.ui({ listCollapsed: !collapsed }) } }
    var title = x ? (x.text || x.name) : m.label
    var sub = x ? (kind === 'project' ? (x.node + (x.archivedAt ? ' · 已归档' : ''))
      : kind === 'todo' ? (AT.views.projectName(s, x.projectId) + ' · ' + C.urgencyOf(x.urgency).name)
        : ((Core.byId(s.projects, x.projectId) || {}).name || '未归属项目') + ' · ' + C.formatOf(x.format).label)
      : m.sub
    /* ★ 轮次 6：筛选搬去浮层抽屉（AT.panes.FilterDrawer，由 90-drawers.render 装配）。
     * 详情区**不再被筛选替换** —— 遮罩之下详情仍是详情，这是「弹窗抽屉」与
     * 「详情区换内容」的根本区别；关闭键也随之上移到抽屉自己的标题栏。 */
    var body = !x
      ? h(U.Empty, { icon: m.icon, title: '还没有打开过任何' + m.label,
        hint: '从左边列表里挑一个，或者新建一条',
        action: { label: m.create, onClick: function () { S.openForm(m.form, '') } } })
      : kind === 'project' ? AT.views.ProjectBody(s, x)
        : kind === 'todo' ? AT.views.TodoBody(s, x)
          : AT.mindmap.Detail(s, x)
    var detailActions = actionsFor(kind, s, x)
    return h('section', { className: 'at-pane at-pane-detail', 'aria-label': m.label + '详情' },
      PaneHead(title, sub, detailActions, { listToggle: listToggle }),
      h('div', { className: 'at-pane-body' + (x && kind === 'mindmap' ? ' is-canvas' : '') },
        body))
  }
  function Single(props) {
    var s = props.s
    return h('section', { className: 'at-pane at-pane-single' +
      (props.home ? ' is-home' : '') + widthClass(s),
      'aria-label': props.title },
      PaneHead(props.title, props.sub, props.actions),
      h('div', { className: 'at-pane-body' }, props.body))
  }

  /* -------------------------------------------------- picker bodies --- */
  /* 「为这条待办挑胶囊 / 挑脑图」——**只剩内容**，外壳（遮罩 ＋ 460 抽屉 ＋ 头 / 底栏）
   * 由 90-drawers.js 的 PickDrawer 装配，与创建 / 编辑 / 筛选同一套 .at-drawer。
   * 两条判别与小程序 `drawers.build('capsule')` / `build('mindmap')` 逐字一致：
   *   · 胶囊是**多选**：点一条只记选中，收尾由抽屉底栏的「保存」一次性提交
   *     （`B.actions.linkCapsules` → 胶囊从正常列表移出、挂到这条待办上）；
   *   · 脑图是**单选**：点一条立刻回填并关抽屉（`updateTodo({mindmapId})`），没有「确定」。
   * ⚠️ 候选口径不动：胶囊取 `Core.capsules(s)`（已关联 / 已转走 / 已删除的都不在里面），
   *    脑图只给**同项目且已完善**的那几张（跨项目关联会让"这条待办挂在别的项目的脑图上"）。
   */
  /* 入参兼容两种：作为组件（`h(Body, { s })`）或直接拿状态调（旧的
   * `AT.panes.MindmapPicker(state)` 判据仍这么用）—— 用 `ui` 在不在来分辨。 */
  function stateOf(props) { return (props && props.ui) ? props : ((props || {}).s || {}) }

  function CapsulePickBody(props) {
    var s = stateOf(props)
    var p = s.ui && s.ui.capsulePick
    if (!p) return null
    var picked = p.picked || []
    var list = Core.capsules(s)
    function toggle(id) {
      B.ui({ capsulePick: Object.assign({}, p, { picked: picked.indexOf(id) >= 0
        ? picked.filter(function (x) { return x !== id }) : picked.concat([id]) }) })
    }
    return h('div', null,
      h('div', { className: 'at-pick-note' },
        '勾选要挂到这条待办上的胶囊；保存后它们会从闪念胶囊列表移出，挂在这条待办下。'),
      list.length
        ? h('div', { className: 'at-picker-list' }, list.map(function (c) {
          var on = picked.indexOf(c.id) >= 0
          return h('button', { key: c.id, type: 'button',
            className: 'at-picker-row' + (on ? ' is-on' : ''),
            'aria-pressed': on, onClick: function () { toggle(c.id) } },
            h('input', { type: 'checkbox', checked: on, readOnly: true, 'aria-label': '选中' }),
            h('span', { style: { flex: '1 1 auto', minWidth: 0 } },
              c.text || '（这条还是空的）'))
        }))
        : h('div', { className: 'at-pick-empty' }, '闪念胶囊里还没有待整理的内容'))
  }
  function MindmapPickBody(props) {
    var s = stateOf(props)
    var p = s.ui && s.ui.mmPick
    if (!p || !p.todoId) return null
    var todo = Core.byId(s.todos, p.todoId)
    var list = s.mindmaps.filter(function (m) {
      return !Core.mindmapGateOf(m) && todo && m.projectId === todo.projectId
    })
    return h('div', null,
      h('div', { className: 'at-pick-note' },
        '只列这个项目里已完善的脑图；点一张立刻关联，不跨项目。'),
      list.length
        ? h('div', { className: 'at-picker-list' }, list.map(function (m) {
          return h('button', { key: m.id, type: 'button', className: 'at-picker-row',
            onClick: function () {
              B.actions.updateTodo(p.todoId, { mindmapId: m.id })
              B.ui({ mmPick: null })
            } },
            h(U.Icon, { name: 'mindmap', size: 15 }),
            h('span', { style: { flex: '1 1 auto', minWidth: 0 } }, m.name),
            h('span', { className: 'at-muted' }, C.formatOf(m.format).label))
        }))
        : h('div', { className: 'at-pick-empty' }, '当前项目还没有可用脑图，先新建一张'))
  }

  /* -------------------------------------------------------------- render --- */
  function Tri(s, kind) {
    return h('div', { className: 'at-panes' + widthClass(s) },
      h(ListPane, { key: 'list-' + kind, s: s, kind: kind }),
      h(DetailPane, { key: 'detail-' + kind, s: s, kind: kind }))
  }
  function render(s) {
    var active = s.ui.active
    if (active === 'overview') return h(Single, { s: s, home: true, title: '概览',
      sub: '活跃度日历 · 项目待办统计 · Agent 概况',
      actions: [
        h(U.Btn, { key: 'todo', onClick: function () { S.setView('todo') } }, '去看待办'),
        h(U.Btn, { key: 'new', variant: 'primary', onClick: function () { S.openForm('todo', '') } },
          h(U.Icon, { name: 'plus', size: 14, tone: 'ink' }), '记一条待办')
      ], body: AT.views.OverviewBody(s) })
    if (active === 'mine') return h(Single, { s: s, home: true, title: '我的',
      sub: '个人资料 · Agent · Token API',
      actions: [h(U.Btn, { key: 'back', onClick: function () { S.setView('overview') } }, '返回概览')],
      body: AT.views.MineBody(s) })
    return Tri(s, active in C.LIST_META ? active : 'todo')
  }

  AT.panes = {
    STYLE: STYLE, render: render, Tri: Tri, Single: Single,
    ListPane: ListPane, DetailPane: DetailPane, FilterPanel: FilterPanel,
    /* 组定义表也导出：判据要直接判「组 / 标签 / 形态」这三样（判求值产物，
     * 不读源码拼接），改坏一处立刻红。 */
    FILTER_GROUPS: FILTER_GROUPS,
    FilterDrawer: FilterDrawer,
    CapsulePickBody: CapsulePickBody, MindmapPickBody: MindmapPickBody,
    /* 旧名保留：外部（判据 / 预览脚本）还在按这两个名字取内容体。 */
    CapsulePicker: CapsulePickBody, MindmapPicker: MindmapPickBody,
    listOf: listOf, selId: selId, setSel: setSel, widthClass: widthClass,
    openFiltered: openFiltered
  }
})(AT, React, h)
