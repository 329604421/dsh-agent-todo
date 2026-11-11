/* 99-entry.js — DSH-native registration (mirrors dsh-bili-mini):
 *   inject: ['slots','locale'] · ctx.locale.register/bind · ctx.inject
 *   slot registrations carry locale: NS · apply() returns a disposer.
 * Fallbacks keep the module loadable on hosts without ctx.inject/locale.
 */
;(function (AT) {
  'use strict'
  var B = AT.bridge, C = AT.const, S = AT.shell, O = AT.overlays
  var NS = 'agent-todo'
  var t = function (key) {
    return (C.DICTIONARY.zh && C.DICTIONARY.zh[key]) || key
  }
  function disposeOf(v) {
    if (!v) return
    if (typeof v === 'function') { try { v() } catch (e) {} }
    else if (typeof v.dispose === 'function') { try { v.dispose() } catch (e) {} }
  }
  function registerSlots(ctx) {
    var offs = []
    function inject(name, fn) {
      try { offs.push(ctx.slots.inject(name, fn)) }
      catch (e) { /* slot unavailable on this host */ }
    }
    inject('sidebar.panellist', function () {
      return ctx.slots.register({
        name: 'sidebar.panellist', id: NS, order: 20, locale: NS,
        label: function () { return t('title') }
      }, O.SidebarIcon)
    })
    inject('main', function () {
      return ctx.slots.register({ name: 'main', key: NS, locale: NS }, S.Workspace)
    })
    inject('shell.overlay', function () {
      return ctx.slots.register({ name: 'shell.overlay', id: 'agent-todo-capture', order: 20, locale: NS }, O.QuickCapture)
    })
    inject('shell.overlay', function () {
      return ctx.slots.register({ name: 'shell.overlay', id: 'agent-todo-composer', order: 22, locale: NS }, O.ComposerPicker)
    })
    inject('shell.overlay', function () {
      return ctx.slots.register({ name: 'shell.overlay', id: 'agent-todo-toast', order: 21, locale: NS }, O.GlobalToast)
    })
    /* 闪念胶囊升级为 DSH 全局能力：悬浮品牌键 + 内容区抽屉，不依赖主面板。 */
    inject('shell.overlay', function () {
      return ctx.slots.register({ name: 'shell.overlay', id: 'agent-todo-capsule', order: 19, locale: NS },
        AT.capsule.FloatingCapsule)
    })
    inject('conversation.input.left', function () {
      return ctx.slots.register({ name: 'conversation.input.left', id: 'agent-todo-handoff', order: 30, locale: NS }, O.ComposerButton)
    })
    inject('conversation.chat.assistant-actions', function () {
      return ctx.slots.register({ name: 'conversation.chat.assistant-actions', id: 'agent-todo-save', order: 11, locale: NS }, O.AssistantSaveAction)
    })
    return function () { offs.forEach(disposeOf) }
  }

  function createClient() {
    return {
      inject: ['slots', 'locale'],
      apply: function (ctx) {
        var disposeLocale = null
        try {
          if (ctx.locale && typeof ctx.locale.register === 'function') {
            disposeLocale = ctx.locale.register(NS, C.DICTIONARY)
            if (typeof ctx.locale.bind === 'function') t = ctx.locale.bind(NS)
          }
        } catch (e) { /* dictionary is optional */ }

        var slotDispose = null
        if (ctx && typeof ctx.inject === 'function') {
          slotDispose = ctx.inject(['slots'], function () { return registerSlots(ctx) })
          /* ★ v1.8 · 语音转写走宿主自带能力（`speech` Remote → SenseVoice 本地跑）。
           * ⚠️ 不写进顶层 `inject` 数组：那个服务属于「语音输入 Bundle」，用户没启用时
           *    整块插件会连带不加载。用延迟注入，有就挂上，没有就退回后端 /asr。 */
          try {
            ctx.inject(['remote'], function (scope) {
              var rem = (scope && scope.remote) || ctx.remote
              if (AT.voice) AT.voice.attach(rem)
            })
          } catch (e) { /* 宿主没有 remote 服务：只走后端识别 */ }
        } else {
          slotDispose = registerSlots(ctx)
        }

        var onKey = function (event) {
          var capture = (event.altKey && event.code === 'Space') ||
            ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space')
          if (!capture) return
          event.preventDefault()
          B.ui({ captureOpen: true, captureSeed: '', captureCapsuleOnly: false })
        }
        window.addEventListener('keydown', onKey, true)
        var stopTheme = AT.icons.observeTheme()
        B.bootstrap()

        return function () {
          window.removeEventListener('keydown', onKey, true)
          B.stopAiPolling()
          AT.capsule.stopRecord()
          if (stopTheme) stopTheme()
          disposeOf(slotDispose)
          disposeOf(disposeLocale)
        }
      }
    }
  }
  AT.entry = { createClient: createClient, registerSlots: registerSlots, NS: NS }
})(AT, React, h)
