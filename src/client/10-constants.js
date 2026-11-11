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
