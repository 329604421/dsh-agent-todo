/**
 * Zero-dependency build for the Agent ToDo DSH client.
 *
 * The host module loader expects:
 *   window.__ModuleLoader__.load({ id, factory(require) { ... } })
 *
 * `src/client/*.js` are the source of truth. Each file is wrapped in an IIFE
 * that receives (AT, React, h); files publish their exports onto the shared
 * `AT` namespace. No esbuild / JSX runtime / second copy of React is needed,
 * which is why the old `build-client.mjs` (esbuild, writing a P0 sketch over
 * the shipping client) was retired into src/client/legacy/.
 *
 * Run:  node scripts/build-client.cjs
 */
'use strict'
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'src', 'client')
const outFile = path.join(root, 'client.js')

const files = fs.readdirSync(srcDir)
  .filter((name) => /^\d\d-[a-z0-9-]+\.js$/.test(name))
  .sort()
if (!files.length) throw new Error('no client source files in ' + srcDir)

const header = [
  '/* Agent ToDo · DSH client — GENERATED FILE. Do not edit by hand.',
  ' * Source: src/client/*.js   Build: node scripts/build-client.cjs',
  ' * Generated at ' + new Date().toISOString(),
  ' */',
  "window.__ModuleLoader__.load({",
  "  id: 'dsh-agent-todo',",
  '  factory(require) {',
  "    const React = require('react');",
  '    const h = React.createElement;',
  '    const AT = {};',
  "    if (typeof window !== 'undefined' && window.__AGENT_TODO_TEST__) window.__AGENT_TODO_CORE__ = AT;",
  '',
].join('\n')

const footer = [
  '',
  '    return AT.entry.createClient()',
  '  },',
  '})',
  '',
].join('\n')

/** Render the deterministic client bundle. Exported so verify-package.cjs
 * can prove that the checked-in client.js is exactly what these sources
 * produce (no hand edits, no stale artifact). Only the timestamp differs. */
function render() {
  const chunks = files.map((name) => {
    const raw = fs.readFileSync(path.join(srcDir, name), 'utf8')
    if (/^\s*(import|export)\s/m.test(raw)) {
      throw new Error(name + ': ESM syntax is not supported inside the loader factory')
    }
    const indented = raw.replace(/\r\n/g, '\n').split('\n')
      .map((line) => (line ? '      ' + line : ''))
      .join('\n')
    /* The leading `;` is mandatory: without it a chunk boundary is parsed as
     * `})(AT, React, h)(function ...)` — an implicit call of the previous
     * IIFE's result. node --check stays green; the module only crashes at
     * runtime when the DSH loader invokes the factory. */
    return [
      '    /* ===== ' + name + ' ===== */',
      '    ;(function (AT, React, h) {',
      indented,
      '    })(AT, React, h);',
      '',
    ].join('\n')
  })
  return header + chunks.join('\n') + footer
}

function normalize(source) {
  return source.replace(/^ \* Generated at .*$/m, ' * Generated at <timestamp>')
}

if (require.main === module) {
  const output = render()
  fs.writeFileSync(outFile, output, { encoding: 'utf8' })
  console.log(JSON.stringify({
    ok: true,
    sources: files,
    bytes: Buffer.byteLength(output),
    lines: output.split('\n').length,
  }, null, 2))
}

module.exports = { render, normalize, files, srcDir, outFile }
