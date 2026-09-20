/* eslint-disable vitest/require-hook -- これはテストではなく単体のスクリプト */
// Runs with bun.
// ソースが変わったらビルドしてわんコメへ置く。plugin.js のメモリ保持は
// わんコメ側の話なので、本体の変更だけは無効→有効が要る。
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'

const APP = path.resolve(import.meta.dir, '..')
const REPO = path.resolve(APP, '../..')
const DEBOUNCE_MS = 300
const KEEP_ALIVE_MS = 24 * 60 * 60 * 1000
const state = { again: false, running: false, timer: 0 }

const run = () => {
  if (state.running) {
    state.again = true
    return
  }
  state.running = true
  const child = spawn('bun', ['run', 'build'], { cwd: APP, stdio: 'inherit' })
  child.on('exit', (code) => {
    state.running = false
    if (code !== 0) {
      console.error('[flow-comment] build failed')
    }
    if (state.again) {
      state.again = false
      run()
    }
  })
}

const queue = () => {
  clearTimeout(state.timer)
  state.timer = setTimeout(run, DEBOUNCE_MS)
}

const dirs = [
  path.resolve(APP, 'src'),
  path.resolve(APP, 'static'),
  path.resolve(APP, 'template'),
  path.resolve(REPO, 'packages/flow-comment-ui/src'),
  path.resolve(REPO, 'packages/flow-comment-core/src'),
]
for (const dir of dirs) {
  watch(dir, { recursive: true }, queue)
}
console.info('[flow-comment] watching; first build...')
run()
setInterval(() => {
  // Keep the process alive while fs.watch is registered.
}, KEEP_ALIVE_MS)
