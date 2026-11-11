/**
 * verify-export-enhance.cjs — 导出抽屉「增强」链路的**异步端到端**判据。
 *
 * verify-standard.cjs 的 check() 是同步的，只能验到「点击即发请求＋进 loading」；
 * 响应回来之后的 done / error / 复制、以及关掉抽屉后的迟到响应，必须真等一轮
 * microtask 才验得到。本脚本把这条链整段跑一遍：
 *   ① happy：点击 → loading → done → 复制的是增强结果（不是原文）
 *   ② error：失败说清成因，重试真的**再发一次**请求且沿用同一份输入
 *   ③ 竞态：关掉 L2 后旧响应落地也不许把状态写回来
 *   ④ 未登录：直接给出中文成因，不静默
 *
 * Run: node scripts/verify-export-enhance.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')

const root = path.join(__dirname, '..')

function loadAT() {
  let loaded = null
  const React = {
    createElement(type, props) {
      return { type, props: props || {}, children: Array.prototype.slice.call(arguments, 2) }
    },
    useState(v) { return [typeof v === 'function' ? v() : v, function () {}] },
    useEffect() {}, useRef(v) { return { current: v } },
    useSyncExternalStore(_s, get) { return get() },
    useMemo(fn) { return fn() }, useCallback(fn) { return fn },
  }
  const makeEl = () => ({
    style: {}, setAttribute() {}, remove() {}, removeChild() {}, appendChild() {},
    select() {}, addEventListener() {}, getContext() { return null },
  })
  const document = {
    createElement: makeEl, head: { appendChild() {} }, body: { appendChild() {} },
    execCommand() { return true }, querySelectorAll() { return [] },
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
  vm.runInContext(fs.readFileSync(path.join(root, 'client.js'), 'utf8'), sandbox, { filename: 'client.js' })
  assert.ok(loaded, 'client.js must register through __ModuleLoader__')
  loaded.factory(() => React)
  const AT = window.__AGENT_TODO_CORE__
  assert.ok(AT && AT.drawers && AT.bridge, 'AT namespace must be exposed')
  return AT
}

const AT = loadAT()
const B = AT.bridge
const ORIG = { enhance: B.actions.enhance, copyText: B.copyText, toast: B.toast }
const toasts = []

function nodes(root) {
  const out = []
  function visit(n) {
    if (Array.isArray(n)) { n.forEach(visit); return }
    if (!n || typeof n !== 'object') return
    if (n.type !== undefined && n.props && Array.isArray(n.children)) out.push(n)
    ;(n.children || []).forEach(visit)
  }
  visit(root)
  return out
}
const byClass = (tree, cls) => nodes(tree).filter((n) =>
  String(n.props.className || '').split(/\s+/).indexOf(cls) >= 0)
const texts = (n) => {
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(texts).join('')
  if (n && n.children) return n.children.map(texts).join('')
  return ''
}
const tick = () => new Promise((resolve) => setImmediate(resolve))

function setForm(patch) {
  const s = B.get()
  const todo = (s.todos || [])[0]
  const f = Object.assign({ mode: 'export', id: todo ? todo.id : '', offset: 0,
    scope: {}, preset: {}, draft: null, parent: null }, patch || {})
  B.ui({ form: f })
}
const render = () => AT.drawers.FormDrawer({ s: B.get() })
const clickAlt = () => byClass(render(), 'at-sd-alt')[0].props.onClick()
const clickCopy = async () => await byClass(render(), 'at-sd-submit')[0].props.onClick()
const clickRetry = () => byClass(render(), 'at-enh-retry')[0].props.onClick()
const form = () => B.get().ui.form

async function main() {
  const scenarios = []
  B.toast = function (message) { toasts.push(String(message || '')) }

  /* ① happy path ---------------------------------------------------------- */
  const seen = []
  B.actions.enhance = function (text) {
    seen.push(text)
    return Promise.resolve({ text: 'ENHANCED-RESULT', notice: '图片已移到末尾' })
  }
  const copies = []
  B.copyText = function (text) { copies.push(text); return Promise.resolve(true) }
  setForm({})
  const preview = AT.text.copyTodoText(B.get(), form().id, { noImage: false })
  assert.ok(preview, 'demo todo has export text')
  clickAlt()
  assert.equal(seen.length, 1, 'clicked once → one request')
  assert.equal(seen[0], preview, 'request body is exactly the on-screen preview')
  assert.equal(form().enh.state, 'loading', 'L2 starts in loading')
  assert.equal(texts(byClass(render(), 'at-enh-load')[0]).includes('正在增强提示词…'), true)
  await tick()
  assert.equal(form().enh.state, 'done', 'result lands in the enhance drawer')
  assert.equal(form().enh.text, 'ENHANCED-RESULT')
  assert.equal(form().enh.notice, '图片已移到末尾')
  const doneTree = render()
  assert.equal(byClass(doneTree, 'at-ex-box').length, 1, 'result is a read-only .ex-box')
  assert.ok(texts(doneTree).includes('ENHANCED-RESULT'))
  assert.ok(!String(byClass(doneTree, 'at-sd-submit')[0].props.className).includes('is-off'),
    'a real result must be copyable')
  await clickCopy()
  assert.deepEqual(copies, ['ENHANCED-RESULT'], 'copy takes the enhanced text, not the original')
  scenarios.push('happy: click → loading → done → copy enhanced text')

  /* ② error + retry ------------------------------------------------------- */
  let nCall = 0
  const retrySeen = []
  B.actions.enhance = function (text) {
    nCall += 1
    retrySeen.push(text)
    return nCall === 1 ? Promise.reject(new Error('模型超时，请稍后重试'))
      : Promise.resolve({ text: 'RETRY-OK' })
  }
  setForm({ draft: { noImage: true } })
  clickAlt()
  await tick()
  assert.equal(form().enh.state, 'error', 'failure is a visible state')
  assert.equal(form().enh.error, '模型超时，请稍后重试', 'Chinese reason, not a silent toast')
  const errTree = render()
  assert.equal(byClass(errTree, 'at-enh-retry').length, 1)
  assert.ok(texts(errTree).includes('模型超时，请稍后重试'))
  clickRetry()
  assert.equal(form().enh.state, 'loading', 'retry resets to loading')
  await tick()
  assert.equal(nCall, 2, 'retry really sends a second request')
  assert.equal(retrySeen[0], retrySeen[1], 'retry reuses the very first source')
  assert.equal(form().enh.state, 'done')
  assert.equal(form().enh.text, 'RETRY-OK')
  scenarios.push('error: reason + retry reuses the first source and re-sends')

  /* ③ 竞态：关掉 L2 后，上一轮响应不许写回 --------------------------------- */
  let release
  B.actions.enhance = function () { return new Promise((resolve) => { release = resolve }) }
  setForm({})
  clickAlt()
  assert.equal(form().enh.state, 'loading')
  B.ui({ form: null })
  release({ text: 'LATE-RESULT' })
  await tick()
  assert.equal(form(), null, 'a late response must never resurrect a closed drawer')
  scenarios.push('race: late response dropped after closing L2')

  /* ④ 关掉 L2 回到 L1，「不含图片」还在 ------------------------------------ */
  B.actions.enhance = function () { return Promise.resolve({ text: 'BACK' }) }
  setForm({ draft: { noImage: true } })
  clickAlt()
  await tick()
  AT.shell.closeForm()
  assert.equal(form().mode, 'export', 'closeForm returns to L1')
  assert.equal(form().draft.noImage, true, 'the switch survives the round trip')
  assert.ok(String(byClass(render(), 'at-ex-sw')[0].props.className).includes('is-on'))
  scenarios.push('round trip: closing L2 returns to L1 with the switch still on')

  /* ⑤ 未登录：错误成因给中文，不静默 --------------------------------------- */
  B.actions.enhance = ORIG.enhance
  const prevConnected = B.get().ui.connected
  B.ui({ connected: false })
  setForm({})
  const before = toasts.length
  clickAlt()
  await tick()
  assert.equal(form().enh.state, 'error', 'unauthenticated enhance must surface an error')
  assert.ok(/登录后可使用 AI 增强/.test(form().enh.error), 'error copy stays Chinese')
  assert.ok(toasts.length >= before, 'toast channel still works')
  B.ui({ connected: prevConnected })
  scenarios.push('logged out: Chinese reason instead of silence')

  B.actions.enhance = ORIG.enhance
  B.copyText = ORIG.copyText
  B.toast = ORIG.toast
  B.ui({ form: null })
  console.log(JSON.stringify({ ok: true, scenarios }, null, 2))
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: e && e.message, stack: e && e.stack }, null, 2))
  process.exitCode = 1
})
