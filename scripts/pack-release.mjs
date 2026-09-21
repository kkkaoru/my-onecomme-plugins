/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// プラグインとテンプレートのフォルダだけを zip にする。リポジトリは入れない。
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dir, '..')
const PLUGIN_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-template')
const STAGE = path.join(ROOT, 'dist/stage')
const ZIP = path.join(ROOT, 'dist/flow-comment.zip')

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC)) {
  console.error('[pack] dist missing; run bun run build first')
  process.exit(1)
}

rmSync(STAGE, { recursive: true, force: true })
rmSync(ZIP, { force: true })
const pluginDest = path.join(STAGE, 'flow-comment')
const templateDest = path.join(STAGE, 'flow-comment-template')
mkdirSync(pluginDest, { recursive: true })
mkdirSync(templateDest, { recursive: true })
cpSync(PLUGIN_SRC, pluginDest, { recursive: true })
cpSync(TEMPLATE_SRC, templateDest, { recursive: true })
rmSync(path.join(pluginDest, 'measure.json'), { force: true })

const zip = spawnSync('zip', ['-r', ZIP, 'flow-comment', 'flow-comment-template'], {
  cwd: STAGE,
  stdio: 'inherit',
})
if (zip.status !== 0) {
  process.exit(zip.status ?? 1)
}
console.info(`[pack] wrote ${ZIP}`)
