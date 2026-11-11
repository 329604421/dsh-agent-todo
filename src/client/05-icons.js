/* 05-icons.js — 直接复用小程序前端 assets/icons 的整套图标资源。
 *
 * 小程序 components/icon/icon.js 的口径：同一几何、三份配色，靠文件名前缀切换。
 *   x.svg      浅色（墨 #1C1C1E）
 *   d-x.svg    深色（柔白 #EEEDEA）
 *   w-x.svg    反白（纯白 #FFFFFF，落在 --solid 深底上，永不加前缀）
 *   tone=ink   恒墨（画在品牌黄 / 成功绿等恒亮面上，不加前缀）
 *   opacity    选中 1 / 未选中 0.62（导轨与底栏）
 *   size       22 主导航 / 20 顶栏 / 16 内容区 / 14 密集区 / 12 卡内微标
 *
 * 插件 Host 的 /agent-todo/assets 已能直出 .svg，所以这里不做内联、不造第二套
 * 几何，只把小程序的「语义名 → 文件变体」规则原样搬过来。
 */
;(function (AT, React, h) {
  'use strict'

  var BASE = '/agent-todo/assets/icons/'

  /* 54 个语义名（去掉 d- / w- 前缀去重），与小程序 assets/icons 逐字一致。 */
  var NAMES = [
    'add-child', 'add-sibling', 'album-b', 'album', 'bolt', 'calendar-b',
    'calendar', 'camera', 'canvas-b', 'canvas', 'chart-b', 'chart', 'check',
    'chevron-down', 'chevron-left', 'chevron-right', 'close', 'collapse',
    'copy', 'deploy', 'drag', 'edit', 'expand', 'export', 'file', 'format',
    'info-b', 'info', 'key-b', 'key', 'list', 'mindmap-b', 'mindmap', 'mine-b',
    'mine', 'more', 'overview', 'plus', 'project-b', 'project', 'question',
    'redo', 'refresh', 'robot-b', 'robot', 'search', 'sliders-b', 'sliders',
    'todo-b', 'todo', 'trash-red', 'trash', 'undo', 'voice'
  ]
  var W_NAMES = [
    'w-check', 'w-chevron-left', 'w-close', 'w-copy', 'w-edit', 'w-export',
    'w-list', 'w-mindmap', 'w-plus', 'w-todo', 'w-trash', 'w-undo'
  ]
  /* 插件旧版自建图标名 → 小程序语义名。resolveName 先查 NAMES/W_NAMES，
   * 所以这里只收录「旧名本身不在真实图标集里」的映射：自映射（x: x）与
   * 和真实语义名重名的项（chart: overview）都是永不生效的死代码。 */
  var ALIAS = {
    image: 'album', mic: 'voice', chevron: 'chevron-right', left: 'chevron-left',
    down: 'chevron-down', up: 'chevron-right', 'chevron-up': 'chevron-down',
    link: 'deploy', spark: 'bolt', folder: 'project', filter: 'sliders',
    restore: 'undo', canvasb: 'canvas-b', chartb: 'chart-b', infob: 'info-b',
    keyb: 'key-b', robotb: 'robot-b', mineb: 'mine-b', projectb: 'project-b',
    todob: 'todo-b', mindmapb: 'mindmap-b'
  }
  var LOOKUP = {}
  NAMES.forEach(function (n) { LOOKUP[n] = true })
  W_NAMES.forEach(function (n) { LOOKUP[n] = true })

  function resolveName(name) {
    var n = String(name || 'info')
    if (LOOKUP[n]) return n
    if (ALIAS[n]) return ALIAS[n]
    if (LOOKUP['w-' + n]) return 'w-' + n
    return 'info'
  }
  function prefixFor(name, tone, dark) {
    if (tone === 'ink') return ''                 // 恒亮面 ⇒ 恒墨
    if (String(name).indexOf('w-') === 0) return ''  // 反白版是独立资产
    return dark ? 'd-' : ''
  }
  function iconSrc(name, tone, dark) {
    var n = resolveName(name), t = tone || ''
    if (t === 'white') {
      var w = 'w-' + n
      return BASE + (LOOKUP[w] ? w : n) + '.svg'
    }
    return BASE + prefixFor(n, t, !!dark) + n + '.svg'
  }

  /* ------------------------------------------------------------ theme --- */
  var darkState = null
  var listeners = []
  function readHostTheme() {
    if (typeof document === 'undefined' || !document.documentElement) return null
    var el = document.documentElement
    var attr = String(el.getAttribute ? el.getAttribute('data-theme') || '' : '').toLowerCase()
    var cls = String(el.className || '')
    var bodyCls = (document.body && String(document.body.className || '')) || ''
    if (/dark/.test(attr) || /(^|\s)(dark|theme-dark|is-dark)(\s|$)/.test(cls) ||
        /(^|\s)(dark|theme-dark)(\s|$)/.test(bodyCls)) return true
    if (/light/.test(attr) || /(^|\s)(light|theme-light|is-light)(\s|$)/.test(cls) ||
        /(^|\s)(light|theme-light)(\s|$)/.test(bodyCls)) return false
    return null                                   // 交给系统配色
  }
  function systemDark() {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    try { return !!window.matchMedia('(prefers-color-scheme: dark)').matches } catch (e) { return false }
  }
  function isDark() {
    if (darkState !== null) return darkState
    var host = readHostTheme()
    return host === null ? systemDark() : host
  }
  function setDark(value) {
    var next = !!value
    if (next === darkState) return
    darkState = next
    listeners.slice().forEach(function (fn) { try { fn(next) } catch (e) {} })
  }
  function subscribe(fn) {
    listeners.push(fn)
    return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1) }
  }
  /* 宿主可能在运行时切主题：属性变化 + 系统配色两路都监听。 */
  function observeTheme() {
    var offs = []
    function refresh() { var host = readHostTheme(); setDark(host === null ? systemDark() : host) }
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        var mq = window.matchMedia('(prefers-color-scheme: dark)')
        var onMq = function () { if (readHostTheme() === null) refresh() }
        if (mq.addEventListener) { mq.addEventListener('change', onMq); offs.push(function () { mq.removeEventListener('change', onMq) }) }
        else if (mq.addListener) { mq.addListener(onMq); offs.push(function () { mq.removeListener(onMq) }) }
      } catch (e) { /* optional */ }
    }
    if (typeof document !== 'undefined' && document.documentElement && window.MutationObserver) {
      try {
        var mo = new window.MutationObserver(refresh)
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
        if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] })
        offs.push(function () { mo.disconnect() })
      } catch (e) { /* optional */ }
    }
    refresh()
    return function () { offs.forEach(function (fn) { try { fn() } catch (e) {} }) }
  }
  function useDark() {
    if (React.useSyncExternalStore) return React.useSyncExternalStore(subscribe, isDark, function () { return false })
    var pair = React.useState(isDark())
    React.useEffect(function () { return subscribe(function (v) { pair[1](v) }) }, [])
    return pair[0]
  }

  /* ------------------------------------------------------------- Icon --- */
  function Icon(props) {
    var p = props || {}
    var size = p.size == null ? 16 : Number(p.size)
    var opacity = p.opacity == null ? 1 : p.opacity
    var tone = p.tone || ''
    var src = iconSrc(p.name, tone, isDark())
    return h('img', {
      className: 'at-ico' + (p.className ? ' ' + p.className : ''),
      src: src, alt: '', 'aria-hidden': 'true', draggable: false,
      width: size, height: size,
      style: { width: size + 'px', height: size + 'px', opacity: opacity,
        display: 'block', flex: '0 0 auto' }
    })
  }

  AT.icons = {
    BASE: BASE, NAMES: NAMES, W_NAMES: W_NAMES, ALIAS: ALIAS,
    Icon: Icon, resolveName: resolveName, prefixFor: prefixFor, iconSrc: iconSrc,
    isDark: isDark, setDark: setDark, subscribe: subscribe,
    observeTheme: observeTheme, useDark: useDark
  }
})(AT, React, h)
