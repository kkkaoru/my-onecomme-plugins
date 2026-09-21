/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// わんコメ公式の配布形: プラグインは plugins へ置くフォルダ1つ、テンプレートは一覧へ落とす zip。
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dir, '..')
const PLUGIN_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-template')
const STAGE = path.join(ROOT, 'dist/stage')
const PLUGIN_ZIP = path.join(ROOT, 'dist/flow-comment.zip')
const TEMPLATE_ZIP = path.join(ROOT, 'dist/flow-comment-template.zip')

const zipFolder = (dir, name, out) => {
  rmSync(out, { force: true })
  const zip = spawnSync('zip', ['-r', out, name], { cwd: dir, stdio: 'inherit' })
  if (zip.status !== 0) {
    process.exit(zip.status ?? 1)
  }
}

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC)) {
  console.error('[pack] dist missing; run bun run build first')
  process.exit(1)
}

rmSync(STAGE, { recursive: true, force: true })
mkdirSync(path.join(STAGE, 'plugin'), { recursive: true })
mkdirSync(path.join(STAGE, 'template'), { recursive: true })
cpSync(PLUGIN_SRC, path.join(STAGE, 'plugin/flow-comment'), { recursive: true })
cpSync(TEMPLATE_SRC, path.join(STAGE, 'template/flow-comment'), { recursive: true })
rmSync(path.join(STAGE, 'plugin/flow-comment/measure.json'), { force: true })
zipFolder(path.join(STAGE, 'plugin'), 'flow-comment', PLUGIN_ZIP)
zipFolder(path.join(STAGE, 'template'), 'flow-comment', TEMPLATE_ZIP)
console.info(`[pack] wrote ${PLUGIN_ZIP}`)
console.info(`[pack] wrote ${TEMPLATE_ZIP}`)
