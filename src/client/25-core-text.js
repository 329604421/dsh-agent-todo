/* 25-core-text.js — Markdown / heatmap / tree logic, 1:1 with
 * 小程序前端/utils/markdown.js, store.js heatWeeks() and tree writers.
 */
;(function (AT) {
  'use strict'
  var Core = AT.core, C = AT.const

  /* ------------------------------------------------------------ markdown --- */
  function altText(s, fallback) {
    var v = String(s == null ? '' : s).replace(/\n/g, ' ').replace(/([\[\]])/g, '\\$1').trim()
    return v || fallback
  }
  function resolveHref(raw, imageUrl) {
    if (!raw) return ''
    if (typeof imageUrl === 'function') return imageUrl(raw) || raw
    if (imageUrl === null) return raw
    return raw
  }
  function heading(level, text) {
    return new Array(Math.min(level + 1, 6) + 1).join('#') + ' ' + text
  }
  function treeToMarkdown(root, opt) {
    var o = opt || {}, lines = []
    if (!root) return ''
    function walk(node, mdLevel) {
      if (!node) return
      if (mdLevel <= 5) {
        lines.push(heading(mdLevel, node.text || ''))
        if (node.remark) { lines.push(''); lines.push(node.remark) }
        if (o.meta && node.task) lines.push('> ' + node.task)
        lines.push('')
      } else {
        var indent = new Array(mdLevel - 5 + 1).join('  ')
        lines.push(indent + (o.tasks ? '- [ ] ' : '- ') + (node.text || ''))
        if (node.remark) lines.push(indent + '  ' + node.remark)
      }
      ;(node.children || []).forEach(function (kid) { walk(kid, mdLevel + 1) })
    }
    if (o.root) walk(root, 0)
    else (root.children || []).forEach(function (kid) { walk(kid, 1) })
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }
  function todoToMarkdown(todo, mindmapRoot, opt) {
    var o = opt || {}, parts = []
    var body = String(todo && todo.text || '')
    if (!o.noImage && todo && todo.images && todo.images.length) {
      var pics = []
      todo.images.forEach(function (im, i) {
        var raw = typeof im === 'string' ? im : (im && im.uri)
        if (!raw) return
        pics.push('![' + altText(im && im.label, '图片' + (i + 1)) + '](' + resolveHref(raw, o.imageUrl) + ')')
      })
      if (pics.length) body += '\n\n' + pics.join('\n')
    }
    parts.push(body)
    if (mindmapRoot) parts.push(treeToMarkdown(mindmapRoot, { root: true, tasks: false }))
    var caps = o.capsules || []
    if (caps.length) {
      var seg = ['---', '', '闪念胶囊', ''], picNo = 0
      caps.forEach(function (c) {
        var text = typeof c === 'string' ? c : (c && c.text || '')
        var uri = typeof c === 'object' ? (c && (c.uri || c.imageUri)) : ''
        var has = !!(text || uri)
        if (!has) return
        if (text) {
          var ls = String(text).split('\n')
          ls.forEach(function (line, i) { seg.push((i === 0 ? '- ' : (line ? '  ' : '')) + line) })
        }
        if (uri) {
          picNo += 1
          seg.push((text ? '  ' : '- ') + '![胶囊图片 ' + picNo + '](' + resolveHref(uri, o.imageUrl) + ')')
        }
      })
      parts.push(seg.join('\n'))
    }
    return parts.join('\n\n')
  }

  /* ------------------------------------------------------------- heatmap --- */
  function levelOf(sum) {
    if (sum <= 0) return 0
    if (sum <= 10) return 1
    if (sum <= 25) return 2
    if (sum <= 49) return 3
    return 4
  }
  function heatWeeks(s) {
    var led = s.activity || {}
    return (s.heat.weeks || []).map(function (w) {
      return { weekNo: w.weekNo, key: w.key, days: w.days.map(function (d) {
        var a = led[d.date] || {}
        var created = (d.created || 0) + (a.created || 0)
        var completed = (d.completed || 0) + (a.completed || 0)
        var capsule = (d.capsule || 0) + (a.capsule || 0)
        var sum = created + completed + capsule
        return Object.assign({}, d, { created: created, completed: completed, capsule: capsule,
          sum: sum, level: levelOf(sum), label: d.label })
      }) }
    })
  }
  function heatDay(s, week, day) {
    var w = heatWeeks(s).filter(function (x) { return x.weekNo === week })[0]
    return w ? w.days.filter(function (d) { return d.dayIndex === day })[0] : null
  }
  function todayCell(s) {
    var today = Core.dateOf(Core.stamp())
    var weeks = heatWeeks(s), i, j
    for (i = weeks.length - 1; i >= 0; i--) {
      for (j = 0; j < 7; j++) if (weeks[i].days[j] && weeks[i].days[j].date === today) {
        return { week: weeks[i].weekNo, day: j }
      }
    }
    return weeks.length ? { week: weeks[weeks.length - 1].weekNo, day: 6 } : null
  }

  /* ---------------------------------------------------------------- tree --- */
  function cloneTree(t) { return Core.clone(t) }
  function findNode(root, id) {
    if (!root) return null
    if (root.id === id) return root
    var kids = root.children || [], i, hit
    for (i = 0; i < kids.length; i++) { hit = findNode(kids[i], id); if (hit) return hit }
    return null
  }
  function findParent(root, id) {
    if (!root || root.id === id) return null
    var kids = root.children || [], i
    for (i = 0; i < kids.length; i++) {
      if (kids[i].id === id) return root
      var hit = findParent(kids[i], id)
      if (hit) return hit
    }
    return null
  }
  function countNodes(root) { return root ? 1 + (root.children || []).reduce(function (n, k) { return n + countNodes(k) }, 0) : 0 }
  function depthOf(root) { return root ? 1 + Math.max.apply(null, [0].concat((root.children || []).map(depthOf))) : 0 }
  function relevel(root, level) {
    if (!root) return root
    root.level = level || 0
    root.kind = level === 0 ? 'root' : ((root.children || []).length ? 'branch' : 'leaf')
    ;(root.children || []).forEach(function (k) { relevel(k, (level || 0) + 1) })
    return root
  }
  function visibleTree(root) {
    if (!root) return null
    var copy = Object.assign({}, root)
    if (!root.collapsed) copy.children = (root.children || []).map(visibleTree)
    else copy.children = []
    return copy
  }
  function isDescendant(root, ancestorId, id) {
    var a = findNode(root, ancestorId)
    return !!(a && (a.id === id || findNode(a, id)))
  }
  function cloneWithIds(node) {
    var copy = Object.assign({}, node, { id: Core.uid('n'), children: [] })
    ;(node.children || []).forEach(function (k) { copy.children.push(cloneWithIds(k)) })
    if (node.links) copy.links = []          /* 关联连线不跟着复制，避免指向旧树 */
    return copy
  }
  function flatNodes(root) {
    var out = []
    ;(function walk(n, level) {
      if (!n) return
      out.push({ id: n.id, text: n.text || '', level: level,
        children: (n.children || []).length, collapsed: !!n.collapsed })
      ;(n.children || []).forEach(function (k) { walk(k, level + 1) })
    })(root, 0)
    return out
  }
  function allLinks(root) {
    var out = []
    ;(function walk(n) {
      if (!n) return
      ;(n.links || []).forEach(function (l) {
        out.push({ id: l.id, from: n.id, to: l.to, label: l.label || '' })
      })
      ;(n.children || []).forEach(walk)
    })(root)
    return out
  }
  var treeRules = {
    addNode: function (root, selId, text, asSibling) {
      var t = cloneTree(root), node = { id: Core.uid('n'), text: text || '新节点', remark: '', children: [] }
      if (!t) { relevel(node, 0); return node }
      var target = findNode(t, selId) || t
      if (asSibling && target !== t) {
        var p = findParent(t, target.id)
        if (p) p.children.splice(p.children.indexOf(target) + 1, 0, node)
        else t.children.push(node)
      } else target.children = (target.children || []).concat([node])
      return relevel(t, 0)
    },
    updateNode: function (root, id, patch) {
      var t = cloneTree(root), n = findNode(t, id)
      if (n) Object.assign(n, patch)
      return t
    },
    removeNode: function (root, id) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p || !t || t.id === id) return t
      p.children = p.children.filter(function (k) { return k.id !== id })
      return relevel(t, 0)
    },
    setCollapsed: function (root, id, on, subtree) {
      var t = cloneTree(root), n = findNode(t, id)
      if (!n) return t
      if (subtree) (function walk(x) { x.collapsed = on; (x.children || []).forEach(walk) })(n)
      else n.collapsed = on
      return t
    },
    /* 层级 / 连线的统一写入口。position: 'child' | 'before' | 'after'。
     * 根不可移、目标不可是自己或自己的子孙，三条守卫缺一不可。 */
    moveNode: function (root, id, targetId, position) {
      var t = cloneTree(root), node = findNode(t, id), target = findNode(t, targetId)
      if (!node || !target || node === t || target === node) return t
      if (isDescendant(t, id, targetId)) return t
      var p = findParent(t, id)
      if (!p) return t
      p.children = p.children.filter(function (k) { return k.id !== id })
      if (position === 'before' || position === 'after') {
        var tp = findParent(t, targetId)
        if (!tp) {                       /* 目标是根 ⇒ 只能挂成子节点 */
          target.children = (target.children || []).concat([node])
        } else {
          var arr = tp.children, i = arr.findIndex(function (x) { return x.id === targetId })
          arr.splice(position === 'before' ? i : i + 1, 0, node)
        }
      } else {
        target.collapsed = false
        target.children = (target.children || []).concat([node])
      }
      return relevel(t, 0)
    },
    moveNodeTo: function (root, id, targetId) {
      return treeRules.moveNode(root, id, targetId, 'child')
    },
    /* ★ 轮次 7：拖拽的精确落位 {parentId, index}，与小程序 store.moveNodeTo 同口径。
     * index 是「先摘掉自己之后」的下标 —— core.slotIndexOf 就是这么给的，
     * 所以这里不做「原位置在前／在后」的补偿，两边必须逐值一致。 */
    moveTo: function (root, id, parentId, index) {
      var t = cloneTree(root), node = findNode(t, id), parent = findNode(t, parentId)
      if (!node || !parent || node === t) return t
      if (isDescendant(t, id, parentId)) return t      /* 拖进自己的子树 ⇒ 成环 */
      var p = findParent(t, id)
      if (!p) return t
      p.children = p.children.filter(function (k) { return k.id !== id })
      parent = findNode(t, parentId)
      if (!parent) return t
      parent.collapsed = false
      parent.children = parent.children || []
      var at = Math.max(0, Math.min(parent.children.length, Number(index) || 0))
      parent.children.splice(at, 0, node)
      return relevel(t, 0)
    },
    /* 降级：挂到前一个同级节点下面；升级：提到父节点的后面。 */
    indentNode: function (root, id) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p) return t
      var i = p.children.findIndex(function (x) { return x.id === id })
      if (i <= 0) return t
      var node = p.children[i], prev = p.children[i - 1]
      p.children.splice(i, 1)
      prev.collapsed = false
      prev.children = (prev.children || []).concat([node])
      return relevel(t, 0)
    },
    outdentNode: function (root, id) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p || p === t) return t
      var gp = findParent(t, p.id)
      if (!gp) return t
      var node = findNode(p, id), pi = gp.children.findIndex(function (x) { return x.id === p.id })
      p.children = p.children.filter(function (k) { return k.id !== id })
      gp.children.splice(pi + 1, 0, node)
      return relevel(t, 0)
    },
    shiftNode: function (root, id, delta) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p) return t
      var i = p.children.findIndex(function (x) { return x.id === id }), j = i + delta
      if (i < 0 || j < 0 || j >= p.children.length) return t
      var tmp = p.children[i]; p.children[i] = p.children[j]; p.children[j] = tmp
      return relevel(t, 0)
    },
    insertParent: function (root, id) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p) return t
      var i = p.children.findIndex(function (x) { return x.id === id })
      var wrapper = { id: Core.uid('n'), text: '新层级', remark: '', collapsed: false,
        children: [p.children[i]] }
      p.children[i] = wrapper
      return relevel(t, 0)
    },
    duplicateNode: function (root, id) {
      var t = cloneTree(root), p = findParent(t, id)
      if (!p) return t
      var i = p.children.findIndex(function (x) { return x.id === id })
      if (i < 0) return t
      p.children.splice(i + 1, 0, cloneWithIds(p.children[i]))
      return relevel(t, 0)
    },
    setCollapsedAll: function (root, on) {
      var t = cloneTree(root)
      ;(function walk(n, isRoot) {
        if (!n) return
        if (!isRoot) n.collapsed = !!on
        ;(n.children || []).forEach(function (k) { walk(k, false) })
      })(t, true)
      return t
    },
    /* 关联连线：挂在源节点的 links 上，随整树 PUT 一起落库。 */
    addLink: function (root, fromId, toId, label) {
      var t = cloneTree(root), from = findNode(t, fromId), to = findNode(t, toId)
      if (!from || !to || fromId === toId) return t
      from.links = (from.links || []).filter(function (l) { return l.to !== toId })
      from.links.push({ id: Core.uid('l'), to: toId, label: String(label || '').slice(0, 40) })
      return t
    },
    removeLink: function (root, fromId, linkId) {
      var t = cloneTree(root), from = findNode(t, fromId)
      if (!from) return t
      from.links = (from.links || []).filter(function (l) { return l.id !== linkId })
      return t
    }
  }
  function historyPush(hist, mid, tree) {
    var h = Object.assign({}, hist), rec = h[mid] || { stack: [], idx: -1 }
    var stack = rec.stack.slice(0, rec.idx + 1)
    stack.push(JSON.stringify(tree))
    if (stack.length > 60) stack.shift()
    h[mid] = { stack: stack, idx: stack.length - 1 }
    return h
  }
  function historyMove(hist, mid, delta) {
    var rec = hist[mid]
    if (!rec) return null
    var idx = rec.idx + delta
    if (idx < 0 || idx >= rec.stack.length) return null
    var h = Object.assign({}, hist)
    h[mid] = { stack: rec.stack, idx: idx }
    return { hist: h, tree: JSON.parse(rec.stack[idx]) }
  }

  /* -------------------------------------------------------------- export --- */
  function fileUrl(apiBase, uri) {
    var v = String(uri || '')
    if (/^https?:\/\//.test(v)) return v
    var base = String(apiBase || '').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '')
    return base + '/files/' + v.replace(/^\/+/, '')
  }
  function exportMarkdown(s, mid, opt) {
    return treeToMarkdown(s.tree[mid] || null, Object.assign({ root: false, tasks: false }, opt || {}))
  }
  function copyTodoText(s, todoId, opt) {
    var o = opt || {}
    var t = Core.byId(s.todos, todoId)
    if (!t) return ''
    var mm = t.mindmapId ? Core.byId(s.mindmaps, t.mindmapId) : null
    var root = mm ? (s.tree[mm.id] || null) : null
    return todoToMarkdown(t, root, {
      noImage: !!o.noImage,
      imageUrl: function (uri) { return fileUrl(s.ui && s.ui.apiBase, uri) },
      capsules: Core.capsulesOfTodo(s, todoId).map(function (c) { return { text: c.text, uri: c.imageUri } })
    })
  }

  AT.text = {
    altText: altText, heading: heading, treeToMarkdown: treeToMarkdown,
    todoToMarkdown: todoToMarkdown, levelOf: levelOf, heatWeeks: heatWeeks,
    heatDay: heatDay, todayCell: todayCell, findNode: findNode, findParent: findParent,
    countNodes: countNodes, depthOf: depthOf, relevel: relevel, visibleTree: visibleTree,
    isDescendant: isDescendant, flatNodes: flatNodes, allLinks: allLinks,
    cloneWithIds: cloneWithIds,
    treeRules: treeRules, historyPush: historyPush, historyMove: historyMove,
    exportMarkdown: exportMarkdown, copyTodoText: copyTodoText, fileUrl: fileUrl
  }
})(AT)
