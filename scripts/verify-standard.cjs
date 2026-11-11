/**
 * verify-standard.cjs — 《Agent-ToDo-DSH插件-前端标准规范-v1》一致性判据
 *
 * 补齐 §8.9 登记的空白：跨模块反馈值 / hover 换底 / 位移方向 / 焦点环 /
 * 选中态 / 缺失反馈 / 状态类与规则体成对 / 命名成套 / 数值真源与注入序列 /
 * 减少动效 / 专项 A 胶囊与专项 B 导出器的规则体覆盖。
 *
 * 两条铁律：
 *  ① 判「求值产物」——一律取 AT.*.STYLE 等运行时求值后的字符串，不比源码拼接；
 *     只有「命名成套」这类模板断言才读源码文本。
 *  ② 每条判据自带一次「确实会红」的反向变异（assert.throws 捕获）。
 *
 * Run: node scripts/verify-standard.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')

const root = path.join(__dirname, '..')
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')
const srcDir = path.join(root, 'src', 'client')

/* ------------------------------------------------------------------ harness --- */
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
  const document = { createElement: makeEl, head: { appendChild() {} }, body: { appendChild() {} },
    execCommand() { return true }, querySelectorAll() { return [] }, addEventListener() {}, removeEventListener() {} }
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
  vm.runInContext(read('client.js'), sandbox, { filename: 'client.js' })
  assert.ok(loaded, 'client.js must register through __ModuleLoader__')
  loaded.factory(() => React)
  const AT = window.__AGENT_TODO_CORE__
  assert.ok(AT && AT.ui && AT.style && AT.capsule && AT.overlays, 'AT namespace must be exposed')
  /* 轮次 7：把 sandbox 也带出来，判据才能把浏览器版 mindmap-core 跑进**同一个
   * global** —— core 的 linkColor() 与 client 的 layout() 必须读写同一个 window，
   * 否则「深色连线色」这条永远验不到求值产物。 */
  return { AT, window, sandbox }
}

const _loaded = loadAT()
const AT = _loaded.AT
const TEST_SANDBOX = _loaded.sandbox
const srcFiles = fs.readdirSync(srcDir).filter((n) => /^\d\d-[a-z0-9-]+\.js$/.test(n)).sort()
const src = srcFiles.map((n) => fs.readFileSync(path.join(srcDir, n), 'utf8')).join('\n')
/* 按文件留一份原样文本：round13 要判「哪个文件里的哪个组件」，
 * 拼成一整串就分不清归属了；变异也靠它替换单个文件。 */
const srcMap = {}
for (const n of srcFiles) srcMap[n] = fs.readFileSync(path.join(srcDir, n), 'utf8')

/* 收集所有运行时求值后的样式串（不是源码子串）。 */
const cssParts = []
for (const ns of Object.keys(AT)) {
  const o = AT[ns]
  if (!o || typeof o !== 'object') continue
  for (const k of Object.keys(o)) {
    if (typeof o[k] === 'string' && o[k].length > 60 && /(STYLE|CSS)$/.test(k)) cssParts.push(o[k])
  }
}
const css = cssParts.join('\n')
assert.ok(css.length > 20000, 'evaluated stylesheet corpus looks too small: ' + css.length)

const artifacts = { AT, css, src, srcMap }

/* ------------------------------------------------------------------- helpers --- */
/** 粗切规则块：按 } 分段，最后一段 { 之前算选择器。媒体查询的壳会留在 sel 里，
 *  但 :hover / :active / :disabled 的归属不会因此判错。 */
function blocks(style) {
  return style.split('}').map((chunk) => {
    const open = chunk.lastIndexOf('{')
    if (open < 0) return null
    return { sel: chunk.slice(0, open), body: chunk.slice(open + 1) }
  }).filter(Boolean)
}
const hoverBlocks = (style) => blocks(style).filter((b) => /:hover/.test(b.sel))
const activeBlocks = (style) => blocks(style).filter((b) => /:active/.test(b.sel))
/* :disabled 与 :not(:disabled) 要分开：后者是 hover / active 的门控写法，
 * 它的 .82 / .78 属另外两档，混进 disabled 集合会假红。 */
const disabledBlocks = (style) => blocks(style).filter((b) =>
  /:disabled/.test(b.sel) && !/:not\([^)]*:disabled/.test(b.sel))
const hasRule = (style, needle, bodyRe) =>
  blocks(style).some((b) => b.sel.includes(needle) && (!bodyRe || bodyRe.test(b.body)))

/* C-12 登记的锁态 .45：规范明确写「压 .45」，且 v1.5 判据锁死，属已登记豁免。 */
const LOCK_RULE = '.at-cx-map-card.is-lock,.at-cx-map-card:disabled{opacity:.45;cursor:not-allowed}'
const stripExempt = (style) => style.split(LOCK_RULE).join('')

const passed = []
function check(name, predicate, mutant) {
  predicate(artifacts)
  passed.push(name)
  const broken = mutant(artifacts)
  assert.throws(() => predicate(broken), undefined, name + ' — mutation must go red')
  passed.push('mutation: ' + name + ' goes red')
}
const withCss = (a, c) => Object.assign({}, a, { css: c })
const withSrc = (a, s) => Object.assign({}, a, { src: s })
const withAT = (a, at) => Object.assign({}, a, { AT: at })
const withFile = (a, name, content) => {
  const m = Object.assign({}, a.srcMap)
  assert.ok(Object.prototype.hasOwnProperty.call(m, name), 'no such source file: ' + name)
  m[name] = content
  return Object.assign({}, a, { srcMap: m })
}
const swap = (s, from, to) => {
  assert.ok(s.includes(from), 'mutation anchor missing: ' + from.slice(0, 70))
  return s.split(from).join(to)
}

/* 轮次 7：把浏览器 wrapper 版 core 跑进 client 的同一个 sandbox（共享 window）。
 * 只有同一个 global，core 的 linkColor() 才读得到 layout() 下发的主题色。 */
function mindmapCore() {
  if (!TEST_SANDBOX.window.AgentTodoMindmapCore) {
    vm.runInContext(read('assets/mindmap-core.js'), TEST_SANDBOX,
      { filename: 'assets/mindmap-core.js' })
  }
  const core = TEST_SANDBOX.window.AgentTodoMindmapCore
  assert.ok(core && core.layoutOf && core.foldSideOf, 'browser core must expose the layout rules')
  return core
}
function mmTree() {
  let i = 0
  const N = (text, kids, extra) => Object.assign(
    { id: 'n' + (++i), text: text, level: 0, children: kids || [], links: [] }, extra || {})
  /* A 折叠后藏 4 个后代（A1＋A1a/A1b＋A2），但只有 2 个**直接**子节点 ——
     两者数值不同，才能把「后代数」与「直接子节点数」的口径区别验出来。 */
  const t = N('根节点：项目启动', [
    N('一级 A：需求梳理与范围确认',
      [N('A1 访谈', [N('A1a 记录'), N('A1b 复核')]), N('A2 归档')], { collapsed: true }),
    N('一级 B：排期与资源', [N('B1 里程碑'), N('B2 人力')])
  ])
  const lv = (n, d) => { n.level = d; (n.children || []).forEach((c) => lv(c, d + 1)); return n }
  return lv(t, 0)
}
function mmLayout(a, fmt, dark) {
  return a.AT.mindmap.layout(mindmapCore(), mmTree(), fmt, !!dark)
}
const withMMStyle = (a, style) => withAT(a, Object.assign({}, a.AT, {
  mindmap: Object.assign({}, a.AT.mindmap, { STYLE: style })
}))

/* -------------------------------------------------------------------- checks --- */
/* FB-01 三档唯一值 .82 / .78 / .4，过渡 .12s ease。 */
check('standard: hover / active / disabled use the single .82 / .78 / .4 scale',
  (a) => {
    const c = stripExempt(a.css)
    assert.ok(!hoverBlocks(c).some((b) => /opacity:\.(?!82\b)\d/.test(b.body)),
      'hover opacity drift: ' + JSON.stringify(hoverBlocks(c).filter((b) => /opacity:\.(?!82\b)\d/.test(b.body)).map((b) => b.body)))
    assert.ok(!activeBlocks(c).some((b) => /opacity:\.(?!78\b)\d/.test(b.body)), 'active opacity drift')
    assert.ok(!disabledBlocks(c).some((b) => /opacity:\.(?!4\b)\d/.test(b.body)),
      'disabled opacity drift: ' + JSON.stringify(disabledBlocks(c).filter((b) => /opacity:\.(?!4\b)\d/.test(b.body)).map((b) => ({ sel: b.sel.slice(-90), body: b.body }))))
    assert.ok(hoverBlocks(c).some((b) => /opacity:\.82/.test(b.body)), 'no hover feedback at all')
    assert.ok(activeBlocks(c).some((b) => /opacity:\.78/.test(b.body)), 'no active feedback at all')
    assert.ok(disabledBlocks(c).some((b) => /opacity:\.4/.test(b.body)), 'no disabled feedback at all')
    assert.ok(a.AT.ui.FEEDBACK_CSS.includes('.12s ease'), 'feedback transition must be .12s ease')
  },
  (a) => withCss(a, swap(a.css,
    '.at-btn:disabled{opacity:.4;cursor:not-allowed}',
    '.at-btn:disabled{opacity:.55;cursor:not-allowed}')))

/* FB-02 中性键 hover 统一换 --at-chip；实心键不再换 surface / card / solid。 */
check('standard: hover never swaps to --at-surface / --at-card / --at-solid',
  (a) => {
    const bad = hoverBlocks(a.css).filter((b) => /background:var\(--at-(surface|card|solid)\)/.test(b.body))
    assert.equal(bad.length, 0, 'hover background drift: ' + JSON.stringify(bad.map((b) => b.body)))
    assert.ok(hoverBlocks(a.css).some((b) => b.body.includes('background:var(--at-chip)')),
      'neutral keys must hover to --at-chip')
  },
  (a) => withCss(a, swap(a.css,
    '.at-list-row:hover{background:var(--at-chip)}',
    '.at-list-row:hover{background:var(--at-surface)}')))

/* FB-03 位移只向下 1px，且只落在 active。 */
check('standard: press displacement is translateY(1px) and never -1px on hover',
  (a) => {
    assert.ok(!hoverBlocks(a.css).some((b) => b.body.includes('translateY(-1px)')),
      'reverse hover displacement still present')
    assert.ok(activeBlocks(a.css).some((b) => b.body.includes('translateY(1px)')),
      'active must press down 1px')
    assert.ok(!a.css.includes('translateY(-1px)'), 'no -1px displacement anywhere')
  },
  (a) => withCss(a, swap(a.css,
    '.at-cx-fab:active{transform:translateY(1px);opacity:.78}',
    '.at-cx-fab:hover{transform:translateY(-1px);opacity:.78}')))

/* ST-06 焦点环：**非输入控件** 2px + 2px offset 全模块一致；
 * **输入类必须显式关掉外圈**（2026-11-10 轮次 11）——聚焦语言对输入框只留「描边变色」。
 * 为什么要专门判它：`.at-gl :focus-visible` 是 (0,1,1)，组件里写的 `outline:none` 只有
 * (0,1,0)，**天然失效**；不显式用 `:is(...)` 顶到 (0,2,1)，输入框一聚焦就多画一圈 2px 框
 * （用户截图里那个"框里套框"）。这条判据守的就是"那一圈永远不许回来"。 */
check('standard: focus-visible is 2px with 2px offset everywhere, except inputs (off)',
  (a) => {
    const focus = blocks(a.css).filter((b) => b.sel.includes(':focus-visible'))
    const isInputRing = (b) => /:is\(input/.test(b.sel)
    const inputRing = focus.filter(isInputRing)
    const others = focus.filter((b) => !isInputRing(b))
    assert.ok(others.length >= 2, 'focus rules missing in some layers')
    assert.ok(!a.css.includes('outline-offset:1px'), 'legacy 1px offset still present')
    others.forEach((b) => assert.ok(b.body.includes('outline-offset:2px'), 'focus rule: ' + b.body))
    assert.ok(inputRing.length >= 1, 'inputs must switch the outer ring off')
    /* 一条规则两个选择器就够（`.at-root` 与 `.at-gl` 拼在同一个 `{}` 前），
     * 但两个命名空间**缺一不可** —— 浮层不在 `.at-root` 里，只写一个等于没写。 */
    assert.ok(inputRing.some((b) => /\.at-root\s+:is\(input/.test(b.sel)),
      'the in-panel namespace must be covered')
    assert.ok(inputRing.some((b) => /\.at-gl\s+:is\(input/.test(b.sel)),
      'the overlay namespace must be covered')
    inputRing.forEach((b) => {
      assert.ok(b.body.includes('outline:none'), 'input focus ring must be off: ' + b.body)
      assert.ok(!b.body.includes('outline-offset:2px'),
        'an input must never borrow the 2px outer ring: ' + b.body)
    })
  },
  (a) => withCss(a, swap(a.css, 'select):focus-visible{outline:none',
    'select):focus-visible{outline:2px solid var(--at-blue)')))

/* ST-05 选中态统一「黄软底 ＋ 黄描边」；紧急四档 chip 的 inline 三色是登记例外。 */
check('standard: selected controls share yellow-soft fill + yellow outline',
  (a) => {
    const list = ['.at-pane-row.is-on', '.at-filter-chip.is-on', '.at-pick-chip.is-on',
      '.at-seg-item.is-on', '.at-cx-card.is-sel', '.at-cx-map-card.is-on',
      '.at-cx-proj.is-on', '.at-list-tabs .at-seg-item.is-on']
    list.forEach((sel) => {
      assert.ok(hasRule(a.css, sel, /--at-yellow-soft/), sel + ' missing yellow-soft fill')
      assert.ok(hasRule(a.css, sel, /var\(--at-yellow\)/), sel + ' missing yellow outline')
    })
  },
  (a) => withCss(a, swap(a.css,
    '.at-filter-chip.is-on{background:var(--at-yellow-soft);',
    '.at-filter-chip.is-on{background:var(--at-solid);')))

/* FB-04 / FB-05 点名的「相邻类有 hover、自己没有」落点逐个补齐。 */
check('standard: previously missing hover rules are present (FB-04 / FB-05)',
  (a) => {
    const list = ['.at-filter-chip:hover', '.at-pane-row.is-on:hover',
      '.at-pick-chip.is-on:hover',
      '.at-pick-act.is-enhance:hover', '.at-cx-hcancel:hover',
      '.at-cx-edit-imgx,.at-cx-preview-x']
    list.forEach((needle) => assert.ok(hasRule(a.css, needle), needle + ' has no rule body'))
    assert.ok(hasRule(a.css, '.at-cx-edit-imgx,.at-cx-preview-x', /opacity:\.82/),
      'image close keys must carry hover feedback')
  },
  (a) => withCss(a, a.css.split(
    '.at-filter-chip:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}').join('')))

/* FB-18 / N-02 状态类与规则体成对：渲染出来的 is-xxx 必须真有 CSS。 */
check('standard: every declared is-* state has a matching rule body',
  (a) => {
    const states = ['is-lock', 'is-end', 'is-pop', 'is-wait', 'is-fail', 'is-rec', 'is-asr',
      'is-turned', 'is-docked', 'is-dragging', 'is-inside', 'is-del', 'is-sel', 'is-editing',
      'is-on', 'is-pick', 'is-primary', 'is-danger', 'is-dim', 'is-enhance', 'is-home',
      'is-list-collapsed', 'is-tight', 'is-compact', 'is-canvas', 'is-snap', 'is-lit',
      'is-arc', 'is-main', 'is-current', 'is-zero', 'is-hi', 'is-lead', 'is-fill',
      'is-o1', 'is-compose', 'is-todo']
    states.forEach((s) => assert.ok(new RegExp('\\.' + s + '(?=[{,:\\s.])').test(a.css),
      s + ' is rendered but has no CSS rule body'))
  },
  (a) => withCss(a, swap(a.css, '.is-turned', '.is-turnedX')))

/* N-02 / N-03 状态类一律 is-* 前缀，不再用裸 on / danger 语义类。 */
check('standard: state classes use the is-* prefix, not bare on / danger',
  (a) => {
    assert.ok(!a.src.includes("? ' on' : ''"), 'legacy bare .on state class is back')
    assert.ok(!a.src.includes(".at-seg-item.on{"), 'legacy .at-seg-item.on rule is back')
    assert.ok(!a.src.includes("? ' danger' : ''"), 'legacy bare .danger state class is back')
    assert.ok(!a.src.includes('.at-tbd-op.danger{'), 'legacy .at-tbd-op.danger rule is back')
    assert.ok(a.src.includes("? ' is-on' : ''") && a.src.includes("? ' is-danger' : ''"),
      'is-* state classes must be rendered by the templates')
  },
  (a) => withSrc(a, swap(a.src, "? ' is-on' : ''", "? ' on' : ''")))

/* S-03 / D-02 统一反馈层挂在主面板与全局浮层共用的 U.STYLE 上，胶囊层仍从 base 起手。 */
check('standard: FEEDBACK_CSS is part of U.STYLE and all three injection sequences stay intact',
  (a) => {
    assert.ok(a.AT.ui.FEEDBACK_CSS && a.AT.ui.FEEDBACK_CSS.length > 100,
      'feedback baseline missing')
    assert.ok(a.AT.ui.STYLE.includes(a.AT.ui.FEEDBACK_CSS),
      'feedback baseline not injected with U.STYLE')
    assert.ok(a.src.includes('U.themeCss(dark) + U.STYLE + STYLE'), 'main panel sequence changed')
    assert.ok(a.src.includes('U.STYLE + GLOBAL_STYLE'), 'global overlay sequence changed')
    assert.ok(/St\.base\(dark\) \+ STYLE/.test(a.src), 'capsule base(dark) sequence changed')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    ui: Object.assign({}, a.AT.ui, {
      STYLE: a.AT.ui.STYLE.split(a.AT.ui.FEEDBACK_CSS).join('')
    })
  })))

/* FR-03 数值真源 / 色值 / 色板一个未改。 */
check('standard: S / LIGHT / DARK / URGENCY stay the single numeric source of truth',
  (a) => {
    assert.equal(a.AT.style.S.CAPSULE.fab, 40, 'PC rail key must stay 40, not the 56 tablet-portrait key')
    /* 对象来自 vm 沙箱，跨 realm 的 deepStrictEqual 会因原型不同而假红 ⇒ 比 JSON 值。 */
    assert.equal(JSON.stringify(a.AT.style.S.TYPE.size),
      JSON.stringify({ micro: 11, caption: 12, body: 13, text: 14, title: 16, metric: 22 }))
    assert.equal(JSON.stringify(a.AT.style.S.TYPE.weight),
      JSON.stringify({ normal: 400, medium: 500, semibold: 600, bold: 700 }))
    assert.ok(a.AT.ui.LIGHT.includes('--at-sunken:#EDF0F4;'), 'light sunken value changed')
    assert.ok(a.AT.ui.DARK.includes('--at-sunken:#2D2F32;'), 'dark sunken value changed')
    assert.equal(a.AT.const.URGENCY.length, 4, 'urgency palette must stay four levels')
  },
  (a) => {
    const S2 = JSON.parse(JSON.stringify(a.AT.style.S))
    S2.CAPSULE.fab = 56
    return withAT(a, Object.assign({}, a.AT, {
      style: Object.assign({}, a.AT.style, { S: S2 })
    }))
  })

/* FR-05 base(dark) 四层相对顺序未变（判求值产物，不比源码子串）。 */
check('standard: base(dark) keeps theme → host → extra tokens → BASE_CSS',
  (a) => {
    const actual = a.AT.style.base(false)
    const expect = a.AT.ui.themeCss(false) + a.AT.desktop.STYLE +
      a.AT.style.tokensCss(false) + a.AT.style.BASE_CSS
    assert.equal(actual, expect, 'injection order changed')
    assert.ok(a.css.includes('@keyframes atxFade'), 'motion keyframes missing')
  },
  (a) => {
    const expect = a.AT.ui.themeCss(false) + a.AT.desktop.STYLE +
      a.AT.style.tokensCss(false) + a.AT.style.BASE_CSS
    return withAT(a, Object.assign({}, a.AT, {
      style: Object.assign({}, a.AT.style, {
        base: () => a.AT.desktop.STYLE + expect
      })
    }))
  })

/* ST-29 减少动效覆盖到全局浮层根（此前只覆盖 at-root / at-gl / at-cx-root）。 */
check('standard: reduced-motion covers the global overlay root too',
  (a) => {
    assert.ok(a.AT.ui.FEEDBACK_CSS.includes('.at-gl-root'), 'global overlay root not covered')
    assert.ok(a.AT.style.BASE_CSS.includes('prefers-reduced-motion:reduce'))
    assert.ok(a.AT.ui.STYLE.includes('prefers-reduced-motion:reduce'))
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    ui: Object.assign({}, a.AT.ui, {
      FEEDBACK_CSS: a.AT.ui.FEEDBACK_CSS.split('.at-gl-root').join('.at-global-root')
    })
  })))

