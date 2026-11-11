/**
 * 生成「闪念胶囊 · PC 对齐预览」可交互规格快照。
 *
 * CSS 不是手抄的：从 src/client/*.js 用 vm 沙箱取出
 *   40-ui.themeCss() / 85-desktop.STYLE / 08-style.tokensCss()+BASE_CSS /
 *   80-capsule.STYLE
 * 直接拼进页面，窗口几何用 08-style.geom 的函数源码，尺寸取 AT.style.S。
 * DOM 的 className / 层级 / 状态类与 80-capsule.js 的 FloatingCapsule 一一对应；
 * 数据是本页的假数据（预览页不发任何请求、不写生产库）。
 *
 *   node scripts/preview-capsule.cjs
 *   ?state=deleted&dark=1&narrow=1
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'src', 'client')
const outFile = path.join(root, '..', '..', 'DSH插件', '闪念胶囊-对齐预览.html')

/* ---- 从真源取 CSS / 常量 / 几何函数（沙箱里不跑 React、不碰 DOM） ---- */
/* 85-desktop.js 求值末会写 AT.views.OverviewBody；其余模块会读 AT.bridge / AT.core /
 * AT.const / AT.text / AT.shell / AT.legend 等命名空间 ⇒ 全部预置成空对象。 */
const NAMESPACES = ['views', 'panes', 'core', 'entry', 'drawers', 'style', 'capsule',
  'overlays', 'bridge', 'mindmap', 'desktop', 'text', 'shell', 'const', 'ui', 'legend']
const AT_STUB = {}
NAMESPACES.forEach(function (k) { AT_STUB[k] = {} })
AT_STUB.icons = { Icon: function () {}, useDark: function () { return false } }
const sandbox = {
  AT: AT_STUB,
  React: {
    useState: function () {}, useEffect: function () {}, useRef: function () {},
    useLayoutEffect: function () {}, createElement: function () {}, Fragment: 'Fragment'
  },
  h: function () {}, console: console, window: {}, document: {}
}
vm.createContext(sandbox)
;['08-style.js', '10-constants.js', '40-ui.js', '85-desktop.js', '80-capsule.js'].forEach(function (name) {
  vm.runInContext(fs.readFileSync(path.join(srcDir, name), 'utf8'), sandbox, { filename: name })
})
const AT = sandbox.AT
if (!AT.style || !AT.ui || !AT.desktop || !AT.capsule) throw new Error('style sources incomplete')
const themeLight = AT.ui.themeCss(false) + AT.desktop.STYLE + AT.style.tokensCss(false)
const themeDark = AT.ui.themeCss(true) + AT.desktop.STYLE + AT.style.tokensCss(true)
const sharedCss = AT.style.BASE_CSS + AT.capsule.STYLE
const scaleJson = JSON.stringify(AT.style.S)
/* v1.5：项目色点 / 紧急 chip / 脑图格式标签都从常量真源取，不在快照里手抄 hex */
const paletteJson = JSON.stringify({
  urgency: AT.const.URGENCY, urgencyDark: AT.const.URGENCY_DARK,
  colors: AT.const.COLORS, projectDark: AT.const.PROJECT_DARK,
  none: AT.const.NONE_COLOR, noneDark: AT.const.NONE_COLOR_DARK,
  formats: AT.const.FORMATS
})
const geomSrc = AT.style.geom.toString()
const clampSrc = AT.style.clamp.toString()

/* ---- 图标资产内联（file:// 预览也能显示） ---- */
const iconDir = path.join(root, 'assets', 'icons')
function svgUri(name) {
  const p = path.join(iconDir, name + '.svg')
  if (!fs.existsSync(p)) return null
  return 'data:image/svg+xml,' + encodeURIComponent(fs.readFileSync(p, 'utf8'))
}
const iconNames = ['check', 'close', 'edit', 'trash', 'chevron-right', 'chevron-left',
  'bolt', 'voice', 'album', 'camera', 'robot', 'project',
  'w-check', 'w-close', 'w-edit', 'w-export', 'w-todo', 'w-mindmap', 'w-trash', 'w-undo']
const icons = {}
iconNames.forEach(function (n) {
  const uri = svgUri(n)
  if (uri) icons[n] = uri
  const darkUri = svgUri('d-' + n)
  if (darkUri) icons['d-' + n] = darkUri
})
icons.logo = 'data:image/png;base64,' +
  fs.readFileSync(path.join(root, 'assets', 'logo.png')).toString('base64')
/* 卡片配图占位：内联 SVG，用来验证 148 高裁图与「看大图」角标 */
icons.demoPic = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#FFE9A8"/><stop offset="0.6" stop-color="#FFF8DC"/>' +
  '<stop offset="1" stop-color="#E8ECF4"/></linearGradient></defs>' +
  '<rect width="600" height="300" fill="url(#g)"/>' +
  '<rect x="46" y="52" width="230" height="16" rx="8" fill="#E4C765" opacity=".7"/>' +
  '<rect x="46" y="86" width="310" height="12" rx="6" fill="#D9BE63" opacity=".45"/>' +
  '<rect x="46" y="112" width="270" height="12" rx="6" fill="#D9BE63" opacity=".45"/>' +
  '<rect x="46" y="164" width="150" height="80" rx="12" fill="#FFFFFF" opacity=".8"/>' +
  '<circle cx="440" cy="152" r="70" fill="#FFFFFF" opacity=".55"/>' +
  '</svg>')
