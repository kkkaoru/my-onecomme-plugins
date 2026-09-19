// Runs with bun.
// Storybook のストーリーをブラウザで実行し、play 関数の検証をテストとして走らせる。
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [storybookTest()],
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
    },
    name: 'storybook',
  },
})
