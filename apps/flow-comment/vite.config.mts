// Runs with bun.
// テンプレートと設定画面をそれぞれ単一の script.js に束ねる。
// OneComme は <script src="./script.js"> で読むので、出力は1ファイルにまとめる。
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

import { reactPlugins } from '../../vite.react.ts'

const TARGETS = {
  settings: {
    entry: 'src/ui-main.tsx',
    outDir: 'dist/flow-comment-plugin',
  },
  template: {
    entry: 'src/template-main.ts',
    outDir: 'dist/flow-comment-template',
  },
} as const

export default defineConfig(({ mode }): UserConfig => {
  const target = mode === 'template' ? TARGETS.template : TARGETS.settings
  return {
    build: {
      emptyOutDir: false,
      lib: {
        entry: target.entry,
        fileName: () => 'script.js',
        formats: ['iife'],
        name: 'FlowComment',
      },
      minify: 'esbuild',
      modulePreload: false,
      outDir: target.outDir,
      rollupOptions: {
        // react / react-dom は ESM の本番ビルドを使い、未使用部分を落とす。
        treeshake: { moduleSideEffects: false },
      },
      target: 'es2022',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    // テンプレート側は React を使わないが、React Compiler は対象外の
    // ファイルを素通しするので、両方の成果物で同じ一式を使う。
    plugins: reactPlugins(),
    resolve: {
      conditions: ['production', 'import', 'module', 'browser', 'default'],
    },
  }
})
