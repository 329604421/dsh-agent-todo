/* Agent ToDo · DSH client — GENERATED FILE. Do not edit by hand.
 * Source: src/client/*.js   Build: node scripts/build-client.cjs
 * Generated at 2026-11-11T06:46:12.018Z
 */
window.__ModuleLoader__.load({
  id: '@local/agent-todo',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const AT = {};
    if (typeof window !== 'undefined' && window.__AGENT_TODO_TEST__) window.__AGENT_TODO_CORE__ = AT;
    /* ===== 05-icons.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    /* ===== 08-style.js ===== */
    ;(function (AT, React, h) {
      /* 08-style.js — Agent ToDo · DSH 插件前端样式标准（唯一真源）
       *
       * 定位：本模块只管「怎么长」，不管「长什么 / 做什么」。
       *   · S            尺寸 / 字阶 / 间距 / 控件 / 动效 / 层级的数值真源（PC 端逐值对齐）
       *   · tokensCss()  补充设计令牌（PC 端有、40-ui.js 未登记的那几支，含深浅两档）
       *   · BASE_CSS     字体 / 控件状态 / 动效 / reduced-motion 的通用规则
       *   · base(dark)   统一的样式注入序列：小程序令牌 → DSH 宿主令牌 → 补充令牌 → 通用基线
       *   · geom(b)      窗口适配：内容展示区 → 主抽屉 / 动作组 / 副抽屉 / 编辑面板几何
       *
       * 为什么必须有 base()：50-shell.js 与 95-overlays.js 会追加 AT.desktop.STYLE
       * （把 --at-* 映射到 DSH 的 --dsw-alias-*），而 80-capsule.js 以前只注入
       * U.themeCss() ⇒ 胶囊层用的是小程序回退字体与色，工作台用的是 DSH 令牌，
       * 同一屏里两套皮肤。所有浮层统一从 base(dark) 起手，后面只追加自己的 STYLE。
       *
       * 约束（见交接文档 §4.3）：样式挂在组件树里的 <style>，不写 document.head；
       * 不引第二份 React、不加打包器；所有尺寸都是 CSS px（DPR 由宿主处理）。
       */
      ;(function (AT, React, h) {
        'use strict'

        /* ------------------------------------------------------------ 数值真源 --- */
        var S = {
          /* 间距栅格：4 的倍数，胶囊 / 抽屉 / 表单一律从这里取 */
          SPACE: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
          /* 字阶：DSH 宿主字体优先（--at-font 由 85-desktop.js 映射 --dsw-alias-font-body）；
           * 数字 / 倒数走 --atx-font-num + tabular-nums，避免逐秒左右抖。 */
          TYPE: {
            size: { micro: 11, caption: 12, body: 13, text: 14, title: 16, metric: 22 },
            weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
            line: { tight: 1.4, body: 1.5, relax: 1.6 }
          },
          RADIUS: { control: 8, field: 10, card: 12, panel: 16, pill: 999 },
          CONTROL: { h28: 28, h32: 32, h36: 36, h40: 40, h46: 46 },
          /* 闪念胶囊几何（逐值对齐小程序 **PC / 横屏** capsule.wxss + nav-rail.wxss）：
           * 抽屉 320 / 标题带 52 / 动作列 72（键 64×46）/ 副弹窗 260 /
           * 卡片引线 3×18 / 空心卡 42。
           * ★★★ v1.5：悬浮键 **40** ＝ PC/横屏的 `.rail-brand`（nav-rail.wxss 148 行）。
           * `app.wxss` 的 `.fab` 是 56，但它只在 `!phone && !landscape`（**平板竖屏**）出现
           * —— v1.4 抄错分支，把竖屏那颗放大键搬到了 PC 档，用户实测「又有点过大」。 */
          CAPSULE: {
            /* PC / 横屏档：40 方 / 12 圆角 / 品牌图满幅 40 / 麦克风 22 / 倒数 18 / 写键同尺寸 */
            fab: 40, fabRadius: 12, fabIcon: 40, fabMic: 22, fabClock: 18,
            write: 40, writeIcon: 22, fabMargin: 24,
            drawerW: 320, drawerMinW: 220, drawerRadius: 16, headH: 52,
            listPad: 12, listPadBottom: 6, cardRadius: 12,
            leadW: 3, leadH: 18, leadLeft: 6, leadTop: 12,
            opsW: 72, opsGap: 6, opsKeyW: 64, opsKeyH: 46, opsKeyRadius: 12,
            opsInsideW: 44, opsInsideKey: 42,
            subW: 260, subMinW: 220, subOverlap: 50, subHeadH: 52,
            subBodyPadT: 12, subBodyPadX: 14, areaH: 132, editAreaH: 148,
            footBtnH: 40, footBtnRadius: 10,
            hollowH: 42, emptyIco: 58,
            /* PC 263 / 272 / 302 轮：卡片配图 148 高、看大图角标 19 高、
             * 末尾占位 98（滚动上限，不能用 padding-bottom 代替）、
             * 已删除名单每页 10 条（正常名单不分页）、长按 550ms 进编辑。 */
            picH: 148, picRadius: 9, zoomH: 19, moreH: 34, endGap: 98,
            delPage: 10, longPressMs: 550,
            /* 打开态的右侧停靠带（v1.5 起对齐 PC / 横屏 `.rail-brand` + `.rail-write`）：
             * 两颗 40 方键**竖排**停在主抽屉右缘之外那条动作列上（写在上、说在下），
             * 距抽屉底 dockPad、两键相距 dockGap。内容区放不下时退回抽屉内左下角横排。 */
            dockPad: 12, dockGap: 10,
            /* 录音降落区（PC `.cp-tail` / `--cp-drop`）：抽屉高 × 0.42，下限 96。
             * 起录展开、停录后留着让新卡片升起，落位 2.4s 后自动收（PC 是"用户碰列表才收"，
             * 插件抽屉更矮 —— 半高的列表不该一直占着）。 */
            tailRatio: 0.42, tailMin: 96, tailHold: 2400, tailLit: 900, landMs: 720,
            /* ★ v1.8 · 语音一轮最长 60s（同小程序 RecorderManager 的时长上限）。
             * 16 kHz / 16 bit / 单声道 60s ≈ 1.92MB：DSH 语音服务上限 4MB 够用，
             * 插件代理的上限本轮一起提到 8MB（原 2MB 会把 60s 的整段 WAV 顶掉）。 */
            recMax: 60,
            /* ★★ v1.5 · **主抽屉侧转**（PC `capsule.wxss` 的 `.cp.turned`）：
             * 第二档（转待办 / 转脑图）一开，第一档侧转 25° 且不可点 ——
             * 两张 320 宽的弹窗同屏，不转就读成「一张盖住了另一张」。
             * 插件的层级基线比小程序高，这里只取「低于副抽屉」的相对关系（129 < 141）。 */
            turnDeg: 25, turnPerspective: 1100, turnDur: '0.22s',
            /* 第二档两张（转待办 = `.sd.o1`、转脑图 = `drawer` 的 `.dw.o1`）：
             * **都是 320 宽、左缘 = 主抽屉左缘 + 270（＝与主抽屉重叠 50）、与主抽屉同高**。
             * v1.4 把转脑图误认成 `.sd3`（260 宽 / +12）—— 那其实是表单里
             * 「选择其他项目」的**三级**项目副弹窗，与转脑图无关。 */
            o1W: 320, o1Shift: 270,
            pad: 12, padTight: 8, topPad: 16, topPadTight: 8,
            wideBound: 440, tallBound: 500, editRoomMin: 240
          },
          MOTION: {
            fast: 0.12, fade: 0.16, enter: 0.18, pop: 0.26, breath: 1.35,
            ease: 'cubic-bezier(.2,.8,.3,1)'
          },
          Z: {
            mask: 120, drawer: 130, drawerTurned: 129, ops: 132, editScrim: 133,
            subMask: 140, sub: 141, write: 149, fab: 150, confirm: 160, preview: 170
          }
        }

        /* ------------------------------------------------------------ 补充令牌 --- */
        /* PC 端 263 轮为「实心危险键」派生的一对令牌：深色档不能直接用 --at-danger
         * （提亮成 #F08070 后铺满整颗键，白字只剩 2.4:1）。 */
        var LIGHT_TOKENS = [
          '--atx-font-num:var(--at-font-num,Inter,"Noto Sans SC",sans-serif);',
          /* ⚠️ `--atx-blue` 已挪到 `40-ui.js` 的 LIGHT/DARK —— 那一串由 `themeCss()` 每次注入
           * `.at-root/.at-gl`，主面板也能拿到；本文件这串只随 `base(dark)` 注入（目前只有闪念胶囊用），
           * 概览明细条的「创建」写在这里会是**未定义**。别再搬回来。 */
          '--atx-fill-danger:#C63B2E;--atx-on-fill-danger:#FFFFFF;--atx-danger-press:#A82E23;',
          '--atx-sh-sub:6px 10px 18px rgba(28,28,30,.14);',
          '--atx-sh-fab:0 3px 10px rgba(28,28,30,.18),0 1px 2px rgba(28,28,30,.12);',
          '--atx-sh-fab-hover:0 5px 14px rgba(28,28,30,.22),0 1px 2px rgba(28,28,30,.12);',
          '--atx-yellow-dash:#E9CE73;--atx-yellow-glow:rgba(255,208,47,.62);',
          /* 302 轮「语音识别中」整卡霜白遮罩 / 263 轮「看大图」角标（两档同值） */
          '--atx-frost:rgba(255,255,255,.74);--atx-zoom-bg:rgba(28,28,30,.55);',
          '--atx-on-accent-soft:rgba(28,28,30,.56);',
          '--atx-dur-fast:.12s;--atx-dur-fade:.16s;--atx-dur-enter:.18s;--atx-dur-pop:.26s;',
          '--atx-ease:cubic-bezier(.2,.8,.3,1);--atx-breath:1.35s;'
        ].join('')
        var DARK_TOKENS = [
          '--atx-fill-danger:#4A2A2C;--atx-on-fill-danger:#F28B8F;--atx-danger-press:#5A3436;',
          '--atx-sh-sub:6px 10px 18px rgba(0,0,0,.46);',
          '--atx-sh-fab:0 3px 10px rgba(0,0,0,.45),0 1px 2px rgba(0,0,0,.30);',
          '--atx-sh-fab-hover:0 5px 14px rgba(0,0,0,.55),0 1px 2px rgba(0,0,0,.30);',
          '--atx-frost:rgba(38,39,42,.76);',
          '--atx-yellow-dash:#6B5A2A;'
          /* `--atx-blue` 的深色支同 LIGHT 段，已挪到 `40-ui.js` 的 DARK。 */
        ].join('')

        function tokensCss(dark) {
          return '.at-root,.at-gl{' + LIGHT_TOKENS + (dark ? DARK_TOKENS : '') + '}'
        }

        /* -------------------------------------------------------------- 通用基线 --- */
        var BASE_CSS = [
          /* 主题无关：字体继承、数字、控件状态、滚动条、焦点 */
          '.at-gl,.at-cx-root{font-family:var(--at-font);color:var(--at-primary)}',
          /* ★ 原生控件复位必须是「零特异度」：:where() 让整条规则只算 .at-gl 的 0,1,0，
           * 任何单类控件（.at-cx-op / .at-cx-hbtn / .at-cx-btn …）后写的 color 都能盖过它。
           * 写成 .at-gl button{color:inherit}（0,1,1）会压掉全部单类着色规则：
           * 浅色下深底深字、深色下恒亮面反白，且只有双类规则（is-primary / is-danger）幸存，
           * 症状零散、极难归因。浮层一律从 base() 起手，本条即自动生效，不要在各层复写。 */
          '.at-gl :where(button,input,textarea,select){font:inherit;color:inherit}',
          '.atx-num{font-family:var(--atx-font-num);font-variant-numeric:tabular-nums}',
          '.atx-clickable{transition:background var(--atx-dur-fast) ease,',
          'border-color var(--atx-dur-fast) ease,color var(--atx-dur-fast) ease,',
          'transform var(--atx-dur-fast) ease,opacity var(--atx-dur-fast) ease}',
          '.atx-clickable:hover:not(:disabled){opacity:.82}',
          '.atx-clickable:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.atx-clickable:disabled,.atx-dim{opacity:.4;cursor:not-allowed}',
          '.atx-scroll{scrollbar-width:thin;scrollbar-color:var(--at-hairline-strong) transparent}',
          '.at-gl :focus-visible{outline:2px solid var(--at-blue);outline-offset:2px}',
          /* 动效：遮罩淡入 / 主面板淡入 4px / 副面板只淡入 / 品牌黄呼吸 / 波纹 / 气泡升起 */
          '@keyframes atxFade{from{opacity:0}to{opacity:1}}',
          '@keyframes atxIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}',
          '@keyframes atxBreath{0%{box-shadow:0 0 0 0 var(--atx-yellow-glow)}',
          '70%{box-shadow:0 0 0 8px rgba(255,208,47,0)}100%{box-shadow:0 0 0 8px rgba(255,208,47,0)}}',
          /* 302 轮「语音识别中」：整卡只动透明度，不动尺寸/位置（手指可能正落在它上面） */
          '@keyframes atxCardBreath{0%,100%{opacity:1}50%{opacity:.42}}',
          '@keyframes atxWave{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}',
          '@keyframes atxPop{from{opacity:0;transform:translateY(12px) scale(.985)}',
          'to{opacity:1;transform:translateY(0) scale(1)}}',
          /* 一处统一关掉所有动效：新增浮层只要用 atx* 动画就自动继承 */
          '@media (prefers-reduced-motion:reduce){',
          '.at-gl *,.at-cx-root *{animation:none!important;transition:none!important}}'
        ].join('')

        /* 统一注入序列。各模块这样用：
         *   h('style', null, AT.style.base(dark) + MY_STYLE)
         * ⚠️ 不要再只写 U.themeCss(dark)：那会漏掉 DSH 宿主令牌与补充令牌。 */
        function base(dark) {
          var U = AT.ui
          return (U && U.themeCss ? U.themeCss(dark) : '') +
            (AT.desktop && AT.desktop.STYLE ? AT.desktop.STYLE : '') +
            tokensCss(dark) + BASE_CSS
        }

        /* ------------------------------------------------------------ 窗口适配 --- */
        function clamp(v, min, max) {
          if (max < min) return min
          return Math.min(max, Math.max(min, v))
        }

        /* b = { left, top, width, height }，来自内容展示区 centerCol 的
         * getBoundingClientRect()（交接文档 §3）。返回全部浮层几何，纯函数、可离线判。 */
        function geom(b) {
          var K = S.CAPSULE
          var pad = b.width < K.wideBound ? K.padTight : K.pad
          var topPad = b.height < K.tallBound ? K.topPadTight : K.topPad
          var opsW = K.opsW, inside = false
          var drawerW = Math.min(K.drawerW, Math.max(K.drawerMinW, b.width - pad * 2 - opsW - K.listPad))
          function fits(ow) { return pad + drawerW + K.listPad + ow + pad <= b.width }
          if (!fits(opsW)) {
            opsW = K.opsInsideW
            drawerW = Math.min(K.drawerW, Math.max(200, b.width - pad * 2 - opsW - K.listPad))
          }
          if (!fits(opsW)) {
            inside = true
            opsW = K.opsInsideW
            drawerW = Math.max(180, b.width - pad * 2)
          }
          var width = Math.min(drawerW, Math.max(160, b.width - pad * 2))
          var g = {
            pad: pad, topPad: topPad, opsW: opsW, inside: inside,
            left: b.left + pad, top: b.top + topPad, width: width,
            height: Math.max(160, b.height - topPad * 2),
            opsLeft: b.left + pad + width + K.listPad,
            opsRight: b.left + b.width - pad
          }
          /* ★ v1.5 打开态停靠带（对齐 **PC / 横屏** `.rail-brand` + `.rail-write`）：
           * 两颗 40 方键**竖排**「写在上 / 说在下」，竖线取「动作列那 64 宽键的中线」，
           * 底边距抽屉 dockPad —— 抽屉一开，浮键就从自由坐标换到这条竖线上，
           * 读作抽屉右侧那条工具列的一部分。关闭态仍走 pointOf(b, pos)。
           * 内容区放不下（inside）时退回**抽屉内左下角横排**：动作列此时也降到内侧右缘，
           * 一左一右不会连成一列；左下锚点与 defaultPos 的窄屏口径同侧。 */
          /* 内容区右侧还放不放得下一颗 40 方键 —— 停靠带自己的判定，不与动作列的
           * 两档降级绑在一起。 */
          g.railOutside = (b.left + b.width - pad - (g.left + g.width + K.listPad)) >= K.fab
          if (g.railOutside) {
            g.railLeft = g.opsLeft + (g.opsW >= K.opsW ? 12 : 0)
            g.railSayTop = g.top + g.height - K.dockPad - K.fab
            g.railWriteLeft = g.railLeft
            g.railWriteTop = g.railSayTop - K.dockGap - K.write
          } else {
            g.railLeft = g.left + K.dockPad
            g.railSayTop = g.top + g.height - K.dockPad - K.fab
            g.railWriteLeft = g.railLeft + K.fab + K.dockGap
            g.railWriteTop = g.railSayTop
          }
          /* 动作组的上限：竖排停靠带在右下方 ⇒ 组底不许压到它（PC 里这两者是两层，
           * 永不重叠）；停靠带退进抽屉（左下角）时与右侧的组天然不撞。 */
          g.opsLimitBottom = g.railOutside ? g.railWriteTop - K.listPad : g.top + g.height - 8
          /* 录音降落区高度（PC `--cp-drop` ≈ 抽屉半高减 56，这里直接取 0.42 倍） */
          g.tailH = Math.min(Math.max(K.tailMin, Math.round(g.height * K.tailRatio)), Math.max(K.tailMin, g.height - 168))
          /* 第一层副弹窗（写 / 编辑）：PC 的 260 副弹窗族，
           * 位置取「主抽屉右缘 + 12」（与 .ep / .cp-sheet.sub 同源）；
           * 右侧房间不足时退到「主抽屉右缘 − 50」的重叠档，最后夹回内容区。
           * ⚠️ 转待办 / 转脑图**不在这里**：它们走下面的第二档 `.o1`（320 / +270）。 */
          var subW = Math.min(K.subW, Math.max(K.subMinW, b.width - pad * 2))
          var subLeft = g.left + g.width + K.listPad
          if (subLeft + subW > b.left + b.width - pad) subLeft = g.left + g.width - K.subOverlap
          if (subLeft + subW > b.left + b.width - pad) subLeft = b.left + b.width - pad - subW
          if (subLeft < b.left + pad) subLeft = b.left + pad
          g.subLeft = subLeft
          g.subWidth = subW
          g.subTop = g.top
          g.subMaxHeight = g.height
          /* ★★ v1.5 · 第二档 `.o1`（转待办 `.sd.o1` ／ 转脑图 `.dw.o1`）：
           * 两者**同一副几何**：320 宽、left = 主抽屉 left + 270（＝与主抽屉重叠 50）、
           * 与主抽屉同高。PC `form-drawer.wxss` 的 `.sd.o1{left:354px}` 与
           * `drawer.wxss` 的 `.dw.o1{left:354px}` 逐字同值，主抽屉 left 84 ⇒ 84+270。
           * ⚠️ v1.4 的 260 / +12 是误把 `.sd3`（三级「选择其他项目」）当成转脑图。 */
          var o1W = Math.min(K.o1W, Math.max(K.subMinW, b.width - pad * 2))
          var o1Left = g.left + K.o1Shift
          if (o1Left + o1W > b.left + b.width - pad) o1Left = b.left + b.width - pad - o1W
          if (o1Left < b.left + pad) o1Left = b.left + pad
          g.todoLeft = o1Left
          g.todoWidth = o1W
          g.mapLeft = o1Left
          g.mapWidth = o1W
          /* 编辑面板：右侧 +12；房间不足 240 改到主抽屉内侧，宽度随主抽屉收。 */
          var room = b.left + b.width - (g.left + g.width) - K.listPad - pad
          g.editInside = room < K.editRoomMin
          g.editWidth = g.editInside ? Math.max(220, g.width - 48) : Math.min(K.subW, Math.max(240, room))
          g.editLeft = g.editInside ? g.left + 24 : g.left + g.width + K.listPad
          g.editTop = g.editInside ? g.top + 58 : g.top
          g.editMaxHeight = g.editInside ? Math.max(200, g.height - 74) : g.height
          return g
        }

        AT.style = {
          S: S, LIGHT_TOKENS: LIGHT_TOKENS, DARK_TOKENS: DARK_TOKENS,
          tokensCss: tokensCss, BASE_CSS: BASE_CSS, base: base, geom: geom, clamp: clamp
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 10-constants.js ===== */
    ;(function (AT, React, h) {
      /* 10-constants.js — dictionaries shared by core, views and the DSH shell.
       * Values are transcribed from 小程序前端/utils/mock.js, formats.js, forms.js.
       */
      ;(function (AT) {
        'use strict'

        /* icon 名与 components/nav-rail/nav-rail.js:42-48 逐字一致。 */
        var MODULES = [
          { key: 'overview', label: '概览', icon: 'overview' },
          { key: 'project', label: '项目', icon: 'project' },
          { key: 'todo', label: '待办', icon: 'todo' },
          { key: 'mindmap', label: '脑图', icon: 'mindmap' },
          { key: 'mine', label: '我的', icon: 'mine' }
        ]
        var DETAIL_MODULES = ['project', 'todo', 'mindmap']

        /* 一体化三栏的列表页签字典。列表是页内区域，不是抽屉。 */
        var LIST_META = {
          project: { label: '项目', sub: '项目是你自己建的分类，不依赖任何同步',
            create: '新建项目', empty: '还没有项目', search: '搜索项目', icon: 'project',
            idKey: 'projectId', form: 'project', unit: '个项目' },
          todo: { label: '待办', sub: '给 Agent 的输入任务',
            create: '记一条待办', empty: '还没有待办', search: '搜索待办', icon: 'todo',
            idKey: 'todoId', form: 'todo', unit: '条待办' },
          mindmap: { label: '脑图', sub: '结构化思考，贴着任务走',
            create: '新建脑图', empty: '还没有脑图', search: '搜索脑图', icon: 'mindmap',
            idKey: 'mindmapId', form: 'mindmap', unit: '张脑图' }
        }

        /* ★ v1.5 对齐小程序 `utils/mock.js` 的 URGENCIES：四档多带一支 `text`。
         * 表单里选中的那颗 chip 是「soft 底 ＋ main 描边 ＋ text 深字」——
         * 以前插件统一用「黄软底 ＋ 黄描边」，四档长得一模一样，读不出选了谁。 */
        var URGENCY = [
          { key: 'urgent', name: '紧急', weight: 5, main: '#E5484D', text: '#A3232A', soft: '#FDEDEE', dash: false },
          { key: 'mid', name: '中等', weight: 3, main: '#EF9F27', text: '#8A5A00', soft: '#FDF3E2', dash: false },
          { key: 'low', name: '不紧急', weight: 1, main: '#378ADD', text: '#1F5189', soft: '#EAF2FB', dash: false },
          { key: 'hold', name: '留置', weight: 0, main: '#8E91A0', text: '#5A5D6B', soft: '#F3F4F6', dash: true }
        ]
        /* 深色档逐值取自小程序 `utils/theme.js` 的 URGENCY_DARK / PROJECT_DARK。
         * 只列「会经 JS 走到屏幕上」的色点 / chip 三支，其余由 CSS 令牌承担。 */
        var URGENCY_DARK = {
          urgent: { main: '#EC7279', text: '#F28B8F', soft: '#382426' },
          mid: { main: '#D9A44E', text: '#EAB769', soft: '#342C20' },
          low: { main: '#6EA6DB', text: '#81B5E5', soft: '#212D39' },
          hold: { main: '#9B9DA7', text: '#B6B8C0', soft: '#292B31' }
        }
        var PROJECT_DARK = {
          qing: '#50BCAE', lv: '#78BC80', ganlan: '#A9BE65', zong: '#C59973',
          zi: '#B099DD', pinhong: '#D18EBA', dian: '#A09CDD', song: '#69AFBB'
        }
        var NONE_COLOR = '#8E91A0'
        var NONE_COLOR_DARK = '#9B9DA7'

        var COLORS = [
          { key: 'qing', name: '青', main: '#0E9E8E', soft: '#E5F4F2' },
          { key: 'lv', name: '绿', main: '#3E9B4F', soft: '#E9F4EA' },
          { key: 'ganlan', name: '橄榄', main: '#7E9B2C', soft: '#F2F5E2' },
          { key: 'zong', name: '棕', main: '#9A6B45', soft: '#F6EFE7' },
          { key: 'zi', name: '紫', main: '#8A63D2', soft: '#F1ECFA' },
          { key: 'pinhong', name: '品红', main: '#B85C9E', soft: '#F8ECF4' },
          { key: 'dian', name: '靛', main: '#6360C4', soft: '#EAEAF8' },
          { key: 'song', name: '松', main: '#1E7F8C', soft: '#E4F1F3' }
        ]

        var NODES = ['构思期', '建设期', '迭代期', '暂停期']
        var FORMATS = [
          { key: 'mindmap', label: '思维导图', desc: '根节点居中，分支向左右两侧分布' },
          { key: 'logic', label: '逻辑图', desc: '根在左，子节点向右逐层展开' },
          { key: 'org', label: '组织结构图', desc: '根在上，子节点向下分层展开' },
          { key: 'tree', label: '树形图', desc: '根在左上，子节点向右缩进分层' },
          { key: 'timeline', label: '时间轴', desc: '根在顶，一级节点沿竖轴左右交替' },
          { key: 'fishbone', label: '鱼骨图', desc: '鱼头在左，主脊向右，上下交替斜插' }
        ]
        /* 热力 5 档色卡 —— 两档各一套（与小程序 `utils/theme.js` 的 HEAT_LIGHT / HEAT_DARK 逐值同源）。
         * ⚠️ 深色那套**不是**"浅色调暗"：第 3、4 档互换（深色下最亮的是品牌黄 #FFD02F），
         *   第 0 档是 #2D2F32（深色卡面上的"最少"），照抄浅色 #F1F2F5 会让最不活跃的格子最亮 ——
         *   187 轮用户在小程序里报过同一个 bug。⇒ 视图层一律按主题现取，`legend` 只许当浅色用。 */
        var HEAT = {
          legend: ['#F1F2F5', '#FFF4C4', '#FFE07A', '#FFD02F', '#E5A400'],
          legendDark: ['#2D2F32', '#51442A', '#856822', '#B98C1A', '#FFD02F'],
          bands: ['0 条', '1–10 条', '11–25 条', '26–49 条', '50 条以上'],
          weeks: 30
        }
        /* 更新时间四档 —— **逐字对齐小程序 `utils/drawers.js` 的 `rangeRowsOf()`**
         * （全部 / 最近一周 / 最近一月 / 最近3个月）。2026-11-10 起筛选抽屉真的渲染这一组
         * （此前是个「有字段、没入口」的死常量），所以措辞必须与小程序同口径。 */
        var RANGES = [
          { key: 'all', name: '全部' }, { key: 'w1', name: '最近一周' },
          { key: 'm1', name: '最近一月' }, { key: 'm3', name: '最近3个月' }
        ]
        var RANGE_DAYS = { w1: 6, m1: 29, m3: 89 }

        /* Eight form modes, mirroring utils/forms.js buildRaw(). */
        var FORMS = {
          profile: { title: '编辑资料', submit: '保存', fields: ['name', 'avatar'] },
          project: { title: '新建项目', editTitle: '编辑项目', submit: '创建项目', editSubmit: '保存',
            fields: ['name', 'node', 'agentId', 'color', 'remark'] },
          mindmap: { title: '新建脑图', editTitle: '编辑脑图信息', submit: '创建脑图', editSubmit: '保存',
            fields: ['name', 'projectId', 'format'] },
          agent: { title: '新建 agent', editTitle: '编辑 agent', submit: '创建 agent', editSubmit: '保存',
            fields: ['name', 'monthlyQuota', 'resetDay'] },
          token: { title: '添加 API', editTitle: '编辑 API', submit: '添加', editSubmit: '保存',
            fields: ['vendor', 'apiKey'] },
          todo: { title: '记一条待办', editTitle: '编辑待办', submit: '保存待办', editSubmit: '保存',
            fields: ['text', 'urgency', 'projectId'] },
          export: { title: '待办导出', submit: '复制到剪贴板', fields: ['noImage'] },
          enhance: { title: '信息增强', submit: '复制到剪贴板', fields: ['noImage'] }
        }

        var FIELD_LABELS = {
          name: '名称', text: '待办内容 必填', urgency: '紧急程度 必填', projectId: '归属项目 必填',
          node: '项目节点', agentId: '关联 agent 可空', color: '项目色 可空', remark: '备注 选填',
          format: '格式 必填', monthlyQuota: '每月套餐额度', resetDay: '额度重置日 每月',
          vendor: '模型厂商 必填', apiKey: 'API Key 必填', noImage: '不含图片', avatar: '头像'
        }

        /* Shell-level dictionary. Business copy inside the workspace stays Chinese,
         * matching 小程序前端 (see v1 方案 §6.4). */
        var DICTIONARY = {
          zh: {
            title: 'Agent ToDo', panel: 'Agent ToDo', capture: '快速捕获', connected: '已连接',
            login: '请登录', demo: '演示数据', sync: '同步', syncing: '正在同步你的数据…', refresh: '刷新',
            close: '关闭', cancel: '取消', save: '保存', confirm: '确定', create: '新建',
            search: '搜索', filter: '筛选', reset: '清除全部筛选', loading: '正在加载…',
            empty: '这里暂时是空的', retry: '重试', copied: '已复制', disconnect: '断开连接',
            connectHint: '扫码打开小程序，在「我的」页复制登录验证码', connect: '登录',
            captureHint: '记一条闪念', insert: '待办', menu: '待办'
          },
          en: {
            title: 'Agent ToDo', panel: 'Agent ToDo', capture: 'Quick capture', connected: 'Connected',
            login: 'Sign in', demo: 'Demo data', sync: 'Sync', syncing: 'Syncing your data…', refresh: 'Refresh',
            close: 'Close', cancel: 'Cancel', save: 'Save', confirm: 'OK', create: 'New',
            search: 'Search', filter: 'Filter', reset: 'Clear filters', loading: 'Loading…',
            empty: 'Nothing here yet', retry: 'Retry', copied: 'Copied', disconnect: 'Disconnect',
            connectHint: 'Scan the code, copy the sign-in code from 我的, then paste it here', connect: 'Sign in',
            captureHint: 'Capture a thought', insert: 'ToDo', menu: 'ToDo'
          }
        }

        AT.const = {
          MODULES: MODULES, DETAIL_MODULES: DETAIL_MODULES, LIST_META: LIST_META,
          URGENCY: URGENCY, URGENCY_DARK: URGENCY_DARK, COLORS: COLORS,
          PROJECT_DARK: PROJECT_DARK, NONE_COLOR: NONE_COLOR, NONE_COLOR_DARK: NONE_COLOR_DARK,
          NODES: NODES, FORMATS: FORMATS, HEAT: HEAT, RANGES: RANGES, RANGE_DAYS: RANGE_DAYS,
          FORMS: FORMS, FIELD_LABELS: FIELD_LABELS, DICTIONARY: DICTIONARY,
          urgencyOf: function (key) { return URGENCY.filter(function (u) { return u.key === key })[0] || URGENCY[3] },
          colorOf: function (key) { return COLORS.filter(function (c) { return c.key === key })[0] || null },
          formatOf: function (key) { return FORMATS.filter(function (f) { return f.key === key })[0] || FORMATS[0] }
        }
      })(AT)

    })(AT, React, h);

    /* ===== 20-core.js ===== */
    ;(function (AT, React, h) {
      /* 20-core.js — business logic transcribed from 小程序前端/utils/store.js.
       * Pure functions only: no wx, no DOM, no network. Safe to require in Node
       * for the parity/behaviour checks (scripts/verify-package.cjs).
       */
      ;(function (AT) {
        'use strict'
        var C = AT.const

        function stamp() {
          var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n }
          return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
            p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
        }
        function dateOf(s) { return String(s || '').slice(0, 10) }
        function atMin(s) { return String(s || '').slice(0, 16) }
        function uid(p) {
          seq += 1
          return p + Date.now().toString(36) + seq
        }
        var seq = 0
        function clone(v) { return JSON.parse(JSON.stringify(v)) }
        function byId(list, id) { return (list || []).filter(function (x) { return x.id === id })[0] || null }

        /* ------------------------------------------------------------ snapshot --- */
        /* 与 mock.js buildHeatWeeks() 同源：本地时区 + 周一对齐的 30 周窗口。
         * 不能用 toISOString()：UTC+8 的 00:00–08:00 会让 date 比本地今天少一天，
         * 于是 activity 台账（本地 dateOf(stamp())）与格子错位且不报错。 */
        var WEEK_CN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        function emptyHeat() {
          var weeks = [], i, j, DAY = 86400000
          var now = new Date()
          var pad = function (n) { return (n < 10 ? '0' : '') + n }
          var ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
          var base = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
          var startMonday = base - ((now.getDay() + 6) % 7) * DAY - (C.HEAT.weeks - 1) * 7 * DAY
          for (i = 0; i < C.HEAT.weeks; i++) {
            var days = []
            for (j = 0; j < 7; j++) {
              var d = new Date(startMonday + (i * 7 + j) * DAY)
              var date = ymd(d)
              days.push({ weekNo: i + 1, dayIndex: j, date: date,
                mmdd: pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
                label: date + ' ' + WEEK_CN[j], created: 0, completed: 0, capsule: 0 })
            }
            weeks.push({ weekNo: i + 1, key: 'w' + (i + 1), days: days })
          }
          return { weeks: weeks, legend: C.HEAT.legend.slice(), bands: C.HEAT.bands.slice() }
        }

        function initialState() {
          var demo = demoState()
          return Object.assign(demo, {
            ui: {
              active: 'overview', projectId: '', todoId: '', mindmapId: '',
              drawer: null, form: null, capsule: null, toast: null,
              listFocus: 0, capsulePick: null, mmPick: null,
              /* v1.12：列表可向左侧收起；筛选改走右侧抽屉（与小程序筛选副弹窗同构）；
               * detailUrg = 项目详情里那排四档紧急度的筛选态，**带项目 id** 才会在
               * 切项目时自动归零（否则会留下"选了紧急、换项目后网格空着"的假空态）。 */
              listCollapsed: false, filterKind: null, detailOpen: false, detailUrg: null,
              paneWidth: 0,
              pFilter: { kw: '', status: 'active', node: 'all', agentId: '' },
              tFilter: { kw: '', status: 'open', projectId: '', range: 'all' },
              mFilter: { kw: '', projectId: '', format: 'all', range: 'all' },
              /* ★ 轮次 12：「未登录」是**默认态**，不是"降级态" —— `connected:false` 现在
               * 直接读作「请登录」，数据侧照旧铺一整套演示数据（见 demoState）。
               * `bootReady` 只做一件事：等宿主探测（/agent-todo/state）落地再决定要不要弹登录闸门，
               * 否则已登录用户进场会先闪一帧「请登录」弹窗。 */
              heatSelected: null, connected: false, connectOpen: false, connectError: '',
              bootReady: false,
              connectBusy: false, syncing: false, user: null, apiBase: 'https://todo.memorymap.cn/api/v1',
              captureOpen: false, captureSeed: '', captureCapsuleOnly: false,
              composerOpen: false, composerActions: null
            }
          })
        }

        function adaptSnapshot(data) {
          var d = data || {}
          var projects = (d.projects || []).map(function (p) { return {
            id: p.id, name: p.name || '', color: p.color || '', node: p.node || C.NODES[0],
            agentId: p.agentId || '', remark: p.remark || '', archivedAt: p.archivedAt || null,
            createdAt: p.createdAt || '', updatedAt: p.updatedAt || ''
          } })
          var todos = (d.todos || []).map(function (t) { return {
            id: t.id, projectId: t.projectId || '', mindmapId: t.mindmapId || null,
            text: t.text || '', urgency: t.urgency || 'hold',
            done: t.status === 'done' || t.status === 'completed' || t.done === true,
            createdAt: t.createdAt || '', completedAt: t.completedAt || null, updatedAt: t.updatedAt || '',
            images: (t.images || []).map(function (im) { return typeof im === 'string'
              ? { id: uid('i'), label: '', uri: im } : { id: im.id || uid('i'), label: im.label || '', uri: im.uri || '' } }),
            flashAt: t.flashAt || '', deletedAt: t.deletedAt || null, deleted: !!t.deletedAt
          } })
          var mindmaps = (d.mindmaps || []).map(function (m) { return {
            id: m.id, projectId: m.projectId || '', name: m.name || '',
            nodes: m.nodeCount != null ? m.nodeCount : (m.nodes || 0), depth: m.depth || 1,
            format: m.format || '', agentId: m.agentId || '', aiState: m.aiState || '',
            flashAt: m.flashAt || '', updatedAt: m.updatedAt || ''
          } })
          var capsules = (d.capsules || []).map(function (c) { return {
            id: c.id, text: c.text || '', createdAt: c.createdAt || '', source: c.source || 'text',
            imageUri: c.imageUri || null, todoId: c.todoId || null,
            deletedAt: c.deletedAt || null, consumedAt: c.consumedAt || null,
            deleted: !!c.deletedAt, consumed: !!c.consumedAt
          } })
          var activity = {}
          if (Array.isArray(d.activity)) d.activity.forEach(function (a) {
            activity[a.date || a.day] = { created: a.created || 0, completed: a.completed || 0, capsule: a.capsule || 0 }
          })
          else if (d.activity && typeof d.activity === 'object') activity = clone(d.activity)
          var me = d.me || null
          if (me && !me.name && me.nickname) me = Object.assign({}, me, { name: me.nickname })
          return {
            me: me, loaded: true, source: 'api',
            agents: d.agents || [], tokenKeys: d.tokenKeys || [],
            projects: projects, todos: todos, mindmaps: mindmaps, capsules: capsules,
            tree: {}, hist: {}, activity: activity, heat: emptyHeat()
          }
        }

        /* ----------------------------------------------------------- selectors --- */
        var aliveTodos = function (s) { return s.todos.filter(function (t) { return !t.deletedAt }) }
        var deletedTodos = function (s) { return s.todos.filter(function (t) { return !!t.deletedAt }) }
        var isGoneCapsule = function (c) { return !!(c.deleted || c.consumed) }
        function capsules(s) {
          return s.capsules.filter(function (c) { return !isGoneCapsule(c) && !c.todoId })
            .sort(function (a, b) { return String(a.createdAt).localeCompare(String(b.createdAt)) })
        }
        function deletedCapsules(s) { return s.capsules.filter(function (c) { return !!c.deleted }) }
        function capsulesOfTodo(s, tid) { return s.capsules.filter(function (c) { return c.todoId === tid && !c.deleted }) }
        var activeProjects = function (s) { return s.projects.filter(function (p) { return !p.archivedAt }) }
        var archivedProjects = function (s) { return s.projects.filter(function (p) { return !!p.archivedAt }) }
        function todosOfProject(s, pid) { return aliveTodos(s).filter(function (t) { return t.projectId === pid }) }
        function mindmapsOfProject(s, pid) { return s.mindmaps.filter(function (m) { return m.projectId === pid }) }
        function projectSummary(s, pid) {
          var all = todosOfProject(s, pid)
          return { open: all.filter(function (t) { return !t.done }).length,
            done: all.filter(function (t) { return t.done }).length,
            mindmaps: mindmapsOfProject(s, pid).length }
        }
        function scoreOf(s, pid) {
          return todosOfProject(s, pid).filter(function (t) { return !t.done })
            .reduce(function (n, t) { return n + C.urgencyOf(t.urgency).weight }, 0)
        }
        function sortProjects(s) {
          return activeProjects(s).slice().sort(function (a, b) {
            var d = scoreOf(s, b.id) - scoreOf(s, a.id)
            return d || String(b.updatedAt).localeCompare(String(a.updatedAt))
          })
        }
        function sortTodos(s, list) {
          return list.slice().sort(function (a, b) {
            if (a.done !== b.done) return a.done ? 1 : -1
            var d = C.urgencyOf(b.urgency).weight - C.urgencyOf(a.urgency).weight
            return d || String(b.createdAt).localeCompare(String(a.createdAt))
          })
        }
        function sortByUpdated(list) {
          return list.slice().sort(function (a, b) { return String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)) })
        }

        /* ------------------------------------------------- 概览装配（FR-5） ---
         * 与 小程序前端/utils/store.js 的 `statOfProject()` / `overviewProjectCards()` /
         * `agentCardViews()` / `ringOf()` **同一口径**：概览页只负责画，数都在这里算。
         * ⚠️ 项目卡与 agent 卡的形状是"给视图的"，页面不许再自己 filter 一遍 ——
         *   两处各算一次是本工程反复踩过的坑（"同一张卡两页数不一样"）。 */

        /* 某项目的四档条数 —— **只算未完成**（★ 160 轮：已删除的也不计）。
         * 卡片要回答的是"这个项目还欠着什么"，已完成的不占条数（FR-5.2 的四档＝欠量）。 */
        function statOfProject(s, pid) {
          var st = { urgent: 0, mid: 0, low: 0, hold: 0 }
          todosOfProject(s, pid).forEach(function (t) {
            if (t.done) return
            if (st[t.urgency] !== undefined) st[t.urgency] += 1
          })
          return st
        }
        function statScore(st) {
          return st.urgent * 5 + st.mid * 3 + st.low * 1
        }
        function projectCardView(s, p) {
          var c = p.color ? C.colorOf(p.color) : null
          var st = statOfProject(s, p.id)
          var ag = p.agentId ? byId(s.agents, p.agentId) : null
          return {
            id: p.id, name: p.name, node: p.node,
            color: c ? c.main : C.NONE_COLOR,
            agentName: ag ? ag.name : '',
            /* 四档条的档名与键名只有一份真源（`C.URGENCY`），模板里不许手抄四个中文名。 */
            statChips: C.URGENCY.map(function (u) { return { key: u.key, name: u.name, n: st[u.key] || 0 } }),
            total: st.urgent + st.mid + st.low + st.hold,
            score: statScore(st),
            mindmaps: mindmapsOfProject(s, p.id).length
          }
        }
        /* 概览「项目待办统计」：排除已归档 → **只取有颜色的项目**（色点是项目身份唯一的颜色载体）
         * → 按综合紧急度降序 → 最多 `PROJECT_SLOTS` ＝ 色槽位数（8）张。 */
        function overviewProjectCards(s) {
          return sortProjects(s).filter(function (p) { return !!p.color })
            .slice(0, C.COLORS.length).map(function (p) { return projectCardView(s, p) })
        }

        /* ---------------- 额度重置日（agent.quotaResetAt ＝「每月几号」） ----------------
         * 133 轮起只记「日」（`'01'`–`'31'`）；这三支与小程序 store.js 逐行同源。 */
        var MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        function daysInMonth(mon) {
          var m = Math.round(Number(mon))
          return (m >= 1 && m <= 12) ? MONTH_DAYS[m - 1] : 31
        }
        /* 必须先夹到当月最后一天再交给 Date —— `new Date(2026, 1, 31)` 会静默滚到 3 月 3 日，
         * "每月 31 日"于是被算成"还有一个月"（不报错、只是数错）。 */
        function resetAt(year, monIdx, day) {
          var y = year + Math.floor(monIdx / 12)
          var m = monIdx - Math.floor(monIdx / 12) * 12
          var max = daysInMonth(m + 1)
          return new Date(y, m, day > max ? max : day).getTime()
        }
        /* `'15'` / `'10-15'` / `'2026/10/15 13:54:03'` 三种历史写法都抠出末尾那一节「日」。
         * ⚠️ 不能"取最后两位"：完整时间戳的末两位是秒。 */
        function resetDayOf(v) {
          var str = String(v == null ? '' : v).trim()
          if (!str) return null
          var m = /^(?:\d{4}[-\/])?(?:\d{1,2}[-\/])?(\d{1,2})(?:\s|$)/.exec(str)
          if (!m) return null
          var d = Math.round(Number(m[1]))
          if (!d || d < 1) return null
          return d > 31 ? 31 : d
        }
        function daysUntilReset(v, today) {
          var day = resetDayOf(v)
          if (day === null) return null
          var base = new Date((today || dateOf(stamp())) + 'T00:00:00')
          var t = resetAt(base.getFullYear(), base.getMonth(), day)
          if (t < base.getTime()) t = resetAt(base.getFullYear(), base.getMonth() + 1, day)
          return Math.round((t - base.getTime()) / 86400000)
        }
        /* 「距离重置」圆环 —— 3 个字段给视图：`deg` 进度角 / `num` 圆心大字 / `unit` 单位。
         * 周期按自然月：prev ＝ 本月那一日（已过则上月），next ＝ 本月那一日（已过则下月）。
         * ⚠️ 两边**刻意不对称**（prev 用严格大于、next 含等号）：今天正好是重置日 ⇒ prev ＝ 今天
         *   ⇒ 进度 0、圆心「今天」，读作"刚重置"；写成对称会变成"周期刚走完"（进度满），正好反了。 */
        function ringOf(a, today) {
          var day = resetDayOf(a && a.quotaResetAt)
          if (day === null) return { deg: 0, num: '未填', unit: '', muted: true }
          var base = new Date((today || dateOf(stamp())) + 'T00:00:00')
          var prev = resetAt(base.getFullYear(), base.getMonth(), day)
          if (prev > base.getTime()) prev = resetAt(base.getFullYear(), base.getMonth() - 1, day)
          var next = resetAt(base.getFullYear(), base.getMonth(), day)
          if (next <= base.getTime()) next = resetAt(base.getFullYear(), base.getMonth() + 1, day)
          var span = next - prev
          var deg = span > 0 ? Math.max(0, Math.min(360, Math.round(((base.getTime() - prev) / span) * 360))) : 0
          var d = daysUntilReset(a && a.quotaResetAt, today)
          if (d === null) return { deg: deg, num: '未填', unit: '', muted: true }
          if (d <= 0) return { deg: deg, num: '今天', unit: '', muted: false }
          return { deg: deg, num: String(d), unit: '天', muted: false }
        }
        /* agent 卡 —— 「我的」与概览共用这一份形状。
         * ★ 157 轮：卡面已撤下「当前剩余 / 更新于」（没有取余额的 API，手填的数只会过期误导）
         *   ⇒ `quotaLeft` / `updatedAt` / `stale` 不再下发；「每月套餐」是静态档位，保留。 */
        function agentCardViews(s, today) {
          return (s.agents || []).map(function (a) {
            var ps = s.projects.filter(function (p) { return p.agentId === a.id })
            var ring = ringOf(a, today)
            return {
              id: a.id, name: a.name,
              monthlyQuota: a.monthlyQuota || '未填',
              projectCount: ps.length,
              resetNum: ring.num, resetUnit: ring.unit, resetMuted: ring.muted, ringDeg: ring.deg
            }
          })
        }
        function inRange(value, range) {
          if (!range || range === 'all') return true
          var days = C.RANGE_DAYS[range]
          if (days == null) return true
          return (Date.now() - new Date(String(value).replace(/-/g, '/')).getTime()) <= (days + 1) * 86400000
        }
        function filterTodos(s, scope) {
          var f = Object.assign({}, s.ui.tFilter, scope || {})
          var kw = String(f.kw || '').toLowerCase()
          /* ★ 与 小程序 store.filterTodos 同一套三档语义：`open` / `done` 都排除已删除，
           * `deleted` 档**只要**已删除的。它是「还原」的唯一入口 —— 删完默认列表里就看不见了，
           * 而「我的」页的最近删除已按用户口径整块拿掉（小程序也没有），所以这一档必须在。
           * ⚠️ 别把它写成 `aliveTodos(s)` 再在下面过滤：那样 deleted 档恒为空。 */
          var pool = f.status === 'deleted' ? deletedTodos(s) : aliveTodos(s)
          return sortByUpdated(pool.filter(function (t) {
            if (f.status === 'done' && !t.done) return false
            if (f.status === 'open' && t.done) return false
            if (f.projectId && t.projectId !== f.projectId) return false
            if (!inRange(t.updatedAt || t.createdAt, f.range)) return false
            return !kw || String(t.text).toLowerCase().indexOf(kw) >= 0
          }))
        }
        function filterProjects(s) {
          var f = s.ui.pFilter, kw = String(f.kw || '').toLowerCase()
          return sortProjects(s).filter(function (p) {
            if (f.status === 'active' && p.archivedAt) return false
            if (f.status === 'archived' && !p.archivedAt) return false
            if (f.node !== 'all' && p.node !== f.node) return false
            if (f.agentId && p.agentId !== f.agentId) return false
            return !kw || String(p.name).toLowerCase().indexOf(kw) >= 0
          }).concat(f.status === 'all' || f.status === 'archived' ? archivedProjects(s) : [])
        }
        function filterMindmaps(s) {
          var f = s.ui.mFilter, kw = String(f.kw || '').toLowerCase()
          return sortByUpdated(s.mindmaps.filter(function (m) {
            if (f.projectId && m.projectId !== f.projectId) return false
            if (f.format !== 'all' && m.format !== f.format) return false
            if (!inRange(m.updatedAt, f.range)) return false
            return !kw || String(m.name).toLowerCase().indexOf(kw) >= 0
          }))
        }
        function mindmapGateOf(m) {
          if (!m) return 'missing'
          if (m.aiState === 'pending') return 'pending'
          if (m.aiState === 'failed') return 'failed'
          if (!m.projectId || !m.format) return 'incomplete'
          return ''
        }
        var GATE_TIP = {
          pending: '这张脑图还在生成中，稍后再选', failed: '这张脑图生成失败，重试生成后再选',
          incomplete: '这张脑图还没完善（归属项目 / 格式），完善后再选', missing: '这张脑图暂时不能选'
        }
        function cardView(s, x) { return x }

        /* --------------------------------------------------------------- rules --- */
        /* Every rule returns a NEW state (optimistic update). The bridge sends the
         * matching REST call and restores the previous state on failure, mirroring
         * store.js mark()/queue()/restore(). */
        function patchOne(list, id, patch) {
          return list.map(function (x) { return x.id === id ? Object.assign({}, x, patch) : x })
        }
        var rules = {
          addProject: function (s, p) {
            var x = { id: uid('p'), name: p.name, color: p.color || '', node: p.node || C.NODES[0],
              agentId: p.agentId || '', remark: p.remark || '', archivedAt: null,
              createdAt: stamp(), updatedAt: stamp() }
            return Object.assign({}, s, { projects: s.projects.concat([x]) })
          },
          updateProject: function (s, id, patch) {
            var next = Object.assign({}, s, { projects: patchOne(s.projects, id, Object.assign({ updatedAt: stamp() }, patch)) })
            if (patch.agentId !== undefined) {
              next.mindmaps = s.mindmaps.map(function (m) { return m.projectId === id
                ? Object.assign({}, m, { agentId: patch.agentId }) : m })
            }
            return next
          },
          archiveProject: function (s, id, on) {
            return Object.assign({}, s, { projects: patchOne(s.projects, id, { archivedAt: on ? stamp() : null }) })
          },
          addTodo: function (s, t) {
            var x = { id: uid('d'), projectId: t.projectId || '', mindmapId: t.mindmapId || null,
              text: t.text || '', urgency: t.urgency || 'mid', done: false,
              createdAt: stamp(), completedAt: null, updatedAt: stamp(), images: t.images || [],
              flashAt: '', deletedAt: null, deleted: false }
            var a = clone(s.activity), k = dateOf(stamp())
            a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
            a[k].created += 1
            return Object.assign({}, s, { todos: s.todos.concat([x]), activity: a })
          },
          updateTodo: function (s, id, patch) {
            var next = Object.assign({}, patch, { updatedAt: stamp() })
            var t = byId(s.todos, id)
            if (patch.projectId && t && t.mindmapId) {
              var m = byId(s.mindmaps, t.mindmapId)
              if (m && m.projectId !== patch.projectId) next.mindmapId = null
            }
            return Object.assign({}, s, { todos: patchOne(s.todos, id, next) })
          },
          toggleTodo: function (s, id) {
            var t = byId(s.todos, id)
            if (!t || t.deletedAt) return s
            var done = !t.done
            var a = clone(s.activity), k = dateOf(stamp())
            a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
            if (done) a[k].completed += 1
            return Object.assign({}, s, {
              todos: patchOne(s.todos, id, { done: done, completedAt: done ? stamp() : null, updatedAt: stamp() }),
              activity: a
            })
          },
          removeTodo: function (s, id) {
            return Object.assign({}, s, { todos: patchOne(s.todos, id,
              { deletedAt: stamp(), deleted: true, updatedAt: stamp() }) })
          },
          restoreTodo: function (s, id) {
            return Object.assign({}, s, { todos: patchOne(s.todos, id,
              { deletedAt: null, deleted: false, done: false, completedAt: null, updatedAt: stamp() }) })
          },
          addCapsule: function (s, text, opts) {
            var o = opts || {}
            var x = { id: uid('c'), text: text || '', createdAt: stamp(), source: o.source || 'text',
              imageUri: o.imageUri || null, todoId: null, deletedAt: null, consumedAt: null,
              deleted: false, consumed: false }
            var a = clone(s.activity), k = dateOf(stamp())
            a[k] = Object.assign({ created: 0, completed: 0, capsule: 0 }, a[k] || {})
            a[k].capsule += 1
            return Object.assign({}, s, { capsules: s.capsules.concat([x]), activity: a })
          },
          updateCapsule: function (s, id, patch) {
            return Object.assign({}, s, { capsules: patchOne(s.capsules, id, patch) })
          },
          removeCapsules: function (s, ids) {
            var set = ids || []
            return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
              return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { deleted: true, deletedAt: stamp() }) : c }) })
          },
          restoreCapsules: function (s, ids) {
            var set = ids || []
            return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
              return set.indexOf(c.id) >= 0 && c.deleted ? Object.assign({}, c, { deleted: false, deletedAt: null }) : c }) })
          },
          consumeCapsules: function (s, ids) {
            var set = ids || []
            return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
              return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { consumed: true, consumedAt: stamp() }) : c }) })
          },
          linkCapsules: function (s, tid, ids) {
            var set = ids || []
            return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
              return set.indexOf(c.id) >= 0 ? Object.assign({}, c, { todoId: tid, consumed: true, consumedAt: c.consumedAt || stamp() }) : c }) })
          },
          unlinkCapsules: function (s, tid, ids) {
            var set = ids || []
            return Object.assign({}, s, { capsules: s.capsules.map(function (c) {
              return set.indexOf(c.id) >= 0 && c.todoId === tid
                ? Object.assign({}, c, { todoId: null, consumed: false, consumedAt: null, createdAt: stamp() }) : c }) })
          },
          addMindmap: function (s, m) {
            var x = { id: uid('m'), projectId: m.projectId, name: m.name, nodes: 1, depth: 1,
              format: m.format || '', agentId: m.agentId || '', aiState: '', flashAt: '', updatedAt: stamp() }
            var tree = {}, rootId = uid('n')
            tree[rootId] = { id: rootId, text: m.name, remark: '', kind: 'root', children: [] }
            var t = clone(s.tree); t[x.id] = tree[rootId]
            return Object.assign({}, s, { mindmaps: s.mindmaps.concat([x]), tree: t })
          },
          removeMindmap: function (s, id) {
            var t = clone(s.tree); delete t[id]
            return Object.assign({}, s, {
              mindmaps: s.mindmaps.filter(function (m) { return m.id !== id }), tree: t,
              todos: s.todos.map(function (x) { return x.mindmapId === id ? Object.assign({}, x, { mindmapId: null }) : x })
            })
          },
          replaceEntity: function (s, kind, id, patch) {
            var key = { project: 'projects', todo: 'todos', mindmap: 'mindmaps', capsule: 'capsules',
              agent: 'agents', token: 'tokenKeys' }[kind]
            if (!key) return s
            return Object.assign({}, s, (function () { var o = {}; o[key] = patchOne(s[key], id, patch); return o })())
          }
        }

        /* ---------------------------------------------------------- demo data --- */
        /* 演示用的热力图基线 —— 与小程序 `utils/mock.js` 的 HEATMAP 同一用意：
         * 骨架是"日常活跃度"的造数，真接口下 `adaptSnapshot()` 换成零基线、由台账叠加真实计数。
         * ⚠️ 只给 demoState 用；`emptyHeat()` 仍是零骨架（真实数据那条路的起点）。
         * 取值刻意铺满 5 档（0 / 1 / 2 / 3 / 4），否则概览的色阶与"选中格括标分色"看不出效果。 */
        function demoHeat() {
          var heat = emptyHeat()
          heat.weeks.forEach(function (w, wi) {
            w.days.forEach(function (d, di) {
              var seed = (wi * 7 + di) % 13
              var n = seed === 0 ? 0 : seed < 4 ? 3 : seed < 7 ? 9 : seed < 10 ? 20 : seed < 12 ? 38 : 62
              d.created = Math.round(n * 0.5)
              d.completed = Math.round(n * 0.3)
              d.capsule = n - d.created - d.completed
            })
          })
          return heat
        }

        function demoState() {
          var now = stamp(), p1 = 'p-demo-1', p2 = 'p-demo-2', m1 = 'm-demo-1'
          var projects = [
            { id: p1, name: '客户交付', color: 'qing', node: '建设期', agentId: 'a-demo-1', remark: '三条业务线并行推进', archivedAt: null, createdAt: now, updatedAt: now },
            { id: p2, name: '个人工位', color: 'zi', node: '构思期', agentId: '', remark: '', archivedAt: null, createdAt: now, updatedAt: now }
          ]
          var todos = [
            { id: 'd-demo-1', projectId: p1, mindmapId: m1, text: '把 Agent-ToDo 的 Capture 做成全局快捷键', urgency: 'urgent', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
            { id: 'd-demo-2', projectId: p1, mindmapId: null, text: '梳理三端信息架构，确认项目节点四期', urgency: 'mid', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
            { id: 'd-demo-3', projectId: p1, mindmapId: null, text: '对齐待办导出 Markdown 的章节顺序', urgency: 'low', done: false, createdAt: now, completedAt: null, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false },
            { id: 'd-demo-4', projectId: p2, mindmapId: null, text: '确认项目八色与紧急四档的迁移值', urgency: 'hold', done: true, createdAt: now, completedAt: now, updatedAt: now, images: [], flashAt: '', deletedAt: null, deleted: false }
          ]
          var root = { id: 'n-root', text: '客户交付', remark: '', kind: 'root', children: [
            { id: 'n-1', text: '现场部署', remark: '', kind: 'branch', children: [
              { id: 'n-1-1', text: '环境核查', kind: 'leaf', children: [] },
              { id: 'n-1-2', text: '配对联调', kind: 'leaf', children: [] } ] },
            { id: 'n-2', text: '交付验收', remark: '', kind: 'branch', children: [] } ] }
          var tree = {}; tree[m1] = root
          return {
            me: { name: '我的工位', nickname: '我的工位', avatar: '', avatarUri: '' },
            loaded: false, source: 'demo',
            agents: [{ id: 'a-demo-1', name: '主力 Agent', quotaLeft: 8200, monthlyQuota: 10000, quotaResetAt: '08', updatedAt: now }],
            tokenKeys: [{ id: 'k-demo-1', vendor: 'deepseek', balance: 12800, keyMask: 'sk-••••3f2a', hasKey: true, balanceAt: now, lastError: '', updatedAt: now }],
            projects: projects, todos: todos,
            mindmaps: [{ id: m1, projectId: p1, name: '交付流程', nodes: 5, depth: 3, format: 'logic', agentId: 'a-demo-1', aiState: '', flashAt: '', updatedAt: now }],
            capsules: [
              { id: 'c-demo-1', text: '入口应该比「打开应用」更近：在会话里按 Alt+Space 就能记。', createdAt: now, source: 'text', imageUri: null, todoId: null, deletedAt: null, consumedAt: null, deleted: false, consumed: false },
              { id: 'c-demo-2', text: '脑图贴着任务；任务是主语，脑图是谓语。', createdAt: now, source: 'voice', imageUri: null, todoId: null, deletedAt: null, consumedAt: null, deleted: false, consumed: false },
              { id: 'c-demo-3', text: '导出要能直接复制，而不是复制后自己找地方粘贴。', createdAt: now, source: 'text', imageUri: null, todoId: 'd-demo-1', deletedAt: null, consumedAt: now, deleted: false, consumed: true }
            ],
            tree: tree, hist: {}, activity: {}, heat: demoHeat()
          }
        }

        AT.core = {
          stamp: stamp, dateOf: dateOf, atMin: atMin, uid: uid, clone: clone, byId: byId,
          emptyHeat: emptyHeat, initialState: initialState, adaptSnapshot: adaptSnapshot,
          demoState: demoState,
          aliveTodos: aliveTodos, deletedTodos: deletedTodos, capsules: capsules,
          deletedCapsules: deletedCapsules, capsulesOfTodo: capsulesOfTodo,
          activeProjects: activeProjects, archivedProjects: archivedProjects,
          todosOfProject: todosOfProject, mindmapsOfProject: mindmapsOfProject,
          projectSummary: projectSummary, scoreOf: scoreOf, sortProjects: sortProjects,
          sortTodos: sortTodos, sortByUpdated: sortByUpdated,
          statOfProject: statOfProject, projectCardView: projectCardView,
          overviewProjectCards: overviewProjectCards, agentCardViews: agentCardViews,
          resetDayOf: resetDayOf, daysUntilReset: daysUntilReset, ringOf: ringOf,
          filterTodos: filterTodos, filterProjects: filterProjects, filterMindmaps: filterMindmaps,
          mindmapGateOf: mindmapGateOf, GATE_TIP: GATE_TIP, cardView: cardView,
          rules: rules
        }
      })(AT)

    })(AT, React, h);

    /* ===== 25-core-text.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    /* ===== 30-bridge.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    /* ===== 40-ui.js ===== */
    ;(function (AT, React, h) {
      /* 40-ui.js — DSH-native primitives with the mini-program's design language.
       *
       * 令牌逐值照抄 小程序前端/app.wxss 的 page{} 与 .theme-dark{} 两张表；
       * 组件尺寸/圆角/字号/状态照抄 .tb-btn / .sec-btn / .card / .sd-input /
       * .dw-card / .tc / .seg / .pill / .nav-rail。样式仍渲染在组件树里的 <style>，
       * 不写 document.head，也不用 position:fixed 逃出面板。
       *
       * 旧版 --at-border / --at-text* 等名字保留为别名，避免逐处改名时漏改。
       */
      ;(function (AT, React, h) {
        'use strict'
        var ICONS = AT.icons
        var Icon = ICONS.Icon

        /* ---------------------------------------------------------- design tokens --- */
        var LIGHT = [
          '--at-primary:#1C1C1E;--at-slate:#555A6A;--at-slate-strong:#3C3C43;',
          '--at-stone:#8E91A0;--at-muted:#A5A8B5;--at-text2:#686C7A;',
          '--at-hairline:#E0E2E8;--at-hairline-strong:#C7CAD5;--at-hairline-soft:#EEF0F4;',
          '--at-surface:#F7F8FA;--at-chip:#F1F2F5;--at-card-dim:#FAFAFB;',
          /* `--at-sunken` ＝ 比 surface 再深一档的「面」，v1.12 起专供三栏里的**列表列**。
           * 为什么要它：chip(#F1F2F5) 与 surface(#F7F8FA) 只差 Δ6，两块大色块左右相邻时
           * 肉眼等于同色（2026-11-07 实测，用户第 1 条诉求没被 chip/surface 解决）。
           * ★ 2026-11 用户拍板换成中间色 #EDF0F4：原 #E7E9EF 被反馈「列表偏深」。
           *   新值对 surface 的单通道差 10/8/6（最大 Δ10）、对 card 最大 Δ18；深色档不动。
           *   它仍比 chip(#F1F2F5) 深一档，但两者差值已明显收窄 ⇒ 列表列**更不许**退回
           *   --at-chip，且真 GUI 复验要重点看列表列与卡面 / 筛选 chip 的区分。
           * ⚠️ 深色档是**提亮**而不是压暗：surface 已经是 #18191B，再往下就贴黑，
           *   反而分不出（Material elevation 同做法：深色主题里"浮起来的面"更亮）。 */
          '--at-sunken:#EDF0F4;',
          '--at-card:#FFFFFF;--at-elevated:#FFFFFF;--at-head-bg:#F7F8FA;--at-head-line:#E0E2E8;',
          '--at-solid:#1C1C1E;--at-on-solid:#FFFFFF;--at-on-accent:#1C1C1E;',
          '--at-qr:#FFFFFF;--at-frost:rgba(255,255,255,.96);',
          '--at-yellow:#FFD02F;--at-yellow-press:#FCB900;--at-yellow-soft:#FFF8DC;',
          '--at-yellow-warm:#FFE9A8;--at-yellow-line:#EFE0A6;--at-yellow-deep:#E5A400;',
          /* 「距离重置」圆环三支 —— 逐值照抄 小程序前端/app.wxss 的 `--ring-a/-b/-track`
           * （浅色：品牌黄 → 热力第 5 档，轨道 ＝ `--hairline`）。
           * ⚠️ 不许在这里改成别的色：159 轮用户在"我的"页定稿的就是暖黄阶，
           *   概览的 agent 卡与「我的」**同一套值**（见 mod-mine.wxss 那段）。 */
          '--at-ring-a:#FFD02F;--at-ring-b:#E5A400;--at-ring-track:#E0E2E8;',
          /* 概览明细条「创建」那一格的蓝（小程序 `--blue` #4262FF）。
           * ⚠️ 必须登记在**这里**（`themeCss` 每次都会注入 `.at-root/.at-gl`），不能只写在
           *    `08-style.js` 的补充令牌里：那串只随 `AT.style.base(dark)` 注入，而主面板走的是
           *   `U.themeCss(dark) + U.STYLE`（50-shell.js），于是 `--atx-blue` 在主面板里是**未定义**的
           *   —— 2026-11 实测 `.at-ov-hd-created` 计算色等于主墨 rgb(41,41,41)，"创建变蓝"静默失效。
           * ⚠️ 也不能改用 `--at-blue`：85-desktop 的宿主映射把它收敛成了主墨（按钮 / 焦点在用）。 */
          '--atx-blue:#4262FF;',
          '--at-blue:#4262FF;--at-fresh:#6C5DD3;--at-fresh-bg:#EFEDFB;',
          '--at-success:#2E9E64;--at-success-t:#1B7A4B;--at-success-bg:#E6F7EF;',
          '--at-danger:#C63B2E;--at-on-danger:#FFFFFF;--at-field-line:#E0E2E8;',
          '--at-mask:rgba(28,28,30,.35);',
          '--at-sh-card:0 1px 2px rgba(28,28,30,.06);',
          '--at-sh-pop:0 12px 32px -4px rgba(5,0,56,.12);',
          '--at-sh-drawer:0 12px 32px rgba(28,28,30,.18);',
          '--at-sh-drawer-l2:-10px 20px 48px rgba(28,28,30,.28);',
          '--at-sh-float:0 6px 20px rgba(28,28,30,.10);',
          /* 骨架令牌：深色块不覆盖 ⇒ 恒值 */
          '--at-rail-w:72px;--at-gap-top:20px;--at-gap-sec:8px;--at-gap-base:12px;',
          '--at-head-h:64px;--at-font-num:Inter,"Noto Sans SC",sans-serif;',
          '--at-font:var(--dsw-alias-font-body,"Noto Sans SC","PingFang SC","Helvetica Neue",Helvetica,Arial,sans-serif);',
          /* 旧名兼容别名 */
          '--at-bg:var(--at-surface);--at-surface2:var(--at-chip);--at-overlay:var(--at-elevated);',
          '--at-border:var(--at-hairline);--at-border1:var(--at-hairline-soft);',
          '--at-text:var(--at-primary);--at-text3:var(--at-muted);',
          '--at-hover:var(--at-chip);--at-brand:var(--at-blue);--at-accent:var(--at-yellow);'
        ].join('')
        var DARK = [
          '--at-primary:#EEEDEA;--at-slate:#B8B7B2;--at-slate-strong:#D8D7D2;',
          '--at-stone:#A7A8A3;--at-muted:#969792;--at-text2:#B0B1AC;',
          '--at-hairline:#33363A;--at-hairline-strong:#4A4D51;--at-hairline-soft:#2A2C2F;',
          '--at-surface:#18191B;--at-chip:#2D2F32;--at-card-dim:#1C1D1F;',
          /* 深色档的 `--at-sunken` **向上提亮**（理由见 LIGHT 表那段）：#18191B 再压就贴黑。
           * 值取 #2D2F32，与 surface 相差 Δ21，列表列与详情列在深色里本来就分得开。 */
          '--at-sunken:#2D2F32;',
          '--at-card:#202123;--at-elevated:#292B2E;--at-head-bg:#232427;--at-head-line:#3A3D41;',
          '--at-solid:#36383B;--at-on-solid:#EEEDEA;--at-qr:#FFFFFF;',
          '--at-frost:rgba(41,43,46,.96);--at-yellow-soft:#2E2917;',
          '--at-yellow-warm:#3A301A;--at-yellow-line:#4A4028;--at-yellow-deep:#FFD02F;',
          /* 深色圆环：起点换成热力第 4 档（#B98C1A）、终点是品牌黄，轨道抬到 #3C3E41
           * —— 与 app.wxss 的 `.theme-dark` 同值（那里只有这一组，别自己推）。 */
          '--at-ring-a:#B98C1A;--at-ring-b:#FFD02F;--at-ring-track:#3C3E41;',
          /* 深色那支蓝与小程序 `utils/theme.js` 的深色 `--blue`(#8CA7FF) 同值。 */
          '--atx-blue:#8CA7FF;',
          '--at-blue:#8CA7FF;--at-fresh:#9B8CF0;--at-fresh-bg:#26243A;',
          '--at-success:#60B886;--at-success-t:#79C69B;--at-success-bg:#203128;',
          '--at-danger:#F08070;--at-on-danger:#382426;--at-field-line:#4A4D51;',
          '--at-mask:rgba(0,0,0,.56);',
          '--at-sh-card:0 1px 2px rgba(0,0,0,.32);',
          '--at-sh-pop:0 12px 32px -4px rgba(0,0,0,.42);',
          '--at-sh-drawer:0 12px 32px rgba(0,0,0,.50);',
          '--at-sh-drawer-l2:-10px 20px 48px rgba(0,0,0,.60);',
          '--at-sh-float:0 6px 20px rgba(0,0,0,.45);'
        ].join('')
        /* 两个根（主面板 at-root、宿主 overlay at-gl）共用一套令牌。 */
        var CSS_LIGHT = '.at-root,.at-gl{' + LIGHT + '}'
        var CSS_DARK = '.at-root,.at-gl{' + DARK + '}'
        function themeCss(dark) { return CSS_LIGHT + (dark ? CSS_DARK : '') }
        function themeCssFor(selector, dark) {
          return selector + '{' + LIGHT + '}' + (dark ? selector + '{' + DARK + '}' : '')
        }

        /* ------------------------------------------------------------ primitives --- */
        function Btn(props) {
          return h('button', {
            type: 'button',
            className: 'at-btn' + (props.variant ? ' at-btn-' + props.variant : '') +
              (props.size === 'lg' ? ' at-btn-lg' : '') +
              (props.active ? ' is-active' : '') + (props.className ? ' ' + props.className : ''),
            disabled: !!props.disabled, title: props.title || '', onClick: props.onClick,
            'aria-label': props.label || props.title || ''
          }, props.children)
        }
        function IconBtn(props) {
          return Btn({ className: 'at-icon-btn' + (props.danger ? ' at-icon-btn-danger' : ''),
            title: props.title || props.label, label: props.label,
            active: props.active, disabled: props.disabled, onClick: props.onClick,
            children: h(Icon, { name: props.name, size: props.size || 16,
              tone: props.tone || '', opacity: props.opacity == null ? 1 : props.opacity }) })
        }
        function Chip(props) {
          return h('span', { className: 'at-chip' + (props.tone ? ' at-chip-' + props.tone : ''),
            style: props.color ? { borderColor: props.color, color: props.color } : null },
            props.dot ? h('span', { className: 'at-dot', style: { background: props.dot } }) : null, props.children)
        }
        function Card(props) {
          return h('section', { className: 'at-card' + (props.className ? ' ' + props.className : ''),
            onClick: props.onClick, role: props.onClick ? 'button' : null, tabIndex: props.onClick ? 0 : null,
            onKeyDown: props.onClick ? function (e) {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); props.onClick(e) }
            } : null },
            props.title ? h('div', { className: 'at-card-head' },
              h('span', { className: 'at-card-title' }, props.title), props.extra || null) : null,
            props.children)
        }
        /* 区块头 ＝ 小程序 `.sec-head`：左侧「图标 16 ＋ 标题 16/600」，右侧可放说明。
         * ⚠️ 图标**不加 opacity**：小程序的 `<icon size="16" />` 默认 `opacity:1`（组件 default 值），
         *   压到 .6 只会让这三颗比小程序淡一档。
         * `icon` 不传就不渲染那枚图（旧调用点行为不变）；概览三块是当前唯一调用点。
         * ⚠️ 对齐方式必须是 flex-start ＋ 给右端说明 `margin-left:auto` —— 用
         *   `justify-content:space-between` 时"图标"和"标题"会各奔一头（实拍过）。 */
        function Section(props) {
          return h('div', { className: 'at-section' },
            h('div', { className: 'at-section-head' },
              props.icon ? h(Icon, { name: props.icon, size: 16 }) : null,
              h('span', null, props.title),
              props.extra ? h('span', { style: { marginLeft: 'auto' } }, props.extra) : null),
            props.children)
        }
        function Field(props) {
          return h('label', { className: 'at-field' },
            h('span', { className: 'at-field-label' }, props.label, props.required ? h('em', null, ' 必填') : null),
            props.children, props.hint ? h('span', { className: 'at-field-hint' }, props.hint) : null)
        }
        function TextInput(props) {
          return h('input', { className: 'at-input', type: props.type || 'text', value: props.value,
            placeholder: props.placeholder || '', 'aria-label': props.label || props.placeholder || '',
            disabled: props.disabled, onKeyDown: props.onKeyDown,
            onChange: function (e) { props.onChange(e.target.value) } })
        }
        function TextArea(props) {
          return h('textarea', { className: 'at-input at-textarea', value: props.value,
            placeholder: props.placeholder || '', 'aria-label': props.label || '', rows: props.rows || 4,
            onKeyDown: props.onKeyDown,
            onChange: function (e) { props.onChange(e.target.value) } })
        }
        function Select(props) {
          return h('select', { className: 'at-select', value: props.value, 'aria-label': props.label || '',
            onChange: function (e) { props.onChange(e.target.value) } },
            (props.options || []).map(function (o) { return h('option', { key: o.key, value: o.key }, o.name) }))
        }
        function Check(props) {
          return h('label', { className: 'at-check' },
            h('input', { type: 'checkbox', checked: !!props.value, onChange: function (e) { props.onChange(e.target.checked) } }),
            h('span', null, props.children))
        }
        function Empty(props) {
          return h('div', { className: 'at-empty' }, h(Icon, { name: props.icon || 'folder', size: 32, opacity: .5 }),
            h('p', null, props.title || '这里暂时是空的'),
            props.hint ? h('p', { className: 'at-empty-hint' }, props.hint) : null,
            props.action ? h(Btn, { variant: 'primary', size: 'lg', onClick: props.action.onClick }, props.action.label) : null)
        }
        function Dialog(props) {
          var ref = React.useRef(null)
          React.useEffect(function () {
            var node = ref.current, previous = document.activeElement
            if (!node) return
            var timer = setTimeout(function () {
              var first = node.querySelector('textarea,input:not([type="checkbox"]),select') || node.querySelector('button')
              if (first) first.focus()
            }, 0)
            function onTab(e) {
              if (e.key !== 'Tab') return
              var dialogs = document.querySelectorAll('[role="dialog"]')
              if (dialogs[dialogs.length - 1] !== node) return
              var controls = Array.from(node.querySelectorAll('button,input,textarea,select,[tabindex="0"]'))
                .filter(function (el) { return !el.disabled && el.getClientRects().length })
              if (!controls.length) { e.preventDefault(); return }
              var first = controls[0], last = controls[controls.length - 1]
              if (e.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
                e.preventDefault(); last.focus()
              } else if (!e.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
                e.preventDefault(); first.focus()
              }
            }
            document.addEventListener('keydown', onTab)
            return function () {
              clearTimeout(timer); document.removeEventListener('keydown', onTab)
              if (previous && previous.isConnected && previous.focus) previous.focus()
            }
          }, [])
          return h(props.as || 'div', { ref: ref, className: props.className, style: props.style,
            role: 'dialog', 'aria-modal': 'true', 'aria-label': props['aria-label'] || props.title || '' }, props.children)
        }
        function Modal(props) {
          return h('div', { className: 'at-modal-layer', onMouseDown: function (e) {
            if (e.target === e.currentTarget && props.onClose) props.onClose()
          } },
            h(Dialog, { className: 'at-modal' + (props.wide ? ' at-modal-wide' : ''), role: 'dialog',
              'aria-modal': 'true', 'aria-label': props.title || '' },
              h('div', { className: 'at-modal-head' },
                h('div', null, h('div', { className: 'at-modal-title' }, props.title || ''),
                  props.sub ? h('div', { className: 'at-modal-sub' }, props.sub) : null),
                h(IconBtn, { name: 'close', title: '关闭', onClick: props.onClose })),
              h('div', { className: 'at-modal-body' }, props.children),
              props.footer ? h('div', { className: 'at-modal-foot' }, props.footer) : null))
        }
        function Confirm(props) {
          return h(Modal, { title: props.title, onClose: props.onCancel,
            footer: [h(Btn, { key: 'cancel', onClick: props.onCancel }, '取消'),
              h(Btn, { key: 'ok', variant: props.danger ? 'danger' : 'primary', onClick: props.onConfirm },
                props.confirmText || '确定')] },
            h('p', { className: 'at-confirm-text' }, props.body || ''))
        }
        function Toast(props) {
          var t = props.toast
          if (!t || !t.message) return null
          return h('div', { className: 'at-toast' + (t.tone === 'danger' ? ' is-danger' : ''), role: 'status' }, t.message)
        }
        function Toolbar(props) {
          return h('div', { className: 'at-toolbar' }, props.children)
        }
        function Seg(props) {
          return h('div', { className: 'at-seg' }, (props.options || []).map(function (o) {
            return h('button', { key: o.key, type: 'button',
              className: 'at-seg-item' + (props.value === o.key ? ' is-on' : ''),
              onClick: function () { props.onChange(o.key) } }, o.name)
          }))
        }

        /* ----------------------------------------------------------------- style --- */
        /* 统一反馈基准（前端标准规范 v1 §6.2 FB-01～FB-05 / §6.1 ST-03·04·06·29）：
         * 三档 .82 / .78 / .4、位移只向下 1px、过渡 .12s ease、焦点环 2px + 2px offset。
         * :where() 把整条规则压到 0,1,0 —— 模块里更具体的规则自然优先，没写
         * active / disabled 的可点控件自动吃到统一反馈。hover 不做全局兜底：
         * 通用换底会误伤恒亮面黄键与实心键，故 hover 一律由各模块显式写。 */
        var FEEDBACK_CSS = [
          '.at-root :where(button,[role=button]),.at-gl :where(button,[role=button]){',
          'transition:background .12s ease,color .12s ease,opacity .12s ease,transform .12s ease}',
          '.at-root :where(button,[role=button]):active:not(:disabled),',
          '.at-gl :where(button,[role=button]):active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.at-root :where(button,[role=button]):disabled,',
          '.at-gl :where(button,[role=button]):disabled{opacity:.4;cursor:not-allowed}',
          '.at-root :focus-visible,.at-gl :focus-visible{outline:2px solid var(--at-blue);outline-offset:2px}',
          '@media (prefers-reduced-motion:reduce){.at-gl-root,.at-gl-root *{animation:none!important;transition:none!important}}'
        ].join('')
        var STYLE = [
          '.at-root{position:relative;display:flex;flex-direction:column;width:100%;height:100%;',
          'min-width:0;overflow:hidden;background:var(--at-surface);color:var(--at-primary);',
          'font-size:15px;line-height:1.45;font-family:var(--at-font)}',
          '.at-root *,.at-gl *{box-sizing:border-box}',
          '.at-root button,.at-root input,.at-root select,.at-root textarea{font:inherit;color:inherit}',
          '.at-root :focus-visible,.at-gl :focus-visible{outline:2px solid var(--at-blue);outline-offset:2px}',
          /* ★★ 2026-11-10（轮次 11）：**输入类控件不吃外圈焦点环**。
           * 起因：用户截图「导出待办到输入框」的搜索栏，框里套着一个 2px 深色直角框 ——
           * 那不是边框（`border-style` 实测 none），而是上面那条 `:focus-visible{outline:2px}` 打上去的。
           * 根因是**特异性**：`.at-gl :focus-visible` 是 (0,1,1)，而组件自己写的
           * `.at-pick-input{outline:none}` 只有 (0,1,0) ⇒ 全仓每一处 `outline:none` 其实都是失效的，
           * 输入框一聚焦就多画一圈"不是设计出来的东西"。这就是"别的地方也有这个问题"的同一个根因。
           * 落法：聚焦语言对输入类**只留描边变色**（1px `--at-field-line` → `--at-text2`），
           * 外圈留给按钮 / 链接 / 可聚焦容器。`:is()` 取参数最高特异度 ⇒ 本行 (0,2,1)，
           * 稳压 `.at-root :focus-visible` / `.at-gl :focus-visible`（含 85-desktop 的同名那条），
           * 与拼接顺序无关 —— 这是它必须写成 `:is()` 而不是 `:where()` 的唯一原因。 */
          '.at-root :is(input:not([type="checkbox"]):not([type="radio"]),textarea,select):focus-visible,',
          '.at-gl :is(input:not([type="checkbox"]):not([type="radio"]),textarea,select):focus-visible',
          '{outline:none;outline-offset:0}',
          '.at-root ::-webkit-scrollbar,.at-gl ::-webkit-scrollbar{width:8px;height:8px}',
          '.at-root ::-webkit-scrollbar-thumb,.at-gl ::-webkit-scrollbar-thumb{background:var(--at-hairline-strong);border-radius:4px}',
          '.at-ico{display:block;flex:0 0 auto;user-select:none;-webkit-user-drag:none}',
          '.at-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;',
          'height:28px;padding:0 12px;border:1px solid var(--at-hairline);border-radius:8px;',
          'background:var(--at-card);color:var(--at-slate);font-size:13px;font-weight:500;',
          'cursor:pointer;white-space:nowrap;transition:background .12s ease,color .12s ease,',
          'opacity .12s ease,transform .12s ease}',
          '.at-btn:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
          '.at-btn:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.at-btn:disabled{opacity:.4;cursor:not-allowed}',
          '.at-btn-primary{background:var(--at-yellow);border-color:transparent;color:var(--at-on-accent);font-weight:600}',
          '.at-btn-primary:hover:not(:disabled){background:var(--at-yellow);color:var(--at-on-accent);opacity:.82}',
          '.at-btn-primary:active:not(:disabled){background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
          '.at-btn-dark{background:var(--at-solid);border-color:transparent;color:var(--at-on-solid)}',
          '.at-btn-danger{color:var(--at-danger);border-color:var(--at-danger);background:var(--at-card)}',
          '.at-btn-danger:hover:not(:disabled){background:var(--at-chip)}',
          '.at-btn-ghost{background:transparent;border-color:transparent}',
          '.at-btn.is-active{color:var(--at-primary);border-color:var(--at-blue)}',
          '.at-btn-lg{height:40px;padding:0 18px;border-radius:10px;font-size:14px;gap:6px}',
          '.at-icon-btn{width:28px;padding:0}',
          '.at-icon-btn-danger{color:var(--at-danger)}',
          '.at-chip{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;',
          'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-chip);',
          'color:var(--at-slate);font-size:12px;font-weight:500;white-space:nowrap}',
          '.at-chip-ok{color:var(--at-success-t);border-color:var(--at-success);background:var(--at-success-bg)}',
          '.at-chip-warn{color:var(--at-stone);background:var(--at-chip)}',
          '.at-dot{display:inline-block;width:7px;height:7px;border-radius:50%;flex:0 0 7px}',
          '.at-card{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
          'padding:14px;box-shadow:var(--at-sh-card)}',
          '.at-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;',
          'padding:0 0 10px;margin-bottom:10px;border-bottom:1px solid var(--at-hairline-soft)}',
          '.at-card-title{font-size:16px;font-weight:600}',
          '.at-section{margin-bottom:16px}',
          /* 26 高 / gap 8 / 两侧 2 / 下间距 8 —— 逐值照抄小程序 `.sec-head`（上间距交给容器 gap）。
           * 标题 16/600 ＝ 小程序 `.sec-t`；图标由调用方给（16 + opacity .6）。 */
          '.at-section-head{display:flex;align-items:center;justify-content:flex-start;gap:8px;',
          'flex:0 0 26px;height:26px;margin:0 0 8px;padding:0 2px;font-size:16px;font-weight:600;color:var(--at-primary)}',
          '.at-section-head .at-muted{font-size:12px}',
          '.at-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
          /* ★★★ 输入框**唯一基线**（2026-11-10 轮次 11 收口）——
           * 逐值照小程序 PC 端 `form-drawer.wxss` 的 `.sd-input`：38 高 / 1px `--hairline` /
           * 圆角 10 / 内距 0 10 / 14px / card 底 / 占位符 13 灰。
           * 插件这边的对应令牌是 `--at-field-line`（浅色同值 `#E0E2E8`；深色取 `#4A4D51`，
           * 因为深色档 `--at-hairline` 的 `#33363A` 压在 `--at-card` 上看不出框）。
           * ⚠️ 这条是**唯一**写「输入框长什么样」的地方：其余输入类（`.at-sd-input` /
           *    `.at-gl-input` / `.at-cx-*` / 搜索壳）只许覆盖高度/内距这类**场景差**，
           *    不许再各自写一套 border/圆角/字号 —— 轮次 11 之前有 7 套，圆角分别是
           *    7 / 9 / 10、高度 34 / 36 / 38、字号 13 / 14，一屏里三种输入框。
           * ⚠️ 聚焦语言只有一条：描边 `--at-field-line` → `--at-text2`。不叠外圈 outline（见上）。 */
          '.at-input{width:100%;height:38px;padding:0 10px;border:1px solid var(--at-field-line);',
          'border-radius:10px;background:var(--at-card);color:var(--at-primary);outline:none;font-size:14px}',
          '.at-input:focus{border-color:var(--at-text2)}',
          '.at-input::placeholder{color:var(--at-muted);font-size:13px}',
          '.at-textarea{height:auto;min-height:84px;padding:8px 10px;resize:vertical;line-height:1.55}',
          '.at-select{height:38px;padding:0 10px;border:1px solid var(--at-field-line);border-radius:10px;',
          'background:var(--at-card);color:var(--at-primary);font-size:14px;outline:none}',
          '.at-select:focus{border-color:var(--at-text2)}',
          '.at-field{display:block;margin-bottom:16px}',
          '.at-field-label{display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:var(--at-primary)}',
          '.at-field-label em{font-style:normal;color:var(--at-muted);font-size:11px}',
          '.at-field-hint{display:block;margin-top:5px;font-size:11px;color:var(--at-muted)}',
          '.at-check{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--at-slate);cursor:pointer}',
          '.at-check input{accent-color:var(--at-yellow-deep);margin:0}',
          '.at-seg{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:var(--at-chip)}',
          '.at-seg-item{height:28px;padding:0 14px;border:0;border-radius:999px;background:transparent;',
          'color:var(--at-slate);font-size:13px;font-weight:500;cursor:pointer}',
          '.at-seg-item.is-on{background:var(--at-yellow-soft);color:var(--at-primary);',
          'font-weight:600;box-shadow:inset 0 0 0 1px var(--at-yellow)}',
          '.at-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;',
          'margin:12px;padding:22px 16px;border:1px dashed var(--at-hairline-strong);border-radius:12px;',
          'color:var(--at-muted);text-align:center;font-size:13px}',
          '.at-empty p{margin:0}',
          '.at-empty-hint{color:var(--at-muted);opacity:.9}',
          '.at-modal-layer{position:absolute;inset:0;z-index:60;display:flex;align-items:flex-start;',
          'justify-content:center;padding:9vh 16px 16px;background:var(--at-mask);overflow:auto}',
          '.at-modal{width:min(440px,100%);border:1px solid var(--at-hairline);border-radius:16px;',
          'background:var(--at-elevated);box-shadow:var(--at-sh-pop);overflow:hidden}',
          '.at-modal-wide{width:min(860px,100%)}',
          '.at-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;',
          'padding:12px 14px;border-bottom:1px solid var(--at-hairline-soft)}',
          '.at-modal-title{font-size:16px;font-weight:600}',
          '.at-modal-sub{margin-top:2px;font-size:12px;color:var(--at-text2)}',
          '.at-modal-body{padding:14px;max-height:62vh;overflow:auto;font-size:14px}',
          '.at-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;',
          'border-top:1px solid var(--at-hairline-soft)}',
          '.at-confirm-text{margin:0;font-size:14px;line-height:1.6}',
          '.at-toast{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:80;',
          'padding:9px 15px;border-radius:8px;background:var(--at-solid);color:var(--at-on-solid);',
          'font-size:13px;box-shadow:var(--at-sh-float);pointer-events:none}',
          '.at-toast.is-danger{background:var(--at-danger);color:var(--at-on-danger)}',
          '.at-scroll{overflow:auto;min-height:0;flex:1 1 auto}',
          '.at-row{display:flex;align-items:center;gap:8px;min-width:0}',
          '.at-row-between{justify-content:space-between}',
          '.at-muted{color:var(--at-muted);font-size:11px}',
          '.at-small{font-size:12px;color:var(--at-text2)}',
          '.at-link{border:0;background:none;color:var(--at-blue);cursor:pointer;font-size:13px;',
          'font-weight:500;padding:0}',
          '.at-link:hover{opacity:.82}',
          '.at-grid{display:grid;gap:12px}',
          '.at-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}',
          '.at-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
          '.at-grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}',
          '.at-list-row{display:flex;align-items:center;gap:9px;width:100%;padding:10px 11px;',
          'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-card);',
          'text-align:left;cursor:pointer;margin-bottom:8px;box-shadow:var(--at-sh-card)}',
          '.at-list-row:hover{background:var(--at-chip)}',
          '.at-list-row.is-active{border-color:var(--at-yellow);background:var(--at-yellow-soft)}',
          '.at-list-row-main{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:14px}',
          '@media (max-width:900px){.at-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}}',
          '@media (prefers-reduced-motion:reduce){.at-root *{transition:none!important;animation:none!important}}',
          FEEDBACK_CSS
        ].join('')

        AT.ui = {
          Icon: Icon, Btn: Btn, IconBtn: IconBtn, Chip: Chip, Card: Card, Section: Section,
          Field: Field, TextInput: TextInput, TextArea: TextArea, Select: Select, Check: Check,
          Empty: Empty, Dialog: Dialog, Modal: Modal, Confirm: Confirm, Toast: Toast, Toolbar: Toolbar, Seg: Seg,
          STYLE: STYLE, FEEDBACK_CSS: FEEDBACK_CSS, LIGHT: LIGHT, DARK: DARK,
          themeCss: themeCss, themeCssFor: themeCssFor
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 50-shell.js ===== */
    ;(function (AT, React, h) {
      /* 50-shell.js — PC workspace shell.
       * 五模块左导轨（小程序 nav-rail 口径）＋ 页内一体化三栏（AT.panes）。
       * 导航仍按 utils/nav.js planFrom()：switch / drawer(=聚焦页内列表) / refresh。
       */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const

        var STYLE = [
          '.at-topbar{display:flex;align-items:center;gap:10px;height:56px;flex:0 0 56px;padding:0 20px;',
          'border-bottom:1px solid var(--at-hairline);background:var(--at-card)}',
          '.at-topbar-title{font-size:16px;font-weight:600;white-space:nowrap}',
          /* 横版组合标（顶栏**左侧**，与平板竖屏 `brand-head` 同位）：素材四周各有 120 透明留白
           * （3980×1204 / 可见 3737×960），所以「高 30」量出来是 30、看见的只有 23.9；
           * `margin-left:-2px` 把左缘那段留白扣掉，让可见笔画与顶栏内距齐平 ——
           * 与小程序 `.bh-lockup{margin-left:…-h*120/1204}` 同一条算法。
           * ⚠️ 负数在**左**、不在右：上一版按「右上角」落过，用户当场纠回。 */
          '.at-brand-lockup{display:block;height:30px;width:auto;flex:0 0 auto;margin-left:-2px;',
          'user-select:none;-webkit-user-drag:none}',
          '.at-topbar-count{color:var(--at-text2);font-size:12px;white-space:nowrap}',
          '.at-topbar-spacer{flex:1 1 auto;min-width:0}',
          '.at-status{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;',
          'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-card);',
          'color:var(--at-slate);font-size:12px;cursor:pointer;white-space:nowrap;font-family:inherit}',
          '.at-status:hover{background:var(--at-chip);color:var(--at-primary)}',
          /* ★ 轮次 12：「未登录」是默认态 ⇒ 这颗键必须读起来像**该点我**，不是一枚状态徽章。
           * 用暖黄底 ＋ **主墨文字**（＝主按钮 `--at-on-accent` 那套语言），既不与主按钮抢，
           * 也不会被误读成"不可用"（用 opacity 弱化正好是这个反义）。
           * ⚠️ 文字**不用** `--at-yellow-deep`：深黄压暖黄底只有约 1.8:1，12px 字直接糊在底上；
           *   品牌黄只留给小圆点（图形不承担可读性）。深色档自动成立 —— 暖黄变 #3A301A、
           *   主墨变 #EEEDEA，仍是浅字压深底。 */
          '.at-status.is-guest{border-color:var(--at-yellow-line);background:var(--at-yellow-warm);',
          'color:var(--at-primary);font-weight:600}',
          '.at-status.is-guest .at-status-dot{background:var(--at-yellow-deep)}',
          '.at-status.is-guest:hover{background:var(--at-yellow);border-color:var(--at-yellow);color:var(--at-on-accent)}',
          '.at-status.is-guest:hover .at-status-dot{background:var(--at-on-accent)}',
          '.at-status-dot{width:6px;height:6px;border-radius:50%;background:var(--at-muted)}',
          '.at-status.is-on .at-status-dot{background:var(--at-success)}',
          '.at-body{display:flex;flex:1 1 auto;min-height:0;min-width:0}',
          '.at-rail{display:flex;flex-direction:column;align-items:center;gap:8px;',
          'width:var(--at-rail-w);flex:0 0 var(--at-rail-w);padding:20px 0;',
          'border-right:1px solid var(--at-hairline);background:var(--at-card)}',
          '.at-rail-list{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}',
          '.at-rail-item{display:flex;flex-direction:column;align-items:center;justify-content:center;',
          'gap:4px;width:40px;height:48px;border:0;border-radius:12px;background:transparent;',
          'color:var(--at-slate);font-family:inherit;font-size:11px;line-height:13px;cursor:pointer}',
          '.at-rail-item:hover:not(.is-active){background:var(--at-chip);color:var(--at-primary)}',
          '.at-rail-item.is-active{background:var(--at-yellow);color:var(--at-on-accent);font-weight:500}',
          '.at-rail-spacer{flex:1 1 auto}',
          '.at-work{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;overflow:hidden}',
          '.at-boot{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
          'background:var(--at-surface);color:var(--at-muted);font-size:13px;z-index:20;pointer-events:none}',
          '.at-danger-note{padding:9px 11px;border-radius:10px;',
          'background:var(--at-fresh-bg);color:var(--at-fresh);font-size:12px}',
          '.at-op-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}',
          '.at-detail-col{display:flex;flex-direction:column;gap:12px;max-width:100%}',
          '.at-block{padding:14px;border:1px solid var(--at-hairline);border-radius:14px;',
          'background:var(--at-card);box-shadow:var(--at-sh-card)}',
          '.at-block-title{font-size:15px;font-weight:600;margin-bottom:10px}',
          '.at-kv{display:flex;justify-content:space-between;gap:10px;padding:5px 0;font-size:13px}',
          '.at-kv>span:first-child{color:var(--at-text2)}',
          '.at-hr{height:1px;background:var(--at-hairline-soft);margin:10px 0}'
        ].join('')

        function planFrom(active, key) {
          if (key !== active) return 'switch'
          if (C.DETAIL_MODULES.indexOf(key) >= 0) return 'drawer'
          return 'refresh'
        }
        /* ★ 轮次 12：未登录 ⇒ 打开任何页面都提示一次「请登录」。
         * 抽成纯函数只为一件事：判据可以直接喂状态验，不必去猜 useEffect 的闭包。
         * 两个条件缺一不可 ——
         *   · `bootReady`：宿主探测（/agent-todo/state）落地前不判定，否则已配对用户进场会闪一帧；
         *   · `!connected`：已登录不打扰。
         * ⚠️ 显式**不看** `connectOpen`：那是"已经在弹"，由调用点挡，别混进语义里。 */
        function gateFor(ui) {
          var s = ui || {}
          return !!s.bootReady && !s.connected
        }

        function setView(key) {
          /* 切模块时收掉筛选浮层：否则它带着上一个模块的 kind 挂在新页面上。
           * 详情内的两个查看层（图片 / 胶囊全文）同样收掉 —— 它们是局部模态，
           * 留着会盖在新页面上。 */
          B.ui({ active: key, drawer: null, form: null, filterKind: null,
            capsulePick: null, mmPick: null, detailOpen: false,
            imgView: null, capView: null })
        }
        function onNav(key) {
          var p = planFrom(B.get().ui.active, key)
          if (p === 'switch') setView(key)
          else if (p === 'drawer') B.ui({ detailOpen: false, listFocus: (B.get().ui.listFocus || 0) + 1 })
          else B.sync(false)
        }
        /* 列表不再是弹层：所有「打开 X 列表」都落到页内列表 / 页内选择器。
         * 2026-11-09 轮次 8：`listScope` 这套"页内临时收窄"已并进筛选模型
         * （`ui.{p,t,m}Filter`）—— 列表页只认筛选，不再有第二条收窄通道。
         * 这里只剩「带对象的选择态」（胶囊关联 / 选脑图挂待办）走 ui.capsulePick / ui.mmPick。 */
        function openListDrawer(kind, scope) {
          var o = scope || {}
          if (kind === 'capsule') {
            B.ui({ capsulePick: { todoId: o.todoId || '', picked: [] }, drawer: null })
            return
          }
          if (kind === 'mindmap' && o.pickTodoId) {
            B.ui({ mmPick: { todoId: o.pickTodoId }, drawer: null })
            return
          }
          if (C.LIST_META[kind]) {
            B.ui({ active: kind, drawer: null, form: null, filterKind: null, detailOpen: false,
              capsulePick: null, mmPick: null,
              listFocus: (B.get().ui.listFocus || 0) + 1 })
          }
        }
        function closeDrawer() { B.ui({ drawer: null }) }
        function openForm(mode, id, opts) {
          /* 表单与筛选都是右侧展开浮层、共用一层遮罩 ⇒ 开表单时收筛选，不叠两层。 */
          B.ui({ filterKind: null,
            form: { mode: mode, id: id || '', offset: (opts && opts.offset) || 0,
              preset: (opts && opts.preset) || null, scope: (opts && opts.scope) || null,
              parent: (opts && opts.parent) || null } })
        }
        function closeForm() { var f = B.get().ui.form; B.ui({ form: f && f.parent ? f.parent : null }) }
        function openCapsule(seed) { AT.capsule.openCapsule(seed) }
        function closeCapsule() { AT.capsule.closeCapsule() }
        function openConfirm(cfg) { B.ui({ confirm: cfg }) }
        function closeConfirm() { B.ui({ confirm: null }) }

        function Workspace() {
          var state = B.useStore()
          var uiState = state.ui
          var dark = AT.icons.useDark()
          var rootRef = React.useRef(null)
          React.useEffect(function () { B.bootstrap() }, [])
          React.useEffect(function () {
            var el = rootRef.current
            if (!el || typeof window === 'undefined' || !window.ResizeObserver) return
            var ro = new window.ResizeObserver(function (entries) {
              var w = Math.round((entries[0] && entries[0].contentRect && entries[0].contentRect.width) || 0)
              if (w && w !== B.get().ui.paneWidth) B.ui({ paneWidth: w })
            })
            try { ro.observe(el) } catch (e) { return }
            return function () { try { ro.disconnect() } catch (e) {} }
          }, [])
          React.useEffect(function () {
            function onKey(e) {
              if (e.key !== 'Escape') return
              /* 详情内的查看层在最上层（z160）⇒ 先收它：图片层压在胶囊全文层之上，
               * 所以先关图片、再关全文（与 62-views-b 的 DOM 顺序一致）。 */
              if (uiState.imgView) { e.preventDefault(); B.ui({ imgView: null }); return }
              if (uiState.capView) { e.preventDefault(); B.ui({ capView: null }); return }
              if (uiState.captureOpen || uiState.composerOpen) {
                e.preventDefault(); B.ui({ captureOpen: false, captureSeed: '', captureCapsuleOnly: false, composerOpen: false }); return
              }
              if (uiState.connectOpen) { e.preventDefault(); B.ui({ connectOpen: false }); return }
              if (uiState.confirm) { e.preventDefault(); closeConfirm(); return }
              if (uiState.form) { e.preventDefault(); closeForm(); return }
              /* ★ 轮次 6：筛选已是浮层抽屉 ⇒ Esc 也要能收它，排在表单之后、
               * 页内选择器之前（与遮罩 z54 的层级顺序一致）。 */
              if (uiState.filterKind) { e.preventDefault(); B.ui({ filterKind: null }); return }
              if (uiState.capsulePick || uiState.mmPick) {
                e.preventDefault(); B.ui({ capsulePick: null, mmPick: null }); return
              }
              if (uiState.drawer) { e.preventDefault(); closeDrawer(); return }
              /* 闪念胶囊的 Esc 由全局悬浮层自己处理（先收子面板，再收抽屉）。 */
            }
            window.addEventListener('keydown', onKey)
            return function () { window.removeEventListener('keydown', onKey) }
          }, [uiState.confirm, uiState.form, uiState.filterKind, uiState.drawer,
            uiState.capsulePick, uiState.mmPick, uiState.connectOpen, uiState.captureOpen,
            uiState.composerOpen, uiState.imgView, uiState.capView])

          /* ★ 轮次 12：未登录 ⇒ 每「打开一个页面」都提示登录。
           * 触发点只有两个：① 进入某个模块（`uiState.active` 变化）；② 首次探测落地（`bootReady`）。
           * ⚠️ 依赖里**刻意不放 `connected`** —— 放了以后用户刚点「退出登录」就会被立刻再弹一次，
           *   而他上一秒才明确表达过"我要退出去看演示数据"。切页面照旧会提醒。
           * 判定读 `B.get()` 而不读闭包里的 `uiState`：效果只在这一帧跑，取值要的是当下的真值。 */
          React.useEffect(function () {
            var s = B.get().ui
            if (!gateFor(s) || s.connectOpen) return
            B.ui({ connectOpen: true, connectError: '' })
          }, [uiState.active, uiState.bootReady])

          var activeName = (C.MODULES.filter(function (m) { return m.key === uiState.active })[0] || C.MODULES[0]).label
          var layout = uiState.paneWidth && uiState.paneWidth < 660 ? 'tight'
            : uiState.paneWidth && uiState.paneWidth < 1100 ? 'compact' : 'wide'
          return h('div', { className: 'at-root', ref: rootRef, 'data-layout': layout, 'data-dark': String(dark) },
            h('style', null, U.themeCss(dark) + U.STYLE + STYLE +
              (AT.panes ? AT.panes.STYLE : '') + (AT.views ? AT.views.STYLE : '') +
              (AT.mindmap ? AT.mindmap.STYLE : '') +
              (AT.drawers ? AT.drawers.STYLE : '') + (AT.overlays ? AT.overlays.STYLE : '') +
              (AT.desktop ? AT.desktop.STYLE : '')),
            h('header', { className: 'at-topbar' },
              /* ★★ 2026-11-10（用户第 1 条订正）：「横版 logo 放在顶部**左侧**」。
               * 上一版按「右上角」落过一次，用户当场纠回 —— 平板竖屏的品牌行本来就是
               * 左上角一枚组合标（`components/brand-head`），插件的顶栏同一行，
               * 品牌只能在左、模块名紧跟其后，顺序不能倒。 */
              h('img', { className: 'at-brand-lockup', draggable: false, alt: 'Agent ToDo',
                src: dark ? '/agent-todo/assets/d-brand-lockup.png' : '/agent-todo/assets/brand-lockup.png' }),
              h('span', { className: 'at-topbar-title' }, activeName),
              h('span', { className: 'at-topbar-spacer' }),
              h('button', { type: 'button', className: 'at-status' + (uiState.connected ? ' is-on' : ' is-guest'),
                title: uiState.connected ? '已连接 Agent ToDo 账号'
                  : '请登录 · 点这里扫码，与小程序数据同步',
                onClick: function () { B.ui({ connectOpen: true, connectError: '' }) } },
                h('span', { className: 'at-status-dot' }),
                uiState.connected ? ((uiState.user && uiState.user.nickname) || '已连接') : '请登录'),
              h(U.IconBtn, { name: 'refresh', title: '刷新', label: '刷新',
                disabled: uiState.syncing, onClick: function () {
                  if (!uiState.connected) { B.toast('登录后才能同步，现在看到的是演示数据'); return }
                  B.sync(true)
                } })),
            h('div', { className: 'at-body' },
              h('nav', { className: 'at-rail', 'aria-label': '模块导航' },
                h('div', { className: 'at-rail-list' }, C.MODULES.map(function (m) {
                  var on = uiState.active === m.key
                  /* ★ 2026-11-10（用户第 2 条）：「左侧导航栏不再显示数量」。
                   * 原来「待办」那一项带一颗未完成计数（`.at-nav-count`）—— 只有一项有数字，
                   * 读起来像"这一项特殊"，而不是"所有项的数量"；导航从此只负责去哪。
                   * 数量改由列表头的 `.at-pane-count` 承担（那是当前列表的真实条数）。 */
                  return h('button', { key: m.key, type: 'button',
                    className: 'at-rail-item' + (on ? ' is-active' : ''),
                    title: m.label, 'aria-label': m.label, 'aria-current': on ? 'page' : null,
                    onClick: function () { onNav(m.key) } },
                    h(U.Icon, { name: m.icon, size: 18, opacity: on ? 1 : .62 }),
                    h('span', null, m.label))
                })),
                h('span', { className: 'at-rail-spacer' })),
              h('main', { className: 'at-work' },
                uiState.syncing && !state.loaded ? h('div', { className: 'at-boot' }, '正在同步你的数据…') : null,
                AT.panes.render(state))),
            AT.drawers.render(state, { openForm: openForm, closeForm: closeForm, openListDrawer: openListDrawer }),
            AT.overlays.render(state),
            uiState.confirm ? h(U.Confirm, {
              title: uiState.confirm.title, body: uiState.confirm.body,
              confirmText: uiState.confirm.confirmText, danger: uiState.confirm.danger !== false,
              onCancel: closeConfirm,
              onConfirm: function () { var fn = uiState.confirm.onConfirm; closeConfirm(); if (fn) fn() }
            }) : null)
        }

        AT.shell = {
          Workspace: Workspace, STYLE: STYLE, planFrom: planFrom, setView: setView, onNav: onNav,
          gateFor: gateFor,
          openListDrawer: openListDrawer, closeDrawer: closeDrawer, openForm: openForm,
          closeForm: closeForm, openCapsule: openCapsule, closeCapsule: closeCapsule,
          openConfirm: openConfirm, closeConfirm: closeConfirm
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 55-panes.js ===== */
    ;(function (AT, React, h) {
      /* 55-panes.js — 项目 / 待办 / 脑图 三模块的一体化页内布局。
       *
       *   [左导轨 72px] [列表区 300px] [详情区 flex:1]   ← 三栏常驻页面内；
       *   表单与筛选是浮在工作区之上的「右侧展开弹窗」（外壳在 85-desktop / 90-drawers）。
       *   选中项写在 ui.{projectId,todoId,mindmapId}，列表与详情读同一个真源。
       *   宽度按面板实测值分三档（is-compact / is-tight），不是按浏览器视口。
       */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, S = AT.shell

        /* 从 40-ui 的 LIGHT / DARK 表里**现取**已登记色值（同 80-capsule 的 literal 做法），
         * 不在这里新增色值、也不手抄一份副本。 */
        function literal(name, table) {
          var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
          return m ? m[1] : ''
        }
        var PAGE_L = literal('at-surface', U.LIGHT), CARD_L = literal('at-card', U.LIGHT)
        var PAGE_D = literal('at-surface', U.DARK), CARD_D = literal('at-card', U.DARK)

        /* 待办状态四档 —— 页头快捷段与「筛选」面板**共用这一个数组**：
         * 分两处各写一份时，少一个 key 就会出现「选了已删除、页头没有任何段亮着」的假空态，
         * 而且一点就跳走。key 与小程序 `store.filterTodos` 的四档逐字一致。 */
        var TODO_STATUS = [
          { key: 'open', name: '未完成' }, { key: 'done', name: '已完成' },
          { key: 'deleted', name: '已删除' }, { key: 'all', name: '全部' }
        ]

        var STYLE = [
          '.at-panes{display:flex;flex:1 1 auto;min-height:0;min-width:0;gap:12px;padding:0 20px 20px}',
          '.at-pane{display:flex;flex-direction:column;min-height:0;min-width:0;overflow:hidden;',
          'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-card);',
          'box-shadow:var(--at-sh-card)}',
          '.at-pane-list{flex:0 0 300px;width:300px;background:var(--at-elevated)}',
          '.at-pane-detail{flex:1 1 auto;min-width:0}',
          '.at-pane-single{flex:1 1 auto;min-width:0}',
          /* ★ 首页级单栏（概览 / 我的）的「页底 ＋ 卡面」两层 —— 复刻小程序
           *   `page{background:var(--surface)}` ＋ `.card{background:var(--card)}` 这对关系。
           *   85-desktop 把这两支都映到宿主暖灰（`bg-layer-1` / `bg-base`），真实 DSH 里两档
           *   差得极小 ⇒ 白卡落在白底上、整页「一片白」，层次只剩 1px 描边。
           *   这里只对 `is-home` 作用域把三支钉回已登记值（浅 页底 #F7F8FA / 卡面 #FFFFFF；
           *   深 页底 #18191B / 卡面 #202123），并让 `--at-surface` 同步成页底色 ——
           *   卡片内部的灰块（`.at-ov-ag-meta` 等）与气泡底本来就用它，同源才不糊。
           *   作用范围只有这两页，导轨 / 三栏模块一律不动。 */
          '.at-pane-single.is-home{background:' + PAGE_L + ';--at-card:' + CARD_L +
            ';--at-surface:' + PAGE_L + '}',
          '.at-root[data-dark="true"] .at-pane-single.is-home{background:' + PAGE_D +
            ';--at-card:' + CARD_D + ';--at-surface:' + PAGE_D + '}',
          '.at-pane-head{display:flex;align-items:center;gap:10px;flex:0 0 56px;padding:0 14px;',
          'background:var(--at-head-bg);border-bottom:1px solid var(--at-head-line)}',
          '.at-pane-title{font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-pane-sub{font-size:12px;color:var(--at-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-pane-head .at-toolbar{margin-left:auto;gap:6px;flex-wrap:nowrap;overflow:hidden;flex:0 0 auto}',
          '.at-pane-tools{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:10px 12px;',
          'border-bottom:1px solid var(--at-hairline-soft);background:var(--at-card)}',
          '.at-pane-tools .at-input{flex:1 1 auto;min-width:0}',
          '.at-pane-tools .at-btn{flex:0 0 auto}',
          '.at-pane-scroll{flex:1 1 auto;min-height:0;overflow:auto;padding:10px 12px}',
          '.at-pane-body{flex:1 1 auto;min-height:0;overflow:auto;padding:14px}',
          '.at-pane-body.is-canvas{display:flex;flex-direction:column;padding:0;overflow:hidden}',
          '.at-pane-body.is-canvas>div{flex:1 1 auto;min-height:0}',
          '.at-pane-foot{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;',
          'gap:8px;padding:9px 12px;border-top:1px solid var(--at-hairline);background:var(--at-head-bg)}',
          '.at-pane-row{display:flex;align-items:flex-start;gap:9px;width:100%;padding:10px 11px;',
          'margin-bottom:8px;border:1px solid var(--at-hairline);border-radius:12px;',
          'background:var(--at-card);box-shadow:var(--at-sh-card);text-align:left;',
          'cursor:pointer;color:var(--at-primary);font:inherit}',
          '.at-pane-row:hover{background:var(--at-chip)}',
          '.at-pane-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-pane-row.is-on:hover{background:var(--at-yellow-soft);border-color:var(--at-yellow);opacity:.82}',
          '.at-pane-row.is-pick{box-shadow:inset 0 0 0 1px var(--at-yellow),0 2px 8px rgba(255,208,47,.2)}',
          '.at-pane-row-main{flex:1 1 auto;min-width:0}',
          '.at-pane-row-title{font-size:14px;font-weight:500;line-height:1.45;word-break:break-word}',
          '.at-pane-row.is-done .at-pane-row-title{color:var(--at-stone);text-decoration:line-through}',
          /* 已删除档：只退一档颜色，**不加删除线** —— 删除线是「已完成」的语义，别混用。 */
          '.at-pane-row.is-gone .at-pane-row-title{color:var(--at-stone)}',
          '.at-pane-row-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px;',
          'font-size:11px;color:var(--at-muted)}',
          '.at-pane-row-bar{width:4px;align-self:stretch;border-radius:2px;flex:0 0 4px;min-height:26px}',
          '.at-pane-flag{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:999px;',
          'background:var(--at-chip);color:var(--at-text2);font-size:11px}',
          /* 筛选抽屉（2026-11-09 轮次 6）：与创建 / 编辑弹窗统一走「右侧展开浮层」外壳 ——
           * `.at-form-mask` ＋ `.at-drawer`，几何真源在 85-desktop.js（460 贴右全高），
           * 头 / 体 / 底皮肤真源在 90-drawers.js（.at-drawer-head/body/foot 的 .sd 一套）。
           * 小程序 components/drawer 的 `.tf` 副弹窗同样是浮层：遮罩 ＋ 52 头 ＋ 即时生效 ＋
           * 没有「确定」；标题栏那颗是「关闭」不是「取消」—— 改动即时生效，写「取消」
           * 会被读成"我改的东西不算数"。
           * ⚠️ 旧版把筛选塞进详情区、让 DetailPane 整块换内容，那不是弹窗抽屉；
           *    `.at-filter-head/body/foot` 三块骨架随之删除，不留第二套没人用的样式。
           *    这里只留筛选**内容**自己的分组标签与 chips。 */
          '.at-filter-drawer{display:flex;flex-direction:column;min-width:0}',
          /* ★★ 2026-11-10（用户第 5 条）：三处筛选抽屉的**内部**按小程序 `.tf` 逐值对齐。
           * 外壳仍是右侧 460 全高抽屉（v1.12 用户认可的那只，与创建 / 编辑共用），
           * 这里只把内容规格改成 `.tf` 的那一套（数值全部来自
           * `components/drawer/drawer.wxss` 的 `.tf-grp` / `.tf-lab` / `.tf-chips` / `.tf-chip` /
           * `.tf-sear`）：组间距 14、标签 12/500 走 muted、胶囊 30 高 13/500、缝 6。
           * 原样是 组间距 10 / 标签走 slate / 胶囊 26 高 12px / 缝 5 —— 整体比小程序紧一档，
           * 三组叠起来读成"一坨"，正是用户说的"差距较大"。
           * ⚠️ 选中态**不跟** `.tf-chip.on`（小程序那支是深色实底）：样式标准 FB-01 已钉死
           *    「选中控件 ＝ 黄软底 ＋ 黄描边」，全工程只有这一套选中语言。 */
          '.at-filter-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}',
          '.at-filter-label{font-size:12px;font-weight:500;color:var(--at-muted)}',
          /* ★★ 2026-11-10（轮次 10 · 用户第 5 条复核）：**只有 wrap 组才换行**。
           * 小程序 `.tf-chips` 本体是 `display:flex;align-items:center;gap:6px`，
           * 换行是 `.wrap` 修饰类才打开的（项目节点 / 格式 / 更新时间三组）；
           * 状态组一直是单行。此前这里无条件 `flex-wrap:wrap`，460 宽抽屉里看不出差别，
           * 但窄档（is-tight）会把「已归档」「全部」折到第二行、与小程序读法不一致。
           * `.fill` 对应小程序 `.tf-chip.w2{flex:1 1 46%}` —— 更新时间那三颗均分两列。 */
          '.at-filter-chips{display:flex;align-items:center;gap:6px}',
          '.at-filter-chips.wrap{flex-wrap:wrap}',
          '.at-filter-chip{height:30px;padding:0 10px;border:1px solid var(--at-hairline);',
          'border-radius:999px;background:var(--at-card);color:var(--at-slate);font-size:13px;',
          'font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;box-sizing:border-box}',
          '.at-filter-chip.fill{flex:1 1 46%}',
          '.at-filter-chip:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
          '.at-filter-chip.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
          'color:var(--at-primary);font-weight:600}',
          '.at-filter-chip.is-on:hover:not(:disabled){opacity:.82}',
          /* ★★ 行组（`.tf-rows` / `.tf-row` / `.tf-dot` / `.tf-row-t` / `.tf-row-n`）：
           * 小程序里「所属项目」（待办 / 脑图）与「关联 agent」（项目）**不是胶囊**，是
           * 一行一个：色点 ＋ 名称 ＋ 条数。460 宽的胶囊行看着没问题，但项目一多就横着
           * 挤出抽屉；行式还能顺带报条数，用户不用点进去数。
           * ⚠️ 色点没有色时用**等宽透明占位**（`.empty`），否则整列名称左边缘参差。 */
          '.at-filter-rows{display:flex;flex-direction:column;gap:6px}',
          '.at-filter-row{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 10px;',
          'border:1px solid var(--at-hairline);border-radius:10px;background:var(--at-card);',
          'color:var(--at-primary);font:inherit;font-size:14px;text-align:left;cursor:pointer;',
          'box-sizing:border-box}',
          '.at-filter-row:hover{background:var(--at-chip)}',
          '.at-filter-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-filter-dot{flex:0 0 14px;width:14px;height:14px;border-radius:999px}',
          '.at-filter-dot.empty{background:transparent}',
          '.at-filter-row-t{flex:1;min-width:0;font-size:14px;color:var(--at-primary);overflow:hidden;',
          'white-space:nowrap;text-overflow:ellipsis}',
          '.at-filter-row.is-on .at-filter-row-t{font-weight:500}',
          '.at-filter-row-n{flex:0 0 auto;font-size:12px;color:var(--at-muted)}',
          /* 搜索组：`.tf-sear` 是 36 高壳（1px 描边 / 10 圆角 / card 底）内嵌
           * 14px 图标（opacity .45）＋ 34 高输入框 ＋ 24 圆底清空键（`.tf-clr`）。
           * 标签也从「关键词」改成「**搜索**」—— 小程序 `.tf-lab` 写的就是这两个字，
           * 而框里本来就有 placeholder（搜项目名 / 搜待办关键词 / 搜脑图关键词），
           * 「关键词」这层标签是插件自己加的第三种说法。 */
          '.at-filter-search{height:36px;padding:0 10px;border:1px solid var(--at-field-line);',
          'border-radius:10px;background:var(--at-card);display:flex;align-items:center;gap:7px;',
          'box-sizing:border-box}',
          '.at-filter-search:focus-within{border-color:var(--at-text2)}',
          '.at-filter-input{flex:1;min-width:0;height:34px;padding:0;border:0;background:transparent;',
          'color:var(--at-primary);font:inherit;font-size:14px;outline:none;box-sizing:border-box}',
          '.at-filter-input::placeholder{color:var(--at-muted);font-size:13px}',
          '.at-filter-clear{flex:0 0 24px;display:inline-flex;align-items:center;justify-content:center;',
          'width:24px;height:24px;padding:0;border:0;border-radius:999px;background:var(--at-chip);',
          'color:var(--at-slate);cursor:pointer;font-family:inherit}',
          /* ⚠️ 小程序 `.tf-clr-hv` 是 `opacity:.7`，插件不跟：FB-01 把反馈压成三档
           *    （hover `.82` / active `.78` / disabled `.4`），`.7` 是第四档，判据会红。 */
          '.at-filter-clear:hover{opacity:.82}',
          '.at-filter-clear:active{opacity:.78}',
          /* ★ 轮次 8：`.at-scope-note`（列表顶部那条「限定项目：X ＋ 清除」提示带）已删除。
           *   「按项目 / 按状态看某一批」本来就是筛选模型的事，再顶一条独立的提示带等于
           *   同一件事两种表达 + 两个清除入口。跨页带筛选现在只写 ui.{t,m}Filter（openFiltered），
           *   生效状态由工具条筛选键的「筛选 N」与抽屉里的 is-on chips 表达。 */
          /* ★★ 2026-11-10：胶囊 / 脑图选择器从**内联面板**改成**右侧抽屉**（外壳在
           * 90-drawers.js 的 PickDrawer，与创建 / 编辑 / 筛选同一套 .at-drawer）。
           * 改前这两块以 `.at-picker` 内联在详情内容的最顶上 —— 用户在下方区块点
           * 「选择胶囊」时，面板插在内容顶部、落在视口之外，读起来就是"点了没反应"。
           * 现在只剩**内容**（一句说明 ＋ 行列表 ＋ 空态），容器交给抽屉。
           * ⚠️ `.at-picker` / `.at-picker-head` 两条不再有宿主（面板自己带标题栏），
           *    整条删掉，别留一套没人用的样式。 */
          '.at-pick-note{font-size:12px;line-height:1.6;color:var(--at-text2);margin-bottom:10px}',
          '.at-pick-empty{font-size:13px;color:var(--at-muted);padding:10px 0}',
          '.at-picker-list{display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow:auto}',
          '.at-picker-row{display:flex;align-items:center;gap:8px;width:100%;padding:9px 10px;',
          'border:1px solid var(--at-hairline);border-radius:10px;',
          'background:var(--at-card);font:inherit;font-size:13px;text-align:left;cursor:pointer;',
          'color:var(--at-primary)}',
          '.at-picker-row:hover{background:var(--at-chip)}',
          '.at-picker-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-picker-row input{accent-color:var(--at-yellow-deep);margin:0}',
          '.at-pane-banner{display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:12px;',
          'border-radius:10px;background:var(--at-yellow-soft);border:1px solid var(--at-yellow-line);',
          'font-size:12px;color:var(--at-slate)}',
          /* 面板宽度分档：由 shell 的 ResizeObserver 实测写入 ui.paneWidth */
          '.at-panes.is-compact{gap:8px;padding:0 12px 12px}',
          '.at-panes.is-compact .at-pane-list{flex-basis:248px;width:248px}',
          '.at-panes.is-tight{gap:8px;padding:0 8px 8px}',
          '.at-panes.is-tight .at-pane-list{flex-basis:190px;width:190px}',
          '.at-panes.is-tight .at-pane-head{padding:0 10px;flex-basis:50px}',
          '.at-panes.is-tight .at-pane-body{padding:10px}',
          '.at-panes.is-tight .at-pane-row{padding:8px 9px}',
          '.at-panes.is-tight .at-pane-row-title{font-size:13px}',
          '.at-panes.is-compact .at-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}',
          /* ★ v1.11：待办状态 3 → 4 档（多「已删除」）。基础外观在 85-desktop.js，这里只补
           * 两件它没管的事：① 锁单行（否则「未完成」被挤成两行、压在 26 高的键上）；
           * ② is-tight（列表 190）时再收一档字号与内距，四档才塞得下。
           * 特异度：0,2,0 与 85 的 `.at-list-tabs .at-seg-item` 同档，但 `white-space` 是它没写的属性；
           * is-tight 那条 0,4,0 直接压过。 */
          '.at-list-tabs .at-seg-item{white-space:nowrap}',
          '.at-panes.is-tight .at-list-tabs{padding:0 10px 10px}',
          '.at-panes.is-tight .at-list-tabs .at-seg-item{padding:0 2px;font-size:10px}'
        ].join('')

        /* 面板宽度分档：由 shell 的 ResizeObserver 实测写入 ui.paneWidth。
         * v1.12 起多一档 `is-list-collapsed` —— 列表向左收起、把宽度让给详情（用户第 2 条）。
         * ⚠️ tight 档**不加** collapsed：那一档本来就是「列表 / 详情」二态互斥
         *    （85-desktop 的 show-detail 那段），两套折叠机制叠一起会互相打架。 */
        function widthClass(s) {
          var w = Number(s.ui.paneWidth || 0)
          var tight = !!(w && w < 660)
          var cls = tight
            ? ' is-tight' + (s.ui.detailOpen ? ' show-detail' : '')
            : (w && w < 980 ? ' is-compact' : '')
          if (s.ui.listCollapsed && !tight) cls += ' is-list-collapsed'
          return cls
        }
        function meta(kind) { return C.LIST_META[kind] }
        function entityList(s, kind) {
          if (kind === 'project') return s.projects
          if (kind === 'todo') return s.todos
          return s.mindmaps
        }
        function selId(s, kind) { return s.ui[meta(kind).idKey] || '' }
        function setSel(kind, id) {
          var patch = { detailOpen: true }; patch[meta(kind).idKey] = id
          B.ui(patch)
        }
        /* 列表真源：Core.filter* 与小程序 store.js 同源。
         * ★ 2026-11-09 轮次 8：这里**不再接 scope**。以前项目 / 状态这类收窄条件
         *   还能从 `ui.listScope` 再叠一层，等于同一件事有两个真源 —— 筛选抽屉里改了它
         *   不跟着变、它被「清除」了筛选还留着，用户看到的是"提示条没了、列表还是那几条"。
         *   现在一律走 `ui.{p,t,m}Filter`（唯一真源），跨页带筛选用 openFiltered()。 */
        function listOf(s, kind) {
          return kind === 'project' ? Core.filterProjects(s)
            : kind === 'todo' ? Core.filterTodos(s)
              : Core.filterMindmaps(s)
        }
        function filterKey(kind) { return kind === 'project' ? 'pFilter' : kind === 'todo' ? 'tFilter' : 'mFilter' }
        function defaultFilter(kind) {
          return kind === 'project' ? { kw: '', status: 'active', node: 'all', agentId: '' }
            : kind === 'todo' ? { kw: '', status: 'open', projectId: '', range: 'all' }
              : { kw: '', projectId: '', format: 'all', range: 'all' }
        }
        function activeFilterCount(s, kind) {
          var f = s.ui[filterKey(kind)] || {}
          return Object.keys(f).filter(function (k) {
            var v = f[k], d = defaultFilter(kind)[k]
            return k !== 'kw' && v !== undefined && v !== d && v !== '' && v !== 'all'
          }).length
        }
        /* 「带着一组筛选跳到某个列表」的唯一入口 —— 项目详情底行那两颗
         * （待办「已完成待办」/ 脑图「查看全部」）走这里。
         * 以前它们另写 `ui.listScope`，列表页顶上因此多出一条独立的「限定项目：X ＋ 清除」
         * 提示带（`.at-scope-note`）：既与筛选抽屉重复表达同一件事，又是第二个清除入口。
         * 现在只写筛选模型，跳过去后：工具条筛选键显示「筛选 N」、抽屉里对应 chips 亮着、
         * 清除只有「清除全部筛选」一处。`dict` 会在 defaultFilter 之上覆盖，
         * 保证从详情页跳过来看到的就是这一组条件（不残留上次的关键词）。
         * 同时把列表展开 —— 用户点「已完成待办」就是要看那批列表，别让他落地在一张
         * 收起的侧栏加一块详情上（`listCollapsed` 是跨页保持的）。 */
        function openFiltered(kind, dict) {
          var p = { listCollapsed: false }
          p[filterKey(kind)] = Object.assign(defaultFilter(kind), dict || {})
          S.setView(kind)
          B.ui(p)
        }

        /* ------------------------------------------------------- filter drawer --- */
        /* 筛选**内容**：关键词 ＋ 各条件组。外壳由下面的 FilterDrawer 出，两者分开，
         * 「同一套 .at-drawer 外壳」对创建 / 编辑 / 筛选三处才只有一个真源。
         * 控件形态沿用插件既有 chips（即时生效、无「确定」），与小程序 `.tf` 的
         * 数据驱动分组同构；功能状态机（ui.{p,t,m}Filter、set、reset）一行未动。 */
        /* ★★ 2026-11-10：补齐三组「有字段、没入口」的筛选维度 ——
         *  · 待办 / 脑图的**更新时间**：`defaultFilter().range` 与 `Core.inRange` 一直在用，
         *    `C.RANGES` 也早就在 10-constants 里登记，但面板从来没渲染过这一组
         *    ⇒ 用户只能筛状态与项目，想「只看这一周的」没有落点。
         *  · 项目的**关联 agent**：`pFilter.agentId` 同样一直被 `Core.filterProjects` 读，
         *    面板里没有这一组，而小程序 `drawers.pjAgentRowsOf()` 是有的。
         * 标签措辞与小程序 `rangeRowsOf()` 的键一致（全部 / 最近一周 / 最近一月 / 最近3个月），
         * 这里直接用 `C.RANGES` 那一份，不再手抄第二份中文名。 */
        /* ★★ 2026-11-10（轮次 10 · 用户第 5 条「三处筛选分别对齐小程序」）：
         * 组定义从 JSX 里搬出来成一张表 —— 与小程序 `utils/drawers.js` 的 `tf.groups`
         * **同构**（一组一条 `{ key, label, type, wrap, fill }`），顺序 / 措辞 / 形态
         * 逐条抄自那三处装配点：
         *   project  `status` 项目状态(chips) · `node` 节点(chips wrap) · `agentId` 关联 agent(rows)
         *   todo     `status` 待办状态(chips) · `projectId` 所属项目(rows) · `range` 更新时间(chips wrap fill)
         *   mindmap  `format` 格式(chips wrap) · `projectId` 所属项目(rows) · `range` 更新时间(chips wrap fill)
         * ⚠️「所属项目」「关联 agent」是**行组不是胶囊**：一行一个，色点 ＋ 名称 ＋ 条数。
         *    这是本轮补上的实质差距 —— 以前三组一律胶囊，项目一多就横着挤出抽屉，
         *    而且没法顺带报条数（用户得点进去数）。
         * ⚠️ 标签是「项目状态」「节点」，不是「状态」「项目节点」；措辞以 drawers.js 为准。
         * 抽表而不是三处各写一遍，是为了让判据能直接判「组 / 标签 / 形态」三样，
         * 也避免将来只改一处、另外两处悄悄漂移（小程序那边为同一个 key 漂过一次）。 */
        /* 「所属项目」行组的构造 —— 待办 / 脑图共用形状，只有计数口径不同：
         *  · 「全部」在待办读 `aliveTodos`（已删除不算，否则"全部"比各行之和还大；
         *    小程序 160 轮踩过同一个坑）、在脑图读 `mindmaps.length`。
         *  · **没有色的项目不进列表**（小程序 `if (!p.color) return`）——
         *    行首那颗点是这一组的读法，缺色的行会变成"没有信息的行"。
         * 键值：插件筛选模型里「不筛」是 `''`（`defaultFilter().projectId`），
         * 不是小程序内部用的 `'__all'`，这里保持插件自身的键、只换展示形态。 */
        function projectFilterRows(s, countOf, allCount) {
          var out = [{ key: '', name: '全部', color: '', count: allCount }]
          Core.activeProjects(s).forEach(function (p) {
            if (!p.color) return
            var c = C.colorOf(p.color)
            out.push({ key: p.id, name: p.name, color: c ? c.main : C.NONE_COLOR, count: countOf(p.id) })
          })
          return out
        }
        var FILTER_GROUPS = {
          project: [
            { key: 'status', label: '项目状态', type: 'chips', options: function () {
              return [{ key: 'active', name: '活跃' }, { key: 'archived', name: '已归档' },
                { key: 'all', name: '全部' }]
            } },
            { key: 'node', label: '节点', type: 'chips', wrap: true, options: function () {
              return [{ key: 'all', name: '全部' }].concat(C.NODES.map(function (n) {
                return { key: n, name: n }
              }))
            } },
            { key: 'agentId', label: '关联 agent', type: 'rows', options: function (s) {
              /* 每个 agent 报的是「它名下有几个项目」；「全部」报 `s.projects.length`
               * （含已归档 —— 与小程序 `pjAgentRowsOf` 同一口径，那一组管的是归属，
               *  不区分归档状态，归档是上一组的事）。 */
              return [{ key: '', name: '全部', color: '', count: s.projects.length }]
                .concat(s.agents.map(function (a) {
                  return { key: a.id, name: a.name, color: '',
                    count: s.projects.filter(function (p) { return p.agentId === a.id }).length }
                }))
            } }
          ],
          todo: [
            { key: 'status', label: '待办状态', type: 'chips', options: function () { return TODO_STATUS } },
            { key: 'projectId', label: '所属项目', type: 'rows', options: function (s) {
              return projectFilterRows(s,
                function (pid) { return Core.todosOfProject(s, pid).length },
                Core.aliveTodos(s).length)
            } },
            { key: 'range', label: '更新时间', type: 'chips', wrap: true, fill: true,
              options: function () { return C.RANGES.map(function (r) { return { key: r.key, name: r.name } }) } }
          ],
          mindmap: [
            { key: 'format', label: '格式', type: 'chips', wrap: true, options: function () {
              return [{ key: 'all', name: '全部' }].concat(C.FORMATS.map(function (x) {
                return { key: x.key, name: x.label }
              }))
            } },
            { key: 'projectId', label: '所属项目', type: 'rows', options: function (s) {
              return projectFilterRows(s,
                function (pid) { return Core.mindmapsOfProject(s, pid).length },
                s.mindmaps.length)
            } },
            { key: 'range', label: '更新时间', type: 'chips', wrap: true, fill: true,
              options: function () { return C.RANGES.map(function (r) { return { key: r.key, name: r.name } }) } }
          ]
        }

        function FilterPanel(props) {
          var s = props.s, kind = props.kind
          var key = filterKey(kind), f = s.ui[key] || defaultFilter(kind)
          function set(k, v) { var next = Object.assign({}, f); next[k] = v; var p = {}; p[key] = next; B.ui(p) }
          /* 胶囊组（`.tf-chips`）：`wrap` 才换行、`fill` 才均分两列，
           * 与小程序 `grp.wrap` / `grp.fill` 两个开关一一对应。 */
          function chips(label, k, options, opts) {
            var wrap = !!(opts && opts.wrap), fill = !!(opts && opts.fill)
            return h('div', { key: k, className: 'at-filter-group' },
              h('span', { className: 'at-filter-label' }, label),
              h('div', { className: 'at-filter-chips' + (wrap ? ' wrap' : '') }, options.map(function (o) {
                return h('button', { key: o.key, type: 'button',
                  className: 'at-filter-chip' + (fill ? ' fill' : '')
                    + (String(f[k] || '') === o.key ? ' is-on' : ''),
                  onClick: function () { set(k, o.key) } }, o.name)
              })))
          }
          /* 行组（`.tf-rows`）：色点 ＋ 名称 ＋ 条数，一行一个。
           * `o.color` 为空也照样占位（`.at-filter-dot.empty`），整列文字才对齐。 */
          function rows(label, k, options) {
            return h('div', { key: k, className: 'at-filter-group' },
              h('span', { className: 'at-filter-label' }, label),
              h('div', { className: 'at-filter-rows' }, options.map(function (o) {
                var on = String(f[k] || '') === o.key
                return h('button', { key: o.key, type: 'button',
                  className: 'at-filter-row' + (on ? ' is-on' : ''),
                  'aria-pressed': on ? 'true' : 'false',
                  onClick: function () { set(k, o.key) } },
                  h('span', { className: 'at-filter-dot' + (o.color ? '' : ' empty'),
                    style: o.color ? { background: o.color } : null }),
                  h('span', { className: 'at-filter-row-t' }, o.name),
                  h('span', { className: 'at-filter-row-n' }, String(o.count)))
              })))
          }
          return h('div', { className: 'at-filter-drawer' },
            /* ★ 搜索组：标签「搜索」＋ `.tf-sear` 那个 36 高壳（14px 图标 .45 ＋ 34 高输入框）。
             * 清空键只在有值时出现（小程序 `wx:if="{{kwText}}"`）——
             * 空框上挂一颗 ✕ 会让人以为"清空了什么东西"。 */
            h('div', { key: 'kw', className: 'at-filter-group' },
              h('span', { className: 'at-filter-label' }, '搜索'),
              h('div', { className: 'at-filter-search' },
                h(U.Icon, { name: 'search', size: 14, opacity: .45 }),
                h('input', { className: 'at-filter-input', type: 'text', value: f.kw || '',
                  placeholder: meta(kind).search, 'aria-label': '搜索',
                  onChange: function (e) { set('kw', e.target.value) } }),
                f.kw ? h('button', { type: 'button', className: 'at-filter-clear',
                  title: '清空', 'aria-label': '清空搜索',
                  onClick: function () { set('kw', '') } },
                  h(U.Icon, { name: 'close', size: 11, opacity: .65 })) : null)),
            FILTER_GROUPS[kind].map(function (g) {
              var options = g.options(s)
              return g.type === 'rows'
                ? rows(g.label, g.key, options)
                : chips(g.label, g.key, options, g)
            }))
        }

        /* 右侧展开的筛选浮层：与 FormDrawer 共用 `.at-form-mask` / `.at-drawer` 外壳，
         * 所以 85-desktop.js 的 460 贴右全高几何与令牌解绑自动生效，不在这里另写一套。
         * 头 ＝ 标题 ＋「关闭」胶囊（小程序 .tf-close：即时生效的东西不写「取消」）；
         * 体 ＝ FilterPanel；底 ＝ 「改动即时生效 · 没有「确定」」＋「清除全部筛选」。
         * 遮罩点击 / Esc（50-shell.js）/ 关闭键三条通道都只写 ui.filterKind = null。
         * ⚠️ 筛选没有提交动作 ⇒ 底栏**不用** .at-sd-submit 实心主键，否则会读成「确定」。 */
        function FilterDrawer(props) {
          var s = props.s, kind = props.kind, m = meta(kind)
          var key = filterKey(kind)
          function close() { B.ui({ filterKind: null }) }
          function reset() { var p = {}; p[key] = defaultFilter(kind); B.ui(p) }
          return h('div', null,
            h('div', { className: 'at-form-mask', onClick: close }),
            h(U.Dialog, { as: 'section', className: 'at-drawer', role: 'dialog',
              'aria-label': m.label + '筛选' },
              h('div', { className: 'at-drawer-head' },
                h('span', { className: 'at-drawer-title' }, m.label + '筛选'),
                h('button', { type: 'button', className: 'at-sd-cancel', onClick: close },
                  h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '关闭')),
              h('div', { className: 'at-drawer-body at-fd' },
                h(FilterPanel, { s: s, kind: kind })),
              h('div', { className: 'at-drawer-foot' },
                h('span', { className: 'at-filter-hint' }, '改动即时生效 · 没有「确定」'),
                h(U.Btn, { onClick: reset },
                  h(U.Icon, { name: 'refresh', size: 15, opacity: .65 }), '清除全部筛选'))))
        }

        /* ----------------------------------------------------------- list pane --- */
        function ListPane(props) {
          var s = props.s, kind = props.kind, m = meta(kind)
          var [page, setPage] = React.useState(1)
          var searchRef = React.useRef(null)
          var fKey = filterKey(kind)
          /* 关键词只有**一个真源**：`ui.{p,t,m}Filter.kw`。列表头这只框、筛选抽屉第一组、
           * `Core.filter*` 三处读同一格 —— 以前列表头另存一份本地 kw，于是"抽屉里搜 A、
           * 列表头还写着 B"这种两份口径迟早会出现。 */
          var kw = String((s.ui[fKey] || {}).kw || '')
          function setKw(v) {
            var next = Object.assign({}, s.ui[fKey] || defaultFilter(kind)); next.kw = v
            var p = {}; p[fKey] = next; B.ui(p); setPage(1)
          }
          var all = listOf(s, kind)
          var list = all
          var shown = list.slice(0, page * 20)
          var selected = selId(s, kind)
          var filterOpen = s.ui.filterKind === kind
          var picking = !!(s.ui.mmPick || s.ui.capsulePick)

          /* 选中的项不存在时自动落到第一条；不放进 render，避免渲染期写状态。 */
          React.useEffect(function () {
            var hit = Core.byId(entityList(s, kind), selId(s, kind))
            if ((!hit || hit.deletedAt || !all.some(function (x) { return x.id === hit.id })) && all.length) {
              var patch = {}; patch[m.idKey] = all[0].id; B.ui(patch)
            } else if (!all.length && selected) {
              var emptyPatch = {}; emptyPatch[m.idKey] = ''; B.ui(emptyPatch)
            }
          }, [kind, selected, all.map(function (x) { return x.id }).join('|')])
          /* 重复点导航 / 从别处跳进列表时聚焦搜索框，等价于原来「打开列表抽屉」。 */
          React.useEffect(function () {
            if (s.ui.listFocus && searchRef.current && searchRef.current.focus) {
              try { searchRef.current.focus() } catch (e) {}
            }
          }, [s.ui.listFocus])

          function pick(x) { setSel(kind, x.id) }
          function rowMeta(x) {
            if (kind === 'todo') return AT.views.projectName(s, x.projectId) + ' · ' + C.urgencyOf(x.urgency).name +
              (x.deletedAt ? ' · 已删除' : '') + (x.done ? ' · 已完成' : '') +
              (x.mindmapId ? ' · 已关联脑图' : '')
            if (kind === 'mindmap') return C.formatOf(x.format).label + ' · ' + (x.nodes || 0) + ' 节点' +
              (Core.mindmapGateOf(x) ? ' · 待完善' : '') + ' · ' + Core.atMin(x.updatedAt || x.createdAt)
            return x.node + (x.archivedAt ? ' · 已归档' : '') + ' · ' + Core.atMin(x.updatedAt || x.createdAt)
          }
          function barColor(x) {
            if (kind === 'todo') return C.urgencyOf(x.urgency).main
            if (kind === 'project') { var c = C.colorOf(x.color); return c ? c.main : 'var(--at-hairline-strong)' }
            return 'var(--at-yellow-deep)'
          }
          var filterCount = activeFilterCount(s, kind)
          /* 空态要分清「真的空」与「被筛掉」（轮次 8）：筛选生效时还写「还没有待办」，
           * 用户会以为数据丢了 —— 尤其是从项目详情带筛选跳过来、落地正好 0 条的时候。
           * 关键词与筛选各自怎么放宽也分开说，别一句「换个关键词」包打天下。 */
          var empty = (kw || filterCount)
            ? { title: '没有符合条件的内容',
              hint: kw && filterCount ? '换个关键词，或在筛选里放宽一条'
                : kw ? '换个关键词再搜一次'
                  : '当前筛选下没有内容，去「筛选」里放宽一条',
              act: '清除筛选' }
            : { title: m.empty, hint: '点击列表右上角新建', act: m.create }

          return h('section', { className: 'at-pane at-pane-list', 'aria-label': m.label + '列表' },
            h('div', { className: 'at-pane-head' },
              h(IconWithLabel, { name: m.icon, label: m.label }),
              h('span', { className: 'at-pane-count' }, list.length),
              h('span', { className: 'at-topbar-spacer' }),
              /* ★ 收起 / 展开入口只保留详情页左侧那颗页签（见 DetailPane.listToggle），
               * 列表头不再重复放一颗：两处都写 ui.listCollapsed，用户读不出区别。 */
              h(U.IconBtn, { name: 'plus', size: 15, title: m.create, label: m.create,
                onClick: function () { S.openForm(m.form, '') } })),
            h('div', { className: 'at-pane-tools' },
              h('input', { ref: searchRef, className: 'at-input', type: 'text', value: kw,
                placeholder: m.search, 'aria-label': m.search,
                onChange: function (e) { setKw(e.target.value) } }),
              h(U.Btn, { active: filterOpen,
                onClick: function () { B.ui({ filterKind: filterOpen ? null : kind }) },
                title: '在右侧展开筛选' },
                h(U.Icon, { name: 'sliders', size: 14 }), '筛选' + (filterCount ? ' ' + filterCount : ''))),
            h('div', { className: 'at-pane-scroll' },
              shown.length ? shown.map(function (x) {
                return h('button', { key: x.id, type: 'button',
                  className: 'at-pane-row' + (selected === x.id ? ' is-on' : '') +
                    (x.done ? ' is-done' : '') + (x.deletedAt ? ' is-gone' : '') +
                    (picking ? ' is-pick' : ''),
                  'aria-pressed': selected === x.id,
                  onClick: function () { pick(x) },
                  onKeyDown: function (e) {
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                    e.preventDefault()
                    var i = shown.indexOf(x) + (e.key === 'ArrowDown' ? 1 : -1)
                    if (shown[i]) {
                      setSel(kind, shown[i].id)
                      var sibling = e.key === 'ArrowDown' ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling
                      if (sibling && sibling.focus) sibling.focus()
                    }
                  } },
                  h('span', { className: 'at-pane-row-bar', style: { background: barColor(x) } }),
                  h('span', { className: 'at-pane-row-main' },
                    h('span', { className: 'at-pane-row-title' }, x.text || x.name || '（这条还是空的）'),
                    h('span', { className: 'at-pane-row-meta' },
                      kind === 'project' ? AT.views.colorDot(x.color) : null,
                      h('span', null, rowMeta(x)))),
                  kind === 'mindmap' ? h(U.Icon, { name: 'chevron-right', size: 14, opacity: .5 }) : null)
              }) : h(U.Empty, { icon: m.icon, title: empty.title, hint: empty.hint,
                action: { label: empty.act, onClick: function () {
                  if (!kw && !filterCount) { S.openForm(m.form, ''); return }
                  setKw(''); var patch = {}; patch[filterKey(kind)] = defaultFilter(kind); B.ui(patch)
                } } }),
              shown.length < list.length
                ? h(U.Btn, { onClick: function () { setPage(page + 1) } }, '加载更多（还有 ' + (list.length - shown.length) + ' 条）')
                : (list.length ? h('div', { className: 'at-muted', style: { textAlign: 'center', padding: '6px 0' } }, '已无更多信息') : null)),
            h('div', { className: 'at-pane-foot' },
              h('span', { className: 'at-muted' }, list.length + ' ' + m.unit),
              h('span', { className: 'at-muted' }, '↑ ↓ 切换 · Enter 查看')))
        }
        function IconWithLabel(props) {
          return h('span', { className: 'at-row' },
            h(U.Icon, { name: props.name, size: 18, opacity: .8 }),
            h('span', { className: 'at-pane-title' }, props.label))
        }

        /* --------------------------------------------------------- detail pane --- */
        function actionsFor(kind, s, x) {
          if (!x) return [h(U.Btn, { key: 'new', variant: 'primary',
            onClick: function () { S.openForm(meta(kind).form, '') } }, meta(kind).create)]
          /* v1.12 严格对齐小程序：操作键回到**详情内部**，页头不留重复入口。
           *   · 项目 —— 小程序详情里只有「编辑 / 取消归档」，且它就在基础信息卡右上角；
           *     页头这两颗留给"带项目预填新建"（小程序里它们在列表抽屉底部，插件没有那个抽屉）。
           *   · 待办 —— 操作是详情内那条**三态通栏动作条**（完成·导出·编辑·删除 /
           *     还原·导出·删除 / 还原）；页头再挂一排就是两套口径。
           *   · 脑图 —— 「编辑脑图信息」在画布右上浮条、「删除这张脑图」在编辑抽屉底部，
           *     页头一律不留。 */
          if (kind === 'project') {
            /* ★ 2026-11 用户口径：这两颗键原来只有文字。按小程序 `.tb-btn`
             * （app.wxss:931-946，13px/500/gap 5，项目详情「编辑」键用 13px 图标）
             * 在文字前补 `plus`；插件桌面尺寸（32 高 / 7 圆角 / gap 6）按用户要求保留。 */
            return [
              h(U.Btn, { key: 'newtodo', onClick: function () {
                S.openForm('todo', '', { preset: { projectId: x.id } })
              } }, h(U.Icon, { name: 'plus', size: 13 }), '新建待办'),
              h(U.Btn, { key: 'newmap', onClick: function () {
                S.openForm('mindmap', '', { preset: { projectId: x.id } })
              } }, h(U.Icon, { name: 'plus', size: 13 }), '新建脑图')
            ]
          }
          return []
        }
        /* 删除待办确认**只有一个真源**（62-views-b.js 的 confirmDeleteTodo）：列表行与详情页
         * 两处按钮共用它，否则「删除后去哪儿还原」这句口径会各写一份、迟早说岔
         * （v1.11 撤掉「我的 → 最近删除」时就真的岔过一次）。 */
        function confirmDeleteTodo(t) { return AT.views.confirmDeleteTodo(t) }
        function PaneHead(title, sub, actions, opts) {
          var o = opts || {}, toggle = o.listToggle
          return h('div', { className: 'at-pane-head' },
            /* 收起 / 展开键（2026-11-10 用户第 3 条）：**只要图标**、品牌黄、贴详情列左边界
             * （左缘 0 圆角），与列表头那颗 `+` 同一水平中线。文字只进 title / aria-label。
             * 皮肤在 85-desktop.js 的 `.at-detail-back`（这一层只管结构与语义）。 */
            toggle ? h('button', { type: 'button', className: 'at-detail-back',
              title: toggle.label, 'aria-label': toggle.label,
              'aria-expanded': toggle.collapsed ? 'false' : 'true',
              onClick: toggle.onClick },
              h(U.Icon, { name: toggle.collapsed ? 'chevron-right' : 'chevron-left', size: 16 })) : null,
            h('div', { style: { minWidth: 0, flex: '0 1 auto' } },
              h('div', { className: 'at-pane-title' }, title),
              sub ? h('div', { className: 'at-pane-sub' }, sub) : null),
            h('span', { className: 'at-topbar-spacer' }),
            h(U.Toolbar, null, actions))
        }
        function DetailPane(props) {
          var s = props.s, kind = props.kind, m = meta(kind)
          var x = Core.byId(entityList(s, kind), selId(s, kind))
          var w = Number(s.ui.paneWidth || 0)
          var tight = !!(w && w < 660)
          var collapsed = !!s.ui.listCollapsed
          /* 列表收起 / 展开的唯一入口。文案只保留「收起」/「展开」两个词（用户口径），
           * 详情页左缘的页签本身已经说明了作用对象。tight 档这颗仍是"返回列表"
           * （那一档是二态互斥，收起无意义），按默认保留。 */
          var listToggle = tight
            ? { collapsed: true, label: '列表', onClick: function () { B.ui({ detailOpen: false }) } }
            : { collapsed: collapsed, label: collapsed ? '展开' : '收起',
              onClick: function () { B.ui({ listCollapsed: !collapsed }) } }
          var title = x ? (x.text || x.name) : m.label
          var sub = x ? (kind === 'project' ? (x.node + (x.archivedAt ? ' · 已归档' : ''))
            : kind === 'todo' ? (AT.views.projectName(s, x.projectId) + ' · ' + C.urgencyOf(x.urgency).name)
              : ((Core.byId(s.projects, x.projectId) || {}).name || '未归属项目') + ' · ' + C.formatOf(x.format).label)
            : m.sub
          /* ★ 轮次 6：筛选搬去浮层抽屉（AT.panes.FilterDrawer，由 90-drawers.render 装配）。
           * 详情区**不再被筛选替换** —— 遮罩之下详情仍是详情，这是「弹窗抽屉」与
           * 「详情区换内容」的根本区别；关闭键也随之上移到抽屉自己的标题栏。 */
          var body = !x
            ? h(U.Empty, { icon: m.icon, title: '还没有打开过任何' + m.label,
              hint: '从左边列表里挑一个，或者新建一条',
              action: { label: m.create, onClick: function () { S.openForm(m.form, '') } } })
            : kind === 'project' ? AT.views.ProjectBody(s, x)
              : kind === 'todo' ? AT.views.TodoBody(s, x)
                : AT.mindmap.Detail(s, x)
          var detailActions = actionsFor(kind, s, x)
          return h('section', { className: 'at-pane at-pane-detail', 'aria-label': m.label + '详情' },
            PaneHead(title, sub, detailActions, { listToggle: listToggle }),
            h('div', { className: 'at-pane-body' + (x && kind === 'mindmap' ? ' is-canvas' : '') },
              body))
        }
        function Single(props) {
          var s = props.s
          return h('section', { className: 'at-pane at-pane-single' +
            (props.home ? ' is-home' : '') + widthClass(s),
            'aria-label': props.title },
            PaneHead(props.title, props.sub, props.actions),
            h('div', { className: 'at-pane-body' }, props.body))
        }

        /* -------------------------------------------------- picker bodies --- */
        /* 「为这条待办挑胶囊 / 挑脑图」——**只剩内容**，外壳（遮罩 ＋ 460 抽屉 ＋ 头 / 底栏）
         * 由 90-drawers.js 的 PickDrawer 装配，与创建 / 编辑 / 筛选同一套 .at-drawer。
         * 两条判别与小程序 `drawers.build('capsule')` / `build('mindmap')` 逐字一致：
         *   · 胶囊是**多选**：点一条只记选中，收尾由抽屉底栏的「保存」一次性提交
         *     （`B.actions.linkCapsules` → 胶囊从正常列表移出、挂到这条待办上）；
         *   · 脑图是**单选**：点一条立刻回填并关抽屉（`updateTodo({mindmapId})`），没有「确定」。
         * ⚠️ 候选口径不动：胶囊取 `Core.capsules(s)`（已关联 / 已转走 / 已删除的都不在里面），
         *    脑图只给**同项目且已完善**的那几张（跨项目关联会让"这条待办挂在别的项目的脑图上"）。
         */
        /* 入参兼容两种：作为组件（`h(Body, { s })`）或直接拿状态调（旧的
         * `AT.panes.MindmapPicker(state)` 判据仍这么用）—— 用 `ui` 在不在来分辨。 */
        function stateOf(props) { return (props && props.ui) ? props : ((props || {}).s || {}) }

        function CapsulePickBody(props) {
          var s = stateOf(props)
          var p = s.ui && s.ui.capsulePick
          if (!p) return null
          var picked = p.picked || []
          var list = Core.capsules(s)
          function toggle(id) {
            B.ui({ capsulePick: Object.assign({}, p, { picked: picked.indexOf(id) >= 0
              ? picked.filter(function (x) { return x !== id }) : picked.concat([id]) }) })
          }
          return h('div', null,
            h('div', { className: 'at-pick-note' },
              '勾选要挂到这条待办上的胶囊；保存后它们会从闪念胶囊列表移出，挂在这条待办下。'),
            list.length
              ? h('div', { className: 'at-picker-list' }, list.map(function (c) {
                var on = picked.indexOf(c.id) >= 0
                return h('button', { key: c.id, type: 'button',
                  className: 'at-picker-row' + (on ? ' is-on' : ''),
                  'aria-pressed': on, onClick: function () { toggle(c.id) } },
                  h('input', { type: 'checkbox', checked: on, readOnly: true, 'aria-label': '选中' }),
                  h('span', { style: { flex: '1 1 auto', minWidth: 0 } },
                    c.text || '（这条还是空的）'))
              }))
              : h('div', { className: 'at-pick-empty' }, '闪念胶囊里还没有待整理的内容'))
        }
        function MindmapPickBody(props) {
          var s = stateOf(props)
          var p = s.ui && s.ui.mmPick
          if (!p || !p.todoId) return null
          var todo = Core.byId(s.todos, p.todoId)
          var list = s.mindmaps.filter(function (m) {
            return !Core.mindmapGateOf(m) && todo && m.projectId === todo.projectId
          })
          return h('div', null,
            h('div', { className: 'at-pick-note' },
              '只列这个项目里已完善的脑图；点一张立刻关联，不跨项目。'),
            list.length
              ? h('div', { className: 'at-picker-list' }, list.map(function (m) {
                return h('button', { key: m.id, type: 'button', className: 'at-picker-row',
                  onClick: function () {
                    B.actions.updateTodo(p.todoId, { mindmapId: m.id })
                    B.ui({ mmPick: null })
                  } },
                  h(U.Icon, { name: 'mindmap', size: 15 }),
                  h('span', { style: { flex: '1 1 auto', minWidth: 0 } }, m.name),
                  h('span', { className: 'at-muted' }, C.formatOf(m.format).label))
              }))
              : h('div', { className: 'at-pick-empty' }, '当前项目还没有可用脑图，先新建一张'))
        }

        /* -------------------------------------------------------------- render --- */
        function Tri(s, kind) {
          return h('div', { className: 'at-panes' + widthClass(s) },
            h(ListPane, { key: 'list-' + kind, s: s, kind: kind }),
            h(DetailPane, { key: 'detail-' + kind, s: s, kind: kind }))
        }
        function render(s) {
          var active = s.ui.active
          if (active === 'overview') return h(Single, { s: s, home: true, title: '概览',
            sub: '活跃度日历 · 项目待办统计 · Agent 概况',
            actions: [
              h(U.Btn, { key: 'todo', onClick: function () { S.setView('todo') } }, '去看待办'),
              h(U.Btn, { key: 'new', variant: 'primary', onClick: function () { S.openForm('todo', '') } },
                h(U.Icon, { name: 'plus', size: 14, tone: 'ink' }), '记一条待办')
            ], body: AT.views.OverviewBody(s) })
          if (active === 'mine') return h(Single, { s: s, home: true, title: '我的',
            sub: '个人资料 · Agent · Token API',
            actions: [h(U.Btn, { key: 'back', onClick: function () { S.setView('overview') } }, '返回概览')],
            body: AT.views.MineBody(s) })
          return Tri(s, active in C.LIST_META ? active : 'todo')
        }

        AT.panes = {
          STYLE: STYLE, render: render, Tri: Tri, Single: Single,
          ListPane: ListPane, DetailPane: DetailPane, FilterPanel: FilterPanel,
          /* 组定义表也导出：判据要直接判「组 / 标签 / 形态」这三样（判求值产物，
           * 不读源码拼接），改坏一处立刻红。 */
          FILTER_GROUPS: FILTER_GROUPS,
          FilterDrawer: FilterDrawer,
          CapsulePickBody: CapsulePickBody, MindmapPickBody: MindmapPickBody,
          /* 旧名保留：外部（判据 / 预览脚本）还在按这两个名字取内容体。 */
          CapsulePicker: CapsulePickBody, MindmapPicker: MindmapPickBody,
          listOf: listOf, selId: selId, setSel: setSel, widthClass: widthClass,
          openFiltered: openFiltered
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 60-views-a.js ===== */
    ;(function (AT, React, h) {
      /* 60-views-a.js — 概览 / 项目 的「页内内容体」。
       * 头部与滚动容器由 AT.panes 统一提供，这里只产出内容，不再自带 WorkHead。
       */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text, S = AT.shell

        var STYLE = [
          /* ============ 概览（对齐 小程序前端/components/mod-overview 的 **PC / 横屏**档） ============
           * 尺寸逐值同源，改任何一条都请对着那边的 wxss 一起改：
           *   · 热力格 36 / 列 gap 6 / 行 gap 6 / 圆角 8；星期轴 36 宽、格 36 高、margin-top 18
           *     （＝周号尺 14 ＋ gap 4，让七个字与七行格子对齐）；网格高 288 ＝ 7×36＋6×6；
           *   · 热力卡 padding 20 / gap 14（`.card.heat`）、明细条 32 高 / 圆角 10 / `--surface` 底；
           *   · 项目卡：12 圆角 / 10 内边距 / gap 8，四档条贴卡底（`margin-top:auto`）、
           *     档名 9.5/500 灰、数字 17/700 档色（数字才是对齐轴，档名只是注脚）；
           *   · agent 卡：14 圆角 / 14 内边距、灰块 `--surface` 圆角 10 / padding 10 14、
           *     圆环 80（内圆 60）/ 圆心 23 / 值 19。
           * ⚠️ 颜色不走本地 hex：令牌见 40-ui 的 LIGHT/DARK（含 `--at-ring-*`）；
           *   热力 5 档与四档统计色是"随主题变的数据色"，由视图按 `AT.icons.isDark()` 现取。 */
          /* 三块之间的视觉间距 20 ＝ 小程序「容器 gap 12 ＋ `.sec-head` 上间距 8」；
           * 内容宽上限 1180 ≈ 小程序横屏的 1168。 */
          '.at-ov{display:flex;flex-direction:column;gap:20px;max-width:1180px;margin:0 auto;min-width:0}',
          '.at-ov .at-section{margin-bottom:0}',

          /* ① 活跃度日历 */
          /* 卡高按小程序 PC 那一档：`.sec-heat` 定高 496 − 区块头 42 ＝ **454**；
           * 内容 358（306 网格 ＋ 20 图例 ＋ 32 明细）＋ padding 40 ＋ 两段 gap 28 ＝ 426
           * ⇒ 余下 28 由 `space-between` 摊到两段 gap 上（各 28），
           * 所以这里是「gap 14 ＋ 最小高 454 ＋ space-between」而不是把 gap 直接写成 28：
           * 窄窗图例换行时卡要能自己长高（`min-height` 才允许），定死 gap 就长不动了。 */
          '.at-ov-heat{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
          'padding:20px;display:flex;flex-direction:column;gap:14px;justify-content:space-between;',
          'min-height:454px}',
          '.at-ov-heat-body{display:flex;flex-direction:row;gap:6px;height:306px;overflow:hidden}',
          '.at-ov-heat-axis{flex:0 0 36px;width:36px;margin-top:18px;display:flex;flex-direction:column;gap:6px}',
          '.at-ov-heat-axis-cell{width:36px;height:36px;display:flex;align-items:center;justify-content:center}',
          '.at-ov-heat-axis-t{font-size:11px;color:var(--at-muted)}',
          '.at-ov-heat-right{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
          '.at-ov-heat-scroll{width:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}',
          '.at-ov-heat-scroll::-webkit-scrollbar{width:0;height:0;display:none}',
          '.at-ov-heat-inner{width:max-content}',
          '.at-ov-heat-ruler{height:14px;display:flex;gap:6px}',
          '.at-ov-heat-ruler-cell{width:36px;flex:0 0 36px;display:flex;align-items:center;justify-content:center}',
          '.at-ov-heat-ruler-t{font-size:11px;color:var(--at-muted)}',
          '.at-ov-heat-grid{height:288px;display:flex;gap:6px}',
          '.at-ov-heat-col{width:36px;flex:0 0 36px;display:flex;flex-direction:column;gap:6px}',
          '.at-ov-heat-cell{position:relative;width:36px;height:36px;padding:0;border:0;border-radius:8px;',
          'cursor:pointer;background:var(--at-chip)}',
          /* 按下只压透明度：底色是内联的语义色阶（深浅＝活跃度），改底会与那条语义打架。 */
          '.at-ov-heat-cell:hover{opacity:.82}',
          '.at-ov-heat-mark{position:absolute;left:0;top:0;right:0;bottom:0}',
          '.at-ov-heat-mark:before,.at-ov-heat-mark:after{content:""}',
          '.at-ov-heat-mark:before,.at-ov-heat-mark:after,.at-ov-heat-mark i{position:absolute;',
          'width:6px;height:6px}',
          '.at-ov-heat-mark:before{left:7px;top:7px;border-top:2px solid var(--at-primary);',
          'border-left:2px solid var(--at-primary)}',
          '.at-ov-heat-mark:after{right:7px;bottom:7px;border-bottom:2px solid var(--at-primary);',
          'border-right:2px solid var(--at-primary)}',
          '.at-ov-heat-mark i.tr{right:7px;top:7px;border-top:2px solid var(--at-primary);',
          'border-right:2px solid var(--at-primary)}',
          '.at-ov-heat-mark i.bl{left:7px;bottom:7px;border-bottom:2px solid var(--at-primary);',
          'border-left:2px solid var(--at-primary)}',
          /* 亮档（level ≥ 3）的括标改恒墨 `--on-accent` —— 深色下那两格是亮黄，
           * 柔白括标只剩 1.25:1（浅色下 primary 与 on-accent 同值，零变化）。 */
          '.at-ov-heat-cell.is-hi .at-ov-heat-mark:before,.at-ov-heat-cell.is-hi .at-ov-heat-mark:after,',
          '.at-ov-heat-cell.is-hi .at-ov-heat-mark i{border-color:var(--at-on-accent)}',
          '.at-ov-heat-legend{display:flex;flex-direction:row;align-items:center;gap:8px;min-height:20px}',
          '.at-ov-legend-lab{font-size:12px;color:var(--at-muted);flex:0 0 auto}',
          '.at-ov-legend-scale{width:116px;height:20px;display:flex;gap:4px;flex:0 0 auto}',
          '.at-ov-legend-scale i{width:20px;height:20px;border-radius:4px;display:block}',
          '.at-ov-legend-flex{flex:1;min-width:0}',
          '.at-ov-legend-note{font-size:12px;color:var(--at-muted);white-space:nowrap}',
          '.at-ov-heat-detail{flex:0 0 32px;height:32px;border-radius:10px;background:var(--at-surface);',
          'padding:0 12px;display:flex;flex-direction:row;align-items:center;gap:8px;overflow:hidden}',
          '.at-ov-hd-strong{font-size:14px;font-weight:500;color:var(--at-primary);white-space:nowrap}',
          /* 三源分色与小程序一致：创建走蓝（`--at-blue` 在桌面被收敛成主墨，这里用补充令牌
           * `--atx-blue` 保住"两条序列要分辨"这条语义）、完成走绿、胶囊走正文灰。 */
          '.at-ov-hd-created{font-size:13px;font-weight:500;color:var(--atx-blue);white-space:nowrap}',
          '.at-ov-hd-done{font-size:13px;font-weight:500;color:var(--at-success);white-space:nowrap}',
          '.at-ov-hd-cap{font-size:13px;font-weight:500;color:var(--at-slate);white-space:nowrap}',
          /* 分隔符与末尾的「合值」走小程序 `.t-12`（13px / `--slate`）—— 不是 `--text-2`：
           * 那两支在浅色下差一档（#555A6A vs #686C7A），明细条整行读起来会轻重不一。 */
          '.at-ov-hd-sep{font-size:13px;color:var(--at-slate);flex:0 0 auto}',
          '.at-ov-hd-sum{font-size:13px;color:var(--at-slate);white-space:nowrap}',

          /* ② 项目待办统计 —— **卡里套卡**：小程序是 `.card.stats`（白底 14 圆角 / 内距 14×16）
           * 装着 `.ps-grid`，卡面自己也是白底带描边 ⇒ 这一层不能省，否则四张小卡直接浮在页面底上，
           * 与「活跃度日历」「Agent 概况」两块的容器感就断了一档。 */
          '.at-ov-stats{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
          'padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}',
          /* 列数：卡宽守在**小程序那一档**（横屏 4 列的各 276.5 与竖屏 2 列的各 355 之间），
           * 由 `minmax(250px,1fr)` 连续降级 —— 内容 1146 时正好 4 列 × 279，与小程序 276.5 同档。
           * ⚠️ 小程序只有两个**定宽画布**（1168 → 4 列 / 768 → 2 列），DSH 面板是连续宽度，
           *    所以这里会多出 3 列这一档：那是"卡宽不越界"换来的，不是漏抄 4 列。
           * `align-items:stretch` 让同一行的卡等高，四档条才能落在同一条水平线上横向比对。 */
          '.at-ov-ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));',
          'gap:10px;align-items:stretch}',
          '.at-ov-ps-cell{display:flex;min-width:0;padding:0;border:0;background:none;text-align:left;',
          'font:inherit;color:inherit;cursor:pointer}',
          '.at-ov-ps-card{flex:1 1 auto;min-width:0;background:var(--at-card);',
          'border:1px solid var(--at-hairline);border-radius:12px;padding:10px;display:flex;',
          'flex-direction:column;gap:8px}',
          '.at-ov-ps-cell:hover .at-ov-ps-card{background:var(--at-chip)}',
          '.at-ov-ps-head{display:flex;flex-direction:row;align-items:center;gap:8px}',
          '.at-ov-ps-dot{width:16px;height:16px;border-radius:999px;flex:0 0 16px}',
          '.at-ov-ps-name{flex:1;min-width:0;font-size:15px;font-weight:500;line-height:17px;',
          'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          /* 节点徽章：尺寸是概览这一档（3px 8px / 11px），颜色由视图按主题现取
           * （＝ `--u-mid-bg` / `--u-mid-t` 的浅深两套）。 */
          '.at-ov-badge{display:inline-flex;align-items:center;flex:0 0 auto;padding:3px 8px;',
          'border-radius:999px;font-size:11px;white-space:nowrap}',
          '.at-ov-ps-foot{display:flex;flex-direction:row;align-items:center;gap:6px;padding:0 2px;',
          'min-width:0;flex-wrap:wrap}',
          '.at-ov-ps-meta{font-size:11px;color:var(--at-muted);white-space:nowrap}',
          /* 分隔符走文字档 `--stone`，不借描边令牌（白底只有 1.7:1，深色下直接消失）。 */
          '.at-ov-ps-sep{font-size:11px;color:var(--at-stone)}',
          '.at-ov-ps-stat{margin-top:auto;border:1px solid var(--at-hairline);border-radius:8px;',
          'background:var(--at-card);padding:6px 8px;display:flex;flex-direction:row;align-items:center;',
          'gap:8px;flex-wrap:wrap}',
          '.at-ov-ps-s{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px}',
          '.at-ov-ps-s-t{font-size:9.5px;font-weight:500;line-height:1;color:var(--at-stone);white-space:nowrap}',
          '.at-ov-ps-s-n{font-size:17px;font-weight:700;line-height:1;letter-spacing:-.3px;',
          'font-variant-numeric:tabular-nums}',
          '.at-ov-ps-s.is-zero .at-ov-ps-s-t{color:var(--at-muted)}',
          '.at-ov-ps-s.is-zero .at-ov-ps-s-n{color:var(--at-muted);font-weight:600}',

          /* ③ Agent 概况 */
          /* 列数：小程序**横竖都是 2 列**（横屏 1168 → 各 578，竖屏 768 → 各 378，
           * 从来没出现过一行一张）⇒ 这里也**写死 2 列**、只在极窄时降为 1 列。
           * ⚠️ 别退回 `auto-fill + minmax(...)`：内容 1180 时它会切出 3 列（实测 385×3），
           *    而小程序这张卡永远是"一行两张"。 */
          '.at-ov-ag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));',
          'gap:12px;align-items:stretch}',
          '@container (max-width:660px){.at-ov-ag-grid{grid-template-columns:minmax(0,1fr)}}',
          '.at-ov-ag-card{background:var(--at-card);border:1px solid var(--at-hairline);border-radius:14px;',
          'padding:14px;display:flex;flex-direction:column;gap:10px;text-align:left;font:inherit;',
          'color:inherit;cursor:pointer}',
          '.at-ov-ag-card:hover{background:var(--at-chip)}',
          '.at-ov-ag-row1{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:10px}',
          '.at-ov-ag-name{flex:1;min-width:0;font-size:17px;font-weight:600;color:var(--at-primary);',
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-ov-ag-body{display:flex;flex-direction:row;align-items:center;gap:18px;',
          'background:var(--at-surface);border-radius:10px;padding:10px 14px}',
          '.at-ov-ag-ring-wrap{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:5px}',
          /* 圆环：`--ring-deg` 由视图 inline 下发（`Core.ringOf` 算）。
           * 第一行 `background: var(--at-ring-track)` 是不吃 conic-gradient 时的有意退化。 */
          '.at-ov-ag-ring{--ring-deg:0deg;width:80px;height:80px;border-radius:50%;',
          'background:var(--at-ring-track);background:conic-gradient(var(--at-ring-a) 0deg,',
          'var(--at-ring-b) var(--ring-deg),var(--at-ring-track) var(--ring-deg) 360deg);',
          'display:flex;align-items:center;justify-content:center}',
          '.at-ov-ag-ring-core{width:60px;height:60px;border-radius:50%;background:var(--at-surface);',
          'display:flex;flex-direction:row;align-items:center;justify-content:center}',
          '.at-ov-ag-ring-num{font-size:23px;font-weight:600;color:var(--at-primary);line-height:1}',
          '.at-ov-ag-ring-num.is-muted{font-size:13px;font-weight:500;color:var(--at-muted)}',
          '.at-ov-ag-ring-unit{font-size:11px;color:var(--at-muted);line-height:1;margin-left:2px;margin-top:8px}',
          '.at-ov-ag-ring-lab{font-size:11px;color:var(--at-muted);white-space:nowrap}',
          '.at-ov-ag-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}',
          '.at-ov-ag-mcell{display:flex;flex-direction:column;gap:3px;min-width:0}',
          '.at-ov-ag-mdiv{height:1px;background:var(--at-hairline-soft)}',
          '.at-ov-ag-lab{font-size:12px;color:var(--at-muted);white-space:nowrap}',
          '.at-ov-ag-val{font-size:19px;font-weight:600;color:var(--at-primary);white-space:nowrap;',
          'overflow:hidden;text-overflow:ellipsis}',

          /* 空态 ＝ 小程序 `.blank-box` / `.blank-box-s`（虚线框 / 居中 / 13-12 两级） */
          '.at-ov-blank{box-sizing:border-box;padding:22px 14px;border:1px dashed var(--at-hairline-strong);',
          'border-radius:12px;text-align:center;font-size:13px;font-weight:500;line-height:1.7;',
          'color:var(--at-slate)}',
          '.at-ov-blank-s{display:block;margin-top:4px;font-size:12px;font-weight:400;line-height:1.6;color:var(--at-slate)}',
          /* 窄窗只收热力卡的留白；格子尺寸不退档 —— 它本来就能横滚，缩格反而让"共 30 周"更难读。 */
          '@container (max-width:700px){.at-ov-heat{padding:14px}',
          '.at-ov-heat-legend{flex-wrap:wrap}.at-ov-legend-note{white-space:normal}}',

          /* ---- 项目页 / 详情页通用件（at-metric / at-tile 仍被 ProjectBody 使用） ---- */
          '.at-metric{display:flex;flex-direction:column;gap:4px;padding:12px 14px;',
          'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
          'box-shadow:var(--at-sh-card)}',
          '.at-metric b{font-size:22px;font-weight:600;line-height:1.2;font-family:var(--at-font-num)}',
          '.at-metric span{font-size:12px;color:var(--at-text2)}',
          '.at-tile{display:flex;flex-direction:column;gap:6px;padding:12px;',
          'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
          'box-shadow:var(--at-sh-card);text-align:left;cursor:pointer;min-width:0;font:inherit;',
          'color:var(--at-primary)}',
          '.at-tile:hover{background:var(--at-chip)}',
          '.at-tile-title{font-size:14px;font-weight:500;line-height:1.4;overflow:hidden;',
          'text-overflow:ellipsis;white-space:nowrap}',
          '.at-tile-meta{font-size:12px;color:var(--at-text2);line-height:1.5}',
          '.at-image-grid{display:flex;gap:8px;flex-wrap:wrap}',
          '.at-thumb{position:relative;width:88px;height:88px;border:1px solid var(--at-hairline);',
          'border-radius:10px;overflow:hidden;background:var(--at-chip)}',
          '.at-thumb img{width:100%;height:100%;object-fit:cover;display:block}',
          '.at-thumb-x{position:absolute;top:3px;right:3px;width:20px;height:20px;border:0;',
          'border-radius:6px;background:var(--at-mask);color:#fff;font-size:12px;',
          'line-height:20px;text-align:center;cursor:pointer}',
          '.at-add-tile{display:flex;align-items:center;justify-content:center;width:88px;height:88px;',
          'border:1px dashed var(--at-hairline-strong);border-radius:10px;background:transparent;',
          'color:var(--at-muted);cursor:pointer;font-size:12px;font-family:inherit}',
          '.at-add-tile:hover{background:var(--at-chip)}',
          '.at-thumb-x:hover{opacity:.82}',
          '.at-code{white-space:pre-wrap;word-break:break-word;',
          'font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.6;',
          'padding:11px;border:1px solid var(--at-hairline);border-radius:10px;',
          'background:var(--at-card-dim);max-height:40vh;overflow:auto}',
          '.at-capsule-mini{display:flex;flex-direction:column;gap:7px}',
          '.at-capsule-item{padding:10px 12px;border:1px solid var(--at-hairline-soft);',
          'border-radius:10px;background:var(--at-card-dim);font-size:13px;line-height:1.55}',
          '.at-section-note{font-size:12px;color:var(--at-text2);margin:-2px 0 10px}',

          /* ---- 项目详情（v1.12 严格对齐 小程序 mod-project PC 档）------------------
           * 三块：基础信息 ／ 项目待办 ／ 项目脑图。
           * 基础信息卡与待办详情那块**同构**（共用 `.at-tbd-row1` / `.at-tbd-cols` 一套类，
           * 见 62-views-b.js 的 TODO_STYLE），所以这里只补项目独有的两处：
           * 四档紧急度键 与 脑图卡（左格式简图 56×40 ＋ 右三行文字）。
           * ⚠️ 尺寸照抄小程序：简图 56×40（169 轮「简图高度加大，右侧是三行文字」）、
           *    三行文字按深浅两级灰分主次（168 轮）。 */
          '.at-pj{display:flex;flex-direction:column;gap:12px;max-width:880px;margin:0 auto;min-width:0}',
          '.at-pj .at-block-title{display:flex;align-items:center;gap:6px}',

          /* ① 四档紧急度 —— **可点筛选**（156 轮）；计数与网格同源，只数未完成。
           * 选中态不套黑色：四档各自的颜色就是身份，选中改用该档浅底 ＋ 深字。 */
          '.at-pj-stat{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}',
          '.at-pj-urgs{display:flex;gap:6px;flex-wrap:wrap}',
          '.at-pj-urg{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;',
          'border:1px solid var(--at-hairline);border-radius:999px;background:var(--at-card);',
          'font-size:12px;font-family:inherit;cursor:pointer;color:var(--at-slate)}',
          '.at-pj-urg:hover{background:var(--at-chip);border-color:var(--at-hairline-strong)}',
          '.at-pj-urg-n{font-weight:600;font-family:var(--at-font-num)}',
          '.at-pj-score{margin-left:auto;font-size:12px;color:var(--at-text2);white-space:nowrap}',

          /* ② 项目待办网格 —— 紧凑卡，逐值对齐小程序 `todo-card` 的 compact 档（`.tc.mini`）：
           *   色条 4×16 ｜ 正文 14/1.4 三行（min-height 55）｜ 标签行（无标签不渲染）
           *   ｜ 底行 `.tc-foot`：左「更新于 …」右完成圆圈。
           * ★★ 2026-11-10 用户第 3 条订正：完成圆圈原来 `align-self:center` 挂在横排的末尾 ——
           *   那是"卡片垂直中线右侧"，不是"卡片底部右侧"；底部左侧还缺「更新于」。
           *   小程序真源是**三段纵排**（`.tc-main` / `.tc-tags` / `.tc-foot`），
           *   底行 `justify-content:space-between` ＋ `margin-top:auto` 把时间与圆圈压到卡底。
           *   ⚠️ 别再用绝对定位把圆圈钉右下角 —— 底行是它和时间共用的那条线，两者必须同一行。 */
          '.at-pj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}',
          '.at-pj-todo{display:flex;flex-direction:column;gap:8px;padding:10px;',
          'border:1px solid var(--at-hairline);border-radius:14px;background:var(--at-card);',
          'box-shadow:var(--at-sh-card);text-align:left;font:inherit;color:var(--at-primary);',
          'cursor:pointer;min-width:0}',
          '.at-pj-todo:hover{background:var(--at-chip)}',
          /* `.tc-main`：色条与正文横排、顶对齐。 */
          '.at-pj-todo-head{display:flex;gap:8px;align-items:flex-start;min-width:0}',
          /* `.tc.mini .tc-bar` 是 **16** 高（不是常规档的 20）—— 项目页这张卡本来就矮，
           * 色条再按 20 会超过两行文字的视觉重心。 */
          '.at-pj-todo-bar{width:4px;min-width:4px;flex:0 0 4px;height:16px;min-height:0;',
          'border-radius:2px;align-self:flex-start;margin-top:2px}',
          /* `.tc.mini .tc-text`：14px / 1.4 / 三行；`min-height:55` 让 1 行与 3 行的卡片底行齐平。 */
          '.at-pj-todo-t{flex:1 1 auto;min-width:0;font-size:14px;line-height:1.4;display:-webkit-box;',
          '-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;',
          'min-height:55px}',
          /* `.tc-tags`：列缝 6、行缝 8、可换行。没有标签时整行不渲染（`wx:if` 同端口径）。 */
          '.at-pj-todo-meta{display:flex;align-items:center;column-gap:6px;row-gap:8px;flex-wrap:wrap;min-width:0}',
          /* `.tc-foot`：左时间右圆圈；`margin-top:auto` 吸到卡底（卡等高时才有区别）。 */
          '.at-pj-todo-foot{display:flex;align-items:center;justify-content:space-between;gap:4px;',
          'margin-top:auto;min-width:0}',
          /* `.tc.mini .tc-meta-t`：11 / 15，数字用等宽族，`white-space:nowrap` 不许折行。 */
          '.at-pj-todo-at{font-family:var(--at-font-num);font-size:11px;line-height:15px;',
          'color:var(--at-text2);flex:0 0 auto;white-space:nowrap}',
          /* ★★ 2026-11-10：项目网格卡上的**完成圆圈**（小程序 `.tc-st`）：16×16、1.5 描边。
           * 未完成就是**空心圆**（小程序没画勾 —— 画了淡勾会被读成"已完成"）；
           * 勾掉之后从这张卡上消失（已完成的待办不进 `openTodos`）。 */
          '.at-pj-done{flex:0 0 auto;width:16px;height:16px;padding:0;',
          'display:inline-flex;align-items:center;justify-content:center;border-radius:50%;',
          'border:1.5px solid var(--at-hairline-strong);background:var(--at-card);',
          'color:var(--at-muted);cursor:pointer;box-sizing:border-box}',
          '.at-pj-done:hover{border-color:var(--at-yellow);background:var(--at-yellow-soft);',
          'color:var(--at-primary)}',
          /* 标签行按小程序 `.tchip` 口径：chip 底、无描边、圆角 999（原来是 18 高描边小方块，
           * 在灰底上读成"四颗边框按钮"）。 */
          '.at-pj-tag{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;',
          'border-radius:999px;border:0;background:var(--at-chip);',
          'font-size:11px;color:var(--at-slate);white-space:nowrap}',
          '.at-pj-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px}',
          '.at-pj-foot .at-muted{font-size:12px}',

          /* ③ 项目脑图卡 —— 左简图 56×40、右三行（名称 / N 节点·M 层 / 更新于 YYYY年M月D日） */
          '.at-pj-mms{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}',
          '.at-pj-mm{display:flex;align-items:flex-start;gap:10px;padding:10px 11px;',
          'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-card);',
          'box-shadow:var(--at-sh-card);text-align:left;font:inherit;color:var(--at-primary);',
          'cursor:pointer;min-width:0}',
          '.at-pj-mm:hover{background:var(--at-chip)}',
          '.at-pj-mm-thumb{width:56px;height:40px;flex:0 0 56px;object-fit:contain;border-radius:6px}',
          '.at-pj-mm-b{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 auto}',
          '.at-pj-mm-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;',
          'text-overflow:ellipsis}',
          '.at-pj-mm-stat{font-size:11px;color:var(--at-text2)}',
          '.at-pj-mm-time{font-size:11px;color:var(--at-muted)}',
          /* 空态 —— 与待办详情那三块同一套：一句虚线说明（居中、12 圆角） */
          '.at-pj-empty{grid-column:1/-1;font-size:13px;color:var(--at-text2);padding:14px 12px;',
          'border:1px dashed var(--at-hairline-strong);border-radius:10px;text-align:center}'
        ].join('')

        function WorkHead() { return null }   /* 头部由页内面板统一渲染，保留兼容出口 */
        /* --------------------------------------------------- 格式简图（48×34）---
         * 逐行移植 小程序 `utils/formats.js` 的六张结构简图 —— 项目脑图卡左侧那块
         * 56×40 的缩略图就是它（168 / 169 轮定稿）。为什么搬而不是"重画一张像的"：
         * 这六张是按各自 layout 的真实形状校准过的（树形图是「左上根 + 竖总线 + 直角短枝」、
         * 时间轴是「竖轴 + 左右交替」、鱼骨图「鱼头在左 + 长骨斜插」），重画必漂。
         * ⚠️ 三色按主题**现取**（深色 root 换柔白、leaf 换卡面深灰）：钉死浅色那份时，
         *    深色卡上主墨根块对比 ≈1.06、白叶块成一粒粒白点，整张图读不出结构（247 轮实拍过）。
         */
        var THUMB_LIGHT = { line: '#C7CAD5', root: '#1C1C1E', leaf: '#FFFFFF' }
        var THUMB_DARK = { line: '#858783', root: '#EEEDEA', leaf: '#202123' }
        var T_ROOT_W = 12, T_ROOT_H = 6, T_LEAF_W = 10, T_LEAF_H = 5, T_R = 2

        function nz(v) { return Math.round(v * 10) / 10 }
        function tBox(p, x, y, w, h, fill, stroke) {
          var s = stroke === false ? ''
            : ' stroke="' + (stroke || p.line) + '" stroke-width="0.7"'
          return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
            '" rx="1.4" fill="' + fill + '"' + s + '/>'
        }
        function tWire(p, d) {
          return '<path d="' + d + '" fill="none" stroke="' + p.line + '" stroke-width="1"/>'
        }
        function tLine(x1, y1, x2, y2) {
          return 'M' + nz(x1) + ' ' + nz(y1) + ' L' + nz(x2) + ' ' + nz(y2)
        }
        function tCurve(x1, y1, x2, y2) {
          if (Math.abs(y1 - y2) < 0.5) return tLine(x1, y1, x2, y2)
          var mx = nz((x1 + x2) / 2)
          return 'M' + nz(x1) + ' ' + nz(y1) + ' C' + mx + ' ' + nz(y1) + ' ' + mx + ' ' +
            nz(y2) + ' ' + nz(x2) + ' ' + nz(y2)
        }
        function tElbowLR(bx, y1, ex, y2) {
          var s = ex > bx ? 1 : -1, v = y2 > y1 ? 1 : -1
          if (Math.abs(ex - bx) < 0.5) return tLine(bx, y1, bx, y2)
          var r = Math.min(T_R, Math.abs(ex - bx), Math.abs(y2 - y1))
          return 'M' + nz(bx) + ' ' + nz(y1) +
            ' L' + nz(bx) + ' ' + nz(y2 - v * r) +
            ' Q' + nz(bx) + ' ' + nz(y2) + ' ' + nz(bx + s * r) + ' ' + nz(y2) +
            ' L' + nz(ex) + ' ' + nz(y2)
        }
        function tElbowTB(x1, y1, x2, y2) {
          if (Math.abs(x2 - x1) < 0.5) return tLine(x1, y1, x2, y2)
          var s = x2 > x1 ? 1 : -1, my = nz((y1 + y2) / 2)
          var r = Math.min(T_R, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2)
          return 'M' + nz(x1) + ' ' + nz(y1) +
            ' L' + nz(x1) + ' ' + nz(my - r) +
            ' Q' + nz(x1) + ' ' + my + ' ' + nz(x1 + s * r) + ' ' + my +
            ' L' + nz(x2 - s * r) + ' ' + my +
            ' Q' + nz(x2) + ' ' + my + ' ' + nz(x2) + ' ' + nz(my + r) +
            ' L' + nz(x2) + ' ' + nz(y2)
        }
        function tUri(inner) {
          return 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="34" viewBox="0 0 48 34">' +
            inner + '</svg>')
        }

        var _thumb = null, _thumbSig = ''
        function formatThumbs() {
          var p = AT.icons.isDark() ? THUMB_DARK : THUMB_LIGHT
          var sig = p.line + p.root + p.leaf
          if (_thumb && _thumbSig === sig) return _thumb
          _thumbSig = sig
          _thumb = {
            /* 思维导图：根居中，一级分成左右两列，曲线向两侧外扩 */
            mindmap: tUri(
              tWire(p, tCurve(18, 17, 13, 8.5)) + tWire(p, tCurve(18, 17, 13, 25.5)) +
              tWire(p, tCurve(30, 17, 35, 8.5)) + tWire(p, tCurve(30, 17, 35, 25.5)) +
              tBox(p, 3, 6, T_LEAF_W, T_LEAF_H, p.leaf) + tBox(p, 3, 23, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 35, 6, T_LEAF_W, T_LEAF_H, p.leaf) + tBox(p, 35, 23, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 18, 14, T_ROOT_W, T_ROOT_H, p.root, false)),
            /* 逻辑图：根在左、一级同列上下排开 */
            logic: tUri(
              tWire(p, tCurve(21.5, 17, 28.5, 7.5)) + tWire(p, tCurve(21.5, 17, 28.5, 17)) +
              tWire(p, tCurve(21.5, 17, 28.5, 26.5)) +
              tBox(p, 28.5, 5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 28.5, 14.5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 28.5, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 9.5, 14, T_ROOT_W, T_ROOT_H, p.root, false)),
            /* 组织结构图：根在顶，横向总线把三支挂到下一层 */
            org: tUri(
              tWire(p, tElbowTB(24, 8, 8, 24)) + tWire(p, tElbowTB(24, 8, 24, 24)) +
              tWire(p, tElbowTB(24, 8, 40, 24)) +
              tBox(p, 3, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 19, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 35, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 18, 2, T_ROOT_W, T_ROOT_H, p.root, false)),
            /* 树形图：根在左上，竖总线从根底垂下，一级向右缩进 */
            tree: tUri(
              tWire(p, tElbowLR(17, 8, 27, 12.5)) + tWire(p, tElbowLR(17, 8, 27, 19.5)) +
              tWire(p, tElbowLR(17, 8, 27, 26.5)) +
              tBox(p, 27, 10, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 27, 17, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 27, 24, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 11, 2, T_ROOT_W, T_ROOT_H, p.root, false)),
            /* 时间轴：根在顶部，竖轴往下，一级左右交替 */
            timeline: tUri(
              tWire(p, tElbowLR(24, 9, 29, 12.5)) + tWire(p, tElbowLR(24, 9, 19, 20)) +
              tWire(p, tElbowLR(24, 9, 29, 27.5)) +
              tBox(p, 29, 10, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 9, 17.5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 29, 25, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 18, 3, T_ROOT_W, T_ROOT_H, p.root, false)),
            /* 鱼骨图：鱼头在左，主脊横贯，两根长骨斜拉，一级在骨线远端 */
            fishbone: tUri(
              tWire(p, tLine(12, 17, 47, 17)) +
              tWire(p, tLine(15, 17, 26, 5)) + tWire(p, tLine(28, 17, 39, 29)) +
              tWire(p, tLine(20.5, 11, 23, 11)) + tWire(p, tLine(33, 11, 35.5, 11)) +
              tWire(p, tLine(33.5, 23, 37, 23)) +
              tBox(p, 35.5, 8.5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 23, 8.5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 37, 20.5, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 21, 0, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 34, 29, T_LEAF_W, T_LEAF_H, p.leaf) +
              tBox(p, 1, 14, T_ROOT_W, T_ROOT_H, p.root, false))
          }
          return _thumb
        }
        function formatThumb(key) {
          var T = formatThumbs()
          return T[key] || T.mindmap || ''
        }

        function colorDot(colorKey) {
          var c = C.colorOf(colorKey)
          return h('span', { className: 'at-dot', style: { background: c ? c.main : 'var(--at-stone)' } })
        }
        function urgencyChip(key) {
          var u = C.urgencyOf(key)
          var color = AT.icons.isDark()
            ? ({ urgent: '#FF8285', mid: '#F1BC65', low: '#7CB5EE', hold: '#B4B8C2' }[u.key] || u.main) : u.main
          return h(U.Chip, { color: color, dot: color }, u.name)
        }
        function projectName(s, id) {
          var p = Core.byId(s.projects, id)
          return p ? p.name : '未归属'
        }
        function openDetail(kind, id) {
          var patch = { active: kind, drawer: null, form: null, detailOpen: true,
            capsulePick: null, mmPick: null, imgView: null, capView: null }
          patch[kind === 'project' ? 'projectId' : kind === 'todo' ? 'todoId' : 'mindmapId'] = id
          if (kind === 'todo') {
            var todo = Core.byId(B.get().todos, id)
            patch.tFilter = { kw: '', status: todo && todo.done ? 'done' : 'open', projectId: '', range: 'all' }
          } else if (kind === 'project') {
            var project = Core.byId(B.get().projects, id)
            patch.pFilter = { kw: '', status: project && project.archivedAt ? 'archived' : 'active', node: 'all', agentId: '' }
          } else patch.mFilter = { kw: '', projectId: '', format: 'all', range: 'all' }
          B.ui(patch)
        }

        /* ------------------------------------------------------------- 概览 ---
         * 严格对齐 小程序前端/components/mod-overview 的 **PC / 横屏**那一档。
         * 三块自上而下、整页可滚（第 59 轮撤掉横屏「下半区两栏」之后就是这个结构）：
         *   ① 活跃度日历 —— 采样三源：待办创建 ＋ 待办完成 ＋ 胶囊创建（图只画合值）
         *   ② 项目待办统计 —— 有色项目的卡网格（色点 · 节点 · 脑图数 · agent · 四档条数）
         *   ③ Agent 概况 —— 距离重置圆环 ＋ 每月套餐 / 承担项目
         * 数据一律来自 `Core.overviewProjectCards()` / `Core.agentCardViews()`（与小程序同一份装配）。
         */
        /* 星期轴文案与小程序 `mock.WEEK_CN` 逐字一致（「周一」而不是「一」）——
         * 36 宽的轴列正好装下 3 个 11px 字。 */
        var WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        var HEAT_STEP = 42                  /* 36 格 ＋ 6 gap —— 与小程序 CELL + GAP 同值 */

        /* 热力 5 档 / 四档统计色都是"随主题变的数据色" ⇒ 每次渲染现取。
         * ⚠️ 不许在进页面时定格一次（小程序 187 轮报过：切深色后热力图还是浅色那五格）。 */
        function heatLegend() { return AT.icons.isDark() ? C.HEAT.legendDark : C.HEAT.legend }
        function urgencyInk(key) {
          var dark = AT.icons.isDark()
          return (dark && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].main : C.urgencyOf(key).main
        }
        /* 节点徽章 ＝ 小程序 `.badge.badge-node`（`--u-mid-bg` / `--u-mid-t` 两档现取）。
         * ⚠️ `C.URGENCY` 是数组（只有 `urgencyOf(key)` 能按 key 取）；`C.URGENCY_DARK` 才是按 key 的对象。 */
        function nodeBadgeStyle() {
          var base = AT.icons.isDark() ? C.URGENCY_DARK.mid : C.urgencyOf('mid')
          return { background: base.soft, color: base.text }
        }

        /* ① 活跃度日历 —— 星期轴 ＋ 30 周 × 7 天方格 ＋ 图例 ＋ 选中日明细条 */
        function HeatSection(props) {
          var s = props.s
          var weeks = Text.heatWeeks(s)
          var sel = s.ui.heatSelected || Text.todayCell(s)
          var day = sel ? Text.heatDay(s, sel.week, sel.day) : null
          var legend = heatLegend()
          var scrollRef = React.useRef(null)
          var visState = React.useState(0)
          var visible = visState[0], setVisible = visState[1]
          var inited = React.useRef(false)

          /* 初始停在**最右端**（最新那几周）；之后窗口变化只重算「当前显示 N 周」，
           * 不把用户拽回最新端 —— 与小程序 2026-10-27（F25）那条口径一致。 */
          React.useEffect(function () {
            var el = scrollRef.current
            if (!el) return
            function sync() {
              var n = Math.max(0, Math.floor((el.clientWidth + 6) / HEAT_STEP))
              setVisible(function (cur) { return cur === n ? cur : n })
              if (!inited.current) {
                el.scrollLeft = el.scrollWidth - el.clientWidth
                inited.current = true
              }
            }
            sync()
            if (typeof window === 'undefined' || !window.ResizeObserver) return
            var ro = new window.ResizeObserver(sync)
            try { ro.observe(el) } catch (e) { return }
            return function () { try { ro.disconnect() } catch (e) {} }
          }, [])

          return h('div', { className: 'at-ov-heat' },
            h('div', { className: 'at-ov-heat-body' },
              h('div', { className: 'at-ov-heat-axis' }, WEEKDAYS.map(function (w) {
                return h('div', { key: w, className: 'at-ov-heat-axis-cell' },
                  h('span', { className: 'at-ov-heat-axis-t' }, w))
              })),
              h('div', { className: 'at-ov-heat-right' },
                h('div', { className: 'at-ov-heat-scroll', ref: scrollRef },
                  h('div', { className: 'at-ov-heat-inner' },
                    h('div', { className: 'at-ov-heat-ruler' }, weeks.map(function (w) {
                      return h('div', { key: w.key, className: 'at-ov-heat-ruler-cell' },
                        h('span', { className: 'at-ov-heat-ruler-t' }, String(w.weekNo)))
                    })),
                    h('div', { className: 'at-ov-heat-grid', role: 'grid' }, weeks.map(function (w) {
                      return h('div', { key: w.key, className: 'at-ov-heat-col' }, w.days.map(function (d) {
                        var on = !!sel && sel.week === w.weekNo && sel.day === d.dayIndex
                        return h('button', {
                          key: d.dayIndex, type: 'button',
                          className: 'at-ov-heat-cell' + (d.level >= 3 ? ' is-hi' : '') + (on ? ' is-sel' : ''),
                          style: { background: legend[d.level] },
                          title: d.label + ' · 创建 ' + d.created + ' 条 / 完成 ' + d.completed +
                            ' 条 / 胶囊 ' + d.capsule + ' 条 · 合值 ' + d.sum,
                          'aria-label': d.label + ' 合值 ' + d.sum,
                          'aria-pressed': on ? 'true' : 'false',
                          onClick: function () { B.ui({ heatSelected: { week: w.weekNo, day: d.dayIndex } }) }
                        }, on ? h('span', { className: 'at-ov-heat-mark' },
                          h('i', { className: 'tr' }), h('i', { className: 'bl' })) : null)
                      }))
                    })))))),
            h('div', { className: 'at-ov-heat-legend' },
              h('span', { className: 'at-ov-legend-lab' }, '少'),
              h('span', { className: 'at-ov-legend-scale' }, legend.map(function (c, i) {
                return h('i', { key: i, style: { background: c } })
              })),
              h('span', { className: 'at-ov-legend-lab' }, '多'),
              h('span', { className: 'at-ov-legend-flex' }),
              h('span', { className: 'at-ov-legend-note' },
                '共 ' + weeks.length + ' 周' +
                (visible ? ' · 当前显示最近 ' + visible + ' 周' : '') + ' · 向右滑动看更早')),
            /* 明细条：默认就落在今天那一格 ⇒ 页面上不存在"未选中"的空态（第 59 轮）。 */
            day ? h('div', { className: 'at-ov-heat-detail' },
              h('span', { className: 'at-ov-hd-strong' }, day.label + ' · 第 ' + day.weekNo + ' 周'),
              h('span', { className: 'at-ov-hd-sep' }, '·'),
              h('span', { className: 'at-ov-hd-created' }, '创建 ' + day.created + ' 条'),
              h('span', { className: 'at-ov-hd-sep' }, '/'),
              h('span', { className: 'at-ov-hd-done' }, '完成 ' + day.completed + ' 条'),
              h('span', { className: 'at-ov-hd-sep' }, '/'),
              h('span', { className: 'at-ov-hd-cap' }, '胶囊 ' + day.capsule + ' 条'),
              h('span', { className: 'at-ov-hd-sep' }, '·'),
              h('span', { className: 'at-ov-hd-sum' }, '合值 ' + day.sum)) : null)
        }

        /* ② 项目待办统计 —— 项目卡网格（复用项目卡本体，FR-5.2）
         * ⚠️ 卡面**不表达分数**：分数只承担排序（FR-5.2），表达交给四档条数。 */
        function ProjectSection(props) {
          var cards = Core.overviewProjectCards(props.s)
          /* 空态与网格是**同一张 `.card.stats` 的两个分支**（小程序模板里 `wx:if` / `wx:else`）——
           * 空态若裸放在页面上就少了这层卡，与上下两块的容器感不齐。 */
          return h('div', { className: 'at-ov-stats' }, cards.length
            ? h('div', { className: 'at-ov-ps-grid' }, cards.map(function (p) {
              return h('button', { key: p.id, type: 'button', className: 'at-ov-ps-cell',
                onClick: function () { openDetail('project', p.id) } },
                h('div', { className: 'at-ov-ps-card' },
                  h('div', { className: 'at-ov-ps-head' },
                    h('span', { className: 'at-ov-ps-dot', style: { background: p.color } }),
                    h('span', { className: 'at-ov-ps-name', title: p.name }, p.name),
                    h('span', { className: 'at-ov-badge', style: nodeBadgeStyle() }, p.node)),
                  h('div', { className: 'at-ov-ps-foot' },
                    h('span', { className: 'at-ov-ps-meta' }, p.mindmaps + ' 张脑图'),
                    p.agentName ? h('span', { className: 'at-ov-ps-sep' }, '·') : null,
                    p.agentName ? h('span', { className: 'at-ov-ps-meta' }, p.agentName) : null,
                    !p.total ? h('span', { className: 'at-ov-ps-sep' }, '·') : null,
                    !p.total ? h('span', { className: 'at-ov-ps-meta' }, '暂无待办') : null),
                  h('div', { className: 'at-ov-ps-stat' }, p.statChips.map(function (c) {
                    return h('div', { key: c.key, className: 'at-ov-ps-s' + (c.n ? '' : ' is-zero') },
                      h('span', { className: 'at-ov-ps-s-t' }, c.name),
                      h('span', { className: 'at-ov-ps-s-n atx-num',
                        style: c.n ? { color: urgencyInk(c.key) } : null }, String(c.n)))
                  }))))
            }))
            : h('div', { className: 'at-ov-blank' }, '还没有带颜色的活跃项目 —— 项目着色后会出现在这里'))
        }

        /* ③ Agent 概况 —— 卡面与「我的」页 agent 卡同源（157 轮定稿：圆环做主角）。
         * ⚠️ 概览**有意不渲染「关联项目」气泡行**：色点＋项目名的完整清单在本页是重复信息
         * （「项目待办统计」的卡上已经全有），`projectCount` 那个数就够了。 */
        function AgentSection(props) {
          var list = Core.agentCardViews(props.s)
          if (!list.length) {
            return h('div', { className: 'at-ov-blank' },
              h('span', null, '还没有 agent 档案。'),
              h('span', { className: 'at-ov-blank-s' }, '去「我的」新建一个，填上每月套餐与额度重置日即可。'))
          }
          return h('div', { className: 'at-ov-ag-grid' }, list.map(function (a) {
            return h('button', { key: a.id, type: 'button', className: 'at-ov-ag-card',
              onClick: function () { S.setView('mine') } },
              h('div', { className: 'at-ov-ag-row1' },
                h('span', { className: 'at-ov-ag-name', title: a.name }, a.name)),
              h('div', { className: 'at-ov-ag-body' },
                h('div', { className: 'at-ov-ag-ring-wrap' },
                  h('span', { className: 'at-ov-ag-ring', style: { '--ring-deg': a.ringDeg + 'deg' } },
                    h('span', { className: 'at-ov-ag-ring-core' },
                      h('span', { className: 'at-ov-ag-ring-num atx-num' + (a.resetMuted ? ' is-muted' : '') },
                        a.resetNum),
                      a.resetUnit ? h('span', { className: 'at-ov-ag-ring-unit' }, a.resetUnit) : null)),
                  h('span', { className: 'at-ov-ag-ring-lab' }, '距离重置')),
                h('div', { className: 'at-ov-ag-meta' },
                  h('div', { className: 'at-ov-ag-mcell' },
                    h('span', { className: 'at-ov-ag-lab' }, '每月套餐'),
                    h('span', { className: 'at-ov-ag-val atx-num' }, String(a.monthlyQuota))),
                  h('span', { className: 'at-ov-ag-mdiv' }),
                  h('div', { className: 'at-ov-ag-mcell' },
                    h('span', { className: 'at-ov-ag-lab' }, '承担项目'),
                    h('span', { className: 'at-ov-ag-val atx-num' }, a.projectCount + ' 项')))))
          }))
        }

        function OverviewBody(s) {
          return h('div', { className: 'at-ov' },
            h(U.Section, { title: '活跃度日历', icon: 'calendar-b' }, h(HeatSection, { key: 'heat', s: s })),
            h(U.Section, { title: '项目待办统计', icon: 'chart-b' }, h(ProjectSection, { key: 'ps', s: s })),
            h(U.Section, { title: 'Agent 概况', icon: 'robot-b' }, h(AgentSection, { key: 'ag', s: s })))
        }

        /* ------------------------------------------------------------- 项目 --- */
        /* 中文日期 —— 与小程序 `store.cnDate` 同口径：`2026年10月9日`。
         * 169 轮用户口径：「'更新于10-09' 太不正式了」。别退回 atMin 的 `10-09`。 */
        function cnDate(v) {
          if (!v) return ''
          var d = new Date(String(v).replace(/-/g, '/'))
          if (isNaN(d.getTime())) return String(v).slice(0, 10)
          return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
        }

        /* 项目详情 = 小程序 mod-project 的三块（PC 档）：
         *   ① 基础信息（色点·名称·徽章 / 备注 / 所属 agent ＋ 项目概要 两组并排）
         *   ② 项目待办（四档紧急度可点筛选 ＋ 只读综合紧急度 ＋ 网格 ＋ 底行）
         *   ③ 项目脑图（格式简图 ＋ 名称/N 节点·M 层/更新于 中文日期 ＋ 底行）
         * ⚠️ 「编辑 / 取消归档」在**基础信息卡右上角**（小程序就是这么放的）：
         *    162 轮撤掉「···」之后，那颗键是归档的唯一入口，页头不要再挂一份。
         * ⚠️ 四档筛选是**页内临时态**，写 `ui.detailUrg = { pid, key }`：带上项目 id
         *    才能在切换项目时自动归零，不会出现"选了紧急、换项目后网格空着"的假空态。
         */
        function ProjectBody(s, p) {
          if (!p) return h(U.Empty, { icon: 'project', title: '还没有打开过任何项目',
            hint: '从左边列表里挑一个，或者新建一个项目',
            action: { label: '新建项目', onClick: function () { S.openForm('project', '') } } })
          var sum = Core.projectSummary(s, p.id)
          var st = Core.statOfProject(s, p.id)
          var score = Core.scoreOf(s, p.id)
          var agent = Core.byId(s.agents, p.agentId)
          var pColor = C.colorOf(p.color) ? C.colorOf(p.color).main : 'var(--at-stone)'
          var du = s.ui.detailUrg
          var urg = (du && du.pid === p.id) ? du.key : ''
          var allOpen = Core.todosOfProject(s, p.id).filter(function (t) { return !t.done })
          var openTodos = urg ? allOpen.filter(function (t) { return t.urgency === urg }) : allOpen
          var maps = Core.mindmapsOfProject(s, p.id)
          /* ★★ 2026-11-10：脑图卡**只铺最近 6 张**（小程序 `mod-project.js` 的
           * `mms.slice(0, cols * MM_ROWS)`，MM_ROWS=3；PC 宽窗 2 列 ⇒ 6）。
           * 改前是全量铺开 —— 一个项目攒十几张脑图时，这一块把详情页拉得很长，
           * 而下面还有「查看全部」这个真正的列表入口。 */
          var tiles = maps.slice(0, 6)
          function setUrg(k) { B.ui({ detailUrg: { pid: p.id, key: urg === k ? '' : k } }) }
          /* 点完成圆圈 → **先确认再勾**（小程序 166 轮那条口径：网格里一下点掉太容易误触，
           * 「已完成 / 取消」两颗键说了算）。插件这边用全局确认框承载同一句话，
           * 不做卡内浮层：整张卡本身是按钮，卡内再嵌一层会多一套定位与层级。 */
          function markDone(t) {
            S.openConfirm({ title: '标记为已完成？',
              body: '它会离开这张网格、进「已完成」；在待办列表的「已完成」档里可以还原。',
              confirmText: '已完成', danger: false,
              onConfirm: function () { B.actions.toggleTodo(t.id) } })
          }
          function inkOf(k) {
            return (AT.icons.isDark() && C.URGENCY_DARK[k]) ? C.URGENCY_DARK[k].main : C.urgencyOf(k).main
          }
          /* 底行文案随筛选走（156 轮）：有档位时报「紧急 2 条（未完成共 5 条）」，
           * 否则报全量 —— 不然筛选生效时左边还在报总数，读起来像"卡片丢了"。 */
          var footStat = urg
            ? (C.urgencyOf(urg).name + ' ' + (st[urg] || 0) + ' 条（未完成共 ' + allOpen.length + ' 条）')
            : ('未完成 ' + sum.open + ' 条 · 已完成 ' + sum.done + ' 条')

          return h('div', { className: 'at-pj' },
            /* ① 基础信息 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'info-b', size: 16 }), '基础信息'),
              h('div', { className: 'at-tbd-row1' },
                h('span', { className: 'at-tbd-dot', style: { background: pColor } }),
                h('span', { className: 'at-tbd-name' }, p.name),
                p.archivedAt
                  ? h('span', { className: 'at-tbd-badge arch' }, '已归档')
                  : h('span', { className: 'at-tbd-badge', style: nodeBadgeStyle() }, p.node),
                h('button', { type: 'button', className: 'at-tbd-tb',
                  onClick: function () {
                    if (p.archivedAt) { B.actions.archiveProject(p.id, false); return }
                    S.openForm('project', p.id)
                  } },
                  h(U.Icon, { name: p.archivedAt ? 'undo' : 'edit', size: 13 }),
                  p.archivedAt ? '取消归档' : '编辑')),
              h('div', { className: 'at-tbd-remark' + (p.remark ? '' : ' none') },
                p.remark || '未填写备注'),
              h('div', { className: 'at-tbd-cols' },
                h('div', { className: 'at-tbd-group' },
                  h('span', { className: 'at-tbd-group-t' }, '所属 agent'),
                  agent
                    ? h('div', { className: 'at-tbd-pair' },
                      h('button', { type: 'button', className: 'at-tbd-agent',
                        title: '去看「我的 · Agent」',
                        onClick: function () { S.setView('mine') } },
                        h('span', { className: 'at-tbd-agent-n' }, agent.name)),
                      h('span', { className: 'at-tbd-sep' }),
                      h('div', { className: 'at-tbd-cell' },
                        h('span', { className: 'at-tbd-lab' }, '距离重置'),
                        /* 「距离重置」文案的唯一真源在 62-views-b.js（待办详情也要用同一句
                         * 「今天 / N 天 / 未填」）。这里只读 AT.views 上的那一份，
                         * 不另抄一个副本 —— 两处各写一遍必然会漂成两种口径。
                         * ⚠️ 别写成 `V.resetInOf`：本模块没有 V 这个别名（v1.12 真栽过，
                         * 症状是项目详情整块抛 ReferenceError）。 */
                        h('span', { className: 'at-tbd-val' }, AT.views.resetInOf(agent))))
                    : h('div', { className: 'at-tbd-pair' },
                      h('span', { className: 'at-tbd-agent-none' }, '未关联 agent'))),
                h('div', { className: 'at-tbd-group' },
                  h('span', { className: 'at-tbd-group-t' }, '项目概要'),
                  h('div', { className: 'at-tbd-pair' },
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '未完成待办'),
                      h('span', { className: 'at-tbd-val' }, sum.open + ' 条')),
                    h('span', { className: 'at-tbd-sep' }),
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '已完成待办'),
                      h('span', { className: 'at-tbd-val' }, sum.done + ' 条')),
                    h('span', { className: 'at-tbd-sep' }),
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '项目脑图'),
                      h('span', { className: 'at-tbd-val' }, sum.mindmaps + ' 张')))))),

            /* ② 项目待办 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'todo-b', size: 16 }), '项目待办'),
              h('div', { className: 'at-pj-stat' },
                h('div', { className: 'at-pj-urgs' }, C.URGENCY.map(function (c) {
                  var on = urg === c.key
                  var color = (AT.icons.isDark() && C.URGENCY_DARK[c.key]) ? C.URGENCY_DARK[c.key] : c
                  return h('button', { key: c.key, type: 'button',
                    className: 'at-pj-urg' + (on ? ' is-on' : ''),
                    'aria-pressed': on,
                    style: on ? { background: color.soft, borderColor: color.main, color: color.text } : null,
                    onClick: function () { setUrg(c.key) } },
                    h('span', null, c.name),
                    h('span', { className: 'at-pj-urg-n' }, st[c.key] || 0))
                })),
                /* 综合紧急度是**只读**读数，不参与筛选（156 轮）。 */
                h('span', { className: 'at-pj-score' }, '综合紧急度 ' + score + ' 分')),
              openTodos.length
                ? h('div', { className: 'at-pj-grid' }, openTodos.map(function (t) {
                  var caps = Core.capsulesOfTodo(s, t.id).length
                  var imgs = (t.images || []).length
                  var tags = (t.mindmapId ? 1 : 0) + (imgs ? 1 : 0) + (caps ? 1 : 0)
                  return h('button', { key: t.id, type: 'button', className: 'at-pj-todo',
                    onClick: function () { openDetail('todo', t.id) } },
                    /* 段一 `.tc-main`：色条 ＋ 正文 */
                    h('span', { className: 'at-pj-todo-head' },
                      h('span', { className: 'at-pj-todo-bar', style: { background: inkOf(t.urgency) } }),
                      h('span', { className: 'at-pj-todo-t' }, t.text)),
                    /* 段二 `.tc-tags`：没有标签时整段不渲染（小程序 `wx:if` 同口径），
                     * 否则卡上会多出一条 0 高的空行、底行被顶上去 8px。 */
                    tags ? h('span', { className: 'at-pj-todo-meta' },
                      t.mindmapId ? h('span', { className: 'at-pj-tag' },
                        h(U.Icon, { name: 'mindmap', size: 11 }), '脑图') : null,
                      imgs ? h('span', { className: 'at-pj-tag' },
                        h(U.Icon, { name: 'album', size: 11 }), imgs + ' 张图') : null,
                      caps ? h('span', { className: 'at-pj-tag' },
                        h(U.Icon, { name: 'bolt', size: 11 }), caps + ' 条胶囊') : null) : null,
                    /* 段三 `.tc-foot`：左「更新于 …」右完成圆圈 —— 用户第 3 条要的正是这一行。
                     * 时间走 `Core.atMin`（截到分钟），与待办详情页「创建于 …」同一个格式化函数。 */
                    h('span', { className: 'at-pj-todo-foot' },
                      h('span', { className: 'at-pj-todo-at' },
                        '更新于 ' + (Core.atMin(t.updatedAt || t.createdAt) || '—')),
                      /* 完成圆圈：`span[role=button]` 而不是 `<button>` —— 外层卡片本身就是 button，
                       * button 里嵌 button 是非法结构（浏览器会把内层提前闭合）。 */
                      h('span', { className: 'at-pj-done', role: 'button', tabIndex: 0,
                        title: '标记为已完成', 'aria-label': '标记为已完成',
                        onClick: function (e) { e.stopPropagation(); markDone(t) },
                        onKeyDown: function (e) {
                          if (e.key !== 'Enter' && e.key !== ' ') return
                          e.preventDefault(); e.stopPropagation(); markDone(t)
                        } })))
                }))
                : h('div', { className: 'at-pj-empty' },
                  urg ? '这一档暂时没有未完成的待办' : '这个项目没有未完成的待办'),
              h('div', { className: 'at-pj-foot' },
                h('span', { className: 'at-muted' }, footStat),
                /* 跳过去只看「已完成」——走筛选模型的唯一入口（AT.panes.openFiltered）：
                 * 落地后列表页的筛选键会显示「筛选 2」、抽屉里「待办状态 · 已完成」与
                 * 「所属项目 · 本项」都亮着，清除也只有「清除全部筛选」一处。 */
                h('button', { type: 'button', className: 'at-tbd-tb',
                  onClick: function () {
                    AT.panes.openFiltered('todo', { status: 'done', projectId: p.id })
                  } },
                  h(U.Icon, { name: 'list', size: 13 }), '已完成待办'))),

            /* ③ 项目脑图 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'mindmap-b', size: 16 }), '项目脑图'),
              maps.length
                ? h('div', { className: 'at-pj-mms' }, tiles.map(function (m) {
                  return h('button', { key: m.id, type: 'button', className: 'at-pj-mm',
                    onClick: function () { openDetail('mindmap', m.id) } },
                    h('img', { className: 'at-pj-mm-thumb', src: formatThumb(m.format),
                      alt: C.formatOf(m.format).label }),
                    h('span', { className: 'at-pj-mm-b' },
                      h('span', { className: 'at-pj-mm-name' }, m.name),
                      h('span', { className: 'at-pj-mm-stat' },
                        (m.nodes || 0) + ' 节点 · ' + (m.depth || 0) + ' 层'),
                      h('span', { className: 'at-pj-mm-time' },
                        '更新于 ' + cnDate(m.updatedAt || m.createdAt))))
                }))
                : h('div', { className: 'at-pj-empty' },
                  '还没有脑图 —— 点右上角「新建脑图」开始画一张'),
              h('div', { className: 'at-pj-foot' },
                h('span', { className: 'at-muted' }, '脑图总数 ' + maps.length +
                  (maps.length > tiles.length ? ' · 显示最近 ' + tiles.length + ' 张' : '')),
                /* 同上：只看本项目脑图 = mFilter.projectId，不再另设 listScope。 */
                h('button', { type: 'button', className: 'at-tbd-tb',
                  onClick: function () {
                    AT.panes.openFiltered('mindmap', { projectId: p.id })
                  } },
                  h(U.Icon, { name: 'list', size: 13 }), '查看全部'))))
        }

        /* 兼容旧调用点：不再自带头部与滚动容器。 */
        function OverviewView(s) { return h('div', { className: 'at-pane-body' }, OverviewBody(s)) }
        function ProjectView(s) { return h('div', { className: 'at-pane-body' },
          ProjectBody(s, Core.byId(s.projects, s.ui.projectId))) }

        AT.views = {
          STYLE: STYLE, WorkHead: WorkHead, colorDot: colorDot, urgencyChip: urgencyChip,
          projectName: projectName, openDetail: openDetail,
          OverviewBody: OverviewBody, OverviewView: OverviewView,
          ProjectBody: ProjectBody, ProjectView: ProjectView
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 62-views-b.js ===== */
    ;(function (AT, React, h) {
      /* 62-views-b.js — 待办 / 我的 的「页内内容体」＋ 图片工具函数。 */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text,
          S = AT.shell, V = AT.views, P = AT.panes

        /* ==========================================================================
           「我的」页样式 —— 严格对齐 小程序前端/components/mod-mine 的 **PC / 横屏**档。
           · 区块头直接用 U.Section（＝ 小程序 .sec-head：16 图标 + 16/600 标题 + 右端动作）；
           · 半幅白卡 / 空态 / agent 圆环与「两行数」复用概览 60-views-a.js 的 .at-ov-*，
             两页卡面同一份装配（小程序 store.agentCardViews() 就是这么定的）；
           · 逐值同源：资料卡头像 56 / 圆角 16 / 名字 21；卡片 14 圆角 14 内距；
             圆环 80（内圆 60）/ 圆心 23 / 值 19；余额 23/600；二维码瓦片 132（内区 116）；
           · 颜色只走 --at-* 令牌，不裸写 hex；二维码底 --at-qr 跨主题恒白。
           ========================================================================== */
        var MINE_STYLE = [
          '.at-mi{display:flex;flex-direction:column;gap:20px;max-width:1180px;margin:0 auto;min-width:0}',
          '.at-mi .at-section{margin-bottom:0}',
          '.at-mi-card{background:var(--at-card);border:1px solid var(--at-hairline);',
          'border-radius:14px;padding:14px;box-shadow:var(--at-sh-card);box-sizing:border-box;min-width:0}',
          /* 与概览 .at-ov-ag-grid 同一把尺：宽窗两列，窄窗自动落一列 */
          '.at-mi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));',
          'gap:12px;align-items:stretch}',
          /* ★★★ 下面三条 button 规则一律写 `.at-mi .at-mi-*`（0,2,0）。
           * 40-ui.js 的复位是 `.at-root button{font:inherit;color:inherit}`（0,1,1），
           * 而主面板 styleTag 走 themeCss+U.STYLE、不注入 08-style 的零特异度 BASE_CSS
           * ⇒ 单类着色会被压成「继承主墨」，深底按钮的中文标签就成了深字压深底、看不见。
           * 别把前缀去掉（v1.1 胶囊层踩过同一个坑，当时是改复位；这里不能动全局复位）。
           * 区块头右端小按钮 ＝ 小程序 .sec-btn.dark（26 高 / 8 圆角 / 反白图标） */
          '.at-mi .at-mi-sec-btn{height:26px;padding:0 10px;border-radius:8px;background:var(--at-solid);',
          'border:1px solid var(--at-solid);color:var(--at-on-solid);font-size:13px;font-weight:500;',
          'display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;',
          'cursor:pointer;font-family:inherit}',
          '.at-mi .at-mi-sec-btn:hover{opacity:.82}',
          /* 卡内浅色小键 ＝ 小程序 .tb-btn（28 高 / 8 圆角 / 13/500 次墨） */
          '.at-mi .at-mi-tb{height:28px;padding:0 10px;border-radius:8px;background:var(--at-card);',
          'border:1px solid var(--at-hairline);color:var(--at-slate);font-size:13px;font-weight:500;',
          'display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;',
          'cursor:pointer;font-family:inherit;flex:0 0 auto}',
          '.at-mi .at-mi-tb:hover{background:var(--at-chip)}.at-mi-tb.icon{width:28px;padding:0}',
          '.at-mi-acts{display:flex;align-items:center;gap:6px;flex:0 0 auto}',
          '.at-mi-flex{flex:1;min-width:0}',

          /* ① 个人资料 */
          '.at-mi-me{display:flex;flex-direction:row;align-items:center;gap:14px;padding:12px}',
          '.at-mi-avatar{width:56px;height:56px;border-radius:16px;background:var(--at-chip);',
          'border:1px solid var(--at-hairline);display:flex;align-items:center;justify-content:center;',
          'overflow:hidden;flex:0 0 auto}',
          '.at-mi-avatar img{display:block;width:56px;height:56px;object-fit:cover}',
          '.at-mi-me-name{flex:0 1 auto;min-width:0;font-size:21px;font-weight:600;',
          'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',

          /* ② Agent 卡：圆环 / 每月套餐 / 承担项目直接挂 .at-ov-ag-*（与概览逐值同源） */
          '.at-mi-ag{display:flex;flex-direction:column;gap:10px}',
          /* 关联项目气泡行 —— 小程序「我的」页有、概览有意不渲染（mod-overview.wxml 282-287） */
          '.at-mi .at-mi-chips{display:flex;flex-direction:row;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}',
          '.at-mi .at-mi-chip{max-width:100%;min-width:0;height:26px;padding:0 10px 0 8px;border-radius:999px;',
          'background:var(--at-surface);border:0;display:inline-flex;align-items:center;gap:6px;',
          'color:var(--at-slate);font-family:inherit;cursor:pointer}',
          '.at-mi .at-mi-chip:hover{background:var(--at-chip)}',
          '.at-mi .at-mi-chip.is-arc{background:var(--at-card);border:1px dashed var(--at-hairline-strong)}',
          '.at-mi-dot-sm{width:8px;height:8px;border-radius:50%;flex:0 0 8px}',
          '.at-mi .at-mi-chip-t{font-size:12px;font-weight:500;color:var(--at-slate);white-space:nowrap;',
          'min-width:0;overflow:hidden;text-overflow:ellipsis}',
          '.at-mi .at-mi-chip-arc{font-size:11px;color:var(--at-muted);flex:0 0 auto}',
          '.at-mi-none{font-size:12px;color:var(--at-muted)}',

          /* ③ Token API：余额是这张卡的主角，没数时那个大字位改成一句状态说明 */
          '.at-mi-tk{display:flex;flex-direction:column;gap:10px}',
          '.at-mi-tk-name{flex:1;min-width:0;font-size:15px;font-weight:500;color:var(--at-primary);',
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-mi-bal{display:flex;flex-direction:row;align-items:baseline;justify-content:space-between;gap:8px}',
          '.at-mi-bal-v{font-size:23px;font-weight:600;color:var(--at-primary);white-space:nowrap;',
          'font-variant-numeric:tabular-nums}',
          '.at-mi-bal-pending{font-size:15px;font-weight:500;color:var(--at-text2)}',
          '.at-mi-bal-warn{color:var(--at-danger)}',
          '.at-mi-status{font-size:12px;color:var(--at-danger);flex:0 0 auto}',
          '.at-mi-foot{display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0;',
          'font-size:11px;color:var(--at-muted)}',
          '.at-mi-err{font-size:11px;color:var(--at-danger);line-height:1.5}',

          /* ④ 应用提示：定义表在左、二维码在右（132 瓦片 + 8 静区） */
          '.at-mi-tip{display:flex;flex-direction:row;align-items:center;gap:18px}',
          '.at-mi-tip-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}',
          '.at-mi-tip-row{display:flex;flex-direction:row;gap:10px}',
          '.at-mi-tip-k{flex:0 0 auto;white-space:nowrap;font-size:12px;font-weight:700;',
          'line-height:22px;color:var(--at-slate-strong)}',
          '.at-mi-tip-v{flex:1;min-width:0;font-size:13px;line-height:22px;color:var(--at-slate)}',
          '.at-mi-qr{flex:0 0 auto;width:132px;display:flex;flex-direction:column;align-items:center;gap:8px}',
          '.at-mi-qr-tile{width:132px;height:132px;padding:8px;box-sizing:border-box;',
          'border-radius:12px;background:var(--at-qr)}',
          '.at-mi-qr-img{display:block;width:116px;height:116px;object-fit:contain}',
          '.at-mi-qr-cap{font-size:11px;line-height:16px;color:var(--at-stone);white-space:nowrap}',

          '@container (max-width:700px){.at-mi-grid{grid-template-columns:1fr}',
          '.at-mi-tip{flex-direction:column;align-items:stretch}.at-mi-qr{align-self:center}}'
        ].join('')

        /* ==========================================================================
           待办详情 —— 严格对齐 小程序前端/components/mod-todo 的 **PC / 横屏**档。
           六区块、固定读序（230 轮定稿）：
             ① 所属项目（色点·名称·徽章 / 备注 / 所属 agent ＋ 项目概要 两组并排）
             ② 操作（三态通栏动作条：完成·导出·编辑·删除 / 还原·导出·删除 / 还原）
             ③ 待办信息（紧急度色条 ＋ 档名 ＋ 互斥徽章 ＋ 创建于/完成于 ＋ 正文）
             ④ 闪念胶囊（220 宽卡 · 正文封 3 行 · ✕ 取消关联 · 末尾「＋ 选择胶囊」）
             ⑤ 图片（160×112 格 · n/N 角标 · ✕ · 末尾「＋ 添加图片」）
             ⑥ 关联脑图（只读整图 240 高 / 空态一句话 ＋ 整宽键）
           ⚠️ 第 4/5/6 块**常显**：它们各自带着一个动作，区块消失就等于动作消失。
           ⚠️ 尺寸全部照抄小程序 wxss，改这里前先回 `mod-todo.wxss` 核一遍。
           ========================================================================== */
        var TODO_STYLE = [
          '.at-tbd{display:flex;flex-direction:column;gap:12px;max-width:880px;margin:0 auto;min-width:0}',
          /* 区块头 ＝ 小程序 `.sec-head`：16 图标 ＋ 标题，同一条基线 */
          '.at-tbd .at-block-title{display:flex;align-items:center;gap:6px}',

          /* ① 所属项目 */
          '.at-tbd-row1{display:flex;align-items:center;gap:8px;min-width:0}',
          '.at-tbd-dot{width:14px;height:14px;border-radius:50%;flex:0 0 14px}',
          '.at-tbd-name{font-size:16px;font-weight:600;min-width:0;white-space:nowrap;',
          'overflow:hidden;text-overflow:ellipsis}',
          '.at-tbd-badge{display:inline-flex;align-items:center;height:20px;padding:0 7px;',
          'border-radius:6px;font-size:11px;font-weight:500;white-space:nowrap;flex:0 0 auto}',
          '.at-tbd-badge.arch{background:var(--at-chip);color:var(--at-text2)}',
          '.at-tbd-badge.done{background:var(--at-success-bg);color:var(--at-success-t)}',
          '.at-tbd-badge.gone{background:var(--at-danger);color:var(--at-on-danger)}',
          '.at-tbd-tb{margin-left:auto;flex:0 0 auto;height:28px;padding:0 10px;border-radius:8px;',
          'background:var(--at-card);border:1px solid var(--at-hairline);color:var(--at-slate);',
          'font-size:12px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;',
          'gap:4px;white-space:nowrap;cursor:pointer;font-family:inherit}',
          '.at-tbd-tb:hover{background:var(--at-chip)}',
          '.at-tbd-remark{margin-top:10px;font-size:13px;line-height:1.6;color:var(--at-text2);',
          'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
          '.at-tbd-remark.none{color:var(--at-muted)}',
          '.at-tbd-cols{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}',
          '.at-tbd-group{flex:1 1 250px;min-width:0}',
          '.at-tbd-group-t{display:block;font-size:12px;font-weight:500;color:var(--at-text2);',
          'margin-bottom:6px}',
          '.at-tbd-pair{display:flex;align-items:stretch;border-radius:10px;background:var(--at-surface);',
          'border:1px solid var(--at-hairline-soft);overflow:hidden;min-width:0}',
          '.at-tbd-cell{flex:1 1 0;min-width:0;padding:9px 10px;display:flex;flex-direction:column;gap:2px}',
          '.at-tbd-lab{font-size:11px;color:var(--at-muted);white-space:nowrap}',
          '.at-tbd-val{font-size:14px;font-weight:600;font-family:var(--at-font-num);white-space:nowrap;',
          'overflow:hidden;text-overflow:ellipsis}',
          '.at-tbd-sep{width:1px;flex:0 0 1px;background:var(--at-hairline-soft);margin:8px 0}',
          '.at-tbd-agent{flex:1 1 0;min-width:0;padding:9px 10px;display:flex;align-items:center;',
          'cursor:pointer;font:inherit;text-align:left;border:0;background:transparent}',
          '.at-tbd-agent:hover{background:var(--at-chip)}',
          '.at-tbd-agent-n{font-size:15px;font-weight:600;min-width:0;white-space:nowrap;',
          'overflow:hidden;text-overflow:ellipsis}',
          '.at-tbd-agent-none{font-size:13px;color:var(--at-muted);padding:9px 10px;display:block}',

          /* ② 操作 —— 三态通栏动作条 */
          '.at-tbd-ops{display:flex;gap:6px;padding:4px;border-radius:10px;background:var(--at-chip)}',
          '.at-tbd-ops.solo{background:transparent;padding:0;justify-content:flex-start}',
          '.at-tbd-op{flex:1 1 0;min-width:0;height:36px;display:inline-flex;align-items:center;',
          'justify-content:center;gap:5px;border:0;border-radius:8px;background:transparent;',
          'color:var(--at-slate);font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;',
          'white-space:nowrap}',
          '.at-tbd-op:hover{background:var(--at-chip)}',
          '.at-tbd-op.is-main{background:var(--at-yellow);color:var(--at-on-accent);font-weight:600}',
          '.at-tbd-op.is-main:hover{background:var(--at-yellow);opacity:.82}',
          '.at-tbd-op.is-main:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
          '.at-tbd-op.is-danger{color:var(--at-danger)}',
          '.at-tbd-ops.solo .at-tbd-op{flex:0 0 auto;padding:0 24px}',

          /* ③ 待办信息 */
          '.at-tbd-hero-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
          '.at-tbd-flag{width:4px;height:16px;border-radius:2px;flex:0 0 4px}',
          '.at-tbd-urg{font-size:13px;font-weight:600}',
          '.at-tbd-at{margin-left:auto;font-size:11px;color:var(--at-muted);white-space:nowrap}',
          '.at-tbd-text{margin-top:12px;font-size:17px;line-height:1.7;letter-spacing:-.2px;',
          'white-space:pre-wrap;overflow-wrap:anywhere;color:var(--at-primary)}',

          /* ④ 闪念胶囊 */
          '.at-tbd-caps{display:flex;flex-wrap:wrap;gap:8px}',
          '.at-tbd-cap{position:relative;width:220px;min-height:96px;display:flex;flex-direction:column;',
          'gap:6px;padding:10px 12px;border:1px solid var(--at-hairline);border-radius:10px;',
          'background:var(--at-card-dim);font:inherit;text-align:left;',
          'color:var(--at-primary);box-sizing:border-box}',
          '.at-tbd-cap-add{cursor:pointer}',
          '.at-tbd-cap-add:hover{background:var(--at-chip)}',
          /* 正文右侧必须给 ✕ 让位（小程序 .cap-t 逐值）：24 圆 ＋ right:6 会盖住第一行末尾。 */
          '.at-tbd-cap-t{font-size:13px;line-height:1.55;padding-right:22px;',
          'display:-webkit-box;-webkit-line-clamp:3;',
          '-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}',
          '.at-tbd-cap-img{width:100%;max-height:88px;object-fit:cover;border-radius:6px;display:block}',
          '.at-tbd-cap-time{font-size:11px;color:var(--at-muted);margin-top:auto}',
          /* ★★ 轮次 17：两颗 ✕ 逐值对齐小程序 .cap-del / .img-del —— 24 实心圆 / 36 透明热区 /
             反白 w-close 14。改前是 20 圆、无热区，且图标传 tone:'w'（iconSrc 只认 'white'），
             浅色档拿到墨色 close.svg ⇒ 黑叉压在 --at-solid 深底上，看着就是个黑方块。
             ⚠️ 热区只许用透明伪元素外扩，不许用 padding 撑（会把视觉圆点一起放大）。 */
          '.at-tbd-cap-x,.at-tbd-img-x{position:absolute;top:6px;right:6px;z-index:2;',
          'width:24px;height:24px;border:0;border-radius:999px;background:var(--at-solid);',
          'color:var(--at-on-solid);display:inline-flex;align-items:center;justify-content:center;',
          'cursor:pointer;padding:0}',
          '.at-tbd-cap-x::after,.at-tbd-img-x::after{content:"";position:absolute;',
          'left:50%;top:50%;width:36px;height:36px;transform:translate(-50%,-50%);',
          'border-radius:999px}',
          '.at-tbd-cap-add{display:flex;flex-direction:column;align-items:center;justify-content:center;',
          'gap:6px;border-style:dashed;background:transparent;color:var(--at-muted);font-size:13px}',

          /* ⑤ 图片 */
          '.at-tbd-imgs{display:flex;flex-wrap:wrap;gap:8px}',
          '.at-tbd-img{position:relative;width:160px;height:112px;border:1px solid var(--at-hairline);',
          'border-radius:10px;overflow:hidden;background:var(--at-chip);cursor:pointer;padding:0}',
          '.at-tbd-img img{width:100%;height:100%;object-fit:cover;display:block}',
          '.at-tbd-img-no{position:absolute;left:6px;bottom:5px;font-size:10px;color:var(--at-on-solid);',
          'background:rgba(0,0,0,.45);border-radius:4px;padding:0 4px}',
          /* ✕ 与胶囊卡那颗共用上面 `.at-tbd-cap-x,.at-tbd-img-x` 的 24 / 36 同款规则。 */
          '.at-tbd-img-add{display:flex;flex-direction:column;align-items:center;justify-content:center;',
          'gap:5px;border-style:dashed;background:transparent;color:var(--at-muted);font-size:12px}',

          /* 空态：一句虚线说明 ＋ 整宽大键 —— 胶囊 / 图片 / 脑图三块**共用这一套** */
          '.at-tbd-blank{font-size:13px;color:var(--at-text2);padding:14px 12px;',
          'border:1px dashed var(--at-hairline-strong);border-radius:10px;text-align:center}',
          '.at-tbd-blank-acts{margin-top:10px;display:flex;gap:8px}',
          '.at-tbd-lg{flex:1 1 auto;height:40px;display:inline-flex;align-items:center;',
          'justify-content:center;gap:6px;border:1px solid var(--at-hairline);border-radius:10px;',
          'background:var(--at-card);color:var(--at-slate);font-size:14px;font-weight:500;',
          'font-family:inherit;cursor:pointer;white-space:nowrap}',
          '.at-tbd-lg:hover{background:var(--at-chip)}',
          '.at-tbd-cap-x:hover,.at-tbd-img-x:hover{opacity:.82}',
          /* ★★ 2026-11-10：胶囊卡 / 图片格**可点开查看**（小程序 mod-todo 的两层模态）。
           * 改前它们只是静态块，但 `.at-tbd-img` 早就写着 cursor:pointer —— 点了没反应。 */
          '.at-tbd-cap:not(.at-tbd-cap-add),.at-tbd-img:not(.at-tbd-img-add){cursor:pointer}',
          /* 按下/悬停反馈沿用标准三档里的 .82（verify-standard FB-01 只认 .82 / .78 / .4）。 */
          '.at-tbd-cap:not(.at-tbd-cap-add):hover,.at-tbd-img:not(.at-tbd-img-add):hover{opacity:.82}',

          /* 详情内的查看层（图片放大 / 胶囊全文）—— 与小程序 `.viewer` 同一套读法：
           * 暗遮罩 ＋ 白卡 ＋ 右上 ✕ ＋ 底行翻页（只有图片有翻页）。 */
          '.at-tbd-viewer{position:fixed;inset:0;z-index:160;display:flex;align-items:center;',
          'justify-content:center;padding:24px;background:rgba(17,17,17,.55)}',
          '.at-tbd-viewer-box{width:min(760px,100%);max-height:100%;min-width:0;display:flex;',
          'flex-direction:column;background:var(--at-card);border-radius:16px;',
          'box-shadow:0 24px 64px rgba(0,0,0,.35);overflow:hidden}',
          '.at-tbd-viewer-top{display:flex;align-items:center;gap:10px;padding:12px 14px;',
          'border-bottom:1px solid var(--at-hairline)}',
          '.at-tbd-viewer-t{flex:1 1 auto;min-width:0;font-size:14px;font-weight:600;',
          'color:var(--at-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-tbd-viewer-x{flex:0 0 auto;width:28px;height:28px;padding:0;border:0;border-radius:50%;',
          'background:var(--at-chip);color:var(--at-slate);font:inherit;font-size:13px;',
          'cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
          '.at-tbd-viewer-x:hover{background:var(--at-hairline)}',
          '.at-tbd-viewer-body{min-height:0;padding:14px;overflow:auto;display:flex;',
          'align-items:center;justify-content:center;background:var(--at-surface)}',
          '.at-tbd-viewer-photo{display:block;max-width:100%;max-height:min(62vh,560px);',
          'object-fit:contain;border-radius:10px}',
          '.at-tbd-viewer-body.is-text{align-items:stretch;justify-content:flex-start;',
          'flex-direction:column;gap:10px;background:var(--at-card);max-height:66vh}',
          '.at-tbd-cv-t{font-size:15px;line-height:1.75;white-space:pre-wrap;',
          'overflow-wrap:anywhere;color:var(--at-primary);user-select:text}',
          '.at-tbd-cv-pic{display:block;width:100%;padding:0;border:0;background:transparent;',
          'cursor:zoom-in}',
          '.at-tbd-cv-img{display:block;width:100%;border-radius:10px}',
          '.at-tbd-cv-time{font-size:11px;color:var(--at-muted)}',
          '.at-tbd-viewer-nav{display:flex;gap:8px;padding:10px 14px;',
          'border-top:1px solid var(--at-hairline)}',
          '.at-tbd-viewer-btn{flex:1 1 0;height:34px;display:inline-flex;align-items:center;',
          'justify-content:center;gap:5px;border:1px solid var(--at-hairline);border-radius:8px;',
          'background:var(--at-card);color:var(--at-slate);font:inherit;font-size:13px;',
          'font-weight:500;cursor:pointer}',
          '.at-tbd-viewer-btn:hover:not(:disabled){background:var(--at-chip)}',
          '.at-tbd-viewer-btn:disabled{opacity:.4;cursor:default}',

          /* ⑥ 关联脑图 */
          '.at-tbd-mm-box{position:relative;height:240px;border:1px solid var(--at-hairline-soft);',
          'border-radius:10px;overflow:hidden;background:var(--at-surface);cursor:pointer}',
          '.at-tbd-mm-info{display:flex;align-items:center;justify-content:space-between;gap:8px;',
          'padding:10px 0 0;min-width:0}',
          '.at-tbd-mm-name{font-size:14px;font-weight:600;min-width:0;white-space:nowrap;',
          'overflow:hidden;text-overflow:ellipsis}',
          '.at-tbd-mm-meta{font-size:11px;color:var(--at-muted);white-space:nowrap;flex:0 0 auto}',
          '.at-tbd-mm-acts{display:flex;gap:8px;margin-top:10px}',

          /* 回收站提示 */
          /* 回收站提示是状态说明，不是破坏性动作：危险色只作字色，不整块铺底（规范 T-04） */
          '.at-tbd-note{padding:10px 12px;border-radius:10px;background:var(--at-card-dim);',
          'border:1px solid var(--at-hairline);color:var(--at-danger);font-size:12px;line-height:1.6}'
        ].join('')

        function pickImage(cb) {
          var input = document.createElement('input')
          input.type = 'file'; input.accept = 'image/*'
          input.onchange = function () { if (input.files && input.files[0]) cb(input.files[0]) }
          input.click()
        }
        function imgSrc(s, uri) {
          if (!uri) return ''
          if (/^(blob:|https?:\/\/|data:)/.test(uri)) return uri
          return Text.fileUrl(s.ui.apiBase, uri)
        }

        /* v1.12：原「交给 Agent（写入 DSH / 复制 Markdown / 导出设置）」整块撤掉 ——
         * 用户 2026-11-07 明确「严格只留小程序那六区块」。写入 DSH / 复制上下文的
         * 能力仍在侧栏与胶囊层，但待办详情不再有第七块。
         * 「导出」这颗键保留在小程序那一排三态动作条里（它本来就在那里）。 */

        /* ------------------------------------------------------------- 待办 --- */
        /* 「距离重置」文案 —— 与小程序 `store.resetInOf` 逐字一致：今天 / N 天 / 未填。
         * ⚠️ 不要在这三个分支里自己加「还剩」之类的措辞，两页会读成两种口径。 */
        function resetInOf(a) {
          if (!a) return ''
          var d = Core.daysUntilReset(a.quotaResetAt)
          if (d === null) return '未填'
          return d <= 0 ? '今天' : d + ' 天'
        }
        /* 节点徽章 ＝ 小程序 `.badge.badge-node`（`--u-mid-bg` / `--u-mid-t` 两档现取）。
         * 每次都现取，不在进页面时定格一次（切深色后徽章还是浅色底是踩过的坑）。 */
        function nodeBadgeStyle() {
          var base = AT.icons.isDark() ? C.URGENCY_DARK.mid : C.urgencyOf('mid')
          return { background: base.soft, color: base.text }
        }
        function urgencyInk(key) {
          return (AT.icons.isDark() && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].main : C.urgencyOf(key).main
        }
        function urgencyInkText(key) {
          return (AT.icons.isDark() && C.URGENCY_DARK[key]) ? C.URGENCY_DARK[key].text : C.urgencyOf(key).text
        }

        /* 六区块、固定读序（对齐 小程序 mod-todo PC 档 · 230 轮定稿）：
         *   ① 所属项目 → ② 操作 → ③ 待办信息 → ④ 闪念胶囊 → ⑤ 图片 → ⑥ 关联脑图
         * ⚠️ ④⑤⑥ **常显**：它们各自带一个动作（选择胶囊 / 添加图片 / 关联脑图），
         *    区块一消失，那个动作就没有落点了。
         * ⚠️ 已删除那一档只剩「还原」：④⑤⑥ 里的加/删入口一律不渲染
         *    （小程序的守卫是 `wx:if="{{!detail.deleted}}"`，这里同一套）。 */
        /* ---- 详情内的两个查看层（2026-11-10 补）--------------------------------
         * 小程序 mod-todo 里这两处是**模态层**：图片格点开 `.viewer`（可左右翻），
         * 胶囊卡点开全文层（正文可滚、里面的图还能再看大图）。插件原来点图片、点胶囊卡
         * **什么都不发生**（`.at-tbd-img` 还挂着 cursor:pointer）—— 想看清一张图、
         * 读完一条长口述都没有落点。
         * 状态照本工程既有做法写进 ui（与 ui.heatSelected / ui.detailUrg 同一套），
         * 不把 TodoBody 改成有 hooks 的组件：它被 DetailPane 当**普通函数**调用，
         * 一旦在里面用 useState，钩子就挂到调用者身上（本工程踩过：见 70-mindmap 的 Preview 注）。
         *   ui.imgView = { title, urls: [src…], index }   ← 待办图片 / 胶囊配图共用一层
         *   ui.capView = { todoId, id }                   ← 胶囊全文层（带图）
         * 关闭通道三条：右上 ✕、点遮罩（onPointerDown 判 target）、Esc（50-shell.js）。
         */
        function stepView(v, d) {
          var n = (v.urls || []).length
          var i = Math.max(0, Math.min(n - 1, (v.index || 0) + d))
          B.ui({ imgView: Object.assign({}, v, { index: i }) })
        }
        function ImageViewer(s) {
          var v = s.ui.imgView
          if (!v) return null
          var urls = v.urls || [], n = urls.length
          var i = Math.max(0, Math.min(n - 1, v.index || 0))
          if (!n || !urls[i]) return null
          return h('div', { className: 'at-tbd-viewer', role: 'dialog', 'aria-label': v.title || '图片',
            onPointerDown: function (e) { if (e.target === e.currentTarget) B.ui({ imgView: null }) } },
            h('div', { className: 'at-tbd-viewer-box' },
              h('div', { className: 'at-tbd-viewer-top' },
                h('span', { className: 'at-tbd-viewer-t' },
                  (v.title || '图片') + ' ' + (i + 1) + ' / ' + n),
                h('button', { type: 'button', className: 'at-tbd-viewer-x', title: '关闭',
                  'aria-label': '关闭', onClick: function () { B.ui({ imgView: null }) } }, '✕')),
              h('div', { className: 'at-tbd-viewer-body' },
                h('img', { className: 'at-tbd-viewer-photo', src: urls[i],
                  alt: (v.title || '图片') + ' ' + (i + 1) })),
              /* 只有一张时**不渲染**翻页行：胶囊配图永远只有一张，
               * 给它两颗灰掉的键只会让人以为"还有别的"（与小程序胶囊全文层同一条取舍）。 */
              n > 1 ? h('div', { className: 'at-tbd-viewer-nav' },
                h('button', { type: 'button', className: 'at-tbd-viewer-btn', disabled: i <= 0,
                  onClick: function () { stepView(v, -1) } },
                  h(U.Icon, { name: 'chevron-left', size: 13, opacity: .65 }), '上一张'),
                h('button', { type: 'button', className: 'at-tbd-viewer-btn', disabled: i >= n - 1,
                  onClick: function () { stepView(v, 1) } },
                  '下一张', h(U.Icon, { name: 'chevron-right', size: 13, opacity: .65 }))) : null))
        }
        function CapsuleViewer(s, t) {
          var v = s.ui.capView
          if (!v || !t || v.todoId !== t.id) return null
          var caps = Core.capsulesOfTodo(s, t.id)
          var idx = -1
          for (var i = 0; i < caps.length; i++) if (caps[i].id === v.id) { idx = i; break }
          /* 闸门带下标：关掉详情 / 解除关联之后这一层必须自己消失，否则会在空详情上留一张孤框
           * （小程序 `wx:if="{{capOpen && detail.capsules[capIndex]}}"` 是同一道守卫）。 */
          if (idx < 0) return null
          var c = caps[idx], src = c.imageUri ? V.imgSrc(s, c.imageUri) : ''
          return h('div', { className: 'at-tbd-viewer', role: 'dialog', 'aria-label': '闪念胶囊',
            onPointerDown: function (e) { if (e.target === e.currentTarget) B.ui({ capView: null }) } },
            h('div', { className: 'at-tbd-viewer-box' },
              h('div', { className: 'at-tbd-viewer-top' },
                h('span', { className: 'at-tbd-viewer-t' },
                  '闪念胶囊 ' + (idx + 1) + ' / ' + caps.length),
                h('button', { type: 'button', className: 'at-tbd-viewer-x', title: '关闭',
                  'aria-label': '关闭', onClick: function () { B.ui({ capView: null }) } }, '✕')),
              h('div', { className: 'at-tbd-viewer-body is-text' },
                h('div', { className: 'at-tbd-cv-t' }, c.text || '（这条还是空的）'),
                src ? h('button', { type: 'button', className: 'at-tbd-cv-pic',
                  title: '看大图', 'aria-label': '看大图',
                  onClick: function () {
                    B.ui({ imgView: { title: '闪念胶囊配图', urls: [src], index: 0 } })
                  } },
                  h('img', { className: 'at-tbd-cv-img', src: src, alt: '胶囊配图' })) : null,
                h('span', { className: 'at-tbd-cv-time' }, Core.atMin(c.createdAt)))))
        }

        function TodoBody(s, t) {
          if (!t) return h(U.Empty, { icon: 'todo', title: '还没有打开过任何一条待办',
            hint: '从左边列表里挑一条，或者先记一条新的',
            action: { label: '记一条待办', onClick: function () { S.openForm('todo', '') } } })
          var p = Core.byId(s.projects, t.projectId)
          var agent = p ? Core.byId(s.agents, p.agentId) : null
          var sum = p ? Core.projectSummary(s, p.id) : { open: 0, done: 0, mindmaps: 0 }
          var pColor = p && C.colorOf(p.color) ? C.colorOf(p.color).main : 'var(--at-stone)'
          var mm = t.mindmapId ? Core.byId(s.mindmaps, t.mindmapId) : null
          var caps = Core.capsulesOfTodo(s, t.id)
          var u = C.urgencyOf(t.urgency)
          var gone = !!t.deletedAt
          var images = t.images || []
          /* 「操作」三态只看两个互斥布尔（与小程序模板同一套判据）。 */
          var ops = gone
            ? [{ key: 'restore', name: '还原', icon: 'undo', main: true,
              run: function () { B.actions.restoreTodo(t.id) } }]
            : t.done
              ? [{ key: 'restore', name: '还原', icon: 'undo', main: true,
                run: function () { B.actions.toggleTodo(t.id) } },
                { key: 'export', name: '导出', icon: 'export',
                  run: function () { S.openForm('export', t.id) } },
                { key: 'del', name: '删除', icon: 'trash-red', danger: true,
                  run: function () { confirmDeleteTodo(t) } }]
              : [{ key: 'done', name: '完成', icon: 'check', main: true,
                run: function () { B.actions.toggleTodo(t.id) } },
                { key: 'export', name: '导出', icon: 'export',
                  run: function () { S.openForm('export', t.id) } },
                { key: 'edit', name: '编辑', icon: 'edit',
                  run: function () { S.openForm('todo', t.id) } },
                { key: 'del', name: '删除', icon: 'trash-red', danger: true,
                  run: function () { confirmDeleteTodo(t) } }]

          function removeImage(i) {
            S.openConfirm({ title: '删除这张图片？', body: '图片会从这条待办上移除。',
              onConfirm: function () {
                B.actions.updateTodo(t.id, { images: images.filter(function (_, j) { return j !== i }) })
              } })
          }

          return h('div', { className: 'at-tbd' },
            gone ? h('div', { className: 'at-tbd-note' }, '这条待办在回收站里，还原后才能继续编辑。') : null,

            /* ① 所属项目 —— 色点 · 名称 · 徽章 ＋ 右端「查看项目」；备注；两组并排 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'project-b', size: 16 }), '所属项目'),
              h('div', { className: 'at-tbd-row1' },
                h('span', { className: 'at-tbd-dot', style: { background: pColor } }),
                h('span', { className: 'at-tbd-name' }, p ? p.name : '未归属项目'),
                p
                  ? (p.archivedAt
                    ? h('span', { className: 'at-tbd-badge arch' }, '已归档')
                    : h('span', { className: 'at-tbd-badge', style: nodeBadgeStyle() }, p.node))
                  : null,
                h('button', { type: 'button', className: 'at-tbd-tb',
                  onClick: function () {
                    if (p) V.openDetail('project', p.id)
                    else B.toast('这条待办还没有归属项目')
                  } },
                  h(U.Icon, { name: 'project', size: 13 }), '查看项目')),
              h('div', { className: 'at-tbd-remark' + (p && p.remark ? '' : ' none') },
                p && p.remark ? p.remark : '未填写备注'),
              h('div', { className: 'at-tbd-cols' },
                h('div', { className: 'at-tbd-group' },
                  h('span', { className: 'at-tbd-group-t' }, '所属 agent'),
                  agent
                    ? h('div', { className: 'at-tbd-pair' },
                      h('button', { type: 'button', className: 'at-tbd-agent',
                        title: '去看「我的 · Agent」',
                        onClick: function () { S.setView('mine') } },
                        h('span', { className: 'at-tbd-agent-n' }, agent.name)),
                      h('span', { className: 'at-tbd-sep' }),
                      h('div', { className: 'at-tbd-cell' },
                        h('span', { className: 'at-tbd-lab' }, '距离重置'),
                        h('span', { className: 'at-tbd-val' }, resetInOf(agent))))
                    : h('div', { className: 'at-tbd-pair' },
                      h('span', { className: 'at-tbd-agent-none' }, '未关联 agent'))),
                h('div', { className: 'at-tbd-group' },
                  h('span', { className: 'at-tbd-group-t' }, '项目概要'),
                  h('div', { className: 'at-tbd-pair' },
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '未完成待办'),
                      h('span', { className: 'at-tbd-val' }, sum.open + ' 条')),
                    h('span', { className: 'at-tbd-sep' }),
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '已完成待办'),
                      h('span', { className: 'at-tbd-val' }, sum.done + ' 条')),
                    h('span', { className: 'at-tbd-sep' }),
                    h('div', { className: 'at-tbd-cell' },
                      h('span', { className: 'at-tbd-lab' }, '项目脑图'),
                      h('span', { className: 'at-tbd-val' }, sum.mindmaps + ' 张')))))),

            /* ② 操作 —— 三态通栏动作条（四段严格等分，主键占第一段） */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'sliders-b', size: 16 }), '操作'),
              h('div', { className: 'at-tbd-ops' + (gone ? ' solo' : '') },
                ops.map(function (o) {
                  return h('button', { key: o.key, type: 'button',
                    className: 'at-tbd-op' + (o.main ? ' is-main' : '') + (o.danger ? ' is-danger' : ''),
                    onClick: o.run },
                    h(U.Icon, { name: o.icon, size: o.main ? 14 : 13, tone: o.main ? 'ink' : '' }),
                    o.name)
                }))),

            /* ③ 待办信息 —— 紧急度色条 ＋ 档名 ＋ 互斥徽章 ＋ 创建/完成时间 ＋ 正文 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'info-b', size: 16 }), '待办信息'),
              h('div', { className: 'at-tbd-hero-top' },
                h('span', { className: 'at-tbd-flag', style: { background: urgencyInk(t.urgency) } }),
                h('span', { className: 'at-tbd-urg', style: { color: urgencyInkText(t.urgency) } }, u.name),
                gone
                  ? h('span', { className: 'at-tbd-badge gone' }, '已删除')
                  : (t.done ? h('span', { className: 'at-tbd-badge done' }, '已完成') : null),
                h('span', { className: 'at-tbd-at' },
                  '创建于 ' + Core.atMin(t.createdAt) +
                  (t.completedAt ? ' · 完成于 ' + Core.atMin(t.completedAt) : ''))),
              h('div', { className: 'at-tbd-text' }, t.text)),

            /* ④ 闪念胶囊 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'bolt', size: 16 }),
                '闪念胶囊' + (caps.length ? ' ' + caps.length : '')),
              caps.length
                ? h('div', { className: 'at-tbd-caps' },
                  caps.map(function (c) {
                    var img = c.imageUri ? V.imgSrc(s, c.imageUri) : ''
                    return h('div', { key: c.id, className: 'at-tbd-cap',
                      role: 'button', tabIndex: 0,
                      title: '看全文', 'aria-label': '看全文',
                      onClick: function () { B.ui({ capView: { todoId: t.id, id: c.id } }) },
                      onKeyDown: function (e) {
                        if (e.key !== 'Enter' && e.key !== ' ') return
                        e.preventDefault()
                        B.ui({ capView: { todoId: t.id, id: c.id } })
                      } },
                      h('span', { className: 'at-tbd-cap-t' }, c.text || '（这条还是空的）'),
                      img ? h('img', { className: 'at-tbd-cap-img', src: img, alt: '胶囊配图' }) : null,
                      h('span', { className: 'at-tbd-cap-time' }, Core.atMin(c.createdAt)),
                      /* ✕ 必须 stopPropagation：卡片现在整块可点开全文，不拦就变成
                       * "先弹全文、再问要不要取消关联"（小程序那颗也是 catchtap）。 */
                      gone ? null : h('button', { type: 'button', className: 'at-tbd-cap-x',
                        title: '取消关联', 'aria-label': '取消关联',
                        onClick: function (e) {
                          e.stopPropagation()
                          /* 小程序 248 轮定的二次确认（`wx.showModal`）：胶囊是**别人的记录**，
                           * 取消关联只是把它放回列表 —— 这句话必须说，否则用户以为点在"删除"。 */
                          S.openConfirm({ title: '取消关联这条胶囊？',
                            body: '它不会被删除：会回到闪念胶囊列表的末尾，创建时间按这次解除关联重新记。',
                            confirmText: '取消关联',
                            onConfirm: function () { B.actions.unlinkCapsules(t.id, [c.id]) } })
                        } },
                        /* 反白版是独立资产：w- 前缀让 iconSrc 不加 d- / 不加墨色档，浅深两档都恒白。 */
                        h(U.Icon, { name: 'w-close', size: 14 })))
                  }),
                  /* 末尾「＋ 选择胶囊」与每格同宽 ⇒ 落在同一条网格线上 */
                  gone ? null : h('button', { type: 'button', className: 'at-tbd-cap at-tbd-cap-add',
                    onClick: function () { S.openListDrawer('capsule', { todoId: t.id }) } },
                    h(U.Icon, { name: 'plus', size: 20, opacity: .5 }), '选择胶囊'))
                : h('div', null,
                  h('div', { className: 'at-tbd-blank' }, '这条待办还没有关联闪念胶囊'),
                  gone ? null : h('div', { className: 'at-tbd-blank-acts' },
                    h('button', { type: 'button', className: 'at-tbd-lg',
                      onClick: function () { S.openListDrawer('capsule', { todoId: t.id }) } },
                      h(U.Icon, { name: 'plus', size: 15 }), '选择胶囊')))),

            /* ⑤ 图片 */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'album-b', size: 16 }),
                '图片' + (images.length ? ' ' + images.length : '')),
              images.length
                ? h('div', { className: 'at-tbd-imgs' },
                  images.map(function (im, i) {
                    var src = imgSrc(s, im.uri)
                    return h('div', { key: im.id || i, className: 'at-tbd-img',
                      role: 'button', tabIndex: 0, title: '查看大图', 'aria-label': '查看大图',
                      onClick: function () {
                        B.ui({ imgView: {
                          title: '图片',
                          urls: images.map(function (x) { return imgSrc(s, x.uri) }),
                          index: i } })
                      },
                      onKeyDown: function (e) {
                        if (e.key !== 'Enter' && e.key !== ' ') return
                        e.preventDefault()
                        B.ui({ imgView: {
                          title: '图片',
                          urls: images.map(function (x) { return imgSrc(s, x.uri) }),
                          index: i } })
                      } },
                      h('img', { src: src, alt: im.label || '图片 ' + (i + 1) }),
                      h('span', { className: 'at-tbd-img-no' }, (i + 1) + ' / ' + images.length),
                      /* ✕ 同理必须停住冒泡，否则"移除"会顺手把大图也打开。 */
                      gone ? null : h('button', { type: 'button', className: 'at-tbd-img-x',
                        title: '移除这张图片', 'aria-label': '移除这张图片',
                        onClick: function (e) { e.stopPropagation(); removeImage(i) } },
                        /* 反白版是独立资产：w- 前缀让 iconSrc 不加 d- / 不加墨色档，浅深两档都恒白。 */
                        h(U.Icon, { name: 'w-close', size: 14 })))
                  }),
                  gone ? null : h('button', { type: 'button', className: 'at-tbd-img at-tbd-img-add',
                    onClick: function () { addImage(t) } },
                    h(U.Icon, { name: 'plus', size: 22, opacity: .5 }), '添加图片'))
                : h('div', null,
                  h('div', { className: 'at-tbd-blank' }, '这条待办还没有添加图片'),
                  gone ? null : h('div', { className: 'at-tbd-blank-acts' },
                    h('button', { type: 'button', className: 'at-tbd-lg',
                      onClick: function () { addImage(t) } },
                      h(U.Icon, { name: 'plus', size: 15 }), '从相册选择')))),

            /* ⑥ 关联脑图 —— 有图时整张只读图顶上来当主角（图本身就是入口） */
            h('div', { className: 'at-block' },
              h('div', { className: 'at-block-title' }, h(U.Icon, { name: 'mindmap-b', size: 16 }), '关联脑图'),
              mm
                ? h('div', null,
                  h('div', { className: 'at-tbd-mm-box',
                    onClick: function () { V.openDetail('mindmap', mm.id) } },
                    /* ★ 轮次 13：这里**必须挂成组件**，不能当函数直接调 ——
                     * Preview 里有 4 个 hooks，直接调会把它们算到 TodoDetail 头上；
                     * 而这段挂在 `mm ? … : …` 的条件分支里，有/无脑图的待办来回切
                     * 就是 hooks 数量忽多忽少 ⇒ 整页崩。
                     * ⚠️ 要用 `PreviewView`（真组件，签名 `props`)而不是 `Preview`
                     * （那个是 `previewOf(s, mm)` 的位置参数包装，h() 只会传 props，
                     *   mm 当场变 undefined —— 第一版就栽在这里）。 */
                    AT.mindmap && AT.mindmap.PreviewView
                      ? h(AT.mindmap.PreviewView, { key: mm.id, s: s, mm: mm }) : null),
                  h('div', { className: 'at-tbd-mm-info' },
                    h('span', { className: 'at-tbd-mm-name' }, mm.name),
                    h('span', { className: 'at-tbd-mm-meta' },
                      (mm.nodes || 0) + ' 节点 · ' + (mm.depth || 0) + ' 层 · ' +
                      Core.atMin(mm.updatedAt || mm.createdAt))),
                  h('div', { className: 'at-tbd-mm-acts' },
                    gone ? null : h('button', { type: 'button', className: 'at-tbd-lg',
                      onClick: function () {
                        S.openConfirm({ title: '取消关联脑图？', body: '脑图本身不会被删除。',
                          onConfirm: function () { B.actions.updateTodo(t.id, { mindmapId: null }) } })
                      } },
                      h(U.Icon, { name: 'close', size: 15 }), '取消关联'),
                    gone ? null : h('button', { type: 'button', className: 'at-tbd-lg',
                      onClick: function () { S.openListDrawer('mindmap', { pickTodoId: t.id }) } },
                      h(U.Icon, { name: 'refresh', size: 15 }), '替换')))
                : h('div', null,
                  h('div', { className: 'at-tbd-blank' }, '这条待办还没有关联脑图'),
                  gone ? null : h('div', { className: 'at-tbd-blank-acts' },
                    h('button', { type: 'button', className: 'at-tbd-lg',
                      onClick: function () { S.openListDrawer('mindmap', { pickTodoId: t.id }) } },
                      h(U.Icon, { name: 'plus', size: 15 }), '关联脑图')))),

            /* 两个查看层挂在这里（position:fixed，不占流内空间）。
             * 图片层放前、胶囊全文层放后 ⇒ 从胶囊全文里点图时，图片层叠在它上面。 */
            ImageViewer(s),
            CapsuleViewer(s, t))
        }
        function confirmDeleteTodo(t) {
          S.openConfirm({ title: '删除「' + (t.text || '这条待办').slice(0, 18) + '」？',
            /* 与 小程序 mod-todo.js 同一句口径：逻辑删除、可还原，指向列表的「已删除」档。 */
            body: '它不会消失：在待办列表的「筛选 → 已删除」里可以还原；关联的脑图不会被删。',
            confirmText: '删除',
            onConfirm: function () { B.actions.removeTodo(t.id) } })
        }
        function addImage(t) {
          pickImage(async function (file) {
            try {
              var uri
              if (B.get().ui.connected) uri = (await B.uploadImage(file)).uri
              else uri = URL.createObjectURL(file)
              var images = t.images.concat([{ id: Core.uid('i'), label: file.name || '', uri: uri }])
              await B.actions.updateTodo(t.id, { images: images })
            } catch (e) { B.toast(e.message, 'danger') }
          })
        }

        /* ------------------------------------------------------------- 我的 ---
         * 严格对齐 小程序前端/components/mod-mine 的 **PC / 横屏**那一档。
         * 四块自上而下、整页可滚：① 个人资料 ② Agent ③ Token API ④ 应用提示 —— **只此四块**。
         * ★ 插件原来多收了一块「连接与回收站」（数据源 / 连接账号 / 同步 / 断开 / 最近删除），
         *   2026-11-07 用户口径：小程序端没有的功能一律拿掉。三个连接动作仍有入口：
         *   顶栏「已连接 / 请登录」状态键（登录闸门）、顶栏刷新键（同步）、闸门里的「退出登录」；
         *   还原则回到待办列表「筛选 → 已删除」（与小程序 store.filterTodos 同名档）。
         * ⚠️ Agent 卡数据走 Core.agentCardViews() —— 与概览「Agent 概况」同一份装配：
         *   157 轮起「当前剩余 / 更新于」已从卡面撤下，这里不许再把手填余额抄回来。
         */
        var VENDOR_NAMES = { deepseek: 'DeepSeek' }
        function vendorName(code) {
          return VENDOR_NAMES[String(code || '').toLowerCase()] || String(code == null ? '' : code)
        }
        /* 复刻小程序 store.amountOf()：'¥ 128.40' / '1,240' / 数字都能读出量。
         * 插件后端把余额记成「分」，所以数值档先 /100 再判「低于 ¥10」。 */
        function amountOf(v) {
          var m = /-?\d+(?:\.\d+)?/.exec(String(v == null ? '' : v).replace(/,/g, ''))
          return m ? Number(m[0]) : null
        }
        function balanceText(k) {
          /* ⚠️ 0 / '' / null 一律是「还没有数」，不是「余额为零」—— 小程序用 `k.balance || ''`
           * 判空，写成 ¥ 0.00 会让「待配置 / 待查询」两态永远不出现，还会误标「余额偏低」。 */
          var v = k.balance
          if (!v) return ''
          if (typeof v === 'number' && isFinite(v)) return '¥ ' + (v / 100).toFixed(2)
          return String(v)
        }
        function balanceLow(k) {
          if (!k.balance) return false
          var amt = typeof k.balance === 'number' ? k.balance / 100 : amountOf(k.balance)
          return amt !== null && isFinite(amt) && amt < 10
        }
        function projectColor(key) {
          var dark = AT.icons.isDark()
          if (dark && C.PROJECT_DARK[key]) return C.PROJECT_DARK[key]
          var c = C.colorOf(key)
          return c ? c.main : (dark ? C.NONE_COLOR_DARK : C.NONE_COLOR)
        }
        /* 空态复用概览那套 .at-ov-blank（＝ 小程序 .blank-box / .blank-box-s 两级）。 */
        function mineBlank(main, sub) {
          return h('div', { className: 'at-ov-blank' }, h('span', null, main),
            h('span', { className: 'at-ov-blank-s' }, sub))
        }
        var QR_SRC = '/agent-todo/assets/qr-official.jpg'
        /* 五条标签必须同为 2 字（正文起始 x 靠字数 + gap 对齐，没有写死宽度）；
         * 条目句末不带句号；产品名一律 Agent-ToDo。逐字照抄 mod-mine.wxml 207-230。 */
        var TIP_ROWS = [
          ['面向', 'FDE（前沿部署工程师），快速跟踪所属项目的需求，顺手整理 Agent 需要的上下文'],
          ['版本', '当前为演示版，欢迎随意体验；功能高频更新，数据不承诺保存'],
          ['初衷', '驻场之后，为这家企业单独搭一套 Agent-ToDo，而不是共用一套'],
          ['安全', '每个软件功能背后的变更需求才是企业更重要的资产，独立部署更完全'],
          ['开源', '前后端代码都已开源，需要代码或有项目想聊，都欢迎扫码私信我']
        ]

        function AgentCard(s, a) {
          var ps = s.projects.filter(function (p) { return p.agentId === a.id })
          return h('div', { key: a.id, className: 'at-mi-card at-mi-ag' },
            h('div', { className: 'at-ov-ag-row1' },
              h('span', { className: 'at-ov-ag-name', title: a.name }, a.name),
              h('span', { className: 'at-mi-acts' },
                h('button', { type: 'button', className: 'at-mi-tb',
                  onClick: function () { S.openForm('agent', a.id) } },
                  h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'),
                h('button', { type: 'button', className: 'at-mi-tb icon', title: '删除', 'aria-label': '删除',
                  onClick: function () {
                    S.openConfirm({ title: '删除「' + a.name + '」？',
                      body: '有项目关联着它时，这些项目的「关联 agent」会被清空，但项目本身一个都不会删。',
                      onConfirm: function () { B.actions.removeAgent(a.id) } })
                  } }, h(U.Icon, { name: 'trash-red', size: 14 })))),
            /* 与概览 AgentSection 逐字同构：圆环（距离重置）+ 每月套餐 / 承担项目 */
            h('div', { className: 'at-ov-ag-body' },
              h('div', { className: 'at-ov-ag-ring-wrap' },
                h('span', { className: 'at-ov-ag-ring', style: { '--ring-deg': a.ringDeg + 'deg' } },
                  h('span', { className: 'at-ov-ag-ring-core' },
                    h('span', { className: 'at-ov-ag-ring-num atx-num' +
                      (a.resetMuted ? ' is-muted' : '') }, a.resetNum),
                    a.resetUnit ? h('span', { className: 'at-ov-ag-ring-unit' }, a.resetUnit) : null)),
                h('span', { className: 'at-ov-ag-ring-lab' }, '距离重置')),
              h('div', { className: 'at-ov-ag-meta' },
                h('div', { className: 'at-ov-ag-mcell' },
                  h('span', { className: 'at-ov-ag-lab' }, '每月套餐'),
                  h('span', { className: 'at-ov-ag-val atx-num' }, String(a.monthlyQuota))),
                h('span', { className: 'at-ov-ag-mdiv' }),
                h('div', { className: 'at-ov-ag-mcell' },
                  h('span', { className: 'at-ov-ag-lab' }, '承担项目'),
                  h('span', { className: 'at-ov-ag-val atx-num' }, a.projectCount + ' 项')))),
            h('div', { className: 'at-mi-chips' }, ps.length ? ps.map(function (p) {
              return h('button', { key: p.id, type: 'button',
                className: 'at-mi-chip' + (p.archivedAt ? ' is-arc' : ''),
                onClick: function () { V.openDetail('project', p.id) } },
                h('span', { className: 'at-mi-dot-sm', style: { background: projectColor(p.color) } }),
                h('span', { className: 'at-mi-chip-t' }, p.name),
                p.archivedAt ? h('span', { className: 'at-mi-chip-arc' }, '已归档') : null)
            }) : h('span', { className: 'at-mi-none' }, '暂无关联项目')))
        }

        function TokenCard(k) {
          var bal = balanceText(k)
          return h('div', { key: k.id, className: 'at-mi-card at-mi-tk' },
            h('div', { className: 'at-ov-ag-row1' },
              h('span', { className: 'at-mi-tk-name', title: vendorName(k.vendor) }, vendorName(k.vendor)),
              h('span', { className: 'at-mi-acts' },
                h('button', { type: 'button', className: 'at-mi-tb',
                  onClick: function () { S.openForm('token', k.id) } },
                  h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'),
                h('button', { type: 'button', className: 'at-mi-tb icon', title: '删除', 'aria-label': '删除',
                  onClick: function () {
                    S.openConfirm({ title: '删除这个 API？',
                      body: '它存下的余额数据会一起删掉，不影响任何项目或待办。',
                      onConfirm: function () { B.actions.removeToken(k.id) } })
                  } }, h(U.Icon, { name: 'trash-red', size: 14 })))),
            h('div', { className: 'at-mi-bal' },
              bal ? h('span', { className: 'at-mi-bal-v atx-num' }, bal)
                /* 「待配置」＝ 还没填 key（要动手，警示色）；「待查询」＝ 配好了还没查回来（灰） */
                : h('span', { className: 'at-mi-bal-v at-mi-bal-pending' +
                  (!k.hasKey ? ' at-mi-bal-warn' : '') }, !k.hasKey ? '待配置' : '待查询'),
              bal && balanceLow(k) ? h('span', { className: 'at-mi-status' }, '余额偏低') : null),
            h('div', { className: 'at-mi-foot' },
              k.keyMask ? h('span', null, k.keyMask) : null,
              h('span', { className: 'at-mi-flex' }),
              k.balanceAt ? h('span', null, '更新于 ' + Core.atMin(k.balanceAt)) : null),
            k.lastError ? h('div', { className: 'at-mi-err' }, k.lastError) : null)
        }

        function MineBody(s) {
          var me = s.me || {}, agents = Core.agentCardViews(s), tokens = s.tokenKeys || []
          return h('div', { className: 'at-mi' },
            h(U.Section, { key: 'me', title: '个人资料', icon: 'mine-b' },
              h('div', { className: 'at-mi-card at-mi-me' },
                h('span', { className: 'at-mi-avatar' },
                  (me.avatarUri || me.avatar)
                    ? h('img', { src: imgSrc(s, me.avatarUri || me.avatar), alt: '' })
                    : h(U.Icon, { name: 'mine', size: 28, opacity: .5 })),
                h('span', { className: 'at-mi-me-name' }, me.name || '我的工位'),
                h('span', { className: 'at-mi-flex' }),
                h('button', { type: 'button', className: 'at-mi-tb',
                  onClick: function () { S.openForm('profile', '') } },
                  h(U.Icon, { name: 'edit', size: 13, opacity: .65 }), '编辑'))),
            h(U.Section, { key: 'ag', title: 'Agent', icon: 'robot-b',
              extra: h('button', { type: 'button', className: 'at-mi-sec-btn',
                onClick: function () { S.openForm('agent', '') } },
                h(U.Icon, { name: 'w-plus', size: 14 }), '新建 Agent') },
              agents.length ? h('div', { className: 'at-mi-grid' }, agents.map(function (a) {
                return AgentCard(s, a)
              })) : mineBlank('还没有 agent 档案。', '新建一个，填上每月套餐与额度重置日即可。')),
            h(U.Section, { key: 'tk', title: 'Token API', icon: 'key-b',
              extra: h('button', { type: 'button', className: 'at-mi-sec-btn',
                onClick: function () { S.openForm('token', '') } },
                h(U.Icon, { name: 'w-plus', size: 14 }), '添加 API') },
              tokens.length ? h('div', { className: 'at-mi-grid' }, tokens.map(function (k) {
                return TokenCard(k)
              })) : mineBlank('还没有添加任何模型厂家 key。', '选好厂商、贴上 API Key，余额会自动查回来。')),
            h(U.Section, { key: 'tip', title: '应用提示', icon: 'info-b' },
              h('div', { className: 'at-mi-card at-mi-tip' },
                h('div', { className: 'at-mi-tip-body' }, TIP_ROWS.map(function (r) {
                  return h('div', { key: r[0], className: 'at-mi-tip-row' },
                    h('span', { className: 'at-mi-tip-k' }, r[0]),
                    h('span', { className: 'at-mi-tip-v' }, r[1]))
                })),
                /* 二维码瓦片跨主题恒白（--at-qr），不随卡面走。 */
                h('div', { className: 'at-mi-qr' },
                  h('div', { className: 'at-mi-qr-tile' },
                    h('img', { className: 'at-mi-qr-img', src: QR_SRC, alt: '公众号二维码' })),
                  h('span', { className: 'at-mi-qr-cap' }, '公众号 · 扫码私信')))))
        }

        /* 兼容旧入口：实际分发已交给 AT.panes.render。 */
        function render(s, ctx) { return AT.panes.render(s) }

        /* 60-views-a.js 用 `AT.views = { STYLE, ... }` 整体赋值 ⇒ 本模块只能**追加**样式。
         * 若写成 Object.assign(AT.views, { STYLE: MINE_STYLE })，概览整套 .at-ov-* 会被静默抹掉
         * （50-shell.js 的 styleTag 只在渲染期读一次 AT.views.STYLE，症状是概览整页失去样式）。 */
        AT.views.STYLE = (AT.views.STYLE || '') + MINE_STYLE + TODO_STYLE

        Object.assign(AT.views, {
          confirmDeleteTodo: confirmDeleteTodo,
          TodoBody: TodoBody, TodoView: function (s) { return TodoBody(s, Core.byId(s.todos, s.ui.todoId)) },
          MineBody: MineBody, MineView: MineBody, render: render,
          MINE_STYLE: MINE_STYLE, TODO_STYLE: TODO_STYLE, resetInOf: resetInOf,
          TIP_ROWS: TIP_ROWS, vendorName: vendorName,
          imgSrc: imgSrc, pickImage: pickImage
        })
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 70-mindmap.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    /* ===== 76-voice.js ===== */
    ;(function (AT, React, h) {
      /* 76-voice.js — 麦克风采集与转写（闪念胶囊语音入口的真源）
       *
       * 背景（v1.8）：v1.7 之前胶囊的「语音」只有 `window.SpeechRecognition`——
       * 那是 Chromium 的可选云识别组件，Electron 宿主默认不带 Google 语音服务，
       * 取不到构造器就直接 toast 返回，等于没有语音录入。
       *
       * 现在按 DSH 官方语音输入（@deepseek-ai/dsh-experimental-client-ui-voice-input）
       * 的同一条链路补齐，采集与识别彻底分开：
       *   ① 采集：`getUserMedia` + `MediaRecorder`（Chromium 原生，非宿主 API）；
       *   ② 重采样：`decodeAudioData` → `OfflineAudioContext(1, n, 16000)`；
       *   ③ 封装：PCM16 单声道 WAV（44 字节头），16 kHz；
       *   ④ 识别：优先 DSH 的 `ctx.remote.speech.transcribe`（SenseVoice 本地跑，
       *      离线、无配额），拿不到就降级走插件代理的 `POST /asr`（腾讯云）。
       *
       * ⚠️ 为什么必须到 16 kHz 单声道 PCM16：Host 侧 `validateWave()` 只认这一种，
       *    `maxAudioBytes` 默认 4MB、`maxDurationSeconds` 默认 120。16k/16bit 单声道
       *    60s ≈ 1.92MB，正好卡在「代理 2MB」之外、Host 4MB 之内 ⇒ index.js 的代理
       *    上限本轮从 2MB 提到 8MB。
       * ⚠️ 麦克风权限不在插件手里：DSH 主进程 `installMicrophonePermissions` 只对
       *    「主窗口主框架 + mediaTypes 恰为 ['audio']」放行。所以 `getUserMedia`
       *    必须保持 `{ audio: true }` 这一种形状，别顺手加 video / 多轨。
       */
      ;(function (AT, React, h) {
        'use strict'

        var SAMPLE_RATE = 16000
        var MAX_SECONDS = 60
        var TAIL_MS = 800          /* MediaRecorder.onstop 偶发不回时的兜底 */
        var FLUSH_BYTES = 0x8000   /* base64 分块，避免 apply 爆栈 */

        var capture = null         /* { stream, ctx, recorder, chunks, dead } */
        var remote = null          /* ctx.remote（命名空间 speech） */
        var catalogCache = null    /* 最近一次 speech/catalog 的快照 */

        function recError(kind, message) {
          var err = new Error(message || kind)
          err.kind = kind
          return err
        }

        /* ------------------------------------------------------------- 采集 --- */
        function supported() {
          return !!(typeof navigator !== 'undefined' && navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === 'function' &&
            typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined')
        }

        function recording() { return !!capture }

        async function start() {
          if (!supported()) throw recError('unavailable', '当前宿主没有可用的麦克风接口')
          await abort()
          var stream
          try {
            /* ⚠️ 形状不能改：宿主只放行 mediaTypes === ['audio'] 的主框架请求。 */
            stream = await navigator.mediaDevices.getUserMedia({
              audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            })
          } catch (e) {
            var name = (e && e.name) || ''
            if (name === 'NotAllowedError' || name === 'SecurityError') {
              throw recError('permission', '麦克风权限被拒绝')
            }
            if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'NotReadableError') {
              throw recError('deviceMissing', '没有找到可用的麦克风')
            }
            throw recError('unavailable', (e && e.message) || '无法打开麦克风')
          }
          var Ctx = window.AudioContext || window.webkitAudioContext
          var ctx = null, recorder = null
          try {
            ctx = new Ctx()
            if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
              try { await ctx.resume() } catch (e) { /* 让 decode 阶段再暴露问题 */ }
            }
            recorder = new window.MediaRecorder(stream)
          } catch (e) {
            try { stream.getTracks().forEach(function (t) { t.stop() }) } catch (err) {}
            throw recError('unavailable', (e && e.message) || '无法启动录音')
          }
          var job = { stream: stream, ctx: ctx, recorder: recorder, chunks: [], dead: false }
          recorder.ondataavailable = function (event) {
            if (event && event.data && event.data.size > 0) job.chunks.push(event.data)
          }
          recorder.onerror = function () { job.dead = true }
          /* 拔设备 / 系统收回麦克风：tracks 的 ended 是最早的信号 */
          stream.getTracks().forEach(function (track) {
            if (track && typeof track.addEventListener === 'function') {
              track.addEventListener('ended', function () { job.dead = true })
            }
          })
          try {
            recorder.start()
          } catch (e) {
            release(job)
            throw recError('unavailable', (e && e.message) || '无法开始录音')
          }
          capture = job
          return true
        }

        function closeCtx(ctx) {
          if (!ctx || typeof ctx.close !== 'function') return Promise.resolve()
          try { return Promise.resolve(ctx.close()).catch(function () {}) } catch (e) { return Promise.resolve() }
        }

        function release(job) {
          if (!job) return Promise.resolve()
          try {
            job.stream.getTracks().forEach(function (t) { try { t.stop() } catch (e) {} })
          } catch (e) {}
          return closeCtx(job.ctx)
        }

        /** 放弃这次采集：不产出音频，不识别。关闭抽屉 / 卸载时走这里。 */
        function abort() {
          var job = capture
          capture = null
          if (!job) return Promise.resolve()
          try {
            if (job.recorder && job.recorder.state !== 'inactive') job.recorder.stop()
          } catch (e) {}
          return release(job)
        }

        /**
         * 结束采集并重采样成 16 kHz 单声道 PCM16 WAV。
         * @param {number} [maxSec] 截断上限（Host 的 maxDurationSeconds 也有一道）
         * @returns {Promise<{bytes: Uint8Array, seconds: number}>}
         */
        async function stop(maxSec) {
          var job = capture
          capture = null
          if (!job) throw recError('empty', '这次没有录到音频')
          var limit = Math.max(1, Math.min(Number(maxSec) || MAX_SECONDS, MAX_SECONDS))
          var recorder = job.recorder
          try {
            if (recorder && recorder.state === 'recording') {
              await new Promise(function (resolve) {
                var done = false
                function finish() { if (!done) { done = true; resolve() } }
                recorder.onstop = finish
                setTimeout(finish, TAIL_MS)
                try { recorder.stop() } catch (e) { finish() }
              })
            }
          } finally {
            try { job.stream.getTracks().forEach(function (t) { try { t.stop() } catch (e) {} }) } catch (e) {}
          }
          var blob = new Blob(job.chunks, { type: (recorder && recorder.mimeType) || 'audio/webm' })
          if (!blob.size) {
            await closeCtx(job.ctx)
            throw recError('empty', '这次没有录到音频')
          }
          var decoded
          try {
            decoded = await job.ctx.decodeAudioData(await blob.arrayBuffer())
          } catch (e) {
            await closeCtx(job.ctx)
            throw recError('empty', '音频解析失败')
          }
          var frames = Math.max(1, Math.floor(Math.min(decoded.duration, limit) * SAMPLE_RATE))
          var Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext
          var samples
          try {
            var offline = new Offline(1, frames, SAMPLE_RATE)
            var source = offline.createBufferSource()
            source.buffer = decoded
            source.connect(offline.destination)
            source.start()
            var rendered = await offline.startRendering()
            samples = rendered.getChannelData(0)
          } catch (e) {
            await closeCtx(job.ctx)
            throw recError('empty', '音频重采样失败')
          }
          await closeCtx(job.ctx)
          return { bytes: encodeWave(samples), seconds: frames / SAMPLE_RATE }
        }

        /* ------------------------------------------------------- WAV / base64 --- */
        /** 单声道浮点样本 → 规范 PCM16 WAV（与 Host `validateWave` 同一格式）。 */
        function encodeWave(samples) {
          var bytes = new Uint8Array(44 + samples.length * 2)
          var view = new DataView(bytes.buffer)
          function text(at, value) {
            for (var i = 0; i < value.length; i++) bytes[at + i] = value.charCodeAt(i)
          }
          text(0, 'RIFF')
          view.setUint32(4, bytes.length - 8, true)
          text(8, 'WAVE')
          text(12, 'fmt ')
          view.setUint32(16, 16, true)
          view.setUint16(20, 1, true)        /* PCM */
          view.setUint16(22, 1, true)        /* 单声道 */
          view.setUint32(24, SAMPLE_RATE, true)
          view.setUint32(28, SAMPLE_RATE * 2, true)
          view.setUint16(32, 2, true)        /* block align */
          view.setUint16(34, 16, true)       /* bit depth */
          text(36, 'data')
          view.setUint32(40, samples.length * 2, true)
          for (var i = 0; i < samples.length; i++) {
            var value = Math.max(-1, Math.min(1, samples[i]))
            view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true)
          }
          return bytes
        }

        function toBase64(bytes) {
          var out = '', i
          for (i = 0; i < bytes.length; i += FLUSH_BYTES) {
            out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + FLUSH_BYTES, bytes.length)))
          }
          return window.btoa(out)
        }

        /* --------------------------------------------------------- 转写链路 --- */
        /** 挂上宿主 remote（由 99-entry 在 `remote` 服务可用时调用）。 */
        function attach(remoteApi) {
          remote = remoteApi || null
          catalogCache = null
        }

        function pickFrom(cat) {
          var providers = (cat && cat.providers) || []
          var chosen = (cat && cat.selection) || {}
          var provider = null, i
          for (i = 0; i < providers.length; i++) {
            if (chosen.providerId && providers[i].id === chosen.providerId) provider = providers[i]
          }
          if (!provider && providers.length) provider = providers[0]
          var request = {}
          if (provider) request.providerId = provider.id
          if (chosen.language) request.language = chosen.language
          else if (provider && provider.languages && provider.languages.length === 1) request.language = provider.languages[0]
          var ready = !!(provider && provider.preparation && provider.preparation.phase === 'ready')
          return { ready: ready, request: request, provider: provider }
        }

        async function selection() {
          if (catalogCache) return pickFrom(catalogCache)
          if (!remote || !remote.speech || typeof remote.speech.catalog !== 'function') {
            return { ready: false, request: {}, provider: null }
          }
          try {
            var res = await remote.speech.catalog()
            if (res && res.ok && res.value) catalogCache = res.value
          } catch (e) { /* 目录读不到就当作「本地未就绪」 */ }
          return pickFrom(catalogCache)
        }

        /**
         * 一段 WAV → 文字。本地优先、后端兜底。
         * @returns {Promise<{text: string, via: 'local'|'server'}>}
         */
        async function transcribe(bytes, signal) {
          var problems = []
          var local = await selection()
          if (local.ready && remote && remote.speech && typeof remote.speech.transcribe === 'function') {
            try {
              var request = Object.assign({ audioBase64: toBase64(bytes) }, local.request)
              var res = await remote.speech.transcribe(request, signal)
              if (res && res.ok) return { text: (res.value && res.value.text) || '', via: 'local' }
              problems.push((res && res.error && res.error.message) || '本地识别未成功')
            } catch (e) {
              if (signal && signal.aborted) throw e
              problems.push((e && e.message) || '本地识别未成功')
            }
          } else if (remote && remote.speech) {
            problems.push('DSH 语音模型还没准备好')
          }

          var B = AT.bridge
          if (B && typeof B.asr === 'function') {
            try {
              var data = await B.asr(new Blob([bytes], { type: 'audio/wav' }), 'wav')
              return { text: (data && data.text) || '', via: 'server' }
            } catch (e) {
              problems.push((e && e.message) || '后端识别未成功')
            }
          } else {
            problems.push('没有可用的识别通道')
          }
          throw recError('transcribe', problems.join('；'))
        }

        /* 宿主侧语音目录的即时状态，供 UI 决定提示语（不阻塞录音）。 */
        function localReady() {
          if (!catalogCache) return false
          return pickFrom(catalogCache).ready
        }

        AT.voice = {
          SAMPLE_RATE: SAMPLE_RATE,
          MAX_SECONDS: MAX_SECONDS,
          supported: supported,
          recording: recording,
          start: start,
          stop: stop,
          abort: abort,
          attach: attach,
          transcribe: transcribe,
          localReady: localReady,
          encodeWave: encodeWave,
          toBase64: toBase64
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 80-capsule.js ===== */
    ;(function (AT, React, h) {
      /* 80-capsule.js — 闪念胶囊 · DSH 全局悬浮层
       *
       * 视觉 / 几何全部走 08-style.js 的插件前端样式标准：
       *   AT.style.base(dark) 统一注入小程序令牌 → DSH 宿主令牌 → 补充令牌 → 通用基线；
       *   AT.style.S.CAPSULE 是尺寸真源，AT.style.geom(b) 是窗口适配真源；
       *   本文件只写「胶囊这一块长什么样」，数值不再另抄一份。
       *
       * 结构（功能边界不变，见交接文档 §8.2）：
       *   · 悬浮品牌键：任何页面 / 会话可见，内容展示区内可拖动、位置持久化。
       *   · 打开：内容区遮罩 + 320 胶囊抽屉（品牌黄标题带、卡片列表、已删除入口）。
       *   · 选中卡片：抽屉右侧竖排动作组（删除 / 编辑 / 导出 / 转待办 / 转脑图）。
       *   · 写一条 / 编辑 / 转待办 / 转脑图：右侧 260 副抽屉族（PC .ep / .cp-sheet.sub 同源）。
       *   · 录音：悬浮键品牌黄呼吸 + 16px 等宽倒数，抽屉内状态条 + 波纹。
       *   · 窄内容区：抽屉收窄、动作组降级为内侧图标列，不越过内容区。
       */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, S = AT.shell,
          V = AT.views, Text = AT.text
        var St = AT.style, K = St.S.CAPSULE

        /* 全部取自样式标准，避免「同一尺寸两处写法」。 */
        var FAB_SIZE = K.fab
        var FAB_MARGIN = K.fabMargin
        var WRITE_SIZE = K.write
        var OPS_KEY_H = K.opsKeyH
        var OPS_GAP = K.opsGap
        var LONG_PRESS_MS = K.longPressMs
        var POS_KEY = 'agent-todo-capsule-fab-v5'

        /* ★ v1.6 · 设计图「列表卡：白底」：胶囊层与 DSH 宿主的暖灰底令牌解绑。
         * base(dark) 里的 AT.desktop.STYLE 把 --at-elevated 映成
         * var(--dsw-alias-bg-overlay, var(--at-card))、--at-card 映成
         * var(--dsw-alias-bg-layer-1, #fff)、--at-head-bg = --at-card；宿主这几支是
         * 暖灰系（回退 #faf9f6 / #f1f0ec），于是列表卡片、主抽屉、以及转待办 /
         * 转脑图 / 编辑三块副抽屉的面板与头 / 底栏、字段行都落在灰底上。
         * 取色依据（2026-11-07 用户确认）：规范E「列表卡：白底」＋样式标准 §2.1
         * 已登记的 --at-card。色值从 40-ui.js 的 LIGHT / DARK 表**现取**，不新增、
         * 不手抄；只在 .at-gl.at-cx-root 作用域覆写，工作台其它模块不受影响。 */
        function literal(name, table) {
          var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
          return m ? m[1] : ''
        }
        var CARD_LIGHT = literal('at-card', U.LIGHT)
        var CARD_DARK = literal('at-card', U.DARK)

        var STYLE = [
          /* ---- root / tokens（主题 / 字体 / 动效基线由 AT.style.base(dark) 注入） ---- */
          /* 特异度 0,2,0 / 0,3,0，压过 desktop.STYLE 的 .at-gl 与 .at-gl[data-dark]；
           * 三支一起覆写，卡片 / 主抽屉 / 三块副抽屉的面板 · 头 · 底栏 · 字段行同源回白。 */
          '.at-gl.at-cx-root{--at-card:' + CARD_LIGHT + ';--at-elevated:' + CARD_LIGHT +
            ';--at-head-bg:' + CARD_LIGHT + '}',
          '.at-gl.at-cx-root[data-dark="true"]{--at-card:' + CARD_DARK + ';--at-elevated:' + CARD_DARK +
            ';--at-head-bg:' + CARD_DARK + '}',
          '.at-cx-root{display:contents;font-family:var(--at-font);color:var(--at-primary)}',
          '.at-cx-root *{box-sizing:border-box}',
          /* 控件复位统一由 08-style.js BASE_CSS 的零特异度 :where() 规则提供，
           * 本层不再写 .at-cx-root button{color:inherit}（会压掉单类控件的着色）。 */
          '.at-cx-root :focus-visible{outline:2px solid var(--at-blue);outline-offset:2px}',
          '.at-cx-root ::-webkit-scrollbar{width:8px;height:8px}',
          '.at-cx-root ::-webkit-scrollbar-thumb{background:var(--at-hairline-strong);border-radius:4px}',

          /* ---- floating brand / record button：**PC / 横屏档 40×40** ----
           * ★★★ v1.5：v1.4 抄了 `app.wxss` 的 `.fab`（56/18），但那一颗的渲染条件是
           * `!phone && !landscape` ⇒ **平板竖屏**；PC / 横屏走 `nav-rail.wxss` 的
           * `.rail-brand`：40 方 / 12 圆角 / 品牌图满幅 40 / 麦克风 22 / 倒数 18。
           * 「写」同尺寸同圆角（`.rail-write`：40/12、`--chip` 底无描边、图标 22）。
           * 数值一律从 S.CAPSULE 拼，不在这里抄第二份。 */
          '.at-cx-fab{position:fixed;z-index:150;width:' + K.fab + 'px;height:' + K.fab + 'px;padding:0;',
          'border:0;border-radius:' + K.fabRadius + 'px;background:var(--at-yellow);color:var(--at-on-accent);',
          'display:flex;align-items:center;justify-content:center;cursor:grab;overflow:hidden;',
          'touch-action:none;user-select:none;-webkit-user-drag:none;box-shadow:var(--atx-sh-fab);',
          /* 打开 / 关闭时浮键在「可拖动坐标」与「右侧停靠带」之间换位：位移与抽屉入场
           * 同时长（.18s）⇒ 看起来是"跟着抽屉一起归位"，不是瞬移。拖动时由 .is-dragging
           * 把过渡清零，跟手不打折。 */
          'transition:left var(--atx-dur-enter) ease,top var(--atx-dur-enter) ease,',
          'transform var(--atx-dur-fast) ease,box-shadow var(--atx-dur-fast) ease;pointer-events:auto}',
          '.at-cx-fab:hover{box-shadow:var(--atx-sh-fab-hover);opacity:.82}',
          '.at-cx-fab:active{transform:translateY(1px);opacity:.78}',
          '.at-cx-fab.is-dragging{cursor:grabbing;transition:none}',
          /* 打开态浮键停在抽屉右侧的竖排带里（对齐 PC / 横屏 .rail-brand + .rail-write）：不可拖 */
          '.at-cx-fab.is-docked{cursor:pointer}',
          /* 停靠带底衬：只有停靠带**退进抽屉内部**（内容区窄到放不下 40 方键）时才垫，
           * 盖住两颗键那一块，免得方键直接坐在卡片正文上把字切断。
           * 只做视觉 —— pointer-events:none，点在它身上等于点在下面的卡片上。 */
          '.at-cx-dockplate{position:fixed;z-index:148;border-radius:' + K.fabRadius + 'px;',
          'background:var(--at-elevated);border:1px solid var(--at-hairline);',
          'box-shadow:var(--atx-sh-fab);pointer-events:none}',
          '.at-cx-fab.is-rec{cursor:pointer;animation:atxBreath var(--atx-breath) ease-out infinite}',
          /* ★ v1.8 · 识别中：不再呼吸（呼吸＝「还在录」），指针走 progress，按下去也不起录。 */
          '.at-cx-fab.is-asr{cursor:progress;animation:none}',
          '.at-cx-fab-img{width:' + K.fabIcon + 'px;height:' + K.fabIcon + 'px;',
          'border-radius:' + K.fabRadius + 'px;display:block;pointer-events:none;',
          '-webkit-user-drag:none;user-select:none}',
          /* PC `.rail-brand-clock`：40 方里两字秒数 18/600 + tabular-nums，逐秒不抖 */
          '.at-cx-fab-clock{font-size:' + K.fabClock + 'px;font-weight:600;letter-spacing:0;',
          'font-family:var(--atx-font-num);font-variant-numeric:tabular-nums;',
          'line-height:1;pointer-events:none;color:var(--at-on-accent)}',
          '.at-cx-fab-clock.is-dots{letter-spacing:1px;opacity:.72}',
          /* `.rail-write`：`--chip` 底、无描边（40 的面积上留描边会把图标挤到 36 以内） */
          '.at-cx-write{position:fixed;z-index:149;width:' + K.write + 'px;height:' + K.write + 'px;',
          'padding:0;border:0;border-radius:' + K.fabRadius + 'px;',
          'background:var(--at-chip);color:var(--at-primary);',
          'display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;',
          'box-shadow:var(--atx-sh-fab);transition:opacity var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
          '.at-cx-write:hover{opacity:.82}',
          '.at-cx-write:active{transform:translateY(1px);opacity:.78}',

          /* ---- mask + main drawer（PC .cp / .cp-head 同规格） ---- */
          '.at-cx-mask{position:fixed;z-index:120;background:var(--at-mask);pointer-events:auto;',
          'animation:atxFade var(--atx-dur-fade) ease-out}',
          '.at-cx-drawer{position:fixed;z-index:130;display:flex;flex-direction:column;min-width:0;',
          'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-elevated);',
          'box-shadow:var(--at-sh-drawer);overflow:hidden;pointer-events:auto;',
          'animation:atxIn var(--atx-dur-enter) ease-out;',
          'transition:transform ' + K.turnDur + ' cubic-bezier(.2,.8,.3,1)}',
          /* ★★ v1.5 · **第二档侧转**（PC `capsule.wxss` 的 `.cp.turned`，275 行）：
           * 转待办 / 转脑图一开，第一档侧转 25° 且不可点 —— 两张 320 宽的弹窗同屏，
           * 不转就读成「一张盖住了另一张」。值逐字照抄：perspective(1100px)
           * rotateY(25deg) / transform-origin:left center / pointer-events:none。
           * 差异只有两处：① 加 .22s 过渡（小程序是瞬时，DSH 桌面上要看得见"转过去"）；
           * ② z 取 S.Z.drawerTurned(129) —— 插件层级基线整体高，只保证低于副抽屉 141。 */
          '.at-cx-drawer.is-turned{transform-origin:left center;',
          'transform:perspective(' + K.turnPerspective + 'px) rotateY(' + K.turnDeg + 'deg);',
          'pointer-events:none;z-index:' + St.S.Z.drawerTurned + '}',
          /* 品牌黄标题带：恒亮面 ⇒ 字恒墨、图标 tone=ink、底边 --at-yellow-press 收边 */
          '.at-cx-head{flex:0 0 52px;height:52px;display:flex;align-items:center;justify-content:space-between;',
          'gap:8px;padding:0 14px;background:var(--at-yellow);border-bottom:1px solid var(--at-yellow-press)}',
          '.at-cx-title{flex:1 1 auto;min-width:0;font-size:16px;font-weight:500;letter-spacing:-.2px;',
          'color:var(--at-on-accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
          '.at-cx-head-r{flex:0 0 auto;display:flex;align-items:center;gap:8px}',
          '.at-cx-hbtn{height:28px;padding:0 12px;border:1px solid var(--at-on-accent);border-radius:999px;',
          'background:transparent;color:var(--at-on-accent);font-size:13px;font-weight:500;',
          'display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;white-space:nowrap;',
          'transition:background var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
          '.at-cx-hbtn:hover{opacity:.82}',
          '.at-cx-hbtn:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
          '.at-cx-hbtn.is-on{background:var(--at-solid);border-color:var(--at-solid);color:var(--at-on-solid)}',
          '.at-cx-hbtn.is-on:hover{opacity:.82}',
          '.at-cx-hclose{width:28px;height:28px;padding:0;border:1px solid var(--at-on-accent);border-radius:50%;',
          'background:transparent;color:var(--at-on-accent);display:flex;align-items:center;justify-content:center;',
          'cursor:pointer;transition:background var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease}',
          '.at-cx-hclose:hover{opacity:.82}',
          '.at-cx-hclose:active{background:var(--at-yellow-press);transform:translateY(1px);opacity:.78}',
          '.at-cx-hclose.is-rec{background:var(--at-solid);border-color:var(--at-solid);color:var(--at-on-solid)}',

          /* ---- list（PC .cp-list / .cp-hollow / .cp-bub / .cp-empty 同规格） ---- */
          '.at-cx-list{flex:1 1 auto;min-height:0;overflow:auto;padding:12px 12px 6px}',
          '.at-cx-hollow{display:flex;align-items:center;gap:7px;width:100%;height:42px;margin:0 0 10px;',
          'padding:0 12px;border:1px dashed var(--at-hairline-strong);border-radius:12px;background:transparent;',
          'color:var(--at-slate);font-size:13px;text-align:left;cursor:pointer;',
          'transition:background var(--atx-dur-fast) ease,color var(--atx-dur-fast) ease}',
          '.at-cx-hollow:hover{background:var(--at-chip);color:var(--at-primary)}',
          '.at-cx-hollow-t{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
          '.at-cx-hollow-n{flex:0 0 auto;font-size:11px;color:var(--at-muted)}',
          '.at-cx-card{position:relative;display:block;width:100%;margin:0 0 8px;padding:11px 13px 11px 19px;',
          'border:1px solid var(--at-hairline);border-radius:12px;background:var(--at-elevated);',
          'text-align:left;cursor:pointer;',
          'transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease,opacity var(--atx-dur-fast) ease}',
          /* 188 轮：引线恒品牌黄（--at-yellow 深浅同值），与「选中」不再靠引线区分 */
          '.at-cx-card:before{content:"";position:absolute;left:6px;top:12px;width:3px;height:18px;',
          'border-radius:2px;background:var(--at-yellow)}',
          '.at-cx-card:hover{background:var(--at-chip)}',
          '.at-cx-card:active{opacity:.78}',
          /* ★ PC 卡片五态（capsule.wxss .cp-bub.on/.editing/.del/.wait/.fail）：
           * 选中与「正在编辑这一条」同色、靠黄引线区分；已删除名单整卡灰化；
           * 识别中只动透明度（手指可能正落在卡上），失败态灰字且停呼吸。 */
          '.at-cx-card.is-sel,.at-cx-card.is-editing{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-cx-card.is-editing:before{background:var(--at-yellow)}',
          '.at-cx-card.is-del{background:var(--at-card-dim)}',
          '.at-cx-card.is-del:before{background:var(--at-hairline)}',
          '.at-cx-card.is-wait{animation:atxCardBreath 1.1s ease-in-out infinite}',
          '.at-cx-card.is-fail{animation:none}',
          '.at-cx-card.is-fail .at-cx-card-text{color:var(--at-muted)}',
          '.at-cx-vmask{position:absolute;inset:0;z-index:2;display:flex;align-items:center;',
          'justify-content:center;border-radius:inherit;background:var(--atx-frost);pointer-events:none}',
          '.at-cx-vmask-t{font-size:14px;line-height:20px;font-weight:600;color:var(--at-slate-strong)}',
          '.at-cx-card-text{display:block;font-size:14px;line-height:1.5;white-space:pre-wrap;',
          'word-break:break-word;color:var(--at-primary)}',
          '.at-cx-card.is-del .at-cx-card-text{color:var(--at-slate)}',
          '.at-cx-card-meta{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;',
          'line-height:1.4;color:var(--at-muted);flex-wrap:wrap}',
          /* ★ PC 263 轮 .cp-pic：正文之下、时间之上；148 高裁图 + 右下「看大图」角标。
           * 用 span 包 img，不能嵌 button（.at-cx-card 自身就是 button）。 */
          '.at-cx-card-pic{position:relative;display:block;margin-top:9px;border-radius:9px;',
          'overflow:hidden;background:var(--at-chip);cursor:zoom-in}',
          '.at-cx-card-pic img{display:block;width:100%;height:148px;object-fit:cover;',
          'object-position:center top;transition:opacity var(--atx-dur-fast) ease}',
          '.at-cx-card-pic:hover img{opacity:.82}',
          '.at-cx-card-zoom{position:absolute;right:6px;bottom:6px;height:19px;padding:0 7px;',
          'border-radius:6px;background:var(--atx-zoom-bg);color:#fff;font-size:10px;',
          'display:flex;align-items:center;pointer-events:none}',
          /* ★ PC 280d：平板/PC 空态是「一句说明文字」，不是手机端那个图标块 + 虚框。
           * 顺序也在空心卡之后（入口先于解释），见 wxml 257–289 行。 */
          '.at-cx-empty{margin:6px 2px;font-size:13px;line-height:1.7;color:var(--at-text2)}',
          /* ★ PC 195/196 轮：已删除名单分页，34 高居中；终点行点不动、字色再退一档。 */
          '.at-cx-more{height:34px;margin:0 0 8px;display:flex;align-items:center;justify-content:center;',
          'width:100%;border:0;background:transparent;font-size:13px;color:var(--at-slate);cursor:pointer}',
          '.at-cx-more:hover:not(.is-end){color:var(--at-primary)}',
          '.at-cx-more.is-end{font-size:12px;color:var(--at-muted);cursor:default}',
          /* ★ 272 轮：底部留白＝滚动上限 ⇒ 写末尾占位块，不用 padding-bottom。 */
          '.at-cx-endgap{height:98px;flex:0 0 98px}',
          /* ★★ v1.4 录音降落区（PC `.cp-tail` 同构）——
           * 抽屉 flex 流里夹在列表与底边之间的一块 0 高区域，起录才长到 42% 抽屉高：
           * 列表因此"整体上滑"，底部露出那块渐变（黄族三停：warm → soft → 抽屉底）。
           * ⚠️ 高度必须由**布局**给（flex 项），不能用 padding/absolute —— 它要让列表变矮；
           * ⚠️ 顶端那一停必须等于抽屉底色（--at-elevated），否则上沿会接出一条横色带。 */
          '.at-cx-tail{position:relative;flex:0 0 auto;width:100%;height:0;overflow:hidden;',
          'background:linear-gradient(0deg,var(--at-yellow-warm) 0%,var(--at-yellow-soft) 34%,var(--at-elevated) 100%);',
          'transition:height var(--atx-dur-pop) cubic-bezier(.22,.68,.36,1)}',
          /* 展开那一帧挂 .is-snap 关掉过渡：起录要「瞬时长高 + 列表滑到底」一步到位，
           * 高度还在过渡中滚动算出来的是旧 max，滚不到真正的底（PC 101 轮同一条推导）。 */
          '.at-cx-tail.is-snap{transition:none}',
          /* 新胶囊落位那一下的「点亮」：更饱和的一层黄从底部升起再退掉（PC cpTailGlow 0.82s / 峰值 .32） */
          '.at-cx-tail::after{content:"";position:absolute;left:0;right:0;top:0;bottom:0;opacity:0;',
          'background:linear-gradient(0deg,var(--at-yellow) 0%,rgba(255,208,47,0) 62%)}',
          '.at-cx-tail.is-lit::after{animation:atxTailGlow .82s cubic-bezier(.22,.68,.36,1) .05s 1}',
          '@keyframes atxTailGlow{0%{opacity:0}22%{opacity:.32}100%{opacity:0}}',
          /* 降落区里的录音行：贴着这块区域的底边，随高度长出来 —— 一行三件，与 PC `.cp-rec` 同序 */
          '.at-cx-tail .at-cx-rec{position:absolute;left:0;right:0;bottom:0;border:0;background:transparent}',
          /* ★ 新卡片飞入（PC `.cp-sw.pop` / cpPop）：整张卡从下方 60 升起 + 轻微放大。
           * PC 挂在**行容器**上是因为气泡被 overflow:hidden 裁；插件里卡片就是滚动容器的
           * 直接子元素、末尾又有 98 高占位 ⇒ 位移 60 不会越出可视区，直接挂卡片即可。
           * backwards（不是 both）：播完不保留 to 帧，免得 transform 常驻把文字弄发虚。 */
          '.at-cx-card.is-pop{animation:atxLand .52s cubic-bezier(.42,0,.26,1) backwards}',
          '@keyframes atxLand{from{opacity:0;transform:translateY(60px) scale(.96)}',
          'to{opacity:1;transform:translateY(0) scale(1)}}',

          /* ---- side action column（PC .cp-ops / .cp-sw-b：72 容器 · 64×46 键） ---- */
          '.at-cx-ops{position:fixed;z-index:132;display:flex;flex-direction:column;align-items:center;',
          'gap:6px;pointer-events:auto}',
          '.at-cx-op{display:flex;align-items:center;justify-content:center;gap:5px;width:64px;height:46px;',
          'padding:0 4px;border:0;border-radius:12px;background:var(--at-solid);',
          'color:var(--at-on-solid);font-size:12px;font-weight:600;line-height:1;cursor:pointer;',
          'white-space:nowrap;box-shadow:var(--at-sh-float);overflow:hidden;',
          'transition:opacity var(--atx-dur-fast) ease,transform var(--atx-dur-fast) ease,',
          'background var(--atx-dur-fast) ease}',
          '.at-cx-root .at-cx-op{font-size:12px!important;font-weight:600;line-height:1}',
          '.at-cx-root .at-cx-op span{font-size:12px;line-height:1;white-space:nowrap}',
          '.at-cx-op:hover:not(:disabled){opacity:.82}',
          '.at-cx-op:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          /* 263 轮：实心危险键走派生令牌，深色下不能直接用 --at-danger */
          '.at-cx-op.is-danger{background:var(--atx-fill-danger);color:var(--atx-on-fill-danger)}',
          '.at-cx-op.is-danger:hover:not(:disabled){opacity:.82}',
          '.at-cx-op.is-danger:active:not(:disabled){background:var(--atx-danger-press)}',
          '.at-cx-op.is-dim{opacity:.4;cursor:not-allowed}',
          '.at-cx-ops.is-inside .at-cx-op{width:44px;height:42px;padding:0}',
          '.at-cx-ops.is-inside .at-cx-op span{display:none}',

          /* ---- 字段 / 按钮 / 脑图列表（右侧抽屉共用，PC .ep / .cs 同规格） ---- */
          /* 套 `.at-input` 基线：38 高 / 圆角 10 / 1px `--at-field-line` / 14px；
           * 聚焦只变描边（`--at-text2`），不吃外圈 outline。 */
          '.at-cx-input,.at-cx-select,.at-cx-area{width:100%;border:1px solid var(--at-field-line);',
          'border-radius:10px;background:var(--at-card);color:var(--at-primary);outline:none;font-size:14px}',
          '.at-cx-input,.at-cx-select{height:38px;padding:0 10px}',
          '.at-cx-area{padding:9px 10px;line-height:1.6;resize:vertical}',
          '.at-cx-input:focus,.at-cx-select:focus,.at-cx-area:focus{border-color:var(--at-text2)}',
          '.at-cx-input::placeholder,.at-cx-area::placeholder{color:var(--at-muted);font-size:13px}',
          '.at-cx-row{display:flex;align-items:center;gap:8px;margin-top:9px;flex-wrap:wrap}',
          '.at-cx-row .at-cx-select{flex:1 1 120px;width:auto;min-width:0}',
          '.at-cx-btn{height:40px;padding:0 14px;border:1px solid var(--at-hairline-strong);border-radius:10px;',
          'background:var(--at-card);color:var(--at-slate);font-size:14px;font-weight:600;cursor:pointer;',
          'display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;',
          'transition:background var(--atx-dur-fast) ease,opacity var(--atx-dur-fast) ease,',
          'transform var(--atx-dur-fast) ease}',
          '.at-cx-btn:hover:not(:disabled){background:var(--at-chip);color:var(--at-primary)}',
          '.at-cx-btn:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.at-cx-btn.is-primary{background:var(--at-solid);border-color:transparent;color:var(--at-on-solid)}',
          '.at-cx-btn.is-primary:hover:not(:disabled){color:var(--at-on-solid);opacity:.82}',
          '.at-cx-btn.is-danger{color:var(--at-danger);border-color:var(--at-danger);background:var(--at-card)}',
          '.at-cx-btn:disabled{opacity:.4;cursor:not-allowed}',
          '.at-cx-hint{font-size:12px;color:var(--at-text2);line-height:1.55;margin-top:8px}',
          /* ★★ v1.5 转脑图候选卡 → PC `drawer.wxss` 的 `.dw-card.mm`：
           * 12 圆角白卡、11/12 内距、名称 14/500、下面一条标签行（项目色点 / 格式 /
           * 「当前」chip）。选中＝黄软底＋黄边；锁态＝整卡压 .45（同 `.dw-card.mm.lock`）。
           * 顶部那张 lead 卡是「语义转脑图」（PC `drawers.buildMindmapPick` 的 AI_PICK_ID），
           * 黄软底虚框，与下面"挑一张现有的"分开。 */
          '.at-cx-map-list{display:flex;flex-direction:column;gap:8px;flex:1 1 auto;min-height:0;overflow:auto}',
          '.at-cx-map-card{display:flex;flex-direction:column;gap:7px;flex:0 0 auto;width:100%;',
          'padding:11px 12px;border:1px solid var(--at-hairline);border-radius:12px;',
          'background:var(--at-card);text-align:left;cursor:pointer;',
          'transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease}',
          '.at-cx-map-card:hover:not(:disabled){background:var(--at-chip)}',
          '.at-cx-map-card.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-cx-map-card.is-lead{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
          'border-style:dashed}',
          /* PC `.dw-card.mm.lock`：门控住的脑图整卡压 .45。组件渲染的是 `.is-lock`，
           * 只写 `:disabled` 会让锁态"有类名没样式"（门控期间并不 disabled）。 */
          '.at-cx-map-card.is-lock,.at-cx-map-card:disabled{opacity:.45;cursor:not-allowed}',
          '.at-cx-map-name{font-size:14px;font-weight:500;color:var(--at-primary);',
          'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
          '.at-cx-map-tags{display:flex;align-items:center;gap:6px}',
          '.at-cx-map-tag{padding:2px 8px;border:1px solid var(--at-hairline);border-radius:999px;',
          'background:var(--at-elevated);font-size:11px;color:var(--at-slate);white-space:nowrap}',
          '.at-cx-map-tag.is-current{border-color:var(--at-yellow);color:var(--at-primary);font-weight:500}',
          '.at-cx-map-tags .at-cx-proj-dot{width:12px;height:12px;flex:0 0 12px}',
          '.at-cx-map-lead-head{display:flex;align-items:center;gap:7px}',
          '.at-cx-map-desc{font-size:12px;line-height:1.5;color:var(--at-text2)}',

          /* ---- 录音行（302 / 267：黄软底 + 等宽倒数 + 5 根波纹） ----
           * v1.4 起它住在**降落区底部**（PC `.cp-tail` 里那一行），不再占标题带下面那一条：
           * 抽屉一开顶上就横一条黄带，与 PC「只有 头 / 列表 / 降落区 三段」的读法不符。 */
          /* ★ PC 302 轮 .cp-stop-scrim：录音时全屏透明挡板，点任意处即停。
           * 没有它，「轻点任意处停止」这句话是假的（只能点悬浮键或按 Esc）。 */
          '.at-cx-stop-scrim{position:fixed;z-index:151;background:transparent;pointer-events:auto;cursor:pointer}',
          '.at-cx-rec{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:10px 14px;',
          'background:var(--at-yellow-soft);border-top:1px solid var(--at-yellow-line);',
          'font-size:12px;color:var(--at-text2)}',
          '.at-cx-rec-t{flex:1 1 auto;min-width:0;margin-left:auto;text-align:right;',
          'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
          '.at-cx-rec-num{font-family:var(--atx-font-num);font-variant-numeric:tabular-nums;',
          'font-size:18px;font-weight:700;line-height:1;color:var(--at-primary)}',
          '.at-cx-wave{display:flex;align-items:center;gap:2px;height:18px;flex:0 0 auto}',
          '.at-cx-wave i{display:block;width:2px;height:100%;border-radius:1px;',
          'background:var(--at-yellow-deep);transform-origin:center;animation:atxWave .9s ease-in-out infinite}',
          '.at-cx-wave i:nth-child(1){height:7px;animation-delay:0s}',
          '.at-cx-wave i:nth-child(2){height:13px;animation-delay:.12s}',
          '.at-cx-wave i:nth-child(3){height:18px;animation-delay:.24s}',
          '.at-cx-wave i:nth-child(4){height:11px;animation-delay:.36s}',
          '.at-cx-wave i:nth-child(5){height:6px;animation-delay:.48s}',
          /* 识别中：同一组波纹放慢并压淡 —— 采集已经停了，摆动只是「在转写」的活口 */
          '.at-cx-wave.is-asr i{animation-duration:1.5s;opacity:.62}',

          /* ---- 右侧副抽屉（写 / 编辑 / 转待办 / 转脑图，PC .ep / .cp-sheet.sub 同族） ---- */
          /* ★ PC 274 轮口径：副面板开在主抽屉右侧时挡板「连压暗都不要」——
           * 用户此刻要看的是这句话会插进哪份名单，压暗左侧就把唯一那份上下文蒙掉了。
           * 挡板只保留「点外面 = 关面板」，故 background:transparent 但 pointer-events:auto。
           * 对齐 小程序前端/components/capsule/capsule.wxss 的 .cp-sheet-scrim.sub。 */
          '.at-cx-submask{position:fixed;z-index:140;background:transparent;pointer-events:auto;',
          'animation:atxFade var(--atx-dur-fade) ease-out}',
          /* 只淡入、不做位移：它开在主抽屉右侧并排，滑入会抢左边那条抽屉的动线 */
          '.at-cx-sub{position:fixed;z-index:141;display:flex;flex-direction:column;min-width:0;height:auto;',
          'border:1px solid var(--at-hairline);border-radius:16px;background:var(--at-elevated);',
          'box-shadow:var(--atx-sh-sub);overflow:hidden;pointer-events:auto;',
          'animation:atxFade var(--atx-dur-fade) ease-out}',
          '.at-cx-sub-head{flex:0 0 52px;height:52px;display:flex;align-items:center;justify-content:space-between;',
          'gap:8px;padding:0 14px;background:var(--at-head-bg);border-bottom:1px solid var(--at-head-line)}',
          '.at-cx-sub-title{font-size:16px;font-weight:500;letter-spacing:-.2px}',
          /* flex:0 1 auto：面板被 max-height 夹住时正文自己收缩并内部滚，底带不会被裁掉 */
          '.at-cx-sub-body{flex:0 1 auto;min-height:0;overflow:auto;padding:12px 14px 0}',
          '.at-cx-sub-foot{flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:8px;',
          'padding:10px 14px 4px;border-top:1px solid var(--at-hairline-soft);background:var(--at-head-bg)}',
          '.at-cx-sub-foot .at-cx-btn{flex:1 1 0;min-width:0}',
          '.at-cx-sub .at-cx-field{margin-bottom:14px}',
          /* 字段名与 PC `.sd-label` 同档：13 / 500 / **正墨**（退一档的灰在深色下读成禁用） */
          '.at-cx-sub .at-cx-label{display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:var(--at-primary)}',
          '.at-cx-sub .at-cx-area{min-height:148px;max-height:296px}',
          /* 创建面板的输入区 132 高（副抽屉窄，更早折行） */
          '.at-cx-sub.is-compose .at-cx-area{height:132px;min-height:132px;max-height:132px}',
          /* ★★ v1.5 第二档 `.o1`（转待办 `.sd.o1` ／ 转脑图 `.dw.o1`）：
           * 两块都 320 宽全高、左缘 +270（与主抽屉重叠 50）；结构照 `.sd`：
           * 灰标题带 52 / 正文 flex:1 自滚 / 底带 56 贴底、**只一颗主键**。
           * v1.4 把转脑图当成 `.sd3`（260 / +12）是误认 —— 那是表单里
           * 「选择其他项目」的三级项目副弹窗。 */
          '.at-cx-sub.is-fill .at-cx-sub-body{flex:1 1 auto;display:flex;flex-direction:column;padding-bottom:12px}',
          '.at-cx-sub.is-fill .at-cx-sub-foot{flex:0 0 56px;height:56px;padding:10px 14px;',
          'justify-content:flex-end;background:var(--at-elevated)}',
          '.at-cx-sub.is-o1 .at-cx-sub-foot{border-top:0;gap:10px}',
          '.at-cx-sub.is-o1 .at-cx-sub-foot .at-cx-btn{flex:1 1 0}',
          /* `.sd-cancel`：标题带右上那颗 28 高描边胶囊（close 13 ＋「取消」），不是圆 × */
          '.at-cx-hcancel{height:28px;padding:0 10px;border:1px solid var(--at-hairline-strong);',
          'border-radius:999px;background:var(--at-elevated);color:var(--at-primary);font-size:12px;',
          'display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;',
          'white-space:nowrap;transition:background var(--atx-dur-fast) ease}',
          '.at-cx-hcancel:hover{background:var(--at-chip)}',
          /* `.sd-req`：字段名后面那枚「必填」小标 */
          '.at-cx-req{margin-left:6px;padding:1px 6px;border-radius:6px;background:var(--at-chip);',
          'color:var(--at-muted);font-size:11px;font-weight:400}',
          /* 待办内容框：PC `.sd-area` 起手 104（4 行），到这里可以长到 296 */
          '.at-cx-sub.is-todo .at-cx-area{height:104px;min-height:104px;max-height:296px;',
          'flex:0 0 auto}',
          /* 紧急度胶囊 → PC `.sd-chip`：白底描边 13 号、**无小色点**；
           * 选中态的三支色（soft 底 / main 描边 / text 字）由档位色板行内给，
           * 不再统一涂黄 —— 四档要一眼看出选的是谁。 */
          '.at-cx-chips{display:flex;flex-wrap:wrap;gap:6px}',
          '.at-cx-chip{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;',
          'border:1px solid var(--at-hairline);background:var(--at-card);font-size:13px;color:var(--at-slate);',
          'cursor:pointer;transition:background var(--atx-dur-fast) ease,border-color var(--atx-dur-fast) ease}',
          '.at-cx-chip:hover{background:var(--at-chip)}',
          '.at-cx-chip.is-on{font-weight:500}',
          /* ★★ 归属项目 → PC `.sd-list` / `.sd-row`（form-drawer.wxss 295 行）：
           * 一行一个、40 高、10 圆角、左端 16 色点、名称 14/17、选中黄软底＋黄边＋勾。
           * v1.4 用 `<select>` 下拉，既不显示项目色也读不出当前选的是谁。 */
          '.at-cx-proj-list{display:flex;flex-direction:column;gap:6px}',
          '.at-cx-proj{display:flex;align-items:center;gap:8px;width:100%;height:40px;padding:0 12px;',
          'border:1px solid var(--at-hairline);border-radius:10px;background:var(--at-card);',
          'text-align:left;cursor:pointer;transition:background var(--atx-dur-fast) ease}',
          '.at-cx-proj:hover{background:var(--at-chip)}',
          '.at-cx-proj.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-cx-proj.is-on .at-cx-proj-t{font-weight:500}',
          '.at-cx-proj-dot{width:16px;height:16px;border-radius:999px;flex:0 0 16px}',
          /* 「选择其他项目」左端是 16 的图标而不是 16 色点 —— 文字起点必须和上面那些行对齐 */
          '.at-cx-proj.is-pick .at-ico{flex:0 0 16px}',
          '.at-cx-proj-t{flex:1 1 auto;min-width:0;font-size:14px;line-height:17px;',
          'color:var(--at-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
          '.at-cx-proj-go{flex:0 0 auto;display:flex;align-items:center;opacity:.45}',
          '.at-cx-edit-scrim{position:fixed;z-index:133;background:transparent;pointer-events:auto}',
          '.at-cx-edit-thumb{width:72px;height:72px;border-radius:9px;object-fit:cover;display:block;',
          'border:1px solid var(--at-hairline)}',
          '.at-cx-edit-imgwrap{position:relative;width:72px;height:72px;flex:0 0 auto}',
          '.at-cx-edit-imgx{position:absolute;top:3px;right:3px;width:20px;height:20px;padding:0;border:0;',
          'border-radius:6px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;line-height:20px;',
          'text-align:center;cursor:pointer}',

          /* ---- confirm / image preview ---- */
          '.at-cx-modal-layer{position:fixed;z-index:160;display:flex;align-items:center;justify-content:center;',
          'padding:24px;background:var(--at-mask);pointer-events:auto;',
          'animation:atxFade var(--atx-dur-fade) ease-out}',
          '.at-cx-modal{width:min(360px,100%);max-height:100%;overflow:auto;border:1px solid var(--at-hairline);',
          'border-radius:16px;background:var(--at-elevated);box-shadow:var(--at-sh-pop);padding:18px}',
          '.at-cx-modal-title{font-size:16px;font-weight:600;margin:0 0 8px}',
          '.at-cx-modal-body{font-size:13px;line-height:1.7;color:var(--at-text2);margin:0 0 16px}',
          '.at-cx-modal-actions{display:flex;justify-content:flex-end;gap:8px}',
          '.at-cx-preview{position:fixed;z-index:170;display:flex;align-items:center;justify-content:center;',
          'padding:24px;background:rgba(12,12,13,.72);pointer-events:auto;',
          'animation:atxFade var(--atx-dur-fade) ease-out}',
          '.at-cx-preview img{max-width:100%;max-height:100%;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.4)}',
          '.at-cx-preview-x{position:absolute;top:14px;right:14px;width:34px;height:34px;padding:0;',
          'border:1px solid rgba(255,255,255,.5);border-radius:50%;background:rgba(0,0,0,.35);cursor:pointer;',
          'display:flex;align-items:center;justify-content:center}',
          '/* 统一 active / 补齐缺失 hover：is-lock 的 .45 是 C-12 登记的锁态，is-end 不可点 */',
          '.at-cx-root :where(.at-cx-hcancel,.at-cx-hollow,.at-cx-more:not(.is-end),',
          '.at-cx-map-card:not(.is-lock),.at-cx-chip,.at-cx-proj,.at-cx-btn,.at-cx-op,',
          '.at-cx-hbtn,.at-cx-hclose,.at-cx-edit-imgx,.at-cx-preview-x):active:not(:disabled)',
          '{transform:translateY(1px);opacity:.78}',
          '.at-cx-root :where(.at-cx-edit-imgx,.at-cx-preview-x):hover{opacity:.82}'
        ].join('')

        /* ---------------------------------------------------------------- state --- */
        /* ★ v1.8：录音从「浏览器语音识别」改成「真采集 → 转写」，两个在途标记：
         * recTimer 管 60s 倒数；asrSeq 管「这一轮还算不算数」（关列表 / 重录即作废）。 */
        var recTimer = null, asrSeq = 0
        function cap() { return B.get().ui.capsule || {} }
        function patchCap(p) { B.ui({ capsule: Object.assign({}, cap(), p) }) }
        function openCapsule(seed) {
          disposeRecord()
          B.ui({ capsule: {
            open: true, seed: seed || '', selected: [], delMode: false, multi: false,
            composeOpen: false, composeText: '', composeImage: null, saving: false,
            editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false, todoProjectId: '', todoUrgency: 'mid',
            todoText: '', mapPick: false, mapPickedId: '', mapBusy: '', todoBusy: false,
            deleteOpen: false, previewUri: '', phase: '', clock: '', landAt: 0,
            landFrom: '', landId: ''
          } })
        }
        function closeCapsule() {
          disposeRecord()
          B.ui({ capsule: null })
        }
        /* 清「本轮录音」的界面标记与倒数，但**不碰采集** —— 收尾还要用那段音频。 */
        function clearRecordUi() {
          if (recTimer) { clearInterval(recTimer); recTimer = null }
          if (B.get().ui.capsule) patchCap({ phase: '', clock: '' })
        }
        /* 放弃这一轮：关抽屉 / 切页 / 卸载时用。在途转写按 asrSeq 作废。 */
        function disposeRecord() {
          asrSeq += 1
          clearRecordUi()
          if (AT.voice) AT.voice.abort()
        }
        /* 保留旧名：99-entry 的卸载钩子与内部关闭路径仍按 `stopRecord` 调。 */
        function stopRecord() { disposeRecord() }
        function recErrorText(e) {
          var kind = e && e.kind
          if (kind === 'permission') return '麦克风权限被拒绝，请在系统设置里允许 DSH 使用麦克风'
          if (kind === 'deviceMissing') return '没找到可用的麦克风，插上设备后重试'
          if (kind === 'unavailable') return '当前宿主打不开麦克风，请改用「写一条」'
          if (kind === 'empty') return '没有录到声音，点开始后说一段话'
          return (e && e.message) || '录音失败，请重试'
        }
        async function startRecord() {
          if (!AT.voice || !AT.voice.supported()) {
            B.toast('当前宿主没有麦克风接口，请用「写」记一条', 'danger')
            return
          }
          var token = ++asrSeq
          var left = K.recMax
          patchCap({ phase: 'rec', clock: String(left), composeOpen: false, editId: '', editImageUri: '',
            todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
          try {
            await AT.voice.start()
          } catch (e) {
            if (token !== asrSeq) return
            clearRecordUi()
            B.toast(recErrorText(e), 'danger')
            return
          }
          /* 等麦克风授权那几秒里，用户可能已经点了停止 / 关了列表 */
          if (token !== asrSeq || !cap().open || cap().phase !== 'rec') {
            if (AT.voice.recording()) AT.voice.abort()
            return
          }
          recTimer = setInterval(function () {
            left -= 1
            if (left <= 0) { finishRecord(); return }
            patchCap({ clock: String(left) })
          }, 1000)
        }
        /* 结束录音 → 转写 → 写库。
         * ★ v1.8：这里不再假设「识别已经同步给出文字」—— 停止只是采集结束，文字要等
         *   voice.transcribe（DSH 本地 SenseVoice 优先、后端 /asr 兜底）回来。
         *   中间那段是 phase:'asr'，列表必须一直开着（v1.6 的护栏照旧生效）。 */
        async function finishRecord(text) {
          var typed = String(text || '').trim()
          if (typed) { disposeRecord(); await saveVoice(typed); return }
          var c = cap()
          if (!c.open || c.phase !== 'rec') return      /* 防重入：识别中 / 已结束 */
          if (recTimer) { clearInterval(recTimer); recTimer = null }
          var token = ++asrSeq
          patchCap({ phase: 'asr', clock: '' })
          var audio = null
          try {
            audio = await AT.voice.stop(K.recMax)
          } catch (e) {
            if (token !== asrSeq) return
            clearRecordUi()
            B.toast(recErrorText(e), 'danger')
            return
          }
          if (token !== asrSeq) return
          if (!audio || !audio.bytes || audio.bytes.length <= 44) {
            clearRecordUi()
            B.toast('没有录到声音，点开始后说一段话', 'danger')
            return
          }
          var said = ''
          try {
            var out = await AT.voice.transcribe(audio.bytes)
            said = String((out && out.text) || '').trim()
          } catch (e) {
            if (token !== asrSeq) return
            clearRecordUi()
            B.toast('语音识别没成功：' + ((e && e.message) || '请重试'), 'danger')
            return
          }
          if (token !== asrSeq) return
          /* 识别期间用户关掉了列表：照写结果，但不再改一个已经不存在的界面 */
          if (B.get().ui.capsule) clearRecordUi()
          if (!said) { B.toast('没听清，再说一次？', 'danger'); return }
          await saveVoice(said)
        }
        /* 唯一一处「语音 → 胶囊」的写库路径。v1.6 / v1.7 的护栏全留在这里：
         * `open:true` 保证这段异步流程任何一步都不会把列表关掉；
         * `landFrom:'voice'` 才是降落区展开 + 新卡飞入的那条路径（文字创建没有）。 */
        async function saveVoice(text) {
          var value = String(text || '').trim()
          if (!value) { B.toast('没有识别到文字，请重试或点击「写一条」'); return }
          var res
          try {
            res = await B.actions.addCapsule(value, { source: 'voice' })
          } catch (e) {
            /* 写库异常不许冒泡成 unhandled rejection（用户侧表现就是「闪退」） */
            B.toast('记下失败，请重试', 'danger')
            return
          }
          if (!res || !res.ok) return
          B.toast('已记下这条闪念')
          if (!B.get().ui.capsule) return
          /* landAt 是「新胶囊飞入」的信号：组件据此给最后一条挂 .is-pop 并点亮降落区。 */
          patchCap({ open: true, selected: [], landFrom: 'voice', landId: '',
            landAt: Date.now() })
        }
        function toggleRecord() {
          var c = cap()
          if (!c.open) { openCapsule(''); return }
          if (c.phase === 'rec') { finishRecord(); return }
          if (c.phase === 'asr') return       /* 识别中不重复起录 */
          startRecord()
        }
        function openCompose() {
          if (!cap().open) openCapsule('')
          patchCap({ composeOpen: true, composeText: cap().seed || '', composeImage: null,
            editId: '', editImageUri: '', todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
        }
        async function saveCompose() {
          var c = cap(), text = String(c.composeText || '').trim()
          if (!text) { B.toast('还没有写内容'); return }
          if (c.saving) return
          var img = c.composeImage || null
          var before = {}
          Core.capsules(B.get()).forEach(function (x) { before[x.id] = 1 })
          /* ★ PC 268 轮 onComposeSave → _landCapsule(id, false)：文字创建的进入效果 =
           * 「面板先拆掉 → 新卡**首次挂载**就带 .is-pop → 无动画滚到底」三件事同帧落定。
           * ⚠️ landAt 必须写在 addCapsule 的乐观 store.set **之前**：写库成功后才补，
           *    新卡会先原地出现一帧、再跳回 +60px 重播 —— 就是「进入效果不对」的根因。
           * ⚠️ 小程序用 200ms 空等给 .cp-sheet 退场留帧；插件副抽屉拆除是瞬时的，
           *    改用两次 patch 分帧达到同一「面板与卡片不同帧」，不制造 200ms 丢字窗口。 */
          patchCap({ saving: true, composeOpen: false, composeText: '', seed: '', composeImage: null,
            selected: [], landAt: 0, landFrom: '', landId: '' })
          patchCap({ landFrom: 'text', landAt: Date.now() })
          var res
          try {
            res = await B.actions.addCapsule(text, { source: 'text', imageUri: img })
          } catch (e) {
            /* 写库异常不许冒泡成 unhandled rejection；落位信号一并撤掉 */
            patchCap({ saving: false, landAt: 0, landFrom: '', landId: '' })
            B.toast('记下失败，请重试', 'danger')
            return
          }
          if (!res || !res.ok) {
            patchCap({ saving: false, landAt: 0, landFrom: '', landId: '' })
            return
          }
          /* 精确锁定这次新建的那条（PC `_popId`）：resync 会用服务端 id 覆盖乐观 id，
           * 故按保存前名单取差集；避免 720ms 窗口内又新增时动画落到别的卡上。
           * ⚠️ 这次 patch 不换类名（兜底已挂在最后一条），CSS 动画不会重启。 */
          var fresh = Core.capsules(B.get()).filter(function (x) { return !before[x.id] })[0]
          var newId = fresh ? fresh.id : (res.capsule && res.capsule.id) || ''
          patchCap({ saving: false, landId: newId })
          B.toast('已接住这条闪念')
        }

        /* -------------------------------------------------------- content bounds --- */
        function measureComposerInset(b) {
          if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return 0
          var nodes, i, best = 0
          var bottom = b.top + b.height
          try {
            nodes = document.querySelectorAll('[data-composer-card],[data-composer-input]')
          } catch (e) { return 0 }
          for (i = 0; i < nodes.length; i++) {
            var el = nodes[i]
            if (!el || typeof el.getClientRects !== 'function') continue
            if (!el.getClientRects().length) continue
            var r = el.getBoundingClientRect()
            if (!r || r.height < 24 || r.width < 80) continue
            if (r.top < b.top || r.top > bottom) continue
            var inset = bottom - r.top
            if (inset > best) best = inset
          }
          return best
        }
        function measureBounds() {
          if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return null
          var overlay = document.querySelector('[data-shell-overlay]')
          var frame = overlay && overlay.parentElement
          if (!frame) return null
          var rightbar = null
          try { rightbar = frame.querySelector('[data-rightbar-col]') } catch (e) { rightbar = null }
          var center = rightbar && rightbar.previousElementSibling
          var r
          if (center && typeof center.getBoundingClientRect === 'function') {
            r = center.getBoundingClientRect()
          } else {
            r = frame.getBoundingClientRect()
          }
          if (!r || !r.width || !r.height) return null
          var b = { left: r.left, top: r.top, width: r.width, height: r.height, composerInset: 0 }
          b.composerInset = measureComposerInset(b)
          return b
        }
        function fallbackBounds() {
          var w = (typeof window !== 'undefined' && window.innerWidth) || 1200
          var h = (typeof window !== 'undefined' && window.innerHeight) || 800
          return { left: 0, top: 0, width: w, height: h, composerInset: 0 }
        }
        function usableOf(b) {
          /* 输入框占住的那一段不属于悬浮键的可放区：默认位置 / 拖动边界 /
           * 已保存的位置都按同一块“可用区”计算，所以输入框长高时悬浮键会自动上移。 */
          var reserved = b.composerInset ? b.composerInset + 12 : 0
          var maxReserved = Math.max(0, b.height - FAB_MARGIN * 2 - FAB_SIZE)
          reserved = Math.min(reserved, maxReserved)
          return {
            w: Math.max(0, b.width - FAB_MARGIN * 2 - FAB_SIZE),
            h: Math.max(0, b.height - FAB_MARGIN * 2 - FAB_SIZE - reserved)
          }
        }
        function defaultPos(b) {
          /* 窄内容区把悬浮键组默认锚到左下：右侧留给动作列，否则 5 颗动作键 +
           * 「写」+ 悬浮键会连成一列。PC 平板竖屏口径也是「点左下角的麦克风」
           * （capsule.wxml 287 行）。只影响未保存过位置的新用户，拖拽位置照旧优先。 */
          return { x: b && b.width < K.wideBound ? 0 : 1, y: 1 }
        }
        function pointOf(b, p) {
          var u = usableOf(b)
          return { x: b.left + FAB_MARGIN + p.x * u.w, y: b.top + FAB_MARGIN + p.y * u.h }
        }
        function loadPos() {
          try {
            if (typeof window === 'undefined' || !window.localStorage) return null
            var raw = window.localStorage.getItem(POS_KEY)
            if (!raw) return null
            var p = JSON.parse(raw)
            var x = Number(p && p.x), y = Number(p && p.y)
            if (!isFinite(x) || !isFinite(y)) return null
            return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }
          } catch (e) { return null }
        }
        function savePos(p) {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(POS_KEY, JSON.stringify({ x: p.x, y: p.y }))
            }
          } catch (e) { /* private mode / quota */ }
        }
        function sameBounds(a, b) {
          return !!a && !!b && a.left === b.left && a.top === b.top &&
            a.width === b.width && a.height === b.height && a.composerInset === b.composerInset
        }
        function clamp(v, min, max) {
          if (max < min) return min
          return Math.min(max, Math.max(min, v))
        }
        /* 窗口适配统一由样式标准的 geom() 给：主抽屉 / 动作列 / 右侧副抽屉 /
         * 编辑面板的几何只在这一处算，组件与判据读同一个真源。 */
        var geomOf = St.geom
        function opsCount(c, selected) {
          if (!c || !c.open) return 0
          if (c.editId || c.composeOpen || c.todoPick || c.mapPick || c.deleteOpen || c.previewUri ||
            c.phase === 'rec' || c.phase === 'asr') return 0
          if (c.delMode) return (c.multi || selected.length) ? 1 : 0
          if (c.multi) return 5
          return selected.length ? 5 : 0
        }
        function findCard(drawer, id) {
          if (!drawer || typeof drawer.querySelectorAll !== 'function') return null
          var nodes = drawer.querySelectorAll('[data-cid]'), i
          for (i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute('data-cid') === id) return nodes[i]
          }
          return null
        }

        /* ------------------------------------------------------------- component --- */
        function FloatingCapsule() {
          var s = B.useStore()
          var c = s.ui.capsule
          var dark = AT.icons.useDark()
          var boundsState = React.useState(measureBounds)
          var bounds = boundsState[0]
          var setBounds = boundsState[1]
          var posState = React.useState(loadPos)
          var savedPos = posState[0]
          var setPos = posState[1]
          var dragState = React.useState(false)
          var dragging = dragState[0]
          var setDragging = dragState[1]
          var opsState = React.useState(null)
          var opsTop = opsState[0]
          var setOpsTop = opsState[1]
          /* 196 轮：分页只开在「已删除」名单（正常名单是收件箱，不分页）；
           * 页码是纯视图态，不进 store、不改接口。 */
          var pageState = React.useState(1)
          var page = pageState[0]
          var setPage = pageState[1]
          var longRef = React.useRef(null)
          var dragRef = React.useRef(null)
          var movedRef = React.useRef(false)
          var rootRef = React.useRef(null)
          var drawerRef = React.useRef(null)
          var composeRef = React.useRef(null)
          var editRef = React.useRef(null)
          var posRef = React.useRef(null)
          var boundsRef = React.useRef(bounds)
          boundsRef.current = bounds
          var useIso = React.useLayoutEffect || React.useEffect

          var b = bounds || fallbackBounds()
          var pos = savedPos || defaultPos(b)
          posRef.current = pos
          var g = geomOf(b)
          var open = !!(c && c.open)
          /* ★ v1.4 起 · 打开态：浮键组停到**主抽屉右侧那条竖排带**上（v1.5 对齐
           * PC / 横屏 `.rail-brand` + `.rail-write`：两颗 40 方键，写在上、说在下）。
           * 抽屉一开，保存的归一化坐标只描述"关闭时的位置"，继续沿用会正好落在列表上。
           * 内容区放不下 40 方键时 geom() 把这条带退进抽屉左下角（横排），见样式标准 §3。
           * 关闭态照旧可拖动、可持久化。 */
          var pnt = open ? { x: g.railLeft, y: g.railSayTop } : pointOf(b, pos)
          /* PC wxml 911 行：!editId && !compose && !recPhase ⇒ 三种状态下动作组整列不渲染。 */
          var recOn = !!(c && c.phase === 'rec')
          /* ★ v1.8 · 识别中（phase:'asr'）与录音中同一档：动作组整列不渲染、
           * 写键收起、点外面不关列表 —— 用户刚说完话，界面不该在这两秒里跳。 */
          var asrOn = !!(c && c.phase === 'asr')
          var opsHidden = !!(c && (c.phase === 'rec' || c.phase === 'asr' || c.editId || c.composeOpen))
          /* ★ 右侧副抽屉（写 / 编辑 / 转待办 / 转脑图）一开会盖住那条竖排带（z 149/150 > 141）：
           * 停靠带收起来，否则两颗 40 方键正好盖在面板的底键上。收起期间起录 / 手写都从面板里走。 */
          /* ★ 主面板表单（新建待办 / 新建脑图等）打开时也收起这条带：FAB z150 / 写键 z149
           * 高于主面板抽屉 z55，不收起就会有颗黄色方块浮在弹窗右下角盖住底键。
           * ★ 轮次 6：筛选也改成同一只右侧展开浮层（z55），同样要收 —— 否则会盖住
           *   它的「清除全部筛选」底键。两个主面板状态各写真源，与胶囊四种副抽屉并列。 */
          var railHidden = !!(s.ui && s.ui.form) || !!(s.ui && s.ui.filterKind) ||
            !!(c && (c.todoPick || c.mapPick || c.composeOpen || c.editId))
          /* ★★ v1.5 · **第一档侧转**（PC `.cp.turned`）：只有第二档的两条路径触发。
           * 写 / 编辑是同一层往外展开的 260 副弹窗，父层仍可读可点 ⇒ 不侧转。 */
          var turned = !!(c && (c.todoPick || c.mapPick))
          /* ★★ v1.5 · 表单色板跟着主题走：紧急四档的 soft/main/text 与项目色点，
           * 真值在 10-constants.js（逐值取自小程序 mock.js / theme.js）。
           * ⚠️ 不在这里写 hex —— 行内 style 只做「从色板取哪一支」的选择。 */
          function urgencyPalette(u) { return dark ? (C.URGENCY_DARK[u.key] || u) : u }
          function projectColor(p) {
            var col = p.color ? C.colorOf(p.color) : null
            if (!col) return dark ? C.NONE_COLOR_DARK : C.NONE_COLOR
            return dark ? (C.PROJECT_DARK[p.color] || col.main) : col.main
          }
          var currentMapId = (s.ui && s.ui.mindmapId) || ''
          var list = open ? (c.delMode ? Core.deletedCapsules(s) : Core.capsules(s)) : []
          var selected = open ? (c.selected || []).filter(function (id) {
            return list.some(function (x) { return x.id === id })
          }) : []
          var ops = opsHidden ? 0 : opsCount(c, selected)
          var selectedKey = selected.join('|')
          var deletedCount = Core.deletedCapsules(s).length
          /* _viewOf()：normal list 全量；已删除名单按 DEL_PAGE 分页，末尾给「加载更多 / 已无更多信息」。 */
          var paged = open && !!c.delMode
          var visible = paged ? list.slice(0, K.delPage * page) : list
          var hasMore = paged && visible.length < list.length
          var allShown = paged && !hasMore && list.length > K.delPage
          var writeLeft = g.railWriteLeft
          var writeTop = g.railWriteTop
          var opsGroupH = ops * OPS_KEY_H + Math.max(0, ops - 1) * OPS_GAP
          /* ★ 录音降落区 + 新胶囊落位（PC `.cp-tail` / `.cp-sw.pop`）——
           * 三个量全部**由 store 里的 `landAt` ＋ 时间**算出来，不另存组件状态：
           *   · tailOn  —— **只有语音**起录中 / 刚落位（2.4s 内）⇒ 降落区展开；
           *                 文字创建 `tailOn=false`（PC onComposeSave 同口径），不顶起列表；
           *   · tailLit —— 语音落位后 0.9s 内点亮那一下（PC cpTailGlow）；
           *   · landing —— 落位后 720ms 内，新建那条卡片挂 `.is-pop` 播一次飞入。
           * 为什么不用 state：`finishRecord` / `saveCompose` 在模块作用域，改不到组件状态；
           * 而补丁进来的**那一帧**就要挂上动画，等 effect 会晚一帧（卡片先原地出现再跳）。
           * ⚠️ `landTick` 只是「到点重渲染」的触发器：类与高度都靠上面的时间判重算。 */
          var landState = React.useState(0)
          var landTick = landState[0] /* eslint-disable-line no-unused-vars */
          var setLandTick = landState[1]
          var storeLand = (c && c.landAt) || 0
          var landAge = storeLand ? (Date.now() - storeLand) : Infinity
          var landing = list.length > 0 && landAge < K.landMs
          /* ★ PC `.cp-tail` 起录才展开：文字创建只升卡片，不能把列表顶起半屏。
           * v1.8：识别中也算在「这一轮语音」里 —— 降落区这时候塌下去，刚说完话的界面会抖一下。 */
          var landVoice = !!(c && c.landFrom === 'voice')
          var tailOn = open && (recOn || asrOn || (landVoice && landAge < K.tailHold))
          var tailLit = open && landVoice && landAge < K.tailLit
          var tailSnap = open && (recOn || asrOn)
          function scrollListBottom(smooth) {
            var el = drawerRef.current
            if (!el) return
            var top = (el.scrollHeight || 0) - (el.clientHeight || 0)
            if (!(top > 0)) return
            if (smooth && typeof el.scrollTo === 'function') el.scrollTo({ top: top, behavior: 'smooth' })
            else el.scrollTop = top
          }

          /* ---- content-area measurement ---- */
          React.useEffect(function () {
            var alive = true, raf = null, ro = null, mo = null, timer = null, composerEl = null
            function observeComposer() {
              if (!ro || typeof document === 'undefined' || typeof document.querySelector !== 'function') return
              var next = null
              try { next = document.querySelector('[data-composer-card]') } catch (e) { next = null }
              if (!next || next === composerEl) return
              if (composerEl) { try { ro.unobserve(composerEl) } catch (e) {} }
              composerEl = next
              try { ro.observe(next) } catch (e) { composerEl = null }
            }
            function apply() {
              raf = null
              if (!alive) return
              observeComposer()
              var next = measureBounds()
              if (!next) return
              setBounds(function (prev) { return sameBounds(prev, next) ? prev : next })
            }
            function schedule() {
              if (raf != null) return
              if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                raf = window.requestAnimationFrame(apply)
              } else {
                raf = setTimeout(apply, 0)
              }
            }
            schedule()
            var retry = []
            if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
              retry = [window.setTimeout(schedule, 120), window.setTimeout(schedule, 600), window.setTimeout(schedule, 1600)]
            }
            if (typeof window !== 'undefined' && window.addEventListener) {
              window.addEventListener('resize', schedule)
              window.addEventListener('focusin', schedule, true)
              window.addEventListener('pointerdown', schedule, true)
            }
            var frame = null, center = null
            if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
              var overlay = document.querySelector('[data-shell-overlay]')
              frame = overlay && overlay.parentElement
              try {
                var rb = frame && frame.querySelector('[data-rightbar-col]')
                center = rb && rb.previousElementSibling
              } catch (e) { center = null }
            }
            if (typeof window !== 'undefined' && window.ResizeObserver) {
              try {
                ro = new window.ResizeObserver(schedule)
                if (frame) ro.observe(frame)
                if (center) ro.observe(center)
                /* 输入框长高 / 收短时也要重新量，底部默认位置才能一直让开它。 */
                observeComposer()
              } catch (e) { ro = null }
            }
            /* 插件页 ⇄ 会话切换会替换 centerCol 的直接子节点；只在直接子节点上
             * 挂 MutationObserver，流式输出不会触发它。 */
            if (typeof window !== 'undefined' && window.MutationObserver && center) {
              try {
                mo = new window.MutationObserver(schedule)
                mo.observe(center, { childList: true })
              } catch (e) { mo = null }
            }
            /* 会话是异步恢复的：输入框可能晚于挂载出现。低频兜底测量一次，
             * 保证默认位置始终让开输入框；组件卸载时清掉。 */
            if (typeof window !== 'undefined' && typeof window.setInterval === 'function') {
              timer = window.setInterval(schedule, 1500)
            }
            return function () {
              alive = false
              if (raf != null) {
                if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
                  window.cancelAnimationFrame(raf)
                } else clearTimeout(raf)
              }
              retry.forEach(function (id) { try { clearTimeout(id) } catch (e) {} })
              if (typeof window !== 'undefined' && window.removeEventListener) {
                window.removeEventListener('resize', schedule)
                window.removeEventListener('focusin', schedule, true)
                window.removeEventListener('pointerdown', schedule, true)
              }
              if (ro) { try { ro.disconnect() } catch (e) {} }
              if (mo) { try { mo.disconnect() } catch (e) {} }
              if (timer) { try { clearInterval(timer) } catch (e) {} }
            }
          }, [])

          /* ---- close on outside pointer ----
           * ★ v1.6 · 修「点停止录音 → 整个列表闪退」：录音挡板 stopScrim 的
           * pointerdown 会同步 finishRecord → stopRecord 清 phase → useSyncExternalStore
           * 同步 flush 把挡板从 DOM 摘掉；等事件冒泡到 document 时 event.target 已是
           * 脱离树的节点，root.contains() 返回 false ⇒ 误判「点外面」⇒ closeCapsule()。
           * 两道修正：① 改到**捕获阶段**判断归属（此刻挡板还在树里，composedPath 可用）；
           *          ② 录音态点内容区外只停录、不关列表。 */
          React.useEffect(function () {
            if (!open) return
            if (typeof document === 'undefined' || !document.addEventListener) return
            function onDown(event) {
              var root = rootRef.current
              if (!root || !root.contains) return
              var path = typeof event.composedPath === 'function' ? event.composedPath() : null
              var inside = path ? path.indexOf(root) >= 0 : root.contains(event.target)
              if (inside) return
              var phase = cap().phase
              /* 录音中：这一击是「停止」，不是「关外面」。
               * ★ v1.8：识别中也一样不关 —— 结果还没回来，关掉就等于把刚说的话丢了。 */
              if (phase === 'rec') { finishRecord(); return }
              if (phase === 'asr') return
              closeCapsule()
            }
            document.addEventListener('pointerdown', onDown, true)
            return function () { document.removeEventListener('pointerdown', onDown, true) }
          }, [open])

          /* ---- Escape closes the top-most layer ---- */
          React.useEffect(function () {
            if (!open) return
            if (typeof document === 'undefined' || !document.addEventListener) return
            function onKey(event) {
              if (event.key !== 'Escape') return
              var cur = cap()
              if (!cur.open) return
              event.preventDefault()
              if (cur.previewUri) { patchCap({ previewUri: '' }); return }
              if (cur.deleteOpen) { patchCap({ deleteOpen: false }); return }
              if (cur.editId) { patchCap({ editId: '', editText: '', editImageUri: '' }); return }
              if (cur.todoPick) { patchCap({ todoPick: false, todoOtherOpen: false }); return }
              if (cur.mapPick) { patchCap({ mapPick: false }); return }
              if (cur.composeOpen) { patchCap({ composeOpen: false, composeText: '', composeImage: null }); return }
              if (cur.phase === 'rec') { stopRecord(); return }
              /* 识别中按 Esc 不丢结果（与官方语音输入同一口径：只取消录音，不取消转写） */
              if (cur.phase === 'asr') { event.preventDefault(); return }
              closeCapsule()
            }
            document.addEventListener('keydown', onKey, true)
            return function () { document.removeEventListener('keydown', onKey, true) }
          }, [open])

          /* ---- focus the textarea of the top panel ---- */
          React.useEffect(function () {
            if (!c || !c.open) return
            if (!c.composeOpen && !c.editId) return
            var id = setTimeout(function () {
              if (c.editId && editRef.current) editRef.current.focus()
              else if (c.composeOpen && composeRef.current) composeRef.current.focus()
            }, 0)
            return function () { clearTimeout(id) }
          }, [c && c.composeOpen, c && c.editId])

          /* ---- 录音：降落区瞬时展开 + 列表滑到底（PC 101 / 267 同一套） ----
           * 高度是瞬时长上去的（.is-snap）⇒ 下一帧量到的 max 就是新的底，滚得到真正的底。 */
          React.useEffect(function () {
            if (!open || !recOn) return
            var t = setTimeout(function () { scrollListBottom(false) }, 30)
            return function () { clearTimeout(t) }
          }, [open, recOn])

          /* ---- 新胶囊落位：三个到点重渲染（摘动画类 / 灭灯 / 收降落区）----
           * 720ms 摘 .is-pop（下一次新增才能重播）、900ms 灭灯、2400ms 收降落区并补一次滚底。 */
          React.useEffect(function () {
            if (!open || !storeLand) return
            var timers = [
              setTimeout(function () { setLandTick(storeLand) }, K.landMs + 40),
              setTimeout(function () { setLandTick(storeLand + 1) }, K.tailLit + 40),
              setTimeout(function () { setLandTick(storeLand + 2) }, K.tailHold + 40),
              /* ⚠️ PC 268 轮：落位滚底必须**无动画瞬移**（_scrollBottomTo(false)）。
               * 带 smooth 会把「列表上移」与「卡片升起」叠成两个运动，正是
               * 「没在列表底部停下来」那个反复出现的坏相。 */
              setTimeout(function () { scrollListBottom(false) }, 40),
              setTimeout(function () { scrollListBottom(false) }, K.tailHold + 120)
            ]
            return function () { timers.forEach(function (id) { clearTimeout(id) }) }
          }, [open, storeLand])

          /* ---- align the action column with the selected card ---- */
          useIso(function () {
            if (!c || !c.open || opsHidden) { setOpsTop(null); return }
            var n = opsCount(c, selected)
            var el = drawerRef.current
            if (!n || !el) { setOpsTop(null); return }
            var dr = el.getBoundingClientRect()
            if (!dr || !dr.height) { setOpsTop(null); return }
            var groupH = n * OPS_KEY_H + (n - 1) * OPS_GAP
            var center = !!c.multi || selected.length !== 1
            var target = dr.top + dr.height / 2
            if (!center && selected.length === 1) {
              var card = findCard(el, selected[0])
              if (card) {
                var cr = card.getBoundingClientRect()
                target = cr.top + cr.height / 2
              }
            }
            /* 组底不许压到右侧那条竖排停靠带（写/说两颗键）：上限由 geom().opsLimitBottom 给。
             * 矮内容区里两者加起来放不下时，宁可让组顶到标题带下沿，也不让它们叠在一起。 */
            var limitBottom = Math.min(dr.bottom - 8, g.opsLimitBottom)
            var maxTop = Math.max(dr.top + 8, limitBottom - groupH)
            setOpsTop(clamp(target - groupH / 2, dr.top + 8, maxTop))
          }, [open, opsHidden, c && c.delMode, c && c.multi, c && c.editId, c && c.composeOpen,
            c && c.todoPick, c && c.mapPick, c && c.deleteOpen, c && c.previewUri,
            selectedKey, b.left, b.top, b.width, b.height, g.width, g.opsLimitBottom, ops, page])

          /* ---- fab pointer drag ---- */
          function onFabDown(event) {
            if (event.button !== 0 && event.pointerType === 'mouse') return
            var bb = boundsRef.current || fallbackBounds()
            var u = usableOf(bb)
            var p = pointOf(bb, posRef.current)
            movedRef.current = false
            dragRef.current = {
              id: event.pointerId, startX: event.clientX, startY: event.clientY,
              x: p.x, y: p.y, w: u.w, h: u.h
            }
            try { event.currentTarget.setPointerCapture(event.pointerId) } catch (e) {}
            /* 打开态浮键停靠在抽屉角落、拖不动 ⇒ 不必闪一下抓手光标（.is-dragging
             * 会把 cursor 换成 grabbing、并把位移过渡清零）。dragRef 仍然记下来，
             * 松手那条链要靠它分辨"点了一下"还是"拖过"。 */
            if (!cap().open) setDragging(true)
            event.preventDefault()
          }
          function onFabMove(event) {
            var d = dragRef.current
            if (!d || d.id !== event.pointerId) return
            /* 打开态浮键是"停靠"的（钉在抽屉右下角），拖动没有落点：抽屉已占满
             * 右下角，拖出去只会回到原位。这里直接不吃移动 —— movedRef 保持 false，
             * 松手仍按"点一下"处理，不会把一次点击误存成位置。 */
            if (cap().open) return
            var bb = boundsRef.current || fallbackBounds()
            var u = usableOf(bb)
            var dx = event.clientX - d.startX
            var dy = event.clientY - d.startY
            if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true
            var nx = clamp(d.x + dx, bb.left + FAB_MARGIN, bb.left + FAB_MARGIN + u.w)
            var ny = clamp(d.y + dy, bb.top + FAB_MARGIN, bb.top + FAB_MARGIN + u.h)
            var next = {
              x: u.w ? clamp((nx - bb.left - FAB_MARGIN) / u.w, 0, 1) : 0,
              y: u.h ? clamp((ny - bb.top - FAB_MARGIN) / u.h, 0, 1) : 0
            }
            setPos(next)
          }
          function onFabUp(event) {
            var d = dragRef.current
            if (!d || d.id !== event.pointerId) return
            dragRef.current = null
            setDragging(false)
            try { event.currentTarget.releasePointerCapture(event.pointerId) } catch (e) {}
            if (movedRef.current) {
              movedRef.current = false
              savePos(posRef.current || defaultPos(boundsRef.current || fallbackBounds()))
              return
            }
            var cur = cap()
            if (cur.open && cur.phase === 'rec') { finishRecord(); return }
            if (cur.open && cur.phase === 'asr') return
            if (cur.open) { startRecord(); return }
            openCapsule('')
          }
          function onFabCancel() {
            dragRef.current = null
            movedRef.current = false
            setDragging(false)
          }
          function onFabKey(event) {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            var cur = cap()
            if (cur.open && cur.phase === 'rec') { finishRecord(); return }
            if (cur.open && cur.phase === 'asr') return
            if (cur.open) { startRecord(); return }
            openCapsule('')
          }

          /* ---- card / list handlers ---- */
          function onCardClick(id) {
            var cur = cap()
            var sel = cur.selected || []
            if (cur.multi) {
              patchCap({ selected: sel.indexOf(id) >= 0 ? sel.filter(function (x) { return x !== id }) : sel.concat([id]) })
            } else {
              patchCap({
                selected: sel.length === 1 && sel[0] === id ? [] : [id],
                editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false, mapPick: false,
                deleteOpen: false, previewUri: ''
              })
            }
          }
          function onListScroll(e) {
            var cur = cap()
            if (!cur.open) return
            if ((cur.selected || []).length) patchCap({ selected: [] })
            /* 196 轮：已删除名单滚到底接着铺。必须拿「用户真的滚过」的证据
             * （scrollTop>0），否则内容没撑满容器时首帧就会自己铺到底。 */
            if (hasMore && e && e.target) {
              var el = e.target
              if (el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
                setPage(page + 1)
              }
            }
          }
          function switchDeleted(on) {
            /* 换名单回到列表顶部并重头分页，与 PC onShowDeleted/onBackAlive 同口径。 */
            setPage(1)
            if (drawerRef.current) drawerRef.current.scrollTop = 0
            patchCap({ delMode: !!on, selected: [], multi: false, editId: '', editText: '', editImageUri: '',
              todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
          }
          function toggleMulti() {
            patchCap({ multi: !cap().multi, editId: '', editText: '', editImageUri: '', todoPick: false, todoOtherOpen: false,
              mapPick: false, deleteOpen: false, previewUri: '' })
          }
          function openTodoPick() {
            var id = selected[0]
            var x = id ? Core.byId(s.capsules, id) : null
            if (!x) return
            patchCap({
              todoPick: true, todoOtherOpen: false, mapPick: false, editId: '', editImageUri: '', composeOpen: false, deleteOpen: false,
              previewUri: '', todoText: x.text || '',
              todoProjectId: (Core.activeProjects(s)[0] || {}).id || '', todoUrgency: 'mid'
            })
          }
          async function convertTodo() {
            var cur = cap()
            if (cur.todoBusy) return
            var text = String(cur.todoText || '').trim()
            if (!text) { B.toast('待办内容不能为空', 'danger'); return }
            if (!cur.todoProjectId) { B.toast('先选择归属项目', 'danger'); return }
            if (!selected.length) { B.toast('先选中一条闪念', 'danger'); return }
            patchCap({ todoBusy: true })
            var ok = await B.actions.promoteToTodo([selected[0]], {
              text: text, projectId: cur.todoProjectId, urgency: cur.todoUrgency || 'mid'
            })
            patchCap({ todoBusy: false })
            if (ok) {
              patchCap({ todoPick: false, todoOtherOpen: false, selected: [], delMode: false })
              B.toast('已转成待办')
            }
          }
          async function convertMap(m) {
            if (!m || cap().mapBusy) return
            if (Core.mindmapGateOf(m)) { B.toast(Core.GATE_TIP[Core.mindmapGateOf(m)] || '这张脑图暂时不能选', 'danger'); return }
            patchCap({ mapBusy: m.id })
            await B.loadTree(m.id)
            var ok = await B.actions.promoteToMindmap(m.id, selected)
            patchCap({ mapBusy: '' })
            if (!ok) return
            patchCap({ mapPick: false, mapPickedId: '', selected: [] })
            B.toast('已转脑图')
            if (typeof document !== 'undefined' && document.querySelector && document.querySelector('.at-root')) {
              V.openDetail('mindmap', m.id)
            }
          }
          async function aiMap() {
            if (!selected.length || cap().mapBusy) return
            patchCap({ mapBusy: 'ai' })
            var ok = await B.actions.promoteToMindmapAi(selected)
            patchCap({ mapBusy: '' })
            if (ok) patchCap({ mapPick: false, mapPickedId: '', selected: [] })
          }
          /* ★★ v1.5 · PC 的「选中 ＋ 确定」两步（`onMapMark` / `onMapConfirm`）：
           * 以前插件点一张卡就直接转，和 PC 的确认模式不是一回事。
           * lead 卡（'__ai__'）走 AI 语义转脑图，其余按 pickedId 找图。 */
          function confirmMapPicked() {
            var picked = cap().mapPickedId || ''
            if (!picked || cap().mapBusy) return
            if (picked === '__ai__') { aiMap(); return }
            var m = Core.byId(s.mindmaps, picked)
            if (m) convertMap(m)
          }
          function pickMap(id) { patchCap({ mapPickedId: id }) }
          function exportSelected() {
            if (!selected.length) { B.toast('先选中一条闪念'); return }
            var parts = selected.map(function (id) {
              var x = Core.byId(s.capsules, id)
              if (!x) return ''
              var line = String(x.text || '')
              if (x.imageUri) {
                line += (line ? '\n\n' : '') + '![闪念图片](' + V.imgSrc(s, x.imageUri) + ')'
              }
              return line
            }).filter(Boolean)
            var md = parts.join('\n\n---\n\n')
            B.copyText(md).then(function (ok) {
              B.toast(ok ? '已复制 ' + selected.length + ' 条闪念' : '复制失败，请重试', ok ? 'default' : 'danger')
            })
          }
          async function confirmDelete() {
            if (!selected.length) { patchCap({ deleteOpen: false }); return }
            var ids = selected.slice()
            var ok = await B.actions.removeCapsules(ids)
            patchCap({ deleteOpen: false })
            if (ok) patchCap({ selected: [], delMode: false })
          }
          function restoreSelected() {
            if (!selected.length) return
            var ids = selected.slice()
            B.actions.restoreCapsules(ids).then(function (ok) {
              if (ok) patchCap({ selected: [] })
            })
          }
          function startEdit(id) {
            var target = id || (selected.length === 1 ? selected[0] : '')
            if (!target) return
            var x = Core.byId(s.capsules, target)
            if (!x) return
            patchCap({ selected: [x.id], multi: false,
              editId: x.id, editText: x.text || '', editImageUri: x.imageUri || '',
              composeOpen: false, todoPick: false, todoOtherOpen: false, mapPick: false, deleteOpen: false, previewUri: '' })
          }
          function clearLongPress() {
            if (longRef.current) { clearTimeout(longRef.current); longRef.current = null }
          }
          /* ★ PC 302 轮 onLongPress：桌面 / 平板长按卡片 = 进编辑（手机端长按才是导出）。
           * 只认卡片自己的 pointer 链；编辑态、录音态、已删除名单里一律不触发。 */
          function onCardDown(id, e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return
            clearLongPress()
            longRef.current = setTimeout(function () {
              longRef.current = null
              var cur = cap()
              if (cur.editId || cur.phase === 'rec' || cur.delMode || cur.composeOpen) return
              startEdit(id)
            }, LONG_PRESS_MS)
          }
          React.useEffect(function () { return clearLongPress }, [])
          async function saveEdit() {
            var cur = cap()
            if (!cur.editId) return
            var text = String(cur.editText || '').trim()
            if (!text) { B.toast('闪念内容不能为空', 'danger'); return }
            var ok = await B.actions.updateCapsule(cur.editId, {
              text: text, imageUri: cur.editImageUri || null
            })
            if (ok) {
              patchCap({ editId: '', editText: '', editImageUri: '' })
              B.toast('已保存')
            }
          }
          function pickEditImage() {
            V.pickImage(async function (file) {
              try {
                var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
                patchCap({ editImageUri: uri })
              } catch (e) { B.toast(e.message, 'danger') }
            })
          }
          function pickComposeImage() {
            V.pickImage(async function (file) {
              try {
                var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
                patchCap({ composeImage: uri })
              } catch (e) { B.toast(e.message, 'danger') }
            })
          }
          function actionDisabled(key) {
            if (c.delMode) return !selected.length
            if (!selected.length) return true
            if (key === 'edit' || key === 'todo') return !!c.multi || selected.length !== 1
            return false
          }

          /* ---- pieces ---- */
          /* 统一基线：小程序令牌 → DSH 宿主令牌 → 补充令牌 → 通用状态 / 动效；
           * 再追加胶囊皮肤。以前这里只写 U.themeCss()，胶囊与工作台是两套皮肤。 */
          var styleTag = h('style', null, St.base(dark) + STYLE)
          /* ★ 副抽屉（写 / 编辑 / 转待办 / 转脑图）打开时整组停靠带收起：
           * 浮键 z 149/150 > 副抽屉 141，留着就正好盖在面板底键上。 */
          var fab = railHidden ? null : h('button', {
            type: 'button',
            className: 'at-cx-fab' + (dragging ? ' is-dragging' : '') + (open ? ' is-docked' : '')
              + (c && c.open && c.phase === 'rec' ? ' is-rec' : '')
              + (asrOn ? ' is-asr' : ''),
            style: { left: pnt.x + 'px', top: pnt.y + 'px' },
            title: c && c.open && c.phase === 'rec' ? '停止录音'
              : asrOn ? '正在识别…'
                : c && c.open ? '开始录音（拖动可移动）' : '打开闪念胶囊（拖动可移动）',
            'aria-label': c && c.open && c.phase === 'rec' ? '停止录音'
              : asrOn ? '正在识别' : c && c.open ? '开始录音' : '打开闪念胶囊',
            onPointerDown: onFabDown, onPointerMove: onFabMove, onPointerUp: onFabUp,
            onPointerCancel: onFabCancel, onKeyDown: onFabKey
          },
            c && c.open && c.phase === 'rec'
              ? h('span', { className: 'at-cx-fab-clock' }, c.clock || '60')
              : asrOn
                /* 识别中：40 方键里给三个点，读起来是「在转写」而不是「还能再录一次」 */
                ? h('span', { className: 'at-cx-fab-clock is-dots' }, '···')
                : c && c.open
                  /* PC 横屏 `.rail-brand-mic`：40 方键里 22 的麦克风 */
                  ? h(U.Icon, { name: 'voice', size: K.fabMic, tone: 'ink' })
                  : h('img', { className: 'at-cx-fab-img', src: '/agent-todo/assets/logo.png',
                    width: K.fabIcon, height: K.fabIcon, alt: 'Agent ToDo', draggable: false }))

          var writeFab = open && !railHidden && c.phase !== 'rec' && c.phase !== 'asr' ? h('button', {
            type: 'button', className: 'at-cx-write', style: { left: writeLeft + 'px', top: writeTop + 'px' },
            title: '写一条闪念', 'aria-label': '写一条闪念', onClick: openCompose
          }, h(U.Icon, { name: 'edit', size: K.writeIcon })) : null

          var maskStyle = { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }
          var mask = open ? h('div', { className: 'at-cx-mask', style: maskStyle,
            /* 点挡板空白处关列表（移除标题 × 后这条通道必须一直可用）；
             * 录音 / 识别中由 stopScrim 与相守卫接管，这一击不许顺手关掉列表。 */
            onPointerDown: function (e) {
              var phase = cap().phase
              if (e.target === e.currentTarget && phase !== 'rec' && phase !== 'asr') closeCapsule()
            } }) : null

          var cards = visible.map(function (x, idx) {
            var isSel = selected.indexOf(x.id) >= 0
            var isEditing = !!(c && c.editId === x.id)
            var isFail = !!x.failed
            /* PC `_popId` 精确指定新建那一条；语音路径拿不到服务端 id 时兜底「最后一条」
             * （列表按 createdAt 升序，新卡恒在末尾，且每次落位都会重置 landAt）。 */
            var popId = (c && c.landId) || ''
            var isPop = landing && (popId ? x.id === popId : idx === visible.length - 1)
            /* PC 模板口径：item.text || (failed ? '没听清，长按补字' : '语音识别中')。
             * 插件桥接目前不回传 recognizing / failed，故用「语音来源且正文为空」兜底识别中；
             * 两条字段一旦由数据侧给出，这里自动走真值，模板不必再改。 */
            var isWait = !!x.recognizing || (!x.text && x.source === 'voice' && !isFail)
            var text = x.text || (isFail ? '没听清，长按补字' : isWait ? '语音识别中' : '（这条还是空的）')
            var picSrc = x.imageUri ? V.imgSrc(s, x.imageUri) : ''
            return h('button', {
              key: x.id, type: 'button', 'data-cid': x.id,
              className: 'at-cx-card' + (isSel ? ' is-sel' : '') + (isEditing ? ' is-editing' : '')
                + (c.delMode ? ' is-del' : '') + (isWait ? ' is-wait' : '') + (isFail ? ' is-fail' : '')
                + (isPop ? ' is-pop' : ''),
              'aria-pressed': isSel,
              onClick: function () { onCardClick(x.id) },
              onPointerDown: function (e) { onCardDown(x.id, e) },
              onPointerUp: clearLongPress, onPointerLeave: clearLongPress, onPointerCancel: clearLongPress,
              onContextMenu: function (e) { e.preventDefault(); clearLongPress() }
            },
              h('span', { className: 'at-cx-card-text' }, text),
              /* PC 263 轮 .cp-pic：148 高裁图 ＋ 右下「看大图」角标，正文之下、时间之上。 */
              picSrc ? h('span', { className: 'at-cx-card-pic', 'aria-label': '看大图',
                onClick: function (e) { e.stopPropagation(); patchCap({ previewUri: picSrc }) } },
                h('img', { src: picSrc, alt: '闪念截图', draggable: false }),
                h('span', { className: 'at-cx-card-zoom' }, '看大图')) : null,
              h('span', { className: 'at-cx-card-meta' },
                h('span', null, Core.atMin(x.createdAt)),
                h('span', null, '·'),
                h('span', null, x.source === 'voice' ? '语音' : '文字'),
                x.imageUri ? h('span', null, '· 1 张图') : null),
              /* 302 轮整卡霜白遮罩：只在「重录上传中」这一档出现（插件桥接暂不产生该态）。 */
              x.voiceEditPhase === 'up' ? h('span', { className: 'at-cx-vmask' },
                h('span', { className: 'at-cx-vmask-t' }, '语音识别中')) : null)
          })

          var hollow = open ? h('button', {
            type: 'button', className: 'at-cx-hollow',
            onClick: function () { switchDeleted(!c.delMode) }
          },
            h(U.Icon, { name: c.delMode ? 'chevron-left' : 'trash', size: 14, opacity: .62 }),
            h('span', { className: 'at-cx-hollow-t' }, c.delMode ? '返回正常列表' : '已删除胶囊'),
            !c.delMode && deletedCount ? h('span', { className: 'at-cx-hollow-n' }, deletedCount + ' 条') : null,
            c.delMode ? null : h(U.Icon, { name: 'chevron-right', size: 12, opacity: .45 })) : null

          /* ★ PC 280d：平板 / PC 空态是一句说明文字，不是手机端那个图标块 + 虚框；
           * 位置排在空心卡之后（先入口、后解释）。文案只把方位词换成 DSH 可拖动悬浮键。 */
          var empty = open && !list.length ? h('div', { className: 'at-cx-empty' },
            c.delMode
              ? '还没有删除的胶囊。这里只有手动删除的那些 —— 被「转待办 / 转脑图」带走的不会出现在这儿。'
              : '还没有接住的闪念。点那颗黄色麦克风，张口说一句就行 —— 等坐到电脑前再整理。') : null

          /* 195 / 196 轮：已删除名单分页尾行；正常名单不分页（收件箱不该藏条目）。 */
          var more = open && (hasMore || allShown)
            ? (hasMore
              ? h('button', { type: 'button', className: 'at-cx-more',
                onClick: function () { setPage(page + 1) } }, '点击加载更多')
              : h('div', { className: 'at-cx-more is-end' }, '已无更多信息')) : null
          var endGap = open ? h('div', { className: 'at-cx-endgap' }) : null

          /* 录音行：267 轮一行三件 [倒数][波纹] ──── [轻点任意处停止]。
           * v1.4 起它住在降落区底部（PC `.cp-tail` 里那一块），不再横在标题带下面。 */
          var tailRec = recOn ? h('div', { className: 'at-cx-rec' },
            h('span', { className: 'at-cx-rec-num' }, (c.clock || '60') + 's'),
            h('span', { className: 'at-cx-wave' }, [1, 2, 3, 4, 5].map(function (i) {
              return h('i', { key: i })
            })),
            h('span', { className: 'at-cx-rec-t' }, '轻点任意处停止')) : null

          /* 识别中：同一行换一句话，波纹继续摆 —— 采集已经停了，这里的摆动只是「在转写」。 */
          var tailAsr = asrOn ? h('div', { className: 'at-cx-rec is-asr' },
            h('span', { className: 'at-cx-wave is-asr' }, [1, 2, 3, 4, 5].map(function (i) {
              return h('i', { key: i })
            })),
            h('span', { className: 'at-cx-rec-t' }, '正在转成文字…')) : null

          /* ★ PC `.cp-tail`：0 → 42% 抽屉高的一块黄族渐变，起录瞬时展开、新卡落位点亮、
           * 用户碰列表才收。它是 flex 项 ⇒ 展开时**列表整体变矮**（＝PC「列表上滑」）。 */
          var tailEl = open ? h('div', {
            className: 'at-cx-tail' + (tailSnap ? ' is-snap' : '') + (tailLit ? ' is-lit' : ''),
            style: { height: (tailOn ? g.tailH : 0) + 'px' }
          }, recOn ? tailRec : tailAsr) : null

          /* 302 轮 .cp-stop-scrim：全内容区透明挡板，点任意处即停。
           * ★ v1.6：停止动作放 **pointerup**，不在 pointerdown 里改 phase —— 否则挡板
           * 会在同一次 pointerdown 的冒泡途中被同步卸载，document 的外部关闭监听把这一击
           * 误判成「点外面」。透明＝不遮视觉，只接管点击；层级压过悬浮键。 */
          var stopScrim = open && recOn ? h('div', { className: 'at-cx-stop-scrim', style: maskStyle,
            onPointerUp: function (e) {
              if (e.target === e.currentTarget) finishRecord()
            } }) : null



          var opsEl = ops ? h('div', {
            className: 'at-cx-ops' + (g.inside ? ' is-inside' : ''),
            style: {
              left: (g.inside ? (b.left + b.width - g.pad - g.opsW) : g.opsLeft) + 'px',
              top: (opsTop == null ? g.top + Math.max(0, (g.height - opsGroupH) / 2) : opsTop) + 'px',
              width: g.opsW + 'px',
              paddingLeft: g.inside ? '0' : '8px'
            },
            role: 'toolbar', 'aria-label': '闪念操作'
          },
            c.delMode
              ? opButton('restore', 'w-undo', '还原', false, restoreSelected)
              : [
                opButton('delete', 'w-trash', '删除', actionDisabled('delete'), function () { patchCap({ deleteOpen: true }) }, true),
                opButton('edit', 'w-edit', '编辑', actionDisabled('edit'), function () { startEdit() }),
                opButton('export', 'w-export', '导出', actionDisabled('export'), exportSelected),
                opButton('todo', 'w-todo', '转待办', actionDisabled('todo'), openTodoPick),
                opButton('mindmap', 'w-mindmap', '转脑图', actionDisabled('mindmap'), function () {
                  patchCap({ mapPick: true, mapPickedId: '', todoPick: false, todoOtherOpen: false,
                    editId: '', editText: '', editImageUri: '', composeOpen: false })
                })
              ]) : null

          function opButton(key, icon, label, disabled, onClick, danger) {
            return h('button', { key: key, type: 'button',
              className: 'at-cx-op' + (disabled ? ' is-dim' : '') + (danger ? ' is-danger' : ''),
              disabled: !!disabled, title: label, 'aria-label': label, onClick: onClick },
              h(U.Icon, { name: icon, size: g.inside ? 17 : 15, tone: 'white' }),
              g.inside ? null : h('span', null, label))
          }

          var drawer = open ? h(U.Dialog, {
            as: 'aside', className: 'at-cx-drawer' + (turned ? ' is-turned' : ''),
            role: 'dialog', 'aria-label': '闪念胶囊',
            style: { left: g.left + 'px', top: g.top + 'px', width: g.width + 'px', height: g.height + 'px' }
          },
            h('div', { className: 'at-cx-head' },
              h('span', { className: 'at-cx-title' }, (c.delMode ? '已删除胶囊-' : '闪念胶囊-') + list.length),
              h('div', { className: 'at-cx-head-r' },
                /* 194 轮：恒亮面功能键不铺底 + 恒墨描边；图标 tone=ink，深色下不会消失。
                 * 生效态换 w-check 反白版，与 PC「多选」两态逐值同源。 */
                /* ★ v1.6 · 移除标题带右上角的「关闭」× —— PC 端点击卡片周围任意空白处
                 * 即可关闭列表（at-cx-mask / document 外部监听 / Esc 三套独立通道都在），
                 * 这颗键冗余；「编辑」面板同类按钮按同一结论一并移除。 */
                h('button', { type: 'button', className: 'at-cx-hbtn' + (c.multi ? ' is-on' : ''),
                  title: c.multi ? '退出多选' : '多选', 'aria-label': '多选', onClick: toggleMulti },
                  h(U.Icon, { name: c.multi ? 'w-check' : 'check', size: 14, tone: 'ink' }),
                  h('span', null, '多选')))),
            h('div', { className: 'at-cx-list', ref: drawerRef, onScroll: onListScroll,
              style: g.inside ? { paddingRight: (g.opsW + 18) + 'px' } : null },
              hollow, empty, cards, more, endGap),
            tailEl) : null

          /* ---- 右侧副抽屉：写 / 转待办 / 转脑图（PC .ep / .cp-sheet.sub 同族） ----
           * 位置与宽度由 geom() 给：260 副弹窗、主抽屉右缘 +12（房间不足才退到重叠 50），
           * 高度随内容、max-height 夹在内容区内；不再用全高 320。 */
          var subOpen = !!(c && (c.todoPick || c.mapPick || c.composeOpen))
          var subStyle = { left: g.subLeft + 'px', top: g.subTop + 'px', width: g.subWidth + 'px',
            height: 'auto', maxHeight: g.subMaxHeight + 'px' }
          var subMask = subOpen ? h('div', { className: 'at-cx-submask',
            style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
            onPointerDown: function (e) {
              if (e.target !== e.currentTarget) return
              patchCap({ todoPick: false, todoOtherOpen: false, mapPick: false, composeOpen: false, composeText: '', composeImage: null })
            } }) : null

          var composeDrawer = c && c.composeOpen ? h(U.Dialog, {
            as: 'aside', className: 'at-cx-sub is-compose', role: 'dialog', 'aria-label': '写一条闪念', style: subStyle
          },
            h('div', { className: 'at-cx-sub-head' },
              h('span', { className: 'at-cx-sub-title' }, '写一条闪念'),
              h('button', { type: 'button', className: 'at-cx-hclose', title: '关闭', 'aria-label': '关闭',
                onClick: function () {
                  patchCap({ composeOpen: false, composeText: '', composeImage: null })
                } }, h(U.Icon, { name: 'close', size: 14 }))),
            h('div', { className: 'at-cx-sub-body' },
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '闪念内容'),
                h('textarea', { ref: composeRef, className: 'at-cx-area', value: c.composeText || '',
                  placeholder: '记一条闪念…', 'aria-label': '闪念内容',
                  onChange: function (e) { patchCap({ composeText: e.target.value }) } })),
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '配图'),
                h('div', { className: 'at-cx-row' },
                  c.composeImage ? h('div', { className: 'at-cx-edit-imgwrap' },
                    h('img', { className: 'at-cx-edit-thumb', src: V.imgSrc(s, c.composeImage), alt: '闪念配图' }),
                    h('button', { type: 'button', className: 'at-cx-edit-imgx', title: '移除图片',
                      'aria-label': '移除图片', onClick: function () { patchCap({ composeImage: null }) } }, '×')) : null,
                  h('button', { type: 'button', className: 'at-cx-btn', onClick: pickComposeImage },
                    h(U.Icon, { name: 'album', size: 14 }), c.composeImage ? '换一张' : '添加图片'))),
              h('div', { className: 'at-cx-hint' }, '保存后这条闪念会出现在列表末尾。')),
            h('div', { className: 'at-cx-sub-foot' },
              h('button', { type: 'button', className: 'at-cx-btn',
                onClick: function () {
                  patchCap({ composeOpen: false, composeText: '', composeImage: null })
                } }, '取消'),
              h('button', { type: 'button', className: 'at-cx-btn is-primary', disabled: c.saving,
                onClick: saveCompose }, c.saving ? '保存中…' : '记下来'))) : null

          /* ★★ v1.5 · 转待办 ＝ PC `form-drawer` 的 `.sd.o1`（L2 表单抽屉），不是自绘面板：
           *   · 标题带「记一条待办」＋ 右上 28 高「取消」胶囊（`.sd-cancel`）；
           *   · 三个字段：待办内容 / 紧急程度（四档 chip）/ 归属项目（**一行一个项目行**）；
           *   · 底部 56 只一颗主键「保存待办」（`.sd-submit`）；抽屉里不留说明文字。
           * 归属项目按 PC `forms.projectOptions` 的 `tinted` 分流：着色的进主列表，
           * 无色的从「选择其他项目」进子列表 —— 插件 806 宽放不下第三档 `.sd3` 抽屉，
           * 故降级为**同一面板内换一页**（选中即回填自动收掉），差异写进样式标准 §8。 */
          var projects = Core.activeProjects(s)
          var tintedProjects = projects.filter(function (p) { return !!(p.color && C.colorOf(p.color)) })
          var plainProjects = projects.filter(function (p) { return !(p.color && C.colorOf(p.color)) })
          var plainPicked = plainProjects.filter(function (p) { return p.id === (c && c.todoProjectId) })[0]
          function projectRow(p) {
            var on = c.todoProjectId === p.id
            return h('button', { key: p.id, type: 'button',
              className: 'at-cx-proj' + (on ? ' is-on' : ''), 'aria-pressed': on,
              onClick: function () { patchCap({ todoProjectId: p.id, todoOtherOpen: false }) } },
              h('span', { className: 'at-cx-proj-dot', style: { background: projectColor(p) } }),
              h('span', { className: 'at-cx-proj-t' }, p.name),
              on ? h('span', { className: 'at-cx-proj-go' }, h(U.Icon, { name: 'check', size: 14 })) : null)
          }
          var cancelTodo = function () { patchCap({ todoPick: false, todoOtherOpen: false }) }
          var todoDrawer = c && c.todoPick ? h(U.Dialog, {
            as: 'aside', className: 'at-cx-sub is-fill is-o1 is-todo',
            role: 'dialog', 'aria-label': '记一条待办',
            style: { left: g.todoLeft + 'px', top: g.subTop + 'px', width: g.todoWidth + 'px',
              height: g.height + 'px' }
          },
            h('div', { className: 'at-cx-sub-head' },
              h('span', { className: 'at-cx-sub-title' }, '记一条待办'),
              h('button', { type: 'button', className: 'at-cx-hcancel', title: '取消',
                'aria-label': '取消', onClick: cancelTodo },
                h(U.Icon, { name: 'close', size: 13, opacity: .65 }), h('span', null, '取消'))),
            h('div', { className: 'at-cx-sub-body' },
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '待办内容', h('span', { className: 'at-cx-req' }, '必填')),
                h('textarea', { className: 'at-cx-area', value: c.todoText || '',
                  placeholder: '用一句话说清要做什么', 'aria-label': '待办内容',
                  onChange: function (e) { patchCap({ todoText: e.target.value }) } })),
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '紧急程度', h('span', { className: 'at-cx-req' }, '必填')),
                h('div', { className: 'at-cx-chips' },
                  C.URGENCY.map(function (u) {
                    var on = (c.todoUrgency || 'mid') === u.key
                    var pal = urgencyPalette(u)
                    return h('button', { key: u.key, type: 'button',
                      className: 'at-cx-chip' + (on ? ' is-on' : ''), 'aria-pressed': on,
                      style: on ? { background: pal.soft, borderColor: pal.main, color: pal.text } : null,
                      onClick: function () { patchCap({ todoUrgency: u.key }) } }, u.name)
                  }))),
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '归属项目', h('span', { className: 'at-cx-req' }, '必填')),
                h('div', { className: 'at-cx-proj-list' },
                  c.todoOtherOpen
                    ? [h('button', { key: 'back', type: 'button', className: 'at-cx-proj is-pick',
                        onClick: function () { patchCap({ todoOtherOpen: false }) } },
                        h(U.Icon, { name: 'chevron-left', size: 16 }),
                        h('span', { className: 'at-cx-proj-t' }, '返回项目列表'))]
                      .concat(plainProjects.length ? plainProjects.map(projectRow)
                        : [h('div', { key: 'none', className: 'at-cx-hint' }, '没有其它项目了。')])
                    : tintedProjects.map(projectRow).concat([
                      h('button', { key: 'other', type: 'button',
                        className: 'at-cx-proj is-pick' + (plainPicked ? ' is-on' : ''),
                        onClick: function () { patchCap({ todoOtherOpen: true }) } },
                        h(U.Icon, { name: 'project', size: 16 }),
                        h('span', { className: 'at-cx-proj-t' }, plainPicked ? plainPicked.name : '选择其他项目'),
                        h('span', { className: 'at-cx-proj-go' },
                          h(U.Icon, { name: 'chevron-right', size: 14 })))])
                ))),
            h('div', { className: 'at-cx-sub-foot' },
              h('button', { type: 'button', className: 'at-cx-btn is-primary', disabled: c.todoBusy,
                onClick: convertTodo }, c.todoBusy ? '保存中…' : '保存待办'))) : null

          /* ★★ v1.5 · 转脑图 ＝ PC 第二档**脑图选择主弹窗**（`drawers.buildMindmapPick`）：
           *   · 320 全高 / `.o1` 位（与转待办同一副几何）；标题「选择脑图 N」＋ 取消胶囊；
           *   · 顶部 lead 卡「语义转脑图」（模型按语义重组），下面一张图一张卡，
           *     卡上有项目色点 / 格式 / 「当前」标记 / 锁态；
           *   · **先选后确定**（`pickedId` + 「确定」），不是点一张卡就直接转。 */
          var mapPicked = (c && c.mapPickedId) || ''
          var cancelMap = function () { patchCap({ mapPick: false, mapPickedId: '' }) }
          var mapDrawer = c && c.mapPick ? h(U.Dialog, {
            as: 'aside', className: 'at-cx-sub is-fill is-o1 is-map',
            role: 'dialog', 'aria-label': '选择脑图',
            style: { left: g.mapLeft + 'px', top: g.subTop + 'px', width: g.mapWidth + 'px',
              height: g.height + 'px' }
          },
            h('div', { className: 'at-cx-sub-head' },
              h('span', { className: 'at-cx-sub-title' }, '选择脑图 ' + s.mindmaps.length),
              h('button', { type: 'button', className: 'at-cx-hcancel', title: '取消',
                'aria-label': '取消', onClick: cancelMap },
                h(U.Icon, { name: 'close', size: 13, opacity: .65 }), h('span', null, '取消'))),
            h('div', { className: 'at-cx-sub-body' },
              h('div', { className: 'at-cx-map-list' },
                h('button', { key: '__ai__', type: 'button',
                  className: 'at-cx-map-card is-lead' + (mapPicked === '__ai__' ? ' is-on' : ''),
                  'aria-pressed': mapPicked === '__ai__', disabled: !!c.mapBusy,
                  onClick: function () { pickMap('__ai__') } },
                  h('span', { className: 'at-cx-map-lead-head' },
                    h(U.Icon, { name: 'robot', size: 15 }),
                    h('span', { className: 'at-cx-map-name' }, '语义转脑图')),
                  h('span', { className: 'at-cx-map-desc' },
                    '把选中的胶囊交给模型，按语义重组成一张新脑图')),
                s.mindmaps.map(function (m) {
                  var gate = Core.mindmapGateOf(m)
                  var on = mapPicked === m.id
                  var isCur = currentMapId === m.id
                  var proj = Core.byId(s.projects, m.projectId)
                  var dot = proj ? projectColor(proj) : (dark ? C.NONE_COLOR_DARK : C.NONE_COLOR)
                  return h('button', { key: m.id, type: 'button',
                    className: 'at-cx-map-card' + (on ? ' is-on' : '') + (gate ? ' is-lock' : ''),
                    'aria-pressed': on, disabled: !!c.mapBusy,
                    title: gate ? (Core.GATE_TIP[gate] || '这张脑图暂时不能选') : m.name,
                    onClick: function () {
                      if (gate) { B.toast(Core.GATE_TIP[gate] || '这张脑图暂时不能选', 'danger'); return }
                      pickMap(m.id)
                    } },
                    h('span', { className: 'at-cx-map-name' }, m.name),
                    h('span', { className: 'at-cx-map-tags' },
                      h('span', { className: 'at-cx-proj-dot', style: { background: dot } }),
                      h('span', { className: 'at-cx-map-tag' }, C.formatOf(m.format).label),
                      gate ? h('span', { className: 'at-cx-map-tag' },
                        Core.GATE_TIP[gate] || '不可选') : null,
                      isCur ? h('span', { className: 'at-cx-map-tag is-current' }, '当前') : null))
                }))),
            h('div', { className: 'at-cx-sub-foot' },
              h('button', { type: 'button', className: 'at-cx-btn is-primary',
                disabled: !mapPicked || !!c.mapBusy, onClick: confirmMapPicked },
                c.mapBusy ? '提交中…' : '确定'))) : null

          /* ---- 编辑闪念：PC 的 260 右侧副弹窗（.ep），几何同由 geom() 给 ---- */
          var editStyle = c && c.editId
            ? { left: g.editLeft + 'px', top: g.editTop + 'px', width: g.editWidth + 'px',
              height: 'auto', maxHeight: g.editMaxHeight + 'px' }
            : null
          var editScrim = c && c.editId ? h('div', { className: 'at-cx-edit-scrim',
            style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
            onPointerDown: function (e) {
              if (e.target === e.currentTarget) patchCap({ editId: '', editText: '', editImageUri: '' })
            } }) : null
          var editPanel = c && c.editId ? h(U.Dialog, {
            as: 'aside', className: 'at-cx-sub', role: 'dialog', 'aria-label': '编辑闪念', style: editStyle
          },
            h('div', { className: 'at-cx-sub-head' },
              /* ★ v1.6 · 同类「取消」× 与主抽屉一并移除：点面板外 / editScrim / Esc 都能退出编辑 */
              h('span', { className: 'at-cx-sub-title' }, '编辑闪念')),
            h('div', { className: 'at-cx-sub-body' },
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '闪念内容'),
                h('textarea', { ref: editRef, className: 'at-cx-area', value: c.editText || '',
                  placeholder: '闪念内容', 'aria-label': '编辑闪念',
                  onChange: function (e) { patchCap({ editText: e.target.value }) } })),
              h('div', { className: 'at-cx-field' },
                h('span', { className: 'at-cx-label' }, '配图'),
                h('div', { className: 'at-cx-row' },
                  c.editImageUri ? h('div', { className: 'at-cx-edit-imgwrap' },
                    h('img', { className: 'at-cx-edit-thumb', src: V.imgSrc(s, c.editImageUri), alt: '闪念配图' }),
                    h('button', { type: 'button', className: 'at-cx-edit-imgx', title: '移除图片',
                      'aria-label': '移除图片', onClick: function () { patchCap({ editImageUri: '' }) } }, '×')) : null,
                  h('button', { type: 'button', className: 'at-cx-btn', onClick: pickEditImage },
                    h(U.Icon, { name: 'album', size: 14 }), c.editImageUri ? '换一张' : '添加图片'))),
              h('div', { className: 'at-cx-hint' }, '保存后更新这条闪念的正文和配图。')),
            h('div', { className: 'at-cx-sub-foot' },
              /* ★ v1.6 · 底栏只留一颗主键（与转待办 / 转脑图副抽屉同口径），取消走面板外 / Esc */
              h('button', { type: 'button', className: 'at-cx-btn is-primary', onClick: saveEdit }, '保存'))) : null

          var confirm = c && c.deleteOpen ? h('div', {
            className: 'at-cx-modal-layer',
            style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
            onPointerDown: function (e) { if (e.target === e.currentTarget) patchCap({ deleteOpen: false }) }
          },
            h(U.Dialog, { className: 'at-cx-modal', role: 'dialog', 'aria-label': '删除闪念' },
              h('div', { className: 'at-cx-modal-title' }, '删除这条闪念？'),
              h('p', { className: 'at-cx-modal-body' },
                '删除后可以在「已删除胶囊」里还原；被转成待办或脑图的不会出现在回收站。'),
              h('div', { className: 'at-cx-modal-actions' },
                h('button', { type: 'button', className: 'at-cx-btn',
                  onClick: function () { patchCap({ deleteOpen: false }) } }, '取消'),
                h('button', { type: 'button', className: 'at-cx-btn is-danger', onClick: confirmDelete }, '删除')))) : null

          var preview = c && c.previewUri ? h('div', {
            className: 'at-cx-preview',
            style: { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' },
            onPointerDown: function (e) { if (e.target === e.currentTarget) patchCap({ previewUri: '' }) }
          },
            h('img', { src: c.previewUri, alt: '闪念大图' }),
            h('button', { type: 'button', className: 'at-cx-preview-x', title: '关闭', 'aria-label': '关闭',
              onClick: function () { patchCap({ previewUri: '' }) } },
              h(U.Icon, { name: 'close', size: 15, tone: 'white' }))) : null

          /* 停靠带退进抽屉内部时（内容区太窄放不下 40 方键）才垫底衬：
           * 两颗键横排在左下角，盖住 [说][写] 那一块（130×64），只做视觉。 */
          var dockPlate = open && !railHidden && !g.railOutside ? h('div', { className: 'at-cx-dockplate', style: {
            left: (g.railLeft - 4) + 'px',
            top: (g.railSayTop - 4) + 'px',
            width: (K.fab * 2 + K.dockGap + 8) + 'px',
            height: (K.fab + 8) + 'px'
          } }) : null

          return h('div', { className: 'at-gl at-cx-root', 'data-dark': String(dark), ref: rootRef },
            styleTag, dockPlate, fab, writeFab, mask, drawer, opsEl, subMask, composeDrawer, todoDrawer, mapDrawer,
            editScrim, editPanel, confirm, preview, stopScrim)
        }

        AT.capsule = {
          STYLE: STYLE, FloatingCapsule: FloatingCapsule,
          patchCap: patchCap, openCapsule: openCapsule, closeCapsule: closeCapsule,
          toggleRecord: toggleRecord, openCompose: openCompose,
          startRecord: startRecord, stopRecord: stopRecord, finishRecord: finishRecord,
          saveCompose: saveCompose
        }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 85-desktop.js ===== */
    ;(function (AT, React, h) {
      /* Desktop presentation only. Host tokens take precedence; business rules stay in core. */
      ;(function (AT, React, h) {
        'use strict'
        /* 本文件只剩样式：桌面呈现把宿主令牌映射到 `--at-*`。
         * 概览的内容装配在 60-views-a.js（`OverviewBody`），这里**不再覆盖**它 ——
         * 2026-11 之前那版"落地页概览"曾在这里顶掉正主，症状是"概览页内容不对"。 */

        /* ------------------------------------------------- 三栏三档底色（v1.12）---
         * 用户口径（2026-11-07 第 1 条）：项目 / 待办 / 脑图三页的「主菜单 · 列表 · 详情」
         * 背景色都一样、边框又淡，三块分不开。
         *
         * 根因在上面那段令牌映射：`--at-surface` / `--at-card` / `--at-chip` 分别映到
         * 宿主 `bg-base` / `bg-layer-1` / `bg-layer-2`，真实 DSH 里这三档**差得极小**，
         * 再叠加 `.at-pane{border:0}` 的桌面拍平 ⇒ 整窗读起来是一整片同色。
         *
         * 落点与 `55-panes.js` 的 `.at-pane-single.is-home` **同一做法**：只对三栏作用域
         * 把这几支钉回 `40-ui` 里**已登记**的色值（浅 #F7F8FA / #EDF0F4 / #FFFFFF，
         * 深 #18191B / #2D2F32 / #202123），用 `literal()` 现取、不在这里另抄一份 HEX。
         *   ── 层次：主菜单/详情页底 ＝ surface ／ 列表页底 ＝ **sunken** ／ 卡面 ＝ card。
         *
         * ★ 为什么列表用 `--at-sunken` 而不是 `--at-chip`：chip(#F1F2F5) 与 surface(#F7F8FA)
         *   只差 Δ6，两块大色块左右相邻时上一版实测**等于同色**（用户第 1 条其实没解决）。
         *   sunken 浅色 #EDF0F4（对 surface 最大单通道 Δ10；2026-11 用户拍板由 #E7E9EF 调浅）、
         *   深色 #2D2F32（对 surface Δ21），两边都能靠"面"分开，不必只靠那条 1px 分隔线。
         *   ⚠️ 调浅后 sunken 与 chip 的差也收窄了 ⇒ 列表列更不许退回 --at-chip。 */
        function literal(name, table) {
          var m = new RegExp('--' + name + ':([^;]+);').exec(table || '')
          return m ? m[1] : ''
        }
        var UI_TABLE = (AT.ui && AT.ui.LIGHT && AT.ui.DARK) ? AT.ui : null
        function tok(name, dark) {
          return literal(name, UI_TABLE ? (dark ? UI_TABLE.DARK : UI_TABLE.LIGHT) : '')
        }
        var TRI_TOKENS = ['at-surface', 'at-sunken', 'at-card', 'at-chip', 'at-hairline',
          'at-hairline-strong', 'at-head-bg', 'at-head-line', 'at-sh-card']
        function triVars(dark) {
          return TRI_TOKENS.map(function (n) {
            var v = tok(n, dark)
            return v ? ('--' + n + ':' + v) : ''
          }).join(';')
        }
        /* ★★ 轮次 5：**外壳几何归桌面层，弹窗内展示归 90-drawers.js**。
         * 用户认可「右侧展开弹窗」（460 贴右全高），指出的是弹窗**里面**的控件展示。
         * 桌面层因此写回外壳几何 ＋ 抬 z-index ＋ 把抽屉作用域的 `--at-*` 从宿主暖灰
         * 解绑回 40-ui 已登记值；**不写 head / body / foot 的皮肤数值** —— 那些只有
         * 一个真源，在 `90-drawers.js`（结构级照抄小程序 `.sd` PC 档）。
         * ⚠️ 深色表里没重定义的令牌（如 --at-yellow / --at-on-accent）回落浅色表，
         *    与 themeCss(dark) 的「LIGHT 打底 ＋ DARK 覆盖」同法。 */
        var DRAWER_TOKENS = ['at-primary', 'at-slate', 'at-muted', 'at-text2',
          'at-hairline', 'at-hairline-strong', 'at-hairline-soft', 'at-surface', 'at-chip',
          'at-card', 'at-elevated', 'at-head-bg', 'at-head-line', 'at-solid', 'at-on-solid',
          'at-on-accent', 'at-yellow', 'at-yellow-soft', 'at-field-line', 'at-mask',
          'at-sh-drawer-l2', 'at-danger', 'at-success']
        function drawerVars(dark) {
          return DRAWER_TOKENS.map(function (n) {
            var v = tok(n, dark) || tok(n, false)
            return v ? ('--' + n + ':' + v) : ''
          }).join(';')
        }

        var STYLE = [
          '.at-root,.at-gl{--at-primary:var(--dsw-alias-label-primary,#292929);',
          '--at-text2:var(--dsw-alias-label-secondary,#767670);--at-slate:var(--at-text2);',
          '--at-muted:var(--dsw-alias-label-tertiary,#8b8b85);',
          '--at-surface:var(--dsw-alias-bg-base,#faf9f6);',
          '--at-card:var(--dsw-alias-bg-layer-1,#fff);--at-elevated:var(--dsw-alias-bg-overlay,var(--at-card));',
          '--at-chip:var(--dsw-alias-bg-layer-2,#f1f0ec);--at-head-bg:var(--at-card);',
          '--at-hairline:var(--dsw-alias-border-l1,#e8e7e2);',
          '--at-hairline-soft:var(--dsw-alias-border-l1,#efeee9);',
          '--at-field-line:var(--at-hairline);--at-head-line:var(--at-hairline);',
          '--at-sh-card:none;--at-rail-w:120px;',
          '--at-font:var(--dsw-alias-font-body,"PingFang SC","Microsoft YaHei",sans-serif);',
          '--at-font-num:var(--at-font);--at-blue:var(--dsw-alias-label-primary,#44443f)}',
          '.at-root[data-dark="true"],.at-gl[data-dark="true"]{',
          '--at-primary:var(--dsw-alias-label-primary,#e9e9e4);',
          '--at-text2:var(--dsw-alias-label-secondary,#b1b1a9);',
          '--at-muted:var(--dsw-alias-label-tertiary,#91918b);',
          '--at-surface:var(--dsw-alias-bg-base,#18191b);--at-card:var(--dsw-alias-bg-layer-1,#202123);',
          '--at-chip:var(--dsw-alias-bg-layer-2,#2c2d30);--at-hairline:var(--dsw-alias-border-l1,#36373a);',
          '--at-hairline-soft:var(--at-hairline);--at-blue:var(--dsw-alias-label-primary,#dadad3)}',
          '.at-root{font-size:14px;container-type:inline-size;isolation:isolate}',
          '.at-root button{font-size:13px}.at-root .at-btn{height:32px;border-radius:7px;gap:6px}',
          '.at-root .at-btn-primary{color:var(--at-on-accent)}.at-root .at-btn-dark{color:var(--at-on-solid)}',
          '.at-root .at-btn-danger{color:var(--at-danger)}',
          '.at-root .at-icon-btn{width:32px;padding:0}.at-btn:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          /* ⚠️ 2026-11-10 轮次 11：这里原有 `.at-root .at-input,.at-root .at-select{border-radius:7px;
           * font-size:13px}` ＋ 一条重复的 `:focus` —— 那是桌面档对输入框的**第二套口径**，
           * 把基线（圆角 10 / 14px）在桌面上悄悄改成 7 / 13，于是同一个输入框在小程序对照时
           * 永远差 2px 圆角和 1px 字号。已整段删除：输入框尺寸只在 `40-ui.js` 的 `.at-input`
           * 基线里定义一次，桌面层不再改写它。 */
          '.at-topbar{height:58px;flex-basis:58px;padding:0 22px;background:var(--at-surface);gap:14px}',
          '.at-status{border:0;background:transparent;padding:0 8px;font-size:11px}',
          /* ★★ 2026-11-10（用户第 2、3 条）：主导航**收窄** 164 → 120，并去掉「待办」那项
           * 的未完成计数（只有一项有数字，读起来像"这项特殊"）。
           * 120 是按最长的两项中文标签（概览 / 待办）算的：内距 10×2 ＋ 图标 18 ＋ 间距 10
           * ＋ 两字 26 ≈ 84，留 30 余量给字体回退；比 164 省下 44 全给内容区。
           * 摘掉计数后 `.at-rail-item` 不再需要 `margin-left:auto` 的那颗东西。 */
          '.at-rail{align-items:stretch;padding:18px 10px;background:var(--at-surface);gap:12px}',
          '.at-rail-list{gap:5px;align-items:stretch}',
          '.at-rail-item{display:flex;align-items:center;flex-direction:row;justify-content:flex-start;gap:10px;',
          'width:100%;height:38px;border:0;border-radius:7px;padding:0 10px;background:transparent;',
          'font:inherit;color:var(--at-text2);text-align:left;cursor:pointer}',
          '.at-rail-item.is-active{background:var(--at-chip);color:var(--at-primary);font-weight:600}',
          '.at-rail-item.is-active:before{content:"";position:absolute;left:0;height:16px;',
          'width:3px;border-radius:0 2px 2px 0;background:var(--at-yellow-deep)}',
          '.at-rail-item{position:relative}',
          '.at-panes,.at-panes.is-compact,.at-panes.is-tight{padding:0;gap:0}',
          '.at-pane{border:0;border-radius:0;box-shadow:none}',
          /* 三档底色钉值（见文件头 `triVars` 那段）。两套主题各一条，写在拍平规则**之前**、
           * 特异度更高（0,2,0 / 0,3,0），所以不会被上面的宿主映射盖回去。 */
          '.at-root .at-panes,.at-gl .at-panes{' + triVars(false) + '}',
          '.at-root[data-dark="true"] .at-panes,.at-gl[data-dark="true"] .at-panes{' + triVars(true) + '}',
          '.at-pane-list{flex-basis:280px;width:280px;border-right:1px solid var(--at-hairline-strong);',
          'background:var(--at-sunken)}',
          '.at-panes.is-compact .at-pane-list{flex-basis:240px;width:240px}',
          '.at-pane-detail{background:var(--at-surface)}',
          /* 列表可向左侧收起（v1.12 第 2 条）—— 窗口被压窄时把 300 让给详情。
           * 宽度与 flex-basis 一起归零（只改 flex-basis 时固定 width 会顶住不缩），
           * `opacity` 只负责"走的时候不要像被切断"，真正的收起靠尺寸。
           * ⚠️ 排除 `.is-tight`：那一档本来就是「列表 / 详情」二态互斥（下面 show-detail 那段），
           *    两套折叠机制叠在一起会互相打架。 */
          '.at-panes:not(.is-tight) .at-pane-list{transition:flex-basis .18s ease,width .18s ease,opacity .12s ease}',
          '.at-panes:not(.is-tight).is-list-collapsed .at-pane-list{flex-basis:0;width:0;',
          'border-right:0;opacity:0;pointer-events:none}',
          /* ★ 2026-11-10：两根头行的**高度必须一致**（64），两颗键才真的"平齐"。
           * 原来详情头 min-height 66 / 列表头 60，而详情头里多一行副标题 ⇒ 内容盒 40 vs 45，
           * 各自居中后两颗 32 高的键差 2~3px —— 用户说的「与添加按钮保持平齐」就差这一点。
           * 统一 64 之后：列表头 21+24 被 min-height 撑到 64、详情头 40+24＝64，
           * 两者内容盒同心 ⇒ `+` 与收起键的中线完全重合。 */
          '.at-pane-head{height:auto;min-height:64px;flex:0 0 auto;padding:12px 22px;background:transparent;gap:8px}',
          '.at-pane-list .at-pane-head{min-height:64px;padding:12px 18px;border:0}',
          '.at-pane-title{font-size:15px;letter-spacing:-.2px}.at-pane-sub{font-size:11px;margin-top:4px}',
          '.at-pane-count{font-size:11px;padding:2px 6px;background:var(--at-chip);border-radius:4px;color:var(--at-text2)}',
          '.at-pane-tools{padding:0 16px 12px;background:transparent;border:0}',
          '.at-pane-tools .at-input{height:32px;background:var(--at-card);font-size:12px}',
          '.at-pane-tools .at-btn{font-size:11px;padding:0 8px}',
          '.at-list-tabs{padding:0 16px 12px}.at-list-tabs .at-seg{width:100%;padding:3px;border-radius:6px;gap:2px}',
          '.at-list-tabs .at-seg-item{flex:1;padding:0 6px;font-size:11px;border-radius:4px;height:26px}',
          '.at-list-tabs .at-seg-item.is-on{background:var(--at-yellow-soft);color:var(--at-primary);',
          'font-weight:600;box-shadow:inset 0 0 0 1px var(--at-yellow)}',
          '.at-pane-scroll{padding:8px 10px 12px}',
          /* 列表行改**白卡浮在灰底上**（v1.12）：列表页底已是 `--at-chip`，
           * 行若继续吃 transparent 就与底色同层，只剩一条淡线可辨。
           * 选中态回到品牌黄软底（与小程序 `.tf-chip.on` / 卡片选中同一套读法）。 */
          '.at-pane-row{padding:12px;margin-bottom:8px;border:1px solid var(--at-hairline);',
          'border-radius:12px;background:var(--at-card);gap:9px;box-shadow:var(--at-sh-card)}',
          '.at-pane-row:hover{background:var(--at-chip);border-color:var(--at-hairline-strong)}',
          '.at-pane-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow);',
          'box-shadow:var(--at-sh-card)}',
          '.at-pane-row.is-on:hover{background:var(--at-yellow-soft);border-color:var(--at-yellow);opacity:.82}',
          '.at-pane-row-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13px}',
          '.at-pane-row-bar{width:5px;flex-basis:5px;min-height:5px;height:5px;align-self:flex-start;margin-top:7px;border-radius:50%}',
          '.at-pane-row-meta{font-size:10px;line-height:1.6;margin-top:7px}',
          '.at-pane-foot{padding:12px 16px;background:transparent}.at-pane-foot .at-muted{font-size:10px}',
          '.at-pane-detail>.at-pane-head{flex-wrap:wrap;align-items:center}',
          '.at-pane-detail>.at-pane-head .at-toolbar{overflow:visible;flex-wrap:wrap}',
          '.at-pane-body{padding:24px 28px}.at-detail-col{max-width:880px;margin:0 auto;gap:14px}',
          /* 详情里的每一块 ＝ 小程序 `.sec` ＋ `.card`：白卡 · 1px 描边 · 14 圆角 · 微阴影。
           * 2026-11 之前这里是「无卡分节 ＋ 底边 1px 线」—— 在宿主同色底上那一根线是唯一分界，
           * 正是用户 2026-11-07 第 1 条说的"背景色一致、边框很淡、三块分不开"。
           * ⚠️ 只挂在 `.at-pane-detail` 下：概览 / 我的 走各自的 `.at-ov-*` / `.at-mi-*`，不受影响。 */
          '.at-pane-detail .at-block{padding:16px 18px;border:1px solid var(--at-hairline);',
          'border-radius:14px;background:var(--at-card);box-shadow:var(--at-sh-card)}',
          '.at-pane-detail .at-block-title{font-size:15px;font-weight:600;color:var(--at-primary);margin-bottom:12px}',
          '.at-kv{font-size:12px;padding:7px 0;align-items:flex-start}.at-kv>span:last-child{min-width:0;overflow-wrap:anywhere;text-align:right}',
          '.at-code{border:0;border-radius:8px;padding:16px;font-size:12px;background:var(--at-surface)}',
          '.at-task-copy{white-space:pre-wrap;font-size:18px;line-height:1.75;letter-spacing:-.25px;overflow-wrap:anywhere;color:var(--at-primary)}',
          '.at-context-line{flex-wrap:wrap;font-size:12px}.at-context-line .at-link{font-size:12px}',
          '.at-handoff{border:1px solid var(--at-hairline);background:var(--at-surface);padding:18px;border-radius:10px}',
          '.at-handoff-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-bottom:8px}',
          '.at-handoff p{font-size:12px;color:var(--at-text2);margin:0 0 16px;line-height:1.65}',
          '.at-handoff .at-op-row{gap:8px}.at-handoff summary{font-size:11px;color:var(--at-text2);cursor:pointer;margin-top:16px}',
          '.at-handoff .at-code{max-height:250px;padding:14px 0;margin-top:10px}',
          /* ★★ 收起 / 展开键（2026-11-10 用户第 3 条 + 当日订正）：
           * 原样是「〈 收起」一颗带文字的描边胶囊（28 高、贴左边框、左侧不留圆角）。
           * 用户口径：① 去掉「收起 / 展开」文字只留图标；② 颜色改**品牌黄**提升醒目度；
           * ③ 与列表里的添加键（`+`）**平齐**；④ **订正：仍要左侧 0 圆角、直接贴左边框**
           *    （上一版把它做成悬在头行里的孤立方键，脱离了列边缘，用户当场纠回）。
           * 落法：
           *  · 32×32 品牌黄块，**贴着详情列左边界**：`margin-left:-22px` 吃掉头行左内距，
           *    左缘对齐列边 ⇒ 只给右侧两角留 8 圆角（`0 8px 8px 0`），左侧平切到底。
           *  · 「平齐」仍是**水平中线**：两根头行统一 `min-height:64px`（见 `.at-pane-head`），
           *    32 高的键与列表头那颗 32 的 `+` 同处一条中线；不是同列，也不必同列。
           *  · 底色 `--at-yellow` ＋ `--at-on-accent` 墨色图标，与导轨选中态、胶囊品牌块同一套
           *    「黄＝主动作」读法；hover 只走 FB-01 的 `.82`，不换底色。
           *  · 方向即语义：收起 `chevron-left`、展开 `chevron-right`；tight 档那颗是"返回列表"，
           *    同样左箭头，文字由 `title` / `aria-label` 承担（不给视觉加字）。
           *  ⚠️ 描边 `1px solid transparent` 是留给 focus-visible 的占位，避免聚焦时尺寸跳动。
           *  ⚠️ tight 档头行内距是 16，那颗的负边距另行覆盖成 -16（别在这里写第二套宽度）。 */
          '.at-detail-back{display:inline-flex;align-items:center;justify-content:center;',
          'flex:0 0 auto;width:32px;height:32px;padding:0;margin-left:-22px;',
          'border:1px solid transparent;border-radius:0 8px 8px 0;',
          'background:var(--at-yellow);color:var(--at-on-accent);',
          'cursor:pointer;font-family:inherit}',
          '.at-detail-back:hover{opacity:.82}',
          '.at-detail-back:active{transform:translateY(1px);opacity:.78}',
          '.at-pane-single>.at-pane-head{display:none}.at-pane-single{background:var(--at-card)}',
          '.at-pane-single>.at-pane-body{padding:34px clamp(20px,4cqw,56px)}',
          /* 概览已改为严格对齐小程序 `mod-overview`（PC 档，见 60-views-a.js 的 `.at-ov-*`）。
           * 原来那一版"落地页"（`.at-home` / `.at-eyebrow` / `.at-flow-*` / `.at-home-metrics`）
           * 连同它对本页热力格的缩格覆盖（`.at-heat-cell{12px}`）**整体撤掉** —— 无调用点，
           * 留着会让下一个人以为概览还有第二套骨架。 */
          /* ★★ 轮次 5：恢复用户认可的「右侧展开弹窗」外壳 —— 460 贴右、全高、无圆角、
           * 左侧 1px 收边。轮次 4 把它当成 .sd 的一部分撤掉，属改过头。
           * 弹窗**内部**控件仍按 90-drawers.js 的 .sd PC 档逐值照抄，两者互不侵入。
           * 令牌解绑继续用 drawerVars() 现取 40-ui 登记值，不新增 HEX。
           * ★★ 令牌规则是**运行时拼**的，判据取 `AT.desktop.STYLE` 求值产物再比对。 */
          '.at-form-mask{z-index:54;background:var(--at-mask)}',
          '.at-drawer,.at-drawer.o1,.at-drawer.o2{left:auto;right:0;top:0;bottom:0;width:min(460px,100%);',
          'border-radius:0;border-width:0 0 0 1px;box-shadow:-12px 0 40px #00000014;z-index:55}',
          '.at-root .at-drawer{' + drawerVars(false) + '}',
          '.at-root[data-dark="true"] .at-drawer{' + drawerVars(true) + '}',

          '.at-mm-bar{padding:8px 16px;background:var(--at-card);gap:4px}',
          '.at-mm-bar .at-btn{border-color:transparent;background:transparent;font-size:11px;padding:0 7px}',
          '.at-mm-bar .at-btn:hover{background:var(--at-chip)}.at-mm-bar .at-btn:disabled{opacity:.4}',
          '.at-mm-info{padding:8px 16px}.at-mm-info .at-input{width:140px;flex-basis:140px;font-size:11px}',
          '.at-mm-viewport{min-height:80px}',
          '.at-root[data-layout="compact"],.at-root[data-layout="tight"]{--at-rail-w:58px}',
          '.at-root:not([data-layout="wide"]) .at-rail{padding:16px 8px}',
          '.at-root:not([data-layout="wide"]) .at-rail-item{flex-direction:column;height:50px;padding:5px 0;gap:4px;font-size:10px}',
          '.at-root[data-layout="tight"] .at-brand-lockup{height:26px;margin-left:-2px}',
          '.at-root[data-layout="tight"] .at-topbar{padding:0 12px;gap:8px}',
          /* 窄档只留 logo、不title：模块名在导轨/列表头都已经有一份，顶栏再写一次会把
           * 状态胶囊与刷新键挤掉（<660 那一档实测）。 */
          '.at-root[data-layout="tight"] .at-topbar-title{display:none}',
          '.at-root:not([data-layout="wide"]) .at-pane-body{padding:22px}',
          '.at-root[data-layout="tight"] .at-topbar .at-btn{padding:0 9px;font-size:11px}',
          '.at-panes.is-tight .at-pane-list{width:auto;flex:1;border:0}.at-panes.is-tight .at-pane-detail{display:none}',
          '.at-panes.is-tight.show-detail .at-pane-list{display:none}.at-panes.is-tight.show-detail .at-pane-detail{display:flex}',
          '.at-panes.is-tight.show-detail .at-detail-back{display:flex;margin-left:-16px}',
          '.at-panes.is-tight .at-pane-head{padding:12px 16px;min-height:60px;flex-basis:auto}',
          '.at-panes.is-tight .at-pane-body{padding:20px 16px}.at-panes.is-tight .at-grid-3{grid-template-columns:1fr}',
          '.at-root[data-layout="tight"] .at-mm-info .at-muted:first-of-type{display:none}',
          '.at-modal-layer{padding:24px 16px;align-items:center}',
          '.at-modal{display:flex;flex-direction:column;max-height:100%}.at-modal-body{max-height:none;min-height:0;overflow:auto}',
          '.at-gl-root{padding:24px 16px;align-items:center}',
          '.at-gl-panel{max-height:calc(100vh - 48px);overflow:auto}.at-gl-input{max-height:40vh}',
          '.at-gl-btn:disabled{opacity:.4;cursor:not-allowed}',
          '.at-root .at-pane-body.is-canvas{padding:0}',
          '.at-root .at-mm-bar{flex-wrap:nowrap;overflow-x:auto;min-height:42px;max-height:48px}',
          '.at-root .at-mm-bar .at-btn,.at-root .at-mm-bar .at-select,.at-root .at-mm-bar-label{flex-shrink:0}',
          '.at-mm-info{min-height:42px;overflow:hidden;flex-shrink:0}',
          '@media (max-height:560px){.at-root .at-mm-foot{display:none}}',
          /* 极窄档（<360）：让位给**登录键**，不是让位给它旁边的刷新键。
           * ★ 轮次 12：原来这一档把 `.at-status` 压成 `font-size:0`（只剩一个点）——
           * 那时它只是枚状态徽章，藏字无妨；现在它是「请登录」的**唯一入口**，
           * 藏了就等于未登录用户找不到登录门。改藏模块名（导轨上的激活项已经说明了在哪）。 */
          '@container (max-width:360px){.at-root .at-topbar .at-topbar-title{display:none}',
          '.at-root .at-topbar .at-icon-btn{display:none}}',
          '@media (prefers-reduced-motion:no-preference){.at-drawer{animation:at-enter .18s ease-out}',
          '@keyframes at-enter{from{opacity:.4;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}}'
        ].join('')

        AT.desktop = { STYLE: STYLE }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 90-drawers.js ===== */
    ;(function (AT, React, h) {
      /* 90-drawers.js — 表单抽屉 ＋ 主面板浮层的统一装配点。
       *
       * ★★ 2026-11-09 轮次 6：筛选（三张列表的「筛选」按钮）也改成右侧展开浮层，
       *    与创建 / 编辑共用 `.at-form-mask` ＋ `.at-drawer` 外壳，由本文件 render() 装配
       *    （真源组件在 55-panes.js 的 AT.panes.FilterDrawer）。功能状态机仍是 ui.filterKind。
       *
       * ★★ 2026-11-09 轮次 5（用户拍板）：**外壳几何与弹窗内展示是两件事**。
       *    · 外壳 ＝ DSH 桌面自己的「右侧展开弹窗」：460 贴右、全高、无圆角、左侧 1px 收边。
       *      用户原话「你之前写的右侧展开弹窗我没意见，我觉得挺好的」。几何真源在
       *      `85-desktop.js`；本文件只留一组非桌面基础值（.sd 等价的 320 / 16 圆角 /
       *      left 84），桌面样式注入后一律被覆盖，**不是最终几何**。
       *    · 弹窗内展示 ＝ 轮次 4 已完成的结构级照抄 `form-drawer.wxml/.wxss` 的 `.sd` PC 档，
       *      本轮一行未动：头 52 / 0 14 / head-bg 底 ＋ head-line 收边，右侧「取消」28 胶囊；
       *      体 `12px 14px 0`，字段 gap 6 / margin-bottom 16 / 标签 13/500，
       *      「必填/可空」是中性 chip 底 muted 字（不借紧急红）；底栏 56 / 10px 14px，
       *      **只有一颗** 36 高 10 圆角的实心主键（w-check 15 ＋ 文案）；
       *      待办＝长高 area-box ＋ 四档 chips ＋ 一行一个项目行，
       *      脑图＝38 输入框 ＋ 项目行 ＋ 六行 46 高带 48×34 缩略图的格式行。
       *    ⚠️ 别再把外壳几何算进「照抄 .sd」：用户指出的是**弹窗内的展示**。
       *    ⚠️ 八模式、v 字段、submit() 落库逻辑、嵌套「新建项目」草稿回填一行未动。
       *    ⚠️ 两处有意差异（不新增功能）：① 小程序「选择其他项目」要开三级副抽屉，
       *      插件没有这套机制，全部活跃项目直接铺成行；② 插件待办表单的「新建项目」
       *      入口在新建态也保留（小程序只在编辑态），它是插件既有的嵌套草稿能力。
       */
      ;(function (AT, React, h) {
        'use strict'
        var B = AT.bridge, U = AT.ui, C = AT.const, Core = AT.core, Text = AT.text,
          S = AT.shell, V = AT.views

        var STYLE = [
          /* ── 外壳基础值（仅非桌面场景兜底）───────────────────────────────
           * 桌面层 `85-desktop.js` 会把 left / top / bottom / width / radius / shadow
           * 整体覆盖为「右侧展开弹窗 460 贴右全高」；这几行不是最终几何。 */
          '.at-form-mask{position:absolute;inset:0;z-index:44;background:var(--at-mask)}',
          '.at-drawer{position:absolute;top:16px;bottom:16px;left:84px;width:320px;z-index:45;',
          'display:flex;flex-direction:column;background:var(--at-elevated);',
          'border:1px solid var(--at-hairline);border-radius:16px;box-shadow:var(--at-sh-drawer-l2);overflow:hidden}',
          '.at-drawer.o1{left:354px}',
          '.at-drawer.o2{left:624px}',
          /* ── .sd-head / .sd-title / .sd-cancel ─────────────────────────────── */
          '.at-drawer-head{height:52px;flex:0 0 52px;padding:0 14px;display:flex;align-items:center;',
          'justify-content:space-between;gap:8px;background:var(--at-head-bg);',
          'border-bottom:1px solid var(--at-head-line)}',
          '.at-drawer-title{flex:1;min-width:0;font-size:16px;font-weight:500;color:var(--at-primary);',
          'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
          '.at-drawer .at-sd-cancel{flex:0 0 auto;height:28px;padding:0 12px;border-radius:999px;',
          'border:1px solid var(--at-hairline-strong);background:var(--at-elevated);font-size:13px;',
          'font-weight:500;color:var(--at-slate);display:inline-flex;align-items:center;',
          'justify-content:center;gap:5px;white-space:nowrap;cursor:pointer}',
          '.at-drawer .at-sd-cancel:hover{background:var(--at-chip)}',
          /* ── .sd-body ─────────────────────────────────────────────────────── */
          '.at-drawer-body{flex:1 1 auto;min-height:0;overflow:auto;padding:12px 14px 0}',
          /* 筛选抽屉的体（2026-11-10）：小程序 `.tf-body` 是 `12px 12px 14px` —— 左右比表单
           * 紧 2px、下沿留 14（没有底栏之外的收尾空白）。表单那支仍是 `12 14 0`（贴底栏）。 */
          '.at-drawer-body.at-fd{padding:12px 12px 14px}',
          '.at-drawer-body::-webkit-scrollbar,.at-drawer .at-sd-area-in::-webkit-scrollbar{',
          'appearance:none;width:0;height:0;display:none}',
          /* ── .sd-field / .sd-label / .sd-req,.sd-opt ───────────────────────── */
          '.at-drawer .at-sd-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}',
          '.at-drawer .at-sd-label{font-size:13px;font-weight:500;color:var(--at-primary)}',
          '.at-drawer .at-sd-req,.at-drawer .at-sd-opt{font-style:normal;font-size:11px;',
          'font-weight:400;margin-left:6px;padding:1px 5px;border-radius:999px;',
          'background:var(--at-chip);color:var(--at-muted)}',
          /* 其余六个模式仍用 U.Field：把「必填」em 也收成同一颗中性徽章，一屏只一套语言。 */
          '.at-drawer .at-field-label em{font-style:normal;font-size:11px;font-weight:400;',
          'margin-left:6px;padding:1px 5px;border-radius:999px;background:var(--at-chip);color:var(--at-muted)}',
          '.at-root .at-drawer .at-input,.at-root .at-drawer .at-select{height:38px;',
          'border-radius:10px;font-size:14px}',
          '.at-root .at-drawer .at-textarea{border-radius:10px;font-size:14px;line-height:21px}',
          /* ── .sd-input ────────────────────────────────────────────────────── */
          /* 38 高 / 圆角 10 / 内距 0 10 / 14px / 1px `--at-field-line` —— 与 40-ui 的 `.at-input`
           * 基线逐值一致（小程序 `.sd-input` 也是这套）；聚焦只变描边，不加外圈。 */
          '.at-drawer .at-sd-input{height:38px;border:1px solid var(--at-field-line);border-radius:10px;',
          'padding:0 10px;font-size:14px;color:var(--at-primary);background:var(--at-card);outline:none}',
          '.at-drawer .at-sd-input:focus{border-color:var(--at-text2)}',
          '.at-drawer .at-sd-input::placeholder{color:var(--at-muted);font-size:13px}',
          /* ── .sd-area-box / .sd-area-in（待办正文：随内容长高，最高 2 倍） ───── */
          '.at-drawer .at-sd-area-box{display:flex;flex-direction:column;min-height:104px;width:100%;',
          'border:1px solid var(--at-field-line);border-radius:10px;padding:9px 10px 0;background:var(--at-card)}',
          '.at-drawer .at-sd-area-box:focus-within{border-color:var(--at-text2)}',
          '.at-drawer .at-sd-area-in{width:100%;min-height:93px;padding:0;margin:0;border:0;outline:none;',
          'resize:none;overflow:hidden;scrollbar-width:none;font-size:14px;line-height:21px;',
          'color:var(--at-primary);background:transparent;display:block}',
          '.at-drawer .at-sd-area-in::placeholder{color:var(--at-muted);font-size:13px}',
          /* ── .sd-chips / .sd-chip（选中三色由该档色板 inline 下发） ──────────── */
          '.at-drawer .at-sd-chips{display:flex;flex-wrap:wrap;gap:6px}',
          '.at-drawer .at-sd-chip{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;',
          'border-radius:999px;border:1px solid var(--at-hairline);background:var(--at-card);',
          'font-size:13px;color:var(--at-slate);max-width:100%;cursor:pointer}',
          '.at-drawer .at-sd-chip:hover{background:var(--at-chip)}',
          '.at-drawer .at-sd-chip.is-on{font-weight:500}',
          /* ── .sd-list / .sd-row / .sd-cdot / .sd-row-t / .sd-fthumb ─────────── */
          '.at-drawer .at-sd-list{display:flex;flex-direction:column;gap:6px}',
          '.at-drawer .at-sd-row{height:40px;padding:0 12px;border:1px solid var(--at-hairline);',
          'border-radius:10px;background:var(--at-card);display:flex;flex-direction:row;',
          'align-items:center;gap:8px;width:100%;font-size:14px;color:var(--at-primary);',
          'text-align:left;cursor:pointer}',
          '.at-drawer .at-sd-row:hover{background:var(--at-chip)}',
          '.at-drawer .at-sd-row.is-on{background:var(--at-yellow-soft);border-color:var(--at-yellow)}',
          '.at-drawer .at-sd-row.is-on:hover{background:var(--at-yellow-soft);opacity:.82}',
          '.at-drawer .at-sd-row.is-on .at-sd-row-t{font-weight:500}',
          '.at-drawer .at-sd-row.add{color:var(--at-slate)}',
          '.at-drawer .at-sd-row.add .at-sd-row-t{color:var(--at-slate)}',
          '.at-drawer .at-sd-row.fmt{height:46px}',
          '.at-drawer .at-sd-fthumb{width:48px;height:34px;flex:0 0 48px;border-radius:6px;',
          'background:var(--at-chip);object-fit:contain}',
          '.at-drawer .at-sd-cdot{width:16px;height:16px;border-radius:999px;flex:0 0 16px;box-sizing:border-box}',
          /* 「不关联」那一行的色点：空槽画成虚线圈，别用一块空白（读起来像没加载出来）。 */
          '.at-drawer .at-sd-cdot.empty{background:transparent;border:1px dashed var(--at-hairline-strong)}',
          /* 被别的项目占用的颜色行：整行退到 .4 且不可点（禁用态统一档位，FB-01）。
           * ⚠️ 不给 `:hover` 另写底色 —— 反馈三档里 hover 不许换 `--at-card/--at-surface/--at-solid`
           *    （FB-01 会判红）；禁用行靠 `.4` 与 `not-allowed` 已经说清了。 */
          '.at-drawer .at-sd-row.is-off{opacity:.4;cursor:not-allowed}',
          /* 占用提示三段：只有项目名那一段省略 —— 整条一起 ellipsis 会把「占用」两个字吃掉，
           * 屏幕上只剩「已被「rockchip 工具链…」，反而读不出这是"不可选"。 */
          '.at-drawer .at-sd-row-note{flex:0 0 auto;display:inline-flex;min-width:0;',
          'font-size:11px;color:var(--at-muted);white-space:nowrap}',
          '.at-drawer .at-sd-row-note-n{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
          '.at-drawer .at-sd-row-t{flex:1;min-width:0;font-size:14px;line-height:17px;color:inherit;',
          'overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
          /* ── .sd-foot / .sd-submit ─────────────────────────────────────────── */
          '.at-drawer-foot{height:56px;flex:0 0 56px;padding:10px 14px;display:flex;',
          'flex-direction:row;align-items:center;gap:10px}',
          /* ★ 轮次 6：筛选抽屉共用这条底栏，但它**没有提交动作** ⇒ 不放实心主键，
           * 只放「改动即时生效」说明 ＋ 中性清除键。两颗同高 36 / 10 圆角，
           * 与 .sd-submit 保持同一套底栏节奏，不另起第二套皮肤。 */
          '.at-drawer-foot .at-filter-hint{flex:1 1 auto;min-width:0;font-size:12px;color:var(--at-muted)}',
          '.at-drawer-foot .at-btn{height:36px;border-radius:10px;gap:6px}',
          '.at-drawer .at-sd-submit{flex:1;min-width:0;height:36px;border:0;border-radius:10px;',
          'background:var(--at-solid);color:var(--at-on-solid);font-size:14px;font-weight:500;',
          'display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}',
          '.at-drawer .at-sd-submit:hover:not(:disabled){opacity:.82}',
          '.at-drawer .at-sd-submit:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.at-drawer .at-sd-submit:disabled{opacity:.4;cursor:not-allowed}',
          /* ── 导出 / 信息增强（2026-11-11 轮次 16）─────────────────────────────
           * 照抄小程序 form-drawer.wxss 的 `.ex-box` / `.ex-text` / `.ex-sw` /
           * `.sd-alt` / `.enh-*` / `.sd-submit.ok`，令牌换成 `--at-*` 登记值：
           *   · 只读预览＝白卡 ＋ 1px hairline ＋ 10 圆角，文本 `white-space:pre-wrap`
           *     （原 `.at-code` 不吃换行，导出的 Markdown 会被压成一坨）；
           *   · 「不含图片」是**整行 44 高的热区**（原 `U.Check` 只是颗小复选框）；
           *   · 「增强」在底栏主键**右侧**、黄底恒墨字（原在正文里当普通按钮）；
           *   · 复制成功态：主键自己变亮绿 ＋「已复制」；
           *   · 增强三态：loading 转圈 / error 成因＋重试 / done 只读结果。
           * ⚠️ 状态类一律 `is-*`（插件 FB-18 口径，不照搬小程序的裸 `.on/.ok/.off`）；
           *    禁用档取插件统一的 `.4`，不引第二套 .45。 */
          '.at-drawer .at-ex-box{border:1px solid var(--at-hairline);border-radius:10px;',
          'padding:10px 12px;background:var(--at-card)}',
          '.at-drawer .at-ex-text{font-size:13px;line-height:1.7;color:var(--at-slate);',
          'white-space:pre-wrap;word-break:break-word;user-select:text}',
          '.at-drawer .at-ex-sw{display:inline-flex;align-items:center;gap:6px;height:44px;',
          'margin-top:2px;padding:0;border:0;background:transparent;font:inherit;',
          'color:var(--at-slate);cursor:pointer}',
          '.at-drawer .at-ex-sw:hover{background:var(--at-chip);border-radius:10px}',
          '.at-drawer .at-ex-sw-box{width:16px;height:16px;flex:0 0 16px;border-radius:5px;',
          'border:1px solid var(--at-hairline-strong);background:var(--at-card);',
          'display:flex;align-items:center;justify-content:center}',
          '.at-drawer .at-ex-sw.is-on .at-ex-sw-box{background:var(--at-solid);',
          'border-color:var(--at-solid)}',
          '.at-drawer .at-ex-sw-ck{font-size:12px;line-height:1;color:var(--at-on-solid)}',
          '.at-drawer .at-ex-sw-t{font-size:13px;color:var(--at-slate)}',
          '.at-drawer .at-ex-sw.is-on .at-ex-sw-t{color:var(--at-primary)}',
          '.at-drawer .at-sd-alt{flex:0 0 auto;height:36px;padding:0 14px;border-radius:10px;',
          'border:1px solid var(--at-yellow);background:var(--at-yellow);',
          'color:var(--at-on-accent);font-size:14px;font-weight:500;',
          'display:flex;align-items:center;justify-content:center;gap:6px;',
          'white-space:nowrap;cursor:pointer}',
          '.at-drawer .at-sd-alt:hover:not(:disabled){background:var(--at-yellow-press);',
          'border-color:var(--at-yellow-press)}',
          '.at-drawer .at-sd-alt:active:not(:disabled){transform:translateY(1px);opacity:.78}',
          '.at-drawer .at-sd-alt:disabled{opacity:.4;cursor:not-allowed}',
          '.at-drawer .at-sd-alt.is-off,.at-drawer .at-sd-submit.is-off{opacity:.4}',
          '.at-drawer .at-sd-submit.is-copied{background:var(--at-success);',
          'color:var(--at-on-accent)}',
          '.at-drawer .at-enh-load{display:flex;flex-direction:column;align-items:center;',
          'justify-content:center;gap:10px;padding:48px 0 40px}',
          '.at-drawer .at-enh-spin{width:22px;height:22px;border-radius:50%;',
          'border:2px solid var(--at-hairline);border-top-color:var(--at-yellow-deep);',
          'animation:at-enh-spin .68s linear infinite}',
          '@keyframes at-enh-spin{to{transform:rotate(360deg)}}',
          '@media (prefers-reduced-motion:reduce){.at-drawer .at-enh-spin{animation:none}}',
          '.at-drawer .at-enh-load-t{font-size:14px;font-weight:500;color:var(--at-primary)}',
          '.at-drawer .at-enh-load-s{font-size:12px;color:var(--at-muted)}',
          '.at-drawer .at-enh-err{border:1px solid var(--at-hairline);border-radius:10px;',
          'padding:14px 12px;background:var(--at-card);display:flex;flex-direction:column;gap:12px}',
          '.at-drawer .at-enh-err-t{font-size:13px;line-height:1.7;color:var(--at-slate)}',
          '.at-drawer .at-enh-retry{align-self:flex-start;height:32px;padding:0 14px;',
          'border-radius:999px;border:1px solid var(--at-hairline-strong);',
          'background:var(--at-elevated);font-size:13px;font-weight:500;',
          'color:var(--at-slate);display:inline-flex;align-items:center;gap:5px;cursor:pointer}',
          '.at-drawer .at-enh-retry:hover{background:var(--at-chip)}',
          '.at-drawer .at-enh-note{margin-bottom:8px;padding:7px 10px;border-radius:8px;',
          'border-left:2px solid var(--at-yellow-deep);background:var(--at-chip);',
          'font-size:12px;line-height:1.6;color:var(--at-slate)}',
          /* ── 其余模式共用的色板 swatch ─────────────────────────────────────── */
          /* ★ 2026-11-10：`.at-color-row` / `.at-color-swatch` 两条已整块删除 —— 项目表单的
           * 「项目色」按小程序 57 轮改成**一行一个**（`.at-sd-row` ＋ `.at-sd-cdot`，
           * 带占用置灰与占用者提示），全工程再没有第二个画圆点的色板。
           * 留着一套没有宿主的样式，下一个人会以为还有第二处色板。 */
        ].join('')

        /* ── 六张格式缩略图 ────────────────────────────────────────────────────
         * 逐行照抄 小程序前端/utils/formats.js 的 `thumbs()`（坐标、线型、节点尺寸、
         * data-URI 拼法一字未改）；三色取 utils/theme.js 的 THUMB_LIGHT / THUMB_DARK。
         * 判据会把这里的六个结果与小程序 `formats.list()` 逐字节比对，防止以后漂移。
         * ⚠️ 画的是**结构示意**（1＋3 / 1＋4 个方块），不是真实排版缩略图。 */
        var THUMB_LIGHT = { line: '#C7CAD5', root: '#1C1C1E', leaf: '#FFFFFF' }
        var THUMB_DARK = { line: '#858783', root: '#EEEDEA', leaf: '#202123' }
        function formatThumbs(dark) {
          var p = dark ? THUMB_DARK : THUMB_LIGHT
          var C_LINE = p.line, C_ROOT = p.root, C_LEAF = p.leaf
          var ROOT_W = 12, ROOT_H = 6, LEAF_W = 10, LEAF_H = 5, R_ELBOW = 2
          function nz(v) { return Math.round(v * 10) / 10 }
          function box(x, y, w, h, fill, stroke) {
            var s = stroke === false ? '' : ' stroke="' + (stroke || C_LINE) + '" stroke-width="0.7"'
            return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
              '" rx="1.4" fill="' + fill + '"' + s + '/>'
          }
          function wire(d) { return '<path d="' + d + '" fill="none" stroke="' + C_LINE + '" stroke-width="1"/>' }
          function line(x1, y1, x2, y2) {
            return 'M' + nz(x1) + ' ' + nz(y1) + ' L' + nz(x2) + ' ' + nz(y2)
          }
          function curve(x1, y1, x2, y2) {
            if (Math.abs(y1 - y2) < 0.5) return line(x1, y1, x2, y2)
            var mx = nz((x1 + x2) / 2)
            return 'M' + nz(x1) + ' ' + nz(y1) + ' C' + mx + ' ' + nz(y1) + ' ' +
              mx + ' ' + nz(y2) + ' ' + nz(x2) + ' ' + nz(y2)
          }
          function elbowLR(bx, y1, ex, y2) {
            var s = ex > bx ? 1 : -1, v = y2 > y1 ? 1 : -1
            if (Math.abs(ex - bx) < 0.5) return line(bx, y1, bx, y2)
            var r = Math.min(R_ELBOW, Math.abs(ex - bx), Math.abs(y2 - y1))
            return 'M' + nz(bx) + ' ' + nz(y1) +
              ' L' + nz(bx) + ' ' + nz(y2 - v * r) +
              ' Q' + nz(bx) + ' ' + nz(y2) + ' ' + nz(bx + s * r) + ' ' + nz(y2) +
              ' L' + nz(ex) + ' ' + nz(y2)
          }
          function elbowTB(x1, y1, x2, y2) {
            if (Math.abs(x2 - x1) < 0.5) return line(x1, y1, x2, y2)
            var s = x2 > x1 ? 1 : -1, my = nz((y1 + y2) / 2)
            var r = Math.min(R_ELBOW, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2)
            return 'M' + nz(x1) + ' ' + nz(y1) +
              ' L' + nz(x1) + ' ' + nz(my - r) +
              ' Q' + nz(x1) + ' ' + my + ' ' + nz(x1 + s * r) + ' ' + my +
              ' L' + nz(x2 - s * r) + ' ' + my +
              ' Q' + nz(x2) + ' ' + my + ' ' + nz(x2) + ' ' + nz(my + r) +
              ' L' + nz(x2) + ' ' + nz(y2)
          }
          function uri(inner) {
            return 'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="34" viewBox="0 0 48 34">' +
              inner + '</svg>')
          }
          return {
            /* 思维导图：根居中，一级按叶子数分左右两列，曲线向两侧外扩 */
            mindmap: uri(
              wire(curve(18, 17, 13, 8.5)) + wire(curve(18, 17, 13, 25.5)) +
              wire(curve(30, 17, 35, 8.5)) + wire(curve(30, 17, 35, 25.5)) +
              box(3, 6, LEAF_W, LEAF_H, C_LEAF) + box(3, 23, LEAF_W, LEAF_H, C_LEAF) +
              box(35, 6, LEAF_W, LEAF_H, C_LEAF) + box(35, 23, LEAF_W, LEAF_H, C_LEAF) +
              box(18, 14, ROOT_W, ROOT_H, C_ROOT, false)),
            /* 逻辑图：根在左（纵向居中），一级同列上下排开，曲线并成一束再散开 */
            logic: uri(
              wire(curve(21.5, 17, 28.5, 7.5)) + wire(curve(21.5, 17, 28.5, 17)) +
              wire(curve(21.5, 17, 28.5, 26.5)) +
              box(28.5, 5, LEAF_W, LEAF_H, C_LEAF) + box(28.5, 14.5, LEAF_W, LEAF_H, C_LEAF) +
              box(28.5, 24, LEAF_W, LEAF_H, C_LEAF) +
              box(9.5, 14, ROOT_W, ROOT_H, C_ROOT, false)),
            /* 组织结构图：根在顶，横向总线把三支挂到下一层 */
            org: uri(
              wire(elbowTB(24, 8, 8, 24)) + wire(elbowTB(24, 8, 24, 24)) +
              wire(elbowTB(24, 8, 40, 24)) +
              box(3, 24, LEAF_W, LEAF_H, C_LEAF) + box(19, 24, LEAF_W, LEAF_H, C_LEAF) +
              box(35, 24, LEAF_W, LEAF_H, C_LEAF) +
              box(18, 2, ROOT_W, ROOT_H, C_ROOT, false)),
            /* 树形图：根在左上，竖总线垂下，一级向右缩进直角短枝 */
            tree: uri(
              wire(elbowLR(17, 8, 27, 12.5)) + wire(elbowLR(17, 8, 27, 19.5)) +
              wire(elbowLR(17, 8, 27, 26.5)) +
              box(27, 10, LEAF_W, LEAF_H, C_LEAF) + box(27, 17, LEAF_W, LEAF_H, C_LEAF) +
              box(27, 24, LEAF_W, LEAF_H, C_LEAF) +
              box(11, 2, ROOT_W, ROOT_H, C_ROOT, false)),
            /* 时间轴：根在顶，竖轴往下，一级左右交替 */
            timeline: uri(
              wire(elbowLR(24, 9, 29, 12.5)) + wire(elbowLR(24, 9, 19, 20)) +
              wire(elbowLR(24, 9, 29, 27.5)) +
              box(29, 10, LEAF_W, LEAF_H, C_LEAF) + box(9, 17.5, LEAF_W, LEAF_H, C_LEAF) +
              box(29, 25, LEAF_W, LEAF_H, C_LEAF) +
              box(18, 3, ROOT_W, ROOT_H, C_ROOT, false)),
            /* 鱼骨图：主脊横贯，两根长骨斜拉出去，一级落在骨线远端 */
            fishbone: uri(
              wire(line(12, 17, 47, 17)) +
              wire(line(15, 17, 26, 5)) + wire(line(28, 17, 39, 29)) +
              wire(line(20.5, 11, 23, 11)) + wire(line(33, 11, 35.5, 11)) +
              wire(line(33.5, 23, 37, 23)) +
              box(35.5, 8.5, LEAF_W, LEAF_H, C_LEAF) + box(23, 8.5, LEAF_W, LEAF_H, C_LEAF) +
              box(37, 20.5, LEAF_W, LEAF_H, C_LEAF) +
              box(21, 0, LEAF_W, LEAF_H, C_LEAF) + box(34, 29, LEAF_W, LEAF_H, C_LEAF) +
              box(1, 14, ROOT_W, ROOT_H, C_ROOT, false))
          }
        }

        /* ── .sd 字段控件（只在 90-drawers 内用，不进 U：其他模块不共用这套壳） ── */
        function sdField(key, label, required, opt, children) {
          return h('div', { key: key, className: 'at-sd-field' },
            h('span', { className: 'at-sd-label' }, label,
              required ? h('em', { className: 'at-sd-req' }, '必填') : null,
              opt ? h('em', { className: 'at-sd-opt' }, opt) : null),
            children)
        }
        function sdInput(props) {
          return h('input', { className: 'at-sd-input', type: props.type || 'text',
            value: props.value, placeholder: props.placeholder || '',
            'aria-label': props.label || props.placeholder || '', disabled: props.disabled,
            onChange: function (e) { props.onChange(e.target.value) } })
        }
        /* 正文随内容长高：地板 93（＝104−11）、天花板 197（＝208−11），与小程序
         * AREA_MIN_H / AREA_MAX_H 同源；两道都写在 DOM style 上，不吃原生 auto-height。 */
        function growArea(el) {
          if (!el || !el.style) return
          el.style.height = 'auto'
          var px = Math.min(197, Math.max(93, el.scrollHeight || 93))
          el.style.height = px + 'px'
        }
        function sdArea(props) {
          /* placeholder / aria 一律由调用方给：这张多行框现在待办正文与项目备注共用，
           * 写死「用一句话说清要做什么」会让备注框里出现一句讲待办的提示。 */
          return h('div', { className: 'at-sd-area-box' },
            h('textarea', { className: 'at-sd-area-in', value: props.value,
              placeholder: props.placeholder || '用一句话说清要做什么',
              'aria-label': props.label || '待办内容', spellCheck: false,
              ref: function (el) { if (el) growArea(el) },
              onInput: function (e) { growArea(e.target) },
              onChange: function (e) { props.onChange(e.target.value) } }))
        }
        /* 选中的那颗 chip 用**该档自己的** soft/main/text（深色档取 URGENCY_DARK）；
         * 不用统一的黑底选中，也不借用 --at-yellow —— 与小程序审查 P2-03 同一口径。 */
        function sdUrgency(value, set, dark) {
          return h('div', { className: 'at-sd-chips' }, C.URGENCY.map(function (u) {
            var on = value === u.key
            var d = dark ? (C.URGENCY_DARK[u.key] || {}) : {}
            return h('button', { key: u.key, type: 'button',
              className: 'at-sd-chip' + (on ? ' is-on' : ''),
              'aria-pressed': on ? 'true' : 'false',
              style: on ? { background: d.soft || u.soft, borderColor: d.main || u.main,
                color: d.text || u.text } : null,
              onClick: function () { set('urgency', u.key) } }, u.name)
          }))
        }
        function projectDot(p, dark) {
          if (dark) return C.PROJECT_DARK[p.color] || C.NONE_COLOR_DARK
          return (C.colorOf(p.color) || {}).main || C.NONE_COLOR
        }
        /* 通用胶囊单选（项目节点这类「没有档位配色」的字段）。
         * 选中沿用全工程唯一那套选中语言：黄软底 ＋ 黄描边（FB-01），不走小程序 `.sd-chip.on`
         * 的深色实底 —— 紧急程度那四档自带 soft/main/text，由 sdUrgency 内联下发，不冲突。 */
        function sdChips(options, value, onPick) {
          return h('div', { className: 'at-sd-chips' }, options.map(function (o) {
            var on = value === o.key
            return h('button', { key: o.key, type: 'button',
              className: 'at-sd-chip' + (on ? ' is-on' : ''),
              'aria-pressed': on ? 'true' : 'false',
              style: on ? { background: 'var(--at-yellow-soft)', borderColor: 'var(--at-yellow)',
                color: 'var(--at-primary)' } : null,
              onClick: function () { onPick(o.key) } }, o.name)
          }))
        }
        /* 关联 agent —— 一行一个，首行「不关联」是一次**平等的选择**（不是清空键）。 */
        function sdAgentRows(s, value, onPick) {
          var rows = [{ uid: '__none', id: '', name: '不关联' }].concat((s.agents || []).map(function (a) {
            return { uid: a.id, id: a.id, name: a.name }
          }))
          return h('div', { className: 'at-sd-list' }, rows.map(function (r) {
            var on = String(value || '') === String(r.id || '')
            return h('button', { key: r.uid, type: 'button',
              className: 'at-sd-row' + (on ? ' is-on' : ''),
              'aria-pressed': on ? 'true' : 'false',
              onClick: function () { onPick(r.id) } },
              h('span', { className: 'at-sd-row-t' }, r.name),
              on ? h(U.Icon, { name: 'check', size: 14 }) : null)
          }))
        }
        /* 项目色 —— 一行一个（色点 ＋ 名称）。**被别的项目占用的置灰并写明占用者**：
         * 只说"不可用"会让人以为是 bug，写清是谁占的才能自查（小程序 57 轮同口径）。
         * 占用真源＝`s.projects`，当前这张表单对应的项目自己那一格不算占用。 */
        function sdColorRows(s, curId, value, onPick) {
          function ownerOf(key) {
            var hit = (s.projects || []).filter(function (x) {
              return x.color === key && x.id !== curId && !x.deletedAt
            })[0]
            return hit ? hit.name : ''
          }
          var rows = [{ key: '', name: '不关联', main: '' }].concat(C.COLORS.map(function (c) {
            return { key: c.key, name: c.name, main: c.main }
          }))
          return h('div', { className: 'at-sd-list' }, rows.map(function (c) {
            var on = String(value || '') === String(c.key || '')
            var owner = on || !c.key ? '' : ownerOf(c.key)
            var off = !!owner
            return h('button', { key: c.key || '__none', type: 'button', disabled: off,
              title: off ? ('已被「' + owner + '」占用') : c.name,
              'aria-pressed': on ? 'true' : 'false',
              className: 'at-sd-row' + (on ? ' is-on' : '') + (off ? ' is-off' : ''),
              onClick: function () { if (off) return; onPick(on ? '' : c.key) } },
              h('span', { className: 'at-sd-cdot' + (c.main ? '' : ' empty'),
                style: c.main ? { background: c.main } : null }),
              h('span', { className: 'at-sd-row-t' }, c.name),
              off ? h('span', { className: 'at-sd-row-note' },
                '已被「', h('span', { className: 'at-sd-row-note-n' }, owner), '」占用') : null,
              on ? h(U.Icon, { name: 'check', size: 14 }) : null)
          }))
        }
        /* 一行一个项目（.sd-list / .sd-row）；选中＝黄软底 ＋ 黄描边 ＋ 行尾 check。 */
        function sdProjects(s, value, set, dark, addProject) {
          var rows = Core.activeProjects(s).map(function (p) {
            var on = value === p.id
            return h('button', { key: p.id, type: 'button',
              className: 'at-sd-row' + (on ? ' is-on' : ''),
              onClick: function () { set('projectId', p.id) } },
              h('span', { className: 'at-sd-cdot', style: { background: projectDot(p, dark) } }),
              h('span', { className: 'at-sd-row-t' }, p.name),
              on ? h(U.Icon, { name: 'check', size: 14 }) : null)
          })
          /* 插件既有能力：待办表单里嵌套新建项目并回填草稿。小程序只在编辑态给这行，
           * 这里两个态都保留 —— 删它会砍掉功能，故只把形态收成 .sd-row.add。 */
          if (addProject) rows.push(h('button', { key: '__add', type: 'button',
            className: 'at-sd-row add', onClick: addProject },
            h(U.Icon, { name: 'plus', size: 14, opacity: .6 }),
            h('span', { className: 'at-sd-row-t' }, '新建项目')))
          return h('div', { className: 'at-sd-list' }, rows)
        }
        function sdFormats(value, set, dark) {
          var thumbs = formatThumbs(dark)
          return h('div', { className: 'at-sd-list' }, C.FORMATS.map(function (f) {
            var on = value === f.key
            return h('button', { key: f.key, type: 'button',
              className: 'at-sd-row fmt' + (on ? ' is-on' : ''),
              onClick: function () { set('format', f.key) } },
              h('img', { className: 'at-sd-fthumb', src: thumbs[f.key], alt: '', draggable: false }),
              h('span', { className: 'at-sd-row-t' }, f.label),
              on ? h(U.Icon, { name: 'check', size: 14 }) : null)
          }))
        }

        function listFor(s, kind, scope) {
          if (kind === 'project') return Core.filterProjects(s)
          if (kind === 'todo') return Core.filterTodos(s, scope)
          if (kind === 'mindmap') return Core.filterMindmaps(s)
          if (kind === 'capsule') return Core.capsules(s)
          return []
        }

        /* ------------------------------------------------------------- forms --- */
        function initialValues(s, form) {
          if (form.draft) return Object.assign({}, form.draft)
          var mode = form.mode, id = form.id, preset = form.preset || {}
          if (mode === 'profile') return { name: (s.me || {}).name || '', avatar: (s.me || {}).avatar || '' }
          if (mode === 'project') {
            var p = Core.byId(s.projects, id) || {}
            return { name: p.name || '', node: p.node || C.NODES[0], agentId: p.agentId || '',
              color: p.color || '', remark: p.remark || '' }
          }
          if (mode === 'mindmap') {
            var m = Core.byId(s.mindmaps, id) || {}
            return { name: m.name || '', projectId: m.projectId || preset.projectId || '',
              format: m.format || preset.format || 'mindmap' }
          }
          if (mode === 'agent') {
            var a = Core.byId(s.agents, id) || {}
            return { name: a.name || '', monthlyQuota: String(a.monthlyQuota || ''),
              resetDay: String(a.quotaResetAt || '1') }
          }
          if (mode === 'token') {
            var k = Core.byId(s.tokenKeys, id) || {}
            return { vendor: k.vendor || 'deepseek', apiKey: '' }
          }
          if (mode === 'todo') {
            var t = Core.byId(s.todos, id) || {}
            return { text: t.text || preset.text || '', urgency: t.urgency || preset.urgency || 'mid',
              projectId: t.projectId || preset.projectId || (Core.activeProjects(s)[0] || {}).id || '' }
          }
          /* 导出 / 信息增强：开关值随抽屉一起传（parent.draft 优先，见本函数第一行）。
           * 增强抽屉自己不画开关，但保留同一份 noImage，避免「看到的预览」与「送去增强的
           * 文本」在关闭二层回到 L1 之后分叉。 */
          if (mode === 'export' || mode === 'enhance') return { noImage: !!preset.noImage }
          return { noImage: false }
        }

        /* ★★ 轮次 16：增强请求由**模块层**发，不挂在 FormDrawer 上。
         * 与小程序 `mod-todo.onFormEnhance` 同一套架构（组件只展示、页面发请求）：
         *   ① 「仅在用户点击时调用大模型」—— 请求只从「增强」/「重试」两颗键进来，
         *      抽屉重开 / 组件重建都不会顺手再跑一次；
         *   ② 组件会被 `render()` 换 key 建销，响应回来时实例可能已经没了 ——
         *      状态存在 `ui.form.enh` 上，不打到一张已卸载的抽屉；
         *   ③ seq 是竞态守卫：重试／关掉增强抽屉后，上一轮的响应一律丢弃。
         * ⚠️ 输入恒为点击那一刻算好的 `enhSource`（＝导出预览那一份，含当时的「不含图片」），
         *    重试绝不重算 —— 小程序 F13 修的就是「首次勾了不含图、重试却把图带回去」。 */
        var enhSeq = 0
        function runEnhance(source) {
          var seq = ++enhSeq
          var cur = B.get().ui.form
          if (!cur || cur.mode !== 'enhance') return
          B.ui({ form: Object.assign({}, cur, { enh: {
            state: 'loading', text: '', error: '', notice: '', seq: seq } }) })
          /* ★ 同步调用：请求必须在「点击那一刻」发出（判据据此数调用次数），
           * 不能塞进 Promise.resolve().then —— 那样调用被推到 microtask，界面上
           * 也少了「点下去立刻进 loading」的因果感。同步抛错照样落进 catch。 */
          var pending
          try { pending = B.actions.enhance(source) } catch (e) { pending = Promise.reject(e) }
          Promise.resolve(pending)
            .then(function (d) {
              var now = B.get().ui.form
              if (!now || now.mode !== 'enhance' || !now.enh || now.enh.seq !== seq) return
              var out = (d && (d.text || d.result)) || ''
              B.ui({ form: Object.assign({}, now, { enh: {
                state: out ? 'done' : 'error', text: out, notice: (d && d.notice) || '',
                error: out ? '' : '增强结果为空，请重试', seq: seq } }) })
            })
            .catch(function (e) {
              var now = B.get().ui.form
              if (!now || now.mode !== 'enhance' || !now.enh || now.enh.seq !== seq) return
              /* 错误码只进 console，界面上一律中文成因（全工程口径）。 */
              if (typeof console !== 'undefined' && console.error) {
                console.error('[enhance]', e && e.code, e && e.message)
              }
              B.ui({ form: Object.assign({}, now, { enh: {
                state: 'error', text: '', notice: '',
                error: (e && e.message) || '增强失败了，请稍后重试', seq: seq } }) })
            })
        }

        function FormDrawer(props) {
          var s = props.s, f = s.ui.form, mode = f.mode, id = f.id, scope = f.scope || {}
          var meta = C.FORMS[mode] || C.FORMS.todo
          /* 四档紧急度 chip、项目色点、六张格式缩略图都按主题现取（小程序 o.* 同理）。 */
          var dark = AT.icons.useDark()
          var [v, setV] = React.useState(function () { return initialValues(s, f) })
          var [busy, setBusy] = React.useState(false)
          /* 复制成功态：只在**本次打开**期间有效，关抽屉即复位（小程序 173 轮口径）。 */
          var [copied, setCopied] = React.useState(false)
          function set(k, val) { setV(Object.assign({}, v, (function () { var o = {}; o[k] = val; return o })())) }
          var title = id ? (meta.editTitle || meta.title) : meta.title
          var submitLabel = id ? (meta.editSubmit || meta.submit) : meta.submit
          var todo = (mode === 'export' || mode === 'enhance') ? Core.byId(s.todos, id) : null
          var preview = todo ? Text.copyTodoText(s, id, { noImage: !!v.noImage }) : ''
          /* 增强三态由模块层写进 `ui.form.enh`，组件只读 —— 抽屉重建／响应迟到都不丢。 */
          var enh = f.enh || {}
          var enhState = mode === 'enhance' ? (enh.state || 'idle') : 'idle'
          var enhText = enh.text || ''
          var enhError = enh.error || ''
          var enhNotice = enh.notice || ''
          var enhSource = (f.preset && f.preset.enhSource) || ''
          /* ★ 小程序 form-drawer.js「导出态发现『有脑图但树未就绪』就补一次 loadTree」的
           * 同一条：预览与增强输入是同一份文本，树没到 ⇒ 送进模型的是缺脑图的残文。
           * B.loadTree 自带「已有树直接返回 / 未登录不请求 / 失败给中文提示」三道闸门。 */
          React.useEffect(function () {
            if ((mode === 'export' || mode === 'enhance') && todo && todo.mindmapId &&
              !s.tree[todo.mindmapId]) B.loadTree(todo.mindmapId)
          }, [mode, id, todo && todo.mindmapId, s.tree])

          async function submit() {
            if (busy) return
            if (mode === 'export' || mode === 'enhance') {
              /* ★ 两张抽屉共用一颗主键：动作完全相同（把眼前这段只读文本放进剪贴板），
               * 只取的文本与 toast 不同。loading / error 态没有可复制的东西 ⇒ 压暗并说明原因。 */
              if (mode === 'enhance' && enhState !== 'done') {
                B.toast(enhState === 'error' ? '增强失败了，请先重试' : '还在生成，请稍等', 'danger')
                return
              }
              var copySource = mode === 'enhance' ? enhText : preview
              if (!copySource) {
                B.toast(mode === 'enhance' ? '增强结果为空' : '这条待办没有正文', 'danger')
                return
              }
              var copiedOk = await B.copyText(copySource)
              if (copiedOk) setCopied(true)
              B.toast(copiedOk ? (mode === 'enhance' ? '已复制增强后的提示词' : '已复制到剪贴板')
                : '复制失败', copiedOk ? 'default' : 'danger')
              return
            }
            if (mode === 'todo' && !String(v.text || '').trim()) { B.toast('待办内容不能为空', 'danger'); return }
            if ((mode === 'project' || mode === 'mindmap' || mode === 'agent') && !String(v.name || '').trim()) {
              B.toast('名称不能为空', 'danger'); return
            }
            if (mode === 'mindmap' && !v.projectId) { B.toast('必须选所属项目', 'danger'); return }
            if (mode === 'todo' && !v.projectId) { B.toast('必须选归属项目', 'danger'); return }
            if (mode === 'token' && !id && !String(v.apiKey || '').trim()) { B.toast('请填写 API Key', 'danger'); return }
            setBusy(true)
            var ok = true
            var beforeIds = (mode === 'project' ? s.projects : mode === 'mindmap' ? s.mindmaps : s.todos)
              .map(function (x) { return x.id })
            try {
              if (mode === 'profile') ok = await B.actions.updateMe({ name: v.name, avatar: v.avatar })
              else if (mode === 'project') {
                if (id) ok = await B.actions.updateProject(id, { name: v.name, node: v.node,
                  agentId: v.agentId || null, color: v.color, remark: v.remark })
                else ok = await B.actions.addProject(v)
              } else if (mode === 'mindmap') {
                if (id) ok = await B.actions.updateMindmap(id, { name: v.name, projectId: v.projectId, format: v.format })
                else ok = await B.actions.addMindmap(v)
              } else if (mode === 'agent') {
                var av = { name: v.name, monthlyQuota: Number(v.monthlyQuota) || 0,
                  quotaResetAt: String(v.resetDay || '1') }
                if (id) ok = await B.actions.updateAgent(id, av); else ok = await B.actions.addAgent(av)
              } else if (mode === 'token') {
                var tv = { vendor: v.vendor }; if (v.apiKey) tv.apiKey = v.apiKey
                if (id) ok = await B.actions.updateToken(id, tv); else ok = await B.actions.addToken(tv)
              } else if (mode === 'todo') {
                if (scope.capsuleIds && scope.capsuleIds.length) {
                  ok = await B.actions.promoteToTodo(scope.capsuleIds,
                    { text: v.text, projectId: v.projectId, urgency: v.urgency })
                  if (ok) AT.capsule.closeCapsule()
                } else if (id) ok = await B.actions.updateTodo(id,
                  { text: v.text, urgency: v.urgency, projectId: v.projectId })
                else ok = await B.actions.addTodo({ text: v.text, projectId: v.projectId, urgency: v.urgency })
              }
              if (!ok) return
              var list = mode === 'project' ? B.get().projects : mode === 'mindmap' ? B.get().mindmaps : B.get().todos
              var created = !id && list.filter(function (x) { return beforeIds.indexOf(x.id) < 0 })[0]
              if (created && mode === 'project' && f.parent) {
                B.ui({ form: Object.assign({}, f.parent, { draft: Object.assign({}, f.parent.draft,
                  { projectId: created.id }) }) })
                B.toast('项目已创建，继续填写待办')
                return
              }
              var pickTodoId = scope.pickTodoId || (f.preset || {}).pickTodoId
              if (created && mode === 'mindmap' && pickTodoId) {
                if (!(await B.actions.updateTodo(pickTodoId, { mindmapId: created.id }))) return
                V.openDetail('todo', pickTodoId); B.toast('脑图已创建并关联待办'); return
              }
              if (created && ['project', 'todo', 'mindmap'].indexOf(mode) >= 0) {
                V.openDetail(mode, created.id)
                B.toast(mode === 'todo' ? '待办已保存' : mode === 'project' ? '项目已创建' : '脑图已创建')
                return
              }
              S.closeForm()
              B.toast('已保存')
            } catch (e) { B.toast(e.message || '保存失败，请重试', 'danger') }
            finally { setBusy(false) }
          }
          /* 「增强」＝开二层抽屉 ＋ **立刻**发一次请求（小程序 forms.openNestedEnhance
           * ＋ mod-todo.onFormEnhance 的合体）。改前只 `openForm('enhance')` 换标题、
           * 请求要用户再点一次「重试 / 重新增强」才发 —— 这就是「增强没连通」的根因。
           * ⚠️ 只从这颗键进来，别挪进 useEffect：抽屉一打开就烧 token 是硬约束禁止的。 */
          function openEnhance() {
            var source = String(preview || '')
            if (!source.trim()) { B.toast('这条待办没有正文', 'danger'); return }
            S.openForm('enhance', id, {
              parent: Object.assign({}, f, { draft: v }),
              preset: { enhSource: source, noImage: !!v.noImage }
            })
            runEnhance(source)
          }
          /* 失败态的「重试」复用**同一份**输入，不重算预览（小程序 F13 口径）。 */
          function retryEnhance() { if (enhSource) runEnhance(enhSource) }
          function toggleNoImage() {
            set('noImage', !v.noImage)
            /* 开关一动 ⇒ 预览已不是「已复制的那一份」⇒ 收回成功态（小程序 R06）。 */
            setCopied(false)
          }

          var body = []
          if (mode === 'profile') body.push(
            h(U.Field, { key: 'name', label: '用户名', required: true },
              h(U.TextInput, { label: '用户名', value: v.name, onChange: function (x) { set('name', x) } })),
            h(U.Field, { key: 'avatar', label: '头像' },
              h(U.Btn, { onClick: function () {
                V.pickImage(async function (file) {
                  try {
                    var uri = s.ui.connected ? (await B.uploadImage(file)).uri : URL.createObjectURL(file)
                    set('avatar', uri)
                  } catch (e) { B.toast(e.message, 'danger') }
                })
              } }, '从相册选择'),
              h('span', { className: 'at-muted' }, ' · '),
              h(U.Btn, { onClick: function () { set('avatar', '') } }, '恢复默认')))
          /* ---- 项目表单（2026-11-10 用户第 4 条：按小程序 form-drawer.wxml 的 project 段重做）
           * 原来这五个字段走的是 `U.Field` + 原生 `<select>` + 一排色点 —— 与小程序那套差在
           * **字段形态**（不是差在配色）：
           *   项目名称 → `.sd-input`（同前）
           *   项目节点 → **一排胶囊**（小程序 `.sd-chips`，单选；原来是个下拉）
           *   关联 agent → **一行一个**（`.sd-list` / `.sd-row`，首行「不关联」是一次平等的选择）
           *   项目色  → **一行一个**（色点 ＋ 名称；被别的项目占用的置灰并写明占用者）
           *   备注  → `.sd-area-box`（随内容长高）
           * ⚠️ 为什么两个下拉换成行/胶囊：下拉要"点开才知道有什么"，而这四个字段的候选
           *    最多 8 个、且**互斥占用**（一个颜色只能给一个项目）—— 平铺出来才能一眼看到
           *    「这个颜色已经被谁占了」。小程序 57 轮就是因为这个把胶囊改成了行。
           * ⚠️ 取色/占用的真源是 `s.projects`（当前项目自己那一格不算占用），不另存一份。 */
          if (mode === 'project') body.push(
            sdField('name', '项目名称', true, '',
              sdInput({ label: '项目名称', value: v.name, placeholder: '例如：彩票小助手',
                onChange: function (x) { set('name', x) } })),
            sdField('node', '项目节点', false, '',
              sdChips(C.NODES.map(function (n) { return { key: n, name: n } }), v.node,
                function (x) { set('node', x) })),
            sdField('agentId', '关联 agent', false, '可空',
              sdAgentRows(s, v.agentId, function (x) { set('agentId', x) })),
            sdField('color', '项目色', false, '可空',
              sdColorRows(s, id, v.color, function (x) { set('color', x) }, dark)),
            sdField('remark', '备注', false, '选填',
              sdArea({ label: '备注', value: v.remark, placeholder: '这个项目在做什么、和谁有关',
                onChange: function (x) { set('remark', x) } })))
          /* 新建脑图 —— 照抄 form-drawer.wxml 的 mindmap 段：
           * 脑图名称(.sd-input) ／ 所属项目(.sd-list 一行一个) ／ 格式(.sd-row.fmt 六行带缩略图)。 */
          if (mode === 'mindmap') body.push(
            sdField('name', '脑图名称', true, '',
              sdInput({ label: '脑图名称', value: v.name, placeholder: '例如：票据录入链路',
                onChange: function (x) { set('name', x) } })),
            sdField('projectId', '所属项目', true, '',
              sdProjects(s, v.projectId, set, dark, null)),
            sdField('format', '格式', true, '',
              sdFormats(v.format, set, dark)))
          if (mode === 'agent') body.push(
            h(U.Field, { key: 'name', label: 'agent 名称', required: true },
              h(U.TextInput, { label: 'agent 名称', value: v.name, onChange: function (x) { set('name', x) } })),
            h(U.Field, { key: 'quota', label: '每月套餐额度' },
              h(U.TextInput, { label: '每月套餐额度', type: 'number', value: v.monthlyQuota,
                onChange: function (x) { set('monthlyQuota', x) } })),
            h(U.Field, { key: 'reset', label: '额度重置日 每月' },
              h(U.Select, { label: '额度重置日', value: v.resetDay,
                options: Array.from({ length: 31 }, function (_, i) {
                  return { key: String(i + 1), name: (i + 1) + ' 日' }
                }), onChange: function (x) { set('resetDay', x) } })))
          if (mode === 'token') body.push(
            h(U.Field, { key: 'vendor', label: '模型厂商', required: true },
              h(U.Select, { label: '模型厂商', value: v.vendor,
                options: [{ key: 'deepseek', name: 'DeepSeek' }],
                onChange: function (x) { set('vendor', x) } })),
            h(U.Field, { key: 'key', label: id ? 'API Key（留空不换）' : 'API Key', required: !id },
              h(U.TextInput, { label: 'API Key', type: 'password', value: v.apiKey,
                placeholder: id ? '留空表示不更换' : '', onChange: function (x) { set('apiKey', x) } })))
          /* 新建待办 —— 照抄 form-drawer.wxml 的 todo 段：
           * 待办内容(.sd-area-box 自动长高) ／ 紧急程度(.sd-chips 四档) ／
           * 归属项目(.sd-list 一行一个) + 插件既有的「＋ 新建项目」行。 */
          if (mode === 'todo') body.push(
            sdField('text', '待办内容', true, '',
              sdArea({ value: v.text, onChange: function (x) { set('text', x) } })),
            sdField('urgency', '紧急程度', true, '',
              sdUrgency(v.urgency, set, dark)),
            sdField('projectId', '归属项目', true, '',
              sdProjects(s, v.projectId, set, dark, function () {
                S.openForm('project', '', { scope: scope, parent: Object.assign({}, f, { draft: v }) })
              })))
          /* 导出：只读预览 ＋ 整行「不含图片」开关（小程序 .ex-box / .ex-sw）。
           * ⚠️ 顺序照小程序：先预览、后开关；「增强」不在这里，它属于底栏主键右侧。
           * ⚠️ 预览与复制共用同一个 `Text.copyTodoText()` ⇒ 看到的＝复制到的。 */
          if (mode === 'export') body.push(
            h('div', { key: 'preview', className: 'at-ex-box' },
              h('div', { className: 'at-ex-text' }, preview)),
            h('button', { key: 'noImage', type: 'button',
              className: 'at-ex-sw' + (v.noImage ? ' is-on' : ''),
              role: 'checkbox', 'aria-checked': String(!!v.noImage),
              title: '不含图片', 'aria-label': '不含图片', onClick: toggleNoImage },
              h('span', { className: 'at-ex-sw-box' },
                v.noImage ? h('span', { className: 'at-ex-sw-ck' }, '✓') : null),
              h('span', { className: 'at-ex-sw-t' }, '不含图片')))
          /* 信息增强：loading / error / done 三态（结果只读，不是编辑区）。
           * 请求在点击那一刻已经发出，抽屉一开就是 loading，没有流式吐字。 */
          if (mode === 'enhance') {
            if (enhState === 'loading') body.push(
              h('div', { key: 'enh', className: 'at-enh-load' },
                h('div', { className: 'at-enh-spin' }),
                h('div', { className: 'at-enh-load-t' }, '正在增强提示词…'),
                h('div', { className: 'at-enh-load-s' }, '模型正在整理这条待办，通常 5–20 秒')))
            else if (enhState === 'error') body.push(
              h('div', { key: 'enh', className: 'at-enh-err' },
                h('div', { className: 'at-enh-err-t' }, enhError || '增强失败了，请稍后重试'),
                h('button', { type: 'button', className: 'at-enh-retry', onClick: retryEnhance },
                  h(U.Icon, { name: 'redo', size: 14, opacity: .7 }), '重试')))
            else if (enhState === 'done') body.push(
              enhNotice ? h('div', { key: 'enh-note', className: 'at-enh-note' }, enhNotice) : null,
              h('div', { key: 'enh', className: 'at-ex-box' },
                h('div', { className: 'at-ex-text' }, enhText)))
            else body.push(
              h('div', { key: 'enh', className: 'at-enh-err' },
                h('div', { className: 'at-enh-err-t' },
                  '还没有生成结果，关闭本页回到导出抽屉，点「增强」开始生成')))
          }

          /* .sd-head：标题 ＋ 28 高描边「取消」胶囊（close 13 / gap 5）。
           * .sd-foot：**只有一颗** flex:1 的 --solid 实心主键，w-check 15 ＋ 文案；
           * 取消不进底栏 —— 这是小程序 .sd 最容易照抄漏掉的一处。 */
          return h('div', null,
            h('div', { className: 'at-form-mask', onClick: S.closeForm }),
            h(U.Dialog, { as: 'section', className: 'at-drawer' + (f.offset ? ' o' + f.offset : ''),
              role: 'dialog', 'aria-label': title },
              h('div', { className: 'at-drawer-head' },
                h('span', { className: 'at-drawer-title' }, title),
                h('button', { type: 'button', className: 'at-sd-cancel', onClick: S.closeForm },
                  h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '取消')),
              h('div', { className: 'at-drawer-body' }, body),
              h('div', { className: 'at-drawer-foot' },
                h('button', { type: 'button',
                  className: 'at-sd-submit' + (copied ? ' is-copied' : '') +
                    (mode === 'enhance' && enhState !== 'done' ? ' is-off' : ''),
                  disabled: busy, onClick: submit },
                  h(U.Icon, { name: (mode === 'export' || mode === 'enhance')
                    ? (copied ? 'check' : 'w-copy') : 'w-check', size: 15 }),
                  copied ? '已复制' : submitLabel),
                /* ★★ 279 轮口径：「增强」在「复制到剪贴板」**右侧**，靠 DOM 顺序，
                 * 不写 order / left；宽度由内容定，主键吃 flex:1 自动变窄。
                 * 黄底 ⇒ 图标必须 `tone:'ink'` 恒墨（深色档默认会换成柔白，压黄只有 1.6:1）。
                 * 禁用与复制共用同一条闸门（空预览时点它只是白烧一次模型调用）。 */
                mode === 'export' ? h('button', { type: 'button',
                  className: 'at-sd-alt' + (preview ? '' : ' is-off'),
                  disabled: busy, title: '调用模型增强这段提示词',
                  onClick: openEnhance },
                  h(U.Icon, { name: 'bolt', size: 15, tone: 'ink' }), '增强') : null)))
        }

        /* 胶囊 / 脑图选择器 —— 与创建 / 编辑 / 筛选**同一套右侧抽屉外壳**。
         * ★★ 2026-11-10：这两块原来是内联在待办详情内容最顶上的 `.at-picker` 面板：
         *    用户在下方区块点「选择胶囊 / 关联脑图」时，面板插在内容顶部、落在视口之外
         *    ⇒ 读起来就是"点了没反应"（详情一长就必然复现）。小程序那边本来就是
         *    「主抽屉」（drawers.build('capsule' / 'mindmap')），这里改回抽屉。
         * 分工：多选 / 单选的语义在 AT.panes.CapsulePickBody / MindmapPickBody，
         *       本外壳只管 遮罩 / 头（标题＋取消）/ 体 / 底栏（保存 或 新建脑图）。
         * ⚠️ 胶囊是**多选＋保存**、脑图是**单选即生效**（小程序 picker 的两条不同口径，
         *    别为了"统一"给脑图也加一颗确定键）。 */
        function PickDrawer(props) {
          var s = props.s, kind = props.kind, isCap = kind === 'capsule'
          var picked = (s.ui.capsulePick && s.ui.capsulePick.picked) || []
          var mmPick = s.ui.mmPick || {}
          var todoId = isCap ? (s.ui.capsulePick || {}).todoId : mmPick.todoId
          var todo = Core.byId(s.todos, todoId)
          function close() { B.ui(isCap ? { capsulePick: null } : { mmPick: null }) }
          function submit() {
            if (!todo || !picked.length) return
            B.actions.linkCapsules(todo.id, picked)
            B.ui({ capsulePick: null })
            B.toast('已关联 ' + picked.length + ' 条胶囊')
          }
          return h('div', null,
            h('div', { className: 'at-form-mask', onClick: close }),
            h(U.Dialog, { as: 'section', className: 'at-drawer', role: 'dialog',
              'aria-label': isCap ? '选择胶囊' : '关联脑图' },
              h('div', { className: 'at-drawer-head' },
                h('span', { className: 'at-drawer-title' },
                  isCap ? ('选择胶囊' + (picked.length ? '-' + picked.length : '')) : '关联脑图'),
                h('button', { type: 'button', className: 'at-sd-cancel', onClick: close },
                  h(U.Icon, { name: 'close', size: 13, opacity: .65 }), '取消')),
              h('div', { className: 'at-drawer-body' },
                isCap ? h(AT.panes.CapsulePickBody, { s: s }) : h(AT.panes.MindmapPickBody, { s: s })),
              h('div', { className: 'at-drawer-foot' },
                isCap
                  ? h('button', { type: 'button', className: 'at-sd-submit', disabled: !picked.length,
                    onClick: submit },
                    h(U.Icon, { name: 'w-check', size: 15 }),
                    '保存' + (picked.length ? '（' + picked.length + '）' : ''))
                  : h('button', { type: 'button', className: 'at-sd-submit', onClick: function () {
                    B.ui({ mmPick: null })
                    S.openForm('mindmap', '', { preset: {
                      projectId: todo && todo.projectId, pickTodoId: mmPick.todoId } })
                  } }, h(U.Icon, { name: 'w-plus', size: 15 }), '新建脑图'))))
        }

        function render(s) {
          if (s.ui.form) return h(FormDrawer, {
            key: 'form-' + s.ui.form.mode + '-' + s.ui.form.id, s: s
          })
          /* ★ 轮次 6：筛选与表单共用同一套「右侧展开弹窗」外壳（.at-form-mask ＋
           * .at-drawer），因此也由这里装配 —— 几何 / 层级 / 令牌解绑只有一个真源。
           * form 优先：遮罩已挡住列表头，两者本不会共存；这里再兜一层防叠加。 */
          if (s.ui.filterKind && AT.panes && AT.panes.FilterDrawer) {
            return h(AT.panes.FilterDrawer, {
              key: 'filter-' + s.ui.filterKind, s: s, kind: s.ui.filterKind
            })
          }
          /* ★★ 2026-11-10：胶囊 / 脑图选择器同样走这套外壳（原来是内联面板，见 PickDrawer 头注）。
           * 排在表单与筛选之后：三者互斥（各入口都会先清掉别的），这里只兜一层防叠加。 */
          if (s.ui.capsulePick || s.ui.mmPick) {
            return h(PickDrawer, {
              key: (s.ui.capsulePick ? 'cap-pick-' : 'mm-pick-') +
                ((s.ui.capsulePick || s.ui.mmPick).todoId || ''),
              s: s, kind: s.ui.capsulePick ? 'capsule' : 'mindmap'
            })
          }
          return null
        }

        AT.drawers = { STYLE: STYLE, render: render, listFor: listFor, FormDrawer: FormDrawer,
          PickDrawer: PickDrawer,
          formatThumbs: formatThumbs, sdField: sdField, sdInput: sdInput, sdArea: sdArea,
          sdUrgency: sdUrgency, sdProjects: sdProjects, sdFormats: sdFormats }
      })(AT, React, h)

    })(AT, React, h);

    /* ===== 95-overlays.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    /* ===== 99-entry.js ===== */
    ;(function (AT, React, h) {
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

    })(AT, React, h);

    return AT.entry.createClient()
  },
})
