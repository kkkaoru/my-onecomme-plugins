// Runs with bun.
import type { StorybookConfig } from '@storybook/html-vite'

const config: StorybookConfig = {
  addons: ['@storybook/addon-vitest'],
  framework: '@storybook/html-vite',
  stories: ['../packages/*/src/**/*.stories.ts', '../packages/*/src/**/*.stories.tsx'],
}

export default config