/* 专项 A 胶囊 / 专项 B 导出器：19 态与面板各落点的规则体都在。 */
check('standard: capsule states and composer-export surfaces all have rule bodies',
  (a) => {
    const list = ['.at-cx-fab.is-rec', '.at-cx-fab.is-asr', '.at-cx-card.is-wait',
      '.at-cx-card.is-fail', '.at-cx-card.is-pop', '.at-cx-drawer.is-turned',
      '.at-cx-ops.is-inside', '.at-cx-sub.is-o1', '.at-cx-vmask', '.at-cx-tail.is-lit',
      '.at-composer-btn', '.at-pick-panel', '.at-pick-chip.is-on', '.at-pick-act.is-enhance',
      '.at-pick-act:disabled', '.at-pick-empty', '.at-pick-foot', '.at-gl-toast.is-danger',
      'max-width:560px']
    list.forEach((n) => assert.ok(a.css.includes(n), n + ' has no evaluated CSS'))
  },
  (a) => withCss(a, a.css.split('.at-pick-panel').join('')))

/* ============================================== round 3 · 2026-11-09 六项界面调整 ===
 * 用户拍板的六项表现层调整。每条判据仍自带一次「确实会红」的反向变异。
 * ★ 一律判求值产物（AT.desktop.STYLE / 组件渲染树 / AT.ui.LIGHT）；
 *   只有「源码门控 / 命名成套」这类才读 a.src。
 * ★★ 抽屉与三栏的令牌规则是运行时拼的，源码里没有 `--at-card:#FFFFFF` 连写，
 *     所以这里全部走 ruleOf(AT.desktop.STYLE, sel) 再比对登记值。
 */
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
function texts(n) {
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(texts).join('')
  if (n && n.children) return n.children.map(texts).join('')
  return ''
}
function stateFor(a, patch) {
  const seed = a.AT.core.initialState()
  const p = patch || {}
  const first = (seed.projects || [])[0]
  const ui = Object.assign({}, seed.ui, { active: 'project', paneWidth: 1200 }, p)
  if (!ui.projectId && first) ui.projectId = first.id
  return Object.assign({}, seed, { ui: ui })
}
function ruleOf(style, sel) {
  const i = style.indexOf(sel)
  return i < 0 ? '' : style.slice(i, style.indexOf('}', i) + 1)
}
function reg(table, name) {
  return (new RegExp('--' + name + ':([^;]+);').exec(table || '') || [])[1]
}
function withDesktop(a, style) {
  return withAT(a, Object.assign({}, a.AT, {
    desktop: Object.assign({}, a.AT.desktop, { STYLE: style })
  }))
}

/* ① 左栏菜单图标：内联 16 viewBox / currentColor / 线宽 1~1.3，不再是彩色 logo。 */
check('round3-1: sidebar icon is an inline currentColor line icon, not the raster logo',
  (a) => {
    const el = a.AT.overlays.SidebarIcon({ size: 18, active: false })
    assert.equal(el.type, 'svg', 'sidebar icon must be inline svg')
    assert.equal(el.props.viewBox, '0 0 16 16', 'host sidebar icons use a 16 viewBox')
    assert.equal(el.props.width, 18, 'host-provided size must be honoured')
    const parts = el.children || []
    assert.ok(parts.length >= 2, 'icon needs a frame and at least one stroke')
    assert.ok(parts.every((n) => n.props.stroke === 'currentColor'),
      'every stroke must follow host label-primary through currentColor')
    assert.ok(parts.every((n) => Number(n.props.strokeWidth) >= 1 && Number(n.props.strokeWidth) <= 1.3),
      'stroke width must stay in the host 1~1.3 band')
    assert.ok(!JSON.stringify(el).includes('img') && !JSON.stringify(el).includes('logo.png'),
      'no raster logo in the DSH left rail')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    overlays: Object.assign({}, a.AT.overlays, {
      SidebarIcon: () => ({ type: 'img', props: { src: '/agent-todo/assets/logo.png' }, children: [] })
    })
  })))

/* ② 列表底色：用户拍板的中间色 #EDF0F4；深色档不动；列表列仍吃 sunken 不吃 chip。 */
check('round3-2: list tier is the confirmed #EDF0F4 mid-tone; dark tier unchanged',
  (a) => {
    assert.ok(a.AT.ui.LIGHT.includes('--at-sunken:#EDF0F4;'), 'user-picked light list colour')
    assert.ok(!a.AT.ui.LIGHT.includes('#E7E9EF'), 'the old too-dark grey must be gone')
    assert.ok(a.AT.ui.DARK.includes('--at-sunken:#2D2F32;'), 'dark tier stays put')
    const d = a.AT.desktop.STYLE
    assert.ok(/\.at-pane-list\{[^}]*background:var\(--at-sunken\)/.test(d),
      'list column must consume sunken, never chip')
    assert.ok(ruleOf(d, '.at-root .at-panes,.at-gl .at-panes{').includes('--at-sunken:#EDF0F4'),
      'pinned panes value must follow the 40-ui registered value')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    ui: Object.assign({}, a.AT.ui, { LIGHT: a.AT.ui.LIGHT.split('#EDF0F4').join('#E7E9EF') })
  })))

/* ③ 只留一个收起入口：列表头那颗及其规则体删除，详情页页签文案只两词。 */
/* ③ 只留一个收起入口 ＋ **键上不再带文字**（2026-11-10 用户第 3 条重写）。
 * 改前这条断言的是「文案恰好是 收起 / 展开」两颗两字胶囊；用户口径变成
 * 「去掉按钮上的『收起』『展开』文字，只保留图标」⇒ 词改由 title / aria-label 承担，
 * 视觉上只剩一枚方向箭头。这条同时锁住方向语义（收起点左、展开点右）。 */
check('round3-3: only one collapse entry — an icon-only key, wording in aria',
  (a) => {
    assert.ok(!a.src.includes('at-list-toggle'), 'list-header twin button / rule is back')
    const s = stateFor(a)
    const list = nodes(a.AT.panes.ListPane({ s: s, kind: 'project' }))
    assert.ok(!list.some((n) => String(n.props.className || '').includes('at-list-toggle')),
      'list header must not render a collapse key')
    const pickTab = (st) => nodes(a.AT.panes.DetailPane({ s: st, kind: 'project' }))
      .find((n) => String(n.props.className || '').includes('at-detail-back'))
    const iconOf = (tab) => (tab.children || [])
      .find((c) => c && c.props && /^chevron-/.test(String(c.props.name)))
    const tab = pickTab(s)
    assert.ok(tab, 'detail tab must exist')
    assert.equal(texts(tab), '', 'the key must carry no visible text anymore')
    assert.equal(String(tab.props.title), '收起', 'the word moves to title')
    assert.equal(String(tab.props['aria-label']), '收起', 'the word moves to aria-label')
    assert.ok(iconOf(tab) && iconOf(tab).props.name === 'chevron-left',
      'open state must point left (collapse)')
    const closed = Object.assign({}, s, { ui: Object.assign({}, s.ui, { listCollapsed: true }) })
    const tab2 = pickTab(closed)
    assert.ok(tab2, 'collapsed state must still render the key')
    assert.equal(texts(tab2), '', 'collapsed key stays icon-only')
    assert.equal(String(tab2.props.title), '展开', 'collapsed wording moves to title')
    assert.ok(iconOf(tab2) && iconOf(tab2).props.name === 'chevron-right',
      'collapsed state must point right (expand)')
    assert.ok(a.src.includes("label: '列表'"), 'tight breakpoint keeps its own 列表 back key')
  },
  (a) => withSrc(a, a.src + '\n/* at-list-toggle */'))

/* ④ 收起键的皮肤（2026-11-10 用户第 3 条重写）：品牌黄方键、32×32 与列表头那颗
 * `+`（`.at-btn` / `.at-icon-btn` 同为 32）同高同排 ⇒「与添加按钮平齐」；
 * 不再是从分隔线上长出来的页签（那条 `border-left:0` + `margin-left:-22px` 已删）。 */
check('round3-4: the collapse key is a brand-yellow tab flush with the column edge',
  (a) => {
    const d = a.AT.desktop.STYLE
    const body = ruleOf(d, '.at-detail-back{')
    assert.ok(body, 'tab rule missing')
    assert.ok(body.includes('width:32px') && body.includes('height:32px'),
      'must be 32×32 so it levels with the list + key')
    assert.ok(body.includes('background:var(--at-yellow)'), 'must wear the brand yellow')
    assert.ok(body.includes('color:var(--at-on-accent)'), 'icon must sit on the yellow in ink')
    /* ★ 2026-11-10 订正（用户原话）：「依旧要左侧 0 圆角且直接贴到左侧边框上」。
     * 上一版做成悬在头行里的 8px 全圆角方键，脱离了列边缘 —— 判据当时只查了
     * `border-radius:8px`，所以没拦住。现在两头都钉：
     *  · 四角圆角里**左侧必须是 0**（`0 8px 8px 0`），不许退回对称 8；
     *  · 负左边距吃掉头行内距（22 / tight 档 16），键左缘与列边界重合。 */
    assert.ok(body.includes('border-radius:0 8px 8px 0'),
      'left edge must be square — it sits on the column border')
    assert.ok(body.includes('margin-left:-22px'),
      'the negative left margin is what glues it to the column edge')
    assert.ok(!body.includes('border-radius:8px'),
      'symmetric 8 radius means it floats inside the head again')
    assert.ok(d.includes('.at-panes.is-tight.show-detail .at-detail-back{display:flex;margin-left:-16px}'),
      'the tight head has a 16px inset — its tab needs the matching -16')
    assert.ok(d.includes('.at-detail-back:hover{opacity:.82}'), 'hover stays on the FB-01 .82 step')
  },
  (a) => withDesktop(a, a.AT.desktop.STYLE.split('background:var(--at-yellow)').join('background:var(--at-card)')))

/* ⑤ 轮次 5：用户明确「右侧展开弹窗我没意见，问题是弹窗内的展示」——
 * 外壳几何由桌面层独家拥有（460 贴右全高），内部控件皮肤只在 90-drawers.js。 */
check('round3-5: desktop layer owns only the right-docked shell geometry',
  (a) => {
    const d = a.AT.desktop.STYLE
    const shell = ruleOf(d, '.at-drawer,.at-drawer.o1,.at-drawer.o2{')
    assert.ok(shell, 'right-docked shell rule missing')
    assert.ok(shell.includes('left:auto') && shell.includes('right:0'), 'shell must be flush right')
    assert.ok(shell.includes('top:0') && shell.includes('bottom:0'), 'shell must be full height')
    assert.ok(shell.includes('width:min(460px,100%)'), 'the confirmed 460 right-docked width')
    assert.ok(shell.includes('border-radius:0'), 'no outer radius on the right-docked shell')
    assert.ok(shell.includes('z-index:55'), 'drawer layer stays lifted')
    assert.ok(d.includes('.at-form-mask{z-index:54;background:var(--at-mask)}'),
      'mask layer stays lifted')
    /* 桌面层不许再写 head / body / foot 皮肤 —— 只有一个真源。 */
    assert.ok(!d.includes('.at-drawer-head{'), 'head skin belongs to 90-drawers')
    assert.ok(!d.includes('padding:12px 14px 0'), 'body skin belongs to 90-drawers')
    assert.ok(!d.includes('.at-drawer-foot{'), 'foot skin belongs to 90-drawers')
    const light = ruleOf(d, '.at-root .at-drawer{')
    const dark = ruleOf(d, '.at-root[data-dark="true"] .at-drawer{')
    for (const n of ['at-card', 'at-elevated', 'at-head-bg', 'at-hairline', 'at-head-line',
      'at-solid', 'at-on-solid', 'at-yellow', 'at-yellow-soft', 'at-chip', 'at-mask']) {
      assert.ok(light.includes('--' + n + ':' + reg(a.AT.ui.LIGHT, n)), 'light ' + n)
      assert.ok(dark.includes('--' + n + ':' +
        (reg(a.AT.ui.DARK, n) || reg(a.AT.ui.LIGHT, n))), 'dark ' + n)
    }
  },
  (a) => withDesktop(a, a.AT.desktop.STYLE.split('width:min(460px,100%)').join('width:320px')))

/* ⑥ 项目详情两颗新建键：文字前补 plus（小程序 .tb-btn 的 13px 图标口径）。 */
check('round3-6: project detail new buttons carry a plus icon before the label',
  (a) => {
    const s = stateFor(a)
    const tree = a.AT.panes.DetailPane({ s: s, kind: 'project' })
    const btns = nodes(tree).filter((n) => n.type === a.AT.ui.Btn &&
      ['新建待办', '新建脑图'].indexOf(texts(n)) >= 0)
    assert.equal(btns.length, 2, 'both project new buttons must render')
    btns.forEach((b) => {
      assert.equal(b.children[0].type, a.AT.ui.Icon, 'icon must come first')
      assert.equal(b.children[0].props.name, 'plus', 'icon must be plus')
      assert.equal(b.children[0].props.size, 13, '.tb-btn uses a 13px icon')
    })
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    panes: Object.assign({}, a.AT.panes, {
      DetailPane: function (props) {
        const tree = a.AT.panes.DetailPane(props)
        nodes(tree).forEach((n) => {
          if (n.type === a.AT.ui.Btn && n.children && n.children.length) {
            n.children = n.children.filter((c) => !(c && c.type === a.AT.ui.Icon))
          }
        })
        return tree
      }
    })
  })))

/* ⑦ 主面板表单打开时收起胶囊 FAB / 写键 / 底衬（z150 / z149 会盖住 z55 的底键）。 */
check('round3-7: main-panel form hides the capsule FAB / write / dockplate rail',
  (a) => {
    const B = a.AT.bridge
    assert.ok(B && B.get && B.ui, 'bridge must be available for the render-level check')
    const cap = { open: true, selected: [], delMode: false, multi: false,
      composeOpen: false, editId: '', todoPick: false, mapPick: false, phase: '', clock: '' }
    const rail = (tree) => nodes(tree).filter((n) =>
      /\bat-cx-fab\b|\bat-cx-write\b|\bat-cx-dockplate\b/.test(String(n.props.className || '')))
    B.ui({ capsule: cap, form: null })
    assert.ok(rail(a.AT.capsule.FloatingCapsule()).length > 0, 'FAB must show with no form open')
    B.ui({ form: { mode: 'todo', id: '', offset: 0 } })
    assert.equal(rail(a.AT.capsule.FloatingCapsule()).length, 0,
      'form drawer is z55 — the z150 / z149 floating pair must be hidden')
    B.ui({ form: null })
    assert.ok(rail(a.AT.capsule.FloatingCapsule()).length > 0, 'closing the form restores the rail')
    assert.ok(a.src.includes('!!(s.ui && s.ui.form)'), 'one single source of truth for the form gate')
    assert.ok(a.src.includes('c.todoPick || c.mapPick || c.composeOpen || c.editId'),
      'the four capsule sub-drawer gates must remain')
  },
  (a) => withSrc(a, swap(a.src, '!!(s.ui && s.ui.form)', 'false')))

/* ============================ round 4 · 2026-11-09 创建弹窗结构级照抄 .sd ===
 * 用户口径「好好看看小程序的创建弹窗中的样式」：上一轮只改了数值，控件形态没动。
 * 这一组判据全部**现读小程序真源**（form-drawer.wxss / utils/formats.js /
 * utils/forms.js），逐值比对插件求值产物与渲染树，防止再次漂移。
 */
const MP_ROOT = path.resolve(__dirname, '..', '..', '..')
const mpWxss = fs.readFileSync(
  path.join(MP_ROOT, '小程序前端/components/form-drawer/form-drawer.wxss'), 'utf8')
const mpWxml = fs.readFileSync(
  path.join(MP_ROOT, '小程序前端/components/form-drawer/form-drawer.wxml'), 'utf8')
const mpForms = fs.readFileSync(path.join(MP_ROOT, '小程序前端/utils/forms.js'), 'utf8')
const mpFormats = require(path.join(MP_ROOT, '小程序前端/utils/formats.js'))
/* ⚠️ wxss 的规则体里夹着大段注释（`.sd-area-box` 那段甚至含 `{{areaH}}`），
 * 先把注释字符换成空格但**保留换行**，再要求选择器出现在行首：
 *   ① `[^}]*` 不会被注释里的花括号截断；
 *   ② 不会误命中 `.sd-row.on .sd-row-t{`（那是选中态的一行，不是基态）。 */
const mpCss = mpWxss.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
function mpRule(sel) {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp('(?:^|\\n)[ \\t]*' + esc + '[ \\t]*\\{([^}]*)\\}').exec(mpCss)
  return m ? m[1] : ''
}
function mpVal(sel, prop) {
  const m = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+);').exec(mpRule(sel))
  return m ? m[1].trim() : ''
}
function withDrawers(a, patch) {
  return withAT(a, Object.assign({}, a.AT, {
    drawers: Object.assign({}, a.AT.drawers, patch)
  }))
}
function formState(a, mode, id, preset) {
  const s = stateFor(a)
  const f = { mode: mode, id: id || '', offset: 0, scope: {}, preset: preset || {},
    draft: null, parent: null }
  return Object.assign({}, s, { ui: Object.assign({}, s.ui, { form: f }) })
}
function formTree(a, mode) {
  return a.AT.drawers.FormDrawer({ s: formState(a, mode) })
}
function breakTree(a, mut) {
  return withDrawers(a, { FormDrawer: function (p) { return mut(a.AT.drawers.FormDrawer(p)) } })
}
const byClass = (tree, cls) => nodes(tree).filter((n) =>
  String(n.props.className || '').split(/\s+/).indexOf(cls) >= 0)

