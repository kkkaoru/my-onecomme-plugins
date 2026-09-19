// Runs with bun.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // 画面の組み立て（DOM 配線・要素の生成・イベント登録）はブラウザでしか意味を持たない
      // ため計測対象外にする。判定や変換のロジックは ui/ 直下・settings/・core に置き、
      // そこはテストで 95% 以上を保つ。新しい配線ファイルを足したらここに追加する。
      exclude: [
        '**/*.test.ts',
        '**/*.stories.ts',
        '**/src/plugin.ts',
        '**/src/*-main.ts',
        'apps/flow-comment/src/ui/elements.ts',
        'apps/flow-comment/src/ui/field-values.ts',
        'apps/flow-comment/src/ui/fonts.ts',
        'apps/flow-comment/src/ui/form-controls.ts',
        'apps/flow-comment/src/ui/form-fields.ts',
        'apps/flow-comment/src/ui/json-io.ts',
        'apps/flow-comment/src/ui/model-tools.ts',
        'apps/flow-comment/src/ui/panels.ts',
        'apps/flow-comment/src/ui/presets.ts',
        'apps/flow-comment/src/ui/preview.ts',
        'apps/flow-comment/src/ui/screen.ts',
      ],
      include: ['apps/*/src/**/*.ts', 'packages/*/src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    include: ['apps/*/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
  },
})
