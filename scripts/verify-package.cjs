/**
 * Behaviour-level verification for the Agent ToDo DSH bundle.
 *
 * Unlike the old version, this does NOT judge the client by `includes()`
 * snippets. It loads the generated client.js into a vm sandbox (using the
 * __AGENT_TODO_TEST__ hook that exposes the AT namespace), then calls the
 * real core / text / bridge functions and checks their behaviour against
 * 小程序前端/utils/{store,markdown,nav}.js.
 *
 * Also proves the shipping artifact is reproducible from src/client/*.js,
 * and runs two in-memory mutations to show the new judgements can go red.
 *
 * Run:  node scripts/verify-package.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const build = require('./build-client.cjs')

const root = path.join(__dirname, '..')
const workspace = path.join(root, '..', '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const exists = (file) => fs.existsSync(path.join(root, file))
const checks = []
function check(name, fn) {
  fn()
  checks.push(name)
}

/* --------------------------------------------------------------- harness --- */
/** Evaluate a client bundle with a minimal browser/host, return its AT ns. */
function harness(source, opts) {
  const o = opts || {}
  let loaded = null
  const keyListeners = []
  const timerLog = []
  const fetchCalls = []
  let timerId = 0

  const React = {
    createElement(type, props) {
      const children = Array.prototype.slice.call(arguments, 2)
      return { type: type, props: props || {}, children: children }
    },
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, function () {}] },
    useEffect() {},
    useRef(value) { return { current: value } },
    useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
  }
  const makeEl = () => ({
    style: {}, setAttribute() {}, remove() {}, removeChild() {}, appendChild() {},
    select() {}, addEventListener() {}, getContext() { return null },
  })
  const document = {
    createElement: makeEl, head: { appendChild() {} }, body: { appendChild() {} },
    execCommand() { return true },
  }
  const timers = {
    setTimeout(fn, ms) { timerLog.push({ kind: 'timeout', ms: ms }); return ++timerId },
    clearTimeout(id) { timerLog.push({ kind: 'clearTimeout', id: id }) },
    setInterval(fn, ms) { timerLog.push({ kind: 'interval', ms: ms }); return ++timerId },
    clearInterval(id) { timerLog.push({ kind: 'clearInterval', id: id }) },
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
    /* ★ v1.8 · 语音层用到 btoa / Blob（浏览器原生，Node 沙箱没有）：
     * 缺了它们，「本地识别成功」那条行为级判据会先抛异常、根本跑不到断言。 */
    btoa: (value) => Buffer.from(String(value), 'binary').toString('base64'),
    atob: (value) => Buffer.from(String(value), 'base64').toString('binary'),
  }
  function FakeBlob(parts, options) {
    const list = Array.isArray(parts) ? parts : [parts]
    let size = 0
    for (const part of list) {
      if (part == null) continue
      size += typeof part === 'string' ? Buffer.byteLength(part) : (part.length || part.byteLength || 0)
    }
    this.parts = list
    this.size = size
    this.type = (options && options.type) || ''
  }
  function fetch(url, init) {
    fetchCalls.push({ url: String(url), init: init })
    if (o.fetchFail) {
      return Promise.resolve({
        ok: false, status: 500,
        json: () => Promise.resolve({ code: 500, message: '写入失败' }),
      })
    }
    return Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({ code: 0, data: {} }),
    })
  }
  const sandbox = {
    window, document, console, navigator: { clipboard: null }, fetch,
    FormData: function () { this.append = function () {} },
    Blob: FakeBlob,
    setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval, clearInterval: timers.clearInterval,
  }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: 'client.js' })
  assert.ok(loaded, 'client.js must call window.__ModuleLoader__.load')
  assert.equal(loaded.id, '@local/agent-todo')
  const plugin = loaded.factory((name) => {
    assert.equal(name, 'react')
    return React
  })
  const AT = window.__AGENT_TODO_CORE__
  assert.ok(AT && AT.core && AT.text && AT.bridge && AT.shell && AT.entry,
    'AT namespace must be exposed for behaviour checks')
  return {
    AT, plugin, React, window, sandbox, keyListeners, timerLog, fetchCalls,
    Core: AT.core, Text: AT.text, B: AT.bridge, C: AT.const,
  }
}

function collectNodes(node, out) {
  out = out || []
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) { node.forEach((n) => collectNodes(n, out)); return out }
  out.push(node)
  ;(node.children || []).forEach((n) => collectNodes(n, out))
  return out
}
function classNames(node) {
  return collectNodes(node).map((n) => String((n.props && n.props.className) || ''))
}
function collectStrings(node, out) {
  out = out || []
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out }
  if (Array.isArray(node)) { node.forEach((n) => collectStrings(n, out)); return out }
  if (typeof node === 'object') {
    (node.children || []).forEach((n) => collectStrings(n, out))
    if (node.props) {
      Object.keys(node.props).forEach((k) => {
        const v = node.props[k]
        if (typeof v === 'string') out.push(v)
      })
    }
  }
  return out
}