/* ① 逐值照抄：插件 .sd 皮肤的每个尺寸/字号/圆角/内距都等于 wxss 当前值。 */
check('round4-1: every .sd skin value equals the live mini-program wxss value',
  (a) => {
    const sd = a.AT.drawers.STYLE
    /* 外壳几何（.sd 的 320 宽 / 16 圆角）**不照抄**：用户认可的是 DSH 桌面自己的
     * 「右侧展开弹窗」，由 round3-5 锁在 85-desktop.js。这一组只比弹窗内的控件皮肤。 */
    const SKIN = [
      ['.sd-head', '.at-drawer-head{', ['height', 'padding']],
      ['.sd-title', '.at-drawer-title{', ['font-size', 'font-weight']],
      ['.sd-cancel', '.at-drawer .at-sd-cancel{', ['height', 'padding', 'border-radius', 'font-size', 'gap']],
      ['.sd-body', '.at-drawer-body{', ['padding']],
      ['.sd-field', '.at-drawer .at-sd-field{', ['gap', 'margin-bottom']],
      ['.sd-label', '.at-drawer .at-sd-label{', ['font-size', 'font-weight']],
      ['.sd-req, .sd-opt', '.at-drawer .at-sd-req', ['font-size', 'margin-left', 'padding']],
      ['.sd-input', '.at-drawer .at-sd-input{', ['height', 'border-radius', 'padding', 'font-size']],
      ['.sd-area-box', '.at-drawer .at-sd-area-box{', ['border-radius', 'padding']],
      ['.sd-chips', '.at-drawer .at-sd-chips{', ['gap']],
      ['.sd-chip', '.at-drawer .at-sd-chip{', ['padding', 'border-radius', 'font-size', 'gap']],
      ['.sd-list', '.at-drawer .at-sd-list{', ['gap']],
      ['.sd-row', '.at-drawer .at-sd-row{', ['height', 'padding', 'border-radius', 'gap']],
      ['.sd-row.fmt', '.at-drawer .at-sd-row.fmt{', ['height']],
      ['.sd-fthumb', '.at-drawer .at-sd-fthumb{', ['width', 'height', 'border-radius']],
      ['.sd-row-t', '.at-drawer .at-sd-row-t{', ['font-size', 'line-height']],
      ['.sd-foot', '.at-drawer-foot{', ['height', 'padding', 'gap']],
      ['.sd-submit', '.at-drawer .at-sd-submit{', ['height', 'border-radius', 'font-size', 'gap']]
    ]
    SKIN.forEach(function (row) {
      const body = ruleOf(sd, row[1])
      assert.ok(body, 'plugin rule missing: ' + row[1])
      row[2].forEach(function (prop) {
        const v = mpVal(row[0], prop)
        assert.ok(v, 'mini-program value missing: ' + row[0] + ' / ' + prop)
        assert.ok(body.includes(prop + ':' + v),
          row[1] + ' must carry ' + prop + ':' + v + ' from ' + row[0])
      })
    })
    /* 外壳几何不照抄 .sd：90 只给非桌面基础值，最终几何由桌面层覆盖为右侧展开。 */
    assert.ok(ruleOf(sd, '.at-form-mask{').includes('inset:0'),
      'mask covers the whole workspace under the right-docked shell')
    assert.ok(ruleOf(sd, '.at-drawer{').includes('left:84px'), 'fallback geometry is the .sd base')
    assert.ok(ruleOf(sd, '.at-drawer.o1{').includes('left:354px'))
    assert.ok(ruleOf(sd, '.at-drawer.o2{').includes('left:624px'))
    assert.ok(!sd.includes('calc(var(--at-rail-w)'),
      'rail-derived .sd geometry must not become the desktop shell truth')
    /* wxml 侧：确认小程序底栏确实只有一颗 submit、取消在标题栏。 */
    assert.ok(/<view class="sd-cancel"[\s\S]{0,200}<text>取消<\/text>/.test(mpWxml),
      'mini-program cancel really lives in the head')
    assert.ok(/<view wx:else class="sd-submit/.test(mpWxml), 'mini-program foot has one submit')
  },
  (a) => withDrawers(a, { STYLE: swap(a.AT.drawers.STYLE, 'height:52px', 'height:60px') }))

/* ② 六张格式缩略图与小程序 formats.list() 逐字节相同；深色三色取 theme.js。 */
check('round4-2: six format thumbs are byte-identical to the mini-program generator',
  (a) => {
    const light = a.AT.drawers.formatThumbs(false)
    const dark = a.AT.drawers.formatThumbs(true)
    const list = mpFormats.list()
    assert.equal(list.length, 6, 'mini-program format catalogue must stay six')
    assert.equal(Object.keys(light).length, 6, 'plugin must generate all six')
    list.forEach(function (f) {
      assert.equal(light[f.key], f.thumb, f.key + ' thumb drifted from formats.js')
      assert.notEqual(dark[f.key], light[f.key], f.key + ' must follow the theme')
    })
    const dl = decodeURIComponent(dark.mindmap), ll = decodeURIComponent(light.mindmap)
    ;['#858783', '#EEEDEA', '#202123'].forEach((c) => assert.ok(dl.includes(c), 'dark ' + c))
    ;['#C7CAD5', '#1C1C1E', '#FFFFFF'].forEach((c) => assert.ok(ll.includes(c), 'light ' + c))
  },
  (a) => withDrawers(a, { formatThumbs: () => ({}) }))

/* ③ 创建待办：三个 .sd 字段、四档 chips、一行一个项目、自动长高正文、无下拉。 */
check('round4-3: create-todo renders .sd chips / project rows / growing area, no select',
  (a) => {
    const tree = formTree(a, 'todo')
    const all = nodes(tree)
    const fields = byClass(tree, 'at-sd-field')
    assert.equal(fields.length, 3, 'exactly three fields')
    assert.deepEqual(fields.map((n) => texts(n.children[0]).replace('必填', '')),
      ['待办内容', '紧急程度', '归属项目'], 'field labels follow form-drawer.wxml')
    const chips = byClass(tree, 'at-sd-chip')
    assert.equal(chips.length, 4, 'four urgency chips, not a <select>')
    assert.equal(chips.filter((n) => String(n.props.className).includes('is-on')).length, 1,
      'exactly one urgency selected')
    const on = chips.find((n) => String(n.props.className).includes('is-on'))
    assert.equal(on.props.style.background, '#FDF3E2', 'selected chip uses its own soft tone')
    const area = byClass(tree, 'at-sd-area-in')[0]
    assert.ok(area && area.type === 'textarea' &&
      area.props.placeholder === '用一句话说清要做什么', '.sd-area-in must be the growing box')
    const rows = byClass(tree, 'at-sd-row')
    assert.ok(rows.length >= 2, 'one row per project + the add-project row')
    assert.ok(byClass(tree, 'at-sd-cdot').length >= 1, 'each project row carries a 16px colour dot')
    assert.equal(byClass(tree, 'add').length, 1, 'nested project creation is preserved')
    assert.ok(!all.some((n) => n.type === 'select' || n.type === a.AT.ui.Select),
      'no native select is left in the create-todo form')
    assert.ok(!a.src.includes("h(U.Select, { label: '紧急程度'"), 'urgency select is gone')
  },
  (a) => breakTree(a, (t) => {
    const box = byClass(t, 'at-sd-chips')[0]
    box.children.pop()
    return t
  }))

/* ④ 创建脑图：名称输入 / 项目行 / 六行带 48×34 缩略图的格式行。 */
check('round4-4: create-mindmap renders six .sd-row.fmt rows with generated thumbs',
  (a) => {
    const tree = formTree(a, 'mindmap')
    assert.equal(byClass(tree, 'at-sd-field').length, 3, 'name / project / format')
    assert.ok(byClass(tree, 'at-sd-input').length === 1, 'name is a 38px .sd-input')
    const fmt = byClass(tree, 'fmt')
    assert.equal(fmt.length, 6, 'all six formats are rows')
    fmt.forEach(function (row) {
      const img = nodes(row).find((n) => String(n.props.className || '') === 'at-sd-fthumb')
      assert.ok(img && String(img.props.src).startsWith('data:image/svg+xml,'),
        'each format row needs its structure thumbnail')
    })
    assert.equal(byClass(tree, 'add').length, 0, 'mindmap form has no add-project entry')
    assert.ok(!nodes(tree).some((n) => n.type === 'select' || n.type === a.AT.ui.Select),
      'no native select in the create-mindmap form')
    assert.ok(!a.src.includes("h(U.Select, { label: '格式'"), 'format select is gone')
  },
  (a) => breakTree(a, (t) => {
    const row = byClass(t, 'fmt')[0]
    row.children = row.children.filter((n) => !(n && String(n.props.className || '') === 'at-sd-fthumb'))
    return t
  }))

/* ⑤ 壳：取消胶囊在标题栏、底栏只有一颗 w-check 实心主键（两种模式都一样）。 */
check('round4-5: cancel pill sits in the head; foot holds one w-check submit',
  (a) => {
    ['todo', 'mindmap'].forEach(function (mode) {
      const tree = formTree(a, mode)
      const head = byClass(tree, 'at-drawer-head')[0]
      const foot = byClass(tree, 'at-drawer-foot')[0]
      assert.ok(head && foot, mode + ' head / foot must exist')
      assert.equal(byClass(head, 'at-sd-cancel').length, 1, mode + ' cancel pill in head')
      assert.equal(texts(byClass(head, 'at-sd-cancel')[0]), '取消', mode + ' cancel copy')
      assert.equal(byClass(foot, 'at-sd-cancel').length, 0, mode + ' cancel must not be in foot')
      const subs = byClass(foot, 'at-sd-submit')
      assert.equal(subs.length, 1, mode + ' foot must hold exactly one primary key')
      assert.equal(nodes(foot).filter((n) => n.type === 'button').length, 1,
        mode + ' foot must not hold a second white key')
      const ico = nodes(subs[0]).find((n) => n.type === a.AT.ui.Icon)
      assert.ok(ico && ico.props.name === 'w-check' && ico.props.size === 15,
        mode + ' submit icon is w-check 15')
    })
  },
  (a) => breakTree(a, (t) => {
    byClass(t, 'at-sd-cancel').forEach((n) => { n.props.className = 'at-sd-cancelX' })
    return t
  }))

/* ⑥ 文案：标题 / 提交按钮与小程序 utils/forms.js 逐字一致。 */
check('round4-6: create-form titles and submit labels match utils/forms.js',
  (a) => {
    assert.ok(mpForms.includes("'记一条待办'") && mpForms.includes("'保存待办'"),
      'forms.js todo copy')
    assert.ok(mpForms.includes("'新建脑图'") && mpForms.includes("'创建脑图'"),
      'forms.js mindmap copy')
    const todo = formTree(a, 'todo'), map = formTree(a, 'mindmap')
    assert.equal(texts(byClass(todo, 'at-drawer-title')[0]), '记一条待办')
    assert.equal(texts(byClass(map, 'at-drawer-title')[0]), '新建脑图')
    assert.equal(texts(byClass(todo, 'at-sd-submit')[0]), '保存待办')
    assert.equal(texts(byClass(map, 'at-sd-submit')[0]), '创建脑图')
    assert.ok(a.src.includes("todo: { title: '记一条待办'"), 'plugin dictionary keeps the copy')
  },
  (a) => withSrc(a, swap(a.src, "todo: { title: '记一条待办'", "todo: { title: '新建待办'")))

/* ============================ round 6 · 2026-11-09 筛选统一成右侧展开浮层 ===
 * 用户口径「筛选模块也需要按这种方式展示」：此前筛选是把详情区整块换掉，
 * 不是弹窗抽屉。这一组现读小程序 components/drawer 的 .tf 副弹窗真源，
 * 逐值比皮肤、判渲染树、锁三条关闭通道与联动，防止再次退回内嵌。
 */
const tfWxss = fs.readFileSync(
  path.join(MP_ROOT, '小程序前端/components/drawer/drawer.wxss'), 'utf8')
const tfWxml = fs.readFileSync(
  path.join(MP_ROOT, '小程序前端/components/drawer/drawer.wxml'), 'utf8')
/* 与 mpCss 同法：注释字符换成空格但保留换行，规则体不被注释里的花括号截断。 */
const tfCss = tfWxss.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
function tfVal(sel, prop) {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp('(?:^|\\n)[ \\t]*' + esc + '[ \\t]*\\{([^}]*)\\}').exec(tfCss)
  const p = new RegExp('(?:^|;)\\s*' + prop + '\\s*:\\s*([^;]+);').exec(m ? m[1] : '')
  return p ? p[1].trim() : ''
}
function filterState(a, kind) {
  const seed = a.AT.core.initialState()
  const first = (list) => (list || [])[0]
  return stateFor(a, {
    active: kind, filterKind: kind,
    projectId: (first(seed.projects) || {}).id || '',
    todoId: (first(seed.todos) || {}).id || '',
    mindmapId: (first(seed.mindmaps) || {}).id || ''
  })
}

/* ① 筛选复用唯一一套右侧展开外壳；panes 里不许出现第二份几何或旧骨架。 */
check('round6-1: filter reuses the one right-docked shell, no second geometry',
  (a) => {
    const fd = a.AT.panes.FilterDrawer({ s: filterState(a, 'todo'), kind: 'todo' })
    const cls = nodes(fd).map((n) => String(n.props.className || '')).join(' ')
    for (const shell of ['at-form-mask', 'at-drawer', 'at-drawer-head',
      'at-drawer-body', 'at-drawer-foot']) {
      assert.ok(new RegExp('\\b' + shell + '\\b').test(cls), 'shared shell missing: ' + shell)
    }
    const panes = a.AT.panes.STYLE
    for (const dead of ['.at-filter-head{', '.at-filter-body{', '.at-filter-foot{']) {
      assert.ok(!panes.includes(dead), 'dead inline skeleton: ' + dead)
    }
    assert.ok(!panes.includes('width:min(460px') && !panes.includes('right:0;top:0;bottom:0'),
      'panes must not own a second copy of the right-docked geometry')
    const shellRule = ruleOf(a.AT.desktop.STYLE, '.at-drawer,.at-drawer.o1,.at-drawer.o2{')
    assert.ok(shellRule.includes('width:min(460px,100%)') && shellRule.includes('right:0') &&
      shellRule.includes('bottom:0') && shellRule.includes('border-radius:0'),
      'the shared right-docked geometry must stay in the desktop layer')
  },
  (a) => withDesktop(a, swap(a.AT.desktop.STYLE, 'width:min(460px,100%)', 'width:320px')))

/* ② 头 / 关闭键逐值等于小程序 .tf；文案「关闭」不是「取消」；没有确定键。 */
check('round6-2: filter head/close values equal the live mini-program .tf spec',
  (a) => {
    const sd = a.AT.drawers.STYLE
    const SKIN = [
      ['.tf-head', '.at-drawer-head{', ['height', 'padding']],
      ['.tf-title', '.at-drawer-title{', ['font-size', 'font-weight']],
      ['.tf-close', '.at-drawer .at-sd-cancel{', ['height', 'padding', 'border-radius', 'font-size', 'gap']]
    ]
    SKIN.forEach(function (row) {
      const body = ruleOf(sd, row[1])
      assert.ok(body, 'plugin rule missing: ' + row[1])
      row[2].forEach(function (prop) {
        const v = tfVal(row[0], prop)
        assert.ok(v, 'mini-program value missing: ' + row[0] + ' / ' + prop)
        assert.ok(body.includes(prop + ':' + v), row[1] + ' must carry ' + prop + ':' + v)
      })
    })
    assert.ok(/<view class="tf-close"[\s\S]{0,300}<text>关闭<\/text>/.test(tfWxml),
      'mini-program filter head really says 关闭')
    assert.ok(tfWxml.includes('「取消」会读作'),
      'the mini-program documents why 取消 is wrong for instant filters')
    assert.ok(tfWxml.includes('清除全部筛选'), 'mini-program reset copy')
    assert.ok(!/\.tf-submit\{/.test(tfCss), 'mini-program filter has no submit rule')
    const fd = a.AT.panes.FilterDrawer({ s: filterState(a, 'todo'), kind: 'todo' })
    const t = texts(fd)
    assert.ok(t.includes('关闭') && !t.includes('取消'), 'plugin head says 关闭, never 取消')
    assert.ok(t.includes('清除全部筛选'), 'plugin keeps reset')
    assert.equal(byClass(fd, 'at-sd-submit').length, 0, 'no submit button on an instant filter')
    assert.ok(a.src.includes("opacity: .65 }), '关闭'"),
      'the shipping head must literally say 关闭')
  },
  (a) => withSrc(a, swap(a.src, "opacity: .65 }), '关闭'", "opacity: .65 }), '取消'")))

/* ③ 详情区仍是详情；render() 把筛选装成浮层，form 优先。 */
check('round6-3: detail pane keeps its content; render() assembles the filter as an overlay',
  (a) => {
    const s = filterState(a, 'todo')
    assert.equal(nodes(a.AT.drawers.render(s))
      .filter((n) => n.type === a.AT.panes.FilterDrawer).length, 1,
      'filter is assembled as an overlay, not inside the detail pane')
    const both = Object.assign({}, s, { ui: Object.assign({}, s.ui,
      { form: { mode: 'todo', id: '', offset: 0 } }) })
    assert.equal(nodes(a.AT.drawers.render(both))
      .filter((n) => n.type === a.AT.drawers.FormDrawer).length, 1, 'form wins over filter')
    const detail = a.AT.panes.DetailPane({ s: s, kind: 'todo' })
    assert.equal(nodes(detail).filter((n) =>
      n.type === a.AT.panes.FilterPanel || n.type === a.AT.panes.FilterDrawer).length, 0,
      'the detail slot must not be replaced by the filter')
    const t = texts(detail)
    assert.ok(t.includes('所属项目') && t.includes('操作') && t.includes('待办信息'),
      'the todo detail still renders behind the mask')
    assert.ok(!t.includes('改动即时生效'), 'no instant-filter hint on the pane head')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    panes: Object.assign({}, a.AT.panes, {
      DetailPane: function () {
        return a.AT.panes.FilterPanel({ s: filterState(a, 'todo'), kind: 'todo' })
      }
    })
  })))

