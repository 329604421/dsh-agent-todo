/* 95-overlays.js — DSH slot occupants + in-panel connection dialog.
 * Global overlays render their own <style> (like dsh-bili-mini) so they are
 * styled even when the main panel is not mounted.
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text, S = AT.shell

  /* 令牌由 U.themeCss() 统一注入 .at-root/.at-gl；全局浮层与主面板同主题。 */
  function GlobalStyle() {
    return h('style', null, U.themeCss(AT.icons.useDark()) + U.STYLE + GLOBAL_STYLE +
      (AT.desktop ? AT.desktop.STYLE : ''))
  }
  var GLOBAL_STYLE = [
    '.at-gl-root{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-start;',
    'justify-content:center;padding:12vh 16px 16px;background:var(--at-mask)}',
    '.at-gl-panel{width:min(560px,calc(100vw - 32px));padding:16px;',
    'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-elevated);',
    'color:var(--at-primary);font-family:var(--at-font);box-shadow:var(--at-sh-pop)}',
    '.at-gl-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px}',
    '.at-gl-head-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}',
    '.at-gl-title{font-size:16px;font-weight:600}',
    '.at-gl-icon{width:30px;height:30px;padding:0;border:1px solid var(--at-hairline);border-radius:50%;',
    'background:var(--at-card);color:var(--at-primary);cursor:pointer;display:flex;align-items:center;',
    'justify-content:center;flex:0 0 auto}',
    '.at-gl-icon:hover{background:var(--at-chip)}',
    '.at-gl-clear{color:var(--at-muted)}',
    '.at-gl-clear:hover:not(:disabled){background:var(--at-chip);color:var(--at-danger)}',
    '.at-gl-clear:disabled{opacity:.4;cursor:default}',
    /* 输入类一律套基线（38 高 / 圆角 10 / 1px `--at-field-line` / 14px / 占位符 13 灰），
     * 只覆盖「浮层里这块要多高」这类场景差；聚焦只变描边，不吃外圈 outline。 */
    '.at-gl-input{width:100%;min-height:96px;padding:10px;border:1px solid var(--at-field-line);',
    'border-radius:10px;background:var(--at-card);color:var(--at-primary);font:inherit;',
    'font-size:14px;line-height:1.55;resize:vertical;outline:none}',
    '.at-gl-input:focus{border-color:var(--at-text2)}',
    '.at-gl-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.at-gl-btn{height:36px;padding:0 16px;border:1px solid var(--at-hairline);',
    'border-radius:10px;background:var(--at-card);color:var(--at-slate);font:inherit;',
    'font-size:14px;font-weight:500;cursor:pointer}',
    '.at-gl-btn:hover{background:var(--at-chip);color:var(--at-primary)}',
    '.at-gl-btn.is-primary{background:var(--at-yellow);border-color:transparent;',
    'color:var(--at-on-accent);font-weight:600}',
    '.at-gl-btn.is-primary:hover{opacity:.82}',
    '.at-gl-btn.is-primary:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
    '.at-gl-select{height:38px;padding:0 10px;border:1px solid var(--at-field-line);',
    'border-radius:10px;background:var(--at-card);color:var(--at-primary);font:inherit;font-size:14px}',
    '.at-gl-select:focus{border-color:var(--at-text2);outline:none}',
    '.at-gl-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:1200;',
    'padding:9px 15px;border-radius:8px;background:var(--at-solid);color:var(--at-on-solid);',
    'font-size:13px;box-shadow:var(--at-sh-float);pointer-events:none}',
    '.at-gl-toast.is-danger{background:var(--at-danger);color:var(--at-on-danger)}',
    '.at-gl-list{max-height:46vh;overflow:auto;margin-top:12px}',
    '.at-gl-row{display:flex;width:100%;justify-content:space-between;gap:10px;padding:10px 11px;',
    'border:1px solid transparent;border-radius:10px;background:transparent;',
    'color:var(--at-primary);font:inherit;font-size:13px;text-align:left;cursor:pointer}',
    '.at-gl-row:hover{background:var(--at-chip)}',
    '.at-composer-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;',
    'border:1px solid var(--at-hairline);border-radius:8px;background:var(--at-card);',
    'color:var(--at-slate);font:inherit;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap}',
    '.at-composer-btn:hover{background:var(--at-chip);color:var(--at-primary)}',
    '.at-msg-action{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 8px;',
    'border:0;border-radius:8px;background:transparent;color:var(--at-muted);font:inherit;',
    'font-size:12px;cursor:pointer}',
    '.at-msg-action:hover{background:var(--at-chip);color:var(--at-primary)}',
    /* ★ 轮次 18：未登录时两个全局浮层的「当前是演示数据」提示条。
     * 与顶栏 .at-status.is-guest 同一档：暖黄底 ＋ 黄描边 ＋ **主墨**字。
     * ⚠️ 文字不许用 --at-yellow-deep（#E5A400 压 #FFE9A8 ≈1.8:1），
     *    不许用 opacity（那是「不可用」的语义，正好把「提示」读成「禁用」）。 */
    '.at-gl-demo{display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;padding:9px 11px;',
    'border:1px solid var(--at-yellow-line);border-radius:10px;background:var(--at-yellow-warm);',
    'color:var(--at-primary);font-size:12px;line-height:1.55}',
    '.at-gl-demo-t{font-weight:600;flex:0 0 auto;white-space:nowrap}',
    /* 导出面板自己带 18 的横向内距，提示条要跟着对齐（.at-gl-panel 是 16 内距）。 */
    '.at-pick-demo{margin:0 18px 10px}',
    '.at-pick-syncing{color:var(--at-muted)}',
    /* To-do picker（输入框左侧的 Agent ToDo 按钮） */
    '.at-pick-panel{width:min(640px,calc(100vw - 32px));padding:0;overflow:hidden}',
    '.at-pick-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 10px}',
    '.at-pick-title{font-size:16px;font-weight:600;line-height:1.35}',
    '.at-pick-sub{margin-top:3px;font-size:11px;line-height:1.6;color:var(--at-text2)}',
    '.at-pick-x{width:30px;height:30px;padding:0;border:1px solid var(--at-hairline);border-radius:50%;',
    'background:var(--at-card);color:var(--at-primary);cursor:pointer;display:flex;align-items:center;',
    'justify-content:center;flex:0 0 auto}',
    '.at-pick-x:hover{background:var(--at-chip)}',
    '.at-pick-scope{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 18px 10px;',
    'min-height:28px}',
    '.at-pick-scope-label{font-size:10px;letter-spacing:.4px;color:var(--at-muted);text-transform:uppercase}',
    '.at-pick-chip{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;',
    'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-card);',
    'color:var(--at-slate);font:inherit;font-size:11px;font-weight:500;cursor:pointer;max-width:100%;',
    'min-width:0}',
    '.at-pick-chip span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-pick-chip:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
    '.at-pick-chip:disabled{opacity:.4;cursor:not-allowed}',
    '.at-pick-chip.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
    'color:var(--at-primary);font-weight:600}',
    '.at-pick-chip.is-on:hover:not(:disabled){opacity:.82}',
    '.at-pick-scope-hint{font-size:10px;line-height:1.4;color:var(--at-muted);min-width:0;',
    'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    /* 搜索档（小程序 `.tf-sear` / `.tf-input` 同构）：壳 36 高 圆角 10 内距 0 10 gap 7，
     * 内层 34 高 14px 无框 —— 与筛选抽屉那一处逐值一致，两处不许再各写一套。 */
    '.at-pick-search{display:flex;align-items:center;gap:7px;margin:0 18px 10px;padding:0 10px;',
    'height:36px;border:1px solid var(--at-field-line);border-radius:10px;background:var(--at-card)}',
    '.at-pick-search:focus-within{border-color:var(--at-text2)}',
    '.at-pick-input{flex:1 1 auto;min-width:0;height:34px;border:0;background:transparent;',
    'color:var(--at-primary);font:inherit;font-size:14px;outline:none}',
    '.at-pick-input::placeholder{color:var(--at-muted);font-size:13px}',
    '.at-pick-list{max-height:min(46vh,420px);overflow:auto;padding:0 12px 6px}',
    '.at-pick-row{display:flex;align-items:center;gap:10px;width:100%;padding:10px 10px;',
    'border:1px solid transparent;border-radius:9px;background:transparent;text-align:left;',
    'color:var(--at-primary);font:inherit}',
    '.at-pick-row:hover{background:var(--at-chip)}',
    '.at-pick-dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto}',
    '.at-pick-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}',
    '.at-pick-text{font-size:13px;line-height:1.45;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-pick-meta{font-size:10px;line-height:1.4;color:var(--at-muted);overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap}',
    '.at-pick-actions{display:flex;align-items:center;gap:6px;flex:0 0 auto}',
    '.at-pick-act{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;',
    'padding:0 9px;border:1px solid var(--at-hairline);border-radius:7px;background:var(--at-card);',
    'color:var(--at-slate);font:inherit;font-size:11px;font-weight:500;cursor:pointer;white-space:nowrap}',
    '.at-pick-act:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
    '.at-pick-act.is-enhance{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
    'color:var(--at-yellow-deep);font-weight:600}',
    '.at-pick-act.is-enhance:hover:not(:disabled){background:var(--at-yellow-warm);color:var(--at-primary)}',
    '.at-pick-act:disabled{opacity:.4;cursor:not-allowed}',
    '.at-pick-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:26px 16px;',
    'color:var(--at-muted);font-size:12px;text-align:center}',
    '.at-pick-empty .at-btn{margin-top:2px}',
    '.at-pick-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;',
    'padding:10px 18px 13px;border-top:1px solid var(--at-hairline-soft);font-size:10px;color:var(--at-muted)}',
    '.at-pick-done{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--at-text2);',
    'cursor:pointer;user-select:none}',
    '.at-pick-done input{accent-color:var(--at-yellow-deep);margin:0}',
    '.at-pick-foot-left,.at-pick-foot-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '@media (max-width:560px){.at-pick-panel{width:calc(100vw - 20px)}.at-pick-list{max-height:48vh}',
    '.at-pick-row{flex-wrap:wrap}.at-pick-actions{width:100%;justify-content:flex-end}}'
  ].join('')

  /* ★ 轮次 12：登录闸门是**未登录时的默认门面**，不再是"连接后端"的备用弹层。
   * 结构自上而下：标题 → 一句状态说明 → 小程序码（居中）→ 两步操作 → 验证码输入 → 动作。
   * `.at-connect` 铺满工作区并让面板视口居中；窄 / 矮屏靠 `overflow:auto` 兜底。 */
  var STYLE = [
    '.at-connect{position:absolute;inset:0;z-index:70;display:flex;align-items:center;',
    'justify-content:center;padding:24px 16px;overflow:auto;background:var(--at-mask)}',
    '.at-connect-panel{width:min(400px,100%);padding:18px 18px 16px;border:1px solid var(--at-hairline);',
    'border-radius:16px;background:var(--at-elevated);box-shadow:var(--at-sh-pop)}',
    '.at-connect-head{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.at-connect-title{font-size:15px;font-weight:600}',
    '.at-connect-sub{margin:7px 0 0;font-size:12px;line-height:18px;color:var(--at-text2)}',
    /* 小程序码：**居中**、浅底恒白（`--at-qr`）—— 码要的是高对比，深色档也不能跟着压暗；
     * 只加 1px hairline ＋ 12 圆角，不加投影（投影会糊掉码点边缘，扫不出来）。 */
    '.at-connect-qr{display:flex;flex-direction:column;align-items:center;gap:8px;margin:14px 0 0}',
    '.at-connect-qr-img{display:block;width:168px;height:168px;border-radius:12px;',
    'background:var(--at-qr);border:1px solid var(--at-hairline);user-select:none;-webkit-user-drag:none}',
    '.at-connect-qr-cap{font-size:12px;color:var(--at-muted)}',
    '.at-connect-steps{margin:14px 0 0;padding:0;list-style:none;display:flex;',
    'flex-direction:column;gap:7px}',
    '.at-connect-step{display:flex;gap:8px;font-size:12px;line-height:18px;color:var(--at-text2)}',
    '.at-connect-step-n{flex:0 0 16px;width:16px;height:16px;margin-top:1px;border-radius:50%;',
    'background:var(--at-yellow-warm);color:var(--at-yellow-deep);font-size:10px;font-weight:600;',
    'line-height:16px;text-align:center;font-variant-numeric:tabular-nums}',
    '.at-connect-field{margin-top:12px}',
    '.at-connect-note{margin:8px 0 0;font-size:11px;line-height:16px;color:var(--at-muted)}',
    '.at-connect-foot{display:flex;align-items:center;justify-content:flex-end;gap:7px;margin-top:14px}',
    /* 已登录档：一句"是什么状态"＋退出，不再展示登录码。 */
    '.at-connect-who{display:flex;align-items:center;gap:8px;margin-top:14px;padding:12px;',
    'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-card)}',
    '.at-connect-who-dot{width:7px;height:7px;border-radius:50%;background:var(--at-success);flex:0 0 auto}',
    '.at-connect-who-name{font-size:14px;font-weight:600;min-width:0;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap}',
    '.at-connect-who-tag{margin-left:auto;font-size:11px;color:var(--at-muted);flex:0 0 auto}'
  ].join('')

  var composerActions = null
  function rememberActions(props) {
    if (props && props.inputActions) composerActions = props.inputActions
  }
  /** 把交接文本送进当前输入框。
   * @returns {'draft'|'copy'} draft = 已写入输入框（可据此完成待办）；
   *   copy = 宿主没给 setDraft，只能退到剪贴板（不视为“已触发”）。 */
  function insertText(text) {
    if (composerActions && typeof composerActions.setDraft === 'function') {
      try {
        composerActions.setDraft(text)
        B.toast('已写入输入框')
        return 'draft'
      } catch (e) { /* fall through to clipboard */ }
    }
    B.copyText(text).then(function (ok) { B.toast(ok ? '已复制，粘贴到输入框即可' : '复制失败', ok ? 'default' : 'danger') })
    return 'copy'
  }

  /* --------------------------------------------------------- slot: icon --- */
  /* ★ 2026-11 用户口径：DSH 左侧菜单的「应用图标」不用彩色 logo。
   * 宿主 `sidebar.panellist` 的官方契约只传 `{ size, active }`，`.panelRow` 用
   * `var(--dsw-alias-label-primary)` 着色；宿主内置左栏图标（PluginsPanelIcon /
   * TaskManagerIcon / IconAppsAddOutlineRegular）清一色是 16 viewBox、currentColor、
   * stroke-width 1~1.3 的单色线性图标，浅 / 深主题由宿主统一换色。
   * ⇒ 按品牌细线标志重绘：圆角方框 + 穿出右上角的对勾，单色 currentColor；
   *   左侧插件栏与输入框「Agent ToDo」按钮共用同一几何。
   * ⚠️ 只管这两颗；胶囊 FAB 的品牌图与根级 icon.svg（Plugin Manager 用）不动。 */
  function BrandGlyph(props) {
    var size = (props && props.size) || 14
    return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true', focusable: 'false',
      style: { display: 'block', color: 'inherit', flex: '0 0 auto' } },
      h('path', {
        d: 'M9.8 3H5.2A1.8 1.8 0 0 0 3.4 4.8v6A1.8 1.8 0 0 0 5.2 12.6h6A1.8 1.8 0 0 0 13 10.8V9.4',
        stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round'
      }),
      h('path', {
        d: 'M5.8 8.4L7.7 10.3L13.6 4.2',
        stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round'
      }))
  }
  function SidebarIcon(props) {
    return BrandGlyph({ size: (props && props.size) || 18 })
  }

  /* -------------------------------------------- slot: composer left btn --- */
  function ComposerButton(props) {
    rememberActions(props)
    return h('button', { type: 'button', className: 'at-composer-btn',
      title: 'Agent ToDo：导出未完成待办到输入框（可选原文 / 增强，可选同时完成）',
      'aria-label': 'Agent ToDo：导出未完成待办到输入框',
      onClick: function () { B.ui({ composerOpen: true }) } },
      BrandGlyph({ size: 14 }), 'Agent ToDo')
  }

  /* --------------------------------------- slot: assistant message action ---
   * 只从 [data-turn-tail] 里取尾部卡片（交付物 / 改动 / 其他），整理成
   * 带符号的纯文本，作为闪念胶囊草稿；不再提供“存为待办”。 */
  function cleanText(value) {
    return String(value == null ? '' : value).replace(/\u00a0/g, ' ')
      .replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()
  }
  function fileTypeOf(name) {
    var matched = String(name || '').match(/\.([^.\\/]+)$/)
    return matched ? matched[1].toUpperCase() : '文件'
  }
  function baseNameOf(path) {
    var parts = String(path || '').replace(/\\/g, '/').split('/')
    return parts.filter(Boolean).pop() || ''
  }
  function formatDeliverable(name, description) {
    var fileName = cleanText(name).replace(/\s+/g, ' ')
    if (!fileName) fileName = '未命名交付物'
    var type = fileTypeOf(fileName)
    var summary = cleanText(description).replace(/\s+/g, ' ')
    var line = '交付物文件（' + type + '）：《' + fileName + '》'
    if (summary && summary !== type) line += '（' + summary + '）'
    return line
  }
  function formatPresentedCard(card) {
    if (!card) return ''
    var nameEl = card.querySelector ? card.querySelector('[class*="fileName"]') : null
    var name = nameEl ? cleanText(nameEl.innerText || nameEl.textContent) : ''
    if (!name) {
      var preview = card.querySelector ? card.querySelector('[class*="cardPreview"]') : null
      var fullPath = preview && preview.getAttribute ? preview.getAttribute('title') : ''
      name = baseNameOf(fullPath)
    }
    if (!name) {
      var cardText = cleanText(card.innerText || card.textContent)
      name = cardText.split('\n')[0] || ''
    }
    var descEl = card.querySelector ? card.querySelector('[data-presented-description]') : null
    var description = descEl ? cleanText(descEl.innerText || descEl.textContent) : ''
    description = description.replace(/\s*(?:预览|打开|Preview|Open)\s*$/i, '').trim()
    description = description.replace(/\s*(?:\([^()]*\)|（[^（）]*）)\s*$/u, '').trim()
    return formatDeliverable(name, description)
  }
  function formatChangedCard(card) {
    if (!card) return ''
    var titleEl = card.querySelector ? card.querySelector('[class*="title"]') : null
    var title = titleEl ? cleanText(titleEl.innerText || titleEl.textContent) : ''
    var paths = []
    var pathEls = card.querySelectorAll ? card.querySelectorAll('[class*="path"]') : []
    Array.prototype.forEach.call(pathEls, function (item) {
      var path = cleanText(item.innerText || item.textContent)
      if (path) paths.push('《' + path + '》')
    })
    if (paths.length) {
      var label = title && paths.length > 1 ? '（' + title + '）' : ''
      return '代码改动' + label + '：' + paths.join('、')
    }
    var text = cleanText(card.innerText || card.textContent)
    return text ? '代码改动：' + text.replace(/\n+/g, ' / ') : ''
  }
  function assistantTextOf(el) {
    try {
      var tail = el && el.closest ? el.closest('[data-turn-tail]') : null
      if (!tail) return ''
      var kids = Array.from(tail.children || [])
      var actionChild = null
      kids.forEach(function (kid) {
        if (!actionChild && kid && kid.contains && kid.contains(el)) actionChild = kid
      })
      if (!actionChild && kids.length) actionChild = kids[kids.length - 1]
      var body = kids.filter(function (kid) { return kid && kid !== actionChild })
      var files = [], changes = [], others = []
      body.forEach(function (child) {
        if (child.matches && child.matches('[data-presented-file]')) { files.push(child); return }
        if (child.matches && child.matches('[data-changed-files]')) { changes.push(child); return }
        var fileCards = child.querySelectorAll ? child.querySelectorAll('[data-presented-file]') : []
        if (fileCards.length) {
          Array.prototype.forEach.call(fileCards, function (card) { files.push(card) })
          return
        }
        var changedCards = child.querySelectorAll ? child.querySelectorAll('[data-changed-files]') : []
        if (changedCards.length) {
          Array.prototype.forEach.call(changedCards, function (card) { changes.push(card) })
          return
        }
        var text = cleanText(child.innerText || child.textContent)
        if (text) others.push(text)
      })
      var lines = []
      if (files.length) {
        lines.push('【交付物】')
        files.forEach(function (card) {
          var line = formatPresentedCard(card)
          if (line) lines.push(line)
        })
      }
      if (changes.length) {
        lines.push('【代码改动】')
        changes.forEach(function (card) {
          var line = formatChangedCard(card)
          if (line) lines.push(line)
        })
      }
      if (others.length) {
        lines.push('【其他信息】')
        lines.push(others.join('\n'))
      }
      return lines.join('\n').trim()
    } catch (e) { return '' }
  }
  function AssistantSaveAction(props) {
    return h('button', { type: 'button', className: 'at-msg-action', title: '存成闪念胶囊',
      'aria-label': '存成闪念胶囊',
      onClick: function (e) {
        var text = assistantTextOf(e.currentTarget)
        B.ui({ captureOpen: true, captureSeed: text, captureCapsuleOnly: true })
      } }, h(U.Icon, { name: 'bolt', size: 11 }), '闪念')
  }

  /* ★ 轮次 18：两个全局浮层共用的一句「未登录 · 演示数据」提示。
   * 零 hooks 的纯渲染函数 ⇒ 两处都直接调用（不挂成组件），渲染树里就是那张 div。
   * 文案沿用 ConnectBody 的口径：演示数据可以体验，登录后才是小程序里同一份。 */
  function DemoNote(props) {
    var o = props || {}
    return h('div', { className: 'at-gl-demo' + (o.pick ? ' at-pick-demo' : ''),
      role: 'status', 'aria-label': '演示数据提示' },
      h('span', { className: 'at-gl-demo-t' }, '未登录 · 演示数据'),
      h('span', null, o.message ||
        '当前展示的是演示数据；登录后才会与你小程序里的数据同步。'))
  }

  /* ------------------------------------------------ global: quick capture --- */
  function QuickCapture() {
    var s = B.useStore(), ui = s.ui
    var [text, setText] = React.useState('')
    var [projectId, setProjectId] = React.useState('')
    var [saving, setSaving] = React.useState(false)
    var areaRef = React.useRef(null)
    React.useEffect(function () {
      if (ui.captureOpen) {
        setText(ui.captureSeed || '')
        setProjectId((Core.byId(s.todos, ui.todoId) || {}).projectId || (Core.activeProjects(s)[0] || {}).id || '')
        setTimeout(function () { if (areaRef.current) areaRef.current.focus() }, 0)
      }
    }, [ui.captureOpen, ui.captureSeed])
    if (!ui.captureOpen) return h(GlobalStyle, null)
    var guest = !s.ui.connected
    var capsuleOnly = !!ui.captureCapsuleOnly
    var projects = Core.activeProjects(s)
    function close() {
      B.ui({ captureOpen: false, captureSeed: '', captureCapsuleOnly: false })
    }
    async function save(asTask) {
      if (saving) return
      /* ★ 轮次 18：Ctrl+Enter 不走按钮，disabled 拦不住它 ⇒ 门控必须落在 save 里，
       * 否则「置灰」只是看起来灰，照样能把演示数据写进内存还弹一条「已接住」。 */
      if (!B.get().ui.connected) { B.toast('请先登录后再保存', 'danger'); return }
      if (capsuleOnly) asTask = false
      var value = String(text || '').trim()
      if (!value) { B.toast('还没有写内容'); return }
      if (asTask && !projectId) { B.toast('先选一个归属项目'); return }
      setSaving(true)
      var ok
      try {
      if (asTask) {
        ok = await B.actions.addTodo({ text: value, projectId: projectId, urgency: 'mid' })
      } else ok = (await B.actions.addCapsule(value, { source: 'text' })).ok
      if (ok) { close(); B.toast(asTask ? '已保存待办' : '已接住这条闪念') }
      } finally { setSaving(false) }
    }
    return h('div', { className: 'at-gl', 'data-dark': String(AT.icons.isDark()) },
      h(GlobalStyle, null),
      h('div', { className: 'at-gl-root', onMouseDown: function (e) { if (e.target === e.currentTarget) close() } },
        h(U.Dialog, { className: 'at-gl-panel', role: 'dialog', 'aria-label': '快速捕获' },
          h('div', { className: 'at-gl-head' },
            h('span', { className: 'at-gl-title' }, '记一条闪念'),
            h('div', { className: 'at-gl-head-actions' },
              h('button', { type: 'button', className: 'at-gl-icon', title: '关闭', 'aria-label': '关闭',
                onClick: close }, h(U.Icon, { name: 'close', size: 14 })))),
          guest ? DemoNote({ message: '当前展示的是演示数据；登录后才能保存闪念，未登录时保存键不可用。' }) : null,
          h('textarea', { ref: areaRef, className: 'at-gl-input', value: text,
            placeholder: '想到什么就先写下来…',
            'aria-label': '闪念内容',
            onChange: function (e) { setText(e.target.value) },
            onKeyDown: function (e) {
              if (e.nativeEvent && e.nativeEvent.isComposing || e.isComposing || e.keyCode === 229) return
              if (e.key === 'Escape') { close(); return }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault(); save(capsuleOnly ? false : !!e.shiftKey)
              }
            } }),
          h('p', { className: 'at-small', style: { margin: '8px 0 0' } },
            capsuleOnly
              ? 'Enter 换行 · Ctrl+Enter 存为闪念'
              : 'Enter 换行 · Ctrl+Enter 存胶囊 · Ctrl+Shift+Enter 存待办'),
          h('div', { className: 'at-gl-foot' },
            capsuleOnly ? null : h('select', { className: 'at-gl-select', value: projectId, 'aria-label': '归属项目',
              onChange: function (e) { setProjectId(e.target.value) } },
              h('option', { value: '' }, '目标项目…'),
              projects.map(function (p) { return h('option', { key: p.id, value: p.id }, p.name) })),
            h('span', { style: { flex: '1 1 auto' } }),
            h('button', { type: 'button', className: 'at-gl-btn at-gl-clear',
              disabled: !String(text || '').trim(),
              title: '清除弹窗中的交付物信息', 'aria-label': '清除内容',
              onClick: function () {
                setText('')
                setTimeout(function () { if (areaRef.current) areaRef.current.focus() }, 0)
              } }, '清除'),
            capsuleOnly
              ? h('button', { type: 'button', className: 'at-gl-btn is-primary', disabled: saving || guest,
                onClick: function () { save(false) } }, saving ? '保存中…' : '存为闪念')
              : h('button', { type: 'button', className: 'at-gl-btn', disabled: saving || guest,
                onClick: function () { save(false) } }, '存为胶囊'),
            capsuleOnly ? null : h('button', { type: 'button', className: 'at-gl-btn is-primary', disabled: saving || guest,
              onClick: function () { save(true) } }, '存为待办')))))
  }

  /* --------------------------------------------- global: composer picker ---
   * 输入框左侧的 Agent ToDo 按钮 = 未完成待办导出器。
   * 打开时读取当前会话所属的 DSH 工作区名称，把该名称当作「项目」筛选条件；
   * 每条待办右侧有「导出」和「增强导出」，底部可选择「导出同时完成」。 */
  function leafText(el) {
    if (!el || typeof el.querySelectorAll !== 'function') return ''
    var spans = el.querySelectorAll('span'), i, text
    for (i = 0; i < spans.length; i++) {
      if (spans[i].childElementCount === 0) {
        text = String(spans[i].textContent || '').trim()
        if (text) return text
      }
    }
    return ''
  }
  /** 当前输入框所属的 DSH 工作区名称（侧栏 workspace 行 / 会话行，或工作区 chip）。 */
  function currentWorkspaceName() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return ''
    var rows = [], i, row, key, current = ''
    try {
      rows = document.querySelectorAll('[data-row-key^="workspace:"],[data-row-key^="session:"]')
    } catch (e) { rows = [] }
    for (i = 0; i < rows.length; i++) {
      row = rows[i]
      key = row && row.getAttribute ? String(row.getAttribute('data-row-key') || '') : ''
      if (key.indexOf('workspace:') === 0) {
        var label = leafText(row)
        if (label) current = label
      } else if (key.indexOf('session:') === 0 && row.getAttribute('aria-selected') === 'true') {
        if (current) return current
      }
    }
    try {
      var chips = document.querySelectorAll('[class*="workspaceLabel"]')
      for (i = 0; i < chips.length; i++) {
        var chipText = String(chips[i].textContent || '').trim()
        if (chipText) return chipText
      }
    } catch (e) { /* optional */ }
    try {
      var active = document.querySelector('[data-row-key^="session:"][aria-selected="true"]')
      while (active) {
        active = active.previousElementSibling
        if (active && String(active.getAttribute('data-row-key') || '').indexOf('workspace:') === 0) {
          var previousLabel = leafText(active)
          if (previousLabel) return previousLabel
        }
      }
    } catch (e) { /* optional */ }
    return current
  }
  function normName(value) { return String(value == null ? '' : value).trim().toLowerCase() }
  function projectMatchesWorkspace(projectName, workspaceName) {
    var a = normName(projectName), b = normName(workspaceName)
    if (!a || !b) return false
    return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0
  }

  function ComposerPicker() {
    var s = B.useStore()
    var open = !!s.ui.composerOpen
    var kwState = React.useState('')
    var kw = kwState[0]
    var setKw = kwState[1]
    var busyState = React.useState('')
    var busy = busyState[0]
    var setBusy = busyState[1]
    var wsState = React.useState('')
    var ws = wsState[0]
    var setWs = wsState[1]
    var scopeState = React.useState(false)
    var scopeOn = scopeState[0]
    var setScopeOn = scopeState[1]
    var doneState = React.useState(true)
    var done = doneState[0]
    var setDone = doneState[1]
    var inputRef = React.useRef(null)

    React.useEffect(function () {
      if (!open) return
      var workspace = currentWorkspaceName()
      setWs(workspace)
      setScopeOn(!!workspace)
      setDone(true)
      setKw('')
      setBusy('')
      /* ★ 轮次 18：每次展开都重新拉一次 /sync —— 开场那份快照可能已经过时
       * （小程序里刚记的待办、别的设备上刚完成的，都要在这里看得到）。
       * ⚠️ 只在已登录时拉：/sync 要设备 JWT，未登录拉会把 connected 打成 false、
       *    顺手写一条连接错误；演示数据本来也不该被服务端快照覆盖。
       * 依赖仍只有 [open] ⇒ 一次展开恰好一次，sync 引起的 store 重渲染不会重复发。 */
      if (B.get().ui.connected) B.sync(false)
      var timer = setTimeout(function () {
        if (inputRef.current && inputRef.current.focus) inputRef.current.focus()
      }, 0)
      return function () { clearTimeout(timer) }
    }, [open])

    if (!open) return h(GlobalStyle, null)
    var guest = !s.ui.connected
    var openTodos = Core.filterTodos(s, { status: 'open', projectId: '', kw: '', range: 'all' })
    var matchedProjects = ws ? s.projects.filter(function (p) {
      return projectMatchesWorkspace(p.name, ws)
    }) : []
    var matchedIds = matchedProjects.map(function (p) { return p.id })
    var scoped = scopeOn && ws
      ? openTodos.filter(function (t) { return matchedIds.indexOf(t.projectId) >= 0 })
      : openTodos
    var list = scoped.filter(function (t) {
      return !kw || String(t.text).toLowerCase().indexOf(kw.toLowerCase()) >= 0
    }).slice(0, 60)
    function close() { B.ui({ composerOpen: false }) }

    function doExport(t, mode) {
      if (!t || busy) return Promise.resolve(false)
      var key = t.id + ':' + mode
      setBusy(key)
      return (async function () {
        try {
          if (t.mindmapId) await B.loadTree(t.mindmapId)
          var source = Text.copyTodoText(B.get(), t.id, {})
          var text = source
          if (mode === 'enhance') {
            var enhanced = await B.actions.enhance(source)
            var enhancedText = enhanced && (enhanced.text || enhanced.result)
            if (!enhancedText) { B.toast('模型没有返回增强内容', 'danger'); return false }
            text = enhancedText
          }
          var written = insertText(text)
          close()
          if (written !== 'draft') {
            B.toast('未能写入输入框，已复制到剪贴板；待办保持未完成', 'danger')
            return false
          }
          if (!done) {
            B.toast(mode === 'enhance' ? '已写入增强后的内容' : '已写入输入框')
            return true
          }
          var current = Core.byId(B.get().todos, t.id)
          if (!current || current.done) {
            B.toast(mode === 'enhance' ? '已写入增强后的内容' : '已写入输入框')
            return true
          }
          var ok = await B.actions.toggleTodo(t.id)
          if (ok) B.toast(mode === 'enhance' ? '已写入增强后的内容，待办已完成' : '已写入输入框，待办已完成')
          else B.toast('已写入输入框，但待办未能标记完成', 'danger')
          return ok
        } catch (e) {
          B.toast(e && e.message ? e.message : '增强导出失败', 'danger')
          return false
        } finally {
          setBusy('')
        }
      })()
    }

    var scopeMatched = matchedProjects.length > 0
    var scopeHint = !ws ? '未识别当前工作区，显示全部待办'
      : !scopeOn ? '显示全部项目'
        : scopeMatched ? '匹配项目：' + matchedProjects.map(function (p) { return p.name }).join('、')
          : '当前工作区没有匹配的项目'

    return h('div', { className: 'at-gl', 'data-dark': String(AT.icons.isDark()) },
      h(GlobalStyle, null),
      h('div', { className: 'at-gl-root', onMouseDown: function (e) { if (e.target === e.currentTarget) close() } },
        h(U.Dialog, { className: 'at-gl-panel at-pick-panel', role: 'dialog', 'aria-label': '导出待办到输入框' },
          h('div', { className: 'at-pick-head' },
            h('div', null,
              h('div', { className: 'at-pick-title' }, '导出待办到输入框'),
              h('div', { className: 'at-pick-sub' }, '只列出未完成待办 · 可按当前工作区筛选 · 导出即写入输入框')),
            h('button', { type: 'button', className: 'at-pick-x', title: '关闭', 'aria-label': '关闭',
              onClick: close }, h(U.Icon, { name: 'close', size: 13 }))),
          guest ? DemoNote({ pick: true,
            message: '当前列表是演示数据；登录后展开会自动拉取你小程序里的最新待办。' }) : null,
          h('div', { className: 'at-pick-scope' },
            h('span', { className: 'at-pick-scope-label' }, '项目'),
            h('button', { type: 'button', className: 'at-pick-chip' + (scopeOn && ws ? ' is-on' : ''),
              disabled: !ws,
              title: !ws ? '未识别当前工作区' : scopeOn ? '关闭项目筛选，显示全部待办' : '仅显示当前工作区项目',
              onClick: function () { if (ws) setScopeOn(!scopeOn) } },
              h(U.Icon, { name: scopeOn && ws ? 'check' : 'project', size: 11 }),
              h('span', null, ws && scopeOn ? '「' + ws + '」' : '全部项目'),
              scopeOn && ws ? h(U.Icon, { name: 'close', size: 10, opacity: .7 }) : null),
            h('span', { className: 'at-pick-scope-hint' }, scopeHint)),
          h('div', { className: 'at-pick-search' },
            h(U.Icon, { name: 'search', size: 14, opacity: .6 }),
            h('input', { ref: inputRef, className: 'at-pick-input', value: kw,
              placeholder: '搜索未完成待办…', 'aria-label': '搜索未完成待办',
              onChange: function (e) { setKw(e.target.value) },
              onKeyDown: function (e) {
                if (e.key === 'Escape') { e.preventDefault(); close() }
                else if (e.key === 'Enter' && list.length && !busy) {
                  e.preventDefault(); doExport(list[0], 'plain')
                }
              } })),
          h('div', { className: 'at-pick-list', role: 'list' },
            list.length ? list.map(function (t) {
              var u = C.urgencyOf(t.urgency)
              var mm = t.mindmapId ? Core.byId(s.mindmaps, t.mindmapId) : null
              var caps = Core.capsulesOfTodo(s, t.id).length
              var plainKey = t.id + ':plain'
              var enhanceKey = t.id + ':enhance'
              return h('div', { key: t.id, className: 'at-pick-row', role: 'listitem' },
                h('span', { className: 'at-pick-dot', style: { background: u.main } }),
                h('span', { className: 'at-pick-main' },
                  h('span', { className: 'at-pick-text' }, t.text || '（空待办）'),
                  h('span', { className: 'at-pick-meta' },
                    VName(s, t.projectId) + ' · ' + u.name +
                    (mm ? ' · 脑图「' + mm.name + '」' : '') +
                    (caps ? ' · ' + caps + ' 条闪念' : ''))),
                h('div', { className: 'at-pick-actions' },
                  h('button', { type: 'button', className: 'at-pick-act', disabled: !!busy,
                    title: '原文导出（正文 + 脑图 + 闪念）', onClick: function () { doExport(t, 'plain') } },
                    h(U.Icon, { name: 'export', size: 11 }),
                    busy === plainKey ? '导出中…' : '导出'),
                  h('button', { type: 'button', className: 'at-pick-act is-enhance', disabled: !!busy,
                    title: '调用待办增强后导出', onClick: function () { doExport(t, 'enhance') } },
                    h(U.Icon, { name: 'bolt', size: 11 }),
                    busy === enhanceKey ? '增强中…' : '增强导出')))
            }) : h('div', { className: 'at-pick-empty' },
              h(U.Icon, { name: 'todo', size: 28, opacity: .5 }),
              h('span', null, scopeOn && ws && !scopeMatched
                ? '当前工作区「' + ws + '」没有匹配的项目'
                : kw ? '没有匹配的未完成待办' : '还没有未完成待办'),
              h('span', null, scopeOn && ws && !scopeMatched
                ? '关闭项目筛选即可查看全部未完成待办。'
                : kw ? '换个关键词试试。' : '先在工作台创建一条待办，再从这里导出。'),
              scopeOn && ws && !scopeMatched
                ? h(U.Btn, { onClick: function () { setScopeOn(false) } }, '查看全部待办')
                : null)),
          h('div', { className: 'at-pick-foot' },
            h('div', { className: 'at-pick-foot-left' },
              h('label', { className: 'at-pick-done' },
                h('input', { type: 'checkbox', checked: done,
                  onChange: function (e) { setDone(!!e.target.checked) } }),
                '导出同时完成')),
            h('div', { className: 'at-pick-foot-right' },
              s.ui.syncing ? h('span', { className: 'at-pick-syncing' }, '正在拉取最新待办…') : null,
              h('span', null, '当前 ' + list.length + ' 条 · 共 ' + openTodos.length + ' 条未完成'),
              h('span', null, 'Enter 导出第一条 · Esc 关闭'))))))
  }
  function VName(s, pid) { var p = Core.byId(s.projects, pid); return p ? p.name : '未归属' }

  /* ---------------------------------------------------- global: toast --- */
  function GlobalToast() {
    var t = B.useStore().ui.toast
    if (!t || !t.message) return h(GlobalStyle, null)
    return h('div', { className: 'at-gl', 'data-dark': String(AT.icons.isDark()) }, h(GlobalStyle, null),
      h('div', { className: 'at-gl-toast' + (t.tone === 'danger' ? ' is-danger' : ''), role: 'status' }, t.message))
  }

  /* --------------------------------------------- in-panel: connect gate --- */
  function ConnectModal(s) {
    if (!s.ui.connectOpen) return null
    return h(ConnectBody, { key: 'connect', s: s })
  }
  /* 素材：功能介绍/素材图片/小程序码.jpg（344×344 圆形太阳码）。
   * 与「我的」页那张 `qr-official.jpg`（公众号）**不是同一张**，别互借。 */
  var QR_SRC = '/agent-todo/assets/qr-miniapp.jpg'
  function ConnectBody(props) {
    var s = props.s
    var [value, setValue] = React.useState('')
    function close() { B.ui({ connectOpen: false, connectError: '' }) }
    function submit() { B.connect(value) }
    var who = (s.ui.user && s.ui.user.nickname) || '已连接'
    return h('div', { className: 'at-connect', onMouseDown: function (e) { if (e.target === e.currentTarget) close() } },
      h(U.Dialog, { className: 'at-connect-panel', 'aria-label': s.ui.connected ? 'Agent ToDo 账号' : '登录 Agent ToDo' },
        h('div', { className: 'at-connect-head' },
          h('span', { className: 'at-connect-title' }, s.ui.connected ? 'Agent ToDo 账号' : '登录 Agent ToDo'),
          h(U.IconBtn, { name: 'close', title: '关闭', label: '关闭', onClick: close })),
        h('p', { className: 'at-connect-sub' }, s.ui.connected
          ? '已登录，改动会同步到你小程序里的同一份数据。'
          : '未登录时看到的是演示数据，可以随意体验；登录后与你小程序里的数据同步。'),
        s.ui.connected ? h('div', { className: 'at-connect-who' },
          h('span', { className: 'at-connect-who-dot' }),
          h('span', { className: 'at-connect-who-name', title: who }, who),
          h('span', { className: 'at-connect-who-tag' }, '已连接'))
          : [
            /* 码在弹窗**中心**：容器纵排居中，码本身 168 见方，下面一行说明来源。 */
            h('div', { key: 'qr', className: 'at-connect-qr' },
              h('img', { className: 'at-connect-qr-img', src: QR_SRC, alt: 'Agent ToDo 小程序码',
                draggable: false }),
              h('span', { className: 'at-connect-qr-cap' }, '微信扫一扫，打开 Agent ToDo 小程序')),
            h('ol', { key: 'steps', className: 'at-connect-steps' },
              h('li', { className: 'at-connect-step' },
                h('span', { className: 'at-connect-step-n' }, '1'),
                h('span', null, '在小程序「我的」页点「生成验证码」，拿到 6 位数字')),
              h('li', { className: 'at-connect-step' },
                h('span', { className: 'at-connect-step-n' }, '2'),
                h('span', null, '粘贴到下面，点「登录」完成登录'))),
            h('div', { key: 'field', className: 'at-connect-field' },
              h(U.TextInput, { label: '登录验证码', value: value, placeholder: '6 位登录验证码',
                onChange: setValue,
                onKeyDown: function (e) { if (e.key === 'Enter') submit() } }))
          ],
        s.ui.connected ? null : s.ui.connectError
          ? h('div', { className: 'at-danger-note', style: { marginTop: '8px' } }, s.ui.connectError) : null,
        s.ui.connected ? null
          : h('p', { className: 'at-connect-note' }, '登录验证码 10 分钟内有效，用过一次就失效'),
        h('div', { className: 'at-connect-foot' },
          s.ui.connected
            ? h(U.Btn, { variant: 'danger', onClick: function () { B.disconnect(); close() } }, '退出登录')
            : h(U.Btn, { onClick: close }, '先看看演示数据'),
          s.ui.connected
            ? h(U.Btn, { variant: 'primary', onClick: close }, '关闭')
            : h(U.Btn, { variant: 'primary', disabled: s.ui.connectBusy,
              onClick: submit }, s.ui.connectBusy ? '登录中…' : '登录'))))
  }

  function render(s) { return ConnectModal(s) }

  AT.overlays = {
    STYLE: STYLE, GLOBAL_STYLE: GLOBAL_STYLE, render: render,
    SidebarIcon: SidebarIcon, ComposerButton: ComposerButton,
    AssistantSaveAction: AssistantSaveAction, QuickCapture: QuickCapture,
    ComposerPicker: ComposerPicker, GlobalToast: GlobalToast,
    ConnectModal: ConnectModal, insertText: insertText,
    currentWorkspaceName: currentWorkspaceName,
    projectMatchesWorkspace: projectMatchesWorkspace,
    assistantTextOf: assistantTextOf,
    formatDeliverable: formatDeliverable
  }
})(AT, React, h)
