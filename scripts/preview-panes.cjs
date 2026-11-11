/**
 * 生成「三栏 / 详情 · 对齐预览」静态快照 —— 用来**眼睛验收**层次是否分得开。
 *
 * 为什么要有它：v1.12 把主菜单 / 列表 / 详情改成 surface / chip / card 三档底色，
 * 而"三块背景一个色、边框又很淡"正是用户最初提的第 1 条；真 DSH GUI 里点一遍成本高，
 * 所以这里把**真 DOM**（AT.shell.Workspace）渲染成静态页直接看。
 *
 * 三个"不手抄"，保证它不会漂：
 *   1. 结构：调 `AT.shell.Workspace()`，与真实入口同一个组件树（含左侧主菜单 rail）；
 *   2. 样式：直接取 Workspace 自己那个 `<style>` 节点的文本，
 *      也就是 50-shell.js 第 131–135 行的 `U.themeCss(dark)+U.STYLE+…+AT.desktop.STYLE`；
 *   3. 数据：`AT.bridge` 的 demo 快照（本页**不发任何请求**，不碰生产库）。
 *
 *   node scripts/preview-panes.cjs
 *   → ../../DSH插件/三栏-对齐预览.html      （?dark=1 直接开深色）
 *
 * ⚠️ 这不是真界面验收：hover / 滚动 / ResizeObserver 分档 / 字体回退 / 真实点按全不在里面。
 *   判据在 verify-package.cjs + verify-desktop.cjs，最终仍要按交接文档 §9 过一遍真 GUI。
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const outFile = path.join(root, '..', '..', 'DSH插件', '三栏-对齐预览.html')
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
  if (!AT || !AT.shell || !AT.bridge) throw new Error('AT namespace incomplete')
  return AT
}

const AT = boot()

/* ------------------------------------------------------------ 通用 SSR --- */
/* h() 的产物就是 {type, props, children}；函数组件直接调用即可。
 * 不用真 React：这是**静态快照**，没有状态、没有事件、不需要 hydration。
 * useState 拿到初始值、useEffect 空转 —— 与 capsule 预览页同一套取舍。 */
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

/* 图标是真 <img src="…/assets/icons/xxx.svg">，file:// 下取不到 ⇒ 内联成 data URI。
 * ★ 2026-11-10：顶栏右上角换成横版组合标（`assets/brand-lockup.png`）之后，这里要能
 * 处理 **非 icons 目录** 的素材 —— 先按 icons 找，找不到再回 `assets/` 根。
 * 只影响快照页；产品里仍是 `/agent-todo/assets/...` 那条真路径（由宿主静态服务）。
 * ⚠️ 一律 base64，不按扩展名分 MIME：png 走 image/svg+xml 会渲染不出来（首版就写错过）。 */
const iconCache = new Map()
function inlineIcon(src) {
  if (/^data:/.test(src)) return src
  const name = src.split('/').pop().split('?')[0]
  if (iconCache.has(name)) return iconCache.get(name)
  let file = path.join(iconDir, name)
  let mime = 'image/svg+xml'
  if (!fs.existsSync(file)) {
    const alt = path.join(root, 'assets', name)
    if (fs.existsSync(alt)) {
      file = alt
      mime = /\.png$/i.test(name) ? 'image/png' : /\.jpe?g$/i.test(name) ? 'image/jpeg' : mime
    }
  }
  const uri = fs.existsSync(file)
    ? 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64')
    : src
  iconCache.set(name, uri)
  return uri
}

