// Runs with bun.
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

import { reactCompilerPlugin } from '../vite.react.ts'

const config: StorybookConfig = {
  addons: ['@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  stories: [
    '../apps/*/src/**/*.stories.tsx',
    '../packages/*/src/**/*.stories.tsx',
    '../packages/*/src/**/*.stories.ts',
  ],
  // react-vite が JSX と HMR を持つので、ここでは React Compiler だけを足す。
  viteFinal: (viteConfig) => mergeConfig(viteConfig, { plugins: [reactCompilerPlugin()] }),
}

export default config
