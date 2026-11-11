/* 50-shell.js — PC workspace shell.
 * 五模块左导轨（小程序 nav-rail 口径）＋ 页内一体化三栏（AT.panes）。
 * 导航仍按 utils/nav.js planFrom()：switch / drawer(=聚焦页内列表) / refresh。
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const

  var STYLE = [
    '.at-topbar{display:flex;align-items:center;gap:10px;height:56px;flex:0 0 56px;padding:0 20px;',
    'border-bottom:1px solid var(--at-hairline);background:var(--at-card)}',
    '.at-topbar-title{font-size:16px;font-weight:600;white-space:nowrap}',
    /* 横版组合标（顶栏**左侧**，与平板竖屏 `brand-head` 同位）：素材四周各有 120 透明留白
     * （3980×1204 / 可见 3737×960），所以「高 30」量出来是 30、看见的只有 23.9；
     * `margin-left:-2px` 把左缘那段留白扣掉，让可见笔画与顶栏内距齐平 ——
     * 与小程序 `.bh-lockup{margin-left:…-h*120/1204}` 同一条算法。
     * ⚠️ 负数在**左**、不在右：上一版按「右上角」落过，用户当场纠回。 */
    '.at-brand-lockup{display:block;height:30px;width:auto;flex:0 0 auto;margin-left:-2px;',
    'user-select:none;-webkit-user-drag:none}',
    '.at-topbar-count{color:var(--at-text2);font-size:12px;white-space:nowrap}',
    '.at-topbar-spacer{flex:1 1 auto;min-width:0}',
    '.at-status{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;',
    'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-card);',
    'color:var(--at-slate);font-size:12px;cursor:pointer;white-space:nowrap;font-family:inherit}',
    '.at-status:hover{background:var(--at-chip);color:var(--at-primary)}',
    /* ★ 轮次 12：「未登录」是默认态 ⇒ 这颗键必须读起来像**该点我**，不是一枚状态徽章。
     * 用暖黄底 ＋ **主墨文字**（＝主按钮 `--at-on-accent` 那套语言），既不与主按钮抢，
     * 也不会被误读成"不可用"（用 opacity 弱化正好是这个反义）。
     * ⚠️ 文字**不用** `--at-yellow-deep`：深黄压暖黄底只有约 1.8:1，12px 字直接糊在底上；
     *   品牌黄只留给小圆点（图形不承担可读性）。深色档自动成立 —— 暖黄变 #3A301A、
     *   主墨变 #EEEDEA，仍是浅字压深底。 */
    '.at-status.is-guest{border-color:var(--at-yellow-line);background:var(--at-yellow-warm);',
    'color:var(--at-primary);font-weight:600}',
    '.at-status.is-guest .at-status-dot{background:var(--at-yellow-deep)}',
    '.at-status.is-guest:hover{background:var(--at-yellow);border-color:var(--at-yellow);color:var(--at-on-accent)}',
    '.at-status.is-guest:hover .at-status-dot{background:var(--at-on-accent)}',
    '.at-status-dot{width:6px;height:6px;border-radius:50%;background:var(--at-muted)}',
    '.at-status.is-on .at-status-dot{background:var(--at-success)}',
    '.at-body{display:flex;flex:1 1 auto;min-height:0;min-width:0}',
    '.at-rail{display:flex;flex-direction:column;align-items:center;gap:8px;',
    'width:var(--at-rail-w);flex:0 0 var(--at-rail-w);padding:20px 0;',
    'border-right:1px solid var(--at-hairline);background:var(--at-card)}',
    '.at-rail-list{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}',
    '.at-rail-item{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:4px;width:40px;height:48px;border:0;border-radius:12px;background:transparent;',
    'color:var(--at-slate);font-family:inherit;font-size:11px;line-height:13px;cursor:pointer}',
    '.at-rail-item:hover:not(.is-active){background:var(--at-chip);color:var(--at-primary)}',
    '.at-rail-item.is-active{background:var(--at-yellow);color:var(--at-on-accent);font-weight:500}',
    '.at-rail-spacer{flex:1 1 auto}',
    '.at-work{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;overflow:hidden}',
    '.at-boot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'background:var(--at-surface);color:var(--at-muted);font-size:13px;z-index:20;pointer-events:none}',
    '.at-danger-note{padding:9px 11px;border-radius:10px;',
    'background:var(--at-fresh-bg);color:var(--at-fresh);font-size:12px}',
    '.at-op-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
    '.at-detail-col{display:flex;flex-direction:column;gap:12px;max-width:100%}',
    '.at-block{padding:14px;border:1px solid var(--at-hairline);border-radius:14px;',
    'background:var(--at-card);box-shadow:var(--at-sh-card)}',
    '.at-block-title{font-size:15px;font-weight:600;margin-bottom:10px}',
    '.at-kv{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:13px}',
    '.at-kv>span:first-child{color:var(--at-text2)}',
    '.at-hr{height:1px;background:var(--at-hairline-soft);margin:10px 0}'
  ].join('')

  function planFrom(active, key) {
    if (key !== active) return 'switch'
    if (C.DETAIL_MODULES.indexOf(key) >= 0) return 'drawer'
    return 'refresh'
  }
  /* ★ 轮次 12：未登录 ⇒ 打开任何页面都提示一次「请登录」。
   * 抽成纯函数只为一件事：判据可以直接喂状态验，不必去猜 useEffect 的闭包。
   * 两个条件缺一不可 ——
   *   · `bootReady`：宿主探测（/agent-todo/state）落地前不判定，否则已配对用户进场会闪一帧；
   *   · `!connected`：已登录不打扰。
   * ⚠️ 显式**不看** `connectOpen`：那是"已经在弹"，由调用点挡，别混进语义里。 */
  function gateFor(ui) {
    var s = ui || {}
    return !!s.bootReady && !s.connected
  }

  function setView(key) {
    /* 切模块时收掉筛选浮层：否则它带着上一个模块的 kind 挂在新页面上。
     * 详情内的两个查看层（图片 / 胶囊全文）同样收掉 —— 它们是局部模态，
     * 留着会盖在新页面上。 */
    B.ui({ active: key, drawer: null, form: null, filterKind: null,
      capsulePick: null, mmPick: null, detailOpen: false,
      imgView: null, capView: null })
  }
  function onNav(key) {
    var p = planFrom(B.get().ui.active, key)
    if (p === 'switch') setView(key)
    else if (p === 'drawer') B.ui({ detailOpen: false, listFocus: (B.get().ui.listFocus || 0) + 1 })
    else B.sync(false)
  }
  /* 列表不再是弹层：所有「打开 X 列表」都落到页内列表 / 页内选择器。
   * 2026-11-09 轮次 8：`listScope` 这套"页内临时收窄"已并进筛选模型
   * （`ui.{p,t,m}Filter`）—— 列表页只认筛选，不再有第二条收窄通道。
   * 这里只剩「带对象的选择态」（胶囊关联 / 选脑图挂待办）走 ui.capsulePick / ui.mmPick。 */
  function openListDrawer(kind, scope) {
    var o = scope || {}
    if (kind === 'capsule') {
      B.ui({ capsulePick: { todoId: o.todoId || '', picked: [] }, drawer: null })
      return
    }
    if (kind === 'mindmap' && o.pickTodoId) {
      B.ui({ mmPick: { todoId: o.pickTodoId }, drawer: null })
      return
    }
    if (C.LIST_META[kind]) {
      B.ui({ active: kind, drawer: null, form: null, filterKind: null, detailOpen: false,
        capsulePick: null, mmPick: null,
        listFocus: (B.get().ui.listFocus || 0) + 1 })
    }
  }
  function closeDrawer() { B.ui({ drawer: null }) }
  function openForm(mode, id, opts) {
    /* 表单与筛选都是右侧展开浮层、共用一层遮罩 ⇒ 开表单时收筛选，不叠两层。 */
    B.ui({ filterKind: null,
      form: { mode: mode, id: id || '', offset: (opts && opts.offset) || 0,
        preset: (opts && opts.preset) || null, scope: (opts && opts.scope) || null,
        parent: (opts && opts.parent) || null } })
  }
  function closeForm() { var f = B.get().ui.form; B.ui({ form: f && f.parent ? f.parent : null }) }
  function openCapsule(seed) { AT.capsule.openCapsule(seed) }
  function closeCapsule() { AT.capsule.closeCapsule() }
  function openConfirm(cfg) { B.ui({ confirm: cfg }) }
  function closeConfirm() { B.ui({ confirm: null }) }

  function Workspace() {
    var state = B.useStore()
    var uiState = state.ui
    var dark = AT.icons.useDark()
    var rootRef = React.useRef(null)
    React.useEffect(function () { B.bootstrap() }, [])
    React.useEffect(function () {
      var el = rootRef.current
      if (!el || typeof window === 'undefined' || !window.ResizeObserver) return
      var ro = new window.ResizeObserver(function (entries) {
        var w = Math.round((entries[0] && entries[0].contentRect && entries[0].contentRect.width) || 0)
        if (w && w !== B.get().ui.paneWidth) B.ui({ paneWidth: w })
      })
      try { ro.observe(el) } catch (e) { return }
      return function () { try { ro.disconnect() } catch (e) {} }
    }, [])
    React.useEffect(function () {
      function onKey(e) {
        if (e.key !== 'Escape') return
        /* 详情内的查看层在最上层（z160）⇒ 先收它：图片层压在胶囊全文层之上，
         * 所以先关图片、再关全文（与 62-views-b 的 DOM 顺序一致）。 */
        if (uiState.imgView) { e.preventDefault(); B.ui({ imgView: null }); return }
        if (uiState.capView) { e.preventDefault(); B.ui({ capView: null }); return }
        if (uiState.captureOpen || uiState.composerOpen) {
          e.preventDefault(); B.ui({ captureOpen: false, captureSeed: '', captureCapsuleOnly: false, composerOpen: false }); return
        }
        if (uiState.connectOpen) { e.preventDefault(); B.ui({ connectOpen: false }); return }
        if (uiState.confirm) { e.preventDefault(); closeConfirm(); return }
        if (uiState.form) { e.preventDefault(); closeForm(); return }
        /* ★ 轮次 6：筛选已是浮层抽屉 ⇒ Esc 也要能收它，排在表单之后、
         * 页内选择器之前（与遮罩 z54 的层级顺序一致）。 */
        if (uiState.filterKind) { e.preventDefault(); B.ui({ filterKind: null }); return }
        if (uiState.capsulePick || uiState.mmPick) {
          e.preventDefault(); B.ui({ capsulePick: null, mmPick: null }); return
        }
        if (uiState.drawer) { e.preventDefault(); closeDrawer(); return }
        /* 闪念胶囊的 Esc 由全局悬浮层自己处理（先收子面板，再收抽屉）。 */
      }
      window.addEventListener('keydown', onKey)
      return function () { window.removeEventListener('keydown', onKey) }
    }, [uiState.confirm, uiState.form, uiState.filterKind, uiState.drawer,
      uiState.capsulePick, uiState.mmPick, uiState.connectOpen, uiState.captureOpen,
      uiState.composerOpen, uiState.imgView, uiState.capView])

    /* ★ 轮次 12：未登录 ⇒ 每「打开一个页面」都提示登录。
     * 触发点只有两个：① 进入某个模块（`uiState.active` 变化）；② 首次探测落地（`bootReady`）。
     * ⚠️ 依赖里**刻意不放 `connected`** —— 放了以后用户刚点「退出登录」就会被立刻再弹一次，
     *   而他上一秒才明确表达过"我要退出去看演示数据"。切页面照旧会提醒。
     * 判定读 `B.get()` 而不读闭包里的 `uiState`：效果只在这一帧跑，取值要的是当下的真值。 */
    React.useEffect(function () {
      var s = B.get().ui
      if (!gateFor(s) || s.connectOpen) return
      B.ui({ connectOpen: true, connectError: '' })
    }, [uiState.active, uiState.bootReady])

    var activeName = (C.MODULES.filter(function (m) { return m.key === uiState.active })[0] || C.MODULES[0]).label
    var layout = uiState.paneWidth && uiState.paneWidth < 660 ? 'tight'
      : uiState.paneWidth && uiState.paneWidth < 1100 ? 'compact' : 'wide'
    return h('div', { className: 'at-root', ref: rootRef, 'data-layout': layout, 'data-dark': String(dark) },
      h('style', null, U.themeCss(dark) + U.STYLE + STYLE +
        (AT.panes ? AT.panes.STYLE : '') + (AT.views ? AT.views.STYLE : '') +
        (AT.mindmap ? AT.mindmap.STYLE : '') +
        (AT.drawers ? AT.drawers.STYLE : '') + (AT.overlays ? AT.overlays.STYLE : '') +
        (AT.desktop ? AT.desktop.STYLE : '')),
      h('header', { className: 'at-topbar' },
        /* ★★ 2026-11-10（用户第 1 条订正）：「横版 logo 放在顶部**左侧**」。
         * 上一版按「右上角」落过一次，用户当场纠回 —— 平板竖屏的品牌行本来就是
         * 左上角一枚组合标（`components/brand-head`），插件的顶栏同一行，
         * 品牌只能在左、模块名紧跟其后，顺序不能倒。 */
        h('img', { className: 'at-brand-lockup', draggable: false, alt: 'Agent ToDo',
          src: dark ? '/agent-todo/assets/d-brand-lockup.png' : '/agent-todo/assets/brand-lockup.png' }),
        h('span', { className: 'at-topbar-title' }, activeName),
        h('span', { className: 'at-topbar-spacer' }),
        h('button', { type: 'button', className: 'at-status' + (uiState.connected ? ' is-on' : ' is-guest'),
          title: uiState.connected ? '已连接 Agent ToDo 账号'
            : '请登录 · 点这里扫码，与小程序数据同步',
          onClick: function () { B.ui({ connectOpen: true, connectError: '' }) } },
          h('span', { className: 'at-status-dot' }),
          uiState.connected ? ((uiState.user && uiState.user.nickname) || '已连接') : '请登录'),
        h(U.IconBtn, { name: 'refresh', title: '刷新', label: '刷新',
          disabled: uiState.syncing, onClick: function () {
            if (!uiState.connected) { B.toast('登录后才能同步，现在看到的是演示数据'); return }
            B.sync(true)
          } })),
      h('div', { className: 'at-body' },
        h('nav', { className: 'at-rail', 'aria-label': '模块导航' },
          h('div', { className: 'at-rail-list' }, C.MODULES.map(function (m) {
            var on = uiState.active === m.key
            /* ★ 2026-11-10（用户第 2 条）：「左侧导航栏不再显示数量」。
             * 原来「待办」那一项带一颗未完成计数（`.at-nav-count`）—— 只有一项有数字，
             * 读起来像"这一项特殊"，而不是"所有项的数量"；导航从此只负责去哪。
             * 数量改由列表头的 `.at-pane-count` 承担（那是当前列表的真实条数）。 */
            return h('button', { key: m.key, type: 'button',
              className: 'at-rail-item' + (on ? ' is-active' : ''),
              title: m.label, 'aria-label': m.label, 'aria-current': on ? 'page' : null,
              onClick: function () { onNav(m.key) } },
              h(U.Icon, { name: m.icon, size: 18, opacity: on ? 1 : .62 }),
              h('span', null, m.label))
          })),
          h('span', { className: 'at-rail-spacer' })),
        h('main', { className: 'at-work' },
          uiState.syncing && !state.loaded ? h('div', { className: 'at-boot' }, '正在同步你的数据…') : null,
          AT.panes.render(state))),
      AT.drawers.render(state, { openForm: openForm, closeForm: closeForm, openListDrawer: openListDrawer }),
      AT.overlays.render(state),
      uiState.confirm ? h(U.Confirm, {
        title: uiState.confirm.title, body: uiState.confirm.body,
        confirmText: uiState.confirm.confirmText, danger: uiState.confirm.danger !== false,
        onCancel: closeConfirm,
        onConfirm: function () { var fn = uiState.confirm.onConfirm; closeConfirm(); if (fn) fn() }
      }) : null)
  }

  AT.shell = {
    Workspace: Workspace, STYLE: STYLE, planFrom: planFrom, setView: setView, onNav: onNav,
    gateFor: gateFor,
    openListDrawer: openListDrawer, closeDrawer: closeDrawer, openForm: openForm,
    closeForm: closeForm, openCapsule: openCapsule, closeCapsule: closeCapsule,
    openConfirm: openConfirm, closeConfirm: closeConfirm
  }
})(AT, React, h)
