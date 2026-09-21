/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// 1つの zip に README・プラグイン・テンプレートを入れる。
import { spawnSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dir, '..')
const APP = path.join(ROOT, 'apps/flow-comment')
const PLUGIN_SRC = path.join(APP, 'dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(APP, 'dist/flow-comment-template')
const README_SRC = path.join(APP, 'release/README.md')
const STAGE = path.join(ROOT, 'dist/stage')
const ZIP = path.join(ROOT, 'dist/flow-comment.zip')

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC) || !existsSync(README_SRC)) {
  console.error('[pack] dist or release README missing; run bun run build first')
  process.exit(1)
}

rmSync(STAGE, { recursive: true, force: true })
rmSync(ZIP, { force: true })
mkdirSync(path.join(STAGE, 'plugin'), { recursive: true })
mkdirSync(path.join(STAGE, 'template'), { recursive: true })
copyFileSync(README_SRC, path.join(STAGE, 'README.md'))
cpSync(PLUGIN_SRC, path.join(STAGE, 'plugin/flow-comment'), { recursive: true })
cpSync(TEMPLATE_SRC, path.join(STAGE, 'template/flow-comment'), { recursive: true })
rmSync(path.join(STAGE, 'plugin/flow-comment/measure.json'), { force: true })

const zip = spawnSync('zip', ['-r', ZIP, 'README.md', 'plugin', 'template'], {
  cwd: STAGE,
  stdio: 'inherit',
})
if (zip.status !== 0) {
  process.exit(zip.status ?? 1)
}
console.info(`[pack] wrote ${ZIP}`)