/* ④ Esc / 切模块 / 开表单 / 胶囊竖排带四处联动。 */
check('round6-4: Esc, view switching and the capsule rail all respect filterKind',
  (a) => {
    assert.ok(a.src.includes('if (uiState.filterKind) { e.preventDefault(); B.ui({ filterKind: null }); return }'),
      'Esc must close the filter layer')
    assert.ok(a.src.includes('uiState.form, uiState.filterKind, uiState.drawer'),
      'Esc effect must re-subscribe when filterKind changes')
    assert.ok(/B\.ui\(\{ filterKind: null,\s*form:/.test(a.src),
      'openForm must not stack two overlays')
    assert.ok((a.src.match(/filterKind: null/g) || []).length >= 4,
      'setView / openListDrawer / openForm / Esc / close all clear the filter')
    assert.ok(a.src.includes('!!(s.ui && s.ui.filterKind)'), 'capsule rail gate')
    const B = a.AT.bridge
    const cap = { open: true, selected: [], delMode: false, multi: false,
      composeOpen: false, editId: '', todoPick: false, mapPick: false, phase: '', clock: '' }
    const rail = (tree) => nodes(tree).filter((n) =>
      /\bat-cx-fab\b|\bat-cx-write\b|\bat-cx-dockplate\b/.test(String(n.props.className || '')))
    B.ui({ capsule: cap, form: null, filterKind: null })
    assert.ok(rail(a.AT.capsule.FloatingCapsule()).length > 0, 'rail shows with no overlay')
    B.ui({ filterKind: 'todo' })
    assert.equal(rail(a.AT.capsule.FloatingCapsule()).length, 0,
      'filter overlay is z55 — the z150 / z149 pair must hide')
    B.ui({ filterKind: null })
    assert.ok(rail(a.AT.capsule.FloatingCapsule()).length > 0, 'closing restores the rail')
  },
  (a) => withSrc(a, swap(a.src, '!!(s.ui && s.ui.filterKind)', 'false')))

/* ⑤ 三条关闭通道 ＋ 即时生效语义（遮罩 / 标题栏 / Esc，无确定键）。 */
check('round6-5: instant filters close by mask / head / Esc and never ask to confirm',
  (a) => {
    const fd = a.AT.panes.FilterDrawer({ s: filterState(a, 'todo'), kind: 'todo' })
    const mask = byClass(fd, 'at-form-mask')[0]
    const cancel = byClass(fd, 'at-sd-cancel')[0]
    const reset = nodes(fd).filter((n) => texts(n).includes('清除全部筛选') &&
      typeof n.props.onClick === 'function')
    assert.ok(mask && typeof mask.props.onClick === 'function', 'clicking the mask closes it')
    assert.ok(cancel && typeof cancel.props.onClick === 'function', 'the head pill closes it')
    assert.ok(reset.length >= 1, 'reset is a real button')
    assert.equal(texts(cancel), '关闭', 'head pill is 关闭')
    assert.equal(byClass(fd, 'at-sd-submit').length, 0, 'no confirm button')
    assert.ok(texts(fd).includes('改动即时生效') && texts(fd).includes('没有「确定」'),
      'the foot states that edits apply immediately')
    assert.ok(a.src.includes('改动即时生效 · 没有「确定」'),
      'the instant-apply hint is the shipped copy')
    assert.ok(a.src.includes('if (uiState.filterKind)'), 'Esc is the third close channel')
  },
  (a) => withSrc(a, swap(a.src, '改动即时生效 · 没有「确定」', '请点击确定后生效')))

/* 把筛选面板的渲染树切成「组」：每组一层 `.at-filter-group`，里先一颗标签，
 * 再是 `.at-filter-search` / `.at-filter-chips` / `.at-filter-rows` 三者之一。
 * ⚠️ 判**渲染出来的形态**，不是判源码里调了哪个函数 —— 形态对了才算对。 */
function groupShapes(content) {
  const out = []
  nodes(content).forEach(function (g) {
    const own = String(g.props.className || '').split(/\s+/)
    if (own.indexOf('at-filter-group') < 0) return
    const kids = nodes(g)
    const has = (c) => kids.some((n) => String(n.props.className || '').split(/\s+/).indexOf(c) >= 0)
    const lab = kids.filter((n) => String(n.props.className || '') === 'at-filter-label')[0]
    out.push([
      texts(lab || ''),
      has('at-filter-rows') ? 'rows'
        : has('at-filter-chips') ? 'chips'
          : has('at-filter-search') ? 'search' : '?'
    ])
  })
  return out
}

/* ⑥ 项目 / 待办 / 脑图三张列表共用同一只抽屉，各自带自己的条件组。
 * ★ 2026-11-10（轮次 10 · 用户第 5 条）：从「有没有各自的条件组」升级成
 *   「组 / 标签 / 形态**逐条**与小程序 `utils/drawers.js` 的 `tf.groups` 一致」。
 *   用户原话：「三处筛选弹窗与小程序的弹窗抽屉展示差距较大，需分别优化，
 *   使其与小程序的展示保持一致」。 */
check('round6-6: project / todo / mindmap filters all use the same drawer',
  (a) => {
    /* 逐条抄自小程序三处装配点（drawers.js:399 / 484 / 590）：
     *   · 「所属项目」「关联 agent」是**行组**（色点 ＋ 名称 ＋ 条数，一行一个），
     *     其余是胶囊组；行组正是轮次 10 补上的差距。
     *   · 「更新时间」wrap ＋ fill（小程序 `tf-chip.w2` 均分两列）。
     *   · 标签是「项目状态」「节点」，不是「状态」「项目节点」。 */
    const want = {
      project: [
        { label: '项目状态', type: 'chips' },
        { label: '节点', type: 'chips', wrap: true },
        { label: '关联 agent', type: 'rows' }
      ],
      todo: [
        { label: '待办状态', type: 'chips' },
        { label: '所属项目', type: 'rows' },
        { label: '更新时间', type: 'chips', wrap: true, fill: true }
      ],
      mindmap: [
        { label: '格式', type: 'chips', wrap: true },
        { label: '所属项目', type: 'rows' },
        { label: '更新时间', type: 'chips', wrap: true, fill: true }
      ]
    }
    Object.keys(want).forEach(function (kind) {
      const fd = a.AT.panes.FilterDrawer({ s: filterState(a, kind), kind: kind })
      const cls = nodes(fd).map((n) => String(n.props.className || '')).join(' ')
      assert.ok(/\bat-drawer\b/.test(cls) && /\bat-drawer-head\b/.test(cls) &&
        /\bat-drawer-foot\b/.test(cls), kind + ': same shell')
      const t = texts(fd)
      assert.ok(t.includes(kind === 'project' ? '项目筛选'
        : kind === 'todo' ? '待办筛选' : '脑图筛选'), kind + ': module-named title')
      assert.ok(t.includes('清除全部筛选'), kind + ': shared reset in the foot')
      /* ① 组定义表本身（求值产物）：组数 / 标签 / 形态 / wrap / fill 逐条对。 */
      const spec = a.AT.panes.FILTER_GROUPS[kind]
      assert.equal(spec.length, want[kind].length, kind + ': group count')
      spec.forEach(function (g, i) {
        const w = want[kind][i]
        assert.equal(g.label, w.label, kind + '#' + i + ': label')
        assert.equal(g.type, w.type, kind + '#' + i + ': shape')
        assert.equal(!!g.wrap, !!w.wrap, kind + '#' + i + ': wrap')
        assert.equal(!!g.fill, !!w.fill, kind + '#' + i + ': fill')
      })
      /* ② 渲染树里真的按这个顺序铺出来（第一组固定是「搜索」）。 */
      const content = a.AT.panes.FilterPanel({ s: filterState(a, kind), kind: kind })
      assert.deepEqual(groupShapes(content),
        [['搜索', 'search']].concat(want[kind].map((w) => [w.label, w.type])),
        kind + ': rendered groups in order')
      /* ③ 行组必须真的带「色点 ＋ 名称 ＋ 条数」三件套，胶囊组一颗都不许有。 */
      const rowBtns = nodes(content).filter((n) =>
        String(n.props.className || '').split(/\s+/).indexOf('at-filter-row') >= 0)
      const chipBtns = nodes(content).filter((n) =>
        String(n.props.className || '').split(/\s+/).indexOf('at-filter-chip') >= 0)
      const wantRows = want[kind].some((w) => w.type === 'rows')
      if (wantRows) {
        assert.ok(rowBtns.length >= 2, kind + ': the rows group renders rows')
        rowBtns.forEach(function (r) {
          const inner = nodes(r)
          /* 按**类名 token** 取，不按整串相等：色点没有色时是 `.at-filter-dot.empty`
           * 两个 token，整串比较会把「关联 agent」那组（全是无色的行）判成缺色点。 */
          const pick = (c) => inner.filter((n) =>
            String(n.props.className || '').split(/\s+/).indexOf(c) >= 0)[0]
          assert.ok(pick('at-filter-dot'), kind + ': every row keeps its colour slot')
          assert.ok(texts(pick('at-filter-row-t') || '') !== '', kind + ': every row names itself')
          assert.ok(/^\d+$/.test(texts(pick('at-filter-row-n') || '')),
            kind + ': every row reports a count')
        })
      }
      assert.ok(chipBtns.length >= 1, kind + ': the chip groups render chips')
      /* ④ 搜索组：标签是「搜索」（不是插件自造的「关键词」），框上有 aria-label。 */
      assert.ok(texts(content).includes('搜索'), kind + ': search group label')
      const kwInput = nodes(content)
        .filter((n) => String(n.props.className || '').split(/\s+/).indexOf('at-filter-input') >= 0)
      assert.equal(kwInput.length, 1, kind + ': one search input')
      assert.equal(String(kwInput[0].props['aria-label']), '搜索', kind + ': search input is labelled')
    })
    assert.ok(a.src.includes("m.label + '筛选'"),
      'the module-named title must come from the shared meta label')
    assert.ok(a.src.includes('B.ui({ filterKind: filterOpen ? null : kind })'),
      'the list button is the single open/close entry')
  },
  /* 变异：把「所属项目」从行组退回胶囊组 —— 正是轮次 10 之前那份实现。
   * 一处改动会同时打红 ①（type 不符）与 ②（渲染形状变 chips）。 */
  (a) => withAT(a, Object.assign({}, a.AT, {
    panes: Object.assign({}, a.AT.panes, {
      FILTER_GROUPS: Object.assign({}, a.AT.panes.FILTER_GROUPS, {
        todo: a.AT.panes.FILTER_GROUPS.todo.map((g) => (g.key === 'projectId'
          ? Object.assign({}, g, { type: 'chips' }) : g))
      })
    })
  })))

/* ======================= round 7 · 2026-11-09 脑图详情按小程序完整对齐 ===
 * 用户：「仔细对比一下小程序，看你的功能对吗？线条位置逻辑对吗？」＋拍板
 * 「按小程序完整对齐 / 删掉关联连线与搜索死代码」。
 * 判据全部判求值产物（core 求值 / layout 产物 / 渲染树 / STYLE），源码只作门控；
 * 每条配一次确实跑红的反向变异。
 */
/* ① 折叠徽标挂侧＝core.foldSideOf 的「出边方向」，几何＝core.foldStyleOf。 */
check('round7-1: fold badge side comes from core.foldSideOf, never a hard-coded right edge',
  (a) => {
    const core = mindmapCore()
    const seen = {}
    for (const fmt of ['mindmap', 'logic', 'org', 'tree', 'timeline', 'fishbone']) {
      const t = mmTree()
      const vt = a.AT.text.visibleTree(t)
      const raw = core.layoutOf(vt, true, fmt, core.metricsMap(vt, true))
      const want = core.foldSideOf(t, raw, fmt)   // 完整树 ＋ 可见树排版
      Object.keys(want).forEach((id) => { seen[want[id]] = true })
      const L = a.AT.mindmap.layout(core, t, fmt, false)
      L.nodes.forEach((n) => {
        assert.equal(n.foldSide, want[n.id] || 'r', fmt + ': side equals core.foldSideOf')
      })
      const folded = L.nodes.filter((n) => n.fold > 0)
      assert.ok(folded.length >= 1, fmt + ': collapsed branch keeps its badge')
      folded.forEach((n) => {
        assert.equal(n.foldStyle,
          core.foldStyleOf({ x: n.x, y: n.y, w: n.w, h: n.h }, n.foldSide),
          fmt + ': badge geometry must be the core helper output')
      })
    }
    assert.ok(seen.b && seen.t && seen.l,
      'org/tree/timeline hang bottom, fishbone upper branch hangs top, mindmap left branch hangs left')
    const st = a.AT.mindmap.STYLE
    assert.ok(!/\.at-mm-fold\{[^}]*right:/.test(st), 'no hard-coded right edge')
    assert.ok(/\.at-mm-fold\{[^}]*pointer-events:none/.test(st), 'badge is a pure indicator')
    assert.ok(a.src.includes('core.foldSideOf(root, raw, format)'), 'full tree is the side source')
    assert.ok(a.src.includes('core.foldStyleOf(rectOf(r), side)'), 'geometry stays in the core')
  },
  (a) => withSrc(a, swap(a.src, 'core.foldStyleOf(rectOf(r), side)',
    "core.foldStyleOf(rectOf(r), 'r')")))

/* ② 数字＝整支后代数（countNodes−1），只在收起时显示，>99 显示 99+。 */
check('round7-2: fold count is descendant count and only shows while collapsed',
  (a) => {
    const core = mindmapCore()
    const t = mmTree()
    const L = a.AT.mindmap.layout(core, t, 'mindmap', false)
    const folded = L.nodes.filter((n) => n.fold > 0)
    assert.equal(folded.length, 1, 'only the collapsed branch carries a badge')
    assert.equal(folded[0].fold, 4, 'A hides 4 descendants but has only 2 direct children')
    assert.ok(folded[0].foldStyle, 'collapsed badge has a position')
    const open = JSON.parse(JSON.stringify(t))
    delete open.children[0].collapsed
    const L2 = a.AT.mindmap.layout(core, open, 'mindmap', false)
    assert.equal(L2.nodes.filter((n) => n.fold > 0).length, 0, 'expanded nodes carry no badge')
    assert.ok(a.src.includes('Math.max(0, Text.countNodes(full) - 1)'),
      'count comes from the full tree, not the pruned visible tree')
    assert.ok(a.src.includes("n.fold > 99 ? '99+' : n.fold"), '99+ cap')
  },
  (a) => withSrc(a, swap(a.src, 'Math.max(0, Text.countNodes(full) - 1)',
    '(n.children || []).length')))

/* ③ 深色连线色走 wrapper 的 theme.linkColor()，不回落固定浅灰。 */
check('round7-3: dark link colour flows through the wrapper theme channel',
  (a) => {
    const core = mindmapCore(), t = mmTree()
    const svgOf = (L) => decodeURIComponent(L.linksUri.replace(/^data:image\/svg\+xml,/, ''))
    const dark = a.AT.mindmap.layout(core, t, 'mindmap', true)
    const light = a.AT.mindmap.layout(core, t, 'mindmap', false)
    assert.ok(svgOf(dark).includes('#858783'), 'dark SVG uses the registered dark colour')
    assert.ok(svgOf(light).includes('#C8C8CC'), 'light SVG uses the registered light colour')
    assert.equal(dark.linkColor, '#858783')
    assert.equal(a.AT.mindmap.LINK_DARK, '#858783')
    const theme = fs.readFileSync(path.join(MP_ROOT, '小程序前端/utils/theme.js'), 'utf8')
    assert.ok(/const LINK_DARK = '#858783'/.test(theme), 'value equals mini-program theme.js')
    assert.ok(read('assets/mindmap-core.js').includes("name === './theme'"),
      'browser wrapper exposes the same linkColor() channel')
    assert.ok(a.src.includes("LINK_DARK = '#858783'"))
  },
  (a) => withSrc(a, swap(a.src, "LINK_DARK = '#858783'", "LINK_DARK = '#C8C8CC'")))

/* ④ 行高＝core.LH，CSS 不二次折行（小程序 buildNodes 注释里的老坑）。 */
check('round7-4: line-height equals core LH and CSS never re-wraps metrics lines',
  (a) => {
    assert.equal(mindmapCore().LH, 1.4)
    const st = a.AT.mindmap.STYLE
    assert.ok(/\.at-mm-node\{[^}]*line-height:1\.4/.test(st), 'node line-height matches LH')
    assert.ok(/\.at-mm-node-lines>div\{[^}]*white-space:nowrap/.test(st), 'each metrics line is pinned')
    assert.ok(!/word-break:break-word/.test(st), 'no CSS-level re-wrap')
  },
  (a) => withMMStyle(a, swap(a.AT.mindmap.STYLE,
    'line-height:1.4;overflow:visible', 'line-height:1.35;overflow:visible')))

/* ⑤ 画布 10 键与 303 轮组序：[加子·加同级]‖[删除]‖[编辑·语音]，语音最右。 */
check('round7-5: canvas keeps the 303-round ten-key order, voice at the far right',
  (a) => {
    const st = stateFor(a, {})
    const mm = (st.mindmaps || [])[0]
    const tree = a.AT.mindmap.Editor({ s: st, mm: mm })
    const fb = nodes(tree).filter((n) => n.type === 'button' &&
      String((n.props && n.props.className) || '').split(/\s+/).includes('at-mm-fb'))
    const titles = fb.map((n) => String((n.props && n.props.title) || ''))
    assert.equal(titles.length, 10, 'ten canvas keys')
    assert.deepEqual(titles, ['撤回', '重做', '编辑脑图信息', '展开', '收起',
      '加子节点', '加同级', '删除节点', '改文本', '语音改文本'])
    const wxml = fs.readFileSync(path.join(MP_ROOT,
      '小程序前端/components/mod-mindmap/mod-mindmap.wxml'), 'utf8')
    assert.ok(/第 303 轮：\*\*三组再换位/.test(wxml), '303 round is the live mini-program source')
    assert.ok(wxml.includes('data-act="voice"') &&
      wxml.indexOf('data-act="edit"') < wxml.indexOf('data-act="voice"'),
      'mini-program really puts voice at the far right')
    assert.ok(a.src.includes("title: voicePhase === 'rec' ? '停止录音'") &&
      a.src.includes("'语音改文本'"),
      'voice key keeps the base copy and gains the recording / recognizing states')
    const expandBtn = fb.find((n) => n.props.title === '展开')
    const collapseBtn = fb.find((n) => n.props.title === '收起')
    assert.notEqual(expandBtn.props.disabled, true,
      '展开 stays enabled on the root selection (mini-program gates only on selNode)')
    assert.notEqual(collapseBtn.props.disabled, true,
      '收起 stays enabled on the root selection')
    assert.ok(a.AT.mindmap.STYLE.includes('.at-mm-node.is-rec') &&
      a.AT.mindmap.STYLE.includes('.at-mm-mask') &&
      a.AT.mindmap.STYLE.includes('.at-mm-fb.is-rec'),
      'mindmap voice state paints the node mask / breathing ring / mic ring')
    assert.ok(a.src.includes("L.nodes.filter(function (n) { return n.fold > 0 }).map"),
      'fold badges sit in the stage layer, not inside a node')
    assert.ok(!a.src.includes("n.fold > 0 ? h('span'"),
      'a fold badge inside the node would be offset twice by the node left/top')
    assert.ok(a.src.includes("title: delArmed ? '再点一次删除' : '删除节点'"),
      'delete stays in the middle group with its two-stage arming')
  },
  (a) => withSrc(a, swap(a.src,
    "title: voicePhase === 'rec' ? '停止录音' : voicePhase === 'up' ? '语音识别中' : '语音改文本'",
    "title: '语音输入'")))

/* ⑥ PC 提示在左上竖列、关闭落 storage；缩放比例只在缩放时浮现。 */
check('round7-6: PC tip sits in the top-left column and the zoom chip is transient',
  (a) => {
    const st = stateFor(a, {})
    const tree = a.AT.mindmap.Editor({ s: st, mm: (st.mindmaps || [])[0] })
    const tl = byClass(tree, 'at-mm-tl')[0]
    assert.ok(tl, 'one top-left column exists')
    const cls = nodes(tl).map((n) => String((n.props && n.props.className) || '')).join(' ')
    assert.ok(cls.includes('at-mm-tip') && cls.includes('at-mm-zoomchip'),
      'tip and zoom share the same column')
    const css = a.AT.mindmap.STYLE
    assert.ok(!/\.at-mm-tip\{[^}]*right:12px/.test(css), 'tip is no longer bottom-right')
    assert.ok(/\.at-mm-zoomchip\{[^}]*opacity:0;pointer-events:none/.test(css),
      'hidden chip must not eat canvas gestures')
    assert.ok(/\.at-mm-zoomchip\.is-on\{opacity:1;pointer-events:auto/.test(css))
    assert.ok(a.src.includes("window.localStorage.setItem(TIP_KEY, '1')"),
      'closing the tip is remembered')
    assert.ok(a.src.includes('TIP_KEY = \'agenttodo.mindmap.tip.pc\''))
    assert.ok(a.src.includes("addEventListener('wheel', handleWheel, { passive: false })"),
      'PC wheel zoom is a non-passive native listener')
    assert.ok(a.src.includes('Math.exp(-dy * .0015)') && a.src.includes('cx * next'),
      'wheel zoom follows the cursor instead of the canvas centre')
    assert.ok(!a.src.includes('if (!e.ctrlKey && !e.metaKey) return'),
      'plain wheel zooms; Ctrl is not required')
  },
  (a) => withMMStyle(a, swap(a.AT.mindmap.STYLE,
    'opacity:0;pointer-events:none;transition:opacity .18s ease',
    'opacity:1;pointer-events:auto;transition:opacity .18s ease')))

/* ⑦ 编辑态：同一条左下浮条就地长高、键排整排不渲染、正文高度按折行数现算。 */
check('round7-7: edit state grows the bottom float; the key row is not rendered',
  (a) => {
    const css = a.AT.mindmap.STYLE
    assert.ok(/\.at-mm-float\.is-editing\{[^}]*flex-direction:column/.test(css))
    assert.ok(/\.at-mm-act\{[^}]*height:44px/.test(css), 'cancel/save are 44 high')
    const core = mindmapCore()
    const h = a.AT.mindmap.editTaH
    assert.equal(h(core, '一行'), 96, 'lower clamp')
    assert.ok(h(core, Array(40).join('很长的一段文字')) <= 276, 'upper clamp')
    assert.ok(h(core, Array(40).join('很长的一段文字')) > 96, 'grows with wrapped lines')
    assert.ok(a.src.includes("edit ? h('div', { className: 'at-mm-float is-bottom is-editing'"),
      'the same float grows in place')
    assert.ok(a.src.includes("name: 'w-check', size: 16"), 'black key uses the 16 white icon')
    assert.ok(a.src.includes('edit ? h(\'div\', { className: \'at-mm-float is-bottom is-editing\'') &&
      a.src.includes(': h(\'div\', { className: \'at-mm-float is-bottom\' },'),
      'edit and resting states are the two arms of one ternary, never both rendered')
    assert.ok(a.src.includes("className: 'at-mm-attach-slot'") &&
      a.src.includes("className: 'at-mm-tile'") && a.src.includes("className: 'at-mm-thumb'"),
      'node edit offers the 96x72 attach pit / thumbnail')
    assert.ok(/\.at-mm-tile\{[^}]*width:96px;height:72px/.test(css) &&
      /\.at-mm-thumb\{[^}]*width:96px;height:72px/.test(css),
      'attach pit and thumbnail share the 96x72 geometry')
    assert.ok(css.includes('.at-mm-imgdel') && css.includes('.at-mm-spin') &&
      a.src.includes("'上传中…'"),
      'attach keeps the remove hit target and the uploading spinner')
  },
  (a) => withSrc(a, swap(a.src,
    "edit ? h('div', { className: 'at-mm-float is-bottom is-editing'",
    "edit ? h('div', { className: 'at-mm-editor'")))

/* ⑧ 拖拽规则全部来自 core，落位走精确的 {parentId,index}。 */
check('round7-8: drag rules all come from core and moveTo lands at the exact index',
  (a) => {
    const core = mindmapCore()
    for (const fn of ['zoneMapOf', 'pickParentId', 'slotIndexOf', 'slotMarkOf',
      'coverOf', 'anchorOf', 'buildDragLinkUri']) {
      assert.equal(typeof core[fn], 'function', 'core exposes ' + fn)
      assert.ok(a.src.includes('core.' + fn + '('), 'plugin calls core.' + fn)
    }
    assert.ok(a.src.includes('core.slotIndexOf(kids, Ld, d.id, { x: ghost.cx, y: ghost.cy }, slotAxis)'),
      '212 round: ranking uses node centre, not the left-edge anchor')
    assert.ok(a.src.includes('CAND_HOLD_MS'), 'candidate parent dwells before switching')
    const t = mmTree()
    const moved = a.AT.text.treeRules.moveTo(t, t.children[1].children[0].id,
      t.children[0].id, 0)
    /* ★ moveTo 内部 cloneTree ⇒ 引用必然不同，比引用会假绿；一律比 JSON 值
     *  （跨 vm realm 也别用 deepStrictEqual，原型不同会假红）。 */
    assert.notEqual(JSON.stringify(moved), JSON.stringify(t), 'move really changes the tree')
    assert.equal(moved.children[0].children[0].text, 'B1 里程碑',
      'index 0 lands before the existing children')
    const cyc = a.AT.text.treeRules.moveTo(t, t.children[0].id,
      t.children[0].children[0].id, 0)
    assert.equal(JSON.stringify(cyc), JSON.stringify(t),
      'dragging into its own subtree is refused')
    assert.ok(a.src.includes('drop.same'), 'cancel / no-op releases do not write')
  },
  (a) => withSrc(a, swap(a.src,
    'core.slotIndexOf(kids, Ld, d.id, { x: ghost.cx, y: ghost.cy }, slotAxis)',
    'core.slotIndexOf(kids, Ld, d.id, anchor, slotAxis)')))

/* ⑨ 关联连线 / 搜索死代码已删，但历史数据仍安全。 */
check('round7-9: association links and dead node search are gone; history data stays safe',
  (a) => {
    for (const dead of ['setLinkOpen(true)', 'at-mm-linkpanel', 'linkPaths()',
      "addLink()", '定位节点…', 'at-mm-badge']) {
      assert.ok(!a.src.includes(dead), 'dead surface must be gone: ' + dead)
    }
    assert.equal(typeof a.AT.text.treeRules.addLink, 'function',
      'addLink rule stays for legacy n.links data')
    assert.equal(typeof a.AT.text.treeRules.removeLink, 'function')
    assert.ok(a.src.includes('text-align:justify'), 'edit area keeps the 275f justify fix')
  },
  (a) => withSrc(a, a.src + '\n/* mutant */ setLinkOpen(true)'))

/* ═══════ 轮次 8：项目详情「已完成待办 / 查看全部」并入筛选模型 ═══════
 * 口径：项目详情底行那两颗键以前各写一份 `ui.listScope`，列表页顶上因此多出一条
 * 独立的「限定项目：X ＋ 清除」提示带（`.at-scope-note`）—— 与筛选抽屉重复表达
 * 同一件事，还多出第二个清除入口（清了提示带、筛选还在，列表内容不变）。
 * 现在它们只调 `AT.panes.openFiltered`，落地态完全由 ui.{t,m}Filter 表达。 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}
function projectBodySrc(src) {
  const from = src.indexOf('function ProjectBody(s, p)')
  const to = src.indexOf('function OverviewView(s)')
  assert.ok(from > 0 && to > from, 'ProjectBody source block not found')
  return src.slice(from, to)
}

check('round8-1: project detail jumps hand their conditions to the one filter model',
  (a) => {
    const body = stripComments(projectBodySrc(a.src))
    assert.ok(body.includes("AT.panes.openFiltered('todo', { status: 'done', projectId: p.id })"),
      'the done-todos jump must carry status + project into tFilter')
    assert.ok(body.includes("AT.panes.openFiltered('mindmap', { projectId: p.id })"),
      'the all-mindmaps jump must carry the project into mFilter')
    assert.ok(!body.includes('listScope'),
      'no second narrowing channel may be written from the project detail')
  },
  (a) => withSrc(a, swap(a.src,
    "AT.panes.openFiltered('todo', { status: 'done', projectId: p.id })",
    "AT.panes.openFiltered('todo', { status: 'open' })")))

check('round8-2: the list pane keeps a single narrowing channel — the filter model',
  (a) => {
    const code = stripComments(a.src)
    assert.ok(!/listScope/.test(code), 'listScope must not survive anywhere in code')
    assert.ok(!/at-scope-note/.test(code), 'the standalone scope banner must not be rendered')
    assert.ok(/function openFiltered\(kind, dict\)/.test(code), 'openFiltered must exist')
    assert.ok(/openFiltered: openFiltered/.test(code), 'openFiltered must be exported on AT.panes')
    assert.ok(/S\.setView\(kind\)/.test(code), 'openFiltered owns the page switch')
  },
  (a) => withSrc(a, a.src + "\n;(function () { B.ui({ listScope: { projectId: 'p' } }) })()\n"))

check('round8-3: the scope banner has no rule body left in the evaluated stylesheet',
  (a) => {
    assert.ok(!hasRule(a.css, '.at-scope-note'), 'the dead rule body must not ship')
    assert.ok(hasRule(a.css, '.at-filter-chip.is-on'), 'the filter chips stay the one on-state')
  },
  (a) => withCss(a, a.css + '.at-scope-note{display:flex;padding:8px 12px}'))

check('round8-4: openFiltered lands on the list page with exactly that filter',
  (a) => {
    const bridge = a.AT.bridge
    const before = JSON.parse(JSON.stringify(bridge.get().ui))
    try {
      /* 先铺一堆残留：关键词、上一模块的筛选浮层、别处的临时态。 */
      bridge.ui({ tFilter: { kw: '残留关键词', status: 'open', projectId: '', range: 'all' },
        filterKind: 'todo', detailOpen: true, mmPick: { todoId: 'x' } })
      a.AT.panes.openFiltered('todo', { status: 'done', projectId: 'pX' })
      const u = bridge.get().ui
      assert.equal(u.active, 'todo', 'the jump must switch to the list page')
      assert.equal(u.filterKind, null, 'the filter overlay must be closed on arrival')
      assert.equal(u.tFilter.status, 'done', 'status must land in the filter model')
      assert.equal(u.tFilter.projectId, 'pX', 'project must land in the filter model')
      assert.equal(u.tFilter.kw, '', 'a stale keyword must not survive the jump')
      assert.equal(u.tFilter.range, 'all', 'the rest stays at its default')
      a.AT.panes.openFiltered('mindmap', { projectId: 'pX' })
      assert.equal(bridge.get().ui.active, 'mindmap')
      assert.equal(bridge.get().ui.mFilter.projectId, 'pX')
      assert.equal(bridge.get().ui.mFilter.format, 'all')
    } finally {
      bridge.ui(before)
    }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    panes: Object.assign({}, a.AT.panes, {
      /* 旧实现：只写第二条收窄通道，不碰筛选模型。 */
      openFiltered: function (kind, dict) { a.AT.bridge.ui({ active: kind, listScope: dict }) }
    })
  })))

