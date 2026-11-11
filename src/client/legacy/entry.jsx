/* eslint-disable react/prop-types */
/**
 * Agent ToDo · DSH client half (P0).
 *
 * The host supplies React. JSX is compiled to React.createElement, so the
 * bundle never asks for react/jsx-runtime. This file intentionally contains
 * the P0 workspace with mock data; the typed core/API layer arrives in P1.
 */

export let React

export function createClient(react) {
  React = react
  return {
    inject: ['slots'],
    apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style')
        style.setAttribute('data-agent-todo', '')
        style.textContent = STYLES
        document.head.appendChild(style)
        return () => style.remove()
      }, 'agent-todo: styles')

      ctx.effect(() => {
        const onKey = (event) => {
          const isCapture =
            (event.altKey && event.code === 'Space') ||
            ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space')
          if (!isCapture) return
          event.preventDefault()
          openCapture()
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, 'agent-todo: global capture shortcut')

      ctx.effect(() => {
        const offIcon = ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'agent-todo', order: 20, label: () => 'Agent ToDo' },
            SidebarIcon,
          ),
        )
        const offMain = ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'agent-todo' }, Workspace),
        )
        const offOverlay = ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            { name: 'shell.overlay', id: 'agent-todo-capture', order: 20 },
            QuickCaptureOverlay,
          ),
        )
        return () => {
          offIcon()
          offMain()
          offOverlay()
        }
      }, 'agent-todo: slots')
    },
  }
}

/* ------------------------------------------------------------------ store */

function createStore(initial) {
  let state = initial
  const listeners = new Set()
  return {
    get: () => state,
    set(updater) {
      const next = typeof updater === 'function' ? updater(state) : updater
      if (next === state) return
      state = next
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

function useStore(store) {
  return React.useSyncExternalStore(store.subscribe, store.get, store.get)
}

let uidSeq = 0
function uid(prefix) {
  uidSeq += 1
  return `${prefix}${Date.now().toString(36)}${uidSeq}`
}

const PROJECTS = [
  { id: 'p-dsh', name: 'DSH 插件', color: '#4C8BF5' },
  { id: 'p-client', name: '客户交付', color: '#E5A400' },
  { id: 'p-personal', name: '个人工位', color: '#8B5CF6' },
]

const TASKS = [
  {
    id: 't1',
    title: '把 Agent-ToDo 的 Capture 做成全局快捷键',
    projectId: 'p-dsh',
    urgency: 'high',
    done: false,
    mindmap: 'DSH 交互设计',
    capsules: 2,
    images: 0,
    updated: '10:24',
  },
  {
    id: 't2',
    title: '梳理 React 工作台的三栏信息架构',
    projectId: 'p-dsh',
    urgency: 'medium',
    done: false,
    mindmap: '工作台 IA',
    capsules: 1,
    images: 0,
    updated: '09:58',
  },
  {
    id: 't3',
    title: '给 Handoff 面板加“插入输入框”',
    projectId: 'p-dsh',
    urgency: 'high',
    done: false,
    mindmap: 'Handoff 流程',
    capsules: 3,
    images: 1,
    updated: '昨天',
  },
  {
    id: 't4',
    title: '确认项目八色与紧急四档的迁移值',
    projectId: 'p-client',
    urgency: 'low',
    done: false,
    mindmap: '',
    capsules: 0,
    images: 0,
    updated: '昨天',
  },
  {
    id: 't5',
    title: '对齐旧版 todoToMarkdown 的导出格式',
    projectId: 'p-client',
    urgency: 'medium',
    done: false,
    mindmap: '导出格式',
    capsules: 0,
    images: 2,
    updated: '周一',
  },
  {
    id: 't6',
    title: '补设备配对与令牌刷新',
    projectId: 'p-dsh',
    urgency: 'medium',
    done: true,
    mindmap: '',
    capsules: 0,
    images: 0,
    updated: '周一',
  },
  {
    id: 't7',
    title: '整理旧应用里值得保留的 10 个交互细节',
    projectId: 'p-personal',
    urgency: 'low',
    done: false,
    mindmap: '',
    capsules: 1,
    images: 0,
    updated: '10-31',
  },
]

const CAPSULES = [
  { id: 'c1', text: 'Capture 的入口应该比“打开应用”更近：在会话里按 Alt+Space 就能记。', time: '10:12', taskId: 't1' },
  { id: 'c2', text: '脑图不是独立模块，它应该贴着任务；任务是主语，脑图是谓语。', time: '09:40', taskId: 't2' },
  { id: 'c3', text: 'Handoff 要能直接插入输入框，而不是复制后自己找地方粘贴。', time: '昨天', taskId: 't3' },
  { id: 'c4', text: '任务列表的密度按桌面来：34px 一行，悬停出操作，不要移动端大卡。', time: '昨天' },
]

const appStore = createStore({
  projects: PROJECTS,
  tasks: TASKS,
  capsules: CAPSULES,
  view: 'inbox',
  activeProjectId: '',
  layout: 'list',
  query: '',
  selectedTaskId: 't1',
  focus: false,
  navCollapsed: false,
  inspectorOpen: true,
})

const captureStore = createStore({ open: false })
const toastStore = createStore({ message: '', tone: 'default', nonce: 0 })

function openCapture() {
  captureStore.set({ open: true })
}

function closeCapture() {
  captureStore.set({ open: false })
}

function toast(message, tone = 'default') {
  toastStore.set({ message, tone, nonce: Date.now() })
}

function patchApp(patch) {
  appStore.set((state) => ({ ...state, ...patch }))
}

function addTask(title, opts = {}) {
  const text = String(title || '').trim()
  if (!text) return null
  const task = {
    id: uid('t'),
    title: text,
    projectId: opts.projectId || '',
    urgency: opts.urgency || 'none',
    done: false,
    mindmap: '',
    capsules: 0,
    images: 0,
    updated: '刚刚',
  }
  appStore.set((state) => ({
    ...state,
    tasks: [task, ...state.tasks],
    selectedTaskId: task.id,
    view: task.projectId ? 'project' : 'inbox',
    activeProjectId: task.projectId || '',
    inspectorOpen: true,
  }))
  toast('已创建待办')
  return task
}

function addCapsule(text) {
  const value = String(text || '').trim()
  if (!value) return null
  const capsule = { id: uid('c'), text: value, time: '刚刚' }
  appStore.set((state) => ({ ...state, capsules: [capsule, ...state.capsules], view: 'inbox', selectedTaskId: '' }))
  toast('已收进 Inbox')
  return capsule
}

function updateTask(id, patch) {
  appStore.set((state) => ({
    ...state,
    tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch, updated: '刚刚' } : task)),
  }))
}

function toggleTask(id) {
  const task = appStore.get().tasks.find((item) => item.id === id)
  if (!task) return
  updateTask(id, { done: !task.done })
  toast(task.done ? '已重新打开' : '已完成')
}

