// Runs with bun.
// React Compiler を有効にする Babel パス。コンパイラは他の変換より先に元の
// ソースを見る必要があるため、Vite 側の変換（JSX・TS の剥がし）とは別の
// プラグインとして渡す。リポジトリ内の Vite を使う全経路（アプリのビルド、
// vitest、Storybook）がこの 1 か所を通る。
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'

// React Compiler だけを載せる。JSX を別の経路で変換する場合に使う。
export const reactCompilerPlugin = (): PluginOption => babel({ presets: [reactCompilerPreset()] })

// JSX 変換と Fast Refresh に React Compiler を重ねた標準の一式。
export const reactPlugins = (): PluginOption[] => [react(), reactCompilerPlugin()]