/* ══════════════════════════════════════════════════════════════════════════
 * 2026-11-10 · 轮次 9：小程序↔插件一致性整改的五条**行为级**判据 ＋ 一条版式判据。
 *   ① 待办详情的图片格 / 胶囊卡能开查看层（改前点了什么都不发生）；
 *   ② 取消关联胶囊要先确认、确认前数据不动；
 *   ③ 筛选抽屉补齐 `range` / `agentId` 这两组「有字段、没入口」的维度；
 *   ④ 胶囊 / 脑图选择器走同一套抽屉外壳，详情里不再有内联面板；
 *   ⑤ 项目网格卡带完成圆圈，且先确认再勾；
 *   ⑥ 项目脑图块只铺最近 6 张。
 * 六条都在同一个 bridge 上铺临时状态，finally 还原；每条自带一次变异（会红才算数）。
 * ════════════════════════════════════════════════════════════════════════ */
function nodesOf(tree, out) {
  out = out || []
  if (tree == null || typeof tree === 'boolean') return out
  if (Array.isArray(tree)) { tree.forEach((n) => nodesOf(n, out)); return out }
  if (typeof tree !== 'object') return out
  out.push(tree)
  ;(tree.children || []).forEach((n) => nodesOf(n, out))
  return out
}
const classList = (n) => String((n && n.props && n.props.className) || '').split(/\s+/)
/* 取「带某类名、且不带排除类名」的节点（旧的 byClass 只支持一个类名，这里要排除
 * `-add` 那枚占位键，所以另起一个名字，不覆盖上文的旧工具）。 */
function pickCls(tree, cls, notCls) {
  return nodesOf(tree).filter((n) => classList(n).indexOf(cls) >= 0 &&
    (!notCls || classList(n).indexOf(notCls) < 0))
}
function textIn(tree) {
  return nodesOf(tree).map((n) => (n.children || [])
    .filter((c) => typeof c === 'string' || typeof c === 'number').join('')).join(' ')
}
/* 深拷贝元素树并把指定节点的 props 换掉（变异用）。返回 null 表示删掉该节点。 */
function mapNodes(tree, fn) {
  if (tree == null || typeof tree !== 'object') return tree
  if (Array.isArray(tree)) return tree.map((n) => mapNodes(n, fn)).filter((n) => n != null)
  const copy = Object.assign({}, tree, {
    children: (tree.children || []).map((n) => mapNodes(n, fn)).filter((n) => n != null)
  })
  const out = fn(copy)
  return out === undefined ? copy : out
}
const stripClick = (cls, notCls) => (a) => withAT(a, Object.assign({}, a.AT, {
  views: Object.assign({}, a.AT.views, {
    TodoBody: (s, t) => mapNodes(a.AT.views.TodoBody(s, t), (n) => {
      const c = classList(n)
      if (c.indexOf(cls) < 0 || (notCls && c.indexOf(notCls) >= 0)) return n
      return Object.assign({}, n, { props: Object.assign({}, n.props, { onClick: null }) })
    })
  })
}))
/* 铺一份「待办带一张图 ＋ 关联一条胶囊」的状态，返回该待办 id。 */
function seedViewable(a) {
  const B = a.AT.bridge, Core = a.AT.core
  const s0 = B.get()
  const t0 = Core.byId(s0.todos, 'd-demo-1')
  assert.ok(t0, 'demo todo d-demo-1 missing')
  B.store.set((st) => Object.assign({}, st, {
    todos: st.todos.map((t) => (t.id === t0.id ? Object.assign({}, t, {
      images: [{ id: 'i-x1', uri: '/uploads/x1.jpg', label: 'x1' }] }) : t)),
    capsules: st.capsules.map((c) => (c.id === 'c-demo-1'
      ? Object.assign({}, c, { todoId: t0.id, consumed: true,
        consumedAt: c.consumedAt || c.createdAt }) : c))
  }))
  return t0.id
}

check('round9-1: todo-detail images and capsule cards both open the in-page viewer',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      const tid = seedViewable(a)
      B.ui({ imgView: null, capView: null })
      const st = B.get()
      const tree = a.AT.views.TodoBody(st, Core.byId(st.todos, tid))
      const img = pickCls(tree, 'at-tbd-img', 'at-tbd-img-add')[0]
      assert.ok(img && typeof img.props.onClick === 'function', 'image tile must be clickable')
      img.props.onClick({ stopPropagation() {} })
      const v = B.get().ui.imgView
      assert.ok(v && v.urls.length === 1 && v.index === 0, 'image click must open the viewer')
      const cap = pickCls(tree, 'at-tbd-cap', 'at-tbd-cap-add')[0]
      assert.ok(cap && typeof cap.props.onClick === 'function', 'capsule card must be clickable')
      cap.props.onClick({ stopPropagation() {} })
      const cv = B.get().ui.capView
      assert.ok(cv && cv.todoId === tid, 'capsule click must open the full-text layer')
      /* 图上那颗 ✕ 必须停住冒泡：不然"移除图片"会顺手把大图也打开 */
      B.ui({ imgView: null })
      const ix = pickCls(tree, 'at-tbd-img-x')[0]
      let stopped = false
      ix.props.onClick({ stopPropagation() { stopped = true } })
      assert.equal(stopped, true, 'the image remove button must stop propagation')
      assert.equal(B.get().ui.imgView, null, 'removing an image must not open the viewer')
    } finally { B.store.set(() => before); B.ui({ imgView: null, capView: null }) }
  },
  stripClick('at-tbd-img', 'at-tbd-img-add'))

check('round9-2: unlinking a capsule asks first and touches nothing until confirmed',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      const tid = seedViewable(a)
      const st = B.get()
      const tree = a.AT.views.TodoBody(st, Core.byId(st.todos, tid))
      const x = pickCls(tree, 'at-tbd-cap-x')[0]
      assert.ok(x && typeof x.props.onClick === 'function', 'the capsule ✕ must be there')
      B.ui({ confirm: null })
      x.props.onClick({ stopPropagation() {} })
      const cf = B.get().ui.confirm
      assert.ok(cf && /取消关联/.test(String(cf.title)), 'unlink must ask before it acts')
      assert.equal(Core.byId(B.get().capsules, 'c-demo-1').todoId, tid,
        'the capsule must stay linked until the user confirms')
      cf.onConfirm()
      assert.equal(Core.byId(B.get().capsules, 'c-demo-1').todoId, null, 'confirm unlinks it')
    } finally { B.store.set(() => before); B.ui({ confirm: null }) }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      TodoBody: (s, t) => mapNodes(a.AT.views.TodoBody(s, t), (n) => (classList(n).indexOf('at-tbd-cap-x') < 0
        ? n
        : Object.assign({}, n, { props: Object.assign({}, n.props, {
          onClick: (e) => {
            if (e && e.stopPropagation) e.stopPropagation()
            a.AT.bridge.actions.unlinkCapsules(t.id, ['c-demo-1'])
          } }) })))
    })
  })))

check('round9-3: the filter drawer exposes every dimension the filter model already reads',
  (a) => {
    const s = a.AT.bridge.get()
    const todoText = textIn(a.AT.panes.FilterPanel({ s: s, kind: 'todo' }))
    assert.ok(todoText.includes('更新时间'), 'todo filter needs the update-time group')
    assert.ok(todoText.includes(a.AT.const.RANGES[1].name),
      'range chips must come from C.RANGES, not a hand-copied list')
    const mmText = textIn(a.AT.panes.FilterPanel({ s: s, kind: 'mindmap' }))
    assert.ok(mmText.includes('更新时间'), 'mindmap filter needs the update-time group')
    const agentName = (s.agents[0] || {}).name
    assert.ok(agentName, 'demo state needs at least one agent')
    const pjText = textIn(a.AT.panes.FilterPanel({ s: s, kind: 'project' }))
    assert.ok(pjText.includes('关联 agent') && pjText.includes(agentName),
      'project filter needs the agent group (pFilter.agentId)')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    panes: Object.assign({}, a.AT.panes, { FilterPanel: () => null })
  })))

check('round9-4: capsule / mindmap pickers are drawers, never an inline panel in the detail',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      B.ui({ capsulePick: { todoId: 'd-demo-1', picked: [] }, mmPick: null, form: null, filterKind: null })
      const capEl = a.AT.drawers.render(B.get())
      assert.ok(capEl && typeof capEl.type === 'function',
        'the picker must be assembled by drawers.render (one shell owner)')
      const capTree = capEl.type(capEl.props)
      assert.equal(pickCls(capTree, 'at-form-mask').length, 1, 'the picker needs the shared mask')
      assert.equal(pickCls(capTree, 'at-drawer').length, 1, 'the picker needs the shared drawer shell')
      assert.ok(texts(capTree).includes('选择胶囊'), 'the drawer keeps its own title')
      B.ui({ capsulePick: null, mmPick: { todoId: 'd-demo-1' } })
      const mmEl = a.AT.drawers.render(B.get())
      assert.ok(mmEl && typeof mmEl.type === 'function', 'mindmap picker goes through the same layer')
      const mmTree = mmEl.type(mmEl.props)
      assert.equal(pickCls(mmTree, 'at-drawer').length, 1, 'mindmap picker shares the same shell')
      /* 详情内容里不许再有内联面板（改前它插在内容最顶上、滚下去就看不见） */
      const st = B.get()
      const detail = a.AT.views.TodoBody(Object.assign({}, st, {
        ui: Object.assign({}, st.ui, { capsulePick: { todoId: 'd-demo-1', picked: [] } })
      }), Core.byId(st.todos, 'd-demo-1'))
      assert.equal(pickCls(detail, 'at-picker').length, 0, 'no inline picker left in the detail body')
    } finally { B.store.set(() => before); B.ui({ capsulePick: null, mmPick: null }) }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    drawers: Object.assign({}, a.AT.drawers, { render: () => null })
  })))

check('round9-5: project grid cards carry a done circle that confirms before toggling',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      const s = B.get()
      const hit = Core.aliveTodos(s).filter((t) => !t.done &&
        s.projects.some((p) => p.id === t.projectId))[0]
      assert.ok(hit, 'demo state needs an open todo inside a project')
      const p = Core.byId(s.projects, hit.projectId)
      const tree = a.AT.views.ProjectBody(s, p)
      const dot = pickCls(tree, 'at-pj-done')[0]
      assert.ok(dot && typeof dot.props.onClick === 'function', 'the done circle is missing')
      B.ui({ confirm: null })
      let stopped = false
      dot.props.onClick({ stopPropagation() { stopped = true } })
      assert.equal(stopped, true, 'the circle must not bubble into "open detail"')
      const cf = B.get().ui.confirm
      assert.ok(cf, 'marking done must confirm first')
      assert.equal(Core.byId(B.get().todos, hit.id).done, false, 'nothing changes before confirming')
      cf.onConfirm()
      assert.equal(Core.byId(B.get().todos, hit.id).done, true, 'confirm marks it done')
    } finally { B.store.set(() => before); B.ui({ confirm: null, detailUrg: null }) }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      ProjectBody: (s, p) => mapNodes(a.AT.views.ProjectBody(s, p), (n) => (classList(n).indexOf('at-pj-done') < 0
        ? n
        : Object.assign({}, n, { props: Object.assign({}, n.props, { onClick: null }) })))
    })
  })))

check('round9-6: the project mindmap block shows the newest 6 tiles and defers the rest',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      const s0 = B.get()
      const p = s0.projects[0]
      assert.ok(p, 'demo state needs a project')
      const extra = []
      for (let i = 0; i < 8; i++) {
        extra.push({ id: 'm-cap-' + i, projectId: p.id, name: '容量脑图 ' + i, nodes: 2, depth: 2,
          format: 'mindmap', updatedAt: '2026-11-0' + (i % 9 + 1) + ' 10:00:00' })
      }
      B.store.set((st) => Object.assign({}, st, { mindmaps: st.mindmaps.concat(extra) }))
      const s = B.get()
      const tree = a.AT.views.ProjectBody(s, Core.byId(s.projects, p.id))
      assert.equal(pickCls(tree, 'at-pj-mm').length, 6, 'only six tiles belong on the card')
      assert.ok(textIn(tree).includes('显示最近 6 张'), 'the footer must say the rest is behind 查看全部')
    } finally { B.store.set(() => before) }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      ProjectBody: (s, p) => {
        let seen = 0
        return mapNodes(a.AT.views.ProjectBody(s, p), (n) => (classList(n).indexOf('at-pj-mm') < 0
          ? n : (++seen === 1 ? null : n)))
      }
    })
  })))

/* ======================= round 10 · 2026-11-10 品牌区 / 导轨 / 卡片色条 / 项目表单 ===
 * 用户五项改动的落地判据（第五项「三处筛选对齐 .tf」已并进 round6-6 逐条比对）。
 * 一律判渲染树 / 求值产物，每条配一次确实会红的变异。
 */

/* ① 顶栏右侧是**横版组合标**，左侧只留模块名；旧文字字标与分隔线不许复活。
 * 用户原话：「插件前端右上角显示应用的横版 logo，展示方式参考平板端竖版模式下
 * 顶部左侧的品牌 logo」。参考物是小程序 `components/brand-head` 的横版 lockup。 */
