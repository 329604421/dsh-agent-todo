/**
 * DSH host integration smoke test for the generated client.js.
 *
 * Simulates the real host contract used by dsh-bili-mini:
 *   inject: ['slots','locale'] · ctx.locale.register/bind · ctx.inject(['slots'])
 *   ctx.slots.inject(name, cb) · ctx.slots.register(options, component)
 *   apply(ctx) returns a disposer.
 *
 * No browser, no bundled React, no network writes. Run:
 *   node scripts/smoke-client.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')

const source = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')

function runHost(opts) {
  const o = opts || {}
  const registrations = []
  const injections = []
  const services = []
  const localeCalls = []
  const disposedSlots = []
  const keyListeners = []
  const fetchCalls = []
  const timerLog = []
  let loaded = null
  let disposeLocaleCount = 0
  let timerId = 0
  let bindCount = 0

  const React = {
    createElement(type, props) {
      return { type: type, props: props || {}, children: Array.prototype.slice.call(arguments, 2) }
    },
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, function () {}] },
    useEffect() {},
    useRef(value) { return { current: value } },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
  }
  const makeEl = () => ({
    style: {}, setAttribute() {}, remove() {}, appendChild() {}, select() {},
    removeChild() {}, addEventListener() {}, getContext() { return null },
  })
  const document = {
    createElement: makeEl, head: { appendChild() {} }, body: { appendChild() {} },
    execCommand() { return true },
  }
  const timers = {
    setTimeout(fn, ms) { timerLog.push({ kind: 'timeout', ms }); return ++timerId },
    clearTimeout(id) { timerLog.push({ kind: 'clearTimeout', id }) },
    setInterval(fn, ms) { timerLog.push({ kind: 'interval', ms }); return ++timerId },
    clearInterval(id) { timerLog.push({ kind: 'clearInterval', id }) },
  }
  const window = {
    __ModuleLoader__: { load(def) { loaded = def } },
    __AGENT_TODO_TEST__: true,
    addEventListener(type, fn, capture) { keyListeners.push({ type, fn, capture }) },
    removeEventListener(type, fn) {
      const i = keyListeners.findIndex((x) => x.type === type && x.fn === fn)
      if (i >= 0) keyListeners.splice(i, 1)
    },
    setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval, clearInterval: timers.clearInterval,
  }
  function fetch(url, init) {
    fetchCalls.push({ url: String(url), init })
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ code: 0, data: { paired: false } }),
    })
  }
  const sandbox = {
    window, document, console, navigator: { clipboard: null }, fetch,
    FormData: function () { this.append = function () {} },
    setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval, clearInterval: timers.clearInterval,
  }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: 'client.js' })

  const ctx = {
    slots: {
      inject(name, cb) {
        assert.equal(typeof name, 'string')
        assert.equal(typeof cb, 'function')
        injections.push(name)
        return cb()
      },
      register(options, component) {
        assert.equal(typeof options.name, 'string')
        assert.equal(typeof component, 'function', 'slot occupant must be a component')
        registrations.push({ options, component })
        return function () { disposedSlots.push(options.id || options.key) }
      },
    },
  }
  if (!o.noLocale) {
    ctx.locale = {
      register(ns, dict) {
        localeCalls.push({ ns, dict })
        return function () { disposeLocaleCount += 1 }
      },
      bind(ns) {
        bindCount += 1
        return function (key) {
          const entry = localeCalls[localeCalls.length - 1]
          return '[en:' + ns + '] ' + ((entry && entry.dict.en && entry.dict.en[key]) || key)
        }
      },
    }
  }
  if (!o.noInject) {
    ctx.inject = function (names, fn) {
      services.push(Array.from(names))
      return fn()
    }
  }

  const plugin = loaded.factory((name) => {
    assert.equal(name, 'react')
    return React
  })

  return {
    plugin, ctx, registrations, injections, services, localeCalls, disposedSlots,
    keyListeners, fetchCalls, timerLog, window, sandbox, React,
    AT: window.__AGENT_TODO_CORE__,
    get disposeLocaleCount() { return disposeLocaleCount },
    get bindCount() { return bindCount },
  }
}

const EXPECTED = [
  ['sidebar.panellist', 'agent-todo'],
  ['main', 'agent-todo'],
  ['shell.overlay', 'agent-todo-capture'],
  ['shell.overlay', 'agent-todo-composer'],
  ['shell.overlay', 'agent-todo-toast'],
  ['shell.overlay', 'agent-todo-capsule'],
  ['conversation.input.left', 'agent-todo-handoff'],
  ['conversation.chat.assistant-actions', 'agent-todo-save'],
]

/* ------------------------------------------------------ native host path --- */
const host = runHost({})
assert.equal(host.plugin && typeof host.plugin.apply, 'function')
assert.deepEqual(Array.from(host.plugin.inject), ['slots', 'locale'])

