/* Regression checks for the desktop-only workflows. No network or GUI needed. */
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { harness, collectNodes, collectStrings } = require('./verify-package.cjs')
const source = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8')
const passed = []
/* ★ 轮次 4：按钮现在带装饰图标（`<img src=…>`）。`collectStrings` 会连 props 里的
 * src / className 一起收，把它当按钮文案就会把「保存」读成「保存/agent-todo/…」。
 * 动作定位只该看**文本后代**，props 是装饰与可访问性属性，不是标签。 */
function textOf(node, out) {
  out = out || []
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out }
  if (Array.isArray(node)) { node.forEach(n => textOf(n, out)); return out }
  if (typeof node === 'object') (node.children || []).forEach(n => textOf(n, out))
  return out
}
function action(tree, label) {
  const node = collectNodes(tree).find(n => typeof n.props.onClick === 'function' &&
    textOf(n.children).join('') === label)
  assert.ok(node, 'action missing: ' + label)
  return node.props.onClick
}
/* 源码级判据只该看**代码**：注释里点名某个旧 API 是「说明为什么不用它」，
 * 拿子串去判会把说明读成使用（v1.8 一次误报就栽在这儿）。 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}
async function main() {
  const { AT, B, Core, fetchCalls } = harness(source)
  const confirm = AT.ui.Confirm({ title: '删除？', body: '可还原', onConfirm() {}, onCancel() {}, danger: true })
  assert.equal(confirm.props.footer.length, 2)
  assert.equal(confirm.children.length, 1)
  passed.push('confirmation renders its buttons in the modal footer')

  B.ui({ paneWidth: 520, active: 'todo' })
  AT.panes.setSel('todo', 'd-demo-1')
  assert.ok(AT.panes.widthClass(B.get()).includes('show-detail'))
  AT.shell.onNav('todo')
  assert.equal(B.get().ui.detailOpen, false)
  passed.push('narrow panel enters detail and returns to its list')

  const original = B.get().tree['m-demo-1']
  const before = JSON.stringify(original)
  await B.actions.promoteToMindmap('m-demo-1', ['c-demo-1'])
  assert.equal(JSON.stringify(original), before)
  assert.ok(AT.text.findNode(B.get().tree['m-demo-1'], 'cap-root'))
  assert.equal(fetchCalls.length, 0)
  passed.push('capsule-to-mindmap leaves the previous tree immutable')

  const h2 = harness(source)
  await h2.B.actions.promoteToTodo(['c-demo-1', 'c-demo-2'], {
    text: '两条合并', projectId: 'p-demo-1', urgency: 'mid'
  })
  const created = h2.B.get().todos.at(-1)
  assert.equal(h2.Core.capsulesOfTodo(h2.B.get(), created.id).length, 2)
  assert.ok(h2.Text.copyTodoText(h2.B.get(), created.id).includes('脑图贴着任务'))
  passed.push('demo batch promotion preserves all source capsules for handoff')

  const h3 = harness(source)
  h3.AT.shell.openForm('todo', '', { preset: { text: '不能丢失的草稿' } })
  const form = h3.AT.drawers.FormDrawer({ s: h3.B.get() })
  /* 主键带 w-check 图标仍能按文案定位：证明 textOf 没有把判据改哑。 */
  assert.ok(action(form, '保存待办'), 'icon-bearing primary key must stay addressable by its label')
  action(form, '新建项目')()
  assert.equal(h3.B.get().ui.form.mode, 'project')
  assert.equal(h3.B.get().ui.form.parent.draft.text, '不能丢失的草稿')
  h3.AT.shell.closeForm()
  const returned = h3.AT.drawers.FormDrawer({ s: h3.B.get() })
  const textarea = collectNodes(returned).find(n =>
    String(n.props.className || '') === 'at-sd-area-in')
  assert.ok(textarea, '.sd area box must render a textarea')
  assert.equal(textarea.props.value, '不能丢失的草稿')
  passed.push('nested project creation preserves and restores the todo draft')

  const failed = harness(source, { fetchFail: true })
  failed.B.ui({ connected: true })
  failed.AT.shell.openForm('todo', 'd-demo-1')
  const edit = failed.AT.drawers.FormDrawer({ s: failed.B.get() })
  await action(edit, '保存')()
  assert.equal(failed.B.get().ui.form.mode, 'todo')
  assert.equal(failed.B.get().ui.toast.tone, 'danger')
  passed.push('failed save keeps the editor open without a success message')

  await B.actions.promoteToMindmapAi(['c-demo-2'])
  await assert.rejects(B.actions.enhance('正文'), /未登录/)
  assert.equal(fetchCalls.length, 0)
  passed.push('demo AI actions never call a model or claim a generated result')

  const initial = B.get().tree['m-demo-1']
  const changed = AT.text.treeRules.addNode(initial, initial.id, '首次编辑', false)
  await B.actions.setTree('m-demo-1', changed)
  const undo = AT.text.historyMove(B.get().hist, 'm-demo-1', -1)
  assert.equal(JSON.stringify(undo.tree), JSON.stringify(initial))
  passed.push('first mindmap edit can undo to its original tree')

  const layout = AT.mindmap.layout({
    metricsMap() { return {} },
    layoutOf() { return {
      'n-root': { id: 'n-root', x: 100, y: 100, cx: 150, cy: 120, w: 100, h: 40 },
      'n-2': { id: 'n-2', x: 300, y: 100, cx: 350, cy: 120, w: 100, h: 40 }
    } },
    buildLinksUri() { return { uri: 'data:image/svg+xml,', box: { x: -100, y: -200, w: 3000, h: 2000 } } }
  }, Core.initialState().tree['m-demo-1'], 'logic')
  assert.equal(layout.width, 348)
  assert.equal(layout.height, 88)
  assert.equal(layout.linksW, 3000)
  assert.equal(layout.nodes[0].x, 24)
  assert.equal(layout.linksX, -76)
  passed.push('fit uses actual node bounds while keeping the original link image aligned')

  /* ---- global floating capsule ------------------------------------------ */
  B.ui({ capsule: { open: true, selected: ['c-demo-2'], delMode: false, multi: false,
    composeOpen: false, editId: '', todoPick: false, mapPick: false, deleteOpen: false,
    previewUri: '', phase: '', clock: '' } })
  const floatTree = AT.capsule.FloatingCapsule()
  const floatNodes = collectNodes(floatTree)
  assert.ok(floatNodes.some((n) => n.props && String(n.props.className || '').includes('at-cx-fab')),
    'floating Agent ToDo logo must render outside the plugin panel')
  assert.ok(floatNodes.some((n) => n.props && String(n.props.className || '').includes('at-cx-drawer')),
    'clicking the logo opens the PC-style capsule drawer')
  const opLabels = floatNodes
    .filter((n) => n.props && String(n.props.className || '').includes('at-cx-op'))
    .map((n) => collectStrings(n.children).join('')).join(' ')
  for (const label of ['删除', '编辑', '导出', '转待办', '转脑图']) {
    assert.ok(opLabels.includes(label), 'capsule action column missing: ' + label)
  }
  const baseCap = { open: true, selected: ['c-demo-2'], delMode: false, multi: false,
    composeOpen: false, composeText: '', composeImage: null, saving: false,
    editId: '', editText: '', editImageUri: '', todoPick: false, todoProjectId: '',
    todoUrgency: 'mid', todoText: '', mapPick: false, mapBusy: '', todoBusy: false,
    deleteOpen: false, previewUri: '', phase: '', clock: '' }
  B.ui({ capsule: Object.assign({}, baseCap, { editId: 'c-demo-2', editText: '编辑正文' }) })
  const editTree = AT.capsule.FloatingCapsule()
  const editText = collectStrings(editTree).join(' ')
  assert.ok(editText.includes('编辑闪念'), 'edit panel title missing')
  assert.ok(editText.includes('添加图片'), 'edit panel must offer image attachment')
  assert.ok(collectNodes(editTree).some((n) => n.type === 'textarea'),
    'edit panel must use a textarea')
  B.ui({ capsule: Object.assign({}, baseCap, { todoPick: true,
    todoProjectId: 'p-demo-1', todoText: '转待办正文' }) })
  assert.ok(collectStrings(AT.capsule.FloatingCapsule()).join(' ').includes('记一条待办'),
    'to-do drawer must use the PC form title (.sd.o1 / forms.buildRaw todo)')
  B.ui({ capsule: Object.assign({}, baseCap, { mapPick: true }) })
  assert.ok(collectStrings(AT.capsule.FloatingCapsule()).join(' ').includes('选择脑图'),
    'mindmap drawer must use the PC picker title (drawers.buildMindmapPick)')
  B.ui({ capsule: Object.assign({}, baseCap, { composeOpen: true, composeText: '写正文' }) })
  assert.ok(collectStrings(AT.capsule.FloatingCapsule()).join(' ').includes('写一条闪念'))
  passed.push('global capsule: draggable logo renders + PC action column has five actions')
  passed.push('global capsule: compose / edit / to-do / mindmap use right-side PC drawers')

  /* ★★ v1.5 · 第二档 `.o1`（转待办 `.sd.o1` ／ 转脑图 `.dw.o1`）——
   * 两者是**同一副几何**：320 宽、left = 主抽屉 left + 270（＝重叠 50）、与主抽屉同高。
   * 主抽屉同时 `.is-turned` 侧转 25°（PC `capsule.wxss` 的 `.cp.turned`）。
   * v1.4 的「转脑图 260 / +12」是误认 `.sd3`（表单里「选择其他项目」的三级弹窗）。 */
  ;[{ pick: 'todoPick', cls: 'is-todo' }, { pick: 'mapPick', cls: 'is-map' }].forEach(function (spec) {
    const capState = Object.assign({}, baseCap, { todoProjectId: 'p-demo-1', todoText: '转待办正文' })
    capState[spec.pick] = true
    B.ui({ capsule: capState })
    const nodes = collectNodes(AT.capsule.FloatingCapsule())
    const panel = nodes.find(function (n) {
      return n.props && String(n.props.className || '').indexOf('at-cx-sub') === 0 &&
        String(n.props.className || '').includes(spec.cls)
    })
    assert.ok(panel, 'full-height .o1 drawer missing: ' + spec.cls)
    const drawer = nodes.find(n => n.props && /at-cx-drawer(\s|$)/.test(String(n.props.className || '')))
    assert.equal(panel.props.style.height, drawer.props.style.height,
      spec.cls + ' must share the main drawer height')
    assert.equal(panel.props.style.width, '320px', spec.cls + ' must use the PC .o1 width')
    const drL = parseFloat(drawer.props.style.left)
    const drW = parseFloat(drawer.props.style.width)
    assert.equal(parseFloat(panel.props.style.left), drL + drW - 50,
      spec.cls + ' must sit on the .o1 line (left +270 = overlap 50)')
    assert.ok(String(panel.props.className).includes('is-fill'), spec.cls + ' needs the fill layout')
    assert.ok(String(panel.props.className).includes('is-o1'), spec.cls + ' must be a second-level .o1')
    assert.ok(String(drawer.props.className).includes('is-turned'),
      spec.cls + ' must turn the first drawer (PC .cp.turned)')
    assert.ok(nodes.some(n => n.props && /at-cx-hcancel/.test(String(n.props.className || ''))),
      spec.cls + ' must use the 28px 取消 capsule in its title band')
  })
  /* 写 / 编辑是同一层往外展开的 260 副弹窗 ⇒ 父层仍可读可点，不侧转 */
  B.ui({ capsule: Object.assign({}, baseCap, { composeOpen: true, composeText: '写正文' }) })
  const composeMain = collectNodes(AT.capsule.FloatingCapsule())
    .find(n => n.props && /at-cx-drawer(\s|$)/.test(String(n.props.className || '')))
  assert.ok(!String(composeMain.props.className).includes('is-turned'),
    'compose / edit must NOT turn the first drawer')
  passed.push('capsule render: to-do / mindmap are .o1 second drawers and turn the first drawer')

  /* ★★ v1.5 · 转待办表单 = PC `.sd.o1` 的字段形态：
   * 归属项目是**一行一个的项目行**（色点 + 名称 + 选中打勾），不是 `<select>`；
   * 标题带右上「取消」胶囊，底部 56 只一颗主键「保存待办」。 */
  B.ui({ capsule: Object.assign({}, baseCap, { todoPick: true, todoProjectId: 'p-demo-1' }) })
  const todoNodes = collectNodes(AT.capsule.FloatingCapsule())
  const todoText = collectStrings(todoNodes).join(' ')
  ;['紧急', '中等', '不紧急', '留置'].forEach(function (u) {
    assert.ok(todoText.includes(u), 'to-do panel must offer urgency chips like PC .sd-chip: ' + u)
  })
  assert.ok(!todoNodes.some(n => n.type === 'select'),
    'project field must NOT be a <select> (PC .sd-row is one row per project)')
  const projRows = todoNodes.filter(n => n.props &&
    /at-cx-proj(\s|$)/.test(String(n.props.className || '')))
  assert.ok(projRows.length >= 2, 'project list must render each active project as its own row')
  assert.ok(projRows.some(n => String(n.props.className).includes('is-on')),
    'the current project row must carry the selected state')
  assert.ok(todoNodes.some(n => n.props && /at-cx-proj-dot/.test(String(n.props.className || ''))),
    'each project row must show its 16px colour dot')
  assert.ok(todoText.includes('选择其他项目'), 'plain (untinted) projects need the other-project row')
  const foot = todoNodes.find(n => n.props && /at-cx-sub-foot/.test(String(n.props.className || '')))
  const footBtns = collectNodes(foot).filter(n => n.type === 'button')
  assert.equal(footBtns.length, 1, 'PC .sd-foot has exactly one primary submit button')
  assert.ok(collectStrings(foot).join(' ').includes('保存待办'), 'submit label must match forms.js')
  assert.ok(todoText.includes('必填'), 'PC .sd-label must mark the required fields')
  passed.push('capsule render: to-do form uses one-row-per-project list + single submit (PC .sd.o1)')

  /* ★★ v1.5 · 转脑图 = PC「选择脑图」：lead 卡 + 先选后确定 */
  B.ui({ capsule: Object.assign({}, baseCap, { mapPick: true, mapPickedId: '' }) })
  const mapNodes = collectNodes(AT.capsule.FloatingCapsule())
  const mapText = collectStrings(mapNodes).join(' ')
  assert.ok(mapText.includes('语义转脑图'), 'lead card for semantic conversion must be first')
  assert.ok(mapNodes.filter(n => n.props &&
    /at-cx-map-card/.test(String(n.props.className || ''))).length >= 2,
  'mindmap picker must list the existing maps as cards')
  const mapConfirm = mapNodes.find(n => n.props && n.type === 'button' &&
    collectStrings(n.children).join('') === '确定')
  assert.ok(mapConfirm && mapConfirm.props.disabled === true,
    'PC picker is select-then-confirm: 确定 must be disabled until a card is picked')
  assert.ok(mapText.includes('确定'), 'picker footer must offer 确定, not 取消')
  passed.push('capsule render: mindmap picker uses lead card + select-then-confirm (PC dw.o1)')

  /* ★★ v1.4 起沿用 · 副抽屉打开时停靠带整组收起 ——
   * v1.5 的两颗 40 方键 z 149/150 高于副抽屉 141，留着正好盖住面板底部的
   * 「保存待办 / 确定」。收起只在副抽屉期间生效：一关掉，写 / 说两颗键必须回来。 */
  ;[{ pick: 'todoPick', cls: 'is-todo' }, { pick: 'mapPick', cls: 'is-map' },
    { pick: 'composeOpen', cls: 'is-compose' }, { pick: 'editId', cls: 'is-edit' }]
    .forEach(function (spec) {
      const st = Object.assign({}, baseCap, { todoProjectId: 'p-demo-1' })
      st[spec.pick] = spec.pick === 'editId' ? 'c-demo-2' : true
      B.ui({ capsule: st })
      const cls = collectNodes(AT.capsule.FloatingCapsule())
        .map(function (n) { return String((n.props && n.props.className) || '') })
      assert.ok(!cls.some(function (x) { return /\bat-cx-fab\b/.test(x) }),
        'sub-drawer ' + spec.cls + ' must hide the docked mic key (it would cover the footer)')
      assert.ok(!cls.some(function (x) { return /\bat-cx-write\b/.test(x) }),
        'sub-drawer ' + spec.cls + ' must hide the write key as well')
    })
  B.ui({ capsule: Object.assign({}, baseCap, {}) })
  const railBack = collectNodes(AT.capsule.FloatingCapsule())
    .map(function (n) { return String((n.props && n.props.className) || '') })
  assert.ok(railBack.some(function (x) { return /\bat-cx-fab\b/.test(x) }) &&
    railBack.some(function (x) { return /\bat-cx-write\b/.test(x) }),
  'closing every sub-drawer must bring the docked write / mic pair back')
  passed.push('capsule render: right sub-drawers collapse the docked key pair, closing restores it')
  B.ui({ capsule: null })

  /* ---- current workspace lookup --------------------------------------- */
  const wsH = harness(source)
  const leaf = { childElementCount: 0, textContent: '客户交付' }
  const wsRow = { getAttribute: (k) => k === 'data-row-key' ? 'workspace:w1' : null,
    querySelectorAll: () => [leaf] }
  const sessionRow = { getAttribute: (k) => k === 'data-row-key' ? 'session:s1'
    : k === 'aria-selected' ? 'true' : null }
  wsH.sandbox.document.querySelectorAll = (selector) =>
    String(selector).includes('workspace:') ? [wsRow, sessionRow] : []
  assert.equal(wsH.AT.overlays.currentWorkspaceName(), '客户交付',
    'the active session workspace name must be read from the sidebar tree')
  assert.equal(wsH.AT.overlays.projectMatchesWorkspace('客户交付', '客户交付'), true)
  assert.equal(wsH.AT.overlays.projectMatchesWorkspace('客户交付', '个人工位'), false)
  passed.push('composer picker: current workspace name is read from the active session row')

  /* ---- assistant action: deliverable seed formatting + capsule only ---- */
  const tailH = harness(source)
  const nameEl = { innerText: 'Agent-ToDo-DSH插件-环境-界面-接口交接.md',
    textContent: 'Agent-ToDo-DSH插件-环境-界面-接口交接.md' }
  const descEl = { innerText: 'Agent ToDo DSH 插件的环境、安装路径、界面尺寸、接口与后续优化交接文档',
    textContent: 'Agent ToDo DSH 插件的环境、安装路径、界面尺寸、接口与后续优化交接文档' }
  const fileCard = {
    querySelector: (selector) => String(selector).includes('fileName') ? nameEl
      : String(selector) === '[data-presented-description]' ? descEl : null,
    querySelectorAll: () => [], innerText: ''
  }
  const fileRow = {
    querySelectorAll: (selector) => String(selector) === '[data-presented-file]' ? [fileCard] : [],
    innerText: '', contains: () => false
  }
  const actionButton = {}
  const actionRow = { contains: (node) => node === actionButton }
  const tail = { children: [fileRow, actionRow], contains: (node) => node === actionRow }
  const seed = tailH.AT.overlays.assistantTextOf({ closest: () => tail })
  assert.ok(seed.includes('【交付物】'), 'assistant seed must label deliverable section')
  assert.ok(seed.includes('交付物文件（MD）：《Agent-ToDo-DSH插件-环境-界面-接口交接.md》'),
    'assistant seed must wrap file type + name with symbols')
  assert.ok(seed.includes('（Agent ToDo DSH 插件的环境、安装路径、界面尺寸、接口与后续优化交接文档）'),
    'assistant seed must wrap the deliverable description in parentheses')
  assert.equal(tailH.AT.overlays.formatDeliverable('a.md', '说明'),
    '交付物文件（MD）：《a.md》（说明）')
  assert.equal(tailH.AT.overlays.formatDeliverable('b.pdf', ''),
    '交付物文件（PDF）：《b.pdf》')
  const actionText = collectStrings(tailH.AT.overlays.AssistantSaveAction({})).join(' ')
  assert.ok(actionText.includes('闪念') && !actionText.includes('待办'),
    'assistant action must be a capsule-only 闪念 entry')
  tailH.B.ui({ captureOpen: true, captureSeed: '测试闪念', captureCapsuleOnly: true })
  const capsuleTree = tailH.AT.overlays.QuickCapture()
  const capsuleText = collectStrings(capsuleTree).join(' ')
  assert.ok(capsuleText.includes('存为闪念'), 'capsule-only capture must offer 存为闪念')
  assert.ok(!capsuleText.includes('存为待办'), 'capsule-only capture must not offer 存为待办')
  assert.ok(!capsuleText.includes('目标项目'), 'capsule-only capture must not ask for a project')
  const clearButton = collectNodes(capsuleTree).find((n) =>
    String(n.props && n.props.className || '').includes('at-gl-clear'))
  assert.ok(clearButton, 'quick capture must offer a 清除 key inside the input surface')
  const closeIcon = collectNodes(capsuleTree).find((n) => n.props && n.props['aria-label'] === '关闭')
  assert.ok(closeIcon, 'quick capture close icon must keep an accessible label')
  assert.ok(collectNodes(closeIcon).some((n) => n.props && n.props.name === 'close'),
    'quick capture close control must render the close icon, not a text button')
  const fullCaptureH = harness(source)
  fullCaptureH.B.ui({ captureOpen: true, captureSeed: '测试' })
  const fullCaptureText = collectStrings(fullCaptureH.AT.overlays.QuickCapture()).join(' ')
  assert.ok(fullCaptureText.includes('存为待办') && fullCaptureText.includes('目标项目'),
    'the global quick capture must keep its full capsule / to-do mode')
  passed.push('assistant action: deliverable seed uses type + 《name》 + （description）, capsule only')

  /* ---- composer to-do picker: export → complete ------------------------ */
  const h5 = harness(source)
  let draft = ''
  const composerEntry = h5.AT.overlays.ComposerButton({ inputActions: { setDraft(text) { draft = text } } })
  assert.equal(composerEntry.children[1], 'Agent ToDo', 'composer entry must read Agent ToDo')
  const composerGlyph = collectNodes(composerEntry).find((n) => n.type === 'svg')
  assert.ok(composerGlyph && composerGlyph.props.viewBox === '0 0 16 16',
    'composer entry must use the inline brand check glyph')
  h5.B.ui({ composerOpen: true })
  const todoPicker = h5.AT.overlays.ComposerPicker()
  const rows = collectNodes(todoPicker).filter((n) =>
    String(n.props && n.props.className || '').includes('at-pick-row'))
  assert.ok(rows.length >= 3, 'picker must list the three open demo todos')
  assert.ok(!collectStrings(rows).join(' ').includes('确认项目八色'),
    'completed todo must not appear in the picker')
  const pickerText = collectStrings(todoPicker).join(' ')
  assert.ok(pickerText.includes('导出同时完成'), 'footer must offer 导出同时完成')
  assert.ok(pickerText.includes('增强导出'), 'each todo must offer 增强导出')
  assert.ok(pickerText.includes('全部项目'), 'project filter must be visible')
  const first = rows.find((n) => collectStrings(n.children).join(' ').includes('把 Agent-ToDo'))
  assert.ok(first, 'picker must offer the first open todo')
  const plain = collectNodes(first).find((n) => n.props && n.props.onClick &&
    String(n.props.className || '').includes('at-pick-act') &&
    !String(n.props.className || '').includes('is-enhance'))
  assert.ok(plain, 'plain export button missing')
  await plain.props.onClick()
  assert.ok(draft.includes('把 Agent-ToDo 的 Capture 做成全局快捷键'),
    'selected todo context must land in the DSH draft')
  assert.equal(h5.Core.byId(h5.B.get().todos, 'd-demo-1').done, true,
    'when 导出同时完成 is checked, export must complete the todo')
  assert.equal(h5.B.get().ui.composerOpen, false)
  passed.push('composer picker: plain export writes the todo and completes it')

  /* Clipboard fallback must NOT be treated as triggered → todo stays open. */
  const h6 = harness(source)
  h6.B.ui({ composerOpen: true })
  const fallbackPicker = h6.AT.overlays.ComposerPicker()
  const fallbackRows = collectNodes(fallbackPicker).filter((n) =>
    String(n.props && n.props.className || '').includes('at-pick-row'))
  const fallbackFirst = fallbackRows.find((n) => collectStrings(n.children).join(' ').includes('把 Agent-ToDo'))
  assert.ok(fallbackFirst)
  const fallbackPlain = collectNodes(fallbackFirst).find((n) => n.props && n.props.onClick &&
    String(n.props.className || '').includes('at-pick-act') &&
    !String(n.props.className || '').includes('is-enhance'))
  await fallbackPlain.props.onClick()
  assert.equal(h6.Core.byId(h6.B.get().todos, 'd-demo-1').done, false,
    'clipboard fallback is not a composer trigger; the todo must stay open')
  passed.push('composer picker: clipboard fallback does not silently complete the todo')

  const capture = AT.overlays.QuickCapture()
  // Capture state must be opened before exercising the real keyboard callback.
  B.ui({ captureOpen: true })
  const openCapture = AT.overlays.QuickCapture()
  const input = collectNodes(openCapture).find(n => n.type === 'textarea')
  let prevented = false
  input.props.onKeyDown({ key: 'Enter', nativeEvent: { isComposing: true },
    preventDefault() { prevented = true } })
  assert.equal(prevented, false)
  input.props.onKeyDown({ key: 'Enter', nativeEvent: {}, preventDefault() { prevented = true } })
  assert.equal(prevented, false)
  assert.ok(capture)
  passed.push('Chinese composition and plain Enter never submit quick capture')

  const h4 = harness(source)
  const selectedProject = h4.Core.byId(h4.B.get().todos, 'd-demo-1').projectId
  h4.B.ui({ mmPick: { todoId: 'd-demo-1' } })
  h4.B.store.set(s => Object.assign({}, s, { mindmaps: s.mindmaps.concat([{
    id: 'other-map', name: '不能跨项目关联', projectId: 'p-demo-2', nodes: 1, format: 'mindmap'
  }]) }))
  const picker = h4.AT.panes.MindmapPicker(h4.B.get())
  assert.ok(!collectStrings(picker).join(' ').includes('不能跨项目关联'))
  assert.equal(selectedProject, 'p-demo-1')
  passed.push('mindmap picker only offers maps in the todo project')

  /* ---- 样式标准 + 闪念胶囊 PC 对齐 ------------------------------------- */
  const St = AT.style
  assert.ok(St && St.S && St.geom && St.base, 'style standard must be published on AT.style')
  assert.equal(St.S.CAPSULE.drawerW, 320)
  assert.equal(St.S.CAPSULE.headH, 52)
  assert.equal(St.S.CAPSULE.opsW, 72)
  assert.equal(St.S.CAPSULE.opsKeyW, 64)
  assert.equal(St.S.CAPSULE.opsKeyH, 46)
  assert.equal(St.S.CAPSULE.subW, 260)
  /* ★★ v1.5：PC / 横屏走 `nav-rail.wxss` 的 `.rail-brand` —— 40 方 / 12 圆角 /
   * 品牌图满幅 40 / 麦克风 22 / 倒数 18 / 写键同尺寸图标 22。
   * `app.wxss` 的 `.fab`(56/18) 只在 `!phone && !landscape`（平板**竖屏**）渲染，
   * v1.4 抄错分支 ⇒ 用户实测「悬浮按键又有点过大」。 */
  assert.equal(St.S.CAPSULE.fab, 40)
  assert.equal(St.S.CAPSULE.fabRadius, 12)
  assert.equal(St.S.CAPSULE.fabIcon, 40)
  assert.equal(St.S.CAPSULE.fabMic, 22)
  assert.equal(St.S.CAPSULE.fabClock, 18)
  assert.equal(St.S.CAPSULE.write, 40)
  assert.equal(St.S.CAPSULE.writeIcon, 22)
  assert.equal(St.S.CAPSULE.fabMargin, 24)
  /* 第二档两张（转待办 `.sd.o1` / 转脑图 `.dw.o1`）共用 320 / +270 */
  assert.equal(St.S.CAPSULE.o1W, 320)
  assert.equal(St.S.CAPSULE.o1Shift, 270)
  /* `.cp.turned` 的三个量逐字照抄 capsule.wxss 275 行 */
  assert.equal(St.S.CAPSULE.turnDeg, 25)
  assert.equal(St.S.CAPSULE.turnPerspective, 1100)
  assert.ok(St.S.Z.drawerTurned < St.S.Z.sub, 'turned drawer must sit below the second drawer')
  assert.equal(St.S.TYPE.size.title, 16)
  assert.equal(St.S.TYPE.size.text, 14)
  passed.push('style standard: PC geometry and type scale are a single source')

  /* ★★★ v1.5 · 用户三条反馈的直接判据（CSS 真源 + 渲染 DOM 双查）————————————
   * ① 「悬浮按键又有点过大」：PC / 横屏真源是 nav-rail.wxss 的 `.rail-brand`
   *    40 方 / 12 圆角 / 品牌图满幅 40 / 麦克风 22 / 倒数 18；写键 `.rail-write`
   *    40 方、`--chip` 底、无描边、图标 22。56 只在平板**竖屏** `app.wxss .fab`。
   * ② 「转待办、转脑图时列表抽屉应该有一个旋转效果」：PC `capsule.wxss .cp.turned`
   *    perspective(1100px) rotateY(25deg) / origin left center / pointer-events:none。
   * ③ 「转待办抽屉中项目列表展示不对」：PC `form-drawer` 的 `.sd-row` 一行一个，
   *    16 色点 + 名称 + 选中黄底打勾，不是 `<select>`。 */
  const cxV15 = AT.capsule.STYLE
  assert.ok(/\.at-cx-fab\{[^}]*width:40px;height:40px/.test(cxV15),
    'PC .rail-brand is 40x40, not the tablet-portrait 56')
  assert.ok(/\.at-cx-fab\{[^}]*border-radius:12px/.test(cxV15),
    'PC .rail-brand corner radius is 12')
  assert.ok(!/\.at-cx-fab\{[^}]*width:56px/.test(cxV15),
    'the 56px tablet-portrait fab must not leak into the PC layer')
  assert.ok(/\.at-cx-fab-img\{[^}]*width:40px;height:40px/.test(cxV15),
    'brand image must fill the 40px key')
  assert.ok(/\.at-cx-fab-clock\{[^}]*font-size:18px/.test(cxV15),
    'countdown inside a 40px key must be 18/600')
  assert.ok(/\.at-cx-write\{[^}]*width:40px;height:40px/.test(cxV15) &&
    /\.at-cx-write\{[^}]*background:var\(--at-chip\)/.test(cxV15) &&
    /\.at-cx-write\{[^}]*border:0/.test(cxV15),
  '.rail-write is a 40px unbordered chip-coloured key')
  assert.ok(/\.at-cx-drawer\.is-turned\{[^}]*transform-origin:left center/.test(cxV15) &&
    /\.at-cx-drawer\.is-turned\{[^}]*perspective\(1100px\) rotateY\(25deg\)/.test(cxV15) &&
    /\.at-cx-drawer\.is-turned\{[^}]*pointer-events:none/.test(cxV15) &&
    /\.at-cx-drawer\.is-turned\{[^}]*z-index:129/.test(cxV15),
  'second-level drawers must turn the first one like PC .cp.turned')
  assert.ok(/\.at-cx-drawer\{[^}]*transition:transform 0?\.22s/.test(cxV15),
    'the turn must be animated, otherwise it reads as an instant jump')
  assert.ok(/\.at-cx-proj\{[^}]*height:40px/.test(cxV15) &&
    /\.at-cx-proj-dot\{[^}]*width:16px;height:16px/.test(cxV15),
  'PC .sd-row is 40 high with a 16px colour dot')
  assert.ok(/\.at-cx-map-card\.is-lock,[^{]*\{[^}]*opacity:\.45/.test(cxV15),
    'PC .dw-card.mm.lock must dim gated maps, not only disabled buttons')
  passed.push('capsule v1.5: 40px PC/landscape rail keys + .cp.turned + 40px project rows')

  /* DOM 级：尺寸不是「常量写对了」就算数，必须真的挂到浮键 / 图标 / 品牌图上。
   * ⚠️ 麦克风只在「打开且未录音」出现；一起录，键里换成 18px 的 tabular 倒数。 */
  B.ui({ capsule: Object.assign({}, baseCap, {}) })
  const openFabV15 = collectNodes(AT.capsule.FloatingCapsule())
    .find(n => n.props && /at-cx-fab(\s|$)/.test(String(n.props.className || '')))
  assert.ok(openFabV15, 'open state must still render the mic fab')
  const micV15 = collectNodes(openFabV15).find(n => n.props && n.props.name === 'voice')
  assert.ok(micV15 && micV15.props.size === 22, 'mic icon must be 22px inside the 40px key')
  B.ui({ capsule: Object.assign({}, baseCap, { phase: 'rec', clock: '42' }) })
  const recClockV15 = collectNodes(AT.capsule.FloatingCapsule())
    .find(n => n.props && /at-cx-fab-clock/.test(String(n.props.className || '')))
  assert.ok(recClockV15 && collectStrings(recClockV15).join('').includes('42'),
    'recording replaces the mic icon with the countdown inside the same 40px key')
  B.ui({ capsule: null })
  const logoV15 = collectNodes(AT.capsule.FloatingCapsule())
    .find(n => n.props && /at-cx-fab-img/.test(String(n.props.className || '')))
  assert.ok(logoV15 && logoV15.props.width === 40 && logoV15.props.height === 40,
    'closed-state brand image must fill the 40px key')

  /* ③ 项目列表：一行一个、色点各自取色板、选中行唯一、每行可点 */
  B.ui({ capsule: Object.assign({}, baseCap, { todoPick: true, todoProjectId: 'p-demo-1' }) })
  const formV15 = collectNodes(AT.capsule.FloatingCapsule())
  const rowsV15 = formV15.filter(n => n.props && /^at-cx-proj(\s|$)/.test(String(n.props.className || '')))
  assert.ok(rowsV15.length >= 3, 'PC .sd-list renders each tinted project plus the other-project row')
  assert.equal(rowsV15.filter(n => String(n.props.className).includes('is-on')).length, 1,
    'exactly one project row may be selected')
  assert.ok(rowsV15.every(n => typeof n.props.onClick === 'function'),
    'every project row must be clickable')
  const otherRowV15 = rowsV15.find(n => String(n.props.className).includes('is-pick'))
  assert.ok(otherRowV15 && typeof otherRowV15.props.onClick === 'function',
    'plain (untinted) projects need the 选择其他项目 entry')
  const dotsV15 = formV15.filter(n => n.props &&
    /at-cx-proj-dot/.test(String(n.props.className || '')))
  assert.ok(dotsV15.length >= 2 && dotsV15.every(n => n.props.style && n.props.style.background),
    'each project row must carry its own palette colour')
  /* 「等等」：紧急 chip 用 mock.js 的 soft/main/text 三支上色，选中态只此一颗 */
  const chipsV15 = formV15.filter(n => n.props && /^at-cx-chip(\s|$)/.test(String(n.props.className || '')))
  assert.equal(chipsV15.length, 4, 'PC .sd-chip offers exactly four urgency levels')
  const onChipV15 = chipsV15.find(n => String(n.props.className).includes('is-on'))
  assert.ok(onChipV15 && onChipV15.props.style && onChipV15.props.style.background &&
    onChipV15.props.style.borderColor && onChipV15.props.style.color,
  'selected chip must be tinted with soft/main/text, not a static class')
  /* 「等等」：第二档打开时动作列整列消失，别让它压在副抽屉上 */
  assert.ok(!formV15.some(n => n.props && /^at-cx-op(\s|$)/.test(String(n.props.className || ''))),
    'PC hides the action column while the second drawer is open')
  /* 插件 806 宽放不下三级 `.sd3` ⇒ 降级为同一面板内换一页（差异写进样式标准 §8） */
  otherRowV15.props.onClick()
  assert.ok(collectStrings(AT.capsule.FloatingCapsule()).join(' ').includes('返回项目列表'),
    'the other-project entry must switch to a sub page inside the same .o1 panel')
  B.ui({ capsule: Object.assign({}, baseCap, {}) })
  passed.push('capsule v1.5: project rows / urgency chips / action-column gate match PC .sd.o1')

  /* 「等等」：转脑图是「先选后确定」—— 点卡只改 pickedId，确定才真正转 */
  B.ui({ capsule: Object.assign({}, baseCap, { mapPick: true, mapPickedId: '' }) })
  const pickV15 = collectNodes(AT.capsule.FloatingCapsule())
  const leadV15 = pickV15.find(n => n.props &&
    /at-cx-map-card is-lead/.test(String(n.props.className || '')))
  assert.ok(leadV15 && typeof leadV15.props.onClick === 'function',
    'semantic-conversion lead card must be present and selectable')
  assert.ok(pickV15.some(n => n.props && /at-cx-map-tag/.test(String(n.props.className || ''))),
    'map cards must carry format / current / lock tags like PC .dw-card.mm')
  assert.ok(!pickV15.some(n => n.props && /^at-cx-op(\s|$)/.test(String(n.props.className || ''))),
    'mindmap second drawer must gate the action column too')
  leadV15.props.onClick()
  const afterPickV15 = collectNodes(AT.capsule.FloatingCapsule())
  const mapOkV15 = afterPickV15.find(n => n.props && n.type === 'button' &&
    collectStrings(n.children).join('') === '确定')
  assert.ok(mapOkV15 && mapOkV15.props.disabled === false,
    'picking a card must enable 确定 without converting immediately')
  B.ui({ capsule: Object.assign({}, baseCap, {}) })
  passed.push('capsule v1.5: mindmap picker is select-then-confirm and gates the action column')

  /* 交接文档 §3 的实测内容区 806×653 @(280,40)：所有浮层都不越界 */
  const wide = St.geom({ left: 280, top: 40, width: 806, height: 653 })
  assert.equal(wide.width, 320)
  assert.equal(wide.opsW, 72)
  assert.equal(wide.inside, false)
  /* 写 / 编辑仍是第一层往外展开的 260 副弹窗（+12），别和第二档 `.o1` 混为一谈 */
  assert.equal(wide.subWidth, 260)
  assert.equal(wide.subLeft, wide.left + wide.width + 12)
  assert.equal(wide.editLeft, wide.opsLeft)
  assert.equal(wide.editWidth, 260)
  assert.equal(wide.height, 653 - 16 * 2)
  assert.ok(wide.subLeft + wide.subWidth <= 280 + 806 - wide.pad)
  /* ★★ v1.5 · 转待办 / 转脑图是**同一副 `.o1` 几何**（`.sd.o1` / `.dw.o1`）：
   * 320 宽、左缘 = 主抽屉 left + 270（＝重叠 50）、与主抽屉同高。
   * v1.4 的「转脑图 260 / 主抽屉右缘 +12」是误认 `.sd3` —— 那其实是表单里
   * 「选择其他项目」的**三级**项目副弹窗，与转脑图无关。 */
  assert.equal(wide.todoWidth, 320)
  assert.equal(wide.todoLeft, wide.left + wide.width - 50)
  assert.equal(wide.mapWidth, wide.todoWidth)
  assert.equal(wide.mapLeft, wide.todoLeft)
  assert.ok(wide.todoLeft + wide.todoWidth <= 280 + 806 - wide.pad)
  assert.ok(wide.mapLeft + wide.mapWidth <= 280 + 806 - wide.pad)
  /* 窄内容区也要把两张 `.o1` 一起夹回边界内，且两者始终共线 */
  const tinyO1 = St.geom({ left: 0, top: 0, width: 380, height: 420 })
  assert.equal(tinyO1.todoWidth, tinyO1.mapWidth)
  assert.equal(tinyO1.todoLeft, tinyO1.mapLeft)
  assert.ok(tinyO1.todoLeft >= tinyO1.pad &&
    tinyO1.todoLeft + tinyO1.todoWidth <= 380 - tinyO1.pad,
  'a narrow content area must clamp both .o1 panels inside its bounds')
  /* 录音降落区 ≈ 抽屉 42%（PC `--cp-drop` 的同一档） */
  assert.equal(wide.tailH, Math.round(wide.height * 0.42))
  passed.push('style standard: 806x653 content area keeps drawer / ops / sub-drawer inside bounds')
  passed.push('style standard: to-do / mindmap share one full-height .o1 geometry (320 / +270)')

  /* 窄内容区两档降级：边距收紧 → 44 图标列，副抽屉始终夹回内容区 */
  const narrow = St.geom({ left: 0, top: 0, width: 380, height: 420 })
  assert.equal(narrow.pad, 8)
  assert.equal(narrow.topPad, 8)
  assert.ok(narrow.width <= 380 - 16)
  const tiny = St.geom({ left: 0, top: 0, width: 300, height: 320 })
  assert.equal(tiny.opsW, 44)
  assert.ok(tiny.left >= 0 && tiny.left + tiny.width <= 300)
  assert.ok(tiny.subLeft >= tiny.pad && tiny.subLeft + tiny.subWidth <= 300 - tiny.pad)
  passed.push('style standard: narrow content degrades padding and action column without overflow')

  /* 统一基线：DSH 宿主字体 / 补充令牌 / 统一动效 / reduced-motion */
  const baseLight = St.base(false)
  assert.ok(baseLight.includes('--dsw-alias-font-body'), 'host font token must reach the capsule layer')
  assert.ok(baseLight.includes('--atx-fill-danger'), 'derived danger tokens must be injected')
  assert.ok(baseLight.includes('@keyframes atxBreath'))
  assert.ok(baseLight.includes('prefers-reduced-motion:reduce'))
  assert.ok(St.base(true).includes('#4A2A2C'), 'dark solid-danger token must be present')
  passed.push('style standard: base(dark) carries host tokens, extra tokens and reduced-motion')

  /* ★ 控件着色不能被复位规则压过：.at-cx-root button{color:inherit} 是 0,1,1，
   * 会盖掉所有单类控件的 color:var(--at-on-solid) —— 浅色深底深字、深色恒亮面反白。
   * 判据查「所有 color:inherit 规则都必须走 :where()」，而不是只查某一句在不在。 */
  const layerCss = St.base(false) + AT.capsule.STYLE
  const inheritRules = layerCss.split('}')
    .map(function (r) { return r.trim() })
    .filter(function (r) { return /color:inherit/.test(r) })
  assert.ok(inheritRules.length > 0, 'native-control reset must exist')
  inheritRules.forEach(function (r) {
    const sel = r.split('{')[0]
    assert.ok(sel.indexOf(':where(') >= 0,
      'control reset must be zero-specificity, got: ' + sel)
  })
  assert.ok(!AT.capsule.STYLE.includes('.at-cx-root button'),
    'capsule layer must not re-declare the high-specificity button reset')
  passed.push('style standard: native-control reset is zero-specificity and keeps single-class colors')

  /* 胶囊皮肤逐项对齐 PC：标题 16/500、动作键 64×46、副抽屉只淡入、倒数等宽 */
  const cx = AT.capsule.STYLE
  assert.ok(cx.includes('width:64px;height:46px'), 'action keys must be 64x46 like PC')
  assert.ok(cx.includes('font-size:16px;font-weight:500'), 'drawer title must be 16/500')
  assert.ok(cx.includes('animation:atxFade'), 'sub-drawer must fade in without slide')
  assert.ok(cx.includes('font-variant-numeric:tabular-nums'), 'countdown must use tabular numerals')
  assert.ok(cx.includes('var(--atx-sh-sub)'), 'sub-drawer shadow must point right')
  assert.ok(!cx.includes('atCxIn'), 'legacy capsule keyframes must be gone')
  /* PC 274 轮：右侧副面板的挡板透明，主抽屉（含恒黄标题带）必须一直可读；
   * 挡板仍要在，只负责「点外面关面板」。 */
  assert.ok(/\.at-cx-submask\{[^}]*background:transparent/.test(cx),
    'PC sub-panel scrim must be transparent; the main drawer must stay readable')
  assert.ok(/\.at-cx-submask\{[^}]*pointer-events:auto/.test(cx),
    'transparent scrim must still catch outside clicks')
  passed.push('capsule skin: PC sizes, type, motion and transparent sub-panel scrim')

  /* 胶囊层必须真的用上统一基线（以前只注入 U.themeCss，字体与工作台两套皮） */
  B.ui({ capsule: Object.assign({}, baseCap, { selected: [], phase: '', clock: '' }) })
  const styleText = collectNodes(AT.capsule.FloatingCapsule())
    .filter(n => n.type === 'style')
    .map(n => collectStrings(n.children).join('')).join('')
  assert.ok(styleText.includes('--dsw-alias-font-body'),
    'capsule layer must inject the shared DSH token baseline')
  /* ⚠️ 必须查「令牌的定义值」：U.themeCss() 本身已经写着 --dsw-alias-font-body，
   * 胶囊 STYLE 里也会出现 var(--atx-fill-danger) 这种调用名 —— 只查名字会恒绿，
   * 测不出「有没有真的从 themeCss() 换成 base()」。 */
  assert.ok(styleText.includes('--atx-fill-danger:#C63B2E'),
    'capsule layer must inject token definitions, not just themeCss()')
  assert.ok(styleText.includes('@keyframes atxBreath'),
    'capsule layer must carry the shared motion baseline')
  B.ui({ capsule: Object.assign({}, baseCap, { selected: [], phase: 'rec', clock: '42' }) })
  const recText = collectStrings(AT.capsule.FloatingCapsule()).join(' ')
  assert.ok(recText.includes('轻点任意处停止'), 'PC recording copy missing')
  assert.ok(recText.includes('42s'), 'countdown must be visible in the recording strip')
  B.ui({ capsule: null })
  passed.push('capsule: shared token baseline + recording wave / countdown feedback')

  /* ★★ 形态对齐（PC capsule.wxml / capsule.wxss 逐项）：
   * 上一轮只对齐了尺寸数值，卡片状态、配图角标、空态、分页、录音挡板全缺。
   * 这里既查 CSS 真源，也查组件渲染出来的 DOM，避免「规则写了但没接上」。 */
  const K2 = AT.style.S.CAPSULE
  assert.equal(K2.picH, 148); assert.equal(K2.zoomH, 19); assert.equal(K2.moreH, 34)
  assert.equal(K2.endGap, 98); assert.equal(K2.delPage, 10); assert.equal(K2.longPressMs, 550)
  assert.ok(AT.style.LIGHT_TOKENS.includes('--atx-frost:'), 'frost token missing')
  assert.ok(AT.style.LIGHT_TOKENS.includes('--atx-zoom-bg:rgba(28,28,30,.55)'), 'zoom badge token missing')
  assert.ok(AT.style.DARK_TOKENS.includes('--atx-frost:rgba(38,39,42,.76)'), 'dark frost token missing')
  assert.ok(AT.style.BASE_CSS.includes('@keyframes atxCardBreath'), 'card breath keyframes missing')
  passed.push('style standard: PC card-state / picture / pagination constants and tokens')

  const skin = AT.capsule.STYLE
  ;['is-sel', 'is-editing', 'is-del', 'is-wait', 'is-fail'].forEach(function (k) {
    assert.ok(skin.includes('.at-cx-card.' + k), 'PC card state missing: ' + k)
  })
  assert.ok(/\.at-cx-card\.is-wait\{[^}]*atxCardBreath/.test(skin), 'recognizing card must breathe')
  assert.ok(/\.at-cx-vmask\{[^}]*var\(--atx-frost\)/.test(skin), 'PC recognition overlay missing')
  assert.ok(/\.at-cx-card-pic img\{[^}]*height:148px/.test(skin), 'PC picture must be 148 high')
  assert.ok(/\.at-cx-card-zoom\{[^}]*var\(--atx-zoom-bg\)/.test(skin), 'PC zoom badge missing')
  assert.ok(/\.at-cx-empty\{margin:6px 2px;font-size:13px/.test(skin), 'PC empty state must be plain text')
  assert.ok(!skin.includes('.at-cx-empty-ico'), 'phone-style empty icon must not leak into PC layer')
  assert.ok(/\.at-cx-more\{height:34px/.test(skin), 'PC load-more row missing')
  assert.ok(/\.at-cx-endgap\{height:98px/.test(skin), 'bottom scroll headroom must be a spacer block')
  assert.ok(/\.at-cx-stop-scrim\{[^}]*background:transparent/.test(skin), 'PC tap-anywhere-to-stop scrim missing')
  passed.push('capsule skin: five card states, picture badge, PC empty, pagination, stop scrim')

  /* ★★ v1.4 · 录音 / 落位动效（PC `.cp-tail` + `.cp-sw.pop`）——————————————
   * 用户第 3 条：录音时与录音结束、胶囊飞入时，列表抽屉要有动效，和小程序一致。
   * PC 那边四件事同时发生：降落区展开 → 列表整体上滑 → 新卡片从下方 60 升起 →
   * 降落区点亮一下。插件这里一条都不能省，否则就是"卡片凭空出现"的观感。 */
  const tailCss = AT.capsule.STYLE
  assert.ok(/\.at-cx-tail\{[^}]*flex:0 0 auto/.test(tailCss),
    'landing zone must be an in-flow flex item, so the list really gets shorter')
  assert.ok(/\.at-cx-tail\{[^}]*linear-gradient/.test(tailCss),
    'landing zone needs the yellow gradient (PC .cp-tail)')
  assert.ok(/\.at-cx-tail\.is-lit::after\{animation:atxTailGlow/.test(tailCss),
    'landing zone must flash when a capsule lands')
  assert.ok(/@keyframes atxLand\{from\{opacity:0;transform:translateY\(60px\) scale\(\.96\)\}/.test(tailCss),
    'new capsule must rise 60px, like PC cpPop')
  assert.ok(/\.at-cx-card\.is-pop\{animation:atxLand \.52s/.test(tailCss),
    'the rise animation must be 520ms (PC cpPop)')
  const capSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', '80-capsule.js'), 'utf8')
  /* ★ v1.7 订正：v1.4 曾断言落位要有 smooth 滚动，那是把「列表滑动」误当成
   * 「降落区动效」。PC `_landCapsule` 明确 `_scrollBottomTo(false)` 且写明
   * 「别改回带动画 …… 会把列表上移与卡片升起叠成两个运动」。 */
  assert.ok(!capSrc.includes('scrollListBottom(true)'),
    'PC 268: a smooth landing scroll fights the card rise animation')
  assert.ok((capSrc.match(/scrollListBottom\(false\)/g) || []).length >= 3,
    'recording + landing + post-hold scroll must all be instant jumps')

  /* 录音态：降落区真的长出来了，倒数行住在降落区底部（不是标题带下面那一条） */
  B.ui({ capsule: Object.assign({}, baseCap, { phase: 'rec', clock: '42' }) })
  const recNodes = collectNodes(AT.capsule.FloatingCapsule())
  const tailNode = recNodes.find(n => n.props && /at-cx-tail/.test(String(n.props.className || '')))
  assert.ok(tailNode, 'recording must expand the landing zone')
  assert.ok(parseFloat(tailNode.props.style.height) > 0,
    'landing zone must take real height while recording')
  const recRow = collectNodes(tailNode.children)
    .find(n => n.props && /at-cx-rec(\s|$)/.test(String(n.props.className || '')))
  assert.ok(recRow, 'the countdown row must live inside the landing zone')

  /* 落位：只有刚落位那条挂 .is-pop，语音路径的降落区同时点亮 */
  const hl = harness(source)
  hl.B.ui({ capsule: Object.assign({}, baseCap, { selected: [], landFrom: 'voice',
    landAt: Date.now() }) })
  const landNodes = collectNodes(hl.AT.capsule.FloatingCapsule())
  const landCards = landNodes.filter(n => n.props && /^at-cx-card(\s|$)/.test(String(n.props.className || '')))
  assert.ok(landCards.length > 1, 'landing check needs more than one card')
  assert.ok(String(landCards.at(-1).props.className).includes('is-pop'),
    'the newest capsule must play the rise animation')
  assert.ok(!String(landCards[0].props.className).includes('is-pop'),
    'older capsules must not re-play the rise animation')
  const litTail = landNodes.find(n => n.props && /at-cx-tail/.test(String(n.props.className || '')))
  assert.ok(litTail && String(litTail.props.className).includes('is-lit'),
    'voice landing must light up the tail (PC cpTailGlow)')
  /* ★ v1.7 · 文字创建（PC onComposeSave → _landCapsule(id,false)）：只升卡片，
   * `tailOn` 恒 false ⇒ 列表不被顶起；`.is-pop` 精确到 `_popId`，不靠「末尾」猜。 */
  const ht = harness(source)
  const textIds = Core.capsules(ht.B.get()).map(c => c.id)
  ht.B.ui({ capsule: Object.assign({}, baseCap, { selected: [], landFrom: 'text',
    landAt: Date.now(), landId: textIds[0] }) })
  const textNodes = collectNodes(ht.AT.capsule.FloatingCapsule())
  const textCards = textNodes.filter(n => n.props && /^at-cx-card(\s|$)/.test(String(n.props.className || '')))
  assert.ok(textCards.length > 1, 'text-landing check needs more than one card')
  assert.ok(String(textCards[0].props.className).includes('is-pop') &&
    !String(textCards.at(-1).props.className).includes('is-pop'),
    'is-pop must follow the explicit landId, not the last row')
  const textTail = textNodes.find(n => n.props && /at-cx-tail/.test(String(n.props.className || '')))
  assert.ok(textTail && parseFloat(textTail.props.style.height) === 0,
    'PC onComposeSave keeps tailOn=false: text creation must not lift the list')
  assert.ok(!String(textTail.props.className).includes('is-lit'),
    'text creation must not flash the landing zone')
  /* 落位窗口过后不再挂动画类 —— 否则下一次新增不会重播 */
  hl.B.ui({ capsule: Object.assign({}, baseCap, { selected: [], landAt: Date.now() - 5000 }) })
  const stale = collectNodes(hl.AT.capsule.FloatingCapsule())
    .filter(n => n.props && /^at-cx-card(\s|$)/.test(String(n.props.className || '')))
  assert.ok(stale.every(n => !String(n.props.className).includes('is-pop')),
    'the rise class must be dropped once the landing window closes')
  B.ui({ capsule: null })
  passed.push('capsule render: recording tail + capsule rise-in animation match PC')

  const cxSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', '80-capsule.js'), 'utf8')
  assert.ok(cxSrc.includes('var ops = opsHidden ? 0 : opsCount(c, selected)') &&
    /c\.phase === 'rec' \|\| c\.phase === 'asr' \|\| c\.editId \|\| c\.composeOpen/.test(cxSrc),
    'recording / transcribing / editing / composing must hide the side action column like PC !recPhase')
  assert.ok(cxSrc.includes('var paged = open && !!c.delMode'), 'pagination must be deleted-list only')
  assert.ok(cxSrc.includes('list.slice(0, K.delPage * page)'), 'deleted list must be paged')
  assert.ok(cxSrc.includes("className: 'at-cx-endgap'"), 'scroll headroom spacer must be rendered')
  assert.ok(cxSrc.includes('onCardDown(x.id, e)'), 'PC long-press-to-edit must be wired')
  assert.ok(cxSrc.includes("'at-cx-card-zoom'"), 'zoom badge must be rendered in the card')
  assert.ok(cxSrc.includes('stopScrim'), 'stop scrim must be in the render tree')
  assert.ok(/b\.width < K\.wideBound \? 0 : 1/.test(cxSrc),
    'narrow content must anchor the fab group left, away from the action column')
  passed.push('capsule render: PC states wired to real handlers, not just CSS')

  /* ★★ v1.5 · 打开态**右侧竖排停靠带**（对齐 **PC / 横屏** `.rail-brand` + `.rail-write`）
   * v1.4 误抄了平板**竖屏** `app.wxss` 的 `.fab`(56/18)：那颗只在
   * `!phone && !landscape` 渲染，PC / 横屏其实是 nav-rail 的 40 方 / 12 圆角。
   * 用户实测「悬浮按键又有点过大」⇒ 回到 40。竖排关系不变：写在上、说在下，
   * 竖线取动作列那 64 宽键的中线，底边贴抽屉内沿；内容区窄到放不下 **40** 方键时
   * 整条退进抽屉左下角横排（此时动作列也降到内侧右缘，一左一右不会连成一列）。
   * ⚠️ 降级阈值跟着 K.fab 走：56→40 后 300 宽已经能站外面，判据改用 260 宽验证回退。 */
  ;[{ w: 806, h: 653 }, { w: 500, h: 653 }, { w: 380, h: 420 }].forEach(function (bx) {
    const gg = AT.style.geom({ left: 0, top: 0, width: bx.w, height: bx.h })
    assert.ok(gg.railOutside, 'rail must sit right of the drawer at w=' + bx.w)
    assert.ok(gg.railLeft >= gg.left + gg.width,
      'rail must not sit on top of the drawer (w=' + bx.w + ')')
    assert.ok(gg.railLeft + K2.fab <= gg.pad + bx.w - gg.pad,
      'rail must not poke out of the content area (w=' + bx.w + ')')
    assert.ok(gg.railSayTop + K2.fab <= gg.top + gg.height,
      'say key must not fall below the drawer (w=' + bx.w + ')')
    assert.ok(gg.railWriteTop + K2.write <= gg.railSayTop,
      'write key must sit above the say key in one column (w=' + bx.w + ')')
    assert.ok(gg.railWriteTop >= gg.top + K2.headH,
      'rail must stay below the yellow title band (w=' + bx.w + ')')
    /* 动作组与停靠带在右侧**同一条竖线**上 ⇒ 组底必须让开，否则五颗键会压住两颗键 */
    assert.ok(gg.opsLimitBottom <= gg.railWriteTop,
      'action column must stop above the rail (w=' + bx.w + ')')
  })
  /* 56→40 之后阈值会右移：300 宽还剩 44px 余量，是**合法的外侧停靠**；
   * 要验证「退回抽屉内」必须再收窄到 260。两条一起断言，防止有人把阈值写死。 */
  const edgeRail = AT.style.geom({ left: 0, top: 0, width: 300, height: 320 })
  assert.equal(edgeRail.railOutside, true,
    'a 300px content area has 44px spare: the 40px rail must stay outside')
  const tinyRail = AT.style.geom({ left: 0, top: 0, width: 260, height: 320 })
  assert.equal(tinyRail.railOutside, false,
    '40px rail must fall back inside a 260px content area')
  assert.ok(tinyRail.railLeft >= tinyRail.left + tinyRail.pad &&
    tinyRail.railWriteLeft + K2.write <= tinyRail.left + tinyRail.width,
    'the inside fallback must stay within the drawer')
  /* 停靠带退进抽屉时靠末尾占位块给列表让位（PC PHONE_RESERVE_B 的读法） */
  assert.ok(K2.endGap >= K2.dockPad + K2.fab,
    'bottom scroll headroom must clear the docked fab group')

  B.ui({ capsule: Object.assign({}, baseCap, { selected: [], phase: '', clock: '' }) })
  const openTree = collectNodes(AT.capsule.FloatingCapsule())
  const byCls = re => openTree.find(n => n.props && re.test(String(n.props.className || '')))
  const fabNode = byCls(/at-cx-fab(\s|$)/)
  const drawerNode = byCls(/at-cx-drawer(\s|$)/)
  const writeNode = byCls(/at-cx-write(\s|$)/)
  assert.ok(fabNode && drawerNode && writeNode, 'open capsule must render fab + write + drawer')
  const dLeft = parseFloat(drawerNode.props.style.left)
  const dRight = dLeft + parseFloat(drawerNode.props.style.width)
  assert.ok(parseFloat(fabNode.props.style.left) >= dRight,
    'open fab must dock to the right of the drawer, not inside it')
  assert.ok(String(fabNode.props.className).includes('is-docked'),
    'docked fab must drop the drag cursor')
  assert.equal(Math.round(parseFloat(writeNode.props.style.left)),
    Math.round(parseFloat(fabNode.props.style.left)),
    'write and say keys must share one column')
  assert.equal(Math.round(parseFloat(writeNode.props.style.top) + K2.write + K2.dockGap),
    Math.round(parseFloat(fabNode.props.style.top)),
    'write key must sit directly above the say key (tablet .fab-write)')
  /* 停在抽屉外侧（不压在卡片正文上）⇒ 不需要垫底白卡 */
  assert.ok(!byCls(/at-cx-dockplate/),
    'no backing plate is needed while the rail sits outside the drawer')
  /* 关闭态：浮键回到「可拖动 + 位置持久化」那一档，不再挂停靠类 */
  B.ui({ capsule: null })
  const closedFab = collectNodes(AT.capsule.FloatingCapsule())
    .find(n => n.props && /at-cx-fab(\s|$)/.test(String(n.props.className || '')))
  assert.ok(closedFab, 'closed capsule must still render the standalone fab')
  assert.ok(!String(closedFab.props.className).includes('is-docked'),
    'closed fab must stay draggable (no dock class)')
  passed.push('capsule render: open fab group moves to the right rail of the drawer (40px PC/landscape, stacked)')

  /* DOM 级：往已删除名单塞 12 条，首屏只能出 10 条 + 「点击加载更多」。 */
  const hp = harness(source)
  for (let i = 0; i < 12; i++) {
    hp.B.get().capsules.push({
      id: 'c-del-' + i, text: '已删除 ' + i, createdAt: Date.now(), source: 'text',
      imageUri: null, todoId: null, deletedAt: Date.now(), consumedAt: null,
      deleted: true, consumed: false
    })
  }
  hp.B.ui({ capsule: Object.assign({}, baseCap, {
    delMode: true, selected: [], phase: '', clock: '', editId: '', composeOpen: false
  }) })
  const delTree = hp.AT.capsule.FloatingCapsule()
  const delText = collectStrings(delTree).join(' ')
  const delCards = collectNodes(delTree).filter(function (n) {
    return n.props && /^at-cx-card(\s|$)/.test(String(n.props.className || ''))
  })
  assert.equal(delCards.length, 10, 'deleted list must show exactly one page (DEL_PAGE=10)')
  assert.ok(delText.includes('点击加载更多'), 'load-more row must be rendered')
  assert.ok(delText.includes('已删除胶囊-'), 'title must follow the current list')
  assert.ok(delText.includes('返回正常列表'), 'deleted list needs its back entry')
  /* 录音时即便有选中项，右侧动作组也不该出现（PC !recPhase）。 */
  hp.B.ui({ capsule: Object.assign({}, baseCap, { delMode: false, phase: 'rec', clock: '42' }) })
  const recTree = collectStrings(hp.AT.capsule.FloatingCapsule()).join(' ')
  assert.ok(!recTree.includes('转待办'), 'action column must be hidden while recording')
  assert.ok(recTree.includes('轻点任意处停止'), 'tap-anywhere copy must be visible')
  passed.push('capsule render: deleted-list pagination and recording action-column gate')

  /* ---- v1.6 · 白底令牌 / 取消按钮 / 停录闪退 ----------------------------- */
  const cxV16 = AT.capsule.STYLE
  const lightCard = (/(?:^|;)--at-card:([^;]+);/.exec(AT.ui.LIGHT) || [])[1]
  const darkCard = (/(?:^|;)--at-card:([^;]+);/.exec(AT.ui.DARK) || [])[1]
  assert.equal(lightCard, '#FFFFFF', 'design-doc white card token must be the registered literal')
  assert.equal(darkCard, '#202123', 'dark card token must be the registered literal')
  const whiteRule = '.at-gl.at-cx-root{--at-card:' + lightCard + ';--at-elevated:' + lightCard +
    ';--at-head-bg:' + lightCard + '}'
  const darkRule = '.at-gl.at-cx-root[data-dark="true"]{--at-card:' + darkCard +
    ';--at-elevated:' + darkCard + ';--at-head-bg:' + darkCard + '}'
  assert.ok(cxV16.includes(whiteRule), 'capsule layer must unbind from DSH host bg-overlay')
  assert.ok(cxV16.includes(darkRule), 'dark capsule layer must unbind too')
  assert.ok(/St\.base\(dark\) \+ STYLE/.test(source), 'override must be appended after base(dark)')
  /* 三块副抽屉 + 列表卡片确实吃这三支令牌（覆写不是空转） */
  for (const rule of [
    /\.at-cx-card\{[^}]*background:var\(--at-elevated\)/,
    /\.at-cx-drawer\{[^}]*background:var\(--at-elevated\)/,
    /\.at-cx-sub\{[^}]*background:var\(--at-elevated\)/,
    /\.at-cx-sub-head\{[^}]*background:var\(--at-head-bg\)/,
    /\.at-cx-sub-foot\{[^}]*background:var\(--at-head-bg\)/,
    /\.at-cx-proj\{[^}]*background:var\(--at-card\)/,
    /\.at-cx-map-card\{[^}]*background:var\(--at-card\)/
  ]) assert.ok(rule.test(cxV16), 'card / sub-drawer must consume the overridden tokens: ' + rule)
  assert.ok(/\.at-cx-op\{[^}]*background:var\(--at-solid\)/.test(cxV16),
    'action-column keys stay on --at-solid (out of scope this round)')
  passed.push('capsule v1.6: design-doc white card token unbinds capsule + 3 sub-drawers from host grey')

  /* 取消按钮：主抽屉标题 × 与编辑面板 × / 底栏「取消」都移除；外部关闭仍可用 */
  const hb = harness(source)
  hb.B.ui({ capsule: Object.assign({}, baseCap, { phase: '', clock: '', editId: '' }) })
  const openV16 = collectNodes(hb.AT.capsule.FloatingCapsule())
  const drawerV16 = openV16.find(n => n.props && /^at-cx-drawer(\s|$)/.test(String(n.props.className || '')))
  assert.ok(drawerV16, 'capsule drawer must render')
  assert.equal(collectNodes(drawerV16).filter(n => n.props &&
    String(n.props.className || '').includes('at-cx-hclose')).length, 0,
    'drawer head close X is redundant once outside-click works')
  const maskV16 = openV16.find(n => n.props && String(n.props.className || '') === 'at-cx-mask')
  assert.ok(maskV16 && typeof maskV16.props.onPointerDown === 'function', 'outside-click mask must stay')
  hb.B.ui({ capsule: Object.assign({}, baseCap, { phase: '', clock: '', editId: 'c-demo-2', editText: '改一句' }) })
  const editAll = collectNodes(hb.AT.capsule.FloatingCapsule())
  const editPanelV16 = editAll.find(n => n.props && n.props['aria-label'] === '编辑闪念')
  assert.ok(editPanelV16, 'edit sub-drawer must render')
  const editSub = collectNodes(editPanelV16)
  assert.equal(editSub.filter(n => n.props &&
    String(n.props.className || '').includes('at-cx-hclose')).length, 0,
    'edit head cancel X removed by the same conclusion')
  const editLabels = editSub.filter(n => n.type === 'button').map(n => collectStrings(n.children).join(''))
  assert.ok(!editLabels.includes('取消'), 'edit footer cancel button removed by the same conclusion')
  assert.ok(editLabels.includes('保存'), 'edit footer keeps its single primary key')
  /* 行为级：点外部仍关列表（不依赖被移除的 ×） */
  hb.B.ui({ capsule: Object.assign({}, baseCap, { phase: '', clock: '', editId: '' }) })
  const extMask = collectNodes(hb.AT.capsule.FloatingCapsule()).find(n => n.props &&
    String(n.props.className || '') === 'at-cx-mask')
  extMask.props.onPointerDown({ target: extMask, currentTarget: extMask })
  assert.equal(hb.B.get().ui.capsule, null, 'clicking outside still closes the list after X removal')
  assert.ok(/addEventListener\('keydown', onKey, true\)/.test(source), 'Esc layering stays')
  passed.push('capsule v1.6: redundant cancel buttons removed; outside-click / Esc close still works')

  /* 停录闪退：挡板改 pointerup、外部监听捕获阶段 + 录音态守卫、生成后列表保持打开 */
  const hs = harness(source)
  hs.B.ui({ capsule: Object.assign({}, baseCap, { phase: 'rec', clock: '42', landAt: 0 }) })
  const scrimV16 = collectNodes(hs.AT.capsule.FloatingCapsule()).find(n => n.props &&
    String(n.props.className || '') === 'at-cx-stop-scrim')
  assert.ok(scrimV16, 'tap-anywhere stop scrim must render while recording')
  assert.equal(typeof scrimV16.props.onPointerUp, 'function', 'stop must be on pointerup')
  assert.equal(scrimV16.props.onPointerDown, undefined, 'pointerdown must not clear phase mid-bubble')
  assert.ok(/addEventListener\('pointerdown', onDown, true\)/.test(source),
    'outside listener must be capture-phase (target may be detached by sync flush)')
  assert.ok(/typeof event\.composedPath === 'function'/.test(source), 'use composedPath for containment')
  assert.ok(/if \(phase === 'rec'\) \{ finishRecord\(\); return \}/.test(source),
    'recording-state outside click must stop, not close')
  /* ★ v1.8 · 识别中（asr）点外面同样不许关：结果还没回来，关掉就等于把刚说的话丢了 */
  assert.ok(/if \(phase === 'asr'\) return/.test(source),
    'transcribing-state outside click must be ignored, not close the list')
  assert.ok(/patchCap\(\{ open: true, selected: \[\], landFrom: 'voice',[\s\S]{0,48}landAt: Date\.now\(\) \}\)/.test(source),
    'finishRecord must explicitly keep the list open and tag the landing as voice')
  /* ★ v1.8：v1.6 那条「先清 phase 再 rec.stop()」随 SpeechRecognition 一起退休 ——
   * 现在采集收尾是异步的，防重入靠 asrSeq；作废必须发生在释放采集之前。 */
  const disposeBody = /function disposeRecord\(\) \{[\s\S]*?\n  \}/.exec(source)
  const seqAt = disposeBody ? disposeBody[0].indexOf('asrSeq += 1') : -1
  const abortAt = disposeBody ? disposeBody[0].indexOf('AT.voice.abort()') : -1
  assert.ok(seqAt >= 0 && abortAt >= 0 && seqAt < abortAt,
    'disposeRecord must invalidate the in-flight transcript before releasing the capture')
  assert.ok(/function stopRecord\(\) \{ disposeRecord\(\) \}/.test(source),
    'stopRecord stays as the alias used by the unmount hook')
  /* 行为级：停录 → 生成胶囊 → 列表仍开 */
  const hr = harness(source)
  hr.B.ui({ capsule: Object.assign({}, baseCap, { phase: 'rec', clock: '42', landAt: 0 }) })
  await hr.AT.capsule.finishRecord('语音识别出来的一句话')
  const afterRec = hr.B.get().ui.capsule
  assert.ok(afterRec && afterRec.open === true, 'stopping record must keep the capsule list open')
  assert.equal(afterRec.phase, '', 'recording phase must be cleared')
  assert.ok(afterRec.landAt > 0, 'new capsule must get the rise-in signal')
  assert.ok(hr.B.get().capsules.some(c => c.text === '语音识别出来的一句话'),
    'stopping record must actually create the capsule')
  passed.push('capsule v1.6: stop-record creates a capsule without closing the list (no flash-close)')

  /* ---- v1.7 · 普通创建（文字）的卡片进入效果 ----------------------------- */
  /* PC 真源 onComposeSave → _closeCompose → store.addCapsule → _landCapsule(id,false)：
   * 面板先拆、新卡首次挂载就带 `.cp-sw.pop`、无动画滚到底、tailOn 恒 false、不呼吸。 */
  const vt = harness(source)
  vt.B.ui({ capsule: Object.assign({}, baseCap, { composeOpen: true,
    composeText: '普通创建的一句话', composeImage: null, selected: [], landAt: 0 }) })
  const vtBefore = vt.Core.capsules(vt.B.get()).map(c => c.id)
  await vt.AT.capsule.saveCompose()
  const vtCap = vt.B.get().ui.capsule
  assert.ok(vtCap && vtCap.open === true, 'saving a written capsule keeps the list open')
  assert.equal(vtCap.composeOpen, false, 'the compose panel is closed before the card rises')
  assert.equal(vtCap.landFrom, 'text', 'text creation tags its landing origin')
  assert.ok(vtCap.landAt > 0, 'the card gets a rise-in signal')
  assert.ok(vtCap.landId && vtBefore.indexOf(vtCap.landId) < 0,
    'the rise targets the exact new capsule id (PC _popId)')
  assert.ok(vt.B.get().capsules.some(c => c.text === '普通创建的一句话'),
    'the written capsule is really created')
  /* 渲染态：文字落位只升卡片、不扩降落区、不挂语音识别中呼吸 */
  const vtNodes = collectNodes(vt.AT.capsule.FloatingCapsule())
  const vtTail = vtNodes.find(n => n.props && /at-cx-tail/.test(String(n.props.className || '')))
  assert.ok(vtTail && parseFloat(vtTail.props.style.height) === 0,
    'after saving, the landing zone stays closed')
  const vtCards = vtNodes.filter(n => n.props && /^at-cx-card(\s|$)/.test(String(n.props.className || '')))
  assert.ok(vtCards.some(n => String(n.props.className).includes('is-pop')),
    'the new card plays cpPop on its first render')
  assert.ok(!vtCards.some(n => String(n.props.className).includes('is-wait')),
    'text creation never renders the voice recognizing breathing state')
  /* 源码级：landAt 必须写在 addCapsule 之前，否则新卡先出现再跳回 +60 重播 */
  const saveBody = /async function saveCompose\(\) \{[\s\S]*?\n  \}/.exec(capSrc)
  assert.ok(saveBody, 'saveCompose must exist')
  const landPatch = "patchCap({ landFrom: 'text', landAt: Date.now() })"
  assert.ok(saveBody[0].includes(landPatch),
    'landAt must be patched inside saveCompose (indexOf alone would pass on a missing string)')
  assert.ok(saveBody[0].indexOf(landPatch) < saveBody[0].indexOf('B.actions.addCapsule('),
    'landAt must precede the optimistic store update so the first render already has is-pop')
  assert.ok(/composeOpen: false/.test(saveBody[0]), 'panel must close before the card rises')
  passed.push('capsule v1.7: text creation rises once on first render, no tail lift, exact pop id, instant scroll')

  /* ---- v1.8 · 语音录入：真采集 → 16k PCM16 WAV → 本地 SenseVoice / 后端 ASR ---- */
  /* v1.7 之前只有 `window.SpeechRecognition`：Electron 宿主不带 Google 语音服务，
   * 取不到构造器就 toast 返回 —— 语音入口等于不存在。这一组把「声音怎么变成文字」
   * 整条链路钉住，而不是只钉一个入口按钮。 */
  const voiceSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'client', '76-voice.js'), 'utf8')
  assert.ok(!/SpeechRecognition/.test(stripComments(capSrc)) &&
    !/SpeechRecognition/.test(stripComments(voiceSrc)),
    'speech must not fall back to the browser SpeechRecognition path anymore')
  assert.ok(/navigator\.mediaDevices\.getUserMedia\(\{/.test(voiceSrc), 'capture must use getUserMedia')
  assert.ok(/new window\.MediaRecorder\(stream\)/.test(voiceSrc), 'capture must use native MediaRecorder')
  assert.ok(/audio: \{ channelCount: 1/.test(voiceSrc),
    'the request shape must stay audio-only (the host allows mediaTypes === ["audio"] only)')
  assert.ok(/SAMPLE_RATE = 16000/.test(voiceSrc), 'the host speech service only accepts 16 kHz')
  assert.ok(/new Offline\(1, frames, SAMPLE_RATE\)/.test(voiceSrc), 'resampling must render mono 16 kHz')
  assert.ok(/view\.setUint16\(22, 1, true\)/.test(voiceSrc) && /view\.setUint16\(34, 16, true\)/.test(voiceSrc),
    'the WAV header must be mono / 16-bit PCM')
  assert.ok(/function encodeWave\(samples\)[\s\S]{0,90}new Uint8Array\(44 \+ samples\.length \* 2\)/.test(voiceSrc),
    'PCM16 WAV must carry a 44-byte header')
  /* 分层顺序：本地（DSH speech Remote）优先，后端 /asr 兜底 */
  const localAt = voiceSrc.indexOf('remote.speech.transcribe(')
  const serverAt = voiceSrc.indexOf('B.asr(new Blob(')
  assert.ok(localAt >= 0 && serverAt >= 0 && localAt < serverAt,
    'transcribe must try the host speech Remote before the backend /asr proxy')
  assert.ok(/B\.asr\(new Blob\(\[bytes\], \{ type: 'audio\/wav' \}\), 'wav'\)/.test(voiceSrc),
    'the backend fallback must declare wav, not the old hard-coded mp3')
  passed.push('capsule v1.8: real mic capture → 16k PCM16 WAV → host SenseVoice, backend ASR as fallback')

  /* 行为级：WAV 头与样本饱和 —— 纯函数，不碰浏览器 */
  const wav = AT.voice.encodeWave(new Float32Array([0, 1, -1, 0.5]))
  assert.equal(wav.length, 44 + 4 * 2, 'WAV must be 44-byte header + 2 bytes per sample')
  assert.equal(String.fromCharCode.apply(null, wav.subarray(0, 4)), 'RIFF')
  assert.equal(String.fromCharCode.apply(null, wav.subarray(8, 12)), 'WAVE')
  assert.equal(String.fromCharCode.apply(null, wav.subarray(36, 40)), 'data')
  const wavView = new DataView(wav.buffer)
  assert.equal(wavView.getUint32(24, true), 16000, 'sample-rate field must be 16000')
  assert.equal(wavView.getUint16(22, true), 1, 'channel-count field must be 1')
  assert.equal(wavView.getUint32(40, true), 8, 'data-chunk size must match the sample count')
  assert.equal(wavView.getInt16(44, true), 0)
  assert.equal(wavView.getInt16(46, true), 32767, 'positive saturation must stop at 32767')
  assert.equal(wavView.getInt16(48, true), -32768, 'negative saturation must reach -32768')
  passed.push('capsule v1.8: encodeWave emits a canonical mono / 16-bit / 16 kHz WAV')

  /* 行为级：本地就绪就必须真的走本地 —— 源码里的先后顺序挡不住「静默跳过本地」。
   * 这里把宿主 remote 换成假的，直接看 transcribe() 调了谁。 */
  const hlv = harness(source)
  let localHits = 0
  hlv.AT.voice.attach({
    speech: {
      catalog: async () => ({ ok: true, value: {
        maxAudioBytes: 4194304, maxDurationSeconds: 120,
        selection: { providerId: 'sensevoice', language: 'zh' },
        providers: [{ id: 'sensevoice', name: 'SenseVoice', location: 'host-local',
          languages: ['zh'], preparation: { phase: 'ready' } }]
      } }),
      transcribe: async (request) => {
        localHits += 1
        assert.ok(request.audioBase64 && request.audioBase64.length > 0,
          'the host call must carry base64 audio')
        return { ok: true, value: { text: '本地识别的结果', audioSeconds: 1, inferenceSeconds: 0.2 } }
      }
    }
  })
  const localOut = await hlv.AT.voice.transcribe(new Uint8Array(46))
  assert.equal(localHits, 1, 'a ready local provider must be called exactly once')
  assert.equal(localOut.via, 'local', 'a ready host provider wins over the backend')
  assert.equal(localOut.text, '本地识别的结果')
  /* 本地未就绪 → 静默降级后端（via 变 server，绝不假装本地成功） */
  hlv.AT.voice.attach({
    speech: {
      catalog: async () => ({ ok: true, value: {
        selection: { providerId: 'sensevoice', language: 'zh' },
        providers: [{ id: 'sensevoice', name: 'SenseVoice', location: 'host-local',
          languages: ['zh'], preparation: { phase: 'unprepared' } }]
      } }),
      transcribe: async () => { localHits += 1; return { ok: true, value: { text: '不该被调用' } } }
    }
  })
  const serverOut = await hlv.AT.voice.transcribe(new Uint8Array(46))
  assert.equal(localHits, 1, 'an unprepared provider must not be called')
  assert.equal(serverOut.via, 'server', 'an unprepared local provider must degrade to the backend proxy')
  passed.push('capsule v1.8: a ready host provider wins; an unprepared one degrades to /asr')

  /* 行为级：采集被拒 → 不写库、不关列表、相位清干净 */
  const hv = harness(source)
  const voiceBackup = hv.AT.voice
  hv.B.ui({ capsule: Object.assign({}, baseCap, { open: true, selected: [], phase: 'rec', clock: '12', landAt: 0 }) })
  const beforeCount = hv.Core.capsules(hv.B.get()).length
  hv.AT.voice = {
    supported: function () { return true },
    recording: function () { return false },
    abort: function () {},
    stop: async function () { const e = new Error('麦克风权限被拒绝'); e.kind = 'permission'; throw e },
    transcribe: async function () { return { text: '不该走到这里', via: 'local' } }
  }
  await hv.AT.capsule.finishRecord()
  const failedCap = hv.B.get().ui.capsule
  assert.ok(failedCap && failedCap.open === true, 'a failed capture must not close the list')
  assert.equal(failedCap.phase, '', 'the phase must be cleared after a failed capture')
  assert.equal(hv.Core.capsules(hv.B.get()).length, beforeCount,
    'a failed capture must not create a capsule')
  assert.equal(hv.B.get().ui.toast.tone, 'danger', 'a failed capture must explain itself')
  hv.AT.voice = voiceBackup
  passed.push('capsule v1.8: a refused microphone writes nothing and keeps the list open')

  /* 行为级：识别成功 → 写库 + 语音落位；asr 态的界面不塌 */
  const hok = harness(source)
  const okBackup = hok.AT.voice
  hok.B.ui({ capsule: Object.assign({}, baseCap, { open: true, selected: [], phase: 'rec', clock: '3', landAt: 0 }) })
  hok.AT.voice = {
    supported: function () { return true },
    recording: function () { return false },
    abort: function () {},
    stop: async function () { return { bytes: new Uint8Array(44 + 3200), seconds: 0.1 } },
    transcribe: async function () { return { text: '说完这句就落位', via: 'local' } }
  }
  await hok.AT.capsule.finishRecord()
  const okCap = hok.B.get().ui.capsule
  assert.ok(okCap && okCap.open === true, 'a finished transcription keeps the list open')
  assert.equal(okCap.phase, '', 'the phase must be cleared once the capsule is written')
  assert.equal(okCap.landFrom, 'voice', 'voice landing stays the only path that opens the tail')
  assert.ok(okCap.landAt > 0, 'the new capsule must get the rise-in signal')
  assert.ok(hok.Core.capsules(hok.B.get()).some(c => c.text === '说完这句就落位'),
    'the transcript must be written as a capsule')
  hok.AT.voice = okBackup
  hok.B.ui({ capsule: Object.assign({}, baseCap, { open: true, selected: [], phase: 'asr' }) })
  const asrNodes = collectNodes(hok.AT.capsule.FloatingCapsule())
  assert.ok(!asrNodes.some(n => n.props && /at-cx-op(\s|$)/.test(String(n.props.className || ''))),
    'the action column must stay hidden while transcribing')
  assert.ok(!asrNodes.some(n => n.props && String(n.props.className || '') === 'at-cx-write'),
    'the write key must be hidden while transcribing')
  const asrTail = asrNodes.find(n => n.props && /at-cx-tail/.test(String(n.props.className || '')))
  assert.ok(asrTail && parseFloat(asrTail.props.style.height) > 0,
    'the landing zone must not collapse between recording and transcribing')
  passed.push('capsule v1.8: transcript lands as a voice capsule; transcribing keeps the drawer stable')

  console.log(JSON.stringify({ ok: true, checks: passed.length, passed }, null, 2))
}
main().catch(err => { console.error(err); process.exitCode = 1 })