async function main() {
  const client = read('client.js')

  /* ------------------------------------------------------------ manifest --- */
  check('manifest: DSH bundle wiring', () => {
    const manifest = JSON.parse(read('package.json'))
    assert.equal(manifest.name, '@local/agent-todo')
    assert.equal(manifest.type, 'module')
    assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
    assert.equal(manifest.dsh.client.platform, 'web')
    assert.equal(manifest.dsh.client.immediately, true)
    assert.equal(manifest.exports['./client'], './client.js')
    assert.equal(manifest.exports['./icon'], './icon.svg')
    assert.ok(manifest.exports['./package.json'])
    assert.ok(manifest.files.includes('assets/**'))
    assert.ok(manifest.files.includes('README.md'))
    assert.equal(manifest.scripts.build, 'node scripts/build-client.cjs')
    /* dsh-bili-mini has no dsh.client.inject key; client-level inject is
     * declared by createClient() itself, not by the manifest. */
    assert.equal(manifest.dsh.client.inject, undefined)
  })

  check('files: required bundle members present', () => {
    for (const file of [
      'index.js', 'client.js', 'cordis.patch.yml', 'icon.svg',
      'locale/zh.json', 'locale/en.json', 'assets/mindmap-core.js',
      'assets/logo.png', 'README.md', 'scripts/build-client.cjs',
      'scripts/smoke-client.cjs', 'scripts/verify-package.cjs',
      'assets/icons/check.svg', 'assets/icons/d-check.svg', 'assets/icons/w-check.svg',
      'assets/icons/overview.svg', 'assets/icons/add-child.svg',
    ]) assert.ok(exists(file), 'missing file: ' + file)
    const icons = fs.readdirSync(path.join(root, 'assets', 'icons'))
      .filter((name) => name.endsWith('.svg'))
    assert.equal(icons.length, 120, 'the full mini-program icon set must be vendored')
    assert.equal(icons.filter((name) => name.startsWith('d-')).length, 54)
    assert.equal(icons.filter((name) => name.startsWith('w-')).length, 12)
    assert.ok(read('assets/icons/check.svg').includes('#1C1C1E'))
    assert.ok(read('assets/icons/d-check.svg').includes('#EEEDEA'))
    assert.ok(read('assets/icons/w-check.svg').includes('#FFFFFF'))
    const zh = JSON.parse(read('locale/zh.json'))
    const en = JSON.parse(read('locale/en.json'))
    assert.ok(zh.meta.title && zh.meta.description)
    assert.ok(en.meta.title && en.meta.description)
    assert.ok(read('icon.svg').startsWith('<svg'), 'icon.svg must be an SVG')
  })

  check('build: legacy JSX sketch is out of the build path', () => {
    assert.ok(exists('src/client/legacy/entry.jsx'))
    assert.ok(exists('src/client/legacy/build-client.mjs.bak'))
    assert.ok(!exists('scripts/build-client.mjs'))
    assert.ok(build.files.length === 18, 'expected 18 source modules (76-voice.js added)')
    assert.ok(build.files.indexOf('85-desktop.js') >= 0, 'desktop presentation module missing')
    assert.ok(build.files.indexOf('05-icons.js') >= 0, 'icon module must load first')
    assert.ok(build.files.indexOf('08-style.js') >= 0, 'style standard module missing')
    /* 语音层必须排在胶囊之前：80-capsule 在模块求值期就引用 AT.voice */
    assert.ok(build.files.indexOf('76-voice.js') >= 0, 'voice module missing')
    assert.ok(build.files.indexOf('76-voice.js') < build.files.indexOf('80-capsule.js'),
      '76-voice.js must load before 80-capsule.js')
    assert.ok(build.files.indexOf('08-style.js') < build.files.indexOf('80-capsule.js'),
      'style standard must load before the capsule module')
    assert.ok(build.files.indexOf('55-panes.js') >= 0, 'integrated three-pane module missing')
    assert.ok(build.files.every((f) => /^\d\d-[a-z0-9-]+\.js$/.test(f)))
    assert.ok(!build.files.some((f) => f.endsWith('.jsx')))
  })

  check('build: client.js is exactly what src/client/*.js produces', () => {
    assert.equal(build.normalize(client), build.normalize(build.render()),
      'client.js is stale or hand-edited — run node scripts/build-client.cjs')
  })

  check('client: single host React, no injected <style> into <head>', () => {
    assert.ok(client.includes('window.__ModuleLoader__.load'))
    assert.equal((client.match(/require\('react'\)/g) || []).length, 1)
    assert.ok(!/^\s*(import|export)\s/m.test(client), 'ESM leaked into loader factory')
    /* Only <style> injection is forbidden. Loading mindmap-core.js via a
     * <script> appended to <head> is the documented asset path. */
    assert.ok(!/document\.head\.appendChild\(\s*style\s*\)/.test(client),
      'styles must live in the component tree')
    assert.ok(!/createElement\(\s*['"]style['"]\s*\)/.test(client))
    assert.ok(!client.includes('function ListDrawer'),
      'list drawers must not exist — lists are in-page regions now')
    assert.ok(!client.includes('at-drawer-mask'), 'list drawer mask must be gone')
    /* A rule must start its own CSS string. Matching a bare substring would
     * both miss combined selectors and hit suffix selectors like
     * `.at-panes.is-tight .at-pane-list{`. */
    assert.ok(/['"]\s*\.at-pane-list\s*\{/.test(client), 'in-page list pane CSS missing')
    assert.ok(/['"]\s*\.at-pane-detail\s*\{/.test(client), 'in-page detail pane CSS missing')
    assert.ok(client.includes('is-compact') && client.includes('is-tight'),
      'window-size adaptation classes missing')
    assert.ok(client.includes("el.src = '/agent-todo/assets/mindmap-core.js'"))
    assert.ok(client.includes('var(--dsw-alias-'), 'DSH alias tokens missing')
    assert.ok(!/将在 P[0-9]/.test(client), 'P-phase placeholder leaked')
    assert.ok(!client.includes('function Placeholder'), 'Placeholder component leaked')
    /* ASI guard: node --check cannot see `const AT = {}(function ...)` —
     * the factory only crashes when the DSH loader actually calls it. */
    assert.ok(client.includes('const AT = {};'))
    assert.ok(client.includes(';(function (AT, React, h) {'))
    assert.equal((client.match(/\}\)\(AT, React, h\);/g) || []).length, build.files.length,
      'every chunk must be semicolon-terminated')
  })

  /* --------------------------------------------------------------- host --- */
  check('host: proxy / token / tool contracts unchanged', () => {
    const host = read('index.js')
    assert.ok(host.includes("export const inject = ['webServer', 'tools']"))
    for (const route of [
      '/agent-todo/state', '/agent-todo/token', '/agent-todo/pair',
      '/agent-todo/disconnect', '/agent-todo/api', '/agent-todo/assets',
    ]) assert.ok(host.includes("path: '" + route + "'"), 'missing host route ' + route)
    assert.ok(host.includes("name: 'agent_todo'"))
    const patch = read('cordis.patch.yml')
    assert.ok(patch.includes('@local/agent-todo'))
    assert.ok(patch.includes('enableAgentTools: true'))
    const core = read('assets/mindmap-core.js')
    assert.ok(core.includes('window.AgentTodoMindmapCore'))
    assert.ok(core.includes('portWorkH') && core.includes('landWorkH'))
  })

  /* ★ 2026-11-10 轮次 13：这条判据原本断言"配对功能已撤回"—— 那时是撤回态。
   * 现在插件登录（6 位验证码）已在小程序与后端落地并部署，判据必须跟着反过来：
   * 断的是"**两端都在、而且对得上**"，不是"都删干净了"。
   * ⚠️ 换向时特意保留了最后两条 —— BASE 指向正式域名、mock 从未打开 ——
   *    那是生产安全不变量（写操作会真落库），与本功能是否启用无关，任何时候都不能松。 */
  check('scope: plugin login is live on both ends and consistent', () => {
    const backup = path.join(workspace, '插件', '配对功能备份')
    /* 备份目录保留：它是撤回/恢复的施工记录，判据不因功能上线就要求它消失。 */
    assert.ok(fs.existsSync(path.join(backup, 'README.md')))
    assert.ok(fs.existsSync(path.join(backup, 'patch.diff')))
    for (const backendRoot of [
      path.join(workspace, 'GitHub', 'server'), path.join(workspace, '后端服务'),
    ]) {
      const label = backendRoot.indexOf('GitHub') >= 0 ? 'GitHub/server' : '后端服务'
      const service = path.join(backendRoot, 'src', 'auth', 'device-auth.service.ts')
      const controller = path.join(backendRoot, 'src', 'auth', 'device-auth.controller.ts')
      const dto = path.join(backendRoot, 'src', 'auth', 'dto', 'device.dto.ts')
      const module6 = path.join(backendRoot, 'src', 'auth', 'auth.module.ts')
      const schemaPath = path.join(backendRoot, 'prisma', 'schema.prisma')
      const migration = path.join(backendRoot, 'prisma', 'migrations', '20261104100000_device_pairing', 'migration.sql')

      assert.ok(fs.existsSync(service), label + ': device-auth.service.ts must exist')
      assert.ok(fs.existsSync(controller), label + ': device-auth.controller.ts must exist')
      assert.ok(fs.existsSync(dto), label + ': device.dto.ts must exist')
      assert.ok(fs.existsSync(migration), label + ': pairing migration must exist')

      const schema = fs.readFileSync(schemaPath, 'utf8')
      /* ⚠️ 必须带边界：`includes('model PairCode')` 会被 `model PairCodeX {` 蒙过去 ——
       * 变异测试（改名成 PairCodeX）第一版就是绿的，就是栽在这个子串上。 */
      assert.ok(/model\s+PairCode\s*\{/.test(schema), label + ': schema must declare PairCode')
      assert.ok(/\bpairCodes\s+PairCode\[\]/.test(schema), label + ': User must expose pairCodes')
      assert.ok(schema.includes('agenttodo_pair_code'), label + ': table name pinned')

      /* 组件不注册 = 路由不存在，静默 404。判据必须看到注册，而不只是文件在。 */
      const mod = fs.readFileSync(module6, 'utf8')
      assert.ok(/DeviceAuthController/.test(mod) && /DeviceAuthService/.test(mod),
        label + ': AuthModule must register device auth')

      /* 路由字面量：控制器里两个端点都得挂上 */
      const ctrl = fs.readFileSync(controller, 'utf8')
      assert.ok(/@Post\('pair-code'\)/.test(ctrl), label + ': pair-code route')
      assert.ok(/@Post\('pair'\)/.test(ctrl), label + ': pair route')

      /* 用户可见文案统一为「登录验证码」—— 插件弹窗、小程序、后端三处对不上，
       * 用户就会在报错里看到另一个名字。 */
      const svc = fs.readFileSync(service, 'utf8')
      assert.ok(svc.includes('登录验证码'), label + ': service messages speak "登录验证码"')
      assert.ok(!svc.includes('配对码无'), label + ': no stale "配对码" wording in user messages')

      const mig = fs.readFileSync(migration, 'utf8')
      assert.ok(mig.includes('agenttodo_pair_code'), label + ': migration creates the table')
      assert.ok(!/DROP TABLE/i.test(mig), label + ': migration must not drop anything')
    }

    const miniDir = path.join(workspace, '小程序前端')
    const miniApi = fs.readFileSync(path.join(miniDir, 'utils', 'api.js'), 'utf8')
    const miniMine = fs.readFileSync(path.join(miniDir, 'components', 'mod-mine', 'mod-mine.js'), 'utf8')
    const miniWxml = fs.readFileSync(path.join(miniDir, 'components', 'mod-mine', 'mod-mine.wxml'), 'utf8')
    const miniWxss = fs.readFileSync(path.join(miniDir, 'components', 'mod-mine', 'mod-mine.wxss'), 'utf8')

    /* api：函数得定义，也得**导出**（只定义不导出 = 页面调不到） */
    assert.ok(/function pairCode\(\)/.test(miniApi), 'api.js defines pairCode')
    assert.ok(/pairCode:\s*pairCode/.test(miniApi), 'api.js exports pairCode')
    assert.ok(miniApi.includes("'/auth/device/pair-code'"), 'api.js hits the pair-code endpoint')

    assert.ok(/onPairCode:\s*function/.test(miniMine), 'mod-mine wires onPairCode')
    assert.ok(miniMine.includes("require('../../utils/api')"), 'mod-mine requires api')

    /* 入口：绑定、按钮文案、区块样式三样齐 —— 只加 wxml 不绑事件是死按钮 */
    assert.ok(miniWxml.includes('bindtap="onPairCode"'), 'wxml binds the tap')
    assert.ok(miniWxml.includes('生成验证码'), 'wxml button label')
    assert.ok(miniWxml.includes('插件登录'), 'wxml section title')
    assert.ok(miniWxss.includes('.dsh-card'), 'wxss styles the section')

    /* 两端叫法一致：插件弹窗说的是「生成验证码」，小程序按钮也得是这个说法 */
    const overlay = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', '95-overlays.js'), 'utf8')
    assert.ok(overlay.includes('生成验证码'), 'plugin dialog points at the same button label')

    /* Production-safety invariant: the mini-program still points at the real
     * backend and mock was never enabled. */
    assert.ok(miniApi.includes('https://todo.memorymap.cn/api/v1'))
    assert.ok(!/setMock\(\s*true\s*\)/.test(miniApi))
  })

  /* ---------------------------------------------------- behaviour parity --- */
  const H = harness(client)
  const { AT, Core, Text, B, C } = H
  const s0 = Core.initialState()

  check('icons: full mini-program set, three variants, tone + opacity + size', () => {
    const I = AT.icons
    assert.equal(I.NAMES.length, 54, '54 semantic icon names')
    assert.equal(I.W_NAMES.length, 12, '12 white variants')
    assert.equal(I.prefixFor('check', '', false), '')
    assert.equal(I.prefixFor('check', '', true), 'd-')
    assert.equal(I.prefixFor('check', 'ink', true), '', 'ink stays dark-on-bright')
    assert.equal(I.prefixFor('w-copy', '', true), '', 'w-* never gets a prefix')
    assert.equal(I.iconSrc('overview', '', false), '/agent-todo/assets/icons/overview.svg')
    assert.equal(I.iconSrc('overview', '', true), '/agent-todo/assets/icons/d-overview.svg')
    assert.equal(I.iconSrc('overview', 'ink', true), '/agent-todo/assets/icons/overview.svg')
    assert.equal(I.iconSrc('copy', 'white', true), '/agent-todo/assets/icons/w-copy.svg')
    /* Real semantic names win over ALIAS; ALIAS only carries legacy names that
     * are not in the mini-program icon set at all. */
    assert.equal(I.resolveName('chart'), 'chart', 'a real semantic name must win')
    assert.equal(I.resolveName('overview'), 'overview')
    assert.equal(I.resolveName('w-copy'), 'w-copy')
    assert.equal(I.resolveName('image'), 'album', 'legacy name must map to a real asset')
    assert.equal(I.resolveName('mic'), 'voice')
    assert.equal(I.resolveName('chevron-up'), 'chevron-down')
    assert.equal(I.resolveName('chartb'), 'chart-b')
    assert.equal(I.resolveName('unknown-xyz'), 'info', 'unknown names fall back to info')
    const light = I.Icon({ name: 'overview', size: 22, opacity: 0.62 })
    assert.equal(light.type, 'img')
    assert.equal(light.props.src, '/agent-todo/assets/icons/overview.svg')
    assert.equal(light.props.style.width, '22px')
    assert.equal(light.props.style.opacity, 0.62)
    I.setDark(true)
    assert.ok(I.Icon({ name: 'overview', size: 22 }).props.src.includes('/d-overview.svg'))
    assert.ok(!I.Icon({ name: 'plus', size: 14, tone: 'ink' }).props.src.includes('/d-plus.svg'))
    I.setDark(false)
  })

  check('panes: three modules use in-page list + detail, never a popover', () => {
    for (const kind of ['project', 'todo', 'mindmap']) {
      B.ui({ active: kind })
      const s = B.get()
      const tri = AT.panes.render(s)
      assert.ok(String(tri.props.className).indexOf('at-panes') >= 0, kind + ' must be a pane row')
      assert.equal(tri.children.length, 2, kind + ' must have list + detail')
      assert.equal(tri.children[0].type, AT.panes.ListPane)
      assert.equal(tri.children[1].type, AT.panes.DetailPane)
      const list = AT.panes.ListPane({ s: s, kind: kind })
      const detail = AT.panes.DetailPane({ s: s, kind: kind })
      assert.ok(String(list.props.className).includes('at-pane-list'))
      assert.ok(String(detail.props.className).includes('at-pane-detail'))
      assert.ok(!classNames([list, detail]).some((c) => c.includes('at-drawer')),
        kind + ' list must not be a drawer')
    }
    assert.equal(AT.panes.widthClass({ ui: { paneWidth: 1200 } }), '')
    assert.ok(AT.panes.widthClass({ ui: { paneWidth: 800 } }).includes('is-compact'))
    assert.ok(AT.panes.widthClass({ ui: { paneWidth: 520 } }).includes('is-tight'))
    B.ui({ active: 'overview' })
    const single = AT.panes.Single({ s: B.get(), title: '概览', sub: '', body: null })
    assert.ok(String(single.props.className).includes('at-pane-single'))
  })

  check('panes: one selection id drives both the list highlight and the detail', () => {
    B.ui({ active: 'todo' })
    AT.panes.setSel('todo', 'd-demo-2')
    assert.equal(AT.panes.selId(B.get(), 'todo'), 'd-demo-2')
    const list = AT.panes.ListPane({ s: B.get(), kind: 'todo' })
    const rows = collectNodes(list).filter((n) => String((n.props && n.props.className) || '').includes('at-pane-row'))
    assert.ok(rows.length >= 2, 'todo list must render rows')
    assert.ok(rows.some((r) => String(r.props.className).includes('is-on')),
      'selected row must be highlighted in the in-page list')
    const detail = AT.panes.DetailPane({ s: B.get(), kind: 'todo' })
    assert.ok(collectStrings(detail).join(' ').includes(Core.byId(B.get().todos, 'd-demo-2').text))
  })

  check('core: initial state matches the 5-module PC shell', () => {
    assert.equal(s0.ui.active, 'overview')
    assert.equal(s0.source, 'demo')
    assert.equal(s0.loaded, false)
    assert.equal(s0.ui.connected, false)
    assert.deepEqual(Array.from(C.MODULES.map((m) => m.key)),
      ['overview', 'project', 'todo', 'mindmap', 'mine'])
    assert.deepEqual(Array.from(C.DETAIL_MODULES), ['project', 'todo', 'mindmap'])
    assert.equal(s0.heat.weeks.length, 30)
    assert.ok(s0.heat.weeks.every((w) => w.days.length === 7))
  })

  check('core: heat skeleton uses local dates + Monday-aligned weeks', () => {
    const weeks = Text.heatWeeks(s0)
    assert.equal(weeks.length, 30)
    const first = weeks[0].days[0]
    const date = new Date(first.date.replace(/-/g, '/'))
    assert.equal(date.getDay(), 1, 'first column must be a Monday')
    const lastWeek = weeks[29].days
    const today = new Date()
    const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0')
    /* No toISOString(): the ledger key is local today, so one cell must match. */
    assert.ok(lastWeek.some((d) => d.date === ymd(today)),
      'current week must contain local today (UTC drift would drop it)')
    const sel = Text.todayCell(s0)
    assert.ok(sel && Text.heatDay(s0, sel.week, sel.day).date === ymd(today))
    assert.ok(weeks[0].days[0].label.indexOf('周一') >= 0)
  })

  check('nav: planFrom switch / drawer / refresh', () => {
    const P = AT.shell.planFrom
    assert.equal(P('overview', 'todo'), 'switch')
    assert.equal(P('todo', 'overview'), 'switch')
    assert.equal(P('todo', 'todo'), 'drawer')
    assert.equal(P('project', 'project'), 'drawer')
    assert.equal(P('mindmap', 'mindmap'), 'drawer')
    assert.equal(P('overview', 'overview'), 'refresh')
    assert.equal(P('mine', 'mine'), 'refresh')
  })

  check('core: todo soft delete / restore', () => {
    const before = Core.aliveTodos(s0).length
    const gone = Core.rules.removeTodo(s0, 'd-demo-4')
    assert.equal(Core.aliveTodos(gone).length, before - 1)
    assert.equal(Core.deletedTodos(gone).length, 1)
    assert.equal(Core.filterTodos(gone, { status: 'open' }).length, 3)
    const back = Core.rules.restoreTodo(gone, 'd-demo-4')
    assert.equal(Core.aliveTodos(back).length, before)
    assert.equal(Core.deletedTodos(back).length, 0)
    assert.equal(Core.byId(back.todos, 'd-demo-4').done, false, 'restored todo reopens')
    assert.equal(Core.byId(back.todos, 'd-demo-4').deletedAt, null)
  })

  check('core: capsule inbox / link / consume / delete / restore', () => {
    assert.equal(Core.capsules(s0).length, 2, 'linked capsules are not inbox items')
    assert.equal(Core.capsulesOfTodo(s0, 'd-demo-1').length, 1,
      'capsules linked to a todo are still delivered for export')
    const unlinked = Core.rules.unlinkCapsules(s0, 'd-demo-1', ['c-demo-3'])
    assert.equal(Core.capsules(unlinked).length, 3)
    assert.equal(Core.byId(unlinked.capsules, 'c-demo-3').consumed, false)
    const consumed = Core.rules.consumeCapsules(s0, ['c-demo-1'])
    assert.equal(Core.capsules(consumed).length, 1)
    const deleted = Core.rules.removeCapsules(s0, ['c-demo-1', 'c-demo-2'])
    assert.equal(Core.deletedCapsules(deleted).length, 2)
    const restored = Core.rules.restoreCapsules(deleted, ['c-demo-1'])
    assert.equal(Core.deletedCapsules(restored).length, 1)
    assert.equal(Core.capsules(restored).length, 1)
  })

  check('core: changing a todo project detaches a mindmap from another project', () => {
    const moved = Core.rules.updateTodo(s0, 'd-demo-1', { projectId: 'p-demo-2' })
    assert.equal(Core.byId(moved.todos, 'd-demo-1').mindmapId, null)
    const same = Core.rules.updateTodo(s0, 'd-demo-1', { projectId: 'p-demo-1' })
    assert.equal(Core.byId(same.todos, 'd-demo-1').mindmapId, 'm-demo-1')
  })

  check('core: project score / sorting / filters', () => {
    assert.equal(Core.scoreOf(s0, 'p-demo-1'), 9)   // urgent 5 + mid 3 + low 1
    assert.equal(Core.scoreOf(s0, 'p-demo-2'), 0)
    assert.equal(Core.sortProjects(s0)[0].id, 'p-demo-1')
    assert.equal(Core.projectSummary(s0, 'p-demo-1').mindmaps, 1)
    assert.equal(Core.filterTodos(s0, { status: 'open' }).length, 3)
    assert.equal(Core.filterTodos(s0, { status: 'done' }).length, 1)
    assert.equal(Core.filterTodos(s0, { kw: '导出' }).length, 1)
    assert.equal(Core.filterTodos(s0, { projectId: 'p-demo-2', status: 'all' }).length, 1)
    assert.equal(Core.filterProjects(s0).length, 2)
    assert.equal(Core.filterMindmaps(s0).length, 1)
  })

  check('core: adaptSnapshot maps the /sync contract', () => {
    const snap = Core.adaptSnapshot({
      projects: [{ id: 'p1', name: 'P' }],
      todos: [{ id: 't1', text: 'T', status: 'done', images: ['a.png'] }],
      mindmaps: [{ id: 'm1', name: 'M', nodeCount: 4 }],
      capsules: [{ id: 'c1', text: 'C', deletedAt: '2026-11-04 10:00:00' }],
      activity: [{ date: '2026-11-04', created: 2, capsule: 1 }],
      me: { nickname: 'Nick' },
    })
    assert.equal(snap.source, 'api')
    assert.equal(snap.loaded, true)
    assert.equal(snap.todos[0].done, true)
    assert.equal(snap.todos[0].images[0].uri, 'a.png')
    assert.equal(snap.mindmaps[0].nodes, 4)
    assert.equal(snap.capsules[0].deleted, true)
    assert.equal(snap.activity['2026-11-04'].created, 2)
    assert.equal(snap.activity['2026-11-04'].capsule, 1)
    assert.equal(snap.me.name, 'Nick')
  })

  check('text: heat levels use the 0 / 10 / 25 / 49 thresholds', () => {
    const L = Text.levelOf
    assert.equal(L(0), 0); assert.equal(L(1), 1); assert.equal(L(10), 1)
    assert.equal(L(11), 2); assert.equal(L(25), 2); assert.equal(L(26), 3)
    assert.equal(L(49), 3); assert.equal(L(50), 4)
  })

  check('text: tree helpers protect descendants and root', () => {
    const root = s0.tree['m-demo-1']
    assert.equal(Text.countNodes(root), 5)
    assert.equal(Text.depthOf(root), 3)
    const denied = Text.treeRules.moveNodeTo(root, 'n-1', 'n-1-1')
    assert.equal(JSON.stringify(denied), JSON.stringify(root),
      'moving a node into its own descendant must be a no-op')
    assert.equal(JSON.stringify(Text.treeRules.removeNode(root, 'n-root')), JSON.stringify(root))
    const moved = Text.treeRules.moveNodeTo(root, 'n-1-1', 'n-2')
    assert.equal(Text.findNode(moved, 'n-1').children.length, 1)
    assert.equal(Text.findNode(moved, 'n-2').children.length, 1)
    assert.equal(Text.findParent(moved, 'n-1-1').id, 'n-2')
  })

  check('text: undo / redo history', () => {
    const root = s0.tree['m-demo-1']
    const h1 = Text.historyPush({}, 'm1', root)
    const renamed = Text.treeRules.updateNode(root, 'n-2', { text: '改过' })
    const h2 = Text.historyPush(h1, 'm1', renamed)
    assert.equal(h2.m1.stack.length, 2)
    const back = Text.historyMove(h2, 'm1', -1)
    assert.equal(Text.findNode(back.tree, 'n-2').text, '交付验收')
    const fwd = Text.historyMove(back.hist, 'm1', 1)
    assert.equal(Text.findNode(fwd.tree, 'n-2').text, '改过')
    assert.equal(Text.historyMove(h2, 'm1', 1), null, 'redo past the tip must be null')
  })

  check('mindmap: full editing rules cover nodes / text / links / levels / layout', () => {
    const root = s0.tree['m-demo-1'], T = Text.treeRules
    /* 节点 + 文本 */
    assert.equal(Text.countNodes(T.addNode(root, 'n-2', '新子节点', false)), 6)
    const renamed = T.updateNode(root, 'n-2', { text: '改过', remark: '备注', imageUri: 'a.png' })
    assert.equal(Text.findNode(renamed, 'n-2').remark, '备注')
    assert.equal(Text.findNode(renamed, 'n-2').imageUri, 'a.png')
    assert.equal(Text.flatNodes(root).length, 5)
    /* 层级：三种落位 + 子孙保护 + 升降级 + 排序 + 复制 + 插入父级 */
    const before = T.moveNode(root, 'n-1-1', 'n-2', 'before')
    assert.equal(Text.findParent(before, 'n-1-1').id, 'n-root')
    assert.equal(Text.findParent(T.moveNode(root, 'n-1-1', 'n-2', 'child'), 'n-1-1').id, 'n-2')
    assert.equal(JSON.stringify(T.moveNode(root, 'n-1', 'n-1-1', 'child')), JSON.stringify(root))
    const ind = T.indentNode(root, 'n-2')
    assert.equal(Text.findParent(ind, 'n-2').id, 'n-1')
    assert.equal(Text.findParent(T.outdentNode(ind, 'n-2'), 'n-2').id, 'n-root')
    const shifted = T.shiftNode(root, 'n-2', -1)
    assert.equal(Text.findNode(shifted, 'n-root').children[0].id, 'n-2')
    assert.equal(Text.countNodes(T.duplicateNode(root, 'n-2')), 6)
    assert.equal(Text.findParent(T.insertParent(root, 'n-2'), 'n-2').text, '新层级')
    /* 关联连线 */
    const linked = T.addLink(root, 'n-1', 'n-2', '依赖')
    assert.equal(Text.allLinks(linked).length, 1)
    assert.equal(Text.allLinks(linked)[0].label, '依赖')
    const linkId = Text.findNode(linked, 'n-1').links[0].id
    assert.equal(Text.allLinks(T.removeLink(linked, 'n-1', linkId)).length, 0)
    /* 折叠 / 展开 */
    const collapsed = T.setCollapsedAll(root, true)
    assert.equal(Text.visibleTree(collapsed).children[0].children.length, 0)
    const expanded = T.setCollapsedAll(collapsed, false)
    assert.equal(Text.visibleTree(expanded).children[0].children.length, 2)
  })

  /* ★ v1.12 订正（判据口径也会过时）：小程序 PC 画布是 **10 颗键 · 两条浮条**
   *   （右上 [撤回·重做] ‖ [编辑脑图信息] ‖ [展开·收起]，左下 [加子·加同级] ‖
   *    [删除] ‖ [改文本·语音]），插件原来那 26 颗横排键**已按真源收敛**。
   * 这条判据因此从"这些中文标签必须存在"改成三件事：
   *   ① 工具条恰有 10 颗 `.at-mm-fb`（数节点，不去正文里找中文 —— 改文案不该让它红）；
   *   ② 十颗的语义名一个不少；
   *   ③ 插件自造的那些入口**真的消失**，且画布上不再有格式下拉（已收进编辑抽屉）。
   * ⚠️ 别退回"找中文标签"的写法：标题现在是 title / aria-label，扫 children 找不到。 */
  check('mindmap: detail editor exposes exactly the mini-program ten buttons', () => {
    const mm = Core.byId(s0.mindmaps, 'm-demo-1')
    const tree = AT.mindmap.Editor({ s: s0, mm: mm })
    assert.ok(tree && typeof tree === 'object')
    const nodes = collectNodes(tree)
    const fb = nodes.filter((n) => n.type === 'button' &&
      String((n.props && n.props.className) || '').split(/\s+/).indexOf('at-mm-fb') >= 0)
    assert.equal(fb.length, 10, 'mini-program parity: exactly ten canvas buttons')
    const titleOf = (n) => String((n.props && (n.props.title || n.props['aria-label'])) || '')
    for (const label of ['撤回', '重做', '编辑脑图信息', '展开', '收起',
      '加子节点', '加同级', '删除节点', '改文本', '语音改文本']) {
      assert.ok(fb.some((n) => titleOf(n) === label), 'missing canvas button: ' + label)
    }
    const text = collectStrings(tree).join(' ')
    for (const gone of ['复制', '插入父级', '升级', '降级', '上移', '下移',
      '加连线', '展开全部', '收起全部', '导出 Markdown', '定位节点…']) {
      assert.ok(!text.includes(gone), 'should be gone from the canvas: ' + gone)
    }
    /* 六格式切换收进「编辑脑图信息」抽屉 ⇒ 画布上不许再有格式下拉。
     * 六档本身仍在（C.FORMATS），只是入口换了地方。 */
    const picker = nodes.filter((n) => n.type === AT.ui.Select &&
      n.props && n.props.label === '脑图格式')
    assert.equal(picker.length, 0, 'format selector moved into the edit drawer')
    assert.equal(C.FORMATS.length, 6)
    /* ★ 轮次 7（用户拍板「删掉死代码」）：小程序脑图根本没有「关联连线」这个概念，
     * 插件那套 linkOpen 面板 / kw 搜索 / linkCount 徽标 / dashed SVG 层从来不可达
     * ⇒ 整条撤掉。历史数据里的 n.links 与 treeRules.addLink/removeLink 保留以兼容，
     * 但画布不再画它；父子结构连线由 core.buildLinksUri 的 <img> 单独承担。 */
    assert.ok(!nodes.some((n) => n.type === 'svg'),
      'association-link SVG layer is gone: the mini-program has no such concept')
    assert.ok(!text.includes('添加连线') && !text.includes('连线说明'),
      'no association-link panel left on the canvas')
    assert.ok(!text.includes('定位节点'), 'dead node-search is gone')
    const L = AT.mindmap.layout(null, s0.tree['m-demo-1'], 'mindmap')
    assert.equal(L.nodes.length, 5)
    assert.equal(Object.keys(L.rectById).length, 5, 'one rect per node')
  })

  check('text: todoToMarkdown section order matches markdown.js', () => {
    const root = s0.tree['m-demo-1']
    const todo = { text: '正文', images: [{ label: '图[1]', uri: 'abc.png' }] }
    const md = Text.todoToMarkdown(todo, root, {
      imageUrl: (u) => 'https://x/' + u,
      capsules: [{ text: '一句闪念', uri: 'c.png' }],
    })
    assert.ok(md.startsWith('正文'))
    assert.ok(md.includes('![图\\[1\\]](https://x/abc.png)'))
    assert.ok(md.includes('# 客户交付'), 'mindmap root becomes an h1')
    assert.ok(md.indexOf('正文') < md.indexOf('# 客户交付'))
    assert.ok(md.indexOf('# 客户交付') < md.indexOf('---'))
    assert.ok(md.includes('闪念胶囊'))
    assert.ok(md.includes('- 一句闪念'))
    assert.ok(md.includes('![胶囊图片 1](https://x/c.png)'))
    const noImg = Text.todoToMarkdown(todo, null, { noImage: true, capsules: [] })
    assert.ok(!noImg.includes('!['), 'noImage must drop todo images')
    assert.ok(!noImg.includes('闪念胶囊'))
  })

  check('text: copyTodoText includes linked capsules like the mini-program', () => {
    const md = Text.copyTodoText(s0, 'd-demo-1')
    assert.ok(md.includes('把 Agent-ToDo 的 Capture 做成全局快捷键'))
    assert.ok(md.includes('# 客户交付'))
    assert.ok(md.includes('闪念胶囊'))
    /* c-demo-3 is the capsule linked to d-demo-1; c-demo-2 is still in the
     * inbox and must NOT leak into this todo's export. */
    assert.ok(md.includes('导出要能直接复制，而不是复制后自己找地方粘贴'))
    assert.ok(!md.includes('脑图贴着任务'))
    assert.equal(Text.copyTodoText(s0, '不存在的 id'), '')
    assert.equal(Text.fileUrl('https://todo.memorymap.cn/api/v1', 'a.png'),
      'https://todo.memorymap.cn/files/a.png')
  })

  check('shell: Workspace renders 5 nav items + in-page panes + in-tree <style>', () => {
    const tree = AT.shell.Workspace()
    assert.equal(tree.type, 'div')
    assert.equal(tree.props.className, 'at-root')
    const style = tree.children.filter((n) => n && n.type === 'style')[0]
    assert.ok(style, 'styles must be rendered as a child element, not appended to <head>')
    const css = collectStrings(style).join('')
    assert.ok(css.includes('var(--dsw-alias-'), 'DSH alias tokens missing from style')
    assert.ok(css.includes('.at-rail'), 'rail styles missing')
    /* The rail is now <nav class="at-rail"><div class="at-rail-list">…,
     * so collect the whole element tree instead of assuming a fixed depth. */
    const all = collectNodes(tree)
    assert.ok(all.some((n) => n.props && n.props.className === 'at-body'))
    assert.ok(all.some((n) => n.props && n.props.className === 'at-rail'))
    const items = all.filter((n) => n.props &&
      /(^|\s)at-rail-item(\s|$)/.test(String(n.props.className || '')))
    assert.equal(items.length, 5)
    assert.ok(all.some((n) => n.props &&
      /(^|\s)(at-panes|at-pane-single)(\s|$)/.test(String(n.props.className || ''))),
      'main area must mount the in-page panes, not a popover')
  })

  /* ------------------------------------------------------ async write path --- */
  {
    const failH = harness(client, { fetchFail: true })
    failH.B.ui({ connected: true })
    const before = failH.B.get().todos.length
    const ok = await failH.B.commit(
      (st) => failH.Core.rules.addTodo(st, { text: '不该落库', projectId: 'p-demo-1', urgency: 'mid' }),
      { method: 'POST', path: '/todos', body: { text: '不该落库' } })
    assert.equal(ok, false, 'failed write must report false')
    assert.equal(failH.B.get().todos.length, before, 'whole-block rollback')
    assert.equal(failH.Core.aliveTodos(failH.B.get()).filter((t) => t.text === '不该落库').length, 0)
    assert.equal(failH.B.get().ui.toast.tone, 'danger')
    assert.equal(failH.fetchCalls.length, 1)
    assert.equal(failH.fetchCalls[0].url, '/agent-todo/api/todos')
    checks.push('bridge: commit rolls back the optimistic state on API failure')
  }
  {
    const okH = harness(client)
    okH.B.ui({ connected: true })
    const before = okH.B.get().todos.length
    const ok = await okH.B.commit(
      (st) => okH.Core.rules.addTodo(st, { text: '成功', projectId: 'p-demo-1', urgency: 'mid' }),
      { method: 'POST', path: '/todos', body: { text: '成功' } })
    assert.equal(ok, true)
    assert.equal(okH.B.get().todos.length, before + 1)
    assert.equal(okH.fetchCalls[0].url, '/agent-todo/api/todos')
    /* Demo mode never touches the network, even for a local mutation. */
    const demoH = harness(client)
    await demoH.B.commit((st) => demoH.Core.rules.toggleTodo(st, 'd-demo-1'),
      { method: 'POST', path: '/todos/d-demo-1/complete', body: {} })
    assert.equal(demoH.fetchCalls.length, 0, 'demo mode must not write')
    assert.equal(demoH.Core.byId(demoH.B.get().todos, 'd-demo-1').done, true)
    checks.push('bridge: commit succeeds through the proxy and stays local in demo mode')
  }
  {
    const treeH = harness(client)
    treeH.B.ui({ connected: true })
    const tree = treeH.Core.initialState().tree['m-demo-1']
    await treeH.B.saveTree('m1', tree)
    await treeH.B.saveTree('m1', tree)
    const puts = treeH.fetchCalls.filter((c) => c.url === '/agent-todo/api/mindmaps/m1/tree')
    assert.equal(puts.length, 2, 'two edits must both be persisted')
    assert.equal(puts[0].init.method, 'PUT')
    assert.equal(JSON.parse(puts[0].init.body).treeJson.id, 'n-root')
    checks.push('bridge: mindmap tree writes use serialised PUT /mindmaps/:id/tree')
  }

  /* ★ v1.12 新增：三栏分层 / 列表收起 / 筛选进右侧，三条一起验。
   * 用户 2026-11-07 第 1–3 条。底色是三档**已登记**值（不新增 HEX），
   * 所以判据只认"值逐字等于 40-ui 那两张表里登记的同一格"，不认具体色号。
   *
   * ⚠️ 两个踩过的坑，别再退回去：
   * ① 必须在**求值后的** AT.desktop.STYLE 上判，不能对着 client.js 源码做正则 ——
   *    那几条规则是 `'.at-root .at-panes{' + triVars(false) + '}'` 拼出来的，
   *    源码里压根不存在 `.at-panes{--at-surface:` 这种连写（v1.12 首版就栽在这）。
   * ② 选择器是 `.at-panes,.at-gl .at-panes{`，中间带逗号，
   *    `\.at-root \.at-panes\{` 也匹配不上。 */
  check('panes v1.12: three-tier background, collapsible list, filter is a floating drawer', () => {
    const dstyle = AT.desktop.STYLE
    const blockOf = (sel) => {
      const i = dstyle.indexOf(sel)
      return i < 0 ? '' : dstyle.slice(i, dstyle.indexOf('}', i) + 1)
    }
    const lightBlock = blockOf('.at-root .at-panes,.at-gl .at-panes{')
    const darkBlock = blockOf('.at-root[data-dark="true"] .at-panes')
    assert.ok(lightBlock.indexOf('--at-surface:') > 0,
      'light: three-tier tokens must be pinned on the panes scope')
    assert.ok(darkBlock.indexOf('--at-surface:') > 0,
      'dark: same pinning must exist for the dark theme')
    /* 逐档比对登记值 —— 这条才是"只用现有令牌"的真正守门人：
     * 谁在 STYLE 里手抄一个相近色号，这里就红。 */
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    for (const tier of ['at-surface', 'at-sunken', 'at-card', 'at-chip']) {
      const pairs = [[AT.ui.LIGHT, lightBlock, 'light'], [AT.ui.DARK, darkBlock, 'dark']]
      for (const [table, scope, name] of pairs) {
        const hit = new RegExp('--' + tier + ':([^;]+);').exec(table || '')
        assert.ok(hit, name + ': tier --' + tier + ' must be registered in 40-ui')
        assert.ok(new RegExp('--' + tier + ':' + esc(hit[1]) + '(;|})').test(scope),
          name + ': --' + tier + ' must reuse the registered value ' + hit[1])
      }
    }
    assert.ok(/\.at-pane-list\{[^}]*background:var\(--at-sunken\)/.test(dstyle),
      'list pane must sit on the sunken tier, not chip (chip↔surface is only Δ6)')
    assert.ok(/\.at-pane-detail\{background:var\(--at-surface\)/.test(dstyle),
      'detail pane must sit on the surface tier')

    /* 列表收起：规则 + 状态真源 + 详情头的那颗键 */
    assert.ok(/\.at-panes:not\(\.is-tight\)\.is-list-collapsed \.at-pane-list\{/.test(dstyle),
      'collapsed rule must exist (and must not fight the tight breakpoint)')
    const wide = Object.assign({}, B.get(), {
      ui: Object.assign({}, B.get().ui, { active: 'project', paneWidth: 1200 })
    })
    const closed = Object.assign({}, wide, {
      ui: Object.assign({}, wide.ui, { listCollapsed: true })
    })
    assert.ok(!String(AT.panes.render(wide).props.className).includes('is-list-collapsed'))
    assert.ok(String(AT.panes.render(closed).props.className).includes('is-list-collapsed'),
      'ui.listCollapsed must reach the panes class list')
    const tight = Object.assign({}, wide, {
      ui: Object.assign({}, wide.ui, { paneWidth: 520, listCollapsed: true })
    })
    assert.ok(!String(AT.panes.render(tight).props.className).includes('is-list-collapsed'),
      'the tight breakpoint owns its own collapse — listCollapsed must not stack on it')

    /* ★ 轮次 6：筛选改成**右侧展开浮层抽屉**（与创建 / 编辑共用 .at-drawer 外壳），
     * 详情区不再被整块替换。判据一律判求值后的渲染树，不判源码子串。 */
    const demoTodo = (wide.todos || [])[0]
    const fstate = Object.assign({}, wide, {
      ui: Object.assign({}, wide.ui, { active: 'todo', filterKind: 'todo',
        todoId: demoTodo ? demoTodo.id : '' })
    })
    const rendered = AT.drawers.render(fstate)
    assert.equal(collectNodes(rendered).filter((n) => n.type === AT.panes.FilterDrawer).length, 1,
      'AT.drawers.render must assemble the filter as a floating drawer')
    const both = Object.assign({}, fstate, {
      ui: Object.assign({}, fstate.ui, { form: { mode: 'todo', id: '', offset: 0 } })
    })
    assert.equal(collectNodes(AT.drawers.render(both))
      .filter((n) => n.type === AT.drawers.FormDrawer).length, 1,
      'form still wins over filter if both are somehow set')
    const fd = AT.panes.FilterDrawer({ s: fstate, kind: 'todo' })
    const fdCls = classNames(fd).join(' ')
    for (const shell of ['at-form-mask', 'at-drawer', 'at-drawer-head',
      'at-drawer-body', 'at-drawer-foot']) {
      assert.ok(new RegExp('\\b' + shell + '\\b').test(fdCls),
        'filter drawer must reuse the shared shell: ' + shell)
    }
    assert.equal(collectNodes(fd).filter((n) => n.type === AT.panes.FilterPanel).length, 1,
      'filter content is mounted exactly once inside the shell')
    const fdText = collectStrings(fd).join(' ')
    assert.ok(fdText.includes('待办筛选'), 'drawer title names the module')
    assert.ok(fdText.includes('关闭'), 'the head uses 关闭, not 取消')
    assert.ok(!fdText.includes('取消'), 'cancel wording would imply the live edits are discarded')
    assert.ok(fdText.includes('清除全部筛选'), 'reset stays in the foot')
    assert.equal(collectNodes(fd).filter((n) =>
      /\bat-sd-submit\b/.test(String((n.props && n.props.className) || ''))).length, 0,
      'instant filters have no submit button')
    /* 旧版内嵌三块骨架连规则体一起删，不留第二套没人用的样式。 */
    for (const dead of ['.at-filter-head{', '.at-filter-body{', '.at-filter-foot{']) {
      assert.ok(!AT.panes.STYLE.includes(dead), 'dead inline skeleton must be gone: ' + dead)
    }
    /* 详情区仍是详情 —— 这是「浮层」与「换内容」的根本区别。 */
    const detail = AT.panes.DetailPane({ s: fstate, kind: 'todo' })
    assert.equal(collectNodes(detail).filter((n) =>
      n.type === AT.panes.FilterPanel || n.type === AT.panes.FilterDrawer).length, 0,
      'the detail slot must no longer be replaced by the filter')
    const detailText = collectStrings(detail).join(' ')
    assert.ok(detailText.includes('所属项目') && detailText.includes('操作') &&
      detailText.includes('待办信息'), 'the todo detail body must still render behind the mask')
    assert.ok(demoTodo && detailText.includes(demoTodo.text),
      'the selected todo is still the one shown in the detail pane')
    assert.ok(!detailText.includes('改动即时生效'),
      'the instant-filter hint belongs to the drawer foot, not the pane head')
    assert.ok(!/at-filter-inline/.test(client), 'the inline filter panel must be gone')
    /* 关键词只有一个真源：`ui.*Filter.kw`（列表头那只框与抽屉第一组读同一格） */
    assert.ok(/var kw = String\(\(s\.ui\[fKey\] \|\| \{\}\)\.kw \|\| ''\)/.test(client),
      'list search must read the shared filter kw, not a local copy')
  })

  /* ★ v1.12 新增：项目 / 待办两个详情按小程序真源重排。
   * 项目三块（基础信息 / 项目待办 / 项目脑图）、待办六区块与三态动作条。 */
  check('details v1.12: project three sections, todo six sections and three-state ops', () => {
    const pj = AT.views.ProjectBody(s0, Core.byId(s0.projects, s0.projects[0].id))
    const pjNodes = collectNodes(pj)
    const pjText = collectStrings(pj).join(' ')
    for (const sec of ['基础信息', '项目待办', '项目脑图']) {
      assert.ok(pjText.includes(sec), 'project section missing: ' + sec)
    }
    /* 四档紧急度键（可点筛选）＋ 只读综合紧急度 */
    assert.equal(pjNodes.filter((n) => String((n.props && n.props.className) || '')
      .split(/\s+/).indexOf('at-pj-urg') >= 0).length, C.URGENCY.length,
    'one key per urgency tier')
    assert.ok(pjText.includes('综合紧急度'))
    /* 脑图卡左简图必须是**现算的 SVG data-URI**，不是空 img */
    const thumb = pjNodes.filter((n) => n.type === 'img' &&
      String((n.props && n.props.className) || '').includes('at-pj-mm-thumb'))
    assert.ok(thumb.length >= 1, 'mindmap card needs the format thumbnail')
    assert.ok(String(thumb[0].props.src).indexOf('data:image/svg+xml') === 0,
      'thumbnail must be the computed SVG, not a placeholder')
    /* 项目概要三数：未完成待办 / 已完成待办 / 项目脑图 */
    for (const lab of ['未完成待办', '已完成待办', '项目脑图']) {
      assert.ok(pjText.includes(lab), 'project summary cell missing: ' + lab)
    }

    const base = s0.todos.filter((t) => !t.deletedAt)
    const openT = Object.assign({}, base.find((t) => !t.done) || base[0], { done: false, deletedAt: null })
    const doneT = Object.assign({}, openT, { done: true })
    const goneT = Object.assign({}, openT, { deletedAt: '2026-11-06 10:00:00' })
    const opCount = (t) => collectNodes(AT.views.TodoBody(
      Object.assign({}, s0, { todos: [t] }), t))
      .filter((n) => String((n.props && n.props.className) || '')
        .split(/\s+/).indexOf('at-tbd-op') >= 0).length
    assert.equal(opCount(openT), 4, 'open todo: 完成 / 导出 / 编辑 / 删除')
    assert.equal(opCount(doneT), 3, 'done todo: 还原 / 导出 / 删除')
    assert.equal(opCount(goneT), 1, 'deleted todo: 还原 only')

    const tbText = collectStrings(AT.views.TodoBody(s0, doneT)).join(' ')
    for (const sec of ['所属项目', '操作', '待办信息', '闪念胶囊', '图片', '关联脑图']) {
      assert.ok(tbText.includes(sec), 'todo section missing: ' + sec)
    }
    /* 第七块（交给 Agent / 写入 DSH）必须整块消失 */
    assert.ok(!tbText.includes('交给 Agent'), 'the Handoff block must be gone from todo detail')
    assert.ok(!tbText.includes('写入 DSH'), 'the DSH handoff button must be gone')
  })

  /* ------------------------------------------------------------ mutations --- */
  check('mutation: breaking planFrom makes the nav judgement go red', () => {
    const anchor = "if (key !== active) return 'switch'"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor, "if (key !== active) return 'refresh'"))
    assert.equal(broken.AT.shell.planFrom('overview', 'todo'), 'refresh')
    assert.notEqual(broken.AT.shell.planFrom('overview', 'todo'),
      AT.shell.planFrom('overview', 'todo'))
  })
  check('mutation: dropping the capsule heading makes the markdown judgement go red', () => {
    const anchor = "var seg = ['---', '', '闪念胶囊', '']"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor, "var seg = ['---', '', '占位', '']"))
    const md = broken.Text.todoToMarkdown({ text: '正文' }, null, { capsules: [{ text: '一句闪念' }] })
    assert.ok(!md.includes('闪念胶囊'))
    assert.ok(Text.todoToMarkdown({ text: '正文' }, null, { capsules: [{ text: '一句闪念' }] })
      .includes('闪念胶囊'))
  })

  check('mutation: turning panes back into a popover makes the layout judgement go red', () => {
    const anchor = "return h('div', { className: 'at-panes' + widthClass(s) },"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor, "return h('div', { className: 'at-popover' + widthClass(s) },"))
    assert.ok(String(AT.panes.render(B.get()).props.className).includes('at-panes'))
    assert.ok(!String(broken.AT.panes.render(broken.B.get()).props.className).includes('at-panes'))
  })
  check('mutation: removing icon prefix logic makes the icon judgement go red', () => {
    const anchor = "return dark ? 'd-' : ''"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor, "return ''"))
    assert.equal(broken.AT.icons.prefixFor('check', '', true), '')
    assert.equal(AT.icons.prefixFor('check', '', true), 'd-')
  })
  check('mutation: dropping the detail pane rule makes the layout CSS judgement go red', () => {
    const anchor = "'.at-pane-detail{flex:1 1 auto;min-width:0}'"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const rule = /['"]\s*\.at-pane-detail\s*\{/
    assert.ok(rule.test(client), 'judgement must be green on the shipping bundle')
    const broken = client.replace(/(['"]\s*)\.at-pane-detail\{/g, '$1.at-pane-gone{')
    assert.ok(!rule.test(broken), 'judgement must go red when the rule is gone')
  })

  /* ★ v1.12 新增两条：给「10 键」与「画布无格式下拉」两条新判据各配一次"确实会红"。 */
  check('mutation: an 11th canvas button makes the ten-button judgement go red', () => {
    const fbCount = (t) => collectNodes(t).filter((n) => n.type === 'button' &&
      String((n.props && n.props.className) || '').split(/\s+/).indexOf('at-mm-fb') >= 0).length
    const mm = Core.byId(s0.mindmaps, 'm-demo-1')
    assert.equal(fbCount(AT.mindmap.Editor({ s: s0, mm: mm })), 10)
    const anchor = "h('div', { className: 'at-mm-float is-bottom' },"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor,
      "h('div', { className: 'at-mm-float is-bottom' }," +
      " h('button', { type: 'button', className: 'at-mm-fb', title: '复制' }),"))
    const bmm = broken.Core.byId(broken.B.get().mindmaps, 'm-demo-1')
    assert.equal(fbCount(broken.AT.mindmap.Editor({ s: broken.B.get(), mm: bmm })), 11,
      'judgement must go red once an extra canvas button exists')
  })

  check('mutation: putting the format selector back makes the drawer-only judgement go red', () => {
    const fmtPicker = (t) => collectNodes(t).filter((n) => n.type === AT.ui.Select &&
      n.props && n.props.label === '脑图格式').length
    const mm = Core.byId(s0.mindmaps, 'm-demo-1')
    assert.equal(fmtPicker(AT.mindmap.Editor({ s: s0, mm: mm })), 0)
    const anchor = "h('div', { className: 'at-mm-canvas' },"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor,
      "h('div', { className: 'at-mm-canvas' }," +
      " h(U.Select, { label: '脑图格式', options: [], value: 'mindmap', onChange: function () {} }),"))
    const bmm = broken.Core.byId(broken.B.get().mindmaps, 'm-demo-1')
    /* ⚠️ 必须用 **broken 自己的** `U.Select` 做身份比较：harness 每次 eval 出一个新模块，
     * `n.type` 是那个模块里的函数引用，拿原版的 `AT.ui.Select` 去比永远不相等（0 ≠ 1）。 */
    const bsel = broken.AT.ui.Select
    const back = collectNodes(broken.AT.mindmap.Editor({ s: broken.B.get(), mm: bmm }))
      .filter((n) => n.type === bsel && n.props && n.props.label === '脑图格式').length
    assert.equal(back, 1,
      'judgement must go red once the format selector is back on the canvas')
  })

  /* ★ v1.12 补三刀：`panes v1.12` / `details v1.12` 这两条新判据原本没有配套变异，
   * 按项目铁律「新判据必配一次确实会红」，各补一条。
   * 三刀都打在**产品代码的规则体**上（不是打在判据自己的正则上），
   * 所以红的是判据、绿回来的是实现。 */
  check('mutation: hardcoding a pane background makes the three-tier judgement go red', () => {
    const pin = (style, sel, tier) => {
      const i = style.indexOf(sel)
      const blk = i < 0 ? '' : style.slice(i, style.indexOf('}', i) + 1)
      const m = new RegExp('--' + tier + ':([^;]+)(;|})').exec(blk)
      return m ? m[1] : ''
    }
    const sel = '.at-root .at-panes,.at-gl .at-panes{'
    const reg = /--at-surface:([^;]+);/.exec(AT.ui.LIGHT)[1]
    assert.equal(pin(AT.desktop.STYLE, sel, 'at-surface'), reg,
      'sanity: the shipping bundle reuses the registered surface value')
    const anchor = "'.at-root .at-panes,.at-gl .at-panes{' + triVars(false) + '}'"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor,
      "'.at-root .at-panes,.at-gl .at-panes{--at-surface:#F0F2F5;--at-card:#FFFFFF;--at-chip:#F1F2F5}'"))
    assert.equal(pin(broken.AT.desktop.STYLE, sel, 'at-surface'), '#F0F2F5')
    assert.notEqual(pin(broken.AT.desktop.STYLE, sel, 'at-surface'), reg,
      'judgement must go red once the surface tier becomes a hand-copied HEX')
  })

  check('mutation: ignoring ui.listCollapsed makes the collapsible-list judgement go red', () => {
    const cls = (ns, A, Bb) => String(A.panes.render(Object.assign({}, Bb.get(), {
      ui: Object.assign({}, Bb.get().ui,
        { active: 'project', paneWidth: 1200, listCollapsed: true })
    })).props.className)
    assert.ok(cls('AT', AT, B).includes('is-list-collapsed'))
    const anchor = "if (s.ui.listCollapsed && !tight) cls += ' is-list-collapsed'"
    assert.ok(client.includes(anchor), 'mutation anchor must hit')
    const broken = harness(client.replace(anchor, "if (s.ui.listCollapsed && !tight) cls += ''"))
    assert.ok(!cls('broken', broken.AT, broken.B).includes('is-list-collapsed'),
      'judgement must go red once the flag never reaches the class list')
  })

  check('mutation: flattening the todo ops makes the three-state judgement go red', () => {
    const opCount = (A, s, t) => collectNodes(A.views.TodoBody(
      Object.assign({}, s, { todos: [t] }), t))
      .filter((n) => String((n.props && n.props.className) || '')
        .split(/\s+/).indexOf('at-tbd-op') >= 0).length
    const base = s0.todos.filter((t) => !t.deletedAt)
    const openT = Object.assign({}, base.find((t) => !t.done) || base[0],
      { done: false, deletedAt: null })
    const goneT = Object.assign({}, openT, { deletedAt: '2026-11-06 10:00:00' })
    assert.equal(opCount(AT, s0, goneT), 1, 'sanity: deleted todo keeps one key')
    const anchor = 'var ops = gone'
    assert.equal(client.split(anchor).length, 2, 'mutation anchor must be unique')
    const broken = harness(client.replace(anchor, 'var ops = false'))
    assert.equal(opCount(broken.AT, broken.B.get(), goneT), 4,
      'judgement must go red once a deleted todo gets the full four-key row')
  })

  check('mutation: dropping the shared shell makes the filter-drawer judgement go red', () => {
    const hasShell = (A, s) => classNames(A.panes.FilterDrawer({ s: s, kind: 'todo' }))
      .some((c) => c.split(/\s+/).indexOf('at-drawer') >= 0)
    const stOf = (Bb) => Object.assign({}, Bb.get(), {
      ui: Object.assign({}, Bb.get().ui, { active: 'todo', filterKind: 'todo' })
    })
    assert.ok(hasShell(AT, stOf(B)), 'sanity: shipping filter is a floating .at-drawer')
    const anchor = "h(U.Dialog, { as: 'section', className: 'at-drawer', role: 'dialog',"
    assert.ok(client.includes(anchor), 'mutation anchor must hit the filter shell')
    const broken = harness(client.replace(anchor,
      "h(U.Dialog, { as: 'section', className: 'at-pane-body', role: 'dialog',"))
    assert.ok(!hasShell(broken.AT, stOf(broken.B)),
      'judgement must go red once the filter stops reusing the right-docked shell')
  })

  console.log(JSON.stringify({
    ok: true,
    checks: checks.length,
    passed: checks,
    clientBytes: Buffer.byteLength(client),
    sources: build.files.length,
    pairingBackup: true,
    currentSourceReverted: true,
  }, null, 2))
}

if (require.main === module) main().catch((err) => {
  console.error('VERIFY_FAILED at check #' + (checks.length + 1))
  console.error(err && err.stack ? err.stack : err)
  process.exitCode = 1
})
module.exports = { harness, collectNodes, collectStrings }
