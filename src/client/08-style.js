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
