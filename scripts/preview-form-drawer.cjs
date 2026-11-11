/**
 * 生成「创建待办 / 创建脑图 / 筛选 · 对齐预览」静态快照 —— 用来**眼睛验收**
 * 三只弹窗是不是共用同一只「右侧展开」外壳。
 *
 * 外壳是 DSH 桌面自己的「右侧展开弹窗」（460 贴右全高，用户认可）；
 * 创建 / 编辑的**内部**控件逐项照抄小程序 components/form-drawer 的 .sd PC 档；
 * 筛选（轮次 6）与小程序的 .tf 副弹窗同构：即时生效、无「确定」、标题栏「关闭」。
 *
 * 三个「不手抄」，与三栏 / 胶囊两份快照同一套取舍：
 *   1. 结构：调 `AT.drawers.render(s)`，与真实主面板表单 / 筛选同一个组件树；
 *   2. 样式：取 `AT.shell.Workspace()` 自己那个 `<style>` 的正文
 *      （＝ 50-shell.js 的 U.themeCss + U.STYLE + … + drawers + desktop 全序列）；
 *   3. 数据：`AT.bridge` 的 demo 快照，本页不发请求、不碰生产库。
 *
 *   node scripts/preview-form-drawer.cjs
 *   → ../../DSH插件/创建弹窗-对齐预览.html
 *   ?state=todo-light|todo-dark|map-light|map-dark|filter-light|filter-dark
 *   （旧参数 ?mode=todo|mindmap&dark=1 仍兼容）
 *
 * ⚠️ 不是真界面验收：hover / 输入 / 自动长高 / 真点按 / DSH 宿主暖灰都不在里面。
 *   逐值判据在 verify-standard.cjs（round3-5 锁外壳 / round4 组锁 .sd 内部 /
 *   round6 组锁筛选统一外壳），最终仍要按交接文档 §9 过真 GUI。
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const outFile = path.join(root, '..', '..', 'DSH插件', '创建弹窗-对齐预览.html')
const iconDir = path.join(root, 'assets', 'icons')

/* ---------------------------------------------------------------- 载入产物 --- */
function boot() {
  const source = fs.readFileSync(path.join(root, 'client.js'), 'utf8')
  let loaded = null
  const React = {
    createElement(type, props) {
      return { type: type, props: props || {}, children: [].slice.call(arguments, 2) }
    },
    useState(initial) { return [typeof initial === 'function' ? initial() : initial, function () {}] },
    useEffect() {}, useLayoutEffect() {}, useMemo(fn) { return fn() },
    useRef(value) { return { current: value } },
    useSyncExternalStore(_sub, getSnapshot) { return getSnapshot() },
    Fragment: 'Fragment',
  }
  const makeEl = () => ({
    style: {}, setAttribute() {}, getAttribute() { return null }, remove() {},
    removeChild() {}, appendChild() {}, select() {}, addEventListener() {},
    getContext() { return null },
    getBoundingClientRect() { return { width: 0, height: 0, left: 0, top: 0 } },
    querySelector() { return null }, querySelectorAll() { return [] },
  })
  const document = {
    documentElement: makeEl(), createElement: makeEl,
    head: { appendChild() {} }, body: makeEl(),
    execCommand() { return true }, addEventListener() {}, removeEventListener() {},
  }
  const window = {
    __ModuleLoader__: { load(def) { loaded = def } },
    __AGENT_TODO_TEST__: true,
    addEventListener() {}, removeEventListener() {},
    setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {},
    btoa: (v) => Buffer.from(String(v), 'binary').toString('base64'),
    atob: (v) => Buffer.from(String(v), 'base64').toString('binary'),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  }
  const sandbox = {
    window, document, console, navigator: { clipboard: null },
    fetch: () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ code: 0, data: {} }) }),
    FormData: function () { this.append = function () {} },
    Blob: function () { this.size = 0; this.type = '' },
    setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {},
    requestAnimationFrame() {},
  }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: 'client.js' })
  if (!loaded) throw new Error('client.js must call window.__ModuleLoader__.load')
  loaded.factory(() => React)
  const AT = window.__AGENT_TODO_CORE__
  if (!AT || !AT.shell || !AT.drawers || !AT.bridge) throw new Error('AT namespace incomplete')
  return AT
}
const AT = boot()