check('round10-1: the top bar carries the horizontal brand lockup, not a text wordmark',
  (a) => {
    const tree = a.AT.shell.Workspace()
    const lock = byClass(tree, 'at-brand-lockup')
    assert.equal(lock.length, 1, 'exactly one brand lockup in the top bar')
    assert.equal(String(lock[0].props.src), '/agent-todo/assets/brand-lockup.png',
      'light theme points at the normal lockup')
    assert.equal(String(lock[0].props.alt), 'Agent ToDo', 'the lockup still names the product for AT')
    assert.equal(byClass(tree, 'at-wordmark').length, 0, 'the text wordmark is gone')
    assert.equal(byClass(tree, 'at-topbar-divider').length, 0, 'the divider is gone')
    /* ★ 2026-11-10 订正（用户原话）：「横版 logo 放在顶部**左侧**」。
     * 位置是这件事的一半 —— 上一版落在右上角，判据只查"存在且尺寸对"，没拦住。
     * 钉法：顶栏第一个子元素必须是 logo，且排在模块名之前（品牌在左，模块名紧随）。
     * ⚠️ 别只判"logo 在顶栏里"：那样右上角也过。 */
    const bar = byClass(tree, 'at-topbar')[0]
    const kids = ((bar && bar.children) || []).filter((n) => n && n.props)
    const idxOf = (c) => kids.findIndex((n) => String(n.props.className || '') === c)
    assert.equal(idxOf('at-brand-lockup'), 0,
      'the lockup must be the FIRST child of the top bar — the brand sits on the left')
    const titleAt = idxOf('at-topbar-title')
    assert.ok(titleAt > 0, 'the module name still follows the lockup')
    /* 深色档换 `d-` 版。两张图必须出自**同一处三元** —— 只留浅色那支时，
     * 深色顶栏上会压一张白底图（轮廓整块发白），而这在浅色快照里看不出来。 */
    assert.ok(a.src.includes("dark ? '/agent-todo/assets/d-brand-lockup.png'"),
      'dark theme must switch to the d- lockup in the same expression')
    /* 皮肤：30 高 ＋ width:auto（位图自身比例 3980×1204）。
     * ⚠️ 别给 lockup 写死宽度 —— 比例一变就变形；小程序 `.bh-lockup` 也是 height ＋ auto。 */
    const rule = /\.at-brand-lockup\{([^}]*)\}/.exec(a.AT.shell.STYLE)
    assert.ok(rule, 'the lockup needs its own rule body')
    assert.ok(/height:30px/.test(rule[1]), 'the lockup is 30 tall')
    assert.ok(/width:auto/.test(rule[1]), 'width follows the bitmap ratio')
    /* 位置口径的样式面：扣掉透明留白的那记负边距必须在**左边**。
     * 素材四周留白对称，所以数值相同、写错侧只有在快照里能看出「字被顶到内距外」。 */
    assert.ok(/margin-left:-2px/.test(rule[1]),
      'the negative margin sits on the left — that is the left-edge rendition')
    assert.ok(!/margin-right/.test(rule[1]),
      'a right-side negative margin means it is docked right again')
    assert.ok(!/at-wordmark|at-topbar-divider/.test(a.AT.shell.STYLE),
      'no orphan rule bodies left behind for the removed wordmark')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    shell: Object.assign({}, a.AT.shell, {
      STYLE: swap(swap(a.AT.shell.STYLE, 'height:30px;width:auto', 'height:22px;width:120px'),
        'margin-left:-2px', 'margin-right:-2px')
    })
  })))

/* ② 导轨不再显示数量，宽度收到 120。
 * 用户原话：「左侧导航栏不再显示数量。- 减小主导航宽度。」
 * ⚠️ 数量是**每条数据的条数**，收在筛选键的「筛选 N」里已经够（那里才是操作口径）；
 *    导轨上那个角标读起来像「这里还有 3 件事没做」，与计数口径对不上。 */
check('round10-2: the nav rail drops its count badges and narrows to 120px',
  (a) => {
    const tree = a.AT.shell.Workspace()
    assert.equal(byClass(tree, 'at-rail-count').length, 0, 'no count badge left in the rail')
    const items = byClass(tree, 'at-rail-item')
    assert.ok(items.length >= 5, 'the rail still lists every module: ' + items.length)
    items.forEach((it) => {
      assert.ok(!/\d/.test(texts(it)), 'rail labels carry no digits: ' + JSON.stringify(texts(it)))
    })
    const style = a.AT.desktop.STYLE
    assert.ok(/--at-rail-w:120px/.test(style), 'the rail variable is 120')
    /* 成对验收：类名与规则体一起下线。只删 DOM 不删规则，将来又会被人接回去。 */
    assert.ok(!/\.at-rail-count\{/.test(style), 'the badge rule body is gone with its host')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    desktop: Object.assign({}, a.AT.desktop, {
      STYLE: swap(a.AT.desktop.STYLE, '--at-rail-w:120px', '--at-rail-w:164px')
    })
  })))

/* ③ 项目详情里待办卡的紧急度色条：4 宽 × 16 高，顶对齐。
 * 用户原话：「缩短卡片中紧急程度颜色条的长度。优化标准参考小程序 PC 端的对应处理。」
 * 小程序真源 `todo-card.wxss` 的 **compact 档** `.tc.mini .tc-bar{height:16px}`
 * （常规档 20）：项目页这张卡本来就矮，色条按 20 会压过两行文字的视觉重心。 */
check('round10-3: the project todo card shortens its urgency bar to 4x16 like .tc.mini .tc-bar',
  (a) => {
    const css = a.AT.views.STYLE
    const rule = /\.at-pj-todo-bar\{([^}]*)\}/.exec(css)
    assert.ok(rule, 'the bar needs its own rule body')
    const body = rule[1]
    assert.ok(/width:4px/.test(body), 'bar width is 4')
    assert.ok(/height:16px/.test(body), 'bar height is 16 — the compact .tc.mini value')
    assert.ok(/align-self:flex-start/.test(body), 'top aligned, not stretched')
    assert.ok(/border-radius:2px/.test(body), 'tiny rounding, no pill')
    assert.ok(!/align-self:stretch/.test(body), 'never stretch to the card again')
    /* 渲染树里色条仍然在（否则"变短"可以是"整条没了"）。 */
    const s = stateFor(a, { active: 'project' })
    const p = (s.projects || [])[0]
    assert.ok(p, 'the seed state needs at least one project')
    const tree = a.AT.views.ProjectBody(s, p)
    assert.ok(byClass(tree, 'at-pj-todo-bar').length >= 1, 'cards still show the urgency bar')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      STYLE: swap(a.AT.views.STYLE, 'height:16px;min-height:0', 'height:auto;min-height:24px')
    })
  })))

/* ④ 项目编辑弹窗按**本地代码口径**做（用户拍板：胶囊 ＋ 一行一个），
 *    不是参考图里那套「下拉 ＋ 一排圆点」：
 *      · 项目名称 —— 单行输入框 ＋ 必填徽章
 *      · 项目节点 —— 一排胶囊（`.at-sd-chip`，选中黄软底 ＋ 黄描边）
 *      · 关联 agent —— 一行一个（`.at-sd-row`，首行「不关联」）
 *      · 项目色 —— 一行一个（`.at-sd-row` ＋ `.at-sd-cdot`，被占用置灰并写占用者）
 *      · 备注 —— 多行框（`.at-sd-area-in`）
 * ⚠️ 这条同时锁「三种形态各就各位」：把节点也做成行、或把色板做成胶囊，都得红。 */
check('round10-4: the project form speaks .sd — chips for 节点, one row per agent / colour',
  (a) => {
    const tree = formTree(a, 'project')
    const chips = byClass(tree, 'at-sd-chip')
    const rows = byClass(tree, 'at-sd-row')
    const dots = byClass(tree, 'at-sd-cdot')
    assert.equal(chips.length, a.AT.const.NODES.length,
      '节点 is a chip row with one chip per node: ' + chips.length)
    assert.ok(rows.length >= 3, 'agent / colour are one-row-each: ' + rows.length)
    assert.ok(dots.length >= a.AT.const.COLORS.length,
      'every colour row carries its dot: ' + dots.length)
    /* 「不关联」必须是 agent 组的**第一行**，且不带色点 ——
     * 它是"一个字都不挂"的出口，挂个色点会被读成一种特殊的 agent。
     * 按「有没有色点」区分两组，不按序号：色板行数随 C.COLORS 变。 */
    const agentRows = rows.filter((r) => byClass(r, 'at-sd-cdot').length === 0)
    assert.ok(agentRows.length >= 1, 'the agent group is a row list without colour dots')
    assert.ok(texts(agentRows[0]).indexOf('不关联') >= 0, 'the agent group starts with 不关联')
    /* 被占用的颜色：置灰 ＋ 当场写占用者名字（点下去之前就知道为什么灰）。 */
    const s = stateFor(a)
    const color = (s.projects || []).filter((p) => p.color)[0]
    assert.ok(color, 'the seed state needs a project that already owns a colour')
    const offRows = rows.filter((r) => String(r.props.className).indexOf('is-off') >= 0)
    assert.ok(offRows.length >= 1, 'a colour already owned by another project is disabled')
    assert.ok(texts(offRows[0]).indexOf('已被') >= 0, 'a disabled colour row says why it is grey')
    assert.ok(texts(offRows[0]).indexOf(color.name) >= 0, 'a disabled colour row names the owner')
    assert.ok(/\.at-sd-row\.is-off\{opacity:\.4/.test(a.AT.drawers.STYLE),
      'a taken colour row is disabled at .4')
    /* 备注是多行框，不是单行输入。 */
    assert.equal(byClass(tree, 'at-sd-area-in').length, 1, 'the note is the multi-line box')
    /* 名称是单行输入框，且带必填徽章。 */
    assert.equal(byClass(tree, 'at-sd-input').length >= 1, true, 'the name is a single-line input')
    assert.ok(texts(tree).indexOf('项目名称') >= 0, 'the name field is labelled')
    /* 底栏只有一颗通栏实心「保存」—— 不许出现「确定 / 取消」那套两键。 */
    assert.ok(byClass(tree, 'at-sd-submit').length >= 1, 'one solid submit in the foot')
    assert.equal(byClass(tree, 'at-sd-cancel').length >= 1, true, 'the head pill is the only other exit')
  },
  (a) => withDrawers(a, {
    FormDrawer: (p) => mapNodes(a.AT.drawers.FormDrawer(p), (n) => (
      classList(n).indexOf('at-sd-chip') < 0
        ? n
        : { type: n.type, props: Object.assign({}, n.props, { className: 'at-sd-row' }),
          children: n.children }))
  }))

/* ⑤ 项目待办卡的底行（2026-11-10 用户原话：「快捷完成按钮需要在卡片的底部右侧，
 *   目前底部左侧还缺少更新时间」）。
 * 小程序 `todo-card` 是**三段纵排**：`.tc-main`（色条＋正文）/ `.tc-tags` / `.tc-foot`，
 * 底行 `justify-content:space-between` ＋ `margin-top:auto` ⇒ 左「更新于 …」右 `.tc-st`。
 * 上一版把圆圈 `align-self:center` 挂在横排末尾，那是"卡片垂直中线右侧"，而且底行根本没有。 */
check('round10-5: the project card foot holds the updated stamp (left) and the done circle (right)',
  (a) => {
    const css = a.AT.views.STYLE
    const foot = ruleOf(css, '.at-pj-todo-foot{')
    assert.ok(foot, 'the card needs a foot row')
    assert.ok(foot.includes('justify-content:space-between'), 'time left, circle right')
    assert.ok(foot.includes('margin-top:auto'), 'the foot is pushed to the card bottom')
    const at = ruleOf(css, '.at-pj-todo-at{')
    assert.ok(at && at.includes('font-size:11px'), 'the stamp is 11px like `.tc-meta-t`')

    const s = stateFor(a, { active: 'project' })
    const p = (s.projects || [])[0]
    assert.ok(p, 'the seed state needs a project with todos')
    const tree = a.AT.views.ProjectBody(s, p)
    const card = pickCls(tree, 'at-pj-todo')[0]
    assert.ok(card, 'the project body renders at least one todo card')
    const kids = (card.children || []).filter((n) => n && n.props)
    const footNode = kids.filter((n) => classList(n).indexOf('at-pj-todo-foot') >= 0)[0]
    assert.ok(footNode, 'the card has a foot row')
    assert.equal(kids.indexOf(footNode), kids.length - 1, 'the foot is the LAST segment of the card')
    const stamp = byClass(footNode, 'at-pj-todo-at')
    assert.equal(stamp.length, 1, 'the foot stamps when it was updated')
    assert.ok(/^更新于 \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(texts(stamp[0])),
      'the stamp reads 更新于 YYYY-MM-DD HH:mm — minutes, no seconds')
    assert.equal(byClass(footNode, 'at-pj-done').length, 1, 'the done circle lives in the foot')
    const head = kids.filter((n) => classList(n).indexOf('at-pj-todo-head') >= 0)[0]
    assert.ok(head, 'the card has a head row')
    assert.equal(byClass(head, 'at-pj-done').length, 0,
      'the circle must not sit beside the text any more')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      ProjectBody: (s, p) => mapNodes(a.AT.views.ProjectBody(s, p), (n) => (
        classList(n).indexOf('at-pj-todo-at') < 0 ? n
          : { type: 'span', props: { className: 'at-pj-gone' }, children: n.children }))
    })
  })))

/* ⑥ 输入框**唯一基线**（2026-11-10 轮次 11）——
 * 用户原话：「搜索栏中的输入状态样式太难看了，需要统一优化一版，要和普通输入框的样式保持统一；
 * 插件的其他地方也有这个问题，也需要统一优化」。
 * 改前全仓 7 套输入框：圆角 7 / 9 / 10，高度 34 / 36 / 38，字号 13 / 14，边框令牌
 * `--at-hairline` / `--at-hairline-strong` / `--at-field-line` 三选一 —— 一屏三种长相。
 * 现在只认两档（都取自小程序 PC 端）：
 *   · 框档 `.sd-input`   —— 38 高 / 圆角 10 / 1px `--at-field-line` / 14px
 *   · 搜索档 `.tf-sear`  —— 壳 36 高 圆角 10，内层 input 34 高
 * 这条判据锁的是「**同一个东西只许有一个值**」，不是某个像素好看。
 * ⚠️ 不许把 `--at-hairline` 写回输入框边框：浅色同值、深色差一档（`#33363A` vs `#4A4D51`），
 *    写回去浅色快照完全看不出来，深色才露馅 —— 这类"只在另一档才现形"的偏差必须靠判据拦。 */
check('round10-6: every input shares one baseline (38 / 10 / field-line / 14)',
  (a) => {
    const b = blocks(a.css)
    /* 同一个类可能被拆成两条规则（`形状` 与 `高度` 分开写）或写成组选择器，
     * 所以取「所有命中它的规则体」拼起来判，而不是要求恰好一条。 */
    const bodyOf = (cls) => {
      const sels = (x) => x.sel.split(',').map((s) => s.trim())
      const bare = b.filter((x) => sels(x).includes(cls))
      const used = bare.length ? bare
        : b.filter((x) => sels(x).some((s) => s.endsWith(' ' + cls)))
      assert.ok(used.length >= 1, cls + ': rule body missing')
      return used.map((x) => x.body).join(';')
    }
    const field = ['.at-input', '.at-select', '.at-sd-input', '.at-gl-select',
      '.at-cx-input', '.at-cx-select']
    const shell = ['.at-pick-search', '.at-filter-search']
    const inner = ['.at-pick-input', '.at-filter-input']
    field.forEach((cls) => {
      const body = bodyOf(cls)
      assert.ok(body.includes('height:38px'), cls + ': 38 tall like .sd-input')
      assert.ok(body.includes('border-radius:10px'), cls + ': radius 10')
      assert.ok(body.includes('border:1px solid var(--at-field-line)'),
        cls + ': 1px --at-field-line, not --at-hairline')
      assert.ok(body.includes('font-size:14px'), cls + ': 14px like .sd-input')
    })
    shell.forEach((cls) => {
      const body = bodyOf(cls)
      assert.ok(body.includes('height:36px'), cls + ': 36 tall like .tf-sear')
      assert.ok(body.includes('border-radius:10px'), cls + ': radius 10')
      assert.ok(body.includes('border:1px solid var(--at-field-line)'),
        cls + ': 1px --at-field-line, not --at-hairline')
    })
    inner.forEach((cls) => {
      const body = bodyOf(cls)
      assert.ok(body.includes('height:34px'), cls + ': 34 inside the shell')
      assert.ok(body.includes('font-size:14px'), cls + ': 14px like .tf-input')
    })
    /* 任何输入类都不许再挂 `--at-hairline` / 非 10 的圆角。
     * 唯一登记豁免：脑图工具条那颗 28 高下拉（`.at-mm-bar .at-select`）——
     * 它是「紧凑工具条档」，28 高配 8 圆角才不显得像胶囊；但必须同时满足 height ≤ 32，
     * 否则就是拿"紧凑"当挡箭牌把表单输入也放行了。 */
    const COMPACT = /\.at-mm-bar \.at-select|\.at-mm-info \.at-input/
    const INPUTISH = /\.(at-input|at-select|at-textarea|at-sd-input|at-sd-area-box|at-gl-input|at-gl-select|at-cx-input|at-cx-select|at-cx-area|at-mm-ta-box|at-filter-search|at-pick-search)(?![\w-])/
    b.filter((x) => INPUTISH.test(x.sel)).forEach((x) => {
      assert.ok(!/--at-hairline/.test(x.body),
        'input border must use --at-field-line: ' + x.sel.trim())
      const r = /border-radius:(\d+)px/.exec(x.body)
      if (r && !COMPACT.test(x.sel)) {
        assert.equal(r[1], '10', 'every input radius is 10: ' + x.sel.trim())
      }
      if (COMPACT.test(x.sel)) {
        const h = /height:(\d+)px/.exec(x.body)
        if (h) assert.ok(Number(h[1]) <= 32, 'a compact-field exemption must stay ≤32 tall')
      }
    })
  },
  (a) => withCss(a, swap(a.css, '.at-gl-select{height:38px', '.at-gl-select{height:36px')))

/* ⑦ 未登录是**可感知的默认态**（2026-11-10 轮次 12）——
 * 用户原话：「把当前默认展示的「演示数据」改为「请登录」状态。用户点击「请登录」后弹出登录弹窗，
 * 弹窗中心位置展示小程序码」「未登录用户打开任意页面时，均弹窗提示「请登录」」。
 *
 * 这一组判据守三件事，都不是"有没有这个元素"那么松：
 *   ① 状态键的**文案与语义**（读作邀请，不读作徽章 / 不可用）；
 *   ② 小程序码在弹窗里的**位置**（居中、在说明之前）与它恒白的底板；
 *   ③ 闸门的**触发点**（进页面 + 首帧）与"退出登录后不被立刻再弹"这条反例。
 * ⚠️ 上一轮的教训：只判"logo 存在且尺寸对"时，放右上角也算过 —— 位置/侧别必须单独判。 */
check('round12-1: the default state reads 请登录 — a clickable entry, not a demo badge',
  (a) => {
    a.AT.bridge.ui({ connected: false, connectOpen: false, bootReady: true, user: null })
    const tree = a.AT.shell.Workspace()
    const pill = byClass(tree, 'at-status')
    assert.equal(pill.length, 1, 'the top bar carries exactly one status key')
    assert.equal(texts(pill[0]).trim(), '请登录', 'the default state must say 请登录')
    assert.ok(classList(pill[0]).indexOf('is-guest') >= 0, 'the guest key has its own state class')
    assert.ok(classList(pill[0]).indexOf('is-on') < 0, 'no connected class while logged out')
    assert.ok(!/演示数据/.test(texts(pill[0])), '演示数据 is no longer the state label')
    assert.ok(/请登录/.test(String(pill[0].props.title)), 'the tooltip invites the click too')
    assert.equal(typeof pill[0].props.onClick, 'function', 'and the key is the login entry')
    /* 状态类与规则体成对：`is-guest` 必须真有样式。用 opacity 弱化是"不可用"的反义,
     * 这里必须明确排除 —— 否则下一版很可能用淡一点来表达"未登录"。 */
    const rule = ruleOf(a.AT.shell.STYLE, '.at-status.is-guest{')
    assert.ok(rule, 'the guest state needs a rule body')
    assert.ok(/background:var\(--at-yellow-warm\)/.test(rule), 'the guest key reads as an invite')
    assert.ok(/border-color:var\(--at-yellow-line\)/.test(rule))
    assert.ok(!/opacity/.test(rule), 'fading it out would say "disabled", the opposite of the ask')
    /* 文字必须是主墨，不许用品牌黄：`#E5A400` 压 `#FFE9A8` 只有约 1.8:1，12px 根本读不出来。
     * 这一条拦的不是审美，是"把强调色当文字色"这个惯性。 */
    assert.ok(/color:var\(--at-primary\)/.test(rule), 'the label uses primary ink, like the primary button')
    assert.ok(!/--at-yellow-deep/.test(rule), 'brand yellow stays on the dot, not on the text')
    /* 极窄档不许把它藏掉：它现在同时是登录入口,藏字就等于没有门。 */
    assert.ok(!/\.at-topbar \.at-status\{font-size:0\}/.test(a.AT.desktop.STYLE),
      'the login entry must survive the narrow breakpoint')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    shell: Object.assign({}, a.AT.shell, {
      Workspace: () => mapNodes(a.AT.shell.Workspace(), (n) => (
        classList(n).indexOf('at-status') < 0 ? n : Object.assign({}, n, { children: ['演示数据'] })))
    })
  })))