const iconsJson = JSON.stringify(icons)

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>Agent-ToDo · 闪念胶囊 PC 对齐预览</title>
<style id="theme-light">${themeLight}</style>
<style id="theme-dark" disabled>${themeDark}</style>
<style>${sharedCss}</style>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#eceef2;color:#1c1c1e;
    font-family:var(--dsw-alias-font-body,"PingFang SC","Microsoft YaHei",sans-serif)}
  body.is-dark{background:#1c1d20;color:#eeedea}
  body.is-dark .bar,body.is-dark .note{background:#25262a;border-color:#3a3c40;color:#c9c8c4}
  body.is-dark .bar button{background:#303135;border-color:#4a4c50;color:#d8d7d3}
  body.is-dark .bar button.on{background:#eeeae0;border-color:#eeeae0;color:#1c1c1e}
  body.is-dark .legend{color:#b0afab}
  body.is-dark .legend b{color:#eeedea}
  .bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:10px 18px;
    background:#fff;border-bottom:1px solid #e0e2e8}
  .bar h1{font-size:15px;font-weight:600;margin:0 14px 0 0;white-space:nowrap}
  .bar .grp{font-size:11px;color:#a5a8b5;margin-left:8px}
  .bar button{height:28px;padding:0 10px;border:1px solid #c7cad5;border-radius:8px;
    background:#fff;color:#555a6a;font-size:12px;font-weight:600;cursor:pointer}
  .bar button.on{background:#1c1c1e;border-color:#1c1c1e;color:#fff}
  .bar .sep{width:1px;height:20px;background:#e0e2e8;margin:0 4px}
  .note{padding:8px 18px;font-size:12px;color:#686c7a;background:#f7f8fa;
    border-bottom:1px solid #e0e2e8;line-height:1.6}
  .app{display:flex;gap:0;margin:18px auto 28px;width:1102px;max-width:calc(100% - 36px);
    height:653px;border:1px solid #d5d8df;border-radius:12px;overflow:hidden;background:#fff;
    box-shadow:0 12px 32px rgba(28,28,30,.12)}
  body.is-dark .app{border-color:#3a3c40;background:#222326}
  .sidebar{width:164px;flex:0 0 164px;background:#faf9f6;border-right:1px solid #e8e7e2;
    padding:16px 12px;font-size:12px;color:#767670}
  body.is-dark .sidebar,body.is-dark .rightbar{background:#26272a;border-color:#383a3d;color:#8d8d89}
  .sidebar .brand{font-size:14px;font-weight:650;color:#292929;margin-bottom:18px}
  body.is-dark .sidebar .brand{color:#eeedea}
  .sidebar .row{height:32px;display:flex;align-items:center;padding:0 10px;border-radius:7px}
  .sidebar .row.on{background:#f1f0ec;color:#292929;font-weight:600}
  body.is-dark .sidebar .row.on{background:#343539;color:#eeedea}
  .center{position:relative;flex:1 1 auto;min-width:0;background:#fff;overflow:hidden}
  body.is-dark .center{background:#222326}
  /* ⚠️ 标注放**右上角**：抽屉与恒黄标题带都在左上，写在那儿会把标题带压掉一半，
   * 截图验收时第一眼看到的就是一句"跑进界面里的说明"（v1.3 前的实际症状）。 */
  .host-hint{position:absolute;right:20px;top:14px;max-width:260px;text-align:right;
    font-size:12px;line-height:1.5;color:#b0b0a9}
  .host-composer{position:absolute;left:24px;right:24px;bottom:18px;height:56px;
    border:1px solid #e8e7e2;border-radius:10px;background:#faf9f6}
  body.is-dark .host-composer{background:#28292c;border-color:#3a3c40}
  .rightbar{width:130px;flex:0 0 130px;background:#faf9f6;border-left:1px solid #e8e7e2;
    padding:16px 12px;font-size:11px;color:#91918b}
  /* 预览把 fixed 收进内容区；坐标由 AT.style.geom() 现算 */
  .at-cx-mask,.at-cx-drawer,.at-cx-ops,.at-cx-fab,.at-cx-write,.at-cx-sub,
  .at-cx-submask,.at-cx-edit-scrim,.at-cx-modal-layer,.at-cx-preview,
  .at-cx-dockplate,.at-cx-stop-scrim{position:absolute!important}
  .at-ico{width:15px;height:15px;display:block}
  .at-cx-hbtn .at-ico,.at-cx-hclose .at-ico{width:14px;height:14px}
  .at-cx-hcancel .at-ico{width:13px;height:13px}
  .at-cx-proj.is-pick>.at-ico{width:16px;height:16px;flex:0 0 16px}
  .at-cx-map-lead-head .at-ico{width:15px;height:15px}
  .at-cx-hollow .at-ico{width:14px;height:14px}
  .at-cx-card .at-ico{width:12px;height:12px}
  .hide{display:none!important}
  .at-cx-sub .at-cx-btn{flex:1 1 0;min-width:0}
  .at-cx-wave i{width:2px}
  .at-cx-card-pic img{background:#f1f2f5}
  .legend{width:1100px;max-width:calc(100% - 36px);margin:0 auto 32px;font-size:12px;
    line-height:1.9;color:#686c7a}
  /* 落位 / 录音都是**动效**：截图只能定格。这里取动画的峰值那一帧
   * （卡片升到一半、黄光 0.32）—— 是规格快照的约定，不是真界面的稳态。
   * 降落区的高度过渡也一并关掉：过渡期间量到的是旧高度，滚底会差一截。 */
  .at-cx-tail{transition:none!important}
  /* 入场淡入（atxFade）起点是 opacity:0 ⇒ 无头截图偶尔拍到首帧，抽屉会整块消失。
   * 快照只反映**稳态**，这一条必须关掉，不然后面每次截都会随机少一张。 */
  .at-cx-mask,.at-cx-drawer,.at-cx-sub,.at-cx-ops{animation:none!important}
  body.show-motion .at-cx-tail.is-lit::after{animation:none;opacity:.32}
  body.show-motion .at-cx-card.is-pop{animation:none;opacity:.55;transform:translateY(30px) scale(.98)}
  .legend b{color:#1c1c1e}
  .legend code{background:#e5e7ec;padding:1px 5px;border-radius:4px}
</style>
</head>
<body>
<div class="bar">
  <h1>闪念胶囊 · PC 对齐预览</h1>
  <span class="grp">列表</span>
  <button data-state="default" class="on">列表</button>
  <button data-state="selected">选中</button>
  <button data-state="multi">多选</button>
  <button data-state="empty">空态</button>
  <button data-state="recognizing">识别中</button>
  <button data-state="failed">失败态</button>
  <span class="sep"></span>
  <span class="grp">名单</span>
  <button data-state="deleted">已删除</button>
  <button data-state="deleted-sel">已删除·选中</button>
  <button data-state="more">加载更多</button>
  <span class="sep"></span>
  <span class="grp">面板</span>
  <button data-state="compose">写一条</button>
  <button data-state="edit">编辑闪念</button>
  <button data-state="todo">转待办</button>
  <button data-state="mindmap">转脑图</button>
  <button data-state="confirm">删除确认</button>
  <button data-state="preview">看大图</button>
  <span class="sep"></span>
  <span class="grp">录音</span>
  <button data-state="recording">录音中</button>
  <button data-state="transcribing">识别中</button>
  <button data-state="landing">语音落位</button>
  <button data-state="textland">文字落位</button>
  <span class="sep"></span>
  <button id="themeBtn">切换深色</button>
  <button id="narrowBtn">窄内容区 380×420</button>
</div>
<div class="note">
  CSS / 尺寸 / 窗口几何由 <b>src/client/08-style.js · 40-ui.js · 85-desktop.js · 80-capsule.js</b> 现取，非手抄；
  DOM 类名与真实组件一一对应，卡片数据为本页假数据，<b>不发请求、不写库</b>。
  可直接点卡片 / 动作键 / 空心卡 / 悬浮键走一遍交互；支持 <code>?state=…&amp;dark=1&amp;narrow=1</code> 深链。
  <b>它只是规格快照，不等于真界面验收</b> —— 源码改动后仍须「构建 → 重启 DSH」做 GUI 走查。
</div>
<div class="app">
  <div class="sidebar"><div class="brand">Agent ToDo</div>
    <div class="row">概览</div><div class="row">项目</div><div class="row">待办</div>
    <div class="row">脑图</div><div class="row on">闪念胶囊</div><div class="row">我的</div></div>
  <div class="center" id="stage">
    <div class="host-hint">DSH 会话内容区（插件只在这一块里放浮层）</div>
    <div class="host-composer"></div>
    <div class="at-gl at-cx-root" id="cx" data-dark="false">
      <div class="at-cx-mask" id="mask"></div>
      <div class="at-cx-submask hide" id="subMask"></div>
      <div class="at-cx-edit-scrim hide" id="editScrim"></div>
      <div class="at-cx-stop-scrim hide" id="stopScrim"></div>

      <aside class="at-cx-drawer" id="drawer" role="dialog" aria-label="闪念胶囊">
        <div class="at-cx-head">
          <span class="at-cx-title" id="title">闪念胶囊-8</span>
          <div class="at-cx-head-r">
            <!-- v1.6：标题带右上角「关闭」× 已移除；点抽屉外任意空白处 / Esc 关闭 -->
            <button class="at-cx-hbtn" id="multiBtn"><img class="at-ico" data-ic="check" data-fixed="1" alt="">多选</button>
          </div>
        </div>
        <div class="at-cx-list" id="list"></div>
        <div class="at-cx-tail" id="tail" style="height:0px">
          <div class="at-cx-rec" id="recBar">
            <span class="at-cx-rec-num">42s</span>
            <span class="at-cx-wave"><i></i><i></i><i></i><i></i><i></i></span>
            <span class="at-cx-rec-t">轻点任意处停止</span>
          </div>
        </div>
      </aside>

      <div class="at-cx-ops hide" id="ops" role="toolbar" aria-label="闪念操作"></div>
      <div class="at-cx-dockplate" id="dockPlate"></div>

      <aside class="at-cx-sub hide" id="subPanel" role="dialog">
        <div class="at-cx-sub-head"><span class="at-cx-sub-title" id="subTitle">写一条闪念</span>
          <button class="at-cx-hclose" id="subClose"><img class="at-ico" data-ic="close" alt=""></button>
          <button class="at-cx-hcancel hide" id="subCancelHead" title="取消">
            <img class="at-ico" data-ic="close" alt="">取消</button></div>
        <div class="at-cx-sub-body">
          <div id="formCompose">
            <div class="at-cx-field"><span class="at-cx-label">闪念内容</span>
              <textarea class="at-cx-area" placeholder="记一条闪念…">把这条想法接到「客户交付」项目里。</textarea></div>
            <div class="at-cx-field"><span class="at-cx-label">配图</span>
              <div class="at-cx-row"><button class="at-cx-btn">
                <img class="at-ico" data-ic="album" alt="">添加图片</button></div></div>
            <div class="at-cx-hint">保存后这条闪念会出现在列表末尾。</div>
          </div>
          <div id="formEdit" class="hide">
            <div class="at-cx-field"><span class="at-cx-label">闪念内容</span>
              <textarea class="at-cx-area">客户那边希望把「票据脑图」里的扫码入口整条删掉，改成手工录入。</textarea></div>
            <div class="at-cx-field"><span class="at-cx-label">配图</span>
              <div class="at-cx-row"><button class="at-cx-btn">
                <img class="at-ico" data-ic="album" alt="">换一张</button></div></div>
            <div class="at-cx-hint">保存后更新这条闪念的正文和配图。</div>
          </div>
          <div id="formTodo" class="hide">
            <div class="at-cx-field"><span class="at-cx-label">待办内容<span class="at-cx-req">必填</span></span>
              <textarea class="at-cx-area" placeholder="用一句话说清要做什么">客户那边希望把「票据脑图」里的扫码入口整条删掉。</textarea></div>
            <div class="at-cx-field"><span class="at-cx-label">紧急程度<span class="at-cx-req">必填</span></span>
              <div class="at-cx-chips" id="todoChips"></div></div>
            <div class="at-cx-field"><span class="at-cx-label">归属项目<span class="at-cx-req">必填</span></span>
              <div class="at-cx-proj-list" id="todoProjects"></div></div>
          </div>
          <div id="formMap" class="hide">
            <div class="at-cx-map-list" id="mapCards"></div>
          </div>
        </div>
        <div class="at-cx-sub-foot"><button class="at-cx-btn" id="subCancel">取消</button>
          <button class="at-cx-btn is-primary" id="subPrimary">记下来</button></div>
      </aside>

      <div class="at-cx-modal-layer hide" id="confirmLayer">
        <div class="at-cx-modal" role="dialog" aria-label="删除闪念">
          <div class="at-cx-modal-title">删除这条闪念？</div>
          <p class="at-cx-modal-body">删除后可以在「已删除胶囊」里还原；被转成待办或脑图的不会出现在回收站。</p>
          <div class="at-cx-modal-actions"><button class="at-cx-btn">取消</button>
            <button class="at-cx-btn is-danger">删除</button></div>
        </div>
      </div>
      <div class="at-cx-preview hide" id="previewLayer">
        <img id="previewImg" alt="闪念大图">
        <button class="at-cx-preview-x" id="previewX"><img class="at-ico" data-ic="w-close" data-fixed="1" alt=""></button>
      </div>

      <button class="at-cx-write" id="write" title="写一条闪念">
        <img class="at-ico" data-ic="edit" alt=""></button>
      <button class="at-cx-fab" id="fab" title="打开闪念胶囊">
        <img class="at-cx-fab-img" id="fabLogo" alt="Agent ToDo"></button>
    </div>
  </div>
  <div class="rightbar">右侧栏<br><br>插件浮层不覆盖这一列</div>
</div>
<div class="legend">
  <b>逐项对齐 PC / 横屏端</b>：① 标题带 52 恒品牌黄 + 恒墨字/图标、标题跟着名单改名；② 空心卡虚线 42 高、空态是「一句说明」排在入口之后；
  ③ 卡片 14/1.5 正文、3×18 品牌黄引线、11px 元信息、<b>选中 / 编辑中 / 已删除灰化 / 识别中呼吸 / 失败灰字</b>五态；
  ④ 配图 148 高裁图 + 右下「看大图」角标；⑤ 已删除名单分页（10 条/页）＋「点击加载更多 / 已无更多信息」＋ 98 高末尾占位块；
  ⑥ 动作列 72 容器 / 64×46 实心键，录音与第二档打开时整列隐藏；⑦ 写一条 / 编辑 = 260 副抽屉、随内容高、只淡入、挡板透明；<br>
  <b>⑧ 转待办 / 转脑图 = 同一副第二档 <code>.o1</code>：320 宽、左缘 +270（与主抽屉重叠 50）、与主抽屉同高</b>；
  第一档同时侧转 <b>25°（perspective 1100px）</b>且不可点；标题带换成「取消」胶囊。
  转待办是 PC 表单：标题「记一条待办」、三个必填字段、四档 chip 按 soft/main/text 上色、<b>归属项目一行一个项目行</b>（16 色点 + 选中打勾 +「选择其他项目」）、底栏只一颗「保存待办」；
  转脑图是 PC 选择器：标题「选择脑图 N」、lead 卡「语义转脑图」、卡上带项目色点 / 格式 / 当前 / 锁态，<b>先选后确定</b>。<br>
  ⑨ 悬浮键 <b>40 方 / 12 圆角</b>（PC <code>nav-rail.wxss</code> 的 <code>.rail-brand</code>：关闭态品牌图满幅 40、打开态麦克风 22、录音倒数 18；
  56 方是平板<b>竖屏</b> <code>app.wxss .fab</code>，v1.4 抄错分支）；写键同尺寸、<code>--chip</code> 底无描边；
  打开态<b>竖排停在抽屉右侧</b>：写在上、说在下；<b>四种副抽屉一开，竖排带整组收起</b>（否则浮键压住面板底键）；<br>
  ⑩ 录音与落位：降落区从 0 长到抽屉 42%，列表整体上滑、录音行贴在降落区底部；停录后新卡片从下方 60 升起（520ms）并点亮降落区；<br>
  <b>⑩b v1.7 文字创建落位</b>：普通「写一条」保存后<b>只升卡片</b> —— <code>tailOn</code> 恒 false（不顶起列表、不点亮降落区、不呼吸），
  新卡<b>首次渲染</b>即带 <code>.is-pop</code>（+60 / 520ms / backwards）、落位滚底<b>无动画瞬移</b>、<code>.is-pop</code> 精确锁定新建那条 id；
  「语音落位 / 文字落位」两个可点状态并列对照；<br>
  ⑪ 窄内容区时边距收紧、动作列降级，放不下 <b>40</b> 方键时停靠带退回抽屉左下角横排（两张 .o1 一起夹回内容区）。<br>
  <b>⑫ v1.6 白底 / 取消 / 停录</b>：设计图规范E「列表卡：白底」为取色依据，胶囊层用样式标准已登记的
  <code>--at-card</code>（浅 #FFFFFF / 深 #202123）覆写 <code>--at-card / --at-elevated / --at-head-bg</code>，
  与 DSH 宿主暖灰 <code>bg-overlay / bg-layer</code> 解绑 —— 列表卡片、主抽屉、转待办 / 转脑图 / 编辑三块副抽屉的
  面板 · 头部 · 底栏 · 字段行统一回白；动作列三颗实心键不动。
  主抽屉标题带右上角「关闭」× 与编辑面板标题 × / 底栏「取消」一并移除（点抽屉外空白处、挡板、Esc 都能关）；
  停录挡板改在抬手时触发、外部关闭监听改捕获阶段并按 composedPath 判归属，停录后生成胶囊且列表保持打开。<br>
  <b>真源</b>：<code>src/client/08-style.js</code>（样式标准）、<code>src/client/10-constants.js</code>（色板）、<code>src/client/80-capsule.js</code>（胶囊）；
  口径见 <code>文档/Agent-ToDo-DSH插件-前端样式标准-v1.md</code> <b>v1.7</b>。
</div>
<script>
const S = ${scaleJson};
const PALETTE = ${paletteJson};
${clampSrc}
${geomSrc}
const ICONS = ${iconsJson};
const QS = new URLSearchParams(location.search);
const STATES = ['default','selected','multi','empty','recognizing','failed',
  'deleted','deleted-sel','more','compose','edit','todo','mindmap','confirm','preview',
  'recording','transcribing','landing','textland'];
let state = STATES.includes(QS.get('state')) ? QS.get('state') : 'default';
let dark = QS.get('dark') === '1', narrow = QS.get('narrow') === '1';
let delPage = 1;
const $ = id => document.getElementById(id);

const NORMAL = [
  { id:'1', text:'客户那边希望把「票据脑图」里的扫码入口整条删掉，改成手工录入。', time:'今天 10:24', source:'语音' },
  { id:'2', text:'周会上提到：Agent 的月度配额要在概览页露出，别藏在「我的」里。', time:'今天 09:58', source:'文字', img:true },
  { id:'3', text:'把 DSH 插件的字体统一接宿主 --dsw-alias-font-body，数字用等宽。', time:'昨天 18:12', source:'文字' },
  { id:'4', text:'闪念胶囊收件箱不要分页，它是中转站，不会有太多未处理信息。', time:'昨天 16:40', source:'语音' },
  { id:'5', text:'交付复盘里补一段：每客户独立布设一套，A/B/C 是同一客户的三条业务线。', time:'昨天 14:05', source:'文字' },
  { id:'6', text:'脑图节点挂图之后，短文字会被图撑宽，得给正文单独定宽。', time:'前天 20:31', source:'语音' },
  { id:'7', text:'拍照建胶囊那条链路要真机走一遍，别只跑离线判据。', time:'前天 11:08', source:'文字' },
  { id:'8', text:'导出改成复制 Markdown，图片转成 ![...](…) 一行。', time:'前天 09:42', source:'文字' }
];
const DELETED = Array.from({length:12}, (_,i)=>({
  id:'d'+i, text:'已手动删除的闪念 '+(i+1)+'：这条只是回收站里的样例数据。',
  time:'上周 '+(i+1), source: i%3===0?'语音':'文字'
}));
const OPS = [
  { ic:'w-trash', label:'删除', danger:true, dim:false, to:'confirm' },
  { ic:'w-edit', label:'编辑', danger:false, dim:true, to:'edit' },
  { ic:'w-export', label:'导出', danger:false, dim:false, to:'default' },
  { ic:'w-todo', label:'转待办', danger:false, dim:true, to:'todo' },
  { ic:'w-mindmap', label:'转脑图', danger:false, dim:false, to:'mindmap' }
];
const ico = (name, fixed) => '<img class="at-ico" data-ic="'+name+'"'+(fixed?' data-fixed="1"':'')+' alt="">';
const isDelState = s => s==='deleted' || s==='deleted-sel' || s==='more';
function flags(s) {
  return {
    delMode: isDelState(s), empty: s==='empty', wait: s==='recognizing',
    /* PC .cp-bub.editing：编辑面板打开时，被编辑的那条卡片整张变黄 */
    fail: s==='failed', editing: s==='edit', multi: s==='multi',
    sel: (s==='multi') ? ['1','3'] : (s==='deleted-sel') ? ['d0'] :
      ['selected','compose','edit','todo','mindmap','confirm','preview'].includes(s) ? ['1'] : []
  };
}
function paintIcons() {
  document.querySelectorAll('img[data-ic]').forEach(img => {
    const key = img.getAttribute('data-ic');
    const fixed = img.getAttribute('data-fixed') === '1';
    const alt = dark && !fixed ? 'd-' + key : key;
    img.src = ICONS[alt] || ICONS[key] || '';
  });
  const logo = $('fabLogo');
  if (logo) logo.src = ICONS.logo;
  $('previewImg').src = ICONS.demoPic;
}

function renderList(s) {
  const f = flags(s);
  const src = f.delMode ? DELETED : NORMAL;
  const items = f.empty ? [] : (f.delMode ? src.slice(0, S.CAPSULE.delPage * delPage) : src);
  const hasMore = f.delMode && items.length < src.length;
  const allShown = f.delMode && !hasMore && src.length > S.CAPSULE.delPage;
  let out = '<button class="at-cx-hollow" id="hollow">' +
    ico(f.delMode ? 'chevron-left' : 'trash') +
    '<span class="at-cx-hollow-t">' + (f.delMode ? '返回正常列表' : '已删除胶囊') + '</span>' +
    '<span class="at-cx-hollow-n">' + DELETED.length + ' 条</span>' +
    (f.delMode ? '' : ico('chevron-right')) + '</button>';
  if (!items.length) {
    out += '<div class="at-cx-empty">' + (f.delMode
      ? '还没有删除的胶囊。这里只有手动删除的那些 —— 被「转待办 / 转脑图」带走的不会出现在这儿。'
      : '还没有接住的闪念。点那颗黄色麦克风，张口说一句就行 —— 等坐到电脑前再整理。') + '</div>';
  }
  items.forEach(x => {
    const first = x.id === '1' || x.id === 'd0';
    let cls = 'at-cx-card';
    if (f.delMode) cls += ' is-del';
    if (f.sel.indexOf(x.id) >= 0) cls += ' is-sel';
    if (f.editing && first) cls += ' is-editing';
    if (f.wait && first) cls += ' is-wait';
    if (f.fail && first) cls += ' is-fail';
    let text = x.text;
    if (f.wait && first) text = '语音识别中';
    if (f.fail && first) text = '没听清，长按补字';
    out += '<button class="' + cls + '" data-card="' + x.id + '">' +
      '<span class="at-cx-card-text">' + text + '</span>' +
      (x.img ? '<span class="at-cx-card-pic" data-pic="1"><img src="' + ICONS.demoPic +
        '" alt="闪念截图"><span class="at-cx-card-zoom">看大图</span></span>' : '') +
      '<span class="at-cx-card-meta"><span>' + x.time + '</span><span>·</span><span>' + x.source +
        '</span>' + (x.img ? '<span>· 1 张图</span>' : '') + '</span></button>';
  });
  if (hasMore) out += '<button class="at-cx-more" id="moreBtn">点击加载更多</button>';
  else if (allShown) out += '<div class="at-cx-more is-end">已无更多信息</div>';
  out += '<div class="at-cx-endgap"></div>';   /* 272 轮：底部留白写成占位块 */
  $('list').innerHTML = out;
  $('title').textContent = (f.delMode ? '已删除胶囊-' : '闪念胶囊-') + (f.empty ? 0 : src.length);
  $('multiBtn').classList.toggle('is-on', f.multi);
  $('multiBtn').querySelector('img').setAttribute('data-ic', f.multi ? 'w-check' : 'check');
  $('multiBtn').querySelector('img').setAttribute('data-fixed', '1');
}
function renderOps(s) {
  const f = flags(s);
  /* PC wxml 911：!editId && !compose && !recPhase ⇒ 编辑 / 创建 / 录音三态整列不渲染；
   * 转待办 / 转脑图 / 确认 / 看大图 也整列隐藏（80-capsule.js 的 opsCount 同样返回 0）。 */
  const hidden = ['edit','compose','recording','transcribing','landing','textland','empty','recognizing','failed',
    'deleted','more','default','todo','mindmap','confirm','preview'].includes(s);
  $('ops').classList.toggle('hide', hidden);
  const rows = f.delMode
    ? [{ ic:'w-undo', label:'还原', danger:false, dim:false, to:'deleted' }]
    : OPS;
  $('ops').innerHTML = rows.map(o =>
    '<button class="at-cx-op' + (o.danger ? ' is-danger' : '') + (o.dim && f.multi ? ' is-dim' : '') +
    '" data-to="' + o.to + '" title="' + o.label + '">' + ico(o.ic, true) +
    '<span>' + o.label + '</span></button>').join('');
}
const SUB = {
  compose: { title:'写一条闪念', form:'formCompose', primary:'记下来',   compose:true,  edit:false },
  edit:    { title:'编辑闪念',   form:'formEdit',    primary:'保存',     compose:false, edit:true },
  todo:    { title:'记一条待办', form:'formTodo',    primary:'保存待办', compose:false, edit:false, fill:true, o1:true },
  mindmap: { title:'选择脑图 3', form:'formMap',     primary:'确定',     compose:false, edit:false, fill:true, o1:true }
};

/* ★★ v1.5 · 第二档两张面板的内容也从真源渲染：
 * 紧急 chip 的 soft/main/text、项目 16 色点、脑图格式 / 当前 / 锁态标签，
 * 颜色全部来自 10-constants.js（PALETTE），深浅主题会跟着换色。 */
const DEMO_PROJECTS = [
  { name:'客户交付', color:'qing' }, { name:'产品迭代', color:'lv' }
];
const DEMO_MAPS = [
  { id:'m1', name:'票据流转 · 现状梳理', format:'logic',    color:'zong', current:true },
  { id:'m2', name:'客户交付 · 里程碑',   format:'mindmap',  color:'qing' },
  { id:'m3', name:'配额治理方案',        format:'logic',    color:'zi', lock:true }
];
let todoOther = false, todoUrgency = 'mid', todoProject = '客户交付', mapPicked = '';
function projColor(key) {
  if (!key) return dark ? PALETTE.noneDark : PALETTE.none;
  if (dark && PALETTE.projectDark[key]) return PALETTE.projectDark[key];
  const c = PALETTE.colors.find(x => x.key === key);
  return c ? c.main : (dark ? PALETTE.noneDark : PALETTE.none);
}
function formatLabel(key) {
  const f = PALETTE.formats.find(x => x.key === key);
  return f ? f.label : '思维导图';
}
function projRowHtml(name, color, selected) {
  return '<button class="at-cx-proj' + (selected ? ' is-on' : '') + '" data-p="' + name +
    '" aria-pressed="' + selected + '"><span class="at-cx-proj-dot" style="background:' +
    projColor(color) + '"></span><span class="at-cx-proj-t">' + name + '</span>' +
    (selected ? '<span class="at-cx-proj-go">' + ico('check') + '</span>' : '') + '</button>';
}
function renderTodoForm() {
  $('todoChips').innerHTML = PALETTE.urgency.map(u => {
    const pal = dark ? (PALETTE.urgencyDark[u.key] || u) : u;
    const sel = u.key === todoUrgency;
    const st = sel ? ' style="background:' + pal.soft + ';border-color:' + pal.main +
      ';color:' + pal.text + '"' : '';
    return '<button class="at-cx-chip' + (sel ? ' is-on' : '') + '" data-u="' + u.key +
      '" aria-pressed="' + sel + '"' + st + '>' + u.name + '</button>';
  }).join('');
  $('todoProjects').innerHTML = todoOther
    ? '<button class="at-cx-proj is-pick" data-back="1">' + ico('chevron-left') +
      '<span class="at-cx-proj-t">返回项目列表</span></button>' +
      ['内部工具','个人工位'].map(n => projRowHtml(n, '', n === todoProject)).join('')
    : DEMO_PROJECTS.map(p => projRowHtml(p.name, p.color, p.name === todoProject)).join('') +
      '<button class="at-cx-proj is-pick" data-other="1">' + ico('project') +
      '<span class="at-cx-proj-t">选择其他项目</span>' +
      '<span class="at-cx-proj-go">' + ico('chevron-right') + '</span></button>';
}
function renderMapForm() {
  const leadSel = mapPicked === '__ai__';
  const lead = '<button class="at-cx-map-card is-lead' + (leadSel ? ' is-on' : '') +
    '" data-m="__ai__" aria-pressed="' + leadSel + '">' +
    '<span class="at-cx-map-lead-head">' + ico('robot') +
    '<span class="at-cx-map-name">语义转脑图</span></span>' +
    '<span class="at-cx-map-desc">把选中的胶囊交给模型，按语义重组成一张新脑图</span></button>';
  const cards = DEMO_MAPS.map(m => {
    const sel = mapPicked === m.id;
    return '<button class="at-cx-map-card' + (sel ? ' is-on' : '') +
      (m.lock ? ' is-lock' : '') + '" data-m="' + m.id + '" aria-pressed="' + sel + '"' +
      (m.lock ? ' disabled' : '') + '><span class="at-cx-map-name">' + m.name + '</span>' +
      '<span class="at-cx-map-tags"><span class="at-cx-proj-dot" style="background:' +
      projColor(m.color) + '"></span><span class="at-cx-map-tag">' + formatLabel(m.format) +
      '</span>' + (m.lock ? '<span class="at-cx-map-tag">不可选</span>' : '') +
      (m.current ? '<span class="at-cx-map-tag is-current">当前</span>' : '') +
      '</span></button>';
  }).join('');
  $('mapCards').innerHTML = lead + cards;
}
function renderSub(s) {
  const cfg = SUB[s];
  const panel = $('subPanel');
  const o1 = !!(cfg && cfg.o1);
  panel.classList.toggle('hide', !cfg);
  /* ★★ v1.5 · 转待办 / 转脑图共用 PC 第二档 .o1：320 全高，第一档同时侧转 */
  panel.classList.toggle('is-fill', !!(cfg && cfg.fill));
  panel.classList.toggle('is-o1', o1);
  panel.classList.toggle('is-todo', s === 'todo');
  panel.classList.toggle('is-map', s === 'mindmap');
  panel.classList.toggle('is-compose', !!(cfg && cfg.compose));
  $('drawer').classList.toggle('is-turned', o1);
  $('subMask').classList.toggle('hide', !cfg || !!cfg.edit);
  $('editScrim').classList.toggle('hide', !cfg || !cfg.edit);
  /* v1.6：写一条仍保留标题 ×；编辑面板与主抽屉按同一结论移除 ×，第二档用「取消」胶囊 */
  $('subClose').classList.toggle('hide', o1 || s === 'edit');
  $('subCancelHead').classList.toggle('hide', !o1);
  if (!cfg) return;
  $('subTitle').textContent = cfg.title;
  $('subPrimary').textContent = cfg.primary;
  /* 第二档 / 编辑底带都只一颗通栏主键（写一条仍保留「取消」） */
  $('subCancel').classList.toggle('hide', o1 || s === 'edit');
  $('subPrimary').classList.add('is-primary');
  /* 先选后确定：没挑中任何一张卡时，PC 的「确定」是禁用的 */
  $('subPrimary').disabled = (s === 'mindmap') ? !mapPicked : false;
  ['formCompose','formEdit','formTodo','formMap'].forEach(id =>
    $(id).classList.toggle('hide', id !== cfg.form));
}
function renderExtras(s) {
  const rec = s === 'recording';
  /* ★ v1.8 · 识别中：采集已停、文字还没回来 —— 动作列 / 写键照样藏着，降落区不塔。 */
  const asr = s === 'transcribing';
  /* 副抽屉（写 / 编辑 / 转待办 / 转脑图）打开时停靠带整组收起 ——
   * 真组件里 railHidden 让 fab / write / dockplate 都不渲染（否则两颗 40 方键压面板底键）。 */
  const rail = !!SUB[s];
  $('recBar').classList.toggle('hide', !(rec || asr));
  $('recBar').querySelector('.at-cx-rec-num').classList.toggle('hide', asr);
  $('recBar').querySelector('.at-cx-wave').classList.toggle('is-asr', asr);
  $('recBar').querySelector('.at-cx-rec-t').textContent = asr ? '正在转成文字…' : '轻点任意处停止';
  $('stopScrim').classList.toggle('hide', !rec);
  $('write').classList.toggle('hide', rec || asr || rail);
  $('confirmLayer').classList.toggle('hide', s !== 'confirm');
  $('previewLayer').classList.toggle('hide', s !== 'preview');
  /* 落位态：新建那条正在飞入（PC .cp-sw.pop）。
   * ★ v1.7：只有**语音**落位才点亮降落区；文字落位 tailOn=false、tail 高 0。 */
  const land = s === 'landing' || s === 'textland';
  $('tail').classList.toggle('is-lit', s === 'landing');
  const cards = $('list').querySelectorAll('.at-cx-card');
  if (land && cards.length) cards[cards.length - 1].classList.add('is-pop');
  const fab = $('fab');
  fab.classList.toggle('hide', rail);
  fab.classList.toggle('is-rec', rec);
  fab.classList.toggle('is-asr', asr);
  /* PC .rail-brand：关闭态才是满幅 40 的品牌图；抽屉一开换成 22 的麦克风，
   * 起录后换成 18 的 tabular 倒数。快照所有状态都是「已打开」，故不显示 logo。 */
  fab.innerHTML = asr
    ? '<span class="at-cx-fab-clock is-dots">···</span>'
    : rec
      ? '<span class="at-cx-fab-clock">42</span>'
      : '<img class="at-ico" data-ic="voice" data-fixed="1" alt="" style="width:22px;height:22px">';
}
function layout() {
  const W0 = narrow ? 380 : 806, H0 = narrow ? 420 : 653;
  const app = document.querySelector('.app');
  app.style.width = (W0 + 164 + 130 + 2) + 'px';
  app.style.height = H0 + 'px';
  const stage = $('stage');
  stage.style.width = W0 + 'px'; stage.style.height = H0 + 'px';
  /* 窄内容区里抽屉几乎占满，标注没有落点 ⇒ 收起来（它只是说明，不是界面元素） */
  const hint = document.querySelector('.host-hint');
  if (hint) hint.style.display = narrow ? 'none' : '';
  /* ★ 按「实际量到的内容区」算几何，不能拿固定的 806×653：
   * 浏览器窗口比 .app 窄时 max-width 会把外框压小，仍按 806 摆浮层就越界。
   * 这正好演示了 DSH 里 geom(getBoundingClientRect()) 的窗口适配口径。 */
  const W = Math.round(stage.clientWidth), H = Math.round(stage.clientHeight);
  const g = geom({ left: 0, top: 0, width: W, height: H });
  const box = (el, l, t, w, h) => {
    if (!el) return;
    el.style.left = l + 'px'; el.style.top = t + 'px';
    if (w != null) el.style.width = w + 'px';
    if (h != null) el.style.height = h + 'px';
  };
  ['mask','subMask','editScrim','stopScrim','confirmLayer','previewLayer'].forEach(id => box($(id), 0, 0, W, H));
  box($('drawer'), g.left, g.top, g.width, g.height);
  const sub = $('subPanel');
  /* ★★ v1.5 · 转待办 / 转脑图共用同一副 .o1 几何：320 宽、左缘 +270
   * （与主抽屉重叠 50）、与主抽屉同高。v1.4 的「转脑图 260 / +12」是误认 .sd3。 */
  const o1 = !!(SUB[state] && SUB[state].o1);
  if (o1) box(sub, g.todoLeft, g.subTop, g.todoWidth, g.height);
  else { box(sub, g.subLeft, g.subTop, g.subWidth, null); sub.style.height = 'auto'; }
  sub.style.maxHeight = o1 ? 'none' : g.subMaxHeight + 'px';
  /* 录音 / **语音**落位才展开的降落区（PC .cp-tail 起录才置 tailOn）；
   * 文字落位 tail 恒 0，这正是 v1.7 与 v1.4 的区别。 */
  $('tail').style.height = (state === 'recording' || state === 'transcribing' || state === 'landing')
    ? g.tailH + 'px' : '0px';
  const n = $('ops').children.length || 5;
  const groupH = n * S.CAPSULE.opsKeyH + (n - 1) * S.CAPSULE.opsGap;
  const ops = $('ops');
  /* 与 80-capsule.js 的 _opsTop 同一套落点：单选 ⇒ 组中心对齐那条卡片的中心；
   * 多选 / 已删除名单没选 ⇒ 恒居中；组底不许压到右侧竖排停靠带。 */
  const drTop = g.top, drBottom = g.top + g.height;
  let opsTop = drTop + Math.max(0, (g.height - groupH) / 2);
  const selCards = $('list').querySelectorAll('.at-cx-card.is-sel');
  if (selCards.length === 1) {
    const cr = selCards[0].getBoundingClientRect();
    const dr = $('drawer').getBoundingClientRect();
    opsTop = drTop + (cr.top - dr.top + cr.height / 2) - groupH / 2;
  }
  const limitBottom = Math.min(drBottom - 8, g.opsLimitBottom);
  opsTop = Math.min(Math.max(opsTop, drTop + 8), Math.max(drTop + 8, limitBottom - groupH));
  box(ops, g.inside ? W - g.pad - g.opsW : g.opsLeft, opsTop, g.opsW, null);
  ops.style.paddingLeft = g.inside ? '0' : '8px';
  ops.classList.toggle('is-inside', g.inside);
  /* 与 80-capsule.js 同源：抽屉一开，浮键组就停到**抽屉右侧那条竖排带**上
   * （写在上、说在下，对齐 PC / 横屏 .rail-brand + .rail-write 的 40 方键）；关闭态才用可拖动坐标。 */
  box($('fab'), g.railLeft, g.railSayTop);
  box($('write'), g.railWriteLeft, g.railWriteTop);
  const plate = $('dockPlate');
  plate.classList.toggle('hide', g.railOutside || !!SUB[state]);
  if (!g.railOutside) {
    box(plate, g.railLeft - 4, g.railSayTop - 4,
      S.CAPSULE.fab * 2 + S.CAPSULE.dockGap + 8, S.CAPSULE.fab + 8);
  }
}
function setState(s) {
  const prev = state;
  state = s;
  /* 真组件 onToMindmap 每次都带 mapPickedId:'' —— 重新进入不该留着上次的选中 */
  if (s === 'mindmap' && prev !== 'mindmap') mapPicked = '';
  if (s === 'more') delPage = 1;
  else if (s === 'deleted' || s === 'deleted-sel') delPage = s === 'deleted' ? 2 : 1;
  renderList(s); renderOps(s); renderSub(s); renderExtras(s);
  renderTodoForm(); renderMapForm(); paintIcons();
  document.querySelectorAll('[data-state]').forEach(b =>
    b.classList.toggle('on', b.getAttribute('data-state') === s));
  document.body.classList.toggle('show-motion', s === 'landing' || s === 'textland');
  layout();
  /* 落位 / 录音都停在**列表底部**（PC 起录上滑到底、新气泡从底部升起）。
   * 降落区高度是带过渡的（真组件同款），只滚一次会在过渡中途量到小高度 ⇒ 补两帧。
   * ★ v1.7：文字落位同样要看到「最后一张卡正在升」，只是不展开降落区。 */
  if (s === 'landing' || s === 'textland' || s === 'recording' || s === 'transcribing') {
    const toBottom = () => { $('list').scrollTop = $('list').scrollHeight; };
    toBottom();
    requestAnimationFrame(toBottom);
    setTimeout(toBottom, 420);
  }
}
function setTheme(d) {
  dark = d;
  $('theme-light').disabled = d; $('theme-dark').disabled = !d;
  $('cx').setAttribute('data-dark', String(d));
  document.body.classList.toggle('is-dark', d);
  $('themeBtn').textContent = d ? '切换浅色' : '切换深色';
  $('themeBtn').classList.toggle('on', d);
  /* 色点 / chip 是行内 style，不随 CSS 主题自动换色 ⇒ 重渲一遍 */
  renderTodoForm(); renderMapForm(); paintIcons();
}
function syncNarrowBtn() {
  $('narrowBtn').classList.toggle('on', narrow);
  $('narrowBtn').textContent = narrow ? '回到 806×653' : '窄内容区 380×420';
}

/* ---- 交互：点卡片 / 动作键 / 空心卡 / 加载更多 / 悬浮键都能走 ---- */
$('list').addEventListener('click', e => {
  if (e.target.closest('.at-cx-card-pic')) { setState('preview'); return; }
  if (e.target.closest('.at-cx-card')) {
    setState(isDelState(state) ? 'deleted-sel' : 'selected'); return;
  }
  if (e.target.closest('#hollow')) { setState(isDelState(state) ? 'default' : 'deleted'); return; }
  if (e.target.closest('#moreBtn')) { delPage++; setState('deleted'); return; }
});
$('ops').addEventListener('click', e => {
  const b = e.target.closest('button[data-to]');
  if (b) setState(b.getAttribute('data-to'));
});
$('write').addEventListener('click', () => setState('compose'));
$('fab').addEventListener('click', () => setState(state === 'recording' ? 'default' : 'recording'));
$('multiBtn').addEventListener('click', () => setState(state === 'multi' ? 'default' : 'multi'));
$('stopScrim').addEventListener('click', () => setState('default'));
$('subMask').addEventListener('click', () => setState('default'));
$('editScrim').addEventListener('click', () => setState('default'));
$('mask').addEventListener('click', () => setState('default'));
$('confirmLayer').addEventListener('click', () => setState('default'));
$('previewLayer').addEventListener('click', () => setState('default'));
$('subClose').addEventListener('click', () => setState('default'));
$('subCancelHead').addEventListener('click', () => setState('default'));
$('subCancel').addEventListener('click', () => setState('default'));
$('subPrimary').addEventListener('click', () => {
  if (!$('subPrimary').disabled) setState('default');
});
/* 转待办表单：四档 chip / 一行一个项目行 /「选择其他项目」换页 */
$('todoChips').addEventListener('click', e => {
  const b = e.target.closest('button[data-u]');
  if (!b) return;
  todoUrgency = b.getAttribute('data-u');
  renderTodoForm(); paintIcons();
});
$('todoProjects').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.hasAttribute('data-other')) todoOther = true;
  else if (b.hasAttribute('data-back')) todoOther = false;
  else if (b.getAttribute('data-p')) { todoProject = b.getAttribute('data-p'); todoOther = false; }
  renderTodoForm(); paintIcons();
});
/* 转脑图：点卡只选中，底部「确定」才真正提交（先选后确定） */
$('mapCards').addEventListener('click', e => {
  const b = e.target.closest('button[data-m]');
  if (!b || b.disabled) return;
  mapPicked = b.getAttribute('data-m');
  renderMapForm(); renderSub('mindmap'); paintIcons();
});
document.querySelectorAll('[data-state]').forEach(b =>
  b.addEventListener('click', () => setState(b.getAttribute('data-state'))));
$('themeBtn').addEventListener('click', () => setTheme(!dark));
$('narrowBtn').addEventListener('click', () => { narrow = !narrow; syncNarrowBtn(); layout(); });

syncNarrowBtn(); setTheme(dark); setState(state);
</script>
</body>
</html>
`
fs.writeFileSync(outFile, html, { encoding: 'utf8' })
console.log(JSON.stringify({ ok: true, outFile, bytes: Buffer.byteLength(html) }, null, 2))
