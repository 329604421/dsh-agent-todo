/* Regression checks for the "我的" page (PC / 横屏 alignment with mod-mine).
 *
 * Why a separate file: verify-desktop.cjs is CRLF and is being edited by the
 * overview-alignment work at the same time. Keeping these checks here means
 * neither side overwrites the other, and adding LF lines to that file would
 * silently mix line endings. No network, no GUI, no production writes.
 *
 * Run: node scripts/verify-mine.cjs  (also wired into npm run check)
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { harness, collectNodes, collectStrings } = require('./verify-package.cjs')
const root = path.join(__dirname, '..')
const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8')
const passed = []

function texts(tree) { return collectStrings(tree) }
function classes(tree) {
  return collectNodes(tree).map(n => String((n.props && n.props.className) || ''))
}
function handler(tree, label) {
  const n = collectNodes(tree).find(x => x.props && typeof x.props.onClick === 'function' &&
    texts(x.children).indexOf(label) >= 0)
  assert.ok(n, 'action missing: ' + label)
  return n.props.onClick
}

async function main() {
  const { AT, B, Core } = harness(source)
  const mine = AT.views.MineBody(B.get())
  const nodes = collectNodes(mine)
  const cn = classes(mine)
  const tx = texts(mine)

  /* ---- ① 区块骨架：严格＝小程序 PC 的四块，插件特有页尾已整块拿掉 ------ */
  const secs = nodes.filter(n => n.type === AT.ui.Section)
  /* U.Section 是组件节点，离线树不会展开它的内部；右端按钮挂在 props.extra 上。
   * 把它们显式挂进一棵伪树，否则「新建 Agent / 添加 API」的接线判据会假红。 */
  const withExtras = { children: [mine].concat(secs.map(n => n.props.extra).filter(Boolean)) }
  assert.deepEqual(secs.map(n => [n.props.title, n.props.icon]), [
    ['个人资料', 'mine-b'],
    ['Agent', 'robot-b'],
    ['Token API', 'key-b'],
    ['应用提示', 'info-b']
  ], 'exactly the four PC sections from mod-mine, no plugin-only footer')
  assert.equal(mine.props.className, 'at-mi')
  assert.ok(!cn.some(c => /(^|\s)at-block(\s|$)/.test(c)),
    'the old five-block at-detail-col layout must be gone')
  /* ★ 2026-11-07 用户口径：连接设置 / 最近删除是小程序端没有的功能，整体拿掉。
   * 反向断言，防"顺手加回来"。⚠️ texts() 返回的是字符串**数组**，`indexOf` 是精确匹配
   * —— 只要有人把「最近删除」拼进一句更长的文案（如 '最近删除 · 公众号'）就会漏判，
   * 所以这里必须逐个 substring。样式规则若留着就是死代码，一并查。 */
  assert.ok(!tx.some(t => /连接与回收站|最近删除|数据源|断开连接|连接账号/.test(t)),
    'plugin-only connection / recycle-bin copy must be gone for good')
  assert.ok(!cn.some(c => /at-mi-(sub|sub-t|kv|op|note|del|endgap)\b/.test(c)),
    'dead footer CSS class names still in the tree')
  assert.ok(!/\.at-mi-(sub|kv|op|note|del|endgap)[\s{:]/.test(AT.views.MINE_STYLE),
    'dead footer CSS rules still in MINE_STYLE')
  /* 60-views-a.js 用整体赋值给 AT.views.STYLE ⇒ 本模块只能追加。
   * 断言顺序：概览样式在前、我的页样式在后，防有人改回覆盖式赋值。 */
  const style = AT.views.STYLE
  assert.ok(style.indexOf('.at-ov-heat{') >= 0, 'overview stylesheet was overwritten')
  assert.ok(style.indexOf('.at-mi-grid{') > style.indexOf('.at-ov-heat{'),
    'mine styles must be appended after the overview stylesheet')
  assert.ok(/background:var\(--at-qr\)/.test(AT.views.MINE_STYLE),
    'QR tile must stay white across themes (--at-qr), never --at-card')
  /* 40-ui.js 的复位是 .at-root button{color:inherit}（0,1,1）；主面板 styleTag 不注入
   * 08-style 的零特异度 BASE_CSS ⇒ 单类着色会被压成「深字压深底」，中文标签看不见。
   * 三条 button 规则必须带 .at-mi 作用域（0,2,0）才能压过它。 */
  const ms = AT.views.MINE_STYLE
  assert.ok(/\.at-mi \.at-mi-sec-btn\{[^}]*color:var\(--at-on-solid\)/.test(ms),
    'dark section buttons need a two-class scope, or their labels inherit dark ink')
  assert.ok(/\.at-mi \.at-mi-tb\{/.test(ms) && /\.at-mi \.at-mi-chip\{/.test(ms),
    'card buttons / project chips need the same two-class scope')
  passed.push('mine page: exactly 4 PC sections, plugin footer removed (tree + CSS), overview CSS preserved')

  /* ---- ② Agent 卡：与概览同一份装配（圆环 / 每月套餐 / 承担项目）------- */
  assert.equal(cn.filter(c => c === 'at-ov-ag-body').length, 1,
    'agent card must reuse the overview card body, not a second copy')
  const ring = nodes.find(n => n.props.className === 'at-ov-ag-ring')
  assert.ok(ring, 'reset ring is missing')
  const cards = Core.agentCardViews(B.get())
  assert.equal(ring.props.style['--ring-deg'], cards[0].ringDeg + 'deg',
    'ring angle must come from Core.agentCardViews, the shared assembly')
  assert.ok(tx.indexOf('距离重置') >= 0 && tx.indexOf('每月套餐') >= 0 && tx.indexOf('承担项目') >= 0)
  /* 157 轮起撤下「当前剩余 / 更新于」：手填余额会过期误导，不许抄回来 */
  assert.ok(!tx.some(t => /剩余|quotaLeft|每月 \d+ 日重置/.test(t)),
    'retired remaining-quota copy must not come back')
  assert.ok(tx.indexOf('客户交付') >= 0, 'associated-project chips are missing')
  assert.ok(cn.some(c => c === 'at-mi-chip' || c.indexOf('at-mi-chip ') === 0),
    'project chips need their own CSS class, not just a class name in the template')
  passed.push('mine agents: shared PC ring card + project chips, no retired quota copy')

  /* ---- ③ Token API：余额主角 / 显示名 / 四种状态 / 时间戳 / 错误行 ----- */
  const withKeys = Object.assign({}, B.get(), { tokenKeys: [
    { id: 'k1', vendor: 'deepseek', balance: 800, keyMask: 'sk-****3f2a', hasKey: true,
      balanceAt: '2026-11-07 10:30:00', lastError: '' },
    { id: 'k2', vendor: 'deepseek', balance: 0, keyMask: '', hasKey: false,
      balanceAt: '', lastError: '' },
    { id: 'k3', vendor: 'deepseek', balance: 0, keyMask: 'sk-****aa11', hasKey: true,
      balanceAt: '', lastError: '接口超时' }
  ] })
  const tkTree = AT.views.MineBody(withKeys)
  const tk = texts(tkTree)
  const tkNodes = collectNodes(tkTree)
  assert.ok(tk.indexOf('DeepSeek') >= 0 && tk.indexOf('deepseek') < 0,
    'vendor display name, not the internal code')
  assert.ok(tk.indexOf('¥ 8.00') >= 0, 'balance must be the hero number')
  assert.ok(tk.indexOf('余额偏低') >= 0, 'below ¥10 must be flagged')
  assert.ok(tk.indexOf('待配置') >= 0 && tk.indexOf('待查询') >= 0,
    'no-key and not-yet-queried must read differently')
  assert.ok(tk.indexOf('更新于 2026-11-07 10:30') >= 0, 'balanceAt, not updatedAt')
  assert.ok(tk.indexOf('接口超时') >= 0, 'per-key error line is missing')
  assert.equal(tkNodes.filter(n => String(n.props.className || '').indexOf('at-mi-bal-warn') >= 0).length, 1,
    'only 待配置 gets the warning tone')
  assert.ok(tkNodes.some(n => n.props.className === 'at-mi-bal-v atx-num'),
    'a real balance must use the 23px hero class, not the pending one')
  passed.push('mine tokens: balance hero, display name, low balance, two pending states, timestamp, error line')

  /* ---- ④ 应用提示 / 动作接线 ------------------------------------------ */
  const tips = AT.views.TIP_ROWS
  assert.equal(tips.length, 5)
  assert.ok(tips.every(r => r[0].length === 2), 'all five labels must be exactly 2 chars')
  assert.ok(tips.every(r => !/[。]$/.test(r[1])), 'list rows never end with a full stop')
  assert.ok(tips.some(r => r[1].indexOf('Agent-ToDo') >= 0), 'product name is Agent-ToDo')
  assert.equal(nodes.filter(n => n.props.className === 'at-mi-tip-row').length, 5)
  const qr = nodes.find(n => n.props.className === 'at-mi-qr-img')
  assert.ok(qr && qr.props.src === '/agent-todo/assets/qr-official.jpg')
  assert.ok(fs.existsSync(path.join(root, 'assets', 'qr-official.jpg')), 'QR asset is missing')
  ;['新建 Agent', '添加 API', '编辑'].forEach(function (label) {
    assert.ok(typeof handler(withExtras, label) === 'function', 'not wired: ' + label)
  })
  /* 行为级：区块头的「新建 Agent」真的打开 agent 表单，不是摆设 */
  handler(withExtras, '新建 Agent')()
  assert.equal(B.get().ui.form.mode, 'agent')
  passed.push('mine tips: five 2-char rows, QR asset present, section actions wired to real handlers')

  /* ---- ⑤ 空态：两处都必须用小程序 .blank-box 两级骨架 ------------------ */
  const empty = Object.assign({}, B.get(), { agents: [], tokenKeys: [], todos: [] })
  const emptyTree = AT.views.MineBody(empty)
  const emptyTx = texts(emptyTree)
  assert.equal(collectNodes(emptyTree).filter(n => n.props.className === 'at-ov-blank').length, 2)
  assert.ok(emptyTx.indexOf('还没有 agent 档案。') >= 0)
  assert.ok(emptyTx.indexOf('还没有添加任何模型厂家 key。') >= 0)
  passed.push('mine empty states: two PC blank-boxes, nothing else on the page')

  /* ---- ⑥ 页底 / 卡面两层：首页级单栏不许"一片白" ----------------------- */
  const ps = AT.panes.STYLE
  function lit(name, table) {
    const m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
    return m ? m[1] : ''
  }
  const pageL = lit('at-surface', AT.ui.LIGHT), cardL = lit('at-card', AT.ui.LIGHT)
  const pageD = lit('at-surface', AT.ui.DARK), cardD = lit('at-card', AT.ui.DARK)
  assert.ok(pageL && cardL && pageD && cardD, 'palette lookup failed (40-ui LIGHT/DARK changed shape)')
  assert.notEqual(pageL, cardL, 'light: page and card must not share one value, or the page reads flat')
  assert.notEqual(pageD, cardD, 'dark: page and card must not share one value')
  assert.ok(ps.indexOf('.at-pane-single.is-home{background:' + pageL +
    ';--at-card:' + cardL + ';--at-surface:' + pageL + '}') >= 0,
    'home panes must paint the page surface and pin the card back to the registered white')
  assert.ok(ps.indexOf('.at-root[data-dark="true"] .at-pane-single.is-home{background:' + pageD +
    ';--at-card:' + cardD + ';--at-surface:' + pageD + '}') >= 0,
    'the dark branch needs its own rule (data-dark lives on .at-root)')
  /* DOM 级：两页都得真吃到 is-home —— 规则在、类名没挂，页面上还是全白。
   * 注意离线 h() 不会展开函数组件，所以先看 render 的 home 入参，再单独调 Single 看类名。 */
  ;['overview', 'mine'].forEach(function (v) {
    const st = Object.assign({}, B.get(), { ui: Object.assign({}, B.get().ui, { active: v }) })
    assert.equal(AT.panes.render(st).props.home, true, v + ' page must pass home')
  })
  const shellNode = AT.panes.Single({ s: B.get(), home: true, title: '我的', actions: [], body: null })
  assert.ok(/\bat-pane-single\b/.test(shellNode.props.className) &&
    /\bis-home\b/.test(shellNode.props.className), 'is-home must land on the single pane element')
  assert.ok(!/\bis-home\b/.test(AT.panes.Single({ s: B.get(), title: '项目', body: null }).props.className),
    'is-home must stay off the three-column modules')
  passed.push('home panes: page surface + registered card colour, light and dark, on both overview and mine')

  /* ---- ⑦ 回收站改由待办列表的「已删除」档承担（小程序的同名入口）------- */
  const withGone = Object.assign({}, B.get(), {
    todos: B.get().todos.concat([{ id: 'gone-1', text: '已删的那条', done: false, urgency: 'p2',
      projectId: '', deletedAt: '2026-11-06 10:00:00', updatedAt: '2026-11-06 10:00:00',
      createdAt: '2026-11-06 10:00:00' }]),
    ui: Object.assign({}, B.get().ui, {
      tFilter: Object.assign({}, B.get().ui.tFilter, { status: 'deleted' })
    })
  })
  const gone = Core.filterTodos(withGone)
  assert.equal(gone.length, 1, 'the deleted tab must list deleted todos only')
  assert.equal(gone[0].id, 'gone-1')
  assert.ok(Core.filterTodos(Object.assign({}, withGone, {
    ui: Object.assign({}, withGone.ui, {
      tFilter: Object.assign({}, withGone.ui.tFilter, { status: 'all' })
    })
  })).every(t => !t.deletedAt), 'the "all" tab must still hide deleted todos')
  const ftx = texts(AT.panes.FilterPanel({ s: B.get(), kind: 'todo' }))
  assert.ok(ftx.indexOf('已删除') >= 0,
    'without this tab there is no way left to restore a deleted todo')
  /* 四档仍然只有**一个**真源 `TODO_STATUS`。v1.12 起列表头那排页签撤掉（小程序没有），
   * 状态全部走「筛选 → 待办状态」；数组本身不许出现第二份 —— 各写一份时少一个 key，
   * 就会出现「选了已删除、面板里没有任何一段亮着」的假空态（而且一点就跳走）。
   * ⚠️ 只锁「这一组读的是共享数组」＋「数组只定义一次」，**不锁渲染函数名、不锁调用形状**：
   *    轮次 10 把三组筛选项搬进 `FILTER_GROUPS` 表（与小程序 `tf.groups` 同构），
   *    组里改写成 `options: function () { return TODO_STATUS }`，
   *    原先写死 `group('待办状态', 'status', TODO_STATUS` 的断言当场变红，
   *    而它想守的东西（没有第二份四档数组）一条都没变。 */
  assert.ok(/return TODO_STATUS/.test(source),
    'the status group must read the shared TODO_STATUS array, not a second copy')
  assert.equal((source.match(/var TODO_STATUS/g) || []).length, 1,
    'TODO_STATUS must be declared exactly once')
  assert.ok(!/className: 'at-list-tabs'/.test(source),
    'list header tabs removed: the four statuses live in the filter drawer only')
  passed.push('recycle bin moved to the todo list: deleted tab filters right, all tab stays clean')

  console.log(JSON.stringify({ ok: true, checks: passed.length, passed }, null, 2))
}
main().catch(err => { console.error(err); process.exitCode = 1 })