/* `collectStyle`：把 <style> 节点的正文收出来，正文本身不进 HTML（CSS 单独注入）。 */
function render(node, depth) {
  depth = depth || 0
  if (node == null || node === false || node === true) return ''
  if (depth > 90) return '<!--depth-->'
  if (typeof node === 'string' || typeof node === 'number') return escapeHtml(String(node))
  if (Array.isArray(node)) return node.map((n) => render(n, depth)).join('')
  if (typeof node !== 'object') return ''

  const type = node.type
  const kids = node.children || []
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

  const props = node.props || {}
  const attrs = []
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
  const inner = kids.map((n) => render(n, depth + 1)).join('')
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
/* useDark 是 hook，沙箱里恒 false；setDark 是图标模块自己的状态，
 * 两个一起改才能拿到「深色 CSS + d- 图标」这一整套。改完立刻还原。 */
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
const base = AT.bridge.get()
const P = base.projects[0].id
const T = (base.todos.find((t) => !t.done && !t.deletedAt) || base.todos[0]).id
/* 「已完成待办」那一跳要**自洽**：项目限定 + 只看已完成，所以项目必须取
 * 这条已完成待办自己的 projectId，否则快照会出现「列表 0 条、详情却有一条」的假态。 */
const DONE_T = base.todos.find((t) => t.done && !t.deletedAt) || base.todos[0]
const DONE = DONE_T.id
const PD = DONE_T.projectId || P
const PM = (base.mindmaps.find((m) => m.projectId === P) || base.mindmaps[0]).id
const M = base.mindmaps[0].id
/* 查看层场景用的占位图（data URI，快照不联网）。 */
const PHOTO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0RERTNFQSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIzMCIgcj0iNzAiIGZpbGw9IiNCN0MyQ0YiLz48dGV4dCB4PSI0MDAiIHk9IjM4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGZpbGw9IiM2Qjc2ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='

const SCENES = [
  {
    title: '项目 · 三栏常态',
    desc: '主菜单/详情 surface ｜ 列表 sunken（#EDF0F4，对 surface 最大 Δ10）｜ 卡片 card；分隔线换成 hairline-strong',
    w: 1240, h: 640,
    ui: { active: 'project', projectId: P, paneWidth: 1240 },
  },
  {
    title: '项目 · 列表收起',
    desc: '点详情页左缘那颗「收起」页签，列表整列让出宽度给详情；同一颗变「展开」可原位还原',
    w: 1240, h: 640,
    ui: { active: 'project', projectId: P, paneWidth: 1240, listCollapsed: true },
  },
  {
    title: '待办 · 筛选右侧展开浮层',
    desc: '筛选与创建弹窗共用同一只右侧展开抽屉（460 贴右全高）：遮罩 + 52 头「关闭」+ 即时生效 + 无确定；详情区仍是详情',
    w: 1240, h: 640,
    ui: { active: 'todo', todoId: T, paneWidth: 1240, filterKind: 'todo' },
  },
  {
    title: '待办 · 从项目详情带过来的筛选',
    desc: '项目详情底行「已完成待办」不再另设一条提示带：落地就是 tFilter（已完成 + 限定本项目），工具条显示「筛选 2」，抽屉里对应项亮着（状态是胶囊、所属项目是行组），清除只有「清除全部筛选」',
    w: 1240, h: 640,
    ui: { active: 'todo', todoId: DONE, paneWidth: 1240,
      tFilter: { kw: '', status: 'done', projectId: PD, range: 'all' } },
  },
  {
    title: '待办 · 详情六区块',
    desc: '所属项目 / 操作（三态通栏） / 待办信息 / 闪念胶囊 / 图片 / 关联脑图',
    w: 1240, h: 760,
    ui: { active: 'todo', todoId: T, paneWidth: 1240 },
  },
  {
    title: '待办 · 选择胶囊抽屉',
    desc: '胶囊 / 脑图选择器回到「主抽屉」（与创建 / 编辑 / 筛选同一套外壳）：滚到详情底下点「选择胶囊」也一定看得见；多选 ＋ 底栏「保存」',
    w: 1240, h: 760,
    ui: { active: 'todo', todoId: T, paneWidth: 1240,
      capsulePick: { todoId: T, picked: [] } },
  },
  {
    title: '待办 · 图片查看层',
    desc: '图片格 / 胶囊卡点开后的查看层：暗遮罩 ＋ 白卡 ＋ 右上 ✕ ＋ 底行「上一张 / 下一张」（只有多图才出现）',
    w: 1240, h: 760,
    ui: { active: 'todo', todoId: T, paneWidth: 1240,
      imgView: { title: '图片', index: 0, urls: [PHOTO] } },
  },
  {
    title: '脑图 · 从项目详情带过来的筛选',
    desc: '「查看全部」同理：只写 mFilter.projectId，落地就只看本项目脑图；不再有独立的「限定项目」提示带',
    w: 1240, h: 700,
    ui: { active: 'mindmap', mindmapId: PM, paneWidth: 1240,
      mFilter: { kw: '', projectId: P, format: 'all', range: 'all' } },
  },
  {
    title: '脑图 · 画布两浮条',
    desc: '浮条位置示意：右上撤回·重做‖编辑信息‖展开收起，左下加子·加同级‖删除‖改文本·语音。⚠️ 画布节点布局依赖实测尺寸，此页不保证',
    w: 1240, h: 700,
    ui: { active: 'mindmap', mindmapId: M, paneWidth: 1240 },
  },
  /* ★★ 2026-11-10 轮次 10（用户逐条对参考图）：项目编辑抽屉 与 三处筛选抽屉
   * 之前**没有**快照场景，所以"和小程序差得较大"只能靠真 GUI 才看得出来。
   * 这四条补上：头（标题＋右侧胶囊）/ 体（标签在上、控件在下）/ 底（实心主键）三段
   * 都在这四张里，改样式后先看这里，再进真 GUI。 */
  {
    title: '项目 · 编辑抽屉',
    desc: '标题 + 右上「✕ 取消」胶囊 ／ 名称(必填) · 节点(一排胶囊) · 关联 agent(一行一个，首行不关联) · 项目色(一行一个，色点+名称，占用置灰) · 备注(多行) ／ 底栏单颗实心「保存」',
    w: 1240, h: 640,
    ui: { active: 'project', projectId: P, paneWidth: 1240,
      form: { mode: 'project', id: P, offset: 0, preset: null, scope: null, parent: null } },
  },
  {
    title: '项目 · 筛选抽屉',
    desc: '搜索 ／ 项目状态(chips) ／ 节点(chips wrap) ／ 关联 agent(行组：色点+名称+条数)；项目页没有「更新时间」，与小程序一致',
    w: 1240, h: 640,
    ui: { active: 'project', projectId: P, paneWidth: 1240, filterKind: 'project' },
  },
  {
    title: '未登录 · 概览（默认态）',
    desc: '未登录是**默认态**：顶栏右侧那颗键读作「请登录」（暖黄底 / 深黄字 ＝ 邀请，不是徽章也不是灰掉），点它进登录弹窗；演示数据照旧铺满整页',
    w: 1240, h: 640,
    ui: { active: 'overview', paneWidth: 1240 },
  },
  {
    title: '未登录 · 登录弹窗',
    desc: '弹窗居中：标题 → 一句状态说明 → 小程序码（168 见方、恒白底、居中）→ 两步操作 → 6 位验证码输入 → 「先看看演示数据 / 登录」；未登录打开任何页面都会先弹它',
    w: 1240, h: 760,
    ui: { active: 'todo', todoId: T, paneWidth: 1240, connectOpen: true },
  },
  {
    title: '已登录 · 对照',
    desc: '登录后同一颗键变绿点 + 昵称；点开的弹窗换成账号档（不再出现登录码）',
    w: 1240, h: 640,
    ui: { active: 'overview', paneWidth: 1240, connected: true, user: { nickname: '杜春生' } },
  },
  {
    title: '已登录 · 账号弹窗',
    desc: '同一只弹窗的已登录档：只报"谁连着"＋「退出登录 / 关闭」，登录码与步骤整段撤掉',
    w: 1240, h: 640,
    ui: { active: 'todo', todoId: T, paneWidth: 1240, connected: true, connectOpen: true,
      user: { nickname: '杜春生' } },
  },
  {
    title: '脑图 · 筛选抽屉',
    desc: '搜索 ／ 格式(七档带缩略语，wrap) ／ 所属项目(行组：色点+名称+条数) ／ 更新时间(chips wrap fill)；即时生效、无「确定」',
    w: 1240, h: 640,
    ui: { active: 'mindmap', mindmapId: M, paneWidth: 1240, filterKind: 'mindmap' },
  },
]

/* ⚠️ `B.ui()` 是**合并**写入，不是覆盖 ⇒ 每个场景必须给全量 ui，
 * 否则上一个场景开的开关（listCollapsed / filterKind）会漏到下一个场景。
 * v1.12 首版就因此让「三栏常态」在深色那组里渲染成了收起态。 */
const UI_BASE = {
  active: 'project', projectId: '', todoId: '', mindmapId: '',
  listCollapsed: false, filterKind: null, detailOpen: false, detailUrg: null,
  paneWidth: 1240, drawer: null, form: null, capsule: null, toast: null,
  capsulePick: null, mmPick: null, confirm: null,
  /* 详情内两个查看层（2026-11-10）：同样必须给全量，否则会从上一场景漏过来。 */
  imgView: null, capView: null,
  /* 筛选模型的三个真源也要给全量：轮次 8 的两个「带筛选跳转」场景写的就是它们，
   * 不给默认值会把上一场景的 done / projectId 漏到后面的场景里。 */
  pFilter: { kw: '', status: 'active', node: 'all', agentId: '' },
  tFilter: { kw: '', status: 'open', projectId: '', range: 'all' },
  mFilter: { kw: '', projectId: '', format: 'all', range: 'all' },
  /* 登录状态四件（轮次 12）：同样要全量，否则「已登录」那个对照场景
   * 会把 connected 漏给后面的场景 —— 而它正是登录闸门的总开关。 */
  connected: false, connectOpen: false, connectError: '', connectBusy: false,
  bootReady: true, user: null,
}

function sceneHtml(dark, scene) {
  return withTheme(dark, () => {
    AT.bridge.ui(Object.assign({}, UI_BASE, scene.ui))
    return render(AT.shell.Workspace())
  })
}

/* `node scripts/preview-panes.cjs --only=从项目详情` —— 只出匹配的场景，
 * 落盘到 `../../_shots/preview-scene.html`（不覆盖正式那份全量快照）。
 * 用来给单条改动做"眼睛验收"，不必在一张五千像素的长页里找位置。 */
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7)
const SHOWN = only ? SCENES.filter((sc) => sc.title.indexOf(only) >= 0) : SCENES
if (!SHOWN.length) throw new Error('no preview scene matches --only=' + only)

