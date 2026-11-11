/**
 * Host half of the Agent ToDo bundle.
 *
 * P1a: a small same-origin proxy for the existing Agent ToDo backend plus a
 * token gate. The browser never talks to todo.memorymap.cn directly, so CORS
 * and the WeChat login flow stay out of the Client.
 *
 * Routes:
 *   GET  /agent-todo/state          pairing state
 *   POST /agent-todo/token          { token } -> validate against /sync, store
 *   POST /agent-todo/disconnect     clear the stored token
 *   GET  /agent-todo/api/sync       proxy to <apiBase>/sync
 *
 * The token is stored under ~/.dsh/agent-todo/auth.json (best effort 0600).
 * Device pairing (pair-code exchange) replaces the manual token in P1b.
 */
import { createReadStream, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['webServer', 'tools']

const DEFAULT_API_BASE = 'https://todo.memorymap.cn/api/v1'
const AUTH_DIR = join(homedir(), '.dsh', 'agent-todo')
const AUTH_FILE = join(AUTH_DIR, 'auth.json')
const PLUGIN_ROOT = fileURLToPath(new URL('.', import.meta.url))
const MAX_BODY = 1024 * 1024

function readAuth() {
  try {
    const raw = readFileSync(AUTH_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.token === 'string' && parsed.token) return parsed
  } catch {
    /* not connected yet */
  }
  return { token: '', user: null }
}

function writeAuth(value) {
  try {
    mkdirSync(AUTH_DIR, { recursive: true })
    writeFileSync(AUTH_FILE, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 })
  } catch (error) {
    console.warn('[agent-todo] could not persist auth file:', error && error.message ? error.message : error)
  }
}

function clearAuth() {
  writeAuth({ token: '', user: null })
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(body)
}

async function readBody(req) {
  let total = 0
  const chunks = []
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY) throw new Error('request body too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function readJsonBody(req) {
  const text = await readBody(req)
  if (!text) return {}
  return JSON.parse(text)
}

async function validateToken(apiBase, token) {
  try {
    const response = await fetch(apiBase.replace(/\/+$/, '') + '/sync', {
      headers: { authorization: 'Bearer ' + token, accept: 'application/json' },
    })
    const body = await response.json().catch(() => null)
    if (body && body.code === 0 && body.data) {
      return { ok: true, user: body.data.me || null }
    }
    return { ok: false, message: (body && body.message) || '令牌无效或后端不可达' }
  } catch (error) {
    return { ok: false, message: '后端不可达：' + (error && error.message ? error.message : String(error)) }
  }
}

const TOOL_ACTIONS = [
  'list_projects', 'list_todos', 'get_todo', 'create_todo', 'update_todo',
  'complete_todo', 'reopen_todo', 'delete_todo', 'restore_todo',
  'create_project', 'archive_project', 'unarchive_project',
  'list_capsules', 'create_capsule', 'promote_capsule',
  'list_mindmaps', 'get_mindmap', 'handoff',
]

const TOOL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    action: { type: 'string', enum: TOOL_ACTIONS, description: '要执行的操作' },
    todoId: { type: 'string', description: '待办 id' },
    projectId: { type: 'string', description: '项目 id；写入待办时必填其一' },
    projectName: { type: 'string', description: '项目名；没有 projectId 时按名称查找' },
    text: { type: 'string', description: '待办 / 胶囊正文' },
    urgency: { type: 'string', enum: ['urgent', 'mid', 'low', 'hold'], description: '紧急度（后端取值）' },
    status: { type: 'string', enum: ['open', 'done'], description: '按状态筛选' },
    query: { type: 'string', description: '按正文关键词筛选' },
    limit: { type: 'integer', minimum: 1, maximum: 100, description: '返回条数上限' },
    name: { type: 'string', description: '项目名' },
    color: { type: 'string', description: '项目 8 色槽位 key' },
    mindmapId: { type: 'string', description: '脑图 id' },
    capsuleId: { type: 'string', description: '单条胶囊 id' },
    capsuleIds: { type: 'array', items: { type: 'string' }, description: '多条胶囊 id' },
  },
  required: ['action'],
}

function clampLimit(value, fallback, max) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(Math.floor(n), max)
}