function removeTask(id) {
  appStore.set((state) => {
    const tasks = state.tasks.filter((task) => task.id !== id)
    return {
      ...state,
      tasks,
      selectedTaskId: state.selectedTaskId === id ? (tasks[0] ? tasks[0].id : '') : state.selectedTaskId,
    }
  })
  toast('已删除（P1 接后端软删/还原）', 'danger')
}

function selectTask(id) {
  patchApp({ selectedTaskId: id, inspectorOpen: true })
}

function setView(view) {
  patchApp({ view, activeProjectId: '', selectedTaskId: '' })
}

function setProjectView(projectId) {
  patchApp({ view: 'project', activeProjectId: projectId, selectedTaskId: '' })
}

function visibleTasks(state) {
  let list = state.tasks
  if (state.view === 'archive') list = list.filter((task) => task.done)
  else if (state.view === 'today') {
    list = list.filter((task) => !task.done && (task.urgency === 'high' || task.urgency === 'medium'))
  } else if (state.view === 'project') {
    list = list.filter((task) => task.projectId === state.activeProjectId && !task.done)
  } else if (state.view === 'all') list = list.filter((task) => !task.done)
  else list = list.filter((task) => !task.done)
  if (state.query) {
    const q = state.query.toLowerCase()
    list = list.filter((task) => task.title.toLowerCase().includes(q))
  }
  return list
}

function projectOf(state, id) {
  return state.projects.find((project) => project.id === id) || null
}

function taskCountOf(state, projectId) {
  return state.tasks.filter((task) => task.projectId === projectId && !task.done).length
}

function viewTitle(state) {
  if (state.view === 'project') {
    const project = projectOf(state, state.activeProjectId)
    return project ? project.name : '项目'
  }
  return (
    {
      inbox: 'Inbox',
      today: 'Today',
      all: 'All tasks',
      archive: 'Archive',
      mindmaps: 'Mindmaps',
      agents: 'Agents',
    }[state.view] || 'Inbox'
  )
}

function viewCount(state) {
  if (state.view === 'project') return visibleTasks(state).length
  if (state.view === 'inbox') return state.tasks.filter((task) => !task.done).length + state.capsules.length
  if (state.view === 'today') return visibleTasks(state).length
  if (state.view === 'archive') return state.tasks.filter((task) => task.done).length
  return visibleTasks(state).length
}

/* ------------------------------------------------------------------ icons */

function Icon({ name, size = 16, className = '' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `at-icon ${className}`,
    'aria-hidden': true,
  }
  switch (name) {
    case 'inbox':
      return (
        <svg {...props}>
          <path d="M4 5.5h16v13H4z" />
          <path d="M4 13h4l1.6 2.5h4.8L16 13h4" />
        </svg>
      )
    case 'today':
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" />
        </svg>
      )
    case 'all':
      return (
        <svg {...props}>
          <path d="M9 6.5h11M9 12h11M9 17.5h11" />
          <circle cx="4.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="17.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'archive':
      return (
        <svg {...props}>
          <path d="M4 7h16v3H4zM5.5 10v8.5h13V10M9.5 13.5h5" />
        </svg>
      )
    case 'project':
      return (
        <svg {...props}>
          <path d="M3.5 6.5h6l2 2h9v10h-17z" />
          <path d="M3.5 6.5v12" />
        </svg>
      )
    case 'mindmap':
      return (
        <svg {...props}>
          <circle cx="6" cy="12" r="2.2" />
          <circle cx="17.5" cy="6" r="2.2" />
          <circle cx="17.5" cy="18" r="2.2" />
          <path d="M8.2 11l7.2-4M8.2 13l7.2 4" />
        </svg>
      )
    case 'agent':
      return (
        <svg {...props}>
          <rect x="4.5" y="7.5" width="15" height="11" rx="3" />
          <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
          <path d="M12 7.5V4.5M9.5 4.5h5" />
        </svg>
      )
    case 'search':
      return (
        <svg {...props}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="M15 15l4 4" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'more':
      return (
        <svg {...props}>
          <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...props}>
          <rect x="9" y="3.5" width="6" height="11" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3M9 21h6" />
        </svg>
      )
    case 'image':
      return (
        <svg {...props}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M4.5 17l5-5 3.5 3.5 2.5-2.5 4 4" />
        </svg>
      )
    case 'copy':
      return (
        <svg {...props}>
          <rect x="8" y="8" width="11" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h2" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...props}>
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        </svg>
      )
    case 'check':
      return (
        <svg {...props}>
          <path d="M4.5 12.5l5 5 10-11" />
        </svg>
      )
    case 'close':
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...props}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" />
        </svg>
      )
    case 'board':
      return (
        <svg {...props}>
          <rect x="3.5" y="4.5" width="5" height="15" rx="1.2" />
          <rect x="9.5" y="4.5" width="5" height="10" rx="1.2" />
          <rect x="15.5" y="4.5" width="5" height="7" rx="1.2" />
        </svg>
      )
    case 'focus':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

