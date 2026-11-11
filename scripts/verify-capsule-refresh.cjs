/**
 * verify-capsule-refresh.cjs — 悬浮 logo → 闪念胶囊列表的**行为级**判据（轮次 20）。
 *
 * verify-standard.cjs 的 React stub 不执行 useEffect，只能静态锁「调用点在哪」；
 * 这里按 deps 真跑 effect，并模拟一次真实的 pointerdown/up 点击悬浮键，验的是：
 *   ① 未登录打开 ⇒ 不发 /sync，演示数据不被服务端快照覆盖
 *   ② 已登录每次打开 ⇒ 恰好一次 /sync，且服务端新胶囊真的进到列表里
 *   ③ store 重渲染 / 起录 / 切编辑 ⇒ open 不变，不许重复发
 *   ④ 关掉再点、键盘 Enter 打开 ⇒ 各自再发一次
 *
 * 网络与写库通道全部换成 stub：只数「有没有被调用」，绝不真发请求。
 * Run: node scripts/verify-capsule-refresh.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')

const root = path.join(__dirname, '..')
let registered = []
const React = {
  createElement(type, props) {
    return { type, props: props || {}, children: Array.prototype.slice.call(arguments, 2) }
  },
  useState(v) { return [typeof v === 'function' ? v() : v, function () {}] },
  useEffect(fn, deps) { registered.push({ fn: fn, deps: deps }) },
  useRef(v) { return { current: v } },
  useSyncExternalStore(_s, get) { return get() },
  useMemo(fn) { return fn() },
  useCallback(fn) { return fn },
  /* 故意不提供 useLayoutEffect：80-capsule.js 里 useIso 会回退到 useEffect，
   * 这样所有 effect 都进 registered，deps 判定才有意义。 */
}

function loadAT() {
  let loaded = null
  const makeEl = () => ({
    style: {}, setAttribute() {}, remove() {}, removeChild() {}, appendChild() {},
    select() {}, addEventListener() {}, getContext() { return null },
  })
  const document = {
    createElement: makeEl, head: { appendChild() {} }, body: { appendChild() {} },
    execCommand() { return true }, querySelectorAll() { return [] }, querySelector() { return null },
    addEventListener() {}, removeEventListener() {},
  }
  const window = {
    __ModuleLoader__: { load(def) { loaded = def } },
    __AGENT_TODO_TEST__: true,
    addEventListener() {}, removeEventListener() {},
    setTimeout() { return 1 }, clearTimeout() {}, setInterval() { return 1 }, clearInterval() {},
    btoa: (v) => Buffer.from(String(v), 'binary').toString('base64'),
    atob: (v) => Buffer.from(String(v), 'base64').toString('binary'),
  }
  const sandbox = {
    window, document, console,
    navigator: { clipboard: null, mediaDevices: null },
    fetch: () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ code: 0, data: {} }) }),
    FormData: function () { this.append = function () {} },
    Blob: function (parts) { this.size = String((parts || [])[0] || '').length },
    MediaRecorder: function () {},
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    setInterval: window.setInterval, clearInterval: window.clearInterval,
    btoa: window.btoa, atob: window.atob,
  }
  vm.createContext(sandbox)
  vm.runInContext(fs.readFileSync(path.join(root, 'client.js'), 'utf8'), sandbox,
    { filename: 'client.js' })
  assert.ok(loaded, 'client.js must register through __ModuleLoader__')
  loaded.factory(() => React)
  const AT = window.__AGENT_TODO_CORE__
  assert.ok(AT && AT.bridge && AT.capsule && AT.core, 'AT namespace must be exposed')
  return AT
}

const AT = loadAT()
const B = AT.bridge
const C = AT.capsule
const scenarios = []

/* 按 deps 真执行 effect：只有 deps 变了才跑，模拟 React 的「一次展开恰好一次」，
 * 顺带照出「每次渲染都发请求」的假绿。 */
const prevDeps = {}
function renderOnce(name, Comp) {
  registered = []
  const tree = Comp()
  const list = registered.slice()
  const before = prevDeps[name]
  list.forEach(function (e, i) {
    const old = before && before[i]
    const changed = !before || !e.deps || !old || e.deps.length !== old.length ||
      e.deps.some(function (d, j) { return d !== old[j] })
    if (changed) e.fn()
  })
  prevDeps[name] = list.map(function (e) { return e.deps })
  return tree
}

function nodes(tree) {
  const out = []
  function visit(n) {
    if (Array.isArray(n)) { n.forEach(visit); return }
    if (!n || typeof n !== 'object') return
    if (n.type !== undefined && n.props && Array.isArray(n.children)) out.push(n)
    ;(n.children || []).forEach(visit)
  }
  visit(tree)
  return out
}
function texts(n) {
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(texts).join('')
  if (n && n.children) return n.children.map(texts).join('')
  return ''
}
const byClass = (tree, cls) => nodes(tree).filter(function (n) {
  return String(n.props.className || '').split(/\s+/).indexOf(cls) >= 0
})
const titleText = (tree) => {
  const t = byClass(tree, 'at-cx-title')[0]
  assert.ok(t, 'the capsule drawer title must render')
  return texts(t)
}

