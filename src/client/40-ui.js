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