async function backendCall(apiBase, token, method, path, body) {
  const headers = { authorization: 'Bearer ' + token, accept: 'application/json' }
  const init = { method, headers }
  if (body !== undefined) {
    headers['content-type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  const response = await fetch(apiBase + path, init)
  const data = await response.json().catch(() => null)
  if (!data) throw new Error('后端返回异常')
  if (data.code === 1001) {
    const error = new Error(data.message || '登录已失效，请重新连接')
    error.code = 1001
    throw error
  }
  if (data.code !== 0) throw new Error(data.message || '请求失败')
  return data.data
}

function todoView(snapshot, todo) {
  const mindmap = (snapshot.mindmaps || []).find((item) => item.id === todo.mindmapId)
  const project = (snapshot.projects || []).find((item) => item.id === todo.projectId)
  return {
    id: todo.id,
    text: todo.text,
    status: todo.status,
    urgency: todo.urgency,
    projectId: todo.projectId || null,
    projectName: project ? project.name : '',
    mindmapId: todo.mindmapId || null,
    mindmapName: mindmap ? mindmap.name : '',
    capsules: (snapshot.capsules || []).filter((capsule) => capsule.todoId === todo.id && !capsule.deletedAt).length,
    images: (todo.images || []).length,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }
}

function resolveProjectId(snapshot, input) {
  if (input.projectId) return String(input.projectId)
  if (input.projectName) {
    const match = (snapshot.projects || []).find((project) => project.name === input.projectName && !project.archivedAt)
    if (match) return match.id
  }
  return ''
}

function registerAgentTool(ctx, apiBase, getAuth, resetAuth) {
  return ctx.tools.register({
    name: 'agent_todo',
    description:
      'Agent ToDo 工作台。用于查询或修改用户的项目、待办、闪念胶囊与脑图，并生成交给 Agent 的 Handoff 文本。写操作会直接修改用户数据；优先先 list_projects / list_todos 获取真实 id，不要编造 id。',
    parameters: TOOL_SCHEMA,
    output: {
      schema: { type: 'object', additionalProperties: true },
      render(_args, value) {
        if (typeof value === 'string') return [{ type: 'text', text: value }]
        if (value && typeof value.text === 'string' && Object.keys(value).length === 1) {
          return [{ type: 'text', text: value.text }]
        }
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
      },
    },
    async execute(args) {
      const input = args && typeof args === 'object' ? args : {}
      const action = String(input.action || '')
      const auth = getAuth()
      if (!auth.token) throw new Error('Agent ToDo 尚未连接账号，请先在小程序生成令牌并在插件顶栏连接')
      try {
        if (action === 'list_projects') {
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          return {
            projects: (snapshot.projects || []).map((project) => ({
              id: project.id,
              name: project.name,
              color: project.color || null,
              node: project.node,
              archived: !!project.archivedAt,
            })),
          }
        }

        if (action === 'list_todos') {
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          let list = (snapshot.todos || []).filter((todo) => !todo.deletedAt)
          if (input.projectId) list = list.filter((todo) => todo.projectId === input.projectId)
          if (input.status) list = list.filter((todo) => todo.status === input.status)
          if (input.query) list = list.filter((todo) => String(todo.text || '').includes(input.query))
          list = list.slice(0, clampLimit(input.limit, 20, 100))
          return { count: list.length, todos: list.map((todo) => todoView(snapshot, todo)) }
        }

        if (action === 'get_todo') {
          if (!input.todoId) throw new Error('缺少 todoId')
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const todo = (snapshot.todos || []).find((item) => item.id === input.todoId && !item.deletedAt)
          if (!todo) throw new Error('待办不存在')
          return { todo: todoView(snapshot, todo) }
        }

        if (action === 'create_todo') {
          if (!input.text || !String(input.text).trim()) throw new Error('缺少待办正文')
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const projectId = resolveProjectId(snapshot, input)
          if (!projectId) throw new Error('必须提供 projectId 或 projectName；可先调用 list_projects')
          const todo = await backendCall(apiBase, auth.token, 'POST', '/todos', {
            text: String(input.text).trim(),
            projectId,
            urgency: input.urgency || 'hold',
          })
          return { todo: todoView(await backendCall(apiBase, auth.token, 'GET', '/sync'), todo) }
        }

        if (action === 'update_todo') {
          if (!input.todoId) throw new Error('缺少 todoId')
          const patch = {}
          if (input.text !== undefined) patch.text = input.text
          if (input.urgency !== undefined) patch.urgency = input.urgency
          if (input.projectId !== undefined) patch.projectId = input.projectId
          if (input.mindmapId !== undefined) patch.mindmapId = input.mindmapId || null
          if (!Object.keys(patch).length) throw new Error('没有要修改的字段')
          const todo = await backendCall(apiBase, auth.token, 'PATCH', '/todos/' + encodeURIComponent(input.todoId), patch)
          return { todo: todoView(await backendCall(apiBase, auth.token, 'GET', '/sync'), todo) }
        }

        if (action === 'complete_todo' || action === 'reopen_todo' || action === 'delete_todo' || action === 'restore_todo') {
          if (!input.todoId) throw new Error('缺少 todoId')
          const suffix = {
            complete_todo: 'complete',
            reopen_todo: 'reopen',
            delete_todo: '',
            restore_todo: 'restore',
          }[action]
          const method = action === 'delete_todo' ? 'DELETE' : 'POST'
          const path = '/todos/' + encodeURIComponent(input.todoId) + (suffix ? '/' + suffix : '')
          await backendCall(apiBase, auth.token, method, path)
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const todo = (snapshot.todos || []).find((item) => item.id === input.todoId)
          return { ok: true, todo: todo ? todoView(snapshot, todo) : null }
        }

        if (action === 'create_project') {
          if (!input.name || !String(input.name).trim()) throw new Error('缺少项目名')
          const project = await backendCall(apiBase, auth.token, 'POST', '/projects', {
            name: String(input.name).trim(),
            color: input.color || null,
          })
          return { project }
        }

        if (action === 'archive_project' || action === 'unarchive_project') {
          if (!input.projectId) throw new Error('缺少 projectId')
          await backendCall(
            apiBase,
            auth.token,
            'POST',
            '/projects/' + encodeURIComponent(input.projectId) + (action === 'archive_project' ? '/archive' : '/unarchive'),
          )
          return { ok: true }
        }

        if (action === 'list_capsules') {
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const list = (snapshot.capsules || [])
            .filter((capsule) => !capsule.deletedAt && !capsule.consumedAt)
            .slice(0, clampLimit(input.limit, 30, 100))
            .map((capsule) => ({
              id: capsule.id,
              text: capsule.text,
              createdAt: capsule.createdAt,
              source: capsule.source,
              imageUri: capsule.imageUri || null,
            }))
          return { count: list.length, capsules: list }
        }

        if (action === 'create_capsule') {
          if (!input.text || !String(input.text).trim()) throw new Error('缺少胶囊正文')
          const capsule = await backendCall(apiBase, auth.token, 'POST', '/capsules', {
            text: String(input.text).trim(),
            source: 'text',
          })
          return { capsule }
        }

        if (action === 'promote_capsule') {
          if (!input.capsuleId) throw new Error('缺少 capsuleId')
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const projectId = resolveProjectId(snapshot, input)
          if (!projectId) throw new Error('必须提供 projectId 或 projectName')
          const capsule = (snapshot.capsules || []).find((item) => item.id === input.capsuleId)
          const todo = await backendCall(
            apiBase,
            auth.token,
            'POST',
            '/capsules/' + encodeURIComponent(input.capsuleId) + '/promote-to-todo',
            { projectId, urgency: input.urgency || 'hold', text: input.text || (capsule ? capsule.text : undefined) },
          )
          return { todo: todoView(await backendCall(apiBase, auth.token, 'GET', '/sync'), todo) }
        }

        if (action === 'list_mindmaps') {
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          return {
            mindmaps: (snapshot.mindmaps || []).map((mindmap) => ({
              id: mindmap.id,
              name: mindmap.name,
              projectId: mindmap.projectId,
              format: mindmap.format,
              nodeCount: mindmap.nodeCount,
              updatedAt: mindmap.updatedAt,
            })),
          }
        }

        if (action === 'get_mindmap') {
          if (!input.mindmapId) throw new Error('缺少 mindmapId')
          const tree = await backendCall(apiBase, auth.token, 'GET', '/mindmaps/' + encodeURIComponent(input.mindmapId) + '/tree')
          return { mindmap: tree }
        }

        if (action === 'handoff') {
          if (!input.todoId) throw new Error('缺少 todoId')
          const snapshot = await backendCall(apiBase, auth.token, 'GET', '/sync')
          const todo = (snapshot.todos || []).find((item) => item.id === input.todoId && !item.deletedAt)
          if (!todo) throw new Error('待办不存在')
          const project = (snapshot.projects || []).find((item) => item.id === todo.projectId)
          const mindmap = (snapshot.mindmaps || []).find((item) => item.id === todo.mindmapId)
          const capsules = (snapshot.capsules || []).filter((capsule) => capsule.todoId === todo.id && !capsule.deletedAt)
          const urgency = { urgent: '紧急', mid: '中等', low: '不紧急', hold: '留置' }[todo.urgency] || '留置'
          const lines = ['## 任务', todo.text, '', `- 项目：${project ? project.name : 'Inbox'}`, `- 紧急度：${urgency}`, `- 状态：${todo.status === 'done' ? '已完成' : '进行中'}`, '']
          if (capsules.length) {
            lines.push('## 闪念胶囊')
            capsules.forEach((capsule) => lines.push('- ' + capsule.text))
            lines.push('')
          }
          lines.push('## 脑图' + (mindmap ? '：' + mindmap.name : ''))
          if (mindmap) lines.push('- 脑图树可通过 get_mindmap 读取；导出时由客户端拼装 Markdown。')
          else lines.push('（未关联脑图）')
          return { text: lines.join('\n') }
        }

        throw new Error('未知 action：' + action)
      } catch (error) {
        if (error && error.code === 1001) resetAuth()
        throw error
      }
    },
  })
}

function installProxy(ctx, config) {  const apiBase = String((config && config.apiBase) || DEFAULT_API_BASE).replace(/\/+$/, '')
  let auth = readAuth()

  const state = () => ({
    ok: true,
    paired: !!auth.token,
    user: auth.user || null,
    apiBase,
    mode: auth.token ? 'connected' : 'demo',
  })

  const routes = []

  routes.push(ctx.webServer.register({
    kind: 'exact',
    path: '/agent-todo/state',
    handler: (_req, res) => sendJson(res, 200, state()),
  }))

  routes.push(ctx.webServer.register({
    kind: 'exact',
    path: '/agent-todo/token',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'POST only' })
      try {
        const body = await readJsonBody(req)
        const token = String((body && body.token) || '').trim()
        if (!token) return sendJson(res, 400, { ok: false, message: '缺少 token' })
        const checked = await validateToken(apiBase, token)
        if (!checked.ok) return sendJson(res, 401, { ok: false, message: checked.message })
        auth = { token, user: checked.user }
        writeAuth(auth)
        return sendJson(res, 200, state())
      } catch (error) {
        return sendJson(res, 400, { ok: false, message: error && error.message ? error.message : '请求格式错误' })
      }
    },
  }))

  routes.push(ctx.webServer.register({
    kind: 'exact',
    path: '/agent-todo/pair',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'POST only' })
      try {
        const body = await readJsonBody(req)
        const code = String((body && body.code) || '').trim()
        if (!/^\d{6}$/.test(code)) return sendJson(res, 400, { ok: false, message: '请输入 6 位登录验证码' })
        const response = await fetch(apiBase + '/auth/device/pair', {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ code, deviceName: 'DSH Web' }),
        })
        const data = await response.json().catch(() => null)
        if (!data || data.code !== 0 || !data.data || !data.data.token) {
          return sendJson(res, 401, { ok: false, message: (data && data.message) || '登录失败，请重新生成验证码' })
        }
        auth = { token: data.data.token, user: data.data.user || null }
        writeAuth(auth)
        return sendJson(res, 200, state())
      } catch (error) {
        return sendJson(res, 502, { ok: false, message: '后端不可达：' + (error && error.message ? error.message : String(error)) })
      }
    },
  }))

  routes.push(ctx.webServer.register({
    kind: 'exact',
    path: '/agent-todo/disconnect',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { ok: false, message: 'POST only' })
      auth = { token: '', user: null }
      clearAuth()
      return sendJson(res, 200, state())
    },
  }))

  routes.push(ctx.webServer.register({
    kind: 'prefix',
    path: '/agent-todo/api',
    handler: async (req, res) => {
      if (!auth.token) return sendJson(res, 401, { code: 1001, message: '插件尚未连接 Agent ToDo 账号' })
      try {
        const parsed = new URL(req.url || '/', 'http://localhost')
        const suffix = parsed.pathname.slice('/agent-todo/api'.length) || '/'
        const target = apiBase + suffix + parsed.search
        const method = String(req.method || 'GET').toUpperCase()
        const headers = {
          authorization: 'Bearer ' + auth.token,
          accept: 'application/json',
        }
        const contentType = req.headers['content-type']
        if (contentType) headers['content-type'] = String(contentType)
        let body
        if (method !== 'GET' && method !== 'HEAD') {
          const chunks = []
          let total = 0
          for await (const chunk of req) {
            total += chunk.length
            /* ★ v1.8 · 8MB：胶囊语音是 16k/16bit 单声道 WAV，60s ≈ 1.92MB，
             * 原来的 2MB 会在 60s 满时长时把整段音频顶掉（multipart 还有头开销）。 */
            if (total > 8 * 1024 * 1024) throw new Error('请求体过大')
            chunks.push(chunk)
          }
          body = Buffer.concat(chunks)
        }
        const response = await fetch(target, { method, headers, body })
        const text = await response.text()
        let parsedBody = null
        try { parsedBody = JSON.parse(text) } catch { /* non-json */ }
        if (parsedBody && parsedBody.code === 1001) {
          auth = { token: '', user: null }
          clearAuth()
        }
        res.statusCode = response.status
        res.setHeader('content-type', response.headers.get('content-type') || 'application/json; charset=utf-8')
        res.setHeader('cache-control', 'no-store')
        res.end(text)
      } catch (error) {
        sendJson(res, 502, { code: 5000, message: '后端不可达：' + (error && error.message ? error.message : String(error)) })
      }
    },
  }))

  routes.push(ctx.webServer.register({
    kind: 'prefix',
    path: '/agent-todo/assets',
    handler: (req, res) => {
      if (String(req.method || 'GET').toUpperCase() !== 'GET') return sendJson(res, 405, { ok: false, message: 'GET only' })
      const parsed = new URL(req.url || '/', 'http://localhost')
      const rel = decodeURIComponent(parsed.pathname.slice('/agent-todo/assets'.length)).replace(/^\/+/, '')
      if (!rel) return sendJson(res, 404, { ok: false, message: 'not found' })
      const assetRoot = join(PLUGIN_ROOT, 'assets')
      const target = normalize(join(assetRoot, rel))
      const prefix = assetRoot.endsWith(sep) ? assetRoot : assetRoot + sep
      if (target !== assetRoot && !target.startsWith(prefix)) {
        return sendJson(res, 403, { ok: false, message: 'forbidden' })
      }
      let info
      try { info = statSync(target) } catch { return sendJson(res, 404, { ok: false, message: 'not found' }) }
      if (!info.isFile()) return sendJson(res, 404, { ok: false, message: 'not found' })
      const mime = {
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
      }[extname(target).toLowerCase()] || 'application/octet-stream'
      res.statusCode = 200
      res.setHeader('content-type', mime)
      res.setHeader('cache-control', 'no-cache')
      createReadStream(target).pipe(res)
    },
  }))

  const toolDispose = !config || config.enableAgentTools !== false
    ? registerAgentTool(ctx, apiBase, () => auth, () => {
      auth = { token: '', user: null }
      clearAuth()
    })
    : null

  return () => {
    if (toolDispose) {
      try { toolDispose() } catch { /* already gone */ }
    }
    routes.forEach((dispose) => {
      try { dispose() } catch { /* already gone */ }
    })
  }
}

export function apply(ctx, config = {}) {
  ctx.effect(() => installProxy(ctx, config), 'agent-todo: backend proxy')
}
