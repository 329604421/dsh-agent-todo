/**
 * verify-global-overlays.cjs — 输入框侧两个全局浮层的**行为级**判据（轮次 18）。
 *
 * verify-standard.cjs 的 React stub 不执行 useEffect，只能静态锁「调用点在哪」；
 * 这里让 effect 真的按 deps 变化跑一遍，验的是：
 *   ① 未登录打开导出器 ⇒ 有演示数据提示、且不发 /sync
 *   ② 已登录每次展开 ⇒ 恰好一次 /sync（关掉再开再来一次），open 不变不许重复发
 *   ③ 未登录闪念弹窗 ⇒ 有提示、三颗保存键全灰、Ctrl+Enter 也绕不过 save() 的门
 *   ④ 已登录闪念弹窗 ⇒ 无提示、「存为闪念」可点
 *   ⑤ syncing 时底栏给出「正在拉取」反馈
 *
 * Run: node scripts/verify-global-overlays.cjs
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
  assert.ok(AT && AT.overlays && AT.bridge, 'AT namespace must be exposed')
  return AT
}

const AT = loadAT()
const B = AT.bridge
const O = AT.overlays
const scenarios = []

/* 按组件名记住上一轮的 deps：只有 deps 真的变了才执行 effect，
 * 模拟 React 的「一次展开恰好一次」，顺带照出「每次渲染都发请求」的假绿。 */
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
const buttonByText = (tree, word) => nodes(tree).filter(function (n) {
  return n.type === 'button' && texts(n).indexOf(word) >= 0
})[0]
const picker = () => renderOnce('picker', O.ComposerPicker)
const capture = () => renderOnce('capture', O.QuickCapture)

async function main() {
  /* 替换掉真实的网络与写库通道：判据只数「有没有被调用」，绝不真发请求。 */
  let syncCalls = 0
  let capsuleCalls = 0
  const toasts = []
  const ORIG = { sync: B.sync, toast: B.toast, addCapsule: B.actions.addCapsule }
  B.sync = function (showToast) { syncCalls += 1; assert.equal(showToast, false); return Promise.resolve(true) }
  B.toast = function (message) { toasts.push(String(message || '')) }
  B.actions.addCapsule = function () { capsuleCalls += 1; return Promise.resolve({ ok: true }) }

  try {
    /* ① 未登录展开导出器：提示在、接口不发 --------------------------------- */
    B.ui({ connected: false, composerOpen: false, syncing: false })
    picker()
    B.ui({ composerOpen: true })
    let tree = picker()
    assert.equal(byClass(tree, 'at-gl-demo').length, 1, 'guest picker must show the demo banner')
    assert.equal(byClass(tree, 'at-pick-demo').length, 1, 'banner uses the picker gutter variant')
    assert.ok(texts(tree).indexOf('演示数据') >= 0, 'the banner must say the data is demo data')
    assert.equal(syncCalls, 0, 'a guest must never hit /sync')
    scenarios.push('guest picker: demo banner shown, zero /sync calls')

    /* ② 已登录：每次展开恰好一次；open 不变不重复发 -------------------------- */
    B.ui({ connected: true, composerOpen: false })
    picker()
    B.ui({ composerOpen: true })
    tree = picker()
    assert.equal(syncCalls, 1, 'first logged-in open fires exactly one /sync')
    assert.equal(byClass(tree, 'at-gl-demo').length, 0, 'no demo banner once logged in')
    picker()
    assert.equal(syncCalls, 1, 'a store-driven re-render must not re-sync')
    B.ui({ composerOpen: false })
    picker()
    B.ui({ composerOpen: true })
    tree = picker()
    assert.equal(syncCalls, 2, 'closing and reopening fires a second /sync')
    scenarios.push('logged-in picker: one /sync per open, none on re-render, banner gone')

    /* ⑤ 同步中反馈 ------------------------------------------------------------ */
    B.ui({ syncing: true })
    tree = picker()
    assert.equal(byClass(tree, 'at-pick-syncing').length, 1, 'refresh is visible in the footer')
    B.ui({ syncing: false })
    scenarios.push('footer shows the refresh while syncing')

    /* ③ 未登录闪念弹窗：提示 + 三颗键全灰 + 键盘也绕不过 ---------------------- */
    B.ui({ connected: false, captureOpen: true, captureSeed: '', captureCapsuleOnly: true })
    tree = capture()
    assert.equal(byClass(tree, 'at-gl-demo').length, 1, 'guest capture must show the demo banner')
    assert.ok(texts(tree).indexOf('登录后才能保存闪念') >= 0, 'say saving needs a login')
    const flash = buttonByText(tree, '存为闪念')
    assert.ok(flash, 'capsule-only mode renders the 存为闪念 key')
    assert.equal(flash.props.disabled, true, 'the yellow save key is greyed out for a guest')
    const area = byClass(tree, 'at-gl-input')[0]
    area.props.onKeyDown({ key: 'Enter', ctrlKey: true, keyCode: 13, isComposing: false,
      preventDefault() {} })
    assert.equal(capsuleCalls, 0, 'Ctrl+Enter must not write demo data into memory')
    assert.ok(toasts.some(function (m) { return m.indexOf('请先登录后再保存') >= 0 }),
      'the keyboard path must hit the same Chinese gate')
    scenarios.push('guest capture: banner + save key disabled + Ctrl+Enter blocked')

    /* 普通模式的另外两颗键也必须一起灰（不能换个入口就能存） ------------------ */
    B.ui({ captureCapsuleOnly: false })
    tree = capture()
    assert.equal(buttonByText(tree, '存为胶囊').props.disabled, true)
    assert.equal(buttonByText(tree, '存为待办').props.disabled, true)
    scenarios.push('guest capture: 存为胶囊 / 存为待办 are gated too')

    /* ④ 已登录闪念弹窗：提示消失、主键可点 ----------------------------------- */
    B.ui({ connected: true, captureCapsuleOnly: true })
    tree = capture()
    assert.equal(byClass(tree, 'at-gl-demo').length, 0, 'no banner once logged in')
    assert.equal(buttonByText(tree, '存为闪念').props.disabled, false,
      'the save key comes back after login')
    scenarios.push('logged-in capture: banner gone, 存为闪念 enabled')
  } finally {
    B.sync = ORIG.sync
    B.toast = ORIG.toast
    B.actions.addCapsule = ORIG.addCapsule
    B.ui({ composerOpen: false, captureOpen: false, connected: false, syncing: false })
  }

  console.log(JSON.stringify({ ok: true, scenarios }, null, 2))
}

main().catch(function (e) {
  console.error(JSON.stringify({ ok: false, error: e && e.message, stack: e && e.stack }, null, 2))
  process.exitCode = 1
})
