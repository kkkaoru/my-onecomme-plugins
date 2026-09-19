// Runs with bun.
// カバレッジ計測用の設定。テストは同じものを走らせるが、React Compiler は通さない。
// コンパイラは値を props ごとに覚えるガードを足すので、分岐数が 221 → 694 に増える。
// その中には片側しか通らない形のものもあり、最適化の産物を「書いた判定」として
// 数えることになる。網羅の基準は、こちらが書いたコードに対して満たす。
import { defineConfig } from 'vitest/config'

import base from './vitest.config.ts'

export default defineConfig({
  ...base,
  plugins: [],
})