function SidebarIcon({ size = 20, active = false }) {
  return (
    <span className={`at-brand-icon ${active ? 'active' : ''}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <rect width="64" height="64" rx="15" fill="#FFD02F" />
        <path
          d="M16 34.5l10.5 10L48 20.5"
          fill="none"
          stroke="#1C1C1E"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="49" cy="15.5" r="4.5" fill="#1C1C1E" />
      </svg>
    </span>
  )
}

/* -------------------------------------------------------------- primitives */

function IconButton({ name, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      className={`at-icon-btn ${active ? 'active' : ''}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={name} size={16} />
    </button>
  )
}

function Button({ children, variant = 'ghost', onClick, disabled = false, title }) {
  return (
    <button
      type="button"
      className={`at-btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

function Chip({ children, color, muted = false }) {
  return (
    <span className={`at-chip ${muted ? 'muted' : ''}`}>
      {color ? <span className="at-dot" style={{ background: color }} /> : null}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ views */

function Workspace() {
  const state = useStore(appStore)
  const tasks = visibleTasks(state)
  const selected = state.tasks.find((task) => task.id === state.selectedTaskId) || null
  const rootRef = React.useRef(null)
  const captureRef = React.useRef(null)

  React.useEffect(() => {
    if (rootRef.current) rootRef.current.focus()
  }, [])

  const moveSelection = (delta) => {
    if (!tasks.length) return
    const index = tasks.findIndex((task) => task.id === state.selectedTaskId)
    const nextIndex = index < 0 ? 0 : Math.max(0, Math.min(tasks.length - 1, index + delta))
    selectTask(tasks[nextIndex].id)
  }

  const onKeyDown = (event) => {
    const target = event.target
    const typing =
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    if (typing) return

    if (event.key === 'j' || event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(1)
      return
    }
    if (event.key === 'k' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(-1)
      return
    }
    if (event.key === 'Enter') {
      if (selected) {
        event.preventDefault()
        patchApp({ inspectorOpen: true })
      }
      return
    }
    if (event.key === ' ') {
      if (selected) {
        event.preventDefault()
        toggleTask(selected.id)
      }
      return
    }
    if (event.key === 'c' || event.key === 'C') {
      event.preventDefault()
      if (captureRef.current) captureRef.current.focus()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      patchApp({ selectedTaskId: '', inspectorOpen: false })
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault()
      if (selected) copyHandoff(state, selected)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`at-root ${state.focus ? 'at-focus' : ''} ${state.navCollapsed ? 'at-nav-collapsed' : ''}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <Topbar state={state} tasks={tasks} />
      <div className="at-main">
        {state.focus ? null : <LeftNav state={state} />}
        <main className="at-center">
          {state.view === 'mindmaps' ? (
            <MindmapsPlaceholder />
          ) : state.view === 'agents' ? (
            <AgentsPlaceholder />
          ) : state.layout === 'board' ? (
            <Board state={state} tasks={tasks} />
          ) : (
            <TaskList state={state} tasks={tasks} selected={selected} />
          )}
        </main>
        {state.focus || !state.inspectorOpen ? null : (
          <Inspector state={state} task={selected} />
        )}
      </div>
      <CaptureBar inputRef={captureRef} state={state} />
      <Toast />
    </div>
  )
}

function Topbar({ state, tasks }) {
  const title = viewTitle(state)
  const project = state.view === 'project' ? projectOf(state, state.activeProjectId) : null
  return (
    <header className="at-topbar">
      <div className="at-crumbs">
        <span className="at-crumb-title">{title}</span>
        <span className="at-crumb-count">{viewCount(state)}</span>
        {project ? <span className="at-crumb-sub">/ {project.name}</span> : null}
      </div>
      <label className="at-search">
        <Icon name="search" size={14} />
        <input
          value={state.query}
          placeholder="搜索任务…"
          onChange={(event) => patchApp({ query: event.target.value })}
          aria-label="搜索任务"
        />
        <kbd>/</kbd>
      </label>
      <div className="at-topbar-actions">
        <IconButton
          name="board"
          label="看板视图"
          active={state.layout === 'board'}
          onClick={() => patchApp({ layout: state.layout === 'board' ? 'list' : 'board' })}
        />
        <IconButton
          name="focus"
          label="专注模式"
          active={state.focus}
          onClick={() => patchApp({ focus: !state.focus })}
        />
        <Button
          variant="primary"
          onClick={() => {
            const task = addTask('新的待办', { projectId: state.view === 'project' ? state.activeProjectId : '' })
            if (task) patchApp({ layout: 'list' })
          }}
        >
          <Icon name="plus" size={14} />
          新建
        </Button>
      </div>
    </header>
  )
}

function LeftNav({ state }) {
  const views = [
    { key: 'inbox', label: 'Inbox', icon: 'inbox', count: state.tasks.filter((task) => !task.done).length + state.capsules.length },
    { key: 'today', label: 'Today', icon: 'today', count: visibleTasks({ ...state, view: 'today' }).length },
    { key: 'all', label: 'All tasks', icon: 'all', count: state.tasks.filter((task) => !task.done).length },
    { key: 'archive', label: 'Archive', icon: 'archive', count: state.tasks.filter((task) => task.done).length },
  ]
  return (
    <aside className="at-sidebar">
      <div className="at-sidebar-head">
        <span className="at-sidebar-brand">
          <SidebarIcon size={22} />
          <span className="at-sidebar-name">Agent ToDo</span>
        </span>
        <IconButton
          name="chevron"
          label={state.navCollapsed ? '展开侧栏' : '收起侧栏'}
          onClick={() => patchApp({ navCollapsed: !state.navCollapsed })}
        />
      </div>

      <div className="at-nav-section">
        {views.map((view) => (
          <button
            key={view.key}
            type="button"
            className={`at-nav-item ${state.view === view.key ? 'active' : ''}`}
            onClick={() => setView(view.key)}
            title={view.label}
          >
            <Icon name={view.icon} size={15} />
            <span className="at-nav-label">{view.label}</span>
            <span className="at-nav-count">{view.count}</span>
          </button>
        ))}
      </div>

      <div className="at-nav-section">
        <div className="at-section-head">
          <span>项目</span>
          <button type="button" className="at-text-btn" onClick={() => addTask('新的待办')}>
            新建
          </button>
        </div>
        {state.projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className={`at-nav-item at-project-item ${
              state.view === 'project' && state.activeProjectId === project.id ? 'active' : ''
            }`}
            onClick={() => setProjectView(project.id)}
            title={project.name}
          >
            <span className="at-proj-dot" style={{ background: project.color }} />
            <span className="at-nav-label">{project.name}</span>
            <span className="at-nav-count">{taskCountOf(state, project.id)}</span>
          </button>
        ))}
      </div>

      <div className="at-nav-section at-nav-bottom">
        <button
          type="button"
          className={`at-nav-item ${state.view === 'mindmaps' ? 'active' : ''}`}
          onClick={() => setView('mindmaps')}
        >
          <Icon name="mindmap" size={15} />
          <span className="at-nav-label">Mindmaps</span>
        </button>
        <button
          type="button"
          className={`at-nav-item ${state.view === 'agents' ? 'active' : ''}`}
          onClick={() => setView('agents')}
        >
          <Icon name="agent" size={15} />
          <span className="at-nav-label">Agents</span>
        </button>
        <button type="button" className="at-nav-item" onClick={() => toast('设置将在 P4 接入')}>
          <Icon name="settings" size={15} />
          <span className="at-nav-label">Settings</span>
        </button>
      </div>

      <div className="at-sidebar-foot">
        <span className="at-kbd">Alt</span>
        <span className="at-kbd">Space</span>
        <span>快速捕获</span>
      </div>
    </aside>
  )
}

