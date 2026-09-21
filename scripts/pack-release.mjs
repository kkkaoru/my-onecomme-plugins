/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// わんコメの動作に必要なファイルだけを zip にする。
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.join(import.meta.dir, '..')
const PLUGIN_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(ROOT, 'apps/flow-comment/dist/flow-comment-template')
const STAGE = path.join(ROOT, 'dist/stage')
const ZIP = path.join(ROOT, 'dist/flow-comment.zip')
const PLUGIN_FILES = ['plugin.js', 'index.html', 'script.js', 'style.css']
const TEMPLATE_FILES = ['template.json', 'index.html', 'script.js', 'style.css', 'thumb.png']

const copyNamed = (srcDir, destDir, names) => {
  mkdirSync(destDir, { recursive: true })
  for (const name of names) {
    const from = path.join(srcDir, name)
    if (!existsSync(from)) {
      console.error(`[pack] missing ${from}`)
      process.exit(1)
    }
    copyFileSync(from, path.join(destDir, name))
  }
}

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC)) {
  console.error('[pack] dist missing; run bun run build first')
  process.exit(1)
}

rmSync(STAGE, { recursive: true, force: true })
rmSync(ZIP, { force: true })
copyNamed(PLUGIN_SRC, path.join(STAGE, 'plugins/flow-comment'), PLUGIN_FILES)
copyNamed(TEMPLATE_SRC, path.join(STAGE, 'templates/custom/flow-comment'), TEMPLATE_FILES)

const zip = spawnSync('zip', ['-r', ZIP, 'plugins', 'templates'], { cwd: STAGE, stdio: 'inherit' })
if (zip.status !== 0) {
  process.exit(zip.status ?? 1)
}
console.info(`[pack] wrote ${ZIP}`)
