/* 20-core.js — business logic transcribed from 小程序前端/utils/store.js.
 * Pure functions only: no wx, no DOM, no network. Safe to require in Node
 * for the parity/behaviour checks (scripts/verify-package.cjs).
 */
;(function (AT) {
  'use strict'
  var C = AT.const

  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
  }
  function dateOf(s) { return String(s || '').slice(0, 10) }
  function atMin(s) { return String(s || '').slice(0, 16) }
  function uid(p) {
    seq += 1
    return p + Date.now().toString(36) + seq
  }
  var seq = 0
  function clone(v) { return JSON.parse(JSON.stringify(v)) }
  function byId(list, id) { return (list || []).filter(function (x) { return x.id === id })[0] || null }

  /* ------------------------------------------------------------ snapshot --- */
  /* 与 mock.js buildHeatWeeks() 同源：本地时区 + 周一对齐的 30 周窗口。
   * 不能用 toISOString()：UTC+8 的 00:00–08:00 会让 date 比本地今天少一天，
   * 于是 activity 台账（本地 dateOf(stamp())）与格子错位且不报错。 */
  var WEEK_CN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  function emptyHeat() {
    var weeks = [], i, j, DAY = 86400000
    var now = new Date()
    var pad = function (n) { return (n < 10 ? '0' : '') + n }
    var ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
    var base = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    var startMonday = base - ((now.getDay() + 6) % 7) * DAY - (C.HEAT.weeks - 1) * 7 * DAY
    for (i = 0; i < C.HEAT.weeks; i++) {
      var days = []
      for (j = 0; j < 7; j++) {
        var d = new Date(startMonday + (i * 7 + j) * DAY)
        var date = ymd(d)
        days.push({ weekNo: i + 1, dayIndex: j, date: date,
          mmdd: pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
          label: date + ' ' + WEEK_CN[j], created: 0, completed: 0, capsule: 0 })
      }
      weeks.push({ weekNo: i + 1, key: 'w' + (i + 1), days: days })
    }
    return { weeks: weeks, legend: C.HEAT.legend.slice(), bands: C.HEAT.bands.slice() }
  }

  function initialState() {
    var demo = demoState()
    return Object.assign(demo, {
      ui: {
        active: 'overview', projectId: '', todoId: '', mindmapId: '',
        drawer: null, form: null, capsule: null, toast: null,
        listFocus: 0, capsulePick: null, mmPick: null,
        /* v1.12：列表可向左侧收起；筛选改走右侧抽屉（与小程序筛选副弹窗同构）；
         * detailUrg = 项目详情里那排四档紧急度的筛选态，**带项目 id** 才会在
         * 切项目时自动归零（否则会留下"选了紧急、换项目后网格空着"的假空态）。 */
        listCollapsed: false, filterKind: null, detailOpen: false, detailUrg: null,
        paneWidth: 0,
        pFilter: { kw: '', status: 'active', node: 'all', agentId: '' },
        tFilter: { kw: '', status: 'open', projectId: '', range: 'all' },
        mFilter: { kw: '', projectId: '', format: 'all', range: 'all' },
        /* ★ 轮次 12：「未登录」是**默认态**，不是"降级态" —— `connected:false` 现在
         * 直接读作「请登录」，数据侧照旧铺一整套演示数据（见 demoState）。
         * `bootReady` 只做一件事：等宿主探测（/agent-todo/state）落地再决定要不要弹登录闸门，
         * 否则已登录用户进场会先闪一帧「请登录」弹窗。 */
        heatSelected: null, connected: false, connectOpen: false, connectError: '',
        bootReady: false,
        connectBusy: false, syncing: false, user: null, apiBase: 'https://todo.memorymap.cn/api/v1',
        captureOpen: false, captureSeed: '', captureCapsuleOnly: false,
        composerOpen: false, composerActions: null
      }
    })
  }

  function adaptSnapshot(data) {
    var d = data || {}
    var projects = (d.projects || []).map(function (p) { return {
      id: p.id, name: p.name || '', color: p.color || '', node: p.node || C.NODES[0],
      agentId: p.agentId || '', remark: p.remark || '', archivedAt: p.archivedAt || null,
      createdAt: p.createdAt || '', updatedAt: p.updatedAt || ''
    } })
    var todos = (d.todos || []).map(function (t) { return {
      id: t.id, projectId: t.projectId || '', mindmapId: t.mindmapId || null,
      text: t.text || '', urgency: t.urgency || 'hold',
      done: t.status === 'done' || t.status === 'completed' || t.done === true,
      createdAt: t.createdAt || '', completedAt: t.completedAt || null, updatedAt: t.updatedAt || '',
      images: (t.images || []).map(function (im) { return typeof im === 'string'
        ? { id: uid('i'), label: '', uri: im } : { id: im.id || uid('i'), label: im.label || '', uri: im.uri || '' } }),
      flashAt: t.flashAt || '', deletedAt: t.deletedAt || null, deleted: !!t.deletedAt
    } })
    var mindmaps = (d.mindmaps || []).map(function (m) { return {
      id: m.id, projectId: m.projectId || '', name: m.name || '',
      nodes: m.nodeCount != null ? m.nodeCount : (m.nodes || 0), depth: m.depth || 1,
      format: m.format || '', agentId: m.agentId || '', aiState: m.aiState || '',
      flashAt: m.flashAt || '', updatedAt: m.updatedAt || ''
    } })
    var capsules = (d.capsules || []).map(function (c) { return {
      id: c.id, text: c.text || '', createdAt: c.createdAt || '', source: c.source || 'text',
      imageUri: c.imageUri || null, todoId: c.todoId || null,
      deletedAt: c.deletedAt || null, consumedAt: c.consumedAt || null,
      deleted: !!c.deletedAt, consumed: !!c.consumedAt
    } })
    var activity = {}
    if (Array.isArray(d.activity)) d.activity.forEach(function (a) {
      activity[a.date || a.day] = { created: a.created || 0, completed: a.completed || 0, capsule: a.capsule || 0 }
    })
    else if (d.activity && typeof d.activity === 'object') activity = clone(d.activity)
    var me = d.me || null
    if (me && !me.name && me.nickname) me = Object.assign({}, me, { name: me.nickname })
    return {
      me: me, loaded: true, source: 'api',
      agents: d.agents || [], tokenKeys: d.tokenKeys || [],
      projects: projects, todos: todos, mindmaps: mindmaps, capsules: capsules,
      tree: {}, hist: {}, activity: activity, heat: emptyHeat()
    }
  }

  /* ----------------------------------------------------------- selectors --- */
  var aliveTodos = function (s) { return s.todos.filter(function (t) { return !t.deletedAt }) }
  var deletedTodos = function (s) { return s.todos.filter(function (t) { return !!t.deletedAt }) }
  var isGoneCapsule = function (c) { return !!(c.deleted || c.consumed) }
  function capsules(s) {
    return s.capsules.filter(function (c) { return !isGoneCapsule(c) && !c.todoId })
      .sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)) })
  }
  function deletedCapsules(s) { return s.capsules.filter(function (c) { return !!c.deleted }) }
  function capsulesOfTodo(s, tid) { return s.capsules.filter(function (c) { return c.todoId === tid && !c.deleted }) }
  var activeProjects = function (s) { return s.projects.filter(function (p) { return !p.archivedAt }) }
  var archivedProjects = function (s) { return s.projects.filter(function (p) { return !!p.archivedAt }) }
  function todosOfProject(s, pid) { return aliveTodos(s).filter(function (t) { return t.projectId === pid }) }
  function mindmapsOfProject(s, pid) { return s.mindmaps.filter(function (m) { return m.projectId === pid }) }
  function projectSummary(s, pid) {
    var all = todosOfProject(s, pid)
    return { open: all.filter(function (t) { return !t.done }).length,
      done: all.filter(function (t) { return t.done }).length,
      mindmaps: mindmapsOfProject(s, pid).length }
  }
  function scoreOf(s, pid) {
    return todosOfProject(s, pid).filter(function (t) { return !t.done })
      .reduce(function (n, t) { return n + C.urgencyOf(t.urgency).weight }, 0)
  }
  function sortProjects(s) {
    return activeProjects(s).slice().sort(function (a, b) {
      var d = scoreOf(s, b.id) - scoreOf(s, a.id)
      return d || String(b.updatedAt).localeCompare(String(a.updatedAt))
    })
  }
  function sortTodos(s, list) {
    return list.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1
      var d = C.urgencyOf(b.urgency).weight - C.urgencyOf(a.urgency).weight
      return d || String(b.createdAt).localeCompare(String(a.createdAt))
    })
  }
  function sortByUpdated(list) {
    return list.slice().sort(function (a, b) { return String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)) })
  }

  /* ------------------------------------------------- 概览装配（FR-5） ---
   * 与 小程序前端/utils/store.js 的 `statOfProject()` / `overviewProjectCards()` /
   * `agentCardViews()` / `ringOf()` **同一口径**：概览页只负责画，数都在这里算。
   * ⚠️ 项目卡与 agent 卡的形状是"给视图的"，页面不许再自己 filter 一遍 ——
   *   两处各算一次是本工程反复踩过的坑（"同一张卡两页数不一样"）。 */

  /* 某项目的四档条数 —— **只算未完成**（★ 160 轮：已删除的也不计）。
   * 卡片要回答的是"这个项目还欠着什么"，已完成的不占条数（FR-5.2 的四档＝欠量）。 */
  function statOfProject(s, pid) {
    var st = { urgent: 0, mid: 0, low: 0, hold: 0 }
    todosOfProject(s, pid).forEach(function (t) {
      if (t.done) return
      if (st[t.urgency] !== undefined) st[t.urgency] += 1
    })
    return st
  }
  function statScore(st) {
    return st.urgent * 5 + st.mid * 3 + st.low * 1
  }
  function projectCardView(s, p) {
    var c = p.color ? C.colorOf(p.color) : null
    var st = statOfProject(s, p.id)
    var ag = p.agentId ? byId(s.agents, p.agentId) : null
    return {
      id: p.id, name: p.name, node: p.node,
      color: c ? c.main : C.NONE_COLOR,
      agentName: ag ? ag.name : '',
      /* 四档条的档名与键名只有一份真源（`C.URGENCY`），模板里不许手抄四个中文名。 */
      statChips: C.URGENCY.map(function (u) { return { key: u.key, name: u.name, n: st[u.key] || 0 } }),
      total: st.urgent + st.mid + st.low + st.hold,
      score: statScore(st),
      mindmaps: mindmapsOfProject(s, p.id).length
    }
  }
  /* 概览「项目待办统计」：排除已归档 → **只取有颜色的项目**（色点是项目身份唯一的颜色载体）
   * → 按综合紧急度降序 → 最多 `PROJECT_SLOTS` ＝ 色槽位数（8）张。 */
  function overviewProjectCards(s) {
    return sortProjects(s).filter(function (p) { return !!p.color })
      .slice(0, C.COLORS.length).map(function (p) { return projectCardView(s, p) })
  }

  /* ---------------- 额度重置日（agent.quotaResetAt ＝「每月几号」） ----------------
   * 133 轮起只记「日」（`'01'`–`'31'`）；这三支与小程序 store.js 逐行同源。 */
  var MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  function daysInMonth(mon) {
    var m = Math.round(Number(mon))
    return (m >= 1 && m <= 12) ? MONTH_DAYS[m - 1] : 31
  }
  /* 必须先夹到当月最后一天再交给 Date —— `new Date(2026, 1, 31)` 会静默滚到 3 月 3 日，
   * "每月 31 日"于是被算成"还有一个月"（不报错、只是数错）。 */
  function resetAt(year, monIdx, day) {
    var y = year + Math.floor(monIdx / 12)
    var m = monIdx - Math.floor(monIdx / 12) * 12
    var max = daysInMonth(m + 1)
    return new Date(y, m, day > max ? max : day).getTime()
  }
  /* `'15'` / `'10-15'` / `'2026/10/15 13:54:03'` 三种历史写法都抠出末尾那一节「日」。
   * ⚠️ 不能"取最后两位"：完整时间戳的末两位是秒。 */
  function resetDayOf(v) {
    var str = String(v == null ? '' : v).trim()
    if (!str) return null
    var m = /^(?:\d{4}[-\/])?(?:\d{1,2}[-\/])?(\d{1,2})(?:\s|$)/.exec(str)
    if (!m) return null
    var d = Math.round(Number(m[1]))
    if (!d || d < 1) return null
    return d > 31 ? 31 : d
  }
  function daysUntilReset(v, today) {
    var day = resetDayOf(v)
    if (day === null) return null
    var base = new Date((today || dateOf(stamp())) + 'T00:00:00')
    var t = resetAt(base.getFullYear(), base.getMonth(), day)
    if (t < base.getTime()) t = resetAt(base.getFullYear(), base.getMonth() + 1, day)
    return Math.round((t - base.getTime()) / 86400000)
  }
  /* 「距离重置」圆环 —— 3 个字段给视图：`deg` 进度角 / `num` 圆心大字 / `unit` 单位。
   * 周期按自然月：prev ＝ 本月那一日（已过则上月），next ＝ 本月那一日（已过则下月）。
   * ⚠️ 两边**刻意不对称**（prev 用严格大于、next 含等号）：今天正好是重置日 ⇒ prev ＝ 今天
   *   ⇒ 进度 0、圆心「今天」，读作"刚重置"；写成对称会变成"周期刚走完"（进度满），正好反了。 */
  function ringOf(a, today) {
    var day = resetDayOf(a && a.quotaResetAt)
    if (day === null) return { deg: 0, num: '未填', unit: '', muted: true }
    var base = new Date((today || dateOf(stamp())) + 'T00:00:00')
    var prev = resetAt(base.getFullYear(), base.getMonth(), day)
    if (prev > base.getTime()) prev = resetAt(base.getFullYear(), base.getMonth() - 1, day)
    var next = resetAt(base.getFullYear(), base.getMonth(), day)
    if (next <= base.getTime()) next = resetAt(base.getFullYear(), base.getMonth() + 1, day)
    var span = next - prev
    var deg = span > 0 ? Math.max(0, Math.min(360, Math.round(((base.getTime() - prev) / span) * 360))) : 0
    var d = daysUntilReset(a && a.quotaResetAt, today)
    if (d === null) return { deg: deg, num: '未填', unit: '', muted: true }
    if (d <= 0) return { deg: deg, num: '今天', unit: '', muted: false }
    return { deg: deg, num: String(d), unit: '天', muted: false }
  }
  /* agent 卡 —— 「我的」与概览共用这一份形状。
   * ★ 157 轮：卡面已撤下「当前剩余 / 更新于」（没有取余额的 API，手填的数只会过期误导）
   *   ⇒ `quotaLeft` / `updatedAt` / `stale` 不再下发；「每月套餐」是静态档位，保留。 */
  function agentCardViews(s, today) {
    return (s.agents || []).map(function (a) {
      var ps = s.projects.filter(function (p) { return p.agentId === a.id })
      var ring = ringOf(a, today)
      return {
        id: a.id, name: a.name,
        monthlyQuota: a.monthlyQuota || '未填',
        projectCount: ps.length,
        resetNum: ring.num, resetUnit: ring.unit, resetMuted: ring.muted, ringDeg: ring.deg
      }
    })
  }
  function inRange(value, range) {
    if (!range || range === 'all') return true
    var days = C.RANGE_DAYS[range]
    if (days == null) return true
    return (Date.now() - new Date(String(value).replace(/-/g, '/')).getTime()) <= (days + 1) * 86400000
  }
  function filterTodos(s, scope) {
    var f = Object.assign({}, s.ui.tFilter, scope || {})
    var kw = String(f.kw || '').toLowerCase()
    /* ★ 与 小程序 store.filterTodos 同一套三档语义：`open` / `done` 都排除已删除，
     * `deleted` 档**只要**已删除的。它是「还原」的唯一入口 —— 删完默认列表里就看不见了，
     * 而「我的」页的最近删除已按用户口径整块拿掉（小程序也没有），所以这一档必须在。
     * ⚠️ 别把它写成 `aliveTodos(s)` 再在下面过滤：那样 deleted 档恒为空。 */
    var pool = f.status === 'deleted' ? deletedTodos(s) : aliveTodos(s)
    return sortByUpdated(pool.filter(function (t) {
      if (f.status === 'done' && !t.done) return false
      if (f.status === 'open' && t.done) return false
      if (f.projectId && t.projectId !== f.projectId) return false
      if (!inRange(t.updatedAt || t.createdAt, f.range)) return false
      return !kw || String(t.text).toLowerCase().indexOf(kw) >= 0
    }))
  }
  function filterProjects(s) {
    var f = s.ui.pFilter, kw = String(f.kw || '').toLowerCase()
    return sortProjects(s).filter(function (p) {
      if (f.status === 'active' && p.archivedAt) return false
      if (f.status === 'archived' && !p.archivedAt) return false
      if (f.node !== 'all' && p.node !== f.node) return false
      if (f.agentId && p.agentId !== f.agentId) return false
      return !kw || String(p.name).toLowerCase().indexOf(kw) >= 0
    }).concat(f.status === 'all' || f.status === 'archived' ? archivedProjects(s) : [])
  }
  function filterMindmaps(s) {
    var f = s.ui.mFilter, kw = String(f.kw || '').toLowerCase()
    return sortByUpdated(s.mindmaps.filter(function (m) {
      if (f.projectId && m.projectId !== f.projectId) return false
      if (f.format !== 'all' && m.format !== f.format) return false
      if (!inRange(m.updatedAt, f.range)) return false
      return !kw || String(m.name).toLowerCase().indexOf(kw) >= 0
    }))
  }
  function mindmapGateOf(m) {
    if (!m) return 'missing'
    if (m.aiState === 'pending') return 'pending'
    if (m.aiState === 'failed') return 'failed'
    if (!m.projectId || !m.format) return 'incomplete'
    return ''
  }
  var GATE_TIP = {
    pending: '这张脑图还在生成中，稍后再选', failed: '这张脑图生成失败，重试生成后再选',
    incomplete: '这张脑图还没完善（归属项目 / 格式），完善后再选', missing: '这张脑图暂时不能选'
  }
  function cardView(s, x) { return x }

  /* --------------------------------------------------------------- rules --- */
  /* Every rule returns a NEW state (optimistic update). The bridge sends the
   * matching REST call and restores the previous state on failure, mirroring
   * store.js mark()/queue()/restore(). */
  function patchOne(list, id, patch) {
    return list.map(function (x) { return x.id === id ? Object.assign({}, x, patch) : x })
  }
  var rules = {
    addProject: function (s, p) {
      var x = { id: uid('p'), name: p.name, color: p.color || '', node: p.node || C.NODES[0],
        agentId: p.agentId || '', remark: p.remark || '', archivedAt: null,
        createdAt: stamp(), updatedAt: stamp() }
      return Object.assign({}, s, { projects: s.projects.concat([x]) })
    },
    updateProject: function (s, id, patch) {
      var next = Object.assign({}, s, { projects: patchOne(s.projects, id, Object.assign({ updatedAt: stamp() }, patch)) })
      if (patch.agentId !== undefined) {
        next.mindmaps = s.mindmaps.map(function (m) { return m.projectId === id
          ? Object.assign({}, m, { agentId: patch.agentId }) : m })
      }
      return next
    },
    archiveProject: function (s, id, on) {
      return Object.assign({}, s, { projects: patchOne(s.projects, id, { archivedAt: on ? stamp() : null }) })
    },
    addTodo: function (s, t) {
      var x = { id: uid('d'), projectId: t.projectId || '', mindmapId: t.mindmapId || null,
        text: t.text || '', urgency: t.urgency || 'mid', done: false,
        createdAt: stamp(), completedAt: null, updatedAt: stamp(), images: t.images || [],
        flashAt: '', deletedAt: null, deleted: false }
      var a = clone(s.activity), k = dateOf(stamp())
      a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
      a[k].created += 1
      return Object.assign({}, s, { todos: s.todos.concat([x]), activity: a })
    },
    updateTodo: function (s, id, patch) {
      var next = Object.assign({}, patch, { updatedAt: stamp() })
      var t = byId(s.todos, id)
      if (patch.projectId && t && t.mindmapId) {
        var m = byId(s.mindmaps, t.mindmapId)
        if (m && m.projectId !== patch.projectId) next.mindmapId = null
      }
      return Object.assign({}, s, { todos: patchOne(s.todos, id, next) })
    },
    toggleTodo: function (s, id) {
      var t = byId(s.todos, id)
      if (!t || t.deletedAt) return s
      var done = !t.done
      var a = clone(s.activity), k = dateOf(stamp())
      a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
      if (done) a[k].completed += 1
      return Object.assign({}, s, {
        todos: patchOne(s.todos, id, { done: done, completedAt: done ? stamp() : null, updatedAt: stamp() }),
        activity: a
      })
    },
    removeTodo: function (s, id) {
      return Object.assign({}, s, { todos: patchOne(s.todos, id,
        { deletedAt: stamp(), deleted: true, updatedAt: stamp() }) })
    },
    restoreTodo: function (s, id) {
      return Object.assign({}, s, { todos: patchOne(s.todos, id,
        { deletedAt: null, deleted: false, done: false, completedAt: null, updatedAt: stamp() }) })
    },
    addCapsule: function (s, text, opts) {
      var o = opts || {}
      var x = { id: uid('c'), text: text || '', createdAt: stamp(), source: o.source || 'text',
        imageUri: o.imageUri || null, todoId: null, deletedAt: null, consumedAt: null,
        deleted: false, consumed: false }
      var a = clone(s.activity), k = dateOf(stamp())
      a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
      a[k].capsule += 1
      return Object.assign({}, s, { capsules: s.capsules.concat([x]), activity: a })
    },
    updateCapsule: function (s, id, patch) {
      return Object.assign({}, s, { capsules: patchOne(s.capsules, id, patch) })
    },
    removeCapsules: function (s, ids) {
      var set = ids || []
      return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
        return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { deleted: true, deletedAt: stamp() }) : c }) })
    },
    restoreCapsules: function (s, ids) {
      var set = ids || []
      return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
        return set.indexOf(c.id) >= 0 && c.deleted ? Object.assign({}, c, { deleted: false, deletedAt: null }) : c }) })
    },
    consumeCapsules: function (s, ids) {
      var set = ids || []
      return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
        return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { consumed: true, consumedAt: stamp() }) : c }) })
    },
    linkCapsules: function (s, tid, ids) {
      var set = ids || []
      return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
        return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { todoId: tid, consumed: true, consumedAt: c.consumedAt || stamp() }) : c }) })
    },
    unlinkCapsules: function (s, tid, ids) {
      var set = ids || []
      return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
        return set.indexOf(c.id) >= 0 && c.todoId === tid
          ? Object.assign({}, c, { todoId: null, consumed: false, consumedAt: null, createdAt: stamp() }) : c }) })
    },
    addMindmap: function (s, m) {
      var x = { id: uid('m'), projectId: m.projectId, name: m.name, nodes: 1, depth: 1,
        format: m.format || '', agentId: m.agentId || '', aiState: '', flashAt: '', updatedAt: stamp() }
      var tree = {}, rootId = uid('n')
      tree[rootId] = { id: rootId, text: m.name, remark: '', kind: 'root', children: [] }
      var t = clone(s.tree); t[x.id] = tree[rootId]
      return Object.assign({}, s, { mindmaps: s.mindmaps.concat([x]), tree: t })
    },
    removeMindmap: function (s, id) {
      var t = clone(s.tree); delete t[id]
      return Object.assign({}, s, {
        mindmaps: s.mindmaps.filter(function (m) { return m.id !== id }), tree: t,
        todos: s.todos.map(function (x) { return x.mindmapId === id ? Object.assign({}, x, { mindmapId: null }) : x })
      })
    },
    replaceEntity: function (s, kind, id, patch) {
      var key = { project: 'projects', todo: 'todos', mindmap: 'mindmaps', capsule: 'capsules',
        agent: 'agents', token: 'tokenKeys' }[kind]
      if (!key) return s
      return Object.assign({}, s, (function () { var o = {}; o[key] = patchOne(s[key], id, patch); return o })())
    }
  }

  /* ---------------------------------------------------------- demo data --- */
  /* 演示用的热力图基线 —— 与小程序 `utils/mock.js` 的 HEATMAP 同一用意：
   * 骨架是"日常活跃度"的造数，真接口下 `adaptSnapshot()` 换成零基线、由台账叠加真实计数。
   * ⚠️ 只给 demoState 用；`emptyHeat()` 仍是零骨架（真实数据那条路的起点）。
   * 取值刻意铺满 5 档（0 / 1 / 2 / 3 / 4），否则概览的色阶与"选中格括标分色"看不出效果。 */
  function demoHeat() {
    var heat = emptyHeat()
    heat.weeks.forEach(function (w, wi) {
      w.days.forEach(function (d, di) {
        var seed = (wi * 7 + di) % 13
        var n = seed === 0 ? 0 : seed < 4 ? 3 : seed < 7 ? 9 : seed < 10 ? 20 : seed < 12 ? 38 : 62
        d.created = Math.round(n * 0.5)
        d.completed = Math.round(n * 0.3)
        d.capsule = n - d.created - d.completed
      })
    })
    return heat
  }

  function demoState() {
    var now = stamp(), p1 = 'p-demo-1', p2 = 'p-demo-2', m1 = 'm-demo-1'
    var projects = [
      { id: p1, name: '客户交付', color: 'qing', node: '建设期', agentId: 'a-demo-1', remark: '三条业务线并行推进', archivedAt: null, createdAt: now, updatedAt: now },
      { id: p2, name: '个人工位', color: 'zi', node: '构思期', agentId: '', remark: '', archivedAt: null, createdAt: now, updatedAt: now }
    ]
    var todos = [
      { id: 'd-demo-1', projectId: p1, mindmapId: m1, text: '把 Agent-ToDo 的 Capture 做成全局快捷键', urgency: 'urgent', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
      { id: 'd-demo-2', projectId: p1, mindmapId: null, text: '梳理三端信息架构，确认项目节点四期', urgency: 'mid', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
      { id: 'd-demo-3', projectId: p1, mindmapId: null, text: '对齐待办导出 Markdown 的章节顺序', urgency: 'low', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
      { id: 'd-demo-4', projectId: p2, mindmapId: null, text: '确认项目八色与紧急四档的迁移值', urgency: 'hold', done: true, createdAt: now, completedAt: now, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false }
    ]
    var root = { id: 'n-root', text: '客户交付', remark: '', kind: 'root', children: [
      { id: 'n-1', text: '现场部署', remark: '', kind: 'branch', children: [
        { id: 'n-1-1', text: '环境核查', kind: 'leaf', children: [] },
        { id: 'n-1-2', text: '配对联调', kind: 'leaf', children: [] } ] },
      { id: 'n-2', text: '交付验收', remark: '', kind: 'branch', children: [] } ] }
    var tree = {}; tree[m1] = root
    return {
      me: { name: '我的工位', nickname: '我的工位', avatar: '', avatarUri: '' },
      loaded: false, source: 'demo',
      agents: [{ id: 'a-demo-1', name: '主力 Agent', quotaLeft: 8200, monthlyQuota: 10000, quotaResetAt: '08', updatedAt: now }],
      tokenKeys: [{ id: 'k-demo-1', vendor: 'deepseek', balance: 12800, keyMask: 'sk-••••3f2a', hasKey: true, balanceAt: now, lastError: '', updatedAt: now }],
      projects: projects, todos: todos,
      mindmaps: [{ id: m1, projectId: p1, name: '交付流程', nodes: 5, depth: 3, format: 'logic', agentId: 'a-demo-1', aiState: '', flashAt: '', updatedAt: now }],
      capsules: [
        { id: 'c-demo-1', text: '入口应该比「打开应用」更近：在会话里按 Alt+Space 就能记。', createdAt: now, source: 'text', imageUri: null, todoId: null, deletedAt: null, consumedAt: null, deleted: false, consumed: false },
        { id: 'c-demo-2', text: '脑图贴着任务；任务是主语，脑图是谓语。', createdAt: now, source: 'voice', imageUri: null, todoId: null, deletedAt: null, consumedAt: null, deleted: false, consumed: false },
        { id: 'c-demo-3', text: '导出要能直接复制，而不是复制后自己找地方粘贴。', createdAt: now, source: 'text', imageUri: null, todoId: 'd-demo-1', deletedAt: null, consumedAt: now, deleted: false, consumed: true }
      ],
      tree: tree, hist: {}, activity: {}, heat: demoHeat()
    }
  }

  AT.core = {
    stamp: stamp, dateOf: dateOf, atMin: atMin, uid: uid, clone: clone, byId: byId,
    emptyHeat: emptyHeat, initialState: initialState, adaptSnapshot: adaptSnapshot,
    demoState: demoState,
    aliveTodos: aliveTodos, deletedTodos: deletedTodos, capsules: capsules,
    deletedCapsules: deletedCapsules, capsulesOfTodo: capsulesOfTodo,
    activeProjects: activeProjects, archivedProjects: archivedProjects,
    todosOfProject: todosOfProject, mindmapsOfProject: mindmapsOfProject,
    projectSummary: projectSummary, scoreOf: scoreOf, sortProjects: sortProjects,
    sortTodos: sortTodos, sortByUpdated: sortByUpdated,
    statOfProject: statOfProject, projectCardView: projectCardView,
    overviewProjectCards: overviewProjectCards, agentCardViews: agentCardViews,
    resetDayOf: resetDayOf, daysUntilReset: daysUntilReset, ringOf: ringOf,
    filterTodos: filterTodos, filterProjects: filterProjects, filterMindmaps: filterMindmaps,
    mindmapGateOf: mindmapGateOf, GATE_TIP: GATE_TIP, cardView: cardView,
    rules: rules
  }
})(AT)
