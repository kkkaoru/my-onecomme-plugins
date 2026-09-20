/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// Production 依存の license を読んで設定画面用の licenses.html を書く。
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const APP = path.join(import.meta.dir, '..')
const ROOT = path.join(APP, '../..')
const OUT = path.join(APP, 'dist/flow-comment-plugin/licenses.html')
const LICENSE_NAMES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'COPYING', 'license']

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const licenseText = (dir) => {
  const names = readdirSync(dir)
  const file = LICENSE_NAMES.find((name) => names.includes(name))
  return file === undefined ? '' : readFileSync(path.join(dir, file), 'utf8').trim()
}

const resolveDir = (name, fromDir) => {
  let dir = fromDir
  while (true) {
    const candidate = path.join(dir, 'node_modules', name)
    if (existsSync(path.join(candidate, 'package.json'))) {
      return realpathSync(candidate)
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      return ''
    }
    dir = parent
  }
}

const visit = (name, fromDir, seen, records) => {
  if (seen.has(name)) {
    return
  }
  seen.add(name)
  const dir = resolveDir(name, fromDir)
  if (dir === '') {
    return
  }
  const pkg = readJson(path.join(dir, 'package.json'))
  if (!name.startsWith('@my-onecomme-plugins/')) {
    records.set(name, {
      license: String(pkg.license ?? 'UNKNOWN'),
      name,
      text: licenseText(dir),
      version: String(pkg.version ?? ''),
    })
  }
  for (const dep of Object.keys(pkg.dependencies ?? {})) {
    visit(dep, dir, seen, records)
  }
}

const sectionOf = (entry) => {
  const body = entry.text === '' ? '' : `<pre>${escapeHtml(entry.text)}</pre>`
  return `<section><h2>${escapeHtml(entry.name)} ${escapeHtml(entry.version)}</h2><p>${escapeHtml(entry.license)}</p>${body}</section>`
}

const rootPkg = readJson(path.join(ROOT, 'package.json'))
const appPkg = readJson(path.join(APP, 'package.json'))
const seen = new Set()
const records = new Map()
const seeds = [
  ...Object.keys(appPkg.dependencies ?? {}),
  ...Object.keys(rootPkg.dependencies ?? {}),
  '@fontsource-variable/noto-sans-jp',
]
for (const name of seeds) {
  visit(name, ROOT, seen, records)
}

const entries = [...records.values()].toSorted((left, right) => left.name.localeCompare(right.name))
if (entries.length === 0) {
  console.error('[flow-comment] no licenses collected')
  process.exit(1)
}

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>利用ライブラリ</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main>
      <p><a href="./">Flow Comment</a></p>
      <h1>利用ライブラリ</h1>
      ${entries.map((entry) => sectionOf(entry)).join('\n')}
    </main>
  </body>
</html>
`

writeFileSync(OUT, html)
console.info(`[flow-comment] wrote ${entries.length} licenses to ${OUT}`)
