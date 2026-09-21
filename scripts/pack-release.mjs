/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// プラグイン zip は flow-comment/plugin.js。テンプレート zip は index.html が直下。
import { spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dir, '..')
const APP = path.join(ROOT, 'apps/flow-comment')
const PLUGIN_SRC = path.join(APP, 'dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(APP, 'dist/flow-comment-template')
const README_SRC = path.join(APP, 'release/README.md')
const STAGE = path.join(ROOT, 'dist/stage')
const PLUGIN_ZIP = path.join(ROOT, 'dist/plugin_flow-comment.zip')
const TEMPLATE_ZIP = path.join(ROOT, 'dist/template_flow-comment.zip')

const zipOf = (cwd, names, out) => {
  rmSync(out, { force: true })
  const zip = spawnSync('zip', ['-r', out, ...names], { cwd, stdio: 'inherit' })
  if (zip.status !== 0) {
    process.exit(zip.status ?? 1)
  }
}

const namesOf = (dir) =>
  readdirSync(dir).filter((name) => name !== '.DS_Store' && name !== 'measure.json')

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC) || !existsSync(README_SRC)) {
  console.error('[pack] dist or release README missing; run bun run build first')
  process.exit(1)
}

rmSync(STAGE, { recursive: true, force: true })
mkdirSync(path.join(STAGE, 'plugin/flow-comment'), { recursive: true })
copyFileSync(README_SRC, path.join(STAGE, 'plugin/README.md'))
cpSync(PLUGIN_SRC, path.join(STAGE, 'plugin/flow-comment'), { recursive: true })
rmSync(path.join(STAGE, 'plugin/flow-comment/measure.json'), { force: true })
zipOf(path.join(STAGE, 'plugin'), ['README.md', 'flow-comment'], PLUGIN_ZIP)
zipOf(TEMPLATE_SRC, namesOf(TEMPLATE_SRC), TEMPLATE_ZIP)
console.info(`[pack] wrote ${PLUGIN_ZIP}`)
console.info(`[pack] wrote ${TEMPLATE_ZIP}`)