/* 模拟一次真实的悬浮键点击：必须先 pointerdown 写 dragRef，
 * pointerup 才会把它认作「点了一下」而不是拖动。 */
function clickFab(tree, fromKeyboard) {
  const fab = byClass(tree, 'at-cx-fab')[0]
  assert.ok(fab, 'the floating logo button must render')
  if (fromKeyboard) {
    fab.props.onKeyDown({ key: 'Enter', preventDefault() {} })
    return
  }
  const ev = {
    button: 0, pointerType: 'mouse', pointerId: 7, clientX: 120, clientY: 120,
    currentTarget: { setPointerCapture() {}, releasePointerCapture() {} },
    preventDefault() {},
  }
  fab.props.onPointerDown(ev)
  fab.props.onPointerUp(ev)
}

async function main() {
  let syncCalls = 0
  const ORIG = { sync: B.sync }
  /* 假的服务端快照：两条在收件箱、一条已删除。mock 里真的走一遍
   * adaptSnapshot → applySnapshot，才验得到「列表内容变了」而不只是「发过请求」。 */
  const serverCapsules = [
    { id: 's1', text: '刚在小程序记的一条', createdAt: '2026-11-11T07:00:00Z' },
    { id: 's2', text: '另一台设备记的一条', createdAt: '2026-11-11T07:01:00Z' },
    { id: 's3', text: '已删除的一条', createdAt: '2026-11-11T07:02:00Z',
      deletedAt: '2026-11-11T07:03:00Z' }
  ]
  B.sync = function (showToast) {
    syncCalls += 1
    assert.equal(showToast, false, 'a quiet refresh, never a toast')
    B.applySnapshot(AT.core.adaptSnapshot({ capsules: serverCapsules }))
    return Promise.resolve(true)
  }

  try {
    /* ① 未登录：点击打开，零请求，演示数据原样 -------------------------------- */
    B.ui({ connected: false, capsule: null, syncing: false })
    let tree = renderOnce('capsule', C.FloatingCapsule)
    clickFab(tree)
    assert.equal(B.get().ui.capsule.open, true, 'clicking the logo opens the capsule drawer')
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 0, 'a guest must never hit /sync')
    const demoCount = AT.core.capsules(B.get()).length
    assert.equal(titleText(tree), '闪念胶囊-' + demoCount,
      'guest keeps the demo inbox, not a server snapshot')
    scenarios.push('guest: logo opens the list, zero /sync, demo inbox untouched')

    /* ② 已登录首次打开：恰好一次，且列表真的换成了服务端数据 ------------------- */
    B.ui({ connected: true, capsule: null })
    tree = renderOnce('capsule', C.FloatingCapsule)
    clickFab(tree)
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 1, 'first logged-in open fires exactly one /sync')
    assert.equal(titleText(tree), '闪念胶囊-2',
      'the refreshed snapshot really replaces the inbox (deleted one filtered out)')
    scenarios.push('logged-in: one /sync on open, new server capsules show up, deleted one filtered')

    /* ③ store 重渲染 / 同步态切换：open 不变 ⇒ 不重复 --------------------------- */
    B.ui({ syncing: true })
    tree = renderOnce('capsule', C.FloatingCapsule)
    B.ui({ syncing: false })
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 1, 'a store-driven re-render must not re-sync')

    /* ④ 起录 / 切编辑都不改 open ⇒ 不重复 -------------------------------------- */
    B.ui({ capsule: Object.assign({}, B.get().ui.capsule, { phase: 'rec' }) })
    tree = renderOnce('capsule', C.FloatingCapsule)
    B.ui({ capsule: Object.assign({}, B.get().ui.capsule, { phase: '', editId: 's1' }) })
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 1, 'recording / editing must not re-sync')
    scenarios.push('store re-render + recording + editing: no extra /sync')

    /* ⑤ 关掉再点一次 ⇒ 第二次 ------------------------------------------------ */
    C.closeCapsule()
    tree = renderOnce('capsule', C.FloatingCapsule)
    clickFab(tree)
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 2, 'closing and reopening fires a second /sync')
    scenarios.push('close + reopen: a second /sync')

    /* ⑥ 键盘 Enter 打开也走同一条链路 ----------------------------------------- */
    C.closeCapsule()
    tree = renderOnce('capsule', C.FloatingCapsule)
    clickFab(tree, true)
    tree = renderOnce('capsule', C.FloatingCapsule)
    assert.equal(syncCalls, 3, 'Enter on the FAB opens the list and refreshes too')
    scenarios.push('keyboard Enter: same refresh path')
  } finally {
    B.sync = ORIG.sync
    B.ui({ capsule: null, connected: false, syncing: false })
  }

  console.log(JSON.stringify({ ok: true, scenarios }, null, 2))
}

main().catch(function (e) {
  console.error(JSON.stringify({ ok: false, error: e && e.message, stack: e && e.stack }, null, 2))
  process.exitCode = 1
})
