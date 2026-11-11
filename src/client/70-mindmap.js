/* 70-mindmap.js — 脑图详情区的完整编辑器（轮次 7：按小程序 PC 档完整对齐）。
 *
 * 排版 / 度量 / 六种格式 / 父子连线 / 折叠挂侧 / 拖拽落位判定 **全部复用**
 * 小程序 utils/mindmap-core.js（浏览器 wrapper 挂在 assets/mindmap-core.js）。
 * 插件只负责：把 core 的产物画成 DOM、把 DOM 手势翻译成 core 的入参、把 core
 * 算出的 {parentId,index} 落回树。规则层一个数值都不自己造。
 *
 * 与小程序逐项对齐的口径见各段注释；改任何一条前先回真源复核轮次号：
 *   · 252 轮 foldSideOf / foldStyleOf —— 折叠徽标挂「出边方向」、数字＝后代数
 *   · 256 轮 编辑态整排键不渲染；275 轮 挂图在 textarea 下方、根节点没有
 *   · 303 轮 浮条 [加子·加同级]‖[删除]‖[编辑·语音]（语音最右）、PC 提示在左上 .mm-tl
 *   · 92/211/212 轮 findDrop —— 判定点左中、找父与排位分基准、覆盖率兜底、取消态
 */
;(function (AT, React, h) {
  'use strict'
  var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text,
    S = AT.shell, V = AT.views
  var FS = [17, 15, 14, 14, 14, 14]
  /* 连线色真源＝小程序 utils/theme.js 的 LINK_C / LINK_DARK；由 wrapper 的
   * require('./theme').linkColor() 读 window.__AT_MM_LINK_COLOR__。 */
  var LINK_LIGHT = '#C8C8CC', LINK_DARK = '#858783'
  var TIP_KEY = 'agenttodo.mindmap.tip.pc'
  /* 编辑面板正文区（小程序 219/256 轮）：下限 96 / 上限 276 / 行高 22 / 外框吃掉 20。
   * 面板最高 356 ＝ 276 ＋ 44（取消保存）＋ 12（gap）＋ 24（上下内距）。 */
  var TA_MIN_H = 96, TA_MAX_H = 276, TA_LINE_H = 22, TA_BOX_EXTRA = 20
  var CAND_HOLD_MS = 80          // 候选父节点驻留（小程序 211 轮 P1-3）
  var ZOOM_FLASH_MS = 900        // 缩放比例胶囊淡出（小程序 .mm-zoom）

  var STYLE = [
    '.at-mm{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;background:var(--at-card)}',
    '.at-mm-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:0 0 auto;',
    'padding:9px 12px;border-bottom:1px solid var(--at-hairline-soft);background:var(--at-head-bg)}',
    '.at-mm-bar .at-select{height:28px;font-size:13px;padding:0 8px;border-radius:8px}',
    '.at-mm-bar .at-btn{height:28px;padding:0 9px;font-size:12px;gap:4px}',
    '.at-mm-bar-label{font-size:12px;color:var(--at-text2);margin-right:2px}',
    '.at-mm-gate{padding:7px 12px;background:var(--at-fresh-bg);color:var(--at-fresh);font-size:12px}',
    '.at-mm-info{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:7px 12px;',
    'border-bottom:1px solid var(--at-hairline-soft);font-size:12px;color:var(--at-slate)}',
    '.at-mm-info .at-input{width:190px;height:28px;font-size:12px;border-radius:8px;flex:0 0 190px}',
    '.at-mm-info-main{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.at-mm-viewport{position:relative;flex:1 1 auto;min-height:180px;overflow:hidden;',
    'background:var(--at-surface);outline:none;cursor:grab;user-select:none}',
    '.at-mm-viewport:active{cursor:grabbing}',
    '.at-mm-grid{position:absolute;inset:0;pointer-events:none;opacity:.5;',
    'background-image:radial-gradient(var(--at-hairline) 1px,transparent 1px);background-size:20px 20px}',
    '.at-mm-stage{position:absolute;left:0;top:0;transform-origin:0 0}',
    '.at-mm-links{position:absolute;left:0;top:0;pointer-events:none;max-width:none}',
    /* ★ 行高必须＝core 的 LH(1.4)；每行已由 metrics.lines 下发，CSS 不许再折一次
     *  （小程序 buildNodes 注释：渲染层再折一次会底部空一截 / 裁掉最后一行）。 */
    '.at-mm-node{position:absolute;display:flex;flex-direction:column;justify-content:center;',
    'padding:0 10px;border:1px solid var(--at-hairline);border-radius:10px;',
    'background:var(--at-card);color:var(--at-primary);line-height:1.4;overflow:visible;',
    'cursor:pointer;box-shadow:var(--at-sh-card);box-sizing:border-box;transition:box-shadow .12s}',
    '.at-mm-node:hover{border-color:var(--at-hairline-strong)}',
    '.at-mm-node.root{background:var(--at-yellow);border-color:transparent;',
    'color:var(--at-on-accent);font-weight:600}',
    '.at-mm-node.branch{font-weight:500}',
    '.at-mm-node.leaf{color:var(--at-slate)}',
    '.at-mm-node.is-sel{box-shadow:0 0 0 2px var(--at-yellow),var(--at-sh-float);z-index:3}',
    /* 编辑中的节点：边框闪一下（小程序 .mm-node.edit / mm-flash，0.9s） */
    '.at-mm-node.is-edit{animation:at-mm-flash .9s ease-in-out infinite;z-index:4}',
    '@keyframes at-mm-flash{0%,100%{box-shadow:0 0 0 2px var(--at-yellow),0 0 0 4px rgba(255,208,47,.34)}',
    '50%{box-shadow:0 0 0 2px rgba(255,208,47,.25),0 0 0 12px rgba(255,208,47,0)}}',
    /* 录音中的节点：外扩呼吸光圈 + 半透明遮罩 + 倒计时（小程序 .mm-node.rec） */
    '.at-mm-node.is-rec{animation:at-mm-breath 1.35s ease-out infinite;z-index:5}',
    '@keyframes at-mm-breath{0%{box-shadow:0 0 0 2px var(--at-yellow),0 0 0 0 rgba(255,208,47,.62)}',
    '70%{box-shadow:0 0 0 2px var(--at-yellow),0 0 0 12px rgba(255,208,47,0)}',
    '100%{box-shadow:0 0 0 2px var(--at-yellow),0 0 0 0 rgba(255,208,47,0)}}',
    '.at-mm-mask{position:absolute;inset:0;border-radius:10px;background:var(--at-card);',
    'background:color-mix(in srgb,var(--at-card) 84%,transparent);display:flex;',
    'align-items:center;justify-content:center;z-index:2;pointer-events:none}',
    '.at-mm-mask-t{font-size:15px;line-height:20px;font-weight:600;color:var(--at-primary);',
    'font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.at-mm-node.is-drop-child{box-shadow:0 0 0 2px var(--at-blue),var(--at-sh-float);z-index:4}',
    '.at-mm-node.is-drop-before:before{content:"";position:absolute;left:0;right:0;top:-5px;',
    'height:3px;border-radius:2px;background:var(--at-blue)}',
    '.at-mm-node.is-drop-after:after{content:"";position:absolute;left:0;right:0;bottom:-5px;',
    'height:3px;border-radius:2px;background:var(--at-blue)}',
    '.at-mm-node-lines{overflow:hidden;max-height:100%}',
    '.at-mm-node-lines>div{white-space:nowrap;overflow:hidden;text-overflow:clip}',
    /* 配图：宽高由 core 度量的 imgW/imgH 行内下发，与节点盒同源于一次排版 */
    '.at-mm-pic{display:block;object-fit:contain;border-radius:6px;margin-top:4px;pointer-events:none}',
    /* ★★ 折叠徽标（252 轮）：位置整串来自 core.foldStyleOf，不再写死「右侧」。
     * 纯指示、不可点（收起/展开有专门按键）⇒ pointer-events:none；尺寸 FOLD_D=20。 */
    '.at-mm-fold{position:absolute;width:20px;height:20px;border-radius:999px;',
    'background:var(--at-card);border:1px solid var(--at-hairline-strong);',
    'color:var(--at-slate);font-size:10px;line-height:18px;text-align:center;',
    'pointer-events:none;z-index:5;box-sizing:border-box}',
    '.at-mm-node.root .at-mm-fold{background:var(--at-yellow);border-color:transparent;',
    'color:var(--at-on-accent)}',

    /* 画布工具条：10 键 · 两条浮条（右上 5 / 左下 5），与小程序 .mm-tools/.mm-float 同构。
     * ★ 303 轮组序：[加子·加同级] ‖ [删除] ‖ [编辑·语音]（语音最右）。 */
    '.at-mm-canvas{position:relative;display:flex;flex-direction:column;min-height:0;',
    'flex:1 1 auto;min-height:180px}',
    '.at-mm-float{position:absolute;z-index:8;display:flex;align-items:center;gap:5px;',
    'padding:4px;border:1px solid var(--at-hairline);border-radius:12px;',
    'background:var(--at-frost);box-shadow:var(--at-sh-float)}',
    '.at-mm-float.is-top{right:12px;top:12px}',
    '.at-mm-float.is-bottom{left:12px;bottom:12px}',
    '.at-mm-sep{width:1px;height:18px;background:var(--at-hairline);margin:0 3px;flex:0 0 1px}',
    '.at-mm-fb{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;',
    'border:0;border-radius:8px;background:transparent;color:var(--at-slate);cursor:pointer;',
    'padding:0;flex:0 0 auto}',
    '.at-mm-fb:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
    '.at-mm-fb:disabled{opacity:.4;cursor:not-allowed}',
    '.at-mm-fb.arm{color:var(--at-danger)}',
    '.at-mm-fb:active:not(:disabled){transform:translateY(1px);opacity:.78}',
    '.at-mm-fb.is-rec{background:var(--at-yellow-soft);color:var(--at-primary);',
    'animation:at-mm-fb-breath 1.35s ease-out infinite}',
    '@keyframes at-mm-fb-breath{0%{box-shadow:0 0 0 0 rgba(255,208,47,.66)}',
    '70%{box-shadow:0 0 0 8px rgba(255,208,47,0)}100%{box-shadow:0 0 0 8px rgba(255,208,47,0)}}',
    '.at-mm-fb.is-up{background:var(--at-yellow-soft);color:var(--at-primary)}',
    '.at-mm-zoomchip:active{transform:translateY(1px);opacity:.78}',
    '.at-mm-tip-x:hover{opacity:.82}',
    /* ★ 左上竖列 .at-mm-tl（小程序 303 轮）：PC 提示与缩放比例共抢左上角，
     * 收进一个 flex 竖盒 ⇒ 提示在时比例尺自然落到它下面，关掉自动回 12/12。 */
    '.at-mm-tl{position:absolute;left:12px;top:12px;z-index:8;display:flex;',
    'flex-direction:column;align-items:flex-start;gap:8px;pointer-events:none}',
    '.at-mm-tl>*{pointer-events:auto}',
    /* 比例胶囊＝小程序 .mm-zoom：只在缩放时浮现、停手 900ms 淡出；点一下 fitView。
     * 平时 opacity:0 ＋ pointer-events:none ⇒ 绝不吃画布手势。 */
    '.at-mm-zoomchip{height:26px;padding:0 10px;border:1px solid var(--at-hairline);',
    'border-radius:999px;background:var(--at-frost);color:var(--at-text2);font-size:11px;',
    'font-family:var(--at-font-num);cursor:pointer;box-shadow:var(--at-sh-float);',
    'opacity:0;pointer-events:none;transition:opacity .18s ease}',
    '.at-mm-zoomchip.is-on{opacity:1;pointer-events:auto}',
    '.at-mm-zoomchip:hover{color:var(--at-primary);border-color:var(--at-hairline-strong)}',
    /* PC 提示：样式照 .cp-hint（黄软底＋黄边＋中段字），不是出错色 */
    '.at-mm-tip{position:relative;max-width:250px;font-size:11px;line-height:1.6;',
    'color:var(--at-text2);background:var(--at-yellow-soft);border:1px solid var(--at-yellow-line);',
    'border-radius:10px;padding:7px 9px;box-shadow:var(--at-sh-float)}',
    '.at-mm-tip-h{display:flex;align-items:center;gap:5px;font-weight:600;color:var(--at-primary)}',
    '.at-mm-tip-r{display:flex;align-items:center;gap:6px;margin-top:3px}',
    '.at-mm-kbd{padding:1px 5px;border:1px solid var(--at-yellow-line);border-radius:5px;',
    'background:var(--at-card);font-size:10px;color:var(--at-primary);white-space:nowrap}',
    '.at-mm-tip-f{display:block;margin-top:3px;color:var(--at-muted)}',
    '.at-mm-tip-x{position:absolute;right:4px;top:4px;width:16px;height:16px;border:0;',
    'background:transparent;color:var(--at-muted);cursor:pointer;padding:0;line-height:16px}',

    /* ★★ 编辑态（256 轮）：同一条左下浮条就地长高，键排**整排不渲染**；
     * 面板只有 textarea（＋非根节点的挂图行）＋ 取消/保存两键。底不动、顶往上长。 */
    '.at-mm-float.is-editing{flex-direction:column;align-items:stretch;gap:12px;',
    'width:min(440px,calc(100% - 24px));padding:12px}',
    /* 壳式多行输入：壳画 1px `--at-field-line` ＋ 圆角 10（与 `.at-input` 同一套），
     * 内层 textarea 无框透明；聚焦由壳的 `:focus-within` 表达，不吃外圈 outline。 */
    '.at-mm-ta-box{width:100%;border:1px solid var(--at-field-line);border-radius:10px;',
    'background:var(--at-card);padding:9px 8px;box-sizing:border-box;overflow:hidden}',
    '.at-mm-ta-box:focus-within{border-color:var(--at-text2)}',
    '.at-mm-ta{display:block;width:100%;border:0;padding:0;background:transparent;',
    'color:var(--at-primary);font-family:inherit;font-size:14px;line-height:22px;',
    'resize:none;outline:none;overflow:auto;text-align:justify}',
    '.at-mm-ta::-webkit-scrollbar{width:6px}',
    '.at-mm-ta::-webkit-scrollbar-thumb{background:var(--at-hairline-strong);border-radius:3px}',
    /* 节点编辑 · 挂图区（对齐小程序 capsule-attach）：96×72 空坑 / 缩略图，
     * 上传中遮罩 + 转圈，缩略图右下「更换」、右上 ✕ 移除。 */
    '.at-mm-attach{display:flex;align-items:center;gap:10px;font-size:11.5px;color:var(--at-text2)}',
    '.at-mm-attach-slot{flex:0 0 auto;display:flex;gap:8px}',
    '.at-mm-tile{width:96px;height:72px;padding:0;box-sizing:border-box;',
    'border:1px dashed var(--at-hairline-strong);border-radius:12px;background:var(--at-chip);',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;',
    'color:var(--at-text2);font:inherit;font-size:11px;cursor:pointer;flex:0 0 auto}',
    '.at-mm-tile:hover:not(:disabled){background:var(--at-hairline-soft)}',
    '.at-mm-tile:disabled{opacity:.4;cursor:default}',
    '.at-mm-thumb{position:relative;width:96px;height:72px;border-radius:12px;overflow:hidden;',
    'border:1px solid var(--at-hairline);background:var(--at-card);cursor:pointer;flex:0 0 auto}',
    '.at-mm-thumb:hover{opacity:.82}',
    '.at-mm-thumb-img{display:block;width:100%;height:100%;object-fit:cover;object-position:center top}',
    '.at-mm-swap{position:absolute;left:0;right:0;bottom:0;height:19px;padding:0;border:0;',
    'background:rgba(20,21,26,.5);color:#fff;font:inherit;font-size:10px;cursor:pointer}',
    '.at-mm-imgdel{position:absolute;right:4px;top:4px;width:20px;height:20px;border:0;',
    'border-radius:50%;background:rgba(20,21,26,.6);color:#fff;display:flex;align-items:center;',
    'justify-content:center;padding:0;cursor:pointer}',
    '.at-mm-imgdel:hover{background:rgba(20,21,26,.82)}',
    '.at-mm-imgdel::after{content:"";position:absolute;inset:-8px;border-radius:50%}',
    '.at-mm-wait{position:absolute;inset:0;background:var(--at-frost);display:flex;',
    'flex-direction:column;align-items:center;justify-content:center;gap:6px;',
    'font-size:10px;color:var(--at-text2)}',
    '.at-mm-spin{width:17px;height:17px;border-radius:50%;border:2px solid var(--at-hairline);',
    'border-top-color:var(--at-yellow-deep);animation:at-mm-spin .68s linear infinite}',
    '@keyframes at-mm-spin{to{transform:rotate(360deg)}}',
    '.at-mm-attach-meta{flex:1 1 auto;min-width:0;line-height:1.62;color:var(--at-text2)}',
    '.at-mm-acts{display:flex;align-items:center;gap:12px}',
    '.at-mm-act{flex:1 1 0;height:44px;display:inline-flex;align-items:center;justify-content:center;',
    'gap:6px;border:1px solid var(--at-hairline);border-radius:10px;background:var(--at-chip);',
    'color:var(--at-primary);font-family:inherit;font-size:15px;font-weight:500;cursor:pointer}',
    '.at-mm-act:hover:not(:disabled){background:var(--at-sunken)}',
    '.at-mm-act:disabled{opacity:.4;cursor:default}',
    '.at-mm-act.primary{background:var(--at-solid);border-color:transparent;color:#fff}',
    '.at-mm-act.primary:hover:not(:disabled){opacity:.82}',
    '.at-mm-act:active:not(:disabled){transform:translateY(1px);opacity:.78}',

    /* ★★ 拖拽六件标记（66/68/211/212 轮），全部落在 stage 内 ⇒ 与节点同一坐标系；
     * 恒定尺寸的两件用 1/scale 反算，缩到 20% 时仍看得清。 */
    '.at-mm-draglayer{position:absolute;left:0;top:0;pointer-events:none}',
    '.at-mm-dbox{position:absolute;box-sizing:border-box;pointer-events:none}',
    '.at-mm-dbox.src{border:2px dashed var(--at-muted);border-radius:10px}',
    '.at-mm-dbox.scope{border:2px dashed var(--at-yellow);border-radius:12px;opacity:.75}',
    '.at-mm-dbox.parent{border:2px solid var(--at-yellow);border-radius:10px;z-index:9}',
    '.at-mm-dbox.parent.is-under{background:rgba(255,208,47,.16)}',
    '.at-mm-dbox.parent.is-cancel{border:2px dashed var(--at-muted)}',
    '.at-mm-dbox.parent.is-root{box-shadow:0 0 0 3px var(--at-card),0 0 0 5px var(--at-yellow)}',
    '.at-mm-ghost{position:absolute;display:flex;flex-direction:column;justify-content:center;',
    'padding:0 10px;border:2px solid var(--at-yellow);border-radius:10px;',
    'background:var(--at-card);color:var(--at-primary);opacity:.92;line-height:1.4;',
    'box-sizing:border-box;box-shadow:var(--at-sh-float);overflow:hidden;z-index:10;pointer-events:none}',
    '.at-mm-draglink{position:absolute;pointer-events:none;z-index:11}',
    '.at-mm-dot{position:absolute;border:2px solid var(--at-yellow);border-radius:999px;',
    'background:var(--at-card);pointer-events:none;z-index:12;transform:translate(-50%,-50%)}',
    '.at-mm-slot{position:absolute;display:flex;align-items:center;justify-content:center;',
    'border-radius:999px;background:var(--at-yellow);color:var(--at-on-accent);',
    'font-size:10px;font-weight:600;pointer-events:none;z-index:12;transform:translate(-50%,-50%)}',
    /* 只读预览（待办详情「关联脑图」卡）：整张图缩进容器，一个手势都不挂 */
    '.at-mm-preview{position:absolute;inset:0;overflow:hidden}',
    '.at-mm-preview-stage{position:absolute;left:0;top:0;transform-origin:0 0}',
    '.at-mm-preview .at-mm-node{cursor:default;box-shadow:none}'
  ].join('')

  var corePromise = null
  function loadCore() {
    if (window.AgentTodoMindmapCore) return Promise.resolve(window.AgentTodoMindmapCore)
    if (corePromise) return corePromise
    corePromise = new Promise(function (resolve, reject) {
      var el = document.createElement('script')
      el.src = '/agent-todo/assets/mindmap-core.js'
      el.onload = function () { window.AgentTodoMindmapCore ? resolve(window.AgentTodoMindmapCore) : reject(new Error('core missing')) }
      el.onerror = function () { reject(new Error('core load failed')) }
      document.head.appendChild(el)
    })
    return corePromise
  }
  function rectOf(n) {
    return { id: n.id, x: n.x, y: n.y, w: n.w, h: n.h,
      cx: n.x + n.w / 2, cy: n.y + n.h / 2 }
  }
  /* core.foldStyleOf 给的是 'left:..px;top:..px;'，React 要对象 —— 只做格式转换，
   * 数值一个不改（挂侧的几何仍是 core 那份真源）。 */
  function styleObj(css) {
    var o = {}
    String(css || '').split(';').forEach(function (kv) {
      var i = kv.indexOf(':')
      if (i < 0) return
      var k = kv.slice(0, i).trim(), v = kv.slice(i + 1).trim()
      var num = parseFloat(v)
      o[k.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase() })] =
        (v.slice(-2) === 'px' && !isNaN(num)) ? num : v
    })
    return o
  }
  function fallbackLayout(root) {
    var nodes = [], rectById = {}, NODE_W = 180, NODE_H = 40, GAP_X = 56, GAP_Y = 14, y = 0
    ;(function walk(n, depth) {
      if (!n) return
      var kids = n.children || []
      var r = { id: n.id, x: depth * (NODE_W + GAP_X), y: y, w: NODE_W, h: NODE_H }
      nodes.push({ id: n.id, x: r.x, y: r.y, w: r.w, h: r.h,
        lines: String(n.text || '').split('\n'), level: depth,
        kind: depth === 0 ? 'root' : (kids.length ? 'branch' : 'leaf'),
        collapsed: !!n.collapsed, childCount: kids.length,
        imageUri: n.imageUri || '', imgW: 0, imgH: 0,
        fold: n.collapsed ? Math.max(0, Text.countNodes(n) - 1) : 0,
        foldSide: 'r', foldStyle: '' })
      rectById[n.id] = { x: r.x, y: r.y, w: r.w, h: r.h }
      y += NODE_H + GAP_Y
      kids.forEach(function (k) { walk(k, depth + 1) })
    })(root, 0)
    var width = Math.max.apply(null, nodes.map(function (n) { return n.x + n.w }).concat([400]))
    return { nodes: nodes, linksUri: '', linksW: 0, linksH: 0,
      width: width, height: Math.max(y, 200), rectById: rectById }
  }

  /* ★ 三步平移（−minX/minY → −box.x/box.y → −originX/originY）与 SVG viewBox、
   * 图片 left/top=−originX 成对；轮次 7 离线实测六格式 6/6 路径端点落在节点边缘。
   * dark 只用于把连线色交给 wrapper 的 linkColor()，不参与任何几何。 */
  function layout(core, root, format, dark) {
    var visible = Text.visibleTree(root)
    if (!visible) return null
    window.__AT_MM_LINK_COLOR__ = dark ? LINK_DARK : LINK_LIGHT
    if (!core) return fallbackLayout(visible)
    try {
      var metrics = core.metricsMap(visible, true)
      var raw = core.layoutOf(visible, true, format, metrics)
      var ids = Object.keys(raw)
      if (!ids.length) return fallbackLayout(visible)
      /* ★★ 折叠徽标挂侧（252 轮）：root 必须是**完整树**（折叠节点的子被剪过，
       * 只有完整树才认得「它原本有子节点」），L 用可见树排版（就是屏幕上那几个数）。 */
      var sides = core.foldSideOf ? core.foldSideOf(root, raw, format) : {}
      var rects = ids.map(function (id) { return Object.assign({}, raw[id]) })
      var minX = Math.min.apply(null, rects.map(function (r) { return r.x }))
      var minY = Math.min.apply(null, rects.map(function (r) { return r.y }))
      var shifted = {}
      rects.forEach(function (r) { r.x -= minX; r.y -= minY; r.cx -= minX; r.cy -= minY; shifted[r.id] = r })
      var built = null
      try { built = core.buildLinksUri(visible, true, shifted, format) } catch (e) { /* nodes only */ }
      var linksUri = built && built.uri ? built.uri : ''
      var box = built && built.box
      if (box) rects.forEach(function (r) { r.x -= box.x; r.y -= box.y; r.cx -= box.x; r.cy -= box.y })
      // 小程序的连线图包含 1168×722 的空画布；缩放只读节点包围盒，别把空白算进去。
      var originX = Math.min.apply(null, rects.map(function (r) { return r.x })) - 24
      var originY = Math.min.apply(null, rects.map(function (r) { return r.y })) - 24
      rects.forEach(function (r) { r.x -= originX; r.y -= originY; r.cx -= originX; r.cy -= originY })
      var level = {}, nodeMap = {}, rectById = {}
      ;(function walk(n, d) {
        level[n.id] = d; nodeMap[n.id] = n
        ;(n.children || []).forEach(function (k) { walk(k, d + 1) })
      })(visible, 0)
      rects.forEach(function (r) { rectById[r.id] = { x: r.x, y: r.y, w: r.w, h: r.h } })
      return {
        nodes: rects.map(function (r) {
          var n = nodeMap[r.id] || {}
          var full = Text.findNode(root, r.id) || n
          var m = metrics[r.id] || {}
          var collapsed = !!n.collapsed
          /* ★ 数字＝整支后代数（从完整树数），>99 显示 99+；只在收起时显示。 */
          var fold = collapsed ? Math.max(0, Text.countNodes(full) - 1) : 0
          var side = sides[r.id] || 'r'
          return { id: r.id, x: r.x, y: r.y, w: r.w, h: r.h,
            lines: (m.lines && m.lines.length) ? m.lines : [n.text || ''],
            level: level[r.id] || 0,
            kind: (level[r.id] || 0) === 0 ? 'root' : ((n.children || []).length ? 'branch' : 'leaf'),
            collapsed: collapsed, childCount: (n.children || []).length,
            imageUri: n.imageUri || '', imgW: m.imgW || 0, imgH: m.imgH || 0,
            fold: fold, foldSide: side,
            foldStyle: fold > 0 ? core.foldStyleOf(rectOf(r), side) : '' }
        }),
        linksUri: linksUri, linksW: box ? box.w : 0, linksH: box ? box.h : 0,
        linksX: -originX, linksY: -originY,
        width: Math.max.apply(null, rects.map(function (r) { return r.x + r.w })) + 24,
        height: Math.max.apply(null, rects.map(function (r) { return r.y + r.h })) + 24,
        rectById: rectById, format: format, linkColor: dark ? LINK_DARK : LINK_LIGHT
      }
    } catch (e) { return fallbackLayout(visible) }
  }
  function ToolBtn(props) {
    return h(U.Btn, { title: props.title || props.label, label: props.label,
      active: !!props.active, disabled: !!props.disabled, variant: props.variant,
      onClick: props.onClick },
      h(U.Icon, { name: props.icon, size: 15,
        tone: props.variant === 'primary' ? 'ink' : '' }), props.label)
  }

  function Detail(s, mm) { return h(Editor, { key: mm.id, s: s, mm: mm }) }

  /* 只读缩略 —— 待办详情「关联脑图」卡（小程序 171 轮：整张图摆在那儿，
   * 不能移动 / 不能编辑 / 不能缩放，点它去脑图详情）。与编辑器共用同一个 layout()，
   * 形状逐像素一致。★ 必须做成组件：里面有 hooks，普通函数调用会让钩子挂到调用者身上。 */
  function Preview(props) {
    var s = props.s, mm = props.mm
    var dark = AT.icons.useDark()
    var boxRef = React.useRef(null)
    var coreState = React.useState(window.AgentTodoMindmapCore || null)
    var core = coreState[0], setCore = coreState[1]
    var sizeState = React.useState({ w: 0, h: 0 })
    var size = sizeState[0], setSize = sizeState[1]
    var tree = s.tree[mm.id] || null

    React.useEffect(function () { B.loadTree(mm.id) }, [mm.id])
    React.useEffect(function () { loadCore().then(setCore).catch(function () {}) }, [])
    React.useEffect(function () {
      var el = boxRef.current
      if (!el) return
      function read() {
        var w = el.clientWidth, hh = el.clientHeight
        setSize(function (prev) { return (prev.w === w && prev.h === hh) ? prev : { w: w, h: hh } })
      }
      read()
      if (!window.ResizeObserver) return
      var o = new window.ResizeObserver(read)
      o.observe(el)
      return function () { o.disconnect() }
    }, [])

    if (!tree) return h('div', { className: 'at-mm-preview', ref: boxRef },
      h('div', { className: 'at-empty', style: { position: 'static', padding: '40px 0' } },
        '脑图加载中…'))
    var L = layout(core, tree, mm.format, dark)
    var zoom = 1
    if (L && size.w && size.h) {
      zoom = Math.max(.15, Math.min(1, (size.w - 16) / L.width, (size.h - 16) / L.height))
    }
    return h('div', { className: 'at-mm-preview', ref: boxRef },
      L ? h('div', { className: 'at-mm-preview-stage',
        style: { transform: 'translate(' + Math.max(8, (size.w - L.width * zoom) / 2) + 'px,' +
          Math.max(8, (size.h - L.height * zoom) / 2) + 'px) scale(' + zoom + ')' } },
        L.linksUri ? h('img', { className: 'at-mm-links', src: L.linksUri,
          style: { left: L.linksX || 0, top: L.linksY || 0 },
          width: L.linksW, height: L.linksH, alt: '' }) : null,
        L.nodes.map(function (n) {
          return h('div', { key: n.id, className: 'at-mm-node ' + n.kind,
            style: { left: n.x, top: n.y, width: n.w, height: n.h,
              fontSize: FS[Math.min(n.level, FS.length - 1)] } },
            h('div', { className: 'at-mm-node-lines' },
              (n.lines || []).map(function (line, i) { return h('div', { key: i }, line) }),
              n.imageUri ? h('img', { className: 'at-mm-pic', src: V.imgSrc(s, n.imageUri),
                style: { width: n.imgW || '100%', height: n.imgH || 64 }, alt: '节点配图' }) : null))
        }),
        L.nodes.filter(function (n) { return n.fold > 0 }).map(function (n) {
          return h('span', { key: 'fold-' + n.id, className: 'at-mm-fold',
            style: styleObj(n.foldStyle) }, n.fold > 99 ? '99+' : n.fold)
        })) : h('div', { className: 'at-empty', style: { position: 'static', padding: '40px 0' } },
        '这张脑图还是空的'))
  }
  function previewOf(s, mm) { return h(Preview, { key: mm.id, s: s, mm: mm }) }
  function View(s) {
    var mm = Core.byId(s.mindmaps, s.ui.mindmapId)
    return mm ? Detail(s, mm)
      : h(U.Empty, { icon: 'mindmap', title: '还没有打开过任何脑图',
        hint: '从左边列表里挑一张，或者新建一张空白的开始写',
        action: { label: '新建脑图', onClick: function () { S.openForm('mindmap', '') } } })
  }

  function Editor(props) {
    var s = props.s, mm = props.mm, mid = mm.id
    var dark = AT.icons.useDark()
    var [core, setCore] = React.useState(window.AgentTodoMindmapCore || null)
    var [format, setFormat] = React.useState(mm.format || 'mindmap')
    var [selected, setSelected] = React.useState('')
    var [scale, setScale] = React.useState(1)
    var [pan, setPan] = React.useState({ x: 0, y: 0 })
    var [edit, setEdit] = React.useState(null)
    var [delArmed, setDelArmed] = React.useState(false)
    var [voiceNode, setVoiceNode] = React.useState('')
    var [voicePhase, setVoicePhase] = React.useState('')
    var [voiceClock, setVoiceClock] = React.useState('')
    /* PC 提示：关掉就永久记住（小程序 303 轮，与胶囊一次性引导同一条口径）。 */
    var [tipOn, setTipOn] = React.useState(function () {
      try { return window.localStorage.getItem(TIP_KEY) !== '1' } catch (e) { return true }
    })
    var [zoomOn, setZoomOn] = React.useState(false)
    var [drag, setDrag] = React.useState(null)
    var viewRef = React.useRef(null)
    var panRef = React.useRef(null)
    var panNow = React.useRef(pan)
    var scaleNow = React.useRef(scale)
    var pendingRef = React.useRef(null)
    var holdTimer = React.useRef(null)
    var dragRef = React.useRef(null)
    var zoomTimer = React.useRef(null)
    var voiceTimer = React.useRef(null)
    var voiceSeq = React.useRef(0)
    var voiceActive = React.useRef(false)
    var voicePhaseRef = React.useRef('')
    var voiceNodeRef = React.useRef('')
    panNow.current = pan
    scaleNow.current = scale

    React.useEffect(function () {
      B.loadTree(mid)
      loadCore().then(setCore).catch(function () {})
    }, [mid])
    React.useEffect(function () { if (mm.format) setFormat(mm.format) }, [mm.format])
    React.useEffect(function () { setDelArmed(false) }, [selected, mid])

    var tree = s.tree[mid] || null
    React.useEffect(function () {
      var el = viewRef.current
      if (!el || !tree) return
      function center() {
        var bounds = layout(core, tree, format, dark)
        var w = el.clientWidth, hh = el.clientHeight
        if (!bounds || !w || !hh) return
        var zoom = Math.max(.2, Math.min(1.4, (w - 16) / bounds.width, (hh - 16) / bounds.height))
        setScale(zoom)
        setPan({ x: Math.max(12, (w - bounds.width * zoom) / 2),
          y: Math.max(12, (hh - bounds.height * zoom) / 2) })
      }
      center()
      if (!window.ResizeObserver) return
      var observer = new window.ResizeObserver(center)
      observer.observe(el)
      return function () { observer.disconnect() }
    }, [mid, core, format, tree && tree.id])
    /* 缩放比例胶囊：只在缩放那一瞬浮现、停手 900ms 自己淡出（小程序 flashZoom）。 */
    React.useEffect(function () {
      setZoomOn(true)
      clearTimeout(zoomTimer.current)
      zoomTimer.current = setTimeout(function () { setZoomOn(false) }, ZOOM_FLASH_MS)
      return function () { clearTimeout(zoomTimer.current) }
    }, [scale])
    React.useEffect(function () { return function () { clearTimeout(zoomTimer.current) } }, [])
    /* 换图 / 卸载时停掉节点录音（只 aborts 本编辑器起的那一段）。 */
    React.useEffect(function () {
      return function () {
        clearInterval(voiceTimer.current)
        voiceTimer.current = null
        if (voiceActive.current && AT.voice && AT.voice.abort) {
          try { AT.voice.abort() } catch (e) { /* ignore */ }
        }
        voiceActive.current = false
        voicePhaseRef.current = ''
        voiceNodeRef.current = ''
        voiceSeq.current += 1
        setVoiceNode('')
        setVoicePhase('')
        setVoiceClock('')
      }
    }, [mid])

    /* PC 滚轮缩放（小程序 onWheel）：不用 Ctrl，以光标为轴缩放；
     * 编辑面板 / textarea 内的滚轮留给它自己滚文本，画布不缩。 */
    React.useEffect(function () {
      var el = viewRef.current
      if (!el) return
      function handleWheel(e) {
        var target = e.target
        if (target && target.closest && target.closest(
          '.at-mm-float.is-editing, .at-mm-ta-box, textarea, select, input')) return
        var dy = Number(e.deltaY) || 0
        if (!dy) return
        if (e.deltaMode === 1) dy *= 16
        else if (e.deltaMode === 2) dy *= 400
        var v = scaleNow.current
        var p = panNow.current
        var next = Math.max(.2, Math.min(2.5, +(v * Math.exp(-dy * .0015)).toFixed(3)))
        e.preventDefault()
        if (next === v) return
        var rect = el.getBoundingClientRect()
        var px = e.clientX - rect.left
        var py = e.clientY - rect.top
        if (!isFinite(px) || !isFinite(py)) { px = rect.width / 2; py = rect.height / 2 }
        var cx = (px - p.x) / v
        var cy = (py - p.y) / v
        var nextPan = { x: px - cx * next, y: py - cy * next }
        scaleNow.current = next
        panNow.current = nextPan
        setScale(next)
        setPan(nextPan)
      }
      el.addEventListener('wheel', handleWheel, { passive: false })
      return function () { el.removeEventListener('wheel', handleWheel) }
    }, [mid, tree && tree.id, !!edit])

    /* ★★ 轮次 13 修复：这段监听**必须在 `if (!tree)` 之前**。
     * 它是 hooks 链的最后一环，而下面那句提前 return 在树还没到时先返回 ——
     * 首帧执行到 return 就收工（少一个 hook），第二帧树到了又执行到这里（多一个 hook）
     * ⇒ React 报 "Rendered more hooks than during the previous render"，整页白屏。
     * 演示数据一进详情树就在本地，一次渲染收工，所以从没暴露；登录后树要异步拉，首帧必空。 */
    React.useEffect(function () {
      function move(e) {
        var p = pendingRef.current
        if (p && !(dragRef.current && dragRef.current.on)) {
          var dx = e.clientX - p.sx, dy = e.clientY - p.sy
          if (Math.sqrt(dx * dx + dy * dy) >= ((core && core.DRAG_PX) || 8)) {
            clearTimeout(holdTimer.current)
            beginDrag(p)
          }
        }
        if (dragRef.current && dragRef.current.on) { updateDragAt(e.clientX, e.clientY); return }
        var pn = panRef.current
        if (pn) setPan({ x: pn.px + e.clientX - pn.x, y: pn.py + e.clientY - pn.y })
      }
      function up() {
        if (dragRef.current && dragRef.current.on) endDrag()
        pendingRef.current = null
        clearTimeout(holdTimer.current)
        panRef.current = null
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      return function () {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
    }, [tree, format, core, edit])

    if (!tree) return h('div', { className: 'at-mm' },
      h('div', { className: 'at-pane-banner' }, '正在加载脑图树…'))
    var L = layout(core, tree, format, dark)
    var gate = Core.mindmapGateOf(mm)
    var flat = Text.flatNodes(tree)
    var sel = selected && Text.findNode(tree, selected) ? selected : tree.id
    var selNode = Text.findNode(tree, sel)
    var fmtOptions = C.FORMATS.map(function (f) { return { key: f.key, name: f.label } })

    function update(nextTree, opts) {
      B.actions.setTree(mid, Text.relevel(nextTree, 0), opts || {})
      if (nextTree !== tree) setDrag(null)
    }
    function editNode(id) {
      var n = Text.findNode(tree, id)
      if (!n) return
      setSelected(id)
      setEdit({ id: id, text: n.text || '', remark: n.remark || '', imageUri: n.imageUri || '',
        imageUrl: n.imageUri ? V.imgSrc(s, n.imageUri) : '', imageUp: false })
    }
    function saveEdit() {
      if (!edit) return
      if (edit.imageUp) { B.toast('图片还在上传，稍等一下'); return }
      update(Text.treeRules.updateNode(tree, edit.id,
        { text: edit.text, remark: edit.remark, imageUri: edit.imageUri }))
      setEdit(null)
    }
    function setEditField(k, v) { setEdit(Object.assign({}, edit, (function () { var o = {}; o[k] = v; return o })())) }
    function patchEditImage(id, patch) {
      setEdit(function (cur) {
        return cur && cur.id === id ? Object.assign({}, cur, patch) : cur
      })
    }
    function pickEditImage() {
      if (!edit || edit.imageUp) return
      var targetId = edit.id
      V.pickImage(async function (file) {
        var local = ''
        try { local = URL.createObjectURL(file) } catch (e) { local = '' }
        patchEditImage(targetId, { imageUrl: local || edit.imageUrl || '', imageUp: true })
        try {
          var uri = B.get().ui.connected ? (await B.uploadImage(file)).uri : local
          patchEditImage(targetId, { imageUri: uri, imageUrl: local || V.imgSrc(B.get(), uri), imageUp: false })
        } catch (e) {
          patchEditImage(targetId, { imageUri: '', imageUrl: '', imageUp: false })
          B.toast((e && e.message) || '图片上传失败', 'danger')
        }
      })
    }
    function removeEditImage() {
      if (!edit || edit.imageUp) return
      if (edit.imageUrl && String(edit.imageUrl).indexOf('blob:') === 0) {
        try { URL.revokeObjectURL(edit.imageUrl) } catch (e) { /* ignore */ }
      }
      setEdit(Object.assign({}, edit, { imageUri: '', imageUrl: '' }))
    }
    /* 正文区高度按文本折行数现算（小程序 219 轮）：core.wrapText 给出折行行数，
     * 与节点度量同源；下限 96 / 上限 276，超出由 textarea 自己滚。 */
    function taHOf(text) { return editTaH(core, text) }
    function act(kind) {
      var rootLocked = sel === tree.id
      if (kind === 'child') {
        update(Text.treeRules.addNode(tree, sel, '新节点', false))
        setEdit(null); return
      }
      if (kind === 'sibling') {
        if (rootLocked) { B.toast('根节点没有同级'); return }
        update(Text.treeRules.addNode(tree, sel, '新节点', true))
        setEdit(null); return
      }
      if (kind === 'edit') { editNode(sel); return }
      if (kind === 'duplicate') {
        if (rootLocked) { B.toast('根节点不能复制'); return }
        update(Text.treeRules.duplicateNode(tree, sel)); return
      }
      if (kind === 'parent') {
        if (rootLocked) { B.toast('根节点上面没有层级了'); return }
        update(Text.treeRules.insertParent(tree, sel)); return
      }
      if (kind === 'indent') {
        var t1 = Text.treeRules.indentNode(tree, sel)
        if (t1 === tree || JSON.stringify(t1) === JSON.stringify(tree)) B.toast('前面没有可挂的同级节点')
        else update(t1)
        return
      }
      if (kind === 'outdent') {
        if (rootLocked) { B.toast('已经在最外层'); return }
        update(Text.treeRules.outdentNode(tree, sel)); return
      }
      if (kind === 'up' || kind === 'down') {
        if (rootLocked) { B.toast('根节点不能排序'); return }
        update(Text.treeRules.shiftNode(tree, sel, kind === 'up' ? -1 : 1)); return
      }
      if (kind === 'del') {
        if (rootLocked) { B.toast('根节点不能删除'); return }
        update(Text.treeRules.removeNode(tree, sel))
        setSelected(tree.id); setEdit(null)
        return
      }
      if (kind === 'collapse' || kind === 'expand') {
        var on = kind === 'collapse'
        update(Text.treeRules.setCollapsed(tree, sel, on, !on), { history: false })
        return
      }
      if (kind === 'expandAll' || kind === 'collapseAll') {
        update(Text.treeRules.setCollapsedAll(tree, kind === 'collapseAll'), { history: false })
        return
      }
      if (kind === 'undo' || kind === 'redo') {
        var moved = Text.historyMove(s.hist, mid, kind === 'undo' ? -1 : 1)
        if (!moved) { B.toast(kind === 'undo' ? '没有可撤销的改动' : '没有可重做的改动'); return }
        B.commit(function (cur) {
          var t = Object.assign({}, cur.tree); t[mid] = moved.tree
          return Object.assign({}, cur, { tree: t, hist: moved.hist,
            mindmaps: cur.mindmaps.map(function (m) { return m.id === mid
              ? Object.assign({}, m, { nodes: Text.countNodes(moved.tree), depth: Text.depthOf(moved.tree) }) : m }) })
        }, null, {}).then(function () { B.saveTree(mid, moved.tree) })
        return
      }
      if (kind === 'export') {
        B.copyText(Text.exportMarkdown(s, mid, { root: true, tasks: false }))
          .then(function (ok) { B.toast(ok ? '已复制脑图 Markdown' : '复制失败', ok ? 'default' : 'danger') })
        return
      }
      if (kind === 'fit') { fit(); return }
      if (kind === 'zoomIn') { setScale(function (v) { return Math.min(2.5, +(v + .15).toFixed(2)) }); return }
      if (kind === 'zoomOut') { setScale(function (v) { return Math.max(.2, +(v - .15).toFixed(2)) }); return }
    }
    function fit() {
      if (!L) return
      var box = viewRef.current || {}
      var w = box.clientWidth || 800, hh = box.clientHeight || 480
      var sv = Math.max(.2, Math.min(2.5, Math.min((w - 16) / L.width, (hh - 16) / L.height, 1.4)))
      setScale(sv)
      setPan({ x: Math.max(12, (w - L.width * sv) / 2), y: Math.max(12, (hh - L.height * sv) / 2) })
    }
    function onKey(e) {
      if (edit || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      if (e.nativeEvent && e.nativeEvent.isComposing) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); act(e.shiftKey ? 'redo' : 'undo'); return
      }
      var map = { Tab: 'child', Enter: 'sibling', F2: 'edit', Delete: 'del', Backspace: 'del' }
      if (map[e.key]) { e.preventDefault(); act(map[e.key]); return }
      if (e.key === 'Escape') { setSelected(tree.id); setEdit(null); return }
      if (e.key === '0') { fit(); return }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); act('zoomIn'); return }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); act('zoomOut'); return }
      if (e.key === 'ArrowLeft' && e.shiftKey) { e.preventDefault(); act('outdent'); return }
      if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); act('indent'); return }
    }
    async function stopVoice() {
      if (voicePhaseRef.current !== 'rec') return
      voicePhaseRef.current = 'up'
      clearInterval(voiceTimer.current)
      voiceTimer.current = null
      var nodeId = voiceNodeRef.current
      var seq = ++voiceSeq.current
      setVoicePhase('up')
      setVoiceClock('语音识别中')
      try {
        var bytes = await AT.voice.stop(60)
        var res = await AT.voice.transcribe(bytes)
        if (seq !== voiceSeq.current) return
        var said = String((res && res.text) || '').trim()
        if (!said) { B.toast('没听清，再试一次'); return }
        var curTree = ((B.get().tree || {})[mid]) || tree
        if (!Text.findNode(curTree, nodeId)) { B.toast('节点已不存在', 'danger'); return }
        update(Text.treeRules.updateNode(curTree, nodeId, { text: said }))
        B.toast('已写入节点')
      } catch (e) {
        if (seq === voiceSeq.current) B.toast((e && e.message) || '语音识别失败', 'danger')
      } finally {
        if (seq === voiceSeq.current) {
          voiceActive.current = false
          voicePhaseRef.current = ''
          voiceNodeRef.current = ''
          setVoiceNode('')
          setVoicePhase('')
          setVoiceClock('')
        }
      }
    }
    async function voiceEdit() {
      if (!AT.voice || !AT.voice.supported()) { B.toast('当前环境没有可用的麦克风', 'danger'); return }
      if (voicePhaseRef.current === 'up') return
      if (voicePhaseRef.current === 'rec') { stopVoice(); return }
      if (!sel) return
      setEdit(null)
      voicePhaseRef.current = 'rec'
      voiceNodeRef.current = sel
      setVoiceNode(sel)
      setVoicePhase('rec')
      setVoiceClock('60')
      voiceActive.current = true
      clearInterval(voiceTimer.current)
      var t0 = Date.now()
      voiceTimer.current = setInterval(function () {
        var left = 60 - Math.floor((Date.now() - t0) / 1000)
        if (left <= 0) { stopVoice(); return }
        setVoiceClock(String(left))
      }, 200)
      try {
        await AT.voice.start()
      } catch (e) {
        clearInterval(voiceTimer.current)
        voiceTimer.current = null
        voiceActive.current = false
        voicePhaseRef.current = ''
        voiceNodeRef.current = ''
        setVoiceNode('')
        setVoicePhase('')
        setVoiceClock('')
        B.toast((e && e.message) || '起录失败', 'danger')
      }
    }
    var canUndo = !!(s.hist && Text.historyMove(s.hist, mid, -1))
    var canRedo = !!(s.hist && Text.historyMove(s.hist, mid, 1))
    var rootLocked = sel === tree.id
    function armDel() {
      if (rootLocked) return
      if (!delArmed) { setDelArmed(true); return }
      setDelArmed(false)
      act('del')
    }

    /* ===== 拖拽落位（照抄小程序 findDrop / settleDrop / dragMarkPayload / endDrag） =====
     * 规则层全部走 core 的纯函数（zoneMapOf / pickParentId / slotIndexOf / slotMarkOf /
     * coverOf / anchorOf / buildDragLinkUri），插件只做「DOM 坐标 → 画布坐标」与渲染。
     * 锚点＝被拖节点左边缘中点（212 轮）；找父用锚点、排位用节点中心（212 轮）；
     * 一个落点都没有 ⇒ 取消态，松手什么都不做（211 轮 P0-2）。 */
    function dragL() {
      var o = {}
      if (L) L.nodes.forEach(function (n) { o[n.id] = rectOf(n) })
      return o
    }
    function subtreeBox(id, Ld) {
      var top = Text.findNode(Text.visibleTree(tree), id)
      if (!top) return null
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
      ;(function walk(n) {
        var r = Ld[n.id]
        if (r) {
          if (r.x < x0) x0 = r.x
          if (r.y < y0) y0 = r.y
          if (r.x + r.w > x1) x1 = r.x + r.w
          if (r.y + r.h > y1) y1 = r.y + r.h
        }
        ;(n.children || []).forEach(walk)
      })(top)
      return x0 === Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
    }
    function findDrop(ghost) {
      var d = dragRef.current
      if (!d || !ghost || !core) return null
      var Ld = d.L, vt = Text.visibleTree(tree)
      var anchor = { x: d.anchor.x + (ghost.x - d.r.x), y: d.anchor.y + (ghost.y - d.r.y) }
      var dragParent = Text.findParent(vt, d.id)
      var cands = Object.keys(Ld).filter(function (id) {
        return id !== d.id && !Text.isDescendant(vt, d.id, id)
      })
      var depthOf = function (id) { var n = Text.findNode(vt, id); return (n && n.level) || 0 }
      var parentOf = function (id) { var p = Text.findParent(vt, id); return p ? p.id : null }
      var sibsOf = function (id) {
        var p = Text.findParent(vt, id)
        if (!p) return []
        return (p.children || []).map(function (c) { return Ld[c.id] }).filter(Boolean)
      }
      /* 前置守卫：浮动矩形中心还在自己原位格子里 ⇒ 等于没动。
       * 不能指望 hostOf 发现 —— 自己被防环剔掉了（小程序 findDrop 同名守卫）。 */
      var selfR = Ld[d.id]
      if (selfR && dragParent &&
        ghost.cx >= selfR.x && ghost.cx <= selfR.x + selfR.w &&
        ghost.cy >= selfR.y && ghost.cy <= selfR.y + selfR.h) {
        var sk = (dragParent.children || []).map(function (c) { return c.id })
        var from = sk.indexOf(d.id)
        return { parentId: dragParent.id, index: from < 0 ? 0 : from, same: true }
      }
      var best = core.pickParentId(Ld, cands, depthOf, d.zones, anchor,
        { parentOf: parentOf, sibsOf: sibsOf })
      /* 覆盖率兜底：大节点整个盖住小目标时判定点落在空白里，认被盖住的那个。 */
      if (!best) best = core.coverOf(Ld, cands, ghost, core.COVER_MIN)
      if (!best) {
        if (!dragParent) return null
        var sk0 = (dragParent.children || []).map(function (c) { return c.id })
        var at0 = sk0.indexOf(d.id)
        return { parentId: dragParent.id, index: at0 < 0 ? 0 : at0,
          same: true, cancel: true, slotAt: null }
      }
      var pn = Text.findNode(vt, best)
      if (!pn) return null
      var kids = (pn.children || []).map(function (c) { return c.id })
      var slotAxis = (d.zones[best] || {}).slot || 'y'
      var slot = core.slotIndexOf(kids, Ld, d.id, { x: ghost.cx, y: ghost.cy }, slotAxis)
      var slotAt = slot.same ? null : core.slotMarkOf(Ld, kids, d.id, slot.index, slotAxis)
      return { parentId: best, index: slot.index, same: slot.same, cancel: false, slotAt: slotAt }
    }
    function settleDrop(drop) {
      var d = dragRef.current
      if (!d || !drop) return drop
      var st = d.settled
      if (!st || drop.same || drop.cancel || st.same || st.cancel || drop.parentId === st.parentId) {
        d.settled = drop; d.cand = null; return drop
      }
      var now = Date.now()
      if (!d.cand || d.cand.id !== drop.parentId) {
        d.cand = { id: drop.parentId, since: now }; return st
      }
      if (now - d.cand.since < CAND_HOLD_MS) return st
      d.settled = drop; d.cand = null; return drop
    }
    function dragMarks(ghost) {
      var d = dragRef.current
      var drop = settleDrop(findDrop(ghost))
      if (!drop || !d) return { drop: null }
      var r = d.L[drop.parentId]
      if (!r) return { drop: null }
      var PAD = core.PARENT_PAD || 3
      var frame = { x: r.x - PAD, y: r.y - PAD, w: r.w + PAD * 2, h: r.h + PAD * 2,
        cx: r.cx, cy: r.cy }
      var dl = null
      if (!drop.cancel && core.buildDragLinkUri) {
        dl = core.buildDragLinkUri(frame, ghost, true, format,
          !(Text.visibleTree(tree) && drop.parentId === Text.visibleTree(tree).id))
      }
      var ov = 0
      var iw = Math.min(ghost.x + ghost.w, r.x + r.w) - Math.max(ghost.x, r.x)
      var ih = Math.min(ghost.y + ghost.h, r.y + r.h) - Math.max(ghost.y, r.y)
      if (iw > 0 && ih > 0) ov = (iw * ih) / Math.max(1, r.w * r.h)
      return { drop: drop, parentRect: r, linkUri: dl && dl.uri, linkBox: dl && dl.box,
        cancel: !!drop.cancel, under: ov >= .25,
        isRoot: drop.parentId === Text.visibleTree(tree).id }
    }
    function beginDrag(p) {
      if (!L || !core || edit) return
      var vt = Text.visibleTree(tree)
      var parent = Text.findParent(vt, p.id)     // 根节点不可拖
      if (!parent) return
      var Ld = dragL(), r = Ld[p.id]
      if (!r) return
      var d = { id: p.id, r: r, p0: { x: p.sx, y: p.sy },
        anchor: core.anchorOf ? core.anchorOf(r, null) : { x: r.x, y: r.y + r.h / 2 },
        L: Ld, scope: subtreeBox(p.id, Ld),
        zones: core.zoneMapOf ? core.zoneMapOf(vt, Ld) : {},
        settled: null, cand: null, drop: null, on: true }
      dragRef.current = d
      updateDragAt(p.sx, p.sy)      // 长按那一帧：父节点框就亮着（68 轮口径）
    }
    function updateDragAt(cx, cy) {
      var d = dragRef.current
      if (!d || !d.on) return
      var sc = scaleNow.current || 1
      var ghost = { x: d.r.x + (cx - d.p0.x) / sc, y: d.r.y + (cy - d.p0.y) / sc,
        w: d.r.w, h: d.r.h }
      ghost.cx = ghost.x + ghost.w / 2; ghost.cy = ghost.y + ghost.h / 2
      var mark = dragMarks(ghost)
      d.drop = mark.drop
      setDrag({ id: d.id, r: d.r, scope: d.scope, ghost: ghost, drop: mark.drop,
        parentRect: mark.parentRect, linkUri: mark.linkUri, linkBox: mark.linkBox,
        cancel: mark.cancel, under: mark.under, isRoot: mark.isRoot,
        slotAt: mark.drop && mark.drop.slotAt,
        slotIndex: mark.drop ? mark.drop.index + 1 : 0,
        anchor: { x: d.anchor.x + (ghost.x - d.r.x), y: d.anchor.y + (ghost.y - d.r.y) } })
    }
    function endDrag() {
      var d = dragRef.current
      var drop = d && d.drop
      dragRef.current = null
      setDrag(null)
      clearTimeout(holdTimer.current)
      if (!d || !d.on || !drop || drop.same || !Text.treeRules.moveTo) return
      var par = Text.findParent(Text.visibleTree(tree), d.id)
      var sameParent = !!(par && par.id === drop.parentId)
      var next = Text.treeRules.moveTo(tree, d.id, drop.parentId, drop.index)
      if (next === tree || JSON.stringify(next) === JSON.stringify(tree)) return
      update(next)
      setSelected(d.id)
      B.toast(sameParent ? '已调整顺序' : '已收作子节点')
    }
    function nodeDown(e, id) {
      if (e.button !== 0) return
      e.preventDefault()
      setSelected(id)
      if (edit) return
      var p = { id: id, sx: e.clientX, sy: e.clientY }
      pendingRef.current = p
      clearTimeout(holdTimer.current)
      holdTimer.current = setTimeout(function () { beginDrag(p) },
        (core && core.HOLD_MS) || 300)
    }
    function bgDown(e) {
      var t = e.target
      if (!t || !t.getAttribute || !t.getAttribute('data-mm-bg')) return
      panRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    }

    /* ===== 渲染 ===== */
    var dv = drag
    var taH = edit ? taHOf(edit.text) : 0
    var inv = 1 / (scale || 1)          // 恒定屏幕尺寸的标记：16/scale
    var dropNode = dv ? (L ? L.nodes.filter(function (n) { return n.id === dv.id })[0] : null) : null
    function boxStyle(r, pad) {
      return { left: r.x - pad, top: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2 }
    }
    return h('div', { className: 'at-mm' },
      gate ? h('div', { className: 'at-mm-gate' }, Core.GATE_TIP[gate] + ' · 仍可直接编辑') : null,
      h('div', { className: 'at-mm-canvas' },
        h('div', { className: 'at-mm-viewport', ref: viewRef, tabIndex: 0,
          'data-mm-bg': '1', onKeyDown: onKey, onMouseDown: bgDown },
          h('div', { className: 'at-mm-grid', 'data-mm-bg': '1' }),
          L ? h('div', { className: 'at-mm-stage', 'data-mm-bg': '1',
            style: { transform: 'translate(' + pan.x + 'px,' + pan.y + 'px) scale(' + scale + ')' } },
            L.linksUri ? h('img', { className: 'at-mm-links', src: L.linksUri,
              style: { left: L.linksX || 0, top: L.linksY || 0 },
              width: L.linksW, height: L.linksH, alt: '', 'data-mm-bg': '1' }) : null,
            dv && dv.scope ? h('div', { className: 'at-mm-dbox scope',
              style: boxStyle(dv.scope, 14) }) : null,
            dv ? h('div', { className: 'at-mm-dbox src', style: boxStyle(dv.r, 0) }) : null,
            dv && dv.parentRect ? h('div', { className: 'at-mm-dbox parent' +
              (dv.cancel ? ' is-cancel' : '') + (dv.under ? ' is-under' : '') +
              (dv.isRoot ? ' is-root' : ''), style: boxStyle(dv.parentRect, 3) }) : null,
            dv && dv.linkUri && dv.linkBox ? h('img', { className: 'at-mm-draglink',
              src: dv.linkUri, style: { left: dv.linkBox.x, top: dv.linkBox.y },
              width: dv.linkBox.w, height: dv.linkBox.h, alt: '' }) : null,
            L.nodes.map(function (n) {
              return h('div', { key: n.id, className: 'at-mm-node ' + n.kind +
                (sel === n.id ? ' is-sel' : '') +
                (edit && edit.id === n.id ? ' is-edit' : '') +
                (voiceNode === n.id ? ' is-rec' : ''),
                style: { left: n.x, top: n.y, width: n.w, height: n.h,
                  fontSize: FS[Math.min(n.level, FS.length - 1)] },
                onMouseDown: function (e) { nodeDown(e, n.id) },
                onClick: function () { setSelected(n.id) },
                onDoubleClick: function () { editNode(n.id) } },
                voiceNode === n.id ? h('div', { className: 'at-mm-mask' },
                  h('span', { className: 'at-mm-mask-t' }, voiceClock)) : null,
                h('div', { className: 'at-mm-node-lines' },
                  (n.lines || []).map(function (line, i) { return h('div', { key: i }, line) }),
                  n.imageUri ? h('img', { className: 'at-mm-pic', src: V.imgSrc(s, n.imageUri),
                    style: { width: n.imgW || '100%', height: n.imgH || 64 },
                    alt: '节点配图' }) : null))
            }),
            /* 折叠徽标必须住在 stage 层，与节点同坐标；若塞进节点内部，
             * foldStyleOf 给的是 stage 坐标，会被节点 left/top 再偏移一次 ⇒ 徽章飞到画布外。 */
            L.nodes.filter(function (n) { return n.fold > 0 }).map(function (n) {
              return h('span', { key: 'fold-' + n.id, className: 'at-mm-fold',
                style: styleObj(n.foldStyle) }, n.fold > 99 ? '99+' : n.fold)
            }),
            dv && dv.ghost ? h('div', { className: 'at-mm-ghost',
              style: { left: dv.ghost.x, top: dv.ghost.y, width: dv.ghost.w, height: dv.ghost.h },
              fontSize: (dropNode ? FS[Math.min(dropNode.level, FS.length - 1)] : 14) },
              h('div', { className: 'at-mm-node-lines' },
                (dropNode ? dropNode.lines : []).map(function (line, i) {
                  return h('div', { key: i }, line)
                }))) : null,
            dv && dv.anchor ? h('span', { className: 'at-mm-dot',
              style: { left: dv.anchor.x, top: dv.anchor.y,
                width: 11 * inv, height: 11 * inv } }) : null,
            dv && dv.slotAt && !dv.cancel && !(dv.drop && dv.drop.same)
              ? h('span', { className: 'at-mm-slot',
                style: { left: dv.slotAt.x, top: dv.slotAt.y,
                  width: 16 * inv, height: 16 * inv, fontSize: 10 * inv } }, dv.slotIndex)
              : null)
            : h('div', { className: 'at-empty' }, '这张脑图还是空的')),

        /* 左上竖列：PC 提示 ＋ 瞬时比例胶囊（小程序 303 轮 .mm-tl） */
        h('div', { className: 'at-mm-tl' },
          tipOn ? h('div', { className: 'at-mm-tip' },
            h('button', { type: 'button', className: 'at-mm-tip-x', title: '关闭提示',
              'aria-label': '关闭提示',
              onClick: function () {
                setTipOn(false)
                try { window.localStorage.setItem(TIP_KEY, '1') } catch (e) { /* 无 storage 也不报错 */ }
              } }, '×'),
            h('div', { className: 'at-mm-tip-h' },
              h(U.Icon, { name: 'info', size: 13, opacity: .9 }), '电脑端快捷操作'),
            h('div', { className: 'at-mm-tip-r' },
              h('span', { className: 'at-mm-kbd' }, '双击'), '节点即可编辑文字'),
            h('div', { className: 'at-mm-tip-r' },
              h('span', { className: 'at-mm-kbd' }, 'Tab'), '新增下一级子节点'),
            h('div', { className: 'at-mm-tip-r' },
              h('span', { className: 'at-mm-kbd' }, 'Enter'), '新增同级节点'),
            h('span', { className: 'at-mm-tip-f' }, 'Tab / Enter 需先点选节点')) : null,
          h('button', { type: 'button',
            className: 'at-mm-zoomchip' + (zoomOn ? ' is-on' : ''),
            title: '适应屏幕', 'aria-label': '适应屏幕',
            onClick: function () { fit() } }, Math.round(scale * 100) + '%')),

        /* 右上浮条：[撤回·重做] ‖ [编辑脑图信息] ‖ [展开·收起] */
        h('div', { className: 'at-mm-float is-top' },
          h('button', { type: 'button', className: 'at-mm-fb', title: '撤回', 'aria-label': '撤回',
            disabled: !canUndo, onClick: function () { act('undo') } },
            h(U.Icon, { name: 'undo', size: 17 })),
          h('button', { type: 'button', className: 'at-mm-fb', title: '重做', 'aria-label': '重做',
            disabled: !canRedo, onClick: function () { act('redo') } },
            h(U.Icon, { name: 'redo', size: 17 })),
          h('span', { className: 'at-mm-sep' }),
          h('button', { type: 'button', className: 'at-mm-fb', title: '编辑脑图信息',
            'aria-label': '编辑脑图信息',
            onClick: function () { S.openForm('mindmap', mid) } },
            h(U.Icon, { name: 'more', size: 17 })),
          h('span', { className: 'at-mm-sep' }),
          h('button', { type: 'button', className: 'at-mm-fb', title: '展开', 'aria-label': '展开选中节点',
            onClick: function () { act('expand') } },
            h(U.Icon, { name: 'expand', size: 17 })),
          h('button', { type: 'button', className: 'at-mm-fb', title: '收起', 'aria-label': '收起选中节点',
            onClick: function () { act('collapse') } },
            h(U.Icon, { name: 'collapse', size: 17 }))),

        /* 左下：编辑态整排键不渲染（256 轮）；静止态 303 轮组序 */
        edit ? h('div', { className: 'at-mm-float is-bottom is-editing' },
          h('div', { className: 'at-mm-ta-box', style: { height: taH } },
            h('textarea', { className: 'at-mm-ta', style: { height: taH - TA_BOX_EXTRA },
              value: edit.text, autoFocus: true, spellCheck: false,
              onChange: function (e) { setEditField('text', e.target.value) },
              onKeyDown: function (e) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveEdit() }
                if (e.key === 'Escape') setEdit(null)
              } })),
          edit.id !== tree.id ? h('div', { className: 'at-mm-attach' },
            h('div', { className: 'at-mm-attach-slot' },
              edit.imageUrl ? h('div', { className: 'at-mm-thumb', role: 'button', tabIndex: 0,
                onClick: pickEditImage,
                onKeyDown: function (e) {
                  if (e.target !== e.currentTarget) return
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickEditImage() }
                } },
                h('img', { className: 'at-mm-thumb-img', src: edit.imageUrl, alt: '节点配图' }),
                edit.imageUp
                  ? h('div', { className: 'at-mm-wait' }, h('span', { className: 'at-mm-spin' }), '上传中…')
                  : [
                    h('button', { key: 'swap', type: 'button', className: 'at-mm-swap',
                      onClick: function (e) { e.stopPropagation(); pickEditImage() } }, '更换'),
                    h('button', { key: 'del', type: 'button', className: 'at-mm-imgdel', title: '移除配图',
                      'aria-label': '移除配图',
                      onClick: function (e) { e.stopPropagation(); removeEditImage() } },
                      h(U.Icon, { name: 'w-close', size: 11 }))
                  ])
              : h('button', { type: 'button', className: 'at-mm-tile', disabled: edit.imageUp,
                onClick: pickEditImage },
                h(U.Icon, { name: 'album', size: 18, opacity: .55 }), '加截图')),
            h('div', { className: 'at-mm-attach-meta' },
              edit.imageUp ? '正在上传…'
                : edit.imageUrl ? '已挂 1 张，点图更换 · ✕ 移除'
                  : '最多挂 1 张图，留住截图里的现场')) : null,
          h('div', { className: 'at-mm-acts' },
            h('button', { type: 'button', className: 'at-mm-act ghost',
              onClick: function () { setEdit(null) } },
              h(U.Icon, { name: 'close', size: 16, opacity: .65 }), '取消'),
            h('button', { type: 'button', className: 'at-mm-act primary',
              disabled: !!edit.imageUp, onClick: saveEdit },
              h(U.Icon, { name: 'w-check', size: 16 }), '保存')))
          : h('div', { className: 'at-mm-float is-bottom' },
            h('button', { type: 'button', className: 'at-mm-fb', title: '加子节点',
              'aria-label': '加子节点', onClick: function () { act('child') } },
              h(U.Icon, { name: 'add-child', size: 17 })),
            h('button', { type: 'button', className: 'at-mm-fb', title: '加同级',
              'aria-label': '加同级', disabled: rootLocked,
              onClick: function () { act('sibling') } },
              h(U.Icon, { name: 'add-sibling', size: 17 })),
            h('span', { className: 'at-mm-sep' }),
            h('button', { type: 'button', className: 'at-mm-fb' + (delArmed ? ' arm' : ''),
              title: delArmed ? '再点一次删除' : '删除节点',
              'aria-label': delArmed ? '再点一次删除' : '删除节点',
              disabled: rootLocked, onClick: function () { armDel() } },
              h(U.Icon, { name: delArmed ? 'trash-red' : 'trash', size: 17 })),
            h('span', { className: 'at-mm-sep' }),
            h('button', { type: 'button', className: 'at-mm-fb', title: '改文本',
              'aria-label': '改文本', onClick: function () { act('edit') } },
              h(U.Icon, { name: 'edit', size: 17 })),
            h('button', { type: 'button',
              className: 'at-mm-fb' + (voicePhase === 'rec' ? ' is-rec' : '') +
                (voicePhase === 'up' ? ' is-up' : ''),
              title: voicePhase === 'rec' ? '停止录音' : voicePhase === 'up' ? '语音识别中' : '语音改文本',
              'aria-label': voicePhase === 'rec' ? '停止录音' : voicePhase === 'up' ? '语音识别中' : '语音改文本',
              disabled: voicePhase === 'up',
              onClick: function () { voiceEdit() } },
              h(U.Icon, { name: 'voice', size: 17,
                opacity: voicePhase === 'rec' || voicePhase === 'up' ? 1 : .9 })))))
  }

  /* 模块级小工具（判据可直接求值），与 Editor 内 taHOf 同一口径。 */
  function editTaH(core, text) {
    var lines = 1
    if (core && core.wrapText) {
      try { lines = Math.max(1, core.wrapText(String(text || ''), 26).length) }
      catch (e) { lines = String(text || '').split('\n').length }
    } else lines = String(text || '').split('\n').length
    return Math.max(TA_MIN_H, Math.min(TA_MAX_H, lines * TA_LINE_H + TA_BOX_EXTRA))
  }
  AT.mindmap = { STYLE: STYLE, View: View, Detail: Detail, Editor: Editor,
    Preview: previewOf, PreviewView: Preview,
    layout: layout, loadCore: loadCore, styleObj: styleObj, editTaH: editTaH,
    LINK_LIGHT: LINK_LIGHT, LINK_DARK: LINK_DARK, TIP_KEY: TIP_KEY }
})(AT, React, h)