function TaskList({ state, tasks, selected }) {
  return (
    <section className="at-list-wrap">
      <div className="at-list-head">
        <div>
          <div className="at-list-title">{viewTitle(state)}</div>
          <div className="at-list-sub">
            {tasks.length} 个任务
            {state.view === 'inbox' ? ` · ${state.capsules.length} 条胶囊` : ''}
          </div>
        </div>
        <div className="at-list-tools">
          <IconButton name="plus" label="新建待办" onClick={() => addTask('新的待办', { projectId: state.view === 'project' ? state.activeProjectId : '' })} />
          <IconButton name="more" label="更多" onClick={() => toast('更多操作将在 P1/P2 补齐')} />
        </div>
      </div>

      {state.view === 'inbox' && state.capsules.length > 0 ? (
        <div className="at-inbox-strip">
          <div className="at-inbox-strip-head">
            <Icon name="spark" size={14} />
            <span>待分诊的胶囊</span>
            <span className="at-inbox-strip-count">{state.capsules.length}</span>
          </div>
          <div className="at-inbox-strip-body">
            {state.capsules.slice(0, 3).map((capsule) => (
              <div key={capsule.id} className="at-capsule">
                <p>{capsule.text}</p>
                <div className="at-capsule-meta">
                  <span>{capsule.time}</span>
                  <button type="button" onClick={() => toast('转待办将在 P2 接入')}>
                    转待办
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="at-list-body at-scroll">
        {tasks.length === 0 ? (
          <div className="at-empty">
            <Icon name="inbox" size={26} />
            <p>这里暂时是空的。</p>
            <button type="button" className="at-link" onClick={openCapture}>
              记一条
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              state={state}
              selected={selected && selected.id === task.id}
              onClick={() => selectTask(task.id)}
              onToggle={() => toggleTask(task.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function TaskRow({ task, state, selected, onClick, onToggle }) {
  const project = projectOf(state, task.projectId)
  return (
    <div
      className={`at-task-row ${selected ? 'selected' : ''} ${task.done ? 'done' : ''}`}
      role="button"
      tabIndex={-1}
      onClick={onClick}
    >
      <button
        type="button"
        className={`at-check ${task.done ? 'checked' : ''}`}
        aria-label={task.done ? '重新打开' : '完成'}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
      >
        {task.done ? <Icon name="check" size={11} /> : null}
      </button>
      <div className="at-task-main">
        <div className="at-task-title">{task.title}</div>
        <div className="at-task-meta">
          {project ? (
            <span className="at-project-chip">
              <span className="at-dot" style={{ background: project.color }} />
              {project.name}
            </span>
          ) : (
            <span className="at-project-chip muted">Inbox</span>
          )}
          {task.mindmap ? (
            <span className="at-meta-item">
              <Icon name="mindmap" size={12} />
              {task.mindmap}
            </span>
          ) : null}
          {task.capsules ? (
            <span className="at-meta-item">
              <Icon name="spark" size={12} />
              {task.capsules}
            </span>
          ) : null}
          {task.images ? (
            <span className="at-meta-item">
              <Icon name="image" size={12} />
              {task.images}
            </span>
          ) : null}
        </div>
      </div>
      <div className="at-task-right">
        <span className={`at-urgency ${task.urgency}`} title={`紧急度：${task.urgency}`} />
        <span className="at-updated">{task.updated}</span>
      </div>
    </div>
  )
}

function Board({ state, tasks }) {
  const columns = [
    { key: 'high', label: '紧急' },
    { key: 'medium', label: '重要' },
    { key: 'low', label: '普通' },
    { key: 'none', label: '待定' },
  ]
  return (
    <div className="at-board at-scroll">
      {columns.map((column) => {
        const items = tasks.filter((task) => task.urgency === column.key)
        return (
          <div key={column.key} className="at-board-col">
            <div className="at-board-head">
              <span className={`at-urgency ${column.key}`} />
              {column.label}
              <span className="at-board-count">{items.length}</span>
            </div>
            {items.map((task) => {
              const project = projectOf(state, task.projectId)
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`at-board-card ${state.selectedTaskId === task.id ? 'selected' : ''}`}
                  onClick={() => selectTask(task.id)}
                >
                  <span className="at-board-card-title">{task.title}</span>
                  <span className="at-board-card-meta">
                    {project ? (
                      <>
                        <span className="at-dot" style={{ background: project.color }} />
                        {project.name}
                      </>
                    ) : (
                      'Inbox'
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function Inspector({ state, task }) {
  if (!task) {
    return (
      <aside className="at-inspector at-scroll">
        <div className="at-empty at-empty-inspector">
          <Icon name="spark" size={24} />
          <p>选中一条任务，查看详情与 Handoff。</p>
        </div>
      </aside>
    )
  }
  const project = projectOf(state, task.projectId)
  const capsules = state.capsules.filter((capsule) => capsule.taskId === task.id)
  return (
    <aside className="at-inspector at-scroll">
      <div className="at-inspector-head">
        <button
          type="button"
          className={`at-check ${task.done ? 'checked' : ''}`}
          aria-label={task.done ? '重新打开' : '完成'}
          onClick={() => toggleTask(task.id)}
        >
          {task.done ? <Icon name="check" size={11} /> : null}
        </button>
        <input
          className="at-inspector-title"
          value={task.title}
          onChange={(event) => updateTask(task.id, { title: event.target.value })}
          aria-label="任务标题"
        />
        <IconButton name="more" label="更多" onClick={() => toast('更多操作将在 P1 补齐')} />
      </div>

      <div className="at-field">
        <div className="at-label">紧急度</div>
        <div className="at-seg">
          {[
            { key: 'high', label: '紧急' },
            { key: 'medium', label: '重要' },
            { key: 'low', label: '普通' },
            { key: 'none', label: '待定' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={task.urgency === item.key ? 'active' : ''}
              onClick={() => updateTask(task.id, { urgency: item.key })}
            >
              <span className={`at-urgency ${item.key}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="at-field">
        <div className="at-label">项目</div>
        <select
          className="at-select"
          value={task.projectId || ''}
          onChange={(event) => updateTask(task.id, { projectId: event.target.value })}
        >
          <option value="">Inbox（未归项目）</option>
          {state.projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {project ? (
          <div className="at-project-hint">
            <span className="at-dot" style={{ background: project.color }} />
            {project.name}
          </div>
        ) : null}
      </div>

      <div className="at-field">
        <div className="at-label-row">
          <span className="at-label">脑图</span>
          <button type="button" className="at-text-btn" onClick={() => toast('脑图画布将在 P3 接入')}>
            {task.mindmap ? '更换' : '关联'}
          </button>
        </div>
        {task.mindmap ? (
          <div className="at-card at-mindmap-card">
            <div className="at-mindmap-card-head">
              <span>
                <Icon name="mindmap" size={13} /> {task.mindmap}
              </span>
              <button type="button" className="at-text-btn" onClick={() => toast('全屏画布将在 P3 接入')}>
                展开
              </button>
            </div>
            <MindmapPreview />
          </div>
        ) : (
          <button type="button" className="at-empty-card" onClick={() => toast('脑图画布将在 P3 接入')}>
            <Icon name="mindmap" size={16} />
            关联一张脑图，把任务想清楚
          </button>
        )}
      </div>

      <div className="at-field">
        <div className="at-label-row">
          <span className="at-label">胶囊</span>
          <button type="button" className="at-text-btn" onClick={() => toast('从 Capture 或 Inbox 拖入')}>
            添加
          </button>
        </div>
        {capsules.length ? (
          capsules.map((capsule) => (
            <div key={capsule.id} className="at-capsule">
              <p>{capsule.text}</p>
              <div className="at-capsule-meta">
                <span>{capsule.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="at-empty-card">把胶囊拖到这里，或从 Inbox 追加。</div>
        )}
      </div>

      <div className="at-field">
        <div className="at-label">图片</div>
        <div className="at-image-strip">
          {task.images ? (
            Array.from({ length: task.images }).map((_, index) => (
              <span key={index} className="at-image-tile">
                <Icon name="image" size={16} />
              </span>
            ))
          ) : (
            <span className="at-muted">还没有图片；P1 接入上传与粘贴。</span>
          )}
        </div>
      </div>

      <div className="at-meta-block">
        <div>
          <span>创建</span>
          <strong>10-30 09:00</strong>
        </div>
        <div>
          <span>更新</span>
          <strong>{task.updated}</strong>
        </div>
        <div>
          <span>状态</span>
          <strong>{task.done ? '已完成' : '进行中'}</strong>
        </div>
      </div>

      <div className="at-actions">
        <Button variant="primary" onClick={() => copyHandoff(state, task)}>
          <Icon name="copy" size={14} />
          复制 Handoff
        </Button>
        <Button
          onClick={() => {
            copyHandoff(state, task)
            toast('已复制，可粘贴到输入框；直接插入将在 P2 接入')
          }}
        >
          <Icon name="spark" size={14} />
          插入输入框
        </Button>
        <Button variant="danger" onClick={() => removeTask(task.id)}>
          <Icon name="close" size={14} />
          删除
        </Button>
      </div>
    </aside>
  )
}

function MindmapPreview() {
  return (
    <svg className="at-mindmap-svg" viewBox="0 0 320 150" role="img" aria-label="脑图预览">
      <path d="M82 76H132M132 76V36H178M132 76V116H178M178 36H222M178 116H222" stroke="var(--at-border-strong)" strokeWidth="1.4" fill="none" />
      <rect x="18" y="62" width="64" height="28" rx="7" fill="#FFD02F" />
      <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#1C1C1E" fontWeight="600">
        DSH 交互
      </text>
      <rect x="178" y="22" width="70" height="26" rx="6" fill="var(--at-surface)" stroke="var(--at-border)" />
      <text x="213" y="39" textAnchor="middle" fontSize="9" fill="var(--at-text)">
        Capture
      </text>
      <rect x="178" y="102" width="70" height="26" rx="6" fill="var(--at-surface)" stroke="var(--at-border)" />
      <text x="213" y="119" textAnchor="middle" fontSize="9" fill="var(--at-text)">
        Handoff
      </text>
      <rect x="252" y="22" width="52" height="26" rx="6" fill="var(--at-surface)" stroke="var(--at-border)" />
      <text x="278" y="39" textAnchor="middle" fontSize="9" fill="var(--at-text-2)">
        快捷键
      </text>
      <rect x="252" y="102" width="52" height="26" rx="6" fill="var(--at-surface)" stroke="var(--at-border)" />
      <text x="278" y="119" textAnchor="middle" fontSize="9" fill="var(--at-text-2)">
        输入框
      </text>
    </svg>
  )
}

function CaptureBar({ inputRef, state }) {
  const [text, setText] = React.useState('')
  const save = (asTask) => {
    if (!text.trim()) {
      if (inputRef && inputRef.current) inputRef.current.focus()
      return
    }
    if (asTask) addTask(text)
    else addCapsule(text)
    setText('')
  }
  return (
    <footer className="at-capture">
      <span className="at-capture-mark">
        <Icon name="plus" size={15} />
      </span>
      <input
        ref={inputRef}
        className="at-capture-input"
        value={text}
        placeholder="记一条…  Enter 存胶囊 · ⌘Enter 存待办"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            save(event.metaKey || event.ctrlKey)
          }
          if (event.key === 'Escape') {
            event.preventDefault()
            setText('')
          }
        }}
        aria-label="快速记录"
      />
      <button type="button" className="at-capture-target" onClick={() => toast('目标选择将在 P2 接入')}>
        {state.view === 'project' ? viewTitle(state) : 'Inbox'}
        <Icon name="chevron" size={12} />
      </button>
      <IconButton name="mic" label="语音记录（P2）" onClick={() => toast('语音将在 P2 接入')} />
      <IconButton name="image" label="添加图片（P1）" onClick={() => toast('图片上传将在 P1 接入')} />
      <span className="at-capture-hint">
        <kbd>⌘</kbd>
        <kbd>↵</kbd>
      </span>
    </footer>
  )
}

function QuickCaptureOverlay() {
  const capture = useStore(captureStore)
  const [text, setText] = React.useState('')
  const areaRef = React.useRef(null)

  React.useEffect(() => {
    if (capture.open && areaRef.current) {
      window.setTimeout(() => areaRef.current && areaRef.current.focus(), 20)
    }
    if (!capture.open) setText('')
  }, [capture.open])

  if (!capture.open) return null

  const save = (asTask) => {
    if (!text.trim()) return
    if (asTask) addTask(text)
    else addCapsule(text)
    setText('')
    closeCapture()
  }

  return (
    <div
      className="at-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCapture()
      }}
    >
      <div className="at-overlay-panel" role="dialog" aria-label="快速捕获">
        <div className="at-overlay-head">
          <div>
            <div className="at-overlay-title">Quick Capture</div>
            <div className="at-overlay-sub">先接住，再整理。Enter 存胶囊，⌘Enter 存待办。</div>
          </div>
          <IconButton name="close" label="关闭" onClick={closeCapture} />
        </div>
        <textarea
          ref={areaRef}
          className="at-overlay-textarea"
          value={text}
          placeholder="现在脑子里冒出来的那句话…"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              save(event.metaKey || event.ctrlKey)
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              closeCapture()
            }
          }}
        />
        <div className="at-overlay-foot">
          <button type="button" className="at-capture-target" onClick={() => toast('目标选择将在 P2 接入')}>
            Inbox
            <Icon name="chevron" size={12} />
          </button>
          <div className="at-overlay-actions">
            <Button onClick={() => save(false)}>
              <Icon name="spark" size={14} />
              存胶囊
            </Button>
            <Button variant="primary" onClick={() => save(true)}>
              <Icon name="plus" size={14} />
              存待办
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MindmapsPlaceholder() {
  return (
    <div className="at-placeholder at-scroll">
      <div className="at-placeholder-head">
        <div>
          <div className="at-list-title">Mindmaps</div>
          <div className="at-list-sub">脑图是任务的思考画布，不单独占一个主模块。</div>
        </div>
        <Button variant="primary" onClick={() => toast('脑图创建将在 P3 接入')}>
          <Icon name="plus" size={14} />
          新建脑图
        </Button>
      </div>
      <div className="at-placeholder-grid">
        {['DSH 交互设计', '工作台 IA', 'Handoff 流程', '导出格式'].map((name, index) => (
          <div key={name} className="at-placeholder-card">
            <div className="at-placeholder-card-title">
              <Icon name="mindmap" size={15} />
              {name}
            </div>
            <div className="at-placeholder-card-meta">{12 + index * 4} 节点 · 逻辑图</div>
            <div className="at-placeholder-card-bar">
              <span style={{ width: `${55 + index * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentsPlaceholder() {
  return (
    <div className="at-placeholder at-scroll">
      <div className="at-placeholder-head">
        <div>
          <div className="at-list-title">Agents</div>
          <div className="at-list-sub">Agent 卡、Token 与个人资料在 P4 接入。</div>
        </div>
      </div>
      <div className="at-placeholder-grid">
        {[
          { name: 'workbuddy', quota: '1,240 / 2,000', reset: '距重置 6 天' },
          { name: 'deepseek', quota: '860 / 1,500', reset: '距重置 12 天' },
        ].map((agent) => (
          <div key={agent.name} className="at-placeholder-card">
            <div className="at-placeholder-card-title">
              <Icon name="agent" size={15} />
              {agent.name}
            </div>
            <div className="at-placeholder-card-meta">{agent.quota}</div>
            <div className="at-placeholder-card-meta">{agent.reset}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Toast() {
  const state = useStore(toastStore)
  React.useEffect(() => {
    if (!state.message) return undefined
    const timer = window.setTimeout(() => {
      toastStore.set((current) => ({ ...current, message: '' }))
    }, 2400)
    return () => window.clearTimeout(timer)
  }, [state.nonce, state.message])
  if (!state.message) return null
  return (
    <div className={`at-toast ${state.tone === 'danger' ? 'danger' : ''}`} role="status">
      {state.message}
    </div>
  )
}

/* ------------------------------------------------------------------ handoff */

function buildHandoff(state, task) {
  const project = projectOf(state, task.projectId)
  const capsules = state.capsules.filter((capsule) => capsule.taskId === task.id)
  const urgency = { high: '紧急', medium: '重要', low: '普通', none: '待定' }[task.urgency] || '待定'
  const lines = []
  lines.push('## 任务')
  lines.push(task.title)
  lines.push('')
  lines.push(`- 项目：${project ? project.name : 'Inbox'}`)
  lines.push(`- 紧急度：${urgency}`)
  lines.push(`- 状态：${task.done ? '已完成' : '进行中'}`)
  lines.push('')
  if (capsules.length) {
    lines.push('## 闪念胶囊')
    capsules.forEach((capsule) => lines.push(`- ${capsule.text}`))
    lines.push('')
  }
  lines.push(`## 脑图${task.mindmap ? `：${task.mindmap}` : ''}`)
  if (task.mindmap) {
    lines.push('- 目标：把这件事推进到可交付的状态')
    lines.push('  - 约束：保持与旧应用配色/数据/接口一致')
    lines.push('  - 下一步：先做 Capture，再做 Handoff')
  } else {
    lines.push('（未关联脑图）')
  }
  if (task.images) {
    lines.push('')
    lines.push('## 图片')
    lines.push(`- ${task.images} 张图片（P1 接入附件地址）`)
  }
  return lines.join('\n')
}

async function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    /* fall through */
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    return ok
  } catch (error) {
    return false
  }
}

async function copyHandoff(state, task) {
  const ok = await copyText(buildHandoff(state, task))
  toast(ok ? 'Handoff 已复制' : '复制失败，请重试', ok ? 'default' : 'danger')
}

/* ------------------------------------------------------------------ styles */

const STYLES = `
.at-root {
  --at-accent: #FFD02F;
  --at-accent-soft: rgba(255, 208, 47, 0.16);
  --at-bg: var(--dsw-alias-bg-base, #ffffff);
  --at-surface: var(--dsw-alias-bg-layer-1, #ffffff);
  --at-surface-2: var(--dsw-alias-bg-layer-2, #f4f5f7);
  --at-overlay: var(--dsw-alias-bg-overlay, #ffffff);
  --at-border: var(--dsw-alias-border-l1, #e4e6eb);
  --at-border-strong: var(--dsw-alias-border-l2, #c9ccd4);
  --at-text: var(--dsw-alias-label-primary, #1c1c1e);
  --at-text-2: var(--dsw-alias-label-secondary, #686c7a);
  --at-danger: var(--dsw-alias-state-error-primary, #c63b2e);
  --at-success: var(--dsw-alias-state-success-primary, #1f9d55);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--at-bg);
  color: var(--at-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  outline: none;
  overflow: hidden;
}
.at-root *, .at-overlay * { box-sizing: border-box; }
.at-root button, .at-overlay button { font: inherit; color: inherit; }
.at-root input, .at-overlay input, .at-root select, .at-overlay textarea { font: inherit; color: inherit; }
.at-icon { display: block; flex: 0 0 auto; }
.at-brand-icon { display: inline-flex; align-items: center; justify-content: center; border-radius: 7px; overflow: hidden; }
.at-brand-icon.active { box-shadow: 0 0 0 2px var(--at-accent); }
.at-topbar {
  display: flex; align-items: center; gap: 12px;
  height: 48px; padding: 0 12px; flex: 0 0 48px;
  border-bottom: 1px solid var(--at-border); background: var(--at-bg);
}
.at-crumbs { display: flex; align-items: baseline; gap: 8px; min-width: 160px; }
.at-crumb-title { font-size: 14px; font-weight: 650; }
.at-crumb-count { font-size: 11px; color: var(--at-text-2); }
.at-crumb-sub { font-size: 11px; color: var(--at-text-2); }
.at-search {
  display: flex; align-items: center; gap: 7px;
  height: 30px; padding: 0 9px; flex: 0 1 420px; margin: 0 auto;
  border: 1px solid var(--at-border); border-radius: 7px;
  background: var(--at-surface-2); color: var(--at-text-2);
}
.at-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; color: var(--at-text); font-size: 12px; }
.at-search kbd { border: 1px solid var(--at-border); border-radius: 4px; padding: 0 4px; font-size: 10px; background: var(--at-surface); }
.at-topbar-actions { display: flex; align-items: center; gap: 6px; }
.at-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: 1px solid transparent; border-radius: 6px;
  background: transparent; color: var(--at-text-2); cursor: pointer;
}
.at-icon-btn:hover { background: var(--at-surface-2); color: var(--at-text); }
.at-icon-btn.active { background: var(--at-accent-soft); color: var(--at-text); }
.at-icon-btn:disabled { opacity: .45; cursor: default; }
.at-main { display: flex; flex: 1 1 auto; min-height: 0; }
.at-sidebar {
  width: 240px; flex: 0 0 240px; min-width: 0;
  display: flex; flex-direction: column;
  border-right: 1px solid var(--at-border); background: var(--at-bg);
  transition: width .16s ease, flex-basis .16s ease;
}
.at-nav-collapsed .at-sidebar { width: 54px; flex-basis: 54px; }
.at-nav-collapsed .at-sidebar-name,
.at-nav-collapsed .at-nav-label,
.at-nav-collapsed .at-nav-count,
.at-nav-collapsed .at-section-head,
.at-nav-collapsed .at-sidebar-foot,
.at-nav-collapsed .at-nav-section:nth-of-type(2) { display: none; }
.at-sidebar-head { display: flex; align-items: center; gap: 8px; padding: 10px 10px 8px; }
.at-sidebar-brand { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.at-sidebar-name { font-size: 13px; font-weight: 650; white-space: nowrap; }
.at-nav-section { padding: 4px 8px; }
.at-nav-section:nth-of-type(2) { margin-top: 4px; }
.at-section-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 6px 4px; font-size: 11px; color: var(--at-text-2); }
.at-nav-item {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 30px;
  padding: 0 8px; margin: 1px 0; border: none; border-radius: 6px;
  background: transparent; color: var(--at-text-2); cursor: pointer; text-align: left;
  box-shadow: inset 0 0 0 0 transparent;
}
.at-nav-item:hover { background: var(--at-surface-2); color: var(--at-text); }
.at-nav-item.active { background: var(--at-accent-soft); color: var(--at-text); box-shadow: inset 2px 0 0 var(--at-accent); }
.at-nav-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.at-nav-count { font-size: 10px; color: var(--at-text-2); font-variant-numeric: tabular-nums; }
.at-text-btn { border: none; background: transparent; color: var(--at-text-2); font-size: 11px; cursor: pointer; padding: 2px 4px; border-radius: 4px; }
.at-text-btn:hover { color: var(--at-text); background: var(--at-surface-2); }
.at-proj-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 8px; }
.at-project-item .at-nav-label { font-size: 12px; }
.at-nav-bottom { margin-top: auto; border-top: 1px solid var(--at-border); padding-top: 6px; }
.at-sidebar-foot { display: flex; align-items: center; gap: 5px; padding: 8px 12px 10px; font-size: 10px; color: var(--at-text-2); }
.at-kbd, .at-root kbd {
  border: 1px solid var(--at-border); border-bottom-color: var(--at-border-strong);
  border-radius: 4px; padding: 0 4px; font-size: 10px; line-height: 16px;
  background: var(--at-surface-2); color: var(--at-text-2);
}
.at-center { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; background: var(--at-bg); }
.at-list-wrap { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.at-list-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 16px 8px; }
.at-list-title { font-size: 15px; font-weight: 650; }
.at-list-sub { font-size: 11px; color: var(--at-text-2); margin-top: 2px; }
.at-list-tools { display: flex; gap: 2px; }
.at-inbox-strip { margin: 0 16px 6px; border: 1px solid var(--at-border); border-radius: 8px; background: var(--at-surface-2); overflow: hidden; }
.at-inbox-strip-head { display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 11px; color: var(--at-text-2); border-bottom: 1px solid var(--at-border); }
.at-inbox-strip-count { margin-left: auto; font-variant-numeric: tabular-nums; }
.at-inbox-strip-body { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 6px; padding: 8px; }
.at-list-body { flex: 1; min-height: 0; overflow-y: auto; padding: 2px 10px 10px; }
.at-task-row {
  display: grid; grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center; gap: 8px; min-height: 36px; padding: 3px 8px;
  border-radius: 6px; cursor: default; border: 1px solid transparent;
}
.at-task-row:hover { background: var(--at-surface-2); }
.at-task-row.selected { background: var(--at-surface-2); border-color: var(--at-border); box-shadow: inset 2px 0 0 var(--at-accent); }
.at-task-row.done .at-task-title { color: var(--at-text-2); text-decoration: line-through; }
.at-check {
  width: 16px; height: 16px; border: 1.5px solid var(--at-border-strong); border-radius: 4px;
  background: transparent; display: inline-flex; align-items: center; justify-content: center;
  color: #1C1C1E; cursor: pointer; padding: 0; flex: 0 0 16px;
}
.at-check:hover { border-color: var(--at-accent); }
.at-check.checked { background: var(--at-accent); border-color: var(--at-accent); }
.at-task-main { min-width: 0; }
.at-task-title { font-size: 12.5px; color: var(--at-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.at-task-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; font-size: 10.5px; color: var(--at-text-2); min-width: 0; }
.at-project-chip { display: inline-flex; align-items: center; gap: 4px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.at-project-chip.muted { color: var(--at-text-2); }
.at-meta-item { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
.at-task-right { display: flex; align-items: center; gap: 8px; }
.at-updated { font-size: 10px; color: var(--at-text-2); min-width: 30px; text-align: right; }
.at-urgency { width: 7px; height: 7px; border-radius: 50%; background: var(--at-border-strong); flex: 0 0 7px; }
.at-urgency.high { background: #E5484D; }
.at-urgency.medium { background: #E5A400; }
.at-urgency.low { background: #4C8BF5; }
.at-urgency.none { background: #9AA0AE; }
.at-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 30px; padding: 0 11px; border: 1px solid var(--at-border); border-radius: 6px;
  background: var(--at-surface); color: var(--at-text); font-size: 12px; cursor: pointer;
  white-space: nowrap;
}
.at-btn:hover { background: var(--at-surface-2); }
.at-btn.primary { background: var(--at-accent); border-color: transparent; color: #1C1C1E; font-weight: 650; }
.at-btn.primary:hover { filter: brightness(.96); }
.at-btn.danger { color: var(--at-danger); border-color: var(--at-danger); background: transparent; }
.at-btn.danger:hover { background: rgba(198, 59, 46, .08); }
.at-btn:disabled { opacity: .5; cursor: default; }
.at-inspector {
  width: 360px; flex: 0 0 360px; min-width: 0;
  border-left: 1px solid var(--at-border); background: var(--at-bg);
  padding: 14px; overflow-y: auto;
}
.at-inspector-head { display: flex; align-items: flex-start; gap: 8px; }
.at-inspector-title {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  font-size: 17px; font-weight: 650; line-height: 1.35; color: var(--at-text);
  padding: 1px 0;
}
.at-field { margin-top: 16px; }
.at-label { font-size: 10.5px; color: var(--at-text-2); letter-spacing: .02em; }
.at-label-row { display: flex; align-items: center; justify-content: space-between; }
.at-seg { display: flex; gap: 2px; padding: 2px; margin-top: 6px; border: 1px solid var(--at-border); border-radius: 7px; background: var(--at-surface-2); }
.at-seg button {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  height: 26px; border: none; border-radius: 5px; background: transparent;
  color: var(--at-text-2); font-size: 11px; cursor: pointer;
}
.at-seg button.active { background: var(--at-surface); color: var(--at-text); box-shadow: 0 0 0 1px var(--at-border); }
.at-select {
  width: 100%; height: 30px; margin-top: 6px; padding: 0 8px;
  border: 1px solid var(--at-border); border-radius: 6px; background: var(--at-surface); color: var(--at-text);
}
.at-project-hint { display: flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 11px; color: var(--at-text-2); }
.at-card { margin-top: 6px; border: 1px solid var(--at-border); border-radius: 8px; background: var(--at-surface-2); }
.at-mindmap-card { padding: 8px; }
.at-mindmap-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--at-text); }
.at-mindmap-card-head span { display: inline-flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.at-mindmap-svg { display: block; width: 100%; height: auto; margin-top: 4px; }
.at-empty-card {
  display: flex; align-items: center; gap: 7px; width: 100%; min-height: 40px;
  margin-top: 6px; padding: 8px 10px; border: 1px dashed var(--at-border-strong);
  border-radius: 8px; background: transparent; color: var(--at-text-2); font-size: 11px;
  cursor: pointer; text-align: left;
}
.at-empty-card:hover { color: var(--at-text); border-color: var(--at-accent); }
.at-capsule { border-left: 2px solid var(--at-accent); border-radius: 0 6px 6px 0; background: var(--at-surface-2); padding: 7px 9px; margin-top: 6px; }
.at-capsule p { margin: 0; font-size: 11.5px; line-height: 1.5; color: var(--at-text); }
.at-capsule-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 5px; font-size: 10px; color: var(--at-text-2); }
.at-capsule-meta button { border: none; background: transparent; color: var(--at-text-2); font-size: 10px; cursor: pointer; padding: 0; }
.at-capsule-meta button:hover { color: var(--at-text); }
.at-image-strip { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.at-image-tile { width: 48px; height: 48px; border: 1px solid var(--at-border); border-radius: 6px; background: var(--at-surface-2); display: inline-flex; align-items: center; justify-content: center; color: var(--at-text-2); }
.at-muted { font-size: 11px; color: var(--at-text-2); }
.at-meta-block { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--at-border); }
.at-meta-block div { display: flex; flex-direction: column; gap: 2px; }
.at-meta-block span { font-size: 10px; color: var(--at-text-2); }
.at-meta-block strong { font-size: 11px; font-weight: 550; }
.at-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--at-border); }
.at-capture {
  display: flex; align-items: center; gap: 7px; height: 52px; flex: 0 0 52px;
  padding: 0 12px; border-top: 1px solid var(--at-border); background: var(--at-bg);
}
.at-capture-mark { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: var(--at-accent-soft); color: var(--at-text); flex: 0 0 24px; }
.at-capture-input { flex: 1 1 auto; min-width: 0; border: none; outline: none; background: transparent; font-size: 13px; color: var(--at-text); }
.at-capture-input::placeholder { color: var(--at-text-2); }
.at-capture-target {
  display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 8px;
  border: 1px solid var(--at-border); border-radius: 6px; background: var(--at-surface);
  color: var(--at-text-2); font-size: 11px; cursor: pointer; white-space: nowrap;
}
.at-capture-target:hover { color: var(--at-text); }
.at-capture-hint { display: inline-flex; gap: 3px; margin-left: 2px; }
.at-board { display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 10px; padding: 14px 16px 18px; overflow-x: auto; flex: 1; min-height: 0; align-items: start; }
.at-board-col { min-width: 180px; border: 1px solid var(--at-border); border-radius: 8px; background: var(--at-surface-2); padding: 8px; }
.at-board-head { display: flex; align-items: center; gap: 6px; padding: 2px 3px 8px; font-size: 11px; color: var(--at-text-2); }
.at-board-count { margin-left: auto; font-variant-numeric: tabular-nums; }
.at-board-card { display: block; width: 100%; text-align: left; margin-bottom: 6px; padding: 8px; border: 1px solid var(--at-border); border-radius: 7px; background: var(--at-surface); cursor: pointer; }
.at-board-card:hover { border-color: var(--at-border-strong); }
.at-board-card.selected { border-color: var(--at-accent); box-shadow: inset 2px 0 0 var(--at-accent); }
.at-board-card-title { display: block; font-size: 12px; line-height: 1.4; color: var(--at-text); }
.at-board-card-meta { display: flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 10px; color: var(--at-text-2); }
.at-placeholder { padding: 18px; overflow-y: auto; flex: 1; min-height: 0; }
.at-placeholder-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.at-placeholder-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.at-placeholder-card { border: 1px solid var(--at-border); border-radius: 8px; padding: 12px; background: var(--at-surface); }
.at-placeholder-card-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 550; }
.at-placeholder-card-meta { margin-top: 5px; font-size: 11px; color: var(--at-text-2); }
.at-placeholder-card-bar { height: 4px; margin-top: 10px; border-radius: 2px; background: var(--at-surface-2); overflow: hidden; }
.at-placeholder-card-bar span { display: block; height: 100%; background: var(--at-accent); }
.at-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 54px 20px; color: var(--at-text-2); text-align: center; }
.at-empty p { margin: 0; font-size: 12px; }
.at-empty-inspector { padding-top: 80px; }
.at-link { border: none; background: transparent; color: var(--at-text); font-size: 12px; text-decoration: underline; cursor: pointer; }
.at-toast {
  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
  z-index: 1200; padding: 7px 13px; border-radius: 7px;
  background: #1C1C1E; color: #FFFFFF; font-size: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, .22); pointer-events: none;
}
.at-toast.danger { background: var(--at-danger); }
.at-overlay {
  position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: center;
  align-items: flex-start; padding: 12vh 16px 16px; background: rgba(0, 0, 0, .28);
  pointer-events: auto;
}
.at-overlay-panel {
  width: min(620px, calc(100vw - 32px)); border: 1px solid var(--at-border);
  border-radius: 12px; background: var(--at-overlay); color: var(--at-text);
  box-shadow: 0 24px 64px rgba(0, 0, 0, .24); padding: 14px;
}
.at-overlay-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.at-overlay-title { font-size: 14px; font-weight: 650; }
.at-overlay-sub { margin-top: 2px; font-size: 11px; color: var(--at-text-2); }
.at-overlay-textarea {
  width: 100%; min-height: 128px; max-height: 36vh; resize: vertical;
  margin-top: 12px; padding: 10px; border: 1px solid var(--at-border); border-radius: 8px;
  outline: none; background: var(--at-surface); color: var(--at-text);
  font-size: 14px; line-height: 1.55;
}
.at-overlay-textarea:focus { border-color: var(--at-accent); }
.at-overlay-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; }
.at-overlay-actions { display: flex; gap: 7px; }
.at-root :focus-visible, .at-overlay :focus-visible { outline: 2px solid var(--at-accent); outline-offset: 2px; }
.at-root ::-webkit-scrollbar, .at-overlay ::-webkit-scrollbar { width: 8px; height: 8px; }
.at-root ::-webkit-scrollbar-thumb, .at-overlay ::-webkit-scrollbar-thumb { background: var(--at-border-strong); border-radius: 4px; }
.at-root ::-webkit-scrollbar-track, .at-overlay ::-webkit-scrollbar-track { background: transparent; }
.at-focus .at-capture { border-top-color: transparent; }
@media (max-width: 980px) {
  .at-inspector { width: 300px; flex-basis: 300px; }
  .at-sidebar { width: 210px; flex-basis: 210px; }
}
@media (max-width: 760px) {
  .at-inspector { display: none; }
  .at-sidebar { width: 54px; flex-basis: 54px; }
  .at-sidebar .at-nav-label, .at-sidebar .at-nav-count, .at-sidebar .at-sidebar-name,
  .at-sidebar .at-section-head, .at-sidebar-foot { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .at-root *, .at-overlay * { transition: none !important; animation: none !important; }
}
`