/* ② 登录弹窗：小程序码在中心，文案说清"码从哪来、粘到哪"。 */
check('round12-2: the login dialog centres the mini-program code and says where the code lives',
  (a) => {
    const s = stateFor(a, { connectOpen: true, connected: false, bootReady: true, connectError: '' })
    const el = a.AT.overlays.ConnectModal(s)
    assert.ok(el, 'connectOpen renders the dialog')
    /* ConnectModal 返回的是 `<ConnectBody>` **元素**（函数组件不会被 createElement 展开），
     * 判据要的是渲染后的树 ⇒ 直接调它的函数体。 */
    const tree = typeof el.type === 'function' ? el.type(el.props) : el
    const css = a.AT.overlays.STYLE
    const layer = ruleOf(css, '.at-connect{')
    assert.ok(/align-items:center/.test(layer) && /justify-content:center/.test(layer),
      'the dialog is centred in the pane, not parked at the top')
    /* 位置：码在步骤文案**之前**（视觉上先看到码）。 */
    const all = nodesOf(tree)
    const clsIdx = (cls) => all.findIndex((n) => classList(n).indexOf(cls) >= 0)
    const qi = clsIdx('at-connect-qr'), si = clsIdx('at-connect-steps')
    assert.ok(qi > -1, 'the mini-program code sits inside the dialog')
    assert.ok(si > qi, 'the code comes first, the steps explain it below')
    const qr = byClass(tree, 'at-connect-qr-img')
    assert.equal(qr.length, 1, 'exactly one mini-program code')
    assert.equal(String(qr[0].props.src), '/agent-todo/assets/qr-miniapp.jpg',
      'the code is the mini-program one, not the official-account QR')
    assert.ok(fs.existsSync(path.join(root, 'assets', 'qr-miniapp.jpg')), 'the asset ships with the plugin')
    const wrap = ruleOf(css, '.at-connect-qr{')
    assert.ok(/flex-direction:column/.test(wrap) && /align-items:center/.test(wrap),
      'the code is centred on its own axis')
    const img = ruleOf(css, '.at-connect-qr-img{')
    assert.ok(/width:168px/.test(img), '168 square — big enough to scan from a screenshot')
    assert.ok(/background:var\(--at-qr\)/.test(img),
      'the code keeps a white plate in both themes — a dark plate will not scan')
    /* 文案三件事：我的页 / 复制登录验证码 / 粘贴回来。 */
    const body = textIn(tree)
    ;['「我的」页', '登录验证码', '粘贴', '小程序'].forEach((k) => {
      assert.ok(body.includes(k), 'the dialog must spell out ' + k + ' — got: ' + body)
    })
    /* 未登录档必须留"不登录也能看"的出口，否则演示数据等于被关在门后。 */
    assert.ok(body.includes('先看看演示数据'), 'there is a way to keep browsing the demo')

    /* 已登录档：同一只弹窗换成账号卡，**不再出现登录码** ——
     * 给已登录用户看"怎么登录"是纯粹的噪音，还会让人以为掉线了。 */
    const s2 = stateFor(a, { connectOpen: true, connected: true, bootReady: true,
      user: { nickname: '杜春生' } })
    const el2 = a.AT.overlays.ConnectModal(s2)
    const t2 = typeof el2.type === 'function' ? el2.type(el2.props) : el2
    assert.equal(byClass(t2, 'at-connect-qr-img').length, 0, 'no sign-in code once connected')
    assert.equal(byClass(t2, 'at-connect-steps').length, 0, 'and no "how to sign in" steps either')
    const body2 = textIn(t2)
    assert.ok(body2.includes('杜春生'), 'the account dialog names who is connected')
    assert.ok(body2.includes('退出登录'), 'and still offers a way out')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    overlays: Object.assign({}, a.AT.overlays, {
      ConnectModal: (s) => {
        const el = a.AT.overlays.ConnectModal(s)
        if (!el) return el
        const tree = typeof el.type === 'function' ? el.type(el.props) : el
        return mapNodes(tree, (n) => (classList(n).indexOf('at-connect-qr-img') < 0 ? n : null))
      }
    })
  })))

/* ③ 闸门：进页面就提示；但"退出登录"不当场再弹（用户上一秒才明确要求退出）。 */
check('round12-3: every page open asks a logged-out session to log in',
  (a) => {
    const gate = a.AT.shell.gateFor
    assert.equal(typeof gate, 'function', 'the gate decision is a pure function, testable')
    assert.equal(gate({ bootReady: true, connected: false }), true, '未登录 ⇒ 该弹')
    assert.equal(gate({ bootReady: false, connected: false }), false,
      '探测落地前不判定 —— 已配对用户进场不能先闪一次登录')
    assert.equal(gate({ bootReady: true, connected: true }), false, '已登录不打扰')
    /* 触发点只能挂在「进入模块」与「探测落地」上。依赖里一旦出现 connected，
     * 用户点完「退出登录」会被立刻再弹一次 —— 那是当场打脸。 */
    const shellSrc = fs.readFileSync(path.join(srcDir, '50-shell.js'), 'utf8')
    assert.ok(/\[uiState\.active, uiState\.bootReady\]/.test(shellSrc),
      'the gate fires on page entry and on boot, nothing else')
    assert.ok(!/\[uiState\.active,[^\]]*connected/.test(shellSrc),
      'connected must not be a trigger — otherwise 退出登录 bounces straight back')
    assert.ok(/ui\(\{ bootReady: true \}\)/.test(a.src),
      'bootstrap must settle bootReady whether the probe succeeds or not')
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    shell: Object.assign({}, a.AT.shell, { gateFor: () => false })
  })))

/* ④ 演示数据保留：未登录**不清空**任何一条 —— 只是换了一句话和一道门。 */
check('round12-4: the demo data stays on screen while logged out',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const init = Core.initialState()
    assert.equal(init.ui.connected, false, 'logged out is the seed state')
    assert.ok((init.todos || []).length >= 4, 'and it still ships a full demo set')
    assert.ok((init.projects || []).length >= 2, 'projects included')
    assert.ok((init.capsules || []).length >= 3, 'capsules included')
    /* 用**未登录**的 state 直接渲染待办列表（不经过 store，免得被前序判据改脏）：
     * 演示条目必须还在页面上 —— "未登录"只换来一句话和一道门，不是空库。 */
    const s = stateFor(a, { active: 'todo', connected: false })
    const body = textIn(a.AT.panes.ListPane({ s: s, kind: 'todo' }))
    assert.ok(body.includes('把 Agent-ToDo 的 Capture 做成全局快捷键'),
      'a demo todo is still listed while logged out — got: ' + body.slice(0, 120))
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    core: Object.assign({}, a.AT.core, {
      initialState: () => Object.assign({}, a.AT.core.initialState(), { todos: [] })
    })
  })))


/* ------------------------------------------------ round13: hook 顺序安全 --- */
/* ★★ 这两条是**白屏级**事故的闸门，判的是 hooks 链的完整性。
 *
 * 2026-11-10 现场：登录打通后点「脑图」整页白屏。根因不是数据、不是样式 ——
 * 70-mindmap 的 Editor 把「拖拽/平移监听」这个 useEffect 放在 `if (!tree) return`
 * **之后**：未登录时树恒为 null（loadTree 在 !connected 直接返回），首帧就 return，
 * 一次渲染收工，所以这个 hook 从没被执行、也就从没暴露；登录后树要异步拉，
 * 首帧 tree=null（少一个 hook）、第二帧树到了（多一个 hook）⇒ React 抛
 * "Rendered more hooks than during the previous render"，整个插件白屏。
 * 同一处还有第二个坑：`AT.mindmap.Preview` 被当普通函数调（`Preview(s, mm)`），
 * 它自己的 4 个 hooks 就挂到 TodoDetail 头上，而那段又在 `mm ? … : …` 分支里。
 *
 * 两条判据都按**逐文件**扫 srcMap，不拼成一整串 —— 报错要能说出是哪个文件哪个组件。 */
const HOOK_RE = /React\.use(State|Effect|Ref|Memo|Callback|Reducer|Context)/
/* 合法直调白名单：这些是**纯渲染函数**（签名 `function Xxx(s, …)`，零 hooks），
 * 当函数调是设计如此，不算组件。往里加名字前先确认它真的没有 hook。 */
const RENDER_ONLY = ['ProjectBody', 'TodoBody', 'OverviewBody', 'MineBody',
  'Detail', 'CapsulePickBody', 'CapsulePicker', 'MindmapPickBody', 'MindmapPicker', 'FilterPanel']

