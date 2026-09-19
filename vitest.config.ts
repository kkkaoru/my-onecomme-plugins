// Runs with bun.
// テストは本番と同じ React Compiler の出力で走らせる。
// カバレッジだけはコンパイラの memo ガードを外して測る（vitest.coverage.config.ts）。
import { defineConfig } from 'vitest/config'

import { reactPlugins } from './vite.react.ts'

export default defineConfig({
  plugins: reactPlugins(),
  resolve: {
    // テスト用の React ヘルパー（act で流し切る）は全テストで共有する。
    alias: { '@testing/react': new URL('testing/react.tsx', import.meta.url).pathname },
  },
  test: {
    coverage: {
      // 入口（*-main）とプラグイン本体はブラウザ／わんコメ側の起動コードなので、
      // それ以外の UI コンポーネントとロジックはすべてテストで 95% 以上を保つ。
      exclude: [
        '**/*.d.ts',
        '**/*.stories.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/src/*-main.ts',
        '**/src/*-main.tsx',
        '**/src/plugin.ts',
        'coverage/**',
      ],
      include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    include: ['apps/*/src/**/*.test.{ts,tsx}', 'packages/*/src/**/*.test.{ts,tsx}'],
    setupFiles: ['vitest.setup.ts'],
  },
})
