/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// dist をわんコメのプラグイン / テンプレートへ置く。
// クエリを付けると 11180 が 404 を返すので、ファイルはそのままコピーする。
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const APP = path.join(import.meta.dir, '..')
const SUPPORT = path.join(homedir(), 'Library/Application Support/OneComme')
const PLUGIN_SRC = path.join(APP, 'dist/flow-comment-plugin')
const TEMPLATE_SRC = path.join(APP, 'dist/flow-comment-template')
const PLUGIN_DEST = path.join(SUPPORT, 'plugins/flow-comment')
const TEMPLATE_DEST = path.join(SUPPORT, 'templates/custom/flow-comment')

if (!existsSync(PLUGIN_SRC) || !existsSync(TEMPLATE_SRC)) {
  console.error('[flow-comment] dist missing; run bun run build first')
  process.exit(1)
}

mkdirSync(PLUGIN_DEST, { recursive: true })
mkdirSync(TEMPLATE_DEST, { recursive: true })
cpSync(PLUGIN_SRC, PLUGIN_DEST, { recursive: true })
cpSync(TEMPLATE_SRC, TEMPLATE_DEST, { recursive: true })
console.info(`[flow-comment] copied plugin -> ${PLUGIN_DEST}`)
console.info(`[flow-comment] copied template -> ${TEMPLATE_DEST}`)
