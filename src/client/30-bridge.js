/* 30-bridge.js — state container, Host proxy and the single write path.
 * Every mutation goes through commit(): optimistic core update → REST call →
 * rollback on failure. Mirrors store.js mark()/queue()/restore().
 */
;(function (AT, React, h) {
  'use strict'
  var Core = AT.core, Text = AT.text

  function createStore(initial) {
    var state = initial, listeners = []
    return {
      get: function () { return state },
      set: function (updater) {
        var next = typeof updater === 'function' ? updater(state) : updater
        if (next === state) return
        state = next
        listeners.slice().forEach(function (fn) { fn() })
      },
      subscribe: function (fn) {
        listeners.push(fn)
        return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1) }
      }
    }
  }
  var store = createStore(Core.initialState())
  function useStore() { return React.useSyncExternalStore(store.subscribe, store.get, store.get) }
  function get() { return store.get() }
  function ui(patch) {
    store.set(function (s) { return Object.assign({}, s, { ui: Object.assign({}, s.ui, patch) }) })
  }
  var toastTimer = null
  function toast(message, tone) {
    if (toastTimer) clearTimeout(toastTimer)
    var nonce = Date.now()
    ui({ toast: { message: String(message || ''), tone: tone || 'default', nonce: nonce } })
    toastTimer = setTimeout(function () {
      if (get().ui.toast && get().ui.toast.nonce === nonce) ui({ toast: null })
      toastTimer = null
    }, 3200)
  }

  async function api(method, path, body) {
    var init = { method: method, headers: { accept: 'application/json' } }
    if (body !== undefined) {
      init.headers['content-type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
    var res = await fetch('/agent-todo/api' + path, init)
    var data = await res.json().catch(function () { return null })
    if (!res.ok || !data || data.code !== 0) {
      var err = new Error((data && data.message) || ('请求失败（' + res.status + '）'))
      err.code = data && data.code
      throw err
    }
    return data.data
  }
  async function uploadImage(file) {
    var form = new FormData(); form.append('file', file)
    var res = await fetch('/agent-todo/api/files', { method: 'POST', body: form })
    var data = await res.json().catch(function () { return null })
    if (!res.ok || !data || data.code !== 0) throw new Error((data && data.message) || '图片上传失败')
    return data.data
  }
  /* ⚠️ format 必须跟着文件走：v1.8 起插件自己录的是 16k 单声道 PCM16 WAV
   * （DSH 语音服务只认这一种，后端 /asr 的腾讯云一句话识别也收 wav），
   * 写死 'mp3' 会让后端按错误容器解码 ⇒ 一句都识别不出来。 */
  async function asr(file, format) {
    var form = new FormData(); form.append('file', file)
    form.append('format', format || 'wav')
    var res = await fetch('/agent-todo/api/asr', { method: 'POST', body: form })
    var data = await res.json().catch(function () { return null })
    if (!res.ok || !data || data.code !== 0) throw new Error((data && data.message) || '语音识别失败')
    return data.data
  }

  function applySnapshot(snap) {
    var prev = store.get()
    var next = Object.assign({}, prev, snap, { ui: prev.ui })
    next.tree = Object.assign({}, prev.tree, snap.tree || {})
    next.hist = prev.hist
    store.set(next)
  }
  async function sync(showToast) {
    ui({ syncing: true })
    try {
      var data = await api('GET', '/sync')
      applySnapshot(Core.adaptSnapshot(data))
      ui({ connected: true, connectError: '' })
      if ((data.mindmaps || []).some(function (m) { return m.aiState === 'pending' })) startAiPolling()
      if (showToast) toast('已同步')
      return true
    } catch (e) {
      ui({ connected: false, connectError: e.message })
      if (showToast) toast(e.message, 'danger')
      return false
    } finally { ui({ syncing: false }) }
  }
  var bootstrapped = false
  async function bootstrap() {
    if (bootstrapped) return
    bootstrapped = true
    try {
      var res = await fetch('/agent-todo/state', { headers: { accept: 'application/json' } })
      var body = await res.json().catch(function () { return null })
      if (body && body.paired) {
        ui({ connected: true, user: body.user || null, apiBase: body.apiBase || get().ui.apiBase })
        await sync(false)
      }
    } catch (e) { bootstrapped = false }
    /* ★ 轮次 12：探测**落地**（成功或失败）才置 `bootReady` —— 登录闸门与
     * 「请登录」状态键都读它。早一帧置位会让已配对用户进场先弹一次登录弹窗。 */
    ui({ bootReady: true })
  }
  async function connect(value) {
    var v = String(value || '').trim()
    if (!v) { ui({ connectError: '请先粘贴 6 位登录验证码' }); return false }
    /* 6 位数字走设备配对；更长的串按登录令牌处理（小程序里直接复制的那条 JWT）——
     * 两条路都保留，是为了「验证码还没上线」时登录仍然走得通。 */
    var isCode = /^\d{6}$/.test(v)
    ui({ connectBusy: true, connectError: '' })
    try {
      var res = await fetch(isCode ? '/agent-todo/pair' : '/agent-todo/token', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(isCode ? { code: v } : { token: v })
      })
      var body = await res.json().catch(function () { return null })
      if (!res.ok || !body || !body.ok) throw new Error((body && body.message) || '连接失败')
      ui({ connected: true, user: body.user || null, connectBusy: false, connectOpen: false })
      await sync(true)
      return true
    } catch (e) {
      ui({ connectBusy: false, connectError: e.message })
      return false
    }
  }
  async function disconnect() {
    try { await fetch('/agent-todo/disconnect', { method: 'POST' }) } catch (e) { /* local anyway */ }
    var fresh = Core.initialState()
    fresh.ui = Object.assign({}, get().ui, {
      connected: false, connectOpen: false, connectError: '', bootReady: true })
    store.set(fresh)
    toast('已退出登录，当前展示演示数据')
  }

  /* Single write path. `local` is a pure state transform (core rules);
   * `req` is {method,path,body} or null; `resync` refreshes the snapshot
   * after creates/promotions so ids come from the server. */
  async function commit(local, req, opts) {
    var prev = store.get(), o = opts || {}
    if (local) store.set(local(prev))
    if (!prev.ui.connected) {
      if (o.okToast) toast(o.okToast)
      return true
    }
    try {
      if (req) await api(req.method, req.path, req.body)
      if (o.resync) await sync(false)
      if (o.okToast) toast(o.okToast)
      return true
    } catch (e) {
      store.set(prev)                       /* whole-block rollback */
      toast(e.message, 'danger')
      return false
    }
  }
  function req(method, path, body) { return { method: method, path: path, body: body } }

  /* Tree writes are serialised: 整树 PUT with concurrent edits otherwise races. */
  var treeQueue = Promise.resolve()
  function saveTree(mid, tree) {
    treeQueue = treeQueue.then(async function () {
      var s = get()
      if (!s.ui.connected) return
      try { await api('PUT', '/mindmaps/' + encodeURIComponent(mid) + '/tree', { treeJson: tree }) }
      catch (e) { toast(e.message, 'danger') }
    }).catch(function () {})
    return treeQueue
  }
  async function loadTree(mid) {
    var s = get()
    if (s.tree[mid]) return s.tree[mid]
    if (!s.ui.connected) return s.tree[mid] || null
    try {
      var d = await api('GET', '/mindmaps/' + encodeURIComponent(mid) + '/tree')
      var root = d && (d.treeJson || d.tree || d)
      store.set(function (cur) {
        var t = Object.assign({}, cur.tree); t[mid] = root
        return Object.assign({}, cur, { tree: t })
      })
      return root
    } catch (e) { toast('脑图没加载出来，这次只复制了正文', 'danger'); return null }
  }

  var aiTimer = null
  function stopAiPolling() { if (aiTimer) { clearInterval(aiTimer); aiTimer = null } }
  function startAiPolling() {
    if (aiTimer || !get().ui.connected) return
    aiTimer = setInterval(async function () {
      try {
        var d = await api('GET', '/mindmaps/ai-pending')
        var items = (d && d.items) || []
        var pending = items.filter(function (m) { return m.aiState === 'pending' }).length
        var s = get()
        var maps = s.mindmaps.map(function (m) {
          var hit = items.filter(function (x) { return x.id === m.id })[0]
          return hit ? Object.assign({}, m, { aiState: hit.aiState || '', name: hit.name || m.name,
            nodes: hit.nodeCount != null ? hit.nodeCount : m.nodes }) : m
        })
        store.set(Object.assign({}, s, { mindmaps: maps }))
        if (!pending) { stopAiPolling(); sync(false) }
      } catch (e) { stopAiPolling() }
    }, 3000)
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true }
    } catch (e) { /* fallback */ }
    try {
      var ta = document.createElement('textarea')
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      var ok = document.execCommand('copy'); ta.remove(); return ok
    } catch (e) { return false }
  }

  /* ------------------------------------------------------------- actions --- */
  var A = Core.rules
  var actions = {
    addProject: function (v) {
      var created = null
      return commit(function (s) { created = A.addProject(s, v); return created },
        req('POST', '/projects', { name: v.name, color: v.color || null, node: v.node, agentId: v.agentId || null, remark: v.remark || '' }),
        { resync: true, okToast: '项目已创建' })
    },
    updateProject: function (id, v) {
      return commit(function (s) { return A.updateProject(s, id, v) },
        req('PATCH', '/projects/' + encodeURIComponent(id), v), { okToast: '已保存' })
    },
    archiveProject: function (id, on) {
      return commit(function (s) { return A.archiveProject(s, id, on) },
        req('POST', '/projects/' + encodeURIComponent(id) + (on ? '/archive' : '/unarchive'), {}),
        { okToast: on ? '已归档 · 内容都在' : '已取消归档，项目回到活跃视图' })
    },
    addTodo: function (v) {
      return commit(function (s) { return A.addTodo(s, v) },
        req('POST', '/todos', { text: v.text, projectId: v.projectId, urgency: v.urgency || 'mid',
          mindmapId: v.mindmapId || null, images: v.images || [] }),
        { resync: true, okToast: '已记下' })
    },
    updateTodo: function (id, patch) {
      return commit(function (s) { return A.updateTodo(s, id, patch) },
        req('PATCH', '/todos/' + encodeURIComponent(id), patch))
    },
    toggleTodo: function (id) {
      var s = get(), t = Core.byId(s.todos, id)
      if (!t) return Promise.resolve(false)
      return commit(function (x) { return A.toggleTodo(x, id) },
        req('POST', '/todos/' + encodeURIComponent(id) + (t.done ? '/reopen' : '/complete'), {}))
    },
    removeTodo: function (id) {
      return commit(function (s) { return A.removeTodo(s, id) },
        req('DELETE', '/todos/' + encodeURIComponent(id)), { okToast: '已删除' })
    },
    restoreTodo: function (id) {
      return commit(function (s) { return A.restoreTodo(s, id) },
        req('POST', '/todos/' + encodeURIComponent(id) + '/restore', {}), { okToast: '已还原' })
    },
    addCapsule: function (text, opts) {
      var o = opts || {}, created = null
      return commit(function (s) { created = A.addCapsule(s, text, o); return created },
        req('POST', '/capsules', { text: text, source: o.source || 'text', imageUri: o.imageUri || null }),
        { resync: true }).then(function (ok) { return { ok: ok, capsule: created ? Core.byId(created.capsules, created.capsules[created.capsules.length - 1].id) : null } })
    },
    updateCapsule: function (id, patch) {
      return commit(function (s) { return A.updateCapsule(s, id, patch) },
        req('PATCH', '/capsules/' + encodeURIComponent(id), patch))
    },
    removeCapsules: function (ids) {
      var body = ids.length === 1 ? null : { ids: ids }
      return commit(function (s) { return A.removeCapsules(s, ids) },
        ids.length === 1 ? req('DELETE', '/capsules/' + encodeURIComponent(ids[0])) : req('DELETE', '/capsules', body),
        { okToast: '已删除' })
    },
    restoreCapsules: function (ids) {
      return commit(function (s) { return A.restoreCapsules(s, ids) },
        req('POST', '/capsules/restore', { ids: ids }), { okToast: '已还原' })
    },
    linkCapsules: function (tid, ids) {
      return commit(function (s) { return A.linkCapsules(s, tid, ids) },
        req('POST', '/todos/' + encodeURIComponent(tid) + '/capsules', { capsuleIds: ids }), { okToast: '已关联胶囊' })
    },
    unlinkCapsules: function (tid, ids) {
      return commit(function (s) { return A.unlinkCapsules(s, tid, ids) },
        req('DELETE', '/todos/' + encodeURIComponent(tid) + '/capsules', { capsuleIds: ids }))
    },
    promoteToTodo: function (ids, v) {
      return commit(function (s) {
        var images = ids.map(function (id) { return Core.byId(s.capsules, id) })
          .filter(function (c) { return c && c.imageUri })
          .map(function (c) { return { id: Core.uid('i'), label: '闪念截图', uri: c.imageUri } })
        var next = A.addTodo(s, { text: v.text, projectId: v.projectId, urgency: v.urgency || 'mid', images: images })
        var created = next.todos[next.todos.length - 1]
        return A.linkCapsules(next, created.id, ids)
      }, req('POST', '/capsules/' + encodeURIComponent(ids[0]) + '/promote-to-todo',
        { text: v.text, projectId: v.projectId, urgency: v.urgency || 'mid' }),
      { resync: true, okToast: '已转成待办' })
    },
    promoteToMindmap: function (mid, ids) {
      return commit(function (s) {
        var next = s, root = JSON.parse(JSON.stringify(next.tree[mid] ||
          { id: Core.uid('n'), text: '闪念胶囊', children: [] }))
        var t = Text.findNode(root, 'cap-root')
        if (!t) {
          t = { id: 'cap-root', text: '闪念胶囊', remark: '', kind: 'branch', children: [] }
          root = Text.relevel(Object.assign({}, root, { children: (root.children || []).concat([t]) }), 0)
        }
        var host = Text.findNode(root, 'cap-root')
        ids.forEach(function (cid) {
          var c = Core.byId(next.capsules, cid)
          if (c) host.children.push({ id: Core.uid('n'), text: c.text || '', remark: '', kind: 'leaf',
            imageUri: c.imageUri || '', children: [] })
        })
        var tree = Object.assign({}, next.tree); tree[mid] = Text.relevel(root, 0)
        next = Object.assign({}, next, { tree: tree })
        next = A.consumeCapsules(next, ids)
        return next
      }, req('POST', '/capsules/promote-to-mindmap', { mindmapId: mid, capsuleIds: ids }),
      { okToast: '已转脑图' })
    },
    promoteToMindmapAi: function (ids) {
      if (!get().ui.connected) {
        toast('未登录不调用模型。登录后可用 AI 整理，当前可手动转脑图。')
        return Promise.resolve(false)
      }
      return commit(null, req('POST', '/capsules/to-mindmap-ai', { capsuleIds: ids }),
        { resync: true, okToast: '模型正在处理，请稍后查看' }).then(function (ok) {
        if (ok) { startAiPolling(); toast('模型正在处理，请稍后查看') }
        return ok
      })
    },
    retryMindmapAi: function (id) {
      return commit(null, req('POST', '/mindmaps/' + encodeURIComponent(id) + '/ai-retry', {}),
        { resync: true, okToast: '已重新提交' }).then(function (ok) { if (ok) startAiPolling(); return ok })
    },
    addMindmap: function (v) {
      return commit(function (s) { return A.addMindmap(s, v) },
        req('POST', '/mindmaps', { projectId: v.projectId, name: v.name, format: v.format }),
        { resync: true, okToast: '已新建脑图' })
    },
    updateMindmap: function (id, patch) {
      return commit(function (s) { return A.replaceEntity(s, 'mindmap', id, Object.assign({ updatedAt: Core.stamp() }, patch)) },
        req('PATCH', '/mindmaps/' + encodeURIComponent(id), patch), { okToast: '已保存' })
    },
    removeMindmap: function (id) {
      return commit(function (s) { return A.removeMindmap(s, id) },
        req('DELETE', '/mindmaps/' + encodeURIComponent(id)), { okToast: '已删除' })
    },
    setTree: function (mid, tree, opts) {
      var o = opts || {}
      var patch = function (s) {
        var t = Object.assign({}, s.tree); t[mid] = tree
        var baseHist = s.hist
        if (o.history !== false && !baseHist[mid] && s.tree[mid]) {
          baseHist = Text.historyPush(baseHist, mid, s.tree[mid])
        }
        var hist = o.history === false ? baseHist : Text.historyPush(baseHist, mid, tree)
        var maps = s.mindmaps.map(function (m) { return m.id === mid
          ? Object.assign({}, m, { nodes: Text.countNodes(tree), depth: Text.depthOf(tree), updatedAt: Core.stamp() }) : m })
        return Object.assign({}, s, { tree: t, hist: hist, mindmaps: maps })
      }
      return commit(patch, null, {}).then(function (ok) { saveTree(mid, tree); return ok })
    },
    updateMe: function (patch) {
      return commit(function (s) { return Object.assign({}, s, { me: Object.assign({}, s.me, patch) }) },
        req('PATCH', '/me', patch), { okToast: '资料已更新' })
    },
    addAgent: function (v) {
      return commit(function (s) { return Object.assign({}, s, { agents: s.agents.concat([Object.assign({ id: Core.uid('a'), updatedAt: Core.stamp() }, v)]) }) },
        req('POST', '/agents', v), { resync: true, okToast: '已创建 agent' })
    },
    updateAgent: function (id, v) {
      return commit(function (s) { return A.replaceEntity(s, 'agent', id, v) },
        req('PATCH', '/agents/' + encodeURIComponent(id), v), { okToast: '已保存' })
    },
    removeAgent: function (id) {
      return commit(function (s) { return Object.assign({}, s, {
        agents: s.agents.filter(function (a) { return a.id !== id }),
        projects: s.projects.map(function (p) { return p.agentId === id ? Object.assign({}, p, { agentId: '' }) : p }) }) },
      req('DELETE', '/agents/' + encodeURIComponent(id)), { okToast: '已删除' })
    },
    addToken: function (v) {
      return commit(function (s) { return Object.assign({}, s, { tokenKeys: s.tokenKeys.concat([Object.assign({ id: Core.uid('k'), hasKey: true, updatedAt: Core.stamp() }, v)]) }) },
        req('POST', '/token-keys', v), { resync: true, okToast: '已添加' })
    },
    updateToken: function (id, v) {
      return commit(function (s) { return A.replaceEntity(s, 'token', id, v) },
        req('PATCH', '/token-keys/' + encodeURIComponent(id), v), { okToast: '已保存' })
    },
    removeToken: function (id) {
      return commit(function (s) { return Object.assign({}, s, { tokenKeys: s.tokenKeys.filter(function (k) { return k.id !== id }) }) },
        req('DELETE', '/token-keys/' + encodeURIComponent(id)), { okToast: '已删除' })
    },
    refreshTokenKeys: function () {
      return commit(null, req('POST', '/token-keys/refresh', {}), { resync: true })
    },
    enhance: function (text) {
      if (!get().ui.connected) return Promise.reject(new Error('未登录不调用模型，登录后可使用 AI 增强'))
      return api('POST', '/ai/enhance', { text: text })
    }
  }

  AT.bridge = {
    store: store, useStore: useStore, get: get, ui: ui, toast: toast,
    api: api, uploadImage: uploadImage, asr: asr, sync: sync, bootstrap: bootstrap,
    connect: connect, disconnect: disconnect, commit: commit, actions: actions,
    loadTree: loadTree, saveTree: saveTree, startAiPolling: startAiPolling,
    stopAiPolling: stopAiPolling, copyText: copyText, applySnapshot: applySnapshot
  }
})(AT, React, h)
