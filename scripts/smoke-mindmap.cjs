/**
 * Smoke test for the browser-wrapped original mindmap layout core.
 * Verifies all six formats produce rects and a links data URI without the
 * mini-program runtime.
 */
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'mindmap-core.js'), 'utf8')
const window = {}
const sandbox = { window, console, setTimeout, clearTimeout }
vm.createContext(sandbox)
vm.runInContext(source, sandbox, { filename: 'mindmap-core.js' })

const core = window.AgentTodoMindmapCore
assert.ok(core, 'window.AgentTodoMindmapCore missing')
assert.equal(typeof core.layoutOf, 'function')
assert.equal(typeof core.metricsMap, 'function')
assert.equal(typeof core.buildLinksUri, 'function')

const root = {
  id: 'n0',
  text: 'Root',
  level: 0,
  kind: 'root',
  children: [
    {
      id: 'n1',
      text: 'A',
      level: 1,
      kind: 'branch',
      children: [{ id: 'n11', text: 'A1', level: 2, kind: 'leaf', children: [] }],
    },
    { id: 'n2', text: 'B', level: 1, kind: 'leaf', children: [] },
  ],
}

for (const format of ['mindmap', 'logic', 'tree', 'org', 'timeline', 'fishbone']) {
  const metrics = core.metricsMap(root, true)
  const layout = core.layoutOf(root, true, format, metrics)
  assert.ok(layout && layout.n0 && layout.n1 && layout.n2, format + ' layout missing nodes')
  const links = core.buildLinksUri(root, true, layout, format)
  assert.ok(links && typeof links.uri === 'string' && links.uri.length > 0, format + ' links missing')
  console.log(format, Object.keys(layout).length, 'nodes', 'links', links.uri.length)
}