/* ------------------------------------------------------------ 通用 SSR --- */
const VOID_TAG = { img: 1, input: 1, br: 1, hr: 1 }
const SKIP_PROP = {
  onClick: 1, onChange: 1, onKeyDown: 1, onPointerDown: 1, onPointerUp: 1,
  onBlur: 1, onFocus: 1, onInput: 1, onSubmit: 1, onMouseDown: 1, onWheel: 1,
  onScroll: 1, onMouseEnter: 1, onMouseLeave: 1, ref: 1, children: 1,
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function styleAttr(style) {
  if (!style || typeof style !== 'object') return ''
  const out = []
  for (const k of Object.keys(style)) {
    const v = style[k]
    if (v == null || v === '') continue
    out.push(k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + v)
  }
  return out.join(';')
}
const iconCache = new Map()
function inlineIcon(src) {
  if (/^data:/.test(src)) return src
  const name = src.split('/').pop().split('?')[0]
  if (iconCache.has(name)) return iconCache.get(name)
  const file = path.join(iconDir, name)
  const uri = fs.existsSync(file)
    ? 'data:image/svg+xml;base64,' + fs.readFileSync(file).toString('base64')
    : src
  iconCache.set(name, uri)
  return uri
}
function render(node, depth) {
  depth = depth || 0
  if (node == null || node === false || node === true) return ''
  if (depth > 90) return '<!--depth-->'
  if (typeof node === 'string' || typeof node === 'number') return escapeHtml(String(node))
  if (Array.isArray(node)) return node.map((n) => render(n, depth)).join('')
  if (typeof node !== 'object') return ''
  const type = node.type, kids = node.children || []
  if (typeof type === 'function') {
    let out
    try {
      out = type(Object.assign({}, node.props, { children: kids.length === 1 ? kids[0] : kids }))
    } catch (err) {
      return '<b class="pv-err">[' + (type.name || 'fn') + '] ' + escapeHtml(err.message) + '</b>'
    }
    return render(out, depth + 1)
  }
  if (typeof type !== 'string') return kids.map((n) => render(n, depth + 1)).join('')
  if (type === 'style') return ''
  const props = node.props || {}, attrs = []
  if (props.className) attrs.push('class="' + escapeHtml(String(props.className)) + '"')
  if (props.src) attrs.push('src="' + inlineIcon(String(props.src)) + '"')
  const css = styleAttr(props.style)
  if (css) attrs.push('style="' + escapeHtml(css) + '"')
  if (props.disabled) attrs.push('disabled')
  for (const k of Object.keys(props)) {
    if (SKIP_PROP[k]) continue
    const v = props[k]
    if (typeof v !== 'string' && typeof v !== 'number') continue
    if (/^(className|src|style)$/.test(k)) continue
    if (!/^[a-z][a-z0-9-]*$/.test(k)) continue
    attrs.push(k + '="' + escapeHtml(String(v)) + '"')
  }
  /* textarea 的 value 是属性，静态 HTML 里要落到内容区才看得见文字。 */
  const inner = type === 'textarea' && props.value
    ? escapeHtml(String(props.value))
    : kids.map((n) => render(n, depth + 1)).join('')
  const head = '<' + type + (attrs.length ? ' ' + attrs.join(' ') : '') + '>'
  return VOID_TAG[type] ? head : head + inner + '</' + type + '>'
}
function findStyleText(node) {
  if (!node || typeof node !== 'object') return ''
  if (Array.isArray(node)) {
    for (const n of node) {
      const hit = findStyleText(n)
      if (hit) return hit
    }
    return ''
  }
  if (node.type === 'style') return (node.children || []).join('')
  return findStyleText(node.children || [])
}

/* ------------------------------------------------------- 主题 / CSS 真源 --- */
function withTheme(dark, fn) {
  const hook = AT.icons.useDark
  AT.icons.useDark = function () { return dark }
  if (AT.icons.setDark) AT.icons.setDark(dark)
  try { return fn() } finally {
    AT.icons.useDark = hook
    if (AT.icons.setDark) AT.icons.setDark(false)
  }
}
const CSS = {
  light: withTheme(false, () => findStyleText(AT.shell.Workspace())),
  dark: withTheme(true, () => findStyleText(AT.shell.Workspace())),
}
if (!CSS.light || !CSS.dark) throw new Error('failed to capture the shell <style> payload')

/* ---------------------------------------------------------------- 场景 --- */
function sceneState(sc) {
  const base = AT.bridge.get()
  const ui = Object.assign({}, base.ui, { form: null, filterKind: null })
  /* ★ 轮次 6：筛选与表单都由 AT.drawers.render 装配，所以快照用同一个入口，
   * 只是把 ui.form 换成 ui.filterKind —— 眼睛能直接比出外壳是不是同一只。 */
  if (sc.filterKind) ui.filterKind = sc.filterKind
  else ui.form = { mode: sc.mode, id: '', offset: 0, scope: {}, preset: {}, draft: null, parent: null }
  return Object.assign({}, base, { ui: ui })
}
const SCENES = [
  { key: 'todo-light', mode: 'todo', dark: false, title: '记一条待办 · 浅色' },
  { key: 'todo-dark', mode: 'todo', dark: true, title: '记一条待办 · 深色' },
  { key: 'map-light', mode: 'mindmap', dark: false, title: '新建脑图 · 浅色' },
  { key: 'map-dark', mode: 'mindmap', dark: true, title: '新建脑图 · 深色' },
  { key: 'filter-light', filterKind: 'todo', dark: false, title: '待办筛选 · 浅色' },
  { key: 'filter-dark', filterKind: 'todo', dark: true, title: '待办筛选 · 深色' },
]
let renderErrors = 0
const bodies = SCENES.map(function (sc) {
  const html = withTheme(sc.dark, function () {
    const out = render(AT.drawers.render(sceneState(sc)))
    if (/pv-err/.test(out)) renderErrors++
    return out
  })
  return { key: sc.key, dark: sc.dark, html: html, title: sc.title,
    filter: !!sc.filterKind }
})

const CHROME = [
  '*{box-sizing:border-box}',
  'body{margin:0;padding:22px 26px 40px;background:#e9e9e4;color:#1c1c1e;',
  'font:14px/1.55 "PingFang SC","Microsoft YaHei",sans-serif}',
  'h1{font-size:19px;margin:0 0 6px}p.pv-lead{margin:0 0 16px;color:#555a6a;font-size:13px}',
  '.pv-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}',
  '.pv-tabs a{padding:6px 12px;border:1px solid #c7cad5;border-radius:999px;',
  'background:#fff;color:#555a6a;text-decoration:none;font-size:13px}',
  '.pv-tabs a.on{background:#1c1c1e;border-color:#1c1c1e;color:#fff}',
  '.pv-note{margin:0 0 12px;font-size:12px;color:#8e91a0}',
  '.pv-stage{position:relative;width:900px;height:660px;overflow:hidden;border:1px solid #c7cad5;',
  'border-radius:12px;background:#f7f8fa}',
  '.pv-rail{position:absolute;left:0;top:0;bottom:0;width:164px;background:#f1f2f5;',
  'border-right:1px solid #e0e2e8;padding:18px 12px;color:#a5a8b5;font-size:12px}',
  '.pv-rail span{display:block;margin-bottom:10px}',
  '.pv-caption{margin:14px 0 0;font-size:12px;color:#555a6a}',
  '.pv-caption b{color:#1c1c1e}',
  '.pv-err{color:#c63b2e}',
  '#at-css{display:none}',
].join('')

const page = '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
  '<title>Agent-ToDo · 弹窗抽屉对齐预览</title>\n<style>' + CHROME + '</style>\n' +
  '<style id="at-css"></style>\n</head>\n<body>\n' +
  '<h1>弹窗抽屉 · 对齐预览</h1>\n' +
  '<p class="pv-lead">三只弹窗共用 DSH 桌面「右侧展开弹窗」（460 贴右全高，用户认可）：' +
  '创建待办 / 创建脑图的内部控件逐项照抄小程序 <code>components/form-drawer</code> 的 ' +
  '<code>.sd</code> PC 档；筛选（轮次 6）也从「详情区换内容」改成同一只浮层，' +
  '与小程序 <code>components/drawer</code> 的 <code>.tf</code> 副弹窗同构。' +
  'CSS 与 DOM 都直接取自插件构建产物，未手抄。</p>\n' +
  '<div class="pv-tabs" id="pv-tabs"></div>\n' +
  '<p class="pv-note">左侧 164px 灰块是宿主导航栏占位；遮罩盖满工作区，抽屉贴右缘全高展开。' +
  '筛选是即时生效：标题栏为「关闭」、底栏没有「确定」，只有「清除全部筛选」。' +
  '本页为静态快照，输入 / hover / 自动长高 / 真点按不在其中。</p>\n' +
  '<div class="pv-stage"><div class="pv-rail"><span>Agent ToDo</span><span>概览</span>' +
  '<span>项目</span><span>待办</span><span>脑图</span><span>我的</span></div>' +
  '<div class="at-root" id="pv-root" style="position:absolute;inset:0;width:100%;height:100%;overflow:hidden">' +
  '<div id="pv-slot"></div></div></div>\n' +
  '<p class="pv-caption" id="pv-caption"></p>\n' +
  '<template id="css-light">' + CSS.light + '</template>\n' +
  '<template id="css-dark">' + CSS.dark + '</template>\n' +
  '<script>\n' +
  'var SCENES = ' + JSON.stringify(bodies) + ';\n' +
  'var CSS = { light: document.getElementById("css-light").innerHTML, dark: document.getElementById("css-dark").innerHTML };\n' +
  'var q = new URLSearchParams(location.search);\n' +
  'var legacy = (q.get("mode") === "mindmap" ? "map" : "todo") + "-" + (q.get("dark") === "1" ? "dark" : "light");\n' +
  'var key = q.get("state") || legacy;\n' +
  'var sc = SCENES.filter(function (x) { return x.key === key; })[0] || SCENES[0];\n' +
  'var dark = !!sc.dark;\n' +
  'document.getElementById("at-css").textContent = dark ? CSS.dark : CSS.light;\n' +
  'document.getElementById("pv-root").setAttribute("data-dark", dark ? "true" : "false");\n' +
  'document.getElementById("pv-slot").innerHTML = sc.html;\n' +
  'document.getElementById("pv-caption").innerHTML = "<b>" + sc.title + "</b>　" +\n' +
  '  (sc.filter ? "与创建弹窗同一只右侧展开外壳 · 52 头「关闭」· 即时生效 · 无确定" :\n' +
  '   "外壳 460 贴右全高 · 52 头 / 56 底 · 内部控件照抄小程序 .sd");\n' +
  'document.getElementById("pv-tabs").innerHTML = SCENES.map(function (x) {\n' +
  '  return "<a class=\\"" + (x.key === key ? "on" : "") + "\\" href=\\"?state=" + x.key +\n' +
  '    "\\">" + x.title + "</a>";\n' +
  '}).join("");\n' +
  '</script>\n</body>\n</html>\n'

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, page, 'utf8')
console.log(JSON.stringify({ ok: renderErrors === 0, out: outFile,
  bytes: Buffer.byteLength(page), scenes: SCENES.length, renderErrors: renderErrors,
  lightCss: CSS.light.length, darkCss: CSS.dark.length }, null, 2))
if (renderErrors) process.exitCode = 1