function hookAfterEarlyReturn(files) {
  const bad = []
  for (const name of Object.keys(files)) {
    const lines = stripComments(files[name]).split('\n')
    const bounds = []
    lines.forEach((l, i) => {
      const m = /^  function ([A-Z]\w*)\s*\(/.exec(l)
      if (m) bounds.push([i, m[1]])
    })
    bounds.forEach(([start, fn], k) => {
      const end = k + 1 < bounds.length ? bounds[k + 1][0] : lines.length
      let ret = -1
      for (let j = start + 1; j < end; j++) {
        const t = lines[j].trim()
        /* 提前 return 经常长成 `if (!tree) return h(…)` —— 不能只判行首 startsWith，
         * 那样会把本次事故的那一句整个漏掉（第一版就是这么漏的）。 */
        if (t === 'return null' || /(?:^|[\s;])return h\(/.test(t)) { ret = j; break }
      }
      if (ret < 0) return
      for (let j = ret + 1; j < end; j++) {
        if (HOOK_RE.test(lines[j])) {
          bad.push(name + '::' + fn + ' → hook at line ' + (j + 1) + ' sits after early return at line ' + (ret + 1))
        }
      }
    })
  }
  return bad
}

function looseComponentCalls(files) {
  const ok = new Set(RENDER_ONLY)
  const bad = []
  for (const name of Object.keys(files)) {
    const body = stripComments(files[name])
    const re = /AT\.[a-z]+\.[A-Z]\w*\(/g
    let m
    while ((m = re.exec(body))) {
      const fn = m[0].slice('AT.'.length, -1).split('.')[1]
      if (!ok.has(fn)) bad.push(name + ': ' + m[0])
    }
  }
  return bad
}

/* h = React.createElement ⇒ 组件函数不会自己执行，光数 children 会得到假绿。
 * 这条把函数组件真的调一遍（并按 React 的规矩补上 props.children）。 */
function expandTree(node, depth) {
  depth = depth || 0
  if (node == null || typeof node === 'boolean') return []
  if (Array.isArray(node)) return node.reduce((acc, n) => acc.concat(expandTree(n, depth)), [])
  if (typeof node !== 'object') return []
  if (depth > 40) return []
  if (typeof node.type === 'function') {
    const props = Object.assign({}, node.props)
    if (node.children && node.children.length) props.children = node.children
    return expandTree(node.type(props), depth + 1)
  }
  return [node].concat(expandTree(node.children || [], depth + 1))
}

check('round13-1: a component may not hide hooks behind an early return', (a) => {
  const bad = hookAfterEarlyReturn(a.srcMap)
  assert.deepEqual(bad, [],
    'hooks after an early return ⇒ "Rendered more hooks than during the previous render": ' + bad.join(' | '))
  /* 顺带把「确实有一段 effect 在 Editor 里」钉住 —— 反过来说，把整段删掉也能让上面变绿，
   * 那不是修复。tree 判空的提前 return 必须在这段监听**之后**。 */
  const mm = a.srcMap['70-mindmap.js']
  const iReturn = mm.indexOf("if (!tree) return h('div', { className: 'at-mm' },")
  const iWheel = mm.indexOf("document.addEventListener('mousemove', move)")
  assert.ok(iReturn > 0 && iWheel > 0)
  assert.ok(iWheel < iReturn, 'the global drag/pan listener must be registered above the tree guard')
}, (a) => withFile(a, '70-mindmap.js', swap(a.srcMap['70-mindmap.js'],
  "if (!tree) return h('div', { className: 'at-mm' },",
  "if (!tree) return h('div', { className: 'at-mm' },\n      React.useState('boom'),")))

check('round13-2: a component with hooks must be mounted, not invoked', (a) => {
  const bad = looseComponentCalls(a.srcMap)
  assert.deepEqual(bad, [], 'hook-bearing components called as plain functions: ' + bad.join(' | '))
  /* `AT.mindmap.Preview` 是这轮真正踩到的那个。注意导出表里它**不是组件** ——
   * `Preview: previewOf` 是 `previewOf(s, mm)` 的位置参数包装，真组件叫 `PreviewView`。
   * 第一版就是按组件去挂 `Preview`，h() 只传 props ⇒ mm 变 undefined ⇒
   * 「Cannot read properties of undefined (reading 'id')」，比原 bug 还直接。 */
  const vb = a.srcMap['62-views-b.js']
  assert.ok(vb.includes('h(AT.mindmap.PreviewView, {'),
    'the mindmap preview must be mounted through PreviewView (props-shaped), not the Preview wrapper')
  assert.ok(!/h\(AT\.mindmap\.Preview,/.test(vb), 'Preview is a positional wrapper — never mount it')

  /* 行为级：真的把「待办详情 + 关联脑图」这棵树展开一遍。
   * 静态断言只能保证"写了 h("，写对了参数形态得靠跑一遍。 */
  const seed = a.AT.core.initialState()
  const mm = { id: 'mm-r13', projectId: 'p1', name: '探针脑图', nodes: 2, depth: 1,
    format: 'logic', agentId: '', aiState: '', flashAt: '', updatedAt: '2026-11-10 12:00:00' }
  const tree = { id: 'n1', text: '根', level: 0, children: [{ id: 'n2', text: '子', level: 1, children: [] }] }
  const todo = { id: 't-r13', projectId: seed.projects[0].id, mindmapId: mm.id, text: '带脑图的待办',
    urgency: 'hold', done: false, createdAt: '2026-11-10 10:00:00', completedAt: null,
    updatedAt: '2026-11-10 10:00:00', images: [], flashAt: '', deletedAt: null, deleted: false }
  const s = Object.assign({}, seed, {
    mindmaps: [mm], todos: [todo], tree: { [mm.id]: tree },
    ui: Object.assign({}, seed.ui, { active: 'todo', todoId: todo.id, paneWidth: 1240 }),
  })
  const nodes = expandTree(a.AT.views.TodoBody(s, todo))
  const cls = nodes.map((n) => String((n.props && n.props.className) || '')).join(' ')
  assert.ok(cls.includes('at-tbd-mm-box'), 'the 关联脑图 card must actually render (not throw)')
}, (a) => withFile(a, '62-views-b.js', swap(a.srcMap['62-views-b.js'],
  'h(AT.mindmap.PreviewView, { key: mm.id, s: s, mm: mm })',
  'h(AT.mindmap.Preview, { key: mm.id, s: s, mm: mm })')))

/* ============================ round 16 · 2026-11-11 导出抽屉 / 信息增强 ===
 * 用户口径：「待办导出这块的交互不太对，参考小程序 PC 端的弹窗抽屉修改；
 *            另外其中的『增强』功能也没有连通」。
 * 改前两处病灶：① 导出抽屉内部是 U.Check ＋ .at-code（Markdown 换行被吃掉）、
 *   「增强」是正文里一颗普通按钮，底栏只有复制键；② 点「增强」只把 mode 换成
 *   enhance，**不发请求**，要用户再点一次「重试 / 重新增强」才调模型。
 * 这一组现读小程序 form-drawer.wxss 的 .ex-* / .sd-alt / .enh-* 逐值比对，
 * 并对「点击 → 一次请求 → loading → done → 复制」做行为级断言。
 */
function exportState(a, formPatch) {
  const s = stateFor(a)
  const todo = (s.todos || [])[0]
  const f = Object.assign({ mode: 'export', id: todo ? todo.id : '', offset: 0,
    scope: {}, preset: {}, draft: null, parent: null }, formPatch || {})
  return Object.assign({}, s, { ui: Object.assign({}, s.ui, { form: f }) })
}
function exportTree(a, formPatch) {
  return a.AT.drawers.FormDrawer({ s: exportState(a, formPatch) })
}
const drawersSrc = (a) => a.srcMap['90-drawers.js']
/* 模型调用是花钱接口：spy 返回一枚**永不落地**的 Promise，让状态停在 loading，
 * 免得 microtask 在判据结束之后偷偷把 store 改掉（check() 是同步的）。 */
function withEnhanceSpy(a, fn) {
  const b = a.AT.bridge
  const orig = b.actions.enhance
  const calls = []
  b.actions.enhance = function (text) {
    calls.push(text)
    return new Promise(function () {})
  }
  try { return fn(calls, b) } finally { b.actions.enhance = orig; b.ui({ form: null }) }
}

/* ① 皮肤逐值照抄小程序 .sd 导出段；状态类与规则体成对。 */
check('round16-1: export/enhance skin equals the live .sd export spec',
  (a) => {
    const sd = a.AT.drawers.STYLE
    const SKIN = [
      ['.ex-box', '.at-drawer .at-ex-box{', ['border-radius', 'padding']],
      ['.ex-text', '.at-drawer .at-ex-text{', ['font-size', 'line-height']],
      ['.ex-sw', '.at-drawer .at-ex-sw{', ['height', 'gap', 'margin-top']],
      ['.ex-sw-box', '.at-drawer .at-ex-sw-box{', ['width', 'height', 'border-radius']],
      ['.ex-sw-t', '.at-drawer .at-ex-sw-t{', ['font-size']],
      ['.sd-alt', '.at-drawer .at-sd-alt{', ['height', 'padding', 'border-radius', 'font-size', 'gap']],
      ['.enh-load', '.at-drawer .at-enh-load{', ['gap', 'padding']],
      ['.enh-spin', '.at-drawer .at-enh-spin{', ['width', 'height', 'border-radius']],
      ['.enh-err', '.at-drawer .at-enh-err{', ['border-radius', 'padding', 'gap']],
      ['.enh-retry', '.at-drawer .at-enh-retry{', ['height', 'padding', 'border-radius', 'font-size', 'gap']],
      ['.enh-note', '.at-drawer .at-enh-note{', ['padding', 'border-radius', 'font-size', 'line-height']]
    ]
    SKIN.forEach(function (row) {
      const body = ruleOf(sd, row[1])
      assert.ok(body, 'plugin rule missing: ' + row[1])
      row[2].forEach(function (prop) {
        const v = mpVal(row[0], prop)
        assert.ok(v, 'mini-program value missing: ' + row[0] + ' / ' + prop)
        assert.ok(body.includes(prop + ':' + v),
          row[1] + ' must carry ' + prop + ':' + v + ' from ' + row[0])
      })
    })
    /* 原 .at-code 没有 pre-wrap ⇒ 导出的 Markdown 被压成一坨，这是本轮最实的一处修复。 */
    assert.ok(ruleOf(sd, '.at-drawer .at-ex-text{').includes('white-space:pre-wrap'),
      'read-only preview must keep Markdown newlines')
    /* 类名与规则体成对验收（v1.5 门控卡那次教训）。 */
    ;['.at-drawer .at-ex-sw.is-on ', '.at-drawer .at-sd-alt.is-off',
      '.at-drawer .at-sd-submit.is-copied', '.at-drawer .at-sd-submit.is-off',
      '.at-drawer .at-enh-retry:hover'].forEach(function (sel) {
      assert.ok(sd.includes(sel), sel + ' is rendered but has no rule body')
    })
  },
  (a) => withDrawers(a, { STYLE: swap(a.AT.drawers.STYLE,
    'white-space:pre-wrap', 'white-space:normal') }))

/* ② 渲染树：只读预览 / 整行开关 / 底栏两颗键的顺序与配色闸门。 */
check('round16-2: export renders .ex-box + full-row switch + foot enhance key on the right',
  (a) => {
    const tree = exportTree(a)
    const body = byClass(tree, 'at-drawer-body')[0]
    const foot = byClass(tree, 'at-drawer-foot')[0]
    assert.ok(body && foot, 'drawer body / foot must exist')
    assert.equal(byClass(tree, 'at-ex-box').length, 1, 'one read-only preview box')
    assert.equal(byClass(tree, 'at-ex-text').length, 1)
    assert.equal(byClass(tree, 'at-ex-sw').length, 1, 'the whole row is the checkbox')
    assert.equal(byClass(tree, 'at-check').length, 0, 'U.Check is gone')
    assert.equal(byClass(tree, 'at-code').length, 0, 'old code block is gone')
    const alt = byClass(foot, 'at-sd-alt')
    assert.equal(alt.length, 1)
    assert.equal(texts(alt[0]), '增强')
    const ico = nodes(alt[0]).find((n) => n.type === a.AT.ui.Icon)
    assert.ok(ico && ico.props.name === 'bolt' && ico.props.size === 15 &&
      ico.props.tone === 'ink', 'yellow key needs a permanent-ink bolt 15')
    const buttons = nodes(foot).filter((n) => n.type === 'button')
    assert.equal(buttons.length, 2, 'copy + enhance, no third key')
    assert.ok(String(buttons[0].props.className).includes('at-sd-submit'), 'copy comes first')
    assert.ok(String(buttons[1].props.className).includes('at-sd-alt'), 'enhance on the right')
    assert.equal(nodes(body).filter((n) => n.type === 'button' && texts(n).includes('增强')).length,
      0, 'enhance is not a body button anymore')
  },
  (a) => breakTree(a, (t) => {
    byClass(t, 'at-sd-alt').forEach((n) => { n.props.className = 'at-sd-altX' })
    return t
  }))

/* ③ 请求只挂在「点击」这一条链上：全仓一个调用点，且不在 effect / 生命周期里。 */
check('round16-3: the model call has exactly one click-driven call site',
  (a) => {
    const d = drawersSrc(a)
    assert.ok(/function runEnhance\(source\)/.test(d), 'module-level request runner exists')
    assert.ok(d.includes('B.actions.enhance(source)'), 'the runner really calls the backend')
    assert.equal((d.match(/B\.actions\.enhance\(/g) || []).length, 1,
      'exactly one call site — no silent token burn on drawer reopen')
    assert.ok(!/React\.useEffect\([\s\S]{0,600}B\.actions\.enhance/.test(d),
      'a request must never start from an effect')
    assert.ok(d.includes("state: 'loading'") && d.includes("out ? 'done' : 'error'") &&
      d.includes("state: 'error'"), 'loading / done / error are all written by the runner')
    assert.ok(d.includes("if (!now || now.mode !== 'enhance' || !now.enh || now.enh.seq !== seq) return"),
      'late responses must be dropped by the seq guard')
  },
  (a) => withFile(a, '90-drawers.js', swap(drawersSrc(a),
    'B.actions.enhance(source)', 'Promise.resolve({ text: source })')))

/* ④ 行为级：点一下「增强」＝发一次请求（入参就是那一屏预览）＋ 开 L2 进 loading。
 * 这条守的就是「没连通」：改前 onClick 只 openForm，calls 恒为 0。 */
check('round16-4: clicking 增强 fires one request with the exact preview and opens L2 in loading',
  (a) => withEnhanceSpy(a, (calls, b) => {
    const s = exportState(a)
    const preview = a.AT.text.copyTodoText(s, s.ui.form.id, { noImage: false })
    assert.ok(preview, 'demo todo must have export text')
    const tree = a.AT.drawers.FormDrawer({ s: s })
    byClass(tree, 'at-sd-alt')[0].props.onClick()
    assert.equal(calls.length, 1, 'exactly one model call per click')
    assert.equal(calls[0], preview, 'the enhanced text is the very same preview')
    const f = b.get().ui.form
    assert.equal(f.mode, 'enhance', 'L2 drawer opens')
    assert.equal(f.enh.state, 'loading', 'L2 starts in loading, never idle-blank')
    assert.equal(f.preset.enhSource, preview, 'retry keeps the same source')
    assert.equal(f.parent.mode, 'export', 'closing L2 returns to the export drawer')
  }),
  (a) => breakTree(a, (t) => {
    byClass(t, 'at-sd-alt').forEach((n) => { n.props.onClick = function () {} })
    return t
  }))

/* ⑤ 三态渲染：loading 转圈 / error 成因＋重试 / done 只读结果；主键在没结果时压暗。 */
check('round16-5: enhance drawer renders all three states and gates its copy key',
  (a) => {
    const loading = exportTree(a, { mode: 'enhance', preset: { enhSource: 'SRC' },
      enh: { state: 'loading', seq: 1 } })
    assert.equal(byClass(loading, 'at-enh-load').length, 1)
    assert.equal(byClass(loading, 'at-enh-spin').length, 1)
    assert.ok(texts(loading).includes('正在增强提示词…'))
    assert.ok(String(byClass(loading, 'at-sd-submit')[0].props.className).includes('is-off'))

    const err = exportTree(a, { mode: 'enhance', preset: { enhSource: 'SRC' },
      enh: { state: 'error', error: '模型超时，请重试', seq: 1 } })
    assert.equal(byClass(err, 'at-enh-err').length, 1)
    assert.ok(texts(err).includes('模型超时，请重试'), 'say what went wrong, not a silent toast')
    assert.equal(byClass(err, 'at-enh-retry').length, 1)
    assert.ok(String(byClass(err, 'at-sd-submit')[0].props.className).includes('is-off'))

    const done = exportTree(a, { mode: 'enhance', preset: { enhSource: 'SRC' },
      enh: { state: 'done', text: 'RESULT', notice: '图片已移到末尾', seq: 1 } })
    assert.equal(byClass(done, 'at-ex-box').length, 1)
    assert.ok(texts(done).includes('RESULT'))
    assert.equal(byClass(done, 'at-enh-note').length, 1)
    assert.ok(!String(byClass(done, 'at-sd-submit')[0].props.className).includes('is-off'),
      'a real result must be copyable')
    assert.equal(byClass(done, 'at-sd-alt').length, 0, 'L2 has no second enhance key')
  },
  (a) => breakTree(a, (t) => {
    byClass(t, 'at-ex-box').forEach((n) => { n.props.className = 'at-code' })
    return t
  }))

/* ⑥ 重试沿用首次那份输入；L1 的「不含图片」在 L2 往返之间不许被重置。 */
check('round16-6: retry reuses the first source and the export switch survives the round trip',
  (a) => {
    const d = drawersSrc(a)
    assert.ok(d.includes('function retryEnhance() { if (enhSource) runEnhance(enhSource) }'),
      'retry calls the runner with enhSource, not a freshly computed preview')
    assert.ok(!/runEnhance\(preview\)/.test(d), 'no second input口径')
    assert.ok(d.includes('preset: { enhSource: source, noImage: !!v.noImage }'),
      'the click freezes both the text and the noImage switch')
    assert.ok(d.includes("if (mode === 'export' || mode === 'enhance') return { noImage: !!preset.noImage }"),
      'both drawers read the same noImage value')
    return withEnhanceSpy(a, (calls, b) => {
      const s = exportState(a, { draft: { noImage: true } })
      const tree = a.AT.drawers.FormDrawer({ s: s })
      assert.ok(String(byClass(tree, 'at-ex-sw')[0].props.className).includes('is-on'),
        'switch starts on')
      byClass(tree, 'at-sd-alt')[0].props.onClick()
      const f = b.get().ui.form
      assert.equal(f.preset.noImage, true, 'source was built with noImage=true')
      assert.equal(f.preset.enhSource, calls[0], 'frozen source and request are the same string')
      assert.equal(f.parent.draft.noImage, true, 'back to L1 with the switch still on')
    })
  },
  (a) => withFile(a, '90-drawers.js', swap(drawersSrc(a),
    'runEnhance(enhSource)', 'runEnhance(preview)')))

/* ⑦ 预览（＝增强的输入）必须是完整的一份：脑图树没到就补拉，不许把残文送进模型。 */
check('round16-7: a missing mindmap tree is fetched before the preview is copied or enhanced',
  (a) => {
    const d = drawersSrc(a)
    assert.ok(/React\.useEffect\(function \(\) \{[\s\S]{0,400}B\.loadTree\(todo\.mindmapId\)/.test(d),
      'export/enhance drawer must complete its preview first')
    assert.ok(d.includes('!s.tree[todo.mindmapId]'), 'only when the tree is missing')
    assert.ok(d.includes('[mode, id, todo && todo.mindmapId, s.tree]'), 'deps are explicit')
    /* hooks 是一条连续链：这个 effect 必须排在最后那个 render return 之前。 */
    const body = d.slice(d.indexOf('  function FormDrawer(props)'))
    assert.ok(body.indexOf('React.useEffect(') >= 0 &&
      body.indexOf('React.useEffect(') < body.indexOf("return h('div', null,"),
      'the effect must not hide behind the final render return')
  },
  (a) => withFile(a, '90-drawers.js', swap(drawersSrc(a),
    'B.loadTree(todo.mindmapId)', 'void todo.mindmapId')))

/* ════════════════════════════════════════════════════════════════════════
 * 轮次 17 · 待办详情两颗 ✕（胶囊「取消关联」/ 图片「移除」）——逐值对齐小程序
 * `.cap-del` / `.img-del`。旧版是 20 圆 ＋ `tone:'w'` 的墨色 close.svg：
 * 墨叉画在 `--at-solid` 深底上，浅色档只剩一块黑方块（用户截图）。
 * ── 三条分别钉住：求值后的 CSS 几何 / 图标资源契约 / 渲染树里的真图标。
 * ════════════════════════════════════════════════════════════════════════ */
check('round17-1: detail ✕ keys are the mini-program 24/36 solid circles with a clear text lane',
  (a) => {
    const sel = '.at-tbd-cap-x,.at-tbd-img-x'
    assert.ok(hasRule(a.css, sel, /width:24px/) && hasRule(a.css, sel, /height:24px/),
      'both ✕ keys must be 24px visual circles, not the old 20px dots')
    assert.ok(hasRule(a.css, sel, /border-radius:999px/), 'round, never a black square')
    assert.ok(hasRule(a.css, sel, /top:6px/) && hasRule(a.css, sel, /right:6px/),
      'offset must match the mini-program .cap-del')
    assert.ok(hasRule(a.css, sel, /z-index:2/), '✕ must sit above the card text')
    const hot = '.at-tbd-cap-x::after,.at-tbd-img-x::after'
    assert.ok(hasRule(a.css, hot, /content:""/) && hasRule(a.css, hot, /width:36px/) &&
      hasRule(a.css, hot, /height:36px/),
      '36px hit area comes from a transparent pseudo element, never padding')
    assert.ok(hasRule(a.css, '.at-tbd-cap-t', /padding-right:22px/),
      'the first text line must yield 22px, or the 24px disc covers it')
  },
  (a) => withCss(a, swap(a.css,
    'width:24px;height:24px;border:0;border-radius:999px',
    'width:20px;height:20px;border:0;border-radius:50%')))

check('round17-2: the ✕ glyph is the permanent-white w-close asset, never tone:w',
  (a) => {
    const I = a.AT.icons
    assert.equal(I.iconSrc('w-close', '', false), I.BASE + 'w-close.svg',
      'w-close resolves to the white asset in light mode')
    assert.equal(I.iconSrc('w-close', '', true), I.BASE + 'w-close.svg',
      'w- assets are unprefixed: dark mode must not invent d-w-close')
    /* 把病根钉在契约上：'w' 不是 'white' 的别名，旧写法拿到的就是墨色叉。 */
    assert.equal(I.iconSrc('close', 'w', false), I.BASE + 'close.svg',
      "tone:'w' silently falls back to the ink glyph — that is exactly the black square")
    /* 注释里也会写 tone:'w' 当病因说明 ⇒ 源码级断言必须先剥注释（v1.10 的坑）。 */
    const d = stripComments(a.srcMap['62-views-b.js'])
    assert.equal((d.match(/name: 'w-close', size: 14/g) || []).length, 2,
      'both the capsule ✕ and the image ✕ must render w-close 14')
    assert.ok(!/tone:\s*'w'/.test(d), "tone:'w' is not a supported icon tone")
    assert.ok(!/name: 'close', size: 13/.test(d), 'ink close on a solid dark disc is invisible')
  },
  (a) => withFile(a, '62-views-b.js', swap(a.srcMap['62-views-b.js'],
    "name: 'w-close', size: 14", "name: 'close', size: 13, tone: 'w'")))

check('round17-3: both rendered ✕ buttons actually carry the white glyph',
  (a) => {
    const B = a.AT.bridge, Core = a.AT.core
    const before = JSON.parse(JSON.stringify(B.get()))
    try {
      const tid = seedViewable(a)
      const st = B.get()
      const tree = a.AT.views.TodoBody(st, Core.byId(st.todos, tid))
      ;['at-tbd-cap-x', 'at-tbd-img-x'].forEach((cls) => {
        const btn = pickCls(tree, cls)[0]
        assert.ok(btn, cls + ' must render')
        const ico = (btn.children || []).filter((n) => n && n.props && n.props.name)[0]
        assert.ok(ico, cls + ' must contain an icon element')
        assert.equal(ico.props.name, 'w-close', cls + ' glyph must be the white asset')
        assert.equal(ico.props.size, 14, cls + ' glyph must be 14')
        assert.ok(!ico.props.tone, cls + ' must not pass an unsupported tone')
      })
    } finally { B.store.set(() => before); B.ui({ confirm: null }) }
  },
  (a) => withAT(a, Object.assign({}, a.AT, {
    views: Object.assign({}, a.AT.views, {
      TodoBody: (s, t) => mapNodes(a.AT.views.TodoBody(s, t), (n) => {
        if (!n || !n.props || n.props.name !== 'w-close') return n
        return Object.assign({}, n, { props: Object.assign({}, n.props,
          { name: 'close', size: 13, tone: 'w' }) })
      })
    })
  })))

/* ════════════════════════════════════════════════════════════════════════
 * 轮次 18 · 输入框侧两个全局浮层（导出待办到输入框 / 记一条闪念）
 * ① 未登录在弹窗里明说「当前是演示数据」；② 每次展开重新拉 /sync；
 * ③ 闪念保存键置灰（含键盘 Ctrl+Enter 的同一道门）。
 * 行为真值另见 scripts/verify-global-overlays.cjs（真执行 useEffect）。
 * ════════════════════════════════════════════════════════════════════════ */
check('round18-1: the logged-out banner is the guest warm-yellow skin, not disabled grey',
  (a) => {
    const demo = blocks(a.css).filter((b) => b.sel.trim() === '.at-gl-demo')
    assert.equal(demo.length, 1, 'exactly one evaluated .at-gl-demo rule')
    const body = demo[0].body
    assert.ok(body.includes('background:var(--at-yellow-warm)'), 'warm yellow fill')
    assert.ok(body.includes('var(--at-yellow-line)'), 'yellow hairline')
    assert.ok(body.includes('color:var(--at-primary)'), 'main ink, not yellow-deep')
    assert.ok(!body.includes('--at-yellow-deep'), '#E5A400 on #FFE9A8 is only ~1.8:1')
    assert.ok(!/opacity:/.test(body), 'opacity reads as disabled, not as a notice')
    assert.ok(hasRule(a.css, '.at-pick-demo', /margin:0 18px 10px/),
      'picker banner aligns to the 18px gutter')
  },
  (a) => withCss(a, swap(a.css,
    'background:var(--at-yellow-warm)', 'background:var(--at-chip)')))

check('round18-2: both overlays gate the banner on connected and disable all three save keys',
  (a) => {
    const d = stripComments(a.srcMap['95-overlays.js'])
    assert.equal((d.match(/var guest = !s\.ui\.connected/g) || []).length, 2,
      'picker and quick capture each derive their own guest flag')
    assert.equal((d.match(/guest \? DemoNote\(\{/g) || []).length, 2,
      'both overlays must render the demo notice while logged out')
    assert.ok(d.includes("'未登录 · 演示数据'") && d.includes('演示数据'),
      'the notice must say the data is demo data')
    assert.equal((d.match(/disabled: saving \|\| guest/g) || []).length, 3,
      'flash / capsule / todo save keys are all disabled for a guest')
    assert.ok(/if \(!B\.get\(\)\.ui\.connected\) \{ B\.toast\('请先登录后再保存', 'danger'\); return \}/.test(d),
      'Ctrl+Enter bypasses disabled props: save() itself must carry the same gate')
  },
  (a) => withFile(a, '95-overlays.js', swap(a.srcMap['95-overlays.js'],
    "if (!B.get().ui.connected) { B.toast('请先登录后再保存', 'danger'); return }",
    'if (false) return')))

check('round18-3: the picker re-syncs from its [open] effect, once and only while logged in',
  (a) => {
    const d = stripComments(a.srcMap['95-overlays.js'])
    assert.equal((d.match(/B\.sync\(false\)/g) || []).length, 1,
      'one single refresh call site — never from render, never per row')
    assert.ok(/if \(B\.get\(\)\.ui\.connected\) B\.sync\(false\)/.test(d),
      'demo data must not hit /sync (device JWT + a spurious connect error)')
    const eff = d.slice(d.indexOf('function ComposerPicker()'))
    /* ⚠️ effect 内部第一句也是 `if (!open) return`（不带 h(...)）——
     * 用它当边界会把 sync 切掉，必须取渲染期的那句 `return h(GlobalStyle, null)`。 */
    const effectBody = eff.slice(0, eff.indexOf('if (!open) return h(GlobalStyle, null)'))
    assert.ok(effectBody.includes('B.sync(false)'), 'the refresh must live in the effect')
    assert.ok(/\}, \[open\]\)/.test(effectBody),
      'deps stay [open]: a store refresh must not re-trigger it')
    assert.ok(/s\.ui\.syncing \? h\('span', \{ className: 'at-pick-syncing' \}/.test(d),
      'the refresh is visible in the footer')
  },
  (a) => withFile(a, '95-overlays.js', swap(a.srcMap['95-overlays.js'],
    'if (B.get().ui.connected) B.sync(false)', 'void B.get().ui.connected')))

/* ════════════════════════════════════════════════════════════════════════
 * 轮次 20 · 悬浮 logo → 闪念胶囊列表：每次打开重新拉 /sync
 * 口径与 §4.11 输入框导出器一致；行为真值另见 scripts/verify-capsule-refresh.cjs
 * （真按 deps 执行 useEffect，并模拟一次 pointerdown/up 点击悬浮键）。
 * ════════════════════════════════════════════════════════════════════════ */
check('round20-1: the capsule layer re-syncs from a [open] effect, once and only while logged in',
  (a) => {
    const d = stripComments(a.srcMap['80-capsule.js'])
    assert.equal((d.match(/B\.sync\(false\)/g) || []).length, 1,
      'one single refresh call site — never from render, never per card')
    const at = d.indexOf('B.sync(false)')
    assert.ok(at > d.indexOf('function FloatingCapsule()'),
      'the refresh lives in the capsule layer, not in a module-level handler')
    assert.ok(/React\.useEffect\(function \(\) \{/.test(d.slice(Math.max(0, at - 300), at)),
      'refresh must be registered by an effect, not called during render')
    assert.ok(/if \(!open\) return\s+if \(B\.get\(\)\.ui\.connected\) B\.sync\(false\)/.test(d),
      'a closed drawer and guests must never hit /sync')
    assert.ok(/\}, \[open\]\)/.test(d.slice(at, at + 90)),
      'deps stay [open]: a store refresh / record / paginate must not re-trigger it')
  },
  (a) => withFile(a, '80-capsule.js', swap(a.srcMap['80-capsule.js'],
    'if (B.get().ui.connected) B.sync(false)', 'void B.get().ui.connected')))

check('round20-2: /sync really replaces the capsule inbox (adaptSnapshot keeps capsules)',
  (a) => {
    const snap = a.AT.core.adaptSnapshot({ capsules: [
      { id: 'c1', text: 'new flash', createdAt: '2026-11-11T07:00:00Z' },
      { id: 'c2', text: 'gone', deletedAt: '2026-11-11T07:01:00Z' },
      { id: 'c3', text: 'linked', consumedAt: '2026-11-11T07:02:00Z' }
    ] })
    assert.equal(snap.capsules.length, 3, 'every server capsule survives adaptation')
    assert.equal(a.AT.core.capsules(snap).length, 1,
      'only the live, unlinked capsule shows in the inbox')
    assert.equal(a.AT.core.deletedCapsules(snap).length, 1,
      'deleted flags survive, or the deleted list would go empty')
    const d = stripComments(a.srcMap['20-core.js'])
    assert.ok(/capsules: capsules/.test(d),
      'the snapshot must actually carry capsules into the store, or the refresh is a no-op')
  },
  (a) => withFile(a, '20-core.js', swap(a.srcMap['20-core.js'],
    'capsules: capsules,', 'capsules: [],')))

check('round20-3: the logo click flips open, so the [open] effect really fires on every open',
  (a) => {
    const d = stripComments(a.srcMap['80-capsule.js'])
    const opener = d.slice(d.indexOf('function openCapsule('), d.indexOf('function closeCapsule('))
    assert.ok(/open: true/.test(opener), 'openCapsule must set open:true')
    const up = d.slice(d.indexOf('function onFabUp('), d.indexOf('function onFabCancel('))
    assert.ok(/openCapsule\(''\)/.test(up), 'pointer-up on the FAB opens the list')
    const key = d.slice(d.indexOf('function onFabKey('), d.indexOf('function onCardClick('))
    assert.ok(/openCapsule\(''\)/.test(key), 'Enter / Space opens the list too')
  },
  (a) => withFile(a, '80-capsule.js', swap(a.srcMap['80-capsule.js'],
    "      openCapsule('')\n    }\n    function onFabCancel()", "      void 0\n    }\n    function onFabCancel()")))

console.log(JSON.stringify({ ok: true, checks: passed.length, passed }, null, 2))