const dispose = host.plugin.apply(host.ctx)
assert.equal(typeof dispose, 'function', 'apply() must return a disposer (DSH native)')

assert.equal(host.localeCalls.length, 1)
assert.equal(host.localeCalls[0].ns, 'agent-todo')
assert.ok(host.localeCalls[0].dict.zh && host.localeCalls[0].dict.en,
  'dictionary must carry both zh and en')
assert.equal(host.localeCalls[0].dict.zh.title, 'Agent ToDo')
assert.equal(host.bindCount, 1, 'ctx.locale.bind must be called once')
assert.deepEqual(host.services[0], ['slots'], 'ctx.inject must gate slot registration on slots')
/* ★ v1.8 · 语音 Remote 走**延迟注入**：`remote` 属于语音输入 Bundle，
 * 写进顶层 inject 会让「用户没装语音 Bundle」连带整块插件不加载。 */
assert.deepEqual(host.services[1], ['remote'], 'speech Remote must be attached through ctx.inject')
assert.equal(Array.from(host.plugin.inject).indexOf('remote'), -1,
  'remote must never be a top-level dependency of the whole plugin')

assert.equal(host.injections.length, 8)
assert.deepEqual(host.injections, EXPECTED.map((e) => e[0]))
assert.equal(host.registrations.length, 8)
for (let i = 0; i < EXPECTED.length; i++) {
  const opts = host.registrations[i].options
  assert.equal(opts.name, EXPECTED[i][0])
  assert.equal(opts.id || opts.key, EXPECTED[i][1])
  assert.equal(opts.locale, 'agent-todo', 'every slot occupant must carry locale: NS')
}
assert.equal(host.registrations[0].options.label(), '[en:agent-todo] Agent ToDo',
  'sidebar label must use the bound translator')
assert.equal(host.registrations[7].options.order, 11, 'assistant action keeps order 11')

/* keydown shortcut is registered in capture phase and actually opens capture */
assert.equal(host.keyListeners.length, 1)
assert.equal(host.keyListeners[0].type, 'keydown')
assert.equal(host.keyListeners[0].capture, true)
let prevented = false
host.keyListeners[0].fn({
  altKey: true, code: 'Space', metaKey: false, ctrlKey: false, shiftKey: false,
  preventDefault() { prevented = true },
})
assert.equal(prevented, true)
assert.equal(host.AT.bridge.get().ui.captureOpen, true, 'Alt+Space must open Quick Capture')
assert.ok(host.fetchCalls.some((c) => c.url === '/agent-todo/state'),
  'apply() must bootstrap the /agent-todo/state snapshot')

/* every slot occupant renders without throwing, using host React */
for (const entry of host.registrations) {
  const node = entry.component({ size: 20, active: true, inputActions: { setDraft() {} } })
  assert.ok(node === null || typeof node === 'object',
    'slot ' + (entry.options.id || entry.options.key) + ' must render a React node or null')
}

/* the workspace itself renders */
assert.equal(host.AT.shell.Workspace().props.className, 'at-root')

/* disposer tears everything down */
dispose()
assert.equal(host.keyListeners.length, 0, 'disposer must remove the keydown listener')
assert.equal(host.disposeLocaleCount, 1, 'disposer must dispose the locale registration')
assert.equal(host.disposedSlots.length, 8, 'disposer must dispose every slot occupant')
assert.ok(host.disposedSlots.includes('agent-todo-save'))

/* --------------------------------------------------------- fallback host --- */
const legacy = runHost({ noLocale: true, noInject: true })
legacy.plugin.apply(legacy.ctx)
assert.equal(legacy.registrations.length, 8,
  'hosts without ctx.inject / ctx.locale must still get all slot occupants')
assert.equal(legacy.localeCalls.length, 0)
assert.equal(legacy.services.length, 0)

console.log(JSON.stringify({
  ok: true,
  inject: Array.from(host.plugin.inject),
  registrations: host.registrations.map((e) => (e.options.id || e.options.key)),
  locale: host.localeCalls[0].ns,
  disposedSlots: host.disposedSlots.length,
  fallbackRegistrations: legacy.registrations.length,
  bootstrap: host.fetchCalls.map((c) => c.url),
}, null, 2))