function buildSet(dark) {
  return SHOWN.map((sc) => {
    const body = sceneHtml(dark, sc)
    return '<div class="pv-cap"><b>' + escapeHtml(sc.title) + '</b><span>' +
      escapeHtml(sc.desc) + '</span></div>' +
      '<div class="pv-win" style="width:' + sc.w + 'px;max-width:100%;height:' + sc.h + 'px">' +
      body + '</div>'
  }).join('\n')
}

/* ---------------------------------------------------------------- 出页 --- */
const PAGE_CSS = `
  body{margin:0;background:#EEF0F4;font:14px/1.5 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#1C1C1E}
  .pv-wrap{max-width:1320px;margin:0 auto;padding:26px 22px 64px}
  .pv-bar{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:20px}
  .pv-bar h1{font-size:17px;font-weight:600;margin:0;flex:0 0 auto}
  .pv-bar p{font-size:12.5px;color:#686C7A;margin:0;flex:1 1 420px;min-width:0;line-height:1.7}
  .pv-bar button{height:32px;padding:0 14px;border-radius:999px;border:1px solid #C7CAD5;
    background:#fff;font:inherit;font-size:13px;cursor:pointer;flex:0 0 auto}
  .pv-cap{display:flex;align-items:baseline;gap:10px;margin:26px 0 10px;flex-wrap:wrap}
  .pv-cap b{font-size:14px;font-weight:600}
  .pv-cap span{font-size:12px;color:#686C7A}
  .pv-win{border-radius:12px;overflow:hidden;border:1px solid #C7CAD5;
    box-shadow:0 6px 20px rgba(28,28,30,.08);background:#F7F8FA;display:flex}
  /* ★★ 2026-11-10：快照层**关掉入场动画与过渡**。抽屉的 at-enter 是 .18s opacity 入场，
   * 无头截图常停在中途 —— 拍出来像"抽屉半透明、底下内容透过来"（实测 backgroundColor 是
   * 纯白 #FFFFFF）。这条只影响快照页，不碰产品 CSS。 */
  .pv-win *{animation:none!important;transition:none!important}
  .pv-win>.at-root{flex:1 1 auto;min-width:0;height:100%;min-height:0}
  .pv-err{color:#C63B2E;font-weight:600}
  .pv-note{font-size:12px;color:#8E91A0;margin-top:12px}
  .pv-set[data-theme="dark"]{display:none}
  body.is-dark{background:#111214;color:#E8E9EC}
  body.is-dark .pv-set[data-theme="light"]{display:none}
  body.is-dark .pv-set[data-theme="dark"]{display:block}
  body.is-dark .pv-cap span,body.is-dark .pv-note,body.is-dark .pv-bar p{color:#9BA0AA}
  body.is-dark .pv-win{border-color:#3A3D42;box-shadow:0 6px 20px rgba(0,0,0,.5)}
  body.is-dark .pv-bar button{background:#202123;border-color:#3A3D42;color:#E8E9EC}
`

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>Agent-ToDo · 三栏与详情对齐预览</title>
<style id="pv-page">${PAGE_CSS}</style>
<style id="pv-css-light">${CSS.light}</style>
<style id="pv-css-dark" disabled>${CSS.dark}</style>
</head><body>
<div class="pv-wrap">
  <div class="pv-bar">
    <h1>Agent-ToDo · 三栏与详情对齐预览</h1>
    <p>结构调 AT.shell.Workspace()、样式取自它自己的 &lt;style&gt;，所以这一页就是真 DOM 的静态快照。
       层次：主菜单/详情 surface ｜ 列表 sunken ｜ 卡片 card ｜ 分隔 hairline-strong。
       ⚠️ 不含 hover / 滚动 / 窗口分档 / 字体回退，不等于真界面验收。</p>
    <button id="pv-toggle" type="button">切到深色</button>
  </div>
  <div class="pv-set" data-theme="light">${buildSet(false)}</div>
  <div class="pv-set" data-theme="dark">${buildSet(true)}</div>
  <p class="pv-note">生成：node scripts/preview-panes.cjs ｜ 判据：node scripts/verify-package.cjs</p>
</div>
<script>
(function () {
  var on = location.search.indexOf('dark=1') >= 0
  var btn = document.getElementById('pv-toggle')
  var light = document.getElementById('pv-css-light')
  var dark = document.getElementById('pv-css-dark')
  function apply() {
    document.body.classList.toggle('is-dark', on)
    light.disabled = on
    dark.disabled = !on
    btn.textContent = on ? '切到浅色' : '切到深色'
  }
  btn.addEventListener('click', function () { on = !on; apply() })
  apply()
})()
</script>
</body></html>`

const target = only ? path.join(root, '..', '..', '_shots', 'preview-scene.html') : outFile
fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)
const errs = (html.match(/class="pv-err"/g) || []).length
console.log(JSON.stringify({
  ok: errs === 0,
  out: target,
  bytes: Buffer.byteLength(html),
  scenes: SHOWN.length * 2,
  renderErrors: errs,
  lightCss: CSS.light.length,
  darkCss: CSS.dark.length,
}, null, 2))
if (errs) process.exitCode = 1
